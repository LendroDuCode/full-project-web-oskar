"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGift,
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
  faCalendar,
  faCheckCircle,
  faTimesCircle,
  faCheck,
  faTimes,
  faBan,
  faLock,
  faLockOpen,
  faLocationDot,
  faPhone,
  faUser,
  faTag,
  faInfoCircle,
  faBoxOpen,
  faShare,
  faCheckDouble,
  faExclamationTriangle,
  faEllipsisH,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";
import ViewDonModal from "../components/modals/ViewDonModal";

// Types basés sur la réponse API
interface DonBloque {
  uuid: string;
  type_don: string;
  nom: string;
  prix: number | null;
  categorie: string;
  image: string;
  localisation: string;
  description: string;
  statut: string;
  date_debut: string;
  date_fin: string | null;
  estPublie: boolean;
  est_bloque: boolean | null;
  lieu_retrait: string;
  est_public: number;
  vendeur: string;
  utilisateur: string;
  agent: string;
  createdAt: string | null;
  updatedAt: string | null;
}

interface ApiResponse {
  status: string;
  data: DonBloque[];
}

// Composant de badge de statut
const StatusBadge = ({
  est_bloque,
  statut,
}: {
  est_bloque: boolean | null;
  statut: string;
}) => {
  if (est_bloque) {
    return (
      <span
        className="badge d-inline-flex align-items-center gap-2"
        style={{
          backgroundColor: `${colors.oskar.red}15`,
          color: colors.oskar.red,
          border: `1px solid ${colors.oskar.red}30`,
          padding: "0.4rem 0.75rem",
          fontSize: "0.75rem",
          fontWeight: "500",
        }}
      >
        <FontAwesomeIcon icon={faBan} className="fs-12" />
        <span>Bloqué</span>
      </span>
    );
  }

  const lowerStatut = statut.toLowerCase();

  if (lowerStatut === "disponible") {
    return (
      <span
        className="badge d-inline-flex align-items-center gap-2"
        style={{
          backgroundColor: `${colors.oskar.green}15`,
          color: colors.oskar.green,
          border: `1px solid ${colors.oskar.green}30`,
          padding: "0.4rem 0.75rem",
          fontSize: "0.75rem",
          fontWeight: "500",
        }}
      >
        <FontAwesomeIcon icon={faCheckCircle} className="fs-12" />
        <span>Disponible</span>
      </span>
    );
  }

  return (
    <span
      className="badge d-inline-flex align-items-center gap-2"
      style={{
        backgroundColor: `${colors.oskar.orange}15`,
        color: colors.oskar.orange,
        border: `1px solid ${colors.oskar.orange}30`,
        padding: "0.4rem 0.75rem",
        fontSize: "0.75rem",
        fontWeight: "500",
      }}
    >
      <FontAwesomeIcon icon={faTimesCircle} className="fs-12" />
      <span>{statut}</span>
    </span>
  );
};

// Composant de chargement
const LoadingSkeleton = () => (
  <div className="table-responsive">
    <table className="table table-hover mb-0">
      <thead className="table-light">
        <tr>
          {[...Array(9)].map((_, i) => (
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
            {[...Array(9)].map((_, j) => (
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

// Composant de modal pour actions multiples
const BulkActionModal = ({
  show,
  title,
  message,
  loading,
  actionType,
  selectedCount,
  onClose,
  onConfirm,
}: {
  show: boolean;
  title: string;
  message: string;
  loading: boolean;
  actionType: "unblock" | "delete";
  selectedCount: number;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  if (!show) return null;

  const getModalColor = () => {
    return actionType === "delete" ? "bg-danger" : "bg-warning";
  };

  const getConfirmButtonColor = () => {
    return actionType === "delete" ? "btn-danger" : "btn-warning";
  };

  const getIcon = () => {
    return actionType === "delete" ? faTrash : faLockOpen;
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div
            className={`modal-header border-0 text-white rounded-top-3 ${getModalColor()}`}
          >
            <h5 className="modal-title fw-bold">
              <FontAwesomeIcon icon={getIcon()} className="me-2" />
              {title}
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
              <strong>Attention :</strong> Cette action affectera{" "}
              {selectedCount} don(s)
            </div>

            <p className="mb-3">{message}</p>

            <div className="text-warning">
              <small>
                Cette action est irréversible.{" "}
                {actionType === "delete"
                  ? "Toutes les données associées seront perdues."
                  : "Les dons seront immédiatement disponibles."}
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
              className={`btn ${getConfirmButtonColor()}`}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  {actionType === "delete"
                    ? "Suppression en cours..."
                    : "Déblocage en cours..."}
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={getIcon()} className="me-2" />
                  {actionType === "delete"
                    ? `Supprimer ${selectedCount} don(s)`
                    : `Débloquer ${selectedCount} don(s)`}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant de modal de suppression individuelle
const DeleteModal = ({
  show,
  don,
  loading,
  onClose,
  onConfirm,
}: {
  show: boolean;
  don: DonBloque | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
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
              Confirmer la suppression
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
            {don && (
              <>
                <p className="mb-3">
                  Êtes-vous sûr de vouloir supprimer le don{" "}
                  <strong>{don.nom}</strong> ?
                </p>
                <div className="text-danger">
                  <small>
                    Cette action est irréversible. Toutes les données associées
                    à ce don seront perdues.
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
                  Suppression...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faTrash} className="me-2" />
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
          <span className="fw-semibold">{totalItems}</span> dons
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

export default function DonsBloquesUtilisateur() {
  // États
  const [dons, setDons] = useState<DonBloque[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // États pour les modals
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [selectedDon, setSelectedDon] = useState<DonBloque | null>(null);
  const [bulkActionType, setBulkActionType] = useState<"unblock" | "delete">(
    "unblock",
  );

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof DonBloque;
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
  const [selectedDons, setSelectedDons] = useState<string[]>([]);
  const [selectAllOnPage, setSelectAllOnPage] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Options pour les éléments par page
  const itemsPerPageOptions = [5, 10, 20, 50];

  // Charger les dons bloqués de l'utilisateur
  const fetchDonsBloques = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setInfoMessage(null);
      setSuccessMessage(null);

      console.log("📡 Chargement des dons bloqués de l'utilisateur...");

      // Utilisation de l'endpoint spécifique pour les dons bloqués
      const response = await api.get<ApiResponse>(
        API_ENDPOINTS.DONS.USER_BLOCKED,
      );

      console.log("✅ Réponse API reçue:", response);

      if (response.status === "success" && Array.isArray(response.data)) {
        setDons(response.data);
        setPagination((prev) => ({
          ...prev,
          total: response.data.length,
          pages: Math.ceil(response.data.length / prev.limit),
        }));
      } else {
        throw new Error("Format de réponse API invalide");
      }

      // Réinitialiser la sélection
      setSelectedDons([]);
      setSelectAllOnPage(false);
    } catch (err: any) {
      console.error("❌ Erreur lors du chargement des dons bloqués:", err);

      let errorMessage = "Erreur lors du chargement des dons bloqués.";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      if (err.response?.status === 404) {
        errorMessage =
          "Endpoint non trouvé. Vérifiez que l'API est accessible.";
      }

      setError(errorMessage);
      setDons([]);
      setPagination((prev) => ({ ...prev, total: 0, pages: 1 }));
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les dons au montage
  useEffect(() => {
    fetchDonsBloques();
  }, [fetchDonsBloques]);

  // Débounce pour la recherche
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim() || selectedStatus !== "all") {
        setPagination((prev) => ({ ...prev, page: 1 }));
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedStatus]);

  // Fonctions de tri
  const requestSort = (key: keyof DonBloque) => {
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

  const getSortIcon = (key: keyof DonBloque) => {
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

  // Filtrage des données
  const filteredDons = useMemo(() => {
    return dons.filter((don) => {
      const matchesSearch =
        !searchTerm.trim() ||
        don.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        don.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        don.type_don?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        don.localisation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        don.categorie?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        selectedStatus === "all" ||
        don.statut?.toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [dons, searchTerm, selectedStatus]);

  // Tri des données filtrées
  const sortedDons = useMemo(() => {
    if (!sortConfig) return filteredDons;

    return [...filteredDons].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === bValue) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        if (sortConfig.direction === "asc") {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      }

      if (sortConfig.direction === "asc") {
        return aValue < bValue ? -1 : 1;
      }
      return aValue > bValue ? -1 : 1;
    });
  }, [filteredDons, sortConfig]);

  // Pagination - DÉPLACÉ AVANT L'USEEFFECT QUI L'UTILISE
  const currentItems = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    return sortedDons.slice(startIndex, startIndex + pagination.limit);
  }, [sortedDons, pagination.page, pagination.limit]);

  // Gestion succès
  const handleSuccess = (message: string) => {
    setSuccessMessage(message);
    fetchDonsBloques();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Gestion de la sélection multiple
  const handleSelectDon = (donUuid: string) => {
    setSelectedDons((prev) => {
      if (prev.includes(donUuid)) {
        return prev.filter((id) => id !== donUuid);
      } else {
        return [...prev, donUuid];
      }
    });
  };

  const handleSelectAllOnPage = () => {
    const pageDonIds = currentItems.map((don) => don.uuid);

    if (selectAllOnPage) {
      // Désélectionner tous les dons de la page
      setSelectedDons((prev) => prev.filter((id) => !pageDonIds.includes(id)));
    } else {
      // Sélectionner tous les dons de la page
      const newSelection = [...new Set([...selectedDons, ...pageDonIds])];
      setSelectedDons(newSelection);
    }
    setSelectAllOnPage(!selectAllOnPage);
  };

  // CORRECTION : Mettre à jour selectAllOnPage quand la sélection change
  // Cette fonction doit être définie APRÈS currentItems
  const updateSelectAllStatus = useCallback(() => {
    if (currentItems.length > 0) {
      const allSelected = currentItems.every((don) =>
        selectedDons.includes(don.uuid),
      );
      setSelectAllOnPage(allSelected);
    } else {
      setSelectAllOnPage(false);
    }
  }, [selectedDons, currentItems]);

  // Utiliser useEffect pour appeler updateSelectAllStatus
  useEffect(() => {
    updateSelectAllStatus();
  }, [updateSelectAllStatus]);

  // Actions en masse
  const handleBulkUnblock = async () => {
    if (selectedDons.length === 0) {
      setInfoMessage("Veuillez sélectionner au moins un don");
      setTimeout(() => setInfoMessage(null), 3000);
      return;
    }

    try {
      setBulkActionLoading(true);
      let successCount = 0;
      let errorCount = 0;

      for (const donUuid of selectedDons) {
        try {
          // Appeler l'API pour débloquer le don
          await api.put(`${API_ENDPOINTS.DONS.DETAIL(donUuid)}/unblock`);
          successCount++;
        } catch (err) {
          console.error(`Erreur pour le don ${donUuid}:`, err);
          errorCount++;
        }
      }

      setShowBulkActionModal(false);
      handleSuccess(
        `${successCount} don(s) débloqué(s) avec succès${errorCount > 0 ? ` (${errorCount} échec(s))` : ""}`,
      );

      // Réinitialiser la sélection
      setSelectedDons([]);
      setSelectAllOnPage(false);
    } catch (err: any) {
      console.error("❌ Erreur lors du déblocage en masse:", err);
      setError("Erreur lors du déblocage en masse");
      setTimeout(() => setError(null), 3000);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDons.length === 0) {
      setInfoMessage("Veuillez sélectionner au moins un don");
      setTimeout(() => setInfoMessage(null), 3000);
      return;
    }

    try {
      setBulkActionLoading(true);
      let successCount = 0;
      let errorCount = 0;

      for (const donUuid of selectedDons) {
        try {
          await api.delete(API_ENDPOINTS.DONS.DELETE(donUuid));
          successCount++;
        } catch (err) {
          console.error(`Erreur pour le don ${donUuid}:`, err);
          errorCount++;
        }
      }

      setShowBulkActionModal(false);
      handleSuccess(
        `${successCount} don(s) supprimé(s) avec succès${errorCount > 0 ? ` (${errorCount} échec(s))` : ""}`,
      );

      // Réinitialiser la sélection
      setSelectedDons([]);
      setSelectAllOnPage(false);
    } catch (err: any) {
      console.error("❌ Erreur lors de la suppression en masse:", err);
      setError("Erreur lors de la suppression en masse");
      setTimeout(() => setError(null), 3000);
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Ouvrir modal d'action en masse
  const openBulkActionModal = (actionType: "unblock" | "delete") => {
    if (selectedDons.length === 0) {
      setInfoMessage("Veuillez sélectionner au moins un don");
      setTimeout(() => setInfoMessage(null), 3000);
      return;
    }
    setBulkActionType(actionType);
    setShowBulkActionModal(true);
  };

  // Suppression individuelle
  const handleDelete = async () => {
    if (!selectedDon) return;

    try {
      setDeleteLoading(true);
      await api.delete(API_ENDPOINTS.DONS.DELETE(selectedDon.uuid));

      setShowDeleteModal(false);
      setSelectedDon(null);
      handleSuccess("Don supprimé avec succès !");
    } catch (err: any) {
      console.error("❌ Erreur suppression:", err);
      setError(err.response?.data?.message || "Erreur lors de la suppression");
      setTimeout(() => setError(null), 3000);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Déblocage individuel
  const handleUnblock = async (don: DonBloque) => {
    try {
      const response = await api.put(
        `${API_ENDPOINTS.DONS.DETAIL(don.uuid)}/unblock`,
      );

      if (response.success) {
        handleSuccess("Don débloqué avec succès !");
      }
    } catch (err: any) {
      console.error("❌ Erreur déblocage:", err);
      setError(err.response?.data?.message || "Erreur lors du déblocage");
      setTimeout(() => setError(null), 3000);
    }
  };

  // Utils
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

  // Mettre à jour la pagination quand les données filtrées changent
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      total: filteredDons.length,
      pages: Math.ceil(filteredDons.length / prev.limit),
    }));
  }, [filteredDons]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setSortConfig(null);
    setPagination((prev) => ({ ...prev, page: 1 }));
    setSelectedDons([]);
    setSelectAllOnPage(false);
  };

  // Statistiques
  const stats = useMemo(
    () => ({
      total: dons.length,
      blocked: dons.filter((d) => d.est_bloque).length,
      available: dons.filter((d) => d.statut?.toLowerCase() === "disponible")
        .length,
      unavailable: dons.filter(
        (d) => d.statut?.toLowerCase() === "indisponible",
      ).length,
    }),
    [dons],
  );

  return (
    <>
      {/* Modals 
        {selectedDon && (
        <ViewDonModal
          isOpen={showViewModal}
          don={selectedDon}
          onClose={() => {
            setShowViewModal(false);
            setSelectedDon(null);
          }}
        />
      )}
      */}
    

      <DeleteModal
        show={showDeleteModal}
        don={selectedDon}
        loading={deleteLoading}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedDon(null);
        }}
        onConfirm={handleDelete}
      />

      <BulkActionModal
        show={showBulkActionModal}
        title={
          bulkActionType === "delete"
            ? "Suppression multiple"
            : "Déblocage multiple"
        }
        message={
          bulkActionType === "delete"
            ? `Êtes-vous sûr de vouloir supprimer ${selectedDons.length} don(s) bloqué(s) ?`
            : `Êtes-vous sûr de vouloir débloquer ${selectedDons.length} don(s) ?`
        }
        loading={bulkActionLoading}
        actionType={bulkActionType}
        selectedCount={selectedDons.length}
        onClose={() => setShowBulkActionModal(false)}
        onConfirm={
          bulkActionType === "delete" ? handleBulkDelete : handleBulkUnblock
        }
      />

      <div className="p-3 p-md-4">
        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="card-header bg-white border-0 py-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div>
                <p className="text-muted mb-1">Mes Dons</p>
                <div className="d-flex align-items-center gap-3">
                  <h2 className="h4 mb-0 fw-bold">Dons Bloqués</h2>
                  <span className="badge bg-danger bg-opacity-10 text-danger">
                    {stats.total} don(s) bloqué(s)
                  </span>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <button
                  onClick={() => fetchDonsBloques()}
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faRefresh} spin={loading} />
                  Rafraîchir
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
          {selectedDons.length > 0 && (
            <div className="p-3 border-bottom bg-warning bg-opacity-10">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                <div className="d-flex align-items-center gap-2">
                  <FontAwesomeIcon
                    icon={faCheckDouble}
                    className="text-warning"
                  />
                  <span className="fw-semibold">
                    {selectedDons.length} don(s) sélectionné(s)
                  </span>
                </div>

                <div className="d-flex flex-wrap gap-2">
                  <button
                    className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                    onClick={() => openBulkActionModal("unblock")}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faLockOpen} />
                    <span>Débloquer</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                    onClick={() => openBulkActionModal("delete")}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    <span>Supprimer</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1"
                    onClick={() => {
                      setSelectedDons([]);
                      setSelectAllOnPage(false);
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
              <div className="col-md-5">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faSearch} className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Rechercher par nom, description, catégorie..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="disponible">Disponible</option>
                    <option value="indisponible">Indisponible</option>
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
                    Résultats: <strong>{filteredDons.length}</strong> don(s)
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

              <div className="col-md-4 text-end">
                <div className="d-flex align-items-center gap-2 justify-content-end">
                  {selectedDons.length > 0 && (
                    <small className="text-warning fw-semibold">
                      {selectedDons.length} sélectionné(s)
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

          {/* Tableau des dons */}
          <div className="table-responsive">
            {loading ? (
              <LoadingSkeleton />
            ) : filteredDons.length === 0 ? (
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
                    {dons.length === 0 ? "Aucun don bloqué" : "Aucun résultat"}
                  </h5>
                  <p className="mb-0 text-center">
                    {dons.length === 0
                      ? "Vous n'avez aucun don bloqué."
                      : "Aucun don bloqué ne correspond à vos critères de recherche."}
                  </p>
                  {dons.length > 0 && (
                    <button
                      onClick={resetFilters}
                      className="btn btn-outline-warning mt-3"
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
                            checked={selectAllOnPage && currentItems.length > 0}
                            onChange={handleSelectAllOnPage}
                            disabled={currentItems.length === 0}
                            title={
                              selectAllOnPage
                                ? "Désélectionner cette page"
                                : "Sélectionner cette page"
                            }
                          />
                        </div>
                      </th>
                      <th style={{ width: "60px" }} className="text-center">
                        #
                      </th>
                      <th style={{ width: "100px" }} className="text-center">
                        <span className="fw-semibold">Image</span>
                      </th>
                      <th style={{ width: "180px" }}>
                        <button
                          className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                          onClick={() => requestSort("nom")}
                        >
                          <FontAwesomeIcon icon={faTag} className="me-1" />
                          Nom
                          {getSortIcon("nom")}
                        </button>
                      </th>
                      <th style={{ width: "150px" }}>
                        <span className="fw-semibold">Type & Catégorie</span>
                      </th>
                      <th style={{ width: "150px" }}>
                        <button
                          className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                          onClick={() => requestSort("localisation")}
                        >
                          <FontAwesomeIcon
                            icon={faLocationDot}
                            className="me-1"
                          />
                          Localisation
                          {getSortIcon("localisation")}
                        </button>
                      </th>

                      <th style={{ width: "150px" }}>
                        <button
                          className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                          onClick={() => requestSort("date_debut")}
                        >
                          <FontAwesomeIcon icon={faCalendar} className="me-1" />
                          Date début
                          {getSortIcon("date_debut")}
                        </button>
                      </th>
                      <th style={{ width: "180px" }} className="text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((don, index) => (
                      <tr
                        key={don.uuid}
                        className={`align-middle ${selectedDons.includes(don.uuid) ? "table-active" : ""}`}
                      >
                        <td className="text-center">
                          <div className="form-check d-flex justify-content-center">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={selectedDons.includes(don.uuid)}
                              onChange={() => handleSelectDon(don.uuid)}
                            />
                          </div>
                        </td>
                        <td className="text-center text-muted fw-semibold">
                          {(pagination.page - 1) * pagination.limit + index + 1}
                        </td>
                        <td className="text-center">
                          {don.image ? (
                            <div
                              className="position-relative mx-auto"
                              style={{ width: "60px", height: "60px" }}
                            >
                              <img
                                src={don.image}
                                alt={don.nom}
                                className="img-fluid rounded border"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    `https://via.placeholder.com/60/DC3545/FFFFFF?text=${don.nom?.charAt(0) || "B"}`;
                                }}
                              />
                            </div>
                          ) : (
                            <div
                              className="bg-danger bg-opacity-10 rounded d-flex align-items-center justify-content-center mx-auto"
                              style={{ width: "60px", height: "60px" }}
                            >
                              <FontAwesomeIcon
                                icon={faBan}
                                className="text-danger"
                              />
                            </div>
                          )}
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
                              <div className="fw-semibold">{don.nom}</div>
                              {don.description && (
                                <small
                                  className="text-muted text-truncate d-block"
                                  style={{
                                    maxWidth: "150px",
                                    fontSize: "0.75rem",
                                  }}
                                  title={don.description}
                                >
                                  {don.description.length > 50
                                    ? `${don.description.substring(0, 50)}...`
                                    : don.description}
                                </small>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex flex-column gap-1">
                            <div>
                              <small className="text-muted">Type:</small>
                              <div className="fw-semibold">{don.type_don}</div>
                            </div>
                            <div>
                              <small className="text-muted">Catégorie:</small>
                              <div className="fw-semibold">{don.categorie}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FontAwesomeIcon
                              icon={faLocationDot}
                              className="text-muted me-2"
                            />
                            <small className="text-muted">
                              {don.localisation}
                            </small>
                          </div>
                          {don.lieu_retrait && (
                            <div className="mt-1">
                              <small className="text-muted">Retrait:</small>
                              <div className="fw-semibold">
                                {don.lieu_retrait}
                              </div>
                            </div>
                          )}
                        </td>

                        <td>
                          <div className="d-flex align-items-center">
                            <FontAwesomeIcon
                              icon={faCalendar}
                              className="text-muted me-2"
                            />
                            <small className="text-muted">
                              {formatDate(don.date_debut)}
                            </small>
                          </div>
                          {don.date_fin && (
                            <div className="mt-1">
                              <small className="text-muted">
                                Jusqu'au: {formatDate(don.date_fin)}
                              </small>
                            </div>
                          )}
                        </td>
                        <td className="text-center">
                          <div className="btn-group btn-group-sm" role="group">
                            <button
                              className="btn btn-outline-primary"
                              title="Voir détails"
                              onClick={() => {
                                setSelectedDon(don);
                                setShowViewModal(true);
                              }}
                              disabled={loading}
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </button>
                            <button
                              className="btn btn-outline-success"
                              title="Débloquer"
                              onClick={() => handleUnblock(don)}
                              disabled={loading}
                            >
                              <FontAwesomeIcon icon={faLockOpen} />
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              title="Supprimer"
                              onClick={() => {
                                setSelectedDon(don);
                                setShowDeleteModal(true);
                              }}
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
                {filteredDons.length > pagination.limit && (
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.pages}
                    totalItems={filteredDons.length}
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
          background-color: rgba(220, 53, 69, 0.05) !important;
        }
        .form-check-input:checked {
          background-color: #dc3545;
          border-color: #dc3545;
        }
        .form-check-input:focus {
          border-color: #e35d6a;
          box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
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
