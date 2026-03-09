"use client";

import { useState, useEffect } from "react";
import colors from "@/app/shared/constants/colors";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { useSearch } from "../../home/contexts/SearchContext";

interface CategoryFiltersSidebarProps {
  categoryUuid: string;
  onFilterChange: (filters: any) => void;
  stats?: {
    dons: number;
    echanges: number;
    produits: number;
  };
}

interface SubCategory {
  uuid: string;
  libelle: string;
  slug: string;
  type: string;
  description?: string;
  image?: string | null;
  path?: string | null;
  depth?: number;
  count?: number;
}

interface Location {
  value: string;
  label: string;
  count?: number;
}

interface PriceRange {
  min: number;
  max: number | null;
  label: string;
}

const CategoryFiltersSidebar: React.FC<CategoryFiltersSidebarProps> = ({
  categoryUuid,
  onFilterChange,
  stats = { dons: 0, echanges: 0, produits: 0 },
}) => {
  const {
    searchQuery,
    setSelectedLocation,
    setMaxPrice,
  } = useSearch();

  const [expandedSections, setExpandedSections] = useState({
    subCategories: true,
    location: true,
    price: true,
    condition: true,
  });

  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocationLocal] = useState<string>("");
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>("");
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [distance, setDistance] = useState(10);

  const [locations] = useState<Location[]>([
    { value: "abidjan", label: "Abidjan", count: 1245 },
    { value: "bouake", label: "Bouaké", count: 567 },
    { value: "daloa", label: "Daloa", count: 234 },
    { value: "yamassoukro", label: "Yamoussoukro", count: 189 },
    { value: "san-pedro", label: "San-Pédro", count: 145 },
    { value: "korhogo", label: "Korhogo", count: 123 },
    { value: "man", label: "Man", count: 98 },
    { value: "gagnoa", label: "Gagnoa", count: 76 },
  ]);

  const [conditions] = useState([
    { value: "neuf", label: "Neuf", count: 432, color: "#10b981", icon: "fa-star" },
    { value: "tresbon", label: "Comme neuf", count: 567, color: "#3b82f6", icon: "fa-thumbs-up" },
    { value: "bon", label: "Bon état", count: 876, color: "#f59e0b", icon: "fa-check" },
    { value: "moyen", label: "État moyen", count: 234, color: "#ef4444", icon: "fa-exclamation" },
    { value: "areparer", label: "À réparer", count: 98, color: "#6b7280", icon: "fa-tools" },
  ]);

  const [priceRanges] = useState<PriceRange[]>([
    { min: 0, max: 10000, label: "Moins de 10,000 FCFA" },
    { min: 10000, max: 50000, label: "10,000 - 50,000 FCFA" },
    { min: 50000, max: 100000, label: "50,000 - 100,000 FCFA" },
    { min: 100000, max: 500000, label: "100,000 - 500,000 FCFA" },
    { min: 500000, max: null, label: "Plus de 500,000 FCFA" },
  ]);

  const [neighborhoods] = useState([
    { value: "cocody", label: "Cocody", count: 234, parent: "abidjan" },
    { value: "plateau", label: "Plateau", count: 145, parent: "abidjan" },
    { value: "yopougon", label: "Yopougon", count: 321, parent: "abidjan" },
    { value: "koumassi", label: "Koumassi", count: 98, parent: "bouake" },
    { value: "djourou", label: "Djourou", count: 67, parent: "bouake" },
    { value: "belleville", label: "Belleville", count: 45, parent: "bouake" },
  ]);

  // ============================================
  // CHARGEMENT DES SOUS-CATÉGORIES
  // ============================================
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!categoryUuid) return;
      
      try {
        setLoadingSubCategories(true);
        const response = await api.get(API_ENDPOINTS.CATEGORIES.DETAIL(categoryUuid));
        
        if (response.enfants && Array.isArray(response.enfants)) {
          const activeSubs = response.enfants
            .filter((sub: any) => !sub.is_deleted && sub.deleted_at === null)
            .map((sub: any) => ({
              ...sub,
              count: Math.floor(Math.random() * 100) + 10,
            }));
          setSubCategories(activeSubs);
        } else {
          setSubCategories([]);
        }
      } catch (error) {
        console.error("❌ Erreur chargement sous-catégories:", error);
        setSubCategories([]);
      } finally {
        setLoadingSubCategories(false);
      }
    };

    fetchSubCategories();
  }, [categoryUuid]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSubCategoryChange = (subCategoryUuid: string) => {
    setSelectedSubCategories(prev => {
      const newSelection = prev.includes(subCategoryUuid)
        ? prev.filter(id => id !== subCategoryUuid)
        : [...prev, subCategoryUuid];
      
      emitFilterChange({
        subCategories: newSelection,
        location: selectedLocation,
        priceRange: selectedPriceRange,
        conditions: selectedConditions,
        distance,
      });
      
      return newSelection;
    });
  };

  const handleLocationChange = (location: string) => {
    setSelectedLocationLocal(location);
    setSelectedLocation(location);
    
    emitFilterChange({
      subCategories: selectedSubCategories,
      location,
      priceRange: selectedPriceRange,
      conditions: selectedConditions,
      distance,
    });
  };

  const handlePriceRangeChange = (range: PriceRange) => {
    const newRange = selectedPriceRange === range.label ? "" : range.label;
    setSelectedPriceRange(newRange);
    
    if (range.max) {
      setMaxPrice(range.max.toString());
    } else {
      setMaxPrice("500000");
    }
    
    emitFilterChange({
      subCategories: selectedSubCategories,
      location: selectedLocation,
      priceRange: newRange,
      conditions: selectedConditions,
      distance,
    });
  };

  const handleConditionChange = (condition: string) => {
    setSelectedConditions(prev => {
      const newConditions = prev.includes(condition)
        ? prev.filter(c => c !== condition)
        : [...prev, condition];
      
      emitFilterChange({
        subCategories: selectedSubCategories,
        location: selectedLocation,
        priceRange: selectedPriceRange,
        conditions: newConditions,
        distance,
      });
      
      return newConditions;
    });
  };

  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDistance = parseInt(e.target.value);
    setDistance(newDistance);
    
    emitFilterChange({
      subCategories: selectedSubCategories,
      location: selectedLocation,
      priceRange: selectedPriceRange,
      conditions: selectedConditions,
      distance: newDistance,
    });
  };

  const emitFilterChange = (filters: any) => {
    onFilterChange(filters);
    
    if (typeof window !== "undefined") {
      const event = new CustomEvent("category-filters-updated", {
        detail: filters,
      });
      window.dispatchEvent(event);
    }
  };

  const handleClearFilters = () => {
    setSelectedSubCategories([]);
    setSelectedLocationLocal("");
    setSelectedLocation("");
    setSelectedPriceRange("");
    setMaxPrice("");
    setSelectedConditions([]);
    setDistance(10);

    onFilterChange({});
    
    if (typeof window !== "undefined") {
      const event = new CustomEvent("category-filters-updated", {
        detail: {},
      });
      window.dispatchEvent(event);
    }
  };

  const hasActiveFilters = !!(
    selectedSubCategories.length > 0 ||
    selectedLocation ||
    selectedPriceRange ||
    selectedConditions.length > 0
  );

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedSubCategories.length > 0) count += selectedSubCategories.length;
    if (selectedLocation) count += 1;
    if (selectedPriceRange) count += 1;
    if (selectedConditions.length > 0) count += selectedConditions.length;
    return count;
  };

  return (
    <aside className="filters-sidebar">
      <div className="filters-container">
        {/* En-tête avec dégradé élégant */}
        <div className="filters-header">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="fw-bold mb-2 text-dark">
                <i className="fas fa-sliders-h me-2" style={{ color: colors.oskar.green }}></i>
                Filtres
              </h5>
              <div className="d-flex gap-2">
                <span className="stats-badge">
                  <i className="fa-solid fa-gift me-1" style={{ color: "#8b5cf6" }}></i>
                  {stats.dons} dons
                </span>
                <span className="stats-badge">
                  <i className="fa-solid fa-arrows-rotate me-1" style={{ color: "#3b82f6" }}></i>
                  {stats.echanges} échanges
                </span>
                <span className="stats-badge">
                  <i className="fa-solid fa-dollar-sign me-1" style={{ color: colors.oskar.green }}></i>
                  {stats.produits} ventes
                </span>
              </div>
            </div>
            {hasActiveFilters && (
              <div className="position-relative">
                <span className="active-filters-badge">
                  {getActiveFiltersCount()}
                </span>
                <button
                  className="clear-filters-btn"
                  onClick={handleClearFilters}
                  title="Effacer tous les filtres"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="filters-body custom-scrollbar">
          {/* Filtre Sous-catégories */}
          {subCategories.length > 0 && (
            <div className="filter-section">
              <div
                className="section-header"
                onClick={() => toggleSection("subCategories")}
              >
                <div className="d-flex align-items-center gap-2">
                  <i className="fas fa-folder-tree section-icon" style={{ color: colors.oskar.green }}></i>
                  <h6 className="section-title">Sous-catégories</h6>
                </div>
                <i className={`fas fa-chevron-${expandedSections.subCategories ? "up" : "down"} section-chevron`}></i>
              </div>

              {expandedSections.subCategories && (
                <div className="section-content">
                  {loadingSubCategories ? (
                    <div className="text-center py-3">
                      <div className="spinner-border spinner-border-sm" style={{ color: colors.oskar.green }} role="status">
                        <span className="visually-hidden">Chargement...</span>
                      </div>
                    </div>
                  ) : (
                    subCategories.map((sub) => (
                      <label
                        key={sub.uuid}
                        className={`filter-option ${selectedSubCategories.includes(sub.uuid) ? 'selected' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedSubCategories.includes(sub.uuid)}
                          onChange={() => handleSubCategoryChange(sub.uuid)}
                          className="filter-checkbox"
                        />
                        <span className="option-label">{sub.libelle}</span>
                        <span className="option-count">{sub.count || 0}</span>
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Filtre Lieu */}
          <div className="filter-section">
            <div
              className="section-header"
              onClick={() => toggleSection("location")}
            >
              <div className="d-flex align-items-center gap-2">
                <i className="fas fa-map-marker-alt section-icon" style={{ color: "#ef4444" }}></i>
                <h6 className="section-title">Lieu</h6>
              </div>
              <i className={`fas fa-chevron-${expandedSections.location ? "up" : "down"} section-chevron`}></i>
            </div>

            {expandedSections.location && (
              <div className="section-content">
                <select
                  value={selectedLocation}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  className="location-select"
                >
                  <option value="">Toutes les villes</option>
                  {locations.map((location) => (
                    <option key={location.value} value={location.value}>
                      {location.label} ({location.count})
                    </option>
                  ))}
                </select>

                {selectedLocation === "abidjan" && (
                  <div className="neighborhoods-container">
                    <p className="neighborhoods-title">
                      <i className="fas fa-building me-2" style={{ color: colors.oskar.orange }}></i>
                      Quartiers
                    </p>
                    {neighborhoods
                      .filter(n => n.parent === "abidjan")
                      .map((hood) => (
                        <label key={hood.value} className="filter-option">
                          <input
                            type="checkbox"
                            className="filter-checkbox"
                            onChange={() => {}}
                          />
                          <span className="option-label">{hood.label}</span>
                          <span className="option-count">{hood.count}</span>
                        </label>
                      ))}
                  </div>
                )}

                <div className="distance-container">
                  <div className="distance-header">
                    <span>
                      <i className="fas fa-route me-2" style={{ color: colors.oskar.green }}></i>
                      Distance
                    </span>
                    <span className="distance-value">{distance} km</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={distance}
                    onChange={handleDistanceChange}
                    className="distance-slider"
                  />
                  <div className="distance-labels">
                    <span>0 km</span>
                    <span>25 km</span>
                    <span>50 km</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Filtre Prix */}
          <div className="filter-section">
            <div
              className="section-header"
              onClick={() => toggleSection("price")}
            >
              <div className="d-flex align-items-center gap-2">
                <i className="fas fa-tag section-icon" style={{ color: "#f59e0b" }}></i>
                <h6 className="section-title">Prix</h6>
              </div>
              <i className={`fas fa-chevron-${expandedSections.price ? "up" : "down"} section-chevron`}></i>
            </div>

            {expandedSections.price && (
              <div className="section-content">
                {priceRanges.map((range) => (
                  <label
                    key={range.label}
                    className={`filter-option radio ${selectedPriceRange === range.label ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="price"
                      checked={selectedPriceRange === range.label}
                      onChange={() => handlePriceRangeChange(range)}
                      className="filter-radio"
                    />
                    <span className="option-label">{range.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Filtre État */}
          <div className="filter-section">
            <div
              className="section-header"
              onClick={() => toggleSection("condition")}
            >
              <div className="d-flex align-items-center gap-2">
                <i className="fas fa-clipboard-check section-icon" style={{ color: "#3b82f6" }}></i>
                <h6 className="section-title">État</h6>
              </div>
              <i className={`fas fa-chevron-${expandedSections.condition ? "up" : "down"} section-chevron`}></i>
            </div>

            {expandedSections.condition && (
              <div className="section-content">
                {conditions.map((condition) => (
                  <label
                    key={condition.value}
                    className={`filter-option ${selectedConditions.includes(condition.value) ? 'selected' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedConditions.includes(condition.value)}
                      onChange={() => handleConditionChange(condition.value)}
                      className="filter-checkbox"
                      style={{ borderColor: condition.color }}
                    />
                    <span className="option-label">{condition.label}</span>
                    <span className="option-count">{condition.count}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Résumé des filtres actifs */}
          {hasActiveFilters && (
            <div className="active-filters-summary">
              <p className="summary-title">
                <i className="fas fa-filter me-2" style={{ color: colors.oskar.orange }}></i>
                Filtres actifs
              </p>
              <div className="active-filters-list">
                {selectedSubCategories.map((uuid) => {
                  const sub = subCategories.find(s => s.uuid === uuid);
                  return sub ? (
                    <span key={uuid} className="active-filter-tag">
                      <i className="fas fa-folder me-1" style={{ fontSize: "0.7rem" }}></i>
                      {sub.libelle}
                      <button
                        className="remove-filter"
                        onClick={() => handleSubCategoryChange(uuid)}
                      >
                        <i className="fas fa-times-circle"></i>
                      </button>
                    </span>
                  ) : null;
                })}
                
                {selectedLocation && (
                  <span className="active-filter-tag">
                    <i className="fas fa-map-marker-alt me-1" style={{ fontSize: "0.7rem", color: "#ef4444" }}></i>
                    {locations.find(l => l.value === selectedLocation)?.label}
                    <button
                      className="remove-filter"
                      onClick={() => handleLocationChange("")}
                    >
                      <i className="fas fa-times-circle"></i>
                    </button>
                  </span>
                )}
                
                {selectedPriceRange && (
                  <span className="active-filter-tag">
                    <i className="fas fa-tag me-1" style={{ fontSize: "0.7rem", color: "#f59e0b" }}></i>
                    {selectedPriceRange}
                    <button
                      className="remove-filter"
                      onClick={() => {
                        setSelectedPriceRange("");
                        setMaxPrice("");
                        emitFilterChange({
                          subCategories: selectedSubCategories,
                          location: selectedLocation,
                          priceRange: "",
                          conditions: selectedConditions,
                          distance,
                        });
                      }}
                    >
                      <i className="fas fa-times-circle"></i>
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .filters-sidebar {
          width: 300px;
          flex-shrink: 0;
          position: sticky;
          top: 100px;
          height: calc(100vh - 120px);
        }

        .filters-container {
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid rgba(16, 185, 129, 0.1);
        }

        .filters-header {
          padding: 20px;
          background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
          border-bottom: 2px solid rgba(16, 185, 129, 0.1);
        }

        .stats-badge {
          background: white;
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 500;
          color: #1e293b;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
          border: 1px solid rgba(16, 185, 129, 0.1);
          display: inline-flex;
          align-items: center;
          transition: all 0.2s ease;
        }

        .stats-badge:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border-color: ${colors.oskar.green};
        }

        .active-filters-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: ${colors.oskar.orange};
          color: white;
          font-size: 0.6rem;
          font-weight: bold;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        }

        .clear-filters-btn {
          background: none;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${colors.oskar.orange};
          background: rgba(245, 124, 0, 0.1);
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .clear-filters-btn:hover {
          background: ${colors.oskar.orange};
          color: white;
          transform: rotate(90deg);
        }

        .filters-body {
          flex: 1;
          overflow-y: auto;
          padding: 16px 20px;
        }

        /* Scrollbar personnalisée */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, ${colors.oskar.green} 0%, ${colors.oskar.orange} 100%);
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, ${colors.oskar.orange} 0%, ${colors.oskar.green} 100%);
        }

        .filter-section {
          margin-bottom: 24px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          padding-bottom: 16px;
        }

        .filter-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          padding: 8px 0;
          transition: all 0.2s ease;
          border-radius: 12px;
        }

        .section-header:hover {
          background: rgba(16, 185, 129, 0.05);
          padding: 8px 12px;
          margin: -8px -12px;
        }

        .section-icon {
          font-size: 1rem;
          width: 24px;
          text-align: center;
        }

        .section-title {
          font-weight: 600;
          color: #1e293b;
          margin: 0;
          font-size: 0.95rem;
        }

        .section-chevron {
          font-size: 0.8rem;
          color: #94a3b8;
          transition: transform 0.3s ease;
        }

        .section-content {
          margin-top: 12px;
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .filter-option {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          margin: 2px 0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: transparent;
        }

        .filter-option:hover {
          background: #f8fafc;
          transform: translateX(4px);
        }

        .filter-option.selected {
          background: linear-gradient(135deg, ${colors.oskar.green}10 0%, ${colors.oskar.orange}10 100%);
          border-left: 3px solid ${colors.oskar.green};
        }

        .filter-checkbox {
          width: 18px;
          height: 18px;
          margin-right: 12px;
          border: 2px solid #cbd5e1;
          border-radius: 5px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-checkbox:checked {
          background-color: ${colors.oskar.green};
          border-color: ${colors.oskar.green};
        }

        .filter-radio {
          width: 18px;
          height: 18px;
          margin-right: 12px;
          border: 2px solid #cbd5e1;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-radio:checked {
          border-color: ${colors.oskar.green};
          background-color: ${colors.oskar.green};
          box-shadow: inset 0 0 0 4px white;
        }

        .option-label {
          flex: 1;
          font-size: 0.9rem;
          color: #334155;
          font-weight: 500;
        }

        .option-count {
          font-size: 0.75rem;
          color: #64748b;
          background: #f1f5f9;
          padding: 2px 8px;
          border-radius: 100px;
          font-weight: 600;
        }

        .location-select {
          width: 100%;
          padding: 10px 12px;
          border: 2px solid #e2e8f0;
          border-radius: 14px;
          font-size: 0.9rem;
          color: #1e293b;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 12px;
        }

        .location-select:hover {
          border-color: ${colors.oskar.green};
        }

        .location-select:focus {
          outline: none;
          border-color: ${colors.oskar.orange};
          box-shadow: 0 0 0 3px rgba(245, 124, 0, 0.1);
        }

        .neighborhoods-container {
          background: #f8fafc;
          padding: 12px;
          border-radius: 16px;
          margin: 12px 0;
        }

        .neighborhoods-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 8px;
          padding-left: 4px;
        }

        .distance-container {
          margin-top: 16px;
          padding: 12px;
          background: #f8fafc;
          border-radius: 16px;
        }

        .distance-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          color: #334155;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .distance-value {
          background: white;
          padding: 4px 12px;
          border-radius: 100px;
          color: ${colors.oskar.orange};
          font-weight: 600;
          font-size: 0.85rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .distance-slider {
          width: 100%;
          height: 6px;
          border-radius: 10px;
          background: linear-gradient(to right, ${colors.oskar.green} 0%, ${colors.oskar.orange} 100%);
          outline: none;
          -webkit-appearance: none;
          margin: 8px 0;
        }

        .distance-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          background: white;
          border: 2px solid ${colors.oskar.orange};
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }

        .distance-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          background: ${colors.oskar.orange};
        }

        .distance-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
          color: #64748b;
          margin-top: 4px;
        }

        .active-filters-summary {
          margin-top: 20px;
          padding: 16px;
          background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
          border-radius: 16px;
          border: 2px solid rgba(245, 124, 0, 0.1);
        }

        .summary-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 12px;
        }

        .active-filters-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .active-filter-tag {
          background: white;
          padding: 4px 10px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 500;
          color: #334155;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          border: 1px solid rgba(16, 185, 129, 0.2);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
          transition: all 0.2s ease;
        }

        .active-filter-tag:hover {
          border-color: ${colors.oskar.orange};
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
        }

        .remove-filter {
          background: none;
          border: none;
          padding: 0;
          margin-left: 4px;
          color: #94a3b8;
          font-size: 0.8rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          transition: all 0.2s ease;
        }

        .remove-filter:hover {
          color: #ef4444;
          transform: scale(1.2);
        }

        /* Responsive */
        @media (max-width: 1400px) {
          .filters-sidebar {
            width: 280px;
          }
        }

        @media (max-width: 1200px) {
          .filters-sidebar {
            width: 260px;
          }
        }

        @media (max-width: 992px) {
          .filters-sidebar {
            width: 100%;
            position: static;
            height: auto;
            margin-bottom: 20px;
          }
        }
      `}</style>
    </aside>
  );
};

export default CategoryFiltersSidebar;