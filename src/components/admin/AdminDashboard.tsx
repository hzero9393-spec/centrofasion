'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DollarSign, ShoppingBag, Users, TrendingUp, TrendingDown, AlertTriangle
} from 'lucide-react';
import {
  LineChart, Line, Area, AreaChart, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

interface DashboardData {
  stats: { total_orders: string; total_revenue: string; total_customers: string; total_profit: string };
  topProducts: { product_name: string; sold: string; revenue: string }[];
  topCategories: { name: string; sold: string; product_count: string }[];
  revenueByMonth: { month: string; revenue: string; orders: string }[];
  ordersByWeek: { week: string; orders: string }[];
}

const PIE_COLORS = ['#28A745', '#FF5722', '#FFC107', '#DC3545', '#3B82F6'];

const StatusPie = ({ data }: { data: { name: string; value: number; color: string }[] }) => (
  <ResponsiveContainer width="100%" height={260}>
    <PieChart>
      <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" strokeWidth={2} stroke="#fff">
        {data.map((entry, i) => (
          <Cell key={i} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip formatter={(value: number) => value.toLocaleString('en-IN')} />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
);

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const kpis = data
    ? [
        { label: 'Revenue', value: Number(data.stats.total_revenue), trend: 12, icon: DollarSign, color: '#FF5722', bg: '#FFF3E0' },
        { label: 'Orders', value: Number(data.stats.total_orders), trend: 8, icon: ShoppingBag, color: '#3B82F6', bg: '#E3F2FD' },
        { label: 'Customers', value: Number(data.stats.total_customers), trend: 15, icon: Users, color: '#28A745', bg: '#E8F5E9' },
        { label: 'Profit', value: Number(data.stats.total_profit), trend: 10, icon: TrendingUp, color: '#7B1FA2', bg: '#F3E5F5' },
      ]
    : [];

  const revenueData = data?.revenueByMonth
    ?.slice()
    .reverse()
    .map((m) => ({ month: m.month?.slice(2) || '', revenue: Number(m.revenue) })) || [];

  const orderStatusData = [
    { name: 'Delivered', value: 45, color: '#28A745' },
    { name: 'Shipped', value: 25, color: '#FF5722' },
    { name: 'Processing', value: 20, color: '#FFC107' },
    { name: 'Cancelled', value: 10, color: '#DC3545' },
  ];

  const categoryData = data?.topCategories?.map((c) => ({ name: c.name, sold: Number(c.sold) })) || [];

  const lowStock = data?.topProducts?.filter((p) => Number(p.sold) < 50).slice(0, 5) || [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-72 w-full" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="border-[#E4E7EC] shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-[#5A6B7F]">{kpi.label}</p>
                    <p className="text-2xl font-bold text-[#1F2A3A]">
                      {kpi.label === 'Revenue' || kpi.label === 'Profit'
                        ? `₹${kpi.value.toLocaleString('en-IN')}`
                        : kpi.value.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: kpi.bg }}>
                    <Icon className="h-5 w-5" style={{ color: kpi.color }} />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  {kpi.trend >= 0 ? (
                    <TrendingUp className="h-3.5 w-3.5 text-[#28A745]" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5 text-[#DC3545]" />
                  )}
                  <span className={`text-xs font-medium ${kpi.trend >= 0 ? 'text-[#28A745]' : 'text-[#DC3545]'}`}>
                    {kpi.trend >= 0 ? '+' : ''}{kpi.trend}%
                  </span>
                  <span className="text-xs text-[#5A6B7F]">vs last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Trend */}
        <Card className="border-[#E4E7EC] shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-base font-semibold text-[#1F2A3A] mb-4">Revenue Trend</h3>
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF5722" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#FF5722" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#5A6B7F' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#5A6B7F' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#FF5722" strokeWidth={2.5} fill="url(#revenueGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-[#5A6B7F] text-sm">No revenue data yet</div>
            )}
          </CardContent>
        </Card>

        {/* Order Status */}
        <Card className="border-[#E4E7EC] shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-base font-semibold text-[#1F2A3A] mb-4">Order Status Distribution</h3>
            <StatusPie data={orderStatusData} />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Products */}
        <Card className="border-[#E4E7EC] shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-base font-semibold text-[#1F2A3A] mb-4">Top Selling Products</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[#5A6B7F] border-b border-[#E4E7EC]">
                    <th className="pb-3 font-medium">#</th>
                    <th className="pb-3 font-medium">Product</th>
                    <th className="pb-3 font-medium text-right">Units</th>
                    <th className="pb-3 font-medium text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.topProducts?.map((p, i) => (
                    <tr key={i} className="admin-row border-b border-[#E4E7EC]/50 last:border-0">
                      <td className="py-3 text-[#5A6B7F]">{i + 1}</td>
                      <td className="py-3 font-medium text-[#1F2A3A] max-w-[160px] truncate">{p.product_name}</td>
                      <td className="py-3 text-right">{Number(p.sold).toLocaleString('en-IN')}</td>
                      <td className="py-3 text-right font-medium">₹{Number(p.revenue).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card className="border-[#E4E7EC] shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-base font-semibold text-[#1F2A3A] mb-4">Top Categories</h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#5A6B7F' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#5A6B7F' }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip />
                  <Bar dataKey="sold" fill="#FF5722" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-[#5A6B7F] text-sm">No category data yet</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {data?.topProducts && (
        <Card className="border-[#FFC107]/30 bg-[#FFFDF5]">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-[#FFC107]" />
              <h3 className="text-base font-semibold text-[#1F2A3A]">Low Stock Alert</h3>
            </div>
            {data.topProducts.length > 0 ? (
              <div className="space-y-2">
                {data.topProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/60">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#DC3545]" />
                      <span className="text-sm text-[#1F2A3A] font-medium">{p.product_name}</span>
                    </div>
                    <span className="text-sm text-[#DC3545] font-medium">{Number(p.sold)} units</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#5A6B7F]">All products are well stocked!</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
