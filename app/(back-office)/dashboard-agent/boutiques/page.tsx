// app/(back-office)/dashboard-agent/boutiques/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  faStore,
  faImage,
  faCalendar,
  faCheckCircle,
  faTimesCircle,
  faChartBar,
  faUsers,
  faShoppingBag,
  faTags,
  faSlidersH,
  faCheckSquare,
  faSquare,
  faCheck,
  faTimes,
  faBan,
  faEllipsisV,
  faCheckDouble,
  faLock,
  faLockOpen,
  faDoorClosed,
  faDoorOpen,
  faExternalLinkAlt,
  faStar,
  faStarHalfAlt,
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faClock,
  faInfoCircle,
  faExclamationTriangle,
  faExpand,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";
import { buildImageUrl } from "@/app/shared/utils/image-utils";

// Types
interface TypeBoutique {
  id: number;
  uuid: string;
  code: string;
  libelle: string;
  description?: string;
  image: string;
  image_key: string;
  peut_vendre_produits: boolean;
  peut_vendre_biens: boolean;
  statut: string;
  is_deleted: boolean;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface Boutique {
  id: number;
  uuid: string;
  type_boutique_uuid: string;
  nom: string;
  slug: string;
  description?: string;
  logo?: string | null;
  banniere?: string | null;
  politique_retour?: string | null;
  conditions_utilisation?: string | null;
  statut: "en_review" | "actif" | "inactif" | "bloque" | "ferme";
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_at?: string | null;
  type_boutique: TypeBoutique;
  vendeurUuid: string;
  agentUuid?: string | null;
  est_bloque: boolean;
  est_ferme: boolean;
}

interface ApiResponse {
  data: Boutique[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Composant Image avec effet de survol
const BoutiqueImage = ({
  src,
  alt,
  type = "logo",
  onView,
}: {
  src: string | null;
  alt: string;
  type?: "logo" | "banniere" | "type";
  onView?: () => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    if (src) {
      setImageSrc(buildImageUrl(src));
      setImageError(false);
    } else {
      setImageSrc(null);
    }
  }, [src]);

  const handleImageError = () => {
    setImageError(true);
  };

  if (!src || imageError) {
    return (
      <div
        className={`bg-secondary bg-opacity-10 rounded d-flex flex-column align-items-center justify-content-center ${type === "logo" ? "logo-placeholder" : "banniere-placeholder"}`}
        style={{
          width:
            type === "logo" ? "50px" : type === "banniere" ? "100px" : "40px",
          height:
            type === "logo" ? "50px" : type === "banniere" ? "60px" : "40px",
          position: "relative",
        }}
      >
        <FontAwesomeIcon
          icon={faImage}
          className="text-muted"
          style={{ fontSize: type === "logo" ? "1rem" : "1.2rem" }}
        />
        <small className="text-muted mt-1" style={{ fontSize: "0.6rem" }}>
          {type === "logo" ? "Logo" : type === "banniere" ? "Bannière" : "Type"}
        </small>
      </div>
    );
  }

  return (
    <div
      className="position-relative"
      style={{
        width:
          type === "logo" ? "50px" : type === "banniere" ? "100px" : "40px",
        height:
          type === "logo" ? "50px" : type === "banniere" ? "60px" : "40px",
        cursor: "pointer",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onView}
      title={`Cliquer pour agrandir ${type === "logo" ? "le logo" : type === "banniere" ? "la bannière" : "l'image"}`}
    >
      <img
        src={imageSrc || ''}
        alt={alt}
        className="img-fluid rounded border"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transition: "transform 0.3s ease",
          transform: isHovered ? "scale(1.05)" : "scale(1)",
        }}
        onError={handleImageError}
      />

      {isHovered && (
        <div
          className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            borderRadius: "4px",
            transition: "opacity 0.3s ease",
          }}
        >
          <FontAwesomeIcon
            icon={faExpand}
            className="text-white"
            style={{ fontSize: "0.8rem" }}
          />
        </div>
      )}
    </div>
  );
};

// Composant de badge de statut
const StatusBadge = ({ statut }: { statut: Boutique["statut"] }) => {
  const getStatusInfo = (statut: Boutique["statut"]) => {
    switch (statut) {
      case "actif":
        return {
          icon: faCheckCircle,
          color: colors.oskar.green,
          label: "Active",
          bgColor: `${colors.oskar.green}15`,
        };
      case "en_review":
        return {
          icon: faClock,
          color: colors.oskar.orange,
          label: "En attente",
          bgColor: `${colors.oskar.orange}15`,
        };
      case "inactif":
        return {
          icon: faTimesCircle,
          color: colors.oskar.gray,
          label: "Inactive",
          bgColor: `${colors.oskar.gray}15`,
        };
      case "bloque":
        return {
          icon: faLock,
          color: colors.oskar.red,
          label: "Bloquée",
          bgColor: `${colors.oskar.red}15`,
        };
      case "ferme":
        return {
          icon: faDoorClosed,
          color: colors.oskar.purple,
          label: "Fermée",
          bgColor: `${colors.oskar.purple}15`,
        };
      default:
        return {
          icon: faTimesCircle,
          color: colors.oskar.gray,
          label: statut,
          bgColor: `${colors.oskar.gray}15`,
        };
    }
  };

  const statusInfo = getStatusInfo(statut);

  return (
    <span
      className="badge d-inline-flex align-items-center gap-2"
      style={{
        backgroundColor: statusInfo.bgColor,
        color: statusInfo.color,
        border: `1px solid ${statusInfo.color}30`,
        padding: "0.4rem 0.75rem",
        fontSize: "0.75rem",
      }}
    >
      <FontAwesomeIcon icon={statusInfo.icon} className="fs-12" />
      <span>{statusInfo.label}</span>
    </span>
  );
};

// Composant de badge de type de boutique avec image
const TypeBoutiqueBadge = ({
  typeBoutique,
}: {
  typeBoutique: TypeBoutique;
}) => {
  const handleViewTypeImage = () => {
    if (typeBoutique.image) {
      const imageUrl = buildImageUrl(typeBoutique.image);
      window.open(imageUrl, "_blank");
    }
  };

  return (
    <div className="d-flex align-items-center gap-2">
      <BoutiqueImage
        src={typeBoutique.image}
        alt={typeBoutique.libelle}
        type="type"
        onView={handleViewTypeImage}
      />
      <span
        className="badge d-inline-flex align-items-center gap-2"
        style={{
          backgroundColor: `${colors.oskar.blue}15`,
          color: colors.oskar.blue,
          border: `1px solid ${colors.oskar.blue}30`,
          padding: "0.4rem 0.75rem",
          fontSize: "0.75rem",
        }}
      >
        <span>{typeBoutique.libelle}</span>
      </span>
    </div>
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
  boutique,
  loading,
  onClose,
  onConfirm,
  type = "single",
  count = 0,
}: {
  show: boolean;
  boutique: Boutique | null;
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
            {type === "single" && boutique ? (
              <>
                <p className="mb-3">
                  Êtes-vous sûr de vouloir supprimer la boutique{" "}
                  <strong>{boutique.nom}</strong> ?
                </p>
                <div className="text-danger">
                  <small>
                    Tous les produits, commandes et données associées à cette
                    boutique seront également supprimés.
                  </small>
                </div>
              </>
            ) : (
              <>
                <p className="mb-3">
                  Êtes-vous sûr de vouloir supprimer{" "}
                  <strong>{count} boutique(s)</strong> ?
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
                    ? `Supprimer ${count} boutique(s)`
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
          <span className="fw-semibold">{totalItems}</span> boutiques
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

// Modal pour afficher l'image en grand
const ImageModal = ({
  show,
  imageUrl,
  alt,
  onClose,
}: {
  show: boolean;
  imageUrl: string;
  alt: string;
  onClose: () => void;
}) => {
  const [imageSrc, setImageSrc] = useState<string>(imageUrl);

  useEffect(() => {
    if (imageUrl) {
      setImageSrc(buildImageUrl(imageUrl));
    }
  }, [imageUrl]);

  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
      tabIndex={-1}
      onClick={onClose}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 bg-transparent">
          <div className="modal-header border-0">
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body text-center p-0">
            <img
              src={imageSrc}
              alt={alt}
              className="img-fluid rounded"
              style={{ maxHeight: "80vh", maxWidth: "100%" }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://via.placeholder.com/800x600/cccccc/ffffff?text=Image+non+disponible";
              }}
            />
            <div className="mt-2 text-white">
              <small>{alt}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function BoutiquesPage() {
  const router = useRouter();

  // États
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // États pour les modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteMultipleModal, setShowDeleteMultipleModal] = useState(false);
  const [selectedBoutique, setSelectedBoutique] = useState<Boutique | null>(
    null,
  );

  // États pour l'affichage des images
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    alt: string;
  } | null>(null);

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Boutique;
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
  const [selectedBoutiques, setSelectedBoutiques] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // États pour les actions de suppression
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Types de boutiques uniques
  const [uniqueTypes, setUniqueTypes] = useState<TypeBoutique[]>([]);

  // Options pour les éléments par page
  const itemsPerPageOptions = [5, 10, 20, 50];

  // Charger les boutiques depuis l'API
  const fetchBoutiques = useCallback(
    async (params?: Record<string, any>) => {
      try {
        setLoading(true);
        setError(null);
        setInfoMessage(null);
        setSuccessMessage(null);

        console.log("📡 Chargement des boutiques depuis l'API...");

        // Construire les paramètres de requête
        const queryParams: Record<string, any> = {
          page: pagination.page,
          limit: pagination.limit,
          ...params,
        };

        // Nettoyer les paramètres vides
        Object.keys(queryParams).forEach((key) => {
          if (
            queryParams[key] === undefined ||
            queryParams[key] === null ||
            queryParams[key] === ""
          ) {
            delete queryParams[key];
          }
        });

        console.log("Paramètres de requête:", queryParams);

        // Appel à l'API réelle
        const response = await api.get<ApiResponse>(
          API_ENDPOINTS.BOUTIQUES.ALL,
          {
          },
        );

        console.log("Réponse API:", response.data);

        // CORRECTION : Définir une variable pour les données de réponse
        const responseData = response.data;
        let boutiquesData: Boutique[] = [];

        if (responseData && Array.isArray(responseData)) {
          // Si la réponse est un tableau simple
          boutiquesData = responseData as Boutique[];
          setBoutiques(boutiquesData);
          setPagination({
            page: 1,
            limit: pagination.limit,
            total: boutiquesData.length,
            pages: Math.ceil(boutiquesData.length / pagination.limit),
          });
        } else if (responseData && "data" in responseData) {
          // Si la réponse a une structure { data: [], meta: {} }
          const apiResponse = responseData as ApiResponse;
          boutiquesData = apiResponse.data || [];
          setBoutiques(boutiquesData);

          if (apiResponse.meta) {
            setPagination({
              page: apiResponse.meta.page || 1,
              limit: apiResponse.meta.limit || pagination.limit,
              total: apiResponse.meta.total || boutiquesData.length,
              pages:
                apiResponse.meta.totalPages ||
                Math.ceil(boutiquesData.length / pagination.limit),
            });
          } else {
            setPagination({
              page: 1,
              limit: pagination.limit,
              total: boutiquesData.length,
              pages: Math.ceil(boutiquesData.length / pagination.limit),
            });
          }
        } else {
          console.error("Format de réponse API inattendu:", responseData);
          setBoutiques([]);
          setPagination({
            page: 1,
            limit: pagination.limit,
            total: 0,
            pages: 1,
          });
        }

        // CORRECTION : Extraire les types de boutiques uniques
        const typesMap = new Map<string, TypeBoutique>();
        
        // Déterminer toutes les boutiques à traiter
        let allBoutiques: Boutique[] = [];
        
        if (Array.isArray(responseData)) {
          // Si la réponse est directement un tableau
          allBoutiques = responseData;
        } else if (responseData && typeof responseData === 'object') {
          // Si la réponse a une structure { data: Boutique[] }
          const apiResponse = responseData as any;
          if ('data' in apiResponse && Array.isArray(apiResponse.data)) {
            allBoutiques = apiResponse.data;
          } else if (Array.isArray(apiResponse)) {
            // Fallback si apiResponse est un tableau
            allBoutiques = apiResponse;
          }
        }

        console.log(`📊 ${allBoutiques.length} boutiques à traiter pour les types`);

        allBoutiques.forEach((boutique: Boutique) => {
          if (boutique.type_boutique && boutique.type_boutique.uuid) {
            typesMap.set(boutique.type_boutique.uuid, boutique.type_boutique);
          }
        });
        
        setUniqueTypes(Array.from(typesMap.values()));
        console.log(`🏷️ ${typesMap.size} types de boutiques uniques trouvés`);

        // Réinitialiser la sélection après chargement
        setSelectedBoutiques([]);
        setSelectAll(false);

        console.log(
          `✅ ${boutiquesData.length} boutiques chargées depuis l'API`,
        );
      } catch (err: any) {
        console.error("❌ Erreur lors du chargement des boutiques:", err);

        // Message d'erreur plus détaillé
        let errorMessage = "Erreur lors du chargement des boutiques";
        if (err.response) {
          if (err.response.status === 401) {
            errorMessage = "Session expirée. Veuillez vous reconnecter.";
          } else if (err.response.status === 403) {
            errorMessage =
              "Vous n'avez pas la permission d'accéder à cette ressource.";
          } else if (err.response.status === 404) {
            errorMessage = "API non trouvée. Vérifiez l'URL de l'API.";
          } else if (err.response.data?.message) {
            errorMessage = `Erreur ${err.response.status}: ${err.response.data.message}`;
          } else {
            errorMessage = `Erreur ${err.response.status}: ${err.response.statusText}`;
          }
        } else if (err.request) {
          errorMessage =
            "Impossible de joindre le serveur. Vérifiez votre connexion.";
        } else {
          errorMessage = err.message || "Erreur inconnue";
        }

        setError(errorMessage);
        setBoutiques([]);
        setPagination({
          page: 1,
          limit: pagination.limit,
          total: 0,
          pages: 1,
        });
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.limit],
  );

  // Charger les boutiques au montage
  useEffect(() => {
    fetchBoutiques();
  }, [fetchBoutiques]);

  // Gérer les changements de filtres
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params: Record<string, any> = {};

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      if (selectedStatus !== "all") {
        params.statut = selectedStatus;
      }

      if (selectedType !== "all") {
        params.type_boutique_uuid = selectedType;
      }

      fetchBoutiques(params);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedStatus, selectedType, fetchBoutiques]);

  // Gérer les changements de pagination
  useEffect(() => {
    const params: Record<string, any> = {};

    if (searchTerm.trim()) {
      params.search = searchTerm.trim();
    }

    if (selectedStatus !== "all") {
      params.statut = selectedStatus;
    }

    if (selectedType !== "all") {
      params.type_boutique_uuid = selectedType;
    }

    params.page = pagination.page;
    params.limit = pagination.limit;

    fetchBoutiques(params);
  }, [pagination.page, pagination.limit]);

  // Fonctions de tri
  const requestSort = (key: keyof Boutique) => {
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

  const getSortIcon = (key: keyof Boutique) => {
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

  const sortedBoutiques = useMemo(() => {
    if (!sortConfig) return boutiques;
    return [...boutiques].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // Gestion spéciale pour les dates
      if (sortConfig.key === "created_at" || sortConfig.key === "updated_at") {
        const aDate = new Date(aValue as string).getTime();
        const bDate = new Date(bValue as string).getTime();
        if (sortConfig.direction === "asc") return aDate - bDate;
        return bDate - aDate;
      }

      // Gestion spéciale pour type_boutique (tri par libelle)
      if (sortConfig.key === "type_boutique") {
        const aType = a.type_boutique?.libelle || "";
        const bType = b.type_boutique?.libelle || "";
        if (sortConfig.direction === "asc") return aType.localeCompare(bType);
        return bType.localeCompare(aType);
      }

      // Tri standard
      if (aValue === bValue) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      if (sortConfig.direction === "asc") return aValue < bValue ? -1 : 1;
      return aValue > bValue ? -1 : 1;
    });
  }, [boutiques, sortConfig]);

  const filteredBoutiques = useMemo(() => {
    return sortedBoutiques.filter((boutique) => {
      const matchesSearch =
        !searchTerm.trim() ||
        boutique.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        boutique.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (boutique.description &&
          boutique.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        boutique.type_boutique?.libelle
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        selectedStatus === "all" || boutique.statut === selectedStatus;

      const matchesType =
        selectedType === "all" || boutique.type_boutique.uuid === selectedType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [sortedBoutiques, searchTerm, selectedStatus, selectedType]);

  // Statistiques
  const stats = useMemo(() => {
    const totalBoutiques = boutiques.length;
    const activeBoutiques = boutiques.filter(
      (b) => b.statut === "actif",
    ).length;
    const reviewBoutiques = boutiques.filter(
      (b) => b.statut === "en_review",
    ).length;
    const blockedBoutiques = boutiques.filter((b) => b.est_bloque).length;
    const closedBoutiques = boutiques.filter((b) => b.est_ferme).length;
    const boutiquesWithLogo = boutiques.filter((b) => b.logo).length;
    const boutiquesWithBanniere = boutiques.filter((b) => b.banniere).length;

    const typeStats = uniqueTypes.map((type) => ({
      name: type.libelle,
      count: boutiques.filter((b) => b.type_boutique.uuid === type.uuid).length,
    }));

    return {
      total: totalBoutiques,
      active: activeBoutiques,
      review: reviewBoutiques,
      blocked: blockedBoutiques,
      closed: closedBoutiques,
      withLogo: boutiquesWithLogo,
      withBanniere: boutiquesWithBanniere,
      typeStats,
    };
  }, [boutiques, uniqueTypes]);

  // Gestion succès
  const handleSuccess = (message: string) => {
    setSuccessMessage(message);
    fetchBoutiques();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Gestion des images
  const handleViewImage = (imageUrl: string, alt: string) => {
    setSelectedImage({ url: imageUrl, alt });
    setShowImageModal(true);
  };

  // Suppression d'une boutique
  const handleDelete = async () => {
    if (!selectedBoutique) return;

    try {
      setDeleteLoading(true);
      setError(null);

      await api.delete(API_ENDPOINTS.BOUTIQUES.DELETE(selectedBoutique.uuid));

      setShowDeleteModal(false);
      setSelectedBoutique(null);
      handleSuccess("Boutique supprimée avec succès !");
    } catch (err: any) {
      console.error("❌ Erreur suppression:", err);
      let errorMessage = "Erreur lors de la suppression";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Suppression multiple
  const handleDeleteMultiple = async () => {
    if (selectedBoutiques.length === 0) return;

    try {
      setDeleteLoading(true);
      setError(null);

      const deletePromises = selectedBoutiques.map((boutiqueUuid) =>
        api.delete(API_ENDPOINTS.BOUTIQUES.DELETE(boutiqueUuid)),
      );

      await Promise.all(deletePromises);

      setShowDeleteMultipleModal(false);
      handleSuccess(
        `${selectedBoutiques.length} boutique(s) supprimée(s) avec succès`,
      );

      setSelectedBoutiques([]);
      setSelectAll(false);
    } catch (err: any) {
      console.error("❌ Erreur suppression multiple:", err);
      let errorMessage = "Erreur lors de la suppression multiple";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Actions sur les boutiques
  const handleAction = async (
    action: "block" | "unblock" | "close" | "open" | "activate" | "deactivate",
    boutique?: Boutique,
  ) => {
    const uuid = boutique ? boutique.uuid : selectedBoutiques[0];
    if (!uuid) return;

    try {
      setBulkActionLoading(true);
      setError(null);

      let endpoint = "";
      let actionText = "";

      switch (action) {
        case "block":
          endpoint = API_ENDPOINTS.BOUTIQUES.BLOCK(uuid);
          actionText = "bloquée";
          break;
        case "unblock":
          endpoint = API_ENDPOINTS.BOUTIQUES.UNBLOCK(uuid);
          actionText = "débloquée";
          break;
        case "close":
          endpoint = API_ENDPOINTS.BOUTIQUES.CLOSE(uuid);
          actionText = "fermée";
          break;
        case "open":
          endpoint = `/boutiques/${uuid}/ouvrir`;
          actionText = "ouverte";
          break;
        case "activate":
          endpoint = `/boutiques/${uuid}/activer`;
          actionText = "activée";
          break;
        case "deactivate":
          endpoint = `/boutiques/${uuid}/desactiver`;
          actionText = "désactivée";
          break;
      }

      if (!endpoint) {
        setError(`Action ${action} non supportée pour le moment`);
        setTimeout(() => setError(null), 3000);
        return;
      }

      await api.put(endpoint);

      handleSuccess(`Boutique ${actionText} avec succès !`);
    } catch (err: any) {
      console.error(`❌ Erreur ${action}:`, err);
      let errorMessage = `Erreur lors de l'action ${action}`;
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Ouvrir modal de suppression
  const openDeleteModal = (boutique: Boutique) => {
    setSelectedBoutique(boutique);
    setShowDeleteModal(true);
  };

  // Ouvrir modal de suppression multiple
  const openDeleteMultipleModal = () => {
    if (selectedBoutiques.length === 0) {
      setInfoMessage("Veuillez sélectionner au moins une boutique");
      setTimeout(() => setInfoMessage(null), 3000);
      return;
    }
    setShowDeleteMultipleModal(true);
  };

  // Export CSV (commenté comme dans l'original)
  // const createCSVExport = async () => { ... };

  // Utils
  const formatDate = (dateString?: string) => {
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
  const handleSelectBoutique = (boutiqueUuid: string) => {
    setSelectedBoutiques((prev) => {
      if (prev.includes(boutiqueUuid)) {
        return prev.filter((id) => id !== boutiqueUuid);
      } else {
        return [...prev, boutiqueUuid];
      }
    });
  };

  const handleSelectAllOnPage = () => {
    const pageBoutiqueIds = currentItems.map((boutique) => boutique.uuid);
    const allSelected = pageBoutiqueIds.every((id) =>
      selectedBoutiques.includes(id),
    );

    if (allSelected) {
      setSelectedBoutiques((prev) =>
        prev.filter((id) => !pageBoutiqueIds.includes(id)),
      );
    } else {
      const newSelection = [
        ...new Set([...selectedBoutiques, ...pageBoutiqueIds]),
      ];
      setSelectedBoutiques(newSelection);
    }
  };

  // Actions en masse
  const handleBulkAction = async (
    action:
      | "block"
      | "unblock"
      | "close"
      | "delete"
      | "activate"
      | "deactivate",
  ) => {
    if (selectedBoutiques.length === 0) {
      setInfoMessage("Veuillez sélectionner au moins une boutique");
      setTimeout(() => setInfoMessage(null), 3000);
      return;
    }

    if (action === "delete") {
      openDeleteMultipleModal();
      return;
    }

    try {
      setBulkActionLoading(true);
      setError(null);

      const actionPromises = selectedBoutiques.map((uuid) => {
        let endpoint = "";

        switch (action) {
          case "block":
            endpoint = API_ENDPOINTS.BOUTIQUES.BLOCK(uuid);
            break;
          case "unblock":
            endpoint = API_ENDPOINTS.BOUTIQUES.UNBLOCK(uuid);
            break;
          case "close":
            endpoint = API_ENDPOINTS.BOUTIQUES.CLOSE(uuid);
            break;
          case "activate":
            endpoint = `/boutiques/${uuid}/activer`;
            break;
          case "deactivate":
            endpoint = `/boutiques/${uuid}/desactiver`;
            break;
        }

        if (!endpoint) {
          throw new Error(`Action ${action} non supportée`);
        }

        return api.put(endpoint);
      });

      await Promise.all(actionPromises);

      const actionText = {
        block: "bloquée(s)",
        unblock: "débloquée(s)",
        close: "fermée(s)",
        activate: "activée(s)",
        deactivate: "désactivée(s)",
      }[action];

      setSuccessMessage(
        `${selectedBoutiques.length} boutique(s) ${actionText} avec succès`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);

      fetchBoutiques();
      setSelectedBoutiques([]);
      setSelectAll(false);
    } catch (err: any) {
      console.error("Erreur lors de l'action en masse:", err);
      let errorMessage = "Erreur lors de l'action en masse";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Pagination et filtres
  const currentItems = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    return boutiques.slice(startIndex, startIndex + pagination.limit);
  }, [boutiques, pagination.page, pagination.limit]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setSelectedType("all");
    setSortConfig(null);
    setPagination((prev) => ({ ...prev, page: 1 }));
    setSelectedBoutiques([]);
    setSelectAll(false);
    fetchBoutiques();
  };

  // Effet pour mettre à jour selectAll
  useEffect(() => {
    if (currentItems.length > 0) {
      const allSelected = currentItems.every((boutique) =>
        selectedBoutiques.includes(boutique.uuid),
      );
      setSelectAll(allSelected);
    } else {
      setSelectAll(false);
    }
  }, [selectedBoutiques, currentItems]);

  return (
    <>
      <DeleteModal
        show={showDeleteModal}
        boutique={selectedBoutique}
        loading={deleteLoading}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedBoutique(null);
        }}
        onConfirm={handleDelete}
        type="single"
      />
      <DeleteModal
        show={showDeleteMultipleModal}
        boutique={null}
        loading={deleteLoading}
        onClose={() => setShowDeleteMultipleModal(false)}
        onConfirm={handleDeleteMultiple}
        type="multiple"
        count={selectedBoutiques.length}
      />

      <ImageModal
        show={showImageModal}
        imageUrl={selectedImage?.url || ""}
        alt={selectedImage?.alt || ""}
        onClose={() => {
          setShowImageModal(false);
          setSelectedImage(null);
        }}
      />

      <div className="p-3 p-md-4">
        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="card-header bg-white border-0 py-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div>
                <p className="text-muted mb-1">Gestion des Boutiques</p>
                <div className="d-flex align-items-center gap-3">
                  <h2 className="h4 mb-0 fw-bold">Liste des Boutiques</h2>
                  <span className="badge bg-primary bg-opacity-10 text-primary">
                    {pagination.total} boutique(s){" "}
                    {selectedBoutiques.length > 0 &&
                      `(${selectedBoutiques.length} sélectionnée(s))`}
                  </span>
                </div>
                <div className="mt-2">
                  <small className="text-info">
                    <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
                    Données chargées depuis l'API :{" "}
                    {API_ENDPOINTS.BOUTIQUES.ALL}
                  </small>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <button
                  onClick={() => fetchBoutiques()}
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faRefresh} spin={loading} />
                  Rafraîchir
                </button>

                <button
                //  onClick={createCSVExport}
                  className="btn btn-outline-primary d-flex align-items-center gap-2"
                  disabled={boutiques.length === 0 || loading}
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Exporter CSV
                </button>

                <button
                  onClick={() => {
                    setInfoMessage("Fonctionnalité en développement");
                    setTimeout(() => setInfoMessage(null), 3000);
                  }}
                  className="btn btn-success d-flex align-items-center gap-2"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Nouvelle Boutique
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
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className="me-2"
                  />
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
          {selectedBoutiques.length > 0 && (
            <div className="p-3 border-bottom bg-warning bg-opacity-10">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                <div className="d-flex align-items-center gap-2">
                  <FontAwesomeIcon icon={faStore} className="text-warning" />
                  <span className="fw-semibold">
                    {selectedBoutiques.length} boutique(s) sélectionnée(s)
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
                    <span>Désactiver</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1"
                    onClick={() => handleBulkAction("block")}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faLock} />
                    <span>Bloquer</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                    onClick={() => handleBulkAction("unblock")}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faLockOpen} />
                    <span>Débloquer</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                    onClick={() => handleBulkAction("close")}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faDoorClosed} />
                    <span>Fermer</span>
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
                      setSelectedBoutiques([]);
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
              <div className="col-md-3">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faSearch} className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Rechercher par nom, type ou description..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
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
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="actif">Actives</option>
                    <option value="en_review">En attente</option>
                    <option value="inactif">Inactives</option>
                    <option value="bloque">Bloquées</option>
                    <option value="ferme">Fermées</option>
                  </select>
                </div>
              </div>

              <div className="col-md-3">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faTags} className="text-muted" />
                  </span>
                  <select
                    className="form-select border-start-0 ps-0"
                    value={selectedType}
                    onChange={(e) => {
                      setSelectedType(e.target.value);
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                  >
                    <option value="all">Tous les types</option>
                    {uniqueTypes.map((type) => (
                      <option key={type.uuid} value={type.uuid}>
                        {type.libelle}
                      </option>
                    ))}
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
                    Résultats: <strong>{pagination.total}</strong> boutique(s)
                    {searchTerm && (
                      <>
                        {" "}
                        pour "<strong>{searchTerm}</strong>"
                      </>
                    )}
                    {selectedStatus !== "all" && (
                      <>
                        {" "}
                        de statut "
                        <strong>
                          {selectedStatus === "actif"
                            ? "Actif"
                            : selectedStatus === "en_review"
                              ? "En attente"
                              : selectedStatus === "inactif"
                                ? "Inactif"
                                : selectedStatus === "bloque"
                                  ? "Bloqué"
                                  : "Fermé"}
                        </strong>
                        "
                      </>
                    )}
                    {selectedType !== "all" && (
                      <>
                        {" "}
                        et de type "
                        <strong>
                          {uniqueTypes.find((t) => t.uuid === selectedType)
                            ?.libelle || selectedType}
                        </strong>
                        "
                      </>
                    )}
                  </small>
                </div>
              </div>

              <div className="col-md-4 text-end">
                <div className="d-flex align-items-center gap-2 justify-content-end">
                  {selectedBoutiques.length > 0 && (
                    <small className="text-primary fw-semibold">
                      {selectedBoutiques.length} sélectionnée(s)
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

          {/* Tableau des boutiques amélioré */}
          <div className="table-responsive">
            {loading ? (
              <LoadingSkeleton />
            ) : boutiques.length === 0 ? (
              <div className="text-center py-5">
                <div
                  className="alert alert-info mx-auto"
                  style={{ maxWidth: "500px" }}
                >
                  <FontAwesomeIcon
                    icon={faStore}
                    className="fs-1 mb-3 text-info"
                  />
                  <h5 className="alert-heading">
                    {error ? "Erreur de chargement" : "Aucune boutique trouvée"}
                  </h5>
                  <p className="mb-0 text-center">
                    {error ? error : "Aucune boutique dans la base de données."}
                  </p>
                  {!error && (
                    <button
                      onClick={() => {
                        setInfoMessage("Fonctionnalité en développement");
                        setTimeout(() => setInfoMessage(null), 3000);
                      }}
                      className="btn btn-primary mt-3"
                    >
                      <FontAwesomeIcon icon={faPlus} className="me-2" />
                      Créer la première boutique
                    </button>
                  )}
                  {error && (
                    <button
                      onClick={() => fetchBoutiques()}
                      className="btn btn-primary mt-3"
                    >
                      <FontAwesomeIcon icon={faRefresh} className="me-2" />
                      Réessayer
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
                      <th style={{ width: "200px" }}>
                        <button
                          className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                          onClick={() => requestSort("nom")}
                        >
                          <FontAwesomeIcon icon={faStore} className="me-1" />
                          Nom de la boutique
                          {getSortIcon("nom")}
                        </button>
                      </th>
                      <th style={{ width: "150px" }}>
                        <button
                          className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                          onClick={() => requestSort("type_boutique")}
                        >
                          Type
                          {getSortIcon("type_boutique")}
                        </button>
                      </th>
                      <th style={{ width: "120px" }}>
                        <span className="fw-semibold">Logo</span>
                      </th>
                      <th style={{ width: "120px" }}>
                        <span className="fw-semibold">Bannière</span>
                      </th>
                      <th style={{ width: "120px" }}>
                        <span className="fw-semibold">Statut</span>
                      </th>
                      <th style={{ width: "150px" }}>
                        <button
                          className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                          onClick={() => requestSort("created_at")}
                        >
                          <FontAwesomeIcon icon={faCalendar} className="me-1" />
                          Créée le
                          {getSortIcon("created_at")}
                        </button>
                      </th>
                      <th style={{ width: "200px" }} className="text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((boutique, index) => (
                      <tr
                        key={boutique.uuid}
                        className={`align-middle ${selectedBoutiques.includes(boutique.uuid) ? "table-active" : ""}`}
                      >
                        <td className="text-center">
                          <div className="form-check d-flex justify-content-center">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={selectedBoutiques.includes(
                                boutique.uuid,
                              )}
                              onChange={() =>
                                handleSelectBoutique(boutique.uuid)
                              }
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
                                <FontAwesomeIcon icon={faStore} />
                              </div>
                            </div>
                            <div className="flex-grow-1 ms-3">
                              <div className="fw-semibold">
                                <button
                                  className="btn btn-link p-0 text-decoration-none text-dark fw-semibold"
                                  onClick={() =>
                                    router.push(`/boutiques/${boutique.uuid}`)
                                  }
                                  title={`Voir les détails de ${boutique.nom}`}
                                >
                                  {boutique.nom}
                                </button>
                              </div>
                              <small
                                className="text-muted text-truncate d-block"
                                style={{
                                  maxWidth: "150px",
                                  fontSize: "0.75rem",
                                }}
                                title={boutique.slug}
                              >
                                <code>{boutique.slug}</code>
                              </small>
                              {boutique.description && (
                                <small
                                  className="text-muted text-truncate d-block"
                                  style={{
                                    maxWidth: "150px",
                                    fontSize: "0.7rem",
                                  }}
                                  title={boutique.description}
                                >
                                  {boutique.description}
                                </small>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <TypeBoutiqueBadge
                            typeBoutique={boutique.type_boutique}
                          />
                        </td>
                        <td>
                          <BoutiqueImage
                            src={boutique.logo ?? null}
                            alt={`Logo ${boutique.nom}`}
                            type="logo"
                            onView={() =>
                              boutique.logo &&
                              handleViewImage(
                                boutique.logo,
                                `Logo - ${boutique.nom}`,
                              )
                            }
                          />
                        </td>
                        <td>
                          <BoutiqueImage
                            src={boutique.banniere ?? null}
                            alt={`Bannière ${boutique.nom}`}
                            type="banniere"
                            onView={() =>
                              boutique.banniere &&
                              handleViewImage(
                                boutique.banniere,
                                `Bannière - ${boutique.nom}`,
                              )
                            }
                          />
                        </td>
                        <td>
                          <StatusBadge statut={boutique.statut} />
                          {boutique.est_bloque && (
                            <div className="mt-1">
                              <span
                                className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25"
                                style={{ fontSize: "0.65rem" }}
                              >
                                <FontAwesomeIcon
                                  icon={faLock}
                                  className="me-1"
                                />
                                Bloquée
                              </span>
                            </div>
                          )}
                          {boutique.est_ferme && (
                            <div className="mt-1">
                              <span
                                className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25"
                                style={{ fontSize: "0.65rem" }}
                              >
                                <FontAwesomeIcon
                                  icon={faDoorClosed}
                                  className="me-1"
                                />
                                Fermée
                              </span>
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
                              {formatDate(boutique.created_at)}
                            </small>
                          </div>
                        </td>
                        <td className="text-center">
                          <div className="btn-group btn-group-sm" role="group">
                            <button
                              className="btn btn-outline-primary"
                              title="Voir détails"
                              onClick={() =>
                                router.push(
                                  `/dashboard-agent/boutiques/${boutique.uuid}`,
                                )
                              }
                              disabled={loading}
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </button>
                            <button
                              className="btn btn-outline-warning"
                              title="Modifier"
                              onClick={() => {
                                setInfoMessage(
                                  "Fonctionnalité en développement",
                                );
                                setTimeout(() => setInfoMessage(null), 3000);
                              }}
                              disabled={loading || boutique.is_deleted}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            {boutique.statut === "actif" ? (
                              <button
                                className="btn btn-outline-secondary"
                                title="Désactiver"
                                onClick={() =>
                                  handleAction("deactivate", boutique)
                                }
                                disabled={loading || bulkActionLoading}
                              >
                                <FontAwesomeIcon icon={faBan} />
                              </button>
                            ) : (
                              <button
                                className="btn btn-outline-success"
                                title="Activer"
                                onClick={() =>
                                  handleAction("activate", boutique)
                                }
                                disabled={loading || bulkActionLoading}
                              >
                                <FontAwesomeIcon icon={faCheckCircle} />
                              </button>
                            )}
                            {boutique.est_bloque ? (
                              <button
                                className="btn btn-outline-success"
                                title="Débloquer"
                                onClick={() =>
                                  handleAction("unblock", boutique)
                                }
                                disabled={loading || bulkActionLoading}
                              >
                                <FontAwesomeIcon icon={faLockOpen} />
                              </button>
                            ) : (
                              <button
                                className="btn btn-outline-warning"
                                title="Bloquer"
                                onClick={() => handleAction("block", boutique)}
                                disabled={loading || bulkActionLoading}
                              >
                                <FontAwesomeIcon icon={faLock} />
                              </button>
                            )}
                            <button
                              className="btn btn-outline-danger"
                              title="Supprimer"
                              onClick={() => openDeleteModal(boutique)}
                              disabled={loading || boutique.is_deleted}
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
                {pagination.pages > 1 && (
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.pages}
                    totalItems={pagination.total}
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
        .logo-placeholder:hover {
          background-color: rgba(108, 117, 125, 0.2) !important;
        }
        .banniere-placeholder:hover {
          background-color: rgba(108, 117, 125, 0.2) !important;
        }
      `}</style>
    </>
  );
}