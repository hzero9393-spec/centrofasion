'use client';

import React, { useEffect, useState } from 'react';
import { useNavigation } from '@/stores/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { ArrowLeft, Printer, Phone, MapPin } from 'lucide-react';
import Image from 'next/image';

interface ShopInfo {
  shop_name: string;
  logo: string;
  gst_no: string;
  shop_phone: string;
  address: string;
  terms: string;
}

interface OrderItem {
  product_name: string;
  product_image: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
}

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export default function AdminInvoice() {
  const { pageParams, navigate } = useNavigation();
  const orderId = pageParams.id;

  const [shop, setShop] = useState<ShopInfo | null>(null);
  const [order, setOrder] = useState<any | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [customer, setCustomer] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    const fetchData = async () => {
      try {
        const [shopRes, orderRes] = await Promise.all([
          fetch('/api/shop'),
          fetch(`/api/orders/${orderId}?order_id=${orderId}`),
        ]);

        const shopJson = await shopRes.json();
        setShop(shopJson || {});

        const orderJson = await orderRes.json();
        setOrder(orderJson.order);
        setItems(orderJson.items || []);
        setCustomer(orderJson.customer);
      } catch {
        toast.error('Failed to load invoice data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-[600px] rounded-xl" />
      </div>
    );
  }

  if (!order || !shop) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p>Invoice data not available</p>
      </div>
    );
  }

  const deliveryDate = new Date(order.created_at);
  deliveryDate.setDate(deliveryDate.getDate() + 4);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between no-print">
        <Button
          variant="ghost"
          onClick={() => navigate('admin-orders')}
          className="rounded-xl text-gray-600"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
        <Button
          onClick={() => window.print()}
          className="bg-[#111111] hover:bg-[#333333] text-white rounded-xl"
        >
          <Printer className="h-4 w-4 mr-2" />
          Print Invoice
        </Button>
      </div>

      {/* Invoice Content */}
      <Card className="rounded-xl shadow-sm border-0 max-w-3xl mx-auto print:shadow-none print:border">
        <CardContent className="p-8 print:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              {shop.logo ? (
                <Image src={shop.logo} alt={String(shop.shop_name)} width={56} height={56} className="rounded-xl" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-[#111111] flex items-center justify-center">
                  <span className="text-white font-bold text-lg">CF</span>
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-[#111111] font-[var(--font-poppins)]">
                  {String(shop.shop_name || 'ClothFasion')}
                </h1>
                <p className="text-sm text-gray-500">{String(shop.address || '')}</p>
                {shop.gst_no && <p className="text-sm text-gray-500">GST: {String(shop.gst_no)}</p>}
                {shop.shop_phone && <p className="text-sm text-gray-500">Phone: {String(shop.shop_phone)}</p>}
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-[#111111] font-[var(--font-poppins)]">INVOICE</h2>
              <p className="text-sm text-gray-500 mt-1">
                Invoice #: {String(order.order_number)}
              </p>
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Invoice Details</p>
              <p className="text-sm text-gray-700">
                <span className="text-gray-500">Order Date:</span>{' '}
                {new Date(order.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
              <p className="text-sm text-gray-700">
                <span className="text-gray-500">Delivery Date:</span>{' '}
                {deliveryDate.toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Bill To</p>
              {customer && (
                <>
                  <p className="text-sm font-medium text-[#111111]">
                    {String(customer.first_name)} {String(customer.last_name || '')}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <Phone className="h-3 w-3" /> {String(customer.mobile)}
                  </p>
                  {(customer.address || order.address) && (
                    <p className="text-sm text-gray-600 flex items-start gap-1 mt-1">
                      <MapPin className="h-3 w-3 mt-0.5 shrink-0" /> {String(customer.address || order.address)}
                      {order.pincode ? `, ${String(order.pincode)}` : ''}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Products Table */}
          <Table className="mb-6">
            <TableHeader>
              <TableRow className="bg-[#F8F9FB]">
                <TableHead className="text-xs font-semibold">Product</TableHead>
                <TableHead className="text-xs font-semibold text-center">Qty</TableHead>
                <TableHead className="text-xs font-semibold text-right">Price</TableHead>
                <TableHead className="text-xs font-semibold text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {item.product_image && (
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          <Image src={item.product_image} alt="" width={40} height={40} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-[#111111]">{String(item.product_name)}</p>
                        {item.size && <p className="text-xs text-gray-400">Size: {String(item.size)}</p>}
                        {item.color && <p className="text-xs text-gray-400">Color: {String(item.color)}</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-sm">{Number(item.quantity)}</TableCell>
                  <TableCell className="text-right text-sm">{fmt(Number(item.price))}</TableCell>
                  <TableCell className="text-right font-medium text-sm">
                    {fmt(Number(item.price) * Number(item.quantity))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-[#111111]">{fmt(order.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span className="text-[#FF6A00]">{fmt(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Terms */}
          {shop.terms && (
            <>
              <Separator className="my-6" />
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                  Terms & Conditions
                </p>
                <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-wrap">
                  {String(shop.terms)}
                </p>
              </div>
            </>
          )}

          {/* Footer */}
          <Separator className="my-6" />
          <div className="text-center">
            <p className="text-xs text-gray-400">
              Thank you for your purchase! If you have any questions, contact us at{' '}
              {shop.shop_phone ? String(shop.shop_phone) : 'our support team'}.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
