'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, ChevronRight, Loader2, AlertCircle, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { orderService } from '@/services/orderService';
import { OrderResponse } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';

// Status badge styling helper
const getStatusBadgeProps = (status: string) => {
  switch (status) {
    case 'DELIVERED':
      return { variant: 'default' as const, className: 'bg-green-600 hover:bg-green-700' };
    case 'PAID':
      return { variant: 'default' as const, className: 'bg-blue-600 hover:bg-blue-700' };
    case 'PENDING':
      return { variant: 'secondary' as const, className: '' };
    case 'CANCELLED':
      return { variant: 'destructive' as const, className: '' };
    default:
      return { variant: 'outline' as const, className: '' };
  }
};

// Format date helper
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated || !user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await orderService.getUserOrders(user.id);
        
        if (response.data) {
          setOrders(response.data);
        } else if (response.error) {
          setError(response.error);
        }
      } catch (err) {
        setError('Failed to load orders. Please try again later.');
        console.error('Error fetching orders:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, user?.id]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Order History</h2>
          <p className="text-muted-foreground">View and track your recent orders.</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading orders...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Order History</h2>
          <p className="text-muted-foreground">View and track your recent orders.</p>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            Please <Link href="/login" className="underline font-medium">log in</Link> to view your orders.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Order History</h2>
          <p className="text-muted-foreground">View and track your recent orders.</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Order History</h2>
          <p className="text-muted-foreground">View and track your recent orders.</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              You haven&apos;t placed any orders yet. Start shopping to see your orders here.
            </p>
            <Button asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Order History</h2>
        <p className="text-muted-foreground">
          View and track your recent orders.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const badgeProps = getStatusBadgeProps(order.status);
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>{order.items?.length || 0} item(s)</TableCell>
                    <TableCell>
                      <Badge variant={badgeProps.variant} className={badgeProps.className}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>${order.totalAmount?.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/orders/${order.id}`}>
                          Details
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
