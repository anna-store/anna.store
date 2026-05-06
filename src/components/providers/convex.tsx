import { ConvexProvider as StandardConvexProvider } from "convex/react";
import { ConvexReactClient } from "convex/react";

const convexUrl = import.meta.env.VITE_CONVEX_URL ?? "";
const convex = new ConvexReactClient(convexUrl);

export function ConvexProvider({ children }: { children: React.ReactNode }) {
  return (
    <StandardConvexProvider client={convex}>
      {children}
    </StandardConvexProvider>
  );
}
