import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
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
  Star, StarOff, MessageSquareText, Eye, EyeOff, Trash2, CreditCard
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
  const { user, removeUser, isAuthenticated } = useAuth();
  const userId = user?._id;

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="bg-yellow-500/10 h-20 w-20 rounded-full flex items-center justify-center mx-auto">
          <User className="h-10 w-10 text-yellow-600" />
        </div>
        <h2 className="text-2xl font-black italic uppercase tracking-tighter">Área de Cliente</h2>
        <p className="text-muted-foreground text-sm">Acesse sua conta para gerenciar seu perfil e pedidos.</p>
        <Button asChild className="bg-[#ea3372] hover:bg-[#c9295f] text-white font-bold w-full">
          <Link to="/auth">Entrar na Conta</Link>
        </Button>
      </div>
    );
  }

  const currentUser = useQuery(api.users.getCurrentUser, userId ? { userId } : {});
  const orders = useQuery(api.orders.getMyOrders, userId ? { userId } : "skip");
  const exchanges = useQuery(api.exchanges.getMyExchanges, userId ? { userId } : "skip");
  const reviews = useQuery(api.reviews.getMyReviews, userId ? { userId } : "skip");
  const updateProfile = useMutation(api.users.updateProfile);
  const createExchange = useMutation(api.exchanges.createExchange);
  const createReview = useMutation(api.reviews.createReview);
  const deleteOrder = useMutation(api.orders.deleteOrder);
  const createPayment = useAction(api.mercadopago.createPayment);


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
  
  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const updatePassword = useMutation(api.users.updatePassword);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState<string | null>(null);

  if (userId && currentUser === undefined) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <Skeleton className="h-10 w-48" />
        <Card><CardContent className="py-10"><Skeleton className="h-32 w-full" /></CardContent></Card>
      </div>
    );
  }

  const handleUpdatePassword = async () => {
    if (!userId) return;
    if (newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    
    setPasswordLoading(true);
    try {
      await updatePassword({ userId, newPassword });
      toast.success("Senha alterada com sucesso!");
      setShowPasswordForm(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Erro ao alterar senha");
    } finally {
      setPasswordLoading(false);
    }
  };

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
        productId: reviewProductId as Id<"products">,
        rating: reviewRating,
        comment: reviewComment.trim(),
        userName: currentUser?.name ?? user?.name ?? "Cliente",
        userAvatar: (typeof currentUser?.avatar === "string" ? currentUser.avatar : undefined) ?? (typeof user?.avatar === "string" ? user.avatar : undefined),
      });
      toast.success("Avaliação enviada! Obrigado.");
      setReviewOrderId(null);
    } catch (err: any) {
      toast.error(err.data?.message || err.message || "Erro ao enviar avaliação");
    } finally {
      setReviewLoading(false);
    }
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
    if (!userId) return;
    if (!confirm("Tem certeza que deseja excluir este pedido pendente?")) return;

    setIsDeleting(orderId);
    try {
      await deleteOrder({ orderId, userId });
      toast.success("Pedido excluído com sucesso");
    } catch (error) {
      toast.error("Erro ao excluir pedido");
      console.error(error);
    } finally {
      setIsDeleting(null);
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
          
          <Separator className="my-6" />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-primary" />
                <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Segurança</p>
              </div>
              {!showPasswordForm ? (
                <Button variant="outline" size="sm" onClick={() => setShowPasswordForm(true)} className="text-xs gap-2 cursor-pointer">
                  <Pencil className="h-3 w-3" /> Alterar Senha
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setShowPasswordForm(false)} className="text-xs cursor-pointer">
                  Cancelar
                </Button>
              )}
            </div>
            
            {showPasswordForm && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border animate-in slide-in-from-top-2 duration-200">
                <div className="space-y-1">
                  <Label htmlFor="new-password">Nova Senha</Label>
                  <div className="relative">
                    <Input 
                      id="new-password" 
                      type={showNewPassword ? "text" : "password"} 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      placeholder="Mínimo 6 caracteres"
                      className="pr-10"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="confirm-password">Confirmar Senha</Label>
                  <div className="relative">
                    <Input 
                      id="confirm-password" 
                      type={showConfirmPassword ? "text" : "password"} 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      placeholder="Repita a nova senha"
                      className="pr-10"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <Button 
                    onClick={handleUpdatePassword} 
                    disabled={passwordLoading || !newPassword || !confirmPassword}
                    className="w-full sm:w-auto h-10 px-8 gap-2 bg-[#ea3372] hover:bg-[#c9295f] text-white font-bold"
                  >
                    {passwordLoading ? "Atualizando..." : "Confirmar Nova Senha"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Support Card */}
      <Card className="bg-gradient-to-br from-[#ea3372]/5 to-transparent border-[#ea3372]/10 shadow-xl shadow-[#ea3372]/5">
        <CardContent className="py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 text-center sm:text-left">
            <div className="size-14 rounded-2xl bg-[#ea3372]/10 flex items-center justify-center border border-[#ea3372]/20 shadow-inner">
              <MessageSquareText className="h-7 w-7 text-[#ea3372]" />
            </div>
            <div>
              <h3 className="font-black italic uppercase tracking-tight text-xl leading-tight">Dúvidas com seu pedido?</h3>
              <p className="text-xs text-muted-foreground font-medium mt-1">Nossa equipe de suporte está online para te atender agora.</p>
            </div>
          </div>
          <Button
            asChild
            className="bg-[#25d366] hover:bg-[#128c7e] text-white font-black px-8 py-6 rounded-2xl shadow-xl shadow-[#25d366]/20 gap-3 w-full sm:w-auto transition-all hover:scale-105 active:scale-95"
          >
            <a href="https://wa.me/5531998523315" target="_blank" rel="noopener noreferrer">
              <MessageSquareText className="h-5 w-5" />
              Falar no WhatsApp
            </a>
          </Button>
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
