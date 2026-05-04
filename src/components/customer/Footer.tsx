'use client';

import React from 'react';
import { useNavigation } from '@/stores/navigation';
import { Instagram, Facebook, Twitter, CreditCard, Truck } from 'lucide-react';

export default function Footer() {
  const { navigate } = useNavigation();

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

  return (
    <footer className="bg-[#0A1B2A] text-white mt-auto">
      <div className="max-w-[1280px] mx-auto px-4 py-10 md:py-14">
        {/* 5-Column Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-6">
          {/* Column 1: Logo + Tagline */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1 mb-4 lg:mb-0">
            <button
              onClick={() => navigate('home')}
              className="text-xl font-bold text-white tracking-tight"
            >
              Cloth<span className="text-[#FF5722]">Fasion</span>
            </button>
            <p className="text-sm text-white/50 mt-3 leading-relaxed max-w-[260px]">
              Your one-stop destination for premium fashion. Trending styles, quality fabrics, and unbeatable prices.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-2.5 mt-5">
              <a href="#" className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#FF5722] flex items-center justify-center transition-colors" aria-label="Instagram">
                <Instagram className="size-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#FF5722] flex items-center justify-center transition-colors" aria-label="Facebook">
                <Facebook className="size-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#FF5722] flex items-center justify-center transition-colors" aria-label="Twitter">
                <Twitter className="size-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Shop */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/80 mb-4">
              Shop
            </h4>
            <ul className="space-y-2.5">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={link.action}
                    className="text-sm text-white/50 hover:text-white transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/80 mb-4">
              Support
            </h4>
            <ul className="space-y-2.5">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={link.action}
                    className="text-sm text-white/50 hover:text-white transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Policies */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/80 mb-4">
              Policies
            </h4>
            <ul className="space-y-2.5">
              {policyLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={link.action}
                    className="text-sm text-white/50 hover:text-white transition-colors"
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
      <div className="border-t border-white/10">
        <div className="max-w-[1280px] mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            © 2024 ClothFasion. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-white/40">
              <CreditCard className="size-4" />
              <span className="text-xs">Secure Payments</span>
            </div>
            <div className="flex items-center gap-2 text-white/40">
              <Truck className="size-4" />
              <span className="text-xs">Fast Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
