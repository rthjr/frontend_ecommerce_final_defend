'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProductResponse } from '@/lib/types';
import { useAppDispatch } from '@/lib/redux/store';
import { addToCart } from '@/lib/redux/slices/cartSlice';
import { toggleCartDrawer } from '@/lib/redux/slices/uiSlice';
import { toast } from 'sonner';

// Import the old Product type for backward compatibility
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: string;
  brand: string;
  stock: number;
  rating: number;
  numReviews: number;
  colors?: string[];
  sizes?: string[];
  createdAt: string;
  updatedAt: string;
}

interface ProductCardProps {
  product: ProductResponse | Product;
}

// Type guard function
function isProductResponse(product: ProductResponse | Product): product is ProductResponse {
  return 'stockQuantity' in product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const dispatch = useAppDispatch();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Get the correct ID (handle both old _id and new id)
    const productId = !isProductResponse(product) ? (product as any)._id : product.id;
    
    // Add to Redux cart
    dispatch(addToCart({
      productId: productId.toString(),
      name: product.name,
      image: !isProductResponse(product) ? (product as any).images?.[0] || '/placeholder.png' : product.imageUrl || '/placeholder.png',
      price: product.price,
      quantity: 1,
      color: '',
      size: '',
    }));

    // Show cart drawer
    dispatch(toggleCartDrawer());

    toast.success('Added to cart');
  };

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
      <CardContent className="p-0">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {!isProductResponse(product) ? (product as any).images?.[0] : product.imageUrl ? (
            <Image
              src={!isProductResponse(product) ? (product as any).images[0] : product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="text-4xl opacity-20">📦</div>
            </div>
          )}
          
          {(!isProductResponse(product) ? product.stock : product.stockQuantity) === 0 && (
            <Badge className="absolute left-2 top-2 bg-red-500">
              Out of Stock
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col gap-3 p-4">
        <div className="space-y-2">
          <h3 className="font-semibold line-clamp-2">{product.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
            {(!isProductResponse(product) ? (product as any).averageRating || product.rating : product.rating) && (
              <div className="flex items-center text-sm text-yellow-500">
                ★ {(!isProductResponse(product) ? (product as any).averageRating || product.rating : product.rating)?.toFixed(1)}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            asChild
          >
            <Link href={`/products/${!isProductResponse(product) ? (product as any)._id : product.id}`}>
              <Eye className="h-3 w-3 mr-1" />
              View
            </Link>
          </Button>
          {(!isProductResponse(product) ? product.stock : product.stockQuantity) > 0 && (
            <Button
              size="sm"
              className="flex-1"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-3 w-3 mr-1" />
              Add
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
