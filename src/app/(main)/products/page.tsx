'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { productService, ProductResponse } from '@/services';
import { useAppDispatch } from '@/lib/redux/store';
import { addToCart } from '@/lib/redux/slices/cartSlice';
import { toggleCartDrawer } from '@/lib/redux/slices/uiSlice';
import { toast } from 'sonner';
import { Search, ShoppingCart, Star, Filter, Grid, List, SlidersHorizontal, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [displayCount, setDisplayCount] = useState(10);
  const dispatch = useAppDispatch();

  const categories = ['all', 'electronics', 'clothing', 'books', 'home', 'sports'];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, selectedCategory, sortBy]);

  useEffect(() => {
    // Reset display count when filters change
    setDisplayCount(10);
  }, [searchTerm, selectedCategory, sortBy]);

  const fetchProducts = async () => {
    try {
      const response = await productService.getActiveProducts();
      if (response.error) {
        throw new Error(response.error);
      }
      setProducts(response.data || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category (case-insensitive)
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Sort products
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          const averageRatingA = a.rating || 0;
          const averageRatingB = b.rating || 0;
          return averageRatingB - averageRatingA;
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  };

  const handleAddToCart = (product: ProductResponse) => {
    dispatch(addToCart({
      productId: product.id.toString(),
      name: product.name,
      image: product.imageUrl || '/placeholder.png',
      price: product.price,
      quantity: 1,
      color: '',
      size: '',
    }));

    dispatch(toggleCartDrawer());
    toast.success('Added to cart');
  };

  const renderStars = (rating: number = 0) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < Math.floor(rating) 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  const ProductCard = ({ product }: { product: ProductResponse }) => (
    <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
      <div className="relative">
        <div className="aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="text-6xl opacity-20">📦</div>
            </div>
          )}
        </div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 space-y-2">
          {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
            <Badge className="bg-orange-500 hover:bg-orange-600 text-xs px-2 py-1">
              Low Stock
            </Badge>
          )}
          {product.stockQuantity === 0 && (
            <Badge className="bg-red-500 hover:bg-red-600 text-xs px-2 py-1">
              Sold Out
            </Badge>
          )}
        </div>

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4 flex gap-2">
            <Button
              size="sm"
              className="flex-1 bg-white text-black hover:bg-gray-100"
              asChild
            >
              <Link href={`/products/${product.id}`}>
                View Details
              </Link>
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => handleAddToCart(product)}
              disabled={product.stockQuantity === 0}
            >
              <ShoppingCart className="h-3 w-3 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </div>
      
      <CardContent className="p-5 space-y-3">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <div className="space-y-1">
            <span className="text-2xl font-bold text-primary">
              ${product.price.toFixed(2)}
            </span>
            {product.rating && renderStars(product.rating)}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ProductListItem = ({ product }: { product: ProductResponse }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
      <CardContent className="p-6">
        <div className="flex gap-6">
          <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-3xl opacity-20">📦</div>
              </div>
            )}
          </div>
          
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-semibold text-xl line-clamp-2 group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              <p className="text-muted-foreground line-clamp-2 mt-1">
                {product.description}
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-2xl font-bold text-primary">
                  ${product.price.toFixed(2)}
                </span>
                {product.rating && renderStars(product.rating)}
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <Link href={`/products/${product.id}`}>
                    View Details
                  </Link>
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stockQuantity === 0}
                >
                  <ShoppingCart className="h-3 w-3 mr-1" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b rounded-lg">
        <div className="container-fluid py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Discover Amazing Products
              </h1>
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Browse our curated collection of premium products with exceptional quality and style
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="container-fluid">
        <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-6">
          {/* Filter Controls */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center">
              {/* Mobile Filter Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>

              {/* Category Filter */}
              <div className={`flex flex-wrap gap-2 ${showFilters ? 'block' : 'hidden md:block'}`}>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="capitalize rounded-full"
                  >
                    {category === 'all' ? 'All Products' : category}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 items-center">
              {/* Sort Dropdown */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex gap-1 border rounded-lg p-1 bg-gray-50">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-md"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-md"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="container-fluid">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{Math.min(displayCount, filteredProducts.length)}</span> of <span className="font-semibold text-foreground">{filteredProducts.length}</span> products
          </p>
        </div>
      </div>

      {/* Products Grid/List */}
      <div className="container-fluid">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse"></div>
                <CardContent className="p-5 space-y-3">
                  <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-6 opacity-50">🔍</div>
            <h3 className="text-2xl font-semibold mb-3">No products found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Try adjusting your search terms, filters, or browse all categories
            </p>
            <Button onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid' ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "space-y-4"}>
              {filteredProducts.slice(0, displayCount).map((product) =>
                viewMode === 'grid' ? (
                  <ProductCard key={product.id} product={product} />
                ) : (
                  <ProductListItem key={product.id} product={product} />
                )
              )}
            </div>
            
            {/* See More Button */}
            {displayCount < filteredProducts.length && (
              <div className="text-center mt-12">
                <Button 
                  size="lg" 
                  onClick={() => setDisplayCount(prev => prev + 10)}
                  className="px-8"
                >
                  See More Products
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Showing {displayCount} of {filteredProducts.length} products
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
