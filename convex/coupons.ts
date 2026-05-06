import { v } from "convex/values";
import { query } from "./_generated/server";

export const validate = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const code = args.code.toUpperCase().trim();
    const coupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", code))
      .filter((q) => q.eq(q.field("isActive"), true))
      .unique();

    if (!coupon) return null;

    // Optional: check expiry date if present
    if (coupon.expiresAt) {
      const now = new Date();
      const expiry = new Date(coupon.expiresAt);
      if (now > expiry) return null;
    }

    return coupon;
  },
});
