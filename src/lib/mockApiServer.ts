import { mockProducts } from './mockData';
import { ApiResponse } from './api';
import { ProductResponse } from './types';

// Mock API server that handles CORS and serves data
export class MockApiServer {
  private static instance: MockApiServer;

  static getInstance(): MockApiServer {
    if (!MockApiServer.instance) {
      MockApiServer.instance = new MockApiServer();
    }
    return MockApiServer.instance;
  }

  async get(endpoint: string): Promise<ApiResponse<any>> {
    console.log(`Mock API: GET ${endpoint}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      if (endpoint === '/products' || endpoint === '/products/top') {
        const limit = endpoint.includes('top') ? 8 : undefined;
        const products = limit ? mockProducts.slice(0, limit) : mockProducts;
        
        return {
          data: products.map(this.transformProduct),
          status: 200
        };
      }

      if (endpoint.startsWith('/products/search')) {
        const urlParams = new URLSearchParams(endpoint.split('?')[1]);
        const keyword = urlParams.get('keyword') || '';
        
        const filteredProducts = mockProducts.filter(product =>
          product.name.toLowerCase().includes(keyword.toLowerCase()) ||
          product.description.toLowerCase().includes(keyword.toLowerCase())
        );
        
        return {
          data: filteredProducts.map(this.transformProduct),
          status: 200
        };
      }

      if (endpoint.startsWith('/products/') && endpoint.includes('/reviews')) {
        // Mock reviews for a product
        return {
          data: {
            content: [
              {
                id: '1',
                rating: 5,
                comment: 'Great product!',
                user: 'John Doe',
                date: new Date().toISOString()
              },
              {
                id: '2',
                rating: 4,
                comment: 'Good value for money',
                user: 'Jane Smith',
                date: new Date().toISOString()
              }
            ],
            totalElements: 2,
            totalPages: 1,
            size: 6,
            number: 0
          },
          status: 200
        };
      }

      if (endpoint.startsWith('/products/') && endpoint.includes('/faqs')) {
        // Mock FAQs for a product
        return {
          data: [
            {
              id: '1',
              question: 'Is this product durable?',
              answer: 'Yes, this product is made with high-quality materials and is built to last.',
              productId: endpoint.split('/')[2]
            },
            {
              id: '2',
              question: 'What is the return policy?',
              answer: 'We offer a 30-day return policy for all products in original condition.',
              productId: endpoint.split('/')[2]
            }
          ],
          status: 200
        };
      }

      // Single product
      if (endpoint.startsWith('/products/') && !endpoint.includes('/')) {
        const productId = endpoint.split('/')[2];
        const product = mockProducts.find(p => p._id === productId);
        
        if (product) {
          return {
            data: this.transformProduct(product),
            status: 200
          };
        }
      }

      return {
        error: 'Not found',
        status: 404
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 500
      };
    }
  }

  async post(endpoint: string, data?: any): Promise<ApiResponse<any>> {
    console.log(`Mock API: POST ${endpoint}`, data);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    if (endpoint.includes('/reviews')) {
      return {
        data: {
          id: Date.now().toString(),
          ...data,
          date: new Date().toISOString()
        },
        status: 201
      };
    }

    if (endpoint.includes('/faqs')) {
      return {
        data: {
          id: Date.now().toString(),
          ...data
        },
        status: 201
      };
    }

    return {
      error: 'Not implemented',
      status: 501
    };
  }

  async put(endpoint: string, data?: any): Promise<ApiResponse<any>> {
    console.log(`Mock API: PUT ${endpoint}`, data);
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      data: data,
      status: 200
    };
  }

  async delete(endpoint: string): Promise<ApiResponse<any>> {
    console.log(`Mock API: DELETE ${endpoint}`);
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      status: 204
    };
  }

  private transformProduct(product: any): ProductResponse {
    return {
      id: parseInt(product._id),
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      imageUrl: product.images?.[0],
      stock: product.stock,
      colors: product.colors,
      sizes: product.sizes,
      averageRating: product.rating,
      reviewCount: product.numReviews,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };
  }
}

export const mockApiServer = MockApiServer.getInstance();
