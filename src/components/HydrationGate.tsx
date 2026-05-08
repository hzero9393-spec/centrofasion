'use client';

import React, { useSyncExternalStore, useEffect } from 'react';
import { useAuth } from '@/stores/auth';
import { useCart } from '@/stores/cart';
import { useThemeStore } from '@/stores/theme';

const emptySubscribe = () => () => {};

function useHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function HydrationGate({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();

  useEffect(() => {
    useAuth.persist.rehydrate();
    useCart.persist.rehydrate();
    useThemeStore.persist.rehydrate();
  }, []);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--theme-bg)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-3 border-[var(--theme-border)] border-t-[var(--theme-primary)] animate-spin" />
          <p className="text-sm font-medium text-[var(--theme-text-muted)]">Loading ClothStore...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
