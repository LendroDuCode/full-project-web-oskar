"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import ListingCard from "../../home/components/ListingCard";
import { useSearch } from "../../home/contexts/SearchContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import colors from "@/app/shared/constants/colors";
import {
  faInbox,
  faRotate,
  faExclamationTriangle,
  faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";

interface CategoryListGridProps {
  categoryUuid: string;
  categorySlug?: string;
  parentSlug?: string;
  isSubCategory?: boolean;
  filterType?: "all" | "don" | "echange" | "produit";
  viewMode?: "grid" | "list";
  sortOption?: string;
  onDataLoaded?: (stats: { total: number; dons: number; echanges: number; produits: number }) => void;
}

interface ListingItem {
  uuid: string;
  type: "produit" | "echange" | "don";
  titre?: string;
  nom?: string;
  libelle?: string;
  description?: string | null;
  prix?: number | string | null;
  image: string;
  date?: string | null | undefined;
  disponible?: boolean;
  statut?: string;
  numero?: string;
  localisation?: string;
  createdAt?: string | null | undefined;
  is_favoris?: boolean;
  seller?: {
    name: string;
    avatar: string;
  };
  categorie_uuid?: string;
  categorie_libelle?: string;
}

const CategoryListGrid: React.FC<CategoryListGridProps> = ({
  categoryUuid,
  categorySlug,
  parentSlug,
  isSubCategory = false,
  filterType = "all",
  viewMode = "grid",
  sortOption = "recent",
  onDataLoaded,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [items, setItems] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalDons: 0,
    totalEchanges: 0,
    totalProduits: 0,
    totalItems: 0,
  });
  
  const fetchedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Détection de l'écran mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Récupérer les filtres de recherche depuis le contexte
  const { searchQuery, selectedLocation, maxPrice } = useSearch();

  // ============================================
  // FONCTION DE TRANSFORMATION DES DONNÉES
  // ============================================
  const transformItem = (item: any, type: "produit" | "don" | "echange"): ListingItem => {
    return {
      uuid: item.uuid,
      type,
      titre: item.nom || item.libelle || item.nomElementEchange || item.titre || "Sans titre",
      nom: item.nom,
      libelle: item.libelle,
      description: item.description || item.message,
      prix: item.prix,
      image: item.image || item.image_key || item.images?.[0] || "",
      date: item.date || item.createdAt || item.publieLe || item.dateProposition || item.date_debut || item.dateCreation,
      disponible: item.disponible !== false,
      statut: item.statut || item.status,
      numero: item.numero || item.telephone,
      localisation: item.localisation || item.ville || item.lieu_retrait || item.lieu_rencontre || "",
      createdAt: item.createdAt || item.dateCreation,
      categorie_uuid: item.categorie_uuid || item.categorieUuid,
      categorie_libelle: item.categorie_libelle || "",
      seller: item.vendeur ? {
        name: `${item.vendeur.prenoms || ""} ${item.vendeur.nom || ""}`.trim() || "Vendeur",
        avatar: item.vendeur.avatar,
      } : item.utilisateur ? {
        name: `${item.utilisateur.prenoms || ""} ${item.utilisateur.nom || ""}`.trim() || "Utilisateur",
        avatar: item.utilisateur.avatar,
      } : undefined,
    };
  };

  // ============================================
  // FONCTION DE CHARGEMENT CORRIGÉE
  // ============================================
  const fetchCategoryItems = useCallback(async () => {
    if (!categoryUuid) {
      console.error("❌ categoryUuid est manquant");
      return;
    }

    // Annuler la requête précédente si elle existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Créer un nouveau controller
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      console.log(`📦 Chargement pour ${isSubCategory ? 'sous-catégorie' : 'catégorie'} UUID: ${categoryUuid}`);
      console.log(`🔍 Filtre type: ${filterType}`);
      console.log(`🔍 Slug: ${categorySlug}, ParentSlug: ${parentSlug}`);

      let allItems: ListingItem[] = [];
      let response: any = null;

      // ============================================
      // CHOISIR LE BON ENDPOINT SELON LE CONTEXTE
      // ============================================
      
      if (isSubCategory && parentSlug && categorySlug) {
        // C'est une sous-catégorie - utiliser l'endpoint spécifique
        console.log(`📦 Sous-catégorie: ${parentSlug}/${categorySlug}`);
        const url = `/categories/${parentSlug}/sous-categories/${categorySlug}/elements-simples?limit=100`;
        response = await api.get(url);
        console.log("✅ Réponse sous-catégorie:", response);
        
        if (response?.success && response?.data) {
          const data = response.data;
          
          // Extraire les éléments selon la structure de l'API
          if (data.elements) {
            // Structure: { elements: { dons: [...], echanges: [...], produits: [...] } }
            if (data.elements.dons && Array.isArray(data.elements.dons)) {
              allItems.push(...data.elements.dons.map((item: any) => transformItem(item, "don")));
            }
            if (data.elements.echanges && Array.isArray(data.elements.echanges)) {
              allItems.push(...data.elements.echanges.map((item: any) => transformItem(item, "echange")));
            }
            if (data.elements.produits && Array.isArray(data.elements.produits)) {
              allItems.push(...data.elements.produits.map((item: any) => transformItem(item, "produit")));
            }
          }
        }
      } else if (categorySlug) {
        // Catégorie principale avec slug
        console.log(`📦 Catégorie par slug: ${categorySlug}`);
        const url = `/categories/by-slug/${categorySlug}/tous-elements`;
        response = await api.get(url);
        console.log("✅ Réponse catégorie par slug:", response);
        
        if (response?.success && response?.data) {
          const data = response.data;
          
          // Structure: { dons: { count, items }, echanges: { count, items }, produits: { count, items } }
          if (data.dons?.items && Array.isArray(data.dons.items)) {
            allItems.push(...data.dons.items.map((item: any) => transformItem(item, "don")));
          }
          if (data.echanges?.items && Array.isArray(data.echanges.items)) {
            allItems.push(...data.echanges.items.map((item: any) => transformItem(item, "echange")));
          }
          if (data.produits?.items && Array.isArray(data.produits.items)) {
            allItems.push(...data.produits.items.map((item: any) => transformItem(item, "produit")));
          }
        }
      } else {
        // Fallback: utiliser l'UUID
        console.log(`📦 Chargement par UUID: ${categoryUuid}`);
        response = await api.get(API_ENDPOINTS.CATEGORIES.ANNONCES(categoryUuid));
        console.log("✅ Réponse par UUID:", response);
        
        if (response?.data) {
          const data = response.data;
          
          if (data.dons?.items && Array.isArray(data.dons.items)) {
            allItems.push(...data.dons.items.map((item: any) => transformItem(item, "don")));
          }
          if (data.echanges?.items && Array.isArray(data.echanges.items)) {
            allItems.push(...data.echanges.items.map((item: any) => transformItem(item, "echange")));
          }
          if (data.produits?.items && Array.isArray(data.produits.items)) {
            allItems.push(...data.produits.items.map((item: any) => transformItem(item, "produit")));
          }
        }
      }

      console.log(`📊 Total items chargés: ${allItems.length}`);

      // Filtrer selon le type si nécessaire
      let filteredByType = allItems;
      if (filterType !== "all") {
        filteredByType = allItems.filter(item => item.type === filterType);
      }

      // ============================================
      // FILTRES DE RECHERCHE
      // ============================================
      let filteredItems = [...filteredByType];

      // Filtre texte
      if (searchQuery) {
        const query = searchQuery.toLowerCase().trim();
        filteredItems = filteredItems.filter(item => 
          item.titre?.toLowerCase().includes(query) ||
          item.nom?.toLowerCase().includes(query) ||
          item.libelle?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
        );
      }

      // Filtre localisation
      if (selectedLocation) {
        const loc = selectedLocation.toLowerCase().trim();
        filteredItems = filteredItems.filter(item => 
          item.localisation?.toLowerCase().includes(loc)
        );
      }

      // Filtre prix max
      if (maxPrice) {
        const max = parseFloat(maxPrice);
        filteredItems = filteredItems.filter(item => {
          const price = item.prix ? parseFloat(item.prix.toString()) : 0;
          return price <= max || price === 0;
        });
      }

      // ============================================
      // TRI
      // ============================================
      filteredItems.sort((a, b) => {
        switch (sortOption) {
          case "price-asc": {
            const priceA = a.prix ? parseFloat(a.prix.toString()) : 0;
            const priceB = b.prix ? parseFloat(b.prix.toString()) : 0;
            return priceA - priceB;
          }
          case "price-desc": {
            const priceA = a.prix ? parseFloat(a.prix.toString()) : 0;
            const priceB = b.prix ? parseFloat(b.prix.toString()) : 0;
            return priceB - priceA;
          }
          case "recent":
          default: {
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;
            return dateB - dateA;
          }
        }
      });

      // ============================================
      // STATISTIQUES
      // ============================================
      const donsCount = allItems.filter(i => i.type === "don").length;
      const produitsCount = allItems.filter(i => i.type === "produit").length;
      const echangesCount = allItems.filter(i => i.type === "echange").length;

      setStats({
        totalDons: donsCount,
        totalProduits: produitsCount,
        totalEchanges: echangesCount,
        totalItems: allItems.length,
      });

      setItems(filteredItems);

      // Notifier le parent
      if (onDataLoaded) {
        onDataLoaded({
          total: allItems.length,
          dons: donsCount,
          produits: produitsCount,
          echanges: echangesCount,
        });
      }

    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('🛑 Requête annulée');
        return;
      }
      console.error("❌ Erreur chargement catégorie:", err);
      setError(err.message || "Erreur lors du chargement des annonces");
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [
    categoryUuid,
    categorySlug,
    parentSlug,
    isSubCategory,
    filterType, 
    sortOption, 
    searchQuery, 
    selectedLocation, 
    maxPrice, 
    onDataLoaded
  ]);

  // ✅ CHARGEMENT INITIAL
  useEffect(() => {
    fetchedRef.current = false;
  }, [categoryUuid, categorySlug, parentSlug, filterType]);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchCategoryItems();
    }

    // Écouter les événements de filtre
    const handleFilterChange = () => {
      fetchedRef.current = false;
      fetchCategoryItems();
    };

    const handleSortChange = () => {
      fetchedRef.current = false;
      fetchCategoryItems();
    };

    const handleFiltersUpdate = () => {
      fetchedRef.current = false;
      fetchCategoryItems();
    };

    window.addEventListener('category-filter-changed', handleFilterChange);
    window.addEventListener('category-sort-changed', handleSortChange);
    window.addEventListener('category-filters-updated', handleFiltersUpdate);

    // Nettoyage
    return () => {
      window.removeEventListener('category-filter-changed', handleFilterChange);
      window.removeEventListener('category-sort-changed', handleSortChange);
      window.removeEventListener('category-filters-updated', handleFiltersUpdate);
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchCategoryItems]);

  // ✅ FONCTION POUR RAFRAÎCHIR MANUELLEMENT
  const handleRefresh = () => {
    fetchedRef.current = false;
    fetchCategoryItems();
  };

  // États de chargement
  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center py-4 min-vh-50">
        <div
          className="spinner-border mb-2"
          style={{ color: colors.oskar.green, width: isMobile ? "2.5rem" : "3rem", height: isMobile ? "2.5rem" : "3rem" }}
          role="status"
        >
          <span className="visually-hidden">Chargement...</span>
        </div>
        <span className="text-muted" style={{ fontSize: isMobile ? "0.9rem" : "1rem" }}>Chargement des annonces...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-2 d-flex align-items-center justify-content-between rounded-3">
        <div className="d-flex align-items-center gap-2">
          <FontAwesomeIcon icon={faExclamationTriangle} className="fa-lg" />
          <span style={{ fontSize: isMobile ? "0.9rem" : "1rem" }}>{error}</span>
        </div>
        <button
          className="btn btn-outline-danger btn-sm rounded-pill px-3"
          onClick={handleRefresh}
          style={{ fontSize: isMobile ? "0.8rem" : "0.875rem" }}
        >
          <FontAwesomeIcon icon={faRotate} className="me-1" />
          Réessayer
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-4">
        <div className="mb-3">
          <FontAwesomeIcon 
            icon={faBoxOpen} 
            className="fa-3x" 
            style={{ color: colors.oskar.green + '40' }}
          />
        </div>
        <h5 className="text-dark mb-2" style={{ fontSize: isMobile ? "1.1rem" : "1.25rem" }}>Aucune annonce trouvée</h5>
        <p className="text-muted mb-3" style={{ fontSize: isMobile ? "0.85rem" : "0.9rem", maxWidth: "400px", margin: "0 auto" }}>
          {searchQuery || selectedLocation || maxPrice ? (
            "Aucun résultat ne correspond à vos critères de recherche. Essayez de modifier vos filtres."
          ) : filterType === "all" ? (
            isSubCategory 
              ? "Aucune annonce n'est disponible dans cette sous-catégorie pour le moment."
              : "Aucune annonce n'est disponible dans cette catégorie pour le moment."
          ) : (
            `Aucun ${filterType === "don" ? "don" : filterType === "echange" ? "échange" : "produit"} n'est disponible pour le moment.`
          )}
        </p>
        <button 
          className="btn px-4 py-2 rounded-pill"
          style={{ 
            backgroundColor: colors.oskar.green,
            color: 'white',
            border: 'none',
            fontSize: isMobile ? "0.9rem" : "1rem"
          }}
          onClick={handleRefresh}
        >
          <FontAwesomeIcon icon={faRotate} className="me-2" />
          Rafraîchir
        </button>
      </div>
    );
  }

  return (
    <div className="category-listings">
      {viewMode === "grid" ? (
        <div className="row g-2 g-md-3">
          {items.map((item) => (
            <div key={item.uuid} className="col-6 col-md-6 col-lg-4">
              <ListingCard listing={item} viewMode="grid" />
            </div>
          ))}
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {items.map((item) => (
            <ListingCard key={item.uuid} listing={item} viewMode="list" />
          ))}
        </div>
      )}

      <style jsx>{`
        .category-listings {
          width: 100%;
        }
        
        @media (max-width: 576px) {
          .category-listings {
            padding: 0 0.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CategoryListGrid;