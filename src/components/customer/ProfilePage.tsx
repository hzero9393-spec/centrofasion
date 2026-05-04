'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation } from '@/stores/navigation';
import { useAuth, type Customer } from '@/stores/auth';
import { useCart } from '@/stores/cart';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  User,
  Package,
  Heart,
  RotateCcw,
  Settings,
  LogOut,
  ChevronLeft,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  ShoppingBag,
  ArrowRight,
  Loader2,
  MapPin,
  Phone,
  Save,
  Shield,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  address?: string;
  pincode?: string;
}

interface WishlistItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  image: string;
  created_at: string;
}

interface ReturnItem {
  id: string;
  order_id: string;
  product_name: string;
  reason: string;
  status: string;
  created_at: string;
}

const statusOrder = ['Pending', 'Confirmed', 'Packing', 'Shipping', 'Delivered'];
const statusColors: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  Packing: 'bg-indigo-100 text-indigo-800',
  Shipping: 'bg-pink-100 text-pink-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
  Returned: 'bg-purple-100 text-purple-800',
};

const statusSteps = ['Pending', 'Confirmed', 'Packing', 'Shipping', 'Delivered'];

export default function ProfilePage() {
  const { navigate, goBack } = useNavigation();
  const { customer, isCustomerLoggedIn, logoutCustomer } = useAuth();
  const { addItem } = useCart();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Data
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [profileData, setProfileData] = useState<Customer | null>(null);

  // Edit states
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', address: '', pincode: '' });
  const [pinForm, setPinForm] = useState({ oldPin: '', newPin: '', confirmPin: '' });
  const [saving, setSaving] = useState(false);
  const [changePinOpen, setChangePinOpen] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnOrderId, setReturnOrderId] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [orderFilter, setOrderFilter] = useState('All');

  useEffect(() => {
    if (!isCustomerLoggedIn()) {
      navigate('login');
      return;
    }
  }, [isCustomerLoggedIn, navigate]);

  const fetchAllData = useCallback(async () => {
    if (!customer?.id) return;
    setLoading(true);
    try {
      const [ordersRes, wishlistRes, returnsRes, profileRes] = await Promise.all([
        fetch(`/api/orders?customer_id=${customer.id}&limit=100`),
        fetch(`/api/wishlist?customer_id=${customer.id}`),
        fetch(`/api/returns?customer_id=${customer.id}`),
        fetch(`/api/customers?id=${customer.id}`),
      ]);
      const [ordersData, wishlistData, returnsData, profileData] = await Promise.all([
        ordersRes.json(),
        wishlistRes.json(),
        returnsRes.json(),
        profileRes.json(),
      ]);
      setOrders(ordersData.orders || []);
      setWishlist(Array.isArray(wishlistData) ? wishlistData : []);
      setReturns(Array.isArray(returnsData) ? returnsData : []);
      if (profileData.customer) {
        setProfileData(profileData.customer);
        setEditForm({
          first_name: profileData.customer.first_name || '',
          last_name: profileData.customer.last_name || '',
          address: profileData.customer.address || '',
          pincode: profileData.customer.pincode || '',
        });
      }
    } catch (err) {
      console.error('Failed to fetch profile data:', err);
    } finally {
      setLoading(false);
    }
  }, [customer?.id]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleSaveProfile = async () => {
    if (!customer?.id) return;
    setSaving(true);
    try {
      await fetch('/api/customers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: customer.id, ...editForm }),
      });
      toast.success('Profile updated successfully');
      setEditMode(false);
      fetchAllData();
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePin = async () => {
    if (pinForm.newPin.length !== 6) {
      toast.error('PIN must be 6 digits');
      return;
    }
    if (pinForm.newPin !== pinForm.confirmPin) {
      toast.error('PINs do not match');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'customer-login',
          mobile: customer?.mobile,
          pin: pinForm.oldPin,
        }),
      });
      const data = await res.json();
      if (!data.customer) {
        toast.error('Current PIN is incorrect');
        setSaving(false);
        return;
      }
      await fetch('/api/customers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: customer!.id, pin: pinForm.newPin }),
      });
      toast.success('PIN changed successfully');
      setChangePinOpen(false);
      setPinForm({ oldPin: '', newPin: '', confirmPin: '' });
    } catch {
      toast.error('Failed to change PIN');
    } finally {
      setSaving(false);
    }
  };

  const handleReturn = async () => {
    if (!returnReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }
    setSaving(true);
    try {
      const order = orders.find((o) => o.id === returnOrderId);
      await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: returnOrderId,
          customer_id: customer!.id,
          product_name: order?.order_number || 'Product',
          reason: returnReason,
        }),
      });
      toast.success('Return request submitted');
      setReturnDialogOpen(false);
      setReturnReason('');
      fetchAllData();
    } catch {
      toast.error('Failed to submit return');
    } finally {
      setSaving(false);
    }
  };

  const handleMoveToCart = (item: WishlistItem) => {
    addItem({
      id: `${item.product_id}-OS-Default`,
      product_id: item.product_id,
      name: item.name,
      price: item.price,
      image: item.image,
      size: 'OS',
      color: 'Default',
      quantity: 1,
    });
    toast.success(`${item.name} added to cart`);
  };

  const handleRemoveFromWishlist = async (item: WishlistItem) => {
    try {
      await fetch(`/api/wishlist?id=${item.id}`, { method: 'DELETE' });
      setWishlist((prev) => prev.filter((w) => w.id !== item.id));
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove');
    }
  };

  const handleLogout = () => {
    logoutCustomer();
    toast.success('Logged out successfully');
    navigate('home');
  };

  if (!isCustomerLoggedIn() || !customer) return null;

  const stats = {
    delivered: orders.filter((o) => o.status === 'Delivered').length,
    returned: orders.filter((o) => o.status === 'Returned').length,
    cancelled: orders.filter((o) => o.status === 'Cancelled').length,
    pending: orders.filter((o) => ['Pending', 'Confirmed', 'Packing', 'Shipping'].includes(o.status)).length,
  };

  const chartData = [
    { name: 'Delivered', value: stats.delivered, color: '#22C55E' },
    { name: 'Pending', value: stats.pending, color: '#EAB308' },
    { name: 'Returned', value: stats.returned, color: '#A855F7' },
    { name: 'Cancelled', value: stats.cancelled, color: '#EF4444' },
  ];

  const filteredOrders = orderFilter === 'All'
    ? orders
    : orders.filter((o) => o.status === orderFilter);

  const getProgressWidth = (status: string) => {
    const idx = statusSteps.indexOf(status);
    return idx >= 0 ? ((idx + 1) / statusSteps.length) * 100 : 0;
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: User },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'returns', label: 'Returns', icon: RotateCcw },
    { id: 'personal', label: 'Personal Details', icon: MapPin },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <div className="md:col-span-3 space-y-4">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-8">
      {/* Back */}
      <button
        onClick={goBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#111] mb-6 transition-colors"
      >
        <ChevronLeft className="size-4" />
        Back
      </button>

      {/* Mobile tab bar */}
      <div className="flex overflow-x-auto gap-1 mb-6 md:hidden pb-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === item.id
                  ? 'bg-[#FF6A00]/10 text-[#FF6A00]'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Icon className="size-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="sticky top-24 bg-white rounded-xl border border-border/50 shadow-sm overflow-hidden">
            {/* User card */}
            <div className="p-5 border-b">
              <div className="flex items-center gap-3">
                <Avatar className="size-12 rounded-full">
                  <AvatarImage src={customer.avatar || undefined} />
                  <AvatarFallback className="bg-[#FF6A00]/10 text-[#FF6A00] font-semibold">
                    {customer.first_name?.[0]}{customer.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#111] truncate">
                    {customer.first_name} {customer.last_name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{customer.mobile}</p>
                </div>
              </div>
            </div>
            <nav className="p-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === item.id
                        ? 'bg-[#FF6A00]/10 text-[#FF6A00]'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="size-4" />
                    {item.label}
                    {item.id === 'orders' && orders.length > 0 && (
                      <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 h-5 min-w-5 flex items-center justify-center rounded-full">
                        {orders.length}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h2 className="font-[family-name:var(--font-poppins)] text-xl font-bold text-[#111]">
                Dashboard
              </h2>
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Delivered', value: stats.delivered, icon: CheckCircle, color: 'text-green-500 bg-green-50' },
                  { label: 'In Progress', value: stats.pending, icon: Clock, color: 'text-amber-500 bg-amber-50' },
                  { label: 'Returned', value: stats.returned, icon: RotateCcw, color: 'text-purple-500 bg-purple-50' },
                  { label: 'Cancelled', value: stats.cancelled, icon: XCircle, color: 'text-red-500 bg-red-50' },
                ].map((s) => (
                  <Card key={s.label} className="border-border/50">
                    <CardContent className="p-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                        <s.icon className="size-5" />
                      </div>
                      <p className="text-2xl font-bold text-[#111]">{s.value}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {/* Chart */}
              <Card className="border-border/50">
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold text-[#111] mb-4">Order Overview</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} barCategoryGap="20%">
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              {/* Recent orders */}
              <Card className="border-border/50">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-[#111]">Recent Orders</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-xs text-[#FF6A00] hover:underline">
                      View All
                    </button>
                  </div>
                  {orders.length === 0 ? (
                    <p className="text-sm text-gray-500">No orders yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 3).map((order) => (
                        <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div>
                            <p className="text-sm font-medium">{order.order_number}</p>
                            <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">₹{order.total.toLocaleString('en-IN')}</p>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[order.status] || ''}`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="font-[family-name:var(--font-poppins)] text-xl font-bold text-[#111]">
                My Orders
              </h2>
              {/* Status filter */}
              <div className="flex overflow-x-auto gap-2 pb-1">
                {['All', 'Pending', 'Confirmed', 'Packing', 'Shipping', 'Delivered', 'Cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setOrderFilter(status)}
                    className={`shrink-0 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                      orderFilter === status
                        ? 'bg-[#111] text-white'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-[#111]'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
              {/* Orders list */}
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="size-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No orders found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <Card key={order.id} className="border-border/50">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold">{order.order_number}</h3>
                              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[order.status] || ''}`}>
                                {order.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(order.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric',
                              })}
                            </p>
                          </div>
                          <p className="text-base font-bold">₹{order.total.toLocaleString('en-IN')}</p>
                        </div>
                        {/* Progress bar */}
                        {order.status !== 'Cancelled' && order.status !== 'Returned' && (
                          <div className="mb-3">
                            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                              {statusSteps.map((s) => (
                                <span key={s}>{s}</span>
                              ))}
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#FF6A00] rounded-full transition-all duration-500"
                                style={{ width: `${getProgressWidth(order.status)}%` }}
                              />
                            </div>
                          </div>
                        )}
                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs rounded-lg h-8"
                          >
                            View Details
                          </Button>
                          {order.status === 'Delivered' && (
                            <Button
                              size="sm"
                              className="text-xs bg-[#FF6A00] hover:bg-[#FF6A00]/90 text-white rounded-lg h-8"
                              onClick={() => {
                                setReturnOrderId(order.id);
                                setReturnDialogOpen(true);
                              }}
                            >
                              Return
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Wishlist Tab */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <h2 className="font-[family-name:var(--font-poppins)] text-xl font-bold text-[#111]">
                My Wishlist
              </h2>
              {wishlist.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="size-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-3">Your wishlist is empty</p>
                  <Button
                    onClick={() => navigate('shop')}
                    variant="outline"
                    className="rounded-xl text-sm"
                  >
                    Browse Products
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {wishlist.map((item) => (
                    <Card key={item.id} className="border-border/50 overflow-hidden">
                      <div className="aspect-square bg-gray-100 relative">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=300&fit=crop'}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-3">
                        <h3 className="text-sm font-medium line-clamp-1">{item.name}</h3>
                        <p className="text-sm font-bold mt-1">₹{item.price.toLocaleString('en-IN')}</p>
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            className="flex-1 h-8 bg-[#FF6A00] hover:bg-[#FF6A00]/90 text-white text-xs rounded-lg"
                            onClick={() => handleMoveToCart(item)}
                          >
                            <ShoppingBag className="size-3 mr-1" />
                            Move to Cart
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs rounded-lg"
                            onClick={() => handleRemoveFromWishlist(item)}
                          >
                            <XCircle className="size-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Returns Tab */}
          {activeTab === 'returns' && (
            <div className="space-y-6">
              <h2 className="font-[family-name:var(--font-poppins)] text-xl font-bold text-[#111]">
                My Returns
              </h2>
              {returns.length === 0 ? (
                <div className="text-center py-12">
                  <RotateCcw className="size-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No return requests yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {returns.map((ret) => (
                    <Card key={ret.id} className="border-border/50">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-sm font-semibold">{ret.product_name}</h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Reason: {ret.reason}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(ret.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric',
                              })}
                            </p>
                          </div>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[ret.status] || ''}`}>
                            {ret.status}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Personal Details Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-[family-name:var(--font-poppins)] text-xl font-bold text-[#111]">
                  Personal Details
                </h2>
                <Button
                  variant={editMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    if (editMode) {
                      setEditForm({
                        first_name: profileData?.first_name || '',
                        last_name: profileData?.last_name || '',
                        address: profileData?.address || '',
                        pincode: profileData?.pincode || '',
                      });
                    }
                    setEditMode(!editMode);
                  }}
                  className="rounded-lg text-sm"
                >
                  {editMode ? 'Cancel' : 'Edit'}
                </Button>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-4 p-5 bg-white rounded-xl border border-border/50">
                <Avatar className="size-16 rounded-full">
                  <AvatarImage src={customer.avatar || undefined} />
                  <AvatarFallback className="bg-[#FF6A00]/10 text-[#FF6A00] text-xl font-semibold">
                    {customer.first_name?.[0]}{customer.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-[#111]">
                    {profileData?.first_name} {profileData?.last_name}
                  </p>
                  <p className="text-sm text-gray-500">{customer.mobile}</p>
                </div>
              </div>

              {/* Form */}
              <Card className="border-border/50">
                <CardContent className="p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">First Name</Label>
                      <Input
                        value={editForm.first_name}
                        onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                        disabled={!editMode}
                        className="h-10 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">Last Name</Label>
                      <Input
                        value={editForm.last_name}
                        onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                        disabled={!editMode}
                        className="h-10 rounded-xl"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Mobile Number</Label>
                    <Input value={customer.mobile} disabled className="h-10 rounded-xl bg-gray-50" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Address</Label>
                    <Input
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      disabled={!editMode}
                      placeholder="Enter your address"
                      className="h-10 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Pincode</Label>
                    <Input
                      value={editForm.pincode}
                      onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                      disabled={!editMode}
                      placeholder="6-digit pincode"
                      className="h-10 rounded-xl"
                      maxLength={6}
                    />
                  </div>
                  {editMode && (
                    <Button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="bg-[#FF6A00] hover:bg-[#FF6A00]/90 text-white rounded-xl text-sm"
                    >
                      {saving ? <Loader2 className="size-4 animate-spin mr-2" /> : <Save className="size-4 mr-2" />}
                      Save Changes
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Change PIN */}
              <Card className="border-border/50">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                        <Shield className="size-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Change PIN</p>
                        <p className="text-xs text-gray-500">Update your 6-digit login PIN</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg text-sm"
                      onClick={() => setChangePinOpen(true)}
                    >
                      Change
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="font-[family-name:var(--font-poppins)] text-xl font-bold text-[#111]">
                Settings
              </h2>
              <Card className="border-border/50">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-semibold">Account</p>
                      <p className="text-xs text-gray-500">Manage your account settings</p>
                    </div>
                    <User className="size-5 text-gray-400" />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-semibold">Notifications</p>
                      <p className="text-xs text-gray-500">Notification preferences</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-500">App Version</p>
                      <p className="text-xs text-gray-400">v1.0.0</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="w-full h-11 rounded-xl text-sm font-semibold"
              >
                <LogOut className="size-4 mr-2" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Return Dialog */}
      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Request Return</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Reason for Return</Label>
              <textarea
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="Describe the reason for your return..."
                className="w-full min-h-[100px] p-3 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:border-transparent resize-none"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setReturnDialogOpen(false)}
                className="flex-1 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReturn}
                disabled={saving}
                className="flex-1 bg-[#FF6A00] hover:bg-[#FF6A00]/90 text-white rounded-xl"
              >
                {saving ? <Loader2 className="size-4 animate-spin" /> : 'Submit Return'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change PIN Dialog */}
      <Dialog open={changePinOpen} onOpenChange={setChangePinOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Change PIN</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Current PIN</Label>
              <Input
                type="password"
                value={pinForm.oldPin}
                onChange={(e) => setPinForm({ ...pinForm, oldPin: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                placeholder="Enter current PIN"
                className="h-10 rounded-xl"
                maxLength={6}
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">New PIN</Label>
              <Input
                type="password"
                value={pinForm.newPin}
                onChange={(e) => setPinForm({ ...pinForm, newPin: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                placeholder="Enter new 6-digit PIN"
                className="h-10 rounded-xl"
                maxLength={6}
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Confirm New PIN</Label>
              <Input
                type="password"
                value={pinForm.confirmPin}
                onChange={(e) => setPinForm({ ...pinForm, confirmPin: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                placeholder="Confirm new PIN"
                className="h-10 rounded-xl"
                maxLength={6}
              />
            </div>
            <Button
              onClick={handleChangePin}
              disabled={saving}
              className="w-full bg-[#FF6A00] hover:bg-[#FF6A00]/90 text-white rounded-xl"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : 'Change PIN'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
