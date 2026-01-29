'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { Minus, Plus, Star, ShoppingCart, Heart, Share2, Loader2, MessageSquare, HelpCircle, ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ProductResponse } from '@/lib/types';
import { productService } from '@/services';
import { useAppDispatch, useAppSelector } from '@/lib/redux/store';
import { addToCart } from '@/lib/redux/slices/cartSlice';
import { toggleCartDrawer } from '@/lib/redux/slices/uiSlice';
import { useAddToCartMutation } from '@/lib/redux/api/cartApi';
import { useGetProductReviewsQuery, useCreateReviewMutation, useGetProductFAQsQuery, useCreateFAQMutation } from '@/lib/redux/api/productsApi';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { userInfo } = useAppSelector((state) => state.user);
  const productId = params.id as string;
  
  const [addToCartApi, { isLoading: isAddingToCart }] = useAddToCartMutation();
  
  // Reviews and FAQs queries
  const { data: reviewsData, isLoading: reviewsLoading, refetch: refetchReviews } = useGetProductReviewsQuery({ productId });
  const { data: faqsData, isLoading: faqsLoading, refetch: refetchFaqs } = useGetProductFAQsQuery({ productId });
  const [createReview, { isLoading: isSubmittingReview }] = useCreateReviewMutation();
  const [createFAQ, { isLoading: isSubmittingFAQ }] = useCreateFAQMutation();
  
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  
  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  
  // FAQ form state
  const [faqQuestion, setFaqQuestion] = useState('');
  
  // Image gallery state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

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

    const cartItem = {
      productId: product.id.toString(),
      name: product.name,
      image: product.imageUrl || '/placeholder.png',
      price: product.price,
      quantity,
      color: selectedColor,
      size: selectedSize,
    };

    try {
      // If user is logged in, sync with backend
      if (userInfo) {
        await addToCartApi(cartItem).unwrap();
      }
      
      // Always add to Redux cart for local state
      dispatch(addToCart(cartItem));

      // Show cart drawer
      dispatch(toggleCartDrawer());
      
      toast.success('Added to cart');
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  const handleSubmitReview = async () => {
    if (!userInfo) {
      toast.error('Please login to submit a review');
      router.push('/login?redirect=/products/' + productId);
      return;
    }
    
    if (!reviewContent.trim()) {
      toast.error('Please write a review');
      return;
    }

    try {
      await createReview({
        productId,
        rating: reviewRating,
        content: reviewContent,
        userId: parseInt(userInfo._id),
      }).unwrap();
      
      toast.success('Review submitted successfully!');
      setReviewContent('');
      setReviewRating(5);
      refetchReviews();
    } catch {
      toast.error('Failed to submit review');
    }
  };

  const handleSubmitQuestion = async () => {
    if (!userInfo) {
      toast.error('Please login to ask a question');
      router.push('/login?redirect=/products/' + productId);
      return;
    }
    
    if (!faqQuestion.trim()) {
      toast.error('Please enter your question');
      return;
    }

    try {
      await createFAQ({
        productId,
        question: faqQuestion,
        userId: parseInt(userInfo._id),
      }).unwrap();
      
      toast.success('Question submitted successfully!');
      setFaqQuestion('');
      refetchFaqs();
    } catch {
      toast.error('Failed to submit question');
    }
  };

  // Parse reviews and faqs data
  const reviews = reviewsData?.content || reviewsData || [];
  const faqs = faqsData || [];

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

  // Create images array from imageUrls or single imageUrl
  const images = product.imageUrls?.length 
    ? product.imageUrls 
    : (product.imageUrl ? [product.imageUrl] : []);
  
  // Image gallery navigation
  const goToPrevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  
  const goToNextImage = () => {
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="container py-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square overflow-hidden rounded-xl border bg-gray-50 group">
            {images.length > 0 ? (
              <>
                <Image
                  src={images[selectedImageIndex]}
                  alt={`${product.name} - Image ${selectedImageIndex + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  priority
                />
                {/* Zoom button */}
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setIsZoomModalOpen(true)}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                {/* Navigation arrows for multiple images */}
                {images.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={goToPrevImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={goToNextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <div className="text-4xl opacity-20">📦</div>
              </div>
            )}
          </div>
          
          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    selectedImageIndex === index 
                      ? 'border-primary ring-2 ring-primary ring-offset-2' 
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <Image
                    src={image}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
          
          {/* Image counter */}
          {images.length > 1 && (
            <p className="text-center text-sm text-muted-foreground">
              Image {selectedImageIndex + 1} of {images.length}
            </p>
          )}
        </div>

        {/* Zoom Modal */}
        <Dialog open={isZoomModalOpen} onOpenChange={setIsZoomModalOpen}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95">
            <div className="relative aspect-square w-full">
              {images.length > 0 && (
                <>
                  <Image
                    src={images[selectedImageIndex]}
                    alt={`${product.name} - Zoomed`}
                    fill
                    className="object-contain"
                  />
                  {images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                        onClick={goToPrevImage}
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                        onClick={goToNextImage}
                      >
                        <ChevronRight className="h-6 w-6" />
                      </Button>
                    </>
                  )}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        className={`h-2 w-2 rounded-full transition-colors ${
                          selectedImageIndex === index ? 'bg-white' : 'bg-white/40'
                        }`}
                        onClick={() => setSelectedImageIndex(index)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="mt-2 flex items-center gap-4">
              <div className="flex items-center text-yellow-500">
                <Star className="h-5 w-5 fill-current" />
                <span className="ml-1 font-medium text-foreground">
                  {product.rating || 0}
                </span>
                <span className="ml-1 text-muted-foreground">
                  ({product.numReviews || 0} reviews)
                </span>
              </div>
              <Separator orientation="vertical" className="h-5" />
              <span className="text-sm text-muted-foreground">
                {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
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
              disabled={product.stockQuantity === 0 || isAddingToCart}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {isAddingToCart ? 'Adding...' : 'Add to Cart'}
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
              <TabsTrigger value="reviews">
                Reviews {Array.isArray(reviews) && reviews.length > 0 && `(${reviews.length})`}
              </TabsTrigger>
              <TabsTrigger value="faq">
                FAQ {Array.isArray(faqs) && faqs.length > 0 && `(${faqs.length})`}
              </TabsTrigger>
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
                  <span className="ml-2 text-muted-foreground">{product.stockQuantity}</span>
                </div>
              </div>
            </TabsContent>
            
            {/* Reviews Tab */}
            <TabsContent value="reviews">
              <div className="space-y-6">
                {/* Review Summary */}
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold">{product.rating?.toFixed(1) || '0.0'}</div>
                  <div>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= (product.rating || 0)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Based on {product.numReviews || 0} reviews
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Write Review Form */}
                <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  <h4 className="font-semibold flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Write a Review
                  </h4>
                  <div className="space-y-2">
                    <Label>Your Rating</Label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              star <= (hoverRating || reviewRating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-muted-foreground">
                        {reviewRating} star{reviewRating !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="review">Your Review</Label>
                    <Textarea
                      id="review"
                      placeholder="Share your experience with this product..."
                      value={reviewContent}
                      onChange={(e) => setReviewContent(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Button 
                    onClick={handleSubmitReview} 
                    disabled={isSubmittingReview}
                    size="sm"
                  >
                    {isSubmittingReview ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Review'
                    )}
                  </Button>
                </div>

                <Separator />

                {/* Reviews List */}
                {reviewsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : Array.isArray(reviews) && reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review: { id: number; userId: number; userName?: string; rating: number; content: string; createdAt: string }) => (
                      <div key={review.id} className="border-b pb-4 last:border-0">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {review.userName?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{review.userName || `User ${review.userId}`}</p>
                                <div className="flex items-center gap-2">
                                  <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`h-3 w-3 ${
                                          star <= review.rating
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {review.createdAt && format(new Date(review.createdAt), 'MMM d, yyyy')}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">{review.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    No reviews yet. Be the first to review this product!
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* FAQ Tab */}
            <TabsContent value="faq">
              <div className="space-y-6">
                {/* Ask Question Form */}
                <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  <h4 className="font-semibold flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    Ask a Question
                  </h4>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your question about this product..."
                      value={faqQuestion}
                      onChange={(e) => setFaqQuestion(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmitQuestion()}
                    />
                    <Button 
                      onClick={handleSubmitQuestion} 
                      disabled={isSubmittingFAQ}
                      size="sm"
                    >
                      {isSubmittingFAQ ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Ask'
                      )}
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* FAQs List */}
                {faqsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : Array.isArray(faqs) && faqs.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq: { id: number; question: string; answer?: string; userName?: string; createdAt?: string }) => (
                      <AccordionItem key={faq.id} value={`faq-${faq.id}`}>
                        <AccordionTrigger className="text-left">
                          <div className="flex items-start gap-2">
                            <HelpCircle className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                            <span>{faq.question}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          {faq.answer ? (
                            <div className="pl-6 text-muted-foreground">
                              {faq.answer}
                            </div>
                          ) : (
                            <div className="pl-6 text-muted-foreground italic">
                              This question hasn&apos;t been answered yet.
                            </div>
                          )}
                          {faq.createdAt && (
                            <p className="pl-6 mt-2 text-xs text-muted-foreground">
                              Asked {format(new Date(faq.createdAt), 'MMM d, yyyy')}
                            </p>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <HelpCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    No FAQs available for this product. Be the first to ask a question!
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}