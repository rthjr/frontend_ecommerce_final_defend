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

// Category image mapping - maps category names to images
const CATEGORY_IMAGES: Record<string, string> = {
  'electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=2070&auto=format&fit=crop',
  'clothing': 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2070&auto=format&fit=crop',
  'books': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2070&auto=format&fit=crop',
  'home': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2070&auto=format&fit=crop',
  'sports': 'https://images.unsplash.com/photo-1461896836934- voices-and-sounds?q=80&w=2070&auto=format&fit=crop',
  'beauty': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=2070&auto=format&fit=crop',
  'toys': 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?q=80&w=2070&auto=format&fit=crop',
  'food': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop',
  'jewelry': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2070&auto=format&fit=crop',
  'furniture': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2070&auto=format&fit=crop',
  'default': 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=2070&auto=format&fit=crop',
};

// Helper to get category image
const getCategoryImage = (categoryName: string): string => {
  const normalizedName = categoryName.toLowerCase().trim();
  // Try to find a matching category image
  for (const [key, image] of Object.entries(CATEGORY_IMAGES)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return image;
    }
  }
  return CATEGORY_IMAGES.default;
};

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<ProductResponse[]>([]);
  const [newArrivals, setNewArrivals] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; image: string }[]>([]);
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

      // Fetch all products for new arrivals and categories
      const arrivalsResponse = await productService.getAllProducts();
      if (arrivalsResponse.error) {
        console.error('Error fetching new arrivals:', arrivalsResponse.error);
        toast.error('Failed to load new arrivals');
      } else {
        const allProducts = arrivalsResponse.data || [];
        setNewArrivals(allProducts.slice(0, 8));
        
        // Derive unique categories from products
        const categoryMap = new Map<string, number>();
        allProducts.forEach(product => {
          if (product.category) {
            const count = categoryMap.get(product.category) || 0;
            categoryMap.set(product.category, count + 1);
          }
        });
        
        // Convert to array and sort by product count (most popular first)
        const derivedCategories = Array.from(categoryMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4) // Take top 4 categories
          .map(([name]) => ({
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name: name,
            image: getCategoryImage(name),
          }));
        
        setCategories(derivedCategories);
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
          {categories.length > 0 && <CategoryGrid categories={categories} />}
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
