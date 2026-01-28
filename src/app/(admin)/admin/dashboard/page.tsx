'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { AdminRoute } from '@/components/auth/RoleBasedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetOrdersQuery } from '@/lib/redux/api/ordersApi';
import { useGetProductsQuery } from '@/lib/redux/api/productsApi';
import { useGetUsersQuery } from '@/lib/redux/api/usersApi';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign,
  TrendingUp,
  Settings,
  Clock
} from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <AdminRoute>
      <AdminDashboardContent />
    </AdminRoute>
  );
}

function AdminDashboardContent() {
  const { user } = useAuth();
  const { data: orders, isLoading: loadingOrders } = useGetOrdersQuery();
  const { data: products, isLoading: loadingProducts } = useGetProductsQuery({});
  const { data: users, isLoading: loadingUsers } = useGetUsersQuery();

  // Calculate real stats from API data
  const totalRevenue = orders?.reduce((acc, order) => acc + order.totalPrice, 0) || 0;
  const totalOrders = orders?.length || 0;
  const totalProducts = products?.length || 0;
  const totalUsers = users?.length || 0;
  const pendingOrders = orders?.filter(o => !o.isDelivered).length || 0;
  const deliveredOrders = orders?.filter(o => o.isDelivered).length || 0;
  const paidOrders = orders?.filter(o => o.isPaid).length || 0;

  const isLoading = loadingOrders || loadingProducts || loadingUsers;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}! Manage your e-commerce platform.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingOrders ? (
                <span className="animate-pulse">Loading...</span>
              ) : (
                `$${totalRevenue.toFixed(2)}`
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              From {paidOrders} paid orders
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingOrders ? (
                <span className="animate-pulse">Loading...</span>
              ) : (
                totalOrders
              )}
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
              {loadingProducts ? (
                <span className="animate-pulse">Loading...</span>
              ) : (
                totalProducts
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {products?.filter(p => p.stock === 0).length || 0} out of stock
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingUsers ? (
                <span className="animate-pulse">Loading...</span>
              ) : (
                totalUsers
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {users?.filter(u => u.isAdmin).length || 0} administrators
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/products">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Manage Products
              </CardTitle>
              <CardDescription>
                Add, edit, or remove products from your inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total products</span>
                <span className="font-semibold">{totalProducts}</span>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/admin/orders">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                View Orders
              </CardTitle>
              <CardDescription>
                Manage customer orders and fulfillment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3 text-yellow-600" /> Pending
                </span>
                <span className="font-semibold">{pendingOrders}</span>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/admin/users">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total users</span>
                <span className="font-semibold">{totalUsers}</span>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Card className="cursor-not-allowed opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Analytics
            </CardTitle>
            <CardDescription>
              View sales reports and analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-not-allowed opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Settings
            </CardTitle>
            <CardDescription>
              Configure system settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
