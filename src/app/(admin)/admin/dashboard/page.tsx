'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AdminRoute } from '@/components/auth/RoleBasedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign,
  TrendingUp,
  Settings
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAdmin()) {
      router.push('/unauthorized');
    }
  }, [isLoading, isAdmin, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AdminRoute>
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
              <div className="text-2xl font-bold">$45,231.89</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12,234</div>
              <p className="text-xs text-muted-foreground">+19% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+573</div>
              <p className="text-xs text-muted-foreground">+201 since last hour</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+2,350</div>
              <p className="text-xs text-muted-foreground">+180.1% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Manage Products
              </CardTitle>
              <CardDescription>
                Add, edit, or remove products from your inventory
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                View Orders
              </CardTitle>
              <CardDescription>
                Manage customer orders and fulfillment
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Analytics
              </CardTitle>
              <CardDescription>
                View sales reports and analytics
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Settings
              </CardTitle>
              <CardDescription>
                Configure system settings and preferences
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </AdminRoute>
  );
}
