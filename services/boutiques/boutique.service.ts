// services/boutiques/boutique.service.ts
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import type {
  Boutique,
  BoutiqueCreateData,
  BoutiqueUpdateData,
  PaginationParams,
  BoutiqueStats,
  BoutiqueFilters,
  SearchParams,
  BoutiqueSearchResult,
  BoutiqueAvis,
  BoutiqueAvisCreateData,
  BoutiqueProduit,
  BoutiqueCommandesStats,
  BoutiqueAnalytics,
  BoutiqueVerificationData
} from "./boutique.types";

export interface ApiResponse<T> {
  data: T;
  status: string;
  message?: string;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
}

export const boutiqueService = {
  // ==================== CRUD Operations ====================

  async getBoutiques(params?: PaginationParams): Promise<{ boutiques: Boutique[]; count?: number; total?: number; page?: number; pages?: number }> {
    const queryParams = new URLSearchParams();

    // Paramètres de pagination
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    // Filtres
    if (params?.type_boutique_uuid) queryParams.append("type_boutique_uuid", params.type_boutique_uuid);
    if (params?.ville) queryParams.append("ville", params.ville);
    if (params?.pays) queryParams.append("pays", params.pays);
    if (params?.statut) queryParams.append("statut", params.statut);
    if (params?.est_verifie !== undefined) queryParams.append("est_verifie", params.est_verifie.toString());
    if (params?.est_bloque !== undefined) queryParams.append("est_bloque", params.est_bloque.toString());
    if (params?.est_ferme !== undefined) queryParams.append("est_ferme", params.est_ferme.toString());
    if (params?.note_min !== undefined) queryParams.append("note_min", params.note_min.toString());
    if (params?.note_max !== undefined) queryParams.append("note_max", params.note_max.toString());
    if (params?.proprietaire_uuid) queryParams.append("proprietaire_uuid", params.proprietaire_uuid);
    if (params?.proprietaire_type) queryParams.append("proprietaire_type", params.proprietaire_type);
    if (params?.categorie_uuid) queryParams.append("categorie_uuid", params.categorie_uuid);
    if (params?.produit_nom) queryParams.append("produit_nom", params.produit_nom);
    if (params?.prix_min !== undefined) queryParams.append("prix_min", params.prix_min.toString());
    if (params?.prix_max !== undefined) queryParams.append("prix_max", params.prix_max.toString());

    // Géolocalisation
    if (params?.rayon !== undefined) queryParams.append("rayon", params.rayon.toString());
    if (params?.latitude !== undefined) queryParams.append("latitude", params.latitude.toString());
    if (params?.longitude !== undefined) queryParams.append("longitude", params.longitude.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.BOUTIQUES.LIST}?${queryString}`
      : API_ENDPOINTS.BOUTIQUES.LIST;

    console.log("📡 Fetching boutiques from:", endpoint);

    try {
      const response = await api.get<ApiResponse<Boutique[]>>(endpoint);

      console.log("✅ Boutiques response received:", {
        hasData: !!response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
      });

      let boutiques: Boutique[] = [];
      let count = 0;
      let total = 0;
      let page = 1;
      let pages = 1;

      // Vérifier la structure de la réponse
      if (Array.isArray(response.data)) {
        // L'API retourne directement un tableau
        boutiques = response.data;
        count = response.data.length;
        console.log("📊 API returned array directly, count:", count);
      } else if (response.data && typeof response.data === 'object') {
        // Vérifier si c'est une réponse wrapper
        if ('data' in response.data && Array.isArray((response.data as any).data)) {
          // Structure: { data: [...], status: "success", count: X }
          boutiques = (response.data as any).data || [];
          count = (response.data as any).count || boutiques.length;
          total = (response.data as any).total || count;
          page = (response.data as any).page || 1;
          pages = (response.data as any).pages || 1;
          console.log("📊 API returned wrapped data, count:", count);
        } else if ('boutiques' in response.data && Array.isArray((response.data as any).boutiques)) {
          // Structure alternative: { boutiques: [...], count: X }
          boutiques = (response.data as any).boutiques || [];
          count = (response.data as any).count || boutiques.length;
          total = (response.data as any).total || count;
          page = (response.data as any).page || 1;
          pages = (response.data as any).pages || 1;
          console.log("📊 API returned boutiques data, count:", count);
        } else {
          console.warn("⚠️ Unexpected response format:", response.data);
        }
      }

      return { boutiques, count, total, page, pages };
    } catch (error: any) {
      console.error("🚨 Error in boutiqueService.getBoutiques:", {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  async getBoutique(uuid: string): Promise<Boutique> {
    try {
      console.log("🔍 Fetching boutique:", uuid);

      const response = await api.get<ApiResponse<Boutique>>(API_ENDPOINTS.BOUTIQUES.DETAIL(uuid));

      console.log("✅ Boutique response:", {
        hasData: !!response.data,
        dataType: typeof response.data,
        hasWrappedData: response.data && typeof response.data === 'object' && 'data' in response.data
      });

      let boutiqueData: Boutique;

      // Vérifier la structure de la réponse
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        // Structure: { data: {...}, status: "success" }
        boutiqueData = (response.data as any).data;
        console.log("📊 Using wrapped data structure");
      } else if (response.data && (response.data as any).uuid) {
        // Structure: la boutique directement
        boutiqueData = response.data as Boutique;
        console.log("📊 Using direct boutique structure");
      } else {
        console.error("❌ Invalid boutique data structure:", response.data);
        throw new Error("Structure de données boutique invalide");
      }

      if (!boutiqueData || !boutiqueData.uuid) {
        throw new Error("Boutique non trouvée");
      }

      console.log("✅ Boutique found:", boutiqueData.nom);
      return boutiqueData;
    } catch (error: any) {
      console.error("❌ Error fetching boutique:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  async createBoutique(boutiqueData: BoutiqueCreateData): Promise<Boutique> {
    try {
      console.log("🆕 Creating boutique:", boutiqueData.nom);

      const response = await api.post<ApiResponse<Boutique>>(
        API_ENDPOINTS.BOUTIQUES.CREATE,
        boutiqueData,
      );

      console.log("✅ Boutique creation response:", response.data);

      // Vérifier la structure de la réponse
      let createdBoutique: Boutique;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        createdBoutique = (response.data as any).data;
      } else {
        createdBoutique = response.data as Boutique;
      }

      if (!createdBoutique || !createdBoutique.uuid) {
        throw new Error("Échec de la création de la boutique");
      }

      return createdBoutique;
    } catch (error: any) {
      console.error("❌ Error creating boutique:", {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  async updateBoutique(uuid: string, boutiqueData: BoutiqueUpdateData): Promise<Boutique> {
    try {
      console.log("✏️ Updating boutique:", uuid);

      const response = await api.put<ApiResponse<Boutique>>(
        API_ENDPOINTS.BOUTIQUES.UPDATE(uuid),
        boutiqueData,
      );

      console.log("✅ Boutique update response:", response.data);

      // Vérifier la structure de la réponse
      let updatedBoutique: Boutique;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        updatedBoutique = (response.data as any).data;
      } else {
        updatedBoutique = response.data as Boutique;
      }

      return updatedBoutique;
    } catch (error: any) {
      console.error("❌ Error updating boutique:", error);
      throw error;
    }
  },

  async deleteBoutique(uuid: string): Promise<void> {
    try {
      console.log("🗑️ Deleting boutique:", uuid);
      await api.delete(API_ENDPOINTS.BOUTIQUES.DELETE(uuid));
      console.log("✅ Boutique deleted successfully");
    } catch (error: any) {
      console.error("❌ Error deleting boutique:", error);
      throw error;
    }
  },

  // ==================== Status Management ====================

  async verifyBoutique(uuid: string): Promise<Boutique> {
    try {
      console.log("✅ Verifying boutique:", uuid);

      // À adapter selon votre API
      const response = await api.post<ApiResponse<Boutique>>(
        `/boutiques/${uuid}/verifier`,
        {}
      );

      let verifiedBoutique: Boutique;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        verifiedBoutique = (response.data as any).data;
      } else {
        verifiedBoutique = response.data as Boutique;
      }

      console.log("✅ Boutique verified successfully");
      return verifiedBoutique;
    } catch (error: any) {
      console.error("❌ Error verifying boutique:", error);
      throw error;
    }
  },

  async blockBoutique(uuid: string): Promise<Boutique> {
    try {
      console.log("🚫 Blocking boutique:", uuid);

      const response = await api.post<ApiResponse<Boutique>>(
        API_ENDPOINTS.BOUTIQUES.BLOCK(uuid),
        {}
      );

      let blockedBoutique: Boutique;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        blockedBoutique = (response.data as any).data;
      } else {
        blockedBoutique = response.data as Boutique;
      }

      console.log("✅ Boutique blocked successfully");
      return blockedBoutique;
    } catch (error: any) {
      console.error("❌ Error blocking boutique:", error);
      throw error;
    }
  },

  async unblockBoutique(uuid: string): Promise<Boutique> {
    try {
      console.log("✅ Unblocking boutique:", uuid);

      const response = await api.post<ApiResponse<Boutique>>(
        API_ENDPOINTS.BOUTIQUES.UNBLOCK(uuid),
        {}
      );

      let unblockedBoutique: Boutique;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        unblockedBoutique = (response.data as any).data;
      } else {
        unblockedBoutique = response.data as Boutique;
      }

      console.log("✅ Boutique unblocked successfully");
      return unblockedBoutique;
    } catch (error: any) {
      console.error("❌ Error unblocking boutique:", error);
      throw error;
    }
  },

  async closeBoutique(uuid: string, raison?: string): Promise<Boutique> {
    try {
      console.log("🔒 Closing boutique:", uuid);

      const response = await api.put<ApiResponse<Boutique>>(
        API_ENDPOINTS.BOUTIQUES.CLOSE(uuid),
        { raison_fermeture: raison }
      );

      let closedBoutique: Boutique;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        closedBoutique = (response.data as any).data;
      } else {
        closedBoutique = response.data as Boutique;
      }

      console.log("✅ Boutique closed successfully");
      return closedBoutique;
    } catch (error: any) {
      console.error("❌ Error closing boutique:", error);
      throw error;
    }
  },

  async openBoutique(uuid: string): Promise<Boutique> {
    try {
      console.log("🔓 Opening boutique:", uuid);

      // À adapter selon votre API
      const response = await api.put<ApiResponse<Boutique>>(
        `/boutiques/${uuid}/ouvrir`,
        {}
      );

      let openedBoutique: Boutique;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        openedBoutique = (response.data as any).data;
      } else {
        openedBoutique = response.data as Boutique;
      }

      console.log("✅ Boutique opened successfully");
      return openedBoutique;
    } catch (error: any) {
      console.error("❌ Error opening boutique:", error);
      throw error;
    }
  },

  async restoreBoutique(uuid: string): Promise<Boutique> {
    try {
      console.log("↩️ Restoring boutique:", uuid);

      const response = await api.post<ApiResponse<Boutique>>(
        API_ENDPOINTS.BOUTIQUES.RESTORE(uuid),
        {}
      );

      let restoredBoutique: Boutique;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        restoredBoutique = (response.data as any).data;
      } else {
        restoredBoutique = response.data as Boutique;
      }

      console.log("✅ Boutique restored successfully");
      return restoredBoutique;
    } catch (error: any) {
      console.error("❌ Error restoring boutique:", error);
      throw error;
    }
  },

  // ==================== Specialized Lists ====================

  async getActiveBoutiques(params?: PaginationParams): Promise<{ boutiques: Boutique[]; count?: number }> {
    const result = await this.getBoutiques({
      ...params,
      statut: 'actif',
      est_ferme: false,
      est_bloque: false
    });
    return { boutiques: result.boutiques, count: result.count };
  },

  async getVerifiedBoutiques(params?: PaginationParams): Promise<{ boutiques: Boutique[]; count?: number }> {
    const result = await this.getBoutiques({
      ...params,
      est_verifie: true
    });
    return { boutiques: result.boutiques, count: result.count };
  },

  async getBlockedBoutiques(params?: PaginationParams): Promise<{ boutiques: Boutique[]; count?: number }> {
    const result = await this.getBoutiques({
      ...params,
      est_bloque: true
    });
    return { boutiques: result.boutiques, count: result.count };
  },

  async getClosedBoutiques(params?: PaginationParams): Promise<{ boutiques: Boutique[]; count?: number }> {
    const result = await this.getBoutiques({
      ...params,
      est_ferme: true
    });
    return { boutiques: result.boutiques, count: result.count };
  },

  async getPendingBoutiques(params?: PaginationParams): Promise<{ boutiques: Boutique[]; count?: number }> {
    const result = await this.getBoutiques({
      ...params,
      statut: 'en_attente'
    });
    return { boutiques: result.boutiques, count: result.count };
  },

  async getBoutiquesByOwner(proprietaireUuid: string, params?: PaginationParams): Promise<{ boutiques: Boutique[]; count?: number }> {
    const result = await this.getBoutiques({
      ...params,
      proprietaire_uuid: proprietaireUuid
    });
    return { boutiques: result.boutiques, count: result.count };
  },

  async getBoutiquesByType(typeUuid: string, params?: PaginationParams): Promise<{ boutiques: Boutique[]; count?: number }> {
    const result = await this.getBoutiques({
      ...params,
      type_boutique_uuid: typeUuid,
      statut: 'actif'
    });
    return { boutiques: result.boutiques, count: result.count };
  },

  async getBoutiquesByLocation(ville: string, pays?: string, params?: PaginationParams): Promise<{ boutiques: Boutique[]; count?: number }> {
    const result = await this.getBoutiques({
      ...params,
      ville,
      pays: pays || 'Côte d\'Ivoire', // Par défaut
      statut: 'actif'
    });
    return { boutiques: result.boutiques, count: result.count };
  },

  async getBoutiquesNearby(latitude: number, longitude: number, rayonKm: number = 10, params?: PaginationParams): Promise<{ boutiques: Boutique[]; count?: number }> {
    const result = await this.getBoutiques({
      ...params,
      latitude,
      longitude,
      rayon: rayonKm,
      statut: 'actif',
      est_ferme: false
    });
    return { boutiques: result.boutiques, count: result.count };
  },

  async getFeaturedBoutiques(limit: number = 8): Promise<Boutique[]> {
    const { boutiques } = await this.getBoutiques({
      limit,
      statut: 'actif',
      est_verifie: true,
      sortBy: 'note_moyenne',
      sortOrder: 'desc'
    });
    return boutiques;
  },

  async getTopRatedBoutiques(limit: number = 10): Promise<Boutique[]> {
    const { boutiques } = await this.getBoutiques({
      limit,
      statut: 'actif',
      note_min: 4,
      sortBy: 'note_moyenne',
      sortOrder: 'desc'
    });
    return boutiques;
  },

  async getPopularBoutiques(limit: number = 6): Promise<Boutique[]> {
    const { boutiques } = await this.getBoutiques({
      limit,
      statut: 'actif',
      sortBy: 'nombre_commandes',
      sortOrder: 'desc'
    });
    return boutiques;
  },

  // ==================== Search & Filter ====================

  async searchBoutiques(searchParams: SearchParams): Promise<BoutiqueSearchResult> {
    try {
      console.log("🔍 Searching boutiques:", searchParams.query);

      const { boutiques, count, total } = await this.getBoutiques({
        ...searchParams.pagination,
        search: searchParams.query,
        ...this.convertFiltersToParams(searchParams.filters)
      });

      // Générer des suggestions basées sur la recherche
      const suggestions = this.generateSearchSuggestions(searchParams.query, boutiques);

      return {
        boutiques,
        count,
        total,
        suggestions,
        filters_available: searchParams.filters
      };
    } catch (error: any) {
      console.error("❌ Error searching boutiques:", error);
      throw error;
    }
  },

  async filterBoutiques(filters: BoutiqueFilters, params?: PaginationParams): Promise<{ boutiques: Boutique[]; count?: number }> {
    try {
      console.log("🔍 Filtering boutiques with filters:", filters);

      const filterParams = this.convertFiltersToParams(filters);

      const result = await this.getBoutiques({
        ...params,
        ...filterParams
      });

      console.log("✅ Filter completed, found:", result.boutiques.length, "boutiques");
      return result;
    } catch (error: any) {
      console.error("❌ Error filtering boutiques:", error);
      throw error;
    }
  },

  private convertFiltersToParams(filters?: BoutiqueFilters): Partial<PaginationParams> {
    if (!filters) return {};

    const params: Partial<PaginationParams> = {};

    if (filters.types && filters.types.length > 0) {
      params.type_boutique_uuid = filters.types[0];
    }

    if (filters.villes && filters.villes.length > 0) {
      params.ville = filters.villes[0];
    }

    if (filters.pays && filters.pays.length > 0) {
      params.pays = filters.pays[0];
    }

    if (filters.statuts && filters.statuts.length > 0) {
      params.statut = filters.statuts[0] as any;
    }

    if (filters.est_verifie !== undefined) {
      params.est_verifie = filters.est_verifie;
    }

    if (filters.est_bloque !== undefined) {
      params.est_bloque = filters.est_bloque;
    }

    if (filters.est_ferme !== undefined) {
      params.est_ferme = filters.est_ferme;
    }

    if (filters.note_min !== undefined) {
      params.note_min = filters.note_min;
    }

    if (filters.note_max !== undefined) {
      params.note_max = filters.note_max;
    }

    if (filters.rayon !== undefined) {
      params.rayon = filters.rayon;
    }

    if (filters.latitude !== undefined) {
      params.latitude = filters.latitude;
    }

    if (filters.longitude !== undefined) {
      params.longitude = filters.longitude;
    }

    return params;
  },

  private generateSearchSuggestions(query: string, boutiques: Boutique[]): string[] {
    const suggestions: string[] = [];

    if (!query || query.length < 2) return suggestions;

    // Extraire les mots-clés des boutiques similaires
    const commonKeywords = new Set<string>();

    boutiques.forEach(boutique => {
      // Ajouter la ville comme suggestion
      if (boutique.ville.toLowerCase().includes(query.toLowerCase())) {
        commonKeywords.add(boutique.ville);
      }

      // Ajouter le type de boutique comme suggestion
      if (boutique.type_boutique?.nom.toLowerCase().includes(query.toLowerCase())) {
        commonKeywords.add(boutique.type_boutique.nom);
      }

      // Ajouter les catégories comme suggestions
      if (boutique.categories) {
        boutique.categories.forEach(categorie => {
          if (categorie.nom.toLowerCase().includes(query.toLowerCase())) {
            commonKeywords.add(categorie.nom);
          }
        });
      }
    });

    return Array.from(commonKeywords).slice(0, 5);
  },

  // ==================== Statistics & Reports ====================

  async getBoutiqueStats(): Promise<BoutiqueStats> {
    try {
      console.log("📊 Fetching boutique statistics");

      // Récupérer toutes les boutiques pour calculer les stats
      const { boutiques } = await this.getBoutiques({ limit: 1000 });

      // Calculer les statistiques
      const stats: BoutiqueStats = {
        total_boutiques: boutiques.length,
        boutiques_actives: boutiques.filter(b => b.statut === 'actif' && !b.est_ferme && !b.est_bloque).length,
        boutiques_inactives: boutiques.filter(b => b.statut === 'inactif').length,
        boutiques_suspendues: boutiques.filter(b => b.statut === 'suspendu').length,
        boutiques_fermees: boutiques.filter(b => b.est_ferme).length,
        boutiques_en_attente: boutiques.filter(b => b.statut === 'en_attente').length,
        boutiques_verifiees: boutiques.filter(b => b.est_verifie).length,
        boutiques_bloquees: boutiques.filter(b => b.est_bloque).length,

        par_type: {},
        par_ville: {},
        par_pays: {},
        par_statut: {},

        produits_total: boutiques.reduce((sum, b) => sum + b.nombre_produits, 0),
        commandes_total: boutiques.reduce((sum, b) => sum + b.nombre_commandes, 0),
        clients_total: boutiques.reduce((sum, b) => sum + b.nombre_clients, 0),
        chiffre_affaires_total: boutiques.reduce((sum, b) => sum + b.chiffre_affaires_total, 0),
        avis_total: boutiques.reduce((sum, b) => sum + b.nombre_avis, 0),
        note_moyenne_globale: boutiques.length > 0
          ? boutiques.reduce((sum, b) => sum + b.note_moyenne, 0) / boutiques.length
          : 0
      };

      // Calculer les distributions
      boutiques.forEach(boutique => {
        // Par type
        const type = boutique.type_boutique?.nom || 'Non spécifié';
        stats.par_type[type] = (stats.par_type[type] || 0) + 1;

        // Par ville
        stats.par_ville[boutique.ville] = (stats.par_ville[boutique.ville] || 0) + 1;

        // Par pays
        stats.par_pays[boutique.pays] = (stats.par_pays[boutique.pays] || 0) + 1;

        // Par statut
        const statut = boutique.est_ferme ? 'ferme' : boutique.statut;
        stats.par_statut[statut] = (stats.par_statut[statut] || 0) + 1;
      });

      console.log("✅ Boutique stats calculated:", stats);
      return stats;
    } catch (error: any) {
      console.error("❌ Error fetching boutique stats:", error);
      throw error;
    }
  },

  async getBoutiqueBySlug(slug: string): Promise<Boutique> {
    try {
      console.log("🔍 Fetching boutique by slug:", slug);

      const response = await api.get<ApiResponse<Boutique>>(API_ENDPOINTS.BOUTIQUES.BY_SLUG(slug));

      let boutiqueData: Boutique;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        boutiqueData = (response.data as any).data;
      } else if (response.data && (response.data as any).uuid) {
        boutiqueData = response.data as Boutique;
      } else {
        throw new Error("Boutique non trouvée");
      }

      if (!boutiqueData || !boutiqueData.uuid) {
        throw new Error("Boutique non trouvée");
      }

      console.log("✅ Boutique found by slug:", boutiqueData.nom);
      return boutiqueData;
    } catch (error: any) {
      console.error("❌ Error fetching boutique by slug:", error);
      throw error;
    }
  },

  async getBoutiqueProducts(boutiqueUuid: string, params?: PaginationParams): Promise<{ produits: BoutiqueProduit[]; count?: number }> {
    try {
      console.log("🛍️ Fetching boutique products:", boutiqueUuid);

      // À adapter selon votre API
      const endpoint = `/boutiques/${boutiqueUuid}/produits`;
      const queryParams = new URLSearchParams();

      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.search) queryParams.append("search", params.search);
      if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

      const queryString = queryParams.toString();
      const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;

      const response = await api.get<ApiResponse<BoutiqueProduit[]>>(fullEndpoint);

      let produits: BoutiqueProduit[] = [];
      let count = 0;

      if (Array.isArray(response.data)) {
        produits = response.data;
        count = response.data.length;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        produits = (response.data as any).data || [];
        count = (response.data as any).count || produits.length;
      }

      console.log("✅ Boutique products fetched:", produits.length);
      return { produits, count };
    } catch (error: any) {
      console.error("❌ Error fetching boutique products:", error);
      throw error;
    }
  },

  async getBoutiqueReviews(boutiqueUuid: string, params?: PaginationParams): Promise<{ avis: BoutiqueAvis[]; count?: number }> {
    try {
      console.log("⭐ Fetching boutique reviews:", boutiqueUuid);

      // À adapter selon votre API
      const endpoint = `/boutiques/${boutiqueUuid}/avis`;
      const queryParams = new URLSearchParams();

      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

      const queryString = queryParams.toString();
      const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;

      const response = await api.get<ApiResponse<BoutiqueAvis[]>>(fullEndpoint);

      let avis: BoutiqueAvis[] = [];
      let count = 0;

      if (Array.isArray(response.data)) {
        avis = response.data;
        count = response.data.length;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        avis = (response.data as any).data || [];
        count = (response.data as any).count || avis.length;
      }

      console.log("✅ Boutique reviews fetched:", avis.length);
      return { avis, count };
    } catch (error: any) {
      console.error("❌ Error fetching boutique reviews:", error);
      throw error;
    }
  },

  // ==================== Reviews Management ====================

  async addReview(reviewData: BoutiqueAvisCreateData): Promise<BoutiqueAvis> {
    try {
      console.log("⭐ Adding review to boutique:", reviewData.boutique_uuid);

      const endpoint = `/boutiques/${reviewData.boutique_uuid}/avis`;
      const response = await api.post<ApiResponse<BoutiqueAvis>>(
        endpoint,
        reviewData
      );

      let review: BoutiqueAvis;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        review = (response.data as any).data;
      } else {
        review = response.data as BoutiqueAvis;
      }

      console.log("✅ Review added successfully");
      return review;
    } catch (error: any) {
      console.error("❌ Error adding review:", error);
      throw error;
    }
  },

  async approveReview(avisUuid: string): Promise<BoutiqueAvis> {
    try {
      console.log("✅ Approving review:", avisUuid);

      const endpoint = `/avis/${avisUuid}/approuver`;
      const response = await api.post<ApiResponse<BoutiqueAvis>>(endpoint, {});

      let review: BoutiqueAvis;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        review = (response.data as any).data;
      } else {
        review = response.data as BoutiqueAvis;
      }

      console.log("✅ Review approved successfully");
      return review;
    } catch (error: any) {
      console.error("❌ Error approving review:", error);
      throw error;
    }
  },

  async deleteReview(avisUuid: string): Promise<void> {
    try {
      console.log("🗑️ Deleting review:", avisUuid);

      const endpoint = `/avis/${avisUuid}`;
      await api.delete(endpoint);

      console.log("✅ Review deleted successfully");
    } catch (error: any) {
      console.error("❌ Error deleting review:", error);
      throw error;
    }
  },

  async likeReview(avisUuid: string): Promise<{ likes: number }> {
    try {
      console.log("❤️ Liking review:", avisUuid);

      const endpoint = `/avis/${avisUuid}/like`;
      const response = await api.post<ApiResponse<{ likes: number }>>(endpoint, {});

      let result: { likes: number };
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        result = (response.data as any).data;
      } else {
        result = response.data as { likes: number };
      }

      console.log("✅ Review liked successfully");
      return result;
    } catch (error: any) {
      console.error("❌ Error liking review:", error);
      throw error;
    }
  },

  async replyToReview(avisUuid: string, contenu: string): Promise<BoutiqueAvis> {
    try {
      console.log("💬 Replying to review:", avisUuid);

      const endpoint = `/avis/${avisUuid}/repondre`;
      const response = await api.post<ApiResponse<BoutiqueAvis>>(
        endpoint,
        { contenu }
      );

      let updatedReview: BoutiqueAvis;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        updatedReview = (response.data as any).data;
      } else {
        updatedReview = response.data as BoutiqueAvis;
      }

      console.log("✅ Reply added successfully");
      return updatedReview;
    } catch (error: any) {
      console.error("❌ Error replying to review:", error);
      throw error;
    }
  },

  // ==================== Orders & Analytics ====================

  async getBoutiqueOrdersStats(boutiqueUuid: string): Promise<BoutiqueCommandesStats> {
    try {
      console.log("📈 Getting boutique orders stats:", boutiqueUuid);

      // À adapter selon votre API
      const endpoint = `/boutiques/${boutiqueUuid}/stats/commandes`;
      const response = await api.get<ApiResponse<BoutiqueCommandesStats>>(endpoint);

      let stats: BoutiqueCommandesStats;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        stats = (response.data as any).data;
      } else {
        stats = response.data as BoutiqueCommandesStats;
      }

      console.log("✅ Boutique orders stats fetched");
      return stats;
    } catch (error: any) {
      console.error("❌ Error getting boutique orders stats:", error);
      throw error;
    }
  },

  async getBoutiqueAnalytics(boutiqueUuid: string, periode: 'jour' | 'semaine' | 'mois' | 'annee' = 'mois'): Promise<BoutiqueAnalytics> {
    try {
      console.log("📊 Getting boutique analytics:", boutiqueUuid, "periode:", periode);

      const endpoint = `/boutiques/${boutiqueUuid}/analytics`;
      const response = await api.get<ApiResponse<BoutiqueAnalytics>>(endpoint, {
        params: { periode }
      });

      // Structure par défaut
      const defaultAnalytics: BoutiqueAnalytics = {
        periode: {
          debut: new Date().toISOString(),
          fin: new Date().toISOString()
        },
        vues: {
          total: 0,
          par_jour: [],
          sources: {
            direct: 0,
            recherche: 0,
            reseaux_sociaux: 0,
            autres: 0
          }
        },
        conversions: {
          taux: 0,
          commandes: 0,
          paniers_abandonnes: 0
        },
        clients: {
          nouveaux: 0,
          fideles: 0,
          retention: 0
        },
        revenus: {
          total: 0,
          par_jour: [],
          par_produit: []
        }
      };

      let analytics = defaultAnalytics;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        analytics = { ...defaultAnalytics, ...(response.data as any).data };
      } else if (response.data && typeof response.data === 'object') {
        analytics = { ...defaultAnalytics, ...response.data };
      }

      console.log("✅ Boutique analytics fetched");
      return analytics;
    } catch (error: any) {
      console.error("❌ Error getting boutique analytics:", error);
      throw error;
    }
  },

  // ==================== Verification & Documents ====================

  async submitVerification(boutiqueUuid: string, verificationData: BoutiqueVerificationData): Promise<Boutique> {
    try {
      console.log("📄 Submitting verification for boutique:", boutiqueUuid);

      const endpoint = `/boutiques/${boutiqueUuid}/verification`;
      const response = await api.post<ApiResponse<Boutique>>(
        endpoint,
        verificationData
      );

      let boutique: Boutique;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        boutique = (response.data as any).data;
      } else {
        boutique = response.data as Boutique;
      }

      console.log("✅ Verification submitted successfully");
      return boutique;
    } catch (error: any) {
      console.error("❌ Error submitting verification:", error);
      throw error;
    }
  },

  async uploadVerificationDocument(boutiqueUuid: string, documentType: string, file: File): Promise<{ url: string; type: string }> {
    try {
      console.log("📎 Uploading verification document:", boutiqueUuid, documentType);

      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', documentType);

      const endpoint = `/boutiques/${boutiqueUuid}/documents`;
      const response = await api.post<ApiResponse<{ url: string; type: string }>>(
        endpoint,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      let result: { url: string; type: string };
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        result = (response.data as any).data;
      } else {
        result = response.data as { url: string; type: string };
      }

      console.log("✅ Document uploaded successfully");
      return result;
    } catch (error: any) {
      console.error("❌ Error uploading document:", error);
      throw error;
    }
  },

  // ==================== Promotions & Marketing ====================

  async createPromotion(boutiqueUuid: string, promotionData: {
    titre: string;
    description: string;
    reduction: number;
    type_reduction: "pourcentage" | "montant";
    date_debut: string;
    date_fin: string;
    produits_cibles?: string[];
    categories_cibles?: string[];
    conditions_minimum?: number;
  }): Promise<any> {
    try {
      console.log("🎯 Creating promotion for boutique:", boutiqueUuid);

      const endpoint = `/boutiques/${boutiqueUuid}/promotions`;
      const response = await api.post<ApiResponse<any>>(
        endpoint,
        promotionData
      );

      let promotion: any;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        promotion = (response.data as any).data;
      } else {
        promotion = response.data;
      }

      console.log("✅ Promotion created successfully");
      return promotion;
    } catch (error: any) {
      console.error("❌ Error creating promotion:", error);
      throw error;
    }
  },

  async getBoutiquePromotions(boutiqueUuid: string): Promise<any[]> {
    try {
      console.log("🎯 Getting boutique promotions:", boutiqueUuid);

      const endpoint = `/boutiques/${boutiqueUuid}/promotions`;
      const response = await api.get<ApiResponse<any[]>>(endpoint);

      let promotions: any[] = [];
      if (Array.isArray(response.data)) {
        promotions = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        promotions = (response.data as any).data || [];
      }

      console.log("✅ Promotions fetched:", promotions.length);
      return promotions;
    } catch (error: any) {
      console.error("❌ Error getting promotions:", error);
      throw error;
    }
  },

  // ==================== Horaires Management ====================

  async updateHoraires(boutiqueUuid: string, horaires: Array<{
    jour: "lundi" | "mardi" | "mercredi" | "jeudi" | "vendredi" | "samedi" | "dimanche";
    ouverture: string;
    fermeture: string;
    est_ouvert: boolean;
  }>): Promise<Boutique> {
    try {
      console.log("⏰ Updating horaires for boutique:", boutiqueUuid);

      const endpoint = `/boutiques/${boutiqueUuid}/horaires`;
      const response = await api.put<ApiResponse<Boutique>>(
        endpoint,
        { horaires }
      );

      let boutique: Boutique;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        boutique = (response.data as any).data;
      } else {
        boutique = response.data as Boutique;
      }

      console.log("✅ Horaires updated successfully");
      return boutique;
    } catch (error: any) {
      console.error("❌ Error updating horaires:", error);
      throw error;
    }
  },

  async getCurrentStatus(boutiqueUuid: string): Promise<{ est_ouvert: boolean; prochaine_ouverture?: string }> {
    try {
      console.log("🔍 Getting current status for boutique:", boutiqueUuid);

      const endpoint = `/boutiques/${boutiqueUuid}/status`;
      const response = await api.get<ApiResponse<{ est_ouvert: boolean; prochaine_ouverture?: string }>>(endpoint);

      let status: { est_ouvert: boolean; prochaine_ouverture?: string };
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        status = (response.data as any).data;
      } else {
        status = response.data as { est_ouvert: boolean; prochaine_ouverture?: string };
      }

      console.log("✅ Current status fetched");
      return status;
    } catch (error: any) {
      console.error("❌ Error getting current status:", error);
      throw error;
    }
  },

  // ==================== Export & Reports ====================

  async exportBoutiques(format: "pdf" | "csv" | "excel" = "pdf"): Promise<Blob> {
    try {
      console.log("📄 Exporting boutiques in", format, "format");

      const endpoint = API_ENDPOINTS.BOUTIQUES.EXPORT_PDF;
      const response = await api.get(endpoint, {
        responseType: "blob",
      });

      console.log("✅ Boutiques exported successfully");
      return response;
    } catch (error: any) {
      console.error("❌ Error exporting boutiques:", error);
      throw error;
    }
  },

  async exportBoutiqueReport(boutiqueUuid: string, periode: { debut: string; fin: string }): Promise<Blob> {
    try {
      console.log("📊 Exporting boutique report:", boutiqueUuid);

      const endpoint = `/boutiques/${boutiqueUuid}/rapport`;
      const response = await api.post(
        endpoint,
        periode,
        { responseType: "blob" }
      );

      console.log("✅ Boutique report exported successfully");
      return response;
    } catch (error: any) {
      console.error("❌ Error exporting boutique report:", error);
      throw error;
    }
  },

  // ==================== Validation & Utilities ====================

  async validateBoutique(boutiqueData: BoutiqueCreateData | BoutiqueUpdateData): Promise<{
    is_valid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  }> {
    try {
      console.log("✅ Validating boutique data");

      const errors: string[] = [];
      const warnings: string[] = [];
      const suggestions: string[] = [];

      // Validation de base
      if ('nom' in boutiqueData && (!boutiqueData.nom || boutiqueData.nom.length < 3)) {
        errors.push("Le nom de la boutique doit contenir au moins 3 caractères");
      }

      if ('description' in boutiqueData && (!boutiqueData.description || boutiqueData.description.length < 20)) {
        warnings.push("La description est courte. Ajoutez plus de détails.");
      }

      if ('email' in boutiqueData && !this.validateEmail(boutiqueData.email)) {
        errors.push("L'adresse email n'est pas valide");
      }

      if ('telephone' in boutiqueData && !this.validatePhone(boutiqueData.telephone)) {
        warnings.push("Le numéro de téléphone semble incomplet");
      }

      if ('adresse' in boutiqueData && !boutiqueData.adresse) {
        errors.push("L'adresse est obligatoire");
      }

      if ('type_boutique_uuid' in boutiqueData && !boutiqueData.type_boutique_uuid) {
        errors.push("Veuillez sélectionner un type de boutique");
      }

      if ('proprietaire_uuid' in boutiqueData && !boutiqueData.proprietaire_uuid) {
        errors.push("Le propriétaire est obligatoire");
      }

      // Suggestions
      if ('logo' in boutiqueData && !boutiqueData.logo) {
        suggestions.push("Ajoutez un logo pour une meilleure identité visuelle");
      }

      if ('description_courte' in boutiqueData && !boutiqueData.description_courte) {
        suggestions.push("Ajoutez une description courte pour les aperçus");
      }

      if ('slogan' in boutiqueData && !boutiqueData.slogan) {
        suggestions.push("Un slogan peut aider à mémoriser votre boutique");
      }

      const is_valid = errors.length === 0;

      return {
        is_valid,
        errors,
        warnings,
        suggestions
      };
    } catch (error: any) {
      console.error("❌ Error validating boutique:", error);
      throw error;
    }
  },

  private validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  private validatePhone(phone: string): boolean {
    // Validation simple pour les numéros internationaux
    return phone.length >= 8 && phone.length <= 15;
  },

  async generateSlug(nom: string): Promise<string> {
    try {
      console.log("🔗 Generating slug for:", nom);

      const slug = nom
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 50);

      console.log("✅ Slug generated:", slug);
      return slug;
    } catch (error: any) {
      console.error("❌ Error generating slug:", error);
      throw error;
    }
  },

  // ==================== Batch Operations ====================

  async batchUpdateBoutiques(uuids: string[], updates: BoutiqueUpdateData): Promise<Boutique[]> {
    try {
      console.log("🔄 Batch updating boutiques:", uuids.length);

      const endpoint = "/boutiques/batch-update";
      const response = await api.post<ApiResponse<Boutique[]>>(
        endpoint,
        { uuids, updates }
      );

      let updatedBoutiques: Boutique[] = [];
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        updatedBoutiques = (response.data as any).data || [];
      } else if (Array.isArray(response.data)) {
        updatedBoutiques = response.data;
      }

      console.log("✅ Boutiques batch updated:", updatedBoutiques.length);
      return updatedBoutiques;
    } catch (error: any) {
      console.error("❌ Error batch updating boutiques:", error);
      throw error;
    }
  },

  async batchVerifyBoutiques(uuids: string[]): Promise<Boutique[]> {
    try {
      console.log("✅ Batch verifying boutiques:", uuids.length);

      const endpoint = "/boutiques/batch-verify";
      const response = await api.post<ApiResponse<Boutique[]>>(endpoint, { uuids });

      let verifiedBoutiques: Boutique[] = [];
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        verifiedBoutiques = (response.data as any).data || [];
      } else if (Array.isArray(response.data)) {
        verifiedBoutiques = response.data;
      }

      console.log("✅ Boutiques batch verified:", verifiedBoutiques.length);
      return verifiedBoutiques;
    } catch (error: any) {
      console.error("❌ Error batch verifying boutiques:", error);
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

  async pingBoutiqueService(): Promise<boolean> {
    try {
      console.log("🏓 Pinging boutique service...");

      await this.getBoutiques({ limit: 1 });

      console.log("✅ Boutique service is operational");
      return true;
    } catch (error: any) {
      console.error("❌ Boutique service ping failed:", error.message);
      return false;
    }
  },

  // ==================== Similar Boutiques ====================

  async getSimilarBoutiques(boutiqueUuid: string, limit: number = 6): Promise<Boutique[]> {
    try {
      console.log("🔍 Finding similar boutiques for:", boutiqueUuid);

      // Récupérer la boutique de référence
      const referenceBoutique = await this.getBoutique(boutiqueUuid);

      // Chercher des boutiques similaires
      const { boutiques } = await this.getBoutiques({
        limit: 20,
        statut: 'actif',
        type_boutique_uuid: referenceBoutique.type_boutique_uuid,
        ville: referenceBoutique.ville
      });

      // Filtrer la boutique de référence
      const otherBoutiques = boutiques.filter(b => b.uuid !== boutiqueUuid);

      // Trier par similarité
      const similarBoutiques = otherBoutiques
        .map(boutique => {
          let similarity = 0;

          // Même type
          if (boutique.type_boutique_uuid === referenceBoutique.type_boutique_uuid) similarity += 40;

          // Même ville
          if (boutique.ville === referenceBoutique.ville) similarity += 30;

          // Catégories similaires
          const commonCategories = referenceBoutique.categories_principales.filter(cat =>
            boutique.categories_principales.includes(cat)
          );
          similarity += commonCategories.length * 10;

          // Note similaire
          const noteDiff = Math.abs(boutique.note_moyenne - referenceBoutique.note_moyenne);
          if (noteDiff <= 1) similarity += 20;

          return { boutique, similarity };
        })
        .sort((a, b) => b.similarity - a.similarity)
        .map(item => item.boutique)
        .slice(0, limit);

      console.log("✅ Similar boutiques found:", similarBoutiques.length);
      return similarBoutiques;
    } catch (error: any) {
      console.error("❌ Error finding similar boutiques:", error);
      throw error;
    }
  },

  // ==================== Featured Products ====================

  async getFeaturedBoutiqueProducts(boutiqueUuid: string, limit: number = 8): Promise<BoutiqueProduit[]> {
    try {
      console.log("⭐ Getting featured products for boutique:", boutiqueUuid);

      const { produits } = await this.getBoutiqueProducts(boutiqueUuid, {
        limit,
        sortBy: 'ventes',
        sortOrder: 'desc'
      });

      // Filtrer les produits en promotion ou populaires
      const featuredProducts = produits
        .filter(p => p.est_en_promotion || p.ventes > 0)
        .slice(0, limit);

      console.log("✅ Featured products fetched:", featuredProducts.length);
      return featuredProducts;
    } catch (error: any) {
      console.error("❌ Error getting featured products:", error);
      throw error;
    }
  },

  // ==================== Dashboard Stats ====================

  async getDashboardStats(proprietaireUuid: string): Promise<{
    total_boutiques: number;
    boutiques_actives: number;
    produits_total: number;
    commandes_aujourdhui: number;
    revenus_mois: number;
    avis_non_lus: number;
    produits_faible_stock: number;
    promotions_actives: number;
  }> {
    try {
      console.log("📊 Getting dashboard stats for owner:", proprietaireUuid);

      // Récupérer les boutiques du propriétaire
      const { boutiques } = await this.getBoutiquesByOwner(proprietaireUuid);

      // Calculer les stats
      const stats = {
        total_boutiques: boutiques.length,
        boutiques_actives: boutiques.filter(b => b.statut === 'actif' && !b.est_ferme).length,
        produits_total: boutiques.reduce((sum, b) => sum + b.nombre_produits, 0),
        commandes_aujourdhui: 0, // À calculer avec l'API des commandes
        revenus_mois: boutiques.reduce((sum, b) => sum + b.chiffre_affaires_total, 0),
        avis_non_lus: 0, // À calculer avec l'API des avis
        produits_faible_stock: 0, // À calculer avec l'API des produits
        promotions_actives: 0 // À calculer avec l'API des promotions
      };

      console.log("✅ Dashboard stats calculated:", stats);
      return stats;
    } catch (error: any) {
      console.error("❌ Error getting dashboard stats:", error);
      throw error;
    }
  },
};
