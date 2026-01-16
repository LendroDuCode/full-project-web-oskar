// app/(front-office)/vetements-chaussures/page.tsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import colors from "@/app/shared/constants/colors";
import FiltersSidebar from "../home/components/FiltersSidebar";
import FilterStatsBar from "../home/components/FilterStatsBar";
import ListingsGrid from "../home/components/ListingsGrid";

interface DonItem {
  uuid: string;
  nom: string;
  description: string;
  image: string;
  localisation: string;
  type_don: string;
  statut: string;
  quantite: number;
  note_moyenne: number;
  vendeur?: {
    nom: string;
    prenoms: string;
  };
  utilisateur?: {
    nom: string;
    prenoms: string;
  };
}

interface EchangeItem {
  uuid: string;
  nomElementEchange: string;
  objetPropose: string;
  objetDemande: string;
  image: string;
  statut: string;
  prix: string;
  quantite: number;
  note_moyenne: number;
}

interface CategoryData {
  categorie: {
    libelle: string;
    description: string;
    image: string;
  };
  dons: DonItem[];
  echanges: EchangeItem[];
  produits: any[];
  stats: {
    totalDons: number;
    totalEchanges: number;
    totalProduits: number;
    totalItems: number;
  };
}

const getFullApiUrl = (endpoint: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005";
  return `${baseUrl}${endpoint}`;
};

export default function VetementsChaussuresPage() {
  const [categoryData, setCategoryData] = useState<CategoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOption, setSortOption] = useState("recent");
  const [activeFilter, setActiveFilter] = useState("all");
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);

        // URL encodée correctement
        const libelleEncoded = encodeURIComponent("Vêtements & Chaussures");
        const endpoint = `/categories/libelle/${libelleEncoded}/with-items`;

        const response = await axios.get(getFullApiUrl(endpoint));

        setCategoryData(response.data[0]);
        setError(null);
      } catch (err: any) {
        console.error("Erreur lors du chargement des données:", err);

        if (err.response) {
          setError(
            `Erreur ${err.response.status}: ${err.response.data?.message || "Impossible de charger les données"}`,
          );
        } else if (err.request) {
          setError(
            "Impossible de se connecter au serveur. Vérifiez votre connexion.",
          );
        } else {
          setError("Une erreur inattendue s'est produite.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, []);

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    console.log("Filtres appliqués:", newFilters);
  };

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
  };

  const handleSortChange = (sort: string) => {
    setSortOption(sort);
  };

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
  };

  if (loading) {
    return (
      <section className="py-5">
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
            <p className="mt-3">Chargement des annonces...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-5">
        <div className="container">
          <div className="alert alert-danger" role="alert">
            {error}
            <div className="mt-2">
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => window.location.reload()}
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!categoryData) {
    return (
      <section className="py-5">
        <div className="container">
          <div className="alert alert-warning" role="alert">
            Aucune donnée disponible pour cette catégorie.
          </div>
        </div>
      </section>
    );
  }

  const stats = {
    totalDons: categoryData.stats.totalDons,
    totalEchanges: categoryData.stats.totalEchanges,
    totalProduits: categoryData.stats.totalProduits,
    totalItems: categoryData.stats.totalItems,
  };

  return (
    <>
      {/* Hero Section */}
      <section
        className="py-4 py-md-5"
        style={{
          background: `linear-gradient(135deg, ${colors.oskar.green} 0%, ${colors.oskar.darkGreen || "#1e7d3e"} 100%)`,
          color: "white",
        }}
      >
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <div className="mb-3">
                <h1 className="display-5 fw-bold mb-2">
                  Vêtements & Chaussures
                </h1>
                <p className="lead mb-3 opacity-90">
                  Découvrez des vêtements et chaussures d'occasion de qualité à
                  prix abordables.
                </p>
                <div className="d-flex flex-wrap gap-2">
                  <Link
                    href="/publication-annonce?categorie=Vêtements & Chaussures"
                    className="btn btn-light btn-sm px-3 py-2 fw-semibold"
                    style={{ color: colors.oskar.green }}
                  >
                    <i className="fas fa-tshirt me-1"></i>
                    Vendre un vêtement
                  </Link>
                  <Link
                    href="/publication-annonce?type=don&categorie=Vêtements & Chaussures"
                    className="btn btn-outline-light btn-sm px-3 py-2 fw-semibold"
                  >
                    <i className="fas fa-gift me-1"></i>
                    Donner des vêtements
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-lg-4 text-center d-none d-lg-block">
              <div
                className="rounded-circle d-inline-flex align-items-center justify-content-center p-3"
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  width: "120px",
                  height: "120px",
                }}
              >
                <i className="fas fa-tshirt fa-4x"></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistiques */}
      <section className="py-3 border-bottom">
        <div className="container">
          <div className="row g-3">
            <div className="col-3">
              <div className="text-center">
                <div
                  className="fs-4 fw-bold"
                  style={{ color: colors.oskar.green }}
                >
                  {stats.totalItems}
                </div>
                <div className="text-muted small">Total</div>
              </div>
            </div>
            <div className="col-3">
              <div className="text-center">
                <div className="fs-4 fw-bold" style={{ color: "#2196F3" }}>
                  {stats.totalProduits}
                </div>
                <div className="text-muted small">Ventes</div>
              </div>
            </div>
            <div className="col-3">
              <div className="text-center">
                <div
                  className="fs-4 fw-bold"
                  style={{ color: colors.oskar.green }}
                >
                  {stats.totalDons}
                </div>
                <div className="text-muted small">Dons</div>
              </div>
            </div>
            <div className="col-3">
              <div className="text-center">
                <div className="fs-4 fw-bold" style={{ color: "#9C27B0" }}>
                  {stats.totalEchanges}
                </div>
                <div className="text-muted small">Échanges</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contenu principal */}
      <section className="py-4">
        <div className="container">
          <div className="row g-3">
            {/* Sidebar des filtres */}
            <div className="col-xl-3 col-lg-4 d-none d-lg-block">
              <div className="sticky-top" style={{ top: "90px" }}>
                <FiltersSidebar
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                />

                {/* Info supplémentaire */}
                <div className="card border-0 shadow-sm mt-3">
                  <div className="card-body p-3">
                    <h6 className="card-title fw-semibold mb-2">
                      <i
                        className="fas fa-info-circle me-1"
                        style={{
                          color: colors.oskar.green,
                          fontSize: "0.9rem",
                        }}
                      ></i>
                      Catégorie : Vêtements & Chaussures
                    </h6>
                    <div className="mb-2">
                      <p className="small text-muted mb-1">
                        <i
                          className="fas fa-tshirt me-1"
                          style={{ color: colors.oskar.green }}
                        ></i>
                        <strong>Vêtements :</strong> Hommes, femmes, enfants
                      </p>
                    </div>
                    <div className="mb-2">
                      <p className="small text-muted mb-1">
                        <i
                          className="fas fa-shoe-prints me-1"
                          style={{ color: "#2196F3" }}
                        ></i>
                        <strong>Chaussures :</strong> Toutes pointures
                      </p>
                    </div>
                    <div>
                      <p className="small text-muted mb-0">
                        <i
                          className="fas fa-hand-holding-heart me-1"
                          style={{ color: "#9C27B0" }}
                        ></i>
                        <strong>Accessoires :</strong> Sacs, ceintures, bijoux
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenu principal */}
            <div className="col-xl-9 col-lg-8">
              {/* Barre de filtres et options - SANS LE COMPTEUR */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <h2 className="h5 fw-bold mb-0">
                      Annonces de vêtements et chaussures
                    </h2>
                  </div>
                  <div className="d-flex gap-1">
                    <button
                      className="btn btn-outline-success btn-sm d-lg-none"
                      onClick={() => setShowFilters(!showFilters)}
                      type="button"
                    >
                      <i className="fas fa-sliders-h"></i>
                    </button>
                  </div>
                </div>

                {/* FilterStatsBar sans le compteur */}
                <FilterStatsBar
                  totalItems={0}
                  activeFilter={activeFilter}
                  onFilterChange={handleFilterChange}
                  viewMode={viewMode}
                  onViewModeChange={handleViewModeChange}
                  sortOption={sortOption}
                  onSortChange={handleSortChange}
                />
              </div>

              {/* Filtres mobiles */}
              {showFilters && (
                <div className="card mb-3 d-lg-none">
                  <div className="card-header bg-white py-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="small fw-semibold">Filtres</span>
                      <button
                        className="btn btn-link p-0"
                        onClick={() => setShowFilters(false)}
                        type="button"
                      >
                        <i className="fas fa-times small"></i>
                      </button>
                    </div>
                  </div>
                  <div className="card-body p-2">
                    <FiltersSidebar
                      filters={filters}
                      onFiltersChange={handleFiltersChange}
                    />
                  </div>
                </div>
              )}

              {/* Liste des annonces */}
              <ListingsGrid
                filterType={
                  activeFilter === "donation"
                    ? "donation"
                    : activeFilter === "exchange"
                      ? "exchange"
                      : "all"
                }
                viewMode={viewMode}
                sortOption={sortOption}
              />

              {/* Section d'information compacte */}
              <div className="mt-4 pt-3 border-top">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-3">
                        <div className="d-flex align-items-start">
                          <div
                            className="rounded-circle p-2 me-2 flex-shrink-0"
                            style={{ backgroundColor: colors.oskar.lightGreen }}
                          >
                            <i
                              className="fas fa-leaf"
                              style={{ color: colors.oskar.green }}
                            ></i>
                          </div>
                          <div>
                            <h6 className="fw-bold mb-1">Mode responsable</h6>
                            <p className="small text-muted mb-2">
                              Achetez d'occasion pour une mode plus durable.
                            </p>
                            <ul className="list-unstyled small mb-0">
                              <li className="mb-1">
                                <i
                                  className="fas fa-check-circle me-1"
                                  style={{
                                    color: colors.oskar.green,
                                    fontSize: "0.7rem",
                                  }}
                                ></i>
                                Réduction des déchets textiles
                              </li>
                              <li className="mb-1">
                                <i
                                  className="fas fa-check-circle me-1"
                                  style={{
                                    color: colors.oskar.green,
                                    fontSize: "0.7rem",
                                  }}
                                ></i>
                                Économie circulaire
                              </li>
                              <li>
                                <i
                                  className="fas fa-check-circle me-1"
                                  style={{
                                    color: colors.oskar.green,
                                    fontSize: "0.7rem",
                                  }}
                                ></i>
                                Prix abordables
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-3">
                        <div className="d-flex align-items-start">
                          <div
                            className="rounded-circle p-2 me-2 flex-shrink-0"
                            style={{ backgroundColor: "#E3F2FD" }}
                          >
                            <i
                              className="fas fa-hand-holding-heart"
                              style={{ color: "#2196F3" }}
                            ></i>
                          </div>
                          <div>
                            <h6 className="fw-bold mb-1">
                              Donner ses vêtements
                            </h6>
                            <p className="small text-muted mb-2">
                              Faites plaisir et désencombrez votre dressing.
                            </p>
                            <ul className="list-unstyled small mb-0">
                              <li className="mb-1">
                                <i
                                  className="fas fa-check-circle me-1"
                                  style={{
                                    color: "#2196F3",
                                    fontSize: "0.7rem",
                                  }}
                                ></i>
                                Vêtements en bon état
                              </li>
                              <li className="mb-1">
                                <i
                                  className="fas fa-check-circle me-1"
                                  style={{
                                    color: "#2196F3",
                                    fontSize: "0.7rem",
                                  }}
                                ></i>
                                Nettoyés et repassés
                              </li>
                              <li>
                                <i
                                  className="fas fa-check-circle me-1"
                                  style={{
                                    color: "#2196F3",
                                    fontSize: "0.7rem",
                                  }}
                                ></i>
                                Photos claires
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA compact */}
              <div
                className="mt-4 rounded-2 p-3 text-center"
                style={{
                  background: `linear-gradient(135deg, ${colors.oskar.lightGreen} 0%, ${colors.oskar.lightGreen}20 100%)`,
                  border: `1px solid ${colors.oskar.green}20`,
                }}
              >
                <h6 className="fw-bold mb-2">
                  Vêtements ou chaussures à vendre ?
                </h6>
                <p className="small text-muted mb-3">
                  Donnez une seconde vie à vos affaires
                </p>
                <div className="d-flex flex-wrap gap-2 justify-content-center">
                  <Link
                    href="/publication-annonce?categorie=Vêtements & Chaussures"
                    className="btn btn-success btn-sm px-3"
                  >
                    <i className="fas fa-tshirt me-1"></i>
                    Publier une annonce
                  </Link>
                  <Link
                    href="/publication-annonce?type=don&categorie=Vêtements & Chaussures"
                    className="btn btn-outline-success btn-sm px-3"
                  >
                    <i className="fas fa-gift me-1"></i>
                    Faire un don
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ compacte */}
      <section className="py-4 bg-light">
        <div className="container">
          <div className="text-center mb-4">
            <h3 className="h5 fw-bold mb-1">Questions fréquentes</h3>
            <p className="text-muted small">
              Tout sur les vêtements et chaussures
            </p>
          </div>
          <div className="row g-3">
            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-3">
                  <h6 className="fw-semibold mb-2">
                    <i
                      className="fas fa-question-circle me-1"
                      style={{ color: colors.oskar.green, fontSize: "0.9rem" }}
                    ></i>
                    Dans quel état doivent être les vêtements ?
                  </h6>
                  <p className="small text-muted mb-0">
                    Les vêtements doivent être en bon état, propres et sans
                    taches. Merci de mentionner les petits défauts.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-3">
                  <h6 className="fw-semibold mb-2">
                    <i
                      className="fas fa-question-circle me-1"
                      style={{ color: "#2196F3", fontSize: "0.9rem" }}
                    ></i>
                    Peut-on essayer les vêtements ?
                  </h6>
                  <p className="small text-muted mb-0">
                    C'est à négocier avec le vendeur. Précisez vos mensurations
                    pour éviter les mauvaises surprises.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-3">
                  <h6 className="fw-semibold mb-2">
                    <i
                      className="fas fa-question-circle me-1"
                      style={{ color: colors.oskar.green, fontSize: "0.9rem" }}
                    ></i>
                    Comment connaître la taille exacte ?
                  </h6>
                  <p className="small text-muted mb-0">
                    Nous vous conseillons de demander les mesures exactes au
                    vendeur (tour de poitrine, taille, longueur).
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-3">
                  <h6 className="fw-semibold mb-2">
                    <i
                      className="fas fa-question-circle me-1"
                      style={{ color: "#2196F3", fontSize: "0.9rem" }}
                    ></i>
                    Puis-je échanger un vêtement ?
                  </h6>
                  <p className="small text-muted mb-0">
                    Oui, vous pouvez proposer un échange contre un autre
                    vêtement ou objet de valeur similaire.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .sticky-top {
          position: sticky;
          top: 90px;
        }

        @media (max-width: 1199.98px) {
          .col-xl-3 {
            flex: 0 0 25%;
            max-width: 25%;
          }
          .col-xl-9 {
            flex: 0 0 75%;
            max-width: 75%;
          }
        }

        @media (max-width: 991.98px) {
          .col-lg-4 {
            flex: 0 0 33.333333%;
            max-width: 33.333333%;
          }
          .col-lg-8 {
            flex: 0 0 66.666667%;
            max-width: 66.666667%;
          }
        }

        @media (max-width: 767.98px) {
          .display-5 {
            font-size: 1.75rem;
          }
          .lead {
            font-size: 1rem;
          }
        }
      `}</style>
    </>
  );
}
