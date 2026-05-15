import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Heart, ShoppingCart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { toast } from "sonner";
import ProductCard from "@/components/ProductCard.tsx";
import { useWishlistStore } from "@/hooks/use-wishlist.ts";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";

export default function FavoritosPage() {
  const { items, toggle } = useWishlistStore();
  const navigate = useNavigate();

  const allProducts = useQuery(api.products.getAll) || [];

  const products = items
    .map((id) => allProducts.find(p => p._id === id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined)
    .map(p => ({ ...p, id: p._id }));

  return (
    <div className="bg-[#fdf0e3] min-h-screen selection:bg-[#ad2335]/30 overflow-x-hidden pt-28 pb-20">
      {/* Atmosphere Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-[#ff97ad]/10 to-transparent" />
        <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-multiply" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Link to="/catalogo">
                <Button variant="ghost" size="icon" className="size-10 rounded-full bg-white/50 border border-[#660e14]/10 hover:bg-white cursor-pointer">
                  <ArrowLeft className="h-5 w-5 text-[#660e14]" />
                </Button>
              </Link>
              <div className="h-[1px] w-12 bg-[#ad2335]" />
              <span className="text-[10px] text-[#ad2335] font-black uppercase tracking-[0.5em]">Curadoria Pessoal</span>
            </div>
            <h1 
              className="text-5xl md:text-7xl font-normal text-[#660e14] tracking-normal" 
              style={{ fontFamily: "'Glamour Absolute', cursive" }}
            >
              Meus Favoritos<span className="text-[#ad2335]">.</span>
            </h1>
            <p className="text-sm text-[#660e14]/50 font-bold uppercase tracking-wider">
              {products.length} {products.length === 1 ? "item selecionado" : "itens selecionados"} para seu estilo.
            </p>
          </div>

          {products.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-[#660e14]/40 hover:text-[#ad2335] text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer"
              onClick={() => {
                items.forEach((id) => toggle(id));
                toast.success("Lista de desejos limpa");
              }}
            >
              Limpar toda a lista
            </Button>
          )}
        </div>

        {products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="relative mb-10">
                <div className="absolute inset-0 bg-[#ad2335]/10 blur-3xl rounded-full" />
                <div className="relative size-32 rounded-full border-2 border-[#660e14]/5 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                    <Heart className="size-12 text-[#ad2335]" />
                </div>
            </div>
            
            <h2 
              className="text-4xl md:text-5xl font-normal text-[#660e14] mb-4"
              style={{ fontFamily: "'Glamour Absolute', cursive" }}
            >
              Sua lista está vazia
            </h2>
            <p className="text-[#660e14]/50 font-bold uppercase tracking-widest text-[11px] mb-12 max-w-sm leading-relaxed">
              Salve as peças que você mais amou para encontrá-las facilmente depois.
            </p>
            
            <Button
              className="bg-[#660e14] hover:bg-[#ad2335] text-[#fdf0e3] font-black uppercase tracking-[0.3em] text-[11px] px-12 h-16 rounded-2xl transition-all duration-500 shadow-xl cursor-pointer"
              onClick={() => navigate("/catalogo")}
            >
              Explorar Catálogo
            </Button>
          </motion.div>
        ) : (
          <>
            <motion.div
              layout
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
            >
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>

            {/* Bottom CTA */}
            <div className="mt-24 pt-16 border-t border-[#660e14]/5 text-center">
              <p className="text-[#660e14]/50 text-[10px] font-black uppercase tracking-[0.4em] mb-10">
                Pronta para dar o próximo passo?
              </p>
              <Button
                className="bg-[#ad2335] hover:bg-[#660e14] text-[#fdf0e3] font-black uppercase tracking-[0.2em] text-[11px] px-12 h-16 rounded-2xl shadow-2xl transition-all duration-500 cursor-pointer"
                onClick={() => navigate("/catalogo")}
              >
                <ShoppingCart className="h-4 w-4 mr-3" />
                Continuar Comprando
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
