'use client';

import React from 'react';
import { useNavigation } from '@/stores/navigation';
import { useCart } from '@/stores/cart';
import { House, Search, ShoppingCart, User } from 'lucide-react';

export default function MobileNav() {
  const { currentPage, navigate } = useNavigation();
  const { getItemCount } = useCart();
  const cartCount = getItemCount();

  const tabs = [
    { icon: House, label: 'Home', page: 'home' as const },
    { icon: Search, label: 'Shop', page: 'shop' as const },
    {
      icon: ShoppingCart,
      label: 'Cart',
      page: 'cart' as const,
      badge: cartCount > 0 ? cartCount : undefined,
    },
    { icon: User, label: 'Profile', page: 'profile' as const },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-black/80 backdrop-blur-xl border-t border-white/5 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-14 px-2">
        {tabs.map((tab) => {
          const isActive = currentPage === tab.page;
          const Icon = tab.icon;
          return (
            <button
              key={tab.label}
              onClick={() => navigate(tab.page)}
              className={`relative flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors duration-200 ${
                isActive ? 'text-white' : 'text-white/40'
              }`}
            >
              {/* Active gradient indicator bar at top */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-b-full bg-gradient-to-r from-[#FF5722] to-[#FF2D55]" />
              )}
              <div className="relative">
                <Icon
                  className="size-5 transition-all duration-200"
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2.5 bg-gradient-to-r from-[#FF5722] to-[#FF2D55] text-white text-[9px] font-bold min-w-[16px] h-[16px] flex items-center justify-center px-1 rounded-full shadow-lg shadow-[#FF5722]/30">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
