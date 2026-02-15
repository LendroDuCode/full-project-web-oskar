"use client";

import { useState, useEffect } from "react";
import colors from "../../../shared/constants/colors";
import FiltersSidebar from "./FiltersSidebar";
import FilterStatsBar from "./FilterStatsBar";
import ListingsGrid from "./ListingsGrid";
import Pagination from "./Pagination";

const MainContent = () => {
  // États pour les filtres principaux
  const [filters, setFilters] = useState({});

  // États pour les filtres rapides (type d'annonce)
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOption, setSortOption] = useState<string>("recent");
  const [currentPage, setCurrentPage] = useState(1);

  // État pour le nombre total d'annonces
  const [totalItems, setTotalItems] = useState<number>(2847);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Fonction pour gérer le changement de filtre type
  const handleFilterChange = (filterId: string) => {
    console.log("Filtre type changé:", filterId);
    setActiveFilter(filterId);
    setCurrentPage(1);
  };

  // Fonction pour gérer le changement de mode d'affichage
  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
  };

  // Fonction pour gérer le changement de tri
  const handleSortChange = (sort: string) => {
    setSortOption(sort);
  };

  // Fonction pour mettre à jour le nombre total d'annonces
  const handleDataLoaded = (itemsCount: number) => {
    setTotalItems(itemsCount);
  };

  return (
    <main id="main-content" className="container-fluid py-5">
      <div className="row g-4">
        {/* Sidebar des filtres avancés - visible sur desktop */}
        <div className="col-auto d-none d-lg-block">
          <FiltersSidebar filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Contenu principal */}
        <div className="col">
          {/* Barre de filtres rapides et statistiques */}
          <FilterStatsBar
            totalItems={totalItems}
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            sortOption={sortOption}
            onSortChange={handleSortChange}
          />

          {/* Grid des annonces avec filtres */}
          <div className="mt-4">
            <ListingsGrid
              key={`${activeFilter}-${sortOption}`}
              filterType={activeFilter}
              viewMode={viewMode}
              sortOption={sortOption}
              onDataLoaded={handleDataLoaded}
              showFeatured={true}
            />
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalItems / 12)}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Bouton de filtres mobile */}
      <div className="d-lg-none fixed-bottom p-3">
        <button
          className="btn w-100 py-3 fw-semibold text-white border-0 rounded-4 shadow-lg d-flex align-items-center justify-content-center gap-2"
          style={{ backgroundColor: colors.oskar.orange }}
          onClick={() => setMobileSidebarOpen(true)}
        >
          <i className="fa-solid fa-sliders"></i>
          Filtres & Tri
        </button>
      </div>

      {/* Sidebar mobile */}
      {mobileSidebarOpen && (
        <div className="d-lg-none">
          <div
            className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
            style={{ zIndex: 1040 }}
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div
            className="position-fixed top-0 start-0 h-100 bg-white shadow-lg"
            style={{
              width: "85%",
              maxWidth: "320px",
              zIndex: 1045,
              overflowY: "auto",
              transform: mobileSidebarOpen
                ? "translateX(0)"
                : "translateX(-100%)",
              transition: "transform 0.3s ease",
            }}
          >
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="fw-bold text-dark mb-0">
                <i
                  className="fa-solid fa-sliders me-2"
                  style={{ color: colors.oskar.orange }}
                ></i>
                Filtres
              </h5>
              <button
                className="btn btn-link p-0 text-muted"
                onClick={() => setMobileSidebarOpen(false)}
                style={{ fontSize: "1.5rem" }}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="p-3">
              <FiltersSidebar filters={filters} onFiltersChange={setFilters} />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        #main-content {
          min-height: 100vh;
          background-color: ${colors.oskar.lightGrey}20;
          padding-left: 2rem;
          padding-right: 2rem;
        }

        @media (max-width: 991.98px) {
          #main-content {
            padding-left: 1rem;
            padding-right: 1rem;
            padding-bottom: 80px;
          }
        }

        @media (min-width: 1400px) {
          #main-content {
            max-width: 1400px;
          }
        }
      `}</style>
    </main>
  );
};

export default MainContent;
