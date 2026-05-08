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
            className="fixed top-32 left-4 md:left-auto md:right-4 w-[calc(100%-32px)] md:w-72 bg-[#0b0b0b] border border-white/10 rounded-2xl shadow-2xl p-5 space-y-5 backdrop-blur-2xl z-[60]"
          >
              <div className="pb-2 border-b border-white/5">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Acessibilidade</p>
              </div>

              {/* Contraste */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-white/60 uppercase">Visual</p>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-xs font-medium text-white/80 hover:bg-white/5 h-10"
                  onClick={() => setContrast(!contrast)}
                >
                  {contrast ? <Sun className="size-4 mr-3 text-[#38b6ff]" /> : <Moon className="size-4 mr-3 text-[#38b6ff]" />}
                  {contrast ? "Modo Normal" : "Alto Contraste"}
                </Button>
              </div>

              {/* Tamanho da Fonte */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-white/60 uppercase">Tamanho do Texto</p>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    className="flex-1 bg-white/5 text-xs font-black"
                    onClick={() => setFontSize(prev => Math.max(80, prev - 10))}
                  >
                    A-
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="flex-1 bg-white/5 text-xs font-black"
                    onClick={() => setFontSize(100)}
                  >
                    100%
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="flex-1 bg-white/5 text-xs font-black"
                    onClick={() => setFontSize(prev => Math.min(150, prev + 10))}
                  >
                    A+
                  </Button>
                </div>
              </div>

              {/* Libras */}
              <div className="pt-2 border-t border-white/5">
                <p className="text-[9px] text-white/20 leading-tight italic">
                  Este site possui integração com VLibras para tradução em Libras.
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
