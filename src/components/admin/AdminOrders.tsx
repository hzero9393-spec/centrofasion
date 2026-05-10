'use client';

import React, { useEffect, useState } from 'react';
import { useAdminNavigation } from '@/stores/adminNavigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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

const statusBadge = (status: string) => {
  const s = status?.toLowerCase() || 'pending';
  const map: Record<string, string> = {
    pending: 'bg-[#FFC107]/10 text-[#FFC107] border-[#FFC107]/20',
    confirmed: 'bg-[#60A5FA]/10 text-[#60A5FA] border-[#60A5FA]/20',
    packing: 'bg-[#C084FC]/10 text-[#C084FC] border-[#C084FC]/20',
    shipping: 'bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] border-[var(--theme-primary)]/20',
    delivered: 'bg-[#4ADE80]/10 text-[#4ADE80] border-[#4ADE80]/20',
    cancelled: 'bg-[#F87171]/10 text-[#F87171] border-[#F87171]/20',
  };
  return map[s] || map.pending;
};

export default function AdminOrders() {
  const { navigate } = useAdminNavigation();
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-[var(--theme-text)] tracking-tight">Orders</h1>
      </div>

      {/* Filters */}
      <div className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Period Buttons */}
          <div className="flex gap-1 bg-[var(--theme-surface)] rounded-xl p-1 border border-[var(--theme-border)]">
            {PERIODS.map((p) => (
              <Button
                key={p.value}
                variant={period === p.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => { setPeriod(p.value); setPage(1); }}
                className={
                  period === p.value
                    ? 'bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] hover:opacity-90 text-white h-8 text-xs rounded-lg shadow-sm'
                    : 'h-8 text-xs text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface)] rounded-lg'
                }
              >
                {p.label}
              </Button>
            ))}
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-[180px] bg-[var(--theme-surface)] border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl h-10 focus:ring-[var(--theme-border)]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl">
              <SelectItem value="all" className="text-[var(--theme-text)] focus:bg-[var(--theme-surface)] focus:text-[var(--theme-text)]">All Status</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s} className="text-[var(--theme-text)] focus:bg-[var(--theme-surface)] focus:text-[var(--theme-text)]">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-[var(--theme-border)]">
                <TableHead className="font-medium text-[var(--theme-text-muted)] text-xs uppercase tracking-wider">Order ID</TableHead>
                <TableHead className="font-medium text-[var(--theme-text-muted)] text-xs uppercase tracking-wider hidden md:table-cell">Customer</TableHead>
                <TableHead className="font-medium text-[var(--theme-text-muted)] text-xs uppercase tracking-wider hidden sm:table-cell">Date</TableHead>
                <TableHead className="font-medium text-[var(--theme-text-muted)] text-xs uppercase tracking-wider text-right hidden lg:table-cell">Items</TableHead>
                <TableHead className="font-medium text-[var(--theme-text-muted)] text-xs uppercase tracking-wider text-right">Total</TableHead>
                <TableHead className="font-medium text-[var(--theme-text-muted)] text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="font-medium text-[var(--theme-text-muted)] text-xs uppercase tracking-wider hidden sm:table-cell">Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-b border-[var(--theme-border)]">
                    <TableCell colSpan={7}>
                      <Skeleton className="h-14 w-full bg-[var(--theme-surface)] rounded-xl" />
                    </TableCell>
                  </TableRow>
                ))
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16">
                    <ShoppingBag className="h-10 w-10 mx-auto mb-3 text-[var(--theme-text-muted)]" />
                    <p className="text-[var(--theme-text-muted)] text-sm">No orders found</p>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((o, i) => (
                  <TableRow
                    key={o.id}
                    className={`cursor-pointer border-b border-[var(--theme-border)] hover:bg-[var(--theme-surface)] transition-colors ${i % 2 === 1 ? 'bg-[var(--theme-surface)]' : ''}`}
                    onClick={() => navigate('order-detail', { id: o.id })}
                  >
                    <TableCell>
                      <span className="font-medium text-[var(--theme-primary)]">{o.order_number || o.id?.slice(0, 8)}</span>
                    </TableCell>
                    <TableCell
                      className="hidden md:table-cell font-medium text-[var(--theme-text)] cursor-pointer hover:text-[var(--theme-primary)] transition-colors"
                      onClick={(e) => { e.stopPropagation(); navigate('customer-detail', { id: o.customer_id }); }}
                    >
                      {o.customer_name || 'Unknown'}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-[var(--theme-text-muted)] text-sm">
                      {o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN') : '—'}
                    </TableCell>
                    <TableCell className="text-right hidden lg:table-cell text-[var(--theme-text-muted)]">—</TableCell>
                    <TableCell className="text-right font-medium text-[var(--theme-text)]">₹{o.total.toLocaleString('en-IN')}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" className="h-7 px-2 gap-1 hover:bg-[var(--theme-surface)]">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusBadge(o.status)}`}>
                              {o.status || 'Pending'}
                            </span>
                            <ChevronDown className="h-3 w-3 text-[var(--theme-text-muted)]" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl p-1">
                          {STATUS_OPTIONS.map((s) => (
                            <DropdownMenuItem
                              key={s}
                              onClick={(e) => { e.stopPropagation(); handleStatusChange(o.id, s); }}
                              className="text-[var(--theme-text)] focus:bg-[var(--theme-surface)] focus:text-[var(--theme-text)] rounded-lg text-sm cursor-pointer"
                            >
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border mr-2 ${statusBadge(s)}`}>
                                {s}
                              </span>
                              {s}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-[var(--theme-text-muted)] text-sm">{o.payment_method || 'COD'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-[var(--theme-surface)] border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface)] rounded-lg"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-[var(--theme-text-muted)] px-2">Page {page} of {totalPages}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-[var(--theme-surface)] border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface)] rounded-lg"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
