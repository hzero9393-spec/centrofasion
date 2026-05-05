'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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

  // 3D tilt state
  const cardRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (!isCustomerLoggedIn() || !customer?.id) return;
    fetch(`/api/wishlist?customer_id=${customer.id}&product_id=${product.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setIsWishlisted(data.length > 0);
      })
      .catch(() => {});
  }, [product.id, customer?.id, isCustomerLoggedIn]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation — clamped to a subtle range for elegance
    const maxRotation = 8;
    const rotateX = ((y - centerY) / centerY) * -maxRotation;
    const rotateY = ((x - centerX) / centerX) * maxRotation;

    // Calculate a subtle glare position for the shine overlay
    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      transformStyle: 'preserve-3d',
    });

    // Update glare overlay position
    const glare = cardRef.current.querySelector('[data-glare]');
    if (glare) {
      (glare as HTMLElement).style.background = `radial-gradient(circle at ${percentX}% ${percentY}%, rgba(255,255,255,0.12) 0%, transparent 60%)`;
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transformStyle: 'preserve-3d',
    });
    const glare = cardRef.current?.querySelector('[data-glare]');
    if (glare) {
      (glare as HTMLElement).style.background = 'transparent';
    }
  }, []);

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

  const discount =
    product.wholesale_price && product.wholesale_price > product.price
      ? Math.round(((product.wholesale_price - product.price) / product.wholesale_price) * 100)
      : null;

  const secondImage = product.images[1] || product.images[0] || '';

  return (
    <div className="group" style={{ perspective: '1000px' }}>
      <div
        ref={cardRef}
        className={cn(
          'relative cursor-pointer rounded-2xl overflow-hidden',
          'bg-[#1D1D1F] border border-white/5 hover:border-white/10',
          'transition-[box-shadow,border-color] duration-500 cubic-bezier(0.4, 0, 0.2, 1)',
          'hover:-translate-y-2',
          'hover:shadow-[0_20px_60px_rgba(255,87,34,0.2)]'
        )}
        style={tiltStyle}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Glare overlay for glass-like shine */}
        <div
          data-glare
          className="pointer-events-none absolute inset-0 z-20 rounded-2xl transition-opacity duration-500"
          style={{ opacity: isHovering ? 1 : 0 }}
        />

        {/* Image Section */}
        <div className="relative aspect-square bg-[#0A0A0A] overflow-hidden">
          {/* Loading skeleton */}
          {!imgLoaded && (
            <div className="absolute inset-0 animate-pulse bg-white/5" />
          )}

          {/* First image */}
          <img
            src={
              product.images[0] ||
              'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop'
            }
            alt={product.name}
            className={cn(
              'absolute inset-0 w-full h-full object-cover',
              'transition-all duration-700 group-hover:scale-110',
              imgLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => setImgLoaded(true)}
          />

          {/* Second image on hover */}
          {secondImage && (
            <img
              src={secondImage}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
          )}

          {/* Discount badge */}
          {discount && discount > 0 && (
            <span className="absolute top-3 left-3 z-10 bg-gradient-to-r from-[#FF5722] to-[#FF2D55] text-white rounded-full text-[10px] font-bold px-2.5 py-0.5 shadow-lg shadow-orange-500/20">
              {discount}% OFF
            </span>
          )}

          {/* Wishlist button */}
          <button
            onClick={toggleWishlist}
            className={cn(
              'absolute top-3 right-3 z-10 w-9 h-9 rounded-full',
              'bg-black/50 backdrop-blur-md',
              'flex items-center justify-center',
              'hover:scale-110 active:scale-95',
              'transition-all duration-200'
            )}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              className={cn(
                'size-4 transition-colors duration-200',
                isWishlisted
                  ? 'fill-[#FF2D55] text-[#FF2D55]'
                  : 'text-white/70 hover:text-[#FF2D55]'
              )}
            />
          </button>

          {/* Quick Add button — slides up on hover */}
          <div className="absolute bottom-0 left-0 right-0 z-10 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
            <button
              onClick={handleQuickAdd}
              className={cn(
                'w-full bg-gradient-to-r from-[#FF5722] to-[#FF2D55]',
                'text-white rounded-xl py-2.5',
                'text-xs font-semibold',
                'hover:opacity-90 active:opacity-80',
                'transition-opacity duration-200',
                'flex items-center justify-center gap-1.5',
                'shadow-lg shadow-orange-500/30',
                'backdrop-blur-sm'
              )}
            >
              <ShoppingBag className="size-3.5" />
              Quick Add
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="p-4">
          {/* Brand / Category */}
          {product.category_name && (
            <p className="text-[11px] text-white/40 uppercase tracking-wider font-medium mb-1.5">
              {product.category_name}
            </p>
          )}

          {/* Product Name */}
          <h3 className="text-sm font-medium text-[#F5F5F7] line-clamp-2 mb-2 leading-snug min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Price Row */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="text-base font-bold text-white">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.wholesale_price && product.wholesale_price > product.price && (
              <>
                <span className="text-sm text-white/40 line-through">
                  ₹{product.wholesale_price.toLocaleString('en-IN')}
                </span>
                {discount && discount > 0 && (
                  <span className="text-[10px] font-semibold text-[#FF5722]">
                    {discount}% off
                  </span>
                )}
              </>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5 bg-white/10 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              <Star className="size-2.5 fill-white text-white" />
              <span>4.2</span>
            </div>
            <span className="text-[11px] text-white/40">(1.2k)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
