import { Link } from "react-router-dom";
import { HelpCircle, ChevronRight, ShoppingBag, Search, CreditCard, Package } from "lucide-react";

const STEPS = [
  { icon: <Search className="size-6 text-[#ad2335]" />, title: "1. Escolha seu produto", desc: "Navegue pelo catálogo e escolha o modelo que mais combina com você. Confira as medidas e fotos reais." },
  { icon: <ShoppingBag className="size-6 text-[#ad2335]" />, title: "2. Adicione ao carrinho", desc: "Escolha o tamanho e cor. Como trabalhamos com envio direto de fábrica, garanta que seu tamanho está correto." },
  { icon: <CreditCard className="size-6 text-[#ad2335]" />, title: "3. Pagamento e Curadoria", desc: "Após o pagamento, realizamos a curadoria e o faturamento do seu par diretamente com nossos fabricantes parceiros em MG ou SP." },
  { icon: <Package className="size-6 text-[#ad2335]" />, title: "4. Envio Direto", desc: "Seu produto sai da fábrica direto para sua casa. Você recebe o rastreio em 3 a 5 dias úteis após a aprovação." },
];

const FAQS = [
  { q: "Preciso criar uma conta para comprar?", a: "Sim, é necessário criar uma conta para finalizar a compra. O cadastro é rápido e gratuito." },
  { q: "Meu pagamento foi aprovado. E agora?", a: "Você receberá um e-mail de confirmação. Em até 2 dias úteis seu pedido será separado e postado, com código de rastreamento." },
  { q: "Posso alterar meu pedido após finalizar?", a: "Alterações são possíveis apenas se o pedido ainda não foi despachado. Entre em contato imediatamente pelo WhatsApp." },
  { q: "Como sei se o produto está disponível no meu tamanho?", a: "Na página do produto, os tamanhos disponíveis em estoque ficam destacados. Tamanhos esgotados aparecem em cinza." },
  { q: "O site é seguro para comprar?", a: "Sim! Utilizamos SSL e os pagamentos são processados pelo Mercado Pago, líder em pagamentos online na América Latina." },
];

export default function ComoComprar() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="bg-[#0b0b0b] border-b border-white/5 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-white/30 uppercase tracking-widest mb-6">
            <Link to="/" className="hover:text-[#ad2335] transition-colors">Início</Link>
            <ChevronRight className="size-3" />
            <span>Como Comprar</span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-xl bg-[#ad2335]/10 flex items-center justify-center">
              <HelpCircle className="size-6 text-[#ad2335]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
              Como <span className="text-[#ad2335]">Comprar</span>
            </h1>
          </div>
          <p className="text-white/40 text-sm">Simples, rápido e seguro</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-16 space-y-16">
        {/* Passo a passo */}
        <section className="space-y-6">
          <h2 className="text-lg font-black uppercase tracking-widest text-[#ad2335]">Passo a Passo</h2>
          <div className="space-y-4">
            {STEPS.map((step) => (
              <div key={step.title} className="flex gap-5 bg-white/[0.02] border border-white/5 rounded-xl p-6 hover:border-[#ad2335]/20 transition-colors">
                <div className="h-12 w-12 rounded-xl bg-[#ad2335]/10 flex items-center justify-center shrink-0">
                  {step.icon}
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-widest mb-2">{step.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-6">
          <h2 className="text-lg font-black uppercase tracking-widest text-[#ad2335]">Perguntas Frequentes</h2>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <div key={faq.q} className="border border-white/5 rounded-xl p-6">
                <p className="font-bold text-sm mb-2">{faq.q}</p>
                <p className="text-white/60 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="bg-[#ad2335]/10 border border-[#ad2335]/20 rounded-2xl p-8 text-center space-y-4">
          <p className="font-black text-xl uppercase tracking-widest">Pronto para comprar?</p>
          <p className="text-white/50 text-sm">Acesse nosso catálogo e encontre o par perfeito</p>
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 bg-[#ad2335] hover:bg-[#660e14] text-white font-black uppercase tracking-widest text-xs px-8 py-4 rounded-xl transition-colors"
          >
            Ver Catálogo <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
