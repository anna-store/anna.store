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
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { toast } from "sonner";
import ProductCard from "@/components/ProductCard.tsx";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import {
  formatPrice,
  getDiscount,
} from "@/lib/products-data.ts";
import { useCartStore } from "@/hooks/use-cart.ts";
import { useWishlistStore } from "@/hooks/use-wishlist.ts";

const FAKE_REVIEWS = [
  { name: "Mariana S.", rating: 5, date: "15/04/2025", comment: "Produto incrível! Chegou rápido e a qualidade é excelente. Muito feliz com a compra.", size: "38" },
  { name: "Lucas R.", rating: 4, date: "02/04/2025", comment: "Ótimo custo-benefício. O material é resistente e confortável para o dia a dia.", size: "42" },
  { name: "Fernanda M.", rating: 5, date: "28/03/2025", comment: "Amei! Exatamente como na foto. Já é o terceiro tênis que compro aqui.", size: "36" },
];

export default function ProdutoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = useQuery(api.products.getById, { productId: id as Id<"products"> });
  const allProducts = useQuery(api.products.getAll) || [];

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const { addItem } = useCartStore();
  const { toggle, has } = useWishlistStore();

  if (product === undefined) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="size-12 rounded-full border-4 border-[#ea3372] border-t-transparent animate-spin" />
        <p className="text-sm font-medium text-white/40 uppercase tracking-widest">Carregando Produto...</p>
      </div>
    );
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

  const isWishlisted = has(product._id as any);
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
    if (!selectedColor) {
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
    if (!selectedColor) { toast.error("Selecione uma cor"); return; }
    handleAddToCart();
    navigate("/carrinho");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      {/* Breadcrumb */}
      <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-1 flex-wrap">
        <Link to="/" className="hover:text-[#ea3372]">Início</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/catalogo" className="hover:text-[#ea3372]">Catálogo</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to={`/catalogo?categoria=${encodeURIComponent(product.category)}`} className="hover:text-[#ea3372]">
          {product.category}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground truncate max-w-32">{product.name}</span>
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
              <Badge className="absolute top-4 left-4 bg-[#ea3372] text-white text-sm border-0 px-3 py-1">
                -{discount}% OFF
              </Badge>
            )}
            {product.isNew && (
              <Badge className="absolute top-4 right-4 bg-[#38b6ff] text-white border-0 px-3 py-1">
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
                    selectedImage === i ? "border-[#ea3372]" : "border-border hover:border-[#ea3372]/50"
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
            <span className="text-sm font-semibold text-[#38b6ff] uppercase tracking-widest">
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
            <h1 className="text-3xl font-black text-foreground leading-tight">{product.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{product.category}</p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-4 w-4"
                  fill={i < Math.floor(product.rating) ? "#ea3372" : "none"}
                  stroke={i < Math.floor(product.rating) ? "#ea3372" : "#ccc"}
                />
              ))}
            </div>
            <span className="text-sm font-semibold">{product.rating}</span>
            <span className="text-sm text-muted-foreground">({product.reviews} avaliações)</span>
          </div>

          {/* Price */}
          <div className="bg-muted rounded-xl p-4">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-foreground">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {discount > 0 && (
                <Badge className="bg-[#ea3372] text-white border-0">-{discount}%</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              ou <strong>3x de {formatPrice(product.price / 3)}</strong> sem juros no cartão
            </p>
            <p className="text-sm text-green-600 font-medium mt-1">
              💳 PIX: {formatPrice(product.price * 0.95)} (5% de desconto)
            </p>
          </div>

          {/* Color selector */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold">Cor</span>
              {selectedColor && <span className="text-sm text-muted-foreground">{selectedColor}</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all cursor-pointer ${
                    selectedColor === color
                      ? "border-[#ea3372] bg-[#ea3372]/5 text-[#ea3372]"
                      : "border-border hover:border-[#ea3372]/50 text-foreground"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Size selector */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold">Tamanho</span>
              <button className="text-xs text-[#38b6ff] hover:underline cursor-pointer">Guia de tamanhos</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-12 h-12 rounded-xl border-2 text-sm font-semibold transition-all cursor-pointer ${
                    selectedSize === size
                      ? "border-[#ea3372] bg-[#ea3372] text-white"
                      : "border-border hover:border-[#ea3372] text-foreground"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold">Quantidade</span>
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center text-sm font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleAddToCart}
              className={`flex-1 h-12 font-bold cursor-pointer transition-all ${
                addedToCart
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-[#0b0b0b] hover:bg-[#222] text-white"
              }`}
            >
              <AnimatePresence mode="wait">
                {addedToCart ? (
                  <motion.span key="added" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" /> Adicionado!
                  </motion.span>
                ) : (
                  <motion.span key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" /> Adicionar ao Carrinho
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
            <Button
              onClick={handleBuyNow}
              className="flex-1 h-12 bg-[#ea3372] hover:bg-[#c9295f] text-white font-bold cursor-pointer"
            >
              Comprar Agora
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => { toggle(product._id as any); toast(isWishlisted ? "Removido dos favoritos" : "Adicionado aos favoritos!"); }}
              className={`h-12 w-12 cursor-pointer ${isWishlisted ? "bg-[#ea3372] text-white hover:bg-[#c9295f]" : ""}`}
            >
              <Heart className="h-5 w-5" fill={isWishlisted ? "currentColor" : "none"} />
            </Button>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: Truck, label: "Entrega rápida", desc: "em todo Brasil" },
              { icon: RotateCcw, label: "Troca fácil", desc: "até 7 dias" },
              { icon: Shield, label: "Compra segura", desc: "100% protegida" },
            ].map((b) => (
              <div key={b.label} className="text-center p-3 bg-muted rounded-xl">
                <b.icon className="h-5 w-5 mx-auto mb-1 text-[#ea3372]" />
                <p className="text-xs font-semibold text-foreground">{b.label}</p>
                <p className="text-[10px] text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description & Reviews tabs */}
      <div className="mb-16">
        <ProductTabs product={product} />
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div>
          <h2 className="text-2xl font-black mb-6">Produtos Relacionados</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProductTabs({ product }: { product: any }) {
  const [tab, setTab] = useState<"desc" | "reviews" | "shipping">("desc");

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
            className={`pb-3 text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px ${
              tab === t.id
                ? "border-[#ea3372] text-[#ea3372]"
                : "border-transparent text-muted-foreground hover:text-foreground"
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
                <div className="bg-muted rounded-xl p-4">
                  <h4 className="font-semibold mb-3 text-sm">Especificações</h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between"><dt className="text-muted-foreground">Marca</dt><dd className="font-medium">{product.brand}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">Categoria</dt><dd className="font-medium">{product.category}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">Tamanhos</dt><dd className="font-medium">{product.sizes[0]} – {product.sizes[product.sizes.length - 1]}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">Disponível</dt><dd className="text-green-600 font-medium">Em estoque</dd></div>
                  </dl>
                </div>
                <div className="bg-muted rounded-xl p-4">
                  <h4 className="font-semibold mb-3 text-sm">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {tab === "reviews" && (
            <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Summary */}
              <div className="flex items-center gap-6 bg-muted rounded-xl p-4 mb-6">
                <div className="text-center">
                  <p className="text-4xl font-black text-foreground">{product.rating}</p>
                  <div className="flex justify-center my-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4" fill={i < Math.floor(product.rating) ? "#ea3372" : "none"} stroke={i < Math.floor(product.rating) ? "#ea3372" : "#ccc"} />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">{product.reviews} avaliações</p>
                </div>
                <Separator orientation="vertical" className="h-16" />
                <div className="flex-1 space-y-1">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const pct = star === 5 ? 72 : star === 4 ? 18 : star === 3 ? 7 : star === 2 ? 2 : 1;
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-4">{star}</span>
                        <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                          <div className="h-full bg-[#ea3372] rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground w-6">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {FAKE_REVIEWS.map((r, i) => (
                <div key={i} className="border border-border rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-sm">{r.name}</p>
                      <p className="text-xs text-muted-foreground">Tamanho: {r.size} • {r.date}</p>
                    </div>
                    <div className="flex">
                      {Array.from({ length: r.rating }).map((_, j) => (
                        <Star key={j} className="h-3 w-3 fill-[#ea3372] text-[#ea3372]" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{r.comment}</p>
                </div>
              ))}
            </motion.div>
          )}
          {tab === "shipping" && (
            <motion.div key="shipping" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              {[
                { icon: Truck, title: "Envio para todo o Brasil", desc: "Entregamos em todas as regiões do país. Prazo varia de acordo com a localidade.", color: "#38b6ff" },
                { icon: RotateCcw, title: "Política de trocas e devoluções", desc: "Você tem 7 dias para solicitar troca ou devolução após o recebimento do produto.", color: "#ea3372" },
                { icon: Shield, title: "Compra 100% segura", desc: "Todos os pagamentos são processados com criptografia e proteção total.", color: "#38b6ff" },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 p-4 bg-muted rounded-xl">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${item.color}20` }}>
                    <item.icon className="h-5 w-5" style={{ color: item.color }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{item.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
