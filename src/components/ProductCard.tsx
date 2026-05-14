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
      className={cn("group relative bg-[#fdf0e3] rounded-2xl overflow-hidden border border-[#660e14]/10 hover:border-[#ad2335]/40 hover:shadow-2xl transition-all duration-300", className)}
    >
      <Link to={`/produto/${productId}`}>
        {/* Image */}
        <div className="relative aspect-square bg-[#660e14]/5 overflow-hidden">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.isNew && (
              <Badge className="bg-[#ff97ad] text-[#660e14] text-[9px] border-0 px-3 py-1 font-black tracking-widest">NOVO</Badge>
            )}
            {discount > 0 && (
              <Badge className="bg-[#ad2335] text-white text-[9px] border-0 px-3 py-1 font-black tracking-widest">-{discount}%</Badge>
            )}
            {product.isBestSeller && !product.isNew && (
              <Badge className="bg-[#660e14] text-white text-[9px] border-0 px-3 py-1 font-black tracking-widest">HOT</Badge>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            className={cn(
              "absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer backdrop-blur-md",
              isWishlisted
                ? "bg-[#ad2335] text-white shadow-lg shadow-[#ad2335]/40"
                : "bg-white/90 text-[#660e14] opacity-0 group-hover:opacity-100 hover:bg-[#ad2335] hover:text-white"
            )}
            aria-label={isWishlisted ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Heart className="h-4 w-4" fill={isWishlisted ? "currentColor" : "none"} />
          </button>

          {/* Quick add */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
            <Button
              onClick={handleAddToCart}
              className="w-full rounded-none bg-[#ad2335] hover:bg-[#660e14] text-[#fdf0e3] h-12 text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer"
              aria-label={`Adicionar ${product.name} ao carrinho`}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Adicionar ao Carrinho
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="p-6">
          <p className="text-[9px] text-[#660e14]/60 font-black uppercase tracking-[0.2em] mb-2">{product.brand}</p>
          <h3 className="font-bold text-sm text-[#660e14] leading-tight truncate uppercase tracking-tight">{product.name}</h3>

          {/* Rating */}
          <div className="flex items-center gap-2 mt-3">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-2.5 w-2.5"
                  fill={i < Math.floor(product.rating) ? "#ad2335" : "none"}
                  stroke={i < Math.floor(product.rating) ? "#ad2335" : "#660e1433"}
                />
              ))}
            </div>
            {product.reviews > 0 && (
              <span className="text-[10px] font-bold text-[#660e14]/20">({product.reviews})</span>
            )}
          </div>

          {/* Price */}
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-lg font-black text-[#ad2335] tracking-tight">{formatPrice(product.price)}</span>
            {product.originalPrice > 0 && (
              <span className="text-xs text-[#660e14]/30 line-through font-bold">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
