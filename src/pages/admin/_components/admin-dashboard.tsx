import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Receipt from "@/components/Receipt.tsx";
import { Printer } from "lucide-react";
import { useQuery, useMutation, useAction, useConvex } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import {
  LayoutDashboard, ShoppingBag, Package, UsersRound, TrendingUp,
  Share2, ArrowRight, Settings, Plus, Search, Filter,
  ChevronDown, CheckCircle2, XCircle, Clock, Trash2, Lock,
  MapPin, ShoppingCart, Tag, ImagePlus, X, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { cn } from "@/lib/utils.ts";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";
import { motion, AnimatePresence } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton.tsx";

const NOTIFICATION_SOUND = "https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3"; // Cha-ching sound

type Tab = "overview" | "orders" | "products" | "users" | "coupons" | "exchanges" | "reviews";

const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;

const STATUS_META: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendente", color: "text-yellow-500 border-yellow-500/20 bg-yellow-500/5" },
  confirmed: { label: "Confirmado", color: "text-blue-500 border-blue-500/20 bg-blue-500/5" },
  shipped: { label: "Enviado", color: "text-purple-500 border-purple-500/20 bg-purple-500/5" },
  delivered: { label: "Entregue", color: "text-green-500 border-green-500/20 bg-green-500/5" },
  cancelled: { label: "Cancelado", color: "text-red-500 border-red-500/20 bg-red-500/5" },
  approved: { label: "Aprovado", color: "text-green-500 border-green-500/20 bg-green-500/5" },
  rejected: { label: "Rejeitado", color: "text-red-500 border-red-500/20 bg-red-500/5" },
  completed: { label: "Concluído", color: "text-blue-500 border-blue-500/20 bg-blue-500/5" },
};

function fmt(n: number | undefined | null) {
  if (n === undefined || n === null) return "R$ 0,00";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function AdminDashboard({ callerId }: { callerId: string }) {
  const convex = useConvex();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get("tab") as Tab) || "overview";

  const setActiveTab = (tab: Tab) => {
    setSearchParams({ tab });
  };
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Queries
  const stats = useQuery(api.admin.getStats, { callerId: callerId as Id<"users"> });
  const orders = useQuery(api.admin.getAllOrders, { callerId: callerId as Id<"users"> });
  const products = useQuery(api.admin.getAllProducts, { callerId: callerId as Id<"users"> });
  const users = useQuery(api.admin.getAllUsers, { callerId: callerId as Id<"users"> });
  const coupons = useQuery(api.admin.getAllCoupons, { callerId: callerId as Id<"users"> });
  const exchanges = useQuery(api.admin.getAllExchanges, { callerId: callerId as Id<"users"> });
  const reviews = useQuery(api.admin.getAllReviews, { callerId: callerId as Id<"users"> });

  const avgValue = stats?.totalRevenue && stats?.totalOrders
    ? stats.totalRevenue / stats.totalOrders
    : 0;

  // Filters
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");
  const [printingOrder, setPrintingOrder] = useState<any>(null);

  const handlePrint = (order: any) => {
    setPrintingOrder(order);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Product Form States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    name: "", brand: "", category: "", price: 0, originalPrice: 0,
    description: "", images: "", sizes: "", colors: "", tags: "",
    inStock: true, isNew: true, isFeatured: false, isBestSeller: false,
    gender: "Feminino"
  });

  // Coupon Form States
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: "", discountType: "percentage" as "percentage" | "fixed", discountValue: 0, minOrderValue: 0, isActive: true, freeShipping: false
  });

  // Password Change States
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordTargetId, setPasswordTargetId] = useState<Id<"users"> | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState("");

  // Mutations & Actions
  const updateStatus = useAction(api.admin.updateOrderStatus);
  const updateTracking = useAction(api.admin.updateOrderTracking);
  const toggleAdmin = useMutation(api.admin.toggleAdmin);
  const createProduct = useMutation(api.admin.createProduct);
  const updateProduct = useMutation(api.admin.updateProduct);
  const deleteProduct = useMutation(api.admin.deleteProduct);
  const updateExchange = useMutation(api.admin.updateExchangeStatus);
  const deleteReview = useMutation(api.admin.deleteReview);
  const createCoupon = useMutation(api.admin.createCoupon);
  const toggleCoupon = useMutation(api.admin.toggleCoupon);
  const deleteCoupon = useMutation(api.admin.deleteCoupon);
  const generateUploadUrl = useMutation(api.admin.generateUploadUrl);
  const deleteUser = useMutation(api.admin.deleteUser);
  const changePassword = useMutation(api.admin.changeUserPassword);
  const [isUploading, setIsUploading] = useState(false);

  // Sales Notification Logic
  const prevOrdersCount = useRef<number | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    // Check permission on load
    if ("Notification" in window && Notification.permission === "granted") {
      setNotificationsEnabled(true);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setNotificationsEnabled(true);
      toast.success("Notificações ativadas!");
    }
  };

  useEffect(() => {
    if (!orders) return;

    // Initialize the count on first load
    if (prevOrdersCount.current === null) {
      prevOrdersCount.current = orders.length;
      return;
    }

    // If a new order arrived
    if (orders.length > prevOrdersCount.current) {
      const newOrder = orders[0]; // Assuming orders are sorted by date desc

      // Only notify for approved/paid orders
      if (newOrder.status === "approved" || newOrder.status === "confirmed" || newOrder.status === "pending") {
        // Play Sound
        const audio = new Audio(NOTIFICATION_SOUND);
        audio.play().catch(e => console.log("Erro ao tocar áudio:", e));

        // Toast
        toast.success(`🎉 NOVA VENDA! ${fmt(newOrder.total)} de ${newOrder.userName}`, {
          duration: 10000,
          description: "Um novo pedido foi realizado na loja."
        });

        // Browser Notification
        if (Notification.permission === "granted") {
          new Notification("💰 Nova Venda Realizada!", {
            body: `${newOrder.userName} acabou de comprar: ${fmt(newOrder.total)}`,
            icon: "/logo.png"
          });
        }
      }
    }

    prevOrdersCount.current = orders.length;
  }, [orders]);

  const handleStatusChange = async (orderId: Id<"orders">, status: typeof ORDER_STATUSES[number]) => {
    try {
      await updateStatus({ callerId, orderId, status });
      toast.success("Status atualizado!");
    } catch {
      toast.error("Erro ao atualizar status");
    }
  };

  const handleToggleAdmin = async (userId: Id<"users">, current: boolean) => {
    try {
      await toggleAdmin({ callerId, userId, isAdmin: !current });
      toast.success(!current ? "Usuário promovido a admin" : "Admin removido");
    } catch {
      toast.error("Erro ao alterar permissão");
    }
  };

  const handleDeleteUser = async (userId: Id<"users">) => {
    if (!confirm("Tem certeza que deseja excluir este usuário permanentemente? Esta ação não pode ser desfeita.")) return;
    try {
      await deleteUser({ callerId, userId });
      toast.success("Usuário excluído com sucesso");
    } catch (err: any) {
      toast.error(err.message || "Erro ao excluir usuário");
    }
  };

  const handleChangePassword = (userId: Id<"users">) => {
    setPasswordTargetId(userId);
    setNewPasswordValue("");
    setIsPasswordModalOpen(true);
  };

  const handleConfirmPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordTargetId || newPasswordValue.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }
    try {
      await changePassword({ callerId, userId: passwordTargetId, newPassword: newPasswordValue });
      toast.success("Senha alterada com sucesso");
      setIsPasswordModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Erro ao alterar senha");
    }
  };

  const openProductModal = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        brand: product.brand,
        category: product.category,
        price: product.price,
        originalPrice: product.originalPrice || 0,
        description: product.description,
        images: product.images.join(", "),
        sizes: product.sizes.join(", "),
        colors: product.colors.join(", "),
        tags: product.tags.join(", "),
        inStock: product.inStock,
        isNew: product.isNew || false,
        isFeatured: product.isFeatured || false,
        isBestSeller: product.isBestSeller || false,
        gender: product.gender || "Feminino"
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: "", brand: "", category: "", price: 0, originalPrice: 0,
        description: "", images: "", sizes: "34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44", colors: "Preto, Branco", tags: "",
        inStock: true, isNew: true, isFeatured: false, isBestSeller: false,
        gender: "Feminino"
      });
    }
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedProduct = {
      ...productForm,
      images: productForm.images.split(",").map(i => i.trim()).filter(Boolean),
      sizes: productForm.sizes.split(",").map(s => s.trim()).filter(Boolean),
      colors: productForm.colors.split(",").map(c => c.trim()).filter(Boolean),
      tags: productForm.tags.split(",").map(t => t.trim()).filter(Boolean),
      rating: editingProduct?.rating || 5,
      reviews: editingProduct?.reviews || 0,
    };

    try {
      if (editingProduct) {
        await updateProduct({ callerId, productId: editingProduct._id, product: formattedProduct });
        toast.success("Produto atualizado!");
      } else {
        await createProduct({ callerId, product: formattedProduct });
        toast.success("Produto criado!");
      }
      setIsProductModalOpen(false);
    } catch (err) {
      toast.error("Erro ao salvar produto");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const currentImgs = productForm.images.split(",").map(i => i.trim()).filter(Boolean);
      const newImages = [...currentImgs];

      for (const file of Array.from(files)) {
        const postUrl = await generateUploadUrl({ callerId });
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await result.json();

        // Get the real URL from Convex
        const imageUrl = await convex.query(api.admin.getImageUrl, { storageId });
        if (imageUrl) {
          newImages.push(imageUrl);
        }
      }

      setProductForm({ ...productForm, images: newImages.join(", ") });
      toast.success("Imagens enviadas!");
    } catch (err) {
      toast.error("Erro ao enviar imagens");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const imgs = productForm.images.split(",").map(i => i.trim()).filter(Boolean);
    imgs.splice(index, 1);
    setProductForm({ ...productForm, images: imgs.join(", ") });
  };

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCoupon({ callerId, coupon: couponForm });
      toast.success("Cupom criado!");
      setIsCouponModalOpen(false);
      setCouponForm({ code: "", discountType: "percentage", discountValue: 0, minOrderValue: 0, isActive: true, freeShipping: false });
    } catch {
      toast.error("Erro ao criar cupom");
    }
  };

  const NAV: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Visão Geral", icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: "orders", label: "Pedidos", icon: <Package className="h-4 w-4" /> },
    { id: "products", label: "Produtos", icon: <ShoppingBag className="h-4 w-4" /> },
    { id: "users", label: "Usuários", icon: <UsersRound className="h-4 w-4" /> },
    { id: "coupons", label: "Cupons", icon: <TrendingUp className="h-4 w-4" /> },
    { id: "exchanges", label: "Trocas", icon: <ArrowRight className="h-4 w-4" /> },
    { id: "reviews", label: "Avaliações", icon: <Share2 className="h-4 w-4" /> },
  ];

  return (
    <>
      {/* Componente de Recibo para Admin (Ordem de Entrega) */}
      <Receipt order={printingOrder} type="admin" />

      <div className="flex min-h-screen bg-[#050505] text-white relative overflow-hidden font-sans print:hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#ea3372]/5 blur-[140px] rounded-full pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#38b6ff]/5 blur-[140px] rounded-full pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Sidebar Overlay (Mobile Only) */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[40] lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 w-72 border-r border-white/5 bg-black/80 backdrop-blur-3xl p-6 flex flex-col gap-8 z-[50] transition-transform duration-300 lg:relative lg:translate-x-0 lg:w-64 lg:bg-black/40",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 px-2 group">
              <div className="size-10 rounded-xl bg-gradient-to-br from-[#ea3372] to-[#38b6ff] flex items-center justify-center shadow-lg shadow-[#ea3372]/20 group-hover:scale-105 transition-transform">
                <span className="font-black text-white italic text-xl">A</span>
              </div>
              <div>
                <p className="font-black italic text-lg leading-none tracking-tighter">ANNA<span className="text-[#ea3372]"> SHOES</span></p>
                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/30">Admin Core</p>
              </div>
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden text-white/40" onClick={() => setIsSidebarOpen(false)}>
              <X className="size-5" />
            </Button>
          </div>

          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 px-4 py-4 lg:py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  activeTab === item.id
                    ? "bg-[#ea3372] text-white shadow-lg shadow-[#ea3372]/20"
                    : "text-white/40 hover:bg-white/5 hover:text-white/60"
                )}
              >
                <div className={cn("transition-colors", activeTab === item.id ? "text-white" : "text-white/40")}>
                  {item.icon}
                </div>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2">Sessão</p>
              <p className="text-[9px] font-bold text-white/40 truncate">{callerId}</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 overflow-auto relative z-10 flex flex-col">
          <header className="h-20 border-b border-white/5 px-4 lg:px-8 flex items-center justify-between bg-black/20 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-white/60"
                onClick={() => setIsSidebarOpen(true)}
              >
                <LayoutDashboard className="size-6" />
              </Button>
              <div>
                <h2 className="hidden lg:block text-sm font-black uppercase tracking-[0.2em] text-white/40">Dashboard</h2>
                <p className="text-lg lg:text-xl font-black italic">{NAV.find(n => n.id === activeTab)?.label}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-4">
              {!notificationsEnabled && (
                <Button
                  onClick={requestNotificationPermission}
                  variant="outline"
                  className="border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10 h-10 px-3 lg:px-4 rounded-xl gap-2 text-[10px] font-black uppercase"
                >
                  <TrendingUp className="size-3 hidden sm:block" /> {activeTab === 'overview' ? 'Ativar Alertas' : 'Alertas'}
                </Button>
              )}
              {activeTab === "products" && (
                <Button onClick={() => openProductModal()} className="bg-[#ea3372] hover:bg-[#c9295f] text-white font-bold h-10 px-4 lg:px-6 rounded-xl gap-2 shadow-lg shadow-[#ea3372]/20">
                  <Plus className="size-4" /> <span className="hidden sm:inline">Novo Produto</span>
                </Button>
              )}
              {activeTab === "coupons" && (
                <Button onClick={() => setIsCouponModalOpen(true)} className="bg-[#38b6ff] hover:bg-[#2d93cf] text-white font-bold h-10 px-4 lg:px-6 rounded-xl gap-2 shadow-lg shadow-[#38b6ff]/20">
                  <Plus className="size-4" /> <span className="hidden sm:inline">Novo Cupom</span>
                </Button>
              )}
            </div>
          </header>

          <div className="p-4 lg:p-8 flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "overview" && stats && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        { label: "Vendas Totais", value: fmt(stats.totalRevenue), icon: ShoppingBag, color: "text-[#ea3372]" },
                        { label: "Pedidos", value: stats.totalOrders, icon: Package, color: "text-[#38b6ff]" },
                        { label: "Usuários", value: stats.totalUsers, icon: UsersRound, color: "text-purple-500" },
                        { label: "Média p/ Pedido", value: fmt(avgValue), icon: TrendingUp, color: "text-green-500" },
                      ].map((s, i) => (
                        <div key={i} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-xl group hover:border-[#ea3372]/30 transition-all">
                          <s.icon className={cn("size-6 mb-4", s.color)} />
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">{s.label}</p>
                          <p className="text-2xl font-black text-white italic">{s.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5">
                        <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
                          <Package className="size-4" /> Pedidos Recentes
                        </h3>
                        <div className="space-y-4">
                          {orders?.slice(0, 5).map(o => (
                            <div key={o._id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.03]">
                              <div className="flex items-center gap-4">
                                <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-[#ea3372] italic border border-white/10">
                                  {o.userName?.charAt(0) || "C"}
                                </div>
                                <div>
                                  <p className="text-xs font-black text-white">{o.userName}</p>
                                  <p className="text-[10px] text-white/20 font-mono">#{o._id.slice(-6).toUpperCase()}</p>
                                </div>
                              </div>
                              <p className="text-xs font-black text-[#38b6ff]">{fmt(o.total)}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5">
                        <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
                          <TrendingUp className="size-4" /> Performance de Cupons
                        </h3>
                        <div className="space-y-4">
                          {coupons?.map(c => (
                            <div key={c._id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.03]">
                              <div className="flex items-center gap-4">
                                <div className={cn("size-10 rounded-xl flex items-center justify-center", c.isActive ? "bg-green-500/10 text-green-500" : "bg-white/5 text-white/20")}>
                                  <Tag className="size-4" />
                                </div>
                                <div>
                                  <p className="text-xs font-black text-white tracking-widest">{c.code}</p>
                                  <p className="text-[10px] text-white/20">{c.discountType === "percentage" ? `${c.discountValue}% OFF` : `R$ ${c.discountValue} OFF`}</p>
                                </div>
                              </div>
                              <Badge className={c.isActive ? "bg-green-500/10 text-green-500" : "bg-white/5 text-white/20"}>
                                {c.isActive ? "Ativo" : "Inativo"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "orders" && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/[0.02] p-6 rounded-3xl border border-white/5">
                      <div className="relative flex-1 w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/20" />
                        <Input
                          placeholder="Buscar por ID ou Cliente..."
                          className="bg-black/40 border-white/5 pl-12 h-12 text-xs font-medium tracking-wide rounded-2xl focus:border-[#ea3372]/40"
                          value={orderSearch}
                          onChange={e => setOrderSearch(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                          <SelectTrigger className="w-full sm:w-48 bg-black/40 border-white/5 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                            <Filter className="size-3 mr-2 text-white/40" />
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0b0b0b] border-white/10 text-white">
                            <SelectItem value="all">Todos os Status</SelectItem>
                            {ORDER_STATUSES.map(s => (
                              <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {!orders ? <SkeletonList /> : orders
                        .filter(o =>
                          (orderStatusFilter === "all" || o.status === orderStatusFilter) &&
                          (
                            (o.userName?.toLowerCase() || "").includes(orderSearch.toLowerCase()) ||
                            (o._id?.toLowerCase() || "").includes(orderSearch.toLowerCase())
                          )
                        )
                        .map(o => (
                          <OrderRow key={o._id} order={o} callerId={callerId} updateTracking={updateTracking} onStatusChange={handleStatusChange} onPrint={() => handlePrint(o)} />
                        ))
                      }
                    </div>
                  </div>
                )}

                {activeTab === "products" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                      {!products ? <SkeletonList /> : products.map(p => (
                        <ProductRow key={p._id} product={p} onEdit={() => openProductModal(p)} onDelete={() => deleteProduct({ callerId, productId: p._id })} />
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "users" && (
                  <div className="space-y-6">
                    <div className="relative max-w-md">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/20" />
                      <Input
                        placeholder="Buscar por Email ou Nome..."
                        className="bg-black/40 border-white/5 pl-12 h-12 text-xs font-medium tracking-wide rounded-2xl"
                        value={userSearch}
                        onChange={e => setUserSearch(e.target.value)}
                      />
                    </div>
                    <div className="space-y-4">
                      {!users ? <SkeletonList /> : users
                        .filter(u =>
                          (u.email?.toLowerCase() || "").includes(userSearch.toLowerCase()) ||
                          (u.name?.toLowerCase() || "").includes(userSearch.toLowerCase())
                        )
                        .map(u => (
                          <UserRow
                            key={u._id}
                            user={u}
                            onToggleAdmin={handleToggleAdmin}
                            onDelete={handleDeleteUser}
                            onChangePassword={handleChangePassword}
                          />
                        ))
                      }
                    </div>
                  </div>
                )}

                {activeTab === "coupons" && (
                  <div className="grid grid-cols-1 gap-4">
                    {!coupons ? <SkeletonList /> : coupons.map(c => (
                      <CouponRow key={c._id} coupon={c} onToggle={(v: boolean) => toggleCoupon({ callerId, couponId: c._id, isActive: v })} onDelete={() => deleteCoupon({ callerId, couponId: c._id })} />
                    ))}
                  </div>
                )}

                {activeTab === "exchanges" && (
                  <div className="space-y-4">
                    {!exchanges ? <SkeletonList /> : exchanges.map(e => (
                      <ExchangeRow key={e._id} exchange={e} onStatusChange={(s: any) => updateExchange({ callerId, exchangeId: e._id, status: s })} />
                    ))}
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {!reviews ? <SkeletonList /> : reviews.map(r => (
                      <ReviewRow key={r._id} review={r} onDelete={() => deleteReview({ callerId, reviewId: r._id })} />
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <footer className="p-8 border-t border-white/5 text-[9px] text-white/10 font-black uppercase tracking-[0.4em] text-center">
            Anna Shoes Terminal Core System &bull; Version 4.0.0-PRO
          </footer>
        </div>
      </div>

      {/* Product Modal */}
      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="bg-[#0b0b0b] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-widest italic">{editingProduct ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleProductSubmit} className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-black text-white/40">Nome do Produto</Label>
                <Input required value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-black text-white/40">Marca</Label>
                <Input required value={productForm.brand} onChange={e => setProductForm({ ...productForm, brand: e.target.value })} className="bg-white/5 border-white/10" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-black text-white/40">Categoria</Label>
                <Input required value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-black text-white/40">Público</Label>
                <Select value={productForm.gender} onValueChange={(v: any) => setProductForm({ ...productForm, gender: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0b0b0b] border-white/10 text-white">
                    <SelectItem value="Feminino">Feminino</SelectItem>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Kids">Kids</SelectItem>
                    <SelectItem value="Unissex">Unissex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-black text-white/40">Preço (R$)</Label>
                <Input type="number" required value={productForm.price} onChange={e => setProductForm({ ...productForm, price: parseFloat(e.target.value) })} className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-black text-white/40">Preço Original (R$)</Label>
                <Input type="number" value={productForm.originalPrice} onChange={e => setProductForm({ ...productForm, originalPrice: parseFloat(e.target.value) })} className="bg-white/5 border-white/10" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-black text-white/40">Descrição</Label>
              <Textarea required value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} className="bg-white/5 border-white/10 min-h-24" />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] uppercase font-black text-white/40">Imagens do Produto</Label>

              <div className="grid grid-cols-4 gap-4">
                {productForm.images.split(",").map(i => i.trim()).filter(Boolean).map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
                    <img src={img} className="size-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 size-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="size-3 text-white" />
                    </button>
                  </div>
                ))}

                <label className={cn(
                  "aspect-square rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#ea3372]/40 hover:bg-[#ea3372]/5 transition-all",
                  isUploading && "opacity-50 cursor-wait"
                )}>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                  {isUploading ? (
                    <Loader2 className="size-6 text-[#ea3372] animate-spin" />
                  ) : (
                    <>
                      <ImagePlus className="size-6 text-white/20" />
                      <span className="text-[8px] font-black uppercase text-white/20">Upload</span>
                    </>
                  )}
                </label>
              </div>

              <div className="space-y-1">
                <Label className="text-[9px] text-white/20 uppercase font-black">URLs Manuais (Opcional)</Label>
                <Input value={productForm.images} onChange={e => setProductForm({ ...productForm, images: e.target.value })} className="bg-white/5 border-white/10 text-[10px]" placeholder="Cole URLs separadas por vírgula se preferir" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-black text-white/40">Tamanhos (separados por vírgula)</Label>
                <Input required value={productForm.sizes} onChange={e => setProductForm({ ...productForm, sizes: e.target.value })} className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-black text-white/40">Cores (separadas por vírgula)</Label>
                <Input value={productForm.colors} onChange={e => setProductForm({ ...productForm, colors: e.target.value })} className="bg-white/5 border-white/10" />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 pt-2">
              {[
                { id: "inStock", label: "Em Estoque" },
                { id: "isNew", label: "Novidade" },
                { id: "isFeatured", label: "Destaque" },
                { id: "isBestSeller", label: "Mais Vendido" },
              ].map(opt => (
                <div key={opt.id} className="flex items-center gap-2">
                  <Switch
                    checked={(productForm as any)[opt.id]}
                    onCheckedChange={(v: boolean) => setProductForm({ ...productForm, [opt.id]: v })}
                  />
                  <Label className="text-[9px] uppercase font-black text-white/40">{opt.label}</Label>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsProductModalOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-[#ea3372] hover:bg-[#c9295f] text-white font-bold px-8">Salvar Produto</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Password Change Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="bg-[#0b0b0b] border-white/10 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-widest italic">Alterar Senha</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleConfirmPasswordChange} className="space-y-6 py-4">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-black text-white/40">Nova Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/20" />
                <Input
                  type="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={newPasswordValue}
                  onChange={e => setNewPasswordValue(e.target.value)}
                  className="bg-white/5 border-white/10 pl-10"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsPasswordModalOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-[#38b6ff] hover:bg-[#2d93cf] text-white font-bold px-8">Confirmar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Coupon Modal */}
      <Dialog open={isCouponModalOpen} onOpenChange={setIsCouponModalOpen}>
        <DialogContent className="bg-[#0b0b0b] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-widest italic">Novo Cupom</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCouponSubmit} className="space-y-6 py-4">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-black text-white/40">Código do Cupom</Label>
              <Input
                required placeholder="EX: VERÃO10"
                value={couponForm.code}
                onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                className="bg-white/5 border-white/10 font-mono tracking-widest"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-black text-white/40">Tipo</Label>
                <Select value={couponForm.discountType} onValueChange={(v: any) => setCouponForm({ ...couponForm, discountType: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0b0b0b] border-white/10 text-white">
                    <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                    <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-black text-white/40">Valor do Desconto</Label>
                <Input
                  type="number" required
                  value={couponForm.discountValue}
                  onChange={e => setCouponForm({ ...couponForm, discountValue: parseFloat(e.target.value) })}
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-black text-white/40">Valor Mínimo do Pedido (R$)</Label>
              <Input
                type="number" required
                value={couponForm.minOrderValue}
                onChange={e => setCouponForm({ ...couponForm, minOrderValue: parseFloat(e.target.value) })}
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Switch
                checked={couponForm.freeShipping}
                onCheckedChange={(v: boolean) => setCouponForm({ ...couponForm, freeShipping: v })}
              />
              <div className="space-y-0.5">
                <Label className="text-[10px] uppercase font-black text-white/40">Frete Grátis</Label>
                <p className="text-[9px] text-white/20">Zera o custo de entrega para este cupom</p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsCouponModalOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-[#38b6ff] hover:bg-[#2d93cf] text-white font-bold px-8">Criar Cupom</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function SkeletonList() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 w-full bg-white/5 rounded-2xl" />)}
    </div>
  );
}

function OrderRow({ order, callerId, updateTracking, onStatusChange, onPrint }: { order: any; callerId: string; updateTracking: any; onStatusChange: any; onPrint: any }) {
  const meta = STATUS_META[order.status] || STATUS_META.pending;
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] transition-all overflow-hidden group">
      <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shadow-lg cursor-pointer" onClick={() => setExpanded(!expanded)}>
            <Package className={cn("size-6 text-white/40 transition-transform", expanded && "rotate-180")} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-sm text-white">{order.userName || "Cliente"}</h4>
              <Badge variant="outline" className={cn(meta.color, "text-[8px] uppercase font-black px-2 py-0 border")}>{meta.label}</Badge>
            </div>
            <p className="text-[10px] font-mono text-white/20">#{order._id?.slice(-8).toUpperCase()} · {order.createdAt ? format(new Date(order.createdAt), "dd/MM/yyyy HH:mm") : "Sem data"}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 lg:gap-8">
          <div className="text-left md:text-right min-w-[80px]">
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-1">Total</p>
            <p className="text-base lg:text-lg font-black text-white leading-none">{fmt(order.total)}</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/5 border-white/10 hover:bg-[#ea3372]/10 hover:text-[#ea3372] text-[9px] lg:text-[10px] font-black uppercase tracking-widest h-10 px-3 lg:px-4 gap-2 cursor-pointer transition-all flex-1 sm:flex-none"
              onClick={onPrint}
            >
              <Printer className="size-3" />
              <span className="hidden xs:inline">Guia</span>
              <span className="hidden lg:inline">de Envio</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-white/10 text-[9px] lg:text-[10px] font-black uppercase tracking-widest h-10 px-3 lg:px-4 flex-1 sm:flex-none">
                  Status <ChevronDown className="ml-1 lg:ml-2 size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#0b0b0b] border-white/10">
                {ORDER_STATUSES.map(s => (
                  <DropdownMenuItem
                    key={s}
                    className="text-xs text-white/60 focus:text-white focus:bg-white/5 cursor-pointer"
                    onClick={() => onStatusChange(order._id, s)}
                  >
                    {STATUS_META[s].label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5 bg-black/20"
          >
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h5 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
                  <ShoppingBag className="size-3" /> Itens do Pedido
                </h5>
                <div className="space-y-3">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 bg-white/5 p-2 rounded-lg">
                      <img src={item.image} className="size-10 rounded object-cover" />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-white leading-tight">{item.name}</p>
                        <p className="text-[10px] text-white/40">Qtd: {item.quantity} · {fmt(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
                  <MapPin className="size-3" /> Endereço de Entrega
                </h5>
                <div className="bg-white/5 p-4 rounded-xl space-y-1">
                  <p className="text-xs font-bold text-white">{order.address?.street}</p>
                  <p className="text-[10px] text-white/60">{order.address?.city}, {order.address?.state}</p>
                  <p className="text-[10px] text-white/60">CEP: {order.address?.zip}</p>
                  <p className="text-[10px] text-white/40 mt-2 font-mono">{order.userEmail}</p>
                </div>
              </div>
              <div className="md:col-span-2 pt-6 border-t border-white/5">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-[#ea3372] mb-4 flex items-center gap-2">
                  <TrendingUp className="size-3" /> Gestão de Rastreio
                </h5>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative group">
                    <Input
                      placeholder="CÓDIGO DE RASTREIO (EX: AA123456789BR)"
                      className="bg-white/5 border-white/10 h-12 text-xs font-bold tracking-widest pl-4 uppercase rounded-2xl focus:border-[#ea3372]/40 transition-all"
                      defaultValue={order.trackingCode || ""}
                      id={`tracking-${order._id}`}
                    />
                  </div>
                  <Button
                    className="bg-[#38b6ff] hover:bg-[#2d93cf] text-white font-black px-8 h-12 rounded-2xl transition-all shadow-xl shadow-[#38b6ff]/20 flex items-center gap-2"
                    onClick={async () => {
                      const input = document.getElementById(`tracking-${order._id}`) as HTMLInputElement;
                      const val = input.value.trim().toUpperCase();
                      if (!val) return toast.error("Por favor, insira um código de rastreio válido.");
                      
                      try {
                        await updateTracking({ 
                          callerId: callerId as Id<"users">, 
                          orderId: order._id, 
                          trackingCode: val 
                        });
                        toast.success("Rastreio atualizado e cliente notificado!");
                      } catch (e) {
                        toast.error("Erro ao atualizar rastreio.");
                      }
                    }}
                  >
                    <Package className="size-4" />
                    {order.trackingCode ? "Atualizar Rastreio" : "Notificar Cliente"}
                  </Button>
                </div>
                {order.trackingCode && (
                  <p className="text-[9px] text-green-500 font-black mt-3 uppercase tracking-widest flex items-center gap-1 opacity-70">
                    <CheckCircle2 className="size-3" /> Código de rastreio ativo: {order.trackingCode}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductRow({ product, onEdit, onDelete }: { product: any; onEdit: any; onDelete: any }) {
  return (
    <div className="p-6 rounded-2xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] transition-all flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="size-14 rounded-xl overflow-hidden border border-white/10">
          <img src={product.images[0]} className="size-full object-cover" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-sm text-white">{product.name}</h4>
            <Badge variant="outline" className="text-[8px] uppercase font-black px-2 py-0 border-white/10 text-white/40">{product.brand}</Badge>
            {product.inStock ? (
              <Badge className="bg-green-500/10 text-green-500 text-[8px] font-black uppercase px-2 py-0 border-0">Em Estoque</Badge>
            ) : (
              <Badge className="bg-red-500/10 text-red-500 text-[8px] font-black uppercase px-2 py-0 border-0">Esgotado</Badge>
            )}
          </div>
          <p className="text-[10px] font-medium text-white/30 tracking-wider capitalize">{product.category} · {product.sizes.length} Tamanhos</p>
        </div>
      </div>

      <div className="flex items-center gap-10">
        <div className="text-right hidden sm:block">
          <p className="text-xs text-white/30 font-bold uppercase tracking-widest mb-1">Preço</p>
          <p className="text-lg font-black text-white leading-none">{fmt(product.price)}</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-white/5">
              <Settings className="size-4 text-white/20" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#0b0b0b] border-white/10">
            <DropdownMenuItem className="text-xs text-white/60 focus:text-white focus:bg-white/5 cursor-pointer" onClick={onEdit}>
              Editar Produto
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs text-red-500 focus:text-red-400 focus:bg-red-500/5 cursor-pointer" onClick={onDelete}>
              Excluir Produto
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function ExchangeRow({ exchange, onStatusChange }: { exchange: any; onStatusChange: any }) {
  const meta = STATUS_META[exchange.status] || STATUS_META.pending;
  return (
    <div className="p-6 rounded-2xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <div className="size-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
          <Clock className="size-6 text-purple-500" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-sm text-white">{exchange.userName}</h4>
            <Badge variant="outline" className={cn(meta.color, "text-[8px] uppercase font-black px-2 py-0 border")}>{meta.label}</Badge>
          </div>
          <p className="text-[10px] text-white/30">Motivo: {exchange.reason}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Select value={exchange.status} onValueChange={onStatusChange}>
          <SelectTrigger className="w-40 bg-white/5 border-white/10 h-10 text-[10px] font-black uppercase tracking-widest">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#0b0b0b] border-white/10 text-white">
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="approved">Aprovado</SelectItem>
            <SelectItem value="rejected">Rejeitado</SelectItem>
            <SelectItem value="completed">Concluído</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function ReviewRow({ review, onDelete }: { review: any; onDelete: any }) {
  return (
    <div className="p-6 rounded-2xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] transition-all flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-xs border border-white/10">
            {(review.userName || "?").charAt(0)}
          </div>
          <div>
            <p className="text-xs font-bold text-white">{review.userName || "Usuário"}</p>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <TrendingUp key={i} className={cn("size-2", i < review.rating ? "text-yellow-500" : "text-white/10")} />
              ))}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/5" onClick={onDelete}>
          <Clock className="size-4" />
        </Button>
      </div>
      <p className="text-xs text-white/60 leading-relaxed italic">"{review.comment}"</p>
      <p className="text-[9px] text-white/20 font-mono uppercase tracking-widest">ID Pedido: {review.orderId?.slice(-8).toUpperCase()}</p>
    </div>
  );
}

function CouponRow({ coupon, onToggle, onDelete }: { coupon: any; onToggle: any; onDelete: any }) {
  return (
    <div className="p-6 rounded-2xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] transition-all flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className={cn(
          "size-12 rounded-xl flex items-center justify-center border shadow-lg",
          coupon.isActive ? "bg-green-500/10 border-green-500/20" : "bg-white/5 border-white/10"
        )}>
          <Tag className={cn("size-6", coupon.isActive ? "text-green-500" : "text-white/20")} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-sm text-white tracking-widest uppercase">{coupon.code}</h4>
            {coupon.isActive ? (
              <Badge className="bg-green-500 text-white text-[8px] font-black uppercase px-2 py-0">Ativo</Badge>
            ) : (
              <Badge variant="outline" className="text-white/20 border-white/10 text-[8px] font-black uppercase px-2 py-0">Inativo</Badge>
            )}
          </div>
          <p className="text-[10px] font-medium text-white/30 tracking-wider">
            {coupon.discountType === "percentage" ? `${coupon.discountValue}% OFF` : `R$ ${coupon.discountValue} OFF`}
            {coupon.freeShipping && " · + Frete Grátis"}
            {coupon.minOrderValue > 0 && ` · Mínimo: ${fmt(coupon.minOrderValue)}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "text-[9px] font-black uppercase tracking-widest h-9 px-4 rounded-lg",
            coupon.isActive ? "text-red-400 hover:text-red-300 hover:bg-red-500/5" : "text-green-400 hover:text-green-300 hover:bg-green-500/5"
          )}
          onClick={() => onToggle(!coupon.isActive)}
        >
          {coupon.isActive ? <XCircle className="size-3 mr-2" /> : <CheckCircle2 className="size-3 mr-2" />}
          {coupon.isActive ? "Desativar" : "Ativar"}
        </Button>

        <Button variant="ghost" size="icon" className="text-white/10 hover:text-red-500 hover:bg-red-500/5 h-9 w-9" onClick={onDelete}>
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function UserRow({ user, onToggleAdmin, onDelete, onChangePassword }: { user: any; onToggleAdmin: any; onDelete: any; onChangePassword: any }) {
  return (
    <div className="p-6 rounded-2xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] transition-all flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="size-12 rounded-full bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center border border-white/10 font-black text-white/60 italic">
          {(user.name || user.email || "?").charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-sm text-white">{user.name || "Sem Nome"}</h4>
            {user.isAdmin && <Badge className="bg-[#ea3372] text-white text-[8px] font-black uppercase px-2 py-0 border-0">Admin</Badge>}
          </div>
          <p className="text-[10px] font-medium text-white/30 tracking-wider">{user.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-10">
        <div className="text-right hidden sm:block">
          <p className="text-xs text-white/30 font-bold uppercase tracking-widest mb-1">Gasto Total</p>
          <p className="text-lg font-black text-white leading-none">{fmt(user.totalSpent)}</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-white/5">
              <Settings className="size-4 text-white/20" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#0b0b0b] border-white/10">
            <DropdownMenuItem
              className="text-xs text-white/60 focus:text-white focus:bg-white/5 cursor-pointer"
              onClick={() => onToggleAdmin(user._id, user.isAdmin)}
            >
              {user.isAdmin ? "Remover Privilégios Admin" : "Tornar Administrador"}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-xs text-white/60 focus:text-white focus:bg-white/5 cursor-pointer"
              onClick={() => onChangePassword(user._id)}
            >
              Alterar Senha
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-xs text-red-500 focus:text-red-400 focus:bg-red-500/5 cursor-pointer"
              onClick={() => onDelete(user._id)}
            >
              Excluir Usuário
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
