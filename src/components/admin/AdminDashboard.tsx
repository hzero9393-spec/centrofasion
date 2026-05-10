'use client';

import React, { useEffect, useState } from 'react';
import {
  DollarSign, ShoppingBag, Users, TrendingUp, TrendingDown, AlertTriangle
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

interface DashboardData {
  stats: { total_orders: string; total_revenue: string; total_customers: string; total_profit: string };
  topProducts: { product_name: string; sold: string; revenue: string }[];
  topCategories: { name: string; sold: string; product_count: string }[];
  revenueByMonth: { month: string; revenue: string; orders: string }[];
  ordersByWeek: { week: string; orders: string }[];
}

const PIE_COLORS = ['#28A745', 'var(--theme-primary)', '#FFC107', '#DC3545', '#6366F1'];

/* ---------- Custom tooltip for all charts ---------- */
const DarkTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color?: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl px-4 py-3 shadow-xl">
      {label && <p className="text-xs text-[var(--theme-text-muted)] mb-1.5">{label}</p>}
      {payload.map((item, i) => (
        <p key={i} className="text-sm text-[var(--theme-text)] font-medium">
          {item.name && <span className="text-[var(--theme-text-muted)] mr-1.5">{item.name}:</span>}
          {item.name === 'Revenue'
            ? `₹${item.value.toLocaleString('en-IN')}`
            : item.value.toLocaleString('en-IN')}
        </p>
      ))}
    </div>
  );
};

/* ---------- Order Status Pie ---------- */
const StatusPie = ({ data }: { data: { name: string; value: number; color: string }[] }) => (
  <ResponsiveContainer width="100%" height={260}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={60}
        outerRadius={90}
        dataKey="value"
        strokeWidth={2}
        stroke="var(--theme-card)"
      >
        {data.map((entry, i) => (
          <Cell key={i} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip
        content={<DarkTooltip />}
        formatter={(value: number) => value.toLocaleString('en-IN')}
      />
      <Legend
        wrapperStyle={{ paddingTop: 12 }}
        formatter={(value: string) => (
          <span className="text-xs text-[var(--theme-text-muted)]">{value}</span>
        )}
      />
    </PieChart>
  </ResponsiveContainer>
);

/* ---------- Skeleton ---------- */
const DarkSkeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-[var(--theme-surface)] rounded-xl ${className ?? ''}`} />
);

/* ---------- Main Component ---------- */
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
        { label: 'Revenue', value: Number(data.stats.total_revenue), trend: 12, icon: DollarSign, gradient: true },
        { label: 'Orders', value: Number(data.stats.total_orders), trend: 8, icon: ShoppingBag, gradient: false },
        { label: 'Customers', value: Number(data.stats.total_customers), trend: 15, icon: Users, gradient: false },
        { label: 'Profit', value: Number(data.stats.total_profit), trend: 10, icon: TrendingUp, gradient: true },
      ]
    : [];

  const revenueData = data?.revenueByMonth
    ?.slice()
    .reverse()
    .map((m) => ({ month: m.month?.slice(2) || '', revenue: Number(m.revenue) })) || [];

  const orderStatusData = [
    { name: 'Delivered', value: 45, color: '#28A745' },
    { name: 'Shipped', value: 25, color: 'var(--theme-primary)' },
    { name: 'Processing', value: 20, color: '#FFC107' },
    { name: 'Cancelled', value: 10, color: '#DC3545' },
  ];

  const categoryData = data?.topCategories?.map((c) => ({ name: c.name, sold: Number(c.sold) })) || [];

  const lowStock = data?.topProducts?.filter((p) => Number(p.sold) < 50).slice(0, 5) || [];

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl p-5">
              <DarkSkeleton className="h-24 w-full" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl p-6">
              <DarkSkeleton className="h-72 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ===== KPI Cards ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          const isCurrency = kpi.label === 'Revenue' || kpi.label === 'Profit';
          return (
            <div
              key={kpi.label}
              className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl p-5 hover:bg-[var(--theme-surface)] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-[var(--theme-text-muted)]">{kpi.label}</p>
                  <p className="text-2xl font-bold text-[var(--theme-text)] tracking-tight">
                    {isCurrency
                      ? `₹${kpi.value.toLocaleString('en-IN')}`
                      : kpi.value.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--theme-surface)]">
                  <Icon className="h-5 w-5 text-[var(--theme-text-muted)]" />
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
                <span className="text-xs text-[var(--theme-text-muted)] ml-0.5">vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== Charts Row ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Trend */}
        <div className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl p-6">
          <h3 className="text-base font-semibold text-[var(--theme-text)] mb-5">Revenue Trend</h3>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradDark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--theme-primary)" stopOpacity={0.3} />
                    <stop offset="50%" stopColor="var(--theme-primary)" stopOpacity={0.1} />
                    <stop offset="100%" stopColor="var(--theme-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: 'var(--theme-text-muted)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: 'var(--theme-text-muted)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<DarkTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="var(--theme-primary)"
                  strokeWidth={2.5}
                  fill="url(#revenueGradDark)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-[var(--theme-text-muted)] text-sm">
              No revenue data yet
            </div>
          )}
        </div>

        {/* Order Status Distribution */}
        <div className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl p-6">
          <h3 className="text-base font-semibold text-[var(--theme-text)] mb-5">Order Status</h3>
          <StatusPie data={orderStatusData} />
        </div>
      </div>

      {/* ===== Bottom Row ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Selling Products */}
        <div className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl p-6">
          <h3 className="text-base font-semibold text-[var(--theme-text)] mb-4">Top Selling Products</h3>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--theme-text-muted)] border-b border-[var(--theme-border)]">
                  <th className="pb-3 font-medium">#</th>
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium text-right">Units</th>
                  <th className="pb-3 font-medium text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data?.topProducts?.map((p, i) => (
                  <tr
                    key={i}
                    className="border-b border-[var(--theme-border)] last:border-0 hover:bg-[var(--theme-surface)] transition-colors"
                  >
                    <td className="py-3 text-[var(--theme-text-muted)]">{i + 1}</td>
                    <td className="py-3 font-medium text-[var(--theme-text)] max-w-[160px] truncate">
                      {p.product_name}
                    </td>
                    <td className="py-3 text-right text-[var(--theme-text)]">
                      {Number(p.sold).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 text-right font-medium text-[var(--theme-text)]">
                      ₹{Number(p.revenue).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl p-6">
          <h3 className="text-base font-semibold text-[var(--theme-text)] mb-5">Top Categories</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData} layout="vertical">
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--theme-primary)" />
                    <stop offset="100%" stopColor="var(--theme-secondary)" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: 'var(--theme-text-muted)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12, fill: 'var(--theme-text-muted)' }}
                  axisLine={false}
                  tickLine={false}
                  width={100}
                />
                <Tooltip content={<DarkTooltip />} />
                <Bar dataKey="sold" name="Units Sold" fill="url(#barGrad)" radius={[0, 6, 6, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-[var(--theme-text-muted)] text-sm">
              No category data yet
            </div>
          )}
        </div>
      </div>

      {/* ===== Low Stock Alert ===== */}
      {data?.topProducts && (
        <div className="bg-[#FFC107]/5 border border-[#FFC107]/20 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-[#FFC107]" />
            <h3 className="text-base font-semibold text-[var(--theme-text)]">Low Stock Alert</h3>
          </div>
          {lowStock.length > 0 ? (
            <div className="space-y-2">
              {lowStock.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-[var(--theme-surface)] hover:bg-[var(--theme-surface)] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-[#DC3545]" />
                    <span className="text-sm text-[var(--theme-text)] font-medium">{p.product_name}</span>
                  </div>
                  <span className="text-sm text-[#DC3545] font-medium">{Number(p.sold)} units</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--theme-text-muted)]">All products are well stocked!</p>
          )}
        </div>
      )}
    </div>
  );
}
