'use client';

import React, { useState } from 'react';
import { useNavigation } from '@/stores/navigation';
import { useCart, type CartItem } from '@/stores/cart';
import { useAuth } from '@/stores/auth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Loader2, Package } from 'lucide-react';

export default function CartPage() {
  const { navigate } = useNavigation();
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCart();
  const { customer, isCustomerLoggedIn } = useAuth();
  const [placingOrder, setPlacingOrder] = useState(false);

  const subtotal = getTotal();
  const shipping = subtotal >= 999 ? 0 : 99;
  const total = subtotal + shipping;

  const handlePlaceOrder = async () => {
    if (!isCustomerLoggedIn() || !customer) {
      toast.error('Please login to place an order');
      navigate('login');
      return;
    }
    setPlacingOrder(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customer.id,
          items: items.map((item) => ({
            product_id: item.product_id,
            name: item.name,
            image: item.image,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            price: item.price,
          })),
          address: customer.address || 'Default Address',
          pincode: customer.pincode || '000000',
          payment_method: 'COD',
          total,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Order ${data.order_number} placed successfully!`);
        clearCart();
        navigate('profile');
      } else {
        toast.error(data.error || 'Failed to place order');
      }
    } catch {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 text-center">
        <div className="max-w-sm mx-auto">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="size-10 text-gray-400" />
          </div>
          <h2 className="font-[family-name:var(--font-poppins)] text-xl font-bold text-[#111] mb-2">
            Your cart is empty
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Looks like you haven&apos;t added anything to your cart yet.
          </p>
          <Button
            onClick={() => navigate('shop')}
            className="bg-[#FF6A00] hover:bg-[#FF6A00]/90 text-white h-11 px-8 rounded-xl text-sm font-semibold"
          >
            Start Shopping
            <ArrowRight className="size-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-8">
      <h1 className="font-[family-name:var(--font-poppins)] text-xl md:text-2xl font-bold text-[#111] mb-6">
        Shopping Cart
        <span className="text-sm font-normal text-gray-500 ml-2">
          ({items.reduce((s, i) => s + i.quantity, 0)} items)
        </span>
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart items */}
        <div className="flex-1 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-border/50 p-4 shadow-sm"
            >
              <div className="flex gap-4">
                {/* Image */}
                <button
                  onClick={() => navigate('product', { id: item.product_id })}
                  className="shrink-0 w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden bg-gray-100"
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
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {item.size && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                            {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                            {item.color}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <div className="flex items-end justify-between mt-3">
                    {/* Quantity */}
                    <div className="flex items-center gap-2 border border-gray-200 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    {/* Price */}
                    <div className="text-right">
                      <p className="text-base font-bold text-[#111]">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-gray-400">
                          ₹{item.price.toLocaleString('en-IN')} each
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:w-80 shrink-0">
          <div className="sticky top-24 bg-white rounded-xl border border-border/50 shadow-sm p-6">
            <h3 className="font-[family-name:var(--font-poppins)] text-base font-semibold text-[#111] mb-4">
              Order Summary
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-[#111]">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className={`font-medium ${shipping === 0 ? 'text-[#22C55E]' : 'text-[#111]'}`}>
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-[#FF6A00]">
                  Add ₹{(999 - subtotal).toLocaleString('en-IN')} more for free shipping
                </p>
              )}
            </div>

            <Separator className="my-4" />

            <div className="flex items-center justify-between mb-6">
              <span className="text-base font-semibold text-[#111]">Total</span>
              <span className="text-lg font-bold text-[#111]">
                ₹{total.toLocaleString('en-IN')}
              </span>
            </div>

            <Button
              onClick={handlePlaceOrder}
              disabled={placingOrder}
              className="w-full h-12 bg-[#FF6A00] hover:bg-[#FF6A00]/90 text-white rounded-xl text-sm font-semibold"
            >
              {placingOrder ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <Package className="size-4 mr-2" />
              )}
              Proceed to Buy
            </Button>

            <Button
              variant="ghost"
              onClick={() => navigate('shop')}
              className="w-full mt-2 text-sm text-gray-500"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
