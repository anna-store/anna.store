import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  ChevronRight,
  ArrowLeft,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { toast } from "sonner";
import { useConvex } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { useCartStore, FREE_SHIPPING_THRESHOLD } from "@/hooks/use-cart.ts";
import { formatPrice } from "@/lib/products-data.ts";
import { cn } from "@/lib/utils.ts";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty.tsx";



export default function CarrinhoPage() {
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    getTotal, 
    getDiscount, 
    getFinalTotal, 
    appliedCoupon, 
    applyCoupon,
    applyRawCoupon,
    removeCoupon,
    isFreeShipping
  } = useCartStore();
  const navigate = useNavigate();
  const convex = useConvex();
  const [isApplying, setIsApplying] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");

  const subtotal = getTotal();
  const discount = getDiscount();
  const freeShippingActive = isFreeShipping();
  const shipping = freeShippingActive ? 0 : null; 
  const total = getFinalTotal() + (shipping ?? 0);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    
    setIsApplying(true);
    setCouponError("");
    
    try {
      const coupon = await convex.query(api.coupons.validate, { code: couponInput });
      
      if (!coupon) {
        setCouponError("Cupom inválido ou expirado.");
      } else if (subtotal < coupon.minOrderValue) {
        setCouponError(`Compra mínima para este cupom: ${formatPrice(coupon.minOrderValue)}`);
      } else {
        applyRawCoupon(coupon);
        setCouponInput("");
        toast.success(`Cupom ${coupon.code} aplicado!`);
      }
    } catch (err) {
      setCouponError("Erro ao validar cupom.");
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponInput("");
    toast("Cupom removido");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#fdf0e3]">
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon" className="bg-[#660e14]/5 text-[#660e14]">
                <ShoppingBag className="h-10 w-10" />
              </EmptyMedia>
              <EmptyTitle className="text-4xl font-normal text-[#660e14]" style={{ fontFamily: "'Last Dream', cursive" }}>Seu carrinho está vazio</EmptyTitle>
              <EmptyDescription className="text-[#660e14]/40 font-black uppercase tracking-widest text-[10px]">
                Adicione produtos ao carrinho para continuar comprando.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                className="bg-[#ad2335] hover:bg-[#8b1c2b] text-white font-black uppercase tracking-widest text-xs h-12 px-10 rounded-2xl shadow-xl shadow-[#ad2335]/20 cursor-pointer"
                onClick={() => navigate("/catalogo")}
              >
                Explorar Coleção
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf0e3]">
      <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-6 mb-12">
        <Link to="/catalogo">
          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-white/50 border border-black/5 text-[#660e14] hover:bg-white cursor-pointer shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-6xl font-normal text-[#660e14] leading-[0.8]" style={{ fontFamily: "'Last Dream', cursive" }}>Carrinho</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#660e14]/30 mt-1">{items.length} {items.length === 1 ? "Peça Encontrada" : "Peças Encontradas"}</p>
        </div>
      </div>



      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={`${item.productId}-${item.size}-${item.color}`}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, height: 0 }}
                transition={{ duration: 0.25 }}
                className="flex gap-6 bg-white/40 backdrop-blur-md border border-black/5 rounded-[32px] p-5 shadow-sm"
              >
                {/* Image */}
                <Link to={`/produto/${item.productId}`} className="shrink-0">
                  <div className="w-28 h-28 rounded-2xl overflow-hidden bg-[#660e14]/5 border border-black/5">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link to={`/produto/${item.productId}`}>
                    <h3 className="font-bold text-[#660e14] text-lg hover:text-[#ad2335] transition-colors line-clamp-2 leading-tight">
                      {item.name}
                    </h3>
                  </Link>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge className="bg-[#660e14]/5 text-[#660e14] border-0 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">Nº {item.size}</Badge>
                    <Badge className="bg-[#660e14]/5 text-[#660e14] border-0 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">{item.color}</Badge>
                  </div>

                  <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                    {/* Quantity */}
                    <div className="flex items-center border-2 border-black/5 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm shadow-sm">
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                        className="w-10 h-10 flex items-center justify-center hover:bg-[#660e14]/5 text-[#660e14] transition-all cursor-pointer"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-10 text-center text-sm font-black text-[#660e14]">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center hover:bg-[#660e14]/5 text-[#660e14] transition-all cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-5">
                      <span className="font-black text-[#660e14] text-xl tracking-tighter">{formatPrice(item.price * item.quantity)}</span>
                      <button
                        onClick={() => {
                          removeItem(item.productId, item.size, item.color);
                          toast.error("Item removido");
                        }}
                        className="h-10 w-10 flex items-center justify-center rounded-xl text-[#660e14]/20 hover:text-[#ad2335] hover:bg-[#ad2335]/5 transition-all cursor-pointer"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <button
            onClick={() => { clearCart(); toast.error("Carrinho esvaziado"); }}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-[#660e14]/30 hover:text-[#ad2335] transition-all cursor-pointer flex items-center gap-2 pl-4"
          >
            <X className="h-3 w-3" /> Limpar tudo
          </button>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="bg-white/40 backdrop-blur-md border border-black/5 rounded-[32px] p-6 space-y-6 sticky top-24 shadow-sm">
            <h2 className="font-black uppercase tracking-[0.2em] text-xs text-[#660e14]">Resumo do Pedido</h2>
            <Separator className="bg-black/5" />

            {/* Free Shipping Progress */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[#660e14]">
                <span>Frete Grátis</span>
                <span className={freeShippingActive ? "text-green-600" : "text-[#ad2335]"}>
                  {freeShippingActive ? "Alcançado!" : `Faltam ${formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)}`}
                </span>
              </div>
              <div className="h-2 bg-black/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                  className={cn(
                    "h-full transition-all duration-500",
                    freeShippingActive ? "bg-green-500" : "bg-[#ad2335]"
                  )}
                />
              </div>
              {!freeShippingActive && (
                <p className="text-[9px] font-bold text-[#660e14]/40 uppercase tracking-widest text-center">
                  Adicione mais itens para ganhar frete grátis!
                </p>
              )}
            </div>

            <Separator className="bg-black/5" />

            {/* Coupon */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-[#660e14]">
                <Tag className="h-3 w-3 text-[#ad2335]" />
                Cupom de desconto
              </p>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-500/5 border border-green-500/20 rounded-2xl px-4 py-3">
                  <span className="text-xs font-black uppercase tracking-widest text-green-700">{appliedCoupon.code} aplicado!</span>
                  <button onClick={handleRemoveCoupon} className="text-[10px] font-black uppercase tracking-widest text-[#660e14]/30 hover:text-[#ad2335] cursor-pointer">
                    Remover
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={couponInput}
                    onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }}
                    placeholder="DIGITE O CUPOM"
                    className="text-[11px] h-10 bg-white/60 border-black/5 rounded-xl text-[#660e14] font-black uppercase tracking-[0.2em] placeholder:text-[#660e14]/20"
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                  />
                  <Button 
                    size="sm" 
                    onClick={handleApplyCoupon} 
                    disabled={isApplying}
                    className="bg-[#660e14] hover:bg-[#4d0a0f] text-white font-black uppercase tracking-widest text-[10px] h-9 px-4 rounded-xl cursor-pointer"
                  >
                    {isApplying ? "..." : "Aplicar"}
                  </Button>
                </div>
              )}
              {couponError && <p className="text-[10px] font-bold text-[#ad2335] mt-2 uppercase tracking-widest">{couponError}</p>}
            </div>

            <Separator />

            {/* Prices */}
            <div className="space-y-3 text-xs font-bold text-[#660e14]">
              <div className="flex justify-between">
                <span className="text-[#660e14]/40 uppercase tracking-widest">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && appliedCoupon && (
                <div className="flex justify-between text-green-600 uppercase tracking-widest">
                  <span>Desconto ({appliedCoupon.code})</span>
                  <span>- {formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between uppercase tracking-widest">
                <span className="text-[#660e14]/40">Frete</span>
                <span className={shipping === 0 ? "text-green-600 font-black" : "text-[#660e14]/20 italic"}>
                  {shipping === 0 ? "Grátis" : shipping === null ? "A calcular" : formatPrice(shipping)}
                </span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between font-black text-2xl text-[#660e14] tracking-tighter">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <p className="text-[10px] font-bold text-[#660e14]/30 -mt-4 uppercase tracking-widest">
              ou 3x de {formatPrice(total / 3)} sem juros
            </p>

            <Button
              className="w-full h-14 bg-[#ad2335] hover:bg-[#8b1c2b] text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl shadow-[#ad2335]/20 cursor-pointer"
              onClick={() => navigate("/checkout")}
            >
              Finalizar Compra
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>

            <Link to="/catalogo" className="block text-center text-[10px] font-black uppercase tracking-widest text-[#660e14]/40 hover:text-[#660e14] transition-all">
              Continuar comprando
            </Link>

            {/* Payment methods */}
            <div className="flex justify-center gap-2 pt-2">
              {["PIX", "Boleto", "Visa", "Master", "Elo"].map((m) => (
                <span key={m} className="bg-muted text-muted-foreground text-[10px] px-2 py-1 rounded">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
