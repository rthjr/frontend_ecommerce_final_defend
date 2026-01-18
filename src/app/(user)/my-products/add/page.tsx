'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { productService } from '@/services';
import { toast } from 'sonner';
import { ArrowLeft, Upload, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function AddProductPage() {
  const { user, hasRole } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    imageUrl: ''
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
  }, [hasRole, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData(prev => ({
          ...prev,
          imageUrl: reader.result as string
        }));
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
        active: true  // Default to active
      };

      const response = await productService.createProduct(productData);
      
      if (response.data) {
        toast.success('Product created successfully!');
        router.push('/my-products');
      } else {
        toast.error(response.error || 'Failed to create product');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create product');
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasRole('ROLE_USER') && !hasRole('ROLE_ADMIN')) {
    return null;
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
            <h1 className="text-3xl font-bold">Add New Product</h1>
            <p className="text-muted-foreground">
              Add a new product to your inventory
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
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
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
                      Creating...
                    </div>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Create Product
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
