"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { api } from "@/lib/api-client";
import PublishAdModal from "@/app/(front-office)/publication-annonce/page";
import HelpModal from "./HelpModal";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showPeriodSelector?: boolean;
  showNotification?: boolean;
  showExportButton?: boolean;
  showPublishButton?: boolean;
  showHelpButton?: boolean;
}

interface AdminProfile {
  uuid: string;
  email: string;
  nom: string;
  nom_complet: string;
  avatar?: string;
  type: string;
  role: string;
  isSuperAdmin: boolean;
  isTemp: boolean;
  telephone?: string;
  prenoms?: string;
  civilite?: {
    libelle: string;
  };
  is_verified?: boolean;
  is_locked?: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function DashboardHeader({
  subtitle = "",
  showPeriodSelector = true,
  showNotification = true,
  showExportButton = true,
  showPublishButton = true,
  showHelpButton = true,
}: HeaderProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("Aujourd'hui");
  const [notificationCount, setNotificationCount] = useState(1);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);

  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userMenuButtonRef = useRef<HTMLButtonElement>(null);

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

  // Récupérer le profil de l'administrateur
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(API_ENDPOINTS.AUTH.ADMIN.PROFILE);

      console.log("Profil reçu:", response.data);

      if (response.data?.data) {
        setProfile(response.data.data);
      } else if (response.data) {
        setProfile(response.data);
      }
    } catch (err: any) {
      console.error("Erreur lors de la récupération du profil:", err);
      setError(
        err.response?.data?.message || "Impossible de charger le profil",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Gestion des événements
  const handlePublish = useCallback(() => {
    setShowPublishModal(true);
  }, []);

  const handleClosePublishModal = useCallback(() => {
    setShowPublishModal(false);
  }, []);

  const handleHelpClick = useCallback(() => {
    setShowHelpModal(true);
  }, []);

  const handleCloseHelpModal = useCallback(() => {
    setShowHelpModal(false);
  }, []);

  // Pour l'admin, on considère qu'il est toujours connecté
  const handleLoginRequired = useCallback(() => {
    // Pour l'admin, on peut rediriger vers la page de connexion admin
    // ou simplement fermer le modal
    handleClosePublishModal();
  }, [handleClosePublishModal]);

  const handleExport = () => {
    console.log("Exporting dashboard data...");
    alert("Export fonctionnel - À implémenter");
  };

  const handleNotificationClick = () => {
    console.log("Opening notifications...");
    setNotificationCount(0);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      // Appeler l'API de déconnexion
      await api.post(API_ENDPOINTS.AUTH.ADMIN.LOGOUT);

      // Nettoyer le localStorage
      localStorage.removeItem("oskar_user");
      localStorage.removeItem("oskar_token");
      localStorage.removeItem("oskar_role");

      // Rediriger vers la page de connexion
      setTimeout(() => {
        router.push("/connexion/admin");
      }, 500);
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      // Nettoyer quand même le localStorage en cas d'erreur
      localStorage.removeItem("oskar_user");
      localStorage.removeItem("oskar_token");
      localStorage.removeItem("oskar_role");

      setTimeout(() => {
        router.push("/connexion/admin");
      }, 500);
    }
  };

  const handleProfileClick = () => {
    setShowUserMenu(false);
    router.push("/dashboard-admin/profile");
  };

  const handleSettingsClick = () => {
    setShowUserMenu(false);
    router.push("/dashboard-admin/settings");
  };

  // Utilitaires
  const getDefaultAvatar = useCallback((nom: string) => {
    const initials = nom ? nom.charAt(0).toUpperCase() : "A";
    return `https://ui-avatars.com/api/?name=${initials}&background=16a34a&color=fff&size=40`;
  }, []);

  const getFullName = useCallback(() => {
    if (!profile) return "Administrateur";
    return profile.nom_complet || profile.nom || "Administrateur";
  }, [profile]);

  const getDisplayName = useCallback(() => {
    if (!profile) return "Administrateur";

    if (profile.nom_complet) {
      const parts = profile.nom_complet.split(" ");
      return parts[0] || "Administrateur";
    }

    return profile.nom || "Administrateur";
  }, [profile]);

  const getAvatarUrl = useCallback(() => {
    if (!profile) return getDefaultAvatar("A");

    if (profile.avatar) {
      if (profile.avatar.startsWith("http")) {
        return profile.avatar;
      }

      try {
        const decodedAvatar = decodeURIComponent(profile.avatar);
        return `http://localhost:3005/api/files/${decodedAvatar}`;
      } catch (error) {
        console.error("Erreur de décodage de l'avatar:", error);
        return getDefaultAvatar(profile.nom || "A");
      }
    }

    return getDefaultAvatar(profile.nom || "A");
  }, [profile, getDefaultAvatar]);

  const getRoleDisplay = useCallback(() => {
    if (!profile) return "Admin";
    return profile.isSuperAdmin ? "Super Admin" : profile.role || "Admin";
  }, [profile]);

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
    target.src = getDefaultAvatar(profile?.nom || "A");
  };

  // L'admin est considéré comme toujours connecté dans ce contexte
  const isAdminLoggedIn = !!profile;

  return (
    <>
      <header
        id="dashboard-header"
        className="bg-white border-bottom px-3 px-md-4 py-2 shadow-sm"
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
              Bienvenue, {getDisplayName()} 👋
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
                  Chargement des informations...
                </span>
              </div>
            ) : error ? (
              <div className="d-flex align-items-center gap-2">
                <i className="fa-solid fa-exclamation-circle text-danger"></i>
                <span className="text-danger small">{error}</span>
              </div>
            ) : profile ? (
              <div className="d-flex flex-wrap align-items-center gap-2">
                <i
                  className="fa-solid fa-user text-muted"
                  style={{ fontSize: "0.875rem" }}
                ></i>
                <span
                  className="fw-medium text-dark"
                  style={{ fontSize: "0.95rem" }}
                >
                  {getFullName()}
                </span>

                {/* Badge du rôle */}
                <span
                  className="badge bg-success ms-2"
                  style={{ fontSize: "0.7rem" }}
                >
                  <i className="fa-solid fa-user-shield me-1"></i>
                  {getRoleDisplay()}
                </span>

                <span className="text-muted mx-1 d-none d-md-inline">•</span>
                <span
                  className="text-muted d-none d-md-inline"
                  style={{ fontSize: "0.875rem" }}
                >
                  {profile.email}
                </span>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <i
                  className="fa-solid fa-user text-muted"
                  style={{ fontSize: "0.875rem" }}
                ></i>
                <span
                  className="fw-medium text-dark"
                  style={{ fontSize: "0.95rem" }}
                >
                  Administrateur
                </span>
              </div>
            )}

            {subtitle && (
              <p className="text-muted mb-0 mt-1 small">{subtitle}</p>
            )}
          </div>

          {/* Actions à droite - Groupe compact */}
          <div className="d-flex align-items-center gap-2 gap-md-3 ms-auto flex-shrink-0">
            {/* Bouton Aide */}
            {showHelpButton && (
              <button
                onClick={handleHelpClick}
                onKeyDown={(e) => handleKeyDown(e, handleHelpClick)}
                className="btn btn-outline-primary d-flex align-items-center gap-2 px-3 py-2"
                aria-label="Aide et support"
                title="Aide et support"
                style={{
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  whiteSpace: "nowrap",
                  minWidth: "fit-content",
                  transition:
                    "background-color 0.3s, border-color 0.3s, transform 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#e7f1ff";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "";
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
                disabled={loading}
              >
                <i className="fa-solid fa-plus" aria-hidden="true"></i>
                <span>Publier une annonce</span>
              </button>
            )}

            {/* Groupe d'icônes d'action */}
            <div className="d-flex align-items-center gap-1 border-start ps-2 ms-1">
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
                    >
                      <span className="visually-hidden">
                        Notifications non lues
                      </span>
                    </span>
                  )}
                </button>
              )}

              {/* Bouton exporter */}
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

            {/* Menu utilisateur avec avatar */}
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
                id="admin-menu-button"
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
                      {profile?.is_verified && (
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
                      {getDisplayName()}
                    </div>
                    <div
                      className="text-muted"
                      style={{ fontSize: "0.75rem", lineHeight: 1.2 }}
                    >
                      {profile?.email || "Administrateur"}
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
                    aria-labelledby="admin-menu-button"
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
                              {profile.is_verified && (
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
                            className={`badge ${profile.isSuperAdmin ? "bg-purple" : "bg-success"}`}
                            aria-label={`Rôle: ${getRoleDisplay()}`}
                          >
                            <i
                              className={`fa-solid ${profile.isSuperAdmin ? "fa-crown" : "fa-user-shield"} me-1`}
                            ></i>
                            {getRoleDisplay()}
                          </span>
                          {profile.is_verified && (
                            <span
                              className="badge bg-success"
                              aria-label="Compte vérifié"
                            >
                              <i className="fa-solid fa-check me-1"></i>
                              Vérifié
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
      </header>

      {/* Modal de publication d'annonce */}
      <PublishAdModal
        visible={showPublishModal}
        onHide={handleClosePublishModal}
        isLoggedIn={isAdminLoggedIn}
        onLoginRequired={handleLoginRequired}
      />

      {/* Modal d'aide */}
      <HelpModal show={showHelpModal} onClose={handleCloseHelpModal} />
    </>
  );
}
