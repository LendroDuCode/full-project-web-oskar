// app/(back-office)/dashboard-admin/statuts-matrimoniaux/components/modals/EditStatutMatrimonialModal.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
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
  faCalendarAlt,
  faKey,
  faSync,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";

// Types
interface FormData {
  libelle: string;
  description?: string;
  statut: string;
  defaut: boolean;
}

// Types pour le statut matrimonial
interface StatutMatrimonialType {
  // Identifiant unique
  uuid: string;

  // Informations principales
  libelle: string;
  code: string;
  description?: string;

  // Statut et configuration
  statut: "actif" | "inactif";
  defaut: boolean;
  ordre?: number;

  // Métadonnées
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;

  // Données statistiques (optionnelles)
  nombreUtilisations?: number;
  derniereUtilisation?: string;

  // Historique des modifications
  historique?: Array<{
    date: string;
    action: string;
    utilisateur: string;
    details?: string;
  }>;

  // Relations (optionnelles selon les besoins)
  utilisateurs?: Array<{
    uuid: string;
    nom: string;
    prenom: string;
    email: string;
  }>;

  // Validation et contraintes
  estValide?: boolean;
  contraintes?: {
    minAge?: number;
    maxAge?: number;
    conditions?: string[];
  };
}

// Types pour les opérations CRUD
interface CreateStatutMatrimonialType {
  libelle: string;
  code: string;
  description?: string;
  statut?: "actif" | "inactif";
  defaut?: boolean;
  ordre?: number;
}

interface UpdateStatutMatrimonialType {
  libelle?: string;
  code?: string;
  description?: string;
  statut?: "actif" | "inactif";
  defaut?: boolean;
  ordre?: number;
}

// Type pour la réponse API
interface ApiResponseStatutMatrimonial {
  success: boolean;
  message: string;
  data: StatutMatrimonialType | StatutMatrimonialType[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

// Type pour les filtres de recherche
interface StatutMatrimonialFilterType {
  search?: string;
  statut?: "actif" | "inactif" | "tous";
  defaut?: boolean;
  dateDebut?: string;
  dateFin?: string;
  orderBy?: "libelle" | "code" | "createdAt" | "ordre";
  orderDirection?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// Type pour les statistiques
interface StatutMatrimonialStatsType {
  total: number;
  actifs: number;
  inactifs: number;
  parDefaut: number;
  derniereCreation: string;
  moyenneUtilisations: number;
  repartitionParStatut: Array<{
    statut: string;
    count: number;
    percentage: number;
  }>;
}

// Type pour l'import/export
interface StatutMatrimonialImportType {
  libelle: string;
  code: string;
  description?: string;
  statut: "actif" | "inactif";
  defaut: boolean;
  ordre: number;
}

// Type pour les erreurs de validation
interface StatutMatrimonialValidationError {
  field: keyof CreateStatutMatrimonialType;
  message: string;
  code: string;
}

// Type pour l'historique des modifications
interface StatutMatrimonialHistoryType {
  id: string;
  statutId: string;
  action:
    | "creation"
    | "modification"
    | "suppression"
    | "activation"
    | "desactivation";
  ancienneValeur?: Partial<StatutMatrimonialType>;
  nouvelleValeur?: Partial<StatutMatrimonialType>;
  utilisateurId: string;
  utilisateurNom: string;
  utilisateurEmail: string;
  date: string;
  ipAddress?: string;
  userAgent?: string;
}

// Type pour les options de sélection
interface StatutMatrimonialOptionType {
  value: string;
  label: string;
  code: string;
  defaut: boolean;
  disabled?: boolean;
}

// Type pour le formulaire de suppression
interface DeleteStatutMatrimonialType {
  uuid: string;
  libelle: string;
  confirmation: string;
  raison?: string;
  forceDelete?: boolean;
}
interface EditStatutMatrimonialModalProps {
  isOpen: boolean;
  statut: StatutMatrimonialType | null;
  onClose: () => void;
  onSuccess?: (message?: string) => void; // Ajoutez un paramètre optionnel
}

export default function EditStatutMatrimonialModal({
  isOpen,
  statut,
  onClose,
  onSuccess,
}: EditStatutMatrimonialModalProps) {
  // États du formulaire
  const [formData, setFormData] = useState<FormData>({
    libelle: "",
    description: "",
    statut: "actif",
    defaut: false,
  });

  // États de chargement et erreurs
  const [loading, setLoading] = useState(false);
  const [loadingStatut, setLoadingStatut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // États pour les informations du statut
  const [statutInfo, setStatutInfo] = useState<StatutMatrimonialType | null>(
    null,
  );

  // Styles personnalisés
  const styles = {
    modalHeader: {
      background: `linear-gradient(135deg, ${colors.oskar.pink} 0%, ${colors.oskar.pinkHover} 100%)`,
      borderBottom: `3px solid ${colors.oskar.purple}`,
    },
    sectionHeader: {
      background: colors.oskar.lightGrey,
      borderLeft: `4px solid ${colors.oskar.pink}`,
    },
    infoSection: {
      background: colors.oskar.lightGrey,
      borderLeft: `4px solid ${colors.oskar.green}`,
    },
    primaryButton: {
      background: colors.oskar.pink,
      borderColor: colors.oskar.pink,
    },
    primaryButtonHover: {
      background: colors.oskar.pinkHover,
      borderColor: colors.oskar.pinkHover,
    },
    secondaryButton: {
      background: "white",
      color: colors.oskar.pink,
      borderColor: colors.oskar.pink,
    },
    secondaryButtonHover: {
      background: colors.oskar.lightGrey,
      color: colors.oskar.pinkHover,
      borderColor: colors.oskar.pinkHover,
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

  // Charger les données du statut quand il change
  useEffect(() => {
    if (!isOpen || !statut) return;

    const loadStatutData = async () => {
      try {
        setLoadingStatut(true);
        setError(null);
        setSuccessMessage(null);
        setValidationErrors({});

        // Récupérer les données complètes du statut
        const response = await api.get(
          API_ENDPOINTS.STATUTS_MATRIMONIAUX.DETAIL(statut.uuid),
        );

        let statutData: StatutMatrimonialType;
        if (
          response.data &&
          typeof response.data === "object" &&
          "data" in response.data
        ) {
          statutData = (response.data as any).data;
        } else {
          statutData = response.data as StatutMatrimonialType;
        }

        if (statutData) {
          setStatutInfo(statutData);
          setFormData({
            libelle: statutData.libelle || "",
            description: statutData.description || "",
            statut: statutData.statut || "actif",
            defaut: statutData.defaut || false,
          });
        } else {
          // Utiliser les données de base
          setStatutInfo(statut);
          setFormData({
            libelle: statut.libelle || "",
            description: statut.description || "",
            statut: statut.statut || "actif",
            defaut: statut.defaut || false,
          });
        }
      } catch (err: any) {
        console.error("Erreur lors du chargement des données:", err);
        setError("Impossible de charger les données du statut matrimonial");

        // Utiliser les données de base
        setStatutInfo(statut);
        setFormData({
          libelle: statut.libelle || "",
          description: statut.description || "",
          statut: statut.statut || "actif",
          defaut: statut.defaut || false,
        });
      } finally {
        setLoadingStatut(false);
      }
    };

    loadStatutData();
  }, [isOpen, statut]);

  // Validation du formulaire
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.libelle.trim()) {
      errors.libelle = "Le libellé est obligatoire";
    } else if (formData.libelle.length < 2) {
      errors.libelle = "Le libellé doit contenir au moins 2 caractères";
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

    if (!statut || !statut.uuid) {
      setError("Aucun statut sélectionné");
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
      const statutData = {
        libelle: formData.libelle.trim(),
        description: formData.description?.trim() || null,
        statut: formData.statut,
        defaut: formData.defaut,
      };

      // Appel à l'API pour la mise à jour
      await api.put(
        API_ENDPOINTS.STATUTS_MATRIMONIAUX.UPDATE(statut.uuid),
        statutData,
      );

      setSuccessMessage("Statut matrimonial modifié avec succès !");

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
      let errorMessage = "Erreur lors de la modification du statut matrimonial";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      if (err.response?.status === 400) {
        errorMessage = "Données invalides. Vérifiez les informations saisies.";
      } else if (err.response?.status === 404) {
        errorMessage = "Statut matrimonial non trouvé.";
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

  // Réinitialiser le formulaire aux valeurs d'origine
  const handleReset = () => {
    if (!statutInfo) return;

    setFormData({
      libelle: statutInfo.libelle || "",
      description: statutInfo.description || "",
      statut: statutInfo.statut || "actif",
      defaut: statutInfo.defaut || false,
    });
    setError(null);
    setSuccessMessage(null);
    setValidationErrors({});
  };

  // Fermer la modal
  const handleClose = () => {
    if (loading || loadingStatut) return;

    if (
      statutInfo &&
      (formData.libelle !== statutInfo.libelle ||
        formData.description !== statutInfo.description ||
        formData.statut !== statutInfo.statut ||
        formData.defaut !== statutInfo.defaut)
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
      aria-labelledby="editStatutMatrimonialModalLabel"
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
                <FontAwesomeIcon icon={faHeart} className="fs-5" />
              </div>
              <div>
                <h5
                  className="modal-title mb-0 fw-bold"
                  id="editStatutMatrimonialModalLabel"
                >
                  Modifier le Statut Matrimonial
                </h5>
                <p className="mb-0 opacity-75 fs-14">
                  {statut?.libelle
                    ? `Modification de "${statut.libelle}"`
                    : "Chargement..."}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={handleClose}
              disabled={loading || loadingStatut}
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
            {loadingStatut ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-3">Chargement des données du statut...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Section 1: Informations du statut */}
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
                          Informations du Statut Matrimonial
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
                          <FontAwesomeIcon icon={faTag} className="me-2" />
                          Libellé <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <FontAwesomeIcon
                              icon={faTag}
                              className="text-muted"
                            />
                          </span>
                          <input
                            type="text"
                            id="libelle"
                            name="libelle"
                            className={`form-control border-start-0 ps-0 ${validationErrors.libelle ? "is-invalid" : ""}`}
                            placeholder="Ex: Célibataire, Marié, Divorcé..."
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
                          Nom complet du statut matrimonial
                        </small>
                      </div>

                      {/* Statut */}
                      <div className="col-md-4">
                        <label
                          htmlFor="statut"
                          className="form-label fw-semibold"
                        >
                          <FontAwesomeIcon icon={faFlag} className="me-2" />
                          Statut <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <FontAwesomeIcon
                              icon={faFlag}
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
                      {/* Description */}
                      <div className="col-md-12">
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
                          placeholder="Description du statut matrimonial (facultatif)"
                          value={formData.description}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        <small className="text-muted">
                          Description optionnelle du statut
                        </small>
                      </div>
                    </div>

                    <div className="row g-3 mt-3">
                      {/* Défaut */}
                      <div className="col-md-12">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            id="defaut"
                            name="defaut"
                            className="form-check-input"
                            checked={formData.defaut}
                            onChange={handleChange}
                            disabled={loading}
                          />
                          <label
                            htmlFor="defaut"
                            className="form-check-label fw-semibold"
                          >
                            <FontAwesomeIcon icon={faStar} className="me-2" />
                            Définir comme statut par défaut
                          </label>
                          <small className="text-muted d-block mt-1">
                            Ce statut sera utilisé par défaut pour les nouveaux
                            utilisateurs
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Informations système */}
                {statutInfo && (
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
                              value={statutInfo.uuid}
                              readOnly
                              disabled
                              style={{ cursor: "not-allowed" }}
                            />
                          </div>
                          <small className="text-muted">
                            Identifiant unique
                          </small>
                        </div>

                        {/* Slug */}
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">
                            <FontAwesomeIcon icon={faCode} className="me-2" />
                            Slug
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
                              className="form-control border-start-0 ps-0 bg-light"
                              value={statutInfo.code}
                              readOnly
                              disabled
                              style={{ cursor: "not-allowed" }}
                            />
                          </div>
                          <small className="text-muted">
                            Identifiant technique
                          </small>
                        </div>

                        {/* Date de création */}
                        <div className="col-md-6">
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
                              value={formatDate(statutInfo.createdAt)}
                              readOnly
                              disabled
                              style={{ cursor: "not-allowed" }}
                            />
                          </div>
                        </div>

                        {/* Date de modification */}
                        <div className="col-md-6">
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
                              value={formatDate(statutInfo.updatedAt)}
                              readOnly
                              disabled
                              style={{ cursor: "not-allowed" }}
                            />
                          </div>
                        </div>
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
                disabled={loading || loadingStatut || !statutInfo}
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
                  disabled={loading || loadingStatut}
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
                  disabled={loading || loadingStatut}
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
          border-color: ${colors.oskar.pink};
          box-shadow: 0 0 0 0.25rem ${colors.oskar.pink}25;
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
