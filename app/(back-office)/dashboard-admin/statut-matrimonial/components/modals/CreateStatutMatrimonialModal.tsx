// app/(back-office)/dashboard-admin/statuts-matrimoniaux/components/modals/CreateStatutMatrimonialModal.tsx
"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faHeart,
  faSave,
  faCheckCircle,
  faExclamationTriangle,
  faSpinner,
  faTag,
  faCode,
  faFlag,
  faInfoCircle,
  faStar,
  faLanguage,
  faSortNumericDown,
  faRefresh,
  faEye,
  faShield,
  faToggleOn,
  faToggleOff,
  faCrown,
  faCopy,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";

// Types
interface FormData {
  libelle: string;
  code: string;
  description: string;
  statut: "actif" | "inactif";
  is_default: boolean;
  ordre: number;
}

interface CreateStatutMatrimonialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

export default function CreateStatutMatrimonialModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateStatutMatrimonialModalProps) {
  // États du formulaire
  const [formData, setFormData] = useState<FormData>({
    libelle: "",
    code: "",
    description: "",
    statut: "actif",
    is_default: false,
    ordre: 0,
  });

  // États de chargement et erreurs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [generatedSlug, setGeneratedSlug] = useState<string>("");

  // Styles personnalisés avec les couleurs Oskar
  const styles = {
    modalHeader: {
      background: `linear-gradient(135deg, ${colors.oskar.purple} 0%, ${colors.oskar.purpleHover} 100%)`,
      borderBottom: `3px solid ${colors.oskar.pink}`,
    },
    sectionHeader: {
      background: colors.oskar.lightGrey,
      borderLeft: `4px solid ${colors.oskar.purple}`,
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
      background: colors.oskar.purple,
      borderColor: colors.oskar.purple,
    },
    primaryButtonHover: {
      background: colors.oskar.purpleHover,
      borderColor: colors.oskar.purpleHover,
    },
    secondaryButton: {
      background: "white",
      color: colors.oskar.purple,
      borderColor: colors.oskar.purple,
    },
    secondaryButtonHover: {
      background: colors.oskar.lightGrey,
      color: colors.oskar.purpleHover,
      borderColor: colors.oskar.purpleHover,
    },
  };

  // Réinitialiser le formulaire quand la modal s'ouvre/ferme
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        libelle: "",
        code: "",
        description: "",
        statut: "actif",
        is_default: false,
        ordre: 0,
      });
      setGeneratedSlug("");
      setError(null);
      setSuccessMessage(null);
      setValidationErrors({});
    }
  }, [isOpen]);

  // Validation du formulaire
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validation des champs obligatoires
    if (!formData.libelle.trim()) {
      errors.libelle = "Le libellé est obligatoire";
    } else if (formData.libelle.trim().length < 2) {
      errors.libelle = "Le libellé doit contenir au moins 2 caractères";
    }

    if (!formData.code.trim()) {
      errors.code = "Le code est obligatoire";
    } else if (formData.code.trim().length < 2) {
      errors.code = "Le code doit contenir au moins 2 caractères";
    }

    if (formData.description && formData.description.length > 500) {
      errors.description = "La description ne peut pas dépasser 500 caractères";
    }

    if (formData.ordre < 0) {
      errors.ordre = "L'ordre ne peut pas être négatif";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Générer le slug à partir du libellé
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
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

    // Si c'est le libellé qui change, générer automatiquement le slug et le code
    if (name === "libelle" && value.trim().length > 0) {
      const slug = generateSlug(value);
      setGeneratedSlug(slug);

      // Générer automatiquement le code en majuscules
      const code = value
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^A-Z0-9]/g, "_");

      setFormData((prev) => ({
        ...prev,
        code: code.substring(0, 20), // Limiter à 20 caractères
      }));
    }

    // Si c'est le code qui change, le mettre en majuscules
    if (name === "code") {
      setFormData((prev) => ({
        ...prev,
        code: value.toUpperCase(),
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

    if (!validateForm()) {
      setError("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      // Générer le slug final
      const slug = generateSlug(formData.libelle);

      // Préparer les données pour l'API
      const statutData = {
        libelle: formData.libelle.trim(),
        code: formData.code.trim(),
        slug: slug,
        description: formData.description.trim() || null,
        statut: formData.statut,
        is_default: formData.is_default,
        ordre: formData.ordre || 0,
      };

      // Appel à l'API
      const response = await api.post(
        API_ENDPOINTS.STATUTS_MATRIMONIAUX.CREATE,
        statutData,
      );

      if (response && response.uuid) {
        setSuccessMessage("Statut matrimonial créé avec succès !");

        // Réinitialiser le formulaire
        setFormData({
          libelle: "",
          code: "",
          description: "",
          statut: "actif",
          is_default: false,
          ordre: 0,
        });
        setGeneratedSlug("");

        // Appeler le callback de succès
        if (onSuccess) {
          setTimeout(() => {
            onSuccess("Statut matrimonial créé avec succès");
            onClose();
          }, 1500);
        } else {
          setTimeout(() => {
            onClose();
          }, 2000);
        }
      } else {
        throw new Error("Erreur lors de la création");
      }
    } catch (err: any) {
      console.error(
        "❌ Erreur lors de la création du statut matrimonial:",
        err,
      );

      let errorMessage = "Erreur lors de la création du statut matrimonial";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      if (err.response?.status === 400) {
        errorMessage = "Données invalides. Vérifiez les informations saisies.";
      } else if (err.response?.status === 409) {
        errorMessage = "Un statut avec ce libellé existe déjà.";
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
      libelle: "",
      code: "",
      description: "",
      statut: "actif",
      is_default: false,
      ordre: 0,
    });
    setGeneratedSlug("");
    setError(null);
    setSuccessMessage(null);
    setValidationErrors({});
  };

  // Fermer la modal
  const handleClose = () => {
    if (loading) return;

    if (formData.libelle || formData.code || formData.description) {
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

  // Copier le slug dans le presse-papier
  const copySlugToClipboard = () => {
    if (generatedSlug) {
      navigator.clipboard.writeText(generatedSlug);
      alert("Slug copié dans le presse-papier !");
    }
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
    >
      <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg">
          {/* En-tête de la modal */}
          <div
            className="modal-header text-white border-0 rounded-top-3"
            style={{ background: colors.oskar.green }}
          >
            <div className="d-flex align-items-center">
              <div className="bg-white bg-opacity-20 rounded-circle p-2 me-3">
                <FontAwesomeIcon icon={faHeart} className="fs-5" />
              </div>
              <div>
                <h5 className="modal-title mb-0 fw-bold">
                  Créer un Nouveau Statut Matrimonial
                </h5>
                <p className="mb-0 opacity-75 fs-14">
                  Définissez un nouveau statut matrimonial
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
                      style={{ backgroundColor: `${colors.oskar.green}20` }}
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
                      style={{ backgroundColor: `${colors.oskar.green}15` }}
                    >
                      <FontAwesomeIcon
                        icon={faHeart}
                        style={{ color: colors.oskar.green }}
                      />
                    </div>
                    <div>
                      <h6
                        className="mb-0 fw-bold"
                        style={{ color: colors.oskar.green }}
                      >
                        Informations du Statut
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
                    <div className="col-md-6">
                      <label
                        htmlFor="libelle"
                        className="form-label fw-semibold"
                      >
                        Libellé <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <FontAwesomeIcon
                            icon={faHeart}
                            className="text-muted"
                          />
                        </span>
                        <input
                          type="text"
                          id="libelle"
                          name="libelle"
                          className={`form-control border-start-0 ps-0 ${validationErrors.libelle ? "is-invalid" : ""}`}
                          placeholder="Ex: Marié(e), Célibataire, Divorcé(e)..."
                          value={formData.libelle}
                          onChange={handleChange}
                          disabled={loading}
                        />
                      </div>
                      {validationErrors.libelle && (
                        <div className="invalid-feedback d-block">
                          {validationErrors.libelle}
                        </div>
                      )}
                      <small className="text-muted">
                        Nom complet du statut matrimonial
                      </small>
                    </div>

                    {/* Code */}
                    <div className="col-md-6">
                      <label htmlFor="code" className="form-label fw-semibold">
                        Code <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <FontAwesomeIcon
                            icon={faCode}
                            className="text-muted"
                          />
                        </span>
                        <input
                          type="text"
                          id="code"
                          name="code"
                          className={`form-control border-start-0 ps-0 ${validationErrors.code ? "is-invalid" : ""}`}
                          placeholder="Ex: MARIE, CELIBATAIRE, DIVORCE"
                          value={formData.code}
                          onChange={handleChange}
                          disabled={loading}
                        />
                      </div>
                      {validationErrors.code && (
                        <div className="invalid-feedback d-block">
                          {validationErrors.code}
                        </div>
                      )}
                      <small className="text-muted">
                        Code unique en majuscules
                      </small>
                    </div>
                  </div>

                  <div className="row g-3 mt-3">
                    {/* Slug généré */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Slug généré
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
                          className="form-control border-start-0 ps-0 bg-light"
                          value={generatedSlug}
                          readOnly
                          placeholder="Le slug sera généré automatiquement"
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={copySlugToClipboard}
                          disabled={!generatedSlug || loading}
                        >
                          <FontAwesomeIcon icon={faCopy} />
                        </button>
                      </div>
                      <small className="text-muted">
                        Généré automatiquement à partir du libellé
                      </small>
                    </div>

                    {/* Ordre */}
                    <div className="col-md-6">
                      <label htmlFor="ordre" className="form-label fw-semibold">
                        Ordre d'affichage
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <FontAwesomeIcon
                            icon={faSortNumericDown}
                            className="text-muted"
                          />
                        </span>
                        <input
                          type="number"
                          id="ordre"
                          name="ordre"
                          className={`form-control border-start-0 ps-0 ${validationErrors.ordre ? "is-invalid" : ""}`}
                          placeholder="0"
                          value={formData.ordre}
                          onChange={handleChange}
                          min="0"
                          disabled={loading}
                        />
                      </div>
                      {validationErrors.ordre && (
                        <div className="invalid-feedback d-block">
                          {validationErrors.ordre}
                        </div>
                      )}
                      <small className="text-muted">
                        Ordre dans les listes déroulantes
                      </small>
                    </div>
                  </div>

                  <div className="row g-3 mt-3">
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
                        placeholder="Description du statut matrimonial (optionnel)"
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
                  </div>

                  <div className="row g-3 mt-3">
                    {/* Statut */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold d-block">
                        Statut
                      </label>
                      <div className="btn-group w-100" role="group">
                        <button
                          type="button"
                          className={`btn ${formData.statut === "actif" ? "btn-success" : "btn-outline-success"}`}
                          onClick={() =>
                            setFormData({ ...formData, statut: "actif" })
                          }
                          disabled={loading}
                        >
                          <FontAwesomeIcon
                            icon={
                              formData.statut === "actif"
                                ? faToggleOn
                                : faToggleOff
                            }
                            className="me-2"
                          />
                          Actif
                        </button>
                        <button
                          type="button"
                          className={`btn ${formData.statut === "inactif" ? "btn-danger" : "btn-outline-danger"}`}
                          onClick={() =>
                            setFormData({ ...formData, statut: "inactif" })
                          }
                          disabled={loading}
                        >
                          <FontAwesomeIcon
                            icon={
                              formData.statut === "inactif"
                                ? faToggleOn
                                : faToggleOff
                            }
                            className="me-2"
                          />
                          Inactif
                        </button>
                      </div>
                    </div>

                    {/* Statut par défaut */}
                    <div className="col-md-6">
                      <div
                        className="d-flex align-items-center justify-content-between p-3 rounded"
                        style={{
                          backgroundColor: `${colors.oskar.green}50`,
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
                              icon={faCrown}
                              style={{ color: colors.oskar.green }}
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="is_default"
                              className="form-check-label fw-semibold"
                            >
                              Statut par défaut
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
                style={{
                  background: colors.oskar.lightGrey,
                  color: colors.oskar.purple,
                  border: `1px solid ${colors.oskar.purple}`,
                }}
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
                  style={{ background: colors.oskar.green }}
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
                      Créer le Statut
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
          border-color: ${colors.oskar.purple};
          box-shadow: 0 0 0 0.25rem ${colors.oskar.purple}25;
        }

        .form-check-input:checked {
          background-color: ${colors.oskar.purple};
          border-color: ${colors.oskar.purple};
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
