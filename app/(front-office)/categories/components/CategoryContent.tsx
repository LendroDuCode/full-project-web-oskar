// app/(front-office)/categories/components/CategoryContent.tsx
"use client";

import { useState, useEffect } from "react";
import colors from "@/app/shared/constants/colors";
import Link from "next/link";
import { SearchProvider } from "../../home/contexts/SearchContext";
import CategoryListGrid from "./CategoryListGrid";
import CategoryFilterStatsBar from "./CategoryFilterStatsBar";
import CategoryFiltersSidebar from "./CategoryFiltersSidebar";
import Pagination from "../../home/components/Pagination";

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
  isSubCategory?: boolean;
}

function CategoryContentInner({
  category,
  stats: initialStats,
  subCategories = [],
  isSubCategory = false,
}: CategoryContentProps) {
  const [filters, setFilters] = useState({});
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOption, setSortOption] = useState<string>("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState<number>(initialStats.totalItems || 0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Stats mises à jour par la grille
  const [categoryStats, setCategoryStats] = useState({
    dons: initialStats.totalDons,
    echanges: initialStats.totalEchanges,
    produits: initialStats.totalProduits,
    total: initialStats.totalItems,
  });

  useEffect(() => {
    // Mettre à jour les stats quand les props changent
    setCategoryStats({
      dons: initialStats.totalDons,
      echanges: initialStats.totalEchanges,
      produits: initialStats.totalProduits,
      total: initialStats.totalItems,
    });
  }, [initialStats]);

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

  const handleSidebarFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleDataLoaded = (stats: { total: number; dons: number; echanges: number; produits: number }) => {
    setCategoryStats(stats);
    setTotalItems(stats.total);
  };

  const getCategoryConfig = () => {
    const configs: Record<string, { color: string; icon: string }> = {
      Électronique: { color: "#4CAF50", icon: "fa-laptop" },
      "Vêtements & Chaussures": { color: "#FF9800", icon: "fa-tshirt" },
      "Don & Échange": { color: "#9C27B0", icon: "fa-exchange-alt" },
      "Éducation & Culture": { color: "#2196F3", icon: "fa-graduation-cap" },
      "Services de proximité": { color: "#795548", icon: "fa-broom" },
      "Maison & Jardin": { color: "#8B4513", icon: "fa-home" },
      Véhicules: { color: "#607D8B", icon: "fa-car" },
      "Emploi & Services": { color: "#FF5722", icon: "fa-briefcase" },
      Téléphones: { color: "#4CAF50", icon: "fa-mobile-alt" },
      Autres: { color: colors.oskar.green, icon: "fa-tag" },
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
                    <Link href="/" className="text-white text-decoration-none opacity-75">
                      Accueil
                    </Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link href="/categories" className="text-white text-decoration-none opacity-75">
                      Catégories
                    </Link>
                  </li>
                  <li className="breadcrumb-item active text-white" aria-current="page">
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
                <div className="fs-4 fw-bold" style={{ color: colors.oskar.green }}>
                  {categoryStats.total}
                </div>
                <div className="text-muted small">Total annonces</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="text-center p-2">
                <div className="fs-4 fw-bold" style={{ color: "#2196F3" }}>
                  {categoryStats.produits}
                </div>
                <div className="text-muted small">Ventes</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="text-center p-2">
                <div className="fs-4 fw-bold" style={{ color: "#FF9800" }}>
                  {categoryStats.dons}
                </div>
                <div className="text-muted small">Dons</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="text-center p-2">
                <div className="fs-4 fw-bold" style={{ color: "#9C27B0" }}>
                  {categoryStats.echanges}
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
            {/* Sidebar des filtres - desktop */}
            <div className="col-lg-3 d-none d-lg-block">
              <div className="sticky-top" style={{ top: "90px", maxHeight: "calc(100vh - 120px)" }}>
                <CategoryFiltersSidebar
                  categoryUuid={category.uuid}
                  onFilterChange={handleSidebarFilterChange}
                  stats={{
                    dons: categoryStats.dons,
                    echanges: categoryStats.echanges,
                    produits: categoryStats.produits,
                  }}
                />
              </div>
            </div>

            {/* Contenu principal */}
            <div className="col-lg-9">
              <div className="listings-container shadow-sm bg-white rounded-3 p-3">
                <CategoryFilterStatsBar
                  totalItems={totalItems}
                  activeFilter={activeFilter}
                  onFilterChange={handleFilterChange}
                  viewMode={viewMode}
                  onViewModeChange={handleViewModeChange}
                  sortOption={sortOption}
                  onSortChange={handleSortChange}
                  stats={{
                    dons: categoryStats.dons,
                    echanges: categoryStats.echanges,
                    produits: categoryStats.produits,
                  }}
                />

                <div className="mt-3">
                  <CategoryListGrid
                    key={`${category.uuid}-${activeFilter}-${sortOption}-${JSON.stringify(filters)}`}
                    categoryUuid={category.uuid}
                    isSubCategory={isSubCategory}
                    filterType={activeFilter as any}
                    viewMode={viewMode}
                    sortOption={sortOption}
                    onDataLoaded={handleDataLoaded}
                  />
                </div>

                <div className="mt-3">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(totalItems / 12)}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bouton mobile */}
      <div className="d-lg-none fixed-bottom p-3">
        <button
          className="btn w-100 d-flex align-items-center justify-content-center gap-2"
          style={{
            backgroundColor: colors.oskar.green,
            color: "white",
            borderRadius: "50px",
            padding: "10px 20px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            border: "none",
            fontSize: "0.9rem",
          }}
          onClick={() => setShowMobileFilters(true)}
        >
          <i className="fa-solid fa-sliders"></i>
          Filtres
        </button>
      </div>

      {/* Modal mobile */}
      {showMobileFilters && (
        <div className="d-lg-none">
          <div
            className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
            style={{ zIndex: 1050 }}
            onClick={() => setShowMobileFilters(false)}
          />
          <div
            className="position-fixed bottom-0 start-0 w-100 bg-white"
            style={{
              zIndex: 1051,
              maxHeight: "80vh",
              overflowY: "auto",
              borderTopLeftRadius: "16px",
              borderTopRightRadius: "16px",
            }}
          >
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0">Filtres</h6>
              <button
                className="btn btn-link p-0"
                onClick={() => setShowMobileFilters(false)}
              >
                <i className="fa-solid fa-times" style={{ fontSize: "1.2rem", color: colors.oskar.grey }}></i>
              </button>
            </div>
            <div className="p-3">
              <CategoryFiltersSidebar
                categoryUuid={category.uuid}
                onFilterChange={(newFilters) => {
                  handleSidebarFilterChange(newFilters);
                  setShowMobileFilters(false);
                }}
                stats={{
                  dons: categoryStats.dons,
                  echanges: categoryStats.echanges,
                  produits: categoryStats.produits,
                }}
              />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .listings-container {
          width: 100%;
          box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
        }
        .sticky-top {
          position: sticky;
          top: 90px;
          max-height: calc(100vh - 120px);
          overflow: hidden;
        }
        .sticky-top > * {
          max-height: 100%;
          overflow-y: auto;
        }
        .sticky-top > *::-webkit-scrollbar {
          width: 4px;
        }
        .sticky-top > *::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .sticky-top > *::-webkit-scrollbar-thumb {
          background: ${colors.oskar.orange}80;
          border-radius: 4px;
        }
        .sticky-top > *::-webkit-scrollbar-thumb:hover {
          background: ${colors.oskar.orange};
        }
        @media (max-width: 991.98px) {
          .listings-container {
            padding-bottom: 70px;
          }
        }
      `}</style>
    </>
  );
}

export default function CategoryContent(props: CategoryContentProps) {
  return (
    <SearchProvider>
      <CategoryContentInner {...props} />
    </SearchProvider>
  );
}