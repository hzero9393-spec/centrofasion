'use client';

import React, { useSyncExternalStore, useEffect } from 'react';
import { useAuth } from '@/stores/auth';
import { useCart } from '@/stores/cart';

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
  }, []);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-[#E4E7EC] border-t-[#FF5722] animate-spin" />
          </div>
          <p className="text-sm font-medium text-[#5A6B7F]">Loading ClothFasion...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
