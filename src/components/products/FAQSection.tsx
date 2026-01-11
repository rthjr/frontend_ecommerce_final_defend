'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGetProductFAQsQuery, useCreateFAQMutation } from '@/lib/redux/api/productsApi';
import { toast } from 'sonner';

interface FAQSectionProps {
  productId: string;
}

export default function FAQSection({ productId }: FAQSectionProps) {
  const { data: faqs, isLoading } = useGetProductFAQsQuery({ productId });
  const [createFAQ, { isLoading: iscreating }] = useCreateFAQMutation();
  const [question, setQuestion] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    try {
      await createFAQ({
        productId,
        question,
         // Similar to Review, sending generic userId if needed, or backend handles it.
         // FAQRequest.java likely needs userId or just question.
         // Let's assume just question for public or userId from context if available.
         // Checking DTO: `FAQRequest` has `question` and `userId`.
         userId: 1, // Fallback/Mock ID
      }).unwrap();
      
      toast.success('Question submitted successfully');
      setQuestion('');
      setShowForm(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to submit question');
    }
  };

  if (isLoading) return <div>Loading FAQs...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Frequently Asked Questions</h3>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Ask a Question
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="flex gap-4">
            <Input
                placeholder="Type your question here..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="flex-1"
            />
            <Button type="submit" disabled={iscreating}>
                Submit
            </Button>
        </form>
      )}

      <div className="space-y-4">
        {faqs && faqs.length > 0 ? (
          faqs.map((faq: any) => (
            <div key={faq.id} className="rounded-lg border p-4">
              <h4 className="font-medium">Q: {faq.question}</h4>
              {faq.answer && (
                 <p className="mt-2 text-muted-foreground">A: {faq.answer}</p>
              )}
              {!faq.answer && (
                 <p className="mt-2 text-sm text-yellow-600 italic">Waiting for answer...</p>
              )}
               <div className="mt-2 text-xs text-muted-foreground">
                Asked by User #{faq.userId} on {new Date(faq.date).toLocaleDateString()}
               </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground">No specific questions for this product yet.</p>
        )}
      </div>
    </div>
  );
}
