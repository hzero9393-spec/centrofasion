'use client';

import React, { useState } from 'react';
import { useAuth } from '@/stores/auth';
import { useNavigation, type Page } from '@/stores/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  Users,
  ShoppingBag,
  RotateCcw,
  BarChart3,
  FileText,
  UserCog,
  Settings,
  LogOut,
  Menu,
  Bell,
  ChevronLeft,
} from 'lucide-react';

const sidebarItems: { icon: React.ElementType; label: string; page: Page }[] = [
  { icon: LayoutDashboard, label: 'Dashboard', page: 'admin-dashboard' },
  { icon: Package, label: 'Products', page: 'admin-products' },
  { icon: FolderOpen, label: 'Category', page: 'admin-categories' },
  { icon: Users, label: 'Customer', page: 'admin-customers' },
  { icon: ShoppingBag, label: 'Orders', page: 'admin-orders' },
  { icon: RotateCcw, label: 'Return Orders', page: 'admin-returns' },
  { icon: BarChart3, label: 'Reports', page: 'admin-reports' },
  { icon: FileText, label: 'Invoice', page: 'admin-invoice' },
  { icon: UserCog, label: 'My Profile', page: 'admin-profile' },
  { icon: Settings, label: 'Settings', page: 'admin-settings' },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { admin, logoutAdmin } = useAuth();
  const { currentPage, navigate } = useNavigation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (page: Page) => {
    navigate(page);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate('admin-login');
    setMobileOpen(false);
  };

  const renderSidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#111111] flex items-center justify-center">
          <span className="text-white font-bold text-sm font-[var(--font-poppins)]">CF</span>
        </div>
        {!sidebarCollapsed && (
          <span className="font-semibold text-lg font-[var(--font-poppins)] text-[#111111]">
            ClothFasion
          </span>
        )}
      </div>
      <Separator />

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.page;
          return (
            <button
              key={item.page}
              onClick={() => handleNav(item.page)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-[#111111] text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-[#111111]'
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
              {isActive && !sidebarCollapsed && (
                <span className="ml-auto w-2 h-2 rounded-full bg-[#FF6A00]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!sidebarCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F8F9FB]">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${
          sidebarCollapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        {renderSidebar()}
        <div className="hidden lg:block absolute bottom-4 left-1/2 -translate-x-1/2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="rounded-full w-8 h-8"
          >
            <ChevronLeft
              className={`h-4 w-4 transition-transform ${
                sidebarCollapsed ? 'rotate-180' : ''
              }`}
            />
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          {renderSidebar()}
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 lg:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                {renderSidebar()}
              </SheetContent>
            </Sheet>
            <h2 className="text-lg font-semibold font-[var(--font-poppins)] text-[#111111]">
              {sidebarItems.find((i) => i.page === currentPage)?.label || 'Admin'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#FF6A00] border-2 border-white" />
            </Button>

            {/* Admin Avatar */}
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={admin?.avatar || undefined} />
                <AvatarFallback className="bg-[#111111] text-white text-xs">
                  {admin?.name?.charAt(0) || 'A'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-medium text-[#111111]">
                {admin?.name || 'Admin'}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
