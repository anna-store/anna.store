import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReceiptProps {
  order: any;
  type: "customer" | "admin";
}

export default function Receipt({ order, type }: ReceiptProps) {
  if (!order) return null;

  return (
    <div className="hidden print:block fixed inset-0 bg-white text-black z-[9999] p-12 font-sans overflow-visible">
      {/* Container Principal */}
      <div className="max-w-[800px] mx-auto border-[1.5px] border-black/80 rounded-sm overflow-hidden flex flex-col min-h-[90vh]">
        
        {/* Header Superior — Branding */}
        <div className="bg-black text-white p-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img
              src="https://hercules-cdn.com/file_MwBJp0asRxRHTEAr31k3LplG"
              alt="Anna Store"
              className="h-12 w-auto invert brightness-0"
            />
            <div className="h-8 w-[1px] bg-white/20 mx-2" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Anna Store</p>
              <p className="text-xs font-bold uppercase tracking-widest leading-none">
                {type === "customer" ? "Comprovante de Pedido" : "Guia de Envio — Logística"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">ID do Pedido</p>
            <p className="text-2xl font-black italic tracking-tighter leading-none">#{order._id.slice(-6).toUpperCase()}</p>
          </div>
        </div>

        {/* Faixa de Status / Data */}
        <div className="border-b border-black/10 px-8 py-3 flex justify-between items-center bg-gray-50/50">
          <p className="text-[9px] font-bold uppercase tracking-widest text-black/40">
            Emitido em: {order.createdAt ? format(new Date(order.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : "—"}
          </p>
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-black" />
            <span className="text-[9px] font-black uppercase tracking-widest">Documento Original</span>
          </div>
        </div>

        {/* Seção de Dados — Grid de Informação */}
        <div className="p-8 grid grid-cols-2 gap-12">
          {/* Coluna 1: Destinatário */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-black/30 border-b border-black/5 pb-2">Destinatário</h3>
            <div className="space-y-1">
              <p className="text-lg font-black leading-tight">{order.customerName || order.userName || "Cliente Anna Store"}</p>
              <p className="text-sm text-black/60">{order.customerEmail || order.userEmail}</p>
              {order.customerPhone && <p className="text-sm text-black/60">{order.customerPhone}</p>}
            </div>
          </div>

          {/* Coluna 2: Endereço */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-black/30 border-b border-black/5 pb-2">Endereço de Entrega</h3>
            <div className="space-y-1">
              <p className="text-sm font-bold leading-tight">
                {order.address.street}, {order.address.number || "S/N"}
              </p>
              <p className="text-sm text-black/70 leading-tight">
                {order.address.complement && `${order.address.complement} — `}
                {order.address.neighborhood}
              </p>
              <p className="text-sm text-black/70 font-bold">
                {order.address.city} / {order.address.state} — {order.address.zip}
              </p>
            </div>
          </div>
        </div>

        {/* Tabela de Produtos */}
        <div className="px-8 flex-1">
          <div className="w-full">
            <div className="grid grid-cols-12 gap-4 border-b-2 border-black pb-2 mb-2">
              <div className="col-span-7 text-[10px] font-black uppercase tracking-widest">Descrição do Produto</div>
              <div className="col-span-1 text-center text-[10px] font-black uppercase tracking-widest">Qtd</div>
              <div className="col-span-2 text-right text-[10px] font-black uppercase tracking-widest">Unitário</div>
              <div className="col-span-2 text-right text-[10px] font-black uppercase tracking-widest">Subtotal</div>
            </div>
            
            <div className="space-y-4">
              {order.items.map((item: any, i: number) => (
                <div key={i} className="grid grid-cols-12 gap-4 items-center border-b border-black/5 pb-4 last:border-0">
                  <div className="col-span-7">
                    <p className="text-sm font-black leading-tight uppercase tracking-tight">{item.name}</p>
                    <div className="flex gap-4 mt-1">
                      {item.size && <span className="text-[9px] font-bold text-black/40 uppercase">Tamanho: {item.size}</span>}
                      {item.color && <span className="text-[9px] font-bold text-black/40 uppercase">Cor: {item.color}</span>}
                    </div>
                  </div>
                  <div className="col-span-1 text-center font-bold text-sm">{item.quantity}</div>
                  <div className="col-span-2 text-right text-sm">
                    {item.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </div>
                  <div className="col-span-2 text-right text-sm font-black">
                    {(item.price * item.quantity).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rodapé — Valores e QR Code */}
        <div className="bg-gray-50 border-t border-black/10 p-8 flex justify-between items-end mt-auto">
          {/* QR Code Simbólico / Tracking */}
          <div className="flex gap-4 items-center opacity-40">
            <div className="size-20 border border-black p-1 flex flex-wrap gap-[2px]">
              {[...Array(64)].map((_, i) => (
                <div key={i} className={Math.random() > 0.5 ? "size-2 bg-black" : "size-2 bg-transparent"} />
              ))}
            </div>
            <div className="text-[9px] font-bold uppercase tracking-widest leading-relaxed">
              Rastreamento Interno<br />
              <span className="font-black text-xs">AS-{order._id.slice(-8).toUpperCase()}</span><br />
              Anna Store Logística
            </div>
          </div>

          {/* Totais */}
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-black/40 uppercase tracking-widest">Subtotal:</span>
              <span className="font-bold">{order.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="font-bold text-black/40 uppercase tracking-widest">Envio (PAC/Sedex):</span>
              <span className="text-green-600 font-black uppercase tracking-widest italic">Frete Grátis</span>
            </div>
            <div className="pt-4 border-t-2 border-black flex justify-between items-baseline">
              <span className="font-black text-sm uppercase tracking-tighter italic">Total Final</span>
              <span className="font-black text-2xl tracking-tighter">
                {order.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </div>
          </div>
        </div>

        {/* Mensagem Final / Instruções */}
        <div className="p-8 pt-0 bg-gray-50 text-[9px] text-black/30 text-center uppercase font-bold tracking-[0.2em] space-y-2">
          <p>
            {type === "customer" 
              ? "Este documento é o seu comprovante oficial de compra Anna Store. Guarde para acionar a garantia."
              : "Atenção logística: Verificar integridade da embalagem antes do despacho. Envio prioritário."}
          </p>
          <p className="border-t border-black/5 pt-4">
            Anna Store Calçados & Estilo — Onde o conforto encontra a sofisticação.
          </p>
        </div>
      </div>
    </div>
  );
}
