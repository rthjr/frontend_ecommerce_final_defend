// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface JwtResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn?: number;
  userInfo?: UserInfo;
  sessionToken?: string; // For session management
}

export interface UserInfo {
  id: string;
  _id?: string; // Alias for id
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  roles: string[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  provider?: string; // 'local' for JWT, 'google', 'github', 'facebook' for OAuth2
  avatar?: string;
}

export interface OAuth2Provider {
  name: string;
  authUrl: string;
}

export interface OAuth2Providers {
  google: OAuth2Provider;
  github: OAuth2Provider;
  facebook: OAuth2Provider;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: UserInfo | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  refreshUser: () => Promise<void>;
  loginWithOAuth2: (provider: string) => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  isAdmin: () => boolean;
  isUser: () => boolean;
  isCustomer: () => boolean;
}

// Session Management Types
export interface SessionResponse {
  id: string;
  userId: string;
  deviceInfo: string;  // User-Agent
  ipAddress: string;
  loginTime: string;   // ISO date
  lastActivity: string; // ISO date
  active: boolean;
  current: boolean;    // marks current session
}

// Password Reset Flow Types (3-step process)
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  success: boolean;
}

export interface VerifyResetCodeRequest {
  email: string;
  resetCode: string;
}

export interface VerifyResetCodeResponse {
  valid: boolean;
  message: string;
}

export interface ResetPasswordRequest {
  email: string;
  resetCode: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
  success: boolean;
}

// Session Management Request/Response Types
export interface TerminateSessionResponse {
  message: string;
  success: boolean;
}

export interface TerminateAllSessionsResponse {
  message: string;
  count: number;
  success: boolean;
}
