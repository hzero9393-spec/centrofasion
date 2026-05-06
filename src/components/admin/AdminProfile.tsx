'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/stores/auth';
import { useThemeStore, THEMES } from '@/stores/theme';
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
  const { activeThemeId, setActiveTheme } = useThemeStore();
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

  const handleApplyTheme = (themeId: string, themeName: string) => {
    setActiveTheme(themeId);
    toast.success(`${themeName} theme applied!`);
  };

  const inputClass = "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[var(--theme-primary)] focus:ring-[var(--theme-primary)]/20";
  const labelClass = "text-[var(--theme-text-muted)] text-xs";

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
        <h1 className="text-2xl font-semibold text-[var(--theme-text)] tracking-tight">My Profile</h1>
        <p className="text-sm text-[var(--theme-text-muted)] mt-1">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="admin" className="space-y-6">
        <TabsList className="bg-white/5 border border-white/[0.08] rounded-xl p-1">
          <TabsTrigger value="admin" className="gap-2 rounded-lg text-[var(--theme-text-muted)] data-[state=active]:bg-white/10 data-[state=active]:text-[var(--theme-text)] data-[state=active]:shadow-sm">
            <User className="h-4 w-4" /> Admin Info
          </TabsTrigger>
          <TabsTrigger value="shop" className="gap-2 rounded-lg text-[var(--theme-text-muted)] data-[state=active]:bg-white/10 data-[state=active]:text-[var(--theme-text)] data-[state=active]:shadow-sm">
            <Store className="h-4 w-4" /> Shop Details
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 rounded-lg text-[var(--theme-text-muted)] data-[state=active]:bg-white/10 data-[state=active]:text-[var(--theme-text)] data-[state=active]:shadow-sm">
            <Shield className="h-4 w-4" /> Security
          </TabsTrigger>
          <TabsTrigger value="themes" className="gap-2 rounded-lg text-[var(--theme-text-muted)] data-[state=active]:bg-white/10 data-[state=active]:text-[var(--theme-text)] data-[state=active]:shadow-sm">
            <Palette className="h-4 w-4" /> Themes
          </TabsTrigger>
        </TabsList>

        {/* Admin Info */}
        <TabsContent value="admin">
          <Card className="bg-[var(--theme-card)] border border-white/[0.08] rounded-2xl">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-secondary)] flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-[var(--theme-primary)]/20">
                  {admin?.name?.charAt(0) || 'A'}
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--theme-text)] text-lg">{admin?.name} {admin?.last_name || ''}</h3>
                  <Badge variant="secondary" className="bg-white/5 text-[var(--theme-text-muted)] border border-white/10 mt-1">
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

              <Button onClick={handleSaveAdmin} className="bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] hover:opacity-90 text-white gap-2 transition-opacity">
                <Save className="h-4 w-4" /> Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Master Admin Section */}
          {admin?.is_master === 1 && (
            <Card className="bg-[var(--theme-card)] border border-yellow-500/20 rounded-2xl mt-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent" />
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--theme-text)]">Master Admin Panel</h3>
                    <p className="text-xs text-[var(--theme-text-muted)]">Create and manage admin accounts</p>
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
                <Button className="bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] hover:opacity-90 text-white gap-2 transition-opacity">
                  <Plus className="h-4 w-4" /> Create Admin
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Shop Details */}
        <TabsContent value="shop">
          <Card className="bg-[var(--theme-card)] border border-white/[0.08] rounded-2xl">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <Store className="h-5 w-5 text-[var(--theme-text-muted)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--theme-text)]">Shop Information</h3>
                  <p className="text-xs text-[var(--theme-text-muted)]">These details appear on invoices and storefront</p>
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
              <Button onClick={handleSaveShop} disabled={saving} className="bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] hover:opacity-90 text-white gap-2 transition-opacity disabled:opacity-50">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                <Save className="h-4 w-4" /> Save Shop Details
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <Card className="bg-[var(--theme-card)] border border-white/[0.08] rounded-2xl">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-[var(--theme-text-muted)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--theme-text)]">Security Settings</h3>
                  <p className="text-xs text-[var(--theme-text-muted)]">Manage your account security</p>
                </div>
              </div>

              <Separator className="bg-white/[0.05]" />

              <div className="grid gap-2">
                <Label className={labelClass}>User ID (read-only)</Label>
                <Input value={admin?.user_id || ''} disabled className="bg-white/[0.03] border-white/[0.05] text-[var(--theme-text-muted)] cursor-not-allowed" />
              </div>

              <Separator className="bg-white/[0.05]" />

              <h3 className="font-medium text-[var(--theme-text)]">Change Password</h3>
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
              <Button onClick={handleChangePassword} className="bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] hover:opacity-90 text-white gap-2 transition-opacity">
                <Shield className="h-4 w-4" /> Update Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Themes */}
        <TabsContent value="themes">
          <div className="mb-4">
            <p className="text-sm text-[var(--theme-text-muted)]">Choose a color theme for your store. Changes apply to both admin & customer side.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {THEMES.map((theme) => {
              const isActive = activeThemeId === theme.id;
              return (
                <Card
                  key={theme.id}
                  className={`bg-[var(--theme-card)] rounded-2xl transition-all duration-300 group cursor-pointer hover:shadow-lg ${isActive ? 'border-2 shadow-lg' : 'border border-white/[0.08] hover:border-white/[0.15]'}`}
                  style={isActive ? { borderColor: theme.colors.primary, boxShadow: `0 8px 32px ${theme.colors.primary}30` } : { '--glow-color': theme.colors.primary } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${theme.colors.primary}15, 0 0 0 1px ${theme.colors.primary}20`;
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-1.5 mb-4">
                      {theme.preview.map((color, i) => (
                        <div
                          key={i}
                          className="w-9 h-9 rounded-xl transition-transform duration-200 group-hover:scale-110 group-hover:-translate-y-0.5"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[var(--theme-text)] group-hover:text-white transition-colors">{theme.name}</p>
                      {isActive && (
                        <div className="w-5 h-5 rounded-full bg-[#28A745] flex items-center justify-center">
                          <Check className="size-3 text-white" />
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => handleApplyTheme(theme.id, theme.name)}
                      variant="outline"
                      size="sm"
                      className={`mt-3 w-full text-xs transition-all ${isActive
                        ? 'text-white border-transparent'
                        : 'bg-white/5 border-white/10 text-[var(--theme-text-muted)] hover:bg-white/10 hover:text-white hover:border-white/20'
                      }`}
                      style={isActive ? { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary } : {}}
                    >
                      {isActive ? 'Active' : 'Apply'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
