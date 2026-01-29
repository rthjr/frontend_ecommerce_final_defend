'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ArrowRight, Loader2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useAppSelector, useAppDispatch } from '@/lib/redux/store';
import { removeFromCart, updateQuantity, syncCartFromBackend } from '@/lib/redux/slices/cartSlice';
import { useGetCartQuery, useRemoveFromCartMutation, useAddToCartMutation } from '@/lib/redux/api/cartApi';
import { useEffect, useMemo } from 'react';
import { toast } from 'sonner';

export default function CartPage() {
  const dispatch = useAppDispatch();
  const { userInfo } = useAppSelector((state) => state.user);
  const localCart = useAppSelector((state) => state.cart);
  
  // Only fetch from API if user is logged in
  const { data: apiCartItems, isLoading } = useGetCartQuery(undefined, {
    skip: !userInfo, // Skip API call if not logged in
  });
  
  const [removeFromCartApi, { isLoading: isRemoving }] = useRemoveFromCartMutation();
  const [addToCartApi, { isLoading: isUpdating }] = useAddToCartMutation();

  // Use API cart if logged in, otherwise use local cart
  const items = userInfo && apiCartItems ? apiCartItems : localCart.items;
  
  // Calculate prices
  const itemsPrice = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);
  
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const taxPrice = Number((itemsPrice * 0.1).toFixed(2));
  const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

  // Sync API cart to local cart when fetched (for checkout to use)
  useEffect(() => {
    if (userInfo && apiCartItems) {
      dispatch(syncCartFromBackend(apiCartItems));
    }
  }, [apiCartItems, userInfo, dispatch]);

  const handleRemoveItem = async (productId: string) => {
    if (userInfo) {
      try {
        await removeFromCartApi(productId).unwrap();
        toast.success('Item removed from cart');
      } catch {
        toast.error('Failed to remove item');
      }
    } else {
      dispatch(removeFromCart(productId));
    }
  };

  const handleUpdateQuantity = async (item: typeof items[0], newQuantity: number) => {
    if (newQuantity < 1) return;
    
    if (userInfo) {
      try {
        // Backend doesn't have update endpoint, so we re-add with new quantity
        // The backend should handle this by updating existing item
        await addToCartApi({
          productId: item.productId,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: newQuantity,
          color: item.color,
          size: item.size,
        }).unwrap();
      } catch {
        toast.error('Failed to update quantity');
      }
    } else {
      dispatch(updateQuantity({ productId: item.productId, quantity: newQuantity }));
    }
  };

  if (isLoading) {
    return (
      <div className="container flex min-h-[50vh] flex-col items-center justify-center gap-4 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading your cart...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container flex min-h-[50vh] flex-col items-center justify-center gap-4 py-12">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <ShoppingCart className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold">Your Cart is Empty</h1>
        <p className="text-muted-foreground">Looks like you haven&apos;t added anything to your cart yet.</p>
        <Button asChild>
          <Link href="/products">Start Shopping</Link>
        </Button>
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
                      <p className="font-bold">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                          disabled={item.quantity <= 1 || isUpdating}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                          disabled={isUpdating}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleRemoveItem(item.productId)}
                        disabled={isRemoving}
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
                <span>${itemsPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shippingPrice === 0 ? 'Free' : `$${shippingPrice.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>${taxPrice.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
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
              >
                <Link href="/checkout">
                  Proceed to Checkout
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
