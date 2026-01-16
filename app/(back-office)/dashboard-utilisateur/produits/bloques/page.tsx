// app/produits-bloques/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faBan,
  faEye,
  faTrash,
  faRefresh,
  faFilter,
  faSearch,
  faTimes,
  faCheckCircle,
  faInfoCircle,
  faExclamationTriangle,
  faUser,
  faTag,
  faMoneyBillWave,
  faLayerGroup,
  faCalendar,
  faStar,
  faHeart,
  faSort,
  faSortUp,
  faSortDown,
  faDownload,
  faEdit,
  faEllipsisV,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import colors from "@/app/shared/constants/colors";
import LoadingSkeleton from "../components/shared/LoadingSkeleton";

interface Produit {
  uuid: string;
  id: number;
  libelle: string;
  type: string | null;
  image: string;
  disponible: boolean;
  statut: string;
  prix: string;
  description: string | null;
  etoile: number;
  quantite: number;
  note_moyenne: number;
  nombre_avis: number;
  nombre_favoris: number;
  createdAt: string | null;
  updatedAt: string | null;
  estPublie: boolean;
  estBloque: boolean;
  is_favoris: boolean;
  categorie: {
    uuid: string;
    libelle: string;
    type: string;
    image: string;
  };
  utilisateur: {
    uuid: string;
    nom: string;
    prenoms: string;
    email: string;
    telephone: string;
    avatar: string;
  };
  source: {
    type: string;
    infos: any | null;
  };
  estUtilisateur: boolean;
  estVendeur: boolean;
}

interface SortConfig {
  key: keyof Produit;
  direction: "asc" | "desc";
}

export default function ProduitsBloques() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [selectedProduits, setSelectedProduits] = useState<string[]>([]);
  const [utilisateurInfo, setUtilisateurInfo] = useState<{
    uuid: string;
    nom: string;
    prenoms: string;
  } | null>(null);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    totalValue: 0,
    averagePrice: 0,
    averageRating: 0,
  });

  useEffect(() => {
    fetchProduitsBloques();
  }, []);

  // Filtrage et tri
  const filteredProduits = useMemo(() => {
    let result = produits.filter((produit) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        produit.libelle.toLowerCase().includes(searchLower) ||
        (produit.description &&
          produit.description.toLowerCase().includes(searchLower)) ||
        (produit.categorie?.libelle?.toLowerCase() || "").includes(
          searchLower,
        ) ||
        (produit.categorie?.type?.toLowerCase() || "").includes(searchLower) ||
        produit.utilisateur?.nom.toLowerCase().includes(searchLower) ||
        produit.utilisateur?.prenoms.toLowerCase().includes(searchLower)
      );
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

    return result;
  }, [produits, searchTerm, sortConfig]);

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

  const fetchProduitsBloques = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/produits/produits-utilisateur-bloques");

      if (response && response.data) {
        let produitsData: Produit[] = [];
        let userInfo = null;

        if (Array.isArray(response.data)) {
          produitsData = response.data;
        } else if (response.data.status === "success") {
          produitsData = response.data.data?.produits || [];
          userInfo = response.data.data?.utilisateur || null;
        } else if (response.data.produits) {
          produitsData = response.data.produits || [];
          userInfo = response.data.utilisateur || null;
        } else {
          produitsData = response.data.produits || response.data.data || [];
        }

        setProduits(Array.isArray(produitsData) ? produitsData : []);
        setUtilisateurInfo(userInfo);
        calculateStats(Array.isArray(produitsData) ? produitsData : []);
      } else {
        throw new Error("Structure de réponse invalide");
      }
    } catch (err: any) {
      console.error("Erreur lors du chargement des produits bloqués:", err);

      let errorMessage = "Erreur lors du chargement des produits";
      if (err.response?.status === 401) {
        errorMessage = "Session expirée. Veuillez vous reconnecter.";
      } else if (err.response?.status === 404) {
        errorMessage = "Aucun produit bloqué trouvé.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);
      setProduits([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (produitsList: Produit[]) => {
    const total = produitsList.length;
    const totalValue = produitsList.reduce((sum, produit) => {
      try {
        return sum + (parseFloat(produit.prix) || 0) * (produit.quantite || 0);
      } catch {
        return sum;
      }
    }, 0);
    const averagePrice = total > 0 ? totalValue / total : 0;
    const averageRating =
      total > 0
        ? produitsList.reduce(
            (sum, produit) => sum + (produit.note_moyenne || 0),
            0,
          ) / total
        : 0;

    setStats({ total, totalValue, averagePrice, averageRating });
  };

  const formatPrice = (price: string | number) => {
    try {
      const numericPrice =
        typeof price === "string" ? parseFloat(price) : price;
      return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "XOF",
        minimumFractionDigits: 0,
      }).format(numericPrice || 0);
    } catch {
      return "0 CFA";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Non spécifié";
    try {
      return new Date(dateString).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "Date invalide";
    }
  };

  const handleUnblockProduit = async (produitUuid: string) => {
    if (!confirm("Voulez-vous vraiment débloquer ce produit ?")) return;

    try {
      const response = await api.post(`/produits/${produitUuid}/debloquer`);

      if (response.data?.status === "success") {
        setProduits((prev) => prev.filter((p) => p.uuid !== produitUuid));
        const successMsg = "Produit débloqué avec succès !";
        setError(successMsg);
        setTimeout(() => setError(null), 3000);
      }
    } catch (err: any) {
      console.error("Erreur lors du déblocage:", err);
      setError(
        err.response?.data?.message || "Erreur lors du déblocage du produit",
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
      const response = await api.delete(`/produits/${produitUuid}`);

      if (response.data?.status === "success") {
        setProduits((prev) => prev.filter((p) => p.uuid !== produitUuid));
        const successMsg = "Produit supprimé avec succès !";
        setError(successMsg);
        setTimeout(() => setError(null), 3000);
      }
    } catch (err: any) {
      console.error("Erreur lors de la suppression:", err);
      setError(
        err.response?.data?.message ||
          "Erreur lors de la suppression du produit",
      );
    }
  };

  const handleBulkUnblock = async () => {
    if (selectedProduits.length === 0) {
      setError("Veuillez sélectionner au moins un produit");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (
      !confirm(`Voulez-vous débloquer ${selectedProduits.length} produit(s) ?`)
    )
      return;

    try {
      const promises = selectedProduits.map((uuid) =>
        api.post(`/produits/${uuid}/debloquer`),
      );

      const results = await Promise.allSettled(promises);
      const successCount = results.filter(
        (r) => r.status === "fulfilled",
      ).length;

      // Mettre à jour la liste
      setProduits((prev) =>
        prev.filter((p) => !selectedProduits.includes(p.uuid)),
      );
      setSelectedProduits([]);

      const successMsg = `${successCount} produit(s) débloqué(s) avec succès`;
      setError(successMsg);
      setTimeout(() => setError(null), 3000);
    } catch (err: any) {
      console.error("Erreur lors du déblocage multiple:", err);
      setError("Erreur lors du déblocage multiple");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProduits.length === 0) {
      setError("Veuillez sélectionner au moins un produit");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (
      !confirm(
        `Voulez-vous supprimer ${selectedProduits.length} produit(s) ? Cette action est irréversible.`,
      )
    )
      return;

    try {
      const promises = selectedProduits.map((uuid) =>
        api.delete(`/produits/${uuid}`),
      );

      const results = await Promise.allSettled(promises);
      const successCount = results.filter(
        (r) => r.status === "fulfilled",
      ).length;

      // Mettre à jour la liste
      setProduits((prev) =>
        prev.filter((p) => !selectedProduits.includes(p.uuid)),
      );
      setSelectedProduits([]);

      const successMsg = `${successCount} produit(s) supprimé(s) avec succès`;
      setError(successMsg);
      setTimeout(() => setError(null), 3000);
    } catch (err: any) {
      console.error("Erreur lors de la suppression multiple:", err);
      setError("Erreur lors de la suppression multiple");
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
    if (selectedProduits.length === filteredProduits.length) {
      setSelectedProduits([]);
    } else {
      setSelectedProduits(filteredProduits.map((p) => p.uuid));
    }
  };

  const handleExportCSV = () => {
    if (filteredProduits.length === 0) {
      setError("Aucun produit à exporter");
      setTimeout(() => setError(null), 3000);
      return;
    }

    const headers = [
      "ID",
      "Libellé",
      "Prix",
      "Quantité",
      "Valeur totale",
      "Statut",
      "Disponible",
      "Catégorie",
      "Note",
      "Avis",
      "Favoris",
      "Utilisateur",
      "Date création",
      "Date mise à jour",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredProduits.map((produit) =>
        [
          produit.id,
          `"${produit.libelle.replace(/"/g, '""')}"`,
          parseFloat(produit.prix) || 0,
          produit.quantite,
          (parseFloat(produit.prix) || 0) * produit.quantite,
          produit.statut,
          produit.disponible ? "Oui" : "Non",
          `"${produit.categorie?.libelle || ""}"`,
          produit.note_moyenne,
          produit.nombre_avis,
          produit.nombre_favoris,
          `"${produit.utilisateur?.nom} ${produit.utilisateur?.prenoms}"`,
          produit.createdAt ? formatDate(produit.createdAt) : "",
          produit.updatedAt ? formatDate(produit.updatedAt) : "",
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
      `produits-bloques-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const StatsCards = () => (
    <div className="row g-3 mb-4">
      <div className="col-6 col-md-3">
        <div
          className="card border-0 shadow-sm h-100"
          style={{
            background: `linear-gradient(135deg, ${colors.oskar.red}15 0%, ${colors.oskar.red}10 100%)`,
          }}
        >
          <div className="card-body p-3">
            <div className="d-flex align-items-center">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center me-3"
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: `${colors.oskar.red}20`,
                }}
              >
                <FontAwesomeIcon icon={faBan} className="text-danger" />
              </div>
              <div>
                <div className="text-muted small">Produits bloqués</div>
                <div className="fw-bold fs-4">{stats.total}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                <FontAwesomeIcon
                  icon={faMoneyBillWave}
                  className="text-primary"
                />
              </div>
              <div>
                <div className="text-muted small">Valeur totale</div>
                <div className="fw-bold fs-4">
                  {formatPrice(stats.totalValue)}
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
                <FontAwesomeIcon icon={faTag} className="text-success" />
              </div>
              <div>
                <div className="text-muted small">Prix moyen</div>
                <div className="fw-bold fs-4">
                  {formatPrice(stats.averagePrice)}
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
                <FontAwesomeIcon icon={faStar} className="text-warning" />
              </div>
              <div>
                <div className="text-muted small">Note moyenne</div>
                <div className="fw-bold fs-4">
                  {stats.averageRating.toFixed(1)}/5
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const UserInfoCard = () => {
    if (!utilisateurInfo) return null;

    return (
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                <FontAwesomeIcon icon={faUser} className="text-primary fs-4" />
              </div>
              <div>
                <h5 className="fw-bold mb-1">
                  {utilisateurInfo.nom} {utilisateurInfo.prenoms}
                </h5>
                <p className="text-muted mb-0">
                  <span className="badge bg-danger">Compte utilisateur</span>
                  <span className="ms-2">
                    {produits.length} produit(s) bloqué(s)
                  </span>
                </p>
              </div>
            </div>
            <div className="text-end">
              <small className="text-muted d-block">Identifiant</small>
              <code className="text-primary">
                {utilisateurInfo.uuid.substring(0, 8)}...
              </code>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <LoadingSkeleton />
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
            <h1 className="h2 fw-bold mb-2">Produits Bloqués</h1>
            <p className="text-muted mb-0">
              Gestion des produits bloqués - Affichage en tableau
            </p>
          </div>
          <div className="d-flex gap-2 mt-3 mt-md-0">
            <button
              onClick={fetchProduitsBloques}
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
          </div>
        </div>

        {/* Messages d'erreur/succès */}
        {error && (
          <div
            className={`alert ${error.includes("succès") ? "alert-success" : "alert-danger"} border-0 shadow-sm mb-4`}
            role="alert"
          >
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0">
                <div
                  className="rounded-circle p-2"
                  style={{
                    backgroundColor: error.includes("succès")
                      ? `${colors.oskar.green}20`
                      : `${colors.oskar.red}20`,
                  }}
                >
                  <FontAwesomeIcon
                    icon={
                      error.includes("succès")
                        ? faCheckCircle
                        : faExclamationTriangle
                    }
                    className={
                      error.includes("succès") ? "text-success" : "text-danger"
                    }
                  />
                </div>
              </div>
              <div className="flex-grow-1 ms-3">
                <h6 className="alert-heading mb-1 fw-bold">
                  {error.includes("succès") ? "Succès" : "Erreur"}
                </h6>
                <p className="mb-0">{error}</p>
              </div>
              <button
                type="button"
                className="btn-close ms-3"
                onClick={() => setError(null)}
                aria-label="Fermer"
              />
            </div>
          </div>
        )}

        {/* Informations utilisateur */}
        <UserInfoCard />

        {/* Statistiques */}
        <StatsCards />
      </div>

      {/* Barre de recherche et actions en masse */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-8">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <FontAwesomeIcon icon={faSearch} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Rechercher par produit, catégorie, utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="btn btn-outline-secondary border-start-0"
                    onClick={() => setSearchTerm("")}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                )}
              </div>
            </div>
            <div className="col-md-4">
              <div className="d-flex gap-2 justify-content-end">
                {selectedProduits.length > 0 && (
                  <>
                    <button
                      onClick={handleBulkUnblock}
                      className="btn btn-outline-success d-flex align-items-center gap-2"
                      disabled={loading}
                    >
                      <FontAwesomeIcon icon={faCheckCircle} />
                      Débloquer ({selectedProduits.length})
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="btn btn-outline-danger d-flex align-items-center gap-2"
                      disabled={loading}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                      Supprimer ({selectedProduits.length})
                    </button>
                    <button
                      onClick={() => setSelectedProduits([])}
                      className="btn btn-outline-secondary d-flex align-items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                      Annuler
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des produits */}
      {filteredProduits.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex p-4 mb-3">
              <FontAwesomeIcon icon={faBan} className="fs-1 text-danger" />
            </div>
            <h4 className="fw-bold mb-3">
              {produits.length === 0
                ? "Aucun produit bloqué"
                : "Aucun résultat"}
            </h4>
            <p className="text-muted mb-4">
              {produits.length === 0
                ? "L'utilisateur n'a aucun produit bloqué pour le moment."
                : "Aucun produit ne correspond à votre recherche."}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="btn btn-outline-primary"
              >
                <FontAwesomeIcon icon={faTimes} className="me-2" />
                Effacer la recherche
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
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
                            selectedProduits.length ===
                              filteredProduits.length &&
                            filteredProduits.length > 0
                          }
                          onChange={handleSelectAll}
                        />
                      </div>
                    </th>
                    <th style={{ width: "80px" }} className="text-center">
                      Image
                    </th>
                    <th style={{ width: "250px" }}>
                      <button
                        className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                        onClick={() => requestSort("libelle")}
                      >
                        Produit {getSortIcon("libelle")}
                      </button>
                    </th>
                    <th style={{ width: "120px" }}>
                      <button
                        className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                        onClick={() => requestSort("prix")}
                      >
                        Prix {getSortIcon("prix")}
                      </button>
                    </th>
                    <th style={{ width: "100px" }}>
                      <button
                        className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                        onClick={() => requestSort("quantite")}
                      >
                        Quantité {getSortIcon("quantite")}
                      </button>
                    </th>
                    <th style={{ width: "150px" }}>Catégorie</th>
                    <th style={{ width: "150px" }}>Utilisateur</th>
                    <th style={{ width: "120px" }}>Statut</th>
                    <th style={{ width: "150px" }} className="text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProduits.map((produit) => (
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
                              `https://via.placeholder.com/60/cccccc/ffffff?text=${produit.libelle?.charAt(0) || "P"}`
                            }
                            alt={produit.libelle}
                            className="img-fluid rounded border"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                `https://via.placeholder.com/60/cccccc/ffffff?text=${produit.libelle?.charAt(0) || "P"}`;
                            }}
                          />
                          {produit.estBloque && (
                            <div className="position-absolute top-0 end-0 translate-middle">
                              <span
                                className="badge bg-danger rounded-circle p-1"
                                style={{ fontSize: "0.6rem" }}
                              >
                                <FontAwesomeIcon icon={faBan} />
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="fw-semibold mb-1">
                          {produit.libelle}
                        </div>
                        {produit.description && (
                          <small
                            className="text-muted text-truncate d-block"
                            style={{ maxWidth: "200px" }}
                          >
                            {produit.description.substring(0, 100)}
                            {produit.description.length > 100 ? "..." : ""}
                          </small>
                        )}
                        <div className="mt-2">
                          {produit.is_favoris && (
                            <span className="badge bg-warning text-dark me-1">
                              <FontAwesomeIcon
                                icon={faHeart}
                                className="me-1"
                              />
                              Favori
                            </span>
                          )}
                          <span className="badge bg-info bg-opacity-10 text-info">
                            <FontAwesomeIcon icon={faStar} className="me-1" />
                            {produit.note_moyenne.toFixed(1)} (
                            {produit.nombre_avis})
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="fw-bold text-primary">
                          {formatPrice(produit.prix)}
                        </div>
                        <div className="text-muted small">
                          Total:{" "}
                          {formatPrice(
                            (parseFloat(produit.prix) || 0) * produit.quantite,
                          )}
                        </div>
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
                        {produit.categorie ? (
                          <div>
                            <div className="fw-semibold">
                              {produit.categorie.libelle}
                            </div>
                            <small className="text-muted">
                              {produit.categorie.type}
                            </small>
                          </div>
                        ) : (
                          <span className="text-muted">Non catégorisé</span>
                        )}
                      </td>
                      <td>
                        {produit.utilisateur && (
                          <div className="d-flex align-items-center">
                            <img
                              src={
                                produit.utilisateur.avatar ||
                                `https://ui-avatars.com/api/?name=${produit.utilisateur.nom}+${produit.utilisateur.prenoms}&background=007bff&color=fff`
                              }
                              alt={`${produit.utilisateur.nom} ${produit.utilisateur.prenoms}`}
                              className="rounded-circle me-2"
                              style={{
                                width: "32px",
                                height: "32px",
                                objectFit: "cover",
                              }}
                            />
                            <div>
                              <div className="fw-semibold">
                                {produit.utilisateur.nom}{" "}
                                {produit.utilisateur.prenoms}
                              </div>
                              <small className="text-muted">
                                {produit.utilisateur.email}
                              </small>
                            </div>
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="badge bg-danger">
                          <FontAwesomeIcon icon={faBan} className="me-1" />
                          Bloqué
                        </span>
                        <div className="mt-1">
                          <small className="text-muted">
                            Mis à jour: {formatDate(produit.updatedAt)}
                          </small>
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="btn-group btn-group-sm" role="group">
                          <button
                            className="btn btn-outline-info"
                            title="Voir détails"
                            onClick={() =>
                              console.log("Voir détails:", produit.uuid)
                            }
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <button
                            className="btn btn-outline-success"
                            title="Débloquer"
                            onClick={() => handleUnblockProduit(produit.uuid)}
                          >
                            <FontAwesomeIcon icon={faCheckCircle} />
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            title="Supprimer"
                            onClick={() => handleDeleteProduit(produit.uuid)}
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
          </div>
        </div>
      )}

      {/* Pied de page */}
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
                Gestion des produits bloqués
              </h6>
              <div className="row">
                <div className="col-md-6">
                  <ul className="mb-0">
                    <li>
                      Vous pouvez sélectionner plusieurs produits pour des
                      actions en masse
                    </li>
                    <li>
                      Le déblocage rend le produit visible aux utilisateurs
                    </li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <ul className="mb-0">
                    <li>La suppression est définitive et irréversible</li>
                    <li>Exportez les données en CSV pour archivage</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
