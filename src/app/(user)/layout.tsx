'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { UserSidebar } from '@/components/profile/UserSidebar';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { hasRole } = useAuth();
  const router = useRouter();

  // useEffect(() => {
  //   // Allow access for ROLE_USER or ROLE_ADMIN
  //   if (!hasRole('ROLE_USER') && !hasRole('ROLE_ADMIN')) {
  //     router.push('/unauthorized');
  //   }
  // }, [hasRole, router]);

  if (!hasRole('ROLE_USER') && !hasRole('ROLE_ADMIN')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {children}
      </div>
    </div>
  );
}
