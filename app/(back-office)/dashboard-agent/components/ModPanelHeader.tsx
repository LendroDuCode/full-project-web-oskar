"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { api } from "@/lib/api-client";
import { useAuth } from "@/app/(front-office)/auth/AuthContext";
import PublishAdModal from "@/app/(front-office)/publication-annonce/page";
import HelpModal from "./HelpModal";

// ============================================
// FONCTION DE CONSTRUCTION D'URL D'IMAGE ROBUSTE
// ============================================
const buildImageUrl = (imagePath: string | null): string | null => {
  if (!imagePath) return null;

  // Nettoyer le chemin des espaces indésirables
  let cleanPath = imagePath
    .replace(/\s+/g, "") // Supprimer tous les espaces
    .replace(/-/g, "-") // Normaliser les tirets
    .trim();

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://oskar-api.mysonec.pro";
  const filesUrl = process.env.NEXT_PUBLIC_FILES_URL || "/api/files";

  // ✅ CAS 1: Déjà une URL complète
  if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
    if (cleanPath.includes("localhost")) {
      const productionUrl = apiUrl.replace(/\/api$/, "");
      return cleanPath.replace(/http:\/\/localhost(:\d+)?/g, productionUrl);
    }
    return cleanPath;
  }

  // ✅ CAS 2: Chemin avec %2F (déjà encodé)
  if (cleanPath.includes("%2F")) {
    // Nettoyer les espaces autour de %2F
    const finalPath = cleanPath.replace(/%2F\s+/, "%2F");
    return `${apiUrl}${filesUrl}/${finalPath}`;
  }

  // ✅ CAS 3: Chemin simple
  return `${apiUrl}${filesUrl}/${cleanPath}`;
};

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showPeriodSelector?: boolean;
  showNotification?: boolean;
  showExportButton?: boolean;
  showPublishButton?: boolean;
  showHelpButton?: boolean;
}

interface AgentProfile {
  uuid: string;
  nom: string;
  prenoms: string;
  email: string;
  telephone?: string;
  avatar?: string;
  avatar_key?: string;
  civilite_uuid?: string;
  est_bloque: boolean;
  is_admin: boolean;
  statut: string;
  role_uuid: string;
  created_at: string;
  updated_at: string;
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
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const mountedRef = useRef(true);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ajout du contexte d'authentification
  const { isLoggedIn, openLoginModal } = useAuth();

  // ✅ FONCTION CORRIGÉE: Vérifier si le token est valide sans redirection
  const checkTokenValidity = useCallback((): boolean => {
    try {
      const token = localStorage.getItem("oskar_token");
      if (!token) return false;

      // Vérifier si le token est expiré en décodant le payload
      const base64Url = token.split('.')[1];
      if (!base64Url) return false;

      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const payload = JSON.parse(jsonPayload);
      const expiry = payload.exp;

      if (!expiry) return true; // Pas de date d'expiration

      const now = Math.floor(Date.now() / 1000);
      return now < expiry;
    } catch (error) {
      console.error("❌ Erreur lors de la vérification du token:", error);
      return false;
    }
  }, []);

  // ✅ FONCTION CORRIGÉE: Redirection sécurisée avec protection
  const safeRedirect = useCallback((path: string) => {
    if (isRedirecting || !mountedRef.current) return;
    
    setIsRedirecting(true);
    
    // Nettoyer tout timeout existant
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
    }
    
    redirectTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        router.push(path);
      }
    }, 100);
  }, [router, isRedirecting]);

  // ✅ FONCTION CORRIGÉE: Nettoyage et redirection
  const handleTokenExpired = useCallback(() => {
    console.log("🚨 Token expiré - Déconnexion");

    // 1. Nettoyer tous les stockages
    localStorage.removeItem("oskar_user");
    localStorage.removeItem("oskar_token");
    localStorage.removeItem("temp_token");
    localStorage.removeItem("tempToken");
    localStorage.removeItem("token");
    localStorage.removeItem("oskar_role");
    localStorage.removeItem("oskar_user_type");

    // 2. Nettoyer les cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=; expires=" + new Date().toUTCString() + "; path=/");
    });

    // 3. Déclencher l'événement de déconnexion
    const logoutEvent = new CustomEvent("oskar-logout", {
      detail: { timestamp: Date.now(), reason: "token_expired", userType: "agent" },
    });
    window.dispatchEvent(logoutEvent);

    // 4. Redirection sécurisée
    safeRedirect("/");
  }, [safeRedirect]);

  // ✅ Vérifier le token UNE SEULE fois au montage
  useEffect(() => {
    mountedRef.current = true;
    
    const token = localStorage.getItem("oskar_token");
    
    if (!token) {
      console.log("⏰ Pas de token trouvé");
      safeRedirect("/");
      return;
    }

    if (!checkTokenValidity()) {
      console.log("⏰ Token invalide au chargement");
      handleTokenExpired();
    }

    return () => {
      mountedRef.current = false;
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [checkTokenValidity, handleTokenExpired, safeRedirect]);

  // Fermer le menu utilisateur en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Écouter l'événement de déconnexion
  useEffect(() => {
    const handleLogoutEvent = (event: CustomEvent) => {
      console.log("🔄 DashboardHeader Agent - Logout event detected", event.detail);
      
      if (!mountedRef.current) return;

      // Nettoyer l'état
      setProfile(null);
      setShowUserMenu(false);
      setError(null);

      // Rediriger vers la page d'accueil si ce n'est pas déjà fait
      if (event.detail?.reason !== "token_expired" && !isRedirecting) {
        safeRedirect("/");
      }
    };

    window.addEventListener("oskar-logout", handleLogoutEvent as EventListener);

    return () => {
      window.removeEventListener("oskar-logout", handleLogoutEvent as EventListener);
    };
  }, [safeRedirect, isRedirecting]);

  // Récupérer le profil de l'agent
  useEffect(() => {
    const fetchProfile = async () => {
      if (!mountedRef.current || isRedirecting) return;

      try {
        setLoading(true);
        setError(null);
        setAvatarError(false);

        const token = localStorage.getItem("oskar_token");
        if (!token) {
          console.log("⏰ Token manquant pour fetchProfile");
          return;
        }

        const response = await api.get(API_ENDPOINTS.AGENTS.PROFIL);

        if (!mountedRef.current) return;

        if (response.data?.type === "success" && response.data.data) {
          setProfile(response.data.data);
        } else if (response.data?.data) {
          setProfile(response.data.data);
        } else {
          setProfile(response.data || null);
        }
      } catch (err: any) {
        if (!mountedRef.current) return;

        console.error("Erreur lors de la récupération du profil agent:", err);

        // Vérifier si c'est une erreur 401 (token expiré)
        if (err?.status === 401 || err?.response?.status === 401 || err?.message?.includes("401")) {
          console.log("🚨 Erreur 401 détectée dans fetchProfile");
          handleTokenExpired();
          return;
        }

        if (err.response?.status === 403) {
          setError(
            "Accès interdit - Vous n'êtes pas autorisé à accéder à cette ressource",
          );
        } else {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Impossible de charger le profil",
          );
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchProfile();
  }, [handleTokenExpired, isRedirecting]);

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
    setNotificationCount(0);
  };

  const handleLogout = async () => {
    if (isLoggingOut || isRedirecting) return;

    try {
      setIsLoggingOut(true);

      // Appeler l'API de déconnexion si elle existe
      try {
     //   await api.post(API_ENDPOINTS.AUTH.LOGOUT);
      } catch (error) {
        console.log("API de déconnexion non disponible");
      }

      // Nettoyer le localStorage
      localStorage.removeItem("oskar_user");
      localStorage.removeItem("oskar_token");
      localStorage.removeItem("temp_token");
      localStorage.removeItem("tempToken");
      localStorage.removeItem("token");
      localStorage.removeItem("oskar_role");
      localStorage.removeItem("oskar_user_type");

      // Déclencher l'événement de déconnexion
      const logoutEvent = new CustomEvent("oskar-logout", {
        detail: { timestamp: Date.now(), reason: "manual_logout", userType: "agent" },
      });
      window.dispatchEvent(logoutEvent);

      // Redirection sécurisée
      safeRedirect("/");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      
      // Nettoyer quand même
      localStorage.removeItem("oskar_user");
      localStorage.removeItem("oskar_token");
      localStorage.removeItem("temp_token");
      localStorage.removeItem("tempToken");
      localStorage.removeItem("token");
      localStorage.removeItem("oskar_role");
      localStorage.removeItem("oskar_user_type");

      safeRedirect("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Gestion des clics sur les menus
  const handleHomeClick = () => {
    setShowUserMenu(false);
    if (!isRedirecting) {
      router.push("/");
    }
  };

  const handleProfileClick = () => {
    setShowUserMenu(false);
    if (!isRedirecting) {
      router.push("/dashboard-agent/profile");
    }
  };

  const handleSettingsClick = () => {
    setShowUserMenu(false);
    if (!isRedirecting) {
      router.push("/dashboard-agent/parametres");
    }
  };

  const handleMessagesClick = () => {
    setShowUserMenu(false);
    if (!isRedirecting) {
      router.push("/dashboard-agent/messages");
    }
  };

  const handleAnnoncesClick = () => {
    setShowUserMenu(false);
    if (!isRedirecting) {
      router.push("/dashboard-agent/annonces");
    }
  };

  // Utilitaires
  const getDefaultAvatar = useCallback((nom: string, prenoms: string) => {
    const initials =
      `${prenoms?.charAt(0) || ""}${nom?.charAt(0) || ""}`.toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=16a34a&color=fff&size=40`;
  }, []);

  const getFullName = useCallback(() => {
    if (!profile) return "Agent";
    return `${profile.prenoms} ${profile.nom}`;
  }, [profile]);

  const getAvatarUrl = useCallback(() => {
    if (!profile) return getDefaultAvatar("", "");

    if (avatarError) {
      return getDefaultAvatar(profile.nom, profile.prenoms);
    }

    if ((profile as any).avatar_key) {
      const url = buildImageUrl((profile as any).avatar_key);
      if (url) return url;
    }

    if (profile.avatar) {
      const url = buildImageUrl(profile.avatar);
      if (url) return url;
    }

    return getDefaultAvatar(profile.nom, profile.prenoms);
  }, [profile, getDefaultAvatar, avatarError]);

  const getUserRole = useCallback(() => {
    if (!profile) return "Agent";
    if (profile.is_admin) return "Agent Administrateur";
    return "Agent";
  }, [profile]);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, []);

  const handleImageError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const target = e.target as HTMLImageElement;

      if (target.src.includes("localhost")) {
        const productionUrl =
          process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") ||
          "https://oskar-api.mysonec.pro";
        target.src = target.src.replace(
          /http:\/\/localhost(:\d+)?/g,
          productionUrl,
        );
        return;
      }

      if (target.src.includes("%20")) {
        target.src = target.src.replace(/%20/g, "");
        return;
      }

      setAvatarError(true);
      target.src = getDefaultAvatar(profile?.nom || "", profile?.prenoms || "");
    },
    [profile, getDefaultAvatar],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, handler: () => void) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handler();
      }
    },
    [],
  );

  return (
    <>
      <header
        id="dashboard-header"
        className="bg-white border-bottom px-3 px-md-4 py-2"
        style={{ minHeight: "64px" }}
        role="banner"
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
              Bienvenue dans votre espace Agent OSKAR
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
                  aria-hidden="true"
                ></i>
                <span
                  className="fw-medium text-dark"
                  style={{ fontSize: "0.95rem" }}
                >
                  {getFullName()}
                </span>
                <span
                  className="badge bg-info ms-1"
                  style={{ fontSize: "0.7rem" }}
                  aria-label={`Rôle: ${getUserRole()}`}
                >
                  {getUserRole()}
                </span>
                {profile.email && (
                  <>
                    <span
                      className="text-muted mx-1 d-none d-md-inline"
                      aria-hidden="true"
                    >
                      •
                    </span>
                    <span
                      className="text-muted d-none d-md-inline"
                      style={{ fontSize: "0.875rem" }}
                    >
                      {profile.email}
                    </span>
                  </>
                )}
                {profile.telephone && (
                  <>
                    <span
                      className="text-muted mx-1 d-none d-lg-inline"
                      aria-hidden="true"
                    >
                      •
                    </span>
                    <span
                      className="text-muted d-none d-lg-inline"
                      style={{ fontSize: "0.875rem" }}
                    >
                      <i
                        className="fa-solid fa-phone me-1"
                        aria-hidden="true"
                      ></i>
                      {profile.telephone}
                    </span>
                  </>
                )}
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <i
                  className="fa-solid fa-user text-muted"
                  style={{ fontSize: "0.875rem" }}
                  aria-hidden="true"
                ></i>
                <span
                  className="fw-medium text-dark"
                  style={{ fontSize: "0.95rem" }}
                >
                  Agent
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
                disabled={loading || isRedirecting}
              >
                <i
                  className="fa-solid fa-question-circle"
                  aria-hidden="true"
                ></i>
                <span>Aide</span>
              </button>
            )}

            {/* Bouton Publier (accentué) */}
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
                disabled={loading || !profile || isRedirecting}
              >
                <i className="fa-solid fa-plus" aria-hidden="true"></i>
                <span>Publier une annonce</span>
              </button>
            )}

            {/* Groupe d'icônes d'action */}
            <div className="d-flex align-items-center gap-1 border-start ps-2 ms-1">
              {/* Messages */}
              <button
                onClick={handleMessagesClick}
                onKeyDown={(e) => handleKeyDown(e, handleMessagesClick)}
                className="btn btn-light btn-sm position-relative p-2"
                aria-label="Messages"
                title="Messages"
                style={{ borderRadius: "8px" }}
                disabled={loading || isRedirecting}
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

              {/* Notification */}
              {showNotification && (
                <button
                  onClick={handleNotificationClick}
                  onKeyDown={(e) => handleKeyDown(e, handleNotificationClick)}
                  className="btn btn-light btn-sm position-relative p-2"
                  aria-label="Notifications"
                  title="Notifications"
                  style={{ borderRadius: "8px" }}
                  disabled={loading || isRedirecting}
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
            </div>

            {/* Menu utilisateur avec avatar */}
            <div className="position-relative ms-1" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                onKeyDown={(e) =>
                  handleKeyDown(e, () => setShowUserMenu(!showUserMenu))
                }
                className="btn p-0 d-flex align-items-center gap-2 text-decoration-none"
                aria-expanded={showUserMenu}
                aria-label="Menu utilisateur"
                aria-controls="user-dropdown-menu"
                style={{ whiteSpace: "nowrap" }}
                disabled={loading || isRedirecting}
                id="user-menu-button"
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
                      {/* Indicateur de statut */}
                      <span
                        className={`position-absolute bottom-0 end-0 translate-middle p-1 rounded-circle border border-2 border-white ${
                          profile?.est_bloque ? "bg-danger" : "bg-success"
                        }`}
                        aria-label={
                          profile?.est_bloque ? "Compte bloqué" : "Compte actif"
                        }
                      >
                        <span className="visually-hidden">
                          {profile?.est_bloque
                            ? "Compte bloqué"
                            : "Compte actif"}
                        </span>
                      </span>
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
                      {profile?.email || "Chargement..."}
                    </div>
                  </div>
                  <i
                    className={`fa-solid fa-chevron-down text-muted ${showUserMenu ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  ></i>
                </div>
              </button>

              {/* Menu déroulant */}
              {showUserMenu && (
                <div
                  id="user-dropdown-menu"
                  className="position-absolute end-0 mt-2 bg-white border rounded shadow-lg z-3"
                  style={{ minWidth: "280px" }}
                  role="menu"
                  aria-labelledby="user-menu-button"
                >
                  {profile && (
                    <div className="p-3 border-bottom">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <div className="fw-medium">{getFullName()}</div>
                        <span
                          className={`badge ${profile.est_bloque ? "bg-danger" : "bg-success"}`}
                          aria-label={
                            profile.est_bloque
                              ? "Compte bloqué"
                              : "Compte actif"
                          }
                        >
                          {profile.est_bloque ? "Bloqué" : "Actif"}
                        </span>
                        {profile.is_admin && (
                          <span
                            className="badge bg-info"
                            aria-label="Administrateur"
                          >
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="text-muted small mb-2">
                        {profile.email}
                      </div>
                      {profile.telephone && (
                        <div className="text-muted small mb-1">
                          <i
                            className="fa-solid fa-phone me-1"
                            aria-hidden="true"
                          ></i>
                          {profile.telephone}
                        </div>
                      )}
                      <div className="text-muted small">
                        <i
                          className="fa-solid fa-calendar me-1"
                          aria-hidden="true"
                        ></i>
                        Membre depuis {formatDate(profile.created_at)}
                      </div>
                      <div className="text-muted small mt-1">
                        <i
                          className="fa-solid fa-id-card me-1"
                          aria-hidden="true"
                        ></i>
                        ID: {profile.uuid.substring(0, 8)}...
                      </div>
                    </div>
                  )}

                  <div className="py-2">
                    {/* Accueil */}
                    <button
                      onClick={handleHomeClick}
                      onKeyDown={(e) => handleKeyDown(e, handleHomeClick)}
                      className="btn btn-link text-dark text-decoration-none d-flex align-items-center gap-2 w-100 px-3 py-2 hover-bg-light"
                      disabled={!profile || isRedirecting}
                      role="menuitem"
                      style={{ borderBottom: "1px solid #f0f0f0" }}
                    >
                      <i
                        className="fa-solid fa-home text-primary"
                        aria-hidden="true"
                      ></i>
                      <span className="fw-medium">Accueil</span>
                    </button>

                    {/* Mon profil */}
                    <button
                      onClick={handleProfileClick}
                      onKeyDown={(e) => handleKeyDown(e, handleProfileClick)}
                      className="btn btn-link text-dark text-decoration-none d-flex align-items-center gap-2 w-100 px-3 py-2 hover-bg-light"
                      disabled={!profile || isRedirecting}
                      role="menuitem"
                    >
                      <i
                        className="fa-solid fa-user text-muted"
                        aria-hidden="true"
                      ></i>
                      <span>Mon profil</span>
                    </button>

                    {/* Mes annonces */}
                    <button
                      onClick={handleAnnoncesClick}
                      onKeyDown={(e) => handleKeyDown(e, handleAnnoncesClick)}
                      className="btn btn-link text-dark text-decoration-none d-flex align-items-center gap-2 w-100 px-3 py-2 hover-bg-light"
                      disabled={!profile || isRedirecting}
                      role="menuitem"
                    >
                      <i
                        className="fa-solid fa-list text-muted"
                        aria-hidden="true"
                      ></i>
                      <span>Mes annonces</span>
                    </button>

                    {/* Messages */}
                    <button
                      onClick={handleMessagesClick}
                      onKeyDown={(e) => handleKeyDown(e, handleMessagesClick)}
                      className="btn btn-link text-dark text-decoration-none d-flex align-items-center gap-2 w-100 px-3 py-2 hover-bg-light"
                      disabled={!profile || isRedirecting}
                      role="menuitem"
                    >
                      <i
                        className="fa-solid fa-envelope text-muted"
                        aria-hidden="true"
                      ></i>
                      <span>Messages</span>
                    </button>

                    <div className="border-top my-2" role="separator"></div>

                    {/* Déconnexion */}
                    <button
                      onClick={handleLogout}
                      onKeyDown={(e) => handleKeyDown(e, handleLogout)}
                      disabled={isLoggingOut || isRedirecting}
                      className="btn btn-link text-danger text-decoration-none d-flex align-items-center gap-2 w-100 px-3 py-2 hover-bg-light"
                      role="menuitem"
                    >
                      {isLoggingOut ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          <span>Déconnexion...</span>
                        </>
                      ) : (
                        <>
                          <i
                            className="fa-solid fa-right-from-bracket"
                            aria-hidden="true"
                          ></i>
                          <span>Se déconnecter</span>
                        </>
                      )}
                    </button>
                  </div>

                  {profile && (
                    <div className="border-top px-3 py-2 bg-light">
                      <div className="text-muted small">
                        Statut:{" "}
                        <span className="fw-medium">{profile.statut}</span>
                      </div>
                      <div className="text-muted small">
                        Dernière mise à jour: {formatDate(profile.updated_at)}
                      </div>
                    </div>
                  )}
                </div>
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

      {/* Modal d'aide */}
      <HelpModal show={showHelpModal} onClose={handleCloseHelpModal} />

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
    </>
  );
}