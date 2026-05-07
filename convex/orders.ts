import { ConvexError, v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

/**
 * Busca os pedidos do usuário logado via sessão local.
 */
export const getMyOrders = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    // Tenta usar o userId passado (sessão local)
    if (args.userId) {
      return await ctx.db
        .query("orders")
        .withIndex("by_user", (q) => q.eq("userId", args.userId!))
        .order("desc")
        .collect();
    }

    // Fallback: tenta auth identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!user) return [];
    return await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

/**
 * Busca um pedido específico pelo ID.
 */
export const getOrderById = query({
  args: { userId: v.optional(v.id("users")), orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new ConvexError({ code: "NOT_FOUND", message: "Order not found" });

    // Verifica propriedade se userId foi passado
    if (args.userId && order.userId !== args.userId) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Order not found" });
    }

    return order;
  },
});

/**
 * Cria um novo pedido (Mutação Interna).
 * Chamada pelo backend durante o checkout.
 */
export const internalCreateOrder = internalMutation({
  args: {
    userId: v.id("users"),
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
  handler: async (ctx, args) => {
    return await ctx.db.insert("orders", {
      userId: args.userId,
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

/**
 * Atualiza o status de um pedido.
 */
/**
 * Atualiza o status de um pedido (Interno).
 */
export const internalUpdateStatus = internalMutation({
  args: { 
    orderId: v.id("orders"), 
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled"),
    ),
    mpPaymentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const patch: any = { status: args.status };
    if (args.mpPaymentId) patch.mpPaymentId = args.mpPaymentId;
    await ctx.db.patch(args.orderId, patch);
  },
});
