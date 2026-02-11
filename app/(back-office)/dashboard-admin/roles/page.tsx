// app/(back-office)/dashboard-admin/roles/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faEye,
  faBan,
  faCheckCircle,
  faRefresh,
  faSearch,
  faFilter,
  faSort,
  faSortUp,
  faSortDown,
  faUser,
  faTimes,
  faUserShield,
  faUserTie,
  faUsers,
  faStore,
  faCalendar,
  faTrash,
  faCopy,
  faShield,
  faShieldAlt,
  faToggleOn,
  faToggleOff,
  faExclamationTriangle,
  faKey,
  faTags,
  faCircle,
  faSync,
  faDatabase,
  faUserCheck,
  faUserSlash,
  faInfoCircle,
  faCheckSquare,
  faSquare,
  faLayerGroup,
  faCheckDouble,
  faArchive,
  faUnlink,
  faListCheck,
  faIdCard,
  faCode,
  faClock,
  faCalendarAlt,
  faHistory,
  faCog,
  faList,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";
import CreateRoleModal from "./components/modals/CreateRoleModal";
import EditRoleModal from "./components/modals/EditRoleModal";
import { useRouter } from "next/navigation";

// Interface Role
interface Role {
  uuid: string;
  id: number;
  name: string;
  feature: string;
  status: string;
  is_deleted: boolean;
  deleted_at?: string | null;
  created_at: string;
  updatedAt: string;
}

// Interface pour l'état de sélection
interface SelectionState {
  allSelected: boolean;
  selectedIds: Set<string>;
}

// Composant de badge de statut
const StatusBadge = ({
  status,
  is_deleted,
}: {
  status: string;
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

  switch (status) {
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
    default:
      return (
        <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 d-inline-flex align-items-center gap-1 px-2 py-1">
          <FontAwesomeIcon icon={faCircle} className="fs-12" />
          <span className="fw-semibold">{status || "Inconnu"}</span>
        </span>
      );
  }
};

// Composant de badge de type de rôle
const RoleTypeBadge = ({ name }: { name: string }) => {
  const getRoleConfig = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case "admin":
        return {
          icon: faShieldAlt,
          color: "primary",
          bgColor: colors.oskar.blue,
          textColor: colors.oskar.blue,
        };
      case "agent":
        return {
          icon: faUserTie,
          color: "info",
          bgColor: colors.oskar.blue,
          textColor: colors.oskar.blue,
        };
      case "vendeur":
        return {
          icon: faStore,
          color: "success",
          bgColor: colors.oskar.green,
          textColor: colors.oskar.green,
        };
      case "utilisateur":
        return {
          icon: faUser,
          color: "secondary",
          bgColor: colors.oskar.grey,
          textColor: colors.oskar.grey,
        };
      case "client":
        return {
          icon: faUsers,
          color: "warning",
          bgColor: colors.oskar.orange,
          textColor: colors.oskar.orange,
        };
      default:
        return {
          icon: faShield,
          color: "light",
          bgColor: colors.oskar.lightGrey,
          textColor: colors.oskar.black,
        };
    }
  };

  const config = getRoleConfig(name);

  return (
    <span
      className="badge d-inline-flex align-items-center gap-1 px-2 py-1"
      style={{
        backgroundColor: `${config.bgColor}15`,
        color: config.textColor,
        border: `1px solid ${config.bgColor}30`,
        borderRadius: "20px",
      }}
    >
      <FontAwesomeIcon icon={config.icon} className="fs-12" />
      <span className="fw-semibold">{name}</span>
    </span>
  );
};

// Composant de modal pour voir les détails d'un rôle
const ViewRoleModal = ({
  show,
  role,
  onClose,
}: {
  show: boolean;
  role: Role | null;
  onClose: () => void;
}) => {
  if (!show || !role) return null;

  const handleCopyUUID = () => {
    navigator.clipboard.writeText(role.uuid);
    alert("UUID copié dans le presse-papier !");
  };

  const handleCopyID = () => {
    navigator.clipboard.writeText(role.id.toString());
    alert("ID copié dans le presse-papier !");
  };

  return (
    <div
      className="modal fade show d-block"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(3px)",
      }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg">
          {/* En-tête de la modal */}
          <div
            className="modal-header border-0 text-white rounded-top-3"
            style={{
              background: `linear-gradient(135deg, ${colors.oskar.blue} 0%, ${colors.oskar.blueHover} 100%)`,
            }}
          >
            <div className="d-flex align-items-center w-100">
              <div className="bg-white bg-opacity-20 rounded-circle p-2 me-3">
                <FontAwesomeIcon icon={faEye} className="fs-5" />
              </div>
              <div className="flex-grow-1">
                <h5 className="modal-title mb-0 fw-bold">Détails du Rôle</h5>
                <p className="mb-0 opacity-75 fs-14">
                  Informations détaillées du rôle
                </p>
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
          <div className="modal-body p-4">
            <div className="row">
              {/* Colonne gauche : Informations principales */}
              <div className="col-md-8">
                {/* Carte d'information générale */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-header bg-light border-0 py-3">
                    <div className="d-flex align-items-center">
                      <FontAwesomeIcon
                        icon={faInfoCircle}
                        className="me-2 text-primary"
                      />
                      <h6 className="mb-0 fw-bold">Informations Générales</h6>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label text-muted small mb-1">
                            <FontAwesomeIcon icon={faIdCard} className="me-1" />
                            Nom du Rôle
                          </label>
                          <div className="d-flex align-items-center gap-2">
                            <span className="fw-bold fs-5">{role.name}</span>
                            <RoleTypeBadge name={role.name} />
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label text-muted small mb-1">
                            <FontAwesomeIcon icon={faKey} className="me-1" />
                            Feature
                          </label>
                          <div>
                            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary px-3 py-2">
                              {role.feature || "Non spécifiée"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label text-muted small mb-1">
                            <FontAwesomeIcon icon={faShield} className="me-1" />
                            Statut
                          </label>
                          <div>
                            <StatusBadge
                              status={role.status}
                              is_deleted={role.is_deleted}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label text-muted small mb-1">
                            <FontAwesomeIcon
                              icon={faDatabase}
                              className="me-1"
                            />
                            ID
                          </label>
                          <div className="d-flex align-items-center gap-2">
                            <code className="bg-light px-2 py-1 rounded">
                              #{role.id}
                            </code>
                            <button
                              onClick={handleCopyID}
                              className="btn btn-sm btn-outline-secondary"
                              title="Copier l'ID"
                            >
                              <FontAwesomeIcon icon={faCopy} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Carte des métadonnées */}
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-light border-0 py-3">
                    <div className="d-flex align-items-center">
                      <FontAwesomeIcon
                        icon={faCog}
                        className="me-2 text-primary"
                      />
                      <h6 className="mb-0 fw-bold">Métadonnées</h6>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label text-muted small mb-1">
                            <FontAwesomeIcon
                              icon={faCalendarAlt}
                              className="me-1"
                            />
                            Créé le
                          </label>
                          <div className="d-flex align-items-center gap-2">
                            <FontAwesomeIcon
                              icon={faCalendar}
                              className="text-muted"
                            />
                            <span className="fw-semibold">
                              {formatDateTime(role.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label text-muted small mb-1">
                            <FontAwesomeIcon
                              icon={faHistory}
                              className="me-1"
                            />
                            Dernière modification
                          </label>
                          <div className="d-flex align-items-center gap-2">
                            <FontAwesomeIcon
                              icon={faClock}
                              className="text-muted"
                            />
                            <span className="fw-semibold">
                              {role.updatedAt
                                ? formatDateTime(role.updatedAt)
                                : "Jamais modifié"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="col-12">
                        <div className="mb-3">
                          <label className="form-label text-muted small mb-1">
                            <FontAwesomeIcon icon={faCode} className="me-1" />
                            UUID
                          </label>
                          <div className="input-group">
                            <input
                              type="text"
                              className="form-control"
                              value={role.uuid}
                              readOnly
                              style={{
                                fontFamily: "monospace",
                                fontSize: "12px",
                              }}
                            />
                            <button
                              onClick={handleCopyUUID}
                              className="btn btn-outline-secondary"
                              type="button"
                              title="Copier l'UUID"
                            >
                              <FontAwesomeIcon icon={faCopy} />
                            </button>
                          </div>
                          <small className="text-muted mt-1">
                            Identifiant unique du rôle dans le système
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Colonne droite : Statistiques et actions */}
              <div className="col-md-4">
                {/* Carte de statut */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-header bg-light border-0 py-3">
                    <div className="d-flex align-items-center">
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="me-2 text-success"
                      />
                      <h6 className="mb-0 fw-bold">Statut du Rôle</h6>
                    </div>
                  </div>
                  <div className="card-body text-center">
                    <div
                      className={`rounded-circle p-4 d-inline-block mb-3 ${
                        role.status === "actif"
                          ? "bg-success bg-opacity-10"
                          : "bg-warning bg-opacity-10"
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={
                          role.status === "actif"
                            ? faCheckCircle
                            : faExclamationTriangle
                        }
                        className={`fs-1 ${role.status === "actif" ? "text-success" : "text-warning"}`}
                      />
                    </div>
                    <h5 className="mb-2">
                      Rôle {role.status === "actif" ? "Actif" : "Inactif"}
                    </h5>
                    <p className="text-muted mb-0">
                      {role.status === "actif"
                        ? "Ce rôle est actuellement actif et peut être assigné aux utilisateurs."
                        : "Ce rôle est inactif et ne peut pas être assigné."}
                    </p>
                  </div>
                </div>

                {/* Carte d'actions rapides */}
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-light border-0 py-3">
                    <div className="d-flex align-items-center">
                      <FontAwesomeIcon
                        icon={faList}
                        className="me-2 text-primary"
                      />
                      <h6 className="mb-0 fw-bold">Actions Rapides</h6>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="d-grid gap-2">
                      <button
                        className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2"
                        onClick={() => {
                          onClose();
                          // Naviguer vers les permissions du rôle
                          window.open(
                            `/dashboard-admin/roles/${role.uuid}/permissions`,
                            "_blank",
                          );
                        }}
                      >
                        <FontAwesomeIcon icon={faShieldAlt} />
                        Gérer les permissions
                      </button>

                      <button
                        className="btn btn-outline-warning d-flex align-items-center justify-content-center gap-2"
                        onClick={() => {
                          onClose();
                          // Ouvrir modal d'édition
                          alert("Ouvrir modal d'édition");
                        }}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                        Modifier le rôle
                      </button>

                      <button
                        className={`btn d-flex align-items-center justify-content-center gap-2 ${
                          role.status === "actif"
                            ? "btn-outline-warning"
                            : "btn-outline-success"
                        }`}
                        onClick={() => {
                          onClose();
                          // Basculer le statut
                          alert("Basculer le statut du rôle");
                        }}
                      >
                        <FontAwesomeIcon
                          icon={
                            role.status === "actif" ? faToggleOff : faToggleOn
                          }
                        />
                        {role.status === "actif" ? "Désactiver" : "Activer"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pied de la modal */}
          <div className="modal-footer border-top-0 py-4 px-4">
            <div className="d-flex justify-content-between w-100">
              <button
                type="button"
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                onClick={onClose}
              >
                <FontAwesomeIcon icon={faTimes} />
                Fermer
              </button>

              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-primary d-flex align-items-center gap-2"
                  onClick={handleCopyUUID}
                >
                  <FontAwesomeIcon icon={faCopy} />
                  Copier l'UUID
                </button>

                <button
                  type="button"
                  className="btn btn-primary d-flex align-items-center gap-2"
                  onClick={() => {
                    onClose();
                    // Ouvrir modal d'édition
                    alert("Ouvrir modal d'édition");
                  }}
                >
                  <FontAwesomeIcon icon={faEdit} />
                  Modifier ce rôle
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-content {
          border-radius: 16px !important;
          overflow: hidden;
        }

        .fs-14 {
          font-size: 14px !important;
        }

        .card {
          border-radius: 12px !important;
        }
      `}</style>
    </div>
  );
};

// Composant de modal de suppression
const DeleteModal = ({
  show,
  role,
  loading,
  onClose,
  onConfirm,
}: {
  show: boolean;
  role: Role | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  if (!show || !role) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(3px)",
      }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-danger text-white border-0">
            <h5 className="modal-title">
              <FontAwesomeIcon icon={faTrash} className="me-2" />
              Confirmer la suppression
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          <div className="modal-body p-4">
            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="bg-danger bg-opacity-10 rounded-circle p-3">
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="text-danger fs-3"
                />
              </div>
              <div>
                <h6 className="mb-1">Suppression du rôle</h6>
                <p className="text-muted mb-0">Cette action est irréversible</p>
              </div>
            </div>

            <div className="alert alert-warning border-0">
              <div className="d-flex">
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="me-2 mt-1"
                />
                <div>
                  <p className="mb-1 fw-semibold">Attention !</p>
                  <p className="mb-0">
                    La suppression de ce rôle peut affecter les utilisateurs qui
                    l'utilisent.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-light p-3 rounded">
              <p className="mb-2">
                <strong>Rôle à supprimer :</strong>
              </p>
              <div className="row small">
                <div className="col-6">
                  <span className="text-muted">Nom :</span>
                  <br />
                  <strong>{role.name}</strong>
                </div>
                <div className="col-6">
                  <span className="text-muted">UUID :</span>
                  <br />
                  <code
                    className="text-truncate d-block"
                    style={{ fontSize: "0.8rem" }}
                  >
                    {role.uuid}
                  </code>
                </div>
                <div className="col-6 mt-2">
                  <span className="text-muted">Statut :</span>
                  <br />
                  <StatusBadge
                    status={role.status}
                    is_deleted={role.is_deleted}
                  />
                </div>
                <div className="col-6 mt-2">
                  <span className="text-muted">Créé le :</span>
                  <br />
                  <strong>{formatDateOnly(role.created_at)}</strong>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer border-0">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Suppression...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faTrash} className="me-2" />
                  Supprimer définitivement
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal pour les actions groupées
const BulkActionsModal = ({
  show,
  selectedCount,
  loading,
  onClose,
  onActivate,
  onDeactivate,
  onDelete,
}: {
  show: boolean;
  selectedCount: number;
  loading: boolean;
  onClose: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
}) => {
  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(3px)",
      }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-primary text-white border-0">
            <h5 className="modal-title">
              <FontAwesomeIcon icon={faListCheck} className="me-2" />
              Actions groupées ({selectedCount} rôles)
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          <div className="modal-body p-4">
            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                <FontAwesomeIcon
                  icon={faLayerGroup}
                  className="text-primary fs-3"
                />
              </div>
              <div>
                <h6 className="mb-1">Actions groupées</h6>
                <p className="text-muted mb-0">
                  Appliquer une action sur {selectedCount} rôle(s)
                  sélectionné(s)
                </p>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <button
                  className="btn btn-success w-100 d-flex align-items-center justify-content-center gap-2 py-3"
                  onClick={onActivate}
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faToggleOn} />
                  <div className="text-start">
                    <div className="fw-bold">Activer</div>
                    <small className="opacity-75">Définir comme actif</small>
                  </div>
                </button>
              </div>
              <div className="col-md-6">
                <button
                  className="btn btn-warning w-100 d-flex align-items-center justify-content-center gap-2 py-3"
                  onClick={onDeactivate}
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faToggleOff} />
                  <div className="text-start">
                    <div className="fw-bold">Désactiver</div>
                    <small className="opacity-75">Définir comme inactif</small>
                  </div>
                </button>
              </div>
              <div className="col-md-12">
                <button
                  className="btn btn-danger w-100 d-flex align-items-center justify-content-center gap-2 py-3"
                  onClick={onDelete}
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faTrash} />
                  <div className="text-start">
                    <div className="fw-bold">Supprimer</div>
                    <small className="opacity-75">
                      Supprimer définitivement
                    </small>
                  </div>
                </button>
              </div>
            </div>

            <div className="alert alert-info mt-4 border-0">
              <div className="d-flex">
                <FontAwesomeIcon icon={faInfoCircle} className="me-2 mt-1" />
                <div>
                  <p className="mb-1 fw-semibold">Information</p>
                  <p className="mb-0">
                    Ces actions seront appliquées à tous les rôles sélectionnés.
                    Cette opération peut prendre quelques instants.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer border-0">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant de pagination
const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  indexOfFirstItem,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  indexOfFirstItem: number;
  onPageChange: (page: number) => void;
}) => {
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems);

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let end = Math.min(totalPages, start + maxVisiblePages - 1);

      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }

      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages) {
        if (end < totalPages - 1) pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="p-4 border-top bg-light">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        <div className="text-muted">
          <span className="fw-semibold">{indexOfFirstItem + 1}</span> -{" "}
          <span className="fw-semibold">{indexOfLastItem}</span> sur{" "}
          <span className="fw-semibold">{totalItems}</span> rôles
        </div>

        <nav aria-label="Pagination">
          <ul className="pagination mb-0">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                aria-label="Première page"
              >
                «
              </button>
            </li>

            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Page précédente"
              >
                ‹
              </button>
            </li>

            {renderPageNumbers().map((pageNum, index) => (
              <li
                key={index}
                className={`page-item ${
                  pageNum === currentPage ? "active" : ""
                } ${pageNum === "..." ? "disabled" : ""}`}
              >
                {pageNum === "..." ? (
                  <span className="page-link">...</span>
                ) : (
                  <button
                    className="page-link"
                    onClick={() => onPageChange(pageNum as number)}
                  >
                    {pageNum}
                  </button>
                )}
              </li>
            ))}

            <li
              className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Page suivante"
              >
                ›
              </button>
            </li>

            <li
              className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                aria-label="Dernière page"
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
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (value >= 1 && value <= totalPages) {
                onPageChange(value);
              }
            }}
            className="form-control form-control-sm text-center"
            style={{ width: "70px" }}
          />
          <span className="text-muted">sur {totalPages}</span>
        </div>
      </div>
    </div>
  );
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

// Fonction pour formater la date et l'heure
const formatDateTime = (dateString: string | null | undefined) => {
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
      second: "2-digit",
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

export default function RolesPage() {
  const router = useRouter();

  // États pour les données
  const [roles, setRoles] = useState<Role[]>([]);
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
  const [showBulkActionsModal, setShowBulkActionsModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // États pour les filtres et recherche
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Role;
    direction: "asc" | "desc";
  } | null>(null);

  // États pour la sélection multiple
  const [selection, setSelection] = useState<SelectionState>({
    allSelected: false,
    selectedIds: new Set<string>(),
  });

  // Options pour les éléments par page
  const itemsPerPageOptions = [5, 10, 20, 50];

  // ✅ Fonction pour charger les rôles
  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("📡 Fetching roles from:", API_ENDPOINTS.ROLES.LIST);

      // ✅ L'API retourne directement un tableau
      const rolesData = await api.get<Role[]>(API_ENDPOINTS.ROLES.LIST);

      console.log("✅ Roles data received:", {
        data: rolesData,
        isArray: Array.isArray(rolesData),
        length: rolesData?.length || 0,
        firstRole: rolesData?.[0],
      });

      if (Array.isArray(rolesData)) {
        setRoles(rolesData);
        setPagination((prev) => ({
          ...prev,
          total: rolesData.length,
          pages: Math.ceil(rolesData.length / prev.limit),
        }));
        // Réinitialiser la sélection quand les données changent
        setSelection({
          allSelected: false,
          selectedIds: new Set(),
        });
      } else {
        console.error("❌ API did not return an array:", rolesData);
        setError("Format de réponse API invalide");
        setRoles([]);
        setPagination((prev) => ({ ...prev, total: 0, pages: 1 }));
      }
    } catch (err: any) {
      console.error("❌ Error fetching roles:", err);

      let errorMessage = "Erreur lors du chargement des rôles";

      if (err.response?.status === 404) {
        errorMessage = "Route API non trouvée";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setRoles([]);
      setPagination((prev) => ({ ...prev, total: 0, pages: 1 }));
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fonction pour supprimer un rôle
  const deleteRole = async (uuid: string) => {
    try {
      setActionLoading(true);
      await api.delete(API_ENDPOINTS.ROLES.DELETE(uuid));

      // Mettre à jour localement
      setRoles((prev) => prev.filter((role) => role.uuid !== uuid));
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));

      return true;
    } catch (err: any) {
      console.error("❌ Error deleting role:", err);
      throw new Error(
        err.response?.data?.message || "Erreur lors de la suppression",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ Fonction pour basculer le statut d'un rôle
  const toggleRoleStatus = async (uuid: string) => {
    try {
      setActionLoading(true);

      const role = roles.find((r) => r.uuid === uuid);
      if (!role) throw new Error("Rôle non trouvé");

      const newStatus = role.status === "actif" ? "inactif" : "actif";

      await api.put(API_ENDPOINTS.ROLES.UPDATE(uuid), {
        status: newStatus,
      });

      // Mettre à jour localement
      setRoles((prev) =>
        prev.map((r) => (r.uuid === uuid ? { ...r, status: newStatus } : r)),
      );

      return true;
    } catch (err: any) {
      console.error("❌ Error toggling role status:", err);
      throw new Error(
        err.response?.data?.message || "Erreur lors du changement de statut",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Fonctions pour la sélection multiple
  const toggleSelectAll = useCallback(() => {
    setSelection((prev) => {
      const newAllSelected = !prev.allSelected;

      if (newAllSelected) {
        // Sélectionner tous les rôles visibles
        const visibleRoles = getVisibleRoles();
        const newSelectedIds = new Set(visibleRoles.map((role) => role.uuid));
        return {
          allSelected: true,
          selectedIds: newSelectedIds,
        };
      } else {
        // Désélectionner tout
        return {
          allSelected: false,
          selectedIds: new Set(),
        };
      }
    });
  }, [roles, searchTerm, selectedStatus, selectedType]);

  const toggleSelectRole = useCallback((uuid: string) => {
    setSelection((prev) => {
      const newSelectedIds = new Set(prev.selectedIds);
      if (newSelectedIds.has(uuid)) {
        newSelectedIds.delete(uuid);
      } else {
        newSelectedIds.add(uuid);
      }

      // Vérifier si tous les rôles visibles sont sélectionnés
      const visibleRoles = getVisibleRoles();
      const allVisibleSelected = visibleRoles.every((role) =>
        newSelectedIds.has(role.uuid),
      );

      return {
        allSelected: allVisibleSelected,
        selectedIds: newSelectedIds,
      };
    });
  }, []);

  const getVisibleRoles = () => {
    let filtered = [...roles];

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (role) =>
          role.name?.toLowerCase().includes(searchLower) ||
          role.feature?.toLowerCase().includes(searchLower) ||
          role.uuid?.toLowerCase().includes(searchLower),
      );
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((role) => role.status === selectedStatus);
    }

    if (selectedType !== "all") {
      filtered = filtered.filter((role) => role.name === selectedType);
    }

    return sortRoles(filtered);
  };

  const getSelectedRoles = () => {
    return roles.filter((role) => selection.selectedIds.has(role.uuid));
  };

  const clearSelection = () => {
    setSelection({
      allSelected: false,
      selectedIds: new Set(),
    });
  };

  // Actions groupées
  const handleBulkActivate = async () => {
    try {
      setActionLoading(true);
      const selectedRoles = getSelectedRoles();

      // Appliquer l'action sur chaque rôle sélectionné
      const promises = selectedRoles.map((role) =>
        api.put(API_ENDPOINTS.ROLES.UPDATE(role.uuid), {
          status: "actif",
        }),
      );

      await Promise.all(promises);

      // Mettre à jour localement
      setRoles((prev) =>
        prev.map((role) =>
          selection.selectedIds.has(role.uuid)
            ? { ...role, status: "actif" }
            : role,
        ),
      );

      setSuccessMessage(
        `${selectedRoles.length} rôle(s) activé(s) avec succès`,
      );
      clearSelection();
      setShowBulkActionsModal(false);

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Erreur lors de l'activation groupée:", err);
      setError(err.message || "Erreur lors de l'activation groupée");
      setTimeout(() => setError(null), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkDeactivate = async () => {
    try {
      setActionLoading(true);
      const selectedRoles = getSelectedRoles();

      // Appliquer l'action sur chaque rôle sélectionné
      const promises = selectedRoles.map((role) =>
        api.put(API_ENDPOINTS.ROLES.UPDATE(role.uuid), {
          status: "inactif",
        }),
      );

      await Promise.all(promises);

      // Mettre à jour localement
      setRoles((prev) =>
        prev.map((role) =>
          selection.selectedIds.has(role.uuid)
            ? { ...role, status: "inactif" }
            : role,
        ),
      );

      setSuccessMessage(
        `${selectedRoles.length} rôle(s) désactivé(s) avec succès`,
      );
      clearSelection();
      setShowBulkActionsModal(false);

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Erreur lors de la désactivation groupée:", err);
      setError(err.message || "Erreur lors de la désactivation groupée");
      setTimeout(() => setError(null), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    try {
      setActionLoading(true);
      const selectedRoles = getSelectedRoles();

      // Appliquer l'action sur chaque rôle sélectionné
      const promises = selectedRoles.map((role) =>
        api.delete(API_ENDPOINTS.ROLES.DELETE(role.uuid)),
      );

      await Promise.all(promises);

      // Mettre à jour localement
      setRoles((prev) =>
        prev.filter((role) => !selection.selectedIds.has(role.uuid)),
      );
      setPagination((prev) => ({
        ...prev,
        total: prev.total - selectedRoles.length,
      }));

      setSuccessMessage(
        `${selectedRoles.length} rôle(s) supprimé(s) avec succès`,
      );
      clearSelection();
      setShowBulkActionsModal(false);

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Erreur lors de la suppression groupée:", err);
      setError(err.message || "Erreur lors de la suppression groupée");
      setTimeout(() => setError(null), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  // Charger les rôles au montage
  useEffect(() => {
    fetchRoles();
  }, []);

  // ✅ Fonction pour gérer la suppression d'un rôle
  const handleDeleteRole = async () => {
    if (!selectedRole) return;

    try {
      await deleteRole(selectedRole.uuid);

      setShowDeleteModal(false);
      setSelectedRole(null);

      setSuccessMessage(`Rôle "${selectedRole.name}" supprimé avec succès`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Erreur lors de la suppression:", err);
      setError(err.message || "Erreur lors de la suppression");
      setTimeout(() => setError(null), 3000);
    }
  };

  // ✅ Fonction pour basculer le statut d'un rôle
  const handleToggleStatus = async (role: Role) => {
    try {
      await toggleRoleStatus(role.uuid);

      setSuccessMessage(
        `Rôle "${role.name}" ${role.status === "actif" ? "désactivé" : "activé"} avec succès`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Erreur lors du changement de statut:", err);
      setError(err.message || "Erreur lors du changement de statut");
      setTimeout(() => setError(null), 3000);
    }
  };

  // ✅ Fonction pour ouvrir la modal de visualisation
  const handleViewRole = (role: Role) => {
    setSelectedRole(role);
    setShowViewModal(true);
  };

  // Fonction pour copier l'UUID dans le presse-papier
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setInfoMessage("UUID copié dans le presse-papier");
    setTimeout(() => setInfoMessage(null), 2000);
  };

  // ✅ Fonction pour gérer la création d'un rôle
  const handleRoleCreated = () => {
    setSuccessMessage("Rôle créé avec succès !");
    fetchRoles();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // ✅ Fonction pour gérer la modification d'un rôle
  const handleRoleUpdated = () => {
    setSuccessMessage("Rôle modifié avec succès !");
    fetchRoles();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Fonction pour naviguer vers les détails du rôle
  const navigateToRoleDetail = (uuid: string) => {
    router.push(`/dashboard-admin/roles/${uuid}`);
  };

  // ✅ Fonction de tri
  const sortRoles = (rolesList: Role[]) => {
    if (!sortConfig || !rolesList.length) return rolesList;

    return [...rolesList].sort((a, b) => {
      let aValue: any = a[sortConfig.key];
      let bValue: any = b[sortConfig.key];

      if (aValue == null) aValue = "";
      if (bValue == null) bValue = "";

      if (sortConfig.key === "created_at" || sortConfig.key === "updatedAt") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  };

  const requestSort = (key: keyof Role) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Role) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <FontAwesomeIcon icon={faSort} className="text-muted ms-1" />;
    }
    return sortConfig.direction === "asc" ? (
      <FontAwesomeIcon icon={faSortUp} className="text-primary ms-1" />
    ) : (
      <FontAwesomeIcon icon={faSortDown} className="text-primary ms-1" />
    );
  };

  // ✅ Filtrer les rôles basé sur la recherche
  const filteredRoles = useMemo(() => {
    let filtered = [...roles];

    // Filtre de recherche
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (role) =>
          role.name?.toLowerCase().includes(searchLower) ||
          role.feature?.toLowerCase().includes(searchLower) ||
          role.uuid?.toLowerCase().includes(searchLower),
      );
    }

    // Filtre par statut
    if (selectedStatus !== "all") {
      filtered = filtered.filter((role) => role.status === selectedStatus);
    }

    // Filtre par type
    if (selectedType !== "all") {
      filtered = filtered.filter((role) => role.name === selectedType);
    }

    return sortRoles(filtered);
  }, [roles, searchTerm, selectedStatus, selectedType, sortConfig]);

  // ✅ Calculer les éléments actuels avec pagination
  const currentItems = useMemo(() => {
    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit;
    return filteredRoles.slice(start, end);
  }, [filteredRoles, pagination.page, pagination.limit]);

  // ✅ Calculer les statistiques
  const statistics = useMemo(() => {
    const activeRoles = roles.filter(
      (role) => role.status === "actif" && !role.is_deleted,
    );
    const inactiveRoles = roles.filter(
      (role) => role.status !== "actif" && !role.is_deleted,
    );
    const deletedRoles = roles.filter((role) => role.is_deleted);

    return {
      total: roles.length,
      active: activeRoles.length,
      inactive: inactiveRoles.length,
      deleted: deletedRoles.length,
      selected: selection.selectedIds.size,
    };
  }, [roles, selection.selectedIds.size]);

  // ✅ Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setSelectedType("all");
    setSortConfig(null);
    setPagination((prev) => ({ ...prev, page: 1 }));
    clearSelection();
  };

  // ✅ Obtenir les types de rôle uniques
  const roleTypes = useMemo(() => {
    if (!roles.length) return [];
    const types = roles.map((role) => role.name).filter(Boolean);
    return [...new Set(types)];
  }, [roles]);

  return (
    <>
      {/* Modal de création de rôle */}
      <CreateRoleModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleRoleCreated}
      />

      {/* Modal de modification de rôle */}
      <EditRoleModal
        isOpen={showEditModal}
        role={selectedRole}
        onClose={() => {
          setShowEditModal(false);
          setSelectedRole(null);
        }}
        onSuccess={handleRoleUpdated}
      />

      {/* NOUVELLE MODAL : Visualisation des détails */}
      <ViewRoleModal
        show={showViewModal}
        role={selectedRole}
        onClose={() => {
          setShowViewModal(false);
          setSelectedRole(null);
        }}
      />

      {/* Modal de suppression */}
      <DeleteModal
        show={showDeleteModal}
        role={selectedRole}
        loading={actionLoading}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedRole(null);
        }}
        onConfirm={handleDeleteRole}
      />

      {/* Modal d'actions groupées */}
      <BulkActionsModal
        show={showBulkActionsModal}
        selectedCount={selection.selectedIds.size}
        loading={actionLoading}
        onClose={() => setShowBulkActionsModal(false)}
        onActivate={handleBulkActivate}
        onDeactivate={handleBulkDeactivate}
        onDelete={handleBulkDelete}
      />

      <div className="p-3 p-md-4">
        {/* Messages d'alerte */}
        {error && (
          <div
            className="alert alert-danger alert-dismissible fade show mb-4"
            role="alert"
          >
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            <strong>Erreur:</strong> {error}
            <button
              type="button"
              className="btn-close"
              onClick={() => setError(null)}
            ></button>
          </div>
        )}

        {successMessage && (
          <div
            className="alert alert-success alert-dismissible fade show mb-4"
            role="alert"
          >
            <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
            <strong>Succès:</strong> {successMessage}
            <button
              type="button"
              className="btn-close"
              onClick={() => setSuccessMessage(null)}
            ></button>
          </div>
        )}

        {infoMessage && (
          <div
            className="alert alert-info alert-dismissible fade show mb-4"
            role="alert"
          >
            <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
            <strong>Information:</strong> {infoMessage}
            <button
              type="button"
              className="btn-close"
              onClick={() => setInfoMessage(null)}
            ></button>
          </div>
        )}

        {/* Barre d'actions de sélection */}
        {selection.selectedIds.size > 0 && (
          <div
            className="alert alert-primary alert-dismissible fade show mb-4 border-0 shadow-sm"
            role="alert"
          >
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                  <FontAwesomeIcon
                    icon={faCheckDouble}
                    className="text-primary"
                  />
                </div>
                <div>
                  <h6 className="mb-1 fw-bold">
                    {selection.selectedIds.size} rôle(s) sélectionné(s)
                  </h6>
                  <p className="mb-0 text-muted">
                    {getSelectedRoles()
                      .map((r) => r.name)
                      .join(", ")}
                  </p>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <button
                  onClick={() => setShowBulkActionsModal(true)}
                  className="btn btn-primary d-flex align-items-center gap-2"
                  disabled={actionLoading}
                >
                  <FontAwesomeIcon icon={faLayerGroup} />
                  Actions groupées
                </button>

                <button
                  onClick={clearSelection}
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  disabled={actionLoading}
                >
                  <FontAwesomeIcon icon={faTimes} />
                  Annuler la sélection
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="card-header bg-white border-0 py-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div>
                <div className="d-flex align-items-center gap-3">
                  <h2 className="h4 mb-0 fw-bold">
                    <FontAwesomeIcon
                      icon={faShieldAlt}
                      className="me-2 text-primary"
                    />
                    Gestion des Rôles
                  </h2>
                  <span className="badge bg-primary bg-opacity-10 text-primary border border-primary">
                    {statistics.total} rôle(s)
                    {statistics.active > 0 && (
                      <span className="ms-2 badge bg-success">
                        {statistics.active} actif(s)
                      </span>
                    )}
                    {statistics.selected > 0 && (
                      <span className="ms-2 badge bg-info">
                        {statistics.selected} sélectionné(s)
                      </span>
                    )}
                  </span>
                </div>
                <p className="text-muted mb-0 mt-2">
                  Gérez les rôles et les permissions du système
                </p>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <button
                  onClick={() => fetchRoles()}
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  disabled={loading || actionLoading}
                >
                  <FontAwesomeIcon icon={faSync} spin={loading} />
                  Rafraîchir
                </button>

                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-success d-flex align-items-center gap-2"
                  disabled={loading || actionLoading}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Nouveau Rôle
                </button>
              </div>
            </div>
          </div>

          {/* Filtres et recherche */}
          <div className="p-4 border-bottom bg-light-subtle">
            <div className="row g-3">
              <div className="col-md-4">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faSearch} className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Rechercher par nom, feature..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="col-md-3">
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
                    <option value="all">Tous les statuts</option>
                    <option value="actif">Actif</option>
                    <option value="inactif">Inactif</option>
                  </select>
                </div>
              </div>

              <div className="col-md-3">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faTags} className="text-muted" />
                  </span>
                  <select
                    className="form-select border-start-0 ps-0"
                    value={selectedType}
                    onChange={(e) => {
                      setSelectedType(e.target.value);
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                    disabled={loading}
                  >
                    <option value="all">Tous les types</option>
                    {roleTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="col-md-2">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faDatabase} className="text-muted" />
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
                        {option} / page
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-md-6">
                <div className="d-flex align-items-center gap-2">
                  <small className="text-muted">
                    Résultats: <strong>{filteredRoles.length}</strong> rôle(s)
                    {searchTerm && (
                      <>
                        {" "}
                        pour "<strong>{searchTerm}</strong>"
                      </>
                    )}
                    {selection.selectedIds.size > 0 && (
                      <span className="ms-2 text-primary">
                        • <strong>{selection.selectedIds.size}</strong>{" "}
                        sélectionné(s)
                      </span>
                    )}
                  </small>
                </div>
              </div>

              <div className="col-md-6 text-end">
                <div className="d-flex justify-content-end gap-2">
                  {selection.selectedIds.size > 0 && (
                    <button
                      onClick={() => setShowBulkActionsModal(true)}
                      className="btn btn-primary btn-sm"
                      disabled={actionLoading}
                    >
                      <FontAwesomeIcon icon={faLayerGroup} className="me-1" />
                      Actions ({selection.selectedIds.size})
                    </button>
                  )}
                  <button
                    onClick={resetFilters}
                    className="btn btn-outline-secondary btn-sm"
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={faTimes} className="me-1" />
                    Réinitialiser
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tableau des rôles */}
          <div className="table-responsive">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-secondary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-3 text-muted">
                  <FontAwesomeIcon icon={faSync} spin className="me-2" />
                  Chargement des rôles...
                </p>
              </div>
            ) : (
              <>
                {filteredRoles.length === 0 ? (
                  <div className="text-center py-5">
                    <div
                      className="alert alert-info mx-auto border-0"
                      style={{ maxWidth: "500px" }}
                    >
                      <div className="bg-info bg-opacity-10 rounded-circle p-4 d-inline-block mb-3">
                        <FontAwesomeIcon
                          icon={faShield}
                          className="fs-1 text-info"
                        />
                      </div>
                      <h5 className="alert-heading">
                        {roles.length === 0 ? "Aucun rôle" : "Aucun résultat"}
                      </h5>
                      <p className="mb-0">
                        {roles.length === 0
                          ? "Aucun rôle n'a été créé dans le système."
                          : "Aucun rôle ne correspond à vos critères de recherche."}
                      </p>
                      <div className="mt-3">
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="btn btn-primary"
                        >
                          <FontAwesomeIcon icon={faPlus} className="me-2" />
                          Créer un nouveau rôle
                        </button>
                        {(searchTerm ||
                          selectedStatus !== "all" ||
                          selectedType !== "all") && (
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
                          <th style={{ width: "200px" }}>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent d-flex align-items-center"
                              onClick={() => requestSort("name")}
                            >
                              Nom du Rôle
                              {getSortIcon("name")}
                            </button>
                          </th>
                          <th style={{ width: "120px" }}>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent d-flex align-items-center"
                              onClick={() => requestSort("feature")}
                            >
                              <FontAwesomeIcon icon={faKey} className="me-1" />
                              Feature
                              {getSortIcon("feature")}
                            </button>
                          </th>
                          <th style={{ width: "120px" }}>
                            <span className="fw-semibold">
                              <FontAwesomeIcon icon={faTags} className="me-1" />
                              Type
                            </span>
                          </th>
                          <th style={{ width: "120px" }}>
                            <span className="fw-semibold">Statut</span>
                          </th>
                          <th style={{ width: "150px" }}>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent d-flex align-items-center"
                              onClick={() => requestSort("created_at")}
                            >
                              <FontAwesomeIcon
                                icon={faCalendar}
                                className="me-1"
                              />
                              Créé le
                              {getSortIcon("created_at")}
                            </button>
                          </th>
                          <th
                            style={{ width: "160px" }}
                            className="text-center"
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.map((role, index) => (
                          <tr
                            key={role.uuid}
                            className="align-middle"
                            style={{
                              opacity: role.is_deleted ? 0.6 : 1,
                              backgroundColor: selection.selectedIds.has(
                                role.uuid,
                              )
                                ? "rgba(13, 110, 253, 0.05)"
                                : "transparent",
                            }}
                          >
                            <td>
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={selection.selectedIds.has(role.uuid)}
                                  onChange={() => toggleSelectRole(role.uuid)}
                                  disabled={actionLoading || role.is_deleted}
                                />
                              </div>
                            </td>
                            <td className="text-center text-muted fw-semibold">
                              {(pagination.page - 1) * pagination.limit +
                                index +
                                1}
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                  <div
                                    className={`rounded-circle d-flex align-items-center justify-content-center ${
                                      role.status === "actif"
                                        ? "bg-primary bg-opacity-10 text-primary"
                                        : "bg-secondary bg-opacity-10 text-secondary"
                                    }`}
                                    style={{ width: "40px", height: "40px" }}
                                  >
                                    <FontAwesomeIcon icon={faShield} />
                                  </div>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                  <div className="fw-semibold">
                                    {role.name}
                                    {role.is_deleted && (
                                      <span className="badge bg-dark bg-opacity-10 text-dark border border-dark ms-2 px-2 py-1">
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
                                      onClick={() => copyToClipboard(role.uuid)}
                                      title="Cliquer pour copier l'UUID"
                                    >
                                      {role.uuid.substring(0, 8)}...
                                    </code>
                                    <FontAwesomeIcon
                                      icon={faCopy}
                                      className="fs-12 text-muted cursor-pointer"
                                      onClick={() => copyToClipboard(role.uuid)}
                                      title="Copier l'UUID"
                                    />
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  role.feature === "actif"
                                    ? "bg-success bg-opacity-10 text-success border border-success"
                                    : "bg-secondary bg-opacity-10 text-secondary border border-secondary"
                                } px-2 py-1`}
                              >
                                {role.feature || "N/A"}
                              </span>
                            </td>
                            <td>
                              <RoleTypeBadge name={role.name} />
                            </td>
                            <td>
                              <StatusBadge
                                status={role.status}
                                is_deleted={role.is_deleted}
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
                                    {formatDateOnly(role.created_at)}
                                  </small>
                                </div>
                                {role.updatedAt &&
                                  role.updatedAt !== role.created_at && (
                                    <small className="text-muted mt-1">
                                      Modifié: {formatDateOnly(role.updatedAt)}
                                    </small>
                                  )}
                              </div>
                            </td>
                            <td className="text-center">
                              <div
                                className="btn-group btn-group-sm"
                                role="group"
                              >
                                {/* BOUTON VUE MODIFIÉ ICI */}
                                <button
                                  className="btn btn-outline-primary"
                                  title="Voir détails"
                                  onClick={() => handleViewRole(role)}
                                  disabled={actionLoading}
                                >
                                  <FontAwesomeIcon icon={faEye} />
                                </button>

                                <button
                                  className="btn btn-outline-warning"
                                  title="Modifier"
                                  onClick={() => {
                                    setSelectedRole(role);
                                    setShowEditModal(true);
                                  }}
                                  disabled={actionLoading || role.is_deleted}
                                >
                                  <FontAwesomeIcon icon={faEdit} />
                                </button>

                                <button
                                  className={`btn ${role.status === "actif" ? "btn-outline-warning" : "btn-outline-success"}`}
                                  title={
                                    role.status === "actif"
                                      ? "Désactiver"
                                      : "Activer"
                                  }
                                  onClick={() => handleToggleStatus(role)}
                                  disabled={actionLoading || role.is_deleted}
                                >
                                  <FontAwesomeIcon
                                    icon={
                                      role.status === "actif"
                                        ? faToggleOff
                                        : faToggleOn
                                    }
                                  />
                                </button>

                                <button
                                  className="btn btn-outline-danger"
                                  title="Supprimer"
                                  onClick={() => {
                                    setSelectedRole(role);
                                    setShowDeleteModal(true);
                                  }}
                                  disabled={actionLoading || role.is_deleted}
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
                    {pagination.total > pagination.limit && (
                      <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.pages}
                        totalItems={filteredRoles.length}
                        itemsPerPage={pagination.limit}
                        indexOfFirstItem={
                          (pagination.page - 1) * pagination.limit
                        }
                        onPageChange={(page) =>
                          setPagination((prev) => ({ ...prev, page }))
                        }
                      />
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .btn-group-sm > .btn {
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
        }
        .table > :not(caption) > * > * {
          padding: 0.75rem 0.5rem;
          vertical-align: middle;
        }
        .fs-12 {
          font-size: 12px !important;
        }
        .cursor-pointer {
          cursor: pointer;
        }
        .table-hover tbody tr:hover {
          background-color: rgba(0, 0, 0, 0.03);
        }
        @media (max-width: 768px) {
          .btn-group {
            flex-wrap: wrap;
          }
          .btn-group-sm > .btn {
            margin-bottom: 2px;
          }
        }
        .form-check-input:checked {
          background-color: var(--bs-primary);
          border-color: var(--bs-primary);
        }
      `}</style>
    </>
  );
}
