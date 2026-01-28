'use client';

import { useState, useEffect } from 'react';
import Hero from '@/components/layout/Hero';
import FeaturedProducts from '@/components/products/FeaturedProducts';
import CategoryGrid from '@/components/products/CategoryGrid';
import ProductGrid from '@/components/products/ProductGrid';
import Newsletter from '@/components/layout/Newsletter';
import { ProductGridSkeleton } from '@/components/ui/loading-state';
import { productService, ProductResponse } from '@/services';
import { toast } from 'sonner';

// Mock categories for now - you can create a category service later
const mockCategories = [
  { id: 'electronics', name: 'Electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=2070&auto=format&fit=crop' },
  { id: 'clothing', name: 'Clothing', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2070&auto=format&fit=crop' },
  { id: 'books', name: 'Books', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2070&auto=format&fit=crop' },
  { id: 'home', name: 'Home & Garden', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2070&auto=format&fit=crop' },
];

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<ProductResponse[]>([]);
  const [newArrivals, setNewArrivals] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    setIsLoading(true);
    try {
      // Fetch featured products (top 4 products)
      const featuredResponse = await productService.getTopProducts(4);
      if (featuredResponse.error) {
        console.error('Error fetching featured products:', featuredResponse.error);
        toast.error('Failed to load featured products');
      } else {
        setFeaturedProducts(featuredResponse.data || []);
      }

      // Fetch new arrivals (all products, limited to 8)
      const arrivalsResponse = await productService.getAllProducts();
      if (arrivalsResponse.error) {
        console.error('Error fetching new arrivals:', arrivalsResponse.error);
        toast.error('Failed to load new arrivals');
      } else {
        const allProducts = arrivalsResponse.data || [];
        setNewArrivals(allProducts.slice(0, 8));
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <Hero />
      
      {isLoading ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <ProductGridSkeleton count={4} />
        </div>
      ) : (
        <>
          <FeaturedProducts products={featuredProducts} />
          <CategoryGrid categories={mockCategories} />
          <ProductGrid 
            products={newArrivals} 
            title="New Arrivals" 
            subtitle="Fresh finds just dropped - grab them before they're gone"
          />
        </>
      )}
      
      <Newsletter />
    </div>
  );
}
