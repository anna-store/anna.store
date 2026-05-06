import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

/**
 * Cria uma preferência de pagamento no Mercado Pago.
 */
export const createPreference = action({
  args: {
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
    address: v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zip: v.string(),
    }),
    appUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!accessToken) {
      console.warn("MERCADOPAGO_ACCESS_TOKEN não configurado. Retornando link de teste.");
      return { initPoint: "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=dummy" };
    }

    try {
      console.log("Iniciando criação de preferência no Mercado Pago...");
      
      const payload = {
        items: args.items.map((item) => ({
          title: item.name,
          unit_price: Number(item.price.toFixed(2)),
          quantity: item.quantity,
          currency_id: "BRL",
          picture_url: item.image,
        })),
        back_urls: {
          success: `${args.appUrl}/checkout/retorno`,
          failure: `${args.appUrl}/checkout/retorno`,
          pending: `${args.appUrl}/checkout/retorno`,
        },
        // Auto_return removido para evitar erros de validação com localhost
        statement_descriptor: "ANNA STORE",
        external_reference: "ORDER_" + Date.now(),
        metadata: {
          userId: identity?.subject,
          address: args.address,
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
        console.error("ERRO DETALHADO MERCADO PAGO:", JSON.stringify(data, null, 2));
        throw new Error(data.message || "Erro ao criar preferência");
      }

      console.log("Preferência criada com sucesso!");
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
    } catch (error) {
      console.error("Erro ao processar webhook:", error);
    }
  },
});
