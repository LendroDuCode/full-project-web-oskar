// app/(back-office)/dashboard-admin/utilisateurs/liste-utilisateurs-supprimes/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faEye,
  faBan,
  faCheckCircle,
  faRefresh,
  faDownload,
  faSearch,
  faFilter,
  faSort,
  faSortUp,
  faSortDown,
  faUser,
  faUserCheck,
  faUserSlash,
  faEnvelope,
  faPhone,
  faCalendar,
  faTrash,
  faHistory,
  faUndo,
  faCheckSquare,
  faSquare,
  faCheck,
  faTimes,
  faTrashAlt,
  faExclamationTriangle,
  faUsers,
  faBoxOpen,
  faFileExport,
  faChartBar,
  faInfoCircle,
  faArrowLeft,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";

// Import des services
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { api } from "@/lib/api-client";
import CreateUserModal from "../components/modals/CreateUserModal";

// Version simplifiée pour résoudre l'erreur immédiate
interface User {
  uuid: string;
  code_utilisateur?: string;
  nom: string;
  prenoms: string;
  email: string;
  telephone: string;
  deleted_at?: string;
  est_verifie: boolean;
  est_bloque: boolean;
  is_deleted?: boolean;
  role_uuid: string;
  is_admin: boolean;
  civilite_uuid?: string;
  created_at?: string;
  updated_at?: string;
  civilite?: {
    uuid: string;
    libelle: string;
  };
  role?: {
    uuid: string;
    name: string;
  };
}

// Interface local pour le composant
interface LocalUser extends Omit<
  User,
  "civilite" | "role" | "statut_matrimonial"
> {
  civilite?: {
    uuid?: string;
    libelle: string;
  };
  role?: {
    uuid?: string;
    name: string;
  };
  statut_matrimonial?: {
    uuid?: string;
    libelle: string;
  };
}

// Interface pour la pagination
interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Service pour gérer les utilisateurs supprimés
const deletedUserService = {
  // Récupérer les utilisateurs supprimés
  async getDeletedUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    is_admin?: string;
    est_bloque?: string;
    est_verifie?: string;
  }) {
    // Utiliser l'endpoint correct pour les utilisateurs supprimés
    const response = await api.get(
      API_ENDPOINTS.ADMIN.USERS.DELETED, // "/admin/liste-utilisateurs-supprimes"
    );
    return response.data;
  },

  // Restaurer un utilisateur
  async restoreUser(uuid: string) {
    const response = await api.post(API_ENDPOINTS.ADMIN.USERS.RESTORE(uuid));
    return response.data;
  },

  // Supprimer définitivement un utilisateur
  async permanentDeleteUser(uuid: string) {
    const response = await api.delete(API_ENDPOINTS.ADMIN.USERS.DELETE(uuid));
    return response.data;
  },

  // Vider la corbeille
  async emptyTrash() {
    const response = await api.delete(API_ENDPOINTS.ADMIN.USERS.EMPTY_TRASH);
    return response.data;
  },
};

// Composant de statut amélioré
const StatusBadge = ({
  est_bloque,
  est_verifie,
  is_deleted,
}: {
  est_bloque: boolean;
  est_verifie: boolean;
  is_deleted?: boolean;
}) => {
  if (is_deleted) {
    return (
      <span className="badge bg-dark bg-opacity-10 text-dark border border-dark border-opacity-25 d-inline-flex align-items-center gap-1">
        <FontAwesomeIcon icon={faTrash} className="fs-12" />
        <span>Supprimé</span>
      </span>
    );
  }

  if (est_bloque) {
    return (
      <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 d-inline-flex align-items-center gap-1">
        <FontAwesomeIcon icon={faBan} className="fs-12" />
        <span>Bloqué</span>
      </span>
    );
  }

  if (!est_verifie) {
    return (
      <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 d-inline-flex align-items-center gap-1">
        <FontAwesomeIcon icon={faUserSlash} className="fs-12" />
        <span>Non vérifié</span>
      </span>
    );
  }

  return (
    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 d-inline-flex align-items-center gap-1">
      <FontAwesomeIcon icon={faUserCheck} className="fs-12" />
      <span>Actif</span>
    </span>
  );
};

// Composant de modal de restauration
const RestoreModal = ({
  show,
  user,
  loading,
  onClose,
  onConfirm,
}: {
  show: boolean;
  user: LocalUser | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  if (!show || !user) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(2px)",
      }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-info text-white border-0">
            <h5 className="modal-title">
              <FontAwesomeIcon icon={faUndo} className="me-2" />
              Confirmer la restauration
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
              <div className="bg-info bg-opacity-10 rounded-circle p-3">
                <FontAwesomeIcon icon={faUndo} className="text-info fs-3" />
              </div>
              <div>
                <h6 className="mb-1">Restaurer l'utilisateur</h6>
                <p className="text-muted mb-0">
                  L'utilisateur sera rétabli dans la liste principale
                </p>
              </div>
            </div>

            <div className="alert alert-info border-0">
              <div className="d-flex">
                <FontAwesomeIcon icon={faInfoCircle} className="me-2 mt-1" />
                <div>
                  <p className="mb-1 fw-semibold">
                    Informations de l'utilisateur
                  </p>
                  <div className="row small">
                    <div className="col-6">
                      <span className="text-muted">Nom complet:</span>
                      <br />
                      <strong>
                        {user.nom} {user.prenoms}
                      </strong>
                    </div>
                    <div className="col-6">
                      <span className="text-muted">Email:</span>
                      <br />
                      <strong>{user.email}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="mb-0">
              Êtes-vous sûr de vouloir restaurer cet utilisateur ? Il sera
              transféré vers la liste des utilisateurs actifs.
            </p>
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
              className="btn btn-info text-white"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Restauration...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faUndo} className="me-2" />
                  Restaurer l'utilisateur
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant de modal de suppression définitive
const PermanentDeleteModal = ({
  show,
  user,
  loading,
  onClose,
  onConfirm,
}: {
  show: boolean;
  user: LocalUser | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  if (!show || !user) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(2px)",
      }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-danger text-white border-0">
            <h5 className="modal-title">
              <FontAwesomeIcon icon={faTrashAlt} className="me-2" />
              Suppression définitive
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
                <h6 className="mb-1">Suppression irréversible</h6>
                <p className="text-muted mb-0">
                  Cette action ne peut pas être annulée
                </p>
              </div>
            </div>

            <div className="alert alert-danger border-0">
              <div className="d-flex">
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="me-2 mt-1"
                />
                <div>
                  <p className="mb-1 fw-semibold">ATTENTION !</p>
                  <p className="mb-0">
                    Vous êtes sur le point de supprimer définitivement cet
                    utilisateur. Toutes les données associées seront
                    PERMANENTEMENT effacées et ne pourront pas être récupérées.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-light p-3 rounded">
              <p className="mb-2">
                <strong>Utilisateur concerné :</strong>
              </p>
              <div className="row small">
                <div className="col-6">
                  <span className="text-muted">Nom complet:</span>
                  <br />
                  <strong>
                    {user.nom} {user.prenoms}
                  </strong>
                </div>
                <div className="col-6">
                  <span className="text-muted">Email:</span>
                  <br />
                  <strong>{user.email}</strong>
                </div>
                <div className="col-6 mt-2">
                  <span className="text-muted">Téléphone:</span>
                  <br />
                  <strong>{user.telephone || "N/A"}</strong>
                </div>
                <div className="col-6 mt-2">
                  <span className="text-muted">Rôle:</span>
                  <br />
                  <strong>{user.role?.name || "Utilisateur"}</strong>
                </div>
              </div>
            </div>

            <p className="mt-3 mb-0 text-danger">
              <small>
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="me-1"
                />
                Cette action est définitive. Veuillez confirmer votre choix.
              </small>
            </p>
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
                  <FontAwesomeIcon icon={faTrashAlt} className="me-2" />
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

// Composant de modal pour vider la corbeille
const EmptyTrashModal = ({
  show,
  count,
  loading,
  onClose,
  onConfirm,
}: {
  show: boolean;
  count: number;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(2px)",
      }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-danger text-white border-0">
            <h5 className="modal-title">
              <FontAwesomeIcon icon={faBoxOpen} className="me-2" />
              Vider la corbeille
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          <div className="modal-body p-4">
            <div className="text-center mb-4">
              <div className="bg-danger bg-opacity-10 rounded-circle p-4 d-inline-block">
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="text-danger fs-1"
                />
              </div>
            </div>

            <div className="alert alert-danger border-0 text-center">
              <p className="mb-0 fw-semibold">
                Vous êtes sur le point de supprimer définitivement{" "}
                <span className="badge bg-danger">{count}</span> utilisateur(s)
              </p>
            </div>

            <p className="text-center">
              Cette action supprimera définitivement tous les utilisateurs de la
              corbeille. Aucune récupération ne sera possible.
            </p>

            <div className="text-center">
              <p className="text-muted mb-0">
                <small>
                  <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
                  Cette opération peut prendre quelques instants
                </small>
              </p>
            </div>
          </div>
          <div className="modal-footer border-0 justify-content-center">
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
                  <FontAwesomeIcon icon={faBoxOpen} className="me-2" />
                  Vider la corbeille
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
    <div className="p-4 border-top bg-light">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        <div className="text-muted">
          <span className="fw-semibold">{indexOfFirstItem + 1}</span> -{" "}
          <span className="fw-semibold">{indexOfLastItem}</span> sur{" "}
          <span className="fw-semibold">{totalItems}</span> utilisateurs
          supprimés
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

export default function ListeUtilisateursSupprimesPage() {
  // États pour les données
  const [users, setUsers] = useState<LocalUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // États pour les modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEmptyTrashModal, setShowEmptyTrashModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<LocalUser | null>(null);

  // États pour les filtres et recherche
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof LocalUser | "role.name" | "civilite.libelle";
    direction: "asc" | "desc";
  } | null>(null);

  // États pour la sélection multiple
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // États pour les messages et chargements
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [emptyTrashLoading, setEmptyTrashLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Options pour les éléments par page
  const itemsPerPageOptions = [5, 10, 20, 50];

  // Fonction pour charger les utilisateurs supprimés
  const fetchDeletedUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log(
        "🔍 Fetching deleted users from endpoint:",
        API_ENDPOINTS.ADMIN.USERS.DELETED,
      );
      const result = await api.get(API_ENDPOINTS.ADMIN.USERS.DELETED);

      console.log("🔍 API Response:", result);

      // Gérer différents formats de réponse
      let usersData: LocalUser[] = [];
      let total = 0;

      if (result.data) {
        if (Array.isArray(result.data)) {
          usersData = result.data;
          total = result.data.length;
        } else if (result.data.data && Array.isArray(result.data.data)) {
          usersData = result.data.data;
          total = result.data.count || result.data.data.length;
        } else {
          usersData = [result.data];
          total = 1;
        }
      }

      // Appliquer les filtres côté client
      let filteredUsers = usersData;

      // Filtre par recherche
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredUsers = filteredUsers.filter(
          (user) =>
            user.nom.toLowerCase().includes(searchLower) ||
            user.prenoms.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower) ||
            user.telephone?.toLowerCase().includes(searchLower),
        );
      }

      // Filtre par rôle
      if (selectedRole !== "all") {
        filteredUsers = filteredUsers.filter((user) =>
          selectedRole === "admin" ? user.is_admin : !user.is_admin,
        );
      }

      // Filtre par statut
      if (selectedStatus !== "all") {
        if (selectedStatus === "blocked") {
          filteredUsers = filteredUsers.filter((user) => user.est_bloque);
        } else if (selectedStatus === "unverified") {
          filteredUsers = filteredUsers.filter((user) => !user.est_verifie);
        }
      }

      // Appliquer le tri
      if (sortConfig) {
        filteredUsers = [...filteredUsers].sort((a, b) => {
          let aValue: any;
          let bValue: any;

          if (sortConfig.key === "role.name") {
            aValue = a.role?.name || "";
            bValue = b.role?.name || "";
          } else if (sortConfig.key === "civilite.libelle") {
            aValue = a.civilite?.libelle || "";
            bValue = b.civilite?.libelle || "";
          } else {
            aValue = a[sortConfig.key as keyof LocalUser];
            bValue = b[sortConfig.key as keyof LocalUser];
          }

          if (aValue < bValue) {
            return sortConfig.direction === "asc" ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === "asc" ? 1 : -1;
          }
          return 0;
        });
      }

      // Pagination côté client
      const startIndex = (pagination.page - 1) * pagination.limit;
      const paginatedUsers = filteredUsers.slice(
        startIndex,
        startIndex + pagination.limit,
      );

      setUsers(paginatedUsers);
      setPagination((prev) => ({
        ...prev,
        total: filteredUsers.length,
        pages: Math.ceil(filteredUsers.length / prev.limit),
      }));
    } catch (err: any) {
      console.error("❌ Error fetching deleted users:", err);
      setError(
        err.message || "Erreur lors du chargement des utilisateurs supprimés",
      );
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [
    pagination.page,
    pagination.limit,
    searchTerm,
    selectedRole,
    selectedStatus,
    sortConfig,
  ]);

  // Fonction pour restaurer un utilisateur
  const restoreUser = useCallback(
    async (uuid: string) => {
      try {
        const result = await deletedUserService.restoreUser(uuid);

        // Recharger la liste
        await fetchDeletedUsers();

        return result.data;
      } catch (err: any) {
        throw new Error(
          err.message || "Erreur lors de la restauration de l'utilisateur",
        );
      }
    },
    [fetchDeletedUsers],
  );

  // Fonction pour supprimer définitivement un utilisateur
  const permanentDeleteUser = useCallback(
    async (uuid: string) => {
      try {
        await deletedUserService.permanentDeleteUser(uuid);

        // Recharger la liste
        await fetchDeletedUsers();

        return true;
      } catch (err: any) {
        throw new Error(
          err.message ||
            "Erreur lors de la suppression définitive de l'utilisateur",
        );
      }
    },
    [fetchDeletedUsers],
  );

  // Fonction pour vider la corbeille
  const emptyTrash = useCallback(async () => {
    try {
      await deletedUserService.emptyTrash();

      // Recharger la liste
      await fetchDeletedUsers();

      return true;
    } catch (err: any) {
      throw new Error(err.message || "Erreur lors du vidage de la corbeille");
    }
  }, [fetchDeletedUsers]);

  // Fonctions de pagination
  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  // Fonction de rafraîchissement
  const refresh = useCallback(() => {
    return fetchDeletedUsers();
  }, [fetchDeletedUsers]);

  // Charger les utilisateurs supprimés au montage et quand les dépendances changent
  useEffect(() => {
    fetchDeletedUsers();
  }, [fetchDeletedUsers]);

  // Fonction pour restaurer un utilisateur (avec modal)
  const handleRestoreUser = async () => {
    if (!selectedUser) return;

    try {
      setRestoreLoading(true);
      await restoreUser(selectedUser.uuid);

      setShowRestoreModal(false);
      setSelectedUser(null);
      setSuccessMessage("Utilisateur restauré avec succès");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Erreur lors de la restauration:", err);
      setInfoMessage(err.message || "Erreur lors de la restauration");
    } finally {
      setRestoreLoading(false);
    }
  };

  // Fonction pour supprimer définitivement un utilisateur (avec modal)
  const handlePermanentDelete = async () => {
    if (!selectedUser) return;

    try {
      setDeleteLoading(true);
      await permanentDeleteUser(selectedUser.uuid);

      setShowDeleteModal(false);
      setSelectedUser(null);
      setSuccessMessage("Utilisateur supprimé définitivement avec succès");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Erreur lors de la suppression définitive:", err);
      setInfoMessage(err.message || "Erreur lors de la suppression");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Fonction pour vider la corbeille
  const handleEmptyTrash = async () => {
    try {
      setEmptyTrashLoading(true);
      await emptyTrash();

      setShowEmptyTrashModal(false);
      setSuccessMessage("Corbeille vidée avec succès");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Erreur lors du vidage de la corbeille:", err);
      setInfoMessage(err.message || "Erreur lors du vidage de la corbeille");
    } finally {
      setEmptyTrashLoading(false);
    }
  };

  // Fonction appelée après création réussie d'un utilisateur
  const handleUserCreated = () => {
    setSuccessMessage("Utilisateur créé avec succès !");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Fonction pour ouvrir le modal de restauration
  const openRestoreModal = (utilisateur: LocalUser) => {
    setSelectedUser(utilisateur);
    setShowRestoreModal(true);
  };

  // Fonction pour ouvrir le modal de suppression définitive
  const openDeleteModal = (utilisateur: LocalUser) => {
    setSelectedUser(utilisateur);
    setShowDeleteModal(true);
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

  // Fonction de tri
  const requestSort = (
    key: keyof LocalUser | "role.name" | "civilite.libelle",
  ) => {
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

  const getSortIcon = (
    key: keyof LocalUser | "role.name" | "civilite.libelle",
  ) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <FontAwesomeIcon icon={faSort} className="text-muted ms-1" />;
    }
    return sortConfig.direction === "asc" ? (
      <FontAwesomeIcon icon={faSortUp} className="text-primary ms-1" />
    ) : (
      <FontAwesomeIcon icon={faSortDown} className="text-primary ms-1" />
    );
  };

  // Gestion de la sélection multiple
  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      const allUserIds = users.map((user) => user.uuid);
      setSelectedUsers(allUserIds);
    }
    setSelectAll(!selectAll);
  };

  // Actions en masse
  const handleBulkAction = async (action: "restore" | "delete") => {
    if (selectedUsers.length === 0) {
      setInfoMessage("Veuillez sélectionner au moins un utilisateur");
      setTimeout(() => setInfoMessage(null), 3000);
      return;
    }

    try {
      setBulkActionLoading(true);
      let successCount = 0;
      let errorCount = 0;

      for (const userId of selectedUsers) {
        try {
          if (action === "restore") {
            await restoreUser(userId);
          } else if (action === "delete") {
            await permanentDeleteUser(userId);
          }
          successCount++;
        } catch (err) {
          console.error(`Erreur pour l'utilisateur ${userId}:`, err);
          errorCount++;
        }
      }

      setSuccessMessage(
        `${successCount} utilisateur(s) ${action === "restore" ? "restauré(s)" : "supprimé(s)"} avec succès${errorCount > 0 ? ` (${errorCount} échec(s))` : ""}`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);

      // Réinitialiser la sélection
      setSelectedUsers([]);
      setSelectAll(false);
    } catch (err) {
      console.error("Erreur lors de l'action en masse:", err);
      setInfoMessage("Erreur lors de l'action en masse");
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Fallback CSV export
  const handleCSVExport = () => {
    if (users.length === 0) return;

    const csvContent = [
      [
        "Nom",
        "Prénoms",
        "Email",
        "Téléphone",
        "Civilité",
        "Rôle",
        "Statut",
        "Date de suppression",
        "Créé le",
        "Supprimé le",
      ],
      ...users.map((u) => [
        u.nom || "",
        u.prenoms || "",
        u.email || "",
        u.telephone || "",
        u.civilite?.libelle || "Non spécifié",
        u.role?.name || "Utilisateur",
        "Supprimé",
        formatDate(u.deleted_at),
        formatDate(u.created_at),
        formatDate(u.deleted_at),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `utilisateurs-supprimes-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSuccessMessage("Export CSV réussi");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedRole("all");
    setSelectedStatus("all");
    setSortConfig(null);
    setPagination((prev) => ({ ...prev, page: 1 }));
    setSelectedUsers([]);
    setSelectAll(false);
  };

  // Effet pour mettre à jour selectAll quand on change de page ou de sélection
  useEffect(() => {
    if (users.length > 0) {
      const allSelected = users.every((user) =>
        selectedUsers.includes(user.uuid),
      );
      setSelectAll(allSelected);
    } else {
      setSelectAll(false);
    }
  }, [selectedUsers, users]);

  // Calculer le temps écoulé depuis la suppression
  const getTimeSinceDeletion = (deletedAt: string | null | undefined) => {
    if (!deletedAt) return "N/A";

    const deletedDate = new Date(deletedAt);
    const now = new Date();
    const diffMs = now.getTime() - deletedDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        if (diffMinutes === 0) {
          return "À l'instant";
        }
        return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}`;
      }
      return `Il y a ${diffHours} heure${diffHours > 1 ? "s" : ""}`;
    } else if (diffDays === 1) {
      return "Hier";
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Il y a ${weeks} semaine${weeks > 1 ? "s" : ""}`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `Il y a ${months} mois`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `Il y a ${years} an${years > 1 ? "s" : ""}`;
    }
  };

  return (
    <>
      {/* Modal de création d'utilisateur */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleUserCreated}
      />

      {/* Modals de gestion des utilisateurs supprimés */}
      <RestoreModal
        show={showRestoreModal}
        user={selectedUser}
        loading={restoreLoading}
        onClose={() => {
          setShowRestoreModal(false);
          setSelectedUser(null);
        }}
        onConfirm={handleRestoreUser}
      />

      <PermanentDeleteModal
        show={showDeleteModal}
        user={selectedUser}
        loading={deleteLoading}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedUser(null);
        }}
        onConfirm={handlePermanentDelete}
      />

      <EmptyTrashModal
        show={showEmptyTrashModal}
        count={pagination.total}
        loading={emptyTrashLoading}
        onClose={() => setShowEmptyTrashModal(false)}
        onConfirm={handleEmptyTrash}
      />

      <div className="p-3 p-md-4">
        {/* Messages d'alerte */}
        {error && (
          <div
            className="alert alert-warning alert-dismissible fade show mb-4"
            role="alert"
          >
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            <strong>Attention:</strong> {error}
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
            className="alert alert-success alert-dismissible fade show mb-4"
            role="alert"
          >
            <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
            <strong>Succès:</strong> {successMessage}
            <button
              type="button"
              className="btn-close"
              onClick={() => setSuccessMessage(null)}
              aria-label="Close"
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
              aria-label="Close"
            ></button>
          </div>
        )}

        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="card-header bg-white border-0 py-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div>
                <div className="d-flex align-items-center gap-3">
                  <h2 className="h4 mb-0 fw-bold">
                    Liste des Utilisateurs Supprimés
                  </h2>
                  <span className="badge bg-dark bg-opacity-10 text-dark border border-dark">
                    {pagination.total} utilisateur(s) supprimé(s)
                    {selectedUsers.length > 0 && (
                      <span className="ms-2 badge bg-primary">
                        {selectedUsers.length} sélectionné(s)
                      </span>
                    )}
                  </span>
                </div>
                <p className="text-muted mb-0 mt-2">
                  Gérez les utilisateurs qui ont été supprimés du système
                </p>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <button
                  onClick={() => refresh()}
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faRefresh} spin={loading} />
                  Rafraîchir
                </button>

                <button
                  onClick={handleCSVExport}
                  className="btn btn-outline-primary d-flex align-items-center gap-2"
                  disabled={users.length === 0 || loading}
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Exporter CSV
                </button>

                {pagination.total > 0 && (
                  <button
                    onClick={() => setShowEmptyTrashModal(true)}
                    className="btn btn-danger d-flex align-items-center gap-2"
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={faBoxOpen} />
                    Vider la corbeille
                  </button>
                )}

                <Link
                  href="/dashboard-admin/utilisateurs/liste-utilisateurs"
                  className="btn btn-outline-success d-flex align-items-center gap-2"
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                  Retour aux utilisateurs
                </Link>
              </div>
            </div>
          </div>

          {/* Barre d'actions en masse */}
          {selectedUsers.length > 0 && (
            <div className="p-3 border-bottom bg-warning bg-opacity-10">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                <div className="d-flex align-items-center gap-2">
                  <FontAwesomeIcon icon={faUsers} className="text-warning" />
                  <span className="fw-semibold">
                    {selectedUsers.length} utilisateur(s) sélectionné(s)
                  </span>
                </div>

                <div className="d-flex flex-wrap gap-2">
                  <button
                    className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                    onClick={() => handleBulkAction("restore")}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faUndo} />
                    <span>Restaurer la sélection</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                    onClick={() => handleBulkAction("delete")}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                    <span>Supprimer définitivement</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1"
                    onClick={() => {
                      setSelectedUsers([]);
                      setSelectAll(false);
                    }}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                    <span>Annuler la sélection</span>
                  </button>
                </div>
              </div>
            </div>
          )}

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
                    placeholder="Rechercher parmi les utilisateurs supprimés..."
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
                    <option value="blocked">Étaient bloqués</option>
                    <option value="unverified">Non vérifiés</option>
                  </select>
                </div>
              </div>

              <div className="col-md-2">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faUser} className="text-muted" />
                  </span>
                  <select
                    className="form-select border-start-0 ps-0"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  >
                    <option value="all">Tous les rôles</option>
                    <option value="admin">Admins</option>
                    <option value="user">Utilisateurs</option>
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
                    value={pagination.limit}
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

              <div className="col-md-1">
                <button
                  onClick={resetFilters}
                  className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2"
                  disabled={loading}
                  title="Réinitialiser les filtres"
                >
                  <FontAwesomeIcon icon={faTimes} />
                  <span className="d-none d-md-inline">Reset</span>
                </button>
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-md-6">
                <div className="d-flex align-items-center gap-2">
                  <small className="text-muted">
                    Résultats: <strong>{pagination.total}</strong>{" "}
                    utilisateur(s) supprimé(s)
                    {searchTerm && (
                      <>
                        {" "}
                        pour "<strong>{searchTerm}</strong>"
                      </>
                    )}
                  </small>
                </div>
              </div>

              <div className="col-md-6 text-end">
                <div className="d-flex align-items-center gap-2 justify-content-end">
                  {selectedUsers.length > 0 && (
                    <small className="text-primary fw-semibold">
                      {selectedUsers.length} sélectionné(s)
                    </small>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tableau des utilisateurs supprimés */}
          <div className="table-responsive">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-secondary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-3">Chargement des utilisateurs supprimés...</p>
              </div>
            ) : (
              <>
                {users.length === 0 ? (
                  <div className="text-center py-5">
                    <div
                      className="alert alert-info mx-auto border-0"
                      style={{ maxWidth: "500px" }}
                    >
                      <div className="bg-info bg-opacity-10 rounded-circle p-4 d-inline-block mb-3">
                        <FontAwesomeIcon
                          icon={faTrash}
                          className="fs-1 text-info"
                        />
                      </div>
                      <h5 className="alert-heading">
                        {searchTerm ||
                        selectedRole !== "all" ||
                        selectedStatus !== "all"
                          ? "Aucun résultat trouvé"
                          : "Aucun utilisateur supprimé"}
                      </h5>
                      <p className="mb-0">
                        {searchTerm ||
                        selectedRole !== "all" ||
                        selectedStatus !== "all"
                          ? "Aucun utilisateur supprimé ne correspond à vos critères de recherche. Essayez de modifier vos filtres."
                          : "La corbeille est vide. Aucun utilisateur n'a été supprimé."}
                      </p>
                      <div className="mt-3">
                        {(searchTerm ||
                          selectedRole !== "all" ||
                          selectedStatus !== "all") && (
                          <button
                            onClick={resetFilters}
                            className="btn btn-outline-secondary me-2"
                          >
                            <FontAwesomeIcon icon={faTimes} className="me-2" />
                            Réinitialiser les filtres
                          </button>
                        )}
                        <Link
                          href="/dashboard-admin/utilisateurs/liste-utilisateurs"
                          className="btn btn-outline-primary"
                        >
                          <FontAwesomeIcon
                            icon={faArrowLeft}
                            className="me-2"
                          />
                          Retour aux utilisateurs actifs
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: "50px" }} className="text-center">
                            <div className="form-check">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={selectAll && users.length > 0}
                                onChange={handleSelectAll}
                                disabled={users.length === 0}
                                title={
                                  selectAll
                                    ? "Tout désélectionner"
                                    : "Tout sélectionner"
                                }
                              />
                            </div>
                          </th>
                          <th style={{ width: "60px" }} className="text-center">
                            #
                          </th>
                          <th style={{ width: "180px" }}>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                              onClick={() => requestSort("nom")}
                            >
                              Nom & Prénoms
                              {getSortIcon("nom")}
                            </button>
                          </th>
                          <th style={{ width: "180px" }}>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                              onClick={() => requestSort("email")}
                            >
                              <FontAwesomeIcon
                                icon={faEnvelope}
                                className="me-1"
                              />
                              Email
                              {getSortIcon("email")}
                            </button>
                          </th>
                          <th style={{ width: "140px" }}>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                              onClick={() => requestSort("telephone")}
                            >
                              <FontAwesomeIcon
                                icon={faPhone}
                                className="me-1"
                              />
                              Téléphone
                              {getSortIcon("telephone")}
                            </button>
                          </th>
                          <th style={{ width: "100px" }}>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                              onClick={() => requestSort("civilite.libelle")}
                            >
                              Civilité
                              {getSortIcon("civilite.libelle")}
                            </button>
                          </th>
                          <th style={{ width: "120px" }}>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                              onClick={() => requestSort("role.name")}
                            >
                              Rôle
                              {getSortIcon("role.name")}
                            </button>
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
                          <th style={{ width: "150px" }}>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                              onClick={() => requestSort("deleted_at")}
                            >
                              <FontAwesomeIcon
                                icon={faHistory}
                                className="me-1"
                              />
                              Supprimé il y a
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
                        {users.map((utilisateur, index) => (
                          <tr
                            key={utilisateur.uuid}
                            className={`align-middle ${selectedUsers.includes(utilisateur.uuid) ? "table-active" : ""}`}
                          >
                            <td className="text-center">
                              <div className="form-check">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={selectedUsers.includes(
                                    utilisateur.uuid,
                                  )}
                                  onChange={() =>
                                    handleSelectUser(utilisateur.uuid)
                                  }
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
                                    className="bg-dark bg-opacity-10 text-dark rounded-circle d-flex align-items-center justify-content-center"
                                    style={{ width: "40px", height: "40px" }}
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </div>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                  <div className="fw-semibold">
                                    {utilisateur.nom} {utilisateur.prenoms}
                                  </div>
                                  {utilisateur.is_admin && (
                                    <span className="badge bg-info bg-opacity-10 text-info fs-11 px-2 py-1">
                                      Admin
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <FontAwesomeIcon
                                  icon={faEnvelope}
                                  className="text-muted me-2"
                                />
                                <div
                                  className="text-truncate"
                                  style={{ maxWidth: "180px" }}
                                  title={utilisateur.email}
                                >
                                  {utilisateur.email}
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <FontAwesomeIcon
                                  icon={faPhone}
                                  className="text-muted me-2"
                                />
                                <span className="font-monospace">
                                  {utilisateur.telephone}
                                </span>
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark border">
                                {utilisateur.civilite?.libelle || "N/A"}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`badge ${utilisateur.is_admin ? "bg-primary" : "bg-secondary"} bg-opacity-10 text-dark border`}
                              >
                                {utilisateur.role?.name || "Utilisateur"}
                              </span>
                            </td>
                            <td>
                              <StatusBadge
                                est_bloque={utilisateur.est_bloque || false}
                                est_verifie={utilisateur.est_verifie || false}
                                is_deleted={utilisateur.is_deleted || true}
                              />
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <FontAwesomeIcon
                                  icon={faCalendar}
                                  className="text-muted me-2"
                                />
                                <small className="text-muted">
                                  {formatDate(utilisateur.created_at)}
                                </small>
                              </div>
                            </td>
                            <td>
                              <div className="d-flex flex-column">
                                <div className="d-flex align-items-center">
                                  <FontAwesomeIcon
                                    icon={faHistory}
                                    className="text-secondary me-2"
                                  />
                                  <small className="text-secondary fw-semibold">
                                    {getTimeSinceDeletion(
                                      utilisateur.deleted_at,
                                    )}
                                  </small>
                                </div>
                                <small className="text-muted">
                                  {formatDate(utilisateur.deleted_at)}
                                </small>
                              </div>
                            </td>
                            <td className="text-center">
                              <div
                                className="btn-group btn-group-sm"
                                role="group"
                              >
                                <button
                                  className="btn btn-outline-info"
                                  title="Restaurer"
                                  onClick={() => openRestoreModal(utilisateur)}
                                  disabled={loading}
                                >
                                  <FontAwesomeIcon icon={faUndo} />
                                </button>
                                <button
                                  className="btn btn-outline-danger"
                                  title="Supprimer définitivement"
                                  onClick={() => openDeleteModal(utilisateur)}
                                  disabled={loading}
                                >
                                  <FontAwesomeIcon icon={faTrashAlt} />
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
                        totalItems={pagination.total}
                        itemsPerPage={pagination.limit}
                        indexOfFirstItem={
                          (pagination.page - 1) * pagination.limit
                        }
                        onPageChange={setPage}
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

        .font-monospace {
          font-family:
            "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier,
            monospace;
        }

        .table > :not(caption) > * > * {
          padding: 0.75rem 0.5rem;
          vertical-align: middle;
        }

        .table-active {
          background-color: rgba(13, 110, 253, 0.05) !important;
        }

        .form-check-input:checked {
          background-color: #0d6efd;
          border-color: #0d6efd;
        }

        .form-check-input:focus {
          border-color: #86b7fe;
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
        }
      `}</style>
    </>
  );
}
