'use client';

import { useState, useEffect } from 'react';
import { Plus, MapPin, Pencil, Trash2, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { userService } from '@/services/userService';
import { AddressDTO } from '@/lib/types';

// Cambodia provinces
const CAMBODIA_PROVINCES = [
  'Phnom Penh',
  'Banteay Meanchey',
  'Battambang',
  'Kampong Cham',
  'Kampong Chhnang',
  'Kampong Speu',
  'Kampong Thom',
  'Kampot',
  'Kandal',
  'Kep',
  'Koh Kong',
  'Kratié',
  'Mondulkiri',
  'Oddar Meanchey',
  'Pailin',
  'Preah Sihanouk',
  'Preah Vihear',
  'Prey Veng',
  'Pursat',
  'Ratanakiri',
  'Siem Reap',
  'Stung Treng',
  'Svay Rieng',
  'Takéo',
  'Tboung Khmum',
];

const ADDRESS_LABELS = ['Home', 'Work', 'Other'];

const emptyAddress: AddressDTO = {
  label: 'Home',
  isDefault: false,
  firstName: '',
  lastName: '',
  phone: '',
  street: '',
  village: '',
  commune: '',
  district: '',
  province: '',
  postalCode: '',
  country: 'Cambodia',
  additionalInfo: '',
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<AddressDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressDTO | null>(null);
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AddressDTO>(emptyAddress);

  // Fetch addresses on mount
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const response = await userService.getAddresses();
      if (response.error) {
        toast.error(response.error);
        return;
      }
      setAddresses(response.data || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load addresses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddDialog = () => {
    setEditingAddress(null);
    setFormData(emptyAddress);
    setShowDialog(true);
  };

  const handleOpenEditDialog = (address: AddressDTO) => {
    setEditingAddress(address);
    setFormData({ ...address });
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingAddress(null);
    setFormData(emptyAddress);
  };

  const handleSaveAddress = async () => {
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.phone) {
      toast.error('Please fill in name and phone number');
      return;
    }
    if (!formData.commune || !formData.district || !formData.province) {
      toast.error('Please fill in commune, district, and province');
      return;
    }

    setIsSaving(true);
    try {
      let response;
      if (editingAddress?.id) {
        response = await userService.updateAddress(editingAddress.id, formData);
      } else {
        response = await userService.createAddress(formData);
      }

      if (response.error) {
        toast.error(response.error);
        return;
      }

      toast.success(editingAddress ? 'Address updated successfully' : 'Address added successfully');
      handleCloseDialog();
      fetchAddresses();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save address');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeletingAddressId(id);
    setShowDeleteAlert(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAddressId) return;

    setIsSaving(true);
    try {
      const response = await userService.deleteAddress(deletingAddressId);
      if (response.error) {
        toast.error(response.error);
        return;
      }

      toast.success('Address deleted successfully');
      setShowDeleteAlert(false);
      setDeletingAddressId(null);
      fetchAddresses();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete address');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const response = await userService.setDefaultAddress(id);
      if (response.error) {
        toast.error(response.error);
        return;
      }

      toast.success('Default address updated');
      fetchAddresses();
    } catch (error: any) {
      toast.error(error.message || 'Failed to set default address');
    }
  };

  const formatAddress = (address: AddressDTO) => {
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.village) parts.push(`Village: ${address.village}`);
    if (address.commune) parts.push(`Commune: ${address.commune}`);
    if (address.district) parts.push(`District: ${address.district}`);
    if (address.province) parts.push(address.province);
    if (address.postalCode) parts.push(address.postalCode);
    return parts;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Addresses</h2>
          <p className="text-muted-foreground">
            Manage your shipping and billing addresses.
          </p>
        </div>
        <Button onClick={handleOpenAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No addresses yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add your first address to make checkout faster.
            </p>
            <Button onClick={handleOpenAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Address
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {addresses.map((address) => (
            <Card key={address.id} className="relative">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {address.label || 'Address'}
                  </div>
                  {address.isDefault && (
                    <Badge variant="secondary">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Default
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">
                    {address.firstName} {address.lastName}
                  </p>
                  <p className="text-foreground">{address.phone}</p>
                  {formatAddress(address).map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                  {address.additionalInfo && (
                    <p className="italic mt-2">{address.additionalInfo}</p>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEditDialog(address)}
                  >
                    <Pencil className="mr-2 h-3 w-3" />
                    Edit
                  </Button>
                  {!address.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => address.id && handleSetDefault(address.id)}
                    >
                      <Star className="mr-2 h-3 w-3" />
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => address.id && handleDeleteClick(address.id)}
                  >
                    <Trash2 className="mr-2 h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Address Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </DialogTitle>
            <DialogDescription>
              {editingAddress
                ? 'Update your address information.'
                : 'Add a new shipping or billing address.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Label */}
            <div className="space-y-2">
              <Label htmlFor="label">Address Label</Label>
              <Select
                value={formData.label || 'Home'}
                onValueChange={(value) => setFormData({ ...formData, label: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select label" />
                </SelectTrigger>
                <SelectContent>
                  {ADDRESS_LABELS.map((label) => (
                    <SelectItem key={label} value={label}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Enter last name"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g., 012 345 678"
              />
            </div>

            {/* Street */}
            <div className="space-y-2">
              <Label htmlFor="street">Street Address / House Number</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                placeholder="e.g., #123, Street 456"
              />
            </div>

            {/* Village */}
            <div className="space-y-2">
              <Label htmlFor="village">Village (ភូមិ)</Label>
              <Input
                id="village"
                value={formData.village || ''}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                placeholder="Enter village name"
              />
            </div>

            {/* Commune & District */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="commune">Commune (ឃុំ/សង្កាត់) *</Label>
                <Input
                  id="commune"
                  value={formData.commune}
                  onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                  placeholder="Enter commune/sangkat"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">District (ស្រុក/ខណ្ឌ) *</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="Enter district/khan"
                />
              </div>
            </div>

            {/* Province & Postal Code */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="province">Province (ខេត្ត/រាជធានី) *</Label>
                <Select
                  value={formData.province}
                  onValueChange={(value) => setFormData({ ...formData, province: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAMBODIA_PROVINCES.map((province) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode || ''}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  placeholder="e.g., 12000"
                />
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Additional Information</Label>
              <Textarea
                id="additionalInfo"
                value={formData.additionalInfo || ''}
                onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                placeholder="Delivery instructions, landmarks, etc."
                rows={2}
              />
            </div>

            {/* Default Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isDefault"
                checked={formData.isDefault || false}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isDefault: checked === true })
                }
              />
              <Label htmlFor="isDefault" className="cursor-pointer">
                Set as default address
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSaveAddress} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : editingAddress ? (
                'Update Address'
              ) : (
                'Add Address'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Address</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this address? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isSaving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
