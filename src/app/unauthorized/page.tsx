'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Home, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleGoHome = () => {
    router.push('/');
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">
            Access Denied
          </CardTitle>
          <CardDescription>
            You don't have permission to access this page.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            {user && (
              <p>
                Logged in as: <span className="font-medium">{user.name}</span>
                <br />
                Roles: <span className="font-medium">{user.roles?.join(', ') || 'None'}</span>
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={handleGoHome}
              className="w-full"
              variant="default"
            >
              <Home className="mr-2 h-4 w-4" />
              Go to Homepage
            </Button>
            
            <Button 
              onClick={handleLogout}
              className="w-full"
              variant="outline"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
          
          <div className="text-center text-xs text-muted-foreground">
            <p>If you believe this is an error, please contact your administrator.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
