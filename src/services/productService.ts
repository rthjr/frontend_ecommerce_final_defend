import { productApiClient, ApiResponse } from '@/lib/api';
import { mockApiServer } from '@/lib/mockApiServer';
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

  async getProductById(id: number): Promise<ApiResponse<ProductResponse>> {
    return productApiClient.get<ProductResponse>(`/api/products/${id}`);
  }

  async createProduct(productData: ProductRequest): Promise<ApiResponse<ProductResponse>> {
    return productApiClient.post<ProductResponse>('/api/products', productData);
  }

  async updateProduct(id: number, productData: ProductRequest): Promise<ApiResponse<ProductResponse>> {
    return productApiClient.put<ProductResponse>(`/api/products/${id}`, productData);
  }

  async deleteProduct(id: number): Promise<ApiResponse<void>> {
    return productApiClient.delete<void>(`/api/products/${id}`);
  }

  async searchProducts(keyword: string): Promise<ApiResponse<ProductResponse[]>> {
    try {
      return await productApiClient.get<ProductResponse[]>(`/api/products/search?keyword=${encodeURIComponent(keyword)}`);
    } catch (error) {
      // Fallback to mock API server
      console.log('Using mock API server for product search');
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

    return productApiClient.get<PaginatedResponse<ProductResponse>>(`/api/products/filter?${params.toString()}`);
  }

  async getTopProducts(limit: number = 10): Promise<ApiResponse<ProductResponse[]>> {
    try {
      return await productApiClient.get<ProductResponse[]>(`/api/products/top?limit=${limit}`);
    } catch (error) {
      // Fallback to mock API server
      console.log('Using mock API server for top products');
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
}

export const productService = ProductService.getInstance();
