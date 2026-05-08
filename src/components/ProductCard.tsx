import { Link } from "react-router-dom";
import { Heart, Star, ShoppingCart } from "lucide-react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { type Product, formatPrice, getDiscount } from "@/lib/products-data.ts";
import { useWishlistStore } from "@/hooks/use-wishlist.ts";
import { useCartStore } from "@/hooks/use-cart.ts";
import { toast } from "sonner";
import { cn } from "@/lib/utils.ts";

type ProductCardProps = {
  product: Product;
  className?: string;
};

export default function ProductCard({ product, className }: ProductCardProps) {
  const { toggle, has } = useWishlistStore();
  const { addItem } = useCartStore();
  const productId = (product as any)._id || product.id;
  const isWishlisted = has(productId);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: productId,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: product.sizes[0],
      color: product.colors[0],
      quantity: 1,
    });
    toast.success("Adicionado ao carrinho!", {
      description: product.name,
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(productId);
    toast(isWishlisted ? "Removido dos favoritos" : "Adicionado aos favoritos!", {
      description: product.name,
    });
  };

  const discount = product.originalPrice ? getDiscount(product.price, product.originalPrice) : 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn("group relative bg-card rounded-xl overflow-hidden border border-border hover:border-[#ea3372]/40 hover:shadow-xl hover:shadow-[#ea3372]/5 transition-all duration-300", className)}
    >
      <Link to={`/produto/${productId}`}>
        {/* Image */}
        <div className="relative aspect-square bg-muted overflow-hidden">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.isNew && (
              <Badge className="bg-[#38b6ff] text-white text-[10px] border-0 px-2">NOVO</Badge>
            )}
            {discount > 0 && (
              <Badge className="bg-[#ea3372] text-white text-[10px] border-0 px-2">-{discount}%</Badge>
            )}
            {product.isBestSeller && !product.isNew && (
              <Badge className="bg-[#0b0b0b] text-white text-[10px] border-0 px-2">+ VENDIDO</Badge>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            className={cn(
              "absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer",
              isWishlisted
                ? "bg-[#ea3372] text-white"
                : "bg-white/80 text-gray-600 opacity-0 group-hover:opacity-100 hover:bg-[#ea3372] hover:text-white"
            )}
            aria-label={isWishlisted ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Heart className="h-4 w-4" fill={isWishlisted ? "currentColor" : "none"} />
          </button>

          {/* Quick add */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <Button
              onClick={handleAddToCart}
              className="w-full rounded-none bg-[#0b0b0b] hover:bg-[#ea3372] text-white h-10 text-sm font-semibold cursor-pointer"
              aria-label={`Adicionar ${product.name} ao carrinho`}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Adicionar ao Carrinho
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{product.brand}</p>
          <h3 className="font-semibold text-sm text-foreground leading-tight truncate">{product.name}</h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-3 w-3"
                  fill={i < Math.floor(product.rating) ? "#ea3372" : "none"}
                  stroke={i < Math.floor(product.rating) ? "#ea3372" : "#ccc"}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({product.reviews})</span>
          </div>

          {/* Price */}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-base font-bold text-foreground">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            ou 3x de {formatPrice(product.price / 3)} sem juros
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
