'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  BarChart3, Users, ShoppingBag, DollarSign, Download, FileText
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

const REPORT_TYPES = [
  { id: 'profit', title: 'Profit Report', icon: BarChart3, color: '#28A745', bg: '#E8F5E9' },
  { id: 'customers', title: 'Customer Report', icon: Users, color: '#3B82F6', bg: '#E3F2FD' },
  { id: 'orders', title: 'Orders Report', icon: ShoppingBag, color: '#FF5722', bg: '#FFF3E0' },
  { id: 'revenue', title: 'Revenue Report', icon: DollarSign, color: '#7B1FA2', bg: '#F3E5F5' },
];

const PIE_COLORS = ['#FF5722', '#28A745', '#FFC107', '#DC3545', '#3B82F6', '#7B1FA2'];

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
      <h1 className="text-xl font-semibold text-[#1F2A3A]">Reports</h1>

      {/* Report Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {REPORT_TYPES.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.id} className="border-[#E4E7EC] shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: report.bg }}>
                    <Icon className="h-6 w-6" style={{ color: report.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#1F2A3A]">{report.title}</h3>
                    <div className="mt-3 flex items-center gap-2">
                      <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="h-8 w-[140px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7days">Last 7 days</SelectItem>
                          <SelectItem value="30days">Last 30 days</SelectItem>
                          <SelectItem value="90days">Last 90 days</SelectItem>
                          <SelectItem value="year">This Year</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs border-[#FF5722] text-[#FF5722] hover:bg-[#FFF3E0]"
                        onClick={() => handleGenerate(report.id)}
                      >
                        Generate Report
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
        <Card className="border-[#E4E7EC] shadow-sm" id="report-preview">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#1F2A3A]">
                {REPORT_TYPES.find((r) => r.id === activeReport)?.title}
              </h3>
              <Button variant="outline" size="sm" className="gap-2 print:hidden" onClick={handleDownload}>
                <Download className="h-4 w-4" /> Download PDF
              </Button>
            </div>

            {loading ? (
              <Skeleton className="h-72 w-full" />
            ) : reportData ? (
              <>
                {/* Chart */}
                {reportData.chartType === 'bar' && (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.chart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#5A6B7F' }} axisLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: '#5A6B7F' }} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
                      <Legend />
                      <Bar dataKey="profit" fill="#28A745" radius={[4, 4, 0, 0]} name="Profit" />
                      <Bar dataKey="expense" fill="#DC3545" radius={[4, 4, 0, 0]} name="Expense" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
                {reportData.chartType === 'line' && (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={reportData.chart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#5A6B7F' }} axisLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: '#5A6B7F' }} axisLine={false} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="new" stroke="#FF5722" strokeWidth={2} name="New Customers" />
                      <Line type="monotone" dataKey="returning" stroke="#3B82F6" strokeWidth={2} name="Returning" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
                {reportData.chartType === 'pie' && (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={reportData.chart} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                        {reportData.chart.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                {reportData.chartType === 'area' && (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.chart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#5A6B7F' }} axisLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: '#5A6B7F' }} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
                      <Bar dataKey="revenue" fill="#7B1FA2" radius={[4, 4, 0, 0]} name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {/* Summary */}
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(reportData.summary).map(([key, value]) => (
                    <div key={key} className="bg-[#F5F7FA] rounded-xl p-4 text-center">
                      <p className="text-xs text-[#5A6B7F] capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                      <p className="text-lg font-bold text-[#1F2A3A] mt-1">{value}</p>
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
