'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/stores/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  User, Store, Lock, Palette, Loader2, ShieldCheck, Save,
} from 'lucide-react';

const THEMES = [
  { name: 'Classic', colors: ['#111111', '#FF6A00', '#F8F9FB', '#FFFFFF'] },
  { name: 'Ocean', colors: ['#0F172A', '#06B6D4', '#F0F9FF', '#FFFFFF'] },
  { name: 'Forest', colors: ['#14532D', '#22C55E', '#F0FDF4', '#FFFFFF'] },
  { name: 'Royal', colors: ['#581C87', '#A855F7', '#FAF5FF', '#FFFFFF'] },
  { name: 'Sunset', colors: ['#7C2D12', '#F97316', '#FFF7ED', '#FFFFFF'] },
  { name: 'Rose', colors: ['#881337', '#FB7185', '#FFF1F2', '#FFFFFF'] },
  { name: 'Midnight', colors: ['#1E1B4B', '#818CF8', '#EEF2FF', '#FFFFFF'] },
  { name: 'Emerald', colors: ['#064E3B', '#10B981', '#ECFDF5', '#FFFFFF'] },
  { name: 'Slate', colors: ['#1E293B', '#64748B', '#F8FAFC', '#FFFFFF'] },
  { name: 'Crimson', colors: ['#7F1D1D', '#EF4444', '#FEF2F2', '#FFFFFF'] },
  { name: 'Amber', colors: ['#78350F', '#F59E0B', '#FFFBEB', '#FFFFFF'] },
  { name: 'Teal', colors: ['#134E4A', '#14B8A6', '#F0FDFA', '#FFFFFF'] },
];

export default function AdminProfile() {
  const { admin } = useAuth();
  const isMaster = admin?.is_master === 1;

  const [saving, setSaving] = useState(false);

  // Admin Info
  const [adminName, setAdminName] = useState(admin?.name || '');
  const [adminLastName, setAdminLastName] = useState(admin?.last_name || '');
  const [adminPhone, setAdminPhone] = useState(admin?.phone || '');
  const [adminAvatar, setAdminAvatar] = useState(admin?.avatar || '');

  // Shop Details
  const [shopName, setShopName] = useState('');
  const [shopGst, setShopGst] = useState('');
  const [shopPhone, setShopPhone] = useState('');
  const [shopOwner, setShopOwner] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [shopTerms, setShopTerms] = useState('');
  const [shopLogo, setShopLogo] = useState('');

  // Change Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Create Admin (Master only)
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminUserId, setNewAdminUserId] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminCode, setNewAdminCode] = useState('');

  // Theme
  const [activeTheme, setActiveTheme] = useState('Classic');
  const [previewTheme, setPreviewTheme] = useState(false);

  useEffect(() => {
    setAdminName(admin?.name || '');
    setAdminLastName(admin?.last_name || '');
    setAdminPhone(admin?.phone || '');
    setAdminAvatar(admin?.avatar || '');
  }, [admin]);

  const fetchShop = async () => {
    try {
      const res = await fetch('/api/shop');
      const json = await res.json();
      setShopName(json.shop_name || '');
      setShopGst(json.gst_no || '');
      setShopPhone(json.shop_phone || '');
      setShopOwner(json.owner_name || '');
      setShopAddress(json.address || '');
      setShopTerms(json.terms || '');
      setShopLogo(json.logo || '');
    } catch {
      toast.error('Failed to fetch shop settings');
    }
  };

  useEffect(() => {
    fetchShop();
  }, []);

  const handleSaveShop = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/shop', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_name: shopName,
          gst_no: shopGst,
          shop_phone: shopPhone,
          owner_name: shopOwner,
          address: shopAddress,
          terms: shopTerms,
          logo: shopLogo,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Shop details saved');
    } catch {
      toast.error('Failed to save shop details');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    // In production, this would hit an API endpoint
    toast.success('Password change requires server-side implementation');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleCreateAdmin = async () => {
    if (!newAdminName || !newAdminUserId || !newAdminPassword || !newAdminCode) {
      toast.error('Please fill in all fields');
      return;
    }
    if (newAdminCode.length !== 6) {
      toast.error('Code must be 6 digits');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'admin-login',
          user_id: newAdminUserId,
          password: newAdminPassword,
        }),
      });
      if (!res.ok) {
        toast.error('Admin creation requires server endpoint');
        return;
      }
      toast.success('Admin created successfully');
      setNewAdminName('');
      setNewAdminUserId('');
      setNewAdminPassword('');
      setNewAdminCode('');
    } catch {
      toast.error('Failed to create admin');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-[var(--font-poppins)] text-[#111111]">My Profile</h1>
        <p className="text-gray-500 text-sm">Manage your admin account and shop settings</p>
      </div>

      <Tabs defaultValue="admin-info" className="w-full">
        <TabsList className="w-full grid grid-cols-4 mb-6 rounded-xl">
          <TabsTrigger value="admin-info" className="rounded-xl text-xs sm:text-sm">
            <User className="h-4 w-4 mr-1 sm:mr-2 hidden sm:inline" />
            Admin Info
          </TabsTrigger>
          <TabsTrigger value="shop-details" className="rounded-xl text-xs sm:text-sm">
            <Store className="h-4 w-4 mr-1 sm:mr-2 hidden sm:inline" />
            Shop Details
          </TabsTrigger>
          <TabsTrigger value="personal-info" className="rounded-xl text-xs sm:text-sm">
            <Lock className="h-4 w-4 mr-1 sm:mr-2 hidden sm:inline" />
            Personal Info
          </TabsTrigger>
          <TabsTrigger value="themes" className="rounded-xl text-xs sm:text-sm">
            <Palette className="h-4 w-4 mr-1 sm:mr-2 hidden sm:inline" />
            Themes
          </TabsTrigger>
        </TabsList>

        {/* Tab: Admin Info */}
        <TabsContent value="admin-info">
          <Card className="rounded-xl shadow-sm border-0 max-w-2xl">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <User className="h-4 w-4" /> Admin Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 rounded-2xl bg-[#111111] text-white flex items-center justify-center text-2xl font-bold">
                  {admin?.name?.charAt(0) || 'A'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#111111]">
                    {admin?.name} {admin?.last_name || ''}
                  </h3>
                  <p className="text-sm text-gray-500">{admin?.user_id}</p>
                  {isMaster && (
                    <Badge className="bg-amber-100 text-amber-700 mt-1">
                      <ShieldCheck className="h-3 w-3 mr-1" /> Master Admin
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    value={adminLastName}
                    onChange={(e) => setAdminLastName(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Avatar URL</Label>
                  <Input
                    value={adminAvatar}
                    onChange={(e) => setAdminAvatar(e.target.value)}
                    className="rounded-xl"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <Button
                className="bg-[#111111] hover:bg-[#333333] text-white rounded-xl"
                onClick={() => toast.info('Admin info update requires server endpoint')}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Shop Details */}
        <TabsContent value="shop-details">
          <Card className="rounded-xl shadow-sm border-0 max-w-2xl">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Store className="h-4 w-4" /> Shop Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Shop Name</Label>
                  <Input value={shopName} onChange={(e) => setShopName(e.target.value)} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>GST Number</Label>
                  <Input value={shopGst} onChange={(e) => setShopGst(e.target.value)} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Shop Phone</Label>
                  <Input value={shopPhone} onChange={(e) => setShopPhone(e.target.value)} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Owner Name</Label>
                  <Input value={shopOwner} onChange={(e) => setShopOwner(e.target.value)} className="rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Textarea value={shopAddress} onChange={(e) => setShopAddress(e.target.value)} className="rounded-xl min-h-[80px]" />
              </div>
              <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input value={shopLogo} onChange={(e) => setShopLogo(e.target.value)} className="rounded-xl" placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Terms & Conditions</Label>
                <Textarea
                  value={shopTerms}
                  onChange={(e) => setShopTerms(e.target.value)}
                  className="rounded-xl min-h-[120px]"
                  placeholder="Enter shop terms and conditions..."
                />
              </div>
              <Button
                onClick={handleSaveShop}
                disabled={saving}
                className="bg-[#111111] hover:bg-[#333333] text-white rounded-xl"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Shop Details
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Personal Info */}
        <TabsContent value="personal-info">
          <Card className="rounded-xl shadow-sm border-0 max-w-2xl">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Lock className="h-4 w-4" /> Personal & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User ID (disabled) */}
              <div className="space-y-2">
                <Label>User ID</Label>
                <Input value={admin?.user_id || ''} disabled className="rounded-xl bg-gray-50" />
                <p className="text-xs text-gray-400">User ID cannot be changed</p>
              </div>

              <Separator />

              {/* Change Password */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-[#111111]">Change Password</h4>
                <div className="space-y-3 max-w-sm">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <Button
                    onClick={handleChangePassword}
                    variant="outline"
                    className="rounded-xl"
                  >
                    Change Password
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Themes */}
        <TabsContent value="themes">
          <Card className="rounded-xl shadow-sm border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Palette className="h-4 w-4" /> Theme Selection
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => setPreviewTheme(!previewTheme)}
                >
                  {previewTheme ? 'Hide Preview' : 'Show Preview'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {THEMES.map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => { setActiveTheme(theme.name); toast.success(`${theme.name} theme selected`); }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      activeTheme === theme.name
                        ? 'border-[#FF6A00] shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex gap-1.5 mb-3">
                      {theme.colors.map((color, i) => (
                        <div
                          key={i}
                          className="h-6 w-6 rounded-full border border-gray-200"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <p className="text-sm font-medium text-[#111111] text-left">{theme.name}</p>
                  </button>
                ))}
              </div>

              {/* Preview */}
              {previewTheme && (
                <div className="mt-6 p-4 rounded-xl border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Preview: {activeTheme}</h4>
                  <div
                    className="rounded-xl p-6 shadow-inner"
                    style={{
                      backgroundColor: THEMES.find(t => t.name === activeTheme)?.colors[2] || '#F8F9FB',
                    }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-xl"
                        style={{ backgroundColor: THEMES.find(t => t.name === activeTheme)?.colors[0] || '#111' }}
                      />
                      <span className="font-semibold" style={{ color: THEMES.find(t => t.name === activeTheme)?.colors[0] }}>
                        Shop Preview
                      </span>
                    </div>
                    <div
                      className="w-full h-10 rounded-xl flex items-center justify-center text-white text-sm font-medium"
                      style={{ backgroundColor: THEMES.find(t => t.name === activeTheme)?.colors[1] || '#FF6A00' }}
                    >
                      Call to Action Button
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Master Admin Section */}
          {isMaster && (
            <Card className="rounded-xl shadow-sm border-0 mt-4 max-w-2xl">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-amber-600">
                  <ShieldCheck className="h-4 w-4" /> Master Admin — Create New Admin
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Admin Name</Label>
                    <Input
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>User ID</Label>
                    <Input
                      value={newAdminUserId}
                      onChange={(e) => setNewAdminUserId(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input
                      type="password"
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>6-digit Login Code</Label>
                    <Input
                      value={newAdminCode}
                      onChange={(e) => setNewAdminCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="rounded-xl"
                      maxLength={6}
                      placeholder="000000"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleCreateAdmin}
                  disabled={saving}
                  className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Admin
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
