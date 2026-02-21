"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";
import FilterBar from "./components/FilterBar";
import FavorisTable from "./components/FavorisTable";
import ViewModal from "../annonces/components/ViewModal";
import EmptyState from "../annonces/components/EmptyState";

// Type qui correspond exactement à ce qu'attend FavorisTable
interface FavoriItem {
  uuid: string;
  title: string;
  description?: string;
  image: string | null; // Changé pour accepter null
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
    avatar?: string;
    avatar_key?: string;
    isPro?: boolean;
    type?: string;
  };
  category?: string;
  originalData?: any;
  favoriteId: string;
  addedAt: string;
  itemUuid: string;
}

export default function FavorisPage() {
  const [favoris, setFavoris] = useState<FavoriItem[]>([]);
  const [filteredFavoris, setFilteredFavoris] = useState<FavoriItem[]>([]);
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

  // Fonction pour construire l'URL d'une image
  const buildImageUrl = (imagePath: string | null): string | null => {
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

    // Chemin simple
    return `${apiUrl}${filesUrl}/${imagePath}`;
  };

  // Fonction pour transformer les données de favoris selon le type
  const transformFavoriData = useCallback(
    (item: any): FavoriItem | null => {
      try {
        if (!item) return null;

        // Déterminer le type et l'item correspondant
        let itemData: any = null;
        let type: "produit" | "don" | "echange" | "annonce" = "produit";

        // Déterminer le type basé sur les champs présents
        if (item.produit && typeof item.produit === "object") {
          itemData = item.produit;
          type = "produit";
        } else if (item.don && typeof item.don === "object") {
          itemData = item.don;
          type = "don";
        } else if (item.echange && typeof item.echange === "object") {
          itemData = item.echange;
          type = "echange";
        } else if (item.annonce && typeof item.annonce === "object") {
          itemData = item.annonce;
          type = "annonce";
        } else {
          // Essayer de deviner le type à partir des champs UUID
          if (item.produitUuid) {
            type = "produit";
            itemData = item;
          } else if (item.donUuid) {
            type = "don";
            itemData = item;
          } else if (item.echangeUuid) {
            type = "echange";
            itemData = item;
          } else if (item.annonceUuid) {
            type = "annonce";
            itemData = item;
          } else {
            // Vérifier le type explicitement défini
            if (
              item.type === "produit" ||
              item.type === "don" ||
              item.type === "echange" ||
              item.type === "annonce"
            ) {
              type = item.type;
              itemData = item;
            } else {
              console.warn("Type inconnu pour l'item:", item);
              return null;
            }
          }
        }

        // Si itemData est null, utiliser l'item lui-même
        if (!itemData) {
          itemData = item;
        }

        // Extraire les informations de base
        const itemUuid = item.itemUuid || itemData.uuid || "";
        const favoriteId = item.uuid || ""; // ← C'EST l'ID du favori lui-même

        if (!favoriteId) {
          console.warn("Pas d'ID de favori trouvé pour:", item);
          return null;
        }

        // Construire l'URL de l'image
        let imageUrl: string | null = null;
        if (itemData.image_key) {
          imageUrl = buildImageUrl(itemData.image_key);
        } else if (itemData.image) {
          imageUrl = buildImageUrl(itemData.image);
        }

        // Configurations communes
        const commonData = {
          uuid:
            item.produitUuid ||
            item.donUuid ||
            item.echangeUuid ||
            item.annonceUuid ||
            itemUuid,
          itemUuid: itemUuid, // UUID original de l'élément
          favoriteId: favoriteId, // UUID du favori lui-même
          addedAt:
            item.createdAt || itemData.createdAt || new Date().toISOString(),
          type,
          originalData: item,
        };

        // Traitement spécifique selon le type
        switch (type) {
          case "produit":
            return {
              ...commonData,
              title: itemData.libelle || itemData.nom || "Produit sans nom",
              description: itemData.description || "",
              image: imageUrl,
              image_key: itemData.image_key,
              status: (itemData.statut || "inconnu").toLowerCase(),
              date:
                itemData.createdAt || itemData.updatedAt || commonData.addedAt,
              price: itemData.prix || null,
              quantity: itemData.quantite || 1,
              estPublie: itemData.estPublie || false,
              estBloque: itemData.estBloque || itemData.est_bloque || false,
              seller: {
                name: item.vendeur?.nom
                  ? `${item.vendeur.prenoms || ""} ${item.vendeur.nom}`.trim()
                  : itemData.vendeur?.nom
                    ? `${itemData.vendeur.prenoms || ""} ${itemData.vendeur.nom}`.trim()
                    : "Vendeur",
                isPro: !!item.vendeur?.boutique || !!itemData.vendeur?.boutique,
                type: "vendeur",
                avatar: item.vendeur?.avatar || itemData.vendeur?.avatar,
                avatar_key:
                  item.vendeur?.avatar_key || itemData.vendeur?.avatar_key,
              },
              category:
                itemData.categorie?.libelle || itemData.categorie_uuid || "",
            };

          case "don":
            return {
              ...commonData,
              title: itemData.nom || itemData.titre || "Don sans nom",
              description: itemData.description || "",
              image: imageUrl,
              image_key: itemData.image_key,
              status: (itemData.statut || "inconnu").toLowerCase(),
              date: itemData.date_debut || commonData.addedAt,
              price: itemData.prix || itemData.valeur_estimee || null,
              quantity: itemData.quantite || 1,
              estPublie: itemData.estPublie || false,
              estBloque: itemData.est_bloque || false,
              seller: {
                name: item.vendeur?.nom
                  ? `${item.vendeur.prenoms || ""} ${item.vendeur.nom}`.trim()
                  : itemData.nom_donataire || "Donateur",
                type: item.vendeur ? "vendeur" : "utilisateur",
              },
              category: itemData.categorie?.libelle || "",
            };

          case "echange":
            return {
              ...commonData,
              title:
                itemData.nomElementEchange ||
                itemData.titre ||
                "Échange sans nom",
              description: itemData.description || itemData.message || "",
              image: imageUrl,
              image_key: itemData.image_key,
              status: (itemData.statut || "inconnu").toLowerCase(),
              date: itemData.dateProposition || commonData.addedAt,
              price: itemData.prix || itemData.valeur_estimee || null,
              quantity: itemData.quantite || 1,
              estPublie: itemData.estPublie || false,
              estBloque: itemData.estBloque || false,
              seller: {
                name: item.vendeur?.nom
                  ? `${item.vendeur.prenoms || ""} ${item.vendeur.nom}`.trim()
                  : itemData.nom_initiateur || "Initiateur",
                type: item.vendeur ? "vendeur" : "utilisateur",
              },
              category: itemData.categorie?.libelle || "",
            };

          case "annonce":
            return {
              ...commonData,
              title: itemData.titre || itemData.nom || "Annonce sans nom",
              description: itemData.description || "",
              image: imageUrl,
              image_key: itemData.image_key,
              status: (itemData.statut || "inconnu").toLowerCase(),
              date: itemData.created_at || commonData.addedAt,
              price: itemData.prix || null,
              quantity: itemData.quantite || 1,
              estPublie: itemData.estPublie || false,
              estBloque: itemData.est_bloque || false,
              seller: {
                name: item.vendeur?.nom
                  ? `${item.vendeur.prenoms || ""} ${item.vendeur.nom}`.trim()
                  : "Annonceur",
                type: "annonceur",
              },
              category: itemData.categorie?.libelle || itemData.type || "",
            };

          default:
            return null;
        }
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
      // Utiliser les données de base si l'API échoue
      setFullDetails(favori.originalData);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // Gérer l'ouverture de la modal de détails
  const handleView = useCallback(
    (favoriteId: string) => {
      console.log("handleView appelé avec favoriteId:", favoriteId);
      console.log(
        "Liste des favoris disponibles:",
        favoris.map((f) => ({
          favoriteId: f.favoriteId,
          itemUuid: f.itemUuid,
          title: f.title,
          uuid: f.uuid,
        })),
      );

      // Chercher le favori par favoriteId
      const favori = favoris.find((f) => f.favoriteId === favoriteId);

      if (!favori) {
        // Si non trouvé, essayer par itemUuid
        const favoriByItemUuid = favoris.find((f) => f.itemUuid === favoriteId);
        if (favoriByItemUuid) {
          console.log("Favori trouvé par itemUuid:", favoriByItemUuid);
          setSelectedFavori(favoriByItemUuid);
          setShowViewModal(true);
          fetchFullDetails(favoriByItemUuid);
          return;
        }

        // Si encore non trouvé, essayer par uuid
        const favoriByUuid = favoris.find((f) => f.uuid === favoriteId);
        if (favoriByUuid) {
          console.log("Favori trouvé par uuid:", favoriByUuid);
          setSelectedFavori(favoriByUuid);
          setShowViewModal(true);
          fetchFullDetails(favoriByUuid);
          return;
        }

        console.error("Favori non trouvé pour l'ID:", favoriteId);
        alert("Favori non trouvé");
        return;
      }

      console.log("Favori trouvé:", favori);
      setSelectedFavori(favori);
      setShowViewModal(true);
      fetchFullDetails(favori);
    },
    [favoris, fetchFullDetails],
  );

  // Fermer la modal
  const handleCloseModal = useCallback(() => {
    console.log("Fermeture de la modal");
    setShowViewModal(false);
    setSelectedFavori(null);
    setFullDetails(null);
  }, []);

  // Charger les favoris
  const fetchFavoris = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let response;

      try {
        // Premier essai: endpoint générique pour les favoris
        response = await api.get(API_ENDPOINTS.FAVORIS.LIST);
        console.log("Réponse de /favoris:", response);
      } catch (err1: any) {
        console.log("Erreur avec /favoris, essai /favoris/produits:", err1);

        // Deuxième essai: endpoint spécifique pour les produits favoris
        try {
          response = await api.get(API_ENDPOINTS.FAVORIS.PRODUITS);
          console.log("Réponse de /favoris/produits:", response);
        } catch (err2: any) {
          console.log(
            "Erreur avec /favoris/produits, essai /produits/favoris:",
            err2,
          );

          // Troisième essai: endpoint via produits
          try {
            response = await api.get(
              API_ENDPOINTS.PRODUCTS.DETAIL_FAVORIS_UTILISATEUR,
            );
            console.log("Réponse de /produits/favoris:", response);
          } catch (err3: any) {
            console.log("Tous les endpoints ont échoué:", err3);
            throw new Error(
              "Impossible de récupérer les favoris. Vérifiez les permissions.",
            );
          }
        }
      }

      // Extraire les données selon la structure de la réponse
      const responseData = response.data || response;
      console.log("Données de réponse complètes:", responseData);

      let favorisData: any[] = [];

      // Essayer différentes structures de données
      if (responseData?.favoris && Array.isArray(responseData.favoris)) {
        favorisData = responseData.favoris;
        console.log(
          "Données extraites de responseData.favoris:",
          favorisData.length,
        );
      } else if (Array.isArray(responseData)) {
        favorisData = responseData;
        console.log(
          "Données extraites de responseData (array):",
          favorisData.length,
        );
      } else if (
        responseData?.data?.favoris &&
        Array.isArray(responseData.data.favoris)
      ) {
        favorisData = responseData.data.favoris;
        console.log(
          "Données extraites de responseData.data.favoris:",
          favorisData.length,
        );
      } else if (Array.isArray(responseData?.data)) {
        favorisData = responseData.data;
        console.log(
          "Données extraites de responseData.data (array):",
          favorisData.length,
        );
      } else if (
        responseData?.produits &&
        Array.isArray(responseData.produits)
      ) {
        // Cas spécial pour l'endpoint /produits/favoris
        favorisData = responseData.produits.map((produit: any) => ({
          ...produit,
          type: "produit",
          produit: produit,
          uuid: produit.uuid,
        }));
        console.log(
          "Données extraites de responseData.produits:",
          favorisData.length,
        );
      } else {
        // Essayer de trouver un tableau quelque part dans l'objet
        const findArrayInObject = (obj: any): any[] => {
          for (const key in obj) {
            if (Array.isArray(obj[key])) {
              console.log("Tableau trouvé dans la clé:", key);
              return obj[key];
            }
          }
          console.log("Aucun tableau trouvé dans l'objet");
          return [];
        };
        favorisData = findArrayInObject(responseData);
      }

      console.log("Données brutes des favoris:", favorisData);

      if (!Array.isArray(favorisData) || favorisData.length === 0) {
        console.log("Aucun favori trouvé ou tableau vide");
        setFavoris([]);
        setLoading(false);
        return;
      }

      // Transformer les données
      const transformedData = favorisData
        .map((item: any) => {
          const transformed = transformFavoriData(item);
          if (transformed) {
            console.log("Item transformé:", transformed);
          }
          return transformed;
        })
        .filter((item): item is FavoriItem => item !== null);

      console.log("Données transformées:", transformedData);

      setFavoris(transformedData);
    } catch (err: any) {
      console.error("Erreur lors du chargement des favoris:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Une erreur est survenue lors du chargement des favoris",
      );
      setFavoris([]);
    } finally {
      setLoading(false);
    }
  }, [transformFavoriData]);

  // Filtrer par type et recherche
  useEffect(() => {
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

        return (
          title.includes(query) ||
          description.includes(query) ||
          category.includes(query)
        );
      });
    }

    console.log("Favoris filtrés:", filtered.length);
    setFilteredFavoris(filtered);
  }, [favoris, selectedType, searchQuery]);

  // Charger les données au montage
  useEffect(() => {
    fetchFavoris();
  }, [fetchFavoris]);

  // Actions
  const handleRemoveFavori = useCallback(
    async (favoriteId: string, type: string) => {
      try {
        // Trouver le favori par son ID
        const favori = favoris.find((f) => f.favoriteId === favoriteId);
        if (!favori) {
          console.error("Favori non trouvé:", favoriteId);
          alert("Favori non trouvé");
          return;
        }

        console.log("Suppression du favori:", {
          favoriteId,
          uuid: favori.uuid,
          type: favori.type,
        });

        // Supprimer le favori - utiliser l'UUID de l'item
        await api.delete(API_ENDPOINTS.FAVORIS.REMOVE(favori.uuid));

        // Mise à jour optimiste
        setFavoris((prev) => prev.filter((f) => f.favoriteId !== favoriteId));

        alert("Favori retiré avec succès");
      } catch (err: any) {
        console.error("Erreur lors de la suppression du favori:", err);
        alert(err.response?.data?.message || "Erreur lors de la suppression");
      }
    },
    [favoris],
  );

  const handleBulkRemove = useCallback(async (items: FavoriItem[]) => {
    if (items.length === 0) {
      alert("Aucun favori sélectionné");
      return;
    }

    try {
      // Supprimer tous les favoris sélectionnés
      const promises = items.map((item) =>
        api.delete(API_ENDPOINTS.FAVORIS.REMOVE(item.uuid)),
      );

      await Promise.all(promises);

      // Mise à jour optimiste
      const favoriteIds = new Set(items.map((item) => item.favoriteId));
      setFavoris((prev) => prev.filter((f) => !favoriteIds.has(f.favoriteId)));

      // Réinitialiser la sélection
      setSelectedItems(new Set());

      alert(`${items.length} favori(s) retiré(s) avec succès`);
    } catch (err: any) {
      console.error("Erreur lors de la suppression en masse:", err);
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
      // Si tous sont déjà sélectionnés, tout désélectionner
      setSelectedItems(new Set());
    } else {
      // Sinon, tout sélectionner
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
