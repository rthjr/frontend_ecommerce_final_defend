import { orderApiClient, ApiResponse } from '@/lib/api';
import { OrderResponse, PaymentResultDTO } from '@/lib/types';

// Mock order data for fallback
const mockOrders: OrderResponse[] = [
  {
    id: 1,
    userId: 'user1',
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
    status: 'DELIVERED',
    totalAmount: 129.97,
    items: [
      {
        productId: '1',
        productName: 'Premium Cotton T-Shirt',
        quantity: 2,
        price: 29.99,
        totalPrice: 59.98,
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1780&auto=format&fit=crop'
      },
      {
        productId: '2', 
        productName: 'Slim Fit Denim Jeans',
        quantity: 1,
        price: 69.99,
        totalPrice: 69.99,
        imageUrl: 'https://images.unsplash.com/photo-1542272617-08f086302542?q=80&w=1779&auto=format&fit=crop'
      }
    ]
  },
  {
    id: 2,
    userId: 'user1',
    createdAt: new Date('2024-01-20').toISOString(),
    updatedAt: new Date('2024-01-20').toISOString(),
    status: 'PENDING',
    totalAmount: 89.98,
    items: [
      {
        productId: '3',
        productName: 'Wireless Headphones',
        quantity: 1,
        price: 89.98,
        totalPrice: 89.98,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1780&auto=format&fit=crop'
      }
    ]
  }
];

export class OrderService {
  private static instance: OrderService;

  static getInstance(): OrderService {
    if (!OrderService.instance) {
      OrderService.instance = new OrderService();
    }
    return OrderService.instance;
  }

  async createOrder(userId: string): Promise<ApiResponse<OrderResponse>> {
    try {
      return await orderApiClient.post<OrderResponse>('/api/orders');
    } catch (error) {
      // Fallback to mock data
      const newOrder: OrderResponse = {
        id: Math.max(...mockOrders.map(o => o.id)) + 1,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'PENDING',
        totalAmount: 0,
        items: []
      };
      return {
        data: newOrder,
        status: 201
      };
    }
  }

  async getOrderById(id: number): Promise<ApiResponse<OrderResponse>> {
    try {
      return await orderApiClient.get<OrderResponse>(`/api/orders/${id}`);
    } catch (error) {
      // Fallback to mock data
      const order = mockOrders.find(o => o.id === id);
      if (order) {
        return {
          data: order,
          status: 200
        };
      }
      return {
        error: 'Order not found',
        status: 404
      };
    }
  }

  async getAllOrders(): Promise<ApiResponse<OrderResponse[]>> {
    try {
      return await orderApiClient.get<OrderResponse[]>('/api/orders');
    } catch (error) {
      // Fallback to mock data
      return {
        data: mockOrders,
        status: 200
      };
    }
  }

  async getUserOrders(userId: string): Promise<ApiResponse<OrderResponse[]>> {
    try {
      const authClient = orderApiClient.withAuth(userId);
      return await authClient.get<OrderResponse[]>('/api/orders/myorders');
    } catch (error) {
      // Fallback to mock data
      const userOrders = mockOrders.filter(o => o.userId === userId);
      return {
        data: userOrders,
        status: 200
      };
    }
  }

  async markAsPaid(orderId: number, paymentResult: PaymentResultDTO): Promise<ApiResponse<OrderResponse>> {
    try {
      return await orderApiClient.put<OrderResponse>(`/api/orders/${orderId}/pay`, paymentResult);
    } catch (error) {
      // Fallback to mock data
      const order = mockOrders.find(o => o.id === orderId);
      if (order) {
        const updatedOrder = { ...order, status: 'PAID' as const };
        return {
          data: updatedOrder,
          status: 200
        };
      }
      return {
        error: 'Order not found',
        status: 404
      };
    }
  }

  async markAsDelivered(orderId: number): Promise<ApiResponse<OrderResponse>> {
    try {
      return await orderApiClient.put<OrderResponse>(`/api/orders/${orderId}/deliver`);
    } catch (error) {
      // Fallback to mock data
      const order = mockOrders.find(o => o.id === orderId);
      if (order) {
        const updatedOrder = { ...order, status: 'DELIVERED' as const };
        return {
          data: updatedOrder,
          status: 200
        };
      }
      return {
        error: 'Order not found',
        status: 404
      };
    }
  }
}

export const orderService = OrderService.getInstance();
