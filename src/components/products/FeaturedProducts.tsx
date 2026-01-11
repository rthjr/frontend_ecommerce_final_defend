'use client';

import * as React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import ProductCard from './ProductCard';
import { ProductResponse } from '@/lib/types';
import Autoplay from 'embla-carousel-autoplay';

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

interface FeaturedProductsProps {
  products: (ProductResponse | Product)[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  if (!products || products.length === 0) {
    return (
      <section className="container py-12">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Featured Products</h2>
        </div>
        <div className="text-center text-muted-foreground">
          No featured products available at the moment.
        </div>
      </section>
    );
  }

  return (
    <section className="container py-12">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Featured Products</h2>
      </div>
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        opts={{
          align: 'start',
          loop: true,
        }}
      >
        <CarouselContent className="-ml-4">
          {products.map((product) => {
            const key = (product as any).id || (product as any)._id;
            return (
              <CarouselItem key={key} className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <ProductCard product={product} />
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </section>
  );
}
