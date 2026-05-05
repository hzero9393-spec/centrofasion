'use client';

import React, { useState } from 'react';
import { useAdminNavigation, AdminPage } from '@/stores/adminNavigation';
import { useAuth } from '@/stores/auth';
import {
  LayoutDashboard, Package, Grid3X3, Users, ShoppingBag,
  RotateCcw, BarChart3, FileText, UserCog, Settings,
  ChevronsLeft, ChevronsRight, Bell, Menu, LogOut, User as UserIcon
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const navItems: { id: AdminPage; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'categories', label: 'Category', icon: Grid3X3 },
  { id: 'customers', label: 'Customer', icon: Users },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'returns', label: 'Return Orders', icon: RotateCcw },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'invoice', label: 'Invoice', icon: FileText },
  { id: 'profile', label: 'My Profile', icon: UserCog },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const pageTitles: Record<string, string> = {
  'dashboard': 'Dashboard',
  'products': 'Products',
  'categories': 'Categories',
  'customers': 'Customers',
  'customer-detail': 'Customer Details',
  'orders': 'Orders',
  'order-detail': 'Order Details',
  'returns': 'Return Orders',
  'reports': 'Reports',
  'invoice': 'Invoice',
  'profile': 'My Profile',
  'settings': 'Settings',
};

function SidebarNav({ collapsed, onNavigate, currentPage }: {
  collapsed: boolean;
  onNavigate: (id: AdminPage) => void;
  currentPage: AdminPage;
}) {
  return (
    <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
              isActive
                ? 'bg-[#FF5722]/10 text-[#FF5722]'
                : 'text-[#CBD5E1] hover:bg-white/5 hover:text-white'
            }`}
          >
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#FF5722] rounded-r-full" />
            )}
            <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-[#FF5722]' : ''}`} />
            {!collapsed && <span>{item.label}</span>}
          </button>
        );
      })}
    </nav>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { currentPage, navigate } = useAdminNavigation();
  const { admin, logoutAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavigate = (page: AdminPage) => {
    navigate(page);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logoutAdmin();
    // Redirect to admin login page via hard navigation
    window.location.href = '/admin';
  };

  const title = pageTitles[currentPage] || 'Dashboard';
  const initials = admin?.name
    ? `${admin.name.charAt(0)}${(admin.last_name || '').charAt(0) || admin.name.charAt(1)}`
    : 'AD';

  return (
    <div className="min-h-screen flex bg-[#F5F7FA]">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-[#0A1B2A] fixed top-0 left-0 h-full z-40 transition-all duration-300 border-r border-[#1E3A5A]/50 ${
          collapsed ? 'w-[72px]' : 'w-[260px]'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-[#1E3A5A]/50 flex-shrink-0">
          <div className="w-9 h-9 bg-[#FF5722] rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">CF</span>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-white font-semibold text-lg tracking-tight">CF Admin</h1>
            </div>
          )}
        </div>

        {/* Nav */}
        <SidebarNav collapsed={collapsed} onNavigate={handleNavigate} currentPage={currentPage} />

        {/* Collapse Toggle */}
        <div className="p-3 border-t border-[#1E3A5A]/50 flex-shrink-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[#CBD5E1] hover:bg-white/5 hover:text-white transition-colors text-sm"
          >
            {collapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <button className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-[#0A1B2A] rounded-xl flex items-center justify-center text-white shadow-lg">
            <Menu className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0 bg-[#0A1B2A] border-[#1E3A5A]">
          <div className="flex items-center gap-3 px-4 h-16 border-b border-[#1E3A5A]/50">
            <div className="w-9 h-9 bg-[#FF5722] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">CF</span>
            </div>
            <h1 className="text-white font-semibold text-lg">CF Admin</h1>
          </div>
          <SidebarNav collapsed={false} onNavigate={handleNavigate} currentPage={currentPage} />
          <div className="p-3 border-t border-[#1E3A5A]/50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#CBD5E1] hover:bg-white/5 hover:text-white transition-colors text-sm"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'}`}>
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-[#E4E7EC] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3 pl-12 lg:pl-0">
            <h2 className="text-lg font-semibold text-[#1F2A3A]">{title}</h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button className="relative w-9 h-9 rounded-lg hover:bg-[#F5F7FA] flex items-center justify-center transition-colors">
              <Bell className="h-5 w-5 text-[#5A6B7F]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#DC3545] rounded-full" />
            </button>

            {/* Admin Avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg hover:bg-[#F5F7FA] transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[#FF5722] flex items-center justify-center text-white text-xs font-semibold">
                    {initials}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-[#1F2A3A] leading-tight">{admin?.name || 'Admin'}</p>
                    <p className="text-xs text-[#5A6B7F] leading-tight">{admin?.user_id || ''}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleNavigate('profile')}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-[#DC3545]">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
