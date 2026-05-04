import { create } from 'zustand';

export type Page = 
  | 'home' | 'shop' | 'product' | 'cart' | 'login' | 'signup' | 'profile'
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
}

export const useNavigation = create<NavigationState>((set, get) => ({
  currentPage: 'home',
  pageParams: {},
  previousPages: [],
  navigate: (page, params = {}) => {
    const { currentPage, pageParams, previousPages } = get();
    set({
      previousPages: [...previousPages.slice(-20), { page: currentPage, params: pageParams }],
      currentPage: page,
      pageParams: params,
    });
    window.scrollTo(0, 0);
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
      window.scrollTo(0, 0);
    }
  },
}));
