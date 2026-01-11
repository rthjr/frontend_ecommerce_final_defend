'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { format } from 'date-fns';
import { Loader2, ArrowLeft, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useGetOrderDetailsQuery, useDeliverOrderMutation } from '@/lib/redux/api/ordersApi';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const { id } = params;

  const { data: order, isLoading, error } = useGetOrderDetailsQuery(id as string);
  const [deliverOrder, { isLoading: loadingDeliver }] = useDeliverOrderMutation();

  const handleDeliver = async () => {
    try {
      await deliverOrder(id as string).unwrap();
      toast.success('Order marked as delivered');
    } catch (err) {
      toast.error('Failed to update order status');
    }
  };

  if (isLoading) return <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error || !order) return <div className="py-10 text-center text-red-500">Error loading order</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">Order {order._id}</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Shipping</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">
              {order.shippingAddress.firstName} {order.shippingAddress.lastName}
            </p>
            <p className="text-muted-foreground">
              {order.shippingAddress.street}, {order.shippingAddress.city}<br />
              {order.shippingAddress.state}, {order.shippingAddress.zipCode}<br />
              {order.shippingAddress.country}
            </p>
            <div className="mt-4">
              {order.isDelivered ? (
                <Badge className="bg-green-600">Delivered at {format(new Date(order.deliveredAt!), 'MMM d, yyyy')}</Badge>
              ) : (
                <Badge variant="destructive">Not Delivered</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">Method: {order.paymentMethod}</p>
            <div className="mt-4">
              {order.isPaid ? (
                <Badge className="bg-green-600">Paid at {format(new Date(order.paidAt || order.createdAt), 'MMM d, yyyy')}</Badge>
              ) : (
                <Badge variant="destructive">Not Paid</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.orderItems.map((item) => (
                <div key={item.productId} className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-md border">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} x ${item.price} = ${(item.quantity * item.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Items</span>
              <span>${order.itemsPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>${order.shippingPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>${order.taxPrice.toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${order.totalPrice.toFixed(2)}</span>
            </div>
            
            {order.isPaid && !order.isDelivered && (
              <Button 
                onClick={handleDeliver} 
                className="w-full mt-4" 
                disabled={loadingDeliver}
              >
                {loadingDeliver && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Truck className="mr-2 h-4 w-4" />
                Mark as Delivered
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
