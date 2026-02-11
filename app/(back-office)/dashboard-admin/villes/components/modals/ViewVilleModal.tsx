// app/(back-office)/dashboard-admin/villes/components/modals/ViewVilleModal.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faCity,
  faFlag,
  faMapMarkerAlt,
  faGlobe,
  faCalendar,
  faCheckCircle,
  faTimesCircle,
  faUsers,
  faBuilding,
  faRoute,
  faTree,
  faSun,
  faLandmark,
  faHotel,
  faIndustry,
  faSchool,
  faHospital,
  faChartLine,
  faInfoCircle,
  faEdit,
  faDownload,
  faShare,
  faPrint,
  faExternalLinkAlt,
  faClipboard,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";

// Types
interface Pays {
  uuid: string;
  code: string;
  nom: string;
  indicatif: string;
  statut: string;
  code_drapeau?: string;
  emoji_drapeau?: string;
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
  pays: Pays;
  created_at: string;
  updated_at: string;
  validated_at?: string;
  created_by?: string;
  updated_by?: string;
}

interface ViewVilleModalProps {
  isOpen: boolean;
  villeId: string | null;
  onClose: () => void;
  onEdit?: (villeId: string) => void;
}

export default function ViewVilleModal({
  isOpen,
  villeId,
  onClose,
  onEdit,
}: ViewVilleModalProps) {
  // États
  const [ville, setVille] = useState<Ville | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "general" | "geographie" | "demographie" | "economie" | "infrastructure"
  >("general");

  // Charger les détails de la ville
  const fetchVilleDetails = useCallback(async () => {
    if (!villeId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await api.get(API_ENDPOINTS.VILLES.DETAIL(villeId));

      // Gérer différents formats de réponse
      let villeData: Ville | null = null;

      if (response && typeof response === "object") {
        if ("data" in response && response.data) {
          villeData = response.data;
        } else if (Array.isArray(response) && response.length > 0) {
          villeData = response[0];
        } else if (!Array.isArray(response) && response.uuid) {
          villeData = response;
        }
      }

      if (villeData) {
        setVille(villeData);
      } else {
        throw new Error("Données de ville non disponibles");
      }
    } catch (err: any) {
      console.error("❌ Erreur chargement ville:", err);
      setError(err.message || "Erreur lors du chargement des détails");
      setVille(null);
    } finally {
      setLoading(false);
    }
  }, [villeId]);

  // Charger quand la modal s'ouvre
  useEffect(() => {
    if (isOpen && villeId) {
      fetchVilleDetails();
    } else {
      setVille(null);
      setError(null);
    }
  }, [isOpen, villeId, fetchVilleDetails]);

  // Fermer la modal
  const handleClose = () => {
    setVille(null);
    setError(null);
    setActiveTab("general");
    onClose();
  };

  // Formater les dates
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Non disponible";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return "Date invalide";
    }
  };

  // Formater les nombres
  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return "N/A";
    return new Intl.NumberFormat("fr-FR").format(num);
  };

  // Obtenir la couleur du statut
  const getStatusColor = (statut: string) => {
    switch (statut) {
      case "actif":
        return { bg: "#d1fae5", text: "#065f46", border: "#10b981" };
      case "inactif":
        return { bg: "#fee2e2", text: "#991b1b", border: "#ef4444" };
      case "archive":
        return { bg: "#f3f4f6", text: "#374151", border: "#9ca3af" };
      default:
        return { bg: "#f3f4f6", text: "#374151", border: "#9ca3af" };
    }
  };

  // Copier dans le presse-papier
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert(`${label} copié dans le presse-papier`);
      })
      .catch((err) => {
        console.error("Erreur lors de la copie:", err);
      });
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
      aria-labelledby="viewVilleModalLabel"
      aria-modal="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg">
          {/* En-tête de la modal */}
          <div
            className="modal-header text-white border-0 rounded-top-3"
            style={{
              background: `linear-gradient(135deg, ${colors.oskar.blue} 0%, ${colors.oskar.blueHover} 100%)`,
              borderBottom: `3px solid ${colors.oskar.purple}`,
            }}
          >
            <div className="d-flex align-items-center justify-content-between w-100">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-white bg-opacity-20 rounded-circle p-2">
                  <FontAwesomeIcon icon={faCity} className="fs-5" />
                </div>
                <div>
                  <h5
                    className="modal-title mb-0 fw-bold"
                    id="viewVilleModalLabel"
                  >
                    {loading
                      ? "Chargement..."
                      : ville
                        ? ville.nom
                        : "Détails de la Ville"}
                  </h5>
                  <p className="mb-0 opacity-75 fs-14">
                    {ville
                      ? `Code postal: ${ville.code_postal}`
                      : "Informations détaillées"}
                  </p>
                </div>
              </div>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-light btn-sm d-flex align-items-center gap-2"
                  onClick={() => window.print()}
                  disabled={!ville}
                >
                  <FontAwesomeIcon icon={faPrint} />
                  Imprimer
                </button>
                <button
                  type="button"
                  className="btn btn-outline-light btn-sm d-flex align-items-center gap-2"
                  onClick={() => ville && onEdit && onEdit(ville.uuid)}
                  disabled={!ville}
                >
                  <FontAwesomeIcon icon={faEdit} />
                  Modifier
                </button>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={handleClose}
                  aria-label="Fermer"
                ></button>
              </div>
            </div>
          </div>

          {/* Corps de la modal */}
          <div className="modal-body py-4">
            {/* Messages d'erreur */}
            {error && (
              <div
                className="alert alert-danger border-0 shadow-sm mb-4"
                role="alert"
              >
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faTimesCircle} className="me-2" />
                  <div>
                    <strong>Erreur:</strong> {error}
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-3">Chargement des détails de la ville...</p>
              </div>
            ) : !ville ? (
              <div className="text-center py-5">
                <FontAwesomeIcon
                  icon={faCity}
                  className="fs-1 text-muted mb-3"
                />
                <h5>Aucune ville sélectionnée</h5>
                <p className="text-muted">
                  Sélectionnez une ville pour voir ses détails
                </p>
              </div>
            ) : (
              <>
                {/* En-tête avec infos principales */}
                <div className="row mb-4">
                  <div className="col-md-8">
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div
                        className="badge d-flex align-items-center gap-2 py-2 px-3"
                        style={{
                          backgroundColor: getStatusColor(ville.statut).bg,
                          color: getStatusColor(ville.statut).text,
                          border: `1px solid ${getStatusColor(ville.statut).border}`,
                          borderRadius: "8px",
                        }}
                      >
                        <FontAwesomeIcon
                          icon={
                            ville.statut === "actif"
                              ? faCheckCircle
                              : faTimesCircle
                          }
                          className="fs-12"
                        />
                        <span className="text-uppercase fw-bold">
                          {ville.statut}
                        </span>
                      </div>
                      {ville.est_capitale && (
                        <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 py-2 px-3">
                          <FontAwesomeIcon icon={faLandmark} className="me-2" />
                          Capitale
                        </span>
                      )}
                      {ville.population && (
                        <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 py-2 px-3">
                          <FontAwesomeIcon icon={faUsers} className="me-2" />
                          {formatNumber(ville.population)} hab.
                        </span>
                      )}
                    </div>
                    <h2 className="h3 fw-bold mb-2">{ville.nom}</h2>
                    <div className="d-flex align-items-center gap-3 text-muted mb-3">
                      <div className="d-flex align-items-center gap-1">
                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                        <span>
                          Code postal: <strong>{ville.code_postal}</strong>
                        </span>
                      </div>
                      {ville.code_insee && (
                        <div className="d-flex align-items-center gap-1">
                          <FontAwesomeIcon icon={faClipboard} />
                          <span>
                            INSEE: <code>{ville.code_insee}</code>
                          </span>
                        </div>
                      )}
                    </div>
                    {ville.description && (
                      <div className="alert alert-info bg-opacity-10 border-info border-opacity-25 border-start-0 border-end-0 border-3">
                        <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                        {ville.description}
                      </div>
                    )}
                  </div>
                  <div className="col-md-4">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body">
                        <h6 className="card-title text-muted mb-3">
                          <FontAwesomeIcon icon={faFlag} className="me-2" />
                          Informations pays
                        </h6>
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <div
                            className="rounded-circle p-2"
                            style={{ backgroundColor: colors.oskar.lightGrey }}
                          >
                            <FontAwesomeIcon icon={faGlobe} />
                          </div>
                          <div>
                            <div className="fw-bold">
                              {ville.pays?.nom || "N/A"}
                            </div>
                            <div className="text-muted small">
                              Code: {ville.pays?.code} | Indicatif:{" "}
                              {ville.pays?.indicatif}
                            </div>
                          </div>
                        </div>
                        <div className="border-top pt-3">
                          <div className="row small text-muted">
                            <div className="col-6">
                              <div className="mb-1">Créée le:</div>
                              <div className="fw-semibold">
                                {formatDate(ville.created_at)}
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="mb-1">Dernière modification:</div>
                              <div className="fw-semibold">
                                {formatDate(ville.updated_at)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Onglets de navigation */}
                <div className="mb-4">
                  <ul className="nav nav-tabs border-0" role="tablist">
                    <li className="nav-item" role="presentation">
                      <button
                        className={`nav-link ${activeTab === "general" ? "active" : ""}`}
                        onClick={() => setActiveTab("general")}
                        style={{
                          border: "none",
                          borderBottom:
                            activeTab === "general"
                              ? `3px solid ${colors.oskar.blue}`
                              : "none",
                          color:
                            activeTab === "general"
                              ? colors.oskar.blue
                              : colors.oskar.grey,
                          fontWeight: activeTab === "general" ? "600" : "400",
                        }}
                      >
                        <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                        Général
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button
                        className={`nav-link ${activeTab === "geographie" ? "active" : ""}`}
                        onClick={() => setActiveTab("geographie")}
                        style={{
                          border: "none",
                          borderBottom:
                            activeTab === "geographie"
                              ? `3px solid ${colors.oskar.blue}`
                              : "none",
                          color:
                            activeTab === "geographie"
                              ? colors.oskar.blue
                              : colors.oskar.grey,
                          fontWeight:
                            activeTab === "geographie" ? "600" : "400",
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faMapMarkerAlt}
                          className="me-2"
                        />
                        Géographie
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button
                        className={`nav-link ${activeTab === "demographie" ? "active" : ""}`}
                        onClick={() => setActiveTab("demographie")}
                        style={{
                          border: "none",
                          borderBottom:
                            activeTab === "demographie"
                              ? `3px solid ${colors.oskar.blue}`
                              : "none",
                          color:
                            activeTab === "demographie"
                              ? colors.oskar.blue
                              : colors.oskar.grey,
                          fontWeight:
                            activeTab === "demographie" ? "600" : "400",
                        }}
                      >
                        <FontAwesomeIcon icon={faUsers} className="me-2" />
                        Démographie
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button
                        className={`nav-link ${activeTab === "economie" ? "active" : ""}`}
                        onClick={() => setActiveTab("economie")}
                        style={{
                          border: "none",
                          borderBottom:
                            activeTab === "economie"
                              ? `3px solid ${colors.oskar.blue}`
                              : "none",
                          color:
                            activeTab === "economie"
                              ? colors.oskar.blue
                              : colors.oskar.grey,
                          fontWeight: activeTab === "economie" ? "600" : "400",
                        }}
                      >
                        <FontAwesomeIcon icon={faChartLine} className="me-2" />
                        Économie
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button
                        className={`nav-link ${activeTab === "infrastructure" ? "active" : ""}`}
                        onClick={() => setActiveTab("infrastructure")}
                        style={{
                          border: "none",
                          borderBottom:
                            activeTab === "infrastructure"
                              ? `3px solid ${colors.oskar.blue}`
                              : "none",
                          color:
                            activeTab === "infrastructure"
                              ? colors.oskar.blue
                              : colors.oskar.grey,
                          fontWeight:
                            activeTab === "infrastructure" ? "600" : "400",
                        }}
                      >
                        <FontAwesomeIcon icon={faBuilding} className="me-2" />
                        Infrastructure
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Contenu des onglets */}
                <div className="tab-content">
                  {/* Onglet Général */}
                  {activeTab === "general" && (
                    <div className="row g-4">
                      <div className="col-md-6">
                        <div className="card border-0 shadow-sm h-100">
                          <div
                            className="card-header border-0 py-3"
                            style={{
                              background: colors.oskar.lightGrey,
                              borderLeft: `4px solid ${colors.oskar.blue}`,
                            }}
                          >
                            <h6 className="mb-0 fw-bold">
                              <FontAwesomeIcon
                                icon={faInfoCircle}
                                className="me-2"
                              />
                              Informations de base
                            </h6>
                          </div>
                          <div className="card-body">
                            <div className="row mb-3">
                              <div className="col-6">
                                <small className="text-muted d-block">
                                  Nom complet
                                </small>
                                <div className="fw-semibold">{ville.nom}</div>
                              </div>
                              <div className="col-6">
                                <small className="text-muted d-block">
                                  Code postal
                                </small>
                                <div className="fw-semibold d-flex align-items-center gap-2">
                                  <code>{ville.code_postal}</code>
                                  <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() =>
                                      copyToClipboard(
                                        ville.code_postal,
                                        "Code postal",
                                      )
                                    }
                                  >
                                    <FontAwesomeIcon icon={faClipboard} />
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="row mb-3">
                              <div className="col-6">
                                <small className="text-muted d-block">
                                  Code INSEE
                                </small>
                                <div className="fw-semibold">
                                  {ville.code_insee || (
                                    <span className="text-muted">
                                      Non renseigné
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="col-6">
                                <small className="text-muted d-block">
                                  Statut administratif
                                </small>
                                <div className="fw-semibold">
                                  <span
                                    className="badge"
                                    style={{
                                      backgroundColor: getStatusColor(
                                        ville.statut,
                                      ).bg,
                                      color: getStatusColor(ville.statut).text,
                                      border: `1px solid ${getStatusColor(ville.statut).border}`,
                                    }}
                                  >
                                    {ville.statut === "actif"
                                      ? "Active"
                                      : ville.statut === "inactif"
                                        ? "Inactive"
                                        : "Archivée"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="card border-0 shadow-sm h-100">
                          <div
                            className="card-header border-0 py-3"
                            style={{
                              background: colors.oskar.lightGrey,
                              borderLeft: `4px solid ${colors.oskar.green}`,
                            }}
                          >
                            <h6 className="mb-0 fw-bold">
                              <FontAwesomeIcon icon={faFlag} className="me-2" />
                              Localisation
                            </h6>
                          </div>
                          <div className="card-body">
                            <div className="d-flex align-items-center gap-3 mb-4">
                              <div
                                className="rounded-circle p-3"
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
                                <div className="fw-bold fs-5">
                                  {ville.pays?.nom}
                                </div>
                                <div className="text-muted">
                                  Code: {ville.pays?.code} | Indicatif:{" "}
                                  {ville.pays?.indicatif}
                                </div>
                              </div>
                            </div>
                            {ville.pays?.code_drapeau && (
                              <div className="alert alert-light border d-flex align-items-center gap-3">
                                <div className="fs-4">
                                  {ville.pays.code_drapeau}
                                </div>
                                <div>
                                  <small className="text-muted">
                                    Drapeau du pays
                                  </small>
                                  <div className="fw-semibold">
                                    {ville.pays.nom}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Coordonnées GPS */}
                      {ville.latitude && ville.longitude && (
                        <div className="col-12">
                          <div className="card border-0 shadow-sm">
                            <div
                              className="card-header border-0 py-3"
                              style={{
                                background: colors.oskar.lightGrey,
                                borderLeft: `4px solid ${colors.oskar.orange}`,
                              }}
                            >
                              <h6 className="mb-0 fw-bold">
                                <FontAwesomeIcon
                                  icon={faMapMarkerAlt}
                                  className="me-2"
                                />
                                Coordonnées GPS
                              </h6>
                            </div>
                            <div className="card-body">
                              <div className="row">
                                <div className="col-md-6">
                                  <div className="input-group mb-3">
                                    <span className="input-group-text">
                                      Latitude
                                    </span>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={ville.latitude}
                                      readOnly
                                    />
                                    <button
                                      className="btn btn-outline-secondary"
                                      onClick={() =>
                                        copyToClipboard(
                                          ville.latitude!.toString(),
                                          "Latitude",
                                        )
                                      }
                                    >
                                      <FontAwesomeIcon icon={faClipboard} />
                                    </button>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="input-group mb-3">
                                    <span className="input-group-text">
                                      Longitude
                                    </span>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={ville.longitude}
                                      readOnly
                                    />
                                    <button
                                      className="btn btn-outline-secondary"
                                      onClick={() =>
                                        copyToClipboard(
                                          ville.longitude!.toString(),
                                          "Longitude",
                                        )
                                      }
                                    >
                                      <FontAwesomeIcon icon={faClipboard} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                              <div className="alert alert-info bg-opacity-10">
                                <FontAwesomeIcon
                                  icon={faExternalLinkAlt}
                                  className="me-2"
                                />
                                <a
                                  href={`https://www.google.com/maps?q=${ville.latitude},${ville.longitude}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-decoration-none"
                                >
                                  Voir sur Google Maps →
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Onglet Géographie */}
                  {activeTab === "geographie" && (
                    <div className="row g-4">
                      <div className="col-md-6">
                        <div className="card border-0 shadow-sm h-100">
                          <div
                            className="card-header border-0 py-3"
                            style={{
                              background: colors.oskar.lightGrey,
                              borderLeft: `4px solid ${colors.oskar.green}`,
                            }}
                          >
                            <h6 className="mb-0 fw-bold">
                              <FontAwesomeIcon icon={faTree} className="me-2" />
                              Caractéristiques physiques
                            </h6>
                          </div>
                          <div className="card-body">
                            <div className="row">
                              <div className="col-6 mb-3">
                                <small className="text-muted d-block">
                                  Superficie
                                </small>
                                <div className="fw-semibold">
                                  {ville.superficie
                                    ? `${formatNumber(ville.superficie)} km²`
                                    : "Non renseigné"}
                                </div>
                              </div>
                              <div className="col-6 mb-3">
                                <small className="text-muted d-block">
                                  Altitude
                                </small>
                                <div className="fw-semibold">
                                  {ville.altitude
                                    ? `${formatNumber(ville.altitude)} m`
                                    : "Non renseigné"}
                                </div>
                              </div>
                              <div className="col-6 mb-3">
                                <small className="text-muted d-block">
                                  Espaces verts
                                </small>
                                <div className="fw-semibold">
                                  {ville.espaces_verts
                                    ? `${ville.espaces_verts}%`
                                    : "Non renseigné"}
                                </div>
                              </div>
                              <div className="col-6 mb-3">
                                <small className="text-muted d-block">
                                  Qualité de l'air
                                </small>
                                <div className="fw-semibold">
                                  {ville.qualite_air
                                    ? `${ville.qualite_air}/10`
                                    : "Non renseigné"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="card border-0 shadow-sm h-100">
                          <div
                            className="card-header border-0 py-3"
                            style={{
                              background: colors.oskar.lightGrey,
                              borderLeft: `4px solid ${colors.oskar.blue}`,
                            }}
                          >
                            <h6 className="mb-0 fw-bold">
                              <FontAwesomeIcon icon={faSun} className="me-2" />
                              Climat et environnement
                            </h6>
                          </div>
                          <div className="card-body">
                            <div className="text-center py-4">
                              <FontAwesomeIcon
                                icon={faSun}
                                className="fs-1 text-warning mb-3"
                              />
                              <h6>Données climatiques</h6>
                              <p className="text-muted mb-0">
                                Les informations climatiques ne sont pas encore
                                disponibles pour cette ville.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Onglet Démographie */}
                  {activeTab === "demographie" && (
                    <div className="row g-4">
                      <div className="col-md-6">
                        <div className="card border-0 shadow-sm h-100">
                          <div
                            className="card-header border-0 py-3"
                            style={{
                              background: colors.oskar.lightGrey,
                              borderLeft: `4px solid ${colors.oskar.purple}`,
                            }}
                          >
                            <h6 className="mb-0 fw-bold">
                              <FontAwesomeIcon
                                icon={faUsers}
                                className="me-2"
                              />
                              Population
                            </h6>
                          </div>
                          <div className="card-body">
                            <div className="row mb-4">
                              <div className="col-12">
                                <div className="d-flex justify-content-center mb-3">
                                  <div
                                    className="rounded-circle p-4 d-flex flex-column align-items-center justify-content-center"
                                    style={{
                                      backgroundColor: `${colors.oskar.purple}15`,
                                      width: "120px",
                                      height: "120px",
                                      border: `3px solid ${colors.oskar.purple}`,
                                    }}
                                  >
                                    <span className="fs-2 fw-bold text-primary">
                                      {ville.population
                                        ? formatNumber(ville.population)
                                        : "N/A"}
                                    </span>
                                    <small className="text-muted">
                                      habitants
                                    </small>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-6 mb-3">
                                <small className="text-muted d-block">
                                  Densité
                                </small>
                                <div className="fw-semibold">
                                  {ville.densite
                                    ? `${formatNumber(ville.densite)} hab./km²`
                                    : "Non renseigné"}
                                </div>
                              </div>
                              <div className="col-6 mb-3">
                                <small className="text-muted d-block">
                                  Année recensement
                                </small>
                                <div className="fw-semibold">
                                  {ville.annee_recensement || "Non renseigné"}
                                </div>
                              </div>
                              <div className="col-6 mb-3">
                                <small className="text-muted d-block">
                                  Évolution population
                                </small>
                                <div className="fw-semibold">
                                  {ville.evolution_population
                                    ? `${ville.evolution_population}%`
                                    : "Non renseigné"}
                                </div>
                              </div>
                              <div className="col-6 mb-3">
                                <small className="text-muted d-block">
                                  Taux de natalité
                                </small>
                                <div className="fw-semibold">
                                  {ville.taux_natalite
                                    ? `${ville.taux_natalite}%`
                                    : "Non renseigné"}
                                </div>
                              </div>
                              <div className="col-6">
                                <small className="text-muted d-block">
                                  Taux de mortalité
                                </small>
                                <div className="fw-semibold">
                                  {ville.taux_mortalite
                                    ? `${ville.taux_mortalite}%`
                                    : "Non renseigné"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="card border-0 shadow-sm h-100">
                          <div
                            className="card-header border-0 py-3"
                            style={{
                              background: colors.oskar.lightGrey,
                              borderLeft: `4px solid ${colors.oskar.orange}`,
                            }}
                          >
                            <h6 className="mb-0 fw-bold">
                              <FontAwesomeIcon
                                icon={faChartLine}
                                className="me-2"
                              />
                              Statistiques démographiques
                            </h6>
                          </div>
                          <div className="card-body">
                            <div className="text-center py-4">
                              <div className="fs-1 mb-3">📊</div>
                              <h6>Statistiques avancées</h6>
                              <p className="text-muted mb-0">
                                Les statistiques détaillées ne sont pas encore
                                disponibles pour cette ville.
                              </p>
                              <div className="mt-4">
                                <div
                                  className="progress mb-3"
                                  style={{ height: "8px" }}
                                >
                                  <div
                                    className="progress-bar bg-success"
                                    role="progressbar"
                                    style={{ width: "65%" }}
                                  ></div>
                                </div>
                                <div
                                  className="progress mb-3"
                                  style={{ height: "8px" }}
                                >
                                  <div
                                    className="progress-bar bg-warning"
                                    role="progressbar"
                                    style={{ width: "45%" }}
                                  ></div>
                                </div>
                                <div
                                  className="progress"
                                  style={{ height: "8px" }}
                                >
                                  <div
                                    className="progress-bar bg-info"
                                    role="progressbar"
                                    style={{ width: "80%" }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Onglet Économie */}
                  {activeTab === "economie" && (
                    <div className="row g-4">
                      <div className="col-md-6">
                        <div className="card border-0 shadow-sm h-100">
                          <div
                            className="card-header border-0 py-3"
                            style={{
                              background: colors.oskar.lightGrey,
                              borderLeft: `4px solid ${colors.oskar.green}`,
                            }}
                          >
                            <h6 className="mb-0 fw-bold">
                              <FontAwesomeIcon
                                icon={faIndustry}
                                className="me-2"
                              />
                              Activités économiques
                            </h6>
                          </div>
                          <div className="card-body">
                            <div className="row mb-3">
                              <div className="col-6">
                                <small className="text-muted d-block">
                                  Nombre d'entreprises
                                </small>
                                <div className="fw-semibold">
                                  {ville.nombre_entreprises
                                    ? formatNumber(ville.nombre_entreprises)
                                    : "Non renseigné"}
                                </div>
                              </div>
                              <div className="col-6">
                                <small className="text-muted d-block">
                                  Taux de chômage
                                </small>
                                <div className="fw-semibold">
                                  {ville.taux_chomage
                                    ? `${ville.taux_chomage}%`
                                    : "Non renseigné"}
                                </div>
                              </div>
                            </div>
                            <div className="mb-3">
                              <small className="text-muted d-block mb-2">
                                Revenu médian
                              </small>
                              <div className="fw-semibold">
                                {ville.revenu_median
                                  ? `${formatNumber(ville.revenu_median)} €`
                                  : "Non renseigné"}
                              </div>
                            </div>
                            {ville.principales_activites &&
                              ville.principales_activites.length > 0 && (
                                <div>
                                  <small className="text-muted d-block mb-2">
                                    Principales activités
                                  </small>
                                  <div className="d-flex flex-wrap gap-2">
                                    {ville.principales_activites.map(
                                      (activite, index) => (
                                        <span
                                          key={index}
                                          className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25"
                                        >
                                          {activite}
                                        </span>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="card border-0 shadow-sm h-100">
                          <div
                            className="card-header border-0 py-3"
                            style={{
                              background: colors.oskar.lightGrey,
                              borderLeft: `4px solid ${colors.oskar.blue}`,
                            }}
                          >
                            <h6 className="mb-0 fw-bold">
                              <FontAwesomeIcon
                                icon={faHotel}
                                className="me-2"
                              />
                              Tourisme
                            </h6>
                          </div>
                          <div className="card-body">
                            {ville.sites_touristiques &&
                            ville.sites_touristiques.length > 0 ? (
                              <>
                                <div className="mb-3">
                                  <small className="text-muted d-block">
                                    Sites touristiques
                                  </small>
                                  <ul className="list-unstyled mb-0">
                                    {ville.sites_touristiques.map(
                                      (site, index) => (
                                        <li
                                          key={index}
                                          className="py-1 border-bottom"
                                        >
                                          <FontAwesomeIcon
                                            icon={faLandmark}
                                            className="me-2 text-muted"
                                          />
                                          {site}
                                        </li>
                                      ),
                                    )}
                                  </ul>
                                </div>
                              </>
                            ) : (
                              <div className="text-center py-4">
                                <FontAwesomeIcon
                                  icon={faHotel}
                                  className="fs-1 text-muted mb-3"
                                />
                                <h6>Information touristique</h6>
                                <p className="text-muted mb-0">
                                  Aucune information touristique disponible pour
                                  cette ville.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Onglet Infrastructure */}
                  {activeTab === "infrastructure" && (
                    <div className="row g-4">
                      <div className="col-md-6">
                        <div className="card border-0 shadow-sm h-100">
                          <div
                            className="card-header border-0 py-3"
                            style={{
                              background: colors.oskar.lightGrey,
                              borderLeft: `4px solid ${colors.oskar.purple}`,
                            }}
                          >
                            <h6 className="mb-0 fw-bold">
                              <FontAwesomeIcon
                                icon={faBuilding}
                                className="me-2"
                              />
                              Équipements publics
                            </h6>
                          </div>
                          <div className="card-body">
                            <div className="row">
                              <div className="col-6 mb-4">
                                <div className="text-center">
                                  <div
                                    className="rounded-circle p-3 d-inline-flex align-items-center justify-content-center mb-2"
                                    style={{
                                      backgroundColor: `${colors.oskar.purple}15`,
                                    }}
                                  >
                                    <FontAwesomeIcon
                                      icon={faSchool}
                                      style={{
                                        color: colors.oskar.purple,
                                        fontSize: "1.5rem",
                                      }}
                                    />
                                  </div>
                                  <div className="fw-bold fs-4">
                                    {ville.nombre_ecoles || "0"}
                                  </div>
                                  <small className="text-muted">Écoles</small>
                                </div>
                              </div>
                              <div className="col-6 mb-4">
                                <div className="text-center">
                                  <div
                                    className="rounded-circle p-3 d-inline-flex align-items-center justify-content-center mb-2"
                                    style={{
                                      backgroundColor: `${colors.oskar.red}15`,
                                    }}
                                  >
                                    <FontAwesomeIcon
                                      icon={faHospital}
                                      style={{
                                        color: colors.oskar.red,
                                        fontSize: "1.5rem",
                                      }}
                                    />
                                  </div>
                                  <div className="fw-bold fs-4">
                                    {ville.nombre_hopitaux || "0"}
                                  </div>
                                  <small className="text-muted">Hôpitaux</small>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="card border-0 shadow-sm h-100">
                          <div
                            className="card-header border-0 py-3"
                            style={{
                              background: colors.oskar.lightGrey,
                              borderLeft: `4px solid ${colors.oskar.orange}`,
                            }}
                          >
                            <h6 className="mb-0 fw-bold">
                              <FontAwesomeIcon
                                icon={faRoute}
                                className="me-2"
                              />
                              Transports
                            </h6>
                          </div>
                          <div className="card-body">
                            <div className="text-center py-4">
                              <FontAwesomeIcon
                                icon={faRoute}
                                className="fs-1 text-muted mb-3"
                              />
                              <h6>Réseau de transport</h6>
                              <p className="text-muted mb-0">
                                Les informations sur les transports ne sont pas
                                encore disponibles.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pied de page avec métadonnées */}
                <div className="border-top pt-4 mt-4">
                  <div className="row">
                    <div className="col-md-4">
                      <small className="text-muted d-block">UUID</small>
                      <div className="d-flex align-items-center gap-2">
                        <code className="bg-light px-2 py-1 rounded">
                          {ville.uuid}
                        </code>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => copyToClipboard(ville.uuid, "UUID")}
                        >
                          <FontAwesomeIcon icon={faClipboard} />
                        </button>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <small className="text-muted d-block">Créée par</small>
                      <div>{ville.created_by || "Système"}</div>
                    </div>
                    <div className="col-md-4">
                      <small className="text-muted d-block">Validée le</small>
                      <div>{formatDate(ville.validated_at)}</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Pied de la modal */}
          <div className="modal-footer border-top-0 py-4 px-4">
            <div className="d-flex justify-content-between w-100">
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  onClick={() =>
                    ville && copyToClipboard(ville.uuid, "UUID de la ville")
                  }
                  disabled={!ville}
                >
                  <FontAwesomeIcon icon={faClipboard} />
                  Copier UUID
                </button>
                <button
                  type="button"
                  className="btn btn-outline-primary d-flex align-items-center gap-2"
                  onClick={() => {
                    if (ville) {
                      const dataStr = JSON.stringify(ville, null, 2);
                      const dataBlob = new Blob([dataStr], {
                        type: "application/json",
                      });
                      const url = URL.createObjectURL(dataBlob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `ville-${ville.nom}-${ville.code_postal}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }
                  }}
                  disabled={!ville}
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Télécharger JSON
                </button>
              </div>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleClose}
                >
                  Fermer
                </button>
                {onEdit && ville && (
                  <button
                    type="button"
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={() => onEdit(ville.uuid)}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                    Modifier
                  </button>
                )}
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

        .nav-tabs .nav-link {
          border-radius: 8px 8px 0 0;
          padding: 12px 20px;
          transition: all 0.3s ease;
        }

        .nav-tabs .nav-link:hover {
          background-color: rgba(13, 110, 253, 0.05);
        }

        .nav-tabs .nav-link.active {
          background-color: rgba(13, 110, 253, 0.1);
        }

        .card {
          border-radius: 12px !important;
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
        }

        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
        }

        .badge {
          border-radius: 8px !important;
        }

        .fs-12 {
          font-size: 12px !important;
        }

        .fs-14 {
          font-size: 14px !important;
        }

        .progress {
          border-radius: 10px;
        }

        code {
          font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}
