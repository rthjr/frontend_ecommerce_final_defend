import { productApiClient, ApiResponse } from '@/lib/api';
import { mockApiServer } from '@/lib/mockApiServer';
import { uploadImageToCloudinaryAny } from '@/lib/cloudinaryUpload';
import { 
  ProductRequest, 
  ProductResponse, 
  ReviewRequest, 
  ReviewResponse, 
  FAQRequest, 
  FAQResponse, 
  ProductFilter,
  PaginatedResponse
} from '@/lib/types';

export class ProductService {
  private static instance: ProductService;

  static getInstance(): ProductService {
    if (!ProductService.instance) {
      ProductService.instance = new ProductService();
    }
    return ProductService.instance;
  }

  async getAllProducts(): Promise<ApiResponse<ProductResponse[]>> {
    try {
      return await productApiClient.get<ProductResponse[]>('/api/products');
    } catch (error) {
      // Fallback to mock API server
      console.log('Using mock API server for products');
      return await mockApiServer.get('/products');
    }
  }

  async getActiveProducts(): Promise<ApiResponse<ProductResponse[]>> {
    try {
      return await productApiClient.get<ProductResponse[]>('/api/products?active=true');
    } catch (error) {
      // Fallback to mock API server
      console.log('Using mock API server for active products');
      return await mockApiServer.get('/products?active=true');
    }
  }

  async getProductsBySeller(sellerId: string): Promise<ApiResponse<ProductResponse[]>> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`,
      };
      
      return await productApiClient.get<ProductResponse[]>(`/api/products?sellerId=${sellerId}`, headers);
    } catch (error) {
      // Fallback to mock API server
      console.log('Using mock API server for seller products');
      return await mockApiServer.get(`/products?sellerId=${sellerId}`);
    }
  }

  async getActiveProductsBySeller(sellerId: string): Promise<ApiResponse<ProductResponse[]>> {
    try {
      return await productApiClient.get<ProductResponse[]>(`/api/products?sellerId=${sellerId}&active=true`);
    } catch (error) {
      // Fallback to mock API server
      console.log('Using mock API server for active seller products');
      return await mockApiServer.get(`/products?sellerId=${sellerId}&active=true`);
    }
  }

  async getProductById(id: number): Promise<ApiResponse<ProductResponse>> {
    return productApiClient.get<ProductResponse>(`/api/products/${id}`);
  }

  async createProduct(productData: ProductRequest): Promise<ApiResponse<ProductResponse>> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const userInfo = typeof window !== 'undefined' ? localStorage.getItem('user_info') : null;
    const user = userInfo ? JSON.parse(userInfo) : null;
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
    };
    
    if (user) {
      headers['X-User-Id'] = user.id;
      headers['X-User-Name'] = user.email; // Use email instead of name
    }
    
    return productApiClient.post<ProductResponse>('/api/products', productData, headers);
  }

  async updateProduct(id: number, productData: ProductRequest): Promise<ApiResponse<ProductResponse>> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const userInfo = typeof window !== 'undefined' ? localStorage.getItem('user_info') : null;
    const user = userInfo ? JSON.parse(userInfo) : null;
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
    };
    
    if (user) {
      headers['X-User-Id'] = user.id;
      headers['X-User-Name'] = user.email; // Use email instead of name
    }
    
    return productApiClient.put<ProductResponse>(`/api/products/${id}`, productData, headers);
  }

  async updateProductStatus(id: number, status: string): Promise<ApiResponse<ProductResponse>> {
    return productApiClient.put<ProductResponse>(`/api/products/${id}`, { status });
  }

  async deleteProduct(id: number): Promise<ApiResponse<void>> {
    return productApiClient.delete<void>(`/api/products/${id}`);
  }

  async searchProducts(keyword: string): Promise<ApiResponse<ProductResponse[]>> {
    try {
      return await productApiClient.get<ProductResponse[]>(`/api/products/search?keyword=${encodeURIComponent(keyword)}&active=true`);
    } catch (error) {
      // Fallback to mock API server
      console.log('Using mock API server for product search');
      return await mockApiServer.get(`/products/search?keyword=${encodeURIComponent(keyword)}&active=true`);
    }
  }

  async searchAllProducts(keyword: string): Promise<ApiResponse<ProductResponse[]>> {
    try {
      return await productApiClient.get<ProductResponse[]>(`/api/products/search?keyword=${encodeURIComponent(keyword)}`);
    } catch (error) {
      // Fallback to mock API server
      console.log('Using mock API server for all product search');
      return await mockApiServer.get(`/products/search?keyword=${encodeURIComponent(keyword)}`);
    }
  }

  async filterProducts(filter: ProductFilter): Promise<ApiResponse<PaginatedResponse<ProductResponse>>> {
    const params = new URLSearchParams();
    
    if (filter.category) params.append('category', filter.category);
    if (filter.colors) filter.colors.forEach(color => params.append('colors', color));
    if (filter.sizes) filter.sizes.forEach(size => params.append('sizes', size));
    if (filter.minPrice) params.append('minPrice', filter.minPrice.toString());
    if (filter.maxPrice) params.append('maxPrice', filter.maxPrice.toString());
    if (filter.sortBy) params.append('sortBy', filter.sortBy);
    if (filter.sortDirection) params.append('sortDirection', filter.sortDirection);
    if (filter.page !== undefined) params.append('page', filter.page.toString());
    if (filter.size !== undefined) params.append('size', filter.size.toString());
    params.append('active', 'true'); // Only active products for customers

    return productApiClient.get<PaginatedResponse<ProductResponse>>(`/api/products/filter?${params.toString()}`);
  }

  async filterAllProducts(filter: ProductFilter): Promise<ApiResponse<PaginatedResponse<ProductResponse>>> {
    const params = new URLSearchParams();
    
    if (filter.category) params.append('category', filter.category);
    if (filter.colors) filter.colors.forEach(color => params.append('colors', color));
    if (filter.sizes) filter.sizes.forEach(size => params.append('sizes', size));
    if (filter.minPrice) params.append('minPrice', filter.minPrice.toString());
    if (filter.maxPrice) params.append('maxPrice', filter.maxPrice.toString());
    if (filter.sortBy) params.append('sortBy', filter.sortBy);
    if (filter.sortDirection) params.append('sortDirection', filter.sortDirection);
    if (filter.page !== undefined) params.append('page', filter.page.toString());
    if (filter.size !== undefined) params.append('size', filter.size.toString());

    return productApiClient.get<PaginatedResponse<ProductResponse>>(`/api/products/filter?${params.toString()}`);
  }

  async getTopProducts(limit: number = 10): Promise<ApiResponse<ProductResponse[]>> {
    try {
      return await productApiClient.get<ProductResponse[]>(`/api/products/top?limit=${limit}&active=true`);
    } catch (error) {
      // Fallback to mock API server
      console.log('Using mock API server for top products');
      return await mockApiServer.get(`/products/top?limit=${limit}&active=true`);
    }
  }

  async getAllTopProducts(limit: number = 10): Promise<ApiResponse<ProductResponse[]>> {
    try {
      return await productApiClient.get<ProductResponse[]>(`/api/products/top?limit=${limit}`);
    } catch (error) {
      // Fallback to mock API server
      console.log('Using mock API server for all top products');
      return await mockApiServer.get(`/products/top?limit=${limit}`);
    }
  }

  async getProductReviews(productId: number, page: number = 0, size: number = 6, sortBy: string = 'latest'): Promise<ApiResponse<PaginatedResponse<ReviewResponse>>> {
    return productApiClient.get<PaginatedResponse<ReviewResponse>>(`/api/products/${productId}/reviews?page=${page}&size=${size}&sortBy=${sortBy}`);
  }

  async createReview(productId: number, reviewData: ReviewRequest): Promise<ApiResponse<ReviewResponse>> {
    return productApiClient.post<ReviewResponse>(`/api/products/${productId}/reviews`, reviewData);
  }

  async getProductFAQs(productId: number): Promise<ApiResponse<FAQResponse[]>> {
    return productApiClient.get<FAQResponse[]>(`/api/products/${productId}/faqs`);
  }

  async createFAQ(productId: number, faqData: FAQRequest): Promise<ApiResponse<FAQResponse>> {
    return productApiClient.post<FAQResponse>(`/api/products/${productId}/faqs`, faqData);
  }

  async uploadImageToCloudinary(imageFile: File): Promise<string> {
    try {
      const imageUrl = await uploadImageToCloudinaryAny(imageFile, 'products');
      return imageUrl;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to upload image to Cloudinary');
    }
  }
}

export const productService = ProductService.getInstance();
