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
  faPhone,
  faShieldHalved,
  faUsers,
  faBolt,
  faCamera,
  faSpinner,
  faStore,
  faFileAlt,
  faUpload,
  faCheckCircle,
  faArrowRight,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { faGoogle, faFacebook } from "@fortawesome/free-brands-svg-icons";
import { API_ENDPOINTS } from "@/config/api-endpoints";

interface RegisterModalProps {
  visible: boolean;
  onHide: () => void;
  onSwitchToLogin: () => void;
  onRegisterSuccess: (userData: {
    firstName: string;
    lastName: string;
    email?: string;
    type?: string;
    vendeurId?: string;
    token?: string;
    userData?: any;
  }) => void;
  // AJOUT: Props pour la création de boutique
  onCreateBoutique?: (vendeurData: any) => void;
}

interface RegisterFormData {
  nom: string;
  prenoms: string;
  email: string;
  pseudo: string;
  mot_de_passe: string;
  telephone: string;
  ville: string;
  type_utilisateur?: string;
  registre_commerce?: string;
}

type AccountType = "utilisateur" | "vendeur";

const RegisterModal: React.FC<RegisterModalProps> = ({
  visible,
  onHide,
  onSwitchToLogin,
  onRegisterSuccess,
  onCreateBoutique,
}) => {
  const [accountType, setAccountType] = useState<AccountType>("utilisateur");
  const [formData, setFormData] = useState<RegisterFormData>({
    nom: "",
    prenoms: "",
    email: "",
    pseudo: "",
    mot_de_passe: "",
    telephone: "+225",
    ville: "",
    type_utilisateur: "particulier",
    registre_commerce: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registreCommerceFile, setRegistreCommerceFile] = useState<File | null>(
    null,
  );
  const [registreCommercePreview, setRegistreCommercePreview] = useState<
    string | null
  >(null);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // AJOUT: État pour le modal de création de boutique
  const [showBoutiqueModal, setShowBoutiqueModal] = useState(false);
  const [newVendeurData, setNewVendeurData] = useState<any>(null);

  useEffect(() => {
    return () => {
      if (registreCommercePreview) {
        URL.revokeObjectURL(registreCommercePreview);
      }
    };
  }, [registreCommercePreview]);

  useEffect(() => {
    if (visible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [visible]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && visible && !loading) {
        onHide();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [visible, loading, onHide]);

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

  const handleAccountTypeChange = (type: AccountType) => {
    setAccountType(type);
    setError(null);

    if (type === "utilisateur" && registreCommerceFile) {
      if (registreCommercePreview) URL.revokeObjectURL(registreCommercePreview);
      setRegistreCommerceFile(null);
      setRegistreCommercePreview(null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("Le fichier ne doit pas dépasser 10MB");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError("Format non supporté. Utilisez: JPG, PNG, WebP ou PDF");
      return;
    }

    if (file.type.startsWith("image/")) {
      const previewUrl = URL.createObjectURL(file);
      setRegistreCommercePreview(previewUrl);
    }

    setRegistreCommerceFile(file);
    setError(null);
  };

  const validateForm = () => {
    setError(null);

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

    if (!formData.telephone || formData.telephone.length < 8) {
      setError("Le numéro de téléphone est requis");
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

    if (accountType === "vendeur") {
      if (!registreCommerceFile) {
        setError("Le registre de commerce est obligatoire pour les vendeurs");
        return false;
      }
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
      let endpoint: string;
      const basePayload: any = {
        nom: formData.nom,
        prenoms: formData.prenoms,
        email: formData.email,
        pseudo: formData.pseudo || formData.email.split("@")[0],
        mot_de_passe: formData.mot_de_passe,
        telephone: formData.telephone,
        ville: formData.ville,
        type_utilisateur:
          accountType === "vendeur" ? "professionnel" : "particulier",
      };

      if (accountType === "utilisateur") {
        endpoint = API_ENDPOINTS.AUTH.UTILISATEUR.REGISTER;

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(basePayload),
        });

        const data = await response.json();

        if (response.ok) {
          await handleRegistrationSuccess(data, "utilisateur");
        } else {
          setError(data.message || "Erreur lors de l'inscription");
        }
      } else {
        endpoint = API_ENDPOINTS.AUTH.VENDEUR.REGISTER;

        const formDataToSend = new FormData();

        Object.keys(basePayload).forEach((key) => {
          formDataToSend.append(key, basePayload[key]);
        });

        if (registreCommerceFile) {
          formDataToSend.append("registre_commerce", registreCommerceFile);
        }

        const response = await fetch(endpoint, {
          method: "POST",
          body: formDataToSend,
        });

        const data = await response.json();

        if (response.ok) {
          await handleRegistrationSuccess(data, "vendeur");
        } else {
          setError(data.message || "Erreur lors de l'inscription du vendeur");
        }
      }
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationSuccess = async (data: any, type: string) => {
    const token = data.token || data.accessToken;
    if (token) {
      localStorage.setItem("token", token);
    }
    if (data.refreshToken) {
      localStorage.setItem("refreshToken", data.refreshToken);
    }

    const userData = data.vendeur || data.utilisateur || data;

    const successData = {
      firstName: userData.prenoms || formData.prenoms || "",
      lastName: userData.nom || formData.nom || "",
      email: userData.email || formData.email,
      type: type,
      vendeurId: userData.uuid,
      token: token,
      userData: userData,
    };

    if (registreCommercePreview) {
      URL.revokeObjectURL(registreCommercePreview);
    }

    // SI C'EST UN VENDEUR, ON PROPOSE LA CRÉATION DE BOUTIQUE
    if (type === "vendeur") {
      setNewVendeurData(successData);
      setShowBoutiqueModal(true);
    } else {
      // POUR LES UTILISATEURS NORMALS, APPELER LE CALLBACK STANDARD
      resetForm();
      onRegisterSuccess(successData);
    }
  };

  // AJOUT: Fonction pour démarrer la création de boutique
  const handleStartBoutiqueCreation = () => {
    setShowBoutiqueModal(false);
    if (onCreateBoutique && newVendeurData) {
      onCreateBoutique(newVendeurData);
    }
    resetForm();
  };

  // AJOUT: Fonction pour ignorer la création de boutique
  const handleSkipBoutiqueCreation = () => {
    setShowBoutiqueModal(false);
    if (newVendeurData) {
      onRegisterSuccess(newVendeurData);
    }
    resetForm();
  };

  const handleSocialRegister = (provider: "google" | "facebook") => {
    let endpoint: string;

    if (accountType === "utilisateur") {
      endpoint =
        provider === "google"
          ? API_ENDPOINTS.AUTH.UTILISATEUR.GOOGLE_CONNEXION
          : API_ENDPOINTS.AUTH.UTILISATEUR.FACEBOOK;
    } else {
      endpoint =
        provider === "google"
          ? API_ENDPOINTS.AUTH.VENDEUR.GOOGLE_CONNEXION
          : API_ENDPOINTS.AUTH.VENDEUR.FACEBOOK;
    }

    window.location.href = endpoint;
  };

  const handlePhoneChange = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    const phone = "+225" + numbers;
    if (phone.length <= 13) {
      setFormData({ ...formData, telephone: phone });
    }
  };

  const removeRegistreCommerceFile = () => {
    if (registreCommercePreview) {
      URL.revokeObjectURL(registreCommercePreview);
    }
    setRegistreCommerceFile(null);
    setRegistreCommercePreview(null);
    setError(null);
  };

  const resetForm = () => {
    setFormData({
      nom: "",
      prenoms: "",
      email: "",
      pseudo: "",
      mot_de_passe: "",
      telephone: "+225",
      ville: "",
      type_utilisateur: "particulier",
      registre_commerce: "",
    });
    setConfirmPassword("");
    setAcceptTerms(false);
    setError(null);
    setPasswordMismatch(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setPasswordStrength(0);

    if (registreCommercePreview) {
      URL.revokeObjectURL(registreCommercePreview);
    }
    setRegistreCommerceFile(null);
    setRegistreCommercePreview(null);
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

  // AJOUT: Composant modal pour la proposition de création de boutique
  const BoutiqueCreationPromptModal = () => {
    if (!showBoutiqueModal) return null;

    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          zIndex: 20000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "1.5rem",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
            width: "100%",
            maxWidth: "500px",
            overflow: "hidden",
            position: "relative",
            animation: "slideIn 0.4s ease-out",
          }}
        >
          {/* Bouton de fermeture */}
          <button
            onClick={handleSkipBoutiqueCreation}
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              zIndex: 10,
              width: "2.5rem",
              height: "2.5rem",
              backgroundColor: "#f8fafc",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#f1f5f9";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#f8fafc";
            }}
            aria-label="Fermer"
          >
            <FontAwesomeIcon
              icon={faXmark}
              style={{ color: "#64748b", fontSize: "1.25rem" }}
            />
          </button>

          {/* Header avec illustration */}
          <div
            style={{
              background: "linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)",
              color: "white",
              padding: "2.5rem 2rem",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-50px",
                right: "-50px",
                width: "200px",
                height: "200px",
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "50%",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "-30px",
                left: "-30px",
                width: "150px",
                height: "150px",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "50%",
              }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  backgroundColor: "white",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.5rem",
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
                  animation: "bounce 2s infinite",
                }}
              >
                <FontAwesomeIcon
                  icon={faStore}
                  style={{ fontSize: "3rem", color: "#0ea5e9" }}
                />
              </div>
              <h2
                style={{
                  fontSize: "2rem",
                  fontWeight: "bold",
                  margin: 0,
                  marginBottom: "0.5rem",
                }}
              >
                Félicitations ! 🎉
              </h2>
              <p
                style={{
                  opacity: 0.9,
                  fontSize: "1.1rem",
                  maxWidth: "400px",
                  margin: "0 auto",
                  lineHeight: "1.5",
                }}
              >
                Votre compte vendeur a été créé avec succès
              </p>
            </div>
          </div>

          {/* Body avec contenu */}
          <div style={{ padding: "2.5rem" }}>
            {/* Message de succès */}
            <div
              style={{
                backgroundColor: "#f0f9ff",
                borderRadius: "1rem",
                padding: "1.5rem",
                marginBottom: "2rem",
                border: "2px solid #bae6fd",
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    width: "3rem",
                    height: "3rem",
                    backgroundColor: "#0ea5e9",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    style={{ color: "white", fontSize: "1.5rem" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      margin: 0,
                      color: "#0369a1",
                      fontWeight: "bold",
                      fontSize: "1.25rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Prêt à commencer !
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      color: "#475569",
                      lineHeight: "1.6",
                      fontSize: "0.95rem",
                    }}
                  >
                    Votre compte vendeur est maintenant actif. Pour commencer à
                    vendre, créez votre première boutique.
                  </p>
                </div>
              </div>
            </div>

            {/* Avantages de créer une boutique maintenant */}
            <div style={{ marginBottom: "2rem" }}>
              <h4
                style={{
                  color: "#1e293b",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <FontAwesomeIcon icon={faArrowRight} color="#0ea5e9" />
                Pourquoi créer votre boutique maintenant ?
              </h4>
              <div
                style={{
                  display: "grid",
                  gap: "0.75rem",
                }}
              >
                {[
                  "Commencez à vendre immédiatement",
                  "Accédez aux outils professionnels",
                  "Atteignez des milliers de clients",
                  "Génez vos premiers revenus",
                ].map((benefit, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.75rem",
                      backgroundColor: "#f8fafc",
                      borderRadius: "0.75rem",
                    }}
                  >
                    <div
                      style={{
                        width: "1.5rem",
                        height: "1.5rem",
                        backgroundColor: "#0ea5e9",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faPlus}
                        style={{ color: "white", fontSize: "0.75rem" }}
                      />
                    </div>
                    <span style={{ color: "#475569", fontSize: "0.9rem" }}>
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Boutons d'action */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <button
                onClick={handleStartBoutiqueCreation}
                style={{
                  backgroundColor: "#0ea5e9",
                  color: "white",
                  border: "none",
                  borderRadius: "0.75rem",
                  padding: "1.25rem",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.75rem",
                  boxShadow: "0 10px 20px rgba(14, 165, 233, 0.3)",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#0284c7";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 15px 25px rgba(14, 165, 233, 0.4)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#0ea5e9";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 20px rgba(14, 165, 233, 0.3)";
                }}
              >
                <FontAwesomeIcon icon={faStore} />
                Créer ma boutique maintenant
              </button>

              <button
                onClick={handleSkipBoutiqueCreation}
                style={{
                  backgroundColor: "transparent",
                  color: "#64748b",
                  border: "2px solid #e2e8f0",
                  borderRadius: "0.75rem",
                  padding: "1rem",
                  fontSize: "1rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8fafc";
                  e.currentTarget.style.borderColor = "#cbd5e1";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.borderColor = "#e2e8f0";
                }}
              >
                Créer plus tard depuis mon tableau de bord
              </button>
            </div>

            {/* Note informative */}
            <div
              style={{
                marginTop: "1.5rem",
                padding: "1rem",
                backgroundColor: "#f8fafc",
                borderRadius: "0.75rem",
                fontSize: "0.85rem",
                color: "#64748b",
                borderLeft: "4px solid #0ea5e9",
              }}
            >
              <p style={{ margin: 0, lineHeight: "1.5" }}>
                <strong>Note :</strong> Vous pouvez créer plusieurs boutiques
                plus tard. Nous vous recommandons de commencer avec une boutique
                principale pour vos premiers produits.
              </p>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-30px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes bounce {
            0%,
            100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }
        `}</style>
      </div>
    );
  };

  if (!visible) return null;

  return (
    <>
      {/* Modal de proposition de création de boutique */}
      <BoutiqueCreationPromptModal />

      {/* Modal d'inscription original */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 9999,
        }}
        onClick={handleClose}
      />

      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10000,
          overflowY: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "1rem",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
            width: "100%",
            maxWidth: "1000px",
            overflow: "hidden",
            position: "relative",
            display: "flex",
            flexDirection: "row",
            minHeight: "500px",
            maxHeight: "90vh",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleClose}
            disabled={loading}
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              zIndex: 10,
              width: "2rem",
              height: "2rem",
              backgroundColor: "#f3f4f6",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseOver={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = "#e5e7eb";
            }}
            onMouseOut={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = "#f3f4f6";
            }}
            aria-label="Fermer"
          >
            <FontAwesomeIcon
              icon={faXmark}
              style={{ color: "#4b5563", fontSize: "1rem" }}
            />
          </button>

          <div
            style={{
              flex: "0 0 40%",
              backgroundColor:
                accountType === "vendeur" ? "#0ea5e9" : "#16a34a",
              color: "white",
              padding: "2rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
                zIndex: 0,
              }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div
                style={{
                  marginBottom: "2rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    width: "4rem",
                    height: "4rem",
                    backgroundColor: "white",
                    borderRadius: "1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  <span
                    style={{
                      color: accountType === "vendeur" ? "#0ea5e9" : "#16a34a",
                      fontWeight: "bold",
                      fontSize: "1.5rem",
                    }}
                  >
                    OS
                  </span>
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                      margin: 0,
                    }}
                  >
                    OskarStore
                  </h2>
                  <p style={{ opacity: 0.9, fontSize: "0.875rem", margin: 0 }}>
                    {accountType === "vendeur"
                      ? "Plateforme de vente"
                      : "Marketplace"}
                  </p>
                </div>
              </div>

              <div
                style={{
                  marginBottom: "2rem",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "0.75rem",
                  padding: "0.5rem",
                  display: "flex",
                  backdropFilter: "blur(10px)",
                }}
              >
                <button
                  type="button"
                  onClick={() => handleAccountTypeChange("utilisateur")}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    backgroundColor:
                      accountType === "utilisateur" ? "white" : "transparent",
                    color: accountType === "utilisateur" ? "#16a34a" : "white",
                    border: "none",
                    borderRadius: "0.5rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    fontSize: "0.875rem",
                  }}
                >
                  <FontAwesomeIcon icon={faUser} />
                  <span>Utilisateur</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAccountTypeChange("vendeur")}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    backgroundColor:
                      accountType === "vendeur" ? "white" : "transparent",
                    color: accountType === "vendeur" ? "#0ea5e9" : "white",
                    border: "none",
                    borderRadius: "0.5rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    fontSize: "0.875rem",
                  }}
                >
                  <FontAwesomeIcon icon={faStore} />
                  <span>Vendeur</span>
                </button>
              </div>

              <h1
                style={{
                  fontSize: "1.75rem",
                  fontWeight: "bold",
                  marginBottom: "1rem",
                }}
              >
                {accountType === "vendeur"
                  ? "Devenez vendeur sur OskarStore"
                  : "Rejoignez notre communauté"}
              </h1>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: accountType === "vendeur" ? "#bae6fd" : "#bbf7d0",
                  marginBottom: "2rem",
                  lineHeight: "1.6",
                }}
              >
                {accountType === "vendeur"
                  ? "Créez votre boutique en ligne, atteignez des milliers de clients et gérez vos ventes simplement."
                  : "Découvrez des produits uniques, échangez avec la communauté et profitez d'une expérience shopping exceptionnelle."}
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                }}
              >
                {accountType === "vendeur" ? (
                  <>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.75rem",
                      }}
                    >
                      <div
                        style={{
                          width: "2.5rem",
                          height: "2.5rem",
                          backgroundColor: "rgba(255, 255, 255, 0.2)",
                          borderRadius: "0.5rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faStore}
                          style={{ fontSize: "1.125rem" }}
                        />
                      </div>
                      <div>
                        <h3
                          style={{
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            marginBottom: "0.25rem",
                          }}
                        >
                          Boutique personnalisée
                        </h3>
                        <p style={{ color: "#bae6fd", fontSize: "0.75rem" }}>
                          Design et configuration selon vos besoins
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.75rem",
                      }}
                    >
                      <div
                        style={{
                          width: "2.5rem",
                          height: "2.5rem",
                          backgroundColor: "rgba(255, 255, 255, 0.2)",
                          borderRadius: "0.5rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faUsers}
                          style={{ fontSize: "1.125rem" }}
                        />
                      </div>
                      <div>
                        <h3
                          style={{
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            marginBottom: "0.25rem",
                          }}
                        >
                          Clients qualifiés
                        </h3>
                        <p style={{ color: "#bae6fd", fontSize: "0.75rem" }}>
                          Accédez à une audience engagée
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.75rem",
                      }}
                    >
                      <div
                        style={{
                          width: "2.5rem",
                          height: "2.5rem",
                          backgroundColor: "rgba(255, 255, 255, 0.2)",
                          borderRadius: "0.5rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faShieldHalved}
                          style={{ fontSize: "1.125rem" }}
                        />
                      </div>
                      <div>
                        <h3
                          style={{
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            marginBottom: "0.25rem",
                          }}
                        >
                          Paiements sécurisés
                        </h3>
                        <p style={{ color: "#bae6fd", fontSize: "0.75rem" }}>
                          Transactions protégées et garanties
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.75rem",
                      }}
                    >
                      <div
                        style={{
                          width: "2.5rem",
                          height: "2.5rem",
                          backgroundColor: "rgba(255, 255, 255, 0.2)",
                          borderRadius: "0.5rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faShieldHalved}
                          style={{ fontSize: "1.125rem" }}
                        />
                      </div>
                      <div>
                        <h3
                          style={{
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            marginBottom: "0.25rem",
                          }}
                        >
                          Compte sécurisé
                        </h3>
                        <p style={{ color: "#bbf7d0", fontSize: "0.75rem" }}>
                          Vos données personnelles sont protégées
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.75rem",
                      }}
                    >
                      <div
                        style={{
                          width: "2.5rem",
                          height: "2.5rem",
                          backgroundColor: "rgba(255, 255, 255, 0.2)",
                          borderRadius: "0.5rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faBolt}
                          style={{ fontSize: "1.125rem" }}
                        />
                      </div>
                      <div>
                        <h3
                          style={{
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            marginBottom: "0.25rem",
                          }}
                        >
                          Achats rapides
                        </h3>
                        <p style={{ color: "#bbf7d0", fontSize: "0.75rem" }}>
                          Processus d'achat simplifié et efficace
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.75rem",
                      }}
                    >
                      <div
                        style={{
                          width: "2.5rem",
                          height: "2.5rem",
                          backgroundColor: "rgba(255, 255, 255, 0.2)",
                          borderRadius: "0.5rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faUsers}
                          style={{ fontSize: "1.125rem" }}
                        />
                      </div>
                      <div>
                        <h3
                          style={{
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            marginBottom: "0.25rem",
                          }}
                        >
                          Communauté active
                        </h3>
                        <p style={{ color: "#bbf7d0", fontSize: "0.75rem" }}>
                          Échangez avec d'autres passionnés
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div
            style={{
              flex: "0 0 60%",
              padding: "2rem",
              overflowY: "auto",
              maxHeight: "90vh",
            }}
          >
            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div style={{ marginBottom: "1.5rem" }}>
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    color: "#1f2937",
                    marginBottom: "0.5rem",
                  }}
                >
                  Créer un compte{" "}
                  {accountType === "vendeur" ? "vendeur" : "utilisateur"}
                </h2>
                <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                  Remplissez les informations requises pour créer votre compte
                </p>
              </div>

              {error && (
                <div
                  style={{
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                    backgroundColor: "#fef2f2",
                    border: "1px solid #fecaca",
                    fontSize: "0.875rem",
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
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: "0.5rem",
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
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      outline: "none",
                      transition: "all 0.2s",
                      backgroundColor: loading ? "#f9fafb" : "white",
                      color: "#1f2937",
                      fontSize: "0.875rem",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor =
                        accountType === "vendeur" ? "#0ea5e9" : "#16a34a";
                      e.currentTarget.style.boxShadow = `0 0 0 3px ${accountType === "vendeur" ? "rgba(14, 165, 233, 0.1)" : "rgba(22, 163, 74, 0.1)"}`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#d1d5db";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: "0.5rem",
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
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      outline: "none",
                      transition: "all 0.2s",
                      backgroundColor: loading ? "#f9fafb" : "white",
                      color: "#1f2937",
                      fontSize: "0.875rem",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor =
                        accountType === "vendeur" ? "#0ea5e9" : "#16a34a";
                      e.currentTarget.style.boxShadow = `0 0 0 3px ${accountType === "vendeur" ? "rgba(14, 165, 233, 0.1)" : "rgba(22, 163, 74, 0.1)"}`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#d1d5db";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: "0.5rem",
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
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.5rem",
                    outline: "none",
                    transition: "all 0.2s",
                    backgroundColor: loading ? "#f9fafb" : "white",
                    color: "#1f2937",
                    fontSize: "0.875rem",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor =
                      accountType === "vendeur" ? "#0ea5e9" : "#16a34a";
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${accountType === "vendeur" ? "rgba(14, 165, 233, 0.1)" : "rgba(22, 163, 74, 0.1)"}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#d1d5db";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    placeholder="+225 07 00 00 00 00"
                    value={formData.telephone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    disabled={loading}
                    required
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      outline: "none",
                      transition: "all 0.2s",
                      backgroundColor: loading ? "#f9fafb" : "white",
                      color: "#1f2937",
                      fontSize: "0.875rem",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor =
                        accountType === "vendeur" ? "#0ea5e9" : "#16a34a";
                      e.currentTarget.style.boxShadow = `0 0 0 3px ${accountType === "vendeur" ? "rgba(14, 165, 233, 0.1)" : "rgba(22, 163, 74, 0.1)"}`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#d1d5db";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: "0.5rem",
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
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      outline: "none",
                      transition: "all 0.2s",
                      backgroundColor: loading ? "#f9fafb" : "white",
                      color: "#1f2937",
                      fontSize: "0.875rem",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor =
                        accountType === "vendeur" ? "#0ea5e9" : "#16a34a";
                      e.currentTarget.style.boxShadow = `0 0 0 3px ${accountType === "vendeur" ? "rgba(14, 165, 233, 0.1)" : "rgba(22, 163, 74, 0.1)"}`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#d1d5db";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>

              {accountType === "vendeur" && (
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Registre de commerce *
                    <span
                      style={{
                        color: "#6b7280",
                        fontWeight: "normal",
                        fontSize: "0.75rem",
                        marginLeft: "0.5rem",
                      }}
                    >
                      (PDF, JPG, PNG - max 10MB)
                    </span>
                  </label>

                  {registreCommerceFile ? (
                    <div
                      style={{
                        border: "2px solid #0ea5e9",
                        borderRadius: "0.5rem",
                        padding: "1rem",
                        backgroundColor: "#f0f9ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faFileAlt}
                          style={{ fontSize: "1.5rem", color: "#0ea5e9" }}
                        />
                        <div>
                          <p
                            style={{
                              fontWeight: 600,
                              color: "#1e40af",
                              margin: 0,
                            }}
                          >
                            {registreCommerceFile.name}
                          </p>
                          <p
                            style={{
                              fontSize: "0.75rem",
                              color: "#6b7280",
                              margin: 0,
                            }}
                          >
                            {(registreCommerceFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeRegistreCommerceFile}
                        disabled={loading}
                        style={{
                          padding: "0.375rem 0.75rem",
                          backgroundColor: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: "0.375rem",
                          fontWeight: 600,
                          cursor: loading ? "not-allowed" : "pointer",
                          transition: "background-color 0.2s",
                          fontSize: "0.75rem",
                          opacity: loading ? 0.5 : 1,
                        }}
                      >
                        Supprimer
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        border: "2px dashed #d1d5db",
                        borderRadius: "0.5rem",
                        padding: "2rem",
                        backgroundColor: "#f9fafb",
                        textAlign: "center",
                        transition: "all 0.2s",
                        cursor: loading ? "not-allowed" : "pointer",
                      }}
                      onClick={() => {
                        if (!loading) {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = ".jpg,.jpeg,.png,.pdf";
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement)
                              .files?.[0];
                            if (file) handleImageChange(e as any);
                          };
                          input.click();
                        }
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faUpload}
                        style={{
                          fontSize: "2rem",
                          color: "#9ca3af",
                          marginBottom: "0.75rem",
                        }}
                      />
                      <p style={{ color: "#6b7280", margin: 0 }}>
                        Cliquez pour télécharger votre registre de commerce
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: "0.5rem",
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
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        paddingRight: "2.5rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "0.5rem",
                        outline: "none",
                        transition: "all 0.2s",
                        backgroundColor: loading ? "#f9fafb" : "white",
                        color: "#1f2937",
                        fontSize: "0.875rem",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor =
                          accountType === "vendeur" ? "#0ea5e9" : "#16a34a";
                        e.currentTarget.style.boxShadow = `0 0 0 3px ${accountType === "vendeur" ? "rgba(14, 165, 233, 0.1)" : "rgba(22, 163, 74, 0.1)"}`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#d1d5db";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      style={{
                        position: "absolute",
                        right: "0.75rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "#6b7280",
                        cursor: loading ? "not-allowed" : "pointer",
                        padding: "0.25rem",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={showPassword ? faEyeSlash : faEye}
                      />
                    </button>
                  </div>

                  {formData.mot_de_passe && (
                    <div style={{ marginTop: "0.5rem" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "0.25rem",
                        }}
                      >
                        <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                          Force du mot de passe:
                        </span>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: getPasswordStrengthColor(),
                          }}
                        >
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: "0.25rem" }}>
                        {[1, 2, 3, 4, 5].map((index) => (
                          <div
                            key={index}
                            style={{
                              flex: 1,
                              height: "4px",
                              backgroundColor:
                                index <= passwordStrength
                                  ? getPasswordStrengthColor()
                                  : "#e5e7eb",
                              borderRadius: "2px",
                              transition: "background-color 0.3s",
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
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Confirmer le mot de passe *
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
                        width: "100%",
                        padding: "0.75rem",
                        paddingRight: "2.5rem",
                        border: passwordMismatch
                          ? "1px solid #ef4444"
                          : "1px solid #d1d5db",
                        borderRadius: "0.5rem",
                        outline: "none",
                        transition: "all 0.2s",
                        backgroundColor: loading ? "#f9fafb" : "white",
                        color: "#1f2937",
                        fontSize: "0.875rem",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor =
                          accountType === "vendeur" ? "#0ea5e9" : "#16a34a";
                        e.currentTarget.style.boxShadow = `0 0 0 3px ${accountType === "vendeur" ? "rgba(14, 165, 233, 0.1)" : "rgba(22, 163, 74, 0.1)"}`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = passwordMismatch
                          ? "#ef4444"
                          : "#d1d5db";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={loading}
                      style={{
                        position: "absolute",
                        right: "0.75rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "#6b7280",
                        cursor: loading ? "not-allowed" : "pointer",
                        padding: "0.25rem",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={showConfirmPassword ? faEyeSlash : faEye}
                      />
                    </button>
                  </div>
                  {passwordMismatch && (
                    <p
                      style={{
                        color: "#ef4444",
                        fontSize: "0.75rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      Les mots de passe ne correspondent pas
                    </p>
                  )}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                  padding: "1rem",
                  borderRadius: "0.5rem",
                  backgroundColor: "#f9fafb",
                  marginTop: "0.5rem",
                }}
              >
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  disabled={loading}
                  style={{
                    height: "1.25rem",
                    width: "1.25rem",
                    borderRadius: "0.25rem",
                    border: "2px solid #d1d5db",
                    cursor: loading ? "not-allowed" : "pointer",
                    accentColor:
                      accountType === "vendeur" ? "#0ea5e9" : "#16a34a",
                  }}
                />
                <label
                  htmlFor="terms"
                  style={{
                    fontSize: "0.875rem",
                    color: "#4b5563",
                    lineHeight: "1.5",
                  }}
                >
                  J'accepte les{" "}
                  <a
                    href="#"
                    style={{
                      color: accountType === "vendeur" ? "#0ea5e9" : "#16a34a",
                      fontWeight: 600,
                    }}
                  >
                    conditions d'utilisation
                  </a>{" "}
                  et la{" "}
                  <a
                    href="#"
                    style={{
                      color: accountType === "vendeur" ? "#0ea5e9" : "#16a34a",
                      fontWeight: 600,
                    }}
                  >
                    politique de confidentialité
                  </a>{" "}
                  de OskarStore.
                </label>
              </div>

              <button
                type="submit"
                disabled={
                  loading ||
                  !acceptTerms ||
                  passwordMismatch ||
                  (accountType === "vendeur" && !registreCommerceFile)
                }
                style={{
                  width: "100%",
                  backgroundColor:
                    accountType === "vendeur" ? "#0ea5e9" : "#16a34a",
                  color: "white",
                  fontWeight: "bold",
                  padding: "1rem",
                  borderRadius: "0.5rem",
                  fontSize: "1rem",
                  border: "none",
                  cursor:
                    loading ||
                    !acceptTerms ||
                    passwordMismatch ||
                    (accountType === "vendeur" && !registreCommerceFile)
                      ? "not-allowed"
                      : "pointer",
                  transition: "all 0.3s",
                  opacity:
                    loading ||
                    !acceptTerms ||
                    passwordMismatch ||
                    (accountType === "vendeur" && !registreCommerceFile)
                      ? 0.5
                      : 1,
                  marginTop: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCheckCircle} />
                    {accountType === "vendeur"
                      ? "Créer mon compte vendeur"
                      : "Créer mon compte"}
                  </>
                )}
              </button>

              <div style={{ textAlign: "center", paddingTop: "1rem" }}>
                <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                  Déjà un compte ?{" "}
                  <button
                    type="button"
                    onClick={onSwitchToLogin}
                    style={{
                      color: accountType === "vendeur" ? "#0ea5e9" : "#16a34a",
                      fontWeight: 600,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      fontSize: "0.875rem",
                    }}
                  >
                    Se connecter
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterModal;
