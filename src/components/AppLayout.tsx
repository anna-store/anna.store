import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "@/components/navbar.tsx";
import Footer from "@/components/footer.tsx";
import AccessibilityMenu from "@/components/AccessibilityMenu.tsx";
import MobileNav from "@/components/MobileNav.tsx";
import InstallPrompt from "@/components/InstallPrompt.tsx";

export default function AppLayout() {
  const [isAccessOpen, setIsAccessOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <AccessibilityMenu isOpen={isAccessOpen} setIsOpen={setIsAccessOpen} />
      <Navbar onAccessClick={() => setIsAccessOpen(!isAccessOpen)} />
      <InstallPrompt />
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
      <MobileNav />
      <Footer />
    </div>
  );
}
