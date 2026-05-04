'use client';

import React from 'react';
import { useNavigation } from '@/stores/navigation';
import { useAuth } from '@/stores/auth';
import Header from '@/components/customer/Header';
import MobileNav from '@/components/customer/MobileNav';
import Footer from '@/components/customer/Footer';
import HomePage from '@/components/customer/HomePage';
import ShopPage from '@/components/customer/ShopPage';
import ProductDetailPage from '@/components/customer/ProductDetailPage';
import CartPage from '@/components/customer/CartPage';
import CheckoutPage from '@/components/customer/CheckoutPage';
import { AuthModal, LoginPage } from '@/components/customer/AuthPages';
import ProfilePage from '@/components/customer/ProfilePage';
import AdminLoginPage from '@/components/admin/AdminLoginPage';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminProducts from '@/components/admin/AdminProducts';
import AdminCategories from '@/components/admin/AdminCategories';
import AdminCustomers from '@/components/admin/AdminCustomers';
import AdminCustomerDetail from '@/components/admin/AdminCustomerDetail';
import AdminOrders from '@/components/admin/AdminOrders';
import AdminOrderDetail from '@/components/admin/AdminOrderDetail';
import AdminReturns from '@/components/admin/AdminReturns';
import AdminReports from '@/components/admin/AdminReports';
import AdminInvoice from '@/components/admin/AdminInvoice';
import AdminProfile from '@/components/admin/AdminProfile';
import AdminSettings from '@/components/admin/AdminSettings';

const adminPages: Record<string, React.ComponentType> = {
  'admin-dashboard': AdminDashboard,
  'admin-products': AdminProducts,
  'admin-categories': AdminCategories,
  'admin-customers': AdminCustomers,
  'admin-customer-detail': AdminCustomerDetail,
  'admin-orders': AdminOrders,
  'admin-order-detail': AdminOrderDetail,
  'admin-returns': AdminReturns,
  'admin-reports': AdminReports,
  'admin-invoice': AdminInvoice,
  'admin-profile': AdminProfile,
  'admin-settings': AdminSettings,
};

const isAdminPage = (page: string) => page.startsWith('admin-') && page !== 'admin-login';

export default function Home() {
  const { currentPage } = useNavigation();
  const { isAdminLoggedIn, isCustomerLoggedIn } = useAuth();
  const isAuthPage = currentPage === 'login' || currentPage === 'signup';
  const authOpen = isAuthPage && !isCustomerLoggedIn();

  // Close auth modal and navigate away
  const handleAuthClose = (_open: boolean) => {
    // When modal closes, stay on current page
  };

  const renderCustomerPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'shop':
        return <ShopPage />;
      case 'product':
        return <ProductDetailPage />;
      case 'cart':
        return <CartPage />;
      case 'checkout':
        return <CheckoutPage />;
      case 'order-success':
        return <CheckoutPage />;
      case 'profile':
        return <ProfilePage />;
      case 'login':
      case 'signup':
        // Show auth modal overlay on top of current page
        return <HomePage />;
      default:
        return <HomePage />;
    }
  };

  const renderAdminPage = () => {
    const PageComponent = adminPages[currentPage];
    if (PageComponent) {
      return (
        <AdminLayout>
          <PageComponent />
        </AdminLayout>
      );
    }
    return (
      <AdminLayout>
        <AdminDashboard />
      </AdminLayout>
    );
  };

  // Admin Login page (full screen, no layout)
  if (currentPage === 'admin-login') {
    return <AdminLoginPage />;
  }

  // Admin pages (with layout)
  if (isAdminPage(currentPage)) {
    if (!isAdminLoggedIn()) {
      return <AdminLoginPage />;
    }
    return renderAdminPage();
  }

  // Customer-facing pages
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">
        {renderCustomerPage()}
      </main>
      <Footer />
      <MobileNav />
      <AuthModal open={authOpen} onOpenChange={handleAuthClose} />
    </div>
  );
}
