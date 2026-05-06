'use client';

import React, { useSyncExternalStore, useEffect } from 'react';
import { useAuth } from '@/stores/auth';
import { useCart } from '@/stores/cart';
import { useThemeStore } from '@/stores/theme';

const emptySubscribe = () => () => {};

function useHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,  // Client: always hydrated
    () => false  // Server: never hydrated
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
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-[var(--theme-primary,#FF5722)] animate-spin" />
          </div>
          <p className="text-sm font-medium text-white/50">Loading ClothFasion...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
