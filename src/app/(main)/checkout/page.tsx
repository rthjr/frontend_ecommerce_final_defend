'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, DollarSign, QrCode, MapPin, ShoppingCart } from 'lucide-react';
import ShippingForm from '@/components/checkout/ShippingForm';
import PaymentForm from '@/components/checkout/PaymentForm';
import OrderSummary from '@/components/checkout/OrderSummary';
import { useAppSelector } from '@/lib/redux/store';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';

const steps = [
  { id: 1, name: 'Shipping', icon: MapPin, description: 'Delivery address' },
  { id: 2, name: 'Payment', icon: DollarSign, description: 'Payment method' },
  { id: 3, name: 'Review', icon: Check, description: 'Confirm order' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items } = useAppSelector((state) => state.cart);
  const { isAuthenticated, user, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/checkout');
    }
  }, [items, router, isAuthenticated, isLoading]);

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  if (items.length === 0 || isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
        <div className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Checkout</h1>
                <p className="text-muted-foreground">Complete your order in a few simple steps</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <Card className="mb-8 border-0 shadow-sm bg-white/80 backdrop-blur">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center text-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        currentStep >= step.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <step.icon className="h-5 w-5" />
                    </div>
                    <span className="mt-2 text-sm font-medium">{step.name}</span>
                    <span className="text-xs text-muted-foreground">{step.description}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`mx-6 h-[2px] w-16 transition-all duration-300 ${
                        currentStep > step.id ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Checkout Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="p-8">
                {currentStep === 1 && <ShippingForm nextStep={nextStep} />}
                {currentStep === 2 && <PaymentForm nextStep={nextStep} prevStep={prevStep} />}
                {currentStep === 3 && <OrderSummary prevStep={prevStep} />}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg bg-white sticky top-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="relative h-12 w-12 overflow-hidden rounded-md border bg-white">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} x ${item.price}
                        </p>
                      </div>
                      <span className="text-sm font-semibold">
                        ${(item.quantity * item.price).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Items ({items.length})</span>
                    <span>${items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span className="text-primary">
                      ${items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
