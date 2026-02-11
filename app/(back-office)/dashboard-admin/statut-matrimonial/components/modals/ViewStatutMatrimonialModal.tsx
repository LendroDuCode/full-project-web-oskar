// app/(back-office)/dashboard-admin/statuts-matrimoniaux/components/modals/ViewStatutMatrimonialModal.tsx
"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faHeart,
  faCode,
  faLanguage,
  faToggleOn,
  faToggleOff,
  faCalendar,
  faInfoCircle,
  faCrown,
  faCopy,
  faDatabase,
  faTag,
  faSortNumericDown,
  faEdit,
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import colors from "@/app/shared/constants/colors";

// Types
interface StatutMatrimonialType {
  uuid: string;
  libelle: string;
  code: string;
  slug: string;
  statut: "actif" | "inactif";
  createdAt?: string;
  updatedAt?: string;
  description?: string;
  is_default?: boolean;
  ordre?: number;
}

interface ViewStatutMatrimonialModalProps {
  isOpen: boolean;
  statut: StatutMatrimonialType | null;
  onClose: () => void;
  onEdit?: () => void;
}

export default function ViewStatutMatrimonialModal({
  isOpen,
  statut,
  onClose,
  onEdit,
}: ViewStatutMatrimonialModalProps) {
  if (!isOpen || !statut) return null;

  // Fonction pour formater la date
  const formatDateTime = (dateString: string | null | undefined) => {
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
      }).format(date);
    } catch {
      return "Non disponible";
    }
  };

  // Fonction pour formater la date courte
  const formatDateShort = (dateString: string | null | undefined) => {
    if (!dateString) return "Non disponible";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Date invalide";
      return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date);
    } catch {
      return "Non disponible";
    }
  };

  // Fonction pour copier dans le presse-papier
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Vous pourriez ajouter une notification toast ici
    alert("Copié dans le presse-papier !");
  };

  // Calculer l'âge de la création
  const getAge = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";

      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

      if (diffInDays === 0) return "Aujourd'hui";
      if (diffInDays === 1) return "Hier";
      if (diffInDays < 30) return `Il y a ${diffInDays} jours`;
      if (diffInDays < 365) return `Il y a ${Math.floor(diffInDays / 30)} mois`;
      return `Il y a ${Math.floor(diffInDays / 365)} ans`;
    } catch {
      return "N/A";
    }
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
          <div className="modal-header border-0 bg-info text-white rounded-top-3">
            <div className="d-flex align-items-center w-100">
              <div className="flex-shrink-0">
                <div
                  className="bg-white bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: "60px", height: "60px" }}
                >
                  <FontAwesomeIcon icon={faHeart} size="lg" />
                </div>
              </div>
              <div className="flex-grow-1 ms-3">
                <h5 className="modal-title fw-bold mb-0">
                  Détails du Statut Matrimonial
                </h5>
                <p className="mb-0 opacity-75">
                  Informations complètes de {statut.libelle}
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
                      <FontAwesomeIcon
                        icon={faHeart}
                        className="me-2 text-info"
                      />
                      Informations principales
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      {/* Libellé */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-muted small mb-1">
                          <FontAwesomeIcon icon={faTag} className="me-1" />
                          Libellé
                        </label>
                        <div className="d-flex align-items-center">
                          <input
                            type="text"
                            className="form-control bg-light"
                            value={statut.libelle}
                            readOnly
                          />
                          <button
                            className="btn btn-outline-secondary ms-2"
                            onClick={() => copyToClipboard(statut.libelle)}
                            title="Copier le libellé"
                          >
                            <FontAwesomeIcon icon={faCopy} />
                          </button>
                        </div>
                      </div>

                      {/* Code */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-muted small mb-1">
                          <FontAwesomeIcon icon={faCode} className="me-1" />
                          Code
                        </label>
                        <div className="d-flex align-items-center">
                          <div className="input-group">
                            <span className="input-group-text bg-light">
                              <FontAwesomeIcon icon={faCode} />
                            </span>
                            <input
                              type="text"
                              className="form-control bg-light"
                              value={statut.code}
                              readOnly
                            />
                          </div>
                          <button
                            className="btn btn-outline-secondary ms-2"
                            onClick={() => copyToClipboard(statut.code)}
                            title="Copier le code"
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
                              <FontAwesomeIcon icon={faLanguage} />
                            </span>
                            <input
                              type="text"
                              className="form-control bg-light"
                              value={statut.slug}
                              readOnly
                            />
                          </div>
                          <button
                            className="btn btn-outline-secondary ms-2"
                            onClick={() => copyToClipboard(statut.slug)}
                            title="Copier le slug"
                          >
                            <FontAwesomeIcon icon={faCopy} />
                          </button>
                        </div>
                      </div>

                      {/* Ordre */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-muted small mb-1">
                          <FontAwesomeIcon
                            icon={faSortNumericDown}
                            className="me-1"
                          />
                          Ordre d'affichage
                        </label>
                        <input
                          type="text"
                          className="form-control bg-light"
                          value={statut.ordre || 0}
                          readOnly
                        />
                      </div>

                      {/* Statut */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-muted small mb-1">
                          Statut
                        </label>
                        <div className="d-flex align-items-center">
                          <div
                            className={`badge ${statut.statut === "actif" ? "bg-success bg-opacity-10 text-success border-success border-opacity-25" : "bg-danger bg-opacity-10 text-danger border-danger border-opacity-25"} border d-inline-flex align-items-center gap-2 p-3`}
                          >
                            <FontAwesomeIcon
                              icon={
                                statut.statut === "actif"
                                  ? faCheckCircle
                                  : faTimesCircle
                              }
                            />
                            <span className="text-capitalize fw-semibold">
                              {statut.statut}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Statut par défaut */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-muted small mb-1">
                          <FontAwesomeIcon icon={faCrown} className="me-1" />
                          Statut par défaut
                        </label>
                        <div className="d-flex align-items-center">
                          {statut.is_default ? (
                            <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 d-inline-flex align-items-center gap-2 p-2">
                              <FontAwesomeIcon icon={faCrown} />
                              <span>Oui - Valeur par défaut</span>
                            </span>
                          ) : (
                            <span className="text-muted">Non</span>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      {statut.description && (
                        <div className="col-12 mb-3">
                          <label className="form-label text-muted small mb-1">
                            <FontAwesomeIcon
                              icon={faInfoCircle}
                              className="me-1"
                            />
                            Description
                          </label>
                          <div className="p-3 bg-light rounded border">
                            <p className="mb-0">{statut.description}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section métadonnées */}
              <div className="col-lg-4">
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-header bg-light bg-opacity-25 border-0">
                    <h6 className="mb-0 fw-semibold">
                      <FontAwesomeIcon icon={faDatabase} className="me-2" />
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
                          value={statut.uuid}
                          readOnly
                        />
                        <button
                          className="btn btn-outline-secondary ms-2"
                          onClick={() => copyToClipboard(statut.uuid)}
                          title="Copier l'UUID"
                        >
                          <FontAwesomeIcon icon={faCopy} />
                        </button>
                      </div>
                    </div>

                    {/* Statut actif/inactif */}
                    <div className="mb-3">
                      <label className="form-label text-muted small mb-1">
                        État du système
                      </label>
                      <div className="d-flex align-items-center">
                        <div
                          className={`badge ${statut.statut === "actif" ? "bg-success" : "bg-danger"} d-inline-flex align-items-center gap-2 p-2`}
                        >
                          <FontAwesomeIcon
                            icon={
                              statut.statut === "actif"
                                ? faToggleOn
                                : faToggleOff
                            }
                          />
                          <span className="text-capitalize">
                            {statut.statut === "actif" ? "Activé" : "Désactivé"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Informations système */}
                    <div className="mt-4">
                      <h6 className="fw-semibold mb-3">Informations système</h6>
                      <div className="list-group list-group-flush">
                        <div className="list-group-item border-0 px-0 py-2 d-flex justify-content-between">
                          <span className="text-muted">Statut actif:</span>
                          <span
                            className={`fw-semibold ${statut.statut === "actif" ? "text-success" : "text-danger"}`}
                          >
                            {statut.statut === "actif" ? "Oui" : "Non"}
                          </span>
                        </div>
                        <div className="list-group-item border-0 px-0 py-2 d-flex justify-content-between">
                          <span className="text-muted">Par défaut:</span>
                          <span
                            className={`fw-semibold ${statut.is_default ? "text-warning" : "text-muted"}`}
                          >
                            {statut.is_default ? "Oui" : "Non"}
                          </span>
                        </div>
                        <div className="list-group-item border-0 px-0 py-2 d-flex justify-content-between">
                          <span className="text-muted">Ordre:</span>
                          <span className="fw-semibold">
                            {statut.ordre || 0}
                          </span>
                        </div>
                      </div>
                    </div>
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
                          <div>
                            <div className="fw-semibold">
                              {formatDateTime(statut.createdAt)}
                            </div>
                            <small className="text-muted">
                              {getAge(statut.createdAt)}
                            </small>
                          </div>
                        </div>
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
                          <div>
                            <div className="fw-semibold">
                              {statut.updatedAt
                                ? formatDateTime(statut.updatedAt)
                                : "Jamais modifié"}
                            </div>
                            {statut.updatedAt && (
                              <small className="text-muted">
                                {getAge(statut.updatedAt)}
                              </small>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Résumé temporel */}
                    <div className="mt-3 p-3 bg-light rounded">
                      <div className="row">
                        <div className="col-md-6">
                          <small className="text-muted d-block">Créé:</small>
                          <span className="fw-semibold">
                            {formatDateShort(statut.createdAt)}
                          </span>
                        </div>
                        <div className="col-md-6">
                          <small className="text-muted d-block">
                            Dernière mise à jour:
                          </small>
                          <span className="fw-semibold">
                            {statut.updatedAt
                              ? formatDateShort(statut.updatedAt)
                              : "Jamais"}
                          </span>
                        </div>
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
            {onEdit && (
              <button
                type="button"
                className="btn btn-warning"
                onClick={() => {
                  onEdit();
                  onClose();
                }}
              >
                <FontAwesomeIcon icon={faEdit} className="me-2" />
                Modifier ce statut
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Styles inline */}
      <style jsx>{`
        .modal-content {
          border-radius: 16px !important;
        }
        .card {
          border-radius: 12px !important;
        }
        .badge {
          border-radius: 8px !important;
        }
        .list-group-item {
          background: transparent;
        }
      `}</style>
    </div>
  );
}
