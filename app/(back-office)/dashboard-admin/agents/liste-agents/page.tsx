// app/(back-office)/dashboard-admin/agents/liste-agents/page.tsx
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
  faIdBadge,
  faBuilding,
  faShield,
  faCheckSquare,
  faSquare,
  faCheck,
  faTimes,
  faLock,
  faLockOpen,
  faEnvelopeOpen,
  faUserShield,
  faUsers,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";

// Import des services et hooks
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { api } from "@/lib/api-client";
import EditAgentModal from "../components/modals/EditAgentModal";

// Types pour les agents test
interface Agent {
  uuid: string;
  id: string;
  nom: string;
  prenoms: string;
  email: string;
  telephone: string;
  civilite_uuid?: string;
  civilite?: {
    libelle: string;
  };
  role?: {
    name: string;
  };
  est_bloque: boolean;
  est_verifie?: boolean;
  is_deleted: boolean;
  deleted_at?: string;
  is_admin?: boolean;
  created_at?: string;
  updated_at?: string;
  avatar?: string;
  statut?: string;
  adminUuid?: string;
  role_uuid: string;
  adresse_uuid?: string;
  matricule?: string;
  date_embauche?: string;
  departement?: string;
  poste?: string;
}

// Composant de statut
const StatusBadge = ({
  est_bloque,
  is_deleted,
  est_verifie,
  statut,
}: {
  est_bloque: boolean;
  is_deleted: boolean;
  est_verifie?: boolean;
  statut?: string;
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

  if (est_verifie === false) {
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
      <span>{statut === "actif" ? "Actif" : "Inactif"}</span>
    </span>
  );
};

// Composant de modal de suppression
const DeleteModal = ({
  show,
  agent,
  loading,
  onClose,
  onConfirm,
  type = "single",
  count = 0,
}: {
  show: boolean;
  agent: Agent | null;
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
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title text-danger" id="deleteModalTitle">
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
              aria-label="Fermer"
            ></button>
          </div>
          <div className="modal-body">
            {type === "single" && agent ? (
              <>
                <p>
                  Êtes-vous sûr de vouloir supprimer l'agent{" "}
                  <strong>
                    {agent.nom} {agent.prenoms}
                  </strong>{" "}
                  ({agent.email}) ?
                </p>
                <p className="text-danger mb-0">
                  <small>
                    Cette action enverra l'agent dans la liste des agents
                    supprimés. Vous pourrez le restaurer ultérieurement.
                  </small>
                </p>
              </>
            ) : (
              <>
                <p>
                  Êtes-vous sûr de vouloir supprimer <strong>{count}</strong>{" "}
                  agent(s) sélectionné(s) ?
                </p>
                <p className="text-danger mb-0">
                  <small>
                    Cette action enverra les agents dans la liste des agents
                    supprimés. Vous pourrez les restaurer ultérieurement.
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
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Suppression...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faTrash} className="me-2" />
                  {type === "multiple"
                    ? `Supprimer ${count} agent(s)`
                    : "Supprimer"}
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
          <span className="fw-semibold">{totalItems}</span> agents
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
                    aria-label={`Page ${pageNum}`}
                    aria-current={pageNum === currentPage ? "page" : undefined}
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
            aria-label="Numéro de page"
          />
          <span className="text-muted">sur {totalPages}</span>
        </div>
      </div>
    </div>
  );
};

export default function ListeAgentsActifsPage() {
  // États pour les données
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // États pour les modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteMultipleModal, setShowDeleteMultipleModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedAgentForEdit, setSelectedAgentForEdit] =
    useState<Agent | null>(null);

  // États pour les filtres et recherche
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Agent | "civilite.libelle" | "role.name";
    direction: "asc" | "desc";
  } | null>(null);

  // États pour la sélection multiple
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // États pour les messages et chargements
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Options pour les éléments par page
  const itemsPerPageOptions = [5, 10, 20, 50];

  // Fonction pour charger les agents
  const fetchAgents = useCallback(
    async (params?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      role?: string;
    }) => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();

        const currentPage = params?.page || pagination.page;
        const currentLimit = params?.limit || pagination.limit;

        queryParams.append("page", currentPage.toString());
        queryParams.append("limit", currentLimit.toString());

        if (params?.search) queryParams.append("search", params.search);

        if (params?.status && params.status !== "all") {
          if (params.status === "blocked") {
            queryParams.append("est_bloque", "true");
          } else if (params.status === "active") {
            queryParams.append("est_bloque", "false");
          } else if (params.status === "unverified") {
            queryParams.append("est_verifie", "false");
          }
        }

        if (params?.role && params.role !== "all") {
          queryParams.append("role", params.role);
        }

        const queryString = queryParams.toString();
        const endpoint = queryString
          ? `${API_ENDPOINTS.ADMIN.AGENTS.LIST}?${queryString}`
          : API_ENDPOINTS.ADMIN.AGENTS.LIST;

        console.log("🔄 Fetching agents from:", endpoint);

        const response = await api.get<{
          data: Agent[];
          count: number;
          status: string;
        }>(endpoint);

        console.log("✅ Agents received:", {
          count: response.data?.length || 0,
          total: response.count,
        });

        // Filtrer uniquement les agents non supprimés
        const activeAgents = (response.data || []).filter(
          (agent) => !agent.is_deleted,
        );

        setAgents(activeAgents);

        setPagination((prev) => ({
          ...prev,
          page: currentPage,
          limit: currentLimit,
          total: response.count || activeAgents.length,
          pages:
            Math.ceil((response.count || activeAgents.length) / currentLimit) ||
            1,
        }));
      } catch (err: any) {
        console.error("❌ Error fetching agents:", err);
        setError(err.message || "Erreur lors du chargement des agents");
        setAgents([]);
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.limit],
  );

  // Charger les agents au montage
  useEffect(() => {
    fetchAgents();
  }, []);

  // Gérer les changements de pagination et filtres
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchAgents({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm.trim() || undefined,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
        role: selectedRole !== "all" ? selectedRole : undefined,
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [
    pagination.page,
    pagination.limit,
    searchTerm,
    selectedStatus,
    selectedRole,
    fetchAgents,
  ]);

  // Fonction pour bloquer/débloquer un agent
  const handleToggleBlock = async (agent: Agent) => {
    try {
      if (agent.est_bloque) {
        await api.post(API_ENDPOINTS.ADMIN.AGENTS.UNBLOCK(agent.uuid));
        setSuccessMessage("Agent débloqué avec succès");
      } else {
        await api.post(API_ENDPOINTS.ADMIN.AGENTS.BLOCK(agent.uuid));
        setSuccessMessage("Agent bloqué avec succès");
      }

      // Mettre à jour localement
      setAgents((prev) =>
        prev.map((a) =>
          a.uuid === agent.uuid ? { ...a, est_bloque: !agent.est_bloque } : a,
        ),
      );

      // Retirer de la sélection si sélectionné
      setSelectedAgents((prev) => prev.filter((id) => id !== agent.uuid));

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Erreur lors du changement de statut:", err);
      setInfoMessage("Erreur lors du changement de statut");
    }
  };

  // Fonction pour supprimer un agent
  const handleDeleteAgent = async () => {
    if (!selectedAgent) return;

    try {
      setDeleteLoading(true);
      await api.delete(API_ENDPOINTS.ADMIN.AGENTS.DELETE(selectedAgent.uuid));

      setShowDeleteModal(false);
      setSelectedAgent(null);
      setSuccessMessage("Agent supprimé avec succès");
      fetchAgents(); // Rafraîchir la liste
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      setInfoMessage("Erreur lors de la suppression");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Fonction pour supprimer plusieurs agents
  const handleDeleteMultipleAgents = async () => {
    if (selectedAgents.length === 0) return;

    try {
      setDeleteLoading(true);

      // Supprimer chaque agent sélectionné
      for (const agentId of selectedAgents) {
        await api.delete(API_ENDPOINTS.ADMIN.AGENTS.DELETE(agentId));
      }

      setShowDeleteMultipleModal(false);
      setSuccessMessage(
        `${selectedAgents.length} agent(s) supprimé(s) avec succès`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);

      // Réinitialiser la sélection
      setSelectedAgents([]);
      setSelectAll(false);

      // Rafraîchir la liste
      fetchAgents();
    } catch (err) {
      console.error("Erreur lors de la suppression multiple:", err);
      setInfoMessage("Erreur lors de la suppression des agents");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Fonction pour ouvrir le modal de suppression
  const openDeleteModal = (agent: Agent) => {
    setSelectedAgent(agent);
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
  const sortAgents = (agentsList: Agent[]) => {
    if (!sortConfig || !agentsList.length) return agentsList;

    return [...agentsList].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortConfig.key === "role.name") {
        aValue = a.role?.name || "";
        bValue = b.role?.name || "";
      } else if (sortConfig.key === "civilite.libelle") {
        aValue = a.civilite?.libelle || "";
        bValue = b.civilite?.libelle || "";
      } else {
        aValue = a[sortConfig.key as keyof Agent];
        bValue = b[sortConfig.key as keyof Agent];
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

  const requestSort = (key: keyof Agent | "role.name" | "civilite.libelle") => {
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

  const getSortIcon = (key: keyof Agent | "role.name" | "civilite.libelle") => {
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
  const handleSelectAgent = (agentId: string) => {
    setSelectedAgents((prev) => {
      if (prev.includes(agentId)) {
        return prev.filter((id) => id !== agentId);
      } else {
        return [...prev, agentId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedAgents([]);
    } else {
      const allAgentIds = filteredAgents.map((agent) => agent.uuid);
      setSelectedAgents(allAgentIds);
    }
    setSelectAll(!selectAll);
  };

  const handleSelectAllOnPage = () => {
    const pageAgentIds = currentItems.map((agent) => agent.uuid);
    const allSelected = pageAgentIds.every((id) => selectedAgents.includes(id));

    if (allSelected) {
      // Désélectionner tous les agents de la page
      setSelectedAgents((prev) =>
        prev.filter((id) => !pageAgentIds.includes(id)),
      );
    } else {
      // Sélectionner tous les agents de la page
      const newSelection = [...new Set([...selectedAgents, ...pageAgentIds])];
      setSelectedAgents(newSelection);
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
    if (selectedAgents.length === 0) {
      setInfoMessage("Veuillez sélectionner au moins un agent");
      setTimeout(() => setInfoMessage(null), 3000);
      return;
    }

    try {
      setBulkActionLoading(true);
      let successCount = 0;
      let errorCount = 0;

      for (const agentId of selectedAgents) {
        try {
          const agent = agents.find((a) => a.uuid === agentId);
          if (!agent) continue;

          switch (action) {
            case "block":
              await api.post(API_ENDPOINTS.ADMIN.AGENTS.BLOCK(agentId));
              successCount++;
              break;
            case "unblock":
              await api.post(API_ENDPOINTS.ADMIN.AGENTS.UNBLOCK(agentId));
              successCount++;
              break;
            case "verify":
              await api.put(API_ENDPOINTS.ADMIN.AGENTS.UPDATE(agentId), {
                est_verifie: true,
              });
              successCount++;
              break;
            case "makeAdmin":
              await api.put(API_ENDPOINTS.ADMIN.AGENTS.UPDATE(agentId), {
                is_admin: true,
              });
              successCount++;
              break;
            case "removeAdmin":
              await api.put(API_ENDPOINTS.ADMIN.AGENTS.UPDATE(agentId), {
                is_admin: false,
              });
              successCount++;
              break;
            case "delete":
              // Pour la suppression, on utilise la modal de confirmation
              setShowDeleteMultipleModal(true);
              setBulkActionLoading(false);
              return;
          }
        } catch (err) {
          console.error(`Erreur pour l'agent ${agentId}:`, err);
          errorCount++;
        }
      }

      if (action !== "delete") {
        setSuccessMessage(
          `${successCount} agent(s) ${getActionLabel(action)} avec succès${errorCount > 0 ? ` (${errorCount} échec(s))` : ""}`,
        );
        setTimeout(() => setSuccessMessage(null), 3000);

        // Rafraîchir la liste
        fetchAgents();

        // Réinitialiser la sélection pour les actions non-destructives
        setSelectedAgents([]);
        setSelectAll(false);
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

  // Filtrer et trier les agents actifs
  const filteredAgents = sortAgents(
    agents.filter((agent) => {
      // Filtrage côté client supplémentaire
      let passesFilter = true;

      // Filtre par recherche
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        const searchMatches =
          Boolean(agent.nom?.toLowerCase().includes(searchLower)) ||
          Boolean(agent.prenoms?.toLowerCase().includes(searchLower)) ||
          Boolean(agent.email?.toLowerCase().includes(searchLower)) ||
          Boolean(agent.telephone?.includes(searchTerm)) ||
          Boolean(agent.matricule?.toLowerCase().includes(searchLower)) ||
          Boolean(agent.poste?.toLowerCase().includes(searchLower));

        passesFilter = passesFilter && searchMatches;
      }

      // Filtre par statut
      if (selectedStatus !== "all") {
        if (selectedStatus === "blocked") {
          passesFilter = passesFilter && agent.est_bloque === true;
        } else if (selectedStatus === "active") {
          passesFilter =
            passesFilter &&
            agent.est_bloque === false &&
            agent.statut === "actif";
        } else if (selectedStatus === "unverified") {
          passesFilter = passesFilter && agent.est_verifie === false;
        }
      }

      // Filtre par rôle (admin ou non)
      if (selectedRole !== "all") {
        if (selectedRole === "admin") {
          passesFilter = passesFilter && agent.is_admin === true;
        } else if (selectedRole === "agent") {
          passesFilter = passesFilter && agent.is_admin === false;
        }
      }

      return passesFilter;
    }),
  );

  const currentItems = filteredAgents.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit,
  );

  // Fallback CSV export
  const handleCSVExport = () => {
    if (filteredAgents.length === 0) return;

    const csvContent = [
      [
        "ID",
        "Matricule",
        "Nom",
        "Prénoms",
        "Email",
        "Téléphone",
        "Civilité",
        "Poste",
        "Département",
        "Date embauche",
        "Rôle",
        "Statut",
        "Créé le",
        "Modifié le",
      ],
      ...filteredAgents.map((a) => [
        a.id || "",
        a.matricule || "",
        a.nom || "",
        a.prenoms || "",
        a.email || "",
        a.telephone || "",
        a.civilite?.libelle || "Non spécifié",
        a.poste || "",
        a.departement || "",
        a.date_embauche ? formatDate(a.date_embauche) : "",
        a.role?.name || "Agent",
        a.est_bloque ? "Bloqué" : a.statut === "actif" ? "Actif" : "Inactif",
        formatDate(a.created_at),
        formatDate(a.updated_at),
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
      `agents-${new Date().toISOString().split("T")[0]}.csv`,
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
    setPagination((prev) => ({ ...prev, page: 1 }));
    setSelectedAgents([]);
    setSelectAll(false);
  };

  // Effet pour mettre à jour selectAll quand on change de page ou de sélection
  useEffect(() => {
    if (currentItems.length > 0) {
      const allSelected = currentItems.every((agent) =>
        selectedAgents.includes(agent.uuid),
      );
      setSelectAll(allSelected);
    } else {
      setSelectAll(false);
    }
  }, [selectedAgents, currentItems]);

  return (
    <>
      *
      {/* Modal de création d'agent
        <CreateAgentModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setSuccessMessage("Agent créé avec succès !");
            fetchAgents();
            setTimeout(() => setSuccessMessage(null), 3000);
          }}
        />
        */}
      {/* Modal de modification d'agent */}
      {/* Modal de modification d'agent */}
      <EditAgentModal
        isOpen={showEditModal}
        agent={selectedAgentForEdit as any} // Quick fix if types should match
        onClose={() => {
          setShowEditModal(false);
          setSelectedAgentForEdit(null);
        }}
        onSuccess={() => {
          setSuccessMessage("Agent modifié avec succès");
          fetchAgents();
          setTimeout(() => setSuccessMessage(null), 3000);
        }}
      />
      {/* Modal de suppression simple */}
      <DeleteModal
        show={showDeleteModal}
        agent={selectedAgent}
        loading={deleteLoading}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedAgent(null);
        }}
        onConfirm={handleDeleteAgent}
        type="single"
      />
      {/* Modal de suppression multiple */}
      <DeleteModal
        show={showDeleteMultipleModal}
        agent={null}
        loading={deleteLoading}
        onClose={() => {
          setShowDeleteMultipleModal(false);
        }}
        onConfirm={handleDeleteMultipleAgents}
        type="multiple"
        count={selectedAgents.length}
      />
      <div className="p-3 p-md-4">
        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="card-header bg-white border-0 py-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div>
                <p className="text-muted mb-1">Gestion des Agents</p>
                <div className="d-flex align-items-center gap-3">
                  <h2 className="h4 mb-0 fw-bold">Liste des Agents</h2>
                  <span className="badge bg-primary bg-opacity-10 text-primary">
                    {pagination.total} agent(s)
                    {selectedAgents.length > 0 &&
                      ` (${selectedAgents.length} sélectionné(s))`}
                  </span>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <button
                  onClick={() => fetchAgents()}
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  disabled={loading}
                  aria-label="Rafraîchir la liste"
                >
                  <FontAwesomeIcon icon={faRefresh} spin={loading} />
                  Rafraîchir
                </button>

                <Link
                  href="/dashboard-admin/agents/liste-agents-bloques"
                  className="btn btn-outline-warning d-flex align-items-center gap-2"
                >
                  <FontAwesomeIcon icon={faBan} />
                  Agents bloqués
                </Link>

                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-success d-flex align-items-center gap-2"
                  aria-label="Créer un nouvel agent"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Nouvel Agent
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
                  onClick={() => setError(null)}
                  aria-label="Fermer l'alerte"
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
                  aria-label="Fermer l'alerte"
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
                  aria-label="Fermer l'alerte"
                ></button>
              </div>
            )}
          </div>

          {/* Barre d'actions en masse */}
          {selectedAgents.length > 0 && (
            <div className="p-3 border-bottom bg-warning bg-opacity-10">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                <div className="d-flex align-items-center gap-2">
                  <FontAwesomeIcon icon={faUsers} className="text-warning" />
                  <span className="fw-semibold">
                    {selectedAgents.length} agent(s) sélectionné(s)
                  </span>
                </div>

                <div className="d-flex flex-wrap gap-2">
                  <button
                    className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                    onClick={() => handleBulkAction("verify")}
                    disabled={bulkActionLoading}
                    aria-label="Vérifier les emails des agents sélectionnés"
                  >
                    <FontAwesomeIcon icon={faCheck} />
                    <span>Vérifier email</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1"
                    onClick={() => handleBulkAction("block")}
                    disabled={bulkActionLoading}
                    aria-label="Bloquer les agents sélectionnés"
                  >
                    <FontAwesomeIcon icon={faLock} />
                    <span>Bloquer</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
                    onClick={() => handleBulkAction("unblock")}
                    disabled={bulkActionLoading}
                    aria-label="Débloquer les agents sélectionnés"
                  >
                    <FontAwesomeIcon icon={faLockOpen} />
                    <span>Débloquer</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                    onClick={() => handleBulkAction("makeAdmin")}
                    disabled={bulkActionLoading}
                    aria-label="Promouvoir administrateur"
                  >
                    <FontAwesomeIcon icon={faUserShield} />
                    <span>Promouvoir admin</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                    onClick={() => handleBulkAction("removeAdmin")}
                    disabled={bulkActionLoading}
                    aria-label="Retirer les droits administrateur"
                  >
                    <FontAwesomeIcon icon={faUser} />
                    <span>Retirer admin</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                    onClick={() => handleBulkAction("delete")}
                    disabled={bulkActionLoading}
                    aria-label="Supprimer les agents sélectionnés"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    <span>Supprimer</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1"
                    onClick={() => {
                      setSelectedAgents([]);
                      setSelectAll(false);
                    }}
                    disabled={bulkActionLoading}
                    aria-label="Annuler la sélection"
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
                    placeholder="Rechercher par nom, email, téléphone, matricule..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                    aria-label="Rechercher des agents"
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
                    aria-label="Filtrer par statut"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="active">Actifs</option>
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
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                    aria-label="Filtrer par rôle"
                  >
                    <option value="all">Tous les rôles</option>
                    <option value="admin">Administrateurs</option>
                    <option value="agent">Agents</option>
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
                      setPagination((prev) => ({
                        ...prev,
                        limit: Number(e.target.value),
                        page: 1,
                      }));
                    }}
                    aria-label="Nombre d'éléments par page"
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
                  aria-label="Réinitialiser les filtres"
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
                    Total: <strong>{pagination.total}</strong> agents actifs
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
                            : "Agents"}
                        </strong>
                        "
                      </>
                    )}
                  </small>
                </div>
              </div>

              <div className="col-md-6 text-end">
                <div className="d-flex align-items-center gap-2 justify-content-end">
                  {selectedAgents.length > 0 && (
                    <small className="text-primary fw-semibold">
                      {selectedAgents.length} sélectionné(s)
                    </small>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tableau des agents */}
          <div className="table-responsive">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-3">Chargement des agents...</p>
              </div>
            ) : (
              <>
                {filteredAgents.length === 0 ? (
                  <div className="text-center py-5">
                    <div
                      className="alert alert-info mx-auto"
                      style={{ maxWidth: "500px" }}
                    >
                      <FontAwesomeIcon
                        icon={faUser}
                        className="fs-1 mb-3 text-info"
                      />
                      <h5 className="alert-heading">Aucun agent trouvé</h5>
                      <p className="mb-0">
                        {agents.length === 0
                          ? "Aucun agent dans la base de données"
                          : "Aucun agent ne correspond à vos critères de recherche"}
                      </p>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn btn-primary mt-3"
                      >
                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                        Créer le premier agent
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
                                aria-label={
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
                          <th style={{ width: "200px" }}>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                              onClick={() => requestSort("nom")}
                              aria-label={`Trier par nom ${sortConfig?.key === "nom" ? (sortConfig.direction === "asc" ? "croissant" : "décroissant") : ""}`}
                            >
                              Nom & Prénoms
                              {getSortIcon("nom")}
                            </button>
                          </th>
                          <th style={{ width: "200px" }}>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                              onClick={() => requestSort("email")}
                              aria-label={`Trier par email ${sortConfig?.key === "email" ? (sortConfig.direction === "asc" ? "croissant" : "décroissant") : ""}`}
                            >
                              <FontAwesomeIcon
                                icon={faEnvelope}
                                className="me-1"
                              />
                              Email
                              {getSortIcon("email")}
                            </button>
                          </th>
                          <th style={{ width: "150px" }}>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                              onClick={() => requestSort("telephone")}
                              aria-label={`Trier par téléphone ${sortConfig?.key === "telephone" ? (sortConfig.direction === "asc" ? "croissant" : "décroissant") : ""}`}
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
                              aria-label={`Trier par civilité ${sortConfig?.key === "civilite.libelle" ? (sortConfig.direction === "asc" ? "croissant" : "décroissant") : ""}`}
                            >
                              Civilité
                              {getSortIcon("civilite.libelle")}
                            </button>
                          </th>
                          <th style={{ width: "120px" }}>
                            <span className="fw-semibold">Statut</span>
                          </th>
                          <th style={{ width: "150px" }}>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                              onClick={() => requestSort("created_at")}
                              aria-label={`Trier par date de création ${sortConfig?.key === "created_at" ? (sortConfig.direction === "asc" ? "croissant" : "décroissant") : ""}`}
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
                        {currentItems.map((agent, index) => (
                          <tr
                            key={agent.uuid}
                            className={`align-middle ${selectedAgents.includes(agent.uuid) ? "table-active" : ""}`}
                          >
                            <td className="text-center">
                              <div className="form-check">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={selectedAgents.includes(agent.uuid)}
                                  onChange={() => handleSelectAgent(agent.uuid)}
                                  aria-label={`Sélectionner ${agent.nom} ${agent.prenoms}`}
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
                                    className="bg-info bg-opacity-10 text-info rounded-circle d-flex align-items-center justify-content-center"
                                    style={{ width: "40px", height: "40px" }}
                                  >
                                    <FontAwesomeIcon icon={faUser} />
                                  </div>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                  <div className="fw-semibold">
                                    {agent.nom} {agent.prenoms}
                                  </div>
                                  <div className="text-muted fs-12">
                                    ID: {agent.id}
                                    {agent.matricule && ` | ${agent.matricule}`}
                                  </div>
                                  {agent.is_admin && (
                                    <span className="badge bg-warning bg-opacity-10 text-warning fs-11 px-2 py-1">
                                      <FontAwesomeIcon
                                        icon={faShield}
                                        className="me-1"
                                      />
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
                                  title={agent.email}
                                >
                                  {agent.email}
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
                                  {agent.telephone}
                                </span>
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark border">
                                {agent.civilite?.libelle || "N/A"}
                              </span>
                            </td>
                            <td>
                              <StatusBadge
                                est_bloque={agent.est_bloque}
                                is_deleted={agent.is_deleted}
                                est_verifie={agent.est_verifie}
                                statut={agent.statut}
                              />
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <FontAwesomeIcon
                                  icon={faCalendar}
                                  className="text-muted me-2"
                                />
                                <small className="text-muted">
                                  {formatDate(agent.created_at)}
                                </small>
                              </div>
                            </td>
                            <td className="text-center">
                              <div
                                className="btn-group btn-group-sm"
                                role="group"
                                aria-label={`Actions pour ${agent.nom} ${agent.prenoms}`}
                              >
                                <Link
                                  href={`/dashboard-admin/agents/${agent.uuid}`}
                                  className="btn btn-outline-primary"
                                  title="Voir détails"
                                  aria-label="Voir les détails"
                                >
                                  <FontAwesomeIcon icon={faEye} />
                                </Link>
                                <button
                                  className="btn btn-outline-warning"
                                  title="Modifier"
                                  onClick={() => {
                                    setSelectedAgentForEdit(agent);
                                    setShowEditModal(true);
                                  }}
                                  disabled={loading}
                                  aria-label="Modifier l'agent"
                                >
                                  <FontAwesomeIcon icon={faEdit} />
                                </button>
                                <button
                                  className={`btn ${agent.est_bloque ? "btn-outline-success" : "btn-outline-secondary"}`}
                                  title={
                                    agent.est_bloque ? "Débloquer" : "Bloquer"
                                  }
                                  onClick={() => handleToggleBlock(agent)}
                                  disabled={loading}
                                  aria-label={
                                    agent.est_bloque
                                      ? "Débloquer l'agent"
                                      : "Bloquer l'agent"
                                  }
                                >
                                  <FontAwesomeIcon
                                    icon={
                                      agent.est_bloque ? faCheckCircle : faBan
                                    }
                                  />
                                </button>
                                <button
                                  className="btn btn-outline-danger"
                                  title="Supprimer"
                                  onClick={() => openDeleteModal(agent)}
                                  disabled={loading}
                                  aria-label="Supprimer l'agent"
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
                        totalItems={filteredAgents.length}
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

        .fs-12 {
          font-size: 12px !important;
        }
      `}</style>
    </>
  );
}
