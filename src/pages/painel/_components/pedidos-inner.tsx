import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api.js";
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
  Package, ArrowLeft, Printer, CreditCard,
  ChevronDown, Clock, CheckCircle2, Truck,
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
  pending: {
    label: "Aguardando",
    color: "bg-[#ad2335]/10 text-[#ad2335] border-[#ad2335]/20",
    icon: <Clock className="h-3.5 w-3.5" />,
    timelineIcon: <Clock className="h-4 w-4" />,
    desc: "Aguardando confirmação do pagamento",
  },
  confirmed: {
    label: "Confirmado",
    color: "bg-[#660e14]/10 text-[#660e14] border-[#660e14]/20",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    timelineIcon: <CheckCircle2 className="h-4 w-4" />,
    desc: "Pagamento aprovado — pedido em preparação",
  },
  shipped: {
    label: "Enviado",
    color: "bg-[#ff97ad]/20 text-[#ad2335] border-[#ff97ad]/30",
    icon: <Truck className="h-3.5 w-3.5" />,
    timelineIcon: <Truck className="h-4 w-4" />,
    desc: "Pedido despachado e a caminho",
  },
  delivered: {
    label: "Entregue",
    color: "bg-[#660e14] text-[#fdf0e3] border-none",
    icon: <Star className="h-3.5 w-3.5" />,
    timelineIcon: <Star className="h-4 w-4" />,
    desc: "Pedido entregue com sucesso! 🎉",
  },
  cancelled: {
    label: "Cancelado",
    color: "bg-red-500/10 text-red-600 border-red-500/20",
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
      <div className="bg-[#fdf0e3] min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white/40 backdrop-blur-md p-10 rounded-[2.5rem] border border-[#660e14]/5 text-center space-y-8 shadow-2xl">
          <div className="relative flex justify-center">
            <div className="absolute inset-0 bg-[#ad2335]/10 blur-2xl rounded-full" />
            <div className="relative bg-white h-24 w-24 rounded-full flex items-center justify-center border border-[#660e14]/10 shadow-sm">
              <Clock className="h-10 w-10 text-[#ad2335]" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-[#660e14] mb-2">Acesso Restrito</h2>
            <p className="text-[#660e14]/50 text-[10px] font-black uppercase tracking-widest leading-relaxed">Você precisa estar logada para acessar seu histórico de pedidos e rastreamentos.</p>
          </div>
          <Button asChild className="bg-[#660e14] hover:bg-[#ad2335] text-[#fdf0e3] font-black uppercase tracking-[0.2em] text-[11px] h-14 rounded-2xl w-full shadow-xl transition-all duration-500 cursor-pointer">
            <Link to="/auth">Fazer Login Agora</Link>
          </Button>
        </div>
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
      if (result.initPoint) window.location.href = result.initPoint;
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

      <div className="bg-[#fdf0e3] min-h-screen selection:bg-[#ad2335]/30 overflow-x-hidden pt-28 pb-20 print:hidden">
        {/* Atmosphere Background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-[#ff97ad]/10 to-transparent" />
          <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-multiply" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-6">
          {/* Cabeçalho */}
          <div className="space-y-4 mb-16">
            <div className="flex items-center gap-3">
              <Link to="/painel">
                <Button variant="ghost" size="icon" className="size-10 rounded-full bg-white/50 border border-[#660e14]/10 hover:bg-white cursor-pointer">
                  <ArrowLeft className="h-4 w-4 text-[#660e14]" />
                </Button>
              </Link>
              <div className="h-[1px] w-12 bg-[#ad2335]" />
              <span className="text-[10px] text-[#ad2335] font-black uppercase tracking-[0.5em]">Histórico de Compras</span>
            </div>
            <h1 
              className="text-5xl md:text-6xl font-normal text-[#660e14] tracking-normal" 
              style={{ fontFamily: "'Glamour Absolute', cursive" }}
            >
              Meus Pedidos<span className="text-[#ad2335]">.</span>
            </h1>
          </div>

          {/* Lista de Pedidos */}
          {orders === undefined ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full rounded-3xl bg-[#660e14]/5" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-24 bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-[#660e14]/5 shadow-xl">
              <div className="relative mb-8 flex justify-center">
                  <div className="absolute inset-0 bg-[#ad2335]/10 blur-2xl rounded-full" />
                  <div className="relative size-24 rounded-full border border-[#660e14]/10 flex items-center justify-center bg-white">
                      <Package className="h-10 w-10 text-[#660e14]/20" />
                  </div>
              </div>
              <h2 className="text-2xl font-bold text-[#660e14] mb-2">Nenhum pedido ainda</h2>
              <p className="text-[#660e14]/50 text-xs font-bold uppercase tracking-widest mb-8">Sua jornada conosco está apenas começando.</p>
              <Button asChild className="bg-[#660e14] hover:bg-[#ad2335] text-[#fdf0e3] px-10 h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] cursor-pointer shadow-xl transition-all duration-500">
                <Link to="/catalogo">Explorar Catálogo</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const s = STATUS_META[order.status] ?? STATUS_META.pending;
                const isExpanded = expandedOrder === order._id;
                const progress = getStatusProgress(order.status);
                const isCancelled = order.status === "cancelled";

                return (
                  <div
                    key={order._id}
                    className={`group border rounded-3xl overflow-hidden transition-all duration-300 bg-white/60 backdrop-blur-sm shadow-sm ${
                        isExpanded ? 'border-[#ad2335]/40 shadow-xl ring-1 ring-[#ad2335]/10' : 'border-[#660e14]/5 hover:border-[#ad2335]/20 hover:shadow-md'
                    }`}
                  >
                    {/* Cabeçalho do Card */}
                    <button
                      onClick={() => toggleOrder(order._id)}
                      className="w-full flex items-center justify-between gap-4 p-5 text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="h-16 w-16 rounded-2xl bg-white overflow-hidden shrink-0 border border-[#660e14]/5 shadow-sm">
                          {order.items[0]?.image ? (
                            <img src={order.items[0].image} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <Package className="h-6 w-6 m-auto mt-5 text-[#660e14]/10" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black text-[#ad2335] uppercase tracking-widest mb-1">
                            {format(new Date(order.createdAt), "dd MMM yyyy", { locale: ptBR })}
                          </p>
                          <p className="text-sm font-bold text-[#660e14] truncate uppercase tracking-tight">
                            Pedido #{order._id.slice(-6).toUpperCase()}
                          </p>
                          <p className="text-[10px] font-bold text-[#660e14]/40 uppercase tracking-wider">
                            {order.items.length} {order.items.length === 1 ? "item" : "itens"} • {order.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        {order.status === "pending" ? (
                            <div className="hidden sm:flex flex-col items-end gap-1 px-2">
                                <div className="flex items-center gap-1.5 text-[9px] font-black text-[#ad2335] uppercase tracking-widest bg-[#ad2335]/10 px-3 py-1.5 rounded-full border border-[#ad2335]/20">
                                    <Clock className="h-3 w-3 animate-pulse" />
                                    Processando
                                </div>
                            </div>
                        ) : (
                            <Badge variant="outline" className={`gap-1.5 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-sm ${s.color}`}>
                                {s.icon}
                                {s.label}
                            </Badge>
                        )}
                        <div className={`size-8 rounded-full flex items-center justify-center border border-[#660e14]/5 bg-white transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                            <ChevronDown className="h-4 w-4 text-[#660e14]" />
                        </div>
                      </div>
                    </button>

                    {/* Detalhes Expandidos */}
                    {isExpanded && (
                      <div className="border-t border-[#660e14]/5 p-6 space-y-8 animate-in slide-in-from-top-2 duration-300">
                        {/* Timeline */}
                        {!isCancelled ? (
                          <div className="relative pt-4 pb-12">
                            <div className="absolute top-9 left-0 right-0 h-[2.5px] bg-[#660e14]/5 mx-8" />
                            <div
                              className="absolute top-9 left-8 h-[2.5px] bg-[#ad2335] transition-all duration-1000 shadow-[0_0_10px_rgba(173,35,53,0.3)]"
                              style={{ width: `calc(${(progress / (STATUS_FLOW.length - 1)) * 100}% - 64px)` }}
                            />
                            <div className="relative flex items-start justify-between">
                                {STATUS_FLOW.map((step, i) => {
                                    const meta = STATUS_META[step];
                                    const isActive = i <= progress;
                                    const isCurrent = i === progress;
                                    return (
                                        <div key={step} className="flex flex-col items-center gap-3 flex-1 z-10 text-center px-1">
                                            <div className={`h-11 w-11 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                                                isActive ? "bg-[#ad2335] border-[#ad2335] text-[#fdf0e3]" : "bg-white border-[#660e14]/5 text-[#660e14]/20 shadow-inner"
                                            } ${isCurrent ? "ring-4 ring-[#ad2335]/15 scale-110 shadow-xl" : ""}`}>
                                                {meta.timelineIcon}
                                            </div>
                                            <div className="space-y-1">
                                                <span className={`text-[8px] font-black uppercase tracking-widest block leading-none ${isActive ? "text-[#660e14]" : "text-[#660e14]/20"}`}>
                                                    {meta.label}
                                                </span>
                                                {isCurrent && (
                                                    <span className="text-[7px] text-[#ad2335] font-black uppercase block max-w-[80px] mx-auto leading-tight animate-pulse">
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
                          <div className="flex items-center gap-3 text-red-600 bg-red-50 p-4 rounded-2xl border border-red-100">
                            <Ban className="h-5 w-5 shrink-0" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Este pedido foi cancelado e não poderá ser processado.</p>
                          </div>
                        )}

                        <Separator className="bg-[#660e14]/5" />

                        {/* Itens */}
                        <div className="space-y-4">
                          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#ad2335]">Conteúdo da Caixa</p>
                          <div className="space-y-3">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-4 bg-white/30 p-3 rounded-2xl border border-[#660e14]/5">
                                <div className="h-14 w-14 rounded-xl bg-white overflow-hidden shrink-0 border border-[#660e14]/5">
                                  {item.image
                                    ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                    : <Package className="h-5 w-5 m-auto mt-4 text-[#660e14]/10" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-[#660e14] truncate uppercase tracking-tight">{item.name}</p>
                                  <p className="text-[9px] font-black text-[#660e14]/40 uppercase tracking-widest">Qtd: {item.quantity}</p>
                                </div>
                                <p className="text-xs font-black text-[#660e14] shrink-0">
                                  {(item.price * item.quantity).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Separator className="bg-[#660e14]/5" />

                        {/* Resumo e Entrega */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#ad2335]">Resumo Financeiro</p>
                            <div className="space-y-2 text-[11px] font-bold uppercase tracking-wider text-[#660e14]/60">
                              <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="text-[#660e14]">{order.subtotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                              </div>
                              {order.discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                  <span>Desconto</span>
                                  <span>-{order.discount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span>Frete</span>
                                <span className="text-[#660e14]">{order.shipping === 0 ? "Grátis" : order.shipping.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                              </div>
                              <div className="pt-2 mt-2 border-t border-[#660e14]/5 flex justify-between text-sm font-black text-[#660e14]">
                                <span>Total</span>
                                <span className="text-base text-[#ad2335]">{order.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#ad2335] flex items-center gap-2">
                              <MapPin className="h-3 w-3" /> Destino de Entrega
                            </p>
                            <div className="bg-[#660e14]/5 rounded-2xl p-5 border border-[#660e14]/5 text-[#660e14] space-y-1">
                              <p className="text-xs font-black uppercase tracking-tight">{order.address.street}</p>
                              <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{order.address.city}, {order.address.state}</p>
                              <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">CEP: {order.address.zip}</p>
                            </div>
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            {["confirmed", "shipped", "delivered"].includes(order.status) && (
                                <Button
                                    variant="outline" size="lg"
                                    className="flex-1 h-14 rounded-2xl border-[#660e14]/10 bg-white text-[#660e14] font-black uppercase tracking-[0.2em] text-[10px] gap-3 hover:bg-[#660e14] hover:text-[#fdf0e3] transition-all duration-500 cursor-pointer"
                                    onClick={() => handlePrint(order)}
                                >
                                    <Printer className="h-4 w-4" />
                                    Gerar Recibo Premium
                                </Button>
                            )}
                            
                            {order.status === "pending" && (
                                <>
                                    <Button
                                        size="lg"
                                        className="flex-1 h-14 rounded-2xl bg-[#ad2335] text-[#fdf0e3] font-black uppercase tracking-[0.2em] text-[10px] gap-3 hover:bg-[#660e14] transition-all duration-500 shadow-xl cursor-pointer"
                                        onClick={() => handlePay(order)}
                                        disabled={isPaying === order._id}
                                    >
                                        <CreditCard className="h-4 w-4" />
                                        {isPaying === order._id ? "Processando..." : "Finalizar Pagamento"}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="lg"
                                        className="h-14 rounded-2xl text-red-600/40 hover:text-red-600 hover:bg-red-50 font-black uppercase tracking-[0.2em] text-[10px] cursor-pointer"
                                        onClick={() => setConfirmDeleteId(order._id)}
                                    >
                                        Cancelar Pedido
                                    </Button>
                                </>
                            )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Cancelamento */}
      <AlertDialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <AlertDialogContent className="bg-[#fdf0e3] border-none rounded-[2.5rem] p-10 shadow-3xl max-w-md">
          <AlertDialogHeader className="space-y-4">
            <div className="relative flex justify-center mb-4">
                <div className="absolute inset-0 bg-red-500/10 blur-2xl rounded-full" />
                <div className="relative bg-white h-20 w-20 rounded-full flex items-center justify-center border border-red-100 shadow-sm">
                  <Ban className="h-8 w-8 text-red-500" />
                </div>
            </div>
            <AlertDialogTitle className="text-3xl font-black italic uppercase tracking-tighter text-[#660e14] text-center">Cancelar Pedido?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#660e14]/60 text-[10px] font-black uppercase tracking-widest text-center leading-relaxed">
              Esta ação é irreversível. O pedido será removido do seu histórico permanentemente. Deseja prosseguir?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex flex-col sm:flex-row gap-3">
            <AlertDialogCancel className="h-14 rounded-2xl border-[#660e14]/10 bg-white text-[#660e14] font-black uppercase tracking-[0.2em] text-[10px] flex-1 hover:bg-[#660e14]/5 cursor-pointer">
              Manter Pedido
            </AlertDialogCancel>
            <AlertDialogAction
              className="h-14 rounded-2xl bg-red-600 text-white font-black uppercase tracking-[0.2em] text-[10px] flex-1 hover:bg-red-700 shadow-xl cursor-pointer"
              onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
            >
              Sim, Cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
