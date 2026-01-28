import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface CartItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
}

export const cartApi = createApi({
  reducerPath: 'cartApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: process.env.NEXT_PUBLIC_ORDER_API_URL || 'http://localhost:8083/api',
    prepareHeaders: (headers) => {
        // We need to pass the user ID. For now assuming we can get it from local storage or it's handled by the caller.
        // Ideally this should come from the auth state.
        // However, RTK Query prepareHeaders has access to getState so we can pull from auth slice if needed.
        // For now, let's assume the caller passes it or we rely on the component to pass it in args if it's dynamic,
        // BUT the controller expects X-User-ID header.
        
        // Let's rely on the token/session if NextAuth handles it, but the backend specifically asks for X-User-ID.
        // We will try to get it from localStorage for now as a fallback or assume the slice handles it.
        // Actually, looking at the other APIs (e.g. ordersApi), they might not be sending it automatically?
        // Wait, OrderController uses @RequestHeader("X-User-ID") String userId.
        // I need to ensure this header is sent.
        
        const userInfo = localStorage.getItem('userInfo'); // Example fallback
        if (userInfo) {
            const user = JSON.parse(userInfo);
            if (user._id) {
                headers.set('X-User-ID', user._id);
            }
        }
        return headers;
    }
  }),
  tagTypes: ['Cart'],
  endpoints: (builder) => ({
    getCart: builder.query<CartItem[], void>({
      query: () => '/cart',
      providesTags: ['Cart'],
      transformResponse: (response: any[]) => {
          // Map backend response to frontend CartItem
          return response.map(item => ({
              productId: item.productId,
              name: item.productName,
              image: item.productImage,
              price: item.price,
              quantity: item.quantity,
              color: item.selectedColor,
              size: item.selectedSize
          }));
      }
    }),
    addToCart: builder.mutation<void, CartItem>({
      query: (item) => ({
        url: '/cart',
        method: 'POST',
        body: {
            productId: item.productId,
            quantity: item.quantity,
            productName: item.name,
            productImage: item.image,
            price: item.price,
            selectedColor: item.color,
            selectedSize: item.size
        },
      }),
      invalidatesTags: ['Cart'],
    }),
    removeFromCart: builder.mutation<void, string>({
      query: (productId) => ({
        url: `/cart/items/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useRemoveFromCartMutation,
} = cartApi;
