import { Link } from "react-router-dom";
import { RotateCcw, ChevronRight, CheckCircle } from "lucide-react";

export default function PoliticaTrocas() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="bg-[#0b0b0b] border-b border-white/5 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-white/30 uppercase tracking-widest mb-6">
            <Link to="/" className="hover:text-[#ad2335] transition-colors">Início</Link>
            <ChevronRight className="size-3" />
            <span>Política de Trocas</span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-xl bg-[#ad2335]/10 flex items-center justify-center">
              <RotateCcw className="size-6 text-[#ad2335]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
              Política de <span className="text-[#ad2335]">Trocas</span>
            </h1>
          </div>
          <p className="text-white/40 text-sm">Trocas e devoluções sem complicação</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-16 space-y-12">
        {/* Destaques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Trocas por Defeito", value: "7 dias" },
            { label: "Análise de Fábrica", value: "Obrigatória" },
            { label: "Erro de Tamanho", value: "Não trocamos" },
          ].map((item) => (
            <div key={item.label} className="bg-white/[0.03] border border-white/5 rounded-xl p-5 text-center">
              <p className="text-2xl font-black text-[#ad2335]">{item.value}</p>
              <p className="text-xs text-white/40 uppercase tracking-widest mt-1">{item.label}</p>
            </div>
          ))}
        </div>

        {[
          {
            title: "Condições para Troca",
            content: `Realizamos trocas exclusivamente em casos de defeito de fabricação comprovado. Não realizamos trocas por erro na escolha do tamanho ou desistência após o uso.\n\nCondições:\n• O defeito deve ser comunicado em até 7 dias corridos após o recebimento.\n• O produto passará por uma análise técnica junto ao fabricante para confirmar o defeito de fábrica.\n• Itens com sinais de mau uso, lavagem inadequada ou danos acidentais não serão trocados.`
          },
          {
            title: "Como Solicitar a Troca (Defeito)",
            content: `1. Envie fotos e vídeos nítidos do defeito para o WhatsApp (31) 9 8284-7734 ou e-mail contato.annast@gmail.com\n2. Informe o número do seu pedido.\n3. Após a análise preliminar, enviaremos as instruções para postagem do produto.`
          },
          {
            title: "Importante: Guia de Tamanhos",
            content: `Como não realizamos trocas por erro de tamanho, recomendamos conferir atentamente a tabela de medidas disponível na página de cada produto antes de finalizar sua compra. Em caso de dúvida, nossa equipe está disponível via WhatsApp para auxiliar na escolha.`
          },
          {
            title: "Produto com Defeito Confirmado",
            content: `Sendo confirmado o defeito de fabricação, o frete de devolução e reenvio será integralmente por nossa conta. Caso o produto não esteja mais em estoque, você poderá escolher outro item de mesmo valor ou solicitar o reembolso.`
          }
        ].map((section) => (
          <section key={section.title} className="space-y-4">
            <h2 className="text-lg font-black uppercase tracking-widest text-[#ad2335]">{section.title}</h2>
            <p className="text-white/60 leading-relaxed text-sm whitespace-pre-line">{section.content}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
