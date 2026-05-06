import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Cria uma solicitação de troca para um pedido entregue.
 */
export const createExchange = mutation({
  args: {
    userId: v.id("users"),
    orderId: v.id("orders"),
    items: v.array(
      v.object({
        productId: v.string(),
        name: v.string(),
        image: v.string(),
        price: v.number(),
        quantity: v.number(),
      }),
    ),
    reason: v.string(),
    resolution: v.union(v.literal("credit"), v.literal("replacement")),
  },
  handler: async (ctx, args) => {
    // Valida se o pedido existe e pertence ao usuário
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new ConvexError({ code: "NOT_FOUND", message: "Pedido não encontrado" });
    if (order.userId !== args.userId) throw new ConvexError({ code: "FORBIDDEN", message: "Pedido não pertence a este usuário" });

    // Valida se o pedido está entregue
    if (order.status !== "delivered") {
      throw new ConvexError({ code: "INVALID", message: "Apenas pedidos entregues podem solicitar troca" });
    }

    // Valida prazo de 7 dias
    const deliveredDate = new Date(order.createdAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 7) {
      throw new ConvexError({ code: "EXPIRED", message: "O prazo de 7 dias para solicitar troca expirou" });
    }

    // Valida se já existe uma troca pendente para este pedido
    const existingExchange = await ctx.db
      .query("exchanges")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .filter((q) => q.neq(q.field("status"), "rejected"))
      .first();

    if (existingExchange) {
      throw new ConvexError({ code: "DUPLICATE", message: "Já existe uma solicitação de troca para este pedido" });
    }

    // Valida que pelo menos 1 item foi selecionado
    if (args.items.length === 0) {
      throw new ConvexError({ code: "INVALID", message: "Selecione pelo menos um item para troca" });
    }

    return await ctx.db.insert("exchanges", {
      orderId: args.orderId,
      userId: args.userId,
      items: args.items,
      reason: args.reason,
      status: "pending",
      resolution: args.resolution,
      createdAt: new Date().toISOString(),
    });
  },
});

/**
 * Busca todas as trocas do usuário logado.
 */
export const getMyExchanges = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.userId) return [];
    return await ctx.db
      .query("exchanges")
      .withIndex("by_user", (q) => q.eq("userId", args.userId!))
      .order("desc")
      .collect();
  },
});

/**
 * Busca a troca associada a um pedido específico.
 */
export const getExchangeByOrder = query({
  args: { orderId: v.optional(v.id("orders")) },
  handler: async (ctx, args) => {
    if (!args.orderId) return null;
    return await ctx.db
      .query("exchanges")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId!))
      .first();
  },
});

/**
 * Cancela uma solicitação de troca (apenas se estiver pendente).
 */
export const cancelExchange = mutation({
  args: { userId: v.id("users"), exchangeId: v.id("exchanges") },
  handler: async (ctx, args) => {
    const exchange = await ctx.db.get(args.exchangeId);
    if (!exchange) throw new ConvexError({ code: "NOT_FOUND", message: "Solicitação não encontrada" });
    if (exchange.userId !== args.userId) throw new ConvexError({ code: "FORBIDDEN", message: "Não autorizado" });
    if (exchange.status !== "pending") {
      throw new ConvexError({ code: "INVALID", message: "Apenas solicitações pendentes podem ser canceladas" });
    }

    await ctx.db.delete(args.exchangeId);
  },
});
