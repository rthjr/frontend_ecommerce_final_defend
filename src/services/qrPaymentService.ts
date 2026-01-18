import { ApiResponse } from '@/lib/api';

const QR_PAYMENT_API_URL = process.env.NEXT_PUBLIC_QR_PAYMENT_API_URL || 'https://miniature-umbrella-xjj6w4974qv26v5j-8000.app.github.dev';

export interface QROrderRequest {
  amount: number; // Amount in KHR
}

export interface QROrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  qr_image: string; // Base64 image data
  status: string;
}

export interface QRStatusResponse {
  status: string; // "UNPAID" or "PAID"
}

class QRPaymentService {
  private baseURL: string;

  constructor() {
    this.baseURL = QR_PAYMENT_API_URL;
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

  // Create order and generate QR code
  async createOrder(amount: number): Promise<ApiResponse<QROrderResponse>> {
    return this.request<QROrderResponse>('/orders', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  // Check payment status
  async checkPaymentStatus(orderId: string): Promise<ApiResponse<QRStatusResponse>> {
    return this.request<QRStatusResponse>(`/orders/${orderId}/status`, {
      method: 'GET',
    });
  }

  // Poll payment status until paid or timeout
  async pollPaymentStatus(
    orderId: string,
    onStatusChange: (status: string) => void,
    maxAttempts: number = 30,
    interval: number = 2000
  ): Promise<{ success: boolean; status: string }> {
    let attempts = 0;

    return new Promise((resolve) => {
      const poll = async () => {
        attempts++;
        
        try {
          const response = await this.checkPaymentStatus(orderId);
          
          if (response.data) {
            const status = response.data.status;
            onStatusChange(status);
            
            if (status === 'PAID') {
              resolve({ success: true, status });
              return;
            }
          }
          
          if (attempts >= maxAttempts) {
            resolve({ success: false, status: 'TIMEOUT' });
            return;
          }
          
          setTimeout(poll, interval);
        } catch (error) {
          if (attempts >= maxAttempts) {
            resolve({ success: false, status: 'ERROR' });
            return;
          }
          setTimeout(poll, interval);
        }
      };
      
      poll();
    });
  }
}

export const qrPaymentService = new QRPaymentService();
