// components/produits/ListeProduitsCreeUtilisateur.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faPlus,
  faRefresh,
  faDownload,
  faSearch,
  faFilter,
  faSort,
  faSortUp,
  faSortDown,
  faCheckCircle,
  faTimesCircle,
  faInfoCircle,
  faMoneyBillWave,
  faBoxOpen,
  faTag,
  faEye,
  faEdit,
  faTrash,
  faTimes,
  faBan,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import CreateProduitModal from "../components/modals/CreateProduitModal";
import DeleteProduitModal from "../components/modals/DeleteProduitModal";
import ViewProduitModal from "../components/modals/ViewProduitModal";
import EditProduitModal from "../components/modals/EditProduitModal";
import LoadingSkeleton from "../components/shared/LoadingSkeleton";
import StatusBadge from "../components/shared/StatusBadge";

// Import des composants modulaires

export default function ListeProduitsCreeUtilisateur() {
  // États
  const [produits, setProduits] = useState<Produit[]>([]);
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
  const [selectedProduit, setSelectedProduit] = useState<Produit | null>(null);

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  // États pour la pagination
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // États pour la sélection multiple
  const [selectedProduits, setSelectedProduits] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Charger les produits
  const fetchProduits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setInfoMessage(null);
      setSuccessMessage(null);

      const params: Record<string, any> = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      if (selectedStatus !== "all") {
        params.statut = selectedStatus;
      }

      const endpoint = "/produits/liste-mes-utilisateur-produits";
      const response = await api.get(endpoint, { params });

      if (response && response.data) {
        setProduits(response.data.produits || []);
        setPagination({
          page: response.data.pagination?.page || 1,
          limit: response.data.pagination?.limit || 10,
          total: response.data.pagination?.total || 0,
          pages: response.data.pagination?.totalPages || 1,
        });
      } else {
        if (Array.isArray(response)) {
          setProduits(response);
          setPagination((prev) => ({
            ...prev,
            total: response.length,
            pages: Math.ceil(response.length / prev.limit),
          }));
        } else {
          throw new Error("Format de réponse invalide");
        }
      }

      setSelectedProduits([]);
      setSelectAll(false);
    } catch (err: any) {
      console.error("❌ Erreur lors du chargement des produits:", err);
      let errorMessage = "Erreur lors du chargement des produits.";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      if (err.response?.status === 404) {
        errorMessage =
          "Endpoint non trouvé. Vérifiez que l'API est accessible.";
      }
      setError(errorMessage);
      setProduits([]);
      setPagination((prev) => ({ ...prev, total: 0, pages: 1 }));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, selectedStatus]);

  // Charger les produits au montage
  useEffect(() => {
    fetchProduits();
  }, [fetchProduits]);

  // Débounce pour la recherche
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim() || selectedStatus !== "all") {
        setPagination((prev) => ({ ...prev, page: 1 }));
        fetchProduits();
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedStatus]);

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

  // Tri et filtrage des données
  const sortedProduits = useMemo(() => {
    if (!sortConfig) return produits;

    return [...produits].sort((a, b) => {
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

      if (typeof aValue === "number" && typeof bValue === "number") {
        if (sortConfig.direction === "asc") {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      }

      if (sortConfig.direction === "asc") {
        return aValue < bValue ? -1 : 1;
      }
      return aValue > bValue ? -1 : 1;
    });
  }, [produits, sortConfig]);

  const filteredProduits = useMemo(() => {
    return sortedProduits.filter((produit) => {
      const matchesSearch =
        !searchTerm.trim() ||
        produit.libelle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        produit.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        produit.type?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        selectedStatus === "all" ||
        produit.statut?.toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [sortedProduits, searchTerm, selectedStatus]);

  // Gestion succès
  const handleSuccess = (message: string) => {
    setSuccessMessage(message);
    fetchProduits();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Suppression d'un produit
  const handleDelete = async () => {
    if (!selectedProduit) return;

    try {
      setDeleteLoading(true);
      await api.delete(API_ENDPOINTS.PRODUCTS.DELETE(selectedProduit.uuid));

      setShowDeleteModal(false);
      setSelectedProduit(null);
      handleSuccess("Produit supprimé avec succès !");
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
    if (selectedProduits.length === 0) return;

    try {
      setDeleteLoading(true);
      let successCount = 0;
      let errorCount = 0;

      for (const produitUuid of selectedProduits) {
        try {
          await api.delete(API_ENDPOINTS.PRODUCTS.DELETE(produitUuid));
          successCount++;
        } catch (err) {
          console.error(`Erreur pour le produit ${produitUuid}:`, err);
          errorCount++;
        }
      }

      setShowDeleteMultipleModal(false);
      setSuccessMessage(
        `${successCount} produit(s) supprimé(s) avec succès${errorCount > 0 ? ` (${errorCount} échec(s))` : ""}`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);

      setSelectedProduits([]);
      setSelectAll(false);
      fetchProduits();
    } catch (err: any) {
      console.error("❌ Erreur suppression multiple:", err);
      setError("Erreur lors de la suppression multiple");
      setTimeout(() => setError(null), 3000);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Ouvrir modal de suppression
  const openDeleteModal = (produit: Produit) => {
    setSelectedProduit(produit);
    setShowDeleteModal(true);
  };

  // Ouvrir modal de suppression multiple
  const openDeleteMultipleModal = () => {
    if (selectedProduits.length === 0) {
      setInfoMessage("Veuillez sélectionner au moins un produit");
      setTimeout(() => setInfoMessage(null), 3000);
      return;
    }
    setShowDeleteMultipleModal(true);
  };

  // Export CSV
  const handleExport = () => {
    if (produits.length === 0) {
      setInfoMessage("Aucun produit à exporter");
      setTimeout(() => setInfoMessage(null), 3000);
      return;
    }

    const csvContent = [
      [
        "ID",
        "Libellé",
        "Prix",
        "Quantité",
        "Statut",
        "Catégorie",
        "Évaluation",
        "Avis",
        "Favoris",
        "Créé le",
      ],
      ...produits.map((produit) => [
        produit.id,
        `"${produit.libelle}"`,
        produit.prix,
        produit.quantite,
        produit.statut,
        `"${produit.categorie?.libelle || ""}"`,
        produit.etoile,
        produit.nombre_avis,
        produit.nombre_favoris,
        produit.createdAt
          ? new Date(produit.createdAt).toLocaleDateString("fr-FR")
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
      `produits-utilisateur-${new Date().toISOString().split("T")[0]}.csv`,
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
          });
    } catch {
      return "N/A";
    }
  };

  const formatPrice = (price: string) => {
    try {
      const numericPrice = parseFloat(price);
      return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "XOF",
        minimumFractionDigits: 0,
      }).format(numericPrice);
    } catch {
      return `${price} CFA`;
    }
  };

  // Gestion de la sélection multiple
  const handleSelectProduit = (produitUuid: string) => {
    setSelectedProduits((prev) => {
      if (prev.includes(produitUuid)) {
        return prev.filter((id) => id !== produitUuid);
      } else {
        return [...prev, produitUuid];
      }
    });
  };

  const handleSelectAllOnPage = () => {
    const pageProduitIds = currentItems.map((produit) => produit.uuid);
    const allSelected = pageProduitIds.every((id) =>
      selectedProduits.includes(id),
    );

    if (allSelected) {
      setSelectedProduits((prev) =>
        prev.filter((id) => !pageProduitIds.includes(id)),
      );
    } else {
      const newSelection = [
        ...new Set([...selectedProduits, ...pageProduitIds]),
      ];
      setSelectedProduits(newSelection);
    }
  };

  // Actions en masse
  const handleBulkAction = async (
    action: "publish" | "unpublish" | "block" | "delete",
  ) => {
    if (selectedProduits.length === 0) {
      setInfoMessage("Veuillez sélectionner au moins un produit");
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

      for (const produitUuid of selectedProduits) {
        try {
          const produit = produits.find((p) => p.uuid === produitUuid);
          if (!produit) continue;

          if (action === "publish") {
            await api.post(API_ENDPOINTS.PRODUCTS.PUBLISH, {
              uuid: produitUuid,
            });
          } else if (action === "block") {
            await api.put(
              `${API_ENDPOINTS.PRODUCTS.DETAIL(produitUuid)}/bloquer`,
            );
          } else if (action === "unpublish") {
            await api.put(
              `${API_ENDPOINTS.PRODUCTS.DETAIL(produitUuid)}/unpublish`,
            );
          }
          successCount++;
        } catch (err) {
          console.error(`Erreur pour le produit ${produitUuid}:`, err);
          errorCount++;
        }
      }

      setSuccessMessage(
        `${successCount} produit(s) ${action === "publish" ? "publié(s)" : action === "block" ? "bloqué(s)" : "dépublié(s)"} avec succès${errorCount > 0 ? ` (${errorCount} échec(s))` : ""}`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);

      fetchProduits();
      setSelectedProduits([]);
      setSelectAll(false);
    } catch (err) {
      console.error("Erreur lors de l'action en masse:", err);
      setError("Erreur lors de l'action en masse");
      setTimeout(() => setError(null), 3000);
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Pagination
  const currentItems = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    return filteredProduits.slice(startIndex, startIndex + pagination.limit);
  }, [filteredProduits, pagination.page, pagination.limit]);

  // Mettre à jour la pagination quand les données filtrées changent
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      total: filteredProduits.length,
      pages: Math.ceil(filteredProduits.length / prev.limit),
    }));
  }, [filteredProduits]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setSortConfig(null);
    setPagination((prev) => ({ ...prev, page: 1 }));
    setSelectedProduits([]);
    setSelectAll(false);
  };

  // Effet pour mettre à jour selectAll
  useEffect(() => {
    if (currentItems.length > 0) {
      const allSelected = currentItems.every((produit) =>
        selectedProduits.includes(produit.uuid),
      );
      setSelectAll(allSelected);
    } else {
      setSelectAll(false);
    }
  }, [selectedProduits, currentItems]);

  // Statistiques
  const stats = {
    total: produits.length,
    published: produits.filter((p) => p.statut?.toLowerCase() === "publie")
      .length,
    draft: produits.filter((p) => p.statut?.toLowerCase() === "draft").length,
    blocked: produits.filter((p) => p.statut?.toLowerCase() === "bloque")
      .length,
  };

  return (
    <>
      {/* Modals */}
      <CreateProduitModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={(message) => handleSuccess(message)}
      />
      {selectedProduit && (
        <EditProduitModal
          isOpen={showEditModal}
          produit={selectedProduit}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProduit(null);
          }}
          onSuccess={(message) => handleSuccess(message)}
        />
      )}
      {selectedProduit && (
        <ViewProduitModal
          isOpen={showViewModal}
          produit={selectedProduit}
          onClose={() => {
            setShowViewModal(false);
            setSelectedProduit(null);
          }}
        />
      )}
      <DeleteProduitModal
        show={showDeleteModal}
        produit={selectedProduit}
        loading={deleteLoading}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedProduit(null);
        }}
        onConfirm={handleDelete}
        type="single"
      />
      <DeleteProduitModal
        show={showDeleteMultipleModal}
        produit={null}
        loading={deleteLoading}
        onClose={() => setShowDeleteMultipleModal(false)}
        onConfirm={handleDeleteMultiple}
        type="multiple"
        count={selectedProduits.length}
      />

      <div className="p-3 p-md-4">
        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="card-header bg-white border-0 py-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div>
                <p className="text-muted mb-1">Gestion des Produits</p>
                <div className="d-flex align-items-center gap-3">
                  <h2 className="h4 mb-0 fw-bold">Mes Produits</h2>
                  <span className="badge bg-primary bg-opacity-10 text-primary">
                    {stats.total} produit(s){" "}
                    {selectedProduits.length > 0 &&
                      `(${selectedProduits.length} sélectionné(s))`}
                  </span>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <button
                  onClick={() => fetchProduits()}
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faRefresh} spin={loading} />
                  Rafraîchir
                </button>

                <button
                  onClick={handleExport}
                  className="btn btn-outline-primary d-flex align-items-center gap-2"
                  disabled={produits.length === 0 || loading}
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Exporter
                </button>

                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-primary text-white d-flex align-items-center gap-2"
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
          {selectedProduits.length > 0 && (
            <div className="p-3 border-bottom bg-primary bg-opacity-10">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                <div className="d-flex align-items-center gap-2">
                  <FontAwesomeIcon icon={faBox} className="text-primary" />
                  <span className="fw-semibold">
                    {selectedProduits.length} produit(s) sélectionné(s)
                  </span>
                </div>

                <div className="d-flex flex-wrap gap-2">
                  <button
                    className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                    onClick={() => handleBulkAction("publish")}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} />
                    <span>Publier</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                    onClick={() => handleBulkAction("unpublish")}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faTimesCircle} />
                    <span>Dépublier</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                    onClick={() => handleBulkAction("block")}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faBan} />
                    <span>Bloquer</span>
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
                      setSelectedProduits([]);
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
              <div className="col-md-8">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faSearch} className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Rechercher par libellé, description, type..."
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
                    <option value="publie">Publiés</option>
                    <option value="draft">Brouillons</option>
                    <option value="bloque">Bloqués</option>
                    <option value="en_attente">En attente</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-md-8">
                <div className="d-flex align-items-center gap-2">
                  <small className="text-muted">
                    Résultats: <strong>{filteredProduits.length}</strong>{" "}
                    produit(s)
                    {searchTerm && (
                      <>
                        {" "}
                        pour "<strong>{searchTerm}</strong>"
                      </>
                    )}
                    {selectedStatus !== "all" && (
                      <>
                        {" "}
                        avec statut "
                        <strong>
                          {selectedStatus === "publie"
                            ? "Publié"
                            : selectedStatus === "draft"
                              ? "Brouillon"
                              : selectedStatus === "bloque"
                                ? "Bloqué"
                                : "En attente"}
                        </strong>
                        "
                      </>
                    )}
                  </small>
                </div>
              </div>

              <div className="col-md-4 text-end">
                <div className="d-flex align-items-center gap-2 justify-content-end">
                  {selectedProduits.length > 0 && (
                    <small className="text-primary fw-semibold">
                      {selectedProduits.length} sélectionné(s)
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

          {/* Tableau des produits */}
          <div className="table-responsive">
            {loading ? (
              <LoadingSkeleton />
            ) : filteredProduits.length === 0 ? (
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
                    {produits.length === 0
                      ? "Aucun produit trouvé"
                      : "Aucun résultat"}
                  </h5>
                  <p className="mb-0 text-center">
                    {produits.length === 0
                      ? "Aucun produit dans votre liste."
                      : "Aucun produit ne correspond à vos critères de recherche."}
                  </p>
                  {produits.length === 0 ? (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="btn btn-primary text-white mt-3"
                    >
                      <FontAwesomeIcon icon={faPlus} className="me-2" />
                      Créer votre premier produit
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
                      <th style={{ width: "120px" }} className="text-center">
                        <span className="fw-semibold">Image</span>
                      </th>
                      <th style={{ width: "300px" }}>
                        <button
                          className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                          onClick={() => requestSort("libelle")}
                        >
                          <FontAwesomeIcon icon={faTag} className="me-1" />
                          Produit
                          {getSortIcon("libelle")}
                        </button>
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
                      <th style={{ width: "100px" }}>
                        <button
                          className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                          onClick={() => requestSort("quantite")}
                        >
                          <FontAwesomeIcon icon={faBoxOpen} className="me-1" />
                          Qté
                          {getSortIcon("quantite")}
                        </button>
                      </th>
                      <th style={{ width: "120px" }}>
                        <span className="fw-semibold">Statut</span>
                      </th>
                      <th style={{ width: "140px" }} className="text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((produit, index) => (
                      <tr
                        key={produit.uuid}
                        className={`align-middle ${selectedProduits.includes(produit.uuid) ? "table-active" : ""}`}
                      >
                        <td className="text-center">
                          <div className="form-check d-flex justify-content-center">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={selectedProduits.includes(produit.uuid)}
                              onChange={() => handleSelectProduit(produit.uuid)}
                            />
                          </div>
                        </td>
                        <td className="text-center text-muted fw-semibold">
                          {(pagination.page - 1) * pagination.limit + index + 1}
                        </td>
                        <td className="text-center">
                          {produit.image ? (
                            <div
                              className="position-relative mx-auto"
                              style={{ width: "60px", height: "60px" }}
                            >
                              <img
                                src={produit.image}
                                alt={produit.libelle}
                                className="img-fluid rounded border"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    `https://via.placeholder.com/60/007bff/ffffff?text=${produit.libelle?.charAt(0) || "P"}`;
                                }}
                              />
                            </div>
                          ) : (
                            <div
                              className="bg-primary bg-opacity-10 rounded d-flex align-items-center justify-content-center mx-auto"
                              style={{ width: "60px", height: "60px" }}
                            >
                              <FontAwesomeIcon
                                icon={faBox}
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
                                <FontAwesomeIcon icon={faBox} />
                              </div>
                            </div>
                            <div className="flex-grow-1 ms-3">
                              <div className="fw-semibold">
                                {produit.libelle}
                              </div>
                              {produit.description && (
                                <small
                                  className="text-muted text-truncate d-block"
                                  style={{
                                    maxWidth: "250px",
                                    fontSize: "0.75rem",
                                  }}
                                  title={produit.description}
                                >
                                  {produit.description}
                                </small>
                              )}
                              <div className="d-flex flex-wrap gap-2 mt-1">
                                {produit.type && (
                                  <span
                                    className="badge bg-info bg-opacity-10 text-info"
                                    style={{ fontSize: "0.65rem" }}
                                  >
                                    {produit.type}
                                  </span>
                                )}
                                {produit.categorie && (
                                  <span
                                    className="badge bg-secondary bg-opacity-10 text-secondary"
                                    style={{ fontSize: "0.65rem" }}
                                  >
                                    {produit.categorie.libelle}
                                  </span>
                                )}
                                <span
                                  className="badge bg-warning bg-opacity-10 text-warning"
                                  style={{ fontSize: "0.65rem" }}
                                >
                                  <FontAwesomeIcon
                                    icon={faStar}
                                    className="me-1"
                                  />
                                  {produit.etoile} ({produit.note_moyenne})
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="fw-bold text-primary">
                            {formatPrice(produit.prix)}
                          </div>
                          <small className="text-muted d-block">
                            {produit.nombre_favoris} favoris
                          </small>
                        </td>
                        <td>
                          <div className="fw-semibold">{produit.quantite}</div>
                          <div
                            className={`badge ${produit.disponible ? "bg-success bg-opacity-10 text-success" : "bg-danger bg-opacity-10 text-danger"}`}
                          >
                            {produit.disponible ? "Disponible" : "Indisponible"}
                          </div>
                        </td>
                        <td>
                          <StatusBadge statut={produit.statut} />
                          <div className="mt-2">
                            <small className="text-muted d-block">
                              Avis: {produit.nombre_avis}
                            </small>
                          </div>
                        </td>
                        <td className="text-center">
                          <div className="btn-group btn-group-sm" role="group">
                            <button
                              className="btn btn-outline-info"
                              title="Voir détails"
                              onClick={() => {
                                setSelectedProduit(produit);
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
                                setSelectedProduit(produit);
                                setShowEditModal(true);
                              }}
                              disabled={loading}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              title="Supprimer"
                              onClick={() => openDeleteModal(produit)}
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
                {filteredProduits.length > pagination.limit && (
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.pages}
                    totalItems={filteredProduits.length}
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
        .object-fit-cover {
          object-fit: cover;
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
