import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { ConvexError } from "convex/values";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Button } from "@/components/ui/button.tsx";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth.ts";
import AdminDashboard from "./admin-dashboard.tsx";

export default function AdminGuard() {
  const { user: localUser } = useAuth();
  const userId = localUser?._id;
  const currentUser = useQuery(api.users.getCurrentUser, userId ? { userId } : {});
  const bootstrapAdmin = useMutation(api.admin.bootstrapAdmin);

  // Verifica o usuário do banco ou da sessão local
  const activeUser = currentUser ?? localUser;

  // Loading
  if (activeUser === undefined) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-4 w-full max-w-5xl px-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}
          </div>
        </div>
      </div>
    );
  }

  // Is admin — render dashboard
  if (activeUser?.isAdmin) {
    return <AdminDashboard />;
  }

  // Not admin — show bootstrap or forbidden
  const handleBootstrap = async () => {
    const userId = activeUser?._id;
    if (!userId) {
      toast.error("Faça login antes de se tornar admin.");
      return;
    }
    try {
      await bootstrapAdmin({ userId });
      toast.success("Você agora é administrador! Recarregando...");
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      if (err instanceof ConvexError) {
        const data = err.data as { message: string };
        toast.error(data.message ?? "Erro ao promover admin");
      } else {
        toast.error("Já existe um administrador cadastrado.");
      }
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
        <ShieldAlert className="h-10 w-10 text-destructive" />
      </div>
      <div className="space-y-2 max-w-sm">
        <h1 className="text-2xl font-bold">Acesso Negado</h1>
        <p className="text-muted-foreground text-sm">
          Esta área é restrita a administradores. Se você é o primeiro usuário,
          clique abaixo para se tornar administrador.
        </p>
      </div>
      <Button
        onClick={handleBootstrap}
        className="gap-2 bg-[#ea3372] hover:bg-[#c9295f] text-white"
      >
        <ShieldCheck className="h-4 w-4" />
        Tornar-me Administrador
      </Button>
      <p className="text-xs text-muted-foreground">
        Isso só funciona se ainda não houver nenhum admin cadastrado.
      </p>
    </div>
  );
}
