// app/(front-office)/categories/components/CategoryFiltersSidebar.tsx
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
    { value: "neuf", label: "Neuf", count: 432 },
    { value: "tresbon", label: "Comme neuf", count: 567 },
    { value: "bon", label: "Bon état", count: 876 },
    { value: "moyen", label: "État moyen", count: 234 },
    { value: "areparer", label: "À réparer", count: 98 },
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
  ]);

  // ============================================
  // CHARGEMENT DES SOUS-CATÉGORIES
  // ============================================
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!categoryUuid) return;
      
      try {
        setLoadingSubCategories(true);
        console.log("📦 Chargement des sous-catégories pour:", categoryUuid);
        
        const response = await api.get(API_ENDPOINTS.CATEGORIES.DETAIL(categoryUuid));
        console.log("✅ Réponse catégorie:", response);
        
        if (response.enfants && Array.isArray(response.enfants)) {
          const activeSubs = response.enfants
            .filter((sub: any) => !sub.is_deleted && sub.deleted_at === null)
            .map((sub: any) => ({
              ...sub,
              count: Math.floor(Math.random() * 100) + 10,
            }));
          setSubCategories(activeSubs);
          console.log(`✅ ${activeSubs.length} sous-catégories trouvées`);
        } else {
          setSubCategories([]);
          console.log("ℹ️ Aucune sous-catégorie trouvée");
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
    
    // Mettre à jour maxPrice dans le contexte
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
        detail: {
          subCategories: filters.subCategories,
          location: filters.location,
          priceRange: filters.priceRange,
          maxPrice: selectedPriceRange ? true : false,
          conditions: filters.conditions,
        },
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
        detail: {
          subCategories: [],
          location: "",
          priceRange: "",
          maxPrice: false,
          conditions: [],
        },
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

  return (
    <aside className="filters-sidebar">
      <div className="card border border-success border-opacity-25 shadow rounded-3 p-3">
        {/* En-tête avec stats et bouton effacer */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-bold text-dark mb-1">Filtres</h5>
            <div className="d-flex gap-1 small">
              <span className="badge bg-light text-dark px-2 py-1 rounded-pill">
                <i className="fa-solid fa-gift me-1" style={{ color: "#9C27B0", fontSize: "0.7rem" }}></i>
                {stats.dons}
              </span>
              <span className="badge bg-light text-dark px-2 py-1 rounded-pill">
                <i className="fa-solid fa-arrows-rotate me-1" style={{ color: "#2196F3", fontSize: "0.7rem" }}></i>
                {stats.echanges}
              </span>
              <span className="badge bg-light text-dark px-2 py-1 rounded-pill">
                <i className="fa-solid fa-dollar-sign me-1" style={{ color: colors.oskar.green, fontSize: "0.7rem" }}></i>
                {stats.produits}
              </span>
            </div>
          </div>
          {hasActiveFilters && (
            <button
              className="btn btn-link text-decoration-none p-0 fw-semibold"
              style={{ color: colors.oskar.orange, fontSize: "0.75rem" }}
              onClick={handleClearFilters}
            >
              Tout effacer
            </button>
          )}
        </div>

        {/* Filtre Sous-catégories */}
        {subCategories.length > 0 && (
          <div className="filter-section border-bottom pb-3 mb-3">
            <div
              className="d-flex justify-content-between align-items-center cursor-pointer mb-2"
              onClick={() => toggleSection("subCategories")}
              style={{ cursor: "pointer" }}
            >
              <h6 className="fw-semibold text-dark mb-0" style={{ fontSize: "0.9rem" }}>Sous-catégories</h6>
              <i
                className={`fa-solid fa-chevron-${expandedSections.subCategories ? "up" : "down"} text-muted`}
                style={{ fontSize: "0.75rem" }}
              />
            </div>

            {expandedSections.subCategories && (
              <div className="space-y-1">
                {loadingSubCategories ? (
                  <div className="d-flex justify-content-center py-2">
                    <div className="spinner-border spinner-border-sm text-success" role="status">
                      <span className="visually-hidden">Chargement...</span>
                    </div>
                  </div>
                ) : (
                  subCategories.map((sub) => (
                    <label
                      key={sub.uuid}
                      className="d-flex align-items-center w-100 p-1 rounded cursor-pointer hover-bg-light transition-colors"
                      style={{ cursor: "pointer", fontSize: "0.85rem" }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSubCategories.includes(sub.uuid)}
                        onChange={() => handleSubCategoryChange(sub.uuid)}
                        className="form-check-input me-2"
                        style={{ borderColor: colors.oskar.orange, width: "14px", height: "14px" }}
                      />
                      <span className="text-muted flex-grow-1">
                        {sub.libelle}
                      </span>
                      <span className="text-muted small" style={{ fontSize: "0.7rem" }}>({sub.count || 0})</span>
                    </label>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Filtre Lieu */}
        <div className="filter-section border-bottom pb-3 mb-3">
          <div
            className="d-flex justify-content-between align-items-center cursor-pointer mb-2"
            onClick={() => toggleSection("location")}
            style={{ cursor: "pointer" }}
          >
            <h6 className="fw-semibold text-dark mb-0" style={{ fontSize: "0.9rem" }}>Lieu</h6>
            <i
              className={`fa-solid fa-chevron-${expandedSections.location ? "up" : "down"} text-muted`}
              style={{ fontSize: "0.75rem" }}
            />
          </div>

          {expandedSections.location && (
            <div className="space-y-2">
              <div className="position-relative">
                <select
                  value={selectedLocation}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  className="form-select rounded-2 border-0 bg-light"
                  style={{ fontSize: "0.85rem", padding: "0.25rem 0.5rem" }}
                >
                  <option value="">Toutes les villes</option>
                  {locations.map((location) => (
                    <option key={location.value} value={location.value}>
                      {location.label} ({location.count})
                    </option>
                  ))}
                </select>
              </div>

              {selectedLocation === "abidjan" && (
                <div className="space-y-1 mt-2">
                  <p className="small fw-semibold text-dark mb-1" style={{ fontSize: "0.8rem" }}>Quartiers</p>
                  {neighborhoods
                    .filter(n => n.parent === "abidjan")
                    .map((hood) => (
                      <label
                        key={hood.value}
                        className="d-flex align-items-center cursor-pointer"
                        style={{ fontSize: "0.8rem" }}
                      >
                        <input
                          type="checkbox"
                          className="form-check-input me-2"
                          style={{ borderColor: colors.oskar.orange, width: "14px", height: "14px" }}
                          onChange={() => {}}
                        />
                        <span className="text-muted">{hood.label}</span>
                        <span className="text-muted small ms-1" style={{ fontSize: "0.7rem" }}>({hood.count})</span>
                      </label>
                    ))}
                </div>
              )}

              <div className="pt-1">
                <label className="text-muted small mb-1" style={{ fontSize: "0.8rem" }}>Distance (km)</label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={distance}
                  onChange={handleDistanceChange}
                  className="form-range w-100"
                  style={{ accentColor: colors.oskar.orange, height: "4px" }}
                />
                <div className="d-flex justify-content-between text-muted small mt-0" style={{ fontSize: "0.7rem" }}>
                  <span>0 km</span>
                  <span>{distance} km</span>
                  <span>50 km</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filtre Prix */}
        <div className="filter-section border-bottom pb-3 mb-3">
          <div
            className="d-flex justify-content-between align-items-center cursor-pointer mb-2"
            onClick={() => toggleSection("price")}
            style={{ cursor: "pointer" }}
          >
            <h6 className="fw-semibold text-dark mb-0" style={{ fontSize: "0.9rem" }}>Prix</h6>
            <i
              className={`fa-solid fa-chevron-${expandedSections.price ? "up" : "down"} text-muted`}
              style={{ fontSize: "0.75rem" }}
            />
          </div>

          {expandedSections.price && (
            <div className="space-y-1">
              {priceRanges.map((range) => (
                <label
                  key={range.label}
                  className="d-flex align-items-center cursor-pointer"
                  style={{ fontSize: "0.8rem" }}
                >
                  <input
                    type="radio"
                    name="price"
                    checked={selectedPriceRange === range.label}
                    onChange={() => handlePriceRangeChange(range)}
                    className="form-check-input me-2"
                    style={{ borderColor: colors.oskar.orange, width: "14px", height: "14px" }}
                  />
                  <span className="text-muted">{range.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Filtre État */}
        <div className="filter-section mb-3">
          <div
            className="d-flex justify-content-between align-items-center cursor-pointer mb-2"
            onClick={() => toggleSection("condition")}
            style={{ cursor: "pointer" }}
          >
            <h6 className="fw-semibold text-dark mb-0" style={{ fontSize: "0.9rem" }}>État</h6>
            <i
              className={`fa-solid fa-chevron-${expandedSections.condition ? "up" : "down"} text-muted`}
              style={{ fontSize: "0.75rem" }}
            />
          </div>

          {expandedSections.condition && (
            <div className="space-y-1">
              {conditions.map((condition) => (
                <label
                  key={condition.value}
                  className="d-flex align-items-center p-1 rounded cursor-pointer hover-bg-light transition-colors"
                  style={{ cursor: "pointer", fontSize: "0.8rem" }}
                >
                  <input
                    type="checkbox"
                    checked={selectedConditions.includes(condition.value)}
                    onChange={() => handleConditionChange(condition.value)}
                    className="form-check-input me-2"
                    style={{ borderColor: colors.oskar.orange, width: "14px", height: "14px" }}
                  />
                  <span className="text-muted flex-grow-1">{condition.label}</span>
                  <span className="text-muted small" style={{ fontSize: "0.7rem" }}>({condition.count})</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Résumé des filtres actifs */}
        {hasActiveFilters && (
          <div className="mt-2 p-2 bg-light rounded-2">
            <p className="small fw-semibold text-dark mb-1" style={{ fontSize: "0.75rem" }}>Filtres actifs:</p>
            <div className="d-flex flex-wrap gap-1">
              {selectedSubCategories.map((uuid) => {
                const sub = subCategories.find(s => s.uuid === uuid);
                return sub ? (
                  <span key={uuid} className="badge bg-white text-dark border px-2 py-1 rounded-pill" style={{ fontSize: "0.7rem" }}>
                    {sub.libelle}
                    <button
                      className="btn btn-link p-0 ms-1 text-danger"
                      onClick={() => handleSubCategoryChange(uuid)}
                      style={{ fontSize: "0.6rem" }}
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </span>
                ) : null;
              })}
              {selectedLocation && (
                <span className="badge bg-white text-dark border px-2 py-1 rounded-pill" style={{ fontSize: "0.7rem" }}>
                  {locations.find(l => l.value === selectedLocation)?.label}
                  <button
                    className="btn btn-link p-0 ms-1 text-danger"
                    onClick={() => handleLocationChange(selectedLocation)}
                    style={{ fontSize: "0.6rem" }}
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </span>
              )}
              {selectedPriceRange && (
                <span className="badge bg-white text-dark border px-2 py-1 rounded-pill" style={{ fontSize: "0.7rem" }}>
                  {selectedPriceRange}
                  <button
                    className="btn btn-link p-0 ms-1 text-danger"
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
                    style={{ fontSize: "0.6rem" }}
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .filters-sidebar {
          width: 280px;
          flex-shrink: 0;
          max-height: calc(100vh - 200px);
          overflow-y: auto;
          position: relative;
        }

        .filters-sidebar::-webkit-scrollbar {
          width: 4px;
        }

        .filters-sidebar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        .filters-sidebar::-webkit-scrollbar-thumb {
          background: ${colors.oskar.orange}80;
          border-radius: 4px;
        }

        .filters-sidebar::-webkit-scrollbar-thumb:hover {
          background: ${colors.oskar.orange};
        }

        .card {
          border: 1px solid ${colors.oskar.green} !important;
          border-opacity: 0.25 !important;
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
          width: 100%;
        }

        .space-y-1 > * + * {
          margin-top: 0.25rem;
        }

        .space-y-2 > * + * {
          margin-top: 0.5rem;
        }

        .hover-bg-light:hover {
          background-color: ${colors.oskar.lightGrey};
        }

        .transition-colors {
          transition: all 0.2s ease;
        }

        .cursor-pointer {
          cursor: pointer;
        }

        .form-check-input:checked {
          background-color: ${colors.oskar.orange};
          border-color: ${colors.oskar.orange};
        }

        .form-check-input:focus {
          box-shadow: 0 0 0 0.15rem rgba(245, 124, 0, 0.25);
          border-color: ${colors.oskar.orange};
        }

        .form-select:focus {
          border-color: ${colors.oskar.orange};
          box-shadow: 0 0 0 0.15rem rgba(245, 124, 0, 0.25);
        }

        .badge {
          font-weight: 500;
        }

        .badge button {
          text-decoration: none;
        }

        .badge button:hover {
          color: #dc3545 !important;
        }

        @media (max-width: 1400px) {
          .filters-sidebar {
            width: 260px;
          }
        }

        @media (max-width: 1200px) {
          .filters-sidebar {
            width: 240px;
          }
        }
      `}</style>
    </aside>
  );
};

export default CategoryFiltersSidebar;