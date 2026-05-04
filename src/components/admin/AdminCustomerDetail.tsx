'use client';

import React, { useEffect, useState } from 'react';
import { useNavigation, type Page } from '@/stores/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { toast } from 'sonner';
import { ArrowLeft, Phone, MapPin, User, Star, ShoppingBag } from 'lucide-react';

interface CustomerDetail {
  id: string;
  first_name: string;
  last_name: string;
  mobile: string;
  avatar: string | null;
  address: string | null;
  pincode: string | null;
  nearby_area: string | null;
  total_orders: number;
  total_spent: number;
  importance: string;
  created_at: string;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
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

export default function AdminCustomerDetail() {
  const { pageParams, navigate } = useNavigation();
  const customerId = pageParams.id;

  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customerId) return;
    const fetchCustomer = async () => {
      try {
        const res = await fetch(`/api/customers?id=${customerId}`);
        const json = await res.json();
        setCustomer(json.customer);
        setOrders(json.orders || []);
      } catch {
        toast.error('Failed to fetch customer');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [customerId]);

  // Build chart data from orders
  const chartData = orders
    .slice()
    .reverse()
    .map((o) => ({
      date: new Date(o.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      amount: Number(o.total),
    }));

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-16 text-gray-400">
        <User className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p>Customer not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <Button
        variant="ghost"
        onClick={() => navigate('admin-customers')}
        className="rounded-xl text-gray-600"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Customers
      </Button>

      {/* Customer Info */}
      <Card className="rounded-xl shadow-sm border-0">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#111111] text-white flex items-center justify-center text-xl font-bold shrink-0">
              {customer.first_name.charAt(0)}{customer.last_name?.charAt(0) || ''}
            </div>
            <div className="flex-1 space-y-2">
              <h2 className="text-xl font-bold font-[var(--font-poppins)] text-[#111111]">
                {customer.first_name} {customer.last_name || ''}
              </h2>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4" /> {customer.mobile}
                </span>
                {customer.address && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" /> {customer.address}{customer.pincode ? `, ${customer.pincode}` : ''}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-3 sm:flex-col text-center">
              <div className="bg-[#F8F9FB] rounded-xl px-4 py-3">
                <p className="text-xs text-gray-500">Total Spent</p>
                <p className="text-lg font-bold text-[#111111]">{fmt(customer.total_spent)}</p>
              </div>
              <div className="bg-[#F8F9FB] rounded-xl px-4 py-3">
                <p className="text-xs text-gray-500">Importance</p>
                <Badge variant="secondary" className={`mt-1 ${
                  customer.importance === 'High' ? 'bg-green-100 text-green-700' :
                  customer.importance === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {customer.importance || 'Low'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 rounded-xl shadow-sm border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Order Value Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#999" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#999" tickFormatter={(v) => `₹${(Number(v)/1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value: number) => [fmt(value), 'Amount']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Line type="monotone" dataKey="amount" stroke="#FF6A00" strokeWidth={2} dot={{ fill: '#FF6A00', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  No order data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Total Orders</span>
              <span className="font-bold text-[#111111]">{customer.total_orders}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Total Spent</span>
              <span className="font-bold text-[#111111]">{fmt(customer.total_spent)}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Avg. Order Value</span>
              <span className="font-bold text-[#111111]">
                {customer.total_orders > 0 ? fmt(Math.round(customer.total_spent / customer.total_orders)) : '₹0'}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Member Since</span>
              <span className="font-medium text-sm text-gray-700">
                {new Date(customer.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order History */}
      <Card className="rounded-xl shadow-sm border-0 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Order History ({orders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow
                  key={order.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => navigate('admin-order-detail' as Page, { id: order.id })}
                >
                  <TableCell className="font-medium text-sm text-[#FF6A00]">
                    {String(order.order_number)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="text-right font-medium text-sm">{fmt(Number(order.total))}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-400">
                    No orders yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
