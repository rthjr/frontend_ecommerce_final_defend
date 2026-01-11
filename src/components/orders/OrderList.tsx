'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { orderService, OrderResponse } from '@/services';
import { toast } from 'sonner';
import { Eye, Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';

interface OrderListProps {
  userId?: string;
  isAdmin?: boolean;
  onOrderSelect?: (order: OrderResponse) => void;
}

export function OrderList({ userId, isAdmin = false, onOrderSelect }: OrderListProps) {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [userId]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      let response;
      if (userId && !isAdmin) {
        response = await orderService.getUserOrders(userId);
      } else {
        response = await orderService.getAllOrders();
      }
      
      if (response.error) {
        throw new Error(response.error);
      }
      setOrders(response.data || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsDelivered = async (orderId: number) => {
    try {
      const response = await orderService.markAsDelivered(orderId);
      if (response.error) {
        throw new Error(response.error);
      }
      toast.success('Order marked as delivered');
      fetchOrders();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update order');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'PAID':
        return <Package className="h-4 w-4" />;
      case 'DELIVERED':
        return <CheckCircle className="h-4 w-4" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PAID':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {userId && !isAdmin ? 'My Orders' : 'All Orders'}
        </h2>
        <Badge variant="secondary">{orders.length} orders</Badge>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-muted-foreground text-lg">No orders found</p>
            <p className="text-sm text-muted-foreground mt-2">
              {userId && !isAdmin ? 'You haven\'t placed any orders yet' : 'No orders in the system'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                    <CardDescription>
                      Placed on {formatDate(order.createdAt)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(order.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(order.status)}
                        <span>{order.status}</span>
                      </div>
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Order Items Summary */}
                  <div>
                    <h4 className="font-medium mb-2">Order Items</h4>
                    <div className="space-y-2">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">
                            {item.quantity}x {item.productName}
                          </span>
                          <span>${item.totalPrice.toFixed(2)}</span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-sm text-muted-foreground">
                          +{order.items.length - 3} more items
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Order Total */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total Amount:</span>
                      <span className="text-xl font-bold text-primary">
                        ${order.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Payment Information */}
                  {order.paymentResult && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">Payment Information</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Payment ID:</span>
                          <p className="font-mono text-xs">{order.paymentResult.paymentId}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <Badge 
                            variant={order.paymentResult.status === 'SUCCESS' ? 'default' : 'destructive'}
                            className="ml-2"
                          >
                            {order.paymentResult.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onOrderSelect?.(order)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    
                    {isAdmin && order.status === 'PAID' && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleMarkAsDelivered(order.id)}
                      >
                        <Truck className="h-4 w-4 mr-1" />
                        Mark as Delivered
                      </Button>
                    )}

                    {order.status === 'PENDING' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled
                      >
                        <Clock className="h-4 w-4 mr-1" />
                        Awaiting Payment
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
