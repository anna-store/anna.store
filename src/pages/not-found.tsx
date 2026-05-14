import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { motion } from "motion/react";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: Rota não encontrada:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdf0e3] relative overflow-hidden">
      {/* Elementos Decorativos de Fundo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#ad2335]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#660e14]/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-multiply" />
      </div>

      <div className="relative z-10 text-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8 relative inline-block"
        >
          <h1 
            className="text-[150px] md:text-[250px] font-normal leading-none text-[#660e14] opacity-10 select-none"
            style={{ fontFamily: "'Glamour Absolute', cursive" }}
          >
            404
          </h1>
        </motion.div>

        <div className="space-y-6 -mt-12 md:-mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 
              className="text-4xl md:text-6xl font-normal text-[#660e14] mb-4"
              style={{ fontFamily: "'Glamour Absolute', cursive" }}
            >
              Perdido na Curadoria?
            </h2>
            <p className="text-[#660e14]/60 font-black uppercase tracking-[0.3em] text-[10px] md:text-xs max-w-md mx-auto leading-relaxed">
              A página que você procura deu um passo fora da nossa coleção ou nunca existiu.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
          >
            <Button 
              asChild 
              size="lg"
              className="bg-[#660e14] hover:bg-[#4d0a0f] text-white font-black uppercase tracking-widest text-[11px] h-14 px-10 rounded-2xl transition-all shadow-xl shadow-[#660e14]/20 cursor-pointer"
            >
              <Link to="/" className="flex items-center gap-3">
                <ArrowLeft className="size-4" /> Voltar ao Início
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline"
              size="lg"
              className="border-[#660e14]/20 text-[#660e14] hover:bg-[#660e14]/5 font-black uppercase tracking-widest text-[11px] h-14 px-10 rounded-2xl transition-all cursor-pointer"
            >
              <Link to="/catalogo" className="flex items-center gap-3">
                <Search className="size-4" /> Explorar Catálogo
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
