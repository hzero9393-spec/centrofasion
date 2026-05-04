'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { RotateCcw, CheckCircle2, XCircle, Clock, Truck, Package } from 'lucide-react';

interface ReturnRequest {
  id: string;
  order_id: string;
  customer_id: string;
  product_id: string;
  product_name: string;
  reason: string;
  status: string;
  created_at: string;
}

interface CustomerName {
  [key: string]: string;
}

const statusColor = (status: string) => {
  const s = status?.toLowerCase() || '';
  if (s === 'complete') return 'bg-green-100 text-green-700';
  if (s === 'pending') return 'bg-yellow-100 text-yellow-700';
  if (s === 'rejected') return 'bg-red-100 text-red-700';
  if (s === 'return shipping') return 'bg-blue-100 text-blue-700';
  return 'bg-gray-100 text-gray-600';
};

export default function AdminReturns() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [customerNames, setCustomerNames] = useState<CustomerName>({});
  const [loading, setLoading] = useState(true);

  const fetchReturns = useCallback(async () => {
    try {
      const res = await fetch('/api/returns');
      const json = await res.json();
      setReturns(json || []);

      // Fetch customer names for display
      const customerIds = [...new Set((json || []).map((r: ReturnRequest) => r.customer_id))];
      const names: CustomerName = {};
      for (const cid of customerIds) {
        try {
          const cRes = await fetch(`/api/customers?id=${cid}`);
          if (cRes.ok) {
            const cData = await cRes.json();
            names[cid] = `${cData.customer.first_name} ${cData.customer.last_name || ''}`.trim();
          }
        } catch {
          // ignore
        }
      }
      setCustomerNames(names);
    } catch {
      toast.error('Failed to fetch returns');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReturns(); }, [fetchReturns]);

  const handleAction = async (returnId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/returns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: returnId, status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(`Return ${newStatus.toLowerCase()}`);
      setReturns((prev) => prev.filter((r) => !(newStatus === 'Rejected' && r.id === returnId)));
      if (newStatus !== 'Rejected') {
        setReturns((prev) =>
          prev.map((r) => (r.id === returnId ? { ...r, status: newStatus } : r))
        );
      }
    } catch {
      toast.error('Failed to update return');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-[var(--font-poppins)] text-[#111111]">Return Orders</h1>
        <p className="text-gray-500 text-sm">{returns.length} return requests</p>
      </div>

      {returns.length === 0 ? (
        <div className="text-center py-16">
          <RotateCcw className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400">No return requests</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {returns.map((ret) => (
            <Card key={ret.id} className="rounded-xl shadow-sm border-0">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-[#111111] text-sm">
                      {String(ret.product_name)}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Customer: {customerNames[ret.customer_id] || ret.customer_id}
                    </p>
                  </div>
                  <Badge variant="secondary" className={statusColor(ret.status)}>
                    {ret.status}
                  </Badge>
                </div>

                <div className="bg-[#F8F9FB] rounded-lg p-3 mb-3">
                  <p className="text-xs text-gray-500 mb-1">Reason</p>
                  <p className="text-sm text-gray-700">{String(ret.reason)}</p>
                </div>

                <p className="text-xs text-gray-400 mb-3">
                  Requested: {new Date(ret.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  {ret.status === 'Pending' && (
                    <>
                      <Button
                        size="sm"
                        className="h-8 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs"
                        onClick={() => handleAction(ret.id, 'Return Shipping')}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 rounded-lg text-xs"
                        onClick={() => handleAction(ret.id, 'Rejected')}
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  {ret.status === 'Return Shipping' && (
                    <Button
                      size="sm"
                      className="h-8 rounded-lg bg-[#111111] hover:bg-[#333333] text-white text-xs"
                      onClick={() => handleAction(ret.id, 'Complete Return')}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      Mark Complete
                    </Button>
                  )}
                  {ret.status === 'Complete Return' && (
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      Return Completed
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
