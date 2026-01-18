"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faExchangeAlt,
  faTag,
  faFileAlt,
  faPhone,
  faBox,
  faHandHoldingHeart,
  faImage,
  faCalendar,
  faCheckCircle,
  faClock,
  faMoneyBillWave,
  faHashtag,
} from "@fortawesome/free-solid-svg-icons";
import colors from "@/app/shared/constants/colors";
import { Echange } from "@/app/shared/types/echange.types";

interface ViewEchangeModalProps {
  isOpen: boolean;
  echange: Echange;
  onClose: () => void;
}

const StatusBadge = ({ statut }: { statut: string }) => {
  const getStatusConfig = (statut: string) => {
    switch (statut) {
      case "en_attente":
        return {
          icon: faClock,
          color: colors.oskar.orange,
          label: "En attente",
          bgColor: `${colors.oskar.orange}15`,
          borderColor: `${colors.oskar.orange}30`,
        };
      case "en_cours":
        return {
          icon: faExchangeAlt,
          color: colors.oskar.blue,
          label: "En cours",
          bgColor: `${colors.oskar.blue}15`,
          borderColor: `${colors.oskar.blue}30`,
        };
      case "termine":
        return {
          icon: faCheckCircle,
          color: colors.oskar.green,
          label: "Terminé",
          bgColor: `${colors.oskar.green}15`,
          borderColor: `${colors.oskar.green}30`,
        };
      case "annule":
        return {
          icon: faTimes,
          color: colors.oskar.orange,
          label: "Annulé",
          bgColor: `${colors.oskar.orange}15`,
          borderColor: `${colors.oskar.orange}30`,
        };
      default:
        return {
          icon: faClock,
          color: colors.oskar.grey,
          label: statut,
          bgColor: `${colors.oskar.grey}15`,
          borderColor: `${colors.oskar.grey}30`,
        };
    }
  };

  const config = getStatusConfig(statut);

  return (
    <span
      className="badge d-inline-flex align-items-center gap-2"
      style={{
        backgroundColor: config.bgColor,
        color: config.color,
        border: `1px solid ${config.borderColor}`,
        padding: "0.5rem 1rem",
        fontSize: "0.85rem",
      }}
    >
      <FontAwesomeIcon icon={config.icon} />
      <span>{config.label}</span>
    </span>
  );
};

export default function ViewEchangeModal({
  isOpen,
  echange,
  onClose,
}: ViewEchangeModalProps) {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Non spécifié";
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime())
        ? "Date invalide"
        : date.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
    } catch {
      return "Date invalide";
    }
  };

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    if (isNaN(num) || num === 0) return "Gratuit";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(num);
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
      role="dialog"
      aria-labelledby="viewEchangeModalLabel"
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
              background: `linear-gradient(135deg, ${colors.oskar.blue} 0%, ${colors.oskar.blueHover} 100%)`,
              borderBottom: `3px solid ${colors.oskar.orange}`,
            }}
          >
            <div className="d-flex align-items-center">
              <div className="bg-white bg-opacity-20 rounded-circle p-2 me-3">
                <FontAwesomeIcon icon={faExchangeAlt} className="fs-5" />
              </div>
              <div>
                <h5
                  className="modal-title mb-0 fw-bold"
                  id="viewEchangeModalLabel"
                >
                  Détails de l'Échange
                </h5>
                <p className="mb-0 opacity-75 fs-14">
                  Informations complètes sur l'échange
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Fermer"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </div>

          {/* Corps */}
          <div className="modal-body py-4">
            <div className="row">
              {/* Image */}
              <div className="col-md-4 mb-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    {echange.image ? (
                      <img
                        src={echange.image}
                        alt={echange.titre}
                        className="img-fluid rounded-3 mb-3"
                        style={{
                          maxHeight: "250px",
                          objectFit: "cover",
                          width: "100%",
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            `https://via.placeholder.com/300/cccccc/ffffff?text=${echange.titre?.charAt(0) || "E"}`;
                        }}
                      />
                    ) : (
                      <div className="bg-light rounded-3 p-5 mb-3">
                        <FontAwesomeIcon
                          icon={faImage}
                          className="text-muted fs-1"
                        />
                      </div>
                    )}
                    <StatusBadge statut={echange.statut} />
                  </div>
                </div>
              </div>

              {/* Informations */}
              <div className="col-md-8">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h3 className="fw-bold text-dark mb-4">{echange.titre}</h3>

                    <div className="row mb-4">
                      <div className="col-md-6 mb-3">
                        <div className="d-flex align-items-center mb-2">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center me-3"
                            style={{
                              width: "40px",
                              height: "40px",
                              backgroundColor: `${colors.oskar.blue}15`,
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faTag}
                              style={{ color: colors.oskar.blue }}
                            />
                          </div>
                          <div>
                            <small className="text-muted d-block">Titre</small>
                            <p className="fw-semibold mb-0">{echange.titre}</p>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6 mb-3">
                        <div className="d-flex align-items-center mb-2">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center me-3"
                            style={{
                              width: "40px",
                              height: "40px",
                              backgroundColor: `${colors.oskar.green}15`,
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faMoneyBillWave}
                              style={{ color: colors.oskar.green }}
                            />
                          </div>
                          <div>
                            <small className="text-muted d-block">
                              Prix estimé
                            </small>
                            <p className="fw-semibold mb-0"></p>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6 mb-3">
                        <div className="d-flex align-items-center mb-2">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center me-3"
                            style={{
                              width: "40px",
                              height: "40px",
                              backgroundColor: `${colors.oskar.orange}15`,
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faPhone}
                              style={{ color: colors.oskar.orange }}
                            />
                          </div>
                          <div>
                            <small className="text-muted d-block">
                              Contact
                            </small>
                            <p className="fw-semibold mb-0">{echange.numero}</p>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6 mb-3">
                        <div className="d-flex align-items-center mb-2">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center me-3"
                            style={{
                              width: "40px",
                              height: "40px",
                              backgroundColor: `${colors.oskar.blue}15`,
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faCalendar}
                              style={{ color: colors.oskar.blueHover }}
                            />
                          </div>
                          <div>
                            <small className="text-muted d-block">
                              Date de création
                            </small>
                            <p className="fw-semibold mb-0">
                              {formatDate(echange.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {echange.description && (
                      <div className="mb-4">
                        <h6 className="fw-bold text-dark mb-3">
                          <FontAwesomeIcon
                            icon={faFileAlt}
                            className="me-2 text-primary"
                          />
                          Description
                        </h6>
                        <div className="bg-light rounded p-3">
                          <p className="mb-0">{echange.description}</p>
                        </div>
                      </div>
                    )}

                    {/* Détails supplémentaires */}
                    {(echange.objetPropose || echange.objetDemande) && (
                      <div className="mb-4">
                        <h6 className="fw-bold text-dark mb-3">
                          Détails de l'échange
                        </h6>
                        <div className="row">
                          {echange.objetPropose && (
                            <div className="col-md-6 mb-3">
                              <div className="bg-success bg-opacity-10 rounded p-3">
                                <small className="text-success fw-semibold">
                                  Objet proposé
                                </small>
                                <p className="mb-0 fw-bold">
                                  {echange.objetPropose}
                                </p>
                              </div>
                            </div>
                          )}
                          {echange.objetDemande && (
                            <div className="col-md-6 mb-3">
                              <div className="bg-primary bg-opacity-10 rounded p-3">
                                <small className="text-primary fw-semibold">
                                  Objet recherché
                                </small>
                                <p className="mb-0 fw-bold">
                                  {echange.objetDemande}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Quantité */}
                    {echange.quantite && (
                      <div className="mb-4">
                        <h6 className="fw-bold text-dark mb-3">
                          <FontAwesomeIcon
                            icon={faHashtag}
                            className="me-2 text-primary"
                          />
                          Quantité
                        </h6>
                        <p className="fw-semibold">
                          {echange.quantite} unité(s)
                        </p>
                      </div>
                    )}
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
              style={{
                background: colors.oskar.lightGrey,
                color: colors.oskar.grey,
                border: `1px solid ${colors.oskar.grey}30`,
                borderRadius: "8px",
                fontWeight: "500",
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
