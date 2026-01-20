"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { api } from "@/lib/api-client";
import { useAuth } from "@/app/(front-office)/auth/AuthContext";
import PublishAdModal from "@/app/(front-office)/publication-annonce/page";
import HelpModalVendeur from "./HelpModalVendeur";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showPeriodSelector?: boolean;
  showNotification?: boolean;
  showExportButton?: boolean;
  showPublishButton?: boolean;
  showHelpButton?: boolean;
}

interface VendeurProfile {
  uuid: string;
  nom: string;
  prenoms: string;
  email: string;
  telephone: string;
  avatar: string | null;
  type: "standard" | "premium";
  est_verifie: boolean;
  est_bloque: boolean;
  date_naissance: string | null;
  civilité: {
    uuid: string;
    libelle: string;
  };
  created_at: string | null;
  updated_at: string;
}

export default function DashboardHeaderVendeur({
  subtitle = "",
  showPeriodSelector = true,
  showNotification = true,
  showExportButton = false,
  showPublishButton = true,
  showHelpButton = true,
}: HeaderProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("Aujourd'hui");
  const [notificationCount, setNotificationCount] = useState(1);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [profile, setProfile] = useState<VendeurProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userMenuButtonRef = useRef<HTMLButtonElement>(null);

  // Contexte d'authentification
  const { isLoggedIn, openLoginModal } = useAuth();

  // Fermeture du menu au clic externe
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node) &&
        userMenuButtonRef.current &&
        !userMenuButtonRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Navigation clavier
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showUserMenu) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showUserMenu]);

  // Récupérer le profil du vendeur
  useEffect(() => {
    const fetchProfile = async (retryCount = 0) => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get(API_ENDPOINTS.AUTH.VENDEUR.PROFILE);

        if (response.data?.data) {
          setProfile(response.data.data);
        } else if (response.data) {
          setProfile(response.data);
        } else {
          setError("Format de réponse inattendu");
        }
      } catch (err: any) {
        console.error("Erreur lors de la récupération du profil:", err);

        if (err.response?.status === 401 && retryCount < 2) {
          setTimeout(() => fetchProfile(retryCount + 1), 1000);
          return;
        }

        setError(
          err.response?.data?.message ||
            err.message ||
            "Impossible de charger votre profil",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Gestion des événements
  const handleExport = () => {
    console.log("Exporting dashboard data...");
    alert("Export fonctionnel - À implémenter");
  };

  const handlePublish = useCallback(() => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    setShowPublishModal(true);
  }, [isLoggedIn, openLoginModal]);

  const handleHelpClick = useCallback(() => {
    setShowHelpModal(true);
  }, []);

  const handleCloseHelpModal = useCallback(() => {
    setShowHelpModal(false);
  }, []);

  const handleClosePublishModal = useCallback(() => {
    setShowPublishModal(false);
  }, []);

  const handleNotificationClick = () => {
    console.log("Opening notifications...");
    router.push("/dashboard-vendeur/notifications");
    setNotificationCount(0);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await api.post(API_ENDPOINTS.AUTH.VENDEUR.LOGOUT);
    } catch (err) {
      console.error("Erreur lors de la déconnexion:", err);
    } finally {
      localStorage.removeItem("oskar_user");
      localStorage.removeItem("oskar_token");
      sessionStorage.clear();
      router.push("/");
    }
  };

  const handleProfileClick = () => {
    setShowUserMenu(false);
    router.push("/dashboard-vendeur/profile");
  };

  const handleSettingsClick = () => {
    setShowUserMenu(false);
    router.push("/dashboard-vendeur/parametres");
  };

  const handleAnnoncesClick = () => {
    setShowUserMenu(false);
    router.push("/dashboard-vendeur/mes-annonces");
  };

  const handleMessagesClick = () => {
    setShowUserMenu(false);
    router.push("/dashboard-vendeur/messages");
  };

  // Utilitaires
  const getDefaultAvatar = useCallback((nom: string, prenoms: string) => {
    const initials =
      `${prenoms?.charAt(0) || ""}${nom?.charAt(0) || ""}`.toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=16a34a&color=fff&size=40`;
  }, []);

  const getFullName = useCallback(() => {
    if (!profile) return "Vendeur";
    return `${profile.prenoms} ${profile.nom}`;
  }, [profile]);

  const getAvatarUrl = useCallback(() => {
    if (!profile) return getDefaultAvatar("", "");
    return profile.avatar || getDefaultAvatar(profile.nom, profile.prenoms);
  }, [profile, getDefaultAvatar]);

  const formatDateNaissance = useCallback((date: string | null) => {
    if (!date) return "Non spécifiée";
    return new Date(date).toLocaleDateString("fr-FR");
  }, []);

  // Badge de vérification
  const VerificationBadge = () => {
    if (!profile) return null;

    if (profile.est_verifie) {
      return (
        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 ms-2">
          <i className="fa-solid fa-check-circle me-1"></i>
          Vérifié
        </span>
      );
    }

    if (profile.est_bloque) {
      return (
        <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 ms-2">
          <i className="fa-solid fa-ban me-1"></i>
          Bloqué
        </span>
      );
    }

    return (
      <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 ms-2">
        <i className="fa-solid fa-clock me-1"></i>
        Non vérifié
      </span>
    );
  };

  // Badge de type de compte
  const TypeBadge = () => {
    if (!profile) return null;

    return (
      <span
        className={`badge ${profile.type === "premium" ? "bg-warning" : "bg-secondary"} ms-2`}
      >
        <i
          className={`fa-solid ${profile.type === "premium" ? "fa-crown" : "fa-user"} me-1`}
        ></i>
        {profile.type === "premium" ? "Premium" : "Standard"}
      </span>
    );
  };

  // Gestion des touches clavier
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, handler: () => void) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handler();
      }
    },
    [],
  );

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = getDefaultAvatar(profile?.nom || "", profile?.prenoms || "");
  };

  return (
    <>
      <header
        id="dashboard-header"
        className="bg-white border-bottom px-3 px-md-4 py-2"
        style={{ minHeight: "64px" }}
      >
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-2">
          {/* Section titre et informations utilisateur */}
          <div
            className="d-flex flex-column me-4"
            style={{
              flex: "1 1 auto",
              minWidth: "0",
            }}
          >
            <h1 className="h3 fw-bold mb-1" style={{ color: "#16a34a" }}>
              Bienvenue dans votre espace Vendeur OSKAR
            </h1>

            {loading ? (
              <div className="d-flex align-items-center gap-2">
                <div
                  className="spinner-border spinner-border-sm text-muted"
                  role="status"
                >
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <span className="text-muted small">
                  Chargement de vos informations...
                </span>
              </div>
            ) : error ? (
              <div className="d-flex align-items-center gap-2">
                <i className="fa-solid fa-exclamation-circle text-danger"></i>
                <span className="text-danger small">{error}</span>
                <button
                  onClick={() => window.location.reload()}
                  className="btn btn-link btn-sm p-0 ms-2"
                  aria-label="Recharger"
                >
                  <i className="fa-solid fa-rotate-right"></i>
                </button>
              </div>
            ) : profile ? (
              <div className="d-flex flex-wrap align-items-center gap-2">
                <i
                  className="fa-solid fa-store text-muted"
                  style={{ fontSize: "0.875rem" }}
                  aria-hidden="true"
                ></i>
                <div className="d-flex align-items-center flex-wrap gap-2">
                  <span
                    className="fw-medium text-dark"
                    style={{ fontSize: "0.95rem" }}
                  >
                    {getFullName()}
                  </span>
                  <VerificationBadge />
                  <TypeBadge />
                </div>

                <div className="d-flex align-items-center flex-wrap gap-1 gap-md-2">
                  {profile.email && (
                    <>
                      <span className="text-muted mx-1 d-none d-md-inline">
                        •
                      </span>
                      <span
                        className="text-muted d-none d-md-inline"
                        style={{ fontSize: "0.875rem" }}
                      >
                        <i className="fa-solid fa-envelope me-1"></i>
                        {profile.email}
                      </span>
                    </>
                  )}
                  {profile.telephone && (
                    <>
                      <span className="text-muted mx-1 d-none d-lg-inline">
                        •
                      </span>
                      <span
                        className="text-muted d-none d-lg-inline"
                        style={{ fontSize: "0.875rem" }}
                      >
                        <i className="fa-solid fa-phone me-1"></i>
                        {profile.telephone}
                      </span>
                    </>
                  )}
                  {profile.date_naissance && (
                    <>
                      <span className="text-muted mx-1 d-none d-xl-inline">
                        •
                      </span>
                      <span
                        className="text-muted d-none d-xl-inline"
                        style={{ fontSize: "0.875rem" }}
                      >
                        <i className="fa-solid fa-birthday-cake me-1"></i>
                        {formatDateNaissance(profile.date_naissance)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <i
                  className="fa-solid fa-store text-muted"
                  style={{ fontSize: "0.875rem" }}
                  aria-hidden="true"
                ></i>
                <span
                  className="fw-medium text-dark"
                  style={{ fontSize: "0.95rem" }}
                >
                  Vendeur OSKAR
                </span>
              </div>
            )}

            {subtitle && (
              <p className="text-muted mb-0 mt-1 small">{subtitle}</p>
            )}
          </div>

          {/* Actions à droite */}
          <div className="d-flex align-items-center gap-2 gap-md-3 ms-auto flex-shrink-0">
            {/* Bouton Aide */}
            {showHelpButton && (
              <button
                onClick={handleHelpClick}
                onKeyDown={(e) => handleKeyDown(e, handleHelpClick)}
                className="btn btn-info d-flex align-items-center gap-2 px-3 py-2"
                aria-label="Centre d'aide"
                title="Centre d'aide et support"
                style={{
                  backgroundColor: "#0dcaf0",
                  borderColor: "#0dcaf0",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  whiteSpace: "nowrap",
                  minWidth: "fit-content",
                  transition:
                    "background-color 0.3s, border-color 0.3s, transform 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#0bb5d4";
                  e.currentTarget.style.borderColor = "#0bb5d4";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#0dcaf0";
                  e.currentTarget.style.borderColor = "#0dcaf0";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
                disabled={loading}
              >
                <i
                  className="fa-solid fa-question-circle"
                  aria-hidden="true"
                ></i>
                <span>Aide</span>
              </button>
            )}

            {/* Bouton Publier */}
            {showPublishButton && (
              <button
                onClick={handlePublish}
                onKeyDown={(e) => handleKeyDown(e, handlePublish)}
                className="btn btn-success d-flex align-items-center gap-2 px-3 py-2"
                aria-label="Publier une annonce"
                title="Publier une annonce"
                style={{
                  backgroundColor: "#16a34a",
                  borderColor: "#16a34a",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  whiteSpace: "nowrap",
                  minWidth: "fit-content",
                  transition:
                    "background-color 0.3s, border-color 0.3s, transform 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#15803d";
                  e.currentTarget.style.borderColor = "#15803d";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#16a34a";
                  e.currentTarget.style.borderColor = "#16a34a";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
                disabled={loading || !profile}
              >
                <i className="fa-solid fa-plus" aria-hidden="true"></i>
                <span>Publier une annonce</span>
              </button>
            )}

            {/* Groupe d'icônes */}
            <div className="d-flex align-items-center gap-1 border-start ps-2 ms-1">
              {/* Messages */}
              <button
                onClick={handleMessagesClick}
                onKeyDown={(e) => handleKeyDown(e, handleMessagesClick)}
                className="btn btn-light btn-sm position-relative p-2"
                aria-label="Messages"
                title="Messages"
                style={{ borderRadius: "8px" }}
                disabled={loading}
              >
                <i
                  className="fa-solid fa-envelope text-muted"
                  aria-hidden="true"
                ></i>
                <span
                  className="position-absolute top-0 end-0 translate-middle bg-primary rounded-circle"
                  style={{
                    width: "8px",
                    height: "8px",
                    border: "2px solid white",
                  }}
                  aria-label="Nouveaux messages"
                >
                  <span className="visually-hidden">Nouveaux messages</span>
                </span>
              </button>

              {/* Favoris */}
              <Link
                href="/dashboard-vendeur/favoris"
                className="btn btn-light btn-sm p-2"
                aria-label="Favoris"
                title="Favoris"
                style={{ borderRadius: "8px" }}
                onClick={() => setShowUserMenu(false)}
              >
                <i
                  className="fa-solid fa-heart text-muted"
                  aria-hidden="true"
                ></i>
              </Link>

              {/* Notification */}
              {showNotification && (
                <button
                  onClick={handleNotificationClick}
                  onKeyDown={(e) => handleKeyDown(e, handleNotificationClick)}
                  className="btn btn-light btn-sm position-relative p-2"
                  aria-label="Notifications"
                  title="Notifications"
                  style={{ borderRadius: "8px" }}
                  disabled={loading}
                >
                  <i
                    className="fa-regular fa-bell text-muted"
                    aria-hidden="true"
                  ></i>
                  {notificationCount > 0 && (
                    <span
                      className="position-absolute top-0 end-0 translate-middle bg-danger rounded-circle"
                      style={{
                        width: "8px",
                        height: "8px",
                        border: "2px solid white",
                      }}
                      aria-label={`${notificationCount} notification(s) non lue(s)`}
                    >
                      <span className="visually-hidden">
                        Notifications non lues
                      </span>
                    </span>
                  )}
                </button>
              )}

              {/* Export */}
              {showExportButton && (
                <button
                  onClick={handleExport}
                  onKeyDown={(e) => handleKeyDown(e, handleExport)}
                  className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 px-2 py-2"
                  aria-label="Exporter les données"
                  title="Exporter"
                  style={{
                    fontSize: "0.875rem",
                    whiteSpace: "nowrap",
                    borderRadius: "8px",
                  }}
                  disabled={loading}
                >
                  <i className="fa-solid fa-download" aria-hidden="true"></i>
                  <span className="d-none d-md-inline">Exporter</span>
                </button>
              )}
            </div>

            {/* Menu utilisateur */}
            <div className="position-relative ms-1">
              <button
                ref={userMenuButtonRef}
                onClick={() => setShowUserMenu(!showUserMenu)}
                onKeyDown={(e) =>
                  handleKeyDown(e, () => setShowUserMenu(!showUserMenu))
                }
                className="btn p-0 d-flex align-items-center gap-2 text-decoration-none"
                aria-expanded={showUserMenu}
                aria-label="Menu utilisateur"
                aria-haspopup="true"
                style={{ whiteSpace: "nowrap" }}
                disabled={loading}
                id="vendeur-menu-button"
              >
                <div className="d-flex align-items-center gap-2">
                  {loading ? (
                    <div
                      className="rounded-circle border border-2 border-success d-flex align-items-center justify-content-center"
                      style={{ width: "40px", height: "40px" }}
                      aria-label="Chargement du profil"
                    >
                      <span
                        className="spinner-border spinner-border-sm text-success"
                        aria-hidden="true"
                      ></span>
                    </div>
                  ) : (
                    <div className="position-relative">
                      <img
                        src={getAvatarUrl()}
                        alt={`Avatar de ${getFullName()}`}
                        width={40}
                        height={40}
                        className="rounded-circle border border-2 border-success"
                        style={{ objectFit: "cover" }}
                        onError={handleImageError}
                      />
                      {profile?.est_verifie && (
                        <div
                          className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-2 border-white d-flex align-items-center justify-content-center"
                          style={{ width: "16px", height: "16px" }}
                          aria-label="Compte vérifié"
                        >
                          <i
                            className="fa-solid fa-check text-white"
                            style={{ fontSize: "10px" }}
                          ></i>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="d-none d-xl-block text-start">
                    <div
                      className="fw-medium text-dark"
                      style={{ fontSize: "0.875rem", lineHeight: 1.2 }}
                    >
                      {getFullName()}
                    </div>
                    <div
                      className="text-muted"
                      style={{ fontSize: "0.75rem", lineHeight: 1.2 }}
                    >
                      {profile?.email || "Vendeur"}
                    </div>
                  </div>
                  <i
                    className={`fa-solid fa-chevron-down text-muted transition-transform ${showUserMenu ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  ></i>
                </div>
              </button>

              {/* Menu déroulant */}
              {showUserMenu && (
                <>
                  <div
                    className="position-fixed top-0 left-0 w-100 h-100 z-2"
                    onClick={() => setShowUserMenu(false)}
                    style={{ background: "transparent" }}
                    aria-hidden="true"
                  />
                  <div
                    ref={userMenuRef}
                    className="position-absolute end-0 mt-2 bg-white border rounded shadow-lg z-3"
                    style={{ minWidth: "280px" }}
                    role="menu"
                    aria-labelledby="vendeur-menu-button"
                  >
                    {profile && (
                      <div className="p-3 border-bottom">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <img
                            src={getAvatarUrl()}
                            alt={getFullName()}
                            width={48}
                            height={48}
                            className="rounded-circle border border-2 border-success"
                            style={{ objectFit: "cover" }}
                            onError={handleImageError}
                          />
                          <div>
                            <div className="fw-medium d-flex align-items-center">
                              {getFullName()}
                              {profile.est_verifie && (
                                <i
                                  className="fa-solid fa-check-circle text-success ms-1"
                                  title="Compte vérifié"
                                  aria-label="Compte vérifié"
                                ></i>
                              )}
                            </div>
                            <div className="text-muted small">
                              {profile.email}
                            </div>
                          </div>
                        </div>
                        <div className="d-flex flex-wrap gap-1">
                          <span
                            className={`badge ${profile.type === "premium" ? "bg-warning" : "bg-secondary"}`}
                            aria-label={`Type de compte: ${profile.type}`}
                          >
                            <i
                              className={`fa-solid ${profile.type === "premium" ? "fa-crown" : "fa-user"} me-1`}
                            ></i>
                            {profile.type === "premium"
                              ? "Premium"
                              : "Standard"}
                          </span>
                          {profile.est_verifie && (
                            <span
                              className="badge bg-success"
                              aria-label="Compte vérifié"
                            >
                              <i className="fa-solid fa-check me-1"></i>
                              Vérifié
                            </span>
                          )}
                          {profile.est_bloque && (
                            <span
                              className="badge bg-danger"
                              aria-label="Compte bloqué"
                            >
                              <i className="fa-solid fa-ban me-1"></i>
                              Bloqué
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="py-2">
                      <button
                        onClick={handleProfileClick}
                        onKeyDown={(e) => handleKeyDown(e, handleProfileClick)}
                        className="btn btn-link text-dark text-decoration-none d-flex align-items-center gap-2 w-100 px-3 py-2 hover-bg-light"
                        role="menuitem"
                      >
                        <i
                          className="fa-solid fa-user text-muted"
                          style={{ width: "20px" }}
                          aria-hidden="true"
                        ></i>
                        <span>Mon profil</span>
                      </button>

                      <button
                        onClick={handleMessagesClick}
                        onKeyDown={(e) => handleKeyDown(e, handleMessagesClick)}
                        className="btn btn-link text-dark text-decoration-none d-flex align-items-center gap-2 w-100 px-3 py-2 hover-bg-light"
                        role="menuitem"
                      >
                        <i
                          className="fa-solid fa-envelope text-muted"
                          style={{ width: "20px" }}
                          aria-hidden="true"
                        ></i>
                        <span>Messages</span>
                      </button>

                      <button
                        onClick={handleSettingsClick}
                        onKeyDown={(e) => handleKeyDown(e, handleSettingsClick)}
                        className="btn btn-link text-dark text-decoration-none d-flex align-items-center gap-2 w-100 px-3 py-2 hover-bg-light"
                        role="menuitem"
                      >
                        <i
                          className="fa-solid fa-cog text-muted"
                          style={{ width: "20px" }}
                          aria-hidden="true"
                        ></i>
                        <span>Paramètres</span>
                      </button>

                      <div className="border-top my-2" role="separator"></div>

                      <button
                        onClick={handleLogout}
                        onKeyDown={(e) => handleKeyDown(e, handleLogout)}
                        disabled={isLoggingOut}
                        className="btn btn-link text-danger text-decoration-none d-flex align-items-center gap-2 w-100 px-3 py-2 hover-bg-light"
                        role="menuitem"
                      >
                        {isLoggingOut ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                              style={{ width: "20px" }}
                              aria-hidden="true"
                            ></span>
                            <span>Déconnexion...</span>
                          </>
                        ) : (
                          <>
                            <i
                              className="fa-solid fa-right-from-bracket text-muted"
                              style={{ width: "20px" }}
                              aria-hidden="true"
                            ></i>
                            <span>Se déconnecter</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Modal de publication d'annonce */}
      <PublishAdModal
        visible={showPublishModal}
        onHide={handleClosePublishModal}
        isLoggedIn={isLoggedIn}
        onLoginRequired={() => {
          handleClosePublishModal();
          openLoginModal();
        }}
      />

      {/* Modal d'aide pour vendeur */}
      <HelpModalVendeur show={showHelpModal} onClose={handleCloseHelpModal} />

      <style jsx>{`
        .rotate-180 {
          transform: rotate(180deg);
        }
        .transition-transform {
          transition: transform 0.3s ease;
        }
        .z-2 {
          z-index: 1020;
        }
        .z-3 {
          z-index: 1030;
        }
        .hover-bg-light:hover {
          background-color: #f8f9fa;
        }
      `}</style>
    </>
  );
}
