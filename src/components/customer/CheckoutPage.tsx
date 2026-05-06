'use client';

import React, { useState, useEffect } from 'react';
import { useNavigation } from '@/stores/navigation';
import { useCart } from '@/stores/cart';
import { useAuth } from '@/stores/auth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Check, Truck, MapPin, CreditCard, ArrowLeft } from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir',
  'Ladakh', 'Chandigarh', 'Puducherry',
];

const STEPS = ['LOGIN', 'ADDRESS', 'PAYMENT', 'CONFIRMATION'];

export default function CheckoutPage() {
  const { navigate, goBack } = useNavigation();
  const { items, getTotal, clearCart } = useCart();
  const { customer, isCustomerLoggedIn, loginCustomer } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [placing, setPlacing] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Address form
  const [address, setAddress] = useState({
    first_name: customer?.first_name || '',
    last_name: customer?.last_name || '',
    mobile: customer?.mobile || '',
    pincode: customer?.pincode || '',
    state: '',
    district: customer?.address || '',
    fullAddress: customer?.address || '',
    landmark: customer?.nearby_area || '',
    saveAddress: true,
  });

  // Payment
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const subtotal = getTotal();
  const deliveryFee = subtotal >= 999 ? 0 : 49;
  const total = subtotal + deliveryFee;

  useEffect(() => {
    if (!isCustomerLoggedIn()) {
      setCurrentStep(1);
    } else {
      setCurrentStep(2);
    }
  }, [isCustomerLoggedIn]);

  useEffect(() => {
    if (items.length === 0 && currentStep < 4) {
      navigate('cart');
    }
  }, [items.length, currentStep, navigate]);

  const handleAddressChange = (field: string, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressContinue = () => {
    if (!address.first_name.trim()) { toast.error('Please enter your first name'); return; }
    if (!address.last_name.trim()) { toast.error('Please enter your last name'); return; }
    if (address.mobile.length !== 10) { toast.error('Please enter a valid 10-digit mobile number'); return; }
    if (address.pincode.length !== 6) { toast.error('Please enter a valid 6-digit pincode'); return; }
    if (!address.state) { toast.error('Please select your state'); return; }
    if (!address.district.trim()) { toast.error('Please enter your district/city'); return; }
    if (!address.fullAddress.trim()) { toast.error('Please enter your full address'); return; }
    setCurrentStep(3);
  };

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customer!.id,
          items: items.map((item) => ({
            product_id: item.product_id,
            name: item.name,
            image: item.image,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            price: item.price,
          })),
          address: `${address.fullAddress}, ${address.district}, ${address.state} - ${address.pincode}`,
          pincode: address.pincode,
          payment_method: paymentMethod.toUpperCase(),
          total,
        }),
      });
      const data = await res.json();
      if (data.success || data.order_number) {
        setOrderNumber(data.order_number || `CLF-${Date.now().toString().slice(-4)}`);
        clearCart();
        setCurrentStep(4);
        toast.success('Order placed successfully!');
      } else {
        toast.error(data.error || 'Failed to place order');
      }
    } catch {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  const getStepStatus = (step: number) => {
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'active';
    return 'pending';
  };

  // Step 1: Login prompt
  const renderLoginStep = () => (
    <div className="max-w-md mx-auto text-center py-12">
      <div className="w-16 h-16 rounded-full bg-[var(--theme-primary)]/10 flex items-center justify-center mx-auto mb-6">
        <CreditCard className="size-8 text-[var(--theme-primary)]" />
      </div>
      <h2 className="text-xl font-bold text-cf-text mb-2">Login to Continue</h2>
      <p className="text-sm text-[#5A6B7F] mb-6">Please login to proceed with your order</p>
      <Button
        onClick={() => navigate('login')}
        className="bg-[var(--theme-primary)] hover:bg-[var(--theme-primary)] text-white h-12 px-8 rounded-lg text-sm font-bold"
      >
        Login / Sign Up
      </Button>
    </div>
  );

  // Step 2: Address form
  const renderAddressStep = () => (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-lg font-bold text-cf-text mb-6 flex items-center gap-2">
        <MapPin className="size-5 text-[var(--theme-primary)]" />
        Delivery Address
      </h2>
      <div className="bg-white rounded-xl border border-[#E4E7EC] p-6 space-y-4">
        {/* Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-cf-text mb-1.5 block">First Name *</Label>
            <Input
              value={address.first_name}
              onChange={(e) => handleAddressChange('first_name', e.target.value)}
              className="h-11 rounded-lg border-[#E4E7EC]"
              placeholder="First name"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-cf-text mb-1.5 block">Last Name *</Label>
            <Input
              value={address.last_name}
              onChange={(e) => handleAddressChange('last_name', e.target.value)}
              className="h-11 rounded-lg border-[#E4E7EC]"
              placeholder="Last name"
            />
          </div>
        </div>

        {/* Mobile */}
        <div>
          <Label className="text-sm font-medium text-cf-text mb-1.5 block">Mobile Number *</Label>
          <Input
            type="tel"
            value={address.mobile}
            onChange={(e) => handleAddressChange('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
            className="h-11 rounded-lg border-[#E4E7EC]"
            placeholder="10-digit mobile number"
            maxLength={10}
          />
        </div>

        {/* Pincode & State */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-cf-text mb-1.5 block">Pincode *</Label>
            <Input
              type="text"
              value={address.pincode}
              onChange={(e) => handleAddressChange('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="h-11 rounded-lg border-[#E4E7EC]"
              placeholder="6-digit pincode"
              maxLength={6}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-cf-text mb-1.5 block">State *</Label>
            <Select value={address.state} onValueChange={(v) => handleAddressChange('state', v)}>
              <SelectTrigger className="h-11 rounded-lg border-[#E4E7EC]">
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent className="max-h-[240px]">
                {INDIAN_STATES.map((state) => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* District */}
        <div>
          <Label className="text-sm font-medium text-cf-text mb-1.5 block">District / City *</Label>
          <Input
            value={address.district}
            onChange={(e) => handleAddressChange('district', e.target.value)}
            className="h-11 rounded-lg border-[#E4E7EC]"
            placeholder="Enter your district or city"
          />
        </div>

        {/* Full Address */}
        <div>
          <Label className="text-sm font-medium text-cf-text mb-1.5 block">Full Address *</Label>
          <Textarea
            value={address.fullAddress}
            onChange={(e) => handleAddressChange('fullAddress', e.target.value)}
            className="min-h-[80px] rounded-lg border-[#E4E7EC] resize-none"
            placeholder="Enter your complete address (house no, street, area)"
          />
        </div>

        {/* Landmark */}
        <div>
          <Label className="text-sm font-medium text-cf-text mb-1.5 block">Nearby Landmark</Label>
          <Input
            value={address.landmark}
            onChange={(e) => handleAddressChange('landmark', e.target.value)}
            className="h-11 rounded-lg border-[#E4E7EC]"
            placeholder="Nearby landmark (optional)"
          />
        </div>

        {/* Save address */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="saveAddress"
            checked={address.saveAddress}
            onCheckedChange={(checked) => handleAddressChange('saveAddress', checked as boolean)}
            className="rounded data-[state=checked]:bg-[var(--theme-primary)] data-[state=checked]:border-[var(--theme-primary)]"
          />
          <Label htmlFor="saveAddress" className="text-sm text-[#5A6B7F] cursor-pointer">
            Save this address for future orders
          </Label>
        </div>

        <Button
          onClick={handleAddressContinue}
          className="w-full h-12 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary)] text-white rounded-lg text-sm font-bold btn-scale mt-2"
        >
          Continue
        </Button>
      </div>
    </div>
  );

  // Step 3: Payment
  const renderPaymentStep = () => (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-lg font-bold text-cf-text mb-6 flex items-center gap-2">
        <CreditCard className="size-5 text-[var(--theme-primary)]" />
        Payment Method
      </h2>

      <div className="space-y-6">
        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
          {/* COD */}
          <label
            className={`flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${
              paymentMethod === 'cod'
                ? 'border-[var(--theme-primary)] bg-[#FFF8F5]'
                : 'border-[#E4E7EC] bg-white hover:border-[#5A6B7F]'
            }`}
          >
            <RadioGroupItem value="cod" id="cod" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Truck className="size-5 text-[#28A745]" />
                <span className="text-sm font-bold text-cf-text">Cash on Delivery</span>
              </div>
              <p className="text-xs text-[#5A6B7F] mt-1">Pay when your order is delivered to your doorstep</p>
            </div>
          </label>

          {/* UPI */}
          <label
            className={`flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${
              paymentMethod === 'upi'
                ? 'border-[var(--theme-primary)] bg-[#FFF8F5]'
                : 'border-[#E4E7EC] bg-white hover:border-[#5A6B7F]'
            }`}
          >
            <RadioGroupItem value="upi" id="upi" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CreditCard className="size-5 text-[#3B82F6]" />
                <span className="text-sm font-bold text-cf-text">UPI Payment</span>
              </div>
              <p className="text-xs text-[#5A6B7F] mt-1">Pay using any UPI app (GPay, PhonePe, Paytm)</p>
            </div>
          </label>
        </RadioGroup>

        {/* QR Code placeholder */}
        {paymentMethod === 'upi' && (
          <div className="bg-white rounded-xl border border-[#E4E7EC] p-6 text-center">
            <div className="w-48 h-48 bg-[#F5F7FA] rounded-xl flex items-center justify-center mx-auto mb-3 border border-dashed border-[#E4E7EC]">
              <div className="text-center">
                <div className="grid grid-cols-5 gap-1 w-20 mx-auto">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div key={i} className="w-3 h-3 bg-[#0A1B2A] rounded-sm" />
                  ))}
                </div>
                <p className="text-[10px] text-[#5A6B7F] mt-2">QR Code</p>
              </div>
            </div>
            <p className="text-sm text-[#5A6B7F]">Scan QR code to pay</p>
            <p className="text-lg font-bold text-cf-text mt-1">₹{total.toLocaleString('en-IN')}</p>
          </div>
        )}

        {/* Order summary mini */}
        <div className="bg-white rounded-xl border border-[#E4E7EC] p-5">
          <h3 className="text-sm font-bold text-cf-text mb-3">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-[#5A6B7F]">
              <span>Items ({items.length})</span>
              <span className="text-cf-text font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-[#5A6B7F]">
              <span>Delivery</span>
              <span className={deliveryFee === 0 ? 'text-[#28A745] font-medium' : 'text-cf-text font-medium'}>
                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-cf-text text-base">
              <span>Total</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <Button
          onClick={handlePlaceOrder}
          disabled={placing}
          className="w-full h-12 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary)] text-white rounded-lg text-sm font-bold btn-scale"
        >
          {placing ? (
            <Loader2 className="size-4 animate-spin mr-2" />
          ) : (
            <ShieldCheck className="size-4 mr-2" />
          )}
          {placing ? 'Placing Order...' : `Place Order • ₹${total.toLocaleString('en-IN')}`}
        </Button>
      </div>
    </div>
  );

  // Step 4: Order Success
  const renderSuccessStep = () => (
    <div className="max-w-md mx-auto text-center py-12">
      {/* Success animation */}
      <div className="relative w-24 h-24 mx-auto mb-8">
        <div className="w-24 h-24 rounded-full bg-[#28A745] flex items-center justify-center animate-[bounce_0.6s_ease-in-out]">
          <Check className="size-12 text-white" strokeWidth={3} />
        </div>
        <div className="absolute inset-0 rounded-full bg-[#28A745]/20 animate-ping" />
      </div>

      <h2 className="text-2xl font-bold text-cf-text mb-2">Order Placed Successfully!</h2>
      <p className="text-sm text-[#5A6B7F] mb-6">
        Your order has been confirmed and will be delivered soon.
      </p>

      <div className="bg-white rounded-xl border border-[#E4E7EC] p-5 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#5A6B7F]">Order ID</span>
          <span className="text-sm font-bold text-cf-text">#{orderNumber}</span>
        </div>
        <Separator className="my-3" />
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#5A6B7F]">Total Amount</span>
          <span className="text-sm font-bold text-[#28A745]">₹{total.toLocaleString('en-IN')}</span>
        </div>
        <Separator className="my-3" />
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#5A6B7F]">Payment</span>
          <span className="text-sm font-medium text-cf-text">{paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI'}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          onClick={() => navigate('profile')}
          className="w-full h-12 bg-[#0A1B2A] hover:bg-[#0A1B2A]/90 text-white rounded-lg text-sm font-bold btn-scale"
        >
          <Truck className="size-4 mr-2" />
          Track Order
        </Button>
        <Button
          onClick={() => navigate('shop')}
          variant="outline"
          className="w-full h-12 border-[#E4E7EC] text-cf-text rounded-lg text-sm font-bold btn-scale"
        >
          Continue Shopping
        </Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-8">
      {/* Progress bar */}
      {currentStep < 4 && (
        <>
          <div className="flex items-center gap-1 mb-8 max-w-2xl mx-auto">
            <button
              onClick={currentStep > 1 ? () => setCurrentStep(currentStep - 1) : goBack}
              className="flex items-center gap-1 text-sm text-[#5A6B7F] hover:text-cf-text transition-colors mr-4"
            >
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
            {STEPS.map((step, index) => {
              const stepNum = index + 1;
              const status = getStepStatus(stepNum);
              return (
                <React.Fragment key={step}>
                  <div className="checkout-step flex flex-col items-center">
                    <div
                      className={`step-circle text-xs ${
                        status === 'completed'
                          ? 'completed'
                          : status === 'active'
                          ? 'active'
                          : ''
                      }`}
                    >
                      {status === 'completed' ? <Check className="size-3.5" strokeWidth={3} /> : stepNum}
                    </div>
                    <span className={`text-[10px] mt-1.5 font-medium hidden sm:block ${
                      status === 'active' ? 'text-[var(--theme-primary)]' : status === 'completed' ? 'text-[#28A745]' : 'text-[#5A6B7F]/50'
                    }`}>
                      {step}
                    </span>
                  </div>
                  {stepNum < STEPS.length && (
                    <div className={`step-line flex-1 max-w-[100px] ${status === 'completed' ? 'completed' : ''}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </>
      )}

      {/* Step content */}
      {currentStep === 1 && renderLoginStep()}
      {currentStep === 2 && renderAddressStep()}
      {currentStep === 3 && renderPaymentStep()}
      {currentStep === 4 && renderSuccessStep()}
    </div>
  );
}

function ShieldCheck(props: React.SVGProps<SVGSVGElement> & { size?: string | number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
