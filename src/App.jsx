import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/AppLayout";

// Pages
import HomePage from "@/pages/home";
import CatalogoPage from "@/pages/catalogo";
import ProdutoPage from "@/pages/produto";
import CarrinhoPage from "@/pages/carrinho";
import FavoritosPage from "@/pages/favoritos";
import CheckoutPage from "@/pages/checkout";
import CheckoutRetornoPage from "@/pages/checkout/retorno";
import AdminPage from "@/pages/admin";
import PainelPage from "@/pages/painel";
import PedidosPage from "@/pages/painel/pedidos";
import AuthCallback from "@/pages/auth/callback";
import AuthPage from "@/pages/auth";
import PromocoesPage from "@/pages/promocoes";
import NotFound from "@/pages/not-found";
import PoliticaPrivacidade from "@/pages/info/politica-privacidade";
import TermosDeUso from "@/pages/info/termos-de-uso";
import PoliticaTrocas from "@/pages/info/politica-trocas";
import PrazoDeEntrega from "@/pages/info/prazo-entrega";
import ComoComprar from "@/pages/info/como-comprar";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalogo" element={<CatalogoPage />} />
          <Route path="/promocoes" element={<PromocoesPage />} />
          <Route path="/produto/:id" element={<ProdutoPage />} />
          <Route path="/carrinho" element={<CarrinhoPage />} />
          <Route path="/favoritos" element={<FavoritosPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/retorno" element={<CheckoutRetornoPage />} />
          <Route path="/painel" element={<PainelPage />} />
          <Route path="/painel/pedidos" element={<PedidosPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/politica-de-privacidade" element={<PoliticaPrivacidade />} />
          <Route path="/termos-de-uso" element={<TermosDeUso />} />
          <Route path="/politica-de-trocas" element={<PoliticaTrocas />} />
          <Route path="/prazo-de-entrega" element={<PrazoDeEntrega />} />
          <Route path="/como-comprar" element={<ComoComprar />} />
        </Route>

        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
