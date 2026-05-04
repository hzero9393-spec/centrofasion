'use client';

import React, { useState, useEffect } from 'react';
import { useNavigation } from '@/stores/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Truck, Headphones, RotateCcw, ShieldCheck, ChevronRight, Star } from 'lucide-react';
import ProductCard, { type Product } from './ProductCard';

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  product_count: number;
}

export default function HomePage() {
  const { navigate } = useNavigation();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch('/api/products?featured=true&limit=8'),
          fetch('/api/categories'),
        ]);
        const prodData = await prodRes.json();
        const catData = await catRes.json();
        setProducts(prodData.products || []);
        setCategories(catData || []);
      } catch (err) {
        console.error('Failed to fetch home data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const features = [
    { icon: Truck, title: 'Free Shipping', desc: 'On orders above ₹999' },
    { icon: Headphones, title: '24/7 Support', desc: 'Dedicated support' },
    { icon: RotateCcw, title: 'Easy Returns', desc: '7-day return policy' },
    { icon: ShieldCheck, title: 'Secure Payment', desc: '100% protected' },
  ];

  return (
    <div className="pb-20 md:pb-0">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#111] via-[#1a1a1a] to-[#2d2d2d] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF6A00] rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#FF6A00] rounded-full blur-[100px] opacity-50" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 lg:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              <Star className="size-3 text-[#FF6A00] fill-[#FF6A00]" />
              New Collection 2024
            </div>
            <h1 className="font-[family-name:var(--font-poppins)] text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
              New Season
              <br />
              <span className="text-[#FF6A00]">Collection</span>
            </h1>
            <p className="text-gray-400 text-base md:text-lg mb-8 max-w-md leading-relaxed">
              Discover the latest trends in fashion. Premium quality clothing
              designed for the modern you.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => navigate('shop')}
                className="bg-[#FF6A00] hover:bg-[#FF6A00]/90 text-white h-12 px-8 rounded-xl text-sm font-semibold transition-all hover:scale-[0.98]"
              >
                Shop Now
                <ChevronRight className="size-4 ml-1" />
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('shop', { category: 'women' })}
                className="border-white/20 text-white bg-white/5 hover:bg-white/10 h-12 px-8 rounded-xl text-sm font-semibold"
              >
                Explore Women&apos;s
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-border/50 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-[#FF6A00]/10 flex items-center justify-center shrink-0">
                <f.icon className="size-5 text-[#FF6A00]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{f.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-[family-name:var(--font-poppins)] text-xl md:text-2xl font-bold text-[#111]">
              Shop by Category
            </h2>
            <p className="text-sm text-gray-500 mt-1">Find what you&apos;re looking for</p>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate('shop')}
            className="text-[#FF6A00] text-sm font-medium"
          >
            View All <ChevronRight className="size-4 ml-1" />
          </Button>
        </div>

        {loading ? (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="shrink-0 w-40 h-52 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigate('shop', { category: cat.slug })}
                className="shrink-0 w-36 md:w-44 group"
              >
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 mb-3">
                  <img
                    src={
                      cat.image ||
                      `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=400&fit=crop`
                    }
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white text-sm font-semibold">{cat.name}</p>
                    <p className="text-white/70 text-xs mt-0.5">
                      {cat.product_count} items
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-[family-name:var(--font-poppins)] text-xl md:text-2xl font-bold text-[#111]">
              Featured Products
            </h2>
            <p className="text-sm text-gray-500 mt-1">Handpicked for you</p>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate('shop', { sort: 'newest' })}
            className="text-[#FF6A00] text-sm font-medium"
          >
            View All <ChevronRight className="size-4 ml-1" />
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-square rounded-xl mb-3" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No featured products available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="bg-gradient-to-r from-[#111] to-[#333] rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="font-[family-name:var(--font-poppins)] text-2xl md:text-3xl font-bold text-white mb-2">
              Get 20% Off Your First Order
            </h3>
            <p className="text-gray-400 text-sm">
              Sign up today and receive an exclusive discount code.
            </p>
          </div>
          <Button
            onClick={() => navigate('signup')}
            className="bg-[#FF6A00] hover:bg-[#FF6A00]/90 text-white h-12 px-8 rounded-xl text-sm font-semibold shrink-0"
          >
            Sign Up Now
          </Button>
        </div>
      </section>
    </div>
  );
}
