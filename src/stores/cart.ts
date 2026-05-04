import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const { items } = get();
        const existing = items.find(
          (i) => i.product_id === item.product_id && i.size === item.size && i.color === item.color
        );
        if (existing) {
          set({
            items: items.map((i) =>
              i.id === existing.id ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
          });
        } else {
          set({ items: [...items, { ...item, id: `${item.product_id}-${item.size}-${item.color}` }] });
        }
      },
      removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.id !== id) });
        } else {
          set({ items: get().items.map((i) => (i.id === id ? { ...i, quantity } : i)) });
        }
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'clothfasion-cart',
      skipHydration: true,
    }
  )
);
