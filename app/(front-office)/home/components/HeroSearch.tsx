// app/(front-office)/home/components/HeroSearch.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import colors from "../../../shared/constants/colors";
import { useRouter } from "next/navigation";
import { useSearch } from "../contexts/SearchContext";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";

interface HeroSearchProps {
  initialQuery?: string;
  onSearch?: (query: string) => void;
  showPopularSearches?: boolean;
  compactMode?: boolean;
}

interface Category {
  uuid: string;
  libelle: string;
  slug: string;
  type: string;
  description?: string;
  image?: string;
  enfants?: Category[];
  path?: string | null;
  is_deleted?: boolean;
  deleted_at?: string | null;
  id?: number;
}

interface SubCategory {
  uuid: string;
  libelle: string;
  slug: string;
  type: string;
  description?: string;
  image?: string;
  path?: string | null;
  depth?: number;
  parent?: Category;
  counts?: {
    produits: number;
    dons: number;
    echanges: number;
    annonces: number;
    total: number;
  };
}

interface CategoryWithSubs {
  category: Category;
  subCategories: SubCategory[];
}

const HeroSearch: React.FC<HeroSearchProps> = ({
  initialQuery = "",
  onSearch,
  showPopularSearches = true,
  compactMode = false,
}) => {
  const router = useRouter();

  const {
    searchQuery,
    setSearchQuery,
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
    activeTag,
    setActiveTag,
  } = useSearch();

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [categoriesWithSubs, setCategoriesWithSubs] = useState<
    CategoryWithSubs[]
  >([]);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const suggestedSearches = [
    "iPhone 13 pro max",
    "MacBook Air M2",
    "Canapé d'angle",
    "Robe de soirée",
    "Roman policier",
    "Climatiseur portable",
  ];

  const categories = [
    { value: "", label: "Toutes les catégories" },
    { value: "electronique", label: "Électronique" },
    { value: "mode", label: "Mode" },
    { value: "maison", label: "Maison" },
    { value: "vehicules", label: "Véhicules" },
    { value: "education", label: "Éducation" },
    { value: "services", label: "Services" },
  ];

  const locations = [
    { value: "", label: "Toutes les villes" },
    { value: "abidjan", label: "Abidjan" },
    { value: "bouake", label: "Bouaké" },
    { value: "daloa", label: "Daloa" },
    { value: "yamassoukro", label: "Yamoussoukro" },
  ];

  const priceRanges = [
    { value: "", label: "Prix max" },
    { value: "10000", label: "10 000 FCFA" },
    { value: "25000", label: "25 000 FCFA" },
    { value: "50000", label: "50 000 FCFA" },
    { value: "100000", label: "100 000 FCFA" },
    { value: "200000", label: "200 000 FCFA" },
  ];

  // ============================================
  // CHARGEMENT DES SOUS-CATÉGORIES DYNAMIQUES
  // ============================================
  useEffect(() => {
    const fetchAllSubCategories = async () => {
      try {
        setLoadingSubs(true);
        console.log("🟡 HeroSearch - Chargement des sous-catégories...");

        const categoriesResponse = await api.get(API_ENDPOINTS.CATEGORIES.LIST);
        const activeCategories = categoriesResponse.filter(
          (c: Category) => !c.is_deleted && c.deleted_at === null,
        );

        const mainCategories = activeCategories
          .filter((c: Category) => !c.path || c.path === null || c.path === "")
          .slice(0, 4);

        const categoriesData: CategoryWithSubs[] = [];

        for (const category of mainCategories) {
          try {
            const endpoint = API_ENDPOINTS.CATEGORIES.LISTE_SOUS_CATEGORIE(
              category.uuid,
            );
            console.log(`🟡 Fetching subcategories for: ${category.libelle}`);

            const response = await api.get(endpoint);

            let subCategories: SubCategory[] = [];

            if (response.success && Array.isArray(response.data)) {
              subCategories = response.data;
            } else if (Array.isArray(response)) {
              subCategories = response;
            }

            categoriesData.push({
              category,
              subCategories: subCategories.slice(0, 2),
            });

            console.log(
              `✅ ${category.libelle}: ${subCategories.length} sous-catégories`,
            );
          } catch (error) {
            console.error(
              `🔴 Error fetching subcategories for ${category.libelle}:`,
              error,
            );
            categoriesData.push({
              category,
              subCategories: [],
            });
          }
        }

        setCategoriesWithSubs(categoriesData);
      } catch (error) {
        console.error("🔴 HeroSearch - Error loading data:", error);
      } finally {
        setLoadingSubs(false);
      }
    };

    if (showPopularSearches) {
      fetchAllSubCategories();
    }
  }, [showPopularSearches]);

  // Détection responsive
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Initialiser la recherche si initialQuery est fourni
  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
    }
  }, [initialQuery, setSearchQuery]);

  // Focus sur l'input au chargement sur desktop
  useEffect(() => {
    if (!isMobile && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 300);
    }
  }, [isMobile]);

  const handleSearch = () => {
    const query = searchQuery.trim();

    if (onSearch) {
      onSearch(query);
    } else {
      const params = new URLSearchParams();
      if (query) params.append("q", query);
      if (selectedCategory) params.append("categorie", selectedCategory);
      if (selectedSousCategorie)
        params.append("sous_categorie", selectedSousCategorie);
      if (selectedLocation) params.append("localisation", selectedLocation);
      if (maxPrice) params.append("prix_max", maxPrice);

      router.push(`/recherche?${params.toString()}`);
    }

    setShowSuggestions(false);
    console.log("Recherche effectuée:", {
      query,
      selectedCategory,
      selectedSousCategorie,
      selectedLocation,
      maxPrice,
    });
  };

  const handleSubCategoryClick = (
    subCategory: SubCategory,
    categoryName: string,
  ) => {
    setSearchQuery(subCategory.libelle);
    setSelectedSousCategorie(subCategory.uuid);
    setSelectedSousCategorieLibelle(subCategory.libelle);
    setActiveTag(subCategory.libelle);

    let categoryValue = "";
    if (categoryName.includes("Électronique")) categoryValue = "electronique";
    else if (categoryName.includes("Vêtements")) categoryValue = "mode";
    else if (categoryName.includes("Éducation")) categoryValue = "education";
    else if (categoryName.includes("Services")) categoryValue = "services";
    else if (categoryName.includes("Maison")) categoryValue = "maison";
    else if (categoryName.includes("Véhicules")) categoryValue = "vehicules";

    if (categoryValue) {
      setSelectedCategory(categoryValue);
    }

    handleSearch();
    setShowSuggestions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setActiveTag(suggestion);
    setInputFocused(false);
    handleSearch();
  };

  const clearSearch = () => {
    setSearchQuery("");
    setActiveTag(null);
    searchInputRef.current?.focus();
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedSousCategorie("");
    setSelectedSousCategorieLibelle("");
    setSelectedLocation("");
    setMaxPrice("");
    setActiveTag(null);
  };

  const getPlaceholder = () => {
    if (isMobile) {
      return "Rechercher articles, services...";
    }
    if (isTablet) {
      return "Rechercher des articles, services ou catégories...";
    }
    return "Rechercher des articles, services, catégories ou localisations...";
  };

  const hasActiveFilters = !!(
    searchQuery ||
    selectedCategory ||
    selectedSousCategorie ||
    selectedLocation ||
    maxPrice
  );

  const getCategoryIcon = (categoryType: string): string => {
    switch (categoryType) {
      case "Électronique":
        return "fa-laptop";
      case "Vêtements & Chaussures":
        return "fa-tshirt";
      case "Don & Échange":
        return "fa-gift";
      case "Éducation & Culture":
        return "fa-book";
      case "Services de proximité":
        return "fa-hand-holding-heart";
      default:
        return "fa-tag";
    }
  };

  const getCategoryColor = (categoryType: string): string => {
    switch (categoryType) {
      case "Électronique":
        return "#2196F3";
      case "Vêtements & Chaussures":
        return colors.oskar.green;
      case "Don & Échange":
        return "#FF9800";
      case "Éducation & Culture":
        return "#9C27B0";
      case "Services de proximité":
        return "#FF5722";
      default:
        return colors.oskar.grey;
    }
  };

  return (
    <section
      id="hero-search"
      className={`bg-white ${!compactMode ? "border-bottom" : ""}`}
      style={{
        borderColor: colors.oskar.lightGrey,
        padding: compactMode ? "1.5rem 0" : "clamp(2rem, 5vw, 3.5rem) 0",
      }}
    >
      <div className="container-fluid px-3 px-sm-4 px-lg-5">
        <div
          className={`mx-auto ${compactMode ? "" : "px-0 px-md-3 px-lg-5"}`}
          style={{
            maxWidth: compactMode ? "100%" : "clamp(100%, 90vw, 900px)",
          }}
        >
          {/* Titre */}
          {!compactMode && (
            <h1
              className="text-center mb-4 fw-bold"
              style={{
                color: colors.oskar.black,
                fontSize: "clamp(1.75rem, 5vw, 2.75rem)",
                lineHeight: 1.2,
                marginBottom: isMobile ? "1.5rem" : "2rem",
              }}
            >
              Découvrez les pépites près de chez vous
              <span
                className="d-block mt-2"
                style={{
                  fontSize: "clamp(1rem, 3vw, 1.25rem)",
                  color: colors.oskar.grey,
                  fontWeight: "normal",
                  opacity: 0.8,
                }}
              >
                Des milliers d'annonces gratuites à découvrir
              </span>
            </h1>
          )}

          {/* Barre de recherche */}
          <div
            className="position-relative mb-4"
            style={{
              maxWidth: compactMode ? "100%" : "100%",
              marginBottom: isMobile ? "1.5rem" : "2rem",
            }}
          >
            <div className="position-relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => {
                  setInputFocused(true);
                  if (searchQuery) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  setTimeout(() => {
                    setInputFocused(false);
                    setShowSuggestions(false);
                  }, 200);
                }}
                placeholder={getPlaceholder()}
                className="form-control border-2 w-100"
                style={{
                  padding: isMobile
                    ? "0.875rem 3.5rem 0.875rem 1.25rem"
                    : "clamp(0.875rem, 2vw, 1rem) 8rem clamp(0.875rem, 2vw, 1rem) 1.5rem",
                  borderRadius: "clamp(10px, 2vw, 12px)",
                  borderColor: inputFocused
                    ? colors.oskar.green
                    : colors.oskar.lightGrey,
                  color: colors.oskar.black,
                  fontSize: isMobile ? "1rem" : "clamp(1rem, 1.5vw, 1.125rem)",
                  height: isMobile ? "52px" : "clamp(52px, 6vw, 60px)",
                  boxShadow: inputFocused
                    ? `0 4px 20px rgba(76, 175, 80, 0.15)`
                    : "0 2px 8px rgba(0, 0, 0, 0.08)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  backgroundColor: "white",
                }}
              />

              {/* Bouton de recherche */}
              <button
                onClick={handleSearch}
                className="btn position-absolute top-50 end-0 translate-middle-y d-flex align-items-center justify-content-center"
                style={{
                  backgroundColor: colors.oskar.green,
                  color: "white",
                  fontWeight: 600,
                  padding: isMobile ? "0.5rem 1rem" : "0.625rem 1.5rem",
                  borderRadius: "clamp(8px, 1.5vw, 10px)",
                  border: "none",
                  transition: "all 0.3s ease",
                  height: isMobile ? "44px" : "48px",
                  minWidth: isMobile ? "auto" : "120px",
                  marginRight: "0.5rem",
                  boxShadow: "0 4px 12px rgba(76, 175, 80, 0.25)",
                  right: isMobile ? "0" : "0",
                  zIndex: 5,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.oskar.green;
                  e.currentTarget.style.transform =
                    "translateY(-50%) scale(1.02)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 16px rgba(76, 175, 80, 0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.oskar.green;
                  e.currentTarget.style.transform = "translateY(-50%) scale(1)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(76, 175, 80, 0.25)";
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(-50%) scale(0.98)";
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(-50%) scale(1.02)";
                }}
                aria-label="Lancer la recherche"
              >
                {isMobile ? (
                  <i
                    className="fa-solid fa-search"
                    style={{ fontSize: "1rem" }}
                  ></i>
                ) : (
                  <>
                    <i className="fa-solid fa-search me-2"></i>
                    Rechercher
                  </>
                )}
              </button>

              {/* Bouton effacer */}
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="btn position-absolute top-50 translate-middle-y d-flex align-items-center justify-content-center"
                  style={{
                    color: colors.oskar.grey,
                    fontSize: "0.875rem",
                    padding: "0.25rem",
                    right: isMobile ? "70px" : "140px",
                    width: "32px",
                    height: "32px",
                    backgroundColor: "transparent",
                    transform: "translateY(-50%)",
                    border: "none",
                    zIndex: 10,
                  }}
                  aria-label="Effacer la recherche"
                  type="button"
                >
                  <i className="fa-solid fa-times-circle"></i>
                </button>
              )}
            </div>

            {/* Suggestions de recherche */}
            {showSuggestions && searchQuery && (
              <div
                className="position-absolute top-100 start-0 end-0 mt-1 bg-white rounded-3 shadow-lg border"
                style={{
                  zIndex: 1000,
                  maxHeight: "300px",
                  overflowY: "auto",
                  borderColor: colors.oskar.lightGrey,
                  animation: "slideDown 0.2s ease",
                }}
              >
                {suggestedSearches
                  .filter((s) =>
                    s.toLowerCase().includes(searchQuery.toLowerCase()),
                  )
                  .map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="btn w-100 text-start d-flex align-items-center py-3 px-4 border-bottom"
                      style={{
                        color: colors.oskar.black,
                        fontSize: "0.9375rem",
                        transition: "all 0.2s",
                        backgroundColor: "white",
                        borderColor: colors.oskar.lightGrey,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          colors.oskar.lightGrey + "20";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "white";
                      }}
                      type="button"
                    >
                      <i
                        className="fa-solid fa-search me-3"
                        style={{ color: colors.oskar.grey, width: "16px" }}
                      ></i>
                      {suggestion}
                      <span className="ms-auto text-muted small">
                        Populaire
                      </span>
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* FILTRES AVANCÉS - DESKTOP */}
          {!compactMode && !isMobile && (
            <div className="mt-3 mb-4">
              <div className="d-flex flex-wrap justify-content-center align-items-stretch gap-3">
                {/* CATÉGORIE - CORRIGÉ */}
                <div
                  className="position-relative"
                  style={{ minWidth: "220px", flex: "0 1 auto" }}
                >
                  <div className="position-relative">
                    <select
                      className="form-select"
                      style={{
                        width: "100%",
                        padding: "0.75rem 2.5rem 0.75rem 2.5rem",
                        borderColor: selectedCategory
                          ? colors.oskar.green
                          : colors.oskar.lightGrey,
                        fontSize: "0.95rem",
                        backgroundColor: "white",
                        color: selectedCategory
                          ? colors.oskar.black
                          : "#6c757d",
                        appearance: "none",
                        cursor: "pointer",
                        borderWidth: "1.5px",
                        transition: "all 0.2s",
                        borderRadius: "10px",
                        fontWeight: selectedCategory ? "500" : "400",
                        height: "54px",
                        lineHeight: "1.5",
                      }}
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setSelectedSousCategorie("");
                        setSelectedSousCategorieLibelle("");
                      }}
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>

                    {/* Icône gauche - Catégorie */}
                    <div
                      className="position-absolute top-50 start-0 translate-middle-y"
                      style={{
                        color: selectedCategory
                          ? colors.oskar.green
                          : colors.oskar.grey,
                        left: "15px",
                        pointerEvents: "none",
                        zIndex: 2,
                      }}
                    >
                      <i className="fa-solid fa-tag"></i>
                    </div>

                    {/* Icône droite - Flèche */}
                    <div
                      className="position-absolute top-50 end-0 translate-middle-y pe-3"
                      style={{
                        color: colors.oskar.green,
                        pointerEvents: "none",
                        zIndex: 2,
                        right: "10px",
                      }}
                    >
                      <i className="fa-solid fa-chevron-down"></i>
                    </div>

                    {/* Texte sélectionné pour l'affichage (optionnel) */}
                    {selectedCategory && (
                      <div
                        className="position-absolute top-50 start-0 translate-middle-y"
                        style={{
                          left: "45px",
                          pointerEvents: "none",
                          zIndex: 2,
                          color: colors.oskar.black,
                          fontSize: "0.95rem",
                          fontWeight: "500",
                          maxWidth: "120px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {categories.find((c) => c.value === selectedCategory)
                          ?.label || ""}
                      </div>
                    )}
                  </div>

                  {/* Label flottant - CORRIGÉ */}
                  <span
                    className="position-absolute px-2"
                    style={{
                      top: "-10px",
                      left: "15px",
                      fontSize: "0.7rem",
                      color: selectedCategory
                        ? colors.oskar.green
                        : colors.oskar.grey,
                      backgroundColor: "white",
                      padding: "0 6px",
                      fontWeight: 600,
                      letterSpacing: "0.3px",
                      zIndex: 3,
                      lineHeight: "1",
                    }}
                  >
                    CATÉGORIE
                  </span>
                </div>

                {/* LOCALISATION - CORRIGÉ */}
                <div
                  className="position-relative"
                  style={{ minWidth: "220px", flex: "0 1 auto" }}
                >
                  <div className="position-relative">
                    <select
                      className="form-select"
                      style={{
                        width: "100%",
                        padding: "0.75rem 2.5rem 0.75rem 2.5rem",
                        borderColor: selectedLocation
                          ? colors.oskar.green
                          : colors.oskar.lightGrey,
                        fontSize: "0.95rem",
                        backgroundColor: "white",
                        color: selectedLocation
                          ? colors.oskar.black
                          : "#6c757d",
                        appearance: "none",
                        cursor: "pointer",
                        borderWidth: "1.5px",
                        transition: "all 0.2s",
                        borderRadius: "10px",
                        fontWeight: selectedLocation ? "500" : "400",
                        height: "54px",
                        lineHeight: "1.5",
                      }}
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                    >
                      {locations.map((loc) => (
                        <option key={loc.value} value={loc.value}>
                          {loc.label}
                        </option>
                      ))}
                    </select>

                    {/* Icône gauche - Localisation */}
                    <div
                      className="position-absolute top-50 start-0 translate-middle-y"
                      style={{
                        color: selectedLocation
                          ? colors.oskar.green
                          : colors.oskar.grey,
                        left: "15px",
                        pointerEvents: "none",
                        zIndex: 2,
                      }}
                    >
                      <i className="fa-solid fa-location-dot"></i>
                    </div>

                    {/* Icône droite - Flèche */}
                    <div
                      className="position-absolute top-50 end-0 translate-middle-y pe-3"
                      style={{
                        color: colors.oskar.green,
                        pointerEvents: "none",
                        zIndex: 2,
                        right: "10px",
                      }}
                    >
                      <i className="fa-solid fa-chevron-down"></i>
                    </div>

                    {/* Texte sélectionné */}
                    {selectedLocation && (
                      <div
                        className="position-absolute top-50 start-0 translate-middle-y"
                        style={{
                          left: "45px",
                          pointerEvents: "none",
                          zIndex: 2,
                          color: colors.oskar.black,
                          fontSize: "0.95rem",
                          fontWeight: "500",
                          maxWidth: "120px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {locations.find((l) => l.value === selectedLocation)
                          ?.label || ""}
                      </div>
                    )}
                  </div>

                  <span
                    className="position-absolute px-2"
                    style={{
                      top: "-10px",
                      left: "15px",
                      fontSize: "0.7rem",
                      color: selectedLocation
                        ? colors.oskar.green
                        : colors.oskar.grey,
                      backgroundColor: "white",
                      padding: "0 6px",
                      fontWeight: 600,
                      letterSpacing: "0.3px",
                      zIndex: 3,
                      lineHeight: "1",
                    }}
                  >
                    LOCALISATION
                  </span>
                </div>

                {/* PRIX MAX - CORRIGÉ */}
                <div
                  className="position-relative"
                  style={{ minWidth: "220px", flex: "0 1 auto" }}
                >
                  <div className="position-relative">
                    <select
                      className="form-select"
                      style={{
                        width: "100%",
                        padding: "0.75rem 2.5rem 0.75rem 2.5rem",
                        borderColor: maxPrice
                          ? colors.oskar.green
                          : colors.oskar.lightGrey,
                        fontSize: "0.95rem",
                        backgroundColor: "white",
                        color: maxPrice ? colors.oskar.black : "#6c757d",
                        appearance: "none",
                        cursor: "pointer",
                        borderWidth: "1.5px",
                        transition: "all 0.2s",
                        borderRadius: "10px",
                        fontWeight: maxPrice ? "500" : "400",
                        height: "54px",
                        lineHeight: "1.5",
                      }}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    >
                      {priceRanges.map((price) => (
                        <option key={price.value} value={price.value}>
                          {price.label}
                        </option>
                      ))}
                    </select>

                    {/* Icône gauche - Prix */}
                    <div
                      className="position-absolute top-50 start-0 translate-middle-y"
                      style={{
                        color: maxPrice
                          ? colors.oskar.green
                          : colors.oskar.grey,
                        left: "15px",
                        pointerEvents: "none",
                        zIndex: 2,
                      }}
                    >
                      <i className="fa-solid fa-coins"></i>
                    </div>

                    {/* Icône droite - Flèche */}
                    <div
                      className="position-absolute top-50 end-0 translate-middle-y pe-3"
                      style={{
                        color: colors.oskar.green,
                        pointerEvents: "none",
                        zIndex: 2,
                        right: "10px",
                      }}
                    >
                      <i className="fa-solid fa-chevron-down"></i>
                    </div>

                    {/* Texte sélectionné */}
                    {maxPrice && (
                      <div
                        className="position-absolute top-50 start-0 translate-middle-y"
                        style={{
                          left: "45px",
                          pointerEvents: "none",
                          zIndex: 2,
                          color: colors.oskar.black,
                          fontSize: "0.95rem",
                          fontWeight: "500",
                          maxWidth: "120px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {priceRanges.find((p) => p.value === maxPrice)?.label ||
                          ""}
                      </div>
                    )}
                  </div>

                  <span
                    className="position-absolute px-2"
                    style={{
                      top: "-10px",
                      left: "15px",
                      fontSize: "0.7rem",
                      color: maxPrice ? colors.oskar.green : colors.oskar.grey,
                      backgroundColor: "white",
                      padding: "0 6px",
                      fontWeight: 600,
                      letterSpacing: "0.3px",
                      zIndex: 3,
                      lineHeight: "1",
                    }}
                  >
                    BUDGET MAX
                  </span>
                </div>

                {/* BOUTON EFFACER */}
                {hasActiveFilters && (
                  <div className="d-flex align-items-center">
                    <button
                      onClick={clearAllFilters}
                      className="btn d-flex align-items-center justify-content-center gap-2"
                      style={{
                        fontSize: "0.95rem",
                        padding: "0.75rem 1.5rem",
                        borderColor: colors.oskar.lightGrey,
                        color: colors.oskar.grey,
                        backgroundColor: "white",
                        whiteSpace: "nowrap",
                        borderRadius: "10px",
                        borderWidth: "1.5px",
                        transition: "all 0.2s",
                        height: "54px",
                        fontWeight: "500",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          colors.oskar.lightGrey + "40";
                        e.currentTarget.style.borderColor = colors.oskar.grey;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "white";
                        e.currentTarget.style.borderColor =
                          colors.oskar.lightGrey;
                      }}
                    >
                      <i
                        className="fa-solid fa-rotate-left"
                        style={{ color: colors.oskar.green }}
                      ></i>
                      <span>Effacer</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FILTRES RAPIDES - MOBILE - CORRIGÉ */}
          {!compactMode && isMobile && (
            <div className="mb-4">
              <div
                className="d-flex gap-2 overflow-auto pb-2"
                style={{ scrollbarWidth: "none" }}
              >
                {/* Catégorie - Mobile */}
                <div
                  className="position-relative flex-shrink-0"
                  style={{ minWidth: "160px" }}
                >
                  <div className="position-relative">
                    <select
                      className="form-select"
                      style={{
                        width: "100%",
                        padding: "0.7rem 2.2rem 0.7rem 2.2rem",
                        borderColor: selectedCategory
                          ? colors.oskar.green
                          : colors.oskar.lightGrey,
                        fontSize: "0.85rem",
                        backgroundColor: "white",
                        color: selectedCategory
                          ? colors.oskar.black
                          : "#6c757d",
                        appearance: "none",
                        cursor: "pointer",
                        borderWidth: "1.5px",
                        height: "48px",
                        borderRadius: "10px",
                        fontWeight: selectedCategory ? "500" : "400",
                      }}
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setSelectedSousCategorie("");
                        setSelectedSousCategorieLibelle("");
                      }}
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>

                    {/* Icône gauche */}
                    <div
                      className="position-absolute top-50 start-0 translate-middle-y"
                      style={{
                        color: selectedCategory
                          ? colors.oskar.green
                          : colors.oskar.grey,
                        left: "12px",
                        pointerEvents: "none",
                        zIndex: 2,
                      }}
                    >
                      <i className="fa-solid fa-tag"></i>
                    </div>

                    {/* Icône droite */}
                    <div
                      className="position-absolute top-50 end-0 translate-middle-y"
                      style={{
                        color: colors.oskar.green,
                        pointerEvents: "none",
                        zIndex: 2,
                        right: "12px",
                      }}
                    >
                      <i className="fa-solid fa-chevron-down"></i>
                    </div>
                  </div>
                </div>

                {/* Localisation - Mobile */}
                <div
                  className="position-relative flex-shrink-0"
                  style={{ minWidth: "160px" }}
                >
                  <div className="position-relative">
                    <select
                      className="form-select"
                      style={{
                        width: "100%",
                        padding: "0.7rem 2.2rem 0.7rem 2.2rem",
                        borderColor: selectedLocation
                          ? colors.oskar.green
                          : colors.oskar.lightGrey,
                        fontSize: "0.85rem",
                        backgroundColor: "white",
                        color: selectedLocation
                          ? colors.oskar.black
                          : "#6c757d",
                        appearance: "none",
                        cursor: "pointer",
                        borderWidth: "1.5px",
                        height: "48px",
                        borderRadius: "10px",
                        fontWeight: selectedLocation ? "500" : "400",
                      }}
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                    >
                      {locations.map((loc) => (
                        <option key={loc.value} value={loc.value}>
                          {loc.label}
                        </option>
                      ))}
                    </select>

                    <div
                      className="position-absolute top-50 start-0 translate-middle-y"
                      style={{
                        color: selectedLocation
                          ? colors.oskar.green
                          : colors.oskar.grey,
                        left: "12px",
                        pointerEvents: "none",
                        zIndex: 2,
                      }}
                    >
                      <i className="fa-solid fa-location-dot"></i>
                    </div>

                    <div
                      className="position-absolute top-50 end-0 translate-middle-y"
                      style={{
                        color: colors.oskar.green,
                        pointerEvents: "none",
                        zIndex: 2,
                        right: "12px",
                      }}
                    >
                      <i className="fa-solid fa-chevron-down"></i>
                    </div>
                  </div>
                </div>

                {/* Prix max - Mobile */}
                <div
                  className="position-relative flex-shrink-0"
                  style={{ minWidth: "160px" }}
                >
                  <div className="position-relative">
                    <select
                      className="form-select"
                      style={{
                        width: "100%",
                        padding: "0.7rem 2.2rem 0.7rem 2.2rem",
                        borderColor: maxPrice
                          ? colors.oskar.green
                          : colors.oskar.lightGrey,
                        fontSize: "0.85rem",
                        backgroundColor: "white",
                        color: maxPrice ? colors.oskar.black : "#6c757d",
                        appearance: "none",
                        cursor: "pointer",
                        borderWidth: "1.5px",
                        height: "48px",
                        borderRadius: "10px",
                        fontWeight: maxPrice ? "500" : "400",
                      }}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    >
                      {priceRanges.map((price) => (
                        <option key={price.value} value={price.value}>
                          {price.label}
                        </option>
                      ))}
                    </select>

                    <div
                      className="position-absolute top-50 start-0 translate-middle-y"
                      style={{
                        color: maxPrice
                          ? colors.oskar.green
                          : colors.oskar.grey,
                        left: "12px",
                        pointerEvents: "none",
                        zIndex: 2,
                      }}
                    >
                      <i className="fa-solid fa-coins"></i>
                    </div>

                    <div
                      className="position-absolute top-50 end-0 translate-middle-y"
                      style={{
                        color: colors.oskar.green,
                        pointerEvents: "none",
                        zIndex: 2,
                        right: "12px",
                      }}
                    >
                      <i className="fa-solid fa-chevron-down"></i>
                    </div>
                  </div>
                </div>

                {/* Bouton Effacer - Mobile */}
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="btn flex-shrink-0 d-flex align-items-center justify-content-center gap-2"
                    style={{
                      fontSize: "0.85rem",
                      padding: "0.7rem 1.2rem",
                      borderColor: colors.oskar.lightGrey,
                      color: colors.oskar.grey,
                      backgroundColor: "white",
                      whiteSpace: "nowrap",
                      borderWidth: "1.5px",
                      height: "48px",
                      borderRadius: "10px",
                    }}
                  >
                    <i
                      className="fa-solid fa-rotate-left"
                      style={{ color: colors.oskar.green }}
                    ></i>
                    <span>Effacer</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* SOUS-CATÉGORIES DYNAMIQUES */}
          {showPopularSearches && (
            <div className="mt-4 mt-md-5">
              <h3
                className="text-center mb-3"
                style={{
                  color: colors.oskar.grey,
                  fontSize: isMobile ? "0.9375rem" : "1rem",
                  fontWeight: 600,
                  marginBottom: isMobile ? "1rem" : "1.5rem",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                <i
                  className="fa-solid fa-tags me-2"
                  style={{ color: colors.oskar.green }}
                ></i>
                Sous-catégories populaires
              </h3>

              {loadingSubs ? (
                <div className="d-flex justify-content-center align-items-center gap-2">
                  <div
                    className="spinner-border spinner-border-sm"
                    style={{ color: colors.oskar.green }}
                    role="status"
                  >
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                  <span className="text-muted small">
                    Chargement des sous-catégories...
                  </span>
                </div>
              ) : (
                <div className="row g-4">
                  {categoriesWithSubs.map((item) => (
                    <div key={item.category.uuid} className="col-md-3 col-6">
                      <div className="text-center mb-2">
                        <span
                          className="badge px-3 py-2"
                          style={{
                            backgroundColor: `${getCategoryColor(
                              item.category.type,
                            )}15`,
                            color: getCategoryColor(item.category.type),
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            borderRadius: "20px",
                            display: "inline-block",
                            maxWidth: "100%",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            border: `1px solid ${getCategoryColor(item.category.type)}30`,
                          }}
                        >
                          <i
                            className={`fas ${getCategoryIcon(item.category.type)} me-1`}
                          ></i>
                          {item.category.libelle}
                        </span>
                      </div>
                      <div
                        className="d-flex flex-wrap justify-content-center"
                        style={{ gap: "0.5rem" }}
                      >
                        {item.subCategories.length > 0 ? (
                          item.subCategories.map((sub) => (
                            <button
                              key={sub.uuid}
                              onClick={() =>
                                handleSubCategoryClick(
                                  sub,
                                  item.category.libelle,
                                )
                              }
                              className="btn rounded-pill d-flex align-items-center"
                              style={{
                                backgroundColor:
                                  selectedSousCategorie === sub.uuid
                                    ? getCategoryColor(item.category.type)
                                    : "white",
                                color:
                                  selectedSousCategorie === sub.uuid
                                    ? "white"
                                    : colors.oskar.grey,
                                fontSize: isMobile ? "0.75rem" : "0.8125rem",
                                padding: isMobile
                                  ? "0.4rem 0.75rem"
                                  : "0.5rem 0.875rem",
                                transition:
                                  "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                border:
                                  selectedSousCategorie === sub.uuid
                                    ? "none"
                                    : `1px solid ${colors.oskar.lightGrey}`,
                                gap: "0.35rem",
                                whiteSpace: "nowrap",
                                boxShadow:
                                  selectedSousCategorie === sub.uuid
                                    ? `0 4px 12px ${getCategoryColor(item.category.type)}40`
                                    : "0 2px 4px rgba(0,0,0,0.02)",
                                fontWeight:
                                  selectedSousCategorie === sub.uuid
                                    ? "600"
                                    : "400",
                              }}
                              onMouseEnter={(e) => {
                                if (selectedSousCategorie !== sub.uuid) {
                                  e.currentTarget.style.backgroundColor =
                                    getCategoryColor(item.category.type) + "10";
                                  e.currentTarget.style.color =
                                    getCategoryColor(item.category.type);
                                  e.currentTarget.style.borderColor =
                                    getCategoryColor(item.category.type);
                                  e.currentTarget.style.transform =
                                    "translateY(-2px)";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (selectedSousCategorie !== sub.uuid) {
                                  e.currentTarget.style.backgroundColor =
                                    "white";
                                  e.currentTarget.style.color =
                                    colors.oskar.grey;
                                  e.currentTarget.style.borderColor =
                                    colors.oskar.lightGrey;
                                  e.currentTarget.style.transform =
                                    "translateY(0)";
                                }
                              }}
                              aria-label={`Rechercher ${sub.libelle}`}
                              type="button"
                            >
                              <i
                                className="fa-solid fa-tag"
                                style={{ fontSize: "0.7rem" }}
                              ></i>
                              {sub.libelle}
                              {sub.counts && sub.counts.total > 0 && (
                                <span
                                  className="badge ms-1"
                                  style={{
                                    backgroundColor:
                                      selectedSousCategorie === sub.uuid
                                        ? "rgba(255,255,255,0.3)"
                                        : getCategoryColor(item.category.type) +
                                          "20",
                                    color:
                                      selectedSousCategorie === sub.uuid
                                        ? "white"
                                        : getCategoryColor(item.category.type),
                                    fontSize: "0.6rem",
                                    padding: "0.2rem 0.4rem",
                                    borderRadius: "10px",
                                    fontWeight: "600",
                                  }}
                                >
                                  {sub.counts.total}
                                </span>
                              )}
                            </button>
                          ))
                        ) : (
                          <span className="text-muted small">
                            Aucune sous-catégorie
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* RÉSUMÉ DES FILTRES ACTIFS */}
          {hasActiveFilters && (
            <div className="mt-4 text-center">
              <div
                className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill"
                style={{
                  backgroundColor: colors.oskar.lightGrey + "30",
                  border: `1px solid ${colors.oskar.lightGrey}`,
                  backdropFilter: "blur(4px)",
                }}
              >
                <i
                  className="fa-solid fa-filter-circle-dollar"
                  style={{ color: colors.oskar.green, fontSize: "0.85rem" }}
                ></i>
                <span
                  className="small"
                  style={{ color: colors.oskar.grey, fontWeight: "500" }}
                >
                  Filtres actifs:
                </span>
                <div className="d-flex flex-wrap gap-1">
                  {searchQuery && (
                    <span className="badge bg-white text-dark px-2 py-1 rounded-pill border">
                      <i
                        className="fa-solid fa-magnifying-glass me-1"
                        style={{ fontSize: "0.7rem" }}
                      ></i>
                      {searchQuery.length > 15
                        ? searchQuery.substring(0, 15) + "..."
                        : searchQuery}
                    </span>
                  )}
                  {selectedCategory && (
                    <span className="badge bg-white text-dark px-2 py-1 rounded-pill border">
                      <i
                        className="fa-solid fa-tag me-1"
                        style={{
                          fontSize: "0.7rem",
                          color: colors.oskar.green,
                        }}
                      ></i>
                      {
                        categories.find((c) => c.value === selectedCategory)
                          ?.label
                      }
                    </span>
                  )}
                  {selectedSousCategorieLibelle && (
                    <span className="badge bg-white text-dark px-2 py-1 rounded-pill border">
                      <i
                        className="fa-solid fa-tags me-1"
                        style={{ fontSize: "0.7rem", color: "#9C27B0" }}
                      ></i>
                      {selectedSousCategorieLibelle}
                    </span>
                  )}
                  {selectedLocation && (
                    <span className="badge bg-white text-dark px-2 py-1 rounded-pill border">
                      <i
                        className="fa-solid fa-location-dot me-1"
                        style={{ fontSize: "0.7rem", color: "#2196F3" }}
                      ></i>
                      {
                        locations.find((l) => l.value === selectedLocation)
                          ?.label
                      }
                    </span>
                  )}
                  {maxPrice && (
                    <span className="badge bg-white text-dark px-2 py-1 rounded-pill border">
                      <i
                        className="fa-solid fa-coins me-1"
                        style={{ fontSize: "0.7rem", color: "#FF9800" }}
                      ></i>
                      Max {priceRanges.find((p) => p.value === maxPrice)?.label}
                    </span>
                  )}
                </div>
                <button
                  onClick={clearAllFilters}
                  className="btn btn-link p-0 ms-1"
                  style={{ color: colors.oskar.grey }}
                  aria-label="Effacer tous les filtres"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
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

        #hero-search {
          background-color: white !important;
        }

        #hero-search .form-control {
          background-color: white !important;
          color: ${colors.oskar.black} !important;
          border-color: ${colors.oskar.lightGrey} !important;
        }

        #hero-search .form-control:focus {
          background-color: white !important;
          border-color: ${colors.oskar.green} !important;
          box-shadow: 0 0 0 0.25rem rgba(76, 175, 80, 0.25) !important;
        }

        /* Styles pour les selects - CORRIGÉ */
        #hero-search select {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          cursor: pointer;
          background-image: none !important;
          padding-right: 2.5rem !important;
        }

        #hero-search select:hover {
          border-color: ${colors.oskar.green} !important;
          background-color: #f8f9fa;
        }

        #hero-search select:focus {
          border-color: ${colors.oskar.green} !important;
          box-shadow: 0 0 0 0.25rem rgba(76, 175, 80, 0.15) !important;
          outline: none;
        }

        /* Style pour l'option par défaut */
        #hero-search select option[value=""] {
          color: #6c757d;
        }

        #hero-search select option {
          color: ${colors.oskar.black};
          padding: 10px;
        }

        /* Icônes */
        #hero-search .fa-chevron-down {
          font-size: 0.8rem;
          opacity: 0.9;
        }

        #hero-search .fa-tag,
        #hero-search .fa-location-dot,
        #hero-search .fa-coins {
          font-size: 0.95rem;
        }

        /* Labels flottants - CORRIGÉ */
        #hero-search .position-relative span.position-absolute {
          background-color: white;
          padding: 0 6px;
          line-height: 1;
          white-space: nowrap;
        }

        /* Badges de filtres actifs */
        #hero-search .badge.bg-white {
          background-color: white !important;
          border-color: ${colors.oskar.lightGrey} !important;
          color: ${colors.oskar.black} !important;
          font-weight: 500;
          font-size: 0.75rem;
        }

        /* Scroll horizontal pour mobile */
        #hero-search .overflow-auto {
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding-bottom: 8px;
        }

        #hero-search .overflow-auto::-webkit-scrollbar {
          display: none;
        }

        /* Améliorations pour mobile */
        @media (max-width: 768px) {
          #hero-search button,
          #hero-search .btn,
          #hero-search .form-select {
            min-height: 48px;
            touch-action: manipulation;
          }

          #hero-search .form-control {
            font-size: 16px !important;
          }

          #hero-search .d-flex.gap-2 {
            gap: 0.75rem !important;
          }
        }

        /* Ajustements desktop */
        @media (min-width: 769px) {
          #hero-search .d-flex.gap-3 {
            gap: 1.25rem !important;
          }

          #hero-search .position-relative {
            transition: all 0.2s;
          }

          #hero-search .position-relative:hover {
            transform: translateY(-1px);
          }
        }
      `}</style>
    </section>
  );
};

// Version compacte
export const CompactSearch: React.FC<Partial<HeroSearchProps>> = (props) => (
  <HeroSearch compactMode={true} showPopularSearches={false} {...props} />
);

export default HeroSearch;
