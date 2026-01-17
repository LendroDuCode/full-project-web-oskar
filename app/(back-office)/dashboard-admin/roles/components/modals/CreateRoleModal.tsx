// app/(back-office)/dashboard-admin/roles/components/modals/CreateRoleModal.tsx
"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faShield,
  faSave,
  faCheckCircle,
  faExclamationTriangle,
  faSpinner,
  faKey,
  faLock,
  faUserShield,
  faCog,
  faTags,
  faPlus,
  faRefresh,
  faEye,
  faEyeSlash,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useRoles } from "@/hooks/useRoles";
import colors from "@/app/shared/constants/colors";

// Types
interface FormData {
  name: string;
  feature: string;
  description: string;
  is_default: boolean;
  permissions: string[];
  status: string;
}

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Permissions disponibles
const AVAILABLE_PERMISSIONS = [
  // Gestion des utilisateurs
  { id: "users.read", label: "Lire les utilisateurs", category: "users" },
  { id: "users.create", label: "Créer des utilisateurs", category: "users" },
  { id: "users.update", label: "Modifier les utilisateurs", category: "users" },
  {
    id: "users.delete",
    label: "Supprimer des utilisateurs",
    category: "users",
  },
  { id: "users.block", label: "Bloquer des utilisateurs", category: "users" },

  // Gestion des rôles
  { id: "roles.read", label: "Lire les rôles", category: "roles" },
  { id: "roles.create", label: "Créer des rôles", category: "roles" },
  { id: "roles.update", label: "Modifier les rôles", category: "roles" },
  { id: "roles.delete", label: "Supprimer des rôles", category: "roles" },

  // Gestion des agents
  { id: "agents.read", label: "Lire les agents", category: "agents" },
  { id: "agents.create", label: "Créer des agents", category: "agents" },
  { id: "agents.update", label: "Modifier des agents", category: "agents" },
  { id: "agents.delete", label: "Supprimer des agents", category: "agents" },

  // Gestion des vendeurs
  { id: "vendeurs.read", label: "Lire les vendeurs", category: "vendeurs" },
  { id: "vendeurs.create", label: "Créer des vendeurs", category: "vendeurs" },
  {
    id: "vendeurs.update",
    label: "Modifier des vendeurs",
    category: "vendeurs",
  },
  {
    id: "vendeurs.delete",
    label: "Supprimer des vendeurs",
    category: "vendeurs",
  },

  // Administration
  {
    id: "admin.dashboard",
    label: "Accès au tableau de bord",
    category: "admin",
  },
  { id: "admin.settings", label: "Paramètres système", category: "admin" },
  { id: "admin.reports", label: "Voir les rapports", category: "admin" },
  { id: "admin.export", label: "Exporter des données", category: "admin" },
];

export default function CreateRoleModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateRoleModalProps) {
  // États du formulaire
  const [formData, setFormData] = useState<FormData>({
    name: "",
    feature: "actif",
    description: "",
    is_default: false,
    permissions: [],
    status: "actif",
  });

  // États de chargement et erreurs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Styles personnalisés avec les couleurs Oskar
  const styles = {
    modalHeader: {
      background: `linear-gradient(135deg, ${colors.oskar.blue} 0%, ${colors.oskar.blueHover} 100%)`,
      borderBottom: `3px solid ${colors.oskar.orange}`,
    },
    sectionHeader: {
      background: colors.oskar.lightGrey,
      borderLeft: `4px solid ${colors.oskar.blue}`,
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
      background: colors.oskar.blue,
      borderColor: colors.oskar.blue,
    },
    primaryButtonHover: {
      background: colors.oskar.blueHover,
      borderColor: colors.oskar.blueHover,
    },
    secondaryButton: {
      background: "white",
      color: colors.oskar.blue,
      borderColor: colors.oskar.blue,
    },
    secondaryButtonHover: {
      background: colors.oskar.lightGrey,
      color: colors.oskar.blueHover,
      borderColor: colors.oskar.blueHover,
    },
  };

  // Réinitialiser le formulaire quand la modal s'ouvre/ferme
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: "",
        feature: "actif",
        description: "",
        is_default: false,
        permissions: [],
        status: "actif",
      });
      setError(null);
      setSuccessMessage(null);
      setValidationErrors({});
    }
  }, [isOpen]);

  // Validation du formulaire
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validation des champs obligatoires
    if (!formData.name.trim()) {
      errors.name = "Le nom du rôle est obligatoire";
    } else if (formData.name.trim().length < 3) {
      errors.name = "Le nom doit contenir au moins 3 caractères";
    }

    if (!formData.feature.trim()) {
      errors.feature = "La feature est obligatoire";
    }

    if (formData.description && formData.description.length > 500) {
      errors.description = "La description ne peut pas dépasser 500 caractères";
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

  // Gestion des permissions
  const handlePermissionChange = (permissionId: string) => {
    setFormData((prev) => {
      const newPermissions = prev.permissions.includes(permissionId)
        ? prev.permissions.filter((id) => id !== permissionId)
        : [...prev.permissions, permissionId];

      return {
        ...prev,
        permissions: newPermissions,
      };
    });
  };

  // Sélectionner toutes les permissions d'une catégorie
  const selectAllPermissions = (category: string) => {
    const categoryPermissions = AVAILABLE_PERMISSIONS.filter(
      (p) => p.category === category,
    ).map((p) => p.id);

    setFormData((prev) => {
      const allSelected = categoryPermissions.every((id) =>
        prev.permissions.includes(id),
      );

      const newPermissions = allSelected
        ? prev.permissions.filter((id) => !categoryPermissions.includes(id))
        : [...new Set([...prev.permissions, ...categoryPermissions])];

      return {
        ...prev,
        permissions: newPermissions,
      };
    });
  };

  // Sélectionner toutes les permissions
  const selectAllPermissionsToggle = () => {
    const allPermissionIds = AVAILABLE_PERMISSIONS.map((p) => p.id);
    const allSelected = allPermissionIds.every((id) =>
      formData.permissions.includes(id),
    );

    setFormData((prev) => ({
      ...prev,
      permissions: allSelected ? [] : allPermissionIds,
    }));
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
      const roleData = {
        name: formData.name.trim(),
        feature: formData.feature.trim(),
        description: formData.description.trim() || null,
        is_default: formData.is_default,
        permissions: formData.permissions,
        status: formData.status,
        // Valeurs par défaut selon votre API
        is_deleted: false,
        deleted_at: null,
      };

      console.log("📤 Envoi des données pour création de rôle:", roleData);

      setSuccessMessage("Rôle créé avec succès !");

      // Réinitialiser le formulaire
      setFormData({
        name: "",
        feature: "actif",
        description: "",
        is_default: false,
        permissions: [],
        status: "actif",
      });

      // Appeler le callback de succès
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
          onClose(); // Fermer la modal après succès
        }, 1500);
      } else {
        // Fermer la modal après 2 secondes
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err: any) {
      console.error("❌ Erreur lors de la création du rôle:", err);

      let errorMessage = "Erreur lors de la création du rôle";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Gestion spécifique des erreurs
      if (err.response?.status === 400) {
        errorMessage = "Données invalides. Vérifiez les informations saisies.";
      } else if (err.response?.status === 409) {
        errorMessage = "Un rôle avec ce nom existe déjà.";
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
    setFormData({
      name: "",
      feature: "actif",
      description: "",
      is_default: false,
      permissions: [],
      status: "actif",
    });
    setError(null);
    setSuccessMessage(null);
    setValidationErrors({});
  };

  // Fermer la modal
  const handleClose = () => {
    if (loading) return; // Empêcher la fermeture pendant le chargement

    if (
      formData.name ||
      formData.description ||
      formData.permissions.length > 0
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

  // Grouper les permissions par catégorie
  const permissionsByCategory = AVAILABLE_PERMISSIONS.reduce(
    (acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    },
    {} as Record<string, typeof AVAILABLE_PERMISSIONS>,
  );

  // Si la modal n'est pas ouverte, ne rien afficher
  if (!isOpen) return null;

  return (
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
                <FontAwesomeIcon icon={faShield} className="fs-5" />
              </div>
              <div>
                <h5 className="modal-title mb-0 fw-bold">
                  Créer un Nouveau Rôle
                </h5>
                <p className="mb-0 opacity-75 fs-14">
                  Définissez un nouveau rôle avec ses permissions
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

            <form onSubmit={handleSubmit}>
              {/* Section 1: Informations de base */}
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
                        icon={faShield}
                        style={{ color: colors.oskar.blue }}
                      />
                    </div>
                    <div>
                      <h6
                        className="mb-0 fw-bold"
                        style={{ color: colors.oskar.blue }}
                      >
                        Informations du Rôle
                      </h6>
                      <small className="text-muted">
                        Les champs marqués d'un * sont obligatoires
                      </small>
                    </div>
                  </div>
                </div>
                <div className="card-body p-4">
                  <div className="row g-3">
                    {/* Nom du rôle */}
                    <div className="col-md-6">
                      <label htmlFor="name" className="form-label fw-semibold">
                        Nom du Rôle <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <FontAwesomeIcon
                            icon={faShield}
                            className="text-muted"
                          />
                        </span>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          className={`form-control border-start-0 ps-0 ${validationErrors.name ? "is-invalid" : ""}`}
                          placeholder="Ex: Gestionnaire, Modérateur..."
                          value={formData.name}
                          onChange={handleChange}
                          disabled={loading}
                        />
                      </div>
                      {validationErrors.name && (
                        <div className="invalid-feedback d-block">
                          {validationErrors.name}
                        </div>
                      )}
                    </div>

                    {/* Feature */}
                    <div className="col-md-6">
                      <label
                        htmlFor="feature"
                        className="form-label fw-semibold"
                      >
                        Feature <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <FontAwesomeIcon
                            icon={faCog}
                            className="text-muted"
                          />
                        </span>
                        <input
                          type="text"
                          id="feature"
                          name="feature"
                          className={`form-control border-start-0 ps-0 ${validationErrors.feature ? "is-invalid" : ""}`}
                          placeholder="Ex: actif, gestion, moderation"
                          value={formData.feature}
                          onChange={handleChange}
                          disabled={loading}
                        />
                      </div>
                      {validationErrors.feature && (
                        <div className="invalid-feedback d-block">
                          {validationErrors.feature}
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="col-12">
                      <label
                        htmlFor="description"
                        className="form-label fw-semibold"
                      >
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        className={`form-control ${validationErrors.description ? "is-invalid" : ""}`}
                        placeholder="Décrivez le rôle, ses responsabilités et ses limites..."
                        value={formData.description}
                        onChange={handleChange}
                        disabled={loading}
                        rows={3}
                        style={{ borderRadius: "8px" }}
                      />
                      <div className="d-flex justify-content-between mt-1">
                        <small className="text-muted">
                          Optionnel - Maximum 500 caractères
                        </small>
                        <small
                          className={
                            formData.description.length > 500
                              ? "text-danger"
                              : "text-muted"
                          }
                        >
                          {formData.description.length}/500
                        </small>
                      </div>
                      {validationErrors.description && (
                        <div className="invalid-feedback d-block">
                          {validationErrors.description}
                        </div>
                      )}
                    </div>

                    {/* Statut */}
                    <div className="col-md-6">
                      <label
                        htmlFor="status"
                        className="form-label fw-semibold"
                      >
                        Statut du Rôle
                      </label>
                      <select
                        id="status"
                        name="status"
                        className="form-select"
                        value={formData.status}
                        onChange={handleChange}
                        disabled={loading}
                        style={{ borderRadius: "8px" }}
                      >
                        <option value="actif">Actif</option>
                        <option value="inactif">Inactif</option>
                        <option value="development">En développement</option>
                        <option value="archived">Archivé</option>
                      </select>
                    </div>

                    {/* Rôle par défaut */}
                    <div className="col-md-6">
                      <div
                        className="d-flex align-items-center justify-content-between p-3 rounded"
                        style={{
                          backgroundColor: `${colors.oskar.lightGrey}50`,
                          marginTop: "28px",
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
                              icon={faUserShield}
                              style={{ color: colors.oskar.green }}
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="is_default"
                              className="form-check-label fw-semibold"
                            >
                              Rôle par défaut
                            </label>
                            <p className="mb-0 text-muted fs-12">
                              Attribué automatiquement aux nouveaux utilisateurs
                            </p>
                          </div>
                        </div>
                        <div className="form-check form-switch">
                          <input
                            type="checkbox"
                            id="is_default"
                            name="is_default"
                            className="form-check-input"
                            style={{ width: "3em", height: "1.5em" }}
                            checked={formData.is_default}
                            onChange={handleChange}
                            disabled={loading}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Permissions */}
              <div
                className="card border-0 shadow-sm mb-4"
                style={{ borderRadius: "12px" }}
              >
                <div
                  className="card-header border-0 py-3"
                  style={styles.sectionHeader}
                >
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <div
                        className="rounded-circle p-2 me-3"
                        style={{ backgroundColor: `${colors.oskar.orange}15` }}
                      >
                        <FontAwesomeIcon
                          icon={faLock}
                          style={{ color: colors.oskar.orange }}
                        />
                      </div>
                      <div>
                        <h6
                          className="mb-0 fw-bold"
                          style={{ color: colors.oskar.orange }}
                        >
                          Permissions
                        </h6>
                        <small className="text-muted">
                          Sélectionnez les permissions accordées à ce rôle
                        </small>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm d-flex align-items-center gap-2"
                      onClick={selectAllPermissionsToggle}
                      style={{
                        background: `${colors.oskar.blue}10`,
                        color: colors.oskar.blue,
                        border: `1px solid ${colors.oskar.blue}30`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `${colors.oskar.blue}20`;
                        e.currentTarget.style.borderColor = colors.oskar.blue;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = `${colors.oskar.blue}10`;
                        e.currentTarget.style.borderColor = `${colors.oskar.blue}30`;
                      }}
                    >
                      <FontAwesomeIcon icon={faCheckCircle} />
                      {formData.permissions.length ===
                      AVAILABLE_PERMISSIONS.length
                        ? "Tout désélectionner"
                        : "Tout sélectionner"}
                    </button>
                  </div>
                </div>
                <div className="card-body p-4">
                  {/* Indicateur de sélection */}
                  <div
                    className="alert alert-info mb-4 border-0"
                    style={{
                      borderRadius: "8px",
                      backgroundColor: `${colors.oskar.blue}10`,
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <FontAwesomeIcon
                        icon={faInfoCircle}
                        className="me-2"
                        style={{ color: colors.oskar.blue }}
                      />
                      <small>
                        <strong>{formData.permissions.length}</strong>{" "}
                        permission(s) sélectionnée(s)
                      </small>
                    </div>
                  </div>

                  {/* Permissions par catégorie */}
                  <div className="row g-4">
                    {Object.entries(permissionsByCategory).map(
                      ([category, permissions]) => (
                        <div key={category} className="col-md-6">
                          <div
                            className="card border-0 shadow-sm h-100"
                            style={{ borderRadius: "10px" }}
                          >
                            <div
                              className="card-header border-0 py-2"
                              style={{
                                backgroundColor: `${colors.oskar.lightGrey}70`,
                              }}
                            >
                              <div className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center">
                                  <FontAwesomeIcon
                                    icon={faTags}
                                    className="me-2 fs-12"
                                    style={{ color: colors.oskar.grey }}
                                  />
                                  <span className="fw-semibold text-capitalize">
                                    {category}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  className="btn btn-sm p-0"
                                  onClick={() => selectAllPermissions(category)}
                                  style={{
                                    color: colors.oskar.blue,
                                    fontSize: "11px",
                                  }}
                                >
                                  {permissions.every((p) =>
                                    formData.permissions.includes(p.id),
                                  )
                                    ? "Désélectionner tout"
                                    : "Sélectionner tout"}
                                </button>
                              </div>
                            </div>
                            <div className="card-body p-3">
                              <div className="d-flex flex-column gap-2">
                                {permissions.map((permission) => (
                                  <div
                                    key={permission.id}
                                    className="form-check d-flex align-items-center p-2 rounded"
                                    style={{
                                      backgroundColor:
                                        formData.permissions.includes(
                                          permission.id,
                                        )
                                          ? `${colors.oskar.blue}10`
                                          : `${colors.oskar.lightGrey}30`,
                                      border: `1px solid ${formData.permissions.includes(permission.id) ? colors.oskar.blue + "30" : colors.oskar.lightGrey}`,
                                      transition: "all 0.3s ease",
                                      cursor: "pointer",
                                    }}
                                    onClick={() =>
                                      handlePermissionChange(permission.id)
                                    }
                                  >
                                    <input
                                      type="checkbox"
                                      id={`permission-${permission.id}`}
                                      className="form-check-input me-3"
                                      checked={formData.permissions.includes(
                                        permission.id,
                                      )}
                                      onChange={() =>
                                        handlePermissionChange(permission.id)
                                      }
                                      disabled={loading}
                                      style={{ cursor: "pointer" }}
                                    />
                                    <label
                                      htmlFor={`permission-${permission.id}`}
                                      className="form-check-label flex-grow-1"
                                      style={{
                                        cursor: "pointer",
                                        fontSize: "13px",
                                        fontWeight:
                                          formData.permissions.includes(
                                            permission.id,
                                          )
                                            ? "500"
                                            : "400",
                                      }}
                                    >
                                      {permission.label}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>

                  {/* Aperçu des permissions sélectionnées */}
                  {formData.permissions.length > 0 && (
                    <div className="mt-4">
                      <h6
                        className="fw-semibold mb-2"
                        style={{ color: colors.oskar.green }}
                      >
                        <FontAwesomeIcon icon={faEye} className="me-2" />
                        Aperçu des permissions sélectionnées
                      </h6>
                      <div className="d-flex flex-wrap gap-2">
                        {formData.permissions.map((permissionId) => {
                          const permission = AVAILABLE_PERMISSIONS.find(
                            (p) => p.id === permissionId,
                          );
                          return permission ? (
                            <span
                              key={permissionId}
                              className="badge d-flex align-items-center gap-1 py-2 px-3"
                              style={{
                                backgroundColor: `${colors.oskar.green}10`,
                                color: colors.oskar.green,
                                border: `1px solid ${colors.oskar.green}30`,
                                borderRadius: "20px",
                              }}
                            >
                              <FontAwesomeIcon
                                icon={faCheckCircle}
                                className="fs-12"
                              />
                              {permission.label}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Pied de la modal */}
          <div className="modal-footer border-top-0 py-4 px-4">
            <div className="d-flex justify-content-between w-100">
              <button
                type="button"
                className="btn d-flex align-items-center gap-2"
                onClick={handleReset}
                disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
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
                      Créer le Rôle
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
        .form-select,
        textarea {
          border-radius: 8px !important;
          transition: all 0.3s ease;
        }

        .form-control:focus,
        .form-select:focus,
        textarea:focus {
          border-color: ${colors.oskar.blue};
          box-shadow: 0 0 0 0.25rem ${colors.oskar.blue}25;
        }

        .form-check-input:checked {
          background-color: ${colors.oskar.blue};
          border-color: ${colors.oskar.blue};
        }

        .btn {
          border-radius: 8px !important;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .input-group-text {
          border-radius: 8px 0 0 8px !important;
        }

        .badge {
          border-radius: 20px !important;
          font-weight: 500;
        }

        .fs-12 {
          font-size: 12px !important;
        }

        .fs-13 {
          font-size: 13px !important;
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
