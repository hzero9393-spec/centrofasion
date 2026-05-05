import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  mobile: string;
  email: string | null;
  avatar: string | null;
  address: string | null;
  pincode: string | null;
  nearby_area: string | null;
  total_orders: number;
  total_spent: number;
}

export interface Admin {
  id: string;
  user_id: string;
  name: string;
  last_name: string | null;
  phone: string | null;
  avatar: string | null;
  is_master: number;
}

interface AuthState {
  customer: Customer | null;
  admin: Admin | null;
  loginCustomer: (customer: Customer) => void;
  logoutCustomer: () => void;
  loginAdmin: (admin: Admin) => void;
  logoutAdmin: () => void;
  isCustomerLoggedIn: () => boolean;
  isAdminLoggedIn: () => boolean;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      customer: null,
      admin: null,
      loginCustomer: (customer) => set({ customer }),
      logoutCustomer: () => set({ customer: null }),
      loginAdmin: (admin) => set({ admin }),
      logoutAdmin: () => set({ admin: null }),
      isCustomerLoggedIn: () => get().customer !== null,
      isAdminLoggedIn: () => get().admin !== null,
    }),
    {
      name: 'clothfasion-auth',
      skipHydration: true,
    }
  )
);
