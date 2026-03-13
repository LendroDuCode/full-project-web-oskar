"use client";

import { useState, useEffect, CSSProperties } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faUser,
  faLock,
  faXmark,
  faEye,
  faEyeSlash,
  faPhone,
  faCheckCircle,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import BaseRegisterModal from "./BaseRegisterModal";

interface UserRegisterModalProps {
  visible: boolean;
  onHide: () => void;
  onSwitchToLogin: () => void;
  onRegisterSuccess: (userData: {
    firstName: string;
    lastName: string;
    email?: string;
    token?: string;
    userData?: any;
  }) => void;
  onSwitchToVendeur?: () => void;
}

interface UserFormData {
  nom: string;
  prenoms: string;
  email: string;
  pseudo: string;
  mot_de_passe: string;
  telephone: string;
  ville: string;
}

const UserRegisterModal: React.FC<UserRegisterModalProps> = ({
  visible,
  onHide,
  onSwitchToLogin,
  onRegisterSuccess,
  onSwitchToVendeur,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    nom: "",
    prenoms: "",
    email: "",
    pseudo: "",
    mot_de_passe: "",
    telephone: "+225 ",
    ville: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Détection de l'écran mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calcul de la force du mot de passe
  useEffect(() => {
    const calculatePasswordStrength = (password: string) => {
      let strength = 0;
      if (password.length >= 8) strength += 1;
      if (/[A-Z]/.test(password)) strength += 1;
      if (/[a-z]/.test(password)) strength += 1;
      if (/[0-9]/.test(password)) strength += 1;
      if (/[^A-Za-z0-9]/.test(password)) strength += 1;
      return strength;
    };
    setPasswordStrength(calculatePasswordStrength(formData.mot_de_passe));
  }, [formData.mot_de_passe]);

  const validatePhoneNumber = (phone: string): boolean => {
    // Enlever le préfixe +225 et les espaces
    const numbers = phone.replace(/^\+225\s*/, '').replace(/\s/g, '');
    // Vérifier qu'il reste exactement 10 chiffres
    return /^\d{10}$/.test(numbers);
  };

  const formatPhoneNumber = (value: string): string => {
    // Garder seulement le préfixe +225 et les chiffres
    let cleaned = value.replace(/[^\d+]/g, '');
    
    // Si ça commence par +225, on le garde, sinon on l'ajoute
    if (!cleaned.startsWith('+225')) {
      cleaned = '+225' + cleaned.replace(/^0+/, '');
    }
    
    // Extraire les chiffres après +225
    let numbers = cleaned.replace('+225', '').replace(/\s/g, '');
    
    // Limiter à 10 chiffres
    numbers = numbers.slice(0, 10);
    
    // Formater avec des espaces tous les 2 chiffres
    let formatted = '+225';
    if (numbers.length > 0) {
      // Format: +225 07 09 18 18 64
      const parts = [];
      for (let i = 0; i < numbers.length; i += 2) {
        parts.push(numbers.substr(i, 2));
      }
      formatted += ' ' + parts.join(' ');
    }
    
    return formatted;
  };

  const validateForm = () => {
    setError(null);
    setPhoneError(null);

    if (!formData.nom.trim()) {
      setError("Le nom est requis");
      return false;
    }
    if (!formData.prenoms.trim()) {
      setError("Le prénom est requis");
      return false;
    }
    if (!formData.email.trim()) {
      setError("L'email est requis");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Veuillez entrer un email valide");
      return false;
    }
    if (!formData.telephone || formData.telephone === "+225 ") {
      setError("Le numéro de téléphone est requis");
      return false;
    }
    if (!validatePhoneNumber(formData.telephone)) {
      setPhoneError("Le numéro doit contenir 10 chiffres (ex: 07 09 18 18 64)");
      return false;
    }
    if (!formData.ville.trim()) {
      setError("La ville est requise");
      return false;
    }
    if (formData.mot_de_passe.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }
    if (formData.mot_de_passe !== confirmPassword) {
      setPasswordMismatch(true);
      setError("Les mots de passe ne correspondent pas");
      return false;
    }
    if (!acceptTerms) {
      setError("Veuillez accepter les conditions d'utilisation");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMismatch(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Nettoyer le numéro de téléphone avant envoi (garder seulement +225 + 10 chiffres)
      const cleanPhone = formData.telephone.replace(/\s/g, '');
      
      const payload = {
        nom: formData.nom,
        prenoms: formData.prenoms,
        email: formData.email,
        pseudo: formData.pseudo || formData.email.split("@")[0],
        mot_de_passe: formData.mot_de_passe,
        telephone: cleanPhone,
        ville: formData.ville,
        type_utilisateur: "particulier",
      };

      const response = await fetch(API_ENDPOINTS.AUTH.UTILISATEUR.REGISTER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        handleRegistrationSuccess(data);
      } else {
        setError(data.message || "Erreur lors de l'inscription");
      }
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationSuccess = (data: any) => {
    const token = data.token || data.accessToken;

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("oskar_token", token);
      document.cookie = `oskar_token=${token}; path=/; max-age=86400`;
    }

    if (data.refreshToken) {
      localStorage.setItem("refreshToken", data.refreshToken);
    }

    const userData = data.utilisateur || data;
    const successData = {
      firstName: userData.prenoms || formData.prenoms,
      lastName: userData.nom || formData.nom,
      email: userData.email || formData.email,
      token: token,
      userData: userData,
    };

    localStorage.setItem("oskar_user", JSON.stringify(userData));
    localStorage.setItem("oskar_user_type", "utilisateur");

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth-state-changed"));
      window.dispatchEvent(new Event("force-header-update"));
    }

    resetForm();
    onHide();
    setTimeout(() => {
      onRegisterSuccess(successData);
    }, 100);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, telephone: formatted });
    if (phoneError) setPhoneError(null);
    if (error) setError(null);
  };

  const resetForm = () => {
    setFormData({
      nom: "",
      prenoms: "",
      email: "",
      pseudo: "",
      mot_de_passe: "",
      telephone: "+225 ",
      ville: "",
    });
    setConfirmPassword("");
    setAcceptTerms(false);
    setError(null);
    setPhoneError(null);
    setPasswordMismatch(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setPasswordStrength(0);
  };

  const handleClose = () => {
    resetForm();
    onHide();
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "#dc2626";
    if (passwordStrength <= 2) return "#f59e0b";
    if (passwordStrength <= 4) return "#10b981";
    return "#059669";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return "Très faible";
    if (passwordStrength <= 2) return "Faible";
    if (passwordStrength <= 4) return "Bon";
    return "Excellent";
  };

  // Fonctions de gestion du focus
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#16a34a";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(22, 163, 74, 0.1)";
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#d1d5db";
    e.currentTarget.style.boxShadow = "none";
  };

  // Styles avec typage CSSProperties - ADAPTÉS AU MOBILE
  const inputStyle: CSSProperties = {
    width: "100%",
    padding: isMobile ? "0.6rem" : "0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.5rem",
    outline: "none",
    transition: "all 0.2s",
    fontSize: isMobile ? "0.85rem" : "0.875rem",
  };

  const passwordToggleStyle: CSSProperties = {
    position: "absolute",
    right: "0.75rem",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    color: "#6b7280",
    cursor: "pointer",
    padding: "0.25rem",
  };

  const passwordStrengthHeaderStyle: CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.25rem",
    fontSize: isMobile ? "0.7rem" : "0.75rem",
    color: "#6b7280",
  };

  const passwordStrengthBarsStyle: CSSProperties = {
    display: "flex",
    gap: "0.25rem",
  };

  const passwordStrengthBarStyle: CSSProperties = {
    flex: 1,
    height: "4px",
    borderRadius: "2px",
    transition: "background-color 0.3s",
  };

  const errorTextStyle: CSSProperties = {
    color: "#ef4444",
    fontSize: isMobile ? "0.7rem" : "0.75rem",
    marginTop: "0.25rem",
  };

  const termsContainerStyle: CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.75rem",
    padding: isMobile ? "0.75rem" : "1rem",
    borderRadius: "0.5rem",
    backgroundColor: "#f9fafb",
    marginTop: "0.5rem",
  };

  const checkboxStyle: CSSProperties = {
    height: isMobile ? "1.1rem" : "1.25rem",
    width: isMobile ? "1.1rem" : "1.25rem",
    borderRadius: "0.25rem",
    border: "2px solid #d1d5db",
    accentColor: "#16a34a",
    flexShrink: 0,
  };

  const termsLabelStyle: CSSProperties = {
    fontSize: isMobile ? "0.8rem" : "0.875rem",
    color: "#4b5563",
    lineHeight: "1.5",
  };

  const termsLinkStyle: CSSProperties = {
    color: "#16a34a",
    fontWeight: 600,
    textDecoration: "none",
  };

  const submitButtonStyle: CSSProperties = {
    width: "100%",
    backgroundColor: "#16a34a",
    color: "white",
    fontWeight: "bold",
    padding: isMobile ? "0.85rem" : "1rem",
    borderRadius: "0.5rem",
    fontSize: isMobile ? "0.95rem" : "1rem",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s",
    marginTop: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
  };

  const loginLinkContainerStyle: CSSProperties = {
    textAlign: "center",
    paddingTop: "1rem",
  };

  const loginLinkStyle: CSSProperties = {
    color: "#16a34a",
    fontWeight: 600,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    fontSize: isMobile ? "0.85rem" : "0.875rem",
  };

  return (
    <BaseRegisterModal
      visible={visible}
      onHide={handleClose}
      loading={loading}
      accountType="utilisateur"
      onAccountTypeChange={(type) => {
        if (type === "vendeur" && onSwitchToVendeur) {
          onSwitchToVendeur();
        }
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: isMobile ? "0.75rem" : "1rem",
        }}
      >
        <div style={{ marginBottom: isMobile ? "1rem" : "1.5rem" }}>
          <h2
            style={{
              fontSize: isMobile ? "1.3rem" : "1.5rem",
              fontWeight: "bold",
              color: "#1f2937",
              marginBottom: "0.5rem",
            }}
          >
            Créer un compte utilisateur
          </h2>
          <p style={{ color: "#6b7280", fontSize: isMobile ? "0.85rem" : "0.875rem" }}>
            Remplissez les informations pour créer votre compte
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: "0.75rem",
              borderRadius: "0.5rem",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              fontSize: isMobile ? "0.85rem" : "0.875rem",
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
            <span>{error}</span>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: isMobile ? "0.75rem" : "1rem",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: isMobile ? "0.85rem" : "0.875rem",
                fontWeight: 600,
                color: "#374151",
                marginBottom: "0.4rem",
              }}
            >
              Prénom *
            </label>
            <input
              type="text"
              placeholder="Jean"
              value={formData.prenoms}
              onChange={(e) =>
                setFormData({ ...formData, prenoms: e.target.value })
              }
              disabled={loading}
              required
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: isMobile ? "0.85rem" : "0.875rem",
                fontWeight: 600,
                color: "#374151",
                marginBottom: "0.4rem",
              }}
            >
              Nom *
            </label>
            <input
              type="text"
              placeholder="Kouassi"
              value={formData.nom}
              onChange={(e) =>
                setFormData({ ...formData, nom: e.target.value })
              }
              disabled={loading}
              required
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: isMobile ? "0.85rem" : "0.875rem",
              fontWeight: 600,
              color: "#374151",
              marginBottom: "0.4rem",
            }}
          >
            Email *
          </label>
          <input
            type="email"
            placeholder="exemple@email.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            disabled={loading}
            required
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: isMobile ? "0.75rem" : "1rem",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: isMobile ? "0.85rem" : "0.875rem",
                fontWeight: 600,
                color: "#374151",
                marginBottom: "0.4rem",
              }}
            >
              Téléphone *
            </label>
            <input
              type="tel"
              placeholder="+225 07 09 18 18 64"
              value={formData.telephone}
              onChange={handlePhoneChange}
              disabled={loading}
              required
              style={{
                ...inputStyle,
                borderColor: phoneError ? "#ef4444" : "#d1d5db",
              }}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            {phoneError && (
              <p style={errorTextStyle}>{phoneError}</p>
            )}
            <small style={{ color: "#6b7280", fontSize: isMobile ? "0.7rem" : "0.75rem", marginTop: "0.25rem", display: "block" }}>
              Format: +225 07 09 18 18 64 (10 chiffres)
            </small>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: isMobile ? "0.85rem" : "0.875rem",
                fontWeight: 600,
                color: "#374151",
                marginBottom: "0.4rem",
              }}
            >
              Ville *
            </label>
            <input
              type="text"
              placeholder="Abidjan"
              value={formData.ville}
              onChange={(e) =>
                setFormData({ ...formData, ville: e.target.value })
              }
              disabled={loading}
              required
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: isMobile ? "0.75rem" : "1rem",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: isMobile ? "0.85rem" : "0.875rem",
                fontWeight: 600,
                color: "#374151",
                marginBottom: "0.4rem",
              }}
            >
              Mot de passe *
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.mot_de_passe}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mot_de_passe: e.target.value,
                  })
                }
                disabled={loading}
                required
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                style={passwordToggleStyle}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>

            {formData.mot_de_passe && (
              <div style={{ marginTop: "0.5rem" }}>
                <div style={passwordStrengthHeaderStyle}>
                  <span>Force:</span>
                  <span style={{ color: getPasswordStrengthColor() }}>
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <div style={passwordStrengthBarsStyle}>
                  {[1, 2, 3, 4, 5].map((index) => (
                    <div
                      key={index}
                      style={{
                        ...passwordStrengthBarStyle,
                        backgroundColor:
                          index <= passwordStrength
                            ? getPasswordStrengthColor()
                            : "#e5e7eb",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: isMobile ? "0.85rem" : "0.875rem",
                fontWeight: 600,
                color: "#374151",
                marginBottom: "0.4rem",
              }}
            >
              Confirmer *
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (passwordMismatch) setPasswordMismatch(false);
                }}
                disabled={loading}
                required
                style={{
                  ...inputStyle,
                  borderColor: passwordMismatch ? "#ef4444" : "#d1d5db",
                }}
                onFocus={handleFocus}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = passwordMismatch
                    ? "#ef4444"
                    : "#d1d5db";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
                style={passwordToggleStyle}
              >
                <FontAwesomeIcon
                  icon={showConfirmPassword ? faEyeSlash : faEye}
                />
              </button>
            </div>
            {passwordMismatch && (
              <p style={errorTextStyle}>
                Les mots de passe ne correspondent pas
              </p>
            )}
          </div>
        </div>

        <div style={termsContainerStyle}>
          <input
            type="checkbox"
            id="terms"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            disabled={loading}
            style={checkboxStyle}
          />
          <label htmlFor="terms" style={termsLabelStyle}>
            J'accepte les{" "}
            <a href="#" style={termsLinkStyle}>
              conditions d'utilisation
            </a>{" "}
            et la{" "}
            <a href="#" style={termsLinkStyle}>
              politique de confidentialité
            </a>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !acceptTerms || passwordMismatch}
          style={submitButtonStyle}
        >
          {loading ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin />
              <span style={{ fontSize: isMobile ? "0.9rem" : "1rem" }}>
                Création en cours...
              </span>
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faCheckCircle} />
              <span style={{ fontSize: isMobile ? "0.9rem" : "1rem" }}>
                Créer mon compte
              </span>
            </>
          )}
        </button>

        <div style={loginLinkContainerStyle}>
          <p style={{ fontSize: isMobile ? "0.85rem" : "0.875rem" }}>
            Déjà un compte ?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              style={loginLinkStyle}
            >
              Se connecter
            </button>
          </p>
        </div>
      </form>
    </BaseRegisterModal>
  );
};

export default UserRegisterModal;