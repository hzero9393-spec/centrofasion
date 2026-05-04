'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigation } from '@/stores/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { Search, Users } from 'lucide-react';

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  mobile: string;
  avatar: string | null;
  total_orders: number;
  total_spent: number;
  importance: string;
}

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const importanceVariant = (imp: string) => {
  switch (imp) {
    case 'High': return 'bg-green-100 text-green-700';
    case 'Medium': return 'bg-yellow-100 text-yellow-700';
    default: return 'bg-gray-100 text-gray-600';
  }
};

export default function AdminCustomers() {
  const { navigate } = useNavigation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetch('/api/customers');
      const json = await res.json();
      setCustomers(json || []);
    } catch {
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.first_name.toLowerCase().includes(q) ||
      c.last_name.toLowerCase().includes(q) ||
      c.mobile.includes(q)
    );
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-12 w-full" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold font-[var(--font-poppins)] text-[#111111]">Customers</h1>
        <p className="text-gray-500 text-sm">{customers.length} total customers</p>
      </div>

      {/* Search */}
      <Card className="rounded-xl shadow-sm border-0">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="rounded-xl shadow-sm border-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead className="text-right">Total Orders</TableHead>
                <TableHead className="text-right">Total Spent</TableHead>
                <TableHead>Importance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((customer, idx) => (
                <TableRow
                  key={customer.id}
                  className={`cursor-pointer transition-colors hover:bg-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                  onClick={() => navigate('admin-customer-detail', { id: customer.id })}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center text-xs font-medium">
                        {customer.first_name.charAt(0)}{customer.last_name?.charAt(0) || ''}
                      </div>
                      <span className="font-medium text-sm text-[#111111]">
                        {customer.first_name} {customer.last_name || ''}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{customer.mobile}</TableCell>
                  <TableCell className="text-right font-medium text-sm">{customer.total_orders}</TableCell>
                  <TableCell className="text-right font-medium text-sm">{fmt(customer.total_spent)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={importanceVariant(customer.importance)}>
                      {customer.importance || 'Low'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-gray-400">
                    <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    No customers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
