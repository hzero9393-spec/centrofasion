'use client';

import React, { useEffect, useState } from 'react';
import { useNavigation, useAuth } from '@/stores/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { ArrowLeft, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface CustomerData {
  customer: { id: string; first_name: string; last_name: string; mobile: string; address: string; pincode: string; nearby_area: string; total_orders: number; total_spent: number; importance: string; created_at: string };
  orders: { id: string; order_number: string; status: string; total: string; created_at: string; items_count?: number }[];
}

export default function AdminCustomerDetail() {
  const { pageParams, goBack, navigate } = useNavigation();
  const customerId = pageParams.id;
  const [data, setData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customerId) return;
    fetch(`/api/customers?id=${customerId}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [customerId]);

  const c = data?.customer;
  const orders = data?.orders || [];
  const avgOrder = c && c.total_orders > 0 ? Math.round(c.total_spent / c.total_orders) : 0;

  const chartData = orders.slice(0, 10).reverse().map((o, i) => ({
    date: `#${i + 1}`,
    value: Number(o.total),
  }));

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-48 w-full" /><Skeleton className="h-64 w-full" /></div>;
  }

  if (!c) {
    return <Card className="border-[#E4E7EC]"><CardContent className="py-16 text-center text-[#5A6B7F]">Customer not found</CardContent></Card>;
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <Button variant="ghost" onClick={goBack} className="gap-2 text-[#5A6B7F]">
        <ArrowLeft className="h-4 w-4" /> Back to Customers
      </Button>

      {/* Profile Card */}
      <Card className="border-[#E4E7EC]">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-[#FF5722]/10 text-[#FF5722] flex items-center justify-center text-xl font-bold flex-shrink-0">
              {c.first_name?.charAt(0)}{(c.last_name || '').charAt(0)}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-semibold text-[#1F2A3A]">{c.first_name} {c.last_name || ''}</h2>
                <Badge className={c.importance === 'High' ? 'bg-[#E8F5E9] text-[#2E7D32]' : c.importance === 'Medium' ? 'bg-[#FFF8E1] text-[#F57F17]' : 'bg-[#F5F7FA] text-[#5A6B7F]'}>
                  {c.importance || 'Regular'}
                </Badge>
              </div>
              <p className="text-sm text-[#5A6B7F]">{c.mobile || 'No mobile'}</p>
              {c.address && <p className="text-sm text-[#5A6B7F]">{c.address}{c.pincode ? `, ${c.pincode}` : ''}</p>}
              <p className="text-xs text-[#CBD5E1] mt-1">Joined {c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Orders', value: c.total_orders, icon: ShoppingBag, color: '#3B82F6', bg: '#E3F2FD' },
          { label: 'Total Spent', value: `₹${c.total_spent.toLocaleString('en-IN')}`, icon: DollarSign, color: '#28A745', bg: '#E8F5E9' },
          { label: 'Avg Order Value', value: `₹${avgOrder.toLocaleString('en-IN')}`, icon: TrendingUp, color: '#FF5722', bg: '#FFF3E0' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border-[#E4E7EC]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                    <Icon className="h-5 w-5" style={{ color: s.color }} />
                  </div>
                  <div>
                    <p className="text-xs text-[#5A6B7F]">{s.label}</p>
                    <p className="text-lg font-bold text-[#1F2A3A]">{s.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Value Chart */}
      {chartData.length > 1 && (
        <Card className="border-[#E4E7EC]">
          <CardContent className="p-6">
            <h3 className="text-base font-semibold text-[#1F2A3A] mb-4">Customer Lifetime Value</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#5A6B7F' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#5A6B7F' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Order Value']} />
                <Line type="monotone" dataKey="value" stroke="#FF5722" strokeWidth={2} dot={{ r: 4, fill: '#FF5722' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Order History */}
      <Card className="border-[#E4E7EC]">
        <CardContent className="p-6">
          <h3 className="text-base font-semibold text-[#1F2A3A] mb-4">Order History</h3>
          {orders.length === 0 ? (
            <p className="text-sm text-[#5A6B7F] text-center py-8">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F5F7FA] hover:bg-[#F5F7FA]">
                    <TableHead className="font-medium">Order ID</TableHead>
                    <TableHead className="font-medium hidden sm:table-cell">Date</TableHead>
                    <TableHead className="font-medium text-right hidden sm:table-cell">Items</TableHead>
                    <TableHead className="font-medium text-right">Total</TableHead>
                    <TableHead className="font-medium">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o, i) => (
                    <TableRow
                      key={o.id}
                      className={`admin-row cursor-pointer ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}
                      onClick={() => navigate('admin-order-detail', { id: o.id })}
                    >
                      <TableCell>
                        <span className="font-medium text-[#FF5722]">{o.order_number || o.id?.slice(0, 8)}</span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-[#5A6B7F]">
                        {o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN') : '—'}
                      </TableCell>
                      <TableCell className="text-right hidden sm:table-cell text-[#5A6B7F]">—</TableCell>
                      <TableCell className="text-right font-medium">₹{Number(o.total).toLocaleString('en-IN')}</TableCell>
                      <TableCell>
                        <Badge className={`badge-${o.status?.toLowerCase()}`}>{o.status || 'Pending'}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
