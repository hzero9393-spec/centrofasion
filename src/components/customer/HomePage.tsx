'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigation } from '@/stores/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, Truck, ShieldCheck, Headphones, ArrowRight } from 'lucide-react';
import ProductCard from './ProductCard';
import type { Product, Category } from './SharedTypes';

/* ─────────────────────────────────────────────
   Data
   ───────────────────────────────────────────── */

const WHY_CHOOSE_US = [
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Get your orders delivered within 3-5 business days across India.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Payments',
    description: 'All transactions are 100% secure with encrypted payment processing.',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Our dedicated team is available round the clock to assist you.',
  },
];

/* ─────────────────────────────────────────────
   Component
   ───────────────────────────────────────────── */

export default function HomePage() {
  const { navigate } = useNavigation();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  // ── Fetch data ─────────────────────────────
  useEffect(() => {
    async function fetchData() {
      try {
        const [featuredRes, trendingRes, catRes] = await Promise.all([
          fetch('/api/products?featured=true&limit=12'),
          fetch('/api/products?sort=newest&limit=8'),
          fetch('/api/categories'),
        ]);
        const featuredData = await featuredRes.json();
        const trendingData = await trendingRes.json();
        const catData = await catRes.json();
        setFeaturedProducts(Array.isArray(featuredData.products) ? featuredData.products : []);
        setTrendingProducts(Array.isArray(trendingData.products) ? trendingData.products : []);
        setCategories(Array.isArray(catData) ? catData : []);
      } catch (err) {
        console.error('Failed to fetch home data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // ── Scroll carousel ────────────────────────
  const scrollCarousel = useCallback((direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }, []);

  return (
    <div className="pb-20 md:pb-0 bg-black">
      {/* ═══════════════════════════════════════ */}
      {/* Section 1: Hero — Cinematic Full-Screen */}
      {/* ═══════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-black via-[#0A0A0A] to-[#111111]">
        {/* Dot pattern overlay */}
        <div className="absolute inset-0 dot-pattern opacity-40" />

        {/* Decorative gradient orbs */}
        <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full bg-gradient-to-br from-[#FF5722]/25 to-[#FF2D55]/10 blur-[120px] animate-float pointer-events-none" />
        <div className="absolute bottom-[10%] left-[0%] w-[400px] h-[400px] md:w-[550px] md:h-[550px] rounded-full bg-gradient-to-tr from-[#FF2D55]/20 to-[#FF5722]/5 blur-[100px] animate-float-slow pointer-events-none" />
        <div className="absolute top-[50%] left-[40%] w-[300px] h-[300px] rounded-full bg-gradient-to-r from-[#FF5722]/10 to-[#FF2D55]/10 blur-[80px] animate-float-reverse pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 max-w-[1280px] mx-auto px-4 text-center">
          <h1 className="animate-fade-up text-[40px] sm:text-[52px] md:text-[80px] font-bold tracking-tight text-white leading-[1.05] mb-6">
            Discover Your{' '}
            <span className="bg-gradient-to-r from-[#FF5722] to-[#FF2D55] bg-clip-text text-transparent">
              Style
            </span>
          </h1>
          <p className="animate-fade-up animate-fade-up-delay-1 text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Explore the latest trends in fashion with our curated collection.
            Premium quality, timeless design.
          </p>
          <div className="animate-fade-up animate-fade-up-delay-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => navigate('shop')}
              size="lg"
              className="bg-gradient-to-r from-[#FF5722] to-[#FF2D55] hover:opacity-90 text-white rounded-full px-8 py-4 text-base font-semibold shadow-[0_8px_32px_rgba(255,87,34,0.35)] transition-all duration-300 hover:shadow-[0_12px_48px_rgba(255,87,34,0.5)] hover:scale-[1.02] btn-scale"
            >
              Shop Now
              <ArrowRight className="ml-2 size-4" />
            </Button>
            <Button
              onClick={() => navigate('shop', { sort: 'newest' })}
              variant="ghost"
              size="lg"
              className="text-white/70 hover:text-white rounded-full px-8 py-4 text-base font-medium hover:bg-white/10 transition-all duration-300"
            >
              New Arrivals
            </Button>
          </div>

          {/* Scroll indicator */}
          <div className="animate-fade-up animate-fade-up-delay-4 mt-16 md:mt-24">
            <div className="w-6 h-10 rounded-full border-2 border-white/20 mx-auto flex items-start justify-center p-1.5">
              <div className="w-1 h-2.5 rounded-full bg-white/50 animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* Section 2: Category Grid — 3D Cards     */}
      {/* ═══════════════════════════════════════ */}
      <section className="bg-black py-16 md:py-24">
        <div className="max-w-[1280px] mx-auto px-4">
          {/* Title */}
          <div className="text-center mb-10 md:mb-14">
            <h2 className="animate-fade-up text-3xl md:text-5xl font-bold text-white tracking-tight mb-3">
              Shop by Category
            </h2>
            <p className="animate-fade-up animate-fade-up-delay-1 text-white/50 text-base md:text-lg">
              Browse our curated collections
            </p>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square rounded-2xl bg-[#1D1D1F]" />
                  <Skeleton className="h-4 w-16 mx-auto bg-[#1D1D1F]" />
                </div>
              ))}
            </div>
          ) : (
            <div className="perspective-[1000px] grid grid-cols-2 md:grid-cols-5 gap-4">
              {categories.slice(0, 5).map((cat, idx) => (
                <button
                  key={cat.id}
                  onClick={() => navigate('shop', { category: cat.slug })}
                  className={`
                    animate-fade-up
                    ${idx === 1 ? 'animate-fade-up-delay-1' : ''}
                    ${idx === 2 ? 'animate-fade-up-delay-2' : ''}
                    ${idx === 3 ? 'animate-fade-up-delay-3' : ''}
                    ${idx === 4 ? 'animate-fade-up-delay-4' : ''}
                    group relative bg-[#1D1D1F] rounded-2xl overflow-hidden
                    hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(255,87,34,0.15)]
                    transition-all duration-500 text-left
                  `}
                >
                  <div className="aspect-[4/5] overflow-hidden">
                    <img
                      src={
                        cat.image ||
                        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop'
                      }
                      alt={cat.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-medium text-white group-hover:text-[#FF5722] transition-colors duration-300">
                      {cat.name}
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">
                      {cat.product_count} items
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* Section 3: Featured Products — Horizontal Scroll */}
      {/* ═══════════════════════════════════════════ */}
      <section className="bg-black py-16 md:py-24">
        <div className="max-w-[1280px] mx-auto px-4">
          {/* Title */}
          <div className="text-center mb-10 md:mb-14">
            <h2 className="animate-fade-up text-3xl md:text-5xl font-bold text-white tracking-tight mb-3">
              Handpicked For You
            </h2>
            <p className="animate-fade-up animate-fade-up-delay-1 text-white/50 text-base md:text-lg">
              Our editors&apos; top picks
            </p>
          </div>

          {loading ? (
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="shrink-0 w-[200px] md:w-[240px] space-y-3">
                  <Skeleton className="aspect-square rounded-2xl bg-[#1D1D1F]" />
                  <Skeleton className="h-4 w-3/4 bg-[#1D1D1F]" />
                  <Skeleton className="h-5 w-1/2 bg-[#1D1D1F]" />
                </div>
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/40 text-sm">No featured products available yet.</p>
            </div>
          ) : (
            <div className="relative group/featured">
              {/* Dark card container */}
              <div className="bg-[#1D1D1F] rounded-3xl p-6 md:p-8">
                <div
                  ref={scrollRef}
                  className="flex gap-4 md:gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
                >
                  {featuredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="shrink-0 w-[170px] sm:w-[200px] md:w-[240px] snap-start"
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Scroll buttons */}
              <button
                onClick={() => scrollCarousel('left')}
                className="glass-btn absolute left-3 md:-left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white opacity-0 group-hover/featured:opacity-100 transition-opacity duration-300 z-10"
                aria-label="Scroll left"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                onClick={() => scrollCarousel('right')}
                className="glass-btn absolute right-3 md:-right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white opacity-0 group-hover/featured:opacity-100 transition-opacity duration-300 z-10"
                aria-label="Scroll right"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          )}

          {/* View All link */}
          {!loading && featuredProducts.length > 0 && (
            <div className="text-center mt-8">
              <Button
                variant="ghost"
                onClick={() => navigate('shop', { featured: 'true' })}
                className="text-white/60 hover:text-white text-sm font-medium hover:bg-white/10 rounded-full px-6 py-2 transition-all duration-300"
              >
                View All Featured
                <ArrowRight className="ml-1.5 size-4" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* Section 4: Banner Strip                */}
      {/* ═══════════════════════════════════════ */}
      <section className="bg-black py-6 md:py-8">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="bg-gradient-to-r from-[#FF5722] to-[#FF2D55] rounded-2xl px-6 py-5 md:py-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 text-center sm:text-left shadow-[0_8px_32px_rgba(255,87,34,0.25)]">
            <span className="text-white text-sm md:text-base font-semibold flex items-center gap-2">
              <span className="text-lg">🚚</span>
              Free Shipping on Orders Above ₹999
            </span>
            <span className="hidden sm:inline text-white/40 text-lg">|</span>
            <span className="text-white text-sm md:text-base font-semibold flex items-center gap-2">
              <span className="text-lg">↩️</span>
              30 Days Easy Returns
            </span>
            <span className="hidden sm:inline text-white/40 text-lg">|</span>
            <span className="text-white text-sm md:text-base font-semibold flex items-center gap-2">
              <span className="text-lg">💵</span>
              COD Available
            </span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* Section 5: Trending Now Grid           */}
      {/* ═══════════════════════════════════════ */}
      <section className="bg-black py-16 md:py-24">
        <div className="max-w-[1280px] mx-auto px-4">
          {/* Title */}
          <div className="text-center mb-10 md:mb-14">
            <h2 className="animate-fade-up text-3xl md:text-5xl font-bold text-white tracking-tight mb-3">
              Trending Now
            </h2>
            <p className="animate-fade-up animate-fade-up-delay-1 text-white/50 text-base md:text-lg">
              What&apos;s hot right now
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square rounded-2xl bg-[#1D1D1F]" />
                  <Skeleton className="h-4 w-3/4 bg-[#1D1D1F]" />
                  <Skeleton className="h-5 w-1/2 bg-[#1D1D1F]" />
                </div>
              ))}
            </div>
          ) : trendingProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/40 text-sm">No trending products available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {trendingProducts.map((product, idx) => (
                <div
                  key={product.id}
                  className={`
                    animate-fade-up
                    ${idx >= 2 ? 'animate-fade-up-delay-1' : ''}
                    ${idx >= 4 ? 'animate-fade-up-delay-2' : ''}
                    ${idx >= 6 ? 'animate-fade-up-delay-3' : ''}
                  `}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}

          {/* View All link */}
          {!loading && trendingProducts.length > 0 && (
            <div className="text-center mt-10">
              <Button
                variant="ghost"
                onClick={() => navigate('shop', { sort: 'newest' })}
                className="text-white/60 hover:text-white text-sm font-medium hover:bg-white/10 rounded-full px-6 py-2 transition-all duration-300"
              >
                View All Trending
                <ArrowRight className="ml-1.5 size-4" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* Section 6: Why Choose Us — 3D Floating Cards   */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="bg-gradient-to-b from-black to-[#0A0A0A] py-16 md:py-24">
        <div className="max-w-[1280px] mx-auto px-4">
          {/* Title */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="animate-fade-up text-3xl md:text-5xl font-bold text-white tracking-tight mb-3">
              Why Choose Us
            </h2>
            <p className="animate-fade-up animate-fade-up-delay-1 text-white/50 text-base md:text-lg">
              We make shopping easy and delightful
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {WHY_CHOOSE_US.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className={`
                    animate-fade-up
                    ${idx === 1 ? 'animate-fade-up-delay-1' : ''}
                    ${idx === 2 ? 'animate-fade-up-delay-2' : ''}
                    bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 md:p-8
                    hover:bg-white/10 hover:-translate-y-1
                    transition-all duration-300 text-center
                    hover:shadow-[0_20px_60px_rgba(255,87,34,0.08)]
                  `}
                >
                  {/* Icon with gradient circle */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF5722] to-[#FF2D55] flex items-center justify-center mx-auto mb-5 shadow-[0_8px_24px_rgba(255,87,34,0.3)]">
                    <Icon className="size-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
