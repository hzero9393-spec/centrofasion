'use client';

import React, { useEffect, useState } from 'react';
import { useAdminNavigation } from '@/stores/adminNavigation';
import { useAuth } from '@/stores/auth';
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
import AdminLoginPage from '@/components/admin/AdminLoginPage';

const adminPages: Record<string, React.ComponentType> = {
  'dashboard': AdminDashboard,
  'products': AdminProducts,
  'categories': AdminCategories,
  'customers': AdminCustomers,
  'customer-detail': AdminCustomerDetail,
  'orders': AdminOrders,
  'order-detail': AdminOrderDetail,
  'returns': AdminReturns,
  'reports': AdminReports,
  'invoice': AdminInvoice,
  'profile': AdminProfile,
  'settings': AdminSettings,
};

export default function AdminPage() {
  const { currentPage, pageParams } = useAdminNavigation();
  const { admin, isAdminLoggedIn } = useAuth();

  // If not logged in, show login page
  if (!admin || !isAdminLoggedIn()) {
    return <AdminLoginPageWrapper />;
  }

  // Render the active admin page
  const PageComponent = adminPages[currentPage] || AdminDashboard;

  return (
    <AdminLayout>
      <PageComponent />
    </AdminLayout>
  );
}

// Wrapper for login page that navigates to /admin after login
function AdminLoginPageWrapper() {
  const { isAdminLoggedIn } = useAuth();
  const { replace } = useAdminNavigation();

  useEffect(() => {
    if (isAdminLoggedIn()) {
      replace('dashboard');
    }
  }, [isAdminLoggedIn, replace]);

  return <AdminLoginPage />;
}
