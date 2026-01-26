'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Eye, Search, Package, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { useGetOrdersQuery } from '@/lib/redux/api/ordersApi';

export default function AdminOrderListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { data: orders, isLoading, error } = useGetOrdersQuery();

  const filteredOrders = orders?.filter(order => {
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
  });

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
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
        <p className="text-muted-foreground">Manage and track customer orders</p>
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
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by order ID or user..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
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
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>
            {filteredOrders?.length || 0} order{filteredOrders?.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
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
                {filteredOrders && filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const orderId = order?._id ? String(order._id) : '';
                    const createdAt = order?.createdAt ? new Date(order.createdAt) : null;
                    const itemCount = order?.orderItems ? order.orderItems.length : 0;
                    const totalPrice = typeof order?.totalPrice === 'number' ? order.totalPrice : 0;
                    const paidAt = order?.paidAt ? new Date(order.paidAt) : null;
                    const deliveredAt = order?.deliveredAt ? new Date(order.deliveredAt) : null;

                    return (
                    <TableRow key={order._id}>
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
                    <TableCell colSpan={8} className="h-24 text-center">
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
        </CardContent>
      </Card>
    </div>
  );
}
