'use client';

import React, { useEffect, useState } from 'react';
import { useAdminNavigation } from '@/stores/adminNavigation';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Search, Users, Eye } from 'lucide-react';

interface Customer {
  id: string; first_name: string; last_name: string; mobile: string;
  total_orders: number; total_spent: number; importance: string; created_at: string;
}

const valueBadge = (spent: number) => {
  if (spent > 10000) return { label: 'Platinum', class: 'bg-[#E8F5E9]/10 text-[#4ADE80] border border-[#4ADE80]/20' };
  if (spent > 5000) return { label: 'Gold', class: 'bg-[#FFF8E1]/10 text-[#FBBF24] border border-[#FBBF24]/20' };
  return { label: 'Silver', class: 'bg-[#F5F7FA]/10 text-[var(--theme-text-muted)] border border-white/10' };
};

const initials = (first: string, last: string) =>
  `${(first || '').charAt(0)}${(last || '').charAt(0)}`.toUpperCase() || '?';

export default function AdminCustomers() {
  const { navigate } = useAdminNavigation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/customers')
      .then((r) => r.json())
      .then((data) => {
        setCustomers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = customers.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.first_name?.toLowerCase().includes(q) || c.last_name?.toLowerCase().includes(q) || c.mobile?.includes(q);
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-[var(--theme-text)] tracking-tight">Customers</h1>
          <span className="inline-flex items-center justify-center h-6 min-w-[24px] px-2 rounded-full bg-white/5 text-xs font-medium text-[var(--theme-text-muted)] border border-white/[0.08]">
            {filtered.length}
          </span>
        </div>
        <div className="relative w-full sm:w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--theme-text-muted)]" />
          <Input
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 text-[var(--theme-text)] placeholder:text-white/30 rounded-xl h-10 focus-visible:ring-white/20"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--theme-card)] border border-white/[0.08] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-white/[0.08]">
                <TableHead className="font-medium text-[var(--theme-text-muted)] text-xs uppercase tracking-wider">Customer</TableHead>
                <TableHead className="font-medium text-[var(--theme-text-muted)] text-xs uppercase tracking-wider hidden md:table-cell">Mobile</TableHead>
                <TableHead className="font-medium text-[var(--theme-text-muted)] text-xs uppercase tracking-wider text-right hidden sm:table-cell">Orders</TableHead>
                <TableHead className="font-medium text-[var(--theme-text-muted)] text-xs uppercase tracking-wider text-right hidden sm:table-cell">Total Spent</TableHead>
                <TableHead className="font-medium text-[var(--theme-text-muted)] text-xs uppercase tracking-wider hidden lg:table-cell">Value</TableHead>
                <TableHead className="font-medium text-[var(--theme-text-muted)] text-xs uppercase tracking-wider text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-b border-white/[0.04]">
                    <TableCell colSpan={6}>
                      <Skeleton className="h-14 w-full bg-white/5 rounded-xl" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16">
                    <Users className="h-10 w-10 mx-auto mb-3 text-white/20" />
                    <p className="text-[var(--theme-text-muted)] text-sm">No customers found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((c, i) => {
                  const vb = valueBadge(c.total_spent);
                  return (
                    <TableRow
                      key={c.id}
                      className={`cursor-pointer border-b border-white/[0.04] hover:bg-white/5 transition-colors ${i % 2 === 1 ? 'bg-white/[0.02]' : ''}`}
                      onClick={() => navigate('customer-detail', { id: c.id })}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-secondary)] text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                            {initials(c.first_name, c.last_name)}
                          </div>
                          <div>
                            <p className="font-medium text-[var(--theme-text)]">{c.first_name} {c.last_name || ''}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-[var(--theme-text-muted)]">{c.mobile || '—'}</TableCell>
                      <TableCell className="text-right hidden sm:table-cell text-[var(--theme-text)]">{c.total_orders}</TableCell>
                      <TableCell className="text-right font-medium hidden sm:table-cell text-[var(--theme-text)]">₹{c.total_spent.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${vb.class}`}>
                          {vb.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-white/40 hover:text-[var(--theme-text)] hover:bg-white/10 transition-colors"
                          onClick={(e) => { e.stopPropagation(); navigate('customer-detail', { id: c.id }); }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
