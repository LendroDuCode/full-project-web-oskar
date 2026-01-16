// app/(front-office)/electroniques/page.tsx
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

export default function ElectroniquesPage() {
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
        const libelleEncoded = encodeURIComponent("Électronique");
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
                <h1 className="display-5 fw-bold mb-2">Électronique</h1>
                <p className="lead mb-3 opacity-90">
                  {categoryData.categorie.description ||
                    "Téléphones, ordinateurs, appareils électroniques d'occasion."}
                </p>
                <div className="d-flex flex-wrap gap-2">
                  <Link
                    href="/publication-annonce?categorie=Électronique"
                    className="btn btn-light btn-sm px-3 py-2 fw-semibold"
                    style={{ color: colors.oskar.green }}
                  >
                    <i className="fas fa-mobile-alt me-1"></i>
                    Vendre un appareil
                  </Link>
                  <Link
                    href="/publication-annonce?type=don&categorie=Électronique"
                    className="btn btn-outline-light btn-sm px-3 py-2 fw-semibold"
                  >
                    <i className="fas fa-gift me-1"></i>
                    Donner du matériel
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
                <i className="fas fa-laptop fa-4x"></i>
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
                      Catégorie : Électronique
                    </h6>
                    <div className="mb-2">
                      <p className="small text-muted mb-1">
                        <i
                          className="fas fa-mobile-alt me-1"
                          style={{ color: colors.oskar.green }}
                        ></i>
                        <strong>Téléphones :</strong> Smartphones, tablettes
                      </p>
                    </div>
                    <div className="mb-2">
                      <p className="small text-muted mb-1">
                        <i
                          className="fas fa-laptop me-1"
                          style={{ color: "#2196F3" }}
                        ></i>
                        <strong>Ordinateurs :</strong> PC, portables,
                        accessoires
                      </p>
                    </div>
                    <div>
                      <p className="small text-muted mb-0">
                        <i
                          className="fas fa-tv me-1"
                          style={{ color: "#9C27B0" }}
                        ></i>
                        <strong>Électroménager :</strong> TV, consoles, audio
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenu principal */}
            <div className="col-xl-9 col-lg-8">
              {/* Barre de filtres et options */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <h2 className="h5 fw-bold mb-0">Annonces électroniques</h2>
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

                {/* FilterStatsBar */}
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

              {/* Message si pas d'annonces */}
              {stats.totalItems === 0 ? (
                <div className="text-center py-5">
                  <div className="mb-4">
                    <i className="fas fa-laptop fa-4x text-muted mb-3"></i>
                    <h3 className="h4 fw-bold text-muted mb-2">
                      Aucune annonce disponible
                    </h3>
                    <p className="text-muted mb-4">
                      Soyez le premier à publier une annonce dans cette
                      catégorie !
                    </p>
                  </div>
                  <div className="d-flex flex-wrap gap-2 justify-content-center">
                    <Link
                      href="/publication-annonce?categorie=Électronique"
                      className="btn btn-success px-4"
                    >
                      <i className="fas fa-plus me-2"></i>
                      Publier une annonce
                    </Link>
                    <Link
                      href="/publication-annonce?type=don&categorie=Électronique"
                      className="btn btn-outline-success px-4"
                    >
                      <i className="fas fa-gift me-2"></i>
                      Faire un don
                    </Link>
                  </div>
                </div>
              ) : (
                <>
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
                                style={{
                                  backgroundColor: colors.oskar.lightGreen,
                                }}
                              >
                                <i
                                  className="fas fa-recycle"
                                  style={{ color: colors.oskar.green }}
                                ></i>
                              </div>
                              <div>
                                <h6 className="fw-bold mb-1">
                                  Électronique responsable
                                </h6>
                                <p className="small text-muted mb-2">
                                  Réduisez les déchets électroniques en achetant
                                  d'occasion.
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
                                    Réduction des D3E
                                  </li>
                                  <li className="mb-1">
                                    <i
                                      className="fas fa-check-circle me-1"
                                      style={{
                                        color: colors.oskar.green,
                                        fontSize: "0.7rem",
                                      }}
                                    ></i>
                                    Économies importantes
                                  </li>
                                  <li>
                                    <i
                                      className="fas fa-check-circle me-1"
                                      style={{
                                        color: colors.oskar.green,
                                        fontSize: "0.7rem",
                                      }}
                                    ></i>
                                    Garanties vérifiées
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
                                  className="fas fa-shield-alt"
                                  style={{ color: "#2196F3" }}
                                ></i>
                              </div>
                              <div>
                                <h6 className="fw-bold mb-1">
                                  Conseils d'achat
                                </h6>
                                <p className="small text-muted mb-2">
                                  Quelques recommandations pour vos achats.
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
                                    Vérifiez l'état général
                                  </li>
                                  <li className="mb-1">
                                    <i
                                      className="fas fa-check-circle me-1"
                                      style={{
                                        color: "#2196F3",
                                        fontSize: "0.7rem",
                                      }}
                                    ></i>
                                    Testez les fonctionnalités
                                  </li>
                                  <li>
                                    <i
                                      className="fas fa-check-circle me-1"
                                      style={{
                                        color: "#2196F3",
                                        fontSize: "0.7rem",
                                      }}
                                    ></i>
                                    Demandez la facture
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
                      Appareils électroniques à vendre ?
                    </h6>
                    <p className="small text-muted mb-3">
                      Donnez une seconde vie à votre matériel
                    </p>
                    <div className="d-flex flex-wrap gap-2 justify-content-center">
                      <Link
                        href="/publication-annonce?categorie=Électronique"
                        className="btn btn-success btn-sm px-3"
                      >
                        <i className="fas fa-mobile-alt me-1"></i>
                        Publier une annonce
                      </Link>
                      <Link
                        href="/publication-annonce?type=don&categorie=Électronique"
                        className="btn btn-outline-success btn-sm px-3"
                      >
                        <i className="fas fa-gift me-1"></i>
                        Faire un don
                      </Link>
                    </div>
                  </div>
                </>
              )}
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
              Tout sur l'électronique d'occasion
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
                    Les appareils sont-ils testés ?
                  </h6>
                  <p className="small text-muted mb-0">
                    Les vendeurs doivent préciser l'état de l'appareil. Nous
                    recommandons de tester avant achat.
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
                    Y a-t-il une garantie ?
                  </h6>
                  <p className="small text-muted mb-0">
                    Certains vendeurs proposent des garanties. À discuter avec
                    le vendeur avant l'achat.
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
                    Puis-je vendre un appareil en panne ?
                  </h6>
                  <p className="small text-muted mb-0">
                    Oui, à condition de bien préciser la panne dans la
                    description.
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
                    Comment sécuriser la transaction ?
                  </h6>
                  <p className="small text-muted mb-0">
                    Privilégiez les rencontres en lieu public et testez
                    l'appareil avant paiement.
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
