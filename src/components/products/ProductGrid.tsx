'use client';

import Link from 'next/link';
import ProductCard from './ProductCard';
import { ProductResponse } from '@/lib/types';
import { ArrowRight, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

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

interface ProductGridProps {
  products: (ProductResponse | Product)[];
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
  viewAllLink?: string;
}

export default function ProductGrid({ 
  products, 
  title, 
  subtitle,
  showViewAll = true,
  viewAllLink = '/products'
}: ProductGridProps) {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <motion.div 
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <div className="flex items-center gap-2 text-primary mb-2">
                <Package className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">Collection</span>
              </div>
              <h2 className="text-3xl font-bold">{title}</h2>
              {subtitle && (
                <p className="text-muted-foreground mt-2">{subtitle}</p>
              )}
            </div>
            {showViewAll && (
              <Button variant="outline" className="gap-2" asChild>
                <Link href={viewAllLink}>
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </motion.div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={'id' in product ? product.id : (product as Product)._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
