// app/(back-office)/dashboard-admin/civilites/components/modals/EditCiviliteModal.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faIdCard,
  faSave,
  faUser,
  faCheckCircle,
  faExclamationTriangle,
  faSpinner,
  faLanguage,
  faGlobe,
  faShield,
  faInfoCircle,
  faHistory,
  faCalendarAlt,
  faKey,
  faSync,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";

// Types
// types/civilite.ts
export interface Civilite {
  id: number;
  uuid: string;
  statut: string;
  slug: string;
  libelle: string;
  adminUuid: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  is_deleted: boolean;
  deleted_at: string | null | undefined;
  description?: string;
  code?: string | null;
  libelle_court?: string;
  ordre?: number;
}

interface FormData {
  libelle: string;
  slug: string;
  statut: string;
  description?: string;
  code?: string;
  libelle_court?: string;
  ordre?: number;
}

interface EditCiviliteModalProps {
  isOpen: boolean;
  civilite: Civilite | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EditCiviliteModal({
  isOpen,
  civilite,
  onClose,
  onSuccess,
}: EditCiviliteModalProps) {
  // États du formulaire
  const [formData, setFormData] = useState<FormData>({
    libelle: "",
    slug: "",
    statut: "actif",
    description: "",
    code: "",
    libelle_court: "",
    ordre: 0,
  });

  // États de chargement et erreurs
  const [loading, setLoading] = useState(false);
  const [loadingCivilite, setLoadingCivilite] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // États pour les informations de la civilité
  const [civiliteInfo, setCiviliteInfo] = useState<Civilite | null>(null);

  // Styles personnalisés
  const styles = {
    modalHeader: {
      background: `linear-gradient(135deg, ${colors.oskar.orange} 0%, ${colors.oskar.orangeHover} 100%)`,
      borderBottom: `3px solid ${colors.oskar.blue}`,
    },
    sectionHeader: {
      background: colors.oskar.lightGrey,
      borderLeft: `4px solid ${colors.oskar.orange}`,
    },
    infoSection: {
      background: colors.oskar.lightGrey,
      borderLeft: `4px solid ${colors.oskar.green}`,
    },
    primaryButton: {
      background: colors.oskar.orange,
      borderColor: colors.oskar.orange,
    },
    primaryButtonHover: {
      background: colors.oskar.orangeHover,
      borderColor: colors.oskar.orangeHover,
    },
    secondaryButton: {
      background: "white",
      color: colors.oskar.orange,
      borderColor: colors.oskar.orange,
    },
    secondaryButtonHover: {
      background: colors.oskar.lightGrey,
      color: colors.oskar.orangeHover,
      borderColor: colors.oskar.orangeHover,
    },
  };

  // Formater la date
  const formatDate = useCallback((dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Date invalide";
      return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return "N/A";
    }
  }, []);

  // Charger les données de la civilité quand elle change
  useEffect(() => {
    if (!isOpen || !civilite) return;

    const loadCiviliteData = async () => {
      try {
        setLoadingCivilite(true);
        setError(null);
        setSuccessMessage(null);
        setValidationErrors({});

        // Récupérer les données complètes de la civilité
        const response = await api.get<Civilite>(
          API_ENDPOINTS.CIVILITES.DETAIL(civilite.uuid),
        );

        if (response) {
          setCiviliteInfo(response);
          setFormData({
            libelle: response.libelle || "",
            slug: response.slug || "",
            statut: response.statut || "actif",
            description: response.description || "",
            code: response.code || "",
            libelle_court: response.libelle_court || "",
            ordre: response.ordre || 0,
          });
        } else {
          // Utiliser les données de base si l'API ne répond pas
          setCiviliteInfo(civilite);
          setFormData({
            libelle: civilite.libelle || "",
            slug: civilite.slug || "",
            statut: civilite.statut || "actif",
            description: civilite.description || "",
            code: civilite.code || "",
            libelle_court: civilite.libelle_court || "",
            ordre: civilite.ordre || 0,
          });
        }
      } catch (err: any) {
        console.error("Erreur lors du chargement des données:", err);
        setError("Impossible de charger les données de la civilité");

        // Utiliser les données de base en cas d'erreur
        setCiviliteInfo(civilite);
        setFormData({
          libelle: civilite.libelle || "",
          slug: civilite.slug || "",
          statut: civilite.statut || "actif",
          description: civilite.description || "",
          code: civilite.code || "",
          libelle_court: civilite.libelle_court || "",
          ordre: civilite.ordre || 0,
        });
      } finally {
        setLoadingCivilite(false);
      }
    };

    loadCiviliteData();
  }, [isOpen, civilite]);

  // Réinitialiser les messages d'erreur quand la modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccessMessage(null);
      setValidationErrors({});
    }
  }, [isOpen]);

  // Générer le slug à partir du libellé
  const generateSlug = useCallback((libelle: string) => {
    return libelle
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50);
  }, []);

  // Validation du formulaire
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validation des champs obligatoires
    if (!formData.libelle.trim()) {
      errors.libelle = "Le libellé est obligatoire";
    } else if (formData.libelle.length < 2) {
      errors.libelle = "Le libellé doit contenir au moins 2 caractères";
    } else if (formData.libelle.length > 100) {
      errors.libelle = "Le libellé ne doit pas dépasser 100 caractères";
    }

    if (!formData.slug.trim()) {
      errors.slug = "Le slug est obligatoire";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug =
        "Le slug ne doit contenir que des lettres minuscules, chiffres et tirets";
    }

    if (!formData.statut) {
      errors.statut = "Le statut est obligatoire";
    }

    if (formData.code && formData.code.length > 10) {
      errors.code = "Le code ne doit pas dépasser 10 caractères";
    }

    if (formData.libelle_court && formData.libelle_court.length > 20) {
      errors.libelle_court =
        "Le libellé court ne doit pas dépasser 20 caractères";
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
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "ordre" ? (value ? parseInt(value) || 0 : 0) : value,
    }));

    // Générer automatiquement le slug si c'est le libellé qui change
    if (name === "libelle" && !formData.slug) {
      const generatedSlug = generateSlug(value);
      setFormData((prev) => ({
        ...prev,
        slug: generatedSlug,
      }));
    }

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

    if (!civilite || !civilite.uuid) {
      setError("Aucune civilité sélectionnée");
      return;
    }

    if (!validateForm()) {
      setError("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      // Préparer les données pour l'API
      const civiliteData = {
        libelle: formData.libelle.trim(),
        slug: formData.slug.trim().toLowerCase(),
        statut: formData.statut,
        description: formData.description?.trim() || null,
        code: formData.code?.trim() || null,
        libelle_court: formData.libelle_court?.trim() || null,
        ordre: formData.ordre || 0,
      };

      // Appel à l'API pour la mise à jour
      await api.put(
        API_ENDPOINTS.CIVILITES.UPDATE(civilite.uuid),
        civiliteData,
      );

      setSuccessMessage("Civilité modifiée avec succès !");

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
      let errorMessage = "Erreur lors de la modification de la civilité";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      if (err.response?.status === 400) {
        errorMessage = "Données invalides. Vérifiez les informations saisies.";
      } else if (err.response?.status === 404) {
        errorMessage = "Civilité non trouvée.";
      } else if (err.response?.status === 409) {
        errorMessage = "Une civilité avec ce libellé ou slug existe déjà.";
      } else if (err.response?.status === 500) {
        errorMessage = "Erreur serveur. Veuillez réessayer plus tard.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Réinitialiser le formulaire aux valeurs d'origine
  const handleReset = () => {
    if (!civiliteInfo) return;

    setFormData({
      libelle: civiliteInfo.libelle || "",
      slug: civiliteInfo.slug || "",
      statut: civiliteInfo.statut || "actif",
      description: civiliteInfo.description || "",
      code: civiliteInfo.code || "",
      libelle_court: civiliteInfo.libelle_court || "",
      ordre: civiliteInfo.ordre || 0,
    });
    setError(null);
    setSuccessMessage(null);
    setValidationErrors({});
  };

  // Fermer la modal
  const handleClose = () => {
    if (loading || loadingCivilite) return;

    if (
      civiliteInfo &&
      (formData.libelle !== civiliteInfo.libelle ||
        formData.slug !== civiliteInfo.slug ||
        formData.statut !== civiliteInfo.statut ||
        formData.description !== civiliteInfo.description ||
        formData.code !== civiliteInfo.code ||
        formData.libelle_court !== civiliteInfo.libelle_court ||
        formData.ordre !== civiliteInfo.ordre)
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
      role="dialog"
      aria-labelledby="editCiviliteModalLabel"
      aria-modal="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg">
          {/* En-tête de la modal */}
          <div
            className="modal-header text-white border-0 rounded-top-3"
            style={{ backgroundColor: colors.oskar.yellow }}
          >
            <div className="d-flex align-items-center">
              <div className="bg-white bg-opacity-20 rounded-circle p-2 me-3">
                <FontAwesomeIcon icon={faIdCard} className="fs-5" />
              </div>
              <div>
                <h5
                  className="modal-title mb-0 fw-bold"
                  id="editCiviliteModalLabel"
                >
                  Modifier la Civilité
                </h5>
                <p className="mb-0 opacity-75 fs-14">
                  {civilite?.libelle
                    ? `Modification de "${civilite.libelle}"`
                    : "Chargement..."}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={handleClose}
              disabled={loading || loadingCivilite}
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

            {/* Chargement des données */}
            {loadingCivilite ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-3">Chargement des données de la civilité...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Section 1: Informations principales */}
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
                          icon={faIdCard}
                          style={{ color: colors.oskar.orange }}
                        />
                      </div>
                      <div>
                        <h6
                          className="mb-0 fw-bold"
                          style={{ color: colors.oskar.orange }}
                        >
                          Informations Principales
                        </h6>
                        <small className="text-muted">
                          Les champs marqués d'un * sont obligatoires
                        </small>
                      </div>
                    </div>
                  </div>
                  <div className="card-body p-4">
                    <div className="row g-3">
                      {/* Libellé */}
                      <div className="col-md-8">
                        <label
                          htmlFor="libelle"
                          className="form-label fw-semibold"
                        >
                          <FontAwesomeIcon icon={faUser} className="me-2" />
                          Libellé <span className="text-danger">*</span>
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
                            id="libelle"
                            name="libelle"
                            className={`form-control border-start-0 ps-0 ${validationErrors.libelle ? "is-invalid" : ""}`}
                            placeholder="Ex: Monsieur, Madame, Docteur..."
                            value={formData.libelle}
                            onChange={handleChange}
                            disabled={loading}
                            aria-describedby={
                              validationErrors.libelle
                                ? "libelle-error"
                                : undefined
                            }
                          />
                        </div>
                        {validationErrors.libelle && (
                          <div
                            id="libelle-error"
                            className="invalid-feedback d-block"
                          >
                            {validationErrors.libelle}
                          </div>
                        )}
                        <small className="text-muted">
                          Nom complet de la civilité
                        </small>
                      </div>

                      {/* Statut */}
                      <div className="col-md-4">
                        <label
                          htmlFor="statut"
                          className="form-label fw-semibold"
                        >
                          <FontAwesomeIcon icon={faShield} className="me-2" />
                          Statut <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <FontAwesomeIcon
                              icon={faShield}
                              className="text-muted"
                            />
                          </span>
                          <select
                            id="statut"
                            name="statut"
                            className={`form-select border-start-0 ps-0 ${validationErrors.statut ? "is-invalid" : ""}`}
                            value={formData.statut}
                            onChange={handleChange}
                            disabled={loading}
                            style={{ borderRadius: "0 8px 8px 0" }}
                            aria-describedby={
                              validationErrors.statut
                                ? "statut-error"
                                : undefined
                            }
                          >
                            <option value="actif">Actif</option>
                            <option value="inactif">Inactif</option>
                          </select>
                        </div>
                        {validationErrors.statut && (
                          <div
                            id="statut-error"
                            className="invalid-feedback d-block"
                          >
                            {validationErrors.statut}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="row g-3 mt-3">
                      {/* Slug */}
                      <div className="col-md-6">
                        <label
                          htmlFor="slug"
                          className="form-label fw-semibold"
                        >
                          <FontAwesomeIcon icon={faLanguage} className="me-2" />
                          Slug <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <FontAwesomeIcon
                              icon={faLanguage}
                              className="text-muted"
                            />
                          </span>
                          <input
                            type="text"
                            id="slug"
                            name="slug"
                            className={`form-control border-start-0 ps-0 ${validationErrors.slug ? "is-invalid" : ""}`}
                            placeholder="Ex: monsieur, madame, docteur"
                            value={formData.slug}
                            onChange={handleChange}
                            disabled={loading}
                            aria-describedby={
                              validationErrors.slug ? "slug-error" : undefined
                            }
                          />
                        </div>
                        {validationErrors.slug && (
                          <div
                            id="slug-error"
                            className="invalid-feedback d-block"
                          >
                            {validationErrors.slug}
                          </div>
                        )}
                        <small className="text-muted">
                          Version URL-friendly (lettres minuscules, tirets)
                        </small>
                      </div>

                      {/* Code */}
                      <div className="col-md-3">
                        <label
                          htmlFor="code"
                          className="form-label fw-semibold"
                        >
                          <FontAwesomeIcon
                            icon={faInfoCircle}
                            className="me-2"
                          />
                          Code
                        </label>
                        <input
                          type="text"
                          id="code"
                          name="code"
                          className={`form-control ${validationErrors.code ? "is-invalid" : ""}`}
                          placeholder="Ex: M, Mme, Dr"
                          value={formData.code}
                          onChange={handleChange}
                          disabled={loading}
                          aria-describedby={
                            validationErrors.code ? "code-error" : undefined
                          }
                        />
                        {validationErrors.code && (
                          <div
                            id="code-error"
                            className="invalid-feedback d-block"
                          >
                            {validationErrors.code}
                          </div>
                        )}
                        <small className="text-muted">Code abrégé</small>
                      </div>

                      {/* Libellé court */}
                      <div className="col-md-3">
                        <label
                          htmlFor="libelle_court"
                          className="form-label fw-semibold"
                        >
                          <FontAwesomeIcon icon={faUser} className="me-2" />
                          Libellé court
                        </label>
                        <input
                          type="text"
                          id="libelle_court"
                          name="libelle_court"
                          className={`form-control ${validationErrors.libelle_court ? "is-invalid" : ""}`}
                          placeholder="Ex: M., Mme, Dr"
                          value={formData.libelle_court}
                          onChange={handleChange}
                          disabled={loading}
                          aria-describedby={
                            validationErrors.libelle_court
                              ? "libelle-court-error"
                              : undefined
                          }
                        />
                        {validationErrors.libelle_court && (
                          <div
                            id="libelle-court-error"
                            className="invalid-feedback d-block"
                          >
                            {validationErrors.libelle_court}
                          </div>
                        )}
                        <small className="text-muted">Version abrégée</small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Informations supplémentaires */}
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
                          icon={faInfoCircle}
                          style={{ color: colors.oskar.green }}
                        />
                      </div>
                      <div>
                        <h6
                          className="mb-0 fw-bold"
                          style={{ color: colors.oskar.green }}
                        >
                          Informations Supplémentaires
                        </h6>
                        <small className="text-muted">
                          Informations optionnelles pour compléter la civilité
                        </small>
                      </div>
                    </div>
                  </div>
                  <div className="card-body p-4">
                    <div className="row g-3">
                      {/* Description */}
                      <div className="col-md-8">
                        <label
                          htmlFor="description"
                          className="form-label fw-semibold"
                        >
                          <FontAwesomeIcon
                            icon={faInfoCircle}
                            className="me-2"
                          />
                          Description
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          className="form-control"
                          rows={3}
                          placeholder="Description de la civilité (usage, contexte, etc.)"
                          value={formData.description}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        <small className="text-muted">
                          Description optionnelle pour clarifier l'usage
                        </small>
                      </div>

                      {/* Ordre */}
                      <div className="col-md-4">
                        <label
                          htmlFor="ordre"
                          className="form-label fw-semibold"
                        >
                          <FontAwesomeIcon icon={faGlobe} className="me-2" />
                          Ordre d'affichage
                        </label>
                        <input
                          type="number"
                          id="ordre"
                          name="ordre"
                          className="form-control"
                          min="0"
                          placeholder="0"
                          value={formData.ordre}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        <small className="text-muted">
                          Ordre dans les listes déroulantes
                        </small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Informations système (lecture seule) */}
                {civiliteInfo && (
                  <div
                    className="card border-0 shadow-sm mb-4"
                    style={{ borderRadius: "12px" }}
                  >
                    <div
                      className="card-header border-0 py-3"
                      style={styles.infoSection}
                    >
                      <div className="d-flex align-items-center">
                        <div
                          className="rounded-circle p-2 me-3"
                          style={{ backgroundColor: `${colors.oskar.blue}15` }}
                        >
                          <FontAwesomeIcon
                            icon={faInfoCircle}
                            style={{ color: colors.oskar.blue }}
                          />
                        </div>
                        <div>
                          <h6
                            className="mb-0 fw-bold"
                            style={{ color: colors.oskar.blue }}
                          >
                            Informations Système
                          </h6>
                          <small className="text-muted">
                            Informations techniques (lecture seule)
                          </small>
                        </div>
                      </div>
                    </div>
                    <div className="card-body p-4">
                      <div className="row g-3">
                        {/* UUID */}
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">
                            <FontAwesomeIcon icon={faKey} className="me-2" />
                            UUID
                          </label>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-end-0">
                              <FontAwesomeIcon
                                icon={faKey}
                                className="text-muted"
                              />
                            </span>
                            <input
                              type="text"
                              className="form-control border-start-0 ps-0 bg-light"
                              value={civiliteInfo.uuid}
                              readOnly
                              disabled
                              style={{ cursor: "not-allowed" }}
                            />
                          </div>
                          <small className="text-muted">
                            Identifiant unique
                          </small>
                        </div>

                        {/* ID */}
                        <div className="col-md-3">
                          <label className="form-label fw-semibold">
                            <FontAwesomeIcon icon={faIdCard} className="me-2" />
                            ID
                          </label>
                          <input
                            type="text"
                            className="form-control bg-light"
                            value={civiliteInfo.id}
                            readOnly
                            disabled
                            style={{ cursor: "not-allowed" }}
                          />
                          <small className="text-muted">
                            Identifiant numérique
                          </small>
                        </div>

                        {/* Statut suppression */}
                        <div className="col-md-3">
                          <label className="form-label fw-semibold">
                            <FontAwesomeIcon
                              icon={faHistory}
                              className="me-2"
                            />
                            Statut
                          </label>
                          <input
                            type="text"
                            className="form-control bg-light"
                            value={
                              civiliteInfo.is_deleted ? "Supprimé" : "Actif"
                            }
                            readOnly
                            disabled
                            style={{ cursor: "not-allowed" }}
                          />
                          <small className="text-muted">
                            État de suppression
                          </small>
                        </div>
                      </div>

                      <div className="row g-3 mt-3">
                        {/* Date de création */}
                        <div className="col-md-4">
                          <label className="form-label fw-semibold">
                            <FontAwesomeIcon
                              icon={faCalendarAlt}
                              className="me-2"
                            />
                            Créé le
                          </label>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-end-0">
                              <FontAwesomeIcon
                                icon={faCalendarAlt}
                                className="text-muted"
                              />
                            </span>
                            <input
                              type="text"
                              className="form-control border-start-0 ps-0 bg-light"
                              value={formatDate(civiliteInfo.createdAt)}
                              readOnly
                              disabled
                              style={{ cursor: "not-allowed" }}
                            />
                          </div>
                        </div>

                        {/* Date de modification */}
                        <div className="col-md-4">
                          <label className="form-label fw-semibold">
                            <FontAwesomeIcon
                              icon={faHistory}
                              className="me-2"
                            />
                            Modifié le
                          </label>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-end-0">
                              <FontAwesomeIcon
                                icon={faHistory}
                                className="text-muted"
                              />
                            </span>
                            <input
                              type="text"
                              className="form-control border-start-0 ps-0 bg-light"
                              value={formatDate(civiliteInfo.updatedAt)}
                              readOnly
                              disabled
                              style={{ cursor: "not-allowed" }}
                            />
                          </div>
                        </div>

                        {/* Date de suppression */}
                        {civiliteInfo.deleted_at && (
                          <div className="col-md-4">
                            <label className="form-label fw-semibold">
                              <FontAwesomeIcon
                                icon={faTimes}
                                className="me-2"
                              />
                              Supprimé le
                            </label>
                            <div className="input-group">
                              <span className="input-group-text bg-light border-end-0">
                                <FontAwesomeIcon
                                  icon={faTimes}
                                  className="text-muted"
                                />
                              </span>
                              <input
                                type="text"
                                className="form-control border-start-0 ps-0 bg-light"
                                value={formatDate(civiliteInfo.deleted_at)}
                                readOnly
                                disabled
                                style={{ cursor: "not-allowed" }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
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
                disabled={loading || loadingCivilite}
                style={{ backgroundColor: colors.oskar.yellow }}
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
                <FontAwesomeIcon icon={faSync} />
                Réinitialiser
              </button>

              <div className="d-flex gap-3">
                <button
                  type="button"
                  className="btn d-flex align-items-center gap-2"
                  onClick={handleClose}
                  disabled={loading || loadingCivilite}
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
                  type="submit"
                  className="btn text-white d-flex align-items-center gap-2"
                  onClick={handleSubmit}
                  disabled={loading || loadingCivilite}
                  style={{ backgroundColor: colors.oskar.yellow }}
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
                      Modification en cours...
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
          border-color: ${colors.oskar.orange};
          box-shadow: 0 0 0 0.25rem ${colors.oskar.orange}25;
        }

        .btn {
          border-radius: 8px !important;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .input-group-text {
          border-radius: 8px 0 0 8px !important;
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

        .bg-light {
          background-color: #f8f9fa !important;
        }
      `}</style>
    </div>
  );
}
