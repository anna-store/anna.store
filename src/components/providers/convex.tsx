import { ConvexProvider as StandardConvexProvider } from "convex/react";
import { ConvexReactClient } from "convex/react";

const convexUrl = import.meta.env.VITE_CONVEX_URL;

if (!convexUrl) {
  console.error(
    "[Anna Store] VITE_CONVEX_URL não está configurada. " +
    "Adicione essa variável de ambiente no painel da Vercel."
  );
}

const convex = new ConvexReactClient(convexUrl ?? "https://vivid-dotterel-427.convex.cloud");

export function ConvexProvider({ children }: { children: React.ReactNode }) {
  return (
    <StandardConvexProvider client={convex}>
      {children}
    </StandardConvexProvider>
  );
}
