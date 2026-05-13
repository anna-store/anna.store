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
    console.log("calculateShipping chamado com:", JSON.stringify(args, null, 2));
    console.log("Usando URL:", MELHORENVIO_URL);
    if (!MELHORENVIO_TOKEN) {
      console.error("ERRO: MELHORENVIO_TOKEN não encontrado!");
      throw new Error("MELHORENVIO_TOKEN não configurado nas variáveis de ambiente do Convex.");
    }

    // 1. Buscar detalhes dos produtos para obter pesos e medidas
    const productsDetails = [];
    for (const item of args.items) {
      try {
        const product = await ctx.runQuery(api.products.getById, { productId: item.productId });
        if (product) {
          productsDetails.push({ ...product, quantity: item.quantity });
        } else {
          console.warn(`AVISO: Produto não encontrado no banco: ${item.productId}`);
        }
      } catch (e) {
        console.error(`Erro ao buscar produto ${item.productId}:`, e);
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
    const entries = Object.entries(groups);

    for (const entry of entries) {
      const fromZip = entry[0];
      const products = entry[1];
      
      console.log(`Cotando frete para origem ${fromZip} para destino ${args.zip}`);
      const body = {
        from: { postal_code: fromZip.replace(/\D/g, "") },
        to: { postal_code: args.zip.replace(/\D/g, "") },
        products,
      };
      console.log("Corpo da requisição ME:", JSON.stringify(body, null, 2));

      try {
        const response: any = await fetch(`${MELHORENVIO_URL}/api/v2/me/shipment/calculate`, {
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
        console.log(`Resposta ME para ${fromZip}:`, JSON.stringify(quotes, null, 2));
        if (Array.isArray(quotes)) {
          allQuotes.push(quotes.filter((q: any) => !q.error));
        } else {
          console.error("Resposta do Melhor Envio não é um array:", quotes);
        }
      } catch (error) {
        console.error(`Erro ao cotar frete para origem ${fromZip}:`, error);
      }
    }

    // 3. Consolidar cotações
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
        consolidated[quote.name].delivery_time = Math.max(consolidated[quote.name].delivery_time, quote.delivery_time);
      }
    }

    return Object.values(consolidated);
  },
});

/**
 * Adiciona um pedido ao carrinho do Melhor Envio para emissão de etiqueta.
 */
export const addToCart = action({
  args: {
    orderId: v.id("orders"),
    callerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    if (!MELHORENVIO_TOKEN) throw new Error("Token não configurado");

    // 1. Buscar dados do pedido e do usuário
    const order = await ctx.runQuery(api.orders.getOrderById, { orderId: args.orderId, userId: args.callerId });
    if (!order) throw new Error("Pedido não encontrado");

    const user = await ctx.runQuery(api.users.getCurrentUser, { userId: order.userId });
    if (!user) throw new Error("Usuário não encontrado");

    // 2. Preparar volumes (agrupando por produto)
    const volumes = [];
    for (const item of order.items) {
      const product = await ctx.runQuery(api.products.getById, { productId: item.productId as any });
      if (product) {
        for (let i = 0; i < item.quantity; i++) {
          volumes.push({
            height: product.height || 15,
            width: product.width || 20,
            length: product.length || 30,
            weight: product.weight || 0.8,
          });
        }
      }
    }

    // 3. Montar o corpo da requisição para o Melhor Envio
    // OBS: Os dados de "from" (Remetente) devem ser os da sua loja Anna Shoes.
    // Você pode configurar estas variáveis no Dashboard do Convex.
    const body = {
      service: order.shippingServiceId || 1, // Padrão 1 (SEDEX) se não houver
      from: {
        name: process.env.STORE_NAME || "Anna Shoes",
        phone: process.env.STORE_PHONE || "31999999999",
        email: process.env.STORE_EMAIL || "contato@annast.store",
        document: process.env.STORE_DOCUMENT || "00000000000000",
        address: process.env.STORE_ADDRESS || "Rua Principal",
        number: "100",
        district: "Centro",
        city: "Belo Horizonte",
        state_abbr: "MG",
        postal_code: (order.items[0] as any).fromZip || "30000000", // Origem do primeiro item
      },
      to: {
        name: user.name || "Cliente AnnaSt",
        phone: user.phone || "00000000000",
        email: user.email || "",
        document: user.document || "00000000000", // CPF obrigatório no ME
        address: order.address.street,
        number: order.address.number || "SN",
        district: order.address.neighborhood || "Bairro",
        city: order.address.city,
        state_abbr: order.address.state,
        postal_code: order.address.zip.replace(/\D/g, ""),
      },
      products: order.items.map((i: any) => ({
        name: i.name,
        quantity: i.quantity,
        unitary_value: i.price,
      })),
      volumes,
      options: {
        insurance_value: order.total,
        receipt: false,
        own_hand: false,
        reverse: false,
        non_commercial: true, // Declaração de conteúdo simples
      }
    };

    try {
      const response: any = await fetch(`${MELHORENVIO_URL}/api/v2/me/cart`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${MELHORENVIO_TOKEN}`,
          "User-Agent": "AnnaSt Store (contato@annast.store)"
        },
        body: JSON.stringify(body),
      });

      const result: any = await response.json();
      if (result.error) throw new Error(JSON.stringify(result.errors));

      return { success: true, cartId: result.id };
    } catch (error: any) {
      console.error("Erro ao enviar para o Melhor Envio:", error);
      throw new Error("Erro na integração com Melhor Envio: " + error.message);
    }
  },
});
