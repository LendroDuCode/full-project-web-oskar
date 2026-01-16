"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faXmark } from "@fortawesome/free-solid-svg-icons";
import { faGoogle, faFacebook } from "@fortawesome/free-brands-svg-icons";
import colors from "../../../shared/constants/colors";
import { useRouter } from "next/navigation";
import "./LoginModal.css";

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

const API_BASE_URL = "http://localhost:3005";

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
  const [showPassword, setShowPassword] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

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

  // === FONCTIONS ===
  const getUserTypeFromEmail = (email: string): string => {
    const emailLower = email.toLowerCase();

    // D'abord vérifier les mots-clés dans l'email
    if (
      emailLower.includes("superadmin") ||
      emailLower.includes("admin@sonec")
    ) {
      return "admin";
    } else if (emailLower.includes("agent")) {
      return "agent";
    } else if (emailLower.includes("vendeur")) {
      return "vendeur";
    } else if (emailLower.includes("@sonecafrica.com")) {
      // Tous les emails @sonecafrica.com sont des vendeurs par défaut
      return "vendeur";
    } else if (
      emailLower.includes("utilisateur") ||
      emailLower.includes("user")
    ) {
      return "utilisateur";
    }

    // Déterminer par le domaine
    if (emailLower.includes("@sonec.com")) {
      return "admin";
    } else if (emailLower.includes("@agent.com")) {
      return "agent";
    } else if (emailLower.includes("@sonecafrica.com")) {
      return "vendeur";
    } else {
      return "utilisateur";
    }
  };

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

  const redirectToDashboard = (userType: string, userData: any) => {
    const dashboardPath = getDashboardPath(userType);

    // Sauvegarder dans localStorage
    const userToStore = {
      ...userData,
      type: userType,
      temp_token: userData.temp_token || "",
    };

    localStorage.setItem("oskar_user", JSON.stringify(userToStore));
    localStorage.setItem("oskar_token", userData.temp_token || "");
    localStorage.setItem("oskar_user_type", userType);

    // Sauvegarder dans les cookies
    saveAuthToCookies(userToStore, userData.temp_token || "");

    // Rediriger
    setTimeout(() => {
      window.location.assign(dashboardPath);
    }, 100);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userType = getUserTypeFromEmail(loginData.email);
      console.log(
        `Détection du type d'utilisateur: ${userType} pour email: ${loginData.email}`,
      );

      let endpoint = "";
      let requestBody = {};

      switch (userType) {
        case "admin":
          endpoint = `${API_BASE_URL}/auth/admin/login`;
          requestBody = {
            email: loginData.email,
            password: loginData.password,
          };
          break;
        case "agent":
          endpoint = `${API_BASE_URL}/auth/agent/login`;
          requestBody = {
            email: loginData.email,
            mot_de_passe: loginData.password,
          };
          break;
        case "utilisateur":
          endpoint = `${API_BASE_URL}/auth/utilisateur/login`;
          requestBody = {
            email: loginData.email,
            password: loginData.password,
          };
          break;
        case "vendeur":
          endpoint = `${API_BASE_URL}/auth/vendeur/login`;
          requestBody = {
            email: loginData.email,
            mot_de_passe: loginData.password,
          };
          break;
        default:
          // Par défaut, essayer d'abord vendeur, puis utilisateur
          endpoint = `${API_BASE_URL}/auth/vendeur/login`;
          requestBody = {
            email: loginData.email,
            mot_de_passe: loginData.password,
          };
      }

      console.log(`Tentative de connexion sur: ${endpoint}`);
      console.log(`Type détecté: ${userType}`);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        // Si échec avec vendeur, essayer avec utilisateur
        if (endpoint.includes("vendeur") && response.status === 401) {
          console.log(
            "Tentative avec vendeur échouée, essai avec utilisateur...",
          );
          const utilisateurResponse = await fetch(
            `${API_BASE_URL}/auth/utilisateur/login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({
                email: loginData.email,
                password: loginData.password,
              }),
            },
          );

          const utilisateurData = await utilisateurResponse.json();

          if (!utilisateurResponse.ok) {
            throw new Error(
              utilisateurData.message || "Identifiants invalides",
            );
          }

          const normalizedData = normalizeUserData(utilisateurData);
          normalizedData.user.type = "utilisateur";

          // Callback de succès
          onLoginSuccess({
            uuid: normalizedData.user.uuid,
            email: normalizedData.user.email,
            type: normalizedData.user.type,
            role: normalizedData.user.role,
            nom_complet: normalizedData.user.nom_complet,
            firstName: normalizedData.user.firstName || normalizedData.user.nom,
            lastName: normalizedData.user.lastName,
            temp_token: normalizedData.temp_token || normalizedData.tempToken,
          });

          // Fermer le modal
          onHide();

          // Rediriger
          redirectToDashboard("utilisateur", {
            ...normalizedData.user,
            temp_token: normalizedData.temp_token || normalizedData.tempToken,
          });

          return;
        }

        throw new Error(data.message || "Erreur de connexion");
      }

      const normalizedData = normalizeUserData(data);

      if (!normalizedData.user.type) {
        normalizedData.user.type = userType;
      }

      // Callback de succès
      onLoginSuccess({
        uuid: normalizedData.user.uuid,
        email: normalizedData.user.email,
        type: normalizedData.user.type,
        role: normalizedData.user.role,
        nom_complet: normalizedData.user.nom_complet,
        firstName: normalizedData.user.firstName || normalizedData.user.nom,
        lastName: normalizedData.user.lastName,
        temp_token: normalizedData.temp_token || normalizedData.tempToken,
      });

      // Fermer le modal
      onHide();

      // Rediriger
      redirectToDashboard(normalizedData.user.type, {
        ...normalizedData.user,
        temp_token: normalizedData.temp_token || normalizedData.tempToken,
      });

      // Se souvenir de moi
      if (loginData.rememberMe) {
        localStorage.setItem("oskar_remember_email", loginData.email);
      } else {
        localStorage.removeItem("oskar_remember_email");
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
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && !loading) {
      onHide();
    }
  };

  // === RETOUR CONDITIONNEL ===
  if (!visible || !isMounted) {
    return null;
  }

  // === RENDU DU MODAL ===
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
          className="modal-dialog modal-dialog-centered"
          role="document"
          style={{ maxWidth: "480px" }}
        >
          <div className="modal-content rounded-3 shadow-lg border-0">
            {/* Modal Header */}
            <div className="modal-header border-bottom-0 pb-0">
              <h5 className="modal-title w-100 text-center fs-4 fw-bold text-dark">
                Connexion à OSKAR
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onHide}
                disabled={loading}
                aria-label="Fermer"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body px-4 py-3">
              {error && (
                <div
                  className="alert alert-danger alert-dismissible fade show"
                  role="alert"
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

              <form onSubmit={handleLogin}>
                {/* Email */}
                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="form-label fw-semibold text-dark"
                  >
                    Adresse email
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <FontAwesomeIcon
                        icon={faEnvelope}
                        className="text-secondary"
                      />
                    </span>
                    <input
                      type="email"
                      className="form-control border-start-0"
                      id="email"
                      placeholder="nina.diallo@sonecafrica.com"
                      value={loginData.email}
                      onChange={(e) => {
                        setLoginData({ ...loginData, email: e.target.value });
                        setError(null);
                      }}
                      required
                      disabled={loading}
                      autoComplete="email"
                    />
                  </div>
                  <small className="text-muted mt-1 d-block">
                    <strong>Vendeur:</strong> nina.diallo@sonecafrica.com
                    <br />
                    <strong>Utilisateur:</strong> abdoulaye.coulibaly@user.com
                    <br />
                    <strong>Agent:</strong> jessica.nguessan@agent.com
                    <br />
                    <strong>Admin:</strong> superadmin@sonec.com
                  </small>
                </div>

                {/* Mot de passe */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label
                      htmlFor="password"
                      className="form-label fw-semibold text-dark"
                    >
                      Mot de passe
                    </label>
                    <button
                      type="button"
                      className="btn btn-link p-0 text-decoration-none"
                      disabled={loading}
                      style={{
                        fontSize: "0.875rem",
                        color: colors.oskar.green,
                      }}
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <FontAwesomeIcon
                        icon={faLock}
                        className="text-secondary"
                      />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control border-start-0"
                      id="password"
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
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary border-start-0"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      <i
                        className={`fa-solid fa-eye${showPassword ? "-slash" : ""}`}
                      ></i>
                    </button>
                  </div>
                </div>

                {/* Se souvenir de moi */}
                <div className="form-check mb-4">
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
                  />
                  <label
                    className="form-check-label text-secondary"
                    htmlFor="rememberMe"
                  >
                    Se souvenir de moi
                  </label>
                </div>

                {/* Bouton de connexion */}
                <button
                  type="submit"
                  className="btn w-100 py-3 mb-4 fw-bold text-white"
                  style={{
                    backgroundColor: colors.oskar.green,
                    border: "none",
                    borderRadius: "10px",
                  }}
                  disabled={loading || !loginData.email || !loginData.password}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      Connexion en cours...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-sign-in-alt me-2"></i>
                      Se connecter
                    </>
                  )}
                </button>

                {/* Indicateur de rôle détecté */}
                {loginData.email && (
                  <div
                    className="alert alert-info alert-dismissible fade show mb-4"
                    role="alert"
                  >
                    <small>
                      <i className="fa-solid fa-info-circle me-2"></i>
                      Vous allez vous connecter en tant que :
                      <strong className="ms-1">
                        {getUserTypeFromEmail(loginData.email).toUpperCase()}
                      </strong>
                    </small>
                  </div>
                )}

                {/* Séparateur */}
                <div className="position-relative text-center mb-4">
                  <hr className="w-100" />
                  <span
                    className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-secondary"
                    style={{ fontSize: "0.875rem" }}
                  >
                    ou continuer avec
                  </span>
                </div>

                {/* Connexion sociale */}
                <div className="row g-3 mb-4">
                  <div className="col-6">
                    <button
                      type="button"
                      className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2 py-2"
                      onClick={() => handleSocialLogin("google")}
                      disabled={loading}
                    >
                      <FontAwesomeIcon icon={faGoogle} />
                      <span>Google</span>
                    </button>
                  </div>
                  <div className="col-6">
                    <button
                      type="button"
                      className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2 py-2"
                      onClick={() => handleSocialLogin("facebook")}
                      disabled={loading}
                    >
                      <FontAwesomeIcon icon={faFacebook} />
                      <span>Facebook</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer border-top-0 pt-0">
              <div className="w-100 text-center">
                <span className="text-secondary me-1">
                  Vous n'avez pas de compte ?
                </span>
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none fw-semibold"
                  onClick={onSwitchToRegister}
                  disabled={loading}
                  style={{ color: colors.oskar.green }}
                >
                  S'inscrire
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginModal;
