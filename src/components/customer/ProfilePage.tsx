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
import { Separator } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AuthModal } from './AuthPages';
import {
  User,
  Package,
  Heart,
  RotateCcw,
  Settings,
  LogOut,
  ChevronLeft,
  CheckCircle,
  XCircle,
  ShoppingBag,
  MapPin,
  Phone,
  Save,
  Shield,
  Loader2,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Minus,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  items?: OrderItem[];
}

interface OrderItem {
  name: string;
  image: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
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

const statusSteps = ['Pending', 'Confirmed', 'Packing', 'Shipping', 'Delivered'];
const statusBadgeClass: Record<string, string> = {
  Pending: 'badge-pending',
  Confirmed: 'badge-confirmed',
  Packing: 'badge-packing',
  Shipping: 'badge-shipping',
  Delivered: 'badge-delivered',
  Cancelled: 'badge-cancelled',
  Returned: 'badge-returned',
};

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: User },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'returns', label: 'Returns', icon: RotateCcw },
  { id: 'personal', label: 'Personal Details', icon: MapPin },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function ProfilePage() {
  const { navigate, goBack } = useNavigation();
  const { customer, isCustomerLoggedIn, logoutCustomer } = useAuth();
  const { addItem } = useCart();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Data
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [profileData, setProfileData] = useState<Customer | null>(null);

  // Edit states
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', address: '', pincode: '', nearby_area: '', state: '' });
  const [pinForm, setPinForm] = useState({ oldPin: '', newPin: '', confirmPin: '' });
  const [saving, setSaving] = useState(false);
  const [changePinOpen, setChangePinOpen] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnOrderId, setReturnOrderId] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [orderFilter, setOrderFilter] = useState('All');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!isCustomerLoggedIn()) {
      setAuthModalOpen(true);
      return;
    }
  }, [isCustomerLoggedIn]);

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
      const [ordersData, wishlistData, returnsData, profileDataRes] = await Promise.all([
        ordersRes.json(),
        wishlistRes.json(),
        returnsRes.json(),
        profileRes.json(),
      ]);
      setOrders(ordersData.orders || []);
      setWishlist(Array.isArray(wishlistData) ? wishlistData : []);
      setReturns(Array.isArray(returnsData) ? returnsData : []);
      if (profileDataRes.customer) {
        setProfileData(profileDataRes.customer);
        setEditForm({
          first_name: profileDataRes.customer.first_name || '',
          last_name: profileDataRes.customer.last_name || '',
          address: profileDataRes.customer.address || '',
          pincode: profileDataRes.customer.pincode || '',
          nearby_area: profileDataRes.customer.nearby_area || '',
          state: '',
        });
      }
    } catch (err) {
      console.error('Failed to fetch profile data:', err);
    } finally {
      setLoading(false);
    }
  }, [customer?.id]);

  useEffect(() => {
    if (customer?.id) fetchAllData();
  }, [customer?.id, fetchAllData]);

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
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const handleChangePin = async () => {
    if (pinForm.newPin.length !== 6) { toast.error('PIN must be 6 digits'); return; }
    if (pinForm.newPin !== pinForm.confirmPin) { toast.error('PINs do not match'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'customer-login', mobile: customer?.mobile, pin: pinForm.oldPin }),
      });
      const data = await res.json();
      if (!data.customer) { toast.error('Current PIN is incorrect'); setSaving(false); return; }
      await fetch('/api/customers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: customer!.id, pin: pinForm.newPin }),
      });
      toast.success('PIN changed successfully');
      setChangePinOpen(false);
      setPinForm({ oldPin: '', newPin: '', confirmPin: '' });
    } catch { toast.error('Failed to change PIN'); }
    finally { setSaving(false); }
  };

  const handleReturn = async () => {
    if (!returnReason.trim()) { toast.error('Please provide a reason'); return; }
    setSaving(true);
    try {
      const order = orders.find((o) => o.id === returnOrderId);
      await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: returnOrderId, customer_id: customer!.id, product_name: order?.order_number || 'Product', reason: returnReason }),
      });
      toast.success('Return request submitted');
      setReturnDialogOpen(false);
      setReturnReason('');
      fetchAllData();
    } catch { toast.error('Failed to submit return'); }
    finally { setSaving(false); }
  };

  const handleMoveToCart = (item: WishlistItem) => {
    addItem({
      id: `${item.product_id}-OS-Default`, product_id: item.product_id, name: item.name,
      price: item.price, image: item.image, size: 'OS', color: 'Default', quantity: 1,
    });
    toast.success(`${item.name} added to cart`);
  };

  const handleRemoveFromWishlist = async (item: WishlistItem) => {
    try {
      await fetch(`/api/wishlist?id=${item.id}`, { method: 'DELETE' });
      setWishlist((prev) => prev.filter((w) => w.id !== item.id));
      toast.success('Removed from wishlist');
    } catch { toast.error('Failed to remove'); }
  };

  const handleLogout = () => {
    logoutCustomer();
    toast.success('Logged out successfully');
    navigate('home');
  };

  if (!isCustomerLoggedIn() || !customer) {
    return (
      <>
        <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <p className="text-sm text-[#5A6B7F]">Please login to view your profile</p>
        </div>
      </>
    );
  }

  const stats = {
    delivered: orders.filter((o) => o.status === 'Delivered').length,
    returned: orders.filter((o) => o.status === 'Returned').length,
    cancelled: orders.filter((o) => o.status === 'Cancelled').length,
    pending: orders.filter((o) => ['Pending', 'Confirmed', 'Packing', 'Shipping'].includes(o.status)).length,
  };

  const chartData = [
    { name: 'Jan', amount: 1200 },
    { name: 'Feb', amount: 3400 },
    { name: 'Mar', amount: 2100 },
    { name: 'Apr', amount: 4800 },
    { name: 'May', amount: 3200 },
    { name: 'Jun', amount: 5600 },
  ];

  const filteredOrders = orderFilter === 'All' ? orders : orders.filter((o) => o.status === orderFilter);

  const getStepStatus = (status: string, step: string) => {
    const currentIndex = statusSteps.indexOf(status);
    const stepIndex = statusSteps.indexOf(step);
    if (status === 'Cancelled' || status === 'Returned') return 'inactive';
    if (stepIndex <= currentIndex) return 'completed';
    return 'inactive';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Skeleton className="h-5 w-20 mb-6" />
        <div className="flex gap-6">
          <Skeleton className="hidden md:block w-56 h-96 rounded-xl" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-8">
      {/* Back */}
      <button onClick={goBack} className="flex items-center gap-1.5 text-sm text-[#5A6B7F] hover:text-cf-text mb-6 transition-colors">
        <ChevronLeft className="size-4" />
        Back
      </button>

      {/* Mobile tab bar */}
      <div className="flex overflow-x-auto gap-1 mb-6 md:hidden pb-1 scrollbar-none">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === item.id ? 'bg-[#FF5722]/10 text-[#FF5722]' : 'text-[#5A6B7F] hover:bg-[#F5F7FA]'
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
          <div className="sticky top-24 bg-white rounded-xl border border-[#E4E7EC] shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#E4E7EC]">
              <div className="flex items-center gap-3">
                <Avatar className="size-12 rounded-full">
                  <AvatarImage src={customer.avatar || undefined} />
                  <AvatarFallback className="bg-[#FF5722]/10 text-[#FF5722] font-semibold">
                    {customer.first_name?.[0]}{customer.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-cf-text truncate">{customer.first_name} {customer.last_name}</p>
                  <p className="text-xs text-[#5A6B7F] truncate">{customer.mobile}</p>
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
                      activeTab === item.id ? 'bg-[#FF5722]/10 text-[#FF5722]' : 'text-[#5A6B7F] hover:bg-[#F5F7FA]'
                    }`}
                  >
                    <Icon className="size-4" />
                    {item.label}
                    {item.id === 'orders' && orders.length > 0 && (
                      <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 h-5 min-w-5 flex items-center justify-center rounded-full bg-[#F5F7FA]">
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
              <h2 className="text-xl font-bold text-cf-text">Dashboard</h2>

              {/* Stat cards */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Delivered', value: stats.delivered, color: '#28A745', bg: '#E8F5E9' },
                  { label: 'Returned', value: stats.returned, color: '#FFC107', bg: '#FFF8E1' },
                  { label: 'Cancelled', value: stats.cancelled, color: '#DC3545', bg: '#FFEBEE' },
                ].map((s) => (
                  <Card key={s.label} className="border border-[#E4E7EC]">
                    <CardContent className="p-4 text-center">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: s.bg }}>
                        <Package className="size-5" style={{ color: s.color }} />
                      </div>
                      <p className="text-2xl font-bold text-cf-text">{s.value}</p>
                      <p className="text-xs text-[#5A6B7F]">{s.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Monthly spending chart */}
              <Card className="border border-[#E4E7EC]">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-cf-text flex items-center gap-2">
                      <TrendingUp className="size-4 text-[#FF5722]" />
                      Monthly Spending
                    </h3>
                    <span className="text-xs text-[#5A6B7F]">Last 6 months</span>
                  </div>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} barCategoryGap="20%">
                        <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#5A6B7F' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: '#5A6B7F' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                        <Tooltip
                          formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Spending']}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #E4E7EC', fontSize: '12px' }}
                        />
                        <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                          {chartData.map((_, index) => (
                            <Cell key={index} fill={index === chartData.length - 1 ? '#FF5722' : '#E4E7EC'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Recent orders */}
              <Card className="border border-[#E4E7EC]">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-cf-text">Recent Orders</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-xs text-[#FF5722] font-medium hover:underline">View All</button>
                  </div>
                  {orders.length === 0 ? (
                    <p className="text-sm text-[#5A6B7F]">No orders yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 3).map((order) => (
                        <div key={order.id} className="flex items-center justify-between py-2 border-b border-[#E4E7EC] last:border-0">
                          <div>
                            <p className="text-sm font-medium text-cf-text">#{order.order_number}</p>
                            <p className="text-xs text-[#5A6B7F]">
                              {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-cf-text">₹{order.total.toLocaleString('en-IN')}</p>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${statusBadgeClass[order.status] || ''}`}>
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
              <h2 className="text-xl font-bold text-cf-text">My Orders</h2>

              {/* Status filter */}
              <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-none">
                {['All', 'Pending', 'Confirmed', 'Packing', 'Shipping', 'Delivered', 'Cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setOrderFilter(status)}
                    className={`shrink-0 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                      orderFilter === status
                        ? 'bg-[#FF5722] text-white'
                        : 'bg-white text-[#5A6B7F] border border-[#E4E7EC] hover:border-[#5A6B7F]'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="size-12 text-[#E4E7EC] mx-auto mb-3" />
                  <p className="text-sm text-[#5A6B7F]">No orders found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((order) => {
                    const isExpanded = expandedOrder === order.id;
                    return (
                      <Card key={order.id} className="border border-[#E4E7EC] overflow-hidden">
                        <CardContent className="p-0">
                          {/* Order header */}
                          <div className="p-4 sm:p-5">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="text-sm font-bold text-cf-text">#{order.order_number}</h3>
                                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${statusBadgeClass[order.status] || ''}`}>
                                    {order.status}
                                  </span>
                                </div>
                                <p className="text-xs text-[#5A6B7F] mt-1">
                                  {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-base font-bold text-cf-text">₹{order.total.toLocaleString('en-IN')}</p>
                                <button
                                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                  className="flex items-center gap-1 text-xs text-[#FF5722] font-medium mt-1 hover:underline"
                                >
                                  {isExpanded ? 'Hide' : 'Details'}
                                  {isExpanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                                </button>
                              </div>
                            </div>

                            {/* Order timeline (when expanded) */}
                            {isExpanded && (
                              <div className="mt-4 pt-4 border-t border-[#E4E7EC]">
                                {order.status !== 'Cancelled' && order.status !== 'Returned' && (
                                  <div className="flex items-center justify-between mb-5 px-2">
                                    {statusSteps.map((step, i) => {
                                      const st = getStepStatus(order.status, step);
                                      return (
                                        <React.Fragment key={step}>
                                          <div className="flex flex-col items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                                              st === 'completed'
                                                ? 'bg-[#28A745] text-white'
                                                : 'bg-[#F5F7FA] text-[#5A6B7F]/40 border border-[#E4E7EC]'
                                            }`}>
                                              {st === 'completed' ? <CheckCircle className="size-4" /> : i + 1}
                                            </div>
                                            <span className={`text-[10px] mt-1.5 font-medium text-center ${
                                              st === 'completed' ? 'text-[#28A745]' : 'text-[#5A6B7F]/40'
                                            }`}>
                                              {step}
                                            </span>
                                          </div>
                                          {i < statusSteps.length - 1 && (
                                            <div className={`flex-1 h-0.5 mx-1 rounded-full ${
                                              getStepStatus(order.status, statusSteps[i + 1]) === 'completed'
                                                ? 'bg-[#28A745]'
                                                : 'bg-[#E4E7EC]'
                                            }`} />
                                          )}
                                        </React.Fragment>
                                      );
                                    })}
                                  </div>
                                )}
                                {order.status === 'Cancelled' && (
                                  <div className="flex items-center gap-2 bg-[#FFEBEE] rounded-lg p-3">
                                    <XCircle className="size-4 text-[#DC3545]" />
                                    <span className="text-sm text-[#DC3545] font-medium">This order has been cancelled</span>
                                  </div>
                                )}
                                {order.status === 'Returned' && (
                                  <div className="flex items-center gap-2 bg-[#F3E5F5] rounded-lg p-3">
                                    <RotateCcw className="size-4 text-[#6A1B9A]" />
                                    <span className="text-sm text-[#6A1B9A] font-medium">Return completed for this order</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-2 mt-3">
                              {order.status === 'Delivered' && (
                                <Button
                                  size="sm"
                                  className="text-xs bg-[#FF5722] hover:bg-[#E64A19] text-white rounded-lg h-8"
                                  onClick={() => { setReturnOrderId(order.id); setReturnDialogOpen(true); }}
                                >
                                  Return
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Wishlist Tab */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-cf-text">My Wishlist</h2>
              {wishlist.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="size-12 text-[#E4E7EC] mx-auto mb-3" />
                  <p className="text-sm text-[#5A6B7F] mb-3">Your wishlist is empty</p>
                  <Button onClick={() => navigate('shop')} variant="outline" className="rounded-lg text-sm border-[#E4E7EC]">
                    Browse Products
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {wishlist.map((item) => (
                    <Card key={item.id} className="border border-[#E4E7EC] overflow-hidden product-card">
                      <div className="aspect-square bg-[#F5F7FA] relative overflow-hidden">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=300&fit=crop'}
                          alt={item.name}
                          className="w-full h-full object-cover product-img"
                        />
                      </div>
                      <CardContent className="p-3">
                        <h3 className="text-sm font-medium text-cf-text line-clamp-1">{item.name}</h3>
                        <p className="text-sm font-bold text-cf-text mt-1">₹{item.price.toLocaleString('en-IN')}</p>
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            className="flex-1 h-8 bg-[#FF5722] hover:bg-[#E64A19] text-white text-xs rounded-lg"
                            onClick={() => handleMoveToCart(item)}
                          >
                            <ShoppingBag className="size-3 mr-1" />
                            Move to Cart
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs rounded-lg border-[#E4E7EC] hover:bg-red-50 hover:text-[#DC3545] hover:border-[#DC3545]"
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
              <h2 className="text-xl font-bold text-cf-text">My Returns</h2>
              {returns.length === 0 ? (
                <div className="text-center py-12">
                  <RotateCcw className="size-12 text-[#E4E7EC] mx-auto mb-3" />
                  <p className="text-sm text-[#5A6B7F]">No return requests yet</p>
                </div>
              ) : (
                <Card className="border border-[#E4E7EC] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#F5F7FA] border-b border-[#E4E7EC]">
                          <th className="text-left py-3 px-4 font-semibold text-cf-text">Product</th>
                          <th className="text-left py-3 px-4 font-semibold text-cf-text">Reason</th>
                          <th className="text-left py-3 px-4 font-semibold text-cf-text">Status</th>
                          <th className="text-left py-3 px-4 font-semibold text-cf-text">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {returns.map((ret) => (
                          <tr key={ret.id} className="border-b border-[#E4E7EC] last:border-0 hover:bg-[#FAFBFC]">
                            <td className="py-3 px-4 font-medium text-cf-text">{ret.product_name}</td>
                            <td className="py-3 px-4 text-[#5A6B7F]">{ret.reason}</td>
                            <td className="py-3 px-4">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${statusBadgeClass[ret.status] || ''}`}>
                                {ret.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-[#5A6B7F]">
                              {new Date(ret.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Personal Details Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-cf-text">Personal Details</h2>
                <Button
                  variant={editMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    if (editMode) setEditForm({ first_name: profileData?.first_name || '', last_name: profileData?.last_name || '', address: profileData?.address || '', pincode: profileData?.pincode || '', nearby_area: profileData?.nearby_area || '', state: '' });
                    setEditMode(!editMode);
                  }}
                  className="rounded-lg text-sm"
                >
                  {editMode ? 'Cancel' : 'Edit'}
                </Button>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-4 p-5 bg-white rounded-xl border border-[#E4E7EC]">
                <Avatar className="size-20 rounded-full">
                  <AvatarImage src={customer.avatar || undefined} />
                  <AvatarFallback className="bg-[#FF5722]/10 text-[#FF5722] text-xl font-semibold">
                    {customer.first_name?.[0]}{customer.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-cf-text text-lg">{profileData?.first_name} {profileData?.last_name}</p>
                  <div className="flex items-center gap-1.5 text-sm text-[#5A6B7F] mt-0.5">
                    <Phone className="size-3.5" />
                    {customer.mobile}
                  </div>
                </div>
              </div>

              {/* Form */}
              <Card className="border border-[#E4E7EC]">
                <CardContent className="p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-cf-text mb-1.5 block">First Name</Label>
                      <Input value={editForm.first_name} onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })} disabled={!editMode} className="h-10 rounded-lg border-[#E4E7EC]" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-cf-text mb-1.5 block">Last Name</Label>
                      <Input value={editForm.last_name} onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })} disabled={!editMode} className="h-10 rounded-lg border-[#E4E7EC]" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-cf-text mb-1.5 block">Mobile Number</Label>
                    <Input value={customer.mobile} disabled className="h-10 rounded-lg bg-[#F5F7FA] border-[#E4E7EC]" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-cf-text mb-1.5 block">Address</Label>
                    <Input value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} disabled={!editMode} placeholder="Enter your address" className="h-10 rounded-lg border-[#E4E7EC]" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-cf-text mb-1.5 block">Pincode</Label>
                      <Input value={editForm.pincode} onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })} disabled={!editMode} placeholder="6-digit pincode" className="h-10 rounded-lg border-[#E4E7EC]" maxLength={6} />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-cf-text mb-1.5 block">Nearby Landmark</Label>
                      <Input value={editForm.nearby_area} onChange={(e) => setEditForm({ ...editForm, nearby_area: e.target.value })} disabled={!editMode} placeholder="Nearby area" className="h-10 rounded-lg border-[#E4E7EC]" />
                    </div>
                  </div>
                  {editMode && (
                    <Button onClick={handleSaveProfile} disabled={saving} className="bg-[#FF5722] hover:bg-[#E64A19] text-white rounded-lg text-sm font-bold">
                      {saving ? <Loader2 className="size-4 animate-spin mr-2" /> : <Save className="size-4 mr-2" />}
                      Save Changes
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Change PIN */}
              <Card className="border border-[#E4E7EC]">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F5F7FA] flex items-center justify-center">
                        <Shield className="size-5 text-[#5A6B7F]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-cf-text">Change PIN</p>
                        <p className="text-xs text-[#5A6B7F]">Update your 6-digit login PIN</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-lg text-sm border-[#E4E7EC]" onClick={() => setChangePinOpen(true)}>
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
              <h2 className="text-xl font-bold text-cf-text">Settings</h2>
              <Card className="border border-[#E4E7EC]">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-semibold text-cf-text">Account</p>
                      <p className="text-xs text-[#5A6B7F]">Manage your account settings</p>
                    </div>
                    <User className="size-5 text-[#5A6B7F]" />
                  </div>
                  <div className="h-px bg-[#E4E7EC]" />
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-semibold text-cf-text">Notifications</p>
                      <p className="text-xs text-[#5A6B7F]">Notification preferences</p>
                    </div>
                  </div>
                  <div className="h-px bg-[#E4E7EC]" />
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-semibold text-[#5A6B7F]">App Version</p>
                      <p className="text-xs text-[#5A6B7F]/60">v1.0.0</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Button onClick={handleLogout} variant="destructive" className="w-full h-11 rounded-lg text-sm font-bold">
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
              <Label className="text-sm font-medium text-cf-text mb-2 block">Reason for Return</Label>
              <textarea
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="Describe the reason for your return..."
                className="w-full min-h-[100px] p-3 text-sm rounded-lg border border-[#E4E7EC] bg-[#F5F7FA] focus:outline-none focus:ring-2 focus:ring-[#FF5722] focus:border-transparent resize-none"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setReturnDialogOpen(false)} className="flex-1 rounded-lg border-[#E4E7EC]">Cancel</Button>
              <Button onClick={handleReturn} disabled={saving} className="flex-1 bg-[#FF5722] hover:bg-[#E64A19] text-white rounded-lg font-bold">
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
              <Label className="text-sm font-medium text-cf-text mb-1.5 block">Current PIN</Label>
              <Input type="password" value={pinForm.oldPin} onChange={(e) => setPinForm({ ...pinForm, oldPin: e.target.value.replace(/\D/g, '').slice(0, 6) })} placeholder="Enter current PIN" className="h-10 rounded-lg border-[#E4E7EC]" maxLength={6} />
            </div>
            <div>
              <Label className="text-sm font-medium text-cf-text mb-1.5 block">New PIN</Label>
              <Input type="password" value={pinForm.newPin} onChange={(e) => setPinForm({ ...pinForm, newPin: e.target.value.replace(/\D/g, '').slice(0, 6) })} placeholder="Enter new 6-digit PIN" className="h-10 rounded-lg border-[#E4E7EC]" maxLength={6} />
            </div>
            <div>
              <Label className="text-sm font-medium text-cf-text mb-1.5 block">Confirm New PIN</Label>
              <Input type="password" value={pinForm.confirmPin} onChange={(e) => setPinForm({ ...pinForm, confirmPin: e.target.value.replace(/\D/g, '').slice(0, 6) })} placeholder="Confirm new PIN" className="h-10 rounded-lg border-[#E4E7EC]" maxLength={6} />
            </div>
            <Button onClick={handleChangePin} disabled={saving} className="w-full bg-[#FF5722] hover:bg-[#E64A19] text-white rounded-lg font-bold">
              {saving ? <Loader2 className="size-4 animate-spin" /> : 'Change PIN'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
}


