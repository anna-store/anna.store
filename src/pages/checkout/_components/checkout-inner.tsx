import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAction, useQuery } from "convex/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  ShieldCheck,
  ChevronRight,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { api } from "@/convex/_generated/api.js";
import { useAuth } from "@/hooks/use-auth.ts";
import { useCartStore } from "@/hooks/use-cart.ts";
import { formatPrice } from "@/lib/products-data.ts";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { toast } from "sonner";
import { cn } from "@/lib/utils.ts";
import { ConvexError } from "convex/values";

// ─── Schema ────────────────────────────────────────────────────────────────
const addressSchema = z.object({
  street: z.string().min(3, "Rua é obrigatória"),
  number: z.string().min(1, "Número é obrigatório"),
  neighborhood: z.string().min(2, "Bairro é obrigatório"),
  complement: z.string().optional(),
  city: z.string().min(2, "Cidade inválida"),
  state: z.string().min(2, "Estado inválido").max(2, "Use a sigla (ex: SP)"),
  zip: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido (ex: 01310-100)"),
});

type AddressForm = z.infer<typeof addressSchema>;

// ─── Component ─────────────────────────────────────────────────────────────
export default function CheckoutInner() {
  const navigate = useNavigate();
  const { user: localUser } = useAuth();
  const { items, clearCart, getTotal, getDiscount, getFinalTotal, appliedCoupon } = useCartStore();
  const currentUser = useQuery(api.users.getCurrentUser, { userId: localUser?._id });
  const createPreference = useAction(api.mercadopago.createPreference);

  const [step, setStep] = useState<"address" | "confirm">("address");
  const [submitting, setSubmitting] = useState(false);
  const [shipping, setShipping] = useState<number | null>(null);

  // Pricing
  const subtotal = getTotal();
  const discount = getDiscount();
  const hasShipping = shipping !== null;
  const effectiveShipping = appliedCoupon?.freeShipping ? 0 : shipping;
  const total = getFinalTotal() + (effectiveShipping ?? 0);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressForm>({ resolver: zodResolver(addressSchema) });

  const zipValue = watch("zip");

  const calculateShipping = (state: string) => {
    const uf = state.toUpperCase();
    let value = 19.90;
    if (["SP", "RJ", "MG", "ES"].includes(uf)) value = 15.00;
    else if (["PR", "SC", "RS"].includes(uf)) value = 22.00;
    else if (["DF", "GO", "MS", "MT"].includes(uf)) value = 28.00;
    else if (["BA", "PE", "CE", "RN", "PB", "AL", "SE", "MA", "PI"].includes(uf)) value = 35.00;
    else if (["AM", "PA", "AC", "RO", "RR", "AP", "TO"].includes(uf)) value = 45.00;
    setShipping(value);
  };

  const handleZipLookup = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setValue("street", data.logradouro);
          setValue("city", data.localidade);
          setValue("state", data.uf);
          calculateShipping(data.uf);
          toast.success("Endereço preenchido!");
        }
      } catch (e) {}
    }
  };

  // Trigger lookup
  useEffect(() => {
    const clean = zipValue?.replace(/\D/g, "") || "";
    if (clean.length === 8) handleZipLookup(clean);
  }, [zipValue]);

  // Pre-fill from user profile
  useEffect(() => {
    if (currentUser) {
      if (currentUser.street) setValue("street", currentUser.street);
      if (currentUser.number) setValue("number", currentUser.number);
      if (currentUser.neighborhood) setValue("neighborhood", currentUser.neighborhood);
      if (currentUser.complement) setValue("complement", currentUser.complement);
      if (currentUser.city) setValue("city", currentUser.city);
      if (currentUser.state) {
        setValue("state", currentUser.state);
        calculateShipping(currentUser.state);
      }
      if (currentUser.zip) setValue("zip", currentUser.zip);
    }
  }, [currentUser, setValue]);

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-muted-foreground">Seu carrinho está vazio.</p>
        <Button asChild>
          <Link to="/catalogo">Explorar produtos</Link>
        </Button>
      </div>
    );
  }

  const onAddressSubmit = () => {
    setStep("confirm");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onPay = async () => {
    setSubmitting(true);
    if (!currentUser?._id) {
      toast.error("Usuário não carregado. Tente novamente em instantes.");
      setSubmitting(false);
      return;
    }

    const address = getValues();
    try {
      const appUrl = window.location.origin;
      const { initPoint } = await createPreference({
        userId: currentUser._id,
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          image: i.image,
          price: i.price,
          quantity: i.quantity,
        })),
        subtotal,
        discount,
        shipping: effectiveShipping,
        total,
        couponCode: appliedCoupon?.code,
        address: {
          street: address.street,
          city: address.city,
          state: address.state.toUpperCase(),
          zip: address.zip,
        },
        appUrl,
      });
      // Clear cart ONLY after successful return (to be implemented in success page)
      // clearCart(); 
      window.location.href = initPoint;
    } catch (err) {
      if (err instanceof ConvexError) {
        const data = err.data as { message?: string; code?: string };
        if (data.code === "BAD_REQUEST" && data.message?.includes("MERCADOPAGO_ACCESS_TOKEN")) {
          toast.error("Mercado Pago não configurado. Adicione a secret MERCADOPAGO_ACCESS_TOKEN no painel.");
        } else {
          toast.error(data.message ?? "Erro ao iniciar pagamento");
        }
      } else {
        toast.error("Erro ao conectar com Mercado Pago. Tente novamente.");
      }
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer"
          onClick={() => step === "confirm" ? setStep("address") : navigate("/carrinho")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-black">Finalizar Compra</h1>
          <p className="text-sm text-muted-foreground">
            {step === "address" ? "Passo 1 de 2 — Endereço de entrega" : "Passo 2 de 2 — Confirmar pedido"}
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {(["address", "confirm"] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
              step === s || (s === "address" && step === "confirm")
                ? "bg-[#ea3372] text-white"
                : "bg-muted text-muted-foreground"
            )}>
              {i + 1}
            </div>
            <span className={cn(
              "text-sm font-medium hidden sm:block",
              step === s ? "text-foreground" : "text-muted-foreground"
            )}>
              {s === "address" ? "Endereço" : "Confirmar"}
            </span>
            {i < 1 && <div className="h-px w-8 bg-border mx-1" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* ── Left: Steps ── */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {/* Step 1: Address */}
            {step === "address" && (
              <motion.div
                key="address"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <MapPin className="h-5 w-5 text-[#ea3372]" />
                      Endereço de Entrega
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit(onAddressSubmit)} className="space-y-4">
                      {currentUser && (
                        <div className="bg-muted/50 rounded-lg px-4 py-3 text-sm text-muted-foreground">
                          Entregando para:{" "}
                          <span className="font-semibold text-foreground">
                            {currentUser.name ?? currentUser.email}
                          </span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="sm:col-span-3 space-y-1">
                          <Label htmlFor="street">Rua</Label>
                          <Input
                            id="street"
                            {...register("street")}
                            placeholder="Rua das Flores"
                            className={errors.street ? "border-destructive" : ""}
                          />
                          {errors.street && <p className="text-xs text-destructive">{errors.street.message}</p>}
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="number">Número</Label>
                          <Input
                            id="number"
                            {...register("number")}
                            placeholder="123"
                            className={errors.number ? "border-destructive" : ""}
                          />
                          {errors.number && <p className="text-xs text-destructive">{errors.number.message}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label htmlFor="neighborhood">Bairro</Label>
                          <Input
                            id="neighborhood"
                            {...register("neighborhood")}
                            placeholder="Seu bairro"
                            className={errors.neighborhood ? "border-destructive" : ""}
                          />
                          {errors.neighborhood && <p className="text-xs text-destructive">{errors.neighborhood.message}</p>}
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="complement">Complemento (opcional)</Label>
                          <Input
                            id="complement"
                            {...register("complement")}
                            placeholder="Apto, Bloco, etc."
                            className={errors.complement ? "border-destructive" : ""}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label htmlFor="city">Cidade</Label>
                          <Input
                            id="city"
                            {...register("city")}
                            placeholder="São Paulo"
                            className={errors.city ? "border-destructive" : ""}
                          />
                          {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="state">Estado (sigla)</Label>
                          <Input
                            id="state"
                            {...register("state")}
                            placeholder="SP"
                            maxLength={2}
                            className={cn("uppercase", errors.state ? "border-destructive" : "")}
                          />
                          {errors.state && <p className="text-xs text-destructive">{errors.state.message}</p>}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="zip">CEP</Label>
                        <Input
                          id="zip"
                          {...register("zip")}
                          placeholder="01310-100"
                          className={cn("max-w-xs", errors.zip ? "border-destructive" : "")}
                        />
                        {errors.zip && <p className="text-xs text-destructive">{errors.zip.message}</p>}
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 bg-[#ea3372] hover:bg-[#c9295f] text-white font-bold cursor-pointer mt-2"
                      >
                        Continuar para Pagamento
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Confirm + Pay */}
            {step === "confirm" && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Address summary */}
                <Card>
                  <CardContent className="py-4 flex items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-[#ea3372] mt-0.5 shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium">{getValues("street")}, {getValues("number")}</p>
                        <p className="text-muted-foreground">
                          {getValues("neighborhood")}{getValues("complement") ? ` — ${getValues("complement")}` : ""}
                        </p>
                        <p className="text-muted-foreground">
                          {getValues("city")}, {getValues("state").toUpperCase()} — {getValues("zip")}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#38b6ff] cursor-pointer shrink-0"
                      onClick={() => setStep("address")}
                    >
                      Editar
                    </Button>
                  </CardContent>
                </Card>

                {/* MP payment info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <CreditCard className="h-5 w-5 text-[#ea3372]" />
                      Pagamento via Mercado Pago
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-[#009ee3]/5 border border-[#009ee3]/20 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        {/* MP logo */}
                        <div className="h-10 w-10 rounded-lg bg-[#009ee3] flex items-center justify-center shrink-0">
                          <span className="text-white font-black text-xs">MP</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold">Checkout Mercado Pago</p>
                          <p className="text-xs text-muted-foreground">
                            PIX, Boleto, Cartão de Crédito/Débito e mais
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Você será redirecionado para o ambiente seguro do Mercado Pago para escolher sua forma de
                        pagamento e concluir a compra.
                      </p>
                    </div>


                  </CardContent>
                </Card>

                <Button
                  className="w-full h-12 bg-[#009ee3] hover:bg-[#0082c8] text-white font-bold cursor-pointer gap-2"
                  onClick={onPay}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Aguarde...
                    </>
                  ) : (
                    <>
                      Pagar {formatPrice(total)} com Mercado Pago
                      <ExternalLink className="h-4 w-4" />
                    </>
                  )}
                </Button>


              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right: Order Summary ── */}
        <div>
          <div className="sticky top-24">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.size}-${item.color}`}
                      className="flex gap-3 items-center"
                    >
                      <div className="h-14 w-14 rounded-lg overflow-hidden bg-muted shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium line-clamp-1">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Nº {item.size} · Qtd {item.quantity}
                        </p>
                      </div>
                      <p className="text-xs font-semibold shrink-0">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Pricing */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Desconto {appliedCoupon?.code ? `(${appliedCoupon.code})` : ""}</span>
                      <span>- {formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frete</span>
                    <span className={cn(
                      effectiveShipping === 0 && hasShipping ? "text-green-600 font-bold" : "",
                      !hasShipping && !appliedCoupon?.freeShipping ? "text-muted-foreground italic text-[10px]" : ""
                    )}>
                      {appliedCoupon?.freeShipping 
                        ? "Grátis" 
                        : hasShipping 
                          ? formatPrice(effectiveShipping) 
                          : "A calcular"}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-black text-lg">
                  <span>Total</span>
                  <span className="text-[#ea3372]">
                    {hasShipping || appliedCoupon?.freeShipping ? formatPrice(total) : "—"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
