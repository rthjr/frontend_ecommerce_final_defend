'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductList } from '@/components/products/ProductList';
import { OrderList } from '@/components/orders/OrderList';
import { UserList } from '@/components/auth/UserList';
import { CartList } from '@/components/cart/CartList';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp,
  DollarSign,
  Eye
} from 'lucide-react';

// Mock current user ID - in a real app, this would come from authentication
const CURRENT_USER_ID = 'user123';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const handleAddToCart = async (productId: string) => {
    try {
      const { cartService } = await import('@/services');
      const response = await cartService.addToCart(CURRENT_USER_ID, {
        productId,
        quantity: 1
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      toast.success('Product added to cart');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add to cart');
    }
  };

  const handleViewProduct = (productId: number) => {
    // Navigate to product details
    window.location.href = `/products/${productId}`;
  };

  const handleCheckout = () => {
    window.location.href = '/checkout';
  };

  const handleOrderSelect = (order: any) => {
    // Navigate to order details
    window.location.href = `/orders/${order.id}`;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">E-Commerce Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your products, orders, and customers
        </p>
      </div>

      {/* Overview Cards */}
      {activeTab === 'overview' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231.89</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12,234</div>
              <p className="text-xs text-muted-foreground">
                +19% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+573</div>
              <p className="text-xs text-muted-foreground">
                +201 since last hour
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+2,350</div>
              <p className="text-xs text-muted-foreground">
                +180.1% from last month
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="cart" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Cart
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                  Latest orders from your customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OrderList 
                  isAdmin={true}
                  onOrderSelect={handleOrderSelect}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>
                  Best selling products this month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProductList 
                  isAdmin={true}
                  onAddToCart={handleAddToCart}
                  onViewDetails={handleViewProduct}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products">
          <ProductList 
            isAdmin={true}
            onAddToCart={handleAddToCart}
            onViewDetails={handleViewProduct}
          />
        </TabsContent>

        <TabsContent value="orders">
          <OrderList 
            isAdmin={true}
            onOrderSelect={handleOrderSelect}
          />
        </TabsContent>

        <TabsContent value="cart">
          <CartList 
            userId={CURRENT_USER_ID}
            onUpdate={() => {
              // Refresh cart data
            }}
            onCheckout={handleCheckout}
          />
        </TabsContent>

        <TabsContent value="users">
          <UserList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
