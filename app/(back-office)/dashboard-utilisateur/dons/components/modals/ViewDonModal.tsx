// components/dons/ViewDonModal.tsx
"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faGift,
  faTag,
  faFileAlt,
  faPhone,
  faBox,
  faMapMarkerAlt,
  faUser,
  faImage,
  faCalendar,
  faCheckCircle,
  faClock,
  faGlobe,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import colors from "@/app/shared/constants/colors";

interface Don {
  uuid: string;
  titre: string;
  type_don: string;
  description: string;
  localisation: string;
  lieu_retrait: string;
  quantite: string;
  nom_donataire: string;
  numero: string;
  condition: string;
  disponibilite: string;
  image: string;
  statut: string;
  prix: number | null;
  estPublie: boolean;
  est_bloque: boolean | null;
  date_debut: string;
  categorie: string;
  vendeur: string;
}

interface ViewDonModalProps {
  isOpen: boolean;
  don: Don;
  onClose: () => void;
}

const StatusBadge = ({ statut }: { statut: string }) => {
  const getStatusConfig = (statut: string) => {
    switch (statut) {
      case "disponible":
        return {
          icon: faCheckCircle,
          color: colors.oskar.green,
          label: "Disponible",
          bgColor: `${colors.oskar.green}15`,
          borderColor: `${colors.oskar.green}30`,
        };
      case "reserve":
        return {
          icon: faClock,
          color: colors.oskar.orange,
          label: "Réservé",
          bgColor: `${colors.oskar.orange}15`,
          borderColor: `${colors.oskar.orange}30`,
        };
      case "attribue":
        return {
          icon: faCheckCircle,
          color: colors.oskar.blue,
          label: "Attribué",
          bgColor: `${colors.oskar.blue}15`,
          borderColor: `${colors.oskar.blue}30`,
        };
      case "publie":
        return {
          icon: faGlobe,
          color: colors.oskar.green,
          label: "Publié",
          bgColor: `${colors.oskar.green}15`,
          borderColor: `${colors.oskar.green}30`,
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

const ConditionBadge = ({ condition }: { condition: string }) => {
  const getConditionConfig = (condition: string) => {
    switch (condition) {
      case "neuf":
        return {
          label: "Neuf",
          color: colors.oskar.green,
          bgColor: `${colors.oskar.green}15`,
        };
      case "tres_bon":
        return {
          label: "Très bon état",
          color: colors.oskar.blue,
          bgColor: `${colors.oskar.blue}15`,
        };
      case "bon":
        return {
          label: "Bon état",
          color: colors.oskar.yellow,
          bgColor: `${colors.oskar.yellow}15`,
        };
      case "usage":
        return {
          label: "État d'usage",
          color: colors.oskar.orange,
          bgColor: `${colors.oskar.orange}15`,
        };
      case "reparation":
        return {
          label: "À réparer",
          color: colors.oskar.red,
          bgColor: `${colors.oskar.red}15`,
        };
      default:
        return {
          label: condition,
          color: colors.oskar.grey,
          bgColor: `${colors.oskar.grey}15`,
        };
    }
  };

  const config = getConditionConfig(condition);

  return (
    <span
      className="badge d-inline-flex align-items-center"
      style={{
        backgroundColor: config.bgColor,
        color: config.color,
        border: `1px solid ${config.color}30`,
        padding: "0.25rem 0.75rem",
        fontSize: "0.75rem",
      }}
    >
      <span>{config.label}</span>
    </span>
  );
};

export default function ViewDonModal({
  isOpen,
  don,
  onClose,
}: ViewDonModalProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Non spécifié";
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime())
        ? "Date invalide"
        : date.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
    } catch {
      return "Date invalide";
    }
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
      aria-labelledby="viewDonModalLabel"
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
                <FontAwesomeIcon icon={faGift} className="fs-5" />
              </div>
              <div>
                <h5 className="modal-title mb-0 fw-bold" id="viewDonModalLabel">
                  Détails du Don
                </h5>
                <p className="mb-0 opacity-75 fs-14">
                  Informations complètes sur le don
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
                    {don.image ? (
                      <img
                        src={don.image}
                        alt={don.titre}
                        className="img-fluid rounded-3 mb-3"
                        style={{
                          maxHeight: "250px",
                          objectFit: "cover",
                          width: "100%",
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            `https://via.placeholder.com/300/cccccc/ffffff?text=${don.titre?.charAt(0) || "D"}`;
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
                    <div className="d-flex flex-column gap-2">
                      <StatusBadge statut={don.statut} />
                      {don.estPublie && (
                        <span
                          className="badge bg-success bg-opacity-10 text-success"
                          style={{ fontSize: "0.75rem" }}
                        >
                          <FontAwesomeIcon icon={faGlobe} className="me-1" />
                          Publié
                        </span>
                      )}
                      {don.est_bloque && (
                        <span
                          className="badge bg-danger bg-opacity-10 text-danger"
                          style={{ fontSize: "0.75rem" }}
                        >
                          <FontAwesomeIcon icon={faTimes} className="me-1" />
                          Bloqué
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations */}
              <div className="col-md-8">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h3 className="fw-bold text-dark mb-3">{don.titre}</h3>
                    <p className="text-muted mb-4">
                      Type: <span className="fw-semibold">{don.type_don}</span>
                      {don.categorie && (
                        <>
                          {" "}
                          • Catégorie:{" "}
                          <span className="fw-semibold">{don.categorie}</span>
                        </>
                      )}
                    </p>

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
                              icon={faUser}
                              style={{ color: colors.oskar.blue }}
                            />
                          </div>
                          <div>
                            <small className="text-muted d-block">
                              Donataire
                            </small>
                            <p className="fw-semibold mb-0">
                              {don.vendeur || don.nom_donataire}
                            </p>
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
                              icon={faBox}
                              style={{ color: colors.oskar.green }}
                            />
                          </div>
                          <div>
                            <small className="text-muted d-block">
                              Quantité
                            </small>
                            <p className="fw-semibold mb-0">{don.quantite}</p>
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
                            <p className="fw-semibold mb-0">{don.numero}</p>
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
                              {formatDate(don.date_debut)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {don.description && (
                      <div className="mb-4">
                        <h6 className="fw-bold text-dark mb-3">
                          <FontAwesomeIcon
                            icon={faFileAlt}
                            className="me-2 text-primary"
                          />
                          Description
                        </h6>
                        <div className="bg-light rounded p-3">
                          <p className="mb-0">{don.description}</p>
                        </div>
                      </div>
                    )}

                    {/* Détails supplémentaires */}
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <h6 className="fw-bold text-dark mb-2">Localisation</h6>
                        <div className="d-flex align-items-center">
                          <FontAwesomeIcon
                            icon={faMapMarkerAlt}
                            className="text-primary me-2"
                          />
                          <span>{don.localisation}</span>
                        </div>
                      </div>

                      <div className="col-md-6 mb-3">
                        <h6 className="fw-bold text-dark mb-2">
                          Lieu de retrait
                        </h6>
                        <p className="mb-0">{don.lieu_retrait}</p>
                      </div>

                      <div className="col-md-6 mb-3">
                        <h6 className="fw-bold text-dark mb-2">État</h6>
                        <ConditionBadge condition={don.condition} />
                      </div>

                      <div className="col-md-6 mb-3">
                        <h6 className="fw-bold text-dark mb-2">
                          Disponibilité
                        </h6>
                        <p className="mb-0">
                          {don.disponibilite === "immediate"
                            ? "Immédiate"
                            : don.disponibilite === "semaine"
                              ? "Cette semaine"
                              : "Ce mois-ci"}
                        </p>
                      </div>
                    </div>

                    {/* Informations supplémentaires */}
                    {don.prix !== null && don.prix !== 0 && (
                      <div className="alert alert-info border-0 mt-4">
                        <h6 className="fw-bold mb-2">
                          <FontAwesomeIcon
                            icon={faInfoCircle}
                            className="me-2"
                          />
                          Information
                        </h6>
                        <p className="mb-0">
                          Ce don a une valeur estimée de {don.prix} FCFA
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
