'use client';

import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, QrCode } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/store';
import { savePaymentMethod } from '@/lib/redux/slices/cartSlice';

interface PaymentFormProps {
  nextStep: () => void;
  prevStep: () => void;
}

export default function PaymentForm({ nextStep, prevStep }: PaymentFormProps) {
  const dispatch = useAppDispatch();
  const { paymentMethod } = useAppSelector((state) => state.cart);
  const [selectedMethod, setSelectedMethod] = useState(paymentMethod || 'Cash');

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
            value="Cash"
            id="cash"
            className="peer sr-only"
          />
          <Label
            htmlFor="cash"
            className="flex cursor-pointer items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <div className="flex items-center gap-2">
              <DollarSign className="h-6 w-6" />
              <div className="grid gap-1">
                <span className="font-semibold">Cash on Delivery</span>
                <span className="text-sm text-muted-foreground">
                  Pay when you receive your order
                </span>
              </div>
            </div>
          </Label>
        </div>
        <div className="relative">
          <RadioGroupItem
            value="QR"
            id="qr"
            className="peer sr-only"
          />
          <Label
            htmlFor="qr"
            className="flex cursor-pointer items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <div className="flex items-center gap-2">
              <QrCode className="h-6 w-6" />
              <div className="grid gap-1">
                <span className="font-semibold">Bakong KHQR</span>
                <span className="text-sm text-muted-foreground">
                  Pay securely with Bakong QR code
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
