'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { authService } from '@/services/authService';
import { 
  AuthContextType, 
  AuthState, 
  LoginRequest, 
  RegisterRequest 
} from '@/lib/types/auth';

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: true,
  error: null,
};

// Action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: any; accessToken: string; refreshToken?: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_USER'; payload: any }
  | { type: 'SET_LOADING'; payload: boolean };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken || null,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const accessToken = authService.getAccessToken();
      const userInfo = authService.getUserInfoWithFallback();

      if (accessToken && userInfo) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: userInfo,
            accessToken,
            refreshToken: authService.getRefreshToken() || undefined,
          },
        });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initAuth();
  }, []);

  // Login
  const login = async (credentials: LoginRequest): Promise<void> => {
    dispatch({ type: 'AUTH_START' });
    
    const result = await authService.login(credentials);
    
    if (result.error) {
      dispatch({ type: 'AUTH_FAILURE', payload: result.error });
      throw { message: result.error, status: result.status } as any;
    } else if (result.data) {
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: result.data.userInfo || authService.getUserInfo(),
          accessToken: result.data.accessToken,
          refreshToken: result.data.refreshToken || undefined,
        },
      });
    }
  };

  // Register
  const register = async (userData: RegisterRequest): Promise<void> => {
    dispatch({ type: 'AUTH_START' });
    
    const result = await authService.register(userData);
    
    if (result.error) {
      dispatch({ type: 'AUTH_FAILURE', payload: result.error });
      throw { message: result.error, status: result.status } as any;
    } else if (result.data) {
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: result.data.userInfo || authService.getUserInfo(),
          accessToken: result.data.accessToken,
          refreshToken: result.data.refreshToken || undefined,
        },
      });
    }
  };

  // Logout
  const logout = async (): Promise<void> => {
    await authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  // Refresh token
  const refreshAccessToken = async (): Promise<void> => {
    const result = await authService.refreshAccessToken();
    
    if (result.error) {
      dispatch({ type: 'AUTH_FAILURE', payload: result.error });
      throw new Error(result.error);
    } else if (result.data) {
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: result.data.userInfo || authService.getUserInfo(),
          accessToken: result.data.accessToken,
        },
      });
    }
  };

  // Get current user
  const getCurrentUser = async (): Promise<void> => {
    const result = await authService.getCurrentUser();
    
    if (result.error) {
      dispatch({ type: 'AUTH_FAILURE', payload: result.error });
    } else if (result.data) {
      dispatch({ type: 'SET_USER', payload: result.data });
    }
  };

  // OAuth2 login
  const loginWithOAuth2 = (provider: string): void => {
    // Redirect to OAuth2 provider
    window.location.href = `/oauth2/authorization/${provider}`;
  };

  // Clear error
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Role management methods
  const hasRole = (role: string): boolean => {
    return state.user?.roles?.includes(role) || false;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    if (!state.user?.roles) return false;
    return roles.some(role => state.user!.roles.includes(role));
  };

  const isAdmin = (): boolean => {
    return hasRole('ROLE_ADMIN');
  };

  const isUser = (): boolean => {
    return hasRole('ROLE_USER');
  };

  const isCustomer = (): boolean => {
    return hasRole('ROLE_CUSTOMER');
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshAccessToken,
    getCurrentUser,
    loginWithOAuth2,
    hasRole,
    hasAnyRole,
    isAdmin,
    isUser,
    isCustomer,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
