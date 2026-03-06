// app/(front-office)/contexts/SearchContext.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedCategoryUuid: string;
  setSelectedCategoryUuid: (uuid: string) => void;
  selectedSousCategorie: string;
  setSelectedSousCategorie: (sousCategorie: string) => void;
  selectedSousCategorieLibelle: string;
  setSelectedSousCategorieLibelle: (libelle: string) => void;
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  maxPrice: string;
  setMaxPrice: (price: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCategoryUuid, setSelectedCategoryUuid] = useState("");
  const [selectedSousCategorie, setSelectedSousCategorie] = useState("");
  const [selectedSousCategorieLibelle, setSelectedSousCategorieLibelle] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Pour déboguer
  console.log("🔵 SearchContext - État actuel:", {
    searchQuery,
    selectedCategory,
    selectedCategoryUuid,
    selectedSousCategorie,
    selectedSousCategorieLibelle,
    selectedLocation,
    maxPrice
  });

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedCategoryUuid,
        setSelectedCategoryUuid,
        selectedSousCategorie,
        setSelectedSousCategorie,
        selectedSousCategorieLibelle,
        setSelectedSousCategorieLibelle,
        selectedLocation,
        setSelectedLocation,
        maxPrice,
        setMaxPrice,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};