"use client";

import { Suspense, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import DashboardHeaderUtilisateur from "./components/DashboardHeaderUtilisateur";
import SidebarUtilisateur from "./components/SideBarUtilisateur";

// Composant qui contient la logique avec usePathname
function DashboardUtilisateurLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [headerHeight, setHeaderHeight] = useState(0);
  
  // Vérifier si on est sur la page de messagerie
  const isMessageriePage = pathname?.includes('/dashboard-utilisateur/messages');

  // Récupérer la hauteur du header au chargement
  useEffect(() => {
    const updateHeaderHeight = () => {
      const header = document.querySelector('.user-panel-header');
      if (header) {
        setHeaderHeight(header.clientHeight);
      }
    };
    
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);

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
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar fixe */}
      <div 
        className="sidebar-fixed"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          zIndex: 1000,
          overflowY: 'auto',
        }}
      >
        <SidebarUtilisateur />
      </div>

      {/* Contenu principal avec marge pour la sidebar */}
      <div 
        className="flex-grow-1 d-flex flex-column"
        style={{ 
          marginLeft: 'var(--sidebar-width, 280px)',
          minHeight: '100vh',
          transition: 'margin-left 0.3s ease',
        }}
      >
        {/* Header sticky */}
        <div 
          className="user-panel-header"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 999,
            backgroundColor: 'white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <DashboardHeaderUtilisateur />
        </div>

        <main className="flex-grow-1 overflow-auto p-3 p-md-4">
          {children}
        </main>
      </div>
    </div>
  );
}

// Layout principal avec Suspense
export default function DashboardUtilisateurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="text-muted">Chargement du tableau de bord utilisateur...</p>
        </div>
      </div>
    }>
      <DashboardUtilisateurLayoutContent>
        {children}
      </DashboardUtilisateurLayoutContent>
    </Suspense>
  );
}