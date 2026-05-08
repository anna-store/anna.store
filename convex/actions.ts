import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// ─── Identidade Visual ────────────────────────────────────────────────────────
const LOGO_URL = "https://1.gravatar.com/avatar/450ccf591f7ff7e865f12e74d998ddb5bf7cb1a9abc25fad50c2aa1d0af114c5?s=200";
const BASE_STYLE = `background-color:#050505;color:#ffffff;font-family:'Outfit','Helvetica Neue',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;border-radius:24px;`;

const HEADER = `
  <div style="text-align:center;margin-bottom:30px;">
    <img src="${LOGO_URL}" alt="Anna Shoes" style="width:90px;height:90px;border-radius:18px;border:1px solid rgba(255,255,255,0.1);">
    <h1 style="color:#ffffff;font-size:26px;font-weight:900;letter-spacing:-0.05em;margin:12px 0 0;text-transform:uppercase;">
      ANNA <span style="color:#ea3372;">SHOES</span>
    </h1>
    <div style="height:2px;width:40px;background:#ea3372;margin:12px auto 0;"></div>
  </div>`;

const FOOTER = `
  <div style="border-top:1px solid #1a1a1a;margin-top:40px;padding-top:20px;text-align:center;">
    <p style="color:#444;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.3em;">
      Anna Shoes &copy; 2026 &bull; Boutique Digital de Luxo
    </p>
  </div>`;

// ─── Config por Status ────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { emoji: string; title: string; subtitle: string; color: string; body: string }> = {
  confirmed: {
    emoji: "✅",
    title: "Pedido Confirmado!",
    subtitle: "Seu pagamento foi aprovado e o pedido está sendo preparado.",
    color: "#22c55e",
    body: "Nossa equipe já recebeu seu pedido e está preparando cada item com todo o cuidado que você merece. Em breve você receberá uma notificação quando seu pedido for enviado.",
  },
  shipped: {
    emoji: "🚚",
    title: "Pedido a Caminho!",
    subtitle: "Seu pedido saiu para entrega e está vindo até você.",
    color: "#a855f7",
    body: "Seu pedido foi despachado e já está em trânsito! Fique de olho no seu endereço — em breve seus itens estarão com você. Qualquer dúvida, entre em contato conosco.",
  },
  delivered: {
    emoji: "🎁",
    title: "Pedido Entregue!",
    subtitle: "Seu pedido chegou! Esperamos que você ame.",
    color: "#ea3372",
    body: "Seu pedido foi entregue com sucesso! Esperamos que você adore cada peça. Que tal deixar uma avaliação? Sua opinião é muito importante para nós e ajuda outros clientes.",
  },
  cancelled: {
    emoji: "❌",
    title: "Pedido Cancelado",
    subtitle: "Seu pedido foi cancelado.",
    color: "#ef4444",
    body: "Seu pedido foi cancelado. Se você não solicitou este cancelamento ou tiver alguma dúvida, entre em contato com nossa equipe — ficaremos felizes em ajudar.",
  },
};

// ─── E-mail de Recuperação de Senha ──────────────────────────────────────────
export const sendResetPasswordEmail = action({
  args: {
    email: v.string(),
    resetLink: v.string(),
  },
  handler: async (_ctx, args) => {
    if (!resend) {
      console.error("RESEND_API_KEY não configurada no dashboard do Convex");
      return { success: false, error: "Configuração pendente" };
    }

    try {
      const { data, error } = await resend.emails.send({
        from: "Anna Shoes <contato@annashoes.com.br>",
        to: [args.email],
        subject: "Redefinição de Senha - Anna Shoes",
        html: `
          <div style="${BASE_STYLE}text-align:center;">
            ${HEADER}
            <h2 style="font-size:22px;font-weight:700;margin-bottom:20px;">Recuperação de Acesso</h2>
            <p style="color:#a0a0a0;font-size:16px;line-height:1.6;margin-bottom:30px;padding:0 20px;">
              Olá!<br>
              Recebemos uma solicitação para redefinir a senha da sua conta exclusiva na <strong>Anna Shoes</strong>.
              Se foi você, clique no botão abaixo para prosseguir.
            </p>
            <div style="margin:40px 0;">
              <a href="${args.resetLink}" style="background-color:#ea3372;color:#ffffff;padding:18px 36px;text-decoration:none;border-radius:12px;font-weight:900;font-size:14px;text-transform:uppercase;letter-spacing:0.2em;display:inline-block;box-shadow:0 10px 20px rgba(234,51,114,0.2);">
                Redefinir Senha
              </a>
            </div>
            <p style="color:#666;font-size:12px;margin-top:40px;line-height:1.5;">
              Se você não solicitou esta alteração, por favor ignore este e-mail.<br>
              Este link é válido por 1 hora.
            </p>
            ${FOOTER}
          </div>
        `,
      });

      if (error) {
        console.warn("Resend restriction detected:", error.message);
        return {
          success: false,
          error: error.message,
          isRestricted: error.message.includes("testing emails"),
        };
      }

      return { success: true, data };
    } catch (err: any) {
      console.error("Erro inesperado no envio de e-mail:", err);
      return { success: false, error: err.message };
    }
  },
});

// ─── E-mail de Status do Pedido ───────────────────────────────────────────────
/**
 * Envia e-mail automático ao cliente quando o admin altera o status do pedido.
 * Templates distintos para: confirmed, shipped, delivered, cancelled.
 */
export const sendOrderStatusEmail = internalAction({
  args: {
    email: v.string(),
    name: v.string(),
    orderId: v.string(),
    status: v.string(),
    appUrl: v.string(),
  },
  handler: async (_ctx, args) => {
    if (!resend) {
      console.warn("RESEND_API_KEY não configurada. E-mail de status não enviado.");
      return;
    }

    const cfg = STATUS_CONFIG[args.status];
    if (!cfg) return; // "pending" não envia e-mail

    const orderShort = args.orderId.slice(-8).toUpperCase();
    const pedidosUrl = `${args.appUrl}/painel/pedidos`;

    const subjects: Record<string, string> = {
      confirmed: `✅ Pedido #${orderShort} confirmado — Anna Shoes`,
      shipped:   `🚚 Seu pedido está a caminho! #${orderShort} — Anna Shoes`,
      delivered: `🎁 Pedido #${orderShort} entregue — Anna Shoes`,
      cancelled: `❌ Pedido #${orderShort} cancelado — Anna Shoes`,
    };

    const html = `
      <div style="${BASE_STYLE}text-align:center;">
        ${HEADER}

        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:32px 24px;margin:0 0 24px;">
          <div style="font-size:48px;margin-bottom:16px;">${cfg.emoji}</div>
          <h2 style="font-size:24px;font-weight:900;color:#ffffff;margin:0 0 8px;letter-spacing:-0.03em;">${cfg.title}</h2>
          <p style="color:${cfg.color};font-size:14px;font-weight:700;margin:0;">${cfg.subtitle}</p>
        </div>

        <p style="color:#a0a0a0;font-size:15px;line-height:1.7;margin-bottom:24px;padding:0 10px;">
          Olá, <strong style="color:#ffffff;">${args.name}</strong>!<br><br>
          ${cfg.body}
        </p>

        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px;margin-bottom:32px;display:inline-block;">
          <p style="color:#666;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;margin:0 0 4px;">Número do Pedido</p>
          <p style="color:#ffffff;font-size:18px;font-weight:900;font-family:monospace;margin:0;">#${orderShort}</p>
        </div>

        <div style="margin:8px 0 40px;">
          <a href="${pedidosUrl}" style="background-color:#ea3372;color:#ffffff;padding:16px 32px;text-decoration:none;border-radius:12px;font-weight:900;font-size:13px;text-transform:uppercase;letter-spacing:0.15em;display:inline-block;box-shadow:0 8px 20px rgba(234,51,114,0.25);">
            Ver Meus Pedidos
          </a>
        </div>

        ${FOOTER}
      </div>
    `;

    try {
      await resend.emails.send({
        from: "Anna Shoes <contato@annashoes.com.br>",
        to: [args.email],
        subject: subjects[args.status] ?? `Atualização do seu pedido — Anna Shoes`,
        html,
      });
      console.log(`E-mail de status "${args.status}" enviado para ${args.email}`);
    } catch (err) {
      console.error("Erro ao enviar e-mail de status:", err);
    }
  },
});
