// services/annonces/annonce.service.ts
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import type {
  Annonce,
  AnnonceCreateData,
  AnnonceUpdateData,
  PaginationParams,
  AnnonceStats,
  AnnonceFilters,
  SearchParams,
  AnnonceSearchResult,
  ImageUploadResponse,
  AnnonceValidation,
  SimilarAnnonce
} from "./annonce.types";

export interface ApiResponse<T> {
  data: T;
  status: string;
  message?: string;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
}

export const annonceService = {
  // ==================== CRUD Operations ====================

  async getAnnonces(params?: PaginationParams): Promise<{ annonces: Annonce[]; count?: number; total?: number; page?: number; pages?: number }> {
    const queryParams = new URLSearchParams();

    // Paramètres de pagination
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    // Filtres
    if (params?.type_annonce) queryParams.append("type_annonce", params.type_annonce);
    if (params?.statut) queryParams.append("statut", params.statut);
    if (params?.categorie_uuid) queryParams.append("categorie_uuid", params.categorie_uuid);
    if (params?.type_bien_uuid) queryParams.append("type_bien_uuid", params.type_bien_uuid);
    if (params?.type_transaction_uuid) queryParams.append("type_transaction_uuid", params.type_transaction_uuid);
    if (params?.ville) queryParams.append("ville", params.ville);
    if (params?.pays) queryParams.append("pays", params.pays);
    if (params?.prix_min !== undefined) queryParams.append("prix_min", params.prix_min.toString());
    if (params?.prix_max !== undefined) queryParams.append("prix_max", params.prix_max.toString());
    if (params?.surface_min !== undefined) queryParams.append("surface_min", params.surface_min.toString());
    if (params?.surface_max !== undefined) queryParams.append("surface_max", params.surface_max.toString());
    if (params?.nombre_pieces_min !== undefined) queryParams.append("nombre_pieces_min", params.nombre_pieces_min.toString());
    if (params?.nombre_pieces_max !== undefined) queryParams.append("nombre_pieces_max", params.nombre_pieces_max.toString());
    if (params?.nombre_chambres_min !== undefined) queryParams.append("nombre_chambres_min", params.nombre_chambres_min.toString());
    if (params?.nombre_chambres_max !== undefined) queryParams.append("nombre_chambres_max", params.nombre_chambres_max.toString());
    if (params?.is_featured !== undefined) queryParams.append("is_featured", params.is_featured.toString());
    if (params?.is_urgent !== undefined) queryParams.append("is_urgent", params.is_urgent.toString());
    if (params?.is_sponsorise !== undefined) queryParams.append("is_sponsorise", params.is_sponsorise.toString());
    if (params?.utilisateur_uuid) queryParams.append("utilisateur_uuid", params.utilisateur_uuid);
    if (params?.vendeur_uuid) queryParams.append("vendeur_uuid", params.vendeur_uuid);
    if (params?.agent_uuid) queryParams.append("agent_uuid", params.agent_uuid);

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.ANNONCES.LIST}?${queryString}`
      : API_ENDPOINTS.ANNONCES.LIST;

    console.log("📡 Fetching annonces from:", endpoint);

    try {
      const response = await api.get<ApiResponse<Annonce[]>>(endpoint);

      console.log("✅ Annonces response received:", {
        hasData: !!response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
      });

      let annonces: Annonce[] = [];
      let count = 0;
      let total = 0;
      let page = 1;
      let pages = 1;

      // Vérifier la structure de la réponse
      if (Array.isArray(response.data)) {
        // L'API retourne directement un tableau
        annonces = response.data;
        count = response.data.length;
        console.log("📊 API returned array directly, count:", count);
      } else if (response.data && typeof response.data === 'object') {
        // Vérifier si c'est une réponse wrapper
        if ('data' in response.data && Array.isArray((response.data as any).data)) {
          // Structure: { data: [...], status: "success", count: X }
          annonces = (response.data as any).data || [];
          count = (response.data as any).count || annonces.length;
          total = (response.data as any).total || count;
          page = (response.data as any).page || 1;
          pages = (response.data as any).pages || 1;
          console.log("📊 API returned wrapped data, count:", count);
        } else if ('annonces' in response.data && Array.isArray((response.data as any).annonces)) {
          // Structure alternative: { annonces: [...], count: X }
          annonces = (response.data as any).annonces || [];
          count = (response.data as any).count || annonces.length;
          total = (response.data as any).total || count;
          page = (response.data as any).page || 1;
          pages = (response.data as any).pages || 1;
          console.log("📊 API returned annonces data, count:", count);
        } else {
          console.warn("⚠️ Unexpected response format:", response.data);
        }
      }

      return { annonces, count, total, page, pages };
    } catch (error: any) {
      console.error("🚨 Error in annonceService.getAnnonces:", {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  async getAnnonce(uuid: string): Promise<Annonce> {
    try {
      console.log("🔍 Fetching annonce:", uuid);

      const response = await api.get<ApiResponse<Annonce>>(API_ENDPOINTS.ANNONCES.DETAIL(uuid));

      console.log("✅ Annonce response:", {
        hasData: !!response.data,
        dataType: typeof response.data,
        hasWrappedData: response.data && typeof response.data === 'object' && 'data' in response.data
      });

      let annonceData: Annonce;

      // Vérifier la structure de la réponse
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        // Structure: { data: {...}, status: "success" }
        annonceData = (response.data as any).data;
        console.log("📊 Using wrapped data structure");
      } else if (response.data && (response.data as any).uuid) {
        // Structure: l'annonce directement
        annonceData = response.data as Annonce;
        console.log("📊 Using direct annonce structure");
      } else {
        console.error("❌ Invalid annonce data structure:", response.data);
        throw new Error("Structure de données annonce invalide");
      }

      if (!annonceData || !annonceData.uuid) {
        throw new Error("Annonce non trouvée");
      }

      console.log("✅ Annonce found:", annonceData.titre);
      return annonceData;
    } catch (error: any) {
      console.error("❌ Error fetching annonce:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  async createAnnonce(annonceData: AnnonceCreateData): Promise<Annonce> {
    try {
      console.log("🆕 Creating annonce:", annonceData.titre);

      const response = await api.post<ApiResponse<Annonce>>(
        API_ENDPOINTS.ANNONCES.CREATE,
        annonceData,
      );

      console.log("✅ Annonce creation response:", response.data);

      // Vérifier la structure de la réponse
      let createdAnnonce: Annonce;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        createdAnnonce = (response.data as any).data;
      } else {
        createdAnnonce = response.data as Annonce;
      }

      if (!createdAnnonce || !createdAnnonce.uuid) {
        throw new Error("Échec de la création de l'annonce");
      }

      return createdAnnonce;
    } catch (error: any) {
      console.error("❌ Error creating annonce:", {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  async updateAnnonce(uuid: string, annonceData: AnnonceUpdateData): Promise<Annonce> {
    try {
      console.log("✏️ Updating annonce:", uuid);

      const response = await api.put<ApiResponse<Annonce>>(
        API_ENDPOINTS.ANNONCES.DETAIL(uuid),
        annonceData,
      );

      console.log("✅ Annonce update response:", response.data);

      // Vérifier la structure de la réponse
      let updatedAnnonce: Annonce;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        updatedAnnonce = (response.data as any).data;
      } else {
        updatedAnnonce = response.data as Annonce;
      }

      return updatedAnnonce;
    } catch (error: any) {
      console.error("❌ Error updating annonce:", error);
      throw error;
    }
  },

  async deleteAnnonce(uuid: string): Promise<void> {
    try {
      console.log("🗑️ Deleting annonce:", uuid);
      await api.delete(API_ENDPOINTS.ANNONCES.DELETE(uuid));
      console.log("✅ Annonce deleted successfully");
    } catch (error: any) {
      console.error("❌ Error deleting annonce:", error);
      throw error;
    }
  },

  // ==================== Status Management ====================

  async publishAnnonce(uuid: string): Promise<Annonce> {
    try {
      console.log("📢 Publishing annonce:", uuid);

      const response = await api.post<ApiResponse<Annonce>>(
        API_ENDPOINTS.ANNONCES.PUBLISH,
        { uuid }
      );

      // Vérifier la structure de la réponse
      let publishedAnnonce: Annonce;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        publishedAnnonce = (response.data as any).data;
      } else {
        publishedAnnonce = response.data as Annonce;
      }

      console.log("✅ Annonce published successfully");
      return publishedAnnonce;
    } catch (error: any) {
      console.error("❌ Error publishing annonce:", error);
      throw error;
    }
  },

  async unpublishAnnonce(uuid: string): Promise<Annonce> {
    try {
      console.log("🚫 Unpublishing annonce:", uuid);

      // Note: Cette route peut ne pas exister, à adapter selon votre API
      const response = await api.post<ApiResponse<Annonce>>(
        "/annonces/unpublish",
        { uuid }
      );

      // Vérifier la structure de la réponse
      let unpublishedAnnonce: Annonce;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        unpublishedAnnonce = (response.data as any).data;
      } else {
        unpublishedAnnonce = response.data as Annonce;
      }

      console.log("✅ Annonce unpublished successfully");
      return unpublishedAnnonce;
    } catch (error: any) {
      console.error("❌ Error unpublishing annonce:", error);
      throw error;
    }
  },

  async blockAnnonce(uuid: string): Promise<Annonce> {
    try {
      console.log("🚫 Blocking annonce:", uuid);

      // À adapter selon votre API
      const response = await api.post<ApiResponse<Annonce>>(
        `/annonces/${uuid}/bloquer`,
        {}
      );

      // Vérifier la structure de la réponse
      let blockedAnnonce: Annonce;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        blockedAnnonce = (response.data as any).data;
      } else {
        blockedAnnonce = response.data as Annonce;
      }

      console.log("✅ Annonce blocked successfully");
      return blockedAnnonce;
    } catch (error: any) {
      console.error("❌ Error blocking annonce:", error);
      throw error;
    }
  },

  async unblockAnnonce(uuid: string): Promise<Annonce> {
    try {
      console.log("✅ Unblocking annonce:", uuid);

      // À adapter selon votre API
      const response = await api.post<ApiResponse<Annonce>>(
        `/annonces/${uuid}/debloquer`,
        {}
      );

      // Vérifier la structure de la réponse
      let unblockedAnnonce: Annonce;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        unblockedAnnonce = (response.data as any).data;
      } else {
        unblockedAnnonce = response.data as Annonce;
      }

      console.log("✅ Annonce unblocked successfully");
      return unblockedAnnonce;
    } catch (error: any) {
      console.error("❌ Error unblocking annonce:", error);
      throw error;
    }
  },

  async restoreAnnonce(uuid: string): Promise<Annonce> {
    try {
      console.log("↩️ Restoring annonce:", uuid);

      const response = await api.post<ApiResponse<Annonce>>(
        API_ENDPOINTS.ANNONCES.RESTORE(uuid),
        {}
      );

      // Vérifier la structure de la réponse
      let restoredAnnonce: Annonce;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        restoredAnnonce = (response.data as any).data;
      } else {
        restoredAnnonce = response.data as Annonce;
      }

      console.log("✅ Annonce restored successfully");
      return restoredAnnonce;
    } catch (error: any) {
      console.error("❌ Error restoring annonce:", error);
      throw error;
    }
  },

  async markAsFeatured(uuid: string, featured: boolean = true): Promise<Annonce> {
    try {
      console.log(`⭐ ${featured ? 'Marking' : 'Unmarking'} annonce as featured:`, uuid);

      const response = await api.put<ApiResponse<Annonce>>(
        `/annonces/${uuid}/featured`,
        { is_featured: featured }
      );

      // Vérifier la structure de la réponse
      let updatedAnnonce: Annonce;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        updatedAnnonce = (response.data as any).data;
      } else {
        updatedAnnonce = response.data as Annonce;
      }

      console.log(`✅ Annonce ${featured ? 'marked' : 'unmarked'} as featured successfully`);
      return updatedAnnonce;
    } catch (error: any) {
      console.error("❌ Error marking annonce as featured:", error);
      throw error;
    }
  },

  async markAsUrgent(uuid: string, urgent: boolean = true): Promise<Annonce> {
    try {
      console.log(`🚨 ${urgent ? 'Marking' : 'Unmarking'} annonce as urgent:`, uuid);

      const response = await api.put<ApiResponse<Annonce>>(
        `/annonces/${uuid}/urgent`,
        { is_urgent: urgent }
      );

      // Vérifier la structure de la réponse
      let updatedAnnonce: Annonce;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        updatedAnnonce = (response.data as any).data;
      } else {
        updatedAnnonce = response.data as Annonce;
      }

      console.log(`✅ Annonce ${urgent ? 'marked' : 'unmarked'} as urgent successfully`);
      return updatedAnnonce;
    } catch (error: any) {
      console.error("❌ Error marking annonce as urgent:", error);
      throw error;
    }
  },

  // ==================== Specialized Lists ====================

  async getAnnoncesPubliees(params?: PaginationParams): Promise<{ annonces: Annonce[]; count?: number }> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.ANNONCES.ALL_PUBLISHED}?${queryString}`
      : API_ENDPOINTS.ANNONCES.ALL_PUBLISHED;

    console.log("📡 Fetching published annonces from:", endpoint);

    try {
      const response = await api.get<ApiResponse<Annonce[]>>(endpoint);

      // Gestion similaire à getAnnonces
      if (Array.isArray(response.data)) {
        return { annonces: response.data, count: response.data.length };
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return {
          annonces: (response.data as any).data || [],
          count: (response.data as any).count || (response.data as any).data?.length || 0
        };
      }
      return { annonces: [], count: 0 };
    } catch (error: any) {
      console.error("❌ Error fetching published annonces:", error);
      throw error;
    }
  },

  async getAnnoncesUtilisateur(utilisateurUuid: string, params?: PaginationParams): Promise<{ annonces: Annonce[]; count?: number }> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.ANNONCES.USER_ANNONCES}?${queryString}`
      : API_ENDPOINTS.ANNONCES.USER_ANNONCES;

    console.log("📡 Fetching user annonces from:", endpoint);

    try {
      const response = await api.get<ApiResponse<Annonce[]>>(endpoint);

      // Gestion similaire à getAnnonces
      if (Array.isArray(response.data)) {
        return { annonces: response.data, count: response.data.length };
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return {
          annonces: (response.data as any).data || [],
          count: (response.data as any).count || (response.data as any).data?.length || 0
        };
      }
      return { annonces: [], count: 0 };
    } catch (error: any) {
      console.error("❌ Error fetching user annonces:", error);
      throw error;
    }
  },

  async getAnnoncesVendeur(vendeurUuid: string, params?: PaginationParams): Promise<{ annonces: Annonce[]; count?: number }> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.ANNONCES.VENDEUR_ANNONCES}?${queryString}`
      : API_ENDPOINTS.ANNONCES.VENDEUR_ANNONCES;

    console.log("📡 Fetching vendeur annonces from:", endpoint);

    try {
      const response = await api.get<ApiResponse<Annonce[]>>(endpoint);

      // Gestion similaire à getAnnonces
      if (Array.isArray(response.data)) {
        return { annonces: response.data, count: response.data.length };
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return {
          annonces: (response.data as any).data || [],
          count: (response.data as any).count || (response.data as any).data?.length || 0
        };
      }
      return { annonces: [], count: 0 };
    } catch (error: any) {
      console.error("❌ Error fetching vendeur annonces:", error);
      throw error;
    }
  },

  async getAnnoncesBloquees(params?: PaginationParams): Promise<{ annonces: Annonce[]; count?: number }> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.ANNONCES.VENDEUR_BLOCKED}?${queryString}`
      : API_ENDPOINTS.ANNONCES.VENDEUR_BLOCKED;

    console.log("📡 Fetching blocked annonces from:", endpoint);

    try {
      const response = await api.get<ApiResponse<Annonce[]>>(endpoint);

      // Gestion similaire à getAnnonces
      if (Array.isArray(response.data)) {
        return { annonces: response.data, count: response.data.length };
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return {
          annonces: (response.data as any).data || [],
          count: (response.data as any).count || (response.data as any).data?.length || 0
        };
      }
      return { annonces: [], count: 0 };
    } catch (error: any) {
      console.error("❌ Error fetching blocked annonces:", error);
      throw error;
    }
  },

  // ==================== Search & Filter ====================

  async searchAnnonces(searchParams: SearchParams): Promise<AnnonceSearchResult> {
    try {
      console.log("🔍 Searching annonces:", searchParams.query);

      const { annonces, count, total } = await this.getAnnonces({
        ...searchParams.pagination,
        search: searchParams.query,
        ...this.convertFiltersToParams(searchParams.filters)
      });

      // Générer des suggestions basées sur la recherche
      const suggestions = this.generateSearchSuggestions(searchParams.query, annonces);

      return {
        annonces,
        count,
        total,
        suggestions,
        filters_available: searchParams.filters
      };
    } catch (error: any) {
      console.error("❌ Error searching annonces:", error);
      throw error;
    }
  },

  async filterAnnonces(filters: AnnonceFilters, params?: PaginationParams): Promise<{ annonces: Annonce[]; count?: number }> {
    try {
      console.log("🔍 Filtering annonces with filters:", filters);

      const filterParams = this.convertFiltersToParams(filters);

      const result = await this.getAnnonces({
        ...params,
        ...filterParams
      });

      console.log("✅ Filter completed, found:", result.annonces.length, "annonces");
      return result;
    } catch (error: any) {
      console.error("❌ Error filtering annonces:", error);
      throw error;
    }
  },

  private convertFiltersToParams(filters?: AnnonceFilters): Partial<PaginationParams> {
    if (!filters) return {};

    const params: Partial<PaginationParams> = {};

    if (filters.type_annonce && filters.type_annonce.length > 0) {
      params.type_annonce = filters.type_annonce[0]; // Prendre le premier pour l'instant
    }

    if (filters.categorie && filters.categorie.length > 0) {
      params.categorie_uuid = filters.categorie[0];
    }

    if (filters.type_bien && filters.type_bien.length > 0) {
      params.type_bien_uuid = filters.type_bien[0];
    }

    if (filters.ville && filters.ville.length > 0) {
      params.ville = filters.ville[0];
    }

    if (filters.prix_min !== undefined) {
      params.prix_min = filters.prix_min;
    }

    if (filters.prix_max !== undefined) {
      params.prix_max = filters.prix_max;
    }

    if (filters.surface_min !== undefined) {
      params.surface_min = filters.surface_min;
    }

    if (filters.surface_max !== undefined) {
      params.surface_max = filters.surface_max;
    }

    if (filters.is_urgent !== undefined) {
      params.is_urgent = filters.is_urgent;
    }

    if (filters.is_featured !== undefined) {
      params.is_featured = filters.is_featured;
    }

    return params;
  },

  private generateSearchSuggestions(query: string, annonces: Annonce[]): string[] {
    const suggestions: string[] = [];

    if (!query || query.length < 2) return suggestions;

    // Extraire les mots-clés des annonces similaires
    const commonKeywords = new Set<string>();

    annonces.forEach(annonce => {
      if (annonce.mots_cles) {
        annonce.mots_cles.forEach(keyword => {
          if (keyword.toLowerCase().includes(query.toLowerCase())) {
            commonKeywords.add(keyword);
          }
        });
      }

      // Ajouter la ville comme suggestion
      if (annonce.ville.toLowerCase().includes(query.toLowerCase())) {
        commonKeywords.add(annonce.ville);
      }

      // Ajouter le type de bien comme suggestion
      if (annonce.type_bien?.nom.toLowerCase().includes(query.toLowerCase())) {
        commonKeywords.add(annonce.type_bien.nom);
      }
    });

    return Array.from(commonKeywords).slice(0, 5);
  },

  // ==================== Statistics & Reports ====================

  async getAnnonceStats(): Promise<AnnonceStats> {
    try {
      console.log("📊 Fetching annonce statistics");

      // Récupérer toutes les annonces pour calculer les stats
      const { annonces } = await this.getAnnonces({ limit: 1000 });

      // Calculer les statistiques
      const stats: AnnonceStats = {
        total_annonces: annonces.length,
        annonces_publiees: annonces.filter(a => a.statut === 'publie').length,
        annonces_en_attente: annonces.filter(a => a.statut === 'en_attente').length,
        annonces_brouillons: annonces.filter(a => a.statut === 'brouillon').length,
        annonces_bloquees: annonces.filter(a => a.statut === 'bloque').length,
        annonces_archivees: annonces.filter(a => a.statut === 'archive').length,

        par_type_annonce: {
          vente: annonces.filter(a => a.type_annonce === 'vente').length,
          location: annonces.filter(a => a.type_annonce === 'location').length,
          echange: annonces.filter(a => a.type_annonce === 'echange').length,
          don: annonces.filter(a => a.type_annonce === 'don').length
        },

        par_categorie: {},
        par_ville: {},
        par_statut: {},

        vues_total: annonces.reduce((sum, a) => sum + a.vues, 0),
        favoris_total: annonces.reduce((sum, a) => sum + a.favoris, 0),
        annonces_urgentes: annonces.filter(a => a.is_urgent).length,
        annonces_featured: annonces.filter(a => a.is_featured).length,
        annonces_sponsorisees: annonces.filter(a => a.is_sponsorise).length
      };

      // Calculer les distributions
      annonces.forEach(annonce => {
        // Par catégorie
        const categorie = annonce.categorie?.nom || 'Non catégorisé';
        stats.par_categorie[categorie] = (stats.par_categorie[categorie] || 0) + 1;

        // Par ville
        stats.par_ville[annonce.ville] = (stats.par_ville[annonce.ville] || 0) + 1;

        // Par statut
        stats.par_statut[annonce.statut] = (stats.par_statut[annonce.statut] || 0) + 1;
      });

      console.log("✅ Annonce stats calculated:", stats);
      return stats;
    } catch (error: any) {
      console.error("❌ Error fetching annonce stats:", error);
      throw error;
    }
  },

  async getRecentAnnonces(limit: number = 10): Promise<Annonce[]> {
    try {
      console.log("🆕 Fetching recent annonces, limit:", limit);

      const { annonces } = await this.getAnnonces({
        limit,
        sortBy: 'created_at',
        sortOrder: 'desc',
        statut: 'publie'
      });

      console.log("✅ Recent annonces fetched:", annonces.length);
      return annonces;
    } catch (error: any) {
      console.error("❌ Error fetching recent annonces:", error);
      throw error;
    }
  },

  async getFeaturedAnnonces(limit: number = 6): Promise<Annonce[]> {
    try {
      console.log("⭐ Fetching featured annonces, limit:", limit);

      const { annonces } = await this.getAnnonces({
        limit,
        is_featured: true,
        statut: 'publie',
        sortBy: 'created_at',
        sortOrder: 'desc'
      });

      console.log("✅ Featured annonces fetched:", annonces.length);
      return annonces;
    } catch (error: any) {
      console.error("❌ Error fetching featured annonces:", error);
      throw error;
    }
  },

  async getUrgentAnnonces(limit: number = 5): Promise<Annonce[]> {
    try {
      console.log("🚨 Fetching urgent annonces, limit:", limit);

      const { annonces } = await this.getAnnonces({
        limit,
        is_urgent: true,
        statut: 'publie',
        sortBy: 'created_at',
        sortOrder: 'desc'
      });

      console.log("✅ Urgent annonces fetched:", annonces.length);
      return annonces;
    } catch (error: any) {
      console.error("❌ Error fetching urgent annonces:", error);
      throw error;
    }
  },

  async getSimilarAnnonces(annonceUuid: string, limit: number = 4): Promise<SimilarAnnonce[]> {
    try {
      console.log("🔍 Finding similar annonces for:", annonceUuid);

      // Récupérer l'annonce de référence
      const referenceAnnonce = await this.getAnnonce(annonceUuid);

      // Récupérer des annonces similaires
      const { annonces } = await this.getAnnonces({
        limit: 50,
        statut: 'publie',
        type_annonce: referenceAnnonce.type_annonce,
        categorie_uuid: referenceAnnonce.categorie_uuid,
        ville: referenceAnnonce.ville
      });

      // Filtrer l'annonce de référence
      const otherAnnonces = annonces.filter(a => a.uuid !== annonceUuid);

      // Calculer les scores de similarité
      const similarAnnonces: SimilarAnnonce[] = otherAnnonces.map(annonce => {
        let score = 0;

        // Même type d'annonce
        if (annonce.type_annonce === referenceAnnonce.type_annonce) score += 30;

        // Même catégorie
        if (annonce.categorie_uuid === referenceAnnonce.categorie_uuid) score += 25;

        // Même ville
        if (annonce.ville === referenceAnnonce.ville) score += 20;

        // Prix similaire (±20%)
        const prixDiff = Math.abs(annonce.prix - referenceAnnonce.prix);
        const prixMoyen = (annonce.prix + referenceAnnonce.prix) / 2;
        if (prixDiff / prixMoyen < 0.2) score += 15;

        // Surface similaire (±20%)
        const surfaceDiff = Math.abs(annonce.surface - referenceAnnonce.surface);
        const surfaceMoyenne = (annonce.surface + referenceAnnonce.surface) / 2;
        if (surfaceDiff / surfaceMoyenne < 0.2) score += 10;

        return {
          uuid: annonce.uuid,
          titre: annonce.titre,
          prix: annonce.prix,
          surface: annonce.surface,
          ville: annonce.ville,
          image: annonce.images?.[0] || '',
          score
        };
      });

      // Trier par score et limiter
      similarAnnonces.sort((a, b) => b.score - a.score);
      const topSimilar = similarAnnonces.slice(0, limit);

      console.log("✅ Similar annonces found:", topSimilar.length);
      return topSimilar;
    } catch (error: any) {
      console.error("❌ Error finding similar annonces:", error);
      throw error;
    }
  },

  // ==================== Images & Media ====================

  async uploadImage(file: File): Promise<ImageUploadResponse> {
    try {
      console.log("🖼️ Uploading image:", file.name);

      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post<ApiResponse<ImageUploadResponse>>(
        '/annonces/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log("✅ Image uploaded successfully:", response.data);

      // Vérifier la structure de la réponse
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return (response.data as any).data;
      }
      return response.data as ImageUploadResponse;
    } catch (error: any) {
      console.error("❌ Error uploading image:", error);
      throw error;
    }
  },

  async uploadMultipleImages(files: File[]): Promise<ImageUploadResponse[]> {
    try {
      console.log("🖼️ Uploading multiple images:", files.length);

      const uploadPromises = files.map(file => this.uploadImage(file));
      const results = await Promise.all(uploadPromises);

      console.log("✅ All images uploaded successfully:", results.length);
      return results;
    } catch (error: any) {
      console.error("❌ Error uploading multiple images:", error);
      throw error;
    }
  },

  // ==================== Validation & Utilities ====================

  async validateAnnonce(annonceData: AnnonceCreateData | AnnonceUpdateData): Promise<AnnonceValidation> {
    try {
      console.log("✅ Validating annonce data");

      const errors: string[] = [];
      const warnings: string[] = [];
      const suggestions: string[] = [];

      // Validation de base
      if ('titre' in annonceData && (!annonceData.titre || annonceData.titre.length < 5)) {
        errors.push("Le titre doit contenir au moins 5 caractères");
      }

      if ('description' in annonceData && (!annonceData.description || annonceData.description.length < 20)) {
        errors.push("La description doit contenir au moins 20 caractères");
      }

      if ('prix' in annonceData && annonceData.prix <= 0) {
        errors.push("Le prix doit être supérieur à 0");
      }

      if ('surface' in annonceData && annonceData.surface <= 0) {
        errors.push("La surface doit être supérieure à 0");
      }

      if ('images' in annonceData && (!annonceData.images || annonceData.images.length === 0)) {
        warnings.push("Ajoutez au moins une photo pour une meilleure visibilité");
      }

      if ('images' in annonceData && annonceData.images && annonceData.images.length < 3) {
        suggestions.push("Ajoutez plus de photos (3 minimum recommandé)");
      }

      if ('description' in annonceData && annonceData.description && annonceData.description.length < 100) {
        suggestions.push("Rédigez une description plus détaillée pour attirer plus d'attention");
      }

      const is_valid = errors.length === 0;

      return {
        is_valid,
        errors,
        warnings,
        suggestions
      };
    } catch (error: any) {
      console.error("❌ Error validating annonce:", error);
      throw error;
    }
  },

  async incrementViews(uuid: string): Promise<void> {
    try {
      console.log("👀 Incrementing views for annonce:", uuid);

      // À adapter selon votre API
      await api.post(`/annonces/${uuid}/increment-views`, {});

      console.log("✅ Views incremented successfully");
    } catch (error: any) {
      console.error("❌ Error incrementing views:", error);
      // Ne pas lancer l'erreur pour ne pas bloquer l'utilisateur
      console.warn("Failed to increment views, continuing...");
    }
  },

  async toggleFavorite(uuid: string): Promise<{ is_favorite: boolean; count: number }> {
    try {
      console.log("❤️ Toggling favorite for annonce:", uuid);

      // À adapter selon votre API
      const response = await api.post<ApiResponse<{ is_favorite: boolean; count: number }>>(
        `/annonces/${uuid}/toggle-favorite`,
        {}
      );

      console.log("✅ Favorite toggled successfully");

      // Vérifier la structure de la réponse
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return (response.data as any).data;
      }
      return response.data as { is_favorite: boolean; count: number };
    } catch (error: any) {
      console.error("❌ Error toggling favorite:", error);
      throw error;
    }
  },

  // ==================== Export ====================

  async exportAnnonces(format: "pdf" | "csv" = "pdf"): Promise<Blob> {
    try {
      console.log("📄 Exporting annonces in", format, "format");

      const response = await api.get(API_ENDPOINTS.ANNONCES.EXPORT_PDF, {
        responseType: "blob",
      });

      console.log("✅ Annonces exported successfully");
      return response;
    } catch (error: any) {
      console.error("❌ Error exporting annonces:", error);
      throw error;
    }
  },

  // ==================== Debug & Test Methods ====================

  async testEndpoint(endpoint: string): Promise<any> {
    try {
      console.log("🧪 Testing endpoint:", endpoint);

      const response = await api.get(endpoint);

      console.log("✅ Test endpoint response:", {
        endpoint,
        status: response.status,
        data: response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        keys: response.data ? Object.keys(response.data) : 'no data'
      });

      return response.data;
    } catch (error: any) {
      console.error("❌ Test endpoint error:", {
        endpoint,
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  },

  async pingAnnonceService(): Promise<boolean> {
    try {
      console.log("🏓 Pinging annonce service...");

      await this.getAnnonces({ limit: 1 });

      console.log("✅ Annonce service is operational");
      return true;
    } catch (error: any) {
      console.error("❌ Annonce service ping failed:", error.message);
      return false;
    }
  },

  // ==================== Price Analysis ====================

  async getPriceAnalysis(categorieUuid: string, ville: string): Promise<{
    average: number;
    median: number;
    min: number;
    max: number;
    quartile_25: number;
    quartile_75: number;
    count: number;
  }> {
    try {
      console.log("💰 Getting price analysis for:", { categorieUuid, ville });

      // Récupérer les annonces correspondantes
      const { annonces } = await this.getAnnonces({
        categorie_uuid: categorieUuid,
        ville,
        statut: 'publie',
        limit: 1000
      });

      if (annonces.length === 0) {
        return {
          average: 0,
          median: 0,
          min: 0,
          max: 0,
          quartile_25: 0,
          quartile_75: 0,
          count: 0
        };
      }

      // Extraire les prix
      const prices = annonces.map(a => a.prix).sort((a, b) => a - b);

      // Calculer les statistiques
      const sum = prices.reduce((a, b) => a + b, 0);
      const average = sum / prices.length;
      const min = prices[0];
      const max = prices[prices.length - 1];

      // Médiane
      const median = prices.length % 2 === 0
        ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
        : prices[Math.floor(prices.length / 2)];

      // Quartiles
      const q1Index = Math.floor(prices.length * 0.25);
      const q3Index = Math.floor(prices.length * 0.75);
      const quartile_25 = prices[q1Index];
      const quartile_75 = prices[q3Index];

      const analysis = {
        average: Math.round(average),
        median: Math.round(median),
        min: Math.round(min),
        max: Math.round(max),
        quartile_25: Math.round(quartile_25),
        quartile_75: Math.round(quartile_75),
        count: prices.length
      };

      console.log("✅ Price analysis calculated:", analysis);
      return analysis;
    } catch (error: any) {
      console.error("❌ Error getting price analysis:", error);
      throw error;
    }
  },

  // ==================== Location Services ====================

  async getAnnoncesByLocation(lat: number, lng: number, radiusKm: number = 10): Promise<Annonce[]> {
    try {
      console.log("📍 Getting annonces by location:", { lat, lng, radiusKm });

      // Cette fonction nécessite que votre API supporte la recherche par géolocalisation
      // Pour l'instant, nous allons simplement filtrer par ville la plus proche

      // Récupérer toutes les annonces
      const { annonces } = await this.getAnnonces({
        statut: 'publie',
        limit: 100
      });

      console.log("✅ Annonces by location found:", annonces.length);
      return annonces;
    } catch (error: any) {
      console.error("❌ Error getting annonces by location:", error);
      throw error;
    }
  },

  async getPopularCities(limit: number = 10): Promise<Array<{ ville: string; count: number }>> {
    try {
      console.log("🏙️ Getting popular cities, limit:", limit);

      const stats = await this.getAnnonceStats();

      // Convertir l'objet en tableau et trier
      const cities = Object.entries(stats.par_ville)
        .map(([ville, count]) => ({ ville, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

      console.log("✅ Popular cities found:", cities.length);
      return cities;
    } catch (error: any) {
      console.error("❌ Error getting popular cities:", error);
      throw error;
    }
  },

  // ==================== Expiration Management ====================

  async checkExpiredAnnonces(): Promise<Annonce[]> {
    try {
      console.log("⏰ Checking for expired annonces");

      const now = new Date();
      const { annonces } = await this.getAnnonces({
        statut: 'publie',
        limit: 1000
      });

      // Filtrer les annonces expirées
      const expired = annonces.filter(annonce => {
        if (!annonce.date_expiration) return false;
        const expirationDate = new Date(annonce.date_expiration);
        return expirationDate < now;
      });

      console.log("✅ Expired annonces found:", expired.length);
      return expired;
    } catch (error: any) {
      console.error("❌ Error checking expired annonces:", error);
      throw error;
    }
  },

  async renewAnnonce(uuid: string, days: number = 30): Promise<Annonce> {
    try {
      console.log("🔄 Renewing annonce:", uuid, "for", days, "days");

      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + days);

      const response = await api.put<ApiResponse<Annonce>>(
        `/annonces/${uuid}/renew`,
        { date_expiration: expirationDate.toISOString() }
      );

      console.log("✅ Annonce renewed successfully");

      // Vérifier la structure de la réponse
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return (response.data as any).data;
      }
      return response.data as Annonce;
    } catch (error: any) {
      console.error("❌ Error renewing annonce:", error);
      throw error;
    }
  },
};
