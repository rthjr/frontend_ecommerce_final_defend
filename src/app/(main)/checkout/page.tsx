'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, CreditCard, MapPin, ShoppingCart } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import ShippingForm from '@/components/checkout/ShippingForm';
import PaymentForm from '@/components/checkout/PaymentForm';
import OrderSummary from '@/components/checkout/OrderSummary';
import { useAppSelector } from '@/lib/redux/store';
import { Card, CardContent } from '@/components/ui/card';

const steps = [
  { id: 1, name: 'Shipping', icon: MapPin, description: 'Delivery address' },
  { id: 2, name: 'Payment', icon: CreditCard, description: 'Payment method' },
  { id: 3, name: 'Review', icon: Check, description: 'Confirm order' },
];

import { PayPalScriptProvider } from '@paypal/react-paypal-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function CheckoutPage() {
  const router = useRouter();
  const { items } = useAppSelector((state) => state.cart);
  const { userInfo } = useAppSelector((state) => state.user);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
    // if (!userInfo) {
    //   router.push('/login?redirect=/checkout');
    // }
  }, [items, router, userInfo]);

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
        <div className="py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <ShoppingCart className="h-6 w-6 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Checkout
              </h1>
              <ShoppingCart className="h-6 w-6 text-primary" />
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Complete your order in just a few simple steps
            </p>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        {/* Progress Steps */}
        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="p-8">
            <div className="flex items-center justify-center flex-wrap gap-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="text-center">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 mx-auto mb-2 ${
                        currentStep >= step.id
                          ? 'border-primary bg-primary text-primary-foreground shadow-lg'
                          : 'border-muted bg-background text-muted-foreground'
                      }`}
                    >
                      <step.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <span
                        className={`font-semibold text-sm ${
                          currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        {step.name}
                      </span>
                      <p className={`text-xs ${
                        currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'
                      }`}>
                        {step.description}
                      </p>
                    </div>
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
                <PayPalScriptProvider
                  options={{
                    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test',
                    currency: 'USD',
                  }}
                >
                  <Elements stripe={stripePromise}>
                    {currentStep === 1 && <ShippingForm nextStep={nextStep} />}
                    {currentStep === 2 && <PaymentForm nextStep={nextStep} prevStep={prevStep} />}
                    {currentStep === 3 && <OrderSummary prevStep={prevStep} />}
                  </Elements>
                </PayPalScriptProvider>
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
