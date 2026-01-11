'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Calendar, LogOut, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error(error.message || 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <User className="h-5 w-5" />
              Not Logged In
            </CardTitle>
            <CardDescription>
              Please log in to view your profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                You need to be logged in to access your profile
              </div>
              <div className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <a href="/register" className="text-primary hover:underline">
                  Sign up
                </a>
              </div>
            </div>
            <Button asChild className="w-full">
              <a href="/login" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Go to Login
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Your account details and settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  Full Name
                </div>
                <p className="font-medium">{user.name}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  Email Address
                </div>
                <p className="font-medium">{user.email}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Account Status
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={user.enabled ? "default" : "secondary"}>
                    {user.enabled ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Settings className="h-4 w-4" />
                  Roles
                </div>
                <div className="flex gap-1">
                  {user.roles.map((role) => (
                    <Badge key={role} variant="outline">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
              <div className="text-sm text-muted-foreground">
                Last login: {new Date().toLocaleDateString()}
              </div>
              <Button 
                variant="destructive" 
                onClick={handleLogout}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <LogOut className="mr-2 h-4 w-4 animate-spin" />
                    Logging out...
                  </>
                ) : (
                  <>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Account Activity</CardTitle>
            <CardDescription>
              Your recent account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">User ID</div>
                <p className="font-mono text-sm">{user.id}</p>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Account Created</div>
                <p className="text-sm">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Last Updated</div>
                <p className="text-sm">
                  {new Date(user.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
