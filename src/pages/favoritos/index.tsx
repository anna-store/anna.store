import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Heart, ShoppingCart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { toast } from "sonner";
import ProductCard from "@/components/ProductCard.tsx";
import { useWishlistStore } from "@/hooks/use-wishlist.ts";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty.tsx";

export default function FavoritosPage() {
  const { items, toggle } = useWishlistStore();
  const navigate = useNavigate();

  const allProducts = useQuery(api.products.getAll) || [];

  const products = items
    .map((id) => allProducts.find(p => p._id === id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined)
    .map(p => ({ ...p, id: p._id }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/catalogo">
          <Button variant="ghost" size="icon" className="cursor-pointer">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-black">Lista de Desejos</h1>
          <p className="text-sm text-muted-foreground">
            {products.length} {products.length === 1 ? "produto salvo" : "produtos salvos"}
          </p>
        </div>
      </div>

      {products.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Heart />
            </EmptyMedia>
            <EmptyTitle>Sua lista de desejos está vazia</EmptyTitle>
            <EmptyDescription>
              Salve seus produtos favoritos para comprar depois.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              className="bg-[#ea3372] hover:bg-[#c9295f] text-white cursor-pointer"
              onClick={() => navigate("/catalogo")}
            >
              Explorar produtos
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <p className="text-muted-foreground text-sm">
              Clique no coração para remover um produto
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground text-xs cursor-pointer hover:text-destructive"
              onClick={() => {
                items.forEach((id) => toggle(id));
                toast("Lista de desejos limpa");
              }}
            >
              Limpar lista
            </Button>
          </div>

          <motion.div
            layout
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {products.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>

          {/* CTA */}
          <div className="mt-10 text-center">
            <p className="text-muted-foreground text-sm mb-4">
              Gostou dos produtos? Adicione ao carrinho antes que acabem!
            </p>
            <Button
              className="bg-[#0b0b0b] hover:bg-[#333] text-white font-semibold cursor-pointer"
              onClick={() => {
                // Add all wishlisted items to cart as a shortcut hint
                navigate("/catalogo");
              }}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Continuar comprando
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
