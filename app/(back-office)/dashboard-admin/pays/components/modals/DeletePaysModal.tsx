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
  faCalendar,
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";

// Type local pour le pays
interface Pays {
  uuid: string;
  nom: string;
  code: string;
  indicatif: string;
  statut: string;
  created_at?: string;
  updated_at?: string;
  description?: string;
  continent?: string;
  capitale?: string;
  langue_officielle?: string;
  population?: number;
  superficie?: number;
  devise?: string;
  domaine_internet?: string;
}

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
  const [confirmationText, setConfirmationText] = useState("");

  const styles = {
    modalHeader: {
      background: `linear-gradient(135deg, ${colors.oskar.red} 0%, ${colors.oskar.redHover} 100%)`,
      borderBottom: `3px solid ${colors.oskar.red}`,
    },
    warningSection: {
      background: colors.oskar.lightGrey,
      borderLeft: `4px solid ${colors.oskar.red}`,
    },
    dangerButton: {
      background: colors.oskar.red,
      borderColor: colors.oskar.red,
    },
    dangerButtonHover: {
      background: colors.oskar.redHover,
      borderColor: colors.oskar.redHover,
    },
  };

  // Vérifier si le texte de confirmation est correct
  const isConfirmationValid = () => {
    return confirmationText.toLowerCase() === "supprimer";
  };

  const handleSubmit = async () => {
    if (!pays || !pays.uuid) {
      setError("Pays non spécifié");
      return;
    }

    if (!isConfirmationValid()) {
      setError("Veuillez taper 'supprimer' pour confirmer la suppression");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(`🗑️ Tentative de suppression du pays: ${pays.nom} (${pays.uuid})`);

      // Appel à l'API pour supprimer le pays
      const response = await api.delete(API_ENDPOINTS.PAYS.DELETE(pays.uuid));

      console.log("✅ Pays supprimé avec succès:", response.data);

      // Réinitialiser le formulaire
      setConfirmationText("");

      if (onSuccess) {
        onSuccess();
      }

      // Fermer la modal après un court délai pour montrer le succès
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err: any) {
      console.error("❌ Erreur lors de la suppression du pays:", err);

      let errorMessage = "Erreur lors de la suppression du pays";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      if (err.response?.status === 400) {
        errorMessage = "Requête invalide. Veuillez vérifier les données.";
      } else if (err.response?.status === 403) {
        errorMessage = "Vous n'avez pas la permission de supprimer ce pays.";
      } else if (err.response?.status === 404) {
        errorMessage = "Pays non trouvé.";
      } else if (err.response?.status === 409) {
        errorMessage = "Impossible de supprimer ce pays car il est utilisé par d'autres données.";
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
    
    // Demander confirmation si l'utilisateur a commencé à taper
    if (confirmationText.trim() !== "") {
      if (!confirm("Voulez-vous vraiment annuler ? Les modifications seront perdues.")) {
        return;
      }
    }
    
    setConfirmationText("");
    setError(null);
    onClose();
  };

  // Fonction pour formater la date
  const formatDate = (dateString?: string) => {
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
        <FontAwesomeIcon icon={faTimesCircle} className="fs-12" />
        <span>Inactif</span>
      </span>
    );
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
                  Action irréversible - Confirmation requise
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
                      style={{ backgroundColor: `${colors.oskar.red}20` }}
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
                      ⚠️ ATTENTION : Action définitive
                    </h6>
                    <small className="text-muted">
                      Cette opération ne peut pas être annulée ou restaurée
                    </small>
                  </div>
                </div>
              </div>
              <div className="card-body p-4">
                <div className="text-center mb-4">
                  <div
                    className="rounded-circle p-3 mx-auto mb-3 d-flex align-items-center justify-content-center"
                    style={{
                      backgroundColor: `${colors.oskar.red}15`,
                      width: "80px",
                      height: "80px",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faTrash}
                      className="fs-2"
                      style={{ color: colors.oskar.red }}
                    />
                  </div>
                  <h5 className="fw-bold text-danger mb-3">
                    Confirmer la suppression
                  </h5>
                  <p className="text-muted mb-0">
                    Vous êtes sur le point de supprimer définitivement ce pays.
                  </p>
                </div>

                {/* Informations détaillées du pays */}
                <div className="bg-light p-4 rounded mb-4">
                  <h6 className="fw-semibold mb-3">
                    <FontAwesomeIcon icon={faGlobe} className="me-2" />
                    Informations du pays à supprimer :
                  </h6>
                  
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="d-flex align-items-center mb-3">
                        <div
                          className="rounded-circle p-2 me-3 flex-shrink-0"
                          style={{ backgroundColor: `${colors.oskar.blue}15` }}
                        >
                          <FontAwesomeIcon
                            icon={faGlobe}
                            style={{ color: colors.oskar.blue }}
                          />
                        </div>
                        <div className="flex-grow-1">
                          <small className="text-muted d-block">Nom du pays</small>
                          <span className="fw-semibold fs-5">{pays.nom}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-3">
                      <div className="d-flex align-items-center mb-3">
                        <div
                          className="rounded-circle p-2 me-3 flex-shrink-0"
                          style={{ backgroundColor: `${colors.oskar.green}15` }}
                        >
                          <FontAwesomeIcon
                            icon={faCode}
                            style={{ color: colors.oskar.green }}
                          />
                        </div>
                        <div>
                          <small className="text-muted d-block">Code ISO</small>
                          <span className="fw-semibold">{pays.code}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-3">
                      <div className="d-flex align-items-center mb-3">
                        <div
                          className="rounded-circle p-2 me-3 flex-shrink-0"
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
                            Indicatif téléphonique
                          </small>
                          <span className="fw-semibold">+{pays.indicatif}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="mb-2">
                        <small className="text-muted d-block">Statut</small>
                        {getStatusBadge(pays.statut)}
                      </div>
                    </div>
                    
                    <div className="col-md-4">
                      <div className="mb-2">
                        <small className="text-muted d-block">
                          <FontAwesomeIcon icon={faCalendar} className="me-1" />
                          Créé le
                        </small>
                        <span className="fw-semibold">{formatDate(pays.created_at)}</span>
                      </div>
                    </div>
                    
                    <div className="col-md-4">
                      <div className="mb-2">
                        <small className="text-muted d-block">
                          <FontAwesomeIcon icon={faCalendar} className="me-1" />
                          Modifié le
                        </small>
                        <span className="fw-semibold">{formatDate(pays.updated_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Informations supplémentaires */}
                  {(pays.capitale || pays.devise || pays.population) && (
                    <div className="mt-3 pt-3 border-top">
                      <h6 className="fw-semibold mb-2">Informations supplémentaires :</h6>
                      <div className="row g-2">
                        {pays.capitale && (
                          <div className="col-md-4">
                            <small className="text-muted d-block">Capitale</small>
                            <span className="fw-semibold">{pays.capitale}</span>
                          </div>
                        )}
                        {pays.devise && (
                          <div className="col-md-4">
                            <small className="text-muted d-block">Devise</small>
                            <span className="fw-semibold">{pays.devise}</span>
                          </div>
                        )}
                        {pays.population && (
                          <div className="col-md-4">
                            <small className="text-muted d-block">Population</small>
                            <span className="fw-semibold">
                              {pays.population.toLocaleString('fr-FR')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Section de confirmation */}
                <div className="mb-4">
                  <div className="alert alert-danger border-0 mb-3" style={{ borderRadius: "10px" }}>
                    <div className="d-flex align-items-start">
                      <FontAwesomeIcon
                        icon={faExclamationTriangle}
                        className="me-2 mt-1 text-danger"
                      />
                      <div>
                        <h6 className="alert-heading mb-1 text-danger">Conséquences de cette action :</h6>
                        <ul className="mb-0 small ps-3">
                          <li>Toutes les données associées à ce pays seront définitivement supprimées</li>
                          <li>Les villes, régions ou autres entités géographiques liées seront affectées</li>
                          <li>Les utilisateurs ou entreprises référençant ce pays devront être mis à jour</li>
                          <li>Aucune récupération des données ne sera possible</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Zone de confirmation texte */}
                  <div className="mb-3">
                    <label htmlFor="confirmationText" className="form-label fw-semibold">
                      Pour confirmer, veuillez taper <code className="text-danger">"supprimer"</code> :
                    </label>
                    <input
                      type="text"
                      id="confirmationText"
                      className={`form-control ${confirmationText && !isConfirmationValid() ? "is-invalid" : ""}`}
                      placeholder='Tapez "supprimer" pour confirmer'
                      value={confirmationText}
                      onChange={(e) => {
                        setConfirmationText(e.target.value);
                        if (error && error.includes("Veuillez taper")) {
                          setError(null);
                        }
                      }}
                      disabled={loading}
                      style={{ 
                        borderColor: confirmationText && !isConfirmationValid() ? colors.oskar.red : undefined,
                        borderRadius: "8px"
                      }}
                    />
                    {confirmationText && !isConfirmationValid() && (
                      <div className="invalid-feedback d-block">
                        Le texte ne correspond pas à "supprimer"
                      </div>
                    )}
                    {isConfirmationValid() && (
                      <div className="valid-feedback d-block text-success">
                        <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                        Confirmation valide
                      </div>
                    )}
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
                disabled={loading || !isConfirmationValid()}
                style={styles.dangerButton}
                onMouseEnter={(e) => {
                  if (!loading && isConfirmationValid()) {
                    Object.assign(e.currentTarget.style, styles.dangerButtonHover);
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && isConfirmationValid()) {
                    Object.assign(e.currentTarget.style, styles.dangerButton);
                  }
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
          min-width: 120px;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .fs-14 {
          font-size: 14px !important;
        }

        .fs-12 {
          font-size: 12px !important;
        }

        .fs-5 {
          font-size: 1.25rem !important;
        }

        .shadow-sm {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
        }

        .shadow-lg {
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
        }

        .flex-shrink-0 {
          flex-shrink: 0;
        }

        .flex-grow-1 {
          flex-grow: 1;
        }

        .badge {
          border-radius: 20px !important;
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .form-control {
          border-radius: 8px !important;
          transition: all 0.3s ease;
        }

        .form-control:focus {
          border-color: ${colors.oskar.blue};
          box-shadow: 0 0 0 0.25rem ${colors.oskar.blue}25;
        }

        .form-control.is-invalid {
          border-color: ${colors.oskar.red};
          box-shadow: 0 0 0 0.25rem ${colors.oskar.red}25;
        }

        .invalid-feedback {
          color: ${colors.oskar.red};
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        .valid-feedback {
          color: ${colors.oskar.green};
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        code {
          background-color: ${colors.oskar.lightGrey};
          padding: 0.1rem 0.3rem;
          border-radius: 4px;
          font-family: "Courier New", Courier, monospace;
        }
      `}</style>
    </div>
  );
}