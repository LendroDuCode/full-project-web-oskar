"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGift,
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
  faChartBar,
  faInfoCircle,
  faBan,
  faUsers,
  faLocationDot,
  faPhone,
  faTimes,
  faUnlock,
  faEllipsisV,
  faList,
  faImage,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";
import ViewDonModal from "../components/modals/ViewDonModal";

// Types
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
  est_bloque: boolean;
  lieu_retrait: string;
  est_public: number;
  vendeur: string;
  utilisateur: string;
  agent: string;
  createdAt: string | null;
  updatedAt: string | null;
}

// Composant de badge de statut
const StatusBadge = ({ statut }: { statut: string }) => {
  const getStatusInfo = (statut: string) => {
    const lowerStatut = statut.toLowerCase();

    if (lowerStatut.includes("bloqué") || lowerStatut === "bloque") {
      return {
        icon: faBan,
        color: colors.oskar.orange,
        label: "Bloqué",
      };
    }

    if (lowerStatut.includes("publié") || lowerStatut === "publie") {
      return {
        icon: faCheckCircle,
        color: colors.oskar.green,
        label: "Publié",
      };
    }

    if (lowerStatut.includes("disponible") || lowerStatut === "disponible") {
      return {
        icon: faCheckCircle,
        color: colors.oskar.blue,
        label: "Disponible",
      };
    }

    return {
      icon: faTimesCircle,
      color: colors.oskar.grey,
      label: statut,
    };
  };

  const statusInfo = getStatusInfo(statut);

  return (
    <span
      className="badge d-inline-flex align-items-center gap-2"
      style={{
        backgroundColor: `${statusInfo.color}15`,
        color: statusInfo.color,
        border: `1px solid ${statusInfo.color}30`,
        padding: "0.4rem 0.75rem",
        fontSize: "0.75rem",
        fontWeight: "500",
      }}
    >
      <FontAwesomeIcon icon={statusInfo.icon} className="fs-12" />
      <span>{statusInfo.label}</span>
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

// Composant de chargement
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
  don,
  loading,
  onClose,
  onConfirm,
  type = "single",
  count = 0,
}: {
  show: boolean;
  don: DonBloque | null;
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
            {type === "single" && don ? (
              <>
                <p className="mb-3">
                  Êtes-vous sûr de vouloir supprimer le don bloqué{" "}
                  <strong>{don.nom}</strong> ?
                </p>
                <div className="text-danger">
                  <small>
                    Cette action est irréversible. Toutes les données associées
                    à ce don seront perdues.
                  </small>
                </div>
              </>
            ) : (
              <>
                <p className="mb-3">
                  Êtes-vous sûr de vouloir supprimer{" "}
                  <strong>{count} don(s) bloqué(s)</strong> ?
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
                    ? `Supprimer ${count} don(s)`
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

// Composant de modal de déblocage
const UnblockModal = ({
  show,
  don,
  loading,
  onClose,
  onConfirm,
  type = "single",
  count = 0,
}: {
  show: boolean;
  don: DonBloque | null;
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
          <div className="modal-header border-0 bg-warning text-dark rounded-top-3">
            <h5 className="modal-title fw-bold">
              <FontAwesomeIcon icon={faUnlock} className="me-2" />
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
          <div className="modal-body p-4">
            <div className="alert alert-info mb-3 border-0">
              <FontAwesomeIcon icon={faUnlock} className="me-2" />
              <strong>Information :</strong> Le don sera à nouveau accessible
            </div>
            {type === "single" && don ? (
              <>
                <p className="mb-3">
                  Êtes-vous sûr de vouloir débloquer le don{" "}
                  <strong>{don.nom}</strong> ?
                </p>
                <div className="text-success">
                  <small>
                    Ce don redeviendra visible et accessible après déblocage.
                  </small>
                </div>
              </>
            ) : (
              <>
                <p className="mb-3">
                  Êtes-vous sûr de vouloir débloquer{" "}
                  <strong>{count} don(s) bloqué(s)</strong> ?
                </p>
                <div className="text-success">
                  <small>
                    Ces dons redeviendront visibles et accessibles après
                    déblocage.
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
              className="btn btn-warning"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  {type === "multiple"
                    ? "Déblocage en cours..."
                    : "Déblocage..."}
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faUnlock} className="me-2" />
                  {type === "multiple"
                    ? `Débloquer ${count} don(s)`
                    : "Débloquer le don"}
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
          <span className="fw-semibold">{totalItems}</span> dons bloqués
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

export default function DonsBloquesVendeurPage() {
  // États
  const [dons, setDons] = useState<DonBloque[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // États pour les modals
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [showDeleteMultipleModal, setShowDeleteMultipleModal] = useState(false);
  const [showUnblockMultipleModal, setShowUnblockMultipleModal] =
    useState(false);
  const [selectedDon, setSelectedDon] = useState<DonBloque | null>(null);

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReason, setSelectedReason] = useState<string>("all");
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
  const [selectAll, setSelectAll] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // États pour les actions
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [unblockLoading, setUnblockLoading] = useState(false);

  // Options pour les éléments par page
  const itemsPerPageOptions = [5, 10, 20, 50];

  // Charger les dons bloqués du vendeur
  const fetchDons = useCallback(
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
          ? `${API_ENDPOINTS.DONS.VENDEUR_BLOCKED}?${queryParams.toString()}`
          : API_ENDPOINTS.DONS.VENDEUR_BLOCKED;

        const response = await api.get<{ status: string; data: DonBloque[] }>(
          endpoint,
        );

        if (response?.status === "success" && Array.isArray(response.data)) {
          setDons(response.data);
          setPagination((prev) => ({
            ...prev,
            total: response.data.length,
            pages: Math.ceil(response.data.length / prev.limit),
          }));
        } else {
          throw new Error("Format de réponse API invalide");
        }

        // Réinitialiser la sélection après chargement
        setSelectedDons([]);
        setSelectAll(false);
      } catch (err: any) {
        console.error("❌ Erreur lors du chargement des dons bloqués:", err);
        let errorMessage = "Erreur lors du chargement des dons bloqués.";

        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        setDons([]);
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.limit],
  );

  useEffect(() => {
    fetchDons();
  }, []);

  // Gérer les changements de pagination et filtres
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params: Record<string, any> = {};

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      if (selectedReason !== "all") {
        params.reason = selectedReason;
      }

      fetchDons(params);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedReason, fetchDons]);

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

  const sortedDons = useMemo(() => {
    if (!sortConfig) return dons;
    return [...dons].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue === bValue) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      if (sortConfig.direction === "asc") return aValue < bValue ? -1 : 1;
      return aValue > bValue ? -1 : 1;
    });
  }, [dons, sortConfig]);

  const filteredDons = useMemo(() => {
    return sortedDons.filter((don) => {
      const matchesSearch =
        !searchTerm.trim() ||
        don.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        don.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        don.type_don?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        don.localisation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        don.categorie?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        don.vendeur?.toLowerCase().includes(searchTerm.toLowerCase());

      // Pour les dons bloqués, on filtre toujours par est_bloque = true
      const matchesBlocked = don.est_bloque === true;

      return matchesSearch && matchesBlocked;
    });
  }, [sortedDons, searchTerm]);

  // Statistiques
  const stats = useMemo(() => {
    const totalBlocked = dons.length;
    const stillPublished = dons.filter((d) => d.estPublie).length;
    const recentBlocked = dons.filter((d) => {
      if (!d.updatedAt) return false;
      const blockDate = new Date(d.updatedAt);
      const now = new Date();
      const diffDays =
        (now.getTime() - blockDate.getTime()) / (1000 * 3600 * 24);
      return diffDays <= 7; // Bloqué dans les 7 derniers jours
    }).length;

    return {
      total: totalBlocked,
      published: stillPublished,
      recent: recentBlocked,
    };
  }, [dons]);

  // Gestion succès
  const handleSuccess = (message: string) => {
    setSuccessMessage(message);
    fetchDons();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Suppression d'un don bloqué
  const handleDelete = async () => {
    if (!selectedDon) return;

    try {
      setDeleteLoading(true);
      await api.delete(API_ENDPOINTS.DONS.DELETE(selectedDon.uuid));

      setShowDeleteModal(false);
      setSelectedDon(null);
      handleSuccess("Don bloqué supprimé avec succès !");
    } catch (err: any) {
      console.error("❌ Erreur suppression:", err);
      setError(err.response?.data?.message || "Erreur lors de la suppression");
      setTimeout(() => setError(null), 3000);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Déblocage d'un don
  const handleUnblock = async () => {
    if (!selectedDon) return;

    try {
      setUnblockLoading(true);
      // Note: Vous devrez créer cet endpoint dans votre API
      await api.post(
        `${API_ENDPOINTS.DONS.DETAIL(selectedDon.uuid)}/debloquer`,
      );

      setShowUnblockModal(false);
      setSelectedDon(null);
      handleSuccess("Don débloqué avec succès !");
    } catch (err: any) {
      console.error("❌ Erreur déblocage:", err);
      setError(err.response?.data?.message || "Erreur lors du déblocage");
      setTimeout(() => setError(null), 3000);
    } finally {
      setUnblockLoading(false);
    }
  };

  // Suppression multiple
  const handleDeleteMultiple = async () => {
    if (selectedDons.length === 0) return;

    try {
      setDeleteLoading(true);
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

      setShowDeleteMultipleModal(false);
      setSuccessMessage(
        `${successCount} don(s) bloqué(s) supprimé(s) avec succès${errorCount > 0 ? ` (${errorCount} échec(s))` : ""}`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);

      // Réinitialiser la sélection
      setSelectedDons([]);
      setSelectAll(false);

      // Rafraîchir la liste
      fetchDons();
    } catch (err: any) {
      console.error("❌ Erreur suppression multiple:", err);
      setError("Erreur lors de la suppression multiple");
      setTimeout(() => setError(null), 3000);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Déblocage multiple
  const handleUnblockMultiple = async () => {
    if (selectedDons.length === 0) return;

    try {
      setUnblockLoading(true);
      let successCount = 0;
      let errorCount = 0;

      for (const donUuid of selectedDons) {
        try {
          // Note: Vous devrez créer cet endpoint dans votre API
          await api.post(`${API_ENDPOINTS.DONS.DETAIL(donUuid)}/debloquer`);
          successCount++;
        } catch (err) {
          console.error(`Erreur pour le don ${donUuid}:`, err);
          errorCount++;
        }
      }

      setShowUnblockMultipleModal(false);
      setSuccessMessage(
        `${successCount} don(s) débloqué(s) avec succès${errorCount > 0 ? ` (${errorCount} échec(s))` : ""}`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);

      // Réinitialiser la sélection
      setSelectedDons([]);
      setSelectAll(false);

      // Rafraîchir la liste
      fetchDons();
    } catch (err: any) {
      console.error("❌ Erreur déblocage multiple:", err);
      setError("Erreur lors du déblocage multiple");
      setTimeout(() => setError(null), 3000);
    } finally {
      setUnblockLoading(false);
    }
  };

  // Ouvrir modal de suppression
  const openDeleteModal = (don: DonBloque) => {
    setSelectedDon(don);
    setShowDeleteModal(true);
  };

  // Ouvrir modal de déblocage
  const openUnblockModal = (don: DonBloque) => {
    setSelectedDon(don);
    setShowUnblockModal(true);
  };

  // Ouvrir modal de suppression multiple
  const openDeleteMultipleModal = () => {
    if (selectedDons.length === 0) {
      setInfoMessage("Veuillez sélectionner au moins un don bloqué");
      setTimeout(() => setInfoMessage(null), 3000);
      return;
    }
    setShowDeleteMultipleModal(true);
  };

  // Ouvrir modal de déblocage multiple
  const openUnblockMultipleModal = () => {
    if (selectedDons.length === 0) {
      setInfoMessage("Veuillez sélectionner au moins un don bloqué");
      setTimeout(() => setInfoMessage(null), 3000);
      return;
    }
    setShowUnblockMultipleModal(true);
  };

  // Export PDF
  const handleExport = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.DONS.EXPORT_PDF, {
      });
      const url = window.URL.createObjectURL(response);
      const link = document.createElement("a");
      link.href = url;
      link.download = `dons-bloques-${new Date().toISOString().split("T")[0]}.pdf`;
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
    if (dons.length === 0) {
      setInfoMessage("Aucun don bloqué à exporter");
      setTimeout(() => setInfoMessage(null), 3000);
      return;
    }

    const csvContent = [
      [
        "Nom",
        "Type",
        "Catégorie",
        "Localisation",
        "Statut",
        "Publication",
        "Vendeur",
        "Date blocage",
        "Date création",
      ],
      ...dons.map((don) => [
        `"${don.nom || ""}"`,
        `"${don.type_don || ""}"`,
        `"${don.categorie || ""}"`,
        `"${don.localisation || ""}"`,
        don.statut || "bloqué",
        don.estPublie ? "Publié" : "Non publié",
        `"${don.vendeur || ""}"`,
        don.updatedAt
          ? new Date(don.updatedAt).toLocaleDateString("fr-FR")
          : "",
        don.createdAt
          ? new Date(don.createdAt).toLocaleDateString("fr-FR")
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
      `dons-bloques-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    handleSuccess("Export CSV réussi !");
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
            hour: "2-digit",
            minute: "2-digit",
          });
    } catch {
      return "N/A";
    }
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
    const allSelected = pageDonIds.every((id) => selectedDons.includes(id));

    if (allSelected) {
      // Désélectionner tous les dons de la page
      setSelectedDons((prev) => prev.filter((id) => !pageDonIds.includes(id)));
    } else {
      // Sélectionner tous les dons de la page
      const newSelection = [...new Set([...selectedDons, ...pageDonIds])];
      setSelectedDons(newSelection);
    }
  };

  // Pagination et filtres
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [searchTerm, selectedReason]);

  const currentItems = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    return filteredDons.slice(startIndex, startIndex + pagination.limit);
  }, [filteredDons, pagination.page, pagination.limit]);

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      total: filteredDons.length,
      pages: Math.ceil(filteredDons.length / prev.limit),
    }));
  }, [filteredDons]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedReason("all");
    setSortConfig(null);
    setPagination((prev) => ({ ...prev, page: 1 }));
    setSelectedDons([]);
    setSelectAll(false);
  };

  // Effet pour mettre à jour selectAll
  useEffect(() => {
    if (currentItems.length > 0) {
      const allSelected = currentItems.every((don) =>
        selectedDons.includes(don.uuid),
      );
      setSelectAll(allSelected);
    } else {
      setSelectAll(false);
    }
  }, [selectedDons, currentItems]);

  return (
    <>
      {/* Modals */}
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
      <DeleteModal
        show={showDeleteModal}
        don={selectedDon}
        loading={deleteLoading}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedDon(null);
        }}
        onConfirm={handleDelete}
        type="single"
      />
      <DeleteModal
        show={showDeleteMultipleModal}
        don={null}
        loading={deleteLoading}
        onClose={() => setShowDeleteMultipleModal(false)}
        onConfirm={handleDeleteMultiple}
        type="multiple"
        count={selectedDons.length}
      />
      <UnblockModal
        show={showUnblockModal}
        don={selectedDon}
        loading={unblockLoading}
        onClose={() => {
          setShowUnblockModal(false);
          setSelectedDon(null);
        }}
        onConfirm={handleUnblock}
        type="single"
      />
      <UnblockModal
        show={showUnblockMultipleModal}
        don={null}
        loading={unblockLoading}
        onClose={() => setShowUnblockMultipleModal(false)}
        onConfirm={handleUnblockMultiple}
        type="multiple"
        count={selectedDons.length}
      />

      <div className="p-3 p-md-4">
        <div className="card border-0 shadow-sm overflow-hidden">
          {/* En-tête avec gradient orange */}
          <div className="card-header text-white border-0 py-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div>
                <p className="mb-1 opacity-75 text-dark">Gestion des Dons</p>
                <div className="d-flex align-items-center gap-3">
                  <h2 className="h4 mb-0 fw-bold text-dark">Dons Bloqués</h2>
                  <span className="badge bg-white bg-opacity-20 text-white">
                    {filteredDons.length} don(s) bloqué(s){" "}
                    {selectedDons.length > 0 &&
                      `(${selectedDons.length} sélectionné(s))`}
                  </span>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <button
                  onClick={() => fetchDons()}
                  className="btn btn-outline-primary d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faRefresh} spin={loading} />
                  Rafraîchir
                </button>

                <button
                  onClick={handleExport}
                  className="btn btn-outline-warning d-flex align-items-center gap-2"
                  disabled={dons.length === 0 || loading}
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Exporter
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
                  <FontAwesomeIcon icon={faBan} className="text-warning" />
                  <span className="fw-semibold">
                    {selectedDons.length} don(s) bloqué(s) sélectionné(s)
                  </span>
                </div>

                <div className="d-flex flex-wrap gap-2">
                  <button
                    className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1"
                    onClick={openUnblockMultipleModal}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faUnlock} />
                    <span>Débloquer</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                    onClick={openDeleteMultipleModal}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    <span>Supprimer</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1"
                    onClick={() => {
                      setSelectedDons([]);
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
                    placeholder="Rechercher parmi les dons bloqués..."
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
                    value={selectedReason}
                    onChange={(e) => {
                      setSelectedReason(e.target.value);
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                  >
                    <option value="all">Toutes les raisons</option>
                    <option value="content">Contenu inapproprié</option>
                    <option value="spam">Spam</option>
                    <option value="other">Autre raison</option>
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

          {/* Tableau des dons bloqués */}
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
                      ? "Vous n'avez aucun don bloqué pour le moment."
                      : "Aucun don bloqué ne correspond à vos critères de recherche."}
                  </p>
                  <button
                    onClick={resetFilters}
                    className="btn btn-outline-warning mt-3"
                  >
                    <FontAwesomeIcon icon={faFilter} className="me-2" />
                    Effacer la recherche
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
                      <th style={{ width: "120px" }} className="text-center">
                        <span className="fw-semibold">Image</span>
                      </th>
                      <th style={{ width: "200px" }}>
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
                        <span className="fw-semibold">Catégorie</span>
                      </th>
                      <th style={{ width: "180px" }}>
                        <span className="fw-semibold">Informations</span>
                      </th>
                      <th style={{ width: "120px" }}>
                        <span className="fw-semibold">Statut</span>
                      </th>
                      <th style={{ width: "180px" }}>
                        <button
                          className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                          onClick={() => requestSort("updatedAt")}
                        >
                          <FontAwesomeIcon icon={faCalendar} className="me-1" />
                          Date blocage
                          {getSortIcon("updatedAt")}
                        </button>
                      </th>
                      <th style={{ width: "160px" }} className="text-center">
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
                                className="img-fluid rounded border opacity-75"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    `https://via.placeholder.com/60/fd7e14/ffffff?text=${don.nom.charAt(0)}`;
                                }}
                              />
                            </div>
                          ) : (
                            <div
                              className="bg-warning bg-opacity-10 rounded d-flex align-items-center justify-content-center mx-auto"
                              style={{ width: "60px", height: "60px" }}
                            >
                              <FontAwesomeIcon
                                icon={faBan}
                                className="text-warning"
                              />
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="flex-shrink-0">
                              <div
                                className="bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: "40px", height: "40px" }}
                              >
                                <FontAwesomeIcon icon={faGift} />
                              </div>
                            </div>
                            <div className="flex-grow-1 ms-3">
                              <div className="fw-semibold">{don.nom}</div>
                              <small className="text-muted d-block">
                                {don.type_don}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <span className="badge bg-light text-dark border">
                              {don.categorie}
                            </span>
                          </div>
                          {don.localisation && (
                            <div className="mt-1 d-flex align-items-center">
                              <FontAwesomeIcon
                                icon={faLocationDot}
                                className="text-muted me-1"
                                style={{ fontSize: "0.7rem" }}
                              />
                              <small
                                className="text-muted"
                                style={{ fontSize: "0.7rem" }}
                              >
                                {don.localisation}
                              </small>
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="d-flex flex-column gap-1">
                            <div>
                              <small className="text-muted">
                                Lieu retrait:
                              </small>
                              <div className="fw-semibold">
                                {don.lieu_retrait}
                              </div>
                            </div>
                            <div>
                              <small className="text-muted">Vendeur:</small>
                              <div className="fw-semibold">{don.vendeur}</div>
                            </div>
                            {don.estPublie && (
                              <div className="mt-1">
                                <small className="text-danger">
                                  ⚠️ Encore publié malgré le blocage
                                </small>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <StatusBadge statut={don.statut} />
                        </td>
                        <td>
                          <div className="d-flex flex-column">
                            <div className="d-flex align-items-center">
                              <FontAwesomeIcon
                                icon={faCalendar}
                                className="text-warning me-2"
                              />
                              <small className="text-warning fw-semibold">
                                {formatDate(don.updatedAt)}
                              </small>
                            </div>
                            {don.date_debut && (
                              <div className="mt-1">
                                <small className="text-muted">Créé le:</small>
                                <div className="fw-semibold">
                                  {formatDate(don.createdAt)}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="text-center">
                          <div className="d-flex flex-column gap-2 align-items-center">
                            <div
                              className="btn-group btn-group-sm"
                              role="group"
                            >
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
                                className="btn btn-outline-warning"
                                title="Débloquer"
                                onClick={() => openUnblockModal(don)}
                                disabled={loading}
                              >
                                <FontAwesomeIcon icon={faUnlock} />
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                title="Supprimer"
                                onClick={() => openDeleteModal(don)}
                                disabled={loading}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>

                            {/* Indicateur de statut */}
                            <div className="text-center">
                              <small className="text-warning fw-semibold">
                                ⚠️ Bloqué
                              </small>
                            </div>
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
          background-color: rgba(253, 126, 20, 0.05) !important;
        }
        .form-check-input:checked {
          background-color: #fd7e14;
          border-color: #fd7e14;
        }
        .form-check-input:focus {
          border-color: #ffc107;
          box-shadow: 0 0 0 0.25rem rgba(253, 126, 20, 0.25);
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
