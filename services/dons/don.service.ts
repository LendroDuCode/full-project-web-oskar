// services/dons/don.service.ts
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import type {
  Don,
  DonCreateData,
  DonUpdateData,
  DonFilterParams,
  DonPaginationParams,
  DonStats,
  DonValidationResult,
  DonBulkUpdate,
  DonWithDetails,
  DonDemande,
  DonReview,
  DonExportOptions,
  DonAnalytics,
  DonMatchSuggestion,
  DonVerificationRequest,
  DonAuditLog,
  DonSearchResult,
  DonCategoryStats,
  DonLocationCluster
} from "./don.types";

export interface ApiResponse<T> {
  data: T;
  status: string;
  message?: string;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
}

export const donService = {
  // ==================== CRUD Operations ====================

  async getDons(params?: DonPaginationParams): Promise<{ dons: Don[]; count?: number; total?: number; page?: number; pages?: number }> {
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
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            queryParams.append(key, value.join(','));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.DONS.LIST}?${queryString}`
      : API_ENDPOINTS.DONS.LIST;

    console.log("📡 Fetching dons from:", endpoint);

    try {
      const response = await api.get<ApiResponse<Don[]>>(endpoint);

      console.log("✅ Dons response received:", {
        hasData: !!response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
      });

      let dons: Don[] = [];
      let count = 0;
      let total = 0;
      let page = 1;
      let pages = 1;

      if (Array.isArray(response.data)) {
        dons = response.data;
        count = response.data.length;
      } else if (response.data && typeof response.data === 'object') {
        if ('data' in response.data && Array.isArray((response.data as any).data)) {
          dons = (response.data as any).data || [];
          count = (response.data as any).count || dons.length;
          total = (response.data as any).total || count;
          page = (response.data as any).page || 1;
          pages = (response.data as any).pages || 1;
        } else if ('dons' in response.data && Array.isArray((response.data as any).dons)) {
          dons = (response.data as any).dons || [];
          count = (response.data as any).count || dons.length;
          total = (response.data as any).total || count;
          page = (response.data as any).page || 1;
          pages = (response.data as any).pages || 1;
        }
      }

      return { dons, count, total, page, pages };
    } catch (error: any) {
      console.error("🚨 Error in donService.getDons:", {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  async getDon(uuid: string): Promise<Don> {
    try {
      console.log("🔍 Fetching don:", uuid);

      const response = await api.get<ApiResponse<Don>>(
        API_ENDPOINTS.DONS.DETAIL(uuid)
      );

      console.log("✅ Don response:", {
        hasData: !!response.data,
        dataType: typeof response.data,
      });

      let donData: Don;

      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        donData = (response.data as any).data;
      } else if (response.data && (response.data as any).uuid) {
        donData = response.data as Don;
      } else {
        console.error("❌ Invalid don data structure:", response.data);
        throw new Error("Structure de données don invalide");
      }

      if (!donData || !donData.uuid) {
        throw new Error("Don non trouvé");
      }

      console.log("✅ Don found");
      return donData;
    } catch (error: any) {
      console.error("❌ Error fetching don:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  async createDon(donData: DonCreateData): Promise<Don> {
    try {
      console.log("🆕 Creating don:", donData.titre);

      // Valider les données avant envoi
      const validation = await this.validateDon(donData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const response = await api.post<ApiResponse<Don>>(
        API_ENDPOINTS.DONS.CREATE,
        donData,
      );

      console.log("✅ Don creation response:", response.data);

      let createdDon: Don;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        createdDon = (response.data as any).data;
      } else {
        createdDon = response.data as Don;
      }

      if (!createdDon || !createdDon.uuid) {
        throw new Error("Échec de la création du don");
      }

      return createdDon;
    } catch (error: any) {
      console.error("❌ Error creating don:", {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  async updateDon(uuid: string, donData: DonUpdateData): Promise<Don> {
    try {
      console.log("✏️ Updating don:", uuid);

      const response = await api.put<ApiResponse<Don>>(
        API_ENDPOINTS.DONS.UPDATE(uuid),
        donData,
      );

      console.log("✅ Don update response:", response.data);

      let updatedDon: Don;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        updatedDon = (response.data as any).data;
      } else {
        updatedDon = response.data as Don;
      }

      return updatedDon;
    } catch (error: any) {
      console.error("❌ Error updating don:", error);
      throw error;
    }
  },

  async deleteDon(uuid: string): Promise<void> {
    try {
      console.log("🗑️ Deleting don:", uuid);

      await api.delete(API_ENDPOINTS.DONS.DELETE(uuid));

      console.log("✅ Don deleted successfully");
    } catch (error: any) {
      console.error("❌ Error deleting don:", error);
      throw error;
    }
  },

  // ==================== Operations Spécifiques ====================

  async publishDon(uuid: string): Promise<Don> {
    try {
      console.log("📢 Publishing don:", uuid);

      const updates: DonUpdateData = {
        statut: "publie",
        date_publication: new Date().toISOString()
      };

      return await this.updateDon(uuid, updates);
    } catch (error: any) {
      console.error("❌ Error publishing don:", error);
      throw error;
    }
  },

  async unpublishDon(uuid: string): Promise<Don> {
    try {
      console.log("📵 Unpublishing don:", uuid);

      const updates: DonUpdateData = {
        statut: "brouillon"
      };

      return await this.updateDon(uuid, updates);
    } catch (error: any) {
      console.error("❌ Error unpublishing don:", error);
      throw error;
    }
  },

  async blockDon(uuid: string, motif?: string): Promise<Don> {
    try {
      console.log("🚫 Blocking don:", uuid, "motif:", motif);

      const updates: DonUpdateData = {
        statut: "bloque",
        motif_blocage: motif
      };

      return await this.updateDon(uuid, updates);
    } catch (error: any) {
      console.error("❌ Error blocking don:", error);
      throw error;
    }
  },

  async unblockDon(uuid: string): Promise<Don> {
    try {
      console.log("✅ Unblocking don:", uuid);

      const updates: DonUpdateData = {
        statut: "publie",
        motif_blocage: undefined
      };

      return await this.updateDon(uuid, updates);
    } catch (error: any) {
      console.error("❌ Error unblocking don:", error);
      throw error;
    }
  },

  async archiveDon(uuid: string): Promise<Don> {
    try {
      console.log("📁 Archiving don:", uuid);

      const updates: DonUpdateData = {
        statut: "archive",
        date_archivage: new Date().toISOString()
      };

      return await this.updateDon(uuid, updates);
    } catch (error: any) {
      console.error("❌ Error archiving don:", error);
      throw error;
    }
  },

  async restoreDon(uuid: string): Promise<Don> {
    try {
      console.log("↩️ Restoring don:", uuid);

      const updates: DonUpdateData = {
        statut: "publie"
      };

      return await this.updateDon(uuid, updates);
    } catch (error: any) {
      console.error("❌ Error restoring don:", error);
      throw error;
    }
  },

  async validateDon(uuid: string, validateurUuid: string): Promise<Don> {
    try {
      console.log("✅ Validating don:", uuid);

      const updates: DonUpdateData = {
        est_valide: true,
        valide_par: validateurUuid,
        date_validation: new Date().toISOString()
      };

      return await this.updateDon(uuid, updates);
    } catch (error: any) {
      console.error("❌ Error validating don:", error);
      throw error;
    }
  },

  // ==================== Filtres et Recherche ====================

  async getDonsByCategory(categoryUuid: string, params?: DonPaginationParams): Promise<{ dons: Don[]; count: number }> {
    try {
      console.log("📂 Getting dons by category:", categoryUuid);

      const { dons, count } = await this.getDons({
        ...params,
        filters: { categorie_uuid: categoryUuid }
      });

      console.log("✅ Found", dons.length, "dons in category");
      return { dons, count: count || dons.length };
    } catch (error: any) {
      console.error("❌ Error getting dons by category:", error);
      throw error;
    }
  },

  async getDonsByDonateur(donateurUuid: string, params?: DonPaginationParams): Promise<{ dons: Don[]; count: number }> {
    try {
      console.log("🤲 Getting dons by donateur:", donateurUuid);

      const { dons, count } = await this.getDons({
        ...params,
        filters: { donateur_uuid: donateurUuid }
      });

      console.log("✅ Found", dons.length, "dons by donateur");
      return { dons, count: count || dons.length };
    } catch (error: any) {
      console.error("❌ Error getting dons by donateur:", error);
      throw error;
    }
  },

  async getPublishedDons(params?: DonPaginationParams): Promise<{ dons: Don[]; count: number }> {
    try {
      console.log("📰 Getting published dons");

      const { dons, count } = await this.getDons({
        ...params,
        filters: { statut: "publie" }
      });

      console.log("✅ Found", dons.length, "published dons");
      return { dons, count: count || dons.length };
    } catch (error: any) {
      console.error("❌ Error getting published dons:", error);
      throw error;
    }
  },

  async getPendingDons(params?: DonPaginationParams): Promise<{ dons: Don[]; count: number }> {
    try {
      console.log("⏳ Getting pending dons");

      const { dons, count } = await this.getDons({
        ...params,
        filters: { statut: "en_attente" }
      });

      console.log("✅ Found", dons.length, "pending dons");
      return { dons, count: count || dons.length };
    } catch (error: any) {
      console.error("❌ Error getting pending dons:", error);
      throw error;
    }
  },

  async getBlockedDons(params?: DonPaginationParams): Promise<{ dons: Don[]; count: number }> {
    try {
      console.log("🚫 Getting blocked dons");

      const { dons, count } = await this.getDons({
        ...params,
        filters: { statut: "bloque" }
      });

      console.log("✅ Found", dons.length, "blocked dons");
      return { dons, count: count || dons.length };
    } catch (error: any) {
      console.error("❌ Error getting blocked dons:", error);
      throw error;
    }
  },

  async searchDons(searchTerm: string, filters?: DonFilterParams): Promise<DonSearchResult> {
    try {
      console.log("🔍 Searching dons for:", searchTerm);

      const endpoint = API_ENDPOINTS.DONS.SEARCH;
      const response = await api.get<ApiResponse<DonSearchResult>>(endpoint, {
        params: { search: searchTerm, ...filters }
      });

      // Structure par défaut
      const defaultResult: DonSearchResult = {
        dons: [],
        total: 0,
        page: 1,
        pages: 1,
        facets: {
          categories: [],
          villes: [],
          etats: []
        }
      };

      let result = defaultResult;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        result = { ...defaultResult, ...(response.data as any).data };
      } else if (response.data && typeof response.data === 'object') {
        result = { ...defaultResult, ...response.data };
      }

      console.log("✅ Found", result.dons.length, "dons matching search");
      return result;
    } catch (error: any) {
      console.error("❌ Error searching dons:", error);
      throw error;
    }
  },

  async getDonsNearby(latitude: number, longitude: number, radiusKm: number = 10): Promise<Don[]> {
    try {
      console.log("📍 Getting dons nearby:", { latitude, longitude, radiusKm });

      const endpoint = API_ENDPOINTS.DONS.NEARBY;
      const response = await api.get<ApiResponse<Don[]>>(endpoint, {
        params: { latitude, longitude, radius_km: radiusKm }
      });

      let dons: Don[] = [];
      if (Array.isArray(response.data)) {
        dons = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        dons = (response.data as any).data || [];
      }

      console.log("✅ Found", dons.length, "dons nearby");
      return dons;
    } catch (error: any) {
      console.error("❌ Error getting nearby dons:", error);
      throw error;
    }
  },

  async getLocationClusters(bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }): Promise<DonLocationCluster[]> {
    try {
      console.log("🗺️ Getting location clusters");

      const endpoint = API_ENDPOINTS.DONS.CLUSTERS;
      const response = await api.get<ApiResponse<DonLocationCluster[]>>(endpoint, {
        params: bounds
      });

      let clusters: DonLocationCluster[] = [];
      if (Array.isArray(response.data)) {
        clusters = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        clusters = (response.data as any).data || [];
      }

      console.log("✅ Found", clusters.length, "location clusters");
      return clusters;
    } catch (error: any) {
      console.error("❌ Error getting location clusters:", error);
      throw error;
    }
  },

  // ==================== Validation ====================

  async validateDon(donData: DonCreateData): Promise<DonValidationResult> {
    try {
      console.log("✅ Validating don data");

      const errors: string[] = [];
      const warnings: string[] = [];
      const suggestions: string[] = [];

      // Validation de base
      if (!donData.titre?.trim()) {
        errors.push("Le titre est obligatoire");
      } else if (donData.titre.length < 3) {
        errors.push("Le titre doit contenir au moins 3 caractères");
      }

      if (!donData.description?.trim()) {
        errors.push("La description est obligatoire");
      } else if (donData.description.length < 10) {
        warnings.push("La description semble trop courte");
      }

      if (!donData.categorie_uuid) {
        errors.push("La catégorie est obligatoire");
      }

      // Validation de la quantité
      if (!donData.quantite_totale || donData.quantite_totale <= 0) {
        errors.push("La quantité totale doit être supérieure à 0");
      } else if (donData.quantite_totale > 10000) {
        warnings.push("La quantité semble très élevée");
      }

      // Validation des dates
      if (donData.date_peremption) {
        const peremption = new Date(donData.date_peremption);
        const aujourdhui = new Date();
        if (peremption < aujourdhui) {
          errors.push("La date de péremption est dépassée");
        } else if (peremption < new Date(aujourdhui.getTime() + 7 * 24 * 60 * 60 * 1000)) {
          warnings.push("La date de péremption est dans moins d'une semaine");
        }
      }

      // Validation des images
      if (!donData.images || donData.images.length === 0) {
        warnings.push("Aucune image fournie");
        suggestions.push("Ajoutez au moins une photo pour augmenter la visibilité");
      } else if (donData.images.length < 3) {
        suggestions.push("Ajoutez plus de photos pour mieux présenter votre don");
      }

      // Validation de la localisation
      if (!donData.localisation && !donData.ville) {
        warnings.push("Aucune localisation spécifiée");
      }

      if (donData.livraison_possible && !donData.frais_livraison && donData.frais_livraison !== 0) {
        warnings.push("Les frais de livraison ne sont pas spécifiés alors que la livraison est possible");
      }

      // Suggestions d'amélioration
      if (!donData.description_courte) {
        suggestions.push("Ajoutez une description courte pour un meilleur aperçu");
      }

      if (!donData.tags || donData.tags.length === 0) {
        suggestions.push("Ajoutez des mots-clés pour améliorer la recherche");
      }

      if (!donData.restrictions) {
        suggestions.push("Définissez des restrictions si nécessaire pour cibler les bénéficiaires");
      }

      const isValid = errors.length === 0;

      return {
        isValid,
        errors,
        warnings,
        suggestions,
        quantite_max_recommandee: this.calculateRecommendedQuantity(donData.quantite_totale),
        images_manquantes: !donData.images || donData.images.length === 0,
        description_completee: (donData.description?.length || 0) > 100
      };
    } catch (error: any) {
      console.error("❌ Error validating don:", error);
      throw error;
    }
  },

  private calculateRecommendedQuantity(quantite: number): number {
    // Logique de recommandation basée sur la quantité
    if (quantite < 10) return quantite;
    if (quantite < 100) return Math.floor(quantite / 2);
    return Math.floor(quantite / 5);
  },

  // ==================== Demandes ====================

  async getDonDemandes(donUuid: string): Promise<DonDemande[]> {
    try {
      console.log("📝 Getting demandes for don:", donUuid);

      const endpoint = API_ENDPOINTS.DONS.DEMANDES(donUuid);
      const response = await api.get<ApiResponse<DonDemande[]>>(endpoint);

      let demandes: DonDemande[] = [];
      if (Array.isArray(response.data)) {
        demandes = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        demandes = (response.data as any).data || [];
      }

      console.log("✅ Found", demandes.length, "demandes");
      return demandes;
    } catch (error: any) {
      console.error("❌ Error getting don demandes:", error);
      throw error;
    }
  },

  async createDemande(donUuid: string, demandeData: {
    utilisateur_uuid: string;
    utilisateur_nom: string;
    utilisateur_email: string;
    utilisateur_telephone?: string;
    quantite_demandee: number;
    message?: string;
    motivation?: string;
    mode_livraison?: "sur_place" | "livraison" | "envoi";
  }): Promise<DonDemande> {
    try {
      console.log("🙋 Creating demande for don:", donUuid);

      const endpoint = API_ENDPOINTS.DONS.CREATE_DEMANDE(donUuid);
      const response = await api.post<ApiResponse<DonDemande>>(
        endpoint,
        demandeData
      );

      let demande: DonDemande;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        demande = (response.data as any).data;
      } else {
        demande = response.data as DonDemande;
      }

      console.log("✅ Demande created");
      return demande;
    } catch (error: any) {
      console.error("❌ Error creating demande:", error);
      throw error;
    }
  },

  async updateDemandeStatus(demandeUuid: string, statut: "acceptee" | "refusee" | "annulee", notes?: string): Promise<DonDemande> {
    try {
      console.log("🔄 Updating demande status:", demandeUuid, "to:", statut);

      const endpoint = API_ENDPOINTS.DONS.UPDATE_DEMANDE(demandeUuid);
      const response = await api.put<ApiResponse<DonDemande>>(
        endpoint,
        { statut, notes }
      );

      let demande: DonDemande;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        demande = (response.data as any).data;
      } else {
        demande = response.data as DonDemande;
      }

      console.log("✅ Demande status updated");
      return demande;
    } catch (error: any) {
      console.error("❌ Error updating demande status:", error);
      throw error;
    }
  },

  // ==================== Reviews (Avis) ====================

  async getDonReviews(donUuid: string): Promise<DonReview[]> {
    try {
      console.log("⭐ Getting reviews for don:", donUuid);

      const endpoint = API_ENDPOINTS.DONS.REVIEWS(donUuid);
      const response = await api.get<ApiResponse<DonReview[]>>(endpoint);

      let reviews: DonReview[] = [];
      if (Array.isArray(response.data)) {
        reviews = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        reviews = (response.data as any).data || [];
      }

      console.log("✅ Found", reviews.length, "reviews");
      return reviews;
    } catch (error: any) {
      console.error("❌ Error getting don reviews:", error);
      throw error;
    }
  },

  async createReview(donUuid: string, reviewData: {
    evaluateur_uuid: string;
    evaluateur_type: "donateur" | "beneficiaire";
    note: number;
    commentaire: string;
    aspects?: {
      qualite?: number;
      description_accurate?: number;
      ponctualite?: number;
      communication?: number;
    };
    recommandation: boolean;
    tags?: string[];
  }): Promise<DonReview> {
    try {
      console.log("📝 Creating review for don:", donUuid);

      const endpoint = API_ENDPOINTS.DONS.CREATE_REVIEW(donUuid);
      const response = await api.post<ApiResponse<DonReview>>(
        endpoint,
        reviewData
      );

      let review: DonReview;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        review = (response.data as any).data;
      } else {
        review = response.data as DonReview;
      }

      console.log("✅ Review created");
      return review;
    } catch (error: any) {
      console.error("❌ Error creating review:", error);
      throw error;
    }
  },

  // ==================== Statistiques ====================

  async getDonStats(filters?: DonFilterParams): Promise<DonStats> {
    try {
      console.log("📊 Fetching don statistics");

      const endpoint = API_ENDPOINTS.DONS.STATS;
      const response = await api.get<ApiResponse<DonStats>>(endpoint, {
        params: filters
      });

      // Structure par défaut
      const defaultStats: DonStats = {
        total_dons: 0,
        dons_par_statut: {},
        dons_par_categorie: [],
        dons_par_mois: [],
        quantite_totale: 0,
        quantite_disponible: 0,
        quantite_distribuee: 0,
        taux_disponibilite: 0,
        taux_distribution: 0,
        top_donateurs: [],
        top_categories: [],
        distribution_geographique: [],
        metrics: {
          dons_moyens_par_donateur: 0,
          quantite_moyenne_par_don: 0,
          delai_moyen_distribution: 0,
          satisfaction_moyenne: 0
        }
      };

      let stats = defaultStats;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        stats = { ...defaultStats, ...(response.data as any).data };
      } else if (response.data && typeof response.data === 'object') {
        stats = { ...defaultStats, ...response.data };
      }

      console.log("✅ Don stats fetched");
      return stats;
    } catch (error: any) {
      console.error("❌ Error fetching don stats:", error);
      throw error;
    }
  },

  async getCategoryStats(categoryUuid: string): Promise<DonCategoryStats> {
    try {
      console.log("📈 Getting category stats:", categoryUuid);

      const endpoint = API_ENDPOINTS.DONS.CATEGORY_STATS(categoryUuid);
      const response = await api.get<ApiResponse<DonCategoryStats>>(endpoint);

      // Structure par défaut
      const defaultStats: DonCategoryStats = {
        categorie_uuid: categoryUuid,
        categorie_nom: "",
        total_dons: 0,
        dons_disponibles: 0,
        quantite_totale: 0,
        quantite_disponible: 0,
        taux_disponibilite: 0,
        taux_interet: 0,
        dons_par_mois: [],
        top_donateurs: []
      };

      let stats = defaultStats;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        stats = { ...defaultStats, ...(response.data as any).data };
      } else if (response.data && typeof response.data === 'object') {
        stats = { ...defaultStats, ...response.data };
      }

      console.log("✅ Category stats fetched");
      return stats;
    } catch (error: any) {
      console.error("❌ Error getting category stats:", error);
      throw error;
    }
  },

  async getDonAnalytics(periode: { debut: string; fin: string }, filters?: DonFilterParams): Promise<DonAnalytics> {
    try {
      console.log("📈 Getting don analytics");

      const endpoint = API_ENDPOINTS.DONS.ANALYTICS;
      const response = await api.get<ApiResponse<DonAnalytics>>(endpoint, {
        params: { ...periode, ...filters }
      });

      // Structure par défaut
      const defaultAnalytics: DonAnalytics = {
        periode,
        volume: {
          total_dons: 0,
          nouveaux_dons: 0,
          dons_completes: 0,
          par_jour: []
        },
        engagement: {
          vues_moyennes: 0,
          taux_interet: 0,
          taux_demande: 0,
          taux_conversion: 0,
          delai_moyen_traitement: 0
        },
        qualite: {
          dons_avec_images: 0,
          dons_detailles: 0,
          satisfaction_moyenne: 0,
          taux_revision: 0
        },
        geographie: {
          top_villes: [],
          top_pays: [],
          distribution_regionale: {}
        },
        categories: {
          plus_populaires: [],
          taux_disponibilite: {},
          tendances: []
        }
      };

      let analytics = defaultAnalytics;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        analytics = { ...defaultAnalytics, ...(response.data as any).data };
      } else if (response.data && typeof response.data === 'object') {
        analytics = { ...defaultAnalytics, ...response.data };
      }

      console.log("✅ Don analytics fetched");
      return analytics;
    } catch (error: any) {
      console.error("❌ Error getting don analytics:", error);
      throw error;
    }
  },

  // ==================== Notifications ====================

  async getDonNotifications(donUuid: string): Promise<DonNotification[]> {
    try {
      console.log("🔔 Getting notifications for don:", donUuid);

      const endpoint = API_ENDPOINTS.DONS.NOTIFICATIONS(donUuid);
      const response = await api.get<ApiResponse<DonNotification[]>>(endpoint);

      let notifications: DonNotification[] = [];
      if (Array.isArray(response.data)) {
        notifications = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        notifications = (response.data as any).data || [];
      }

      console.log("✅ Found", notifications.length, "notifications");
      return notifications;
    } catch (error: any) {
      console.error("❌ Error getting don notifications:", error);
      throw error;
    }
  },

  async sendDonNotification(donUuid: string, notificationData: {
    type: "nouveau_don" | "validation_requise" | "demande_recue" | "demande_acceptee" | "demande_refusee" | "rappel" | "expiration_proche";
    destinataire_uuid: string;
    destinataire_type: string;
    sujet: string;
    contenu: string;
    methode?: "email" | "sms" | "push" | "in_app";
  }): Promise<DonNotification> {
    try {
      console.log("📨 Sending notification for don:", donUuid);

      const endpoint = API_ENDPOINTS.DONS.SEND_NOTIFICATION(donUuid);
      const response = await api.post<ApiResponse<DonNotification>>(
        endpoint,
        notificationData
      );

      let notification: DonNotification;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        notification = (response.data as any).data;
      } else {
        notification = response.data as DonNotification;
      }

      console.log("✅ Notification sent");
      return notification;
    } catch (error: any) {
      console.error("❌ Error sending notification:", error);
      throw error;
    }
  },

  // ==================== Matching ====================

  async getMatchSuggestions(donUuid: string): Promise<DonMatchSuggestion> {
    try {
      console.log("💡 Getting match suggestions for don:", donUuid);

      const endpoint = API_ENDPOINTS.DONS.MATCH_SUGGESTIONS(donUuid);
      const response = await api.get<ApiResponse<DonMatchSuggestion>>(endpoint);

      let suggestions: DonMatchSuggestion;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        suggestions = (response.data as any).data;
      } else {
        suggestions = response.data as DonMatchSuggestion;
      }

      console.log("✅ Found match suggestions");
      return suggestions;
    } catch (error: any) {
      console.error("❌ Error getting match suggestions:", error);
      throw error;
    }
  },

  // ==================== Vérification ====================

  async requestVerification(donUuid: string, verificationData: {
    type_verification: "qualite" | "authenticite" | "disponibilite" | "complet";
    notes?: string;
  }): Promise<DonVerificationRequest> {
    try {
      console.log("🔍 Requesting verification for don:", donUuid);

      const endpoint = API_ENDPOINTS.DONS.VERIFICATION_REQUESTS(donUuid);
      const response = await api.post<ApiResponse<DonVerificationRequest>>(
        endpoint,
        verificationData
      );

      let request: DonVerificationRequest;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        request = (response.data as any).data;
      } else {
        request = response.data as DonVerificationRequest;
      }

      console.log("✅ Verification request created");
      return request;
    } catch (error: any) {
      console.error("❌ Error requesting verification:", error);
      throw error;
    }
  },

  // ==================== Batch Operations ====================

  async bulkUpdateDons(bulkUpdate: DonBulkUpdate): Promise<Don[]> {
    try {
      console.log("🔄 Bulk updating", bulkUpdate.uuids.length, "dons");

      const endpoint = API_ENDPOINTS.DONS.BULK_UPDATE;
      const response = await api.post<ApiResponse<Don[]>>(endpoint, bulkUpdate);

      let updatedDons: Don[] = [];
      if (Array.isArray(response.data)) {
        updatedDons = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        updatedDons = (response.data as any).data || [];
      }

      console.log("✅ Dons bulk updated:", updatedDons.length);
      return updatedDons;
    } catch (error: any) {
      console.error("❌ Error bulk updating dons:", error);
      throw error;
    }
  },

  async bulkDeleteDons(uuids: string[]): Promise<{ deleted: number; errors: string[] }> {
    try {
      console.log("🗑️ Bulk deleting", uuids.length, "dons");

      const endpoint = API_ENDPOINTS.DONS.BULK_DELETE;
      const response = await api.post<ApiResponse<{ deleted: number; errors: string[] }>>(
        endpoint,
        { uuids }
      );

      let result: { deleted: number; errors: string[] };
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        result = (response.data as any).data;
      } else {
        result = response.data as { deleted: number; errors: string[] };
      }

      console.log("✅ Dons bulk deleted:", result.deleted, "errors:", result.errors.length);
      return result;
    } catch (error: any) {
      console.error("❌ Error bulk deleting dons:", error);
      throw error;
    }
  },

  async bulkPublishDons(uuids: string[]): Promise<Don[]> {
    try {
      console.log("📢 Bulk publishing", uuids.length, "dons");

      const updates: DonUpdateData = { statut: "publie" };
      const result = await this.bulkUpdateDons({ uuids, updates });

      console.log("✅ Dons bulk published:", result.length);
      return result;
    } catch (error: any) {
      console.error("❌ Error bulk publishing dons:", error);
      throw error;
    }
  },

  async bulkArchiveDons(uuids: string[]): Promise<Don[]> {
    try {
      console.log("📁 Bulk archiving", uuids.length, "dons");

      const updates: DonUpdateData = { statut: "archive" };
      const result = await this.bulkUpdateDons({ uuids, updates });

      console.log("✅ Dons bulk archived:", result.length);
      return result;
    } catch (error: any) {
      console.error("❌ Error bulk archiving dons:", error);
      throw error;
    }
  },

  // ==================== Export ====================

  async exportDons(options: DonExportOptions): Promise<Blob> {
    try {
      console.log("📤 Exporting dons in", options.format, "format");

      const endpoint = API_ENDPOINTS.DONS.EXPORT;
      const response = await api.post(
        endpoint,
        options,
        { responseType: "blob" }
      );

      console.log("✅ Dons exported successfully");
      return response;
    } catch (error: any) {
      console.error("❌ Error exporting dons:", error);
      throw error;
    }
  },

  // ==================== Audit ====================

  async getAuditLog(donUuid: string): Promise<DonAuditLog[]> {
    try {
      console.log("📜 Getting audit log for don:", donUuid);

      const endpoint = API_ENDPOINTS.DONS.AUDIT(donUuid);
      const response = await api.get<ApiResponse<DonAuditLog[]>>(endpoint);

      let auditLog: DonAuditLog[] = [];
      if (Array.isArray(response.data)) {
        auditLog = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        auditLog = (response.data as any).data || [];
      }

      console.log("✅ Found", auditLog.length, "audit entries");
      return auditLog;
    } catch (error: any) {
      console.error("❌ Error getting audit log:", error);
      throw error;
    }
  },

  // ==================== Utilitaires ====================

  async getDonWithDetails(uuid: string): Promise<DonWithDetails> {
    try {
      console.log("🔍 Getting don with details:", uuid);

      const [don, demandes, reviews] = await Promise.all([
        this.getDon(uuid),
        this.getDonDemandes(uuid).catch(() => []),
        this.getDonReviews(uuid).catch(() => [])
      ]);

      const donWithDetails: DonWithDetails = {
        ...don,
        demandes,
        statistiques: {
          vues_par_jour: [], // À récupérer d'une autre API si disponible
          demandes_par_statut: demandes.reduce((acc, demande) => {
            acc[demande.statut] = (acc[demande.statut] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          taux_conversion: demandes.length > 0
            ? (demandes.filter(d => d.statut === "acceptee").length / demandes.length) * 100
            : 0,
          delai_moyen_reponse: 0 // À calculer si les dates sont disponibles
        },
        metadata: {
          ...don.metadata,
          reviews_count: reviews.length,
          average_rating: reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.note, 0) / reviews.length
            : undefined
        }
      };

      console.log("✅ Don with details fetched");
      return donWithDetails;
    } catch (error: any) {
      console.error("❌ Error getting don with details:", error);
      throw error;
    }
  },

  async checkAvailability(donUuid: string, quantiteDemandee: number): Promise<{
    disponible: boolean;
    quantite_disponible: number;
    demandes_en_cours: number;
    suggestions?: string[];
  }> {
    try {
      console.log("📊 Checking availability for don:", donUuid, "quantite:", quantiteDemandee);

      const don = await this.getDon(donUuid);
      const demandes = await this.getDonDemandes(donUuid);

      const demandesActives = demandes.filter(d =>
        ["en_attente", "confirmee", "acceptee"].includes(d.statut)
      );

      const quantiteReservee = demandesActives.reduce((sum, d) =>
        sum + (d.quantite_acceptee || d.quantite_demandee), 0
      );

      const quantiteReellementDisponible = don.quantite_disponible - quantiteReservee;

      const disponible = quantiteReellementDisponible >= quantiteDemandee;

      const suggestions: string[] = [];
      if (!disponible && quantiteReellementDisponible > 0) {
        suggestions.push(`Seulement ${quantiteReellementDisponible} unités disponibles`);
      }

      if (demandesActives.length > 0) {
        suggestions.push(`${demandesActives.length} demande(s) en cours pour ce don`);
      }

      return {
        disponible,
        quantite_disponible: quantiteReellementDisponible,
        demandes_en_cours: demandesActives.length,
        suggestions
      };
    } catch (error: any) {
      console.error("❌ Error checking availability:", error);
      throw error;
    }
  },

  async incrementViews(donUuid: string): Promise<Don> {
    try {
      console.log("👀 Incrementing views for don:", donUuid);

      const endpoint = API_ENDPOINTS.DONS.INCREMENT_VIEWS(donUuid);
      const response = await api.post<ApiResponse<Don>>(endpoint);

      let don: Don;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        don = (response.data as any).data;
      } else {
        don = response.data as Don;
      }

      console.log("✅ Views incremented");
      return don;
    } catch (error: any) {
      console.error("❌ Error incrementing views:", error);
      // Ne pas échouer silencieusement pour cette opération non critique
      throw error;
    }
  },

  async getSimilarDons(donUuid: string, limit: number = 5): Promise<Don[]> {
    try {
      console.log("🔄 Getting similar dons for:", donUuid);

      const endpoint = API_ENDPOINTS.DONS.SIMILAR(donUuid);
      const response = await api.get<ApiResponse<Don[]>>(endpoint, {
        params: { limit }
      });

      let similarDons: Don[] = [];
      if (Array.isArray(response.data)) {
        similarDons = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        similarDons = (response.data as any).data || [];
      }

      console.log("✅ Found", similarDons.length, "similar dons");
      return similarDons;
    } catch (error: any) {
      console.error("❌ Error getting similar dons:", error);
      throw error;
    }
  },

  async getExpiringSoonDons(days: number = 7): Promise<Don[]> {
    try {
      console.log("⏰ Getting dons expiring in", days, "days");

      const endpoint = API_ENDPOINTS.DONS.EXPIRING_SOON;
      const response = await api.get<ApiResponse<Don[]>>(endpoint, {
        params: { days }
      });

      let expiringDons: Don[] = [];
      if (Array.isArray(response.data)) {
        expiringDons = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        expiringDons = (response.data as any).data || [];
      }

      console.log("✅ Found", expiringDons.length, "dons expiring soon");
      return expiringDons;
    } catch (error: any) {
      console.error("❌ Error getting expiring dons:", error);
      throw error;
    }
  },

  // ==================== Debug ====================

  async testDonService(): Promise<boolean> {
    try {
      console.log("🧪 Testing don service...");

      await this.getDons({ limit: 1 });

      console.log("✅ Don service is operational");
      return true;
    } catch (error: any) {
      console.error("❌ Don service test failed:", error.message);
      return false;
    }
  },

  async ping(): Promise<{ status: string; timestamp: string }> {
    try {
      console.log("🏓 Pinging don service...");

      await this.getDons({ limit: 1 });

      return {
        status: "OK",
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        status: "ERROR",
        timestamp: new Date().toISOString()
      };
    }
  },

  // ==================== Gestion des Favoris ====================

  async addToFavorites(donUuid: string, utilisateurUuid: string): Promise<{ success: boolean }> {
    try {
      console.log("⭐ Adding don to favorites:", donUuid, "for user:", utilisateurUuid);

      const endpoint = API_ENDPOINTS.DONS.ADD_TO_FAVORITES(donUuid);
      const response = await api.post<ApiResponse<{ success: boolean }>>(
        endpoint,
        { utilisateur_uuid: utilisateurUuid }
      );

      let result: { success: boolean };
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        result = (response.data as any).data;
      } else {
        result = response.data as { success: boolean };
      }

      console.log("✅ Added to favorites:", result.success);
      return result;
    } catch (error: any) {
      console.error("❌ Error adding to favorites:", error);
      throw error;
    }
  },

  async removeFromFavorites(donUuid: string, utilisateurUuid: string): Promise<{ success: boolean }> {
    try {
      console.log("❌ Removing don from favorites:", donUuid, "for user:", utilisateurUuid);

      const endpoint = API_ENDPOINTS.DONS.REMOVE_FROM_FAVORITES(donUuid);
      const response = await api.delete<ApiResponse<{ success: boolean }>>(
        endpoint,
        { data: { utilisateur_uuid: utilisateurUuid } }
      );

      let result: { success: boolean };
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        result = (response.data as any).data;
      } else {
        result = response.data as { success: boolean };
      }

      console.log("✅ Removed from favorites:", result.success);
      return result;
    } catch (error: any) {
      console.error("❌ Error removing from favorites:", error);
      throw error;
    }
  },

  async getFavoriteDons(utilisateurUuid: string): Promise<Don[]> {
    try {
      console.log("❤️ Getting favorite dons for user:", utilisateurUuid);

      const endpoint = API_ENDPOINTS.DONS.FAVORITES(utilisateurUuid);
      const response = await api.get<ApiResponse<Don[]>>(endpoint);

      let favorites: Don[] = [];
      if (Array.isArray(response.data)) {
        favorites = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        favorites = (response.data as any).data || [];
      }

      console.log("✅ Found", favorites.length, "favorite dons");
      return favorites;
    } catch (error: any) {
      console.error("❌ Error getting favorite dons:", error);
      throw error;
    }
  },

  // ==================== Gestion des Images ====================

  async uploadDonImage(donUuid: string, imageData: {
    file: File;
    is_main?: boolean;
    caption?: string;
  }): Promise<{ url: string; uuid: string }> {
    try {
      console.log("🖼️ Uploading image for don:", donUuid);

      const formData = new FormData();
      formData.append('image', imageData.file);
      if (imageData.is_main !== undefined) {
        formData.append('is_main', imageData.is_main.toString());
      }
      if (imageData.caption) {
        formData.append('caption', imageData.caption);
      }

      const endpoint = API_ENDPOINTS.DONS.UPLOAD_IMAGE(donUuid);
      const response = await api.post<ApiResponse<{ url: string; uuid: string }>>(
        endpoint,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      let result: { url: string; uuid: string };
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        result = (response.data as any).data;
      } else {
        result = response.data as { url: string; uuid: string };
      }

      console.log("✅ Image uploaded:", result.url);
      return result;
    } catch (error: any) {
      console.error("❌ Error uploading image:", error);
      throw error;
    }
  },

  async deleteDonImage(donUuid: string, imageUuid: string): Promise<{ success: boolean }> {
    try {
      console.log("🗑️ Deleting image:", imageUuid, "from don:", donUuid);

      const endpoint = API_ENDPOINTS.DONS.DELETE_IMAGE(donUuid, imageUuid);
      const response = await api.delete<ApiResponse<{ success: boolean }>>(endpoint);

      let result: { success: boolean };
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        result = (response.data as any).data;
      } else {
        result = response.data as { success: boolean };
      }

      console.log("✅ Image deleted:", result.success);
      return result;
    } catch (error: any) {
      console.error("❌ Error deleting image:", error);
      throw error;
    }
  },

  async reorderDonImages(donUuid: string, imageUuids: string[]): Promise<{ success: boolean }> {
    try {
      console.log("🔄 Reordering images for don:", donUuid);

      const endpoint = API_ENDPOINTS.DONS.REORDER_IMAGES(donUuid);
      const response = await api.put<ApiResponse<{ success: boolean }>>(
        endpoint,
        { image_uuids: imageUuids }
      );

      let result: { success: boolean };
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        result = (response.data as any).data;
      } else {
        result = response.data as { success: boolean };
      }

      console.log("✅ Images reordered:", result.success);
      return result;
    } catch (error: any) {
      console.error("❌ Error reordering images:", error);
      throw error;
    }
  },

  // ==================== Rapports ====================

  async generateDonReport(donUuid: string, options?: {
    include_demandes?: boolean;
    include_statistics?: boolean;
    include_audit_log?: boolean;
  }): Promise<Blob> {
    try {
      console.log("📄 Generating report for don:", donUuid);

      const endpoint = API_ENDPOINTS.DONS.GENERATE_REPORT(donUuid);
      const response = await api.post(
        endpoint,
        options,
        { responseType: "blob" }
      );

      console.log("✅ Report generated successfully");
      return response;
    } catch (error: any) {
      console.error("❌ Error generating report:", error);
      throw error;
    }
  },

  // ==================== Widgets et Utilitaires ====================

  async getDonWidgets(donUuid: string): Promise<{
    stats: {
      total_views: number;
      total_interests: number;
      total_demandes: number;
      conversion_rate: number;
    };
    recent_activity: Array<{
      type: string;
      description: string;
      date: string;
    }>;
    top_interested_users: Array<{
      uuid: string;
      nom: string;
      interest_count: number;
    }>;
  }> {
    try {
      console.log("📊 Getting widgets for don:", donUuid);

      const endpoint = API_ENDPOINTS.DONS.WIDGETS(donUuid);
      const response = await api.get<ApiResponse<any>>(endpoint);

      // Structure par défaut
      const defaultWidgets = {
        stats: {
          total_views: 0,
          total_interests: 0,
          total_demandes: 0,
          conversion_rate: 0
        },
        recent_activity: [],
        top_interested_users: []
      };

      let widgets = defaultWidgets;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        widgets = { ...defaultWidgets, ...(response.data as any).data };
      } else if (response.data && typeof response.data === 'object') {
        widgets = { ...defaultWidgets, ...response.data };
      }

      console.log("✅ Widgets fetched");
      return widgets;
    } catch (error: any) {
      console.error("❌ Error getting widgets:", error);
      throw error;
    }
  },
};
