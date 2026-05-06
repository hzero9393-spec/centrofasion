'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  BarChart3, Users, ShoppingBag, DollarSign, Download, TrendingUp, TrendingDown
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

const REPORT_TYPES = [
  { id: 'profit', title: 'Profit Report', icon: BarChart3, color: '#34D399', gradient: 'from-emerald-500/20 to-emerald-500/5' },
  { id: 'customers', title: 'Customer Report', icon: Users, color: '#60A5FA', gradient: 'from-blue-500/20 to-blue-500/5' },
  { id: 'orders', title: 'Orders Report', icon: ShoppingBag, color: '#F97316', gradient: 'from-orange-500/20 to-orange-500/5' },
  { id: 'revenue', title: 'Revenue Report', icon: DollarSign, color: '#A78BFA', gradient: 'from-violet-500/20 to-violet-500/5' },
];

const PIE_COLORS = ['var(--theme-primary)', '#34D399', '#FBBF24', '#F87171', '#60A5FA', '#A78BFA'];

// Demo data for reports
const generateReportData = (type: string) => {
  switch (type) {
    case 'profit':
      return {
        chart: [
          { month: 'Jan', profit: 45000, expense: 32000 },
          { month: 'Feb', profit: 52000, expense: 35000 },
          { month: 'Mar', profit: 48000, expense: 30000 },
          { month: 'Apr', profit: 61000, expense: 38000 },
          { month: 'May', profit: 55000, expense: 34000 },
          { month: 'Jun', profit: 67000, expense: 40000 },
        ],
        summary: { totalProfit: '₹3,28,000', totalExpense: '₹2,09,000', netMargin: '36.3%' },
        chartType: 'bar',
      };
    case 'customers':
      return {
        chart: [
          { month: 'Jan', new: 45, returning: 120 },
          { month: 'Feb', new: 52, returning: 135 },
          { month: 'Mar', new: 48, returning: 142 },
          { month: 'Apr', new: 61, returning: 155 },
          { month: 'May', new: 55, returning: 148 },
          { month: 'Jun', new: 67, returning: 168 },
        ],
        summary: { totalCustomers: '1,196', newCustomers: '328', returningRate: '72.6%' },
        chartType: 'line',
      };
    case 'orders':
      return {
        chart: [
          { name: 'Pending', value: 35 },
          { name: 'Confirmed', value: 28 },
          { name: 'Packing', value: 22 },
          { name: 'Shipping', value: 45 },
          { name: 'Delivered', value: 180 },
          { name: 'Cancelled', value: 15 },
        ],
        summary: { totalOrders: '325', completed: '55.4%', cancelled: '4.6%' },
        chartType: 'pie',
      };
    case 'revenue':
      return {
        chart: [
          { month: 'Jan', revenue: 125000 },
          { month: 'Feb', revenue: 148000 },
          { month: 'Mar', revenue: 132000 },
          { month: 'Apr', revenue: 165000 },
          { month: 'May', revenue: 158000 },
          { month: 'Jun', revenue: 178000 },
        ],
        summary: { totalRevenue: '₹9,06,000', avgMonthly: '₹1,51,000', growth: '+12.4%' },
        chartType: 'area',
      };
    default:
      return null;
  }
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload) return null;
  return (
    <div className="bg-[var(--theme-card)] border border-white/[0.08] rounded-xl px-4 py-3 shadow-xl">
      <p className="text-[var(--theme-text-muted)] text-xs mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-[var(--theme-text-muted)]">{entry.name}:</span>
          <span className="text-[var(--theme-text)] font-medium">
            {typeof entry.value === 'number' ? `₹${entry.value.toLocaleString('en-IN')}` : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AdminReports() {
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30days');
  const [reportData, setReportData] = useState<ReturnType<typeof generateReportData> | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = (type: string) => {
    setLoading(true);
    setActiveReport(type);
    setTimeout(() => {
      setReportData(generateReportData(type));
      setLoading(false);
    }, 600);
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--theme-text)] tracking-tight">Reports</h1>
          <p className="text-sm text-[var(--theme-text-muted)] mt-1">Generate and download business analytics</p>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {REPORT_TYPES.map((report) => {
          const Icon = report.icon;
          const isActive = activeReport === report.id;
          return (
            <Card
              key={report.id}
              className={`bg-[var(--theme-card)] rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'border-[var(--theme-primary)]/40 shadow-lg shadow-[var(--theme-primary)]/5'
                  : 'border border-white/[0.08] hover:border-white/[0.12]'
              }`}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${report.gradient}`}>
                    <Icon className="h-6 w-6" style={{ color: report.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[var(--theme-text)]">{report.title}</h3>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="h-8 w-[130px] text-xs bg-white/5 border-white/10 text-[var(--theme-text)] focus:ring-[var(--theme-primary)]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[var(--theme-card)] border-white/[0.08]">
                          <SelectItem value="7days" className="text-[var(--theme-text)] focus:bg-white/5 focus:text-[var(--theme-text)]">Last 7 days</SelectItem>
                          <SelectItem value="30days" className="text-[var(--theme-text)] focus:bg-white/5 focus:text-[var(--theme-text)]">Last 30 days</SelectItem>
                          <SelectItem value="90days" className="text-[var(--theme-text)] focus:bg-white/5 focus:text-[var(--theme-text)]">Last 90 days</SelectItem>
                          <SelectItem value="year" className="text-[var(--theme-text)] focus:bg-white/5 focus:text-[var(--theme-text)]">This Year</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        className={`text-xs gap-1.5 transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] text-white'
                            : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                        }`}
                        onClick={() => handleGenerate(report.id)}
                      >
                        Generate
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Report Preview */}
      {activeReport && (
        <Card className="bg-[var(--theme-card)] border border-white/[0.08] rounded-2xl" id="report-preview">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon = REPORT_TYPES.find((r) => r.id === activeReport)?.icon;
                  return Icon ? <Icon className="h-5 w-5 text-[var(--theme-text-muted)]" /> : null;
                })()}
                <h3 className="text-lg font-semibold text-[var(--theme-text)]">
                  {REPORT_TYPES.find((r) => r.id === activeReport)?.title}
                </h3>
              </div>
              <Button variant="outline" size="sm" className="gap-2 print:hidden bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white" onClick={handleDownload}>
                <Download className="h-4 w-4" /> Download PDF
              </Button>
            </div>

            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-72 w-full bg-white/5 rounded-xl" />
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 bg-white/5 rounded-xl" />
                  ))}
                </div>
              </div>
            ) : reportData ? (
              <>
                {/* Chart */}
                {reportData.chartType === 'bar' && (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.chart} barCategoryGap="25%">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--theme-text-muted)' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: 'var(--theme-text-muted)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12, color: 'var(--theme-text-muted)' }} />
                      <Bar dataKey="profit" fill="#34D399" radius={[6, 6, 0, 0]} name="Profit" />
                      <Bar dataKey="expense" fill="#F87171" radius={[6, 6, 0, 0]} name="Expense" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
                {reportData.chartType === 'line' && (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={reportData.chart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--theme-text-muted)' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: 'var(--theme-text-muted)' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12, color: 'var(--theme-text-muted)' }} />
                      <Line type="monotone" dataKey="new" stroke="var(--theme-primary)" strokeWidth={2.5} dot={{ fill: 'var(--theme-primary)', strokeWidth: 0, r: 4 }} name="New Customers" />
                      <Line type="monotone" dataKey="returning" stroke="#60A5FA" strokeWidth={2.5} dot={{ fill: '#60A5FA', strokeWidth: 0, r: 4 }} name="Returning" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
                {reportData.chartType === 'pie' && (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={reportData.chart} cx="50%" cy="50%" outerRadius={100} innerRadius={50} dataKey="value" stroke="none" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {reportData.chart.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                {reportData.chartType === 'area' && (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={reportData.chart}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#A78BFA" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--theme-text-muted)' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: 'var(--theme-text-muted)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="revenue" stroke="#A78BFA" strokeWidth={2.5} fill="url(#revenueGradient)" name="Revenue" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}

                {/* Summary */}
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(reportData.summary).map(([key, value]) => (
                    <div key={key} className="bg-white/[0.03] rounded-xl p-4 text-center border border-white/[0.05]">
                      <p className="text-[10px] uppercase tracking-widest text-[var(--theme-text-muted)]">{key.replace(/([A-Z])/g, ' $1')}</p>
                      <p className="text-lg font-bold text-[var(--theme-text)] mt-1.5">{value}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
