'use client';

import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, Wallet } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/store';
import { savePaymentMethod } from '@/lib/redux/slices/cartSlice';

interface PaymentFormProps {
  nextStep: () => void;
  prevStep: () => void;
}

export default function PaymentForm({ nextStep, prevStep }: PaymentFormProps) {
  const dispatch = useAppDispatch();
  const { paymentMethod } = useAppSelector((state) => state.cart);
  const [selectedMethod, setSelectedMethod] = useState(paymentMethod || 'Stripe');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(savePaymentMethod(selectedMethod));
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <RadioGroup
        defaultValue={selectedMethod}
        onValueChange={setSelectedMethod}
        className="grid grid-cols-1 gap-4"
      >
        <div className="relative">
          <RadioGroupItem
            value="Stripe"
            id="stripe"
            className="peer sr-only"
          />
          <Label
            htmlFor="stripe"
            className="flex cursor-pointer items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <div className="flex items-center gap-2">
              <CreditCard className="h-6 w-6" />
              <div className="grid gap-1">
                <span className="font-semibold">Credit Card</span>
                <span className="text-sm text-muted-foreground">
                  Pay securely with Stripe
                </span>
              </div>
            </div>
          </Label>
        </div>
        <div className="relative">
          <RadioGroupItem
            value="PayPal"
            id="paypal"
            className="peer sr-only"
          />
          <Label
            htmlFor="paypal"
            className="flex cursor-pointer items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <div className="flex items-center gap-2">
              <Wallet className="h-6 w-6" />
              <div className="grid gap-1">
                <span className="font-semibold">PayPal</span>
                <span className="text-sm text-muted-foreground">
                  Pay with your PayPal account
                </span>
              </div>
            </div>
          </Label>
        </div>
      </RadioGroup>

      <div className="flex gap-4">
        <div className="gap-4">
          <Button type="button" variant="outline" onClick={prevStep} className="w-full">
          Back
        </Button>
        </div>
        <div className='gap-4'>
          <Button type="submit" className="w-full">
            Continue to Review
          </Button>
        </div>
      </div>
    </form>
  );
}
