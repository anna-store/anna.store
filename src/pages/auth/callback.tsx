import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthCallback } from "@usehercules/auth/react";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
import LoadingScreen from "@/components/LoadingScreen.tsx";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { isAuthenticated: isConvexAuthenticated } = useConvexAuth();
  const updateCurrentUser = useMutation(api.users.updateCurrentUser);

  const onSync = useCallback(async () => {
    await updateCurrentUser();
  }, [updateCurrentUser]);

  const navigateHome = useCallback(
    () => navigate("/", { replace: true }),
    [navigate],
  );

  const { status, error, retry } = useAuthCallback({
    isBackendAuthenticated: isConvexAuthenticated,
    onSync,
    onSuccess: navigateHome,
    onNoAuthParams: navigateHome,
  });

  if (status === "error" && error) {
    return (
      <div className="flex flex-col items-center justify-center h-svh gap-6 px-4 bg-[#fdf0e3]">
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-destructive font-medium">Ops! Algo deu errado</p>
          <p className="text-sm text-[#660e14]/60 max-w-md">{error}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={navigateHome} className="border-[#660e14]/10 text-[#660e14]">
            Voltar para o Início
          </Button>
          <Button onClick={retry} className="bg-[#ad2335] text-white">Tentar Novamente</Button>
        </div>
      </div>
    );
  }

  return <LoadingScreen message="Sincronizando sua boutique..." />;
}
