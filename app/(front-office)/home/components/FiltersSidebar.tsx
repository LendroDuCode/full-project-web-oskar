// FiltersSidebar.tsx
"use client";

import { useState } from "react";
import colors from "../../../shared/constants/colors";

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
    <aside id="filters-sidebar">
      <div className="filters-card">
        {/* En-tête */}
        <div className="filters-header">
          <h2 className="filters-title">Filtres</h2>
          <button className="filters-clear-btn" onClick={handleClearFilters}>
            Tout effacer
          </button>
        </div>

        {/* Filtre Catégorie */}
        <div className="filter-section">
          <div
            className="filter-section-header"
            onClick={() => toggleSection("category")}
          >
            <h3 className="filter-section-title">Catégorie</h3>
            <i
              className={`fa-solid fa-chevron-${expandedSections.category ? "up" : "down"}`}
            />
          </div>

          {expandedSections.category && (
            <div className="filter-section-content">
              {categories.map((category) => (
                <label key={category.name} className="filter-checkbox-label">
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
                    className="filter-checkbox"
                  />
                  <span className="filter-checkbox-text">{category.name}</span>
                  <span className="filter-count">({category.count})</span>
                </label>
              ))}
              <button className="filter-see-more">Voir plus</button>
            </div>
          )}
        </div>

        {/* Filtre Lieu */}
        <div className="filter-section">
          <div
            className="filter-section-header"
            onClick={() => toggleSection("location")}
          >
            <h3 className="filter-section-title">Lieu</h3>
            <i
              className={`fa-solid fa-chevron-${expandedSections.location ? "up" : "down"}`}
            />
          </div>

          {expandedSections.location && (
            <div className="filter-section-content">
              <div className="mb-3">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="form-select filter-select"
                >
                  <option value="">Toutes les villes</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                {neighborhoods.map((neighborhood) => (
                  <label key={neighborhood} className="filter-checkbox-label">
                    <input type="checkbox" className="filter-checkbox" />
                    <span className="filter-checkbox-text">{neighborhood}</span>
                  </label>
                ))}
              </div>

              <div className="distance-filter">
                <label className="distance-label">Distance (km)</label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={distance}
                  onChange={(e) => setDistance(parseInt(e.target.value))}
                  className="distance-slider"
                />
                <div className="distance-labels">
                  <span>0 km</span>
                  <span>{distance} km</span>
                  <span>50 km</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filtre Prix */}
        <div className="filter-section">
          <div
            className="filter-section-header"
            onClick={() => toggleSection("price")}
          >
            <h3 className="filter-section-title">Fourchette de prix</h3>
            <i
              className={`fa-solid fa-chevron-${expandedSections.price ? "up" : "down"}`}
            />
          </div>

          {expandedSections.price && (
            <div className="filter-section-content">
              <div className="price-inputs mb-3">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, min: e.target.value })
                  }
                  className="price-input"
                />
                <span className="price-separator">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, max: e.target.value })
                  }
                  className="price-input"
                />
              </div>

              <div className="price-radios">
                {priceRanges.map((range, index) => (
                  <label key={index} className="filter-radio-label">
                    <input
                      type="radio"
                      name="price"
                      checked={selectedPriceRadio === range}
                      onChange={() => setSelectedPriceRadio(range)}
                      className="filter-radio"
                    />
                    <span className="filter-radio-text">{range}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Filtre État */}
        <div className="filter-section">
          <div
            className="filter-section-header"
            onClick={() => toggleSection("condition")}
          >
            <h3 className="filter-section-title">État</h3>
            <i
              className={`fa-solid fa-chevron-${expandedSections.condition ? "up" : "down"}`}
            />
          </div>

          {expandedSections.condition && (
            <div className="filter-section-content">
              {conditions.map((condition) => (
                <label key={condition} className="filter-checkbox-label">
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
                    className="filter-checkbox"
                  />
                  <span className="filter-checkbox-text">{condition}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Plus de filtres */}
        <div className="filter-section">
          <div
            className="filter-section-header"
            onClick={() => toggleSection("additional")}
          >
            <h3 className="filter-section-title">Plus de filtres</h3>
            <i
              className={`fa-solid fa-chevron-${expandedSections.additional ? "up" : "down"}`}
            />
          </div>

          {expandedSections.additional && (
            <div className="filter-section-content">
              {additionalFilters.map((filter) => (
                <label key={filter} className="filter-checkbox-label">
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
                    className="filter-checkbox"
                  />
                  <span className="filter-checkbox-text">{filter}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Bouton Appliquer */}
        <button className="filters-apply-btn" onClick={handleApplyFilters}>
          Appliquer les filtres
        </button>
      </div>

      <style jsx>{`
        #filters-sidebar {
          position: sticky;
          top: 6rem;
        }

        .filters-card {
          background-color: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          padding: 1.5rem;
        }

        .filters-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .filters-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: ${colors.oskar.black};
          margin: 0;
        }

        .filters-clear-btn {
          color: ${colors.oskar.green};
          font-weight: 600;
          font-size: 0.875rem;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          transition: color 0.3s;
        }

        .filters-clear-btn:hover {
          text-decoration: underline;
        }

        .filter-section {
          border-bottom: 1px solid ${colors.oskar.lightGrey};
          padding-bottom: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .filter-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .filter-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          margin-bottom: 0.75rem;
        }

        .filter-section-title {
          font-size: 1rem;
          font-weight: 700;
          color: ${colors.oskar.black};
          margin: 0;
        }

        .filter-section-header i {
          color: ${colors.oskar.grey};
          font-size: 0.75rem;
        }

        .filter-section-content {
          padding-top: 0.5rem;
        }

        .filter-checkbox-label {
          display: flex;
          align-items: center;
          padding: 0.5rem;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.3s;
          margin-bottom: 0.25rem;
        }

        .filter-checkbox-label:hover {
          background-color: ${colors.oskar.lightGrey};
        }

        .filter-checkbox {
          width: 1rem;
          height: 1rem;
          border-radius: 4px;
          border: 2px solid ${colors.oskar.grey};
          margin-right: 0.75rem;
          cursor: pointer;
        }

        .filter-checkbox:checked {
          background-color: ${colors.oskar.green};
          border-color: ${colors.oskar.green};
        }

        .filter-checkbox-text {
          color: ${colors.oskar.grey};
          font-size: 0.875rem;
          flex: 1;
        }

        .filter-count {
          color: ${colors.oskar.grey};
          font-size: 0.75rem;
        }

        .filter-see-more {
          color: ${colors.oskar.green};
          font-size: 0.875rem;
          font-weight: 500;
          background: none;
          border: none;
          padding: 0.5rem 0;
          cursor: pointer;
          margin-top: 0.5rem;
        }

        .filter-see-more:hover {
          text-decoration: underline;
        }

        .filter-select {
          width: 100%;
          border: 2px solid ${colors.oskar.lightGrey};
          border-radius: 8px;
          padding: 0.5rem 1rem;
          color: ${colors.oskar.black};
          font-size: 0.875rem;
          cursor: pointer;
          transition: border-color 0.3s;
        }

        .filter-select:focus {
          outline: none;
          border-color: ${colors.oskar.green};
          box-shadow: 0 0 0 0.25rem rgba(76, 175, 80, 0.25);
        }

        .distance-filter {
          padding-top: 0.75rem;
        }

        .distance-label {
          display: block;
          color: ${colors.oskar.grey};
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }

        .distance-slider {
          width: 100%;
          height: 6px;
          -webkit-appearance: none;
          background: ${colors.oskar.lightGrey};
          border-radius: 3px;
          outline: none;
        }

        .distance-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          background: ${colors.oskar.green};
          border-radius: 50%;
          cursor: pointer;
        }

        .distance-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: ${colors.oskar.grey};
          margin-top: 0.25rem;
        }

        .price-inputs {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .price-input {
          flex: 1;
          border: 2px solid ${colors.oskar.lightGrey};
          border-radius: 8px;
          padding: 0.5rem 0.75rem;
          color: ${colors.oskar.black};
          font-size: 0.875rem;
          transition: border-color 0.3s;
        }

        .price-input:focus {
          outline: none;
          border-color: ${colors.oskar.green};
        }

        .price-separator {
          color: ${colors.oskar.grey};
          font-weight: 500;
        }

        .filter-radio-label {
          display: flex;
          align-items: center;
          padding: 0.5rem 0;
          cursor: pointer;
        }

        .filter-radio {
          width: 1rem;
          height: 1rem;
          margin-right: 0.75rem;
          cursor: pointer;
        }

        .filter-radio-text {
          color: ${colors.oskar.grey};
          font-size: 0.875rem;
        }

        .filters-apply-btn {
          width: 100%;
          background-color: ${colors.oskar.green};
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0.75rem;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background-color 0.3s;
          margin-top: 1.5rem;
        }

        .filters-apply-btn:hover {
          background-color: ${colors.oskar.greenDark};
        }
      `}</style>
    </aside>
  );
};

export default FiltersSidebar;
