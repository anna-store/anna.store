import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Busca o usuário atual baseado no userId (sessão local) ou na identidade de auth.
 */
export const getCurrentUser = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    // Prioridade 1: busca direta por ID (sessão local)
    if (args.userId) {
      return await ctx.db.get(args.userId);
    }

    // Prioridade 2: busca pela identidade de auth (Hercules, quando disponível)
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return null;
      }

      return await ctx.db
        .query("users")
        .withIndex("by_token", (q) =>
          q.eq("tokenIdentifier", identity.tokenIdentifier)
        )
        .unique();
    } catch (e) {
      console.error("Erro ao buscar identidade do usuário:", e);
      return null;
    }
  },
});

/**
 * Cria ou atualiza o usuário após o login.
 */
export const storeUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (existingUser !== null) {
      if (existingUser.name !== identity.name || existingUser.email !== identity.email) {
        await ctx.db.patch(existingUser._id, {
          name: identity.name,
          email: identity.email,
        });
      }
      return existingUser._id;
    }

    return await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      name: identity.name,
      email: identity.email,
      isAdmin: false,
    });
  },
});

/**
 * Atualiza os dados do perfil do usuário.
 */
export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    street: v.optional(v.string()),
    number: v.optional(v.string()),
    neighborhood: v.optional(v.string()),
    complement: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...data } = args;

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    await ctx.db.patch(userId, { ...data });
  },
});

/**
 * Mutação de fallback para cadastro direto no banco.
 */
export const registerUser = mutation({
  args: { name: v.string(), email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    // Validação rigorosa de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new Error("Por favor, insira um e-mail válido (ex: seu@email.com).");
    }

    const existing = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .unique();

    if (existing) throw new Error("Este e-mail já está cadastrado.");

    return await ctx.db.insert("users", {
      tokenIdentifier: `local:${args.email}`,
      name: args.name,
      email: args.email,
      password: args.password,
      isAdmin: false,
      createdAt: Date.now(),
      totalSpent: 0,
    });
  },
});

/**
 * Mutação de fallback para login direto no banco.
 */
export const loginUser = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (!user) {
      throw new Error("Usuário não encontrado. Por favor, cadastre-se.");
    }

    if (user.password !== args.password) {
      throw new Error("E-mail ou senha incorretos.");
    }

    return user;
  },
});

/**
 * Mutação para login/cadastro via Google ou outros provedores sociais.
 */
export const loginWithSocial = mutation({
  args: { 
    email: v.string(), 
    name: v.string(), 
    avatar: v.optional(v.string()),
    provider: v.string(),
    tokenIdentifier: v.string()
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .unique();

    if (existing) {
      // Atualiza nome/avatar se mudou
      if (existing.name !== args.name || (args.avatar && existing.avatar !== args.avatar)) {
        await ctx.db.patch(existing._id, {
          name: args.name,
          avatar: args.avatar,
        });
      }
      return existing;
    }

    // Se não existe pelo token, busca por email (caso tenha conta local)
    const byEmail = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .unique();

    if (byEmail) {
      // Vincula o token social à conta existente
      await ctx.db.patch(byEmail._id, {
        tokenIdentifier: args.tokenIdentifier,
        avatar: args.avatar || byEmail.avatar,
      });
      return byEmail;
    }

    // Cria novo usuário
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      avatar: args.avatar,
      tokenIdentifier: args.tokenIdentifier,
      isAdmin: false,
    });

    return await ctx.db.get(userId);
  },
});
/**
 * Solicita a redefinição de senha.
 * Gera um token e define uma expiração.
 */
export const requestPasswordReset = mutation({
  args: { email: v.string(), appUrl: v.string() },
  handler: async (ctx, args) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new Error("E-mail inválido.");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (!user) {
      // Por segurança, não revelamos se o e-mail existe
      return { success: true };
    }

    const token = Math.random().toString(36).substring(2, 15);
    const expires = Date.now() + 3600000; // 1 hora

    await ctx.db.patch(user._id, {
      resetPasswordToken: token,
      resetPasswordExpires: expires,
    });

    const resetLink = `${args.appUrl}/auth?token=${token}`;

    return { success: true, resetLink };
  },
});

/**
 * Define uma nova senha usando o token de redefinição.
 */
export const resetPassword = mutation({
  args: { token: v.string(), newPassword: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_reset_token", (q) => q.eq("resetPasswordToken", args.token))
      .unique();

    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < Date.now()) {
      throw new Error("Link de redefinição inválido ou expirado.");
    }

    await ctx.db.patch(user._id, {
      password: args.newPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    });

    return { success: true };
  },
});
