import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("products").order("desc").collect();
  },
});

export const getById = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.productId);
  },
});

/**
 * Atualiza um produto (Versão de Emergência para Sincronização)
 */
export const updateProduct = mutation({
  args: {
    productId: v.id("products"),
    product: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.productId, args.product);
  },
});

export const getFeatured = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("isFeatured"), true))
      .collect();
  },
});

export const getBestSellers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("isBestSeller"), true))
      .collect();
  },
});

export const getNewArrivals = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("isNew"), true))
      .collect();
  },
});

export const getByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    if (args.category === "Todos") {
      return await ctx.db.query("products").collect();
    }
    return await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
  },
});

/**
 * Busca todas as avaliações de um produto.
 */
export const checkReviews = query({
  args: { productId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reviews")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();
  },
});

/**
 * Cria uma nova avaliação e atualiza o produto.
 */
export const createReview = mutation({
  args: {
    productId: v.id("products"),
    userId: v.id("users"),
    orderId: v.optional(v.id("orders")),
    rating: v.number(),
    comment: v.string(),
    userName: v.string(),
    userAvatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const reviewId = await ctx.db.insert("reviews", {
      productId: args.productId,
      userId: args.userId,
      orderId: args.orderId,
      rating: args.rating,
      comment: args.comment,
      userName: args.userName,
      userAvatar: args.userAvatar,
      createdAt: new Date().toISOString(),
    });

    const product = await ctx.db.get(args.productId);
    if (product) {
      const all = await ctx.db
        .query("reviews")
        .withIndex("by_product", (q) => q.eq("productId", args.productId))
        .collect();

      const avg = all.reduce((acc, r) => acc + r.rating, 0) / all.length;
      await ctx.db.patch(product._id, {
        rating: Number(avg.toFixed(1)),
        reviews: all.length
      });
    }
    return reviewId;
  },
});

/**
 * Cria um produto (Versão de Emergência para Sincronização)
 */
export const createProduct = mutation({
  args: {
    product: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("products", args.product);
  },
});

/**
 * Busca todos os produtos em promoção.
 */
export const getOnSale = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("products")
      .withIndex("by_sale", (q) => q.eq("isOnSale", true))
      .collect();
  },
});

/**
 * Alterna o status de promoção de um produto.
 */
export const toggleSale = mutation({
  args: {
    productId: v.id("products"),
    isOnSale: v.boolean(),
    salePrice: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Produto não encontrado");

    if (args.isOnSale && args.salePrice !== undefined) {
      // Ativando promoção: salva o preço original e aplica o preço promocional
      await ctx.db.patch(args.productId, {
        isOnSale: true,
        originalPrice: product.originalPrice || product.price, // Preserva o original se já existir
        price: args.salePrice,
      });
    } else {
      // Desativando promoção: restaura o preço original
      await ctx.db.patch(args.productId, {
        isOnSale: false,
        price: product.originalPrice || product.price,
        originalPrice: undefined,
      });
    }
  },
});

/**
 * Busca produtos dentro de uma faixa de preço.
 * Usa o index by_price para performance otimizada.
 */
export const getByPriceRange = query({
  args: { minPrice: v.number(), maxPrice: v.optional(v.number()) },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("products")
      .withIndex("by_price", (q) => {
        const withMin = q.gte("price", args.minPrice);
        if (args.maxPrice !== undefined) {
          return withMin.lte("price", args.maxPrice);
        }
        return withMin;
      });
    return await q.take(8);
  },
});
