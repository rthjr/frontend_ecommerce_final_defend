'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';
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
import { useGetOrdersQuery } from '@/lib/redux/api/ordersApi';

export default function AdminOrderListPage() {
  const { data: orders, isLoading, error } = useGetOrdersQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading orders</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Orders</h2>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Delivered</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders?.map((order) => (
              <TableRow key={order._id}>
                <TableCell className="font-medium">{order._id}</TableCell>
                <TableCell>{order.user}</TableCell> {/* Assuming user ID for now, ideally populated name */}
                <TableCell>
                  {format(new Date(order.createdAt), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>${order.totalPrice.toFixed(2)}</TableCell>
                <TableCell>
                  {order.isPaid ? (
                    <Badge className="bg-green-600 hover:bg-green-700">Paid</Badge>
                  ) : (
                    <Badge variant="destructive">Not Paid</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {order.isDelivered ? (
                    <Badge className="bg-green-600 hover:bg-green-700">Delivered</Badge>
                  ) : (
                    <Badge variant="secondary">Pending</Badge>
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
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
