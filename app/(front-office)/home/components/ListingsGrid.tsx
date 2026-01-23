// ListingsGrid.tsx - VERSION CORRIGÉE
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import colors from "../../../shared/constants/colors";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { API_CONFIG, buildApiUrl } from "@/config/env";
interface ListingItem {
  uuid: string;
  type: "produit" | "echange" | "don";
  titre?: string;
  nom?: string;
  libelle?: string;
  description?: string | null;
  prix?: number | string | null;
  image?: string | null;
  date?: string;
  disponible?: boolean;
  statut?: string;
  numero?: string;
  createdAt?: string | null;
}

interface ListingsGridProps {
  filterType?: string;
  viewMode?: "grid" | "list";
  sortOption?: string;
}

const ListingsGrid: React.FC<ListingsGridProps> = ({
  filterType = "all",
  viewMode = "grid",
  sortOption = "recent",
}) => {
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const MAX_RETRIES = 3;
  const PLACEHOLDER_IMAGE =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNjY2NjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC13ZWlnaHQ9IjUwMCI+Tm8gaW1hZ2U8L3RleHQ+PC9zdmc+";

  const normalizeImageUrl = useCallback((url: string | null): string => {
    if (!url) return PLACEHOLDER_IMAGE;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (
      url.startsWith("/uploads/") ||
      url.startsWith("/images/") ||
      url.startsWith("/api/files/")
    ) {
      return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
    }
    return PLACEHOLDER_IMAGE;
  }, []);

  const abortCurrentRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  // Fonction pour corriger les URLs si nécessaire
  const getApiUrl = useCallback((endpoint: string): string => {
    // Si l'endpoint est déjà une URL complète, l'utiliser directement
    if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
      // Si on utilise le proxy, convertir en chemin relatif
      const useProxy = process.env.NEXT_PUBLIC_USE_PROXY === "true";
      if (useProxy) {
        // Extraire le chemin après la base URL
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005";
        if (endpoint.startsWith(baseUrl)) {
          const path = endpoint.substring(baseUrl.length);
          return `/api${path}`;
        }
      }
      return endpoint;
    }

    // Sinon, c'est déjà un chemin relatif
    return endpoint;
  }, []);

  const fetchListings = useCallback(async () => {
    abortCurrentRequest();
    setLoading(true);
    setError(null);

    try {
      let endpoint = "";
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

      const controller = new AbortController();
      abortControllerRef.current = controller;
      const { signal } = controller;

      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes

      // Utiliser getApiUrl pour corriger l'URL
      const url = getApiUrl(endpoint);

      console.log("🌐 Fetching from:", url);

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

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      // Vérifier si c'est du HTML
      const contentType = response.headers.get("content-type");
      const responseText = await response.text();

      if (
        contentType?.includes("text/html") ||
        responseText.trim().startsWith("<!DOCTYPE")
      ) {
        console.error(
          "❌ Le backend retourne du HTML:",
          responseText.substring(0, 300),
        );
        throw new Error(
          `Le serveur a retourné une page HTML au lieu de données JSON. ` +
            `Vérifiez que l'endpoint '${endpoint}' existe sur le backend.`,
        );
      }

      // Parser le JSON
      let apiData;
      try {
        apiData = JSON.parse(responseText);
      } catch (parseError) {
        console.error(
          "❌ Erreur parsing JSON:",
          responseText.substring(0, 500),
        );
        throw new Error("Réponse invalide du serveur (non-JSON)");
      }

      // Transformer les données
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
          image: normalizeImageUrl(item.image),
          date: item.date || item.createdAt,
          disponible: item.disponible,
          statut: item.statut,
          numero: item.numero,
        }));
      } else if (filterType === "donation") {
        transformedData = dataArray.map((item: any) => ({
          uuid: item.uuid || `don-${Math.random().toString(36).substr(2, 9)}`,
          type: "don" as const,
          titre: item.titre || "Don sans titre",
          description: item.description,
          prix: item.prix,
          image: normalizeImageUrl(item.image),
          statut: item.statut,
          numero: item.numero,
          createdAt: item.createdAt,
        }));
      } else if (filterType === "exchange") {
        transformedData = dataArray.map((item: any) => ({
          uuid:
            item.uuid || `echange-${Math.random().toString(36).substr(2, 9)}`,
          type: "echange" as const,
          titre: item.titre || "Échange sans titre",
          description: item.description,
          prix: item.prix,
          image: normalizeImageUrl(item.image),
          statut: item.statut,
          numero: item.numero,
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
          image: normalizeImageUrl(item.image),
          date: item.date,
          disponible: item.disponible,
          statut: item.statut,
        }));
      }

      // Appliquer le tri
      const sortedData = [...transformedData].sort((a, b) => {
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
          case "recent": {
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;
            return dateB - dateA;
          }
          default:
            return 0;
        }
      });

      setListings(sortedData);
      setRetryCount(0);
    } catch (err: any) {
      console.error("Erreur fetch:", err);

      if (err.name === "AbortError") return;

      if (retryCount >= MAX_RETRIES) {
        setError(
          "Impossible de charger les données. " +
            (err.message?.includes("HTML")
              ? "Le backend semble avoir des problèmes de configuration."
              : "Vérifiez votre connexion et réessayez."),
        );
        return;
      }

      setError(err.message || "Erreur de chargement");
      setRetryCount((prev) => prev + 1);
      setListings([]);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [filterType, sortOption, retryCount, normalizeImageUrl, getApiUrl]);

  // [Le reste du code reste identique...]

  // Fonction de tri (garder la même)
  const sortListings = useCallback(
    (data: ListingItem[], sortBy: string): ListingItem[] => {
      const sorted = [...data];
      switch (sortBy) {
        case "price-asc":
          return sorted.sort((a, b) => {
            const priceA = a.prix ? parseFloat(a.prix.toString()) : 0;
            const priceB = b.prix ? parseFloat(b.prix.toString()) : 0;
            return priceA - priceB;
          });
        case "price-desc":
          return sorted.sort((a, b) => {
            const priceA = a.prix ? parseFloat(a.prix.toString()) : 0;
            const priceB = b.prix ? parseFloat(b.prix.toString()) : 0;
            return priceB - priceA;
          });
        case "recent":
          return sorted.sort((a, b) => {
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;
            return dateB - dateA;
          });
        default:
          return sorted;
      }
    },
    [],
  );

  useEffect(() => {
    fetchListings();
    return () => abortCurrentRequest();
  }, [fetchListings]);

  // [Les autres fonctions utilitaires restent identiques...]
  const getTypeLabel = useCallback((type: string) => {
    switch (type) {
      case "don":
        return "Don";
      case "echange":
        return "Échange";
      case "produit":
        return "Vente";
      default:
        return "Annonce";
    }
  }, []);

  const getTypeColor = useCallback((type: string) => {
    switch (type) {
      case "don":
        return "#9C27B0";
      case "echange":
        return "#2196F3";
      case "produit":
        return colors.oskar.green;
      default:
        return colors.oskar.grey;
    }
  }, []);

  const formatPrice = useCallback(
    (price: number | string | null | undefined) => {
      if (price === null || price === undefined) return "Gratuit";
      if (price === 0) return "Gratuit";
      const priceNum = typeof price === "string" ? parseFloat(price) : price;
      if (isNaN(priceNum)) return "Prix à discuter";
      return `${priceNum.toLocaleString("fr-FR")} FCFA`;
    },
    [],
  );

  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  }, []);

  const getDetailLink = useCallback((item: ListingItem) => {
    switch (item.type) {
      case "don":
        return `/dons/${item.uuid}`;
      case "echange":
        return `/echanges/${item.uuid}`;
      case "produit":
        return `/produits/${item.uuid}`;
      default:
        return `/annonces/${item.uuid}`;
    }
  }, []);

  const handleRefresh = () => {
    setRetryCount(0);
    fetchListings();
  };

  // [Le JSX reste identique...]
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
          {filterType === "all"
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
    <div
      id="listings-grid"
      className={viewMode === "grid" ? "grid-view" : "list-view"}
    >
      {viewMode === "grid" ? (
        <div className="row g-4">
          {listings.map((item) => (
            <div
              key={item.uuid}
              className="col-xl-3 col-lg-4 col-md-6 col-sm-6"
            >
              <div className="card listing-card h-100 border-0 shadow-sm">
                <div className="position-relative">
                  <div className="listing-image-container">
                    <img
                      src={item.image || PLACEHOLDER_IMAGE}
                      alt={item.titre || "Annonce"}
                      className="card-img-top listing-image"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = PLACEHOLDER_IMAGE;
                      }}
                    />
                    <span
                      className="listing-type-badge"
                      style={{ backgroundColor: getTypeColor(item.type) }}
                    >
                      {getTypeLabel(item.type)}
                    </span>
                    {item.statut && (
                      <span className="listing-status-badge">
                        {item.statut === "disponible"
                          ? "Disponible"
                          : item.statut === "en_attente"
                            ? "En attente"
                            : item.statut === "publie"
                              ? "Publié"
                              : item.statut}
                      </span>
                    )}
                  </div>
                  <div className="card-body p-3 d-flex flex-column">
                    <h5 className="card-title listing-title mb-2 flex-grow-0">
                      <Link
                        href={getDetailLink(item)}
                        className="text-decoration-none text-dark"
                      >
                        {item.titre}
                      </Link>
                    </h5>
                    {item.description && (
                      <p className="card-text listing-description text-muted small mb-3 flex-grow-1">
                        {item.description.length > 100
                          ? `${item.description.substring(0, 100)}...`
                          : item.description}
                      </p>
                    )}
                    <div className="d-flex justify-content-between align-items-center mt-auto">
                      <div
                        className="listing-price fw-bold"
                        style={{
                          color: colors.oskar.green,
                          fontSize: "1.1rem",
                        }}
                      >
                        {formatPrice(item.prix)}
                      </div>
                      {item.date && (
                        <div className="listing-date text-muted small">
                          <i className="fa-solid fa-clock me-1"></i>
                          {formatDate(item.date)}
                        </div>
                      )}
                    </div>
                    {item.type === "produit" &&
                      item.disponible !== undefined && (
                        <div className="mt-2">
                          <span
                            className={`badge ${item.disponible ? "bg-success" : "bg-danger"}`}
                          >
                            {item.disponible ? "Disponible" : "Non disponible"}
                          </span>
                        </div>
                      )}
                    <div className="mt-3">
                      <Link
                        href={getDetailLink(item)}
                        className="btn btn-outline-success btn-sm w-100"
                      >
                        <i className="fa-solid fa-eye me-2"></i>Voir les détails
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="list-view-container">
          {listings.map((item) => (
            <div
              key={item.uuid}
              className="listing-list-item card mb-3 border-0 shadow-sm"
            >
              <div className="row g-0">
                <div className="col-md-3">
                  <div className="position-relative h-100">
                    <img
                      src={item.image || PLACEHOLDER_IMAGE}
                      alt={item.titre || "Annonce"}
                      className="img-fluid rounded-start h-100 w-100 object-fit-cover"
                      style={{ height: "200px" }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = PLACEHOLDER_IMAGE;
                      }}
                    />
                    <span
                      className="listing-type-badge"
                      style={{ backgroundColor: getTypeColor(item.type) }}
                    >
                      {getTypeLabel(item.type)}
                    </span>
                  </div>
                </div>
                <div className="col-md-9">
                  <div className="card-body h-100 d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="flex-grow-1">
                        <h5 className="card-title mb-1">
                          <Link
                            href={getDetailLink(item)}
                            className="text-decoration-none text-dark"
                          >
                            {item.titre}
                          </Link>
                        </h5>
                        <div className="d-flex flex-wrap gap-2 mt-2">
                          {item.statut && (
                            <span className="badge bg-secondary">
                              {item.statut === "disponible"
                                ? "Disponible"
                                : item.statut === "en_attente"
                                  ? "En attente"
                                  : item.statut === "publie"
                                    ? "Publié"
                                    : item.statut}
                            </span>
                          )}
                          {item.type === "produit" &&
                            item.disponible !== undefined && (
                              <span
                                className={`badge ${item.disponible ? "bg-success" : "bg-danger"}`}
                              >
                                {item.disponible
                                  ? "Disponible"
                                  : "Non disponible"}
                              </span>
                            )}
                          <span className="text-muted small">
                            <i className="fa-solid fa-hashtag me-1"></i>Réf:{" "}
                            {item.uuid.substring(0, 8)}
                          </span>
                        </div>
                      </div>
                      <div className="text-end ms-3">
                        <div
                          className="listing-price fw-bold fs-4"
                          style={{ color: colors.oskar.green }}
                        >
                          {formatPrice(item.prix)}
                        </div>
                        {item.date && (
                          <div className="text-muted small mt-1">
                            <i className="fa-solid fa-clock me-1"></i>
                            {formatDate(item.date)}
                          </div>
                        )}
                      </div>
                    </div>
                    {item.description && (
                      <p className="card-text text-muted flex-grow-1 mb-3">
                        {item.description}
                      </p>
                    )}
                    <div className="d-flex justify-content-between align-items-end mt-auto">
                      <div className="small">
                        {item.numero && (
                          <span className="text-muted me-3">
                            <i className="fa-solid fa-phone me-1"></i>
                            {item.numero}
                          </span>
                        )}
                      </div>
                      <div>
                        <Link
                          href={getDetailLink(item)}
                          className="btn btn-success"
                        >
                          <i className="fa-solid fa-eye me-2"></i>Voir les
                          détails
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <style jsx>{`
        .listing-card {
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
          border-radius: 12px;
          overflow: hidden;
        }
        .listing-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
        }
        .listing-image-container {
          position: relative;
          height: 200px;
          overflow: hidden;
          background-color: ${colors.oskar.lightGrey};
        }
        .listing-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .listing-card:hover .listing-image {
          transform: scale(1.05);
        }
        .listing-type-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          z-index: 2;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .listing-status-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background-color: rgba(255, 255, 255, 0.95);
          color: ${colors.oskar.black};
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          z-index: 2;
          border: 1px solid ${colors.oskar.lightGrey};
        }
        .listing-title {
          font-size: 1rem;
          font-weight: 600;
          line-height: 1.4;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .listing-description {
          line-height: 1.5;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        }
        .listing-price {
          font-size: 1.1rem;
        }
        .listing-date {
          font-size: 0.8rem;
        }
        .list-view-container {
          padding: 1rem 0;
        }
        .listing-list-item {
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
        }
        .listing-list-item:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1) !important;
        }
        .object-fit-cover {
          object-fit: cover;
        }
        @media (max-width: 767.98px) {
          .listing-image-container {
            height: 180px;
          }
          .listing-list-item .col-md-3 {
            height: 180px;
          }
          .listing-list-item .card-body {
            padding: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ListingsGrid;
