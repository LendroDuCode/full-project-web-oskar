"use client";

import { usePathname } from "next/navigation";
import SidebarModPanel from "./components/SidebarProps";
import ModPanelHeader from "./components/ModPanelHeader";

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Vérifier si on est sur la page de messagerie
  const isMessageriePage = pathname?.includes('/dashboard-agent/messages');

  // Si c'est la page de messagerie, afficher seulement le contenu (sans header ni sidebar)
  if (isMessageriePage) {
    return (
      <div className="min-vh-100 bg-light">
        {children}
      </div>
    );
  }

  // Sinon, afficher le layout complet avec header et sidebar
  return (
    <div className="d-flex min-vh-100">
      {/* Sidebar affichée partout sauf messagerie */}
      <SidebarModPanel />

      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        {/* Header affiché partout sauf messagerie */}
        <ModPanelHeader />

        <main className="flex-grow-1 overflow-auto p-3 p-md-4">
          {children}
        </main>
      </div>
    </div>
  );
}