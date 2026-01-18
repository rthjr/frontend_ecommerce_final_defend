'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface RoleBasedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
  requireAuth?: boolean;
  redirectTo?: string;
}

export default function RoleBasedRoute({ 
  children, 
  requiredRoles = [], 
  requireAuth = true,
  redirectTo = '/login'
}: RoleBasedRouteProps) {
  const { isAuthenticated, user, hasAnyRole, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Check if authentication is required and user is not authenticated
    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // Check if user has required roles
    if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
      // Redirect unauthorized users to appropriate page
      if (isAuthenticated) {
        router.push('/unauthorized');
      } else {
        router.push(redirectTo);
      }
      return;
    }
  }, [isAuthenticated, user, hasAnyRole, requiredRoles, requireAuth, redirectTo, isLoading, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render if not authenticated or doesn't have required roles
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return null;
  }

  return <>{children}</>;
}

// Specific role components for easier usage
export function AdminRoute({ children }: { children: ReactNode }) {
  return (
    <RoleBasedRoute requiredRoles={['ROLE_ADMIN']}>
      {children}
    </RoleBasedRoute>
  );
}

export function UserRoute({ children }: { children: ReactNode }) {
  return (
    <RoleBasedRoute requiredRoles={['ROLE_USER']}>
      {children}
    </RoleBasedRoute>
  );
}

export function CustomerRoute({ children }: { children: ReactNode }) {
  return (
    <RoleBasedRoute requiredRoles={['ROLE_CUSTOMER']}>
      {children}
    </RoleBasedRoute>
  );
}

export function AuthenticatedRoute({ children }: { children: ReactNode }) {
  return (
    <RoleBasedRoute requireAuth={true}>
      {children}
    </RoleBasedRoute>
  );
}
