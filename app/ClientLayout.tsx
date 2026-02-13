"use client";

import { AuthProvider } from "./(front-office)/auth/AuthContext";
import Header from "./shared/components/layout/Header";
import AuthModals from "./(front-office)/auth/AuthModals";
import Footer from "./shared/components/layout/Footer";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [key, setKey] = useState(Date.now());

  // Réinitialiser la clé quand on revient à la page d'accueil
  useEffect(() => {
    if (pathname === "/") {
      setKey(Date.now());
    }
  }, [pathname]);

  // Écouter l'événement de déconnexion pour forcer une mise à jour
  useEffect(() => {
    const handleLogout = () => {
      console.log("🔄 ClientLayout - Logout event detected");
      setKey(Date.now());
    };

    window.addEventListener("oskar-logout", handleLogout);

    return () => {
      window.removeEventListener("oskar-logout", handleLogout);
    };
  }, []);

  return (
    <AuthProvider key={key}>
      <Header />
      <main>{children}</main>
      <AuthModals />
      <Footer />
    </AuthProvider>
  );
}
