'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function RoleBasedRedirect() {
  const { isAuthenticated, isAdmin, isUser, isCustomer, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect if still loading or if user is not authenticated
    if (isLoading || !isAuthenticated) return;

    // Don't redirect if already on the correct page
    const currentPath = pathname;

    // Check if user is on auth pages and should be redirected
    if (currentPath.startsWith('/login') || currentPath.startsWith('/register')) {
      // Redirect based on role
      if (isAdmin()) {
        router.push('/admin/dashboard');
      } else if (isUser()) {
        router.push('/user/my-products');
      } else if (isCustomer()) {
        router.push('/');
      }
    }

    // Check if user is trying to access wrong section
    if (isAdmin() && !currentPath.startsWith('/admin')) {
      // Admin trying to access non-admin pages
      if (currentPath === '/' || currentPath.startsWith('/profile') || currentPath.startsWith('/products')) {
        // Allow admins to access main pages too, or redirect to admin dashboard
        // router.push('/admin/dashboard');
      }
    }

    if (isCustomer() && currentPath.startsWith('/admin')) {
      // Customer trying to access admin pages
      router.push('/unauthorized');
    }

    if (isUser() && currentPath.startsWith('/admin')) {
      // Regular user trying to access admin pages
      router.push('/unauthorized');
    }
  }, [isAuthenticated, isAdmin, isUser, isCustomer, isLoading, router, pathname]);

  // This component doesn't render anything
  return null;
}
