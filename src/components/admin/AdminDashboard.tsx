'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { TrendingUp, TrendingDown, ShoppingCart, Users, IndianRupee, DollarSign } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { toast } from 'sonner';

interface DashboardData {
  stats: {
    total_orders: number;
    total_revenue: number;
    total_customers: number;
    total_profit: number;
  };
  topProducts: { product_name: string; sold: number; revenue: number }[];
  topCategories: { name: string; product_count: number; sold: number }[];
  revenueByMonth: { month: string; revenue: number; orders: number }[];
  ordersByWeek: { week: string; orders: number }[];
}

const fmt = (n: number) => `₹${Number(n).toLocaleString('en-IN')}`;

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/admin');
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        setData(json);
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const kpis = data
    ? [
        { label: 'Revenue', value: fmt(data.stats.total_revenue), icon: IndianRupee, trend: '+12.5%', up: true },
        { label: 'Orders', value: String(data.stats.total_orders), icon: ShoppingCart, trend: '+8.2%', up: true },
        { label: 'Customers', value: String(data.stats.total_customers), icon: Users, trend: '+4.1%', up: true },
        { label: 'Profit', value: fmt(data.stats.total_profit), icon: DollarSign, trend: '+15.3%', up: true },
      ]
    : [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-[var(--font-poppins)] text-[#111111]">Dashboard</h1>
        <p className="text-gray-500 text-sm">Welcome back! Here&apos;s your store overview.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="rounded-xl shadow-sm border-0">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{kpi.label}</p>
                    <p className="text-2xl font-bold text-[#111111] mt-1">{kpi.value}</p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-[#F8F9FB] flex items-center justify-center">
                    <Icon className="h-5 w-5 text-[#FF6A00]" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  {kpi.up ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-xs font-medium ${kpi.up ? 'text-green-500' : 'text-red-500'}`}>
                    {kpi.trend}
                  </span>
                  <span className="text-xs text-gray-400">vs last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Line Chart */}
        <Card className="rounded-xl shadow-sm border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[#111111]">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={(data?.revenueByMonth || []).reverse()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#999" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#999" tickFormatter={(v) => `₹${(Number(v) / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value: number) => [fmt(value), 'Revenue']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#FF6A00" strokeWidth={2.5} dot={{ fill: '#FF6A00', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Orders Bar Chart */}
        <Card className="rounded-xl shadow-sm border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[#111111]">Orders Per Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.ordersByWeek || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="#999" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#999" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="orders" fill="#111111" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Products */}
        <Card className="rounded-xl shadow-sm border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[#111111]">Top 5 Products</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Sold</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.topProducts || []).map((p, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium text-sm">{String(p.product_name)}</TableCell>
                    <TableCell className="text-right text-sm">{Number(p.sold)}</TableCell>
                    <TableCell className="text-right text-sm font-medium">{fmt(Number(p.revenue))}</TableCell>
                  </TableRow>
                ))}
                {(!data?.topProducts || data.topProducts.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-gray-400 py-8">
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card className="rounded-xl shadow-sm border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[#111111]">Top 5 Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Products</TableHead>
                  <TableHead className="text-right">Sold</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.topCategories || []).map((c, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium text-sm">{String(c.name)}</TableCell>
                    <TableCell className="text-right text-sm">{Number(c.product_count)}</TableCell>
                    <TableCell className="text-right text-sm font-medium">{Number(c.sold)}</TableCell>
                  </TableRow>
                ))}
                {(!data?.topCategories || data.topCategories.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-gray-400 py-8">
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
