import { create } from 'zustand';

export type Page = 
  | 'home' | 'shop' | 'product' | 'cart' | 'checkout' | 'login' | 'signup' | 'profile'
  | 'order-success'
  | 'faq' | 'returns' | 'contact' | 'track-order' | 'privacy' | 'terms' | 'shipping' | 'support'
  | 'admin-login' | 'admin-dashboard' | 'admin-products' | 'admin-categories'
  | 'admin-customers' | 'admin-orders' | 'admin-returns' | 'admin-reports'
  | 'admin-invoice' | 'admin-profile' | 'admin-settings' | 'admin-customer-detail'
  | 'admin-order-detail';

interface NavigationState {
  currentPage: Page;
  pageParams: Record<string, string>;
  previousPages: { page: Page; params: Record<string, string> }[];
  navigate: (page: Page, params?: Record<string, string>) => void;
  goBack: () => void;
  replace: (page: Page, params?: Record<string, string>) => void;
}

// Parse page from URL query params on init
function getPageFromURL(): Page {
  if (typeof window === 'undefined') return 'home';
  const params = new URLSearchParams(window.location.search);
  const page = params.get('page');
  if (page && isValidPage(page)) return page as Page;
  return 'home';
}

function getParamsFromURL(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    if (key !== 'page') result[key] = value;
  });
  return result;
}

function isValidPage(page: string): boolean {
  const validPages: string[] = [
    'home', 'shop', 'product', 'cart', 'checkout', 'login', 'signup', 'profile',
    'order-success', 'faq', 'returns', 'contact', 'track-order', 'privacy', 'terms', 'shipping', 'support',
    'admin-login', 'admin-dashboard', 'admin-products', 'admin-categories',
    'admin-customers', 'admin-orders', 'admin-returns', 'admin-reports',
    'admin-invoice', 'admin-profile', 'admin-settings', 'admin-customer-detail',
    'admin-order-detail',
  ];
  return validPages.includes(page);
}

// Update URL without reload
function updateURL(page: Page, params: Record<string, string>) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.pathname, window.location.origin);
  if (page !== 'home') {
    url.searchParams.set('page', page);
  }
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  window.history.pushState({}, '', url.toString());
}

export const useNavigation = create<NavigationState>((set, get) => ({
  currentPage: getPageFromURL(),
  pageParams: getParamsFromURL(),
  previousPages: [],
  navigate: (page, params = {}) => {
    const { currentPage, pageParams, previousPages } = get();
    set({
      previousPages: [...previousPages.slice(-30), { page: currentPage, params: pageParams }],
      currentPage: page,
      pageParams: params,
    });
    updateURL(page, params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
  goBack: () => {
    const { previousPages } = get();
    if (previousPages.length > 0) {
      const last = previousPages[previousPages.length - 1];
      set({
        previousPages: previousPages.slice(0, -1),
        currentPage: last.page,
        pageParams: last.params,
      });
      updateURL(last.page, last.params);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  },
  replace: (page, params = {}) => {
    set({ currentPage: page, pageParams: params });
    updateURL(page, params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
}));
