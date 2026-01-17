// app/(back-office)/dashboard-admin/agents/liste-agents-bloques/page.tsx
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
  faBriefcase,
  faBuilding,
  faIdCard,
  faUnlock,
  faExclamationTriangle,
  faSpinner,
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
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import CreateAgentModal from "../../agents/components/modals/CreateAgentModal";
import EditAgentModal from "../../agents/components/modals/EditAgentModal";

// Types
interface Agent {
  uuid: string;
  nom: string;
  prenoms: string;
  email: string;
  telephone: string;
  civilite_uuid: string;
  role_uuid: string;
  est_verifie: boolean;
  est_bloque: boolean;
  is_admin: boolean;
  matricule?: string;
  date_embauche?: string;
  departement?: string;
  fonction?: string;
  salaire?: string;
  adresse?: string;
  ville?: string;
  code_postal?: string;
  commentaire?: string;
  created_at?: string;
  updated_at?: string;
  civilite?: {
    libelle: string;
  };
  role?: {
    name: string;
  };
}

// Composant de statut
const StatusBadge = ({ est_bloque }: { est_bloque: boolean }) => {
  if (est_bloque) {
    return (
      <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 d-inline-flex align-items-center gap-1">
        <FontAwesomeIcon icon={faBan} className="fs-12" />
        <span>Bloqué</span>
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
                    Cette action est irréversible. Toutes les données associées
                    à cet agent seront perdues.
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
                    Cette action est irréversible. Toutes les données associées
                    à ces agents seront perdues.
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

export default function ListeAgentsBloquesPage() {
  // États pour les données
  const [agents, setAgents] = useState<Agent[]>([]);
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteMultipleModal, setShowDeleteMultipleModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedAgentForEdit, setSelectedAgentForEdit] =
    useState<Agent | null>(null);

  // États pour les filtres et recherche
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("blocked");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Agent | "role.name" | "civilite.libelle";
    direction: "asc" | "desc";
  } | null>(null);

  // États pour la sélection multiple
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Options pour les éléments par page
  const itemsPerPageOptions = [5, 10, 20, 50];

  // Fonction pour charger les agents bloqués
  const fetchBlockedAgents = useCallback(
    async (params?: {
      page?: number;
      limit?: number;
      search?: string;
      role?: string;
    }) => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams();
        queryParams.append(
          "page",
          (params?.page || pagination.page).toString(),
        );
        queryParams.append(
          "limit",
          (params?.limit || pagination.limit).toString(),
        );
        if (params?.search) queryParams.append("search", params.search);
        if (params?.role && params.role !== "all")
          queryParams.append("role", params.role);

        // Toujours filtrer par agents bloqués
        queryParams.append("est_bloque", "true");

        const queryString = queryParams.toString();
        const endpoint = queryString
          ? `${API_ENDPOINTS.ADMIN.AGENTS.LIST}?${queryString}`
          : `${API_ENDPOINTS.ADMIN.AGENTS.LIST}?est_bloque=true`;

        console.log("📡 Fetching blocked agents from:", endpoint);

        const response = await api.get(endpoint);

        console.log("🔍 DEBUG - Full API Response:", {
          response,
          responseData: response.data,
          responseDataType: typeof response.data,
          isArray: Array.isArray(response.data),
          firstItem: response.data?.[0],
          length: response.data?.length,
        });

        // VOTRE API PROXY RETOURNE DIRECTEMENT UN TABLEAU
        let agentsData: Agent[] = [];
        let totalCount = 0;

        if (Array.isArray(response.data)) {
          agentsData = response.data;
          totalCount = response.data.length;
          console.log(
            "✅ API returned array directly, count:",
            agentsData.length,
          );
        } else if (response.data && typeof response.data === "object") {
          if ("data" in response.data && Array.isArray(response.data.data)) {
            agentsData = response.data.data;
            totalCount = response.data.count || response.data.data.length;
            console.log(
              "✅ API returned structured object, count:",
              agentsData.length,
            );
          } else if (
            "agents" in response.data &&
            Array.isArray(response.data.agents)
          ) {
            agentsData = response.data.agents;
            totalCount = response.data.count || response.data.agents.length;
            console.log(
              "✅ API returned agents object, count:",
              agentsData.length,
            );
          }
        }

        console.log("📊 Final parsed data:", {
          agentsCount: agentsData.length,
          totalCount,
          firstAgent: agentsData[0],
        });

        if (agentsData.length > 0) {
          setAgents(agentsData);
          setPagination((prev) => ({
            ...prev,
            page: params?.page || prev.page,
            limit: params?.limit || prev.limit,
            total: totalCount,
            pages: Math.ceil(totalCount / (params?.limit || prev.limit)) || 1,
          }));
        } else {
          console.log("📭 No agents found");
          setAgents([]);
          setPagination((prev) => ({
            ...prev,
            total: 0,
            pages: 1,
          }));
        }
      } catch (err: any) {
        console.error("🚨 Error fetching blocked agents:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });

        let errorMessage = "Erreur lors du chargement des agents bloqués";

        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        setAgents([]);
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.limit],
  );

  // Charger les agents au montage
  useEffect(() => {
    fetchBlockedAgents();
  }, []);

  // Gérer les changements de pagination et filtres
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchBlockedAgents({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm.trim() || undefined,
        role: selectedRole !== "all" ? selectedRole : undefined,
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [
    pagination.page,
    pagination.limit,
    searchTerm,
    selectedRole,
    fetchBlockedAgents,
  ]);

  // Fonction pour débloquer un agent
  const handleUnblockAgent = async (agent: Agent) => {
    try {
      setLoading(true);

      console.log("🔓 Unblocking agent:", agent.uuid);

      const response = await api.post(
        API_ENDPOINTS.ADMIN.AGENTS.UNBLOCK(agent.uuid),
      );

      console.log("✅ Unblock response:", response);

      if (response.data?.status === "success") {
        // Retirer de la sélection si sélectionné
        setSelectedAgents((prev) => prev.filter((id) => id !== agent.uuid));

        // Rafraîchir la liste
        await fetchBlockedAgents();

        setSuccessMessage(
          `Agent ${agent.nom} ${agent.prenoms} débloqué avec succès`,
        );
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError("Erreur lors du déblocage de l'agent");
      }
    } catch (err: any) {
      console.error("❌ Error unblocking agent:", err);
      setError(
        err.response?.data?.message || "Erreur lors du déblocage de l'agent",
      );
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour débloquer plusieurs agents
  const handleBulkUnblock = async () => {
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
          const response = await api.post(
            API_ENDPOINTS.ADMIN.AGENTS.UNBLOCK(agentId),
          );

          if (response.data?.status === "success") {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (err) {
          console.error(`Erreur pour l'agent ${agentId}:`, err);
          errorCount++;
        }
      }

      setSuccessMessage(
        `${successCount} agent(s) débloqué(s) avec succès${errorCount > 0 ? ` (${errorCount} échec(s))` : ""}`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);

      // Rafraîchir la liste
      await fetchBlockedAgents();

      // Réinitialiser la sélection
      setSelectedAgents([]);
      setSelectAll(false);
    } catch (err) {
      console.error("Erreur lors du déblocage en masse:", err);
      setInfoMessage("Erreur lors du déblocage en masse");
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Fonction pour supprimer un agent
  const handleDeleteAgent = async () => {
    if (!selectedAgent) return;

    try {
      setDeleteLoading(true);

      console.log("🗑️ Deleting agent:", selectedAgent.uuid);

      const response = await api.delete(
        API_ENDPOINTS.ADMIN.AGENTS.DELETE(selectedAgent.uuid),
      );

      console.log("✅ Delete response:", response);

      setShowDeleteModal(false);
      setSelectedAgent(null);

      // Rafraîchir la liste
      await fetchBlockedAgents();

      setSuccessMessage("Agent supprimé avec succès");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("❌ Error deleting agent:", err);
      setError(
        err.response?.data?.message ||
          "Erreur lors de la suppression de l'agent",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // Fonction pour supprimer plusieurs agents
  const handleDeleteMultipleAgents = async () => {
    if (selectedAgents.length === 0) return;

    try {
      setDeleteLoading(true);
      let successCount = 0;
      let errorCount = 0;

      for (const agentId of selectedAgents) {
        try {
          await api.delete(API_ENDPOINTS.ADMIN.AGENTS.DELETE(agentId));
          successCount++;
        } catch (err) {
          console.error(`Erreur pour l'agent ${agentId}:`, err);
          errorCount++;
        }
      }

      setShowDeleteMultipleModal(false);
      setSuccessMessage(
        `${successCount} agent(s) supprimé(s) avec succès${errorCount > 0 ? ` (${errorCount} échec(s))` : ""}`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);

      // Réinitialiser la sélection
      setSelectedAgents([]);
      setSelectAll(false);

      // Rafraîchir la liste
      await fetchBlockedAgents();
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

  // Fonction pour exporter les agents bloqués
  // Fonction pour exporter les agents bloqués
  const handleExport = async () => {
    try {
      console.log("📄 Exporting blocked agents...");

      // Option 1: If your API wrapper supports responseType
      // Check your API wrapper implementation first

      // Option 2: Use fetch directly for binary data
      const response = await fetch(
        API_ENDPOINTS.ADMIN.AGENTS.EXPORT_BLOCKED_PDF,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Add auth if needed
            // Add other headers as needed
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `agents-bloques-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccessMessage("Export PDF réussi");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("❌ Error exporting PDF:", err);
      // Fallback CSV export
      handleCSVExport();
    }
  };

  // Fallback CSV export
  const handleCSVExport = () => {
    if (agents.length === 0) {
      setError("Aucun agent à exporter");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const csvContent = [
        [
          "Matricule",
          "Nom",
          "Prénoms",
          "Email",
          "Téléphone",
          "Civilité",
          "Rôle",
          "Département",
          "Fonction",
          "Date d'embauche",
          "Statut",
          "Créé le",
          "Bloqué le",
        ],
        ...filteredAgents.map((a) => [
          a.matricule || "N/A",
          a.nom || "",
          a.prenoms || "",
          a.email || "",
          a.telephone || "",
          a.civilite?.libelle || "Non spécifié",
          a.role?.name || "Agent",
          a.departement || "N/A",
          a.fonction || "N/A",
          a.date_embauche ? formatDate(a.date_embauche) : "N/A",
          "Bloqué",
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
        `agents-bloques-${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccessMessage("Export CSV réussi");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("❌ Error exporting CSV:", err);
      setError("Erreur lors de l'export CSV");
      setTimeout(() => setError(null), 3000);
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
      }).format(date);
    } catch {
      return "N/A";
    }
  };

  // Fonction pour formater la date avec heure
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

      // Gérer les valeurs null/undefined
      if (aValue == null) aValue = "";
      if (bValue == null) bValue = "";

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
  const handleBulkAction = async (action: "unblock" | "delete") => {
    if (selectedAgents.length === 0) {
      setInfoMessage("Veuillez sélectionner au moins un agent");
      setTimeout(() => setInfoMessage(null), 3000);
      return;
    }

    try {
      setBulkActionLoading(true);

      switch (action) {
        case "unblock":
          await handleBulkUnblock();
          break;
        case "delete":
          // Pour la suppression, on utilise la modal de confirmation
          setShowDeleteMultipleModal(true);
          setBulkActionLoading(false);
          return;
      }
    } catch (err) {
      console.error("Erreur lors de l'action en masse:", err);
      setInfoMessage("Erreur lors de l'action en masse");
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Filtrer et trier les agents
  // Filtrer et trier les agents
  const filteredAgents = sortAgents(
    agents.filter((agent) => {
      // Toujours filtrer par statut bloqué
      if (agent.est_bloque !== true) return false;

      // Filtre par rôle
      if (selectedRole !== "all") {
        if (selectedRole === "admin" && agent.is_admin !== true) return false;
        if (selectedRole === "agent" && agent.is_admin !== false) return false;
      }

      // Filtre par recherche
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          agent.nom?.toLowerCase().includes(searchLower) ||
          agent.prenoms?.toLowerCase().includes(searchLower) ||
          agent.email?.toLowerCase().includes(searchLower) ||
          agent.telephone?.includes(searchTerm) ||
          agent.matricule?.toLowerCase().includes(searchLower) ||
          agent.fonction?.toLowerCase().includes(searchLower) ||
          agent.departement?.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      return true;
    }),
  );

  const currentItems = filteredAgents.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit,
  );

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedRole("all");
    setSortConfig(null);
    setPagination((prev) => ({ ...prev, page: 1 }));
    setSelectedAgents([]);
    setSelectAll(false);
  };

  // Fonction appelée après création réussie
  const handleAgentCreated = () => {
    setSuccessMessage("Agent créé avec succès !");
    fetchBlockedAgents();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Fonction appelée après modification réussie
  const handleAgentUpdated = () => {
    setSuccessMessage("Agent modifié avec succès !");
    fetchBlockedAgents();
    setTimeout(() => setSuccessMessage(null), 3000);
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

  // Afficher les données pour débogage
  console.log("🔍 Current agents state:", {
    agentsCount: agents.length,
    filteredCount: filteredAgents.length,
    currentItemsCount: currentItems.length,
    pagination,
    loading,
    error,
    selectedAgentsCount: selectedAgents.length,
  });

  return (
    <>
      {/* Modal de création d'agent */}
      <CreateAgentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleAgentCreated}
      />

      {/* Modal de modification d'agent */}
      <EditAgentModal
        isOpen={showEditModal}
        agent={selectedAgentForEdit}
        onClose={() => {
          setShowEditModal(false);
          setSelectedAgentForEdit(null);
        }}
        onSuccess={handleAgentUpdated}
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
                <p className="text-muted mb-1">Gestion des Agents Bloqués</p>
                <div className="d-flex align-items-center gap-3">
                  <h2 className="h4 mb-0 fw-bold">Liste des Agents Bloqués</h2>
                  <span className="badge bg-danger bg-opacity-10 text-danger border border-danger">
                    {pagination.total} agent(s) bloqué(s)
                    {selectedAgents.length > 0 &&
                      ` (${selectedAgents.length} sélectionné(s))`}
                  </span>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <Link
                  href="/dashboard-admin/agents/liste-agents"
                  className="btn btn-outline-primary d-flex align-items-center gap-2"
                  aria-label="Voir les agents actifs"
                >
                  <FontAwesomeIcon icon={faUser} />
                  Voir les agents actifs
                </Link>

                <button
                  onClick={() => fetchBlockedAgents()}
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  disabled={loading}
                  aria-label="Rafraîchir la liste"
                >
                  <FontAwesomeIcon icon={faRefresh} spin={loading} />
                  Rafraîchir
                </button>

                <button
                  onClick={handleExport}
                  className="btn btn-outline-primary d-flex align-items-center gap-2"
                  disabled={agents.length === 0 || loading}
                  aria-label="Exporter les données"
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Exporter PDF
                </button>

                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-success d-flex align-items-center gap-2"
                  disabled={loading}
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
                  aria-label="Fermer l'alerte"
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
                    onClick={() => handleBulkAction("unblock")}
                    disabled={bulkActionLoading}
                    aria-label="Débloquer les agents sélectionnés"
                  >
                    <FontAwesomeIcon icon={faUnlock} />
                    <span>Débloquer</span>
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
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faSearch} className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Rechercher par nom, prénom, email, téléphone ou matricule..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                    aria-label="Rechercher des agents bloqués"
                  />
                </div>
              </div>

              <div className="col-md-3">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon
                      icon={faBriefcase}
                      className="text-muted"
                    />
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
                    <option value="agent">Agents</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>
              </div>

              <div className="col-md-3">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faFilter} className="text-muted" />
                  </span>
                  <select
                    className="form-select border-start-0 ps-0"
                    value={pagination.limit}
                    onChange={(e) =>
                      setPagination((prev) => ({
                        ...prev,
                        limit: Number(e.target.value),
                        page: 1,
                      }))
                    }
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
            </div>

            <div className="row mt-3">
              <div className="col-md-6">
                <div className="d-flex align-items-center gap-2">
                  <small className="text-muted">
                    Total: <strong>{pagination.total}</strong> agents bloqués
                    {searchTerm && (
                      <>
                        {" "}
                        pour "<strong>{searchTerm}</strong>"
                      </>
                    )}
                    {selectedRole !== "all" && (
                      <>
                        {" "}
                        avec rôle "
                        <strong>
                          {selectedRole === "admin" ? "Admins" : "Agents"}
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
                  <button
                    onClick={resetFilters}
                    className="btn btn-sm btn-outline-secondary"
                    disabled={loading}
                    aria-label="Réinitialiser les filtres"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tableau des agents */}
          <div className="table-responsive">
            {loading ? (
              <div className="text-center py-5">
                <div
                  className="spinner-border text-primary"
                  role="status"
                  aria-hidden="true"
                >
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-3">Chargement des agents bloqués...</p>
              </div>
            ) : (
              <>
                {filteredAgents.length === 0 ? (
                  <div className="text-center py-5">
                    <div
                      className="alert alert-info mx-auto"
                      style={{ maxWidth: "500px" }}
                    >
                      <div className="d-flex flex-column align-items-center">
                        <FontAwesomeIcon
                          icon={faSearch}
                          className="fs-1 mb-3 text-info"
                        />
                        <h5 className="alert-heading mb-2">
                          {agents.length === 0
                            ? "Aucun agent bloqué"
                            : "Aucun résultat"}
                        </h5>
                        <p className="mb-0 text-center">
                          {agents.length === 0
                            ? "Aucun agent n'est actuellement bloqué dans le système."
                            : "Aucun agent bloqué ne correspond à vos critères de recherche."}
                        </p>
                        {searchTerm && (
                          <button
                            onClick={resetFilters}
                            className="btn btn-outline-primary mt-3"
                            aria-label="Effacer la recherche"
                          >
                            <FontAwesomeIcon icon={faFilter} className="me-2" />
                            Effacer la recherche
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
                          <th style={{ width: "180px" }}>
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
                          <th style={{ width: "120px" }}>
                            <span className="fw-semibold">
                              <FontAwesomeIcon
                                icon={faBriefcase}
                                className="me-1"
                              />
                              Rôle
                            </span>
                          </th>
                          <th style={{ width: "120px" }}>
                            <span className="fw-semibold">Statut</span>
                          </th>
                          <th style={{ width: "150px" }}>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                              onClick={() => requestSort("updated_at")}
                              aria-label={`Trier par date de blocage ${sortConfig?.key === "updated_at" ? (sortConfig.direction === "asc" ? "croissant" : "décroissant") : ""}`}
                            >
                              <FontAwesomeIcon
                                icon={faCalendar}
                                className="me-1"
                              />
                              Bloqué le
                              {getSortIcon("updated_at")}
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
                                    className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center"
                                    style={{ width: "40px", height: "40px" }}
                                  >
                                    <FontAwesomeIcon icon={faUser} />
                                  </div>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                  <div className="fw-semibold">
                                    {agent.nom} {agent.prenoms}
                                  </div>
                                  <small className="text-muted">
                                    {agent.civilite?.libelle}
                                  </small>
                                  {agent.is_admin && (
                                    <span className="badge bg-info bg-opacity-10 text-info fs-11 px-2 py-1 ms-2">
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
                              <span
                                className={`badge ${agent.is_admin ? "bg-primary" : "bg-secondary"} bg-opacity-10 text-dark border`}
                              >
                                {agent.role?.name || "Agent"}
                              </span>
                            </td>
                            <td>
                              <StatusBadge
                                est_bloque={agent.est_bloque || false}
                              />
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <FontAwesomeIcon
                                  icon={faCalendar}
                                  className="text-muted me-2"
                                />
                                <small className="text-muted">
                                  {formatDateTime(agent.updated_at)}
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
                                  className="btn btn-outline-success"
                                  title="Débloquer"
                                  onClick={() => handleUnblockAgent(agent)}
                                  disabled={loading}
                                  aria-label="Débloquer l'agent"
                                >
                                  <FontAwesomeIcon icon={faUnlock} />
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

      {/* Styles inline */}
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

        .fs-11 {
          font-size: 11px !important;
        }

        .text-truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>
    </>
  );
}
