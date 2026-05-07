import { ConvexError, v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel.d.ts";

// ─── Helper: verify caller is admin ──────────────────────────────────────────
async function requireAdmin(ctx: QueryCtx | MutationCtx, userId?: Id<"users">) {
  if (!userId) throw new ConvexError({ code: "UNAUTHENTICATED", message: "Not logged in" });
  const user = await ctx.db.get(userId);
  if (!user?.isAdmin) throw new ConvexError({ code: "FORBIDDEN", message: "Admin only" });
  return user;
}

// ─── Stats ────────────────────────────────────────────────────────────────────
export const getStats = query({
  args: { callerId: v.optional(v.id("users")) },
  handler: async (ctx, args): Promise<{
    totalOrders: number;
    totalRevenue: number;
    totalUsers: number;
    pendingOrders: number;
    recentOrders: Array<{
      _id: Id<"orders">;
      createdAt: string;
      total: number;
      status: string;
      userName: string | null;
    }>;
    revenueByDay: Array<{ date: string; revenue: number; orders: number }>;
  }> => {
    await requireAdmin(ctx, args.callerId);

    const allOrders = await ctx.db.query("orders").collect();
    const allUsers = await ctx.db.query("users").collect();

    const totalRevenue = allOrders
      .filter((o) => o.status !== "cancelled")
      .reduce((s, o) => s + o.total, 0);

    const pendingOrders = allOrders.filter(
      (o) => o.status === "pending" || o.status === "confirmed",
    ).length;

    // Recent 10 orders with user name
    const sorted = [...allOrders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const recent = sorted.slice(0, 10);
    const recentOrders = await Promise.all(
      recent.map(async (o) => {
        const user = await ctx.db.get(o.userId);
        return {
          _id: o._id,
          createdAt: o.createdAt,
          total: o.total,
          status: o.status,
          userName: user?.name ?? user?.email ?? null,
        };
      }),
    );

    // Revenue last 7 days
    const days: Record<string, { revenue: number; orders: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days[key] = { revenue: 0, orders: 0 };
    }
    for (const o of allOrders) {
      if (o.status === "cancelled") continue;
      const key = o.createdAt.slice(0, 10);
      if (days[key]) {
        days[key].revenue += o.total;
        days[key].orders += 1;
      }
    }
    const revenueByDay = Object.entries(days).map(([date, v]) => ({ date, ...v }));

    return {
      totalOrders: allOrders.length,
      totalRevenue,
      totalUsers: allUsers.length,
      pendingOrders,
      recentOrders,
      revenueByDay,
    };
  },
});

// ─── All orders ───────────────────────────────────────────────────────────────
export const getAllOrders = query({
  args: {
    callerId: v.optional(v.id("users")),
    statusFilter: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Array<{
    _id: Id<"orders">;
    createdAt: string;
    total: number;
    subtotal: number;
    discount: number;
    shipping: number;
    status: string;
    items: Array<{ productId: string; name: string; image: string; price: number; quantity: number }>;
    address: { street: string; city: string; state: string; zip: string };
    couponCode?: string;
    userName: string | null;
    userEmail: string | null;
  }>> => {
    await requireAdmin(ctx, args.callerId);

    const allOrders = await ctx.db.query("orders").order("desc").collect();
    const filtered =
      args.statusFilter && args.statusFilter !== "all"
        ? allOrders.filter((o) => o.status === args.statusFilter)
        : allOrders;

    return await Promise.all(
      filtered.map(async (o) => {
        const user = await ctx.db.get(o.userId);
        return {
          ...o,
          userName: user?.name ?? null,
          userEmail: user?.email ?? null,
        };
      }),
    );
  },
});

// ─── All users ────────────────────────────────────────────────────────────────
export const getAllUsers = query({
  args: { callerId: v.optional(v.id("users")) },
  handler: async (ctx, args): Promise<Array<{
    _id: Id<"users">;
    name?: string;
    email?: string;
    phone?: string;
    isAdmin?: boolean;
    _creationTime: number;
    orderCount: number;
    totalSpent: number;
  }>> => {
    await requireAdmin(ctx, args.callerId);
    const users = await ctx.db.query("users").collect();
    return await Promise.all(
      users.map(async (u) => {
        const orders = await ctx.db
          .query("orders")
          .withIndex("by_user", (q) => q.eq("userId", u._id))
          .collect();
        const totalSpent = orders
          .filter((o) => o.status !== "cancelled")
          .reduce((s, o) => s + o.total, 0);
        return { ...u, orderCount: orders.length, totalSpent };
      }),
    );
  },
});

// ─── Update order status ──────────────────────────────────────────────────────
export const updateOrderStatus = mutation({
  args: {
    callerId: v.optional(v.id("users")),
    orderId: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled"),
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.callerId);
    await ctx.db.patch(args.orderId, { status: args.status });
  },
});

// ─── Toggle admin role ────────────────────────────────────────────────────────
export const toggleAdmin = mutation({
  args: { callerId: v.optional(v.id("users")), userId: v.id("users"), isAdmin: v.boolean() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.callerId);
    await ctx.db.patch(args.userId, { isAdmin: args.isAdmin });
  },
});

// ─── Bootstrap first admin (only works when no admins exist) ─────────────────
export const bootstrapAdmin = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const allUsers = await ctx.db.query("users").collect();
    const hasAdmin = allUsers.some((u) => u.isAdmin);
    if (hasAdmin) throw new ConvexError({ code: "FORBIDDEN", message: "An admin already exists" });

    const user = await ctx.db.get(args.userId);
    if (!user) throw new ConvexError({ code: "NOT_FOUND", message: "User not found" });

    await ctx.db.patch(user._id, { isAdmin: true });
    return user._id;
  },
});

// ─── Products ────────────────────────────────────────────────────────────────
export const getAllProducts = query({
  args: { callerId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.callerId);
    return await ctx.db.query("products").order("desc").collect();
  },
});

export const createProduct = mutation({
  args: {
    callerId: v.optional(v.id("users")),
    product: v.object({
      name: v.string(),
      brand: v.string(),
      category: v.string(),
      price: v.number(),
      originalPrice: v.optional(v.number()),
      images: v.array(v.string()),
      description: v.string(),
      sizes: v.array(v.string()),
      colors: v.array(v.string()),
      rating: v.number(),
      reviews: v.number(),
      inStock: v.boolean(),
      isNew: v.optional(v.boolean()),
      isFeatured: v.optional(v.boolean()),
      isBestSeller: v.optional(v.boolean()),
      tags: v.array(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.callerId);
    return await ctx.db.insert("products", args.product);
  },
});

export const updateProduct = mutation({
  args: {
    callerId: v.optional(v.id("users")),
    productId: v.id("products"),
    product: v.object({
      name: v.string(),
      brand: v.string(),
      category: v.string(),
      price: v.number(),
      originalPrice: v.optional(v.number()),
      images: v.array(v.string()),
      description: v.string(),
      sizes: v.array(v.string()),
      colors: v.array(v.string()),
      rating: v.number(),
      reviews: v.number(),
      inStock: v.boolean(),
      isNew: v.optional(v.boolean()),
      isFeatured: v.optional(v.boolean()),
      isBestSeller: v.optional(v.boolean()),
      tags: v.array(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.callerId);
    await ctx.db.patch(args.productId, args.product);
  },
});

export const deleteProduct = mutation({
  args: { callerId: v.optional(v.id("users")), productId: v.id("products") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.callerId);
    await ctx.db.delete(args.productId);
  },
});

// ─── Exchanges ───────────────────────────────────────────────────────────────
export const getAllExchanges = query({
  args: { callerId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.callerId);
    const exchanges = await ctx.db.query("exchanges").order("desc").collect();
    return await Promise.all(
      exchanges.map(async (e) => {
        const user = await ctx.db.get(e.userId);
        return { ...e, userName: user?.name ?? user?.email ?? "Cliente" };
      })
    );
  },
});

export const updateExchangeStatus = mutation({
  args: {
    callerId: v.optional(v.id("users")),
    exchangeId: v.id("exchanges"),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"), v.literal("completed")),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.callerId);
    await ctx.db.patch(args.exchangeId, { status: args.status, adminNotes: args.adminNotes });
  },
});

// ─── Reviews ─────────────────────────────────────────────────────────────────
export const getAllReviews = query({
  args: { callerId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.callerId);
    return await ctx.db.query("reviews").order("desc").collect();
  },
});

export const deleteReview = mutation({
  args: { callerId: v.optional(v.id("users")), reviewId: v.id("reviews") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.callerId);
    await ctx.db.delete(args.reviewId);
  },
});

// ─── Coupons ─────────────────────────────────────────────────────────────────
export const getAllCoupons = query({
  args: { callerId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.callerId);
    return await ctx.db.query("coupons").order("desc").collect();
  },
});

export const createCoupon = mutation({
  args: {
    callerId: v.optional(v.id("users")),
    coupon: v.object({
      code: v.string(),
      discountType: v.union(v.literal("percentage"), v.literal("fixed")),
      discountValue: v.number(),
      minOrderValue: v.number(),
      expiresAt: v.optional(v.string()),
      isActive: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.callerId);
    // Uppercase code for consistency
    const coupon = { ...args.coupon, code: args.coupon.code.toUpperCase().trim() };
    return await ctx.db.insert("coupons", coupon);
  },
});

export const toggleCoupon = mutation({
  args: { callerId: v.optional(v.id("users")), couponId: v.id("coupons"), isActive: v.boolean() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.callerId);
    await ctx.db.patch(args.couponId, { isActive: args.isActive });
  },
});

export const deleteCoupon = mutation({
  args: { callerId: v.optional(v.id("users")), couponId: v.id("coupons") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.callerId);
    await ctx.db.delete(args.couponId);
  },
});

// ─── Internal: used by seed/test setups ──────────────────────────────────────
export const _setAdmin = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { isAdmin: true });
  },
});

/**
 * Configura o administrador único do sistema.
 * Remove privilégios de qualquer outro usuário.
 */
export const setupMainAdmin = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    // 1. Busca todos os admins atuais e remove
    const allAdmins = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("isAdmin"), true))
      .collect();

    for (const admin of allAdmins) {
      if (admin.email !== args.email) {
        await ctx.db.patch(admin._id, { isAdmin: false });
      }
    }

    // 2. Busca ou cria o novo admin principal
    const target = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (target) {
      await ctx.db.patch(target._id, { isAdmin: true });
      return { status: "updated", id: target._id };
    } else {
      const id = await ctx.db.insert("users", {
        email: args.email,
        name: args.email.split("@")[0],
        isAdmin: true,
        tokenIdentifier: `local:${args.email}`,
        createdAt: Date.now(),
        totalSpent: 0,
        password: "admin_annast_2025", 
      });
      return { status: "created", id };
    }
  },
});
