import { create } from 'zustand';

export type AdminPage =
  | 'dashboard' | 'products' | 'categories' | 'customers' | 'customer-detail'
  | 'orders' | 'order-detail' | 'returns' | 'reports'
  | 'invoice' | 'profile' | 'settings';

interface AdminNavigationState {
  currentPage: AdminPage;
  pageParams: Record<string, string>;
  previousPages: { page: AdminPage; params: Record<string, string> }[];
  navigate: (page: AdminPage, params?: Record<string, string>) => void;
  goBack: () => void;
  replace: (page: AdminPage, params?: Record<string, string>) => void;
}

function getPageFromURL(): AdminPage {
  if (typeof window === 'undefined') return 'dashboard';
  const hash = window.location.hash.replace('#', '');
  if (hash && isValidPage(hash)) return hash as AdminPage;
  return 'dashboard';
}

function getParamsFromURL(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

function isValidPage(page: string): boolean {
  const validPages: string[] = [
    'dashboard', 'products', 'categories', 'customers', 'customer-detail',
    'orders', 'order-detail', 'returns', 'reports', 'invoice', 'profile', 'settings',
  ];
  return validPages.includes(page);
}

function updateURL(page: AdminPage, params: Record<string, string>) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.pathname, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  window.location.hash = page;
  window.history.pushState({}, '', url.toString() + '#' + page);
}

export const useAdminNavigation = create<AdminNavigationState>((set, get) => ({
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
