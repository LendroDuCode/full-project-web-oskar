// app/(back-office)/dashboard-admin/civilites/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faEye,
  faTrash,
  faRefresh,
  faSearch,
  faFilter,
  faSort,
  faSortUp,
  faSortDown,
  faUser,
  faCheckCircle,
  faTimesCircle,
  faCalendar,
  faIdCard,
  faLanguage,
  faGlobe,
  faDownload,
  faSpinner,
  faExclamationTriangle,
  faClone,
  faToggleOn,
  faToggleOff,
  faEllipsisV,
  faChartBar,
  faCog,
  faSync,
  faCheckSquare,
  faSquare,
  faBars,
  faCheck,
  faBan,
  faPlay,
  faPause,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import CreateCiviliteModal from "@/app/(back-office)/dashboard-admin/civilites/components/modals/CreateCiviliteModal";
import EditCiviliteModal from "@/app/(back-office)/dashboard-admin/civilites/components/modals/EditCiviliteModal";

// Types
interface Civilite {
  id: number;
  uuid: string;
  statut: string;
  slug: string;
  libelle: string;
  adminUuid: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  is_deleted: boolean;
  deleted_at: string | null;
}

// Types pour les actions groupées
interface BulkAction {
  id: string;
  label: string;
  icon: any;
  action: (selectedIds: string[]) => Promise<void>;
  variant: "primary" | "secondary" | "success" | "warning" | "danger" | "info";
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

// Composant de statut
const StatusBadge = ({ statut }: { statut: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "actif":
        return {
          icon: faCheckCircle,
          color: "success",
          bgColor: "bg-success bg-opacity-10",
          textColor: "text-success",
          borderColor: "border-success border-opacity-25",
        };
      case "inactif":
        return {
          icon: faTimesCircle,
          color: "warning",
          bgColor: "bg-warning bg-opacity-10",
          textColor: "text-warning",
          borderColor: "border-warning border-opacity-25",
        };
      case "supprimé":
        return {
          icon: faTimesCircle,
          color: "danger",
          bgColor: "bg-danger bg-opacity-10",
          textColor: "text-danger",
          borderColor: "border-danger border-opacity-25",
        };
      default:
        return {
          icon: faExclamationTriangle,
          color: "secondary",
          bgColor: "bg-secondary bg-opacity-10",
          textColor: "text-secondary",
          borderColor: "border-secondary border-opacity-25",
        };
    }
  };

  const config = getStatusConfig(statut);

  return (
    <span
      className={`badge ${config.bgColor} ${config.textColor} ${config.borderColor} border d-inline-flex align-items-center gap-1`}
    >
      <FontAwesomeIcon icon={config.icon} className="fs-12" />
      <span className="text-capitalize">{statut}</span>
    </span>
  );
};

// Composant de modal de suppression
const DeleteModal = ({
  show,
  civilite,
  loading,
  onClose,
  onConfirm,
  isBulk = false,
  count = 0,
}: {
  show: boolean;
  civilite: Civilite | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isBulk?: boolean;
  count?: number;
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
          <div className="modal-header border-0 bg-danger text-white rounded-top-3">
            <h5 className="modal-title fw-bold">
              <FontAwesomeIcon icon={faTrash} className="me-2" />
              {isBulk ? "Suppression multiple" : "Confirmer la suppression"}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          <div className="modal-body p-4">
            <div className="alert alert-warning mb-3 border-0">
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
              <strong>Attention :</strong> Cette action est définitive
            </div>
            {isBulk ? (
              <>
                <p className="mb-3">
                  Êtes-vous sûr de vouloir supprimer{" "}
                  <strong>{count} civilité(s)</strong> ?
                </p>
                <div className="text-danger">
                  <small>
                    Cette action est irréversible. Toutes les données associées
                    seront perdues.
                  </small>
                </div>
              </>
            ) : (
              <>
                <p className="mb-3">
                  Êtes-vous sûr de vouloir supprimer la civilité{" "}
                  <strong>{civilite?.libelle}</strong> ({civilite?.slug}) ?
                </p>
                <div className="text-danger">
                  <small>
                    Cette action est irréversible. Toutes les données associées
                    à cette civilité seront perdues.
                  </small>
                </div>
              </>
            )}
          </div>
          <div className="modal-footer border-0">
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
                  {isBulk ? "Suppression en cours..." : "Suppression..."}
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faTrash} className="me-2" />
                  {isBulk
                    ? "Supprimer les civilités"
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
          <span className="fw-semibold">{totalItems}</span> civilités
        </div>

        <nav aria-label="Pagination">
          <ul className="pagination mb-0">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
              >
                «
              </button>
            </li>

            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
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

// Barre d'actions groupées
const BulkActionsBar = ({
  selectedCount,
  onSelectAll,
  onClearSelection,
  onBulkAction,
  isAllSelected,
  totalItems,
}: {
  selectedCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkAction: (action: string) => Promise<void>;
  isAllSelected: boolean;
  totalItems: number;
}) => {
  if (selectedCount === 0) return null;

  const bulkActions = [
    {
      id: "activate",
      label: "Activer",
      icon: faPlay,
      variant: "success" as const,
    },
    {
      id: "deactivate",
      label: "Désactiver",
      icon: faPause,
      variant: "warning" as const,
    },
    {
      id: "delete",
      label: "Supprimer",
      icon: faTrash,
      variant: "danger" as const,
      requiresConfirmation: true,
    },
  ];

  return (
    <div className="bg-primary bg-opacity-10 border-primary border-start border-5 p-3 mb-3 rounded">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        <div className="d-flex align-items-center gap-3">
          <div
            className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: "40px", height: "40px" }}
          >
            <FontAwesomeIcon icon={faCheck} />
          </div>
          <div>
            <h6 className="mb-0 fw-bold">
              {selectedCount} civilité(s) sélectionnée(s)
            </h6>
            <small className="text-muted">
              {isAllSelected
                ? "Toutes les civilités sont sélectionnées"
                : `${selectedCount} sur ${totalItems} civilités sélectionnées`}
            </small>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={onSelectAll}
          >
            {isAllSelected ? "Tout désélectionner" : "Tout sélectionner"}
          </button>

          {bulkActions.map((action) => (
            <button
              key={action.id}
              className={`btn btn-${action.variant} btn-sm d-flex align-items-center gap-2`}
              onClick={() => onBulkAction(action.id)}
            >
              <FontAwesomeIcon icon={action.icon} />
              {action.label}
            </button>
          ))}

          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={onClearSelection}
          >
            <FontAwesomeIcon icon={faBan} />
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default function CivilitesPage() {
  // États pour les données
  const [civilites, setCivilites] = useState<Civilite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // États pour la pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // États pour les modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCivilite, setSelectedCivilite] = useState<Civilite | null>(
    null,
  );

  // États pour la sélection multiple
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);

  // États pour les filtres et recherche
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Civilite;
    direction: "asc" | "desc";
  } | null>(null);

  // Options pour les éléments par page
  const itemsPerPageOptions = [5, 10, 20, 50];

  // Fonction pour charger les civilités
  const fetchCivilites = async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      queryParams.append("page", (params?.page || pagination.page).toString());
      queryParams.append(
        "limit",
        (params?.limit || pagination.limit).toString(),
      );

      if (params?.search) queryParams.append("search", params.search);
      if (params?.status && params.status !== "all")
        queryParams.append("status", params.status);

      const queryString = queryParams.toString();
      const endpoint = queryString
        ? `${API_ENDPOINTS.CIVILITES.LIST}?${queryString}`
        : API_ENDPOINTS.CIVILITES.LIST;

      const response = await api.get<Civilite[]>(endpoint);

      if (response && Array.isArray(response)) {
        setCivilites(response);

        const totalItems = response.length;
        const currentPage = params?.page || pagination.page;
        const currentLimit = params?.limit || pagination.limit;

        setPagination((prev) => ({
          page: currentPage,
          limit: currentLimit,
          total: totalItems,
          pages: Math.ceil(totalItems / currentLimit) || 1,
        }));

        // Réinitialiser la sélection après chargement
        setSelectedRows(new Set());
        setIsAllSelected(false);
      } else {
        setCivilites([]);
        setPagination((prev) => ({
          ...prev,
          total: 0,
          pages: 1,
        }));
      }
    } catch (err: any) {
      let errorMessage = "Erreur lors du chargement des civilités";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setCivilites([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger les civilités au montage
  useEffect(() => {
    fetchCivilites();
  }, []);

  // Gérer les changements de pagination et filtres avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCivilites({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [pagination.page, pagination.limit, searchTerm, selectedStatus]);

  // Gestion de la sélection multiple
  const handleRowSelect = (uuid: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(uuid)) {
      newSelected.delete(uuid);
    } else {
      newSelected.add(uuid);
    }
    setSelectedRows(newSelected);
    updateAllSelectedStatus(newSelected);
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedRows(new Set());
      setIsAllSelected(false);
    } else {
      const allUuids = new Set(filteredCivilites.map((c) => c.uuid));
      setSelectedRows(allUuids);
      setIsAllSelected(true);
    }
  };

  const handleSelectAllOnPage = () => {
    const pageUuids = new Set(currentItems.map((c) => c.uuid));
    const newSelected = new Set(selectedRows);

    // Vérifier si toutes les lignes de la page sont déjà sélectionnées
    const allPageSelected = currentItems.every((c) => newSelected.has(c.uuid));

    if (allPageSelected) {
      // Désélectionner toutes les lignes de la page
      pageUuids.forEach((uuid) => newSelected.delete(uuid));
    } else {
      // Sélectionner toutes les lignes de la page
      pageUuids.forEach((uuid) => newSelected.add(uuid));
    }

    setSelectedRows(newSelected);
    updateAllSelectedStatus(newSelected);
  };

  const updateAllSelectedStatus = (selectedSet: Set<string>) => {
    const allUuids = new Set(filteredCivilites.map((c) => c.uuid));
    setIsAllSelected(
      selectedSet.size === allUuids.size &&
        Array.from(allUuids).every((uuid) => selectedSet.has(uuid)),
    );
  };

  const clearSelection = () => {
    setSelectedRows(new Set());
    setIsAllSelected(false);
  };

  // Fonction pour supprimer une civilité
  const handleDeleteCivilite = async () => {
    if (!selectedCivilite) return;

    try {
      setLoading(true);
      setError(null);

      await api.delete(API_ENDPOINTS.CIVILITES.DELETE(selectedCivilite.uuid));

      setShowDeleteModal(false);
      setSelectedCivilite(null);
      clearSelection();

      await fetchCivilites();

      setSuccess("Civilité supprimée avec succès");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Erreur lors de la suppression de la civilité",
      );
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour la suppression multiple
  const handleBulkDelete = async () => {
    if (selectedRows.size === 0) return;

    try {
      setLoading(true);
      setError(null);

      // Supprimer chaque civilité sélectionnée
      const deletePromises = Array.from(selectedRows).map((uuid) =>
        api.delete(API_ENDPOINTS.CIVILITES.DELETE(uuid)),
      );

      await Promise.all(deletePromises);

      setShowBulkDeleteModal(false);
      clearSelection();

      await fetchCivilites();

      setSuccess(`${selectedRows.size} civilité(s) supprimée(s) avec succès`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Erreur lors de la suppression des civilités",
      );
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour activer/désactiver en masse
  const handleBulkStatusChange = async (newStatus: "actif" | "inactif") => {
    if (selectedRows.size === 0) return;

    try {
      setLoading(true);
      setError(null);

      // Mettre à jour chaque civilité sélectionnée
      const updatePromises = Array.from(selectedRows).map((uuid) =>
        api.put(API_ENDPOINTS.CIVILITES.UPDATE(uuid), {
          statut: newStatus,
        }),
      );

      await Promise.all(updatePromises);

      clearSelection();
      await fetchCivilites();

      setSuccess(
        `${selectedRows.size} civilité(s) ${newStatus === "actif" ? "activée(s)" : "désactivée(s)"} avec succès`,
      );
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          `Erreur lors de ${newStatus === "actif" ? "l'activation" : "la désactivation"} des civilités`,
      );
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Gestionnaire d'actions groupées
  const handleBulkAction = async (actionId: string) => {
    switch (actionId) {
      case "activate":
        await handleBulkStatusChange("actif");
        break;
      case "deactivate":
        await handleBulkStatusChange("inactif");
        break;
      case "delete":
        setShowBulkDeleteModal(true);
        break;
      default:
        break;
    }
  };

  // Fonction pour ouvrir le modal de suppression
  const openDeleteModal = (civilite: Civilite) => {
    setSelectedCivilite(civilite);
    setShowDeleteModal(true);
  };

  // Fonction pour ouvrir le modal d'édition
  const openEditModal = (civilite: Civilite) => {
    setSelectedCivilite(civilite);
    setShowEditModal(true);
  };

  // Fonction pour changer le statut d'une civilité
  const handleToggleStatus = async (civilite: Civilite) => {
    try {
      setLoading(true);
      setError(null);

      const newStatus = civilite.statut === "actif" ? "inactif" : "actif";

      await api.put(API_ENDPOINTS.CIVILITES.UPDATE(civilite.uuid), {
        statut: newStatus,
      });

      clearSelection();
      await fetchCivilites();

      setSuccess(`Statut changé à "${newStatus}" avec succès`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Erreur lors du changement de statut",
      );
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour exporter les civilités
  const handleExport = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.CIVILITES.EXPORT_PDF, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(response);
      const link = document.createElement("a");
      link.href = url;
      link.download = `civilites-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess("Export PDF réussi");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      handleCSVExport();
    }
  };

  // Fallback CSV export
  const handleCSVExport = () => {
    if (civilites.length === 0) {
      setError("Aucune civilité à exporter");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const csvContent = [
        ["ID", "UUID", "Libellé", "Slug", "Statut", "Créé le", "Modifié le"],
        ...civilites.map((c) => [
          c.id,
          c.uuid,
          c.libelle,
          c.slug,
          c.statut,
          formatDate(c.createdAt),
          formatDate(c.updatedAt),
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
        `civilites-${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccess("Export CSV réussi");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Erreur lors de l'export CSV");
      setTimeout(() => setError(null), 3000);
    }
  };

  // Fonction pour dupliquer une civilité
  const handleDuplicate = async (civilite: Civilite) => {
    try {
      setLoading(true);
      setError(null);

      const duplicateData = {
        libelle: `${civilite.libelle} (Copie)`,
        slug: `${civilite.slug}-copie`,
        statut: "actif",
      };

      await api.post(API_ENDPOINTS.CIVILITES.CREATE, duplicateData);

      clearSelection();
      await fetchCivilites();

      setSuccess("Civilité dupliquée avec succès");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Erreur lors de la duplication de la civilité",
      );
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString: string | null) => {
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

  // Fonction pour formater la date courte
  const formatDateShort = (dateString: string | null) => {
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

  // Fonction de tri
  const sortCivilites = (civilitesList: Civilite[]) => {
    if (!sortConfig || !civilitesList.length) return civilitesList;

    return [...civilitesList].sort((a, b) => {
      let aValue: any = a[sortConfig.key];
      let bValue: any = b[sortConfig.key];

      if (aValue == null) aValue = "";
      if (bValue == null) bValue = "";

      if (sortConfig.key === "createdAt" || sortConfig.key === "updatedAt") {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
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

  const requestSort = (key: keyof Civilite) => {
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

  const getSortIcon = (key: keyof Civilite) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <FontAwesomeIcon icon={faSort} className="text-muted ms-1" />;
    }
    return sortConfig.direction === "asc" ? (
      <FontAwesomeIcon icon={faSortUp} className="text-primary ms-1" />
    ) : (
      <FontAwesomeIcon icon={faSortDown} className="text-primary ms-1" />
    );
  };

  // Filtrer et trier les civilités avec useMemo pour la performance
  const filteredCivilites = useMemo(() => {
    let result = civilites;

    if (selectedStatus !== "all") {
      result = result.filter((c) => c.statut === selectedStatus);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.libelle.toLowerCase().includes(term) ||
          c.slug.toLowerCase().includes(term),
      );
    }

    return sortCivilites(result);
  }, [civilites, selectedStatus, searchTerm, sortConfig]);

  const currentItems = useMemo(() => {
    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit;
    return filteredCivilites.slice(start, end);
  }, [filteredCivilites, pagination.page, pagination.limit]);

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setSortConfig(null);
    setPagination((prev) => ({ ...prev, page: 1 }));
    clearSelection();
  };

  // Statistiques
  const stats = useMemo(() => {
    const total = civilites.length;
    const actifs = civilites.filter((c) => c.statut === "actif").length;
    const inactifs = civilites.filter((c) => c.statut === "inactif").length;
    const supprimes = civilites.filter((c) => c.is_deleted).length;

    return { total, actifs, inactifs, supprimes };
  }, [civilites]);

  // Fonction appelée après création/mise à jour réussie
  const handleSuccess = (message: string) => {
    setSuccess(message);
    clearSelection();
    fetchCivilites();
    setTimeout(() => setSuccess(null), 3000);
  };

  // Vérifier si une ligne de la page courante est sélectionnée
  const isPageAllSelected = useMemo(() => {
    return (
      currentItems.length > 0 &&
      currentItems.every((c) => selectedRows.has(c.uuid))
    );
  }, [currentItems, selectedRows]);

  return (
    <>
      {/* Modal de suppression unitaire */}
      <DeleteModal
        show={showDeleteModal}
        civilite={selectedCivilite}
        loading={loading}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedCivilite(null);
        }}
        onConfirm={handleDeleteCivilite}
      />

      {/* Modal de suppression multiple */}
      <DeleteModal
        show={showBulkDeleteModal}
        civilite={null}
        loading={loading}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleBulkDelete}
        isBulk={true}
        count={selectedRows.size}
      />

      {/* Modal de création */}
      <CreateCiviliteModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => handleSuccess("Civilité créée avec succès")}
      />

      {/* Modal de modification */}
      <EditCiviliteModal
        isOpen={showEditModal}
        civilite={selectedCivilite}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCivilite(null);
        }}
        onSuccess={() => handleSuccess("Civilité modifiée avec succès")}
      />

      <div className="p-3 p-md-4">
        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="card-header bg-white border-0 py-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div>
                <p className="text-muted mb-1">Administration</p>
                <div className="d-flex align-items-center gap-3">
                  <h2 className="h4 mb-0 fw-bold">
                    <FontAwesomeIcon
                      icon={faIdCard}
                      className="me-2 text-primary"
                    />
                    Liste des Civilités
                  </h2>
                  <span className="badge bg-primary bg-opacity-10 text-primary">
                    {stats.total} civilité(s)
                  </span>
                </div>
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

            {success && (
              <div
                className="alert alert-success alert-dismissible fade show mt-3 mb-0"
                role="alert"
              >
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                  <div>
                    <strong>Succès:</strong> {success}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSuccess(null)}
                  aria-label="Close"
                ></button>
              </div>
            )}
          </div>

          {/* Barre d'actions groupées */}
          {selectedRows.size > 0 && (
            <BulkActionsBar
              selectedCount={selectedRows.size}
              onSelectAll={handleSelectAll}
              onClearSelection={clearSelection}
              onBulkAction={handleBulkAction}
              isAllSelected={isAllSelected}
              totalItems={filteredCivilites.length}
            />
          )}

          {/* Filtres et recherche */}
          <div className="p-4 border-bottom bg-light-subtle">
            <div className="row g-3">
              <div className="col-md-5">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faSearch} className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Rechercher par libellé ou slug..."
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
                    <option value="actif">Actives</option>
                    <option value="inactif">Inactives</option>
                  </select>
                </div>
              </div>

              <div className="col-md-2">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faSort} className="text-muted" />
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
                  >
                    {itemsPerPageOptions.map((option) => (
                      <option key={option} value={option}>
                        {option} / page
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="col-md-2">
                <div className="d-flex gap-2">
                  <button
                    onClick={resetFilters}
                    className="btn btn-sm btn-outline-secondary w-100"
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={faSync} className="me-1" />
                    Réinitialiser
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tableau des civilités */}
          <div className="table-responsive">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-3">Chargement des civilités...</p>
              </div>
            ) : (
              <>
                {filteredCivilites.length === 0 ? (
                  <div className="text-center py-5">
                    <div
                      className="alert alert-info mx-auto"
                      style={{ maxWidth: "500px" }}
                    >
                      <div className="d-flex flex-column align-items-center">
                        <FontAwesomeIcon
                          icon={faIdCard}
                          className="fs-1 mb-3 text-info"
                        />
                        <h5 className="alert-heading mb-2">
                          {civilites.length === 0
                            ? "Aucune civilité trouvée"
                            : "Aucun résultat"}
                        </h5>
                        <p className="mb-0 text-center">
                          {civilites.length === 0
                            ? "Aucune civilité n'a été créée."
                            : "Aucune civilité ne correspond à vos critères de recherche."}
                        </p>
                        {civilites.length === 0 ? (
                          <button
                            onClick={() => setShowCreateModal(true)}
                            className="btn btn-primary mt-3"
                          >
                            <FontAwesomeIcon icon={faPlus} className="me-2" />
                            Créer la première civilité
                          </button>
                        ) : (
                          <button
                            onClick={resetFilters}
                            className="btn btn-outline-primary mt-3"
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
                            <div className="form-check d-flex justify-content-center">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={isPageAllSelected}
                                onChange={handleSelectAllOnPage}
                                title="Sélectionner/désélectionner toutes les lignes de cette page"
                              />
                            </div>
                          </th>
                          <th style={{ width: "60px" }} className="text-center">
                            #
                          </th>
                          <th style={{ width: "200px" }}>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                              onClick={() => requestSort("libelle")}
                            >
                              <FontAwesomeIcon
                                icon={faIdCard}
                                className="me-1"
                              />
                              Libellé
                              {getSortIcon("libelle")}
                            </button>
                          </th>
                          <th style={{ width: "150px" }}>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                              onClick={() => requestSort("slug")}
                            >
                              <FontAwesomeIcon
                                icon={faLanguage}
                                className="me-1"
                              />
                              Slug
                              {getSortIcon("slug")}
                            </button>
                          </th>
                          <th style={{ width: "120px" }}>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                              onClick={() => requestSort("statut")}
                            >
                              Statut
                              {getSortIcon("statut")}
                            </button>
                          </th>
                          <th style={{ width: "150px" }}>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                              onClick={() => requestSort("createdAt")}
                            >
                              <FontAwesomeIcon
                                icon={faCalendar}
                                className="me-1"
                              />
                              Créé le
                              {getSortIcon("createdAt")}
                            </button>
                          </th>
                          <th style={{ width: "150px" }}>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                              onClick={() => requestSort("updatedAt")}
                            >
                              <FontAwesomeIcon
                                icon={faCalendar}
                                className="me-1"
                              />
                              Modifié le
                              {getSortIcon("updatedAt")}
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
                        {currentItems.map((civilite, index) => (
                          <tr
                            key={civilite.uuid}
                            className="align-middle"
                            style={{
                              backgroundColor: selectedRows.has(civilite.uuid)
                                ? "rgba(13, 110, 253, 0.05)"
                                : "inherit",
                            }}
                          >
                            <td className="text-center">
                              <div className="form-check d-flex justify-content-center">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={selectedRows.has(civilite.uuid)}
                                  onChange={() =>
                                    handleRowSelect(civilite.uuid)
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
                                    {civilite.libelle}
                                  </div>
                                  <small className="text-muted">
                                    ID: {civilite.id}
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <FontAwesomeIcon
                                  icon={faLanguage}
                                  className="text-muted me-2"
                                />
                                <code className="bg-light rounded px-2 py-1">
                                  {civilite.slug}
                                </code>
                              </div>
                            </td>
                            <td>
                              <StatusBadge statut={civilite.statut} />
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <FontAwesomeIcon
                                  icon={faCalendar}
                                  className="text-muted me-2"
                                />
                                <small className="text-muted">
                                  {formatDateShort(civilite.createdAt)}
                                </small>
                              </div>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <FontAwesomeIcon
                                  icon={faCalendar}
                                  className="text-muted me-2"
                                />
                                <small className="text-muted">
                                  {civilite.updatedAt
                                    ? formatDateShort(civilite.updatedAt)
                                    : "Jamais"}
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
                                  onClick={() => openEditModal(civilite)}
                                >
                                  <FontAwesomeIcon icon={faEye} />
                                </button>

                                <button
                                  className="btn btn-outline-warning"
                                  title="Modifier"
                                  onClick={() => openEditModal(civilite)}
                                  disabled={loading}
                                >
                                  <FontAwesomeIcon icon={faEdit} />
                                </button>

                                <button
                                  className={`btn ${civilite.statut === "actif" ? "btn-outline-warning" : "btn-outline-success"}`}
                                  title={
                                    civilite.statut === "actif"
                                      ? "Désactiver"
                                      : "Activer"
                                  }
                                  onClick={() => handleToggleStatus(civilite)}
                                  disabled={loading}
                                >
                                  <FontAwesomeIcon
                                    icon={
                                      civilite.statut === "actif"
                                        ? faToggleOff
                                        : faToggleOn
                                    }
                                  />
                                </button>

                                <button
                                  className="btn btn-outline-secondary"
                                  title="Dupliquer"
                                  onClick={() => handleDuplicate(civilite)}
                                  disabled={loading}
                                >
                                  <FontAwesomeIcon icon={faClone} />
                                </button>

                                <button
                                  className="btn btn-outline-danger"
                                  title="Supprimer"
                                  onClick={() => openDeleteModal(civilite)}
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
                        totalItems={filteredCivilites.length}
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
    </>
  );
}
