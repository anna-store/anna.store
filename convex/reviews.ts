import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Sistema de Avaliações AnnaSt
export const getByProduct = query({
  args: { productId: v.string() },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();
    
    return reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
});

export const createReview = mutation({
  args: {
    productId: v.string(),
    userId: v.id("users"),
    rating: v.number(),
    comment: v.string(),
    userName: v.string(),
    userAvatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const reviewId = await ctx.db.insert("reviews", {
      productId: args.productId,
      userId: args.userId,
      orderId: "verified_manual" as any,
      rating: args.rating,
      comment: args.comment,
      userName: args.userName,
      userAvatar: args.userAvatar,
      createdAt: new Date().toISOString(),
    });

    const product = await ctx.db.get(args.productId as any);
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
