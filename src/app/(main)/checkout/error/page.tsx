'use client';

import Link from 'next/link';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';

export default function CheckoutErrorPage() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') || 'Something went wrong with your payment.';

  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 py-12 text-center">
      <div className="rounded-full bg-red-100 p-6 text-red-600">
        <XCircle className="h-12 w-12" />
      </div>
      <h1 className="text-3xl font-bold">Payment Failed</h1>
      <p className="max-w-md text-muted-foreground">
        {reason} Please try again or contact support if the problem persists.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/checkout">Try Again</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/cart">Return to Cart</Link>
        </Button>
      </div>
    </div>
  );
}
