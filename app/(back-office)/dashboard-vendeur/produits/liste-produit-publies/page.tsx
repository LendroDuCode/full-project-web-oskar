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
  faShoppingCart,
  faCalendar,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faBan,
  faMoneyBillWave,
  faInfoCircle,
  faCheck,
  faTimes,
  faLayerGroup,
  faTag,
  faBox,
  faStore,
  faComment,
  faCheckSquare,
  faSquare,
  faSpinner,
  faImage,
  faExclamationTriangle,
  faThumbsUp,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import CreateProductModal from "../components/modals/CreateProductModal";
import EditProductModal from "../components/modals/EditProductModal";
import ViewProductModal from "../components/modals/ViewProductModal";
// ============ TYPES ============
interface Product {
  uuid: string;
  nom: string;
  prix: number;
  image: string;
  date: string;
  disponible: boolean;
  description: string | null;
  createdAt: string | null;
  quantite?: number;
  categorie_uuid?: string;
  lieu?: string;
  condition?: string;
  type?: string;
  garantie?: string;
  etoile?: string;
}

// ============ COMPOSANTS ============

// Composant de badge de disponibilité
const AvailabilityBadge = ({ disponible }: { disponible: boolean }) => {
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

// Composant de pagination
const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onLimitChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}) => {
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage + 1;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 p-3 border-top">
      <div className="d-flex align-items-center gap-3">
        <div className="text-muted small">
          Affichage de <span className="fw-semibold">{indexOfFirstItem}</span> à{" "}
          <span className="fw-semibold">{indexOfLastItem}</span> sur{" "}
          <span className="fw-semibold">{totalItems}</span> produits
        </div>
        <select
          className="form-select form-select-sm"
          style={{ width: "100px" }}
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
        <ul className="pagination mb-0">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Précédent
            </button>
          </li>

          {[...Array(totalPages)].map((_, i) => (
            <li
              key={i}
              className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
            >
              <button className="page-link" onClick={() => onPageChange(i + 1)}>
                {i + 1}
              </button>
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
              Suivant
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

// Composant de modal de suppression
const DeleteModal = ({
  show,
  product,
  loading,
  onClose,
  onConfirm,
}: {
  show: boolean;
  product: Product | null;
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
            <p className="mb-3">
              Êtes-vous sûr de vouloir supprimer le produit{" "}
              <strong>{product?.nom}</strong> ?
            </p>
            <div className="text-danger small">
              Cette action est irréversible. Toutes les données associées à ce
              produit seront perdues.
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

// ============ PAGE PRINCIPALE ============

export default function ProduitsVendeurPage() {
  // États
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // États pour les modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // États pour la sélection multiple
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Product;
    direction: "asc" | "desc";
  } | null>(null);

  // États pour la pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // Charger les produits
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Utiliser l'endpoint pour les produits publiés
      const response = await api.get<Product[]>(
        API_ENDPOINTS.PRODUCTS.PUBLISHED,
      );

      setProducts(response);
      setPagination((prev) => ({
        ...prev,
        total: response.length,
        pages: Math.ceil(response.length / prev.limit),
      }));
    } catch (err: any) {
      console.error("❌ Erreur lors du chargement des produits:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors du chargement des produits",
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les produits au montage
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Fonction pour formater la date
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

  // Fonction pour formater le prix
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Fonctions de tri
  const requestSort = (key: keyof Product) => {
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

  const getSortIcon = (key: keyof Product) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <FontAwesomeIcon icon={faSort} className="text-muted ms-1" />;
    }
    return sortConfig.direction === "asc" ? (
      <FontAwesomeIcon icon={faSortUp} className="text-primary ms-1" />
    ) : (
      <FontAwesomeIcon icon={faSortDown} className="text-primary ms-1" />
    );
  };

  // Tri et filtrage des produits
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filtrage par recherche
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (product) =>
          product.nom?.toLowerCase().includes(term) ||
          product.description?.toLowerCase().includes(term) ||
          product.type?.toLowerCase().includes(term),
      );
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

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc"
            ? aValue - bValue
            : bValue - aValue;
        }

        if (typeof aValue === "boolean" && typeof bValue === "boolean") {
          return sortConfig.direction === "asc"
            ? aValue === bValue
              ? 0
              : aValue
                ? -1
                : 1
            : aValue === bValue
              ? 0
              : aValue
                ? 1
                : -1;
        }

        return 0;
      });
    }

    return result;
  }, [products, searchTerm, availabilityFilter, sortConfig]);

  // Produits paginés
  const paginatedProducts = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    return filteredProducts.slice(startIndex, startIndex + pagination.limit);
  }, [filteredProducts, pagination.page, pagination.limit]);

  // Mettre à jour la pagination quand les filtres changent
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      page: 1,
      total: filteredProducts.length,
      pages: Math.ceil(filteredProducts.length / prev.limit),
    }));
  }, [filteredProducts, pagination.limit]);

  // Gestion des succès
  const handleSuccess = (message: string) => {
    setSuccessMessage(message);
    fetchProducts();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Gestion de la sélection multiple
  const handleSelectProduct = (productUuid: string) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productUuid)) {
        return prev.filter((id) => id !== productUuid);
      } else {
        return [...prev, productUuid];
      }
    });
  };

  const handleSelectAllOnPage = () => {
    const pageProductIds = paginatedProducts.map((product) => product.uuid);
    const allSelected = pageProductIds.every((id) =>
      selectedProducts.includes(id),
    );

    if (allSelected) {
      // Désélectionner tous les produits de cette page
      setSelectedProducts((prev) =>
        prev.filter((id) => !pageProductIds.includes(id)),
      );
      setSelectAll(false);
    } else {
      // Sélectionner tous les produits de cette page
      const newSelection = [
        ...new Set([...selectedProducts, ...pageProductIds]),
      ];
      setSelectedProducts(newSelection);
      if (newSelection.length === filteredProducts.length) {
        setSelectAll(true);
      }
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      // Désélectionner tout
      setSelectedProducts([]);
    } else {
      // Sélectionner tout
      const allProductIds = filteredProducts.map((product) => product.uuid);
      setSelectedProducts(allProductIds);
    }
    setSelectAll(!selectAll);
  };

  // Mettre à jour selectAll quand selectedProducts change
  useEffect(() => {
    if (filteredProducts.length > 0) {
      const allSelected = filteredProducts.every((product) =>
        selectedProducts.includes(product.uuid),
      );
      setSelectAll(allSelected);
    } else {
      setSelectAll(false);
    }
  }, [selectedProducts, filteredProducts]);

  // Suppression d'un produit
  const handleDelete = async () => {
    if (!selectedProduct) return;

    try {
      await api.delete(API_ENDPOINTS.PRODUCTS.DELETE(selectedProduct.uuid));
      setShowDeleteModal(false);
      setSelectedProduct(null);
      handleSuccess("Produit supprimé avec succès !");
    } catch (err: any) {
      console.error("❌ Erreur suppression:", err);
      setError(err.response?.data?.message || "Erreur lors de la suppression");
      setTimeout(() => setError(null), 3000);
    }
  };

  // Actions en masse
  const handleBulkAction = async (
    action: "publish" | "unpublish" | "activate" | "deactivate" | "delete",
  ) => {
    if (selectedProducts.length === 0) {
      setError("Veuillez sélectionner au moins un produit");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (action === "delete") {
      // TODO: Implémenter la suppression multiple
      setError("Suppression multiple à implémenter");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setBulkActionLoading(true);
      let successCount = 0;
      let errorCount = 0;

      for (const productUuid of selectedProducts) {
        try {
          const product = products.find((p) => p.uuid === productUuid);
          if (!product) continue;

          // Pour publier/dépublier ou activer/désactiver
          await api.put(
            API_ENDPOINTS.PRODUCTS.UPDATE_STOCK_VENDEUR(productUuid),
            {
              disponible: action === "activate" || action === "publish",
            },
          );
          successCount++;
        } catch (err) {
          console.error(`Erreur pour le produit ${productUuid}:`, err);
          errorCount++;
        }
      }

      handleSuccess(
        `${successCount} produit(s) ${action === "publish" || action === "activate" ? "activé(s)" : "désactivé(s)"} avec succès${errorCount > 0 ? ` (${errorCount} échec(s))` : ""}`,
      );

      // Rafraîchir la liste
      fetchProducts();

      // Réinitialiser la sélection
      setSelectedProducts([]);
      setSelectAll(false);
    } catch (err: any) {
      console.error("Erreur lors de l'action en masse:", err);
      setError("Erreur lors de l'action en masse");
      setTimeout(() => setError(null), 3000);
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Export CSV
  const handleExport = () => {
    if (products.length === 0) {
      setError("Aucun produit à exporter");
      setTimeout(() => setError(null), 3000);
      return;
    }

    const csvContent = [
      ["Nom", "Prix (FCFA)", "Disponible", "Date", "Description"],
      ...products.map((product) => [
        `"${product.nom || ""}"`,
        product.prix,
        product.disponible ? "Oui" : "Non",
        formatDate(product.date),
        `"${product.description || ""}"`,
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
      `produits-vendeur-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    handleSuccess("Export CSV réussi !");
  };

  // Réinitialiser les filtres et la sélection
  const resetFilters = () => {
    setSearchTerm("");
    setAvailabilityFilter("all");
    setSortConfig(null);
    setSelectedProducts([]);
    setSelectAll(false);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Statistiques
  const stats = useMemo(() => {
    return {
      total: products.length,
      available: products.filter((p) => p.disponible).length,
      unavailable: products.filter((p) => !p.disponible).length,
      totalValue: products.reduce((sum, p) => sum + p.prix, 0),
      averagePrice:
        products.length > 0
          ? products.reduce((sum, p) => sum + p.prix, 0) / products.length
          : 0,
    };
  }, [products]);

  // Effet pour réinitialiser la sélection quand les filtres changent
  useEffect(() => {
    setSelectedProducts([]);
    setSelectAll(false);
  }, [searchTerm, availabilityFilter]);

  return (
    <>
      {/* Modals */}
      <CreateProductModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => handleSuccess("Produit créé avec succès !")}
      />

      {selectedProduct && (
        <EditProductModal
          isOpen={showEditModal}
          product={selectedProduct}
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

      {/* Modal de suppression */}
      <DeleteModal
        show={showDeleteModal}
        product={selectedProduct}
        loading={false}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedProduct(null);
        }}
        onConfirm={handleDelete}
      />

      <div className="p-3 p-md-4">
        <div className="card border-0 shadow-sm overflow-hidden">
          {/* En-tête */}
          <div className="card-header bg-white border-0 py-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div>
                <p className="text-muted mb-1">Gestion des Produits</p>
                <div className="d-flex align-items-center gap-3">
                  <h2 className="h4 mb-0 fw-bold">Mes Produits</h2>
                  <span className="badge bg-primary bg-opacity-10 text-primary">
                    {filteredProducts.length} produit(s)
                    {selectedProducts.length > 0 &&
                      ` (${selectedProducts.length} sélectionné(s))`}
                  </span>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <button
                  onClick={() => fetchProducts()}
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faRefresh} spin={loading} />
                  Rafraîchir
                </button>

                <button
                  onClick={handleExport}
                  className="btn btn-outline-primary d-flex align-items-center gap-2"
                  disabled={products.length === 0 || loading}
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Exporter CSV
                </button>

                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-success d-flex align-items-center gap-2"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Nouveau Produit
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
          </div>

          {/* Barre d'actions en masse */}
          {selectedProducts.length > 0 && (
            <div className="p-3 border-bottom bg-warning bg-opacity-10">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                <div className="d-flex align-items-center gap-2">
                  <FontAwesomeIcon
                    icon={faShoppingCart}
                    className="text-warning"
                  />
                  <span className="fw-semibold">
                    {selectedProducts.length} produit(s) sélectionné(s)
                  </span>
                </div>

                <div className="d-flex flex-wrap gap-2">
                  <button
                    className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                    onClick={() => handleBulkAction("activate")}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faCheck} />
                    <span>Activer</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
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
                      setSelectedProducts([]);
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
                    placeholder="Rechercher par nom, description..."
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
                    value={availabilityFilter}
                    onChange={(e) => setAvailabilityFilter(e.target.value)}
                  >
                    <option value="all">Tous les produits</option>
                    <option value="available">Disponibles</option>
                    <option value="unavailable">Indisponibles</option>
                  </select>
                </div>
              </div>

              <div className="col-md-2">
                <button
                  onClick={resetFilters}
                  className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faTimes} />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-md-8">
                <div className="d-flex align-items-center gap-2">
                  <small className="text-muted">
                    Résultats: <strong>{filteredProducts.length}</strong>{" "}
                    produit(s)
                    {searchTerm && (
                      <>
                        {" "}
                        pour "<strong>{searchTerm}</strong>"
                      </>
                    )}
                    {availabilityFilter !== "all" && (
                      <>
                        {" "}
                        et statut "
                        <strong>
                          {availabilityFilter === "available"
                            ? "Disponible"
                            : "Indisponible"}
                        </strong>
                        "
                      </>
                    )}
                  </small>
                </div>
              </div>

              <div className="col-md-4 text-end">
                <div className="d-flex align-items-center gap-2 justify-content-end">
                  {selectedProducts.length > 0 && (
                    <small className="text-primary fw-semibold">
                      {selectedProducts.length} sélectionné(s)
                    </small>
                  )}
                  <button
                    onClick={() => handleSelectAll()}
                    className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2"
                    disabled={filteredProducts.length === 0 || loading}
                    title={
                      selectAll ? "Tout désélectionner" : "Tout sélectionner"
                    }
                  >
                    <FontAwesomeIcon
                      icon={selectAll ? faCheckSquare : faSquare}
                    />
                    <span className="d-none d-md-inline">
                      {selectAll ? "Tout désélectionner" : "Tout sélectionner"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tableau des produits */}
          <div className="table-responsive">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-3 text-muted">Chargement des produits...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
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
                    {products.length === 0
                      ? "Aucun produit trouvé"
                      : "Aucun résultat"}
                  </h5>
                  <p className="mb-0">
                    {products.length === 0
                      ? "Vous n'avez pas encore créé de produit."
                      : "Aucun produit ne correspond à vos critères de recherche."}
                  </p>
                  {products.length === 0 && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="btn btn-primary mt-3"
                    >
                      <FontAwesomeIcon icon={faPlus} className="me-2" />
                      Créer mon premier produit
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
                            checked={selectAll && paginatedProducts.length > 0}
                            onChange={handleSelectAllOnPage}
                            disabled={paginatedProducts.length === 0}
                            title={
                              selectAll
                                ? "Désélectionner cette page"
                                : "Sélectionner cette page"
                            }
                          />
                        </div>
                      </th>
                      <th style={{ width: "40px" }}>#</th>
                      <th style={{ width: "80px" }}>
                        <span className="fw-semibold">Image</span>
                      </th>
                      <th style={{ width: "200px" }}>
                        <button
                          className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                          onClick={() => requestSort("nom")}
                        >
                          Nom du produit
                          {getSortIcon("nom")}
                        </button>
                      </th>
                      <th style={{ width: "120px" }}>
                        <button
                          className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                          onClick={() => requestSort("prix")}
                        >
                          Prix
                          {getSortIcon("prix")}
                        </button>
                      </th>
                      <th style={{ width: "100px" }}>
                        <span className="fw-semibold">Disponibilité</span>
                      </th>
                      <th style={{ width: "150px" }}>
                        <button
                          className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                          onClick={() => requestSort("date")}
                        >
                          Date
                          {getSortIcon("date")}
                        </button>
                      </th>
                      <th style={{ width: "160px" }} className="text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProducts.map((product, index) => {
                      const isSelected = selectedProducts.includes(
                        product.uuid,
                      );

                      return (
                        <tr
                          key={product.uuid}
                          className={`align-middle ${isSelected ? "table-active" : ""}`}
                        >
                          <td className="text-center">
                            <div className="form-check d-flex justify-content-center">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={isSelected}
                                onChange={() =>
                                  handleSelectProduct(product.uuid)
                                }
                              />
                            </div>
                          </td>
                          <td className="text-center text-muted fw-semibold">
                            {(pagination.page - 1) * pagination.limit +
                              index +
                              1}
                          </td>
                          <td>
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.nom}
                                className="rounded border"
                                style={{
                                  width: "60px",
                                  height: "60px",
                                  objectFit: "cover",
                                }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    `https://via.placeholder.com/60/cccccc/ffffff?text=${product.nom?.charAt(0) || "P"}`;
                                }}
                              />
                            ) : (
                              <div
                                className="bg-secondary bg-opacity-10 rounded d-flex align-items-center justify-content-center"
                                style={{ width: "60px", height: "60px" }}
                              >
                                <FontAwesomeIcon
                                  icon={faImage}
                                  className="text-muted"
                                />
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="fw-semibold">{product.nom}</div>
                            {product.description && (
                              <small
                                className="text-muted d-block"
                                style={{ fontSize: "0.75rem" }}
                              >
                                {product.description.substring(0, 50)}...
                              </small>
                            )}
                          </td>
                          <td>
                            <div className="fw-bold text-success">
                              {formatPrice(product.prix)}
                            </div>
                            {product.quantite && (
                              <small className="text-muted">
                                Stock: {product.quantite}
                              </small>
                            )}
                          </td>
                          <td>
                            <AvailabilityBadge
                              disponible={product.disponible}
                            />
                          </td>
                          <td>
                            <div className="small">
                              <div>
                                <FontAwesomeIcon
                                  icon={faCalendar}
                                  className="me-1"
                                />
                                {formatDate(product.date)}
                              </div>
                              {product.createdAt && (
                                <div className="text-muted">
                                  <small>
                                    Créé: {formatDate(product.createdAt)}
                                  </small>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="text-center">
                            <div
                              className="btn-group btn-group-sm"
                              role="group"
                            >
                              <button
                                className="btn btn-outline-primary"
                                title="Voir détails"
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setShowViewModal(true);
                                }}
                              >
                                <FontAwesomeIcon icon={faEye} />
                              </button>
                              <button
                                className="btn btn-outline-warning"
                                title="Modifier"
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setShowEditModal(true);
                                }}
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              {product.disponible ? (
                                <button
                                  className="btn btn-outline-secondary"
                                  title="Désactiver"
                                  onClick={() => {
                                    // TODO: Implémenter la désactivation
                                    setSelectedProduct(product);
                                    // handleToggleAvailability();
                                  }}
                                >
                                  <FontAwesomeIcon icon={faBan} />
                                </button>
                              ) : (
                                <button
                                  className="btn btn-outline-success"
                                  title="Activer"
                                  onClick={() => {
                                    // TODO: Implémenter l'activation
                                    setSelectedProduct(product);
                                    // handleToggleAvailability();
                                  }}
                                >
                                  <FontAwesomeIcon icon={faCheck} />
                                </button>
                              )}
                              <button
                                className="btn btn-outline-danger"
                                title="Supprimer"
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setShowDeleteModal(true);
                                }}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Pagination */}
                {filteredProducts.length > pagination.limit && (
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.pages}
                    totalItems={filteredProducts.length}
                    itemsPerPage={pagination.limit}
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
      `}</style>
    </>
  );
}
