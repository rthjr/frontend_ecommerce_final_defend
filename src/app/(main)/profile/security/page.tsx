'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Monitor, Smartphone, Tablet, MapPin, Clock, Trash2, Shield, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import { SessionResponse } from '@/lib/types/auth';
import { useAuth } from '@/contexts/AuthContext';

export default function SecurityPage() {
  const { isAuthenticated } = useAuth();
  const [activeSessions, setActiveSessions] = useState<SessionResponse[]>([]);
  const [loginHistory, setLoginHistory] = useState<SessionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [terminatingSessionId, setTerminatingSessionId] = useState<string | null>(null);
  const [showTerminateAllDialog, setShowTerminateAllDialog] = useState(false);

  // Load sessions on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadSessions();
    }
  }, [isAuthenticated]);

  const loadSessions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [sessionsResult, historyResult] = await Promise.all([
        authService.getActiveSessions(),
        authService.getLoginHistory(),
      ]);

      if (sessionsResult.error) {
        setError(sessionsResult.error);
      } else if (sessionsResult.data) {
        setActiveSessions(sessionsResult.data);
      }

      if (historyResult.data) {
        setLoginHistory(historyResult.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    setTerminatingSessionId(sessionId);

    try {
      const result = await authService.terminateSession(sessionId);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Session terminated successfully');
        // Reload sessions to reflect changes
        await loadSessions();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to terminate session');
    } finally {
      setTerminatingSessionId(null);
    }
  };

  const handleTerminateAllOtherSessions = async () => {
    setIsLoading(true);

    try {
      const result = await authService.terminateAllOtherSessions();

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`${result.data?.count || 0} session(s) terminated successfully`);
        // Reload sessions to reflect changes
        await loadSessions();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to terminate sessions');
    } finally {
      setIsLoading(false);
      setShowTerminateAllDialog(false);
    }
  };

  // Get device icon based on user agent
  const getDeviceIcon = (deviceInfo: string) => {
    const lowerInfo = deviceInfo.toLowerCase();
    if (lowerInfo.includes('mobile') || lowerInfo.includes('android') || lowerInfo.includes('iphone')) {
      return <Smartphone className="h-5 w-5" />;
    } else if (lowerInfo.includes('tablet') || lowerInfo.includes('ipad')) {
      return <Tablet className="h-5 w-5" />;
    }
    return <Monitor className="h-5 w-5" />;
  };

  // Format device name from user agent
  const formatDeviceName = (deviceInfo: string) => {
    // Simplified device name extraction
    if (deviceInfo.includes('Chrome')) return 'Chrome Browser';
    if (deviceInfo.includes('Firefox')) return 'Firefox Browser';
    if (deviceInfo.includes('Safari')) return 'Safari Browser';
    if (deviceInfo.includes('Edge')) return 'Edge Browser';
    return 'Web Browser';
  };

  // Format relative time
  const formatRelativeTime = (isoDate: string) => {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  // Session card component
  const SessionCard = ({ session, showTerminate = true }: { session: SessionResponse; showTerminate?: boolean }) => (
    <Card className={session.current ? 'border-blue-500 bg-blue-50/50' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="mt-1">
              {getDeviceIcon(session.deviceInfo)}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{formatDeviceName(session.deviceInfo)}</h4>
                {session.current && (
                  <Badge variant="default" className="text-xs">Current</Badge>
                )}
                {session.active && !session.current && (
                  <Badge variant="outline" className="text-xs">Active</Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {session.ipAddress}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatRelativeTime(session.lastActivity)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Signed in {formatRelativeTime(session.loginTime)}
              </p>
            </div>
          </div>
          {showTerminate && !session.current && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleTerminateSession(session.id)}
              disabled={terminatingSessionId === session.id}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              {terminatingSessionId === session.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Please log in to view security settings</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security & Sessions
              </CardTitle>
              <CardDescription>
                Manage your active sessions and login history
              </CardDescription>
            </div>
            {activeSessions.filter(s => !s.current).length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowTerminateAllDialog(true)}
                disabled={isLoading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Sign Out All Other Sessions
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active Sessions ({activeSessions.length})</TabsTrigger>
          <TabsTrigger value="history">Login History</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </CardContent>
            </Card>
          ) : error ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : activeSessions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No active sessions found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {/* Show current session first */}
              {activeSessions
                .filter(s => s.current)
                .map(session => (
                  <SessionCard key={session.id} session={session} showTerminate={false} />
                ))}

              {/* Then show other sessions */}
              {activeSessions
                .filter(s => !s.current)
                .map(session => (
                  <SessionCard key={session.id} session={session} />
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </CardContent>
            </Card>
          ) : loginHistory.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No login history available</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {loginHistory.map(session => (
                <SessionCard key={session.id} session={session} showTerminate={false} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Terminate All Dialog */}
      <AlertDialog open={showTerminateAllDialog} onOpenChange={setShowTerminateAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out all other sessions?</AlertDialogTitle>
            <AlertDialogDescription>
              This will terminate all active sessions except your current one.
              You will remain signed in on this device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTerminateAllOtherSessions}
              className="bg-red-600 hover:bg-red-700"
            >
              Sign Out All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
