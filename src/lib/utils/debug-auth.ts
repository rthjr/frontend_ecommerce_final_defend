// Debug script to check authentication and roles
// Run this in browser console to debug access issues

import { authService } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';

// Function to debug authentication state
export function debugAuthState() {
  console.log('=== Authentication Debug ===');
  
  // Check token
  const token = authService.getAccessToken();
  console.log('Token exists:', !!token);
  console.log('Token (first 50 chars):', token ? token.substring(0, 50) + '...' : 'None');
  
  // Check user info from localStorage
  const userInfo = authService.getUserInfo();
  console.log('User info from localStorage:', userInfo);
  
  // Check extracted user info from token
  const extractedInfo = authService.extractUserInfoFromToken();
  console.log('Extracted user info from token:', extractedInfo);
  
  // Check fallback method
  const fallbackInfo = authService.getUserInfoWithFallback();
  console.log('Fallback user info:', fallbackInfo);
  
  // Check authentication status
  console.log('Is authenticated:', authService.isAuthenticated());
  
  if (userInfo) {
    console.log('User roles:', userInfo.roles);
    console.log('Has ROLE_USER:', userInfo.roles?.includes('ROLE_USER'));
    console.log('Has ROLE_ADMIN:', userInfo.roles?.includes('ROLE_ADMIN'));
    console.log('Has ROLE_CUSTOMER:', userInfo.roles?.includes('ROLE_CUSTOMER'));
  }
  
  console.log('=== End Debug ===');
}

// Function to test specific role access
export function testRoleAccess() {
  const userInfo = authService.getUserInfoWithFallback();
  
  if (!userInfo) {
    console.log('❌ No user info found - user not authenticated');
    return;
  }
  
  console.log('✅ User authenticated:', userInfo.email);
  console.log('📋 User roles:', userInfo.roles);
  
  // Test role checks
  const hasUserRole = userInfo.roles?.includes('ROLE_USER') || false;
  const hasAdminRole = userInfo.roles?.includes('ROLE_ADMIN') || false;
  const hasCustomerRole = userInfo.roles?.includes('ROLE_CUSTOMER') || false;
  
  console.log('🔐 Role Access Test:');
  console.log('  - Can access /my-products (ROLE_USER):', hasUserRole ? '✅ YES' : '❌ NO');
  console.log('  - Can access admin features (ROLE_ADMIN):', hasAdminRole ? '✅ YES' : '❌ NO');
  console.log('  - Can access customer features (ROLE_CUSTOMER):', hasCustomerRole ? '✅ YES' : '❌ NO');
  
  if (!hasUserRole) {
    console.log('⚠️  User does not have ROLE_USER - this is why you cannot access /my-products');
    console.log('💡 Expected roles in JWT token: ["ROLE_USER"] or ["ROLE_USER", "ROLE_ADMIN"]');
  }
}

// Export for manual testing
if (typeof window !== 'undefined') {
  (window as any).debugAuthState = debugAuthState;
  (window as any).testRoleAccess = testRoleAccess;
  console.log('Debug functions available:');
  console.log('- debugAuthState() - Check full authentication state');
  console.log('- testRoleAccess() - Test role-based access');
}
