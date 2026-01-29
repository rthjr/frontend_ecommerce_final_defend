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
        const userInfo = localStorage.getItem('userInfo');
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
    updateCartItem: builder.mutation<void, { productId: string; quantity: number }>({
      query: ({ productId, quantity }) => ({
        url: `/cart/items/${productId}`,
        method: 'PUT',
        body: { quantity },
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
    clearCart: builder.mutation<void, void>({
      query: () => ({
        url: '/cart',
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
} = cartApi;
