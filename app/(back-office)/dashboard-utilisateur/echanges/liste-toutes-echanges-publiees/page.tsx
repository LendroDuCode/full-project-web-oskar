"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExchangeAlt,
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
  faCheckSquare,
  faSquare,
  faEllipsisV,
  faCopy,
  faCheckDouble,
  faLayerGroup,
  faTasks,
  faCogs,
  faMoneyBillWave,
  faSync,
  faHourglassHalf,
  faExclamationTriangle,
  faCheckDouble as faCheckDoubleSolid,
  faImages,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";
import CreateEchangeModal from "../components/modals/CreateEchangeModal";
import EditEchangeModal from "../components/modals/EditEchangeModal";
import ViewEchangeModal from "../components/modals/ViewEchangeModal";

// Types basés sur la réponse API
interface Echange {
  uuid: string;
  titre: string;
  description: string;
  createdAt: string | null;
  statut: string;
  image: string;
  prix: string;
  numero: string;
  type_echange?: string;
  categorie?: string;
  localisation?: string;
  objet_propose?: string;
  objet_demande?: string;
  quantite?: number;
  estPublie?: boolean;
  date_debut?: string;
  date_fin?: string | null;
  est_bloque?: boolean | null;
  vendeur?: string;
  utilisateur?: string;
  agent?: string;
}

interface ApiResponse {
  status: string;
  data: Echange[];
}

// Types pour les actions groupées
type BulkActionType =
  | "publish"
  | "unpublish"
  | "delete"
  | "duplicate"
  | "export"
  | "accept"
  | "refuse";

interface BulkAction {
  type: BulkActionType;
  label: string;
  icon: any;
  color: string;
  description: string;
  availableForStatus?: string[];
}

// Composant de badge de statut
const StatusBadge = ({ statut }: { statut: string }) => {
  const getStatusInfo = () => {
    const lowerStatut = statut.toLowerCase();

    switch (lowerStatut) {
      case "disponible":
        return {
          icon: faCheckCircle,
          color: colors.oskar.green,
          label: "Disponible",
          bgColor: `${colors.oskar.green}15`,
          borderColor: `${colors.oskar.green}30`,
        };
      case "en_attente":
        return {
          icon: faHourglassHalf,
          color: colors.oskar.orange,
          label: "En attente",
          bgColor: `${colors.oskar.orange}15`,
          borderColor: `${colors.oskar.orange}30`,
        };
      case "indisponible":
        return {
          icon: faTimesCircle,
          color: colors.oskar.red,
          label: "Indisponible",
          bgColor: `${colors.oskar.red}15`,
          borderColor: `${colors.oskar.red}30`,
        };
      case "accepte":
        return {
          icon: faCheckDoubleSolid,
          color: colors.oskar.green,
          label: "Accepté",
          bgColor: `${colors.oskar.green}15`,
          borderColor: `${colors.oskar.green}30`,
        };
      case "refuse":
        return {
          icon: faBan,
          color: colors.oskar.red,
          label: "Refusé",
          bgColor: `${colors.oskar.red}15`,
          borderColor: `${colors.oskar.red}30`,
        };
      default:
        return {
          icon: faInfoCircle,
          color: colors.oskar.blue,
          label: statut,
          bgColor: `${colors.oskar.blue}15`,
          borderColor: `${colors.oskar.blue}30`,
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <span
      className="badge d-inline-flex align-items-center gap-2"
      style={{
        backgroundColor: statusInfo.bgColor,
        color: statusInfo.color,
        border: `1px solid ${statusInfo.borderColor}`,
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
  echange,
  loading,
  onClose,
  onConfirm,
}: {
  show: boolean;
  echange: Echange | null;
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
            {echange && (
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
              Actions groupées ({selectedCount} échanges sélectionnés)
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
              {selectedCount} échange(s) sélectionné(s).
            </div>

            <div className="row g-3">
              {actions.map((action) => (
                <div key={action.type} className="col-md-6">
                  <button
                    className="btn btn-outline-light w-100 h-100 text-start p-3 border-0"
                    style={{
                      backgroundColor: `${action.color}10`,
                      borderLeft: `4px solid ${action.color} !important`,
                      minHeight: "100px",
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
        return `publier ${selectedCount} échange(s)`;
      case "unpublish":
        return `dépublier ${selectedCount} échange(s)`;
      case "delete":
        return `supprimer définitivement ${selectedCount} échange(s)`;
      case "duplicate":
        return `dupliquer ${selectedCount} échange(s)`;
      case "export":
        return `exporter ${selectedCount} échange(s)`;
      case "accept":
        return `accepter ${selectedCount} échange(s)`;
      case "refuse":
        return `refuser ${selectedCount} échange(s)`;
      default:
        return `effectuer cette action sur ${selectedCount} échange(s)`;
    }
  };

  const getActionColor = () => {
    switch (action.type) {
      case "delete":
      case "refuse":
        return "danger";
      case "publish":
      case "accept":
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
                  Toutes les données associées à ces échanges seront perdues
                  définitivement.
                </small>
              </div>
            )}
            {action.type === "duplicate" && (
              <div className="text-info">
                <small>
                  <strong>Note :</strong> Les échanges dupliqués auront
                  "(Copie)" ajouté à leur titre.
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
                  Confirmer ({selectedCount} échanges)
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

export default function ListeEchangePubliees() {
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

  // États pour les actions
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // États pour la sélection multiple
  const [selectedEchanges, setSelectedEchanges] = useState<Set<string>>(
    new Set(),
  );
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
      type: "accept",
      label: "Accepter",
      icon: faCheckCircle,
      color: colors.oskar.green,
      description: "Accepter les échanges sélectionnés",
      availableForStatus: ["en_attente"],
    },
    {
      type: "refuse",
      label: "Refuser",
      icon: faTimesCircle,
      color: colors.oskar.red,
      description: "Refuser les échanges sélectionnés",
      availableForStatus: ["en_attente"],
    },
    {
      type: "publish",
      label: "Publier",
      icon: faShare,
      color: colors.oskar.blue,
      description: "Rendre visible publiquement les échanges sélectionnés",
    },
    {
      type: "unpublish",
      label: "Dépublier",
      icon: faBan,
      color: colors.oskar.orange,
      description: "Retirer de la publication les échanges sélectionnés",
    },
    {
      type: "duplicate",
      label: "Dupliquer",
      icon: faCopy,
      color: colors.oskar.purple,
      description: "Créer des copies des échanges sélectionnés",
    },
    {
      type: "export",
      label: "Exporter",
      icon: faDownload,
      color: colors.oskar.cyan,
      description: "Télécharger les données des échanges sélectionnés",
    },
    {
      type: "delete",
      label: "Supprimer",
      icon: faTrash,
      color: colors.oskar.red,
      description: "Supprimer définitivement les échanges sélectionnés",
    },
  ];

  // Charger les échanges publiés
  const fetchEchangesPubliees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setInfoMessage(null);
      setSuccessMessage(null);

      console.log("📡 Chargement des échanges publiés...");

      const response = await api.get<Echange[]>(
        API_ENDPOINTS.ECHANGES.PUBLISHED,
      );

      console.log("✅ Réponse API reçue:", response);

      if (Array.isArray(response)) {
        setEchanges(response);
        setPagination((prev) => ({
          ...prev,
          total: response.length,
          pages: Math.ceil(response.length / prev.limit),
        }));
      } else {
        throw new Error("Format de réponse API invalide");
      }
    } catch (err: any) {
      console.error("❌ Erreur lors du chargement des échanges:", err);

      let errorMessage = "Erreur lors du chargement des échanges publiés.";

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
      setEchanges([]);
      setPagination((prev) => ({ ...prev, total: 0, pages: 1 }));
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les échanges au montage
  useEffect(() => {
    fetchEchangesPubliees();
  }, [fetchEchangesPubliees]);

  // Réinitialiser la sélection quand les données changent
  useEffect(() => {
    resetSelection();
  }, [echanges, pagination.page]);

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

  // Filtrage des données
  const filteredEchanges = useMemo(() => {
    return echanges.filter((echange) => {
      const matchesSearch =
        !searchTerm.trim() ||
        echange.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        echange.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        echange.objet_propose
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        echange.objet_demande
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        echange.numero?.includes(searchTerm);

      const matchesStatus =
        selectedStatus === "all" ||
        echange.statut?.toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [echanges, searchTerm, selectedStatus]);

  // Tri des données filtrées
  const sortedEchanges = useMemo(() => {
    if (!sortConfig) return filteredEchanges;

    return [...filteredEchanges].sort((a, b) => {
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
  }, [filteredEchanges, sortConfig]);

  // Gestion succès
  const handleSuccess = (message: string) => {
    setSuccessMessage(message);
    fetchEchangesPubliees();
    resetSelection();
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

  // Ouvrir modal de suppression
  const openDeleteModal = (echange: Echange) => {
    setSelectedEchange(echange);
    setShowDeleteModal(true);
  };

  // Accepter un échange
  const handleAccept = async (echange: Echange) => {
    try {
      await api.post(API_ENDPOINTS.ECHANGES.ACCEPT(echange.uuid));

      handleSuccess("Échange accepté avec succès !");
    } catch (err: any) {
      console.error("❌ Erreur acceptation:", err);
      setError(err.response?.data?.message || "Erreur lors de l'acceptation");
      setTimeout(() => setError(null), 3000);
    }
  };

  // Refuser un échange
  const handleRefuse = async (echange: Echange) => {
    try {
      await api.post(API_ENDPOINTS.ECHANGES.REFUSE(echange.uuid));

      handleSuccess("Échange refusé avec succès !");
    } catch (err: any) {
      console.error("❌ Erreur refus:", err);
      setError(err.response?.data?.message || "Erreur lors du refus");
      setTimeout(() => setError(null), 3000);
    }
  };

  // Publier un échange
  const handlePublish = async (echange: Echange) => {
    try {
      await api.post(API_ENDPOINTS.ECHANGES.PUBLISH, {
        uuid: echange.uuid,
      });

      handleSuccess("Échange publié avec succès !");
    } catch (err: any) {
      console.error("❌ Erreur publication:", err);
      setError(err.response?.data?.message || "Erreur lors de la publication");
      setTimeout(() => setError(null), 3000);
    }
  };

  // Gestion de la sélection multiple
  const toggleEchangeSelection = (echangeId: string) => {
    const newSelected = new Set(selectedEchanges);
    if (newSelected.has(echangeId)) {
      newSelected.delete(echangeId);
    } else {
      newSelected.add(echangeId);
    }
    setSelectedEchanges(newSelected);
    setSelectAll(newSelected.size === currentItems.length);
  };

  const toggleSelectAll = () => {
    if (selectAll || selectedEchanges.size === currentItems.length) {
      resetSelection();
    } else {
      const allIds = new Set(currentItems.map((echange) => echange.uuid));
      setSelectedEchanges(allIds);
      setSelectAll(true);
    }
  };

  const isEchangeSelected = (echangeId: string) => {
    return selectedEchanges.has(echangeId);
  };

  const getSelectedCount = () => {
    return selectedEchanges.size;
  };

  const resetSelection = () => {
    setSelectedEchanges(new Set());
    setSelectAll(false);
  };

  const getSelectedEchanges = () => {
    return echanges.filter((echange) => selectedEchanges.has(echange.uuid));
  };

  // Filtrer les actions disponibles selon l'état des échanges sélectionnés
  const getAvailableActions = useMemo(() => {
    const selectedEchangesList = getSelectedEchanges();

    return bulkActions.filter((action) => {
      // Vérifier si l'action est disponible pour le statut des échanges sélectionnés
      if (action.availableForStatus && selectedEchangesList.length > 0) {
        const allMatchStatus = selectedEchangesList.every((echange) =>
          action.availableForStatus!.includes(echange.statut.toLowerCase()),
        );
        if (!allMatchStatus) return false;
      }

      return true;
    });
  }, [selectedEchanges, echanges]);

  // Gestion des actions groupées
  const openBulkActionsModal = () => {
    if (selectedEchanges.size > 0) {
      setShowBulkActionsModal(true);
    }
  };

  const handleBulkActionSelect = (actionType: BulkActionType) => {
    setSelectedBulkAction(actionType);
    setShowBulkActionsModal(false);
    setShowConfirmBulkActionModal(true);
  };

  const executeBulkAction = async () => {
    if (!selectedBulkAction || selectedEchanges.size === 0) return;

    try {
      setBulkActionLoading(true);

      const selectedEchangesList = getSelectedEchanges();
      const actionPromises = [];

      switch (selectedBulkAction) {
        case "accept":
          for (const echange of selectedEchangesList) {
            actionPromises.push(
              api.post(API_ENDPOINTS.ECHANGES.ACCEPT(echange.uuid)),
            );
          }
          break;

        case "refuse":
          for (const echange of selectedEchangesList) {
            actionPromises.push(
              api.post(API_ENDPOINTS.ECHANGES.REFUSE(echange.uuid)),
            );
          }
          break;

        case "publish":
          for (const echange of selectedEchangesList) {
            actionPromises.push(
              api.post(API_ENDPOINTS.ECHANGES.PUBLISH, { uuid: echange.uuid }),
            );
          }
          break;

        case "unpublish":
          // Pour dépublier, nous pouvons utiliser l'endpoint UPDATE avec estPublie: false
          for (const echange of selectedEchangesList) {
            actionPromises.push(
              api.put(API_ENDPOINTS.ECHANGES.UPDATE(echange.uuid), {
                ...echange,
                estPublie: false,
              }),
            );
          }
          break;

        case "delete":
          for (const echange of selectedEchangesList) {
            actionPromises.push(
              api.delete(API_ENDPOINTS.ECHANGES.DELETE(echange.uuid)),
            );
          }
          break;

        case "duplicate":
          for (const echange of selectedEchangesList) {
            const duplicatedEchange = {
              titre: `${echange.titre} (Copie)`,
              description: echange.description,
              statut: "en_attente",
              image: echange.image,
              prix: echange.prix,
              numero: echange.numero,
              type_echange: echange.type_echange,
              categorie: echange.categorie,
              localisation: echange.localisation,
              objet_propose: echange.objet_propose,
              objet_demande: echange.objet_demande,
              quantite: echange.quantite,
              estPublie: false, // Par défaut, la copie n'est pas publiée
            };
            actionPromises.push(
              api.post(API_ENDPOINTS.ECHANGES.CREATE, duplicatedEchange),
            );
          }
          break;

        case "export":
          // Logique d'export (création d'un fichier CSV par exemple)
          exportSelectedEchanges(selectedEchangesList);
          break;
      }

      if (selectedBulkAction !== "export") {
        const results = await Promise.allSettled(actionPromises);
        const successfulResults = results.filter(
          (result) => result.status === "fulfilled",
        ).length;
        const failedResults = results.filter(
          (result) => result.status === "rejected",
        ).length;

        const actionMessages = {
          accept: "accepté(s)",
          refuse: "refusé(s)",
          publish: "publié(s)",
          unpublish: "dépublié(s)",
          delete: "supprimé(s)",
          duplicate: "dupliqué(s)",
          export: "exporté(s)",
        };

        if (successfulResults > 0) {
          handleSuccess(
            `${successfulResults} échange(s) ${actionMessages[selectedBulkAction]} avec succès !`,
          );
        }

        if (failedResults > 0) {
          setError(
            `${failedResults} action(s) ont échoué. Veuillez réessayer.`,
          );
          setTimeout(() => setError(null), 3000);
        }
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

  const exportSelectedEchanges = (echangesList: Echange[]) => {
    try {
      // Créer un fichier CSV avec les échanges sélectionnés
      const headers = [
        "UUID",
        "Titre",
        "Description",
        "Statut",
        "Prix",
        "Numéro",
        "Objet proposé",
        "Objet demandé",
        "Quantité",
        "Date création",
      ];

      const csvData = echangesList.map((echange) => [
        echange.uuid,
        echange.titre,
        echange.description?.replace(/,/g, ";") || "",
        echange.statut,
        echange.prix || "0",
        echange.numero || "",
        echange.objet_propose || "",
        echange.objet_demande || "",
        echange.quantite || "1",
        formatDate(echange.createdAt),
      ]);

      const csvContent = [
        headers.join(","),
        ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `echanges_export_${new Date().toISOString().split("T")[0]}_${echangesList.length}_elements.csv`,
      );
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Pas besoin d'appeler handleSuccess ici car c'est une action locale
      setSuccessMessage(
        `${echangesList.length} échange(s) exporté(s) avec succès !`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("❌ Erreur lors de l'export:", err);
      setError("Erreur lors de l'export des données");
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
            hour: "2-digit",
            minute: "2-digit",
          });
    } catch {
      return "N/A";
    }
  };

  const formatPrice = (price?: string) => {
    if (!price) return "Gratuit";
    const num = parseFloat(price);
    if (isNaN(num)) return price;
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
    }).format(num);
  };

  // Pagination
  const currentItems = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    return sortedEchanges.slice(startIndex, startIndex + pagination.limit);
  }, [sortedEchanges, pagination.page, pagination.limit]);

  // Mettre à jour la pagination quand les données filtrées changent
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
  };

  // Statistiques
  const stats = useMemo(
    () => ({
      total: echanges.length,
      en_attente: echanges.filter(
        (e) => e.statut?.toLowerCase() === "en_attente",
      ).length,
      disponible: echanges.filter(
        (e) => e.statut?.toLowerCase() === "disponible",
      ).length,
      accepte: echanges.filter((e) => e.statut?.toLowerCase() === "accepte")
        .length,
      refuse: echanges.filter((e) => e.statut?.toLowerCase() === "refuse")
        .length,
    }),
    [echanges],
  );

  return (
    <>
      {/* Modals */}
      <CreateEchangeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => handleSuccess("Échange créé avec succès !")}
      />
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
      <DeleteModal
        show={showDeleteModal}
        echange={selectedEchange}
        loading={deleteLoading}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedEchange(null);
        }}
        onConfirm={handleDelete}
      />

      {/* Modals pour actions groupées */}
      <BulkActionsModal
        show={showBulkActionsModal}
        selectedCount={getSelectedCount()}
        actions={getAvailableActions}
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
                <p className="text-muted mb-1">Échanges</p>
                <div className="d-flex align-items-center gap-3">
                  <h2 className="h4 mb-0 fw-bold">Échanges Publiés</h2>
                  <span className="badge bg-warning bg-opacity-10 text-warning">
                    {stats.total} échange(s) total
                  </span>

                  {/* Indicateur de sélection */}
                  {selectedEchanges.size > 0 && (
                    <span className="badge bg-primary bg-opacity-10 text-primary">
                      <FontAwesomeIcon icon={faCheckSquare} className="me-1" />
                      {selectedEchanges.size} sélectionné(s)
                    </span>
                  )}
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2">
                {/* Bouton actions groupées */}
                {selectedEchanges.size > 0 ? (
                  <button
                    onClick={openBulkActionsModal}
                    className="btn btn-primary d-flex align-items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faTasks} />
                    Actions ({selectedEchanges.size})
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
                  onClick={() => fetchEchangesPubliees()}
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
                    placeholder="Rechercher par titre, description, objet, numéro..."
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
                    <option value="en_attente">En attente</option>
                    <option value="disponible">Disponible</option>
                    <option value="accepte">Accepté</option>
                    <option value="refuse">Refusé</option>
                    <option value="indisponible">Indisponible</option>
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
                  </small>

                  {/* Indicateur de sélection multiple */}
                  {selectedEchanges.size > 0 && (
                    <>
                      <div className="vr"></div>
                      <div className="d-flex align-items-center gap-2">
                        <small className="text-primary fw-semibold">
                          <FontAwesomeIcon
                            icon={faCheckSquare}
                            className="me-1"
                          />
                          {selectedEchanges.size} sélectionné(s)
                        </small>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="col-md-4 text-end">
                <div className="d-flex align-items-center gap-2 justify-content-end">
                  {selectedEchanges.size > 0 && (
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
                    icon={faExchangeAlt}
                    className="fs-1 mb-3 text-info"
                  />
                  <h5 className="alert-heading">
                    {echanges.length === 0
                      ? "Aucun échange publié"
                      : "Aucun résultat"}
                  </h5>
                  <p className="mb-0 text-center">
                    {echanges.length === 0
                      ? "Il n'y a pas encore d'échanges publiés."
                      : "Aucun échange ne correspond à vos critères de recherche."}
                  </p>
                  {echanges.length === 0 ? (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="btn btn-warning text-white mt-3"
                    >
                      <FontAwesomeIcon icon={faPlus} className="me-2" />
                      Créer un échange
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
                              selectedEchanges.size === currentItems.length
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
                          onClick={() => requestSort("titre")}
                        >
                          <FontAwesomeIcon icon={faTag} className="me-1" />
                          Titre
                          {getSortIcon("titre")}
                        </button>
                      </th>
                      <th style={{ width: "150px" }}>
                        <span className="fw-semibold">Objets</span>
                      </th>
                      <th style={{ width: "120px" }}>
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
                        <span className="fw-semibold">Statut</span>
                      </th>

                      <th style={{ width: "180px" }} className="text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((echange, index) => (
                      <tr
                        key={echange.uuid}
                        className={`align-middle ${isEchangeSelected(echange.uuid) ? "selected" : ""}`}
                      >
                        <td className="text-center">
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={isEchangeSelected(echange.uuid)}
                              onChange={() =>
                                toggleEchangeSelection(echange.uuid)
                              }
                              disabled={loading}
                            />
                          </div>
                        </td>
                        <td className="text-center text-muted fw-semibold">
                          {(pagination.page - 1) * pagination.limit + index + 1}
                        </td>
                        <td className="text-center">
                          {echange.image ? (
                            <div
                              className="position-relative mx-auto"
                              style={{ width: "60px", height: "60px" }}
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
                                    `https://via.placeholder.com/60/4A90E2/FFFFFF?text=${echange.titre?.charAt(0) || "E"}`;
                                }}
                              />
                            </div>
                          ) : (
                            <div
                              className="bg-primary bg-opacity-10 rounded d-flex align-items-center justify-content-center mx-auto"
                              style={{ width: "60px", height: "60px" }}
                            >
                              <FontAwesomeIcon
                                icon={faExchangeAlt}
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
                                  {echange.description.length > 50
                                    ? `${echange.description.substring(0, 50)}...`
                                    : echange.description}
                                </small>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex flex-column gap-1">
                            <div>
                              <small className="text-muted">Proposé:</small>
                              <div className="fw-semibold">
                                {echange.objet_propose || echange.titre}
                              </div>
                            </div>
                            <div>
                              <small className="text-muted">Recherché:</small>
                              <div className="fw-semibold">
                                {echange.objet_demande || "Non spécifié"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex flex-column gap-1">
                            <div className="fw-bold text-dark">
                              {formatPrice(echange.prix)}
                            </div>
                            {echange.numero && (
                              <div className="d-flex align-items-center gap-1">
                                <FontAwesomeIcon
                                  icon={faPhone}
                                  className="text-muted"
                                  style={{ fontSize: "0.75rem" }}
                                />
                                <small className="text-muted">
                                  {echange.numero}
                                </small>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <StatusBadge statut={echange.statut} />
                          {echange.quantite && echange.quantite > 1 && (
                            <div className="mt-1">
                              <small className="text-muted">
                                Quantité: {echange.quantite}
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
                            {echange.statut === "en_attente" && (
                              <>
                                <button
                                  className="btn btn-outline-success"
                                  title="Accepter"
                                  onClick={() => handleAccept(echange)}
                                  disabled={loading}
                                >
                                  <FontAwesomeIcon icon={faCheckCircle} />
                                </button>
                                <button
                                  className="btn btn-outline-danger"
                                  title="Refuser"
                                  onClick={() => handleRefuse(echange)}
                                  disabled={loading}
                                >
                                  <FontAwesomeIcon icon={faTimesCircle} />
                                </button>
                              </>
                            )}
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

        {/* Barre d'actions groupées flottante */}
        {selectedEchanges.size > 0 && (
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
                      {selectedEchanges.size} échange(s) sélectionné(s)
                    </div>
                    <small className="text-muted">
                      Cliquez sur une action pour l'appliquer
                    </small>
                  </div>
                </div>

                <div className="vr"></div>

                <div className="d-flex flex-wrap gap-2">
                  {getAvailableActions.slice(0, 4).map((action) => (
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

                  {getAvailableActions.length > 4 && (
                    <button
                      className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2"
                      onClick={openBulkActionsModal}
                      disabled={bulkActionLoading}
                    >
                      <FontAwesomeIcon icon={faEllipsisV} />
                      Plus
                    </button>
                  )}
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
