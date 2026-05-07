import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReceiptProps {
  order: any;
  type: "customer" | "admin";
}

export default function Receipt({ order, type }: ReceiptProps) {
  if (!order) return null;

  return (
    <div className="hidden print:block fixed inset-0 bg-white text-black z-[9999] p-10 font-sans">
      <div className="max-w-[800px] mx-auto border-2 border-black p-8">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-6">
          <div>
            <img
              src="https://hercules-cdn.com/file_MwBJp0asRxRHTEAr31k3LplG"
              alt="Anna Store"
              className="h-16 w-auto brightness-0 mb-2"
            />
            <p className="text-xs uppercase font-bold tracking-widest">
              {type === "customer" ? "Recibo de Compra" : "Ordem de Entrega / Guia de Envio"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-black tracking-tighter uppercase">Pedido #{order._id.slice(-6).toUpperCase()}</p>
            <p className="text-sm">
              {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-10 mb-8">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Cliente</p>
            <p className="font-bold text-sm">{order.customerName || "Cliente Anna Store"}</p>
            <p className="text-sm">{order.customerEmail}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Endereço de Entrega</p>
            <p className="text-sm leading-tight">
              {order.address.street}, {order.address.number && `${order.address.number}, `}
              {order.address.complement && `${order.address.complement}, `}
              {order.address.neighborhood}<br />
              {order.address.city} — {order.address.state}<br />
              CEP: {order.address.zip}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left py-2 uppercase font-black text-[10px] tracking-widest">Item</th>
                <th className="text-center py-2 uppercase font-black text-[10px] tracking-widest">Qtd</th>
                <th className="text-right py-2 uppercase font-black text-[10px] tracking-widest">Preço Unit.</th>
                <th className="text-right py-2 uppercase font-black text-[10px] tracking-widest">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item: any, i: number) => (
                <tr key={i} className="border-b border-gray-200">
                  <td className="py-3 font-medium">
                    {item.name}
                    {item.size && <span className="text-[10px] block text-gray-500 uppercase">Tamanho: {item.size}</span>}
                  </td>
                  <td className="py-3 text-center">{item.quantity}</td>
                  <td className="py-3 text-right">
                    {item.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </td>
                  <td className="py-3 text-right font-bold">
                    {(item.price * item.quantity).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer / Totals */}
        <div className="flex justify-end pt-4">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-500">Subtotal:</span>
              <span>{order.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-500">Frete:</span>
              <span className="text-green-600 font-bold uppercase text-[10px] pt-1">Grátis</span>
            </div>
            <div className="flex justify-between border-t-2 border-black pt-2">
              <span className="font-black uppercase tracking-widest text-xs">Total Geral:</span>
              <span className="font-black text-lg">
                {order.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </div>
          </div>
        </div>

        {/* Disclaimer Dropshipping */}
        <div className="mt-20 pt-8 border-t border-gray-100 text-[10px] text-gray-400 text-center uppercase tracking-[0.2em] leading-relaxed">
          {type === "customer" 
            ? "Este documento é um recibo de compra detalhado. A garantia de fábrica é válida por 7 dias para defeitos de fabricação."
            : "Ordem interna de processamento. Envio direto via fabricantes parceiros (MG/SP)."}
          <br />
          Anna Store Calçados — Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
}
