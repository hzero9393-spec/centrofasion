'use client';

import React, { useState } from 'react';
import { useNavigation } from '@/stores/navigation';
import { useCart } from '@/stores/cart';
import { useAuth } from '@/stores/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Search,
  Heart,
  ShoppingCart,
  User,
  Menu,
  X,
} from 'lucide-react';

export default function Header() {
  const { currentPage, navigate } = useNavigation();
  const { getItemCount } = useCart();
  const { customer, isCustomerLoggedIn } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cartCount = getItemCount();
  const navLinks = [
    { label: 'Home', page: 'home' as const },
    { label: 'Shop', page: 'shop' as const },
    { label: 'Men', page: 'shop' as const, params: { category: 'men' } },
    { label: 'Women', page: 'shop' as const, params: { category: 'women' } },
    { label: 'Kids', page: 'shop' as const, params: { category: 'kids' } },
    { label: 'Accessories', page: 'shop' as const, params: { category: 'accessories' } },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('shop', { search: searchQuery.trim() });
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleNavClick = (page: string, params?: Record<string, string>) => {
    navigate(page as any, params);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left: Hamburger (mobile) + Logo */}
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <SheetHeader className="p-6 pb-4 border-b">
                  <SheetTitle className="font-[family-name:var(--font-poppins)] text-xl font-bold text-[#111]">
                    ClothFasion
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col p-4 gap-1">
                  {navLinks.map((link) => (
                    <button
                      key={link.label}
                      onClick={() => handleNavClick(link.page, link.params)}
                      className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        currentPage === link.page
                          ? 'bg-[#FF6A00]/10 text-[#FF6A00]'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {link.label}
                    </button>
                  ))}
                  <div className="border-t my-3" />
                  {isCustomerLoggedIn() ? (
                    <>
                      <button
                        onClick={() => handleNavClick('profile')}
                        className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100"
                      >
                        <User className="size-4 mr-3" />
                        My Account
                      </button>
                      <button
                        onClick={() => handleNavClick('cart')}
                        className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100"
                      >
                        <ShoppingCart className="size-4 mr-3" />
                        Cart {cartCount > 0 && `(${cartCount})`}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleNavClick('login')}
                      className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100"
                    >
                      <User className="size-4 mr-3" />
                      Login / Sign Up
                    </button>
                  )}
                  <button
                    onClick={() => handleNavClick('admin-login')}
                    className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-100 mt-2"
                  >
                    Admin
                  </button>
                </nav>
              </SheetContent>
            </Sheet>
            <button
              onClick={() => navigate('home')}
              className="font-[family-name:var(--font-poppins)] text-xl font-bold text-[#111] tracking-tight"
            >
              Cloth<span className="text-[#FF6A00]">Fasion</span>
            </button>
          </div>

          {/* Center: Nav links (desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.page, link.params)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === link.page
                    ? 'text-[#FF6A00]'
                    : 'text-gray-600 hover:text-[#111] hover:bg-gray-100'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right: Search, Wishlist, Cart, User */}
          <div className="flex items-center gap-1">
            {/* Search bar (desktop) */}
            <form onSubmit={handleSearch} className="hidden lg:flex items-center relative">
              <Search className="absolute left-3 size-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 w-56 h-9 bg-gray-100 border-0 rounded-full text-sm focus-visible:ring-1 focus-visible:ring-[#FF6A00]"
              />
            </form>

            {/* Mobile search toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="size-5" />
            </Button>

            {/* Wishlist */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => isCustomerLoggedIn() ? navigate('profile') : navigate('login')}
              className="relative"
            >
              <Heart className="size-5" />
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('cart')}
              className="relative"
            >
              <ShoppingCart className="size-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-[#FF6A00] text-white text-[10px] h-5 w-5 flex items-center justify-center p-0 border-0 rounded-full">
                  {cartCount > 99 ? '99+' : cartCount}
                </Badge>
              )}
            </Button>

            {/* User */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex"
              onClick={() =>
                isCustomerLoggedIn() ? navigate('profile') : navigate('login')
              }
            >
              <User className="size-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile search bar */}
      {searchOpen && (
        <div className="lg:hidden border-t border-border px-4 py-3 bg-white">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 h-10 bg-gray-100 border-0 rounded-xl text-sm focus-visible:ring-1 focus-visible:ring-[#FF6A00]"
                autoFocus
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery('');
              }}
            >
              <X className="size-4" />
            </Button>
          </form>
        </div>
      )}
    </header>
  );
}
