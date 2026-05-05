'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/stores/auth';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Loader2, Lock, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { loginAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !password) {
      toast.error('Please enter User ID and Password');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'admin-login', user_id: userId, password }),
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
        return;
      }
      loginAdmin(data.admin);
      toast.success('Welcome back!');
      router.push('/admin');
    } catch {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error('Please enter 6-digit code');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'admin-code-login', code }),
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
        return;
      }
      loginAdmin(data.admin);
      toast.success('Welcome back!');
      router.push('/admin');
    } catch {
      toast.error('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#FF5722]/[0.07] rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-[#FF2D55]/[0.05] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-[-150px] w-[300px] h-[300px] bg-[#FF5722]/[0.04] rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-gradient-to-r from-[#FF5722] to-[#FF2D55] shadow-[0_0_40px_rgba(255,87,34,0.25)]">
            <span className="text-white font-bold text-2xl">CF</span>
          </div>
          <h1 className="text-2xl font-semibold text-[#F5F5F7]">
            Cloth<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5722] to-[#FF2D55]">Fasion</span>{' '}
            Admin
          </h1>
          <p className="text-[#86868B] text-sm mt-1">Sign in to manage your store</p>
        </div>

        {/* Card */}
        <div className="bg-[#1D1D1F] border border-white/[0.08] rounded-2xl p-8 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
          <Tabs defaultValue="password">
            <TabsList className="w-full grid grid-cols-2 mb-6 bg-white/5 border border-white/[0.06] rounded-xl h-11">
              <TabsTrigger
                value="password"
                className="gap-2 rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-[#F5F5F7] text-white/40 data-[state=active]:shadow-none transition-all"
              >
                <Lock className="h-3.5 w-3.5" />
                Password
              </TabsTrigger>
              <TabsTrigger
                value="code"
                className="gap-2 rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-[#F5F5F7] text-white/40 data-[state=active]:shadow-none transition-all"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                6-Digit Code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="password">
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#F5F5F7] mb-1.5">
                    User ID / Name
                  </label>
                  <Input
                    placeholder="Enter your User ID or Name"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="h-11 bg-white/5 border-white/10 text-[#F5F5F7] placeholder:text-white/30 focus:border-[#FF5722]/50 focus:ring-[#FF5722]/20 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#F5F5F7] mb-1.5">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 bg-white/5 border-white/10 text-[#F5F5F7] placeholder:text-white/30 focus:border-[#FF5722]/50 focus:ring-[#FF5722]/20 rounded-xl"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-gradient-to-r from-[#FF5722] to-[#FF2D55] hover:from-[#FF6D3B] hover:to-[#FF4466] text-white font-medium rounded-xl border-0 shadow-[0_4px_20px_rgba(255,87,34,0.3)] transition-all"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Login
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="code">
              <form onSubmit={handleCodeLogin} className="space-y-6">
                <div className="text-center">
                  <p className="text-sm text-[#86868B] mb-4">
                    Enter your 6-digit verification code
                  </p>
                  <InputOTP maxLength={6} value={code} onChange={setCode}>
                    <InputOTPGroup>
                      <InputOTPSlot
                        index={0}
                        className="bg-white/5 border-white/10 text-[#F5F5F7] rounded-lg h-12 w-12"
                      />
                      <InputOTPSlot
                        index={1}
                        className="bg-white/5 border-white/10 text-[#F5F5F7] rounded-lg h-12 w-12"
                      />
                      <InputOTPSlot
                        index={2}
                        className="bg-white/5 border-white/10 text-[#F5F5F7] rounded-lg h-12 w-12"
                      />
                      <InputOTPSlot
                        index={3}
                        className="bg-white/5 border-white/10 text-[#F5F5F7] rounded-lg h-12 w-12"
                      />
                      <InputOTPSlot
                        index={4}
                        className="bg-white/5 border-white/10 text-[#F5F5F7] rounded-lg h-12 w-12"
                      />
                      <InputOTPSlot
                        index={5}
                        className="bg-white/5 border-white/10 text-[#F5F5F7] rounded-lg h-12 w-12"
                      />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <Button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="w-full h-11 bg-gradient-to-r from-[#FF5722] to-[#FF2D55] hover:from-[#FF6D3B] hover:to-[#FF4466] text-white font-medium rounded-xl border-0 shadow-[0_4px_20px_rgba(255,87,34,0.3)] transition-all disabled:opacity-50"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Demo hint */}
          <div className="mt-6 p-3 bg-white/5 border border-white/[0.06] rounded-xl">
            <p className="text-xs text-[#86868B] text-center">
              Demo credentials:{' '}
              <span className="font-medium text-[#F5F5F7]">admin</span> /{' '}
              <span className="font-medium text-[#F5F5F7]">admin123</span>
            </p>
          </div>
        </div>

        {/* Back to store link */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-sm text-[#86868B] hover:text-[#F5F5F7] transition-colors inline-flex items-center gap-1"
          >
            &larr; Back to Store
          </a>
        </div>
      </div>
    </div>
  );
}
