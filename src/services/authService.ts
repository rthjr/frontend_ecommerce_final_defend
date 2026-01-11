import { userApiClient } from '@/lib/api';
import { 
  LoginRequest, 
  RegisterRequest, 
  RefreshTokenRequest, 
  JwtResponse, 
  UserInfo, 
  OAuth2Providers 
} from '@/lib/types/auth';

class AuthService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user_info';

  // Store tokens in localStorage
  setTokens(accessToken: string, refreshToken?: string) {
    if (accessToken) {
      localStorage.setItem(this.TOKEN_KEY, accessToken);
    }
    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  // Get tokens from localStorage
  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
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
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  // Check if user is OAuth2 authenticated
  isOAuth2Authenticated(): boolean {
    const userInfo = this.getUserInfo();
    return userInfo ? userInfo.provider !== 'local' : false;
  }

  // Register new user
  async register(userData: RegisterRequest) {
    try {
      const response = await userApiClient.post<JwtResponse>('/api/auth/register', userData);
      
      if (response.data) {
        this.setTokens(response.data.accessToken, response.data.refreshToken);
        if (response.data.userInfo) {
          this.setUserInfo(response.data.userInfo);
        }
      }
      
      return {
        data: response.data,
        error: null
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.response?.data?.message || 'Registration failed'
      };
    }
  }

  // Login user
  async login(credentials: LoginRequest) {
    try {
      const response = await userApiClient.post<JwtResponse>('/api/auth/login', credentials);
      
      if (response.data) {
        this.setTokens(response.data.accessToken, response.data.refreshToken);
        if (response.data.userInfo) {
          this.setUserInfo(response.data.userInfo);
        }
      }
      
      return {
        data: response.data,
        error: null
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.response?.data?.message || 'Login failed'
      };
    }
  }

  // Refresh access token
  async refreshAccessToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await userApiClient.post<JwtResponse>('/api/auth/refresh', {
        refreshToken
      } as RefreshTokenRequest);
      
      if (response.data) {
        this.setTokens(response.data.accessToken);
        if (response.data.userInfo) {
          this.setUserInfo(response.data.userInfo);
        }
      }
      
      return {
        data: response.data,
        error: null
      };
    } catch (error: any) {
      // If refresh fails, clear auth data
      this.clearAuthData();
      return {
        data: null,
        error: error.response?.data?.message || 'Token refresh failed'
      };
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const authClient = userApiClient.withAuthToken();
      const response = await authClient.get<UserInfo>('/api/auth/me');
      
      if (response.data) {
        this.setUserInfo(response.data);
      }
      
      return {
        data: response.data,
        error: null
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.response?.data?.message || 'Failed to get user info'
      };
    }
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
    try {
      const response = await userApiClient.get<OAuth2Providers>('/api/oauth2/providers');
      return {
        data: response.data,
        error: null
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.response?.data?.message || 'Failed to get OAuth2 providers'
      };
    }
  }

  // Get OAuth2 user info
  async getOAuth2UserInfo() {
    try {
      const response = await userApiClient.get<any>('/api/oauth2/user');
      return {
        data: response.data,
        error: null
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.response?.data?.message || 'Failed to get OAuth2 user info'
      };
    }
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
}

export const authService = new AuthService();
