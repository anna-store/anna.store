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
          <div style="background-color: #050505; color: #ffffff; font-family: 'Outfit', 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; border-radius: 24px; text-align: center;">
            <div style="margin-bottom: 30px;">
              <img src="https://1.gravatar.com/avatar/450ccf591f7ff7e865f12e74d998ddb5bf7cb1a9abc25fad50c2aa1d0af114c5?s=200" alt="Anna Shoes Logo" style="width: 100px; height: 100px; border-radius: 20px; margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.1);">
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 900; letter-spacing: -0.05em; margin: 0; text-transform: uppercase;">
                ANNA <span style="color: #ea3372;">SHOES</span>
              </h1>
              <div style="height: 2px; width: 40px; background-color: #ea3372; margin: 15px auto;"></div>
            </div>
            
            <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 20px; letter-spacing: -0.02em;">Recuperação de Acesso</h2>
            
            <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin-bottom: 30px; padding: 0 20px;">
              Olá!<br>
              Recebemos uma solicitação para redefinir a senha da sua conta exclusiva na <strong>Anna Shoes</strong>. Se foi você, clique no botão abaixo para prosseguir.
            </p>
            
            <div style="margin: 40px 0;">
              <a href="${args.resetLink}" style="background-color: #ea3372; color: #ffffff; padding: 18px 36px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 0.2em; display: inline-block; transition: all 0.3s ease; box-shadow: 0 10px 20px rgba(234, 51, 114, 0.2);">
                Redefinir Senha
              </a>
            </div>
            
            <p style="color: #666666; font-size: 12px; margin-top: 40px; line-height: 1.5;">
              Se você não solicitou esta alteração, por favor ignore este e-mail.<br>
              Este link é válido por 1 hora.
            </p>
            
            <div style="border-top: 1px solid #1a1a1a; margin-top: 40px; padding-top: 20px;">
              <p style="color: #444444; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.3em;">
                Anna Shoes &copy; 2026 &bull; Boutique Digital de Luxo
              </p>
            </div>
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
