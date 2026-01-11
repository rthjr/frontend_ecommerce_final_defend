'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useGetProductByIdQuery, useUpdateProductMutation, useUploadProductImageMutation } from '@/lib/redux/api/productsApi';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Upload } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const formSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  price: z.coerce.number().min(0, 'Price must be positive'),
  image: z.string().min(1, 'Image is required'),
  brand: z.string().min(2, 'Brand is required'),
  category: z.string().min(2, 'Category is required'),
  stock: z.coerce.number().min(0, 'Stock must be non-negative'),
  description: z.string().min(10, 'Description is required'),
});

export default function AdminProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const { data: product, isLoading, error } = useGetProductByIdQuery(id as string);
  const [updateProduct, { isLoading: loadingUpdate }] = useUpdateProductMutation();
  const [uploadProductImage, { isLoading: loadingUpload }] = useUploadProductImageMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      price: 0,
      image: '',
      brand: '',
      category: '',
      stock: 0,
      description: '',
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        price: product.price,
        image: product.images?.[0] || '', // Assuming first image for now
        brand: product.brand,
        category: product.category,
        stock: product.stock,
        description: product.description,
      });
    }
  }, [product, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await updateProduct({
        _id: id as string,
        ...values,
        images: [values.image], // Wrap in array
      } as any).unwrap();
      toast.success('Product updated successfully');
      router.push('/admin/products');
    } catch (err) {
      toast.error('Failed to update product');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);
      try {
        const res = await uploadProductImage(formData).unwrap();
        toast.success('Image uploaded successfully');
        form.setValue('image', res.image);
      } catch (err) {
        toast.error('Failed to upload image');
      }
    }
  };

  if (isLoading) return <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error) return <div className="py-10 text-center text-red-500">Error loading product</div>;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">Edit Product</h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Product Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand</FormLabel>
                  <FormControl>
                    <Input placeholder="Brand Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="Category" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Product Description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image</FormLabel>
                <div className="flex items-center gap-4">
                  <FormControl>
                    <Input placeholder="Image URL" {...field} />
                  </FormControl>
                  <div className="relative">
                    <Input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleImageUpload}
                      disabled={loadingUpload}
                    />
                    <Button type="button" variant="outline" size="icon" disabled={loadingUpload}>
                      {loadingUpload ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                {field.value && (
                  <div className="mt-2 relative h-40 w-40 border rounded-md overflow-hidden">
                    <Image src={field.value} alt="Product preview" fill className="object-cover" />
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={loadingUpdate}>
            {loadingUpdate && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Product
          </Button>
        </form>
      </Form>
    </div>
  );
}
