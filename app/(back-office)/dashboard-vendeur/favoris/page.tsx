"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";
import FilterBar from "./components/FilterBar";
import FavorisTable from "./components/FavorisTable";
import ViewModal from "../annonces/components/ViewModal";
import EmptyState from "../annonces/components/EmptyState";

// Type qui correspond exactement à la structure de votre API
interface FavoriItem {
  uuid: string; // UUID du favori lui-même
  itemUuid: string; // UUID de l'élément (don, produit, échange)
  title: string;
  description?: string;
  image: string | null;
  image_key?: string;
  type: "produit" | "don" | "echange" | "annonce";
  status: string;
  date: string;
  price?: number | string | null;
  quantity?: number;
  estPublie?: boolean;
  estBloque?: boolean;
  seller?: {
    name: string;
    avatar?: string | null; // ✅ Peut être string, null ou undefined
    avatar_key?: string | null; // ✅ Peut être string, null ou undefined
    uuid?: string | null; // ✅ Peut être string, null ou undefined
    isPro?: boolean;
    type?: string;
  };
  category?: string;
  categoryUuid?: string;
  originalData?: any;
  favoriteId: string; // Même que uuid (pour compatibilité)
  addedAt: string;
}

// Interface pour la réponse API
interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    type?: string;
  };
}

export default function FavorisPage() {
  const [favoris, setFavoris] = useState<FavoriItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState("tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // États pour la modal de détails
  const [selectedFavori, setSelectedFavori] = useState<FavoriItem | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [fullDetails, setFullDetails] = useState<any>(null);

  // ✅ FILTRAGE AVEC useMemo
  const filteredFavoris = useMemo(() => {
    let filtered = [...favoris];

    // Filtrer par type
    if (selectedType !== "tous") {
      filtered = filtered.filter((item) => item.type === selectedType);
    }

    // Filtrer par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((item) => {
        const title = item.title?.toLowerCase() || "";
        const description = item.description?.toLowerCase() || "";
        const category = item.category?.toLowerCase() || "";
        const sellerName = item.seller?.name?.toLowerCase() || "";

        return (
          title.includes(query) ||
          description.includes(query) ||
          category.includes(query) ||
          sellerName.includes(query)
        );
      });
    }

    return filtered;
  }, [favoris, selectedType, searchQuery]);

  // Fonction pour construire l'URL d'une image
  const buildImageUrl = useCallback(
    (imagePath: string | null): string | null => {
      if (!imagePath) return null;

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "https://oskar-api.mysonec.pro";
      const filesUrl = process.env.NEXT_PUBLIC_FILES_URL || "/api/files";

      // Déjà une URL complète
      if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        if (imagePath.includes("localhost")) {
          const productionUrl = apiUrl.replace(/\/api$/, "");
          return imagePath.replace(/http:\/\/localhost(:\d+)?/g, productionUrl);
        }
        return imagePath;
      }

      // Chemin avec %2F
      if (imagePath.includes("%2F")) {
        return `${apiUrl}${filesUrl}/${imagePath}`;
      }

      // Chemin avec slash
      if (imagePath.startsWith("/")) {
        return `${apiUrl}${filesUrl}${imagePath}`;
      }

      // Chemin simple
      return `${apiUrl}${filesUrl}/${imagePath}`;
    },
    [],
  );

  // ✅ Fonction pour transformer les données selon votre API (CORRIGÉE)
  const transformFavoriData = useCallback(
    (item: any): FavoriItem | null => {
      try {
        if (!item) return null;

        // Extraire les informations selon votre structure API
        const favoriteId = item.uuid || ""; // UUID du favori
        const type = item.type || "don"; // Type (produit, don, echange)
        let itemData: any = null;

        // Récupérer les données selon le type
        if (type === "produit" && item.produit) {
          itemData = item.produit;
        } else if (type === "don" && item.don) {
          itemData = item.don;
        } else if (type === "echange" && item.echange) {
          itemData = item.echange;
        } else {
          itemData = item; // Fallback
        }

        if (!itemData) {
          console.warn("Pas de données pour le favori:", item);
          return null;
        }

        // UUID de l'élément
        const itemUuid = item.itemUuid || itemData.uuid || "";

        // Construire l'URL de l'image
        let imageUrl: string | null = null;
        if (itemData.image_key) {
          imageUrl = buildImageUrl(itemData.image_key);
        } else if (itemData.image) {
          imageUrl = buildImageUrl(itemData.image);
        }

        // Informations du vendeur/créateur - AVEC TOUTES LES PROPRIÉTÉS (null autorisé)
        let sellerInfo = {
          name: "Annonceur",
          type: "utilisateur",
          avatar: undefined as string | null | undefined,
          avatar_key: undefined as string | null | undefined,
          uuid: undefined as string | null | undefined,
          isPro: false,
        };

        if (type === "don" && itemData.vendeur) {
          sellerInfo = {
            name:
              `${itemData.vendeur.prenoms || ""} ${itemData.vendeur.nom || ""}`.trim() ||
              "Vendeur",
            type: "vendeur",
            avatar: buildImageUrl(itemData.vendeur.avatar) || null,
            avatar_key: itemData.vendeur.avatar || null,
            uuid: itemData.vendeur.uuid || null,
            isPro: true,
          };
        } else if (type === "don" && itemData.utilisateur) {
          sellerInfo = {
            name:
              `${itemData.utilisateur.prenoms || ""} ${itemData.utilisateur.nom || ""}`.trim() ||
              "Utilisateur",
            type: "utilisateur",
            avatar: buildImageUrl(itemData.utilisateur.avatar) || null,
            avatar_key: itemData.utilisateur.avatar || null,
            uuid: itemData.utilisateur.uuid || null,
            isPro: false,
          };
        } else if (type === "produit" && itemData.vendeur) {
          sellerInfo = {
            name:
              `${itemData.vendeur.prenoms || ""} ${itemData.vendeur.nom || ""}`.trim() ||
              "Vendeur",
            type: "vendeur",
            avatar: buildImageUrl(itemData.vendeur.avatar) || null,
            avatar_key: itemData.vendeur.avatar || null,
            uuid: itemData.vendeur.uuid || null,
            isPro: true,
          };
        } else if (type === "produit" && itemData.utilisateur) {
          sellerInfo = {
            name:
              `${itemData.utilisateur.prenoms || ""} ${itemData.utilisateur.nom || ""}`.trim() ||
              "Utilisateur",
            type: "utilisateur",
            avatar: buildImageUrl(itemData.utilisateur.avatar) || null,
            avatar_key: itemData.utilisateur.avatar || null,
            uuid: itemData.utilisateur.uuid || null,
            isPro: false,
          };
        } else if (type === "echange") {
          if (itemData.vendeur) {
            sellerInfo = {
              name:
                `${itemData.vendeur.prenoms || ""} ${itemData.vendeur.nom || ""}`.trim() ||
                "Vendeur",
              type: "vendeur",
              avatar: buildImageUrl(itemData.vendeur.avatar) || null,
              avatar_key: itemData.vendeur.avatar || null,
              uuid: itemData.vendeur.uuid || null,
              isPro: true,
            };
          } else if (itemData.utilisateur) {
            sellerInfo = {
              name:
                `${itemData.utilisateur.prenoms || ""} ${itemData.utilisateur.nom || ""}`.trim() ||
                "Utilisateur",
              type: "utilisateur",
              avatar: buildImageUrl(itemData.utilisateur.avatar) || null,
              avatar_key: itemData.utilisateur.avatar || null,
              uuid: itemData.utilisateur.uuid || null,
              isPro: false,
            };
          }
        }

        // Catégorie
        let category = "";
        let categoryUuid = "";
        if (itemData.categorie) {
          category = itemData.categorie.libelle || "";
          categoryUuid = itemData.categorie.uuid || "";
        } else if (itemData.categorie_uuid) {
          categoryUuid = itemData.categorie_uuid;
        }

        return {
          uuid: favoriteId,
          favoriteId: favoriteId,
          itemUuid: itemUuid,
          title:
            itemData.nom || itemData.libelle || itemData.titre || "Sans titre",
          description: itemData.description || itemData.message || "",
          image: imageUrl,
          image_key: itemData.image_key,
          type: type as "produit" | "don" | "echange" | "annonce",
          status: itemData.statut || "inconnu",
          date:
            itemData.date_debut ||
            itemData.createdAt ||
            itemData.updatedAt ||
            new Date().toISOString(),
          price: itemData.prix || null,
          quantity: itemData.quantite || 1,
          estPublie: itemData.estPublie || false,
          estBloque: itemData.est_bloque || false,
          seller: sellerInfo,
          category: category,
          categoryUuid: categoryUuid,
          addedAt:
            item.createdAt || itemData.createdAt || new Date().toISOString(),
          originalData: item,
        };
      } catch (err) {
        console.error("Erreur lors de la transformation de l'item:", err, item);
        return null;
      }
    },
    [buildImageUrl],
  );

  // Transformer un FavoriItem en données pour la modal
  const transformToAnnonceData = useCallback((favori: FavoriItem): any => {
    if (!favori) return null;

    return {
      uuid: favori.itemUuid,
      title: favori.title,
      description: favori.description,
      image: favori.image,
      type: favori.type,
      status: favori.status,
      date: favori.date,
      price: favori.price,
      quantity: favori.quantity,
      estPublie: favori.estPublie,
      estBloque: favori.estBloque,
      seller: favori.seller,
      category: favori.category,
      originalData: favori.originalData,
    };
  }, []);

  // Charger les détails complets d'un favori
  const fetchFullDetails = useCallback(async (favori: FavoriItem) => {
    if (!favori?.itemUuid) return;

    setDetailLoading(true);
    try {
      let endpoint = "";

      switch (favori.type) {
        case "produit":
          endpoint = API_ENDPOINTS.PRODUCTS.DETAIL(favori.itemUuid);
          break;
        case "don":
          endpoint = API_ENDPOINTS.DONS.DETAIL(favori.itemUuid);
          break;
        case "echange":
          endpoint = API_ENDPOINTS.ECHANGES.DETAIL(favori.itemUuid);
          break;
        case "annonce":
          endpoint = API_ENDPOINTS.ANNONCES.DETAIL(favori.itemUuid);
          break;
      }

      if (endpoint) {
        const response = await api.get(endpoint);
        setFullDetails(response.data || response);
      } else {
        setFullDetails(favori.originalData);
      }
    } catch (err: any) {
      console.error("Erreur lors du chargement des détails:", err);
      setFullDetails(favori.originalData);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // Gérer l'ouverture de la modal de détails
  const handleView = useCallback(
    (favoriteId: string) => {
      const favori = favoris.find((f) => f.favoriteId === favoriteId);

      if (!favori) {
        console.error("Favori non trouvé pour l'ID:", favoriteId);
        alert("Favori non trouvé");
        return;
      }

      setSelectedFavori(favori);
      setShowViewModal(true);
      fetchFullDetails(favori);
    },
    [favoris, fetchFullDetails],
  );

  // Fermer la modal
  const handleCloseModal = useCallback(() => {
    setShowViewModal(false);
    setSelectedFavori(null);
    setFullDetails(null);
  }, []);

  // ✅ Fonction pour extraire les données de la réponse API
  const extractDataFromResponse = useCallback(<T,>(response: any): T[] => {
    if (!response) return [];

    // CAS 1: La réponse a une propriété 'data' qui contient le tableau
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }
    // CAS 2: La réponse elle-même est un tableau
    else if (Array.isArray(response)) {
      return response;
    }
    // CAS 3: La réponse a une structure { data: [...] }
    else if (response?.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    // CAS 4: La réponse a une structure avec statusCode et data
    else if (
      response?.data &&
      typeof response.data === "object" &&
      "data" in response.data &&
      Array.isArray(response.data.data)
    ) {
      return response.data.data;
    }
    // CAS 5: La réponse est directement l'objet avec data
    else if (
      response?.data &&
      typeof response.data === "object" &&
      Array.isArray(response.data)
    ) {
      return response.data;
    }

    console.warn("Structure de réponse inattendue:", response);
    return [];
  }, []);

  // ✅ Charger les favoris - VERSION AMÉLIORÉE
  const fetchFavoris = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("📡 Chargement des favoris...");

      // Utiliser l'endpoint générique /favoris
      const response = await api.get(API_ENDPOINTS.FAVORIS.LIST);
      console.log("✅ Réponse de /favoris:", response);

      // Extraire les données avec la fonction utilitaire
      const favorisData = extractDataFromResponse<any>(response);

      console.log(`📊 ${favorisData.length} favori(s) trouvé(s)`);

      if (favorisData.length === 0) {
        setFavoris([]);
        setLoading(false);
        return;
      }

      // Transformer les données
      const transformedData = favorisData
        .map((item: any) => transformFavoriData(item))
        .filter((item): item is FavoriItem => item !== null);

      // Trier par date (plus récents d'abord)
      const sortedData = [...transformedData].sort((a, b) => {
        const dateA = a.addedAt ? new Date(a.addedAt).getTime() : 0;
        const dateB = b.addedAt ? new Date(b.addedAt).getTime() : 0;
        return dateB - dateA;
      });

      console.log(`✅ ${sortedData.length} favori(s) transformé(s)`);
      setFavoris(sortedData);
      setError(null);
    } catch (err: any) {
      console.error("❌ Erreur lors du chargement des favoris:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Une erreur est survenue lors du chargement des favoris",
      );
      setFavoris([]);
    } finally {
      setLoading(false);
    }
  }, [transformFavoriData, extractDataFromResponse]);

  // Charger les données au montage
  useEffect(() => {
    fetchFavoris();
  }, [fetchFavoris]);

  // ✅ Actions - SUPPRESSION AVEC L'ID DU FAVORI
  const handleRemoveFavori = useCallback(
    async (favoriteId: string, type: string) => {
      try {
        console.log(`🗑️ Suppression du favori: ${favoriteId}`);

        // Utiliser l'ID du favori pour la suppression
        await api.delete(API_ENDPOINTS.FAVORIS.REMOVE(favoriteId));

        // Mise à jour optimiste
        setFavoris((prev) => prev.filter((f) => f.favoriteId !== favoriteId));

        // Retirer des sélections si nécessaire
        if (selectedItems.has(favoriteId)) {
          setSelectedItems((prev) => {
            const newSet = new Set(prev);
            newSet.delete(favoriteId);
            return newSet;
          });
        }

        console.log("✅ Favori supprimé avec succès");
      } catch (err: any) {
        console.error("❌ Erreur lors de la suppression du favori:", err);
        alert(err.response?.data?.message || "Erreur lors de la suppression");
      }
    },
    [selectedItems],
  );

  const handleBulkRemove = useCallback(async (items: FavoriItem[]) => {
    if (items.length === 0) return;

    try {
      // Supprimer tous les favoris sélectionnés (utiliser l'ID du favori)
      const promises = items.map((item) =>
        api.delete(API_ENDPOINTS.FAVORIS.REMOVE(item.favoriteId)),
      );

      await Promise.all(promises);

      // Mise à jour optimiste
      const favoriteIds = new Set(items.map((item) => item.favoriteId));
      setFavoris((prev) => prev.filter((f) => !favoriteIds.has(f.favoriteId)));

      // Réinitialiser la sélection
      setSelectedItems(new Set());

      console.log(`✅ ${items.length} favori(s) supprimé(s) avec succès`);
    } catch (err: any) {
      console.error("❌ Erreur lors de la suppression en masse:", err);
      alert("Erreur lors de la suppression des favoris");
    }
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedType("tous");
    setSearchQuery("");
    setSelectedItems(new Set());
  }, []);

  const handleRefresh = useCallback(() => {
    fetchFavoris();
  }, [fetchFavoris]);

  // Gérer la sélection/désélection
  const handleSelectItem = useCallback((favoriteId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(favoriteId)) {
        newSet.delete(favoriteId);
      } else {
        newSet.add(favoriteId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedItems.size === filteredFavoris.length) {
      setSelectedItems(new Set());
    } else {
      const allIds = new Set(filteredFavoris.map((f) => f.favoriteId));
      setSelectedItems(allIds);
    }
  }, [filteredFavoris, selectedItems]);

  // Statistiques
  const stats = useMemo(() => {
    const total = favoris.length;
    const produits = favoris.filter((f) => f.type === "produit").length;
    const dons = favoris.filter((f) => f.type === "don").length;
    const echanges = favoris.filter((f) => f.type === "echange").length;
    const annonces = favoris.filter((f) => f.type === "annonce").length;

    return { total, produits, dons, echanges, annonces };
  }, [favoris]);

  return (
    <div
      className="container-fluid px-0"
      style={{ minHeight: "100vh", backgroundColor: colors.oskar.lightGrey }}
    >
      {/* Barre de filtres */}
      <FilterBar
        selectedType={selectedType}
        selectedStatus="tous"
        onTypeChange={setSelectedType}
        onStatusChange={() => {}}
        onSearchChange={setSearchQuery}
        onRefresh={handleRefresh}
        loading={loading}
        totalItems={filteredFavoris.length}
        onClearFilters={handleClearFilters}
        selectedCount={selectedItems.size}
        hideStatusFilter={true}
        isFavorisPage={true}
        stats={stats}
      />

      {/* Contenu principal */}
      <div className="container-fluid px-4 py-4">
        {/* En-tête */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1
              className="h4 fw-bold mb-2"
              style={{ color: colors.oskar.black }}
            >
              Mes favoris
            </h1>
            <p className="text-muted small mb-0">
              {filteredFavoris.length} élément(s) favori(s)
              {selectedType !== "tous" && ` • Type: ${selectedType}`}
              {searchQuery && ` • Recherche: "${searchQuery}"`}
            </p>
          </div>

          <div className="d-flex gap-2">
            {filteredFavoris.length > 0 && (
              <button
                type="button"
                className="btn btn-sm"
                onClick={handleSelectAll}
                style={{
                  backgroundColor: colors.oskar.lightGrey,
                  color: colors.oskar.grey,
                  border: "none",
                  padding: "0.375rem 0.75rem",
                  borderRadius: "6px",
                }}
              >
                {selectedItems.size === filteredFavoris.length
                  ? "Tout désélectionner"
                  : "Tout sélectionner"}
              </button>
            )}
            {(selectedType !== "tous" || searchQuery) && (
              <button
                type="button"
                className="btn btn-sm"
                onClick={handleClearFilters}
                style={{
                  backgroundColor: colors.oskar.lightGrey,
                  color: colors.oskar.grey,
                  border: "none",
                  padding: "0.375rem 0.75rem",
                  borderRadius: "6px",
                }}
              >
                Réinitialiser
              </button>
            )}
            {selectedItems.size > 0 && (
              <button
                type="button"
                className="btn btn-sm btn-danger"
                onClick={() => {
                  const selectedFavoris = favoris.filter((f) =>
                    selectedItems.has(f.favoriteId),
                  );
                  handleBulkRemove(selectedFavoris);
                }}
                style={{
                  padding: "0.375rem 0.75rem",
                  borderRadius: "6px",
                }}
              >
                Supprimer ({selectedItems.size})
              </button>
            )}
          </div>
        </div>

        {/* Afficher l'erreur si présente */}
        {error && (
          <div className="alert alert-danger mb-4" role="alert">
            <strong>Erreur:</strong> {error}
            <button
              type="button"
              className="btn btn-sm btn-outline-danger ms-3"
              onClick={handleRefresh}
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Tableau ou état vide */}
        {filteredFavoris.length > 0 ? (
          <FavorisTable
            data={filteredFavoris}
            loading={loading}
            error={error}
            onRemove={handleRemoveFavori}
            onView={handleView}
            onRefresh={handleRefresh}
            selectedItems={selectedItems}
            onSelectionChange={handleSelectItem}
            onBulkRemove={handleBulkRemove}
            className="mb-4"
          />
        ) : (
          <EmptyState
            title={loading ? "Chargement..." : "Aucun favori trouvé"}
            description={
              loading
                ? "Chargement de vos favoris en cours..."
                : searchQuery || selectedType !== "tous"
                  ? "Aucun favori ne correspond à vos critères de recherche."
                  : "Vous n'avez pas encore ajouté d'éléments à vos favoris."
            }
            searchQuery={searchQuery}
            showResetButton={selectedType !== "tous" || searchQuery !== ""}
            onReset={handleClearFilters}
          />
        )}
      </div>

      {/* Modal de détails */}
      {selectedFavori && (
        <ViewModal
          isOpen={showViewModal}
          onClose={handleCloseModal}
          annonce={transformToAnnonceData(selectedFavori)}
          type={selectedFavori.type}
          fullDetails={fullDetails}
          loading={detailLoading}
        />
      )}
    </div>
  );
}
