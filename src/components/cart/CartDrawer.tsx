'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAppSelector, useAppDispatch } from '@/lib/redux/store';
import { setCartDrawerOpen } from '@/lib/redux/slices/uiSlice';
import { removeFromCart } from '@/lib/redux/slices/cartSlice';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';

export default function CartDrawer() {
  const { items, totalPrice } = useAppSelector((state) => state.cart);
  const { isCartDrawerOpen } = useAppSelector((state) => state.ui);
  const dispatch = useAppDispatch();

  const handleClose = () => {
    dispatch(setCartDrawerOpen(false));
  };

  return (
    <Sheet open={isCartDrawerOpen} onOpenChange={handleClose}>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-1">
          <SheetTitle>Shopping Cart ({items.length})</SheetTitle>
        </SheetHeader>
        <Separator />
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center space-y-2">
            <p className="text-muted-foreground">Your cart is empty</p>
            <Button variant="link" onClick={handleClose} asChild>
              <Link href="/products/search">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto pr-6">
              <ul className="space-y-4 py-4">
                {items.map((item) => (
                  <li key={item.productId} className="flex gap-4">
                    <div className="relative h-20 w-20 overflow-hidden rounded-md border">
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
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">${item.price}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          {item.size && `Size: ${item.size}`} {item.color && `Color: ${item.color}`}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => dispatch(removeFromCart(item.productId))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4 pr-6 pt-4">
              <Separator />
              <div className="flex justify-between text-lg font-medium">
                <span>Subtotal</span>
                <span>${totalPrice}</span>
              </div>
              <SheetFooter>
                <Button className="w-full" asChild onClick={handleClose}>
                  <Link href="/checkout">Checkout</Link>
                </Button>
              </SheetFooter>
              <Button variant="outline" className="w-full" asChild onClick={handleClose}>
                <Link href="/cart">View Cart</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
