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
  ExternalLink,
  Truck,
  Clock,
  CheckCircle2,
  Loader2,
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
  document: z.string().min(11, "CPF ou CNPJ inválido").max(18, "CPF ou CNPJ inválido"),
});

type AddressForm = z.infer<typeof addressSchema>;

// ─── Component ─────────────────────────────────────────────────────────────
export default function CheckoutInner() {
  const navigate = useNavigate();
  const { user: localUser } = useAuth();
  const { items, clearCart, getTotal, getDiscount, getFinalTotal, appliedCoupon, isFreeShipping } = useCartStore();
  const currentUser = useQuery(api.users.getCurrentUser, { userId: localUser?._id });
  const createPreference = useAction(api.mercadopago.createPreference);

  const [step, setStep] = useState<"address" | "confirm">("address");
  const [submitting, setSubmitting] = useState(false);
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<any>(null);
  const [calculatingShipping, setCalculatingShipping] = useState(false);

  const fetchShipping = useAction(api.melhorenvio.calculateShipping);

  // Pricing
  const subtotal = getTotal();
  const discount = getDiscount();
  const freeShippingActive = isFreeShipping();
  const shippingPrice = selectedShipping?.price ?? 0;
  const effectiveShipping = freeShippingActive ? 0 : shippingPrice;
  const hasShipping = !!selectedShipping;
  const total = getFinalTotal() + effectiveShipping;

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressForm>({ 
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street: "",
      number: "",
      neighborhood: "",
      complement: "",
      city: "",
      state: "",
      zip: "",
      document: "",
    }
  });

  const zipValue = watch("zip");



  const handleZipLookup = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      console.log("Iniciando busca para CEP:", cleanCep);
      setCalculatingShipping(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        console.log("Dados do ViaCEP:", data);
        if (!data.erro) {
          setValue("street", data.logradouro);
          setValue("city", data.localidade);
          setValue("state", data.uf);
          
          // Melhor Envio Quote
          console.log("Buscando cotação Melhor Envio...");
          const quotes = await fetchShipping({
            zip: cleanCep,
            items: items.map(i => ({ productId: i.productId as any, quantity: i.quantity }))
          });
          console.log("Cotações recebidas:", quotes);
          setShippingOptions(quotes);
          
          // Se tiver frete grátis (por cupom ou por valor), seleciona o primeiro automaticamente
          if (quotes.length > 0) {
            if (freeShippingActive) {
              setSelectedShipping(quotes[0]);
            } else {
              setSelectedShipping(null); // Reseta para forçar escolha
            }
          }
          
          toast.success("Endereço carregado!");
        }
      } catch (e) {
        console.error("Erro no checkout:", e);
        toast.error("Erro ao calcular frete. Tente novamente.");
      } finally {
        setCalculatingShipping(false);
      }
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
      if (currentUser.state) setValue("state", currentUser.state);
      if (currentUser.document) setValue("document", currentUser.document);
      if (currentUser.zip) {
        setValue("zip", currentUser.zip);
        // Dispara cotação automática do Melhor Envio com o CEP do perfil
        handleZipLookup(currentUser.zip.replace(/\D/g, ""));
      }
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
    console.log("Valores para pagamento:", {
      subtotal,
      discount,
      effectiveShipping,
      total,
      hasFreeShipping: appliedCoupon?.freeShipping
    });
    try {
      // 1. Atualiza o perfil do usuário com os dados do checkout
      await updateProfile({
        userId: currentUser._id,
        street: address.street,
        number: address.number,
        neighborhood: address.neighborhood,
        complement: address.complement,
        city: address.city,
        state: address.state,
        zip: address.zip,
        document: address.document,
      });

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
        shippingServiceId: selectedShipping?.id,
        shippingServiceName: selectedShipping?.name,
        total,
        couponCode: appliedCoupon?.code,
        address: {
          street: address.street,
          number: address.number,
          neighborhood: address.neighborhood,
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
    <div className="min-h-screen bg-[#fdf0e3] pb-20">
      <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer hover:bg-[#660e14]/5 text-[#660e14] rounded-full"
          onClick={() => step === "confirm" ? setStep("address") : navigate("/carrinho")}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div>
          <h1 className="text-5xl md:text-6xl font-normal text-[#660e14] tracking-tight" style={{ fontFamily: "'Glamour Absolute', cursive" }}>
            Finalizar Compra
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#660e14]/40 mt-1 ml-1">
            {step === "address" ? "Passo 1 de 2 — Endereço de entrega" : "Passo 2 de 2 — Confirmar pedido"}
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-12 ml-1">
        {(["address", "confirm"] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center text-xs font-black transition-all duration-500",
              step === s || (s === "address" && step === "confirm")
                ? "bg-[#660e14] text-white scale-110 shadow-lg"
                : "bg-white/40 text-[#660e14]/30 border border-black/5"
            )}>
              0{i + 1}
            </div>
            <span className={cn(
              "text-[10px] font-black uppercase tracking-[0.2em] hidden sm:block",
              step === s ? "text-[#660e14]" : "text-[#660e14]/20"
            )}>
              {s === "address" ? "Entrega" : "Pagamento"}
            </span>
            {i < 1 && <div className="h-[2px] w-12 bg-[#660e14]/10 mx-2 rounded-full" />}
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
                <Card className="bg-white/40 backdrop-blur-md border-black/5 shadow-xl rounded-[32px] overflow-hidden">
                  <CardHeader className="bg-white/20 border-b border-black/5">
                    <CardTitle className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#660e14]">
                      <MapPin className="h-4 w-4 text-[#ad2335]" />
                      Endereço de Entrega
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-8">
                    <form onSubmit={handleSubmit(onAddressSubmit)} className="space-y-4">
                      {currentUser && (
                        <div className="bg-[#660e14]/5 rounded-2xl px-5 py-4 text-[10px] font-black uppercase tracking-widest text-[#660e14]/60 mb-6 border border-[#660e14]/10">
                          Entregando para:{" "}
                          <span className="text-[#ad2335]">
                            {currentUser.name ?? currentUser.email}
                          </span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                        <div className="sm:col-span-3 space-y-2">
                          <Label htmlFor="street" className="text-[10px] font-black uppercase tracking-widest text-[#660e14]/40 ml-1">Logradouro</Label>
                          <Input
                            id="street"
                            {...register("street")}
                            placeholder="Rua das Flores"
                            className={cn("bg-white/60 border-black/5 h-14 rounded-2xl focus:border-[#ad2335]/40 text-[#660e14]", errors.street ? "border-destructive" : "")}
                          />
                          {errors.street && <p className="text-[10px] font-bold text-destructive uppercase tracking-widest ml-1">{errors.street.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="number" className="text-[10px] font-black uppercase tracking-widest text-[#660e14]/40 ml-1">Nº</Label>
                          <Input
                            id="number"
                            {...register("number")}
                            placeholder="123"
                            className={cn("bg-white/60 border-black/5 h-14 rounded-2xl focus:border-[#ad2335]/40 text-[#660e14]", errors.number ? "border-destructive" : "")}
                          />
                          {errors.number && <p className="text-[10px] font-bold text-destructive uppercase tracking-widest ml-1">{errors.number.message}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="neighborhood" className="text-[10px] font-black uppercase tracking-widest text-[#660e14]/40 ml-1">Bairro</Label>
                          <Input
                            id="neighborhood"
                            {...register("neighborhood")}
                            placeholder="Seu bairro"
                            className={cn("bg-white/60 border-black/5 h-14 rounded-2xl focus:border-[#ad2335]/40 text-[#660e14]", errors.neighborhood ? "border-destructive" : "")}
                          />
                          {errors.neighborhood && <p className="text-[10px] font-bold text-destructive uppercase tracking-widest ml-1">{errors.neighborhood.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="complement" className="text-[10px] font-black uppercase tracking-widest text-[#660e14]/40 ml-1">Complemento</Label>
                          <Input
                            id="complement"
                            {...register("complement")}
                            placeholder="Apto, Bloco, etc."
                            className="bg-white/60 border-black/5 h-14 rounded-2xl focus:border-[#ad2335]/40 text-[#660e14]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-[10px] font-black uppercase tracking-widest text-[#660e14]/40 ml-1">Cidade</Label>
                          <Input
                            id="city"
                            {...register("city")}
                            placeholder="São Paulo"
                            className={cn("bg-white/60 border-black/5 h-14 rounded-2xl focus:border-[#ad2335]/40 text-[#660e14]", errors.city ? "border-destructive" : "")}
                          />
                          {errors.city && <p className="text-[10px] font-bold text-destructive uppercase tracking-widest ml-1">{errors.city.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state" className="text-[10px] font-black uppercase tracking-widest text-[#660e14]/40 ml-1">UF</Label>
                          <Input
                            id="state"
                            {...register("state")}
                            placeholder="SP"
                            maxLength={2}
                            className={cn("uppercase bg-white/60 border-black/5 h-14 rounded-2xl focus:border-[#ad2335]/40 text-[#660e14]", errors.state ? "border-destructive" : "")}
                          />
                          {errors.state && <p className="text-[10px] font-bold text-destructive uppercase tracking-widest ml-1">{errors.state.message}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="document" className="text-[10px] font-black uppercase tracking-widest text-[#660e14]/40 ml-1">CPF ou CNPJ (Para Envio)</Label>
                          <Input
                            id="document"
                            {...register("document")}
                            placeholder="000.000.000-00"
                            className={cn("bg-white/60 border-black/5 h-14 rounded-2xl focus:border-[#ad2335]/40 text-[#660e14]", errors.document ? "border-destructive" : "")}
                          />
                          {errors.document && <p className="text-[10px] font-bold text-destructive uppercase tracking-widest ml-1">{errors.document.message}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="zip" className="text-[10px] font-black uppercase tracking-widest text-[#660e14]/40 ml-1">CEP</Label>
                          <div className="flex gap-4">
                            <Input
                              id="zip"
                              {...register("zip")}
                              placeholder="01310-100"
                              className={cn("bg-white/60 border-black/5 h-14 rounded-2xl focus:border-[#ad2335]/40 text-[#660e14]", errors.zip ? "border-destructive" : "")}
                            />
                            {calculatingShipping && <Loader2 className="h-6 w-6 animate-spin text-[#ad2335] self-center" />}
                          </div>
                          {errors.zip && <p className="text-[10px] font-bold text-destructive uppercase tracking-widest ml-1">{errors.zip.message}</p>}
                        </div>
                      </div>

                      {/* Shipping Options */}
                      {shippingOptions.length > 0 && (
                        <div className="space-y-4 pt-4">
                          <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ad2335] ml-1">
                            {isFreeShipping() ? "Benefício Ativado" : "Escolha a Entrega"}
                          </Label>
                          
                          {isFreeShipping() ? (
                            <div className="p-6 rounded-[24px] bg-[#ad2335]/5 border border-[#ad2335]/20 flex items-center gap-4">
                              <div className="size-12 rounded-2xl bg-[#ad2335] flex items-center justify-center shadow-lg shadow-[#ad2335]/20">
                                <Truck className="size-6 text-white" />
                              </div>
                              <div>
                                <p className="text-[11px] font-black uppercase tracking-widest text-[#660e14]">Frete Grátis Aplicado</p>
                                <p className="text-[9px] font-bold text-[#660e14]/40 uppercase tracking-widest mt-0.5">
                                  Entrega via {selectedShipping?.name || "Transportadora"}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 gap-3">
                              {shippingOptions.map((opt) => (
                                <div
                                  key={opt.id}
                                  onClick={() => setSelectedShipping(opt)}
                                  className={cn(
                                    "p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group",
                                    selectedShipping?.id === opt.id
                                      ? "bg-[#660e14] border-[#660e14] text-white shadow-lg"
                                      : "bg-white/40 border-black/5 text-[#660e14] hover:bg-white/60"
                                  )}
                                >
                                  <div className="flex items-center gap-4">
                                    <div className={cn(
                                      "size-10 rounded-full flex items-center justify-center transition-colors",
                                      selectedShipping?.id === opt.id ? "bg-white/20" : "bg-[#660e14]/5"
                                    )}>
                                      <Truck className={cn("size-5", selectedShipping?.id === opt.id ? "text-white" : "text-[#ad2335]")} />
                                    </div>
                                    <div>
                                      <p className="text-[11px] font-black uppercase tracking-widest">{opt.name}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-black tracking-tight">{formatPrice(opt.price)}</p>
                                    {selectedShipping?.id === opt.id && <CheckCircle2 className="size-4 text-white ml-auto mt-1" />}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={!selectedShipping || calculatingShipping}
                        className="w-full h-16 bg-[#660e14] hover:bg-[#ad2335] text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-[20px] transition-all duration-500 shadow-xl shadow-[#660e14]/10 mt-4 disabled:opacity-50 disabled:grayscale"
                      >
                        {calculatingShipping ? "Calculando Frete..." : "Continuar para Pagamento"}
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
                <Card className="bg-white/40 backdrop-blur-md border-black/5 shadow-lg rounded-[24px] overflow-hidden">
                  <CardContent className="py-5 flex items-center justify-between gap-3">
                    <div className="flex items-start gap-4">
                      <div className="size-10 bg-[#ad2335]/10 rounded-full flex items-center justify-center shrink-0">
                        <MapPin className="h-5 w-5 text-[#ad2335]" />
                      </div>
                      <div className="text-[11px] font-black uppercase tracking-widest text-[#660e14]/60 leading-relaxed">
                        <p className="text-[#660e14] text-xs mb-1">{getValues("street")}, {getValues("number")}</p>
                        <p>
                          {getValues("neighborhood")}{getValues("complement") ? ` — ${getValues("complement")}` : ""}
                        </p>
                        <p>
                          {getValues("city")}, {getValues("state").toUpperCase()} — {getValues("zip")}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#ad2335] font-black uppercase tracking-widest text-[10px] hover:bg-[#ad2335]/5 rounded-xl shrink-0"
                      onClick={() => setStep("address")}
                    >
                      Editar
                    </Button>
                  </CardContent>
                </Card>

                {/* MP payment info */}
                <Card className="bg-white/40 backdrop-blur-md border-black/5 shadow-xl rounded-[32px] overflow-hidden">
                  <CardHeader className="bg-white/20 border-b border-black/5">
                    <CardTitle className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#660e14]">
                      <CreditCard className="h-4 w-4 text-[#ad2335]" />
                      Pagamento via Mercado Pago
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-[#009ee3]/5 border border-[#009ee3]/10 rounded-3xl p-6 space-y-4">
                      <div className="flex items-center gap-4">
                        {/* MP logo */}
                        <div className="h-12 w-12 rounded-2xl bg-[#009ee3] flex items-center justify-center shrink-0 shadow-lg shadow-[#009ee3]/20">
                          <span className="text-white font-black text-sm">MP</span>
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#009ee3]">Checkout Seguro</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            PIX, Boleto e Cartões
                          </p>
                        </div>
                      </div>
                      <p className="text-[10px] font-bold text-[#660e14]/40 uppercase tracking-widest leading-relaxed">
                        Você será redirecionado para o ambiente seguro do Mercado Pago para concluir sua transação com total proteção de dados.
                      </p>
                    </div>


                  </CardContent>
                </Card>

                <Button
                  className="w-full h-16 bg-[#009ee3] hover:bg-[#0082c8] text-white font-black uppercase tracking-[0.3em] text-[11px] rounded-[24px] transition-all duration-500 shadow-xl shadow-[#009ee3]/10 gap-2"
                  onClick={onPay}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processando...
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
            <Card className="bg-white/40 backdrop-blur-md border-black/5 shadow-xl rounded-[32px] overflow-hidden">
              <CardHeader className="bg-white/20 border-b border-black/5">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-[#660e14]">Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-8">
                {/* Items */}
                <div className="space-y-4 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.size}-${item.color}`}
                      className="flex gap-4 items-center"
                    >
                      <div className="h-16 w-16 rounded-2xl overflow-hidden bg-white/40 border border-black/5 shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#660e14] line-clamp-1">{item.name}</p>
                        <p className="text-[9px] font-bold text-[#660e14]/40 uppercase tracking-widest mt-0.5">
                          Nº {item.size} · Qtd {item.quantity}
                        </p>
                      </div>
                      <p className="text-xs font-black text-[#660e14] shrink-0">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator className="bg-black/5" />

                {/* Pricing */}
                <div className="space-y-3 text-[10px] font-black uppercase tracking-widest text-[#660e14]/60">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-[#660e14]">{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[#ad2335]">
                      <span>Desconto {appliedCoupon?.code ? `(${appliedCoupon.code})` : ""}</span>
                      <span>- {formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span>Frete</span>
                    <div className="text-right">
                      {freeShippingActive ? (
                        <>
                          <span className="text-muted-foreground line-through mr-2 opacity-50">{formatPrice(shippingPrice)}</span>
                          <span className="text-[#ad2335] font-black">Grátis</span>
                        </>
                      ) : hasShipping ? (
                        <span className="text-[#660e14]">{formatPrice(shippingPrice)}</span>
                      ) : (
                        <span className="text-[#660e14]/20 italic">A calcular</span>
                      )}
                    </div>
                  </div>
                </div>

                <Separator className="bg-black/5" />

                <div className="flex justify-between font-normal text-2xl text-[#660e14]">
                  <span style={{ fontFamily: "'Glamour Absolute', cursive" }}>Total</span>
                  <span className="text-[#ad2335] font-black text-xl tracking-tighter">
                    {selectedShipping || freeShippingActive ? formatPrice(total) : "—"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
