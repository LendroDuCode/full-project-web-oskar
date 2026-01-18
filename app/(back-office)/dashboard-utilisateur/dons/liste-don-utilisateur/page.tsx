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
  faLocationDot,
  faPhone,
  faUser,
  faTag,
  faInfoCircle,
  faBoxOpen,
  faShare,
  faHeart,
  faCheckSquare,
  faSquare,
  faEllipsisV,
  faListCheck,
  faCopy,
  faCheckDouble,
  faLayerGroup,
  faTasks,
  faCogs,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";
import CreateDonModal from "../components/modals/CreateDonModal";
import EditDonModal from "../components/modals/EditDonModal";
import ViewDonModal from "../components/modals/ViewDonModal";

// Types basés sur la réponse API
interface DonUtilisateur {
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
  data: DonUtilisateur[];
}

// Types pour les actions groupées
type BulkActionType =
  | "publish"
  | "unpublish"
  | "delete"
  | "duplicate"
  | "export";

interface BulkAction {
  type: BulkActionType;
  label: string;
  icon: any;
  color: string;
  description: string;
}

// Composant de badge de statut
const StatusBadge = ({
  statut,
  estPublie,
}: {
  statut: string;
  estPublie: boolean;
}) => {
  const getStatusInfo = () => {
    const lowerStatut = statut.toLowerCase();

    if (estPublie) {
      return {
        icon: faCheckCircle,
        color: colors.oskar.green,
        label: "Publié",
        subLabel: lowerStatut === "disponible" ? "Disponible" : "Indisponible",
      };
    }

    if (lowerStatut === "disponible") {
      return {
        icon: faCheckCircle,
        color: colors.oskar.blue,
        label: "Disponible",
        subLabel: "Non publié",
      };
    }

    if (lowerStatut === "indisponible") {
      return {
        icon: faTimesCircle,
        color: colors.oskar.orange,
        label: "Indisponible",
        subLabel: "Non publié",
      };
    }

    return {
      icon: faTimesCircle,
      color: colors.oskar.grey,
      label: statut,
      subLabel: "Non publié",
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="d-flex flex-column gap-1">
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
      {statusInfo.subLabel && (
        <small className="text-muted" style={{ fontSize: "0.7rem" }}>
          {statusInfo.subLabel}
        </small>
      )}
    </div>
  );
};

// Composant de chargement
const LoadingSkeleton = () => (
  <div className="table-responsive">
    <table className="table table-hover mb-0">
      <thead className="table-light">
        <tr>
          <th style={{ width: "50px" }}>
            <div
              className="placeholder placeholder-wave"
              style={{ width: "20px", height: "20px" }}
            />
          </th>
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
            <td>
              <div
                className="placeholder placeholder-wave"
                style={{ width: "20px", height: "20px" }}
              />
            </td>
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
}: {
  show: boolean;
  don: DonUtilisateur | null;
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
              <FontAwesomeIcon icon={faTimesCircle} className="me-2" />
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

// Composant de modal d'actions groupées
const BulkActionsModal = ({
  show,
  selectedCount,
  actions,
  loading,
  onClose,
  onActionSelect,
}: {
  show: boolean;
  selectedCount: number;
  actions: BulkAction[];
  loading: boolean;
  onClose: () => void;
  onActionSelect: (actionType: BulkActionType) => void;
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
          <div className="modal-header border-0 bg-primary text-white rounded-top-3">
            <h5 className="modal-title fw-bold">
              <FontAwesomeIcon icon={faTasks} className="me-2" />
              Actions groupées ({selectedCount} dons sélectionnés)
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          <div className="modal-body p-4">
            <div className="alert alert-info mb-3 border-0">
              <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
              <strong>Information :</strong> Vous allez appliquer une action à{" "}
              {selectedCount} don(s) sélectionné(s).
            </div>

            <div className="row g-3">
              {actions.map((action) => (
                <div key={action.type} className="col-md-6">
                  <button
                    className="btn btn-outline-light w-100 h-100 text-start p-3 border-0"
                    style={{
                      backgroundColor: `${action.color}10`,
                      borderLeft: `4px solid ${action.color} !important`,
                    }}
                    onClick={() => onActionSelect(action.type)}
                    disabled={loading}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: "48px",
                          height: "48px",
                          backgroundColor: `${action.color}20`,
                          color: action.color,
                        }}
                      >
                        <FontAwesomeIcon icon={action.icon} size="lg" />
                      </div>
                      <div>
                        <h6 className="mb-1 fw-bold">{action.label}</h6>
                        <small className="text-muted">
                          {action.description}
                        </small>
                      </div>
                    </div>
                  </button>
                </div>
              ))}
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
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant de modal de confirmation d'action groupée
const ConfirmBulkActionModal = ({
  show,
  action,
  selectedCount,
  loading,
  onClose,
  onConfirm,
}: {
  show: boolean;
  action: BulkAction | null;
  selectedCount: number;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  if (!show || !action) return null;

  const getActionMessage = () => {
    switch (action.type) {
      case "publish":
        return `publier ${selectedCount} don(s)`;
      case "unpublish":
        return `dépublier ${selectedCount} don(s)`;
      case "delete":
        return `supprimer définitivement ${selectedCount} don(s)`;
      case "duplicate":
        return `dupliquer ${selectedCount} don(s)`;
      case "export":
        return `exporter ${selectedCount} don(s)`;
      default:
        return `effectuer cette action sur ${selectedCount} don(s)`;
    }
  };

  const getActionColor = () => {
    switch (action.type) {
      case "delete":
        return "danger";
      case "publish":
        return "success";
      case "unpublish":
        return "warning";
      default:
        return "primary";
    }
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
            className={`modal-header border-0 bg-${getActionColor()} text-white rounded-top-3`}
          >
            <h5 className="modal-title fw-bold">
              <FontAwesomeIcon icon={action.icon} className="me-2" />
              Confirmer l'action groupée
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          <div className="modal-body p-4">
            <div className={`alert alert-${getActionColor()} mb-3 border-0`}>
              <FontAwesomeIcon icon={action.icon} className="me-2" />
              <strong>Confirmation requise :</strong> Vous êtes sur le point de{" "}
              {getActionMessage()}.
            </div>
            <p className="mb-3">
              Êtes-vous sûr de vouloir {getActionMessage()} ?
            </p>
            {action.type === "delete" && (
              <div className="text-danger">
                <small>
                  <strong>Attention :</strong> Cette action est irréversible.
                  Toutes les données associées à ces dons seront perdues
                  définitivement.
                </small>
              </div>
            )}
            {action.type === "duplicate" && (
              <div className="text-info">
                <small>
                  <strong>Note :</strong> Les dons dupliqués auront "(Copie)"
                  ajouté à leur nom.
                </small>
              </div>
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
              className={`btn btn-${getActionColor()}`}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Traitement en cours...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={action.icon} className="me-2" />
                  Confirmer ({selectedCount} dons)
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

export default function ListeDonUtilisateur() {
  // États
  const [dons, setDons] = useState<DonUtilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // États pour les modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDon, setSelectedDon] = useState<DonUtilisateur | null>(null);

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPublication, setSelectedPublication] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof DonUtilisateur;
    direction: "asc" | "desc";
  } | null>(null);

  // États pour la pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // États pour les actions
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // États pour la sélection multiple
  const [selectedDons, setSelectedDons] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [showBulkActionsModal, setShowBulkActionsModal] = useState(false);
  const [showConfirmBulkActionModal, setShowConfirmBulkActionModal] =
    useState(false);
  const [selectedBulkAction, setSelectedBulkAction] =
    useState<BulkActionType | null>(null);

  // Options pour les éléments par page
  const itemsPerPageOptions = [5, 10, 20, 50];

  // Définition des actions groupées disponibles
  const bulkActions: BulkAction[] = [
    {
      type: "publish",
      label: "Publier",
      icon: faShare,
      color: colors.oskar.green,
      description: "Rendre visible publiquement les dons sélectionnés",
    },
    {
      type: "unpublish",
      label: "Dépublier",
      icon: faBan,
      color: colors.oskar.orange,
      description: "Retirer de la publication les dons sélectionnés",
    },
    {
      type: "duplicate",
      label: "Dupliquer",
      icon: faCopy,
      color: colors.oskar.blue,
      description: "Créer des copies des dons sélectionnés",
    },
    {
      type: "export",
      label: "Exporter",
      icon: faDownload,
      color: colors.oskar.purple,
      description: "Télécharger les données des dons sélectionnés",
    },
    {
      type: "delete",
      label: "Supprimer",
      icon: faTrash,
      color: colors.oskar.red,
      description: "Supprimer définitivement les dons sélectionnés",
    },
  ];

  // Charger les dons de l'utilisateur
  const fetchDonsUtilisateur = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setInfoMessage(null);
      setSuccessMessage(null);

      console.log("📡 Chargement des dons de l'utilisateur...");

      // Utilisation de l'endpoint spécifique pour les dons de l'utilisateur
      const response = await api.get<ApiResponse>(API_ENDPOINTS.DONS.USER_DONS);

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
    } catch (err: any) {
      console.error("❌ Erreur lors du chargement des dons:", err);

      let errorMessage = "Erreur lors du chargement de vos dons.";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Vérifier si c'est une erreur 404
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
    fetchDonsUtilisateur();
  }, [fetchDonsUtilisateur]);

  // Réinitialiser la sélection quand les données changent
  useEffect(() => {
    resetSelection();
  }, [dons, pagination.page]);

  // Débounce pour la recherche
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (
        searchTerm.trim() ||
        selectedStatus !== "all" ||
        selectedPublication !== "all"
      ) {
        setPagination((prev) => ({ ...prev, page: 1 }));
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedStatus, selectedPublication]);

  // Fonctions de tri
  const requestSort = (key: keyof DonUtilisateur) => {
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

  const getSortIcon = (key: keyof DonUtilisateur) => {
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

      const matchesPublication =
        selectedPublication === "all" ||
        (selectedPublication === "published" && don.estPublie) ||
        (selectedPublication === "unpublished" && !don.estPublie);

      return matchesSearch && matchesStatus && matchesPublication;
    });
  }, [dons, searchTerm, selectedStatus, selectedPublication]);

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

  // Gestion succès
  const handleSuccess = (message: string) => {
    setSuccessMessage(message);
    fetchDonsUtilisateur();
    resetSelection();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Suppression d'un don
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

  // Ouvrir modal de suppression
  const openDeleteModal = (don: DonUtilisateur) => {
    setSelectedDon(don);
    setShowDeleteModal(true);
  };

  // Publier un don
  const handlePublish = async (don: DonUtilisateur) => {
    try {
      const response = await api.post(API_ENDPOINTS.DONS.PUBLISH, {
        uuid: don.uuid,
      });

      if (response.success) {
        handleSuccess("Don publié avec succès !");
      }
    } catch (err: any) {
      console.error("❌ Erreur publication:", err);
      setError(err.response?.data?.message || "Erreur lors de la publication");
      setTimeout(() => setError(null), 3000);
    }
  };

  // Gestion de la sélection multiple
  const toggleDonSelection = (donId: string) => {
    const newSelected = new Set(selectedDons);
    if (newSelected.has(donId)) {
      newSelected.delete(donId);
    } else {
      newSelected.add(donId);
    }
    setSelectedDons(newSelected);
    setSelectAll(newSelected.size === currentItems.length);
  };

  const toggleSelectAll = () => {
    if (selectAll || selectedDons.size === currentItems.length) {
      resetSelection();
    } else {
      const allIds = new Set(currentItems.map((don) => don.uuid));
      setSelectedDons(allIds);
      setSelectAll(true);
    }
  };

  const isDonSelected = (donId: string) => {
    return selectedDons.has(donId);
  };

  const getSelectedCount = () => {
    return selectedDons.size;
  };

  const resetSelection = () => {
    setSelectedDons(new Set());
    setSelectAll(false);
  };

  const getSelectedDons = () => {
    return dons.filter((don) => selectedDons.has(don.uuid));
  };

  // Gestion des actions groupées
  const openBulkActionsModal = () => {
    if (selectedDons.size > 0) {
      setShowBulkActionsModal(true);
    }
  };

  const handleBulkActionSelect = (actionType: BulkActionType) => {
    setSelectedBulkAction(actionType);
    setShowBulkActionsModal(false);
    setShowConfirmBulkActionModal(true);
  };

  const executeBulkAction = async () => {
    if (!selectedBulkAction || selectedDons.size === 0) return;

    try {
      setBulkActionLoading(true);

      const selectedDonsList = getSelectedDons();
      const actionPromises = [];

      switch (selectedBulkAction) {
        case "publish":
          for (const don of selectedDonsList) {
            actionPromises.push(
              api.post(API_ENDPOINTS.DONS.PUBLISH, { uuid: don.uuid }),
            );
          }
          break;

        case "unpublish":
          // Supposons qu'il existe un endpoint pour dépublier
          for (const don of selectedDonsList) {
            actionPromises.push(
              api.post(API_ENDPOINTS.DONS.PUBLISH, { uuid: don.uuid }),
            );
          }
          break;

        case "delete":
          for (const don of selectedDonsList) {
            actionPromises.push(
              api.delete(API_ENDPOINTS.DONS.DELETE(don.uuid)),
            );
          }
          break;

        case "duplicate":
          for (const don of selectedDonsList) {
            const duplicatedDon = {
              ...don,
              nom: `${don.nom} (Copie)`,
              uuid: undefined,
              createdAt: undefined,
              updatedAt: undefined,
            };
            actionPromises.push(
              api.post(API_ENDPOINTS.DONS.CREATE, duplicatedDon),
            );
          }
          break;

        case "export":
          // Logique d'export (création d'un fichier CSV par exemple)
          exportSelectedDons(selectedDonsList);
          break;
      }

      if (selectedBulkAction !== "export") {
        await Promise.all(actionPromises);

        const actionMessages = {
          publish: "publié(s)",
          unpublish: "dépublié(s)",
          delete: "supprimé(s)",
          duplicate: "dupliqué(s)",
          export: "exporté(s)",
        };

        handleSuccess(
          `${selectedDons.size} don(s) ${actionMessages[selectedBulkAction]} avec succès !`,
        );
      }

      setShowConfirmBulkActionModal(false);
      setSelectedBulkAction(null);
    } catch (err: any) {
      console.error("❌ Erreur action groupée:", err);
      setError(
        err.response?.data?.message || "Erreur lors de l'action groupée",
      );
      setTimeout(() => setError(null), 3000);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const exportSelectedDons = (donsList: DonUtilisateur[]) => {
    // Créer un fichier CSV avec les dons sélectionnés
    const headers = [
      "Nom",
      "Type",
      "Catégorie",
      "Statut",
      "Publication",
      "Localisation",
      "Date début",
    ];
    const csvData = donsList.map((don) => [
      don.nom,
      don.type_don,
      don.categorie,
      don.statut,
      don.estPublie ? "Publié" : "Non publié",
      don.localisation,
      formatDate(don.date_debut),
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `dons_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    handleSuccess(`${donsList.length} don(s) exporté(s) avec succès !`);
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

  // Pagination
  const currentItems = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    return sortedDons.slice(startIndex, startIndex + pagination.limit);
  }, [sortedDons, pagination.page, pagination.limit]);

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
    setSelectedPublication("all");
    setSortConfig(null);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Statistiques
  const stats = useMemo(
    () => ({
      total: dons.length,
      published: dons.filter((d) => d.estPublie).length,
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
        <EditDonModal
          isOpen={showEditModal}
          don={selectedDon}
          onClose={() => {
            setShowEditModal(false);
            setSelectedDon(null);
          }}
          onSuccess={() => handleSuccess("Don modifié avec succès !")}
        />
      )}
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
      <CreateDonModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => handleSuccess("Don créé avec succès !")}
      />
   
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

      {/* Modals pour actions groupées */}
      <BulkActionsModal
        show={showBulkActionsModal}
        selectedCount={getSelectedCount()}
        actions={bulkActions}
        loading={bulkActionLoading}
        onClose={() => setShowBulkActionsModal(false)}
        onActionSelect={handleBulkActionSelect}
      />

      <ConfirmBulkActionModal
        show={showConfirmBulkActionModal}
        action={
          selectedBulkAction
            ? bulkActions.find((a) => a.type === selectedBulkAction) || null
            : null
        }
        selectedCount={getSelectedCount()}
        loading={bulkActionLoading}
        onClose={() => {
          setShowConfirmBulkActionModal(false);
          setSelectedBulkAction(null);
        }}
        onConfirm={executeBulkAction}
      />

      <div className="p-3 p-md-4">
        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="card-header bg-white border-0 py-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div>
                <p className="text-muted mb-1">Mes Dons</p>
                <div className="d-flex align-items-center gap-3">
                  <h2 className="h4 mb-0 fw-bold">Mes Dons Personnels</h2>
                  <span className="badge bg-warning bg-opacity-10 text-warning">
                    {stats.total} don(s) total
                  </span>

                  {/* Indicateur de sélection */}
                  {selectedDons.size > 0 && (
                    <span className="badge bg-primary bg-opacity-10 text-primary">
                      <FontAwesomeIcon icon={faCheckSquare} className="me-1" />
                      {selectedDons.size} sélectionné(s)
                    </span>
                  )}
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2">
                {/* Bouton actions groupées */}
                {selectedDons.size > 0 ? (
                  <button
                    onClick={openBulkActionsModal}
                    className="btn btn-primary d-flex align-items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faTasks} />
                    Actions ({selectedDons.size})
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (currentItems.length > 0) {
                        toggleSelectAll();
                      }
                    }}
                    className="btn btn-outline-primary d-flex align-items-center gap-2"
                    disabled={currentItems.length === 0}
                  >
                    <FontAwesomeIcon icon={faCheckSquare} />
                    Sélectionner
                  </button>
                )}

                <button
                  onClick={() => fetchDonsUtilisateur()}
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faRefresh} spin={loading} />
                  Rafraîchir
                </button>

                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-success text-white d-flex align-items-center gap-2"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Nouveau Don
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
                    placeholder="Rechercher par nom, description, catégorie..."
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
                    <option value="disponible">Disponible</option>
                    <option value="indisponible">Indisponible</option>
                  </select>
                </div>
              </div>

              <div className="col-md-3">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faShare} className="text-muted" />
                  </span>
                  <select
                    className="form-select border-start-0 ps-0"
                    value={selectedPublication}
                    onChange={(e) => setSelectedPublication(e.target.value)}
                  >
                    <option value="all">Tous</option>
                    <option value="published">Publiés</option>
                    <option value="unpublished">Non publiés</option>
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
                    {searchTerm && (
                      <>
                        {" "}
                        pour "<strong>{searchTerm}</strong>"
                      </>
                    )}
                  </small>

                  {/* Indicateur de sélection multiple */}
                  {selectedDons.size > 0 && (
                    <>
                      <div className="vr"></div>
                      <small className="text-primary fw-semibold">
                        <FontAwesomeIcon
                          icon={faCheckSquare}
                          className="me-1"
                        />
                        {selectedDons.size} sélectionné(s)
                      </small>
                    </>
                  )}
                </div>
              </div>

              <div className="col-md-4 text-end">
                <div className="d-flex align-items-center gap-2 justify-content-end">
                  {selectedDons.size > 0 && (
                    <button
                      onClick={resetSelection}
                      className="btn btn-sm btn-outline-danger d-flex align-items-center gap-2"
                      disabled={bulkActionLoading}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                      Annuler la sélection
                    </button>
                  )}

                  <button
                    onClick={resetFilters}
                    className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2"
                    disabled={loading}
                    title="Réinitialiser les filtres"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                    <span className="d-none d-md-inline">Reset filtres</span>
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
                    icon={faGift}
                    className="fs-1 mb-3 text-info"
                  />
                  <h5 className="alert-heading">
                    {dons.length === 0
                      ? "Vous n'avez aucun don"
                      : "Aucun résultat"}
                  </h5>
                  <p className="mb-0 text-center">
                    {dons.length === 0
                      ? "Commencez par créer votre premier don !"
                      : "Aucun don ne correspond à vos critères de recherche."}
                  </p>
                  {dons.length === 0 ? (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="btn btn-warning text-white mt-3"
                    >
                      <FontAwesomeIcon icon={faPlus} className="me-2" />
                      Créer mon premier don
                    </button>
                  ) : (
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
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={
                              selectAll ||
                              selectedDons.size === currentItems.length
                            }
                            onChange={toggleSelectAll}
                            disabled={loading || currentItems.length === 0}
                            title={
                              selectAll
                                ? "Désélectionner tout"
                                : "Sélectionner tout"
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
                        <span className="fw-semibold">Type & Catégorie</span>
                      </th>
                      <th style={{ width: "180px" }}>
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
                        <span className="fw-semibold">Statut</span>
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
                        className={`align-middle ${isDonSelected(don.uuid) ? "selected" : ""}`}
                      >
                        <td className="text-center">
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={isDonSelected(don.uuid)}
                              onChange={() => toggleDonSelection(don.uuid)}
                              disabled={loading}
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
                                    `https://via.placeholder.com/60/4A90E2/FFFFFF?text=${don.nom?.charAt(0) || "D"}`;
                                }}
                              />
                            </div>
                          ) : (
                            <div
                              className="bg-primary bg-opacity-10 rounded d-flex align-items-center justify-content-center mx-auto"
                              style={{ width: "60px", height: "60px" }}
                            >
                              <FontAwesomeIcon
                                icon={faGift}
                                className="text-primary"
                              />
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="flex-shrink-0">
                              <div
                                className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: "40px", height: "40px" }}
                              >
                                <FontAwesomeIcon icon={faGift} />
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
                          <div className="d-flex flex-column gap-1">
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
                              <div>
                                <small className="text-muted">Retrait:</small>
                                <div className="fw-semibold">
                                  {don.lieu_retrait}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <StatusBadge
                            statut={don.statut}
                            estPublie={don.estPublie}
                          />
                          {don.est_public === 1 && (
                            <div className="mt-1">
                              <small className="text-success">
                                <FontAwesomeIcon
                                  icon={faUser}
                                  className="me-1"
                                />
                                Public
                              </small>
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
                              className="btn btn-outline-warning"
                              title="Modifier"
                              onClick={() => {
                                setSelectedDon(don);
                                setShowEditModal(true);
                              }}
                              disabled={loading}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            {!don.estPublie && (
                              <button
                                className="btn btn-outline-success"
                                title="Publier"
                                onClick={() => handlePublish(don)}
                                disabled={loading}
                              >
                                <FontAwesomeIcon icon={faShare} />
                              </button>
                            )}
                            <button
                              className="btn btn-outline-danger"
                              title="Supprimer"
                              onClick={() => openDeleteModal(don)}
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

        {/* Barre d'actions groupées flottante */}
        {selectedDons.size > 0 && (
          <div className="position-fixed bottom-0 start-50 translate-middle-x mb-4">
            <div className="bg-white border rounded-4 shadow-lg p-3">
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center gap-2">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center p-2">
                    <FontAwesomeIcon
                      icon={faCheckSquare}
                      className="text-primary"
                    />
                  </div>
                  <div>
                    <div className="fw-bold text-primary">
                      {selectedDons.size} don(s) sélectionné(s)
                    </div>
                    <small className="text-muted">
                      Cliquez sur une action pour l'appliquer
                    </small>
                  </div>
                </div>

                <div className="vr"></div>

                <div className="d-flex flex-wrap gap-2">
                  {bulkActions.map((action) => (
                    <button
                      key={action.type}
                      className="btn btn-sm d-flex align-items-center gap-2"
                      style={{
                        backgroundColor: `${action.color}10`,
                        color: action.color,
                        border: `1px solid ${action.color}30`,
                      }}
                      onClick={() => handleBulkActionSelect(action.type)}
                      disabled={bulkActionLoading}
                    >
                      <FontAwesomeIcon icon={action.icon} />
                      <span className="d-none d-md-inline">{action.label}</span>
                    </button>
                  ))}
                </div>

                <button
                  className="btn btn-sm btn-outline-danger d-flex align-items-center gap-2"
                  onClick={resetSelection}
                  disabled={bulkActionLoading}
                >
                  <FontAwesomeIcon icon={faTimes} />
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
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
          background-color: rgba(74, 144, 226, 0.05) !important;
        }
        .form-check-input:checked {
          background-color: #4a90e2;
          border-color: #4a90e2;
        }
        .form-check-input:focus {
          border-color: #6aa9ff;
          box-shadow: 0 0 0 0.25rem rgba(74, 144, 226, 0.25);
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

        /* Styles pour la sélection */
        .table tr.selected {
          background-color: rgba(74, 144, 226, 0.1) !important;
        }

        .table tr.selected:hover {
          background-color: rgba(74, 144, 226, 0.15) !important;
        }

        /* Animation pour la barre d'actions flottante */
        @keyframes slideInUp {
          from {
            transform: translate(-50%, 100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }

        .position-fixed.bottom-0 {
          animation: slideInUp 0.3s ease-out;
          z-index: 1050;
        }

        /* Style pour les boutons d'actions groupées */
        .btn-sm {
          padding: 0.375rem 0.75rem;
          font-size: 0.8125rem;
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

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .position-fixed.bottom-0 {
            width: 95%;
            transform: translateX(-50%);
          }

          .position-fixed.bottom-0 .d-flex {
            flex-wrap: wrap;
            justify-content: center;
            gap: 1rem;
          }

          .position-fixed.bottom-0 .vr {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
