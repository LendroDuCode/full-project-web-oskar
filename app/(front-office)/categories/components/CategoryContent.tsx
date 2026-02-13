// app/(front-office)/categories/components/CategoryContent.tsx
"use client";

import { useState } from "react";
import colors from "@/app/shared/constants/colors";
import FiltersSidebar from "../../home/components/FiltersSidebar";
import FilterStatsBar from "../../home/components/FilterStatsBar";
import ListingsGrid from "../../home/components/ListingsGrid";
import Pagination from "../../home/components/Pagination";
import Link from "next/link";
import { SearchProvider } from "../../home/contexts/SearchContext"; // AJOUT

interface CategoryContentProps {
  category: {
    uuid: string;
    libelle: string;
    slug: string;
    description?: string;
    image?: string;
  };
  stats: {
    totalDons: number;
    totalEchanges: number;
    totalProduits: number;
    totalItems: number;
  };
  subCategories?: any[];
}

function CategoryContentInner({
  category,
  stats,
  subCategories = [],
}: CategoryContentProps) {
  // Tout le contenu existant...
  const [filters, setFilters] = useState({});
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOption, setSortOption] = useState<string>("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState<number>(stats.totalItems || 0);

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
    setCurrentPage(1);
  };

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
  };

  const handleSortChange = (sort: string) => {
    setSortOption(sort);
  };

  const handleDataLoaded = (itemsCount: number) => {
    setTotalItems(itemsCount);
  };

  const getCategoryConfig = () => {
    const configs: Record<string, { color: string; icon: string }> = {
      Électronique: { color: "#4CAF50", icon: "fa-laptop" },
      "Vêtements & Chaussures": { color: "#FF9800", icon: "fa-tshirt" },
      "Don & Échange": { color: "#9C27B0", icon: "fa-exchange-alt" },
      "Éducation & Culture": { color: "#2196F3", icon: "fa-graduation-cap" },
      "Services de proximité": { color: "#795548", icon: "fa-broom" },
      Autres: { color: "#607D8B", icon: "fa-tag" },
    };
    return (
      configs[category.libelle] || { color: colors.oskar.green, icon: "fa-tag" }
    );
  };

  const config = getCategoryConfig();

  return (
    <>
      {/* Hero Section */}
      <section
        className="py-4 py-md-5"
        style={{
          background: `linear-gradient(135deg, ${config.color} 0%, ${config.color}dd 100%)`,
          color: "white",
        }}
      >
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-2">
                  <li className="breadcrumb-item">
                    <Link
                      href="/"
                      className="text-white text-decoration-none opacity-75"
                    >
                      Accueil
                    </Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link
                      href="/categories"
                      className="text-white text-decoration-none opacity-75"
                    >
                      Catégories
                    </Link>
                  </li>
                  <li
                    className="breadcrumb-item active text-white"
                    aria-current="page"
                  >
                    {category.libelle}
                  </li>
                </ol>
              </nav>

              <div className="mb-3">
                <h1 className="display-5 fw-bold mb-2">{category.libelle}</h1>
                <p className="lead mb-3 opacity-90">
                  {category.description ||
                    `Découvrez tous les articles de la catégorie ${category.libelle}`}
                </p>
                <div className="d-flex flex-wrap gap-2">
                  <Link
                    href={`/publication-annonce?categorie=${encodeURIComponent(category.libelle)}`}
                    className="btn btn-light btn-sm px-3 py-2 fw-semibold"
                    style={{ color: config.color }}
                  >
                    <i className={`fas ${config.icon} me-2`}></i>
                    Publier une annonce
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
                <i className={`fas ${config.icon} fa-4x`}></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistiques */}
      <section className="py-3 border-bottom">
        <div className="container">
          <div className="row g-3">
            <div className="col-6 col-md-3">
              <div className="text-center p-2">
                <div
                  className="fs-4 fw-bold"
                  style={{ color: colors.oskar.green }}
                >
                  {stats.totalItems || 0}
                </div>
                <div className="text-muted small">Total annonces</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="text-center p-2">
                <div className="fs-4 fw-bold" style={{ color: "#2196F3" }}>
                  {stats.totalProduits || 0}
                </div>
                <div className="text-muted small">Ventes</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="text-center p-2">
                <div className="fs-4 fw-bold" style={{ color: "#FF9800" }}>
                  {stats.totalDons || 0}
                </div>
                <div className="text-muted small">Dons</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="text-center p-2">
                <div className="fs-4 fw-bold" style={{ color: "#9C27B0" }}>
                  {stats.totalEchanges || 0}
                </div>
                <div className="text-muted small">Échanges</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sous-catégories */}
      {subCategories && subCategories.length > 0 && (
        <section className="py-3 bg-light">
          <div className="container">
            <h6 className="fw-semibold mb-3">Sous-catégories populaires</h6>
            <div className="d-flex flex-wrap gap-2">
              {subCategories.map((subCat) => (
                <Link
                  key={subCat.uuid}
                  href={`/categories/${category.slug}/${subCat.slug}`}
                  className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                >
                  <i className="fas fa-tag" style={{ color: config.color }}></i>
                  <span>{subCat.libelle}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contenu principal */}
      <section className="py-4">
        <div className="container">
          <div className="row g-4">
            {/* Sidebar des filtres */}
            <div className="col-lg-3 col-xxl-2 d-none d-lg-block">
              <div className="sticky-top" style={{ top: "90px" }}>
                <FiltersSidebar
                  filters={filters}
                  onFiltersChange={setFilters}
                />
              </div>
            </div>

            {/* Contenu principal avec grille d'annonces */}
            <div className="col-lg-9 col-xxl-10">
              <div className="listings-container">
                <FilterStatsBar
                  totalItems={totalItems}
                  activeFilter={activeFilter}
                  onFilterChange={handleFilterChange}
                  viewMode={viewMode}
                  onViewModeChange={handleViewModeChange}
                  sortOption={sortOption}
                  onSortChange={handleSortChange}
                />

                <ListingsGrid
                  key={`${category.uuid}-${activeFilter}-${sortOption}`}
                  categoryUuid={category.uuid}
                  filterType={activeFilter}
                  viewMode={viewMode}
                  sortOption={sortOption}
                  onDataLoaded={handleDataLoaded}
                />

                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(totalItems / 12)}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bouton de filtres mobile */}
      <div className="d-lg-none fixed-bottom p-3">
        <button
          className="btn btn-success w-100 d-flex align-items-center justify-content-center gap-2"
          style={{
            borderRadius: "50px",
            padding: "12px 24px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
          onClick={() => alert("Ouvrir les filtres mobile")}
        >
          <i className="fa-solid fa-sliders"></i>
          Filtres & Tri
        </button>
      </div>

      <style jsx>{`
        .listings-container {
          padding-left: 1rem;
        }
        .sticky-top {
          position: sticky;
          top: 90px;
        }
        @media (max-width: 991.98px) {
          .listings-container {
            padding-left: 0;
            padding-bottom: 80px;
          }
        }
      `}</style>
    </>
  );
}

// ✅ WRAPPER avec SearchProvider
export default function CategoryContent(props: CategoryContentProps) {
  return (
    <SearchProvider>
      <CategoryContentInner {...props} />
    </SearchProvider>
  );
}
