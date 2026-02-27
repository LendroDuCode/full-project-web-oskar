"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { API_ENDPOINTS } from "@/config/api-endpoints";
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
// FONCTION DE CONSTRUCTION D'URL D'IMAGE ROBUSTE - ✅ CORRIGÉE
// ============================================
const buildImageUrl = (imagePath: string | null): string | null => {
  if (!imagePath) return null;

  // ✅ Si c'est déjà une URL complète, la retourner telle quelle
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://oskar-api.mysonec.pro";
  const filesUrl = process.env.NEXT_PUBLIC_FILES_URL || "/api/files";

  // ✅ Si le chemin commence par /api/files, ne pas l'ajouter à nouveau
  if (imagePath.startsWith("/api/files/")) {
    return `${apiUrl}${imagePath}`;
  }

  // ✅ Si le chemin commence par api/files (sans le slash), l'ajouter
  if (imagePath.startsWith("api/files/")) {
    return `${apiUrl}/${imagePath}`;
  }

  // ✅ Si le chemin est un chemin simple (ex: echanges%2F1772188621306-920351589.jpg)
  return `${apiUrl}${filesUrl}/${imagePath}`;
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
  const [featuredListings, setFeaturedListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // Récupérer les filtres de recherche depuis le contexte
  const { searchQuery, selectedCategory, selectedLocation, maxPrice } =
    useSearch();

  const MAX_RETRIES = 3;

  // ✅ Fonction de normalisation qui construit l'URL complète
  const normalizeImageUrl = useCallback((url: string | null): string | null => {
    return buildImageUrl(url);
  }, []);

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

  const fetchListings = useCallback(async () => {
    abortCurrentRequest();

    if (!isMountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      let endpoint = "";

      // Si categoryUuid est fourni, charger les annonces de la catégorie spécifique
      if (categoryUuid) {
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

      const controller = new AbortController();
      abortControllerRef.current = controller;
      const { signal } = controller;

      const timeoutId = setTimeout(() => {
        if (isMountedRef.current) {
          controller.abort();
        }
      }, 15000);

      const url = getApiUrl(endpoint);
      console.log("🌐 Fetching from:", url, "avec filtre:", filterType);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        cache: "no-store",
        credentials: "include",
        signal,
      });

      clearTimeout(timeoutId);

      if (!isMountedRef.current) return;

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      const responseText = await response.text();

      if (
        contentType?.includes("text/html") ||
        responseText.trim().startsWith("<!DOCTYPE")
      ) {
        console.error("❌ HTML reçu:", responseText.substring(0, 300));
        throw new Error(
          `Le serveur a retourné une page HTML. Vérifiez l'endpoint '${endpoint}'.`,
        );
      }

      let apiData;
      try {
        apiData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("❌ JSON invalide:", responseText.substring(0, 500));
        throw new Error("Réponse invalide du serveur");
      }

      if (!isMountedRef.current) return;

      let transformedData: ListingItem[] = [];
      const dataArray = Array.isArray(apiData) ? apiData : [apiData];

      if (filterType === "all") {
        transformedData = dataArray.map((item: any) => ({
          uuid: item.uuid || `item-${Math.random().toString(36).substr(2, 9)}`,
          type: item.type || "produit",
          titre: item.titre || item.nom || item.libelle || "Sans titre",
          libelle: item.libelle,
          description: item.description,
          prix: item.prix,
          image: normalizeImageUrl(item.image), // ✅ Utilisation de la fonction corrigée
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
                  normalizeImageUrl(item.createurDetails.avatar) ||
                  "/images/default-avatar.png",
              }
            : item.createur
              ? {
                  name:
                    `${item.createur.prenoms || ""} ${item.createur.nom || ""}`.trim() ||
                    "Annonceur",
                  avatar:
                    normalizeImageUrl(item.createur.avatar) ||
                    "/images/default-avatar.png",
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
          image: normalizeImageUrl(item.image), // ✅ Utilisation de la fonction corrigée
          statut: item.statut,
          numero: item.numero,
          localisation:
            item.localisation || item.ville || item.lieu_retrait || "",
          date: item.createdAt || item.publieLe,
          seller: item.createurDetails
            ? {
                name: item.createurDetails.nom || "Donateur",
                avatar:
                  normalizeImageUrl(item.createurDetails.avatar) ||
                  "/images/default-avatar.png",
              }
            : item.createur
              ? {
                  name:
                    `${item.createur.prenoms || ""} ${item.createur.nom || ""}`.trim() ||
                    "Donateur",
                  avatar:
                    normalizeImageUrl(item.createur.avatar) ||
                    "/images/default-avatar.png",
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
          image: normalizeImageUrl(item.image), // ✅ Utilisation de la fonction corrigée
          statut: item.statut,
          numero: item.numero,
          localisation:
            item.localisation || item.ville || item.lieu_rencontre || "",
          date: item.createdAt || item.publieLe,
          seller: item.createurDetails
            ? {
                name: item.createurDetails.nom || "Initiateur",
                avatar:
                  normalizeImageUrl(item.createurDetails.avatar) ||
                  "/images/default-avatar.png",
              }
            : item.createur
              ? {
                  name:
                    `${item.createur.prenoms || ""} ${item.createur.nom || ""}`.trim() ||
                    "Initiateur",
                  avatar:
                    normalizeImageUrl(item.createur.avatar) ||
                    "/images/default-avatar.png",
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
          image: normalizeImageUrl(item.image), // ✅ Utilisation de la fonction corrigée
          date: item.date || item.createdAt || item.publieLe,
          disponible: item.disponible,
          statut: item.statut,
          localisation: item.localisation || item.ville || "",
          seller: item.createurDetails
            ? {
                name: item.createurDetails.nom || "Vendeur",
                avatar:
                  normalizeImageUrl(item.createurDetails.avatar) ||
                  "/images/default-avatar.png",
              }
            : item.vendeur || item.createur
              ? {
                  name:
                    `${(item.vendeur || item.createur)?.prenoms || ""} ${(item.vendeur || item.createur)?.nom || ""}`.trim() ||
                    "Vendeur",
                  avatar:
                    normalizeImageUrl(
                      (item.vendeur || item.createur)?.avatar,
                    ) || "/images/default-avatar.png",
                }
              : undefined,
        }));
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
          return titre.includes(query) || description.includes(query);
        });
        console.log(
          `🔍 Filtre texte "${searchQuery}": ${filteredData.length} résultats`,
        );
      }

      // 2. Filtre par catégorie
      if (selectedCategory) {
        filteredData = filteredData.filter((item) => {
          if (selectedCategory === "electronique") {
            return (
              item.titre?.toLowerCase().includes("téléphone") ||
              item.titre?.toLowerCase().includes("ordinateur") ||
              item.titre?.toLowerCase().includes("laptop") ||
              item.titre?.toLowerCase().includes("smartphone")
            );
          }
          if (selectedCategory === "mode") {
            return (
              item.titre?.toLowerCase().includes("vêtement") ||
              item.titre?.toLowerCase().includes("robe") ||
              item.titre?.toLowerCase().includes("chaussure")
            );
          }
          if (selectedCategory === "maison") {
            return (
              item.titre?.toLowerCase().includes("meuble") ||
              item.titre?.toLowerCase().includes("canapé") ||
              item.titre?.toLowerCase().includes("table")
            );
          }
          if (selectedCategory === "vehicules") {
            return (
              item.titre?.toLowerCase().includes("voiture") ||
              item.titre?.toLowerCase().includes("moto") ||
              item.titre?.toLowerCase().includes("vélo")
            );
          }
          if (selectedCategory === "education") {
            return (
              item.titre?.toLowerCase().includes("livre") ||
              item.titre?.toLowerCase().includes("cours") ||
              item.titre?.toLowerCase().includes("manuel")
            );
          }
          if (selectedCategory === "services") {
            return (
              item.titre?.toLowerCase().includes("service") ||
              item.titre?.toLowerCase().includes("réparation")
            );
          }
          return true;
        });
        console.log(
          `📁 Filtre catégorie "${selectedCategory}": ${filteredData.length} résultats`,
        );
      }

      // 3. Filtre par localisation
      if (selectedLocation) {
        const location = selectedLocation.toLowerCase();
        filteredData = filteredData.filter((item) => {
          const localisation = item.localisation?.toLowerCase() || "";
          return localisation.includes(location);
        });
        console.log(
          `📍 Filtre localisation "${selectedLocation}": ${filteredData.length} résultats`,
        );
      }

      // 4. Filtre par prix maximum
      if (maxPrice) {
        const max = parseFloat(maxPrice);
        filteredData = filteredData.filter((item) => {
          const price = item.prix ? parseFloat(item.prix.toString()) : 0;
          return price <= max;
        });
        console.log(
          `💰 Filtre prix max ${maxPrice}: ${filteredData.length} résultats`,
        );
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
            // Simuler la popularité par le nombre de favoris ou commentaires
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
        // Simuler des annonces à la une (les 3 premières)
        const featured = sortedData.slice(0, 3);
        const regular = sortedData.slice(3);

        setFeaturedListings(featured);
        setListings(regular);
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
      setFeaturedListings([]);
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
    normalizeImageUrl,
    getApiUrl,
    abortCurrentRequest,
    categoryUuid,
    searchQuery,
    selectedCategory,
    selectedLocation,
    maxPrice,
    onDataLoaded,
  ]);

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

  if (listings.length === 0 && featuredListings.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="mb-3">
          <i className="fa-solid fa-inbox fa-3x text-muted"></i>
        </div>
        <h5 className="text-muted mb-2">Aucune annonce trouvée</h5>
        <p className="text-muted mb-4">
          {searchQuery || selectedCategory || selectedLocation || maxPrice
            ? "Aucun résultat ne correspond à vos critères de recherche."
            : filterType === "all"
              ? "Aucune annonce n'est disponible pour le moment."
              : `Aucun ${filterType === "donation" ? "don" : filterType === "exchange" ? "échange" : "produit"} n'est disponible.`}
        </p>
        <button className="btn btn-success" onClick={handleRefresh}>
          <i className="fa-solid fa-rotate me-2"></i>Rafraîchir
        </button>
      </div>
    );
  }

  return (
    <div className="listings-grid flex-1">
      {/* Annonces à la une */}
      {showFeatured && featuredListings.length > 0 && (
        <div className="featured-listings mb-5">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h2 className="h4 fw-bold text-dark d-flex align-items-center">
              <i className="fa-solid fa-star text-warning me-2"></i>
              Annonces à la Une
            </h2>
          </div>
          <div className="row g-4">
            {featuredListings.map((item) => (
              <div key={item.uuid} className="col-lg-4 col-md-6">
                <ListingCard
                  listing={item}
                  featured={true}
                  viewMode={viewMode}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toutes les annonces */}
      <div className="all-listings mb-5">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h2 className="h4 fw-bold text-dark">Toutes les annonces</h2>
          <p className="text-muted mb-0">
            Affichage de 1-{listings.length} sur{" "}
            {featuredListings.length + listings.length} résultats
          </p>
        </div>

        {viewMode === "grid" ? (
          <div className="row g-4">
            {listings.map((item) => (
              <div key={item.uuid} className="col-lg-4 col-md-6">
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
