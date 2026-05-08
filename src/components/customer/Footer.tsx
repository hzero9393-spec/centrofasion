'use client';

import React, { useState } from 'react';
import { useNavigation } from '@/stores/navigation';
import { useThemeStore, THEMES } from '@/stores/theme';
import { Instagram, Facebook, Twitter, CreditCard, Truck, Palette, Check, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

export default function Footer() {
  const { navigate } = useNavigation();
  const { activeThemeId, setActiveTheme } = useThemeStore();
  const [showThemes, setShowThemes] = useState(false);

  const shopLinks = [
    { label: 'Home', action: () => navigate('home') },
    { label: 'Men', action: () => navigate('shop', { category: 'men' }) },
    { label: 'Women', action: () => navigate('shop', { category: 'women' }) },
    { label: 'Kids', action: () => navigate('shop', { category: 'kids' }) },
    { label: 'Accessories', action: () => navigate('shop', { category: 'accessories' }) },
  ];

  const supportLinks = [
    { label: 'FAQ', action: () => {} },
    { label: 'Returns & Exchange', action: () => {} },
    { label: 'Contact Us', action: () => {} },
    { label: 'Track Order', action: () => {} },
  ];

  const policyLinks = [
    { label: 'Privacy Policy', action: () => {} },
    { label: 'Terms of Service', action: () => {} },
    { label: 'Shipping Policy', action: () => {} },
  ];

  const handleApplyTheme = (themeId: string, themeName: string) => {
    setActiveTheme(themeId);
    toast.success(`${themeName} theme applied!`);
  };

  return (
    <footer className="bg-[var(--theme-card)] text-[var(--theme-text)] mt-auto">
      {/* Subtle top gradient border */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--theme-border)] to-transparent" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Column 1: Logo + Tagline + Socials */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2 mb-4 lg:mb-0">
            <button
              onClick={() => navigate('home')}
              className="text-2xl font-bold tracking-tight transition-opacity hover:opacity-80"
            >
              <span className="bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] bg-clip-text text-transparent">
                ClothFasion
              </span>
            </button>
            <p className="text-sm text-[var(--theme-text-muted)] mt-3 leading-relaxed max-w-[300px]">
              Your one-stop destination for premium fashion. Trending styles, quality fabrics, and unbeatable prices.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-6">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-[var(--theme-surface)] hover:bg-gradient-to-r hover:from-[var(--theme-primary)] hover:to-[var(--theme-secondary)] flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[var(--theme-primary)]/20"
                aria-label="Instagram"
              >
                <Instagram className="size-[18px] text-[var(--theme-text-muted)] hover:text-white transition-colors" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-[var(--theme-surface)] hover:bg-gradient-to-r hover:from-[var(--theme-primary)] hover:to-[var(--theme-secondary)] flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[var(--theme-primary)]/20"
                aria-label="Facebook"
              >
                <Facebook className="size-[18px] text-[var(--theme-text-muted)] hover:text-white transition-colors" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-[var(--theme-surface)] hover:bg-gradient-to-r hover:from-[var(--theme-primary)] hover:to-[var(--theme-secondary)] flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[var(--theme-primary)]/20"
                aria-label="Twitter"
              >
                <Twitter className="size-[18px] text-[var(--theme-text-muted)] hover:text-white transition-colors" />
              </a>
            </div>
          </div>

          {/* Column 2: Shop */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--theme-text)] mb-4">
              Shop
            </h4>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={link.action}
                    className="text-sm text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors duration-200"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--theme-text)] mb-4">
              Support
            </h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={link.action}
                    className="text-sm text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors duration-200"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Policies */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--theme-text)] mb-4">
              Policies
            </h4>
            <ul className="space-y-3">
              {policyLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={link.action}
                    className="text-sm text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors duration-200"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[var(--theme-border)]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--theme-text-muted)]">
            © 2024 ClothFasion. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {/* Theme Picker */}
            <div className="relative">
              <button
                onClick={() => setShowThemes(!showThemes)}
                className="flex items-center gap-2 text-[var(--theme-text-muted)] hover:text-[var(--theme-text-secondary)] transition-colors px-3 py-1.5 rounded-lg hover:bg-[var(--theme-surface)]"
              >
                <Palette className="size-4" />
                <span className="text-xs font-medium">Theme</span>
                <ChevronDown className={`size-3 transition-transform duration-200 ${showThemes ? 'rotate-180' : ''}`} />
              </button>

              {showThemes && (
                <>
                  {/* Backdrop */}
                  <div className="fixed inset-0 z-40" onClick={() => setShowThemes(false)} />

                  {/* Theme Dropdown */}
                  <div className="absolute bottom-full right-0 mb-2 z-50 w-[280px] rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-card)]/95 backdrop-blur-2xl shadow-lg p-3 animate-fade-up">
                    <p className="text-xs font-medium text-[var(--theme-text-muted)] px-1 mb-2">Choose Theme</p>
                    <div className="grid grid-cols-4 gap-2">
                      {THEMES.map((theme) => {
                        const isActive = activeThemeId === theme.id;
                        return (
                          <button
                            key={theme.id}
                            onClick={() => { handleApplyTheme(theme.id, theme.name); setShowThemes(false); }}
                            className={`relative group rounded-xl p-1.5 transition-all duration-200 hover:scale-105 ${isActive ? 'ring-2 ring-[var(--theme-primary)]/30 bg-[var(--theme-surface)]' : 'bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-hover)]'}`}
                            title={theme.name}
                          >
                            <div className="grid grid-cols-2 gap-0.5">
                              {theme.preview.slice(0, 4).map((color, i) => (
                                <div
                                  key={i}
                                  className="h-5 rounded-sm"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                            {isActive && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#28A745] flex items-center justify-center">
                                <Check className="size-2.5 text-white" />
                              </div>
                            )}
                            <p className="text-[9px] text-[var(--theme-text-muted)] mt-1 text-center truncate group-hover:text-[var(--theme-text-secondary)]">{theme.name}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 text-[var(--theme-text-muted)] hover:text-[var(--theme-text-secondary)] transition-colors">
              <CreditCard className="size-4" />
              <span className="text-xs">Secure Payments</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--theme-text-muted)] hover:text-[var(--theme-text-secondary)] transition-colors">
              <Truck className="size-4" />
              <span className="text-xs">Fast Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
