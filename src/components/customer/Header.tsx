'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigation } from '@/stores/navigation';
import { useCart } from '@/stores/cart';
import { useAuth } from '@/stores/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Heart,
  ShoppingCart,
  User,
  Menu,
  X,
  LogOut,
  Package,
  Settings,
  UserCircle,
  ChevronRight,
} from 'lucide-react';
import type { Product } from './SharedTypes';

export default function Header() {
  const { currentPage, navigate, pageParams } = useNavigation();
  const { getItemCount } = useCart();
  const { customer, isCustomerLoggedIn, logoutCustomer } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [mobileSearchResults, setMobileSearchResults] = useState<Product[]>([]);
  const [showMobileSuggestions, setShowMobileSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const cartCount = getItemCount();

  const navLinks = [
    { label: 'Home', page: 'home' as const },
    { label: 'Men', page: 'shop' as const, params: { category: 'men' } },
    { label: 'Women', page: 'shop' as const, params: { category: 'women' } },
    { label: 'Kids', page: 'shop' as const, params: { category: 'kids' } },
    { label: 'Accessories', page: 'shop' as const, params: { category: 'accessories' } },
  ];

  const fetchSearchResults = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/products?search=${encodeURIComponent(query.trim())}&limit=5`);
      const data = await res.json();
      setSearchResults(data.products || []);
    } catch {
      setSearchResults([]);
    }
  }, []);

  const fetchMobileSearchResults = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setMobileSearchResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/products?search=${encodeURIComponent(query.trim())}&limit=5`);
      const data = await res.json();
      setMobileSearchResults(data.products || []);
    } catch {
      setMobileSearchResults([]);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSearchResults(searchQuery);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, fetchSearchResults]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchMobileSearchResults(mobileSearchQuery);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [mobileSearchQuery, fetchMobileSearchResults]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target as Node)) {
        setShowMobileSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('shop', { search: searchQuery.trim() });
      setShowSuggestions(false);
      setSearchQuery('');
    }
  };

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileSearchQuery.trim()) {
      navigate('shop', { search: mobileSearchQuery.trim() });
      setShowMobileSuggestions(false);
      setMobileSearch(false);
      setMobileSearchQuery('');
      setMobileOpen(false);
    }
  };

  const handleNavClick = (page: string, params?: Record<string, string>) => {
    navigate(page as any, params);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logoutCustomer();
    navigate('home');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0A1B2A]">
      {/* Desktop / Tablet Header */}
      <div className="hidden md:block">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="flex items-center h-16 gap-6">
            {/* Logo */}
            <button
              onClick={() => navigate('home')}
              className="shrink-0 text-xl font-bold text-white tracking-tight"
            >
              Cloth<span className="text-[#FF5722]">Fasion</span>
            </button>

            {/* Center: Search Bar */}
            <div ref={searchRef} className="flex-1 max-w-2xl relative">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                  <Input
                    type="text"
                    placeholder="Search for products, brands and more..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    className="pl-11 pr-4 h-10 bg-white/10 border border-white/20 rounded-full text-sm text-white placeholder:text-white/40 focus-visible:ring-1 focus-visible:ring-[#FF5722] focus-visible:border-[#FF5722] focus-visible:bg-white/[0.15]"
                  />
                </div>
              </form>

              {/* Autocomplete Dropdown */}
              {showSuggestions && searchQuery.trim().length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-[#E4E7EC] overflow-hidden z-50 max-h-96 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => {
                          navigate('product', { id: product.id });
                          setShowSuggestions(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 hover:bg-[#F5F7FA] transition-colors text-left"
                      >
                        <div className="w-12 h-12 rounded-lg bg-[#F5F7FA] overflow-hidden shrink-0">
                          <img
                            src={product.images[0] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=80&h=80&fit=crop'}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1F2A3A] truncate">{product.name}</p>
                          <p className="text-xs text-[#5A6B7F]">{product.category_name}</p>
                        </div>
                        <p className="text-sm font-bold text-[#1F2A3A] shrink-0">
                          ₹{product.price.toLocaleString('en-IN')}
                        </p>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <p className="text-sm text-[#5A6B7F]">No products found for &ldquo;{searchQuery}&rdquo;</p>
                    </div>
                  )}
                  {searchResults.length > 0 && (
                    <button
                      onClick={() => {
                        navigate('shop', { search: searchQuery.trim() });
                        setShowSuggestions(false);
                        setSearchQuery('');
                      }}
                      className="w-full px-4 py-3 text-center text-sm font-semibold text-[#FF5722] hover:bg-[#F5F7FA] transition-colors border-t border-[#E4E7EC] flex items-center justify-center gap-1"
                    >
                      View All Results <ChevronRight className="size-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Right: Icons */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Wishlist */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => isCustomerLoggedIn() ? navigate('profile', { tab: 'wishlist' }) : navigate('login')}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <Heart className="size-5" />
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('cart')}
                className="relative text-white/80 hover:text-white hover:bg-white/10"
              >
                <ShoppingCart className="size-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#FF5722] text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Button>

              {/* User / Avatar */}
              {isCustomerLoggedIn() && customer ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10 relative">
                      <div className="w-8 h-8 rounded-full bg-[#FF5722] flex items-center justify-center text-white text-xs font-bold">
                        {customer.first_name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 rounded-xl border-[#E4E7EC] shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                    <div className="px-3 py-2.5 border-b border-[#E4E7EC]">
                      <p className="text-sm font-semibold text-[#1F2A3A]">
                        {customer.first_name} {customer.last_name}
                      </p>
                      <p className="text-xs text-[#5A6B7F]">{customer.mobile}</p>
                    </div>
                    <DropdownMenuItem onClick={() => navigate('profile')} className="cursor-pointer gap-2.5 py-2.5 text-sm">
                      <UserCircle className="size-4 text-[#5A6B7F]" /> My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('profile', { tab: 'orders' })} className="cursor-pointer gap-2.5 py-2.5 text-sm">
                      <Package className="size-4 text-[#5A6B7F]" /> My Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('profile', { tab: 'wishlist' })} className="cursor-pointer gap-2.5 py-2.5 text-sm">
                      <Heart className="size-4 text-[#5A6B7F]" /> My Wishlist
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('profile', { tab: 'settings' })} className="cursor-pointer gap-2.5 py-2.5 text-sm">
                      <Settings className="size-4 text-[#5A6B7F]" /> Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[#E4E7EC]" />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer gap-2.5 py-2.5 text-sm text-[#DC3545] focus:text-[#DC3545]">
                      <LogOut className="size-4" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('login')}
                  className="text-white/80 hover:text-white hover:bg-white/10"
                >
                  <User className="size-5" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation links bar */}
        <div className="border-t border-white/10">
          <div className="max-w-[1280px] mx-auto px-4">
            <nav className="flex items-center gap-1 h-10 overflow-x-auto">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.page, link.params)}
                  className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wide transition-colors whitespace-nowrap ${
                    currentPage === link.page && JSON.stringify(pageParams) === JSON.stringify(link.params || {})
                      ? 'text-white bg-white/10'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        <div className="flex items-center h-14 px-4 gap-3">
          {/* Hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10 -ml-2">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 bg-white">
              <SheetHeader className="px-5 py-4 border-b border-[#E4E7EC]">
                <SheetTitle className="text-xl font-bold text-[#0A1B2A]">
                  Cloth<span className="text-[#FF5722]">Fasion</span>
                </SheetTitle>
              </SheetHeader>

              {/* Mobile Search */}
              <div ref={mobileSearchRef} className="px-4 py-3 border-b border-[#E4E7EC]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#5A6B7F]" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={mobileSearchQuery}
                    onChange={(e) => {
                      setMobileSearchQuery(e.target.value);
                      setShowMobileSuggestions(true);
                    }}
                    onFocus={() => setShowMobileSuggestions(true)}
                    className="pl-9 pr-4 h-9 bg-[#F5F7FA] border-[#E4E7EC] rounded-lg text-sm text-[#1F2A3A] placeholder:text-[#5A6B7F] focus-visible:ring-1 focus-visible:ring-[#FF5722]"
                  />
                </div>
                {showMobileSuggestions && mobileSearchQuery.trim().length >= 2 && mobileSearchResults.length > 0 && (
                  <div className="mt-2 bg-white rounded-xl border border-[#E4E7EC] shadow-sm overflow-hidden max-h-64 overflow-y-auto">
                    {mobileSearchResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => {
                          navigate('product', { id: product.id });
                          setShowMobileSuggestions(false);
                          setMobileSearchQuery('');
                          setMobileOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-[#F5F7FA] transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-lg bg-[#F5F7FA] overflow-hidden shrink-0">
                          <img src={product.images[0] || ''} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-[#1F2A3A] truncate">{product.name}</p>
                          <p className="text-xs font-bold text-[#1F2A3A]">₹{product.price.toLocaleString('en-IN')}</p>
                        </div>
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        navigate('shop', { search: mobileSearchQuery.trim() });
                        setShowMobileSuggestions(false);
                        setMobileSearchQuery('');
                        setMobileOpen(false);
                      }}
                      className="w-full px-3 py-2.5 text-center text-xs font-semibold text-[#FF5722] border-t border-[#E4E7EC]"
                    >
                      View All Results
                    </button>
                  </div>
                )}
              </div>

              {/* Nav Links */}
              <nav className="flex flex-col p-3 gap-0.5">
                {navLinks.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => handleNavClick(link.page, link.params)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === link.page
                        ? 'bg-[#FF5722]/10 text-[#FF5722]'
                        : 'text-[#1F2A3A] hover:bg-[#F5F7FA]'
                    }`}
                  >
                    {link.label}
                    <ChevronRight className="size-4 opacity-40" />
                  </button>
                ))}

                <Separator className="my-2 bg-[#E4E7EC]" />

                {isCustomerLoggedIn() && customer ? (
                  <>
                    <button
                      onClick={() => handleNavClick('profile')}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-[#1F2A3A] hover:bg-[#F5F7FA]"
                    >
                      My Account <ChevronRight className="size-4 opacity-40" />
                    </button>
                    <button
                      onClick={() => handleNavClick('profile', { tab: 'orders' })}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-[#1F2A3A] hover:bg-[#F5F7FA]"
                    >
                      My Orders <ChevronRight className="size-4 opacity-40" />
                    </button>
                    <button
                      onClick={() => handleNavClick('profile', { tab: 'wishlist' })}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-[#1F2A3A] hover:bg-[#F5F7FA]"
                    >
                      My Wishlist <ChevronRight className="size-4 opacity-40" />
                    </button>
                    <Separator className="my-2 bg-[#E4E7EC]" />
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileOpen(false);
                      }}
                      className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-[#DC3545] hover:bg-red-50"
                    >
                      <LogOut className="size-4 mr-2.5" /> Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleNavClick('login')}
                    className="flex items-center justify-center gap-2 mx-3 py-2.5 rounded-lg text-sm font-semibold bg-[#FF5722] text-white hover:bg-[#E64A19] transition-colors"
                  >
                    <User className="size-4" /> Login / Sign Up
                  </button>
                )}

                <Separator className="my-2 bg-[#E4E7EC]" />
                <button
                  onClick={() => {
                    navigate('admin-login');
                    setMobileOpen(false);
                  }}
                  className="flex items-center px-3 py-2.5 rounded-lg text-xs text-[#5A6B7F] hover:bg-[#F5F7FA]"
                >
                  Admin Panel
                </button>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <button
            onClick={() => navigate('home')}
            className="text-xl font-bold text-white tracking-tight"
          >
            Cloth<span className="text-[#FF5722]">Fasion</span>
          </button>

          <div className="flex-1" />

          {/* Right icons */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => isCustomerLoggedIn() ? navigate('profile', { tab: 'wishlist' }) : navigate('login')}
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            <Heart className="size-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('cart')}
            className="relative text-white/80 hover:text-white hover:bg-white/10"
          >
            <ShoppingCart className="size-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#FF5722] text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
