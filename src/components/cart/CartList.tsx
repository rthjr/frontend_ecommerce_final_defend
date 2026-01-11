'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cartService, CartItemResponse } from '@/services';
import { toast } from 'sonner';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import Image from 'next/image';

interface CartListProps {
  userId: string;
  onUpdate?: () => void;
  onCheckout?: () => void;
}

export function CartList({ userId, onUpdate, onCheckout }: CartListProps) {
  const [cartItems, setCartItems] = useState<CartItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCart();
  }, [userId]);

  const fetchCart = async () => {
    setIsLoading(true);
    try {
      const response = await cartService.getCart(userId);
      if (response.error) {
        throw new Error(response.error);
      }
      setCartItems(response.data || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to fetch cart');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    if (!confirm('Are you sure you want to remove this item from cart?')) {
      return;
    }

    setUpdatingItems(prev => new Set(prev).add(productId));
    try {
      const response = await cartService.removeFromCart(userId, productId);
      if (response.error) {
        throw new Error(response.error);
      }
      toast.success('Item removed from cart');
      fetchCart();
      onUpdate?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove item');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdatingItems(prev => new Set(prev).add(productId));
    try {
      // Remove current item and add with new quantity
      await cartService.removeFromCart(userId, productId);
      await cartService.addToCart(userId, {
        productId,
        quantity: newQuantity
      });
      
      toast.success('Cart updated');
      fetchCart();
      onUpdate?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update quantity');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  const calculateTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading cart...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cart Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Shopping Cart</h2>
        </div>
        <Badge variant="secondary">
          {calculateTotalItems()} {calculateTotalItems() === 1 ? 'item' : 'items'}
        </Badge>
      </div>

      {cartItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-muted-foreground text-lg">Your cart is empty</p>
            <p className="text-sm text-muted-foreground mt-2">
              Add some products to get started!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.productId}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <div className="text-2xl">📦</div>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 space-y-2">
                      <div>
                        <h3 className="font-semibold text-lg">{item.productName}</h3>
                        <p className="text-sm text-muted-foreground">
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Quantity:</span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                            disabled={updatingItems.has(item.productId) || item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const newQty = parseInt(e.target.value) || 1;
                              handleUpdateQuantity(item.productId, newQty);
                            }}
                            className="w-16 h-8 text-center"
                            min="1"
                            disabled={updatingItems.has(item.productId)}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                            disabled={updatingItems.has(item.productId)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Item Total and Remove */}
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">
                          Total: ${item.totalPrice.toFixed(2)}
                        </span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveItem(item.productId)}
                          disabled={updatingItems.has(item.productId)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal ({calculateTotalItems()} items)</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${(calculateTotal() * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>${(calculateTotal() * 1.1).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={onCheckout}
                >
                  Proceed to Checkout
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = '/products'}
                >
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
