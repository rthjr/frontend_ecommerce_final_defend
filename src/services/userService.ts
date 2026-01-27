import { userApiClient, ApiResponse } from '@/lib/api';
import { UserRequest, UserResponse } from '@/lib/types';

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
}

export const userService = UserService.getInstance();
