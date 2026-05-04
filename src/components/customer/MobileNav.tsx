'use client';

import React from 'react';
import { useNavigation } from '@/stores/navigation';
import { useCart } from '@/stores/cart';
import { Home, ShoppingBag, ShoppingCart, User } from 'lucide-react';

export default function MobileNav() {
  const { currentPage, navigate } = useNavigation();
  const { getItemCount } = useCart();
  const cartCount = getItemCount();

  const tabs = [
    { icon: Home, label: 'Home', page: 'home' as const },
    { icon: ShoppingBag, label: 'Shop', page: 'shop' as const },
    {
      icon: ShoppingCart,
      label: 'Cart',
      page: 'cart' as const,
      badge: cartCount > 0 ? cartCount : undefined,
    },
    { icon: User, label: 'Profile', page: 'profile' as const },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-md border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const isActive = currentPage === tab.page;
          const Icon = tab.icon;
          return (
            <button
              key={tab.label}
              onClick={() => navigate(tab.page)}
              className={`relative flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors ${
                isActive ? 'text-[#FF6A00]' : 'text-gray-500'
              }`}
            >
              <div className="relative">
                <Icon className="size-5" strokeWidth={isActive ? 2.5 : 2} />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#FF6A00] text-white text-[9px] font-bold h-4 min-w-4 flex items-center justify-center px-1 rounded-full">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{tab.label}</span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#FF6A00] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
