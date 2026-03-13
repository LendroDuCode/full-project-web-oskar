"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { api } from "@/lib/api-client";
import { useSearch } from "../contexts/SearchContext";
import ListingCard, { ListingItem } from "./ListingCard";

interface ListingsGridProps {
  categoryUuid?: string;
  filterType?: string;
  viewMode?: "grid" | "list";
  sortOption?: string;
  onDataLoaded?: (count: number) => void;
  showFeatured?: boolean;
}

// ============================================
// FONCTION DE CONSTRUCTION D'URL D'IMAGE ROBUSTE
// ============================================
const buildImageUrl = (imagePath: string | null): string | null => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const filesUrl = process.env.NEXT_PUBLIC_FILES_URL || "/api/files";
  const testUrl = `${apiUrl}${filesUrl}/${imagePath}`;
  console.log({ testUrl });
  return testUrl;
};

const ListingsGrid: React.FC<ListingsGridProps> = ({
  categoryUuid,
  filterType = "all",
  viewMode = "grid",
  sortOption = "recent",
  onDataLoaded,
  showFeatured = true,
}) => {
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // Récupérer les filtres de recherche depuis le contexte
  const { 
    searchQuery, 
    selectedCategory, 
    selectedSousCategorie,
    selectedLocation, 
    maxPrice 
  } = useSearch();

  const MAX_RETRIES = 3;

  const abortCurrentRequest = useCallback(() => {
    if (abortControllerRef.current && isMountedRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch (err) {
        console.log("Abort ignoré (composant démonté)");
      }
      abortControllerRef.current = null;
    }
  }, []);

  const getApiUrl = useCallback((endpoint: string): string => {
    if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
      const useProxy = process.env.NEXT_PUBLIC_USE_PROXY === "true";
      if (useProxy) {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "https://oskar-api.mysonec.pro";
        if (endpoint.startsWith(baseUrl)) {
          const path = endpoint.substring(baseUrl.length);
          return `/api${path}`;
        }
      }
      return endpoint;
    }
    return endpoint;
  }, []);

  // ✅ DÉFINIR fetchListings AVANT de l'utiliser
  const fetchListings = useCallback(async () => {
    abortCurrentRequest();

    if (!isMountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      let endpoint = "";

      // ✅ PRIORITÉ 1: Si une sous-catégorie est sélectionnée, utiliser son API spécifique
      if (selectedSousCategorie) {
        endpoint = API_ENDPOINTS.CATEGORIES.LISTE_SOUS_CATEGORIE_UUI(selectedSousCategorie);
        console.log(`📦 Chargement des annonces pour la sous-catégorie: ${selectedSousCategorie}`);
      }
      // Sinon, utiliser les endpoints standards
      else if (categoryUuid) {
        endpoint = API_ENDPOINTS.ANNONCES.LIST_TOUTES_ANNONCES;
      } else {
        switch (filterType) {
          case "donation":
            endpoint = API_ENDPOINTS.DONS.PUBLISHED;
            break;
          case "exchange":
            endpoint = API_ENDPOINTS.ECHANGES.PUBLISHED;
            break;
          case "sale":
            endpoint = API_ENDPOINTS.PRODUCTS.PUBLISHED;
            break;
          case "all":
          default:
            endpoint = API_ENDPOINTS.ANNONCES.LIST_TOUTES_ANNONCES;
            break;
        }
      }

      console.log("🌐 Appel API avec endpoint:", endpoint);
      console.log("🔍 Filtres actifs:", {
        searchQuery,
        selectedCategory,
        selectedSousCategorie,
        selectedLocation,
        maxPrice
      });

      // ✅ UTILISER api.get AU LIEU DE fetch
      const apiData = await api.get(endpoint);

      if (!isMountedRef.current) return;

      let transformedData: ListingItem[] = [];

      // ✅ SI C'EST L'API DE SOUS-CATÉGORIE
      if (selectedSousCategorie && apiData.data?.annonces) {
        console.log("📦 Données de sous-catégorie reçues:", apiData.data.annonces);
        
        // Transformer les dons
        const dons = (apiData.data.annonces.dons || []).map((item: any) => ({
          uuid: item.uuid,
          type: "don" as const,
          titre: item.nom || item.titre || "Don sans titre",
          description: item.description,
          prix: item.prix,
          image: item.image,
          statut: item.statut,
          numero: item.numero,
          localisation: item.localisation || item.ville || item.lieu_retrait || "",
          date: item.createdAt || item.publieLe || item.date_debut,
          seller: item.createurDetails ? {
            name: item.createurDetails.nom || "Donateur",
            avatar: item.createurDetails.avatar || "/images/default-avatar.png",
          } : {
            name: "Donateur",
            avatar: "/images/default-avatar.png",
          },
          createdAt: item.createdAt,
        }));

        // Transformer les échanges
        const echanges = (apiData.data.annonces.echanges || []).map((item: any) => ({
          uuid: item.uuid,
          type: "echange" as const,
          titre: item.nomElementEchange || item.titre || "Échange sans titre",
          description: item.message || item.description,
          prix: item.prix,
          image: item.image,
          statut: item.statut,
          numero: item.numero,
          localisation: item.localisation || item.ville || item.lieu_rencontre || "",
          date: item.createdAt || item.publieLe,
          seller: item.createurDetails ? {
            name: item.createurDetails.nom || "Initiateur",
            avatar: item.createurDetails.avatar || "/images/default-avatar.png",
          } : {
            name: "Initiateur",
            avatar: "/images/default-avatar.png",
          },
          createdAt: item.createdAt,
        }));

        // Transformer les produits
        const produits = (apiData.data.annonces.produits || []).map((item: any) => ({
          uuid: item.uuid,
          type: "produit" as const,
          titre: item.nom || item.libelle || "Produit sans nom",
          libelle: item.libelle,
          description: item.description,
          prix: item.prix,
          image: item.image,
          date: item.date || item.createdAt || item.publieLe,
          disponible: item.disponible,
          statut: item.statut,
          localisation: item.localisation || item.ville || "",
          seller: item.vendeur || item.createurDetails ? {
            name: item.vendeur?.nom || item.createurDetails?.nom || "Vendeur",
            avatar: item.vendeur?.avatar || item.createurDetails?.avatar || "/images/default-avatar.png",
          } : {
            name: "Vendeur",
            avatar: "/images/default-avatar.png",
          },
        }));

        transformedData = [...dons, ...echanges, ...produits];
        console.log(`✅ ${transformedData.length} annonces transformées pour la sous-catégorie`);
      } 
      // TRAITEMENT STANDARD POUR LES AUTRES ENDPOINTS
      else {
        const dataArray = Array.isArray(apiData) ? apiData : [apiData];

        if (filterType === "all") {
          transformedData = dataArray.map((item: any) => ({
            uuid: item.uuid || `item-${Math.random().toString(36).substr(2, 9)}`,
            type: item.type || "produit",
            titre: item.titre || item.nom || item.libelle || "Sans titre",
            libelle: item.libelle,
            description: item.description,
            prix: item.prix,
            image: item.image,
            date: item.date || item.createdAt || item.publieLe,
            disponible: item.disponible,
            statut: item.statut,
            numero: item.numero,
            localisation:
              item.localisation || item.ville || item.lieu_rencontre || "",
            seller: item.createurDetails
              ? {
                  name: item.createurDetails.nom || "Annonceur",
                  avatar:
                    item.createurDetails.avatar || "/images/default-avatar.png",
                }
              : item.createur
                ? {
                    name:
                      `${item.createur.prenoms || ""} ${item.createur.nom || ""}`.trim() ||
                      "Annonceur",
                    avatar: item.createur.avatar || "/images/default-avatar.png",
                  }
                : undefined,
            createdAt: item.createdAt,
          }));
        } else if (filterType === "donation") {
          transformedData = dataArray.map((item: any) => ({
            uuid: item.uuid || `don-${Math.random().toString(36).substr(2, 9)}`,
            type: "don" as const,
            titre: item.nom || item.titre || "Don sans titre",
            description: item.description,
            prix: item.prix,
            image: item.image || "",
            statut: item.statut,
            numero: item.numero,
            localisation:
              item.localisation || item.ville || item.lieu_retrait || "",
            date: item.createdAt || item.publieLe,
            seller: item.createurDetails
              ? {
                  name: item.createurDetails.nom || "Donateur",
                  avatar:
                    item.createurDetails.avatar || "/images/default-avatar.png",
                }
              : item.createur
                ? {
                    name:
                      `${item.createur.prenoms || ""} ${item.createur.nom || ""}`.trim() ||
                      "Donateur",
                    avatar: item.createur.avatar || "/images/default-avatar.png",
                  }
                : undefined,
            createdAt: item.createdAt,
          }));
        } else if (filterType === "exchange") {
          transformedData = dataArray.map((item: any) => ({
            uuid:
              item.uuid || `echange-${Math.random().toString(36).substr(2, 9)}`,
            type: "echange" as const,
            titre: item.nomElementEchange || item.titre || "Échange sans titre",
            description: item.message || item.description,
            prix: item.prix,
            image: item.image,
            statut: item.statut,
            numero: item.numero,
            localisation:
              item.localisation || item.ville || item.lieu_rencontre || "",
            date: item.createdAt || item.publieLe,
            seller: item.createurDetails
              ? {
                  name: item.createurDetails.nom || "Initiateur",
                  avatar:
                    item.createurDetails.avatar || "/images/default-avatar.png",
                }
              : item.createur
                ? {
                    name:
                      `${item.createur.prenoms || ""} ${item.createur.nom || ""}`.trim() ||
                      "Initiateur",
                    avatar: item.createur.avatar || "/images/default-avatar.png",
                  }
                : undefined,
            createdAt: item.createdAt,
          }));
        } else if (filterType === "sale") {
          transformedData = dataArray.map((item: any) => ({
            uuid:
              item.uuid || `produit-${Math.random().toString(36).substr(2, 9)}`,
            type: "produit" as const,
            titre: item.nom || item.libelle || "Produit sans nom",
            libelle: item.libelle,
            description: item.description,
            prix: item.prix,
            image: item.image,
            date: item.date || item.createdAt || item.publieLe,
            disponible: item.disponible,
            statut: item.statut,
            localisation: item.localisation || item.ville || "",
            seller: item.createurDetails
              ? {
                  name: item.createurDetails.nom || "Vendeur",
                  avatar:
                    item.createurDetails.avatar || "/images/default-avatar.png",
                }
              : item.vendeur || item.createur
                ? {
                    name:
                      `${(item.vendeur || item.createur)?.prenoms || ""} ${(item.vendeur || item.createur)?.nom || ""}`.trim() ||
                      "Vendeur",
                    avatar:
                      (item.vendeur || item.createur)?.avatar ||
                      "/images/default-avatar.png",
                  }
                : undefined,
          }));
        }
      }

      // ============================================
      // APPLICATION DES FILTRES DE RECHERCHE
      // ============================================
      let filteredData = transformedData;

      // 1. Filtre par texte de recherche
      if (searchQuery) {
        const query = searchQuery.toLowerCase().trim();
        filteredData = filteredData.filter((item) => {
          const titre = item.titre?.toLowerCase() || "";
          const description = item.description?.toLowerCase() || "";
          const libelle = item.libelle?.toLowerCase() || "";
          return titre.includes(query) || description.includes(query) || libelle.includes(query);
        });
      }

      // 3. Filtre par localisation
      if (selectedLocation) {
        const location = selectedLocation.toLowerCase();
        filteredData = filteredData.filter((item) => {
          const localisation = item.localisation?.toLowerCase() || "";
          return localisation.includes(location);
        });
      }

      // 4. Filtre par prix maximum
      if (maxPrice) {
        const max = parseFloat(maxPrice);
        filteredData = filteredData.filter((item) => {
          const price = item.prix ? parseFloat(item.prix.toString()) : 0;
          return price <= max;
        });
      }

      // Tri des données
      const sortedData = [...filteredData].sort((a, b) => {
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
          case "popular": {
            return 0;
          }
          case "recent":
          default: {
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;
            return dateB - dateA;
          }
        }
      });

      if (isMountedRef.current) {
        // ✅ TOUTES LES ANNONCES, PAS DE SECTION "À LA UNE"
        setListings(sortedData);
        setRetryCount(0);

        if (onDataLoaded) {
          onDataLoaded(sortedData.length);
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("Requête annulée");
        return;
      }

      console.error("Erreur fetch:", err);

      if (!isMountedRef.current) return;

      if (retryCount >= MAX_RETRIES) {
        setError(
          "Impossible de charger les données. " +
            (err.message?.includes("HTML")
              ? "Problème de configuration backend."
              : "Vérifiez votre connexion."),
        );
        return;
      }

      setError(err.message || "Erreur de chargement");
      setRetryCount((prev) => prev + 1);
      setListings([]);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        abortControllerRef.current = null;
      }
    }
  }, [
    filterType,
    sortOption,
    retryCount,
    categoryUuid,
    searchQuery,
    selectedSousCategorie,
    selectedLocation,
    maxPrice,
    onDataLoaded,
  ]);

  // ============================================
  // ÉCOUTER L'ÉVÉNEMENT search-filters-updated
  // ============================================
  useEffect(() => {
    const handleSearchFiltersUpdated = (event: CustomEvent) => {
      console.log("📢 Événement search-filters-updated reçu:", event.detail);
      
      // Les filtres sont déjà mis à jour dans le contexte via HeroSearch
      // On déclenche juste un rechargement des données
      if (isMountedRef.current) {
        setRetryCount(0); // Réinitialiser le compteur de tentatives
        fetchListings(); // Recharger les données
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener(
        "search-filters-updated",
        handleSearchFiltersUpdated as EventListener
      );
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener(
          "search-filters-updated",
          handleSearchFiltersUpdated as EventListener
        );
      }
    };
  }, [fetchListings]);

  // Écouter les changements de filtre de type
  useEffect(() => {
    const handleFilterTypeChange = (event: CustomEvent) => {
      console.log("📢 Changement de filtre type détecté:", event.detail);
      if (event.detail?.filterType !== filterType) {
        fetchListings();
      }
    };

    const handleSortOptionChange = (event: CustomEvent) => {
      console.log("📢 Changement de tri détecté:", event.detail);
      if (event.detail?.sortOption !== sortOption) {
        fetchListings();
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener(
        "filter-type-changed",
        handleFilterTypeChange as EventListener,
      );
      window.addEventListener(
        "sort-option-changed",
        handleSortOptionChange as EventListener,
      );
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener(
          "filter-type-changed",
          handleFilterTypeChange as EventListener,
        );
        window.removeEventListener(
          "sort-option-changed",
          handleSortOptionChange as EventListener,
        );
      }
    };
  }, [fetchListings, filterType, sortOption]);

  // Chargement initial
  useEffect(() => {
    isMountedRef.current = true;
    fetchListings();

    return () => {
      isMountedRef.current = false;
      abortCurrentRequest();
    };
  }, [fetchListings, abortCurrentRequest]);

  const handleRefresh = () => {
    setRetryCount(0);
    fetchListings();
  };

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
          <i className="fa-solid fa-triangle-exclamation me-2"></i>
          <span>{error}</span>
        </div>
        <button
          className="btn btn-outline-danger btn-sm"
          onClick={handleRefresh}
          disabled={retryCount >= MAX_RETRIES}
        >
          <i className="fa-solid fa-rotate me-1"></i>Réessayer
        </button>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="mb-3">
          <i className="fa-solid fa-inbox fa-3x text-muted"></i>
        </div>
        <h5 className="text-muted mb-2">Aucune annonce trouvée</h5>
        <p className="text-muted mb-4">
          {selectedSousCategorie ? (
            "Aucune annonce n'est disponible pour cette sous-catégorie."
          ) : searchQuery || selectedCategory || selectedLocation || maxPrice ? (
            "Aucun résultat ne correspond à vos critères de recherche."
          ) : filterType === "all" ? (
            "Aucune annonce n'est disponible pour le moment."
          ) : (
            `Aucun ${filterType === "donation" ? "don" : filterType === "exchange" ? "échange" : "produit"} n'est disponible.`
          )}
        </p>
        <button className="btn btn-success" onClick={handleRefresh}>
          <i className="fa-solid fa-rotate me-2"></i>Rafraîchir
        </button>
      </div>
    );
  }

  return (
    <div className="listings-grid flex-1">
      {/* ✅ TOUTES LES ANNONCES - PLUS DE SECTION "À LA UNE" */}
      <div className="all-listings mb-5">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h2 className="h4 fw-bold text-dark">Toutes les annonces</h2>
          <p className="text-muted mb-0">
            {listings.length} résultat(s)
          </p>
        </div>

        {viewMode === "grid" ? (
          <div className="row g-3 g-md-4">
            {listings.map((item) => (
              <div key={item.uuid} className="col-6 col-md-4 col-lg-4">
                <ListingCard listing={item} viewMode="grid" />
              </div>
            ))}
          </div>
        ) : (
          <div className="list-view-container">
            {listings.map((item) => (
              <ListingCard key={item.uuid} listing={item} viewMode="list" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingsGrid;