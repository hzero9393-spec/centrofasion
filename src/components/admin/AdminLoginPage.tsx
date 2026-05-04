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
    <div className="min-h-screen bg-[#0A1B2A] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
        backgroundSize: '40px 40px',
      }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#FF5722]/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FF5722] rounded-2xl mb-4 shadow-lg shadow-[#FF5722]/20">
            <span className="text-white font-bold text-2xl">CF</span>
          </div>
          <h1 className="text-2xl font-semibold text-white">
            Cloth<span className="text-[#FF5722]">Fasion</span> Admin
          </h1>
          <p className="text-[#CBD5E1] text-sm mt-1">Sign in to manage your store</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <Tabs defaultValue="password">
            <TabsList className="w-full grid grid-cols-2 mb-6">
              <TabsTrigger value="password" className="gap-2">
                <Lock className="h-3.5 w-3.5" />
                Password
              </TabsTrigger>
              <TabsTrigger value="code" className="gap-2">
                <ShieldCheck className="h-3.5 w-3.5" />
                6-Digit Code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="password">
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1F2A3A] mb-1.5">User ID / Name</label>
                  <Input
                    placeholder="Enter your User ID or Name"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1F2A3A] mb-1.5">Password</label>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-[#FF5722] hover:bg-[#E64A19] text-white font-medium rounded-xl"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Login
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="code">
              <form onSubmit={handleCodeLogin} className="space-y-6">
                <div className="text-center">
                  <p className="text-sm text-[#5A6B7F] mb-4">Enter your 6-digit verification code</p>
                  <InputOTP maxLength={6} value={code} onChange={setCode}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <Button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="w-full h-11 bg-[#FF5722] hover:bg-[#E64A19] text-white font-medium rounded-xl"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Demo hint */}
          <div className="mt-6 p-3 bg-[#F5F7FA] rounded-xl">
            <p className="text-xs text-[#5A6B7F] text-center">
              Demo credentials: <span className="font-medium text-[#1F2A3A]">admin</span> / <span className="font-medium text-[#1F2A3A]">admin123</span>
            </p>
          </div>
        </div>

        {/* Back to store link */}
        <div className="text-center mt-6">
          <a href="/" className="text-sm text-[#CBD5E1] hover:text-white transition-colors">
            &larr; Back to Store
          </a>
        </div>
      </div>
    </div>
  );
}
