// app/(back-office)/dashboard-admin/villes/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faEye,
  faTrash,
  faCheckCircle,
  faRefresh,
  faSearch,
  faFilter,
  faSort,
  faSortUp,
  faSortDown,
  faTimes,
  faGlobe,
  faFlag,
  faMapMarkerAlt,
  faUsers,
  faCalendar,
  faCopy,
  faExclamationTriangle,
  faSync,
  faInfoCircle,
  faLayerGroup,
  faToggleOn,
  faToggleOff,
  faCity,
  faSave,
  faBan,
  faDownload,
  faFileExport,
  faPrint,
  faShare,
  faExternalLinkAlt,
  faChevronLeft,
  faChevronRight,
  faChevronUp,
  faChevronDown,
  faChartLine,
  faDatabase,
  faTemperatureHigh,
  faTemperatureLow,
  faMountain,
  faTree,
  faTint,
  faFire,
  faRoad,
  faBuilding,
  faLocationDot,
  faEarth,
  faHistory,
  faQuestionCircle,
  faCog,
  faList,
  faSpinner,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";

// Interfaces
interface Pays {
  uuid: string;
  nom: string;
  code: string;
  code_iso: string;
  indicatif: string;
  devise: string;
  continent: string;
  capitale: string;
  statut: string;
}

interface Ville {
  uuid: string;
  nom: string;
  code_postal: string;
  code_insee?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  superficie?: number;
  population?: number;
  densite?: number;
  statut: "actif" | "inactif" | "archive";
  est_capitale?: boolean;
  est_capitale_region?: boolean;
  est_capitale_departement?: boolean;
  annee_recensement?: number;
  evolution_population?: number;
  taux_natalite?: number;
  taux_mortalite?: number;
  nombre_entreprises?: number;
  taux_chomage?: number;
  revenu_median?: number;
  principales_activites?: string[];
  nombre_ecoles?: number;
  nombre_hopitaux?: number;
  sites_touristiques?: string[];
  espaces_verts?: number;
  qualite_air?: number;
  pays_uuid: string;
  pays?: Pays;
  region_uuid?: string;
  departement_uuid?: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_at?: string | null;
  created_by?: string;
  updated_by?: string;
}

// Interface pour l'état de sélection
interface SelectionState {
  allSelected: boolean;
  selectedIds: Set<string>;
}

// Composant de badge de statut
const StatusBadge = ({
  statut,
  is_deleted,
}: {
  statut: string;
  is_deleted: boolean;
}) => {
  if (is_deleted) {
    return (
      <span className="badge bg-dark bg-opacity-10 text-dark border border-dark border-opacity-25 d-inline-flex align-items-center gap-1 px-2 py-1">
        <FontAwesomeIcon icon={faTrash} className="fs-12" />
        <span className="fw-semibold">Supprimé</span>
      </span>
    );
  }

  switch (statut) {
    case "actif":
      return (
        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 d-inline-flex align-items-center gap-1 px-2 py-1">
          <FontAwesomeIcon icon={faCheckCircle} className="fs-12" />
          <span className="fw-semibold">Actif</span>
        </span>
      );
    case "inactif":
      return (
        <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 d-inline-flex align-items-center gap-1 px-2 py-1">
          <FontAwesomeIcon icon={faExclamationTriangle} className="fs-12" />
          <span className="fw-semibold">Inactif</span>
        </span>
      );
    case "archive":
      return (
        <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 d-inline-flex align-items-center gap-1 px-2 py-1">
          <FontAwesomeIcon icon={faHistory} className="fs-12" />
          <span className="fw-semibold">Archivé</span>
        </span>
      );
    default:
      return (
        <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 d-inline-flex align-items-center gap-1 px-2 py-1">
          <FontAwesomeIcon icon={faQuestionCircle} className="fs-12" />
          <span className="fw-semibold">{statut || "Inconnu"}</span>
        </span>
      );
  }
};

// Composant de badge de capitale
const CapitalBadge = ({
  est_capitale,
  est_capitale_region,
  est_capitale_departement,
}: {
  est_capitale?: boolean;
  est_capitale_region?: boolean;
  est_capitale_departement?: boolean;
}) => {
  if (est_capitale) {
    return (
      <span
        className="badge d-inline-flex align-items-center gap-1 px-2 py-1"
        style={{
          backgroundColor: `${colors.oskar.gold}15`,
          color: colors.oskar.goldHover,
          border: `1px solid ${colors.oskar.gold}30`,
          borderRadius: "20px",
        }}
      >
        <FontAwesomeIcon icon={faBuilding} className="fs-12" />
        <span className="fw-semibold">Capitale</span>
      </span>
    );
  }

  if (est_capitale_region) {
    return (
      <span
        className="badge d-inline-flex align-items-center gap-1 px-2 py-1"
        style={{
          backgroundColor: `${colors.oskar.blue}15`,
          color: colors.oskar.blue,
          border: `1px solid ${colors.oskar.blue}30`,
          borderRadius: "20px",
        }}
      >
        <FontAwesomeIcon icon={faGlobe} className="fs-12" />
        <span className="fw-semibold">Capitale Région</span>
      </span>
    );
  }

  if (est_capitale_departement) {
    return (
      <span
        className="badge d-inline-flex align-items-center gap-1 px-2 py-1"
        style={{
          backgroundColor: `${colors.oskar.green}15`,
          color: colors.oskar.green,
          border: `1px solid ${colors.oskar.green}30`,
          borderRadius: "20px",
        }}
      >
        <FontAwesomeIcon icon={faMapMarkerAlt} className="fs-12" />
        <span className="fw-semibold">Capitale Département</span>
      </span>
    );
  }

  return null;
};

// Composant de badge de coordonnées
const CoordinatesBadge = ({
  latitude,
  longitude,
}: {
  latitude?: number;
  longitude?: number;
}) => {
  if (!latitude || !longitude) {
    return (
      <span
        className="badge d-inline-flex align-items-center gap-1 px-2 py-1"
        style={{
          backgroundColor: `${colors.oskar.grey}15`,
          color: colors.oskar.grey,
          border: `1px solid ${colors.oskar.grey}30`,
          borderRadius: "20px",
        }}
      >
        <FontAwesomeIcon icon={faTimesCircle} className="fs-12" />
        <span className="fw-semibold">Pas de GPS</span>
      </span>
    );
  }

  return (
    <span
      className="badge d-inline-flex align-items-center gap-1 px-2 py-1 cursor-pointer"
      style={{
        backgroundColor: `${colors.oskar.purple}15`,
        color: colors.oskar.purple,
        border: `1px solid ${colors.oskar.purple}30`,
        borderRadius: "20px",
      }}
      title={`${latitude}, ${longitude}`}
      onClick={() => {
        const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
        window.open(url, "_blank");
      }}
    >
      <FontAwesomeIcon icon={faLocationDot} className="fs-12" />
      <span className="fw-semibold">GPS</span>
    </span>
  );
};

// Composant de badge de population
const PopulationBadge = ({ population }: { population?: number }) => {
  if (!population || population === 0) {
    return (
      <span
        className="badge d-inline-flex align-items-center gap-1 px-2 py-1"
        style={{
          backgroundColor: `${colors.oskar.grey}15`,
          color: colors.oskar.grey,
          border: `1px solid ${colors.oskar.grey}30`,
          borderRadius: "20px",
        }}
      >
        <FontAwesomeIcon icon={faUsers} className="fs-12" />
        <span className="fw-semibold">N/A</span>
      </span>
    );
  }

  const getPopulationColor = (pop: number) => {
    if (pop < 10000) return colors.oskar.green;
    if (pop < 100000) return colors.oskar.cyan;
    if (pop < 500000) return colors.oskar.blue;
    if (pop < 1000000) return colors.oskar.orange;
    return colors.oskar.red;
  };

  const color = getPopulationColor(population);
  const formattedPopulation = formatNumber(population);

  return (
    <span
      className="badge d-inline-flex align-items-center gap-1 px-2 py-1"
      style={{
        backgroundColor: `${color}15`,
        color: color,
        border: `1px solid ${color}30`,
        borderRadius: "20px",
      }}
      title={`${formattedPopulation} habitants`}
    >
      <FontAwesomeIcon icon={faUsers} className="fs-12" />
      <span className="fw-semibold">{formattedPopulation}</span>
    </span>
  );
};

// Fonction pour formater les grands nombres
const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat("fr-FR").format(num);
};

// Fonction pour formater la date
const formatDate = (dateString: string | null | undefined) => {
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
};

// Fonction pour formater la date sans heure
const formatDateOnly = (dateString: string | null | undefined) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Date invalide";
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  } catch {
    return "N/A";
  }
};

// Fonction pour calculer la densité
const calculateDensity = (population?: number, superficie?: number) => {
  if (!population || !superficie || superficie === 0) return 0;
  return population / superficie;
};

// Composants de Modals avec nouveau design

// Modal de création de ville
const CreateVilleModal = ({
  isOpen,
  onClose,
  onSuccess,
  paysList,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  paysList: Pays[];
}) => {
  const [formData, setFormData] = useState({
    nom: "",
    code_postal: "",
    pays_uuid: "",
    statut: "actif",
    description: "",
    latitude: "",
    longitude: "",
    code_insee: "",
    altitude: "",
    superficie: "",
    population: "",
    est_capitale: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        nom: "",
        code_postal: "",
        pays_uuid: "",
        statut: "actif",
        description: "",
        latitude: "",
        longitude: "",
        code_insee: "",
        altitude: "",
        superficie: "",
        population: "",
        est_capitale: false,
      });
      setError(null);
      setSuccessMessage(null);
      setValidationErrors({});
    }
  }, [isOpen]);

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
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.nom.trim()) errors.nom = "Le nom est obligatoire";
    if (!formData.code_postal.trim())
      errors.code_postal = "Le code postal est obligatoire";
    if (!formData.pays_uuid) errors.pays_uuid = "Le pays est obligatoire";
    if (formData.latitude && isNaN(parseFloat(formData.latitude)))
      errors.latitude = "Latitude invalide";
    if (formData.longitude && isNaN(parseFloat(formData.longitude)))
      errors.longitude = "Longitude invalide";
    if (formData.population && isNaN(parseInt(formData.population)))
      errors.population = "Population invalide";
    if (formData.superficie && isNaN(parseFloat(formData.superficie)))
      errors.superficie = "Superficie invalide";
    if (formData.altitude && isNaN(parseFloat(formData.altitude)))
      errors.altitude = "Altitude invalide";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);

      const villeData = {
        nom: formData.nom.trim(),
        code_postal: formData.code_postal.trim(),
        pays_uuid: formData.pays_uuid,
        statut: formData.statut,
        description: formData.description.trim() || undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude
          ? parseFloat(formData.longitude)
          : undefined,
        code_insee: formData.code_insee.trim() || undefined,
        altitude: formData.altitude ? parseFloat(formData.altitude) : undefined,
        superficie: formData.superficie
          ? parseFloat(formData.superficie)
          : undefined,
        population: formData.population
          ? parseInt(formData.population)
          : undefined,
        est_capitale: formData.est_capitale,
      };

      await api.post(API_ENDPOINTS.VILLES.CREATE, villeData);

      setSuccessMessage("Ville créée avec succès !");

      // Réinitialiser le formulaire
      setFormData({
        nom: "",
        code_postal: "",
        pays_uuid: "",
        statut: "actif",
        description: "",
        latitude: "",
        longitude: "",
        code_insee: "",
        altitude: "",
        superficie: "",
        population: "",
        est_capitale: false,
      });

      // Fermer après succès
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("❌ Erreur création ville:", err);
      setError(
        err.response?.data?.message || "Erreur lors de la création de la ville",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      nom: "",
      code_postal: "",
      pays_uuid: "",
      statut: "actif",
      description: "",
      latitude: "",
      longitude: "",
      code_insee: "",
      altitude: "",
      superficie: "",
      population: "",
      est_capitale: false,
    });
    setError(null);
    setSuccessMessage(null);
    setValidationErrors({});
  };

  const handleClose = () => {
    if (loading) return;

    if (
      formData.nom ||
      formData.code_postal ||
      formData.description ||
      formData.latitude ||
      formData.longitude
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
                <FontAwesomeIcon icon={faPlus} className="fs-5" />
              </div>
              <div>
                <h5 className="modal-title mb-0 fw-bold">
                  Créer une Nouvelle Ville
                </h5>
                <p className="mb-0 opacity-75 fs-14">
                  Ajoutez une nouvelle ville dans le système
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
                  style={{
                    background: colors.oskar.lightGrey,
                    borderLeft: `4px solid ${colors.oskar.blue}`,
                  }}
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
                        Informations de Base
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
                        Nom de la Ville <span className="text-danger">*</span>
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
                        />
                      </div>
                      {validationErrors.nom && (
                        <div className="invalid-feedback d-block">
                          {validationErrors.nom}
                        </div>
                      )}
                    </div>

                    {/* Code postal */}
                    <div className="col-md-6">
                      <label
                        htmlFor="code_postal"
                        className="form-label fw-semibold"
                      >
                        Code Postal <span className="text-danger">*</span>
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
                          placeholder="Ex: 75000, 69000..."
                          value={formData.code_postal}
                          onChange={handleChange}
                          disabled={loading}
                        />
                      </div>
                      {validationErrors.code_postal && (
                        <div className="invalid-feedback d-block">
                          {validationErrors.code_postal}
                        </div>
                      )}
                    </div>

                    {/* Pays */}
                    <div className="col-md-6">
                      <label
                        htmlFor="pays_uuid"
                        className="form-label fw-semibold"
                      >
                        Pays <span className="text-danger">*</span>
                      </label>
                      <select
                        id="pays_uuid"
                        name="pays_uuid"
                        className={`form-select ${validationErrors.pays_uuid ? "is-invalid" : ""}`}
                        value={formData.pays_uuid}
                        onChange={handleChange}
                        disabled={loading}
                        style={{ borderRadius: "8px" }}
                      >
                        <option value="">Sélectionnez un pays</option>
                        {paysList.map((pays) => (
                          <option key={pays.uuid} value={pays.uuid}>
                            {pays.nom} ({pays.code})
                          </option>
                        ))}
                      </select>
                      {validationErrors.pays_uuid && (
                        <div className="invalid-feedback d-block">
                          {validationErrors.pays_uuid}
                        </div>
                      )}
                    </div>

                    {/* Statut */}
                    <div className="col-md-6">
                      <label
                        htmlFor="statut"
                        className="form-label fw-semibold"
                      >
                        Statut
                      </label>
                      <select
                        id="statut"
                        name="statut"
                        className="form-select"
                        value={formData.statut}
                        onChange={handleChange}
                        disabled={loading}
                        style={{ borderRadius: "8px" }}
                      >
                        <option value="actif">Actif</option>
                        <option value="inactif">Inactif</option>
                        <option value="archive">Archivé</option>
                      </select>
                    </div>

                    {/* Code INSEE */}
                    <div className="col-md-6">
                      <label
                        htmlFor="code_insee"
                        className="form-label fw-semibold"
                      >
                        Code INSEE
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
                          id="code_insee"
                          name="code_insee"
                          className="form-control border-start-0 ps-0"
                          placeholder="Ex: 75056, 69123..."
                          value={formData.code_insee}
                          onChange={handleChange}
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Capitale */}
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
                              icon={faBuilding}
                              style={{ color: colors.oskar.green }}
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="est_capitale"
                              className="form-check-label fw-semibold"
                            >
                              Est une capitale ?
                            </label>
                            <p className="mb-0 text-muted fs-12">
                              Indique si cette ville est une capitale
                            </p>
                          </div>
                        </div>
                        <div className="form-check form-switch">
                          <input
                            type="checkbox"
                            id="est_capitale"
                            name="est_capitale"
                            className="form-check-input"
                            style={{ width: "3em", height: "1.5em" }}
                            checked={formData.est_capitale}
                            onChange={handleChange}
                            disabled={loading}
                          />
                        </div>
                      </div>
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
                        className="form-control"
                        placeholder="Description de la ville..."
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
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Géographie */}
              <div
                className="card border-0 shadow-sm mb-4"
                style={{ borderRadius: "12px" }}
              >
                <div
                  className="card-header border-0 py-3"
                  style={{
                    background: colors.oskar.lightGrey,
                    borderLeft: `4px solid ${colors.oskar.purple}`,
                  }}
                >
                  <div className="d-flex align-items-center">
                    <div
                      className="rounded-circle p-2 me-3"
                      style={{ backgroundColor: `${colors.oskar.purple}15` }}
                    >
                      <FontAwesomeIcon
                        icon={faGlobe}
                        style={{ color: colors.oskar.purple }}
                      />
                    </div>
                    <div>
                      <h6
                        className="mb-0 fw-bold"
                        style={{ color: colors.oskar.purple }}
                      >
                        Coordonnées Géographiques
                      </h6>
                      <small className="text-muted">
                        Informations de localisation
                      </small>
                    </div>
                  </div>
                </div>
                <div className="card-body p-4">
                  <div className="row g-3">
                    {/* Latitude */}
                    <div className="col-md-6">
                      <label
                        htmlFor="latitude"
                        className="form-label fw-semibold"
                      >
                        Latitude
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <FontAwesomeIcon
                            icon={faLocationDot}
                            className="text-muted"
                          />
                        </span>
                        <input
                          type="number"
                          step="0.000001"
                          id="latitude"
                          name="latitude"
                          className={`form-control border-start-0 ps-0 ${validationErrors.latitude ? "is-invalid" : ""}`}
                          placeholder="Ex: 48.8566"
                          value={formData.latitude}
                          onChange={handleChange}
                          disabled={loading}
                        />
                      </div>
                      {validationErrors.latitude && (
                        <div className="invalid-feedback d-block">
                          {validationErrors.latitude}
                        </div>
                      )}
                    </div>

                    {/* Longitude */}
                    <div className="col-md-6">
                      <label
                        htmlFor="longitude"
                        className="form-label fw-semibold"
                      >
                        Longitude
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <FontAwesomeIcon
                            icon={faLocationDot}
                            className="text-muted"
                          />
                        </span>
                        <input
                          type="number"
                          step="0.000001"
                          id="longitude"
                          name="longitude"
                          className={`form-control border-start-0 ps-0 ${validationErrors.longitude ? "is-invalid" : ""}`}
                          placeholder="Ex: 2.3522"
                          value={formData.longitude}
                          onChange={handleChange}
                          disabled={loading}
                        />
                      </div>
                      {validationErrors.longitude && (
                        <div className="invalid-feedback d-block">
                          {validationErrors.longitude}
                        </div>
                      )}
                    </div>

                    {/* Altitude */}
                    <div className="col-md-6">
                      <label
                        htmlFor="altitude"
                        className="form-label fw-semibold"
                      >
                        Altitude (mètres)
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <FontAwesomeIcon
                            icon={faMountain}
                            className="text-muted"
                          />
                        </span>
                        <input
                          type="number"
                          step="0.1"
                          id="altitude"
                          name="altitude"
                          className={`form-control border-start-0 ps-0 ${validationErrors.altitude ? "is-invalid" : ""}`}
                          placeholder="Ex: 130"
                          value={formData.altitude}
                          onChange={handleChange}
                          disabled={loading}
                        />
                      </div>
                      {validationErrors.altitude && (
                        <div className="invalid-feedback d-block">
                          {validationErrors.altitude}
                        </div>
                      )}
                    </div>

                    {/* Superficie */}
                    <div className="col-md-6">
                      <label
                        htmlFor="superficie"
                        className="form-label fw-semibold"
                      >
                        Superficie (km²)
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <FontAwesomeIcon
                            icon={faEarth}
                            className="text-muted"
                          />
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          id="superficie"
                          name="superficie"
                          className={`form-control border-start-0 ps-0 ${validationErrors.superficie ? "is-invalid" : ""}`}
                          placeholder="Ex: 105.4"
                          value={formData.superficie}
                          onChange={handleChange}
                          disabled={loading}
                        />
                      </div>
                      {validationErrors.superficie && (
                        <div className="invalid-feedback d-block">
                          {validationErrors.superficie}
                        </div>
                      )}
                    </div>

                    {/* Population */}
                    <div className="col-md-6">
                      <label
                        htmlFor="population"
                        className="form-label fw-semibold"
                      >
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
                          type="number"
                          id="population"
                          name="population"
                          className={`form-control border-start-0 ps-0 ${validationErrors.population ? "is-invalid" : ""}`}
                          placeholder="Ex: 2145906"
                          value={formData.population}
                          onChange={handleChange}
                          disabled={loading}
                        />
                      </div>
                      {validationErrors.population && (
                        <div className="invalid-feedback d-block">
                          {validationErrors.population}
                        </div>
                      )}
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
                  color: colors.oskar.blue,
                  border: `1px solid ${colors.oskar.blue}30`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.oskar.blue + "10";
                  e.currentTarget.style.color = colors.oskar.blueHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.oskar.lightGrey;
                  e.currentTarget.style.color = colors.oskar.blue;
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
                    e.currentTarget.style.background = colors.oskar.greenHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = colors.oskar.green;
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
                      Créer la Ville
                    </>
                  )}
                </button>
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
      </div>
    </div>
  );
};

// Modal d'édition de ville
const EditVilleModal = ({
  isOpen,
  ville,
  onClose,
  onSuccess,
  paysList,
}: {
  isOpen: boolean;
  ville: Ville | null;
  onClose: () => void;
  onSuccess: () => void;
  paysList: Pays[];
}) => {
  const [formData, setFormData] = useState({
    nom: "",
    code_postal: "",
    pays_uuid: "",
    statut: "actif",
    description: "",
    latitude: "",
    longitude: "",
    code_insee: "",
    altitude: "",
    superficie: "",
    population: "",
    est_capitale: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (ville) {
      setFormData({
        nom: ville.nom || "",
        code_postal: ville.code_postal || "",
        pays_uuid: ville.pays_uuid || "",
        statut: ville.statut || "actif",
        description: ville.description || "",
        latitude: ville.latitude?.toString() || "",
        longitude: ville.longitude?.toString() || "",
        code_insee: ville.code_insee || "",
        altitude: ville.altitude?.toString() || "",
        superficie: ville.superficie?.toString() || "",
        population: ville.population?.toString() || "",
        est_capitale: ville.est_capitale || false,
      });
    }
  }, [ville]);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setSuccessMessage(null);
      setValidationErrors({});
    }
  }, [isOpen]);

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
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.nom.trim()) errors.nom = "Le nom est obligatoire";
    if (!formData.code_postal.trim())
      errors.code_postal = "Le code postal est obligatoire";
    if (!formData.pays_uuid) errors.pays_uuid = "Le pays est obligatoire";
    if (formData.latitude && isNaN(parseFloat(formData.latitude)))
      errors.latitude = "Latitude invalide";
    if (formData.longitude && isNaN(parseFloat(formData.longitude)))
      errors.longitude = "Longitude invalide";
    if (formData.population && isNaN(parseInt(formData.population)))
      errors.population = "Population invalide";
    if (formData.superficie && isNaN(parseFloat(formData.superficie)))
      errors.superficie = "Superficie invalide";
    if (formData.altitude && isNaN(parseFloat(formData.altitude)))
      errors.altitude = "Altitude invalide";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ville || !validateForm()) return;

    try {
      setLoading(true);
      setError(null);

      const villeData = {
        nom: formData.nom.trim(),
        code_postal: formData.code_postal.trim(),
        pays_uuid: formData.pays_uuid,
        statut: formData.statut,
        description: formData.description.trim() || undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude
          ? parseFloat(formData.longitude)
          : undefined,
        code_insee: formData.code_insee.trim() || undefined,
        altitude: formData.altitude ? parseFloat(formData.altitude) : undefined,
        superficie: formData.superficie
          ? parseFloat(formData.superficie)
          : undefined,
        population: formData.population
          ? parseInt(formData.population)
          : undefined,
        est_capitale: formData.est_capitale,
      };

      await api.put(API_ENDPOINTS.VILLES.UPDATE(ville.uuid), villeData);

      setSuccessMessage("Ville modifiée avec succès !");

      // Fermer après succès
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("❌ Erreur modification ville:", err);
      setError(
        err.response?.data?.message ||
          "Erreur lors de la modification de la ville",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (ville) {
      setFormData({
        nom: ville.nom || "",
        code_postal: ville.code_postal || "",
        pays_uuid: ville.pays_uuid || "",
        statut: ville.statut || "actif",
        description: ville.description || "",
        latitude: ville.latitude?.toString() || "",
        longitude: ville.longitude?.toString() || "",
        code_insee: ville.code_insee || "",
        altitude: ville.altitude?.toString() || "",
        superficie: ville.superficie?.toString() || "",
        population: ville.population?.toString() || "",
        est_capitale: ville.est_capitale || false,
      });
    }
    setError(null);
    setSuccessMessage(null);
    setValidationErrors({});
  };

  const handleClose = () => {
    if (loading) return;

    const originalData = ville
      ? {
          nom: ville.nom || "",
          code_postal: ville.code_postal || "",
          pays_uuid: ville.pays_uuid || "",
          statut: ville.statut || "actif",
          description: ville.description || "",
          latitude: ville.latitude?.toString() || "",
          longitude: ville.longitude?.toString() || "",
          code_insee: ville.code_insee || "",
          altitude: ville.altitude?.toString() || "",
          superficie: ville.superficie?.toString() || "",
          population: ville.population?.toString() || "",
          est_capitale: ville.est_capitale || false,
        }
      : null;

    if (
      originalData &&
      JSON.stringify(formData) !== JSON.stringify(originalData)
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

  if (!isOpen || !ville) return null;

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
            style={{ background: colors.oskar.orange }}
          >
            <div className="d-flex align-items-center">
              <div className="bg-white bg-opacity-20 rounded-circle p-2 me-3">
                <FontAwesomeIcon icon={faEdit} className="fs-5" />
              </div>
              <div>
                <h5 className="modal-title mb-0 fw-bold">
                  Modifier la Ville: {ville.nom}
                </h5>
                <p className="mb-0 opacity-75 fs-14">
                  Modifiez les informations de la ville
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
                  style={{
                    background: colors.oskar.lightGrey,
                    borderLeft: `4px solid ${colors.oskar.blue}`,
                  }}
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
                        Informations de Base
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
                        Nom de la Ville <span className="text-danger">*</span>
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
                        />
                      </div>
                      {validationErrors.nom && (
                        <div className="invalid-feedback d-block">
                          {validationErrors.nom}
                        </div>
                      )}
                    </div>

                    {/* Code postal */}
                    <div className="col-md-6">
                      <label
                        htmlFor="code_postal"
                        className="form-label fw-semibold"
                      >
                        Code Postal <span className="text-danger">*</span>
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
                          placeholder="Ex: 75000, 69000..."
                          value={formData.code_postal}
                          onChange={handleChange}
                          disabled={loading}
                        />
                      </div>
                      {validationErrors.code_postal && (
                        <div className="invalid-feedback d-block">
                          {validationErrors.code_postal}
                        </div>
                      )}
                    </div>

                    {/* Pays */}
                    <div className="col-md-6">
                      <label
                        htmlFor="pays_uuid"
                        className="form-label fw-semibold"
                      >
                        Pays <span className="text-danger">*</span>
                      </label>
                      <select
                        id="pays_uuid"
                        name="pays_uuid"
                        className={`form-select ${validationErrors.pays_uuid ? "is-invalid" : ""}`}
                        value={formData.pays_uuid}
                        onChange={handleChange}
                        disabled={loading}
                        style={{ borderRadius: "8px" }}
                      >
                        <option value="">Sélectionnez un pays</option>
                        {paysList.map((pays) => (
                          <option key={pays.uuid} value={pays.uuid}>
                            {pays.nom} ({pays.code})
                          </option>
                        ))}
                      </select>
                      {validationErrors.pays_uuid && (
                        <div className="invalid-feedback d-block">
                          {validationErrors.pays_uuid}
                        </div>
                      )}
                    </div>

                    {/* Statut */}
                    <div className="col-md-6">
                      <label
                        htmlFor="statut"
                        className="form-label fw-semibold"
                      >
                        Statut
                      </label>
                      <select
                        id="statut"
                        name="statut"
                        className="form-select"
                        value={formData.statut}
                        onChange={handleChange}
                        disabled={loading}
                        style={{ borderRadius: "8px" }}
                      >
                        <option value="actif">Actif</option>
                        <option value="inactif">Inactif</option>
                        <option value="archive">Archivé</option>
                      </select>
                    </div>

                    {/* Code INSEE */}
                    <div className="col-md-6">
                      <label
                        htmlFor="code_insee"
                        className="form-label fw-semibold"
                      >
                        Code INSEE
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
                          id="code_insee"
                          name="code_insee"
                          className="form-control border-start-0 ps-0"
                          placeholder="Ex: 75056, 69123..."
                          value={formData.code_insee}
                          onChange={handleChange}
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Capitale */}
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
                              icon={faBuilding}
                              style={{ color: colors.oskar.green }}
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="est_capitale"
                              className="form-check-label fw-semibold"
                            >
                              Est une capitale ?
                            </label>
                            <p className="mb-0 text-muted fs-12">
                              Indique si cette ville est une capitale
                            </p>
                          </div>
                        </div>
                        <div className="form-check form-switch">
                          <input
                            type="checkbox"
                            id="est_capitale"
                            name="est_capitale"
                            className="form-check-input"
                            style={{ width: "3em", height: "1.5em" }}
                            checked={formData.est_capitale}
                            onChange={handleChange}
                            disabled={loading}
                          />
                        </div>
                      </div>
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
                        className="form-control"
                        placeholder="Description de la ville..."
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
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Géographie */}
              <div
                className="card border-0 shadow-sm mb-4"
                style={{ borderRadius: "12px" }}
              >
                <div
                  className="card-header border-0 py-3"
                  style={{
                    background: colors.oskar.lightGrey,
                    borderLeft: `4px solid ${colors.oskar.purple}`,
                  }}
                >
                  <div className="d-flex align-items-center">
                    <div
                      className="rounded-circle p-2 me-3"
                      style={{ backgroundColor: `${colors.oskar.purple}15` }}
                    >
                      <FontAwesomeIcon
                        icon={faGlobe}
                        style={{ color: colors.oskar.purple }}
                      />
                    </div>
                    <div>
                      <h6
                        className="mb-0 fw-bold"
                        style={{ color: colors.oskar.purple }}
                      >
                        Coordonnées Géographiques
                      </h6>
                      <small className="text-muted">
                        Informations de localisation
                      </small>
                    </div>
                  </div>
                </div>
                <div className="card-body p-4">
                  <div className="row g-3">
                    {/* Latitude */}
                    <div className="col-md-6">
                      <label
                        htmlFor="latitude"
                        className="form-label fw-semibold"
                      >
                        Latitude
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <FontAwesomeIcon
                            icon={faLocationDot}
                            className="text-muted"
                          />
                        </span>
                        <input
                          type="number"
                          step="0.000001"
                          id="latitude"
                          name="latitude"
                          className={`form-control border-start-0 ps-0 ${validationErrors.latitude ? "is-invalid" : ""}`}
                          placeholder="Ex: 48.8566"
                          value={formData.latitude}
                          onChange={handleChange}
                          disabled={loading}
                        />
                      </div>
                      {validationErrors.latitude && (
                        <div className="invalid-feedback d-block">
                          {validationErrors.latitude}
                        </div>
                      )}
                    </div>

                    {/* Longitude */}
                    <div className="col-md-6">
                      <label
                        htmlFor="longitude"
                        className="form-label fw-semibold"
                      >
                        Longitude
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <FontAwesomeIcon
                            icon={faLocationDot}
                            className="text-muted"
                          />
                        </span>
                        <input
                          type="number"
                          step="0.000001"
                          id="longitude"
                          name="longitude"
                          className={`form-control border-start-0 ps-0 ${validationErrors.longitude ? "is-invalid" : ""}`}
                          placeholder="Ex: 2.3522"
                          value={formData.longitude}
                          onChange={handleChange}
                          disabled={loading}
                        />
                      </div>
                      {validationErrors.longitude && (
                        <div className="invalid-feedback d-block">
                          {validationErrors.longitude}
                        </div>
                      )}
                    </div>

                    {/* Altitude */}
                    <div className="col-md-6">
                      <label
                        htmlFor="altitude"
                        className="form-label fw-semibold"
                      >
                        Altitude (mètres)
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <FontAwesomeIcon
                            icon={faMountain}
                            className="text-muted"
                          />
                        </span>
                        <input
                          type="number"
                          step="0.1"
                          id="altitude"
                          name="altitude"
                          className={`form-control border-start-0 ps-0 ${validationErrors.altitude ? "is-invalid" : ""}`}
                          placeholder="Ex: 130"
                          value={formData.altitude}
                          onChange={handleChange}
                          disabled={loading}
                        />
                      </div>
                      {validationErrors.altitude && (
                        <div className="invalid-feedback d-block">
                          {validationErrors.altitude}
                        </div>
                      )}
                    </div>

                    {/* Superficie */}
                    <div className="col-md-6">
                      <label
                        htmlFor="superficie"
                        className="form-label fw-semibold"
                      >
                        Superficie (km²)
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <FontAwesomeIcon
                            icon={faEarth}
                            className="text-muted"
                          />
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          id="superficie"
                          name="superficie"
                          className={`form-control border-start-0 ps-0 ${validationErrors.superficie ? "is-invalid" : ""}`}
                          placeholder="Ex: 105.4"
                          value={formData.superficie}
                          onChange={handleChange}
                          disabled={loading}
                        />
                      </div>
                      {validationErrors.superficie && (
                        <div className="invalid-feedback d-block">
                          {validationErrors.superficie}
                        </div>
                      )}
                    </div>

                    {/* Population */}
                    <div className="col-md-6">
                      <label
                        htmlFor="population"
                        className="form-label fw-semibold"
                      >
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
                          type="number"
                          id="population"
                          name="population"
                          className={`form-control border-start-0 ps-0 ${validationErrors.population ? "is-invalid" : ""}`}
                          placeholder="Ex: 2145906"
                          value={formData.population}
                          onChange={handleChange}
                          disabled={loading}
                        />
                      </div>
                      {validationErrors.population && (
                        <div className="invalid-feedback d-block">
                          {validationErrors.population}
                        </div>
                      )}
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
                  color: colors.oskar.blue,
                  border: `1px solid ${colors.oskar.blue}30`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.oskar.blue + "10";
                  e.currentTarget.style.color = colors.oskar.blueHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.oskar.lightGrey;
                  e.currentTarget.style.color = colors.oskar.blue;
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
                  style={{ background: colors.oskar.orange }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.oskar.orangeHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = colors.oskar.orange;
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
                      Modifier la Ville
                    </>
                  )}
                </button>
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
      </div>
    </div>
  );
};

// Modal de visualisation de ville
const ViewVilleModal = ({
  isOpen,
  ville,
  onClose,
  onEdit,
}: {
  isOpen: boolean;
  ville: Ville | null;
  onClose: () => void;
  onEdit: () => void;
}) => {
  const [activeTab, setActiveTab] = useState<
    "info" | "geographie" | "demographie" | "economie"
  >("info");

  if (!isOpen || !ville) return null;

  const getDensity = () => {
    if (!ville.population || !ville.superficie || ville.superficie === 0)
      return 0;
    return ville.population / ville.superficie;
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(2px)",
      }}
    >
      <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg">
          {/* En-tête de la modal */}
          <div
            className="modal-header text-white border-0 rounded-top-3"
            style={{ background: colors.oskar.blue }}
          >
            <div className="d-flex align-items-center justify-content-between w-100">
              <div className="d-flex align-items-center">
                <div className="bg-white bg-opacity-20 rounded-circle p-2 me-3">
                  <FontAwesomeIcon icon={faEye} className="fs-5" />
                </div>
                <div>
                  <h5 className="modal-title mb-0 fw-bold">
                    Détails de la Ville: {ville.nom}
                  </h5>
                  <p className="mb-0 opacity-75 fs-14">
                    Consultez toutes les informations de la ville
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
                aria-label="Fermer"
                style={{ filter: "brightness(0) invert(1)" }}
              ></button>
            </div>
          </div>

          {/* Corps de la modal */}
          <div className="modal-body py-4">
            {/* Onglets */}
            <div className="border-bottom mb-4">
              <ul className="nav nav-tabs border-0">
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === "info" ? "active" : ""}`}
                    onClick={() => setActiveTab("info")}
                    style={{
                      borderBottom:
                        activeTab === "info"
                          ? `3px solid ${colors.oskar.blue}`
                          : "none",
                      color:
                        activeTab === "info"
                          ? colors.oskar.blue
                          : colors.oskar.grey,
                      fontWeight: activeTab === "info" ? "600" : "400",
                      padding: "12px 20px",
                    }}
                  >
                    <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                    Informations
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === "geographie" ? "active" : ""}`}
                    onClick={() => setActiveTab("geographie")}
                    style={{
                      borderBottom:
                        activeTab === "geographie"
                          ? `3px solid ${colors.oskar.blue}`
                          : "none",
                      color:
                        activeTab === "geographie"
                          ? colors.oskar.blue
                          : colors.oskar.grey,
                      fontWeight: activeTab === "geographie" ? "600" : "400",
                      padding: "12px 20px",
                    }}
                  >
                    <FontAwesomeIcon icon={faGlobe} className="me-2" />
                    Géographie
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === "demographie" ? "active" : ""}`}
                    onClick={() => setActiveTab("demographie")}
                    style={{
                      borderBottom:
                        activeTab === "demographie"
                          ? `3px solid ${colors.oskar.blue}`
                          : "none",
                      color:
                        activeTab === "demographie"
                          ? colors.oskar.blue
                          : colors.oskar.grey,
                      fontWeight: activeTab === "demographie" ? "600" : "400",
                      padding: "12px 20px",
                    }}
                  >
                    <FontAwesomeIcon icon={faUsers} className="me-2" />
                    Démographie
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === "economie" ? "active" : ""}`}
                    onClick={() => setActiveTab("economie")}
                    style={{
                      borderBottom:
                        activeTab === "economie"
                          ? `3px solid ${colors.oskar.blue}`
                          : "none",
                      color:
                        activeTab === "economie"
                          ? colors.oskar.blue
                          : colors.oskar.grey,
                      fontWeight: activeTab === "economie" ? "600" : "400",
                      padding: "12px 20px",
                    }}
                  >
                    <FontAwesomeIcon icon={faChartLine} className="me-2" />
                    Économie
                  </button>
                </li>
              </ul>
            </div>

            {/* Contenu des onglets */}
            <div className="tab-content">
              {activeTab === "info" && (
                <div className="row">
                  <div className="col-md-6">
                    <div
                      className="card border-0 shadow-sm mb-4"
                      style={{ borderRadius: "12px" }}
                    >
                      <div
                        className="card-header border-0 py-3"
                        style={{
                          background: colors.oskar.lightGrey,
                          borderLeft: `4px solid ${colors.oskar.blue}`,
                        }}
                      >
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle p-2 me-3"
                            style={{
                              backgroundColor: `${colors.oskar.blue}15`,
                            }}
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
                              Informations de Base
                            </h6>
                          </div>
                        </div>
                      </div>
                      <div className="card-body p-4">
                        <div className="row">
                          <div className="col-6 mb-3">
                            <small className="text-muted">Nom</small>
                            <div className="fw-bold">{ville.nom}</div>
                          </div>
                          <div className="col-6 mb-3">
                            <small className="text-muted">Code postal</small>
                            <div className="fw-bold">{ville.code_postal}</div>
                          </div>
                          <div className="col-6 mb-3">
                            <small className="text-muted">Code INSEE</small>
                            <div className="fw-bold">
                              {ville.code_insee || "N/A"}
                            </div>
                          </div>
                          <div className="col-6 mb-3">
                            <small className="text-muted">Statut</small>
                            <div>
                              <StatusBadge
                                statut={ville.statut}
                                is_deleted={ville.is_deleted}
                              />
                            </div>
                          </div>
                          <div className="col-6 mb-3">
                            <small className="text-muted">Capitale</small>
                            <div className="fw-bold">
                              {ville.est_capitale ? "Oui" : "Non"}
                            </div>
                          </div>
                          <div className="col-12">
                            <small className="text-muted">Description</small>
                            <div
                              className="mt-2 p-3 rounded"
                              style={{ background: colors.oskar.lightGrey }}
                            >
                              {ville.description || "Aucune description"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div
                      className="card border-0 shadow-sm mb-4"
                      style={{ borderRadius: "12px" }}
                    >
                      <div
                        className="card-header border-0 py-3"
                        style={{
                          background: colors.oskar.lightGrey,
                          borderLeft: `4px solid ${colors.oskar.green}`,
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
                              icon={faGlobe}
                              style={{ color: colors.oskar.green }}
                            />
                          </div>
                          <div>
                            <h6
                              className="mb-0 fw-bold"
                              style={{ color: colors.oskar.green }}
                            >
                              Pays et Localisation
                            </h6>
                          </div>
                        </div>
                      </div>
                      <div className="card-body p-4">
                        {ville.pays && (
                          <div className="d-flex align-items-center mb-4">
                            <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                              <FontAwesomeIcon
                                icon={faFlag}
                                className="text-primary fs-4"
                              />
                            </div>
                            <div>
                              <div className="fw-bold fs-5">
                                {ville.pays.nom}
                              </div>
                              <div className="text-muted small">
                                Code: {ville.pays.code} | Indicatif:{" "}
                                {ville.pays.indicatif}
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="row">
                          <div className="col-6 mb-3">
                            <small className="text-muted">Continent</small>
                            <div className="fw-bold">
                              {ville.pays?.continent || "N/A"}
                            </div>
                          </div>
                          <div className="col-6 mb-3">
                            <small className="text-muted">Devise</small>
                            <div className="fw-bold">
                              {ville.pays?.devise || "N/A"}
                            </div>
                          </div>
                          <div className="col-12 mb-3">
                            <small className="text-muted">
                              Capitale du pays
                            </small>
                            <div className="fw-bold">
                              {ville.pays?.capitale || "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "geographie" && (
                <div className="row">
                  <div className="col-md-6">
                    <div
                      className="card border-0 shadow-sm mb-4"
                      style={{ borderRadius: "12px" }}
                    >
                      <div
                        className="card-header border-0 py-3"
                        style={{
                          background: colors.oskar.lightGrey,
                          borderLeft: `4px solid ${colors.oskar.purple}`,
                        }}
                      >
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle p-2 me-3"
                            style={{
                              backgroundColor: `${colors.oskar.purple}15`,
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faLocationDot}
                              style={{ color: colors.oskar.purple }}
                            />
                          </div>
                          <div>
                            <h6
                              className="mb-0 fw-bold"
                              style={{ color: colors.oskar.purple }}
                            >
                              Coordonnées Géographiques
                            </h6>
                          </div>
                        </div>
                      </div>
                      <div className="card-body p-4">
                        <div className="row">
                          <div className="col-6 mb-3">
                            <small className="text-muted">Latitude</small>
                            <div className="fw-bold">
                              {ville.latitude || "N/A"}
                            </div>
                          </div>
                          <div className="col-6 mb-3">
                            <small className="text-muted">Longitude</small>
                            <div className="fw-bold">
                              {ville.longitude || "N/A"}
                            </div>
                          </div>
                          <div className="col-6 mb-3">
                            <small className="text-muted">Altitude</small>
                            <div className="fw-bold">
                              {ville.altitude ? `${ville.altitude} m` : "N/A"}
                            </div>
                          </div>
                          <div className="col-6 mb-3">
                            <small className="text-muted">Superficie</small>
                            <div className="fw-bold">
                              {ville.superficie
                                ? `${formatNumber(ville.superficie)} km²`
                                : "N/A"}
                            </div>
                          </div>
                          {ville.latitude && ville.longitude && (
                            <div className="col-12 mt-4">
                              <a
                                href={`https://www.google.com/maps?q=${ville.latitude},${ville.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn d-flex align-items-center gap-2"
                                style={{
                                  background: colors.oskar.blue,
                                  color: "white",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background =
                                    colors.oskar.blueHover;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background =
                                    colors.oskar.blue;
                                }}
                              >
                                <FontAwesomeIcon icon={faExternalLinkAlt} />
                                Voir sur Google Maps
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div
                      className="card border-0 shadow-sm mb-4"
                      style={{ borderRadius: "12px" }}
                    >
                      <div
                        className="card-header border-0 py-3"
                        style={{
                          background: colors.oskar.lightGrey,
                          borderLeft: `4px solid ${colors.oskar.green}`,
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
                              icon={faTree}
                              style={{ color: colors.oskar.green }}
                            />
                          </div>
                          <div>
                            <h6
                              className="mb-0 fw-bold"
                              style={{ color: colors.oskar.green }}
                            >
                              Environnement
                            </h6>
                          </div>
                        </div>
                      </div>
                      <div className="card-body p-4">
                        <div className="row">
                          <div className="col-6 mb-3">
                            <small className="text-muted">Espaces verts</small>
                            <div className="fw-bold">
                              {ville.espaces_verts
                                ? `${ville.espaces_verts}%`
                                : "N/A"}
                            </div>
                          </div>
                          <div className="col-6 mb-3">
                            <small className="text-muted">
                              Qualité de l'air
                            </small>
                            <div className="fw-bold">
                              {ville.qualite_air
                                ? `${ville.qualite_air}/10`
                                : "N/A"}
                            </div>
                          </div>
                          <div className="col-12 mb-3">
                            <small className="text-muted">
                              Sites touristiques
                            </small>
                            <div className="mt-2">
                              {ville.sites_touristiques &&
                              ville.sites_touristiques.length > 0 ? (
                                <div className="d-flex flex-wrap gap-2">
                                  {ville.sites_touristiques.map(
                                    (site, index) => (
                                      <span
                                        key={index}
                                        className="badge py-2 px-3"
                                        style={{
                                          backgroundColor: `${colors.oskar.blue}10`,
                                          color: colors.oskar.blue,
                                          border: `1px solid ${colors.oskar.blue}30`,
                                          borderRadius: "20px",
                                        }}
                                      >
                                        {site}
                                      </span>
                                    ),
                                  )}
                                </div>
                              ) : (
                                <div className="text-muted">
                                  Aucun site touristique renseigné
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "demographie" && (
                <div className="row">
                  <div className="col-md-6">
                    <div
                      className="card border-0 shadow-sm mb-4"
                      style={{ borderRadius: "12px" }}
                    >
                      <div
                        className="card-header border-0 py-3"
                        style={{
                          background: colors.oskar.lightGrey,
                          borderLeft: `4px solid ${colors.oskar.orange}`,
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
                              icon={faUsers}
                              style={{ color: colors.oskar.orange }}
                            />
                          </div>
                          <div>
                            <h6
                              className="mb-0 fw-bold"
                              style={{ color: colors.oskar.orange }}
                            >
                              Population
                            </h6>
                          </div>
                        </div>
                      </div>
                      <div className="card-body p-4">
                        <div className="row">
                          <div className="col-6 mb-3">
                            <small className="text-muted">Population</small>
                            <div className="fw-bold">
                              {ville.population
                                ? formatNumber(ville.population)
                                : "N/A"}
                            </div>
                          </div>
                          <div className="col-6 mb-3">
                            <small className="text-muted">Densité</small>
                            <div className="fw-bold">
                              {getDensity()
                                ? `${getDensity().toFixed(1)} hab/km²`
                                : "N/A"}
                            </div>
                          </div>
                          <div className="col-6 mb-3">
                            <small className="text-muted">
                              Année recensement
                            </small>
                            <div className="fw-bold">
                              {ville.annee_recensement || "N/A"}
                            </div>
                          </div>
                          <div className="col-6 mb-3">
                            <small className="text-muted">
                              Évolution population
                            </small>
                            <div className="fw-bold">
                              {ville.evolution_population
                                ? `${ville.evolution_population}%`
                                : "N/A"}
                            </div>
                          </div>
                          <div className="col-6 mb-3">
                            <small className="text-muted">Taux natalité</small>
                            <div className="fw-bold">
                              {ville.taux_natalite
                                ? `${ville.taux_natalite}%`
                                : "N/A"}
                            </div>
                          </div>
                          <div className="col-6 mb-3">
                            <small className="text-muted">Taux mortalité</small>
                            <div className="fw-bold">
                              {ville.taux_mortalite
                                ? `${ville.taux_mortalite}%`
                                : "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div
                      className="card border-0 shadow-sm mb-4"
                      style={{ borderRadius: "12px" }}
                    >
                      <div
                        className="card-header border-0 py-3"
                        style={{
                          background: colors.oskar.lightGrey,
                          borderLeft: `4px solid ${colors.oskar.blue}`,
                        }}
                      >
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle p-2 me-3"
                            style={{
                              backgroundColor: `${colors.oskar.blue}15`,
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faBuilding}
                              style={{ color: colors.oskar.blue }}
                            />
                          </div>
                          <div>
                            <h6
                              className="mb-0 fw-bold"
                              style={{ color: colors.oskar.blue }}
                            >
                              Équipements Publics
                            </h6>
                          </div>
                        </div>
                      </div>
                      <div className="card-body p-4">
                        <div className="row">
                          <div className="col-6 mb-3">
                            <small className="text-muted">
                              Nombre d'écoles
                            </small>
                            <div className="fw-bold">
                              {ville.nombre_ecoles || "N/A"}
                            </div>
                          </div>
                          <div className="col-6 mb-3">
                            <small className="text-muted">
                              Nombre d'hôpitaux
                            </small>
                            <div className="fw-bold">
                              {ville.nombre_hopitaux || "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "economie" && (
                <div className="row">
                  <div className="col-md-6">
                    <div
                      className="card border-0 shadow-sm mb-4"
                      style={{ borderRadius: "12px" }}
                    >
                      <div
                        className="card-header border-0 py-3"
                        style={{
                          background: colors.oskar.lightGrey,
                          borderLeft: `4px solid ${colors.oskar.green}`,
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
                              icon={faChartLine}
                              style={{ color: colors.oskar.green }}
                            />
                          </div>
                          <div>
                            <h6
                              className="mb-0 fw-bold"
                              style={{ color: colors.oskar.green }}
                            >
                              Indicateurs Économiques
                            </h6>
                          </div>
                        </div>
                      </div>
                      <div className="card-body p-4">
                        <div className="row">
                          <div className="col-6 mb-3">
                            <small className="text-muted">
                              Nombre d'entreprises
                            </small>
                            <div className="fw-bold">
                              {ville.nombre_entreprises
                                ? formatNumber(ville.nombre_entreprises)
                                : "N/A"}
                            </div>
                          </div>
                          <div className="col-6 mb-3">
                            <small className="text-muted">
                              Taux de chômage
                            </small>
                            <div className="fw-bold">
                              {ville.taux_chomage
                                ? `${ville.taux_chomage}%`
                                : "N/A"}
                            </div>
                          </div>
                          <div className="col-6 mb-3">
                            <small className="text-muted">Revenu médian</small>
                            <div className="fw-bold">
                              {ville.revenu_median
                                ? `${formatNumber(ville.revenu_median)} €`
                                : "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div
                      className="card border-0 shadow-sm mb-4"
                      style={{ borderRadius: "12px" }}
                    >
                      <div
                        className="card-header border-0 py-3"
                        style={{
                          background: colors.oskar.lightGrey,
                          borderLeft: `4px solid ${colors.oskar.blue}`,
                        }}
                      >
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle p-2 me-3"
                            style={{
                              backgroundColor: `${colors.oskar.blue}15`,
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faCog}
                              style={{ color: colors.oskar.blue }}
                            />
                          </div>
                          <div>
                            <h6
                              className="mb-0 fw-bold"
                              style={{ color: colors.oskar.blue }}
                            >
                              Activités Principales
                            </h6>
                          </div>
                        </div>
                      </div>
                      <div className="card-body p-4">
                        <div className="mt-2">
                          {ville.principales_activites &&
                          ville.principales_activites.length > 0 ? (
                            <div className="d-flex flex-wrap gap-2">
                              {ville.principales_activites.map(
                                (activite, index) => (
                                  <span
                                    key={index}
                                    className="badge py-2 px-3"
                                    style={{
                                      backgroundColor: `${colors.oskar.blue}10`,
                                      color: colors.oskar.blue,
                                      border: `1px solid ${colors.oskar.blue}30`,
                                      borderRadius: "20px",
                                    }}
                                  >
                                    {activite}
                                  </span>
                                ),
                              )}
                            </div>
                          ) : (
                            <div className="text-muted">
                              Aucune activité renseignée
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pied de la modal */}
          <div className="modal-footer border-top-0 py-4 px-4">
            <div className="d-flex justify-content-between w-100">
              <button
                type="button"
                className="btn d-flex align-items-center gap-2"
                onClick={onClose}
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
                Fermer
              </button>

              <button
                type="button"
                className="btn text-white d-flex align-items-center gap-2"
                onClick={onEdit}
                style={{ background: colors.oskar.orange }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.oskar.orangeHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.oskar.orange;
                }}
              >
                <FontAwesomeIcon icon={faEdit} />
                Modifier la Ville
              </button>
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

            .nav-tabs {
              border-bottom: none;
            }

            .nav-link {
              border: none !important;
              background: none !important;
              transition: all 0.3s ease;
            }

            .nav-link:hover {
              color: ${colors.oskar.blue} !important;
            }

            .nav-link.active {
              background: none !important;
              border: none !important;
            }

            .btn {
              border-radius: 8px !important;
              transition: all 0.3s ease;
              font-weight: 500;
            }

            .badge {
              border-radius: 20px !important;
              font-weight: 500;
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
      </div>
    </div>
  );
};

// Modal de suppression
const DeleteVilleModal = ({
  isOpen,
  ville,
  onClose,
  onConfirm,
  loading,
}: {
  isOpen: boolean;
  ville: Ville | null;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) => {
  if (!isOpen || !ville) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(2px)",
      }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          {/* En-tête de la modal */}
          <div
            className="modal-header text-white border-0 rounded-top-3"
            style={{ background: colors.oskar.red }}
          >
            <div className="d-flex align-items-center">
              <div className="bg-white bg-opacity-20 rounded-circle p-2 me-3">
                <FontAwesomeIcon icon={faTrash} className="fs-5" />
              </div>
              <div>
                <h5 className="modal-title mb-0 fw-bold">
                  Confirmer la Suppression
                </h5>
                <p className="mb-0 opacity-75 fs-14">
                  Cette action est définitive
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={loading}
              aria-label="Fermer"
              style={{ filter: "brightness(0) invert(1)" }}
            ></button>
          </div>

          {/* Corps de la modal */}
          <div className="modal-body py-4 px-4">
            {/* Message d'avertissement */}
            <div
              className="alert alert-warning mb-4 border-0"
              style={{
                borderRadius: "10px",
                backgroundColor: `${colors.oskar.orange}15`,
                border: `1px solid ${colors.oskar.orange}30`,
              }}
            >
              <div className="d-flex align-items-center">
                <div
                  className="rounded-circle p-2 me-3"
                  style={{ backgroundColor: `${colors.oskar.orange}30` }}
                >
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className="text-warning"
                  />
                </div>
                <div>
                  <h6
                    className="alert-heading mb-1"
                    style={{ color: colors.oskar.orange }}
                  >
                    Attention
                  </h6>
                  <p className="mb-0">
                    Cette action est définitive et ne peut pas être annulée.
                  </p>
                </div>
              </div>
            </div>

            {/* Détails de la suppression */}
            <div className="text-center mb-4">
              <div
                className="bg-danger bg-opacity-10 rounded-circle p-4 d-inline-block mb-3"
                style={{ border: `2px dashed ${colors.oskar.red}30` }}
              >
                <FontAwesomeIcon
                  icon={faTrash}
                  className="fs-1"
                  style={{ color: colors.oskar.red }}
                />
              </div>
              <h5 className="fw-bold mb-2">
                Supprimer la ville{" "}
                <span className="text-danger">{ville.nom}</span> ?
              </h5>
              <p className="text-muted mb-0">
                Êtes-vous sûr de vouloir supprimer cette ville ? Toutes les
                données associées seront perdues.
              </p>
            </div>

            {/* Informations détaillées */}
            <div
              className="card border-0 shadow-sm mb-4"
              style={{
                borderRadius: "10px",
                backgroundColor: colors.oskar.lightGrey,
              }}
            >
              <div className="card-body p-3">
                <div className="row">
                  <div className="col-6">
                    <small className="text-muted">Code Postal</small>
                    <div className="fw-bold">{ville.code_postal}</div>
                  </div>
                  <div className="col-6">
                    <small className="text-muted">Pays</small>
                    <div className="fw-bold">{ville.pays?.nom || "N/A"}</div>
                  </div>
                  <div className="col-6 mt-3">
                    <small className="text-muted">Statut</small>
                    <div>
                      <StatusBadge
                        statut={ville.statut}
                        is_deleted={ville.is_deleted}
                      />
                    </div>
                  </div>
                  <div className="col-6 mt-3">
                    <small className="text-muted">Population</small>
                    <div className="fw-bold">
                      {ville.population
                        ? formatNumber(ville.population)
                        : "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Avertissement final */}
            <div className="text-center">
              <small className="text-danger d-block mb-3">
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="me-1"
                />
                Cette action ne peut pas être annulée. Veuillez confirmer votre
                choix.
              </small>
            </div>
          </div>

          {/* Pied de la modal */}
          <div className="modal-footer border-top-0 py-4 px-4">
            <div className="d-flex justify-content-end w-100 gap-3">
              <button
                type="button"
                className="btn d-flex align-items-center gap-2"
                onClick={onClose}
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
                onClick={onConfirm}
                disabled={loading}
                style={{ background: colors.oskar.red }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.oskar.redHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.oskar.red;
                }}
              >
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    Suppression en cours...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faTrash} />
                    Supprimer
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Styles inline supplémentaires */}
          <style jsx>{`
            .modal-content {
              border-radius: 16px !important;
              overflow: hidden;
            }

            .btn {
              border-radius: 8px !important;
              transition: all 0.3s ease;
              font-weight: 500;
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
      </div>
    </div>
  );
};

// Composant principal
export default function VillesPage() {
  // États globaux
  const [villesList, setVillesList] = useState<Ville[]>([]);
  const [paysList, setPaysList] = useState<Pays[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // États pour la pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // États pour les modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVille, setSelectedVille] = useState<Ville | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPays, setSelectedPays] = useState<string>("all");
  const [selectedCapital, setSelectedCapital] = useState<string>("all");
  const [selectedHasGPS, setSelectedHasGPS] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Ville | "pays.nom" | "population" | "densite";
    direction: "asc" | "desc";
  } | null>(null);

  // États pour la sélection multiple
  const [selection, setSelection] = useState<SelectionState>({
    allSelected: false,
    selectedIds: new Set<string>(),
  });

  const itemsPerPageOptions = [5, 10, 20, 50, 100];

  // Charger les villes
  const fetchVilles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<any>(API_ENDPOINTS.VILLES.LIST);

      let villesData: Ville[] = [];

      if (Array.isArray(response)) {
        villesData = response;
      } else if (response && Array.isArray(response.data)) {
        villesData = response.data;
      } else if (response && typeof response === "object") {
        const possibleArrays = Object.values(response).filter((value) =>
          Array.isArray(value),
        );
        if (possibleArrays.length > 0) {
          villesData = possibleArrays[0] as Ville[];
        }
      }

      if (villesData.length > 0) {
        const cleanedData = villesData.map((ville) => ({
          ...ville,
          nom: ville.nom || "Nom inconnu",
          code_postal: ville.code_postal || "N/A",
          statut: ville.statut || "inactif",
          pays: ville.pays || null,
          population: ville.population || 0,
          superficie: ville.superficie || 0,
        }));

        setPagination((prev) => ({
          ...prev,
          total: response?.total || villesData.length,
          pages: Math.ceil((response?.total || villesData.length) / prev.limit),
        }));
        setSelection({
          allSelected: false,
          selectedIds: new Set(),
        });
      } else {
        setVillesList([]);
        setPagination((prev) => ({ ...prev, total: 0, pages: 1 }));
      }
    } catch (err: any) {
      console.error("❌ Erreur chargement villes:", err);
      setError(err.message || "Erreur lors du chargement des villes");
      setVillesList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les pays
  const fetchPays = useCallback(async () => {
    try {
      const response = await api.get<any>(API_ENDPOINTS.PAYS.LIST);

      let paysData: Pays[] = [];

      if (Array.isArray(response)) {
        paysData = response;
      } else if (response && Array.isArray(response.data)) {
        paysData = response.data;
      }

      if (paysData.length > 0) {
        setPaysList(paysData);
      }
    } catch (err) {
      console.error("❌ Erreur chargement pays:", err);
    }
  }, []);

  // Initialiser
  useEffect(() => {
    fetchVilles();
    fetchPays();
  }, [fetchVilles, fetchPays]);

  // Gestion des succès
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Gestion des infos
  useEffect(() => {
    if (infoMessage) {
      const timer = setTimeout(() => setInfoMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [infoMessage]);

  // Fonctions de sélection
  const toggleSelectAll = useCallback(() => {
    setSelection((prev) => {
      const newAllSelected = !prev.allSelected;
      if (newAllSelected) {
        const visibleVilles = getVisibleVilles();
        const newSelectedIds = new Set(visibleVilles.map((v) => v.uuid));
        return { allSelected: true, selectedIds: newSelectedIds };
      } else {
        return { allSelected: false, selectedIds: new Set() };
      }
    });
  }, [villesList, searchTerm, selectedStatus, selectedPays]);

  const toggleSelectVille = useCallback((uuid: string) => {
    setSelection((prev) => {
      const newSelectedIds = new Set(prev.selectedIds);
      if (newSelectedIds.has(uuid)) {
        newSelectedIds.delete(uuid);
      } else {
        newSelectedIds.add(uuid);
      }
      const visibleVilles = getVisibleVilles();
      const allVisibleSelected = visibleVilles.every((v) =>
        newSelectedIds.has(v.uuid),
      );
      return {
        allSelected: allVisibleSelected,
        selectedIds: newSelectedIds,
      };
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelection({ allSelected: false, selectedIds: new Set() });
  }, []);

  // Filtrer les villes visibles
  const getVisibleVilles = useCallback(() => {
    let filtered = [...villesList];
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.nom?.toLowerCase().includes(searchLower) ||
          v.code_postal?.toLowerCase().includes(searchLower) ||
          v.code_insee?.toLowerCase().includes(searchLower) ||
          v.pays?.nom?.toLowerCase().includes(searchLower),
      );
    }
    if (selectedStatus !== "all") {
      filtered = filtered.filter((v) => v.statut === selectedStatus);
    }
    if (selectedPays !== "all") {
      filtered = filtered.filter((v) => v.pays_uuid === selectedPays);
    }
    if (selectedCapital !== "all") {
      const isCapital = selectedCapital === "yes";
      filtered = filtered.filter((v) =>
        isCapital ? v.est_capitale : !v.est_capitale,
      );
    }
    if (selectedHasGPS !== "all") {
      const hasGPS = selectedHasGPS === "yes";
      filtered = filtered.filter((v) =>
        hasGPS ? v.latitude && v.longitude : !v.latitude || !v.longitude,
      );
    }
    return sortVilles(filtered);
  }, [
    villesList,
    searchTerm,
    selectedStatus,
    selectedPays,
    selectedCapital,
    selectedHasGPS,
    sortConfig,
  ]);

  // Gestion du tri
  const sortVilles = useCallback(
    (villes: Ville[]) => {
      if (!sortConfig || !villes.length) return villes;
      return [...villes].sort((a, b) => {
        let aValue: any, bValue: any;
        if (sortConfig.key === "pays.nom") {
          aValue = a.pays?.nom || "";
          bValue = b.pays?.nom || "";
        } else if (sortConfig.key === "population") {
          aValue = a.population || 0;
          bValue = b.population || 0;
        } else if (sortConfig.key === "densite") {
          aValue = calculateDensity(a.population, a.superficie);
          bValue = calculateDensity(b.population, b.superficie);
        } else {
          aValue = a[sortConfig.key as keyof Ville];
          bValue = b[sortConfig.key as keyof Ville];
        }
        if (aValue == null) aValue = "";
        if (bValue == null) bValue = "";
        if (
          sortConfig.key === "created_at" ||
          sortConfig.key === "updated_at"
        ) {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }
        if (typeof aValue === "string" && typeof bValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    },
    [sortConfig],
  );

  const requestSort = useCallback(
    (key: keyof Ville | "pays.nom" | "population" | "densite") => {
      setSortConfig((prev) => {
        if (prev && prev.key === key) {
          return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
        }
        return { key, direction: "asc" };
      });
    },
    [],
  );

  const getSortIcon = useCallback(
    (key: keyof Ville | "pays.nom" | "population" | "densite") => {
      if (!sortConfig || sortConfig.key !== key) {
        return <FontAwesomeIcon icon={faSort} className="text-muted ms-1" />;
      }
      return sortConfig.direction === "asc" ? (
        <FontAwesomeIcon icon={faSortUp} className="text-primary ms-1" />
      ) : (
        <FontAwesomeIcon icon={faSortDown} className="text-primary ms-1" />
      );
    },
    [sortConfig],
  );

  // Calcul des villes filtrées
  const filteredVilles = useMemo(() => {
    return getVisibleVilles();
  }, [getVisibleVilles]);

  // Pagination des éléments
  const currentItems = useMemo(() => {
    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit;
    return filteredVilles.slice(start, end);
  }, [filteredVilles, pagination.page, pagination.limit]);

  // Statistiques
  const statistics = useMemo(() => {
    const activeVilles = villesList.filter(
      (v) => v.statut === "actif" && !v.is_deleted,
    );
    const inactiveVilles = villesList.filter(
      (v) => v.statut !== "actif" && !v.is_deleted,
    );
    const deletedVilles = villesList.filter((v) => v.is_deleted);
    const capitalVilles = villesList.filter((v) => v.est_capitale);
    const villesWithGPS = villesList.filter((v) => v.latitude && v.longitude);

    return {
      total: villesList.length,
      active: activeVilles.length,
      inactive: inactiveVilles.length,
      deleted: deletedVilles.length,
      capital: capitalVilles.length,
      withGPS: villesWithGPS.length,
      selected: selection.selectedIds.size,
    };
  }, [villesList, selection.selectedIds.size]);

  // Actions sur les villes
  const handleDeleteVille = async () => {
    if (!selectedVille) return;
    try {
      setActionLoading(true);
      await api.delete(API_ENDPOINTS.VILLES.DELETE(selectedVille.uuid));
      setVillesList((prev) =>
        prev.filter((v) => v.uuid !== selectedVille.uuid),
      );
      setSuccessMessage(`Ville "${selectedVille.nom}" supprimée avec succès`);
      setShowDeleteModal(false);
      setSelectedVille(null);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la suppression");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (ville: Ville) => {
    try {
      setActionLoading(true);
      const newStatus = ville.statut === "actif" ? "inactif" : "actif";
      await api.put(API_ENDPOINTS.VILLES.UPDATE(ville.uuid), {
        statut: newStatus,
      });
      setVillesList((prev) =>
        prev.map((v) =>
          v.uuid === ville.uuid ? { ...v, statut: newStatus } : v,
        ),
      );
      setSuccessMessage(
        `Ville "${ville.nom}" ${ville.statut === "actif" ? "désactivée" : "activée"} avec succès`,
      );
    } catch (err: any) {
      setError(err.message || "Erreur lors du changement de statut");
    } finally {
      setActionLoading(false);
    }
  };

  const handleVilleCreated = () => {
    setSuccessMessage("Ville créée avec succès");
    fetchVilles();
  };

  const handleVilleUpdated = () => {
    setSuccessMessage("Ville modifiée avec succès");
    fetchVilles();
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredVilles.length === 0) {
      setError("Aucune donnée à exporter");
      return;
    }

    const headers = [
      "Nom",
      "Code Postal",
      "Code INSEE",
      "Pays",
      "Population",
      "Superficie (km²)",
      "Densité (hab/km²)",
      "Capitale",
      "Statut",
      "Latitude",
      "Longitude",
      "Créée le",
    ];

    const rows = filteredVilles.map((ville) => [
      ville.nom,
      ville.code_postal,
      ville.code_insee || "N/A",
      ville.pays?.nom || "N/A",
      ville.population ? formatNumber(ville.population) : "N/A",
      ville.superficie ? formatNumber(ville.superficie) : "N/A",
      calculateDensity(ville.population, ville.superficie).toFixed(1),
      ville.est_capitale ? "Oui" : "Non",
      ville.statut,
      ville.latitude || "N/A",
      ville.longitude || "N/A",
      formatDateOnly(ville.created_at),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `villes-export-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    setSuccessMessage("Export CSV réussi");
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setSelectedPays("all");
    setSelectedCapital("all");
    setSelectedHasGPS("all");
    setSortConfig(null);
    setPagination((prev) => ({ ...prev, page: 1 }));
    clearSelection();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setInfoMessage("Copié dans le presse-papier");
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.pages) return;
    setPagination((prev) => ({ ...prev, page }));
  };

  return (
    <>
      {/* Modals */}
      <CreateVilleModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleVilleCreated}
        paysList={paysList}
      />

      <EditVilleModal
        isOpen={showEditModal}
        ville={selectedVille}
        onClose={() => {
          setShowEditModal(false);
          setSelectedVille(null);
        }}
        onSuccess={handleVilleUpdated}
        paysList={paysList}
      />

      <ViewVilleModal
        isOpen={showViewModal}
        ville={selectedVille}
        onClose={() => {
          setShowViewModal(false);
          setSelectedVille(null);
        }}
        onEdit={() => {
          setShowViewModal(false);
          setShowEditModal(true);
        }}
      />

      <DeleteVilleModal
        isOpen={showDeleteModal}
        ville={selectedVille}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedVille(null);
        }}
        onConfirm={handleDeleteVille}
        loading={actionLoading}
      />

      {/* Contenu principal */}
      <div className="p-3 p-md-4">
        {/* Messages */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show mb-4 border-0 shadow-sm">
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
              />
            </div>
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success alert-dismissible fade show mb-4 border-0 shadow-sm">
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
              />
            </div>
          </div>
        )}

        {infoMessage && (
          <div className="alert alert-info alert-dismissible fade show mb-4 border-0 shadow-sm">
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0">
                <div
                  className="rounded-circle p-2"
                  style={{ backgroundColor: `${colors.oskar.blue}20` }}
                >
                  <FontAwesomeIcon icon={faInfoCircle} className="text-info" />
                </div>
              </div>
              <div className="flex-grow-1 ms-3">
                <h6 className="alert-heading mb-1">Information</h6>
                <p className="mb-0">{infoMessage}</p>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={() => setInfoMessage(null)}
              />
            </div>
          </div>
        )}

        {/* Barre de sélection */}
        {selection.selectedIds.size > 0 && (
          <div className="alert alert-primary alert-dismissible fade show mb-4 border-0 shadow-sm">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                  <FontAwesomeIcon
                    icon={faLayerGroup}
                    className="text-primary"
                  />
                </div>
                <div>
                  <h6 className="mb-1 fw-bold">
                    {selection.selectedIds.size} ville(s) sélectionnée(s)
                  </h6>
                  <p className="mb-0 text-muted">
                    {villesList
                      .filter((v) => selection.selectedIds.has(v.uuid))
                      .map((v) => v.nom)
                      .join(", ")}
                  </p>
                </div>
              </div>
              <div className="d-flex flex-wrap gap-2">
                <button
                  className="btn btn-primary d-flex align-items-center gap-2"
                  onClick={() => {
                    setInfoMessage("Actions groupées en développement");
                  }}
                  disabled={actionLoading}
                >
                  <FontAwesomeIcon icon={faLayerGroup} />
                  Actions groupées
                </button>
                <button
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  onClick={clearSelection}
                  disabled={actionLoading}
                >
                  <FontAwesomeIcon icon={faTimes} />
                  Annuler la sélection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Carte principale */}
        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="card-header bg-white border-0 py-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div>
                <div className="d-flex align-items-center gap-3">
                  <h2 className="h4 mb-0 fw-bold">
                    <FontAwesomeIcon
                      icon={faCity}
                      className="me-2 text-primary"
                    />
                    Gestion des Villes
                  </h2>
                  <span className="badge bg-primary bg-opacity-10 text-primary border border-primary">
                    {statistics.total} villes
                    {statistics.active > 0 && (
                      <span className="ms-2 badge bg-success">
                        {statistics.active} actives
                      </span>
                    )}
                    {statistics.capital > 0 && (
                      <span className="ms-2 badge bg-warning">
                        {statistics.capital} capitales
                      </span>
                    )}
                    {statistics.selected > 0 && (
                      <span className="ms-2 badge bg-info">
                        {statistics.selected} sélectionnées
                      </span>
                    )}
                  </span>
                </div>
                <p className="text-muted mb-0 mt-2">
                  Gérez les villes disponibles dans le système
                </p>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    fetchVilles();
                    fetchPays();
                  }}
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  disabled={loading || actionLoading}
                >
                  <FontAwesomeIcon icon={faSync} spin={loading} />
                  Rafraîchir
                </button>

                <button
                  onClick={handleExportCSV}
                  className="btn btn-outline-primary d-flex align-items-center gap-2"
                  disabled={
                    loading || actionLoading || filteredVilles.length === 0
                  }
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Exporter CSV
                </button>

                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-success d-flex align-items-center gap-2"
                  disabled={loading || actionLoading}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Nouvelle Ville
                </button>
              </div>
            </div>
          </div>

          {/* Filtres */}
          <div className="p-4 border-bottom bg-light-subtle">
            <div className="row g-3">
              <div className="col-md-3">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faSearch} className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Nom, code postal, INSEE..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="col-md-2">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faFilter} className="text-muted" />
                  </span>
                  <select
                    className="form-select border-start-0 ps-0"
                    value={selectedStatus}
                    onChange={(e) => {
                      setSelectedStatus(e.target.value);
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                    disabled={loading}
                  >
                    <option value="all">Tous statuts</option>
                    <option value="actif">Actif</option>
                    <option value="inactif">Inactif</option>
                    <option value="archive">Archivé</option>
                  </select>
                </div>
              </div>

              <div className="col-md-2">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faGlobe} className="text-muted" />
                  </span>
                  <select
                    className="form-select border-start-0 ps-0"
                    value={selectedPays}
                    onChange={(e) => {
                      setSelectedPays(e.target.value);
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                    disabled={loading}
                  >
                    <option value="all">Tous pays</option>
                    {paysList.map((pays) => (
                      <option key={pays.uuid} value={pays.uuid}>
                        {pays.nom}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="col-md-2">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faBuilding} className="text-muted" />
                  </span>
                  <select
                    className="form-select border-start-0 ps-0"
                    value={selectedCapital}
                    onChange={(e) => {
                      setSelectedCapital(e.target.value);
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                    disabled={loading}
                  >
                    <option value="all">Capitale ?</option>
                    <option value="yes">Oui</option>
                    <option value="no">Non</option>
                  </select>
                </div>
              </div>

              <div className="col-md-2">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon
                      icon={faLocationDot}
                      className="text-muted"
                    />
                  </span>
                  <select
                    className="form-select border-start-0 ps-0"
                    value={selectedHasGPS}
                    onChange={(e) => {
                      setSelectedHasGPS(e.target.value);
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                    disabled={loading}
                  >
                    <option value="all">GPS ?</option>
                    <option value="yes">Avec GPS</option>
                    <option value="no">Sans GPS</option>
                  </select>
                </div>
              </div>

              <div className="col-md-1">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faList} className="text-muted" />
                  </span>
                  <select
                    className="form-select border-start-0 ps-0"
                    value={pagination.limit}
                    onChange={(e) => {
                      setPagination((prev) => ({
                        ...prev,
                        limit: Number(e.target.value),
                        page: 1,
                      }));
                    }}
                    disabled={loading}
                  >
                    {itemsPerPageOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-md-6">
                <div className="d-flex align-items-center gap-3">
                  <small className="text-muted">
                    Résultats: <strong>{filteredVilles.length}</strong> villes
                    {searchTerm && (
                      <>
                        {" "}
                        pour "<strong>{searchTerm}</strong>"
                      </>
                    )}
                  </small>
                  {statistics.withGPS > 0 && (
                    <small className="text-primary">
                      <FontAwesomeIcon icon={faLocationDot} className="me-1" />
                      <strong>{statistics.withGPS}</strong> avec GPS
                    </small>
                  )}
                  {selection.selectedIds.size > 0 && (
                    <small className="text-info">
                      <FontAwesomeIcon icon={faLayerGroup} className="me-1" />
                      <strong>{selection.selectedIds.size}</strong>{" "}
                      sélectionnées
                    </small>
                  )}
                </div>
              </div>

              <div className="col-md-6 text-end">
                <button
                  onClick={resetFilters}
                  className="btn btn-outline-secondary btn-sm"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faTimes} className="me-1" />
                  Réinitialiser filtres
                </button>
              </div>
            </div>
          </div>

          {/* Tableau */}
          <div className="table-responsive">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-secondary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-3 text-muted">
                  <FontAwesomeIcon icon={faSync} spin className="me-2" />
                  Chargement des villes...
                </p>
              </div>
            ) : filteredVilles.length === 0 ? (
              <div className="text-center py-5">
                <div
                  className="alert alert-info mx-auto border-0"
                  style={{ maxWidth: "500px" }}
                >
                  <div className="bg-info bg-opacity-10 rounded-circle p-4 d-inline-block mb-3">
                    <FontAwesomeIcon icon={faCity} className="fs-1 text-info" />
                  </div>
                  <h5 className="alert-heading">
                    {villesList.length === 0
                      ? "Aucune ville"
                      : "Aucun résultat"}
                  </h5>
                  <p className="mb-0">
                    {villesList.length === 0
                      ? "Aucune ville n'a été ajoutée dans le système."
                      : "Aucune ville ne correspond à vos critères de recherche."}
                  </p>
                  <div className="mt-3">
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="btn btn-primary"
                    >
                      <FontAwesomeIcon icon={faPlus} className="me-2" />
                      Ajouter une nouvelle ville
                    </button>
                    {(searchTerm ||
                      selectedStatus !== "all" ||
                      selectedPays !== "all") && (
                      <button
                        onClick={resetFilters}
                        className="btn btn-outline-secondary ms-2"
                      >
                        <FontAwesomeIcon icon={faFilter} className="me-2" />
                        Effacer les filtres
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "50px" }}>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={selection.allSelected}
                            onChange={toggleSelectAll}
                            disabled={loading || actionLoading}
                          />
                        </div>
                      </th>
                      <th style={{ width: "60px" }} className="text-center">
                        #
                      </th>
                      <th style={{ width: "220px" }}>
                        <button
                          className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent d-flex align-items-center"
                          onClick={() => requestSort("nom")}
                        >
                          <FontAwesomeIcon icon={faCity} className="me-2" />
                          Ville
                          {getSortIcon("nom")}
                        </button>
                      </th>
                      <th style={{ width: "120px" }}>
                        <button
                          className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent d-flex align-items-center"
                          onClick={() => requestSort("code_postal")}
                        >
                          <FontAwesomeIcon
                            icon={faMapMarkerAlt}
                            className="me-2"
                          />
                          Code Postal
                          {getSortIcon("code_postal")}
                        </button>
                      </th>
                      <th style={{ width: "150px" }}>
                        <button
                          className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent d-flex align-items-center"
                          onClick={() => requestSort("pays.nom")}
                        >
                          <FontAwesomeIcon icon={faGlobe} className="me-2" />
                          Pays
                          {getSortIcon("pays.nom")}
                        </button>
                      </th>
                      <th style={{ width: "120px" }}>
                        <span className="fw-semibold">Population</span>
                      </th>
                      <th style={{ width: "100px" }}>
                        <span className="fw-semibold">Statut</span>
                      </th>
                      <th style={{ width: "80px" }}>
                        <span className="fw-semibold">GPS</span>
                      </th>
                      <th style={{ width: "150px" }}>
                        <button
                          className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent d-flex align-items-center"
                          onClick={() => requestSort("created_at")}
                        >
                          <FontAwesomeIcon icon={faCalendar} className="me-2" />
                          Créée le
                          {getSortIcon("created_at")}
                        </button>
                      </th>
                      <th style={{ width: "160px" }} className="text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((ville, index) => (
                      <tr
                        key={ville.uuid}
                        className="align-middle"
                        style={{
                          opacity: ville.is_deleted ? 0.6 : 1,
                          backgroundColor: selection.selectedIds.has(ville.uuid)
                            ? "rgba(13, 110, 253, 0.05)"
                            : "transparent",
                        }}
                      >
                        <td>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={selection.selectedIds.has(ville.uuid)}
                              onChange={() => toggleSelectVille(ville.uuid)}
                              disabled={actionLoading || ville.is_deleted}
                            />
                          </div>
                        </td>
                        <td className="text-center text-muted fw-semibold">
                          {(pagination.page - 1) * pagination.limit + index + 1}
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="flex-shrink-0">
                              <div
                                className={`rounded-circle d-flex align-items-center justify-content-center ${
                                  ville.statut === "actif"
                                    ? "bg-primary bg-opacity-10 text-primary"
                                    : "bg-secondary bg-opacity-10 text-secondary"
                                }`}
                                style={{ width: "40px", height: "40px" }}
                              >
                                <FontAwesomeIcon icon={faCity} />
                              </div>
                            </div>
                            <div className="flex-grow-1 ms-3">
                              <div className="fw-semibold d-flex align-items-center gap-2">
                                {ville.nom}
                                <CapitalBadge
                                  est_capitale={ville.est_capitale}
                                  est_capitale_region={
                                    ville.est_capitale_region
                                  }
                                  est_capitale_departement={
                                    ville.est_capitale_departement
                                  }
                                />
                                {ville.is_deleted && (
                                  <span className="badge bg-dark bg-opacity-10 text-dark border border-dark px-2 py-1">
                                    <FontAwesomeIcon
                                      icon={faTrash}
                                      className="fs-12 me-1"
                                    />
                                    Supprimé
                                  </span>
                                )}
                              </div>
                              <div className="d-flex align-items-center mt-1">
                                <code
                                  className="text-muted fs-12 me-2"
                                  style={{
                                    fontFamily: "monospace",
                                    cursor: "pointer",
                                    maxWidth: "150px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                  onClick={() => copyToClipboard(ville.uuid)}
                                  title="Cliquer pour copier l'UUID"
                                >
                                  {ville.uuid.substring(0, 8)}...
                                </code>
                                <FontAwesomeIcon
                                  icon={faCopy}
                                  className="fs-12 text-muted cursor-pointer"
                                  onClick={() => copyToClipboard(ville.uuid)}
                                  title="Copier l'UUID"
                                />
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex flex-column gap-1">
                            <span className="badge bg-info bg-opacity-10 text-info border border-info px-2 py-1 fw-semibold">
                              {ville.code_postal}
                            </span>
                            {ville.code_insee && (
                              <small className="text-muted">
                                INSEE: {ville.code_insee}
                              </small>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FontAwesomeIcon
                              icon={faGlobe}
                              className="text-muted me-2"
                            />
                            <span>{ville.pays?.nom || "N/A"}</span>
                          </div>
                          {ville.pays?.code && (
                            <small className="text-muted">
                              {ville.pays.code}
                            </small>
                          )}
                        </td>
                        <td>
                          <div className="d-flex flex-column gap-1">
                            <PopulationBadge population={ville.population} />
                            {ville.superficie && ville.superficie > 0 && (
                              <small className="text-muted">
                                {formatNumber(ville.superficie)} km²
                              </small>
                            )}
                            {ville.densite && ville.densite > 0 && (
                              <small className="text-muted">
                                {ville.densite.toFixed(1)} hab/km²
                              </small>
                            )}
                          </div>
                        </td>
                        <td>
                          <StatusBadge
                            statut={ville.statut}
                            is_deleted={ville.is_deleted}
                          />
                        </td>
                        <td>
                          <CoordinatesBadge
                            latitude={ville.latitude}
                            longitude={ville.longitude}
                          />
                        </td>
                        <td>
                          <div className="d-flex flex-column">
                            <div className="d-flex align-items-center">
                              <FontAwesomeIcon
                                icon={faCalendar}
                                className="text-muted me-2"
                              />
                              <small className="text-muted">
                                {formatDateOnly(ville.created_at)}
                              </small>
                            </div>
                            {ville.updated_at &&
                              ville.updated_at !== ville.created_at && (
                                <small className="text-muted mt-1">
                                  Modifié: {formatDateOnly(ville.updated_at)}
                                </small>
                              )}
                          </div>
                        </td>
                        <td className="text-center">
                          <div className="btn-group btn-group-sm" role="group">
                            <button
                              className="btn btn-outline-primary"
                              title="Voir détails"
                              onClick={() => {
                                setSelectedVille(ville);
                                setShowViewModal(true);
                              }}
                              disabled={actionLoading}
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </button>

                            <button
                              className="btn btn-outline-warning"
                              title="Modifier"
                              onClick={() => {
                                setSelectedVille(ville);
                                setShowEditModal(true);
                              }}
                              disabled={actionLoading || ville.is_deleted}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>

                            <button
                              className={`btn ${
                                ville.statut === "actif"
                                  ? "btn-outline-warning"
                                  : "btn-outline-success"
                              }`}
                              title={
                                ville.statut === "actif"
                                  ? "Désactiver"
                                  : "Activer"
                              }
                              onClick={() => handleToggleStatus(ville)}
                              disabled={actionLoading || ville.is_deleted}
                            >
                              <FontAwesomeIcon
                                icon={
                                  ville.statut === "actif"
                                    ? faToggleOff
                                    : faToggleOn
                                }
                              />
                            </button>

                            <button
                              className="btn btn-outline-danger"
                              title="Supprimer"
                              onClick={() => {
                                setSelectedVille(ville);
                                setShowDeleteModal(true);
                              }}
                              disabled={actionLoading || ville.is_deleted}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="p-4 border-top">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                      <div className="text-muted">
                        Affichage de{" "}
                        <span className="fw-semibold">
                          {(pagination.page - 1) * pagination.limit + 1}
                        </span>{" "}
                        à{" "}
                        <span className="fw-semibold">
                          {Math.min(
                            pagination.page * pagination.limit,
                            filteredVilles.length,
                          )}
                        </span>{" "}
                        sur{" "}
                        <span className="fw-semibold">
                          {filteredVilles.length}
                        </span>{" "}
                        villes
                      </div>
                      <nav aria-label="Pagination">
                        <ul className="pagination mb-0">
                          <li
                            className={`page-item ${pagination.page === 1 ? "disabled" : ""}`}
                          >
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(1)}
                              disabled={pagination.page === 1}
                            >
                              «
                            </button>
                          </li>
                          <li
                            className={`page-item ${pagination.page === 1 ? "disabled" : ""}`}
                          >
                            <button
                              className="page-link"
                              onClick={() =>
                                handlePageChange(pagination.page - 1)
                              }
                              disabled={pagination.page === 1}
                            >
                              ‹
                            </button>
                          </li>
                          {Array.from(
                            { length: Math.min(5, pagination.pages) },
                            (_, i) => {
                              let pageNum = i + 1;
                              if (pagination.pages > 5) {
                                if (pagination.page <= 3) {
                                  pageNum = i + 1;
                                } else if (
                                  pagination.page >=
                                  pagination.pages - 2
                                ) {
                                  pageNum = pagination.pages - 4 + i;
                                } else {
                                  pageNum = pagination.page - 2 + i;
                                }
                              }
                              return (
                                <li
                                  key={pageNum}
                                  className={`page-item ${pageNum === pagination.page ? "active" : ""}`}
                                >
                                  <button
                                    className="page-link"
                                    onClick={() => handlePageChange(pageNum)}
                                  >
                                    {pageNum}
                                  </button>
                                </li>
                              );
                            },
                          )}
                          <li
                            className={`page-item ${pagination.page === pagination.pages ? "disabled" : ""}`}
                          >
                            <button
                              className="page-link"
                              onClick={() =>
                                handlePageChange(pagination.page + 1)
                              }
                              disabled={pagination.page === pagination.pages}
                            >
                              ›
                            </button>
                          </li>
                          <li
                            className={`page-item ${pagination.page === pagination.pages ? "disabled" : ""}`}
                          >
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(pagination.pages)}
                              disabled={pagination.page === pagination.pages}
                            >
                              »
                            </button>
                          </li>
                        </ul>
                      </nav>
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-muted">Page :</span>
                        <input
                          type="number"
                          min="1"
                          max={pagination.pages}
                          value={pagination.page}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (value >= 1 && value <= pagination.pages) {
                              handlePageChange(value);
                            }
                          }}
                          className="form-control form-control-sm text-center"
                          style={{ width: "70px" }}
                        />
                        <span className="text-muted">
                          sur {pagination.pages}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
