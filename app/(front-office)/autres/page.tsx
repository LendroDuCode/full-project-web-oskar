// app/(front-office)/autre/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import colors from "@/app/shared/constants/colors";
import { API_ENDPOINTS } from "@/config/api-endpoints";

// Types
interface Categorie {
  uuid: string;
  libelle: string;
  description: string;
  image?: string;
  slug: string;
}

interface Don {
  uuid: string;
  titre: string;
  description: string;
  image?: string;
  statut: string;
  createdAt: string;
}

interface Echange {
  uuid: string;
  titre: string;
  description: string;
  image?: string;
  statut: string;
  createdAt: string;
}

interface Produit {
  uuid: string;
  nom: string;
  description: string;
  image?: string;
  prix: number;
  statut: string;
  createdAt: string;
}

interface CategoryData {
  categorie: Categorie;
  dons: Don[];
  echanges: Echange[];
  produits: Produit[];
  stats: {
    totalDons: number;
    totalEchanges: number;
    totalProduits: number;
    totalItems: number;
  };
}

interface ListingItem {
  uuid: string;
  titre: string;
  description: string;
  image?: string;
  type: "don" | "echange" | "produit";
  date: string;
  prix?: number;
  statut: string;
}

// Fonction utilitaire pour convertir les filtres UI en types d'items
const filterToItemType = (filter: string): "don" | "echange" | "produit" => {
  switch(filter) {
    case "dons": return "don";
    case "echanges": return "echange";
    case "produits": return "produit";
    default: return "don"; // Fallback
  }
};

export default function AutrePage() {
  const [data, setData] = useState<CategoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOption, setSortOption] = useState("recent");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "dons" | "echanges" | "produits"
  >("all");
  const [allItems, setAllItems] = useState<ListingItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ListingItem[]>([]);

  // Fonction pour récupérer les données
  const fetchCategoryData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `http://localhost:3005${API_ENDPOINTS.CATEGORIES.BY_LIBELLE_WITH_ITEMS("Autre")}`,
      );

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // Vérifier si nous avons un tableau ou un objet unique
      const categoryData = Array.isArray(result) ? result[0] : result;

      if (!categoryData) {
        throw new Error("Aucune donnée disponible pour cette catégorie");
      }

      setData(categoryData);

      // Combiner tous les items
      const items: ListingItem[] = [
        ...categoryData.dons.map((don: Don) => ({
          uuid: don.uuid,
          titre: don.titre,
          description: don.description,
          image: don.image,
          type: "don" as const,
          date: don.createdAt,
          statut: don.statut,
        })),
        ...categoryData.echanges.map((echange: Echange) => ({
          uuid: echange.uuid,
          titre: echange.titre,
          description: echange.description,
          image: echange.image,
          type: "echange" as const,
          date: echange.createdAt,
          statut: echange.statut,
        })),
        ...categoryData.produits.map((produit: Produit) => ({
          uuid: produit.uuid,
          titre: produit.nom,
          description: produit.description,
          image: produit.image,
          type: "produit" as const,
          date: produit.createdAt,
          prix: produit.prix,
          statut: produit.statut,
        })),
      ];

      setAllItems(items);
      setFilteredItems(items);
    } catch (err) {
      console.error("Erreur lors du chargement des données:", err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategoryData();
  }, [fetchCategoryData]);

  // Filtrer les items
  useEffect(() => {
    if (activeFilter === "all") {
      setFilteredItems(allItems);
    } else {
      const itemType = filterToItemType(activeFilter);
      setFilteredItems(allItems.filter((item) => item.type === itemType));
    }
  }, [activeFilter, allItems]);

  // Trier les items
  useEffect(() => {
    const sorted = [...filteredItems].sort((a, b) => {
      switch (sortOption) {
        case "recent":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "title-asc":
          return a.titre.localeCompare(b.titre);
        case "title-desc":
          return b.titre.localeCompare(a.titre);
        default:
          return 0;
      }
    });
    setFilteredItems(sorted);
  }, [sortOption, filteredItems]);

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Composant de chargement
  if (loading) {
    return (
      <section className="py-5">
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
            <p className="mt-3 text-muted">
              Chargement des objets de la catégorie Autre...
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Composant d'erreur
  if (error) {
    return (
      <section className="py-5">
        <div className="container">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Erreur de chargement</h4>
            <p>{error}</p>
            <hr />
            <button
              className="btn btn-danger"
              onClick={() => fetchCategoryData()}
            >
              Réessayer
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Composant si aucune donnée
  if (!data) {
    return (
      <section className="py-5">
        <div className="container">
          <div className="text-center py-5">
            <div className="mb-4">
              <i className="fas fa-box-open fa-4x text-muted"></i>
            </div>
            <h3 className="mb-3">Aucun objet disponible</h3>
            <p className="text-muted mb-4">
              Aucun don, échange ou produit n'est disponible dans cette
              catégorie pour le moment.
            </p>
            <Link href="/publication-annonce" className="btn btn-success">
              <i className="fas fa-plus me-2"></i>
              Publier un objet
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section
        className="py-4 py-md-5"
        style={{
          background: `linear-gradient(135deg, ${colors.oskar.green} 0%, ${colors.oskar.green || "#1e7d3e"} 100%)`,
          color: "white",
        }}
      >
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <div className="mb-3">
                <nav aria-label="breadcrumb">
                  <ol
                    className="breadcrumb"
                    style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                  >
                    <li className="breadcrumb-item">
                      <Link
                        href="/"
                        className="text-white text-decoration-none"
                      >
                        <i className="fas fa-home"></i> Accueil
                      </Link>
                    </li>
                    <li
                      className="breadcrumb-item active text-white"
                      aria-current="page"
                    >
                      {data.categorie.libelle}
                    </li>
                  </ol>
                </nav>

                <h1 className="display-5 fw-bold mb-2">
                  {data.categorie.libelle}
                </h1>
                <p className="lead mb-3 opacity-90">
                  {data.categorie.description ||
                    "Découvrez une variété d'objets divers dans cette catégorie."}
                </p>

                <div className="d-flex flex-wrap gap-2">
                  <Link
                    href="/publication-annonce?type=don"
                    className="btn btn-light btn-sm px-3 py-2 fw-semibold"
                    style={{ color: colors.oskar.green }}
                  >
                    <i className="fas fa-gift me-1"></i>
                    Proposer un don
                  </Link>
                  <Link
                    href="/publication-annonce?type=echange"
                    className="btn btn-outline-light btn-sm px-3 py-2 fw-semibold"
                  >
                    <i className="fas fa-exchange-alt me-1"></i>
                    Proposer un échange
                  </Link>
                  <Link
                    href="/vendre"
                    className="btn btn-outline-light btn-sm px-3 py-2 fw-semibold"
                  >
                    <i className="fas fa-tag me-1"></i>
                    Vendre un objet
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-lg-4 text-center d-none d-lg-block">
              {data.categorie.image ? (
                <div className="position-relative" style={{ height: "180px" }}>
                  <Image
                    src={data.categorie.image}
                    alt={data.categorie.libelle}
                    fill
                    className="rounded-3 object-fit-cover"
                    style={{ border: "4px solid rgba(255,255,255,0.2)" }}
                  />
                </div>
              ) : (
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center p-3"
                  style={{
                    background: "rgba(255, 255, 255, 0.15)",
                    width: "140px",
                    height: "140px",
                  }}
                >
                  <i className="fas fa-boxes fa-4x"></i>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Statistiques */}
      <section className="py-3 border-bottom bg-light">
        <div className="container">
          <div className="row g-3">
            <div className="col-6 col-md-3">
              <div className="text-center">
                <div
                  className="fs-3 fw-bold"
                  style={{ color: colors.oskar.green }}
                >
                  {data.stats.totalDons}
                </div>
                <div className="text-muted small">
                  <i className="fas fa-gift me-1"></i>
                  Dons
                </div>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="text-center">
                <div className="fs-3 fw-bold" style={{ color: "#9C27B0" }}>
                  {data.stats.totalEchanges}
                </div>
                <div className="text-muted small">
                  <i className="fas fa-exchange-alt me-1"></i>
                  Échanges
                </div>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="text-center">
                <div className="fs-3 fw-bold" style={{ color: "#FF9800" }}>
                  {data.stats.totalProduits}
                </div>
                <div className="text-muted small">
                  <i className="fas fa-shopping-bag me-1"></i>
                  Produits
                </div>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="text-center">
                <div
                  className="fs-3 fw-bold"
                  style={{ color: colors.oskar.green }}
                >
                  {data.stats.totalItems}
                </div>
                <div className="text-muted small">
                  <i className="fas fa-boxes me-1"></i>
                  Total
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contenu principal */}
      <section className="py-4">
        <div className="container">
          {/* Barre de filtres */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                <div>
                  <h2 className="h5 fw-bold mb-0">
                    {activeFilter === "all" && "Tous les objets"}
                    {activeFilter === "dons" && "Dons disponibles"}
                    {activeFilter === "echanges" && "Échanges disponibles"}
                    {activeFilter === "produits" && "Produits en vente"}
                  </h2>
                  <p className="text-muted small mb-0">
                    {filteredItems.length} objet
                    {filteredItems.length > 1 ? "s" : ""} trouvé
                    {filteredItems.length > 1 ? "s" : ""}
                  </p>
                </div>

                <div className="d-flex flex-wrap gap-2">
                  {/* Filtres par type */}
                  <div className="btn-group btn-group-sm" role="group">
                    <button
                      type="button"
                      className={`btn ${activeFilter === "all" ? "btn-success" : "btn-outline-success"}`}
                      onClick={() => setActiveFilter("all")}
                    >
                      Tous ({data.stats.totalItems})
                    </button>
                    <button
                      type="button"
                      className={`btn ${activeFilter === "dons" ? "btn-success" : "btn-outline-success"}`}
                      onClick={() => setActiveFilter("dons")}
                    >
                      Dons ({data.stats.totalDons})
                    </button>
                    <button
                      type="button"
                      className={`btn ${activeFilter === "echanges" ? "btn-success" : "btn-outline-success"}`}
                      onClick={() => setActiveFilter("echanges")}
                    >
                      Échanges ({data.stats.totalEchanges})
                    </button>
                    <button
                      type="button"
                      className={`btn ${activeFilter === "produits" ? "btn-success" : "btn-outline-success"}`}
                      onClick={() => setActiveFilter("produits")}
                    >
                      Produits ({data.stats.totalProduits})
                    </button>
                  </div>

                  {/* Tri */}
                  <div className="dropdown">
                    <button
                      className="btn btn-outline-secondary btn-sm dropdown-toggle"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="fas fa-sort me-1"></i>
                      Trier
                    </button>
                    <ul className="dropdown-menu">
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => setSortOption("recent")}
                        >
                          Plus récents
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => setSortOption("oldest")}
                        >
                          Plus anciens
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => setSortOption("title-asc")}
                        >
                          Titre A-Z
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => setSortOption("title-desc")}
                        >
                          Titre Z-A
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* Vue */}
                  <div className="btn-group btn-group-sm" role="group">
                    <button
                      type="button"
                      className={`btn ${viewMode === "grid" ? "btn-success" : "btn-outline-success"}`}
                      onClick={() => setViewMode("grid")}
                      title="Vue grille"
                    >
                      <i className="fas fa-th"></i>
                    </button>
                    <button
                      type="button"
                      className={`btn ${viewMode === "list" ? "btn-success" : "btn-outline-success"}`}
                      onClick={() => setViewMode("list")}
                      title="Vue liste"
                    >
                      <i className="fas fa-list"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Liste des objets */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-5 my-5">
              <div className="mb-4">
                <i className="fas fa-search fa-4x text-muted"></i>
              </div>
              <h4 className="mb-3">Aucun objet trouvé</h4>
              <p className="text-muted mb-4">
                Aucun objet ne correspond à votre filtre dans cette catégorie.
              </p>
              <button
                className="btn btn-outline-success"
                onClick={() => setActiveFilter("all")}
              >
                Voir tous les objets
              </button>
            </div>
          ) : (
            <div
              className={`row g-3 ${viewMode === "list" ? "row-cols-1" : "row-cols-2 row-cols-md-3 row-cols-lg-4"}`}
            >
              {filteredItems.map((item) => (
                <div key={item.uuid} className="col">
                  <div className="card h-100 border-0 shadow-sm hover-shadow transition-all">
                    {/* Badge type */}
                    <div className="position-absolute top-0 end-0 mt-2 me-2">
                      <span
                        className={`badge ${item.type === "don" ? "bg-success" : item.type === "echange" ? "bg-purple" : "bg-warning"} text-white`}
                        style={{
                          backgroundColor:
                            item.type === "echange" ? "#9C27B0" : undefined,
                        }}
                      >
                        {item.type === "don" && "Don"}
                        {item.type === "echange" && "Échange"}
                        {item.type === "produit" && "Vente"}
                      </span>
                    </div>

                    {/* Image */}
                    <div
                      className="position-relative"
                      style={{
                        height: viewMode === "list" ? "200px" : "180px",
                      }}
                    >
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.titre}
                          fill
                          className="card-img-top object-fit-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="h-100 d-flex align-items-center justify-content-center bg-light">
                          <i
                            className={`fas ${
                              item.type === "don"
                                ? "fa-gift"
                                : item.type === "echange"
                                  ? "fa-exchange-alt"
                                  : "fa-shopping-bag"
                            } fa-3x text-muted`}
                          ></i>
                        </div>
                      )}
                    </div>

                    {/* Contenu */}
                    <div className="card-body p-3">
                      <h5 className="card-title h6 fw-bold mb-1 text-truncate">
                        {item.titre}
                      </h5>

                      <p className="card-text small text-muted mb-2 line-clamp-2">
                        {item.description}
                      </p>

                      {item.type === "produit" && item.prix && (
                        <div className="mb-2">
                          <span className="fw-bold text-success">
                            {item.prix.toFixed(2)} €
                          </span>
                        </div>
                      )}

                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          <i className="far fa-clock me-1"></i>
                          {formatDate(item.date)}
                        </small>

                        <Link
                          href={`/${item.type === "don" ? "dons" : item.type === "echange" ? "echanges" : "produits"}/${item.uuid}`}
                          className="btn btn-sm btn-outline-success"
                        >
                          Voir
                        </Link>
                      </div>
                    </div>

                    {/* Statut */}
                    <div className="card-footer bg-transparent border-top-0 py-2">
                      <small
                        className={`badge bg-${item.statut === "actif" ? "success" : "secondary"}-subtle text-${item.statut === "actif" ? "success" : "secondary"}`}
                      >
                        {item.statut === "actif"
                          ? "Disponible"
                          : "Indisponible"}
                      </small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Appel à l'action */}
          <div className="mt-5 pt-4 border-top">
            <div className="row align-items-center">
              <div className="col-md-8">
                <h3 className="h5 fw-bold mb-2">
                  Vous avez un objet à donner, échanger ou vendre ?
                </h3>
                <p className="text-muted small mb-0">
                  Publiez-le gratuitement sur OSKAR et touchez des milliers de
                  membres.
                </p>
              </div>
              <div className="col-md-4 text-md-end">
                <Link
                  href="/publication-annonce"
                  className="btn btn-success px-4"
                >
                  <i className="fas fa-plus-circle me-2"></i>
                  Publier un objet
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section informations */}
      <section className="py-4 bg-light">
        <div className="container">
          <h3 className="h5 fw-bold mb-4 text-center">
            À propos de la catégorie {data.categorie.libelle}
          </h3>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card border-0 h-100">
                <div className="card-body p-3 text-center">
                  <div className="rounded-circle bg-success bg-opacity-10 d-inline-flex align-items-center justify-content-center p-3 mb-3">
                    <i
                      className="fas fa-question-circle fa-2x"
                      style={{ color: colors.oskar.green }}
                    ></i>
                  </div>
                  <h5 className="card-title h6 fw-bold mb-2">
                    Qu'est-ce qu'on trouve ici ?
                  </h5>
                  <p className="card-text small text-muted">
                    Des objets divers qui ne rentrent pas dans les autres
                    catégories spécifiques.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 h-100">
                <div className="card-body p-3 text-center">
                  <div className="rounded-circle bg-success bg-opacity-10 d-inline-flex align-items-center justify-content-center p-3 mb-3">
                    <i
                      className="fas fa-lightbulb fa-2x"
                      style={{ color: colors.oskar.green }}
                    ></i>
                  </div>
                  <h5 className="card-title h6 fw-bold mb-2">Idées d'objets</h5>
                  <p className="card-text small text-muted">
                    Outils, matériel, équipement, fournitures, et bien d'autres
                    objets utiles.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 h-100">
                <div className="card-body p-3 text-center">
                  <div className="rounded-circle bg-success bg-opacity-10 d-inline-flex align-items-center justify-content-center p-3 mb-3">
                    <i
                      className="fas fa-hands-helping fa-2x"
                      style={{ color: colors.oskar.green }}
                    ></i>
                  </div>
                  <h5 className="card-title h6 fw-bold mb-2">Contribuez !</h5>
                  <p className="card-text small text-muted">
                    Donnez une seconde vie à vos objets inutilisés en les
                    proposant à la communauté.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .hover-shadow {
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }
        .hover-shadow:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .transition-all {
          transition: all 0.3s ease;
        }
        .bg-purple {
          background-color: #9c27b0;
        }
      `}</style>
    </>
  );
}