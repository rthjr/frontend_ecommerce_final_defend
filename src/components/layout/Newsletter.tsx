'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function Newsletter() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Subscribed to newsletter!');
  };

  return (
    <section className="bg-primary text-primary-foreground">
      <div className="container py-12 md:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
          <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
            Stay in the loop
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7 text-primary-foreground/80">
            Subscribe to our newsletter to get the latest updates, news, and special offers.
          </p>
          <form onSubmit={handleSubmit} className="flex w-full max-w-sm items-center space-x-2">
            <Input
              type="email"
              placeholder="Enter your email"
              className="bg-primary-foreground text-primary"
              required
            />
            <Button type="submit" variant="secondary">
              Subscribe
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
