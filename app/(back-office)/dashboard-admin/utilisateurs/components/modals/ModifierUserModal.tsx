// components/modals/EditUserModal.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faUserEdit,
  faSave,
  faEnvelope,
  faPhone,
  faUser,
  faKey,
  faCheckCircle,
  faExclamationTriangle,
  faSpinner,
  faEye,
  faEyeSlash,
  faIdCard,
  faShield,
  faLock,
  faRefresh,
  faInfoCircle,
  faUndo,
  faCalendarAlt,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";

// Types
interface FormData {
  nom: string;
  prenoms: string;
  email: string;
  telephone: string;
  civilite_uuid: string;
  role_uuid: string;
  password?: string;
  confirmPassword?: string;
  est_verifie: boolean;
  est_bloque: boolean;
  is_admin: boolean;
  statut: string;
  statut_matrimonial_uuid?: string;
  date_naissance?: string;
  adresse_uuid?: string;
}

interface Civilite {
  uuid: string;
  libelle: string;
  slug: string;
  statut: string;
}

interface Role {
  uuid: string;
  name: string;
  feature: string;
  status: string;
}

interface StatutMatrimonial {
  uuid: string;
  libelle: string;
  statut: string;
}

interface User extends FormData {
  uuid: string;
  code_utilisateur?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  is_deleted?: boolean;
  civilite?: { libelle: string; uuid: string };
  role?: { name: string; uuid: string };
  statut_matrimonial?: { libelle: string; uuid: string };
}

interface EditUserModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onSuccess?: () => void;
}

// Composant d'alerte personnalisée
interface CustomAlertProps {
  show: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "warning" | "danger" | "info" | "success";
}

function CustomAlert({
  show,
  title,
  message,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  onConfirm,
  onCancel,
  type = "warning",
}: CustomAlertProps) {
  if (!show) return null;

  const alertStyles = {
    warning: {
      bg: `${colors.oskar.orange}15`,
      border: `1px solid ${colors.oskar.orange}30`,
      color: colors.oskar.orange,
      icon: faExclamationCircle,
    },
    danger: {
      bg: `${colors.oskar.red}15`,
      border: `1px solid ${colors.oskar.red}30`,
      color: colors.oskar.red,
      icon: faExclamationTriangle,
    },
    info: {
      bg: `${colors.oskar.blue}15`,
      border: `1px solid ${colors.oskar.blue}30`,
      color: colors.oskar.blue,
      icon: faInfoCircle,
    },
    success: {
      bg: `${colors.oskar.green}15`,
      border: `1px solid ${colors.oskar.green}30`,
      color: colors.oskar.green,
      icon: faCheckCircle,
    },
  };

  const style = alertStyles[type];

  return (
    <div className="custom-alert-overlay">
      <div className="custom-alert-container">
        <div
          className="custom-alert-content border-0 shadow-lg"
          style={{
            background: style.bg,
            border: style.border,
            borderRadius: "16px",
            maxWidth: "500px",
            width: "90%",
          }}
        >
          <div className="custom-alert-header px-4 pt-4 pb-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle p-3"
                style={{
                  backgroundColor: `${style.color}20`,
                  width: "60px",
                  height: "60px",
                }}
              >
                <FontAwesomeIcon
                  icon={style.icon}
                  style={{ color: style.color, fontSize: "24px" }}
                />
              </div>
              <div>
                <h5
                  className="mb-1 fw-bold"
                  style={{ color: colors.oskar.black }}
                >
                  {title}
                </h5>
                <p className="mb-0 text-muted">{message}</p>
              </div>
            </div>
          </div>

          <div className="custom-alert-footer px-4 pb-4 pt-3">
            <div className="d-flex justify-content-end gap-3">
              <button
                type="button"
                className="btn"
                onClick={onCancel}
                style={{
                  background: colors.oskar.lightGrey,
                  color: colors.oskar.grey,
                  border: `1px solid ${colors.oskar.grey}30`,
                  padding: "10px 24px",
                  borderRadius: "8px",
                  fontWeight: "500",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.oskar.grey + "15";
                  e.currentTarget.style.color = colors.oskar.black;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.oskar.lightGrey;
                  e.currentTarget.style.color = colors.oskar.grey;
                }}
              >
                {cancelText}
              </button>
              <button
                type="button"
                className="btn text-white"
                onClick={onConfirm}
                style={{
                  background: style.color,
                  border: `1px solid ${style.color}`,
                  padding: "10px 24px",
                  borderRadius: "8px",
                  fontWeight: "500",
                }}
                onMouseEnter={(e) => {
                  if (type === "warning") {
                    e.currentTarget.style.background = colors.oskar.orangeHover;
                    e.currentTarget.style.borderColor =
                      colors.oskar.orangeHover;
                  } else if (type === "danger") {
                    e.currentTarget.style.background = colors.oskar.redHover;
                    e.currentTarget.style.borderColor = colors.oskar.redHover;
                  } else if (type === "info") {
                    e.currentTarget.style.background = colors.oskar.blueHover;
                    e.currentTarget.style.borderColor = colors.oskar.blueHover;
                  } else if (type === "success") {
                    e.currentTarget.style.background = colors.oskar.greenHover;
                    e.currentTarget.style.borderColor = colors.oskar.greenHover;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = style.color;
                  e.currentTarget.style.borderColor = style.color;
                }}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-alert-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.3s ease;
        }

        .custom-alert-container {
          animation: slideIn 0.3s ease;
        }

        .custom-alert-content {
          animation: scaleIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default function EditUserModal({
  isOpen,
  user,
  onClose,
  onSuccess,
}: EditUserModalProps) {
  // États du formulaire
  const [formData, setFormData] = useState<FormData>({
    nom: "",
    prenoms: "",
    email: "",
    telephone: "",
    civilite_uuid: "",
    role_uuid: "",
    password: "",
    confirmPassword: "",
    est_verifie: false,
    est_bloque: false,
    is_admin: false,
    statut: "actif",
    statut_matrimonial_uuid: "",
    date_naissance: "",
    adresse_uuid: "",
  });

  // États pour les options
  const [civilites, setCivilites] = useState<Civilite[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [statutsMatrimoniaux, setStatutsMatrimoniaux] = useState<
    StatutMatrimonial[]
  >([]);

  // États de chargement et erreurs
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [showUnsavedChangesAlert, setShowUnsavedChangesAlert] = useState(false);
  const [forceUpdateKey, setForceUpdateKey] = useState(0);

  // Styles personnalisés avec les couleurs Oskar
  const styles = {
    modalHeader: {
      background: `linear-gradient(135deg, ${colors.oskar.yellow} 0%, ${colors.oskar.yellow} 100%)`,
      borderBottom: `3px solid ${colors.oskar.blue}`,
    },
    sectionHeader: {
      background: colors.oskar.lightGrey,
      borderLeft: `4px solid ${colors.oskar.yellow}`,
    },
    successBadge: {
      background: `${colors.oskar.green}15`,
      color: colors.oskar.green,
      border: `1px solid ${colors.oskar.green}30`,
    },
    warningBadge: {
      background: `${colors.oskar.yellow}15`,
      color: colors.oskar.yellow,
      border: `1px solid ${colors.oskar.yellow}30`,
    },
    primaryButton: {
      background: colors.oskar.yellow,
      borderColor: colors.oskar.yellow,
    },
    primaryButtonHover: {
      background: colors.oskar.yellowHover,
      borderColor: colors.oskar.yellowHover,
    },
    secondaryButton: {
      background: "white",
      color: colors.oskar.yellow,
      borderColor: colors.oskar.yellow,
    },
    secondaryButtonHover: {
      background: colors.oskar.lightGrey,
      color: colors.oskar.yellowHover,
      borderColor: colors.oskar.yellowHover,
    },
  };

  // Fonction utilitaire pour parser la réponse de l'API
  const parseApiResponse = <T,>(response: any): T[] => {
    // Cas 1: La réponse est directement un tableau
    if (Array.isArray(response)) {
      return response;
    }

    // Cas 2: La réponse a une propriété data qui est un tableau
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }

    // Cas 3: La réponse a une propriété data qui est un objet avec une propriété data
    if (response?.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }

    // Cas 4: La réponse est un objet avec des propriétés mais pas de structure standard
    if (response && typeof response === "object") {
      const keys = Object.keys(response);
      if (keys.length > 0 && Array.isArray(response[keys[0]])) {
        return response[keys[0]];
      }
    }

    return [];
  };

  // Charger les options (civilités, rôles, statuts matrimoniaux)
  const loadOptions = useCallback(async () => {
    try {
      setLoadingOptions(true);
      setError(null);

      // Charger les civilités
      const civilitesResponse = await api.get(API_ENDPOINTS.CIVILITES.LIST);
      const civilitesData = parseApiResponse<Civilite>(civilitesResponse);
      setCivilites(civilitesData);

      // Charger les rôles
      const rolesResponse = await api.get(API_ENDPOINTS.ROLES.LIST);
      const rolesData = parseApiResponse<Role>(rolesResponse);
      const filteredRoles = rolesData.filter((role) => role.status === "actif");
      setRoles(filteredRoles);

      // Charger les statuts matrimoniaux
      const statutsResponse = await api.get(
        API_ENDPOINTS.STATUTS_MATRIMONIAUX.LIST,
      );
      const statutsData = parseApiResponse<StatutMatrimonial>(statutsResponse);
      const filteredStatuts = statutsData.filter(
        (statut) => statut.statut === "actif",
      );
      setStatutsMatrimoniaux(filteredStatuts);
    } catch (err: any) {
      console.error("Erreur lors du chargement des options:", err);
      setError("Impossible de charger les options. Veuillez réessayer.");
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  // Charger les détails complets de l'utilisateur
  const loadUserDetails = useCallback(async () => {
    if (!user?.uuid) return;

    try {
      console.log("🔄 Chargement des détails pour l'utilisateur:", user.uuid);

      const response = await api.get(
        API_ENDPOINTS.ADMIN.USERS.DETAIL(user.uuid),
      );

      console.log("✅ Réponse API détails utilisateur:", response.data);

      if (response.data) {
        const userData = response.data.data || response.data;
        console.log("📋 Données utilisateur reçues:", userData);
        setUserDetails(userData);

        // Préparer les données du formulaire
        const formDataToSet: FormData = {
          nom: userData.nom || "",
          prenoms: userData.prenoms || "",
          email: userData.email || "",
          telephone: userData.telephone || "",
          civilite_uuid: userData.civilite_uuid || "",
          role_uuid: userData.role_uuid || "",
          password: "",
          confirmPassword: "",
          est_verifie: userData.est_verifie || false,
          est_bloque: userData.est_bloque || false,
          is_admin: userData.is_admin || false,
          statut: userData.statut || "actif",
          statut_matrimonial_uuid: userData.statut_matrimonial_uuid || "",
          date_naissance: userData.date_naissance
            ? new Date(userData.date_naissance).toISOString().split("T")[0]
            : "",
          adresse_uuid: userData.adresse_uuid || "",
        };

        console.log("📝 Données du formulaire à définir:", formDataToSet);
        setFormData(formDataToSet);
      }
    } catch (err: any) {
      console.error(
        "❌ Erreur lors du chargement des détails de l'utilisateur:",
        err,
      );
      setError("Impossible de charger les détails de l'utilisateur.");
    }
  }, [user]);

  // Charger les options quand la modal s'ouvre
  useEffect(() => {
    if (!isOpen || !user) return;

    console.log("🚀 Modal ouverte pour l'utilisateur:", user);

    // Réinitialiser les états
    setInitialized(false);
    setUserDetails(null);
    setFormData({
      nom: "",
      prenoms: "",
      email: "",
      telephone: "",
      civilite_uuid: "",
      role_uuid: "",
      password: "",
      confirmPassword: "",
      est_verifie: false,
      est_bloque: false,
      is_admin: false,
      statut: "actif",
      statut_matrimonial_uuid: "",
      date_naissance: "",
      adresse_uuid: "",
    });

    const initializeModal = async () => {
      try {
        setInitialized(true);

        // 1. Charger d'abord les options
        console.log("📥 Chargement des options...");
        await loadOptions();

        // 2. Ensuite charger les détails de l'utilisateur
        console.log("📥 Chargement des détails utilisateur...");
        await loadUserDetails();
      } catch (err) {
        console.error("❌ Erreur lors de l'initialisation de la modal:", err);
        setError("Erreur lors du chargement des données.");
      }
    };

    initializeModal();
  }, [isOpen, user, loadOptions, loadUserDetails]);

  // Mettre à jour le formulaire avec les données de l'utilisateur depuis le tableau
  useEffect(() => {
    if (user && isOpen && !initialized) {
      console.log("🎯 Mise à jour directe avec les données du tableau:", user);

      // Utiliser directement les données du tableau si disponibles
      const directFormData: FormData = {
        nom: user.nom || "",
        prenoms: user.prenoms || "",
        email: user.email || "",
        telephone: user.telephone || "",
        civilite_uuid: user.civilite_uuid || "",
        role_uuid: user.role_uuid || "",
        password: "",
        confirmPassword: "",
        est_verifie: user.est_verifie || false,
        est_bloque: user.est_bloque || false,
        is_admin: user.is_admin || false,
        statut: user.statut || "actif",
        statut_matrimonial_uuid: user.statut_matrimonial_uuid || "",
        date_naissance: user.date_naissance
          ? new Date(user.date_naissance).toISOString().split("T")[0]
          : "",
        adresse_uuid: user.adresse_uuid || "",
      };

      console.log("📝 Données directes du formulaire:", directFormData);
      setFormData(directFormData);
      setForceUpdateKey((prev) => prev + 1);
    }
  }, [user, isOpen, initialized]);

  // Mettre à jour le formulaire quand les détails de l'utilisateur changent
  useEffect(() => {
    if (userDetails && civilites.length > 0) {
      console.log(
        "🔄 Mise à jour du formulaire avec les détails chargés:",
        userDetails,
      );

      // Mettre à jour seulement si les données sont différentes
      setFormData((prev) => {
        const updatedData = {
          nom: userDetails.nom || "",
          prenoms: userDetails.prenoms || "",
          email: userDetails.email || "",
          telephone: userDetails.telephone || "",
          civilite_uuid: userDetails.civilite_uuid || "",
          role_uuid: userDetails.role_uuid || "",
          password: "",
          confirmPassword: "",
          est_verifie: userDetails.est_verifie || false,
          est_bloque: userDetails.est_bloque || false,
          is_admin: userDetails.is_admin || false,
          statut: userDetails.statut || "actif",
          statut_matrimonial_uuid: userDetails.statut_matrimonial_uuid || "",
          date_naissance: userDetails.date_naissance
            ? new Date(userDetails.date_naissance).toISOString().split("T")[0]
            : "",
          adresse_uuid: userDetails.adresse_uuid || "",
        };

        // Vérifier si les données ont changé
        if (JSON.stringify(prev) !== JSON.stringify(updatedData)) {
          return updatedData;
        }
        return prev;
      });
    }
  }, [userDetails, civilites]);

  // Réinitialiser quand la modal se ferme
  useEffect(() => {
    if (!isOpen) {
      console.log("🔒 Modal fermée, réinitialisation des états");
      setFormData({
        nom: "",
        prenoms: "",
        email: "",
        telephone: "",
        civilite_uuid: "",
        role_uuid: "",
        password: "",
        confirmPassword: "",
        est_verifie: false,
        est_bloque: false,
        is_admin: false,
        statut: "actif",
        statut_matrimonial_uuid: "",
        date_naissance: "",
        adresse_uuid: "",
      });
      setUserDetails(null);
      setError(null);
      setSuccessMessage(null);
      setValidationErrors({});
      setChangePassword(false);
      setInitialized(false);
      setShowUnsavedChangesAlert(false);
      setForceUpdateKey(0);
    }
  }, [isOpen]);

  // Validation du formulaire
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validation des champs obligatoires
    if (!formData.nom.trim()) {
      errors.nom = "Le nom est obligatoire";
    }

    if (!formData.prenoms.trim()) {
      errors.prenoms = "Les prénoms sont obligatoires";
    }

    if (!formData.email.trim()) {
      errors.email = "L'email est obligatoire";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "L'email n'est pas valide";
    }

    if (!formData.telephone.trim()) {
      errors.telephone = "Le téléphone est obligatoire";
    }

    if (!formData.civilite_uuid) {
      errors.civilite_uuid = "La civilité est obligatoire";
    }

    if (!formData.role_uuid) {
      errors.role_uuid = "Le rôle est obligatoire";
    }

    // Validation du mot de passe seulement si on le change
    if (changePassword) {
      if (!formData.password) {
        errors.password = "Le mot de passe est obligatoire";
      } else if (formData.password.length < 6) {
        errors.password = "Le mot de passe doit contenir au moins 6 caractères";
      }

      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Les mots de passe ne correspondent pas";
      }
    }

    // Validation de la date de naissance si fournie
    if (formData.date_naissance) {
      const birthDate = new Date(formData.date_naissance);
      const today = new Date();

      if (birthDate > today) {
        errors.date_naissance =
          "La date de naissance ne peut pas être dans le futur";
      }

      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13) {
        errors.date_naissance = "L'utilisateur doit avoir au moins 13 ans";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Gestion des changements de formulaire
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));

    // Effacer l'erreur de validation pour ce champ
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    // Vérifier si l'utilisateur est supprimé
    if (userDetails?.is_deleted) {
      setError(
        "Cet utilisateur a été supprimé. Vous devez d'abord le restaurer avant de pouvoir le modifier.",
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      // Préparer les données pour l'API
      const userData: any = {
        nom: formData.nom.trim(),
        prenoms: formData.prenoms.trim(),
        email: formData.email.trim().toLowerCase(),
        telephone: formData.telephone.trim(),
        civilite_uuid: formData.civilite_uuid,
        role_uuid: formData.role_uuid,
        est_verifie: formData.est_verifie,
        est_bloque: formData.est_bloque,
        is_admin: formData.is_admin,
        statut: formData.statut,
      };

      // Ajouter les champs optionnels s'ils sont définis
      if (formData.statut_matrimonial_uuid) {
        userData.statut_matrimonial_uuid = formData.statut_matrimonial_uuid;
      }

      if (formData.date_naissance) {
        userData.date_naissance = formData.date_naissance;
      }

      if (formData.adresse_uuid) {
        userData.adresse_uuid = formData.adresse_uuid;
      }

      // Ajouter le mot de passe seulement si on le change
      if (changePassword && formData.password) {
        userData.mot_de_passe = formData.password;
      }

      console.log("📤 Envoi des données pour modification:", {
        ...userData,
        mot_de_passe: userData.mot_de_passe ? "***" : undefined,
      });

      // Utiliser l'endpoint correct
      const endpoint = API_ENDPOINTS.ADMIN.USERS.UPDATE(user?.uuid || "");
      console.log("🌐 Endpoint:", endpoint);

      // Utiliser PATCH
      const response = await api.patch(endpoint, userData);

      console.log("✅ Utilisateur modifié:", response.data);

      setSuccessMessage("Utilisateur modifié avec succès !");

      // Appeler le callback de succès
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err: any) {
      console.error("❌ Erreur lors de la modification:", err);

      let errorMessage = "Erreur lors de la modification de l'utilisateur";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Gestion spécifique des erreurs
      if (err.response?.status === 400) {
        if (err.response.data?.errors) {
          const fieldErrors = err.response.data.errors;
          setValidationErrors(fieldErrors);
          errorMessage = "Veuillez corriger les erreurs dans le formulaire";
        } else {
          errorMessage =
            "Données invalides. Vérifiez les informations saisies.";
        }
      } else if (err.response?.status === 404) {
        errorMessage =
          "Utilisateur non trouvé. L'utilisateur a peut-être été supprimé.";
      } else if (err.response?.status === 409) {
        errorMessage =
          "Un utilisateur avec cet email ou téléphone existe déjà.";
      } else if (err.response?.status === 422) {
        errorMessage =
          "Validation des données échouée. Vérifiez les informations.";
      } else if (err.response?.status === 500) {
        errorMessage = "Erreur serveur. Veuillez réessayer plus tard.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Restaurer un utilisateur supprimé
  const handleRestore = async () => {
    if (!user?.uuid) return;

    try {
      setLoading(true);
      setError(null);

      const response = await api.post(
        API_ENDPOINTS.ADMIN.USERS.RESTORE(user.uuid),
      );

      console.log("✅ Utilisateur restauré:", response.data);

      setSuccessMessage("Utilisateur restauré avec succès !");

      // Recharger les détails
      await loadUserDetails();

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err: any) {
      console.error("❌ Erreur lors de la restauration:", err);
      setError("Erreur lors de la restauration de l'utilisateur");
    } finally {
      setLoading(false);
    }
  };

  // Réinitialiser le formulaire
  const handleReset = () => {
    if (userDetails) {
      setFormData({
        nom: userDetails.nom || "",
        prenoms: userDetails.prenoms || "",
        email: userDetails.email || "",
        telephone: userDetails.telephone || "",
        civilite_uuid: userDetails.civilite_uuid || "",
        role_uuid: userDetails.role_uuid || "",
        password: "",
        confirmPassword: "",
        est_verifie: userDetails.est_verifie || false,
        est_bloque: userDetails.est_bloque || false,
        is_admin: userDetails.is_admin || false,
        statut: userDetails.statut || "actif",
        statut_matrimonial_uuid: userDetails.statut_matrimonial_uuid || "",
        date_naissance: userDetails.date_naissance
          ? new Date(userDetails.date_naissance).toISOString().split("T")[0]
          : "",
        adresse_uuid: userDetails.adresse_uuid || "",
      });
    }
    setChangePassword(false);
    setError(null);
    setSuccessMessage(null);
    setValidationErrors({});
  };

  // Fermer la modal
  const handleClose = () => {
    if (loading) return;

    const hasChanges =
      formData.nom !== (userDetails?.nom || user?.nom) ||
      formData.prenoms !== (userDetails?.prenoms || user?.prenoms) ||
      formData.email !== (userDetails?.email || user?.email) ||
      formData.telephone !== (userDetails?.telephone || user?.telephone) ||
      formData.civilite_uuid !==
        (userDetails?.civilite_uuid || user?.civilite_uuid) ||
      formData.role_uuid !== (userDetails?.role_uuid || user?.role_uuid) ||
      formData.est_verifie !==
        (userDetails?.est_verifie || user?.est_verifie) ||
      formData.est_bloque !== (userDetails?.est_bloque || user?.est_bloque) ||
      formData.is_admin !== (userDetails?.is_admin || user?.is_admin) ||
      formData.statut !== (userDetails?.statut || user?.statut) ||
      formData.statut_matrimonial_uuid !==
        (userDetails?.statut_matrimonial_uuid ||
          user?.statut_matrimonial_uuid) ||
      formData.date_naissance !==
        (userDetails?.date_naissance
          ? new Date(userDetails.date_naissance).toISOString().split("T")[0]
          : user?.date_naissance
            ? new Date(user.date_naissance).toISOString().split("T")[0]
            : "") ||
      changePassword;

    if (hasChanges) {
      setShowUnsavedChangesAlert(true);
      return;
    }

    onClose();
  };

  // Confirmer la fermeture avec modifications non sauvegardées
  const confirmCloseWithUnsavedChanges = () => {
    setShowUnsavedChangesAlert(false);
    onClose();
  };

  // Annuler la fermeture
  const cancelCloseWithUnsavedChanges = () => {
    setShowUnsavedChangesAlert(false);
  };

  // Raccourci pour générer un mot de passe
  const generatePassword = () => {
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    setFormData((prev) => ({
      ...prev,
      password,
      confirmPassword: password,
    }));
  };

  // Calculer la force du mot de passe
  const getPasswordStrength = () => {
    if (!formData.password)
      return { score: 0, label: "Aucun", color: colors.oskar.grey };

    let score = 0;

    // Longueur
    if (formData.password.length >= 8) score += 1;
    if (formData.password.length >= 12) score += 1;

    // Complexité
    if (/[a-z]/.test(formData.password)) score += 1;
    if (/[A-Z]/.test(formData.password)) score += 1;
    if (/[0-9]/.test(formData.password)) score += 1;
    if (/[^A-Za-z0-9]/.test(formData.password)) score += 1;

    const strengths = [
      { label: "Très faible", color: "#ef4444" },
      { label: "Faible", color: "#f97316" },
      { label: "Moyen", color: "#eab308" },
      { label: "Bon", color: "#84cc16" },
      { label: "Fort", color: "#22c55e" },
      { label: "Très fort", color: colors.oskar.green },
    ];

    return strengths[Math.min(score, strengths.length - 1)];
  };

  // Si la modal n'est pas ouverte ou pas d'utilisateur, ne rien afficher
  if (!isOpen || !user) return null;

  const passwordStrength = getPasswordStrength();
  const isUserDeleted = userDetails?.is_deleted;
  const userCreatedDate = userDetails?.created_at
    ? new Date(userDetails.created_at)
    : null;
  const userUpdatedDate = userDetails?.updated_at
    ? new Date(userDetails.updated_at)
    : null;

  // Fonction utilitaire pour vérifier si userCreatedDate est valide avant comparaison
  const hasUserUpdates = () => {
    if (!userCreatedDate || !userUpdatedDate) return false;
    return userUpdatedDate > userCreatedDate;
  };

  return (
    <>
      <CustomAlert
        show={showUnsavedChangesAlert}
        title="Modifications non sauvegardées"
        message="Vous avez des modifications non sauvegardées. Voulez-vous vraiment annuler ?"
        confirmText="Oui, annuler"
        cancelText="Non, rester"
        onConfirm={confirmCloseWithUnsavedChanges}
        onCancel={cancelCloseWithUnsavedChanges}
        type="warning"
      />

      <div
        className="modal fade show d-block"
        tabIndex={-1}
        style={{
          backgroundColor: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(2px)",
        }}
        role="dialog"
        aria-labelledby="editUserModalLabel"
        aria-modal="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
          <div className="modal-content border-0 shadow-lg">
            {/* En-tête de la modal */}
            <div
              className="modal-header text-white border-0 rounded-top-3"
              style={styles.modalHeader}
            >
              <div className="d-flex align-items-center">
                <div className="bg-white bg-opacity-20 rounded-circle p-2 me-3">
                  <FontAwesomeIcon icon={faUserEdit} className="fs-5" />
                </div>
                <div>
                  <h5
                    className="modal-title mb-0 fw-bold"
                    id="editUserModalLabel"
                  >
                    Modifier l'Utilisateur
                  </h5>
                  <p className="mb-0 opacity-75 fs-14">
                    {user.nom} {user.prenoms} • {user.code_utilisateur || "N/A"}
                    {isUserDeleted && " • ❌ Supprimé"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={handleClose}
                disabled={loading}
                aria-label="Fermer"
                style={{ filter: "brightness(0) invert(1)" }}
              ></button>
            </div>

            {/* Corps de la modal */}
            <div className="modal-body py-4">
              {/* Informations sur l'utilisateur */}
              <div className="row mb-4">
                <div className="col-12">
                  <div
                    className={`alert ${isUserDeleted ? "alert-warning" : "alert-info"} border-0 shadow-sm`}
                    style={{ borderRadius: "10px" }}
                  >
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <div
                          className="rounded-circle p-2"
                          style={{
                            backgroundColor: isUserDeleted
                              ? `${colors.oskar.orange}20`
                              : `${colors.oskar.blue}20`,
                          }}
                        >
                          <FontAwesomeIcon
                            icon={
                              isUserDeleted
                                ? faExclamationTriangle
                                : faInfoCircle
                            }
                            style={{
                              color: isUserDeleted
                                ? colors.oskar.orange
                                : colors.oskar.blue,
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <p className="mb-0">
                          {isUserDeleted ? (
                            <>
                              <strong>⚠️ Utilisateur supprimé</strong>
                              <br />
                              Cet utilisateur a été supprimé le{" "}
                              {userDetails?.deleted_at
                                ? new Date(
                                    userDetails.deleted_at,
                                  ).toLocaleDateString("fr-FR")
                                : "N/A"}
                              . Vous devez d'abord le restaurer avant de pouvoir
                              le modifier.
                            </>
                          ) : (
                            <>
                              Modifiez les informations de{" "}
                              <strong>
                                {user.nom} {user.prenoms}
                              </strong>
                              . Créé le{" "}
                              {userCreatedDate
                                ? userCreatedDate.toLocaleDateString("fr-FR")
                                : "N/A"}
                              {userCreatedDate &&
                                userUpdatedDate &&
                                userUpdatedDate > userCreatedDate &&
                                ` • Dernière modification le ${userUpdatedDate.toLocaleDateString("fr-FR")}`}
                              .
                            </>
                          )}
                        </p>
                        {isUserDeleted && (
                          <button
                            type="button"
                            className="btn btn-warning btn-sm mt-2 d-flex align-items-center gap-2"
                            onClick={handleRestore}
                            disabled={loading}
                          >
                            <FontAwesomeIcon icon={faUndo} />
                            Restaurer l'utilisateur
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages d'alerte */}
              {error && (
                <div
                  className="alert alert-danger alert-dismissible fade show mb-4 border-0 shadow-sm"
                  role="alert"
                  style={{ borderRadius: "10px" }}
                >
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div
                        className="rounded-circle p-2"
                        style={{ backgroundColor: `${colors.oskar.orange}20` }}
                      >
                        <FontAwesomeIcon
                          icon={faExclamationTriangle}
                          className="text-danger"
                        />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="alert-heading mb-1">Erreur</h6>
                      <p className="mb-0">{error}</p>
                    </div>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setError(null)}
                      aria-label="Fermer l'alerte"
                    ></button>
                  </div>
                </div>
              )}

              {successMessage && (
                <div
                  className="alert alert-success alert-dismissible fade show mb-4 border-0 shadow-sm"
                  role="alert"
                  style={{ borderRadius: "10px" }}
                >
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div
                        className="rounded-circle p-2"
                        style={{ backgroundColor: `${colors.oskar.green}20` }}
                      >
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="text-success"
                        />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="alert-heading mb-1">Succès</h6>
                      <p className="mb-0">{successMessage}</p>
                    </div>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setSuccessMessage(null)}
                      aria-label="Fermer l'alerte"
                    ></button>
                  </div>
                </div>
              )}

              {loadingOptions ? (
                <div className="text-center py-5">
                  <div
                    className="spinner-border"
                    style={{ color: colors.oskar.orange }}
                    role="status"
                  >
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                  <p className="mt-3 text-muted">Chargement des options...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} key={forceUpdateKey}>
                  {/* Section 1: Informations personnelles */}
                  <div
                    className="card border-0 shadow-sm mb-4"
                    style={{ borderRadius: "12px" }}
                  >
                    <div
                      className="card-header border-0 py-3"
                      style={styles.sectionHeader}
                    >
                      <div className="d-flex align-items-center">
                        <div
                          className="rounded-circle p-2 me-3"
                          style={{
                            backgroundColor: `${colors.oskar.orange}15`,
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faIdCard}
                            style={{ color: colors.oskar.orange }}
                          />
                        </div>
                        <div>
                          <h6
                            className="mb-0 fw-bold"
                            style={{ color: colors.oskar.orange }}
                          >
                            Informations Personnelles
                          </h6>
                          <small className="text-muted">
                            Les champs marqués d'un * sont obligatoires
                          </small>
                        </div>
                      </div>
                    </div>
                    <div className="card-body p-4">
                      <div className="row g-3">
                        {/* Civilité */}
                        <div className="col-md-4">
                          <label
                            htmlFor="civilite_uuid"
                            className="form-label fw-semibold"
                          >
                            Civilité <span className="text-danger">*</span>
                          </label>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-end-0">
                              <FontAwesomeIcon
                                icon={faUser}
                                className="text-muted"
                              />
                            </span>
                            <select
                              id="civilite_uuid"
                              name="civilite_uuid"
                              className={`form-select border-start-0 ps-0 ${validationErrors.civilite_uuid ? "is-invalid" : ""}`}
                              value={formData.civilite_uuid}
                              onChange={handleChange}
                              disabled={loading || isUserDeleted}
                              style={{ borderRadius: "0 8px 8px 0" }}
                            >
                              <option value="">Sélectionner...</option>
                              {civilites.map((civilite) => (
                                <option
                                  key={civilite.uuid}
                                  value={civilite.uuid}
                                >
                                  {civilite.libelle}
                                </option>
                              ))}
                            </select>
                          </div>
                          {validationErrors.civilite_uuid && (
                            <div className="invalid-feedback d-block">
                              {validationErrors.civilite_uuid}
                            </div>
                          )}
                        </div>

                        {/* Nom */}
                        <div className="col-md-4">
                          <label
                            htmlFor="nom"
                            className="form-label fw-semibold"
                          >
                            Nom <span className="text-danger">*</span>
                          </label>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-end-0">
                              <FontAwesomeIcon
                                icon={faUser}
                                className="text-muted"
                              />
                            </span>
                            <input
                              type="text"
                              id="nom"
                              name="nom"
                              className={`form-control border-start-0 ps-0 ${validationErrors.nom ? "is-invalid" : ""}`}
                              placeholder="Entrez le nom"
                              value={formData.nom}
                              onChange={handleChange}
                              disabled={loading || isUserDeleted}
                            />
                          </div>
                          {validationErrors.nom && (
                            <div className="invalid-feedback d-block">
                              {validationErrors.nom}
                            </div>
                          )}
                        </div>

                        {/* Prénoms */}
                        <div className="col-md-4">
                          <label
                            htmlFor="prenoms"
                            className="form-label fw-semibold"
                          >
                            Prénoms <span className="text-danger">*</span>
                          </label>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-end-0">
                              <FontAwesomeIcon
                                icon={faUser}
                                className="text-muted"
                              />
                            </span>
                            <input
                              type="text"
                              id="prenoms"
                              name="prenoms"
                              className={`form-control border-start-0 ps-0 ${validationErrors.prenoms ? "is-invalid" : ""}`}
                              placeholder="Entrez les prénoms"
                              value={formData.prenoms}
                              onChange={handleChange}
                              disabled={loading || isUserDeleted}
                            />
                          </div>
                          {validationErrors.prenoms && (
                            <div className="invalid-feedback d-block">
                              {validationErrors.prenoms}
                            </div>
                          )}
                        </div>

                        {/* Statut matrimonial */}
                        <div className="col-md-6">
                          <label
                            htmlFor="statut_matrimonial_uuid"
                            className="form-label fw-semibold"
                          >
                            Statut matrimonial
                          </label>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-end-0">
                              <FontAwesomeIcon
                                icon={faUser}
                                className="text-muted"
                              />
                            </span>
                            <select
                              id="statut_matrimonial_uuid"
                              name="statut_matrimonial_uuid"
                              className={`form-select border-start-0 ps-0 ${validationErrors.statut_matrimonial_uuid ? "is-invalid" : ""}`}
                              value={formData.statut_matrimonial_uuid}
                              onChange={handleChange}
                              disabled={loading || isUserDeleted}
                              style={{ borderRadius: "0 8px 8px 0" }}
                            >
                              <option value="">Sélectionner...</option>
                              {statutsMatrimoniaux.map((statut) => (
                                <option key={statut.uuid} value={statut.uuid}>
                                  {statut.libelle}
                                </option>
                              ))}
                            </select>
                          </div>
                          {validationErrors.statut_matrimonial_uuid && (
                            <div className="invalid-feedback d-block">
                              {validationErrors.statut_matrimonial_uuid}
                            </div>
                          )}
                        </div>

                        {/* Date de naissance */}
                        <div className="col-md-6">
                          <label
                            htmlFor="date_naissance"
                            className="form-label fw-semibold"
                          >
                            <FontAwesomeIcon
                              icon={faCalendarAlt}
                              className="me-2"
                            />
                            Date de naissance
                          </label>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-end-0">
                              <FontAwesomeIcon
                                icon={faCalendarAlt}
                                className="text-muted"
                              />
                            </span>
                            <input
                              type="date"
                              id="date_naissance"
                              name="date_naissance"
                              className={`form-control border-start-0 ps-0 ${validationErrors.date_naissance ? "is-invalid" : ""}`}
                              value={formData.date_naissance}
                              onChange={handleChange}
                              disabled={loading || isUserDeleted}
                              max={new Date().toISOString().split("T")[0]}
                            />
                          </div>
                          {validationErrors.date_naissance && (
                            <div className="invalid-feedback d-block">
                              {validationErrors.date_naissance}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Informations de contact */}
                  <div
                    className="card border-0 shadow-sm mb-4"
                    style={{ borderRadius: "12px" }}
                  >
                    <div
                      className="card-header border-0 py-3"
                      style={{
                        ...styles.sectionHeader,
                        borderLeft: `4px solid ${colors.oskar.green}`,
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <div
                          className="rounded-circle p-2 me-3"
                          style={{ backgroundColor: `${colors.oskar.green}15` }}
                        >
                          <FontAwesomeIcon
                            icon={faEnvelope}
                            style={{ color: colors.oskar.green }}
                          />
                        </div>
                        <div>
                          <h6
                            className="mb-0 fw-bold"
                            style={{ color: colors.oskar.green }}
                          >
                            Informations de Contact
                          </h6>
                          <small className="text-muted">
                            Email et téléphone de l'utilisateur
                          </small>
                        </div>
                      </div>
                    </div>
                    <div className="card-body p-4">
                      <div className="row g-3">
                        {/* Email */}
                        <div className="col-md-6">
                          <label
                            htmlFor="email"
                            className="form-label fw-semibold"
                          >
                            <FontAwesomeIcon
                              icon={faEnvelope}
                              className="me-2"
                            />
                            Email <span className="text-danger">*</span>
                          </label>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-end-0">
                              <FontAwesomeIcon
                                icon={faEnvelope}
                                className="text-muted"
                              />
                            </span>
                            <input
                              type="email"
                              id="email"
                              name="email"
                              className={`form-control border-start-0 ps-0 ${validationErrors.email ? "is-invalid" : ""}`}
                              placeholder="exemple@domaine.com"
                              value={formData.email}
                              onChange={handleChange}
                              disabled={loading || isUserDeleted}
                            />
                          </div>
                          {validationErrors.email && (
                            <div className="invalid-feedback d-block">
                              {validationErrors.email}
                            </div>
                          )}
                        </div>

                        {/* Téléphone */}
                        <div className="col-md-6">
                          <label
                            htmlFor="telephone"
                            className="form-label fw-semibold"
                          >
                            <FontAwesomeIcon icon={faPhone} className="me-2" />
                            Téléphone <span className="text-danger">*</span>
                          </label>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-end-0">
                              <FontAwesomeIcon
                                icon={faPhone}
                                className="text-muted"
                              />
                            </span>
                            <input
                              type="tel"
                              id="telephone"
                              name="telephone"
                              className={`form-control border-start-0 ps-0 ${validationErrors.telephone ? "is-invalid" : ""}`}
                              placeholder="+225 XX XX XX XX"
                              value={formData.telephone}
                              onChange={handleChange}
                              disabled={loading || isUserDeleted}
                            />
                          </div>
                          {validationErrors.telephone && (
                            <div className="invalid-feedback d-block">
                              {validationErrors.telephone}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Rôle et statut */}
                  <div
                    className="card border-0 shadow-sm mb-4"
                    style={{ borderRadius: "12px" }}
                  >
                    <div
                      className="card-header border-0 py-3"
                      style={{
                        ...styles.sectionHeader,
                        borderLeft: `4px solid ${colors.oskar.blue}`,
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <div
                          className="rounded-circle p-2 me-3"
                          style={{ backgroundColor: `${colors.oskar.blue}15` }}
                        >
                          <FontAwesomeIcon
                            icon={faShield}
                            style={{ color: colors.oskar.blue }}
                          />
                        </div>
                        <div>
                          <h6
                            className="mb-0 fw-bold"
                            style={{ color: colors.oskar.blue }}
                          >
                            Rôle et Statut
                          </h6>
                          <small className="text-muted">
                            Définir les permissions et le statut du compte
                          </small>
                        </div>
                      </div>
                    </div>
                    <div className="card-body p-4">
                      <div className="row g-4">
                        {/* Rôle */}
                        <div className="col-md-6">
                          <label
                            htmlFor="role_uuid"
                            className="form-label fw-semibold"
                          >
                            Rôle <span className="text-danger">*</span>
                          </label>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-end-0">
                              <FontAwesomeIcon
                                icon={faShield}
                                className="text-muted"
                              />
                            </span>
                            <select
                              id="role_uuid"
                              name="role_uuid"
                              className={`form-select border-start-0 ps-0 ${validationErrors.role_uuid ? "is-invalid" : ""}`}
                              value={formData.role_uuid}
                              onChange={handleChange}
                              disabled={loading || isUserDeleted}
                              style={{ borderRadius: "0 8px 8px 0" }}
                            >
                              <option value="">Sélectionner un rôle...</option>
                              {roles.map((role) => (
                                <option key={role.uuid} value={role.uuid}>
                                  {role.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          {validationErrors.role_uuid && (
                            <div className="invalid-feedback d-block">
                              {validationErrors.role_uuid}
                            </div>
                          )}
                        </div>

                        {/* Statut du compte */}
                        <div className="col-md-6">
                          <label
                            htmlFor="statut"
                            className="form-label fw-semibold"
                          >
                            Statut du compte{" "}
                            <span className="text-danger">*</span>
                          </label>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-end-0">
                              <FontAwesomeIcon
                                icon={faUser}
                                className="text-muted"
                              />
                            </span>
                            <select
                              id="statut"
                              name="statut"
                              className={`form-select border-start-0 ps-0 ${validationErrors.statut ? "is-invalid" : ""}`}
                              value={formData.statut}
                              onChange={handleChange}
                              disabled={loading || isUserDeleted}
                              style={{ borderRadius: "0 8px 8px 0" }}
                            >
                              <option value="actif">Actif</option>
                              <option value="inactif">Inactif</option>
                              <option value="suspendu">Suspendu</option>
                            </select>
                          </div>
                          {validationErrors.statut && (
                            <div className="invalid-feedback d-block">
                              {validationErrors.statut}
                            </div>
                          )}
                        </div>

                        {/* Options de statut */}
                        <div className="col-12">
                          <div className="d-flex flex-column gap-3 mt-3">
                            <div
                              className="d-flex align-items-center justify-content-between p-3 rounded"
                              style={{
                                backgroundColor: `${colors.oskar.lightGrey}50`,
                              }}
                            >
                              <div className="d-flex align-items-center">
                                <div
                                  className="rounded-circle p-2 me-3"
                                  style={{
                                    backgroundColor: `${colors.oskar.blue}15`,
                                  }}
                                >
                                  <FontAwesomeIcon
                                    icon={faUser}
                                    style={{ color: colors.oskar.blue }}
                                  />
                                </div>
                                <div>
                                  <label
                                    htmlFor="is_admin"
                                    className="form-check-label fw-semibold"
                                  >
                                    Administrateur
                                  </label>
                                  <p className="mb-0 text-muted fs-12">
                                    Accès complet au système
                                  </p>
                                </div>
                              </div>
                              <div className="form-check form-switch">
                                <input
                                  type="checkbox"
                                  id="is_admin"
                                  name="is_admin"
                                  className="form-check-input"
                                  style={{ width: "3em", height: "1.5em" }}
                                  checked={formData.is_admin}
                                  onChange={handleChange}
                                  disabled={loading || isUserDeleted}
                                />
                              </div>
                            </div>

                            <div
                              className="d-flex align-items-center justify-content-between p-3 rounded"
                              style={{
                                backgroundColor: `${colors.oskar.lightGrey}50`,
                              }}
                            >
                              <div className="d-flex align-items-center">
                                <div
                                  className="rounded-circle p-2 me-3"
                                  style={{
                                    backgroundColor: `${colors.oskar.green}15`,
                                  }}
                                >
                                  <FontAwesomeIcon
                                    icon={faCheckCircle}
                                    style={{ color: colors.oskar.green }}
                                  />
                                </div>
                                <div>
                                  <label
                                    htmlFor="est_verifie"
                                    className="form-check-label fw-semibold"
                                  >
                                    Email vérifié
                                  </label>
                                  <p className="mb-0 text-muted fs-12">
                                    L'email a été vérifié
                                  </p>
                                </div>
                              </div>
                              <div className="form-check form-switch">
                                <input
                                  type="checkbox"
                                  id="est_verifie"
                                  name="est_verifie"
                                  className="form-check-input"
                                  style={{ width: "3em", height: "1.5em" }}
                                  checked={formData.est_verifie}
                                  onChange={handleChange}
                                  disabled={loading || isUserDeleted}
                                />
                              </div>
                            </div>

                            <div
                              className="d-flex align-items-center justify-content-between p-3 rounded"
                              style={{
                                backgroundColor: `${colors.oskar.lightGrey}50`,
                              }}
                            >
                              <div className="d-flex align-items-center">
                                <div
                                  className="rounded-circle p-2 me-3"
                                  style={{
                                    backgroundColor: `${colors.oskar.orange}15`,
                                  }}
                                >
                                  <FontAwesomeIcon
                                    icon={faExclamationTriangle}
                                    style={{ color: colors.oskar.orange }}
                                  />
                                </div>
                                <div>
                                  <label
                                    htmlFor="est_bloque"
                                    className="form-check-label fw-semibold"
                                  >
                                    Compte bloqué
                                  </label>
                                  <p className="mb-0 text-muted fs-12">
                                    L'utilisateur ne peut pas se connecter
                                  </p>
                                </div>
                              </div>
                              <div className="form-check form-switch">
                                <input
                                  type="checkbox"
                                  id="est_bloque"
                                  name="est_bloque"
                                  className="form-check-input"
                                  style={{ width: "3em", height: "1.5em" }}
                                  checked={formData.est_bloque}
                                  onChange={handleChange}
                                  disabled={loading || isUserDeleted}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Sécurité (Mot de passe) */}
                  <div
                    className="card border-0 shadow-sm mb-4"
                    style={{ borderRadius: "12px" }}
                  >
                    <div
                      className="card-header border-0 py-3"
                      style={{
                        ...styles.sectionHeader,
                        borderLeft: `4px solid ${colors.oskar.black}`,
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <div
                          className="rounded-circle p-2 me-3"
                          style={{ backgroundColor: `${colors.oskar.black}15` }}
                        >
                          <FontAwesomeIcon
                            icon={faLock}
                            style={{ color: colors.oskar.black }}
                          />
                        </div>
                        <div>
                          <h6
                            className="mb-0 fw-bold"
                            style={{ color: colors.oskar.black }}
                          >
                            Sécurité
                          </h6>
                          <small className="text-muted">
                            Changer le mot de passe de connexion
                          </small>
                        </div>
                      </div>
                    </div>
                    <div className="card-body p-4">
                      <div className="mb-4">
                        <div className="form-check form-switch">
                          <input
                            type="checkbox"
                            id="changePassword"
                            name="changePassword"
                            className="form-check-input"
                            style={{ width: "3em", height: "1.5em" }}
                            checked={changePassword}
                            onChange={(e) => {
                              setChangePassword(e.target.checked);
                              if (!e.target.checked) {
                                setFormData((prev) => ({
                                  ...prev,
                                  password: "",
                                  confirmPassword: "",
                                }));
                              }
                            }}
                            disabled={loading || isUserDeleted}
                          />
                          <label
                            htmlFor="changePassword"
                            className="form-check-label fw-semibold fs-14"
                          >
                            Changer le mot de passe de l'utilisateur
                          </label>
                          <p className="text-muted fs-12 mt-1">
                            Si vous ne souhaitez pas changer le mot de passe,
                            laissez cette option désactivée.
                          </p>
                        </div>
                      </div>

                      {changePassword && (
                        <div className="row g-4">
                          {/* Mot de passe */}
                          <div className="col-md-6">
                            <label
                              htmlFor="password"
                              className="form-label fw-semibold"
                            >
                              <FontAwesomeIcon icon={faKey} className="me-2" />
                              Nouveau mot de passe{" "}
                              <span className="text-danger">*</span>
                            </label>
                            <div className="input-group">
                              <span className="input-group-text bg-light border-end-0">
                                <FontAwesomeIcon
                                  icon={faLock}
                                  className="text-muted"
                                />
                              </span>
                              <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                className={`form-control border-start-0 ps-0 ${validationErrors.password ? "is-invalid" : ""}`}
                                placeholder="Minimum 6 caractères"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={loading || isUserDeleted}
                              />
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading || isUserDeleted}
                                aria-label={
                                  showPassword
                                    ? "Cacher le mot de passe"
                                    : "Afficher le mot de passe"
                                }
                              >
                                <FontAwesomeIcon
                                  icon={showPassword ? faEyeSlash : faEye}
                                />
                              </button>
                            </div>

                            {/* Force du mot de passe */}
                            {formData.password && (
                              <div className="mt-3">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <small className="fw-semibold">
                                    Force du mot de passe:
                                  </small>
                                  <small
                                    style={{ color: passwordStrength.color }}
                                  >
                                    {passwordStrength.label}
                                  </small>
                                </div>
                                <div
                                  className="progress"
                                  style={{ height: "6px" }}
                                >
                                  <div
                                    className="progress-bar"
                                    role="progressbar"
                                  ></div>
                                </div>
                              </div>
                            )}

                            {validationErrors.password && (
                              <div className="invalid-feedback d-block">
                                {validationErrors.password}
                              </div>
                            )}

                            <div className="mt-3">
                              <button
                                type="button"
                                className="btn btn-sm d-flex align-items-center gap-2"
                                onClick={generatePassword}
                                disabled={loading || isUserDeleted}
                                style={{
                                  background: `${colors.oskar.orange}10`,
                                  color: colors.oskar.orange,
                                  border: `1px solid ${colors.oskar.orange}30`,
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = `${colors.oskar.orange}20`;
                                  e.currentTarget.style.borderColor =
                                    colors.oskar.orange;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = `${colors.oskar.orange}10`;
                                  e.currentTarget.style.borderColor = `${colors.oskar.orange}30`;
                                }}
                              >
                                <FontAwesomeIcon icon={faRefresh} />
                                Générer un mot de passe sécurisé
                              </button>
                            </div>
                          </div>

                          {/* Confirmation du mot de passe */}
                          <div className="col-md-6">
                            <label
                              htmlFor="confirmPassword"
                              className="form-label fw-semibold"
                            >
                              <FontAwesomeIcon icon={faKey} className="me-2" />
                              Confirmer le mot de passe{" "}
                              <span className="text-danger">*</span>
                            </label>
                            <div className="input-group">
                              <span className="input-group-text bg-light border-end-0">
                                <FontAwesomeIcon
                                  icon={faLock}
                                  className="text-muted"
                                />
                              </span>
                              <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
                                className={`form-control border-start-0 ps-0 ${validationErrors.confirmPassword ? "is-invalid" : ""}`}
                                placeholder="Ressaisir le mot de passe"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                disabled={loading || isUserDeleted}
                              />
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                disabled={loading || isUserDeleted}
                                aria-label={
                                  showConfirmPassword
                                    ? "Cacher la confirmation"
                                    : "Afficher la confirmation"
                                }
                              >
                                <FontAwesomeIcon
                                  icon={
                                    showConfirmPassword ? faEyeSlash : faEye
                                  }
                                />
                              </button>
                            </div>
                            {validationErrors.confirmPassword && (
                              <div className="invalid-feedback d-block">
                                {validationErrors.confirmPassword}
                              </div>
                            )}

                            {/* Indicateur de correspondance */}
                            {formData.password && formData.confirmPassword && (
                              <div className="mt-3">
                                <div
                                  className={`d-flex align-items-center gap-2 p-2 rounded ${formData.password === formData.confirmPassword ? "bg-success bg-opacity-10 text-success" : "bg-danger bg-opacity-10 text-danger"}`}
                                >
                                  <FontAwesomeIcon
                                    icon={
                                      formData.password ===
                                      formData.confirmPassword
                                        ? faCheckCircle
                                        : faExclamationTriangle
                                    }
                                  />
                                  <small className="fw-semibold">
                                    {formData.password ===
                                    formData.confirmPassword
                                      ? "Les mots de passe correspondent"
                                      : "Les mots de passe ne correspondent pas"}
                                  </small>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Pied de la modal */}
            <div className="modal-footer border-top-0 py-4 px-4">
              <div className="d-flex justify-content-between w-100">
                <button
                  type="button"
                  className="btn d-flex align-items-center gap-2"
                  onClick={handleReset}
                  disabled={loading || loadingOptions || isUserDeleted}
                  style={styles.secondaryButton}
                  onMouseEnter={(e) => {
                    Object.assign(
                      e.currentTarget.style,
                      styles.secondaryButtonHover,
                    );
                  }}
                  onMouseLeave={(e) => {
                    Object.assign(
                      e.currentTarget.style,
                      styles.secondaryButton,
                    );
                  }}
                >
                  <FontAwesomeIcon icon={faRefresh} />
                  Réinitialiser
                </button>

                <div className="d-flex gap-3">
                  <button
                    type="button"
                    className="btn d-flex align-items-center gap-2"
                    onClick={handleClose}
                    disabled={loading || loadingOptions}
                    style={{
                      background: colors.oskar.lightGrey,
                      color: colors.oskar.grey,
                      border: `1px solid ${colors.oskar.grey}30`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        colors.oskar.grey + "15";
                      e.currentTarget.style.color = colors.oskar.black;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = colors.oskar.lightGrey;
                      e.currentTarget.style.color = colors.oskar.grey;
                    }}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                    Annuler
                  </button>

                  <button
                    type="button"
                    className="btn text-white d-flex align-items-center gap-2"
                    onClick={handleSubmit}
                    disabled={loading || loadingOptions || isUserDeleted}
                    style={styles.primaryButton}
                    onMouseEnter={(e) => {
                      Object.assign(
                        e.currentTarget.style,
                        styles.primaryButtonHover,
                      );
                    }}
                    onMouseLeave={(e) => {
                      Object.assign(
                        e.currentTarget.style,
                        styles.primaryButton,
                      );
                    }}
                  >
                    {loading ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faSave} />
                        Enregistrer les modifications
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Styles inline supplémentaires */}
      <style jsx>{`
        .modal-content {
          border-radius: 16px !important;
          overflow: hidden;
        }

        .card-header {
          border-radius: 12px 12px 0 0 !important;
        }

        .form-control,
        .form-select {
          border-radius: 8px !important;
          transition: all 0.3s ease;
        }

        .form-control:focus,
        .form-select:focus {
          border-color: ${colors.oskar.orange};
          box-shadow: 0 0 0 0.25rem ${colors.oskar.orange}25;
        }

        .form-check-input:checked {
          background-color: ${colors.oskar.orange};
          border-color: ${colors.oskar.orange};
        }

        .btn {
          border-radius: 8px !important;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .input-group-text {
          border-radius: 8px 0 0 8px !important;
        }

        .progress {
          border-radius: 10px;
          background-color: ${colors.oskar.lightGrey};
        }

        .progress-bar {
          border-radius: 10px;
        }

        .fs-12 {
          font-size: 12px !important;
        }

        .fs-14 {
          font-size: 14px !important;
        }

        .shadow-sm {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
        }

        .shadow-lg {
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>
    </>
  );
}
