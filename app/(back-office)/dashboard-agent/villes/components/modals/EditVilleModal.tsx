// app/(back-office)/dashboard-admin/villes/components/modals/EditVilleModal.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faCity,
  faSave,
  faCheckCircle,
  faExclamationTriangle,
  faSpinner,
  faMapMarkerAlt,
  faGlobe,
  faFlag,
  faInfoCircle,
  faCalendarAlt,
  faKey,
  faSync,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";
import { usePays } from "@/hooks/usePays";
import type { Ville } from "@/services/villes/villes.types";
import type { Pays } from "@/services/pays/pays.types";

// Types
interface FormData {
  nom: string;
  code_postal: string;
  pays_uuid: string;
  statut: string;
  description?: string;
  latitude?: number;
  longitude?: number;
}

interface EditVilleModalProps {
  isOpen: boolean;
  ville: Ville | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EditVilleModal({
  isOpen,
  ville,
  onClose,
  onSuccess,
}: EditVilleModalProps) {
  // États du formulaire
  const [formData, setFormData] = useState<FormData>({
    nom: "",
    code_postal: "",
    pays_uuid: "",
    statut: "actif",
    description: "",
  });

  // États de chargement et erreurs
  const [loading, setLoading] = useState(false);
  const [loadingVille, setLoadingVille] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // États pour les informations de la ville
  const [villeInfo, setVilleInfo] = useState<Ville | null>(null);

  // Charger les pays
  const { pays, loading: loadingPays } = usePays();

  // Styles personnalisés
  const styles = {
    modalHeader: {
      background: `linear-gradient(135deg, ${colors.oskar.blue} 0%, ${colors.oskar.blueHover} 100%)`,
      borderBottom: `3px solid ${colors.oskar.purple}`,
    },
    sectionHeader: {
      background: colors.oskar.lightGrey,
      borderLeft: `4px solid ${colors.oskar.blue}`,
    },
    infoSection: {
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

  // Charger les données de la ville quand elle change
  useEffect(() => {
    if (!isOpen || !ville) return;

    const loadVilleData = async () => {
      try {
        setLoadingVille(true);
        setError(null);
        setSuccessMessage(null);
        setValidationErrors({});

        // Récupérer les données complètes de la ville
        const response = await api.get(API_ENDPOINTS.VILLES.DETAIL(ville.uuid));

        let villeData: Ville;
        if (
          response.data &&
          typeof response.data === "object" &&
          "data" in response.data
        ) {
          villeData = (response.data as any).data;
        } else {
          villeData = response.data as Ville;
        }

        if (villeData) {
          setVilleInfo(villeData);
          setFormData({
            nom: villeData.nom || "",
            code_postal: villeData.code_postal || "",
            pays_uuid: villeData.pays_uuid || "",
            statut: villeData.statut || "actif",
            description: villeData.description || "",
            latitude: villeData.latitude,
            longitude: villeData.longitude,
          });
        } else {
          // Utiliser les données de base
          setVilleInfo(ville);
          setFormData({
            nom: ville.nom || "",
            code_postal: ville.code_postal || "",
            pays_uuid: ville.pays_uuid || "",
            statut: ville.statut || "actif",
            description: "",
            latitude: undefined,
            longitude: undefined,
          });
        }
      } catch (err: any) {
        console.error("Erreur lors du chargement des données:", err);
        setError("Impossible de charger les données de la ville");

        // Utiliser les données de base
        setVilleInfo(ville);
        setFormData({
          nom: ville.nom || "",
          code_postal: ville.code_postal || "",
          pays_uuid: ville.pays_uuid || "",
          statut: ville.statut || "actif",
          description: "",
          latitude: undefined,
          longitude: undefined,
        });
      } finally {
        setLoadingVille(false);
      }
    };

    loadVilleData();
  }, [isOpen, ville]);

  // Validation du formulaire
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.nom.trim()) {
      errors.nom = "Le nom de la ville est obligatoire";
    } else if (formData.nom.length < 2) {
      errors.nom = "Le nom doit contenir au moins 2 caractères";
    }

    if (!formData.code_postal.trim()) {
      errors.code_postal = "Le code postal est obligatoire";
    }

    if (!formData.pays_uuid) {
      errors.pays_uuid = "Le pays est obligatoire";
    }

    if (!formData.statut) {
      errors.statut = "Le statut est obligatoire";
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
      [name]:
        name === "latitude" || name === "longitude"
          ? value
            ? parseFloat(value)
            : undefined
          : value,
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

    if (!ville || !ville.uuid) {
      setError("Aucune ville sélectionnée");
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
      const villeData = {
        nom: formData.nom.trim(),
        code_postal: formData.code_postal.trim(),
        pays_uuid: formData.pays_uuid,
        statut: formData.statut,
        description: formData.description?.trim() || null,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
      };

      // Appel à l'API pour la mise à jour
      await api.put(API_ENDPOINTS.VILLES.UPDATE(ville.uuid), villeData);

      setSuccessMessage("Ville modifiée avec succès !");

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
      let errorMessage = "Erreur lors de la modification de la ville";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      if (err.response?.status === 400) {
        errorMessage = "Données invalides. Vérifiez les informations saisies.";
      } else if (err.response?.status === 404) {
        errorMessage = "Ville non trouvée.";
      } else if (err.response?.status === 409) {
        errorMessage = "Une ville avec ce nom ou code postal existe déjà.";
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
    if (!villeInfo) return;

    setFormData({
      nom: villeInfo.nom || "",
      code_postal: villeInfo.code_postal || "",
      pays_uuid: villeInfo.pays_uuid || "",
      statut: villeInfo.statut || "actif",
      description: villeInfo.description || "",
      latitude: villeInfo.latitude,
      longitude: villeInfo.longitude,
    });
    setError(null);
    setSuccessMessage(null);
    setValidationErrors({});
  };

  // Fermer la modal
  const handleClose = () => {
    if (loading || loadingVille) return;

    if (
      villeInfo &&
      (formData.nom !== villeInfo.nom ||
        formData.code_postal !== villeInfo.code_postal ||
        formData.pays_uuid !== villeInfo.pays_uuid ||
        formData.statut !== villeInfo.statut ||
        formData.description !== villeInfo.description ||
        formData.latitude !== villeInfo.latitude ||
        formData.longitude !== villeInfo.longitude)
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
      aria-labelledby="editVilleModalLabel"
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
                <FontAwesomeIcon icon={faCity} className="fs-5" />
              </div>
              <div>
                <h5
                  className="modal-title mb-0 fw-bold"
                  id="editVilleModalLabel"
                >
                  Modifier la Ville
                </h5>
                <p className="mb-0 opacity-75 fs-14">
                  {ville?.nom
                    ? `Modification de "${ville.nom}"`
                    : "Chargement..."}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={handleClose}
              disabled={loading || loadingVille}
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
            {loadingVille ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-3">Chargement des données de la ville...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Section 1: Informations de la ville */}
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
                          icon={faCity}
                          style={{ color: colors.oskar.blue }}
                        />
                      </div>
                      <div>
                        <h6
                          className="mb-0 fw-bold"
                          style={{ color: colors.oskar.blue }}
                        >
                          Informations de la Ville
                        </h6>
                        <small className="text-muted">
                          Les champs marqués d'un * sont obligatoires
                        </small>
                      </div>
                    </div>
                  </div>
                  <div className="card-body p-4">
                    <div className="row g-3">
                      {/* Nom de la ville */}
                      <div className="col-md-6">
                        <label htmlFor="nom" className="form-label fw-semibold">
                          <FontAwesomeIcon icon={faCity} className="me-2" />
                          Nom de la ville <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <FontAwesomeIcon
                              icon={faCity}
                              className="text-muted"
                            />
                          </span>
                          <input
                            type="text"
                            id="nom"
                            name="nom"
                            className={`form-control border-start-0 ps-0 ${validationErrors.nom ? "is-invalid" : ""}`}
                            placeholder="Ex: Paris, Lyon, Marseille..."
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
                          Nom complet de la ville
                        </small>
                      </div>

                      {/* Code postal */}
                      <div className="col-md-3">
                        <label
                          htmlFor="code_postal"
                          className="form-label fw-semibold"
                        >
                          <FontAwesomeIcon
                            icon={faMapMarkerAlt}
                            className="me-2"
                          />
                          Code postal <span className="text-danger">*</span>
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
                            id="code_postal"
                            name="code_postal"
                            className={`form-control border-start-0 ps-0 ${validationErrors.code_postal ? "is-invalid" : ""}`}
                            placeholder="Ex: 75000, 69000"
                            value={formData.code_postal}
                            onChange={handleChange}
                            disabled={loading}
                            aria-describedby={
                              validationErrors.code_postal
                                ? "code-postal-error"
                                : undefined
                            }
                          />
                        </div>
                        {validationErrors.code_postal && (
                          <div
                            id="code-postal-error"
                            className="invalid-feedback d-block"
                          >
                            {validationErrors.code_postal}
                          </div>
                        )}
                        <small className="text-muted">
                          Code postal de la ville
                        </small>
                      </div>

                      {/* Statut */}
                      <div className="col-md-3">
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
                      {/* Pays */}
                      <div className="col-md-6">
                        <label
                          htmlFor="pays_uuid"
                          className="form-label fw-semibold"
                        >
                          <FontAwesomeIcon icon={faGlobe} className="me-2" />
                          Pays <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <FontAwesomeIcon
                              icon={faGlobe}
                              className="text-muted"
                            />
                          </span>
                          <select
                            id="pays_uuid"
                            name="pays_uuid"
                            className={`form-select border-start-0 ps-0 ${validationErrors.pays_uuid ? "is-invalid" : ""}`}
                            value={formData.pays_uuid}
                            onChange={handleChange}
                            disabled={loading || loadingPays}
                            style={{ borderRadius: "0 8px 8px 0" }}
                            aria-describedby={
                              validationErrors.pays_uuid
                                ? "pays-error"
                                : undefined
                            }
                          >
                            <option value="">Sélectionnez un pays</option>
                            {pays.map((pays: Pays) => (
                              <option key={pays.uuid} value={pays.uuid}>
                                {pays.nom} ({pays.code})
                              </option>
                            ))}
                          </select>
                        </div>
                        {validationErrors.pays_uuid && (
                          <div
                            id="pays-error"
                            className="invalid-feedback d-block"
                          >
                            {validationErrors.pays_uuid}
                          </div>
                        )}
                        <small className="text-muted">
                          Pays dans lequel se trouve la ville
                        </small>
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
                          placeholder="Description de la ville (facultatif)"
                          value={formData.description}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        <small className="text-muted">
                          Description optionnelle de la ville
                        </small>
                      </div>
                    </div>

                    <div className="row g-3 mt-3">
                      {/* Coordonnées GPS */}
                      <div className="col-md-6">
                        <div className="row g-2">
                          <div className="col-md-6">
                            <label
                              htmlFor="latitude"
                              className="form-label fw-semibold"
                            >
                              Latitude
                            </label>
                            <input
                              type="number"
                              id="latitude"
                              name="latitude"
                              className="form-control"
                              placeholder="Ex: 48.8566"
                              step="0.000001"
                              value={formData.latitude || ""}
                              onChange={handleChange}
                              disabled={loading}
                            />
                            <small className="text-muted">
                              Coordonnée nord-sud
                            </small>
                          </div>
                          <div className="col-md-6">
                            <label
                              htmlFor="longitude"
                              className="form-label fw-semibold"
                            >
                              Longitude
                            </label>
                            <input
                              type="number"
                              id="longitude"
                              name="longitude"
                              className="form-control"
                              placeholder="Ex: 2.3522"
                              step="0.000001"
                              value={formData.longitude || ""}
                              onChange={handleChange}
                              disabled={loading}
                            />
                            <small className="text-muted">
                              Coordonnée est-ouest
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Informations système */}
                {villeInfo && (
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
                              value={villeInfo.uuid}
                              readOnly
                              disabled
                              style={{ cursor: "not-allowed" }}
                            />
                          </div>
                          <small className="text-muted">
                            Identifiant unique
                          </small>
                        </div>

                        {/* Date de création */}
                        <div className="col-md-3">
                          <label className="form-label fw-semibold">
                            <FontAwesomeIcon
                              icon={faCalendarAlt}
                              className="me-2"
                            />
                            Créée le
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
                              value={formatDate(villeInfo.created_at)}
                              readOnly
                              disabled
                              style={{ cursor: "not-allowed" }}
                            />
                          </div>
                        </div>

                        {/* Date de modification */}
                        <div className="col-md-3">
                          <label className="form-label fw-semibold">
                            <FontAwesomeIcon
                              icon={faCalendarAlt}
                              className="me-2"
                            />
                            Modifiée le
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
                              value={formatDate(villeInfo.updated_at)}
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
                disabled={loading || loadingVille || !villeInfo}
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
                <FontAwesomeIcon icon={faSync} />
                Réinitialiser
              </button>

              <div className="d-flex gap-3">
                <button
                  type="button"
                  className="btn d-flex align-items-center gap-2"
                  onClick={handleClose}
                  disabled={loading || loadingVille}
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
                  disabled={loading || loadingVille}
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
