// app/(front-office)/categories/hooks/useCategoryItems.ts

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { CategoryItem, CategoryItemsResponse } from "../components/types";

interface UseCategoryItemsProps {
  categoryUuid: string;
  isSubCategory?: boolean;
  filterType?: "all" | "don" | "echange" | "produit";
  sortOption?: string;
  searchQuery?: string;
  location?: string;
  maxPrice?: string;
}

export const useCategoryItems = ({
  categoryUuid,
  isSubCategory = false,
  filterType = "all",
  sortOption = "recent",
  searchQuery = "",
  location = "",
  maxPrice = "",
}: UseCategoryItemsProps) => {
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalDons: 0,
    totalEchanges: 0,
    totalProduits: 0,
    totalItems: 0,
  });

  const fetchItems = useCallback(async () => {
    if (!categoryUuid) return;

    setLoading(true);
    setError(null);

    try {
      console.log(`📦 Chargement des items pour ${isSubCategory ? 'sous-catégorie' : 'catégorie'}: ${categoryUuid}`);

      let response: any;
      let allItems: CategoryItem[] = [];

      // ============================================
      // STRATÉGIE DE CHARGEMENT SELON LE TYPE
      // ============================================
      
      // 1. Si c'est une sous-catégorie, utiliser l' endpoint spécifique
      if (isSubCategory) {
        // Endpoint pour toutes les annonces d'une sous-catégorie
        response = await api.get(API_ENDPOINTS.CATEGORIES.LISTE_SOUS_CATEGORIE(categoryUuid));
        
        if (response.data?.annonces) {
          // Format: { dons: [], echanges: [], produits: [] }
          allItems = [
            ...(response.data.annonces.dons || []).map((d: any) => ({ ...d, type: "don" })),
            ...(response.data.annonces.echanges || []).map((e: any) => ({ ...e, type: "echange" })),
            ...(response.data.annonces.produits || []).map((p: any) => ({ ...p, type: "produit" })),
          ];
          
          // Mettre à jour les stats
          if (response.data.stats) {
            setStats({
              totalDons: response.data.stats.totalDons || 0,
              totalEchanges: response.data.stats.totalEchanges || 0,
              totalProduits: response.data.stats.totalProduits || 0,
              totalItems: response.data.stats.totalAnnonces || allItems.length,
            });
          }
        }
      } 
      // 2. Pour une catégorie principale, utiliser l'endpoint /annonces
      else {
        response = await api.get(API_ENDPOINTS.CATEGORIES.ANNONCES(categoryUuid));
        
        // La réponse contient un tableau "annonces" avec tous les types mélangés
        if (response.annonces && Array.isArray(response.annonces)) {
          allItems = response.annonces.map((item: any) => ({
            ...item,
            type: item.type || (item.nom ? "produit" : item.titre ? "echange" : "don")
          }));
        }
      }

      // Si on a des items via d'autres moyens
      if (response.produits || response.dons || response.echanges) {
        allItems = [
          ...(response.produits || []).map((p: any) => ({ ...p, type: "produit" })),
          ...(response.dons || []).map((d: any) => ({ ...d, type: "don" })),
          ...(response.echanges || []).map((e: any) => ({ ...e, type: "echange" })),
        ];
      }

      // ============================================
      // FILTRAGE PAR TYPE
      // ============================================
      let filteredItems = [...allItems];
      
      if (filterType !== "all") {
        filteredItems = filteredItems.filter(item => item.type === filterType);
      }

      // ============================================
      // FILTRES DE RECHERCHE
      // ============================================
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredItems = filteredItems.filter(item => 
          item.titre?.toLowerCase().includes(query) ||
          item.nom?.toLowerCase().includes(query) ||
          item.libelle?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
        );
      }

      if (location) {
        const loc = location.toLowerCase();
        filteredItems = filteredItems.filter(item => 
          item.localisation?.toLowerCase().includes(loc)
        );
      }

      if (maxPrice) {
        const max = parseFloat(maxPrice);
        filteredItems = filteredItems.filter(item => {
          const price = item.prix ? parseFloat(item.prix.toString()) : 0;
          return price <= max;
        });
      }

      // ============================================
      // TRI
      // ============================================
      filteredItems.sort((a, b) => {
        switch (sortOption) {
          case "price-asc":
            return (parseFloat(a.prix?.toString() || "0")) - (parseFloat(b.prix?.toString() || "0"));
          case "price-desc":
            return (parseFloat(b.prix?.toString() || "0")) - (parseFloat(a.prix?.toString() || "0"));
          case "recent":
          default:
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;
            return dateB - dateA;
        }
      });

      console.log(`✅ ${filteredItems.length} items chargés pour la catégorie`);
      setItems(filteredItems);

      // Mettre à jour les stats si pas déjà fait
      if (!response.data?.stats) {
        setStats({
          totalDons: allItems.filter(i => i.type === "don").length,
          totalEchanges: allItems.filter(i => i.type === "echange").length,
          totalProduits: allItems.filter(i => i.type === "produit").length,
          totalItems: allItems.length,
        });
      }

    } catch (err: any) {
      console.error("❌ Erreur chargement items catégorie:", err);
      setError(err.message || "Erreur lors du chargement des annonces");
    } finally {
      setLoading(false);
    }
  }, [categoryUuid, isSubCategory, filterType, sortOption, searchQuery, location, maxPrice]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    items,
    loading,
    error,
    stats,
    refetch: fetchItems,
  };
};