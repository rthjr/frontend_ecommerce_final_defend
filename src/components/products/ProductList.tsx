'use client';

import { useState, useEffect } from 'react';
import { ProductCardNew } from './ProductCardNew';
import { productService, ProductResponse, ProductFilter } from '@/services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Search, Filter, Grid, List } from 'lucide-react';

interface ProductListProps {
  onAddToCart?: (productId: string) => void;
  onViewDetails?: (productId: number) => void;
  isAdmin?: boolean;
  onEdit?: (productId: number) => void;
  onDelete?: (productId: number) => void;
}

export function ProductList({ 
  onAddToCart, 
  onViewDetails, 
  isAdmin = false,
  onEdit,
  onDelete 
}: ProductListProps) {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<ProductFilter>({
    page: 0,
    size: 12,
    sortBy: 'name',
    sortDirection: 'asc'
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [filter]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await productService.filterProducts(filter);
      if (response.error) {
        throw new Error(response.error);
      }
      setProducts(response.data?.content || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchProducts();
      return;
    }

    try {
      const response = await productService.searchProducts(searchTerm);
      if (response.error) {
        throw new Error(response.error);
      }
      setProducts(response.data || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to search products');
    }
  };

  const handleFilterChange = (key: keyof ProductFilter, value: any) => {
    setFilter(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 0 // Reset page when changing other filters
    }));
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      const response = await productService.deleteProduct(productId);
      if (response.error) {
        throw new Error(response.error);
      }
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete product');
    }
  };

  const categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Toys'];
  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
    { value: 'createdAt', label: 'Date' },
    { value: 'stock', label: 'Stock' }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        {showFilters && (
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select onValueChange={(value) => handleFilterChange('category', value || undefined)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <Select onValueChange={(value) => handleFilterChange('sortBy', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Sort Direction</label>
                <Select onValueChange={(value) => handleFilterChange('sortDirection', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Price Range</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Products Count */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Products</h2>
        <Badge variant="secondary">{products.length} products</Badge>
      </div>

      {/* Products Grid/List */}
      {products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-muted-foreground">No products found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
        }>
          {products.map((product) => (
            <ProductCardNew
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onViewDetails={onViewDetails}
              onEdit={onEdit}
              onDelete={handleDeleteProduct}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
}
