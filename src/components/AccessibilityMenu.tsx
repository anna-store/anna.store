import { useState, useEffect } from "react";
import { Accessibility, Sun, Moon, Type, Languages, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button.tsx";

export default function AccessibilityMenu({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (v: boolean) => void }) {
  const [contrast, setContrast] = useState(false);
  const [fontSize, setFontSize] = useState(100);

  useEffect(() => {
    if (contrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
  }, [contrast]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
  }, [fontSize]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-32 left-4 md:left-auto md:right-4 w-[calc(100%-32px)] md:w-80 bg-white/40 backdrop-blur-2xl border border-black/5 rounded-[32px] shadow-2xl p-6 space-y-6 z-[60]"
          >
              <div className="pb-3 border-b border-black/5">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#660e14]/40">Configurações de Acessibilidade</p>
              </div>

              {/* Contraste */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-[#660e14]/60 uppercase tracking-widest">Modo de Visualização</p>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-xs font-black uppercase tracking-widest text-[#660e14] hover:bg-[#660e14]/5 h-12 rounded-2xl border-2 border-black/5"
                  onClick={() => setContrast(!contrast)}
                >
                  {contrast ? <Sun className="size-4 mr-3 text-[#ad2335]" /> : <Moon className="size-4 mr-3 text-[#ad2335]" />}
                  {contrast ? "Modo Normal" : "Alto Contraste"}
                </Button>
              </div>

              {/* Tamanho da Fonte */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-[#660e14]/60 uppercase tracking-widest">Tamanho do Texto</p>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    className="flex-1 bg-white/50 border-2 border-black/5 text-xs font-black text-[#660e14] h-12 rounded-2xl hover:bg-[#660e14]/5"
                    onClick={() => setFontSize(prev => Math.max(80, prev - 10))}
                  >
                    A-
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="flex-1 bg-white/50 border-2 border-black/5 text-xs font-black text-[#660e14] h-12 rounded-2xl hover:bg-[#660e14]/5"
                    onClick={() => setFontSize(100)}
                  >
                    100%
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="flex-1 bg-white/50 border-2 border-black/5 text-xs font-black text-[#660e14] h-12 rounded-2xl hover:bg-[#660e14]/5"
                    onClick={() => setFontSize(prev => Math.min(150, prev + 10))}
                  >
                    A+
                  </Button>
                </div>
              </div>

              {/* Libras */}
              <div className="pt-4 border-t border-black/5">
                <p className="text-[9px] text-[#2c3e50]/30 leading-relaxed font-bold uppercase tracking-wider">
                  Tradução em Libras disponível via VLibras para inclusão digital.
                </p>
              </div>
            </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .high-contrast {
          filter: contrast(1.5) brightness(1.2);
        }
        .high-contrast body {
          background-color: #000 !important;
          color: #fff !important;
        }
        .high-contrast * {
          border-color: #fff !important;
        }
      `}</style>
    </>
  );
}
