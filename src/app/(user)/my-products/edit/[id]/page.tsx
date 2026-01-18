'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { productService, ProductResponse } from '@/services';
import { authService } from '@/services/authService';
import { productApiClient } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft, Save, Upload, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function EditProductPage() {
  const { user, hasRole } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    imageUrl: '',
    active: true
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const categories = [
    'Electronics',
    'Clothing',
    'Books',
    'Home',
    'Sports',
    'Toys',
    'Food',
    'Other'
  ];

  useEffect(() => {
    // Allow access for ROLE_USER or ROLE_ADMIN
    if (!hasRole('ROLE_USER') && !hasRole('ROLE_ADMIN')) {
      router.push('/unauthorized');
      return;
    }

    // Load product data
    const loadProduct = async () => {
      if (params.id) {
        try {
          // Get all products for the authenticated seller
          const userInfo = authService.getUserInfoWithFallback();
          const sellerId = userInfo?.id;
          
          if (sellerId) {
            const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
            const headers: Record<string, string> = {
              'Authorization': `Bearer ${token}`,
              'X-User-Id': sellerId,
            };
            
            const response = await productApiClient.get<ProductResponse[]>('/api/products/owner', headers);
            
            if (response.data) {
              // Find the specific product by ID
              const product = response.data.find((p: ProductResponse) => p.id === parseInt(params.id as string));
              
              if (product) {
                setProduct(product);
                console.log('Loaded product data:', product); // Debug log
                setFormData({
                  name: product.name || '',
                  description: product.description || '',
                  price: product.price.toString(),
                  stock: product.stockQuantity?.toString() || '0',
                  category: product.category || '',
                  imageUrl: product.imageUrl || '',
                  active: product.active ?? true
                });
                console.log('Set formData active to:', product.active ?? true); // Debug log
                setImagePreview(product.imageUrl || null);
              } else {
                toast.error('Product not found');
                router.push('/my-products');
              }
            }
          } else {
            toast.error('User not authenticated');
            router.push('/my-products');
          }
        } catch (error) {
          console.error('Failed to load product:', error);
          toast.error('Failed to load product');
          router.push('/my-products');
        }
      }
    };

    loadProduct();
  }, [params.id, hasRole, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value || '' }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.stock) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stock),
        category: formData.category,
        imageUrl: formData.imageUrl,
        active: formData.active
      };

      console.log('Submitting product data:', productData); // Debug log
      console.log('FormData active value:', formData.active); // Debug log

      const response = await productService.updateProduct(product?.id || 0, productData);
      
      if (response.data) {
        toast.success('Product updated successfully!');
        router.push('/my-products');
      } else {
        toast.error(response.error || 'Failed to update product');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update product');
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasRole('ROLE_USER') && !hasRole('ROLE_ADMIN') || !product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-[1250px] m-auto py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/my-products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Product</h1>
            <p className="text-muted-foreground">
              Update product information
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Product Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter product name"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter product description"
                      rows={4}
                    />
                  </div>

                  {/* Price */}
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($) *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  {/* Stock Quantity */}
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity *</Label>
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={handleInputChange}
                      placeholder="0"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value || '' }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Active Status */}
                  <div className="space-y-2">
                    <Label htmlFor="active">Product Status</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        id="active"
                        name="active"
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => {
                        console.log('Checkbox changed:', e.target.checked); // Debug log
                        setFormData(prev => ({ ...prev, active: e.target.checked }));
                      }}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="active" className="text-sm font-medium text-gray-700">
                        Active (visible to customers)
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label>Product Image</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      {imagePreview ? (
                        <div className="space-y-4">
                          <div className="relative aspect-square w-full max-w-sm mx-auto">
                            <img
                              src={imagePreview}
                              alt="Product preview"
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setImagePreview(null);
                              setFormData(prev => ({ ...prev, imageUrl: '' }));
                            }}
                          >
                            Remove Image
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              Click to upload product image
                            </p>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="cursor-pointer"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Image URL Input */}
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Or enter Image URL</Label>
                    <Input
                      id="imageUrl"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="min-w-[120px]"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Product
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
