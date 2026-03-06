// app/(front-office)/categories/components/CategoryListGrid.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import ListingCard from "../../home/components/ListingCard";
import { useSearch } from "../../home/contexts/SearchContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInbox,
  faRotate,
  faExclamationTriangle,
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
  categorie_uuid?: string; // Pour le filtrage
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
    // Récupérer l'UUID de la catégorie
    const categorieUuid = item.categorie_uuid || item.categorie?.uuid;
    
    return {
      uuid: item.uuid,
      type,
      titre: item.titre || item.nom || item.libelle || item.nomElementEchange || "Sans titre",
      nom: item.nom,
      libelle: item.libelle,
      description: item.description || item.message,
      prix: item.prix,
      image: item.image || item.image_key || "",
      date: item.date || item.createdAt || item.publieLe || item.dateProposition || item.date_debut,
      disponible: item.disponible !== false,
      statut: item.statut || item.status,
      numero: item.numero || item.telephone,
      localisation: item.localisation || item.ville || item.lieu_retrait || item.lieu_rencontre || "",
      createdAt: item.createdAt,
      categorie_uuid: categorieUuid, // 🔥 GARDER POUR FILTRAGE
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
  // FONCTION DE CHARGEMENT AVEC FILTRAGE PAR CATÉGORIE
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
      // STRATÉGIE 1: SOUS-CATÉGORIE (vos endpoints fonctionnent bien)
      // ============================================
      if (isSubCategory) {
        if (filterType === "all") {
          console.log("📦 Chargement de tous les types pour sous-catégorie");
          
          // Charger les 3 types en parallèle
          const [donsRes, produitsRes, echangesRes] = await Promise.allSettled([
            api.get(API_ENDPOINTS.CATEGORIES.RECUPERER_LISTE_DON_UUID_SOUS_CATEGORIES(categoryUuid)),
            api.get(API_ENDPOINTS.CATEGORIES.RECUPERER_LISTE_PRODUIT_UUID_SOUS_CATEGORIES(categoryUuid)),
            api.get(API_ENDPOINTS.CATEGORIES.RECUPERER_LISTE_ECHANGE_UUID_SOUS_CATEGORIES(categoryUuid)),
          ]);

          // Traiter les dons
          if (donsRes.status === 'fulfilled' && donsRes.value.data?.items) {
            const dons = donsRes.value.data.items.map((item: any) => transformItem(item, "don"));
            allItems.push(...dons);
            console.log(`✅ ${dons.length} dons trouvés`);
          }

          // Traiter les produits
          if (produitsRes.status === 'fulfilled' && produitsRes.value.data?.items) {
            const produits = produitsRes.value.data.items.map((item: any) => transformItem(item, "produit"));
            allItems.push(...produits);
            console.log(`✅ ${produits.length} produits trouvés`);
          }

          // Traiter les échanges
          if (echangesRes.status === 'fulfilled' && echangesRes.value.data?.items) {
            const echanges = echangesRes.value.data.items.map((item: any) => transformItem(item, "echange"));
            allItems.push(...echanges);
            console.log(`✅ ${echanges.length} échanges trouvés`);
          }
        } 
        else if (filterType === "don") {
          const response = await api.get(API_ENDPOINTS.CATEGORIES.RECUPERER_LISTE_DON_UUID_SOUS_CATEGORIES(categoryUuid));
          if (response.data?.items) {
            allItems = response.data.items.map((item: any) => transformItem(item, "don"));
          }
        }
        else if (filterType === "produit") {
          const response = await api.get(API_ENDPOINTS.CATEGORIES.RECUPERER_LISTE_PRODUIT_UUID_SOUS_CATEGORIES(categoryUuid));
          if (response.data?.items) {
            allItems = response.data.items.map((item: any) => transformItem(item, "produit"));
          }
        }
        else if (filterType === "echange") {
          const response = await api.get(API_ENDPOINTS.CATEGORIES.RECUPERER_LISTE_ECHANGE_UUID_SOUS_CATEGORIES(categoryUuid));
          if (response.data?.items) {
            allItems = response.data.items.map((item: any) => transformItem(item, "echange"));
          }
        }
      } 
      // ============================================
      // STRATÉGIE 2: CATÉGORIE PRINCIPALE - AVEC FILTRAGE
      // ============================================
      else {
        if (filterType === "all") {
          console.log("📦 Chargement via ANNONCES pour catégorie principale");
          const response = await api.get(API_ENDPOINTS.CATEGORIES.ANNONCES(categoryUuid));
          
          if (response.annonces && Array.isArray(response.annonces)) {
            console.log(`📊 ${response.annonces.length} annonces reçues de l'API`);
            
            // 🔥 FILTRER POUR GARDER UNIQUEMENT LES ANNONCES DE CETTE CATÉGORIE
            const annoncesDeLaCategorie = response.annonces.filter((item: any) => {
              // Vérifier si l'annonce appartient à cette catégorie
              const itemCategorieUuid = item.categorie_uuid || item.categorie?.uuid;
              const appartient = itemCategorieUuid === categoryUuid;
              
              if (!appartient) {
                console.log(`🗑️ Annonce ${item.uuid} filtrée - catégorie ${itemCategorieUuid} ≠ ${categoryUuid}`);
              }
              
              return appartient;
            });

            console.log(`✅ ${annoncesDeLaCategorie.length} annonces pour cette catégorie après filtrage`);

            allItems = annoncesDeLaCategorie.map((item: any) => {
              // Déterminer le type
              let type: "produit" | "don" | "echange" = "produit";
              if (item.type === "don" || item.type_don) type = "don";
              else if (item.type === "echange" || item.type_echange) type = "echange";
              return transformItem(item, type);
            });
          } else {
            console.warn("⚠️ Format de réponse inattendu pour ANNONCES:", response);
          }
        } 
        else if (filterType === "don") {
          const response = await api.get(API_ENDPOINTS.CATEGORIES.DONS(categoryUuid));
          if (response.dons && Array.isArray(response.dons)) {
            allItems = response.dons.map((item: any) => transformItem(item, "don"));
          }
        }
        else if (filterType === "produit") {
          const response = await api.get(API_ENDPOINTS.CATEGORIES.PRODUITS(categoryUuid));
          if (response.produits && Array.isArray(response.produits)) {
            allItems = response.produits.map((item: any) => transformItem(item, "produit"));
          }
        }
        else if (filterType === "echange") {
          const response = await api.get(API_ENDPOINTS.CATEGORIES.ECHANGES(categoryUuid));
          if (response.echanges && Array.isArray(response.echanges)) {
            allItems = response.echanges.map((item: any) => transformItem(item, "echange"));
          }
        }
      }

      console.log(`📊 ${allItems.length} items pour la catégorie ${categoryUuid}`);

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
      console.log(`✅ ${filteredItems.length} items après filtres`);

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

  // ✅ CHARGEMENT INITIAL - UNE SEULE FOIS
  useEffect(() => {
    fetchedRef.current = false;
  }, [categoryUuid, filterType, sortOption, searchQuery, selectedLocation, maxPrice]);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchCategoryItems();
    }

    // Nettoyage
    return () => {
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
      <div className="d-flex flex-column justify-content-center align-items-center py-5">
        <div
          className="spinner-border text-success mb-3"
          role="status"
          style={{ width: "3rem", height: "3rem" }}
        >
          <span className="visually-hidden">Chargement...</span>
        </div>
        <span className="text-muted">Chargement des annonces...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-3 d-flex align-items-center justify-content-between">
        <div>
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          <span>{error}</span>
        </div>
        <button
          className="btn btn-outline-danger btn-sm"
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
        <div className="mb-3">
          <FontAwesomeIcon icon={faInbox} className="fa-3x text-muted" />
        </div>
        <h5 className="text-muted mb-2">Aucune annonce trouvée</h5>
        <p className="text-muted mb-4">
          {searchQuery || selectedLocation || maxPrice ? (
            "Aucun résultat ne correspond à vos critères de recherche."
          ) : filterType === "all" ? (
            isSubCategory 
              ? "Aucune annonce n'est disponible dans cette sous-catégorie."
              : "Aucune annonce n'est disponible dans cette catégorie."
          ) : (
            `Aucun ${filterType === "don" ? "don" : filterType === "echange" ? "échange" : "produit"} n'est disponible.`
          )}
        </p>
        <button className="btn btn-success" onClick={handleRefresh}>
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
            <div key={item.uuid} className="col-lg-4 col-md-6">
              <ListingCard listing={item} viewMode="grid" />
            </div>
          ))}
        </div>
      ) : (
        <div className="list-view-container">
          {items.map((item) => (
            <ListingCard key={item.uuid} listing={item} viewMode="list" />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryListGrid;