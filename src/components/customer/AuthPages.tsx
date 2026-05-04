'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useNavigation } from '@/stores/navigation';
import { useAuth } from '@/stores/auth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, Phone, Lock, UserPlus, ArrowRight, Eye, EyeOff } from 'lucide-react';

export function LoginPage() {
  const { navigate } = useNavigation();
  const { loginCustomer } = useAuth();
  const [mobile, setMobile] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mobile.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setShowOtp(true);
    setLoading(false);
    alert('OTP: 123456');
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }
    setVerifying(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'customer-login', mobile, pin: otpCode }),
      });
      const data = await res.json();
      if (data.customer) {
        loginCustomer(data.customer);
        toast.success('Login successful!');
        navigate('home');
      } else {
        toast.error(data.error || 'Invalid OTP');
      }
    } catch {
      toast.error('Login failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-border/50 p-6 md:p-8">
        <div className="text-center mb-6">
          <h1 className="font-[family-name:var(--font-poppins)] text-2xl font-bold text-[#111]">
            Welcome Back
          </h1>
          <p className="text-sm text-gray-500 mt-1">Login to your ClothFasion account</p>
        </div>

        {!showOtp ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <Label htmlFor="mobile" className="text-sm font-medium text-gray-700 mb-2 block">
                Mobile Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="pl-10 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-1 focus-visible:ring-[#FF6A00]"
                  maxLength={10}
                  autoFocus
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || mobile.length !== 10}
              className="w-full h-12 bg-[#111] hover:bg-[#111]/90 text-white rounded-xl text-sm font-semibold"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <Lock className="size-4 mr-2" />
              )}
              Send OTP
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              OTP sent to <span className="font-semibold">{mobile}</span>
            </p>

            <div className="flex justify-center gap-2">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:border-transparent transition-all"
                  autoFocus={i === 0}
                />
              ))}
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setShowOtp(false);
                  setOtp(['', '', '', '', '', '']);
                }}
                className="text-sm text-gray-500 hover:text-[#111]"
              >
                Change number
              </button>
              <button
                type="button"
                onClick={() => {
                  setOtp(['1', '2', '3', '4', '5', '6']);
                }}
                className="text-sm text-[#FF6A00] hover:underline"
              >
                Resend OTP
              </button>
            </div>

            <Button
              type="submit"
              disabled={verifying || otp.join('').length !== 6}
              className="w-full h-12 bg-[#FF6A00] hover:bg-[#FF6A00]/90 text-white rounded-xl text-sm font-semibold"
            >
              {verifying ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <ArrowRight className="size-4 mr-2" />
              )}
              Verify & Login
            </Button>
          </form>
        )}

        <Separator className="my-6" />

        <p className="text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <button
            onClick={() => navigate('signup')}
            className="text-[#FF6A00] font-semibold hover:underline"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}

export function SignupPage() {
  const { navigate } = useNavigation();
  const { loginCustomer } = useAuth();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    mobile: '',
    pin: '',
    confirmPin: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name.trim()) {
      toast.error('Please enter your first name');
      return;
    }
    if (form.mobile.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    if (form.pin.length !== 6) {
      toast.error('PIN must be 6 digits');
      return;
    }
    if (form.pin !== form.confirmPin) {
      toast.error('PINs do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'customer-signup',
          first_name: form.first_name,
          last_name: form.last_name,
          mobile: form.mobile,
          pin: form.pin,
        }),
      });
      const data = await res.json();
      if (data.customer) {
        loginCustomer(data.customer);
        toast.success('Account created successfully!');
        navigate('home');
      } else {
        toast.error(data.error || 'Signup failed');
      }
    } catch {
      toast.error('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-border/50 p-6 md:p-8">
        <div className="text-center mb-6">
          <h1 className="font-[family-name:var(--font-poppins)] text-2xl font-bold text-[#111]">
            Create Account
          </h1>
          <p className="text-sm text-gray-500 mt-1">Join ClothFasion today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 mb-2 block">
                First Name *
              </Label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                value={form.first_name}
                onChange={(e) => updateField('first_name', e.target.value)}
                className="h-11 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-1 focus-visible:ring-[#FF6A00]"
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 mb-2 block">
                Last Name
              </Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={form.last_name}
                onChange={(e) => updateField('last_name', e.target.value)}
                className="h-11 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-1 focus-visible:ring-[#FF6A00]"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="signupMobile" className="text-sm font-medium text-gray-700 mb-2 block">
              Mobile Number *
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                id="signupMobile"
                type="tel"
                placeholder="10-digit mobile number"
                value={form.mobile}
                onChange={(e) => updateField('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="pl-10 h-11 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-1 focus-visible:ring-[#FF6A00]"
                maxLength={10}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="pin" className="text-sm font-medium text-gray-700 mb-2 block">
              Create 6-digit PIN *
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                id="pin"
                type={showPin ? 'text' : 'password'}
                placeholder="Enter 6-digit PIN"
                value={form.pin}
                onChange={(e) => updateField('pin', e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="pl-10 pr-10 h-11 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-1 focus-visible:ring-[#FF6A00]"
                maxLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPin ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="confirmPin" className="text-sm font-medium text-gray-700 mb-2 block">
              Confirm PIN *
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                id="confirmPin"
                type={showPin ? 'text' : 'password'}
                placeholder="Confirm your PIN"
                value={form.confirmPin}
                onChange={(e) => updateField('confirmPin', e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="pl-10 h-11 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-1 focus-visible:ring-[#FF6A00]"
                maxLength={6}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#FF6A00] hover:bg-[#FF6A00]/90 text-white rounded-xl text-sm font-semibold"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : (
              <UserPlus className="size-4 mr-2" />
            )}
            Create Account
          </Button>
        </form>

        <Separator className="my-6" />

        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <button
            onClick={() => navigate('login')}
            className="text-[#FF6A00] font-semibold hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
