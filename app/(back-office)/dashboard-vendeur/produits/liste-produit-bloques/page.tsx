"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRefresh,
  faDownload,
  faSearch,
  faFilter,
  faSort,
  faSortUp,
  faSortDown,
  faCalendar,
  faBan,
  faCheckCircle,
  faTimesCircle,
  faInfoCircle,
  faCheck,
  faTimes,
  faSpinner,
  faImage,
  faExclamationTriangle,
  faEye,
  faEdit,
  faTrash,
  faLockOpen,
  faStore,
  faComment,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import ViewProductModal from "../components/modals/ViewProductModal";
import EditProductModal from "../components/modals/EditProductModal";

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
const BlockedStatusBadge = () => {
  return (
    <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25">
      <FontAwesomeIcon icon={faBan} className="me-1" />
      Bloqué
    </span>
  );
};

// Composant de disponibilité
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
          <span className="fw-semibold">{totalItems}</span> produits bloqués
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

// ============ PAGE PRINCIPALE ============

export default function ProduitsBloques() {
  // États
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // États pour les modals
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

  // Charger les produits bloqués
  const fetchBlockedProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Construire les paramètres de requête
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (searchTerm) params.search = searchTerm;
      if (availabilityFilter !== "all") {
        params.disponible = availabilityFilter === "available";
      }

      // Utiliser l'endpoint pour les produits bloqués
      const response = await api.get<PaginatedResponse>(
        API_ENDPOINTS.PRODUCTS.BLOCKED,
        { params },
      );

      // Filtrer uniquement les produits bloqués (sécurité supplémentaire)
      const blockedProducts = response.data.filter(
        (product) => product.estBloque,
      );

      setProducts(blockedProducts);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: blockedProducts.length,
        pages: Math.ceil(blockedProducts.length / response.limit),
      });
    } catch (err: any) {
      console.error("❌ Erreur lors du chargement des produits bloqués:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors du chargement des produits bloqués",
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, availabilityFilter]);

  // Charger les produits au montage et quand les paramètres changent
  useEffect(() => {
    fetchBlockedProducts();
  }, [fetchBlockedProducts]);

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
    fetchBlockedProducts();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Débloquer un produit
  const handleUnblockProduct = async (productUuid: string) => {
    try {
      // Note: Vérifiez si vous avez un endpoint spécifique pour débloquer
      // Sinon, utilisez l'endpoint de mise à jour
      await api.put(API_ENDPOINTS.PRODUCTS.UPDATE(productUuid), {
        estBloque: false,
      });

      handleSuccess("Produit débloqué avec succès !");
    } catch (err: any) {
      console.error("❌ Erreur déblocage:", err);
      setError(err.response?.data?.message || "Erreur lors du déblocage");
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

  // Export CSV
  const handleExport = () => {
    if (products.length === 0) {
      setError("Aucun produit bloqué à exporter");
      setTimeout(() => setError(null), 3000);
      return;
    }

    const csvContent = [
      [
        "Nom",
        "Prix",
        "Statut",
        "Disponible",
        "Quantité",
        "Boutique",
        "Date création",
      ],
      ...products.map((product) => [
        `"${product.libelle || ""}"`,
        product.prix,
        "Bloqué",
        product.disponible ? "Oui" : "Non",
        product.quantite,
        `"${product.boutique?.nom || ""}"`,
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
      `produits-bloques-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    handleSuccess("Export CSV réussi !");
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm("");
    setAvailabilityFilter("all");
    setSortConfig(null);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Statistiques
  const stats = useMemo(() => {
    return {
      total: products.length,
      available: products.filter((p) => p.disponible).length,
      unavailable: products.filter((p) => !p.disponible).length,
      totalValue: products.reduce((sum, p) => sum + parseFloat(p.prix), 0),
      boutiquesCount: new Set(products.map((p) => p.boutiqueUuid)).size,
    };
  }, [products]);

  return (
    <>
      {/* Modals */}
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

      <div className="p-3 p-md-4">
        <div className="card border-0 shadow-sm overflow-hidden">
          {/* En-tête */}
          <div className="card-header bg-white border-0 py-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div>
                <p className="text-muted mb-1">Gestion des Produits</p>
                <div className="d-flex align-items-center gap-3">
                  <h2 className="h4 mb-0 fw-bold text-danger">
                    Produits Bloqués
                  </h2>
                  <span className="badge bg-danger bg-opacity-10 text-danger">
                    {stats.total} produit(s) bloqué(s)
                  </span>
                  {stats.boutiquesCount > 0 && (
                    <span className="badge bg-warning bg-opacity-10 text-warning">
                      {stats.boutiquesCount} boutique(s)
                    </span>
                  )}
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <button
                  onClick={() => fetchBlockedProducts()}
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

          {/* Message d'information sur les produits bloqués */}
          <div className="p-3 border-bottom bg-danger bg-opacity-10">
            <div className="d-flex align-items-start gap-3">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="text-danger mt-1"
              />
              <div>
                <h6 className="fw-semibold mb-1">
                  Information sur les produits bloqués
                </h6>
                <p className="small mb-0">
                  Les produits bloqués ne sont pas visibles par les clients.
                  Pour les rendre à nouveau disponibles, vous devez les
                  débloquer. Contactez l'administration si vous pensez qu'il
                  s'agit d'une erreur.
                </p>
              </div>
            </div>
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
                    placeholder="Rechercher un produit bloqué..."
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
                    <option value="all">Tous les produits bloqués</option>
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
              <div className="col-12">
                <div className="d-flex align-items-center gap-2">
                  <small className="text-muted">
                    Résultats: <strong>{products.length}</strong> produit(s)
                    bloqué(s)
                    {searchTerm && (
                      <>
                        {" "}
                        pour "<strong>{searchTerm}</strong>"
                      </>
                    )}
                    {availabilityFilter !== "all" && (
                      <>
                        {" "}
                        et disponibilité "
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
            </div>
          </div>

          {/* Tableau des produits bloqués */}
          <div className="table-responsive">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-danger" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-3 text-muted">
                  Chargement des produits bloqués...
                </p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-5">
                <div
                  className="alert alert-success mx-auto"
                  style={{ maxWidth: "500px" }}
                >
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="fs-1 mb-3 text-success"
                  />
                  <h5 className="alert-heading">Aucun produit bloqué</h5>
                  <p className="mb-0">
                    Vous n'avez aucun produit bloqué dans votre boutique.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
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
                      <th style={{ width: "120px" }}>
                        <span className="fw-semibold">Boutique</span>
                      </th>
                      <th style={{ width: "100px" }}>
                        <span className="fw-semibold">Stock</span>
                      </th>
                      <th style={{ width: "150px" }}>
                        <span className="fw-semibold">Date</span>
                      </th>
                      <th style={{ width: "200px" }} className="text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product, index) => {
                      const startIndex =
                        (pagination.page - 1) * pagination.limit;
                      const displayIndex = startIndex + index + 1;

                      return (
                        <tr key={product.uuid} className="align-middle">
                          <td className="text-center text-muted fw-semibold">
                            {displayIndex}
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
                            {product.etoile && (
                              <small className="text-warning">
                                <FontAwesomeIcon
                                  icon={faStar}
                                  className="me-1"
                                />
                                {product.etoile}
                              </small>
                            )}
                          </td>
                          <td>
                            <BlockedStatusBadge />
                          </td>
                          <td>
                            <AvailabilityBadge
                              disponible={product.disponible}
                            />
                          </td>
                          <td>
                            {product.boutique ? (
                              <div className="small">
                                <div className="fw-semibold">
                                  {product.boutique.nom}
                                </div>
                                <div className="text-muted">
                                  {product.boutique.est_bloque ? (
                                    <span className="text-danger">
                                      Boutique bloquée
                                    </span>
                                  ) : product.boutique.est_ferme ? (
                                    <span className="text-warning">
                                      Boutique fermée
                                    </span>
                                  ) : (
                                    <span className="text-success">Active</span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted">N/A</span>
                            )}
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
                              <button
                                className="btn btn-outline-success"
                                title="Débloquer"
                                onClick={() =>
                                  handleUnblockProduct(product.uuid)
                                }
                              >
                                <FontAwesomeIcon icon={faLockOpen} />
                              </button>
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
                                  <FontAwesomeIcon icon={faTimesCircle} />
                                </button>
                              ) : (
                                <button
                                  className="btn btn-outline-success"
                                  title="Activer"
                                  onClick={() =>
                                    handleToggleAvailability(product.uuid, true)
                                  }
                                >
                                  <FontAwesomeIcon icon={faCheckCircle} />
                                </button>
                              )}
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
        .table tr:hover {
          background-color: rgba(220, 53, 69, 0.05);
        }
      `}</style>
    </>
  );
}
