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
  faTags,
  faImage,
  faCalendar,
  faCheckCircle,
  faTimesCircle,
  faInfoCircle,
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
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";
import ViewCategoryModal from "../components/modals/ViewCategoryModal";

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
}

// Composant de badge de statut
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

// Composant de badge de type
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

    if (lowerType.includes("vêtement") || lowerType.includes("chaussure")) {
      return {
        icon: faTags,
        color: colors.oskar.yellow,
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
  category,
  loading,
  onClose,
  onConfirm,
  type = "single",
  count = 0,
}: {
  show: boolean;
  category: Category | null;
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
            {type === "single" && category ? (
              <>
                <p className="mb-3">
                  Êtes-vous sûr de vouloir supprimer la catégorie{" "}
                  <strong>{category.libelle}</strong> ({category.type}) ?
                </p>
                <div className="text-danger">
                  <small>
                    Cette action est irréversible. Toutes les données associées
                    à cette catégorie seront perdues.
                  </small>
                </div>
              </>
            ) : (
              <>
                <p className="mb-3">
                  Êtes-vous sûr de vouloir supprimer{" "}
                  <strong>{count} catégorie(s)</strong> ?
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
                    ? `Supprimer ${count} catégorie(s)`
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
          <span className="fw-semibold">{totalItems}</span> catégories
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

export default function CategoriesPage() {
  // États
  const [categories, setCategories] = useState<Category[]>([]);
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
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Category;
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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // États pour les actions de suppression
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Options pour les éléments par page
  const itemsPerPageOptions = [5, 10, 20, 50];

  // Charger les catégories
  const fetchCategories = useCallback(async (params?: Record<string, any>) => {
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
        ? `${API_ENDPOINTS.CATEGORIES.LIST}?${queryParams.toString()}`
        : API_ENDPOINTS.CATEGORIES.LIST;

      const response = await api.get<Category[]>(endpoint);

      if (!Array.isArray(response)) {
        throw new Error("Réponse API invalide : attendu un tableau");
      }

      setCategories(response);
      setPagination((prev) => ({
        ...prev,
        total: response.length,
        pages: Math.ceil(response.length / prev.limit),
      }));

      // Réinitialiser la sélection après chargement
      setSelectedCategories([]);
      setSelectAll(false);
    } catch (err: any) {
      console.error("❌ Erreur lors du chargement des catégories:", err);
      let errorMessage = "Erreur lors du chargement des catégories.";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Gérer les changements de pagination et filtres
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params: Record<string, any> = {};

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      if (selectedType !== "all") {
        params.type = selectedType;
      }

      if (selectedStatus !== "all") {
        params.statut = selectedStatus;
      }

      fetchCategories(params);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedType, selectedStatus, fetchCategories]);

  // Fonctions de tri
  const requestSort = (key: keyof Category) => {
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

  const getSortIcon = (key: keyof Category) => {
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

  const sortedCategories = useMemo(() => {
    if (!sortConfig) return categories;
    return [...categories].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue === bValue) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      if (sortConfig.direction === "asc") return aValue < bValue ? -1 : 1;
      return aValue > bValue ? -1 : 1;
    });
  }, [categories, sortConfig]);

  const filteredCategories = useMemo(() => {
    return sortedCategories.filter((category) => {
      const matchesSearch =
        !searchTerm.trim() ||
        category.libelle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description &&
          category.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        category.slug?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType =
        selectedType === "all" || category.type === selectedType;

      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "actif" &&
          (!category.statut || category.statut === "actif")) ||
        (selectedStatus === "inactif" && category.statut === "inactif");

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [sortedCategories, searchTerm, selectedType, selectedStatus]);

  // Statistiques
  const stats = useMemo(() => {
    const totalCategories = categories.length;
    const activeCategories = categories.filter(
      (c) => !c.statut || c.statut === "actif",
    ).length;
    const deletedCategories = categories.filter((c) => c.is_deleted).length;
    const typeCounts = categories.reduce(
      (acc, category) => {
        if (category.type) acc[category.type] = (acc[category.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    return {
      total: totalCategories,
      active: activeCategories,
      deleted: deletedCategories,
      typeCounts,
    };
  }, [categories]);

  // Gestion succès
  const handleSuccess = (message: string) => {
    setSuccessMessage(message);
    fetchCategories();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Suppression d'une catégorie
  const handleDelete = async () => {
    if (!selectedCategory) return;

    try {
      setDeleteLoading(true);
      await api.delete(API_ENDPOINTS.CATEGORIES.DELETE(selectedCategory.uuid));

      setShowDeleteModal(false);
      setSelectedCategory(null);
      handleSuccess("Catégorie supprimée avec succès !");
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
    if (selectedCategories.length === 0) return;

    try {
      setDeleteLoading(true);
      let successCount = 0;
      let errorCount = 0;

      for (const categoryUuid of selectedCategories) {
        try {
          await api.delete(API_ENDPOINTS.CATEGORIES.DELETE(categoryUuid));
          successCount++;
        } catch (err) {
          console.error(`Erreur pour la catégorie ${categoryUuid}:`, err);
          errorCount++;
        }
      }

      setShowDeleteMultipleModal(false);
      setSuccessMessage(
        `${successCount} catégorie(s) supprimée(s) avec succès${errorCount > 0 ? ` (${errorCount} échec(s))` : ""}`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);

      // Réinitialiser la sélection
      setSelectedCategories([]);
      setSelectAll(false);

      // Rafraîchir la liste
      fetchCategories();
    } catch (err: any) {
      console.error("❌ Erreur suppression multiple:", err);
      setError("Erreur lors de la suppression multiple");
      setTimeout(() => setError(null), 3000);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Ouvrir modal de suppression
  const openDeleteModal = (category: Category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  // Ouvrir modal de suppression multiple
  const openDeleteMultipleModal = () => {
    if (selectedCategories.length === 0) {
      setInfoMessage("Veuillez sélectionner au moins une catégorie");
      setTimeout(() => setInfoMessage(null), 3000);
      return;
    }
    setShowDeleteMultipleModal(true);
  };

  // Export PDF
  const handleExport = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.CATEGORIES.EXPORT_PDF, {});
      const url = window.URL.createObjectURL(response);
      const link = document.createElement("a");
      link.href = url;
      link.download = `categories-${new Date().toISOString().split("T")[0]}.pdf`;
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
    if (categories.length === 0) {
      setInfoMessage("Aucune catégorie à exporter");
      setTimeout(() => setInfoMessage(null), 3000);
      return;
    }

    const csvContent = [
      [
        "ID",
        "Libellé",
        "Type",
        "Description",
        "Slug",
        "Statut",
        "Image",
        "Créé le",
        "Modifié le",
      ],
      ...categories.map((cat) => [
        cat.id,
        `"${cat.libelle || ""}"`,
        `"${cat.type || ""}"`,
        `"${cat.description || ""}"`,
        `"${cat.slug || ""}"`,
        cat.statut || "actif",
        `"${cat.image || ""}"`,
        cat.createdAt
          ? new Date(cat.createdAt).toLocaleDateString("fr-FR")
          : "",
        cat.updatedAt
          ? new Date(cat.updatedAt).toLocaleDateString("fr-FR")
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
      `categories-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    handleSuccess("Export CSV réussi !");
  };

  // Utils
  const uniqueTypes = useMemo(() => {
    const types = Array.from(
      new Set(categories.map((c) => c.type).filter(Boolean)),
    );
    return types.filter((type) => type && type.trim() !== "");
  }, [categories]);

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

  // Gestion de la sélection multiple
  const handleSelectCategory = (categoryUuid: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryUuid)) {
        return prev.filter((id) => id !== categoryUuid);
      } else {
        return [...prev, categoryUuid];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCategories([]);
    } else {
      const allCategoryIds = currentItems.map((cat) => cat.uuid);
      setSelectedCategories(allCategoryIds);
    }
    setSelectAll(!selectAll);
  };

  const handleSelectAllOnPage = () => {
    const pageCategoryIds = currentItems.map((cat) => cat.uuid);
    const allSelected = pageCategoryIds.every((id) =>
      selectedCategories.includes(id),
    );

    if (allSelected) {
      // Désélectionner toutes les catégories de la page
      setSelectedCategories((prev) =>
        prev.filter((id) => !pageCategoryIds.includes(id)),
      );
    } else {
      // Sélectionner toutes les catégories de la page
      const newSelection = [
        ...new Set([...selectedCategories, ...pageCategoryIds]),
      ];
      setSelectedCategories(newSelection);
    }
  };

  // Actions en masse
  const handleBulkAction = async (
    action: "activate" | "deactivate" | "delete",
  ) => {
    if (selectedCategories.length === 0) {
      setInfoMessage("Veuillez sélectionner au moins une catégorie");
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

      for (const categoryUuid of selectedCategories) {
        try {
          const category = categories.find((c) => c.uuid === categoryUuid);
          if (!category) continue;

          await api.put(API_ENDPOINTS.CATEGORIES.UPDATE(categoryUuid), {
            statut: action === "activate" ? "actif" : "inactif",
          });
          successCount++;
        } catch (err) {
          console.error(`Erreur pour la catégorie ${categoryUuid}:`, err);
          errorCount++;
        }
      }

      setSuccessMessage(
        `${successCount} catégorie(s) ${action === "activate" ? "activée(s)" : "désactivée(s)"} avec succès${errorCount > 0 ? ` (${errorCount} échec(s))` : ""}`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);

      // Rafraîchir la liste
      fetchCategories();

      // Réinitialiser la sélection
      setSelectedCategories([]);
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
  }, [searchTerm, selectedType, selectedStatus]);

  const currentItems = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    return filteredCategories.slice(startIndex, startIndex + pagination.limit);
  }, [filteredCategories, pagination.page, pagination.limit]);

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      total: filteredCategories.length,
      pages: Math.ceil(filteredCategories.length / prev.limit),
    }));
  }, [filteredCategories]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedType("all");
    setSelectedStatus("all");
    setSortConfig(null);
    setPagination((prev) => ({ ...prev, page: 1 }));
    setSelectedCategories([]);
    setSelectAll(false);
  };

  // Effet pour mettre à jour selectAll
  useEffect(() => {
    if (currentItems.length > 0) {
      const allSelected = currentItems.every((cat) =>
        selectedCategories.includes(cat.uuid),
      );
      setSelectAll(allSelected);
    } else {
      setSelectAll(false);
    }
  }, [selectedCategories, currentItems]);

  return (
    <>
      {selectedCategory && (
        <ViewCategoryModal
          isOpen={showViewModal}
          category={selectedCategory}
          onClose={() => {
            setShowViewModal(false);
            setSelectedCategory(null);
          }}
        />
      )}
      <DeleteModal
        show={showDeleteModal}
        category={selectedCategory}
        loading={deleteLoading}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedCategory(null);
        }}
        onConfirm={handleDelete}
        type="single"
      />
      <DeleteModal
        show={showDeleteMultipleModal}
        category={null}
        loading={deleteLoading}
        onClose={() => setShowDeleteMultipleModal(false)}
        onConfirm={handleDeleteMultiple}
        type="multiple"
        count={selectedCategories.length}
      />

      <div className="p-3 p-md-4">
        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="card-header bg-white border-0 py-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div>
                <p className="text-muted mb-1">Gestion des Catégories</p>
                <div className="d-flex align-items-center gap-3">
                  <h2 className="h4 mb-0 fw-bold">Liste des Catégories</h2>
                  <span className="badge bg-primary bg-opacity-10 text-primary">
                    {filteredCategories.length} catégorie(s){" "}
                    {selectedCategories.length > 0 &&
                      `(${selectedCategories.length} sélectionnée(s))`}
                  </span>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <button
                  onClick={() => fetchCategories()}
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faRefresh} spin={loading} />
                  Rafraîchir
                </button>

                <button
                  onClick={handleExport}
                  className="btn btn-outline-primary d-flex align-items-center gap-2"
                  disabled={categories.length === 0 || loading}
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Exporter PDF
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
          {selectedCategories.length > 0 && (
            <div className="p-3 border-bottom bg-warning bg-opacity-10">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                <div className="d-flex align-items-center gap-2">
                  <FontAwesomeIcon icon={faTags} className="text-warning" />
                  <span className="fw-semibold">
                    {selectedCategories.length} catégorie(s) sélectionnée(s)
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
                      setSelectedCategories([]);
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
              <div className="col-md-4">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faSearch} className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Rechercher par libellé, type ou description..."
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

              <div className="col-md-3">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faSlidersH} className="text-muted" />
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
                    Résultats: <strong>{filteredCategories.length}</strong>{" "}
                    catégorie(s)
                    {searchTerm && (
                      <>
                        {" "}
                        pour "<strong>{searchTerm}</strong>"
                      </>
                    )}
                    {selectedType !== "all" && (
                      <>
                        {" "}
                        de type "<strong>{selectedType}</strong>"
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
                  </small>
                </div>
              </div>

              <div className="col-md-4 text-end">
                <div className="d-flex align-items-center gap-2 justify-content-end">
                  {selectedCategories.length > 0 && (
                    <small className="text-primary fw-semibold">
                      {selectedCategories.length} sélectionnée(s)
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

          {/* Tableau des catégories */}
          <div className="table-responsive">
            {loading ? (
              <LoadingSkeleton />
            ) : filteredCategories.length === 0 ? (
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
                    {categories.length === 0
                      ? "Aucune catégorie trouvée"
                      : "Aucun résultat"}
                  </h5>
                  <p className="mb-0 text-center">
                    {categories.length === 0
                      ? "Aucune catégorie dans la base de données."
                      : "Aucune catégorie ne correspond à vos critères de recherche."}
                  </p>
                  {categories.length === 0 ? (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="btn btn-primary mt-3"
                    >
                      <FontAwesomeIcon icon={faPlus} className="me-2" />
                      Créer la première catégorie
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
                      <th style={{ width: "150px" }}>
                        <button
                          className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                          onClick={() => requestSort("slug")}
                        >
                          Slug
                          {getSortIcon("slug")}
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
                    {currentItems.map((category, index) => (
                      <tr
                        key={category.uuid}
                        className={`align-middle ${selectedCategories.includes(category.uuid) ? "table-active" : ""}`}
                      >
                        <td className="text-center">
                          <div className="form-check d-flex justify-content-center">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={selectedCategories.includes(
                                category.uuid,
                              )}
                              onChange={() =>
                                handleSelectCategory(category.uuid)
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
                                {category.libelle}
                              </div>
                              {category.description && (
                                <small
                                  className="text-muted text-truncate d-block"
                                  style={{
                                    maxWidth: "150px",
                                    fontSize: "0.75rem",
                                  }}
                                  title={category.description}
                                >
                                  {category.description}
                                </small>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <TypeBadge type={category.type} />
                        </td>
                        <td>
                          {category.image ? (
                            <div
                              className="position-relative"
                              style={{ width: "50px", height: "50px" }}
                            >
                              <img
                                src={category.image}
                                alt={category.libelle}
                                className="img-fluid rounded border"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    `https://via.placeholder.com/50/cccccc/ffffff?text=${category.libelle.charAt(0)}`;
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
                          <code
                            className="text-muted bg-light rounded px-2 py-1"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {category.slug}
                          </code>
                        </td>
                        <td>
                          <StatusBadge statut={category.statut} />
                          {category.is_deleted && (
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
                          <div className="d-flex align-items-center">
                            <FontAwesomeIcon
                              icon={faCalendar}
                              className="text-muted me-2"
                            />
                            <small className="text-muted">
                              {formatDate(category.createdAt)}
                            </small>
                          </div>
                        </td>
                        <td className="text-center">
                          <div className="btn-group btn-group-sm" role="group">
                            <button
                              className="btn btn-outline-primary"
                              title="Voir détails"
                              onClick={() => {
                                setSelectedCategory(category);
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
                                setSelectedCategory(category);
                                setShowEditModal(true);
                              }}
                              disabled={loading || category.is_deleted}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              title="Supprimer"
                              onClick={() => openDeleteModal(category)}
                              disabled={loading || category.is_deleted}
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
                {filteredCategories.length > pagination.limit && (
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.pages}
                    totalItems={filteredCategories.length}
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
