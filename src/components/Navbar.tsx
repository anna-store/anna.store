import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, Search, Menu, X, User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { useCartStore } from "@/hooks/use-cart.ts";
import { useWishlistStore } from "@/hooks/use-wishlist.ts";
import { useAuth } from "@/hooks/use-auth.ts";

const NAV_LINKS = [
  { label: "Início", href: "/" },
  { label: "Catálogo", href: "/catalogo" },
  { label: "Promoções", href: "/catalogo?promo=true" },
  { label: "Novidades", href: "/catalogo?new=true" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { items: cartItems } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { isAuthenticated, user } = useAuth();

  const cartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalogo?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0b0b0b] text-white shadow-lg">
      {/* Announcement bar */}
      <div className="bg-[#ea3372] text-white text-center text-xs py-2 px-4 font-medium tracking-wide">
        ✨ NOVIDADES SEMANAIS • USE O CUPOM: <strong>QUERO10</strong> e ganhe 10% na primeira compra
      </div>

      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img
            src="https://hercules-cdn.com/file_MwBJp0asRxRHTEAr31k3LplG"
            alt="Store Logo"
            className="h-24 w-auto brightness-0 invert"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm font-medium text-white/80 hover:text-[#ea3372] transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <Input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar produtos..."
                className="w-48 h-8 bg-white/10 border-white/20 text-white placeholder:text-white/50 text-sm"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-white/70 hover:text-white h-8 w-8"
                onClick={() => setSearchOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="text-white/70 hover:text-[#38b6ff] cursor-pointer"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
          )}

          {/* Wishlist */}
          <Link to="/favoritos">
            <Button variant="ghost" size="icon" className="text-white/70 hover:text-[#ea3372] relative cursor-pointer">
              <Heart className="h-5 w-5" />
              {wishlistItems.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-[#ea3372] border-0">
                  {wishlistItems.length}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Cart */}
          <Link to="/carrinho">
            <Button variant="ghost" size="icon" className="text-white/70 hover:text-[#38b6ff] relative cursor-pointer">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-[#38b6ff] border-0">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Account — Login ou Avatar */}
          {isAuthenticated ? (
            <Link to="/painel">
              <Button
                variant="ghost"
                size="icon"
                className="text-white/70 hover:text-white cursor-pointer relative"
                title="Minha conta"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name ?? "Perfil"}
                    className="h-7 w-7 rounded-full object-cover ring-2 ring-[#ea3372]"
                  />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-[#ea3372] flex items-center justify-center text-white text-xs font-black">
                    {(user?.name ?? user?.email ?? "A").charAt(0).toUpperCase()}
                  </div>
                )}
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              {/* Desktop: botão com texto */}
              <Button
                size="sm"
                className="hidden md:flex bg-[#ea3372] hover:bg-[#c9295f] text-white font-bold px-4 gap-2 cursor-pointer"
              >
                <LogIn className="h-4 w-4" />
                Entrar
              </Button>
              {/* Mobile: apenas ícone */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white/70 hover:text-[#ea3372] cursor-pointer"
              >
                <User className="h-5 w-5" />
              </Button>
            </Link>
          )}

          {/* Mobile menu */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white/70 hover:text-white cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden bg-[#111] border-t border-white/10 px-4 py-4 space-y-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="block text-sm font-medium text-white/80 hover:text-[#ea3372] py-1"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <Link to="/painel" className="block text-sm font-medium text-white/80 hover:text-[#ea3372] py-1" onClick={() => setMobileOpen(false)}>
              Minha Conta
            </Link>
          ) : (
            <Link to="/auth" className="block" onClick={() => setMobileOpen(false)}>
              <Button className="w-full bg-[#ea3372] hover:bg-[#c9295f] text-white font-bold gap-2">
                <LogIn className="h-4 w-4" />
                Fazer Login
              </Button>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
