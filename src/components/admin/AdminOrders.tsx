'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigation, type Page } from '@/stores/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { ChevronDown, ShoppingBag } from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_mobile: string;
  status: string;
  total: number;
  address: string;
  pincode: string;
  payment_method: string;
  created_at: string;
}

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const statusColor = (status: string) => {
  const s = status?.toLowerCase() || '';
  if (s === 'delivered') return 'bg-green-100 text-green-700';
  if (s === 'pending') return 'bg-yellow-100 text-yellow-700';
  if (s === 'cancelled') return 'bg-red-100 text-red-700';
  if (s === 'confirmed') return 'bg-blue-100 text-blue-700';
  if (s === 'packing') return 'bg-purple-100 text-purple-700';
  if (s === 'shipping') return 'bg-orange-100 text-orange-700';
  return 'bg-gray-100 text-gray-700';
};

const statusFlow = ['Pending', 'Confirmed', 'Packing', 'Shipping', 'Delivered'];

export default function AdminOrders() {
  const { navigate } = useNavigation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', '100');
      if (period !== 'all') params.set('period', period);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await fetch(`/api/orders?${params.toString()}`);
      const json = await res.json();
      setOrders(json.orders || []);
    } catch {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [period, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const periodButtons = [
    { label: 'Today', value: 'today' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
    { label: 'All', value: 'all' },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-40" />
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-9 w-20 rounded-xl" />)}
        </div>
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold font-[var(--font-poppins)] text-[#111111]">Orders</h1>
        <p className="text-gray-500 text-sm">{orders.length} orders found</p>
      </div>

      {/* Filters */}
      <Card className="rounded-xl shadow-sm border-0">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="flex gap-2 flex-wrap">
            {periodButtons.map((btn) => (
              <Button
                key={btn.value}
                variant={period === btn.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod(btn.value)}
                className={`rounded-xl text-xs h-9 ${
                  period === btn.value
                    ? 'bg-[#111111] text-white hover:bg-[#333333]'
                    : ''
                }`}
              >
                {btn.label}
              </Button>
            ))}
          </div>
          <div className="sm:ml-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 rounded-xl text-sm">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Packing">Packing</SelectItem>
                <SelectItem value="Shipping">Shipping</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="rounded-xl shadow-sm border-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order, idx) => (
                <TableRow
                  key={order.id}
                  className={`cursor-pointer transition-colors hover:bg-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                  onClick={() => navigate('admin-order-detail' as Page, { id: order.id })}
                >
                  <TableCell className="font-medium text-sm text-[#FF6A00]">
                    {String(order.order_number)}
                  </TableCell>
                  <TableCell>
                    <button
                      className="text-sm font-medium text-[#111111] hover:underline text-left"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('admin-customer-detail', { id: order.customer_id });
                      }}
                    >
                      {order.customer_name}
                    </button>
                    <p className="text-xs text-gray-400">{order.customer_mobile}</p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="text-right font-medium text-sm">{fmt(order.total)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="rounded-lg h-8">
                          Change <ChevronDown className="h-3 w-3 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        {statusFlow.map((s) => (
                          <DropdownMenuItem
                            key={s}
                            onClick={() => handleStatusUpdate(order.id, s)}
                            disabled={order.status === s}
                          >
                            {s}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuItem
                          onClick={() => handleStatusUpdate(order.id, 'Cancelled')}
                          className="text-red-500"
                          disabled={order.status === 'Cancelled'}
                        >
                          Cancelled
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-gray-400">
                    <ShoppingBag className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    No orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
