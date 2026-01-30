import { userApiClient, ApiResponse } from '@/lib/api';
import { UserRequest, UserResponse, ProfileUpdateRequest, PasswordChangeRequest, AddressDTO } from '@/lib/types';

export class UserService {
  private static instance: UserService;

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async getAllUsers(): Promise<ApiResponse<UserResponse[]>> {
    return userApiClient.get<UserResponse[]>('/api/users');
  }

  async getUserById(id: string): Promise<ApiResponse<UserResponse>> {
    return userApiClient.get<UserResponse>(`/api/users/${id}`);
  }

  async createUser(userData: UserRequest): Promise<ApiResponse<string>> {
    return userApiClient.post<string>('/api/users', userData);
  }

  async updateUser(id: string, userData: UserRequest): Promise<ApiResponse<string>> {
    return userApiClient.put<string>(`/api/users/${id}`, userData);
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return userApiClient.delete<void>(`/api/users/${id}`);
  }

  // Profile endpoints
  async getProfile(): Promise<ApiResponse<UserResponse>> {
    return userApiClient.withAuthToken().get<UserResponse>('/api/users/profile');
  }

  async updateProfile(data: ProfileUpdateRequest): Promise<ApiResponse<UserResponse>> {
    return userApiClient.withAuthToken().put<UserResponse>('/api/users/profile', data);
  }

  async changePassword(data: PasswordChangeRequest): Promise<ApiResponse<{ message: string }>> {
    return userApiClient.withAuthToken().put<{ message: string }>('/api/users/profile/password', data);
  }

  // Address endpoints
  async getAddresses(): Promise<ApiResponse<AddressDTO[]>> {
    return userApiClient.withAuthToken().get<AddressDTO[]>('/api/users/addresses');
  }

  async getAddressById(id: string): Promise<ApiResponse<AddressDTO>> {
    return userApiClient.withAuthToken().get<AddressDTO>(`/api/users/addresses/${id}`);
  }

  async getDefaultAddress(): Promise<ApiResponse<AddressDTO>> {
    return userApiClient.withAuthToken().get<AddressDTO>('/api/users/addresses/default');
  }

  async createAddress(data: AddressDTO): Promise<ApiResponse<AddressDTO>> {
    return userApiClient.withAuthToken().post<AddressDTO>('/api/users/addresses', data);
  }

  async updateAddress(id: string, data: AddressDTO): Promise<ApiResponse<AddressDTO>> {
    return userApiClient.withAuthToken().put<AddressDTO>(`/api/users/addresses/${id}`, data);
  }

  async deleteAddress(id: string): Promise<ApiResponse<{ message: string }>> {
    return userApiClient.withAuthToken().delete<{ message: string }>(`/api/users/addresses/${id}`);
  }

  async setDefaultAddress(id: string): Promise<ApiResponse<AddressDTO>> {
    return userApiClient.withAuthToken().put<AddressDTO>(`/api/users/addresses/${id}/default`);
  }

  // Account management endpoints
  async deleteAccount(password: string, confirmDeletion: boolean, reason?: string): Promise<ApiResponse<{ message: string; success: boolean }>> {
    return userApiClient.withAuthToken().delete<{ message: string; success: boolean }>('/api/users/profile', {
      password,
      confirmDeletion,
      reason
    });
  }

  async exportUserData(): Promise<ApiResponse<UserDataExport>> {
    return userApiClient.withAuthToken().get<UserDataExport>('/api/users/profile/export');
  }

  // Session management endpoints
  async getActiveSessions(): Promise<ApiResponse<SessionInfo[]>> {
    const sessionToken = this.getStoredSessionToken();
    const headers: Record<string, string> = {};
    if (sessionToken) {
      headers['X-Session-Token'] = sessionToken;
    }
    return userApiClient.withAuthToken().get<SessionInfo[]>('/api/auth/sessions', { headers });
  }

  async getLoginHistory(): Promise<ApiResponse<SessionInfo[]>> {
    const sessionToken = this.getStoredSessionToken();
    const headers: Record<string, string> = {};
    if (sessionToken) {
      headers['X-Session-Token'] = sessionToken;
    }
    return userApiClient.withAuthToken().get<SessionInfo[]>('/api/auth/sessions/history', { headers });
  }

  async terminateSession(sessionId: string): Promise<ApiResponse<{ message: string; success: boolean }>> {
    return userApiClient.withAuthToken().delete<{ message: string; success: boolean }>(`/api/auth/sessions/${sessionId}`);
  }

  async terminateAllOtherSessions(): Promise<ApiResponse<{ message: string; count: number; success: boolean }>> {
    const sessionToken = this.getStoredSessionToken();
    const headers: Record<string, string> = {};
    if (sessionToken) {
      headers['X-Session-Token'] = sessionToken;
    }
    return userApiClient.withAuthToken().delete<{ message: string; count: number; success: boolean }>('/api/auth/sessions', undefined, { headers });
  }

  // Helper method to get stored session token
  private getStoredSessionToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sessionToken');
    }
    return null;
  }
}

// Types for user data export
export interface UserDataExport {
  profile: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    roles: string[];
    createdAt: string;
    updatedAt: string;
  };
  addresses: Array<{
    id: string;
    label: string;
    recipientName: string;
    phoneNumber: string;
    streetAddress: string;
    city: string;
    province: string;
    country: string;
    postalCode: string;
    isDefault: boolean;
  }>;
  accountMetadata: {
    accountCreated: string;
    lastLogin?: string;
    accountStatus: string;
    emailVerified: boolean;
    twoFactorEnabled: boolean;
  };
  exportMetadata: {
    exportedAt: string;
    exportFormat: string;
    exportVersion: string;
    requestedBy: string;
  };
}

// Types for session management
export interface SessionInfo {
  id: string;
  deviceInfo: string;
  browser: string;
  operatingSystem: string;
  ipAddress: string;
  location?: string;
  isCurrent: boolean;
  isActive: boolean;
  createdAt: string;
  lastActivity: string;
}

export const userService = UserService.getInstance();
