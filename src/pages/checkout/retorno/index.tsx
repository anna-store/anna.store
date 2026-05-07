import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle, Clock, Package, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button.tsx";

import { useCartStore } from "@/hooks/use-cart.ts";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";

type ReturnStatus = "success" | "failure" | "pending";

const STATUS_CONFIG: Record<ReturnStatus, {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBg: string;
}> = {
  success: {
    icon: <CheckCircle2 className="h-14 w-14 text-green-500" />,
    title: "Pagamento Aprovado!",
    description: "Seu pagamento foi confirmado com sucesso. Em breve seu pedido será preparado para envio.",
    iconBg: "bg-green-100",
  },
  failure: {
    icon: <XCircle className="h-14 w-14 text-destructive" />,
    title: "Pagamento Recusado",
    description: "Houve um problema ao processar seu pagamento. Você pode tentar novamente com outro método de pagamento.",
    iconBg: "bg-destructive/10",
  },
  pending: {
    icon: <Clock className="h-14 w-14 text-yellow-500" />,
    title: "Pagamento em Processamento",
    description: "Seu pagamento está sendo processado. Você receberá uma confirmação por e-mail quando for concluído.",
    iconBg: "bg-yellow-100",
  },
};

export default function CheckoutRetornoPage() {
  const clearCart = useCartStore((state) => state.clearCart);
  const updateStatus = useMutation(api.orders.updateOrderStatus);
  const [params] = useSearchParams();
  const rawStatus = params.get("status") ?? params.get("collection_status") ?? "pending";
  const isSuccess = rawStatus === "success" || rawStatus === "approved";
  const status: ReturnStatus = isSuccess ? "success" : (rawStatus === "failure" || rawStatus === "rejected") ? "failure" : "pending";
  
  const orderId = params.get("orderId") ?? params.get("external_reference") ?? "";
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const [countdown, setCountdown] = useState(isSuccess ? 5 : null as number | null);

  useEffect(() => {
    if (status === "success") {
      clearCart();
      if (orderId) {
        updateStatus({ orderId: orderId as any, status: "confirmed" }).catch(console.error);
      }
    }
  }, [status, orderId, clearCart, updateStatus]);

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
          <h1 className="text-3xl font-black">{config.title}</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">{config.description}</p>
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
              <Button asChild variant="secondary" className="flex-1">
                <Link to="/carrinho">Voltar ao carrinho</Link>
              </Button>
              <Button asChild className="flex-1 bg-[#ea3372] hover:bg-[#c9295f] text-white">
                <Link to="/checkout">Tentar novamente</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="secondary" className="flex-1">
                <Link to="/painel/pedidos">
                  <Package className="mr-2 h-4 w-4" />
                  Meus Pedidos
                </Link>
              </Button>
              <Button asChild className="flex-1 bg-[#ea3372] hover:bg-[#c9295f] text-white">
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
