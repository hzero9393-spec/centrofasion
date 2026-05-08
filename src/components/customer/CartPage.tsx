'use client';

import React, { useState } from 'react';
import { useNavigation } from '@/stores/navigation';
import { useCart } from '@/stores/cart';
import { useAuth } from '@/stores/auth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Loader2, ShieldCheck, Truck, MapPin } from 'lucide-react';

export default function CartPage() {
  const { navigate } = useNavigation();
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCart();
  const { customer, isCustomerLoggedIn } = useAuth();
  const [placingOrder, setPlacingOrder] = useState(false);
  const [pincodeInput, setPincodeInput] = useState(customer?.pincode || '');

  const subtotal = getTotal();
  const originalTotal = items.reduce((sum, i) => {
    // Estimate original price if wholesale price was higher
    return sum + i.price * 1.4 * i.quantity;
  }, 0);
  const discount = Math.round(originalTotal - subtotal);
  const deliveryFee = subtotal >= 999 ? 0 : 49;
  const total = subtotal - discount + deliveryFee;

  const handleProceedToCheckout = () => {
    if (!isCustomerLoggedIn() || !customer) {
      toast.error('Please login to continue');
      navigate('login');
      return;
    }
    navigate('checkout');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 text-center">
        <div className="max-w-sm mx-auto">
          <div className="w-28 h-28 rounded-full bg-[var(--theme-surface)] flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="size-14 text-[var(--theme-text-muted)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--theme-text)] mb-2">Your cart is empty</h2>
          <p className="text-sm text-[var(--theme-text-muted)] mb-6">
            Looks like you haven&apos;t added anything to your cart yet. Browse our collection and find something you love!
          </p>
          <Button
            onClick={() => navigate('shop')}
            className="bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] hover:from-[var(--theme-primary)] hover:to-[#E91E63] text-white h-12 px-8 rounded-lg text-sm font-bold btn-scale"
          >
            Shop Now
            <ArrowRight className="size-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-[var(--theme-text)]">
          Shopping Cart
          <span className="text-sm font-normal text-[var(--theme-text-muted)] ml-2">
            ({items.reduce((s, i) => s + i.quantity, 0)} items)
          </span>
        </h1>
        <Button
          variant="ghost"
          onClick={() => navigate('shop')}
          className="text-sm text-[var(--theme-primary)] hover:text-[var(--theme-primary)] font-medium"
        >
          Continue Shopping
        </Button>
      </div>

      {/* Deliver to */}
      <div className="flex items-center gap-3 mb-6 bg-[var(--theme-card)] rounded-xl border border-[var(--theme-border)] p-3 px-4">
        <MapPin className="size-4 text-[var(--theme-text-muted)]" />
        <span className="text-sm text-[var(--theme-text-muted)]">
          Deliver to: <span className="font-semibold text-[var(--theme-text)]">{pincodeInput || 'Enter Pincode'}</span>
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-[var(--theme-primary)] hover:text-[var(--theme-primary)] font-semibold ml-auto h-7"
        >
          Change
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart items - 65% */}
        <div className="flex-1 space-y-3" style={{ maxWidth: '100%' }}>
          {items.map((item) => {
            const estimatedOriginal = Math.round(item.price * 1.4);
            return (
              <div
                key={item.id}
                className="bg-[var(--theme-card)] rounded-xl border border-[var(--theme-border)] p-4 shadow-sm hover:border-[var(--theme-border-subtle)] transition-colors"
              >
                <div className="flex gap-4">
                  {/* Image */}
                  <button
                    onClick={() => navigate('product', { id: item.product_id })}
                    className="shrink-0 w-28 h-28 rounded-lg overflow-hidden bg-[var(--theme-surface)]"
                  >
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </button>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-[var(--theme-text)] line-clamp-2 leading-snug">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          {item.size && (
                            <Badge variant="secondary" className="text-[10px] h-5 px-2 rounded font-medium bg-[var(--theme-surface)] border border-[var(--theme-border-subtle)] text-[var(--theme-text)]">
                              Size: {item.size}
                            </Badge>
                          )}
                          {item.color && (
                            <Badge variant="secondary" className="text-[10px] h-5 px-2 rounded font-medium bg-[var(--theme-surface)] border border-[var(--theme-border-subtle)] text-[var(--theme-text)]">
                              {item.color}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => { removeItem(item.id); toast.success('Item removed from cart'); }}
                        className="p-1.5 text-[var(--theme-text-muted)] hover:text-[#DC3545] transition-colors shrink-0 hover:bg-[var(--theme-surface)] rounded-lg"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    <div className="flex items-end justify-between mt-3">
                      {/* Price */}
                      <div>
                        <span className="text-base font-bold text-[var(--theme-text)]">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                        {item.quantity > 1 && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs text-[var(--theme-text-muted)] line-through">₹{estimatedOriginal.toLocaleString('en-IN')}</span>
                            <span className="text-xs text-[#28A745] font-medium">
                              {Math.round(((estimatedOriginal - item.price) / estimatedOriginal) * 100)}% off
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Quantity stepper */}
                      <div className="flex items-center border border-[var(--theme-border-subtle)] rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-[var(--theme-surface)] transition-colors text-[var(--theme-text-muted)]"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="text-sm font-semibold w-10 text-center text-[var(--theme-text)] border-x border-[var(--theme-border-subtle)]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, Math.min(10, item.quantity + 1))}
                          className="w-8 h-8 flex items-center justify-center hover:bg-[var(--theme-surface)] transition-colors text-[var(--theme-text-muted)]"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Save for later */}
                    <button className="text-xs text-[var(--theme-primary)] font-medium mt-2 hover:underline">
                      Save for Later
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Price Details - 35% sticky */}
        <div className="lg:w-[380px] shrink-0">
          <div className="sticky top-24 bg-[var(--theme-card)] rounded-xl border border-[var(--theme-border)] shadow-sm p-6">
            <h3 className="text-sm font-bold text-[var(--theme-text)] uppercase tracking-wider mb-5">
              Price Details
            </h3>

            <div className="space-y-3 text-sm">
              {/* Price breakdown for each item */}
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <span className="text-[var(--theme-text-muted)] truncate max-w-[200px]">{item.name} x {item.quantity}</span>
                  <span className="font-medium text-[var(--theme-text)] shrink-0 ml-2">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}

              <Separator className="my-2" />

              <div className="flex items-center justify-between">
                <span className="text-[var(--theme-text-muted)]">Price ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-medium text-[var(--theme-text)]">₹{Math.round(subtotal + discount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#28A745] font-medium">Discount</span>
                <span className="text-[#28A745] font-medium">−₹{discount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--theme-text-muted)]">Delivery Fee</span>
                <span className={`font-medium ${deliveryFee === 0 ? 'text-[#28A745]' : 'text-[var(--theme-text)]'}`}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>
              {deliveryFee > 0 && (
                <p className="text-xs text-[var(--theme-primary)]">
                  Add ₹{(999 - subtotal).toLocaleString('en-IN')} more for free delivery
                </p>
              )}
            </div>

            <Separator className="my-4" />

            <div className="flex items-center justify-between mb-6">
              <span className="text-base font-bold text-[var(--theme-text)]">Total Amount</span>
              <span className="text-xl font-bold text-[var(--theme-text)]">₹{Math.max(0, total).toLocaleString('en-IN')}</span>
            </div>

            <p className="text-xs text-[#28A745] font-medium mb-4">
              You will save ₹{discount.toLocaleString('en-IN')} on this order
            </p>

            <Button
              onClick={handleProceedToCheckout}
              className="w-full h-12 bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] hover:from-[var(--theme-primary)] hover:to-[#E91E63] text-white rounded-lg text-sm font-bold btn-scale"
            >
              <Truck className="size-4 mr-2" />
              Place Order
            </Button>

            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-[var(--theme-text-muted)]">
              <ShieldCheck className="size-4 text-[#28A745]" />
              Safe and Secure Payments
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
