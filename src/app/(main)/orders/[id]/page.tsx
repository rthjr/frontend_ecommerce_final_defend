'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { ArrowLeft, Package, MapPin, CreditCard, Loader2, AlertCircle, Truck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { orderService } from '@/services/orderService';
import { OrderResponse } from '@/lib/types';

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
    month: 'long',
    day: 'numeric',
  });
};

// Default placeholder image
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=400&auto=format&fit=crop';

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('Invalid order ID');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await orderService.getOrderById(Number(orderId));
        
        if (response.data) {
          setOrder(response.data);
        } else if (response.error) {
          setError(response.error);
        }
      } catch (err) {
        setError('Failed to load order details. Please try again later.');
        console.error('Error fetching order:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-20 w-20 rounded-md" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-48 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Order Details</h2>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || 'Order not found'}</AlertDescription>
        </Alert>
        <Button asChild>
          <Link href="/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  const badgeProps = getStatusBadgeProps(order.status);

  // Use backend values when available, otherwise calculate
  const itemsSubtotal = order.items?.reduce((sum, item) => sum + (item.totalPrice || item.price * item.quantity), 0) || 0;
  const subtotal = order.itemsPrice ?? itemsSubtotal;
  const shipping = order.shippingPrice ?? 0;
  const tax = order.taxPrice ?? (subtotal * 0.1);
  const total = order.totalAmount || (subtotal + shipping + tax);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Order #{order.id}</h2>
          <p className="text-muted-foreground">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="ml-auto">
          <Badge variant={badgeProps.variant} className={badgeProps.className}>
            {order.status}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items ({order.items?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <div key={item.productId || index} className="flex gap-4">
                    <div className="relative h-20 w-20 overflow-hidden rounded-md border">
                      <Image
                        src={item.imageUrl || DEFAULT_IMAGE}
                        alt={item.productName || 'Product'}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{item.productName || `Product #${item.productId}`}</h4>
                        <p className="font-bold">${item.price?.toFixed(2)}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Subtotal: ${(item.totalPrice || item.price * item.quantity)?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No items in this order</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (est.)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Order Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={badgeProps.variant} className={badgeProps.className}>
                  {order.status}
                </Badge>
              </div>
              {order.updatedAt && (
                <p className="text-sm text-muted-foreground">
                  Last updated: {formatDate(order.updatedAt)}
                </p>
              )}
              
              {/* Order Timeline */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${order.status !== 'CANCELLED' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Order Placed</p>
                    <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${order.isPaid ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Payment {order.isPaid ? 'Confirmed' : 'Pending'}</p>
                    {order.paidAt && <p className="text-xs text-muted-foreground">{formatDate(order.paidAt)}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${order.isDelivered ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    <Truck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Delivery {order.isDelivered ? 'Completed' : 'Pending'}</p>
                    {order.deliveredAt && <p className="text-xs text-muted-foreground">{formatDate(order.deliveredAt)}</p>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.shippingAddress ? (
                <div className="space-y-1 text-sm">
                  <p className="font-medium">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </p>
                  <p className="text-muted-foreground">{order.shippingAddress.street}</p>
                  <p className="text-muted-foreground">
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                  </p>
                  <p className="text-muted-foreground">{order.shippingAddress.country}</p>
                  {order.shippingAddress.phone && (
                    <p className="text-muted-foreground pt-2">📞 {order.shippingAddress.phone}</p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No shipping address available</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.paymentMethod && (
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Method</p>
                    <p className="text-sm font-medium capitalize">{order.paymentMethod}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  <Badge variant={order.isPaid ? 'default' : 'secondary'} className={order.isPaid ? 'bg-green-600' : ''}>
                    {order.isPaid ? 'Paid' : 'Pending'}
                  </Badge>
                </div>
                {order.paymentResult && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">Transaction ID</p>
                      <p className="text-sm font-mono">{order.paymentResult.paymentId}</p>
                    </div>
                    {order.paymentResult.emailAddress && (
                      <div>
                        <p className="text-sm text-muted-foreground">Payer Email</p>
                        <p className="text-sm">{order.paymentResult.emailAddress}</p>
                      </div>
                    )}
                  </>
                )}
                {!order.paymentMethod && !order.paymentResult && (
                  <p className="text-muted-foreground text-sm">Payment pending</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
