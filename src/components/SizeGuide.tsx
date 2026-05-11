import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog.tsx";
import { Ruler, Info } from "lucide-react";

interface SizeGuideProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SizeGuide({ isOpen, onOpenChange }: SizeGuideProps) {
  const sizes = [
    { br: "34", cm: "22,5" },
    { br: "35", cm: "23,3" },
    { br: "36", cm: "24,0" },
    { br: "37", cm: "24,6" },
    { br: "38", cm: "25,3" },
    { br: "39", cm: "26,0" },
    { br: "40", cm: "26,6" },
    { br: "41", cm: "27,3" },
    { br: "42", cm: "28,0" },
    { br: "43", cm: "28,7" },
    { br: "44", cm: "29,4" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0b0b0b] border-white/10 text-white max-w-md p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-[#ea3372]/20 to-transparent p-6 border-b border-white/5">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
              <Ruler className="text-[#ea3372] size-6" />
              Guia de Tamanhos
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-white/40 font-medium mt-2 leading-relaxed">
            Meça o comprimento do seu pé em centímetros para encontrar o tamanho ideal. 
            Recomendamos deixar uma folga de 0,5cm para maior conforto.
          </p>
        </div>

        <div className="p-6">
          <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-[#38b6ff]">
                  <th className="py-4 border-r border-white/5">Tamanho BR</th>
                  <th className="py-4">Comprimento (CM)</th>
                </tr>
              </thead>
              <tbody className="text-sm font-bold">
                {sizes.map((s, idx) => (
                  <tr key={s.br} className={idx % 2 === 0 ? "bg-transparent" : "bg-white/[0.01]"}>
                    <td className="py-3 border-r border-white/5 text-[#ea3372]">{s.br}</td>
                    <td className="py-3 text-white/60">{s.cm} cm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex gap-4 p-4 rounded-2xl bg-[#38b6ff]/5 border border-[#38b6ff]/20">
            <Info className="size-5 text-[#38b6ff] shrink-0" />
            <div>
              <p className="text-[10px] font-black uppercase text-[#38b6ff] mb-1">Como medir?</p>
              <p className="text-[10px] text-white/60 leading-relaxed">
                Pise em uma folha de papel, desenhe o contorno do seu pé e use uma régua para medir da ponta do calcanhar até o dedão.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
