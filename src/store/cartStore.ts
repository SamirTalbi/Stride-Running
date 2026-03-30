import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product, ProductVariant } from "@/types";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;

  // Computed
  itemCount: number;
  subtotal: number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      addItem: (product, variant, quantity = 1) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.product.id === product.id && i.variant.id === variant.id
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === existing.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
              isOpen: true,
            };
          }
          const newItem: CartItem = {
            id: `${product.id}-${variant.id}-${Date.now()}`,
            product: {
              id: product.id,
              name: product.name,
              slug: product.slug,
              images: product.images,
              brand: product.brand,
            },
            variant,
            quantity,
          };
          return { items: [...state.items, newItem], isOpen: true };
        });
      },

      removeItem: (itemId) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== itemId) })),

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === itemId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      get itemCount() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },

      get subtotal() {
        return get().items.reduce(
          (sum, i) => sum + i.variant.price * i.quantity,
          0
        );
      },
    }),
    {
      name: "stride-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
