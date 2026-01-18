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
  faExchangeAlt,
  faImage,
  faCalendar,
  faCheckCircle,
  faTimesCircle,
  faChartBar,
  faLayerGroup,
  faBoxOpen,
  faGift,
  faBullhorn,
  faSlidersH,
  faCheckSquare,
  faSquare,
  faCheck,
  faTimes,
  faBan,
  faUsers,
  faPhone,
  faClock,
  faMoneyBillWave,
  faHashtag,
  faInfoCircle,
  faCaretDown,
  faCaretUp,
  faCircle,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";
import CreateEchangeModal from "../components/modals/CreateEchangeModal";
import EditEchangeModal from "../components/modals/EditEchangeModal";
import ViewEchangeModal from "../components/modals/ViewEchangeModal";

// ============ TYPES ============
interface Echange {
  uuid: string;
  titre: string;
  description: string;
  createdAt: string | null;
  statut: string;
  image: string;
  prix: string;
  numero: string;
  categorie_uuid?: string;
  quantite?: string;
  objetPropose?: string;
  objetDemande?: string;
  typeEchange?: string;
  nomElementEchange?: string;
  message?: string;
  is_deleted?: boolean;
  deleted_at?: string | null;
}

interface EchangeStats {
  total: number;
  en_attente: number;
  en_cours: number;
  termine: number;
  annule: number;
}

// ============ COMPOSANTS ============

// Composant de badge de statut
const StatusBadge = ({ statut }: { statut: string }) => {
  const getStatusConfig = (statut: string) => {
    switch (statut) {
      case "en_attente":
        return {
          icon: faClock,
          color: colors.oskar.orange,
          label: "En attente",
          bgColor: `${colors.oskar.orange}15`,
          borderColor: `${colors.oskar.orange}30`,
        };
      case "en_cours":
        return {
          icon: faExchangeAlt,
          color: colors.oskar.blue,
          label: "En cours",
          bgColor: `${colors.oskar.blue}15`,
          borderColor: `${colors.oskar.blue}30`,
        };
      case "termine":
        return {
          icon: faCheckCircle,
          color: colors.oskar.green,
          label: "Terminé",
          bgColor: `${colors.oskar.green}15`,
          borderColor: `${colors.oskar.green}30`,
        };
      case "annule":
        return {
          icon: faTimesCircle,
          color: colors.oskar.red,
          label: "Annulé",
          bgColor: `${colors.oskar.red}15`,
          borderColor: `${colors.oskar.red}30`,
        };
      default:
        return {
          icon: faClock,
          color: colors.oskar.grey,
          label: statut,
          bgColor: `${colors.oskar.grey}15`,
          borderColor: `${colors.oskar.grey}30`,
        };
    }
  };

  const config = getStatusConfig(statut);

  return (
    <span
      className="badge d-inline-flex align-items-center gap-2"
      style={{
        backgroundColor: config.bgColor,
        color: config.color,
        border: `1px solid ${config.borderColor}`,
        padding: "0.4rem 0.75rem",
        fontSize: "0.75rem",
      }}
    >
      <FontAwesomeIcon icon={config.icon} className="fs-12" />
      <span>{config.label}</span>
    </span>
  );
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
  onLimitChange: (limit: number) => void;
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
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 p-3 border-top">
      <div className="d-flex align-items-center gap-3">
        <div className="text-muted" style={{ fontSize: "0.85rem" }}>
          Affichage de{" "}
          <span className="fw-semibold">{indexOfFirstItem + 1}</span> à{" "}
          <span className="fw-semibold">{indexOfLastItem}</span> sur{" "}
          <span className="fw-semibold">{totalItems}</span> échanges
        </div>
        <select
          className="form-select form-select-sm"
          style={{ width: "100px", fontSize: "0.85rem" }}
          value={itemsPerPage}
          onChange={(e) => onLimitChange(Number(e.target.value))}
        >
          <option value="5">5 / page</option>
          <option value="10">10 / page</option>
          <option value="20">20 / page</option>
          <option value="50">50 / page</option>
        </select>
      </div>

      <nav>
        <ul className="pagination mb-0" style={{ fontSize: "0.85rem" }}>
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
  );
};

// Composant de skeleton loading
const LoadingSkeleton = () => (
  <div className="table-responsive">
    <table className="table table-hover mb-0">
      <thead className="table-light">
        <tr>
          {[...Array(8)].map((_, i) => (
            <th key={i}>
              <div
                className="placeholder placeholder-wave"
                style={{ width: "100px" }}
              />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...Array(5)].map((_, i) => (
          <tr key={i}>
            {[...Array(8)].map((_, j) => (
              <td key={j}>
                <div
                  className="placeholder placeholder-wave"
                  style={{ width: "80%" }}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Composant de modal de suppression
const DeleteModal = ({
  show,
  echange,
  loading,
  onClose,
  onConfirm,
  type = "single",
  count = 0,
}: {
  show: boolean;
  echange: Echange | null;
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
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header border-0 bg-danger text-white rounded-top-3">
            <h5 className="modal-title fw-bold">
              <FontAwesomeIcon icon={faTrash} className="me-2" />
              {type === "multiple"
                ? "Suppression multiple"
                : "Confirmer la suppression"}
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
              <FontAwesomeIcon icon={faTimesCircle} className="me-2" />
              <strong>Attention :</strong> Cette action est définitive
            </div>
            {type === "single" && echange ? (
              <>
                <p className="mb-3">
                  Êtes-vous sûr de vouloir supprimer l'échange{" "}
                  <strong>{echange.titre}</strong> ?
                </p>
                <div className="text-danger">
                  <small>
                    Cette action est irréversible. Toutes les données associées
                    à cet échange seront perdues.
                  </small>
                </div>
              </>
            ) : (
              <>
                <p className="mb-3">
                  Êtes-vous sûr de vouloir supprimer{" "}
                  <strong>{count} échange(s)</strong> ?
                </p>
                <div className="text-danger">
                  <small>
                    Cette action est irréversible. Toutes les données associées
                    seront perdues.
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
                  {type === "multiple"
                    ? "Suppression en cours..."
                    : "Suppression..."}
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faTrash} className="me-2" />
                  {type === "multiple"
                    ? `Supprimer ${count} échange(s)`
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

// ============ PAGE PRINCIPALE ============

export default function EchangesPage() {
  // États
  const [echanges, setEchanges] = useState<Echange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // États pour les modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteMultipleModal, setShowDeleteMultipleModal] = useState(false);
  const [selectedEchange, setSelectedEchange] = useState<Echange | null>(null);

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Echange;
    direction: "asc" | "desc";
  } | null>(null);

  // États pour la pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // États pour la sélection multiple
  const [selectedEchanges, setSelectedEchanges] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // États pour les actions de suppression
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Options pour les éléments par page
  const itemsPerPageOptions = [5, 10, 20, 50];

  // Fonction pour formater la date
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime())
        ? "N/A"
        : date.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
    } catch {
      return "N/A";
    }
  };

  // Fonction pour formater le prix
  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    if (isNaN(num)) return "N/A";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(num);
  };

  // Fonction pour obtenir l'icône de tri
  const getSortIcon = (key: keyof Echange) => {
    if (!sortConfig || sortConfig.key !== key) {
      return (
        <FontAwesomeIcon
          icon={faSort}
          className="text-muted ms-1"
          style={{ fontSize: "0.8rem" }}
        />
      );
    }
    return sortConfig.direction === "asc" ? (
      <FontAwesomeIcon
        icon={faSortUp}
        className="text-primary ms-1"
        style={{ fontSize: "0.8rem" }}
      />
    ) : (
      <FontAwesomeIcon
        icon={faSortDown}
        className="text-primary ms-1"
        style={{ fontSize: "0.8rem" }}
      />
    );
  };

  // Charger les échanges
  const fetchEchanges = useCallback(
    async (params?: Record<string, any>) => {
      try {
        setLoading(true);
        setError(null);
        setInfoMessage(null);
        setSuccessMessage(null);

        const queryParams = new URLSearchParams({
          page: String(pagination.page),
          limit: String(pagination.limit),
          ...params,
        });

        const endpoint = queryParams.toString()
          ? `${API_ENDPOINTS.ECHANGES.PUBLISHED}?${queryParams.toString()}`
          : API_ENDPOINTS.ECHANGES.PUBLISHED;

        const response = await api.get<Echange[]>(endpoint);

        if (!Array.isArray(response)) {
          throw new Error("Réponse API invalide : attendu un tableau");
        }

        setEchanges(response);
        setPagination((prev) => ({
          ...prev,
          total: response.length,
          pages: Math.ceil(response.length / prev.limit),
        }));

        // Réinitialiser la sélection après chargement
        setSelectedEchanges([]);
        setSelectAll(false);
      } catch (err: any) {
        console.error("❌ Erreur lors du chargement des échanges:", err);
        let errorMessage = "Erreur lors du chargement des échanges.";

        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        setEchanges([]);
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.limit],
  );

  // Charger les échanges au montage
  useEffect(() => {
    fetchEchanges();
  }, []);

  // Gérer les changements de pagination et filtres
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params: Record<string, any> = {};

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      if (selectedStatus !== "all") {
        params.statut = selectedStatus;
      }

      fetchEchanges(params);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedStatus, fetchEchanges]);

  // Fonctions de tri
  const requestSort = (key: keyof Echange) => {
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

  // Tri des échanges
  const sortedEchanges = useMemo(() => {
    if (!sortConfig) return echanges;
    return [...echanges].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue === bValue) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      if (sortConfig.direction === "asc") return aValue < bValue ? -1 : 1;
      return aValue > bValue ? -1 : 1;
    });
  }, [echanges, sortConfig]);

  // Filtrage des échanges
  const filteredEchanges = useMemo(() => {
    return sortedEchanges.filter((echange) => {
      const matchesSearch =
        !searchTerm.trim() ||
        echange.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        echange.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        echange.numero?.includes(searchTerm) ||
        echange.prix?.includes(searchTerm);

      const matchesStatus =
        selectedStatus === "all" || echange.statut === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [sortedEchanges, searchTerm, selectedStatus]);

  // Statistiques
  const stats = useMemo<EchangeStats>(() => {
    const totalEchanges = echanges.length;
    const en_attente = echanges.filter((e) => e.statut === "en_attente").length;
    const en_cours = echanges.filter((e) => e.statut === "en_cours").length;
    const termine = echanges.filter((e) => e.statut === "termine").length;
    const annule = echanges.filter((e) => e.statut === "annule").length;

    return {
      total: totalEchanges,
      en_attente,
      en_cours,
      termine,
      annule,
    };
  }, [echanges]);

  // Gestion succès
  const handleSuccess = (message: string) => {
    setSuccessMessage(message);
    fetchEchanges();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Suppression d'un échange
  const handleDelete = async () => {
    if (!selectedEchange) return;

    try {
      setDeleteLoading(true);
      await api.delete(API_ENDPOINTS.ECHANGES.DELETE(selectedEchange.uuid));

      setShowDeleteModal(false);
      setSelectedEchange(null);
      handleSuccess("Échange supprimé avec succès !");
    } catch (err: any) {
      console.error("❌ Erreur suppression:", err);
      setError(err.response?.data?.message || "Erreur lors de la suppression");
      setTimeout(() => setError(null), 3000);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Suppression multiple
  const handleDeleteMultiple = async () => {
    if (selectedEchanges.length === 0) return;

    try {
      setDeleteLoading(true);
      let successCount = 0;
      let errorCount = 0;

      for (const echangeUuid of selectedEchanges) {
        try {
          await api.delete(API_ENDPOINTS.ECHANGES.DELETE(echangeUuid));
          successCount++;
        } catch (err) {
          console.error(`Erreur pour l'échange ${echangeUuid}:`, err);
          errorCount++;
        }
      }

      setShowDeleteMultipleModal(false);
      setSuccessMessage(
        `${successCount} échange(s) supprimé(s) avec succès${errorCount > 0 ? ` (${errorCount} échec(s))` : ""}`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);

      // Réinitialiser la sélection
      setSelectedEchanges([]);
      setSelectAll(false);

      // Rafraîchir la liste
      fetchEchanges();
    } catch (err: any) {
      console.error("❌ Erreur suppression multiple:", err);
      setError("Erreur lors de la suppression multiple");
      setTimeout(() => setError(null), 3000);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Ouvrir modal de suppression
  const openDeleteModal = (echange: Echange) => {
    setSelectedEchange(echange);
    setShowDeleteModal(true);
  };

  // Ouvrir modal de suppression multiple
  const openDeleteMultipleModal = () => {
    if (selectedEchanges.length === 0) {
      setInfoMessage("Veuillez sélectionner au moins un échange");
      setTimeout(() => setInfoMessage(null), 3000);
      return;
    }
    setShowDeleteMultipleModal(true);
  };

  // Export PDF/CSV
  const handleExport = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.ECHANGES.EXPORT_PDF, {
      });
      const url = window.URL.createObjectURL(response);
      const link = document.createElement("a");
      link.href = url;
      link.download = `echanges-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      handleSuccess("Export PDF réussi !");
    } catch (err) {
      console.error("Erreur export PDF, tentative CSV...");
      createCSVExport();
    }
  };

  const createCSVExport = () => {
    if (echanges.length === 0) {
      setInfoMessage("Aucun échange à exporter");
      setTimeout(() => setInfoMessage(null), 3000);
      return;
    }

    const csvContent = [
      ["Titre", "Description", "Statut", "Prix", "Numéro", "Date création"],
      ...echanges.map((echange) => [
        `"${echange.titre || ""}"`,
        `"${echange.description || ""}"`,
        echange.statut,
        echange.prix,
        `"${echange.numero || ""}"`,
        echange.createdAt
          ? new Date(echange.createdAt).toLocaleDateString("fr-FR")
          : "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `echanges-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    handleSuccess("Export CSV réussi !");
  };

  // Gestion de la sélection multiple
  const handleSelectEchange = (echangeUuid: string) => {
    setSelectedEchanges((prev) => {
      if (prev.includes(echangeUuid)) {
        return prev.filter((id) => id !== echangeUuid);
      } else {
        return [...prev, echangeUuid];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEchanges([]);
    } else {
      const allEchangeIds = currentItems.map((echange) => echange.uuid);
      setSelectedEchanges(allEchangeIds);
    }
    setSelectAll(!selectAll);
  };

  const handleSelectAllOnPage = () => {
    const pageEchangeIds = currentItems.map((echange) => echange.uuid);
    const allSelected = pageEchangeIds.every((id) =>
      selectedEchanges.includes(id),
    );

    if (allSelected) {
      setSelectedEchanges((prev) =>
        prev.filter((id) => !pageEchangeIds.includes(id)),
      );
    } else {
      const newSelection = [
        ...new Set([...selectedEchanges, ...pageEchangeIds]),
      ];
      setSelectedEchanges(newSelection);
    }
  };

  // Actions en masse
  const handleBulkAction = async (
    action: "activate" | "deactivate" | "delete",
  ) => {
    if (selectedEchanges.length === 0) {
      setInfoMessage("Veuillez sélectionner au moins un échange");
      setTimeout(() => setInfoMessage(null), 3000);
      return;
    }

    if (action === "delete") {
      openDeleteMultipleModal();
      return;
    }

    try {
      setBulkActionLoading(true);
      let successCount = 0;
      let errorCount = 0;

      for (const echangeUuid of selectedEchanges) {
        try {
          const echange = echanges.find((e) => e.uuid === echangeUuid);
          if (!echange) continue;

          await api.put(API_ENDPOINTS.ECHANGES.UPDATE(echangeUuid), {
            statut: action === "activate" ? "en_cours" : "annule",
          });
          successCount++;
        } catch (err) {
          console.error(`Erreur pour l'échange ${echangeUuid}:`, err);
          errorCount++;
        }
      }

      setSuccessMessage(
        `${successCount} échange(s) ${action === "activate" ? "activé(s)" : "annulé(s)"} avec succès${errorCount > 0 ? ` (${errorCount} échec(s))` : ""}`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);

      // Rafraîchir la liste
      fetchEchanges();

      // Réinitialiser la sélection
      setSelectedEchanges([]);
      setSelectAll(false);
    } catch (err) {
      console.error("Erreur lors de l'action en masse:", err);
      setError("Erreur lors de l'action en masse");
      setTimeout(() => setError(null), 3000);
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Pagination et filtres
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [searchTerm, selectedStatus]);

  const currentItems = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    return filteredEchanges.slice(startIndex, startIndex + pagination.limit);
  }, [filteredEchanges, pagination.page, pagination.limit]);

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      total: filteredEchanges.length,
      pages: Math.ceil(filteredEchanges.length / prev.limit),
    }));
  }, [filteredEchanges]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setSortConfig(null);
    setPagination((prev) => ({ ...prev, page: 1 }));
    setSelectedEchanges([]);
    setSelectAll(false);
  };

  // Effet pour mettre à jour selectAll
  useEffect(() => {
    if (currentItems.length > 0) {
      const allSelected = currentItems.every((echange) =>
        selectedEchanges.includes(echange.uuid),
      );
      setSelectAll(allSelected);
    } else {
      setSelectAll(false);
    }
  }, [selectedEchanges, currentItems]);

  return (
    <>
      {/* Modals externes 
      {selectedEchange && (
        <EditEchangeModal
          isOpen={showEditModal}
          echange={selectedEchange}
          onClose={() => {
            setShowEditModal(false);
            setSelectedEchange(null);
          }}
          onSuccess={() => handleSuccess("Échange modifié avec succès !")}
        />
      )}
      {selectedEchange && (
        <ViewEchangeModal
          isOpen={showViewModal}
          echange={selectedEchange}
          onClose={() => {
            setShowViewModal(false);
            setSelectedEchange(null);
          }}
        />
      )}
      */}
      <CreateEchangeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => handleSuccess("Échange créé avec succès !")}
      />
      

      {/* Modals de suppression intégrés */}
      <DeleteModal
        show={showDeleteModal}
        echange={selectedEchange}
        loading={deleteLoading}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedEchange(null);
        }}
        onConfirm={handleDelete}
        type="single"
      />
      <DeleteModal
        show={showDeleteMultipleModal}
        echange={null}
        loading={deleteLoading}
        onClose={() => setShowDeleteMultipleModal(false)}
        onConfirm={handleDeleteMultiple}
        type="multiple"
        count={selectedEchanges.length}
      />

      <div className="p-3 p-md-4">
        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="card-header bg-white border-0 py-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div>
                <p className="text-muted mb-1">Gestion des Échanges</p>
                <div className="d-flex align-items-center gap-3">
                  <h2 className="h4 mb-0 fw-bold">Échanges Publiés</h2>
                  <span className="badge bg-primary bg-opacity-10 text-primary">
                    {filteredEchanges.length} échange(s){" "}
                    {selectedEchanges.length > 0 &&
                      `(${selectedEchanges.length} sélectionné(s))`}
                  </span>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <button
                  onClick={() => fetchEchanges()}
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faRefresh} spin={loading} />
                  Rafraîchir
                </button>

                <button
                  onClick={handleExport}
                  className="btn btn-outline-primary d-flex align-items-center gap-2"
                  disabled={echanges.length === 0 || loading}
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Exporter
                </button>

                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-success d-flex align-items-center gap-2"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Nouvel Échange
                </button>
              </div>
            </div>

            {/* Messages d'alerte */}
            {error && (
              <div
                className="alert alert-danger alert-dismissible fade show mt-3 mb-0"
                role="alert"
              >
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faTimesCircle} className="me-2" />
                  <div>
                    <strong>Erreur:</strong> {error}
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

            {infoMessage && (
              <div
                className="alert alert-info alert-dismissible fade show mt-3 mb-0"
                role="alert"
              >
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  <div>
                    <strong>Information:</strong> {infoMessage}
                  </div>
                </div>
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
          {selectedEchanges.length > 0 && (
            <div className="p-3 border-bottom bg-warning bg-opacity-10">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                <div className="d-flex align-items-center gap-2">
                  <FontAwesomeIcon
                    icon={faExchangeAlt}
                    className="text-warning"
                  />
                  <span className="fw-semibold">
                    {selectedEchanges.length} échange(s) sélectionné(s)
                  </span>
                </div>

                <div className="d-flex flex-wrap gap-2">
                  <button
                    className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                    onClick={() => handleBulkAction("activate")}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} />
                    <span>Activer</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1"
                    onClick={() => handleBulkAction("deactivate")}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faBan} />
                    <span>Annuler</span>
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
                      setSelectedEchanges([]);
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
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faSearch} className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Rechercher par titre, description, numéro..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                  />
                </div>
              </div>

              <div className="col-md-4">
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
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="en_attente">En attente</option>
                    <option value="en_cours">En cours</option>
                    <option value="termine">Terminé</option>
                    <option value="annule">Annulé</option>
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
              <div className="col-md-8">
                <div className="d-flex align-items-center gap-2">
                  <small className="text-muted">
                    Résultats: <strong>{filteredEchanges.length}</strong>{" "}
                    échange(s)
                    {searchTerm && (
                      <>
                        {" "}
                        pour "<strong>{searchTerm}</strong>"
                      </>
                    )}
                    {selectedStatus !== "all" && (
                      <>
                        {" "}
                        et statut "
                        <strong>
                          {selectedStatus === "en_attente"
                            ? "En attente"
                            : selectedStatus === "en_cours"
                              ? "En cours"
                              : selectedStatus === "termine"
                                ? "Terminé"
                                : "Annulé"}
                        </strong>
                        "
                      </>
                    )}
                  </small>
                </div>
              </div>

              <div className="col-md-4 text-end">
                <div className="d-flex align-items-center gap-2 justify-content-end">
                  {selectedEchanges.length > 0 && (
                    <small className="text-primary fw-semibold">
                      {selectedEchanges.length} sélectionné(s)
                    </small>
                  )}
                  <button
                    onClick={resetFilters}
                    className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2"
                    disabled={loading}
                    title="Réinitialiser les filtres"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                    <span className="d-none d-md-inline">Reset</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tableau des échanges */}
          <div className="table-responsive">
            {loading ? (
              <LoadingSkeleton />
            ) : filteredEchanges.length === 0 ? (
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
                    {echanges.length === 0
                      ? "Aucun échange trouvé"
                      : "Aucun résultat"}
                  </h5>
                  <p className="mb-0 text-center">
                    {echanges.length === 0
                      ? "Aucun échange dans la base de données."
                      : "Aucun échange ne correspond à vos critères de recherche."}
                  </p>
                  {echanges.length === 0 ? (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="btn btn-primary mt-3"
                    >
                      <FontAwesomeIcon icon={faPlus} className="me-2" />
                      Créer le premier échange
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
            ) : (
              <>
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "50px" }} className="text-center">
                        <div className="form-check d-flex justify-content-center">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={selectAll && currentItems.length > 0}
                            onChange={handleSelectAllOnPage}
                            disabled={currentItems.length === 0}
                            title={
                              selectAll
                                ? "Désélectionner cette page"
                                : "Sélectionner cette page"
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
                          onClick={() => requestSort("titre")}
                        >
                          <FontAwesomeIcon
                            icon={faExchangeAlt}
                            className="me-1"
                          />
                          Titre
                          {getSortIcon("titre")}
                        </button>
                      </th>
                      <th style={{ width: "120px" }}>
                        <span className="fw-semibold">Type</span>
                      </th>
                      <th style={{ width: "100px" }}>
                        <span className="fw-semibold">Image</span>
                      </th>
                      <th style={{ width: "150px" }}>
                        <button
                          className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                          onClick={() => requestSort("prix")}
                        >
                          <FontAwesomeIcon
                            icon={faMoneyBillWave}
                            className="me-1"
                          />
                          Prix
                          {getSortIcon("prix")}
                        </button>
                      </th>
                      <th style={{ width: "150px" }}>
                        <button
                          className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                          onClick={() => requestSort("numero")}
                        >
                          <FontAwesomeIcon icon={faPhone} className="me-1" />
                          Contact
                          {getSortIcon("numero")}
                        </button>
                      </th>
                      <th style={{ width: "120px" }}>
                        <span className="fw-semibold">Statut</span>
                      </th>
                      <th style={{ width: "150px" }}>
                        <button
                          className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                          onClick={() => requestSort("createdAt")}
                        >
                          <FontAwesomeIcon icon={faCalendar} className="me-1" />
                          Créé le
                          {getSortIcon("createdAt")}
                        </button>
                      </th>
                      <th style={{ width: "140px" }} className="text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((echange, index) => (
                      <tr
                        key={echange.uuid}
                        className={`align-middle ${
                          selectedEchanges.includes(echange.uuid)
                            ? "table-active"
                            : ""
                        }`}
                      >
                        <td className="text-center">
                          <div className="form-check d-flex justify-content-center">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={selectedEchanges.includes(echange.uuid)}
                              onChange={() => handleSelectEchange(echange.uuid)}
                            />
                          </div>
                        </td>
                        <td className="text-center text-muted fw-semibold">
                          {(pagination.page - 1) * pagination.limit + index + 1}
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="flex-shrink-0">
                              <div
                                className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: "40px", height: "40px" }}
                              >
                                <FontAwesomeIcon icon={faExchangeAlt} />
                              </div>
                            </div>
                            <div className="flex-grow-1 ms-3">
                              <div className="fw-semibold">{echange.titre}</div>
                              {echange.description && (
                                <small
                                  className="text-muted text-truncate d-block"
                                  style={{
                                    maxWidth: "150px",
                                    fontSize: "0.75rem",
                                  }}
                                  title={echange.description}
                                >
                                  {echange.description}
                                </small>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            className="badge d-inline-flex align-items-center gap-2"
                            style={{
                              backgroundColor: `${colors.oskar.purple}15`,
                              color: colors.oskar.purple,
                              border: `1px solid ${colors.oskar.purple}30`,
                              padding: "0.4rem 0.75rem",
                              fontSize: "0.75rem",
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faExchangeAlt}
                              className="fs-12"
                            />
                            <span>Échange</span>
                          </span>
                        </td>
                        <td>
                          {echange.image ? (
                            <div
                              className="position-relative"
                              style={{ width: "50px", height: "50px" }}
                            >
                              <img
                                src={echange.image}
                                alt={echange.titre}
                                className="img-fluid rounded border"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    `https://via.placeholder.com/50/cccccc/ffffff?text=${echange.titre?.charAt(0) || "E"}`;
                                }}
                              />
                            </div>
                          ) : (
                            <div
                              className="bg-secondary bg-opacity-10 rounded d-flex align-items-center justify-content-center"
                              style={{ width: "50px", height: "50px" }}
                            >
                              <FontAwesomeIcon
                                icon={faExchangeAlt}
                                className="text-muted"
                              />
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="fw-semibold text-success">
                            {formatPrice(echange.prix)}
                          </div>
                          {echange.quantite && (
                            <small className="text-muted">
                              Quantité: {echange.quantite}
                            </small>
                          )}
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FontAwesomeIcon
                              icon={faPhone}
                              className="text-muted me-2"
                            />
                            <small className="text-muted">
                              {echange.numero}
                            </small>
                          </div>
                        </td>
                        <td>
                          <StatusBadge statut={echange.statut} />
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FontAwesomeIcon
                              icon={faCalendar}
                              className="text-muted me-2"
                            />
                            <small className="text-muted">
                              {formatDate(echange.createdAt)}
                            </small>
                          </div>
                        </td>
                        <td className="text-center">
                          <div className="btn-group btn-group-sm" role="group">
                            <button
                              className="btn btn-outline-primary"
                              title="Voir détails"
                              onClick={() => {
                                setSelectedEchange(echange);
                                setShowViewModal(true);
                              }}
                              disabled={loading}
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </button>
                            <button
                              className="btn btn-outline-warning"
                              title="Modifier"
                              onClick={() => {
                                setSelectedEchange(echange);
                                setShowEditModal(true);
                              }}
                              disabled={loading}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              title="Supprimer"
                              onClick={() => openDeleteModal(echange)}
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
                {filteredEchanges.length > pagination.limit && (
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.pages}
                    totalItems={filteredEchanges.length}
                    itemsPerPage={pagination.limit}
                    indexOfFirstItem={(pagination.page - 1) * pagination.limit}
                    onPageChange={(page) =>
                      setPagination((prev) => ({ ...prev, page }))
                    }
                    onLimitChange={(limit) =>
                      setPagination((prev) => ({
                        ...prev,
                        limit,
                        page: 1,
                      }))
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
          font-size: 0.75rem !important;
        }
        .card {
          border-radius: 12px;
          overflow: hidden;
        }
        .table th {
          font-weight: 600;
          background-color: #f8f9fa;
          border-bottom: 2px solid #dee2e6;
        }
        .table td {
          border-bottom: 1px solid #e9ecef;
        }
        .badge {
          font-weight: 500;
        }
        .placeholder-wave {
          animation: placeholder-wave 2s infinite linear;
        }
        @keyframes placeholder-wave {
          0% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            opacity: 0.5;
          }
        }
      `}</style>
    </>
  );
}
