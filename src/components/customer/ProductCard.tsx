'use client';

import React, { useState, useEffect } from 'react';
import { useNavigation } from '@/stores/navigation';
import { useCart } from '@/stores/cart';
import { useAuth } from '@/stores/auth';
import { toast } from 'sonner';
import { Heart, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  wholesale_price: number | null;
  stock: number;
  sizes: string[];
  colors: string[];
  images: string[];
  category_id: string;
  category_name: string;
  featured: boolean;
  created_at?: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { navigate } = useNavigation();
  const { addItem } = useCart();
  const { customer, isCustomerLoggedIn } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    if (!isCustomerLoggedIn() || !customer?.id) return;
    fetch(`/api/wishlist?customer_id=${customer.id}&product_id=${product.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setIsWishlisted(data.length > 0);
      })
      .catch(() => {});
  }, [product.id, customer?.id, isCustomerLoggedIn]);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isCustomerLoggedIn()) {
      toast.error('Please login to add to wishlist');
      navigate('login');
      return;
    }
    try {
      if (isWishlisted) {
        await fetch(
          `/api/wishlist?customer_id=${customer!.id}&product_id=${product.id}`,
          { method: 'DELETE' }
        );
        setIsWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customer_id: customer!.id, product_id: product.id }),
        });
        setIsWishlisted(true);
        toast.success('Added to wishlist');
      }
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isCustomerLoggedIn()) {
      toast.error('Please login to add to cart');
      navigate('login');
      return;
    }
    addItem({
      id: `${product.id}-${product.sizes[0] || 'OS'}-${product.colors[0] || 'Default'}`,
      product_id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || '',
      size: product.sizes[0] || 'OS',
      color: product.colors[0] || 'Default',
      quantity: 1,
    });
    toast.success(`${product.name} added to cart`);
  };

  const handleClick = () => {
    navigate('product', { id: product.id });
  };

  const colorMap: Record<string, string> = {
    black: '#111111',
    white: '#FFFFFF',
    red: '#EF4444',
    blue: '#3B82F6',
    green: '#22C55E',
    yellow: '#EAB308',
    pink: '#EC4899',
    purple: '#A855F7',
    orange: '#FF6A00',
    brown: '#92400E',
    gray: '#6B7280',
    navy: '#1E3A5F',
    beige: '#D4C5A9',
    cream: '#FFFDD0',
    maroon: '#800000',
    olive: '#808000',
    teal: '#14B8A6',
    coral: '#FF7F50',
    gold: '#FFD700',
    silver: '#C0C0C0',
  };

  return (
    <div
      className="product-card group cursor-pointer bg-white rounded-xl overflow-hidden shadow-sm border border-border/50"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {!imgLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop'}
          alt={product.name}
          className={cn(
            'product-image w-full h-full object-cover transition-transform duration-500',
            imgLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setImgLoaded(true)}
        />

        {/* Wishlist button */}
        <button
          onClick={toggleWishlist}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm transition-all hover:scale-110"
        >
          <Heart
            className={cn(
              'size-4 transition-colors',
              isWishlisted
                ? 'fill-red-500 text-red-500'
                : 'text-gray-600'
            )}
          />
        </button>

        {/* Category tag */}
        {product.category_name && (
          <span className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm text-[10px] font-semibold uppercase tracking-wider text-gray-700 px-2.5 py-1 rounded-full">
            {product.category_name}
          </span>
        )}

        {/* Quick Add button */}
        <div
          className={cn(
            'absolute bottom-3 left-3 right-3 z-10 transition-all duration-300',
            isHovered
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2 pointer-events-none'
          )}
        >
          <button
            onClick={handleQuickAdd}
            className="w-full bg-[#111] hover:bg-[#FF6A00] text-white text-sm font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag className="size-4" />
            Quick Add
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-1 mb-1">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base font-bold text-[#111]">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {product.wholesale_price && product.wholesale_price < product.price && (
            <span className="text-xs text-gray-400 line-through">
              ₹{product.wholesale_price.toLocaleString('en-IN')}
            </span>
          )}
        </div>
        {product.colors.length > 0 && (
          <div className="flex items-center gap-1">
            {product.colors.slice(0, 4).map((color) => (
              <span
                key={color}
                className="w-3.5 h-3.5 rounded-full border border-gray-200"
                style={{
                  backgroundColor: colorMap[color.toLowerCase()] || color,
                }}
                title={color}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-[10px] text-gray-400 ml-1">
                +{product.colors.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
