'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { QrCode, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { qrPaymentService, QROrderResponse } from '@/services/qrPaymentService';
import { useAppSelector } from '@/lib/redux/store';

interface QRPaymentProps {
  amount: number;
  onPaymentComplete: (orderId: string) => void;
  onBack: () => void;
}

export default function QRPayment({ amount, onPaymentComplete, onBack }: QRPaymentProps) {
  const [orderData, setOrderData] = useState<QROrderResponse | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('UNPAID');
  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);
  const { items } = useAppSelector((state) => state.cart);

  const generateQRCode = async () => {
    // Prevent multiple QR code generations
    if (qrGenerated) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await qrPaymentService.createOrder(amount);

      if (response.data) {
        setOrderData(response.data);
        setPaymentStatus(response.data.status);
        setQrGenerated(true);
        toast.success('QR code generated successfully');
      } else {
        toast.error(response.error || 'Failed to generate QR code');
      }
    } catch (error) {
      toast.error('Failed to generate QR code');
    } finally {
      setIsLoading(false);
    }
  };

  const startPaymentPolling = () => {
    if (!orderData) return;

    setIsPolling(true);
    toast.info('Checking payment status...');

    qrPaymentService.pollPaymentStatus(
      orderData.order_id,
      (status) => {
        setPaymentStatus(status);
        if (status === 'PAID') {
          toast.success('Payment completed successfully!');
          onPaymentComplete(orderData.order_id);
        }
      },
      30, // max attempts (1 minute with 2-second intervals)
      2000 // 2-second intervals
    ).then(({ success, status }) => {
      setIsPolling(false);

      if (!success && status !== 'PAID') {
        if (status === 'TIMEOUT') {
          toast.error('Payment timeout. Please try again.');
        } else {
          toast.error('Payment check failed. Please try again.');
        }
      }
    });
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'PAID':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'UNPAID':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    switch (paymentStatus) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'UNPAID':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Generating QR code...</p>
        </CardContent>
      </Card>
    );
  }

  // Show initial Generate QR button
  if (!orderData && !qrGenerated) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <QrCode className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Generate QR Payment</h3>
          <p className="text-muted-foreground mb-6">
            Click the button below to generate a Bakong QR code for your payment
          </p>
          <Button onClick={generateQRCode} className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <QrCode className="h-4 w-4 mr-2" />
                Generate QR Code
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!orderData && qrGenerated) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <p className="text-red-600 mb-4">Failed to generate QR code</p>
          <Button onClick={generateQRCode} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Bakong KHQR Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* QR Code Display */}
          <div className="flex justify-center">
            <div className="border-2 border-gray-200 rounded-lg">
              <img
                src={orderData?.qr_image || ''}
                alt="Payment QR Code"
                className="w-64 h-64 object-contain"
              />
            </div>
          </div>

          {/* Order Info */}
          {/* <div className="space-y-2 text-center">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Order ID:</span>
              <span className="font-mono text-sm">{orderData?.order_id || ''}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Amount:</span>
              <span className="font-semibold">{orderData?.amount?.toLocaleString() || 0} KHR</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Status:</span>
              <Badge className={getStatusColor()}>
                <div className="flex items-center gap-1">
                  {getStatusIcon()}
                  {paymentStatus}
                </div>
              </Badge>
            </div>
          </div> */}

          {/* Instructions */}
          <div className="text-sm text-gray-600 space-y-2">
            <p>1. Open your Bakong app</p>
            <p>2. Scan the QR code above</p>
            <p>3. Confirm payment</p>
            <p>4. Wait for payment confirmation</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            {/* Back button – secondary action */}
            <Button
              variant="outline"
              onClick={onBack}
              disabled={isPolling}
              className="flex items-center justify-center gap-2 sm:w-1/3"
            >
              ← Back
            </Button>

            {/* Payment status / action */}
            <Button
              onClick={startPaymentPolling}
              disabled={isPolling || paymentStatus === 'PAID'}
              className={`flex items-center justify-center gap-2 sm:w-2/3
      ${paymentStatus === 'PAID' ? 'bg-green-600 hover:bg-green-600' : ''}
    `}
            >
              {paymentStatus === 'PAID' ? (
                <>
                  ✅ Payment Confirmed
                </>
              ) : isPolling ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Checking payment...
                </>
              ) : (
                'Check Payment Status'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
