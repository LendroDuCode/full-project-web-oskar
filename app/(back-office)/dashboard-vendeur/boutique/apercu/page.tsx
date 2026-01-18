"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStore,
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
  faClock,
  faBan,
  faLock,
  faLockOpen,
  faInfoCircle,
  faCheck,
  faTimes,
  faSpinner,
  faImage,
  faExclamationTriangle,
  faShoppingBag,
  faStar,
  faBoxes,
  faChartLine,
  faGlobe,
  faUsers,
  faTags,
  faHeart,
  faStoreAlt,
  faCheckSquare,
  faSquare,
  faShoppingBasket,
  faLayerGroup,
  faToggleOn,
  faToggleOff,
  faEllipsisV,
  faBan as faBanSolid,
  faStore as faStoreSolid,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";

// ============ TYPES ============
interface TypeBoutique {
  uuid: string;
  code: string;
  libelle: string;
  description: string | null;
  peut_vendre_produits: boolean;
  peut_vendre_biens: boolean;
  image: string;
  statut: string;
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
  logo_key: string;
  banniere_key: string;
  statut: "en_review" | "actif" | "bloque" | "ferme";
  created_at: string;
  updated_at: string;
  type_boutique: TypeBoutique;
  vendeurUuid: string;
  agentUuid: string | null;
  est_bloque: boolean;
  est_ferme: boolean;
}

interface PaginatedResponse {
  data: Boutique[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============ COMPOSANTS ============

// Composant de badge de statut boutique
const BoutiqueStatusBadge = ({
  statut,
  est_bloque,
  est_ferme,
}: {
  statut: string;
  est_bloque: boolean;
  est_ferme: boolean;
}) => {
  if (est_bloque) {
    return (
      <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25">
        <FontAwesomeIcon icon={faBanSolid} className="me-1" />
        Bloqué
      </span>
    );
  }

  if (est_ferme) {
    return (
      <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25">
        <FontAwesomeIcon icon={faLock} className="me-1" />
        Fermé
      </span>
    );
  }

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
          <span className="fw-semibold">{totalItems}</span> boutiques
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

          {[...Array(totalPages)].map((_, i) => {
            const pageNumber = i + 1;
            const showPage =
              pageNumber === 1 ||
              pageNumber === totalPages ||
              (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1);

            if (!showPage) {
              if (
                pageNumber === currentPage - 2 ||
                pageNumber === currentPage + 2
              ) {
                return (
                  <li key={i} className="page-item disabled">
                    <span className="page-link">...</span>
                  </li>
                );
              }
              return null;
            }

            return (
              <li
                key={i}
                className={`page-item ${currentPage === pageNumber ? "active" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => onPageChange(pageNumber)}
                >
                  {pageNumber}
                </button>
              </li>
            );
          })}

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
              Suppression multiple de boutiques
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
              <strong>{count} boutique(s)</strong> sélectionnée(s) ?
            </p>
            <div className="text-danger small">
              Cette action est irréversible. Tous les produits, commandes et
              données associés à ces boutiques seront perdus.
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
                  Supprimer {count} boutique(s)
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

export default function ListeBoutiquesVendeur() {
  const router = useRouter();

  // États
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // États pour la sélection multiple
  const [selectedBoutiques, setSelectedBoutiques] = useState<Set<string>>(
    new Set(),
  );
  const [selectAll, setSelectAll] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
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

  // États pour les types de boutique uniques (pour les filtres)
  const [uniqueTypes, setUniqueTypes] = useState<TypeBoutique[]>([]);

  // Charger les boutiques
  const fetchBoutiques = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== "all") params.statut = statusFilter;

      const response = await api.get<PaginatedResponse>(
        API_ENDPOINTS.BOUTIQUES.LISTE_BOUTIQUES_CREE_PAR_VENDEUR,
      );

      setBoutiques(response.data);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        pages: response.totalPages,
      });

      // Extraire les types de boutique uniques pour les filtres
      const types = response.data.reduce((acc: TypeBoutique[], boutique) => {
        if (!acc.find((t) => t.uuid === boutique.type_boutique.uuid)) {
          acc.push(boutique.type_boutique);
        }
        return acc;
      }, []);
      setUniqueTypes(types);
    } catch (err: any) {
      console.error("❌ Erreur lors du chargement des boutiques:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors du chargement des boutiques",
      );
      setBoutiques([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, statusFilter]);

  // Charger les données au montage et quand les paramètres changent
  useEffect(() => {
    fetchBoutiques();
  }, [fetchBoutiques]);

  // Formater la date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

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
      return <FontAwesomeIcon icon={faSort} className="text-muted ms-1" />;
    }
    return sortConfig.direction === "asc" ? (
      <FontAwesomeIcon icon={faSortUp} className="text-primary ms-1" />
    ) : (
      <FontAwesomeIcon icon={faSortDown} className="text-primary ms-1" />
    );
  };

  // Filtrer et trier les boutiques
  const filteredBoutiques = useMemo(() => {
    let result = [...boutiques];

    // Filtrage par type de boutique
    if (typeFilter !== "all") {
      result = result.filter(
        (boutique) => boutique.type_boutique.uuid === typeFilter,
      );
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

        if (sortConfig.key === "created_at") {
          return sortConfig.direction === "asc"
            ? new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            : new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime();
        }

        return 0;
      });
    }

    return result;
  }, [boutiques, typeFilter, sortConfig]);

  // Gestion des succès
  const handleSuccess = (message: string) => {
    setSuccessMessage(message);
    fetchBoutiques();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Gestion de la sélection multiple
  const handleSelectBoutique = (boutiqueUuid: string) => {
    setSelectedBoutiques((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(boutiqueUuid)) {
        newSet.delete(boutiqueUuid);
      } else {
        newSet.add(boutiqueUuid);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      // Désélectionner tout
      setSelectedBoutiques(new Set());
    } else {
      // Sélectionner toutes les boutiques filtrées
      const allBoutiqueIds = new Set(filteredBoutiques.map((b) => b.uuid));
      setSelectedBoutiques(allBoutiqueIds);
    }
    setSelectAll(!selectAll);
  };

  const handleSelectAllOnPage = () => {
    const allSelected = filteredBoutiques.every((b) =>
      selectedBoutiques.has(b.uuid),
    );

    if (allSelected) {
      // Désélectionner toutes les boutiques de la page
      const newSet = new Set(selectedBoutiques);
      filteredBoutiques.forEach((b) => newSet.delete(b.uuid));
      setSelectedBoutiques(newSet);
    } else {
      // Sélectionner toutes les boutiques de la page
      const newSet = new Set(selectedBoutiques);
      filteredBoutiques.forEach((b) => newSet.add(b.uuid));
      setSelectedBoutiques(newSet);
    }
  };

  // Mettre à jour selectAll quand selectedBoutiques change
  useEffect(() => {
    if (filteredBoutiques.length > 0) {
      const allSelected = filteredBoutiques.every((b) =>
        selectedBoutiques.has(b.uuid),
      );
      setSelectAll(allSelected);
    } else {
      setSelectAll(false);
    }
  }, [selectedBoutiques, filteredBoutiques]);

  // Navigation vers les détails d'une boutique
  const handleViewBoutique = (boutiqueUuid: string) => {
    router.push(`/dashboard-vendeur/boutique/apercu/${boutiqueUuid}`);
  };

  // Navigation vers l'édition d'une boutique
  const handleEditBoutique = (boutiqueUuid: string) => {
    router.push(`/dashboard/boutiques/${boutiqueUuid}/edit`);
  };

  // Actions en masse sur les boutiques
  const handleBulkAction = async (
    action:
      | "activate"
      | "deactivate"
      | "block"
      | "unblock"
      | "close"
      | "open"
      | "delete",
  ) => {
    if (selectedBoutiques.size === 0) {
      setError("Veuillez sélectionner au moins une boutique");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (action === "delete") {
      setShowBulkDeleteModal(true);
      return;
    }

    try {
      setBulkActionLoading(true);
      let successCount = 0;
      let errorCount = 0;

      for (const boutiqueUuid of selectedBoutiques) {
        try {
          const boutique = boutiques.find((b) => b.uuid === boutiqueUuid);
          if (!boutique) continue;

          switch (action) {
            case "block":
              await api.put(API_ENDPOINTS.BOUTIQUES.BLOCK(boutiqueUuid));
              break;
            case "unblock":
              await api.put(API_ENDPOINTS.BOUTIQUES.UNBLOCK(boutiqueUuid));
              break;
            case "close":
              await api.put(API_ENDPOINTS.BOUTIQUES.CLOSE(boutiqueUuid));
              break;
            case "open":
              // Note: Vérifiez si vous avez un endpoint pour réouvrir une boutique
              // Sinon, utilisez un endpoint de mise à jour
              await api.put(API_ENDPOINTS.BOUTIQUES.UNBLOCK(boutiqueUuid));
              break;
            case "activate":
              // Pour changer le statut en "actif"
              await api.put(API_ENDPOINTS.BOUTIQUES.DETAIL(boutiqueUuid), {
                statut: "actif",
              });
              break;
            case "deactivate":
              // Pour changer le statut en "en_review"
              await api.put(API_ENDPOINTS.BOUTIQUES.DETAIL(boutiqueUuid), {
                statut: "en_review",
              });
              break;
          }
          successCount++;
        } catch (err) {
          console.error(`Erreur pour la boutique ${boutiqueUuid}:`, err);
          errorCount++;
        }
      }

      handleSuccess(
        `${successCount} boutique(s) traité(s) avec succès${errorCount > 0 ? ` (${errorCount} échec(s))` : ""}`,
      );

      // Rafraîchir la liste et réinitialiser la sélection
      fetchBoutiques();
      setSelectedBoutiques(new Set());
      setSelectAll(false);
    } catch (err: any) {
      console.error("Erreur lors de l'action en masse:", err);
      setError("Erreur lors de l'action en masse");
      setTimeout(() => setError(null), 3000);
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Suppression en masse des boutiques
  const handleBulkDelete = async () => {
    try {
      setBulkActionLoading(true);
      let successCount = 0;
      let errorCount = 0;

      for (const boutiqueUuid of selectedBoutiques) {
        try {
          await api.delete(API_ENDPOINTS.BOUTIQUES.DELETE(boutiqueUuid));
          successCount++;
        } catch (err) {
          console.error(`Erreur pour la boutique ${boutiqueUuid}:`, err);
          errorCount++;
        }
      }

      handleSuccess(
        `${successCount} boutique(s) supprimée(s) avec succès${errorCount > 0 ? ` (${errorCount} échec(s))` : ""}`,
      );

      // Rafraîchir la liste et réinitialiser la sélection
      fetchBoutiques();
      setSelectedBoutiques(new Set());
      setSelectAll(false);
      setShowBulkDeleteModal(false);
    } catch (err: any) {
      console.error("Erreur lors de la suppression en masse:", err);
      setError("Erreur lors de la suppression en masse");
      setTimeout(() => setError(null), 3000);
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Suppression d'une boutique individuelle
  const handleDeleteBoutique = async (boutiqueUuid: string) => {
    try {
      await api.delete(API_ENDPOINTS.BOUTIQUES.DELETE(boutiqueUuid));
      handleSuccess("Boutique supprimée avec succès !");
    } catch (err: any) {
      console.error("❌ Erreur suppression:", err);
      setError(err.response?.data?.message || "Erreur lors de la suppression");
      setTimeout(() => setError(null), 3000);
    }
  };

  // Navigation vers la création d'une boutique
  const handleCreateBoutique = () => {
    router.push("/dashboard/boutiques/create");
  };

  // Réinitialiser les filtres et la sélection
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
    setSortConfig(null);
    setSelectedBoutiques(new Set());
    setSelectAll(false);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Export CSV
  const handleExport = () => {
    if (boutiques.length === 0) {
      setError("Aucune boutique à exporter");
      setTimeout(() => setError(null), 3000);
      return;
    }

    const csvContent = [
      ["Nom", "Type", "Statut", "Slug", "Date création", "Bloqué", "Fermé"],
      ...boutiques.map((boutique) => [
        `"${boutique.nom || ""}"`,
        boutique.type_boutique.libelle,
        boutique.statut,
        boutique.slug,
        formatDate(boutique.created_at),
        boutique.est_bloque ? "Oui" : "Non",
        boutique.est_ferme ? "Oui" : "Non",
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
      `mes-boutiques-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    handleSuccess("Export CSV réussi !");
  };

  // Statistiques
  const stats = useMemo(() => {
    return {
      total: boutiques.length,
      actives: boutiques.filter((b) => b.statut === "actif").length,
      enReview: boutiques.filter((b) => b.statut === "en_review").length,
      bloquees: boutiques.filter((b) => b.est_bloque || b.statut === "bloque")
        .length,
      fermees: boutiques.filter((b) => b.est_ferme).length,
      typesCount: uniqueTypes.length,
    };
  }, [boutiques, uniqueTypes]);

  // Effet pour réinitialiser la sélection quand les filtres changent
  useEffect(() => {
    setSelectedBoutiques(new Set());
    setSelectAll(false);
  }, [searchTerm, statusFilter, typeFilter]);

  return (
    <>
      {/* Modal de suppression en masse */}
      <BulkDeleteModal
        show={showBulkDeleteModal}
        count={selectedBoutiques.size}
        loading={bulkActionLoading}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleBulkDelete}
      />

      <div className="container-fluid p-3 p-md-4">
        {/* En-tête de la page */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
              <div>
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                      <a href="/dashboard" className="text-decoration-none">
                        Dashboard
                      </a>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                      Mes Boutiques
                    </li>
                  </ol>
                </nav>
                <h1 className="h2 fw-bold mb-2">Mes Boutiques</h1>
                <p className="text-muted mb-0">
                  Gérez toutes vos boutiques en un seul endroit
                </p>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <button
                  onClick={() => fetchBoutiques()}
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faRefresh} spin={loading} />
                  <span className="d-none d-md-inline">Rafraîchir</span>
                </button>

                <button
                  onClick={handleExport}
                  className="btn btn-outline-primary d-flex align-items-center gap-2"
                  disabled={boutiques.length === 0 || loading}
                >
                  <FontAwesomeIcon icon={faDownload} />
                  <span className="d-none d-md-inline">Exporter CSV</span>
                </button>

                <button
                  onClick={handleCreateBoutique}
                  className="btn btn-success d-flex align-items-center gap-2"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  <span className="d-none d-md-inline">Nouvelle boutique</span>
                </button>
              </div>
            </div>

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
          </div>
        </div>

        {/* Statistiques */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-3 col-sm-6">
                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                        <FontAwesomeIcon
                          icon={faStoreSolid}
                          className="text-primary fs-4"
                        />
                      </div>
                      <div>
                        <h3 className="mb-0 fw-bold">{stats.total}</h3>
                        <small className="text-muted">Total boutiques</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 col-sm-6">
                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-success bg-opacity-10 rounded-circle p-3">
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="text-success fs-4"
                        />
                      </div>
                      <div>
                        <h3 className="mb-0 fw-bold">{stats.actives}</h3>
                        <small className="text-muted">Actives</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 col-sm-6">
                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                        <FontAwesomeIcon
                          icon={faClock}
                          className="text-warning fs-4"
                        />
                      </div>
                      <div>
                        <h3 className="mb-0 fw-bold">{stats.enReview}</h3>
                        <small className="text-muted">En revue</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 col-sm-6">
                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-info bg-opacity-10 rounded-circle p-3">
                        <FontAwesomeIcon
                          icon={faTags}
                          className="text-info fs-4"
                        />
                      </div>
                      <div>
                        <h3 className="mb-0 fw-bold">{stats.typesCount}</h3>
                        <small className="text-muted">Types différents</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="row g-3">
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
                        placeholder="Rechercher une boutique..."
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
                        <FontAwesomeIcon
                          icon={faFilter}
                          className="text-muted"
                        />
                      </span>
                      <select
                        className="form-select border-start-0 ps-0"
                        value={statusFilter}
                        onChange={(e) => {
                          setStatusFilter(e.target.value);
                          setPagination((prev) => ({ ...prev, page: 1 }));
                        }}
                      >
                        <option value="all">Tous les statuts</option>
                        <option value="actif">Actives</option>
                        <option value="en_review">En revue</option>
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
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        disabled={uniqueTypes.length === 0}
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
                    <button
                      onClick={resetFilters}
                      className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2"
                      disabled={loading}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                      <span className="d-none d-md-inline">Reset</span>
                    </button>
                  </div>
                </div>

                {/* Résultats de recherche */}
                <div className="row mt-3">
                  <div className="col-12">
                    <div className="d-flex align-items-center gap-2">
                      <small className="text-muted">
                        Résultats: <strong>{filteredBoutiques.length}</strong>{" "}
                        boutique(s)
                        {searchTerm && (
                          <>
                            {" "}
                            pour "<strong>{searchTerm}</strong>"
                          </>
                        )}
                        {statusFilter !== "all" && (
                          <>
                            {" "}
                            avec statut "
                            <strong>
                              {statusFilter === "actif"
                                ? "Actif"
                                : statusFilter === "en_review"
                                  ? "En revue"
                                  : statusFilter === "bloque"
                                    ? "Bloqué"
                                    : "Fermé"}
                            </strong>
                            "
                          </>
                        )}
                        {typeFilter !== "all" && uniqueTypes.length > 0 && (
                          <>
                            {" "}
                            de type "
                            <strong>
                              {
                                uniqueTypes.find((t) => t.uuid === typeFilter)
                                  ?.libelle
                              }
                            </strong>
                            "
                          </>
                        )}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tableau des boutiques */}
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              {/* Barre d'actions en masse */}
              {selectedBoutiques.size > 0 && (
                <div className="p-3 border-bottom bg-warning bg-opacity-10">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                    <div className="d-flex align-items-center gap-2">
                      <FontAwesomeIcon
                        icon={faShoppingBasket}
                        className="text-warning"
                      />
                      <span className="fw-semibold">
                        {selectedBoutiques.size} boutique(s) sélectionnée(s)
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
                        className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                        onClick={() => handleBulkAction("deactivate")}
                        disabled={bulkActionLoading}
                      >
                        <FontAwesomeIcon icon={faClock} />
                        <span>En revue</span>
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
                        className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                        onClick={() => handleBulkAction("unblock")}
                        disabled={bulkActionLoading}
                      >
                        <FontAwesomeIcon icon={faLockOpen} />
                        <span>Débloquer</span>
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
                          setSelectedBoutiques(new Set());
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

              <div className="card-body p-0">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Chargement...</span>
                    </div>
                    <p className="mt-3 text-muted">
                      Chargement des boutiques...
                    </p>
                  </div>
                ) : filteredBoutiques.length === 0 ? (
                  <div className="text-center py-5">
                    <div
                      className="alert alert-info mx-auto border-0"
                      style={{ maxWidth: "500px" }}
                    >
                      <FontAwesomeIcon
                        icon={faStore}
                        className="fs-1 mb-3 text-info"
                      />
                      <h5 className="alert-heading">
                        {boutiques.length === 0
                          ? "Aucune boutique trouvée"
                          : "Aucun résultat"}
                      </h5>
                      <p className="mb-0">
                        {boutiques.length === 0
                          ? "Vous n'avez pas encore créé de boutique."
                          : "Aucune boutique ne correspond à vos critères de recherche."}
                      </p>
                      {boutiques.length === 0 && (
                        <button
                          onClick={handleCreateBoutique}
                          className="btn btn-primary mt-3"
                        >
                          <FontAwesomeIcon icon={faPlus} className="me-2" />
                          Créer ma première boutique
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Options de sélection */}
                    <div className="p-4 border-bottom">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3">
                          <button
                            onClick={handleSelectAll}
                            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2"
                            disabled={filteredBoutiques.length === 0}
                            title={
                              selectAll
                                ? "Tout désélectionner"
                                : "Tout sélectionner"
                            }
                          >
                            <FontAwesomeIcon
                              icon={selectAll ? faCheckSquare : faSquare}
                            />
                            <span className="d-none d-md-inline">
                              {selectAll
                                ? "Tout désélectionner"
                                : "Tout sélectionner"}
                            </span>
                          </button>

                          <button
                            onClick={handleSelectAllOnPage}
                            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2"
                            disabled={filteredBoutiques.length === 0}
                            title="Sélectionner/désélectionner cette page"
                          >
                            <FontAwesomeIcon icon={faLayerGroup} />
                            <span className="d-none d-md-inline">
                              Page actuelle
                            </span>
                          </button>
                        </div>

                        <div className="d-flex align-items-center gap-3">
                          {selectedBoutiques.size > 0 && (
                            <small className="text-primary fw-semibold">
                              {selectedBoutiques.size} sélectionnée(s)
                            </small>
                          )}
                          <div className="dropdown">
                            <button
                              className="btn btn-outline-secondary btn-sm dropdown-toggle"
                              type="button"
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                            >
                              <FontAwesomeIcon icon={faSort} className="me-1" />
                              Trier
                            </button>
                            <ul className="dropdown-menu">
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() => requestSort("nom")}
                                >
                                  Par nom {getSortIcon("nom")}
                                </button>
                              </li>
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() => requestSort("created_at")}
                                >
                                  Par date {getSortIcon("created_at")}
                                </button>
                              </li>
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() => requestSort("statut")}
                                >
                                  Par statut {getSortIcon("statut")}
                                </button>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tableau */}
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th
                              style={{ width: "50px" }}
                              className="text-center"
                            >
                              <div className="form-check d-flex justify-content-center">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={
                                    selectAll && filteredBoutiques.length > 0
                                  }
                                  onChange={handleSelectAll}
                                  disabled={filteredBoutiques.length === 0}
                                  title={
                                    selectAll
                                      ? "Tout désélectionner"
                                      : "Tout sélectionner"
                                  }
                                />
                              </div>
                            </th>
                            <th style={{ width: "40px" }}>#</th>
                            <th style={{ width: "80px" }}>
                              <span className="fw-semibold">Logo</span>
                            </th>
                            <th style={{ width: "200px" }}>
                              <button
                                className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                                onClick={() => requestSort("nom")}
                              >
                                Nom de la boutique
                                {getSortIcon("nom")}
                              </button>
                            </th>
                            <th style={{ width: "150px" }}>
                              <span className="fw-semibold">Type</span>
                            </th>
                            <th style={{ width: "120px" }}>
                              <button
                                className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                                onClick={() => requestSort("statut")}
                              >
                                Statut
                                {getSortIcon("statut")}
                              </button>
                            </th>
                            <th style={{ width: "120px" }}>
                              <span className="fw-semibold">Slug</span>
                            </th>
                            <th style={{ width: "150px" }}>
                              <button
                                className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                                onClick={() => requestSort("created_at")}
                              >
                                Date création
                                {getSortIcon("created_at")}
                              </button>
                            </th>
                            <th
                              style={{ width: "160px" }}
                              className="text-center"
                            >
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredBoutiques.map((boutique, index) => {
                            const startIndex =
                              (pagination.page - 1) * pagination.limit;
                            const displayIndex = startIndex + index + 1;
                            const isSelected = selectedBoutiques.has(
                              boutique.uuid,
                            );

                            return (
                              <tr
                                key={boutique.uuid}
                                className={`align-middle ${isSelected ? "table-active" : ""}`}
                              >
                                <td className="text-center">
                                  <div className="form-check d-flex justify-content-center">
                                    <input
                                      type="checkbox"
                                      className="form-check-input"
                                      checked={isSelected}
                                      onChange={() =>
                                        handleSelectBoutique(boutique.uuid)
                                      }
                                    />
                                  </div>
                                </td>
                                <td className="text-center text-muted fw-semibold">
                                  {displayIndex}
                                </td>
                                <td>
                                  {boutique.logo ? (
                                    <img
                                      src={boutique.logo}
                                      alt={boutique.nom}
                                      className="rounded border"
                                      style={{
                                        width: "60px",
                                        height: "60px",
                                        objectFit: "cover",
                                      }}
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                          `https://via.placeholder.com/60/cccccc/ffffff?text=${boutique.nom?.charAt(0) || "B"}`;
                                      }}
                                    />
                                  ) : (
                                    <div
                                      className="bg-secondary bg-opacity-10 rounded d-flex align-items-center justify-content-center"
                                      style={{ width: "60px", height: "60px" }}
                                    >
                                      <FontAwesomeIcon
                                        icon={faStore}
                                        className="text-muted"
                                      />
                                    </div>
                                  )}
                                </td>
                                <td>
                                  <div className="fw-semibold">
                                    {boutique.nom}
                                  </div>
                                  {boutique.description && (
                                    <small
                                      className="text-muted d-block"
                                      style={{ fontSize: "0.75rem" }}
                                    >
                                      {boutique.description.substring(0, 50)}...
                                    </small>
                                  )}
                                </td>
                                <td>
                                  <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25">
                                    {boutique.type_boutique.libelle}
                                  </span>
                                </td>
                                <td>
                                  <BoutiqueStatusBadge
                                    statut={boutique.statut}
                                    est_bloque={boutique.est_bloque}
                                    est_ferme={boutique.est_ferme}
                                  />
                                </td>
                                <td>
                                  <code className="small">{boutique.slug}</code>
                                </td>
                                <td>
                                  <div className="small">
                                    <div>
                                      <FontAwesomeIcon
                                        icon={faCalendar}
                                        className="me-1"
                                      />
                                      {formatDate(boutique.created_at)}
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
                                      onClick={() =>
                                        handleViewBoutique(boutique.uuid)
                                      }
                                    >
                                      <FontAwesomeIcon icon={faEye} />
                                    </button>
                                    <button
                                      className="btn btn-outline-warning"
                                      title="Modifier"
                                      onClick={() =>
                                        handleEditBoutique(boutique.uuid)
                                      }
                                    >
                                      <FontAwesomeIcon icon={faEdit} />
                                    </button>
                                    {boutique.est_bloque ? (
                                      <button
                                        className="btn btn-outline-success"
                                        title="Débloquer"
                                        onClick={() =>
                                          handleBulkAction("unblock")
                                        }
                                      >
                                        <FontAwesomeIcon icon={faLockOpen} />
                                      </button>
                                    ) : (
                                      <button
                                        className="btn btn-outline-secondary"
                                        title="Bloquer"
                                        onClick={() =>
                                          handleBulkAction("block")
                                        }
                                      >
                                        <FontAwesomeIcon icon={faBan} />
                                      </button>
                                    )}
                                    <button
                                      className="btn btn-outline-danger"
                                      title="Supprimer"
                                      onClick={() =>
                                        handleDeleteBoutique(boutique.uuid)
                                      }
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
                    </div>

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
        </div>

        {/* Bouton flottant pour création rapide */}
        <button
          onClick={handleCreateBoutique}
          className="btn btn-success rounded-circle shadow-lg position-fixed"
          style={{
            bottom: "30px",
            right: "30px",
            width: "60px",
            height: "60px",
            zIndex: 1000,
          }}
          title="Créer une nouvelle boutique"
        >
          <FontAwesomeIcon icon={faPlus} className="fs-5" />
        </button>
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
        .breadcrumb {
          background-color: transparent;
          padding: 0;
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
        .position-fixed {
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
