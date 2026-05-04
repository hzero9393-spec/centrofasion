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

  if (loading) return <div className="space-y-4"><Skeleton className="h-[600px] w-full max-w-3xl mx-auto" /></div>;
  if (!data || !data.order) return <Card className="border-[#E4E7EC]"><CardContent className="py-16 text-center text-[#5A6B7F]">Order not found</CardContent></Card>;

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
        <Button variant="ghost" onClick={goBack} className="gap-2 text-[#5A6B7F]">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </div>

      {/* Print button - hidden in print */}
      <div className="print:hidden flex justify-end">
        <Button className="bg-[#FF5722] hover:bg-[#E64A19] text-white gap-2" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Print Invoice
        </Button>
      </div>

      {/* Invoice Card */}
      <Card className="border-[#E4E7EC] max-w-3xl mx-auto print:border-0 print:shadow-none">
        <CardContent className="p-8 print:p-0">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-xl font-bold text-[#1F2A3A]">{s.shop_name || 'ClothFasion'}</h1>
              {s.gst_no && <p className="text-sm text-[#5A6B7F]">GST: {s.gst_no}</p>}
              <p className="text-sm text-[#5A6B7F]">{s.address || 'Store Address'}</p>
              <p className="text-sm text-[#5A6B7F]">{s.shop_phone || '+91 XXXXXXXXXX'}</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-[#FF5722]">INVOICE</h2>
              <p className="text-sm text-[#5A6B7F] mt-1">#{o.order_number || o.id?.slice(0, 8)}</p>
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
            <div>
              <p className="text-[#5A6B7F] text-xs mb-1">Order Date</p>
              <p className="font-medium">{o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</p>
              <p className="text-[#5A6B7F] text-xs mb-1 mt-3">Delivery Date</p>
              <p className="font-medium">{deliveryDate || 'Expected in 4 days'}</p>
            </div>
            <div>
              <p className="text-[#5A6B7F] text-xs mb-1">Payment Method</p>
              <p className="font-medium">{o.payment_method || 'COD'}</p>
            </div>
          </div>

          {/* Bill To */}
          <div className="mb-6">
            <p className="text-xs text-[#5A6B7F] mb-2">BILL TO</p>
            <div className="bg-[#F5F7FA] rounded-lg p-4">
              <p className="font-semibold text-[#1F2A3A]">{c?.first_name} {c?.last_name || ''}</p>
              {c?.mobile && <p className="text-sm text-[#5A6B7F]">{c.mobile}</p>}
              <p className="text-sm text-[#5A6B7F]">{o.address || c?.address || '—'}</p>
              <p className="text-sm text-[#5A6B7F]">{o.pincode || c?.pincode || ''}</p>
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Items Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[#1F2A3A]">
                  <th className="text-left py-3 font-semibold">Item</th>
                  <th className="text-center py-3 font-semibold hidden sm:table-cell">Size</th>
                  <th className="text-center py-3 font-semibold">Qty</th>
                  <th className="text-right py-3 font-semibold">Price</th>
                  <th className="text-right py-3 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const lineTotal = Number(item.price) * Number(item.quantity);
                  return (
                    <tr key={item.id} className="border-b border-[#E4E7EC]">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#F5F7FA] overflow-hidden flex-shrink-0">
                            {item.product_image ? (
                              <img src={item.product_image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><Package className="h-4 w-4 text-[#CBD5E1]" /></div>
                            )}
                          </div>
                          <span className="font-medium">{item.product_name}</span>
                        </div>
                      </td>
                      <td className="text-center py-3 hidden sm:table-cell text-[#5A6B7F]">{item.size || '—'}</td>
                      <td className="text-center py-3">{item.quantity}</td>
                      <td className="text-right py-3">₹{Number(item.price).toLocaleString('en-IN')}</td>
                      <td className="text-right py-3 font-medium">₹{lineTotal.toLocaleString('en-IN')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#5A6B7F]">Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#5A6B7F]">Shipping</span>
                <span className="text-[#28A745]">FREE</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#5A6B7F]">Tax (5%)</span>
                <span>₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Grand Total</span>
                <span className="text-[#FF5722]">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Terms */}
          {s.terms && (
            <div className="text-xs text-[#5A6B7F]">
              <p className="font-semibold text-[#1F2A3A] mb-1">Terms & Conditions</p>
              <p className="whitespace-pre-line">{s.terms}</p>
            </div>
          )}

          <div className="text-center mt-8 text-xs text-[#CBD5E1]">
            <p>Thank you for shopping with {s.shop_name || 'ClothFasion'}!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
