import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

// ─── Mercado Pago webhook ─────────────────────────────────────────────────────
http.route({
  path: "/mp-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.text();
    try {
      await ctx.runAction(internal.mercadopago.handleWebhook, { body });
    } catch (e) {
      console.error("MP webhook error:", e);
    }
    return new Response(null, { status: 200 });
  }),
});

export default http;
