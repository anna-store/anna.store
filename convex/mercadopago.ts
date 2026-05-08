import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

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
      const orderId: Id<"orders"> = await ctx.runMutation(internal.orders.internalCreateOrder, {
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
      const mpItems = args.items.map((item) => ({
        title: item.name,
        unit_price: Number(item.price.toFixed(2)),
        quantity: item.quantity,
        currency_id: "BRL",
        picture_url: item.image,
      }));

      // Adiciona Frete como item se houver
      if (args.shipping > 0) {
        mpItems.push({
          title: "Frete",
          unit_price: Number(args.shipping.toFixed(2)),
          quantity: 1,
          currency_id: "BRL",
          picture_url: "https://cdn-icons-png.flaticon.com/512/709/709790.png",
        });
      }

      // Adiciona Desconto como item negativo se houver
      if (args.discount > 0) {
        mpItems.push({
          title: "Desconto",
          unit_price: -Number(args.discount.toFixed(2)),
          quantity: 1,
          currency_id: "BRL",
          picture_url: "https://cdn-icons-png.flaticon.com/512/1625/1625048.png",
        });
      }

      console.log("MP Payload back_urls:", {
        success: `${args.appUrl}/checkout/retorno`,
        failure: `${args.appUrl}/checkout/retorno`,
        pending: `${args.appUrl}/checkout/retorno`,
      });

      const payload = {
        items: mpItems,
        back_urls: {
          success: `${args.appUrl}/checkout/retorno?status=success&orderId=${orderId}`,
          failure: `${args.appUrl}/checkout/retorno?status=failure&orderId=${orderId}`,
          pending: `${args.appUrl}/checkout/retorno?status=pending&orderId=${orderId}`,
        },
        // auto_return: "approved", // Removido para evitar erro de validação
        statement_descriptor: "ANNA SHOES",
        external_reference: orderId,
        metadata: {
          userId: args.userId,
          orderId: orderId,
        }
      };

      const response: Response = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data: any = await response.json();
      
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
 * Gera um link de pagamento para um pedido já existente.
 */
export const createPayment = action({
  args: {
    orderId: v.id("orders"),
    items: v.array(
      v.object({
        productId: v.string(),
        name: v.string(),
        image: v.string(),
        price: v.number(),
        quantity: v.number(),
      })
    ),
    appUrl: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado.");
    }

    const mpItems = args.items.map((item) => ({
      title: item.name,
      unit_price: Number(item.price.toFixed(2)),
      quantity: item.quantity,
      currency_id: "BRL",
      picture_url: item.image,
    }));

    const payload = {
      items: mpItems,
      back_urls: {
        success: `${args.appUrl}/checkout/retorno?status=success&orderId=${args.orderId}`,
        failure: `${args.appUrl}/checkout/retorno?status=failure&orderId=${args.orderId}`,
        pending: `${args.appUrl}/checkout/retorno?status=pending&orderId=${args.orderId}`,
      },
      statement_descriptor: "ANNA SHOES",
      external_reference: args.orderId,
      metadata: {
        userId: args.userId,
        orderId: args.orderId,
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
    if (!response.ok) throw new Error(data.message || "Erro ao criar link de pagamento");

    return { init_point: data.init_point };
  },
});

/**
 * Webhook para receber notificações de pagamento do Mercado Pago.
 */
export const handleWebhook = internalAction({
  args: { body: v.string() },
  handler: async (ctx, args) => {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) return;

    try {
      const payload = JSON.parse(args.body);
      console.log("MP Webhook Payload:", payload);

      // Verificamos se a notificação é de um pagamento
      if (payload.type === "payment" || payload.action === "payment.created" || payload.action === "payment.updated") {
        const paymentId = payload.data?.id || payload.id;
        if (!paymentId) return;

        // 1. Consulta os detalhes do pagamento no MP
        const response: Response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) return;
        const payment: any = await response.json();

        const orderId: Id<"orders"> = payment.external_reference as Id<"orders">;
        const status: string = payment.status;

        console.log(`Pagamento ${paymentId} para pedido ${orderId}: status ${status}`);

        // 2. Se aprovado, atualiza o pedido para "confirmed"
        if (status === "approved" && orderId) {
          await ctx.runMutation(internal.orders.internalUpdateStatus, {
            orderId,
            status: "confirmed",
            mpPaymentId: String(paymentId),
          });
          console.log(`Pedido ${orderId} CONFIRMADO via Webhook.`);
        }
      }
    } catch (error) {
      console.error("Erro ao processar webhook:", error);
    }
  },
});
