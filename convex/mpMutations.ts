import { ConvexError, v } from "convex/values";
import { internalMutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel.d.ts";

// ─── Internal: create pending order ──────────────────────────────────────────
export const createPendingOrder = internalMutation({
  args: {
    identity: v.object({
      tokenIdentifier: v.string(),
      name: v.optional(v.string()),
      email: v.optional(v.string()),
    }),
    items: v.array(
      v.object({
        productId: v.string(),
        name: v.string(),
        image: v.string(),
        price: v.number(),
        quantity: v.number(),
      }),
    ),
    subtotal: v.number(),
    discount: v.number(),
    shipping: v.number(),
    total: v.number(),
    couponCode: v.optional(v.string()),
    address: v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zip: v.string(),
    }),
  },
  handler: async (ctx, args): Promise<Id<"orders">> => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.identity.tokenIdentifier))
      .unique();
    if (!user) throw new ConvexError({ code: "NOT_FOUND", message: "User not found" });

    return await ctx.db.insert("orders", {
      userId: user._id,
      status: "pending",
      items: args.items,
      subtotal: args.subtotal,
      discount: args.discount,
      shipping: args.shipping,
      total: args.total,
      couponCode: args.couponCode,
      address: args.address,
      createdAt: new Date().toISOString(),
    });
  },
});

// ─── Internal: save preference ID ────────────────────────────────────────────
export const saveMpPreferenceId = internalMutation({
  args: { orderId: v.id("orders"), mpPreferenceId: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, { mpPreferenceId: args.mpPreferenceId });
  },
});

// ─── Internal: update order status from payment ───────────────────────────────
export const updateOrderFromPayment = internalMutation({
  args: {
    orderId: v.id("orders"),
    mpPaymentId: v.string(),
    status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("cancelled")),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) return;
    await ctx.db.patch(args.orderId, {
      mpPaymentId: args.mpPaymentId,
      status: args.status,
    });
  },
});
