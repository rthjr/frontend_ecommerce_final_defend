'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, TrendingUp, Shield, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Hero() {
  const features = [
    { icon: Truck, text: 'Free Shipping' },
    { icon: Shield, text: 'Secure Payment' },
    { icon: TrendingUp, text: 'Best Prices' },
  ];

  return (
    <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/90 to-primary/80" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-20" />
        {/* Decorative elements */}
        <div className="absolute top-20 right-[10%] w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-[5%] w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/10 rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div 
            className="text-white space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">New Collection 2026</span>
            </motion.div>
            
            <motion.h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Discover Your
              <span className="block text-white/90">Perfect Style</span>
            </motion.h1>
            
            <motion.p 
              className="text-lg text-white/80 max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Explore our curated collection of premium products. Quality meets style in every piece we offer.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 gap-2 h-12 px-8" asChild>
                <Link href="/products">
                  Shop Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 h-12 px-8" asChild>
                <Link href="/products/search?category=new-arrivals">
                  Browse Categories
                </Link>
              </Button>
            </motion.div>

            {/* Features */}
            <motion.div 
              className="flex flex-wrap gap-6 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-white/80">
                  <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <feature.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">{feature.text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Stats Card */}
          <motion.div 
            className="hidden lg:block"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-3xl blur-xl" />
              <div className="relative bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4 rounded-2xl bg-white/10">
                    <p className="text-4xl font-bold">10K+</p>
                    <p className="text-sm text-white/70 mt-1">Happy Customers</p>
                  </div>
                  <div className="text-center p-4 rounded-2xl bg-white/10">
                    <p className="text-4xl font-bold">5K+</p>
                    <p className="text-sm text-white/70 mt-1">Products</p>
                  </div>
                  <div className="text-center p-4 rounded-2xl bg-white/10">
                    <p className="text-4xl font-bold">100+</p>
                    <p className="text-sm text-white/70 mt-1">Brands</p>
                  </div>
                  <div className="text-center p-4 rounded-2xl bg-white/10">
                    <p className="text-4xl font-bold">99%</p>
                    <p className="text-sm text-white/70 mt-1">Satisfaction</p>
                  </div>
                </div>
                <div className="h-px bg-white/20" />
                <div className="flex items-center justify-center gap-3">
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="h-8 w-8 rounded-full bg-white/20 border-2 border-white/30" />
                    ))}
                  </div>
                  <p className="text-sm text-white/80">Join our community</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
