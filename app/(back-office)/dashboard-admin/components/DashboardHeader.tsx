// app/(back-office)/dashboard-admin/components/DashboardHeader.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faEnvelope,
  faCheckCircle,
  faTimesCircle,
  faExclamationCircle,
  faInfoCircle,
  faTrash,
  faCheck,
  faEye,
  faEnvelope as faEnvelopeIcon,
} from "@fortawesome/free-solid-svg-icons";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { api } from "@/lib/api-client";
import PublishAdModal from "@/app/(front-office)/publication-annonce/page";
import HelpModal from "./HelpModal";
import { buildImageUrl } from "@/app/shared/utils/image-utils"; // ← Import centralisé

// ============================================
// FONCTION POUR LE FALLBACK AVATAR
// ============================================
const getDefaultAvatar = (nom: string = "A", size: number = 40) => {
  const initials = nom ? nom.charAt(0).toUpperCase() : "A";
  return `https://ui-avatars.com/api/?name=${initials}&background=16a34a&color=fff&size=${size}`;
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

interface AdminProfile {
  uuid: string;
  email: string;
  nom: string;
  nom_complet: string;
  avatar?: string;
  avatar_key?: string;
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

interface Notification {
  id: string;
  type:
    | "new-message"
    | "message-read"
    | "info"
    | "success"
    | "warning"
    | "error";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  messageId?: string;
  expediteur?: string;
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
  const [notificationCount, setNotificationCount] = useState(0);
  const [messageCount, setMessageCount] = useState(3);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [avatarError, setAvatarError] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ FONCTION CORRIGÉE: Vérifier si le token est valide sans redirection
  const isTokenValid = useCallback((): boolean => {
    try {
      const token = api.getToken();
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
    console.log("🚨 Token expiré - Déconnexion admin");

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
      detail: { timestamp: Date.now(), reason: "token_expired", userType: "admin" },
    });
    window.dispatchEvent(logoutEvent);

    // 4. Redirection sécurisée
    safeRedirect("/");
  }, [safeRedirect]);

  // ✅ Vérifier le token UNE SEULE fois au montage
  useEffect(() => {
    mountedRef.current = true;
    
    const token = api.getToken();
    
    if (!token) {
      console.log("⏰ Pas de token admin trouvé");
      safeRedirect("/");
      return;
    }

    if (!isTokenValid()) {
      console.log("⏰ Token admin invalide au chargement");
      handleTokenExpired();
    }

    return () => {
      mountedRef.current = false;
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [isTokenValid, handleTokenExpired, safeRedirect]);

  // Détection de la taille d'écran
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      // Fermer le menu mobile sur passage en desktop
      if (window.innerWidth >= 992) {
        setIsMobileMenuOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Breakpoints
  const isMobile = windowWidth < 576;
  const isTablet = windowWidth >= 576 && windowWidth < 992;
  const isDesktop = windowWidth >= 992;
  const isSmallMobile = windowWidth < 375;
  const isLargeDesktop = windowWidth >= 1400;

  // Écouter l'événement de déconnexion
  useEffect(() => {
    const handleLogoutEvent = (event: CustomEvent) => {
      console.log("🔄 DashboardHeader Admin - Logout event detected", event.detail);

      if (!mountedRef.current) return;

      // Nettoyer l'état
      setProfile(null);
      setShowUserMenu(false);
      setIsMobileMenuOpen(false);
      setShowNotifications(false);
      setForceUpdate((prev) => prev + 1);

      // Si c'est une expiration de token, ne pas rediriger à nouveau
      if (event.detail?.reason === "token_expired") {
        console.log("⏰ Expiration de token déjà gérée");
      } else {
        // Rediriger vers la page d'accueil
        safeRedirect("/");
      }
    };

    window.addEventListener("oskar-logout", handleLogoutEvent as EventListener);

    return () => {
      window.removeEventListener("oskar-logout", handleLogoutEvent as EventListener);
    };
  }, [safeRedirect]);

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

      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest(".notification-toggle")
      ) {
        setShowNotifications(false);
      }

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest(".mobile-menu-toggle")
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Empêcher le scroll quand le menu mobile est ouvert
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Navigation clavier
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (showUserMenu) setShowUserMenu(false);
        if (showNotifications) setShowNotifications(false);
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showUserMenu, showNotifications, isMobileMenuOpen]);

  // Récupérer le profil de l'administrateur
  const fetchProfile = useCallback(async () => {
    if (!mountedRef.current || isRedirecting) return;

    try {
      setLoading(true);
      setError(null);
      setAvatarError(false);

      const token = api.getToken();
      if (!token) {
        console.log("⏰ Token manquant pour fetchProfile admin");
        return;
      }

      const response = await api.get(API_ENDPOINTS.AUTH.ADMIN.PROFILE);

      if (!mountedRef.current) return;

      console.log("Profil admin reçu:", response.data);

      if (response.data?.data) {
        setProfile(response.data.data);
      } else if (response.data) {
        setProfile(response.data);
      }
    } catch (err: any) {
      if (!mountedRef.current) return;

      console.error("Erreur lors de la récupération du profil admin:", err);
      
      // Vérifier si c'est une erreur 401 (token expiré)
      if (err?.status === 401 || err?.response?.status === 401 || err?.message?.includes("401")) {
        console.log("🚨 Erreur 401 détectée dans fetchProfile admin");
        handleTokenExpired();
        return;
      }

      setError(
        err.response?.data?.message || "Impossible de charger le profil",
      );
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [handleTokenExpired, isRedirecting]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile, forceUpdate]);

  // ============================================
  // FONCTIONS DE NOTIFICATION
  // ============================================
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "à l'instant";
    if (diffMins < 60) return `il y a ${diffMins} min`;
    if (diffHours < 24) return `il y a ${diffHours} h`;
    if (diffDays < 7) return `il y a ${diffDays} j`;
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const addNotification = useCallback(
    (
      type: Notification["type"],
      title: string,
      message: string,
      options?: {
        messageId?: string;
        expediteur?: string;
      },
    ) => {
      const newNotification: Notification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        title,
        message,
        timestamp: new Date(),
        read: false,
        messageId: options?.messageId,
        expediteur: options?.expediteur,
      };

      setNotifications((prev) => [newNotification, ...prev]);
      setNotificationCount((prev) => prev + 1);
    },
    [],
  );

  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif,
      ),
    );
    setNotificationCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    setNotificationCount(0);
  }, []);

  const removeNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== notificationId);
      const unreadCount = updated.filter((n) => !n.read).length;
      setNotificationCount(unreadCount);
      return updated;
    });
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setNotificationCount(0);
  }, []);

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
    handleClosePublishModal();
  }, [handleClosePublishModal]);

  const handleExport = () => {
    console.log("Exporting dashboard data...");
    addNotification("info", "Export", "Fonctionnalité d'export à implémenter");
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleMessagesClick = async () => {
    try {
      console.log("Opening messages...");
      setMessageCount(0);
      if (!isRedirecting) {
        router.push("/dashboard-admin/messages");
      }
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error("Erreur lors de la navigation vers les messages:", error);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut || isRedirecting) return;

    try {
      setIsLoggingOut(true);

      // Appeler l'API de déconnexion
      await api.post(API_ENDPOINTS.AUTH.ADMIN.LOGOUT);

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
        detail: { timestamp: Date.now(), reason: "manual_logout", userType: "admin" },
      });
      window.dispatchEvent(logoutEvent);

      // Redirection sécurisée
      safeRedirect("/");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);

      // Nettoyer quand même le localStorage en cas d'erreur
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

  const handleHomeClick = () => {
    setShowUserMenu(false);
    setIsMobileMenuOpen(false);
    setShowNotifications(false);
    if (!isRedirecting) {
      router.push("/");
    }
  };

  const handleMessagesMenuClick = () => {
    setShowUserMenu(false);
    setIsMobileMenuOpen(false);
    setShowNotifications(false);
    if (!isRedirecting) {
      router.push("/dashboard-admin/messages");
    }
  };

  const handleProfileClick = () => {
    setShowUserMenu(false);
    setIsMobileMenuOpen(false);
    setShowNotifications(false);
    if (!isRedirecting) {
      router.push("/dashboard-admin/profile");
    }
  };

  const handleSettingsClick = () => {
    setShowUserMenu(false);
    setIsMobileMenuOpen(false);
    setShowNotifications(false);
    if (!isRedirecting) {
      router.push("/dashboard-admin/parametres-systeme");
    }
  };

  // Utilitaires
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

  const getRoleDisplay = useCallback(() => {
    if (!profile) return "Admin";
    return profile.isSuperAdmin ? "Super Admin" : profile.role || "Admin";
  }, [profile]);

  const getAvatarUrl = useCallback((): string => {
    if (avatarError || !profile?.avatar) {
      return getDefaultAvatar(profile?.nom || profile?.prenoms || "U");
    }
    const url = buildImageUrl(profile.avatar);
    return url || getDefaultAvatar(profile?.nom || profile?.prenoms || "U");
  }, [profile, avatarError]);

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

  const handleImageError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      console.log("🖼️ Erreur de chargement d'image, fallback aux initiales");
      setAvatarError(true);
      e.currentTarget.src = getDefaultAvatar(
        profile?.nom || profile?.prenoms || "U",
      );
    },
    [profile],
  );

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // L'admin est considéré comme toujours connecté dans ce contexte
  const isAdminLoggedIn = !!profile;

  // Exemple de notification de test (à retirer en production)
  useEffect(() => {
    if (profile && mountedRef.current) {
      addNotification(
        "success",
        "✅ Bienvenue",
        "Vous êtes connecté en tant qu'administrateur",
      );
    }
  }, [profile, addNotification]);

  // DEBUG - Afficher l'URL
  useEffect(() => {
    if (profile) {
      console.log("🔍 Avatar URL:", getAvatarUrl());
      console.log("🔍 Avatar brut:", profile.avatar);
      console.log("🔍 Avatar_key:", (profile as any).avatar_key);
    }
  }, [profile, getAvatarUrl]);

  return (
    <>
      <header
        id="dashboard-header"
        className="bg-white border-bottom px-2 px-sm-3 px-md-4 py-2 shadow-sm"
        style={{
          minHeight: isSmallMobile ? "56px" : isMobile ? "60px" : "64px",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
        key={`dashboard-header-${forceUpdate}`}
      >
        <div className="d-flex flex-row justify-content-between align-items-center w-100">
          {/* Section titre et informations utilisateur - Version mobile avec menu burger */}
          <div
            className="d-flex align-items-center gap-2"
            style={{ flex: "1 1 auto", minWidth: 0 }}
          >
            {/* Menu burger pour mobile/tablette */}
            {!isDesktop && (
              <button
                className="btn btn-link border-0 p-0 me-1 me-sm-2 mobile-menu-toggle d-lg-none"
                onClick={toggleMobileMenu}
                aria-label="Menu"
                aria-expanded={isMobileMenuOpen}
                type="button"
                style={{
                  color: "#16a34a",
                  fontSize: isSmallMobile ? "1.1rem" : "1.25rem",
                  width: isSmallMobile ? "32px" : "36px",
                  height: isSmallMobile ? "32px" : "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                }}
                disabled={isRedirecting}
              >
                <i
                  className={`fa-solid ${isMobileMenuOpen ? "fa-times" : "fa-bars"}`}
                  style={{ color: "inherit", fontSize: "inherit" }}
                ></i>
              </button>
            )}

            <div
              className="d-flex flex-column"
              style={{ minWidth: 0, flex: "1 1 auto" }}
            >
              <h1
                className="fw-bold mb-0 text-truncate"
                style={{
                  color: "#16a34a",
                  fontSize: isSmallMobile
                    ? "1rem"
                    : isMobile
                      ? "1.1rem"
                      : isTablet
                        ? "1.2rem"
                        : "1.5rem",
                }}
              >
                {isMobile ? (
                  <>👋 {getDisplayName()}</>
                ) : (
                  <>Bienvenue, {getDisplayName()} 👋</>
                )}
              </h1>

              {!isMobile && !loading && !error && profile && (
                <div className="d-flex flex-wrap align-items-center gap-1 gap-sm-2 mt-1">
                  <i
                    className="fa-solid fa-user text-muted d-none d-sm-inline"
                    style={{ fontSize: "0.75rem" }}
                  ></i>
                  <span
                    className="fw-medium text-dark text-truncate"
                    style={{
                      fontSize: isSmallMobile
                        ? "0.7rem"
                        : isMobile
                          ? "0.75rem"
                          : "0.875rem",
                      maxWidth: isTablet ? "150px" : "200px",
                    }}
                    title={getFullName()}
                  >
                    {getFullName()}
                  </span>

                  {/* Badge du rôle - visible sur tablette+ */}
                  {!isMobile && (
                    <span
                      className="badge bg-success ms-1"
                      style={{
                        fontSize: isSmallMobile ? "0.6rem" : "0.65rem",
                        padding: "0.25rem 0.4rem",
                      }}
                    >
                      <i className="fa-solid fa-user-shield me-1 d-none d-sm-inline"></i>
                      {isTablet
                        ? profile.isSuperAdmin
                          ? "Super"
                          : "Admin"
                        : getRoleDisplay()}
                    </span>
                  )}

                  {!isTablet && !isMobile && (
                    <>
                      <span className="text-muted mx-1 d-none d-md-inline">
                        •
                      </span>
                      <span
                        className="text-muted d-none d-md-inline text-truncate"
                        style={{ fontSize: "0.75rem", maxWidth: "150px" }}
                        title={profile.email}
                      >
                        {profile.email}
                      </span>
                    </>
                  )}
                </div>
              )}

              {subtitle && !isMobile && (
                <p className="text-muted mb-0 mt-1 small d-none d-sm-block">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Actions à droite - Adaptées à la taille d'écran */}
          <div className="d-flex align-items-center gap-1 gap-sm-2 ms-auto flex-shrink-0">
            {/* Bouton Aide - Version simplifiée sur mobile */}
            {showHelpButton && (
              <button
                onClick={handleHelpClick}
                onKeyDown={(e) => handleKeyDown(e, handleHelpClick)}
                className="btn btn-outline-primary d-flex align-items-center justify-content-center"
                aria-label="Aide et support"
                title="Aide et support"
                style={{
                  fontSize: isSmallMobile ? "0.7rem" : "0.8rem",
                  fontWeight: "500",
                  whiteSpace: "nowrap",
                  minWidth: isSmallMobile ? "32px" : isMobile ? "36px" : "auto",
                  height: isSmallMobile ? "32px" : isMobile ? "36px" : "40px",
                  padding: isMobile ? "0.25rem 0.5rem" : "0.5rem 1rem",
                  borderRadius: "6px",
                  border: "1px solid #16a34a",
                  color: "#16a34a",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#e7f1ff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "";
                }}
                disabled={loading || isRedirecting}
              >
                <i
                  className="fa-solid fa-question-circle"
                  aria-hidden="true"
                ></i>
                {!isMobile && <span className="ms-2">Aide</span>}
              </button>
            )}

            {/* Bouton Publier - Version simplifiée sur mobile */}
            {showPublishButton && (
              <button
                onClick={handlePublish}
                onKeyDown={(e) => handleKeyDown(e, handlePublish)}
                className="btn btn-success d-flex align-items-center justify-content-center"
                aria-label="Publier une annonce"
                title="Publier une annonce"
                style={{
                  backgroundColor: "#16a34a",
                  borderColor: "#16a34a",
                  fontSize: isSmallMobile ? "0.7rem" : "0.8rem",
                  fontWeight: "500",
                  whiteSpace: "nowrap",
                  minWidth: isSmallMobile ? "32px" : isMobile ? "36px" : "auto",
                  height: isSmallMobile ? "32px" : isMobile ? "36px" : "40px",
                  padding: isMobile ? "0.25rem 0.5rem" : "0.5rem 1rem",
                  borderRadius: "6px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#15803d";
                  e.currentTarget.style.borderColor = "#15803d";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#16a34a";
                  e.currentTarget.style.borderColor = "#16a34a";
                }}
                disabled={loading || isRedirecting}
              >
                <i className="fa-solid fa-plus" aria-hidden="true"></i>
                {!isMobile && <span className="ms-2">Publier une annonce</span>}
                {isMobile && !isSmallMobile && (
                  <span className="ms-1 d-none d-sm-inline">Publier</span>
                )}
              </button>
            )}

            {/* Groupe d'icônes d'action - Adapté à la taille */}
            <div className="d-flex align-items-center gap-1 border-start ps-1 ps-sm-2 ms-1">
              {/* Messages */}
              <button
                onClick={handleMessagesClick}
                onKeyDown={(e) => handleKeyDown(e, handleMessagesClick)}
                className="btn btn-light btn-sm position-relative p-1 p-sm-2"
                aria-label="Messages"
                title="Messages"
                style={{
                  borderRadius: "6px",
                  width: isSmallMobile ? "28px" : isMobile ? "32px" : "36px",
                  height: isSmallMobile ? "28px" : isMobile ? "32px" : "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                disabled={loading || isRedirecting}
              >
                <i
                  className="fa-regular fa-envelope text-muted"
                  style={{ fontSize: isSmallMobile ? "0.8rem" : "0.9rem" }}
                  aria-hidden="true"
                ></i>
                {messageCount > 0 && (
                  <span
                    className="position-absolute top-0 end-0 translate-middle bg-primary rounded-circle"
                    style={{
                      width: isSmallMobile ? "6px" : "8px",
                      height: isSmallMobile ? "6px" : "8px",
                      border: "2px solid white",
                    }}
                  >
                    <span className="visually-hidden">Nouveaux messages</span>
                  </span>
                )}
              </button>

              {/* Notification - Caché sur très petit écran */}
              {showNotification && !isSmallMobile && (
                <button
                  onClick={handleNotificationClick}
                  onKeyDown={(e) => handleKeyDown(e, handleNotificationClick)}
                  className="btn btn-light btn-sm position-relative p-1 p-sm-2 notification-toggle"
                  aria-label="Notifications"
                  title="Notifications"
                  style={{
                    borderRadius: "6px",
                    width: isMobile ? "32px" : "36px",
                    height: isMobile ? "32px" : "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: showNotifications ? "#e9ecef" : "",
                  }}
                  disabled={loading || isRedirecting}
                >
                  <i
                    className="fa-regular fa-bell text-muted"
                    style={{ fontSize: isMobile ? "0.9rem" : "1rem" }}
                    aria-hidden="true"
                  ></i>
                  {notificationCount > 0 && (
                    <span
                      className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-danger"
                      style={{
                        fontSize: "0.65rem",
                        padding: "0.25rem 0.4rem",
                      }}
                    >
                      {notificationCount > 99 ? "99+" : notificationCount}
                    </span>
                  )}
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
                className="btn p-0 d-flex align-items-center gap-1 gap-sm-2 text-decoration-none"
                aria-expanded={showUserMenu}
                aria-label="Menu utilisateur"
                aria-haspopup="true"
                style={{ whiteSpace: "nowrap" }}
                disabled={loading || isRedirecting}
                id="admin-menu-button"
              >
                <div className="d-flex align-items-center gap-1 gap-sm-2">
                  {loading ? (
                    <div
                      className="rounded-circle border border-2 border-success d-flex align-items-center justify-content-center"
                      style={{
                        width: isSmallMobile
                          ? "32px"
                          : isMobile
                            ? "36px"
                            : "40px",
                        height: isSmallMobile
                          ? "32px"
                          : isMobile
                            ? "36px"
                            : "40px",
                      }}
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
                        width={isSmallMobile ? 32 : isMobile ? 36 : 40}
                        height={isSmallMobile ? 32 : isMobile ? 36 : 40}
                        className="rounded-circle border border-2 border-success"
                        style={{ objectFit: "cover" }}
                        onError={handleImageError}
                      />
                      {profile?.is_verified && (
                        <div
                          className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-2 border-white d-flex align-items-center justify-content-center"
                          style={{
                            width: isSmallMobile ? "12px" : "14px",
                            height: isSmallMobile ? "12px" : "14px",
                          }}
                          aria-label="Compte vérifié"
                        >
                          <i
                            className="fa-solid fa-check text-white"
                            style={{ fontSize: isSmallMobile ? "6px" : "8px" }}
                          ></i>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Informations utilisateur - Caché sur mobile */}
                  {isDesktop && (
                    <>
                      <div className="d-none d-xl-block text-start">
                        <div
                          className="fw-medium text-dark text-truncate"
                          style={{
                            fontSize: "0.875rem",
                            lineHeight: 1.2,
                            maxWidth: "120px",
                          }}
                          title={getDisplayName()}
                        >
                          {getDisplayName()}
                        </div>
                        <div
                          className="text-muted text-truncate"
                          style={{
                            fontSize: "0.75rem",
                            lineHeight: 1.2,
                            maxWidth: "120px",
                          }}
                          title={profile?.email || "Administrateur"}
                        >
                          {profile?.email || "Administrateur"}
                        </div>
                      </div>

                      {/* Chevron - Caché sur tablette */}
                      {isLargeDesktop && (
                        <i
                          className={`fa-solid fa-chevron-down text-muted transition-transform ${showUserMenu ? "rotate-180" : ""}`}
                          aria-hidden="true"
                        ></i>
                      )}
                    </>
                  )}
                </div>
              </button>

              {/* Menu déroulant utilisateur */}
              {showUserMenu && (
                <>
                  <div
                    className="position-fixed top-0 left-0 w-100 h-100"
                    onClick={() => setShowUserMenu(false)}
                    style={{ background: "transparent", zIndex: 1020 }}
                    aria-hidden="true"
                  />
                  <div
                    ref={userMenuRef}
                    className="position-absolute end-0 mt-2 bg-white border rounded shadow-lg"
                    style={{
                      minWidth: isMobile ? "260px" : "280px",
                      maxWidth: "90vw",
                      zIndex: 1030,
                    }}
                    role="menu"
                    aria-labelledby="admin-menu-button"
                  >
                    {profile && (
                      <div className="p-2 p-sm-3 border-bottom">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <img
                            src={getAvatarUrl()}
                            alt={getFullName()}
                            width={isMobile ? 40 : 48}
                            height={isMobile ? 40 : 48}
                            className="rounded-circle border border-2 border-success"
                            style={{ objectFit: "cover" }}
                            onError={handleImageError}
                          />
                          <div className="min-w-0">
                            <div className="fw-medium d-flex align-items-center flex-wrap">
                              <span
                                className="text-truncate"
                                style={{
                                  maxWidth: isMobile ? "150px" : "180px",
                                }}
                              >
                                {getFullName()}
                              </span>
                              {profile.is_verified && (
                                <i
                                  className="fa-solid fa-check-circle text-success ms-1 flex-shrink-0"
                                  title="Compte vérifié"
                                  aria-label="Compte vérifié"
                                ></i>
                              )}
                            </div>
                            <div
                              className="text-muted small text-truncate"
                              style={{ maxWidth: isMobile ? "170px" : "200px" }}
                            >
                              {profile.email}
                            </div>
                          </div>
                        </div>
                        <div className="d-flex flex-wrap gap-1">
                          <span
                            className={`badge ${profile.isSuperAdmin ? "bg-purple" : "bg-success"}`}
                            style={{ fontSize: "0.7rem" }}
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
                              style={{ fontSize: "0.7rem" }}
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
                        onClick={handleHomeClick}
                        onKeyDown={(e) => handleKeyDown(e, handleHomeClick)}
                        className="btn btn-link text-dark text-decoration-none d-flex align-items-center gap-2 w-100 px-3 py-2 hover-bg-light"
                        role="menuitem"
                        style={{ fontSize: isMobile ? "0.9rem" : "1rem" }}
                        disabled={isRedirecting}
                      >
                        <i
                          className="fa-solid fa-home text-muted"
                          style={{ width: "20px" }}
                          aria-hidden="true"
                        ></i>
                        <span>Accueil</span>
                      </button>

                      <button
                        onClick={handleMessagesMenuClick}
                        onKeyDown={(e) =>
                          handleKeyDown(e, handleMessagesMenuClick)
                        }
                        className="btn btn-link text-dark text-decoration-none d-flex align-items-center gap-2 w-100 px-3 py-2 hover-bg-light position-relative"
                        role="menuitem"
                        style={{ fontSize: isMobile ? "0.9rem" : "1rem" }}
                        disabled={isRedirecting}
                      >
                        <i
                          className="fa-regular fa-envelope text-muted"
                          style={{ width: "20px" }}
                          aria-hidden="true"
                        ></i>
                        <span>Messages</span>
                        {messageCount > 0 && (
                          <span className="badge bg-primary ms-auto">
                            {messageCount}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={handleProfileClick}
                        onKeyDown={(e) => handleKeyDown(e, handleProfileClick)}
                        className="btn btn-link text-dark text-decoration-none d-flex align-items-center gap-2 w-100 px-3 py-2 hover-bg-light"
                        role="menuitem"
                        style={{ fontSize: isMobile ? "0.9rem" : "1rem" }}
                        disabled={isRedirecting}
                      >
                        <i
                          className="fa-solid fa-user text-muted"
                          style={{ width: "20px" }}
                          aria-hidden="true"
                        ></i>
                        <span>Mon profil</span>
                      </button>

                      <div className="border-top my-2" role="separator"></div>

                      <button
                        onClick={handleLogout}
                        onKeyDown={(e) => handleKeyDown(e, handleLogout)}
                        disabled={isLoggingOut || isRedirecting}
                        className="btn btn-link text-danger text-decoration-none d-flex align-items-center gap-2 w-100 px-3 py-2 hover-bg-light"
                        role="menuitem"
                        style={{ fontSize: isMobile ? "0.9rem" : "1rem" }}
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

        {/* Panneau de notifications */}
        {showNotifications && (
          <div
            ref={notificationsRef}
            className="position-absolute end-0 mt-2 bg-white rounded shadow-lg"
            style={{
              top: "70px",
              right: "20px",
              width: isMobile ? "calc(100vw - 40px)" : "380px",
              maxHeight: "500px",
              overflowY: "auto",
              zIndex: 1070,
            }}
          >
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold">Notifications</h6>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-link text-primary p-0"
                  onClick={markAllNotificationsAsRead}
                  title="Tout marquer comme lu"
                >
                  <FontAwesomeIcon icon={faCheck} />
                </button>
                <button
                  className="btn btn-sm btn-link text-danger p-0"
                  onClick={clearAllNotifications}
                  title="Tout effacer"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>

            <div className="notifications-list">
              {notifications.length === 0 ? (
                <div className="text-center py-5">
                  <FontAwesomeIcon
                    icon={faBell}
                    className="fs-1 text-muted mb-3 opacity-25"
                  />
                  <p className="text-muted mb-0">Aucune notification</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 border-bottom ${!notif.read ? "bg-light" : ""}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      if (!notif.read) {
                        markNotificationAsRead(notif.id);
                      }
                      if (notif.messageId && !isRedirecting) {
                        router.push("/dashboard-admin/messages");
                        setShowNotifications(false);
                      }
                    }}
                  >
                    <div className="d-flex gap-3">
                      <div
                        className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${
                          notif.type === "success"
                            ? "bg-success"
                            : notif.type === "error"
                              ? "bg-danger"
                              : notif.type === "warning"
                                ? "bg-warning"
                                : notif.type === "new-message"
                                  ? "bg-primary"
                                  : "bg-info"
                        } bg-opacity-10`}
                        style={{ width: "40px", height: "40px" }}
                      >
                        <FontAwesomeIcon
                          icon={
                            notif.type === "success"
                              ? faCheckCircle
                              : notif.type === "error"
                                ? faTimesCircle
                                : notif.type === "warning"
                                  ? faExclamationCircle
                                  : notif.type === "new-message"
                                    ? faEnvelopeIcon
                                    : faInfoCircle
                          }
                          className={
                            notif.type === "success"
                              ? "text-success"
                              : notif.type === "error"
                                ? "text-danger"
                                : notif.type === "warning"
                                  ? "text-warning"
                                  : notif.type === "new-message"
                                    ? "text-primary"
                                    : "text-info"
                          }
                        />
                      </div>
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <div className="d-flex justify-content-between align-items-start">
                          <h6
                            className="fw-semibold mb-1 text-truncate"
                            style={{ fontSize: "0.9rem" }}
                          >
                            {notif.title}
                          </h6>
                          <small className="text-muted ms-2 flex-shrink-0">
                            {formatRelativeTime(notif.timestamp)}
                          </small>
                        </div>
                        <p
                          className="text-muted mb-1 text-truncate"
                          style={{ fontSize: "0.8rem" }}
                        >
                          {notif.message}
                        </p>
                        {notif.expediteur && (
                          <small
                            className="text-muted d-block text-truncate"
                            style={{ fontSize: "0.7rem" }}
                          >
                            De: {notif.expediteur}
                          </small>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-2 border-top text-center">
                <button
                  className="btn btn-link btn-sm text-primary"
                  onClick={clearAllNotifications}
                >
                  Effacer tout
                </button>
              </div>
            )}
          </div>
        )}

        {/* Sous-titre mobile */}
        {isMobile && subtitle && (
          <div className="mt-1 px-1">
            <p className="text-muted small mb-0">{subtitle}</p>
          </div>
        )}

        {/* Message d'erreur mobile */}
        {isMobile && error && (
          <div className="mt-1 px-1">
            <div className="d-flex align-items-center gap-2">
              <i
                className="fa-solid fa-exclamation-circle text-danger"
                style={{ fontSize: "0.8rem" }}
              ></i>
              <span className="text-danger small">{error}</span>
            </div>
          </div>
        )}

        <style jsx>{`
          .rotate-180 {
            transform: rotate(180deg);
          }
          .transition-transform {
            transition: transform 0.3s ease;
          }
          .hover-bg-light:hover {
            background-color: #f8f9fa;
          }
          .bg-purple {
            background-color: #6f42c1 !important;
          }
          .min-w-0 {
            min-width: 0;
          }

          .notifications-list {
            max-height: 400px;
            overflow-y: auto;
          }

          .notifications-list::-webkit-scrollbar {
            width: 6px;
          }

          .notifications-list::-webkit-scrollbar-track {
            background: #f1f1f1;
          }

          .notifications-list::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 10px;
          }

          .notifications-list::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
          }
        `}</style>
      </header>

      {/* Menu mobile pleine hauteur */}
      {isMobileMenuOpen && !isDesktop && (
        <div className="d-lg-none">
          <div
            className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
            style={{ zIndex: 1001 }}
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div
            ref={mobileMenuRef}
            className="position-fixed top-0 start-0 h-100 bg-white shadow-lg"
            style={{
              width: isSmallMobile ? "85%" : "300px",
              zIndex: 1002,
              overflowY: "auto",
            }}
          >
            <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-light">
              <div className="d-flex align-items-center">
                <div
                  className="rounded d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: isSmallMobile ? "32px" : "40px",
                    height: isSmallMobile ? "32px" : "40px",
                    backgroundColor: "#16a34a",
                  }}
                >
                  <span
                    className="text-white fw-bold"
                    style={{ fontSize: isSmallMobile ? "0.9rem" : "1.2rem" }}
                  >
                    A
                  </span>
                </div>
                <span
                  className="fw-bold"
                  style={{
                    color: "#16a34a",
                    fontSize: isSmallMobile ? "1.1rem" : "1.3rem",
                  }}
                >
                  Admin
                </span>
              </div>
              <button
                className="btn btn-link p-0"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Fermer le menu"
                type="button"
                disabled={isRedirecting}
              >
                <i
                  className="fa-solid fa-times"
                  style={{
                    color: "#6c757d",
                    fontSize: isSmallMobile ? "1.2rem" : "1.5rem",
                  }}
                ></i>
              </button>
            </div>

            <div className="p-3">
              {/* Profil dans le menu mobile */}
              {profile && (
                <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                  <img
                    src={getAvatarUrl()}
                    alt={getFullName()}
                    width={isSmallMobile ? 48 : 56}
                    height={isSmallMobile ? 48 : 56}
                    className="rounded-circle border border-2 border-success"
                    style={{ objectFit: "cover" }}
                    onError={handleImageError}
                  />
                  <div className="min-w-0">
                    <div
                      className="fw-bold text-truncate"
                      style={{ fontSize: isSmallMobile ? "0.95rem" : "1.1rem" }}
                    >
                      {getFullName()}
                    </div>
                    <div className="text-muted small text-truncate">
                      {profile.email}
                    </div>
                    <div className="mt-1">
                      <span
                        className={`badge ${profile.isSuperAdmin ? "bg-purple" : "bg-success"}`}
                      >
                        {getRoleDisplay()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Liens du menu mobile */}
              <div className="d-flex flex-column gap-2">
                <button
                  onClick={handleHomeClick}
                  className="btn btn-light text-start d-flex align-items-center gap-3 py-3 px-3 w-100"
                  style={{ borderRadius: "8px" }}
                  disabled={isRedirecting}
                >
                  <i
                    className="fa-solid fa-home text-success"
                    style={{ width: "20px" }}
                  ></i>
                  <span>Accueil</span>
                </button>

                <button
                  onClick={handleMessagesMenuClick}
                  className="btn btn-light text-start d-flex align-items-center gap-3 py-3 px-3 w-100 position-relative"
                  style={{ borderRadius: "8px" }}
                  disabled={isRedirecting}
                >
                  <i
                    className="fa-regular fa-envelope text-success"
                    style={{ width: "20px" }}
                  ></i>
                  <span>Messages</span>
                  {messageCount > 0 && (
                    <span className="badge bg-primary ms-auto">
                      {messageCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={handleProfileClick}
                  className="btn btn-light text-start d-flex align-items-center gap-3 py-3 px-3 w-100"
                  style={{ borderRadius: "8px" }}
                  disabled={isRedirecting}
                >
                  <i
                    className="fa-solid fa-user text-success"
                    style={{ width: "20px" }}
                  ></i>
                  <span>Mon profil</span>
                </button>

                <button
                  onClick={handleSettingsClick}
                  className="btn btn-light text-start d-flex align-items-center gap-3 py-3 px-3 w-100"
                  style={{ borderRadius: "8px" }}
                  disabled={isRedirecting}
                >
                  <i
                    className="fa-solid fa-cog text-success"
                    style={{ width: "20px" }}
                  ></i>
                  <span>Paramètres</span>
                </button>

                <div className="border-top my-3"></div>

                <button
                  onClick={handleNotificationClick}
                  className="btn btn-light text-start d-flex align-items-center gap-3 py-3 px-3 w-100"
                  style={{ borderRadius: "8px" }}
                  disabled={isRedirecting}
                >
                  <i
                    className="fa-regular fa-bell text-success"
                    style={{ width: "20px" }}
                  ></i>
                  <span>Notifications</span>
                  {notificationCount > 0 && (
                    <span className="badge bg-danger rounded-pill ms-auto">
                      {notificationCount}
                    </span>
                  )}
                </button>

                {showExportButton && (
                  <button
                    onClick={handleExport}
                    className="btn btn-light text-start d-flex align-items-center gap-3 py-3 px-3 w-100"
                    style={{ borderRadius: "8px" }}
                    disabled={isRedirecting}
                  >
                    <i
                      className="fa-solid fa-download text-success"
                      style={{ width: "20px" }}
                    ></i>
                    <span>Exporter</span>
                  </button>
                )}

                <button
                  onClick={handleHelpClick}
                  className="btn btn-light text-start d-flex align-items-center gap-3 py-3 px-3 w-100"
                  style={{ borderRadius: "8px" }}
                  disabled={isRedirecting}
                >
                  <i
                    className="fa-solid fa-question-circle text-success"
                    style={{ width: "20px" }}
                  ></i>
                  <span>Aide</span>
                </button>

                <div className="border-top my-3"></div>

                <button
                  onClick={handlePublish}
                  className="btn btn-success text-start d-flex align-items-center gap-3 py-3 px-3 w-100"
                  style={{ borderRadius: "8px" }}
                  disabled={isRedirecting}
                >
                  <i className="fa-solid fa-plus"></i>
                  <span>Publier une annonce</span>
                </button>

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut || isRedirecting}
                  className="btn btn-outline-danger text-start d-flex align-items-center gap-3 py-3 px-3 w-100 mt-2"
                  style={{ borderRadius: "8px" }}
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
          </div>
        </div>
      )}

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