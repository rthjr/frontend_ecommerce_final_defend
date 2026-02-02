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
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// Profile Types
export interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Address Types (Cambodia-specific)
export interface AddressDTO {
  id?: string;
  label?: string;
  isDefault?: boolean;
  firstName: string;
  lastName: string;
  phone: string;
  street: string;
  village?: string;
  commune: string;
  district: string;
  province: string;
  postalCode?: string;
  country?: string;
  additionalInfo?: string;
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
  content: string;
  userId: number;
}

export interface ReviewResponse {
  id: number;
  userId: number;
  user: string;
  content: string;
  rating: number;
  date: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
}

// FAQ Types
export interface FAQRequest {
  question: string;
  answer: string;
  order?: number;
}

export interface FAQResponse {
  id: number;
  productId: number;
  question: string;
  answer: string;
  order: number;
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
  updateTime?: string;
  emailAddress?: string;
}

export interface ShippingAddressDTO {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface OrderResponse {
  id: number;
  userId: string;
  items: CartItemResponse[];
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'DELIVERED' | 'CANCELLED';
  
  // Shipping Information
  shippingAddress?: ShippingAddressDTO;
  
  // Payment Information
  paymentMethod?: string;
  paymentResult?: PaymentResultDTO;
  
  // Price Breakdown
  itemsPrice?: number;
  taxPrice?: number;
  shippingPrice?: number;
  
  // Payment Status
  isPaid?: boolean;
  paidAt?: string;
  
  // Delivery Status
  isDelivered?: boolean;
  deliveredAt?: string;
  
  createdAt: string;
  updatedAt: string;
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
