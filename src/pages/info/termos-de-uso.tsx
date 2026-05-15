import { Link } from "react-router-dom";
import { FileText, ChevronRight } from "lucide-react";

export default function TermosDeUso() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="bg-[#0b0b0b] border-b border-white/5 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-white/30 uppercase tracking-widest mb-6">
            <Link to="/" className="hover:text-[#ad2335] transition-colors">Início</Link>
            <ChevronRight className="size-3" />
            <span>Termos de Uso</span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-xl bg-[#38b6ff]/10 flex items-center justify-center">
              <FileText className="size-6 text-[#38b6ff]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
              Termos de <span className="text-[#38b6ff]">Uso</span>
            </h1>
          </div>
          <p className="text-white/40 text-sm">Última atualização: maio de 2026</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-16 space-y-12">
        {[
          {
            title: "1. Aceitação dos Termos",
            content: `Ao acessar e utilizar a Anna Store, você concorda com estes Termos de Uso. Se não concordar com qualquer parte destes termos, por favor, não utilize nossos serviços.`
          },
          {
            title: "2. Cadastro e Conta",
            content: `Para realizar compras, é necessário criar uma conta. Você é responsável por manter a confidencialidade de seus dados de acesso e por todas as atividades realizadas em sua conta. Notifique-nos imediatamente sobre qualquer uso não autorizado.`
          },
          {
            title: "3. Produtos e Preços",
            content: `Todos os preços estão em Reais (BRL) e incluem impostos. Nos reservamos o direito de alterar preços sem aviso prévio. Nos casos de erro manifesto de preço, reservamo-nos o direito de cancelar o pedido, informando o cliente imediatamente.`
          },
          {
            title: "4. Pagamentos",
            content: `Aceitamos pagamentos via cartão de crédito, débito, PIX e boleto bancário, processados pelo Mercado Pago. O pedido só é confirmado após a aprovação do pagamento.`
          },
          {
            title: "5. Propriedade Intelectual",
            content: `Todo o conteúdo do site — incluindo textos, imagens, logotipos e design — é propriedade da Anna Store e protegido por leis de direitos autorais. É proibida a reprodução sem autorização expressa.`
          },
          {
            title: "6. Limitação de Responsabilidade",
            content: `A Anna Store não se responsabiliza por danos indiretos, incidentais ou consequentes decorrentes do uso do site. Nossa responsabilidade máxima fica limitada ao valor do pedido em questão.`
          },
          {
            title: "7. Alterações nos Termos",
            content: `Podemos atualizar estes termos periodicamente. A versão mais recente estará sempre disponível nesta página. O uso continuado do site após mudanças constitui aceitação dos novos termos.`
          }
        ].map((section) => (
          <section key={section.title} className="space-y-4">
            <h2 className="text-lg font-black uppercase tracking-widest text-[#38b6ff]">{section.title}</h2>
            <p className="text-white/60 leading-relaxed text-sm">{section.content}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
