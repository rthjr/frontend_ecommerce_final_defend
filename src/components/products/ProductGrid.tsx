import ProductCard from './ProductCard';
import { ProductResponse } from '@/lib/types';

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
}

export default function ProductGrid({ products, title }: ProductGridProps) {
  return (
    <section className="container py-12">
      {title && (
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id || (product as any)._id} product={product} />
        ))}
      </div>
    </section>
  );
}
