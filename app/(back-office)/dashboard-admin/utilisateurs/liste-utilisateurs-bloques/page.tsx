// app/(back-office)/dashboard-admin/utilisateurs/liste-utilisateurs-bloques/page.tsx
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
  faUserShield,
  faUserSlash,
  faEnvelope,
  faPhone,
  faCalendar,
  faTrash,
  faHistory,
  faLockOpen,
  faCheckSquare,
  faSquare,
  faCheck,
  faTimes,
  faUsers,
  faInfoCircle,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";

// Import des services
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { api } from "@/lib/api-client";

// Interface local pour le composant
interface LocalUser {
  uuid: string;
  nom: string;
  prenoms: string;
  email: string;
  telephone: string;
  civilite_uuid?: string;
  role_uuid: string;
  est_verifie: boolean;
  est_bloque: boolean;
  is_admin: boolean;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
  civilite?: {
    libelle: string;
  };
  role?: {
    name: string;
  };
  code_utilisateur?: string;
  avatar?: string;
  date_naissance?: string;
}

// Interface pour la réponse API
interface ApiResponse {
  data: LocalUser[];
  count: number;
  status: string;
}

// Interface pour la pagination
interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Composant de statut
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
      <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 d-inline-flex align-items-center gap-1">
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

// Composant de modal de déblocage
const UnblockModal = ({
  show,
  user,
  loading,
  onClose,
  onConfirm,
  type = "single",
  count = 0,
}: {
  show: boolean;
  user: LocalUser | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type?: "single" | "multiple";
  count?: number;
}) => {
  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title text-warning">
              <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
              {type === "multiple"
                ? "Déblocage multiple"
                : "Confirmer le déblocage"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          <div className="modal-body">
            {type === "single" && user ? (
              <>
                <p>
                  Êtes-vous sûr de vouloir débloquer l'utilisateur{" "}
                  <strong>
                    {user.nom} {user.prenoms}
                  </strong>{" "}
                  ({user.email}) ?
                </p>
                <p className="text-warning mb-0">
                  <small>
                    L'utilisateur pourra à nouveau se connecter à son compte.
                  </small>
                </p>
              </>
            ) : (
              <>
                <p>
                  Êtes-vous sûr de vouloir débloquer <strong>{count}</strong>{" "}
                  utilisateur(s) sélectionné(s) ?
                </p>
                <p className="text-warning mb-0">
                  <small>
                    Les utilisateurs pourront à nouveau se connecter à leur
                    compte.
                  </small>
                </p>
              </>
            )}
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
              className="btn btn-warning"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Déblocage...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                  {type === "multiple"
                    ? `Débloquer ${count} utilisateur(s)`
                    : "Débloquer l'utilisateur"}
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
          <span className="fw-semibold">{totalItems}</span> utilisateurs bloqués
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

export default function ListeUtilisateursBloquesPage() {
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
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [showUnblockMultipleModal, setShowUnblockMultipleModal] =
    useState(false);
  const [selectedUser, setSelectedUser] = useState<LocalUser | null>(null);

  // États pour les filtres et recherche
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof LocalUser | "role.name" | "civilite.libelle";
    direction: "asc" | "desc";
  } | null>(null);

  // États pour la sélection multiple
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // États pour les messages et chargements
  const [unblockLoading, setUnblockLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Options pour les éléments par page
  const itemsPerPageOptions = [5, 10, 20, 50];

  // Fonction pour charger les utilisateurs bloqués
  const fetchBlockedUsers = useCallback(
    async (params?: {
      page?: number;
      limit?: number;
      search?: string;
      is_admin?: string;
    }) => {
      setLoading(true);
      setError(null);

      try {
        console.log("📡 Chargement des utilisateurs bloqués...");

        // Construire les paramètres de requête
        const queryParams = new URLSearchParams();
        queryParams.append("est_bloque", "true"); // On ne charge que les bloqués

        if (params?.page) queryParams.append("page", params.page.toString());
        if (params?.limit) queryParams.append("limit", params.limit.toString());
        if (params?.search) queryParams.append("search", params.search);
        if (params?.is_admin) queryParams.append("is_admin", params.is_admin);

        // Utiliser l'endpoint LIST avec le filtre est_bloque
        // ou utiliser l'endpoint BLOCKED spécifique
        const endpoint = `${API_ENDPOINTS.ADMIN.USERS.LIST}?${queryParams.toString()}`;
        console.log("📡 Endpoint:", endpoint);

        const response = await api.get<ApiResponse>(endpoint);
        console.log("📥 Réponse API:", response);

        if (response && response.data && Array.isArray(response.data)) {
          setUsers(response.data);
          setPagination({
            page: params?.page || 1,
            limit: params?.limit || pagination.limit,
            total: response.count || response.data.length,
            pages: Math.ceil(
              (response.count || response.data.length) /
                (params?.limit || pagination.limit),
            ),
          });
        } else {
          console.warn("⚠️ Structure de réponse inattendue:", response);
          setUsers([]);
          setPagination((prev) => ({ ...prev, total: 0, pages: 1 }));
        }
      } catch (err: any) {
        console.error("❌ Erreur lors du chargement:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Erreur lors du chargement des utilisateurs bloqués",
        );
        setUsers([]);
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit],
  );

  // Fonction pour mettre à jour un utilisateur
  const updateUser = useCallback(
    async (uuid: string, data: Partial<LocalUser>) => {
      try {
        const response = await api.put(
          API_ENDPOINTS.ADMIN.USERS.UPDATE(uuid),
          data,
        );

        if (response.data) {
          // Mettre à jour localement
          setUsers((prev) =>
            prev.map((user) =>
              user.uuid === uuid ? { ...user, ...response.data } : user,
            ),
          );
          return response.data;
        }
      } catch (err: any) {
        console.error("❌ Erreur lors de la mise à jour:", err);
        throw err;
      }
    },
    [],
  );

  // Fonction pour débloquer un utilisateur via l'endpoint admin
  const unblockUser = useCallback(async (uuid: string) => {
    try {
      await api.post(API_ENDPOINTS.ADMIN.USERS.UNBLOCK(uuid));
      return true;
    } catch (err: any) {
      console.error("❌ Erreur lors du déblocage:", err);
      throw err;
    }
  }, []);

  // Fonctions de pagination
  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  // Fonction de rafraîchissement
  const refresh = useCallback(() => {
    return fetchBlockedUsers({
      page: pagination.page,
      limit: pagination.limit,
      search: searchTerm || undefined,
      is_admin:
        selectedRole !== "all"
          ? selectedRole === "admin"
            ? "true"
            : "false"
          : undefined,
    });
  }, [
    fetchBlockedUsers,
    pagination.page,
    pagination.limit,
    searchTerm,
    selectedRole,
  ]);

  // Charger les utilisateurs bloqués au montage
  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  // Gérer les changements de recherche et filtres avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchBlockedUsers({
        page: 1, // Retourner à la première page lors d'un nouveau filtre
        limit: pagination.limit,
        search: searchTerm || undefined,
        is_admin:
          selectedRole !== "all"
            ? selectedRole === "admin"
              ? "true"
              : "false"
            : undefined,
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedRole, pagination.limit]);

  // Fonction pour débloquer un utilisateur
  const handleUnblockUser = async () => {
    if (!selectedUser) return;

    try {
      setUnblockLoading(true);

      // Utiliser la méthode admin pour débloquer
      try {
        await unblockUser(selectedUser.uuid);
      } catch {
        // Fallback à la méthode régulière
        await updateUser(selectedUser.uuid, {
          est_bloque: false,
        } as Partial<LocalUser>);
      }

      setShowUnblockModal(false);
      setSelectedUser(null);
      setSuccessMessage("Utilisateur débloqué avec succès");

      // Réinitialiser la sélection
      setSelectedUsers([]);
      setSelectAll(false);

      // Rafraîchir la liste
      refresh();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Erreur lors du déblocage:", err);
      setInfoMessage(
        err.message || "Erreur lors du déblocage de l'utilisateur",
      );
    } finally {
      setUnblockLoading(false);
    }
  };

  // Fonction pour débloquer plusieurs utilisateurs
  const handleUnblockMultipleUsers = async () => {
    if (selectedUsers.length === 0) return;

    try {
      setUnblockLoading(true);
      let successCount = 0;
      let errorCount = 0;

      for (const userId of selectedUsers) {
        try {
          const user = users.find((u) => u.uuid === userId);
          if (!user) continue;

          // Essayer d'abord la méthode admin
          try {
            await unblockUser(userId);
          } catch {
            // Fallback à la méthode régulière
            await updateUser(userId, {
              est_bloque: false,
            } as Partial<LocalUser>);
          }
          successCount++;
        } catch (err) {
          console.error(`Erreur pour l'utilisateur ${userId}:`, err);
          errorCount++;
        }
      }

      setShowUnblockMultipleModal(false);
      setSuccessMessage(
        `${successCount} utilisateur(s) débloqué(s) avec succès${errorCount > 0 ? ` (${errorCount} échec(s))` : ""}`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);

      // Réinitialiser la sélection
      setSelectedUsers([]);
      setSelectAll(false);

      // Rafraîchir la liste
      refresh();
    } catch (err: any) {
      console.error("Erreur lors du déblocage multiple:", err);
      setInfoMessage(
        err.message || "Erreur lors du déblocage des utilisateurs",
      );
    } finally {
      setUnblockLoading(false);
    }
  };

  // Fonction pour ouvrir le modal de déblocage
  const openUnblockModal = (utilisateur: LocalUser) => {
    setSelectedUser(utilisateur);
    setShowUnblockModal(true);
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
  const sortUtilisateurs = (utilisateurs: LocalUser[]) => {
    if (!sortConfig || !utilisateurs.length) return utilisateurs;

    return [...utilisateurs].sort((a, b) => {
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
  };

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
      const allUserIds = filteredUtilisateurs.map((user) => user.uuid);
      setSelectedUsers(allUserIds);
    }
    setSelectAll(!selectAll);
  };

  // Actions en masse
  const handleBulkAction = async (action: "unblock") => {
    if (selectedUsers.length === 0) {
      setInfoMessage("Veuillez sélectionner au moins un utilisateur");
      setTimeout(() => setInfoMessage(null), 3000);
      return;
    }

    if (action === "unblock") {
      setShowUnblockMultipleModal(true);
      return;
    }
  };

  // Filtrer et trier les utilisateurs côté client
  const filteredUtilisateurs = useMemo(() => {
    let filtered = [...users];

    // Filtrer par recherche
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.nom?.toLowerCase().includes(searchLower) ||
          user.prenoms?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.telephone?.includes(searchTerm),
      );
    }

    // Filtrer par rôle
    if (selectedRole !== "all") {
      filtered = filtered.filter((user) => {
        if (selectedRole === "admin") return user.is_admin === true;
        if (selectedRole === "user") return user.is_admin === false;
        return true;
      });
    }

    // Trier
    return sortUtilisateurs(filtered);
  }, [users, searchTerm, selectedRole, sortConfig]);

  // Calculer les éléments pour la page courante (pagination côté client)
  const currentItems = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    return filteredUtilisateurs.slice(
      startIndex,
      startIndex + pagination.limit,
    );
  }, [filteredUtilisateurs, pagination.page, pagination.limit]);

  // Mettre à jour le total quand les filtres changent
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      total: filteredUtilisateurs.length,
      pages: Math.ceil(filteredUtilisateurs.length / prev.limit),
    }));
  }, [filteredUtilisateurs.length]);

  // Export CSV
  const handleCSVExport = () => {
    if (filteredUtilisateurs.length === 0) {
      setInfoMessage("Aucun utilisateur à exporter");
      setTimeout(() => setInfoMessage(null), 3000);
      return;
    }

    const csvContent = [
      [
        "Nom",
        "Prénoms",
        "Email",
        "Téléphone",
        "Civilité",
        "Rôle",
        "Statut",
        "Date de blocage",
        "Créé le",
      ],
      ...filteredUtilisateurs.map((u) => [
        u.nom || "",
        u.prenoms || "",
        u.email || "",
        u.telephone || "",
        u.civilite?.libelle || "Non spécifié",
        u.role?.name || "Utilisateur",
        "Bloqué",
        u.est_bloque ? formatDate(u.updated_at) : "N/A",
        formatDate(u.created_at),
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
      `utilisateurs-bloques-${new Date().toISOString().split("T")[0]}.csv`,
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
    setSortConfig(null);
    setPage(1);
    setSelectedUsers([]);
    setSelectAll(false);
  };

  // Effet pour mettre à jour selectAll
  useEffect(() => {
    if (currentItems.length > 0) {
      const allSelected = currentItems.every((user) =>
        selectedUsers.includes(user.uuid),
      );
      setSelectAll(allSelected);
    } else {
      setSelectAll(false);
    }
  }, [selectedUsers, currentItems]);

  return (
    <>
      {/* Modal de déblocage simple */}
      <UnblockModal
        show={showUnblockModal}
        user={selectedUser}
        loading={unblockLoading}
        onClose={() => {
          setShowUnblockModal(false);
          setSelectedUser(null);
        }}
        onConfirm={handleUnblockUser}
        type="single"
      />

      {/* Modal de déblocage multiple */}
      <UnblockModal
        show={showUnblockMultipleModal}
        user={null}
        loading={unblockLoading}
        onClose={() => {
          setShowUnblockMultipleModal(false);
        }}
        onConfirm={handleUnblockMultipleUsers}
        type="multiple"
        count={selectedUsers.length}
      />

      <div className="p-3 p-md-4">
        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="card-header bg-white border-0 py-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div>
                <p className="text-muted mb-1">
                  Gestion des Utilisateurs Bloqués
                </p>
                <div className="d-flex align-items-center gap-3">
                  <h2 className="h4 mb-0 fw-bold">
                    Liste des Utilisateurs Bloqués
                  </h2>
                  <span className="badge bg-danger bg-opacity-10 text-danger border border-danger">
                    {filteredUtilisateurs.length} utilisateur(s) bloqué(s){" "}
                    {selectedUsers.length > 0 &&
                      `(${selectedUsers.length} sélectionné(s))`}
                  </span>
                </div>
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

                <Link
                  href="/dashboard-admin/utilisateurs/liste-utilisateurs"
                  className="btn btn-outline-primary d-flex align-items-center gap-2"
                >
                  <FontAwesomeIcon icon={faUserCheck} />
                  Voir les utilisateurs actifs
                </Link>

                <button
                  onClick={handleCSVExport}
                  className="btn btn-outline-danger d-flex align-items-center gap-2"
                  disabled={filteredUtilisateurs.length === 0 || loading}
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Exporter CSV
                </button>
              </div>
            </div>

            {/* Messages d'alerte */}
            {error && (
              <div
                className="alert alert-warning alert-dismissible fade show mt-3 mb-0"
                role="alert"
              >
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="me-2"
                />
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
                className="alert alert-success alert-dismissible fade show mt-3 mb-0"
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
                className="alert alert-info alert-dismissible fade show mt-3 mb-0"
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
          </div>

          {/* Barre d'actions en masse */}
          {selectedUsers.length > 0 && (
            <div className="p-3 border-bottom bg-warning bg-opacity-10">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                <div className="d-flex align-items-center gap-2">
                  <FontAwesomeIcon icon={faUsers} className="text-warning" />
                  <span className="fw-semibold">
                    {selectedUsers.length} utilisateur(s) bloqué(s)
                    sélectionné(s)
                  </span>
                </div>

                <div className="d-flex flex-wrap gap-2">
                  <button
                    className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1"
                    onClick={() => handleBulkAction("unblock")}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faLockOpen} />
                    <span>Débloquer</span>
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
                    <span>Annuler</span>
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
                    placeholder="Rechercher parmi les utilisateurs bloqués..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
              </div>

              <div className="col-md-3">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faUser} className="text-muted" />
                  </span>
                  <select
                    className="form-select border-start-0 ps-0"
                    value={selectedRole}
                    onChange={(e) => {
                      setSelectedRole(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="all">Tous les rôles</option>
                    <option value="admin">Administrateurs</option>
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
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
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
                    Résultats: <strong>{filteredUtilisateurs.length}</strong>{" "}
                    utilisateur(s) bloqué(s)
                    {searchTerm && (
                      <>
                        {" "}
                        pour "<strong>{searchTerm}</strong>"
                      </>
                    )}
                    {selectedRole !== "all" && (
                      <>
                        {" "}
                        et rôle "
                        <strong>
                          {selectedRole === "admin"
                            ? "Administrateurs"
                            : "Utilisateurs"}
                        </strong>
                        "
                      </>
                    )}
                  </small>
                </div>
              </div>

              <div className="col-md-6 text-end">
                <div className="d-flex align-items-center gap-2 justify-content-end">
                  {selectedUsers.length > 0 && (
                    <small className="text-warning fw-semibold">
                      {selectedUsers.length} sélectionné(s)
                    </small>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tableau des utilisateurs bloqués */}
          <div className="table-responsive">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-danger" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-3">Chargement des utilisateurs bloqués...</p>
              </div>
            ) : (
              <>
                {filteredUtilisateurs.length === 0 ? (
                  <div className="text-center py-5">
                    <div
                      className="alert alert-info mx-auto"
                      style={{ maxWidth: "500px" }}
                    >
                      <FontAwesomeIcon
                        icon={faBan}
                        className="fs-1 mb-3 text-info"
                      />
                      <h5 className="alert-heading">
                        Aucun utilisateur bloqué
                      </h5>
                      <p className="mb-0">
                        {users.length === 0
                          ? "Aucun utilisateur n'est actuellement bloqué"
                          : "Aucun utilisateur bloqué ne correspond à vos critères de recherche"}
                      </p>
                      <div className="mt-3">
                        <Link
                          href="/dashboard-admin/utilisateurs/liste-utilisateurs"
                          className="btn btn-primary"
                        >
                          <FontAwesomeIcon
                            icon={faUserCheck}
                            className="me-2"
                          />
                          Voir les utilisateurs actifs
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
                                checked={selectAll && currentItems.length > 0}
                                onChange={handleSelectAll}
                                disabled={currentItems.length === 0}
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
                              onClick={() => requestSort("updated_at")}
                            >
                              <FontAwesomeIcon
                                icon={faHistory}
                                className="me-1"
                              />
                              Bloqué le
                              {getSortIcon("updated_at")}
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
                        {currentItems.map((utilisateur, index) => (
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
                                    className="bg-danger bg-opacity-10 text-danger rounded-circle d-flex align-items-center justify-content-center"
                                    style={{ width: "40px", height: "40px" }}
                                  >
                                    <FontAwesomeIcon icon={faBan} />
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
                                is_deleted={utilisateur.is_deleted || false}
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
                              <div className="d-flex align-items-center">
                                <FontAwesomeIcon
                                  icon={faHistory}
                                  className="text-danger me-2"
                                />
                                <small className="text-danger fw-semibold">
                                  {formatDate(utilisateur.updated_at)}
                                </small>
                              </div>
                            </td>
                            <td className="text-center">
                              <div
                                className="btn-group btn-group-sm"
                                role="group"
                              >
                                <Link
                                  href={`/dashboard-admin/utilisateurs/${utilisateur.uuid}`}
                                  className="btn btn-outline-primary"
                                  title="Voir détails"
                                >
                                  <FontAwesomeIcon icon={faEye} />
                                </Link>
                                <button
                                  className="btn btn-outline-success"
                                  title="Débloquer"
                                  onClick={() => openUnblockModal(utilisateur)}
                                  disabled={loading}
                                >
                                  <FontAwesomeIcon icon={faCheckCircle} />
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
                        totalItems={filteredUtilisateurs.length}
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
          background-color: rgba(255, 193, 7, 0.05) !important;
        }

        .form-check-input:checked {
          background-color: #ffc107;
          border-color: #ffc107;
        }

        .form-check-input:focus {
          border-color: #ffc107;
          box-shadow: 0 0 0 0.25rem rgba(255, 193, 7, 0.25);
        }
      `}</style>
    </>
  );
}
