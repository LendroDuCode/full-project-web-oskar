"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { api } from "@/lib/api-client";
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

  const router = useRouter();

  // Récupérer le profil de l'administrateur
  useEffect(() => {
    const fetchProfile = async () => {
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
    };

    fetchProfile();
  }, []);

  const handleExport = () => {
    console.log("Exporting dashboard data...");
    alert("Export fonctionnel - À implémenter");
  };

  const handlePublish = () => {
    console.log("Publishing content...");
    router.push("/publier-annonce");
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

  // Avatar par défaut avec les initiales
  const getDefaultAvatar = (nom: string) => {
    const initials = nom ? nom.charAt(0).toUpperCase() : "A";
    return `https://ui-avatars.com/api/?name=${initials}&background=16a34a&color=fff&size=40`;
  };

  // Formater le nom complet
  const getFullName = () => {
    if (!profile) return "Administrateur";
    return profile.nom_complet || profile.nom || "Administrateur";
  };

  // Récupérer l'avatar - VERSION SIMPLIFIÉE
  const getAvatarUrl = () => {
    if (!profile) return getDefaultAvatar("A");

    if (profile.avatar) {
      // Si l'avatar est déjà une URL complète, la retourner
      if (profile.avatar.startsWith("http")) {
        return profile.avatar;
      }

      // Sinon, construire l'URL complète
      // Votre API retourne: "admins%2F1767959717523-285269225.png"
      // Nous devons décoder et construire l'URL complète
      try {
        const decodedAvatar = decodeURIComponent(profile.avatar);
        return `http://localhost:3005/api/files/${decodedAvatar}`;
      } catch (error) {
        console.error("Erreur de décodage de l'avatar:", error);
        return getDefaultAvatar(profile.nom || "A");
      }
    }

    return getDefaultAvatar(profile.nom || "A");
  };

  // Obtenir le prénom pour l'affichage
  const getDisplayName = () => {
    if (!profile) return "Administrateur";

    if (profile.nom_complet) {
      const parts = profile.nom_complet.split(" ");
      return parts[0] || "Administrateur";
    }

    return profile.nom || "Administrateur";
  };

  // Obtenir le rôle formaté
  const getRoleDisplay = () => {
    if (!profile) return "Admin";
    return profile.isSuperAdmin ? "Super Admin" : profile.role || "Admin";
  };

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
            {/* Bouton Aider */}
            {showHelpButton && (
              <button
                onClick={() => setShowHelpModal(true)}
                className="btn btn-outline-primary d-flex align-items-center gap-2 px-3 py-2"
                aria-label="Aide et support"
                title="Aide et support"
                style={{
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  whiteSpace: "nowrap",
                  minWidth: "fit-content",
                }}
              >
                <i className="fa-solid fa-question-circle"></i>
                <span>Aider</span>
              </button>
            )}

            {/* Bouton Publier */}
            {showPublishButton && (
              <button
                onClick={handlePublish}
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
                }}
              >
                <i className="fa-solid fa-plus"></i>
                <span>Publier</span>
              </button>
            )}

            {/* Groupe d'icônes d'action */}
            <div className="d-flex align-items-center gap-1 border-start ps-2 ms-1">
              {/* Notification */}
              {showNotification && (
                <button
                  onClick={handleNotificationClick}
                  className="btn btn-light btn-sm position-relative p-2"
                  aria-label="Notifications"
                  title="Notifications"
                  style={{ borderRadius: "8px" }}
                >
                  <i className="fa-regular fa-bell text-muted"></i>
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
                  className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 px-2 py-2"
                  aria-label="Exporter les données"
                  title="Exporter"
                  style={{
                    fontSize: "0.875rem",
                    whiteSpace: "nowrap",
                    borderRadius: "8px",
                  }}
                >
                  <i className="fa-solid fa-download"></i>
                  <span className="d-none d-md-inline">Exporter</span>
                </button>
              )}
            </div>

            {/* Menu utilisateur avec avatar */}
            <div className="position-relative ms-1">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="btn p-0 d-flex align-items-center gap-2 text-decoration-none"
                aria-expanded={showUserMenu}
                aria-label="Menu utilisateur"
                style={{ whiteSpace: "nowrap" }}
                disabled={loading}
              >
                <div className="d-flex align-items-center gap-2">
                  {loading ? (
                    <div
                      className="rounded-circle border border-2 border-success d-flex align-items-center justify-content-center"
                      style={{ width: "40px", height: "40px" }}
                    >
                      <span className="spinner-border spinner-border-sm text-success"></span>
                    </div>
                  ) : (
                    <div className="position-relative">
                      <img
                        src={getAvatarUrl()}
                        alt={getFullName()}
                        width={40}
                        height={40}
                        className="rounded-circle border border-2 border-success"
                        style={{ objectFit: "cover" }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = getDefaultAvatar(profile?.nom || "A");
                        }}
                      />
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
                      {profile?.email || "Chargement..."}
                    </div>
                  </div>
                  <i
                    className={`fa-solid fa-chevron-down text-muted ${showUserMenu ? "rotate-180" : ""}`}
                  ></i>
                </div>
              </button>

              {/* Menu déroulant */}
              {showUserMenu && (
                <div
                  className="position-absolute end-0 mt-2 bg-white border rounded shadow-lg z-3"
                  style={{ minWidth: "200px" }}
                >
                  {profile && (
                    <div className="p-3 border-bottom">
                      <div className="fw-medium">{getFullName()}</div>
                      <div className="text-muted small">{profile.email}</div>
                      {profile.telephone && (
                        <div className="text-muted small mt-1">
                          <i className="fa-solid fa-phone me-1"></i>
                          {profile.telephone}
                        </div>
                      )}
                      {profile.civilite && (
                        <div className="text-muted small mt-1">
                          <i className="fa-solid fa-user-tie me-1"></i>
                          {profile.civilite.libelle}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="py-2">
                    <button
                      onClick={handleProfileClick}
                      className="btn btn-link text-dark text-decoration-none d-flex align-items-center gap-2 w-100 px-3 py-2 hover-bg-light"
                    >
                      <i className="fa-solid fa-user text-muted"></i>
                      <span>Mon profil</span>
                    </button>

                    <button
                      onClick={handleSettingsClick}
                      className="btn btn-link text-dark text-decoration-none d-flex align-items-center gap-2 w-100 px-3 py-2 hover-bg-light"
                    >
                      <i className="fa-solid fa-cog text-muted"></i>
                      <span>Paramètres</span>
                    </button>

                    <div className="border-top my-2"></div>

                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="btn btn-link text-danger text-decoration-none d-flex align-items-center gap-2 w-100 px-3 py-2 hover-bg-light"
                    >
                      {isLoggingOut ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                          ></span>
                          <span>Déconnexion...</span>
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-right-from-bracket"></i>
                          <span>Se déconnecter</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Styles */}
        <style jsx>{`
          .rotate-180 {
            transform: rotate(180deg);
            transition: transform 0.3s ease;
          }
          .z-3 {
            z-index: 1030;
          }
          .hover-bg-light:hover {
            background-color: #f8f9fa;
          }
          .hover-text-dark:hover {
            color: #1f2937 !important;
          }
        `}</style>
      </header>

      {/* Modal d'aide */}
      <HelpModal show={showHelpModal} onClose={() => setShowHelpModal(false)} />
    </>
  );
}
