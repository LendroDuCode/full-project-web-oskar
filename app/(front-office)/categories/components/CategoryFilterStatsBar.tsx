"use client";

import colors from "@/app/shared/constants/colors";
import { useState, useEffect } from "react";

interface FilterType {
  id: string;
  label: string;
  icon: string;
  iconColor?: string;
  borderColor?: string;
  count?: number;
}

interface CategoryFilterStatsBarProps {
  totalItems: number;
  activeFilter: string;
  onFilterChange: (filterId: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  sortOption: string;
  onSortChange: (sort: string) => void;
  stats?: {
    dons: number;
    echanges: number;
    produits: number;
  };
}

const CategoryFilterStatsBar: React.FC<CategoryFilterStatsBarProps> = ({
  totalItems,
  activeFilter,
  onFilterChange,
  viewMode,
  onViewModeChange,
  sortOption,
  onSortChange,
  stats = { dons: 0, echanges: 0, produits: 0 },
}) => {
  const filterTypes: FilterType[] = [
    {
      id: "all",
      label: `Tous`,
      icon: "fa-layer-group",
      iconColor: colors.oskar.green,
      count: totalItems,
    },
    {
      id: "don",
      label: `Dons`,
      icon: "fa-gift",
      iconColor: "#8b5cf6",
      count: stats.dons,
    },
    {
      id: "echange",
      label: `Échanges`,
      icon: "fa-arrows-rotate",
      iconColor: "#3b82f6",
      count: stats.echanges,
    },
    {
      id: "produit",
      label: `Ventes`,
      icon: "fa-basket-shopping", // Changé de fa-dollar-sign à fa-basket-shopping
      iconColor: colors.oskar.green, // Changé de #f59e0b à colors.oskar.green
      count: stats.produits,
    },
  ];

  const sortOptions = [
    { value: "recent", label: "Plus récents", icon: "fa-clock" },
    { value: "price-asc", label: "Prix croissant", icon: "fa-arrow-up-wide-short" },
    { value: "price-desc", label: "Prix décroissant", icon: "fa-arrow-down-wide-short" },
  ];

  const handleFilterClick = (filterId: string) => {
    onFilterChange(filterId);
    if (typeof window !== "undefined") {
      const event = new CustomEvent("category-filter-changed", {
        detail: { filterType: filterId },
      });
      window.dispatchEvent(event);
    }
  };

  const handleViewModeClick = (mode: "grid" | "list") => {
    onViewModeChange(mode);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onSortChange(value);
    if (typeof window !== "undefined") {
      const event = new CustomEvent("category-sort-changed", {
        detail: { sortOption: value },
      });
      window.dispatchEvent(event);
    }
  };

  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
      {/* Partie gauche : Filtres */}
      <div className="d-flex flex-wrap align-items-center gap-2">
        {filterTypes.map((filter) => {
          const isActive = activeFilter === filter.id;
          const isDisabled = filter.id !== "all" && filter.count === 0;

          return (
            <button
              key={filter.id}
              onClick={() => !isDisabled && handleFilterClick(filter.id)}
              disabled={isDisabled}
              className="btn d-flex align-items-center gap-2 px-3 py-2 rounded-3"
              style={{
                backgroundColor: isActive ? filter.iconColor : "white",
                color: isActive ? "white" : (isDisabled ? "#ccc" : colors.oskar.grey),
                border: `2px solid ${isActive ? filter.iconColor : "#e5e7eb"}`,
                fontSize: "0.9rem",
                fontWeight: 500,
                transition: "all 0.2s",
                cursor: isDisabled ? "not-allowed" : "pointer",
                opacity: isDisabled ? 0.6 : 1,
              }}
            >
              <i className={`fas ${filter.icon}`} style={{ fontSize: "0.9rem" }} />
              <span>{filter.label}</span>
              {filter.count !== undefined && filter.count > 0 && (
                <span 
                  className="badge rounded-pill ms-1"
                  style={{
                    backgroundColor: isActive ? "rgba(255,255,255,0.2)" : filter.iconColor + "20",
                    color: isActive ? "white" : filter.iconColor,
                    padding: "4px 8px",
                  }}
                >
                  {filter.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Partie droite : Vue et tri */}
      <div className="d-flex flex-wrap align-items-center gap-2">
        {/* Boutons de vue */}
        <div className="d-flex gap-1 bg-light p-1 rounded-3">
          <button
            onClick={() => handleViewModeClick("grid")}
            className="btn p-2 d-flex align-items-center justify-content-center rounded-2"
            style={{
              backgroundColor: viewMode === "grid" ? "white" : "transparent",
              color: viewMode === "grid" ? colors.oskar.green : colors.oskar.grey,
              border: "none",
              width: "36px",
              height: "36px",
              boxShadow: viewMode === "grid" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
              transition: "all 0.2s",
            }}
          >
            <i className="fa-solid fa-grip" style={{ fontSize: "1rem" }} />
          </button>

          <button
            onClick={() => handleViewModeClick("list")}
            className="btn p-2 d-flex align-items-center justify-content-center rounded-2"
            style={{
              backgroundColor: viewMode === "list" ? "white" : "transparent",
              color: viewMode === "list" ? colors.oskar.green : colors.oskar.grey,
              border: "none",
              width: "36px",
              height: "36px",
              boxShadow: viewMode === "list" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
              transition: "all 0.2s",
            }}
          >
            <i className="fa-solid fa-list" style={{ fontSize: "1rem" }} />
          </button>
        </div>

        {/* Sélecteur de tri - CORRIGÉ pour enlever le double icône */}
        <div className="position-relative">
          <select
            value={sortOption}
            onChange={handleSortChange}
            className="form-select ps-4 pe-5 py-2 rounded-3 border-0 bg-light"
            style={{
              fontSize: "0.9rem",
              minWidth: "180px",
              cursor: "pointer",
              appearance: "none",
              WebkitAppearance: "none",
              MozAppearance: "none",
              backgroundImage: "none", // Supprime l'icône par défaut du navigateur
            }}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          {/* Un seul icône personnalisé */}
          <div className="position-absolute top-50 end-0 translate-middle-y pe-3 pointer-events-none">
            <i className="fas fa-chevron-down" style={{ color: colors.oskar.grey, fontSize: "0.8rem" }} />
          </div>
        </div>
      </div>

      <style jsx>{`
        .btn:focus {
          box-shadow: none;
        }
        
        .pointer-events-none {
          pointer-events: none;
        }
        
        .form-select:focus {
          box-shadow: 0 0 0 0.2rem rgba(16, 185, 129, 0.25);
          border-color: ${colors.oskar.green};
        }
        
        /* Supprime complètement l'icône par défaut du select */
        .form-select {
          background-image: none !important;
        }
        
        @media (max-width: 768px) {
          .btn {
            padding: 6px 12px;
            font-size: 0.8rem;
          }
          
          .form-select {
            min-width: 150px;
          }
        }
      `}</style>
    </div>
  );
};

export default CategoryFilterStatsBar;