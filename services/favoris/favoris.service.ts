// services/favoris/favoris.service.ts
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import type {
  Favori,
  FavoriCreateData,
  FavoriUpdateData,
  FavoriFilterParams,
  FavoriPaginationParams,
  FavoriStats,
  CollectionFavoris,
  CollectionCreateData,
  CollectionUpdateData,
  NotificationFavori,
  HistoriqueFavori,
  SuggestionFavori,
  ExportFavorisOptions,
  AnalyticsFavoris,
  PartageCollection,
  RappelFavori,
  BatchFavorisOperation,
} from "./favoris.types";

export interface ApiResponse<T> {
  data: T;
  status: string;
  message?: string;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
}

export const favorisService = {
  // ==================== CRUD Favoris ====================

  async getFavoris(params?: FavoriPaginationParams): Promise<{
    favoris: Favori[];
    count?: number;
    total?: number;
    page?: number;
    pages?: number;
  }> {
    const queryParams = new URLSearchParams();

    // Pagination
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);

    // Filters
    if (params?.filters) {
      const filters = params.filters;
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value)) {
            queryParams.append(key, value.join(","));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.FAVORIS.LIST}?${queryString}`
      : API_ENDPOINTS.FAVORIS.LIST;

    console.log("📡 Fetching favoris from:", endpoint);

    try {
      const response = await api.get<ApiResponse<Favori[]>>(endpoint);

      console.log("✅ Favoris response received:", {
        hasData: !!response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
      });

      let favoris: Favori[] = [];
      let count = 0;
      let total = 0;
      let page = 1;
      let pages = 1;

      if (Array.isArray(response.data)) {
        favoris = response.data;
        count = response.data.length;
      } else if (response.data && typeof response.data === "object") {
        if (
          "data" in response.data &&
          Array.isArray((response.data as any).data)
        ) {
          favoris = (response.data as any).data || [];
          count = (response.data as any).count || favoris.length;
          total = (response.data as any).total || count;
          page = (response.data as any).page || 1;
          pages = (response.data as any).pages || 1;
        } else if (
          "favoris" in response.data &&
          Array.isArray((response.data as any).favoris)
        ) {
          favoris = (response.data as any).favoris || [];
          count = (response.data as any).count || favoris.length;
          total = (response.data as any).total || count;
          page = (response.data as any).page || 1;
          pages = (response.data as any).pages || 1;
        }
      }

      return { favoris, count, total, page, pages };
    } catch (error: any) {
      console.error("🚨 Error in favorisService.getFavoris:", {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  async getFavori(uuid: string): Promise<Favori> {
    try {
      console.log("🔍 Fetching favori:", uuid);

      const response = await api.get<ApiResponse<Favori>>(
        API_ENDPOINTS.FAVORIS.DETAIL(uuid),
      );

      console.log("✅ Favori response:", {
        hasData: !!response.data,
        dataType: typeof response.data,
      });

      let favoriData: Favori;

      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        favoriData = (response.data as any).data;
      } else if (response.data && (response.data as any).uuid) {
        favoriData = response.data as Favori;
      } else {
        console.error("❌ Invalid favori data structure:", response.data);
        throw new Error("Structure de données favori invalide");
      }

      if (!favoriData || !favoriData.uuid) {
        throw new Error("Favori non trouvé");
      }

      console.log("✅ Favori found");
      return favoriData;
    } catch (error: any) {
      console.error("❌ Error fetching favori:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },

  async createFavori(favoriData: FavoriCreateData): Promise<Favori> {
    try {
      console.log("❤️ Creating favori for element:", favoriData.element_uuid);

      // Vérifier si l'élément existe déjà en favori
      const existing = await this.checkIfFavoriExists(
        favoriData.utilisateur_uuid,
        favoriData.type_element,
        favoriData.element_uuid,
      );

      if (existing) {
        console.log("⚠️ Favori already exists, updating...");
        return await this.updateFavori(existing.uuid, {
          notes_utilisateur: favoriData.notes_utilisateur,
          tags_personnels: favoriData.tags_personnels,
          collection_uuid: favoriData.collection_uuid,
          priorite: favoriData.priorite,
          statut: "actif",
        });
      }

      const response = await api.post<ApiResponse<Favori>>(
        API_ENDPOINTS.FAVORIS.CREATE,
        favoriData,
      );

      console.log("✅ Favori creation response:", response.data);

      let createdFavori: Favori;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        createdFavori = (response.data as any).data;
      } else {
        createdFavori = response.data as Favori;
      }

      if (!createdFavori || !createdFavori.uuid) {
        throw new Error("Échec de la création du favori");
      }

      return createdFavori;
    } catch (error: any) {
      console.error("❌ Error creating favori:", {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  async updateFavori(
    uuid: string,
    favoriData: FavoriUpdateData,
  ): Promise<Favori> {
    try {
      console.log("✏️ Updating favori:", uuid);

      const response = await api.put<ApiResponse<Favori>>(
        API_ENDPOINTS.FAVORIS.UPDATE(uuid),
        favoriData,
      );

      console.log("✅ Favori update response:", response.data);

      let updatedFavori: Favori;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        updatedFavori = (response.data as any).data;
      } else {
        updatedFavori = response.data as Favori;
      }

      return updatedFavori;
    } catch (error: any) {
      console.error("❌ Error updating favori:", error);
      throw error;
    }
  },

  async deleteFavori(uuid: string): Promise<void> {
    try {
      console.log("🗑️ Deleting favori:", uuid);

      await api.delete(API_ENDPOINTS.FAVORIS.DELETE(uuid));

      console.log("✅ Favori deleted successfully");
    } catch (error: any) {
      console.error("❌ Error deleting favori:", error);
      throw error;
    }
  },

  // ==================== Opérations Favoris ====================

  async checkIfFavoriExists(
    utilisateurUuid: string,
    typeElement: string,
    elementUuid: string,
  ): Promise<Favori | null> {
    try {
      console.log("🔍 Checking if favori exists:", {
        utilisateurUuid,
        typeElement,
        elementUuid,
      });

      const { favoris } = await this.getFavoris({
        filters: {
          utilisateur_uuid: utilisateurUuid,
          type_element: typeElement,
          element_uuid: elementUuid,
          statut: "actif",
        },
        limit: 1,
      });

      return favoris.length > 0 ? favoris[0] : null;
    } catch (error: any) {
      console.error("❌ Error checking favori existence:", error);
      return null;
    }
  },

  async toggleFavori(
    favoriData: FavoriCreateData,
  ): Promise<{ added: boolean; favori?: Favori }> {
    try {
      console.log("🔄 Toggling favori for element:", favoriData.element_uuid);

      const existing = await this.checkIfFavoriExists(
        favoriData.utilisateur_uuid,
        favoriData.type_element,
        favoriData.element_uuid,
      );

      if (existing) {
        // Supprimer le favori existant
        await this.deleteFavori(existing.uuid);
        console.log("✅ Favori removed");
        return { added: false };
      } else {
        // Ajouter un nouveau favori
        const newFavori = await this.createFavori(favoriData);
        console.log("✅ Favori added");
        return { added: true, favori: newFavori };
      }
    } catch (error: any) {
      console.error("❌ Error toggling favori:", error);
      throw error;
    }
  },

  async incrementFavoriViews(favoriUuid: string): Promise<Favori> {
    try {
      console.log("👀 Incrementing views for favori:", favoriUuid);

      const endpoint = API_ENDPOINTS.FAVORIS.INCREMENT_VIEWS(favoriUuid);
      const response = await api.post<ApiResponse<Favori>>(endpoint);

      let favori: Favori;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        favori = (response.data as any).data;
      } else {
        favori = response.data as Favori;
      }

      console.log("✅ Views incremented");
      return favori;
    } catch (error: any) {
      console.error("❌ Error incrementing favori views:", error);
      throw error;
    }
  },

  async archiveFavori(uuid: string): Promise<Favori> {
    try {
      console.log("📁 Archiving favori:", uuid);

      const updates: FavoriUpdateData = {
        statut: "archive",
      };

      return await this.updateFavori(uuid, updates);
    } catch (error: any) {
      console.error("❌ Error archiving favori:", error);
      throw error;
    }
  },

  async restoreFavori(uuid: string): Promise<Favori> {
    try {
      console.log("↩️ Restoring favori:", uuid);

      const updates: FavoriUpdateData = {
        statut: "actif",
      };

      return await this.updateFavori(uuid, updates);
    } catch (error: any) {
      console.error("❌ Error restoring favori:", error);
      throw error;
    }
  },

  async updateFavoriPriority(
    uuid: string,
    priorite: "faible" | "moyen" | "elevee" | "urgent",
  ): Promise<Favori> {
    try {
      console.log("🎯 Updating favori priority:", uuid, "to:", priorite);

      const updates: FavoriUpdateData = { priorite };
      return await this.updateFavori(uuid, updates);
    } catch (error: any) {
      console.error("❌ Error updating favori priority:", error);
      throw error;
    }
  },

  // ==================== Filtres Spéciaux Favoris ====================

  async getFavorisByUser(
    utilisateurUuid: string,
    params?: FavoriPaginationParams,
  ): Promise<{ favoris: Favori[]; count: number }> {
    try {
      console.log("👤 Getting favoris for user:", utilisateurUuid);

      const { favoris, count } = await this.getFavoris({
        ...params,
        filters: { utilisateur_uuid: utilisateurUuid, statut: "actif" },
      });

      console.log("✅ Found", favoris.length, "favoris for user");
      return { favoris, count: count || favoris.length };
    } catch (error: any) {
      console.error("❌ Error getting favoris by user:", error);
      throw error;
    }
  },

  async getFavorisByType(
    utilisateurUuid: string,
    typeElement: string,
    params?: FavoriPaginationParams,
  ): Promise<{ favoris: Favori[]; count: number }> {
    try {
      console.log(
        "📂 Getting favoris by type:",
        typeElement,
        "for user:",
        utilisateurUuid,
      );

      const { favoris, count } = await this.getFavoris({
        ...params,
        filters: {
          utilisateur_uuid: utilisateurUuid,
          type_element: typeElement,
          statut: "actif",
        },
      });

      console.log("✅ Found", favoris.length, "favoris of type", typeElement);
      return { favoris, count: count || favoris.length };
    } catch (error: any) {
      console.error("❌ Error getting favoris by type:", error);
      throw error;
    }
  },

  async getFavorisByCollection(
    collectionUuid: string,
    params?: FavoriPaginationParams,
  ): Promise<{ favoris: Favori[]; count: number }> {
    try {
      console.log("🗂️ Getting favoris by collection:", collectionUuid);

      const { favoris, count } = await this.getFavoris({
        ...params,
        filters: { collection_uuid: collectionUuid, statut: "actif" },
      });

      console.log("✅ Found", favoris.length, "favoris in collection");
      return { favoris, count: count || favoris.length };
    } catch (error: any) {
      console.error("❌ Error getting favoris by collection:", error);
      throw error;
    }
  },

  async getFavorisWithNotifications(
    utilisateurUuid: string,
  ): Promise<Favori[]> {
    try {
      console.log(
        "🔔 Getting favoris with notifications for user:",
        utilisateurUuid,
      );

      const { favoris } = await this.getFavoris({
        filters: {
          utilisateur_uuid: utilisateurUuid,
          notifications_actives: true,
          statut: "actif",
        },
      });

      console.log("✅ Found", favoris.length, "favoris with notifications");
      return favoris;
    } catch (error: any) {
      console.error("❌ Error getting favoris with notifications:", error);
      throw error;
    }
  },

  async getFavorisWithNotes(utilisateurUuid: string): Promise<Favori[]> {
    try {
      console.log("📝 Getting favoris with notes for user:", utilisateurUuid);

      const { favoris } = await this.getFavoris({
        filters: {
          utilisateur_uuid: utilisateurUuid,
          avec_notes: true,
          statut: "actif",
        },
      });

      console.log("✅ Found", favoris.length, "favoris with notes");
      return favoris;
    } catch (error: any) {
      console.error("❌ Error getting favoris with notes:", error);
      throw error;
    }
  },

  async getRecentFavoris(
    utilisateurUuid: string,
    limit: number = 10,
  ): Promise<Favori[]> {
    try {
      console.log("🕒 Getting recent favoris for user:", utilisateurUuid);

      const { favoris } = await this.getFavoris({
        filters: { utilisateur_uuid: utilisateurUuid, statut: "actif" },
        sort_by: "date_modification",
        sort_order: "desc",
        limit,
      });

      console.log("✅ Found", favoris.length, "recent favoris");
      return favoris;
    } catch (error: any) {
      console.error("❌ Error getting recent favoris:", error);
      throw error;
    }
  },

  async getMostViewedFavoris(
    utilisateurUuid: string,
    limit: number = 10,
  ): Promise<Favori[]> {
    try {
      console.log("👁️ Getting most viewed favoris for user:", utilisateurUuid);

      const { favoris } = await this.getFavoris({
        filters: { utilisateur_uuid: utilisateurUuid, statut: "actif" },
        sort_by: "vue_recente",
        sort_order: "desc",
        limit,
      });

      console.log("✅ Found", favoris.length, "most viewed favoris");
      return favoris;
    } catch (error: any) {
      console.error("❌ Error getting most viewed favoris:", error);
      throw error;
    }
  },

  // ==================== Collections ====================

  async getCollections(utilisateurUuid: string): Promise<CollectionFavoris[]> {
    try {
      console.log("🗂️ Getting collections for user:", utilisateurUuid);

      const endpoint = API_ENDPOINTS.FAVORIS.COLLECTIONS;
      const response = await api.get<ApiResponse<CollectionFavoris[]>>(
        endpoint,
        {
          params: { utilisateur_uuid: utilisateurUuid },
        },
      );

      let collections: CollectionFavoris[] = [];
      if (Array.isArray(response.data)) {
        collections = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        collections = (response.data as any).data || [];
      }

      console.log("✅ Found", collections.length, "collections");
      return collections;
    } catch (error: any) {
      console.error("❌ Error getting collections:", error);
      throw error;
    }
  },

  async getCollection(uuid: string): Promise<CollectionFavoris> {
    try {
      console.log("🔍 Getting collection:", uuid);

      const response = await api.get<ApiResponse<CollectionFavoris>>(
        API_ENDPOINTS.FAVORIS.COLLECTION_DETAIL(uuid),
      );

      let collection: CollectionFavoris;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        collection = (response.data as any).data;
      } else {
        collection = response.data as CollectionFavoris;
      }

      console.log("✅ Collection found");
      return collection;
    } catch (error: any) {
      console.error("❌ Error getting collection:", error);
      throw error;
    }
  },

  async createCollection(
    collectionData: CollectionCreateData,
  ): Promise<CollectionFavoris> {
    try {
      console.log("🆕 Creating collection:", collectionData.nom);

      const response = await api.post<ApiResponse<CollectionFavoris>>(
        API_ENDPOINTS.FAVORIS.COLLECTIONS_CREATE,
        collectionData,
      );

      console.log("✅ Collection creation response:", response.data);

      let createdCollection: CollectionFavoris;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        createdCollection = (response.data as any).data;
      } else {
        createdCollection = response.data as CollectionFavoris;
      }

      if (!createdCollection || !createdCollection.uuid) {
        throw new Error("Échec de la création de la collection");
      }

      return createdCollection;
    } catch (error: any) {
      console.error("❌ Error creating collection:", error);
      throw error;
    }
  },

  async updateCollection(
    uuid: string,
    collectionData: CollectionUpdateData,
  ): Promise<CollectionFavoris> {
    try {
      console.log("✏️ Updating collection:", uuid);

      const response = await api.put<ApiResponse<CollectionFavoris>>(
        API_ENDPOINTS.FAVORIS.COLLECTION_UPDATE(uuid),
        collectionData,
      );

      console.log("✅ Collection update response:", response.data);

      let updatedCollection: CollectionFavoris;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        updatedCollection = (response.data as any).data;
      } else {
        updatedCollection = response.data as CollectionFavoris;
      }

      return updatedCollection;
    } catch (error: any) {
      console.error("❌ Error updating collection:", error);
      throw error;
    }
  },

  async deleteCollection(uuid: string): Promise<void> {
    try {
      console.log("🗑️ Deleting collection:", uuid);

      await api.delete(API_ENDPOINTS.FAVORIS.COLLECTION_DELETE(uuid));

      console.log("✅ Collection deleted successfully");
    } catch (error: any) {
      console.error("❌ Error deleting collection:", error);
      throw error;
    }
  },

  async addFavoriToCollection(
    favoriUuid: string,
    collectionUuid: string,
  ): Promise<Favori> {
    try {
      console.log(
        "➕ Adding favori to collection:",
        favoriUuid,
        "->",
        collectionUuid,
      );

      const updates: FavoriUpdateData = { collection_uuid: collectionUuid };
      return await this.updateFavori(favoriUuid, updates);
    } catch (error: any) {
      console.error("❌ Error adding favori to collection:", error);
      throw error;
    }
  },
};
