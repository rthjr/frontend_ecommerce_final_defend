'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { Minus, Plus, Star, ShoppingCart, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductResponse } from '@/lib/types';
import { productService } from '@/services';
import { useAppDispatch } from '@/lib/redux/store';
import { addToCart } from '@/lib/redux/slices/cartSlice';
import { toggleCartDrawer } from '@/lib/redux/slices/uiSlice';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productService.getProductById(parseInt(productId));
        if (response.data) {
          setProduct(response.data);
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  useEffect(() => {
    if (product) {
      if (product.colors?.length && !selectedColor) setSelectedColor(product.colors[0]);
      if (product.sizes?.length && !selectedSize) setSelectedSize(product.sizes[0]);
    }
  }, [product]);

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      // Add to Redux cart
      dispatch(addToCart({
        productId: product.id.toString(),
        name: product.name,
        image: product.imageUrl || '/placeholder.png',
        price: product.price,
        quantity,
        color: selectedColor,
        size: selectedSize,
      }));

      // Show cart drawer
      dispatch(toggleCartDrawer());
      
      toast.success('Added to cart');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-xl bg-gray-100" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
            <div className="h-24 w-full animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container flex h-[50vh] flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Button onClick={() => router.push('/products')}>
          Back to Shop
        </Button>
      </div>
    );
  }

  // Create images array from single imageUrl
  const images = product.imageUrl ? [product.imageUrl] : [];

  return (
    <div className="container py-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-xl border bg-gray-50">
            {images.length > 0 ? (
              <Image
                src={images[0]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <div className="text-4xl opacity-20">📦</div>
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="mt-2 flex items-center gap-4">
              <div className="flex items-center text-yellow-500">
                <Star className="h-5 w-5 fill-current" />
                <span className="ml-1 font-medium text-foreground">
                  {product.averageRating || 0}
                </span>
                <span className="ml-1 text-muted-foreground">
                  ({product.reviewCount || 0} reviews)
                </span>
              </div>
              <Separator orientation="vertical" className="h-5" />
              <span className="text-sm text-muted-foreground">
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
            </div>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Color: {selectedColor}</label>
              <div className="flex gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    className={`h-8 w-8 rounded-full border-2 ${
                      selectedColor === color ? 'border-primary' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color.toLowerCase() }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Size: {selectedSize}</label>
              <div className="flex gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className={`px-3 py-1 border rounded ${
                      selectedSize === size
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-gray-300'
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quantity</label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              className="flex-1"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
            <Button variant="outline" size="sm">
              <Heart className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="details" className="w-full">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Product Details</h3>
                <p className="text-sm text-muted-foreground">{product.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Category:</span>
                  <span className="ml-2 text-muted-foreground">{product.category}</span>
                </div>
                <div>
                  <span className="font-medium">Stock:</span>
                  <span className="ml-2 text-muted-foreground">{product.stock}</span>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="reviews">
              <div className="space-y-4">
                <h3 className="font-semibold">Customer Reviews</h3>
                <div className="text-center text-muted-foreground py-8">
                  No reviews yet. Be the first to review this product!
                </div>
              </div>
            </TabsContent>
            <TabsContent value="faq">
              <div className="space-y-4">
                <h3 className="font-semibold">Frequently Asked Questions</h3>
                <div className="text-center text-muted-foreground py-8">
                  No FAQs available for this product.
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}