// Gateway URL - single entry point for all microservices
const GATEWAY_API_URL = process.env.NEXT_PUBLIC_GATEWAY_API_URL || 'http://localhost:8080';

// Ensure URLs are properly formatted
const formatApiUrl = (url: string): string => {
  if (!url || url === 'undefined') {
    console.error('API URL is undefined! Check your .env.local file');
    return 'http://localhost:8080'; // fallback to gateway
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
        // Try to extract a clean message from JSON responses
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          try {
            const errJson: any = await response.json();
            const message = errJson?.message || errJson?.error || errJson?.detail || `HTTP error! status: ${status}`;
            return { error: String(message), status };
          } catch {
            // Fallback to text if JSON parsing fails
          }
        }
        const errorText = await response.text();
        const message = errorText && errorText.startsWith('{') ? `HTTP error! status: ${status}` : errorText;
        return { error: message || `HTTP error! status: ${status}`, status };
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

  async delete<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });
  }

  withAuth(userId: string) {
    return {
      get: <T>(endpoint: string) => this.get<T>(endpoint, { 'X-User-ID': userId }),
      post: <T>(endpoint: string, data?: any) => this.post<T>(endpoint, data, { 'X-User-ID': userId }),
      put: <T>(endpoint: string, data?: any) => this.put<T>(endpoint, data, { 'X-User-ID': userId }),
      delete: <T>(endpoint: string, data?: any) => this.delete<T>(endpoint, data, { 'X-User-ID': userId }),
    };
  }

  withAuthToken() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const authHeader = { 'Authorization': `Bearer ${token}` };
    return {
      get: <T>(endpoint: string, options?: { headers?: Record<string, string> }) => 
        this.get<T>(endpoint, { ...authHeader, ...options?.headers }),
      post: <T>(endpoint: string, data?: any, options?: { headers?: Record<string, string> }) => 
        this.post<T>(endpoint, data, { ...authHeader, ...options?.headers }),
      put: <T>(endpoint: string, data?: any, options?: { headers?: Record<string, string> }) => 
        this.put<T>(endpoint, data, { ...authHeader, ...options?.headers }),
      delete: <T>(endpoint: string, data?: any, options?: { headers?: Record<string, string> }) => 
        this.delete<T>(endpoint, data, { ...authHeader, ...options?.headers }),
    };
  }
}

// All API clients now point to the gateway
export const apiClient = new ApiClient(formatApiUrl(GATEWAY_API_URL));
export const productApiClient = new ApiClient(formatApiUrl(GATEWAY_API_URL));
export const orderApiClient = new ApiClient(formatApiUrl(GATEWAY_API_URL));
export const userApiClient = new ApiClient(formatApiUrl(GATEWAY_API_URL));
export default apiClient;
