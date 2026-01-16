// components/modals/CreateUserModal.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faUserPlus,
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
  is_deleted: boolean;
}

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateUserModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateUserModalProps) {
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

  // Styles personnalisés
  const styles = {
    modalHeader: {
      background: `linear-gradient(135deg, ${colors.oskar.green} 0%, ${colors.oskar.green} 100%)`,
      borderBottom: `3px solid ${colors.oskar.orange}`,
    },
    sectionHeader: {
      background: colors.oskar.lightGrey,
      borderLeft: `4px solid ${colors.oskar.green}`,
    },
    successBadge: {
      background: `${colors.oskar.green}15`,
      color: colors.oskar.green,
      border: `1px solid ${colors.oskar.green}30`,
    },
    warningBadge: {
      background: `${colors.oskar.orange}15`,
      color: colors.oskar.orange,
      border: `1px solid ${colors.oskar.orange}30`,
    },
    primaryButton: {
      background: colors.oskar.green,
      borderColor: colors.oskar.green,
    },
    primaryButtonHover: {
      background: colors.oskar.greenHover,
      borderColor: colors.oskar.greenHover,
    },
    secondaryButton: {
      background: "white",
      color: colors.oskar.green,
      borderColor: colors.oskar.green,
    },
    secondaryButtonHover: {
      background: colors.oskar.lightGrey,
      color: colors.oskar.greenHover,
      borderColor: colors.oskar.greenHover,
    },
  };

  // Fonction utilitaire pour parser la réponse de l'API
  const parseApiResponse = <T,>(response: any): T[] => {
    console.log("🔍 Parsing API response:", {
      response,
      hasData: !!response?.data,
      dataType: typeof response?.data,
      isArray: Array.isArray(response?.data),
    });

    // Cas 1: La réponse est directement un tableau
    if (Array.isArray(response)) {
      console.log("✅ Response is directly an array:", response.length);
      return response;
    }

    // Cas 2: La réponse a une propriété data qui est un tableau
    if (response?.data && Array.isArray(response.data)) {
      console.log("✅ Response.data is an array:", response.data.length);
      return response.data;
    }

    // Cas 3: La réponse a une propriété data qui est un objet avec une propriété data
    if (response?.data?.data && Array.isArray(response.data.data)) {
      console.log(
        "✅ Response.data.data is an array:",
        response.data.data.length,
      );
      return response.data.data;
    }

    // Cas 4: La réponse est un objet avec des propriétés mais pas de structure standard
    if (response && typeof response === "object") {
      // Vérifier si c'est un tableau déguisé
      const keys = Object.keys(response);
      if (keys.length > 0 && Array.isArray(response[keys[0]])) {
        console.log(
          "✅ Response object contains an array:",
          keys[0],
          response[keys[0]].length,
        );
        return response[keys[0]];
      }
    }

    console.warn("⚠️ Could not parse API response, returning empty array");
    return [];
  };

  // Charger les options (civilités et rôles) - VERSION CORRIGÉE
  const loadOptions = useCallback(async () => {
    try {
      setLoadingOptions(true);
      setError(null);

      console.log("🔄 Loading civilites and roles...");

      // 1. Charger les civilités
      const civilitesResponse = await api.get(API_ENDPOINTS.CIVILITES.LIST);
      console.log("📦 Civilites raw response:", civilitesResponse);

      const civilitesData = parseApiResponse<Civilite>(civilitesResponse);
      console.log("✅ Parsed civilites:", civilitesData.length, civilitesData);

      // Prendre toutes les civilités
      setCivilites(civilitesData);

      // 2. Charger les rôles
      const rolesResponse = await api.get(API_ENDPOINTS.ROLES.LIST);
      console.log("📦 Roles raw response:", rolesResponse);

      const rolesData = parseApiResponse<Role>(rolesResponse);
      console.log("✅ Parsed roles:", rolesData.length, rolesData);

      // Prendre tous les rôles
      setRoles(rolesData);

      // 3. Définir les valeurs par défaut
      if (civilitesData.length > 0) {
        setFormData((prev) => ({
          ...prev,
          civilite_uuid: civilitesData[0].uuid,
        }));
      }

      const userRole = rolesData.find((r) => r.name === "Utilisateur");
      if (userRole) {
        setFormData((prev) => ({
          ...prev,
          role_uuid: userRole.uuid,
        }));
      } else if (rolesData.length > 0) {
        setFormData((prev) => ({
          ...prev,
          role_uuid: rolesData[0].uuid,
        }));
      }

      console.log(
        `✅ Chargement réussi: ${civilitesData.length} civilités, ${rolesData.length} rôles`,
      );
    } catch (err: any) {
      console.error("❌ Erreur lors du chargement des options:", err);
      setError("Impossible de charger les options");
      setCivilites([]);
      setRoles([]);
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  // Charger les options quand la modal s'ouvre
  useEffect(() => {
    if (!isOpen) return;
    loadOptions();
  }, [isOpen, loadOptions]);

  // Réinitialiser le formulaire quand la modal s'ouvre/ferme
  useEffect(() => {
    if (!isOpen) {
      const defaultCiviliteUuid = civilites.length > 0 ? civilites[0].uuid : "";
      const userRole = roles.find((r) => r.name === "Utilisateur");
      const defaultRoleUuid = userRole
        ? userRole.uuid
        : roles.length > 0
          ? roles[0].uuid
          : "";

      setFormData({
        nom: "",
        prenoms: "",
        email: "",
        telephone: "",
        civilite_uuid: defaultCiviliteUuid,
        role_uuid: defaultRoleUuid,
        est_verifie: false,
        est_bloque: false,
        is_admin: false,
        password: "",
        confirmPassword: "",
      });
      setError(null);
      setSuccessMessage(null);
      setValidationErrors({});
    }
  }, [isOpen, civilites, roles]);

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
    } else if (
      !/^\+?[\d\s-]{8,}$/.test(formData.telephone.replace(/\s/g, ""))
    ) {
      errors.telephone = "Numéro de téléphone invalide";
    }

    if (!formData.civilite_uuid) {
      errors.civilite_uuid = "La civilité est obligatoire";
    }

    if (!formData.role_uuid) {
      errors.role_uuid = "Le rôle est obligatoire";
    }

    if (!formData.password) {
      errors.password = "Le mot de passe est obligatoire";
    } else if (formData.password.length < 6) {
      errors.password = "Le mot de passe doit contenir au moins 6 caractères";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Les mots de passe ne correspondent pas";
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

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      // Préparer les données pour l'API
      const userData = {
        nom: formData.nom.trim(),
        prenoms: formData.prenoms.trim(),
        email: formData.email.trim().toLowerCase(),
        telephone: formData.telephone.trim(),
        civilite_uuid: formData.civilite_uuid,
        role_uuid: formData.role_uuid,
        est_verifie: formData.est_verifie,
        est_bloque: formData.est_bloque,
        is_admin: formData.is_admin,
        mot_de_passe: formData.password,
        // Champs par défaut
        indicatif: "+225",
        code_utilisateur: `USER_${Date.now()}`,
        statut: "actif",
        adminUuid: "0", // À remplacer par l'UUID de l'admin connecté
      };

      console.log("📤 Envoi des données pour création:", userData);

      // Appel à l'API
      const response = await api.post(
        API_ENDPOINTS.ADMIN.USERS.CREATE,
        userData,
      );

      console.log("✅ Utilisateur créé:", response.data);

      setSuccessMessage("Utilisateur créé avec succès !");

      // Réinitialiser le formulaire
      const defaultCiviliteUuid = civilites.length > 0 ? civilites[0].uuid : "";
      const userRole = roles.find((r) => r.name === "Utilisateur");
      const defaultRoleUuid = userRole
        ? userRole.uuid
        : roles.length > 0
          ? roles[0].uuid
          : "";

      setFormData({
        nom: "",
        prenoms: "",
        email: "",
        telephone: "",
        civilite_uuid: defaultCiviliteUuid,
        role_uuid: defaultRoleUuid,
        est_verifie: false,
        est_bloque: false,
        is_admin: false,
        password: "",
        confirmPassword: "",
      });

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
      console.error("❌ Erreur lors de la création:", err);

      let errorMessage = "Erreur lors de la création de l'utilisateur";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Gestion spécifique des erreurs
      if (err.response?.status === 400) {
        errorMessage = "Données invalides. Vérifiez les informations saisies.";
      } else if (err.response?.status === 409) {
        errorMessage =
          "Un utilisateur avec cet email ou téléphone existe déjà.";
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
    const defaultCiviliteUuid = civilites.length > 0 ? civilites[0].uuid : "";
    const userRole = roles.find((r) => r.name === "Utilisateur");
    const defaultRoleUuid = userRole
      ? userRole.uuid
      : roles.length > 0
        ? roles[0].uuid
        : "";

    setFormData({
      nom: "",
      prenoms: "",
      email: "",
      telephone: "",
      civilite_uuid: defaultCiviliteUuid,
      role_uuid: defaultRoleUuid,
      est_verifie: false,
      est_bloque: false,
      is_admin: false,
      password: "",
      confirmPassword: "",
    });
    setError(null);
    setSuccessMessage(null);
    setValidationErrors({});
  };

  // Fermer la modal
  const handleClose = () => {
    if (loading) return;

    if (
      formData.nom ||
      formData.prenoms ||
      formData.email ||
      formData.password
    ) {
      if (
        !confirm(
          "Vous avez des modifications non sauvegardées. Voulez-vous vraiment annuler ?",
        )
      ) {
        return;
      }
    }

    onClose();
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

  // Si la modal n'est pas ouverte, ne rien afficher
  if (!isOpen) return null;

  const passwordStrength = getPasswordStrength();

  // DEBUG: Afficher le contenu des options dans la console
  console.log("DEBUG - Current state:", {
    civilitesCount: civilites.length,
    rolesCount: roles.length,
    civilites: civilites,
    roles: roles,
    loadingOptions,
    error,
  });

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(2px)",
      }}
      role="dialog"
      aria-labelledby="createUserModalLabel"
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
                <FontAwesomeIcon icon={faUserPlus} className="fs-5" />
              </div>
              <div>
                <h5
                  className="modal-title mb-0 fw-bold"
                  id="createUserModalLabel"
                >
                  Créer un Nouvel Utilisateur
                </h5>
                <p className="mb-0 opacity-75 fs-14">
                  Remplissez les informations pour créer un nouvel utilisateur
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
                  style={{ color: colors.oskar.green }}
                  role="status"
                >
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-3 text-muted">Chargement des options...</p>
              </div>
            ) : civilites.length === 0 || roles.length === 0 ? (
              <div className="text-center py-5">
                <div
                  className="alert alert-warning mx-auto"
                  style={{ maxWidth: "500px" }}
                >
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className="fs-1 mb-3 text-warning"
                  />
                  <h5 className="alert-heading">Options non disponibles</h5>
                  <p className="mb-3">
                    {civilites.length === 0 && roles.length === 0
                      ? "Impossible de charger les civilités et rôles. Vérifiez votre connexion."
                      : civilites.length === 0
                        ? "Impossible de charger les civilités."
                        : "Impossible de charger les rôles."}
                  </p>
                  <div className="d-flex gap-2 justify-content-center">
                    <button
                      className="btn btn-warning"
                      onClick={loadOptions}
                      disabled={loadingOptions}
                    >
                      <FontAwesomeIcon icon={faRefresh} className="me-2" />
                      Réessayer
                    </button>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={handleClose}
                    >
                      <FontAwesomeIcon icon={faTimes} className="me-2" />
                      Fermer
                    </button>
                  </div>
                </div>
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
                        style={{ backgroundColor: `${colors.oskar.green}15` }}
                      >
                        <FontAwesomeIcon
                          icon={faIdCard}
                          style={{ color: colors.oskar.green }}
                        />
                      </div>
                      <div>
                        <h6
                          className="mb-0 fw-bold"
                          style={{ color: colors.oskar.green }}
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
                            <option value="">Sélectionner...</option>
                            {civilites.map((civilite) => (
                              <option key={civilite.uuid} value={civilite.uuid}>
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
                        <label htmlFor="nom" className="form-label fw-semibold">
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
                    style={styles.sectionHeader}
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
                          <FontAwesomeIcon icon={faEnvelope} className="me-2" />
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
                            placeholder="+225 00 00 00 00"
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

                {/* Section 3: Rôle et statut */}
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
                        style={{ backgroundColor: `${colors.oskar.orange}15` }}
                      >
                        <FontAwesomeIcon
                          icon={faShield}
                          style={{ color: colors.oskar.orange }}
                        />
                      </div>
                      <div>
                        <h6
                          className="mb-0 fw-bold"
                          style={{ color: colors.oskar.orange }}
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
                            disabled={loading}
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

                      {/* Options de statut */}
                      <div className="col-md-6">
                        <div className="d-flex flex-column gap-3">
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
                                  icon={faUser}
                                  style={{ color: colors.oskar.green }}
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
                                disabled={loading}
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
                                disabled={loading}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 4: Sécurité */}
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
                          Définir le mot de passe de connexion
                        </small>
                      </div>
                    </div>
                  </div>
                  <div className="card-body p-4">
                    <div className="row g-4">
                      {/* Mot de passe */}
                      <div className="col-md-6">
                        <label
                          htmlFor="password"
                          className="form-label fw-semibold"
                        >
                          <FontAwesomeIcon icon={faKey} className="me-2" />
                          Mot de passe <span className="text-danger">*</span>
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
                              <small style={{ color: passwordStrength.color }}>
                                {passwordStrength.label}
                              </small>
                            </div>
                            <div className="progress" style={{ height: "6px" }}>
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
                            disabled={loading}
                            style={{
                              background: `${colors.oskar.green}10`,
                              color: colors.oskar.green,
                              border: `1px solid ${colors.oskar.green}30`,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = `${colors.oskar.green}20`;
                              e.currentTarget.style.borderColor =
                                colors.oskar.green;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = `${colors.oskar.green}10`;
                              e.currentTarget.style.borderColor = `${colors.oskar.green}30`;
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
                            disabled={loading}
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            disabled={loading}
                            aria-label={
                              showConfirmPassword
                                ? "Cacher la confirmation"
                                : "Afficher la confirmation"
                            }
                          >
                            <FontAwesomeIcon
                              icon={showConfirmPassword ? faEyeSlash : faEye}
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
                                  formData.password === formData.confirmPassword
                                    ? faCheckCircle
                                    : faExclamationTriangle
                                }
                              />
                              <small className="fw-semibold">
                                {formData.password === formData.confirmPassword
                                  ? "Les mots de passe correspondent"
                                  : "Les mots de passe ne correspondent pas"}
                              </small>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
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
                onMouseEnter={(e) => {
                  Object.assign(
                    e.currentTarget.style,
                    styles.secondaryButtonHover,
                  );
                }}
                onMouseLeave={(e) => {
                  Object.assign(e.currentTarget.style, styles.secondaryButton);
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
                    e.currentTarget.style.background = colors.oskar.grey + "15";
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
                  disabled={
                    loading ||
                    loadingOptions ||
                    civilites.length === 0 ||
                    roles.length === 0
                  }
                  style={styles.primaryButton}
                  onMouseEnter={(e) => {
                    Object.assign(
                      e.currentTarget.style,
                      styles.primaryButtonHover,
                    );
                  }}
                  onMouseLeave={(e) => {
                    Object.assign(e.currentTarget.style, styles.primaryButton);
                  }}
                >
                  {loading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSave} />
                      Créer l'Utilisateur
                    </>
                  )}
                </button>
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
          border-color: ${colors.oskar.green};
          box-shadow: 0 0 0 0.25rem ${colors.oskar.green}25;
        }

        .form-check-input:checked {
          background-color: ${colors.oskar.green};
          border-color: ${colors.oskar.green};
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
    </div>
  );
}
