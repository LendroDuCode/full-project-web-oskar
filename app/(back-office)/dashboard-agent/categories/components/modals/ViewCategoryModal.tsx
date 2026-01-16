"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faTag,
  faFileAlt,
  faImage,
  faCalendar,
  faIdCard,
  faLink,
  faCheckCircle,
  faTimesCircle,
  faBoxOpen,
  faGift,
  faExchangeAlt,
  faBullhorn,
  faChartBar,
  faCopy,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";

interface Category {
  id: number;
  uuid: string;
  type: string;
  libelle: string;
  slug: string;
  description?: string;
  image: string;
  statut?: string;
  is_deleted: boolean;
  deleted_at?: string | null;
  createdAt?: string;
  updatedAt?: string;
  path?: string | null;
  depth?: number | null;
}

interface CategoryStats {
  produits?: number;
  dons?: number;
  echanges?: number;
  annonces?: number;
  total?: number;
}

interface ViewCategoryModalProps {
  isOpen: boolean;
  category: Category | null;
  onClose: () => void;
}

export default function ViewCategoryModal({
  isOpen,
  category,
  onClose,
}: ViewCategoryModalProps) {
  // États
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<CategoryStats>({});
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Charger les statistiques
  useEffect(() => {
    const fetchStats = async () => {
      if (!category) return;

      try {
        setLoading(true);
        setError(null);

        // Charger les statistiques pour chaque type
        const statsData: CategoryStats = {};

        if (category.type.toLowerCase().includes("produit")) {
          const produitsResponse = await api.get(
            API_ENDPOINTS.CATEGORIES.PRODUITS(category.uuid),
          );
          statsData.produits = produitsResponse.data?.length || 0;
        }

        if (category.type.toLowerCase().includes("don")) {
          const donsResponse = await api.get(
            API_ENDPOINTS.CATEGORIES.DONS(category.uuid),
          );
          statsData.dons = donsResponse.data?.length || 0;
        }

        if (category.type.toLowerCase().includes("échange")) {
          const echangesResponse = await api.get(
            API_ENDPOINTS.CATEGORIES.ECHANGES(category.uuid),
          );
          statsData.echanges = echangesResponse.data?.length || 0;
        }

        if (category.type.toLowerCase().includes("annonce")) {
          const annoncesResponse = await api.get(
            API_ENDPOINTS.CATEGORIES.ANNONCES(category.uuid),
          );
          statsData.annonces = annoncesResponse.data?.length || 0;
        }

        // Total général
        const allResponse = await api.get(
          API_ENDPOINTS.CATEGORIES.ALL(category.uuid),
        );
        statsData.total = allResponse.data?.length || 0;

        setStats(statsData);
      } catch (err: any) {
        console.error("❌ Erreur lors du chargement des statistiques:", err);
        setError("Impossible de charger les statistiques");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && category) {
      fetchStats();
    }
  }, [isOpen, category]);

  // Copier le UUID
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Formater la date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  // Obtenir l'icône du type
  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "produit":
        return faBoxOpen;
      case "don":
      case "don & échange":
        return faGift;
      case "échange":
        return faExchangeAlt;
      case "annonce":
        return faBullhorn;
      default:
        return faTag;
    }
  };

  // Obtenir la couleur du type
  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "produit":
        return colors.oskar.blue;
      case "don":
      case "don & échange":
        return colors.oskar.green;
      case "échange":
        return colors.oskar.purple;
      case "annonce":
        return colors.oskar.orange;
      default:
        return colors.oskar.grey;
    }
  };

  if (!isOpen || !category) return null;

  const typeIcon = getTypeIcon(category.type);
  const typeColor = getTypeColor(category.type);

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(2px)",
      }}
      role="dialog"
      aria-labelledby="viewCategoryModalLabel"
      aria-modal="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div
          className="modal-content border-0 shadow-lg"
          style={{ borderRadius: "16px" }}
        >
          {/* En-tête */}
          <div
            className="modal-header text-white border-0 rounded-top-3"
            style={{
              background: `linear-gradient(135deg, ${typeColor} 0%, ${typeColor} 100%)`,
              borderBottom: `3px solid ${colors.oskar.blue}`,
            }}
          >
            <div className="d-flex align-items-center">
              <div className="bg-white bg-opacity-20 rounded-circle p-2 me-3">
                <FontAwesomeIcon icon={typeIcon} className="fs-5" />
              </div>
              <div>
                <h5
                  className="modal-title mb-0 fw-bold"
                  id="viewCategoryModalLabel"
                >
                  Détails de la Catégorie
                </h5>
                <p className="mb-0 opacity-75 fs-14">
                  {category.libelle} • ID: {category.id}
                  {category.is_deleted && " • ❌ Supprimée"}
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
            />
          </div>

          {/* Corps */}
          <div className="modal-body py-4">
            {/* Messages d'erreur */}
            {error && (
              <div
                className="alert alert-warning alert-dismissible fade show mb-4"
                role="alert"
              >
                <FontAwesomeIcon icon={faTimesCircle} className="me-2" />
                {error}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setError(null)}
                  aria-label="Fermer l'alerte"
                />
              </div>
            )}

            <div className="row g-4">
              {/* Image et informations principales */}
              <div className="col-md-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    {/* Image */}
                    {category.image ? (
                      <div className="mb-4">
                        <img
                          src={category.image}
                          alt={category.libelle}
                          className="img-fluid rounded shadow"
                          style={{
                            maxHeight: "200px",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        className="bg-secondary bg-opacity-10 rounded d-flex align-items-center justify-content-center mb-4"
                        style={{ height: "200px" }}
                      >
                        <FontAwesomeIcon
                          icon={faImage}
                          className="text-muted"
                          style={{ fontSize: "3rem" }}
                        />
                      </div>
                    )}

                    {/* Libellé */}
                    <h4 className="fw-bold mb-3">{category.libelle}</h4>

                    {/* Type */}
                    <div className="mb-3">
                      <span
                        className="badge d-inline-flex align-items-center gap-2"
                        style={{
                          backgroundColor: `${typeColor}15`,
                          color: typeColor,
                          border: `1px solid ${typeColor}30`,
                          fontSize: "1rem",
                          padding: "0.5rem 1rem",
                        }}
                      >
                        <FontAwesomeIcon icon={typeIcon} />
                        {category.type}
                      </span>
                    </div>

                    {/* Statut */}
                    <div className="mb-4">
                      {category.statut === "actif" || !category.statut ? (
                        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 d-inline-flex align-items-center gap-2">
                          <FontAwesomeIcon icon={faCheckCircle} />
                          Actif
                        </span>
                      ) : (
                        <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 d-inline-flex align-items-center gap-2">
                          <FontAwesomeIcon icon={faTimesCircle} />
                          Inactif
                        </span>
                      )}
                      {category.is_deleted && (
                        <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 ms-2">
                          Supprimée
                        </span>
                      )}
                    </div>

                    {/* Slug */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        <FontAwesomeIcon icon={faLink} className="me-2" />
                        Slug
                      </label>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          value={category.slug}
                          readOnly
                          style={{ borderRadius: "8px 0 0 8px" }}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => copyToClipboard(category.slug)}
                          style={{ borderRadius: "0 8px 8px 0" }}
                        >
                          <FontAwesomeIcon
                            icon={faCopy}
                            className={copied ? "text-success" : ""}
                          />
                        </button>
                      </div>
                      {copied && (
                        <small className="text-success mt-1 d-block">
                          Slug copié !
                        </small>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations détaillées */}
              <div className="col-md-8">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    {/* Description */}
                    <div className="mb-4">
                      <h6 className="fw-semibold mb-3">
                        <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                        Description
                      </h6>
                      <div className="bg-light-subtle p-3 rounded">
                        {category.description ||
                          "Aucune description disponible"}
                      </div>
                    </div>

                    {/* Statistiques */}
                    <div className="mb-4">
                      <h6 className="fw-semibold mb-3">
                        <FontAwesomeIcon icon={faChartBar} className="me-2" />
                        Statistiques
                      </h6>
                      {loading ? (
                        <div className="text-center py-3">
                          <div
                            className="spinner-border text-primary"
                            role="status"
                          >
                            <span className="visually-hidden">
                              Chargement...
                            </span>
                          </div>
                          <p className="mt-2 text-muted">
                            Chargement des statistiques...
                          </p>
                        </div>
                      ) : (
                        <div className="row g-3">
                          {/* Produits */}
                          {stats.produits !== undefined && (
                            <div className="col-md-3">
                              <div className="text-center p-3 rounded border">
                                <FontAwesomeIcon
                                  icon={faBoxOpen}
                                  className="fs-3 mb-2"
                                  style={{ color: colors.oskar.blue }}
                                />
                                <h4 className="fw-bold mb-0">
                                  {stats.produits}
                                </h4>
                                <small className="text-muted">Produits</small>
                              </div>
                            </div>
                          )}

                          {/* Dons */}
                          {stats.dons !== undefined && (
                            <div className="col-md-3">
                              <div className="text-center p-3 rounded border">
                                <FontAwesomeIcon
                                  icon={faGift}
                                  className="fs-3 mb-2"
                                  style={{ color: colors.oskar.green }}
                                />
                                <h4 className="fw-bold mb-0">{stats.dons}</h4>
                                <small className="text-muted">Dons</small>
                              </div>
                            </div>
                          )}

                          {/* Échanges */}
                          {stats.echanges !== undefined && (
                            <div className="col-md-3">
                              <div className="text-center p-3 rounded border">
                                <FontAwesomeIcon
                                  icon={faExchangeAlt}
                                  className="fs-3 mb-2"
                                  style={{ color: colors.oskar.purple }}
                                />
                                <h4 className="fw-bold mb-0">
                                  {stats.echanges}
                                </h4>
                                <small className="text-muted">Échanges</small>
                              </div>
                            </div>
                          )}

                          {/* Annonces */}
                          {stats.annonces !== undefined && (
                            <div className="col-md-3">
                              <div className="text-center p-3 rounded border">
                                <FontAwesomeIcon
                                  icon={faBullhorn}
                                  className="fs-3 mb-2"
                                  style={{ color: colors.oskar.orange }}
                                />
                                <h4 className="fw-bold mb-0">
                                  {stats.annonces}
                                </h4>
                                <small className="text-muted">Annonces</small>
                              </div>
                            </div>
                          )}

                          {/* Total */}
                          <div className="col-12 mt-3">
                            <div className="text-center p-3 rounded bg-primary bg-opacity-10">
                              <h4 className="fw-bold mb-0">
                                {stats.total || 0} éléments
                              </h4>
                              <small className="text-muted">
                                Total dans cette catégorie
                              </small>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Informations techniques */}
                    <div>
                      <h6 className="fw-semibold mb-3">
                        <FontAwesomeIcon icon={faIdCard} className="me-2" />
                        Informations Techniques
                      </h6>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label fw-semibold">ID</label>
                            <div className="input-group">
                              <input
                                type="text"
                                className="form-control"
                                value={category.id}
                                readOnly
                                style={{ borderRadius: "8px 0 0 8px" }}
                              />
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() =>
                                  copyToClipboard(String(category.id))
                                }
                                style={{ borderRadius: "0 8px 8px 0" }}
                              >
                                <FontAwesomeIcon icon={faCopy} />
                              </button>
                            </div>
                          </div>

                          <div className="mb-3">
                            <label className="form-label fw-semibold">
                              UUID
                            </label>
                            <div className="input-group">
                              <input
                                type="text"
                                className="form-control"
                                value={category.uuid}
                                readOnly
                                style={{ borderRadius: "8px 0 0 8px" }}
                              />
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => copyToClipboard(category.uuid)}
                                style={{ borderRadius: "0 8px 8px 0" }}
                              >
                                <FontAwesomeIcon icon={faCopy} />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label fw-semibold">
                              <FontAwesomeIcon
                                icon={faCalendar}
                                className="me-2"
                              />
                              Créée le
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={formatDate(category.createdAt)}
                              readOnly
                              style={{ borderRadius: "8px" }}
                            />
                          </div>

                          <div className="mb-3">
                            <label className="form-label fw-semibold">
                              <FontAwesomeIcon
                                icon={faCalendar}
                                className="me-2"
                              />
                              Modifiée le
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={formatDate(category.updatedAt)}
                              readOnly
                              style={{ borderRadius: "8px" }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pied de page */}
          <div className="modal-footer border-top-0 py-4 px-4">
            <button
              type="button"
              className="btn btn-outline-secondary d-flex align-items-center gap-2"
              onClick={onClose}
              disabled={loading}
              style={{
                background: colors.oskar.lightGrey,
                color: colors.oskar.grey,
                border: `1px solid ${colors.oskar.grey}30`,
                borderRadius: "8px",
                fontWeight: "500",
                marginLeft: "auto",
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
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-content {
          border-radius: 16px !important;
          overflow: hidden;
        }

        .form-control {
          border-radius: 8px !important;
        }

        .btn {
          border-radius: 8px !important;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .fs-14 {
          font-size: 14px !important;
        }

        .img-fluid {
          max-width: 100%;
          height: auto;
        }
      `}</style>
    </div>
  );
}
