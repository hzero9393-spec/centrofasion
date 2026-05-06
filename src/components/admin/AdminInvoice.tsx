'use client';

import React, { useEffect, useState } from 'react';
import { useAdminNavigation } from '@/stores/adminNavigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Printer, Package } from 'lucide-react';

interface ShopInfo {
  shop_name: string; gst_no: string; shop_phone: string; owner_name: string; address: string; terms: string;
}

interface OrderData {
  order: { id: string; order_number: string; customer_id: string; status: string; total: string; address: string; pincode: string; payment_method: string; created_at: string };
  items: { id: string; product_name: string; product_image: string; size: string; color: string; quantity: string; price: string }[];
  customer: { first_name: string; last_name: string; mobile: string; address: string; pincode: string } | null;
}

export default function AdminInvoice() {
  const { pageParams, goBack } = useAdminNavigation();
  const orderId = pageParams.id;
  const [data, setData] = useState<OrderData | null>(null);
  const [shop, setShop] = useState<ShopInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      orderId ? fetch(`/api/orders/${orderId}?order_id=${orderId}`).then((r) => r.json()) : Promise.resolve(null),
      fetch('/api/shop').then((r) => r.json()),
    ])
      .then(([orderData, shopData]) => {
        setData(orderData);
        setShop(shopData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [orderId]);

  if (loading) return <div className="space-y-4"><Skeleton className="h-[600px] w-full max-w-3xl mx-auto bg-white/5 rounded-2xl" /></div>;
  if (!data || !data.order) return (
    <Card className="bg-[var(--theme-card)] border border-white/[0.08] rounded-2xl">
      <CardContent className="py-16 text-center text-[var(--theme-text-muted)]">Order not found</CardContent>
    </Card>
  );

  const o = data.order;
  const items = data.items || [];
  const c = data.customer;
  const s = shop || {};
  const subtotal = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
  const tax = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + tax;
  const deliveryDate = o.created_at
    ? new Date(new Date(o.created_at).getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return (
    <div className="space-y-4">
      {/* Back button - hidden in print */}
      <div className="print:hidden">
        <Button variant="ghost" onClick={goBack} className="gap-2 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-white/5">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </div>

      {/* Print button - hidden in print */}
      <div className="print:hidden flex justify-end">
        <Button className="bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] hover:opacity-90 text-white gap-2 transition-opacity" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Print Invoice
        </Button>
      </div>

      {/* Invoice Card - dark in display, white in print */}
      <Card className="bg-[var(--theme-card)] border border-white/[0.08] rounded-2xl max-w-3xl mx-auto print:border-0 print:shadow-none print:bg-white print:rounded-none">
        <CardContent className="p-8 print:p-0">
          {/* Header */}
          <div className="flex justify-between items-start mb-8 print:text-black">
            <div>
              <h1 className="text-xl font-bold text-[var(--theme-text)] print:text-black">{s.shop_name || 'ClothFasion'}</h1>
              {s.gst_no && <p className="text-sm text-[var(--theme-text-muted)] print:text-gray-600 mt-0.5">GST: {s.gst_no}</p>}
              <p className="text-sm text-[var(--theme-text-muted)] print:text-gray-600">{s.address || 'Store Address'}</p>
              <p className="text-sm text-[var(--theme-text-muted)] print:text-gray-600">{s.shop_phone || '+91 XXXXXXXXXX'}</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] bg-clip-text text-transparent print:text-[var(--theme-primary)]">INVOICE</h2>
              <p className="text-sm text-[var(--theme-text-muted)] print:text-gray-600 mt-1">#{o.order_number || o.id?.slice(0, 8)}</p>
            </div>
          </div>

          <Separator className="mb-6 bg-white/[0.08] print:bg-gray-200" />

          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-6 mb-6 text-sm print:text-black">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[var(--theme-text-muted)] print:text-gray-500 mb-1">Order Date</p>
              <p className="font-medium text-[var(--theme-text)] print:text-black">{o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</p>
              <p className="text-[10px] uppercase tracking-widest text-[var(--theme-text-muted)] print:text-gray-500 mb-1 mt-3">Delivery Date</p>
              <p className="font-medium text-[var(--theme-text)] print:text-black">{deliveryDate || 'Expected in 4 days'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[var(--theme-text-muted)] print:text-gray-500 mb-1">Payment Method</p>
              <p className="font-medium text-[var(--theme-text)] print:text-black">{o.payment_method || 'COD'}</p>
            </div>
          </div>

          {/* Bill To */}
          <div className="mb-6">
            <p className="text-[10px] uppercase tracking-widest text-[var(--theme-text-muted)] print:text-gray-500 mb-2">BILL TO</p>
            <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.05] print:bg-gray-50 print:border-gray-200">
              <p className="font-semibold text-[var(--theme-text)] print:text-black">{c?.first_name} {c?.last_name || ''}</p>
              {c?.mobile && <p className="text-sm text-[var(--theme-text-muted)] print:text-gray-600">{c.mobile}</p>}
              <p className="text-sm text-[var(--theme-text-muted)] print:text-gray-600">{o.address || c?.address || '—'}</p>
              <p className="text-sm text-[var(--theme-text-muted)] print:text-gray-600">{o.pincode || c?.pincode || ''}</p>
            </div>
          </div>

          <Separator className="mb-6 bg-white/[0.08] print:bg-gray-200" />

          {/* Items Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm print:text-black">
              <thead>
                <tr className="border-b-2 border-white/[0.08] print:border-gray-300">
                  <th className="text-left py-3 font-semibold text-[var(--theme-text-muted)] print:text-gray-600">Item</th>
                  <th className="text-center py-3 font-semibold text-[var(--theme-text-muted)] print:text-gray-600 hidden sm:table-cell">Size</th>
                  <th className="text-center py-3 font-semibold text-[var(--theme-text-muted)] print:text-gray-600">Qty</th>
                  <th className="text-right py-3 font-semibold text-[var(--theme-text-muted)] print:text-gray-600">Price</th>
                  <th className="text-right py-3 font-semibold text-[var(--theme-text-muted)] print:text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const lineTotal = Number(item.price) * Number(item.quantity);
                  return (
                    <tr key={item.id} className="border-b border-white/[0.05] print:border-gray-200 hover:bg-white/[0.02] print:hover:bg-transparent transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white/5 print:bg-gray-100 overflow-hidden flex-shrink-0">
                            {item.product_image ? (
                              <img src={item.product_image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><Package className="h-4 w-4 text-white/20 print:text-gray-400" /></div>
                            )}
                          </div>
                          <span className="font-medium text-[var(--theme-text)] print:text-black">{item.product_name}</span>
                        </div>
                      </td>
                      <td className="text-center py-3 hidden sm:table-cell text-[var(--theme-text-muted)] print:text-gray-600">{item.size || '—'}</td>
                      <td className="text-center py-3 text-[var(--theme-text)] print:text-black">{item.quantity}</td>
                      <td className="text-right py-3 text-[var(--theme-text)] print:text-black">₹{Number(item.price).toLocaleString('en-IN')}</td>
                      <td className="text-right py-3 font-medium text-[var(--theme-text)] print:text-black">₹{lineTotal.toLocaleString('en-IN')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2.5 print:text-black">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--theme-text-muted)] print:text-gray-600">Subtotal</span>
                <span className="text-[var(--theme-text)] print:text-black">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--theme-text-muted)] print:text-gray-600">Shipping</span>
                <span className="text-emerald-400 print:text-emerald-600 font-medium">FREE</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--theme-text-muted)] print:text-gray-600">Tax (5%)</span>
                <span className="text-[var(--theme-text)] print:text-black">₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <Separator className="bg-white/[0.08] print:bg-gray-200" />
              <div className="flex justify-between text-lg font-bold pt-1">
                <span className="text-[var(--theme-text)] print:text-black">Grand Total</span>
                <span className="bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] bg-clip-text text-transparent print:text-[var(--theme-primary)]">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <Separator className="my-6 bg-white/[0.08] print:bg-gray-200" />

          {/* Terms */}
          {s.terms && (
            <div className="text-xs text-[var(--theme-text-muted)] print:text-gray-600">
              <p className="font-semibold text-[var(--theme-text)] print:text-black mb-1">Terms & Conditions</p>
              <p className="whitespace-pre-line leading-relaxed">{s.terms}</p>
            </div>
          )}

          <div className="text-center mt-8 text-xs text-white/30 print:text-gray-400">
            <p>Thank you for shopping with {s.shop_name || 'ClothFasion'}!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
