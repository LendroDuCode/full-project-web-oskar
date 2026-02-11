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
import colors from "../../../shared/constants/colors";
import { useRouter } from "next/navigation";
import "./LoginModal.css";
import { API_ENDPOINTS } from "@/config/api-endpoints";

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
    // Sauvegarder dans localStorage
    const userToStore = {
      ...userData,
      type: userType,
      temp_token: tempToken || "",
    };

    localStorage.setItem("oskar_user", JSON.stringify(userToStore));
    localStorage.setItem("oskar_token", tempToken || "");
    localStorage.setItem("oskar_user_type", userType);

    // Sauvegarder dans les cookies
    saveAuthToCookies(userToStore, tempToken || "");

    // Se souvenir de moi
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
      // Définir les types d'utilisateurs à essayer dans l'ordre (du plus spécifique au plus général)
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
            // Connexion réussie
            const normalizedData = normalizeUserData(data);
            normalizedData.user.type = userType.type;

            // Appeler le callback de succès
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

            // Sauvegarder les données utilisateur
            saveUserData(
              userType.type,
              normalizedData.user,
              normalizedData.temp_token || normalizedData.tempToken || "",
            );

            // Afficher le message de succès
            const successMessage = `Connexion réussie en tant que ${userType.type} ! Redirection dans 2 secondes...`;
            setSuccess(successMessage);
            setLoginSuccess(true);

            // Réinitialiser le formulaire
            resetForm();

            return;
          } else {
            // Sauvegarder l'erreur pour l'afficher à la fin si tout échoue
            lastError = data.message || `Erreur ${response.status}`;
            console.log(`Échec ${userType.type}: ${lastError}`);
          }
        } catch (err) {
          console.error(`Erreur connexion ${userType.type}:`, err);
          lastError = err instanceof Error ? err.message : "Erreur inconnue";
        }
      }

      // Si toutes les tentatives échouent
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

    // Pour la connexion sociale, on redirige vers l'endpoint OAuth
    window.location.href = endpoint;
  };

  const handleForgotPassword = () => {
    // Déterminer le type d'utilisateur en essayant de deviner d'après l'email
    const emailLower = loginData.email?.toLowerCase() || "";
    let endpoint = API_ENDPOINTS.AUTH.UTILISATEUR.FORGOT_PASSWORD; // Par défaut

    if (
      emailLower.includes("admin@sonec") ||
      emailLower.includes("superadmin")
    ) {
      endpoint = API_ENDPOINTS.AUTH.ADMIN.FORGOT_PASSWORD;
    } else if (
      emailLower.includes("@agent.com") ||
      emailLower.includes("agent")
    ) {
      endpoint = API_ENDPOINTS.AUTH.AGENT.LOGIN; // Note: Vérifiez si cet endpoint existe
    } else if (
      emailLower.includes("@sonecafrica.com") ||
      emailLower.includes("vendeur")
    ) {
      endpoint = API_ENDPOINTS.AUTH.VENDEUR.FORGOT_PASSWORD;
    }

    // Ici, vous pouvez ouvrir un modal de mot de passe oublié
    // ou rediriger vers une page dédiée
    console.log(`Redirection vers: ${endpoint} pour réinitialisation`);
    // Pour l'instant, juste un alert
    alert(`Fonctionnalité de réinitialisation sera implémentée prochainement`);
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
          className="modal-dialog modal-dialog-centered modal-lg"
          role="document"
          style={{ maxWidth: "900px" }}
        >
          <div className="modal-content rounded-3 shadow-lg border-0 overflow-hidden">
            {/* Close Button - Une seule icône X */}
            <button
              type="button"
              className="btn-close position-absolute"
              onClick={onHide}
              disabled={loading}
              aria-label="Fermer"
              style={{
                top: "1rem",
                right: "1rem",
                zIndex: 10,
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                padding: "0.75rem",
                borderRadius: "50%",
              }}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>

            <div className="row g-0">
              {/* Colonne gauche - Background vert */}
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

                {/* Types d'utilisateurs */}
                <div className="mt-auto pt-4">
                  <h6 className="fw-semibold mb-2">Exemples de connexion</h6>
                  <div
                    className="bg-white rounded p-3"
                    style={{ opacity: 0.9 }}
                  >
                    <ul className="list-unstyled mb-0 small text-dark">
                      <li className="mb-1">
                        <strong>Admin:</strong> superadmin@sonec.com
                      </li>
                      <li className="mb-1">
                        <strong>Agent:</strong> jessica.nguessan@agent.com
                      </li>
                      <li className="mb-1">
                        <strong>Vendeur:</strong> nina.diallo@sonecafrica.com
                      </li>
                      <li>
                        <strong>Utilisateur:</strong>{" "}
                        abdoulaye.coulibaly@user.com
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Colonne droite - Formulaire */}
              <div className="col-md-8">
                <div className="p-4">
                  <h5 className="modal-title w-100 text-center fs-4 fw-bold text-dark mb-4">
                    Connexion à OSKAR
                  </h5>

                  {error && (
                    <div
                      className="alert alert-danger alert-dismissible fade show mb-4"
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

                  {success && (
                    <div
                      className="alert alert-success alert-dismissible fade show mb-4"
                      role="alert"
                      style={{
                        backgroundColor: "#d1fae5",
                        borderColor: "#10b981",
                        color: "#065f46",
                        animation: loginSuccess ? "pulse 1s infinite" : "none",
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
                      {/* Connexion sociale */}
                      <div className="mb-4">
                        <div className="row g-2">
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
                      </div>

                      {/* Séparateur */}
                      <div className="position-relative text-center mb-4">
                        <hr className="w-100" />
                        <span
                          className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-secondary"
                          style={{ fontSize: "0.875rem" }}
                        >
                          ou utilisez vos identifiants
                        </span>
                      </div>

                      {/* Email */}
                      <div className="mb-4">
                        <label className="form-label fw-semibold text-dark">
                          Adresse email <span className="text-danger">*</span>
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
                          />
                        </div>
                      </div>

                      {/* Mot de passe */}
                      <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <label className="form-label fw-semibold text-dark">
                            Mot de passe <span className="text-danger">*</span>
                          </label>
                          <button
                            type="button"
                            className="btn btn-link p-0 text-decoration-none"
                            onClick={handleForgotPassword}
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
                            <FontAwesomeIcon
                              icon={showPassword ? faEyeSlash : faEye}
                            />
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

                      {/* Indicateur de rôle détecté */}
                      {loginData.email && (
                        <div
                          className="alert alert-info alert-dismissible fade show mb-4"
                          role="alert"
                        >
                          <small>
                            <i className="fa-solid fa-info-circle me-2"></i>
                            Le système détectera automatiquement votre type de
                            compte
                            <br />
                            <span
                              className="text-muted"
                              style={{ fontSize: "0.75rem" }}
                            >
                              (Admin, Agent, Vendeur ou Utilisateur)
                            </span>
                          </small>
                        </div>
                      )}

                      {/* Bouton de connexion */}
                      <button
                        type="submit"
                        className="btn w-100 py-3 mb-3 fw-bold text-white"
                        style={{
                          backgroundColor: colors.oskar.green,
                          border: "none",
                          borderRadius: "10px",
                          fontSize: "1rem",
                        }}
                        disabled={
                          loading || !loginData.email || !loginData.password
                        }
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
                            <FontAwesomeIcon
                              icon={faArrowRightToBracket}
                              className="me-2"
                            />
                            Se connecter
                          </>
                        )}
                      </button>

                      {/* Lien vers inscription */}
                      <div className="text-center pt-3 border-top">
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
                    </form>
                  )}

                  {/* Sécurité - Toujours visible */}
                  {!loginSuccess && (
                    <div className="mt-4 pt-3 border-top">
                      <div className="d-flex align-items-center gap-2">
                        <FontAwesomeIcon
                          icon={faUserShield}
                          className="text-success"
                          size="sm"
                        />
                        <small className="text-muted">
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
        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
          100% {
            opacity: 1;
          }
        }

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
      `}</style>
    </>
  );
};

export default LoginModal;
