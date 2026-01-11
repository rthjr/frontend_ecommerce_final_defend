import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Order } from '@/lib/types';

export const ordersApi = createApi({
  reducerPath: 'ordersApi',
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
  tagTypes: ['Order'],
  endpoints: (builder) => ({
    createOrder: builder.mutation<Order, void>({
      query: () => ({
        url: '/orders',
        method: 'POST',
      }),
      invalidatesTags: ['Order'],
    }),
    getOrderDetails: builder.query<Order, string>({
      query: (id) => `/orders/${id}`,
      providesTags: ['Order'],
    }),
    payOrder: builder.mutation<Order, { orderId: string; details: any }>({
      query: ({ orderId, details }) => ({
        url: `/orders/${orderId}/pay`,
        method: 'PUT',
        body: details,
      }),
      invalidatesTags: ['Order'],
    }),
    getMyOrders: builder.query<Order[], void>({
      query: () => '/orders/myorders',
      providesTags: ['Order'],
    }),
    getOrders: builder.query<Order[], void>({
      query: () => '/orders',
      providesTags: ['Order'],
    }),
    deliverOrder: builder.mutation<Order, string>({
      query: (id) => ({
        url: `/orders/${id}/deliver`,
        method: 'PUT',
      }),
      invalidatesTags: ['Order'],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetOrderDetailsQuery,
  usePayOrderMutation,
  useGetMyOrdersQuery,
  useGetOrdersQuery,
  useDeliverOrderMutation,
} = ordersApi;
