'use client';

import React, { useEffect, useState } from 'react';
import { useAdminNavigation } from '@/stores/adminNavigation';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Printer, X, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrderData {
  order: { id: string; order_number: string; customer_id: string; status: string; total: string; address: string; pincode: string; payment_method: string; created_at: string; updated_at: string };
  items: { id: string; product_name: string; product_image: string; size: string; color: string; quantity: string; price: string }[];
  customer: { first_name: string; last_name: string; mobile: string; address: string; pincode: string } | null;
}

const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Packing', 'Shipping', 'Delivered', 'Cancelled'];

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

export default function AdminOrderDetail() {
  const { pageParams, goBack, navigate } = useAdminNavigation();
  const orderId = pageParams.id;
  const [data, setData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/orders/${orderId}?order_id=${orderId}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [orderId]);

  const handleStatusChange = async () => {
    if (!newStatus || !data) return;
    try {
      await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: data.order.id, status: newStatus }),
      });
      toast.success(`Order status updated to ${newStatus}`);
      setData({ ...data, order: { ...data.order, status: newStatus } });
      setNewStatus('');
    } catch { toast.error('Failed to update status'); }
  };

  const handleCancel = async () => {
    if (!data) return;
    try {
      await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: data.order.id, status: 'Cancelled' }),
      });
      toast.success('Order cancelled');
      setData({ ...data, order: { ...data.order, status: 'Cancelled' } });
      setCancelOpen(false);
    } catch { toast.error('Failed to cancel order'); }
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-10 w-40 bg-[var(--theme-surface)] rounded-xl" />
        <Skeleton className="h-28 w-full bg-[var(--theme-surface)] rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-48 bg-[var(--theme-surface)] rounded-2xl" />
          <Skeleton className="h-48 bg-[var(--theme-surface)] rounded-2xl" />
        </div>
        <Skeleton className="h-40 w-full bg-[var(--theme-surface)] rounded-2xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl p-16 text-center">
        <p className="text-[var(--theme-text-muted)]">Order not found</p>
      </div>
    );
  }

  const o = data.order;
  const items = data.items || [];
  const c = data.customer;
  const subtotal = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
  const discount = subtotal - Number(o.total);
  const shipping = 0;

  return (
    <div className="space-y-5">
      {/* Back */}
      <Button variant="ghost" onClick={goBack} className="gap-2 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface)] transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Orders
      </Button>

      {/* Order Info Bar */}
      <div className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-semibold text-[var(--theme-text)] tracking-tight">
                Order #{o.order_number || o.id?.slice(0, 8)}
              </h2>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge(o.status)}`}>
                {o.status || 'Pending'}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-sm text-[var(--theme-text-muted)]">
              <span>{o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</span>
              <span className="text-[var(--theme-text-muted)]">•</span>
              <span>{o.payment_method || 'COD'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Customer Info */}
        <div className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl p-6">
          <h3 className="text-xs font-medium text-[var(--theme-text-muted)] uppercase tracking-wider mb-4">Customer Information</h3>
          <div className="space-y-2.5">
            <p className="font-medium text-[var(--theme-text)] text-base">{c?.first_name} {c?.last_name || ''}</p>
            {c?.mobile && <p className="text-sm text-[var(--theme-text-muted)]">{c.mobile}</p>}
            {(o.address || c?.address) && <p className="text-sm text-[var(--theme-text-muted)]">{o.address || c?.address}</p>}
            {(o.pincode || c?.pincode) && <p className="text-sm text-[var(--theme-text-muted)]">{o.pincode || c?.pincode}</p>}
          </div>
        </div>

        {/* Items */}
        <div className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl p-6">
          <h3 className="text-xs font-medium text-[var(--theme-text-muted)] uppercase tracking-wider mb-4">Order Items ({items.length})</h3>
          <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-[var(--theme-border)]">
                  <TableHead className="font-medium text-[var(--theme-text-muted)] text-xs uppercase tracking-wider">Item</TableHead>
                  <TableHead className="font-medium text-[var(--theme-text-muted)] text-xs uppercase tracking-wider text-right">Qty</TableHead>
                  <TableHead className="font-medium text-[var(--theme-text-muted)] text-xs uppercase tracking-wider text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} className="border-b border-white/[0.04] hover:bg-[var(--theme-surface)] transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[var(--theme-surface)] border border-[var(--theme-border)] overflow-hidden flex-shrink-0">
                          {item.product_image ? (
                            <img src={item.product_image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-4 w-4 text-[var(--theme-text-muted)]" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[var(--theme-text)] truncate max-w-[140px]">{item.product_name}</p>
                          <p className="text-xs text-[var(--theme-text-muted)]">{item.size} / {item.color}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm text-[var(--theme-text)]">{item.quantity}</TableCell>
                    <TableCell className="text-right text-sm font-medium text-[var(--theme-text)]">₹{(Number(item.price) * Number(item.quantity)).toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Total Breakdown */}
      <div className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl p-6">
        <div className="max-w-xs ml-auto space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--theme-text-muted)]">Subtotal</span>
            <span className="text-[var(--theme-text)]">₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[#4ADE80]">Discount</span>
              <span className="text-[#4ADE80]">-₹{discount.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-[var(--theme-text-muted)]">Shipping</span>
            <span className="text-[#4ADE80]">FREE</span>
          </div>
          <Separator className="bg-white/[0.08]" />
          <div className="flex justify-between pt-1">
            <span className="font-semibold text-[var(--theme-text)]">Grand Total</span>
            <span className="text-xl font-bold text-[var(--theme-text)]">₹{Number(o.total).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={newStatus} onValueChange={setNewStatus}>
            <SelectTrigger className="w-full sm:w-[200px] bg-[var(--theme-surface)] border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl h-10 focus:ring-[var(--theme-border)]">
              <SelectValue placeholder="Update Status" />
            </SelectTrigger>
            <SelectContent className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl">
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s} className="text-[var(--theme-text)] focus:bg-[var(--theme-surface-hover)] focus:text-[var(--theme-text)]">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleStatusChange}
            disabled={!newStatus}
            className="bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] hover:opacity-90 text-white rounded-xl shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Update Status
          </Button>
          <Button
            variant="outline"
            className="gap-2 bg-[var(--theme-surface)] border-[var(--theme-border)] text-[var(--theme-text)] hover:bg-[var(--theme-surface)] rounded-xl"
            onClick={() => navigate('invoice', { id: o.id })}
          >
            <Printer className="h-4 w-4" /> Print Invoice
          </Button>
          {o.status !== 'Cancelled' && o.status !== 'Delivered' && (
            <Button
              variant="outline"
              className="gap-2 border-[#F87171]/30 text-[#F87171] hover:bg-[#F87171]/10 rounded-xl ml-auto"
              onClick={() => setCancelOpen(true)}
            >
              <X className="h-4 w-4" /> Cancel Order
            </Button>
          )}
        </div>
      </div>

      {/* Cancel Dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="max-w-md bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-[var(--theme-text)]">Cancel Order</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <Label className="text-[var(--theme-text-muted)]">Cancellation Reason</Label>
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation..."
              rows={3}
              className="bg-[var(--theme-surface)] border-[var(--theme-border)] text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)] rounded-xl focus-visible:ring-[var(--theme-border)] resize-none"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setCancelOpen(false)}
              className="bg-[var(--theme-surface)] border-[var(--theme-border)] text-[var(--theme-text)] hover:bg-[var(--theme-surface)] rounded-xl"
            >
              Keep Order
            </Button>
            <Button
              className="bg-[#F87171] hover:bg-[#F87171]/80 text-white rounded-xl"
              onClick={handleCancel}
            >
              Cancel Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
