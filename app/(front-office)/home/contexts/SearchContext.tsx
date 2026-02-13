// app/(front-office)/home/contexts/SearchContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

export interface SousCategorie {
  uuid: string;
  libelle: string;
  slug: string;
  type: string;
  parent_uuid: string;
  parent_libelle?: string;
  image?: string | null;
  statut?: string;
}

interface SearchHistoryItem {
  query: string;
  timestamp: Date;
  filters?: {
    category?: string;
    sousCategorie?: string;
    location?: string;
    maxPrice?: string;
  };
}

interface SearchContextType {
  // États existants
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedSousCategorie: string;
  setSelectedSousCategorie: (sousCategorie: string) => void;
  selectedSousCategorieLibelle: string;
  setSelectedSousCategorieLibelle: (libelle: string) => void;
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  maxPrice: string;
  setMaxPrice: (price: string) => void;
  activeTag: string | null;
  setActiveTag: (tag: string | null) => void;

  // Sous-catégories
  sousCategories: SousCategorie[];
  setSousCategories: (categories: SousCategorie[]) => void;
  loadingSousCategories: boolean;
  setLoadingSousCategories: (loading: boolean) => void;

  // Historique
  searchHistory: SearchHistoryItem[];
  addToHistory: (item: SearchHistoryItem) => void;
  clearHistory: () => void;

  // Filtres actifs
  hasActiveFilters: boolean;
  resetAllFilters: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  // États de recherche
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSousCategorie, setSelectedSousCategorie] = useState("");
  const [selectedSousCategorieLibelle, setSelectedSousCategorieLibelle] =
    useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // États sous-catégories
  const [sousCategories, setSousCategories] = useState<SousCategorie[]>([]);
  const [loadingSousCategories, setLoadingSousCategories] = useState(false);

  // Historique de recherche
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);

  // Charger l'historique depuis localStorage au montage
  useEffect(() => {
    const savedHistory = localStorage.getItem("oskar_search_history");
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setSearchHistory(
          parsed.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp),
          })),
        );
      } catch (e) {
        console.error("Erreur chargement historique:", e);
      }
    }
  }, []);

  // Ajouter à l'historique
  const addToHistory = (item: SearchHistoryItem) => {
    setSearchHistory((prev) => {
      // Garder seulement les 10 dernières recherches uniques
      const filtered = prev.filter((h) => h.query !== item.query);
      const newHistory = [item, ...filtered].slice(0, 10);

      // Sauvegarder dans localStorage
      localStorage.setItem("oskar_search_history", JSON.stringify(newHistory));

      return newHistory;
    });
  };

  // Effacer l'historique
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("oskar_search_history");
  };

  // Réinitialiser tous les filtres
  const resetAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedSousCategorie("");
    setSelectedSousCategorieLibelle("");
    setSelectedLocation("");
    setMaxPrice("");
    setActiveTag(null);
  };

  // Vérifier si des filtres sont actifs
  const hasActiveFilters = !!(
    searchQuery ||
    selectedCategory ||
    selectedSousCategorie ||
    selectedLocation ||
    maxPrice
  );

  return (
    <SearchContext.Provider
      value={{
        // États recherche
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

        // Sous-catégories
        sousCategories,
        setSousCategories,
        loadingSousCategories,
        setLoadingSousCategories,

        // Historique
        searchHistory,
        addToHistory,
        clearHistory,

        // Filtres
        hasActiveFilters,
        resetAllFilters,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}
