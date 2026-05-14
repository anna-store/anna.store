import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Heart,
  ShoppingCart,
  Star,
  Truck,
  RotateCcw,
  Shield,
  ChevronRight,
  Minus,
  Plus,
  Share2,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { toast } from "sonner";
import ProductCard from "@/components/ProductCard.tsx";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import SizeGuide from "@/components/SizeGuide.tsx";
import LoadingScreen from "@/components/LoadingScreen.tsx";
import {
  formatPrice,
  getDiscount,
  type Product
} from "@/lib/products-data.ts";
import { useCartStore } from "@/hooks/use-cart.ts";
import { useWishlistStore } from "@/hooks/use-wishlist.ts";
import { cn } from "@/lib/utils.ts";
import { useMutation } from "convex/react";
import { useAuth } from "@/hooks/use-auth.ts";
import { useAction } from "convex/react";

const FAKE_REVIEWS: any[] = [];

export default function ProdutoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = useQuery(api.products.getById, { productId: id as Id<"products"> });
  const allProducts = useQuery(api.products.getAll) || [];
  
  const reviews = useQuery(api.products.checkReviews, { productId: id || "" }) || [];

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const { addItem } = useCartStore();
  const { toggle, has } = useWishlistStore();

  if (!product) {
    return <LoadingScreen message="Buscando detalhes do produto..." />;
  }

  if (product === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg font-semibold">Produto não encontrado</p>
        <Button onClick={() => navigate("/catalogo")} className="bg-[#ea3372] text-white cursor-pointer">
          Ver catálogo
        </Button>
      </div>
    );
  }

  const isWishlisted = has(product._id as string);
  const discount = product.originalPrice ? getDiscount(product.price, product.originalPrice) : 0;
  const related = allProducts
    .filter((p) => p.category === product.category && p._id !== product._id)
    .map(p => ({ ...p, id: p._id }))
    .slice(0, 4);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Selecione um tamanho");
      return;
    }
    // Só valida a cor se o produto tiver cores cadastradas
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.error("Selecione uma cor");
      return;
    }
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: selectedSize,
      color: selectedColor,
      quantity,
    });
    setAddedToCart(true);
    toast.success("Adicionado ao carrinho!", { description: `${product.name} — Nº ${selectedSize}` });
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (!selectedSize) { toast.error("Selecione um tamanho"); return; }
    if (product.colors && product.colors.length > 0 && !selectedColor) { toast.error("Selecione uma cor"); return; }
    handleAddToCart();
    navigate("/carrinho");
  };

  return (
    <div className="min-h-screen bg-[#fdf0e3]">
      <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      {/* Breadcrumb */}
      <nav className="text-xs text-[#660e14]/60 mb-6 flex items-center gap-1 flex-wrap font-medium">
        <Link to="/" className="hover:text-[#ad2335]">Início</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/catalogo" className="hover:text-[#ad2335]">Catálogo</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to={`/catalogo?categoria=${encodeURIComponent(product.category)}`} className="hover:text-[#ad2335]">
          {product.category}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-[#660e14] truncate max-w-32 font-bold">{product.name}</span>
      </nav>


      <div className="grid lg:grid-cols-2 gap-10 mb-16">
        {/* Images */}
        <div className="space-y-3">
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="aspect-square rounded-2xl overflow-hidden bg-muted relative"
          >
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discount > 0 && (
              <Badge className="absolute top-4 left-4 bg-[#ad2335] text-white text-sm border-0 px-3 py-1 shadow-lg">
                -{discount}% OFF
              </Badge>
            )}
            {product.isNew && (
              <Badge className="absolute top-4 right-4 bg-[#660e14] text-white border-0 px-3 py-1 shadow-lg">
                NOVO
              </Badge>
            )}
          </motion.div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedImage === i ? "border-[#ad2335] shadow-md" : "border-black/5 hover:border-[#ad2335]/50"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-5">
          {/* Brand & Share */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-[#ad2335] uppercase tracking-[0.4em]">
              {product.brand}
            </span>
            <button
              onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copiado!"); }}
              className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          <div>
            <h1 className="text-5xl font-normal text-[#660e14] leading-[0.9] mb-2" style={{ fontFamily: "'Glamour Absolute', cursive" }}>{product.name}</h1>
            <p className="text-sm text-[#660e14]/60 font-bold uppercase tracking-widest">{product.category}</p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-4 w-4"
                  fill={i < Math.floor(product.rating) ? "#ad2335" : "none"}
                  stroke={i < Math.floor(product.rating) ? "#ad2335" : "#660e1440"}
                />
              ))}
            </div>
            <span className="text-sm font-black text-[#660e14]">{product.rating}</span>
            {product.reviews > 0 && (
              <span className="text-xs text-[#660e14]/40 font-bold">({product.reviews} avaliações)</span>
            )}
          </div>

          {/* Price */}
          <div className="bg-[#660e14]/5 rounded-2xl p-6 border border-[#660e14]/10">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black text-[#660e14] tracking-tighter">{formatPrice(product.price)}</span>
              {product.originalPrice > 0 && (
                <span className="text-lg text-[#660e14]/30 line-through font-bold">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {discount > 0 && (
                <Badge className="bg-[#ad2335] text-white border-0 font-black">-{discount}%</Badge>
              )}
            </div>
            <p className="text-sm text-[#660e14]/60 mt-2 font-medium">
              ou <strong className="text-[#660e14]">3x de {formatPrice(product.price / 3)}</strong> sem juros no cartão
            </p>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-700 rounded-full text-xs font-black uppercase tracking-wider">
              <CheckCircle className="size-3" /> PIX: {formatPrice(product.price * 0.95)} (5% OFF)
            </div>
          </div>

          {/* Color selector - Só exibe se houver cores cadastradas */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-[#660e14]">Cor</span>
                {selectedColor && <span className="text-sm text-muted-foreground">{selectedColor}</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-xl border-2 text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                      selectedColor === color
                        ? "border-[#ad2335] bg-[#ad2335] text-white shadow-lg shadow-[#ad2335]/20"
                        : "border-black/5 hover:border-[#ad2335]/50 text-[#660e14]"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size selector */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-[#660e14]">Tamanho</span>
              <button 
                onClick={() => setIsSizeGuideOpen(true)}
                className="text-xs text-[#ad2335] hover:underline cursor-pointer font-bold uppercase tracking-tighter"
              >
                Guia de tamanhos
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes
                .filter((size) => {
                  if (product.colorVariants && product.colorVariants.length > 0) {
                    if (selectedColor) {
                      const variant = product.colorVariants.find(v => v.color === selectedColor);
                      return variant ? variant.sizes.includes(size) : false;
                    }
                    return product.colorVariants.some(v => v.sizes.includes(size));
                  }
                  return true;
                })
                .map((size) => {
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 rounded-2xl border-2 text-sm font-black transition-all cursor-pointer ${
                        selectedSize === size
                          ? "border-[#660e14] bg-[#660e14] text-white shadow-lg shadow-[#660e14]/20"
                          : "border-black/5 hover:border-[#660e14] text-[#660e14]"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-[#660e14]">Quantidade</span>
            <div className="flex items-center border-2 border-black/5 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 flex items-center justify-center hover:bg-[#660e14]/5 transition-colors cursor-pointer text-[#660e14]"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center text-sm font-black text-[#660e14]">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 flex items-center justify-center hover:bg-[#660e14]/5 transition-colors cursor-pointer text-[#660e14]"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleAddToCart}
              className={`flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs cursor-pointer transition-all ${
                addedToCart
                  ? "bg-green-600 text-white"
                  : "bg-[#660e14] hover:bg-[#4d0a0f] text-white shadow-xl shadow-[#660e14]/20"
              }`}
            >
              <AnimatePresence mode="wait">
                {addedToCart ? (
                  <motion.span key="added" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" /> No Carrinho!
                  </motion.span>
                ) : (
                  <motion.span key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" /> Adicionar
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
            <Button
              onClick={handleBuyNow}
              className="flex-1 h-14 rounded-2xl bg-[#ad2335] hover:bg-[#8b1c2b] text-white font-black uppercase tracking-widest text-xs cursor-pointer shadow-xl shadow-[#ad2335]/20"
            >
              Comprar Agora
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => { toggle(product._id as string); toast(isWishlisted ? "Removido dos favoritos" : "Adicionado aos favoritos!"); }}
              className={`h-14 w-14 rounded-2xl border-2 transition-all cursor-pointer ${isWishlisted ? "bg-[#ad2335] border-[#ad2335] text-white shadow-lg shadow-[#ad2335]/20" : "border-black/5 hover:border-[#ad2335]/50 bg-white"}`}
            >
              <Heart className="h-5 w-5" fill={isWishlisted ? "currentColor" : "none"} />
            </Button>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { icon: Truck, label: "Envio Expresso", desc: "Todo o Brasil", color: "#660e14" },
              { icon: RotateCcw, label: "Troca Grátis", desc: "Até 7 dias", color: "#ad2335" },
              { icon: Shield, label: "Seguro Elite", desc: "Compra Protegida", color: "#660e14" },
            ].map((b) => (
              <div key={b.label} className="text-center p-4 bg-white/40 border border-black/5 rounded-2xl backdrop-blur-sm transition-all hover:scale-105">
                <b.icon className="h-6 w-6 mx-auto mb-2" style={{ color: b.color }} />
                <p className="text-[10px] font-black text-[#660e14] uppercase tracking-wider">{b.label}</p>
                <p className="text-[9px] text-[#660e14]/40 font-bold uppercase mt-1">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-16">
        <ProductTabs product={product} reviews={reviews} />
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div>
          <h2 className="text-4xl font-normal text-[#660e14] mb-8" style={{ fontFamily: "'Glamour Absolute', cursive" }}>Produtos Relacionados</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Size Guide Modal */}
      <SizeGuide 
        isOpen={isSizeGuideOpen} 
        onOpenChange={setIsSizeGuideOpen} 
      />
      </div>
    </div>
  );
}



function ProductTabs({ product, reviews }: { product: any, reviews: any[] }) {
  const [tab, setTab] = useState<"desc" | "reviews" | "shipping">("desc");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const tabs = [
    { id: "desc" as const, label: "Descrição" },
    { id: "reviews" as const, label: `Avaliações (${product.reviews})` },
    { id: "shipping" as const, label: "Entrega" },
  ];

  return (
    <div>
      <div className="flex border-b border-border gap-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`pb-3 text-xs font-black uppercase tracking-widest transition-all cursor-pointer border-b-2 -mb-px ${
              tab === t.id
                ? "border-[#ad2335] text-[#ad2335]"
                : "border-transparent text-[#660e14]/40 hover:text-[#660e14]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="pt-6">
        <AnimatePresence mode="wait">
          {tab === "desc" && (
            <motion.div key="desc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              <div className="mt-6 grid sm:grid-cols-2 gap-4">
                <div className="bg-[#660e14]/5 rounded-2xl p-6 border border-[#660e14]/10">
                  <h4 className="font-black uppercase tracking-widest text-xs mb-4 text-[#660e14]">Especificações</h4>
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-[#660e14]/5 pb-1"><dt className="text-[#660e14]/40 font-bold uppercase text-[10px]">Marca</dt><dd className="font-black text-[#660e14]">{product.brand}</dd></div>
                    <div className="flex justify-between border-b border-[#660e14]/5 pb-1"><dt className="text-[#660e14]/40 font-bold uppercase text-[10px]">Categoria</dt><dd className="font-black text-[#660e14]">{product.category}</dd></div>
                    <div className="flex justify-between border-b border-[#660e14]/5 pb-1"><dt className="text-[#660e14]/40 font-bold uppercase text-[10px]">Tamanhos</dt><dd className="font-black text-[#660e14]">{product.sizes[0]} – {product.sizes[product.sizes.length - 1]}</dd></div>
                    <div className="flex justify-between"><dt className="text-[#660e14]/40 font-bold uppercase text-[10px]">Disponível</dt><dd className="text-green-600 font-black">Pronta Entrega</dd></div>
                  </dl>
                </div>
                <div className="bg-[#660e14]/5 rounded-2xl p-6 border border-[#660e14]/10">
                  <h4 className="font-black uppercase tracking-widest text-xs mb-4 text-[#660e14]">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <Badge key={tag} className="bg-[#660e14]/10 text-[#660e14] hover:bg-[#660e14]/20 border-0 text-[10px] font-black uppercase px-3 py-1">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {tab === "reviews" && (
            <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Summary */}
              <div className="flex flex-col md:flex-row items-center gap-8 bg-[#660e14]/5 border border-[#660e14]/10 rounded-3xl p-8 mb-8">
                <div className="text-center">
                  <p className="text-6xl font-black text-[#660e14] tracking-tighter" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{product.rating}</p>
                  <div className="flex justify-center my-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-5 w-5" fill={i < Math.floor(product.rating) ? "#ad2335" : "none"} stroke={i < Math.floor(product.rating) ? "#ad2335" : "#660e1420"} />
                    ))}
                  </div>
                  <p className="text-[10px] text-[#660e14]/40 uppercase font-black tracking-widest">{reviews.length} avaliações</p>
                </div>
                
                <Separator orientation="vertical" className="hidden md:block h-20" />
                
                <div className="flex-1 w-full space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter(r => Math.floor(r.rating) === star).length;
                    const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-[#660e14]/40 w-4">{star}</span>
                        <div className="flex-1 h-2 bg-[#660e14]/5 rounded-full overflow-hidden">
                          <div className="h-full bg-[#ad2335] rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[10px] font-black text-[#660e14]/60 w-8">{Math.round(pct)}%</span>
                      </div>
                    );
                  })}
                </div>

                <div className="shrink-0 w-full md:w-auto">
                   <Button 
                    className="w-full bg-[#660e14] hover:bg-[#4d0a0f] text-white font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-2xl shadow-xl shadow-[#660e14]/20 border-0"
                    onClick={() => {
                      if (!isAuthenticated) {
                        toast.error("Você precisa estar logado para avaliar");
                        navigate("/auth");
                        return;
                      }
                      setIsReviewModalOpen(true);
                    }}
                   >
                     Escrever Avaliação
                   </Button>
                </div>
              </div>

              <div className="grid gap-4">
                {reviews.length > 0 ? (
                  reviews.map((r, i) => (
                    <div key={i} className="group bg-white/40 border border-black/5 hover:border-[#ad2335]/20 rounded-3xl p-8 transition-all backdrop-blur-sm">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="size-12 rounded-2xl bg-gradient-to-br from-[#660e14] to-[#ad2335] p-[1px] shadow-lg shadow-[#660e14]/10">
                            <div className="size-full bg-white rounded-2xl flex items-center justify-center font-black text-xs text-[#660e14]">
                              {(r.userName || "U").charAt(0)}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-black text-[#660e14] text-sm">{r.userName}</p>
                              <Badge className="bg-green-500/10 text-green-600 text-[8px] font-black uppercase px-2 py-0.5 border-0 flex items-center gap-1">
                                <CheckCircle className="size-2" /> Verificado
                              </Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider">
                              {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <Star 
                              key={j} 
                              className={cn("h-3.5 w-3.5", j < r.rating ? "fill-[#ad2335] text-[#ad2335]" : "text-[#660e1410]")} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-[#660e14]/70 leading-relaxed font-medium italic">"{r.comment}"</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed border-border">
                    <p className="text-sm text-muted-foreground">Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
          {tab === "shipping" && (
            <motion.div key="shipping" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="bg-[#660e14]/5 border border-[#660e14]/10 rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="size-10 rounded-xl bg-[#ad2335]/10 flex items-center justify-center">
                    <Truck className="size-5 text-[#ad2335]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#660e14] uppercase tracking-widest">Calcular Frete e Prazo</h3>
                    <p className="text-[10px] text-[#660e14]/40 font-bold uppercase tracking-tighter">Informe seu CEP para cotação direta</p>
                  </div>
                </div>

                <ShippingCalculator product={product} />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: RotateCcw, title: "Troca Grátis", desc: "Até 7 dias após o recebimento.", color: "#ad2335" },
                  { icon: Shield, title: "Compra Segura", desc: "Dados protegidos pela AnnaSt.", color: "#660e14" },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4 p-5 bg-white/40 border border-black/5 rounded-2xl backdrop-blur-sm">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${item.color}10` }}>
                      <item.icon className="h-5 w-5" style={{ color: item.color }} />
                    </div>
                    <div>
                      <p className="font-black text-[#660e14] text-[10px] uppercase tracking-widest">{item.title}</p>
                      <p className="text-[10px] text-[#660e14]/60 font-medium mt-1 leading-tight">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Review Modal */}
      <ReviewFormModal 
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        productId={product._id}
        productName={product.name}
        productImage={product.images[0]}
      />
    </div>
  );
}

function ReviewFormModal({ isOpen, onClose, productId, productName, productImage }: { isOpen: boolean, onClose: () => void, productId: Id<"products">, productName: string, productImage: string }) {
  const { user } = useAuth();
  const createReview = useMutation(api.products.createReview);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      await createReview({
        userId: user._id,
        productId,
        rating,
        comment: comment.trim(),
        userName: user.name || "Cliente",
        userAvatar: typeof user.avatar === "string" ? user.avatar : undefined,
      });
      toast.success("Avaliação enviada com sucesso!");
      onClose();
      setComment("");
    } catch (err: any) {
      toast.error("Erro ao enviar avaliação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-background border border-white/10 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-[#ea3372]/10 flex items-center justify-center">
              <Star className="h-5 w-5 text-[#ea3372] fill-[#ea3372]" />
            </div>
            <h2 className="text-xl font-black italic uppercase tracking-tighter">Avaliar Produto</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/5">
            <XIcon className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
            <img src={productImage} alt="" className="size-16 rounded-xl object-cover border border-white/10" />
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">{productName}</p>
              <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Sua opinião importa</p>
            </div>
          </div>

          <div className="space-y-4 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-white/40">Sua nota</p>
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setRating(s)} className="transition-transform hover:scale-125 active:scale-95">
                  <Star className={`size-8 transition-colors ${s <= rating ? "fill-[#ea3372] text-[#ea3372] drop-shadow-[0_0_10px_rgba(234,51,114,0.4)]" : "text-white/10 hover:text-white/30"}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 px-1">Seu comentário</label>
            <textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="O que você achou da qualidade, conforto e estilo?"
              className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea3372]/50 transition-all resize-none"
            />
          </div>

          <Button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-14 bg-[#ea3372] hover:bg-[#c9295f] text-white font-black italic uppercase tracking-widest rounded-2xl shadow-lg shadow-[#ea3372]/20"
          >
            {loading ? "Enviando..." : "Publicar Avaliação"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function ShippingCalculator({ product }: { product: any }) {
  const [cep, setCep] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchShipping = useAction(api.melhorenvio.calculateShipping);

  const handleCalculate = async () => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) {
      toast.error("CEP inválido");
      return;
    }

    setLoading(true);
    try {
      const quotes = await fetchShipping({
        zip: cleanCep,
        items: [{ productId: product._id, quantity: 1 }]
      });
      setResults(quotes);
      if (quotes.length === 0) toast.error("Nenhuma transportadora disponível para este CEP.");
    } catch (e) {
      toast.error("Erro ao calcular frete");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Input
          placeholder="00000-000"
          value={cep}
          onChange={(e) => setCep(e.target.value)}
          maxLength={9}
          className="bg-white border-black/5 h-12 rounded-2xl text-xs font-bold tracking-widest focus:border-[#ad2335]/40 text-[#660e14] max-w-[180px]"
        />
        <Button
          onClick={handleCalculate}
          disabled={loading}
          className="bg-[#660e14] hover:bg-[#ad2335] text-white h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : "Calcular"}
        </Button>
      </div>

      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-2 pt-2"
          >
            {results.map((res, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/60 border border-black/5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Truck className="size-4 text-[#ad2335]" />
                  <div>
                    <p className="text-[10px] font-black uppercase text-[#660e14]">{res.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Clock className="size-3 text-[#660e14]/40" />
                      <p className="text-[9px] font-bold text-[#660e14]/40 uppercase">Até {res.delivery_time} dias úteis</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs font-black text-[#ad2335]">{formatPrice(res.price)}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  );
}
