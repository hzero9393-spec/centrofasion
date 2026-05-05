'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useNavigation } from '@/stores/navigation';
import { useAuth } from '@/stores/auth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Phone, ArrowRight, UserPlus, X } from 'lucide-react';

interface AuthPagesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthPagesProps) {
  const { loginCustomer } = useAuth();
  const [step, setStep] = useState<'mobile' | 'otp' | 'signup'>('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Signup form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '', '', '']);
  const [signingUp, setSigningUp] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmPinRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset state on open/close
  useEffect(() => {
    if (open) {
      setStep('mobile');
      setMobile('');
      setOtp(['', '', '', '', '', '']);
      setFirstName('');
      setLastName('');
      setPin(['', '', '', '', '', '']);
      setConfirmPin(['', '', '', '', '', '']);
    }
  }, [open]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mobile.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    // Check if user exists
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'check-mobile', mobile }),
      });
      const data = await res.json();
      if (data.exists) {
        setStep('otp');
      } else {
        setStep('signup');
      }
    } catch {
      // Fallback: show OTP step
      setStep('otp');
    }

    // Dev mode
    alert('Your OTP is 123456');
    setLoading(false);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handlePinChange = (index: number, value: string, setFn: React.Dispatch<React.SetStateAction<string[]>>, refs: React.MutableRefObject<(HTMLInputElement | null)[]>) => {
    if (value.length > 1) value = value[value.length - 1];
    if (!/^\d*$/.test(value)) return;
    const newPin = [...setFn as unknown as string[]];
    newPin[index] = value;
    // Use a functional approach
    setFn((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
    if (value && index < 5) refs.current[index + 1]?.focus();
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent, pinArr: string[], refs: React.MutableRefObject<(HTMLInputElement | null)[]>) => {
    if (e.key === 'Backspace' && !pinArr[index] && index > 0) {
      refs.current[index - 1]?.focus();
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
        onOpenChange(false);
      } else {
        toast.error(data.error || 'Invalid OTP');
      }
    } catch {
      toast.error('Login failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) { toast.error('Please enter your first name'); return; }
    if (pin.join('').length !== 6) { toast.error('PIN must be 6 digits'); return; }
    if (confirmPin.join('') !== pin.join('')) { toast.error('PINs do not match'); return; }

    setSigningUp(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'customer-signup',
          first_name: firstName,
          last_name: lastName,
          mobile,
          pin: pin.join(''),
        }),
      });
      const data = await res.json();
      if (data.customer) {
        loginCustomer(data.customer);
        toast.success('Account created successfully!');
        onOpenChange(false);
      } else {
        toast.error(data.error || 'Signup failed');
      }
    } catch {
      toast.error('Signup failed. Please try again.');
    } finally {
      setSigningUp(false);
    }
  };

  const resetToMobile = () => {
    setStep('mobile');
    setOtp(['', '', '', '', '', '']);
    setPin(['', '', '', '', '', '']);
    setConfirmPin(['', '', '', '', '', '']);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[450px] p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{step === 'signup' ? 'Create Account' : 'Login'}</DialogTitle>
        </DialogHeader>

        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-[#F5F7FA] flex items-center justify-center text-[#5A6B7F] hover:bg-[#E4E7EC] transition-colors"
        >
          <X className="size-4" />
        </button>

        <div className="p-6 md:p-8">
          {/* Step 1: Mobile */}
          {step === 'mobile' && (
            <div>
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-cf-text">Login / Sign Up</h2>
                <p className="text-sm text-[#5A6B7F] mt-1">Enter your mobile number to continue</p>
              </div>
              <form onSubmit={handleSendCode} className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-cf-text mb-2 block">Mobile Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#5A6B7F]" />
                    <Input
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="pl-10 h-12 rounded-lg border-[#E4E7EC] text-sm"
                      maxLength={10}
                      autoFocus
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading || mobile.length !== 10}
                  className="w-full h-12 bg-[#FF5722] hover:bg-[#E64A19] text-white rounded-lg text-sm font-bold btn-scale"
                >
                  {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : <ArrowRight className="size-4 mr-2" />}
                  Continue
                </Button>
              </form>
              <p className="text-center text-xs text-[#5A6B7F] mt-6">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          )}

          {/* Step 2: OTP (existing user) */}
          {step === 'otp' && (
            <div>
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-cf-text">Verify OTP</h2>
                <p className="text-sm text-[#5A6B7F] mt-1">
                  OTP sent to <span className="font-semibold text-cf-text">+91 {mobile}</span>
                </p>
              </div>
              <form onSubmit={handleVerify} className="space-y-5">
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
                      className="w-12 h-14 text-center text-xl font-bold rounded-lg border-2 border-[#E4E7EC] bg-[#F5F7FA] focus:outline-none focus:ring-2 focus:ring-[#FF5722] focus:border-transparent transition-all"
                      autoFocus={i === 0}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <button type="button" onClick={resetToMobile} className="text-sm text-[#5A6B7F] hover:text-cf-text">
                    Change number
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOtp(['1', '2', '3', '4', '5', '6']);
                      toast.info('OTP auto-filled (Dev mode)');
                    }}
                    className="text-sm text-[#FF5722] font-medium hover:underline"
                  >
                    Resend OTP
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={verifying || otp.join('').length !== 6}
                  className="w-full h-12 bg-[#FF5722] hover:bg-[#E64A19] text-white rounded-lg text-sm font-bold btn-scale"
                >
                  {verifying ? <Loader2 className="size-4 animate-spin mr-2" /> : <ArrowRight className="size-4 mr-2" />}
                  Verify & Login
                </Button>
              </form>
            </div>
          )}

          {/* Step 2: Signup (new user) */}
          {step === 'signup' && (
            <div>
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-cf-text">Create Account</h2>
                <p className="text-sm text-[#5A6B7F] mt-1">
                  New to ClothFasion? Create your account
                </p>
              </div>
              <form onSubmit={handleSignup} className="space-y-4">
                {/* Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium text-cf-text mb-1.5 block">First Name *</Label>
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="h-11 rounded-lg border-[#E4E7EC] text-sm"
                      placeholder="First name"
                      autoFocus
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-cf-text mb-1.5 block">Last Name</Label>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="h-11 rounded-lg border-[#E4E7EC] text-sm"
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <Separator />

                {/* Create PIN */}
                <div>
                  <Label className="text-sm font-medium text-cf-text mb-2 block">Create 6-digit PIN</Label>
                  <div className="flex justify-center gap-2">
                    {pin.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { pinRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handlePinChange(i, e.target.value, setPin, pinRefs)}
                        onKeyDown={(e) => handlePinKeyDown(i, e, pin, pinRefs)}
                        className="w-12 h-14 text-center text-xl font-bold rounded-lg border-2 border-[#E4E7EC] bg-[#F5F7FA] focus:outline-none focus:ring-2 focus:ring-[#FF5722] focus:border-transparent transition-all"
                        autoFocus={i === 0}
                      />
                    ))}
                  </div>
                </div>

                {/* Confirm PIN */}
                <div>
                  <Label className="text-sm font-medium text-cf-text mb-2 block">Confirm PIN</Label>
                  <div className="flex justify-center gap-2">
                    {confirmPin.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { confirmPinRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handlePinChange(i, e.target.value, setConfirmPin, confirmPinRefs)}
                        onKeyDown={(e) => handlePinKeyDown(i, e, confirmPin, confirmPinRefs)}
                        className="w-12 h-14 text-center text-xl font-bold rounded-lg border-2 border-[#E4E7EC] bg-[#F5F7FA] focus:outline-none focus:ring-2 focus:ring-[#FF5722] focus:border-transparent transition-all"
                        autoFocus={i === 0}
                      />
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={signingUp}
                  className="w-full h-12 bg-[#FF5722] hover:bg-[#E64A19] text-white rounded-lg text-sm font-bold btn-scale mt-2"
                >
                  {signingUp ? <Loader2 className="size-4 animate-spin mr-2" /> : <UserPlus className="size-4 mr-2" />}
                  Create Account
                </Button>

                <div className="text-center">
                  <button type="button" onClick={resetToMobile} className="text-sm text-[#5A6B7F] hover:text-cf-text">
                    Change number
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Standalone login page (for direct navigation)
export function LoginPage() {
  const { navigate, goBack } = useNavigation();
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-[450px] w-full bg-white rounded-xl border border-[#E4E7EC] p-6 md:p-8 shadow-sm">
        <AuthModal
          open={true}
          onOpenChange={(open) => { if (!open) navigate('home'); }}
        />
      </div>
    </div>
  );
}

export function SignupPage() {
  const { navigate } = useNavigation();
  return <LoginPage />;
}
