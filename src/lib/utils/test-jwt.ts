// Test script to verify JWT token extraction
// This can be run in the browser console to test the functionality

import { authService } from '@/services/authService';

// Test function to verify JWT token extraction
export function testJWTExtraction() {
  console.log('Testing JWT token extraction...');
  
  // Get current access token
  const token = authService.getAccessToken();
  
  if (!token) {
    console.log('No access token found. Please login first.');
    return;
  }
  
  console.log('Token found:', token.substring(0, 50) + '...');
  
  // Extract user info from token
  const userInfo = authService.extractUserInfoFromToken();
  
  if (userInfo) {
    console.log('Successfully extracted user info from token:', {
      id: userInfo.id,
      email: userInfo.email,
      roles: userInfo.roles,
      provider: userInfo.provider
    });
    
    // Test the fallback method
    const fallbackInfo = authService.getUserInfoWithFallback();
    console.log('Fallback method result:', fallbackInfo ? 'Success' : 'Failed');
    
  } else {
    console.log('Failed to extract user info from token');
  }
  
  // Test authentication status
  console.log('Is authenticated:', authService.isAuthenticated());
}

// Export for manual testing
if (typeof window !== 'undefined') {
  (window as any).testJWTExtraction = testJWTExtraction;
  console.log('testJWTExtraction() function available in window object');
}
