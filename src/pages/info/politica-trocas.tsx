import { Link } from "react-router-dom";
import { RotateCcw, ChevronRight, CheckCircle } from "lucide-react";

export default function PoliticaTrocas() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="bg-[#0b0b0b] border-b border-white/5 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-white/30 uppercase tracking-widest mb-6">
            <Link to="/" className="hover:text-[#ea3372] transition-colors">Início</Link>
            <ChevronRight className="size-3" />
            <span>Política de Trocas</span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-xl bg-[#ea3372]/10 flex items-center justify-center">
              <RotateCcw className="size-6 text-[#ea3372]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
              Política de <span className="text-[#ea3372]">Trocas</span>
            </h1>
          </div>
          <p className="text-white/40 text-sm">Trocas e devoluções sem complicação</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-16 space-y-12">
        {/* Destaques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Prazo para troca", value: "7 dias" },
            { label: "Produto em perfeito estado", value: "Obrigatório" },
            { label: "Frete da troca", value: "Por conta do cliente" },
          ].map((item) => (
            <div key={item.label} className="bg-white/[0.03] border border-white/5 rounded-xl p-5 text-center">
              <p className="text-2xl font-black text-[#ea3372]">{item.value}</p>
              <p className="text-xs text-white/40 uppercase tracking-widest mt-1">{item.label}</p>
            </div>
          ))}
        </div>

        {[
          {
            title: "Condições para Troca",
            content: `Aceitamos trocas nas seguintes condições:\n• O produto deve estar dentro do prazo de 7 dias corridos após o recebimento\n• O item deve estar sem uso, com etiquetas originais e na embalagem original\n• Deve ser acompanhado da nota fiscal\n• Não aceitamos trocas de produtos com sinais de uso, danificados ou sem embalagem`
          },
          {
            title: "Como Solicitar a Troca",
            content: `1. Entre em contato via WhatsApp (31) 9 8284-7734 ou e-mail contato.annast@gmail.com\n2. Informe o número do pedido e o motivo da troca\n3. Aguarde a confirmação e as instruções de envio\n4. Envie o produto para o endereço informado\n5. Após recebermos e verificarmos o item, enviaremos o novo produto`
          },
          {
            title: "Troca por Tamanho",
            content: `Caso precise trocar o número do calçado, sujeito à disponibilidade em estoque. Se o tamanho desejado não estiver disponível, oferecemos crédito na loja ou reembolso integral.`
          },
          {
            title: "Produto com Defeito",
            content: `Em caso de defeito de fabricação, o prazo para acionamento é de 90 dias (código de defesa do consumidor). O frete de devolução e reenvio será por conta da Anna Store. Entre em contato imediatamente com fotos do defeito.`
          },
          {
            title: "Reembolso",
            content: `O reembolso é processado em até 10 dias úteis após recebermos o produto. Para pagamentos no cartão, o estorno pode levar até 2 faturas dependendo da operadora. Para PIX, o reembolso é feito em até 3 dias úteis.`
          }
        ].map((section) => (
          <section key={section.title} className="space-y-4">
            <h2 className="text-lg font-black uppercase tracking-widest text-[#ea3372]">{section.title}</h2>
            <p className="text-white/60 leading-relaxed text-sm whitespace-pre-line">{section.content}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
