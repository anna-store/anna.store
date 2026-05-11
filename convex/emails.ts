import { internalAction, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/**
 * Envia e-mails de confirmação de pedido para o lojista e para o cliente.
 */
export const sendOrderConfirmation = internalAction({
  args: { 
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const resendKey = process.env.RESEND_API_KEY;
    
    // 1. Busca os detalhes completos do pedido
    const order = await ctx.runQuery(internal.orders.internalGetOrderById, { orderId: args.orderId });
    if (!order) {
      console.error(`Pedido ${args.orderId} não encontrado para envio de e-mail.`);
      return;
    }

    // 2. Busca os detalhes do usuário (cliente)
    const customer = await ctx.runQuery(internal.users.internalGetUserById, { userId: order.userId });
    if (!customer) {
      console.error(`Cliente ${order.userId} não encontrado para o pedido ${args.orderId}.`);
      return;
    }

    if (!resendKey) {
      console.warn("RESEND_API_KEY não configurada. Configure no painel do Convex para ativar e-mails.");
      return;
    }

    const adminEmail = process.env.ADMIN_EMAIL || customer.email || "vendas@annashoes.com.br";
    const storeName = "AnnaSt Store";

    try {
      // --- E-MAIL PARA O LOJISTA (NOTIFICAÇÃO DE VENDA) ---
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `${storeName} <onboarding@resend.dev>`, // Usando domínio padrão do Resend se não houver domínio próprio
          to: [adminEmail],
          subject: `💰 NOVA VENDA: Pedido #${order._id.slice(0, 8)}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
              <div style="background-color: #ea3372; padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">💰 Nova Venda Realizada!</h1>
              </div>
              <div style="padding: 30px; line-height: 1.6; color: #333;">
                <p>Olá, <strong>Equipe AnnaSt</strong>,</p>
                <p>Um novo pagamento foi confirmado no site. Veja os detalhes abaixo:</p>
                
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0;"><strong>Pedido:</strong> #${order._id}</p>
                  <p style="margin: 0;"><strong>Cliente:</strong> ${customer.name || customer.email}</p>
                  <p style="margin: 0;"><strong>E-mail:</strong> ${customer.email}</p>
                  <p style="margin: 0;"><strong>Valor Total:</strong> R$ ${order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>

                <h3 style="border-bottom: 2px solid #ea3372; padding-bottom: 5px; color: #ea3372;">Itens do Pedido:</h3>
                <ul style="list-style: none; padding: 0;">
                  ${order.items.map((item: any) => `
                    <li style="padding: 10px 0; border-bottom: 1px solid #eee; display: flex; align-items: center;">
                      <div>
                        <strong>${item.name}</strong> (Tam: ${item.size})<br />
                        ${item.quantity}x R$ ${item.price.toFixed(2)}
                      </div>
                    </li>
                  `).join('')}
                </ul>

                <p style="margin-top: 30px;">
                  <a href="https://www.annashoes.com.br/admin" style="background-color: #38b6ff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    Ver no Painel Admin
                  </a>
                </p>
              </div>
              <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #999;">
                Este é um e-mail automático do sistema AnnaSt Store.
              </div>
            </div>
          `,
        }),
      });

      // --- E-MAIL PARA O CLIENTE (CONFIRMAÇÃO DE PAGAMENTO) ---
      if (customer.email) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `${storeName} <onboarding@resend.dev>`,
            to: [customer.email],
            subject: `✅ Pagamento Confirmado! Pedido #${order._id.slice(0, 8)}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
                <div style="background-color: #38b6ff; padding: 30px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">✅ Tudo certo, ${customer.name?.split(' ')[0]}!</h1>
                </div>
                <div style="padding: 30px; line-height: 1.6; color: #333;">
                  <p>Boas notícias! Recebemos a confirmação do seu pagamento para o pedido <strong>#${order._id.slice(0, 8)}</strong>.</p>
                  
                  <p>Nossa equipe já está preparando seus produtos com todo carinho para o envio. Em breve você receberá o código de rastreio por e-mail.</p>

                  <div style="border: 1px solid #eee; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Resumo da Compra:</h3>
                    <p>Total Pago: <strong>R$ ${order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></p>
                    <p>Endereço de Entrega: ${order.address.street}, ${order.address.city}/${order.address.state}</p>
                  </div>

                  <p>Obrigado por escolher a <strong>AnnaSt Store</strong>!</p>
                </div>
                <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #999;">
                  Dúvidas? Responda a este e-mail ou entre em contato pelo nosso WhatsApp.
                </div>
              </div>
            `,
          }),
        });
      }

      console.log(`E-mails de confirmação enviados para pedido ${args.orderId}`);
    } catch (error) {
      console.error("Erro ao enviar e-mails via Resend:", error);
    }
  },
});
