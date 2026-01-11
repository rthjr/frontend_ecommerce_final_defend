'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Package, MapPin, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function ProfileSidebar() {
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();

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
        {isAuthenticated && (
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
