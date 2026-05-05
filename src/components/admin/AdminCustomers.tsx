'use client';

import React, { useEffect, useState } from 'react';
import { useAdminNavigation } from '@/stores/adminNavigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  if (spent > 10000) return { label: 'Platinum', class: 'bg-[#E8F5E9] text-[#2E7D32]' };
  if (spent > 5000) return { label: 'Gold', class: 'bg-[#FFF8E1] text-[#F57F17]' };
  return { label: 'Silver', class: 'bg-[#F5F7FA] text-[#5A6B7F]' };
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-[#1F2A3A]">Customers</h1>
          <Badge variant="secondary" className="bg-[#F5F7FA] text-[#5A6B7F]">{filtered.length}</Badge>
        </div>
        <div className="relative w-full sm:w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5A6B7F]" />
          <Input placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      {/* Table */}
      <Card className="border-[#E4E7EC] overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F5F7FA] hover:bg-[#F5F7FA]">
                <TableHead className="font-medium">Customer</TableHead>
                <TableHead className="font-medium hidden md:table-cell">Mobile</TableHead>
                <TableHead className="font-medium text-right hidden sm:table-cell">Orders</TableHead>
                <TableHead className="font-medium text-right hidden sm:table-cell">Total Spent</TableHead>
                <TableHead className="font-medium hidden lg:table-cell">Value</TableHead>
                <TableHead className="font-medium text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-12 w-full" /></TableCell></TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-[#5A6B7F]">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p>No customers found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((c, i) => {
                  const vb = valueBadge(c.total_spent);
                  return (
                    <TableRow
                      key={c.id}
                      className={`admin-row cursor-pointer ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}
                      onClick={() => navigate('customer-detail', { id: c.id })}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#FF5722]/10 text-[#FF5722] flex items-center justify-center text-sm font-semibold flex-shrink-0">
                            {initials(c.first_name, c.last_name)}
                          </div>
                          <div>
                            <p className="font-medium text-[#1F2A3A]">{c.first_name} {c.last_name || ''}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-[#5A6B7F]">{c.mobile || '—'}</TableCell>
                      <TableCell className="text-right hidden sm:table-cell">{c.total_orders}</TableCell>
                      <TableCell className="text-right font-medium hidden sm:table-cell">₹{c.total_spent.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge className={vb.class}>{vb.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); navigate('customer-detail', { id: c.id }); }}>
                          <Eye className="h-4 w-4 text-[#5A6B7F]" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
