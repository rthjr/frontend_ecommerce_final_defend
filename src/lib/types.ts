// User Types
export interface UserRequest {
  name: string;
  email: string;
  password?: string;
  address?: string;
  phone?: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  address?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

// Product Types
export interface ProductRequest {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  stockQuantity: number;
  active?: boolean;
  colors?: string[];
  sizes?: string[];
}

export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  stockQuantity: number;
  active: boolean;
  sellerId?: string;
  sellerName?: string;
  brand?: string;
  rating?: number;
  numReviews?: number;
  discountPrice?: number;
  imageUrls?: string[];
  colors?: string[];
  sizes?: string[];
  dressStyle?: string;
  createdAt: string;
  updatedAt: string;
}

// Review Types
export interface ReviewRequest {
  rating: number;
  comment: string;
}

export interface ReviewResponse {
  id: number;
  userId: string;
  productId: number;
  rating: number;
  comment: string;
  createdAt: string;
}

// FAQ Types
export interface FAQRequest {
  question: string;
  answer: string;
}

export interface FAQResponse {
  id: number;
  productId: number;
  question: string;
  answer: string;
  createdAt: string;
}

// Cart Types
export interface CartItemRequest {
  productId: string;
  quantity: number;
}

export interface CartItemResponse {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  totalPrice: number;
}

// Order Types
export interface PaymentResultDTO {
  paymentId: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  amount: number;
}

export interface OrderResponse {
  id: number;
  userId: string;
  items: CartItemResponse[];
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  paymentResult?: PaymentResultDTO;
}

// Filter Types
export interface ProductFilter {
  category?: string;
  colors?: string[];
  sizes?: string[];
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  size?: number;
}

// API Response Types
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
