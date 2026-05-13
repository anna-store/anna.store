import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
};

export const FREE_SHIPPING_THRESHOLD = 250;

type CartStore = {
  items: CartItem[];
  appliedCoupon: { 
    code: string; 
    discountType: "percentage" | "fixed"; 
    discountValue: number;
    minOrderValue: number;
    freeShipping?: boolean;
  } | null;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getDiscount: () => number;
  getFinalTotal: () => number;
  isFreeShipping: () => boolean;
  applyCoupon: (code: string) => boolean; // Legacy/placeholder
  applyRawCoupon: (coupon: any) => void;
  removeCoupon: () => void;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: null,
      addItem: (item) => {
        const existing = get().items.find(
          (i) => i.productId === item.productId && i.size === item.size && i.color === item.color
        );
        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.productId === item.productId && i.size === item.size && i.color === item.color
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          }));
        } else {
          set((state) => ({ items: [...state.items, item] }));
        }
      },
      removeItem: (productId, size, color) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.size === size && i.color === color)
          ),
        }));
      },
      updateQuantity: (productId, size, color, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, size, color);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.size === size && i.color === color
              ? { ...i, quantity }
              : i
          ),
        }));
      },
      clearCart: () => set({ items: [], appliedCoupon: null }),
      getTotal: () => get().items.reduce((acc, i) => acc + i.price * i.quantity, 0),
      getDiscount: () => {
        const total = get().getTotal();
        const coupon = get().appliedCoupon;
        if (!coupon) return 0;
        
        if (coupon.discountType === "percentage") {
          return total * (coupon.discountValue / 100);
        } else {
          return Math.min(total, coupon.discountValue);
        }
      },
      getFinalTotal: () => {
        const total = get().getTotal();
        const discount = get().getDiscount();
        return Math.max(0, total - discount);
      },
      isFreeShipping: () => {
        const subtotal = get().getTotal();
        const coupon = get().appliedCoupon;
        return subtotal >= FREE_SHIPPING_THRESHOLD || coupon?.freeShipping === true;
      },
      applyCoupon: (code) => {
        // Legacy check
        const normalizedCode = code.trim().toUpperCase();
        if (normalizedCode === "QUERO10") {
          set({ appliedCoupon: { 
            code: "QUERO10", 
            discountType: "percentage", 
            discountValue: 10,
            minOrderValue: 0 
          } });
          return true;
        }
        return false;
      },
      applyRawCoupon: (coupon) => {
        set({ appliedCoupon: {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          minOrderValue: coupon.minOrderValue || 0,
          freeShipping: coupon.freeShipping
        } });
      },
      removeCoupon: () => set({ appliedCoupon: null }),
    }),
    { name: "store-cart" }
  )
);
