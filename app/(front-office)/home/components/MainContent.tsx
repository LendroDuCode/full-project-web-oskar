// MainContent.tsx
"use client";

import { useState } from "react";
import colors from "../../../shared/constants/colors";
import FiltersSidebar from "./FiltersSidebar";
import ListingsGrid from "./ListingsGrid";
import Pagination from "./Pagination";

const MainContent = () => {
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <main id="main-content">
      <div className="container">
        <div className="row g-4">
          {/* Sidebar des filtres */}
          <div className="col-lg-3 col-xxl-2 d-none d-lg-block">
            <FiltersSidebar filters={filters} onFiltersChange={setFilters} />
          </div>

          {/* Contenu principal */}
          <div className="col-lg-9 col-xxl-10">
            <div className="listings-container">
              <ListingsGrid />
              <Pagination
                currentPage={currentPage}
                totalPages={119}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </div>
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
          }
        }
      `}</style>
    </main>
  );
};

export default MainContent;
