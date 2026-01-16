"use client";

import Link from "next/link";
import { Container, Breadcrumb, Button, Dropdown } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
  icon?: string;
}

interface BreadcrumbSectionProps {
  items?: BreadcrumbItem[];
  className?: string;
  showUserActions?: boolean;
  userName?: string;
}

export default function BreadcrumbSection({
  items = [
    { label: "Home", href: "/", icon: "fa-home" },
    { label: "My Profile", active: true, icon: "fa-user" },
  ],
  className = "",
  showUserActions = true,
  userName = "Utilisateur",
}: BreadcrumbSectionProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      setIsLoggingOut(true);

      // Simulation d'un délai pour la déconnexion
      setTimeout(() => {
        // Nettoyer les données d'authentification
        localStorage.clear();
        sessionStorage.clear();
        document.cookie =
          "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        // Rediriger vers la page de connexion
        router.push("/");
      }, 500);
    }
  };

  const handleBackToSite = () => {
    router.push("/");
  };

  const handleSettings = () => {
    router.push("/dashboard/settings");
  };

  return (
    <nav
      aria-label="breadcrumb"
      className={`bg-white border-bottom py-3 ${className}`}
    >
      <Container fluid="lg" className="px-4 px-lg-6">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            {/* Bouton retour pour mobile */}
            <Button
              variant="link"
              className="text-secondary d-md-none me-2 p-0"
              onClick={handleBackToSite}
              title="Retour au site"
            >
              <i className="fas fa-arrow-left fs-5"></i>
            </Button>

            <Breadcrumb className="mb-0">
              {items.map((item, index) => (
                <Breadcrumb.Item
                  key={index}
                  linkAs={item.href && !item.active ? Link : undefined}
                  href={item.href && !item.active ? item.href : undefined}
                  active={item.active}
                  className="text-decoration-none d-flex align-items-center gap-2"
                >
                  {item.icon && (
                    <i
                      className={`fas ${item.icon} ${item.active ? "" : "text-muted"}`}
                    ></i>
                  )}
                  <span className={item.active ? "fw-semibold" : ""}>
                    {item.label}
                  </span>
                </Breadcrumb.Item>
              ))}
            </Breadcrumb>
          </div>

          {showUserActions && (
            <div className="d-flex align-items-center gap-2">
              {/* Bouton retour au site (desktop) */}
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={handleBackToSite}
                className="d-none d-md-flex align-items-center gap-2"
              >
                <i className="fas fa-home"></i>
                <span>Retour au site</span>
              </Button>

              {/* Menu utilisateur avec déconnexion */}
              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="light"
                  id="user-menu"
                  className="d-flex align-items-center gap-2 border-0"
                  size="sm"
                >
                  <div
                    className="bg-secondary bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: "32px", height: "32px" }}
                  >
                    <i className="fas fa-user text-dark"></i>
                  </div>
                  <span className="d-none d-md-inline">{userName}</span>
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Header>
                    <div className="fw-semibold">{userName}</div>
                    <small className="text-muted">Connecté</small>
                  </Dropdown.Header>
                  <Dropdown.Divider />

                  <Dropdown.Item as={Link} href="/dashboard/profile">
                    <i className="fas fa-user me-2"></i>
                    Mon profil
                  </Dropdown.Item>

                  <Dropdown.Item as={Link} href="/dashboard/settings">
                    <i className="fas fa-cog me-2"></i>
                    Paramètres
                  </Dropdown.Item>

                  <Dropdown.Item onClick={handleBackToSite}>
                    <i className="fas fa-home me-2"></i>
                    Retour au site
                  </Dropdown.Item>

                  <Dropdown.Divider />

                  <Dropdown.Item
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="text-danger"
                  >
                    {isLoggingOut ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Déconnexion...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-out-alt me-2"></i>
                        Se déconnecter
                      </>
                    )}
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              {/* Bouton de déconnexion simple (alternative) */}
              <Button
                variant="outline-danger"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="d-none d-md-flex align-items-center gap-2"
              >
                {isLoggingOut ? (
                  <>
                    <span className="spinner-border spinner-border-sm"></span>
                    <span>Déconnexion...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Déconnexion</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </Container>
    </nav>
  );
}
