'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, ShoppingCart, Users, TrendingUp, Clock } from 'lucide-react';
import { useGetOrdersQuery } from '@/lib/redux/api/ordersApi';
import { useGetProductsQuery } from '@/lib/redux/api/productsApi';
import { useGetUsersQuery } from '@/lib/redux/api/usersApi';
import { AdminRoute } from '@/components/auth/RoleBasedRoute';

export default function AdminDashboardPage() {
  return (
    <AdminRoute>
      <AdminDashboardContent />
    </AdminRoute>
  );
}

function AdminDashboardContent() {
  const { data: orders, isLoading: loadingOrders } = useGetOrdersQuery();
  const { data: products, isLoading: loadingProducts } = useGetProductsQuery({});
  const { data: users, isLoading: loadingUsers } = useGetUsersQuery();

  // Calculate stats
  const totalSales = orders?.reduce((acc, order) => acc + order.totalPrice, 0) || 0;
  const totalOrders = orders?.length || 0;
  const totalProducts = products?.length || 0;
  const totalUsers = users?.length || 0;
  const pendingOrders = orders?.filter(o => !o.isDelivered).length || 0;
  const deliveredOrders = orders?.filter(o => o.isDelivered).length || 0;

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
            <div className="text-2xl font-bold">
              {loadingOrders ? '...' : `$${totalSales.toFixed(2)}`}
            </div>
            <p className="text-xs text-muted-foreground">
              From {totalOrders} orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingOrders ? '...' : totalOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              {pendingOrders} pending, {deliveredOrders} delivered
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingProducts ? '...' : totalProducts}
            </div>
            <p className="text-xs text-muted-foreground">
              {products?.filter(p => p.stock === 0).length || 0} out of stock
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingUsers ? '...' : totalUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              {users?.filter(u => u.isAdmin).length || 0} admins
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
               {loadingOrders ? (
                 <p className="text-muted-foreground">Loading orders...</p>
               ) : orders?.slice(0, 5).map(order => (
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
               {!loadingOrders && !orders?.length && <p className="text-muted-foreground">No orders found.</p>}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Pending Orders</span>
                </div>
                <span className="font-bold">{pendingOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Delivered Orders</span>
                </div>
                <span className="font-bold">{deliveredOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-red-600" />
                  <span className="text-sm">Out of Stock</span>
                </div>
                <span className="font-bold">{products?.filter(p => p.stock === 0).length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Low Stock (&lt;10)</span>
                </div>
                <span className="font-bold">{products?.filter(p => p.stock > 0 && p.stock < 10).length || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
