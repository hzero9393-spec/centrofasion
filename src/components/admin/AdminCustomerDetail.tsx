'use client';

import React, { useEffect, useState } from 'react';
import { useAdminNavigation } from '@/stores/adminNavigation';
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

const importanceBadge = (imp: string) => {
  if (imp === 'High') return 'bg-[#4ADE80]/10 text-[#4ADE80] border border-[#4ADE80]/20';
  if (imp === 'Medium') return 'bg-[#FBBF24]/10 text-[#FBBF24] border border-[#FBBF24]/20';
  return 'bg-white/5 text-[var(--theme-text-muted)] border border-white/10';
};

export default function AdminCustomerDetail() {
  const { pageParams, goBack, navigate } = useAdminNavigation();
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
    return (
      <div className="space-y-5">
        <Skeleton className="h-10 w-40 bg-white/5 rounded-xl" />
        <Skeleton className="h-48 w-full bg-white/5 rounded-2xl" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 bg-white/5 rounded-2xl" />)}
        </div>
        <Skeleton className="h-64 w-full bg-white/5 rounded-2xl" />
      </div>
    );
  }

  if (!c) {
    return (
      <div className="bg-[var(--theme-card)] border border-white/[0.08] rounded-2xl p-16 text-center">
        <p className="text-[var(--theme-text-muted)]">Customer not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Back */}
      <Button variant="ghost" onClick={goBack} className="gap-2 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-white/10 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Customers
      </Button>

      {/* Profile Card */}
      <div className="bg-[var(--theme-card)] border border-white/[0.08] rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-secondary)] text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
            {c.first_name?.charAt(0)}{(c.last_name || '').charAt(0)}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-semibold text-[var(--theme-text)] tracking-tight">{c.first_name} {c.last_name || ''}</h2>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${importanceBadge(c.importance)}`}>
                {c.importance || 'Regular'}
              </span>
            </div>
            <p className="text-sm text-[var(--theme-text-muted)]">{c.mobile || 'No mobile'}</p>
            {c.address && <p className="text-sm text-[var(--theme-text-muted)]">{c.address}{c.pincode ? `, ${c.pincode}` : ''}</p>}
            <p className="text-xs text-white/40 mt-1">
              Joined {c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Orders', value: c.total_orders, icon: ShoppingBag, color: '#60A5FA' },
          { label: 'Total Spent', value: `₹${c.total_spent.toLocaleString('en-IN')}`, icon: DollarSign, color: '#4ADE80' },
          { label: 'Avg Order Value', value: `₹${avgOrder.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'var(--theme-primary)' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-[var(--theme-card)] border border-white/[0.08] rounded-2xl p-5">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/[0.08] flex items-center justify-center">
                  <Icon className="h-5 w-5" style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-xs text-[var(--theme-text-muted)] uppercase tracking-wider">{s.label}</p>
                  <p className="text-xl font-bold text-[var(--theme-text)] mt-0.5">{s.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Value Chart */}
      {chartData.length > 1 && (
        <div className="bg-[var(--theme-card)] border border-white/[0.08] rounded-2xl p-6">
          <h3 className="text-base font-semibold text-[var(--theme-text)] mb-5 tracking-tight">Customer Lifetime Value</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--theme-text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--theme-text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#2D2D2F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'var(--theme-text)' }}
                formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Order Value']}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="url(#accentGradient)"
                strokeWidth={2.5}
                dot={{ r: 4, fill: 'var(--theme-primary)', stroke: 'var(--theme-card)', strokeWidth: 2 }}
              />
              <defs>
                <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--theme-primary)" />
                  <stop offset="100%" stopColor="var(--theme-secondary)" />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Order History */}
      <div className="bg-[var(--theme-card)] border border-white/[0.08] rounded-2xl p-6">
        <h3 className="text-base font-semibold text-[var(--theme-text)] mb-5 tracking-tight">Order History</h3>
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="h-10 w-10 mx-auto mb-3 text-white/20" />
            <p className="text-sm text-[var(--theme-text-muted)]">No orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-white/[0.08]">
                  <TableHead className="font-medium text-[var(--theme-text-muted)] text-xs uppercase tracking-wider">Order ID</TableHead>
                  <TableHead className="font-medium text-[var(--theme-text-muted)] text-xs uppercase tracking-wider hidden sm:table-cell">Date</TableHead>
                  <TableHead className="font-medium text-[var(--theme-text-muted)] text-xs uppercase tracking-wider text-right hidden sm:table-cell">Items</TableHead>
                  <TableHead className="font-medium text-[var(--theme-text-muted)] text-xs uppercase tracking-wider text-right">Total</TableHead>
                  <TableHead className="font-medium text-[var(--theme-text-muted)] text-xs uppercase tracking-wider">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o, i) => (
                  <TableRow
                    key={o.id}
                    className={`cursor-pointer border-b border-white/[0.04] hover:bg-white/5 transition-colors ${i % 2 === 1 ? 'bg-white/[0.02]' : ''}`}
                    onClick={() => navigate('order-detail', { id: o.id })}
                  >
                    <TableCell>
                      <span className="font-medium text-[var(--theme-primary)]">{o.order_number || o.id?.slice(0, 8)}</span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-[var(--theme-text-muted)]">
                      {o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN') : '—'}
                    </TableCell>
                    <TableCell className="text-right hidden sm:table-cell text-[var(--theme-text-muted)]">—</TableCell>
                    <TableCell className="text-right font-medium text-[var(--theme-text)]">₹{Number(o.total).toLocaleString('en-IN')}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge(o.status)}`}>
                        {o.status || 'Pending'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
