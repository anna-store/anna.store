import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth.ts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import { Link } from "react-router-dom";
import {
  User, Package, Heart, LogOut, Pencil, Check, X,
  ChevronDown, ChevronUp, MapPin, ShoppingBag, Clock, Truck, CircleCheck, Ban,
  RefreshCw, AlertTriangle, Info, CheckSquare, Square,
  Star, StarOff, MessageSquareText
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:   { label: "Aguardando",  color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", icon: <Clock className="h-3.5 w-3.5" /> },
  confirmed: { label: "Confirmado", color: "bg-blue-500/10 text-blue-600 border-blue-500/20",     icon: <ShoppingBag className="h-3.5 w-3.5" /> },
  shipped:   { label: "Enviado",    color: "bg-purple-500/10 text-purple-600 border-purple-500/20", icon: <Truck className="h-3.5 w-3.5" /> },
  delivered: { label: "Entregue",   color: "bg-green-500/10 text-green-600 border-green-500/20",   icon: <CircleCheck className="h-3.5 w-3.5" /> },
  cancelled: { label: "Cancelado",  color: "bg-red-500/10 text-red-600 border-red-500/20",         icon: <Ban className="h-3.5 w-3.5" /> },
};

// Ordem dos status para a timeline visual
const STATUS_FLOW = ["pending", "confirmed", "shipped", "delivered"];

export default function PainelInner() {
  const { user, removeUser } = useAuth();
  const userId = user?._id;
  const currentUser = useQuery(api.users.getCurrentUser, userId ? { userId } : {});
  const orders = useQuery(api.orders.getMyOrders, userId ? { userId } : "skip");
  const exchanges = useQuery(api.exchanges.getMyExchanges, userId ? { userId } : "skip");
  const reviews = useQuery(api.reviews.getMyReviews, userId ? { userId } : "skip");
  const updateProfile = useMutation(api.users.updateProfile);
  const createExchange = useMutation(api.exchanges.createExchange);
  const createReview = useMutation(api.reviews.createReview);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [complement, setComplement] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Exchange form state
  const [exchangeOrderId, setExchangeOrderId] = useState<string | null>(null);
  const [exchangeItems, setExchangeItems] = useState<Set<number>>(new Set());
  const [exchangeReason, setExchangeReason] = useState("");
  const [exchangeResolution, setExchangeResolution] = useState<"credit" | "replacement">("credit");
  const [acceptedRules, setAcceptedRules] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [exchangeLoading, setExchangeLoading] = useState(false);

  // Review state
  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);
  const [reviewProductId, setReviewProductId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  const handleZipLookup = async (cep: string) => {
    const clean = cep.replace(/\D/g, "");
    if (clean.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setStreet(data.logradouro);
          setNeighborhood(data.bairro);
          setCity(data.localidade);
          setState(data.uf);
          toast.success("Endereço localizado!");
        }
      } catch (e) {
        console.error("Erro ao buscar CEP:", e);
      }
    }
  };

  const rawAvatar: unknown = currentUser?.avatar;
  const avatarSrc: string | undefined = typeof rawAvatar === "string" ? rawAvatar : (user?.avatar as string | undefined);

  const startEdit = () => {
    setName(currentUser?.name ?? user?.name ?? "");
    setPhone(currentUser?.phone ?? "");
    setStreet(currentUser?.street ?? "");
    setNumber(currentUser?.number ?? "");
    setNeighborhood(currentUser?.neighborhood ?? "");
    setComplement(currentUser?.complement ?? "");
    setCity(currentUser?.city ?? "");
    setState(currentUser?.state ?? "");
    setZip(currentUser?.zip ?? "");
    setEditing(true);
  };

  const saveEdit = async () => {
    const userId = currentUser?._id ?? user?._id;
    if (!userId) {
      toast.error("Sessão não encontrada. Faça login novamente.");
      return;
    }
    try {
      await updateProfile({ 
        userId, 
        name: name.trim() || undefined, 
        phone: phone.trim() || undefined,
        street: street.trim() || undefined,
        number: number.trim() || undefined,
        neighborhood: neighborhood.trim() || undefined,
        complement: complement.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        zip: zip.trim() || undefined,
      });
      toast.success("Perfil atualizado!");
      setEditing(false);
    } catch {
      toast.error("Erro ao salvar perfil");
    }
  };

  const toggleOrder = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStatusProgress = (status: string) => {
    if (status === "cancelled") return -1;
    return STATUS_FLOW.indexOf(status) >= 0 ? STATUS_FLOW.indexOf(status) : 0;
  };

  const getExchangeForOrder = (orderId: string) => {
    return exchanges?.find((e) => e.orderId === orderId);
  };

  const openExchangeForm = (orderId: string) => {
    setExchangeOrderId(orderId);
    setExchangeItems(new Set());
    setExchangeReason("");
    setExchangeResolution("credit");
    setAcceptedRules(false);
    setShowRules(false);
  };

  const toggleExchangeItem = (idx: number) => {
    const next = new Set(exchangeItems);
    if (next.has(idx)) {
      next.delete(idx);
    } else {
      next.add(idx);
    }
    setExchangeItems(next);
  };

  const submitExchange = async () => {
    if (!userId || !exchangeOrderId) return;
    const order = orders?.find((o) => o._id === exchangeOrderId);
    if (!order) return;
    if (exchangeItems.size === 0) { toast.error("Selecione pelo menos um item"); return; }
    if (!exchangeReason.trim()) { toast.error("Informe o motivo da troca"); return; }
    if (!acceptedRules) { toast.error("Aceite as regras de troca"); return; }

    const selectedItems = Array.from(exchangeItems).map((i) => order.items[i]);
    setExchangeLoading(true);
    try {
      await createExchange({ userId, orderId: exchangeOrderId as Id<"orders">, items: selectedItems, reason: exchangeReason.trim(), resolution: exchangeResolution });
      toast.success("Solicitação de troca enviada!");
      setExchangeOrderId(null);
    } catch (err: any) {
      toast.error(err.data?.message || err.message || "Erro ao solicitar troca");
    } finally {
      setExchangeLoading(false);
    }
  };

  const getReviewForProduct = (orderId: string, productId: string) => {
    return reviews?.find((r) => r.orderId === orderId && r.productId === productId);
  };

  const openReviewForm = (orderId: string, productId: string) => {
    setReviewOrderId(orderId);
    setReviewProductId(productId);
    setReviewRating(5);
    setReviewComment("");
  };

  const submitReview = async () => {
    if (!userId || !reviewOrderId || !reviewProductId) return;
    setReviewLoading(true);
    try {
      await createReview({
        userId,
        orderId: reviewOrderId as Id<"orders">,
        productId: reviewProductId,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      toast.success("Avaliação enviada! Obrigado.");
      setReviewOrderId(null);
    } catch (err: any) {
      toast.error(err.data?.message || err.message || "Erro ao enviar avaliação");
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Meu Painel</h1>
        <Button variant="ghost" size="sm" className="text-muted-foreground gap-2" onClick={() => removeUser()}>
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Meu Perfil
          </CardTitle>
          {!editing ? (
            <Button variant="ghost" size="sm" className="gap-1 cursor-pointer" onClick={startEdit}>
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </Button>
          ) : (
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="gap-1 text-green-600 cursor-pointer" onClick={saveEdit}>
                <Check className="h-3.5 w-3.5" />
                Salvar
              </Button>
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground cursor-pointer" onClick={() => setEditing(false)}>
                <X className="h-3.5 w-3.5" />
                Cancelar
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {currentUser === undefined ? (
            <div className="flex gap-4 items-center">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-60" />
              </div>
            </div>
          ) : (
            <div className="flex gap-4 items-start">
              <Avatar className="h-16 w-16 shrink-0">
                <AvatarImage src={avatarSrc} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                  {(currentUser?.name ?? user?.name ?? "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                {editing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="name">Nome</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" />
                      </div>
                    </div>
                    
                    <Separator />
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Endereço de Entrega</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="zip">CEP</Label>
                        <Input 
                          id="zip" 
                          value={zip} 
                          onChange={(e) => {
                            setZip(e.target.value);
                            handleZipLookup(e.target.value);
                          }} 
                          placeholder="00000-000" 
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-1">
                        <Label htmlFor="street">Rua</Label>
                        <Input id="street" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Sua rua" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="number">Número</Label>
                        <Input id="number" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="123" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="neighborhood">Bairro</Label>
                        <Input id="neighborhood" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Seu bairro" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="complement">Complemento</Label>
                        <Input id="complement" value={complement} onChange={(e) => setComplement(e.target.value)} placeholder="Apto, bloco, etc." />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="col-span-2 space-y-1">
                        <Label htmlFor="city">Cidade</Label>
                        <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Sua cidade" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="state">Estado (UF)</Label>
                        <Input id="state" value={state} onChange={(e) => setState(e.target.value.toUpperCase())} maxLength={2} placeholder="SP" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Informações Pessoais</p>
                      <p className="font-medium">{currentUser?.name ?? "—"}</p>
                      <p className="text-muted-foreground">{currentUser?.email ?? user?.email ?? "—"}</p>
                      <p className="text-muted-foreground">{currentUser?.phone ?? "—"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Endereço Padrão</p>
                      {currentUser?.zip ? (
                        <>
                          <p className="font-medium">{currentUser.street}, {currentUser.number}</p>
                          <p className="text-muted-foreground">
                            {currentUser.neighborhood && `${currentUser.neighborhood}`}
                            {currentUser.complement && ` — ${currentUser.complement}`}
                          </p>
                          <p className="text-muted-foreground">
                            {currentUser.city}, {currentUser.state} — {currentUser.zip}
                          </p>
                        </>
                      ) : (
                        <p className="text-muted-foreground italic">Nenhum endereço cadastrado</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="cursor-default hover:border-primary/40 transition-colors">
          <CardContent className="flex items-center gap-3 py-5">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{orders === undefined ? "—" : orders.length}</p>
              <p className="text-sm text-muted-foreground">Pedidos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/40 transition-colors">
          <Link to="/favoritos">
            <CardContent className="flex items-center gap-3 py-5">
              <div className="h-10 w-10 rounded-full bg-pink-500/10 flex items-center justify-center shrink-0">
                <Heart className="h-5 w-5 text-pink-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">—</p>
                <p className="text-sm text-muted-foreground">Favoritos</p>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Meus Pedidos — Seção Completa */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Meus Pedidos
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/catalogo">Continuar Comprando</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {orders === undefined ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">Nenhum pedido encontrado</p>
              <p className="text-xs mt-1">Explore nossa boutique e faça seu primeiro pedido!</p>
              <Button variant="outline" size="sm" asChild className="mt-4">
                <Link to="/catalogo">Explorar Catálogo</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const s = STATUS_LABELS[order.status] ?? STATUS_LABELS.pending;
                const isExpanded = expandedOrder === order._id;
                const progress = getStatusProgress(order.status);

                return (
                  <div key={order._id} className="border rounded-xl overflow-hidden transition-all hover:border-primary/20">
                    {/* Cabeçalho do Pedido (sempre visível) */}
                    <button
                      onClick={() => toggleOrder(order._id)}
                      className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Miniatura do primeiro item */}
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
                            {order.items.length} {order.items.length === 1 ? "item" : "itens"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-bold hidden sm:block">
                          {order.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </span>
                        <Badge variant="outline" className={`gap-1.5 ${s.color}`}>
                          {s.icon}
                          {s.label}
                        </Badge>
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </button>

                    {/* Detalhes expandidos do Pedido */}
                    {isExpanded && (
                      <div className="border-t bg-muted/10 p-4 space-y-5 animate-in slide-in-from-top-2 duration-200">

                        {/* Timeline de Status */}
                        {order.status !== "cancelled" && (
                          <div className="flex items-center justify-between gap-1 px-2">
                            {STATUS_FLOW.map((step, i) => {
                              const stepMeta = STATUS_LABELS[step];
                              const isActive = i <= progress;
                              return (
                                <div key={step} className="flex flex-col items-center gap-1.5 flex-1">
                                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground/40"}`}>
                                    {stepMeta.icon}
                                  </div>
                                  <span className={`text-[10px] font-medium ${isActive ? "text-foreground" : "text-muted-foreground/40"}`}>
                                    {stepMeta.label}
                                  </span>
                                  {i < STATUS_FLOW.length - 1 && (
                                    <div className={`absolute h-0.5 w-full ${isActive ? "bg-primary" : "bg-muted"}`} />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {order.status === "cancelled" && (
                          <div className="flex items-center gap-2 text-red-500 bg-red-500/5 border border-red-500/10 rounded-lg px-4 py-3">
                            <Ban className="h-4 w-4" />
                            <span className="text-sm font-medium">Este pedido foi cancelado</span>
                          </div>
                        )}

                        <Separator />

                        {/* Lista de Itens */}
                        <div className="space-y-3">
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Itens do Pedido</p>
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <div className="h-14 w-14 rounded-lg bg-muted/50 overflow-hidden shrink-0 border">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                ) : (
                                  <Package className="h-6 w-6 m-auto mt-4 text-muted-foreground/30" />
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-1 shrink-0">
                                <span className="text-sm font-semibold">
                                  {(item.price * item.quantity).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                </span>
                                {order.status === "delivered" && (
                                  (() => {
                                    const rev = getReviewForProduct(order._id, item.productId);
                                    if (rev) {
                                      return (
                                        <div className="flex items-center gap-1 text-[10px] text-yellow-600 font-bold bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20">
                                          <Star className="h-2.5 w-2.5 fill-yellow-600" />
                                          {rev.rating} Avaliado
                                        </div>
                                      );
                                    }
                                    return (
                                      <button
                                        onClick={() => openReviewForm(order._id, item.productId)}
                                        className="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline cursor-pointer"
                                      >
                                        Avaliar Item
                                      </button>
                                    );
                                  })()
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        <Separator />

                        {/* Resumo Financeiro + Endereço */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Resumo */}
                          <div className="space-y-2 text-sm">
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Resumo</p>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Subtotal</span>
                              <span>{order.subtotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                            </div>
                            {order.discount > 0 && (
                              <div className="flex justify-between text-green-600">
                                <span>Desconto</span>
                                <span>-{order.discount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Frete</span>
                              <span>{order.shipping === 0 ? "Grátis" : order.shipping.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                            </div>
                            {order.couponCode && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Cupom</span>
                                <Badge variant="secondary" className="text-[10px]">{order.couponCode}</Badge>
                              </div>
                            )}
                            <Separator />
                            <div className="flex justify-between font-bold text-base">
                              <span>Total</span>
                              <span>{order.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                            </div>
                          </div>

                          {/* Endereço */}
                          <div className="space-y-2 text-sm">
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                              <MapPin className="h-3 w-3" />
                              Endereço de Entrega
                            </p>
                            <div className="bg-muted/30 rounded-lg p-3 border text-muted-foreground space-y-0.5">
                              <p className="font-medium text-foreground">{order.address.street}</p>
                              <p>{order.address.city}, {order.address.state}</p>
                              <p>CEP: {order.address.zip}</p>
                            </div>
                          </div>
                        </div>

                        {/* Botão Solicitar Troca + Status da Troca */}
                        {order.status === "delivered" && (() => {
                          const ex = getExchangeForOrder(order._id);
                          if (ex) {
                            const exColors: Record<string, string> = {
                              pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
                              approved: "bg-blue-500/10 text-blue-600 border-blue-500/20",
                              rejected: "bg-red-500/10 text-red-600 border-red-500/20",
                              completed: "bg-green-500/10 text-green-600 border-green-500/20",
                            };
                            const exLabels: Record<string, string> = {
                              pending: "Troca em Análise", approved: "Troca Aprovada",
                              rejected: "Troca Recusada", completed: "Troca Concluída",
                            };
                            return (
                              <div className="flex items-center gap-2 bg-muted/30 border rounded-lg px-4 py-3 mt-2">
                                <RefreshCw className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground flex-1">Solicitação de troca</span>
                                <Badge variant="outline" className={exColors[ex.status]}>{exLabels[ex.status]}</Badge>
                              </div>
                            );
                          }
                          return (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full mt-2 gap-2 border-dashed cursor-pointer"
                              onClick={() => openExchangeForm(order._id)}
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                              Solicitar Troca
                            </Button>
                          );
                        })()}

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══ MODAL DE TROCA ═══ */}
      {exchangeOrderId && (() => {
        const order = orders?.find((o) => o._id === exchangeOrderId);
        if (!order) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setExchangeOrderId(null)}>
            <div className="bg-background border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">Solicitar Troca</h2>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => setExchangeOrderId(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-5 space-y-5">
                {/* Selecionar Itens */}
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Selecione os itens para troca</p>
                  {order.items.map((item, idx) => (
                    <button key={idx} onClick={() => toggleExchangeItem(idx)} className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors text-left cursor-pointer">
                      {exchangeItems.has(idx) ? <CheckSquare className="h-4 w-4 text-primary shrink-0" /> : <Square className="h-4 w-4 text-muted-foreground/40 shrink-0" />}
                      <div className="h-10 w-10 rounded bg-muted/50 overflow-hidden shrink-0 border">
                        {item.image ? <img src={item.image} alt="" className="h-full w-full object-cover" /> : <Package className="h-5 w-5 m-auto mt-2.5 text-muted-foreground/30" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qtd: {item.quantity}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Motivo */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Motivo da troca</Label>
                  <textarea
                    value={exchangeReason}
                    onChange={(e) => setExchangeReason(e.target.value)}
                    placeholder="Descreva o defeito de fábrica encontrado..."
                    className="w-full min-h-[80px] rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Resolução */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Como deseja resolver?</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setExchangeResolution("credit")} className={`p-3 rounded-lg border text-center text-sm font-medium transition-colors cursor-pointer ${exchangeResolution === "credit" ? "border-primary bg-primary/5 text-primary" : "hover:bg-muted/30"}`}>
                      💳 Crédito na Loja
                    </button>
                    <button onClick={() => setExchangeResolution("replacement")} className={`p-3 rounded-lg border text-center text-sm font-medium transition-colors cursor-pointer ${exchangeResolution === "replacement" ? "border-primary bg-primary/5 text-primary" : "hover:bg-muted/30"}`}>
                      📦 Novo Produto
                    </button>
                  </div>
                </div>

                {/* Regras de Troca */}
                <div className="border rounded-lg overflow-hidden">
                  <button onClick={() => setShowRules(!showRules)} className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/20 transition-colors cursor-pointer">
                    <span className="text-sm font-semibold flex items-center gap-2">
                      <Info className="h-4 w-4 text-primary" />
                      Política de Troca
                    </span>
                    {showRules ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  {showRules && (
                    <div className="px-4 pb-4 space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-start gap-2"><AlertTriangle className="h-3.5 w-3.5 mt-0.5 text-yellow-500 shrink-0" /><span>Prazo de até <strong className="text-foreground">7 dias</strong> após o recebimento</span></div>
                      <div className="flex items-start gap-2"><AlertTriangle className="h-3.5 w-3.5 mt-0.5 text-yellow-500 shrink-0" /><span>Produto deve estar <strong className="text-foreground">sem uso e com etiqueta original</strong></span></div>
                      <div className="flex items-start gap-2"><AlertTriangle className="h-3.5 w-3.5 mt-0.5 text-yellow-500 shrink-0" /><span>Apenas em peças com <strong className="text-foreground">danos de fábrica</strong></span></div>
                      <div className="flex items-start gap-2"><AlertTriangle className="h-3.5 w-3.5 mt-0.5 text-yellow-500 shrink-0" /><span>A troca gera um <strong className="text-foreground">crédito na loja</strong> ou envio do novo produto</span></div>
                      <div className="flex items-start gap-2"><AlertTriangle className="h-3.5 w-3.5 mt-0.5 text-yellow-500 shrink-0" /><span>O frete de devolução é <strong className="text-foreground">por conta do cliente</strong></span></div>
                    </div>
                  )}
                </div>

                {/* Checkbox aceitar regras */}
                <button onClick={() => setAcceptedRules(!acceptedRules)} className="flex items-center gap-2 text-sm cursor-pointer w-full text-left">
                  {acceptedRules ? <CheckSquare className="h-4 w-4 text-primary shrink-0" /> : <Square className="h-4 w-4 text-muted-foreground/40 shrink-0" />}
                  <span>Li e aceito a <strong>Política de Troca</strong></span>
                </button>

                {/* Botão Enviar */}
                <Button
                  onClick={submitExchange}
                  disabled={exchangeLoading || !acceptedRules || exchangeItems.size === 0 || !exchangeReason.trim()}
                  className="w-full h-12 gap-2 bg-primary hover:bg-primary/90"
                >
                  {exchangeLoading ? "Enviando..." : "Enviar Solicitação de Troca"}
                  {!exchangeLoading && <RefreshCw className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ═══ MODAL DE AVALIAÇÃO ═══ */}
      {reviewOrderId && reviewProductId && (() => {
        const order = orders?.find((o) => o._id === reviewOrderId);
        const item = order?.items.find((i) => i.productId === reviewProductId);
        if (!item) return null;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setReviewOrderId(null)}>
            <div className="bg-background border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
              
              {/* Header */}
              <div className="p-5 border-b flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-2 text-primary">
                  <Star className="h-5 w-5 fill-primary" />
                  <h2 className="text-lg font-bold">Avaliar Produto</h2>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => setReviewOrderId(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                {/* Produto Info */}
                <div className="flex items-center gap-4 bg-muted/30 p-3 rounded-xl border">
                  <div className="h-14 w-14 rounded-lg overflow-hidden border bg-white shrink-0">
                    {item.image ? <img src={item.image} alt="" className="h-full w-full object-cover" /> : <Package className="h-6 w-6 m-auto mt-4 text-muted-foreground/30" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Pedido #{reviewOrderId.slice(-6).toUpperCase()}</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="space-y-3 text-center">
                  <p className="text-sm font-medium text-muted-foreground">O que você achou deste produto?</p>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="group relative cursor-pointer transition-transform hover:scale-110 active:scale-95"
                      >
                        <Star
                          className={`h-9 w-9 transition-colors ${
                            star <= reviewRating 
                              ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]" 
                              : "text-muted-foreground/30 hover:text-yellow-400/50"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-xs font-bold text-yellow-600 uppercase tracking-widest">
                    {["Muito Ruim", "Ruim", "Bom", "Muito Bom", "Excelente"][reviewRating - 1]}
                  </p>
                </div>

                {/* Comentário */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <MessageSquareText className="h-3 w-3" />
                    Seu comentário
                  </Label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Conte o que achou da qualidade, conforto e estilo..."
                    className="w-full min-h-[100px] rounded-xl border bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                {/* Submit */}
                <Button
                  onClick={submitReview}
                  disabled={reviewLoading || !reviewRating}
                  className="w-full h-12 gap-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20"
                >
                  {reviewLoading ? "Enviando..." : "Enviar Minha Avaliação"}
                  {!reviewLoading && <Check className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
