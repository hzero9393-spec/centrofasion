'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { toast } from 'sonner';
import { BarChart3, Users, ShoppingBag, DollarSign, Download, TrendingUp, FileText } from 'lucide-react';

interface ReportConfig {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const reports: ReportConfig[] = [
  { id: 'profit', title: 'Profit Report', description: 'Revenue, costs and profit margins', icon: DollarSign, color: '#FF6A00' },
  { id: 'customer', title: 'Customer Report', description: 'Customer growth and retention', icon: Users, color: '#111111' },
  { id: 'orders', title: 'Orders Report', description: 'Order volume and fulfillment rates', icon: ShoppingBag, color: '#111111' },
  { id: 'revenue', title: 'Revenue Report', description: 'Revenue trends and breakdown', icon: TrendingUp, color: '#FF6A00' },
];

// Sample data for reports
const profitData = [
  { month: 'Jan', revenue: 45000, costs: 32000, profit: 13000 },
  { month: 'Feb', revenue: 52000, costs: 34000, profit: 18000 },
  { month: 'Mar', revenue: 48000, costs: 31000, profit: 17000 },
  { month: 'Apr', revenue: 61000, costs: 38000, profit: 23000 },
  { month: 'May', revenue: 55000, costs: 35000, profit: 20000 },
  { month: 'Jun', revenue: 67000, costs: 40000, profit: 27000 },
];

const customerData = [
  { month: 'Jan', new: 45, returning: 120, total: 165 },
  { month: 'Feb', new: 52, returning: 128, total: 180 },
  { month: 'Mar', new: 38, returning: 142, total: 180 },
  { month: 'Apr', new: 61, returning: 150, total: 211 },
  { month: 'May', new: 48, returning: 160, total: 208 },
  { month: 'Jun', new: 55, returning: 175, total: 230 },
];

const ordersData = [
  { week: 'W1', orders: 32, delivered: 28, cancelled: 2 },
  { week: 'W2', orders: 38, delivered: 35, cancelled: 1 },
  { week: 'W3', orders: 42, delivered: 38, cancelled: 3 },
  { week: 'W4', orders: 45, delivered: 42, cancelled: 1 },
  { week: 'W5', orders: 50, delivered: 46, cancelled: 2 },
  { week: 'W6', orders: 55, delivered: 52, cancelled: 1 },
];

const revenueData = [
  { month: 'Jan', online: 28000, offline: 17000 },
  { month: 'Feb', online: 35000, offline: 17000 },
  { month: 'Mar', online: 30000, offline: 18000 },
  { month: 'Apr', online: 40000, offline: 21000 },
  { month: 'May', online: 35000, offline: 20000 },
  { month: 'Jun', online: 45000, offline: 22000 },
];

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export default function AdminReports() {
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = (reportId: string) => {
    setLoading(true);
    // Simulate loading
    setTimeout(() => {
      setActiveReport(reportId);
      setLoading(false);
    }, 500);
  };

  const handleDownload = () => {
    window.print();
  };

  const renderReport = () => {
    if (!activeReport) return null;

    switch (activeReport) {
      case 'profit':
        return (
          <div className="space-y-4">
            <Card className="rounded-xl shadow-sm border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Profit Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={profitData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#999" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#999" tickFormatter={(v) => `₹${(Number(v)/1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value: number) => [fmt(value)]} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Line type="monotone" dataKey="revenue" stroke="#111111" strokeWidth={2} />
                      <Line type="monotone" dataKey="profit" stroke="#FF6A00" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-xl shadow-sm border-0">
              <CardContent className="p-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Costs</TableHead>
                      <TableHead className="text-right">Profit</TableHead>
                      <TableHead className="text-right">Margin</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profitData.map((row) => (
                      <TableRow key={row.month}>
                        <TableCell className="font-medium">{row.month}</TableCell>
                        <TableCell className="text-right">{fmt(row.revenue)}</TableCell>
                        <TableCell className="text-right">{fmt(row.costs)}</TableCell>
                        <TableCell className="text-right font-medium text-green-600">{fmt(row.profit)}</TableCell>
                        <TableCell className="text-right">{((row.profit / row.revenue) * 100).toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );

      case 'customer':
        return (
          <div className="space-y-4">
            <Card className="rounded-xl shadow-sm border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Customer Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={customerData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#999" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#999" />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="new" fill="#FF6A00" radius={[4, 4, 0, 0]} name="New" />
                      <Bar dataKey="returning" fill="#111111" radius={[4, 4, 0, 0]} name="Returning" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-xl shadow-sm border-0">
              <CardContent className="p-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">New</TableHead>
                      <TableHead className="text-right">Returning</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerData.map((row) => (
                      <TableRow key={row.month}>
                        <TableCell className="font-medium">{row.month}</TableCell>
                        <TableCell className="text-right">{row.new}</TableCell>
                        <TableCell className="text-right">{row.returning}</TableCell>
                        <TableCell className="text-right font-bold">{row.total}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );

      case 'orders':
        return (
          <div className="space-y-4">
            <Card className="rounded-xl shadow-sm border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Order Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ordersData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="#999" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#999" />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="orders" fill="#111111" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="delivered" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-xl shadow-sm border-0">
              <CardContent className="p-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Week</TableHead>
                      <TableHead className="text-right">Orders</TableHead>
                      <TableHead className="text-right">Delivered</TableHead>
                      <TableHead className="text-right">Cancelled</TableHead>
                      <TableHead className="text-right">Fulfillment Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordersData.map((row) => (
                      <TableRow key={row.week}>
                        <TableCell className="font-medium">{row.week}</TableCell>
                        <TableCell className="text-right">{row.orders}</TableCell>
                        <TableCell className="text-right text-green-600">{row.delivered}</TableCell>
                        <TableCell className="text-right text-red-500">{row.cancelled}</TableCell>
                        <TableCell className="text-right">{((row.delivered / row.orders) * 100).toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );

      case 'revenue':
        return (
          <div className="space-y-4">
            <Card className="rounded-xl shadow-sm border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#999" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#999" tickFormatter={(v) => `₹${(Number(v)/1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value: number) => [fmt(value)]} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="online" fill="#FF6A00" radius={[4, 4, 0, 0]} name="Online" />
                      <Bar dataKey="offline" fill="#111111" radius={[4, 4, 0, 0]} name="Offline" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-xl shadow-sm border-0">
              <CardContent className="p-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Online</TableHead>
                      <TableHead className="text-right">Offline</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenueData.map((row) => (
                      <TableRow key={row.month}>
                        <TableCell className="font-medium">{row.month}</TableCell>
                        <TableCell className="text-right">{fmt(row.online)}</TableCell>
                        <TableCell className="text-right">{fmt(row.offline)}</TableCell>
                        <TableCell className="text-right font-bold">{fmt(row.online + row.offline)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-[var(--font-poppins)] text-[#111111]">Reports</h1>
          <p className="text-gray-500 text-sm">Generate and download business reports</p>
        </div>
        {activeReport && (
          <Button variant="outline" onClick={handleDownload} className="rounded-xl">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        )}
      </div>

      {/* Report Cards */}
      {!activeReport && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reports.map((report) => {
            const Icon = report.icon;
            return (
              <Card key={report.id} className="rounded-xl shadow-sm border-0 hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    report.color === '#FF6A00' ? 'bg-orange-50' : 'bg-gray-100'
                  }`}>
                    <Icon className={`h-6 w-6 ${report.color === '#FF6A00' ? 'text-[#FF6A00]' : 'text-[#111111]'}`} />
                  </div>
                  <h3 className="font-semibold text-[#111111] mb-1">{report.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{report.description}</p>
                  <Button
                    size="sm"
                    onClick={() => handleGenerate(report.id)}
                    disabled={loading}
                    className="w-full rounded-xl bg-[#111111] hover:bg-[#333333] text-white"
                  >
                    {loading ? 'Generating...' : 'Generate Report'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Report Preview */}
      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      )}

      {activeReport && !loading && (
        <div>
          <Button variant="ghost" onClick={() => setActiveReport(null)} className="rounded-xl text-gray-600 mb-4">
            ← Back to Reports
          </Button>
          {renderReport()}
        </div>
      )}
    </div>
  );
}
