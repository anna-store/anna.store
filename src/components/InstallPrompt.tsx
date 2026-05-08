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
        <div className="bg-[#0b0b0b] border border-white/10 rounded-2xl shadow-2xl p-4 flex flex-col gap-3 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-gradient-to-br from-[#ea3372] to-[#38b6ff] flex items-center justify-center text-white font-bold text-xl italic">
                A
              </div>
              <div>
                <p className="text-white font-bold text-sm">Instalar Anna Shoes</p>
                <p className="text-white/40 text-[10px] uppercase tracking-wider">App Premium de Calçados</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/40 h-8 w-8"
              onClick={() => setShowPrompt(false)}
            >
              <X className="size-4" />
            </Button>
          </div>

          {isIOS ? (
            <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3 text-xs text-white/70">
              <Share className="size-4 text-[#38b6ff]" />
              <p>Toque em <span className="text-white font-bold">Compartilhar</span> e depois em <span className="text-white font-bold">Adicionar à Tela de Início</span></p>
            </div>
          ) : (
            <Button 
              className="w-full bg-[#ea3372] hover:bg-[#c9295f] text-white font-bold gap-2 h-11"
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
