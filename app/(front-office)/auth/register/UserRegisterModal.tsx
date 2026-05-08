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
  faKey,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { faGoogle, faFacebook } from "@fortawesome/free-brands-svg-icons";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import BaseRegisterModal from "./BaseRegisterModal";
import { api } from "@/lib/api-client";

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
  const [step, setStep] = useState<"register" | "otp">("register");
  const [tempToken, setTempToken] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
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
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [socialLoading, setSocialLoading] = useState<"google" | "facebook" | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [registeredEmail, setRegisteredEmail] = useState<string>("");

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (!visible) {
      resetForm();
      setStep("register");
      setTempToken("");
      setOtp("");
      setRegisteredEmail("");
    }
  }, [visible]);

  const validatePhoneNumber = (phone: string): boolean => {
    const numbers = phone.replace(/^\+225\s*/, '').replace(/\s/g, '');
    return /^\d{10}$/.test(numbers);
  };

  const formatPhoneNumber = (value: string): string => {
    let cleaned = value.replace(/[^\d+]/g, '');
    if (!cleaned.startsWith('+225')) {
      cleaned = '+225' + cleaned.replace(/^0+/, '');
    }
    let numbers = cleaned.replace('+225', '').replace(/\s/g, '');
    numbers = numbers.slice(0, 10);
    let formatted = '+225';
    if (numbers.length > 0) {
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

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    setSocialLoading(provider);
    setError(null);

    try {
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      let authUrl = "";
      if (provider === "google") {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        const redirectUri = `${window.location.origin}/auth/google/callback`;
        const scope = "email profile openid";
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=id_token&scope=${scope}&nonce=${Date.now()}`;
      } else {
        const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
        const redirectUri = `${window.location.origin}/auth/facebook/callback`;
        authUrl = `https://www.facebook.com/v22.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&response_type=token&scope=email,public_profile`;
      }

      const popup = window.open(authUrl, "oauth-popup", `width=${width},height=${height},left=${left},top=${top}`);

      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === "oauth-success") {
          popup?.close();
          window.removeEventListener("message", handleMessage);
          
          setTimeout(() => {
            const token = localStorage.getItem("oskar_token");
            const userStr = localStorage.getItem("oskar_user");
            
            if (token && userStr) {
              const user = JSON.parse(userStr);
              onRegisterSuccess({
                firstName: user.prenoms || "",
                lastName: user.nom || "",
                email: user.email,
                token: token,
                userData: user,
              });
              onHide();
            }
          }, 500);
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
      
    } catch (err: any) {
      console.error(`Erreur ${provider}:`, err);
      setError(err.message || `Erreur lors de la connexion avec ${provider}`);
      setSocialLoading(null);
    }
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
        role_uuid: "b7622f5f-67af-11f0-bc93-246a0e9e769c"
      };

      const response = await fetch(API_ENDPOINTS.AUTH.UTILISATEUR.INSCRIPTION_VIA_OTP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        setTempToken(data.data.temp_token);
        setRegisteredEmail(formData.email);
        setStep("otp");
        setSuccess("Un code OTP a été envoyé à votre adresse email");
        setCountdown(60);
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

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError("Veuillez entrer le code OTP à 6 chiffres reçu par email");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.AUTH.UTILISATEUR.VALIDE_OPT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp, temp_token: tempToken }),
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        const { access_token, refresh_token, user } = data.data;
        
        // ✅ CORRECTION: saveAuthData accepte 3 arguments (token, user, userType)
        api.saveAuthData(access_token, user, "utilisateur");
        
        // ✅ Sauvegarder le refresh token séparément si disponible
        if (refresh_token) {
          localStorage.setItem("oskar_refresh_token", refresh_token);
          localStorage.setItem("refreshToken", refresh_token);
        }
        
        // ✅ Sauvegarder aussi dans les cookies pour le middleware
        document.cookie = `user_type=utilisateur; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `user_uuid=${user.uuid}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `oskar_token=${access_token}; path=/; max-age=86400; SameSite=Lax`;
        
        setSuccess("Inscription réussie ! Redirection...");
        
        setTimeout(() => {
          onRegisterSuccess({
            firstName: user.prenoms || formData.prenoms,
            lastName: user.nom || formData.nom,
            email: user.email || formData.email,
            token: access_token,
            userData: user,
          });
          onHide();
        }, 1500);
      } else {
        setError(data.message || "Code OTP invalide ou expiré");
      }
    } catch (error) {
      console.error("Erreur vérification OTP:", error);
      setError("Erreur lors de la vérification du code");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.AUTH.UTILISATEUR.RENVOYER_OTP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registeredEmail }),
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        setTempToken(data.data.temp_token);
        setSuccess("Un nouveau code OTP a été envoyé à votre email");
        setCountdown(60);
      } else {
        setError(data.message || "Erreur lors du renvoi du code");
      }
    } catch (error) {
      console.error("Erreur renvoi OTP:", error);
      setError("Erreur lors du renvoi du code");
    } finally {
      setLoading(false);
    }
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
    setSuccess(null);
  };

  const handleClose = () => {
    resetForm();
    setStep("register");
    setTempToken("");
    setOtp("");
    setRegisteredEmail("");
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

  const inputStyle: CSSProperties = {
    width: "100%",
    padding: isMobile ? "0.6rem" : "0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.5rem",
    outline: "none",
    transition: "all 0.2s",
    fontSize: isMobile ? "0.85rem" : "0.875rem",
  };

  const buttonStyle: CSSProperties = {
    width: "100%",
    padding: isMobile ? "0.7rem" : "0.85rem",
    borderRadius: "0.5rem",
    fontWeight: 600,
    fontSize: isMobile ? "0.85rem" : "0.9rem",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.75rem",
    transition: "all 0.2s",
  };

  // Écran OTP
  if (step === "otp") {
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
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ width: "60px", height: "60px", backgroundColor: "#16a34a", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
            <FontAwesomeIcon icon={faKey} style={{ fontSize: "1.5rem", color: "white" }} />
          </div>
          <h3 style={{ fontSize: isMobile ? "1.2rem" : "1.3rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Vérification OTP</h3>
          <p style={{ color: "#6b7280", fontSize: isMobile ? "0.85rem" : "0.875rem" }}>
            Un code à 6 chiffres a été envoyé à <strong>{registeredEmail}</strong>
          </p>
        </div>

        {error && (
          <div style={{ padding: "0.75rem", borderRadius: "0.5rem", backgroundColor: "#fef2f2", border: "1px solid #fecaca", fontSize: isMobile ? "0.85rem" : "0.875rem", color: "#dc2626", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <FontAwesomeIcon icon={faXmark} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ padding: "0.75rem", borderRadius: "0.5rem", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", fontSize: isMobile ? "0.85rem" : "0.875rem", color: "#16a34a", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <FontAwesomeIcon icon={faCheckCircle} />
            <span>{success}</span>
          </div>
        )}

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", fontSize: isMobile ? "0.85rem" : "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.4rem" }}>Code OTP</label>
          <input
            type="text"
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            disabled={loading}
            style={{
              ...inputStyle,
              textAlign: "center",
              fontSize: "1.5rem",
              letterSpacing: "0.5rem",
              fontFamily: "monospace"
            }}
          />
        </div>

        <button
          onClick={handleVerifyOtp}
          disabled={loading || otp.length !== 6}
          style={{
            width: "100%",
            backgroundColor: "#16a34a",
            color: "white",
            fontWeight: "bold",
            padding: isMobile ? "0.85rem" : "1rem",
            borderRadius: "0.5rem",
            fontSize: isMobile ? "0.95rem" : "1rem",
            border: "none",
            cursor: loading || otp.length !== 6 ? "not-allowed" : "pointer",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            opacity: loading || otp.length !== 6 ? 0.6 : 1
          }}
        >
          {loading ? <><FontAwesomeIcon icon={faSpinner} spin /><span>Vérification...</span></> : <><FontAwesomeIcon icon={faCheckCircle} /><span>Vérifier et continuer</span></>}
        </button>

        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={countdown > 0 || loading}
            style={{
              background: "none",
              border: "none",
              color: "#16a34a",
              fontWeight: 600,
              cursor: countdown > 0 || loading ? "not-allowed" : "pointer",
              fontSize: isMobile ? "0.85rem" : "0.875rem",
              opacity: countdown > 0 || loading ? 0.6 : 1
            }}
          >
            {countdown > 0 ? `Renvoyer le code (${countdown}s)` : "Renvoyer le code"}
          </button>
        </div>

        <div style={{ textAlign: "center" }}>
          <button
            type="button"
            onClick={() => {
              setStep("register");
              setTempToken("");
              setOtp("");
              setError(null);
              setSuccess(null);
            }}
            style={{
              background: "none",
              border: "none",
              color: "#6b7280",
              fontWeight: 500,
              cursor: "pointer",
              fontSize: isMobile ? "0.85rem" : "0.875rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem"
            }}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Modifier mes informations
          </button>
        </div>
      </BaseRegisterModal>
    );
  }

  // Écran d'inscription
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
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: isMobile ? "0.75rem" : "1rem" }}>
        <div style={{ marginBottom: isMobile ? "1rem" : "1.5rem" }}>
          <h2 style={{ fontSize: isMobile ? "1.3rem" : "1.5rem", fontWeight: "bold", color: "#1f2937", marginBottom: "0.5rem" }}>
            Créer un compte utilisateur
          </h2>
          <p style={{ color: "#6b7280", fontSize: isMobile ? "0.85rem" : "0.875rem" }}>
            Remplissez les informations pour créer votre compte
          </p>
        </div>

        {/* Boutons sociaux */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <button
            type="button"
            onClick={() => handleSocialLogin("google")}
            disabled={!!socialLoading}
            style={{
              ...buttonStyle,
              backgroundColor: "#fff",
              color: "#374151",
              border: "1px solid #d1d5db",
              opacity: socialLoading ? 0.7 : 1,
            }}
          >
            {socialLoading === "google" ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              <FontAwesomeIcon icon={faGoogle} style={{ fontSize: "1rem" }} />
            )}
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin("facebook")}
            disabled={!!socialLoading}
            style={{
              ...buttonStyle,
              backgroundColor: "#1877f2",
              color: "white",
              border: "none",
              opacity: socialLoading ? 0.7 : 1,
            }}
          >
            {socialLoading === "facebook" ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              <FontAwesomeIcon icon={faFacebook} style={{ fontSize: "1rem" }} />
            )}
            <span>Facebook</span>
          </button>
        </div>

        <div style={{ textAlign: "center", position: "relative", margin: "0.5rem 0" }}>
          <span style={{ backgroundColor: "#f9fafb", padding: "0 0.75rem", color: "#9ca3af", fontSize: isMobile ? "0.75rem" : "0.8rem" }}>
            ou inscrivez-vous avec email
          </span>
          <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "1px", backgroundColor: "#e5e7eb", zIndex: -1 }} />
        </div>

        {error && (
          <div style={{ padding: "0.75rem", borderRadius: "0.5rem", backgroundColor: "#fef2f2", border: "1px solid #fecaca", fontSize: isMobile ? "0.85rem" : "0.875rem", color: "#dc2626", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FontAwesomeIcon icon={faXmark} />
            <span>{error}</span>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? "0.75rem" : "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: isMobile ? "0.85rem" : "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.4rem" }}>Prénom *</label>
            <input type="text" placeholder="Jean" value={formData.prenoms} onChange={(e) => setFormData({ ...formData, prenoms: e.target.value })} disabled={loading} required style={inputStyle} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: isMobile ? "0.85rem" : "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.4rem" }}>Nom *</label>
            <input type="text" placeholder="Kouassi" value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} disabled={loading} required style={inputStyle} />
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: isMobile ? "0.85rem" : "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.4rem" }}>Email *</label>
          <input type="email" placeholder="exemple@email.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} disabled={loading} required style={inputStyle} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? "0.75rem" : "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: isMobile ? "0.85rem" : "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.4rem" }}>Téléphone *</label>
            <input type="tel" placeholder="+225 07 09 18 18 64" value={formData.telephone} onChange={handlePhoneChange} disabled={loading} required style={{ ...inputStyle, borderColor: phoneError ? "#ef4444" : "#d1d5db" }} />
            {phoneError && <p style={{ color: "#ef4444", fontSize: isMobile ? "0.7rem" : "0.75rem", marginTop: "0.25rem" }}>{phoneError}</p>}
          </div>
          <div>
            <label style={{ display: "block", fontSize: isMobile ? "0.85rem" : "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.4rem" }}>Ville *</label>
            <input type="text" placeholder="Abidjan" value={formData.ville} onChange={(e) => setFormData({ ...formData, ville: e.target.value })} disabled={loading} required style={inputStyle} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? "0.75rem" : "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: isMobile ? "0.85rem" : "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.4rem" }}>Mot de passe *</label>
            <div style={{ position: "relative" }}>
              <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={formData.mot_de_passe} onChange={(e) => setFormData({ ...formData, mot_de_passe: e.target.value })} disabled={loading} required style={inputStyle} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={loading} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#6b7280", cursor: "pointer" }}>
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
            {formData.mot_de_passe && (
              <div style={{ marginTop: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem", fontSize: isMobile ? "0.7rem" : "0.75rem", color: "#6b7280" }}>
                  <span>Force:</span>
                  <span style={{ color: getPasswordStrengthColor() }}>{getPasswordStrengthText()}</span>
                </div>
                <div style={{ display: "flex", gap: "0.25rem" }}>
                  {[1, 2, 3, 4, 5].map((index) => (
                    <div key={index} style={{ flex: 1, height: "4px", borderRadius: "2px", backgroundColor: index <= passwordStrength ? getPasswordStrengthColor() : "#e5e7eb" }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label style={{ display: "block", fontSize: isMobile ? "0.85rem" : "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.4rem" }}>Confirmer *</label>
            <div style={{ position: "relative" }}>
              <input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); if (passwordMismatch) setPasswordMismatch(false); }} disabled={loading} required style={{ ...inputStyle, borderColor: passwordMismatch ? "#ef4444" : "#d1d5db" }} />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={loading} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#6b7280", cursor: "pointer" }}>
                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
              </button>
            </div>
            {passwordMismatch && <p style={{ color: "#ef4444", fontSize: isMobile ? "0.7rem" : "0.75rem", marginTop: "0.25rem" }}>Les mots de passe ne correspondent pas</p>}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: isMobile ? "0.75rem" : "1rem", borderRadius: "0.5rem", backgroundColor: "#f9fafb", marginTop: "0.5rem" }}>
          <input type="checkbox" id="terms" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} disabled={loading} style={{ height: isMobile ? "1.1rem" : "1.25rem", width: isMobile ? "1.1rem" : "1.25rem", borderRadius: "0.25rem", border: "2px solid #d1d5db", accentColor: "#16a34a", flexShrink: 0 }} />
          <label htmlFor="terms" style={{ fontSize: isMobile ? "0.8rem" : "0.875rem", color: "#4b5563", lineHeight: "1.5" }}>
            J'accepte les <a href="#" style={{ color: "#16a34a", fontWeight: 600, textDecoration: "none" }}>conditions d'utilisation</a> et la <a href="#" style={{ color: "#16a34a", fontWeight: 600, textDecoration: "none" }}>politique de confidentialité</a>
          </label>
        </div>

        <button type="submit" disabled={loading || !acceptTerms || passwordMismatch} style={{ width: "100%", backgroundColor: "#16a34a", color: "white", fontWeight: "bold", padding: isMobile ? "0.85rem" : "1rem", borderRadius: "0.5rem", fontSize: isMobile ? "0.95rem" : "1rem", border: "none", cursor: "pointer", marginTop: "1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", opacity: loading || !acceptTerms || passwordMismatch ? 0.6 : 1 }}>
          {loading ? <><FontAwesomeIcon icon={faSpinner} spin /><span>Création en cours...</span></> : <><FontAwesomeIcon icon={faCheckCircle} /><span>Créer mon compte</span></>}
        </button>

        <div style={{ textAlign: "center", paddingTop: "1rem" }}>
          <p style={{ fontSize: isMobile ? "0.85rem" : "0.875rem" }}>
            Déjà un compte ? <button type="button" onClick={onSwitchToLogin} style={{ color: "#16a34a", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: isMobile ? "0.85rem" : "0.875rem" }}>Se connecter</button>
          </p>
        </div>
      </form>
    </BaseRegisterModal>
  );
};

export default UserRegisterModal;