import { create } from 'zustand';

export interface CartItem {
  product_id: number;
  name: string;
  barcode: string;
  price: number;
  qty: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Omit<CartItem, 'qty'>) => void;
  removeItem: (product_id: number) => void;
  updateQty: (product_id: number, qty: number) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (product) =>
    set((state) => {
      const existing = state.items.find(i => i.product_id === product.product_id);
      if (existing) {
        return {
          items: state.items.map(i =>
            i.product_id === product.product_id ? { ...i, qty: i.qty + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { ...product, qty: 1 }] };
    }),
  removeItem: (id) =>
    set(s => ({ items: s.items.filter(i => i.product_id !== id) })),
  updateQty: (id, qty) =>
    set(s => ({
      items: qty <= 0
        ? s.items.filter(i => i.product_id !== id)
        : s.items.map(i => i.product_id === id ? { ...i, qty } : i),
    })),
  clearCart: () => set({ items: [] }),
  total: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
}));