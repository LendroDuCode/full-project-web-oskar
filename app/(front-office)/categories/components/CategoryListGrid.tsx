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
  isSubCategory = false,
  filterType = "all",
  viewMode = "grid",
  sortOption = "recent",
  onDataLoaded,
}) => {
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

  // Récupérer les filtres de recherche depuis le contexte
  const { searchQuery, selectedLocation, maxPrice } = useSearch();

  // ============================================
  // FONCTION DE TRANSFORMATION DES DONNÉES
  // ============================================
  const transformItem = (item: any, type: "produit" | "don" | "echange"): ListingItem => {
    // Récupérer l'UUID de la catégorie de différentes manières
    const categorieUuid = 
      item.categorie_uuid || 
      item.categorie?.uuid || 
      item.categorieId ||
      item.category_uuid ||
      item.category?.uuid;
    
    const categorieLibelle = 
      item.categorie_libelle ||
      item.categorie?.libelle ||
      item.category?.libelle ||
      item.categorie?.nom ||
      "";

    return {
      uuid: item.uuid,
      type,
      titre: item.titre || item.nom || item.libelle || item.nomElementEchange || "Sans titre",
      nom: item.nom,
      libelle: item.libelle,
      description: item.description || item.message,
      prix: item.prix,
      image: item.image || item.image_key || item.images?.[0] || "",
      date: item.date || item.createdAt || item.publieLe || item.dateProposition || item.date_debut,
      disponible: item.disponible !== false,
      statut: item.statut || item.status,
      numero: item.numero || item.telephone,
      localisation: item.localisation || item.ville || item.lieu_retrait || item.lieu_rencontre || "",
      createdAt: item.createdAt,
      categorie_uuid: categorieUuid,
      categorie_libelle: categorieLibelle,
      seller: item.createurDetails ? {
        name: item.createurDetails.nom || "Annonceur",
        avatar: item.createurDetails.avatar,
      } : item.createur ? {
        name: `${item.createur.prenoms || ""} ${item.createur.nom || ""}`.trim() || "Annonceur",
        avatar: item.createur.avatar,
      } : item.vendeur ? {
        name: `${item.vendeur.prenoms || ""} ${item.vendeur.nom || ""}`.trim() || "Vendeur",
        avatar: item.vendeur.avatar,
      } : item.utilisateur ? {
        name: `${item.utilisateur.prenoms || ""} ${item.utilisateur.nom || ""}`.trim() || "Utilisateur",
        avatar: item.utilisateur.avatar,
      } : undefined,
    };
  };

  // ============================================
  // FONCTION DE CHARGEMENT AVEC GESTION ROBUSTE DES ENDPOINTS
  // ============================================
  const fetchCategoryItems = useCallback(async () => {
    if (!categoryUuid) return;

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

      let allItems: ListingItem[] = [];

      // ============================================
      // STRATÉGIE: UTILISER LES ENDPOINTS QUI FONCTIONNENT (d'après vos logs)
      // ============================================
      
      // L'endpoint CATEGORIES.ANNONCES fonctionne (status 200 dans vos logs)
      try {
        console.log("📦 Tentative avec CATEGORIES.ANNONCES");
        const response = await api.get(API_ENDPOINTS.CATEGORIES.ANNONCES(categoryUuid));
        
        if (response.annonces && Array.isArray(response.annonces)) {
          // Transformer toutes les annonces
          allItems = response.annonces.map((item: any) => {
            let type: "produit" | "don" | "echange" = "produit";
            if (item.type === "don" || item.type_don) type = "don";
            else if (item.type === "echange" || item.type_echange) type = "echange";
            return transformItem(item, type);
          });
          
          console.log(`✅ ${allItems.length} items trouvés via ANNONCES`);
        }
      } catch (error) {
        console.warn("⚠️ Endpoint ANNONCES a échoué, essai des endpoints spécifiques");
        
        // Fallback: essayer les endpoints spécifiques selon le type
        try {
          if (filterType === "all" || filterType === "don") {
            const donRes = await api.get(API_ENDPOINTS.CATEGORIES.DONS(categoryUuid));
            if (donRes.dons && Array.isArray(donRes.dons)) {
              const dons = donRes.dons.map((item: any) => transformItem(item, "don"));
              allItems.push(...dons);
            }
          }
          
          if (filterType === "all" || filterType === "produit") {
            const produitRes = await api.get(API_ENDPOINTS.CATEGORIES.PRODUITS(categoryUuid));
            if (produitRes.produits && Array.isArray(produitRes.produits)) {
              const produits = produitRes.produits.map((item: any) => transformItem(item, "produit"));
              allItems.push(...produits);
            }
          }
          
          if (filterType === "all" || filterType === "echange") {
            const echangeRes = await api.get(API_ENDPOINTS.CATEGORIES.ECHANGES(categoryUuid));
            if (echangeRes.echanges && Array.isArray(echangeRes.echanges)) {
              const echanges = echangeRes.echanges.map((item: any) => transformItem(item, "echange"));
              allItems.push(...echanges);
            }
          }
        } catch (fallbackError) {
          console.error("❌ Tous les endpoints ont échoué:", fallbackError);
        }
      }

      console.log(`📊 Total: ${allItems.length} items pour la catégorie ${categoryUuid}`);

      // ============================================
      // FILTRES DE RECHERCHE
      // ============================================
      let filteredItems = [...allItems];

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
  }, [categoryUuid, filterType]);

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

    window.addEventListener('category-filter-changed', handleFilterChange);
    window.addEventListener('category-sort-changed', handleFilterChange);
    window.addEventListener('category-filters-updated', handleFilterChange);

    // Nettoyage
    return () => {
      window.removeEventListener('category-filter-changed', handleFilterChange);
      window.removeEventListener('category-sort-changed', handleFilterChange);
      window.removeEventListener('category-filters-updated', handleFilterChange);
      
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
      <div className="d-flex flex-column justify-content-center align-items-center py-5 min-vh-50">
        <div
          className="spinner-border mb-3"
          style={{ color: colors.oskar.green, width: "3rem", height: "3rem" }}
          role="status"
        >
          <span className="visually-hidden">Chargement...</span>
        </div>
        <span className="text-muted">Chargement des annonces...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-3 d-flex align-items-center justify-content-between rounded-3">
        <div className="d-flex align-items-center gap-2">
          <FontAwesomeIcon icon={faExclamationTriangle} className="fa-lg" />
          <span>{error}</span>
        </div>
        <button
          className="btn btn-outline-danger btn-sm rounded-pill px-3"
          onClick={handleRefresh}
        >
          <FontAwesomeIcon icon={faRotate} className="me-1" />
          Réessayer
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="mb-4">
          <FontAwesomeIcon 
            icon={faBoxOpen} 
            className="fa-4x" 
            style={{ color: colors.oskar.green + '40' }}
          />
        </div>
        <h5 className="text-dark mb-2">Aucune annonce trouvée</h5>
        <p className="text-muted mb-4" style={{ maxWidth: "400px", margin: "0 auto" }}>
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
            border: 'none'
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
        <div className="row g-4">
          {items.map((item) => (
            <div key={item.uuid} className="col-xl-4 col-lg-6 col-md-6">
              <ListingCard listing={item} viewMode="grid" />
            </div>
          ))}
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {items.map((item) => (
            <ListingCard key={item.uuid} listing={item} viewMode="list" />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryListGrid;