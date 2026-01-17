// components/modals/agents/EditAgentModal.tsx
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
  faIdCard,
  faShield,
  faLock,
  faRefresh,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";

// Types
interface Agent {
  uuid: string;
  nom: string;
  prenoms: string;
  email: string;
  telephone: string;
  civilite_uuid: string;
  role_uuid: string;
  est_verifie: boolean;
  est_bloque: boolean;
  is_admin: boolean;
  matricule?: string;
  date_embauche?: string;
  departement?: string;
  fonction?: string;
  salaire?: string;
  adresse?: string;
  ville?: string;
  code_postal?: string;
  commentaire?: string;
  civilite?: {
    libelle: string;
  };
  role?: {
    name: string;
  };
}

interface FormData {
  nom: string;
  prenoms: string;
  email: string;
  telephone: string;
  civilite_uuid: string;
  role_uuid: string;
  est_verifie: boolean;
  est_bloque: boolean;
  is_admin: boolean;
  password: string;
  confirmPassword: string;
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

interface EditAgentModalProps {
  isOpen: boolean;
  agent: Agent | null;
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
      bg: `${colors.oskar.yellow}15`,
      border: `1px solid ${colors.oskar.yellow}30`,
      color: colors.oskar.yellow,
      icon: faExclamationTriangle,
    },
    danger: {
      bg: `${colors.oskar.orange}15`,
      border: `1px solid ${colors.oskar.orange}30`,
      color: colors.oskar.orange,
      icon: faExclamationTriangle,
    },
    info: {
      bg: `${colors.oskar.blue}15`,
      border: `1px solid ${colors.oskar.blue}30`,
      color: colors.oskar.blue,
      icon: faCheckCircle,
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
        }
      `}</style>
    </div>
  );
}

export default function EditAgentModal({
  isOpen,
  agent,
  onClose,
  onSuccess,
}: EditAgentModalProps) {
  // États du formulaire
  const [formData, setFormData] = useState<FormData>({
    nom: "",
    prenoms: "",
    email: "",
    telephone: "",
    civilite_uuid: "",
    role_uuid: "",
    est_verifie: false,
    est_bloque: false,
    is_admin: false,
    password: "",
    confirmPassword: "",
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
  const [showUnsavedChangesAlert, setShowUnsavedChangesAlert] = useState(false);

  // Styles personnalisés avec les couleurs jaunes
  const styles = {
    modalHeader: {
      background: `linear-gradient(135deg, ${colors.oskar.yellow} 0%, ${colors.oskar.yellowHover || colors.oskar.yellow} 100%)`,
      borderBottom: `3px solid ${colors.oskar.blue}`,
    },
    sectionHeader: {
      background: colors.oskar.lightGrey,
      borderLeft: `4px solid ${colors.oskar.blue}`,
    },
    infoSectionHeader: {
      background: colors.oskar.lightGrey,
      borderLeft: `4px solid ${colors.oskar.green}`,
    },
    primaryButton: {
      background: colors.oskar.yellow,
      borderColor: colors.oskar.yellow,
      color: colors.oskar.black,
    },
    secondaryButton: {
      background: "white",
      color: colors.oskar.yellow,
      borderColor: colors.oskar.yellow,
    },
  };

  // Fonction utilitaire pour parser la réponse de l'API
  const parseApiResponse = <T,>(response: any): T[] => {
    console.log("📊 Parsing API response:", response);

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

    console.warn("⚠️ Format de réponse API non reconnu:", response);
    return [];
  };

  // Charger les options (civilités et rôles)
  const loadOptions = useCallback(async () => {
    try {
      setLoadingOptions(true);
      setError(null);

      console.log("📥 Chargement des civilités...");
      const civilitesResponse = await api.get(API_ENDPOINTS.CIVILITES.LIST);
      console.log("📊 Réponse civilités:", civilitesResponse);

      const civilitesData = parseApiResponse<Civilite>(
        civilitesResponse.data || civilitesResponse,
      );
      console.log("✅ Civilités parsées:", civilitesData);
      setCivilites(civilitesData);

      console.log("📥 Chargement des rôles...");
      const rolesResponse = await api.get(API_ENDPOINTS.ROLES.LIST);
      console.log("📊 Réponse rôles:", rolesResponse);

      const rolesData = parseApiResponse<Role>(
        rolesResponse.data || rolesResponse,
      );
      console.log("✅ Rôles parsés:", rolesData);

      // Filtrer pour les rôles d'agent
      const agentRoles = rolesData.filter(
        (role) =>
          role.name.includes("Agent") ||
          role.name.includes("Employé") ||
          role.name.includes("agent") ||
          role.name.includes("employé"),
      );

      console.log("🔍 Rôles d'agent filtrés:", agentRoles);
      setRoles(agentRoles);
    } catch (err: any) {
      console.error("❌ Erreur lors du chargement des options:", err);
      setError("Impossible de charger les options. Veuillez réessayer.");
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  // Initialiser la modal quand elle s'ouvre
  useEffect(() => {
    if (!isOpen || !agent) return;

    console.log("🚀 Modal ouverte pour l'agent:", agent);

    // Réinitialiser les états
    setFormData({
      nom: "",
      prenoms: "",
      email: "",
      telephone: "",
      civilite_uuid: "",
      role_uuid: "",
      est_verifie: false,
      est_bloque: false,
      is_admin: false,
      password: "",
      confirmPassword: "",
    });

    const initializeModal = async () => {
      try {
        // 1. Charger d'abord les options
        console.log("📥 Chargement des options...");
        await loadOptions();

        // 2. Pré-remplir le formulaire avec les données de l'agent
        console.log("📝 Pré-remplissage du formulaire...");
        const directFormData: FormData = {
          nom: agent.nom || "",
          prenoms: agent.prenoms || "",
          email: agent.email || "",
          telephone: agent.telephone || "",
          civilite_uuid: agent.civilite_uuid || "",
          role_uuid: agent.role_uuid || "",
          est_verifie: agent.est_verifie || false,
          est_bloque: agent.est_bloque || false,
          is_admin: agent.is_admin || false,
          password: "",
          confirmPassword: "",
        };

        console.log("📝 Données directes du formulaire:", directFormData);
        setFormData(directFormData);
      } catch (err) {
        console.error("❌ Erreur lors de l'initialisation de la modal:", err);
        setError("Erreur lors du chargement des données.");
      }
    };

    initializeModal();
  }, [isOpen, agent, loadOptions]);

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
        est_verifie: false,
        est_bloque: false,
        is_admin: false,
        password: "",
        confirmPassword: "",
      });
      setError(null);
      setSuccessMessage(null);
      setValidationErrors({});
      setChangePassword(false);
      setShowUnsavedChangesAlert(false);
    }
  }, [isOpen]);

  // Validation du formulaire
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.nom.trim()) errors.nom = "Le nom est obligatoire";
    if (!formData.prenoms.trim())
      errors.prenoms = "Les prénoms sont obligatoires";

    if (!formData.email.trim()) {
      errors.email = "L'email est obligatoire";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "L'email n'est pas valide";
    }

    if (!formData.telephone.trim())
      errors.telephone = "Le téléphone est obligatoire";
    if (!formData.civilite_uuid)
      errors.civilite_uuid = "La civilité est obligatoire";
    if (!formData.role_uuid) errors.role_uuid = "Le rôle est obligatoire";

    // Validation mot de passe seulement si on le change
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
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

    if (!agent) return;

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      // Préparer les données pour l'API selon le format requis (comme dans Postman)
      const agentData: any = {
        nom: formData.nom.trim(),
        prenoms: formData.prenoms.trim(),
        email: formData.email.trim().toLowerCase(),
        telephone: formData.telephone.trim(),
        civilite_uuid: formData.civilite_uuid,
        role_uuid: formData.role_uuid,
      };

      // Ajouter le mot de passe s'il est modifié
      if (changePassword && formData.password) {
        agentData.mot_de_passe = formData.password;
      }

      console.log("📤 Envoi des données pour modification:", agentData);

      // CORRECTION ICI: Utiliser PATCH au lieu de PUT
      // L'endpoint doit être: /admin/modifier-agent-par-admin/{uuid}
      // Vérifiez votre fichier API_ENDPOINTS pour le bon endpoint

      // Si votre API_ENDPOINTS.ADMIN.AGENTS.UPDATE ne fonctionne pas,
      // essayez de construire l'endpoint manuellement:
      const endpoint = `/admin/modifier-agent-par-admin/${agent.uuid}`;
      console.log("🌐 Endpoint:", endpoint);

      // CORRECTION ICI: Utiliser PATCH au lieu de PUT
      const response = await api.patch(endpoint, agentData);

      console.log("✅ Agent modifié:", response.data);

      setSuccessMessage("Agent modifié avec succès !");

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
      console.error("❌ Détails de l'erreur:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });

      let errorMessage = "Erreur lors de la modification de l'agent";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Gestion spécifique des erreurs
      if (err.response?.status === 400) {
        errorMessage = "Données invalides. Vérifiez les informations saisies.";
      } else if (err.response?.status === 404) {
        errorMessage =
          "Agent non trouvé. L'endpoint API est peut-être incorrect.";
      } else if (err.response?.status === 409) {
        errorMessage = "Un agent avec cet email ou téléphone existe déjà.";
      } else if (err.response?.status === 500) {
        errorMessage = "Erreur serveur. Veuillez réessayer plus tard.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Réinitialiser le formulaire
  const handleReset = () => {
    if (agent) {
      setFormData({
        nom: agent.nom || "",
        prenoms: agent.prenoms || "",
        email: agent.email || "",
        telephone: agent.telephone || "",
        civilite_uuid: agent.civilite_uuid || "",
        role_uuid: agent.role_uuid || "",
        est_verifie: agent.est_verifie || false,
        est_bloque: agent.est_bloque || false,
        is_admin: agent.is_admin || false,
        password: "",
        confirmPassword: "",
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
      formData.nom !== (agent?.nom || "") ||
      formData.prenoms !== (agent?.prenoms || "") ||
      formData.email !== (agent?.email || "") ||
      formData.telephone !== (agent?.telephone || "") ||
      formData.civilite_uuid !== (agent?.civilite_uuid || "") ||
      formData.role_uuid !== (agent?.role_uuid || "") ||
      formData.est_verifie !== (agent?.est_verifie || false) ||
      formData.est_bloque !== (agent?.est_bloque || false) ||
      formData.is_admin !== (agent?.is_admin || false) ||
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

  // Générer un mot de passe
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

  // Si la modal n'est pas ouverte, ne rien afficher
  if (!isOpen || !agent) return null;

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
                  <h5 className="modal-title mb-0 fw-bold">Modifier l'Agent</h5>
                  <p className="mb-0 opacity-75 fs-14">
                    {agent?.nom} {agent?.prenoms}
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
                        style={{ backgroundColor: `${colors.oskar.yellow}20` }}
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
                      aria-label="Close"
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
                      aria-label="Close"
                    ></button>
                  </div>
                </div>
              )}

              {loadingOptions ? (
                <div className="text-center py-5">
                  <div
                    className="spinner-border"
                    style={{ color: colors.oskar.yellow }}
                    role="status"
                  >
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                  <p className="mt-3 text-muted">Chargement des options...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
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
                          style={{ backgroundColor: `${colors.oskar.blue}15` }}
                        >
                          <FontAwesomeIcon
                            icon={faUser}
                            style={{ color: colors.oskar.blue }}
                          />
                        </div>
                        <div>
                          <h6
                            className="mb-0 fw-bold"
                            style={{ color: colors.oskar.blue }}
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
                              disabled={loading}
                              style={{ borderRadius: "0 8px 8px 0" }}
                            >
                              <option value="">
                                Sélectionner une civilité
                              </option>
                              {civilites.length > 0 ? (
                                civilites.map((civilite) => (
                                  <option
                                    key={civilite.uuid}
                                    value={civilite.uuid}
                                  >
                                    {civilite.libelle}
                                  </option>
                                ))
                              ) : (
                                <option value="" disabled>
                                  {loadingOptions
                                    ? "Chargement..."
                                    : "Aucune civilité disponible"}
                                </option>
                              )}
                            </select>
                          </div>
                          {validationErrors.civilite_uuid && (
                            <div className="invalid-feedback d-block">
                              {validationErrors.civilite_uuid}
                            </div>
                          )}
                          <small className="text-muted">
                            {civilites.length} civilité(s) disponible(s)
                          </small>
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
                              disabled={loading}
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
                              disabled={loading}
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
                      style={styles.infoSectionHeader}
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
                            Email et téléphone de l'agent
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
                              disabled={loading}
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
                              disabled={loading}
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

                  {/* Section 3: Rôle et autorisations */}
                  <div
                    className="card border-0 shadow-sm mb-4"
                    style={{ borderRadius: "12px" }}
                  >
                    <div
                      className="card-header border-0 py-3"
                      style={{
                        background: colors.oskar.lightGrey,
                        borderLeft: `4px solid ${colors.oskar.yellow}`,
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <div
                          className="rounded-circle p-2 me-3"
                          style={{
                            backgroundColor: `${colors.oskar.yellow}15`,
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faShield}
                            style={{ color: colors.oskar.yellow }}
                          />
                        </div>
                        <div>
                          <h6
                            className="mb-0 fw-bold"
                            style={{ color: colors.oskar.yellow }}
                          >
                            Rôle et Autorisations
                          </h6>
                          <small className="text-muted">
                            Définir le rôle et les permissions de l'agent
                          </small>
                        </div>
                      </div>
                    </div>
                    <div className="card-body p-4">
                      <div className="row g-3">
                        {/* Rôle */}
                        <div className="col-md-12 mb-4">
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
                              disabled={loading}
                              style={{ borderRadius: "0 8px 8px 0" }}
                            >
                              <option value="">Sélectionner un rôle</option>
                              {roles.length > 0 ? (
                                roles.map((role) => (
                                  <option key={role.uuid} value={role.uuid}>
                                    {role.name}
                                  </option>
                                ))
                              ) : (
                                <option value="" disabled>
                                  {loadingOptions
                                    ? "Chargement..."
                                    : "Aucun rôle disponible"}
                                </option>
                              )}
                            </select>
                          </div>
                          {validationErrors.role_uuid && (
                            <div className="invalid-feedback d-block">
                              {validationErrors.role_uuid}
                            </div>
                          )}
                          <small className="text-muted">
                            {roles.length} rôle(s) disponible(s)
                          </small>
                        </div>

                        {/* Options de statut */}
                        <div className="col-md-12">
                          <h6 className="fw-semibold mb-3">Statut du compte</h6>
                          <div className="d-flex flex-column gap-3">
                            {/* Admin */}
                            <div className="d-flex align-items-center justify-content-between p-3 rounded bg-light">
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
                                  disabled={loading}
                                />
                              </div>
                            </div>

                            {/* Email vérifié */}
                            <div className="d-flex align-items-center justify-content-between p-3 rounded bg-light">
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
                                  disabled={loading}
                                />
                              </div>
                            </div>

                            {/* Compte bloqué */}
                            <div className="d-flex align-items-center justify-content-between p-3 rounded bg-light">
                              <div className="d-flex align-items-center">
                                <div
                                  className="rounded-circle p-2 me-3"
                                  style={{
                                    backgroundColor: `${colors.oskar.yellow}15`,
                                  }}
                                >
                                  <FontAwesomeIcon
                                    icon={faExclamationTriangle}
                                    style={{ color: colors.oskar.yellow }}
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
                                    L'agent ne peut pas se connecter
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
                                  disabled={loading}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Modification du mot de passe */}
                  <div
                    className="card border-0 shadow-sm mb-4"
                    style={{ borderRadius: "12px" }}
                  >
                    <div
                      className="card-header border-0 py-3"
                      style={{
                        background: colors.oskar.lightGrey,
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
                            Modification du Mot de Passe
                          </h6>
                          <small className="text-muted">
                            Optionnel - laissez vide pour conserver l'actuel
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
                            disabled={loading}
                          />
                          <label
                            htmlFor="changePassword"
                            className="form-check-label fw-semibold fs-14"
                          >
                            Changer le mot de passe de l'agent
                          </label>
                          <p className="text-muted fs-12 mt-1">
                            Si vous ne souhaitez pas changer le mot de passe,
                            laissez cette option désactivée.
                          </p>
                        </div>
                      </div>

                      {changePassword && (
                        <div className="row g-3">
                          {/* Mot de passe */}
                          <div className="col-md-6">
                            <label
                              htmlFor="password"
                              className="form-label fw-semibold"
                            >
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
                                disabled={loading}
                              />
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading}
                              >
                                <FontAwesomeIcon
                                  icon={showPassword ? faEyeSlash : faEye}
                                />
                              </button>
                            </div>
                            {validationErrors.password && (
                              <div className="invalid-feedback d-block">
                                {validationErrors.password}
                              </div>
                            )}
                          </div>

                          {/* Confirmation mot de passe */}
                          <div className="col-md-6">
                            <label
                              htmlFor="confirmPassword"
                              className="form-label fw-semibold"
                            >
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
                                placeholder="Confirmer le mot de passe"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                disabled={loading}
                              />
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                disabled={loading}
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
                          </div>

                          <div className="col-md-12 mt-3">
                            <button
                              type="button"
                              className="btn d-flex align-items-center gap-2"
                              onClick={generatePassword}
                              disabled={loading}
                              style={{
                                background: `${colors.oskar.yellow}10`,
                                color: colors.oskar.yellow,
                                border: `1px solid ${colors.oskar.yellow}30`,
                              }}
                            >
                              <FontAwesomeIcon icon={faRefresh} />
                              Générer un mot de passe sécurisé
                            </button>
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
                  disabled={loading || loadingOptions}
                  style={styles.secondaryButton}
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
                  >
                    <FontAwesomeIcon icon={faTimes} />
                    Annuler
                  </button>

                  <button
                    type="button"
                    className="btn d-flex align-items-center gap-2"
                    onClick={handleSubmit}
                    disabled={loading || loadingOptions}
                    style={styles.primaryButton}
                  >
                    {loading ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin />
                        Modification...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faSave} />
                        Modifier l'Agent
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Styles inline */}
      <style jsx>{`
        .modal-content {
          border-radius: 16px !important;
          overflow: hidden;
        }

        .form-control:focus,
        .form-select:focus {
          border-color: ${colors.oskar.yellow};
          box-shadow: 0 0 0 0.25rem ${colors.oskar.yellow}25;
        }

        .form-check-input:checked {
          background-color: ${colors.oskar.yellow};
          border-color: ${colors.oskar.yellow};
        }

        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .fs-12 {
          font-size: 12px !important;
        }

        .fs-14 {
          font-size: 14px !important;
        }
      `}</style>
    </>
  );
}
