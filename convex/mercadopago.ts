import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { internal } from "./_generated/api";

/**
 * Cria uma preferência de pagamento no Mercado Pago.
 */
export const createPreference = action({
  args: {
    userId: v.id("users"), // Requerido para criar o pedido
    items: v.array(
      v.object({
        productId: v.string(),
        name: v.string(),
        image: v.string(),
        price: v.number(),
        quantity: v.number(),
      })
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
    appUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!accessToken) {
      console.warn("MERCADOPAGO_ACCESS_TOKEN não configurado.");
      return { initPoint: "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=dummy" };
    }

    try {
      // 1. Cria o pedido no banco de dados com status "pending"
      const orderId = await ctx.runMutation(internal.orders.internalCreateOrder, {
        userId: args.userId,
        items: args.items,
        subtotal: args.subtotal,
        discount: args.discount,
        shipping: args.shipping,
        total: args.total,
        couponCode: args.couponCode,
        address: args.address,
      });

      console.log(`Pedido ${orderId} criado como pendente.`);

      // 2. Cria a preferência no Mercado Pago
      const payload = {
        items: args.items.map((item) => ({
          title: item.name,
          unit_price: Number(item.price.toFixed(2)),
          quantity: item.quantity,
          currency_id: "BRL",
          picture_url: item.image,
        })),
        back_urls: {
          success: `${args.appUrl}/checkout/retorno?status=success&orderId=${orderId}`,
          failure: `${args.appUrl}/checkout/retorno?status=failure&orderId=${orderId}`,
          pending: `${args.appUrl}/checkout/retorno?status=pending&orderId=${orderId}`,
        },
        statement_descriptor: "ANNA STORE",
        external_reference: orderId, // Crucial para o Webhook
        metadata: {
          userId: args.userId,
          orderId: orderId,
        }
      };

      const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error("ERRO MERCADO PAGO:", data);
        throw new Error(data.message || "Erro ao criar preferência");
      }

      return { initPoint: data.init_point };
    } catch (error: any) {
      console.error("Erro na Action Mercado Pago:", error.message);
      throw new ConvexError({
        message: error.message || "Falha ao processar pagamento",
        code: "MP_ERROR",
      });
    }
  },
});

/**
 * Webhook para receber notificações de pagamento do Mercado Pago.
 */
export const handleWebhook = internalAction({
  args: { body: v.string() },
  handler: async (ctx, args) => {
    try {
      const data = JSON.parse(args.body);
      console.log("Mercado Pago Webhook recebido:", data);
      
      // Aqui poderíamos processar o pagamento real via API de pagamentos do MP
      // e atualizar o status do pedido para "confirmed".
    } catch (error) {
      console.error("Erro ao processar webhook:", error);
    }
  },
});
