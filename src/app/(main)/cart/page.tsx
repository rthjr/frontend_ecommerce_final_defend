'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useAppSelector, useAppDispatch } from '@/lib/redux/store';
import { removeFromCart, updateQuantity } from '@/lib/redux/slices/cartSlice';

export default function CartPage() {
  const { items, itemsPrice, shippingPrice, taxPrice, totalPrice } = useAppSelector((state) => state.cart);
  const dispatch = useAppDispatch();

  // Check if any items in cart are out of stock
  const hasOutOfStockItems = items.some(item => {
    // This would need to be checked against current product data
    // For now, we'll assume items with quantity 0 are out of stock
    return item.quantity <= 0;
  });

  if (items.length === 0) {
    return (
      <div className="container flex min-h-[50vh] flex-col items-center justify-center gap-4 py-12">
        <h1 className="text-3xl font-bold">Your Cart is Empty</h1>
        <p className="text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
        <Button asChild>
          <Link href="/products/search">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  if (hasOutOfStockItems) {
    return (
      <div className="container flex min-h-[50vh] flex-col items-center justify-center gap-4 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Cart Contains Out-of-Stock Items</h1>
          <p className="text-muted-foreground mb-6">
            Some items in your cart are no longer available. Please remove them before proceeding to checkout.
          </p>
          <Button asChild>
            <Link href="/cart">Review Cart</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Cart Items ({items.length})</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-4">
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold">
                          <Link href={`/products/${item.productId}`} className="hover:underline">
                            {item.name}
                          </Link>
                        </h3>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {item.size && <span className="mr-2">Size: {item.size}</span>}
                          {item.color && <span>Color: {item.color}</span>}
                        </div>
                      </div>
                      <p className="font-bold">${item.price}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: Math.max(1, item.quantity - 1) }))}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity + 1 }))}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => dispatch(removeFromCart(item.productId))}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${itemsPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shippingPrice === 0 ? 'Free' : `$${shippingPrice}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>${taxPrice}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${totalPrice}</span>
              </div>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input placeholder="Promo code" />
                  <Button variant="outline">Apply</Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                size="lg" 
                asChild
                disabled={hasOutOfStockItems}
              >
                <Link href="/checkout">
                  {hasOutOfStockItems ? 'Remove Out-of-Stock Items' : 'Proceed to Checkout'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
