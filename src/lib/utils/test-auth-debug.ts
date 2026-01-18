// Debug script to test authentication and role access
// Run this in browser console to debug the issue

import { authService } from '@/services/authService';

// Function to test current authentication state
export function testCurrentAuthState() {
  console.log('=== Authentication State Test ===');
  
  // 1. Check token
  const token = authService.getAccessToken();
  console.log('🔑 Token exists:', !!token);
  
  if (token) {
    // 2. Extract from token
    const tokenInfo = authService.extractUserInfoFromToken();
    console.log('📋 Token extracted info:', tokenInfo);
    
    // 3. Check localStorage
    const localStorageInfo = authService.getUserInfo();
    console.log('💾 LocalStorage info:', localStorageInfo);
    
    // 4. Check fallback
    const fallbackInfo = authService.getUserInfoWithFallback();
    console.log('🔄 Fallback info:', fallbackInfo);
    
    // 5. Test role checks
    if (fallbackInfo) {
      console.log('🔐 Role Checks:');
      console.log('  - Has ROLE_USER:', fallbackInfo.roles.includes('ROLE_USER'));
      console.log('  - Has ROLE_CUSTOMER:', fallbackInfo.roles.includes('ROLE_CUSTOMER'));
      console.log('  - Has ROLE_ADMIN:', fallbackInfo.roles.includes('ROLE_ADMIN'));
      
      // 6. Test specific access
      console.log('🚪 Access Test:');
      console.log('  - Can access /my-products (ROLE_USER):', fallbackInfo.roles.includes('ROLE_USER') ? '✅ YES' : '❌ NO');
      console.log('  - Can access customer features:', fallbackInfo.roles.includes('ROLE_CUSTOMER') ? '✅ YES' : '❌ NO');
    }
  }
  
  console.log('=== End Test ===');
}

// Function to manually add ROLE_USER for testing
export function addRoleUserForTesting() {
  console.log('⚠️  Adding ROLE_USER for testing purposes...');
  
  const userInfo = authService.getUserInfo();
  if (userInfo && !userInfo.roles.includes('ROLE_USER')) {
    userInfo.roles.push('ROLE_USER');
    authService.setUserInfo(userInfo);
    console.log('✅ ROLE_USER added. Refresh the page to test access.');
  } else {
    console.log('ℹ️  User info not found or already has ROLE_USER');
  }
}

// Export for manual testing
if (typeof window !== 'undefined') {
  (window as any).testCurrentAuthState = testCurrentAuthState;
  (window as any).addRoleUserForTesting = addRoleUserForTesting;
  
  console.log('🔧 Debug functions available:');
  console.log('- testCurrentAuthState() - Check your current auth state');
  console.log('- addRoleUserForTesting() - Add ROLE_USER for testing');
}
