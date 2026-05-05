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
import { User, Store, Shield, Palette, Save, Plus, Loader2 } from 'lucide-react';

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

  // Theme cards
  const themes = [
    { name: 'Sunset', colors: ['#FF5722', '#FF9800', '#FFC107', '#E64A19'] },
    { name: 'Ocean', colors: ['#0077B6', '#00B4D8', '#90E0EF', '#023E8A'] },
    { name: 'Forest', colors: ['#2D6A4F', '#40916C', '#52B788', '#1B4332'] },
    { name: 'Berry', colors: ['#7B2D8E', '#9D4EDD', '#C77DFF', '#5A189A'] },
    { name: 'Midnight', colors: ['#0A1B2A', '#1A2942', '#2A3F5A', '#0D2240'] },
    { name: 'Rose', colors: ['#E63946', '#F4845F', '#F7B267', '#D62828'] },
    { name: 'Sage', colors: ['#606C38', '#8B9E6B', '#A3B18A', '#344E41'] },
    { name: 'Coral', colors: ['#FF6B6B', '#FFA07A', '#FFD93D', '#C44569'] },
    { name: 'Slate', colors: ['#2D3436', '#636E72', '#B2BEC3', '#DFE6E9'] },
    { name: 'Indigo', colors: ['#3F37C9', '#4895EF', '#4CC9F0', '#4361EE'] },
    { name: 'Amber', colors: ['#E85D04', '#F48C06', '#FAA307', '#DC2F02'] },
    { name: 'Teal', colors: ['#0D9488', '#14B8A6', '#5EEAD4', '#0F766E'] },
  ];

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-64 w-full" /><Skeleton className="h-48 w-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-[#1F2A3A]">My Profile</h1>

      <Tabs defaultValue="admin" className="space-y-4">
        <TabsList>
          <TabsTrigger value="admin" className="gap-2"><User className="h-4 w-4" /> Admin Info</TabsTrigger>
          <TabsTrigger value="shop" className="gap-2"><Store className="h-4 w-4" /> Shop Details</TabsTrigger>
          <TabsTrigger value="security" className="gap-2"><Shield className="h-4 w-4" /> Security</TabsTrigger>
          <TabsTrigger value="themes" className="gap-2"><Palette className="h-4 w-4" /> Themes</TabsTrigger>
        </TabsList>

        {/* Admin Info */}
        <TabsContent value="admin">
          <Card className="border-[#E4E7EC]">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-[#FF5722] flex items-center justify-center text-white text-xl font-bold">
                  {admin?.name?.charAt(0) || 'A'}
                </div>
                <div>
                  <h3 className="font-semibold text-[#1F2A3A]">{admin?.name} {admin?.last_name || ''}</h3>
                  <Badge variant="secondary" className="bg-[#F5F7FA] text-[#5A6B7F]">
                    {admin?.is_master === 1 ? 'Master Admin' : 'Admin'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>First Name</Label>
                  <Input value={adminForm.name} onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Last Name</Label>
                  <Input value={adminForm.last_name} onChange={(e) => setAdminForm({ ...adminForm, last_name: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Phone</Label>
                  <Input value={adminForm.phone} onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Avatar URL</Label>
                  <Input value={adminForm.avatar} onChange={(e) => setAdminForm({ ...adminForm, avatar: e.target.value })} />
                </div>
              </div>

              <Button onClick={handleSaveAdmin} className="bg-[#FF5722] hover:bg-[#E64A19] text-white gap-2">
                <Save className="h-4 w-4" /> Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Master Admin Section */}
          {admin?.is_master === 1 && (
            <Card className="border-[#FFC107]/30 bg-[#FFFDF5] mt-4">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-[#1F2A3A]">Master Admin Panel</h3>
                <Separator />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label>User ID</Label>
                    <Input value={newAdminForm.user_id} onChange={(e) => setNewAdminForm({ ...newAdminForm, user_id: e.target.value })} placeholder="admin2" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Full Name</Label>
                    <Input value={newAdminForm.name} onChange={(e) => setNewAdminForm({ ...newAdminForm, name: e.target.value })} placeholder="John Doe" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Password</Label>
                    <Input type="password" value={newAdminForm.password} onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })} placeholder="••••••" />
                  </div>
                </div>
                <Button className="bg-[#FF5722] hover:bg-[#E64A19] text-white gap-2">
                  <Plus className="h-4 w-4" /> Create Admin
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Shop Details */}
        <TabsContent value="shop">
          <Card className="border-[#E4E7EC]">
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Shop Name</Label>
                  <Input value={shopForm.shop_name} onChange={(e) => setShopForm({ ...shopForm, shop_name: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>GST Number</Label>
                  <Input value={shopForm.gst_no} onChange={(e) => setShopForm({ ...shopForm, gst_no: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Shop Phone</Label>
                  <Input value={shopForm.shop_phone} onChange={(e) => setShopForm({ ...shopForm, shop_phone: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Owner Name</Label>
                  <Input value={shopForm.owner_name} onChange={(e) => setShopForm({ ...shopForm, owner_name: e.target.value })} />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label>Address</Label>
                  <Input value={shopForm.address} onChange={(e) => setShopForm({ ...shopForm, address: e.target.value })} />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label>Terms & Conditions</Label>
                  <Textarea value={shopForm.terms} onChange={(e) => setShopForm({ ...shopForm, terms: e.target.value })} rows={4} />
                </div>
              </div>
              <Button onClick={handleSaveShop} disabled={saving} className="bg-[#FF5722] hover:bg-[#E64A19] text-white gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                <Save className="h-4 w-4" /> Save Shop Details
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <Card className="border-[#E4E7EC]">
            <CardContent className="p-6 space-y-4">
              <div className="grid gap-2">
                <Label>User ID (read-only)</Label>
                <Input value={admin?.user_id || ''} disabled className="bg-[#F5F7FA]" />
              </div>
              <Separator />
              <h3 className="font-medium text-[#1F2A3A]">Change Password</h3>
              <div className="grid gap-4 max-w-sm">
                <div className="grid gap-2">
                  <Label>Current Password</Label>
                  <Input type="password" value={securityForm.currentPassword} onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>New Password</Label>
                  <Input type="password" value={securityForm.newPassword} onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Confirm New Password</Label>
                  <Input type="password" value={securityForm.confirmPassword} onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })} />
                </div>
              </div>
              <Button onClick={handleChangePassword} className="bg-[#FF5722] hover:bg-[#E64A19] text-white gap-2">
                <Shield className="h-4 w-4" /> Update Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Themes */}
        <TabsContent value="themes">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {themes.map((theme) => (
              <Card key={theme.name} className="border-[#E4E7EC] shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex gap-2 mb-3">
                    {theme.colors.map((color, i) => (
                      <div key={i} className="w-8 h-8 rounded-lg" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  <p className="text-sm font-medium text-[#1F2A3A]">{theme.name}</p>
                  <Button variant="outline" size="sm" className="mt-3 w-full text-xs border-[#FF5722] text-[#FF5722] hover:bg-[#FFF3E0]">
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
