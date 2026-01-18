// JWT Utility functions for decoding tokens without external dependencies

export interface JWTPayload {
  sub: string; // subject (user ID)
  email: string;
  roles: string | string[]; // Can be string or array
  iat?: number; // issued at
  exp?: number; // expiration
  iss?: string; // issuer
  aud?: string; // audience
  [key: string]: any;
}

/**
 * Decode JWT token without verification (client-side only)
 * Note: This is for extracting user info from a trusted token
 * For security critical operations, always verify on the backend
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    // JWT tokens have 3 parts separated by dots: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    // Decode the payload (second part)
    const payload = parts[1];
    
    // Base64 URL decode
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Extract user information from JWT token
 */
export function extractUserInfoFromToken(token: string): {
  id: string;
  email: string;
  roles: string[];
} | null {
  const decoded = decodeJWT(token);
  
  if (!decoded) {
    return null;
  }

  // Handle roles as both string and array
  let roles: string[] = [];
  if (decoded.roles) {
    if (typeof decoded.roles === 'string') {
      // Split comma-separated roles string
      roles = decoded.roles.split(',').map(role => role.trim());
    } else if (Array.isArray(decoded.roles)) {
      roles = decoded.roles;
    }
  }

  return {
    id: decoded.sub || '',
    email: decoded.email || '',
    roles: roles
  };
}

/**
 * Check if JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  
  if (!decoded || !decoded.exp) {
    return true; // Assume expired if we can't verify
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}

/**
 * Get time until token expires (in seconds)
 */
export function getTimeUntilExpiration(token: string): number {
  const decoded = decodeJWT(token);
  
  if (!decoded || !decoded.exp) {
    return 0;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return Math.max(0, decoded.exp - currentTime);
}
