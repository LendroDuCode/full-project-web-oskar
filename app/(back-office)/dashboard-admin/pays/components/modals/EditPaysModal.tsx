// app/(back-office)/dashboard-admin/pays/components/modals/EditPaysModal.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
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
  faCalendarAlt,
  faKey,
  faSync,
  faMapMarkerAlt,
  faUsers,
  faBuilding,
  faMoneyBillWave,
  faLanguage,
  faEarthAmericas,
  faDatabase,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";

// Types locaux
interface Pays {
  uuid: string;
  nom: string;
  data: any;
  code: string;
  indicatif: string;
  statut: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  description?: string;
  continent?: string;
  capitale?: string;
  langue_officielle?: string;
  population?: number;
  superficie?: number;
  devise?: string;
  domaine_internet?: string;
  fuseau_horaire?: string;
  code_continent?: string;
}

interface FormData {
  nom: string;
  code: string;
  indicatif: string;
  statut: string;
  description?: string;
  capitale?: string;
  devise?: string;
  langue_officielle?: string;
}

interface EditPaysModalProps {
  isOpen: boolean;
  pays: Pays | undefined;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EditPaysModal({
  isOpen,
  pays,
  onClose,
  onSuccess,
}: EditPaysModalProps) {
  // États du formulaire
  const [formData, setFormData] = useState<FormData>({
    nom: "",
    code: "",
    indicatif: "",
    statut: "actif",
    description: "",
    capitale: "",
    devise: "",
    langue_officielle: "",
  });

  // États de chargement et erreurs
  const [loading, setLoading] = useState(false);
  const [loadingPays, setLoadingPays] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // États pour les informations du pays
  const [paysInfo, setPaysInfo] = useState<Pays | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Styles personnalisés
  const styles = {
    modalHeader: {
      background: `linear-gradient(135deg, ${colors.oskar.blue} 0%, ${colors.oskar.blueHover} 100%)`,
      borderBottom: `3px solid ${colors.oskar.green}`,
    },
    sectionHeader: {
      background: colors.oskar.lightGrey,
      borderLeft: `4px solid ${colors.oskar.blue}`,
    },
    infoSection: {
      background: colors.oskar.lightGrey,
      borderLeft: `4px solid ${colors.oskar.purple}`,
    },
    statsSection: {
      background: colors.oskar.lightGrey,
      borderLeft: `4px solid ${colors.oskar.green}`,
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

  // Formater la date
  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return "Non spécifié";
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
      return "Non spécifié";
    }
  }, []);

  // Formater les nombres
  const formatNumber = useCallback((number?: number) => {
    if (!number) return "Non spécifié";
    return number.toLocaleString('fr-FR');
  }, []);

  // Vérifier les changements
  const checkForChanges = useCallback((currentForm: FormData, original: Pays | null) => {
    if (!original) return false;
    
    return (
      currentForm.nom !== original.code ||
      currentForm.code !== original.code ||
      currentForm.indicatif !== original.indicatif ||
      currentForm.statut !== original.statut ||
      currentForm.description !== (original.description || "") ||
      currentForm.capitale !== (original.capitale || "") ||
      currentForm.devise !== (original.devise || "") ||
      currentForm.langue_officielle !== (original.langue_officielle || "")
    );
  }, []);

  // Charger les données du pays quand il change
  useEffect(() => {
    if (!isOpen || !pays) return;

    const loadPaysData = async () => {
      try {
        setLoadingPays(true);
        setError(null);
        setSuccessMessage(null);
        setValidationErrors({});

        // Récupérer les données complètes du pays
        const response = await api.get<Pays>(
          API_ENDPOINTS.PAYS.DETAIL(pays.uuid),
        );

        if (response.data) {
          const paysData = response.data;
          setPaysInfo(paysData);
          setFormData({
            nom: paysData.nom || "",
            code: paysData.code || "",
            indicatif: paysData.indicatif || "",
            statut: paysData.statut || "actif",
            description: paysData.description || "",
            capitale: paysData.capitale || "",
            devise: paysData.devise || "",
            langue_officielle: paysData.langue_officielle || "",
          });
        } else {
          // Utiliser les données de base si l'API ne répond pas
          setPaysInfo(pays);
          setFormData({
            nom: pays.nom || "",
            code: pays.code || "",
            indicatif: pays.indicatif || "",
            statut: pays.statut || "actif",
            description: pays.description || "",
            capitale: pays.capitale || "",
            devise: pays.devise || "",
            langue_officielle: pays.langue_officielle || "",
          });
        }
      } catch (err: any) {
        console.error("❌ Erreur lors du chargement des données:", err);
        setError("Impossible de charger les données du pays");

        // Utiliser les données de base en cas d'erreur
        setPaysInfo(pays);
        setFormData({
          nom: pays.nom || "",
          code: pays.code || "",
          indicatif: pays.indicatif || "",
          statut: pays.statut || "actif",
          description: pays.description || "",
          capitale: pays.capitale || "",
          devise: pays.devise || "",
          langue_officielle: pays.langue_officielle || "",
        });
      } finally {
        setLoadingPays(false);
      }
    };

    loadPaysData();
  }, [isOpen, pays]);

  // Vérifier les changements
  useEffect(() => {
    setHasChanges(checkForChanges(formData, paysInfo));
  }, [formData, paysInfo, checkForChanges]);

  // Réinitialiser les messages d'erreur quand la modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccessMessage(null);
      setValidationErrors({});
    }
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

    // Validation du code
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

    // Validation optionnelles
    if (formData.description && formData.description.length > 500) {
      errors.description = "La description ne doit pas dépasser 500 caractères";
    }

    if (formData.capitale && formData.capitale.length > 100) {
      errors.capitale = "Le nom de la capitale ne doit pas dépasser 100 caractères";
    }

    if (formData.devise && formData.devise.length > 50) {
      errors.devise = "Le nom de la devise ne doit pas dépasser 50 caractères";
    }

    if (formData.langue_officielle && formData.langue_officielle.length > 100) {
      errors.langue_officielle = "La langue officielle ne doit pas dépasser 100 caractères";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Gestion des changements de formulaire
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
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

    if (!pays || !pays.uuid) {
      setError("Aucun pays sélectionné");
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
      const paysData = {
        nom: formData.nom.trim(),
        code: formData.code.trim(),
        indicatif: formData.indicatif.trim(),
        statut: formData.statut,
        description: formData.description?.trim() || null,
        capitale: formData.capitale?.trim() || null,
        devise: formData.devise?.trim() || null,
        langue_officielle: formData.langue_officielle?.trim() || null,
      };

      console.log("📤 Envoi des données de mise à jour:", paysData);

      // Appel à l'API pour la mise à jour
      const response = await api.put(API_ENDPOINTS.PAYS.UPDATE(pays.uuid), paysData);

      console.log("✅ Réponse de l'API:", response.data);

      setSuccessMessage("Pays modifié avec succès !");

      // Mettre à jour les informations locales
      if (response.data) {
        setPaysInfo(response.data);
      }

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
      console.error("❌ Erreur lors de la modification du pays:", err);

      let errorMessage = "Erreur lors de la modification du pays";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      if (err.response?.status === 400) {
        errorMessage = "Données invalides. Vérifiez les informations saisies.";
      } else if (err.response?.status === 404) {
        errorMessage = "Pays non trouvé.";
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

  // Réinitialiser le formulaire aux valeurs d'origine
  const handleReset = () => {
    if (!paysInfo) return;

    setFormData({
      nom: paysInfo.nom || "",
      code: paysInfo.code || "",
      indicatif: paysInfo.indicatif || "",
      statut: paysInfo.statut || "actif",
      description: paysInfo.description || "",
      capitale: paysInfo.capitale || "",
      devise: paysInfo.devise || "",
      langue_officielle: paysInfo.langue_officielle || "",
    });
    setError(null);
    setSuccessMessage(null);
    setValidationErrors({});
  };

  // Fermer la modal
  const handleClose = () => {
    if (loading || loadingPays) return;

    if (hasChanges) {
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

  // Obtenir le badge de statut
  const getStatusBadge = (statut: string) => {
    if (statut === "actif") {
      return (
        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 d-inline-flex align-items-center gap-1">
          <FontAwesomeIcon icon={faCheckCircle} className="fs-12" />
          <span>Actif</span>
        </span>
      );
    }
    return (
      <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 d-inline-flex align-items-center gap-1">
        <FontAwesomeIcon icon={faExclamationTriangle} className="fs-12" />
        <span>Inactif</span>
      </span>
    );
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
      aria-labelledby="editPaysModalLabel"
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
                  id="editPaysModalLabel"
                >
                  Modifier le Pays
                </h5>
                <p className="mb-0 opacity-75 fs-14">
                  {pays?.nom
                    ? `Modification de "${pays.nom}"`
                    : "Chargement..."}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={handleClose}
              disabled={loading || loadingPays}
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
            {loadingPays ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-3">Chargement des données du pays...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Section 1: Informations du pays */}
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
                          icon={faGlobe}
                          style={{ color: colors.oskar.blue }}
                        />
                      </div>
                      <div>
                        <h6
                          className="mb-0 fw-bold"
                          style={{ color: colors.oskar.blue }}
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
                        <small className="text-muted">
                          Nom complet du pays
                        </small>
                      </div>

                      {/* Code ISO */}
                      <div className="col-md-3">
                        <label
                          htmlFor="code"
                          className="form-label fw-semibold"
                        >
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
                      {/* Indicatif téléphonique */}
                      <div className="col-md-3">
                        <label
                          htmlFor="indicatif"
                          className="form-label fw-semibold"
                        >
                          <FontAwesomeIcon icon={faPhone} className="me-2" />
                          Indicatif <span className="text-danger">*</span>
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
                          Code d'appel international
                        </small>
                      </div>

                      {/* Capitale */}
                      <div className="col-md-3">
                        <label
                          htmlFor="capitale"
                          className="form-label fw-semibold"
                        >
                          <FontAwesomeIcon icon={faBuilding} className="me-2" />
                          Capitale
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <FontAwesomeIcon
                              icon={faBuilding}
                              className="text-muted"
                            />
                          </span>
                          <input
                            type="text"
                            id="capitale"
                            name="capitale"
                            className={`form-control border-start-0 ps-0 ${validationErrors.capitale ? "is-invalid" : ""}`}
                            placeholder="Ex: Paris, Washington..."
                            value={formData.capitale}
                            onChange={handleChange}
                            disabled={loading}
                          />
                        </div>
                        {validationErrors.capitale && (
                          <div className="invalid-feedback d-block">
                            {validationErrors.capitale}
                          </div>
                        )}
                      </div>

                      {/* Devise */}
                      <div className="col-md-3">
                        <label
                          htmlFor="devise"
                          className="form-label fw-semibold"
                        >
                          <FontAwesomeIcon icon={faMoneyBillWave} className="me-2" />
                          Devise
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <FontAwesomeIcon
                              icon={faMoneyBillWave}
                              className="text-muted"
                            />
                          </span>
                          <input
                            type="text"
                            id="devise"
                            name="devise"
                            className={`form-control border-start-0 ps-0 ${validationErrors.devise ? "is-invalid" : ""}`}
                            placeholder="Ex: Euro, Dollar..."
                            value={formData.devise}
                            onChange={handleChange}
                            disabled={loading}
                          />
                        </div>
                        {validationErrors.devise && (
                          <div className="invalid-feedback d-block">
                            {validationErrors.devise}
                          </div>
                        )}
                      </div>

                      {/* Langue officielle */}
                      <div className="col-md-3">
                        <label
                          htmlFor="langue_officielle"
                          className="form-label fw-semibold"
                        >
                          <FontAwesomeIcon icon={faLanguage} className="me-2" />
                          Langue officielle
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
                            id="langue_officielle"
                            name="langue_officielle"
                            className={`form-control border-start-0 ps-0 ${validationErrors.langue_officielle ? "is-invalid" : ""}`}
                            placeholder="Ex: Français, Anglais..."
                            value={formData.langue_officielle}
                            onChange={handleChange}
                            disabled={loading}
                          />
                        </div>
                        {validationErrors.langue_officielle && (
                          <div className="invalid-feedback d-block">
                            {validationErrors.langue_officielle}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="row g-3 mt-3">
                      <div className="col-12">
                        <label htmlFor="description" className="form-label fw-semibold">
                          <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                          Description
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          className={`form-control ${validationErrors.description ? "is-invalid" : ""}`}
                          rows={3}
                          placeholder="Description du pays (facultatif)"
                          value={formData.description}
                          onChange={handleChange}
                          disabled={loading}
                          maxLength={500}
                        />
                        {validationErrors.description && (
                          <div className="invalid-feedback d-block">
                            {validationErrors.description}
                          </div>
                        )}
                        <small className="text-muted">
                          {formData.description?.length || 0}/500 caractères
                        </small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Informations supplémentaires */}
                {paysInfo && (
                  <>
                    <div
                      className="card border-0 shadow-sm mb-4"
                      style={{ borderRadius: "12px" }}
                    >
                      <div
                        className="card-header border-0 py-3"
                        style={styles.statsSection}
                      >
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle p-2 me-3"
                            style={{ backgroundColor: `${colors.oskar.green}15` }}
                          >
                            <FontAwesomeIcon
                              icon={faEarthAmericas}
                              style={{ color: colors.oskar.green }}
                            />
                          </div>
                          <div>
                            <h6
                              className="mb-0 fw-bold"
                              style={{ color: colors.oskar.green }}
                            >
                              Informations Géographiques
                            </h6>
                            <small className="text-muted">
                              Données statistiques (lecture seule)
                            </small>
                          </div>
                        </div>
                      </div>
                      <div className="card-body p-4">
                        <div className="row g-3">
                          {/* Population */}
                          {paysInfo.population && (
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">
                                <FontAwesomeIcon icon={faUsers} className="me-2" />
                                Population
                              </label>
                              <div className="input-group">
                                <span className="input-group-text bg-light border-end-0">
                                  <FontAwesomeIcon
                                    icon={faUsers}
                                    className="text-muted"
                                  />
                                </span>
                                <input
                                  type="text"
                                  className="form-control border-start-0 ps-0 bg-light"
                                  value={formatNumber(paysInfo.population)}
                                  readOnly
                                  disabled
                                  style={{ cursor: "not-allowed" }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Superficie */}
                          {paysInfo.superficie && (
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                                Superficie (km²)
                              </label>
                              <div className="input-group">
                                <span className="input-group-text bg-light border-end-0">
                                  <FontAwesomeIcon
                                    icon={faMapMarkerAlt}
                                    className="text-muted"
                                  />
                                </span>
                                <input
                                  type="text"
                                  className="form-control border-start-0 ps-0 bg-light"
                                  value={formatNumber(paysInfo.superficie)}
                                  readOnly
                                  disabled
                                  style={{ cursor: "not-allowed" }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Continent */}
                          {paysInfo.continent && (
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">
                                <FontAwesomeIcon icon={faGlobe} className="me-2" />
                                Continent
                              </label>
                              <div className="input-group">
                                <span className="input-group-text bg-light border-end-0">
                                  <FontAwesomeIcon
                                    icon={faGlobe}
                                    className="text-muted"
                                  />
                                </span>
                                <input
                                  type="text"
                                  className="form-control border-start-0 ps-0 bg-light"
                                  value={paysInfo.continent}
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

                    {/* Section 3: Informations système */}
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
                            style={{
                              backgroundColor: `${colors.oskar.purple}15`,
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faDatabase}
                              style={{ color: colors.oskar.purple }}
                            />
                          </div>
                          <div>
                            <h6
                              className="mb-0 fw-bold"
                              style={{ color: colors.oskar.purple }}
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
                          <div className="col-md-4">
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
                                className="form-control border-start-0 ps-0 bg-light text-truncate"
                                value={paysInfo.uuid}
                                readOnly
                                disabled
                                style={{ cursor: "not-allowed" }}
                              />
                            </div>
                            <small className="text-muted">
                              Identifiant unique
                            </small>
                          </div>

                          {/* Statut actuel */}
                          <div className="col-md-4">
                            <label className="form-label fw-semibold">
                              Statut actuel
                            </label>
                            <div className="d-flex align-items-center h-100">
                              {getStatusBadge(paysInfo.statut)}
                            </div>
                          </div>

                          {/* Date de création */}
                          <div className="col-md-2">
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
                                value={formatDate(paysInfo.created_at)}
                                readOnly
                                disabled
                                style={{ cursor: "not-allowed" }}
                              />
                            </div>
                          </div>

                          {/* Date de modification */}
                          <div className="col-md-2">
                            <label className="form-label fw-semibold">
                              <FontAwesomeIcon
                                icon={faCalendarAlt}
                                className="me-2"
                              />
                              Modifié le
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
                                value={formatDate(paysInfo.updated_at)}
                                readOnly
                                disabled
                                style={{ cursor: "not-allowed" }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </form>
            )}
          </div>

          {/* Pied de la modal */}
          <div className="modal-footer border-top-0 py-4 px-4">
            <div className="d-flex justify-content-between w-100">
              <div className="d-flex align-items-center">
                {hasChanges && (
                  <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 me-3">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="me-1" />
                    Modifications non sauvegardées
                  </span>
                )}
                <button
                  type="button"
                  className="btn d-flex align-items-center gap-2"
                  onClick={handleReset}
                  disabled={loading || loadingPays || !hasChanges}
                  style={styles.secondaryButton}
                  onMouseEnter={(e) => {
                    if (!loading && !loadingPays && hasChanges) {
                      Object.assign(e.currentTarget.style, styles.secondaryButtonHover);
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading && !loadingPays && hasChanges) {
                      Object.assign(e.currentTarget.style, styles.secondaryButton);
                    }
                  }}
                >
                  <FontAwesomeIcon icon={faSync} />
                  Réinitialiser
                </button>
              </div>

              <div className="d-flex gap-3">
                <button
                  type="button"
                  className="btn d-flex align-items-center gap-2"
                  onClick={handleClose}
                  disabled={loading || loadingPays}
                  style={{
                    background: colors.oskar.lightGrey,
                    color: colors.oskar.grey,
                    border: `1px solid ${colors.oskar.grey}30`,
                  }}
                  onMouseEnter={(e) => {
                    if (!loading && !loadingPays) {
                      e.currentTarget.style.background = colors.oskar.grey + "15";
                      e.currentTarget.style.color = colors.oskar.black;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading && !loadingPays) {
                      e.currentTarget.style.background = colors.oskar.lightGrey;
                      e.currentTarget.style.color = colors.oskar.grey;
                    }
                  }}
                >
                  <FontAwesomeIcon icon={faTimes} />
                  Annuler
                </button>

                <button
                  type="submit"
                  className="btn text-white d-flex align-items-center gap-2"
                  onClick={handleSubmit}
                  disabled={loading || loadingPays || !hasChanges}
                  style={styles.primaryButton}
                  onMouseEnter={(e) => {
                    if (!loading && !loadingPays && hasChanges) {
                      Object.assign(e.currentTarget.style, styles.primaryButtonHover);
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading && !loadingPays && hasChanges) {
                      Object.assign(e.currentTarget.style, styles.primaryButton);
                    }
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
          border-color: ${colors.oskar.blue};
          box-shadow: 0 0 0 0.25rem ${colors.oskar.blue}25;
        }

        .form-control.is-invalid {
          border-color: ${colors.oskar.red};
          box-shadow: 0 0 0 0.25rem ${colors.oskar.red}25;
        }

        .btn {
          border-radius: 8px !important;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .input-group-text {
          border-radius: 8px 0 0 8px !important;
        }

        .fs-14 {
          font-size: 14px !important;
        }

        .fs-12 {
          font-size: 12px !important;
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

        .badge {
          border-radius: 20px !important;
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .text-truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .h-100 {
          height: 100%;
        }

        .invalid-feedback {
          color: ${colors.oskar.red};
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }
      `}</style>
    </div>
  );
}