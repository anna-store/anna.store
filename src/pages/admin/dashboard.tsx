import { useState } from "react";
import { useQuery, useMutation, useAction, useConvex } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  ShoppingBag, Users, TrendingUp, Clock, ChevronDown, Search,
  LayoutDashboard, Package, UsersRound, Settings,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { toast } from "sonner";
import { cn } from "@/lib/utils.ts";
import type { Id } from "@/convex/_generated/dataModel.d.ts";

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = "overview" | "orders" | "users";

const STATUS_META: Record<string, { label: string; color: string }> = {
  pending:   { label: "Aguardando", color: "bg-yellow-500/10 text-yellow-700 border-yellow-200" },
  confirmed: { label: "Confirmado", color: "bg-blue-500/10 text-blue-700 border-blue-200" },
  shipped:   { label: "Enviado",    color: "bg-purple-500/10 text-purple-700 border-purple-200" },
  delivered: { label: "Entregue",   color: "bg-green-500/10 text-green-700 border-green-200" },
  cancelled: { label: "Cancelado",  color: "bg-red-500/10 text-red-700 border-red-200" },
};

const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");

  const stats = useQuery(api.admin.getStats);
  const orders = useQuery(api.admin.getAllOrders, { statusFilter: orderStatusFilter });
  const users = useQuery(api.admin.getAllUsers);
  const updateStatus = useAction(api.admin.updateOrderStatus);
  const toggleAdmin = useMutation(api.admin.toggleAdmin);

  const handleStatusChange = async (orderId: Id<"orders">, status: typeof ORDER_STATUSES[number]) => {
    try {
      await updateStatus({ orderId, status });
      toast.success("Status atualizado!");
    } catch {
      toast.error("Erro ao atualizar status");
    }
  };

  const handleToggleAdmin = async (userId: Id<"users">, current: boolean) => {
    try {
      await toggleAdmin({ userId, isAdmin: !current });
      toast.success(!current ? "Usuário promovido a admin" : "Admin removido");
    } catch {
      toast.error("Erro ao alterar permissão");
    }
  };

  const NAV: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Visão Geral", icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: "orders",   label: "Pedidos",     icon: <Package className="h-4 w-4" /> },
    { id: "users",    label: "Usuários",    icon: <UsersRound className="h-4 w-4" /> },
  ];

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-[#0b0b0b] text-white shrink-0">
        <div className="px-5 py-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-[#ad2335]" />
            <span className="font-bold text-sm tracking-wide">Admin Panel</span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                tab === n.id
                  ? "bg-[#ad2335] text-white"
                  : "text-white/60 hover:text-white hover:bg-white/10",
              )}
            >
              {n.icon}
              {n.label}
            </button>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-white/10">
          <a href="/" className="text-xs text-white/40 hover:text-white/70 transition-colors">
            ← Voltar à loja
          </a>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-background border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black">
              {NAV.find((n) => n.id === tab)?.label ?? "Admin"}
            </h1>
            <p className="text-xs text-muted-foreground">Dashboard administrativo</p>
          </div>
          {/* Mobile tab switcher */}
          <div className="flex md:hidden gap-1">
            {NAV.map((n) => (
              <Button
                key={n.id}
                size="icon"
                variant={tab === n.id ? "default" : "ghost"}
                className={cn("h-8 w-8 cursor-pointer", tab === n.id && "bg-[#ad2335] hover:bg-[#660e14]")}
                onClick={() => setTab(n.id)}
              >
                {n.icon}
              </Button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-6">

          {/* ── OVERVIEW ── */}
          {tab === "overview" && (
            <>
              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: "Receita Total",
                    value: stats ? fmt(stats.totalRevenue) : null,
                    icon: <TrendingUp className="h-5 w-5 text-green-500" />,
                    bg: "bg-green-500/10",
                  },
                  {
                    label: "Pedidos",
                    value: stats?.totalOrders?.toString() ?? null,
                    icon: <ShoppingBag className="h-5 w-5 text-[#ad2335]" />,
                    bg: "bg-[#ad2335]/10",
                  },
                  {
                    label: "Clientes",
                    value: stats?.totalUsers?.toString() ?? null,
                    icon: <Users className="h-5 w-5 text-[#660e14]" />,
                    bg: "bg-[#660e14]/10",
                  },
                  {
                    label: "Aguardando",
                    value: stats?.pendingOrders?.toString() ?? null,
                    icon: <Clock className="h-5 w-5 text-yellow-500" />,
                    bg: "bg-yellow-500/10",
                  },
                ].map((s) => (
                  <Card key={s.label}>
                    <CardContent className="flex items-center gap-4 py-5">
                      <div className={cn("h-10 w-10 rounded-full flex items-center justify-center shrink-0", s.bg)}>
                        {s.icon}
                      </div>
                      <div>
                        {s.value === null ? (
                          <Skeleton className="h-6 w-20 mb-1" />
                        ) : (
                          <p className="text-xl font-black">{s.value}</p>
                        )}
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Revenue chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Receita — últimos 7 dias</CardTitle>
                </CardHeader>
                <CardContent>
                  {!stats ? (
                    <Skeleton className="h-48 w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={stats.revenueByDay} barSize={28}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(d: string) =>
                            format(new Date(d + "T12:00:00"), "dd/MM", { locale: ptBR })
                          }
                          tick={{ fontSize: 11 }}
                        />
                        <YAxis
                          tickFormatter={(v: number) => `R$${v}`}
                          tick={{ fontSize: 11 }}
                          width={60}
                        />
                        <Tooltip
                          formatter={(v: number) => [fmt(v), "Receita"]}
                          labelFormatter={(d: string) =>
                            format(new Date(d + "T12:00:00"), "dd 'de' MMM", { locale: ptBR })
                          }
                        />
                        <Bar dataKey="revenue" fill="#ad2335" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Recent orders */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base">Pedidos Recentes</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setTab("orders")}>
                    Ver todos <ChevronDown className="ml-1 h-3 w-3 rotate-[-90deg]" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {!stats ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                  ) : stats.recentOrders.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">Nenhum pedido ainda</p>
                  ) : (
                    <div className="space-y-3">
                      {stats.recentOrders.map((o, i) => {
                        const s = STATUS_META[o.status] ?? STATUS_META.pending;
                        return (
                          <div key={o._id}>
                            {i > 0 && <Separator className="mb-3" />}
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{o.userName ?? "Cliente"}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(o.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                </p>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <span className="text-sm font-semibold">{fmt(o.total)}</span>
                                <Badge variant="outline" className={s.color}>{s.label}</Badge>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* ── ORDERS ── */}
          {tab === "orders" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Buscar por cliente ou ID..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                  />
                </div>
                <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                  <SelectTrigger className="w-full sm:w-44">
                    <SelectValue placeholder="Filtrar status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    {ORDER_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {!orders ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
                </div>
              ) : (
                <div className="space-y-3">
                  {orders
                    .filter((o) => {
                      if (!orderSearch.trim()) return true;
                      const q = orderSearch.toLowerCase();
                      return (
                        o.userName?.toLowerCase().includes(q) ||
                        o.userEmail?.toLowerCase().includes(q) ||
                        o._id.toLowerCase().includes(q)
                      );
                    })
                    .map((o) => {
                      const s = STATUS_META[o.status] ?? STATUS_META.pending;
                      return (
                        <Card key={o._id} className="overflow-hidden">
                          <CardContent className="p-0">
                            <div className="flex flex-wrap items-center gap-3 px-5 py-3 bg-muted/30 border-b">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate">
                                  {o.userName ?? o.userEmail ?? "Cliente"}
                                </p>
                                <p className="text-xs text-muted-foreground font-mono">
                                  #{o._id.slice(-8).toUpperCase()} ·{" "}
                                  {format(new Date(o.createdAt), "dd/MM/yy HH:mm")}
                                </p>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <span className="font-bold text-sm">{fmt(o.total)}</span>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Badge
                                      variant="outline"
                                      className={cn(s.color, "cursor-pointer gap-1")}
                                    >
                                      {s.label}
                                      <ChevronDown className="h-3 w-3" />
                                    </Badge>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {ORDER_STATUSES.map((st) => (
                                      <DropdownMenuItem
                                        key={st}
                                        className="cursor-pointer"
                                        onClick={() => handleStatusChange(o._id, st)}
                                      >
                                        <Badge variant="outline" className={cn(STATUS_META[st].color, "text-xs")}>
                                          {STATUS_META[st].label}
                                        </Badge>
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                            <div className="px-5 py-3 flex flex-wrap gap-3">
                              {o.items.map((item) => (
                                <div key={item.productId} className="flex items-center gap-2">
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="h-9 w-9 rounded object-cover bg-muted"
                                  />
                                  <div className="text-xs">
                                    <p className="font-medium line-clamp-1 max-w-[140px]">{item.name}</p>
                                    <p className="text-muted-foreground">×{item.quantity}</p>
                                  </div>
                                </div>
                              ))}
                              <div className="ml-auto text-xs text-muted-foreground self-center">
                                {o.address.city}, {o.address.state}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  {orders.length === 0 && (
                    <div className="text-center py-16 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>Nenhum pedido encontrado</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── USERS ── */}
          {tab === "users" && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Buscar usuário..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>

              {!users ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : (
                <div className="space-y-3">
                  {users
                    .filter((u) => {
                      if (!userSearch.trim()) return true;
                      const q = userSearch.toLowerCase();
                      return (
                        u.name?.toLowerCase().includes(q) ||
                        u.email?.toLowerCase().includes(q)
                      );
                    })
                    .map((u) => (
                      <Card key={u._id}>
                        <CardContent className="flex items-center gap-4 py-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-bold text-primary">
                            {(u.name ?? u.email ?? "?").charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold truncate">{u.name ?? "—"}</p>
                              {u.isAdmin && (
                                <Badge className="bg-[#ad2335] text-white text-[10px] border-0 px-1.5 py-0">
                                  Admin
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{u.email ?? "—"}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-semibold">{fmt(u.totalSpent)}</p>
                            <p className="text-xs text-muted-foreground">{u.orderCount} pedidos</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer shrink-0">
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => handleToggleAdmin(u._id, u.isAdmin ?? false)}
                              >
                                {u.isAdmin ? "Remover Admin" : "Tornar Admin"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </CardContent>
                      </Card>
                    ))}
                  {users.length === 0 && (
                    <div className="text-center py-16 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>Nenhum usuário ainda</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
