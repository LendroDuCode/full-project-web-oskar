// HeroSearch.tsx - VERSION RESPONSIVE COMPLÈTE (MODE CLAIR)
"use client";

import { useState, useEffect, useRef } from "react";
import colors from "../../../shared/constants/colors";
import { useRouter } from "next/navigation";

interface HeroSearchProps {
  initialQuery?: string;
  onSearch?: (query: string) => void;
  showPopularSearches?: boolean;
  compactMode?: boolean;
}

const HeroSearch: React.FC<HeroSearchProps> = ({
  initialQuery = "",
  onSearch,
  showPopularSearches = true,
  compactMode = false,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const popularTags = [
    { name: "Téléphones", icon: "fa-mobile-alt", category: "electronique" },
    { name: "Ordinateurs", icon: "fa-laptop", category: "electronique" },
    { name: "Meubles", icon: "fa-couch", category: "maison" },
    { name: "Vêtements", icon: "fa-tshirt", category: "mode" },
    { name: "Livres", icon: "fa-book", category: "education" },
    { name: "Véhicules", icon: "fa-car", category: "vehicules" },
    { name: "Immobilier", icon: "fa-home", category: "immobilier" },
    { name: "Services", icon: "fa-tools", category: "services" },
  ];

  const suggestedSearches = [
    "iPhone 13 pro max",
    "MacBook Air M2",
    "Canapé d'angle",
    "Robe de soirée",
    "Roman policier",
    "Climatiseur portable",
  ];

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
    if (!query) return;

    if (onSearch) {
      onSearch(query);
    } else {
      // Navigation par défaut
      router.push(`/recherche?q=${encodeURIComponent(query)}`);
    }

    setShowSuggestions(false);

    // Log analytics (optionnel)
    console.log("Recherche effectuée:", query);
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    setActiveTag(tag);

    // Recherche immédiate
    if (onSearch) {
      onSearch(tag);
    } else {
      router.push(
        `/recherche?q=${encodeURIComponent(tag)}&categorie=populaire`,
      );
    }

    setShowSuggestions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setInputFocused(false);
    handleSearch();
  };

  const clearSearch = () => {
    setSearchQuery("");
    setActiveTag(null);
    searchInputRef.current?.focus();
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
          {/* Titre - Conditionnel selon le mode */}
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
                    ? "0.875rem 3.5rem 0.875rem 1rem"
                    : "clamp(0.875rem, 2vw, 1rem) 4rem clamp(0.875rem, 2vw, 1rem) 1.25rem",
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
                  className="btn btn-link position-absolute top-50 end-100 translate-middle-y me-3"
                  style={{
                    color: colors.oskar.grey,
                    fontSize: "0.875rem",
                    padding: "0.25rem",
                    minWidth: "32px",
                    minHeight: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "transparent",
                  }}
                  aria-label="Effacer la recherche"
                  type="button"
                >
                  <i className="fa-solid fa-times"></i>
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

          {/* Tags de recherche rapide */}
          {showPopularSearches && (
            <div className="mt-4 mt-md-5">
              <h3
                className="text-center mb-3"
                style={{
                  color: colors.oskar.grey,
                  fontSize: isMobile ? "0.9375rem" : "1rem",
                  fontWeight: 500,
                  marginBottom: isMobile ? "1rem" : "1.5rem",
                }}
              >
                Recherches populaires
              </h3>
              <div
                className="d-flex flex-wrap justify-content-center"
                style={{
                  gap: isMobile ? "0.5rem" : "0.75rem",
                  rowGap: isMobile ? "0.75rem" : "1rem",
                }}
              >
                {popularTags.map((tag) => (
                  <button
                    key={tag.name}
                    onClick={() => handleTagClick(tag.name)}
                    className="btn rounded-pill d-flex align-items-center"
                    style={{
                      backgroundColor:
                        activeTag === tag.name
                          ? colors.oskar.green
                          : colors.oskar.lightGrey,
                      color:
                        activeTag === tag.name ? "white" : colors.oskar.grey,
                      fontSize: isMobile ? "0.8125rem" : "0.875rem",
                      padding: isMobile ? "0.5rem 0.875rem" : "0.625rem 1rem",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      border: "none",
                      gap: "0.5rem",
                      whiteSpace: "nowrap",
                      boxShadow:
                        activeTag === tag.name
                          ? "0 4px 12px rgba(76, 175, 80, 0.25)"
                          : "none",
                    }}
                    onMouseEnter={(e) => {
                      if (activeTag !== tag.name) {
                        e.currentTarget.style.backgroundColor =
                          colors.oskar.green + "20";
                        e.currentTarget.style.color = colors.oskar.green;
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTag !== tag.name) {
                        e.currentTarget.style.backgroundColor =
                          colors.oskar.lightGrey;
                        e.currentTarget.style.color = colors.oskar.grey;
                        e.currentTarget.style.transform = "translateY(0)";
                      }
                    }}
                    aria-label={`Rechercher ${tag.name}`}
                    type="button"
                  >
                    <i
                      className={`fa-solid ${tag.icon}`}
                      style={{ fontSize: "0.875rem" }}
                    ></i>
                    {tag.name}
                  </button>
                ))}
              </div>

              {/* Aide sur mobile */}
              {isMobile && (
                <div className="text-center mt-3">
                  <small
                    className="text-muted"
                    style={{ fontSize: "0.75rem", opacity: 0.7 }}
                  >
                    <i className="fa-solid fa-info-circle me-1"></i>
                    Balayez horizontalement pour voir plus de catégories
                  </small>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Filtres avancés (optionnel sur desktop) */}
      {!compactMode && !isMobile && (
        <div className="container-fluid px-3 px-sm-4 px-lg-5 mt-4">
          <div className="row g-3 justify-content-center">
            <div className="col-auto">
              <select
                className="form-select"
                style={{
                  minWidth: "140px",
                  borderColor: colors.oskar.lightGrey,
                  fontSize: "0.875rem",
                  padding: "0.5rem 1rem",
                  backgroundColor: "white",
                  color: colors.oskar.black,
                }}
                defaultValue=""
              >
                <option value="">Catégorie</option>
                <option value="electronique">Électronique</option>
                <option value="mode">Mode</option>
                <option value="maison">Maison</option>
                <option value="vehicules">Véhicules</option>
              </select>
            </div>
            <div className="col-auto">
              <select
                className="form-select"
                style={{
                  minWidth: "140px",
                  borderColor: colors.oskar.lightGrey,
                  fontSize: "0.875rem",
                  padding: "0.5rem 1rem",
                  backgroundColor: "white",
                  color: colors.oskar.black,
                }}
                defaultValue=""
              >
                <option value="">Localisation</option>
                <option value="paris">Paris</option>
                <option value="lyon">Lyon</option>
                <option value="marseille">Marseille</option>
              </select>
            </div>
            <div className="col-auto">
              <select
                className="form-select"
                style={{
                  minWidth: "140px",
                  borderColor: colors.oskar.lightGrey,
                  fontSize: "0.875rem",
                  padding: "0.5rem 1rem",
                  backgroundColor: "white",
                  color: colors.oskar.black,
                }}
                defaultValue=""
              >
                <option value="">Prix max</option>
                <option value="50">50€</option>
                <option value="100">100€</option>
                <option value="200">200€</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        /* Animations */
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

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        /* Styles généraux - MODE CLAIR UNIQUEMENT */
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

        #hero-search .position-absolute.bg-white {
          background-color: white !important;
          border-color: ${colors.oskar.lightGrey} !important;
        }

        #hero-search .btn.rounded-pill {
          background-color: ${colors.oskar.lightGrey} !important;
          color: ${colors.oskar.grey} !important;
        }

        #hero-search .btn.rounded-pill:hover {
          background-color: rgba(76, 175, 80, 0.1) !important;
          color: ${colors.oskar.green} !important;
        }

        #hero-search .btn.rounded-pill.active {
          background-color: ${colors.oskar.green} !important;
          color: white !important;
        }

        #hero-search .text-muted {
          color: #6c757d !important;
        }

        #hero-search h1 {
          color: ${colors.oskar.black} !important;
        }

        #hero-search .btn[aria-label="Effacer la recherche"] {
          background-color: transparent !important;
        }

        #hero-search .form-select {
          background-color: white !important;
          color: ${colors.oskar.black} !important;
          border-color: ${colors.oskar.lightGrey} !important;
        }

        #hero-search .form-select:focus {
          border-color: ${colors.oskar.green} !important;
        }

        /* Scrollbar personnalisée pour les suggestions */
        #hero-search .position-absolute::-webkit-scrollbar {
          width: 6px;
        }

        #hero-search .position-absolute::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 0 0 12px 12px;
        }

        #hero-search .position-absolute::-webkit-scrollbar-thumb {
          background: ${colors.oskar.lightGrey};
          border-radius: 3px;
        }

        #hero-search .position-absolute::-webkit-scrollbar-thumb:hover {
          background: ${colors.oskar.grey};
        }

        /* Améliorations pour le touch sur mobile */
        @media (max-width: 768px) {
          #hero-search button,
          #hero-search .btn {
            min-height: 44px;
            min-width: 44px;
            touch-action: manipulation;
          }

          #hero-search .form-control {
            font-size: 16px !important; /* Empêche le zoom sur iOS */
          }

          /* Scroll horizontal pour les tags sur mobile */
          #hero-search .d-flex.flex-wrap {
            overflow-x: auto;
            flex-wrap: nowrap !important;
            justify-content: flex-start !important;
            padding-bottom: 0.5rem;
            scrollbar-width: none;
          }

          #hero-search .d-flex.flex-wrap::-webkit-scrollbar {
            display: none;
          }

          #hero-search .d-flex.flex-wrap .btn {
            flex-shrink: 0;
          }
        }

        /* Support pour les très petits écrans */
        @media (max-width: 360px) {
          #hero-search h1 {
            font-size: 1.5rem !important;
          }

          #hero-search .form-control {
            padding-right: 3rem !important;
            font-size: 0.9375rem !important;
          }

          #hero-search .btn[aria-label="Lancer la recherche"] {
            padding: 0.375rem 0.75rem !important;
          }
        }

        /* Support pour les écrans larges */
        @media (min-width: 1400px) {
          #hero-search .container-fluid {
            max-width: 1320px;
            margin: 0 auto;
          }
        }

        @media (min-width: 1600px) {
          #hero-search .container-fluid {
            max-width: 1520px;
          }
        }

        /* Animation pour le bouton de recherche */
        #hero-search .btn[aria-label="Lancer la recherche"]:hover i {
          animation: pulse 0.5s ease;
        }

        /* Transition fluide pour tous les éléments */
        #hero-search * {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        /* Amélioration de l'accessibilité */
        #hero-search button:focus-visible {
          outline: 2px solid ${colors.oskar.green} !important;
          outline-offset: 2px !important;
        }

        /* Optimisation des performances */
        #hero-search {
          will-change: transform, opacity;
          contain: layout style paint;
        }
      `}</style>
    </section>
  );
};

// Version compacte pour l'intégration dans d'autres composants
export const CompactSearch: React.FC<Partial<HeroSearchProps>> = (props) => (
  <HeroSearch compactMode={true} showPopularSearches={false} {...props} />
);

export default HeroSearch;
