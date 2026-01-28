'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('keyword') || '');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products/search?keyword=${encodeURIComponent(query)}`);
    } else {
      router.push('/products/search');
    }
  };

  const clearSearch = () => {
    setQuery('');
  };

  return (
    <form 
      onSubmit={handleSearch} 
      className={cn(
        "relative w-full max-w-lg transition-all duration-200",
        isFocused && "max-w-xl",
        className
      )}
    >
      <div className={cn(
        "relative flex items-center rounded-lg border bg-background transition-all duration-200",
        isFocused ? "ring-2 ring-primary/20 border-primary" : "hover:border-muted-foreground/30"
      )}>
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search products, brands, categories..."
          className="pl-10 pr-10 h-10 border-0 focus-visible:ring-0 bg-transparent"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 h-8 w-8 hover:bg-muted"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </form>
  );
}
