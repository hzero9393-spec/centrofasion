'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/stores/auth';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Store, Shield, Palette, Save, Plus, Loader2, Check, Sparkles } from 'lucide-react';

export default function AdminProfile() {
  const { admin } = useAuth();
  const [shopData, setShopData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Admin Info form
  const [adminForm, setAdminForm] = useState({ name: '', last_name: '', phone: '', avatar: '' });
  // Shop form
  const [shopForm, setShopForm] = useState({ shop_name: '', gst_no: '', shop_phone: '', owner_name: '', address: '', terms: '' });
  // Security form
  const [securityForm, setSecurityForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  // Create admin form
  const [newAdminForm, setNewAdminForm] = useState({ user_id: '', name: '', password: '' });

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch('/api/shop').then((r) => r.json()),
    ])
      .then(([data]) => {
        if (cancelled) return;
        setShopData(data);
        setShopForm({
          shop_name: data.shop_name || '',
          gst_no: data.gst_no || '',
          shop_phone: data.shop_phone || '',
          owner_name: data.owner_name || '',
          address: data.address || '',
          terms: data.terms || '',
        });
        if (admin) {
          setAdminForm({
            name: admin.name || '',
            last_name: admin.last_name || '',
            phone: admin.phone || '',
            avatar: admin.avatar || '',
          });
        }
        setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [admin]);

  const handleSaveAdmin = () => {
    toast.success('Admin info saved (local)');
  };

  const handleSaveShop = async () => {
    setSaving(true);
    try {
      await fetch('/api/shop', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shopForm),
      });
      toast.success('Shop details updated');
    } catch { toast.error('Failed to update shop details'); }
    setSaving(false);
  };

  const handleChangePassword = () => {
    if (!securityForm.currentPassword || !securityForm.newPassword || !securityForm.confirmPassword) {
      toast.error('All fields required');
      return;
    }
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    toast.success('Password changed (demo)');
    setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  // Theme cards with glow effects
  const themes = [
    { name: 'Sunset', colors: ['#FF5722', '#FF9800', '#FFC107', '#E64A19'], glow: '#FF5722' },
    { name: 'Ocean', colors: ['#0077B6', '#00B4D8', '#90E0EF', '#023E8A'], glow: '#0077B6' },
    { name: 'Forest', colors: ['#2D6A4F', '#40916C', '#52B788', '#1B4332'], glow: '#2D6A4F' },
    { name: 'Berry', colors: ['#7B2D8E', '#9D4EDD', '#C77DFF', '#5A189A'], glow: '#7B2D8E' },
    { name: 'Midnight', colors: ['#0A1B2A', '#1A2942', '#2A3F5A', '#0D2240'], glow: '#0A1B2A' },
    { name: 'Rose', colors: ['#E63946', '#F4845F', '#F7B267', '#D62828'], glow: '#E63946' },
    { name: 'Sage', colors: ['#606C38', '#8B9E6B', '#A3B18A', '#344E41'], glow: '#606C38' },
    { name: 'Coral', colors: ['#FF6B6B', '#FFA07A', '#FFD93D', '#C44569'], glow: '#FF6B6B' },
    { name: 'Slate', colors: ['#2D3436', '#636E72', '#B2BEC3', '#DFE6E9'], glow: '#636E72' },
    { name: 'Indigo', colors: ['#3F37C9', '#4895EF', '#4CC9F0', '#4361EE'], glow: '#3F37C9' },
    { name: 'Amber', colors: ['#E85D04', '#F48C06', '#FAA307', '#DC2F02'], glow: '#E85D04' },
    { name: 'Teal', colors: ['#0D9488', '#14B8A6', '#5EEAD4', '#0F766E'], glow: '#0D9488' },
  ];

  const inputClass = "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#FF5722]/50 focus:ring-[#FF5722]/20";
  const labelClass = "text-[#86868B] text-xs";

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40 bg-white/5 rounded-xl" />
        <Skeleton className="h-64 w-full bg-white/5 rounded-2xl" />
        <Skeleton className="h-48 w-full bg-white/5 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#F5F5F7] tracking-tight">My Profile</h1>
        <p className="text-sm text-[#86868B] mt-1">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="admin" className="space-y-6">
        <TabsList className="bg-white/5 border border-white/[0.08] rounded-xl p-1">
          <TabsTrigger value="admin" className="gap-2 rounded-lg text-[#86868B] data-[state=active]:bg-white/10 data-[state=active]:text-[#F5F5F7] data-[state=active]:shadow-sm">
            <User className="h-4 w-4" /> Admin Info
          </TabsTrigger>
          <TabsTrigger value="shop" className="gap-2 rounded-lg text-[#86868B] data-[state=active]:bg-white/10 data-[state=active]:text-[#F5F5F7] data-[state=active]:shadow-sm">
            <Store className="h-4 w-4" /> Shop Details
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 rounded-lg text-[#86868B] data-[state=active]:bg-white/10 data-[state=active]:text-[#F5F5F7] data-[state=active]:shadow-sm">
            <Shield className="h-4 w-4" /> Security
          </TabsTrigger>
          <TabsTrigger value="themes" className="gap-2 rounded-lg text-[#86868B] data-[state=active]:bg-white/10 data-[state=active]:text-[#F5F5F7] data-[state=active]:shadow-sm">
            <Palette className="h-4 w-4" /> Themes
          </TabsTrigger>
        </TabsList>

        {/* Admin Info */}
        <TabsContent value="admin">
          <Card className="bg-[#1D1D1F] border border-white/[0.08] rounded-2xl">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF5722] to-[#FF2D55] flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-[#FF5722]/20">
                  {admin?.name?.charAt(0) || 'A'}
                </div>
                <div>
                  <h3 className="font-semibold text-[#F5F5F7] text-lg">{admin?.name} {admin?.last_name || ''}</h3>
                  <Badge variant="secondary" className="bg-white/5 text-[#86868B] border border-white/10 mt-1">
                    {admin?.is_master === 1 ? 'Master Admin' : 'Admin'}
                  </Badge>
                </div>
              </div>

              <Separator className="bg-white/[0.05]" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className={labelClass}>First Name</Label>
                  <Input className={inputClass} value={adminForm.name} onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label className={labelClass}>Last Name</Label>
                  <Input className={inputClass} value={adminForm.last_name} onChange={(e) => setAdminForm({ ...adminForm, last_name: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label className={labelClass}>Phone</Label>
                  <Input className={inputClass} value={adminForm.phone} onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label className={labelClass}>Avatar URL</Label>
                  <Input className={inputClass} value={adminForm.avatar} onChange={(e) => setAdminForm({ ...adminForm, avatar: e.target.value })} />
                </div>
              </div>

              <Button onClick={handleSaveAdmin} className="bg-gradient-to-r from-[#FF5722] to-[#FF2D55] hover:opacity-90 text-white gap-2 transition-opacity">
                <Save className="h-4 w-4" /> Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Master Admin Section */}
          {admin?.is_master === 1 && (
            <Card className="bg-[#1D1D1F] border border-yellow-500/20 rounded-2xl mt-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent" />
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#F5F5F7]">Master Admin Panel</h3>
                    <p className="text-xs text-[#86868B]">Create and manage admin accounts</p>
                  </div>
                </div>
                <Separator className="bg-white/[0.05]" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label className={labelClass}>User ID</Label>
                    <Input className={inputClass} value={newAdminForm.user_id} onChange={(e) => setNewAdminForm({ ...newAdminForm, user_id: e.target.value })} placeholder="admin2" />
                  </div>
                  <div className="grid gap-2">
                    <Label className={labelClass}>Full Name</Label>
                    <Input className={inputClass} value={newAdminForm.name} onChange={(e) => setNewAdminForm({ ...newAdminForm, name: e.target.value })} placeholder="John Doe" />
                  </div>
                  <div className="grid gap-2">
                    <Label className={labelClass}>Password</Label>
                    <Input type="password" className={inputClass} value={newAdminForm.password} onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })} placeholder="••••••" />
                  </div>
                </div>
                <Button className="bg-gradient-to-r from-[#FF5722] to-[#FF2D55] hover:opacity-90 text-white gap-2 transition-opacity">
                  <Plus className="h-4 w-4" /> Create Admin
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Shop Details */}
        <TabsContent value="shop">
          <Card className="bg-[#1D1D1F] border border-white/[0.08] rounded-2xl">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <Store className="h-5 w-5 text-[#86868B]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#F5F5F7]">Shop Information</h3>
                  <p className="text-xs text-[#86868B]">These details appear on invoices and storefront</p>
                </div>
              </div>

              <Separator className="bg-white/[0.05]" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className={labelClass}>Shop Name</Label>
                  <Input className={inputClass} value={shopForm.shop_name} onChange={(e) => setShopForm({ ...shopForm, shop_name: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label className={labelClass}>GST Number</Label>
                  <Input className={inputClass} value={shopForm.gst_no} onChange={(e) => setShopForm({ ...shopForm, gst_no: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label className={labelClass}>Shop Phone</Label>
                  <Input className={inputClass} value={shopForm.shop_phone} onChange={(e) => setShopForm({ ...shopForm, shop_phone: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label className={labelClass}>Owner Name</Label>
                  <Input className={inputClass} value={shopForm.owner_name} onChange={(e) => setShopForm({ ...shopForm, owner_name: e.target.value })} />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label className={labelClass}>Address</Label>
                  <Input className={inputClass} value={shopForm.address} onChange={(e) => setShopForm({ ...shopForm, address: e.target.value })} />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label className={labelClass}>Terms & Conditions</Label>
                  <Textarea className={`${inputClass} resize-none`} value={shopForm.terms} onChange={(e) => setShopForm({ ...shopForm, terms: e.target.value })} rows={4} />
                </div>
              </div>
              <Button onClick={handleSaveShop} disabled={saving} className="bg-gradient-to-r from-[#FF5722] to-[#FF2D55] hover:opacity-90 text-white gap-2 transition-opacity disabled:opacity-50">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                <Save className="h-4 w-4" /> Save Shop Details
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <Card className="bg-[#1D1D1F] border border-white/[0.08] rounded-2xl">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-[#86868B]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#F5F5F7]">Security Settings</h3>
                  <p className="text-xs text-[#86868B]">Manage your account security</p>
                </div>
              </div>

              <Separator className="bg-white/[0.05]" />

              <div className="grid gap-2">
                <Label className={labelClass}>User ID (read-only)</Label>
                <Input value={admin?.user_id || ''} disabled className="bg-white/[0.03] border-white/[0.05] text-[#86868B] cursor-not-allowed" />
              </div>

              <Separator className="bg-white/[0.05]" />

              <h3 className="font-medium text-[#F5F5F7]">Change Password</h3>
              <div className="grid gap-4 max-w-sm">
                <div className="grid gap-2">
                  <Label className={labelClass}>Current Password</Label>
                  <Input type="password" className={inputClass} value={securityForm.currentPassword} onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label className={labelClass}>New Password</Label>
                  <Input type="password" className={inputClass} value={securityForm.newPassword} onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label className={labelClass}>Confirm New Password</Label>
                  <Input type="password" className={inputClass} value={securityForm.confirmPassword} onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })} />
                </div>
              </div>
              <Button onClick={handleChangePassword} className="bg-gradient-to-r from-[#FF5722] to-[#FF2D55] hover:opacity-90 text-white gap-2 transition-opacity">
                <Shield className="h-4 w-4" /> Update Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Themes */}
        <TabsContent value="themes">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {themes.map((theme) => (
              <Card
                key={theme.name}
                className="bg-[#1D1D1F] border border-white/[0.08] rounded-2xl hover:border-white/[0.15] transition-all duration-300 group cursor-pointer hover:shadow-lg"
                style={{ '--glow-color': theme.glow } as React.CSSProperties}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${theme.glow}15, 0 0 0 1px ${theme.glow}20`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                <CardContent className="p-4">
                  <div className="flex gap-1.5 mb-4">
                    {theme.colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-9 h-9 rounded-xl transition-transform duration-200 group-hover:scale-110 group-hover:-translate-y-0.5"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <p className="text-sm font-medium text-[#F5F5F7] group-hover:text-white transition-colors">{theme.name}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full text-xs bg-white/5 border-white/10 text-[#86868B] hover:bg-white/10 hover:text-white hover:border-white/20 transition-all"
                  >
                    Apply
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
