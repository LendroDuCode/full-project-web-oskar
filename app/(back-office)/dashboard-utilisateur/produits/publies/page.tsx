// app/produits-publies/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faEye,
  faTrash,
  faRefresh,
  faFilter,
  faSearch,
  faTimes,
  faCheckCircle,
  faInfoCircle,
  faExclamationTriangle,
  faTag,
  faMoneyBillWave,
  faCalendar,
  faStar,
  faHeart,
  faSort,
  faSortUp,
  faSortDown,
  faDownload,
  faEdit,
  faBan,
  faCheck,
  faTimesCircle,
  faPlus,
  faChartLine,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import colors from "@/app/shared/constants/colors";

interface ProduitPublie {
  uuid: string;
  nom: string;
  prix: number;
  image: string;
  date: string | null;
  disponible: boolean;
  description: string | null;
  createdAt: string | null;
}

interface SortConfig {
  key: keyof ProduitPublie;
  direction: "asc" | "desc";
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function ListeProduitsPublies() {
  const [produits, setProduits] = useState<ProduitPublie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [selectedProduits, setSelectedProduits] = useState<string[]>([]);

  // Pagination
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // Filtres
  const [disponibilityFilter, setDisponibilityFilter] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    totalValue: 0,
    averagePrice: 0,
    availableCount: 0,
    unavailableCount: 0,
  });

  // Charger les produits
  const fetchProduitsPublies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Début du chargement des produits publiés...");

      const response = await api.get("/produits/published");

      console.log("📦 Réponse API:", response);
      console.log("📦 Type de réponse:", typeof response);
      console.log("📦 Données reçues:", response.data);

      let produitsData: ProduitPublie[] = [];

      // Gestion flexible des formats de réponse
      if (Array.isArray(response.data)) {
        // Format 1: Réponse directe sous forme de tableau
        produitsData = response.data;
        console.log("✅ Format: Tableau direct");
      } else if (
        response.data &&
        response.data.produits &&
        Array.isArray(response.data.produits)
      ) {
        // Format 2: { produits: [...] }
        produitsData = response.data.produits;
        console.log("✅ Format: Objet avec propriété 'produits'");
      } else if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        // Format 3: { data: { data: [...] } }
        produitsData = response.data.data;
        console.log("✅ Format: Objet avec propriété 'data'");
      } else if (Array.isArray(response)) {
        // Format 4: La réponse elle-même est un tableau
        produitsData = response;
        console.log("✅ Format: Réponse est tableau");
      } else {
        console.error("❌ Format de réponse non reconnu:", response);
        throw new Error("Format de réponse non supporté");
      }

      console.log(`📊 ${produitsData.length} produit(s) chargé(s)`);

      if (produitsData.length === 0) {
        console.log("ℹ️ Aucun produit trouvé");
        setError("Aucun produit publié trouvé");
      }

      setProduits(produitsData);
      setPagination((prev) => ({
        ...prev,
        total: produitsData.length,
        pages: Math.ceil(produitsData.length / prev.limit),
      }));
      calculateStats(produitsData);
    } catch (err: any) {
      console.error("❌ Erreur lors du chargement des produits publiés:", err);

      // Log détaillé pour le debug
      if (err.response) {
        console.error("🔍 Détails de la réponse d'erreur:", {
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data,
          headers: err.response.headers,
        });
      }

      let errorMessage = "Erreur lors du chargement des produits publiés";

      if (err.response?.status === 401) {
        errorMessage = "Session expirée. Veuillez vous reconnecter.";
      } else if (err.response?.status === 404) {
        errorMessage =
          "Endpoint non trouvé. Vérifiez que l'API est accessible.";
      } else if (err.response?.status === 500) {
        errorMessage = "Erreur serveur. Veuillez réessayer plus tard.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setProduits([]);

      // Réinitialiser les stats
      setStats({
        total: 0,
        totalValue: 0,
        averagePrice: 0,
        availableCount: 0,
        unavailableCount: 0,
      });
    } finally {
      setLoading(false);
      console.log("🏁 Chargement terminé");
    }
  }, []);

  useEffect(() => {
    fetchProduitsPublies();
  }, [fetchProduitsPublies]);

  // Calcul des statistiques
  const calculateStats = (produitsList: ProduitPublie[]) => {
    const total = produitsList.length;
    const totalValue = produitsList.reduce(
      (sum, produit) => sum + (produit.prix || 0),
      0,
    );
    const averagePrice = total > 0 ? totalValue / total : 0;
    const availableCount = produitsList.filter((p) => p.disponible).length;
    const unavailableCount = total - availableCount;

    setStats({
      total,
      totalValue,
      averagePrice,
      availableCount,
      unavailableCount,
    });
  };

  // Filtrage et tri
  const filteredProduits = useMemo(() => {
    let result = produits.filter((produit) => {
      // Filtre par recherche
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        produit.nom.toLowerCase().includes(searchLower) ||
        (produit.description &&
          produit.description.toLowerCase().includes(searchLower)) ||
        produit.prix.toString().includes(searchTerm);

      // Filtre par disponibilité
      const matchesDisponibility =
        disponibilityFilter === "all" ||
        (disponibilityFilter === "available" && produit.disponible) ||
        (disponibilityFilter === "unavailable" && !produit.disponible);

      // Filtre par prix
      const matchesPrice =
        produit.prix >= priceRange[0] && produit.prix <= priceRange[1];

      return matchesSearch && matchesDisponibility && matchesPrice;
    });

    // Tri
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue == null && bValue == null) return 0;
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

        return 0;
      });
    }

    // Mettre à jour la pagination
    setPagination((prev) => ({
      ...prev,
      total: result.length,
      pages: Math.ceil(result.length / prev.limit),
    }));

    return result;
  }, [produits, searchTerm, disponibilityFilter, priceRange, sortConfig]);

  // Produits de la page courante
  const currentItems = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    return filteredProduits.slice(startIndex, startIndex + pagination.limit);
  }, [filteredProduits, pagination.page, pagination.limit]);

  const requestSort = (key: keyof ProduitPublie) => {
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

  const getSortIcon = (key: keyof ProduitPublie) => {
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

  // Formatage
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(price || 0);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Non spécifié";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Date invalide";

      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Date invalide";
    }
  };

  // Actions
  const handleUnpublishProduit = async (produitUuid: string) => {
    if (!confirm("Voulez-vous vraiment dépublier ce produit ?")) return;

    try {
      // TODO: Implémenter l'appel API pour dépublier
      // const response = await api.post(`/produits/${produitUuid}/unpublish`);

      // Simuler le succès pour le moment
      setProduits((prev) => prev.filter((p) => p.uuid !== produitUuid));
      const successMsg = "Produit dépublié avec succès !";
      setSuccessMessage(successMsg);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Erreur lors du dépublication:", err);
      setError(
        err.response?.data?.message ||
          "Erreur lors du dépublication du produit",
      );
    }
  };

  const handleDeleteProduit = async (produitUuid: string) => {
    if (
      !confirm(
        "Voulez-vous vraiment supprimer ce produit ? Cette action est irréversible.",
      )
    )
      return;

    try {
      // TODO: Implémenter l'appel API pour supprimer
      // const response = await api.delete(`/produits/${produitUuid}`);

      // Simuler le succès pour le moment
      setProduits((prev) => prev.filter((p) => p.uuid !== produitUuid));
      const successMsg = "Produit supprimé avec succès !";
      setSuccessMessage(successMsg);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Erreur lors de la suppression:", err);
      setError(
        err.response?.data?.message ||
          "Erreur lors de la suppression du produit",
      );
    }
  };

  const handleBlockProduit = async (produitUuid: string) => {
    if (!confirm("Voulez-vous vraiment bloquer ce produit ?")) return;

    try {
      // TODO: Implémenter l'appel API pour bloquer
      // const response = await api.post(`/produits/${produitUuid}/block`);

      // Simuler le succès pour le moment
      setProduits((prev) => prev.filter((p) => p.uuid !== produitUuid));
      const successMsg = "Produit bloqué avec succès !";
      setSuccessMessage(successMsg);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Erreur lors du blocage:", err);
      setError(
        err.response?.data?.message || "Erreur lors du blocage du produit",
      );
    }
  };

  // Actions en masse
  const handleBulkAction = async (action: "unpublish" | "block" | "delete") => {
    if (selectedProduits.length === 0) {
      setError("Veuillez sélectionner au moins un produit");
      setTimeout(() => setError(null), 3000);
      return;
    }

    const actionText = {
      unpublish: "dépublier",
      block: "bloquer",
      delete: "supprimer",
    }[action];

    if (
      !confirm(
        `Voulez-vous ${actionText} ${selectedProduits.length} produit(s) ?`,
      )
    )
      return;

    try {
      // TODO: Implémenter les appels API en masse
      setProduits((prev) =>
        prev.filter((p) => !selectedProduits.includes(p.uuid)),
      );
      setSelectedProduits([]);

      const successMsg = `${selectedProduits.length} produit(s) ${actionText}(s) avec succès`;
      setSuccessMessage(successMsg);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error(`Erreur lors de ${action}:`, err);
      setError(`Erreur lors de ${action} des produits`);
    }
  };

  const handleSelectProduit = (produitUuid: string) => {
    setSelectedProduits((prev) =>
      prev.includes(produitUuid)
        ? prev.filter((id) => id !== produitUuid)
        : [...prev, produitUuid],
    );
  };

  const handleSelectAll = () => {
    if (selectedProduits.length === currentItems.length) {
      setSelectedProduits([]);
    } else {
      setSelectedProduits(currentItems.map((p) => p.uuid));
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredProduits.length === 0) {
      setError("Aucun produit à exporter");
      setTimeout(() => setError(null), 3000);
      return;
    }

    const escapeCsv = (str: string) => {
      if (!str) return '""';
      return `"${str.toString().replace(/"/g, '""')}"`;
    };

    const headers = [
      "UUID",
      "Nom",
      "Prix",
      "Disponible",
      "Description",
      "Date publication",
      "Date création",
      "Image",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredProduits.map((produit) =>
        [
          produit.uuid,
          escapeCsv(produit.nom),
          produit.prix,
          produit.disponible ? "Oui" : "Non",
          escapeCsv(produit.description || ""),
          produit.date ? formatDate(produit.date) : "",
          produit.createdAt ? formatDate(produit.createdAt) : "",
          escapeCsv(produit.image),
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `produits-publies-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const successMsg = "Export CSV réussi !";
    setSuccessMessage(successMsg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm("");
    setDisponibilityFilter("all");
    setPriceRange([0, 1000000]);
    setSortConfig(null);
    setPagination((prev) => ({ ...prev, page: 1 }));
    setSelectedProduits([]);
  };

  // Calculer le prix max pour le filtre
  const maxPrice = useMemo(() => {
    if (produits.length === 0) return 1000000;
    const max = Math.max(...produits.map((p) => p.prix));
    return max > 0 ? max : 1000000;
  }, [produits]);

  // Composant de chargement amélioré
  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <div className="text-center py-5">
              <div
                className="spinner-border text-primary"
                role="status"
                style={{ width: "3rem", height: "3rem" }}
              >
                <span className="visually-hidden">Chargement...</span>
              </div>
              <h4 className="mt-4 fw-bold">Chargement des produits...</h4>
              <p className="text-muted">
                Veuillez patienter pendant le chargement des données
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* En-tête */}
      <div className="mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
          <div>
            <h1 className="h2 fw-bold mb-2">Produits Publiés</h1>
            <p className="text-muted mb-0">
              Liste des produits publiés sur la plateforme
              {searchTerm && ` - Recherche: "${searchTerm}"`}
            </p>
          </div>
          <div className="d-flex gap-2 mt-3 mt-md-0">
            <button
              onClick={fetchProduitsPublies}
              className="btn btn-outline-secondary d-flex align-items-center gap-2"
              disabled={loading}
            >
              <FontAwesomeIcon icon={faRefresh} spin={loading} />
              Rafraîchir
            </button>
            <button
              onClick={handleExportCSV}
              className="btn btn-outline-primary d-flex align-items-center gap-2"
              disabled={filteredProduits.length === 0}
            >
              <FontAwesomeIcon icon={faDownload} />
              Exporter CSV
            </button>
            <button
              onClick={resetFilters}
              className="btn btn-outline-danger d-flex align-items-center gap-2"
            >
              <FontAwesomeIcon icon={faTimes} />
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Messages d'alerte */}
        {error && (
          <div
            className="alert alert-danger border-0 shadow-sm mb-4"
            role="alert"
          >
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0">
                <div
                  className="rounded-circle p-2"
                  style={{ backgroundColor: `${colors.oskar.red}20` }}
                >
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className="text-danger"
                  />
                </div>
              </div>
              <div className="flex-grow-1 ms-3">
                <h6 className="alert-heading mb-1 fw-bold">Erreur</h6>
                <p className="mb-0">{error}</p>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={() => setError(null)}
                aria-label="Fermer"
              />
            </div>
          </div>
        )}

        {successMessage && (
          <div
            className="alert alert-success border-0 shadow-sm mb-4"
            role="alert"
          >
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0">
                <div
                  className="rounded-circle p-2"
                  style={{ backgroundColor: `${colors.oskar.green}20` }}
                >
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-success"
                  />
                </div>
              </div>
              <div className="flex-grow-1 ms-3">
                <h6 className="alert-heading mb-1 fw-bold">Succès</h6>
                <p className="mb-0">{successMessage}</p>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={() => setSuccessMessage(null)}
                aria-label="Fermer"
              />
            </div>
          </div>
        )}

        {/* Cartes de statistiques */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div
              className="card border-0 shadow-sm h-100"
              style={{
                background: `linear-gradient(135deg, ${colors.oskar.blue}15 0%, ${colors.oskar.blue}10 100%)`,
              }}
            >
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: `${colors.oskar.blue}20`,
                    }}
                  >
                    <FontAwesomeIcon icon={faBox} className="text-primary" />
                  </div>
                  <div>
                    <div className="text-muted small">Total produits</div>
                    <div className="fw-bold fs-4">{stats.total}</div>
                    <div className="text-muted small">
                      {filteredProduits.length} filtré(s)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div
              className="card border-0 shadow-sm h-100"
              style={{
                background: `linear-gradient(135deg, ${colors.oskar.green}15 0%, ${colors.oskar.green}10 100%)`,
              }}
            >
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: `${colors.oskar.green}20`,
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="text-success"
                    />
                  </div>
                  <div>
                    <div className="text-muted small">Disponibles</div>
                    <div className="fw-bold fs-4">{stats.availableCount}</div>
                    <div className="text-muted small">
                      {stats.unavailableCount} indisponible(s)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div
              className="card border-0 shadow-sm h-100"
              style={{
                background: `linear-gradient(135deg, ${colors.oskar.yellow}15 0%, ${colors.oskar.yellow}10 100%)`,
              }}
            >
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: `${colors.oskar.yellow}20`,
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faMoneyBillWave}
                      className="text-warning"
                    />
                  </div>
                  <div>
                    <div className="text-muted small">Prix moyen</div>
                    <div className="fw-bold fs-4">
                      {formatPrice(stats.averagePrice)}
                    </div>
                    <div className="text-muted small">
                      Valeur totale: {formatPrice(stats.totalValue)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div
              className="card border-0 shadow-sm h-100"
              style={{
                background: `linear-gradient(135deg, ${colors.oskar.purple}15 0%, ${colors.oskar.purple}10 100%)`,
              }}
            >
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: `${colors.oskar.purple}20`,
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faChartLine}
                      className="text-purple"
                    />
                  </div>
                  <div>
                    <div className="text-muted small">Sélectionnés</div>
                    <div className="fw-bold fs-4">
                      {selectedProduits.length}
                    </div>
                    <div className="text-muted small">
                      {selectedProduits.length > 0
                        ? "Actions disponibles"
                        : "Sélectionnez des produits"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <FontAwesomeIcon icon={faSearch} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Rechercher par nom, description, prix..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Rechercher des produits"
                />
                {searchTerm && (
                  <button
                    className="btn btn-outline-secondary border-start-0"
                    onClick={() => setSearchTerm("")}
                    aria-label="Effacer la recherche"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                )}
              </div>
            </div>

            <div className="col-md-3">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <FontAwesomeIcon icon={faFilter} className="text-muted" />
                </span>
                <select
                  className="form-select border-start-0"
                  value={disponibilityFilter}
                  onChange={(e) => setDisponibilityFilter(e.target.value)}
                  aria-label="Filtrer par disponibilité"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="available">Disponibles uniquement</option>
                  <option value="unavailable">Indisponibles uniquement</option>
                </select>
              </div>
            </div>

            <div className="col-md-3">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <FontAwesomeIcon
                    icon={faMoneyBillWave}
                    className="text-muted"
                  />
                </span>
                <input
                  type="range"
                  className="form-range border-start-0"
                  min="0"
                  max={maxPrice}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                  aria-label="Filtrer par prix maximum"
                />
                <span className="input-group-text">
                  {formatPrice(priceRange[1])}
                </span>
              </div>
            </div>
          </div>

          {/* Informations de filtrage */}
          <div className="row mt-3">
            <div className="col-md-8">
              <div className="d-flex align-items-center gap-3">
                <small className="text-muted">
                  <FontAwesomeIcon icon={faFilter} className="me-1" />
                  {filteredProduits.length} produit(s) sur {produits.length}
                  {searchTerm && (
                    <>
                      {" "}
                      pour "<strong>{searchTerm}</strong>"
                    </>
                  )}
                </small>
                {selectedProduits.length > 0 && (
                  <small className="text-primary fw-semibold">
                    <FontAwesomeIcon icon={faCheck} className="me-1" />
                    {selectedProduits.length} sélectionné(s)
                  </small>
                )}
              </div>
            </div>
            <div className="col-md-4 text-end">
              <small className="text-muted">
                Page {pagination.page} sur {pagination.pages} •{" "}
                {pagination.limit} par page
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Actions en masse */}
      {selectedProduits.length > 0 && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body py-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faBox} className="text-primary me-2" />
                <span className="fw-semibold">
                  {selectedProduits.length} produit(s) sélectionné(s)
                </span>
              </div>
              <div className="d-flex flex-wrap gap-2">
                <button
                  onClick={() => handleBulkAction("unpublish")}
                  className="btn btn-sm btn-outline-warning d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faTimesCircle} />
                  Dépublier
                </button>
                <button
                  onClick={() => handleBulkAction("block")}
                  className="btn btn-sm btn-outline-danger d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faBan} />
                  Bloquer
                </button>
                <button
                  onClick={() => handleBulkAction("delete")}
                  className="btn btn-sm btn-outline-danger d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faTrash} />
                  Supprimer
                </button>
                <button
                  onClick={() => setSelectedProduits([])}
                  className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faTimes} />
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tableau des produits */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {filteredProduits.length === 0 ? (
            <div className="text-center py-5">
              <div className="bg-light rounded-circle d-inline-flex p-4 mb-3">
                <FontAwesomeIcon icon={faBox} className="fs-1 text-muted" />
              </div>
              <h4 className="fw-bold mb-3">
                {produits.length === 0
                  ? "Aucun produit publié"
                  : "Aucun résultat"}
              </h4>
              <p className="text-muted mb-4">
                {produits.length === 0
                  ? "Aucun produit n'a été publié pour le moment."
                  : "Aucun produit ne correspond à vos critères de recherche."}
              </p>
              {(searchTerm ||
                disponibilityFilter !== "all" ||
                priceRange[1] < maxPrice) && (
                <button onClick={resetFilters} className="btn btn-primary me-2">
                  <FontAwesomeIcon icon={faTimes} className="me-2" />
                  Réinitialiser les filtres
                </button>
              )}
              <button
                onClick={fetchProduitsPublies}
                className="btn btn-outline-secondary"
              >
                <FontAwesomeIcon icon={faRefresh} className="me-2" />
                Recharger
              </button>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "50px" }} className="text-center">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={
                              selectedProduits.length === currentItems.length &&
                              currentItems.length > 0
                            }
                            onChange={handleSelectAll}
                            aria-label="Sélectionner tous les produits de la page"
                          />
                        </div>
                      </th>
                      <th style={{ width: "80px" }} className="text-center">
                        Image
                      </th>
                      <th style={{ width: "250px" }}>
                        <button
                          className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                          onClick={() => requestSort("nom")}
                        >
                          <FontAwesomeIcon icon={faTag} className="me-1" />
                          Produit {getSortIcon("nom")}
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
                          Prix {getSortIcon("prix")}
                        </button>
                      </th>
                      <th style={{ width: "150px" }}>Disponibilité</th>
                      <th style={{ width: "180px" }}>
                        <button
                          className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                          onClick={() => requestSort("date")}
                        >
                          <FontAwesomeIcon icon={faCalendar} className="me-1" />
                          Date publication {getSortIcon("date")}
                        </button>
                      </th>
                      <th style={{ width: "180px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((produit, index) => (
                      <tr
                        key={produit.uuid}
                        className={
                          selectedProduits.includes(produit.uuid)
                            ? "table-active"
                            : ""
                        }
                      >
                        <td className="text-center">
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={selectedProduits.includes(produit.uuid)}
                              onChange={() => handleSelectProduit(produit.uuid)}
                              aria-label={`Sélectionner ${produit.nom}`}
                            />
                          </div>
                        </td>
                        <td className="text-center">
                          <div
                            className="position-relative mx-auto"
                            style={{ width: "60px", height: "60px" }}
                          >
                            <img
                              src={
                                produit.image ||
                                `https://via.placeholder.com/60/007bff/ffffff?text=${produit.nom?.charAt(0) || "P"}`
                              }
                              alt={produit.nom}
                              className="img-fluid rounded border"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  `https://via.placeholder.com/60/007bff/ffffff?text=${produit.nom?.charAt(0) || "P"}`;
                              }}
                            />
                            {produit.disponible && (
                              <div className="position-absolute top-0 end-0 translate-middle">
                                <span
                                  className="badge bg-success rounded-circle p-1"
                                  style={{ fontSize: "0.6rem" }}
                                >
                                  <FontAwesomeIcon icon={faCheck} />
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="fw-semibold mb-1">{produit.nom}</div>
                          {produit.description && (
                            <small
                              className="text-muted text-truncate d-block"
                              style={{ maxWidth: "200px" }}
                              title={produit.description}
                            >
                              {produit.description.substring(0, 80)}
                              {produit.description.length > 80 ? "..." : ""}
                            </small>
                          )}
                          <div className="mt-2">
                            <small className="text-muted">
                              <FontAwesomeIcon
                                icon={faCalendar}
                                className="me-1"
                              />
                              Créé: {formatDate(produit.createdAt)}
                            </small>
                          </div>
                        </td>
                        <td>
                          <div className="fw-bold text-primary">
                            {formatPrice(produit.prix)}
                          </div>
                        </td>
                        <td>
                          {produit.disponible ? (
                            <span className="badge bg-success bg-opacity-10 text-success">
                              <FontAwesomeIcon
                                icon={faCheckCircle}
                                className="me-1"
                              />
                              Disponible
                            </span>
                          ) : (
                            <span className="badge bg-danger bg-opacity-10 text-danger">
                              <FontAwesomeIcon
                                icon={faTimesCircle}
                                className="me-1"
                              />
                              Indisponible
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="fw-semibold">
                            {formatDate(produit.date)}
                          </div>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm" role="group">
                            <button
                              className="btn btn-outline-info"
                              title="Voir détails"
                              onClick={() => {
                                // Implémenter la vue des détails
                                console.log("Voir détails:", produit);
                                alert(
                                  `Détails du produit: ${produit.nom}\nPrix: ${formatPrice(produit.prix)}\nDisponible: ${produit.disponible ? "Oui" : "Non"}`,
                                );
                              }}
                              aria-label={`Voir détails de ${produit.nom}`}
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </button>
                            <button
                              className="btn btn-outline-warning"
                              title="Dépublier"
                              onClick={() =>
                                handleUnpublishProduit(produit.uuid)
                              }
                              aria-label={`Dépublier ${produit.nom}`}
                            >
                              <FontAwesomeIcon icon={faTimesCircle} />
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              title="Supprimer"
                              onClick={() => handleDeleteProduit(produit.uuid)}
                              aria-label={`Supprimer ${produit.nom}`}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="card-footer bg-white border-0 py-3">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
                    <div className="mb-2 mb-md-0">
                      <small className="text-muted">
                        Affichage de{" "}
                        <strong>
                          {(pagination.page - 1) * pagination.limit + 1}
                        </strong>{" "}
                        à{" "}
                        <strong>
                          {Math.min(
                            pagination.page * pagination.limit,
                            filteredProduits.length,
                          )}
                        </strong>{" "}
                        sur <strong>{filteredProduits.length}</strong>{" "}
                        produit(s)
                      </small>
                    </div>
                    <nav>
                      <ul className="pagination pagination-sm mb-0">
                        <li
                          className={`page-item ${pagination.page === 1 ? "disabled" : ""}`}
                        >
                          <button
                            className="page-link"
                            onClick={() =>
                              setPagination((prev) => ({
                                ...prev,
                                page: prev.page - 1,
                              }))
                            }
                            disabled={pagination.page === 1}
                            aria-label="Page précédente"
                          >
                            <FontAwesomeIcon
                              icon={faTimes}
                              className="rotate-45"
                            />
                          </button>
                        </li>

                        {/* Générer les numéros de page */}
                        {(() => {
                          const pages = [];
                          const maxVisible = 5;
                          let startPage = Math.max(
                            1,
                            pagination.page - Math.floor(maxVisible / 2),
                          );
                          let endPage = Math.min(
                            pagination.pages,
                            startPage + maxVisible - 1,
                          );

                          if (endPage - startPage + 1 < maxVisible) {
                            startPage = Math.max(1, endPage - maxVisible + 1);
                          }

                          for (let i = startPage; i <= endPage; i++) {
                            pages.push(
                              <li
                                key={i}
                                className={`page-item ${pagination.page === i ? "active" : ""}`}
                              >
                                <button
                                  className="page-link"
                                  onClick={() =>
                                    setPagination((prev) => ({
                                      ...prev,
                                      page: i,
                                    }))
                                  }
                                >
                                  {i}
                                </button>
                              </li>,
                            );
                          }
                          return pages;
                        })()}

                        <li
                          className={`page-item ${pagination.page === pagination.pages ? "disabled" : ""}`}
                        >
                          <button
                            className="page-link"
                            onClick={() =>
                              setPagination((prev) => ({
                                ...prev,
                                page: prev.page + 1,
                              }))
                            }
                            disabled={pagination.page === pagination.pages}
                            aria-label="Page suivante"
                          >
                            <FontAwesomeIcon
                              icon={faTimes}
                              className="rotate-135"
                            />
                          </button>
                        </li>
                      </ul>
                    </nav>
                    <div className="mt-2 mt-md-0">
                      <select
                        className="form-select form-select-sm"
                        value={pagination.limit}
                        onChange={(e) =>
                          setPagination((prev) => ({
                            ...prev,
                            limit: parseInt(e.target.value),
                            page: 1,
                          }))
                        }
                        aria-label="Nombre d'éléments par page"
                      >
                        <option value="5">5 par page</option>
                        <option value="10">10 par page</option>
                        <option value="25">25 par page</option>
                        <option value="50">50 par page</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Informations */}
      <div className="mt-4">
        <div className="alert alert-info border-0 shadow-sm" role="alert">
          <div className="d-flex align-items-center">
            <div className="flex-shrink-0">
              <div
                className="rounded-circle p-2"
                style={{ backgroundColor: `${colors.oskar.blue}20` }}
              >
                <FontAwesomeIcon icon={faInfoCircle} className="text-info" />
              </div>
            </div>
            <div className="flex-grow-1 ms-3">
              <h6 className="alert-heading mb-1 fw-bold">
                Gestion des produits publiés
              </h6>
              <div className="row">
                <div className="col-md-6">
                  <ul className="mb-0">
                    <li>
                      <strong>Dépublier :</strong> Rend le produit invisible aux
                      utilisateurs mais le conserve dans le système
                    </li>
                    <li>
                      <strong>Supprimer :</strong> Action définitive, retire
                      complètement le produit
                    </li>
                    <li>
                      <strong>Sélection multiple :</strong> Cochez plusieurs
                      produits pour des actions groupées
                    </li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <ul className="mb-0">
                    <li>
                      <strong>Export :</strong> Téléchargez les données en CSV
                      pour analyse ou sauvegarde
                    </li>
                    <li>
                      <strong>Filtres :</strong> Utilisez les filtres pour
                      trouver rapidement des produits spécifiques
                    </li>
                    <li>
                      <strong>Tri :</strong> Cliquez sur les en-têtes de
                      colonnes pour trier les données
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
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
        .btn-group-sm > .btn {
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
        }
        .badge {
          font-weight: 500;
          padding: 0.35em 0.65em;
        }
        .page-item.active .page-link {
          background-color: #0d6efd;
          border-color: #0d6efd;
          color: white;
        }
        .page-link {
          color: #0d6efd;
        }
        .page-link:hover {
          color: #0a58ca;
          background-color: #f8f9fa;
        }
        .form-range::-webkit-slider-thumb {
          background-color: #0d6efd;
        }
        .form-range::-moz-range-thumb {
          background-color: #0d6efd;
        }
        .rotate-45 {
          transform: rotate(45deg);
        }
        .rotate-135 {
          transform: rotate(135deg);
        }
        .spinner-border {
          animation-duration: 0.75s;
        }
      `}</style>
    </div>
  );
}
