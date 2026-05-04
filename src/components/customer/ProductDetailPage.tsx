'use client';

import React, { useState, useEffect } from 'react';
import { useNavigation } from '@/stores/navigation';
import { useCart } from '@/stores/cart';
import { useAuth } from '@/stores/auth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  ChevronLeft,
  Truck,
  RotateCcw,
  ShieldCheck,
  Share2,
  Loader2,
} from 'lucide-react';
import type { Product } from './ProductCard';

const colorMap: Record<string, string> = {
  black: '#111111', white: '#FFFFFF', red: '#EF4444', blue: '#3B82F6',
  green: '#22C55E', yellow: '#EAB308', pink: '#EC4899', purple: '#A855F7',
  orange: '#FF6A00', brown: '#92400E', gray: '#6B7280', navy: '#1E3A5F',
  beige: '#D4C5A9', cream: '#FFFDD0', maroon: '#800000', olive: '#808000',
  teal: '#14B8A6', coral: '#FF7F50', gold: '#FFD700', silver: '#C0C0C0',
};

export default function ProductDetailPage() {
  const { pageParams, goBack } = useNavigation();
  const { addItem } = useCart();
  const { customer, isCustomerLoggedIn } = useAuth();
  const productId = pageParams.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!productId) return;
    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        const found = (data.products || []).find((p: Product) => p.id === productId);
        if (found) {
          setProduct(found);
          if (found.sizes.length > 0) setSelectedSize(found.sizes[0]);
          if (found.colors.length > 0) setSelectedColor(found.colors[0]);
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productId]);

  useEffect(() => {
    if (!isCustomerLoggedIn() || !customer?.id || !productId) return;
    fetch(`/api/wishlist?customer_id=${customer.id}&product_id=${productId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setIsWishlisted(data.length > 0);
      })
      .catch(() => {});
  }, [productId, customer?.id, isCustomerLoggedIn]);

  const toggleWishlist = async () => {
    if (!isCustomerLoggedIn()) {
      toast.error('Please login to add to wishlist');
      navigate('login');
      return;
    }
    try {
      if (isWishlisted) {
        await fetch(`/api/wishlist?customer_id=${customer!.id}&product_id=${productId}`, { method: 'DELETE' });
        setIsWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customer_id: customer!.id, product_id: productId }),
        });
        setIsWishlisted(true);
        toast.success('Added to wishlist');
      }
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const handleAddToCart = async () => {
    if (!isCustomerLoggedIn()) {
      toast.error('Please login to add to cart');
      navigate('login');
      return;
    }
    if (!product) return;
    setAdding(true);
    await new Promise((r) => setTimeout(r, 300));
    addItem({
      id: `${product.id}-${selectedSize}-${selectedColor}`,
      product_id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || '',
      size: selectedSize,
      color: selectedColor,
      quantity,
    });
    toast.success(`${product.name} added to cart`);
    setAdding(false);
  };

  const handleBuyNow = async () => {
    if (!isCustomerLoggedIn()) {
      toast.error('Please login to continue');
      navigate('login');
      return;
    }
    handleAddToCart();
    setTimeout(() => navigate('cart'), 500);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Product not found</h2>
        <p className="text-gray-500 mb-4">The product you&apos;re looking for doesn&apos;t exist.</p>
        <Button onClick={() => goBack()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-8">
      {/* Back button */}
      <button
        onClick={goBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#111] mb-6 transition-colors"
      >
        <ChevronLeft className="size-4" />
        Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
            <img
              src={product.images[selectedImage] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === i
                      ? 'border-[#FF6A00] ring-2 ring-[#FF6A00]/20'
                      : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          {/* Category */}
          {product.category_name && (
            <Badge variant="secondary" className="mb-3 text-xs">
              {product.category_name}
            </Badge>
          )}

          <h1 className="font-[family-name:var(--font-poppins)] text-2xl md:text-3xl font-bold text-[#111] mb-2">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-bold text-[#111]">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.wholesale_price && product.wholesale_price < product.price && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  ₹{product.wholesale_price.toLocaleString('en-IN')}
                </span>
                <Badge className="bg-[#22C55E] text-white text-xs">
                  {Math.round(((product.wholesale_price - product.price) / product.wholesale_price) * 100)}% OFF
                </Badge>
              </>
            )}
          </div>

          <Separator className="my-4" />

          {/* Description */}
          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            {product.description || 'No description available for this product.'}
          </p>

          {/* Size selector */}
          {product.sizes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-[#111] mb-3">
                Size: <span className="font-normal text-gray-500">{selectedSize}</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[44px] h-10 px-3 rounded-xl text-sm font-medium border transition-all ${
                      selectedSize === size
                        ? 'bg-[#111] text-white border-[#111]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#111]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color selector */}
          {product.colors.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-[#111] mb-3">
                Color: <span className="font-normal text-gray-500">{selectedColor}</span>
              </h3>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    title={color}
                    className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                      selectedColor === color
                        ? 'border-[#FF6A00] scale-110 ring-2 ring-[#FF6A00]/30'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                    style={{
                      backgroundColor: colorMap[color.toLowerCase()] || color,
                    }}
                  >
                    {selectedColor === color && (
                      <div className="w-3 h-3 rounded-full bg-white/80" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[#111] mb-3">Quantity</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <Minus className="size-4" />
              </button>
              <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <Plus className="size-4" />
              </button>
              {product.stock > 0 && product.stock <= 5 && (
                <span className="text-xs text-[#FF6A00] font-medium">
                  Only {product.stock} left!
                </span>
              )}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Button
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              className="flex-1 h-12 bg-[#111] hover:bg-[#111]/90 text-white rounded-xl text-sm font-semibold"
            >
              {adding ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <ShoppingCart className="size-4 mr-2" />
              )}
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
            <Button
              onClick={handleBuyNow}
              disabled={adding || product.stock === 0}
              variant="outline"
              className="flex-1 h-12 border-[#FF6A00] text-[#FF6A00] hover:bg-[#FF6A00] hover:text-white rounded-xl text-sm font-semibold"
            >
              Buy Now
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleWishlist}
              className="h-12 w-12 rounded-xl shrink-0"
            >
              <Heart
                className={`size-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`}
              />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-xl shrink-0 hidden sm:flex"
            >
              <Share2 className="size-5" />
            </Button>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-xl bg-gray-50">
              <Truck className="size-4 mx-auto text-[#FF6A00] mb-1" />
              <p className="text-[11px] text-gray-600">Free Shipping</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-gray-50">
              <RotateCcw className="size-4 mx-auto text-[#FF6A00] mb-1" />
              <p className="text-[11px] text-gray-600">Easy Returns</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-gray-50">
              <ShieldCheck className="size-4 mx-auto text-[#FF6A00] mb-1" />
              <p className="text-[11px] text-gray-600">Secure Pay</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


