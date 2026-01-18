'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Package, MapPin, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { authService } from '@/services';

export default function ProfileSidebar() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading, logout } = useAuth();

  // Fallback check for localStorage in case context hasn't initialized yet
  const hasToken = authService.getAccessToken() !== null;
  const shouldShowLogout = isAuthenticated || hasToken;

  // Show loading state while auth is being initialized
  if (isLoading && !hasToken) {
    return (
      <aside className="space-y-4">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      </aside>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error(error.message || 'Logout failed');
    }
  };

  const links = [
    { href: '/profile', label: 'Profile', icon: User },
    { href: '/profile/orders', label: 'Orders', icon: Package },
    { href: '/profile/addresses', label: 'Addresses', icon: MapPin },
    { href: '/profile/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="space-y-4">
      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <Button
            key={link.href}
            variant={pathname === link.href ? 'default' : 'ghost'}
            className="justify-start"
            asChild
          >
            <Link href={link.href}>
              <link.icon className="mr-2 h-4 w-4" />
              {link.label}
            </Link>
          </Button>
        ))}
        
        {/* Only show logout button if user is authenticated */}
        {shouldShowLogout && (
          <div className="pt-2 border-t">
            <Button
              variant="ghost"
              className="justify-start text-red-600 hover:bg-red-50 hover:text-red-700 w-full"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
            <div className="text-xs text-muted-foreground mt-2 text-center">
              Logs out from both JWT and OAuth2
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
}
