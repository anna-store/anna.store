import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Store persistente para manter a sessão local via Convex.
 * Hercules desativada temporariamente para evitar erros de CORS.
 */
interface LocalAuthState {
  user: any | null;
  setUser: (user: any) => void;
  clear: () => void;
}

const useLocalAuthStore = create<LocalAuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clear: () => set({ user: null }),
    }),
    {
      name: "annast-session-v1",
    }
  )
);

export function useAuth() {
  const { user, setUser, clear } = useLocalAuthStore();

  const isAuthenticated = !!user;

  return {
    isAuthenticated,
    user,
    setLocalUser: setUser,
    // Hercules desativada: signin faz nada por enquanto
    signin: () => {
       console.log("Hercules signin desativado. Use o formulário local.");
    },
    signout: () => {
      clear();
      window.location.href = "/auth";
    },
    removeUser: () => {
      clear();
      window.location.href = "/auth";
    },
    profile: user,
    isLoading: false,
    error: null
  };
}

export function useUser() {
  const { user } = useAuth();
  return user;
}
