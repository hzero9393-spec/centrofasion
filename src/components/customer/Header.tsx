'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigation } from '@/stores/navigation';
import { useCart } from '@/stores/cart';
import { useAuth } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  LogOut,
  Package,
  Settings,
  UserCircle,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react';
import type { Product } from './SharedTypes';

/* ------------------------------------------------------------------ */
/*  Modern theme-aware e-commerce header for ClothFasion               */
/* ------------------------------------------------------------------ */

export default function Header() {
  const { currentPage, navigate, pageParams } = useNavigation();
  const { getItemCount } = useCart();
  const { customer, isCustomerLoggedIn, logoutCustomer } = useAuth();
  const { darkMode, toggleDarkMode } = useThemeStore();

  // --- state ---
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [mobileSearchResults, setMobileSearchResults] = useState<Product[]>([]);
  const [showMobileSuggestions, setShowMobileSuggestions] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // --- refs ---
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cartCount = getItemCount();

  const navLinks = [
    { label: 'Home', page: 'home' as const },
    { label: 'Men', page: 'shop' as const, params: { category: 'men' } },
    { label: 'Women', page: 'shop' as const, params: { category: 'women' } },
    { label: 'Kids', page: 'shop' as const, params: { category: 'kids' } },
    { label: 'Accessories', page: 'shop' as const, params: { category: 'accessories' } },
  ];

  /* ---------- scroll handler ---------- */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ---------- search (desktop) ---------- */
  const fetchSearchResults = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await fetch(
        `/api/products?search=${encodeURIComponent(q.trim())}&limit=5`,
      );
      const data = await res.json();
      setSearchResults(data.products || []);
    } catch {
      setSearchResults([]);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSearchResults(searchQuery), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, fetchSearchResults]);

  /* ---------- search (mobile) ---------- */
  const fetchMobileSearchResults = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setMobileSearchResults([]);
      return;
    }
    try {
      const res = await fetch(
        `/api/products?search=${encodeURIComponent(q.trim())}&limit=5`,
      );
      const data = await res.json();
      setMobileSearchResults(data.products || []);
    } catch {
      setMobileSearchResults([]);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => fetchMobileSearchResults(mobileSearchQuery),
      300,
    );
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [mobileSearchQuery, fetchMobileSearchResults]);

  /* ---------- click outside to close suggestions ---------- */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(e.target as Node)
      ) {
        setShowMobileSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ---------- handlers ---------- */
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
      setMobileSearchQuery('');
      setMobileOpen(false);
    }
  };

  const handleNavClick = (page: string, params?: Record<string, string>) => {
    navigate(page as Parameters<typeof navigate>[0], params);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logoutCustomer();
    navigate('home');
  };

  const isActive = (page: string, params?: Record<string, string>) =>
    currentPage === page &&
    JSON.stringify(pageParams) === JSON.stringify(params || {});

  /* ============================================================ */
  /*  RENDER                                                      */
  /* ============================================================ */
  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-500 ease-out border-b border-[var(--theme-border)] ${
          scrolled
            ? 'bg-[var(--theme-bg)]/80 backdrop-blur-xl shadow-sm'
            : 'bg-[var(--theme-bg)]/70 backdrop-blur-xl'
        }`}
      >
        {/* ==================== DESKTOP ==================== */}
        <div className="hidden md:block">
          <div className="mx-auto max-w-[1280px] px-8">
            <div className="flex h-[44px] items-center gap-0">
              {/* ---- Logo ---- */}
              <button
                onClick={() => navigate('home')}
                className="mr-8 flex shrink-0 items-center gap-0 outline-none"
                aria-label="ClothFasion Home"
              >
                <span className="text-[17px] font-semibold tracking-tight text-[var(--theme-text)]">
                  Cloth
                </span>
                <span className="text-[17px] font-semibold tracking-tight text-gradient">
                  Fasion
                </span>
              </button>

              {/* ---- Nav Links ---- */}
              <nav className="flex items-center gap-[26px]">
                {navLinks.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => handleNavClick(link.page, link.params)}
                    className={`text-[11px] font-normal tracking-wide transition-colors duration-300 outline-none ${
                      isActive(link.page, link.params)
                        ? 'text-[var(--theme-text)]'
                        : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
              </nav>

              {/* ---- spacer ---- */}
              <div className="flex-1" />

              {/* ---- Search ---- */}
              <div ref={searchRef} className="relative">
                <form onSubmit={handleSearch}>
                  <div className="group relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-[14px] -translate-y-1/2 text-[var(--theme-text-muted)] transition-colors group-focus-within:text-[var(--theme-text-secondary)]" />
                    <Input
                      type="text"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      className="h-[30px] w-[180px] rounded-full border border-[var(--theme-border)] bg-[var(--theme-surface)] pl-8 pr-3 text-[12px] text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)] focus-visible:w-[260px] focus-visible:border-[var(--theme-text-muted)] focus-visible:bg-[var(--theme-surface-hover)] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none transition-all duration-300"
                    />
                  </div>
                </form>

                {/* Autocomplete Dropdown */}
                {showSuggestions && searchQuery.trim().length >= 2 && (
                  <div className="absolute top-full left-0 mt-2 w-[320px] rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-card)]/95 backdrop-blur-2xl shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-200">
                    <div className="max-h-[340px] overflow-y-auto overscroll-contain">
                      {searchResults.length > 0 ? (
                        <div className="py-1.5">
                          {searchResults.map((product) => (
                            <button
                              key={product.id}
                              onClick={() => {
                                navigate('product', { id: product.id });
                                setShowSuggestions(false);
                                setSearchQuery('');
                              }}
                              className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-[var(--theme-surface)] rounded-xl mx-1.5 w-[calc(100%-12px)]"
                            >
                              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[var(--theme-border-subtle)] bg-[var(--theme-surface)]">
                                <img
                                  src={
                                    product.images[0] ||
                                    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=80&h=80&fit=crop'
                                  }
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[13px] font-medium text-[var(--theme-text)]">
                                  {product.name}
                                </p>
                                <p className="mt-0.5 text-[11px] text-[var(--theme-text-muted)]">
                                  {product.category_name}
                                </p>
                              </div>
                              <p className="shrink-0 text-[13px] font-semibold text-[var(--theme-text-secondary)]">
                                ₹{product.price.toLocaleString('en-IN')}
                              </p>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="px-4 py-10 text-center">
                          <p className="text-[13px] text-[var(--theme-text-muted)]">
                            No results for &ldquo;{searchQuery}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>

                    {searchResults.length > 0 && (
                      <div className="border-t border-[var(--theme-border)]">
                        <button
                          onClick={() => {
                            navigate('shop', { search: searchQuery.trim() });
                            setShowSuggestions(false);
                            setSearchQuery('');
                          }}
                          className="flex w-full items-center justify-center gap-1 py-2.5 text-[12px] font-medium text-[var(--theme-primary)] transition-colors hover:bg-[var(--theme-surface)]"
                        >
                          View all results for &ldquo;{searchQuery}&rdquo;
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ---- Divider ---- */}
              <div className="mx-3 h-5 w-px bg-[var(--theme-border)]" />

              {/* ---- Action Icons ---- */}
              <div className="flex items-center gap-0.5">
                {/* Wishlist */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    isCustomerLoggedIn()
                      ? navigate('profile', { tab: 'wishlist' })
                      : navigate('login')
                  }
                  className="h-8 w-8 text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface)] transition-colors duration-200"
                >
                  <Heart className="size-[17px]" />
                  <span className="sr-only">Wishlist</span>
                </Button>

                {/* Cart */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('cart')}
                  className="relative h-8 w-8 text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface)] transition-colors duration-200"
                >
                  <ShoppingCart className="size-[17px]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[var(--theme-primary)] px-[5px] text-[10px] font-bold leading-none text-white shadow-[0_2px_8px_var(--theme-glow)]">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                  <span className="sr-only">Cart</span>
                </Button>

                {/* Dark Mode Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleDarkMode}
                  className="h-8 w-8 text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface)] transition-colors duration-200"
                  aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {darkMode ? (
                    <Sun className="size-[17px]" />
                  ) : (
                    <Moon className="size-[17px]" />
                  )}
                  <span className="sr-only">
                    {darkMode ? 'Light mode' : 'Dark mode'}
                  </span>
                </Button>

                {/* User */}
                {isCustomerLoggedIn() && customer ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 transition-colors duration-200 hover:bg-[var(--theme-surface)]"
                      >
                        <div className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-secondary)] text-[11px] font-bold text-white shadow-[0_2px_8px_var(--theme-glow)]">
                          {customer.first_name?.[0]?.toUpperCase() || 'U'}
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      sideOffset={8}
                      className="w-[220px] rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-card)] p-1.5 shadow-lg"
                    >
                      {/* User info card */}
                      <div className="mb-1.5 rounded-xl bg-[var(--theme-surface)] px-3 py-2.5">
                        <p className="text-[13px] font-semibold text-[var(--theme-text)]">
                          {customer.first_name} {customer.last_name}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[var(--theme-text-muted)]">
                          {customer.mobile}
                        </p>
                      </div>

                      <DropdownMenuItem
                        onClick={() => navigate('profile')}
                        className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] text-[var(--theme-text-secondary)] outline-none transition-colors hover:bg-[var(--theme-surface)] hover:text-[var(--theme-text)] focus:bg-[var(--theme-surface)] focus:text-[var(--theme-text)] data-[highlighted]:bg-[var(--theme-surface)] data-[highlighted]:text-[var(--theme-text)]"
                      >
                        <UserCircle className="size-[15px] text-[var(--theme-text-muted)]" />
                        My Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => navigate('profile', { tab: 'orders' })}
                        className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] text-[var(--theme-text-secondary)] outline-none transition-colors hover:bg-[var(--theme-surface)] hover:text-[var(--theme-text)] focus:bg-[var(--theme-surface)] focus:text-[var(--theme-text)] data-[highlighted]:bg-[var(--theme-surface)] data-[highlighted]:text-[var(--theme-text)]"
                      >
                        <Package className="size-[15px] text-[var(--theme-text-muted)]" />
                        My Orders
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => navigate('profile', { tab: 'wishlist' })}
                        className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] text-[var(--theme-text-secondary)] outline-none transition-colors hover:bg-[var(--theme-surface)] hover:text-[var(--theme-text)] focus:bg-[var(--theme-surface)] focus:text-[var(--theme-text)] data-[highlighted]:bg-[var(--theme-surface)] data-[highlighted]:text-[var(--theme-text)]"
                      >
                        <Heart className="size-[15px] text-[var(--theme-text-muted)]" />
                        My Wishlist
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => navigate('profile', { tab: 'settings' })}
                        className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] text-[var(--theme-text-secondary)] outline-none transition-colors hover:bg-[var(--theme-surface)] hover:text-[var(--theme-text)] focus:bg-[var(--theme-surface)] focus:text-[var(--theme-text)] data-[highlighted]:bg-[var(--theme-surface)] data-[highlighted]:text-[var(--theme-text)]"
                      >
                        <Settings className="size-[15px] text-[var(--theme-text-muted)]" />
                        Settings
                      </DropdownMenuItem>

                      <DropdownMenuSeparator className="my-1 h-px bg-[var(--theme-border)]" />

                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] text-[#FF453A] outline-none transition-colors hover:bg-[#FF453A]/[0.06] focus:bg-[#FF453A]/[0.06] data-[highlighted]:bg-[#FF453A]/[0.06]"
                      >
                        <LogOut className="size-[15px]" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('login')}
                    className="h-8 w-8 text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface)] transition-colors duration-200"
                  >
                    <User className="size-[17px]" />
                    <span className="sr-only">Account</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ==================== MOBILE ==================== */}
        <div className="md:hidden">
          <div className="flex h-[48px] items-center px-4 gap-1">
            {/* Hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="-ml-2 h-9 w-9 text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface)] transition-colors"
                >
                  <Menu className="size-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>

              <SheetContent
                side="left"
                className="w-[280px] border-r border-[var(--theme-border)] bg-[var(--theme-card)] p-0 backdrop-blur-2xl"
              >
                {/* Sheet header */}
                <SheetHeader className="border-b border-[var(--theme-border)] px-5 py-4">
                  <SheetTitle className="flex items-center gap-0 text-left">
                    <span className="text-[18px] font-semibold tracking-tight text-[var(--theme-text)]">
                      Cloth
                    </span>
                    <span className="text-[18px] font-semibold tracking-tight text-gradient">
                      Fasion
                    </span>
                  </SheetTitle>
                </SheetHeader>

                {/* Mobile Search */}
                <div ref={mobileSearchRef} className="border-b border-[var(--theme-border)] px-4 py-3">
                  <div className="group relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-[14px] -translate-y-1/2 text-[var(--theme-text-muted)] transition-colors group-focus-within:text-[var(--theme-text-secondary)]" />
                    <Input
                      type="text"
                      placeholder="Search products..."
                      value={mobileSearchQuery}
                      onChange={(e) => {
                        setMobileSearchQuery(e.target.value);
                        setShowMobileSuggestions(true);
                      }}
                      onFocus={() => setShowMobileSuggestions(true)}
                      className="h-9 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] pl-8 pr-3 text-[13px] text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)] focus-visible:border-[var(--theme-text-muted)] focus-visible:bg-[var(--theme-surface-hover)] focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-300"
                    />
                  </div>

                  {showMobileSuggestions &&
                    mobileSearchQuery.trim().length >= 2 &&
                    mobileSearchResults.length > 0 && (
                      <div className="mt-2 max-h-[260px] overflow-y-auto overscroll-contain rounded-xl border border-[var(--theme-border)] bg-[var(--theme-card)] shadow-lg">
                        {mobileSearchResults.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => {
                              navigate('product', { id: product.id });
                              setShowMobileSuggestions(false);
                              setMobileSearchQuery('');
                              setMobileOpen(false);
                            }}
                            className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[var(--theme-surface)]"
                          >
                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[var(--theme-border-subtle)] bg-[var(--theme-surface)]">
                              <img
                                src={product.images[0] || ''}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[12px] font-medium text-[var(--theme-text)]">
                                {product.name}
                              </p>
                              <p className="mt-0.5 text-[11px] font-semibold text-[var(--theme-text-secondary)]">
                                ₹{product.price.toLocaleString('en-IN')}
                              </p>
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
                          className="w-full border-t border-[var(--theme-border)] py-2.5 text-center text-[12px] font-medium text-[var(--theme-primary)] transition-colors hover:bg-[var(--theme-surface)]"
                        >
                          View all results
                        </button>
                      </div>
                    )}
                </div>

                {/* Nav Links */}
                <nav className="flex flex-col gap-px p-2">
                  {navLinks.map((link) => (
                    <button
                      key={link.label}
                      onClick={() => handleNavClick(link.page, link.params)}
                      className={`flex items-center justify-between rounded-xl px-3 py-[11px] text-[14px] transition-colors duration-200 ${
                        isActive(link.page, link.params)
                          ? 'bg-[var(--theme-surface)] text-[var(--theme-text)] font-medium'
                          : 'text-[var(--theme-text-secondary)] hover:bg-[var(--theme-surface)] hover:text-[var(--theme-text)]'
                      }`}
                    >
                      {link.label}
                      <ChevronRight className="size-[14px] opacity-40" />
                    </button>
                  ))}

                  <Separator className="my-2 h-px bg-[var(--theme-border)]" />

                  {isCustomerLoggedIn() && customer ? (
                    <>
                      <button
                        onClick={() => handleNavClick('profile')}
                        className="flex items-center justify-between rounded-xl px-3 py-[11px] text-[14px] text-[var(--theme-text-secondary)] transition-colors hover:bg-[var(--theme-surface)] hover:text-[var(--theme-text)]"
                      >
                        My Account
                        <ChevronRight className="size-[14px] opacity-40" />
                      </button>
                      <button
                        onClick={() => handleNavClick('profile', { tab: 'orders' })}
                        className="flex items-center justify-between rounded-xl px-3 py-[11px] text-[14px] text-[var(--theme-text-secondary)] transition-colors hover:bg-[var(--theme-surface)] hover:text-[var(--theme-text)]"
                      >
                        My Orders
                        <ChevronRight className="size-[14px] opacity-40" />
                      </button>
                      <button
                        onClick={() => handleNavClick('profile', { tab: 'wishlist' })}
                        className="flex items-center justify-between rounded-xl px-3 py-[11px] text-[14px] text-[var(--theme-text-secondary)] transition-colors hover:bg-[var(--theme-surface)] hover:text-[var(--theme-text)]"
                      >
                        My Wishlist
                        <ChevronRight className="size-[14px] opacity-40" />
                      </button>

                      <Separator className="my-2 h-px bg-[var(--theme-border)]" />

                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileOpen(false);
                        }}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-[11px] text-[14px] font-medium text-[#FF453A] transition-colors hover:bg-[#FF453A]/[0.06]"
                      >
                        <LogOut className="size-[15px]" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleNavClick('login')}
                      className="mx-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] px-4 py-[11px] text-[14px] font-semibold text-white shadow-[0_4px_16px_var(--theme-glow)] transition-all duration-300 hover:opacity-90"
                    >
                      <User className="size-4" />
                      Login / Sign Up
                    </button>
                  )}

                  <Separator className="my-2 h-px bg-[var(--theme-border)]" />

                  <a
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-3 py-[11px] text-[12px] text-[var(--theme-text-muted)] transition-colors hover:bg-[var(--theme-surface)] hover:text-[var(--theme-text-secondary)]"
                  >
                    Admin Panel
                  </a>
                </nav>
              </SheetContent>
            </Sheet>

            {/* Logo (mobile) */}
            <button
              onClick={() => navigate('home')}
              className="flex shrink-0 items-center gap-0 outline-none"
              aria-label="ClothFasion Home"
            >
              <span className="text-[16px] font-semibold tracking-tight text-[var(--theme-text)]">
                Cloth
              </span>
              <span className="text-[16px] font-semibold tracking-tight text-gradient">
                Fasion
              </span>
            </button>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Wishlist */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                isCustomerLoggedIn()
                  ? navigate('profile', { tab: 'wishlist' })
                  : navigate('login')
              }
              className="h-9 w-9 text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface)] transition-colors"
            >
              <Heart className="size-[18px]" />
              <span className="sr-only">Wishlist</span>
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('cart')}
              className="relative h-9 w-9 text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface)] transition-colors"
            >
              <ShoppingCart className="size-[18px]" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[var(--theme-primary)] px-[5px] text-[10px] font-bold leading-none text-white shadow-[0_2px_8px_var(--theme-glow)]">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
              <span className="sr-only">Cart</span>
            </Button>

            {/* Dark Mode Toggle (mobile) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="h-9 w-9 text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface)] transition-colors"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <Sun className="size-[18px]" />
              ) : (
                <Moon className="size-[18px]" />
              )}
              <span className="sr-only">
                {darkMode ? 'Light mode' : 'Dark mode'}
              </span>
            </Button>

            {/* User (mobile — icon only) */}
            {isCustomerLoggedIn() && customer ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('profile')}
                className="h-9 w-9 transition-colors hover:bg-[var(--theme-surface)]"
              >
                <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-secondary)] text-[10px] font-bold text-white">
                  {customer.first_name?.[0]?.toUpperCase() || 'U'}
                </div>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('login')}
                className="h-9 w-9 text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface)] transition-colors"
              >
                <User className="size-[18px]" />
                <span className="sr-only">Account</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Click-away backdrop for desktop search suggestions */}
      {showSuggestions && searchQuery.trim().length >= 2 && (
        <div
          className="fixed inset-0 z-40 hidden md:block"
          onClick={() => setShowSuggestions(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
