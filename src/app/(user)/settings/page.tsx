'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  User, Bell, Shield, Loader2, Eye, EyeOff, Download, Trash2, AlertTriangle,
  Monitor, Smartphone, Tablet, Globe, Clock, LogOut, History
} from 'lucide-react';
import { userService, UserDataExport, SessionInfo } from '@/services/userService';
import { ProfileUpdateRequest, PasswordChangeRequest } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function UserSettingsPage() {
  const { user, isUser, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Session management state
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loginHistory, setLoginHistory] = useState<SessionInfo[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [terminatingSessionId, setTerminatingSessionId] = useState<string | null>(null);
  const [isTerminatingAll, setIsTerminatingAll] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteReason, setDeleteReason] = useState('');

  useEffect(() => {
    if (!isUser()) {
      return;
    }

    if (user) {
      const nameParts = (user.name || '').split(' ');
      setFormData({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        phone: '',
      });
      
      // Load sessions
      loadSessions();
    }
  }, [user, isUser]);

  const loadSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const [activeResponse, historyResponse] = await Promise.all([
        userService.getActiveSessions(),
        userService.getLoginHistory()
      ]);
      
      if (activeResponse.data) {
        setSessions(activeResponse.data);
      }
      if (historyResponse.data) {
        setLoginHistory(historyResponse.data);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    setTerminatingSessionId(sessionId);
    try {
      const response = await userService.terminateSession(sessionId);
      if (response.error) {
        toast.error(response.error);
        return;
      }
      toast.success('Session terminated successfully');
      await loadSessions();
    } catch (error) {
      toast.error('Failed to terminate session');
    } finally {
      setTerminatingSessionId(null);
    }
  };

  const handleTerminateAllSessions = async () => {
    setIsTerminatingAll(true);
    try {
      const response = await userService.terminateAllOtherSessions();
      if (response.error) {
        toast.error(response.error);
        return;
      }
      toast.success(response.data?.message || 'All other sessions terminated');
      await loadSessions();
    } catch (error) {
      toast.error('Failed to terminate sessions');
    } finally {
      setIsTerminatingAll(false);
    }
  };

  const getDeviceIcon = (deviceInfo: string) => {
    const device = deviceInfo?.toLowerCase() || '';
    if (device.includes('mobile') || device.includes('phone')) {
      return <Smartphone className="h-5 w-5" />;
    }
    if (device.includes('tablet') || device.includes('ipad')) {
      return <Tablet className="h-5 w-5" />;
    }
    return <Monitor className="h-5 w-5" />;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRelativeTime = (dateString: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return formatDate(dateString);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const updateData: ProfileUpdateRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
      };

      const response = await userService.updateProfile(updateData);
      
      if (response.error) {
        toast.error(response.error);
        return;
      }

      toast.success('Profile updated successfully!');
      
      // Refresh user data in context
      if (refreshUser) {
        await refreshUser();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSavingPassword(true);
    try {
      const response = await userService.changePassword(passwordData as PasswordChangeRequest);
      
      if (response.error) {
        toast.error(response.error);
        return;
      }

      toast.success('Password changed successfully');
      setShowPasswordDialog(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Fetch complete user data from backend
      const response = await userService.exportUserData();
      
      if (response.error) {
        toast.error(response.error);
        return;
      }

      const exportData = response.data;
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `user_data_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(link.href);
      
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    if (!deletePassword) {
      toast.error('Please enter your password to confirm deletion');
      return;
    }

    setIsDeleting(true);
    try {
      const response = await userService.deleteAccount(
        deletePassword,
        true,
        deleteReason || undefined
      );

      if (response.error) {
        toast.error(response.error);
        return;
      }

      toast.success('Account deleted successfully');
      setShowDeleteDialog(false);
      setDeleteConfirmText('');
      setDeletePassword('');
      setDeleteReason('');
      
      // Logout and redirect
      window.location.href = '/login';
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isUser()) {
    return null;
  }

  return (
    <div className="w-[1250px] m-auto py-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configure your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email updates about your products and orders
                </p>
                <Button variant="outline" className="w-full" disabled>
                  Configure Email Settings (Coming Soon)
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get instant notifications on your device
                </p>
                <Button variant="outline" className="w-full" disabled>
                  Configure Push Settings (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security
              </CardTitle>
              <CardDescription>
                Manage your account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Change Password</Label>
                <p className="text-sm text-muted-foreground">
                  Update your password regularly to keep your account secure
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowPasswordDialog(true)}
                >
                  Update Password
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
                <Button variant="outline" className="w-full" disabled>
                  Enable 2FA (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>
                Export your data or delete your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Export Data</Label>
                <p className="text-sm text-muted-foreground">
                  Download all your data and information including profile, addresses, and account history
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleExportData}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Export My Data
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-red-600">Delete Account</Label>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all data
                </p>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Session Management Section - Full Width */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Session Management
                </CardTitle>
                <CardDescription>
                  Manage your active sessions and view login history
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadSessions}
                disabled={isLoadingSessions}
              >
                {isLoadingSessions ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Refresh'
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="active" className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Active Sessions ({sessions.filter(s => s.isActive).length})
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Login History
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="active" className="space-y-4">
                {sessions.length > 1 && (
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleTerminateAllSessions}
                      disabled={isTerminatingAll}
                      className="text-red-600 hover:text-red-700"
                    >
                      {isTerminatingAll ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Terminating...
                        </>
                      ) : (
                        <>
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign out all other sessions
                        </>
                      )}
                    </Button>
                  </div>
                )}
                
                {isLoadingSessions ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : sessions.filter(s => s.isActive).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Monitor className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No active sessions found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessions.filter(s => s.isActive).map((session) => (
                      <div
                        key={session.id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          session.isCurrent ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900' : 'bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-full bg-background">
                            {getDeviceIcon(session.deviceInfo)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {session.browser} on {session.operatingSystem}
                              </span>
                              {session.isCurrent && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                  Current
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                {session.ipAddress}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {getRelativeTime(session.lastActivity)}
                              </span>
                            </div>
                          </div>
                        </div>
                        {!session.isCurrent && (
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
                              <LogOut className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="history" className="space-y-4">
                {isLoadingSessions ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : loginHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No login history available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {loginHistory.slice(0, 10).map((session) => (
                      <div
                        key={session.id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          session.isActive ? 'bg-muted/50' : 'bg-muted/20 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-full bg-background">
                            {getDeviceIcon(session.deviceInfo)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {session.browser} on {session.operatingSystem}
                              </span>
                              {session.isCurrent && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  Current
                                </Badge>
                              )}
                              {!session.isActive && (
                                <Badge variant="outline" className="text-muted-foreground">
                                  Ended
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                {session.ipAddress}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Logged in {formatDate(session.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Password must be at least 6 characters
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword} disabled={isSavingPassword}>
              {isSavingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account
              and remove all your data from our servers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> All your products, orders, and personal data will be permanently deleted.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deletePassword">Enter your password to confirm</Label>
              <Input
                id="deletePassword"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isDeleting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deleteReason">Reason for leaving (optional)</Label>
              <Input
                id="deleteReason"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Tell us why you're leaving..."
                disabled={isDeleting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deleteConfirm">
                Type <span className="font-bold text-red-600">DELETE</span> to confirm
              </Label>
              <Input
                id="deleteConfirm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
                disabled={isDeleting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowDeleteDialog(false);
              setDeleteConfirmText('');
              setDeletePassword('');
              setDeleteReason('');
            }} disabled={isDeleting}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== 'DELETE' || !deletePassword || isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete My Account'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
