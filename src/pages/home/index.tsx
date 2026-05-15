import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, Truck, Shield, RotateCcw, Star, ChevronRight, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import ProductCard from "@/components/ProductCard.tsx";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { useCartStore } from "@/hooks/use-cart.ts";

const BENEFITS = [
  { icon: Truck, title: "Envio Rápido", description: "Entrega em todo o Brasil", color: "#38b6ff" },
  { icon: Shield, title: "Compra Segura", description: "Pagamento 100% protegido", color: "#ea3372" },
  { icon: RotateCcw, title: "Troca Fácil", description: "Até 7 dias para troca", color: "#38b6ff" },
  { icon: Star, title: "Qualidade Garantida", description: "Produtos selecionados e verificados", color: "#ea3372" }
];

const TESTIMONIALS = [
  { name: "Ana Souza", rating: 5, comment: "Recebi em 2 dias! Produto exatamente como na foto. Super recomendo!", city: "São Paulo, SP" },
  { name: "Carlos Lima", rating: 5, comment: "Atendimento incrível e o tênis é simplesmente perfeito. Já fiz 3 compras.", city: "Rio de Janeiro, RJ" },
  { name: "Juliana Matos", rating: 5, comment: "Melhor loja de calçados online! Preço justo e entrega rápida.", city: "Belo Horizonte, MG" }
];



const stagger = {
  container: { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } },
  item: { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } } }
};

import { useEffect } from "react";
import { toast } from "sonner";

export default function Index() {
  const { items } = useCartStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      toast.success("Bem-vinda à Anna Shoes", {
        description: "Sua curadoria de luxo está pronta para ser explorada.",
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Queries por faixa de preço contíguas para cobrir todo o catálogo
  const lineEntry = useQuery(api.products.getByPriceRange, { minPrice: 0, maxPrice: 219 }) || [];
  const linePremium = useQuery(api.products.getByPriceRange, { minPrice: 220, maxPrice: 348 }) || [];
  const lineHype = useQuery(api.products.getByPriceRange, { minPrice: 349 }) || [];
  const newArrivals = useQuery(api.products.getNewArrivals) || [];

  const normalize = (p: any) => ({ ...p, id: p._id || p.id });

  // Lógica para evitar repetição de produtos entre as seções
  const newsProducts = newArrivals.map(normalize).slice(0, 4);
  const usedIds = new Set(newsProducts.map(p => p.id));

  const entryProducts = lineEntry
    .map(normalize)
    .filter(p => !usedIds.has(p.id))
    .slice(0, 4);
  entryProducts.forEach(p => usedIds.add(p.id));

  const premiumProducts = linePremium
    .map(normalize)
    .filter(p => !usedIds.has(p.id))
    .slice(0, 4);
  premiumProducts.forEach(p => usedIds.add(p.id));

  const hypeProducts = lineHype
    .map(normalize)
    .filter(p => !usedIds.has(p.id))
    .slice(0, 4);

  return (
    <div className="bg-[#fdf0e3] min-h-screen selection:bg-[#ad2335]/30 overflow-x-hidden">
      {/* Global Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-[#ff97ad]/10 to-transparent" />
        <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-multiply" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[100vh] flex items-center overflow-hidden bg-[#660e14] z-10 pt-20">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.08] mix-blend-overlay z-10 pointer-events-none" />
          <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-[#ad2335]/10 blur-[180px] rounded-full animate-pulse pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#ff97ad]/5 blur-[150px] rounded-full animate-pulse pointer-events-none" style={{ animationDelay: "3s" }} />
        </div>

        {/* Side Branding - Nova Coleção */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="absolute left-10 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-10 z-20"
        >
          <div className="w-[1px] h-32 bg-gradient-to-t from-[#fdf0e3]/20 to-transparent" />
          <span className="text-[10px] text-[#ff97ad] font-black uppercase tracking-[1em] [writing-mode:vertical-lr] rotate-180">
            Nova Coleção
          </span>
          <div className="w-[1px] h-32 bg-gradient-to-b from-[#fdf0e3]/20 to-transparent" />
        </motion.div>

        <div className="relative z-20 max-w-7xl mx-auto px-6 w-full flex flex-col lg:flex-row items-center gap-16">
          {/* Left: Content */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-[#fdf0e3]/10 bg-white/5 backdrop-blur-md mb-10"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="size-6 rounded-full border-2 border-[#660e14] bg-muted overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <span className="text-[9px] text-[#ffe5f0] font-black uppercase tracking-[0.2em]">
                +2.5k clientes satisfeitos este mês
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-4 mb-6 justify-center lg:justify-start"
            >
              <div className="h-[1px] w-12 bg-[#fdf0e3]" />
              <span className="text-[11px] text-[#fdf0e3] font-black uppercase tracking-[0.6em] whitespace-nowrap">
                Premium Footwear Concept
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl md:text-7xl lg:text-[100px] font-normal leading-[0.9] tracking-tight mb-10"
              style={{
                fontFamily: "'Glamour Absolute', cursive",
                color: "#fdf0e3",
              }}
            >
              Exclusividade<br />em cada passo
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-[#ffe5f0] text-sm md:text-base font-medium tracking-wide mb-12 max-w-xl leading-relaxed uppercase mx-auto lg:mx-0"
            >
              A curadoria exclusiva de sneakers e calçados premium que une conforto absoluto e o design das ruas.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap gap-5 items-center justify-center lg:justify-start"
            >
              <Link to="/catalogo">
                <Button size="lg" className="bg-[#fdf0e3] text-[#660e14] hover:bg-white font-black uppercase tracking-[0.2em] text-[12px] px-12 h-16 rounded-2xl transition-all duration-500 shadow-[0_20px_50px_rgba(253,240,227,0.3)] group cursor-pointer" aria-label="Ver catálogo completo de produtos">
                  Explorar Catálogo
                  <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>

            {/* Enhanced Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-3 gap-8 md:gap-16 mt-24 pt-12 border-t border-[#fdf0e3]/10 max-w-2xl mx-auto lg:mx-0"
            >
              {[
                { value: "15k+", label: "Elite Members", color: "#ad2335" },
                { value: "120+", label: "Global Brands", color: "#ad2335" },
                { value: "100%", label: "Authentic Only", color: "#fdf0e3" }
              ].map((stat) => (
                <div key={stat.label} className="space-y-2">
                  <p className="text-2xl md:text-4xl font-black text-[#fdf0e3] tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {stat.value}
                  </p>
                  <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: stat.color === "#fdf0e3" ? "#ff97ad" : stat.color }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Scrapbook Collage */}
          <div className="flex-1 relative w-full flex items-center justify-center lg:justify-end">
            <div className="relative">
              {/* Main Polaroid Frame */}
              <motion.div
                initial={{ rotate: 10, y: 40, opacity: 0 }}
                animate={{ rotate: -4, y: 0, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative z-10 p-5 bg-[#fdf0e3] shadow-[0_30px_60px_rgba(0,0,0,0.6)] border-b-[60px] border-[#fdf0e3] rotate-[-4deg]"
              >
                <div className="relative overflow-hidden bg-[#660e14] aspect-[4/5] w-[280px] md:w-[400px]">
                  <img
                    src="/retro_modern_sneaker_collage_hero_1778671927941.png"
                    alt="Sneaker Collage"
                    className="w-full h-full object-cover contrast-[1.1] brightness-[0.9]"
                  />
                </div>

                {/* Tape Effect */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-40 h-12 bg-white/20 backdrop-blur-md border border-white/30 -rotate-3 z-20 mix-blend-overlay" />
                <div className="absolute -bottom-4 -right-10 w-32 h-10 bg-white/10 backdrop-blur-md border border-white/20 rotate-12 z-20 mix-blend-overlay" />
              </motion.div>

              {/* Floating Heart Logo */}
              <motion.div
                animate={{ y: [0, -30, 0], rotate: [0, 10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -right-10 z-20"
              >
                <img
                  src="/ientidade_visual/icon-coracao.png"
                  alt="Heart Icon"
                  className="size-30 md:size-40 object-contain drop-shadow-xl"
                />
              </motion.div>

              <motion.div
                animate={{ y: [0, 25, 0], x: [0, -15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -bottom-10 -left-20 z-0 text-[#ad2335]/40"
              >
                {/* Cloud/Doodle SVG */}
                <svg width="150" height="100" viewBox="0 0 150 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M30 60C10 60 10 40 30 40C30 20 60 20 70 40C90 20 120 20 120 40C140 40 140 60 120 60H30Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll Interaction Indicator */}
        <motion.div
          className="absolute bottom-10 right-10 hidden lg:flex flex-col items-center gap-6 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <div className="flex flex-col items-center gap-3 group cursor-pointer">
            <span className="text-[9px] text-[#fdf0e3]/30 font-black uppercase tracking-[1em] [writing-mode:vertical-lr] group-hover:text-[#ad2335] transition-colors">
              Explore
            </span>
            <motion.div
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-[1px] h-24 bg-gradient-to-b from-[#ad2335] via-[#ad2335]/50 to-transparent"
            />
          </div>
        </motion.div>
      </section>

      {/* Infinite Scrolling Ticker Section */}
      <section className="relative z-30 -mt-10 overflow-hidden">
        {/* Tier: Benefits Marquee (Red) */}
        <div className="bg-[#ad2335] py-4 flex whitespace-nowrap overflow-hidden shadow-[0_0_50px_rgba(173,35,53,0.3)] border-y border-white/10">
          <motion.div
            animate={{ x: [-1500, 0] }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="flex items-center gap-20 pr-20"
          >
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-12 font-black uppercase tracking-[0.2em] text-[9px] text-white">
                <div className="flex items-center gap-2"><Truck className="size-3" /> Entrega para todo Brasil</div>
                <div className="flex items-center gap-2"><Shield className="size-3" /> Compra 100% segura</div>
                <div className="flex items-center gap-2"><RotateCcw className="size-3" /> 30 dias para troca</div>
                <div className="flex items-center gap-2"><Star className="size-3" /> Produtos de primeira linha</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Abandoned Cart Recovery Banner */}
      {items.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pt-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#660e14] to-[#ad2335] p-8 md:p-12 shadow-2xl"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <ShoppingCart className="size-40 rotate-12" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center md:text-left">
                <Badge className="bg-white/20 text-white border-none hover:bg-white/30 px-4 py-1">Ainda dá tempo!</Badge>
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-tight">
                  Seus itens favoritos<br />estão te esperando.
                </h2>
                <p className="text-white/80 text-sm font-medium max-w-md uppercase tracking-wide">
                  Notamos que você deixou alguns produtos no carrinho. Finalize sua compra agora e garanta seus novos pares!
                </p>
              </div>

              <Link to="/carrinho">
                <Button size="lg" className="bg-white text-[#660e14] hover:bg-[#ad2335] hover:text-white h-16 px-10 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl transition-all duration-500">
                  Finalizar Pedido Agora
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>
      )}

      {/* ═══════════════ NOVIDADES: DROPS EXCLUSIVOS ═══════════════ */}
      <section className="max-w-7xl mx-auto px-6 py-32 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge className="bg-[#ad2335] text-white border-none hover:bg-[#ad2335] px-4 py-1 text-[8px] font-black uppercase tracking-[0.2em]">New In</Badge>
              <span className="text-[10px] text-[#ad2335] font-black uppercase tracking-[0.5em]">Lançamentos da Semana</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-normal text-[#660e14] tracking-normal" style={{ fontFamily: "'Glamour Absolute', cursive" }}>
              Novidades de Luxo<span className="text-[#ad2335]">.</span>
            </h2>
            <p className="text-sm text-[#660e14]/50 font-bold uppercase tracking-wider max-w-md">
              Recém chegados à nossa curadoria. Estilo e autenticidade em primeira mão.
            </p>
          </div>
          <Link to="/catalogo?new=true" className="group flex items-center gap-4 text-[10px] text-[#660e14] font-black uppercase tracking-[0.4em] hover:text-[#ad2335] transition-colors">
            Explorar Novidades
            <div className="size-10 rounded-full bg-[#ad2335]/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#ad2335]/20 transition-all">
              <ChevronRight className="size-4" />
            </div>
          </Link>
        </div>

        <motion.div
          variants={stagger.container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {newsProducts.length > 0 ? newsProducts.map((product) => (
            <motion.div key={product.id} variants={stagger.item}>
              <ProductCard product={product} />
            </motion.div>
          )) : (
            <div className="col-span-full text-center py-16">
              <p className="text-[#660e14]/30 text-xs font-black uppercase tracking-widest">Sincronizando novas peças...</p>
            </div>
          )}
        </motion.div>
      </section>

      {/* ═══════════════ SELEÇÃO ESSENTIAL ═══════════════ */}
      <section className="max-w-7xl mx-auto px-6 py-32 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-2 bg-[#ad2335] rounded-full animate-ping" />
              <span className="text-[10px] text-[#ad2335] font-black uppercase tracking-[0.5em]">Acessível & Estiloso</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-normal text-[#660e14] tracking-normal" style={{ fontFamily: "'Glamour Absolute', cursive" }}>
              Seleção Essential<span className="text-[#660e14]/10">.</span>
            </h2>
            <p className="text-sm text-[#660e14]/50 font-bold uppercase tracking-wider max-w-md">
              Até R$219 — O ponto de partida perfeito para o seu estilo.
            </p>
          </div>
          <Link to="/catalogo" className="group flex items-center gap-4 text-[10px] text-[#660e14] font-black uppercase tracking-[0.4em] hover:text-[#ad2335] transition-colors">
            Ver Todos
            <div className="size-10 rounded-full bg-white/20 border-[#660e14]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ChevronRight className="size-4" />
            </div>
          </Link>
        </div>

        <motion.div
          variants={stagger.container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {entryProducts.length > 0 ? entryProducts.map((product) => (
            <motion.div key={product.id} variants={stagger.item}>
              <ProductCard product={product} />
            </motion.div>
          )) : (
            <div className="col-span-full text-center py-16">
              <p className="text-[#660e14]/30 text-xs font-black uppercase tracking-widest">Em breve novos modelos</p>
            </div>
          )}
        </motion.div>
      </section>

      {/* ═══════════════ LINHA PREMIUM ═══════════════ */}
      <section className="bg-[#660e14] py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="mb-20 text-center space-y-4">
            <p className="text-[10px] text-[#ff97ad] font-black uppercase tracking-[0.6em]">Sofisticação & Conforto</p>
            <h2 className="text-6xl md:text-8xl font-normal text-[#fdf0e3] tracking-normal" style={{ fontFamily: "'Glamour Absolute', cursive" }}>
              Linha Premium<span className="text-[#ad2335]">.</span>
            </h2>
            <p className="text-sm text-[#ff97ad] font-bold uppercase tracking-wider max-w-lg mx-auto">
              De R$220 a R$348 — Qualidade superior para quem busca o melhor.
            </p>
          </div>

          <motion.div
            variants={stagger.container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12"
          >
            {premiumProducts.length > 0 ? premiumProducts.map((product) => (
              <motion.div key={product.id} variants={stagger.item} className="relative">
                <ProductCard product={product} />
              </motion.div>
            )) : (
              <div className="col-span-full text-center py-16">
                <p className="text-[#ff97ad] text-xs font-black uppercase tracking-widest">Em breve novos modelos</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ MODELOS HYPE / DIFERENCIADOS ═══════════════ */}
      <section className="relative py-32 overflow-hidden">
        {/* Background gradiente especial */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#fdf0e3] via-[#ffe5f0] to-[#ff97ad]/20 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-multiply pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="size-2 bg-[#ad2335] rounded-full" />
                  <div className="absolute inset-0 size-2 bg-[#ad2335] rounded-full animate-ping" />
                  <div className="absolute -inset-1 size-4 bg-[#ad2335]/20 rounded-full animate-pulse" />
                </div>
                <span className="text-[10px] text-[#ad2335] font-black uppercase tracking-[0.5em]">Exclusive Drops</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-normal text-[#660e14] tracking-normal" style={{ fontFamily: "'Glamour Absolute', cursive" }}>
                Modelos Hype<span className="text-[#ad2335]">.</span>
              </h2>
              <p className="text-sm text-[#660e14]/50 font-bold uppercase tracking-wider max-w-md">
                A partir de R$349 — Peças diferenciadas para quem quer se destacar.
              </p>
            </div>
            <Link to="/catalogo" className="group flex items-center gap-4 text-[10px] text-[#660e14] font-black uppercase tracking-[0.4em] hover:text-[#ad2335] transition-colors">
              Ver Coleção Completa
              <div className="size-10 rounded-full bg-[#ad2335]/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#ad2335]/20 transition-all">
                <ChevronRight className="size-4" />
              </div>
            </Link>
          </div>

          <motion.div
            variants={stagger.container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {hypeProducts.length > 0 ? hypeProducts.map((product) => (
              <motion.div key={product.id} variants={stagger.item}>
                <ProductCard product={product} />
              </motion.div>
            )) : (
              <div className="col-span-full text-center py-16">
                <p className="text-[#660e14]/30 text-xs font-black uppercase tracking-widest">Em breve novos modelos</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Feedback Elite: Mural Style */}
      <section className="bg-[#fdf0e3] py-40 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-32 space-y-4">
            <p className="text-[10px] text-[#ad2335] font-black uppercase tracking-[0.8em]">Voice of the Community</p>
            <h2 className="text-5xl md:text-7xl font-normal text-[#660e14] tracking-normal" style={{ fontFamily: "'Glamour Absolute', cursive" }}>
              Feedback Elite<span className="text-[#ad2335]">.</span>
            </h2>
          </div>

          <motion.div
            variants={stagger.container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-12"
          >
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                variants={stagger.item}
                className={`relative p-10 rounded-3xl shadow-xl transition-all duration-500 hover:scale-105 ${i % 2 === 0 ? 'bg-[#ad2335] text-[#ffe5f0] rotate-[-1deg]' : 'bg-white text-[#660e14] rotate-[1deg] border-2 border-[#660e14]/5'
                  }`}
              >
                {/* Tape Effect */}
                <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-8 backdrop-blur-sm border -rotate-2 z-10 ${i % 2 === 0 ? 'bg-white/20 border-white/10' : 'bg-[#ad2335]/20 border-[#ad2335]/10'
                  }`} />

                <div className="flex mb-8 gap-1">
                  {Array.from({ length: t.rating }).map((_, idx) => (
                    <Star key={idx} className={`size-3 fill-current ${i % 2 === 0 ? 'text-[#ff97ad]' : 'text-[#ad2335]'}`} />
                  ))}
                </div>

                <p className="text-sm leading-[1.8] font-bold uppercase tracking-wider mb-10 italic opacity-100">
                  "{t.comment}"
                </p>

                <div className="flex items-center gap-4">
                  <div className={`size-10 rounded-full flex items-center justify-center font-black text-[10px] ${i % 2 === 0 ? 'bg-[#ffe5f0] text-[#ad2335]' : 'bg-[#ad2335] text-[#ffe5f0]'
                    }`}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">{t.name}</p>
                    <p className={`text-[8px] font-bold uppercase tracking-[0.3em] ${i % 2 === 0 ? 'text-[#ff97ad]' : 'opacity-60'}`}>{t.city}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

    </div>
  );
}
