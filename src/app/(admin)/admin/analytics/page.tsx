'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminRoute } from '@/components/auth/RoleBasedRoute';
import { useGetOrdersQuery } from '@/lib/redux/api/ordersApi';
import { useGetProductsQuery } from '@/lib/redux/api/productsApi';
import { useGetUsersQuery } from '@/lib/redux/api/usersApi';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ShoppingBag, 
  Package, 
  Users,
  Calendar,
  BarChart3 
} from 'lucide-react';
import { useMemo } from 'react';

export default function AdminAnalyticsPage() {
  return (
    <AdminRoute>
      <AdminAnalyticsContent />
    </AdminRoute>
  );
}

function AdminAnalyticsContent() {
  const { data: orders, isLoading: loadingOrders } = useGetOrdersQuery();
  const { data: products, isLoading: loadingProducts } = useGetProductsQuery({});
  const { data: users, isLoading: loadingUsers } = useGetUsersQuery();

  // Calculate analytics data
  const analytics = useMemo(() => {
    if (!orders || !products || !users) return null;

    // Revenue calculations
    const totalRevenue = orders.reduce((acc, order) => acc + order.totalPrice, 0);
    const paidOrders = orders.filter(o => o.isPaid);
    const paidRevenue = paidOrders.reduce((acc, order) => acc + order.totalPrice, 0);
    const pendingRevenue = totalRevenue - paidRevenue;

    // Orders breakdown
    const deliveredOrders = orders.filter(o => o.isDelivered).length;
    const pendingOrders = orders.filter(o => !o.isDelivered).length;
    const totalOrders = orders.length;

    // Average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Category breakdown from orders
    const categoryRevenue: Record<string, number> = {};
    const categorySales: Record<string, number> = {};
    
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        // Find product to get category
        const product = products.find(p => p._id === item.productId);
        const category = product?.category || 'Unknown';
        categoryRevenue[category] = (categoryRevenue[category] || 0) + (item.price * item.quantity);
        categorySales[category] = (categorySales[category] || 0) + item.quantity;
      });
    });

    // Top selling products
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { name: item.name, quantity: 0, revenue: 0 };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.price * item.quantity;
      });
    });

    const topProducts = Object.entries(productSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Sales over time (last 7 days simulation based on order dates)
    const salesByDate: Record<string, { orders: number; revenue: number }> = {};
    orders.forEach(order => {
      const date = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!salesByDate[date]) {
        salesByDate[date] = { orders: 0, revenue: 0 };
      }
      salesByDate[date].orders += 1;
      salesByDate[date].revenue += order.totalPrice;
    });

    // User analytics
    const adminUsers = users.filter(u => u.isAdmin).length;
    const customerUsers = users.length - adminUsers;

    // Stock analytics
    const outOfStock = products.filter(p => p.stock === 0).length;
    const lowStock = products.filter(p => p.stock > 0 && p.stock < 10).length;
    const inStock = products.filter(p => p.stock >= 10).length;

    return {
      totalRevenue,
      paidRevenue,
      pendingRevenue,
      totalOrders,
      deliveredOrders,
      pendingOrders,
      averageOrderValue,
      categoryRevenue,
      categorySales,
      topProducts,
      salesByDate,
      totalUsers: users.length,
      adminUsers,
      customerUsers,
      totalProducts: products.length,
      outOfStock,
      lowStock,
      inStock,
    };
  }, [orders, products, users]);

  const isLoading = loadingOrders || loadingProducts || loadingUsers;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-800">Error loading analytics data. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">Detailed insights into your store performance</p>
      </div>

      {/* Revenue Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From {analytics.totalOrders} orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${analytics.paidRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {((analytics.paidRevenue / analytics.totalRevenue) * 100 || 0).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Revenue</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">${analytics.pendingRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting payment
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.averageOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Per order average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Orders & Users Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Order Status
            </CardTitle>
            <CardDescription>Breakdown of order fulfillment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Delivered</span>
                <span className="font-medium text-green-600">{analytics.deliveredOrders}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${(analytics.deliveredOrders / analytics.totalOrders) * 100 || 0}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pending</span>
                <span className="font-medium text-yellow-600">{analytics.pendingOrders}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full" 
                  style={{ width: `${(analytics.pendingOrders / analytics.totalOrders) * 100 || 0}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Distribution
            </CardTitle>
            <CardDescription>Customer vs Admin accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Customers</span>
                <span className="font-medium">{analytics.customerUsers}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(analytics.customerUsers / analytics.totalUsers) * 100 || 0}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Admins</span>
                <span className="font-medium">{analytics.adminUsers}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${(analytics.adminUsers / analytics.totalUsers) * 100 || 0}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Inventory Status
            </CardTitle>
            <CardDescription>Product stock levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">In Stock (&ge;10)</span>
                <span className="font-medium text-green-600">{analytics.inStock}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Low Stock (&lt;10)</span>
                <span className="font-medium text-yellow-600">{analytics.lowStock}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Out of Stock</span>
                <span className="font-medium text-red-600">{analytics.outOfStock}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2 flex overflow-hidden">
                <div 
                  className="bg-green-600 h-2" 
                  style={{ width: `${(analytics.inStock / analytics.totalProducts) * 100 || 0}%` }}
                />
                <div 
                  className="bg-yellow-600 h-2" 
                  style={{ width: `${(analytics.lowStock / analytics.totalProducts) * 100 || 0}%` }}
                />
                <div 
                  className="bg-red-600 h-2" 
                  style={{ width: `${(analytics.outOfStock / analytics.totalProducts) * 100 || 0}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products & Category Revenue */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Selling Products
            </CardTitle>
            <CardDescription>Best performers by revenue</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No sales data available</p>
            ) : (
              <div className="space-y-4">
                {analytics.topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.quantity} sold</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${product.revenue.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Revenue by Category
            </CardTitle>
            <CardDescription>Sales distribution across categories</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(analytics.categoryRevenue).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No category data available</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(analytics.categoryRevenue)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([category, revenue]) => {
                    const percentage = (revenue / analytics.totalRevenue) * 100;
                    const sales = analytics.categorySales[category] || 0;
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">{category}</span>
                          <span className="text-sm text-muted-foreground">${revenue.toFixed(2)} ({sales} items)</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Sales Activity
          </CardTitle>
          <CardDescription>Orders and revenue by date</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(analytics.salesByDate).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No sales activity data available</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Object.entries(analytics.salesByDate)
                .slice(-8)
                .map(([date, data]) => (
                  <div key={date} className="p-4 rounded-lg border bg-card">
                    <p className="text-sm font-medium">{date}</p>
                    <p className="text-2xl font-bold">${data.revenue.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{data.orders} order(s)</p>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
