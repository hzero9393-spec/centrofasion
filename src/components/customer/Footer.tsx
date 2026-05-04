'use client';

import React from 'react';
import { useNavigation } from '@/stores/navigation';
import { Separator } from '@/components/ui/separator';

export default function Footer() {
  const { navigate } = useNavigation();

  const shopLinks = [
    { label: 'All Products', action: () => navigate('shop') },
    { label: 'Men', action: () => navigate('shop', { category: 'men' }) },
    { label: 'Women', action: () => navigate('shop', { category: 'women' }) },
    { label: 'Kids', action: () => navigate('shop', { category: 'kids' }) },
    { label: 'Accessories', action: () => navigate('shop', { category: 'accessories' }) },
  ];

  const serviceLinks = [
    { label: 'Contact Us', action: () => {} },
    { label: 'FAQs', action: () => {} },
    { label: 'Shipping Policy', action: () => {} },
    { label: 'Return Policy', action: () => {} },
    { label: 'Size Guide', action: () => {} },
  ];

  const aboutLinks = [
    { label: 'About Us', action: () => {} },
    { label: 'Careers', action: () => {} },
    { label: 'Privacy Policy', action: () => {} },
    { label: 'Terms of Service', action: () => {} },
  ];

  return (
    <footer className="bg-[#111] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Shop */}
          <div>
            <h4 className="font-[family-name:var(--font-poppins)] text-sm font-semibold uppercase tracking-wider mb-4 text-[#FF6A00]">
              Shop
            </h4>
            <ul className="space-y-2.5">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={link.action}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-[family-name:var(--font-poppins)] text-sm font-semibold uppercase tracking-wider mb-4 text-[#FF6A00]">
              Customer Service
            </h4>
            <ul className="space-y-2.5">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={link.action}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="font-[family-name:var(--font-poppins)] text-sm font-semibold uppercase tracking-wider mb-4 text-[#FF6A00]">
              About
            </h4>
            <ul className="space-y-2.5">
              {aboutLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={link.action}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-[family-name:var(--font-poppins)] text-sm font-semibold uppercase tracking-wider mb-4 text-[#FF6A00]">
              Connect
            </h4>
            <div className="flex gap-3 mb-6">
              {['Instagram', 'Facebook', 'Twitter', 'YouTube'].map((social) => (
                <button
                  key={social}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#FF6A00] flex items-center justify-center transition-colors"
                  aria-label={social}
                >
                  <span className="text-xs font-bold">
                    {social[0]}
                  </span>
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-400">
              <p>support@clothfasion.com</p>
              <p className="mt-1">+91 98765 43210</p>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-white/10" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; 2024 ClothFasion. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="font-[family-name:var(--font-poppins)] text-lg font-bold tracking-tight">
              Cloth<span className="text-[#FF6A00]">Fasion</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
