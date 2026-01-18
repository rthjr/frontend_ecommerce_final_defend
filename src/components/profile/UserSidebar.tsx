'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, Plus, Settings, LogOut, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function UserSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error(error.message || 'Logout failed');
    }
  };

  const links = [
    { href: '/user/my-products', label: 'My Products', icon: Package },
    { href: '/user/my-products/add', label: 'Add Product', icon: Plus },
    { href: '/user/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-6 space-y-6">
      <div className="space-y-4">
        <Link href="/user/my-products" className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg">Product Manager</span>
        </Link>
        
        <nav className="flex flex-col gap-2">
          {links.map((link) => (
            <Button
              key={link.href}
              variant={pathname.startsWith(link.href) ? 'default' : 'ghost'}
              className="justify-start"
              asChild
            >
              <Link href={link.href}>
                <link.icon className="mr-2 h-4 w-4" />
                {link.label}
              </Link>
            </Button>
          ))}
        </nav>
      </div>

      <div className="absolute bottom-6 left-6 right-6 space-y-2">
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
