// app/(back-office)/dashboard-admin/utilisateurs/liste-utilisateurs/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
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
  faCheckSquare,
  faSquare,
  faCheck,
  faTimes,
  faLock,
  faLockOpen,
  faEnvelopeOpen,
  faUserShield,
  faInfoCircle,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

// Import des services et hooks
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { useUsers } from "@/hooks/useUtilisateurs";
import type { User } from "@/services/utilisateurs/user.types";
import { api } from "@/lib/api-client";
import CreateUserModal from "../components/modals/CreateUserModal";
import EditUserModal from "../components/modals/ModifierUserModal";

// Interface local pour le composant
interface LocalUser extends Omit<User, "civilite" | "role"> {
  civilite?: {
    libelle: string;
  };
  role?: {
    name: string;
  };
}

// Composant de statut
const StatusBadge = ({
  est_bloque,
  est_verifie,
}: {
  est_bloque: boolean;
  est_verifie: boolean;
}) => {
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

// Composant de modal de suppression
const DeleteModal = ({
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
            <h5 className="modal-title text-danger">
              <FontAwesomeIcon icon={faTrash} className="me-2" />
              {type === "multiple"
                ? "Suppression multiple"
                : "Confirmer la suppression"}
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
                  Êtes-vous sûr de vouloir supprimer l'utilisateur{" "}
                  <strong>
                    {user.nom} {user.prenoms}
                  </strong>{" "}
                  ({user.email}) ?
                </p>
                <p className="text-danger mb-0">
                  <small>
                    Cette action est irréversible. Toutes les données associées
                    à cet utilisateur seront perdues.
                  </small>
                </p>
              </>
            ) : (
              <>
                <p>
                  Êtes-vous sûr de vouloir supprimer <strong>{count}</strong>{" "}
                  utilisateur(s) sélectionné(s) ?
                </p>
                <p className="text-danger mb-0">
                  <small>
                    Cette action est irréversible. Toutes les données associées
                    à ces utilisateurs seront perdues.
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
                  {type === "multiple"
                    ? `Supprimer ${count} utilisateur(s)`
                    : "Supprimer définitivement"}
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
          <span className="fw-semibold">{totalItems}</span> utilisateurs
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

export default function ListeUtilisateursActifsPage() {
  // Utilisation du hook personnalisé
  const {
    users,
    loading,
    error,
    pagination,
    fetchUsers,
    updateUser,
    deleteUser,
    setPage,
    setLimit,
    refresh,
  } = useUsers();

  // États pour les modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteMultipleModal, setShowDeleteMultipleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<LocalUser | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] =
    useState<LocalUser | null>(null);

  // États pour les filtres et recherche
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
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
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Options pour les éléments par page
  const itemsPerPageOptions = [5, 10, 20, 50];

  // Charger les utilisateurs au montage
  useEffect(() => {
    fetchUsers();
  }, []);

  // Gérer les changements de pagination et filtres - CORRECTION ICI
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Construction des paramètres de requête
        const params: any = {
          page: pagination.page,
          limit: pagination.limit,
        };

        // Ajout du terme de recherche si spécifié
        if (searchTerm.trim()) {
          params.search = searchTerm.trim();
        }

        // Ajout du filtre de statut si spécifié
        if (selectedStatus !== "all") {
          params.est_bloque = selectedStatus === "blocked" ? "true" : "false";
          if (selectedStatus === "unverified") {
            params.est_verifie = "false";
          }
        }

        // Ajout du filtre de rôle si spécifié
        if (selectedRole !== "all") {
          params.is_admin = selectedRole === "admin" ? "true" : "false";
        }

        console.log("📡 Paramètres de requête:", params);
        await fetchUsers(params);
      } catch (error) {
        console.error("❌ Erreur lors du chargement des utilisateurs:", error);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchData();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [
    pagination.page,
    pagination.limit,
    searchTerm,
    selectedStatus,
    selectedRole,
  ]);

  // Fonction pour ouvrir la modal de création
  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
  };

  // Fonction appelée après création réussie
  const handleUserCreated = () => {
    setSuccessMessage("Utilisateur créé avec succès !");
    refresh(); // Rafraîchir la liste des utilisateurs
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Fonction pour supprimer un utilisateur
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setDeleteLoading(true);
      await deleteUser(selectedUser.uuid);

      setShowDeleteModal(false);
      setSelectedUser(null);
      setSuccessMessage("Utilisateur supprimé avec succès");
      setTimeout(() => setSuccessMessage(null), 3000);

      // Réinitialiser la sélection
      setSelectedUsers([]);
      setSelectAll(false);
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      setInfoMessage("Erreur lors de la suppression de l'utilisateur");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Fonction pour supprimer plusieurs utilisateurs
  const handleDeleteMultipleUsers = async () => {
    if (selectedUsers.length === 0) return;

    try {
      setDeleteLoading(true);

      // Supprimer chaque utilisateur sélectionné
      for (const userId of selectedUsers) {
        await deleteUser(userId);
      }

      setShowDeleteMultipleModal(false);
      setSuccessMessage(
        `${selectedUsers.length} utilisateur(s) supprimé(s) avec succès`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);

      // Réinitialiser la sélection
      setSelectedUsers([]);
      setSelectAll(false);

      // Rafraîchir la liste
      refresh();
    } catch (err) {
      console.error("Erreur lors de la suppression multiple:", err);
      setInfoMessage("Erreur lors de la suppression des utilisateurs");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Fonction pour ouvrir le modal de suppression
  const openDeleteModal = (utilisateur: LocalUser) => {
    setSelectedUser(utilisateur);
    setShowDeleteModal(true);
  };

  // Fonction pour bloquer/débloquer un utilisateur
  const handleToggleBlock = async (utilisateur: LocalUser) => {
    try {
      if (utilisateur.is_admin) {
        // Pour les admins
        const endpoint = utilisateur.est_bloque
          ? API_ENDPOINTS.ADMIN.USERS.UNBLOCK(utilisateur.uuid)
          : API_ENDPOINTS.ADMIN.USERS.BLOCK(utilisateur.uuid);

        await api.post(endpoint);
      } else {
        // Pour les utilisateurs réguliers
        await updateUser(utilisateur.uuid, {
          ...utilisateur,
          est_bloque: !utilisateur.est_bloque,
        } as Partial<User>);
      }

      // Rafraîchir la liste
      refresh();

      setSuccessMessage(
        `Utilisateur ${utilisateur.est_bloque ? "débloqué" : "bloqué"} avec succès`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Erreur lors de l'opération:", err);
      setInfoMessage("Erreur lors de l'opération");
    }
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
      const allUserIds = currentItems.map((user) => user.uuid);
      setSelectedUsers(allUserIds);
    }
    setSelectAll(!selectAll);
  };

  const handleSelectAllOnPage = () => {
    const pageUserIds = currentItems.map((user) => user.uuid);
    const allSelected = pageUserIds.every((id) => selectedUsers.includes(id));

    if (allSelected) {
      // Désélectionner tous les utilisateurs de la page
      setSelectedUsers((prev) =>
        prev.filter((id) => !pageUserIds.includes(id)),
      );
    } else {
      // Sélectionner tous les utilisateurs de la page
      const newSelection = [...new Set([...selectedUsers, ...pageUserIds])];
      setSelectedUsers(newSelection);
    }
  };

  // Actions en masse
  const handleBulkAction = async (
    action:
      | "block"
      | "unblock"
      | "verify"
      | "delete"
      | "makeAdmin"
      | "removeAdmin",
  ) => {
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
          const user = users.find((u) => u.uuid === userId);
          if (!user) continue;

          switch (action) {
            case "block":
              await api.post(API_ENDPOINTS.ADMIN.USERS.BLOCK(userId));
              successCount++;
              break;
            case "unblock":
              await api.post(API_ENDPOINTS.ADMIN.USERS.UNBLOCK(userId));
              successCount++;
              break;
            case "verify":
              await updateUser(userId, { est_verifie: true } as Partial<User>);
              successCount++;
              break;
            case "makeAdmin":
              await updateUser(userId, { is_admin: true } as Partial<User>);
              successCount++;
              break;
            case "removeAdmin":
              await updateUser(userId, { is_admin: false } as Partial<User>);
              successCount++;
              break;
            case "delete":
              // Pour la suppression, on utilise la modal de confirmation
              setShowDeleteMultipleModal(true);
              setBulkActionLoading(false);
              return;
          }
        } catch (err) {
          console.error(`Erreur pour l'utilisateur ${userId}:`, err);
          errorCount++;
        }
      }

      if (action !== "delete") {
        setSuccessMessage(
          `${successCount} utilisateur(s) ${getActionLabel(action)} avec succès${errorCount > 0 ? ` (${errorCount} échec(s))` : ""}`,
        );
        setTimeout(() => setSuccessMessage(null), 3000);

        // Rafraîchir la liste
        refresh();

        // Réinitialiser la sélection pour les actions non-destructives
        if (action !== "delete") {
          setSelectedUsers([]);
          setSelectAll(false);
        }
      }
    } catch (err) {
      console.error("Erreur lors de l'action en masse:", err);
      setInfoMessage("Erreur lors de l'action en masse");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "block":
        return "bloqué(s)";
      case "unblock":
        return "débloqué(s)";
      case "verify":
        return "vérifié(s)";
      case "makeAdmin":
        return "promu(s) administrateur";
      case "removeAdmin":
        return "rétrogradé(s)";
      default:
        return "modifié(s)";
    }
  };

  // Filtrer et trier les utilisateurs - CORRECTION ICI
  const filteredUtilisateurs = sortUtilisateurs(
    users.filter((user: LocalUser) => {
      // Filtrage côté client pour les cas où l'API ne filtre pas correctement
      let passesFilter = true;

      // Filtre par recherche
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        passesFilter =
          passesFilter &&
          (user.nom?.toLowerCase().includes(searchLower) ||
            user.prenoms?.toLowerCase().includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower) ||
            user.telephone?.includes(searchTerm));
      }

      // Filtre par statut
      if (selectedStatus !== "all") {
        if (selectedStatus === "blocked") {
          passesFilter = passesFilter && user.est_bloque === true;
        } else if (selectedStatus === "unverified") {
          passesFilter = passesFilter && user.est_verifie === false;
        } else if (selectedStatus === "active") {
          passesFilter =
            passesFilter &&
            user.est_bloque === false &&
            user.est_verifie === true;
        }
      }

      // Filtre par rôle
      if (selectedRole !== "all") {
        if (selectedRole === "admin") {
          passesFilter = passesFilter && user.is_admin === true;
        } else if (selectedRole === "user") {
          passesFilter = passesFilter && user.is_admin === false;
        }
      }

      return passesFilter;
    }) as LocalUser[],
  );

  const currentItems = filteredUtilisateurs.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit,
  );

  // Fonction pour exporter les données
  const handleExport = async () => {
    try {
      // Utilisation de l'API spécifique pour l'export PDF des utilisateurs
      const response = await api.get(API_ENDPOINTS.ADMIN.USERS.EXPORT_PDF, {
        responseType: "blob",
        headers: {
          Accept: "application/pdf",
        },
      });

      // Vérifier si la réponse est un PDF valide
      if (!response || !response.type.includes("pdf")) {
        throw new Error("La réponse n'est pas un PDF valide");
      }

      // Créer l'URL du blob et télécharger
      const blob = new Blob([response], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `utilisateurs-${new Date().toISOString().split("T")[0]}.pdf`;

      // Déclencher le téléchargement
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Libérer la mémoire
      window.URL.revokeObjectURL(url);

      // Message de succès
      setSuccessMessage("Export PDF réussi !");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("❌ Erreur lors de l'export PDF:", err);

      // Gestion d'erreur spécifique
      let errorMessage = "Erreur lors de l'export PDF";

      if (err.response) {
        // Erreur de l'API
        if (err.response.status === 404) {
          errorMessage = "L'endpoint d'export PDF n'est pas disponible";
        } else if (err.response.status === 500) {
          errorMessage = "Erreur serveur lors de la génération du PDF";
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setInfoMessage(errorMessage);
      setTimeout(() => setInfoMessage(null), 5000);

      // Fallback vers CSV en cas d'échec
      console.log("Tentative d'export CSV en fallback...");
      handleCSVExport();
    }
  };

  // Fallback CSV export
  const handleCSVExport = () => {
    if (filteredUtilisateurs.length === 0) return;

    const csvContent = [
      [
        "Nom",
        "Prénoms",
        "Email",
        "Téléphone",
        "Civilité",
        "Rôle",
        "Statut",
        "Créé le",
        "Modifié le",
      ],
      ...filteredUtilisateurs.map((u) => [
        u.nom || "",
        u.prenoms || "",
        u.email || "",
        u.telephone || "",
        u.civilite?.libelle || "Non spécifié",
        u.role?.name || "Utilisateur",
        u.est_bloque ? "Bloqué" : u.est_verifie ? "Actif" : "Non vérifié",
        formatDate(u.created_at),
        formatDate(u.updated_at),
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
      `utilisateurs-${new Date().toISOString().split("T")[0]}.csv`,
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
    setSelectedStatus("all");
    setSelectedRole("all");
    setSortConfig(null);
    setPage(1);
    setSelectedUsers([]);
    setSelectAll(false);
  };

  // Effet pour mettre à jour selectAll quand on change de page ou de sélection
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
      {/* Modal de création d'utilisateur */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleUserCreated}
      />

      {/* Modal de modification d'utilisateur */}
      <EditUserModal
        isOpen={showEditModal}
        user={selectedUserForEdit}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUserForEdit(null);
        }}
        onSuccess={() => {
          setSuccessMessage("Utilisateur modifié avec succès");
          refresh(); // Rafraîchir la liste
          setTimeout(() => setSuccessMessage(null), 3000);
        }}
      />

      {/* Modal de suppression simple */}
      <DeleteModal
        show={showDeleteModal}
        user={selectedUser}
        loading={deleteLoading}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteUser}
        type="single"
      />

      {/* Modal de suppression multiple */}
      <DeleteModal
        show={showDeleteMultipleModal}
        user={null}
        loading={deleteLoading}
        onClose={() => {
          setShowDeleteMultipleModal(false);
        }}
        onConfirm={handleDeleteMultipleUsers}
        type="multiple"
        count={selectedUsers.length}
      />

      <div className="p-3 p-md-4">
        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="card-header bg-white border-0 py-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div>
                <p className="text-muted mb-1">Gestion des Utilisateurs</p>
                <div className="d-flex align-items-center gap-3">
                  <h2 className="h4 mb-0 fw-bold">Liste des Utilisateurs</h2>
                  <span className="badge bg-primary bg-opacity-10 text-primary">
                    {filteredUtilisateurs.length} utilisateur(s){" "}
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

                <button
                  onClick={handleExport}
                  className="btn btn-outline-primary d-flex align-items-center gap-2"
                  disabled={users.length === 0 || loading}
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Exporter PDF
                </button>

                <button
                  onClick={handleOpenCreateModal}
                  className="btn btn-success d-flex align-items-center gap-2"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Nouvel Utilisateur
                </button>
              </div>
            </div>

            {/* Messages d'alerte */}
            {error && (
              <div
                className="alert alert-warning alert-dismissible fade show mt-3 mb-0"
                role="alert"
              >
                <FontAwesomeIcon icon={faBan} className="me-2" />
                <strong>Attention:</strong> {error}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {}}
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
                    {selectedUsers.length} utilisateur(s) sélectionné(s)
                  </span>
                </div>

                <div className="d-flex flex-wrap gap-2">
                  <button
                    className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                    onClick={() => handleBulkAction("verify")}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faCheck} />
                    <span>Vérifier email</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1"
                    onClick={() => handleBulkAction("block")}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faLock} />
                    <span>Bloquer</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
                    onClick={() => handleBulkAction("unblock")}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faLockOpen} />
                    <span>Débloquer</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                    onClick={() => handleBulkAction("makeAdmin")}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faUserShield} />
                    <span>Promouvoir admin</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                    onClick={() => handleBulkAction("removeAdmin")}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faUser} />
                    <span>Retirer admin</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                    onClick={() => handleBulkAction("delete")}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    <span>Supprimer</span>
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
                    placeholder="Rechercher par nom, prénom, email ou téléphone..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPage(1); // Retour à la première page lors de la recherche
                    }}
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
                      setPage(1);
                    }}
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="active">Actifs (vérifiés)</option>
                    <option value="blocked">Bloqués</option>
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
                    utilisateur(s)
                    {searchTerm && (
                      <>
                        {" "}
                        pour "<strong>{searchTerm}</strong>"
                      </>
                    )}
                    {selectedStatus !== "all" && (
                      <>
                        {" "}
                        avec statut "
                        <strong>
                          {selectedStatus === "active"
                            ? "Actifs"
                            : selectedStatus === "blocked"
                              ? "Bloqués"
                              : "Non vérifiés"}
                        </strong>
                        "
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
                    <small className="text-primary fw-semibold">
                      {selectedUsers.length} sélectionné(s)
                    </small>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tableau des utilisateurs */}
          <div className="table-responsive">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-3">Chargement des utilisateurs...</p>
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
                        icon={faSearch}
                        className="fs-1 mb-3 text-info"
                      />
                      <h5 className="alert-heading">
                        Aucun utilisateur trouvé
                      </h5>
                      <p className="mb-0">
                        {users.length === 0
                          ? "Aucun utilisateur dans la base de données"
                          : "Aucun utilisateur ne correspond à vos critères de recherche"}
                      </p>
                      <button
                        onClick={handleOpenCreateModal}
                        className="btn btn-primary mt-3"
                      >
                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                        Créer le premier utilisateur
                      </button>
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
                          <th
                            style={{ width: "140px" }}
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
                                    className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center"
                                    style={{ width: "40px", height: "40px" }}
                                  >
                                    <FontAwesomeIcon icon={faUser} />
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
                                  className="btn btn-outline-warning"
                                  title="Modifier"
                                  onClick={() => {
                                    // Préparer les données de l'utilisateur pour la modal
                                    const userForEdit: any = {
                                      uuid: utilisateur.uuid,
                                      nom: utilisateur.nom,
                                      prenoms: utilisateur.prenoms,
                                      email: utilisateur.email,
                                      telephone: utilisateur.telephone,
                                      civilite_uuid: utilisateur.civilite_uuid,
                                      role_uuid: utilisateur.role_uuid,
                                      est_verifie:
                                        utilisateur.est_verifie || false,
                                      est_bloque:
                                        utilisateur.est_bloque || false,
                                      is_admin: utilisateur.is_admin || false,
                                      code_utilisateur:
                                        utilisateur.code_utilisateur,
                                      created_at: utilisateur.created_at,
                                      updated_at: utilisateur.updated_at,
                                      civilite: utilisateur.civilite,
                                      role: utilisateur.role,
                                    };

                                    setSelectedUserForEdit(userForEdit);
                                    setShowEditModal(true);
                                  }}
                                  disabled={loading}
                                >
                                  <FontAwesomeIcon icon={faEdit} />
                                </button>
                                <button
                                  className="btn btn-outline-secondary"
                                  title={
                                    utilisateur.est_bloque
                                      ? "Débloquer"
                                      : "Bloquer"
                                  }
                                  onClick={() => handleToggleBlock(utilisateur)}
                                  disabled={loading}
                                >
                                  <FontAwesomeIcon
                                    icon={
                                      utilisateur.est_bloque
                                        ? faCheckCircle
                                        : faBan
                                    }
                                  />
                                </button>
                                <button
                                  className="btn btn-outline-danger"
                                  title="Supprimer"
                                  onClick={() => openDeleteModal(utilisateur)}
                                  disabled={loading}
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
