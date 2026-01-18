'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Grid,
  List,
  Package,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

import { productService, ProductResponse } from '@/services';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/* =========================
   MAIN PAGE
========================= */

export default function UserProductsPage() {
  const { hasRole, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [view, setView] = useState<'grid' | 'list' | 'table'>('table'); // Default to table view
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(10); // 10 items per page

  const isAuthorized = useMemo(
    () => hasRole('ROLE_USER') || hasRole('ROLE_ADMIN'),
    [hasRole]
  );

  /* ---------- AUTH ---------- */
  useEffect(() => {
    if (!authLoading && !isAuthorized) {
      router.replace('/unauthorized');
    }
  }, [authLoading, isAuthorized, router]);

  /* ---------- DATA ---------- */
  useEffect(() => {
    if (isAuthorized) loadProducts();
  }, [isAuthorized]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      // Get current user ID from auth context
      const userInfo = authService.getUserInfoWithFallback();
      console.log('User info from authService:', userInfo); // Debug log
      const sellerId = userInfo?.id;
      console.log('Seller ID:', sellerId); // Debug log
      
      if (sellerId) {
        // Get products specific to this seller with pagination
        console.log('Calling getProductsBySeller with sellerId:', sellerId); // Debug log
        const res = await productService.getProductsBySeller(sellerId);
        console.log('Products response:', res); // Debug log
        if (res.data) {
          console.log('Products data:', res.data); // Debug log
          setProducts(res.data);
          setTotalItems(res.data.length);
          // Calculate total pages based on page size
          const calculatedTotalPages = Math.ceil(res.data.length / pageSize);
          setTotalPages(calculatedTotalPages || 1);
          console.log('Set total items:', res.data.length, 'total pages:', calculatedTotalPages); // Debug log
        } else {
          console.log('No products data in response'); // Debug log
        }
      } else {
        console.log('No seller ID found'); // Debug log
        // Fallback to all products if no user ID
        const res = await productService.getAllProducts();
        if (res.data) {
          setProducts(res.data);
          setTotalItems(res.data.length);
          const calculatedTotalPages = Math.ceil(res.data.length / pageSize);
          setTotalPages(calculatedTotalPages || 1);
        }
      }
    } catch (error) {
      console.error('Error loading products:', error); // Debug log
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------- DERIVED STATE ---------- */
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        status === 'all' ||
        (status === 'active' && p.stockQuantity > 0) ||
        (status === 'inactive' && p.stockQuantity === 0);

      return matchesSearch && matchesStatus;
    });
  }, [products, search, status]);

  // Calculate paginated products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, pageSize]);

  const stats = useMemo(() => {
    return {
      total: totalItems,
      active: products.filter((p) => p.stockQuantity > 0).length,
      inactive: products.filter((p) => p.stockQuantity === 0).length,
      lowStock: products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= 5).length,
    };
  }, [products]);

  /* ---------- ACTIONS ---------- */
  const deleteProduct = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    try {
      await productService.deleteProduct(id);
      toast.success('Product deleted');
      loadProducts();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  if (authLoading || !isAuthorized) return null;

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-6">
      <Header />
      <Stats stats={stats} />
      <Filters
        search={search}
        status={status}
        onSearch={setSearch}
        onStatus={setStatus}
      />

      <ProductsSection
        loading={isLoading}
        products={paginatedProducts}
        view={view}
        onDelete={deleteProduct}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalItems}
        setCurrentPage={setCurrentPage}
        hasFilters={!!search || status !== 'all'}
      />
    </div>
  );
}

/* =========================
   UI COMPONENTS
========================= */

function Header() {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold">My Products</h1>
        <p className="text-muted-foreground">Manage your inventory</p>
      </div>
      <Button asChild>
        <Link href="/my-products/add">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Link>
      </Button>
    </div>
  );
}

function Stats({ stats }: { stats: any }) {
  const items = [
    { label: 'Total', value: stats.total, icon: Package },
    { label: 'Active', value: stats.active, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Inactive', value: stats.inactive, icon: AlertCircle, color: 'text-red-600' },
    { label: 'Low Stock', value: stats.lowStock, icon: TrendingUp, color: 'text-orange-600' },
  ];

  return (
    <div className="grid md:grid-cols-4 gap-4">
      {items.map(({ label, value, icon: Icon, color }) => (
        <Card key={label}>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className={`text-2xl font-bold ${color ?? ''}`}>{value}</p>
            </div>
            <Icon className={`h-8 w-8 ${color ?? 'text-muted-foreground'}`} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Filters({
  search,
  status,
  onSearch,
  onStatus,
}: any) {
  return (
    <Card>
      <CardContent className="p-6 flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search..."
              className="pl-10 w-[300px]"
            />
          </div>
          <Select value={status} onValueChange={onStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onSearch('')}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ProductsSection({
  loading,
  products,
  view,
  onDelete,
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  setCurrentPage,
  hasFilters,
}: any) {
  if (loading) {
    return <div className="flex justify-center py-12 animate-spin h-8 w-8 border-b-2 border-primary rounded-full" />;
  }

  if (!products.length) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            {hasFilters ? 'No matching products' : 'No products yet'}
          </p>
          {!hasFilters && (
            <Button asChild>
              <Link href="/my-products/add">Add Product</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-semibold">Product</th>
                <th className="text-left p-3 font-semibold">Category</th>
                <th className="text-left p-3 font-semibold">Price</th>
                <th className="text-left p-3 font-semibold">Stock</th>
                <th className="text-left p-3 font-semibold">Status</th>
                <th className="text-left p-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: ProductResponse, index: number) => (
                <tr key={p.id} className={index % 2 === 0 ? "bg-gray-50" : "border-b"}>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {p.imageUrl && (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      )}
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline">{p.category}</Badge>
                  </td>
                  <td className="p-3 font-medium">${p.price.toFixed(2)}</td>
                  <td className="p-3">
                    <Badge variant={p.stockQuantity > 0 ? 'default' : 'destructive'}>
                      {p.stockQuantity > 0 ? p.stockQuantity : 'Out of stock'}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge variant={p.stockQuantity > 0 ? 'default' : 'destructive'}>
                      {p.stockQuantity > 0 ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/my-products/edit/${p.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => onDelete(p.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} products
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev: number) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            {/* Page Numbers */}
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className="w-8"
                >
                  {pageNum}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev: number) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
