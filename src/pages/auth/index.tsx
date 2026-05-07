import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mail, Lock, User, ArrowRight, Globe, Share2, 
  Eye, EyeOff, ChevronLeft, CheckCircle2, ShieldCheck 
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth.ts";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api.js";

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<"auth" | "forgot" | "reset">("auth");
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");

  const registerUser = useMutation(api.users.registerUser);
  const loginUser = useMutation(api.users.loginUser);
  const requestReset = useMutation(api.users.requestPasswordReset);
  const resetPassword = useMutation(api.users.resetPassword);
  const sendEmailAction = useAction(api.actions.sendResetPasswordEmail);
  const { isAuthenticated, setLocalUser } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = "/";
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setMode("reset");
    }
  }, [searchParams]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      toast.error("Preencha e-mail e senha");
      return;
    }
    if (!validateEmail(email)) {
      toast.error("E-mail inválido");
      return;
    }
    setIsLoading(true);
    try {
      const user = await loginUser({ email, password });
      setLocalUser(user);
      toast.success(`Bem-vindo, ${user.name}!`);
      window.location.href = "/";
    } catch (err: any) {
      toast.error(err.message || "Credenciais inválidas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !name || !password) {
      toast.error("Preencha todos os campos");
      return;
    }
    if (!validateEmail(email)) {
      toast.error("Por favor, use um e-mail válido");
      return;
    }
    setIsLoading(true);
    try {
      await registerUser({ name, email, password });
      toast.success("Cadastro realizado com sucesso!");
      setMode("auth");
      setActiveTab("login");
    } catch (err: any) {
      toast.error(err.message || "Erro ao cadastrar");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Informe seu e-mail");
      return;
    }
    if (!validateEmail(email)) {
      toast.error("Formato de e-mail inválido");
      return;
    }
    setIsLoading(true);
    try {
      const appUrl = window.location.origin;
      const result = await requestReset({ email, appUrl });
      if (result.resetLink) {
        const emailResult = await sendEmailAction({
          email: email,
          resetLink: result.resetLink
        }) as { success: boolean, error?: string };

        if (!emailResult.success) {
          toast.error(`Erro no e-mail: ${emailResult.error}`);
          return;
        }
      }
      setIsSuccess(true);
      toast.success("Link enviado com sucesso!");
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao solicitar redefinição");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = searchParams.get("token");
    if (!token) {
      toast.error("Token de redefinição ausente");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword({ token, newPassword });
      toast.success("Senha alterada com sucesso!");
      setMode("auth");
      setActiveTab("login");
    } catch (err: any) {
      toast.error(err.message || "Erro ao redefinir senha");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col md:flex-row overflow-hidden font-sans selection:bg-[#ea3372]/30">
      
      {/* Lado Esquerdo: Imagem */}
      <div className="hidden md:block md:w-1/2 lg:w-3/5 relative overflow-hidden bg-[#0a0a0a]">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <img
            src="/luxury_fashion_auth_bg_1778003172409.png"
            alt="Anna Store Luxury"
            className="w-full h-full object-cover opacity-70 grayscale-[20%] hover:grayscale-0 transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
        </motion.div>

        <div className="absolute bottom-16 left-16 z-10 max-w-lg">
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="space-y-6"
          >
            <div className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full">
              <span className="text-[10px] text-white/80 font-black uppercase tracking-[0.3em]">Coleção de Elite 2026</span>
            </div>
            <h2 className="text-7xl md:text-8xl font-black text-white leading-[0.85] tracking-tighter uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>
              VIVA A<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-[#ea3372] italic">EXCELÊNCIA</span>
              <span className="text-[#ea3372]">.</span>
            </h2>
            <p className="text-white/40 text-sm font-medium tracking-[0.15em] uppercase italic leading-relaxed max-w-sm">
              Sua jornada para o luxo começa aqui. Acesse curadorias exclusivas e peças limitadas.
            </p>
          </motion.div>
        </div>

        <div className="absolute top-12 left-12 z-10">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="https://hercules-cdn.com/file_MwBJp0asRxRHTEAr31k3LplG"
              alt="Anna Store Logo"
              className="h-24 w-auto brightness-0 invert"
            />
          </Link>
        </div>
      </div>

      {/* Lado Direito */}
      <div className="w-full md:w-1/2 lg:w-2/5 bg-[#050505] flex items-center justify-center p-8 md:p-20 relative border-l border-white/5">
        <div className="w-full max-w-[420px] space-y-12">
          
          <AnimatePresence mode="wait">
            {mode === "forgot" ? (
              <motion.div
                key="forgot-mode"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div className="space-y-3">
                  <button 
                    onClick={() => { setMode("auth"); setIsSuccess(false); }}
                    className="text-white/30 hover:text-white transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-6 group"
                  >
                    <ChevronLeft className="size-3 group-hover:-translate-x-1 transition-transform" /> Voltar
                  </button>
                  <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    Recuperar<span className="text-[#ea3372]">.</span>
                  </h1>
                  <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.4em] ml-1">Enviaremos um link de acesso seguro</p>
                </div>

                {isSuccess ? (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white/[0.03] border border-white/10 p-10 rounded-2xl text-center space-y-6 shadow-2xl"
                  >
                    <div className="size-16 bg-[#ea3372]/10 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="size-8 text-[#ea3372]" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-white text-sm font-black uppercase tracking-widest">E-mail Enviado</p>
                      <p className="text-white/40 text-[11px] leading-relaxed">Verifique sua caixa de entrada.</p>
                    </div>
                    <Button 
                      onClick={() => { setMode("auth"); setIsSuccess(false); }}
                      variant="outline" 
                      className="w-full border-white/10 text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest h-12"
                    >
                      Voltar ao Início
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleForgotSubmit} className="space-y-8">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">E-mail Cadastrado</Label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/10 group-focus-within:text-[#ea3372] transition-colors" />
                        <Input 
                          required
                          type="email" 
                          className="bg-white/[0.03] border-white/10 h-14 pl-12 text-white rounded-xl focus:border-[#ea3372]/40" 
                          placeholder="seu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full h-16 bg-white text-black hover:bg-[#ea3372] hover:text-white font-black uppercase tracking-[0.3em] text-[11px] rounded-xl transition-all duration-500 shadow-2xl shadow-white/5"
                    >
                      {isLoading ? "Processando..." : "Enviar Link Seguro"}
                    </Button>
                  </form>
                )}
              </motion.div>
            ) : mode === "reset" ? (
              <motion.div
                key="reset-mode"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-10"
              >
                <div className="space-y-3">
                  <div className="size-12 bg-[#38b6ff]/10 rounded-xl flex items-center justify-center mb-6">
                    <ShieldCheck className="size-6 text-[#38b6ff]" />
                  </div>
                  <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    Nova Senha<span className="text-[#38b6ff]">.</span>
                  </h1>
                  <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.4em] ml-1">Defina sua nova credencial</p>
                </div>

                <form onSubmit={handleResetSubmit} className="space-y-8">
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Nova Senha</Label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/10 group-focus-within:text-[#38b6ff] transition-colors" />
                        <Input 
                          required
                          type={showPassword ? "text" : "password"} 
                          placeholder="Mínimo 8 caracteres"
                          className="bg-white/[0.03] border-white/10 h-14 pl-12 text-white rounded-xl focus:border-[#38b6ff]/40" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Confirmar Senha</Label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/10 group-focus-within:text-[#38b6ff] transition-colors" />
                        <Input 
                          required
                          type="password" 
                          placeholder="Repita a nova senha"
                          className="bg-white/[0.03] border-white/10 h-14 pl-12 text-white rounded-xl focus:border-[#38b6ff]/40" 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full h-16 bg-[#38b6ff] text-white hover:bg-[#38b6ff]/80 font-black uppercase tracking-[0.3em] text-[11px] rounded-xl transition-all duration-500 shadow-2xl shadow-[#38b6ff]/10"
                  >
                    {isLoading ? "Atualizando..." : "Confirmar Nova Senha"}
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="auth-mode"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-12"
              >
                <div className="flex flex-col space-y-3">
                  <Link to="/" className="text-white/30 hover:text-white transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-6 group">
                    <ChevronLeft className="size-3 group-hover:-translate-x-1 transition-transform" /> Voltar para a Boutique
                  </Link>
                  <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    Minha Conta<span className="text-[#ea3372]">.</span>
                  </h1>
                  <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.4em] ml-1">Bem-vindo de volta ao extraordinário</p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-white/[0.03] p-1.5 h-16 rounded-xl mb-10 border border-white/5">
                    <TabsTrigger 
                      value="login" 
                      className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-black text-white/40 font-black uppercase tracking-widest text-[10px] transition-all duration-300"
                    >
                      Acessar
                    </TabsTrigger>
                    <TabsTrigger 
                      value="register" 
                      className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-black text-white/40 font-black uppercase tracking-widest text-[10px] transition-all duration-300"
                    >
                      Cadastrar
                    </TabsTrigger>
                  </TabsList>

                  <AnimatePresence mode="wait">
                    {activeTab === "login" ? (
                      <motion.div
                        key="login-tab"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-8"
                      >
                        <form
                          onSubmit={(e) => { e.preventDefault(); handleSignIn(); }}
                          className="space-y-6"
                        >
                          <div className="space-y-6">
                            <div className="space-y-3">
                              <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 ml-1">E-mail de Membro</Label>
                              <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/10 group-focus-within:text-[#ea3372] transition-colors" />
                                <Input 
                                  className="bg-white/[0.03] border-white/10 h-14 pl-12 focus:border-[#ea3372]/40 text-white rounded-xl placeholder:text-white/10" 
                                  placeholder="exemplo@annast.com"
                                  type="email"
                                  autoComplete="email"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center px-1">
                                <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">Sua Senha</Label>
                                <button 
                                  type="button"
                                  onClick={() => setMode("forgot")}
                                  className="text-[9px] font-bold text-[#ea3372] uppercase tracking-[0.3em] hover:brightness-125 transition-all italic"
                                >
                                  Esqueci a senha?
                                </button>
                              </div>
                              <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/10 group-focus-within:text-[#ea3372] transition-colors" />
                                <Input 
                                  type={showPassword ? "text" : "password"}
                                  className="bg-white/[0.03] border-white/10 h-14 pl-12 focus:border-[#ea3372]/40 text-white rounded-xl placeholder:text-white/10" 
                                  placeholder="••••••••"
                                  autoComplete="current-password"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                />
                                <button 
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10 hover:text-white transition-colors"
                                >
                                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                </button>
                              </div>
                            </div>
                          </div>

                          <Button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-16 bg-white text-black hover:bg-[#ea3372] hover:text-white font-black uppercase tracking-[0.3em] text-[11px] transition-all duration-500 rounded-xl shadow-2xl shadow-white/5"
                          >
                            {isLoading ? "Validando..." : "Entrar na Boutique"}
                            {!isLoading && <ArrowRight className="ml-2 size-4" />}
                          </Button>
                        </form>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="register-tab"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-8"
                      >
                        <form
                          onSubmit={(e) => { e.preventDefault(); handleRegister(); }}
                          className="space-y-6"
                        >
                          <div className="space-y-6">
                            <div className="space-y-3">
                              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Nome Completo</Label>
                              <Input 
                                className="bg-white/[0.03] border-white/10 h-14 px-6 focus:border-[#38b6ff]/40 text-white rounded-xl" 
                                placeholder="Nome Completo"
                                autoComplete="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                              />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">E-mail</Label>
                              <Input 
                                type="email"
                                className="bg-white/[0.03] border-white/10 h-14 px-6 focus:border-[#38b6ff]/40 text-white rounded-xl" 
                                placeholder="email@exemplo.com"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                              />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Definir Senha</Label>
                              <Input 
                                type="password"
                                className="bg-white/[0.03] border-white/10 h-14 px-6 focus:border-[#38b6ff]/40 text-white rounded-xl" 
                                placeholder="••••••••"
                                autoComplete="new-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                              />
                            </div>
                          </div>

                          <Button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-16 bg-[#38b6ff] text-white hover:bg-[#38b6ff]/80 font-black uppercase tracking-[0.3em] text-[11px] transition-all duration-500 rounded-xl shadow-2xl shadow-[#38b6ff]/10"
                          >
                            {isLoading ? "Processando..." : "Criar Acesso VIP"}
                          </Button>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Tabs>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-[9px] text-white/10 font-black uppercase tracking-[0.4em] pt-8">
            AnnaSt Boutique &copy; 2026 &bull; Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  );
}
