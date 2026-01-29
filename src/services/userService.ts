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
}

export const userService = UserService.getInstance();
