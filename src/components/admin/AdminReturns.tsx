'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RotateCcw } from 'lucide-react';

interface Return {
  id: string; order_id: string; customer_id: string; product_id: string;
  product_name: string; reason: string; status: string; created_at: string;
}

export default function AdminReturns() {
  const [returns, setReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/returns')
      .then((r) => r.json())
      .then((data) => { setReturns(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleAction = async (id: string, newStatus: string, label: string) => {
    try {
      await fetch('/api/returns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      toast.success(label);
      setReturns((prev) => prev.map((r) => r.id === id ? { ...r, status: newStatus } : r));
    } catch { toast.error('Action failed'); }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'Pending': return 'badge-pending';
      case 'Approved': return 'badge-confirmed';
      case 'Rejected': return 'badge-cancelled';
      case 'Return Shipping': return 'badge-shipping';
      case 'Completed': return 'badge-delivered';
      default: return 'badge-pending';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold text-[#1F2A3A]">Return Orders</h1>
        <Badge variant="secondary" className="bg-[#F5F7FA] text-[#5A6B7F]">{returns.length}</Badge>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-[#E4E7EC]"><CardContent className="p-5"><Skeleton className="h-32 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : returns.length === 0 ? (
        <Card className="border-[#E4E7EC]">
          <CardContent className="py-16 text-center">
            <RotateCcw className="h-10 w-10 mx-auto mb-3 text-[#CBD5E1]" />
            <p className="text-[#5A6B7F]">No return requests</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {returns.map((r) => (
            <Card key={r.id} className="border-[#E4E7EC] shadow-sm">
              <CardContent className="p-5 space-y-4">
                {/* Top row */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-[#1F2A3A]">{r.product_name || 'Product'}</p>
                    <p className="text-sm text-[#5A6B7F] mt-0.5">Order: {r.order_id?.slice(0, 8) || '—'}</p>
                  </div>
                  <Badge className={statusColor(r.status)}>{r.status || 'Pending'}</Badge>
                </div>

                {/* Reason */}
                <div className="bg-[#F5F7FA] rounded-lg p-3">
                  <p className="text-xs text-[#5A6B7F] mb-1">Reason</p>
                  <p className="text-sm text-[#1F2A3A]">{r.reason || 'No reason provided'}</p>
                </div>

                {/* Date */}
                <p className="text-xs text-[#CBD5E1]">
                  {r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  {r.status === 'Pending' && (
                    <>
                      <Button
                        size="sm"
                        className="bg-[#28A745] hover:bg-[#218838] text-white flex-1"
                        onClick={() => handleAction(r.id, 'Approved', 'Return approved')}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[#DC3545] text-[#DC3545] hover:bg-[#FFEBEE] flex-1"
                        onClick={() => handleAction(r.id, 'Rejected', 'Return rejected')}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {r.status === 'Approved' && (
                    <Button
                      size="sm"
                      className="bg-[#FF5722] hover:bg-[#E64A19] text-white flex-1"
                      onClick={() => handleAction(r.id, 'Return Shipping', 'Marked as shipping')}
                    >
                      Mark Shipping
                    </Button>
                  )}
                  {r.status === 'Return Shipping' && (
                    <Button
                      size="sm"
                      className="bg-[#28A745] hover:bg-[#218838] text-white flex-1"
                      onClick={() => handleAction(r.id, 'Completed', 'Return completed')}
                    >
                      Complete Return
                    </Button>
                  )}
                  {(r.status === 'Rejected' || r.status === 'Completed') && (
                    <p className="text-sm text-[#5A6B7F] italic">No further actions</p>
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
