'use client';

import { Star } from 'lucide-react';
import { useGetProductReviewsQuery } from '@/lib/redux/api/productsApi';

export default function ReviewList({ productId }: { productId: string }) {
  const { data: reviewsData, isLoading } = useGetProductReviewsQuery({ productId });
  
  // Handle Page<ReviewResponse> or List structure
  // @ts-ignore
  const reviews = reviewsData?.content || reviewsData || [];

  if (isLoading) {
      return <div className="text-center text-muted-foreground">Loading reviews...</div>;
  }

  if (reviews.length === 0) {
      return <div className="text-center text-muted-foreground">No reviews yet. Be the first to review!</div>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review: any) => (
        <div key={review.id} className="rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <div className="flex text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            <span className="font-medium">{review.user || 'Anonymous'}</span>
            <span className="text-sm text-muted-foreground">
              - {review.date ? new Date(review.date).toLocaleDateString() : 'Recently'}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {review.content}
          </p>
        </div>
      ))}
    </div>
  );
}
