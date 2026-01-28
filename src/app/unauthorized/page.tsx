'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldX, Home, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import Link from 'next/link';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/50 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-destructive/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <motion.div 
              className="mx-auto mb-4 w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              <ShieldX className="h-10 w-10 text-destructive" />
            </motion.div>
            <CardTitle className="text-2xl font-bold">
              Access Denied
            </CardTitle>
            <CardDescription className="text-base">
              You don't have permission to access this page.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-4">
            {user && (
              <div className="p-4 rounded-lg bg-muted/50 text-center space-y-1">
                <p className="text-sm text-muted-foreground">Logged in as</p>
                <p className="font-semibold">{user.name || user.email}</p>
                <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                  {user.roles?.map((role) => (
                    <span 
                      key={role} 
                      className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                    >
                      {role.replace('ROLE_', '')}
                    </span>
                  )) || (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                      No roles assigned
                    </span>
                  )}
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <Button 
                onClick={handleGoHome}
                className="w-full h-11 gap-2"
              >
                <Home className="h-4 w-4" />
                Go to Homepage
              </Button>
              
              <Button 
                onClick={() => router.back()}
                variant="secondary"
                className="w-full h-11 gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
              
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="w-full h-11 gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
            
            <p className="text-center text-xs text-muted-foreground">
              If you believe this is an error, please{' '}
              <Link href="/help" className="text-primary hover:underline">
                contact support
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
