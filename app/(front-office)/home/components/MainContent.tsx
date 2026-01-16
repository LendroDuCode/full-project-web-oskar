// MainContent.tsx - VERSION COMPLÈTE AVEC FILTRES
"use client";

import { useState, useEffect } from "react";
import colors from "../../../shared/constants/colors";
import FiltersSidebar from "./FiltersSidebar";
import FilterStatsBar from "./FilterStatsBar"; // Importez FilterStatsBar
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

  // État pour le nombre total d'annonces (vous devrez le calculer)
  const [totalItems, setTotalItems] = useState<number>(0);

  // Fonction pour gérer le changement de filtre type
  const handleFilterChange = (filterId: string) => {
    console.log("Filtre type changé:", filterId);
    setActiveFilter(filterId);
    setCurrentPage(1); // Réinitialise à la première page quand le filtre change
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
  // (À appeler quand ListingsGrid a fini de charger les données)
  const handleDataLoaded = (itemsCount: number) => {
    setTotalItems(itemsCount);
  };

  // Simulation de chargement du nombre total
  useEffect(() => {
    // Ici, vous devriez faire un appel API pour obtenir le nombre total
    // Pour l'instant, on simule
    setTimeout(() => {
      // Valeur simulée - à remplacer par votre logique réelle
      const simulatedTotal =
        activeFilter === "all"
          ? 150
          : activeFilter === "donation"
            ? 45
            : activeFilter === "exchange"
              ? 60
              : activeFilter === "sale"
                ? 45
                : 0;
      setTotalItems(simulatedTotal);
    }, 500);
  }, [activeFilter]);

  return (
    <main id="main-content">
      <div className="container">
        <div className="row g-4">
          {/* Sidebar des filtres avancés */}
          <div className="col-lg-3 col-xxl-2 d-none d-lg-block">
            <FiltersSidebar filters={filters} onFiltersChange={setFilters} />
          </div>

          {/* Contenu principal */}
          <div className="col-lg-9 col-xxl-10">
            <div className="listings-container">
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
              <ListingsGrid
                key={`${activeFilter}-${sortOption}`} // Force le re-render quand les filtres changent
                filterType={activeFilter}
                viewMode={viewMode}
                sortOption={sortOption}
                // Vous pouvez ajouter un callback si besoin
                // onDataLoaded={handleDataLoaded}
              />

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(totalItems / 12)} // Supposons 12 items par page
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Optionnel: Bouton de filtres mobile */}
      <div className="d-lg-none fixed-bottom p-3">
        <button
          className="btn btn-success w-100 d-flex align-items-center justify-content-center gap-2"
          style={{
            borderRadius: "50px",
            padding: "12px 24px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
          onClick={() => {
            // À implémenter: ouvrir un modal ou drawer avec les filtres
            alert("Ouvrir les filtres mobile");
          }}
        >
          <i className="fa-solid fa-sliders"></i>
          Filtres & Tri
        </button>
      </div>

      <style jsx>{`
        #main-content {
          padding: 2rem 0;
          min-height: 100vh;
        }

        .listings-container {
          padding-left: 1rem;
        }

        @media (max-width: 991.98px) {
          .listings-container {
            padding-left: 0;
            padding-bottom: 80px; /* Pour éviter que le bouton mobile ne cache le contenu */
          }
        }
      `}</style>
    </main>
  );
};

export default MainContent;
