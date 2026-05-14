import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Download, X, Share } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    
    if (isStandalone) return;

    // Show after 10 seconds
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 10000);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-24 left-4 right-4 z-[100] md:hidden"
      >
        <div className="bg-white/90 border border-black/5 rounded-[32px] shadow-2xl p-6 flex flex-col gap-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-gradient-to-br from-[#660e14] to-[#ad2335] flex items-center justify-center text-white font-black text-2xl italic shadow-lg shadow-[#660e14]/20" style={{ fontFamily: "'Glamour Absolute', cursive" }}>
                A
              </div>
              <div>
                <p className="text-[#660e14] font-black text-sm tracking-tight">Instalar Anna Shoes</p>
                <p className="text-[#660e14]/40 text-[10px] font-bold uppercase tracking-[0.2em]">App Premium de Calçados</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-[#660e14]/20 h-10 w-10 hover:bg-[#660e14]/5 rounded-full"
              onClick={() => setShowPrompt(false)}
            >
              <X className="size-5" />
            </Button>
          </div>

          {isIOS ? (
            <div className="bg-[#660e14]/5 rounded-2xl p-4 flex items-center gap-3 text-[11px] text-[#660e14]/70 font-bold leading-snug">
              <Share className="size-4 text-[#ad2335]" />
              <p>Toque em <span className="text-[#660e14] font-black uppercase">Compartilhar</span> e depois em <span className="text-[#660e14] font-black uppercase">Adicionar à Tela de Início</span></p>
            </div>
          ) : (
            <Button 
              className="w-full bg-[#ad2335] hover:bg-[#660e14] text-white font-black gap-2 h-12 rounded-2xl shadow-xl shadow-[#ad2335]/20 uppercase text-[10px] tracking-widest transition-all active:scale-95"
              onClick={handleInstall}
            >
              <Download className="size-4" />
              Baixar Aplicativo
            </Button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
