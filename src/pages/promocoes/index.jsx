import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "motion/react";
import ProductCard from "@/components/ProductCard";
import { Badge } from "@/components/ui/badge";
import { Percent, ShoppingBag, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export default function PromocoesPage() {
  const products = useQuery(api.products.getOnSale);

  return (
    <div className="min-h-screen bg-[#fdf0e3] pt-24 pb-20 overflow-hidden relative">
      {/* BACKGROUND ATMOSPHERE */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#ad2335]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#660e14]/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        {/* HERO SECTION */}
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ad2335]/10 border border-[#ad2335]/20 mb-6"
          >
            <Percent className="size-4 text-[#ad2335]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ad2335]">Ofertas Imperdíveis</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-[#660e14] italic uppercase tracking-tighter mb-6"
          >
            Sinal de <span className="text-[#ad2335]">Vantagem</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-[#660e14]/60 text-sm md:text-base font-medium leading-relaxed"
          >
            Curadoria exclusiva de peças selecionadas com descontos especiais. 
            Estilo premium, preços extraordinários. Aproveite enquanto durar o estoque.
          </motion.p>
        </div>

        {/* PRODUCTS GRID */}
        {!products ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[4/5] w-full rounded-[32px] bg-white/50" />
                <Skeleton className="h-4 w-2/3 bg-white/50" />
                <Skeleton className="h-4 w-1/3 bg-white/50" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center bg-white/40 border border-black/5 rounded-[48px] backdrop-blur-xl"
          >
            <div className="size-20 bg-[#660e14]/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="size-8 text-[#660e14]/20" />
            </div>
            <h2 className="text-xl font-black text-[#660e14] uppercase tracking-widest mb-2">Sem ofertas no momento</h2>
            <p className="text-sm text-[#660e14]/40 font-bold mb-8 uppercase tracking-widest">Fique de olho! Novas promoções surgem a qualquer momento.</p>
            <Link to="/catalogo">
              <button className="px-8 h-14 bg-[#660e14] text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-[#ad2335] transition-all flex items-center gap-3 mx-auto">
                Ver Todo Catálogo <ArrowRight className="size-4" />
              </button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {products.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* FLOATING DECORATIONS */}
      <div className="absolute top-1/4 -left-20 w-40 h-40 border-[40px] border-[#ad2335]/5 rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-60 h-60 border-[60px] border-[#660e14]/5 rounded-full pointer-events-none" />
    </div>
  );
}
