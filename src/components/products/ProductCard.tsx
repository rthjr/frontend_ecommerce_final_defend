'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Eye, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProductResponse } from '@/lib/types';
import { useAppDispatch } from '@/lib/redux/store';
import { addToCart } from '@/lib/redux/slices/cartSlice';
import { toggleCartDrawer } from '@/lib/redux/slices/uiSlice';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useState } from 'react';

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
  className?: string;
}

// Type guard function
function isProductResponse(product: ProductResponse | Product): product is ProductResponse {
  return 'stockQuantity' in product;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

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

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const stock = !isProductResponse(product) ? product.stock : product.stockQuantity;
  const imageUrl = !isProductResponse(product) ? (product as any).images?.[0] : product.imageUrl;
  const productId = !isProductResponse(product) ? (product as any)._id : product.id;
  const rating = !isProductResponse(product) ? (product as any).averageRating || product.rating : product.rating;

  return (
    <Card className={cn(
      "group relative overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-card",
      className
    )}>
      <CardContent className="p-0">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {/* Image */}
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className={cn(
                "object-cover transition-all duration-500 group-hover:scale-110",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="text-6xl opacity-20">📦</div>
            </div>
          )}
          
          {/* Loading skeleton */}
          {!imageLoaded && imageUrl && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          
          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {stock === 0 && (
              <Badge variant="destructive" className="shadow-sm">
                Out of Stock
              </Badge>
            )}
            {stock > 0 && stock <= 5 && (
              <Badge variant="secondary" className="bg-orange-500 text-white shadow-sm">
                Low Stock
              </Badge>
            )}
          </div>
          
          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className={cn(
              "absolute right-3 top-3 h-9 w-9 rounded-full flex items-center justify-center transition-all duration-300",
              "bg-white/90 hover:bg-white shadow-sm",
              "opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
            )}
          >
            <Heart className={cn(
              "h-4 w-4 transition-colors",
              isWishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground"
            )} />
          </button>
          
          {/* Quick actions */}
          <div className={cn(
            "absolute bottom-3 left-3 right-3 flex gap-2 transition-all duration-300",
            "opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0"
          )}>
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 bg-white/95 hover:bg-white shadow-sm backdrop-blur-sm"
              asChild
            >
              <Link href={`/products/${productId}`}>
                <Eye className="h-4 w-4 mr-1.5" />
                Quick View
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col gap-3 p-4">
        {/* Product info */}
        <div className="space-y-2 w-full">
          <Link href={`/products/${productId}`} className="block">
            <h3 className="font-semibold line-clamp-1 hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
          
          {/* Rating */}
          {rating > 0 && (
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3.5 w-3.5",
                    i < Math.floor(rating) 
                      ? "fill-yellow-400 text-yellow-400" 
                      : "text-muted-foreground/30"
                  )}
                />
              ))}
              <span className="text-xs text-muted-foreground ml-1">
                ({rating.toFixed(1)})
              </span>
            </div>
          )}
        </div>
        
        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between w-full pt-2 border-t">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-primary">
              ${product.price.toFixed(2)}
            </span>
            {stock > 0 && (
              <span className="text-xs text-muted-foreground">
                {stock} in stock
              </span>
            )}
          </div>
          
          {stock > 0 && (
            <Button
              size="sm"
              onClick={handleAddToCart}
              className="gap-1.5 shadow-sm"
            >
              <ShoppingCart className="h-4 w-4" />
              Add
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
