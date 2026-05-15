import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, XCircle, Clock, Package, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button.tsx";

import { useCartStore } from "@/hooks/use-cart.ts";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";

type ReturnStatus = "success" | "failure" | "pending";

const STATUS_CONFIG: Record<ReturnStatus, {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBg: string;
}> = {
  success: {
    icon: <CheckCircle2 className="h-14 w-14 text-[#660e14]" />,
    title: "Pagamento Aprovado!",
    description: "Seu pagamento foi confirmado com sucesso. Em breve seu pedido será preparado para envio.",
    iconBg: "bg-[#660e14]/5",
  },
  failure: {
    icon: <XCircle className="h-14 w-14 text-[#ad2335]" />,
    title: "Pagamento Recusado",
    description: "Houve um problema ao processar seu pagamento. Você pode tentar novamente com outro método de pagamento.",
    iconBg: "bg-[#ad2335]/5",
  },
  pending: {
    icon: <Clock className="h-14 w-14 text-yellow-500" />,
    title: "Em Processamento",
    description: "Seu pagamento está sendo analisado. Assim que for confirmado, você será redirecionado automaticamente.",
    iconBg: "bg-yellow-500/5",
  },
};

export default function CheckoutRetornoPage() {
  const navigate = useNavigate();
  const clearCart = useCartStore((state) => state.clearCart);
  const confirmPayment = useMutation(api.orders.confirmOrderPayment);
  const [params] = useSearchParams();
  
  const orderId = params.get("orderId") ?? params.get("external_reference") ?? "";
  
  // Monitoramento em tempo real do pedido no banco
  const dbOrder = useQuery(api.orders.getOrderById, orderId ? { orderId: orderId as any } : "skip");

  const rawStatus = params.get("status") ?? params.get("collection_status") ?? "pending";
  
  // O status final depende OU da URL OU do banco de dados (tempo real)
  const isApproved = rawStatus === "success" || rawStatus === "approved" || dbOrder?.status === "confirmed";
  const status: ReturnStatus = isApproved ? "success" : (rawStatus === "failure" || rawStatus === "rejected") ? "failure" : "pending";
  
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const [countdown, setCountdown] = useState(isApproved ? 5 : null as number | null);

  useEffect(() => {
    if (isApproved) {
      clearCart();
      if (orderId && dbOrder?.status === "pending") {
        confirmPayment({ orderId: orderId as any }).catch(console.error);
      }
      if (countdown === null) setCountdown(5);
    }
  }, [isApproved, orderId, dbOrder?.status, clearCart, confirmPayment, countdown]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      window.location.href = "/painel/pedidos";
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => (c !== null ? c - 1 : null)), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
        className="flex flex-col items-center gap-6"
      >
        <div className={`h-24 w-24 rounded-full flex items-center justify-center ${config.iconBg}`}>
          {config.icon}
        </div>

        <div className="space-y-2">
          <h1 className="text-5xl md:text-6xl font-normal text-[#660e14] mb-4" style={{ fontFamily: "'Glamour Absolute', cursive" }}>{config.title}</h1>
          <p className="text-[#660e14]/50 text-[10px] font-black uppercase tracking-widest leading-relaxed max-w-sm mx-auto">{config.description}</p>
        </div>

        {orderId && (
          <div className="bg-muted/50 rounded-xl px-6 py-3 text-sm">
            <span className="text-muted-foreground">Pedido #</span>
            <span className="font-mono font-semibold ml-1">{orderId.slice(-8).toUpperCase()}</span>
          </div>
        )}

        {status === "success" && countdown !== null && (
          <p className="text-xs text-muted-foreground">
            Redirecionando para seus pedidos em <strong>{countdown}s</strong>...
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          {status === "failure" ? (
            <>
              <Button asChild variant="secondary" className="flex-1 h-12 rounded-xl border-[#660e14]/10 text-[#660e14] font-black uppercase tracking-widest text-[10px]">
                <Link to="/carrinho">Voltar ao carrinho</Link>
              </Button>
              <Button asChild className="flex-1 bg-[#ad2335] hover:bg-[#660e14] text-white font-black uppercase tracking-widest text-[10px] h-12 rounded-xl shadow-lg shadow-[#ad2335]/20">
                <Link to="/checkout">Tentar novamente</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="secondary" className="flex-1 h-12 rounded-xl border-[#660e14]/10 text-[#660e14] font-black uppercase tracking-widest text-[10px]">
                <Link to="/painel/pedidos">
                  <Package className="mr-2 h-4 w-4" />
                  Meus Pedidos
                </Link>
              </Button>
              <Button asChild className="flex-1 bg-[#ad2335] hover:bg-[#660e14] text-white font-black uppercase tracking-widest text-[10px] h-12 rounded-xl shadow-lg shadow-[#ad2335]/20">
                <Link to="/catalogo">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Continuar comprando
                </Link>
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
