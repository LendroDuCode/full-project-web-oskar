// app/(back-office)/dashboard-admin/civilites/components/modals/ViewCiviliteModal.tsx
"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faIdCard,
  faLanguage,
  faToggleOn,
  faToggleOff,
  faCalendar,
  faUser,
  faCode,
  faDatabase,
  faInfoCircle,
  faCopy,
} from "@fortawesome/free-solid-svg-icons";
import { Civilite } from "../../../utilisateurs/types/user.types";

interface ViewCiviliteModalProps {
  isOpen: boolean;
  civilite: Civilite | null;
  onClose: () => void;
}

export default function ViewCiviliteModal({
  isOpen,
  civilite,
  onClose,
}: ViewCiviliteModalProps) {
  if (!isOpen || !civilite) return null;

  // Fonction pour formater la date
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "Non disponible";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Date invalide";
      return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(date);
    } catch {
      return "Non disponible";
    }
  };

  // Fonction pour copier le texte dans le presse-papier
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Vous pouvez ajouter une notification de succès ici si besoin
    alert("Copié dans le presse-papier !");
  };

  return (
    <div
      className="modal fade show d-block"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(2px)",
      }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg">
          {/* En-tête du modal */}
          <div className="modal-header border-0 bg-primary text-white rounded-top-3">
            <div className="d-flex align-items-center w-100">
              <div className="flex-shrink-0">
                <div
                  className="bg-white bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: "50px", height: "50px" }}
                >
                  <FontAwesomeIcon icon={faIdCard} size="lg" />
                </div>
              </div>
              <div className="flex-grow-1 ms-3">
                <h5 className="modal-title fw-bold mb-0">
                  Détails de la civilité
                </h5>
                <p className="mb-0 opacity-75">
                  Informations complètes de {civilite.libelle}
                </p>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
                aria-label="Fermer"
              ></button>
            </div>
          </div>

          {/* Corps du modal */}
          <div className="modal-body p-4">
            <div className="row">
              {/* Section principale */}
              <div className="col-lg-8">
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-header bg-light bg-opacity-25 border-0">
                    <h6 className="mb-0 fw-semibold">
                      <FontAwesomeIcon icon={faUser} className="me-2" />
                      Informations principales
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      {/* Libellé */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-muted small mb-1">
                          <FontAwesomeIcon icon={faIdCard} className="me-1" />
                          Libellé
                        </label>
                        <div className="d-flex align-items-center">
                          <input
                            type="text"
                            className="form-control bg-light"
                            value={civilite.libelle}
                            readOnly
                          />
                          <button
                            className="btn btn-outline-secondary ms-2"
                            onClick={() => copyToClipboard(civilite.libelle)}
                            title="Copier le libellé"
                          >
                            <FontAwesomeIcon icon={faCopy} />
                          </button>
                        </div>
                      </div>

                      {/* Slug */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-muted small mb-1">
                          <FontAwesomeIcon icon={faLanguage} className="me-1" />
                          Slug
                        </label>
                        <div className="d-flex align-items-center">
                          <div className="input-group">
                            <span className="input-group-text bg-light">
                              <FontAwesomeIcon icon={faCode} />
                            </span>
                            <input
                              type="text"
                              className="form-control bg-light"
                              value={civilite.slug}
                              readOnly
                            />
                          </div>
                          <button
                            className="btn btn-outline-secondary ms-2"
                            onClick={() => copyToClipboard(civilite.slug)}
                            title="Copier le slug"
                          >
                            <FontAwesomeIcon icon={faCopy} />
                          </button>
                        </div>
                      </div>

                      {/* Statut */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-muted small mb-1">
                          Statut
                        </label>
                        <div className="d-flex align-items-center">
                          <div
                            className={`badge ${civilite.statut === "actif" ? "bg-success bg-opacity-10 text-success border-success border-opacity-25" : "bg-warning bg-opacity-10 text-warning border-warning border-opacity-25"} border d-inline-flex align-items-center gap-2 p-3`}
                          >
                            <FontAwesomeIcon
                              icon={
                                civilite.statut === "actif"
                                  ? faToggleOn
                                  : faToggleOff
                              }
                            />
                            <span className="text-capitalize fw-semibold">
                              {civilite.statut}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* ID */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-muted small mb-1">
                          <FontAwesomeIcon icon={faDatabase} className="me-1" />
                          ID
                        </label>
                        <div className="d-flex align-items-center">
                          <input
                            type="text"
                            className="form-control bg-light"
                            value={civilite.id.toString()}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section métadonnées */}
              <div className="col-lg-4">
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-header bg-light bg-opacity-25 border-0">
                    <h6 className="mb-0 fw-semibold">
                      <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                      Métadonnées
                    </h6>
                  </div>
                  <div className="card-body">
                    {/* UUID */}
                    <div className="mb-3">
                      <label className="form-label text-muted small mb-1">
                        UUID
                      </label>
                      <div className="d-flex align-items-center">
                        <input
                          type="text"
                          className="form-control bg-light text-truncate"
                          value={civilite.uuid}
                          readOnly
                        />
                        <button
                          className="btn btn-outline-secondary ms-2"
                          onClick={() => copyToClipboard(civilite.uuid)}
                          title="Copier l'UUID"
                        >
                          <FontAwesomeIcon icon={faCopy} />
                        </button>
                      </div>
                    </div>

                    {/* Admin UUID */}
                    <div className="mb-3">
                      <label className="form-label text-muted small mb-1">
                        Admin UUID
                      </label>
                      <input
                        type="text"
                        className="form-control bg-light text-truncate"
                        value={civilite.adminUuid || "Non attribué"}
                        readOnly
                      />
                    </div>

                    {/* Supprimé ? */}
                    {civilite.is_deleted && (
                      <div className="mb-3">
                        <div className="alert alert-danger mb-0" role="alert">
                          <FontAwesomeIcon icon={faTimes} className="me-2" />
                          Cette civilité a été supprimée
                          {civilite.deleted_at && (
                            <div className="small mt-1">
                              Supprimée le :{" "}
                              {formatDateTime(civilite.deleted_at)}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section des dates */}
            <div className="row">
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-light bg-opacity-25 border-0">
                    <h6 className="mb-0 fw-semibold">
                      <FontAwesomeIcon icon={faCalendar} className="me-2" />
                      Historique
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      {/* Date de création */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-muted small mb-1">
                          Date de création
                        </label>
                        <div className="d-flex align-items-center">
                          <FontAwesomeIcon
                            icon={faCalendar}
                            className="text-muted me-2"
                          />
                        </div>
                        {civilite.created_at && (
                          <small className="text-muted">
                            Il y a{" "}
                            {Math.floor(
                              (new Date().getTime() -
                                new Date(civilite.created_at).getTime()) /
                                (1000 * 60 * 60 * 24),
                            )}{" "}
                            jours
                          </small>
                        )}
                      </div>

                      {/* Date de modification */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-muted small mb-1">
                          Dernière modification
                        </label>
                        <div className="d-flex align-items-center">
                          <FontAwesomeIcon
                            icon={faCalendar}
                            className="text-muted me-2"
                          />
                          <span className="fw-semibold">
                            {civilite.updated_at
                              ? formatDateTime(civilite.updated_at)
                              : "Jamais modifié"}
                          </span>
                        </div>
                        {civilite.updated_at && (
                          <small className="text-muted">
                            Il y a{" "}
                            {Math.floor(
                              (new Date().getTime() -
                                new Date(civilite.updated_at).getTime()) /
                                (1000 * 60 * 60 * 24),
                            )}{" "}
                            jours
                          </small>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pied du modal */}
          <div className="modal-footer border-0">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onClose}
            >
              <FontAwesomeIcon icon={faTimes} className="me-2" />
              Fermer
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                // Vous pouvez ajouter ici la navigation vers l'édition
                // ou une autre action
                onClose();
              }}
            >
              <FontAwesomeIcon icon={faIdCard} className="me-2" />
              Modifier cette civilité
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
