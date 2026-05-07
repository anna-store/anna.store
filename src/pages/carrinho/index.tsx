import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
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
import { useCartStore } from "@/hooks/use-cart.ts";
import { formatPrice } from "@/lib/products-data.ts";
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
    removeCoupon 
  } = useCartStore();
  const navigate = useNavigate();
  const convex = useConvex();
  const [isApplying, setIsApplying] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");

  const subtotal = getTotal();
  const discount = getDiscount();
  const isFreeShipping = appliedCoupon?.freeShipping === true;
  const shipping = isFreeShipping ? 0 : 19.90; 
  const total = getFinalTotal() + shipping;

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
      <div className="max-w-7xl mx-auto px-4 py-16">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ShoppingBag />
            </EmptyMedia>
            <EmptyTitle>Seu carrinho está vazio</EmptyTitle>
            <EmptyDescription>
              Adicione produtos ao carrinho para continuar comprando.
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
      </div>
    );
  }

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
          <h1 className="text-2xl font-black">Carrinho</h1>
          <p className="text-sm text-muted-foreground">{items.length} {items.length === 1 ? "item" : "itens"}</p>
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
                className="flex gap-4 bg-card border border-border rounded-xl p-4"
              >
                {/* Image */}
                <Link to={`/produto/${item.productId}`} className="shrink-0">
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted">
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
                    <h3 className="font-semibold text-sm hover:text-[#ea3372] transition-colors line-clamp-2">
                      {item.name}
                    </h3>
                  </Link>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">Nº {item.size}</Badge>
                    <Badge variant="secondary" className="text-xs">{item.color}</Badge>
                  </div>

                  <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                    {/* Quantity */}
                    <div className="flex items-center border border-border rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm">{formatPrice(item.price * item.quantity)}</span>
                      <button
                        onClick={() => {
                          removeItem(item.productId, item.size, item.color);
                          toast("Item removido do carrinho");
                        }}
                        className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <button
            onClick={() => { clearCart(); toast("Carrinho limpo"); }}
            className="text-sm text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
          >
            Limpar carrinho
          </button>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 space-y-4 sticky top-24">
            <h2 className="font-bold text-base">Resumo do Pedido</h2>
            <Separator />

            {/* Coupon */}
            <div>
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <Tag className="h-4 w-4 text-[#ea3372]" />
                Cupom de desconto
              </p>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <span className="text-sm font-semibold text-green-700">{appliedCoupon.code} aplicado!</span>
                  <button onClick={handleRemoveCoupon} className="text-xs text-muted-foreground hover:text-destructive cursor-pointer">
                    Remover
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={couponInput}
                    onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }}
                    placeholder="Digite o cupom"
                    className="text-sm h-9"
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                  />
                  <Button 
                    size="sm" 
                    onClick={handleApplyCoupon} 
                    disabled={isApplying}
                    className="bg-[#0b0b0b] hover:bg-[#333] text-white cursor-pointer h-9"
                  >
                    {isApplying ? "..." : "Aplicar"}
                  </Button>
                </div>
              )}
              {couponError && <p className="text-xs text-destructive mt-1">{couponError}</p>}
              <p className="text-xs text-muted-foreground mt-1">Tente: QUERO10</p>
            </div>

            <Separator />

            {/* Prices */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && appliedCoupon && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto ({appliedCoupon.code})</span>
                  <span>- {formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frete</span>
                <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
                  {shipping === 0 ? "Grátis" : formatPrice(shipping)}
                </span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between font-black text-lg">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <p className="text-xs text-muted-foreground -mt-2">
              ou 3x de {formatPrice(total / 3)} sem juros
            </p>

            <Button
              className="w-full h-12 bg-[#ea3372] hover:bg-[#c9295f] text-white font-bold cursor-pointer"
              onClick={() => navigate("/checkout")}
            >
              Finalizar Compra
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>

            <Link to="/catalogo" className="block text-center text-sm text-[#38b6ff] hover:underline">
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
  );
}
