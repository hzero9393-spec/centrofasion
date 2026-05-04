'use client';

import React, { useEffect, useState } from 'react';
import { useNavigation } from '@/stores/navigation';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

interface OrderData {
  order: { id: string; order_number: string; customer_id: string; status: string; total: string; address: string; pincode: string; payment_method: string; created_at: string; updated_at: string };
  items: { id: string; product_name: string; product_image: string; size: string; color: string; quantity: string; price: string }[];
  customer: { first_name: string; last_name: string; mobile: string; address: string; pincode: string } | null;
}

const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Packing', 'Shipping', 'Delivered', 'Cancelled'];

export default function AdminOrderDetail() {
  const { pageParams, goBack, navigate } = useNavigation();
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

  if (loading) return <div className="space-y-4"><Skeleton className="h-40 w-full" /><Skeleton className="h-64 w-full" /></div>;
  if (!data) return <Card className="border-[#E4E7EC]"><CardContent className="py-16 text-center text-[#5A6B7F]">Order not found</CardContent></Card>;

  const o = data.order;
  const items = data.items || [];
  const c = data.customer;
  const subtotal = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
  const discount = subtotal - Number(o.total);
  const shipping = 0;

  return (
    <div className="space-y-6">
      {/* Back */}
      <Button variant="ghost" onClick={goBack} className="gap-2 text-[#5A6B7F]">
        <ArrowLeft className="h-4 w-4" /> Back to Orders
      </Button>

      {/* Order Info Bar */}
      <Card className="border-[#E4E7EC]">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-semibold text-[#1F2A3A]">Order #{o.order_number || o.id?.slice(0, 8)}</h2>
                <Badge className={`badge-${o.status?.toLowerCase()}`}>{o.status || 'Pending'}</Badge>
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-[#5A6B7F]">
                <span>{o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</span>
                <span>•</span>
                <span>{o.payment_method || 'COD'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Customer Info */}
        <Card className="border-[#E4E7EC]">
          <CardContent className="p-5">
            <h3 className="text-sm font-medium text-[#5A6B7F] mb-3">Customer Information</h3>
            <div className="space-y-2">
              <p className="font-medium text-[#1F2A3A]">{c?.first_name} {c?.last_name || ''}</p>
              {c?.mobile && <p className="text-sm text-[#5A6B7F]">{c.mobile}</p>}
              {(o.address || c?.address) && <p className="text-sm text-[#5A6B7F]">{o.address || c?.address}</p>}
              {(o.pincode || c?.pincode) && <p className="text-sm text-[#5A6B7F]">{o.pincode || c?.pincode}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card className="border-[#E4E7EC]">
          <CardContent className="p-5">
            <h3 className="text-sm font-medium text-[#5A6B7F] mb-3">Order Items ({items.length})</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F5F7FA] hover:bg-[#F5F7FA]">
                    <TableHead className="font-medium text-xs">Item</TableHead>
                    <TableHead className="font-medium text-xs text-right">Qty</TableHead>
                    <TableHead className="font-medium text-xs text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#F5F7FA] overflow-hidden flex-shrink-0">
                            {item.product_image ? (
                              <img src={item.product_image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><Package className="h-4 w-4 text-[#CBD5E1]" /></div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#1F2A3A] truncate max-w-[140px]">{item.product_name}</p>
                            <p className="text-xs text-[#5A6B7F]">{item.size} / {item.color}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm">{item.quantity}</TableCell>
                      <TableCell className="text-right text-sm font-medium">₹{(Number(item.price) * Number(item.quantity)).toLocaleString('en-IN')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Total Breakdown */}
      <Card className="border-[#E4E7EC]">
        <CardContent className="p-5">
          <div className="max-w-xs ml-auto space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#5A6B7F]">Subtotal</span>
              <span className="text-[#1F2A3A]">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#28A745]">Discount</span>
                <span className="text-[#28A745]">-₹{discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-[#5A6B7F]">Shipping</span>
              <span className="text-[#28A745]">FREE</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="font-semibold text-[#1F2A3A]">Grand Total</span>
              <span className="text-xl font-bold text-[#1F2A3A]">₹{Number(o.total).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="border-[#E4E7EC]">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={handleStatusChange} disabled={!newStatus} className="bg-[#FF5722] hover:bg-[#E64A19] text-white">
              Update Status
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => navigate('admin-invoice', { id: o.id })}>
              <Printer className="h-4 w-4" /> Print Invoice
            </Button>
            {o.status !== 'Cancelled' && o.status !== 'Delivered' && (
              <Button variant="outline" className="border-[#DC3545] text-[#DC3545] hover:bg-[#FFEBEE] gap-2 ml-auto" onClick={() => setCancelOpen(true)}>
                <X className="h-4 w-4" /> Cancel Order
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cancel Dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <Label>Cancellation Reason</Label>
            <Textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Reason for cancellation..." rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>Keep Order</Button>
            <Button className="bg-[#DC3545] hover:bg-[#C82333] text-white" onClick={handleCancel}>Cancel Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
