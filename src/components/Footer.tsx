import { Link } from "react-router-dom";
import { Mail, MapPin } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0b0b0b] text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="space-y-4">
          <img
            src="/logo.png"
            alt="Anna Shoes Logo"
            className="h-32 w-auto"
          />
          <p className="text-white/60 text-sm leading-relaxed">
            Os melhores calçados com qualidade premium e entrega rápida para todo o Brasil.
          </p>
          <div className="flex gap-3">
            <a href="https://www.instagram.com/anna__storez?igsh=MWt5MThvZ3ZlMm50bg==" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#E4405F] flex items-center justify-center transition-colors cursor-pointer">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>
            <a href="https://www.facebook.com/share/1LCS1UarXH/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#1877F2] flex items-center justify-center transition-colors cursor-pointer">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href="https://www.tiktok.com/@anna.store.shoes?_r=1&_d=f24ileb7gm0dii&sec_uid=MS4wLjABAAAAZk3zb-hb2kd8F5bRKVIjkJmFn80a9wprvvtNzsi5MOopC7-9GaB7RJ6nf64vjUok&share_author_id=7631641575982351367&sharer_language=pt&source=h5_m&u_code=f35e4d92fbbc25&item_author_type=1&utm_source=copy&tt_from=copy&enable_checksum=1&utm_medium=ios&share_link_id=409CF8A9-E99E-4557-93D8-4A318C2AEB42&user_id=7631641575982351367&sec_user_id=MS4wLjABAAAAZk3zb-hb2kd8F5bRKVIjkJmFn80a9wprvvtNzsi5MOopC7-9GaB7RJ6nf64vjUok&social_share_type=4&ug_btm=b8727,b0&utm_campaign=client_share&share_app_id=1233" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#000000] border border-white/5 flex items-center justify-center transition-colors cursor-pointer">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.81-.74-3.94-1.69-.15-.12-.29-.26-.4-.41v5.12c.01 1.74-.53 3.51-1.67 4.83-1.22 1.45-3.04 2.37-4.91 2.58-1.92.21-3.96-.28-5.46-1.55-1.74-1.46-2.58-3.89-2.06-6.09.43-1.84 1.74-3.53 3.48-4.22 1.05-.42 2.21-.57 3.34-.44V12.1c-.81-.19-1.72-.07-2.43.36-.93.57-1.42 1.68-1.21 2.74.22 1.08 1.25 1.93 2.34 1.87 1.25-.07 2.24-1.23 2.12-2.48V0l-.11.02z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Links */}
        <div>
          <h4 className="font-semibold text-sm uppercase tracking-widest text-white/40 mb-4">Navegação</h4>
          <ul className="space-y-2">
            {[
              { label: "Início", href: "/" },
              { label: "Catálogo", href: "/catalogo" },
              { label: "Promoções", href: "/catalogo?promo=true" },
              { label: "Novidades", href: "/catalogo?new=true" },
              { label: "Meu Painel", href: "/painel" },
            ].map((l) => (
              <li key={l.href}>
                <Link to={l.href} className="text-sm text-white/60 hover:text-[#ea3372] transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Policies */}
        <div>
          <h4 className="font-semibold text-sm uppercase tracking-widest text-white/40 mb-4">Informações</h4>
          <ul className="space-y-2">
            {[
              { label: "Política de Privacidade", href: "/politica-de-privacidade" },
              { label: "Termos de Uso", href: "/termos-de-uso" },
              { label: "Política de Trocas", href: "/politica-de-trocas" },
              { label: "Prazo de Entrega", href: "/prazo-de-entrega" },
              { label: "Como Comprar", href: "/como-comprar" },
            ].map((l) => (
              <li key={l.href}>
                <Link to={l.href} className="text-sm text-white/60 hover:text-[#38b6ff] transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-semibold text-sm uppercase tracking-widest text-white/40 mb-4">Contato</h4>
          <ul className="space-y-3">
            <li>
              <a
                href="mailto:contato.annast@gmail.com"
                className="flex items-center gap-2 text-sm text-white/60 hover:text-[#ea3372] transition-colors"
              >
                <Mail className="h-4 w-4 text-[#ea3372] shrink-0" />
                contato.annast@gmail.com
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/5531982847734"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-white/60 hover:text-[#25D366] transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 fill-[#25D366] shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                (31) 9 8284-7734
              </a>
            </li>
            <li className="flex items-start gap-2 text-sm text-white/60">
              <MapPin className="h-4 w-4 text-[#ea3372] shrink-0 mt-0.5" />
              Brasil — Entregamos para todo o território nacional
            </li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            {["PIX", "Boleto", "Cartão"].map((m) => (
              <span key={m} className="bg-white/10 text-white/70 text-xs px-2 py-1 rounded">
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-white/40">
          <p>© {year} Anna Shoes. Todos os direitos reservados.</p>
          <p>Desenvolvido com ❤ para nossos clientes</p>
        </div>
      </div>
    </footer>
  );
}
