'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { ShoppingCart, User, Menu, Search, Package, ShoppingBag, SearchIcon, UserCircle, ClipboardList, LogOut, X, ChevronDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SearchBar from './SearchBar';
import { useAppSelector, useAppDispatch } from '@/lib/redux/store';
import { toggleCartDrawer, toggleMobileMenu } from '@/lib/redux/slices/uiSlice';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

function SearchBarFallback() {
  return <Skeleton className="h-10 w-full max-w-lg rounded-lg" />;
}

export default function Header() {
  const { items } = useAppSelector((state) => state.cart);
  const { isAuthenticated, user, logout, hasRole } = useAuth();
  const dispatch = useAppDispatch();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  const navLinks = [
    { href: '/products', label: 'Products', icon: Package },
    { href: '/products/search', label: 'Search', icon: SearchIcon },
  ];

  const authLinks = [
    { href: '/orders', label: 'My Orders', icon: ClipboardList },
    ...(hasRole('ROLE_USER') || hasRole('ROLE_ADMIN') ? [{ href: '/my-products', label: 'My Products', icon: Package }] : []),
  ];

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? 'glass-strong shadow-sm' 
          : 'bg-background/80 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo & Mobile Menu */}
          <div className="flex items-center gap-3">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden hover:bg-accent">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b">
                    <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                      <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        E-Shop
                      </span>
                    </Link>
                  </div>
                  <nav className="flex-1 p-4 space-y-1">
                    <Link 
                      href="/" 
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-accent transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Home
                    </Link>
                    {navLinks.map((link) => (
                      <Link 
                        key={link.href}
                        href={link.href} 
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-accent transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <link.icon className="h-4 w-4 text-muted-foreground" />
                        {link.label}
                      </Link>
                    ))}
                    <Link 
                      href="/cart" 
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-accent transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                      Cart
                      {mounted && cartItemsCount > 0 && (
                        <Badge variant="default" className="ml-auto bg-primary text-primary-foreground">
                          {cartItemsCount}
                        </Badge>
                      )}
                    </Link>
                    
                    {isAuthenticated && (
                      <>
                        <div className="my-4 border-t" />
                        <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Account
                        </p>
                        <Link 
                          href="/profile" 
                          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-accent transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <UserCircle className="h-4 w-4 text-muted-foreground" />
                          Profile
                        </Link>
                        {authLinks.map((link) => (
                          <Link 
                            key={link.href}
                            href={link.href} 
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-accent transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <link.icon className="h-4 w-4 text-muted-foreground" />
                            {link.label}
                          </Link>
                        ))}
                      </>
                    )}
                  </nav>
                  
                  <div className="p-4 border-t">
                    {isAuthenticated ? (
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <Button asChild className="w-full">
                          <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full">
                          <Link href="/register" onClick={() => setMobileMenuOpen(false)}>Create Account</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center transition-transform group-hover:scale-105">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent hidden sm:block">
                E-Shop
              </span>
            </Link>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <Suspense fallback={<SearchBarFallback />}>
              <SearchBar />
            </Suspense>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
            {isAuthenticated && authLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden hover:bg-accent">
              <Search className="h-5 w-5" />
            </Button>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-accent">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserCircle className="h-5 w-5 text-primary" />
                    </div>
                    <span className="sr-only">Profile menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 animate-scale-in">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{user?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center cursor-pointer">
                      <UserCircle className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="flex items-center cursor-pointer">
                      <ClipboardList className="mr-2 h-4 w-4" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  {(hasRole('ROLE_USER') || hasRole('ROLE_ADMIN')) && (
                    <DropdownMenuItem asChild>
                      <Link href="/my-products" className="flex items-center cursor-pointer">
                        <Package className="mr-2 h-4 w-4" />
                        My Products
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="flex items-center text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" asChild className="hidden sm:flex hover:bg-accent">
                <Link href="/login" className="gap-2">
                  <UserCircle className="h-4 w-4" />
                  Sign In
                </Link>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-accent"
              onClick={() => dispatch(toggleCartDrawer())}
            >
              <ShoppingCart className="h-5 w-5" />
              <AnimatePresence>
                {mounted && cartItemsCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -right-1 -top-1"
                  >
                    <Badge
                      variant="default"
                      className="h-5 w-5 justify-center rounded-full p-0 text-xs bg-primary text-primary-foreground"
                    >
                      {cartItemsCount > 99 ? '99+' : cartItemsCount}
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
              <span className="sr-only">Cart</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
