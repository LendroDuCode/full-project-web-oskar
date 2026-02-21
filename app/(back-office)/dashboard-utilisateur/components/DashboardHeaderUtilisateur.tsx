"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { api } from "@/lib/api-client";
import { useAuth } from "@/app/(front-office)/auth/AuthContext";
import PublishAdModal from "@/app/(front-office)/publication-annonce/page";
import HelpModalUtilisateur from "./HelpModalUtilisateur";

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
  showNotification?: boolean;
  showCart?: boolean;
  showFavorites?: boolean;
  showPublishButton?: boolean;
  showHelpButton?: boolean;
}

interface UtilisateurProfile {
  uuid: string;
  nom: string;
  prenoms: string;
  email: string;
  telephone: string | null;
  avatar: string | null;
  avatar_key?: string;
  est_verifie: boolean;
  type: "standard" | "premium";
  est_bloque: boolean;
  date_naissance: string | null;
  statut: string;
  is_admin: boolean;
  code_utilisateur: string | null;
  civilite: {
    uuid: string;
    libelle: string;
  };
  role: {
    uuid: string;
    name: string;
  };
  created_at: string | null;
  updated_at: string;
}

export default function DashboardHeaderUtilisateur({
  subtitle = "",
  showNotification = true,
  showCart = true,
  showFavorites = true,
  showPublishButton = true,
  showHelpButton = true,
}: HeaderProps) {
  const [notificationCount, setNotificationCount] = useState(3);
  const [cartCount, setCartCount] = useState(2);
  const [favoritesCount, setFavoritesCount] = useState(5);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [profile, setProfile] = useState<UtilisateurProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

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

  // Récupérer le profil utilisateur
  const fetchProfile = useCallback(async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);
      setAvatarError(false);

      const response = await api.get(API_ENDPOINTS.AUTH.UTILISATEUR.PROFILE);

      if (response.data?.data) {
        setProfile(response.data.data);
      } else if (response.data) {
        setProfile(response.data);
      } else {
        setError("Format de réponse inattendu");
      }
    } catch (err: any) {
      console.error(
        "Erreur lors de la récupération du profil utilisateur:",
        err,
      );

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
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Gestion des événements
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
    router.push("/dashboard-utilisateur/notifications");
    setNotificationCount(0);
  };

  const handleFavoritesClick = () => {
    router.push("/dashboard-utilisateur/favoris");
  };

  const handleHomeClick = () => {
    setShowUserMenu(false);
    router.push("/");
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await api.post(API_ENDPOINTS.AUTH.UTILISATEUR.LOGOUT);
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
    router.push("/dashboard-utilisateur/profile");
  };

  const handleSettingsClick = () => {
    setShowUserMenu(false);
    router.push("/dashboard-utilisateur/parametres");
  };

  const handleMessagesClick = () => {
    setShowUserMenu(false);
    router.push("/dashboard-utilisateur/messages");
  };

  // Utilitaires
  const getDefaultAvatar = useCallback((nom: string, prenoms: string) => {
    const initials =
      `${prenoms?.charAt(0) || ""}${nom?.charAt(0) || ""}`.toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=16a34a&color=fff&size=40`;
  }, []);

  const getFullName = useCallback(() => {
    if (!profile) return "Utilisateur";
    return `${profile.prenoms} ${profile.nom}`;
  }, [profile]);

  // ✅ Fonction getAvatarUrl améliorée avec buildImageUrl
  const getAvatarUrl = useCallback(() => {
    if (!profile) return getDefaultAvatar("", "");

    if (avatarError) {
      return getDefaultAvatar(profile.nom, profile.prenoms);
    }

    // Essayer d'abord avec avatar_key si disponible
    if ((profile as any).avatar_key) {
      const url = buildImageUrl((profile as any).avatar_key);
      if (url) return url;
    }

    // Sinon avec avatar
    if (profile.avatar) {
      const url = buildImageUrl(profile.avatar);
      if (url) return url;
    }

    return getDefaultAvatar(profile.nom, profile.prenoms);
  }, [profile, getDefaultAvatar, avatarError]);

  const formatDateNaissance = useCallback((date: string | null) => {
    if (!date) return "Non spécifiée";
    return new Date(date).toLocaleDateString("fr-FR");
  }, []);

  const formatTelephone = useCallback((telephone: string | null) => {
    if (!telephone) return "";
    // Formater le numéro au format français
    const cleaned = telephone.replace(/\D/g, "");
    if (cleaned.length === 9) {
      return `+225 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6)}`;
    }
    return telephone;
  }, []);

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

  // ✅ Gestionnaire d'erreur d'image amélioré
  const handleImageError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const target = e.target as HTMLImageElement;

      // Si l'URL contient localhost, essayer de la corriger
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

      // Si l'URL contient des espaces, essayer de les nettoyer
      if (target.src.includes("%20")) {
        target.src = target.src.replace(/%20/g, "");
        return;
      }

      setAvatarError(true);
      target.src = getDefaultAvatar(profile?.nom || "", profile?.prenoms || "");
    },
    [profile, getDefaultAvatar],
  );

  // Badge de vérification
  const VerificationBadge = () => {
    if (!profile) return null;

    if (profile.est_verifie) {
      return (
        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 mx-1">
          <i className="fa-solid fa-check-circle me-1"></i>
          Vérifié
        </span>
      );
    }

    if (profile.est_bloque) {
      return (
        <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 mx-1">
          <i className="fa-solid fa-ban me-1"></i>
          Bloqué
        </span>
      );
    }

    return (
      <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 mx-1">
        <i className="fa-solid fa-clock me-1"></i>
        Non vérifié
      </span>
    );
  };

  // Badge de statut
  const StatusBadge = () => {
    if (!profile) return null;

    const statusColors: Record<string, string> = {
      actif: "success",
      inactif: "secondary",
      suspendu: "danger",
      en_attente: "warning",
    };

    const color = statusColors[profile.statut] || "secondary";

    return (
      <span
        className={`badge bg-${color} bg-opacity-10 text-${color} border border-${color} border-opacity-25 mx-1`}
      >
        {profile.statut.charAt(0).toUpperCase() + profile.statut.slice(1)}
      </span>
    );
  };

  // Badge de rôle admin
  const AdminBadge = () => {
    if (!profile?.is_admin) return null;

    return (
      <span className="badge bg-purple bg-opacity-10 text-purple border border-purple border-opacity-25 mx-1">
        <i className="fa-solid fa-shield me-1"></i>
        Admin
      </span>
    );
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
              Bienvenue sur OSKAR
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
                  onClick={() => fetchProfile()}
                  className="btn btn-link btn-sm p-0 ms-2"
                >
                  <i className="fa-solid fa-rotate-right"></i>
                </button>
              </div>
            ) : profile ? (
              <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-2">
                {/* Nom et badges */}
                <div className="d-flex flex-wrap align-items-center gap-1">
                  <i
                    className="fa-solid fa-user text-muted me-2"
                    style={{ fontSize: "0.875rem" }}
                  ></i>
                  <span
                    className="fw-medium text-dark me-2"
                    style={{ fontSize: "0.95rem" }}
                  >
                    {getFullName()}
                  </span>
                  <div className="d-flex flex-wrap align-items-center gap-1">
                    <VerificationBadge />
                    <StatusBadge />
                    <AdminBadge />
                  </div>
                </div>

                {/* Informations de contact */}
                <div className="d-flex flex-wrap align-items-center gap-2">
                  {profile.email && (
                    <span
                      className="text-muted d-flex align-items-center gap-1"
                      style={{ fontSize: "0.875rem" }}
                    >
                      <i className="fa-solid fa-envelope"></i>
                      {profile.email}
                    </span>
                  )}

                  {profile.email && profile.telephone && (
                    <span className="text-muted d-none d-md-inline">•</span>
                  )}

                  {profile.telephone && (
                    <span
                      className="text-muted d-flex align-items-center gap-1"
                      style={{ fontSize: "0.875rem" }}
                    >
                      <i className="fa-solid fa-phone"></i>
                      {formatTelephone(profile.telephone)}
                    </span>
                  )}

                  {profile.telephone && profile.date_naissance && (
                    <span className="text-muted d-none d-lg-inline">•</span>
                  )}

                  {profile.date_naissance && (
                    <span
                      className="text-muted d-flex align-items-center gap-1"
                      style={{ fontSize: "0.875rem" }}
                    >
                      <i className="fa-solid fa-birthday-cake"></i>
                      {formatDateNaissance(profile.date_naissance)}
                    </span>
                  )}
                </div>
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
                  Utilisateur
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

            {/* Groupe d'icônes d'action */}
            <div className="d-flex align-items-center gap-1 border-start ps-2 ms-1">
              {/* Favoris */}
              {showFavorites && (
                <button
                  onClick={handleFavoritesClick}
                  onKeyDown={(e) => handleKeyDown(e, handleFavoritesClick)}
                  className="btn btn-light btn-sm position-relative p-2"
                  aria-label="Favoris"
                  title="Favoris"
                  style={{ borderRadius: "8px" }}
                  disabled={loading}
                >
                  <i className="fa-solid fa-heart text-muted"></i>
                  {favoritesCount > 0 && (
                    <span
                      className="position-absolute top-0 end-0 translate-middle bg-danger rounded-circle"
                      style={{
                        width: "8px",
                        height: "8px",
                        border: "2px solid white",
                      }}
                    >
                      <span className="visually-hidden">Articles favoris</span>
                    </span>
                  )}
                </button>
              )}

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
                <i className="fa-solid fa-envelope text-muted"></i>
                <span
                  className="position-absolute top-0 end-0 translate-middle bg-primary rounded-circle"
                  style={{
                    width: "8px",
                    height: "8px",
                    border: "2px solid white",
                  }}
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
                  disabled={loading}
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
                id="utilisateur-menu-button"
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
                      {profile?.email || "Utilisateur"}
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
                    aria-labelledby="utilisateur-menu-button"
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
                      {/* Bouton Accueil en PREMIÈRE position */}
                      <button
                        onClick={handleHomeClick}
                        onKeyDown={(e) => handleKeyDown(e, handleHomeClick)}
                        className="btn btn-link text-dark text-decoration-none d-flex align-items-center gap-2 w-100 px-3 py-2 hover-bg-light"
                        role="menuitem"
                      >
                        <i
                          className="fa-solid fa-home text-muted"
                          style={{ width: "20px" }}
                          aria-hidden="true"
                        ></i>
                        <span>Accueil</span>
                      </button>

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

      {/* Modal d'aide pour utilisateur */}
      <HelpModalUtilisateur
        show={showHelpModal}
        onClose={handleCloseHelpModal}
      />

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
        @media (max-width: 768px) {
          .d-flex.flex-column.flex-md-row {
            gap: 0.5rem !important;
          }
          .badge {
            margin: 0.1rem !important;
            font-size: 0.75rem;
          }
        }
      `}</style>
    </>
  );
}
