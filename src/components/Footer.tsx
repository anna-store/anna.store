import { Link } from "react-router-dom";
import { Mail, MapPin } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#660e14] text-[#fdf0e3] py-24">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-16">
        
        {/* Brand Column */}
        <div className="md:col-span-5 space-y-10">
          <img
            src="/ientidade_visual/logo-principal(2).png"
            alt="Anna Shoes Logo"
            className="h-24 w-auto brightness-0 invert opacity-100"
          />
          <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-[1.1] max-w-sm">
            Curadoria definitiva de <span className="text-[#ad2335]">Sneakers Premium</span>. 
            Estilo, autenticidade e luxo em cada passo.
          </h3>
          <div className="flex gap-4">
            {/* Instagram */}
            <a 
              href="https://www.instagram.com/anna__storez" 
              target="_blank"
              className="size-12 rounded-2xl border border-[#fdf0e3]/10 flex items-center justify-center transition-all duration-300 hover:bg-[#ad2335] hover:border-[#ad2335] hover:-translate-y-1"
              aria-label="Instagram"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
            {/* Facebook */}
            <a 
              href="https://www.facebook.com/share/1LCS1UarXH" 
              target="_blank"
              className="size-12 rounded-2xl border border-[#fdf0e3]/10 flex items-center justify-center transition-all duration-300 hover:bg-[#ad2335] hover:border-[#ad2335] hover:-translate-y-1"
              aria-label="Facebook"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            {/* TikTok */}
            <a 
              href="https://www.tiktok.com/@anna__storez" 
              target="_blank"
              className="size-12 rounded-2xl border border-[#fdf0e3]/10 flex items-center justify-center transition-all duration-300 hover:bg-[#ad2335] hover:border-[#ad2335] hover:-translate-y-1"
              aria-label="TikTok"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1 .05A6.33 6.33 0 0 0 5 20.1a6.33 6.33 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Navigation Columns */}
        <div className="md:col-span-2 space-y-8">
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ad2335]">Navegação</h4>
          <ul className="space-y-4">
            {["Início", "Catálogo", "Promoções", "Novidades"].map((item) => (
              <li key={item}>
                <Link to="/" className="text-[11px] font-black uppercase tracking-widest text-[#ffe5f0] hover:text-white transition-colors">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2 space-y-8">
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ad2335]">Informações</h4>
          <ul className="space-y-4">
            {["Privacidade", "Termos", "Trocas", "Entrega"].map((item) => (
              <li key={item}>
                <Link to="/" className="text-[11px] font-black uppercase tracking-widest text-[#ffe5f0] hover:text-white transition-colors">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Column */}
        <div className="md:col-span-3 space-y-8">
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ad2335]">Contato</h4>
          <ul className="space-y-6">
            <li>
              <a href="mailto:contato.annast@gmail.com" className="group flex items-center gap-4 text-[11px] font-black uppercase tracking-widest text-[#ffe5f0] hover:text-white transition-colors">
                <div className="size-10 rounded-xl flex items-center justify-center transition-colors">
                  <Mail className="size-4" />
                </div>
                Email
              </a>
            </li>
            <li className="flex items-center gap-4 text-[11px] font-black uppercase tracking-widest text-[#ffe5f0]">
              <div className="size-10 rounded-xl flex items-center justify-center">
                <MapPin className="size-4" />
              </div>
              Brasil
            </li>
          </ul>
        </div>
      </div>

      {/* Credits Bar integrated */}
      <div className="mt-32 text-center">
        <p className="text-[9px] font-black uppercase tracking-[0.6em] text-[#ff97ad]/50">
          © {year} Anna Shoes — Defining Digital Luxury
        </p>
      </div>
    </footer>
  );
}
