import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Hero() {
  return (
    <section className="relative bg-gray-900 text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent opacity-90" />
        {/* Placeholder for hero image */}
        <div className="h-full w-full bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
      </div>
      <div className="relative container flex h-[500px] flex-col justify-center gap-4">
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-6xl">
          Summer Collection 2025
        </h1>
        <p className="max-w-xl text-lg text-gray-300">
          Discover our latest arrivals for the season. Premium quality, sustainable materials, and timeless designs.
        </p>
        <div className="flex gap-4">
          <Button size="lg" asChild>
            <Link href="/products/search">Shop Now</Link>
          </Button>
          <Button size="lg" variant="outline" className="text-black hover:text-black bg-white hover:bg-gray-100 border-none" asChild>
            <Link href="/products/search?category=new-arrivals">New Arrivals</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
