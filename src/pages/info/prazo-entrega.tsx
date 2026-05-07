import { Link } from "react-router-dom";
import { Truck, ChevronRight, MapPin } from "lucide-react";

const PRAZOS = [
  { regiao: "Sudeste (SP, RJ, MG, ES)", prazo: "3 a 7 dias úteis", frete: "R$ 15,00" },
  { regiao: "Sul (PR, SC, RS)", prazo: "5 a 10 dias úteis", frete: "R$ 22,00" },
  { regiao: "Centro-Oeste (DF, GO, MS, MT)", prazo: "7 a 12 dias úteis", frete: "R$ 28,00" },
  { regiao: "Nordeste", prazo: "8 a 15 dias úteis", frete: "R$ 35,00" },
  { regiao: "Norte (AM, PA, AC, RO, RR, AP, TO)", prazo: "10 a 20 dias úteis", frete: "R$ 45,00" },
];

export default function PrazoDeEntrega() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="bg-[#0b0b0b] border-b border-white/5 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-white/30 uppercase tracking-widest mb-6">
            <Link to="/" className="hover:text-[#ea3372] transition-colors">Início</Link>
            <ChevronRight className="size-3" />
            <span>Prazo de Entrega</span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-xl bg-[#38b6ff]/10 flex items-center justify-center">
              <Truck className="size-6 text-[#38b6ff]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
              Prazo de <span className="text-[#38b6ff]">Entrega</span>
            </h1>
          </div>
          <p className="text-white/40 text-sm">Entregamos para todo o Brasil</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-16 space-y-12">
        <section className="space-y-4">
          <h2 className="text-lg font-black uppercase tracking-widest text-[#38b6ff]">Prazos por Região</h2>
          <div className="overflow-hidden rounded-xl border border-white/5">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/5">
                  <th className="text-left px-4 py-3 text-white/40 font-black text-xs uppercase tracking-widest">Região</th>
                  <th className="text-left px-4 py-3 text-white/40 font-black text-xs uppercase tracking-widest">Prazo</th>
                  <th className="text-right px-4 py-3 text-white/40 font-black text-xs uppercase tracking-widest">Frete</th>
                </tr>
              </thead>
              <tbody>
                {PRAZOS.map((item, i) => (
                  <tr key={item.regiao} className={`border-b border-white/5 ${i % 2 === 0 ? "" : "bg-white/[0.02]"}`}>
                    <td className="px-4 py-3 text-white/70">
                      <span className="flex items-center gap-2">
                        <MapPin className="size-3 text-[#38b6ff] shrink-0" />
                        {item.regiao}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/70">{item.prazo}</td>
                    <td className="px-4 py-3 text-right font-bold text-white">{item.frete}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {[
          { title: "Processamento do Pedido", content: "Após a confirmação do pagamento, seu pedido é preparado em até 2 dias úteis. Você receberá um e-mail com o código de rastreamento assim que o pedido for despachado." },
          { title: "Rastreamento", content: "Todos os pedidos são rastreáveis. O código será enviado por e-mail após o despacho. Acompanhe pelo site dos Correios ou da transportadora." },
          { title: "Atrasos", content: "Em períodos de alta demanda os prazos podem ser maiores. Em caso de atraso superior a 5 dias do prazo estimado, entre em contato pelo WhatsApp (31) 9 8284-7734." },
        ].map((s) => (
          <section key={s.title} className="space-y-4">
            <h2 className="text-lg font-black uppercase tracking-widest text-[#38b6ff]">{s.title}</h2>
            <p className="text-white/60 leading-relaxed text-sm">{s.content}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
