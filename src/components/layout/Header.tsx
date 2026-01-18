'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, User, Menu, Search, Package, ShoppingBag, SearchIcon, UserCircle, ClipboardList, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SearchBar from './SearchBar';
import { useAppSelector, useAppDispatch } from '@/lib/redux/store';
import { toggleCartDrawer, toggleMobileMenu } from '@/lib/redux/slices/uiSlice';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export default function Header() {
  const { items } = useAppSelector((state) => state.cart);
  const { isAuthenticated, user, logout, hasRole } = useAuth();
  const dispatch = useAppDispatch();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      window.location.href = '/';  
    } catch (error: any) {
      toast.error(error.message || 'Logout failed');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-[1250px] mx-auto border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="flex flex-col gap-4">
                <Link href="/" className="text-lg font-semibold">
                  Home
                </Link>
                <Link href="/products" className="text-lg font-semibold">
                  Products
                </Link>
                <Link href="/products/search" className="text-lg font-semibold">
                  Search
                </Link>
                <Link href="/cart" className="text-lg font-semibold">
                  Cart
                </Link>
                {isAuthenticated && (
                  <>
                    <Link href="/profile" className="text-lg font-semibold">
                      Profile
                    </Link>
                    <Link href="/orders" className="text-lg font-semibold">
                      My Orders
                    </Link>
                    {(hasRole('ROLE_USER') || hasRole('ROLE_ADMIN')) && (
                      <Link href="/my-products" className="text-lg font-semibold">
                        My Products
                      </Link>
                    )}
                  </>
                )}
                <Link href="/about" className="text-lg font-semibold">
                  About
                </Link>
                <Link href="/contact" className="text-lg font-semibold">
                  Contact
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">E-Shop</span>
          </Link>
        </div>

        <div className="hidden md:flex md:flex-1 md:items-center md:justify-center md:px-8">
          <SearchBar />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          <Link href="/products" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
            <Package className="h-4 w-4" />
            Products
          </Link>
          <Link href="/products/search" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
            <SearchIcon className="h-4 w-4" />
            Search
          </Link>
          <Link href="/cart" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
            <ShoppingBag className="h-4 w-4" />
            Cart
          </Link>
          {isAuthenticated && (
            <>
              <Link href="/orders" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
                <ClipboardList className="h-4 w-4" />
                My Orders
              </Link>
              {(hasRole('ROLE_USER') || hasRole('ROLE_ADMIN')) && (
                <Link href="/my-products" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
                  <Package className="h-4 w-4" />
                  My Products
                </Link>
              )}
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
          </Button>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <UserCircle className="h-5 w-5" />
                  <span className="sr-only">Profile menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5 text-sm font-medium">
                  {user?.name || user?.email}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <UserCircle className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders" className="flex items-center">
                    <ClipboardList className="mr-2 h-4 w-4" />
                    My Orders
                  </Link>
                </DropdownMenuItem>
                {(hasRole('ROLE_USER') || hasRole('ROLE_ADMIN')) && (
                  <DropdownMenuItem asChild>
                    <Link href="/my-products" className="flex items-center">
                      <Package className="mr-2 h-4 w-4" />
                      My Products
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="flex items-center">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="icon" asChild>
              <Link href="/login">
                <UserCircle className="h-5 w-5" />
                <span className="sr-only">Login</span>
              </Link>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => dispatch(toggleCartDrawer())}
          >
            <ShoppingCart className="h-5 w-5" />
            {mounted && cartItemsCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -right-1 -top-1 h-5 w-5 justify-center rounded-full p-0 text-xs"
              >
                {cartItemsCount}
              </Badge>
            )}
            <span className="sr-only">Cart</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
