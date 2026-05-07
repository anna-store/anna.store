import { Link } from "react-router-dom";
import { Shield, ChevronRight } from "lucide-react";

export default function PoliticaPrivacidade() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Hero */}
      <div className="bg-[#0b0b0b] border-b border-white/5 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-white/30 uppercase tracking-widest mb-6">
            <Link to="/" className="hover:text-[#ea3372] transition-colors">Início</Link>
            <ChevronRight className="size-3" />
            <span>Política de Privacidade</span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-xl bg-[#ea3372]/10 flex items-center justify-center">
              <Shield className="size-6 text-[#ea3372]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
              Política de <span className="text-[#ea3372]">Privacidade</span>
            </h1>
          </div>
          <p className="text-white/40 text-sm">Última atualização: maio de 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-12">
        {[
          {
            title: "1. Informações que Coletamos",
            content: `Coletamos informações fornecidas por você ao criar uma conta, realizar compras ou entrar em contato conosco. Isso inclui: nome completo, endereço de e-mail, número de telefone, endereço de entrega e dados de pagamento (processados com segurança pelo Mercado Pago).`
          },
          {
            title: "2. Como Usamos suas Informações",
            content: `Utilizamos seus dados para: processar pedidos e pagamentos, enviar atualizações sobre seu pedido, melhorar nossa experiência de compra, e enviar comunicações de marketing quando você optar por recebê-las. Nunca vendemos seus dados a terceiros.`
          },
          {
            title: "3. Compartilhamento de Dados",
            content: `Seus dados podem ser compartilhados apenas com parceiros essenciais para a operação da nossa curadoria: fabricantes parceiros em MG e SP (para faturamento e envio do seu pedido), serviços de pagamento (Mercado Pago), e transportadoras. Todos seguem rígidas políticas de segurança.`
          },
          {
            title: "4. Segurança",
            content: `Utilizamos tecnologia SSL para criptografar todas as transmissões de dados. Seus dados de pagamento são processados diretamente pelo Mercado Pago e nunca armazenados em nossos servidores. Adotamos as melhores práticas do setor para proteger suas informações.`
          },
          {
            title: "5. Seus Direitos (LGPD)",
            content: `De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a: acessar seus dados pessoais, corrigir dados incorretos, solicitar a exclusão de seus dados, revogar consentimentos fornecidos, e solicitar portabilidade dos dados. Para exercer esses direitos, entre em contato: contato.annast@gmail.com`
          },
          {
            title: "6. Cookies",
            content: `Utilizamos cookies essenciais para funcionamento da loja (carrinho, autenticação) e cookies analíticos para entender como nossos clientes usam o site. Você pode desativar cookies não essenciais nas configurações do seu navegador.`
          },
          {
            title: "7. Contato",
            content: `Para dúvidas sobre esta política, entre em contato:\nE-mail: contato.annast@gmail.com\nWhatsApp: (31) 9 8284-7734`
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
