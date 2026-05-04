'use client';

import React, { useEffect, useState } from 'react';
import { useNavigation, type Page } from '@/stores/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { ArrowLeft, Phone, MapPin, Calendar, CreditCard, FileText, Truck, Package } from 'lucide-react';
import Image from 'next/image';

interface OrderInfo {
  id: string;
  order_number: string;
  customer_id: string;
  status: string;
  total: number;
  address: string;
  pincode: string;
  payment_method: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
}

interface CustomerInfo {
  id: string;
  first_name: string;
  last_name: string;
  mobile: string;
  address: string;
  pincode: string;
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

export default function AdminOrderDetail() {
  const { pageParams, navigate } = useNavigation();
  const orderId = pageParams.id;

  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [customer, setCustomer] = useState<CustomerInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}?order_id=${orderId}`);
        const json = await res.json();
        setOrder(json.order);
        setItems(json.items || []);
        setCustomer(json.customer);
      } catch {
        toast.error('Failed to fetch order');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return;
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order.id, status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(`Status updated to ${newStatus}`);
      setOrder({ ...order, status: newStatus });
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16 text-gray-400">
        <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p>Order not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('admin-orders')}
          className="rounded-xl text-gray-600"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
        <div className="flex gap-2">
          <Select value={order.status} onValueChange={handleStatusUpdate}>
            <SelectTrigger className="w-44 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusFlow.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
              <SelectItem value="Cancelled" className="text-red-500">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => navigate('admin-invoice' as Page, { id: order.id })}
          >
            <FileText className="h-4 w-4 mr-2" />
            Invoice
          </Button>
        </div>
      </div>

      {/* Order Info + Customer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Order Info */}
        <Card className="rounded-xl shadow-sm border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Package className="h-4 w-4" />
              Order Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Order Number</span>
              <span className="text-sm font-semibold text-[#FF6A00]">{String(order.order_number)}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Date</span>
              <span className="text-sm text-gray-700">
                {new Date(order.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Status</span>
              <Badge variant="secondary" className={statusColor(order.status)}>
                {order.status}
              </Badge>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Payment</span>
              <span className="text-sm text-gray-700 flex items-center gap-1">
                <CreditCard className="h-3.5 w-3.5" /> {String(order.payment_method || 'COD')}
              </span>
            </div>
            {order.notes && (
              <>
                <Separator />
                <div>
                  <span className="text-sm text-gray-500">Notes</span>
                  <p className="text-sm text-gray-700 mt-1">{String(order.notes)}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card className="rounded-xl shadow-sm border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Delivery Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {customer && (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Customer</span>
                  <button
                    className="text-sm font-medium text-[#FF6A00] hover:underline text-right"
                    onClick={() => navigate('admin-customer-detail', { id: order.customer_id })}
                  >
                    {String(customer.first_name)} {String(customer.last_name || '')}
                  </button>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Mobile</span>
                  <span className="text-sm text-gray-700 flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" /> {String(customer.mobile)}
                  </span>
                </div>
              </>
            )}
            <Separator />
            <div>
              <span className="text-sm text-gray-500">Address</span>
              <p className="text-sm text-gray-700 mt-1">
                {String(order.address || 'N/A')}
                {order.pincode && ` — ${String(order.pincode)}`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card className="rounded-xl shadow-sm border-0 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Color</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
                      {item.product_image && (
                        <Image
                          src={item.product_image}
                          alt={item.product_name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-sm">{String(item.product_name)}</TableCell>
                  <TableCell className="text-sm text-gray-600">{String(item.size || '—')}</TableCell>
                  <TableCell className="text-sm text-gray-600">{String(item.color || '—')}</TableCell>
                  <TableCell className="text-right text-sm">{Number(item.quantity)}</TableCell>
                  <TableCell className="text-right text-sm">{fmt(Number(item.price))}</TableCell>
                  <TableCell className="text-right font-medium text-sm">
                    {fmt(Number(item.price) * Number(item.quantity))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Total Breakdown */}
          <div className="mt-4 pt-4 border-t space-y-2 max-w-xs ml-auto">
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
        </CardContent>
      </Card>
    </div>
  );
}
