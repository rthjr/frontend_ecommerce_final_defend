'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductResponse } from '@/services';
import { Star, ShoppingCart, Eye, Edit, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface ProductCardProps {
  product: ProductResponse;
  onAddToCart?: (productId: string) => void;
  onViewDetails?: (productId: number) => void;
  onEdit?: (productId: number) => void;
  onDelete?: (productId: number) => void;
  showActions?: boolean;
  isAdmin?: boolean;
}

export function ProductCardNew({ 
  product, 
  onAddToCart, 
  onViewDetails, 
  onEdit, 
  onDelete, 
  showActions = true,
  isAdmin = false 
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = () => {
    onAddToCart?.(product.id.toString());
  };

  const handleViewDetails = () => {
    onViewDetails?.(product.id);
  };

  const handleEdit = () => {
    onEdit?.(product.id);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this product?')) {
      onDelete?.(product.id);
    }
  };

  const renderStars = (rating: number = 0) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(rating) 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">
          {rating.toFixed(1)} ({product.reviewCount || 0})
        </span>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
          {product.imageUrl && !imageError ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
              <div className="text-center text-muted-foreground">
                <div className="text-4xl mb-2">📦</div>
                <p className="text-sm">No image</p>
              </div>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge variant="secondary">{product.category}</Badge>
          </div>
          {product.stock <= 5 && product.stock > 0 && (
            <div className="absolute top-2 left-2">
              <Badge variant="destructive">Low Stock</Badge>
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute top-2 left-2">
              <Badge variant="destructive">Out of Stock</Badge>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
          <CardDescription className="line-clamp-2">
            {product.description}
          </CardDescription>
          
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-sm text-muted-foreground">
              Stock: {product.stock}
            </span>
          </div>

          {product.averageRating && (
            <div className="flex items-center">
              {renderStars(product.averageRating)}
            </div>
          )}

          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Colors:</span>
              <div className="flex gap-1">
                {product.colors.slice(0, 3).map((color, index) => (
                  <div
                    key={index}
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
                {product.colors.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{product.colors.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="p-4 pt-0">
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewDetails}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            
            {!isAdmin && product.stock > 0 && (
              <Button
                size="sm"
                onClick={handleAddToCart}
                className="flex-1"
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                Add to Cart
              </Button>
            )}

            {isAdmin && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
