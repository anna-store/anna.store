import { create } from "zustand";
import { persist } from "zustand/middleware";

type WishlistStore = {
  items: string[]; // product ids
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
};

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (productId) => {
        const has = get().items.includes(productId);
        set((state) => ({
          items: has ? state.items.filter((id) => id !== productId) : [...state.items, productId],
        }));
      },
      has: (productId) => get().items.includes(productId),
    }),
    { name: "store-wishlist" }
  )
);
