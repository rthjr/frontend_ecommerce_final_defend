'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { format } from 'date-fns';
import { Loader2, ArrowLeft, Truck, MapPin, CreditCard, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useGetOrderDetailsQuery, useDeliverOrderMutation } from '@/lib/redux/api/ordersApi';
import { toast } from 'sonner';
import Link from 'next/link';

interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const { id } = params;

  const { data: order, isLoading, error } = useGetOrderDetailsQuery(id as string);
  const [deliverOrder, { isLoading: loadingDeliver }] = useDeliverOrderMutation();

  const handleDeliver = async () => {
    if (window.confirm('Mark this order as delivered?')) {
      try {
        await deliverOrder(id as string).unwrap();
        toast.success('Order marked as delivered');
      } catch (err: any) {
        toast.error(err?.data?.message || 'Failed to update order status');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  if (error || !order) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-800">Error loading order. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Order Details</h2>
            <p className="text-sm text-muted-foreground font-mono">ID: {order._id}</p>
          </div>
        </div>
        
        {/* Status Badges */}
        <div className="flex gap-2">
          {order.isPaid ? (
            <Badge className="bg-green-600 hover:bg-green-700">
              <CreditCard className="mr-1 h-3 w-3" />
              Paid
            </Badge>
          ) : (
            <Badge variant="destructive">
              <CreditCard className="mr-1 h-3 w-3" />
              Unpaid
            </Badge>
          )}
          {order.isDelivered ? (
            <Badge className="bg-green-600 hover:bg-green-700">
              <Truck className="mr-1 h-3 w-3" />
              Delivered
            </Badge>
          ) : (
            <Badge className="bg-yellow-600 hover:bg-yellow-700">
              <Package className="mr-1 h-3 w-3" />
              Pending
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column - Order Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items ({order.orderItems.length})
              </CardTitle>
              <CardDescription>
                Ordered on {format(new Date(order.createdAt), 'MMMM d, yyyy \'at\' h:mm a')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.orderItems.map((item: OrderItem, index: number) => (
                  <div key={item.productId}>
                    <div className="flex gap-4">
                      <div className="relative h-20 w-20 overflow-hidden rounded-lg border bg-gray-100 shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="font-semibold">{item.name}</h4>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">Qty: {item.quantity}</span>
                          <span className="text-muted-foreground">×</span>
                          <span className="font-medium">${item.price.toFixed(2)}</span>
                        </div>
                        {item.color && (
                          <Badge variant="outline" className="text-xs">
                            Color: {item.color}
                          </Badge>
                        )}
                        {item.size && (
                          <Badge variant="outline" className="text-xs ml-2">
                            Size: {item.size}
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${(item.quantity * item.price).toFixed(2)}</p>
                      </div>
                    </div>
                    {index < order.orderItems.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-semibold text-lg">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p className="text-muted-foreground">{order.shippingAddress.phone}</p>
              </div>
              <Separator />
              <div className="text-muted-foreground">
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                <p className="font-medium mt-1">{order.shippingAddress.country}</p>
              </div>
              {order.isDelivered && order.deliveredAt && (
                <div className="pt-3">
                  <Badge className="bg-green-600 hover:bg-green-700">
                    Delivered on {format(new Date(order.deliveredAt), 'MMM d, yyyy \'at\' h:mm a')}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
              {order.paypalOrderId && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">PayPal Order ID</span>
                  <span className="font-mono text-sm">{order.paypalOrderId}</span>
                </div>
              )}
              {order.isPaid && order.paidAt && (
                <div className="pt-2">
                  <Badge className="bg-green-600 hover:bg-green-700">
                    Paid on {format(new Date(order.paidAt), 'MMM d, yyyy \'at\' h:mm a')}
                  </Badge>
                </div>
              )}
              {order.paymentResult && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
                  <p className="font-medium mb-2">Payment Details:</p>
                  <div className="space-y-1 text-muted-foreground">
                    <p>Transaction ID: {order.paymentResult.id}</p>
                    <p>Status: {order.paymentResult.status}</p>
                    {order.paymentResult.email_address && (
                      <p>Email: {order.paymentResult.email_address}</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Items ({order.orderItems.length})</span>
                <span className="font-medium">${order.itemsPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">${order.shippingPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium">${order.taxPrice.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">${order.totalPrice.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {order.isPaid && !order.isDelivered && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleDeliver}
                  disabled={loadingDeliver}
                  className="w-full"
                  size="lg"
                >
                  {loadingDeliver ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Truck className="mr-2 h-4 w-4" />
                      Mark as Delivered
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Order Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white">
                      ✓
                    </div>
                    <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                  </div>
                  <div className="pb-4">
                    <p className="font-medium">Order Placed</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(order.createdAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${order.isPaid ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                      {order.isPaid ? '✓' : '2'}
                    </div>
                    {!order.isDelivered && <div className="w-0.5 h-full bg-gray-200 mt-2"></div>}
                  </div>
                  <div className="pb-4">
                    <p className="font-medium">Payment {order.isPaid ? 'Confirmed' : 'Pending'}</p>
                    {order.isPaid && order.paidAt && (
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(order.paidAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${order.isDelivered ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                      {order.isDelivered ? '✓' : '3'}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">{order.isDelivered ? 'Delivered' : 'Awaiting Delivery'}</p>
                    {order.isDelivered && order.deliveredAt && (
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(order.deliveredAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
