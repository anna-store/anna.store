import { motion } from "motion/react";

export default function LoadingScreen({ message = "Preparando sua experiência..." }) {
  return (
    <div className="fixed inset-0 z-[100] bg-[#fdf0e3] flex flex-col items-center justify-center gap-8">
      <div className="relative">
        {/* Glow de fundo */}
        <div className="absolute inset-0 bg-[#ad2335]/20 blur-3xl rounded-full scale-150 animate-pulse" />
        
        {/* Ícone flutuante */}
        <motion.img
          src="/ientidade_visual/icon-coracao.png"
          className="size-24 md:size-32 relative z-10"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
      </div>

      <div className="text-center space-y-2">
        <p 
          className="text-4xl font-normal text-[#660e14] tracking-tight"
          style={{ fontFamily: "'Glamour Absolute', cursive" }}
        >
          Anna Shoes
        </p>
        <div className="flex items-center gap-3 justify-center">
          <div className="h-[1px] w-8 bg-[#660e14]/20" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#660e14]/40 animate-pulse">
            {message}
          </p>
          <div className="h-[1px] w-8 bg-[#660e14]/20" />
        </div>
      </div>
    </div>
  );
}
