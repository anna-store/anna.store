import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    avatar: v.optional(v.string()),
    password: v.optional(v.string()),
    isAdmin: v.optional(v.boolean()),
    resetPasswordToken: v.optional(v.string()),
    resetPasswordExpires: v.optional(v.number()),
    street: v.optional(v.string()),
    number: v.optional(v.string()),
    neighborhood: v.optional(v.string()),
    complement: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    totalSpent: v.optional(v.number()),
  }).index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"])
    .index("by_reset_token", ["resetPasswordToken"]),

  orders: defineTable({
    userId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled"),
    ),
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
    mpPreferenceId: v.optional(v.string()),
    mpPaymentId: v.optional(v.string()),
    address: v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zip: v.string(),
    }),
    trackingCode: v.optional(v.string()),
    createdAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_status", ["userId", "status"])
    .index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"]),

  exchanges: defineTable({
    orderId: v.id("orders"),
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
    reason: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("completed"),
    ),
    resolution: v.optional(v.union(
      v.literal("credit"),
      v.literal("replacement"),
    )),
    adminNotes: v.optional(v.string()),
    createdAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_order", ["orderId"])
    .index("by_status", ["status"]),

  reviews: defineTable({
    productId: v.string(),
    userId: v.id("users"),
    orderId: v.id("orders"),
    rating: v.number(),
    comment: v.string(),
    userName: v.string(),
    userAvatar: v.optional(v.string()),
    createdAt: v.string(),
  })
    .index("by_product", ["productId"])
    .index("by_order", ["orderId"])
    .index("by_user", ["userId"]),

  products: defineTable({
    name: v.string(),
    brand: v.string(),
    category: v.string(),
    price: v.number(),
    originalPrice: v.optional(v.number()),
    images: v.array(v.string()),
    description: v.optional(v.string()),
    sizes: v.array(v.string()),
    colors: v.array(v.string()),
    rating: v.number(),
    reviews: v.number(),
    inStock: v.boolean(),
    isNew: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
    isBestSeller: v.optional(v.boolean()),
    gender: v.optional(v.string()), // Feminino, Masculino, Kids
    tags: v.array(v.string()),
  }).index("by_category", ["category"]),

  coupons: defineTable({
    code: v.string(),
    discountType: v.union(v.literal("percentage"), v.literal("fixed")),
    discountValue: v.number(),
    minOrderValue: v.number(),
    expiresAt: v.optional(v.string()),
    freeShipping: v.optional(v.boolean()),
    isActive: v.boolean(),
  }).index("by_code", ["code"]),
});
