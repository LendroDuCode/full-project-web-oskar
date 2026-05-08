"use client";

import { AuthProvider } from "./(front-office)/auth/AuthContext";
import { SearchProvider } from "./(front-office)/home/contexts/SearchContext";
import Header from "./shared/components/layout/Header";
import AuthModals from "./(front-office)/auth/AuthModals";
import Footer from "./shared/components/layout/Footer";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initGA, sendPageView, sendEvent } from "@/lib/gtag";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [key, setKey] = useState(Date.now());
  const [isGAInitialized, setIsGAInitialized] = useState(false);

  // ✅ Vérifier si c'est une page de messagerie
  const isMessageriePage = pathname?.includes('/dashboard-utilisateur/messages') ||
                          pathname?.includes('/dashboard-vendeur/messages') ||
                          pathname?.includes('/dashboard-agent/messages') ||
                          pathname?.includes('/dashboard-admin/messages');

  // ✅ Vérifier si c'est une page de tableau de bord (dashboard)
  const isDashboardPage = pathname?.startsWith('/dashboard-');

  // ✅ Ne pas afficher le header sur les pages dashboard (sauf messagerie)
  const showHeader = !isDashboardPage || isMessageriePage;
  
  // ✅ Afficher le footer seulement si ce n'est PAS une page de messagerie
  const showFooter = !isMessageriePage;

  // Réinitialiser la clé quand on revient à la page d'accueil
  useEffect(() => {
    if (pathname === "/") {
      setKey(Date.now());
    }
  }, [pathname]);

  // Écouter l'événement de déconnexion
  useEffect(() => {
    const handleLogout = () => {
      console.log("🔄 ClientLayout - Logout event detected");
      setKey(Date.now());
      
      sendEvent('logout', {
        event_category: 'authentication',
        event_label: 'user_logout',
      });
    };

    window.addEventListener("oskar-logout", handleLogout);

    return () => {
      window.removeEventListener("oskar-logout", handleLogout);
    };
  }, []);

  // Initialiser Google Analytics
  useEffect(() => {
    if (!isGAInitialized) {
      initGA();
      setIsGAInitialized(true);
    }
  }, [isGAInitialized]);

  // Tracker les changements de page
  useEffect(() => {
    if (pathname && isGAInitialized) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      sendPageView(url);
    }
  }, [pathname, searchParams, isGAInitialized]);

  // Tracker le temps passé sur la page
  useEffect(() => {
    if (!pathname) return;
    
    const startTime = Date.now();
    const pagePath = pathname;
    
    return () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      if (timeSpent > 5) {
        sendEvent('time_on_page', {
          event_category: 'engagement',
          event_label: pagePath,
          value: timeSpent,
          page_path: pagePath,
        });
      }
    };
  }, [pathname]);

  return (
    <AuthProvider key={key}>
      <SearchProvider>
        {showHeader && <Header />}
        <main 
          className={!showHeader ? "messagerie-page" : ""}
          style={!showHeader ? { 
            padding: 0, 
            margin: 0, 
            minHeight: "100vh",
            backgroundColor: "#efeae2"
          } : {}}
        >
          {children}
        </main>
        <AuthModals />
        {showFooter && <Footer />}
      </SearchProvider>
    </AuthProvider>
  );
}