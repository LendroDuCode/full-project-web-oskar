// app/(front-office)/auth/LoginModal.tsx
"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faXmark,
  faEye,
  faEyeSlash,
  faShieldHalved,
  faUsers,
  faBolt,
  faSignInAlt,
  faUserShield,
  faArrowRightToBracket,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { faGoogle, faFacebook } from "@fortawesome/free-brands-svg-icons";
import { useRouter } from "next/navigation";
import "./LoginModal.css";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { LoadingSpinner } from "@/app/shared/components/ui/LoadingSpinner";
import colors from "@/app/shared/constants/colors";

interface LoginModalProps {
  visible: boolean;
  onHide: () => void;
  onSwitchToRegister: () => void;
  onLoginSuccess: (userData: {
    uuid: string;
    firstName?: string;
    lastName?: string;
    nom_complet?: string;
    email: string;
    type: string;
    role: string;
    temp_token?: string;
  }) => void;
}

interface LoginData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginResponse {
  temp_token?: string;
  tempToken?: string;
  user: {
    uuid: string;
    email: string;
    type: string;
    role: string;
    nom_complet?: string;
    nom?: string;
    firstName?: string;
    lastName?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

const LoginModal: React.FC<LoginModalProps> = ({
  visible,
  onHide,
  onSwitchToRegister,
  onLoginSuccess,
}) => {
  const [loginData, setLoginData] = useState<LoginData>({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  // Détecter si c'est un écran mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // S'assurer que le composant est monté côté client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Charger l'email sauvegardé au montage
  useEffect(() => {
    const savedEmail = localStorage.getItem("oskar_remember_email");
    if (savedEmail) {
      setLoginData((prev) => ({
        ...prev,
        email: savedEmail,
        rememberMe: true,
      }));
    }
  }, []);

  // Gérer le scroll du body quand le modal est ouvert/fermé
  useEffect(() => {
    if (!isMounted) return;

    if (visible) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "unset";
      document.body.style.position = "";
      document.body.style.width = "";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [visible, isMounted]);

  // Effet pour fermer automatiquement le modal après succès
  useEffect(() => {
    if (loginSuccess) {
      const timer = setTimeout(() => {
        handleCloseAfterSuccess();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [loginSuccess]);

  // === FONCTIONS ===
  const normalizeUserData = (response: any): LoginResponse => {
    if (response.data) {
      return {
        temp_token: response.data.temp_token || response.data.tempToken,
        user: {
          uuid: response.data.user?.uuid || response.data.user?.id || "",
          email: response.data.user?.email || "",
          type: response.data.user?.type || "",
          role: response.data.user?.role || "",
          nom_complet:
            response.data.user?.nom_complet ||
            `${response.data.user?.nom || ""} ${response.data.user?.prenom || ""}`.trim() ||
            `${response.data.user?.firstName || ""} ${response.data.user?.lastName || ""}`.trim(),
          nom: response.data.user?.nom,
          firstName: response.data.user?.firstName,
          lastName: response.data.user?.lastName,
        },
      };
    }
    return response;
  };

  const saveAuthToCookies = (userData: any, tempToken: string) => {
    try {
      const userJson = JSON.stringify(userData);
      const expires = new Date();
      expires.setDate(expires.getDate() + 1);
      const cookieOptions = `path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
      const encodedUserJson = encodeURIComponent(userJson);

      document.cookie = `oskar_user=${encodedUserJson}; ${cookieOptions}`;
      document.cookie = `oskar_token=${tempToken}; ${cookieOptions}`;
      document.cookie = `oskar_user_type=${userData.type}; ${cookieOptions}`;
      return true;
    } catch (error) {
      console.error("Erreur création cookies:", error);
      return false;
    }
  };

  const getDashboardPath = (userType: string): string => {
    switch (userType.toLowerCase()) {
      case "admin":
        return "/dashboard-admin";
      case "agent":
        return "/dashboard-agent";
      case "vendeur":
        return "/dashboard-vendeur";
      case "utilisateur":
        return "/dashboard-utilisateur";
      default:
        return "/";
    }
  };

  const saveUserData = (userType: string, userData: any, tempToken: string) => {
    const userToStore = {
      ...userData,
      type: userType,
      temp_token: tempToken || "",
    };

    // ✅ Sauvegarder dans TOUS les formats pour compatibilité
    localStorage.setItem("oskar_user", JSON.stringify(userToStore));
    localStorage.setItem("oskar_token", tempToken || "");
    localStorage.setItem("oskar_user_type", userType);

    // Anciens formats pour compatibilité
    localStorage.setItem("token", tempToken || "");
    localStorage.setItem("temp_token", tempToken || "");
    localStorage.setItem("tempToken", tempToken || "");

    // Cookies
    saveAuthToCookies(userToStore, tempToken || "");

    // ✅ Dispatcher les événements pour mettre à jour le header
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("auth-state-changed", {
          detail: { isLoggedIn: true, user: userToStore },
        }),
      );
      window.dispatchEvent(new Event("force-header-update"));
    }

    if (loginData.rememberMe) {
      localStorage.setItem("oskar_remember_email", loginData.email);
    } else {
      localStorage.removeItem("oskar_remember_email");
    }
  };

  const handleCloseAfterSuccess = () => {
    setLoginSuccess(false);
    setSuccess(null);
    resetForm();
    onHide();
  };

  const resetForm = () => {
    setLoginData({
      email: "",
      password: "",
      rememberMe: false,
    });
    setError(null);
    setSuccess(null);
    setShowPassword(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setLoginSuccess(false);

    try {
      const userTypes = [
        {
          type: "admin",
          endpoint: API_ENDPOINTS.AUTH.ADMIN.LOGIN,
          requestBody: { email: loginData.email, password: loginData.password },
        },
        {
          type: "agent",
          endpoint: API_ENDPOINTS.AUTH.AGENT.LOGIN,
          requestBody: {
            email: loginData.email,
            mot_de_passe: loginData.password,
          },
        },
        {
          type: "vendeur",
          endpoint: API_ENDPOINTS.AUTH.VENDEUR.LOGIN,
          requestBody: {
            email: loginData.email,
            mot_de_passe: loginData.password,
          },
        },
        {
          type: "utilisateur",
          endpoint: API_ENDPOINTS.AUTH.UTILISATEUR.LOGIN,
          requestBody: { email: loginData.email, password: loginData.password },
        },
      ];

      let lastError = null;

      for (const userType of userTypes) {
        try {
          console.log(`Tentative de connexion comme ${userType.type}...`);

          const response = await fetch(userType.endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(userType.requestBody),
            credentials: "include",
          });

          const data = await response.json();

          if (response.ok) {
            // ✅ CONNEXION RÉUSSIE
            const normalizedData = normalizeUserData(data);
            normalizedData.user.type = userType.type;

            // 1. Sauvegarder les données
            saveUserData(
              userType.type,
              normalizedData.user,
              normalizedData.temp_token || normalizedData.tempToken || "",
            );

            // 2. Appeler le callback de succès
            onLoginSuccess({
              uuid: normalizedData.user.uuid,
              email: normalizedData.user.email,
              type: normalizedData.user.type,
              role: normalizedData.user.role,
              nom_complet: normalizedData.user.nom_complet,
              firstName:
                normalizedData.user.firstName || normalizedData.user.nom,
              lastName: normalizedData.user.lastName,
              temp_token: normalizedData.temp_token || normalizedData.tempToken,
            });

            // 3. Dispatcher les événements pour mettre à jour l'UI
            const events = [
              new CustomEvent("auth-state-changed", {
                detail: { isLoggedIn: true, user: normalizedData.user },
              }),
              new CustomEvent("user-login-success", {
                detail: { user: normalizedData.user },
              }),
              new CustomEvent("force-header-update"),
            ];

            events.forEach((event) => window.dispatchEvent(event));

            // 4. Afficher le message de succès
            setSuccess(`Connexion réussie en tant que ${userType.type} !`);
            setLoginSuccess(true);

            // 5. Réinitialiser le formulaire
            resetForm();

            // 6. ✅ FERMER LE MODAL SANS REDIRECTION
            setTimeout(() => {
              onHide(); // Fermer le modal
            }, 1500);

            return;
          } else {
            lastError = data.message || `Erreur ${response.status}`;
            console.log(`Échec ${userType.type}: ${lastError}`);
          }
        } catch (err) {
          console.error(`Erreur connexion ${userType.type}:`, err);
          lastError = err instanceof Error ? err.message : "Erreur inconnue";
        }
      }

      if (
        lastError &&
        (lastError.includes("converti") || lastError.includes("vendeur"))
      ) {
        throw new Error(
          "Votre compte a été converti en compte vendeur. Veuillez utiliser vos identifiants vendeur.",
        );
      } else {
        throw new Error(lastError || "Identifiants invalides");
      }
    } catch (error) {
      console.error("Erreur connexion:", error);
      setError(
        error instanceof Error ? error.message : "Une erreur est survenue",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: "google" | "facebook") => {
    console.log(`Connexion avec ${provider}`);

    let endpoint = "";
    switch (provider) {
      case "google":
        endpoint = API_ENDPOINTS.AUTH.UTILISATEUR.GOOGLE_CONNEXION;
        break;
      case "facebook":
        endpoint = API_ENDPOINTS.AUTH.UTILISATEUR.FACEBOOK;
        break;
    }

    window.location.href = endpoint;
  };

  const handleForgotPassword = () => {
    const emailLower = loginData.email?.toLowerCase() || "";
    let endpoint = API_ENDPOINTS.AUTH.UTILISATEUR.FORGOT_PASSWORD;

    if (
      emailLower.includes("admin@sonec") ||
      emailLower.includes("superadmin")
    ) {
      endpoint = API_ENDPOINTS.AUTH.ADMIN.FORGOT_PASSWORD;
    } else if (
      emailLower.includes("@agent.com") ||
      emailLower.includes("agent")
    ) {
      endpoint = API_ENDPOINTS.AUTH.AGENT.LOGIN;
    } else if (
      emailLower.includes("@sonecafrica.com") ||
      emailLower.includes("vendeur")
    ) {
      endpoint = API_ENDPOINTS.AUTH.VENDEUR.FORGOT_PASSWORD;
    }

    alert(`Fonctionnalité de réinitialisation sera implémentée prochainement`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && !loading) {
      onHide();
    }
  };

  if (!visible || !isMounted) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="modal-backdrop fade show"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1040,
        }}
        onClick={onHide}
      />

      {/* Modal */}
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        style={{ zIndex: 1050 }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div
          className="modal-dialog modal-dialog-centered modal-lg"
          role="document"
          style={{ 
            maxWidth: isMobile ? "95%" : "900px",
            margin: isMobile ? "0.5rem" : "1.75rem auto"
          }}
        >
          <div className="modal-content rounded-3 shadow-lg border-0 overflow-hidden">
            {/* Close Button - UN SEUL BOUTON */}
            <button
              type="button"
              className="btn-close position-absolute"
              onClick={onHide}
              disabled={loading}
              aria-label="Fermer"
              style={{
                top: isMobile ? "0.75rem" : "1rem",
                right: isMobile ? "0.75rem" : "1rem",
                zIndex: 10,
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                padding: isMobile ? "0.5rem" : "0.75rem",
                borderRadius: "50%",
                width: isMobile ? "32px" : "40px",
                height: isMobile ? "32px" : "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                fontSize: isMobile ? "1rem" : "1.25rem",
                lineHeight: 1,
                opacity: 0.8,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.backgroundColor = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "0.8";
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
              }}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>

            <div className="row g-0">
              {/* Colonne gauche - Background vert - DISPARAÎT SUR MOBILE */}
              {!isMobile && (
                <div
                  className="col-md-4 d-flex flex-column"
                  style={{
                    backgroundColor: colors.oskar.green,
                    color: "white",
                    padding: "2rem",
                  }}
                >
                  <div className="mb-4">
                    <div className="d-flex justify-content-center mb-3">
                      <div
                        style={{
                          width: "80px",
                          height: "80px",
                          backgroundColor: "white",
                          borderRadius: "20px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        <span
                          style={{
                            color: colors.oskar.green,
                            fontWeight: "bold",
                            fontSize: "2rem",
                          }}
                        >
                          O
                        </span>
                      </div>
                    </div>
                    <h5 className="text-center fw-bold mb-3">
                      Bienvenue sur OSKAR
                    </h5>
                    <p className="text-center mb-4" style={{ opacity: 0.9 }}>
                      Connectez-vous à votre compte pour accéder à tous vos
                      services
                    </p>
                  </div>

                  {/* Avantages */}
                  <div className="d-flex flex-column gap-3 mt-3">
                    <div className="d-flex align-items-start gap-2">
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          backgroundColor: "rgba(255, 255, 255, 0.2)",
                          borderRadius: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faShieldHalved}
                          style={{ fontSize: "16px" }}
                        />
                      </div>
                      <div>
                        <h6 className="fw-semibold mb-1">Accès sécurisé</h6>
                        <p style={{ opacity: 0.8, fontSize: "0.875rem" }}>
                          Votre compte est protégé par des mesures de sécurité
                          avancées
                        </p>
                      </div>
                    </div>

                    <div className="d-flex align-items-start gap-2">
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          backgroundColor: "rgba(255, 255, 255, 0.2)",
                          borderRadius: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faUsers}
                          style={{ fontSize: "16px" }}
                        />
                      </div>
                      <div>
                        <h6 className="fw-semibold mb-1">Communauté active</h6>
                        <p style={{ opacity: 0.8, fontSize: "0.875rem" }}>
                          Rejoignez des milliers d'utilisateurs actifs
                        </p>
                      </div>
                    </div>

                    <div className="d-flex align-items-start gap-2">
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          backgroundColor: "rgba(255, 255, 255, 0.2)",
                          borderRadius: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faBolt}
                          style={{ fontSize: "16px" }}
                        />
                      </div>
                      <div>
                        <h6 className="fw-semibold mb-1">Accès rapide</h6>
                        <p style={{ opacity: 0.8, fontSize: "0.875rem" }}>
                          Connectez-vous en quelques secondes
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Colonne droite - Formulaire - PREND TOUTE LA LARGEUR SUR MOBILE */}
              <div className={isMobile ? "col-12" : "col-md-8"}>
                <div className="p-4" style={{ padding: isMobile ? "1.5rem 1rem" : "2rem" }}>
                  <h5 className="modal-title w-100 text-center fs-4 fw-bold text-dark mb-4">
                    Connexion à OSKAR
                  </h5>

                  {error && (
                    <div
                      className="alert alert-danger alert-dismissible fade show mb-4"
                      role="alert"
                      style={{ fontSize: isMobile ? "0.9rem" : "1rem" }}
                    >
                      <i className="fa-solid fa-exclamation-triangle me-2"></i>
                      {error}
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setError(null)}
                        aria-label="Fermer"
                      ></button>
                    </div>
                  )}

                  {success && (
                    <div
                      className="alert alert-success alert-dismissible fade show mb-4"
                      role="alert"
                      style={{
                        backgroundColor: "#d1fae5",
                        borderColor: "#10b981",
                        color: "#065f46",
                        fontSize: isMobile ? "0.9rem" : "1rem",
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="me-2"
                          style={{ color: "#10b981", fontSize: "1.2rem" }}
                        />
                        <div>
                          <strong>Succès !</strong>
                          <div className="small">{success}</div>
                          <div
                            className="progress mt-2"
                            style={{ height: "3px" }}
                          >
                            <div
                              className="progress-bar bg-success"
                              role="progressbar"
                              style={{ width: "100%" }}
                              aria-valuenow={100}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!loginSuccess && (
                    <form onSubmit={handleLogin}>
                      {/* Email - CHAMPS RÉDUITS SUR MOBILE */}
                      <div className="mb-3">
                        <label className="form-label fw-semibold text-dark" style={{ fontSize: isMobile ? "0.9rem" : "1rem" }}>
                          Adresse email <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-white border-end-0" style={{ padding: isMobile ? "0.5rem 0.75rem" : "0.75rem 1rem" }}>
                            <FontAwesomeIcon
                              icon={faEnvelope}
                              className="text-secondary"
                              style={{ fontSize: isMobile ? "0.9rem" : "1rem" }}
                            />
                          </span>
                          <input
                            type="email"
                            className="form-control border-start-0"
                            placeholder="votre@email.com"
                            value={loginData.email}
                            onChange={(e) => {
                              setLoginData({
                                ...loginData,
                                email: e.target.value,
                              });
                              setError(null);
                            }}
                            required
                            disabled={loading}
                            autoComplete="email"
                            style={{ 
                              padding: isMobile ? "0.5rem 0.75rem" : "0.75rem 1rem",
                              fontSize: isMobile ? "0.9rem" : "1rem"
                            }}
                          />
                        </div>
                      </div>

                      {/* Mot de passe - CHAMPS RÉDUITS SUR MOBILE */}
                      <div className="mb-3">
                        <div className="input-group">
                          <span className="input-group-text bg-white border-end-0" style={{ padding: isMobile ? "0.5rem 0.75rem" : "0.75rem 1rem" }}>
                            <FontAwesomeIcon
                              icon={faLock}
                              className="text-secondary"
                              style={{ fontSize: isMobile ? "0.9rem" : "1rem" }}
                            />
                          </span>
                          <input
                            type={showPassword ? "text" : "password"}
                            className="form-control border-start-0"
                            placeholder="••••••••"
                            value={loginData.password}
                            onChange={(e) => {
                              setLoginData({
                                ...loginData,
                                password: e.target.value,
                              });
                              setError(null);
                            }}
                            required
                            disabled={loading}
                            autoComplete="current-password"
                            style={{ 
                              padding: isMobile ? "0.5rem 0.75rem" : "0.75rem 1rem",
                              fontSize: isMobile ? "0.9rem" : "1rem"
                            }}
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary border-start-0"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={loading}
                            style={{ 
                              padding: isMobile ? "0.5rem 0.75rem" : "0.75rem 1rem",
                              fontSize: isMobile ? "0.9rem" : "1rem"
                            }}
                          >
                            <FontAwesomeIcon
                              icon={showPassword ? faEyeSlash : faEye}
                              style={{ fontSize: isMobile ? "0.9rem" : "1rem" }}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Se souvenir de moi - TEXTE RÉDUIT SUR MOBILE */}
                      <div className="form-check mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="rememberMe"
                          checked={loginData.rememberMe}
                          onChange={(e) =>
                            setLoginData({
                              ...loginData,
                              rememberMe: e.target.checked,
                            })
                          }
                          disabled={loading}
                          style={{ width: isMobile ? "1rem" : "1.2rem", height: isMobile ? "1rem" : "1.2rem" }}
                        />
                        <label
                          className="form-check-label text-secondary"
                          htmlFor="rememberMe"
                          style={{ fontSize: isMobile ? "0.9rem" : "1rem" }}
                        >
                          Se souvenir de moi
                        </label>
                      </div>

                      {/* Bouton de connexion - PLUS PETIT SUR MOBILE */}
                      <button
                        type="submit"
                        className="btn w-100 mb-3 fw-bold text-white"
                        style={{
                          backgroundColor: colors.oskar.green,
                          border: "none",
                          borderRadius: "10px",
                          fontSize: isMobile ? "0.95rem" : "1rem",
                          padding: isMobile ? "0.75rem" : "1rem",
                        }}
                        disabled={
                          loading || !loginData.email || !loginData.password
                        }
                      >
                        {loading ? (
                          <>
                            <LoadingSpinner size="sm" color="white" />
                            <span className="ms-2">Connexion en cours...</span>
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon
                              icon={faArrowRightToBracket}
                              className="me-2"
                              style={{ fontSize: isMobile ? "0.9rem" : "1rem" }}
                            />
                            Se connecter
                          </>
                        )}
                      </button>

                      {/* Lien vers inscription - TEXTE RÉDUIT SUR MOBILE */}
                      <div className="text-center pt-3 border-top">
                        <span className="text-secondary me-1" style={{ fontSize: isMobile ? "0.9rem" : "1rem" }}>
                          Vous n'avez pas de compte ?
                        </span>
                        <button
                          type="button"
                          className="btn btn-link p-0 text-decoration-none fw-semibold"
                          onClick={onSwitchToRegister}
                          disabled={loading}
                          style={{ 
                            color: colors.oskar.green,
                            fontSize: isMobile ? "0.9rem" : "1rem"
                          }}
                        >
                          S'inscrire
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Sécurité - TEXTE RÉDUIT SUR MOBILE */}
                  {!loginSuccess && (
                    <div className="mt-4 pt-3 border-top">
                      <div className="d-flex align-items-center gap-2">
                        <FontAwesomeIcon
                          icon={faUserShield}
                          className="text-success"
                          size="sm"
                        />
                        <small className="text-muted" style={{ fontSize: isMobile ? "0.8rem" : "0.875rem" }}>
                          Votre connexion est sécurisée avec un chiffrement SSL
                          256-bit
                        </small>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .progress-bar {
          animation: shrink 2s linear forwards;
        }
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        
        /* S'assurer que le btn-close standard n'affiche pas son propre contenu */
        .btn-close {
          background-image: none !important;
          opacity: 1 !important;
        }

        /* Styles responsifs supplémentaires */
        @media (max-width: 576px) {
          .modal-content {
            max-height: 95vh;
            overflow-y: auto;
          }
          
          .form-label {
            margin-bottom: 0.25rem;
          }
          
          .input-group-text, .form-control, .btn-outline-secondary {
            padding-top: 0.4rem !important;
            padding-bottom: 0.4rem !important;
          }
        }
      `}</style>
    </>
  );
};

export default LoginModal;