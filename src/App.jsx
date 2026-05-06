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
import NotFound from "@/pages/not-found";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalogo" element={<CatalogoPage />} />
          <Route path="/produto/:id" element={<ProdutoPage />} />
          <Route path="/carrinho" element={<CarrinhoPage />} />
          <Route path="/favoritos" element={<FavoritosPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/retorno" element={<CheckoutRetornoPage />} />
          <Route path="/painel" element={<PainelPage />} />
          <Route path="/painel/pedidos" element={<PedidosPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
