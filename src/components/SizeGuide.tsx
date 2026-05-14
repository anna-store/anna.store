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
      <DialogContent className="bg-[#fdf0e3] border-[#660e14]/10 text-[#660e14] max-w-md p-0 overflow-hidden rounded-[2.5rem]">
        <div className="bg-[#660e14]/5 p-8 border-b border-[#660e14]/10">
          <DialogHeader>
            <DialogTitle 
              className="text-4xl font-normal tracking-tight flex items-center gap-4 text-[#660e14]"
              style={{ fontFamily: "'Glamour Absolute', cursive" }}
            >
              <div className="size-12 rounded-2xl bg-[#660e14] flex items-center justify-center">
                <Ruler className="text-[#fdf0e3] size-6" />
              </div>
              Guia de Tamanhos
            </DialogTitle>
          </DialogHeader>
          <p className="text-[11px] text-[#660e14]/50 font-black uppercase tracking-widest mt-6 leading-relaxed">
            Meça o comprimento do seu pé em centímetros para encontrar o ajuste perfeito. 
            Recomendamos deixar uma folga de 0,5cm.
          </p>
        </div>

        <div className="p-8">
          <div className="overflow-hidden rounded-[2rem] border border-[#660e14]/10 bg-white/50 backdrop-blur-sm shadow-sm">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-[#660e14] text-[9px] font-black uppercase tracking-[0.3em] text-[#fdf0e3]">
                  <th className="py-4 border-r border-[#fdf0e3]/10">Tamanho BR</th>
                  <th className="py-4">Comprimento (CM)</th>
                </tr>
              </thead>
              <tbody className="text-xs font-bold">
                {sizes.map((s, idx) => (
                  <tr key={s.br} className={idx % 2 === 0 ? "bg-transparent" : "bg-[#660e14]/5"}>
                    <td className="py-4 border-r border-[#660e14]/5 text-[#ad2335] font-black">{s.br}</td>
                    <td className="py-4 text-[#660e14]/70">{s.cm} cm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex gap-4 p-5 rounded-[1.5rem] bg-[#ad2335]/5 border border-[#ad2335]/10">
            <div className="size-10 rounded-xl bg-[#ad2335]/10 flex items-center justify-center shrink-0">
              <Info className="size-5 text-[#ad2335]" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#ad2335] mb-1">Como medir?</p>
              <p className="text-[10px] text-[#660e14]/60 leading-relaxed font-medium">
                Pise em uma folha, desenhe o contorno do seu pé e meça da ponta do calcanhar até o dedão usando uma régua.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
