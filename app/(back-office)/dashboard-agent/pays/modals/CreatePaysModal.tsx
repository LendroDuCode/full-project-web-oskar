// app/(back-office)/dashboard-admin/pays/components/modals/CreatePaysModal.tsx
"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faGlobe,
  faSave,
  faFlag,
  faCheckCircle,
  faExclamationTriangle,
  faSpinner,
  faPhone,
  faCode,
  faShield,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";

// Types
interface FormData {
  nom: string;
  code: string;
  indicatif: string;
  statut: string;
}

interface CreatePaysModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreatePaysModal({
  isOpen,
  onClose,
  onSuccess,
}: CreatePaysModalProps) {
  // États du formulaire
  const [formData, setFormData] = useState<FormData>({
    nom: "",
    code: "",
    indicatif: "",
    statut: "actif",
  });

  // États de chargement et erreurs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Styles personnalisés
  const styles = {
    modalHeader: {
      background: `linear-gradient(135deg, ${colors.oskar.green} 0%, ${colors.oskar.greenHover} 100%)`,
      borderBottom: `3px solid ${colors.oskar.blue}`,
    },
    sectionHeader: {
      background: colors.oskar.lightGrey,
      borderLeft: `4px solid ${colors.oskar.green}`,
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

  // Réinitialiser le formulaire quand la modal s'ouvre
  useEffect(() => {
    if (!isOpen) return;

    setFormData({
      nom: "",
      code: "",
      indicatif: "",
      statut: "actif",
    });
    setError(null);
    setSuccessMessage(null);
    setValidationErrors({});
  }, [isOpen]);

  // Validation du formulaire
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validation du nom
    if (!formData.nom.trim()) {
      errors.nom = "Le nom du pays est obligatoire";
    } else if (formData.nom.length < 2) {
      errors.nom = "Le nom doit contenir au moins 2 caractères";
    } else if (formData.nom.length > 100) {
      errors.nom = "Le nom ne doit pas dépasser 100 caractères";
    }

    // Validation du code (ex: FR, US)
    if (!formData.code.trim()) {
      errors.code = "Le code du pays est obligatoire";
    } else if (!/^[A-Z]{2,3}$/.test(formData.code)) {
      errors.code = "Le code doit être composé de 2 ou 3 lettres majuscules";
    }

    // Validation de l'indicatif
    if (!formData.indicatif.trim()) {
      errors.indicatif = "L'indicatif téléphonique est obligatoire";
    } else if (!/^\+\d{1,4}$/.test(formData.indicatif)) {
      errors.indicatif =
        "L'indicatif doit commencer par + suivi de 1 à 4 chiffres";
    }

    if (!formData.statut) {
      errors.statut = "Le statut est obligatoire";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Gestion des changements de formulaire
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    // Conversion automatique en majuscules pour le code
    if (name === "code") {
      setFormData((prev) => ({
        ...prev,
        [name]: value.toUpperCase(),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
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

      // Préparer les données pour l'API
      const paysData = {
        nom: formData.nom.trim(),
        code: formData.code.trim(),
        indicatif: formData.indicatif.trim(),
        statut: formData.statut,
      };

      // Appel à l'API
      await api.post(API_ENDPOINTS.PAYS.CREATE, paysData);

      setSuccessMessage("Pays créé avec succès !");

      // Réinitialiser le formulaire
      setFormData({
        nom: "",
        code: "",
        indicatif: "",
        statut: "actif",
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
      let errorMessage = "Erreur lors de la création du pays";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      if (err.response?.status === 400) {
        errorMessage = "Données invalides. Vérifiez les informations saisies.";
      } else if (err.response?.status === 409) {
        errorMessage = "Un pays avec ce nom ou ce code existe déjà.";
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
      nom: "",
      code: "",
      indicatif: "",
      statut: "actif",
    });
    setError(null);
    setSuccessMessage(null);
    setValidationErrors({});
  };

  // Fermer la modal
  const handleClose = () => {
    if (loading) return;

    if (formData.nom || formData.code || formData.indicatif) {
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
      aria-labelledby="createPaysModalLabel"
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
                <FontAwesomeIcon icon={faGlobe} className="fs-5" />
              </div>
              <div>
                <h5
                  className="modal-title mb-0 fw-bold"
                  id="createPaysModalLabel"
                >
                  Créer un Nouveau Pays
                </h5>
                <p className="mb-0 opacity-75 fs-14">
                  Remplissez les informations pour ajouter un nouveau pays
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

            <form onSubmit={handleSubmit}>
              <div
                className="card border-0 shadow-sm"
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
                        icon={faGlobe}
                        style={{ color: colors.oskar.green }}
                      />
                    </div>
                    <div>
                      <h6
                        className="mb-0 fw-bold"
                        style={{ color: colors.oskar.green }}
                      >
                        Informations du Pays
                      </h6>
                      <small className="text-muted">
                        Les champs marqués d'un * sont obligatoires
                      </small>
                    </div>
                  </div>
                </div>
                <div className="card-body p-4">
                  <div className="row g-3">
                    {/* Nom du pays */}
                    <div className="col-md-6">
                      <label htmlFor="nom" className="form-label fw-semibold">
                        <FontAwesomeIcon icon={faFlag} className="me-2" />
                        Nom du pays <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <FontAwesomeIcon
                            icon={faFlag}
                            className="text-muted"
                          />
                        </span>
                        <input
                          type="text"
                          id="nom"
                          name="nom"
                          className={`form-control border-start-0 ps-0 ${validationErrors.nom ? "is-invalid" : ""}`}
                          placeholder="Ex: France, États-Unis..."
                          value={formData.nom}
                          onChange={handleChange}
                          disabled={loading}
                          aria-describedby={
                            validationErrors.nom ? "nom-error" : undefined
                          }
                        />
                      </div>
                      {validationErrors.nom && (
                        <div
                          id="nom-error"
                          className="invalid-feedback d-block"
                        >
                          {validationErrors.nom}
                        </div>
                      )}
                      <small className="text-muted">Nom complet du pays</small>
                    </div>

                    {/* Code ISO */}
                    <div className="col-md-3">
                      <label htmlFor="code" className="form-label fw-semibold">
                        <FontAwesomeIcon icon={faCode} className="me-2" />
                        Code ISO <span className="text-danger">*</span>
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
                          className={`form-control border-start-0 ps-0 text-uppercase ${validationErrors.code ? "is-invalid" : ""}`}
                          placeholder="Ex: FR, US, DE"
                          value={formData.code}
                          onChange={handleChange}
                          disabled={loading}
                          maxLength={3}
                          style={{ textTransform: "uppercase" }}
                          aria-describedby={
                            validationErrors.code ? "code-error" : undefined
                          }
                        />
                      </div>
                      {validationErrors.code && (
                        <div
                          id="code-error"
                          className="invalid-feedback d-block"
                        >
                          {validationErrors.code}
                        </div>
                      )}
                      <small className="text-muted">
                        Code à 2 ou 3 lettres (ISO 3166)
                      </small>
                    </div>

                    {/* Statut */}
                    <div className="col-md-3">
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
                            validationErrors.statut ? "statut-error" : undefined
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
                    {/* Indicatif téléphonique */}
                    <div className="col-md-6">
                      <label
                        htmlFor="indicatif"
                        className="form-label fw-semibold"
                      >
                        <FontAwesomeIcon icon={faPhone} className="me-2" />
                        Indicatif téléphonique{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <FontAwesomeIcon
                            icon={faPhone}
                            className="text-muted"
                          />
                        </span>
                        <input
                          type="text"
                          id="indicatif"
                          name="indicatif"
                          className={`form-control border-start-0 ps-0 ${validationErrors.indicatif ? "is-invalid" : ""}`}
                          placeholder="Ex: +33, +1, +44"
                          value={formData.indicatif}
                          onChange={handleChange}
                          disabled={loading}
                          aria-describedby={
                            validationErrors.indicatif
                              ? "indicatif-error"
                              : undefined
                          }
                        />
                      </div>
                      {validationErrors.indicatif && (
                        <div
                          id="indicatif-error"
                          className="invalid-feedback d-block"
                        >
                          {validationErrors.indicatif}
                        </div>
                      )}
                      <small className="text-muted">
                        Code d'appel international (commence par +)
                      </small>
                    </div>
                  </div>

                  {/* Exemples */}
                  <div className="mt-4">
                    <h6 className="fw-semibold mb-2">
                      <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                      Exemples de formats corrects :
                    </h6>
                    <div className="row g-2">
                      <div className="col-md-6">
                        <div className="bg-light p-2 rounded">
                          <small className="text-muted">
                            <strong>France:</strong> Nom: France, Code: FR,
                            Indicatif: +33
                          </small>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="bg-light p-2 rounded">
                          <small className="text-muted">
                            <strong>États-Unis:</strong> Nom: États-Unis, Code:
                            US, Indicatif: +1
                          </small>
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
                <FontAwesomeIcon icon={faTimes} />
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
                      Créer le Pays
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
      `}</style>
    </div>
  );
}
