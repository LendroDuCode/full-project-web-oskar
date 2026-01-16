"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faUser,
  faLock,
  faXmark,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { faGoogle, faFacebook } from "@fortawesome/free-brands-svg-icons";
import colors from "../../../shared/constants/colors";

interface RegisterModalProps {
  visible: boolean;
  onHide: () => void;
  onSwitchToLogin: () => void;
  onRegisterSuccess: (userData: {
    firstName: string;
    lastName: string;
    email?: string;
  }) => void;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

const RegisterModal: React.FC<RegisterModalProps> = ({
  visible,
  onHide,
  onSwitchToLogin,
  onRegisterSuccess,
}) => {
  const [registerData, setRegisterData] = useState<RegisterData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const [loading, setLoading] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // S'assurer que le composant est monté côté client
  useEffect(() => {
    setIsMounted(true);
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

    // Nettoyage lors du démontage
    return () => {
      document.body.style.overflow = "unset";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [visible, isMounted]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      setPasswordMismatch(true);
      return;
    }
    setPasswordMismatch(false);
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      if (
        registerData.email &&
        registerData.password &&
        registerData.acceptTerms
      ) {
        onRegisterSuccess({
          firstName: registerData.firstName,
          lastName: registerData.lastName,
          email: registerData.email,
        });
      }
    } catch (error) {
      console.error("Erreur d'inscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialRegister = (provider: "google" | "facebook") => {
    console.log(`Inscription avec ${provider}`);
  };

  const handlePasswordChange = (value: string) => {
    setRegisterData({ ...registerData, password: value });
    if (passwordMismatch) setPasswordMismatch(false);
  };

  const handleConfirmPasswordChange = (value: string) => {
    setRegisterData({ ...registerData, confirmPassword: value });
    if (passwordMismatch) setPasswordMismatch(false);
  };

  // Gestion de la touche Échap
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && !loading) {
      onHide();
    }
  };

  // Ne rien rendre pendant le SSR ou si le modal n'est pas visible
  if (!visible || !isMounted) return null;

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
          style={{ maxWidth: "500px" }}
        >
          <div className="modal-content rounded-3 shadow-lg border-0">
            {/* Modal Header */}
            <div className="modal-header border-bottom-0 pb-0">
              <h5 className="modal-title w-100 text-center fs-4 fw-bold text-dark">
                Bienvenue !
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
              <form onSubmit={handleRegister}>
                {/* Prénom et Nom */}
                <div className="row mb-4">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <label
                      htmlFor="firstName"
                      className="form-label fw-semibold text-dark"
                    >
                      Prénom
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <FontAwesomeIcon
                          icon={faUser}
                          className="text-secondary"
                        />
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        id="firstName"
                        placeholder="Jean"
                        value={registerData.firstName}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            firstName: e.target.value,
                          })
                        }
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label
                      htmlFor="lastName"
                      className="form-label fw-semibold text-dark"
                    >
                      Nom
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="lastName"
                      placeholder="Dupont"
                      value={registerData.lastName}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          lastName: e.target.value,
                        })
                      }
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="mb-4">
                  <label
                    htmlFor="registerEmail"
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
                      id="registerEmail"
                      placeholder="votre@email.com"
                      value={registerData.email}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          email: e.target.value,
                        })
                      }
                      required
                      disabled={loading}
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Mot de passe */}
                <div className="mb-4">
                  <label
                    htmlFor="registerPassword"
                    className="form-label fw-semibold text-dark"
                  >
                    Mot de passe
                  </label>
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
                      id="registerPassword"
                      placeholder="••••••••"
                      value={registerData.password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      required
                      disabled={loading}
                      autoComplete="new-password"
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

                {/* Confirmation mot de passe */}
                <div className="mb-4">
                  <label
                    htmlFor="confirmPassword"
                    className="form-label fw-semibold text-dark"
                  >
                    Confirmer le mot de passe
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <FontAwesomeIcon
                        icon={faLock}
                        className="text-secondary"
                      />
                    </span>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="form-control border-start-0"
                      id="confirmPassword"
                      placeholder="••••••••"
                      value={registerData.confirmPassword}
                      onChange={(e) =>
                        handleConfirmPasswordChange(e.target.value)
                      }
                      required
                      disabled={loading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary border-start-0"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={loading}
                    >
                      <FontAwesomeIcon
                        icon={showConfirmPassword ? faEyeSlash : faEye}
                      />
                    </button>
                  </div>
                  {passwordMismatch && (
                    <div className="text-danger small mt-2">
                      Les mots de passe ne correspondent pas
                    </div>
                  )}
                </div>

                {/* CGU */}
                <div className="form-check mb-4">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="acceptTerms"
                    checked={registerData.acceptTerms}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        acceptTerms: e.target.checked,
                      })
                    }
                    disabled={loading}
                  />
                  <label
                    className="form-check-label text-secondary"
                    htmlFor="acceptTerms"
                  >
                    J'accepte les{" "}
                    <button
                      type="button"
                      className="btn btn-link p-0 text-decoration-none"
                      style={{ color: colors.oskar.green }}
                    >
                      conditions d'utilisation
                    </button>{" "}
                    et la{" "}
                    <button
                      type="button"
                      className="btn btn-link p-0 text-decoration-none"
                      style={{ color: colors.oskar.green }}
                    >
                      politique de confidentialité
                    </button>
                  </label>
                </div>

                {/* Bouton d'inscription */}
                <button
                  type="submit"
                  className="btn w-100 py-3 mb-4 fw-bold text-white"
                  style={{
                    backgroundColor: colors.oskar.green,
                    border: "none",
                    borderRadius: "10px",
                  }}
                  disabled={
                    loading ||
                    !registerData.acceptTerms ||
                    passwordMismatch ||
                    !registerData.firstName ||
                    !registerData.lastName ||
                    !registerData.email ||
                    !registerData.password ||
                    !registerData.confirmPassword
                  }
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Création en cours...
                    </>
                  ) : (
                    "Créer mon compte"
                  )}
                </button>

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

                {/* Inscription sociale */}
                <div className="row g-3 mb-4">
                  <div className="col-6">
                    <button
                      type="button"
                      className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2 py-2"
                      onClick={() => handleSocialRegister("google")}
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
                      onClick={() => handleSocialRegister("facebook")}
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
                  Vous avez déjà un compte ?
                </span>
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none fw-semibold"
                  onClick={onSwitchToLogin}
                  style={{ color: colors.oskar.green }}
                >
                  Se connecter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Styles supplémentaires */}
      <style jsx global>{`
        .modal-content {
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }

        .input-group-text {
          border-color: #dee2e6 !important;
        }

        .form-control:focus {
          border-color: ${colors.oskar.green} !important;
          box-shadow: 0 0 0 0.25rem ${colors.oskar.green}20 !important;
        }

        .btn-close:focus {
          box-shadow: 0 0 0 0.25rem rgba(0, 0, 0, 0.1) !important;
        }

        .btn-outline-secondary:hover {
          background-color: #f8f9fa !important;
          border-color: #6c757d !important;
        }

        .btn-link:hover {
          text-decoration: underline !important;
        }

        .modal-open {
          overflow: hidden;
        }

        .modal-open body {
          overflow: hidden;
          position: fixed;
          width: 100%;
        }

        /* Animation pour le spinner */
        @keyframes spinner-border {
          to {
            transform: rotate(360deg);
          }
        }

        .spinner-border {
          display: inline-block;
          width: 1rem;
          height: 1rem;
          vertical-align: text-bottom;
          border: 0.2em solid currentColor;
          border-right-color: transparent;
          border-radius: 50%;
          animation: spinner-border 0.75s linear infinite;
        }

        /* Améliorations d'accessibilité */
        .modal:focus {
          outline: none;
        }

        .modal.show {
          display: block !important;
        }
      `}</style>
    </>
  );
};

export default RegisterModal;
