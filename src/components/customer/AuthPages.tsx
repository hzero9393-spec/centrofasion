'use client';

import React, { useState, useEffect } from 'react';
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
import { Loader2, Phone, Lock, UserPlus, X, Eye, EyeOff, Mail, User } from 'lucide-react';

interface AuthPagesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthPagesProps) {
  const { loginCustomer } = useAuth();
  const [tab, setTab] = useState<'login' | 'signup'>('login');

  // Login form
  const [loginMobile, setLoginMobile] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Signup form
  const [signFirstName, setSignFirstName] = useState('');
  const [signLastName, setSignLastName] = useState('');
  const [signEmail, setSignEmail] = useState('');
  const [signMobile, setSignMobile] = useState('');
  const [signPassword, setSignPassword] = useState('');
  const [signConfirmPassword, setSignConfirmPassword] = useState('');
  const [showSignPassword, setShowSignPassword] = useState(false);
  const [showSignConfirm, setShowSignConfirm] = useState(false);
  const [signLoading, setSignLoading] = useState(false);

  // Reset state on open/close
  useEffect(() => {
    if (open) {
      setTab('login');
      setLoginMobile('');
      setLoginPassword('');
      setShowLoginPassword(false);
      setSignFirstName('');
      setSignLastName('');
      setSignEmail('');
      setSignMobile('');
      setSignPassword('');
      setSignConfirmPassword('');
      setShowSignPassword(false);
      setShowSignConfirm(false);
    }
  }, [open]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginMobile.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!loginPassword) {
      toast.error('Please enter your password');
      return;
    }
    if (loginPassword.length < 4) {
      toast.error('Password must be at least 4 characters');
      return;
    }

    setLoginLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'customer-login', mobile: loginMobile, pin: loginPassword }),
      });
      const data = await res.json();
      if (data.customer) {
        loginCustomer(data.customer);
        toast.success(`Welcome back, ${data.customer.first_name}!`);
        onOpenChange(false);
      } else {
        toast.error(data.error || 'Invalid mobile number or password');
      }
    } catch {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signFirstName.trim()) {
      toast.error('Please enter your first name');
      return;
    }
    if (signMobile.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    if (signEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (signPassword.length < 4) {
      toast.error('Password must be at least 4 characters');
      return;
    }
    if (signPassword !== signConfirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setSignLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'customer-signup',
          first_name: signFirstName.trim(),
          last_name: signLastName.trim(),
          mobile: signMobile,
          email: signEmail.trim(),
          pin: signPassword,
        }),
      });
      const data = await res.json();
      if (data.customer) {
        loginCustomer(data.customer);
        toast.success('Account created successfully! Welcome to ClothFasion!');
        onOpenChange(false);
      } else {
        toast.error(data.error || 'Signup failed');
      }
    } catch {
      toast.error('Signup failed. Please try again.');
    } finally {
      setSignLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px] p-0 overflow-hidden glass rounded-2xl border-[rgba(255,255,255,0.1)] bg-[#1D1D1F]/95 backdrop-blur-xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{tab === 'login' ? 'Login' : 'Create Account'}</DialogTitle>
        </DialogHeader>

        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center text-[#86868B] hover:bg-[rgba(255,255,255,0.15)] hover:text-[#F5F5F7] transition-all duration-200"
        >
          <X className="size-4" />
        </button>

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#F5F5F7] tracking-tight">
              {tab === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-sm text-[#86868B] mt-1.5">
              {tab === 'login'
                ? 'Login to your ClothFasion account'
                : 'Join ClothFasion and start shopping'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-[rgba(255,255,255,0.06)] rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => setTab('login')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                tab === 'login'
                  ? 'bg-[#FF5722] text-white shadow-lg shadow-[rgba(255,87,34,0.3)]'
                  : 'text-[#86868B] hover:text-[#F5F5F7]'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setTab('signup')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                tab === 'signup'
                  ? 'bg-[#FF5722] text-white shadow-lg shadow-[rgba(255,87,34,0.3)]'
                  : 'text-[#86868B] hover:text-[#F5F5F7]'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 animate-fade-up">
              <div>
                <Label className="text-sm font-medium text-[#F5F5F7] mb-2 block">Mobile Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#86868B]" />
                  <Input
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={loginMobile}
                    onChange={(e) => setLoginMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="pl-10 h-12 rounded-xl bg-[rgba(255,255,255,0.06)] border-[rgba(255,255,255,0.1)] text-[#F5F5F7] placeholder:text-[#86868B] text-sm focus:ring-[#FF5722] focus:border-[#FF5722] transition-all duration-200"
                    maxLength={10}
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-[#F5F5F7] mb-2 block">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#86868B]" />
                  <Input
                    type={showLoginPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 rounded-xl bg-[rgba(255,255,255,0.06)] border-[rgba(255,255,255,0.1)] text-[#F5F5F7] placeholder:text-[#86868B] text-sm focus:ring-[#FF5722] focus:border-[#FF5722] transition-all duration-200"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#F5F5F7] transition-colors"
                  >
                    {showLoginPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loginLoading || loginMobile.length !== 10 || !loginPassword}
                className="w-full h-12 bg-[#FF5722] hover:bg-[#E64A19] text-white rounded-xl text-sm font-bold btn-3d disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loginLoading ? (
                  <Loader2 className="size-4 animate-spin mr-2" />
                ) : (
                  <Lock className="size-4 mr-2" />
                )}
                Login
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setTab('signup')}
                  className="text-sm text-[#86868B] hover:text-[#F5F5F7] transition-colors"
                >
                  New here?{' '}
                  <span className="text-[#FF5722] font-semibold hover:underline">Create an account</span>
                </button>
              </div>
            </form>
          )}

          {/* Signup Form */}
          {tab === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4 animate-fade-up">
              {/* Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium text-[#F5F5F7] mb-2 block">First Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#86868B]" />
                    <Input
                      value={signFirstName}
                      onChange={(e) => setSignFirstName(e.target.value)}
                      className="pl-10 h-11 rounded-xl bg-[rgba(255,255,255,0.06)] border-[rgba(255,255,255,0.1)] text-[#F5F5F7] placeholder:text-[#86868B] text-sm focus:ring-[#FF5722] focus:border-[#FF5722] transition-all duration-200"
                      placeholder="First name"
                      autoFocus
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-[#F5F5F7] mb-2 block">Last Name</Label>
                  <Input
                    value={signLastName}
                    onChange={(e) => setSignLastName(e.target.value)}
                    className="h-11 rounded-xl bg-[rgba(255,255,255,0.06)] border-[rgba(255,255,255,0.1)] text-[#F5F5F7] placeholder:text-[#86868B] text-sm focus:ring-[#FF5722] focus:border-[#FF5722] transition-all duration-200"
                    placeholder="Last name"
                  />
                </div>
              </div>

              {/* Mobile */}
              <div>
                <Label className="text-sm font-medium text-[#F5F5F7] mb-2 block">Mobile Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#86868B]" />
                  <Input
                    type="tel"
                    value={signMobile}
                    onChange={(e) => setSignMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="pl-10 h-11 rounded-xl bg-[rgba(255,255,255,0.06)] border-[rgba(255,255,255,0.1)] text-[#F5F5F7] placeholder:text-[#86868B] text-sm focus:ring-[#FF5722] focus:border-[#FF5722] transition-all duration-200"
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <Label className="text-sm font-medium text-[#F5F5F7] mb-2 block">Email (Optional)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#86868B]" />
                  <Input
                    type="email"
                    value={signEmail}
                    onChange={(e) => setSignEmail(e.target.value)}
                    className="pl-10 h-11 rounded-xl bg-[rgba(255,255,255,0.06)] border-[rgba(255,255,255,0.1)] text-[#F5F5F7] placeholder:text-[#86868B] text-sm focus:ring-[#FF5722] focus:border-[#FF5722] transition-all duration-200"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <Separator className="bg-[rgba(255,255,255,0.08)]" />

              {/* Password */}
              <div>
                <Label className="text-sm font-medium text-[#F5F5F7] mb-2 block">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#86868B]" />
                  <Input
                    type={showSignPassword ? 'text' : 'password'}
                    value={signPassword}
                    onChange={(e) => setSignPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 rounded-xl bg-[rgba(255,255,255,0.06)] border-[rgba(255,255,255,0.1)] text-[#F5F5F7] placeholder:text-[#86868B] text-sm focus:ring-[#FF5722] focus:border-[#FF5722] transition-all duration-200"
                    placeholder="Min 4 characters"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignPassword(!showSignPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#F5F5F7] transition-colors"
                  >
                    {showSignPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <Label className="text-sm font-medium text-[#F5F5F7] mb-2 block">Confirm Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#86868B]" />
                  <Input
                    type={showSignConfirm ? 'text' : 'password'}
                    value={signConfirmPassword}
                    onChange={(e) => setSignConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 rounded-xl bg-[rgba(255,255,255,0.06)] border-[rgba(255,255,255,0.1)] text-[#F5F5F7] placeholder:text-[#86868B] text-sm focus:ring-[#FF5722] focus:border-[#FF5722] transition-all duration-200"
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignConfirm(!showSignConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#F5F5F7] transition-colors"
                  >
                    {showSignConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={signLoading || !signFirstName.trim() || signMobile.length !== 10 || signPassword.length < 4 || signPassword !== signConfirmPassword}
                className="w-full h-12 bg-[#FF5722] hover:bg-[#E64A19] text-white rounded-xl text-sm font-bold btn-3d disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {signLoading ? (
                  <Loader2 className="size-4 animate-spin mr-2" />
                ) : (
                  <UserPlus className="size-4 mr-2" />
                )}
                Create Account
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="text-sm text-[#86868B] hover:text-[#F5F5F7] transition-colors"
                >
                  Already have an account?{' '}
                  <span className="text-[#FF5722] font-semibold hover:underline">Login</span>
                </button>
              </div>
            </form>
          )}

          {/* Terms */}
          <p className="text-center text-xs text-[#86868B] mt-6 leading-relaxed">
            By continuing, you agree to our{' '}
            <span className="text-[#F5F5F7] hover:underline cursor-pointer">Terms of Service</span>
            {' '}and{' '}
            <span className="text-[#F5F5F7] hover:underline cursor-pointer">Privacy Policy</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Standalone login page (for direct navigation)
export function LoginPage() {
  const { navigate } = useNavigation();
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="max-w-[440px] w-full">
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
