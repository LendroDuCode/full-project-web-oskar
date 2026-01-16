// app/(back-office)/dashboard-admin/roles/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
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
  faChartBar,
  faCog,
  faKey,
  faTags,
} from "@fortawesome/free-solid-svg-icons";
import { useRoles } from "@/hooks/useRoles";
import colors from "@/app/shared/constants/colors";

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
      <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 d-inline-flex align-items-center gap-1">
        <FontAwesomeIcon icon={faBan} className="fs-12" />
        <span>Supprimé</span>
      </span>
    );
  }

  switch (status) {
    case "actif":
      return (
        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 d-inline-flex align-items-center gap-1">
          <FontAwesomeIcon icon={faCheckCircle} className="fs-12" />
          <span>Actif</span>
        </span>
      );
    case "inactif":
      return (
        <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 d-inline-flex align-items-center gap-1">
          <FontAwesomeIcon icon={faExclamationTriangle} className="fs-12" />
          <span>Inactif</span>
        </span>
      );
    case "suspendu":
      return (
        <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 d-inline-flex align-items-center gap-1">
          <FontAwesomeIcon icon={faBan} className="fs-12" />
          <span>Suspendu</span>
        </span>
      );
    default:
      return (
        <span className="badge bg-light text-dark border d-inline-flex align-items-center gap-1">
          <FontAwesomeIcon icon={faCog} className="fs-12" />
          <span>{status}</span>
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
          bgColor: colors.oskar.info,
          textColor: colors.oskar.info,
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
          bgColor: colors.oskar.secondary,
          textColor: colors.oskar.secondary,
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
      className={`badge bg-${config.color} bg-opacity-10 text-${config.color} border border-${config.color} border-opacity-25 d-inline-flex align-items-center gap-1`}
      style={{
        backgroundColor: `${config.bgColor}15`,
        color: config.textColor,
        borderColor: `${config.bgColor}30`,
      }}
    >
      <FontAwesomeIcon icon={config.icon} className="fs-12" />
      <span>{name}</span>
    </span>
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
  role: any;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  if (!show || !role) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title text-danger">
              <FontAwesomeIcon icon={faTrash} className="me-2" />
              Confirmer la suppression
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          <div className="modal-body">
            <div className="alert alert-warning mb-3">
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
              <strong>Attention :</strong> La suppression d'un rôle peut
              affecter les utilisateurs qui l'utilisent.
            </div>
            <p>
              Êtes-vous sûr de vouloir supprimer le rôle{" "}
              <strong>{role.name}</strong> ?
            </p>
            <ul className="text-muted small">
              <li>UUID : {role.uuid}</li>
              <li>Créé le : {formatDate(role.created_at)}</li>
            </ul>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
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
                  Supprimer
                </>
              )}
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
  onLimitChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  indexOfFirstItem: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
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
    <div className="p-4 border-top">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        <div className="d-flex align-items-center gap-3">
          <div className="text-muted">
            Affichage de{" "}
            <span className="fw-semibold">{indexOfFirstItem + 1}</span> à{" "}
            <span className="fw-semibold">{indexOfLastItem}</span> sur{" "}
            <span className="fw-semibold">{totalItems}</span> rôles
          </div>
          {onLimitChange && (
            <select
              className="form-select form-select-sm"
              style={{ width: "100px" }}
              value={itemsPerPage}
              onChange={(e) => onLimitChange(Number(e.target.value))}
            >
              <option value="5">5 / page</option>
              <option value="10">10 / page</option>
              <option value="20">20 / page</option>
              <option value="50">50 / page</option>
            </select>
          )}
        </div>

        <nav aria-label="Pagination">
          <ul className="pagination mb-0">
            {/* Première page */}
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

            {/* Page précédente */}
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

            {/* Pages numérotées */}
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

            {/* Page suivante */}
            <li
              className={`page-item ${
                currentPage === totalPages ? "disabled" : ""
              }`}
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

            {/* Dernière page */}
            <li
              className={`page-item ${
                currentPage === totalPages ? "disabled" : ""
              }`}
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

// Composant de statistiques
const StatsCard = ({ title, value, icon, color, subtitle }: any) => (
  <div
    className="card border-0 shadow-sm h-100"
    style={{ borderRadius: "10px" }}
  >
    <div className="card-body">
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h6 className="text-muted mb-1" style={{ fontSize: "0.8rem" }}>
            {title}
          </h6>
          <h3 className="mb-0 fw-bold" style={{ color }}>
            {value}
          </h3>
          {subtitle && (
            <small className="text-muted" style={{ fontSize: "0.7rem" }}>
              {subtitle}
            </small>
          )}
        </div>
        <div
          className="rounded-circle d-flex align-items-center justify-content-center"
          style={{
            width: "45px",
            height: "45px",
            backgroundColor: `${color}15`,
          }}
        >
          <FontAwesomeIcon icon={icon} style={{ color, fontSize: "1rem" }} />
        </div>
      </div>
    </div>
  </div>
);

export default function RolesPage() {
  // Utilisation du hook useRoles avec gestion d'erreur
  const {
    roles = [],
    loading = false,
    error,
    pagination = {
      page: 1,
      limit: 10,
      total: 0,
      pages: 1,
    },
    fetchRoles,
    deleteRole,
    toggleRoleStatus,
    setPage,
    setLimit,
    clearError,
    totalActiveRoles = 0,
    totalInactiveRoles = 0,
  } = useRoles() || {};

  // États pour les modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);

  // États pour les filtres et recherche
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  // États pour les messages
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // États locaux pour la pagination (fallback si useRoles échoue)
  const [localPagination, setLocalPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // Options pour les éléments par page
  const itemsPerPageOptions = [5, 10, 20, 50];

  // Utiliser la pagination de useRoles ou la pagination locale
  const currentPagination = pagination || localPagination;

  // Charger les rôles au montage
  useEffect(() => {
    if (fetchRoles) {
      fetchRoles();
    } else {
      console.error("fetchRoles n'est pas défini dans useRoles");
    }
  }, []);

  // Gérer les changements de pagination et filtres avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const filters: any = {};

      if (searchTerm) filters.search = searchTerm;
      if (selectedStatus !== "all") filters.status = selectedStatus;
      if (selectedType !== "all") filters.type = selectedType;

      if (fetchRoles) {
        fetchRoles({
          page: currentPagination.page,
          limit: currentPagination.limit,
          filters,
        });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [
    currentPagination.page,
    currentPagination.limit,
    searchTerm,
    selectedStatus,
    selectedType,
    fetchRoles,
  ]);

  // Mettre à jour la pagination locale si nécessaire
  useEffect(() => {
    if (roles.length > 0) {
      setLocalPagination((prev) => ({
        ...prev,
        total: roles.length,
        pages: Math.ceil(roles.length / prev.limit),
      }));
    }
  }, [roles]);

  // Fonction pour gérer la suppression d'un rôle
  const handleDeleteRole = async () => {
    if (!selectedRole || !deleteRole) return;

    try {
      setActionLoading(true);
      await deleteRole(selectedRole.uuid);

      setShowDeleteModal(false);
      setSelectedRole(null);

      setSuccessMessage("Rôle supprimé avec succès");
      setTimeout(() => setSuccessMessage(null), 3000);

      // Rafraîchir la liste
      if (fetchRoles) {
        fetchRoles();
      }
    } catch (err: any) {
      console.error("Erreur lors de la suppression:", err);
      setSuccessMessage("Erreur lors de la suppression");
      setTimeout(() => setSuccessMessage(null), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  // Fonction pour ouvrir le modal de suppression
  const openDeleteModal = (role: any) => {
    setSelectedRole(role);
    setShowDeleteModal(true);
  };

  // Fonction pour basculer le statut d'un rôle
  const handleToggleStatus = async (role: any) => {
    if (!toggleRoleStatus) return;

    try {
      setActionLoading(true);

      const isActive = role.status === "actif";
      await toggleRoleStatus(role.uuid, !isActive);

      setSuccessMessage(
        `Rôle ${isActive ? "désactivé" : "activé"} avec succès`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);

      // Rafraîchir la liste
      if (fetchRoles) {
        fetchRoles();
      }
    } catch (err: any) {
      console.error("Erreur lors du changement de statut:", err);
      setSuccessMessage("Erreur lors du changement de statut");
      setTimeout(() => setSuccessMessage(null), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  // Fonction pour copier l'UUID dans le presse-papier
  const copyToClipboard = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setSuccessMessage("UUID copié dans le presse-papier");
      setTimeout(() => setSuccessMessage(null), 2000);
    }
  };

  // Fonction de tri
  const sortRoles = (rolesList: any[]) => {
    if (!sortConfig || !rolesList.length) return rolesList;

    return [...rolesList].sort((a, b) => {
      let aValue: any = a[sortConfig.key];
      let bValue: any = b[sortConfig.key];

      // Gérer les valeurs null/undefined
      if (aValue == null) aValue = "";
      if (bValue == null) bValue = "";

      // Gérer les dates
      if (sortConfig.key === "created_at" || sortConfig.key === "updatedAt") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
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

  const requestSort = (key: string) => {
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

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <FontAwesomeIcon icon={faSort} className="text-muted ms-1" />;
    }
    return sortConfig.direction === "asc" ? (
      <FontAwesomeIcon icon={faSortUp} className="text-primary ms-1" />
    ) : (
      <FontAwesomeIcon icon={faSortDown} className="text-primary ms-1" />
    );
  };

  // Filtrer et trier les rôles avec useMemo pour la performance
  const filteredRoles = useMemo(() => {
    return sortRoles(roles || []);
  }, [roles, sortConfig]);

  const currentItems = useMemo(() => {
    const start = (currentPagination.page - 1) * currentPagination.limit;
    const end = start + currentPagination.limit;
    return (filteredRoles || []).slice(start, end);
  }, [filteredRoles, currentPagination.page, currentPagination.limit]);

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setSelectedType("all");
    setSortConfig(null);
    if (setPage) {
      setPage(1);
    } else {
      setLocalPagination((prev) => ({ ...prev, page: 1 }));
    }
  };

  // Obtenir les types de rôle uniques
  const roleTypes = useMemo(() => {
    const types = (roles || []).map((role) => role.name);
    return [...new Set(types)];
  }, [roles]);

  // Statistiques des rôles
  const stats = useMemo(() => {
    const totalRoles = (roles || []).length;
    const deletedRoles = (roles || []).filter((role) => role.is_deleted).length;
    const suspendedRoles = (roles || []).filter(
      (role) => role.status === "suspendu",
    ).length;

    return {
      total: totalRoles,
      active: totalActiveRoles || 0,
      inactive: totalInactiveRoles || 0,
      deleted: deletedRoles,
      suspended: suspendedRoles,
    };
  }, [roles, totalActiveRoles, totalInactiveRoles]);

  // Fonction pour changer de page (gère les deux cas)
  const handlePageChange = (page: number) => {
    if (setPage) {
      setPage(page);
    } else {
      setLocalPagination((prev) => ({ ...prev, page }));
    }
  };

  // Fonction pour changer la limite (gère les deux cas)
  const handleLimitChange = (limit: number) => {
    if (setLimit) {
      setLimit(limit);
    } else {
      setLocalPagination((prev) => ({ ...prev, limit, page: 1 }));
    }
  };

  return (
    <>
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

      <div className="p-3 p-md-4">
        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="card-header bg-white border-0 py-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div>
                <p className="text-muted mb-1">
                  Administration des Permissions
                </p>
                <div className="d-flex align-items-center gap-3">
                  <h2 className="h4 mb-0 fw-bold">Gestion des Rôles</h2>
                  <div className="d-flex gap-2">
                    <span className="badge bg-primary bg-opacity-10 text-primary">
                      {currentPagination.total} rôle(s)
                    </span>
                    <span className="badge bg-success bg-opacity-10 text-success">
                      {stats.active} actif(s)
                    </span>
                    <span className="badge bg-warning bg-opacity-10 text-warning">
                      {stats.inactive} inactif(s)
                    </span>
                  </div>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <button
                  onClick={() => fetchRoles && fetchRoles()}
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faRefresh} spin={loading} />
                  Rafraîchir
                </button>
              </div>
            </div>

            {/* Messages d'alerte */}
            {error && (
              <div
                className="alert alert-warning alert-dismissible fade show mt-3 mb-0"
                role="alert"
              >
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className="me-2"
                  />
                  <div>
                    <strong>Attention:</strong> {error}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={clearError}
                  aria-label="Close"
                ></button>
              </div>
            )}

            {successMessage && (
              <div
                className="alert alert-success alert-dismissible fade show mt-3 mb-0"
                role="alert"
              >
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                  <div>
                    <strong>Succès:</strong> {successMessage}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSuccessMessage(null)}
                  aria-label="Close"
                ></button>
              </div>
            )}
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
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="actif">Actif</option>
                    <option value="inactif">Inactif</option>
                    <option value="suspendu">Suspendu</option>
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
                    onChange={(e) => setSelectedType(e.target.value)}
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
                    <FontAwesomeIcon icon={faFilter} className="text-muted" />
                  </span>
                  <select
                    className="form-select border-start-0 ps-0"
                    value={currentPagination.limit}
                    onChange={(e) => handleLimitChange(Number(e.target.value))}
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
                    Total: <strong>{currentPagination.total}</strong> rôles
                    {filteredRoles.length !== currentPagination.total && (
                      <>
                        {" "}
                        | Filtrés: <strong>{filteredRoles.length}</strong>
                      </>
                    )}
                  </small>
                </div>
              </div>

              <div className="col-md-6 text-end">
                <button
                  onClick={resetFilters}
                  className="btn btn-sm btn-outline-secondary"
                  disabled={loading}
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          </div>

          {/* Tableau des rôles */}
          <div className="table-responsive">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-3">Chargement des rôles...</p>
              </div>
            ) : (
              <>
                {roles.length === 0 ? (
                  <div className="text-center py-5">
                    <div
                      className="alert alert-info mx-auto"
                      style={{ maxWidth: "500px" }}
                    >
                      <div className="d-flex flex-column align-items-center">
                        <FontAwesomeIcon
                          icon={faShield}
                          className="fs-1 mb-3 text-info"
                        />
                        <h5 className="alert-heading mb-2">
                          Aucun rôle trouvé
                        </h5>
                        <p className="mb-0 text-center">
                          Aucun rôle n'a été créé dans le système ou une erreur
                          est survenue.
                        </p>
                        <button
                          onClick={() => fetchRoles && fetchRoles()}
                          className="btn btn-outline-primary mt-3"
                        >
                          <FontAwesomeIcon icon={faRefresh} className="me-2" />
                          Réessayer
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: "60px" }} className="text-center">
                            #
                          </th>
                          <th style={{ width: "180px" }}>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                              onClick={() => requestSort("name")}
                            >
                              <FontAwesomeIcon
                                icon={faShield}
                                className="me-1"
                              />
                              Nom du Rôle
                              {getSortIcon("name")}
                            </button>
                          </th>
                          <th style={{ width: "120px" }}>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
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
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
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
                            style={{ width: "120px" }}
                            className="text-center"
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.map((role, index) => (
                          <tr key={role.uuid} className="align-middle">
                            <td className="text-center text-muted fw-semibold">
                              {(currentPagination.page - 1) *
                                currentPagination.limit +
                                index +
                                1}
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                  <div
                                    className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center"
                                    style={{ width: "40px", height: "40px" }}
                                  >
                                    <FontAwesomeIcon icon={faShield} />
                                  </div>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                  <div className="fw-semibold">{role.name}</div>
                                  <div className="small">
                                    <button
                                      className="btn btn-link p-0 text-decoration-none text-muted"
                                      onClick={() => copyToClipboard(role.uuid)}
                                      title="Copier l'UUID"
                                    >
                                      <small>
                                        {role.uuid?.substring(0, 8) || "N/A"}...
                                        <FontAwesomeIcon
                                          icon={faCopy}
                                          className="ms-1 fs-10"
                                        />
                                      </small>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25">
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
                                <small className="text-muted mt-1">
                                  Modifié: {formatDateOnly(role.updatedAt)}
                                </small>
                              </div>
                            </td>
                            <td className="text-center">
                              <div
                                className="btn-group btn-group-sm"
                                role="group"
                              >
                                <button
                                  className="btn btn-outline-primary"
                                  title="Voir détails"
                                  onClick={() => {
                                    // Navigation vers la page de détail
                                    window.location.href = `/dashboard-admin/roles/${role.uuid}`;
                                  }}
                                  disabled={loading}
                                >
                                  <FontAwesomeIcon icon={faEye} />
                                </button>

                                <button
                                  className={`btn ${role.status === "actif" ? "btn-outline-warning" : "btn-outline-success"}`}
                                  title={
                                    role.status === "actif"
                                      ? "Désactiver"
                                      : "Activer"
                                  }
                                  onClick={() => handleToggleStatus(role)}
                                  disabled={
                                    loading || actionLoading || role.is_deleted
                                  }
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
                                  onClick={() => openDeleteModal(role)}
                                  disabled={loading || role.is_deleted}
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
                    {currentPagination.total > currentPagination.limit && (
                      <Pagination
                        currentPage={currentPagination.page}
                        totalPages={currentPagination.pages}
                        totalItems={filteredRoles.length}
                        itemsPerPage={currentPagination.limit}
                        indexOfFirstItem={
                          (currentPagination.page - 1) * currentPagination.limit
                        }
                        onPageChange={handlePageChange}
                        onLimitChange={handleLimitChange}
                      />
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Styles inline */}
      <style jsx>{`
        .btn-group-sm > .btn {
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
        }

        .table > :not(caption) > * > * {
          padding: 0.75rem 0.5rem;
          vertical-align: middle;
        }

        .fs-10 {
          font-size: 10px !important;
        }

        .fs-12 {
          font-size: 12px !important;
        }

        .text-truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .badge {
          border-radius: 20px !important;
          font-weight: 500;
        }

        .card {
          transition: transform 0.2s ease;
        }

        .card:hover {
          transform: translateY(-2px);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner-border {
          width: 3rem;
          height: 3rem;
        }
      `}</style>
    </>
  );
}
