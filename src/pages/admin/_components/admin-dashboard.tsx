import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Receipt from "@/components/Receipt.tsx";
import { Printer } from "lucide-react";
import { useQuery, useMutation, useAction, useConvex } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import {
  LayoutDashboard, ShoppingBag, Package, UsersRound, TrendingUp,
  Share2, ArrowRight, Settings, Settings2, Plus, Search, Filter,
  ChevronDown, CheckCircle2, CheckCircle, XCircle, Clock, Trash2, Lock,
  MapPin, ShoppingCart, Tag, ImagePlus, X, Loader2, Star
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
  pending: { label: "Pendente", color: "text-amber-600 border-amber-200 bg-amber-50" },
  confirmed: { label: "Confirmado", color: "text-blue-600 border-blue-200 bg-blue-50" },
  shipped: { label: "Enviado", color: "text-purple-600 border-purple-200 bg-purple-50" },
  delivered: { label: "Entregue", color: "text-green-600 border-green-200 bg-green-50" },
  cancelled: { label: "Cancelado", color: "text-red-600 border-red-200 bg-red-50" },
  approved: { label: "Aprovado", color: "text-green-600 border-green-200 bg-green-50" },
  rejected: { label: "Rejeitado", color: "text-red-600 border-red-200 bg-red-50" },
  completed: { label: "Concluído", color: "text-blue-600 border-blue-200 bg-blue-50" },
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
    gender: "Feminino", colorVariants: [] as { color: string, sizes: string[] }[]
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
  const createProduct = useMutation(api.admin.createProductAdvanced);
  const updateProduct = useMutation(api.admin.updateProductAdvanced);
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
        gender: product.gender || "Feminino",
        colorVariants: product.colorVariants || []
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: "", brand: "", category: "", price: 0, originalPrice: 0,
        description: "", images: "", sizes: "34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44", colors: "Preto, Branco", tags: "",
        inStock: true, isNew: true, isFeatured: false, isBestSeller: false,
        gender: "Feminino", colorVariants: []
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
      colorVariants: productForm.colorVariants,
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

      <div className="flex min-h-screen bg-[#fdf0e3] text-[#660e14] relative overflow-hidden font-sans print:hidden">
        {/* LUZES ATMOSFÉRICAS REFINADAS */}
        <div className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-[#ad2335]/5 blur-[160px] rounded-full pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-[#660e14]/5 blur-[160px] rounded-full pointer-events-none animate-pulse" style={{ animationDelay: '3s' }} />

        {/* Sidebar Sidebar Overlay (Mobile Only) */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[40] lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar com Glassmorphism */}
        <aside className={cn(
          "fixed inset-y-0 left-0 w-72 border-r border-black/5 bg-white/80 backdrop-blur-3xl p-6 flex flex-col gap-10 z-[50] transition-all duration-500 lg:relative lg:translate-x-0 lg:w-64",
          isSidebarOpen ? "translate-x-0 shadow-2xl shadow-black/10" : "-translate-x-full"
        )}>
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 px-1 group">
              <div className="size-11 rounded-2xl bg-gradient-to-br from-[#660e14] to-[#ad2335] p-[1.5px] group-hover:scale-110 transition-all duration-700 shadow-lg shadow-[#660e14]/10">
                <div className="size-full bg-white rounded-2xl flex items-center justify-center border border-white/50">
                  <span className="font-black text-[#660e14] italic text-2xl tracking-tighter">A</span>
                </div>
              </div>
              <div>
                <p className="font-black italic text-xl leading-none tracking-tighter text-[#660e14]">ANNA<span className="text-[#ad2335]"> CORE</span></p>
                <p className="text-[7px] font-black uppercase tracking-[0.4em] text-[#660e14]/20 mt-1">Management Hub</p>
              </div>
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden text-white/40" onClick={() => setIsSidebarOpen(false)}>
              <X className="size-5" />
            </Button>
          </div>

          <nav className="flex flex-col gap-2">
            {NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={cn(
                  "group flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 relative overflow-hidden",
                  activeTab === item.id
                    ? "bg-[#660e14] text-white shadow-xl shadow-[#660e14]/20"
                    : "text-[#660e14]/30 hover:bg-[#660e14]/5 hover:text-[#660e14]"
                )}
              >
                <div className={cn("transition-all duration-300 group-hover:scale-125 group-hover:rotate-6", activeTab === item.id ? "text-white" : "text-[#ad2335]")}>
                  {item.icon}
                </div>
                {item.label}
                {activeTab === item.id && (
                  <motion.div layoutId="activeInd" className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full shadow-lg shadow-white/50" />
                )}
              </button>
            ))}
          </nav>

          <div className="mt-auto space-y-4">
            <div className="p-5 rounded-3xl bg-[#660e14]/5 border border-[#660e14]/5 group hover:border-[#ad2335]/20 transition-colors duration-500">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#660e14]/20 mb-3">Administrador</p>
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-[#ad2335]/10 border border-[#ad2335]/30 flex items-center justify-center font-black italic text-[#ad2335] text-[10px]">
                  AS
                </div>
                <p className="text-[10px] font-bold text-[#660e14]/40 truncate uppercase tracking-widest">{callerId.slice(0, 12)}...</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 overflow-auto relative z-10 flex flex-col">
          <header className="h-24 border-b border-black/5 px-6 lg:px-10 flex items-center justify-between bg-white/20 backdrop-blur-xl sticky top-0 z-30">
            <div className="flex items-center gap-5">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-[#660e14]/60 hover:bg-[#660e14]/5"
                onClick={() => setIsSidebarOpen(true)}
              >
                <LayoutDashboard className="size-6" />
              </Button>
              <div>
                <h2 className="hidden lg:block text-[9px] font-black uppercase tracking-[0.4em] text-[#660e14]/20 mb-1">Central de Comando</h2>
                <div className="flex items-center gap-3">
                  <div className="size-1.5 rounded-full bg-[#ad2335] animate-pulse shadow-lg shadow-[#ad2335]/50" />
                  <p className="text-xl lg:text-3xl font-normal text-[#660e14] tracking-tight" style={{ fontFamily: "'Last Dream', cursive" }}>{NAV.find(n => n.id === activeTab)?.label}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-4">
              {!notificationsEnabled ? (
                <Button
                  onClick={requestNotificationPermission}
                  className="bg-[#ad2335] hover:bg-[#660e14] text-white h-11 px-6 rounded-2xl gap-3 text-[10px] font-black uppercase shadow-xl shadow-[#ad2335]/20 border-0 transition-all active:scale-95"
                >
                  <Star className="size-3.5 animate-pulse" /> Ativar Alertas
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    const audio = new Audio(NOTIFICATION_SOUND);
                    audio.play().catch(() => toast.error("Permita o áudio no navegador"));
                    toast.success("Sistema de Áudio Operacional! 💰", {
                      icon: "🔊",
                      style: { background: "#ffffff", color: "#660e14", border: "1px solid rgba(0,0,0,0.05)" }
                    });
                  }}
                  variant="ghost"
                  className="text-[#660e14]/20 hover:text-[#ad2335] hover:bg-[#660e14]/5 h-11 px-4 rounded-2xl gap-3 text-[9px] font-black uppercase transition-all"
                >
                  <TrendingUp className="size-3.5" /> Testar Terminal
                </Button>
              )}
              {activeTab === "products" && (
                <Button onClick={() => openProductModal()} className="bg-[#660e14] text-white hover:bg-[#ad2335] font-black h-11 px-6 rounded-2xl gap-2 shadow-xl shadow-[#660e14]/10 transition-all active:scale-95">
                  <Plus className="size-4" /> <span className="hidden sm:inline text-[10px] uppercase tracking-widest">Novo Item</span>
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
                        { label: "Receita Bruta", value: fmt(stats.totalRevenue), icon: ShoppingBag, color: "text-[#ad2335]", bg: "bg-[#ad2335]/10" },
                        { label: "Volume de Pedidos", value: stats.totalOrders, icon: Package, color: "text-[#660e14]", bg: "bg-[#660e14]/10" },
                        { label: "Base de Usuários", value: stats.totalUsers, icon: UsersRound, color: "text-[#660e14]", bg: "bg-[#660e14]/10" },
                        { label: "Ticket Médio", value: fmt(avgValue), icon: TrendingUp, color: "text-green-600", bg: "bg-green-600/10" },
                      ].map((s, i) => (
                        <div key={i} className="p-8 rounded-[32px] bg-white/40 border border-black/5 backdrop-blur-3xl group hover:border-[#660e14]/10 transition-all duration-500 relative overflow-hidden shadow-sm hover:shadow-xl">
                          <div className={cn("absolute top-0 right-0 size-24 blur-[60px] opacity-10 transition-opacity group-hover:opacity-20", s.bg)} />
                          <div className={cn("size-12 rounded-2xl flex items-center justify-center mb-6 border border-black/5 transition-transform duration-500 group-hover:scale-110", s.bg)}>
                            <s.icon className={cn("size-6", s.color)} />
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#660e14]/40 mb-2">{s.label}</p>
                          <p className="text-3xl font-black text-[#660e14] italic tracking-tighter">{s.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="p-8 rounded-[32px] bg-white/60 border border-black/5 shadow-sm">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-[#660e14]/40 mb-6 flex items-center gap-2">
                          <Package className="size-4 text-[#ad2335]" /> Pedidos Recentes
                        </h3>
                        <div className="space-y-4">
                          {orders?.slice(0, 5).map(o => (
                            <div key={o._id} className="flex items-center justify-between p-4 rounded-2xl bg-white/40 border border-black/5 group hover:border-[#ad2335]/20 transition-all">
                              <div className="flex items-center gap-4">
                                <div className="size-10 rounded-xl bg-[#660e14]/5 flex items-center justify-center font-black text-[#660e14] italic border border-black/5 uppercase">
                                  {o.userName?.charAt(0) || "C"}
                                </div>
                                <div>
                                  <p className="text-xs font-black text-[#660e14]">{o.userName}</p>
                                  <p className="text-[10px] text-[#660e14]/40 font-bold uppercase tracking-tighter">#{o._id.slice(-6).toUpperCase()}</p>
                                </div>
                              </div>
                              <p className="text-xs font-black text-[#ad2335]">{fmt(o.total)}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-8 rounded-[32px] bg-white/60 border border-black/5 shadow-sm">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-[#660e14]/40 mb-6 flex items-center gap-2">
                          <TrendingUp className="size-4 text-[#ad2335]" /> Performance de Cupons
                        </h3>
                        <div className="space-y-4">
                          {coupons?.map(c => (
                            <div key={c._id} className="flex items-center justify-between p-4 rounded-2xl bg-white/40 border border-black/5 group hover:border-[#ad2335]/20 transition-all">
                              <div className="flex items-center gap-4">
                                <div className={cn("size-10 rounded-xl flex items-center justify-center", c.isActive ? "bg-green-100 text-green-600" : "bg-[#660e14]/5 text-[#660e14]/20")}>
                                  <Tag className="size-4" />
                                </div>
                                <div>
                                  <p className="text-xs font-black text-[#660e14] tracking-widest">{c.code}</p>
                                  <p className="text-[10px] text-[#660e14]/40 font-bold uppercase">{c.discountType === "percentage" ? `${c.discountValue}% OFF` : `R$ ${c.discountValue} OFF`}</p>
                                </div>
                              </div>
                              <Badge className={c.isActive ? "bg-green-100 text-green-600 border-green-200" : "bg-[#660e14]/5 text-[#660e14]/20 border-transparent"}>
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
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/60 p-6 rounded-[32px] border border-black/5 shadow-sm">
                      <div className="relative flex-1 w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#660e14]/20" />
                        <Input
                          placeholder="Buscar por ID ou Cliente..."
                          className="bg-white/40 border-black/5 pl-12 h-12 text-xs font-bold tracking-wide rounded-2xl focus:border-[#ad2335]/40 text-[#660e14]"
                          value={orderSearch}
                          onChange={e => setOrderSearch(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                          <SelectTrigger className="w-full sm:w-48 bg-white/40 border-black/5 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#660e14]">
                            <Filter className="size-3 mr-2 text-[#660e14]/40" />
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-black/10 text-[#660e14]">
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
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#660e14]" />
                      <Input
                        placeholder="Buscar por Email ou Nome..."
                        className="bg-white border-black/10 pl-12 h-12 text-xs font-bold tracking-wide rounded-2xl text-[#660e14] placeholder:text-[#660e14]/30 shadow-sm"
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
        <DialogContent className="bg-white border-black/10 text-[#660e14] max-w-2xl max-h-[90vh] overflow-auto custom-scrollbar rounded-[32px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-normal tracking-tight italic" style={{ fontFamily: "'Last Dream', cursive" }}>{editingProduct ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleProductSubmit} className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-black text-[#660e14]/40">Nome do Produto</Label>
                <Input required value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} className="bg-[#660e14]/5 border-black/5" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-black text-[#660e14]/40">Marca</Label>
                <Input required value={productForm.brand} onChange={e => setProductForm({ ...productForm, brand: e.target.value })} className="bg-[#660e14]/5 border-black/5" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-black text-[#660e14]/40">Categoria</Label>
                <Input required value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} className="bg-[#660e14]/5 border-black/5" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-black text-[#660e14]/40">Público</Label>
                <Select value={productForm.gender} onValueChange={(v: any) => setProductForm({ ...productForm, gender: v })}>
                  <SelectTrigger className="bg-[#660e14]/5 border-black/5 h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-black/10 text-[#660e14]">
                    <SelectItem value="Feminino">Feminino</SelectItem>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Kids">Kids</SelectItem>
                    <SelectItem value="Unissex">Unissex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-black text-[#660e14]/40">Preço (R$)</Label>
                <Input type="number" required value={productForm.price} onChange={e => setProductForm({ ...productForm, price: parseFloat(e.target.value) })} className="bg-[#660e14]/5 border-black/5" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-black text-[#660e14]/40">Descrição <span className="text-[8px] opacity-50 lowercase">(Opcional)</span></Label>
              <Textarea value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} className="bg-[#660e14]/5 border-black/5 min-h-24" />
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
                <Input required value={productForm.sizes} onChange={e => setProductForm({ ...productForm, sizes: e.target.value })} className="bg-white/5 border-white/10" placeholder="Ex: 35, 36, 37, 38" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-black text-white/40">Cores (separadas por vírgula)</Label>
                <Input value={productForm.colors} onChange={e => setProductForm({ ...productForm, colors: e.target.value })} className="bg-white/5 border-white/10" placeholder="Ex: Branco, Preto" />
              </div>
            </div>

            {/* Configuração Avançada de Estoque */}
            {productForm.colors && productForm.sizes && (
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                <Label className="text-[10px] uppercase font-black text-[#38b6ff] flex items-center gap-2">
                  <Settings2 className="size-3" /> Configuração de Estoque por Cor
                </Label>
                
                <div className="space-y-6">
                  {productForm.colors.split(",").map(c => c.trim()).filter(Boolean).map(color => (
                    <div key={color} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-[#ea3372]" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/60">{color}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {productForm.sizes.split(",").map(s => s.trim()).filter(Boolean).map(size => {
                          const variant = productForm.colorVariants.find(v => v.color === color);
                          const isSelected = variant?.sizes.includes(size);
                          
                          return (
                            <button
                              key={size}
                              type="button"
                              onClick={() => {
                                const newVariants = [...productForm.colorVariants];
                                const index = newVariants.findIndex(v => v.color === color);
                                
                                if (index === -1) {
                                  newVariants.push({ color, sizes: [size] });
                                } else {
                                  const sizes = newVariants[index].sizes;
                                  if (sizes.includes(size)) {
                                    newVariants[index].sizes = sizes.filter(s => s !== size);
                                  } else {
                                    newVariants[index].sizes = [...sizes, size];
                                  }
                                }
                                setProductForm({ ...productForm, colorVariants: newVariants });
                              }}
                              className={cn(
                                "h-8 min-w-[40px] px-2 rounded-lg border text-[10px] font-black transition-all",
                                isSelected 
                                  ? "bg-[#ea3372] border-[#ea3372] text-white shadow-lg shadow-[#ea3372]/20" 
                                  : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                              )}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
              <Button type="button" variant="ghost" onClick={() => setIsProductModalOpen(false)} className="text-[#660e14]/40">Cancelar</Button>
              <Button type="submit" className="bg-[#660e14] hover:bg-[#ad2335] text-white font-bold px-8 rounded-xl shadow-lg shadow-[#660e14]/10 transition-all">Salvar Produto</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Password Change Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="bg-white border-black/10 text-[#660e14] max-w-sm rounded-[32px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-normal tracking-tight" style={{ fontFamily: "'Last Dream', cursive" }}>Alterar Senha</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleConfirmPasswordChange} className="space-y-6 py-4">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-black text-[#660e14]/40">Nova Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#660e14]/20" />
                <Input
                  type="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={newPasswordValue}
                  onChange={e => setNewPasswordValue(e.target.value)}
                  className="bg-[#660e14]/5 border-black/5 pl-10 text-[#660e14]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsPasswordModalOpen(false)} className="text-[#660e14]/40">Cancelar</Button>
              <Button type="submit" className="bg-[#ad2335] hover:bg-[#660e14] text-white font-bold px-8 rounded-xl transition-all">Confirmar</Button>
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
    <div className="rounded-[32px] border border-black/5 bg-white/60 hover:bg-white/80 transition-all overflow-hidden group shadow-sm hover:shadow-md">
      <div 
        className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-[#660e14]/5 flex items-center justify-center border border-black/5 shadow-sm transition-transform group-hover:scale-105" onClick={() => setExpanded(!expanded)}>
            <Package className={cn("size-6 text-[#660e14]/40 transition-transform", expanded && "rotate-180")} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-sm text-[#660e14]">{order.userName || "Cliente"}</h4>
              <Badge variant="outline" className={cn(meta.color, "text-[8px] uppercase font-black px-2 py-0 border")}>{meta.label}</Badge>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-tighter text-[#660e14]/20">#{order._id?.slice(-8).toUpperCase()} · {order.createdAt ? format(new Date(order.createdAt), "dd/MM/yyyy HH:mm") : "Sem data"}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 lg:gap-8">
          <div className="text-left md:text-right min-w-[80px]">
            <p className="text-[10px] text-[#660e14]/30 font-black uppercase tracking-[0.2em] mb-1">Total</p>
            <p className="text-base lg:text-lg font-black text-[#660e14] leading-none">{fmt(order.total)}</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/40 border-black/5 hover:bg-[#ad2335]/10 hover:text-[#ad2335] text-[9px] lg:text-[10px] font-black uppercase tracking-widest h-10 px-3 lg:px-4 gap-2 cursor-pointer transition-all flex-1 sm:flex-none rounded-xl"
              onClick={onPrint}
            >
              <Printer className="size-3" />
              <span className="hidden xs:inline">Guia</span>
              <span className="hidden lg:inline">de Envio</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white/40 border-black/5 hover:bg-[#660e14]/5 text-[9px] lg:text-[10px] font-black uppercase tracking-widest h-10 px-3 lg:px-4 flex-1 sm:flex-none rounded-xl text-[#660e14]"
                  onClick={(e) => e.stopPropagation()} // Impede de fechar o card ao mudar status
                >
                  Status <ChevronDown className="ml-1 lg:ml-2 size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border-black/10">
                {ORDER_STATUSES.map(s => (
                  <DropdownMenuItem
                    key={s}
                    className="text-xs text-[#660e14]/60 focus:text-[#ad2335] focus:bg-[#ad2335]/5 cursor-pointer"
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
            className="border-t border-black/5 bg-[#660e14]/5"
          >
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h5 className="text-[10px] font-black uppercase tracking-widest text-[#660e14]/40 mb-4 flex items-center gap-2">
                  <ShoppingBag className="size-3 text-[#ad2335]" /> Itens do Pedido
                </h5>
                <div className="space-y-3">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 bg-white/40 p-2 rounded-xl border border-black/5">
                      <img src={item.image} className="size-10 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-[#660e14] leading-tight">{item.name}</p>
                        <p className="text-[10px] text-[#660e14]/40 font-bold uppercase">Qtd: {item.quantity} · {fmt(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="text-[10px] font-black uppercase tracking-widest text-[#660e14]/40 mb-4 flex items-center gap-2">
                  <MapPin className="size-3 text-[#ad2335]" /> Endereço de Entrega
                </h5>
                <div className="bg-white/40 p-4 rounded-xl space-y-1 border border-black/5">
                  <p className="text-xs font-bold text-[#660e14]">{order.address?.street}</p>
                  <p className="text-[10px] text-[#660e14]/60 font-bold uppercase tracking-tighter">{order.address?.city}, {order.address?.state}</p>
                  <p className="text-[10px] text-[#660e14]/60 font-bold uppercase tracking-tighter">CEP: {order.address?.zip}</p>
                  <p className="text-[10px] text-[#660e14]/40 mt-2 font-bold uppercase">{order.userEmail}</p>
                </div>
              </div>
              <div className="md:col-span-2 pt-6 border-t border-black/5">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-[#ad2335] mb-4 flex items-center gap-2">
                  <TrendingUp className="size-3" /> Gestão de Rastreio
                </h5>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative group">
                    <Input
                      placeholder="CÓDIGO DE RASTREIO (EX: AA123456789BR)"
                      className="bg-white/60 border-black/5 h-12 text-xs font-bold tracking-[0.2em] pl-4 uppercase rounded-2xl focus:border-[#ad2335]/40 transition-all text-[#660e14]"
                      defaultValue={order.trackingCode || ""}
                      id={`tracking-${order._id}`}
                    />
                  </div>
                  <Button
                    className="bg-[#660e14] hover:bg-[#ad2335] text-white font-black px-8 h-12 rounded-2xl transition-all shadow-xl shadow-[#660e14]/10 flex items-center gap-2 uppercase text-[10px] tracking-widest"
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
                  <p className="text-[9px] text-green-600 font-black mt-3 uppercase tracking-widest flex items-center gap-1 opacity-70">
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
    <div className="p-6 rounded-[32px] border border-black/5 bg-white/60 hover:bg-white/80 transition-all flex items-center justify-between gap-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="size-14 rounded-2xl overflow-hidden border border-black/5 shadow-sm">
          <img src={product.images[0]} className="size-full object-cover" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-sm text-[#660e14]">{product.name}</h4>
            <Badge variant="outline" className="text-[8px] uppercase font-black px-2 py-0 border-black/5 text-[#660e14]/40">{product.brand}</Badge>
            {product.inStock ? (
              <Badge className="bg-green-100 text-green-600 text-[8px] font-black uppercase px-2 py-0 border-0">Em Estoque</Badge>
            ) : (
              <Badge className="bg-red-100 text-red-600 text-[8px] font-black uppercase px-2 py-0 border-0">Esgotado</Badge>
            )}
          </div>
          <p className="text-[10px] font-bold text-[#660e14]/30 tracking-widest uppercase">{product.category} · {product.sizes.length} Tamanhos</p>
        </div>
      </div>

      <div className="flex items-center gap-10">
        <div className="text-right hidden sm:block">
          <p className="text-[10px] text-[#660e14]/30 font-black uppercase tracking-widest mb-1">Preço</p>
          <p className="text-lg font-black text-[#660e14] leading-none">{fmt(product.price)}</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-[#660e14]/5 rounded-xl">
              <Settings className="size-4 text-[#660e14]/20" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white border-black/10">
            <DropdownMenuItem className="text-xs text-[#660e14]/60 focus:text-[#ad2335] focus:bg-[#ad2335]/5 cursor-pointer" onClick={onEdit}>
              Editar Produto
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs text-red-500 focus:text-red-600 focus:bg-red-500/5 cursor-pointer" onClick={onDelete}>
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
    <div className="p-6 rounded-[32px] border border-black/5 bg-white/60 hover:bg-white/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="size-12 rounded-2xl bg-purple-100 flex items-center justify-center border border-purple-200">
          <Clock className="size-6 text-purple-600" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-sm text-[#660e14]">{exchange.userName}</h4>
            <Badge variant="outline" className={cn(meta.color, "text-[8px] uppercase font-black px-2 py-0 border")}>{meta.label}</Badge>
          </div>
          <p className="text-[10px] text-[#660e14]/40 font-bold uppercase tracking-widest">Motivo: {exchange.reason}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Select value={exchange.status} onValueChange={onStatusChange}>
          <SelectTrigger className="w-40 bg-white/40 border-black/5 h-10 text-[10px] font-black uppercase tracking-widest text-[#660e14] rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white border-black/10 text-[#660e14]">
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
    <div className="p-6 rounded-[32px] border border-black/5 bg-white/60 hover:bg-white/80 transition-all flex flex-col gap-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-[#660e14]/5 flex items-center justify-center font-black text-xs border border-black/5 text-[#660e14] uppercase italic">
            {(review.userName || "?").charAt(0)}
          </div>
          <div>
            <p className="text-xs font-black text-[#660e14]">{review.userName || "Usuário"}</p>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={cn("size-2", i < review.rating ? "text-amber-500 fill-amber-500" : "text-[#660e14]/10")} />
              ))}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 rounded-xl" onClick={onDelete}>
          <Trash2 className="size-4" />
        </Button>
      </div>
      <p className="text-xs text-[#660e14]/70 leading-relaxed italic">"{review.comment}"</p>
      <p className="text-[9px] text-[#660e14]/30 font-black uppercase tracking-widest">ID Pedido: {review.orderId?.slice(-8).toUpperCase()}</p>
    </div>
  );
}

function CouponRow({ coupon, onToggle, onDelete }: { coupon: any; onToggle: any; onDelete: any }) {
  return (
    <div className="p-6 rounded-[32px] border border-black/5 bg-white/60 hover:bg-white/80 transition-all flex items-center justify-between gap-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={cn(
          "size-12 rounded-2xl flex items-center justify-center border shadow-sm",
          coupon.isActive ? "bg-green-100 border-green-200" : "bg-[#660e14]/5 border-black/5"
        )}>
          <Tag className={cn("size-6", coupon.isActive ? "text-green-600" : "text-[#660e14]/20")} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-black text-sm text-[#660e14] tracking-widest uppercase">{coupon.code}</h4>
            {coupon.isActive ? (
              <Badge className="bg-green-100 text-green-600 text-[8px] font-black uppercase px-2 py-0 border-0">Ativo</Badge>
            ) : (
              <Badge variant="outline" className="text-[#660e14]/20 border-black/5 text-[8px] font-black uppercase px-2 py-0">Inativo</Badge>
            )}
          </div>
          <p className="text-[10px] font-bold text-[#660e14]/30 tracking-widest uppercase">
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
            "text-[9px] font-black uppercase tracking-widest h-9 px-4 rounded-xl",
            coupon.isActive ? "text-red-500 hover:text-red-600 hover:bg-red-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"
          )}
          onClick={() => onToggle(!coupon.isActive)}
        >
          {coupon.isActive ? <XCircle className="size-3 mr-2" /> : <CheckCircle2 className="size-3 mr-2" />}
          {coupon.isActive ? "Desativar" : "Ativar"}
        </Button>

        <Button variant="ghost" size="icon" className="text-[#660e14]/10 hover:text-red-600 hover:bg-red-50 h-9 w-9 rounded-xl" onClick={onDelete}>
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function UserRow({ user, onToggleAdmin, onDelete, onChangePassword }: { user: any; onToggleAdmin: any; onDelete: any; onChangePassword: any }) {
  return (
    <div className="p-6 rounded-[32px] border border-black/5 bg-white transition-all flex items-center justify-between gap-4 shadow-sm hover:shadow-md">
      <div className="flex items-center gap-4">
        <div className="size-12 rounded-full bg-[#660e14]/10 flex items-center justify-center border border-[#660e14]/20 font-black text-[#660e14] italic">
          {(user.name || user.email || "?").charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-black text-sm text-[#660e14]">{user.name || "Sem Nome"}</h4>
            {user.isAdmin && <Badge className="bg-[#ad2335] text-white text-[8px] font-black uppercase px-2 py-0 border-0">Admin</Badge>}
          </div>
          <p className="text-[10px] font-bold text-[#660e14]/60 tracking-widest uppercase">{user.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-10">
        <div className="text-right hidden sm:block">
          <p className="text-[10px] text-[#660e14]/40 font-black uppercase tracking-widest mb-1">Gasto Total</p>
          <p className="text-lg font-black text-[#660e14] leading-none">{fmt(user.totalSpent)}</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-[#660e14]/5 rounded-xl text-[#660e14]">
              <Settings className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white border-black/10">
            <DropdownMenuItem
              className="text-xs text-[#660e14]/60 focus:text-[#ad2335] focus:bg-[#ad2335]/5 cursor-pointer font-bold"
              onClick={() => onToggleAdmin(user._id, user.isAdmin)}
            >
              {user.isAdmin ? "Remover Privilégios Admin" : "Tornar Administrador"}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-xs text-[#660e14]/60 focus:text-[#ad2335] focus:bg-[#ad2335]/5 cursor-pointer font-bold"
              onClick={() => onChangePassword(user._id)}
            >
              Alterar Senha
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-xs text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer font-bold"
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
