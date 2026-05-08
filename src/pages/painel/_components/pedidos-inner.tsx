import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Link } from "react-router-dom";
import { Package, ArrowLeft, Printer, Trash2, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import Receipt from "@/components/Receipt.tsx";
import { toast } from "sonner";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Aguardando", color: "bg-yellow-500/10 text-yellow-600 border-yellow-200" },
  confirmed: { label: "Confirmado", color: "bg-blue-500/10 text-blue-600 border-blue-200" },
  shipped: { label: "Enviado", color: "bg-purple-500/10 text-purple-600 border-purple-200" },
  delivered: { label: "Entregue", color: "bg-green-500/10 text-green-600 border-green-200" },
  cancelled: { label: "Cancelado", color: "bg-red-500/10 text-red-600 border-red-200" },
};

export default function PedidosInner() {
  const orders = useQuery(api.orders.getMyOrders);
  const deleteOrder = useMutation(api.orders.deleteOrder);
  const createPayment = useAction(api.mercadopago.createPayment);
  
  const [printingOrder, setPrintingOrder] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState<string | null>(null);

  const handlePrint = (order: any) => {
    setPrintingOrder(order);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handlePay = async (order: any) => {
    const userStr = localStorage.getItem("currentUser");
    if (!userStr) return;
    const user = JSON.parse(userStr);

    setIsPaying(order._id);
    try {
      const result = await createPayment({
        orderId: order._id,
        items: order.items,
        appUrl: window.location.origin,
        userId: user._id,
      });

      if (result.init_point) {
        window.location.href = result.init_point;
      }
    } catch (error) {
      toast.error("Erro ao iniciar pagamento");
      console.error(error);
    } finally {
      setIsPaying(null);
    }
  };

  const handleDelete = async (orderId: any) => {
    const userStr = localStorage.getItem("currentUser");
    if (!userStr) return;
    const user = JSON.parse(userStr);
    
    if (!confirm("Tem certeza que deseja excluir este pedido pendente?")) return;

    setIsDeleting(orderId);
    try {
      await deleteOrder({ orderId, userId: user._id });
      toast.success("Pedido excluído com sucesso");
    } catch (error) {
      toast.error("Erro ao excluir pedido");
      console.error(error);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <>
      <Receipt order={printingOrder} type="customer" />
      
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6 print:hidden">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/painel"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <h1 className="text-2xl font-bold">Meus Pedidos</h1>
        </div>

        {orders === undefined ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Package className="h-14 w-14 mx-auto mb-3 opacity-30" />
            <p className="text-base font-medium">Nenhum pedido ainda</p>
            <p className="text-sm mt-1">Quando você fizer um pedido, ele aparecerá aqui.</p>
            <Button asChild className="mt-4">
              <Link to="/catalogo">Explorar produtos</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const s = STATUS_LABELS[order.status] ?? STATUS_LABELS.pending;
              return (
                <Card key={order._id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between px-5 py-3 bg-muted/40 border-b gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Pedido em</p>
                        <p className="text-sm font-medium">
                          {format(new Date(order.createdAt), "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-sm font-bold text-primary">
                          {order.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {order.status === "pending" && (
                          <>
                            <Button 
                              size="sm" 
                              className="h-8 text-xs gap-2 font-bold bg-[#ea3372] hover:bg-[#c9295f] text-white"
                              onClick={() => handlePay(order)}
                              disabled={isPaying === order._id}
                            >
                              <CreditCard className="h-3 w-3" />
                              {isPaying === order._id ? "Processando..." : "Finalizar Compra"}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDelete(order._id)}
                              disabled={isDeleting === order._id || isPaying === order._id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-xs gap-2 font-bold cursor-pointer"
                          onClick={() => handlePrint(order)}
                        >
                          <Printer className="h-3 w-3" />
                          Gerar Recibo
                        </Button>
                        <Badge variant="outline" className={s.color}>{s.label}</Badge>
                      </div>
                    </div>
                    <div className="px-5 py-4 space-y-3">
                      {order.items.map((item) => (
                        <div key={item.productId} className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-12 w-12 rounded-md object-cover bg-muted shrink-0"
                          />
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
                    <div className="px-5 py-3 border-t text-xs text-muted-foreground">
                      Entrega: {order.address.street}, {order.address.city} — {order.address.state}, {order.address.zip}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
