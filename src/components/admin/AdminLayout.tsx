'use client';

import React, { useState } from 'react';
import { useAdminNavigation, AdminPage } from '@/stores/adminNavigation';
import { useAuth } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';
import {
  LayoutDashboard, Package, Grid3X3, Users, ShoppingBag,
  RotateCcw, BarChart3, FileText, UserCog, Settings,
  ChevronsLeft, ChevronsRight, Bell, Menu, LogOut, User as UserIcon,
  Sun, Moon
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navItems: {
  id: AdminPage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'categories', label: 'Categories', icon: Grid3X3 },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'returns', label: 'Returns', icon: RotateCcw },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'invoice', label: 'Invoice', icon: FileText },
  { id: 'profile', label: 'Profile', icon: UserCog },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const pageTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  products: 'Products',
  categories: 'Categories',
  customers: 'Customers',
  'customer-detail': 'Customer Details',
  orders: 'Orders',
  'order-detail': 'Order Details',
  returns: 'Returns',
  reports: 'Reports',
  invoice: 'Invoice',
  profile: 'My Profile',
  settings: 'Settings',
};

function SidebarNav({
  collapsed,
  onNavigate,
  currentPage,
}: {
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
                ? 'text-[var(--theme-text)]'
                : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface)]'
            }`}
          >
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-[var(--theme-primary)] to-[var(--theme-secondary)]" />
            )}
            {isActive && (
              <div className="absolute inset-0 rounded-lg bg-[var(--theme-primary)]/10 pointer-events-none" />
            )}
            <Icon
              className={`h-5 w-5 flex-shrink-0 relative z-10 ${
                isActive ? 'text-[var(--theme-primary)]' : ''
              }`}
            />
            {!collapsed && <span className="relative z-10">{item.label}</span>}
          </button>
        );
      })}
    </nav>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { currentPage, navigate } = useAdminNavigation();
  const { admin, logoutAdmin } = useAuth();
  const { darkMode, toggleDarkMode } = useThemeStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavigate = (page: AdminPage) => {
    navigate(page);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logoutAdmin();
    window.location.href = '/admin';
  };

  const title = pageTitles[currentPage] || 'Dashboard';
  const initials = admin?.name
    ? `${admin.name.charAt(0)}${(admin.last_name || '').charAt(0) || admin.name.charAt(1)}`
    : 'AD';

  return (
    <div className="min-h-screen flex bg-[var(--theme-bg)]">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-[var(--theme-card)] fixed top-0 left-0 h-full z-40 transition-all duration-300 border-r border-[var(--theme-border)] ${
          collapsed ? 'w-[72px]' : 'w-[260px]'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-[var(--theme-border)] flex-shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)]">
            <span className="text-white font-bold text-sm">CF</span>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-[var(--theme-text)] font-semibold text-lg tracking-tight">
                CF Admin
              </h1>
            </div>
          )}
        </div>

        {/* Nav */}
        <SidebarNav
          collapsed={collapsed}
          onNavigate={handleNavigate}
          currentPage={currentPage}
        />

        {/* Bottom section: Dark mode toggle + Collapse */}
        <div className="p-3 border-t border-[var(--theme-border)] flex-shrink-0 space-y-1">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface)] transition-colors text-sm"
          >
            {darkMode ? <Sun className="h-5 w-5 flex-shrink-0" /> : <Moon className="h-5 w-5 flex-shrink-0" />}
            {!collapsed && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>

          {/* Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[var(--theme-text-muted)] hover:bg-[var(--theme-surface)] hover:text-[var(--theme-text)] transition-colors text-sm"
          >
            {collapsed ? (
              <ChevronsRight className="h-5 w-5" />
            ) : (
              <ChevronsLeft className="h-5 w-5" />
            )}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <button className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl flex items-center justify-center text-[var(--theme-text)] shadow-lg">
            <Menu className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[280px] p-0 bg-[var(--theme-card)] border-[var(--theme-border)]"
        >
          <div className="flex items-center gap-3 px-4 h-16 border-b border-[var(--theme-border)]">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)]">
              <span className="text-white font-bold text-sm">CF</span>
            </div>
            <h1 className="text-[var(--theme-text)] font-semibold text-lg">CF Admin</h1>
          </div>
          <SidebarNav
            collapsed={false}
            onNavigate={handleNavigate}
            currentPage={currentPage}
          />
          <div className="p-3 border-t border-[var(--theme-border)] space-y-1">
            <button
              onClick={() => { toggleDarkMode(); setMobileOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface)] transition-colors text-sm"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--theme-text-muted)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10 transition-colors text-sm"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          collapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'
        }`}
      >
        {/* Top Bar */}
        <header className="h-16 bg-[var(--theme-card)]/80 backdrop-blur-xl border-b border-[var(--theme-border)] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3 pl-12 lg:pl-0">
            <h2 className="text-lg font-semibold text-[var(--theme-text)]">{title}</h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle (desktop top bar) */}
            <button
              onClick={toggleDarkMode}
              className="hidden lg:flex relative w-9 h-9 rounded-lg hover:bg-[var(--theme-surface)] items-center justify-center transition-colors"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <Sun className="h-4 w-4 text-[var(--theme-text-muted)]" />
              ) : (
                <Moon className="h-4 w-4 text-[var(--theme-text-muted)]" />
              )}
            </button>

            {/* Notification Bell */}
            <button className="relative w-9 h-9 rounded-lg hover:bg-[var(--theme-surface)] flex items-center justify-center transition-colors">
              <Bell className="h-5 w-5 text-[var(--theme-text-muted)]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--theme-primary)] rounded-full" />
            </button>

            {/* Admin Avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg hover:bg-[var(--theme-surface)] transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] flex items-center justify-center text-white text-xs font-semibold">
                    {initials}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-[var(--theme-text)] leading-tight">
                      {admin?.name || 'Admin'}
                    </p>
                    <p className="text-xs text-[var(--theme-text-muted)] leading-tight">
                      {admin?.user_id || ''}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-[var(--theme-card)] border-[var(--theme-border)] text-[var(--theme-text)]"
              >
                <DropdownMenuItem
                  onClick={() => handleNavigate('profile')}
                  className="text-[var(--theme-text-muted)] focus:text-[var(--theme-text)] focus:bg-[var(--theme-surface)]"
                >
                  <UserIcon className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleNavigate('settings')}
                  className="text-[var(--theme-text-muted)] focus:text-[var(--theme-text)] focus:bg-[var(--theme-surface)]"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[var(--theme-border)]" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-[var(--destructive)] focus:text-[var(--destructive)] focus:bg-[var(--destructive)]/10"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 bg-[var(--theme-bg)]">
          <div className="max-w-[1400px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
