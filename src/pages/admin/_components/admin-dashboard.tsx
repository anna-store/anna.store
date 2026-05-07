import { useState } from "react";
import Receipt from "@/components/Receipt.tsx";
import { Printer } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  ShoppingBag, Users, TrendingUp, Clock, ChevronDown, Search,
  LayoutDashboard, Package, UsersRound, Settings, ArrowRight, Activity, Globe, Share2,
  MapPin, Tag, Trash2, CheckCircle2, XCircle, Plus, Edit2, Camera
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { toast } from "sonner";
import { cn } from "@/lib/utils.ts";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/hooks/use-auth.ts";

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = "overview" | "orders" | "users" | "products" | "exchanges" | "reviews" | "coupons";

const STATUS_META: Record<string, { label: string; color: string; dot: string }> = {
  pending:   { label: "Aguardando", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", dot: "bg-yellow-500" },
  confirmed: { label: "Confirmado", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", dot: "bg-blue-500" },
  shipped:   { label: "Enviado",    color: "bg-purple-500/10 text-purple-500 border-purple-500/20", dot: "bg-purple-500" },
  delivered: { label: "Entregue",   color: "bg-green-500/10 text-green-500 border-green-500/20", dot: "bg-green-500" },
  cancelled: { label: "Cancelado",  color: "bg-red-500/10 text-red-500 border-red-500/20", dot: "bg-red-500" },
};

const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
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
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    name: "", brand: "", category: "", price: 0, originalPrice: 0,
    description: "", images: "", sizes: "", colors: "", tags: "",
    inStock: true, isNew: false, isFeatured: false, isBestSeller: false
  });
  const [couponForm, setCouponForm] = useState({
    code: "", discountType: "percentage" as "percentage" | "fixed",
    discountValue: 0, minOrderValue: 0, isActive: true
  });

  // Sessão local do usuário admin
  const { user: localUser } = useAuth();
  const callerId = localUser?._id;

  const stats = useQuery(api.admin.getStats, callerId ? { callerId } : "skip");
  const orders = useQuery(api.admin.getAllOrders, callerId ? { callerId, statusFilter: orderStatusFilter } : "skip");
  const users = useQuery(api.admin.getAllUsers, callerId ? { callerId } : "skip");
  const products = useQuery(api.admin.getAllProducts, callerId ? { callerId } : "skip");
  const exchanges = useQuery(api.admin.getAllExchanges, callerId ? { callerId } : "skip");
  const reviews = useQuery(api.admin.getAllReviews, callerId ? { callerId } : "skip");
  const coupons = useQuery(api.admin.getAllCoupons, callerId ? { callerId } : "skip");

  const updateStatus = useMutation(api.admin.updateOrderStatus);
  const toggleAdmin = useMutation(api.admin.toggleAdmin);
  const createProduct = useMutation(api.admin.createProduct);
  const updateProduct = useMutation(api.admin.updateProduct);
  const deleteProduct = useMutation(api.admin.deleteProduct);
  const updateExchange = useMutation(api.admin.updateExchangeStatus);
  const deleteReview = useMutation(api.admin.deleteReview);
  const createCoupon = useMutation(api.admin.createCoupon);
  const toggleCoupon = useMutation(api.admin.toggleCoupon);
  const deleteCoupon = useMutation(api.admin.deleteCoupon);

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
        isBestSeller: product.isBestSeller || false
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: "", brand: "", category: "", price: 0, originalPrice: 0,
        description: "", images: "", sizes: "34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44", colors: "Preto, Branco", tags: "",
        inStock: true, isNew: true, isFeatured: false, isBestSeller: false
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

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCoupon({ callerId, coupon: couponForm });
      toast.success("Cupom criado!");
      setIsCouponModalOpen(false);
      setCouponForm({ code: "", discountType: "percentage", discountValue: 0, minOrderValue: 0, isActive: true });
    } catch {
      toast.error("Erro ao criar cupom");
    }
  };

  const NAV: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Visão Geral", icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: "orders",   label: "Pedidos",     icon: <Package className="h-4 w-4" /> },
    { id: "products", label: "Produtos",    icon: <ShoppingBag className="h-4 w-4" /> },
    { id: "users",    label: "Usuários",    icon: <UsersRound className="h-4 w-4" /> },
    { id: "coupons",  label: "Cupons",      icon: <TrendingUp className="h-4 w-4" /> },
    { id: "exchanges",label: "Trocas",      icon: <ArrowRight className="h-4 w-4" /> },
    { id: "reviews",  label: "Avaliações",  icon: <Share2 className="h-4 w-4" /> },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  return (
    <>
      {/* Componente de Recibo para Admin (Ordem de Entrega) */}
      <Receipt order={printingOrder} type="admin" />

      <div className="flex min-h-screen bg-[#050505] text-white relative overflow-hidden font-sans print:hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#ea3372]/5 blur-[140px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#38b6ff]/5 blur-[140px] rounded-full pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />

      <aside className="hidden md:flex flex-col w-64 bg-black/40 backdrop-blur-3xl border-r border-white/5 z-20">
        <div className="px-8 py-10">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="size-10 bg-gradient-to-br from-[#ea3372] to-[#38b6ff] rounded-xl flex items-center justify-center shadow-lg shadow-[#ea3372]/20 group-hover:scale-110 transition-transform">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <img 
              src="https://hercules-cdn.com/file_MwBJp0asRxRHTEAr31k3LplG" 
              alt="Anna Store Logo" 
              className="h-20 w-auto brightness-0 invert"
            />
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer group relative overflow-hidden",
                tab === n.id
                  ? "bg-white/5 text-white"
                  : "text-white/30 hover:text-white hover:bg-white/[0.02]"
              )}
            >
              {tab === n.id && (
                <motion.div 
                  layoutId="nav-active"
                  className="absolute left-0 w-1 h-6 bg-[#ea3372] rounded-r-full" 
                />
              )}
              <div className={cn("transition-colors", tab === n.id ? "text-[#ea3372]" : "group-hover:text-white")}>
                {n.icon}
              </div>
              {n.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5">
          <Link to="/" className="flex items-center gap-2 text-[10px] text-white/20 hover:text-white/60 transition-colors uppercase font-black tracking-widest">
            <ArrowRight className="size-3 rotate-180" />
            Sair do Terminal
          </Link>
        </div>
      </aside>

      <div className="flex-1 overflow-auto relative z-10 flex flex-col">
        <header className="sticky top-0 z-30 bg-[#050505]/60 backdrop-blur-xl border-b border-white/5 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-8 w-1 bg-gradient-to-b from-[#ea3372] to-transparent rounded-full" />
            <div>
              <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none">
                {NAV.find((n) => n.id === tab)?.label}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Activity className="size-3 text-green-500" />
                <span className="text-[9px] text-white/40 font-bold uppercase tracking-[0.2em]">Node Status: Online</span>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 flex-1">
          <AnimatePresence mode="wait">
            {tab === "overview" && (
              <motion.div 
                key="overview"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: "Receita Total", value: stats ? fmt(stats.totalRevenue) : null, icon: TrendingUp, color: "#22c55e", bg: "bg-green-500/10" },
                    { label: "Total Pedidos", value: stats?.totalOrders?.toString() ?? null, icon: ShoppingBag, color: "#ea3372", bg: "bg-[#ea3372]/10" },
                    { label: "Usuários Ativos", value: stats?.totalUsers?.toString() ?? null, icon: Users, color: "#38b6ff", bg: "bg-[#38b6ff]/10" },
                    { label: "Pendentes", value: stats?.pendingOrders?.toString() ?? null, icon: Clock, color: "#eab308", bg: "bg-yellow-500/10" },
                  ].map((s) => (
                    <Card key={s.label} className="glass border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] transition-all group border-t-white/10 shadow-2xl">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className={cn("size-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", s.bg)}>
                            <s.icon className="size-5" style={{ color: s.color }} />
                          </div>
                          <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">Real-time</div>
                        </div>
                        {s.value === null ? (
                          <Skeleton className="h-8 w-24 bg-white/5" />
                        ) : (
                          <div className="text-3xl font-black tracking-tighter text-white">{s.value}</div>
                        )}
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">{s.label}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <Card className="lg:col-span-2 glass border-white/[0.05] bg-white/[0.02] border-t-white/10 shadow-2xl">
                    <CardHeader className="flex flex-row items-center justify-between px-8 py-6 border-b border-white/5">
                      <CardTitle className="text-sm font-black uppercase tracking-widest text-white/60">Análise de Receita</CardTitle>
                      <Badge variant="outline" className="bg-[#ea3372]/10 text-[#ea3372] border-[#ea3372]/20 uppercase text-[9px] px-2">7 Dias</Badge>
                    </CardHeader>
                    <CardContent className="p-8">
                      {!stats ? (
                        <Skeleton className="h-64 w-full bg-white/5 rounded-2xl" />
                      ) : (
                        <ResponsiveContainer width="100%" height={260}>
                          <BarChart data={stats.revenueByDay}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis 
                              dataKey="date" 
                              stroke="rgba(255,255,255,0.3)" 
                              fontSize={10} 
                              tickLine={false}
                              axisLine={false}
                              tickFormatter={(d: string) => format(new Date(d + "T12:00:00"), "dd/MM")}
                            />
                            <YAxis 
                              stroke="rgba(255,255,255,0.3)" 
                              fontSize={10} 
                              tickLine={false}
                              axisLine={false}
                              tickFormatter={(v: number) => `R$${v}`}
                            />
                            <Tooltip 
                              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                              contentStyle={{ backgroundColor: '#0b0b0b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px' }}
                              itemStyle={{ color: '#ea3372', fontWeight: 'bold' }}
                            />
                            <Bar dataKey="revenue" fill="url(#colorRev)" radius={[6, 6, 0, 0]} />
                            <defs>
                              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ea3372" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#ea3372" stopOpacity={0.1}/>
                              </linearGradient>
                            </defs>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="glass border-white/[0.05] bg-white/[0.02] border-t-white/10 shadow-2xl">
                    <CardHeader className="px-8 py-6 border-b border-white/5">
                      <CardTitle className="text-sm font-black uppercase tracking-widest text-white/60">Últimos Pedidos</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      {!stats ? (
                        <div className="space-y-4">
                          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-14 w-full bg-white/5" />)}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {stats.recentOrders.map((o) => {
                            const meta = STATUS_META[o.status] || STATUS_META.pending;
                            return (
                              <div key={o._id} className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className="size-8 rounded-full bg-white/5 flex items-center justify-center font-bold text-[10px] border border-white/10">
                                    {o.userName?.charAt(0) ?? "C"}
                                  </div>
                                  <div>
                                    <p className="text-[11px] font-bold text-white leading-none mb-1">{o.userName || "Cliente"}</p>
                                    <p className="text-[9px] text-white/30 uppercase tracking-wider">{format(new Date(o.createdAt), "dd MMM")}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-[11px] font-black text-white">{fmt(o.total)}</p>
                                  <div className="flex items-center justify-end gap-1.5 mt-1">
                                    <div className={cn("size-1 rounded-full", meta.dot)} />
                                    <span className="text-[8px] font-black uppercase tracking-widest text-white/40">{meta.label}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {(tab === "orders" || tab === "users" || tab === "products" || tab === "exchanges" || tab === "reviews" || tab === "coupons") && (
              <motion.div
                key={tab}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                <Card className="glass border-white/[0.05] bg-white/[0.01] shadow-2xl overflow-hidden">
                  <div className="p-8 space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                      <div className="relative flex-1 group w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/20 group-focus-within:text-[#ea3372] transition-colors" />
                        <Input 
                          className="bg-white/[0.03] border-white/10 h-12 pl-12 focus:border-[#ea3372]/40 text-sm" 
                          placeholder={`Buscar em ${NAV.find(n => n.id === tab)?.label}...`}
                          value={tab === "orders" ? orderSearch : userSearch}
                          onChange={(e) => tab === "orders" ? setOrderSearch(e.target.value) : setUserSearch(e.target.value)}
                        />
                      </div>
                      
                      {tab === "orders" && (
                        <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                          <SelectTrigger className="w-full md:w-56 bg-white/[0.03] border-white/10 h-12">
                            <SelectValue placeholder="Filtrar por Status" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0b0b0b] border-white/10 text-white">
                            <SelectItem value="all">Todos os Status</SelectItem>
                            {ORDER_STATUSES.map(s => (
                              <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {tab === "products" && (
                        <Button 
                          onClick={() => openProductModal()}
                          className="bg-[#ea3372] hover:bg-[#c9295f] text-white font-bold h-12 px-8 gap-2 shadow-lg shadow-[#ea3372]/20"
                        >
                          <Plus className="size-4" /> Novo Produto
                        </Button>
                      )}

                      {tab === "coupons" && (
                        <Button 
                          onClick={() => setIsCouponModalOpen(true)}
                          className="bg-[#38b6ff] hover:bg-[#2d93cf] text-white font-bold h-12 px-8 gap-2 shadow-lg shadow-[#38b6ff]/20"
                        >
                          <Plus className="size-4" /> Novo Cupom
                        </Button>
                      )}
                    </div>

                    {/* Data List */}
                    <div className="space-y-4">
                      {tab === "orders" && (
                        !orders ? <SkeletonList /> : orders.map(o => (
                          <OrderRow key={o._id} order={o} onStatusChange={handleStatusChange} onPrint={() => handlePrint(o)} />
                        ))
                      )}
                      {tab === "users" && (
                        !users ? <SkeletonList /> : users.map(u => (
                          <UserRow key={u._id} user={u} onToggleAdmin={handleToggleAdmin} />
                        ))
                      )}
                      {tab === "products" && (
                        !products ? <SkeletonList /> : products.map(p => (
                          <ProductRow 
                            key={p._id} 
                            product={p} 
                            onEdit={() => openProductModal(p)}
                            onDelete={async () => {
                              if (confirm("Excluir produto?")) {
                                await deleteProduct({ callerId, productId: p._id });
                                toast.success("Produto removido");
                              }
                            }} 
                          />
                        ))
                      )}
                      {tab === "coupons" && (
                        !coupons ? <SkeletonList /> : coupons.map(c => (
                          <CouponRow 
                            key={c._id} 
                            coupon={c} 
                            onToggle={async (active) => {
                              await toggleCoupon({ callerId, couponId: c._id, isActive: active });
                              toast.success(active ? "Cupom ativado" : "Cupom desativado");
                            }}
                            onDelete={async () => {
                              if (confirm("Excluir cupom?")) {
                                await deleteCoupon({ callerId, couponId: c._id });
                                toast.success("Cupom removido");
                              }
                            }}
                          />
                        ))
                      )}
                      {tab === "exchanges" && (
                        !exchanges ? <SkeletonList /> : exchanges.map(e => (
                          <ExchangeRow key={e._id} exchange={e} onStatusChange={async (status) => {
                            await updateExchange({ callerId, exchangeId: e._id, status });
                            toast.success("Status de troca atualizado");
                          }} />
                        ))
                      )}
                      {tab === "reviews" && (
                        !reviews ? <SkeletonList /> : reviews.map(r => (
                          <ReviewRow key={r._id} review={r} onDelete={async () => {
                            if (confirm("Remover avaliação?")) {
                              await deleteReview({ callerId, reviewId: r._id });
                              toast.success("Avaliação removida");
                            }
                          }} />
                        ))
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <footer className="p-8 border-t border-white/5 text-[9px] text-white/10 font-black uppercase tracking-[0.4em] text-center">
          AnnaSt Terminal Core System &bull; Version 4.0.0-PRO
        </footer>
      </div>

      {/* Product Modal */}
      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="bg-[#0b0b0b] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-widest italic">
              {editingProduct ? "Editar Produto" : "Novo Produto"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleProductSubmit} className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-black text-white/40">Nome do Produto</Label>
                <Input 
                  required
                  value={productForm.name} 
                  onChange={e => setProductForm({...productForm, name: e.target.value})}
                  className="bg-white/5 border-white/10" 
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-black text-white/40">Marca</Label>
                <Input 
                  required
                  value={productForm.brand} 
                  onChange={e => setProductForm({...productForm, brand: e.target.value})}
                  className="bg-white/5 border-white/10" 
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-black text-white/40">Categoria</Label>
                <Select 
                  value={productForm.category} 
                  onValueChange={v => setProductForm({...productForm, category: v})}
                >
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0b0b0b] border-white/10 text-white">
                    <SelectItem value="Tênis Masculino">Tênis Masculino</SelectItem>
                    <SelectItem value="Tênis Feminino">Tênis Feminino</SelectItem>
                    <SelectItem value="Casual">Casual</SelectItem>
                    <SelectItem value="Esportivo">Esportivo</SelectItem>
                    <SelectItem value="Infantil">Infantil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-black text-white/40">Preço (R$)</Label>
                  <Input 
                    type="number" step="0.01" required
                    value={productForm.price} 
                    onChange={e => setProductForm({...productForm, price: parseFloat(e.target.value)})}
                    className="bg-white/5 border-white/10" 
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-black text-white/40">Preço Orig. (R$)</Label>
                  <Input 
                    type="number" step="0.01"
                    value={productForm.originalPrice} 
                    onChange={e => setProductForm({...productForm, originalPrice: parseFloat(e.target.value)})}
                    className="bg-white/5 border-white/10" 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-black text-white/40">Imagens (URLs separadas por vírgula)</Label>
              <Textarea 
                required
                value={productForm.images} 
                onChange={e => setProductForm({...productForm, images: e.target.value})}
                className="bg-white/5 border-white/10 h-20" 
                placeholder="https://imagem1.jpg, https://imagem2.jpg"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-black text-white/40">Descrição</Label>
              <Textarea 
                required
                value={productForm.description} 
                onChange={e => setProductForm({...productForm, description: e.target.value})}
                className="bg-white/5 border-white/10 h-24" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-black text-white/40">Tamanhos (separados por vírgula)</Label>
                <Input 
                  value={productForm.sizes} 
                  onChange={e => setProductForm({...productForm, sizes: e.target.value})}
                  className="bg-white/5 border-white/10" 
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-black text-white/40">Cores (separadas por vírgula)</Label>
                <Input 
                  value={productForm.colors} 
                  onChange={e => setProductForm({...productForm, colors: e.target.value})}
                  className="bg-white/5 border-white/10" 
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-6 p-4 bg-white/[0.02] rounded-xl border border-white/5">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="inStock" 
                  checked={productForm.inStock} 
                  onCheckedChange={(v: boolean) => setProductForm({...productForm, inStock: v})}
                />
                <Label htmlFor="inStock" className="text-xs">Em Estoque</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isNew" 
                  checked={productForm.isNew} 
                  onCheckedChange={(v: boolean) => setProductForm({...productForm, isNew: v})}
                />
                <Label htmlFor="isNew" className="text-xs">Novo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isFeatured" 
                  checked={productForm.isFeatured} 
                  onCheckedChange={(v: boolean) => setProductForm({...productForm, isFeatured: v})}
                />
                <Label htmlFor="isFeatured" className="text-xs">Destaque</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isBestSeller" 
                  checked={productForm.isBestSeller} 
                  onCheckedChange={(v: boolean) => setProductForm({...productForm, isBestSeller: v})}
                />
                <Label htmlFor="isBestSeller" className="text-xs">Mais Vendido</Label>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-black text-white/40">Tags (separadas por vírgula)</Label>
              <Input 
                value={productForm.tags} 
                onChange={e => setProductForm({...productForm, tags: e.target.value})}
                className="bg-white/5 border-white/10" 
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsProductModalOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-[#ea3372] hover:bg-[#c9295f] text-white font-bold px-8">
                {editingProduct ? "Salvar Alterações" : "Criar Produto"}
              </Button>
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
                onChange={e => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})}
                className="bg-white/5 border-white/10 font-mono tracking-widest" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-black text-white/40">Tipo</Label>
                <Select value={couponForm.discountType} onValueChange={(v: any) => setCouponForm({...couponForm, discountType: v})}>
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
                  onChange={e => setCouponForm({...couponForm, discountValue: parseFloat(e.target.value)})}
                  className="bg-white/5 border-white/10" 
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-black text-white/40">Valor Mínimo do Pedido (R$)</Label>
              <Input 
                type="number" required
                value={couponForm.minOrderValue} 
                onChange={e => setCouponForm({...couponForm, minOrderValue: parseFloat(e.target.value)})}
                className="bg-white/5 border-white/10" 
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsCouponModalOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-[#38b6ff] hover:bg-[#2d93cf] text-white font-bold px-8">Criar Cupom</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
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

function OrderRow({ order, onStatusChange, onPrint }: { order: any; onStatusChange: any; onPrint: any }) {
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
            <p className="text-[10px] font-mono text-white/20">#{order._id.slice(-8).toUpperCase()} · {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-right">
            <p className="text-xs text-white/30 font-bold uppercase tracking-widest mb-1">Total</p>
            <p className="text-lg font-black text-white leading-none">{fmt(order.total)}</p>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white/5 border-white/10 hover:bg-[#ea3372]/10 hover:text-[#ea3372] text-[10px] font-black uppercase tracking-widest h-10 px-4 gap-2 cursor-pointer transition-all"
            onClick={onPrint}
          >
            <Printer className="size-3" />
            Guia de Envio
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest h-10 px-4">
                Mudar Status <ChevronDown className="ml-2 size-3" />
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
            {review.userName.charAt(0)}
          </div>
          <div>
            <p className="text-xs font-bold text-white">{review.userName}</p>
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
      <p className="text-[9px] text-white/20 font-mono uppercase tracking-widest">ID Pedido: {review.orderId.slice(-8).toUpperCase()}</p>
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

function UserRow({ user, onToggleAdmin }: { user: any; onToggleAdmin: any }) {
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
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
