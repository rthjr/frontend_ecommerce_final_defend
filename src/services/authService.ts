import { userApiClient } from '@/lib/api';
import {
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  JwtResponse,
  UserInfo,
  OAuth2Providers,
  SessionResponse,
  TerminateSessionResponse,
  TerminateAllSessionsResponse
} from '@/lib/types/auth';
import { extractUserInfoFromToken, isTokenExpired } from '@/lib/utils/jwt';

class AuthService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user_info';
  private readonly SESSION_TOKEN_KEY = 'sessionToken';

  // Store tokens in localStorage
  setTokens(accessToken: string, refreshToken?: string, sessionToken?: string) {
    if (accessToken) {
      localStorage.setItem(this.TOKEN_KEY, accessToken);
    }
    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
    if (sessionToken) {
      localStorage.setItem(this.SESSION_TOKEN_KEY, sessionToken);
    }
  }

  // Get tokens from localStorage
  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  getSessionToken(): string | null {
    return localStorage.getItem(this.SESSION_TOKEN_KEY);
  }

  // Store user info
  setUserInfo(userInfo: UserInfo) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(userInfo));
  }

  // Get user info
  getUserInfo(): UserInfo | null {
    const userInfo = localStorage.getItem(this.USER_KEY);
    return userInfo ? JSON.parse(userInfo) : null;
  }

  // Clear all auth data
  clearAuthData() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.SESSION_TOKEN_KEY);
  }

  // Extract user information from JWT token
  extractUserInfoFromToken(): UserInfo | null {
    const token = this.getAccessToken();
    if (!token) {
      return null;
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      console.warn('Token is expired, cannot extract user info');
      return null;
    }

    const extracted = extractUserInfoFromToken(token);
    if (!extracted) {
      return null;
    }

    // Create UserInfo object from extracted data
    return {
      id: extracted.id,
      email: extracted.email,
      name: '', // Name not typically in JWT, will be filled from API
      roles: extracted.roles,
      enabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      provider: 'local' // Default to local for JWT tokens
    };
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return !!token && !isTokenExpired(token);
  }

  // Check if user is OAuth2 authenticated
  isOAuth2Authenticated(): boolean {
    const userInfo = this.getUserInfo();
    return userInfo ? userInfo.provider !== 'local' : false;
  }

  // Register new user
  async register(userData: RegisterRequest) {
    const response = await userApiClient.post<JwtResponse>('/api/auth/register', userData);
    if (response.error) {
      return { data: null, error: response.error, status: response.status };
    }
    if (response.data) {
      this.setTokens(response.data.accessToken, response.data.refreshToken);
      if (response.data.userInfo) {
        this.setUserInfo(response.data.userInfo);
      }
    }
    return { data: response.data || null, error: null, status: response.status };
  }

  // Login user
  async login(credentials: LoginRequest) {
    const response = await userApiClient.post<JwtResponse>('/api/auth/login', credentials);
    if (response.error) {
      return { data: null, error: response.error, status: response.status };
    }
    if (response.data) {
      this.setTokens(response.data.accessToken, response.data.refreshToken, response.data.sessionToken);
      if (response.data.userInfo) {
        this.setUserInfo(response.data.userInfo);
      }
    }
    return { data: response.data || null, error: null, status: response.status };
  }

  // Refresh access token
  async refreshAccessToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await userApiClient.post<JwtResponse>('/api/auth/refresh', {
      refreshToken
    } as RefreshTokenRequest);
    if (response.error) {
      this.clearAuthData();
      return { data: null, error: response.error, status: response.status };
    }
    if (response.data) {
      this.setTokens(response.data.accessToken);
      if (response.data.userInfo) {
        this.setUserInfo(response.data.userInfo);
      }
    }
    return { data: response.data || null, error: null, status: response.status };
  }

  // Get user info with token extraction fallback
  getUserInfoWithFallback(): UserInfo | null {
    let userInfo = this.getUserInfo();
    
    // If no user info in localStorage, try to extract from token
    if (!userInfo) {
      userInfo = this.extractUserInfoFromToken();
      if (userInfo) {
        this.setUserInfo(userInfo);
      }
    }
    
    return userInfo;
  }

  // Get current user
  async getCurrentUser() {
    const authClient = userApiClient.withAuthToken();
    const response = await authClient.get<UserInfo>('/api/auth/me');
    if (response.error) {
      return { data: null, error: response.error, status: response.status };
    }
    if (response.data) {
      this.setUserInfo(response.data);
    }
    return { data: response.data || null, error: null, status: response.status };
  }

  // Logout user (handles both JWT and OAuth2)
  async logout() {
    try {
      // Try JWT logout first with Authorization header
      const authClient = userApiClient.withAuthToken();
      await authClient.post('/api/auth/logout');
    } catch (error) {
      console.error('JWT logout API call failed:', error);
    }
    
    try {
      // Try OAuth2 logout as well (in case user is OAuth2 authenticated)
      await userApiClient.post('/api/oauth2/logout');
    } catch (error) {
      console.error('OAuth2 logout API call failed:', error);
    } finally {
      // Always clear auth data regardless of API call success
      this.clearAuthData();
    }
  }

  // Get OAuth2 providers
  async getOAuth2Providers() {
    const response = await userApiClient.get<OAuth2Providers>('/api/oauth2/providers');
    if (response.error) {
      return { data: null, error: response.error, status: response.status };
    }
    return { data: response.data || null, error: null, status: response.status };
  }

  // Get OAuth2 user info
  async getOAuth2UserInfo() {
    const response = await userApiClient.get<any>('/api/oauth2/user');
    if (response.error) {
      return { data: null, error: response.error, status: response.status };
    }
    return { data: response.data || null, error: null, status: response.status };
  }

  // OAuth2 logout
  async oauth2Logout() {
    try {
      await userApiClient.post('/api/oauth2/logout');
    } catch (error) {
      console.error('OAuth2 logout failed:', error);
    } finally {
      this.clearAuthData();
    }
  }

  // Forgot password - request password reset email
  async forgotPassword(email: string) {
    const response = await userApiClient.post<{ message: string; success: boolean }>(
      '/api/auth/forgot-password',
      { email }
    );
    if (response.error) {
      return { data: null, error: response.error, status: response.status };
    }
    return { data: response.data || null, error: null, status: response.status };
  }

  // Verify 6-digit reset code
  async verifyResetCode(email: string, resetCode: string) {
    const response = await userApiClient.post<{ valid: boolean; message: string }>(
      '/api/auth/verify-reset-code',
      { email, resetCode }
    );
    if (response.error) {
      return { data: null, error: response.error, status: response.status };
    }
    return { data: response.data || null, error: null, status: response.status };
  }

  // Reset password with code
  async resetPassword(email: string, resetCode: string, newPassword: string) {
    const response = await userApiClient.post<{ message: string; success: boolean }>(
      '/api/auth/reset-password',
      { email, resetCode, newPassword }
    );
    if (response.error) {
      return { data: null, error: response.error, status: response.status };
    }
    return { data: response.data || null, error: null, status: response.status };
  }

  // ===== SESSION MANAGEMENT =====

  // Helper to create headers with session token
  private getSessionHeaders(): Record<string, string> {
    const sessionToken = this.getSessionToken();
    const accessToken = this.getAccessToken();

    if (!sessionToken) {
      throw new Error('No session token available');
    }

    return {
      'X-Session-Token': sessionToken,
      'Authorization': `Bearer ${accessToken}`,
    };
  }

  // Get active sessions
  async getActiveSessions() {
    try {
      const headers = this.getSessionHeaders();
      const response = await userApiClient.get<SessionResponse[]>(
        '/api/auth/sessions',
        headers
      );
      if (response.error) {
        return { data: null, error: response.error, status: response.status };
      }
      return { data: response.data || null, error: null, status: response.status };
    } catch (error: any) {
      return { data: null, error: error.message, status: 0 };
    }
  }

  // Get login history
  async getLoginHistory() {
    try {
      const headers = this.getSessionHeaders();
      const response = await userApiClient.get<SessionResponse[]>(
        '/api/auth/sessions/history',
        headers
      );
      if (response.error) {
        return { data: null, error: response.error, status: response.status };
      }
      return { data: response.data || null, error: null, status: response.status };
    } catch (error: any) {
      return { data: null, error: error.message, status: 0 };
    }
  }

  // Terminate specific session
  async terminateSession(sessionId: string) {
    try {
      const sessionToken = this.getSessionToken();
      const headers = {
        'X-Session-Token': sessionToken || '',
      };

      const response = await userApiClient.delete<TerminateSessionResponse>(
        `/api/auth/sessions/${sessionId}`,
        undefined,
        headers
      );
      if (response.error) {
        return { data: null, error: response.error, status: response.status };
      }
      return { data: response.data || null, error: null, status: response.status };
    } catch (error: any) {
      return { data: null, error: error.message, status: 0 };
    }
  }

  // Terminate all other sessions (keep current)
  async terminateAllOtherSessions() {
    try {
      const headers = this.getSessionHeaders();
      const response = await userApiClient.delete<TerminateAllSessionsResponse>(
        '/api/auth/sessions',
        undefined,
        headers
      );
      if (response.error) {
        return { data: null, error: response.error, status: response.status };
      }
      return { data: response.data || null, error: null, status: response.status };
    } catch (error: any) {
      return { data: null, error: error.message, status: 0 };
    }
  }
}

export const authService = new AuthService();
