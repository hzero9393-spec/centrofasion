'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigation } from '@/stores/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, Truck, ShieldCheck, Headphones, Star } from 'lucide-react';
import ProductCard from './ProductCard';
import type { Product, Category } from './SharedTypes';

const HERO_SLIDES = [
  {
    id: 1,
    subtitle: 'Summer Collection 2024',
    title: 'Discover Your Perfect Style',
    description: 'Explore the latest trends in fashion with our curated summer collection.',
    cta: 'Shop Now',
    ctaAction: 'shop' as const,
    gradient: 'from-[#0A1B2A] via-[#142B3E] to-[#1A2942]',
    accent: 'Summer',
  },
  {
    id: 2,
    subtitle: 'Limited Time Offer',
    title: 'Flat 50% Off',
    description: 'Grab your favorite outfits at half the price. Hurry, offer ends soon!',
    cta: 'Shop Sale',
    ctaAction: 'shop' as const,
    ctaParams: { sort: 'price-low' },
    gradient: 'from-[#1A0A00] via-[#2D1400] to-[#3D1F0A]',
    accent: '50% OFF',
  },
  {
    id: 3,
    subtitle: 'Just Landed',
    title: 'New Arrivals',
    description: 'Be the first to shop the newest additions to our collection.',
    cta: 'Explore',
    ctaAction: 'shop' as const,
    ctaParams: { sort: 'newest' },
    gradient: 'from-[#0A1B2A] via-[#0F2438] to-[#1A2942]',
    accent: 'NEW',
  },
];

export default function HomePage() {
  const { navigate } = useNavigation();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play carousel
  const startCarousel = useCallback(() => {
    if (carouselTimerRef.current) clearInterval(carouselTimerRef.current);
    carouselTimerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
  }, []);

  useEffect(() => {
    startCarousel();
    return () => {
      if (carouselTimerRef.current) clearInterval(carouselTimerRef.current);
    };
  }, [startCarousel]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    startCarousel();
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
    startCarousel();
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    startCarousel();
  };

  // Fetch data
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
        setFeaturedProducts(featuredData.products || []);
        setTrendingProducts(trendingData.products || []);
        setCategories(catData || []);
      } catch (err) {
        console.error('Failed to fetch home data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const whyChooseUs = [
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

  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 280;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="pb-20 md:pb-0">
      {/* ============================== */}
      {/* Section 1: Hero Carousel       */}
      {/* ============================== */}
      <section className="relative overflow-hidden">
        <div
          className="relative transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          <div className="flex">
            {HERO_SLIDES.map((slide) => (
              <div
                key={slide.id}
                className={`w-full shrink-0 bg-gradient-to-br ${slide.gradient} relative`}
              >
                {/* Decorative blobs */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-10 right-[10%] w-[400px] h-[400px] bg-[#FF5722]/10 rounded-full blur-[100px]" />
                  <div className="absolute bottom-0 left-[5%] w-[300px] h-[300px] bg-[#FF5722]/5 rounded-full blur-[80px]" />
                </div>

                <div className="relative max-w-[1280px] mx-auto px-4 py-14 md:py-20 lg:py-28">
                  <div className="max-w-xl">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 text-xs font-semibold uppercase tracking-wider px-4 py-1.5 rounded-full mb-5">
                      <Star className="size-3 text-[#FF5722] fill-[#FF5722]" />
                      {slide.subtitle}
                    </div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                      {slide.title.split(' ').map((word, i, arr) => (
                        <React.Fragment key={i}>
                          {word === slide.accent ? (
                            <span className="text-[#FF5722]">{word}</span>
                          ) : (
                            word
                          )}
                          {i < arr.length - 1 && ' '}
                        </React.Fragment>
                      ))}
                    </h1>
                    <p className="text-white/60 text-sm md:text-base mb-7 max-w-md leading-relaxed">
                      {slide.description}
                    </p>
                    <Button
                      onClick={() => navigate(slide.ctaAction, (slide as any).ctaParams || {})}
                      className="bg-[#FF5722] hover:bg-[#E64A19] text-white h-12 px-8 rounded-lg text-sm font-semibold btn-scale"
                    >
                      {slide.cta}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all z-10"
          aria-label="Previous slide"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all z-10"
          aria-label="Next slide"
        >
          <ChevronRight className="size-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`carousel-dot ${idx === currentSlide ? 'active' : ''}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ================================= */}
      {/* Section 2: Category Grid          */}
      {/* ================================= */}
      <section className="max-w-[1280px] mx-auto px-4 py-10 md:py-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#1F2A3A]">
              Shop by Category
            </h2>
            <p className="text-sm text-[#5A6B7F] mt-1">Browse our curated collections</p>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate('shop')}
            className="text-[#FF5722] text-sm font-semibold hover:text-[#E64A19]"
          >
            View All
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2.5">
                <Skeleton className="aspect-square rounded-xl" />
                <Skeleton className="h-4 w-16 mx-auto" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {categories.slice(0, 8).map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigate('shop', { category: cat.slug })}
                className="group text-center"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-[#F5F7FA] mb-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-shadow duration-300">
                  <img
                    src={
                      cat.image ||
                      `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=300&fit=crop`
                    }
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <p className="text-sm font-semibold text-[#1F2A3A] group-hover:text-[#FF5722] transition-colors">
                  {cat.name}
                </p>
                <p className="text-xs text-[#5A6B7F] mt-0.5">
                  {cat.product_count} items
                </p>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ======================================== */}
      {/* Section 3: Featured Products Carousel    */}
      {/* ======================================== */}
      <section className="max-w-[1280px] mx-auto px-4 py-6 md:py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#1F2A3A]">
              Handpicked For You
            </h2>
            <p className="text-sm text-[#5A6B7F] mt-1">Our editors&apos; top picks</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scrollCarousel('left')}
              className="h-9 w-9 rounded-full border border-[#E4E7EC] hover:bg-[#F5F7FA]"
            >
              <ChevronLeft className="size-4 text-[#1F2A3A]" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scrollCarousel('right')}
              className="h-9 w-9 rounded-full border border-[#E4E7EC] hover:bg-[#F5F7FA]"
            >
              <ChevronRight className="size-4 text-[#1F2A3A]" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('shop', { featured: 'true' })}
              className="text-[#FF5722] text-sm font-semibold hover:text-[#E64A19]"
            >
              View All
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="shrink-0 w-[220px] md:w-[260px]">
                <Skeleton className="aspect-square rounded-xl mb-3" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            ))}
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#5A6B7F] text-sm">No featured products available yet.</p>
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {featuredProducts.map((product) => (
              <div key={product.id} className="shrink-0 w-[170px] sm:w-[200px] md:w-[240px] snap-start">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ============================== */}
      {/* Section 4: Banner Strip        */}
      {/* ============================== */}
      <section className="max-w-[1280px] mx-auto px-4 py-4">
        <div className="bg-gradient-to-r from-[#FF5722] to-[#DC3545] rounded-xl px-6 py-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-center sm:text-left">
          <span className="text-white text-sm font-medium">
            🚚 Free Shipping on Orders Above ₹999
          </span>
          <span className="hidden sm:inline text-white/50">|</span>
          <span className="text-white text-sm font-medium">
            ↩️ 30 Days Easy Returns
          </span>
          <span className="hidden sm:inline text-white/50">|</span>
          <span className="text-white text-sm font-medium">
            💵 COD Available
          </span>
        </div>
      </section>

      {/* ================================ */}
      {/* Section 5: Trending Now Grid     */}
      {/* ================================ */}
      <section className="max-w-[1280px] mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#1F2A3A]">
              Trending Now
            </h2>
            <p className="text-sm text-[#5A6B7F] mt-1">What&apos;s hot right now</p>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate('shop', { sort: 'newest' })}
            className="text-[#FF5722] text-sm font-semibold hover:text-[#E64A19]"
          >
            View All
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-square rounded-xl mb-3" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            ))}
          </div>
        ) : trendingProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#5A6B7F] text-sm">No trending products available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {trendingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* ================================== */}
      {/* Section 6: Why Choose Us            */}
      {/* ================================== */}
      <section className="max-w-[1280px] mx-auto px-4 py-10 md:py-14">
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-[#1F2A3A]">
            Why Choose Us
          </h2>
          <p className="text-sm text-[#5A6B7F] mt-1">We make shopping easy and delightful</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {whyChooseUs.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-shadow duration-300 text-center"
              >
                <div className="w-14 h-14 rounded-full bg-[#FF5722]/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="size-6 text-[#FF5722]" />
                </div>
                <h3 className="text-base font-semibold text-[#1F2A3A] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-[#5A6B7F] leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
