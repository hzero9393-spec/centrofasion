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
import { AuthModal } from '@/components/customer/AuthPages';
import ProfilePage from '@/components/customer/ProfilePage';
import { SupportPage, FAQPage, ReturnsPage, ContactPage, TrackOrderPage, PrivacyPage, TermsPage, ShippingPage } from '@/components/customer/InfoPages';

export default function Home() {
  const { currentPage } = useNavigation();
  const { isCustomerLoggedIn } = useAuth();
  const isAuthPage = currentPage === 'login' || currentPage === 'signup';
  const authOpen = isAuthPage && !isCustomerLoggedIn();

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
      case 'support':
        return <SupportPage />;
      case 'faq':
        return <FAQPage />;
      case 'returns':
        return <ReturnsPage />;
      case 'contact':
        return <ContactPage />;
      case 'track-order':
        return <TrackOrderPage />;
      case 'privacy':
        return <PrivacyPage />;
      case 'terms':
        return <TermsPage />;
      case 'shipping':
        return <ShippingPage />;
      case 'login':
      case 'signup':
        return <HomePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--theme-bg)]">
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
