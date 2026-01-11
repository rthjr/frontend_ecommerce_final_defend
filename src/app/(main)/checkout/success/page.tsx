'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function SuccessPage() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-6 py-12 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
        <CheckCircle className="h-10 w-10" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Order Placed Successfully!</h1>
        <p className="text-muted-foreground">
          Thank you for your purchase. Your order has been received and is being processed.
        </p>
      </div>
      <div className="flex gap-4">
        <Button asChild variant="outline">
          <Link href="/products/search">Continue Shopping</Link>
        </Button>
        <Button asChild>
          <Link href="/profile/orders">View My Orders</Link>
        </Button>
      </div>
    </div>
  );
}
