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
  faGlobe,
  faLock,
  faToggleOn,
  faToggleOff,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import CreateProductModal from "../components/modals/CreateProductModal";
import EditProductModal from "../components/modals/EditProductModal";
import ViewProductModal from "../components/modals/ViewProductModal";

// ============ TYPES ============
interface Product {
  id: number;
  uuid: string;
  libelle: string;
  slug: string;
  type: string | null;
  image: string;
  disponible: boolean;
  statut: "publie" | "non_publie" | "en_attente" | "bloque";
  prix: string;
  description: string | null;
  etoile: string;
  vendeurUuid: string;
  boutiqueUuid: string;
  boutique: {
    uuid: string;
    nom: string;
    slug: string;
    description: string | null;
    logo: string;
    banniere: string;
    statut: string;
    est_bloque: boolean;
    est_ferme: boolean;
  };
  categorie_uuid: string;
  estPublie: boolean;
  estBloque: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  quantite: number;
  note_moyenne: string;
  nombre_avis: number;
  nombre_favoris: number;
}

interface PaginatedResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

// ============ COMPOSANTS ============

// Composant de badge de statut
const StatusBadge = ({
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

  switch (statut) {
    case "publie":
      return (
        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">
          <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
          Publié
        </span>
      );
    case "non_publie":
      return (
        <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25">
          <FontAwesomeIcon icon={faLock} className="me-1" />
          Non publié
        </span>
      );
    case "en_attente":
      return (
        <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25">
          <FontAwesomeIcon icon={faClock} className="me-1" />
          En attente
        </span>
      );
    case "bloque":
      return (
        <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25">
          <FontAwesomeIcon icon={faBan} className="me-1" />
          Bloqué
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

// Composant de disponibilité
const AvailabilityBadge = ({ disponible }: { disponible: boolean }) => {
  return disponible ? (
    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">
      <FontAwesomeIcon icon={faToggleOn} className="me-1" />
      Disponible
    </span>
  ) : (
    <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25">
      <FontAwesomeIcon icon={faToggleOff} className="me-1" />
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
              <strong>{product?.libelle}</strong> ?
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

export default function ProduitVendeur() {
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
  const [statusFilter, setStatusFilter] = useState<string>("all");
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

      // Construire les paramètres de requête
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== "all") params.statut = statusFilter;
      if (availabilityFilter !== "all") {
        params.disponible = availabilityFilter === "available";
      }

      // Utiliser l'endpoint pour les produits du vendeur
      const response = await api.get<PaginatedResponse>(
        API_ENDPOINTS.PRODUCTS.VENDEUR_PRODUCTS,
        { params },
      );

      setProducts(response.data);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        pages: Math.ceil(response.total / response.limit),
      });
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
  }, [
    pagination.page,
    pagination.limit,
    searchTerm,
    statusFilter,
    availabilityFilter,
  ]);

  // Charger les produits au montage et quand les paramètres changent
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

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts([]);
    } else {
      const allProductIds = products.map((product) => product.uuid);
      setSelectedProducts(allProductIds);
    }
    setSelectAll(!selectAll);
  };

  // Mettre à jour selectAll quand selectedProducts change
  useEffect(() => {
    if (products.length > 0) {
      const allSelected = products.every((product) =>
        selectedProducts.includes(product.uuid),
      );
      setSelectAll(allSelected);
    } else {
      setSelectAll(false);
    }
  }, [selectedProducts, products]);

  // Publication d'un produit
  const handlePublishProduct = async (productUuid: string) => {
    try {
      await api.post(API_ENDPOINTS.PRODUCTS.PUBLISH, {
        produitUuid: productUuid,
      });
      handleSuccess("Produit publié avec succès !");
    } catch (err: any) {
      console.error("❌ Erreur publication:", err);
      setError(err.response?.data?.message || "Erreur lors de la publication");
      setTimeout(() => setError(null), 3000);
    }
  };

  // Dépublier un produit
  const handleUnpublishProduct = async (productUuid: string) => {
    try {
      await api.post(API_ENDPOINTS.PRODUCTS.UNPUBLISH, {
        produitUuid: productUuid,
      });
      handleSuccess("Produit dépublié avec succès !");
    } catch (err: any) {
      console.error("❌ Erreur dépublication:", err);
      setError(
        err.response?.data?.message || "Erreur lors de la dépublication",
      );
      setTimeout(() => setError(null), 3000);
    }
  };

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

  // Mise à jour de la disponibilité
  const handleToggleAvailability = async (
    productUuid: string,
    disponible: boolean,
  ) => {
    try {
      const product = products.find((p) => p.uuid === productUuid);
      if (!product) return;

      await api.put(API_ENDPOINTS.PRODUCTS.UPDATE_STOCK_VENDEUR(productUuid), {
        disponible: disponible,
        quantite: product.quantite,
      });

      handleSuccess(
        `Produit ${disponible ? "activé" : "désactivé"} avec succès !`,
      );
    } catch (err: any) {
      console.error("❌ Erreur disponibilité:", err);
      setError(err.response?.data?.message || "Erreur lors de la modification");
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

    try {
      setBulkActionLoading(true);
      let successCount = 0;
      let errorCount = 0;

      for (const productUuid of selectedProducts) {
        try {
          const product = products.find((p) => p.uuid === productUuid);
          if (!product) continue;

          switch (action) {
            case "publish":
              await api.post(API_ENDPOINTS.PRODUCTS.PUBLISH, {
                produitUuid: productUuid,
              });
              break;
            case "unpublish":
              await api.post(API_ENDPOINTS.PRODUCTS.UNPUBLISH, {
                produitUuid: productUuid,
              });
              break;
            case "activate":
              await handleToggleAvailability(productUuid, true);
              break;
            case "deactivate":
              await handleToggleAvailability(productUuid, false);
              break;
            case "delete":
              await api.delete(API_ENDPOINTS.PRODUCTS.DELETE(productUuid));
              break;
          }
          successCount++;
        } catch (err) {
          console.error(`Erreur pour le produit ${productUuid}:`, err);
          errorCount++;
        }
      }

      handleSuccess(
        `${successCount} produit(s) traité(s) avec succès${errorCount > 0 ? ` (${errorCount} échec(s))` : ""}`,
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
      ["Nom", "Prix", "Statut", "Disponible", "Quantité", "Date création"],
      ...products.map((product) => [
        `"${product.libelle || ""}"`,
        product.prix,
        product.statut,
        product.disponible ? "Oui" : "Non",
        product.quantite,
        formatDate(product.createdAt),
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
      `mes-produits-${new Date().toISOString().split("T")[0]}.csv`,
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
    setStatusFilter("all");
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
      published: products.filter((p) => p.estPublie || p.statut === "publie")
        .length,
      blocked: products.filter((p) => p.estBloque).length,
      available: products.filter((p) => p.disponible).length,
      unavailable: products.filter((p) => !p.disponible).length,
      totalValue: products.reduce((sum, p) => sum + parseFloat(p.prix), 0),
    };
  }, [products]);

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
                    {stats.total} produit(s)
                  </span>
                  {stats.published > 0 && (
                    <span className="badge bg-success bg-opacity-10 text-success">
                      {stats.published} publié(s)
                    </span>
                  )}
                  {selectedProducts.length > 0 && (
                    <span className="badge bg-warning bg-opacity-10 text-warning">
                      {selectedProducts.length} sélectionné(s)
                    </span>
                  )}
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
                    onClick={() => handleBulkAction("publish")}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faGlobe} />
                    <span>Publier</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                    onClick={() => handleBulkAction("unpublish")}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faLock} />
                    <span>Dépublier</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                    onClick={() => handleBulkAction("activate")}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faToggleOn} />
                    <span>Activer</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                    onClick={() => handleBulkAction("deactivate")}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faToggleOff} />
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
              <div className="col-md-4">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faSearch} className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Rechercher par nom..."
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
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="publie">Publiés</option>
                    <option value="non_publie">Non publiés</option>
                    <option value="en_attente">En attente</option>
                    <option value="bloque">Bloqués</option>
                  </select>
                </div>
              </div>

              <div className="col-md-3">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faToggleOn} className="text-muted" />
                  </span>
                  <select
                    className="form-select border-start-0 ps-0"
                    value={availabilityFilter}
                    onChange={(e) => setAvailabilityFilter(e.target.value)}
                  >
                    <option value="all">Tous</option>
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
            ) : products.length === 0 ? (
              <div className="text-center py-5">
                <div
                  className="alert alert-info mx-auto"
                  style={{ maxWidth: "500px" }}
                >
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="fs-1 mb-3 text-info"
                  />
                  <h5 className="alert-heading">Aucun produit trouvé</h5>
                  <p className="mb-0">
                    Vous n'avez pas encore créé de produit.
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn btn-primary mt-3"
                  >
                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                    Créer mon premier produit
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
                            checked={selectAll}
                            onChange={handleSelectAll}
                            disabled={products.length === 0}
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
                          onClick={() => requestSort("libelle")}
                        >
                          Nom du produit
                          {getSortIcon("libelle")}
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
                        <span className="fw-semibold">Statut</span>
                      </th>
                      <th style={{ width: "100px" }}>
                        <span className="fw-semibold">Disponibilité</span>
                      </th>
                      <th style={{ width: "80px" }}>
                        <span className="fw-semibold">Stock</span>
                      </th>
                      <th style={{ width: "150px" }}>
                        <span className="fw-semibold">Date</span>
                      </th>
                      <th style={{ width: "180px" }} className="text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product, index) => {
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
                            {index + 1}
                          </td>
                          <td>
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.libelle}
                                className="rounded border"
                                style={{
                                  width: "60px",
                                  height: "60px",
                                  objectFit: "cover",
                                }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    `https://via.placeholder.com/60/cccccc/ffffff?text=${product.libelle?.charAt(0) || "P"}`;
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
                            <div className="fw-semibold">{product.libelle}</div>
                            {product.boutique && (
                              <small className="text-muted d-block">
                                Boutique: {product.boutique.nom}
                              </small>
                            )}
                          </td>
                          <td>
                            <div className="fw-bold text-success">
                              {formatPrice(product.prix)}
                            </div>
                            {product.etoile && (
                              <small className="text-warning">
                                ★ {product.etoile}
                              </small>
                            )}
                          </td>
                          <td>
                            <StatusBadge
                              statut={product.statut}
                              estPublie={product.estPublie}
                              estBloque={product.estBloque}
                            />
                          </td>
                          <td>
                            <AvailabilityBadge
                              disponible={product.disponible}
                            />
                          </td>
                          <td>
                            <div className="text-center">
                              <span
                                className={`badge ${product.quantite > 0 ? "bg-success" : "bg-danger"}`}
                              >
                                {product.quantite}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="small">
                              <div>
                                <FontAwesomeIcon
                                  icon={faCalendar}
                                  className="me-1"
                                />
                                {formatDate(product.createdAt)}
                              </div>
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
                              {!product.estPublie && !product.estBloque ? (
                                <button
                                  className="btn btn-outline-success"
                                  title="Publier"
                                  onClick={() =>
                                    handlePublishProduct(product.uuid)
                                  }
                                >
                                  <FontAwesomeIcon icon={faGlobe} />
                                </button>
                              ) : (
                                <button
                                  className="btn btn-outline-secondary"
                                  title="Dépublier"
                                  onClick={() =>
                                    handleUnpublishProduct(product.uuid)
                                  }
                                >
                                  <FontAwesomeIcon icon={faLock} />
                                </button>
                              )}
                              {product.disponible ? (
                                <button
                                  className="btn btn-outline-secondary"
                                  title="Désactiver"
                                  onClick={() =>
                                    handleToggleAvailability(
                                      product.uuid,
                                      false,
                                    )
                                  }
                                >
                                  <FontAwesomeIcon icon={faToggleOff} />
                                </button>
                              ) : (
                                <button
                                  className="btn btn-outline-success"
                                  title="Activer"
                                  onClick={() =>
                                    handleToggleAvailability(product.uuid, true)
                                  }
                                >
                                  <FontAwesomeIcon icon={faToggleOn} />
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
                {pagination.pages > 1 && (
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.pages}
                    totalItems={pagination.total}
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
