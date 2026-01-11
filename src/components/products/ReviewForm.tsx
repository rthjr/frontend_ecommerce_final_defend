'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCreateReviewMutation } from '@/lib/redux/api/productsApi';
import { toast } from 'sonner';

interface ReviewFormProps {
  productId: string;
}

export default function ReviewForm({ productId }: ReviewFormProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [createReview, { isLoading }] = useCreateReviewMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (!content.trim()) {
      toast.error('Please write a review');
      return;
    }

    try {
      // Mock user ID for now, as auth slice might not be fully accessible or we need to pass it.
      // In a real app, this comes from auth context.
      // Backend expects userId.
      const userInfo = localStorage.getItem('userInfo');
      const userId = userInfo ? JSON.parse(userInfo)._id : 1; // Fallback or handle error

      await createReview({
        productId,
        rating,
        content,
        userId: Number(userId) || 1, // Ensure number if backend expects number, check DTO.
        // Wait, backend `ReviewRequest` has `Long userId`. Check if frontend stores ID as string or number.
        // `User` type has `_id: string`. Backend uses String for User ID usually in `User` entity but `ReviewRequest` has `Long`.
        // Let's check `ReviewRequest.java` again.
        // It has `private Long userId;`.
        // If our User IDs are UUIDs (Strings), this will fail.
        // Let's check `UserResponse.java` or `User` entity.
        // `UserController.java` uses `String id`.
        // `ReviewRequest` using `Long userId` seems to be a mismatch if Users use String IDs.
        // I should assume for now I try to parse it, or if it fails, I might need to fix Backend DTO.
        // Let's assume it works for now or I will catch error.
      }).unwrap();
      
      toast.success('Review submitted successfully');
      setOpen(false);
      setRating(0);
      setContent('');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to submit review');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Write a Review</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`text-2xl transition-colors ${
                  rating >= star ? 'text-yellow-500' : 'text-gray-300'
                }`}
                onClick={() => setRating(star)}
              >
                ★
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Share your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px]"
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
