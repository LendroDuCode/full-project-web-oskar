"use client";

import colors from "@/app/shared/constants/colors";
import { useState } from "react";

interface FiltersSidebarProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
}

const FiltersSidebar: React.FC<FiltersSidebarProps> = ({
  filters,
  onFiltersChange,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    location: true,
    price: true,
    condition: true,
    additional: true,
  });

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedAdditional, setSelectedAdditional] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [selectedPriceRadio, setSelectedPriceRadio] = useState<string>("");
  const [distance, setDistance] = useState(10);
  const [selectedLocation, setSelectedLocation] = useState("");

  const categories = [
    { name: "Électronique", count: 487 },
    { name: "Vêtements & Chaussures", count: 612 },
    { name: "Éducation & Culture", count: 198 },
    { name: "Services de proximité", count: 89 },
  ];

  const conditions = ["Neuf", "Comme neuf", "Bon", "Passable"];

  const additionalFilters = [
    "Avec photos",
    "Vendeurs vérifiés",
    "Livraison possible",
    "Prix négociable",
  ];

  const priceRanges = [
    "Moins de 10,000 FCFA",
    "10,000 - 50,000 FCFA",
    "50,000 - 100,000 FCFA",
    "Plus de 100,000 FCFA",
  ];

  const locations = ["Abidjan", "Bouaké", "Daloa", "Yamoussoukro"];
  const neighborhoods = ["Cocody", "Plateau", "Yopougon"];

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedConditions([]);
    setSelectedAdditional([]);
    setPriceRange({ min: "", max: "" });
    setSelectedPriceRadio("");
    setDistance(10);
    setSelectedLocation("");
    onFiltersChange({});
  };

  const handleApplyFilters = () => {
    const newFilters = {
      categories: selectedCategories,
      conditions: selectedConditions,
      additional: selectedAdditional,
      priceRange,
      selectedPriceRadio,
      distance,
      location: selectedLocation,
    };
    onFiltersChange(newFilters);
    console.log("Filtres appliqués:", newFilters);
  };

  return (
    <aside className="filters-sidebar">
      <div className="card shadow-lg border-0 rounded-4 p-4">
        {/* En-tête */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold text-dark mb-0">Filtres</h5>
          <button
            className="btn btn-link text-decoration-none p-0 fw-semibold"
            style={{ color: colors.oskar.orange }}
            onClick={handleClearFilters}
          >
            Tout effacer
          </button>
        </div>

        {/* Filtre Catégorie */}
        <div className="filter-section border-bottom pb-4 mb-4">
          <div
            className="d-flex justify-content-between align-items-center cursor-pointer mb-3"
            onClick={() => toggleSection("category")}
            style={{ cursor: "pointer" }}
          >
            <h6 className="fw-bold text-dark mb-0">Catégorie</h6>
            <i
              className={`fa-solid fa-chevron-${expandedSections.category ? "up" : "down"} text-muted`}
              style={{ fontSize: "0.875rem" }}
            />
          </div>

          {expandedSections.category && (
            <div className="space-y-2">
              {categories.map((category) => (
                <label
                  key={category.name}
                  className="d-flex align-items-center w-100 p-2 rounded cursor-pointer hover-bg-light transition-colors"
                  style={{ cursor: "pointer" }}
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCategories([
                          ...selectedCategories,
                          category.name,
                        ]);
                      } else {
                        setSelectedCategories(
                          selectedCategories.filter((c) => c !== category.name),
                        );
                      }
                    }}
                    className="form-check-input me-3"
                    style={{ borderColor: colors.oskar.orange }}
                  />
                  <span className="text-muted flex-grow-1">
                    {category.name}
                  </span>
                  <span className="text-muted small">({category.count})</span>
                </label>
              ))}
              <button
                className="btn btn-link p-0 mt-2 text-decoration-none"
                style={{ color: colors.oskar.orange }}
              >
                Voir plus
              </button>
            </div>
          )}
        </div>

        {/* Filtre Lieu */}
        <div className="filter-section border-bottom pb-4 mb-4">
          <div
            className="d-flex justify-content-between align-items-center cursor-pointer mb-3"
            onClick={() => toggleSection("location")}
            style={{ cursor: "pointer" }}
          >
            <h6 className="fw-bold text-dark mb-0">Lieu</h6>
            <i
              className={`fa-solid fa-chevron-${expandedSections.location ? "up" : "down"} text-muted`}
              style={{ fontSize: "0.875rem" }}
            />
          </div>

          {expandedSections.location && (
            <div className="space-y-3">
              <div className="position-relative">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="form-select rounded-3 border-2"
                  style={{ borderColor: colors.oskar.lightGrey }}
                >
                  <option value="">Toutes les villes</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                {neighborhoods.map((neighborhood) => (
                  <label
                    key={neighborhood}
                    className="d-flex align-items-center cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="form-check-input me-3"
                      style={{ borderColor: colors.oskar.orange }}
                    />
                    <span className="text-muted">{neighborhood}</span>
                  </label>
                ))}
              </div>

              <div className="pt-2">
                <label className="text-muted small mb-2">Distance (km)</label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={distance}
                  onChange={(e) => setDistance(parseInt(e.target.value))}
                  className="form-range w-100"
                  style={{ accentColor: colors.oskar.orange }}
                />
                <div className="d-flex justify-content-between text-muted small mt-1">
                  <span>0 km</span>
                  <span>{distance} km</span>
                  <span>50 km</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filtre Prix */}
        <div className="filter-section border-bottom pb-4 mb-4">
          <div
            className="d-flex justify-content-between align-items-center cursor-pointer mb-3"
            onClick={() => toggleSection("price")}
            style={{ cursor: "pointer" }}
          >
            <h6 className="fw-bold text-dark mb-0">Fourchette de prix</h6>
            <i
              className={`fa-solid fa-chevron-${expandedSections.price ? "up" : "down"} text-muted`}
              style={{ fontSize: "0.875rem" }}
            />
          </div>

          {expandedSections.price && (
            <div className="space-y-3">
              <div className="d-flex align-items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, min: e.target.value })
                  }
                  className="form-control rounded-3 border-2"
                  style={{ borderColor: colors.oskar.lightGrey }}
                />
                <span className="text-muted">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, max: e.target.value })
                  }
                  className="form-control rounded-3 border-2"
                  style={{ borderColor: colors.oskar.lightGrey }}
                />
              </div>

              <div className="space-y-2">
                {priceRanges.map((range, index) => (
                  <label
                    key={index}
                    className="d-flex align-items-center cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="price"
                      checked={selectedPriceRadio === range}
                      onChange={() => setSelectedPriceRadio(range)}
                      className="form-check-input me-3"
                      style={{ borderColor: colors.oskar.orange }}
                    />
                    <span className="text-muted">{range}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Filtre État */}
        <div className="filter-section border-bottom pb-4 mb-4">
          <div
            className="d-flex justify-content-between align-items-center cursor-pointer mb-3"
            onClick={() => toggleSection("condition")}
            style={{ cursor: "pointer" }}
          >
            <h6 className="fw-bold text-dark mb-0">État</h6>
            <i
              className={`fa-solid fa-chevron-${expandedSections.condition ? "up" : "down"} text-muted`}
              style={{ fontSize: "0.875rem" }}
            />
          </div>

          {expandedSections.condition && (
            <div className="space-y-2">
              {conditions.map((condition) => (
                <label
                  key={condition}
                  className="d-flex align-items-center p-2 rounded cursor-pointer hover-bg-light transition-colors"
                  style={{ cursor: "pointer" }}
                >
                  <input
                    type="checkbox"
                    checked={selectedConditions.includes(condition)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedConditions([
                          ...selectedConditions,
                          condition,
                        ]);
                      } else {
                        setSelectedConditions(
                          selectedConditions.filter((c) => c !== condition),
                        );
                      }
                    }}
                    className="form-check-input me-3"
                    style={{ borderColor: colors.oskar.orange }}
                  />
                  <span className="text-muted">{condition}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Plus de filtres */}
        <div className="filter-section mb-4">
          <div
            className="d-flex justify-content-between align-items-center cursor-pointer mb-3"
            onClick={() => toggleSection("additional")}
            style={{ cursor: "pointer" }}
          >
            <h6 className="fw-bold text-dark mb-0">Plus de filtres</h6>
            <i
              className={`fa-solid fa-chevron-${expandedSections.additional ? "up" : "down"} text-muted`}
              style={{ fontSize: "0.875rem" }}
            />
          </div>

          {expandedSections.additional && (
            <div className="space-y-2">
              {additionalFilters.map((filter) => (
                <label
                  key={filter}
                  className="d-flex align-items-center p-2 rounded cursor-pointer hover-bg-light transition-colors"
                  style={{ cursor: "pointer" }}
                >
                  <input
                    type="checkbox"
                    checked={selectedAdditional.includes(filter)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAdditional([...selectedAdditional, filter]);
                      } else {
                        setSelectedAdditional(
                          selectedAdditional.filter((f) => f !== filter),
                        );
                      }
                    }}
                    className="form-check-input me-3"
                    style={{ borderColor: colors.oskar.orange }}
                  />
                  <span className="text-muted">{filter}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Bouton Appliquer */}
        <button
          className="btn w-100 py-3 fw-semibold text-white border-0 rounded-3 transition-colors"
          style={{ backgroundColor: colors.oskar.orange }}
          onClick={handleApplyFilters}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor =
              colors.oskar.orangeHover || "#e66900";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.oskar.orange;
          }}
        >
          Appliquer les filtres
        </button>
      </div>

      <style jsx>{`
        .filters-sidebar {
          width: 320px;
          flex-shrink: 0;
        }

        .hover-bg-light:hover {
          background-color: ${colors.oskar.lightGrey};
        }

        .transition-colors {
          transition: all 0.3s ease;
        }

        .cursor-pointer {
          cursor: pointer;
        }

        .space-y-2 > * + * {
          margin-top: 0.5rem;
        }

        .space-y-3 > * + * {
          margin-top: 1rem;
        }

        .gap-2 {
          gap: 0.5rem;
        }

        .form-check-input:checked {
          background-color: ${colors.oskar.orange};
          border-color: ${colors.oskar.orange};
        }

        .form-check-input:focus {
          box-shadow: 0 0 0 0.2rem rgba(245, 124, 0, 0.25);
          border-color: ${colors.oskar.orange};
        }

        .form-select:focus,
        .form-control:focus {
          border-color: ${colors.oskar.orange};
          box-shadow: 0 0 0 0.2rem rgba(245, 124, 0, 0.25);
        }

        @media (max-width: 1400px) {
          .filters-sidebar {
            width: 300px;
          }
        }

        @media (max-width: 1200px) {
          .filters-sidebar {
            width: 280px;
          }
        }
      `}</style>
    </aside>
  );
};

export default FiltersSidebar;
