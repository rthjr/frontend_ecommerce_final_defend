const PRODUCT_API_URL = process.env.NEXT_PUBLIC_PRODUCT_API_URL || 'http://localhost:8081';
const ORDER_API_URL = process.env.NEXT_PUBLIC_ORDER_API_URL || 'http://localhost:8083';
const USER_API_URL = process.env.NEXT_PUBLIC_USER_API_URL || 'http://localhost:8082';

// Ensure URLs are properly formatted
const formatApiUrl = (url: string): string => {
  if (!url || url === 'undefined') {
    console.error('API URL is undefined! Check your .env.local file');
    return 'http://localhost:8082'; // fallback
  }
  return url;
};

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(options.headers || {}),
      },
    };


    try {
      const response = await fetch(url, config);
      const status = response.status;

      if (!response.ok) {
        const errorText = await response.text();
        return {
          error: errorText || `HTTP error! status: ${status}`,
          status,
        };
      }

      const data = await response.json();
      return {
        data,
        status,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }

  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
      headers,
    });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });
  }

  async put<T>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });
  }

  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      headers,
    });
  }

  withAuth(userId: string) {
    return {
      get: <T>(endpoint: string) => this.get<T>(endpoint, { 'X-User-ID': userId }),
      post: <T>(endpoint: string, data?: any) => this.post<T>(endpoint, data, { 'X-User-ID': userId }),
      put: <T>(endpoint: string, data?: any) => this.put<T>(endpoint, data, { 'X-User-ID': userId }),
      delete: <T>(endpoint: string) => this.delete<T>(endpoint, { 'X-User-ID': userId }),
    };
  }

  withAuthToken() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    return {
      get: <T>(endpoint: string) => this.get<T>(endpoint, { 'Authorization': `Bearer ${token}` }),
      post: <T>(endpoint: string, data?: any) => this.post<T>(endpoint, data, { 'Authorization': `Bearer ${token}` }),
      put: <T>(endpoint: string, data?: any) => this.put<T>(endpoint, data, { 'Authorization': `Bearer ${token}` }),
      delete: <T>(endpoint: string) => this.delete<T>(endpoint, { 'Authorization': `Bearer ${token}` }),
    };
  }
}

export const apiClient = new ApiClient(formatApiUrl(PRODUCT_API_URL));
export const productApiClient = new ApiClient(formatApiUrl(PRODUCT_API_URL));
export const orderApiClient = new ApiClient(formatApiUrl(ORDER_API_URL));
export const userApiClient = new ApiClient(formatApiUrl(USER_API_URL));
export default apiClient;
