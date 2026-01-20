// app/(back-office)/dashboard-admin/pays/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faEye,
  faTrash,
  faRefresh,
  faDownload,
  faSearch,
  faFilter,
  faSort,
  faSortUp,
  faSortDown,
  faGlobe,
  faCheck,
  faFlag,
  faPhone,
  faCalendar,
  faCheckCircle,
  faTimesCircle,
  faBan,
  faInfoCircle,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";

// Types
interface Pays {
  uuid: string;
  code: string;
  nom: string;
  indicatif: string;
  statut: "actif" | "inactif";
  created_at?: string;
  updated_at?: string;
  is_deleted?: boolean;
}

// Composant de badge de statut
const StatusBadge = ({ statut }: { statut: string }) => {
  if (statut === "actif") {
    return (
      <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 d-inline-flex align-items-center gap-1">
        <FontAwesomeIcon icon={faCheckCircle} className="fs-12" />
        <span>Actif</span>
      </span>
    );
  }
  return (
    <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 d-inline-flex align-items-center gap-1">
      <FontAwesomeIcon icon={faTimesCircle} className="fs-12" />
      <span>Inactif</span>
    </span>
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
  loading,
}: {
  selectedCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkAction: (action: string) => void;
  isAllSelected: boolean;
  totalItems: number;
  loading: boolean;
}) => {
  if (selectedCount === 0) return null;
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
              {selectedCount} pays sélectionné(s)
            </h6>
            <small className="text-muted">
              {isAllSelected
                ? "Tous les pays sont sélectionnés"
                : `${selectedCount} sur ${totalItems} pays sélectionnés`}
            </small>
          </div>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={onSelectAll}
            disabled={loading}
          >
            {isAllSelected ? "Tout désélectionner" : "Tout sélectionner"}
          </button>
          <button
            className="btn btn-success btn-sm d-flex align-items-center gap-2"
            onClick={() => onBulkAction("activate")}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faCheckCircle} />
            Activer
          </button>
          <button
            className="btn btn-warning btn-sm d-flex align-items-center gap-2"
            onClick={() => onBulkAction("deactivate")}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faBan} />
            Désactiver
          </button>
          <button
            className="btn btn-danger btn-sm d-flex align-items-center gap-2"
            onClick={() => onBulkAction("delete")}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faTrash} />
            Supprimer
          </button>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={onClearSelection}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faBan} />
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal de suppression multiple
const BulkDeleteModal = ({
  show,
  loading,
  count,
  onClose,
  onConfirm,
}: {
  show: boolean;
  loading: boolean;
  count: number;
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
          <div className="modal-header border-0 bg-danger text-white rounded-top-3">
            <h5 className="modal-title fw-bold">
              <FontAwesomeIcon icon={faTrash} className="me-2" />
              Suppression multiple
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
            <p className="mb-3">
              Êtes-vous sûr de vouloir supprimer <strong>{count} pays</strong> ?
            </p>
            <div className="text-danger">
              <small>
                Cette action est irréversible. Toutes les données associées
                seront perdues.
              </small>
            </div>
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
                  Suppression en cours...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faTrash} className="me-2" />
                  Supprimer les pays
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
          <span className="fw-semibold">{totalItems}</span> pays
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

export default function PaysPage() {
  // États
  const [pays, setPays] = useState<Pays[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sélection multiple
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // Filtres et recherche
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Pays;
    direction: "asc" | "desc";
  } | null>(null);

  // Options
  const itemsPerPageOptions = [5, 10, 20, 50];

  // Charger les pays
  const fetchPays = useCallback(
    async (params?: { page?: number; limit?: number; search?: string }) => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams();
        queryParams.append("page", String(params?.page || pagination.page));
        queryParams.append("limit", String(params?.limit || pagination.limit));
        if (params?.search) queryParams.append("search", params.search);

        const response = await api.get(
          `${API_ENDPOINTS.PAYS.LIST}?${queryParams.toString()}`,
        );

        // ✅ Gestion du format { data: [...], total: number }
        let paysData: Pays[] = [];
        let totalCount = 0;

        if (
          response &&
          typeof response === "object" &&
          !Array.isArray(response) &&
          "data" in response
        ) {
          paysData = response.data;
          totalCount = response.total || paysData.length;
        } else if (Array.isArray(response)) {
          paysData = response;
          totalCount = paysData.length;
        } else {
          throw new Error("Format de réponse non reconnu");
        }

        setPays(paysData);
        setPagination((prev) => ({
          ...prev,
          page: params?.page || prev.page,
          limit: params?.limit || prev.limit,
          total: totalCount,
          pages: Math.ceil(totalCount / (params?.limit || prev.limit)) || 1,
        }));
      } catch (err: any) {
        console.error("❌ Erreur chargement pays:", err);
        setError(err.message || "Erreur lors du chargement des pays");
        setPays([]);
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.limit],
  );

  // Charger au montage
  useEffect(() => {
    fetchPays();
  }, [fetchPays]);

  // Recherche avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPays({
        page: 1,
        limit: pagination.limit,
        search: searchTerm.trim() || undefined,
      });
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchPays, pagination.limit]);

  // Utils
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

  // Tri
  const sortPays = (paysList: Pays[]) => {
    if (!sortConfig || !paysList.length) return paysList;
    return [...paysList].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      if (aValue == null) aValue = "";
      if (bValue == null) bValue = "";
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  const requestSort = (key: keyof Pays) => {
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

  const getSortIcon = (key: keyof Pays) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <FontAwesomeIcon icon={faSort} className="text-muted ms-1" />;
    }
    return sortConfig.direction === "asc" ? (
      <FontAwesomeIcon icon={faSortUp} className="text-primary ms-1" />
    ) : (
      <FontAwesomeIcon icon={faSortDown} className="text-primary ms-1" />
    );
  };

  // Filtres côté client
  const filteredPays = useMemo(() => {
    let result = [...pays];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.nom.toLowerCase().includes(term) ||
          p.code.toLowerCase().includes(term) ||
          p.indicatif.includes(searchTerm),
      );
    }
    if (selectedStatus !== "all") {
      result = result.filter((p) => p.statut === selectedStatus);
    }
    return sortPays(result);
  }, [pays, searchTerm, selectedStatus, sortConfig]);

  const currentItems = useMemo(() => {
    return filteredPays.slice(
      (pagination.page - 1) * pagination.limit,
      pagination.page * pagination.limit,
    );
  }, [filteredPays, pagination.page, pagination.limit]);

  // Gestion de la sélection
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
      const allUuids = new Set(filteredPays.map((p) => p.uuid));
      setSelectedRows(allUuids);
      setIsAllSelected(true);
    }
  };

  const updateAllSelectedStatus = (selectedSet: Set<string>) => {
    const allUuids = new Set(filteredPays.map((p) => p.uuid));
    setIsAllSelected(
      selectedSet.size === allUuids.size &&
        Array.from(allUuids).every((uuid) => selectedSet.has(uuid)),
    );
  };

  const clearSelection = () => {
    setSelectedRows(new Set());
    setIsAllSelected(false);
  };

  // Actions en masse (à implémenter selon vos endpoints)
  const handleBulkAction = async (actionId: string) => {
    if (selectedRows.size === 0) return;

    if (actionId === "delete") {
      setShowBulkDeleteModal(true);
      return;
    }

    try {
      // ⚠️ À remplacer par vos appels API réels
      setSuccessMessage(
        `${selectedRows.size} pays ${actionId === "activate" ? "activé(s)" : "désactivé(s)"} avec succès`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);
      clearSelection();
    } catch (err: any) {
      setError("Erreur lors de l'action en masse");
    }
  };

  const handleBulkDelete = async () => {
    try {
      // ⚠️ À implémenter avec DELETE /pays/{uuid}
      setSuccessMessage(`${selectedRows.size} pays supprimé(s) avec succès`);
      setTimeout(() => setSuccessMessage(null), 3000);
      setShowBulkDeleteModal(false);
      clearSelection();
    } catch (err: any) {
      setError("Erreur lors de la suppression");
    }
  };

  // Export CSV
  const handleCSVExport = () => {
    if (filteredPays.length === 0) {
      setError("Aucun pays à exporter");
      return;
    }
    try {
      const csvContent = [
        ["Nom", "Code", "Indicatif", "Statut", "Créé le"],
        ...filteredPays.map((p) => [
          p.nom || "",
          p.code || "",
          p.indicatif || "",
          p.statut || "",
          formatDate(p.created_at),
        ]),
      ]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `pays-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      setSuccessMessage("Export CSV réussi");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError("Erreur lors de l'export CSV");
    }
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setSortConfig(null);
    setPagination((prev) => ({ ...prev, page: 1 }));
    clearSelection();
  };

  return (
    <>
      {/* Modal de suppression multiple */}
      <BulkDeleteModal
        show={showBulkDeleteModal}
        loading={loading}
        count={selectedRows.size}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleBulkDelete}
      />

      <div className="p-3 p-md-4">
        {/* Messages */}
        {error && (
          <div
            className="alert alert-warning alert-dismissible fade show mb-3"
            role="alert"
          >
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            <strong>Attention:</strong> {error}
            <button
              type="button"
              className="btn-close"
              onClick={() => setError(null)}
            ></button>
          </div>
        )}
        {successMessage && (
          <div
            className="alert alert-success alert-dismissible fade show mb-3"
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

        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="card-header bg-white border-0 py-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div>
                <p className="text-muted mb-1">Gestion Géographique</p>
                <div className="d-flex align-items-center gap-3">
                  <h2 className="h4 mb-0 fw-bold">Liste des Pays</h2>
                  <span className="badge bg-primary bg-opacity-10 text-primary">
                    {pagination.total} pays
                    {selectedRows.size > 0 &&
                      ` (${selectedRows.size} sélectionné(s))`}
                  </span>
                </div>
              </div>
              <div className="d-flex flex-wrap gap-2">
                <button
                  onClick={() => fetchPays()}
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faRefresh} spin={loading} />
                  Rafraîchir
                </button>
                <button
                  onClick={handleCSVExport}
                  className="btn btn-outline-primary d-flex align-items-center gap-2"
                  disabled={pays.length === 0 || loading}
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Exporter CSV
                </button>
                <button
                  onClick={() => alert("Fonctionnalité en développement")}
                  className="btn btn-success d-flex align-items-center gap-2"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Nouveau Pays
                </button>
              </div>
            </div>
          </div>

          {/* Barre d'actions en masse */}
          <BulkActionsBar
            selectedCount={selectedRows.size}
            onSelectAll={handleSelectAll}
            onClearSelection={clearSelection}
            onBulkAction={handleBulkAction}
            isAllSelected={isAllSelected}
            totalItems={filteredPays.length}
            loading={loading}
          />

          {/* Filtres */}
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
                    placeholder="Rechercher par nom, code ou indicatif..."
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
                    <option value="actif">Actifs</option>
                    <option value="inactif">Inactifs</option>
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
              <div className="col-md-3 text-end">
                <button
                  onClick={resetFilters}
                  className="btn btn-outline-secondary"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faTimesCircle} className="me-1" />
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>

          {/* Tableau */}
          <div className="table-responsive">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-3">Chargement des pays...</p>
              </div>
            ) : filteredPays.length === 0 ? (
              <div className="text-center py-5">
                <div
                  className="alert alert-info mx-auto"
                  style={{ maxWidth: "500px" }}
                >
                  <FontAwesomeIcon
                    icon={faGlobe}
                    className="fs-1 mb-3 text-info"
                  />
                  <h5>Aucun pays trouvé</h5>
                  <p className="mb-0">
                    {pays.length === 0
                      ? "Aucun pays dans la base de données."
                      : "Aucun pays ne correspond à vos critères."}
                  </p>
                  <button
                    onClick={resetFilters}
                    className="btn btn-outline-primary mt-3"
                  >
                    <FontAwesomeIcon icon={faFilter} className="me-2" />
                    Réinitialiser les filtres
                  </button>
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
                            checked={isAllSelected && currentItems.length > 0}
                            onChange={handleSelectAll}
                            disabled={currentItems.length === 0}
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
                        >
                          <FontAwesomeIcon icon={faGlobe} className="me-1" />
                          Nom du pays
                          {getSortIcon("nom")}
                        </button>
                      </th>
                      <th style={{ width: "100px" }}>
                        <button
                          className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                          onClick={() => requestSort("code")}
                        >
                          <FontAwesomeIcon icon={faFlag} className="me-1" />
                          Code
                          {getSortIcon("code")}
                        </button>
                      </th>
                      <th style={{ width: "120px" }}>
                        <button
                          className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                          onClick={() => requestSort("indicatif")}
                        >
                          <FontAwesomeIcon icon={faPhone} className="me-1" />
                          Indicatif
                          {getSortIcon("indicatif")}
                        </button>
                      </th>
                      <th style={{ width: "100px" }}>
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
                          onClick={() => requestSort("created_at")}
                        >
                          <FontAwesomeIcon icon={faCalendar} className="me-1" />
                          Créé le
                          {getSortIcon("created_at")}
                        </button>
                      </th>
                      <th style={{ width: "120px" }} className="text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((paysItem, index) => (
                      <tr
                        key={paysItem.uuid}
                        className="align-middle"
                        style={{
                          backgroundColor: selectedRows.has(paysItem.uuid)
                            ? "rgba(13, 110, 253, 0.05)"
                            : "inherit",
                        }}
                      >
                        <td className="text-center">
                          <div className="form-check d-flex justify-content-center">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={selectedRows.has(paysItem.uuid)}
                              onChange={() => handleRowSelect(paysItem.uuid)}
                            />
                          </div>
                        </td>
                        <td className="text-center text-muted fw-semibold">
                          {(pagination.page - 1) * pagination.limit + index + 1}
                        </td>
                        <td>
                          <div className="fw-semibold">{paysItem.nom}</div>
                        </td>
                        <td>
                          <code className="bg-light px-2 py-1 rounded">
                            {paysItem.code}
                          </code>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <FontAwesomeIcon
                              icon={faPhone}
                              className="text-muted"
                            />
                            <span>{paysItem.indicatif}</span>
                          </div>
                        </td>
                        <td>
                          <StatusBadge statut={paysItem.statut} />
                        </td>
                        <td>
                          <small className="text-muted">
                            {formatDate(paysItem.created_at)}
                          </small>
                        </td>
                        <td className="text-center">
                          <div className="btn-group btn-group-sm" role="group">
                            <button
                              className="btn btn-outline-primary"
                              title="Voir détails"
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </button>
                            <button
                              className="btn btn-outline-warning"
                              title="Modifier"
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              title="Supprimer"
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
                    totalItems={filteredPays.length}
                    itemsPerPage={pagination.limit}
                    indexOfFirstItem={(pagination.page - 1) * pagination.limit}
                    onPageChange={(page) =>
                      setPagination((prev) => ({ ...prev, page }))
                    }
                  />
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
        .badge {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
        }
        .form-check-input:checked {
          background-color: #0d6efd;
          border-color: #0d6efd;
        }
        .table-active {
          background-color: rgba(13, 110, 253, 0.05) !important;
        }
      `}</style>
    </>
  );
}
