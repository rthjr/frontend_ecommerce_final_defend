import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Product } from '@/lib/types';

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_PRODUCT_API_URL || 'http://localhost:8081/api' }),
  tagTypes: ['Product'],
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], { keyword?: string; page?: number; limit?: number }>({
      query: (params) => ({
        url: '/products',
        params,
      }),
      providesTags: ['Product'],
    }),
    searchProducts: builder.query<Product[], { keyword: string }>({
      query: (params) => ({
        url: '/products/search',
        params: { keyword: params.keyword },
      }),
      providesTags: ['Product'],
    }),
    filterProducts: builder.query<any, { 
        category?: string; 
        colors?: string[]; 
        sizes?: string[]; 
        minPrice?: number; 
        maxPrice?: number; 
        sortBy?: string;
        sortDirection?: string;
        page?: number; 
        size?: number 
    }>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.category) queryParams.append('category', params.category);
        if (params.colors) params.colors.forEach(c => queryParams.append('colors', c));
        if (params.sizes) params.sizes.forEach(s => queryParams.append('sizes', s));
        if (params.minPrice) queryParams.append('minPrice', params.minPrice.toString());
        if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
        if (params.page !== undefined) queryParams.append('page', params.page.toString());
        if (params.size !== undefined) queryParams.append('size', params.size.toString());
        
        return {
            url: `/products/filter?${queryParams.toString()}`,
        };
      },
      providesTags: ['Product'],
    }),
    getProductById: builder.query<Product, string>({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    getTopProducts: builder.query<Product[], void>({
      query: () => '/products/top',
      providesTags: ['Product'],
    }),
    createProduct: builder.mutation<Product, void>({
      query: () => ({
        url: '/products',
        method: 'POST',
      }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: builder.mutation<Product, Product>({
      query: (data) => ({
        url: `/products/${data._id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),
    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
    uploadProductImage: builder.mutation<{ image: string }, FormData>({
      query: (data) => ({
        url: '/upload',
        method: 'POST',
        body: data,
      }),
    }),
    getProductReviews: builder.query<any, { productId: string; page?: number; size?: number; sortBy?: string }>({
        query: ({ productId, page, size, sortBy }) => ({
            url: `/products/${productId}/reviews`,
            params: { page, size, sortBy }
        }),
    }),
    createReview: builder.mutation<any, { productId: string; rating: number; content: string; userId: number }>({
        query: ({ productId, ...body }) => ({
            url: `/products/${productId}/reviews`,
            method: 'POST',
            body,
        }),
        invalidatesTags: (result, error, arg) => [{ type: 'Product', id: arg.productId }],
    }),
    getProductFAQs: builder.query<any, { productId: string }>({
        query: ({ productId }) => `/products/${productId}/faqs`,
        providesTags: (result, error, { productId }) => [{ type: 'Product', id: productId }],
    }),
    createFAQ: builder.mutation<any, { productId: string; question: string; userId: number; answer?: string; order?: number }>({
        query: ({ productId, ...body }) => ({
            url: `/products/${productId}/faqs`,
            method: 'POST',
            body,
        }),
        invalidatesTags: (result, error, arg) => [{ type: 'Product', id: arg.productId }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetTopProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUploadProductImageMutation,
  useSearchProductsQuery,
  useFilterProductsQuery,
  useGetProductReviewsQuery,
  useCreateReviewMutation,
  useGetProductFAQsQuery,
  useCreateFAQMutation,
} = productsApi;
