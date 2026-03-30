import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistStore {
  items: string[]; // product IDs
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  toggleItem: (productId: string) => void;
  hasItem: (productId: string) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (productId) =>
        set((state) => ({
          items: state.items.includes(productId)
            ? state.items
            : [...state.items, productId],
        })),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((id) => id !== productId),
        })),

      toggleItem: (productId) => {
        if (get().hasItem(productId)) {
          get().removeItem(productId);
        } else {
          get().addItem(productId);
        }
      },

      hasItem: (productId) => get().items.includes(productId),

      clear: () => set({ items: [] }),
    }),
    { name: "stride-wishlist" }
  )
);
