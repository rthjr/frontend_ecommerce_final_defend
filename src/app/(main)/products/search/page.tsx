'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductGrid from '@/components/products/ProductGrid';
import ProductFilters from '@/components/products/ProductFilters';
import ProductSort from '@/components/products/ProductSort';
import { productService } from '@/services';
import { ProductResponse } from '@/lib/types';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let response;
        
        if (searchParams.get('keyword')) {
          // Search by keyword (only active products)
          response = await productService.searchProducts(searchParams.get('keyword') || '');
        } else {
          // Get all active products and filter client-side
          response = await productService.getActiveProducts();
        }
        
        if (response.data) {
          let filteredProducts = response.data;
          
          // Apply additional filters
          const category = searchParams.get('category');
          const minPrice = searchParams.get('minPrice');
          const maxPrice = searchParams.get('maxPrice');
          const sortBy = searchParams.get('sort') || 'newest';
          
          if (category) {
            filteredProducts = filteredProducts.filter(p => 
              p.category.toLowerCase() === category.toLowerCase()
            );
          }
          
          if (minPrice) {
            filteredProducts = filteredProducts.filter(p => 
              p.price >= Number(minPrice)
            );
          }
          
          if (maxPrice) {
            filteredProducts = filteredProducts.filter(p => 
              p.price <= Number(maxPrice)
            );
          }
          
          // Apply sorting
          filteredProducts = [...filteredProducts].sort((a, b) => {
            switch (sortBy) {
              case 'price-low':
                return a.price - b.price;
              case 'price-high':
                return b.price - a.price;
              case 'rating':
                return (b.rating || 0) - (a.rating || 0);
              case 'newest':
              default:
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
          });
          
          setProducts(filteredProducts);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Mobile Filter Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="md:hidden mb-4">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <div className="py-4">
              <ProductFilters />
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 md:block">
          <ProductFilters />
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              {products.length} Results
              {searchParams.get('keyword') && ` for "${searchParams.get('keyword')}"`}
            </h1>
            <ProductSort />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-[400px] animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <ProductGrid products={products} />
          ) : (
            <div className="flex h-[400px] flex-col items-center justify-center text-center">
              <h3 className="text-lg font-semibold">No products found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search terms
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
