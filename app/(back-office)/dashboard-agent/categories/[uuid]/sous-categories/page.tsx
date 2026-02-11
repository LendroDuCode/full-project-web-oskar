"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
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
  faTags,
  faImage,
  faCalendar,
  faCheckCircle,
  faInfoCircle,
  faTimesCircle,
  faChartBar,
  faLayerGroup,
  faBoxOpen,
  faGift,
  faExchangeAlt,
  faBullhorn,
  faSlidersH,
  faCheckSquare,
  faSquare,
  faCheck,
  faTimes,
  faBan,
  faUsers,
  faEllipsisV,
  faCheckDouble,
  faHome,
  faCube,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import colors from "@/app/shared/constants/colors";
import CreateSubCategoryModal from "./components/modals/CreateSubCategoryModal";
import ViewCategoryModal from "./components/modals/ViewCategoryModal";

// Types
interface Category {
  id: number;
  uuid: string;
  type: string;
  libelle: string;
  slug: string;
  description?: string;
  image: string;
  statut?: string;
  is_deleted: boolean;
  deleted_at?: string | null;
  createdAt?: string;
  updatedAt?: string;
  path?: string | null;
  depth?: number | null;
  parent?: Category;
  elements?: any[];
  counts?: {
    produits: number;
    dons: number;
    echanges: number;
    annonces: number;
    total: number;
  };
}

interface SubCategory {
  uuid: string;
  libelle: string;
  type: string;
  slug: string;
  description?: string;
  image?: string;
  statut?: string;
  createdAt?: string;
  updatedAt?: string;
  path?: string;
  depth?: number;
  is_deleted?: boolean;
  deleted_at?: string | null;
  parent?: Category;
  elements?: any[];
  counts?: {
    produits: number;
    dons: number;
    echanges: number;
    annonces: number;
    total: number;
  };
}

interface ApiSubCategoryResponse {
  success: boolean;
  message?: string;
  count?: number;
  data?: SubCategory[];
  sousCategories?: SubCategory[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// CORRECTION: Remplacer totalPages par pages dans l'interface
interface PaginationData {
  page: number;
  pages: number; // Changé de totalPages à pages pour la cohérence
  limit: number;
  total: number;
}

// Composants réutilisables
const StatusBadge = ({ statut }: { statut?: string }) => {
  if (!statut || statut === "actif") {
    return (
      <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 d-inline-flex align-items-center gap-1">
        <FontAwesomeIcon icon={faCheckCircle} className="fs-12" />
        <span>Actif</span>
      </span>
    );
  }

  return (
    <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 d-inline-flex align-items-center gap-1">
      <FontAwesomeIcon icon={faTimesCircle} className="fs-12" />
      <span>Inactif</span>
    </span>
  );
};

const TypeBadge = ({ type }: { type: string }) => {
  const getTypeInfo = (type: string) => {
    const lowerType = type.toLowerCase();

    if (lowerType.includes("produit") || lowerType.includes("alimentation")) {
      return {
        icon: faBoxOpen,
        color: colors.oskar.blue,
        label: type,
      };
    }

    if (lowerType.includes("don")) {
      return {
        icon: faGift,
        color: colors.oskar.green,
        label: type,
      };
    }

    if (lowerType.includes("échange")) {
      return {
        icon: faExchangeAlt,
        color: colors.oskar.purple,
        label: type,
      };
    }

    if (lowerType.includes("annonce")) {
      return {
        icon: faBullhorn,
        color: colors.oskar.orange,
        label: type,
      };
    }

    return {
      icon: faTags,
      color: colors.oskar.grey,
      label: type,
    };
  };

  const typeInfo = getTypeInfo(type);

  return (
    <span
      className="badge d-inline-flex align-items-center gap-2"
      style={{
        backgroundColor: `${typeInfo.color}15`,
        color: typeInfo.color,
        border: `1px solid ${typeInfo.color}30`,
        padding: "0.4rem 0.75rem",
        fontSize: "0.75rem",
      }}
    >
      <FontAwesomeIcon icon={typeInfo.icon} className="fs-12" />
      <span>{typeInfo.label}</span>
    </span>
  );
};

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

const DeleteModal = ({
  show,
  subCategory,
  loading,
  onClose,
  onConfirm,
  type = "single",
  count = 0,
}: {
  show: boolean;
  subCategory: SubCategory | null;
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
            {type === "single" && subCategory ? (
              <>
                <p className="mb-3">
                  Êtes-vous sûr de vouloir supprimer la sous-catégorie{" "}
                  <strong>{subCategory.libelle}</strong> ?
                </p>
                <div className="text-danger">
                  <small>
                    Cette action est irréversible. Toutes les données associées
                    à cette sous-catégorie seront perdues.
                  </small>
                </div>
              </>
            ) : (
              <>
                <p className="mb-3">
                  Êtes-vous sûr de vouloir supprimer{" "}
                  <strong>{count} sous-catégorie(s)</strong> ?
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
                    ? `Supprimer ${count} sous-catégorie(s)`
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
          <span className="fw-semibold">{totalItems}</span> sous-catégories
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

// API endpoints
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005";

const API_ENDPOINTS = {
  CATEGORIES: {
    LIST: `${API_BASE_URL}/categories`,
    DETAIL: (uuid: string) => `${API_BASE_URL}/categories/${uuid}`,
    LISTE_SOUS_CATEGORIE: (uuid: string) =>
      `${API_BASE_URL}/categories/${uuid}/liste-sous-categories`,
    DELETE: (uuid: string) => `${API_BASE_URL}/categories/${uuid}`,
    UPDATE: (uuid: string) => `${API_BASE_URL}/categories/modifier/${uuid}`,
    CREATE_SOUS_CATEGORIE: (uuid: string) =>
      `${API_BASE_URL}/categories/${uuid}/sous-categories`,
  },
};

export default function SubCategoriesPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();

  console.log("🔍 Debug params:", params);
  console.log("🔍 Debug pathname:", pathname);

  // Extraction de parentUuid - CORRIGÉ
  const getParentUuid = (): string | null => {
    // Dans une route dynamique [uuid]/sous-categories, l'UUID est dans params.uuid
    if (params?.uuid) {
      const uuid = Array.isArray(params.uuid) ? params.uuid[0] : params.uuid;
      console.log("✅ UUID extrait de params:", uuid);
      return uuid;
    }

    // Essayer de l'extraire du pathname
    if (pathname) {
      const segments = pathname.split("/");
      const uuidIndex = segments.findIndex((seg) => seg === "categories") + 1;
      if (uuidIndex > 0 && uuidIndex < segments.length) {
        const uuid = segments[uuidIndex];
        if (uuid && uuid !== "sous-categories") {
          console.log("✅ UUID extrait de pathname:", uuid);
          return uuid;
        }
      }
    }

    console.log("⚠️ Aucun UUID trouvé dans params ou pathname");
    return null;
  };

  const parentUuid = getParentUuid();

  // États
  const [parentCategory, setParentCategory] = useState<Category | null>(null);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(!!parentUuid);
  const [loadingParent, setLoadingParent] = useState(!!parentUuid);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // États pour les modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteMultipleModal, setShowDeleteMultipleModal] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] =
    useState<SubCategory | null>(null);

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof SubCategory;
    direction: "asc" | "desc";
  } | null>(null);

  // CORRECTION: Mise à jour de l'initialisation de pagination
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1, // Changé de totalPages à pages
  });

  // États pour la sélection multiple
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>(
    [],
  );
  const [selectAll, setSelectAll] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fonction utilitaire pour traiter la réponse API
  const processApiResponse = (
    response: ApiSubCategoryResponse,
  ): {
    subCategories: SubCategory[];
    pagination: PaginationData | null;
  } => {
    let subCats: SubCategory[] = [];
    let paginationData: PaginationData | null = null;

    // Format 1: Tableau direct dans data
    if (Array.isArray(response.data)) {
      subCats = response.data;
      console.log(
        `✅ ${response.count || subCats.length} sous-catégories extraites (format 1)`,
      );
    }
    // Format 2: Objet avec sousCategories et pagination
    else if (
      response.sousCategories &&
      Array.isArray(response.sousCategories)
    ) {
      subCats = response.sousCategories;
      console.log(
        `✅ ${response.sousCategories.length} sous-catégories extraites (format 2)`,
      );

      if (response.pagination) {
        // CORRECTION: Convertir totalPages en pages
        paginationData = {
          page: response.pagination.page,
          limit: response.pagination.limit,
          total: response.pagination.total,
          pages: response.pagination.totalPages, // Conversion de totalPages à pages
        };
        console.log(
          "📊 Pagination reçue de l'API (convertie):",
          paginationData,
        );
      }
    }
    // Format 3: data est un objet avec sousCategories et pagination
    else if (
      response.data &&
      typeof response.data === "object" &&
      !Array.isArray(response.data)
    ) {
      const dataObj = response.data as any;
      if (dataObj.sousCategories && Array.isArray(dataObj.sousCategories)) {
        subCats = dataObj.sousCategories;
        console.log(
          `✅ ${dataObj.sousCategories.length} sous-catégories extraites (format 3)`,
        );

        if (dataObj.pagination) {
          // CORRECTION: Convertir totalPages en pages
          paginationData = {
            page: dataObj.pagination.page,
            limit: dataObj.pagination.limit,
            total: dataObj.pagination.total,
            pages: dataObj.pagination.totalPages, // Conversion de totalPages à pages
          };
          console.log(
            "📊 Pagination reçue de l'API (format 3 convertie):",
            paginationData,
          );
        }
      }
    }
    // Format 4: Réponse directe (sous-catégories dans le root)
    else if (Array.isArray(response)) {
      subCats = response;
      console.log(`✅ ${response.length} sous-catégories extraites (format 4)`);
    } else {
      console.warn("⚠️ Format de réponse inattendu:", response);
    }

    return {
      subCategories: subCats,
      pagination: paginationData,
    };
  };

  // Charger les données
  useEffect(() => {
    if (!parentUuid) {
      console.error(
        "❌ parentUuid manquant - Vérifiez la structure de vos routes",
      );
      setError("URL invalide. Veuillez vérifier le lien.");
      setLoading(false);
      setLoadingParent(false);
      return;
    }

    const fetchAllData = async () => {
      try {
        setLoadingParent(true);
        setLoading(true);
        setError(null);

        console.log("📡 Chargement catégorie parente... UUID:", parentUuid);

        // 1. Charger la catégorie parente
        const parentResponse = await api.get<Category>(
          API_ENDPOINTS.CATEGORIES.DETAIL(parentUuid),
        );
        console.log("✅ Catégorie parente chargée:", parentResponse);
        setParentCategory(parentResponse);
        setLoadingParent(false);

        // 2. Charger les sous-catégories
        console.log("📡 Chargement sous-catégories...");
        console.log(
          "🔗 Endpoint:",
          API_ENDPOINTS.CATEGORIES.LISTE_SOUS_CATEGORIE(parentUuid),
        );

        const subCatResponse = await api.get<ApiSubCategoryResponse>(
          API_ENDPOINTS.CATEGORIES.LISTE_SOUS_CATEGORIE(parentUuid),
        );

        console.log("✅ Réponse API sous-catégories:", subCatResponse);

        // Traiter la réponse avec notre fonction utilitaire
        const { subCategories: subCats, pagination: paginationData } =
          processApiResponse(subCatResponse);

        setSubCategories(subCats);

        // CORRECTION: Mettre à jour la pagination avec la propriété correcte
        if (paginationData) {
          setPagination(paginationData);
        } else {
          // Calculer la pagination localement
          const total = subCats.length;
          const pages = Math.ceil(total / pagination.limit) || 1;

          setPagination({
            page: 1,
            limit: pagination.limit,
            total: total,
            pages: pages,
          });
        }

        // Réinitialiser la sélection
        setSelectedSubCategories([]);
        setSelectAll(false);
        setLoading(false);
      } catch (err: any) {
        console.error("❌ Erreur lors du chargement:", err);

        let errorMessage = "Erreur lors du chargement des données.";

        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.message) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        setLoading(false);
        setLoadingParent(false);
      }
    };

    fetchAllData();
  }, [parentUuid]);

  // Gestion succès
  const handleSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      if (parentUuid) {
        fetchData();
      }
    }, 100);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Fonction de rafraîchissement
  const fetchData = async () => {
    if (!parentUuid) return;

    try {
      setLoading(true);
      setLoadingParent(true);
      setError(null);

      // Charger la catégorie parente
      const parentResponse = await api.get<Category>(
        API_ENDPOINTS.CATEGORIES.DETAIL(parentUuid),
      );
      setParentCategory(parentResponse);
      setLoadingParent(false);

      // Charger les sous-catégories
      const subCatResponse = await api.get<ApiSubCategoryResponse>(
        API_ENDPOINTS.CATEGORIES.LISTE_SOUS_CATEGORIE(parentUuid),
      );

      // Traiter la réponse
      const { subCategories: subCats, pagination: paginationData } =
        processApiResponse(subCatResponse);

      setSubCategories(subCats);

      // CORRECTION: Mettre à jour la pagination correctement
      if (paginationData) {
        setPagination(paginationData);
      } else {
        const total = subCats.length;
        const pages = Math.ceil(total / pagination.limit) || 1;

        setPagination((prev) => ({
          ...prev,
          total: total,
          pages: pages,
          page: 1, // Retour à la première page
        }));
      }

      setLoading(false);
    } catch (err: any) {
      console.error("❌ Erreur rafraîchissement:", err);
      setError(
        err.response?.data?.message || "Erreur lors du rafraîchissement",
      );
      setLoading(false);
      setLoadingParent(false);
    }
  };

  // Suppression d'une sous-catégorie
  const handleDelete = async () => {
    if (!selectedSubCategory) return;

    try {
      setDeleteLoading(true);
      await api.delete(
        API_ENDPOINTS.CATEGORIES.DELETE(selectedSubCategory.uuid),
      );

      setShowDeleteModal(false);
      setSelectedSubCategory(null);
      handleSuccess("Sous-catégorie supprimée avec succès !");
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
    if (selectedSubCategories.length === 0) return;

    try {
      setDeleteLoading(true);
      let successCount = 0;
      let errorCount = 0;

      for (const subCategoryUuid of selectedSubCategories) {
        try {
          await api.delete(API_ENDPOINTS.CATEGORIES.DELETE(subCategoryUuid));
          successCount++;
        } catch (err) {
          console.error(
            `Erreur pour la sous-catégorie ${subCategoryUuid}:`,
            err,
          );
          errorCount++;
        }
      }

      setShowDeleteMultipleModal(false);
      setSuccessMessage(
        `${successCount} sous-catégorie(s) supprimée(s) avec succès${errorCount > 0 ? ` (${errorCount} échec(s))` : ""}`,
      );

      setTimeout(() => {
        if (parentUuid) {
          fetchData();
        }
      }, 100);

      setTimeout(() => setSuccessMessage(null), 3000);

      // Réinitialiser la sélection
      setSelectedSubCategories([]);
      setSelectAll(false);
    } catch (err: any) {
      console.error("❌ Erreur suppression multiple:", err);
      setError("Erreur lors de la suppression multiple");
      setTimeout(() => setError(null), 3000);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Ouvrir modal de suppression
  const openDeleteModal = (subCategory: SubCategory) => {
    setSelectedSubCategory(subCategory);
    setShowDeleteModal(true);
  };

  // Ouvrir modal de suppression multiple
  const openDeleteMultipleModal = () => {
    if (selectedSubCategories.length === 0) {
      setInfoMessage("Veuillez sélectionner au moins une sous-catégorie");
      setTimeout(() => setInfoMessage(null), 3000);
      return;
    }
    setShowDeleteMultipleModal(true);
  };

  // Fonctions de tri
  const requestSort = (key: keyof SubCategory) => {
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

  const getSortIcon = (key: keyof SubCategory) => {
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

  // Filtrage et tri
  const filteredSubCategories = useMemo(() => {
    let filtered = [...subCategories];

    // Filtre par recherche
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (cat) =>
          cat.libelle?.toLowerCase().includes(term) ||
          cat.description?.toLowerCase().includes(term) ||
          cat.type?.toLowerCase().includes(term) ||
          cat.slug?.toLowerCase().includes(term),
      );
    }

    // Filtre par statut
    if (selectedStatus !== "all") {
      filtered = filtered.filter(
        (cat) =>
          (selectedStatus === "actif" &&
            (!cat.statut || cat.statut === "actif")) ||
          (selectedStatus === "inactif" && cat.statut === "inactif"),
      );
    }

    // Filtre par type
    if (selectedType !== "all") {
      filtered = filtered.filter(
        (cat) => cat.type?.toLowerCase() === selectedType.toLowerCase(),
      );
    }

    // Tri
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue === bValue) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;
        if (sortConfig.direction === "asc") return aValue < bValue ? -1 : 1;
        return aValue > bValue ? -1 : 1;
      });
    }

    return filtered;
  }, [subCategories, searchTerm, selectedStatus, selectedType, sortConfig]);

  // Pagination
  const currentItems = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    return filteredSubCategories.slice(
      startIndex,
      startIndex + pagination.limit,
    );
  }, [filteredSubCategories, pagination.page, pagination.limit]);

  // CORRECTION: Mise à jour de la pagination avec useEffect
  useEffect(() => {
    const total = filteredSubCategories.length;
    const pages = Math.ceil(total / pagination.limit) || 1;
    const page = Math.min(pagination.page, pages) || 1;

    setPagination((prev) => ({
      ...prev,
      total,
      pages,
      page,
    }));
  }, [filteredSubCategories, pagination.limit]);

  // Gestion de la sélection multiple
  const handleSelectSubCategory = (uuid: string) => {
    setSelectedSubCategories((prev) => {
      if (prev.includes(uuid)) {
        return prev.filter((id) => id !== uuid);
      } else {
        return [...prev, uuid];
      }
    });
  };

  const handleSelectAllOnPage = () => {
    const pageUuids = currentItems.map((cat) => cat.uuid);
    const allSelected = pageUuids.every((id) =>
      selectedSubCategories.includes(id),
    );

    if (allSelected) {
      // Désélectionner toutes les catégories de la page
      setSelectedSubCategories((prev) =>
        prev.filter((id) => !pageUuids.includes(id)),
      );
    } else {
      // Sélectionner toutes les catégories de la page
      const newSelection = [
        ...new Set([...selectedSubCategories, ...pageUuids]),
      ];
      setSelectedSubCategories(newSelection);
    }
  };

  // Mise à jour de selectAll
  useEffect(() => {
    if (currentItems.length > 0) {
      const allSelected = currentItems.every((cat) =>
        selectedSubCategories.includes(cat.uuid),
      );
      setSelectAll(allSelected);
    } else {
      setSelectAll(false);
    }
  }, [selectedSubCategories, currentItems]);

  // Actions en masse
  const handleBulkAction = async (
    action: "activate" | "deactivate" | "delete",
  ) => {
    if (selectedSubCategories.length === 0) {
      setInfoMessage("Veuillez sélectionner au moins une sous-catégorie");
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

      for (const subCategoryUuid of selectedSubCategories) {
        try {
          await api.put(API_ENDPOINTS.CATEGORIES.UPDATE(subCategoryUuid), {
            statut: action === "activate" ? "actif" : "inactif",
          });
          successCount++;
        } catch (err) {
          console.error(
            `Erreur pour la sous-catégorie ${subCategoryUuid}:`,
            err,
          );
          errorCount++;
        }
      }

      setSuccessMessage(
        `${successCount} sous-catégorie(s) ${action === "activate" ? "activée(s)" : "désactivée(s)"} avec succès${errorCount > 0 ? ` (${errorCount} échec(s))` : ""}`,
      );

      setTimeout(() => {
        if (parentUuid) {
          fetchData();
        }
      }, 100);

      setTimeout(() => setSuccessMessage(null), 3000);

      // Réinitialiser la sélection
      setSelectedSubCategories([]);
      setSelectAll(false);
    } catch (err) {
      console.error("Erreur lors de l'action en masse:", err);
      setError("Erreur lors de l'action en masse");
      setTimeout(() => setError(null), 3000);
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setSelectedType("all");
    setSortConfig(null);
    setPagination((prev) => ({ ...prev, page: 1 }));
    setSelectedSubCategories([]);
    setSelectAll(false);
  };

  // Statistiques
  const stats = useMemo(() => {
    const total = subCategories.length;
    const active = subCategories.filter(
      (c) => !c.statut || c.statut === "actif",
    ).length;
    const totalElements = subCategories.reduce(
      (sum, cat) => sum + (cat.counts?.total || 0),
      0,
    );

    // Compter par type
    const types = Array.from(
      new Set(subCategories.map((cat) => cat.type).filter(Boolean)),
    );
    const typeCounts = types.reduce(
      (acc, type) => {
        acc[type] = subCategories.filter((cat) => cat.type === type).length;
        return acc;
      },
      {} as Record<string, number>,
    );

    return { total, active, totalElements, typeCounts };
  }, [subCategories]);

  // Types uniques pour le filtre
  const uniqueTypes = useMemo(() => {
    const types = Array.from(
      new Set(subCategories.map((c) => c.type).filter(Boolean)),
    );
    return types.filter((type) => type && type.trim() !== "");
  }, [subCategories]);

  // Format de date
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
          });
    } catch {
      return "N/A";
    }
  };

  // Navigation
  const handleBack = () => {
    router.back();
  };

  const handleGoToCategories = () => {
    router.push("/dashboard-agent/categories");
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredSubCategories.length === 0) {
      setInfoMessage("Aucune sous-catégorie à exporter");
      setTimeout(() => setInfoMessage(null), 3000);
      return;
    }

    const csvContent = [
      [
        "UUID",
        "Libellé",
        "Type",
        "Description",
        "Statut",
        "Créé le",
        "Éléments totaux",
      ],
      ...filteredSubCategories.map((cat) => [
        cat.uuid,
        `"${cat.libelle || ""}"`,
        `"${cat.type || ""}"`,
        `"${cat.description || ""}"`,
        cat.statut || "actif",
        formatDate(cat.createdAt),
        cat.counts?.total || 0,
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
      `sous-categories-${parentCategory?.libelle || "parent"}-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    handleSuccess("Export CSV réussi !");
  };

  // Si pas d'UUID, afficher erreur
  if (!parentUuid) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <div className="d-flex align-items-center">
            <FontAwesomeIcon icon={faTimesCircle} className="me-2 fs-4" />
            <div>
              <h4 className="alert-heading mb-2">Erreur de navigation</h4>
              <p className="mb-2">
                Impossible de déterminer la catégorie parente.
              </p>
              <div className="mt-2">
                <p className="mb-1">
                  <strong>Debug info:</strong>
                </p>
                <ul className="small text-muted mb-0">
                  <li>Params: {JSON.stringify(params)}</li>
                  <li>Pathname: {pathname}</li>
                  <li>
                    Expected route:
                    /dashboard-agent/categories/[uuid]/sous-categories
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <hr />
          <div className="mt-3">
            <button onClick={handleGoToCategories} className="btn btn-primary">
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              Retour aux catégories
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loadingParent) {
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p className="text-muted">Chargement de la catégorie parente...</p>
        <small className="text-muted mt-2">UUID: {parentUuid}</small>
      </div>
    );
  }

  if (!parentCategory) {
    return (
      <div className="p-3 p-md-4">
        <div className="alert alert-danger">
          <div className="d-flex align-items-center">
            <FontAwesomeIcon icon={faTimesCircle} className="me-2" />
            <div>
              <strong>Catégorie parente non trouvée</strong>
              <p className="mb-0 mt-1">UUID: {parentUuid}</p>
            </div>
          </div>
          <div className="mt-3">
            <button onClick={handleGoToCategories} className="btn btn-primary">
              Retour aux catégories
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Modals */}
      <CreateSubCategoryModal
        isOpen={showCreateModal}
        parentCategory={parentCategory}
        onClose={() => setShowCreateModal(false)}
        onSuccess={(message) => handleSuccess(message)}
      />

      {selectedSubCategory && (
        <>
          <ViewCategoryModal
            isOpen={showViewModal}
            category={{
              id: 0,
              uuid: selectedSubCategory.uuid,
              type: selectedSubCategory.type,
              libelle: selectedSubCategory.libelle,
              slug: selectedSubCategory.libelle
                .toLowerCase()
                .replace(/\s+/g, "-"),
              description: selectedSubCategory.description,
              image: selectedSubCategory.image || "",
              statut: selectedSubCategory.statut,
              is_deleted: selectedSubCategory.is_deleted || false,
              parent: parentCategory,
              counts: selectedSubCategory.counts,
              createdAt: selectedSubCategory.createdAt,
              updatedAt: selectedSubCategory.updatedAt,
              path: selectedSubCategory.path,
              depth: selectedSubCategory.depth,
              deleted_at: selectedSubCategory.deleted_at,
            }}
            onClose={() => {
              setShowViewModal(false);
              setSelectedSubCategory(null);
            }}
            onEdit={() => {
              setShowViewModal(false);
              setShowEditModal(true);
            }}
          />
        </>
      )}

      <DeleteModal
        show={showDeleteModal}
        subCategory={selectedSubCategory}
        loading={deleteLoading}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedSubCategory(null);
        }}
        onConfirm={handleDelete}
        type="single"
      />

      <DeleteModal
        show={showDeleteMultipleModal}
        subCategory={null}
        loading={deleteLoading}
        onClose={() => setShowDeleteMultipleModal(false)}
        onConfirm={handleDeleteMultiple}
        type="multiple"
        count={selectedSubCategories.length}
      />

      <div className="p-3 p-md-4">
        {/* En-tête avec fil d'Ariane */}
        <div className="mb-4">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <button
                  onClick={handleGoToCategories}
                  className="btn btn-link text-decoration-none p-0"
                >
                  <FontAwesomeIcon icon={faHome} className="me-2" />
                  Catégories
                </button>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                <FontAwesomeIcon icon={faLayerGroup} className="me-2" />
                Sous-catégories de {parentCategory.libelle}
              </li>
            </ol>
          </nav>
        </div>

        <div className="card border-0 shadow-sm overflow-hidden">
          {/* En-tête */}
          <div className="card-header bg-white border-0 py-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div>
                <div className="d-flex align-items-center gap-3 mb-2">
                  <button
                    onClick={handleBack}
                    className="btn btn-outline-secondary btn-sm"
                    title="Retour"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} />
                  </button>
                  <div>
                    <p className="text-muted mb-1">
                      Gestion des Sous-catégories
                    </p>
                    <div className="d-flex align-items-center gap-3">
                      <h2 className="h4 mb-0 fw-bold">
                        <FontAwesomeIcon icon={faLayerGroup} className="me-2" />
                        Sous-catégories
                      </h2>
                      <div className="badge bg-primary bg-opacity-10 text-primary">
                        {parentCategory.libelle}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informations parente */}
                <div className="card bg-light border-0 mt-3">
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center gap-3">
                      {parentCategory.image && (
                        <img
                          src={parentCategory.image}
                          alt={parentCategory.libelle}
                          className="rounded"
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              `https://via.placeholder.com/50/cccccc/ffffff?text=${parentCategory.libelle.charAt(0)}`;
                          }}
                        />
                      )}
                      <div>
                        <h6 className="mb-1 fw-semibold">
                          {parentCategory.libelle}
                        </h6>
                        <div className="d-flex flex-wrap gap-2">
                          <TypeBadge type={parentCategory.type} />
                          <StatusBadge statut={parentCategory.statut} />
                          <small className="text-muted">
                            UUID : {parentCategory.uuid.substring(0, 8)}...
                          </small>
                        </div>
                        {parentCategory.description && (
                          <p className="mb-0 text-muted small mt-1">
                            {parentCategory.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <button
                  onClick={fetchData}
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faRefresh} spin={loading} />
                  Rafraîchir
                </button>

                <button
                  onClick={handleExportCSV}
                  className="btn btn-outline-primary d-flex align-items-center gap-2"
                  disabled={subCategories.length === 0 || loading}
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Exporter CSV
                </button>

                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-success d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Nouvelle Sous-catégorie
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
          {selectedSubCategories.length > 0 && (
            <div className="p-3 border-bottom bg-warning bg-opacity-10">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                <div className="d-flex align-items-center gap-2">
                  <FontAwesomeIcon icon={faTags} className="text-warning" />
                  <span className="fw-semibold">
                    {selectedSubCategories.length} sous-catégorie(s)
                    sélectionnée(s)
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
                      setSelectedSubCategories([]);
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

          {/* Statistiques */}
          <div className="p-4 border-bottom bg-light-subtle">
            <div className="row g-3">
              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    <h3
                      className="fw-bold mb-1"
                      style={{ color: colors.oskar.blueHover }}
                    >
                      {stats.total}
                    </h3>
                    <p className="text-muted mb-0">Sous-catégories</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    <h3
                      className="fw-bold mb-1"
                      style={{ color: colors.oskar.green }}
                    >
                      {stats.active}
                    </h3>
                    <p className="text-muted mb-0">Actives</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    <h3
                      className="fw-bold mb-1"
                      style={{ color: colors.oskar.blue }}
                    >
                      {subCategories.length - stats.active}
                    </h3>
                    <p className="text-muted mb-0">Inactives</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    <h3
                      className="fw-bold mb-1"
                      style={{ color: colors.oskar.purple }}
                    >
                      {stats.totalElements}
                    </h3>
                    <p className="text-muted mb-0">Éléments totaux</p>
                  </div>
                </div>
              </div>
            </div>
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
                    placeholder="Rechercher par libellé ou description..."
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
                    <option value="inactif">Inactives</option>
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
                      <option key={type} value={type}>
                        {type}
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
                    <option value="5">5 / page</option>
                    <option value="10">10 / page</option>
                    <option value="20">20 / page</option>
                    <option value="50">50 / page</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-md-8">
                <div className="d-flex align-items-center gap-2">
                  <small className="text-muted">
                    Résultats: <strong>{filteredSubCategories.length}</strong>{" "}
                    sous-catégorie(s)
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
                          {selectedStatus === "actif" ? "Actif" : "Inactif"}
                        </strong>
                        "
                      </>
                    )}
                    {selectedType !== "all" && (
                      <>
                        {" "}
                        de type "<strong>{selectedType}</strong>"
                      </>
                    )}
                  </small>
                </div>
              </div>

              <div className="col-md-4 text-end">
                <div className="d-flex align-items-center gap-2 justify-content-end">
                  {selectedSubCategories.length > 0 && (
                    <small className="text-primary fw-semibold">
                      {selectedSubCategories.length} sélectionnée(s)
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

          {/* Tableau des sous-catégories */}
          <div className="table-responsive">
            {loading ? (
              <LoadingSkeleton />
            ) : filteredSubCategories.length === 0 ? (
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
                    {subCategories.length === 0
                      ? "Aucune sous-catégorie trouvée"
                      : "Aucun résultat"}
                  </h5>
                  <p className="mb-0 text-center">
                    {subCategories.length === 0
                      ? "Aucune sous-catégorie dans cette catégorie."
                      : "Aucune sous-catégorie ne correspond à vos critères de recherche."}
                  </p>
                  {subCategories.length === 0 ? (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="btn btn-primary mt-3"
                    >
                      <FontAwesomeIcon icon={faPlus} className="me-2" />
                      Créer la première sous-catégorie
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
                          onClick={() => requestSort("libelle")}
                        >
                          <FontAwesomeIcon icon={faTags} className="me-1" />
                          Libellé
                          {getSortIcon("libelle")}
                        </button>
                      </th>
                      <th style={{ width: "150px" }}>
                        <button
                          className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                          onClick={() => requestSort("type")}
                        >
                          Type
                          {getSortIcon("type")}
                        </button>
                      </th>
                      <th style={{ width: "100px" }}>
                        <span className="fw-semibold">Image</span>
                      </th>
                      <th style={{ width: "120px" }}>
                        <span className="fw-semibold">Statut</span>
                      </th>
                      <th style={{ width: "150px" }}>
                        <span className="fw-semibold">Éléments</span>
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
                    {currentItems.map((subCategory, index) => (
                      <tr
                        key={subCategory.uuid}
                        className={`align-middle ${selectedSubCategories.includes(subCategory.uuid) ? "table-active" : ""}`}
                      >
                        <td className="text-center">
                          <div className="form-check d-flex justify-content-center">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={selectedSubCategories.includes(
                                subCategory.uuid,
                              )}
                              onChange={() =>
                                handleSelectSubCategory(subCategory.uuid)
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
                                <FontAwesomeIcon icon={faTags} />
                              </div>
                            </div>
                            <div className="flex-grow-1 ms-3">
                              <div className="fw-semibold">
                                {subCategory.libelle}
                              </div>
                              {subCategory.description && (
                                <small
                                  className="text-muted text-truncate d-block"
                                  style={{
                                    maxWidth: "150px",
                                    fontSize: "0.75rem",
                                  }}
                                  title={subCategory.description}
                                >
                                  {subCategory.description}
                                </small>
                              )}
                              {subCategory.path && (
                                <small
                                  className="text-muted d-block"
                                  style={{ fontSize: "0.7rem" }}
                                >
                                  Path: {subCategory.path.substring(0, 20)}...
                                </small>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <TypeBadge type={subCategory.type} />
                        </td>
                        <td>
                          {subCategory.image ? (
                            <div
                              className="position-relative"
                              style={{ width: "50px", height: "50px" }}
                            >
                              <img
                                src={subCategory.image}
                                alt={subCategory.libelle}
                                className="img-fluid rounded border"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    `https://via.placeholder.com/50/cccccc/ffffff?text=${subCategory.libelle.charAt(0)}`;
                                }}
                              />
                            </div>
                          ) : (
                            <div
                              className="bg-secondary bg-opacity-10 rounded d-flex align-items-center justify-content-center"
                              style={{ width: "50px", height: "50px" }}
                            >
                              <FontAwesomeIcon
                                icon={faImage}
                                className="text-muted"
                              />
                            </div>
                          )}
                        </td>
                        <td>
                          <StatusBadge statut={subCategory.statut} />
                          {subCategory.is_deleted && (
                            <div className="mt-1">
                              <span
                                className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25"
                                style={{ fontSize: "0.65rem" }}
                              >
                                Supprimé
                              </span>
                            </div>
                          )}
                        </td>
                        <td>
                          {subCategory.counts ? (
                            <div className="d-flex flex-column gap-1">
                              <div className="d-flex align-items-center gap-1">
                                <FontAwesomeIcon
                                  icon={faCube}
                                  className="text-primary"
                                  style={{ fontSize: "0.7rem" }}
                                />
                                <span className="fw-semibold">
                                  {subCategory.counts.total || 0}
                                </span>
                                <span
                                  className="text-muted"
                                  style={{ fontSize: "0.75rem" }}
                                >
                                  total
                                </span>
                              </div>
                              <div className="d-flex gap-1">
                                {subCategory.counts.produits > 0 && (
                                  <small className="badge bg-success bg-opacity-10 text-success">
                                    {subCategory.counts.produits}P
                                  </small>
                                )}
                                {subCategory.counts.dons > 0 && (
                                  <small className="badge bg-info bg-opacity-10 text-info">
                                    {subCategory.counts.dons}D
                                  </small>
                                )}
                                {subCategory.counts.echanges > 0 && (
                                  <small className="badge bg-warning bg-opacity-10 text-warning">
                                    {subCategory.counts.echanges}É
                                  </small>
                                )}
                                {subCategory.counts.annonces > 0 && (
                                  <small className="badge bg-orange bg-opacity-10 text-orange">
                                    {subCategory.counts.annonces}A
                                  </small>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted">N/A</span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FontAwesomeIcon
                              icon={faCalendar}
                              className="text-muted me-2"
                            />
                            <small className="text-muted">
                              {formatDate(subCategory.createdAt)}
                            </small>
                          </div>
                          {subCategory.updatedAt &&
                            subCategory.updatedAt !== subCategory.createdAt && (
                              <small
                                className="text-muted d-block"
                                style={{ fontSize: "0.7rem" }}
                              >
                                Modifié: {formatDate(subCategory.updatedAt)}
                              </small>
                            )}
                        </td>
                        <td className="text-center">
                          <div className="btn-group btn-group-sm" role="group">
                            <button
                              className="btn btn-outline-primary"
                              title="Voir détails"
                              onClick={() => {
                                setSelectedSubCategory(subCategory);
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
                                setSelectedSubCategory(subCategory);
                                setShowEditModal(true);
                              }}
                              disabled={loading || subCategory.is_deleted}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              title="Supprimer"
                              onClick={() => openDeleteModal(subCategory)}
                              disabled={loading || subCategory.is_deleted}
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
                {filteredSubCategories.length > pagination.limit && (
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.pages} // Utilisation de pages au lieu de totalPages
                    totalItems={filteredSubCategories.length}
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
        .bg-orange {
          background-color: #fd7e14 !important;
          color: white !important;
        }
        .text-orange {
          color: #fd7e14 !important;
        }
      `}</style>
    </>
  );
}
