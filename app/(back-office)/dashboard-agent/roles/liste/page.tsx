// app/(back-office)/dashboard-admin/roles/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
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
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";
import { useRouter } from "next/navigation";

// Interface Role
interface Role {
  uuid: string;
  name: string;
  feature: string;
  status: string;
  is_deleted: boolean;
  created_at: string;
  updatedAt?: string;
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
          <FontAwesomeIcon icon={faBan} className="fs-12" />
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
  role: Role | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  if (!show || !role) return null;

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
      }).format(date);
    } catch {
      return "N/A";
    }
  };

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
    <div className="p-4 border-top">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        <div className="text-muted">
          Affichage de{" "}
          <span className="fw-semibold">{indexOfFirstItem + 1}</span> à{" "}
          <span className="fw-semibold">{indexOfLastItem}</span> sur{" "}
          <span className="fw-semibold">{totalItems}</span> rôles
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

            {/* Dernière page */}
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

  // États pour la pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  // États pour les modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // États pour les filtres et recherche
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Role;
    direction: "asc" | "desc";
  } | null>(null);

  // États pour les messages
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Options pour les éléments par page
  const itemsPerPageOptions = [5, 10, 20, 50];

  // Calculer les statistiques basées sur les données réelles
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
    };
  }, [roles]);

  // Fonction pour charger les rôles
  const fetchRoles = async (params?: {
    page?: number;
    limit?: number;
    filters?: any;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(API_ENDPOINTS.ROLES.LIST);

      console.log("📦 API Response:", response); // Debug log

      // Vérifier si la réponse est un tableau
      if (Array.isArray(response)) {
        // L'API retourne directement un tableau
        const rolesData = response as Role[];
        setRoles(rolesData);
        setTotal(rolesData.length);
        setPages(Math.ceil(rolesData.length / (params?.limit || limit)));

        console.log(`✅ Loaded ${rolesData.length} roles`);
      } else if (response && response.data && Array.isArray(response.data)) {
        // L'API retourne une structure paginée { data: [], total: X, pages: Y }
        setRoles(response.data);
        setTotal(response.total || response.data.length || 0);
        setPages(
          response.pages ||
            Math.ceil((response.data.length || 0) / (params?.limit || limit)),
        );

        console.log(`✅ Loaded ${response.data.length} roles (paginated)`);
      } else {
        console.error("❌ Invalid API response structure:", response);
        setRoles([]);
        setTotal(0);
        setPages(1);
      }

      if (params?.page) setPage(params.page);
      if (params?.limit) setLimit(params.limit);
    } catch (err: any) {
      console.error("❌ Erreur lors du chargement des rôles:", err);
      setError(err.message || "Erreur lors du chargement des rôles");
      setRoles([]);
      setTotal(0);
      setPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour supprimer un rôle
  const deleteRole = async (uuid: string) => {
    try {
      await api.delete(API_ENDPOINTS.ROLES.DELETE(uuid));
      return true;
    } catch (err: any) {
      console.error("Erreur lors de la suppression du rôle:", err);
      throw new Error(err.message || "Erreur lors de la suppression");
    }
  };

  // Fonction pour basculer le statut d'un rôle
  const toggleRoleStatus = async (uuid: string, isActive: boolean) => {
    try {
      await api.put(API_ENDPOINTS.ROLES.UPDATE(uuid), {
        status: isActive ? "actif" : "inactif",
      });
      return true;
    } catch (err: any) {
      console.error("Erreur lors du changement de statut:", err);
      throw new Error(err.message || "Erreur lors du changement de statut");
    }
  };

  // Charger les rôles au montage
  useEffect(() => {
    fetchRoles();
  }, []);

  // Gérer les changements de pagination et filtres avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const filters: any = {};

      if (searchTerm) filters.search = searchTerm;
      if (selectedStatus !== "all") filters.status = selectedStatus;
      if (selectedType !== "all") filters.type = selectedType;

      fetchRoles({
        page: page,
        limit: limit,
        filters,
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [page, limit, searchTerm, selectedStatus, selectedType]);

  // Fonction pour gérer la création d'un rôle
  const handleRoleCreated = () => {
    setSuccessMessage("Rôle créé avec succès !");
    fetchRoles();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Fonction pour gérer la modification d'un rôle
  const handleRoleUpdated = () => {
    setSuccessMessage("Rôle modifié avec succès !");
    fetchRoles();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Fonction pour gérer la suppression d'un rôle
  const handleDeleteRole = async () => {
    if (!selectedRole) return;

    try {
      setActionLoading(true);
      await deleteRole(selectedRole.uuid);

      setShowDeleteModal(false);
      setSelectedRole(null);

      setSuccessMessage("Rôle supprimé avec succès");
      setTimeout(() => setSuccessMessage(null), 3000);

      // Recharger les données
      fetchRoles();
    } catch (err: any) {
      console.error("Erreur lors de la suppression:", err);
      setSuccessMessage(`Erreur: ${err.message || "Échec de la suppression"}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Fonction pour ouvrir le modal de suppression
  const openDeleteModal = (role: Role) => {
    setSelectedRole(role);
    setShowDeleteModal(true);
  };

  // Fonction pour basculer le statut d'un rôle
  const handleToggleStatus = async (role: Role) => {
    try {
      setActionLoading(true);

      const isActive = role.status === "actif";
      await toggleRoleStatus(role.uuid, !isActive);

      setSuccessMessage(
        `Rôle ${isActive ? "désactivé" : "activé"} avec succès`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);

      // Recharger les données
      fetchRoles();
    } catch (err: any) {
      console.error("Erreur lors du changement de statut:", err);
      setSuccessMessage(`Erreur: ${err.message || "Échec de l'opération"}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Fonction pour copier l'UUID dans le presse-papier
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccessMessage("UUID copié dans le presse-papier");
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  // Fonction pour naviguer vers les détails du rôle
  const navigateToRoleDetail = (uuid: string) => {
    router.push(`/dashboard-admin/roles/${uuid}`);
  };

  // Fonction de tri
  const sortRoles = (rolesList: Role[]) => {
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

      // Gérer la casse pour les comparaisons de texte
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

  // Filtrer les rôles basé sur la recherche
  const filteredRoles = useMemo(() => {
    let filtered = roles || [];

    // Filtre de recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (role) =>
          role?.name?.toLowerCase().includes(searchLower) ||
          role?.feature?.toLowerCase().includes(searchLower) ||
          role?.uuid?.toLowerCase().includes(searchLower),
      );
    }

    // Filtre par statut
    if (selectedStatus !== "all") {
      filtered = filtered.filter((role) => role?.status === selectedStatus);
    }

    // Filtre par type
    if (selectedType !== "all") {
      filtered = filtered.filter((role) => role?.name === selectedType);
    }

    return sortRoles(filtered);
  }, [roles, searchTerm, selectedStatus, selectedType, sortConfig]);

  const currentItems = useMemo(() => {
    if (!filteredRoles.length) return [];

    const start = (page - 1) * limit;
    const end = start + limit;
    return filteredRoles.slice(start, end);
  }, [filteredRoles, page, limit]);

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setSelectedType("all");
    setSortConfig(null);
    setPage(1);
  };

  // Obtenir les types de rôle uniques
  const roleTypes = useMemo(() => {
    if (!roles.length) return [];
    const types = roles.map((role) => role.name).filter(Boolean);
    return [...new Set(types)];
  }, [roles]);

  // Créer un objet pagination pour faciliter le passage aux composants enfants
  const pagination = useMemo(
    () => ({
      page,
      limit,
      total,
      pages,
    }),
    [page, limit, total, pages],
  );

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
                      {statistics.total} rôle(s)
                    </span>
                    <span className="badge bg-success bg-opacity-10 text-success">
                      {statistics.active} actif(s)
                    </span>
                    <span className="badge bg-warning bg-opacity-10 text-warning">
                      {statistics.inactive} inactif(s)
                    </span>
                    {statistics.deleted > 0 && (
                      <span className="badge bg-secondary bg-opacity-10 text-secondary">
                        {statistics.deleted} supprimé(s)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <button
                  onClick={() => fetchRoles()}
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  disabled={loading || actionLoading}
                >
                  <FontAwesomeIcon icon={faRefresh} spin={loading} />
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
                  onClick={() => setError(null)}
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
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
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
                    Total: <strong>{roles.length}</strong> rôles
                    {filteredRoles.length !== roles.length && (
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
                  disabled={loading || actionLoading}
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
                {filteredRoles.length === 0 ? (
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
                          {searchTerm ||
                          selectedStatus !== "all" ||
                          selectedType !== "all"
                            ? "Aucun rôle trouvé"
                            : "Aucun rôle disponible"}
                        </h5>
                        <p className="mb-0 text-center">
                          {searchTerm ||
                          selectedStatus !== "all" ||
                          selectedType !== "all"
                            ? "Aucun rôle ne correspond à vos critères de recherche."
                            : "Aucun rôle n'a été créé dans le système."}
                        </p>
                        {(searchTerm ||
                          selectedStatus !== "all" ||
                          selectedType !== "all") && (
                          <button
                            onClick={resetFilters}
                            className="btn btn-outline-primary mt-3"
                          >
                            <FontAwesomeIcon icon={faFilter} className="me-2" />
                            Effacer les filtres
                          </button>
                        )}
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="btn btn-primary mt-2"
                        >
                          <FontAwesomeIcon icon={faPlus} className="me-2" />
                          Créer un nouveau rôle
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
                            style={{ width: "140px" }}
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
                              backgroundColor: role.is_deleted
                                ? "#f8f9fa"
                                : "transparent",
                              opacity: role.is_deleted ? 0.7 : 1,
                            }}
                          >
                            <td className="text-center text-muted fw-semibold">
                              {(page - 1) * limit + index + 1}
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                  <div
                                    className={`${role.status === "actif" ? "bg-primary bg-opacity-10 text-primary" : "bg-secondary bg-opacity-10 text-secondary"} rounded-circle d-flex align-items-center justify-content-center`}
                                    style={{ width: "40px", height: "40px" }}
                                  >
                                    <FontAwesomeIcon icon={faShield} />
                                  </div>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                  <div className="fw-semibold">
                                    {role.name}
                                    {role.is_deleted && (
                                      <span className="ms-2">
                                        <FontAwesomeIcon
                                          icon={faTrash}
                                          className="text-secondary fs-12"
                                          title="Supprimé"
                                        />
                                      </span>
                                    )}
                                  </div>
                                  <div className="small">
                                    <button
                                      className="btn btn-link p-0 text-decoration-none text-muted"
                                      onClick={() => copyToClipboard(role.uuid)}
                                      title="Copier l'UUID"
                                    >
                                      <small>
                                        {role.uuid.substring(0, 8)}...
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
                              <span
                                className={`badge ${role.feature === "actif" ? "bg-success bg-opacity-10 text-success" : "bg-secondary bg-opacity-10 text-secondary"} border border-opacity-25`}
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
                                <button
                                  className="btn btn-outline-primary"
                                  title="Voir détails"
                                  onClick={() =>
                                    navigateToRoleDetail(role.uuid)
                                  }
                                  disabled={loading || actionLoading}
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
                                  disabled={
                                    loading || actionLoading || role.is_deleted
                                  }
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
                                  disabled={
                                    loading || actionLoading || role.is_deleted
                                  }
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
                    {filteredRoles.length > limit && (
                      <Pagination
                        currentPage={page}
                        totalPages={Math.ceil(filteredRoles.length / limit)}
                        totalItems={filteredRoles.length}
                        itemsPerPage={limit}
                        indexOfFirstItem={(page - 1) * limit}
                        onPageChange={(newPage) => setPage(newPage)}
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

        .table-hover tbody tr:hover {
          background-color: rgba(0, 0, 0, 0.03);
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .btn-group {
            flex-wrap: wrap;
          }

          .btn-group-sm > .btn {
            margin-bottom: 2px;
          }
        }
      `}</style>
    </>
  );
}
