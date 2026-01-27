import { orderApiClient, ApiResponse } from '@/lib/api';
import { CartItemRequest, CartItemResponse } from '@/lib/types';

export class CartService {
  private static instance: CartService;

  static getInstance(): CartService {
    if (!CartService.instance) {
      CartService.instance = new CartService();
    }
    return CartService.instance;
  }

  async addToCart(userId: string, cartItem: CartItemRequest): Promise<ApiResponse<string>> {
    const authClient = orderApiClient.withAuth(userId);
    return authClient.post<string>('/api/cart', cartItem);
  }

  async getCart(userId: string): Promise<ApiResponse<CartItemResponse[]>> {
    const authClient = orderApiClient.withAuth(userId);
    return authClient.get<CartItemResponse[]>('/api/cart');
  }

  async removeFromCart(userId: string, productId: string): Promise<ApiResponse<void>> {
    const authClient = orderApiClient.withAuth(userId);
    return authClient.delete<void>(`/api/cart/items/${productId}`);
  }
}

export const cartService = CartService.getInstance();
