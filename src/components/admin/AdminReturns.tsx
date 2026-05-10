'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RotateCcw, CheckCircle2, XCircle, Truck, PackageCheck } from 'lucide-react';

interface Return {
  id: string; order_id: string; customer_id: string; product_id: string;
  product_name: string; reason: string; status: string; created_at: string;
}

const statusConfig: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  'Pending': {
    label: 'Pending',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    icon: <RotateCcw className="h-3.5 w-3.5" />,
  },
  'Approved': {
    label: 'Approved',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  'Rejected': {
    label: 'Rejected',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
  'Return Shipping': {
    label: 'Shipping',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    icon: <Truck className="h-3.5 w-3.5" />,
  },
  'Completed': {
    label: 'Completed',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    icon: <PackageCheck className="h-3.5 w-3.5" />,
  },
};

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

  const getStatus = (s: string) => statusConfig[s] || statusConfig['Pending'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-[var(--theme-text)] tracking-tight">Return Orders</h1>
        <Badge variant="secondary" className="bg-[var(--theme-surface)] text-[var(--theme-text-muted)] border border-[var(--theme-border)] hover:bg-[var(--theme-surface)]">
          {returns.length} total
        </Badge>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)]">
              <div className="p-5 space-y-4">
                <Skeleton className="h-5 w-48 bg-[var(--theme-surface)] rounded-xl" />
                <Skeleton className="h-16 w-full bg-[var(--theme-surface)] rounded-xl" />
                <Skeleton className="h-4 w-32 bg-[var(--theme-surface)] rounded-xl" />
                <Skeleton className="h-9 w-full bg-[var(--theme-surface)] rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : returns.length === 0 ? (
        <Card className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl">
          <CardContent className="py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--theme-surface)] flex items-center justify-center mx-auto mb-4">
              <RotateCcw className="h-8 w-8 text-[var(--theme-text-muted)]" />
            </div>
            <p className="text-[var(--theme-text-muted)] text-sm">No return requests at this time</p>
            <p className="text-[var(--theme-text-muted)] text-xs mt-1">Return requests will appear here when customers submit them</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {returns.map((r) => {
            const status = getStatus(r.status);
            return (
              <Card key={r.id} className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl hover:border-white/[0.12] transition-colors">
                <CardContent className="p-5 space-y-4">
                  {/* Top row */}
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[var(--theme-text)] truncate">{r.product_name || 'Product'}</p>
                      <p className="text-sm text-[var(--theme-text-muted)] mt-0.5">Order: {r.order_id?.slice(0, 8) || '—'}</p>
                    </div>
                    <Badge variant="secondary" className={`${status.bg} ${status.text} border-0 gap-1.5 shrink-0`}>
                      {status.icon}
                      {status.label}
                    </Badge>
                  </div>

                  {/* Reason */}
                  <div className="bg-white/[0.03] rounded-xl p-3.5 border border-[var(--theme-border)]">
                    <p className="text-[10px] uppercase tracking-widest text-[var(--theme-text-muted)] mb-1.5">Reason</p>
                    <p className="text-sm text-[var(--theme-text)]/80 leading-relaxed">{r.reason || 'No reason provided'}</p>
                  </div>

                  {/* Date */}
                  <p className="text-xs text-[var(--theme-text-muted)]">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {r.status === 'Pending' && (
                      <>
                        <Button
                          size="sm"
                          className="bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/20 flex-1 transition-colors"
                          onClick={() => handleAction(r.id, 'Approved', 'Return approved')}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1.5" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/20 flex-1 transition-colors"
                          onClick={() => handleAction(r.id, 'Rejected', 'Return rejected')}
                        >
                          <XCircle className="h-4 w-4 mr-1.5" />
                          Reject
                        </Button>
                      </>
                    )}
                    {r.status === 'Approved' && (
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] hover:opacity-90 text-white flex-1 transition-opacity"
                        onClick={() => handleAction(r.id, 'Return Shipping', 'Marked as shipping')}
                      >
                        <Truck className="h-4 w-4 mr-1.5" />
                        Mark Shipping
                      </Button>
                    )}
                    {r.status === 'Return Shipping' && (
                      <Button
                        size="sm"
                        className="bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/20 flex-1 transition-colors"
                        onClick={() => handleAction(r.id, 'Completed', 'Return completed')}
                      >
                        <PackageCheck className="h-4 w-4 mr-1.5" />
                        Complete Return
                      </Button>
                    )}
                    {(r.status === 'Rejected' || r.status === 'Completed') && (
                      <p className="text-sm text-[var(--theme-text-muted)] italic py-2">No further actions</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
