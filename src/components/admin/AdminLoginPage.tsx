'use client';

import React, { useState } from 'react';
import { useAuth } from '@/stores/auth';
import { useNavigation } from '@/stores/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { Loader2, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const { loginAdmin } = useAuth();
  const { navigate } = useNavigation();
  const [loading, setLoading] = useState(false);

  // Password login state
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  // Code login state
  const [code, setCode] = useState('');

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'admin-login', user_id: userId.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Login failed');
        return;
      }
      loginAdmin(data.admin);
      toast.success('Welcome back, ' + data.admin.name + '!');
      navigate('admin-dashboard');
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error('Please enter a 6-digit code');
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
      if (!res.ok) {
        toast.error(data.error || 'Invalid code');
        return;
      }
      loginAdmin(data.admin);
      toast.success('Welcome back, ' + data.admin.name + '!');
      navigate('admin-dashboard');
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#FF6A00] flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white font-[var(--font-poppins)]">Admin Panel</h1>
          <p className="text-gray-400 text-sm mt-1">ClothFasion Management System</p>
        </div>

        <Card className="rounded-2xl shadow-2xl border-0">
          <CardContent className="p-6">
            <Tabs defaultValue="password" className="w-full">
              <TabsList className="w-full grid grid-cols-2 mb-6">
                <TabsTrigger value="password" className="rounded-xl">Login with Password</TabsTrigger>
                <TabsTrigger value="code" className="rounded-xl">Login with 6-digit Code</TabsTrigger>
              </TabsList>

              {/* Password Tab */}
              <TabsContent value="password">
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="userId">User ID or Name</Label>
                    <Input
                      id="userId"
                      placeholder="Enter user ID or name"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="rounded-xl h-11"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 rounded-xl bg-[#111111] hover:bg-[#333333] text-white font-semibold"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      'Login'
                    )}
                  </Button>
                  <p className="text-xs text-center text-gray-400 mt-4">
                    Demo: admin / admin123
                  </p>
                </form>
              </TabsContent>

              {/* Code Tab */}
              <TabsContent value="code">
                <form onSubmit={handleCodeLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label>6-Digit Code</Label>
                    <div className="flex justify-center">
                      <InputOTP maxLength={6} value={code} onChange={setCode}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} className="h-12 w-12 rounded-xl" />
                          <InputOTPSlot index={1} className="h-12 w-12 rounded-xl" />
                          <InputOTPSlot index={2} className="h-12 w-12 rounded-xl" />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                          <InputOTPSlot index={3} className="h-12 w-12 rounded-xl" />
                          <InputOTPSlot index={4} className="h-12 w-12 rounded-xl" />
                          <InputOTPSlot index={5} className="h-12 w-12 rounded-xl" />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 rounded-xl bg-[#111111] hover:bg-[#333333] text-white font-semibold"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Login with Code'
                    )}
                  </Button>
                  <p className="text-xs text-center text-gray-400 mt-4">
                    Demo code: 000000
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-gray-500 text-xs mt-6">
          &copy; {new Date().getFullYear()} ClothFasion. All rights reserved.
        </p>
      </div>
    </div>
  );
}
