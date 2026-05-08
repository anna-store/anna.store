import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, Truck, Shield, RotateCcw, Star, ChevronRight, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import ProductCard from "@/components/ProductCard.tsx";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { useCartStore } from "@/hooks/use-cart.ts";
import { CATEGORIES, formatPrice } from "@/lib/products-data.ts";

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

const CATEGORY_DATA = [
  { name: "Tênis Masculino", image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80" },
  { name: "Tênis Feminino", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80" },
  { name: "Infantil", image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80" },
  { name: "Outros", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80" },
];

const stagger = {
  container: { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } },
  item: { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } } }
};

export default function Index() {
  const { items } = useCartStore();

  const dbFeatured = useQuery(api.products.getFeatured) || [];
  const dbBestSellers = useQuery(api.products.getBestSellers) || [];
  const dbNewArrivals = useQuery(api.products.getNewArrivals) || [];

  // Normalize products for existing components (ensure 'id' exists)
  const normalize = (p: any) => ({ ...p, id: p._id || p.id });
  const featuredProducts = dbFeatured.map(normalize).slice(0, 4);
  const bestSellers = dbBestSellers.map(normalize).slice(0, 4);
  const newProducts = dbNewArrivals.map(normalize).slice(0, 4);

  return (
    <div className="bg-[#050505] min-h-screen selection:bg-[#ea3372]/30 overflow-x-hidden">
      {/* Global Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-[#ea3372]/5 to-transparent" />
        <div className="absolute bottom-0 right-0 w-full h-[50vh] bg-gradient-to-t from-[#38b6ff]/5 to-transparent" />
        <div className="absolute inset-0 bg-noise opacity-[0.02]" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[100vh] flex items-center overflow-hidden bg-[#050505]">
        {/* Cinematic Background with Parallax effect simulation */}
        <div className="absolute inset-0 z-0">
          <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.7 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="w-full h-full"
          >
            <img
              src="/hero-anna-shoes.png"
              alt="Anna Shoes Collection Wall"
              className="w-full h-full object-cover brightness-[0.5] contrast-[1.2] object-center"
            />
          </motion.div>

          {/* Advanced Atmosphere Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/60 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay z-10 pointer-events-none" />

          {/* Animated Light Rays */}
          <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-[#ea3372]/5 blur-[180px] rounded-full animate-pulse pointer-events-none" />
          <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-[#38b6ff]/5 blur-[150px] rounded-full animate-pulse pointer-events-none" style={{ animationDelay: "3s" }} />
        </div>

        {/* Side Branding - Nova Coleção */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="absolute left-10 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-10 z-20"
        >
          <div className="w-[1px] h-32 bg-gradient-to-t from-white/20 to-transparent" />
          <span className="text-[10px] text-white/30 font-black uppercase tracking-[1em] [writing-mode:vertical-lr] rotate-180">
            Nova Coleção
          </span>
          <div className="w-[1px] h-32 bg-gradient-to-b from-white/20 to-transparent" />
        </motion.div>

        <div className="relative z-20 max-w-7xl mx-auto px-6 py-24 w-full">
          <div className="max-w-4xl">
            {/* Exclusive Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass border-white/10 mb-10"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="size-6 rounded-full border-2 border-[#050505] bg-muted overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <span className="text-[9px] text-white/70 font-black uppercase tracking-[0.2em]">
                +2.5k clientes satisfeitos este mês
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-4 mb-6"
            >
              <div className="h-[1px] w-12 bg-[#ea3372]" />
              <span className="text-[11px] text-[#ea3372] font-black uppercase tracking-[0.6em] whitespace-nowrap">
                Premium Footwear Concept
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl md:text-8xl lg:text-[90px] font-black text-white leading-[0.95] tracking-tight uppercase mb-10"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Pise com<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-[#ea3372] italic pr-4">Estilo</span>
              <span className="text-[#38b6ff] relative inline-block">
                Único
                <span className="absolute -bottom-2 left-0 w-full h-1.5 bg-[#38b6ff] rounded-full blur-[2px] opacity-50" />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-white/50 text-sm md:text-base font-medium tracking-wide mb-12 max-w-xl leading-relaxed uppercase"
            >
              A curadoria exclusiva de sneakers e calçados premium que une conforto absoluto e o design das ruas.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap gap-5 items-center"
            >
              <Link to="/catalogo">
                <Button size="lg" className="bg-[#ea3372] text-white hover:bg-white hover:text-black font-black uppercase tracking-[0.2em] text-[12px] px-12 h-16 rounded-2xl transition-all duration-500 shadow-[0_20px_50px_rgba(234,51,114,0.3)] group cursor-pointer" aria-label="Ver catálogo completo de produtos">
                  Explorar Catálago
                  <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a href="#mais-vendidos">
                <Button size="lg" variant="outline" className="glass border-white/10 text-white hover:bg-white/5 font-black uppercase tracking-[0.2em] text-[12px] px-10 h-16 rounded-2xl transition-all duration-500 group cursor-pointer" aria-label="Mais vendidos">
                  Mais Vendidos
                </Button>
              </a>
            </motion.div>

            {/* Enhanced Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-3 gap-16 mt-24 pt-12 border-t border-white/10 max-w-2xl"
            >
              {[
                { value: "15k+", label: "Elite Members", color: "#ea3372" },
                { value: "120+", label: "Global Brands", color: "#38b6ff" },
                { value: "100%", label: "Authentic Only", color: "#fff" }
              ].map((stat) => (
                <div key={stat.label} className="space-y-2">
                  <p className="text-3xl md:text-4xl font-black text-white tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {stat.value}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: `${stat.color}80` }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
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
            <span className="text-[9px] text-white/30 font-black uppercase tracking-[1em] [writing-mode:vertical-lr] group-hover:text-[#ea3372] transition-colors">
              Explore
            </span>
            <motion.div
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-[1px] h-24 bg-gradient-to-b from-[#ea3372] via-[#ea3372]/50 to-transparent"
            />
          </div>
        </motion.div>
      </section>

      {/* Infinite Scrolling Ticker Section */}
      <section className="relative z-30 -mt-10 overflow-hidden">
        {/* Tier: Benefits Marquee (Pink) */}
        <div className="bg-[#ea3372] py-4 flex whitespace-nowrap overflow-hidden shadow-[0_0_50px_rgba(234,51,114,0.3)] border-y border-white/10">
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
                <div className="flex items-center gap-2"><Star className="size-3" /> Produtos originais</div>
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
            className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#ea3372] to-[#ea3372]/80 p-8 md:p-12 shadow-2xl"
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
                <Button size="lg" className="bg-white text-[#ea3372] hover:bg-black hover:text-white h-16 px-10 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl transition-all duration-500">
                  Finalizar Pedido Agora
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>
      )}

      {/* Categories: Asymmetrical Layout */}
      <section className="max-w-7xl mx-auto px-6 py-32 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-2 bg-[#38b6ff] rounded-full animate-ping" />
              <span className="text-[10px] text-[#38b6ff] font-black uppercase tracking-[0.5em]">Collections</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Navegar<span className="text-[#ea3372]">.</span>
            </h2>
          </div>
          <Link to="/catalogo" className="group flex items-center gap-4 text-[10px] text-white font-black uppercase tracking-[0.4em] hover:text-[#ea3372] transition-colors">
            Ver Todo o Acervo
            <div className="size-10 rounded-full glass border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ChevronRight className="size-4" />
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {CATEGORY_DATA.map((cat, i) => (
            <Link
              key={cat.name}
              to={`/catalogo?categoria=${encodeURIComponent(cat.name)}`}
              className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden group cursor-pointer border border-white/5 shadow-2xl"
            >
              <div className="absolute inset-0 z-0">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-40 group-hover:opacity-60"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10" />
              <div className="absolute inset-0 glass opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />

              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-30">
                <span className="text-[10px] font-black text-[#ea3372] uppercase tracking-[0.5em] mb-4 transition-all group-hover:mb-6">0{i + 1}</span>
                <h3 className="text-sm font-black text-white uppercase tracking-widest text-center group-hover:scale-110 transition-transform duration-700">{cat.name}</h3>
              </div>

              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ea3372] to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products: Gallery Style */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="mb-20 text-center space-y-4">
          <p className="text-[10px] text-[#ea3372] font-black uppercase tracking-[0.6em]">Curated Drops</p>
          <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Destaques<span className="text-[#38b6ff]">.</span>
          </h2>
        </div>

        <motion.div
          variants={stagger.container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12"
        >
          {featuredProducts.map((product) => (
            <motion.div key={product.id} variants={stagger.item} className="relative">
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      </section>



      {/* Best Sellers & Quick Filters */}
      <section id="mais-vendidos" className="max-w-7xl mx-auto px-6 py-40">
        <div className="flex flex-col md:flex-row items-center justify-between mb-24 gap-12">
          <div className="text-center md:text-left">
            <p className="text-[10px] text-[#38b6ff] font-black uppercase tracking-[0.5em] mb-4">Elite Sales</p>
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Mais Vendidos<span className="text-white/10">.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full md:w-auto">
            {[
              { cat: "Infantil", price: "79,90", color: "#38b6ff" },
              { cat: "Casual", price: "129,90", color: "#ea3372" },
              { cat: "Sport", price: "189,90", color: "#38b6ff" }
            ].map((item) => (
              <motion.div
                key={item.cat}
                whileHover={{ y: -5 }}
                className="glass p-6 rounded-2xl border-white/5 flex flex-col items-center text-center group cursor-pointer"
              >
                <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.3em] mb-2">From</p>
                <p className="text-xl font-black text-white mb-1">R$ {item.price}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: item.color }}>{item.cat}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          variants={stagger.container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {bestSellers.map((product) => (
            <motion.div key={product.id} variants={stagger.item}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Testimonials: Premium Carousel Feel */}
      <section className="bg-gradient-to-b from-transparent to-[#080808] py-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-32 space-y-4">
            <p className="text-[10px] text-[#ea3372] font-black uppercase tracking-[0.8em]">Voice of the Community</p>
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Feedback Elite<span className="text-[#ea3372]">.</span>
            </h2>
          </div>

          <motion.div
            variants={stagger.container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                variants={stagger.item}
                className="glass p-10 rounded-[2.5rem] border-white/5 relative group hover:bg-white/5 transition-all duration-700"
              >
                <div className="absolute -top-6 -left-2 text-8xl font-serif text-white/5 pointer-events-none italic group-hover:text-[#ea3372]/10 transition-colors">"</div>
                <div className="flex mb-8 gap-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="size-3 fill-[#ea3372] text-[#ea3372]" />
                  ))}
                </div>
                <p className="text-xs md:text-sm text-white/60 leading-[2] uppercase tracking-widest mb-10 italic">
                  {t.comment}
                </p>
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-full glass border-white/10 flex items-center justify-center font-black text-[10px] text-white">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{t.name}</p>
                    <p className="text-[8px] text-white/20 font-bold uppercase tracking-[0.3em]">{t.city}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Branding Footer Signal */}
      <div className="py-20 text-center">
        <p className="text-[8px] text-white/5 font-black uppercase tracking-[1em]">
          Anna Shoes &bull; Defining Digital Luxury &bull; Est. 2026
        </p>
      </div>
    </div>
  );
}
