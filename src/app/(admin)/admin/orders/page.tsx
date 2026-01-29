'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Eye, Search, Package, DollarSign, TrendingUp, Clock, CheckSquare, X, Truck, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminRoute } from '@/components/auth/RoleBasedRoute';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Pagination } from '@/components/ui/pagination';
import { useGetOrdersQuery, useDeliverOrderMutation } from '@/lib/redux/api/ordersApi';
import { toast } from 'sonner';

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50];

export default function AdminOrderListPage() {
  return (
    <AdminRoute>
      <AdminOrderListContent />
    </AdminRoute>
  );
}

function AdminOrderListContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const { data: orders, isLoading, error } = useGetOrdersQuery();
  const [deliverOrder, { isLoading: loadingDeliver }] = useDeliverOrderMutation();

  const handleBulkMarkDelivered = async () => {
    if (selectedIds.length === 0) return;
    
    const pendingOrders = selectedIds.filter(id => {
      const order = orders?.find(o => o._id === id);
      return order && !order.isDelivered;
    });

    if (pendingOrders.length === 0) {
      toast.info('All selected orders are already delivered');
      return;
    }

    if (window.confirm(`Mark ${pendingOrders.length} order(s) as delivered?`)) {
      try {
        let successCount = 0;
        let failCount = 0;
        
        for (const id of pendingOrders) {
          try {
            await deliverOrder(id).unwrap();
            successCount++;
          } catch {
            failCount++;
          }
        }
        
        if (successCount > 0) {
          toast.success(`Successfully marked ${successCount} order(s) as delivered`);
        }
        if (failCount > 0) {
          toast.error(`Failed to update ${failCount} order(s)`);
        }
        
        setSelectedIds([]);
      } catch (err: any) {
        toast.error('Bulk update failed');
      }
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === paginatedOrders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedOrders.map(o => o._id));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const exportToCSV = () => {
    const dataToExport = selectedIds.length > 0 
      ? filteredOrders.filter(o => selectedIds.includes(o._id))
      : filteredOrders;
    
    const headers = ['Order ID', 'User', 'Date', 'Items', 'Total', 'Paid', 'Paid At', 'Delivered', 'Delivered At'];
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(o => [
        o._id,
        o.user,
        o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : '',
        o.orderItems?.length || 0,
        o.totalPrice,
        o.isPaid ? 'Yes' : 'No',
        o.paidAt ? new Date(o.paidAt).toISOString().split('T')[0] : '',
        o.isDelivered ? 'Yes' : 'No',
        o.deliveredAt ? new Date(o.deliveredAt).toISOString().split('T')[0] : ''
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success(`Exported ${dataToExport.length} order(s) to CSV`);
  };

  const filteredOrders = useMemo(() => {
    return orders?.filter(order => {
      const orderId = order?._id ? String(order._id) : '';
      const orderUser = order?.user ? String(order.user) : '';
      const matchesSearch = orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           orderUser.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' ||
                           (filterStatus === 'paid' && order.isPaid) ||
                           (filterStatus === 'unpaid' && !order.isPaid) ||
                           (filterStatus === 'delivered' && order.isDelivered) ||
                           (filterStatus === 'pending' && !order.isDelivered);
      return matchesSearch && matchesStatus;
    }) || [];
  }, [orders, searchTerm, filterStatus]);

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    setSelectedIds([]);
  };

  const handleFilterChange = (value: string) => {
    setFilterStatus(value);
    setCurrentPage(1);
    setSelectedIds([]);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
    setSelectedIds([]);
  };

  const isAllSelected = paginatedOrders.length > 0 && selectedIds.length === paginatedOrders.length;
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < paginatedOrders.length;

  const stats = {
    total: orders?.length || 0,
    totalRevenue: orders?.reduce((acc, order) => acc + (typeof order.totalPrice === 'number' ? order.totalPrice : 0), 0) || 0,
    pending: orders?.filter(o => !o.isDelivered).length || 0,
    delivered: orders?.filter(o => o.isDelivered).length || 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-800">Error loading orders. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
          <p className="text-muted-foreground">Manage and track customer orders</p>
        </div>
        <Button variant="outline" onClick={exportToCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export {selectedIds.length > 0 ? `(${selectedIds.length})` : 'All'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.delivered}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by order ID or user..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-muted-foreground">Show</span>
          <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ITEMS_PER_PAGE_OPTIONS.map(option => (
                <SelectItem key={option} value={option.toString()}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">per page</span>
        </div>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>
            Showing {paginatedOrders.length} of {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Bulk Actions Bar */}
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between p-3 mb-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  {selectedIds.length} order{selectedIds.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleBulkMarkDelivered}
                  disabled={loadingDeliver}
                >
                  <Truck className="mr-2 h-4 w-4" />
                  Mark Delivered
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              </div>
            </div>
          )}
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={isAllSelected}
                      ref={(ref) => {
                        if (ref) {
                          (ref as any).indeterminate = isSomeSelected;
                        }
                      }}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order) => {
                    const orderId = order?._id ? String(order._id) : '';
                    const createdAt = order?.createdAt ? new Date(order.createdAt) : null;
                    const itemCount = order?.orderItems ? order.orderItems.length : 0;
                    const totalPrice = typeof order?.totalPrice === 'number' ? order.totalPrice : 0;
                    const paidAt = order?.paidAt ? new Date(order.paidAt) : null;
                    const deliveredAt = order?.deliveredAt ? new Date(order.deliveredAt) : null;
                    const isSelected = selectedIds.includes(order._id);

                    return (
                    <TableRow key={order._id} className={isSelected ? 'bg-blue-50' : ''}>
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleSelectOne(order._id)}
                          aria-label={`Select order ${orderId}`}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {orderId ? `${orderId.substring(0, 8)}...` : 'N/A'}
                      </TableCell>
                      <TableCell>{order.user}</TableCell>
                      <TableCell>
                        {createdAt ? format(createdAt, 'MMM d, yyyy') : '—'}
                        <div className="text-xs text-muted-foreground">
                          {createdAt ? format(createdAt, 'h:mm a') : ''}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {itemCount} item{itemCount !== 1 ? 's' : ''}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        ${totalPrice.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {order.isPaid ? (
                          <div className="flex flex-col">
                            <Badge className="bg-green-600 hover:bg-green-700 w-fit">Paid</Badge>
                            {paidAt && (
                              <span className="text-xs text-muted-foreground mt-1">
                                {format(paidAt, 'MMM d')}
                              </span>
                            )}
                          </div>
                        ) : (
                          <Badge variant="destructive">Unpaid</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {order.isDelivered ? (
                          <div className="flex flex-col">
                            <Badge className="bg-green-600 hover:bg-green-700 w-fit">Delivered</Badge>
                            {deliveredAt && (
                              <span className="text-xs text-muted-foreground mt-1">
                                {format(deliveredAt, 'MMM d')}
                              </span>
                            )}
                          </div>
                        ) : (
                          <Badge className="bg-yellow-600 hover:bg-yellow-700">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/orders/${order._id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Details
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Package className="h-8 w-8" />
                        <p>No orders found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
