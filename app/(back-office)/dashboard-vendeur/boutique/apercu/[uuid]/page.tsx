"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStore,
  faEdit,
  faTrash,
  faRefresh,
  faSearch,
  faFilter,
  faSort,
  faPlus,
  faSortUp,
  faSortDown,
  faCalendar,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faBan,
  faInfoCircle,
  faCheck,
  faTimes,
  faSpinner,
  faImage,
  faExclamationTriangle,
  faShoppingCart,
  faStar,
  faUsers,
  faBoxes,
  faMoneyBillWave,
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faGlobe,
  faLock,
  faLockOpen,
  faEye,
  faTags,
  faChartLine,
  faStoreAlt,
  faHeart,
  faShare,
  faShoppingBag,
  faCheckSquare,
  faSquare,
  faShoppingBasket,
  faLayerGroup,
  faToggleOn,
  faToggleOff,
  faCloudUpload,
  faCloudDownload,
  faBullhorn,
  faArchive,
  faListCheck,
  faCheckDouble,
  faArrowUp,
  faArrowDown,
  faCircleCheck,
  faCircleXmark,
  faEllipsisVertical,
  faGear,
  faEllipsisH,
  faList,
  faCog,
  faPlayCircle,
  faPauseCircle,
  faExternalLinkAlt,
  faCopy,
  faQrcode,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import EditProductModal from "../../../produits/components/modals/EditProductModal";
import ViewProductModal from "../../../produits/components/modals/ViewProductModal";

// ============================================
// FONCTION DE CONSTRUCTION D'URL D'IMAGE ROBUSTE
// ============================================
const buildImageUrl = (imagePath: string | null): string | null => {
  if (!imagePath) return null;

  // Nettoyer le chemin des espaces indésirables
  let cleanPath = imagePath
    .replace(/\s+/g, "") // Supprimer tous les espaces
    .replace(/-/g, "-") // Normaliser les tirets
    .trim();

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://oskar-api.mysonec.pro";
  const filesUrl = process.env.NEXT_PUBLIC_FILES_URL || "/api/files";

  // ✅ CAS 1: Déjà une URL complète
  if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
    if (cleanPath.includes("localhost")) {
      const productionUrl = apiUrl.replace(/\/api$/, "");
      return cleanPath.replace(/http:\/\/localhost(:\d+)?/g, productionUrl);
    }
    return cleanPath;
  }

  // ✅ CAS 2: Chemin avec %2F (déjà encodé)
  if (cleanPath.includes("%2F")) {
    // Nettoyer les espaces autour de %2F
    const finalPath = cleanPath.replace(/%2F\s+/, "%2F");
    return `${apiUrl}${filesUrl}/${finalPath}`;
  }

  // ✅ CAS 3: Chemin simple
  return `${apiUrl}${filesUrl}/${cleanPath}`;
};

// ============ TYPES ============
interface TypeBoutique {
  uuid: string;
  code: string;
  libelle: string;
  description: string | null;
  peut_vendre_produits: boolean;
  peut_vendre_biens: boolean;
  image: string | null;
  image_key?: string;
  statut: string;
}

interface Produit {
  is_deleted: boolean;
  deleted_at: string | null;
  id: number;
  uuid: string;
  libelle: string;
  slug: string;
  type: string | null;
  image: string | null;
  image_key?: string;
  disponible: boolean;
  statut: "publie" | "non_publie" | "en_attente" | "bloque";
  prix: string;
  description: string | null;
  etoile: string;
  vendeurUuid: string;
  boutiqueUuid: string;
  lieu: string;
  condition: string;
  garantie: string;
  categorie_uuid: string;
  categorie: {
    uuid: string;
    libelle: string;
    type: string;
    image: string | null;
    image_key?: string;
  };
  estPublie: boolean;
  estBloque: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  quantite: number;
  note_moyenne: string;
  nombre_avis: number;
  nombre_favoris: number;
}

interface Boutique {
  is_deleted: false;
  deleted_at: null;
  id: number;
  uuid: string;
  type_boutique_uuid: string;
  nom: string;
  slug: string;
  description: string | null;
  logo: string | null;
  banniere: string | null;
  politique_retour: string | null;
  conditions_utilisation: string | null;
  logo_key: string | null;
  banniere_key: string | null;
  statut: "en_review" | "actif" | "bloque" | "ferme";
  created_at: string;
  updated_at: string;
  type_boutique: TypeBoutique;
  horaires: any[];
  vendeurUuid: string;
  agentUuid: string | null;
  produits: Produit[];
  est_bloque: boolean;
  est_ferme: boolean;
}

interface StatsBoutique {
  totalProduits: number;
  produitsPublies: number;
  produitsBloques: number;
  produitsEnStock: number;
  produitsEpuises: number;
  valeurStock: number;
  noteMoyenne: number;
  totalAvis: number;
  totalFavoris: number;
}

// ============ COMPOSANTS ============

// Composant de badge de statut boutique
const BoutiqueStatusBadge = ({ statut }: { statut: string }) => {
  switch (statut) {
    case "actif":
      return (
        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">
          <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
          Actif
        </span>
      );
    case "en_review":
      return (
        <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25">
          <FontAwesomeIcon icon={faClock} className="me-1" />
          En revue
        </span>
      );
    case "bloque":
      return (
        <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25">
          <FontAwesomeIcon icon={faBan} className="me-1" />
          Bloqué
        </span>
      );
    case "ferme":
      return (
        <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25">
          <FontAwesomeIcon icon={faLock} className="me-1" />
          Fermé
        </span>
      );
    default:
      return (
        <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25">
          <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
          {statut}
        </span>
      );
  }
};

// Composant de statut produit
const ProductStatusBadge = ({
  statut,
  estPublie,
  estBloque,
}: {
  statut: string;
  estPublie: boolean;
  estBloque: boolean;
}) => {
  if (estBloque) {
    return (
      <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25">
        <FontAwesomeIcon icon={faBan} className="me-1" />
        Bloqué
      </span>
    );
  }

  if (estPublie) {
    return (
      <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">
        <FontAwesomeIcon icon={faGlobe} className="me-1" />
        Publié
      </span>
    );
  }

  return (
    <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25">
      <FontAwesomeIcon icon={faLock} className="me-1" />
      Non publié
    </span>
  );
};

// Composant de disponibilité produit
const ProductAvailabilityBadge = ({ disponible }: { disponible: boolean }) => {
  return disponible ? (
    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">
      <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
      Disponible
    </span>
  ) : (
    <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25">
      <FontAwesomeIcon icon={faTimesCircle} className="me-1" />
      Indisponible
    </span>
  );
};

// Composant de carte statistique (CORRIGÉ pour gérer NaN)
const StatCard = ({
  title,
  value,
  icon,
  color = "primary",
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: any;
  color?: string;
  subtitle?: string;
}) => {
  const colorClasses: Record<string, string> = {
    primary: "bg-primary bg-opacity-10 text-primary",
    success: "bg-success bg-opacity-10 text-success",
    warning: "bg-warning bg-opacity-10 text-warning",
    danger: "bg-danger bg-opacity-10 text-danger",
    info: "bg-info bg-opacity-10 text-info",
  };

  // Fonction pour formater la valeur en toute sécurité
  const formatValue = (val: string | number) => {
    if (typeof val === "number") {
      // Vérifier si la valeur est NaN ou Infinity
      if (isNaN(val) || !isFinite(val)) {
        return "0";
      }
      // Si c'est un nombre décimal, formater avec 2 décimales
      if (Math.floor(val) !== val) {
        return val.toFixed(2);
      }
      return val.toString();
    }

    // Si c'est une chaîne, vérifier si c'est un nombre
    const num = parseFloat(val);
    if (!isNaN(num) && isFinite(num)) {
      return num.toString();
    }

    // Sinon retourner la valeur telle quelle
    return val || "0";
  };

  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className={`rounded-circle p-3 ${colorClasses[color]}`}>
            <FontAwesomeIcon icon={icon} className="fs-4" />
          </div>
          <div className="text-end">
            <h3 className="mb-0 fw-bold">{formatValue(value)}</h3>
            <small className="text-muted">{title}</small>
          </div>
        </div>
        {subtitle && (
          <div className="small text-muted mt-2">
            <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};

// Composant de modal de suppression multiple
const BulkDeleteModal = ({
  show,
  count,
  loading,
  onClose,
  onConfirm,
}: {
  show: boolean;
  count: number;
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
              Êtes-vous sûr de vouloir supprimer{" "}
              <strong>{count} produit(s)</strong> sélectionné(s) ?
            </p>
            <div className="text-danger small">
              Cette action est irréversible. Toutes les données associées à ces
              produits seront perdues.
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
                  Suppression...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faTrash} className="me-2" />
                  Supprimer {count} produit(s)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant de barre d'actions en masse
const BulkActionBar = ({
  selectedCount,
  totalCount,
  loading,
  onPublish,
  onUnpublish,
  onActivate,
  onDeactivate,
  onDelete,
  onClearSelection,
}: {
  selectedCount: number;
  totalCount: number;
  loading: boolean;
  onPublish: () => void;
  onUnpublish: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
  onClearSelection: () => void;
}) => {
  // Calcul sécurisé du pourcentage
  const percentage =
    totalCount > 0 ? Math.round((selectedCount / totalCount) * 100) : 0;

  return (
    <div className="p-3 border-bottom bg-primary bg-opacity-10">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
        <div className="d-flex align-items-center gap-2">
          <FontAwesomeIcon icon={faListCheck} className="text-primary fs-5" />
          <span className="fw-semibold">
            {selectedCount} produit(s) sélectionné(s)
          </span>
          <span className="badge bg-primary">{percentage}%</span>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <button
            className="btn btn-sm btn-success d-flex align-items-center gap-1"
            onClick={onPublish}
            disabled={loading}
            title="Publier les produits sélectionnés"
          >
            <FontAwesomeIcon icon={faCloudUpload} />
            <span className="d-none d-md-inline">Publier</span>
          </button>

          <button
            className="btn btn-sm btn-secondary d-flex align-items-center gap-1"
            onClick={onUnpublish}
            disabled={loading}
            title="Dépublier les produits sélectionnés"
          >
            <FontAwesomeIcon icon={faCloudDownload} />
            <span className="d-none d-md-inline">Dépublier</span>
          </button>

          <button
            className="btn btn-sm btn-success d-flex align-items-center gap-1"
            onClick={onActivate}
            disabled={loading}
            title="Activer les produits sélectionnés"
          >
            <FontAwesomeIcon icon={faToggleOn} />
            <span className="d-none d-md-inline">Activer</span>
          </button>

          <button
            className="btn btn-sm btn-warning d-flex align-items-center gap-1"
            onClick={onDeactivate}
            disabled={loading}
            title="Désactiver les produits sélectionnés"
          >
            <FontAwesomeIcon icon={faToggleOff} />
            <span className="d-none d-md-inline">Désactiver</span>
          </button>

          <button
            className="btn btn-sm btn-danger d-flex align-items-center gap-1"
            onClick={onDelete}
            disabled={loading}
            title="Supprimer les produits sélectionnés"
          >
            <FontAwesomeIcon icon={faTrash} />
            <span className="d-none d-md-inline">Supprimer</span>
          </button>

          <button
            className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1"
            onClick={onClearSelection}
            disabled={loading}
            title="Annuler la sélection"
          >
            <FontAwesomeIcon icon={faTimes} />
            <span className="d-none d-md-inline">Annuler</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant de sélection en masse
const BulkSelectionControls = ({
  selectAll,
  selectAllOnPage,
  onSelectAll,
  onSelectAllOnPage,
  selectedCount,
  totalCount,
  disabled,
}: {
  selectAll: boolean;
  selectAllOnPage: boolean;
  onSelectAll: () => void;
  onSelectAllOnPage: () => void;
  selectedCount: number;
  totalCount: number;
  disabled: boolean;
}) => {
  // Calcul sécurisé du pourcentage
  const percentage = totalCount > 0 ? (selectedCount / totalCount) * 100 : 0;

  return (
    <div className="d-flex justify-content-between align-items-center mb-3">
      <div className="d-flex align-items-center gap-3">
        <div className="dropdown">
          <button
            className="btn btn-outline-primary dropdown-toggle d-flex align-items-center gap-2"
            type="button"
            id="bulkSelectionDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            disabled={disabled}
          >
            <FontAwesomeIcon icon={faCheckDouble} />
            <span>Sélection</span>
          </button>
          <ul className="dropdown-menu" aria-labelledby="bulkSelectionDropdown">
            <li>
              <button
                className="dropdown-item d-flex align-items-center gap-2"
                onClick={onSelectAll}
              >
                <FontAwesomeIcon icon={selectAll ? faCheckSquare : faSquare} />
                {selectAll ? "Tout désélectionner" : "Tout sélectionner"}
              </button>
            </li>
            <li>
              <button
                className="dropdown-item d-flex align-items-center gap-2"
                onClick={onSelectAllOnPage}
              >
                <FontAwesomeIcon icon={faLayerGroup} />
                {selectAllOnPage
                  ? "Désélectionner cette page"
                  : "Sélectionner cette page"}
              </button>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <div className="dropdown-item-text small text-muted">
                <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                {selectedCount} sélectionné(s) sur {totalCount}
              </div>
            </li>
          </ul>
        </div>

        <div className="d-flex align-items-center gap-2">
          <div className="progress" style={{ width: "150px", height: "8px" }}>
            <div
              className="progress-bar bg-primary"
              role="progressbar"
              style={{ width: `${percentage}%` }}
              aria-valuenow={selectedCount}
              aria-valuemin={0}
              aria-valuemax={totalCount}
            ></div>
          </div>
          <small className="text-muted">
            {selectedCount}/{totalCount}
          </small>
        </div>
      </div>

      <div className="text-muted small">
        {selectedCount > 0 && (
          <span className="text-primary fw-semibold">
            <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
            {selectedCount} sélectionné(s)
          </span>
        )}
      </div>
    </div>
  );
};

// Composant de boutons d'actions visibles
const ProductActionsButtons = ({
  product,
  isSelected,
  onView,
  onEdit,
  onPublish,
  onUnpublish,
  onToggleAvailability,
  onSelectProduct,
}: {
  product: Produit;
  isSelected: boolean;
  onView: () => void;
  onEdit: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onToggleAvailability: () => void;
  onSelectProduct: () => void;
}) => {
  return (
    <div className="d-flex gap-1 flex-wrap">
      {/* Bouton Voir */}
      <button
        className="btn btn-sm btn-outline-primary d-flex align-items-center justify-content-center"
        onClick={onView}
        title="Voir détails"
        style={{ width: "36px", height: "36px" }}
      >
        <FontAwesomeIcon icon={faEye} />
      </button>

      {/* Bouton Modifier */}
      <button
        className="btn btn-sm btn-outline-warning d-flex align-items-center justify-content-center"
        onClick={onEdit}
        title="Modifier"
        style={{ width: "36px", height: "36px" }}
      >
        <FontAwesomeIcon icon={faEdit} />
      </button>

      {/* Bouton Publier/Dépublier */}
      {!product.estPublie && !product.estBloque ? (
        <button
          className="btn btn-sm btn-outline-success d-flex align-items-center justify-content-center"
          onClick={onPublish}
          title="Publier"
          style={{ width: "36px", height: "36px" }}
        >
          <FontAwesomeIcon icon={faCloudUpload} />
        </button>
      ) : (
        <button
          className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center"
          onClick={onUnpublish}
          title="Dépublier"
          disabled={!product.estPublie}
          style={{ width: "36px", height: "36px" }}
        >
          <FontAwesomeIcon icon={faCloudDownload} />
        </button>
      )}

      {/* Bouton Activer/Désactiver */}
      <button
        className={`btn btn-sm ${product.disponible ? "btn-outline-warning" : "btn-outline-success"} d-flex align-items-center justify-content-center`}
        onClick={onToggleAvailability}
        title={product.disponible ? "Désactiver" : "Activer"}
        style={{ width: "36px", height: "36px" }}
      >
        <FontAwesomeIcon
          icon={product.disponible ? faPauseCircle : faPlayCircle}
        />
      </button>

      {/* Bouton Sélectionner/Désélectionner */}
      <button
        className={`btn btn-sm ${isSelected ? "btn-danger" : "btn-outline-primary"} d-flex align-items-center justify-content-center`}
        onClick={onSelectProduct}
        title={isSelected ? "Désélectionner" : "Sélectionner"}
        style={{ width: "36px", height: "36px" }}
      >
        <FontAwesomeIcon icon={isSelected ? faTimes : faCheck} />
      </button>

      {/* Menu déroulant pour actions supplémentaires */}
      <div className="dropdown">
        <button
          className="btn btn-sm btn-outline-secondary dropdown-toggle d-flex align-items-center justify-content-center"
          type="button"
          id={`more-actions-${product.uuid}`}
          data-bs-toggle="dropdown"
          aria-expanded="false"
          title="Plus d'actions"
          style={{ width: "36px", height: "36px" }}
        >
          <FontAwesomeIcon icon={faEllipsisH} />
        </button>
        <ul
          className="dropdown-menu"
          aria-labelledby={`more-actions-${product.uuid}`}
        >
          <li>
            <button className="dropdown-item d-flex align-items-center gap-2">
              <FontAwesomeIcon icon={faExternalLinkAlt} />
              Voir en ligne
            </button>
          </li>
          <li>
            <button className="dropdown-item d-flex align-items-center gap-2">
              <FontAwesomeIcon icon={faCopy} />
              Dupliquer
            </button>
          </li>
          <li>
            <button className="dropdown-item d-flex align-items-center gap-2">
              <FontAwesomeIcon icon={faQrcode} />
              Générer QR Code
            </button>
          </li>
          <li>
            <hr className="dropdown-divider" />
          </li>
          <li>
            <button
              className="dropdown-item d-flex align-items-center gap-2 text-danger"
              onClick={onSelectProduct}
            >
              <FontAwesomeIcon
                icon={isSelected ? faCircleXmark : faCircleCheck}
              />
              {isSelected ? "Désélectionner" : "Sélectionner"}
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

// ============ PAGE PRINCIPALE ============

export default function BoutiqueApercu() {
  const params = useParams();
  const router = useRouter();
  const boutiqueUuid = params.uuid as string;

  // États
  const [boutique, setBoutique] = useState<Boutique | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // États pour les modals produits
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Produit | null>(null);

  // États pour la sélection multiple
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set(),
  );
  const [selectAll, setSelectAll] = useState(false);
  const [selectAllOnPage, setSelectAllOnPage] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  // États pour les filtres produits
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Produit;
    direction: "asc" | "desc";
  } | null>(null);

  // ✅ Gestion des erreurs d'image
  const handleImageError = (
    uuid: string,
    e: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    const target = e.currentTarget;

    // Si l'URL contient localhost, essayer de la corriger
    if (target.src.includes("localhost")) {
      const productionUrl =
        process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") ||
        "https://oskar-api.mysonec.pro";
      target.src = target.src.replace(
        /http:\/\/localhost(:\d+)?/g,
        productionUrl,
      );
      return;
    }

    // Si l'URL contient des espaces, essayer de les nettoyer
    if (target.src.includes("%20")) {
      target.src = target.src.replace(/%20/g, "");
      return;
    }

    setImageErrors((prev) => new Set(prev).add(uuid));
    target.onerror = null;
  };

  // ✅ Obtenir l'URL du logo de la boutique
  const getLogoUrl = (boutique: Boutique | null): string | null => {
    if (!boutique) return null;
    if (imageErrors.has(boutique.uuid)) return null;

    if (boutique.logo_key) {
      const url = buildImageUrl(boutique.logo_key);
      if (url) return url;
    }

    if (boutique.logo) {
      const url = buildImageUrl(boutique.logo);
      if (url) return url;
    }

    return null;
  };

  // ✅ Obtenir l'URL de la bannière de la boutique
  const getBanniereUrl = (boutique: Boutique | null): string | null => {
    if (!boutique) return null;
    if (imageErrors.has(`${boutique.uuid}-banner`)) return null;

    if (boutique.banniere_key) {
      const url = buildImageUrl(boutique.banniere_key);
      if (url) return url;
    }

    if (boutique.banniere) {
      const url = buildImageUrl(boutique.banniere);
      if (url) return url;
    }

    return null;
  };

  // ✅ Obtenir l'URL de l'image du type de boutique
  const getTypeImageUrl = (
    typeBoutique: TypeBoutique | null,
  ): string | null => {
    if (!typeBoutique) return null;

    if (typeBoutique.image_key) {
      return buildImageUrl(typeBoutique.image_key);
    }

    if (typeBoutique.image) {
      return buildImageUrl(typeBoutique.image);
    }

    return null;
  };

  // ✅ Obtenir l'URL de l'image d'un produit
  const getProductImageUrl = (product: Produit): string | null => {
    if (imageErrors.has(product.uuid)) return null;

    if (product.image_key) {
      const url = buildImageUrl(product.image_key);
      if (url) return url;
    }

    if (product.image) {
      const url = buildImageUrl(product.image);
      if (url) return url;
    }

    return null;
  };

  // ✅ Obtenir l'URL de l'image de la catégorie
  const getCategoryImageUrl = (categorie: any): string | null => {
    if (!categorie) return null;

    if (categorie.image_key) {
      return buildImageUrl(categorie.image_key);
    }

    if (categorie.image) {
      return buildImageUrl(categorie.image);
    }

    return null;
  };

  // ✅ Adapter le produit pour le modal d'édition
  const adaptProductForModal = useCallback((product: Produit): Produit => {
    // Créer une copie du produit avec l'image garantie non-nulle
    const adaptedProduct = { ...product };

    // Si l'image est null, utiliser une image par défaut
    if (!adaptedProduct.image) {
      adaptedProduct.image = `https://via.placeholder.com/300/6f42c1/ffffff?text=${encodeURIComponent(product.libelle?.charAt(0) || "P")}`;
    }

    // S'assurer que la catégorie a une image non-nulle si elle existe
    if (adaptedProduct.categorie && !adaptedProduct.categorie.image) {
      adaptedProduct.categorie = {
        ...adaptedProduct.categorie,
        image: `https://via.placeholder.com/50/6f42c1/ffffff?text=${encodeURIComponent(adaptedProduct.categorie.libelle?.charAt(0) || "C")}`,
      };
    }

    return adaptedProduct;
  }, []);

  // Charger les détails de la boutique
  const fetchBoutique = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!boutiqueUuid) {
        throw new Error("Identifiant de boutique manquant");
      }

      const response = await api.get<Boutique>(
        API_ENDPOINTS.BOUTIQUES.DETAIL(boutiqueUuid),
      );

      setBoutique(response);
    } catch (err: any) {
      console.error("❌ Erreur lors du chargement de la boutique:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors du chargement de la boutique",
      );
    } finally {
      setLoading(false);
    }
  }, [boutiqueUuid]);

  // Charger les données au montage
  useEffect(() => {
    fetchBoutique();
  }, [fetchBoutique]);

  // Formater la date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
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

  // Formater le prix
  const formatPrice = (price: string) => {
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice)) return "0 FCFA";

    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericPrice);
  };

  // Formater la valeur totale
  const formatTotalValue = (value: number) => {
    if (isNaN(value)) return "0 FCFA";

    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculer les statistiques
  const stats = useMemo<StatsBoutique>(() => {
    if (!boutique?.produits) {
      return {
        totalProduits: 0,
        produitsPublies: 0,
        produitsBloques: 0,
        produitsEnStock: 0,
        produitsEpuises: 0,
        valeurStock: 0,
        noteMoyenne: 0,
        totalAvis: 0,
        totalFavoris: 0,
      };
    }

    const produits = boutique.produits;

    const totalProduits = produits.length;
    const produitsPublies = produits.filter((p) => p.estPublie).length;
    const produitsBloques = produits.filter((p) => p.estBloque).length;
    const produitsEnStock = produits.filter((p) => p.quantite > 0).length;
    const produitsEpuises = produits.filter((p) => p.quantite <= 0).length;

    const valeurStock = produits.reduce((sum, p) => {
      const prix = parseFloat(p.prix) || 0;
      const quantite = p.quantite || 0;
      return sum + prix * quantite;
    }, 0);

    // Calcul sécurisé de la note moyenne
    const totalNotes = produits.reduce((sum, p) => {
      const note = parseFloat(p.note_moyenne);
      return sum + (isNaN(note) ? 0 : note);
    }, 0);

    const noteMoyenne = totalProduits > 0 ? totalNotes / totalProduits : 0;

    const totalAvis = produits.reduce(
      (sum, p) => sum + (p.nombre_avis || 0),
      0,
    );
    const totalFavoris = produits.reduce(
      (sum, p) => sum + (p.nombre_favoris || 0),
      0,
    );

    return {
      totalProduits,
      produitsPublies,
      produitsBloques,
      produitsEnStock,
      produitsEpuises,
      valeurStock: isNaN(valeurStock) ? 0 : valeurStock,
      noteMoyenne: isNaN(noteMoyenne) ? 0 : parseFloat(noteMoyenne.toFixed(1)),
      totalAvis,
      totalFavoris,
    };
  }, [boutique]);

  // Filtrer et trier les produits
  const filteredProducts = useMemo(() => {
    if (!boutique?.produits) return [];

    let result = [...boutique.produits];

    // Filtrage par recherche
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (product) =>
          product.libelle?.toLowerCase().includes(term) ||
          product.description?.toLowerCase().includes(term) ||
          product.categorie?.libelle?.toLowerCase().includes(term),
      );
    }

    // Filtrage par statut
    if (statusFilter !== "all") {
      switch (statusFilter) {
        case "published":
          result = result.filter((p) => p.estPublie);
          break;
        case "blocked":
          result = result.filter((p) => p.estBloque);
          break;
        case "unpublished":
          result = result.filter((p) => !p.estPublie && !p.estBloque);
          break;
      }
    }

    // Filtrage par disponibilité
    if (availabilityFilter !== "all") {
      const isAvailable = availabilityFilter === "available";
      result = result.filter((product) => product.disponible === isAvailable);
    }

    // Tri
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === bValue) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (sortConfig.key === "prix") {
          const aPrix = parseFloat(a.prix) || 0;
          const bPrix = parseFloat(b.prix) || 0;
          return sortConfig.direction === "asc" ? aPrix - bPrix : bPrix - aPrix;
        }

        return 0;
      });
    }

    return result;
  }, [boutique, searchTerm, statusFilter, availabilityFilter, sortConfig]);

  // Fonctions de tri
  const requestSort = (key: keyof Produit) => {
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

  const getSortIcon = (key: keyof Produit) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <FontAwesomeIcon icon={faSort} className="text-muted ms-1" />;
    }
    return sortConfig.direction === "asc" ? (
      <FontAwesomeIcon icon={faSortUp} className="text-primary ms-1" />
    ) : (
      <FontAwesomeIcon icon={faSortDown} className="text-primary ms-1" />
    );
  };

  // Gestion des succès
  const handleSuccess = (message: string) => {
    setSuccessMessage(message);
    fetchBoutique();
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  // Actions sur les produits
  const handlePublishProduct = async (productUuid: string) => {
    try {
      await api.post(API_ENDPOINTS.PRODUCTS.PUBLLIER, {
        produitUuid: productUuid,
      });
      handleSuccess("Produit publié avec succès !");
    } catch (err: any) {
      console.error("❌ Erreur publication:", err);
      setError(err.response?.data?.message || "Erreur lors de la publication");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleUnpublishProduct = async (productUuid: string) => {
    try {
      await api.post(API_ENDPOINTS.PRODUCTS.PUBLLIER, {
        produitUuid: productUuid,
      });
      handleSuccess("Produit dépublié avec succès !");
    } catch (err: any) {
      console.error("❌ Erreur dépublication:", err);
      setError(
        err.response?.data?.message || "Erreur lors de la dépublication",
      );
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleToggleAvailability = async (
    productUuid: string,
    disponible: boolean,
  ) => {
    try {
      const product = boutique?.produits.find((p) => p.uuid === productUuid);
      if (!product) return;

      await api.put(API_ENDPOINTS.PRODUCTS.UPDATE_STOCK_PRODUIT(productUuid), {
        disponible: disponible,
        quantite: product.quantite,
      });

      handleSuccess(
        `Produit ${disponible ? "activé" : "désactivé"} avec succès !`,
      );
    } catch (err: any) {
      console.error("❌ Erreur disponibilité:", err);
      setError(err.response?.data?.message || "Erreur lors de la modification");
      setTimeout(() => setError(null), 5000);
    }
  };

  // Gestion de la sélection multiple
  const handleSelectProduct = (productUuid: string) => {
    setSelectedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productUuid)) {
        newSet.delete(productUuid);
      } else {
        newSet.add(productUuid);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      // Désélectionner tout
      setSelectedProducts(new Set());
      setSelectAll(false);
    } else {
      // Sélectionner tous les produits filtrés
      const allProductIds = new Set(filteredProducts.map((p) => p.uuid));
      setSelectedProducts(allProductIds);
      setSelectAll(true);
    }
  };

  const handleSelectAllOnPage = () => {
    const allOnPageSelected = filteredProducts.every((p) =>
      selectedProducts.has(p.uuid),
    );

    if (allOnPageSelected) {
      // Désélectionner tous les produits de la page
      const newSet = new Set(selectedProducts);
      filteredProducts.forEach((p) => newSet.delete(p.uuid));
      setSelectedProducts(newSet);
      setSelectAllOnPage(false);
    } else {
      // Sélectionner tous les produits de la page
      const newSet = new Set(selectedProducts);
      filteredProducts.forEach((p) => newSet.add(p.uuid));
      setSelectedProducts(newSet);
      setSelectAllOnPage(true);
    }
  };

  const handleClearSelection = () => {
    setSelectedProducts(new Set());
    setSelectAll(false);
    setSelectAllOnPage(false);
  };

  // Mettre à jour selectAll et selectAllOnPage quand selectedProducts change
  useEffect(() => {
    if (filteredProducts.length > 0) {
      const allSelected = filteredProducts.every((p) =>
        selectedProducts.has(p.uuid),
      );
      setSelectAll(allSelected);

      const anySelected = filteredProducts.some((p) =>
        selectedProducts.has(p.uuid),
      );
      setSelectAllOnPage(anySelected);
    } else {
      setSelectAll(false);
      setSelectAllOnPage(false);
    }
  }, [selectedProducts, filteredProducts]);

  // Actions en masse
  const handleBulkPublish = async () => {
    if (selectedProducts.size === 0) {
      setError("Veuillez sélectionner au moins un produit");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setBulkActionLoading(true);
      const productUuids = Array.from(selectedProducts);

      // Pour chaque produit sélectionné
      for (const productUuid of productUuids) {
        try {
          await api.post(API_ENDPOINTS.PRODUCTS.PUBLLIER, {
            produitUuid: productUuid,
          });
        } catch (err) {
          console.error(`Erreur pour le produit ${productUuid}:`, err);
        }
      }

      handleSuccess(
        `${selectedProducts.size} produit(s) publié(s) avec succès !`,
      );

      // Rafraîchir la liste et réinitialiser la sélection
      fetchBoutique();
      handleClearSelection();
    } catch (err: any) {
      console.error("Erreur lors de la publication en masse:", err);
      setError(
        err.response?.data?.message || "Erreur lors de la publication en masse",
      );
      setTimeout(() => setError(null), 5000);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkUnpublish = async () => {
    if (selectedProducts.size === 0) {
      setError("Veuillez sélectionner au moins un produit");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setBulkActionLoading(true);
      const productUuids = Array.from(selectedProducts);

      for (const productUuid of productUuids) {
        try {
          await api.post(API_ENDPOINTS.PRODUCTS.PUBLLIER, {
            produitUuid: productUuid,
          });
        } catch (err) {
          console.error(`Erreur pour le produit ${productUuid}:`, err);
        }
      }

      handleSuccess(
        `${selectedProducts.size} produit(s) dépublié(s) avec succès !`,
      );

      fetchBoutique();
      handleClearSelection();
    } catch (err: any) {
      console.error("Erreur lors de la dépublication en masse:", err);
      setError(
        err.response?.data?.message ||
          "Erreur lors de la dépublication en masse",
      );
      setTimeout(() => setError(null), 5000);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkActivate = async () => {
    if (selectedProducts.size === 0) {
      setError("Veuillez sélectionner au moins un produit");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setBulkActionLoading(true);
      const productUuids = Array.from(selectedProducts);

      for (const productUuid of productUuids) {
        try {
          const product = boutique?.produits.find(
            (p) => p.uuid === productUuid,
          );
          if (!product) continue;

          await api.put(
            API_ENDPOINTS.PRODUCTS.UPDATE_STOCK_PRODUIT(productUuid),
            {
              disponible: true,
              quantite: product.quantite,
            },
          );
        } catch (err) {
          console.error(`Erreur pour le produit ${productUuid}:`, err);
        }
      }

      handleSuccess(
        `${selectedProducts.size} produit(s) activé(s) avec succès !`,
      );

      fetchBoutique();
      handleClearSelection();
    } catch (err: any) {
      console.error("Erreur lors de l'activation en masse:", err);
      setError(
        err.response?.data?.message || "Erreur lors de l'activation en masse",
      );
      setTimeout(() => setError(null), 5000);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedProducts.size === 0) {
      setError("Veuillez sélectionner au moins un produit");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setBulkActionLoading(true);
      const productUuids = Array.from(selectedProducts);

      for (const productUuid of productUuids) {
        try {
          const product = boutique?.produits.find(
            (p) => p.uuid === productUuid,
          );
          if (!product) continue;

          await api.put(
            API_ENDPOINTS.PRODUCTS.UPDATE_STOCK_PRODUIT(productUuid),
            {
              disponible: false,
              quantite: product.quantite,
            },
          );
        } catch (err) {
          console.error(`Erreur pour le produit ${productUuid}:`, err);
        }
      }

      handleSuccess(
        `${selectedProducts.size} produit(s) désactivé(s) avec succès !`,
      );

      fetchBoutique();
      handleClearSelection();
    } catch (err: any) {
      console.error("Erreur lors de la désactivation en masse:", err);
      setError(
        err.response?.data?.message ||
          "Erreur lors de la désactivation en masse",
      );
      setTimeout(() => setError(null), 5000);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) {
      setError("Veuillez sélectionner au moins un produit");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setShowBulkDeleteModal(true);
  };

  const confirmBulkDelete = async () => {
    try {
      setBulkActionLoading(true);
      const productUuids = Array.from(selectedProducts);
      let successCount = 0;

      for (const productUuid of productUuids) {
        try {
          await api.delete(API_ENDPOINTS.PRODUCTS.DELETE(productUuid));
          successCount++;
        } catch (err) {
          console.error(`Erreur pour le produit ${productUuid}:`, err);
        }
      }

      handleSuccess(`${successCount} produit(s) supprimé(s) avec succès !`);

      fetchBoutique();
      handleClearSelection();
      setShowBulkDeleteModal(false);
    } catch (err: any) {
      console.error("Erreur lors de la suppression en masse:", err);
      setError(
        err.response?.data?.message || "Erreur lors de la suppression en masse",
      );
      setTimeout(() => setError(null), 5000);
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Réinitialiser les filtres et la sélection
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setAvailabilityFilter("all");
    setSortConfig(null);
    handleClearSelection();
  };

  // Redirection vers l'édition de la boutique
  const handleEditBoutique = () => {
    if (boutique) {
      router.push(`/dashboard/boutiques/${boutique.uuid}/edit`);
    }
  };

  // Redirection vers la création de produit
  const handleCreateProduct = () => {
    if (boutique) {
      router.push(`/dashboard/produits/create?boutique=${boutique.uuid}`);
    }
  };

  // Effet pour réinitialiser la sélection quand les filtres changent
  useEffect(() => {
    handleClearSelection();
  }, [searchTerm, statusFilter, availabilityFilter]);

  // Gestion de l'ouverture des modales View et Edit
  const handleOpenViewModal = (product: Produit) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const handleOpenEditModal = (product: Produit) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-50">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3 text-muted">Chargement de la boutique...</p>
        </div>
      </div>
    );
  }

  if (error || !boutique) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          <strong>Erreur:</strong> {error || "Boutique non trouvée"}
        </div>
        <button
          onClick={() => router.push("/dashboard/boutiques")}
          className="btn btn-primary"
        >
          <FontAwesomeIcon icon={faStore} className="me-2" />
          Retour aux boutiques
        </button>
      </div>
    );
  }

  const logoUrl = getLogoUrl(boutique);
  const banniereUrl = getBanniereUrl(boutique);
  const typeImageUrl = getTypeImageUrl(boutique.type_boutique);

  return (
    <>
      {/* Modales */}
      {selectedProduct && (
        <EditProductModal
          isOpen={showEditModal}
          product={adaptProductForModal(selectedProduct)}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProduct(null);
          }}
          onSuccess={() => handleSuccess("Produit modifié avec succès !")}
        />
      )}

      {selectedProduct && (
        <ViewProductModal
          isOpen={showViewModal}
          product={selectedProduct}
          onClose={() => {
            setShowViewModal(false);
            setSelectedProduct(null);
          }}
        />
      )}

      {/* Modal de suppression en masse */}
      <BulkDeleteModal
        show={showBulkDeleteModal}
        count={selectedProducts.size}
        loading={bulkActionLoading}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={confirmBulkDelete}
      />

      <div className="container-fluid p-3 p-md-4">
        {/* Messages d'alerte */}
        {error && (
          <div
            className="alert alert-danger alert-dismissible fade show mb-4"
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
            className="alert alert-success alert-dismissible fade show mb-4"
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

        {/* En-tête de la boutique */}
        <div className="card border-0 shadow-sm overflow-hidden mb-4">
          {/* Bannière */}
          <div
            className="position-relative"
            style={{
              height: "300px",
              backgroundImage: `url(${banniereUrl || "https://via.placeholder.com/1200x300/cccccc/ffffff?text=Bannière"})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="position-absolute bottom-0 start-0 w-100 bg-dark bg-opacity-50 p-4 text-white">
              <div className="d-flex align-items-end gap-4">
                {/* Logo */}
                <div
                  className="position-relative"
                  style={{ marginTop: "-80px" }}
                >
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={boutique.nom}
                      className="rounded-circle border border-4 border-white shadow"
                      style={{
                        width: "160px",
                        height: "160px",
                        objectFit: "cover",
                      }}
                      onError={(e) => handleImageError(boutique.uuid, e)}
                    />
                  ) : (
                    <div
                      className="rounded-circle border border-4 border-white shadow d-flex align-items-center justify-content-center bg-secondary"
                      style={{
                        width: "160px",
                        height: "160px",
                        backgroundColor: "#6c757d",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faStore}
                        className="text-white"
                        style={{ fontSize: "3rem" }}
                      />
                    </div>
                  )}
                </div>

                {/* Informations */}
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-3 mb-2">
                    <h1 className="h2 mb-0 fw-bold">{boutique.nom}</h1>
                    <BoutiqueStatusBadge statut={boutique.statut} />
                    {boutique.est_bloque && (
                      <span className="badge bg-danger">
                        <FontAwesomeIcon icon={faBan} className="me-1" />
                        Bloqué
                      </span>
                    )}
                    {boutique.est_ferme && (
                      <span className="badge bg-warning">
                        <FontAwesomeIcon icon={faLock} className="me-1" />
                        Fermé
                      </span>
                    )}
                  </div>

                  <p className="mb-3 opacity-75">
                    {boutique.description || "Aucune description"}
                  </p>

                  <div className="d-flex flex-wrap gap-3">
                    <div className="d-flex align-items-center gap-2">
                      <FontAwesomeIcon icon={faStoreAlt} />
                      <span>{boutique.type_boutique.libelle}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <FontAwesomeIcon icon={faCalendar} />
                      <span>Créée le {formatDate(boutique.created_at)}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <FontAwesomeIcon icon={faBoxes} />
                      <span>{stats.totalProduits} produits</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="d-flex gap-2">
                  <button
                    onClick={handleEditBoutique}
                    className="btn btn-outline-light d-flex align-items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                    <span className="d-none d-md-inline">Modifier</span>
                  </button>
                  <button
                    onClick={() => handleCreateProduct()}
                    className="btn btn-success d-flex align-items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    <span className="d-none d-md-inline">Ajouter produit</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="row g-4 mb-4">
          <div className="col-md-3 col-sm-6">
            <StatCard
              title="Produits"
              value={stats.totalProduits}
              icon={faBoxes}
              color="primary"
              subtitle={`${stats.produitsPublies} publiés`}
            />
          </div>
          <div className="col-md-3 col-sm-6">
            <StatCard
              title="Valeur du stock"
              value={formatTotalValue(stats.valeurStock)}
              icon={faMoneyBillWave}
              color="success"
              subtitle={`${stats.produitsEnStock} en stock`}
            />
          </div>
          <div className="col-md-3 col-sm-6">
            <StatCard
              title="Note moyenne"
              value={stats.noteMoyenne}
              icon={faStar}
              color="warning"
              subtitle={`${stats.totalAvis} avis`}
            />
          </div>
          <div className="col-md-3 col-sm-6">
            <StatCard
              title="Favoris"
              value={stats.totalFavoris}
              icon={faHeart}
              color="danger"
              subtitle={`${stats.produitsBloques} bloqués`}
            />
          </div>
        </div>

        {/* Informations détaillées */}
        <div className="row g-4 mb-4">
          <div className="col-lg-8">
            {/* Section produits */}
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white border-0 py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <h3 className="h5 mb-0 fw-bold">
                    <FontAwesomeIcon icon={faShoppingBag} className="me-2" />
                    Produits de la boutique
                  </h3>
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-primary">
                      {filteredProducts.length} produit(s)
                    </span>
                    {selectedProducts.size > 0 && (
                      <span className="badge bg-warning">
                        {selectedProducts.size} sélectionné(s)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Barre d'actions en masse */}
              {selectedProducts.size > 0 && (
                <BulkActionBar
                  selectedCount={selectedProducts.size}
                  totalCount={filteredProducts.length}
                  loading={bulkActionLoading}
                  onPublish={handleBulkPublish}
                  onUnpublish={handleBulkUnpublish}
                  onActivate={handleBulkActivate}
                  onDeactivate={handleBulkDeactivate}
                  onDelete={handleBulkDelete}
                  onClearSelection={handleClearSelection}
                />
              )}

              <div className="card-body">
                {/* Filtres */}
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <FontAwesomeIcon
                          icon={faSearch}
                          className="text-muted"
                        />
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 ps-0"
                        placeholder="Rechercher un produit..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <select
                      className="form-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="published">Publiés</option>
                      <option value="unpublished">Non publiés</option>
                      <option value="blocked">Bloqués</option>
                    </select>
                  </div>

                  <div className="col-md-3">
                    <select
                      className="form-select"
                      value={availabilityFilter}
                      onChange={(e) => setAvailabilityFilter(e.target.value)}
                    >
                      <option value="all">Tous</option>
                      <option value="available">Disponibles</option>
                      <option value="unavailable">Indisponibles</option>
                    </select>
                  </div>

                  <div className="col-md-2">
                    <button
                      onClick={resetFilters}
                      className="btn btn-outline-secondary w-100"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                      <span className="d-none d-md-inline ms-1">Reset</span>
                    </button>
                  </div>
                </div>

                {/* Options de sélection */}
                <BulkSelectionControls
                  selectAll={selectAll}
                  selectAllOnPage={selectAllOnPage}
                  onSelectAll={handleSelectAll}
                  onSelectAllOnPage={handleSelectAllOnPage}
                  selectedCount={selectedProducts.size}
                  totalCount={filteredProducts.length}
                  disabled={filteredProducts.length === 0 || bulkActionLoading}
                />

                {/* Liste des produits */}
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-5">
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="fs-1 mb-3 text-muted"
                    />
                    <h5 className="alert-heading">Aucun produit trouvé</h5>
                    <p className="mb-0">
                      {searchTerm ||
                      statusFilter !== "all" ||
                      availabilityFilter !== "all"
                        ? "Aucun produit ne correspond à vos critères."
                        : "Cette boutique n'a pas encore de produits."}
                    </p>
                    {boutique.produits.length === 0 && (
                      <button
                        onClick={() => handleCreateProduct()}
                        className="btn btn-primary mt-3"
                      >
                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                        Ajouter votre premier produit
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: "50px" }} className="text-center">
                            <div className="form-check d-flex justify-content-center">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={
                                  selectAll && filteredProducts.length > 0
                                }
                                onChange={handleSelectAll}
                                disabled={filteredProducts.length === 0}
                                title={
                                  selectAll
                                    ? "Tout désélectionner"
                                    : "Tout sélectionner"
                                }
                              />
                            </div>
                          </th>
                          <th style={{ width: "80px" }}>Image</th>
                          <th>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                              onClick={() => requestSort("libelle")}
                            >
                              Nom
                              {getSortIcon("libelle")}
                            </button>
                          </th>
                          <th>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                              onClick={() => requestSort("prix")}
                            >
                              Prix
                              {getSortIcon("prix")}
                            </button>
                          </th>
                          <th>Statut</th>
                          <th>Disponibilité</th>
                          <th>Stock</th>
                          <th style={{ width: "320px" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((product) => {
                          const isSelected = selectedProducts.has(product.uuid);
                          const productImageUrl = getProductImageUrl(product);

                          return (
                            <tr
                              key={product.uuid}
                              className={`align-middle ${isSelected ? "table-active" : ""}`}
                              onClick={(e) => {
                                // Ne pas sélectionner si on clique sur un bouton
                                if (
                                  (e.target as HTMLElement).closest(
                                    "button, a, .btn, .dropdown",
                                  )
                                ) {
                                  return;
                                }
                                handleSelectProduct(product.uuid);
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              <td
                                className="text-center"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="form-check d-flex justify-content-center">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      handleSelectProduct(product.uuid);
                                    }}
                                  />
                                </div>
                              </td>
                              <td>
                                {productImageUrl ? (
                                  <img
                                    src={productImageUrl}
                                    alt={product.libelle}
                                    className="rounded"
                                    style={{
                                      width: "60px",
                                      height: "60px",
                                      objectFit: "cover",
                                    }}
                                    onError={(e) =>
                                      handleImageError(product.uuid, e)
                                    }
                                  />
                                ) : (
                                  <div
                                    className="rounded bg-secondary bg-opacity-10 d-flex align-items-center justify-content-center"
                                    style={{
                                      width: "60px",
                                      height: "60px",
                                    }}
                                  >
                                    <FontAwesomeIcon
                                      icon={faImage}
                                      className="text-muted"
                                    />
                                  </div>
                                )}
                              </td>
                              <td>
                                <div className="fw-semibold">
                                  {product.libelle || "Sans nom"}
                                </div>
                                {product.categorie && (
                                  <small className="text-muted">
                                    {product.categorie.libelle}
                                  </small>
                                )}
                              </td>
                              <td className="fw-bold text-success">
                                {formatPrice(product.prix)}
                              </td>
                              <td>
                                <ProductStatusBadge
                                  statut={product.statut}
                                  estPublie={product.estPublie}
                                  estBloque={product.estBloque}
                                />
                              </td>
                              <td>
                                <ProductAvailabilityBadge
                                  disponible={product.disponible}
                                />
                              </td>
                              <td>
                                <span
                                  className={`badge ${product.quantite > 0 ? "bg-success" : "bg-danger"}`}
                                >
                                  {product.quantite || 0}
                                </span>
                              </td>
                              <td onClick={(e) => e.stopPropagation()}>
                                <ProductActionsButtons
                                  product={product}
                                  isSelected={isSelected}
                                  onView={() => handleOpenViewModal(product)}
                                  onEdit={() => handleOpenEditModal(product)}
                                  onPublish={() =>
                                    handlePublishProduct(product.uuid)
                                  }
                                  onUnpublish={() =>
                                    handleUnpublishProduct(product.uuid)
                                  }
                                  onToggleAvailability={() =>
                                    handleToggleAvailability(
                                      product.uuid,
                                      !product.disponible,
                                    )
                                  }
                                  onSelectProduct={() =>
                                    handleSelectProduct(product.uuid)
                                  }
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            {/* Informations sur la boutique */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-0 py-3">
                <h4 className="h6 mb-0 fw-bold">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  Informations
                </h4>
              </div>
              <div className="card-body">
                <ul className="list-group list-group-flush">
                  <li className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 py-2">
                    <span className="text-muted">Type de boutique:</span>
                    <span className="fw-semibold">
                      {boutique.type_boutique.libelle}
                    </span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 py-2">
                    <span className="text-muted">Statut:</span>
                    <BoutiqueStatusBadge statut={boutique.statut} />
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 py-2">
                    <span className="text-muted">Créée le:</span>
                    <span>{formatDate(boutique.created_at)}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 py-2">
                    <span className="text-muted">Modifiée le:</span>
                    <span>{formatDate(boutique.updated_at)}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 py-2">
                    <span className="text-muted">Vendeur:</span>
                    <code>{boutique.vendeurUuid || "N/A"}</code>
                  </li>
                </ul>
              </div>
            </div>

            {/* Type de boutique */}
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-0 py-3">
                <h4 className="h6 mb-0 fw-bold">
                  <FontAwesomeIcon icon={faTags} className="me-2" />
                  Type de boutique
                </h4>
              </div>
              <div className="card-body">
                <div className="d-flex align-items-start gap-3">
                  {typeImageUrl ? (
                    <img
                      src={typeImageUrl}
                      alt={boutique.type_boutique.libelle}
                      className="rounded"
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          `https://via.placeholder.com/80/cccccc/ffffff?text=${boutique.type_boutique.libelle.charAt(0)}`;
                      }}
                    />
                  ) : (
                    <div
                      className="rounded d-flex align-items-center justify-content-center bg-secondary bg-opacity-10"
                      style={{
                        width: "80px",
                        height: "80px",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faTags}
                        className="text-muted"
                        style={{ fontSize: "2rem" }}
                      />
                    </div>
                  )}
                  <div>
                    <h5 className="fw-bold mb-1">
                      {boutique.type_boutique.libelle}
                    </h5>
                    <p className="small text-muted mb-2">
                      {boutique.type_boutique.code || "N/A"}
                    </p>
                    <div className="d-flex flex-wrap gap-2">
                      {boutique.type_boutique.peut_vendre_produits && (
                        <span className="badge bg-success bg-opacity-10 text-success">
                          Vente produits
                        </span>
                      )}
                      {boutique.type_boutique.peut_vendre_biens && (
                        <span className="badge bg-primary bg-opacity-10 text-primary">
                          Vente biens
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sélection multiple - Actions rapides */}
            {selectedProducts.size > 0 && (
              <div className="card border-0 shadow-sm mt-4 border-primary">
                <div className="card-header bg-white border-primary border-0 py-3">
                  <h4 className="h6 mb-0 fw-bold text-primary">
                    <FontAwesomeIcon icon={faListCheck} className="me-2" />
                    Actions rapides
                  </h4>
                </div>
                <div className="card-body">
                  <div className="d-grid gap-2">
                    <button
                      className="btn btn-success d-flex align-items-center justify-content-center gap-2"
                      onClick={handleBulkPublish}
                      disabled={bulkActionLoading}
                    >
                      <FontAwesomeIcon icon={faCloudUpload} />
                      Publier ({selectedProducts.size})
                    </button>
                    <button
                      className="btn btn-secondary d-flex align-items-center justify-content-center gap-2"
                      onClick={handleBulkUnpublish}
                      disabled={bulkActionLoading}
                    >
                      <FontAwesomeIcon icon={faCloudDownload} />
                      Dépublier ({selectedProducts.size})
                    </button>
                    <button
                      className="btn btn-outline-success d-flex align-items-center justify-content-center gap-2"
                      onClick={handleBulkActivate}
                      disabled={bulkActionLoading}
                    >
                      <FontAwesomeIcon icon={faToggleOn} />
                      Activer ({selectedProducts.size})
                    </button>
                    <button
                      className="btn btn-outline-warning d-flex align-items-center justify-content-center gap-2"
                      onClick={handleBulkDeactivate}
                      disabled={bulkActionLoading}
                    >
                      <FontAwesomeIcon icon={faToggleOff} />
                      Désactiver ({selectedProducts.size})
                    </button>
                    <button
                      className="btn btn-outline-danger d-flex align-items-center justify-content-center gap-2"
                      onClick={() => setShowBulkDeleteModal(true)}
                      disabled={bulkActionLoading}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                      Supprimer ({selectedProducts.size})
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <button
            onClick={() => router.push("/dashboard/boutiques")}
            className="btn btn-outline-secondary"
          >
            <FontAwesomeIcon icon={faStore} className="me-2" />
            Retour aux boutiques
          </button>

          <div className="d-flex gap-2">
            <button onClick={handleEditBoutique} className="btn btn-primary">
              <FontAwesomeIcon icon={faEdit} className="me-2" />
              Modifier la boutique
            </button>
            <button
              onClick={() => handleCreateProduct()}
              className="btn btn-success"
            >
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Ajouter un produit
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .card {
          transition: transform 0.2s ease-in-out;
        }
        .card:hover {
          transform: translateY(-2px);
        }
        .table > :not(caption) > * > * {
          padding: 0.75rem 0.5rem;
          vertical-align: middle;
        }
        .table th {
          font-weight: 600;
          background-color: #f8f9fa;
          border-bottom: 2px solid #dee2e6;
        }
        .badge {
          font-weight: 500;
        }
        .list-group-item {
          background-color: transparent;
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
        .btn-group-sm > .btn {
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
        }
        .table tbody tr:hover {
          background-color: rgba(0, 0, 0, 0.02) !important;
        }
        .table tbody tr.table-active:hover {
          background-color: rgba(13, 110, 253, 0.1) !important;
        }
        .dropdown-menu {
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(0, 0, 0, 0.1);
        }
        .progress {
          background-color: rgba(0, 0, 0, 0.1);
        }
        .btn-sm {
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
          line-height: 1.5;
        }
        .btn-outline-primary:hover,
        .btn-outline-warning:hover,
        .btn-outline-success:hover,
        .btn-outline-secondary:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </>
  );
}
