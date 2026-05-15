import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils.ts";

interface ReceiptProps {
  order: any;
  type: "customer" | "admin";
}

export default function Receipt({ order, type }: ReceiptProps) {
  if (!order) return null;

  return (
    <div id="receipt-container" className="hidden print:block fixed inset-0 bg-white text-black z-[99999] p-0 font-sans overflow-visible">
      <style>{`
        @media print {
          @page { margin: 0; size: auto; }
          html, body { 
            background: white !important; 
            margin: 0 !important; 
            padding: 0 !important; 
            overflow: visible !important;
            -webkit-print-color-adjust: exact;
          }
          /* Absolute isolation */
          #root, #root > *, main, main > * {
            visibility: hidden !important;
            border: none !important;
          }
          #receipt-container, #receipt-container * {
            visibility: visible !important;
          }
          #receipt-container { 
            display: block !important; 
            position: fixed !important; 
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: ${type === "customer" ? "65mm" : "120mm"} !important;
            height: auto !important;
            visibility: visible !important;
            z-index: 999999 !important;
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          nav, footer, header, button, .no-print, [vw], .vpw-container, #vlibras-widget, .vw-plugin-wrapper { 
            display: none !important; 
          }
        }
      `}</style>

      {type === "customer" ? (
        /* ─── ESTILO MAQUININHA (CLIENTE) ─── */
        <div className="w-[80mm] p-6 flex flex-col gap-4 text-[11px] leading-tight text-black bg-white font-mono">
          <div className="flex flex-col items-center border-b border-dotted border-black/30 pb-4">
            <img src="/logo.png" alt="Anna Shoes" className="max-h-12 w-auto mb-2 grayscale brightness-0" />
            <h1 className="text-sm font-black uppercase tracking-tighter">ANNA SHOES</h1>
            <p className="text-[8px] opacity-60 uppercase text-center font-bold">Premium Experience & Style</p>
          </div>

          <div className="flex flex-col gap-1 border-b border-dotted border-black/30 pb-4">
            <div className="flex justify-between font-black">
              <span>DOC. PEDIDO:</span>
              <span>#{order._id.slice(-6).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span>DATA/HORA:</span>
              <span>{order.createdAt ? format(new Date(order.createdAt), "dd/MM/yy HH:mm") : "--/--/--"}</span>
            </div>
            <div className="flex flex-col mt-2 pt-2 border-t border-black/5">
              <span className="text-[9px] font-black opacity-40 uppercase">Destinatário:</span>
              <span className="font-bold uppercase truncate">{order.customerName || order.userName || "CLIENTE ANNA"}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 py-2">
            <p className="font-black border-b border-black pb-1 uppercase text-center">Itens do Pedido</p>
            {order.items.map((item: any, i: number) => (
              <div key={i} className="flex flex-col gap-1">
                <div className="flex justify-between font-bold">
                  <span className="truncate pr-2">{item.quantity}x {item.name}</span>
                  <span className="whitespace-nowrap">{(item.price * item.quantity).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                </div>
                <div className="flex gap-2 text-[9px] opacity-60 uppercase font-medium">
                  {item.size && <span>TAM: {item.size}</span>}
                  {item.color && <span>COR: {item.color}</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1 border-t border-dotted border-black/30 pt-4">
            <div className="flex justify-between font-black border-t-2 border-black pt-2 mt-2 text-sm">
              <span>TOTAL:</span>
              <span>{order.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 border-t border-dotted border-black/30 pt-6 pb-4">
            <div className="text-center font-bold space-y-1">
              <p className="uppercase text-[10px]">Obrigada pela preferência!</p>
              <p className="text-[8px] opacity-60 italic">Anna Shoes — Onde o conforto encontra a sofisticação.</p>
            </div>
            <div className="flex flex-col items-center gap-1 opacity-20">
              <div className="w-32 h-4 bg-black flex gap-1 p-0.5">
                {[...Array(12)].map((_, i) => <div key={i} className="flex-1 bg-white" style={{ flexGrow: Math.random() > 0.5 ? 2 : 1 }} />)}
              </div>
              <span className="text-[6px] font-black uppercase">{order._id.toUpperCase()}</span>
            </div>
          </div>
        </div>
      ) : (
        /* ─── ESTILO ETIQUETA PREMIUM (ADMIN) ─── */
        <div className="w-[140mm] mx-auto my-10 p-10 bg-white text-black border-[3px] border-black rounded-[32px] relative font-sans overflow-hidden shadow-2xl">
          
          {/* Decoração Lateral */}
          <div className="absolute -top-10 -left-10 size-24 bg-[#ad2335]/10 rounded-full blur-2xl" />
          <div className="absolute top-8 right-8 flex flex-col items-end">
            <img src="/logo.png" alt="Anna Shoes" className="h-10 w-auto brightness-0 mb-1" />
            <span className="text-[6px] font-black tracking-[0.3em] uppercase opacity-40">Premium Logistics</span>
          </div>

          {/* Seção DESTINATÁRIO */}
          <div className="mb-12 relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-black text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] shadow-lg flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-[#ad2335]" />
                Destinatário
              </div>
              <div className="flex-1 h-[2px] bg-black/5" />
            </div>
            
            <div className="pl-4 space-y-4">
              <p className="text-4xl font-black uppercase tracking-tighter leading-none text-[#ad2335]">
                {order.customerName || order.userName || "CLIENTE ESPECIAL"}
              </p>
              
              <div className="text-xl font-bold space-y-1.5 tracking-tight text-black/80">
                <p>{order.address.street}, {order.address.number || "S/N"}</p>
                {order.address.complement && <p className="text-base opacity-60 italic">{order.address.complement}</p>}
                <p>{order.address.neighborhood}</p>
                <p className="flex items-center gap-2">
                  <span>{order.address.city} / {order.address.state}</span>
                </p>
                
                <div className="mt-8">
                  <div className="inline-block bg-black text-white px-6 py-3 rounded-2xl shadow-xl border-4 border-[#ad2335]/20">
                    <p className="text-4xl font-black tracking-tighter">CEP: {order.address.zip}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rodapé da Etiqueta — Info de Controle */}
          <div className="mt-14 flex justify-between items-end border-t border-black/10 pt-6">
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-black opacity-30 uppercase">ID do Pedido:</span>
              <span className="text-xs font-mono font-bold tracking-tighter text-black/40">ORD-{order._id.slice(-12).toUpperCase()}</span>
            </div>
            
            <div className="text-right flex flex-col items-end">
              <div className="text-[7px] font-black italic opacity-20 uppercase tracking-[0.2em] mb-1">Handmade with Love</div>
              <div className="size-4 rounded-full border-2 border-black/5 flex items-center justify-center">
                <div className="size-1 bg-[#ad2335] rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
