// app/(front-office)/dons-echanges/page.tsx - Version sans compteur dans le titre
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import colors from "@/app/shared/constants/colors";
import FiltersSidebar from "../home/components/FiltersSidebar";
import FilterStatsBar from "../home/components/FilterStatsBar";
import ListingsGrid from "../home/components/ListingsGrid";

export default function DonEchangePage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOption, setSortOption] = useState("recent");
  const [activeFilter, setActiveFilter] = useState("all");
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  const stats = {
    totalDons: 156,
    totalEchanges: 89,
    donsThisMonth: 24,
    echangesThisMonth: 18,
  };

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
                <h1 className="display-5 fw-bold mb-2">Dons & Échanges</h1>
                <p className="lead mb-3 opacity-90">
                  Donnez une seconde vie à vos objets et échangez avec la
                  communauté OSKAR.
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
                <i className="fas fa-hands-helping fa-4x"></i>
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
            <div className="col-3">
              <div className="text-center">
                <div
                  className="fs-4 fw-bold"
                  style={{ color: colors.oskar.green }}
                >
                  {stats.donsThisMonth}
                </div>
                <div className="text-muted small">Dons/mois</div>
              </div>
            </div>
            <div className="col-3">
              <div className="text-center">
                <div className="fs-4 fw-bold" style={{ color: "#2196F3" }}>
                  {stats.echangesThisMonth}
                </div>
                <div className="text-muted small">Éch./mois</div>
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
                      Comment ça marche ?
                    </h6>
                    <div className="mb-2">
                      <p className="small text-muted mb-1">
                        <i
                          className="fas fa-gift me-1"
                          style={{ color: colors.oskar.green }}
                        ></i>
                        <strong>Dons :</strong> Gratuits, contactez le donateur
                      </p>
                    </div>
                    <div>
                      <p className="small text-muted mb-0">
                        <i
                          className="fas fa-exchange-alt me-1"
                          style={{ color: "#2196F3" }}
                        ></i>
                        <strong>Échanges :</strong> Négociez directement
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
                      Annonces de dons et échanges
                    </h2>
                    {/* Supprimé : Le texte du nombre d'annonces */}
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
                  totalItems={0} // On peut passer 0 puisque le compteur n'est plus affiché
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
                            style={{ backgroundColor: colors.oskar.greenHover }}
                          >
                            <i
                              className="fas fa-hand-holding-heart"
                              style={{ color: colors.oskar.green }}
                            ></i>
                          </div>
                          <div>
                            <h6 className="fw-bold mb-1">Pourquoi donner ?</h6>
                            <p className="small text-muted mb-2">
                              Donnez une seconde vie à vos objets inutilisés.
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
                                Réduisez vos déchets
                              </li>
                              <li className="mb-1">
                                <i
                                  className="fas fa-check-circle me-1"
                                  style={{
                                    color: colors.oskar.green,
                                    fontSize: "0.7rem",
                                  }}
                                ></i>
                                Aidez des personnes
                              </li>
                              <li>
                                <i
                                  className="fas fa-check-circle me-1"
                                  style={{
                                    color: colors.oskar.green,
                                    fontSize: "0.7rem",
                                  }}
                                ></i>
                                Créez du lien social
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
                              className="fas fa-recycle"
                              style={{ color: "#2196F3" }}
                            ></i>
                          </div>
                          <div>
                            <h6 className="fw-bold mb-1">
                              Avantages de l'échange
                            </h6>
                            <p className="small text-muted mb-2">
                              Obtenez ce dont vous avez besoin sans argent.
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
                                Objets gratuits
                              </li>
                              <li className="mb-1">
                                <i
                                  className="fas fa-check-circle me-1"
                                  style={{
                                    color: "#2196F3",
                                    fontSize: "0.7rem",
                                  }}
                                ></i>
                                Désencombrez
                              </li>
                              <li>
                                <i
                                  className="fas fa-check-circle me-1"
                                  style={{
                                    color: "#2196F3",
                                    fontSize: "0.7rem",
                                  }}
                                ></i>
                                Rencontrez
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
                  background: `linear-gradient(135deg, ${colors.oskar.green} 0%, ${colors.oskar.greenHover}20 100%)`,
                  border: `1px solid ${colors.oskar.green}20`,
                }}
              >
                <h6 className="fw-bold mb-2">Objets à donner ou échanger ?</h6>
                <p className="small text-muted mb-3">
                  Rejoignez notre communauté solidaire
                </p>
                <div className="d-flex flex-wrap gap-2 justify-content-center">
                  <Link
                    href="/publication-annonce?type=don"
                    className="btn btn-success btn-sm px-3"
                  >
                    <i className="fas fa-gift me-1"></i>
                    Publier un don
                  </Link>
                  <Link
                    href="/publication-annonce?type=echange"
                    className="btn btn-outline-success btn-sm px-3"
                  >
                    <i className="fas fa-exchange-alt me-1"></i>
                    Publier un échange
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
            <p className="text-muted small">Tout sur les dons et échanges</p>
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
                    Comment fonctionnent les dons ?
                  </h6>
                  <p className="small text-muted mb-0">
                    Les dons sont entièrement gratuits. Une fois publié, les
                    intéressés vous contactent.
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
                    Comment se passe un échange ?
                  </h6>
                  <p className="small text-muted mb-0">
                    Vous publiez l'objet à échanger avec ce que vous cherchez en
                    retour.
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
                    Les dons sont-ils gratuits ?
                  </h6>
                  <p className="small text-muted mb-0">
                    Oui, totalement gratuits sur OSKAR pour favoriser
                    l'entraide.
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
                    Puis-je annuler ?
                  </h6>
                  <p className="small text-muted mb-0">
                    Oui, vous pouvez retirer votre annonce à tout moment.
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
