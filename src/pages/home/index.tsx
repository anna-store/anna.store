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
      <section className="relative min-h-[95vh] flex items-center overflow-hidden bg-[#050505]">
        {/* Cinematic Background */}
        <div className="absolute inset-0 z-0">
          <motion.div 
            initial={{ scale: 1.15, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.6 }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full"
          >
            <img
              src="/luxury_fashion_hero_bg_1778080704577.png"
              alt="Elite Sneaker Culture"
              className="w-full h-full object-cover grayscale-[20%] brightness-[0.7]" 
            />
          </motion.div>
          
          {/* Atmosphere Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/70 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10" />
          <div className="absolute inset-0 bg-noise opacity-[0.03] z-10 pointer-events-none" />
          
          {/* Floating Light Orbs */}
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#ea3372]/10 blur-[150px] rounded-full animate-pulse pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[10%] w-[500px] h-[500px] bg-[#38b6ff]/5 blur-[150px] rounded-full animate-pulse pointer-events-none" style={{ animationDelay: "2s" }} />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-6 py-24 w-full">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-4 mb-8"
            >
              <div className="h-[1px] w-12 bg-[#ea3372]/50" />
              <span className="text-[10px] text-[#ea3372] font-black uppercase tracking-[0.6em] whitespace-nowrap">
                Luxury Sneaker Boutique
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl md:text-8xl lg:text-[100px] font-black text-white leading-[1.1] tracking-tight uppercase mb-10"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Caminhe com<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-[#ea3372] italic px-2">Estilo</span> e<br />
              <span className="text-[#38b6ff] relative">
                Atitude
                <span className="absolute -bottom-2 left-0 w-1/3 h-1 bg-[#38b6ff]/30 rounded-full" />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-white/40 text-sm md:text-base font-medium tracking-wide mb-12 max-w-lg leading-relaxed uppercase"
            >
              Curadoria de calçados extraordinários para quem não aceita o comum. 
              Qualidade premium, design disruptivo e entrega global.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap gap-6 items-center"
            >
              <Link to="/catalogo">
                <Button size="lg" className="bg-white text-black hover:bg-[#ea3372] hover:text-white font-black uppercase tracking-[0.2em] text-[11px] px-10 h-16 rounded-xl transition-all duration-500 shadow-2xl group cursor-pointer">
                  Explorar Catálogo
                  <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>

            {/* Premium Stats Container */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-3 gap-12 mt-20 pt-10 border-t border-white/5 max-w-xl"
            >
              {[
                { value: "10K+", label: "Clients VIP" },
                { value: "500+", label: "Drops Exclusivos" },
                { value: "4.9★", label: "Global Rating" }
              ].map((stat) => (
                <div key={stat.label} className="space-y-1">
                  <p className="text-2xl md:text-3xl font-black text-white tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {stat.value}
                  </p>
                  <p className="text-[9px] text-white/30 font-black uppercase tracking-[0.3em]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Cinematic Scroll Indicator */}
        <motion.div
          className="absolute bottom-10 left-10 hidden lg:flex flex-col items-center gap-4 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <span className="text-[8px] text-white/20 font-black uppercase tracking-[0.8em] rotate-90 origin-left translate-x-1 mb-8">
            Scroll
          </span>
          <div className="w-[1px] h-20 bg-gradient-to-t from-[#ea3372] to-transparent" />
        </motion.div>
      </section>

      {/* Floating Benefits Bar */}
      <div className="relative z-30 -mt-12 px-6">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto glass p-8 rounded-[2rem] border-white/5 shadow-2xl grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {BENEFITS.map((b, i) => (
            <motion.div 
              key={b.title} 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-5 group"
            >
              <div className="size-14 rounded-2xl flex items-center justify-center shrink-0 glass border-white/10 group-hover:bg-white group-hover:text-black transition-all duration-500 shadow-xl">
                <b.icon className="size-6" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">{b.title}</p>
                <p className="text-[9px] text-white/40 font-medium uppercase tracking-wider">{b.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

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
                 <span className="text-[10px] font-black text-[#ea3372] uppercase tracking-[0.5em] mb-4 transition-all group-hover:mb-6">0{i+1}</span>
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
      <section className="max-w-7xl mx-auto px-6 py-40">
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
