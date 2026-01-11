'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, ShoppingCart, Users } from 'lucide-react';
import { useGetOrdersQuery } from '@/lib/redux/api/ordersApi';
import { useGetProductsQuery } from '@/lib/redux/api/productsApi';

export default function AdminDashboardPage() {
  const { data: orders, isLoading: loadingOrders } = useGetOrdersQuery();
  const { data: products, isLoading: loadingProducts } = useGetProductsQuery({});

  // Calculate stats
  const totalSales = orders?.reduce((acc, order) => acc + order.totalPrice, 0) || 0;
  const totalOrders = orders?.length || 0;
  const totalProducts = products?.length || 0;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSales.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              (User API not implemented)
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
               {/* Placeholder for recent orders list */}
               {orders?.slice(0, 5).map(order => (
                 <div key={order._id} className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{order.user}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.orderItems.length} items
                      </p>
                    </div>
                    <div className="ml-auto font-medium">+${order.totalPrice.toFixed(2)}</div>
                 </div>
               ))}
               {!orders?.length && <p className="text-muted-foreground">No orders found.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
