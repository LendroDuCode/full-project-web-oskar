// app/(back-office)/dashboard-admin/statuts-matrimoniaux/components/modals/DeleteStatutMatrimonialModal.tsx
"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faTrash,
  faExclamationTriangle,
  faSpinner,
  faHeart,
  faTag,
  faCode,
  faCalendarAlt,
  faInfoCircle,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";
import type { StatutMatrimonialType } from "@/services/statuts-matrimoniaux/statuts-matrimoniaux.types";

// Types
interface DeleteStatutMatrimonialModalProps {
  isOpen: boolean;
  statut: StatutMatrimonialType | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function DeleteStatutMatrimonialModal({
  isOpen,
  statut,
  onClose,
  onSuccess,
}: DeleteStatutMatrimonialModalProps) {
  // États de chargement et erreurs
  const [loading, setLoading] = useState(false);
  const [loadingStatut, setLoadingStatut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // États pour les informations détaillées
  const [statutDetails, setStatutDetails] =
    useState<StatutMatrimonialType | null>(null);

  // Styles personnalisés
  const styles = {
    modalHeader: {
      background: `linear-gradient(135deg, ${colors.oskar.orange} 0%, ${colors.oskar.orangeHover} 100%)`,
      borderBottom: `3px solid ${colors.oskar.red}`,
    },
    warningSection: {
      background: `${colors.oskar.orange}15`,
      borderLeft: `4px solid ${colors.oskar.orange}`,
    },
    dangerButton: {
      background: colors.oskar.red,
      borderColor: colors.oskar.red,
    },
    dangerButtonHover: {
      background: colors.oskar.redHover,
      borderColor: colors.oskar.redHover,
    },
    secondaryButton: {
      background: "white",
      color: colors.oskar.grey,
      borderColor: colors.oskar.grey,
    },
    secondaryButtonHover: {
      background: colors.oskar.lightGrey,
      color: colors.oskar.black,
      borderColor: colors.oskar.grey,
    },
  };

  // Formater la date
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

  // Charger les détails du statut
  useEffect(() => {
    if (!isOpen || !statut) return;

    const loadDetails = async () => {
      try {
        setLoadingStatut(true);
        setError(null);
        setSuccessMessage(null);

        // Récupérer les détails complets du statut
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
          setStatutDetails(statutData);
        } else {
          setStatutDetails(statut);
        }
      } catch (err: any) {
        console.error("Erreur lors du chargement des détails:", err);
        setStatutDetails(statut);
      } finally {
        setLoadingStatut(false);
      }
    };

    loadDetails();
  }, [isOpen, statut]);

  // Réinitialiser les états quand la modal se ferme
  useEffect(() => {
    if (!isOpen) {
      setStatutDetails(null);
      setError(null);
      setSuccessMessage(null);
    }
  }, [isOpen]);

  // Suppression du statut
  const handleDelete = async () => {
    if (!statut || !statut.uuid) {
      setError("Aucun statut sélectionné pour la suppression");
      return;
    }

    if (statut.defaut) {
      setError("Impossible de supprimer le statut par défaut");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      // Appel à l'API pour la suppression
      await api.delete(API_ENDPOINTS.STATUTS_MATRIMONIAUX.DELETE(statut.uuid));

      setSuccessMessage("Statut matrimonial supprimé avec succès !");

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
      let errorMessage = "Erreur lors de la suppression du statut matrimonial";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      if (err.response?.status === 400) {
        errorMessage = "Impossible de supprimer le statut. Données invalides.";
      } else if (err.response?.status === 403) {
        errorMessage = "Vous n'êtes pas autorisé à supprimer ce statut.";
      } else if (err.response?.status === 404) {
        errorMessage = "Statut non trouvé. Il a peut-être déjà été supprimé.";
      } else if (err.response?.status === 409) {
        errorMessage =
          "Impossible de supprimer le statut. Il est utilisé dans d'autres données.";
      } else if (err.response?.status === 500) {
        errorMessage = "Erreur serveur. Veuillez réessayer plus tard.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fermer la modal
  const handleClose = () => {
    if (loading || loadingStatut) return;
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
      aria-labelledby="deleteStatutMatrimonialModalLabel"
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
                <FontAwesomeIcon icon={faTrash} className="fs-5" />
              </div>
              <div>
                <h5
                  className="modal-title mb-0 fw-bold"
                  id="deleteStatutMatrimonialModalLabel"
                >
                  Supprimer un Statut Matrimonial
                </h5>
                <p className="mb-0 opacity-75 fs-14">
                  Confirmation de suppression définitive
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

            {/* Section d'avertissement */}
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
                    style={{ backgroundColor: `${colors.oskar.orange}15` }}
                  >
                    <FontAwesomeIcon
                      icon={faExclamationTriangle}
                      style={{ color: colors.oskar.orange }}
                    />
                  </div>
                  <div>
                    <h6
                      className="mb-0 fw-bold"
                      style={{ color: colors.oskar.orange }}
                    >
                      Attention - Action Irréversible
                    </h6>
                    <small className="text-muted">
                      Cette action ne peut pas être annulée
                    </small>
                  </div>
                </div>
              </div>
              <div className="card-body p-4">
                <div className="row align-items-center">
                  <div className="col-md-2 text-center">
                    <div
                      className="rounded-circle p-3 mx-auto"
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
                  </div>
                  <div className="col-md-10">
                    <h6 className="fw-bold mb-2">
                      Vous êtes sur le point de supprimer définitivement ce
                      statut matrimonial.
                    </h6>
                    <p className="mb-0 text-muted">
                      Cette action supprimera toutes les données associées à ce
                      statut. Les utilisateurs utilisant ce statut pourraient
                      être affectés.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations du statut */}
            {loadingStatut ? (
              <div className="text-center py-3">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-2">Chargement des informations du statut...</p>
              </div>
            ) : (
              statutDetails && (
                <>
                  {/* Section des détails */}
                  <div
                    className="card border-0 shadow-sm mb-4"
                    style={{ borderRadius: "12px" }}
                  >
                    <div className="card-header border-0 py-3 bg-light">
                      <div className="d-flex align-items-center">
                        <div
                          className="rounded-circle p-2 me-3"
                          style={{ backgroundColor: `${colors.oskar.pink}15` }}
                        >
                          <FontAwesomeIcon
                            icon={faHeart}
                            style={{ color: colors.oskar.pink }}
                          />
                        </div>
                        <div>
                          <h6
                            className="mb-0 fw-bold"
                            style={{ color: colors.oskar.pink }}
                          >
                            Statut à Supprimer
                          </h6>
                          <small className="text-muted">
                            Détails du statut qui sera supprimé
                          </small>
                        </div>
                      </div>
                    </div>
                    <div className="card-body p-4">
                      <div className="row g-3">
                        {/* Libellé */}
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label fw-semibold text-muted mb-1">
                              <FontAwesomeIcon icon={faTag} className="me-2" />
                              Libellé
                            </label>
                            <div className="d-flex align-items-center">
                              <div
                                className="rounded-circle p-2 me-3"
                                style={{
                                  backgroundColor: `${colors.oskar.pink}10`,
                                }}
                              >
                                <FontAwesomeIcon
                                  icon={faHeart}
                                  className="text-primary"
                                />
                              </div>
                              <div>
                                <h5 className="mb-0 fw-bold">
                                  {statutDetails.libelle}
                                </h5>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label fw-semibold text-muted mb-1">
                              <FontAwesomeIcon icon={faCode} className="me-2" />
                              Slug
                            </label>
                            <div className="d-flex align-items-center">
                              <div
                                className="rounded-circle p-2 me-3"
                                style={{
                                  backgroundColor: `${colors.oskar.blue}10`,
                                }}
                              >
                                <FontAwesomeIcon
                                  icon={faCode}
                                  className="text-info"
                                />
                              </div>
                              <div>
                                <h5 className="mb-0 fw-bold">
                                  {statutDetails.slug}
                                </h5>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Statut */}
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label fw-semibold text-muted mb-1">
                              Statut actuel
                            </label>
                            <div className="d-flex align-items-center">
                              <span
                                className={`badge ${statutDetails.statut === "actif" ? "bg-success" : "bg-danger"} bg-opacity-10 text-${statutDetails.statut === "actif" ? "success" : "danger"} border border-${statutDetails.statut === "actif" ? "success" : "danger"} border-opacity-25 px-3 py-2`}
                              >
                                {statutDetails.statut === "actif"
                                  ? "Actif"
                                  : "Inactif"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Statut par défaut */}
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label fw-semibold text-muted mb-1">
                              <FontAwesomeIcon icon={faStar} className="me-2" />
                              Statut par défaut
                            </label>
                            <div className="d-flex align-items-center">
                              <span
                                className={`badge ${statutDetails.defaut ? "bg-warning" : "bg-light"} bg-opacity-10 text-${statutDetails.defaut ? "warning" : "muted"} border border-${statutDetails.defaut ? "warning" : "light"} border-opacity-25 px-3 py-2`}
                              >
                                {statutDetails.defaut ? "Oui" : "Non"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label fw-semibold text-muted mb-1">
                              <FontAwesomeIcon
                                icon={faCalendarAlt}
                                className="me-2"
                              />
                              Créé le
                            </label>
                            <div className="d-flex align-items-center">
                              <div
                                className="rounded-circle p-2 me-3"
                                style={{
                                  backgroundColor: `${colors.oskar.grey}10`,
                                }}
                              >
                                <FontAwesomeIcon
                                  icon={faCalendarAlt}
                                  className="text-secondary"
                                />
                              </div>
                              <div>
                                <span className="text-muted">
                                  {formatDate(statutDetails.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label fw-semibold text-muted mb-1">
                              <FontAwesomeIcon
                                icon={faCalendarAlt}
                                className="me-2"
                              />
                              Dernière modification
                            </label>
                            <div className="d-flex align-items-center">
                              <div
                                className="rounded-circle p-2 me-3"
                                style={{
                                  backgroundColor: `${colors.oskar.grey}10`,
                                }}
                              >
                                <FontAwesomeIcon
                                  icon={faCalendarAlt}
                                  className="text-secondary"
                                />
                              </div>
                              <div>
                                <span className="text-muted">
                                  {formatDate(statutDetails.updatedAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        {statutDetails.description && (
                          <div className="col-12">
                            <div className="mb-3">
                              <label className="form-label fw-semibold text-muted mb-1">
                                <FontAwesomeIcon
                                  icon={faInfoCircle}
                                  className="me-2"
                                />
                                Description
                              </label>
                              <div
                                className="p-3 rounded"
                                style={{
                                  backgroundColor: `${colors.oskar.lightGrey}`,
                                  borderLeft: `3px solid ${colors.oskar.blue}`,
                                }}
                              >
                                <p className="mb-0">
                                  {statutDetails.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section de confirmation */}
                  <div
                    className="card border-0 shadow-sm"
                    style={{ borderRadius: "12px" }}
                  >
                    <div className="card-body p-4">
                      <div
                        className="alert alert-warning border-0 mb-0"
                        style={{ borderRadius: "8px" }}
                      >
                        <div className="d-flex align-items-center">
                          <div className="flex-shrink-0">
                            <div
                              className="rounded-circle p-2"
                              style={{
                                backgroundColor: `${colors.oskar.orange}20`,
                              }}
                            >
                              <FontAwesomeIcon
                                icon={faExclamationTriangle}
                                className="text-warning"
                              />
                            </div>
                          </div>
                          <div className="flex-grow-1 ms-3">
                            <h6 className="alert-heading mb-1">
                              Confirmation requise
                            </h6>
                            <p className="mb-0">
                              Êtes-vous absolument certain de vouloir supprimer
                              le statut{" "}
                              <strong>"{statutDetails.libelle}"</strong> ? Tapez{" "}
                              <code className="text-danger">CONFIRMER</code>{" "}
                              dans le champ ci-dessous pour continuer.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Champ de confirmation */}
                      <div className="mt-4">
                        <label
                          htmlFor="confirmation"
                          className="form-label fw-semibold"
                        >
                          Confirmation de suppression
                        </label>
                        <input
                          type="text"
                          id="confirmation"
                          className="form-control"
                          placeholder="Tapez 'CONFIRMER' pour supprimer"
                          onChange={(e) => {
                            // La validation se fait côté serveur, mais on peut ajouter un indicateur visuel
                          }}
                          disabled={loading || statutDetails.defaut}
                          style={{
                            border: "2px solid #dee2e6",
                            borderRadius: "8px",
                            padding: "12px",
                          }}
                        />
                        <small className="text-muted">
                          Cette mesure de sécurité empêche les suppressions
                          accidentelles.
                        </small>
                      </div>
                    </div>
                  </div>
                </>
              )
            )}
          </div>

          {/* Pied de la modal */}
          <div className="modal-footer border-top-0 py-4 px-4">
            <div className="d-flex justify-content-between w-100">
              <button
                type="button"
                className="btn d-flex align-items-center gap-2"
                onClick={handleClose}
                disabled={loading || loadingStatut}
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
                <FontAwesomeIcon icon={faTimes} />
                Annuler
              </button>

              <button
                type="button"
                className="btn text-white d-flex align-items-center gap-2"
                onClick={handleDelete}
                disabled={
                  loading || loadingStatut || statutDetails?.defaut || false
                }
                style={styles.dangerButton}
                onMouseEnter={(e) => {
                  Object.assign(
                    e.currentTarget.style,
                    styles.dangerButtonHover,
                  );
                }}
                onMouseLeave={(e) => {
                  Object.assign(e.currentTarget.style, styles.dangerButton);
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
                    Supprimer Définitivement
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
          padding: 10px 20px;
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

        code {
          background-color: ${colors.oskar.red}15;
          color: ${colors.oskar.red};
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}
