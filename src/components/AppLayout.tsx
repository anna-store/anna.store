import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AccessibilityMenu from "@/components/AccessibilityMenu";

export default function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <AccessibilityMenu />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
