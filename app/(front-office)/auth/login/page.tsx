"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
  faArrowRightToBracket,
  faCheckCircle,
  faXmark,
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
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "facebook" | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  useEffect(() => {
    if (loginSuccess) {
      const timer = setTimeout(() => {
        handleCloseAfterSuccess();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [loginSuccess]);

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

  const saveUserData = (userType: string, userData: any, tempToken: string) => {
    const userToStore = {
      ...userData,
      type: userType,
      temp_token: tempToken || "",
    };

    localStorage.setItem("oskar_user", JSON.stringify(userToStore));
    localStorage.setItem("oskar_token", tempToken || "");
    localStorage.setItem("oskar_user_type", userType);
    localStorage.setItem("token", tempToken || "");
    localStorage.setItem("temp_token", tempToken || "");
    localStorage.setItem("tempToken", tempToken || "");

    saveAuthToCookies(userToStore, tempToken || "");

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
    setLoginData({
      email: "",
      password: "",
      rememberMe: false,
    });
    setError(null);
    setShowPassword(false);
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

  const handleForgotPassword = async () => {
    if (!loginData.email) {
      setError("Veuillez saisir votre adresse email pour réinitialiser votre mot de passe.");
      return;
    }

    setForgotPasswordLoading(true);
    setError(null);

    try {
      const emailLower = loginData.email.toLowerCase();
      let endpoint = "";
      let requestBody = {};

      if (emailLower.includes("admin") || emailLower.includes("superadmin")) {
        endpoint = API_ENDPOINTS.AUTH.ADMIN.FORGOT_PASSWORD;
        requestBody = { email: loginData.email };
      } else if (emailLower.includes("@agent.com") || emailLower.includes("agent")) {
        endpoint = API_ENDPOINTS.AUTH.AGENT.LOGIN;
        window.location.href = "/auth/agent/forgot-password";
        return;
      } else if (emailLower.includes("@sonecafrica.com") || emailLower.includes("vendeur")) {
        endpoint = API_ENDPOINTS.AUTH.VENDEUR.FORGOT_PASSWORD;
        requestBody = { email: loginData.email };
      } else {
        endpoint = API_ENDPOINTS.AUTH.UTILISATEUR.FORGOT_PASSWORD;
        requestBody = { email: loginData.email };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(
          "Un lien de réinitialisation a été envoyé à votre adresse email. Veuillez vérifier votre boîte de réception."
        );
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(data.message || data.error || "Impossible d'envoyer le lien de réinitialisation.");
      }
    } catch (err) {
      console.error("Erreur:", err);
      setError("Erreur de connexion au serveur. Veuillez réessayer.");
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  // Dans LoginModal.tsx - seulement la partie handleGoogleLogin modifiée

// ✅ Connexion Google - CORRIGÉE avec response_type=id_token
const handleGoogleLogin = () => {
  setSocialLoading("google");
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const redirectUri = `${window.location.origin}/auth/google/callback`;
  const scope = "email profile openid";
  
  // ✅ CORRECTION CRUCIALE: Utiliser response_type=id_token au lieu de token
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=id_token&scope=${scope}&nonce=${Date.now()}&prompt=select_account`;
  
  console.log("🔗 URL Google OAuth (avec id_token):", authUrl);
  
  const width = 500;
  const height = 600;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;
  
  const popup = window.open(authUrl, "google-login", `width=${width},height=${height},left=${left},top=${top}`);
  
  const handleMessage = async (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return;
    
    if (event.data.type === "oauth-success" && event.data.token) {
      popup?.close();
      window.removeEventListener("message", handleMessage);
      
      const userStr = localStorage.getItem("oskar_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        const token = localStorage.getItem("oskar_token");
        
        onLoginSuccess({
          uuid: user.uuid,
          email: user.email,
          type: user.type,
          role: user.role,
          nom_complet: user.nom_complet,
          temp_token: token || "",
        });
        
        setSuccess(`Bienvenue ${user.nom_complet || user.email} !`);
        setLoginSuccess(true);
        
        setTimeout(() => {
          onHide();
        }, 1500);
      }
      setSocialLoading(null);
    } else if (event.data.type === "oauth-error") {
      popup?.close();
      window.removeEventListener("message", handleMessage);
      setError(event.data.error || "Erreur lors de l'authentification Google");
      setSocialLoading(null);
    }
  };
  
  window.addEventListener("message", handleMessage);
  
  const checkPopupClosed = setInterval(() => {
    if (popup && popup.closed) {
      clearInterval(checkPopupClosed);
      window.removeEventListener("message", handleMessage);
      setSocialLoading(null);
    }
  }, 500);
};
  // ✅ Connexion Facebook - Popup avec callback amélioré
  const handleFacebookLogin = () => {
    setSocialLoading("facebook");
    const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
    const redirectUri = `${window.location.origin}/auth/facebook/callback`;
    const authUrl = `https://www.facebook.com/v22.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&response_type=token&scope=email,public_profile`;
    
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const popup = window.open(authUrl, "facebook-login", `width=${width},height=${height},left=${left},top=${top}`);
    
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === "oauth-success" && event.data.token) {
        popup?.close();
        window.removeEventListener("message", handleMessage);
        
        const userStr = localStorage.getItem("oskar_user");
        if (userStr) {
          const user = JSON.parse(userStr);
          const token = localStorage.getItem("oskar_token");
          
          onLoginSuccess({
            uuid: user.uuid,
            email: user.email,
            type: user.type,
            role: user.role,
            nom_complet: user.nom_complet,
            temp_token: token || "",
          });
          
          setSuccess(`Bienvenue ${user.nom_complet || user.email} !`);
          setLoginSuccess(true);
          
          setTimeout(() => {
            onHide();
          }, 1500);
        }
        setSocialLoading(null);
      } else if (event.data.type === "oauth-error") {
        popup?.close();
        window.removeEventListener("message", handleMessage);
        setError(event.data.error || "Erreur lors de l'authentification Facebook");
        setSocialLoading(null);
      }
    };
    
    window.addEventListener("message", handleMessage);
    
    const checkPopupClosed = setInterval(() => {
      if (popup && popup.closed) {
        clearInterval(checkPopupClosed);
        window.removeEventListener("message", handleMessage);
        setSocialLoading(null);
      }
    }, 500);
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
          requestBody: { email: loginData.email, mot_de_passe: loginData.password },
        },
        {
          type: "vendeur",
          endpoint: API_ENDPOINTS.AUTH.VENDEUR.LOGIN,
          requestBody: { email: loginData.email, mot_de_passe: loginData.password },
        },
        {
          type: "utilisateur",
          endpoint: API_ENDPOINTS.AUTH.UTILISATEUR.LOGIN,
          requestBody: { email: loginData.email, password: loginData.password },
        },
      ];

      for (const userType of userTypes) {
        try {
          const response = await fetch(userType.endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(userType.requestBody),
            credentials: "include",
          });

          const data = await response.json();

          if (response.ok) {
            const tempToken = data.temp_token || data.tempToken || data.token;
            const user = data.user || data.data?.user;
            
            if (tempToken && user) {
              saveUserData(userType.type, user, tempToken);
              
              onLoginSuccess({
                uuid: user.uuid,
                email: user.email,
                type: user.type || userType.type,
                role: user.role,
                nom_complet: user.nom_complet,
                temp_token: tempToken,
              });
              
              setSuccess(`Bienvenue ${user.nom_complet || user.email} !`);
              setLoginSuccess(true);
              resetForm();
              
              setTimeout(() => onHide(), 1500);
              return;
            }
          }
        } catch (err) {
          console.error(`Erreur ${userType.type}:`, err);
        }
      }
      
      throw new Error("Email ou mot de passe incorrect");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && !loading) onHide();
  };

  if (!visible || !isMounted) return null;

  return (
    <>
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
          style={{ 
            maxWidth: isMobile ? "95%" : "500px",
            margin: isMobile ? "0.5rem" : "1.75rem auto"
          }}
        >
          <div className="modal-content rounded-4 shadow-lg border-0 overflow-hidden">
            <div
              className="text-center py-4 px-3"
              style={{
                background: "linear-gradient(135deg, #e6f7e6 0%, #d4eed4 50%, #c8e6c8 100%)",
                borderBottom: "none",
              }}
            >
              <button
                type="button"
                className="btn-close position-absolute top-0 end-0 mt-3 me-3"
                onClick={onHide}
                disabled={loading}
                style={{
                  zIndex: 10,
                  backgroundColor: "rgba(255,255,255,0.5)",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "none",
                  opacity: 0.8,
                }}
              >
                <FontAwesomeIcon icon={faXmark} style={{ color: "#166534" }} />
              </button>

              <div
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 shadow-sm"
                style={{
                  width: "70px",
                  height: "70px",
                  backgroundColor: "white",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                }}
              >
                <span style={{ color: "#16a34a", fontWeight: "bold", fontSize: "2rem" }}>O</span>
              </div>
              <h4 className="fw-bold text-dark mb-2">Connexion</h4>
              <p className="text-muted small mb-0">Connectez-vous à votre compte OskarStore</p>
            </div>

            <div className="p-4 p-md-5 bg-white">
              {error && (
                <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    <span>{error}</span>
                  </div>
                  <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                </div>
              )}

              {success && (
                <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
                  <div className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                    <span>{success}</span>
                  </div>
                  <button type="button" className="btn-close" onClick={() => setSuccess(null)}></button>
                </div>
              )}

              <div className="d-flex gap-3 mb-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary w-50 d-flex align-items-center justify-content-center gap-2 py-2 rounded-3"
                  onClick={handleGoogleLogin}
                  disabled={!!socialLoading}
                >
                  {socialLoading === "google" ? <LoadingSpinner size="sm" /> : <FontAwesomeIcon icon={faGoogle} style={{ color: "#DB4437" }} />}
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary w-50 d-flex align-items-center justify-content-center gap-2 py-2 rounded-3"
                  onClick={handleFacebookLogin}
                  disabled={!!socialLoading}
                >
                  {socialLoading === "facebook" ? <LoadingSpinner size="sm" /> : <FontAwesomeIcon icon={faFacebook} style={{ color: "#1877F2" }} />}
                  <span>Facebook</span>
                </button>
              </div>

              <div className="position-relative text-center mb-4">
                <hr className="text-muted" />
                <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">ou</span>
              </div>

              {!loginSuccess && (
                <form onSubmit={handleLogin}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark small">Adresse email</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <FontAwesomeIcon icon={faEnvelope} className="text-muted" />
                      </span>
                      <input
                        type="email"
                        className="form-control bg-light border-start-0"
                        placeholder="votre@email.com"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark small">Mot de passe</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <FontAwesomeIcon icon={faLock} className="text-muted" />
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control bg-light border-start-0"
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary border-start-0 bg-light"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                      </button>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="rememberMe"
                        checked={loginData.rememberMe}
                        onChange={(e) => setLoginData({ ...loginData, rememberMe: e.target.checked })}
                      />
                      <label className="form-check-label small text-muted" htmlFor="rememberMe">Se souvenir de moi</label>
                    </div>
                    <button
                      type="button"
                      className="btn btn-link p-0 text-decoration-none small"
                      onClick={handleForgotPassword}
                      disabled={forgotPasswordLoading || loading}
                      style={{ color: colors.oskar.green }}
                    >
                      {forgotPasswordLoading ? <LoadingSpinner size="sm" color={colors.oskar.green} /> : "Mot de passe oublié ?"}
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="btn w-100 mb-3 fw-semibold text-white py-2 rounded-3"
                    style={{ backgroundColor: colors.oskar.green, border: "none" }}
                    disabled={loading || !loginData.email || !loginData.password}
                  >
                    {loading ? <><LoadingSpinner size="sm" color="white" /><span className="ms-2">Connexion...</span></> : "Se connecter"}
                  </button>

                  <div className="text-center">
                    <span className="text-muted small me-1">Vous n'avez pas de compte ?</span>
                    <button
                      type="button"
                      className="btn btn-link p-0 text-decoration-none small fw-semibold"
                      onClick={onSwitchToRegister}
                      style={{ color: colors.oskar.green }}
                    >
                      S'inscrire
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .btn-close { background-image: none !important; opacity: 1 !important; }
        .btn-outline-secondary:hover { background-color: #f8f9fa; border-color: #dee2e6; }
        @media (max-width: 576px) { .modal-content { max-height: 95vh; overflow-y: auto; } }
      `}</style>
    </>
  );
};

export default LoginModal;