// components/FavoritesControls.tsx
"use client";

import { useState } from "react";
import colors from "../../../shared/constants/colors";

interface CategoryFilter {
  id: string;
  label: string;
  count: number;
}

interface FavoritesControlsProps {
  onSearch?: (query: string) => void;
  onViewChange?: (view: "grid" | "list") => void;
  onCategoryFilter?: (category: string) => void;
  onSortChange?: (sort: string) => void;
}

const FavoritesControls: React.FC<FavoritesControlsProps> = ({
  onSearch,
  onViewChange,
  onCategoryFilter,
  onSortChange,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSort, setSelectedSort] = useState("recent");
  const [activeCategory, setActiveCategory] = useState("all");

  const categories: CategoryFilter[] = [
    { id: "all", label: "Tout", count: 24 },
    { id: "electronics", label: "Électronique", count: 8 },
    { id: "clothing", label: "Vêtements", count: 5 },
    { id: "home", label: "Maison & Meubles", count: 7 },
    { id: "others", label: "Autres", count: 4 },
  ];

  const sortOptions = [
    { value: "recent", label: "Trier par: Récent" },
    { value: "price-asc", label: "Prix: Croissant" },
    { value: "price-desc", label: "Prix: Décroissant" },
    { value: "date-added", label: "Date d'ajout" },
  ];

  const categoryOptions = [
    { value: "all", label: "Toutes catégories" },
    { value: "sale", label: "En vente" },
    { value: "exchange", label: "En échange" },
    { value: "free", label: "En don" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const handleViewChange = (view: "grid" | "list") => {
    setActiveView(view);
    onViewChange?.(view);
  };

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    onCategoryFilter?.(categoryId);
  };

  return (
    <section className="py-4">
      <div className="container">
        <div
          className="bg-white rounded-3 shadow-lg p-4 mb-5"
          style={{ borderRadius: "16px" }}
        >
          {/* Barre de contrôle supérieure */}
          <div className="row align-items-center mb-4">
            <div className="col-lg-8 col-md-6 mb-3 mb-md-0">
              {/* Barre de recherche */}
              <div className="position-relative">
                <form onSubmit={handleSearch}>
                  <div className="input-group">
                    <span
                      className="input-group-text border-end-0 bg-transparent border-2"
                      style={{
                        borderColor: colors.oskar.lightGrey,
                        borderRight: "none",
                      }}
                    >
                      <i
                        className="fas fa-search"
                        style={{ color: colors.oskar.grey }}
                      ></i>
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher dans vos favoris..."
                      className="form-control border-start-0"
                      style={{
                        borderColor: colors.oskar.lightGrey,
                        borderLeft: "none",
                        color: colors.oskar.black,
                        borderWidth: "2px",
                        paddingLeft: 0,
                      }}
                    />
                  </div>
                </form>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="d-flex flex-wrap gap-3 justify-content-md-end">
                {/* Boutons vue grille/liste */}
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className={`btn d-flex align-items-center gap-2 ${
                      activeView === "grid"
                        ? "btn-primary"
                        : "btn-outline-secondary"
                    }`}
                    style={{
                      backgroundColor:
                        activeView === "grid"
                          ? colors.oskar.green
                          : "transparent",
                      borderColor: colors.oskar.lightGrey,
                      color:
                        activeView === "grid" ? "white" : colors.oskar.grey,
                    }}
                    onClick={() => handleViewChange("grid")}
                  >
                    <i className="fas fa-th-large"></i>
                    <span className="d-none d-sm-inline">Grille</span>
                  </button>
                  <button
                    type="button"
                    className={`btn d-flex align-items-center gap-2 ${
                      activeView === "list"
                        ? "btn-primary"
                        : "btn-outline-secondary"
                    }`}
                    style={{
                      backgroundColor:
                        activeView === "list"
                          ? colors.oskar.green
                          : "transparent",
                      borderColor: colors.oskar.lightGrey,
                      color:
                        activeView === "list" ? "white" : colors.oskar.grey,
                    }}
                    onClick={() => handleViewChange("list")}
                  >
                    <i className="fas fa-list"></i>
                    <span className="d-none d-sm-inline">Liste</span>
                  </button>
                </div>

                {/* Filtre catégorie */}
                <div
                  className="position-relative"
                  style={{ minWidth: "180px" }}
                >
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      onCategoryFilter?.(e.target.value);
                    }}
                    className="form-select"
                    style={{
                      borderColor: colors.oskar.lightGrey,
                      color: colors.oskar.black,
                      borderWidth: "2px",
                      cursor: "pointer",
                    }}
                  >
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <i
                    className="fas fa-chevron-down position-absolute end-0 top-50 translate-middle-y me-3"
                    style={{
                      color: colors.oskar.grey,
                      pointerEvents: "none",
                    }}
                  ></i>
                </div>

                {/* Trier par */}
                <div
                  className="position-relative"
                  style={{ minWidth: "180px" }}
                >
                  <select
                    value={selectedSort}
                    onChange={(e) => {
                      setSelectedSort(e.target.value);
                      onSortChange?.(e.target.value);
                    }}
                    className="form-select"
                    style={{
                      borderColor: colors.oskar.lightGrey,
                      color: colors.oskar.black,
                      borderWidth: "2px",
                      cursor: "pointer",
                    }}
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <i
                    className="fas fa-chevron-down position-absolute end-0 top-50 translate-middle-y me-3"
                    style={{
                      color: colors.oskar.grey,
                      pointerEvents: "none",
                    }}
                  ></i>
                </div>
              </div>
            </div>
          </div>

          {/* Filtres par catégorie */}
          <div className="d-flex flex-wrap gap-2 mt-4">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className="btn rounded-pill d-flex align-items-center gap-1"
                style={{
                  backgroundColor:
                    activeCategory === category.id
                      ? colors.oskar.green
                      : colors.oskar.lightGrey,
                  color:
                    activeCategory === category.id
                      ? "white"
                      : colors.oskar.grey,
                  padding: "0.5rem 1rem",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  border: "none",
                  transition: "all 0.3s ease",
                }}
                onClick={() => handleCategoryClick(category.id)}
                onMouseEnter={(e) => {
                  if (activeCategory !== category.id) {
                    e.currentTarget.style.backgroundColor =
                      colors.oskar.green + "20";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeCategory !== category.id) {
                    e.currentTarget.style.backgroundColor =
                      colors.oskar.lightGrey;
                  }
                }}
              >
                {category.label}
                <span
                  className="badge rounded-pill ms-1"
                  style={{
                    backgroundColor:
                      activeCategory === category.id
                        ? "rgba(255, 255, 255, 0.2)"
                        : colors.oskar.green,
                    color: activeCategory === category.id ? "white" : "white",
                    fontSize: "0.75rem",
                  }}
                >
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FavoritesControls;
