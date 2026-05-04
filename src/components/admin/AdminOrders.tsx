'use client';

import React, { useEffect, useState } from 'react';
import { useNavigation } from '@/stores/navigation';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ChevronDown, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';

interface Order {
  id: string; order_number: string; customer_id: string; customer_name: string;
  customer_mobile: string; status: string; total: number; address: string;
  pincode: string; payment_method: string; created_at: string; items_count?: number;
}

const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Packing', 'Shipping', 'Delivered', 'Cancelled'];
const PERIODS = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'All', value: 'all' },
];

export default function AdminOrders() {
  const { navigate } = useNavigation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: '1', limit: '50' });
        if (period !== 'all') params.set('period', period);
        if (statusFilter !== 'all') params.set('status', statusFilter);
        const res = await fetch(`/api/orders?${params}`);
        const data = await res.json();
        if (!cancelled) {
          setOrders(data.orders || []);
          setTotalPages(data.totalPages || 1);
        }
      } catch { if (!cancelled) toast.error('Failed to load orders'); }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [period, statusFilter]);

  const refetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: '1', limit: '50' });
      if (period !== 'all') params.set('period', period);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await fetch(`/api/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders || []);
      setTotalPages(data.totalPages || 1);
    } catch { toast.error('Failed to load orders'); }
    setLoading(false);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      toast.success(`Order status updated to ${newStatus}`);
      refetchOrders();
    } catch { toast.error('Failed to update status'); }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl font-semibold text-[#1F2A3A]">Orders</h1>
      </div>

      {/* Filters */}
      <Card className="border-[#E4E7EC]">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Period Buttons */}
            <div className="flex gap-1 bg-[#F5F7FA] rounded-lg p-1">
              {PERIODS.map((p) => (
                <Button
                  key={p.value}
                  variant={period === p.value ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => { setPeriod(p.value); setPage(1); }}
                  className={period === p.value ? 'bg-[#FF5722] hover:bg-[#E64A19] text-white h-8 text-xs' : 'h-8 text-xs text-[#5A6B7F]'}
                >
                  {p.label}
                </Button>
              ))}
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-[#E4E7EC] overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F5F7FA] hover:bg-[#F5F7FA]">
                <TableHead className="font-medium">Order ID</TableHead>
                <TableHead className="font-medium hidden md:table-cell">Customer</TableHead>
                <TableHead className="font-medium hidden sm:table-cell">Date</TableHead>
                <TableHead className="font-medium text-right hidden lg:table-cell">Items</TableHead>
                <TableHead className="font-medium text-right">Total</TableHead>
                <TableHead className="font-medium">Status</TableHead>
                <TableHead className="font-medium hidden sm:table-cell">Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-12 w-full" /></TableCell></TableRow>
                ))
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-[#5A6B7F]">
                    <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p>No orders found</p>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((o, i) => (
                  <TableRow
                    key={o.id}
                    className={`admin-row cursor-pointer ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}
                    onClick={() => navigate('admin-order-detail', { id: o.id })}
                  >
                    <TableCell>
                      <span className="font-medium text-[#FF5722]">{o.order_number || o.id?.slice(0, 8)}</span>
                    </TableCell>
                    <TableCell
                      className="hidden md:table-cell font-medium text-[#1F2A3A] cursor-pointer hover:text-[#FF5722]"
                      onClick={(e) => { e.stopPropagation(); navigate('admin-customer-detail', { id: o.customer_id }); }}
                    >
                      {o.customer_name || 'Unknown'}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-[#5A6B7F] text-sm">
                      {o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN') : '—'}
                    </TableCell>
                    <TableCell className="text-right hidden lg:table-cell text-[#5A6B7F]">—</TableCell>
                    <TableCell className="text-right font-medium">₹{o.total.toLocaleString('en-IN')}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" className="h-7 px-2 gap-1">
                            <Badge className={`badge-${o.status?.toLowerCase()}`}>{o.status || 'Pending'}</Badge>
                            <ChevronDown className="h-3 w-3 text-[#5A6B7F]" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {STATUS_OPTIONS.map((s) => (
                            <DropdownMenuItem key={s} onClick={(e) => { e.stopPropagation(); handleStatusChange(o.id, s); }}>
                              {s}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-[#5A6B7F] text-sm">{o.payment_method || 'COD'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-[#5A6B7F]">Page {page} of {totalPages}</span>
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
