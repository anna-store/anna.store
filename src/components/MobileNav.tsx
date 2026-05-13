import { Link, useLocation } from "react-router-dom";
import { Home, Search, ShoppingBag, User, LayoutDashboard, Package, LogOut, ShoppingCart } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils.ts";
import { useCartStore } from "@/hooks/use-cart.ts";
import { Badge } from "@/components/ui/badge.tsx";

export default function MobileNav() {
  const location = useLocation();
  const { items: cartItems } = useCartStore();
  const cartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  const isAdmin = location.pathname.startsWith("/admin");

  const shopItems = [
    { label: "Início", icon: Home, href: "/" },
    { label: "Catálogo", icon: Search, href: "/catalogo" },
    { label: "Carrinho", icon: ShoppingBag, href: "/carrinho", badge: cartCount },
    { label: "Perfil", icon: User, href: "/painel" },
  ];

  const adminItems = [
    { label: "Geral", icon: LayoutDashboard, href: "/admin" },
    { label: "Pedidos", icon: Package, href: "/admin?tab=orders" },
    { label: "Produtos", icon: ShoppingCart, href: "/admin?tab=products" },
    { label: "Loja", icon: LogOut, href: "/" },
  ];

  const navItems = isAdmin ? adminItems : shopItems;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#fdf0e3]/90 backdrop-blur-xl border-t border-[#660e14]/5 pb-safe-area">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all duration-500",
                isActive ? "text-[#ad2335]" : "text-[#660e14]/40"
              )}
            >
              <div className="relative">
                <Icon className={cn("size-5 transition-transform duration-500", isActive && "scale-110")} />
                {item.badge ? (
                  <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-[#ad2335] text-white border-0 animate-in zoom-in font-black">
                    {item.badge}
                  </Badge>
                ) : null}
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.15em] leading-none">
                {item.label}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute -bottom-1 size-1 rounded-full bg-[#ad2335]" 
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
