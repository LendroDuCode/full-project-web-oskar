"use client";

import colors from "@/app/shared/constants/colors";
import { useState, useEffect } from "react";

interface FilterType {
  id: string;
  label: string;
  icon: string;
  iconColor?: string;
  borderColor?: string;
}

interface FilterStatsBarProps {
  totalItems: number;
  activeFilter: string;
  onFilterChange: (filterId: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  sortOption: string;
  onSortChange: (sort: string) => void;
}

const FilterStatsBar: React.FC<FilterStatsBarProps> = ({
  totalItems,
  activeFilter,
  onFilterChange,
  viewMode,
  onViewModeChange,
  sortOption,
  onSortChange,
}) => {
  const filterTypes: FilterType[] = [
    {
      id: "all",
      label: "Tous types",
      icon: "fa-tag",
      iconColor: "white",
    },
    {
      id: "donation",
      label: "Dons",
      icon: "fa-gift",
      iconColor: "#9C27B0",
      borderColor: "#9C27B0",
    },
    {
      id: "exchange",
      label: "Échanges",
      icon: "fa-arrows-rotate",
      iconColor: "#2196F3",
      borderColor: "#2196F3",
    },
    {
      id: "sale",
      label: "Ventes",
      icon: "fa-dollar-sign",
      iconColor: colors.oskar.green,
      borderColor: colors.oskar.green,
    },
  ];

  const sortOptions = [
    { value: "recent", label: "Trier : Plus récent" },
    { value: "price-asc", label: "Prix : Croissant" },
    { value: "price-desc", label: "Prix : Décroissant" },
    { value: "popular", label: "Plus populaire" },
  ];

  const handleFilterClick = (filterId: string) => {
    onFilterChange(filterId);
    // Émettre un événement pour que ListingsGrid se mette à jour
    if (typeof window !== "undefined") {
      const event = new CustomEvent("filter-type-changed", {
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
    // Émettre un événement pour que ListingsGrid se mette à jour
    if (typeof window !== "undefined") {
      const event = new CustomEvent("sort-option-changed", {
        detail: { sortOption: value },
      });
      window.dispatchEvent(event);
    }
  };

  return (
    <section
      id="filter-stats-bar"
      className="bg-white border-bottom py-2"
      style={{ borderColor: colors.oskar.lightGrey }}
    >
      <div className="container">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
          {/* Partie gauche : Compteur et filtres */}
          <div className="d-flex flex-wrap align-items-center gap-3">
            {/* Compteur d'annonces */}
            <span
              className="fw-semibold"
              style={{ color: colors.oskar.black, fontSize: "0.95rem" }}
            >
              {totalItems.toLocaleString("fr-FR")} annonces
            </span>

            {/* Boutons de filtre */}
            <div className="d-flex flex-wrap align-items-center gap-2">
              {filterTypes.map((filter) => {
                const isActive = activeFilter === filter.id;

                return (
                  <button
                    key={filter.id}
                    onClick={() => handleFilterClick(filter.id)}
                    className="btn d-flex align-items-center gap-2 flex-shrink-0"
                    style={{
                      backgroundColor: isActive ? colors.oskar.green : "white",
                      color: isActive ? "white" : colors.oskar.grey,
                      border: `2px solid ${isActive ? colors.oskar.green : colors.oskar.lightGrey}`,
                      borderRadius: "8px",
                      padding: "4px 10px",
                      fontSize: "0.85rem",
                      fontWeight: 500,
                      transition: "all 0.2s",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor =
                          filter.borderColor || colors.oskar.green;
                        e.currentTarget.style.backgroundColor =
                          colors.oskar.lightGrey + "50";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor =
                          colors.oskar.lightGrey;
                        e.currentTarget.style.backgroundColor = "white";
                      }
                    }}
                  >
                    <i
                      className={`fa-solid ${filter.icon}`}
                      style={{
                        color: isActive
                          ? "white"
                          : filter.iconColor || colors.oskar.grey,
                        fontSize: "0.85rem",
                      }}
                    />
                    <span>{filter.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Partie droite : Vue et tri */}
          <div className="d-flex flex-wrap align-items-center gap-2">
            {/* Boutons de vue */}
            <div className="d-flex gap-1">
              <button
                onClick={() => handleViewModeClick("grid")}
                className="btn p-1 d-flex align-items-center justify-content-center"
                style={{
                  backgroundColor:
                    viewMode === "grid" ? colors.oskar.green : "white",
                  color: viewMode === "grid" ? "white" : colors.oskar.grey,
                  border: `2px solid ${viewMode === "grid" ? colors.oskar.green : colors.oskar.lightGrey}`,
                  borderRadius: "8px",
                  width: "32px",
                  height: "32px",
                  transition: "all 0.2s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  if (viewMode !== "grid") {
                    e.currentTarget.style.backgroundColor =
                      colors.oskar.lightGrey + "50";
                  }
                }}
                onMouseLeave={(e) => {
                  if (viewMode !== "grid") {
                    e.currentTarget.style.backgroundColor = "white";
                  }
                }}
              >
                <i
                  className="fa-solid fa-grip"
                  style={{ fontSize: "0.9rem" }}
                />
              </button>

              <button
                onClick={() => handleViewModeClick("list")}
                className="btn p-1 d-flex align-items-center justify-content-center"
                style={{
                  backgroundColor:
                    viewMode === "list" ? colors.oskar.green : "white",
                  color: viewMode === "list" ? "white" : colors.oskar.grey,
                  border: `2px solid ${viewMode === "list" ? colors.oskar.green : colors.oskar.lightGrey}`,
                  borderRadius: "8px",
                  width: "32px",
                  height: "32px",
                  transition: "all 0.2s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  if (viewMode !== "list") {
                    e.currentTarget.style.backgroundColor =
                      colors.oskar.lightGrey + "50";
                  }
                }}
                onMouseLeave={(e) => {
                  if (viewMode !== "list") {
                    e.currentTarget.style.backgroundColor = "white";
                  }
                }}
              >
                <i
                  className="fa-solid fa-list"
                  style={{ fontSize: "0.9rem" }}
                />
              </button>
            </div>

            {/* Sélecteur de tri */}
            <div className="position-relative" style={{ minWidth: "160px" }}>
              <select
                value={sortOption}
                onChange={handleSortChange}
                className="form-select"
                style={{
                  border: `2px solid ${colors.oskar.lightGrey}`,
                  borderRadius: "8px",
                  color: colors.oskar.black,
                  fontSize: "0.85rem",
                  padding: "4px 30px 4px 8px",
                  appearance: "none",
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                  backgroundColor: "white",
                  height: "32px",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = colors.oskar.green)
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = colors.oskar.lightGrey)
                }
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <i
                className="fa-solid fa-chevron-down position-absolute top-50 end-0 translate-middle-y me-2"
                style={{
                  color: colors.oskar.grey,
                  fontSize: "0.7rem",
                  pointerEvents: "none",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FilterStatsBar;
