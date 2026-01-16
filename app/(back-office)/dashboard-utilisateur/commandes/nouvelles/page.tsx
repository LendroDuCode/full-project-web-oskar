// app/(front-office)/commandes-nouvelles/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faShoppingBag,
  faMoneyBillWave,
  faChartBar,
  faEye,
  faSearch,
  faFilter,
  faSort,
  faSortUp,
  faSortDown,
  faDownload,
  faSync,
  faTimesCircle,
  faInfoCircle,
  faShoppingCart,
  faTags,
  faCalendarAlt,
  faStore,
  faUserCircle,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

// Types
interface Categorie {
  uuid: string;
  libelle: string;
  type: string;
  image: string;
  is_deleted: boolean;
}

interface Produit {
  uuid: string;
  libelle: string;
  description: string | null;
  image: string;
  prix: string;
  categorie: Categorie;
  disponible: boolean;
  est_bloque: boolean;
}

interface ProduitCommande {
  produit: Produit;
  total_quantite: number;
  total_montant: string;
  nombre_commandes: number;
  prix_moyen: string;
}

interface Resume {
  nombre_produits_distincts: number;
  total_quantite_commandee: number;
  total_montant_depense: string;
  nombre_total_commandes: number;
}

interface Utilisateur {
  uuid: string;
  nom: string;
  prenoms: string;
}

// Composant de carte de produit
const ProduitCard = ({ produit }: { produit: ProduitCommande }) => {
  const [imageError, setImageError] = useState(false);

  const formatPrice = (priceStr: string): string => {
    const num = parseFloat(priceStr);
    if (isNaN(num)) return "0 FCFA";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Fonction pour corriger les URLs d'images mal formatées
  const getImageUrl = (url: string | null) => {
    if (!url || imageError) {
      return "/placeholder-product.jpg"; // Fichier qui doit exister dans votre dossier public
    }

    // Corriger les URLs mal formatées
    if (url.startsWith("http:")) {
      if (!url.startsWith("http://")) {
        url = url.replace("http:", "http://");
      }
    }

    // S'assurer que c'est une URL valide
    if (!url.startsWith("http")) {
      return "/placeholder-product.jpg";
    }

    return url;
  };

  return (
    <div className="card border-0 shadow-sm h-100 transition-all hover-lift">
      <div className="position-relative">
        <div
          className="card-img-top overflow-hidden"
          style={{ height: "200px", position: "relative" }}
        >
          <Image
            src={getImageUrl(produit.produit.image)}
            alt={produit.produit.libelle}
            fill
            className="object-fit-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImageError(true)}
            priority={false}
          />
        </div>

        {produit.produit.est_bloque && (
          <div className="position-absolute top-0 end-0 m-2">
            <span className="badge bg-danger rounded-pill">
              <FontAwesomeIcon icon={faTimesCircle} className="me-1" />
              Bloqué
            </span>
          </div>
        )}

        {!produit.produit.disponible && (
          <div className="position-absolute top-0 start-0 m-2">
            <span className="badge bg-warning rounded-pill">
              <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
              Indisponible
            </span>
          </div>
        )}
      </div>

      <div className="card-body d-flex flex-column">
        <div className="mb-2">
          <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25">
            <FontAwesomeIcon icon={faTags} className="me-1" />
            {produit.produit.categorie?.libelle || "Non catégorisé"}
          </span>
          {produit.produit.categorie?.is_deleted && (
            <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 ms-1">
              Catégorie supprimée
            </span>
          )}
        </div>

        <h5
          className="card-title text-truncate"
          title={produit.produit.libelle}
        >
          {produit.produit.libelle}
        </h5>

        {produit.produit.description && (
          <p className="card-text text-muted small mb-3">
            {produit.produit.description.length > 80
              ? `${produit.produit.description.substring(0, 80)}...`
              : produit.produit.description}
          </p>
        )}

        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <div className="text-muted small">Prix unitaire</div>
              <div className="h4 fw-bold text-success mb-0">
                {formatPrice(produit.produit.prix)}
              </div>
            </div>
            <div className="text-end">
              <div className="text-muted small">Quantité totale</div>
              <div className="h4 fw-bold text-primary mb-0">
                {produit.total_quantite}
              </div>
            </div>
          </div>

          <div className="d-grid gap-2">
            <Link
              href={`/produits/${produit.produit.uuid}`}
              className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2"
            >
              <FontAwesomeIcon icon={faEye} />
              Voir détails
              <FontAwesomeIcon icon={faArrowRight} className="ms-auto" />
            </Link>
          </div>
        </div>
      </div>

      <div className="card-footer bg-transparent border-top">
        <div className="row text-center">
          <div className="col-6 border-end">
            <div className="text-muted small">Montant total</div>
            <div className="fw-bold text-success">
              {formatPrice(produit.total_montant)}
            </div>
          </div>
          <div className="col-6">
            <div className="text-muted small">Commandes</div>
            <div className="fw-bold">
              <span className="badge bg-info bg-opacity-10 text-info">
                {produit.nombre_commandes}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CommandesNouvelles() {
  const [loading, setLoading] = useState(true);
  const [produitsCommandes, setProduitsCommandes] = useState<ProduitCommande[]>(
    [],
  );
  const [resume, setResume] = useState<Resume | null>(null);
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"quantite" | "montant" | "nom">(
    "quantite",
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Récupérer les données
  const fetchCommandes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<{
        data: {
          produits: ProduitCommande[];
          resume: Resume;
          utilisateur: Utilisateur;
        };
      }>(API_ENDPOINTS.COMMANDES.LISTE_COMMANDE_UTILISATEUR);

      const { produits, resume, utilisateur } = response.data;

      setProduitsCommandes(produits);
      setResume(resume);
      setUtilisateur(utilisateur);
    } catch (err: any) {
      console.error("Erreur chargement commandes :", err);
      setError(
        err.response?.data?.message ||
          "Impossible de charger vos commandes. Veuillez réessayer plus tard.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommandes();
  }, [fetchCommandes]);

  // Format prix
  const formatPrice = (priceStr: string): string => {
    const num = parseFloat(priceStr);
    if (isNaN(num)) return "0 FCFA";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Nettoyer le montant total
  const cleanTotalAmount = (amount: string): string => {
    const cleaned = amount.replace(/[^0-9.]/g, "");
    const num = parseFloat(cleaned);
    return isNaN(num) ? "0" : num.toString();
  };

  // Obtenir les catégories uniques
  const getUniqueCategories = () => {
    const categoriesMap = new Map();
    produitsCommandes.forEach((item) => {
      if (item.produit.categorie) {
        const cat = item.produit.categorie;
        categoriesMap.set(cat.uuid, {
          uuid: cat.uuid,
          libelle: cat.libelle,
          is_deleted: cat.is_deleted,
        });
      }
    });
    return Array.from(categoriesMap.values());
  };

  // Filtrer et trier les produits
  const filteredAndSortedProduits = produitsCommandes
    .filter((item) => {
      // Filtre par recherche
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        return (
          item.produit.libelle.toLowerCase().includes(searchLower) ||
          (item.produit.description?.toLowerCase() || "").includes(
            searchLower,
          ) ||
          item.produit.categorie?.libelle.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .filter((item) => {
      // Filtre par catégorie
      if (categoryFilter !== "all") {
        return item.produit.categorie?.uuid === categoryFilter;
      }
      return true;
    })
    .sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortBy) {
        case "quantite":
          aValue = a.total_quantite;
          bValue = b.total_quantite;
          break;
        case "montant":
          aValue = parseFloat(a.total_montant);
          bValue = parseFloat(b.total_montant);
          break;
        case "nom":
          aValue = a.produit.libelle.toLowerCase();
          bValue = b.produit.libelle.toLowerCase();
          break;
        default:
          return 0;
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  // Gérer le tri
  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("desc");
    }
  };

  const getSortIcon = (field: typeof sortBy) => {
    if (sortBy !== field)
      return <FontAwesomeIcon icon={faSort} className="ms-1 opacity-50" />;
    return sortDirection === "asc" ? (
      <FontAwesomeIcon icon={faSortUp} className="ms-1" />
    ) : (
      <FontAwesomeIcon icon={faSortDown} className="ms-1" />
    );
  };

  // Exporter en CSV
  const handleExportCSV = () => {
    const produits = filteredAndSortedProduits;
    if (produits.length === 0) return;

    const csvContent = [
      [
        "Produit",
        "Catégorie",
        "Prix unitaire",
        "Quantité totale",
        "Montant total",
        "Nombre de commandes",
        "Prix moyen",
        "Disponible",
        "Statut",
      ],
      ...produits.map((item) => [
        item.produit.libelle,
        item.produit.categorie?.libelle || "N/A",
        formatPrice(item.produit.prix).replace("XOF", "FCFA"),
        item.total_quantite,
        formatPrice(item.total_montant).replace("XOF", "FCFA"),
        item.nombre_commandes,
        formatPrice(item.prix_moyen).replace("XOF", "FCFA"),
        item.produit.disponible ? "Oui" : "Non",
        item.produit.est_bloque ? "Bloqué" : "Actif",
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `mes-produits-commandes-${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setSortBy("quantite");
    setSortDirection("desc");
  };

  if (loading) {
    return (
      <div className="min-vh-50 d-flex flex-column justify-content-center align-items-center">
        <div
          className="spinner-border text-primary"
          style={{ width: "3rem", height: "3rem" }}
          role="status"
        >
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p className="mt-3 text-muted">Chargement de vos commandes...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* En-tête avec breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/dashboard" className="text-decoration-none">
              <FontAwesomeIcon icon={faStore} className="me-2" />
              Tableau de bord
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
            Mes commandes
          </li>
        </ol>
      </nav>

      <div className="row mb-4">
        <div className="col-lg-8">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-primary bg-opacity-10 rounded-circle p-3">
              <FontAwesomeIcon
                icon={faShoppingCart}
                className="text-primary fa-2x"
              />
            </div>
            <div>
              <h1 className="h2 fw-bold mb-1">Mes Produits Commandés</h1>
              <p className="text-muted mb-0">
                Historique détaillé de tous vos achats sur la plateforme
              </p>
            </div>
          </div>
        </div>
        {utilisateur && (
          <div className="col-lg-4">
            <div className="card border-0 bg-light">
              <div className="card-body py-3">
                <div className="d-flex align-items-center">
                  <div className="bg-info bg-opacity-10 rounded-circle p-2 me-3">
                    <FontAwesomeIcon
                      icon={faUserCircle}
                      className="text-info"
                    />
                  </div>
                  <div>
                    <div className="fw-semibold">
                      {utilisateur.prenoms} {utilisateur.nom}
                    </div>
                    <small className="text-muted">Client</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show shadow-sm mb-4"
          role="alert"
        >
          <div className="d-flex align-items-center">
            <FontAwesomeIcon icon={faTimesCircle} className="me-3 fs-4" />
            <div className="flex-grow-1">
              <h5 className="alert-heading mb-1">Erreur de chargement</h5>
              <p className="mb-0">{error}</p>
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

      {/* Cartes de statistiques */}
      {resume && (
        <div className="row g-4 mb-5">
          <div className="col-xl-3 col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted text-uppercase small mb-2">
                      Produits distincts
                    </h6>
                    <h2 className="fw-bold text-primary mb-0">
                      {resume.nombre_produits_distincts}
                    </h2>
                    <small className="text-muted">
                      Articles différents achetés
                    </small>
                  </div>
                  <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                    <FontAwesomeIcon
                      icon={faBox}
                      className="text-primary fa-2x"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted text-uppercase small mb-2">
                      Quantité totale
                    </h6>
                    <h2 className="fw-bold text-success mb-0">
                      {resume.total_quantite_commandee}
                    </h2>
                    <small className="text-muted">Unités commandées</small>
                  </div>
                  <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                    <FontAwesomeIcon
                      icon={faShoppingBag}
                      className="text-success fa-2x"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted text-uppercase small mb-2">
                      Total dépensé
                    </h6>
                    <h2 className="fw-bold text-warning mb-0">
                      {formatPrice(
                        cleanTotalAmount(resume.total_montant_depense),
                      )}
                    </h2>
                    <small className="text-muted">
                      Montant total des achats
                    </small>
                  </div>
                  <div className="bg-warning bg-opacity-10 p-3 rounded-circle">
                    <FontAwesomeIcon
                      icon={faMoneyBillWave}
                      className="text-warning fa-2x"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted text-uppercase small mb-2">
                      Commandes passées
                    </h6>
                    <h2 className="fw-bold text-info mb-0">
                      {resume.nombre_total_commandes}
                    </h2>
                    <small className="text-muted">
                      Transactions effectuées
                    </small>
                  </div>
                  <div className="bg-info bg-opacity-10 p-3 rounded-circle">
                    <FontAwesomeIcon
                      icon={faChartBar}
                      className="text-info fa-2x"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section de filtres et actions */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white py-3">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <div>
              <h5 className="card-title mb-1">Filtres et recherches</h5>
              <p className="text-muted small mb-0">
                Trouvez facilement vos produits commandés
              </p>
            </div>
            <div className="d-flex gap-2">
              <button
                onClick={fetchCommandes}
                className="btn btn-outline-primary d-flex align-items-center gap-2"
                title="Rafraîchir la liste"
              >
                <FontAwesomeIcon icon={faSync} />
                Rafraîchir
              </button>
              <button
                onClick={handleExportCSV}
                className="btn btn-outline-success d-flex align-items-center gap-2"
                disabled={filteredAndSortedProduits.length === 0}
                title="Exporter en CSV"
              >
                <FontAwesomeIcon icon={faDownload} />
                Exporter
              </button>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-lg-5">
              <div className="input-group input-group-lg">
                <span className="input-group-text bg-white border-end-0">
                  <FontAwesomeIcon icon={faSearch} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control form-control-lg border-start-0 ps-0"
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="col-lg-4">
              <div className="input-group input-group-lg">
                <span className="input-group-text bg-white border-end-0">
                  <FontAwesomeIcon icon={faFilter} className="text-muted" />
                </span>
                <select
                  className="form-select form-select-lg border-start-0 ps-0"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">Toutes les catégories</option>
                  {getUniqueCategories().map((cat) => (
                    <option key={cat.uuid} value={cat.uuid}>
                      {cat.libelle} {cat.is_deleted && "(supprimée)"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-lg-3">
              <div className="d-flex gap-2">
                <button
                  onClick={() => handleSort("quantite")}
                  className="btn btn-outline-secondary btn-lg flex-grow-1 d-flex align-items-center justify-content-center"
                  title="Trier par quantité"
                >
                  Quantité {getSortIcon("quantite")}
                </button>
                <button
                  onClick={() => handleSort("montant")}
                  className="btn btn-outline-secondary btn-lg flex-grow-1 d-flex align-items-center justify-content-center"
                  title="Trier par montant"
                >
                  Montant {getSortIcon("montant")}
                </button>
              </div>
            </div>
          </div>

          <div className="row mt-4">
            <div className="col-md-6">
              <div className="d-flex align-items-center gap-3">
                <span className="text-muted">
                  <strong>{filteredAndSortedProduits.length}</strong> produit(s)
                  trouvé(s)
                  {searchTerm && (
                    <>
                      {" "}
                      pour "<strong>{searchTerm}</strong>"
                    </>
                  )}
                  {categoryFilter !== "all" && (
                    <>
                      {" "}
                      dans la catégorie "
                      <strong>
                        {
                          getUniqueCategories().find(
                            (c) => c.uuid === categoryFilter,
                          )?.libelle
                        }
                      </strong>
                      "
                    </>
                  )}
                </span>
              </div>
            </div>

            <div className="col-md-6">
              <div className="d-flex gap-2 justify-content-end">
                {(searchTerm || categoryFilter !== "all") && (
                  <button
                    onClick={resetFilters}
                    className="btn btn-outline-dark d-flex align-items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faTimesCircle} />
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des produits en mode grille */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <FontAwesomeIcon
                icon={faShoppingBag}
                className="me-2 text-primary"
              />
              Détail de vos achats
            </h5>
            <span className="badge bg-primary bg-opacity-10 text-primary">
              {filteredAndSortedProduits.length} produit(s)
            </span>
          </div>
        </div>

        <div className="card-body p-4">
          {filteredAndSortedProduits.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-4">
                <FontAwesomeIcon
                  icon={faInfoCircle}
                  className="text-muted fa-4x"
                />
              </div>
              <h4 className="mb-3">Aucun produit trouvé</h4>
              <p className="text-muted mb-4">
                {produitsCommandes.length === 0
                  ? "Vous n'avez encore effectué aucun achat."
                  : "Aucun produit ne correspond à vos critères de recherche."}
              </p>
              {produitsCommandes.length > 0 && (
                <button onClick={resetFilters} className="btn btn-primary">
                  <FontAwesomeIcon icon={faTimesCircle} className="me-2" />
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
              {filteredAndSortedProduits.map((item, index) => (
                <div key={item.produit.uuid || index} className="col">
                  <ProduitCard produit={item} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Styles inline pour animations */}
      <style jsx global>{`
        .hover-lift {
          transition:
            transform 0.2s ease-in-out,
            box-shadow 0.2s ease-in-out;
        }
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
        }
        .object-fit-cover {
          object-fit: cover;
          width: 100%;
          height: 100%;
        }
        .border-primary {
          border-color: rgba(var(--bs-primary-rgb), 0.25) !important;
        }
        .border-success {
          border-color: rgba(var(--bs-success-rgb), 0.25) !important;
        }
        .border-warning {
          border-color: rgba(var(--bs-warning-rgb), 0.25) !important;
        }
        .border-info {
          border-color: rgba(var(--bs-info-rgb), 0.25) !important;
        }
      `}</style>
    </div>
  );
}
