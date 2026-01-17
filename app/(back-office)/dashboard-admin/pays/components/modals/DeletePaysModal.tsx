// app/(back-office)/dashboard-admin/pays/components/modals/DeletePaysModal.tsx
"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faTrash,
  faExclamationTriangle,
  faSpinner,
  faGlobe,
  faFlag,
  faPhone,
  faCode,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";
import { Pays } from "@/services/pays/pays.types";

interface DeletePaysModalProps {
  isOpen: boolean;
  pays: Pays | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function DeletePaysModal({
  isOpen,
  pays,
  onClose,
  onSuccess,
}: DeletePaysModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const styles = {
    modalHeader: {
      background: `linear-gradient(135deg, ${colors.oskar.orange} 0%, ${colors.oskar.orangeHover} 100%)`,
      borderBottom: `3px solid ${colors.oskar.orange}`,
    },
    warningSection: {
      background: colors.oskar.lightGrey,
      borderLeft: `4px solid ${colors.oskar.orange}`,
    },
  };

  const handleSubmit = async () => {
    if (!pays || !pays.uuid) return;

    try {
      setLoading(true);
      setError(null);

      await api.delete(API_ENDPOINTS.PAYS.DELETE(pays.uuid));

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (err: any) {
      let errorMessage = "Erreur lors de la suppression du pays";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      if (err.response?.status === 404) {
        errorMessage = "Pays non trouvé.";
      } else if (err.response?.status === 403) {
        errorMessage = "Vous n'avez pas la permission de supprimer ce pays.";
      } else if (err.response?.status === 500) {
        errorMessage = "Erreur serveur. Veuillez réessayer plus tard.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  if (!isOpen || !pays) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(2px)",
      }}
      role="dialog"
      aria-labelledby="deletePaysModalLabel"
      aria-modal="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          {/* En-tête de la modal */}
          <div
            className="modal-header text-white border-0 rounded-top-3"
            style={styles.modalHeader}
          >
            <div className="d-flex align-items-center">
              <div className="bg-white bg-opacity-20 rounded-circle p-2 me-3">
                <FontAwesomeIcon icon={faTrash} className="fs-5" />
              </div>
              <div>
                <h5
                  className="modal-title mb-0 fw-bold"
                  id="deletePaysModalLabel"
                >
                  Supprimer le Pays
                </h5>
                <p className="mb-0 opacity-75 fs-14">
                  Confirmation de suppression
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
            {/* Message d'erreur */}
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

            <div
              className="card border-0 shadow-sm mb-4"
              style={{ borderRadius: "12px" }}
            >
              <div
                className="card-header border-0 py-3"
                style={styles.warningSection}
              >
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle p-2 me-3"
                    style={{ backgroundColor: `${colors.oskar.red}15` }}
                  >
                    <FontAwesomeIcon
                      icon={faExclamationTriangle}
                      style={{ color: colors.oskar.red }}
                    />
                  </div>
                  <div>
                    <h6
                      className="mb-0 fw-bold"
                      style={{ color: colors.oskar.red }}
                    >
                      Attention ! Action irréversible
                    </h6>
                    <small className="text-muted">
                      Cette action ne peut pas être annulée
                    </small>
                  </div>
                </div>
              </div>
              <div className="card-body p-4">
                <div className="text-center mb-4">
                  <div
                    className="rounded-circle p-3 mx-auto mb-3"
                    style={{
                      backgroundColor: `${colors.oskar.orange}15`,
                      width: "80px",
                      height: "80px",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faTrash}
                      className="fs-2"
                      style={{ color: colors.oskar.orange }}
                    />
                  </div>
                  <h5 className="fw-bold text-danger">
                    Êtes-vous sûr de vouloir supprimer ce pays ?
                  </h5>
                  <p className="text-muted">
                    Cette action supprimera définitivement le pays de la base de
                    données.
                  </p>
                </div>

                {/* Informations du pays */}
                <div className="bg-light p-4 rounded mb-4">
                  <h6 className="fw-semibold mb-3">Pays à supprimer :</h6>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="d-flex align-items-center mb-2">
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
                          <small className="text-muted d-block">Nom</small>
                          <span className="fw-semibold">{pays.nom}</span>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="d-flex align-items-center mb-2">
                        <div
                          className="rounded-circle p-2 me-3"
                          style={{ backgroundColor: `${colors.oskar.green}15` }}
                        >
                          <FontAwesomeIcon
                            icon={faCode}
                            style={{ color: colors.oskar.green }}
                          />
                        </div>
                        <div>
                          <small className="text-muted d-block">Code</small>
                          <span className="fw-semibold">{pays.code}</span>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="d-flex align-items-center mb-2">
                        <div
                          className="rounded-circle p-2 me-3"
                          style={{
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
                            Indicatif
                          </small>
                          <span className="fw-semibold">{pays.indicatif}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Avertissement */}
                <div
                  className="alert alert-warning border-0"
                  style={{ borderRadius: "10px" }}
                >
                  <div className="d-flex align-items-start">
                    <FontAwesomeIcon
                      icon={faExclamationTriangle}
                      className="me-2 mt-1 text-warning"
                    />
                    <div>
                      <h6 className="alert-heading mb-1">Important</h6>
                      <p className="mb-0 small">
                        Cette suppression est définitive. Toutes les données
                        associées à ce pays seront perdues. Assurez-vous
                        qu'aucune donnée dépendante n'utilise ce pays avant de
                        continuer.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pied de la modal */}
          <div className="modal-footer border-top-0 py-4 px-4">
            <div className="d-flex justify-content-end w-100 gap-3">
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
                style={{
                  background: colors.oskar.red,
                  borderColor: colors.oskar.red,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.oskar.redHover;
                  e.currentTarget.style.borderColor = colors.oskar.redHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.oskar.red;
                  e.currentTarget.style.borderColor = colors.oskar.red;
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
                    Supprimer définitivement
                  </>
                )}
              </button>
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
  );
}
