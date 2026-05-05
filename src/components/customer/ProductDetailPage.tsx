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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  Truck,
  RotateCcw,
  ShieldCheck,
  Share2,
  Loader2,
  X,
  Star,
  Tag,
  MapPin,
  CheckCircle,
} from 'lucide-react';
import type { Product } from './SharedTypes';

const colorMap: Record<string, string> = {
  black: '#000000', white: '#FFFFFF', red: '#DC3545', blue: '#3B82F6',
  green: '#28A745', yellow: '#FFC107', pink: '#EC4899', purple: '#9C27B0',
  orange: '#FF5722', brown: '#92400E', gray: '#6B7280', navy: '#0A1B2A',
  beige: '#D4C5A9', cream: '#FFFDD0', maroon: '#800000', olive: '#808000',
  teal: '#14B8A6', coral: '#FF7F50', gold: '#FFD700', silver: '#C0C0C0',
};

const BANK_OFFERS = [
  '10% off on SBI Credit Cards, up to ₹1,500',
  '5% Cashback on Flipkart Axis Bank Card',
  'No Cost EMI on orders above ₹3,000',
  'Buy for ₹2,999 get 20% off on next order',
];

const SIZE_CHART = [
  { size: 'S', chest: '36', waist: '30', length: '27', shoulder: '16' },
  { size: 'M', chest: '38', waist: '32', length: '28', shoulder: '17' },
  { size: 'L', chest: '40', waist: '34', length: '29', shoulder: '18' },
  { size: 'XL', chest: '42', waist: '36', length: '30', shoulder: '19' },
  { size: 'XXL', chest: '44', waist: '38', length: '31', shoulder: '20' },
];

export default function ProductDetailPage() {
  const { pageParams, goBack, navigate } = useNavigation();
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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [pincode, setPincode] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');

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
      .then((data) => { if (Array.isArray(data)) setIsWishlisted(data.length > 0); })
      .catch(() => {});
  }, [productId, customer?.id, isCustomerLoggedIn]);

  const toggleWishlist = async () => {
    if (!isCustomerLoggedIn()) { toast.error('Please login to add to wishlist'); navigate('login'); return; }
    try {
      if (isWishlisted) {
        await fetch(`/api/wishlist?customer_id=${customer!.id}&product_id=${productId}`, { method: 'DELETE' });
        setIsWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await fetch('/api/wishlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer_id: customer!.id, product_id: productId }) });
        setIsWishlisted(true);
        toast.success('Added to wishlist');
      }
    } catch { toast.error('Failed to update wishlist'); }
  };

  const handleAddToCart = async () => {
    if (!isCustomerLoggedIn()) { toast.error('Please login to add to cart'); navigate('login'); return; }
    if (!product) return;
    if (!selectedSize) { toast.error('Please select a size'); return; }
    setAdding(true);
    await new Promise((r) => setTimeout(r, 300));
    addItem({ id: `${product.id}-${selectedSize}-${selectedColor}`, product_id: product.id, name: product.name, price: product.price, image: product.images[0] || '', size: selectedSize, color: selectedColor, quantity });
    toast.success(`${product.name} added to cart`);
    setAdding(false);
  };

  const handleBuyNow = async () => {
    if (!isCustomerLoggedIn()) { toast.error('Please login to continue'); navigate('login'); return; }
    if (!selectedSize) { toast.error('Please select a size'); return; }
    await handleAddToCart();
    setTimeout(() => navigate('checkout'), 500);
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleCheckPincode = () => {
    if (pincode.length !== 6) { toast.error('Enter a valid 6-digit pincode'); return; }
    const days = Math.floor(Math.random() * 3) + 3;
    const date = new Date();
    date.setDate(date.getDate() + days);
    setDeliveryDate(date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }));
    toast.success('Delivery available!');
  };

  const getDiscount = () => {
    if (!product?.wholesale_price || product.wholesale_price <= product.price) return 0;
    return Math.round(((product.wholesale_price - product.price) / product.wholesale_price) * 100);
  };

  const navigateLightbox = (dir: 'prev' | 'next') => {
    if (!product) return;
    if (dir === 'prev') setSelectedImage((p) => (p - 1 + product.images.length) % product.images.length);
    else setSelectedImage((p) => (p + 1) % product.images.length);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center gap-2 mb-6"><Skeleton className="h-5 w-48" /></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <Skeleton className="aspect-square rounded-xl" />
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
        <h2 className="text-xl font-bold text-cf-text mb-2">Product not found</h2>
        <p className="text-[#5A6B7F] mb-4">The product you&apos;re looking for doesn&apos;t exist.</p>
        <Button onClick={() => goBack()}>Go Back</Button>
      </div>
    );
  }

  const discount = getDiscount();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[#5A6B7F] mb-6 flex-wrap">
        <button onClick={() => navigate('home')} className="hover:text-cf-text transition-colors">Home</button>
        <span>/</span>
        <button
          onClick={() => navigate('shop', { category: product.category_slug || '' })}
          className="hover:text-cf-text transition-colors"
        >
          {product.category_name || 'Category'}
        </button>
        <span>/</span>
        <span className="text-cf-text font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left column - Images */}
        <div className="space-y-4">
          {/* Main image */}
          <div
            className="aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-zoom-in relative"
            onClick={() => setLightboxOpen(true)}
          >
            <img
              src={product.images[selectedImage] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discount > 0 && (
              <div className="absolute top-4 left-4 discount-tag text-sm px-3 py-1">{discount}% off</div>
            )}
          </div>

          {/* Thumbnail strip */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === i ? 'border-[#FF5722] ring-2 ring-[#FF5722]/20' : 'border-[#E4E7EC]'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Share button */}
          <button onClick={handleShare} className="flex items-center gap-2 text-sm text-[#5A6B7F] hover:text-cf-text transition-colors">
            <Share2 className="size-4" />
            Share this product
          </button>
        </div>

        {/* Right column - Details */}
        <div className="space-y-5">
          {/* Product name */}
          <h1 className="text-2xl lg:text-3xl font-bold text-cf-text leading-tight">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-[#28A745] text-white px-2.5 py-0.5 rounded-md text-sm font-semibold">
              4.2 <Star className="size-3.5 fill-white" />
            </div>
            <span className="text-sm text-[#5A6B7F]">1,234 ratings</span>
            <span className="text-sm text-[#28A745] font-medium">5K+ sold</span>
          </div>

          {/* Price */}
          <div className="flex items-end gap-3 flex-wrap">
            <span className="text-3xl font-bold text-cf-text">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.wholesale_price && product.wholesale_price > product.price && (
              <>
                <span className="text-lg text-[#5A6B7F] line-through">
                  ₹{product.wholesale_price.toLocaleString('en-IN')}
                </span>
                <span className="discount-tag text-sm px-3 py-1">{discount}% off</span>
              </>
            )}
          </div>
          <p className="text-xs text-[#5A6B7F]">Inclusive of all taxes</p>

          <Separator />

          {/* Size selector */}
          {product.sizes.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-bold text-cf-text">Select Size</Label>
                <button className="text-sm text-[#FF5722] font-medium hover:underline">Size Chart</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[52px] h-10 px-4 rounded-lg text-sm font-medium border-2 transition-all ${
                      selectedSize === size
                        ? 'bg-[#FF5722] text-white border-[#FF5722]'
                        : 'bg-white text-cf-text border-[#E4E7EC] hover:border-[#5A6B7F]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colour selector */}
          {product.colors.length > 0 && (
            <div>
              <Label className="text-sm font-bold text-cf-text mb-3 block">Select Colour</Label>
              <div className="flex flex-wrap gap-3 items-center">
                {product.colors.map((color) => (
                  <div key={color} className="flex flex-col items-center gap-1.5">
                    <button
                      onClick={() => setSelectedColor(color)}
                      title={color}
                      className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                        selectedColor === color
                          ? 'ring-2 ring-[#FF5722] ring-offset-2 border-[#FF5722]'
                          : 'border-[#E4E7EC] hover:border-[#5A6B7F]'
                      } ${color.toLowerCase() === 'white' ? 'shadow-sm' : ''}`}
                      style={{ backgroundColor: colorMap[color.toLowerCase()] || color }}
                    >
                      {selectedColor === color && <div className="w-2.5 h-2.5 rounded-full bg-white/80" />}
                    </button>
                    <span className="text-[10px] text-[#5A6B7F] max-w-[50px] truncate">{color}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <Label className="text-sm font-bold text-cf-text mb-3 block">Quantity</Label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-[#E4E7EC] rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors text-cf-text"
                >
                  <Minus className="size-4" />
                </button>
                <span className="text-sm font-semibold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors text-cf-text"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              {product.stock > 0 && product.stock <= 5 && (
                <span className="text-xs text-[#FF5722] font-medium">Only {product.stock} left!</span>
              )}
            </div>
          </div>

          <Separator />

          {/* Bank Offers */}
          <div className="bg-[#FFF8F5] rounded-xl p-4 border border-[#FFE0D6]">
            <h4 className="flex items-center gap-2 text-sm font-bold text-cf-text mb-3">
              <Tag className="size-4 text-[#FF5722]" />
              Bank Offers
            </h4>
            <div className="space-y-2">
              {BANK_OFFERS.map((offer, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Tag className="size-3.5 text-[#28A745] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#5A6B7F] leading-relaxed">{offer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              className="w-full h-12 bg-[#FF5722] hover:bg-[#E64A19] text-white rounded-lg text-sm font-bold btn-scale"
            >
              {adding ? <Loader2 className="size-4 animate-spin mr-2" /> : <ShoppingCart className="size-4 mr-2" />}
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
            <Button
              onClick={handleBuyNow}
              disabled={adding || product.stock === 0}
              variant="outline"
              className="w-full h-12 border-2 border-[#FF5722] text-[#FF5722] hover:bg-[#FF5722] hover:text-white rounded-lg text-sm font-bold transition-colors btn-scale"
            >
              Buy Now
            </Button>
            <button
              onClick={toggleWishlist}
              className="flex items-center justify-center gap-2 text-sm text-[#5A6B7F] hover:text-[#FF5722] transition-colors py-2"
            >
              <Heart className={`size-4 ${isWishlisted ? 'fill-[#DC3545] text-[#DC3545]' : ''}`} />
              {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button>
          </div>

          {/* Delivery check */}
          <div className="bg-white rounded-xl p-4 border border-[#E4E7EC]">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="size-4 text-[#FF5722]" />
              <span className="text-sm font-bold text-cf-text">Delivery Check</span>
            </div>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter Pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="h-10 rounded-lg text-sm max-w-[160px]"
                maxLength={6}
              />
              <Button variant="outline" onClick={handleCheckPincode} className="h-10 rounded-lg border-[#FF5722] text-[#FF5722] text-sm font-medium">
                Check
              </Button>
            </div>
            {deliveryDate && (
              <div className="flex items-center gap-2 mt-3 text-sm">
                <Truck className="size-4 text-[#28A745]" />
                <span className="text-[#28A745] font-medium">Delivery by {deliveryDate}</span>
              </div>
            )}
          </div>

          {/* Benefits row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg bg-[#F5F7FA]">
              <Truck className="size-5 mx-auto text-[#FF5722] mb-1.5" />
              <p className="text-[11px] text-[#5A6B7F] font-medium">Free Shipping</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-[#F5F7FA]">
              <RotateCcw className="size-5 mx-auto text-[#FF5722] mb-1.5" />
              <p className="text-[11px] text-[#5A6B7F] font-medium">Easy Returns</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-[#F5F7FA]">
              <ShieldCheck className="size-5 mx-auto text-[#FF5722] mb-1.5" />
              <p className="text-[11px] text-[#5A6B7F] font-medium">Secure Pay</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8">
        <Tabs defaultValue="details">
          <TabsList className="w-full justify-start border-b border-[#E4E7EC] bg-transparent rounded-none h-auto p-0">
            <TabsTrigger
              value="details"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF5722] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-sm font-semibold text-[#5A6B7F] data-[state=active]:text-[#FF5722]"
            >
              Product Details
            </TabsTrigger>
            <TabsTrigger
              value="sizechart"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF5722] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-sm font-semibold text-[#5A6B7F] data-[state=active]:text-[#FF5722]"
            >
              Size Chart
            </TabsTrigger>
            <TabsTrigger
              value="returns"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF5722] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-sm font-semibold text-[#5A6B7F] data-[state=active]:text-[#FF5722]"
            >
              Return Policy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6">
            <div className="bg-white rounded-xl border border-[#E4E7EC] p-6">
              <h3 className="font-bold text-cf-text mb-3">Product Description</h3>
              <p className="text-sm text-[#5A6B7F] leading-relaxed whitespace-pre-line">
                {product.description || 'This premium quality product from ClothFasion is crafted with the finest materials for comfort and style. Perfect for everyday wear, this versatile piece can be dressed up or down for any occasion.\n\nKey Features:\n• Premium fabric quality\n• Comfortable fit\n• Durable stitching\n• Machine washable\n• Available in multiple sizes and colors'}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="sizechart" className="mt-6">
            <div className="bg-white rounded-xl border border-[#E4E7EC] p-6 overflow-x-auto">
              <h3 className="font-bold text-cf-text mb-4">Size Chart (in inches)</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E4E7EC]">
                    <th className="text-left py-3 px-4 font-bold text-cf-text">Size</th>
                    <th className="text-left py-3 px-4 font-bold text-cf-text">Chest</th>
                    <th className="text-left py-3 px-4 font-bold text-cf-text">Waist</th>
                    <th className="text-left py-3 px-4 font-bold text-cf-text">Length</th>
                    <th className="text-left py-3 px-4 font-bold text-cf-text">Shoulder</th>
                  </tr>
                </thead>
                <tbody>
                  {SIZE_CHART.map((row) => (
                    <tr key={row.size} className="border-b border-[#E4E7EC] last:border-0 hover:bg-[#F5F7FA]">
                      <td className="py-3 px-4 font-semibold text-cf-text">{row.size}</td>
                      <td className="py-3 px-4 text-[#5A6B7F]">{row.chest}&quot;</td>
                      <td className="py-3 px-4 text-[#5A6B7F]">{row.waist}&quot;</td>
                      <td className="py-3 px-4 text-[#5A6B7F]">{row.length}&quot;</td>
                      <td className="py-3 px-4 text-[#5A6B7F]">{row.shoulder}&quot;</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="returns" className="mt-6">
            <div className="bg-white rounded-xl border border-[#E4E7EC] p-6">
              <div className="flex items-start gap-3 mb-4">
                <RotateCcw className="size-5 text-[#28A745] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-cf-text mb-1">7 Days Easy Return Policy</h3>
                  <p className="text-sm text-[#5A6B7F] leading-relaxed">
                    You can return this product within 7 days of delivery if it is defective, damaged, or different from what was ordered.
                  </p>
                </div>
              </div>
              <div className="space-y-3 ml-8">
                <div className="flex items-start gap-2">
                  <CheckCircle className="size-4 text-[#28A745] shrink-0 mt-0.5" />
                  <p className="text-sm text-[#5A6B7F]">Easy return process through ClothFasion app or website</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="size-4 text-[#28A745] shrink-0 mt-0.5" />
                  <p className="text-sm text-[#5A6B7F]">Pickup available from your doorstep</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="size-4 text-[#28A745] shrink-0 mt-0.5" />
                  <p className="text-sm text-[#5A6B7F]">Refund processed within 5-7 business days</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="size-4 text-[#28A745] shrink-0 mt-0.5" />
                  <p className="text-sm text-[#5A6B7F]">Items must be unused with original tags intact</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Lightbox */}
      {lightboxOpen && product && (
        <div
          className="lightbox-overlay"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); navigateLightbox('prev'); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="size-6" />
          </button>
          <img
            src={product.images[selectedImage]}
            alt={product.name}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => { e.stopPropagation(); navigateLightbox('next'); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <ChevronRight className="size-6" />
          </button>
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <X className="size-5" />
          </button>
          <div className="absolute bottom-6 flex gap-2">
            {product.images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setSelectedImage(i); }}
                className={`w-2.5 h-2.5 rounded-full transition-all ${selectedImage === i ? 'bg-white scale-125' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
