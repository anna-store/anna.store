import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, Search, Menu, X, User, LogIn, Package, LogOut, Accessibility } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { useCartStore } from "@/hooks/use-cart.ts";
import { useWishlistStore } from "@/hooks/use-wishlist.ts";
import { useAuth } from "@/hooks/use-auth.ts";
import { cn } from "@/lib/utils.ts";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";

const NAV_LINKS = [
  { label: "Início", href: "/" },
  { label: "Catálogo", href: "/catalogo" },
  { label: "Promoções", href: "/promocoes" },
  { label: "Novidades", href: "/catalogo?new=true" },
];

export default function Navbar({ onAccessClick }: { onAccessClick?: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { items: cartItems } = useCartStore();
  const { isAuthenticated, user, signout } = useAuth();

  const cartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalogo?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMobileOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#fdf0e3] text-[#660e14] shadow-lg">
      {/* Announcement bar */}
      <div className="bg-[#ad2335] text-white text-center text-xs py-2 px-4 font-medium tracking-wide">
        PARA COMPRAS ACIMA DE R$250,00 FRETE GRÁTIS PARA TODO O BRASIL
      </div>

      <div className="max-w-7xl mx-auto px-4 h-32 md:h-40 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img
            src="/ientidade_visual/logo-principal(2).png"
            alt="Anna Shoes Logo"
            className="h-28 md:h-36 w-auto transition-all"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm font-bold text-[#660e14] hover:text-[#ad2335] transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          {/* Accessibility */}
          <Button
            variant="ghost"
            size="icon"
            className="text-[#660e14] hover:text-[#ad2335] cursor-pointer"
            onClick={onAccessClick}
            aria-label="Acessibilidade"
          >
            <Accessibility className="h-5 w-5" />
          </Button>

          {/* Search — Desktop */}
          <div className="hidden md:flex items-center relative">
            <AnimatePresence>
              {searchOpen && (
                <motion.form
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 240, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  onSubmit={handleSearch}
                  className="absolute right-full mr-2"
                >
                  <Input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="O que você procura?"
                    className="h-10 rounded-full bg-white/50 border-[#660e14]/10 focus:border-[#ad2335]/40 text-xs font-bold uppercase tracking-widest px-4"
                  />
                </motion.form>
              )}
            </AnimatePresence>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "text-[#660e14] hover:text-[#ad2335] cursor-pointer transition-all",
                searchOpen ? "bg-[#660e14]/5" : ""
              )}
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Buscar"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>

          {/* Search — Mobile Icon */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-[#660e14] hover:text-[#ad2335] cursor-pointer"
              onClick={() => setMobileOpen(true)}
              aria-label="Buscar"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>

          {/* Desktop Actions (Cart, Account) */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/carrinho" aria-label="Ver carrinho">
              <Button variant="ghost" size="icon" className="text-[#660e14] hover:text-[#ad2335] relative cursor-pointer">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-[#ad2335] border-0">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-[#660e14] hover:text-[#ad2335] cursor-pointer relative outline-none">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Perfil" className="h-7 w-7 rounded-full object-cover ring-2 ring-[#ad2335]" />
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-[#ad2335] flex items-center justify-center text-white text-xs font-black">
                        {(user?.name ?? user?.email ?? "A").charAt(0).toUpperCase()}
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-white/90 backdrop-blur-lg border-black/5 text-[#660e14] rounded-[24px] shadow-2xl p-2">
                  <DropdownMenuLabel className="px-4 py-3">
                    <p className="font-black text-xs uppercase tracking-widest">{user?.name ?? "Membro AnnaSt"}</p>
                    <p className="text-[10px] text-[#660e14]/70 font-bold truncate uppercase tracking-tighter mt-0.5">{user?.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#660e14]/5 mx-2" />
                  <DropdownMenuItem className="cursor-pointer hover:bg-[#660e14]/5 rounded-xl px-4 py-2.5 transition-colors" asChild>
                    <Link to="/painel" className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest">
                      <User className="h-4 w-4 text-[#ad2335]" /> Meu Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer hover:bg-[#660e14]/5 rounded-xl px-4 py-2.5 transition-colors" asChild>
                    <Link to="/painel/pedidos" className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest">
                      <Package className="h-4 w-4 text-[#ad2335]" /> Meus Pedidos
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer hover:bg-[#660e14]/5 rounded-xl px-4 py-2.5 transition-colors" asChild>
                    <Link to="/favoritos" className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest">
                      <Heart className="h-4 w-4 text-[#ad2335]" /> Favoritos
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === "admin" && (
                    <>
                      <DropdownMenuSeparator className="bg-[#660e14]/5 mx-2" />
                      <DropdownMenuItem className="cursor-pointer hover:bg-[#ad2335]/5 rounded-xl px-4 py-2.5 transition-colors" asChild>
                        <Link to="/admin" className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-[#ad2335]">
                          <ShoppingCart className="h-4 w-4" /> Painel Admin
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-[#660e14]/5 mx-2" />
                  <DropdownMenuItem className="cursor-pointer text-[#ad2335] hover:bg-[#ad2335]/5 flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest" onClick={() => signout()}>
                    <LogOut className="h-4 w-4" /> Sair da Conta
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="bg-[#ad2335] hover:bg-[#660e14] text-white font-bold px-4 gap-2 cursor-pointer">
                  <LogIn className="h-4 w-4" /> Entrar
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-[#660e14]/70 hover:text-[#660e14] cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Abrir menu"
          >
            {mobileOpen ? <X className="h-6 w-6 text-[#ad2335]" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-[#fdf0e3] border-t border-[#660e14]/5 overflow-hidden"
          >
            <div className="px-6 py-8 space-y-8">
              {/* Barra de Busca Mobile */}
              <form onSubmit={handleSearch} className="relative group">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar na AnnaSt..."
                  className="h-14 rounded-2xl bg-white/50 border-[#660e14]/5 focus:border-[#ad2335]/20 text-xs font-black uppercase tracking-widest pl-12 pr-4 transition-all"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#660e14]/30 group-focus-within:text-[#ad2335] transition-colors" />
              </form>

              {/* Links de Navegação */}
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#660e14]/20 mb-4">Explorar Loja</p>
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="flex items-center justify-between text-lg font-bold text-[#660e14] hover:text-[#ad2335] transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                    <div className="size-1.5 rounded-full bg-[#660e14]/10" />
                  </Link>
                ))}
              </div>

              {/* Seção Usuário */}
              <div className="space-y-4 pt-6 border-t border-[#660e14]/5">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ad2335] mb-4">Minha Área</p>
                <Link to="/favoritos" className="flex items-center gap-3 text-lg font-bold text-[#660e14]/80" onClick={() => setMobileOpen(false)}>
                  <Heart className="h-5 w-5 text-[#660e14]" /> Favoritos
                </Link>
                <Link to="/painel/pedidos" className="flex items-center gap-3 text-lg font-bold text-[#660e14]/80" onClick={() => setMobileOpen(false)}>
                  <Package className="h-5 w-5 text-[#660e14]" /> Meus Pedidos
                </Link>
                <a href="https://wa.me/5531999999999" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-lg font-bold text-[#660e14]/80" onClick={() => setMobileOpen(false)}>
                  <div className="size-5 rounded-full bg-green-500 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="size-3 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.63 1.438h.004c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  </div>
                  Suporte WhatsApp
                </a>
              </div>

              {!isAuthenticated && (
                <div className="pt-6">
                  <Link to="/auth" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-[#660e14] to-[#ad2335] text-white font-black py-6 rounded-2xl shadow-xl shadow-[#660e14]/20">
                      FAZER LOGIN / CRIAR CONTA
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
