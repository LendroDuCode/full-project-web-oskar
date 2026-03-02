"use client";

import { useState, useEffect } from "react";
import colors from "@/app/shared/constants/colors";
import { useSearch } from "../contexts/SearchContext";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";

interface FiltersSidebarProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
}

interface Category {
  uuid: string;
  libelle: string;
  slug: string;
  type: string;
  description?: string;
  image?: string;
  enfants?: SubCategory[];
  path?: string | null;
  is_deleted?: boolean;
  deleted_at?: string | null;
  id?: number;
  count?: number;
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

const FiltersSidebar: React.FC<FiltersSidebarProps> = ({
  filters,
  onFiltersChange,
}) => {
  const {
    searchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedSousCategorie,
    setSelectedSousCategorie,
    selectedSousCategorieLibelle,
    setSelectedSousCategorieLibelle,
    selectedLocation,
    setSelectedLocation,
    maxPrice,
    setMaxPrice,
  } = useSearch();

  const [expandedSections, setExpandedSections] = useState({
    category: true,
    location: true,
    price: true,
    condition: true,
    additional: true,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>("");
  const [showAllCategories, setShowAllCategories] = useState(false);

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

  const [additionalFilters] = useState([
    { value: "photos", label: "Avec photos", count: 1243 },
    { value: "verified", label: "Vendeurs vérifiés", count: 567 },
    { value: "delivery", label: "Livraison possible", count: 876 },
    { value: "negotiable", label: "Prix négociable", count: 432 },
  ]);

  const [priceRanges] = useState<PriceRange[]>([
    { min: 0, max: 10000, label: "Moins de 10,000 FCFA" },
    { min: 10000, max: 50000, label: "10,000 - 50,000 FCFA" },
    { min: 50000, max: 100000, label: "50,000 - 100,000 FCFA" },
    { min: 100000, max: null, label: "Plus de 100,000 FCFA" },
  ]);

  const [neighborhoods] = useState([
    { value: "cocody", label: "Cocody", count: 234, parent: "abidjan" },
    { value: "plateau", label: "Plateau", count: 145, parent: "abidjan" },
    { value: "yopougon", label: "Yopougon", count: 321, parent: "abidjan" },
    { value: "koumassi", label: "Koumassi", count: 98, parent: "bouake" },
  ]);

  const [distance, setDistance] = useState(10);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedAdditional, setSelectedAdditional] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>("");

  // ============================================
  // CHARGEMENT DES CATÉGORIES DYNAMIQUES
  // ============================================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await api.get(API_ENDPOINTS.CATEGORIES.LIST);
        
        if (Array.isArray(response)) {
          // Filtrer les catégories actives
          const activeCategories = response
            .filter((c: Category) => !c.is_deleted && c.deleted_at === null)
            .map((cat: Category) => ({
              ...cat,
              count: Math.floor(Math.random() * 500) + 100, // Simuler des comptes
            }));
          
          setCategories(activeCategories);
        }
      } catch (error) {
        console.error("❌ Erreur chargement catégories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // ============================================
  // CHARGEMENT DES SOUS-CATÉGORIES QUAND UNE CATÉGORIE PRINCIPALE EST SÉLECTIONNÉE
  // ============================================
  useEffect(() => {
    if (selectedMainCategory) {
      const category = categories.find(c => c.uuid === selectedMainCategory);
      if (category?.enfants) {
        const activeSubs = category.enfants
          .filter((sub: any) => !sub.is_deleted && sub.deleted_at === null)
          .map((sub: any) => ({
            ...sub,
            count: Math.floor(Math.random() * 200) + 50,
          }));
        setSubCategories(activeSubs);
      } else {
        setSubCategories([]);
      }
    } else {
      setSubCategories([]);
    }
  }, [selectedMainCategory, categories]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCategoryChange = (categoryUuid: string) => {
    if (selectedMainCategory === categoryUuid) {
      setSelectedMainCategory("");
      setSelectedCategory("");
      setSelectedSousCategorie("");
      setSelectedSousCategorieLibelle("");
    } else {
      setSelectedMainCategory(categoryUuid);
      const category = categories.find(c => c.uuid === categoryUuid);
      setSelectedCategory(category?.libelle || "");
      setSelectedSousCategorie("");
      setSelectedSousCategorieLibelle("");
    }
    
    // Émettre l'événement pour filtrer
    emitFilterChange();
  };

  const handleSubCategoryChange = (subCategoryUuid: string, subCategoryLibelle: string) => {
    if (selectedSousCategorie === subCategoryUuid) {
      setSelectedSousCategorie("");
      setSelectedSousCategorieLibelle("");
    } else {
      setSelectedSousCategorie(subCategoryUuid);
      setSelectedSousCategorieLibelle(subCategoryLibelle);
    }
    
    emitFilterChange();
  };

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location === selectedLocation ? "" : location);
    emitFilterChange();
  };

  const handlePriceRangeChange = (range: PriceRange) => {
    if (selectedPriceRange === range.label) {
      setSelectedPriceRange("");
      setMaxPrice("");
    } else {
      setSelectedPriceRange(range.label);
      setMaxPrice(range.max?.toString() || "");
    }
    emitFilterChange();
  };

  const handleConditionChange = (condition: string) => {
    const newConditions = selectedConditions.includes(condition)
      ? selectedConditions.filter(c => c !== condition)
      : [...selectedConditions, condition];
    setSelectedConditions(newConditions);
    emitFilterChange();
  };

  const handleAdditionalChange = (filter: string) => {
    const newAdditional = selectedAdditional.includes(filter)
      ? selectedAdditional.filter(f => f !== filter)
      : [...selectedAdditional, filter];
    setSelectedAdditional(newAdditional);
    emitFilterChange();
  };

  const emitFilterChange = () => {
    const newFilters = {
      categories: selectedMainCategory ? [selectedMainCategory] : [],
      subCategories: selectedSousCategorie ? [selectedSousCategorie] : [],
      conditions: selectedConditions,
      additional: selectedAdditional,
      priceRange: selectedPriceRange,
      location: selectedLocation,
      distance,
    };
    onFiltersChange(newFilters);

    // Émettre l'événement pour que ListingsGrid se mette à jour
    if (typeof window !== "undefined") {
      const event = new CustomEvent("search-filters-updated", {
        detail: {
          searchQuery,
          category: selectedCategory,
          sousCategorie: selectedSousCategorie,
          sousCategorieLibelle: selectedSousCategorieLibelle,
          location: selectedLocation,
          maxPrice,
        },
      });
      window.dispatchEvent(event);
    }
  };

  const handleClearFilters = () => {
    setSelectedMainCategory("");
    setSelectedCategory("");
    setSelectedSousCategorie("");
    setSelectedSousCategorieLibelle("");
    setSelectedLocation("");
    setMaxPrice("");
    setSelectedPriceRange("");
    setSelectedConditions([]);
    setSelectedAdditional([]);
    setDistance(10);
    setSubCategories([]);

    onFiltersChange({});

    // Émettre l'événement pour réinitialiser
    if (typeof window !== "undefined") {
      const event = new CustomEvent("search-filters-updated", {
        detail: {
          searchQuery,
          category: "",
          sousCategorie: "",
          sousCategorieLibelle: "",
          location: "",
          maxPrice: "",
        },
      });
      window.dispatchEvent(event);
    }
  };

  const hasActiveFilters = !!(
    selectedMainCategory ||
    selectedSousCategorie ||
    selectedLocation ||
    maxPrice ||
    selectedConditions.length > 0 ||
    selectedAdditional.length > 0
  );

  return (
    <aside className="filters-sidebar">
      <div className="card shadow-lg border-0 rounded-4 p-4">
        {/* En-tête */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold text-dark mb-0">Filtres</h5>
          {hasActiveFilters && (
            <button
              className="btn btn-link text-decoration-none p-0 fw-semibold"
              style={{ color: colors.oskar.orange }}
              onClick={handleClearFilters}
            >
              Tout effacer
            </button>
          )}
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
              {loadingCategories ? (
                <div className="d-flex justify-content-center py-3">
                  <div className="spinner-border spinner-border-sm text-success" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                </div>
              ) : (
                <>
                  {/* Catégories principales */}
                  {(showAllCategories ? categories : categories.slice(0, 5)).map((category) => (
                    <div key={category.uuid}>
                      <label
                        className="d-flex align-items-center w-100 p-2 rounded cursor-pointer hover-bg-light transition-colors"
                        style={{ cursor: "pointer" }}
                      >
                        <input
                          type="radio"
                          name="category"
                          checked={selectedMainCategory === category.uuid}
                          onChange={() => handleCategoryChange(category.uuid)}
                          className="form-check-input me-3"
                          style={{ borderColor: colors.oskar.orange }}
                        />
                        <span className="text-muted flex-grow-1">
                          {category.libelle}
                        </span>
                        <span className="text-muted small">({category.count || 0})</span>
                      </label>

                      {/* Sous-catégories */}
                      {selectedMainCategory === category.uuid && subCategories.length > 0 && (
                        <div className="ms-4 mt-2 mb-2 space-y-2">
                          {subCategories.map((sub) => (
                            <label
                              key={sub.uuid}
                              className="d-flex align-items-center w-100 p-2 rounded cursor-pointer hover-bg-light transition-colors"
                              style={{ cursor: "pointer" }}
                            >
                              <input
                                type="checkbox"
                                checked={selectedSousCategorie === sub.uuid}
                                onChange={() => handleSubCategoryChange(sub.uuid, sub.libelle)}
                                className="form-check-input me-3"
                                style={{ borderColor: colors.oskar.orange }}
                              />
                              <span className="text-muted flex-grow-1">
                                {sub.libelle}
                              </span>
                              <span className="text-muted small">({sub.count || 0})</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {categories.length > 5 && (
                    <button
                      className="btn btn-link p-0 mt-2 text-decoration-none"
                      style={{ color: colors.oskar.orange }}
                      onClick={() => setShowAllCategories(!showAllCategories)}
                    >
                      {showAllCategories ? "Voir moins" : "Voir plus"}
                    </button>
                  )}
                </>
              )}
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
                  onChange={(e) => handleLocationChange(e.target.value)}
                  className="form-select rounded-3 border-2"
                  style={{ borderColor: colors.oskar.lightGrey }}
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
                <div className="space-y-2 mt-3">
                  <p className="small fw-semibold text-dark mb-2">Quartiers populaires</p>
                  {neighborhoods
                    .filter(n => n.parent === "abidjan")
                    .map((hood) => (
                      <label
                        key={hood.value}
                        className="d-flex align-items-center cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="form-check-input me-3"
                          style={{ borderColor: colors.oskar.orange }}
                          onChange={() => {/* Gérer quartier */}}
                        />
                        <span className="text-muted">{hood.label}</span>
                        <span className="text-muted small ms-2">({hood.count})</span>
                      </label>
                    ))}
                </div>
              )}

              <div className="pt-2">
                <label className="text-muted small mb-2">Distance (km)</label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={distance}
                  onChange={(e) => {
                    setDistance(parseInt(e.target.value));
                    emitFilterChange();
                  }}
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
            <div className="space-y-2">
              {priceRanges.map((range) => (
                <label
                  key={range.label}
                  className="d-flex align-items-center cursor-pointer"
                >
                  <input
                    type="radio"
                    name="price"
                    checked={selectedPriceRange === range.label}
                    onChange={() => handlePriceRangeChange(range)}
                    className="form-check-input me-3"
                    style={{ borderColor: colors.oskar.orange }}
                  />
                  <span className="text-muted">{range.label}</span>
                </label>
              ))}
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
                  key={condition.value}
                  className="d-flex align-items-center p-2 rounded cursor-pointer hover-bg-light transition-colors"
                  style={{ cursor: "pointer" }}
                >
                  <input
                    type="checkbox"
                    checked={selectedConditions.includes(condition.value)}
                    onChange={() => handleConditionChange(condition.value)}
                    className="form-check-input me-3"
                    style={{ borderColor: colors.oskar.orange }}
                  />
                  <span className="text-muted flex-grow-1">{condition.label}</span>
                  <span className="text-muted small">({condition.count})</span>
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
                  key={filter.value}
                  className="d-flex align-items-center p-2 rounded cursor-pointer hover-bg-light transition-colors"
                  style={{ cursor: "pointer" }}
                >
                  <input
                    type="checkbox"
                    checked={selectedAdditional.includes(filter.value)}
                    onChange={() => handleAdditionalChange(filter.value)}
                    className="form-check-input me-3"
                    style={{ borderColor: colors.oskar.orange }}
                  />
                  <span className="text-muted flex-grow-1">{filter.label}</span>
                  <span className="text-muted small">({filter.count})</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Résumé des filtres actifs */}
        {hasActiveFilters && (
          <div className="mt-3 p-3 bg-light rounded-3">
            <p className="small fw-semibold text-dark mb-2">Filtres actifs:</p>
            <div className="d-flex flex-wrap gap-1">
              {selectedMainCategory && (
                <span className="badge bg-white text-dark border px-2 py-1 rounded-pill">
                  {categories.find(c => c.uuid === selectedMainCategory)?.libelle}
                  <button
                    className="btn btn-link p-0 ms-1 text-danger"
                    onClick={() => handleCategoryChange(selectedMainCategory)}
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </span>
              )}
              {selectedSousCategorieLibelle && (
                <span className="badge bg-white text-dark border px-2 py-1 rounded-pill">
                  {selectedSousCategorieLibelle}
                  <button
                    className="btn btn-link p-0 ms-1 text-danger"
                    onClick={() => handleSubCategoryChange(selectedSousCategorie, "")}
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </span>
              )}
              {selectedLocation && (
                <span className="badge bg-white text-dark border px-2 py-1 rounded-pill">
                  {locations.find(l => l.value === selectedLocation)?.label}
                  <button
                    className="btn btn-link p-0 ms-1 text-danger"
                    onClick={() => handleLocationChange(selectedLocation)}
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </span>
              )}
              {maxPrice && (
                <span className="badge bg-white text-dark border px-2 py-1 rounded-pill">
                  Max {parseInt(maxPrice).toLocaleString()} FCFA
                  <button
                    className="btn btn-link p-0 ms-1 text-danger"
                    onClick={() => setMaxPrice("")}
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

        .badge {
          font-weight: 500;
          font-size: 0.75rem;
        }

        .badge button {
          font-size: 0.7rem;
          text-decoration: none;
        }

        .badge button:hover {
          color: #dc3545 !important;
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