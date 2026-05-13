import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

const MELHORENVIO_URL = process.env.MELHORENVIO_URL || "https://sandbox.melhorenvio.com.br";
const MELHORENVIO_TOKEN = process.env.MELHORENVIO_TOKEN;

export const calculateShipping = action({
  args: {
    zip: v.string(),
    items: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    if (!MELHORENVIO_TOKEN) {
      throw new Error("MELHORENVIO_TOKEN não configurado nas variáveis de ambiente do Convex.");
    }

    // 1. Buscar detalhes dos produtos para obter pesos e medidas
    const productsDetails = [];
    for (const item of args.items) {
      const product = await ctx.runQuery(api.products.getById, { productId: item.productId });
      if (product) {
        productsDetails.push({ ...product, quantity: item.quantity });
      }
    }

    // 2. Agrupar itens por CEP de origem (Dropshipping Multi-origem)
    const groups: Record<string, any[]> = {};
    const defaultZip = "01103000"; // CEP padrão de exemplo (Bom Retiro, SP) - Ajuste para o seu principal

    for (const item of productsDetails) {
      const origin = item.fromZip || defaultZip;
      if (!groups[origin]) groups[origin] = [];
      groups[origin].push({
        id: item._id,
        width: item.width || 20,
        height: item.height || 15,
        length: item.length || 30,
        weight: item.weight || 1.0,
        insurance_value: 100, // Valor seguro padrão
        quantity: item.quantity,
      });
    }

    // 2. Fazer a cotação para cada origem
    const allQuotes: any[] = [];

    for (const [fromZip, products] of Object.entries(groups)) {
      const body = {
        from: { postal_code: fromZip.replace(/\D/g, "") },
        to: { postal_code: args.zip.replace(/\D/g, "") },
        products,
      };

      try {
        const response = await fetch(`${MELHORENVIO_URL}/api/v2/me/shipment/calculate`, {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${MELHORENVIO_TOKEN}`,
            "User-Agent": "AnnaSt Store (contato@annast.store)"
          },
          body: JSON.stringify(body),
        });

        const quotes = await response.json();
        if (Array.isArray(quotes)) {
          allQuotes.push(quotes.filter(q => !q.error));
        }
      } catch (error) {
        console.error(`Erro ao cotar frete para origem ${fromZip}:`, error);
      }
    }

    // 3. Consolidar cotações (Soma o custo de cada origem para o mesmo serviço)
    // Simplificação: Pegamos os serviços comuns (PAC, SEDEX) e somamos
    const consolidated: Record<string, any> = {};

    for (const quotes of allQuotes) {
      for (const quote of quotes) {
        if (!consolidated[quote.name]) {
          consolidated[quote.name] = {
            id: quote.id,
            name: quote.name,
            price: 0,
            delivery_time: 0,
            company: quote.company.name,
          };
        }
        consolidated[quote.name].price += parseFloat(quote.price);
        // O tempo de entrega será o maior entre as origens
        consolidated[quote.name].delivery_time = Math.max(consolidated[quote.name].delivery_time, quote.delivery_time);
      }
    }

    return Object.values(consolidated);
  },
});
