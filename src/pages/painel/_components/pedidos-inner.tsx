import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import { Link } from "react-router-dom";
import {
  Package, ArrowLeft, Printer, Trash2, CreditCard,
  ChevronDown, ChevronUp, Clock, CheckCircle2, Truck,
  Star, Ban, MapPin,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import Receipt from "@/components/Receipt.tsx";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth.ts";

// ─── Configuração de Status ───────────────────────────────────────────────────
const STATUS_FLOW = ["pending", "confirmed", "shipped", "delivered"] as const;

const STATUS_META: Record<string, {
  label: string; color: string;
  icon: React.ReactNode; timelineIcon: React.ReactNode; desc: string;
}> = {
  pending:   {
    label: "Aguardando",
    color: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
    icon: <Clock className="h-3.5 w-3.5" />,
    timelineIcon: <Clock className="h-4 w-4" />,
    desc: "Aguardando confirmação do pagamento",
  },
  confirmed: {
    label: "Confirmado",
    color: "bg-blue-500/10 text-blue-600 border-blue-200",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    timelineIcon: <CheckCircle2 className="h-4 w-4" />,
    desc: "Pagamento aprovado — pedido em preparação",
  },
  shipped: {
    label: "Enviado",
    color: "bg-purple-500/10 text-purple-600 border-purple-200",
    icon: <Truck className="h-3.5 w-3.5" />,
    timelineIcon: <Truck className="h-4 w-4" />,
    desc: "Pedido despachado e a caminho",
  },
  delivered: {
    label: "Entregue",
    color: "bg-green-500/10 text-green-600 border-green-200",
    icon: <Star className="h-3.5 w-3.5" />,
    timelineIcon: <Star className="h-4 w-4" />,
    desc: "Pedido entregue com sucesso! 🎉",
  },
  cancelled: {
    label: "Cancelado",
    color: "bg-red-500/10 text-red-600 border-red-200",
    icon: <Ban className="h-3.5 w-3.5" />,
    timelineIcon: <Ban className="h-4 w-4" />,
    desc: "Pedido cancelado",
  },
};

function getStatusProgress(status: string) {
  const idx = STATUS_FLOW.indexOf(status as any);
  return idx === -1 ? 0 : idx;
}

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function PedidosInner() {
  const { user, isAuthenticated } = useAuth();
  const userId = user?._id;

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="bg-yellow-500/10 h-20 w-20 rounded-full flex items-center justify-center mx-auto">
          <Clock className="h-10 w-10 text-yellow-600" />
        </div>
        <h2 className="text-2xl font-black italic uppercase tracking-tighter">Acesso Restrito</h2>
        <p className="text-muted-foreground text-sm">Você precisa estar logado para ver seus pedidos.</p>
        <Button asChild className="bg-[#38b6ff] hover:bg-[#2d93cf] text-white font-bold w-full">
          <Link to="/auth">Fazer Login</Link>
        </Button>
      </div>
    );
  }

  const orders = useQuery(api.orders.getMyOrders, userId ? { userId } : "skip");
  const deleteOrder = useMutation(api.orders.deleteOrder);
  const createPayment = useAction(api.mercadopago.createPayment);

  const [printingOrder, setPrintingOrder] = useState<any>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const toggleOrder = (id: string) =>
    setExpandedOrder((prev) => (prev === id ? null : id));

  const handlePrint = (order: any) => {
    setPrintingOrder(order);
    setTimeout(() => window.print(), 100);
  };

  const handlePay = async (order: any) => {
    if (!userId) return;
    setIsPaying(order._id);
    try {
      const result = await createPayment({
        orderId: order._id,
        items: order.items,
        appUrl: window.location.origin,
        userId,
      });
      if (result.init_point) window.location.href = result.init_point;
    } catch (error) {
      toast.error("Erro ao iniciar pagamento");
      console.error(error);
    } finally {
      setIsPaying(null);
    }
  };

  const handleDelete = async (orderId: any) => {
    if (!userId) return;
    setIsDeleting(orderId);
    try {
      await deleteOrder({ orderId, userId });
      toast.success("Pedido excluído com sucesso");
    } catch (error) {
      toast.error("Erro ao excluir pedido");
      console.error(error);
    } finally {
      setIsDeleting(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <>
      <Receipt order={printingOrder} type="customer" />

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6 print:hidden">

        {/* Cabeçalho */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/painel"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Meus Pedidos</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Acompanhe o status de cada compra</p>
          </div>
        </div>

        {/* Lista de Pedidos */}
        {orders === undefined ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Package className="h-14 w-14 mx-auto mb-3 opacity-30" />
            <p className="text-base font-medium">Nenhum pedido ainda</p>
            <p className="text-sm mt-1">Quando você fizer um pedido, ele aparecerá aqui.</p>
            <Button asChild className="mt-4 bg-[#ea3372] hover:bg-[#c9295f] text-white">
              <Link to="/catalogo">Explorar produtos</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const s = STATUS_META[order.status] ?? STATUS_META.pending;
              const isExpanded = expandedOrder === order._id;
              const progress = getStatusProgress(order.status);
              const isCancelled = order.status === "cancelled";

              return (
                <div
                  key={order._id}
                  className="border rounded-xl overflow-hidden transition-all hover:border-primary/20"
                >
                  {/* ── Cabeçalho clicável ── */}
                  <button
                    onClick={() => toggleOrder(order._id)}
                    className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-12 w-12 rounded-lg bg-muted/50 overflow-hidden shrink-0 border">
                        {order.items[0]?.image ? (
                          <img src={order.items[0].image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-6 w-6 m-auto mt-3 text-muted-foreground/30" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">
                          Pedido • {format(new Date(order.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.items.length} {order.items.length === 1 ? "item" : "itens"} —{" "}
                          {order.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Status de aguardando para pedidos pendentes */}
                      {order.status === "pending" && (
                        <div className="flex flex-col items-end gap-1 px-2">
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-yellow-600 uppercase tracking-widest bg-yellow-500/10 px-3 py-1.5 rounded-full border border-yellow-500/20">
                            <Clock className="h-3 w-3 animate-pulse" />
                            Confirmando Pagamento
                          </div>
                          <p className="text-[8px] text-muted-foreground italic font-medium">A confirmação pode levar até 24h</p>
                        </div>
                      )}

                      {/* Recibo apenas para pedidos pagos */}
                      {["confirmed", "shipped", "delivered"].includes(order.status) && (
                        <Button
                          variant="outline" size="sm"
                          className="h-8 text-[10px] gap-1.5 font-bold cursor-pointer hidden sm:flex"
                          onClick={(e) => { e.stopPropagation(); handlePrint(order); }}
                        >
                          <Printer className="h-3 w-3" />
                          Recibo
                        </Button>
                      )}

                      {/* Badge de status (oculto se estiver pendente, pois já mostramos o bloco de confirmação) */}
                      {order.status !== "pending" && (
                        <Badge variant="outline" className={`gap-1.5 text-[11px] ${s.color}`}>
                          {s.icon}
                          {s.label}
                        </Badge>
                      )}
                      {isExpanded
                        ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </button>

                  {/* ── Detalhes Expandidos ── */}
                  {isExpanded && (
                    <div className="border-t bg-muted/5 p-5 space-y-6 animate-in slide-in-from-top-1 duration-200">

                      {/* Timeline de Rastreamento */}
                      {!isCancelled ? (
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
                            Rastreamento do Pedido
                          </p>
                          <div className="relative flex items-start justify-between">
                            {/* Linha de progresso */}
                            <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted mx-4" />
                            <div
                              className="absolute top-4 left-4 h-0.5 bg-primary transition-all duration-700"
                              style={{ width: `calc(${(progress / (STATUS_FLOW.length - 1)) * 100}% - 32px)` }}
                            />
                            {STATUS_FLOW.map((step, i) => {
                              const meta = STATUS_META[step];
                              const isActive = i <= progress;
                              const isCurrent = i === progress;
                              return (
                                <div key={step} className="relative flex flex-col items-center gap-2 flex-1 z-10">
                                  <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                    isActive
                                      ? "bg-primary border-primary text-primary-foreground"
                                      : "bg-background border-muted text-muted-foreground/40"
                                  } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}>
                                    {meta.timelineIcon}
                                  </div>
                                  <div className="text-center">
                                    <span className={`text-[10px] font-bold block ${isActive ? "text-foreground" : "text-muted-foreground/40"}`}>
                                      {meta.label}
                                    </span>
                                    {isCurrent && (
                                      <span className="text-[9px] text-primary font-medium block max-w-[72px] leading-tight">
                                        {meta.desc}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-500 bg-red-500/5 border border-red-500/10 rounded-lg px-4 py-3">
                          <Ban className="h-4 w-4 shrink-0" />
                          <span className="text-sm font-medium">Este pedido foi cancelado</span>
                        </div>
                      )}

                      <Separator />

                      {/* Itens do Pedido */}
                      <div className="space-y-3">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Itens</p>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-lg bg-muted/50 overflow-hidden shrink-0 border">
                              {item.image
                                ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                : <Package className="h-5 w-5 m-auto mt-3 text-muted-foreground/30" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.name}</p>
                              <p className="text-xs text-muted-foreground">Qtd: {item.quantity}</p>
                            </div>
                            <p className="text-sm font-semibold shrink-0">
                              {(item.price * item.quantity).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                            </p>
                          </div>
                        ))}
                      </div>

                      <Separator />

                      {/* Resumo Financeiro + Endereço */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                        <div className="space-y-2">
                          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Resumo</p>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Subtotal</span>
                            <span>{order.subtotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                          </div>
                          {order.discount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Desconto</span>
                              <span>-{order.discount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-muted-foreground">
                            <span>Frete</span>
                            <span>{order.shipping === 0 ? "Grátis" : order.shipping.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-bold text-base">
                            <span>Total</span>
                            <span>{order.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                            <MapPin className="h-3 w-3" /> Entrega
                          </p>
                          <div className="bg-muted/30 rounded-lg p-3 border text-muted-foreground text-sm space-y-0.5">
                            <p className="font-medium text-foreground">{order.address.street}</p>
                            <p>{order.address.city}, {order.address.state}</p>
                            <p>CEP: {order.address.zip}</p>
                          </div>
                        </div>
                      </div>

                      {/* Botão Recibo (mobile) */}
                      {["confirmed", "shipped", "delivered"].includes(order.status) && (
                        <Button
                          variant="outline" size="sm"
                          className="w-full gap-2 sm:hidden"
                          onClick={() => handlePrint(order)}
                        >
                          <Printer className="h-3.5 w-3.5" />
                          Gerar Recibo
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modal de Confirmação de Exclusão ── */}
      <AlertDialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <AlertDialogContent className="bg-[#0b0b0b] border border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold">Excluir pedido?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/50">
              Este pedido ainda não foi pago e será removido permanentemente. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
              onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
            >
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
