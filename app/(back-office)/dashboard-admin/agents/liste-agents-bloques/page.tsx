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
  faArrowLeft,
  faFileExport,
  faSync,
  faEllipsisV,
  faUserLock,
  faUserTimes,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";

// Types
interface Civilite {
  libelle: string;
  uuid: string;
}

interface Role {
  name: string;
  uuid: string;
}

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
  is_deleted: boolean;
  matricule?: string;
  date_embauche?: string;
  departement?: string;
  fonction?: string;
  salaire?: string;
  adresse?: string;
  ville?: string;
  code_postal?: string;
  commentaire?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  civilite?: Civilite;
  role?: Role;
  statut?: string;
  avatar?: string;
  indicatif?: string;
}

// Composant de statut
const StatusBadge = ({ est_bloque }: { est_bloque: boolean }) => {
  if (est_bloque) {
    return (
      <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 d-inline-flex align-items-center gap-1 px-3 py-2">
        <FontAwesomeIcon icon={faBan} className="fs-12" />
        <span className="fw-semibold">Bloqué</span>
      </span>
    );
  }

  return (
    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 d-inline-flex align-items-center gap-1 px-3 py-2">
      <FontAwesomeIcon icon={faUserCheck} className="fs-12" />
      <span className="fw-semibold">Actif</span>
    </span>
  );
};

// Composant de modal de confirmation
const ConfirmationModal = ({
  show,
  title,
  message,
  confirmText,
  cancelText = "Annuler",
  loading,
  onClose,
  onConfirm,
  variant = "danger",
}: {
  show: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
  variant?: "danger" | "success" | "warning" | "info";
}) => {
  if (!show) return null;

  const variantColors = {
    danger: {
      bg: "bg-danger",
      text: "text-white",
      icon: faExclamationTriangle,
    },
    success: {
      bg: "bg-success",
      text: "text-white",
      icon: faCheckCircle,
    },
    warning: {
      bg: "bg-warning",
      text: "text-dark",
      icon: faExclamationTriangle,
    },
    info: {
      bg: "bg-info",
      text: "text-white",
      icon: faInfoCircle,
    },
  };

  const colors = variantColors[variant];

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
          <div className={`modal-header ${colors.bg} ${colors.text} border-0`}>
            <h5 className="modal-title">
              <FontAwesomeIcon icon={colors.icon} className="me-2" />
              {title}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={loading}
              aria-label="Fermer"
            ></button>
          </div>
          <div className="modal-body p-4">
            <div className="d-flex align-items-start">
              <div
                className={`rounded-circle p-3 ${colors.bg} bg-opacity-10 me-3`}
              >
                <FontAwesomeIcon
                  icon={colors.icon}
                  className={`${colors.text.replace("text-", "text-")}`}
                />
              </div>
              <div>
                <h6 className="mb-2">{message}</h6>
                <p className="text-muted mb-0">
                  Cette action ne peut pas être annulée.
                </p>
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
              {cancelText}
            </button>
            <button
              type="button"
              className={`btn ${colors.bg} ${colors.text}`}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Traitement...
                </>
              ) : (
                confirmText
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
          <span className="fw-semibold">{totalItems}</span> agent(s)
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
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkUnblockModal, setShowBulkUnblockModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // États pour les filtres et recherche
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Agent | "role.name" | "civilite.libelle";
    direction: "asc" | "desc";
  } | null>(null);

  // États pour la sélection multiple
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Options pour les éléments par page
  const itemsPerPageOptions = [5, 10, 20, 50];

  // ✅ CORRIGÉ : Fonction pour charger les agents bloqués
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

        // ✅ CORRECTION : Utiliser la route spécifique pour les agents bloqués
        const endpoint = API_ENDPOINTS.ADMIN.AGENTS.BLOCKED; // "/admin/liste-agents-bloques"

        console.log("📡 Fetching blocked agents from:", endpoint);

        // ✅ CORRECTION : L'API retourne directement { data: [...], count: X, status: "success" }
        const response = await api.get<{
          data: Agent[];
          count: number;
          status: string;
        }>(endpoint);

        console.log("✅ API Response structure:", {
          hasData: !!response.data,
          dataIsArray: Array.isArray(response.data),
          dataLength: response.data?.length,
          count: response.count,
          status: response.status,
        });

        // ✅ CORRECTION : Votre API retourne response.data qui contient déjà les agents
        // Structure: { data: [...], count: 2, status: "success" }
        const agentsData = response.data || [];
        const totalCount = response.count || 0;

        console.log("📊 Agents data loaded:", {
          count: agentsData.length,
          firstAgent: agentsData[0],
        });

        // Filtrer uniquement les agents bloqués (sécurité supplémentaire)
        const blockedAgents = agentsData.filter(
          (agent) => agent.est_bloque === true,
        );

        setAgents(blockedAgents);
        setPagination((prev) => ({
          ...prev,
          page: params?.page || 1,
          limit: params?.limit || prev.limit,
          total: totalCount,
          pages: Math.ceil(totalCount / (params?.limit || prev.limit)) || 1,
        }));
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
        setPagination((prev) => ({ ...prev, total: 0, pages: 1 }));
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Charger les agents au montage
  useEffect(() => {
    fetchBlockedAgents();
  }, []);

  // ✅ CORRIGÉ : Fonction pour débloquer un agent
  const handleUnblockAgent = async (agent: Agent) => {
    try {
      setActionLoading(true);
      setError(null);

      console.log("🔓 Unblocking agent:", agent.uuid);

      const response = await api.post(
        API_ENDPOINTS.ADMIN.AGENTS.UNBLOCK(agent.uuid),
      );

      console.log("✅ Unblock response:", response);

      // Mettre à jour localement
      setAgents((prev) => prev.filter((a) => a.uuid !== agent.uuid));
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));

      setSuccessMessage(
        `Agent ${agent.nom} ${agent.prenoms} débloqué avec succès`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);

      setShowUnblockModal(false);
      setSelectedAgent(null);
    } catch (err: any) {
      console.error("❌ Error unblocking agent:", err);
      setError(
        err.response?.data?.message || "Erreur lors du déblocage de l'agent",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ CORRIGÉ : Fonction pour supprimer un agent
  const handleDeleteAgent = async () => {
    if (!selectedAgent) return;

    try {
      setActionLoading(true);
      setError(null);

      console.log("🗑️ Deleting agent:", selectedAgent.uuid);

      const response = await api.delete(
        API_ENDPOINTS.ADMIN.AGENTS.DELETE(selectedAgent.uuid),
      );

      console.log("✅ Delete response:", response);

      // Mettre à jour localement
      setAgents((prev) => prev.filter((a) => a.uuid !== selectedAgent.uuid));
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));

      setSuccessMessage(
        `Agent ${selectedAgent.nom} ${selectedAgent.prenoms} supprimé avec succès`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);

      setShowDeleteModal(false);
      setSelectedAgent(null);
    } catch (err: any) {
      console.error("❌ Error deleting agent:", err);
      setError(
        err.response?.data?.message ||
          "Erreur lors de la suppression de l'agent",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ CORRIGÉ : Fonction pour débloquer plusieurs agents
  const handleBulkUnblock = async () => {
    if (selectedAgents.length === 0) {
      setInfoMessage("Veuillez sélectionner au moins un agent");
      setTimeout(() => setInfoMessage(null), 3000);
      return;
    }

    try {
      setActionLoading(true);
      setError(null);

      let successCount = 0;
      const errors: string[] = [];

      for (const agentId of selectedAgents) {
        try {
          await api.post(API_ENDPOINTS.ADMIN.AGENTS.UNBLOCK(agentId));
          successCount++;
        } catch (err: any) {
          console.error(`❌ Error unblocking agent ${agentId}:`, err);
          errors.push(
            `Agent ${agentId}: ${err.response?.data?.message || err.message}`,
          );
        }
      }

      // Mettre à jour localement
      setAgents((prev) => prev.filter((a) => !selectedAgents.includes(a.uuid)));
      setPagination((prev) => ({ ...prev, total: prev.total - successCount }));

      if (successCount === selectedAgents.length) {
        setSuccessMessage(`${successCount} agent(s) débloqué(s) avec succès`);
      } else {
        setSuccessMessage(
          `${successCount} agent(s) débloqué(s) sur ${selectedAgents.length}`,
        );
        if (errors.length > 0) {
          setInfoMessage(`Erreurs: ${errors.join("; ")}`);
        }
      }

      setTimeout(() => {
        setSuccessMessage(null);
        setInfoMessage(null);
      }, 5000);

      // Réinitialiser la sélection
      setSelectedAgents([]);
      setSelectAll(false);
      setShowBulkUnblockModal(false);
    } catch (err) {
      console.error("❌ Error in bulk unblock:", err);
      setError("Erreur lors du déblocage en masse");
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ CORRIGÉ : Fonction pour supprimer plusieurs agents
  const handleBulkDelete = async () => {
    if (selectedAgents.length === 0) {
      setInfoMessage("Veuillez sélectionner au moins un agent");
      setTimeout(() => setInfoMessage(null), 3000);
      return;
    }

    try {
      setActionLoading(true);
      setError(null);

      let successCount = 0;
      const errors: string[] = [];

      for (const agentId of selectedAgents) {
        try {
          await api.delete(API_ENDPOINTS.ADMIN.AGENTS.DELETE(agentId));
          successCount++;
        } catch (err: any) {
          console.error(`❌ Error deleting agent ${agentId}:`, err);
          errors.push(
            `Agent ${agentId}: ${err.response?.data?.message || err.message}`,
          );
        }
      }

      // Mettre à jour localement
      setAgents((prev) => prev.filter((a) => !selectedAgents.includes(a.uuid)));
      setPagination((prev) => ({ ...prev, total: prev.total - successCount }));

      if (successCount === selectedAgents.length) {
        setSuccessMessage(`${successCount} agent(s) supprimé(s) avec succès`);
      } else {
        setSuccessMessage(
          `${successCount} agent(s) supprimé(s) sur ${selectedAgents.length}`,
        );
        if (errors.length > 0) {
          setInfoMessage(`Erreurs: ${errors.join("; ")}`);
        }
      }

      setTimeout(() => {
        setSuccessMessage(null);
        setInfoMessage(null);
      }, 5000);

      // Réinitialiser la sélection
      setSelectedAgents([]);
      setSelectAll(false);
      setShowBulkDeleteModal(false);
    } catch (err) {
      console.error("❌ Error in bulk delete:", err);
      setError("Erreur lors de la suppression en masse");
    } finally {
      setActionLoading(false);
    }
  };

  // Fonction pour exporter en CSV
  const handleCSVExport = () => {
    if (agents.length === 0) {
      setError("Aucun agent à exporter");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const csvContent = [
        [
          "UUID",
          "Nom",
          "Prénoms",
          "Email",
          "Téléphone",
          "Civilité",
          "Rôle",
          "Statut",
          "Admin",
          "Bloqué",
          "Date de création",
          "Dernière mise à jour",
        ],
        ...agents.map((agent) => [
          agent.uuid || "",
          agent.nom || "",
          agent.prenoms || "",
          agent.email || "",
          agent.telephone || "",
          agent.civilite?.libelle || "Non spécifié",
          agent.role?.name || "Agent",
          agent.est_bloque ? "Bloqué" : "Actif",
          agent.is_admin ? "Oui" : "Non",
          agent.est_bloque ? "Oui" : "Non",
          formatDate(agent.created_at),
          formatDate(agent.updated_at),
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
  const formatDate = (dateString: string) => {
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

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedRole("all");
    setSortConfig(null);
    setPagination((prev) => ({ ...prev, page: 1 }));
    setSelectedAgents([]);
    setSelectAll(false);
  };

  // Filtrer et trier les agents
  const filteredAgents = sortAgents(
    agents.filter((agent) => {
      // Filtre par rôle
      if (selectedRole !== "all") {
        if (selectedRole === "admin" && !agent.is_admin) return false;
        if (selectedRole === "agent" && agent.is_admin) return false;
      }

      // Filtre par recherche
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          agent.nom?.toLowerCase().includes(searchLower) ||
          agent.prenoms?.toLowerCase().includes(searchLower) ||
          agent.email?.toLowerCase().includes(searchLower) ||
          agent.telephone?.includes(searchTerm) ||
          agent.matricule?.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      return true;
    }),
  );

  const currentItems = filteredAgents.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit,
  );

  // Effet pour mettre à jour selectAll
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
      {/* Modal de déblocage */}
      <ConfirmationModal
        show={showUnblockModal}
        title="Débloquer l'agent"
        message={`Êtes-vous sûr de vouloir débloquer l'agent ${selectedAgent?.nom} ${selectedAgent?.prenoms} ?`}
        confirmText="Débloquer"
        loading={actionLoading}
        onClose={() => {
          setShowUnblockModal(false);
          setSelectedAgent(null);
        }}
        onConfirm={() => selectedAgent && handleUnblockAgent(selectedAgent)}
        variant="success"
      />

      {/* Modal de suppression */}
      <ConfirmationModal
        show={showDeleteModal}
        title="Supprimer l'agent"
        message={`Êtes-vous sûr de vouloir supprimer définitivement l'agent ${selectedAgent?.nom} ${selectedAgent?.prenoms} ?`}
        confirmText="Supprimer définitivement"
        loading={actionLoading}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedAgent(null);
        }}
        onConfirm={handleDeleteAgent}
        variant="danger"
      />

      {/* Modal de déblocage multiple */}
      <ConfirmationModal
        show={showBulkUnblockModal}
        title="Débloquer plusieurs agents"
        message={`Êtes-vous sûr de vouloir débloquer ${selectedAgents.length} agent(s) sélectionné(s) ?`}
        confirmText={`Débloquer ${selectedAgents.length} agent(s)`}
        loading={actionLoading}
        onClose={() => setShowBulkUnblockModal(false)}
        onConfirm={handleBulkUnblock}
        variant="success"
      />

      {/* Modal de suppression multiple */}
      <ConfirmationModal
        show={showBulkDeleteModal}
        title="Supprimer plusieurs agents"
        message={`Êtes-vous sûr de vouloir supprimer définitivement ${selectedAgents.length} agent(s) sélectionné(s) ?`}
        confirmText={`Supprimer ${selectedAgents.length} agent(s)`}
        loading={actionLoading}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleBulkDelete}
        variant="danger"
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

        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="card-header bg-white border-0 py-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div>
                <div className="d-flex align-items-center gap-3">
                  <h2 className="h4 mb-0 fw-bold">
                    <FontAwesomeIcon
                      icon={faUserLock}
                      className="me-2 text-danger"
                    />
                    Liste des Agents Bloqués
                  </h2>
                  <span className="badge bg-danger bg-opacity-10 text-danger border border-danger">
                    {pagination.total} agent(s) bloqué(s)
                    {selectedAgents.length > 0 && (
                      <span className="ms-2 badge bg-primary">
                        {selectedAgents.length} sélectionné(s)
                      </span>
                    )}
                  </span>
                </div>
                <p className="text-muted mb-0 mt-2">
                  Gérez les agents qui ont été bloqués du système
                </p>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <button
                  onClick={() => fetchBlockedAgents()}
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faSync} spin={loading} />
                  Rafraîchir
                </button>

                <button
                  onClick={handleCSVExport}
                  className="btn btn-outline-primary d-flex align-items-center gap-2"
                  disabled={agents.length === 0 || loading}
                >
                  <FontAwesomeIcon icon={faFileExport} />
                  Exporter CSV
                </button>

                <Link
                  href="/dashboard-admin/agents/liste-agents"
                  className="btn btn-outline-success d-flex align-items-center gap-2"
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                  Retour aux agents
                </Link>
              </div>
            </div>
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
                    onClick={() => setShowBulkUnblockModal(true)}
                    disabled={actionLoading}
                  >
                    <FontAwesomeIcon icon={faUnlock} />
                    <span>Débloquer la sélection</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                    onClick={() => setShowBulkDeleteModal(true)}
                    disabled={actionLoading}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    <span>Supprimer la sélection</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1"
                    onClick={() => {
                      setSelectedAgents([]);
                      setSelectAll(false);
                    }}
                    disabled={actionLoading}
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
              <div className="col-md-6">
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
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="col-md-3">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon
                      icon={faUserShield}
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
                    disabled={loading}
                  >
                    <option value="all">Tous les rôles</option>
                    <option value="admin">Admins</option>
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
                    Résultats: <strong>{filteredAgents.length}</strong> agent(s)
                    bloqué(s)
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
                  {selectedAgents.length > 0 && (
                    <small className="text-primary fw-semibold">
                      {selectedAgents.length} sélectionné(s)
                    </small>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tableau des agents bloqués */}
          <div className="table-responsive">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-secondary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-3">Chargement des agents bloqués...</p>
              </div>
            ) : (
              <>
                {filteredAgents.length === 0 ? (
                  <div className="text-center py-5">
                    <div
                      className="alert alert-info mx-auto border-0"
                      style={{ maxWidth: "500px" }}
                    >
                      <div className="bg-info bg-opacity-10 rounded-circle p-4 d-inline-block mb-3">
                        <FontAwesomeIcon
                          icon={faUserTimes}
                          className="fs-1 text-info"
                        />
                      </div>
                      <h5 className="alert-heading">Aucun agent bloqué</h5>
                      <p className="mb-0">
                        {agents.length === 0
                          ? "Aucun agent n'est actuellement bloqué dans le système."
                          : "Aucun agent bloqué ne correspond à vos critères de recherche"}
                      </p>
                      <div className="mt-3">
                        <Link
                          href="/dashboard-admin/agents/liste-agents"
                          className="btn btn-outline-primary"
                        >
                          <FontAwesomeIcon
                            icon={faArrowLeft}
                            className="me-2"
                          />
                          Retour aux agents actifs
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
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent d-flex align-items-center"
                              onClick={() => requestSort("nom")}
                            >
                              Nom & Prénoms
                              {getSortIcon("nom")}
                            </button>
                          </th>
                          <th style={{ width: "200px" }}>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent d-flex align-items-center"
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
                          <th style={{ width: "150px" }}>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent d-flex align-items-center"
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
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent d-flex align-items-center"
                              onClick={() => requestSort("updated_at")}
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
                              <StatusBadge est_bloque={agent.est_bloque} />
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <FontAwesomeIcon
                                  icon={faCalendar}
                                  className="text-muted me-2"
                                />
                                <small className="text-muted">
                                  {formatDate(agent.updated_at)}
                                </small>
                              </div>
                            </td>
                            <td className="text-center">
                              <div
                                className="btn-group btn-group-sm"
                                role="group"
                              >
                                <Link
                                  href={`/dashboard-admin/agents/${agent.uuid}`}
                                  className="btn btn-outline-primary"
                                  title="Voir détails"
                                >
                                  <FontAwesomeIcon icon={faEye} />
                                </Link>
                                <button
                                  className="btn btn-outline-success"
                                  title="Débloquer"
                                  onClick={() => {
                                    setSelectedAgent(agent);
                                    setShowUnblockModal(true);
                                  }}
                                  disabled={actionLoading}
                                >
                                  <FontAwesomeIcon icon={faUnlock} />
                                </button>
                                <button
                                  className="btn btn-outline-danger"
                                  title="Supprimer"
                                  onClick={() => {
                                    setSelectedAgent(agent);
                                    setShowDeleteModal(true);
                                  }}
                                  disabled={actionLoading}
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
        .fs-11 {
          font-size: 11px !important;
        }
      `}</style>
    </>
  );
}
