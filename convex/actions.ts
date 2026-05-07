import { v } from "convex/values";
import { action } from "./_generated/server";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const sendResetPasswordEmail = action({
  args: {
    email: v.string(),
    resetLink: v.string(),
  },
  handler: async (ctx, args) => {
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY não configurada no dashboard do Convex");
      return { success: false, error: "Configuração pendente" };
    }

    try {
      if (!resend) throw new Error("Resend not initialized");
      const { data, error } = await resend.emails.send({
        from: "Anna Shoes <contato@annashoes.com.br>",
        to: [args.email],
        subject: "Redefinição de Senha - Anna Shoes",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #ea3372;">Anna Shoes</h2>
            <p>Olá,</p>
            <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
            <p>Clique no botão abaixo para escolher uma nova senha:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${args.resetLink}" style="background-color: #ea3372; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Redefinir Minha Senha</a>
            </div>
            <p style="font-size: 12px; color: #666;">Se você não solicitou isso, ignore este e-mail.</p>
            <p style="font-size: 12px; color: #666;">O link expira em 1 hora.</p>
          </div>
        `,
      });

      if (error) {
        console.warn("Resend restriction detected:", error.message);
        // Se for erro de validação (domínio não verificado), retornamos sucesso falso mas sem 'estourar' erro crítico
        return { 
          success: false, 
          error: error.message,
          isRestricted: error.message.includes("testing emails") 
        };
      }

      return { success: true, data };
    } catch (err: any) {
      console.error("Erro inesperado no envio de e-mail:", err);
      return { success: false, error: err.message };
    }
  },
});
