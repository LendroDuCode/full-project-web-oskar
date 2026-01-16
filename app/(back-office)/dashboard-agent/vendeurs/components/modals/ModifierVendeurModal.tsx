// components/modals/ModifierVendeurModal.tsx
"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  faStore,
  faUserTag,
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
  type: string;
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

interface Vendeur extends FormData {
  uuid: string;
  code_vendeur?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  is_deleted?: boolean;
  civilite?: { libelle: string; uuid: string };
  role?: { name: string; uuid: string };
}

interface ModifierVendeurModalProps {
  isOpen: boolean;
  vendeur: Vendeur | null;
  onClose: () => void;
  onSuccess?: () => void;
}

// Composant d'alerte personnalisée (identique à EditUserModal)
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
      bg: `${colors.oskar.yellow}15`,
      border: `1px solid ${colors.oskar.yellow}30`,
      color: colors.oskar.yellow,
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
                    e.currentTarget.style.background = colors.oskar.yellowHover;
                    e.currentTarget.style.borderColor =
                      colors.oskar.yellowHover;
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

export default function ModifierVendeurModal({
  isOpen,
  vendeur,
  onClose,
  onSuccess,
}: ModifierVendeurModalProps) {
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
    type: "standard",
  });

  // États pour les options
  const [civilites, setCivilites] = useState<Civilite[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

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
  const [vendeurDetails, setVendeurDetails] = useState<Vendeur | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [showUnsavedChangesAlert, setShowUnsavedChangesAlert] = useState(false);
  const [forceUpdateKey, setForceUpdateKey] = useState(0);

  // Styles personnalisés avec les couleurs Oskar (même design que EditUserModal)
  const styles = useMemo(
    () => ({
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
    }),
    [],
  );

  // Fonction utilitaire pour parser la réponse de l'API
  const parseApiResponse = useCallback(<T,>(response: any): T[] => {
    if (Array.isArray(response)) {
      return response;
    }
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }
    if (response?.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (response && typeof response === "object") {
      const keys = Object.keys(response);
      if (keys.length > 0 && Array.isArray(response[keys[0]])) {
        return response[keys[0]];
      }
    }
    return [];
  }, []);

  // Charger les options (civilités et rôles)
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
    } catch (err: any) {
      console.error("Erreur lors du chargement des options:", err);
      setError("Impossible de charger les options. Veuillez réessayer.");
    } finally {
      setLoadingOptions(false);
    }
  }, [parseApiResponse]);

  // Charger les détails complets du vendeur
  const loadVendeurDetails = useCallback(async () => {
    if (!vendeur?.uuid) return;

    try {
      console.log("🔄 Chargement des détails pour le vendeur:", vendeur.uuid);

      const response = await api.get(
        API_ENDPOINTS.ADMIN.VENDEURS.DETAIL(vendeur.uuid),
      );

      console.log("✅ Réponse API détails vendeur:", response.data);

      if (response.data) {
        const vendeurData = response.data.data || response.data;
        console.log("📋 Données vendeur reçues:", vendeurData);
        setVendeurDetails(vendeurData);

        // Préparer les données du formulaire
        const formDataToSet: FormData = {
          nom: vendeurData.nom || "",
          prenoms: vendeurData.prenoms || "",
          email: vendeurData.email || "",
          telephone: vendeurData.telephone || "",
          civilite_uuid: vendeurData.civilite_uuid || "",
          role_uuid: vendeurData.role_uuid || "",
          password: "",
          confirmPassword: "",
          type: vendeurData.type || "standard",
        };

        console.log("📝 Données du formulaire à définir:", formDataToSet);
        setFormData(formDataToSet);
      }
    } catch (err: any) {
      console.error(
        "❌ Erreur lors du chargement des détails du vendeur:",
        err,
      );
      setError("Impossible de charger les détails du vendeur.");
    }
  }, [vendeur]);

  // Charger les options quand la modal s'ouvre
  useEffect(() => {
    if (!isOpen || !vendeur) return;

    console.log("🚀 Modal ouverte pour le vendeur:", vendeur);

    // Réinitialiser les états
    setInitialized(false);
    setVendeurDetails(null);
    setFormData({
      nom: "",
      prenoms: "",
      email: "",
      telephone: "",
      civilite_uuid: "",
      role_uuid: "",
      password: "",
      confirmPassword: "",
      type: "standard",
    });

    const initializeModal = async () => {
      try {
        setInitialized(true);

        // 1. Charger d'abord les options
        console.log("📥 Chargement des options...");
        await loadOptions();

        // 2. Ensuite charger les détails du vendeur
        console.log("📥 Chargement des détails vendeur...");
        await loadVendeurDetails();
      } catch (err) {
        console.error("❌ Erreur lors de l'initialisation de la modal:", err);
        setError("Erreur lors du chargement des données.");
      }
    };

    initializeModal();
  }, [isOpen, vendeur, loadOptions, loadVendeurDetails]);

  // Mettre à jour le formulaire avec les données du vendeur depuis le tableau
  useEffect(() => {
    if (vendeur && isOpen && !initialized) {
      console.log(
        "🎯 Mise à jour directe avec les données du tableau:",
        vendeur,
      );

      // Utiliser directement les données du tableau si disponibles
      const directFormData: FormData = {
        nom: vendeur.nom || "",
        prenoms: vendeur.prenoms || "",
        email: vendeur.email || "",
        telephone: vendeur.telephone || "",
        civilite_uuid: vendeur.civilite_uuid || "",
        role_uuid: vendeur.role_uuid || "",
        password: "",
        confirmPassword: "",
        type: vendeur.type || "standard",
      };

      console.log("📝 Données directes du formulaire:", directFormData);
      setFormData(directFormData);
      setForceUpdateKey((prev) => prev + 1);
    }
  }, [vendeur, isOpen, initialized]);

  // Mettre à jour le formulaire quand les détails du vendeur changent
  useEffect(() => {
    if (vendeurDetails && civilites.length > 0) {
      console.log(
        "🔄 Mise à jour du formulaire avec les détails chargés:",
        vendeurDetails,
      );

      // Mettre à jour seulement si les données sont différentes
      setFormData((prev) => {
        const updatedData = {
          nom: vendeurDetails.nom || "",
          prenoms: vendeurDetails.prenoms || "",
          email: vendeurDetails.email || "",
          telephone: vendeurDetails.telephone || "",
          civilite_uuid: vendeurDetails.civilite_uuid || "",
          role_uuid: vendeurDetails.role_uuid || "",
          password: "",
          confirmPassword: "",
          type: vendeurDetails.type || "standard",
        };

        // Vérifier si les données ont changé
        if (JSON.stringify(prev) !== JSON.stringify(updatedData)) {
          return updatedData;
        }
        return prev;
      });
    }
  }, [vendeurDetails, civilites]);

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
        type: "standard",
      });
      setVendeurDetails(null);
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

    if (!formData.type) {
      errors.type = "Le type de vendeur est obligatoire";
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

    // Vérifier si le vendeur est supprimé
    if (vendeurDetails?.is_deleted) {
      setError(
        "Ce vendeur a été supprimé. Vous devez d'abord le restaurer avant de pouvoir le modifier.",
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      // Préparer les données pour l'API
      const vendeurData: any = {
        nom: formData.nom.trim(),
        prenoms: formData.prenoms.trim(),
        email: formData.email.trim().toLowerCase(),
        telephone: formData.telephone.trim(),
        civilite_uuid: formData.civilite_uuid,
        role_uuid: formData.role_uuid,
        type: formData.type,
      };

      // Ajouter le mot de passe seulement si on le change
      if (changePassword && formData.password) {
        vendeurData.mot_de_passe = formData.password;
      }

      console.log("📤 Envoi des données pour modification:", {
        ...vendeurData,
        mot_de_passe: vendeurData.mot_de_passe ? "***" : undefined,
      });

      // Utiliser l'endpoint correct
      const endpoint = API_ENDPOINTS.ADMIN.VENDEURS.UPDATE(vendeur?.uuid || "");
      console.log("🌐 Endpoint:", endpoint);

      // Utiliser PATCH
      const response = await api.patch(endpoint, vendeurData);

      console.log("✅ Vendeur modifié:", response.data);

      setSuccessMessage("Vendeur modifié avec succès !");

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

      let errorMessage = "Erreur lors de la modification du vendeur";

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
          "Vendeur non trouvé. Le vendeur a peut-être été supprimé.";
      } else if (err.response?.status === 409) {
        errorMessage = "Un vendeur avec cet email ou téléphone existe déjà.";
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

  // Restaurer un vendeur supprimé
  const handleRestore = async () => {
    if (!vendeur?.uuid) return;

    try {
      setLoading(true);
      setError(null);

      const response = await api.post(
        API_ENDPOINTS.ADMIN.VENDEURS.RESTORE(vendeur.uuid),
      );

      console.log("✅ Vendeur restauré:", response.data);

      setSuccessMessage("Vendeur restauré avec succès !");

      // Recharger les détails
      await loadVendeurDetails();

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err: any) {
      console.error("❌ Erreur lors de la restauration:", err);
      setError("Erreur lors de la restauration du vendeur");
    } finally {
      setLoading(false);
    }
  };

  // Réinitialiser le formulaire
  const handleReset = () => {
    if (vendeurDetails) {
      setFormData({
        nom: vendeurDetails.nom || "",
        prenoms: vendeurDetails.prenoms || "",
        email: vendeurDetails.email || "",
        telephone: vendeurDetails.telephone || "",
        civilite_uuid: vendeurDetails.civilite_uuid || "",
        role_uuid: vendeurDetails.role_uuid || "",
        password: "",
        confirmPassword: "",
        type: vendeurDetails.type || "standard",
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
      formData.nom !== (vendeurDetails?.nom || vendeur?.nom) ||
      formData.prenoms !== (vendeurDetails?.prenoms || vendeur?.prenoms) ||
      formData.email !== (vendeurDetails?.email || vendeur?.email) ||
      formData.telephone !==
        (vendeurDetails?.telephone || vendeur?.telephone) ||
      formData.civilite_uuid !==
        (vendeurDetails?.civilite_uuid || vendeur?.civilite_uuid) ||
      formData.role_uuid !==
        (vendeurDetails?.role_uuid || vendeur?.role_uuid) ||
      formData.type !== (vendeurDetails?.type || vendeur?.type) ||
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

  // Si la modal n'est pas ouverte ou pas de vendeur, ne rien afficher
  if (!isOpen || !vendeur) return null;

  const passwordStrength = getPasswordStrength();
  const isVendeurDeleted = vendeurDetails?.is_deleted;
  const vendeurCreatedDate = vendeurDetails?.created_at
    ? new Date(vendeurDetails.created_at)
    : null;
  const vendeurUpdatedDate = vendeurDetails?.updated_at
    ? new Date(vendeurDetails.updated_at)
    : null;

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
        aria-labelledby="modifierVendeurModalLabel"
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
                    id="modifierVendeurModalLabel"
                  >
                    Modifier le Vendeur
                  </h5>
                  <p className="mb-0 opacity-75 fs-14">
                    {vendeur.nom} {vendeur.prenoms} •{" "}
                    {vendeur.code_vendeur || "N/A"}
                    {isVendeurDeleted && " • ❌ Supprimé"}
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
              {/* Informations sur le vendeur */}
              <div className="row mb-4">
                <div className="col-12">
                  <div
                    className={`alert ${isVendeurDeleted ? "alert-warning" : "alert-info"} border-0 shadow-sm`}
                    style={{ borderRadius: "10px" }}
                  >
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <div
                          className="rounded-circle p-2"
                          style={{
                            backgroundColor: isVendeurDeleted
                              ? `${colors.oskar.orange}20`
                              : `${colors.oskar.blue}20`,
                          }}
                        >
                          <FontAwesomeIcon
                            icon={
                              isVendeurDeleted
                                ? faExclamationTriangle
                                : faInfoCircle
                            }
                            style={{
                              color: isVendeurDeleted
                                ? colors.oskar.orange
                                : colors.oskar.blue,
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <p className="mb-0">
                          {isVendeurDeleted ? (
                            <>
                              <strong>⚠️ Vendeur supprimé</strong>
                              <br />
                              Ce vendeur a été supprimé le{" "}
                              {vendeurDetails?.deleted_at
                                ? new Date(
                                    vendeurDetails.deleted_at,
                                  ).toLocaleDateString("fr-FR")
                                : "N/A"}
                              . Vous devez d'abord le restaurer avant de pouvoir
                              le modifier.
                            </>
                          ) : (
                            <>
                              Modifiez les informations de{" "}
                              <strong>
                                {vendeur.nom} {vendeur.prenoms}
                              </strong>
                              {vendeur.type && ` • Type: ${vendeur.type}`}. Créé
                              le{" "}
                              {vendeurCreatedDate
                                ? vendeurCreatedDate.toLocaleDateString("fr-FR")
                                : "N/A"}
                              {vendeurUpdatedDate &&
                                vendeurUpdatedDate > vendeurCreatedDate &&
                                ` • Dernière modification le ${vendeurUpdatedDate.toLocaleDateString("fr-FR")}`}
                              .
                            </>
                          )}
                        </p>
                        {isVendeurDeleted && (
                          <button
                            type="button"
                            className="btn btn-warning btn-sm mt-2 d-flex align-items-center gap-2"
                            onClick={handleRestore}
                            disabled={loading}
                          >
                            <FontAwesomeIcon icon={faUndo} />
                            Restaurer le vendeur
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
                              disabled={loading || isVendeurDeleted}
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
                              disabled={loading || isVendeurDeleted}
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
                              disabled={loading || isVendeurDeleted}
                            />
                          </div>
                          {validationErrors.prenoms && (
                            <div className="invalid-feedback d-block">
                              {validationErrors.prenoms}
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
                            Email et téléphone du vendeur
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
                              placeholder="vendeur@entreprise.com"
                              value={formData.email}
                              onChange={handleChange}
                              disabled={loading || isVendeurDeleted}
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
                              disabled={loading || isVendeurDeleted}
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

                  {/* Section 3: Rôle et type */}
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
                            icon={faUserTag}
                            style={{ color: colors.oskar.blue }}
                          />
                        </div>
                        <div>
                          <h6
                            className="mb-0 fw-bold"
                            style={{ color: colors.oskar.blue }}
                          >
                            Rôle et Type
                          </h6>
                          <small className="text-muted">
                            Définir le rôle et le type du vendeur
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
                              disabled={loading || isVendeurDeleted}
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

                        {/* Type de vendeur */}
                        <div className="col-md-6">
                          <label
                            htmlFor="type"
                            className="form-label fw-semibold"
                          >
                            Type de Vendeur{" "}
                            <span className="text-danger">*</span>
                          </label>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-end-0">
                              <FontAwesomeIcon
                                icon={faStore}
                                className="text-muted"
                              />
                            </span>
                            <select
                              id="type"
                              name="type"
                              className={`form-select border-start-0 ps-0 ${validationErrors.type ? "is-invalid" : ""}`}
                              value={formData.type}
                              onChange={handleChange}
                              disabled={loading || isVendeurDeleted}
                              style={{ borderRadius: "0 8px 8px 0" }}
                            >
                              <option value="standard">Standard</option>
                              <option value="premium">Premium</option>
                              <option value="expert">Expert</option>
                              <option value="senior">Senior</option>
                            </select>
                          </div>
                          {validationErrors.type && (
                            <div className="invalid-feedback d-block">
                              {validationErrors.type}
                            </div>
                          )}
                          <small className="text-muted">
                            Détermine les permissions et niveaux d'accès
                          </small>
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
                            disabled={loading || isVendeurDeleted}
                          />
                          <label
                            htmlFor="changePassword"
                            className="form-check-label fw-semibold fs-14"
                          >
                            Changer le mot de passe du vendeur
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
                                disabled={loading || isVendeurDeleted}
                              />
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading || isVendeurDeleted}
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
                                    style={{
                                      width: `${(passwordStrength.score / 5) * 100}%`,
                                      backgroundColor: passwordStrength.color,
                                    }}
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
                                disabled={loading || isVendeurDeleted}
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
                                disabled={loading || isVendeurDeleted}
                              />
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                disabled={loading || isVendeurDeleted}
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
                  disabled={loading || loadingOptions || isVendeurDeleted}
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
                    disabled={loading || loadingOptions || isVendeurDeleted}
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
