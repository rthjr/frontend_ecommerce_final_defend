'use client';

import Link from 'next/link';
import { Package, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Mock orders data
const orders = [
  {
    id: 'ORD-123456',
    date: '2023-11-28',
    total: 129.99,
    status: 'Delivered',
    items: 3,
  },
  {
    id: 'ORD-789012',
    date: '2023-11-15',
    total: 59.99,
    status: 'Processing',
    items: 1,
  },
  {
    id: 'ORD-345678',
    date: '2023-10-30',
    total: 249.99,
    status: 'Shipped',
    items: 2,
  },
];

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Order History</h2>
        <p className="text-muted-foreground">
          View and track your recent orders.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === 'Delivered'
                          ? 'default' // Using default (primary) for delivered
                          : order.status === 'Processing'
                          ? 'secondary'
                          : 'outline'
                      }
                      className={
                         order.status === 'Delivered' ? 'bg-green-600 hover:bg-green-700' : ''
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>${order.total}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/orders/${order.id}`}>
                        Details
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
