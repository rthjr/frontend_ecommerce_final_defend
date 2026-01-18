'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAppSelector, useAppDispatch } from '@/lib/redux/store';
import { clearCart } from '@/lib/redux/slices/cartSlice';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2, DollarSign, QrCode } from 'lucide-react';
import QRPayment from './QRPayment';

interface OrderSummaryProps {
  prevStep: () => void;
}

export default function OrderSummary({ prevStep }: OrderSummaryProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items, shippingAddress, paymentMethod, itemsPrice, shippingPrice, taxPrice, totalPrice } = useAppSelector((state) => state.cart);
  const [isLoading, setIsLoading] = useState(false);
  const [showQRPayment, setShowQRPayment] = useState(false);

  // Convert USD to KHR (assuming 1 USD = 4100 KHR)
  const convertToKHR = (usdAmount: number) => {
    return Math.round(usdAmount * 4100);
  };

  const totalAmountKHR = convertToKHR(totalPrice);

  const handleCashPayment = async () => {
    setIsLoading(true);
    try {
      // For cash payment, we just create the order and mark as pending
      // In a real implementation, you would call your order creation API here
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      dispatch(clearCart());
      router.push('/checkout/success');
      toast.success('Order placed successfully! Pay on delivery.');
    } catch (error: any) {
      toast.error('Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRPaymentComplete = (orderId: string) => {
    dispatch(clearCart());
    router.push('/checkout/success');
    toast.success('Order placed successfully! Payment completed.');
  };

  const handlePlaceOrder = () => {
    if (paymentMethod === 'Cash') {
      handleCashPayment();
    } else if (paymentMethod === 'QR') {
      setShowQRPayment(true);
    }
  };

  // Show QR Payment component if QR is selected
  if (showQRPayment && paymentMethod === 'QR') {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={() => setShowQRPayment(false)}
          className="mb-4"
        >
          ← Back to Order Summary
        </Button>
        <QRPayment
          amount={totalAmountKHR}
          onPaymentComplete={handleQRPaymentComplete}
          onBack={() => setShowQRPayment(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Shipping</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{shippingAddress?.firstName} {shippingAddress?.lastName}</p>
            <p className="text-muted-foreground">
              {shippingAddress?.street}, {shippingAddress?.city}<br />
              {shippingAddress?.state}, {shippingAddress?.zipCode}<br />
              {shippingAddress?.country}
            </p>
            <p className="mt-2 text-muted-foreground">{shippingAddress?.phone}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {paymentMethod === 'Cash' ? (
                <>
                  <DollarSign className="h-5 w-5" />
                  <span className="font-medium">Cash on Delivery</span>
                </>
              ) : (
                <>
                  <QrCode className="h-5 w-5" />
                  <span className="font-medium">Bakong KHQR</span>
                </>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {paymentMethod === 'Cash' 
                ? 'Pay when you receive your order' 
                : 'Pay securely with Bakong QR code'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-md border bg-white">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} x ${item.price.toFixed(2)}
                  </p>
                </div>
                <span className="font-medium">
                  ${(item.quantity * item.price).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Items ({items.length})</span>
              <span>${itemsPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shippingPrice === 0 ? 'Free' : `$${shippingPrice.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>${taxPrice.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total (USD)</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            {paymentMethod === 'QR' && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Total (KHR)</span>
                <span>{totalAmountKHR.toLocaleString()} KHR</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
  {/* Back – secondary action */}
  <Button
    variant="outline"
    onClick={prevStep}
    disabled={isLoading}
    className="flex items-center justify-center gap-2 sm:w-1/3"
  >
    ← Back
  </Button>

  {/* Primary action */}
  <Button
    onClick={handlePlaceOrder}
    disabled={isLoading}
    className="flex items-center justify-center gap-2 sm:w-2/3"
  >
    {isLoading ? (
      <>
        <Loader2 className="h-4 w-4 animate-spin" />
        Processing payment...
      </>
    ) : paymentMethod === 'QR' ? (
      <>
        <QrCode className="h-4 w-4" />
        Generate QR Code
      </>
    ) : (
      <>
        <DollarSign className="h-4 w-4" />
        Place Order
      </>
    )}
  </Button>
</div>

    </div>
  );
}
