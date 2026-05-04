'use client';

import React, { useState, useEffect } from 'react';
import { useNavigation } from '@/stores/navigation';
import { useCart } from '@/stores/cart';
import { useAuth } from '@/stores/auth';
import { toast } from 'sonner';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product } from './SharedTypes';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { navigate } = useNavigation();
  const { addItem } = useCart();
  const { customer, isCustomerLoggedIn } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
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

  const discount = product.wholesale_price && product.wholesale_price > product.price
    ? Math.round(((product.wholesale_price - product.price) / product.wholesale_price) * 100)
    : null;

  const secondImage = product.images[1] || product.images[0] || '';

  return (
    <div
      className="product-card group cursor-pointer bg-white rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300"
      onClick={handleClick}
    >
      {/* Image Section */}
      <div className="relative aspect-square bg-[#F5F7FA] overflow-hidden">
        {/* Loading skeleton */}
        {!imgLoaded && (
          <div className="absolute inset-0 skeleton-shimmer" />
        )}

        {/* First image (always visible) */}
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop'}
          alt={product.name}
          className={cn(
            'product-img absolute inset-0 w-full h-full object-cover',
            imgLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setImgLoaded(true)}
        />

        {/* Second image on hover (desktop only) */}
        {secondImage && (
          <img
            src={secondImage}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />
        )}

        {/* Discount badge */}
        {discount && discount > 0 && (
          <span className="absolute top-3 left-3 z-10 bg-[#28A745] text-white text-[11px] font-bold px-2 py-0.5 rounded-[4px]">
            {discount}% OFF
          </span>
        )}

        {/* Wishlist button */}
        <button
          onClick={toggleWishlist}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={cn(
              'size-4 transition-colors',
              isWishlisted
                ? 'fill-[#DC3545] text-[#DC3545]'
                : 'text-[#5A6B7F] hover:text-[#DC3545]'
            )}
          />
        </button>

        {/* Quick Add button */}
        <div className="quick-actions absolute bottom-3 left-3 right-3 z-10">
          <button
            onClick={handleQuickAdd}
            className="w-full bg-[#0A1B2A] hover:bg-[#142B3E] text-white text-xs font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-lg"
          >
            <ShoppingBag className="size-3.5" />
            Quick Add
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-3">
        {/* Brand / Category */}
        {product.category_name && (
          <p className="text-[11px] text-[#5A6B7F] uppercase tracking-wide font-medium mb-1">
            {product.category_name}
          </p>
        )}

        {/* Product Name */}
        <h3 className="text-sm font-medium text-[#1F2A3A] line-clamp-2 mb-2 leading-snug min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Price Row */}
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <span className="text-base font-bold text-[#1F2A3A]">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {product.wholesale_price && product.wholesale_price > product.price && (
            <>
              <span className="text-sm text-[#5A6B7F] line-through">
                ₹{product.wholesale_price.toLocaleString('en-IN')}
              </span>
              {discount && discount > 0 && (
                <span className="discount-tag text-[10px]">
                  {discount}% off
                </span>
              )}
            </>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-0.5 bg-[#28A745] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-[4px]">
            <Star className="size-2.5 fill-white" />
            <span>4.2</span>
          </div>
          <span className="text-[11px] text-[#5A6B7F]">(1.2k)</span>
        </div>
      </div>
    </div>
  );
}
