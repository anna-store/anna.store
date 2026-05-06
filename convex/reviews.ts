import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";

/**
 * Cria uma nova avaliação para um produto de um pedido entregue.
 */
export const createReview = mutation({
  args: {
    userId: v.id("users"),
    orderId: v.id("orders"),
    productId: v.string(),
    rating: v.number(),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    // Valida se o usuário existe
    const user = await ctx.db.get(args.userId);
    if (!user) throw new ConvexError("Usuário não encontrado");

    // Valida se o pedido existe e está entregue
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new ConvexError("Pedido não encontrado");
    if (order.status !== "delivered") throw new ConvexError("Apenas pedidos entregues podem ser avaliados");
    if (order.userId !== args.userId) throw new ConvexError("Não autorizado");

    // Valida se o produto pertence ao pedido
    const hasProduct = order.items.some((item) => item.productId === args.productId);
    if (!hasProduct) throw new ConvexError("Produto não pertence a este pedido");

    // Valida se já existe avaliação para este produto neste pedido
    const existing = await ctx.db
      .query("reviews")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .filter((q) => q.eq(q.field("productId"), args.productId))
      .first();

    if (existing) throw new ConvexError("Você já avaliou este produto neste pedido");

    return await ctx.db.insert("reviews", {
      productId: args.productId,
      userId: args.userId,
      orderId: args.orderId,
      rating: args.rating,
      comment: args.comment,
      userName: user.name || "Cliente",
      userAvatar: user.avatar,
      createdAt: new Date().toISOString(),
    });
  },
});

/**
 * Busca as avaliações de um produto.
 */
export const getProductReviews = query({
  args: { productId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reviews")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .order("desc")
      .collect();
  },
});

/**
 * Busca todas as avaliações feitas por um usuário.
 */
export const getMyReviews = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.userId) return [];
    return await ctx.db
      .query("reviews")
      .withIndex("by_user", (q) => q.eq("userId", args.userId!))
      .order("desc")
      .collect();
  },
});
