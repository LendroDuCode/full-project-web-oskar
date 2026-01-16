// services/echanges/echange.service.ts
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import type {
  Echange,
  EchangeCreateData,
  EchangeUpdateData,
  EchangeFilterParams,
  EchangePaginationParams,
  EchangeStats,
  EchangeValidationResult,
  EchangeBulkUpdate,
  EchangeWithDetails,
  EchangeProposition,
  EchangeReview,
  EchangeExportOptions,
  EchangeAnalytics,
  EchangeMatchSuggestion,
  EchangeVerificationRequest,
  EchangeAuditLog,
  EchangeSearchResult,
  EchangeCategoryStats,
  EchangeLocationCluster,
  EchangeNegociation,
  EchangeTransaction
} from "./echange.types";

export interface ApiResponse<T> {
  data: T;
  status: string;
  message?: string;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
}

export const echangeService = {
  // ==================== CRUD Operations ====================

  async getEchanges(params?: EchangePaginationParams): Promise<{ echanges: Echange[]; count?: number; total?: number; page?: number; pages?: number }> {
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
      ? `${API_ENDPOINTS.ECHANGES.LIST}?${queryString}`
      : API_ENDPOINTS.ECHANGES.LIST;

    console.log("📡 Fetching echanges from:", endpoint);

    try {
      const response = await api.get<ApiResponse<Echange[]>>(endpoint);

      console.log("✅ Echanges response received:", {
        hasData: !!response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
      });

      let echanges: Echange[] = [];
      let count = 0;
      let total = 0;
      let page = 1;
      let pages = 1;

      if (Array.isArray(response.data)) {
        echanges = response.data;
        count = response.data.length;
      } else if (response.data && typeof response.data === 'object') {
        if ('data' in response.data && Array.isArray((response.data as any).data)) {
          echanges = (response.data as any).data || [];
          count = (response.data as any).count || echanges.length;
          total = (response.data as any).total || count;
          page = (response.data as any).page || 1;
          pages = (response.data as any).pages || 1;
        } else if ('echanges' in response.data && Array.isArray((response.data as any).echanges)) {
          echanges = (response.data as any).echanges || [];
          count = (response.data as any).count || echanges.length;
          total = (response.data as any).total || count;
          page = (response.data as any).page || 1;
          pages = (response.data as any).pages || 1;
        }
      }

      return { echanges, count, total, page, pages };
    } catch (error: any) {
      console.error("🚨 Error in echangeService.getEchanges:", {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  async getEchange(uuid: string): Promise<Echange> {
    try {
      console.log("🔍 Fetching echange:", uuid);

      const response = await api.get<ApiResponse<Echange>>(
        API_ENDPOINTS.ECHANGES.DETAIL(uuid)
      );

      console.log("✅ Echange response:", {
        hasData: !!response.data,
        dataType: typeof response.data,
      });

      let echangeData: Echange;

      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        echangeData = (response.data as any).data;
      } else if (response.data && (response.data as any).uuid) {
        echangeData = response.data as Echange;
      } else {
        console.error("❌ Invalid echange data structure:", response.data);
        throw new Error("Structure de données echange invalide");
      }

      if (!echangeData || !echangeData.uuid) {
        throw new Error("Echange non trouvé");
      }

      console.log("✅ Echange found");
      return echangeData;
    } catch (error: any) {
      console.error("❌ Error fetching echange:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  async createEchange(echangeData: EchangeCreateData): Promise<Echange> {
    try {
      console.log("🆕 Creating echange:", echangeData.titre);

      // Valider les données avant envoi
      const validation = await this.validateEchange(echangeData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const response = await api.post<ApiResponse<Echange>>(
        API_ENDPOINTS.ECHANGES.CREATE,
        echangeData,
      );

      console.log("✅ Echange creation response:", response.data);

      let createdEchange: Echange;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        createdEchange = (response.data as any).data;
      } else {
        createdEchange = response.data as Echange;
      }

      if (!createdEchange || !createdEchange.uuid) {
        throw new Error("Échec de la création de l'échange");
      }

      return createdEchange;
    } catch (error: any) {
      console.error("❌ Error creating echange:", {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  async updateEchange(uuid: string, echangeData: EchangeUpdateData): Promise<Echange> {
    try {
      console.log("✏️ Updating echange:", uuid);

      const response = await api.put<ApiResponse<Echange>>(
        API_ENDPOINTS.ECHANGES.UPDATE(uuid),
        echangeData,
      );

      console.log("✅ Echange update response:", response.data);

      let updatedEchange: Echange;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        updatedEchange = (response.data as any).data;
      } else {
        updatedEchange = response.data as Echange;
      }

      return updatedEchange;
    } catch (error: any) {
      console.error("❌ Error updating echange:", error);
      throw error;
    }
  },

  async deleteEchange(uuid: string): Promise<void> {
    try {
      console.log("🗑️ Deleting echange:", uuid);

      await api.delete(API_ENDPOINTS.ECHANGES.DELETE(uuid));

      console.log("✅ Echange deleted successfully");
    } catch (error: any) {
      console.error("❌ Error deleting echange:", error);
      throw error;
    }
  },

  // ==================== Operations Spécifiques ====================

  async publishEchange(uuid: string): Promise<Echange> {
    try {
      console.log("📢 Publishing echange:", uuid);

      const updates: EchangeUpdateData = {
        statut: "publie",
        date_publication: new Date().toISOString()
      };

      return await this.updateEchange(uuid, updates);
    } catch (error: any) {
      console.error("❌ Error publishing echange:", error);
      throw error;
    }
  },

  async unpublishEchange(uuid: string): Promise<Echange> {
    try {
      console.log("📵 Unpublishing echange:", uuid);

      const updates: EchangeUpdateData = {
        statut: "brouillon"
      };

      return await this.updateEchange(uuid, updates);
    } catch (error: any) {
      console.error("❌ Error unpublishing echange:", error);
      throw error;
    }
  },

  async blockEchange(uuid: string, motif?: string): Promise<Echange> {
    try {
      console.log("🚫 Blocking echange:", uuid, "motif:", motif);

      const updates: EchangeUpdateData = {
        statut: "bloque",
        motif_blocage: motif
      };

      return await this.updateEchange(uuid, updates);
    } catch (error: any) {
      console.error("❌ Error blocking echange:", error);
      throw error;
    }
  },

  async unblockEchange(uuid: string): Promise<Echange> {
    try {
      console.log("✅ Unblocking echange:", uuid);

      const updates: EchangeUpdateData = {
        statut: "publie",
        motif_blocage: undefined
      };

      return await this.updateEchange(uuid, updates);
    } catch (error: any) {
      console.error("❌ Error unblocking echange:", error);
      throw error;
    }
  },

  async archiveEchange(uuid: string): Promise<Echange> {
    try {
      console.log("📁 Archiving echange:", uuid);

      const updates: EchangeUpdateData = {
        statut: "archive",
        date_archivage: new Date().toISOString()
      };

      return await this.updateEchange(uuid, updates);
    } catch (error: any) {
      console.error("❌ Error archiving echange:", error);
      throw error;
    }
  },

  async restoreEchange(uuid: string): Promise<Echange> {
    try {
      console.log("↩️ Restoring echange:", uuid);

      const updates: EchangeUpdateData = {
        statut: "publie"
      };

      return await this.updateEchange(uuid, updates);
    } catch (error: any) {
      console.error("❌ Error restoring echange:", error);
      throw error;
    }
  },

  async validateEchange(uuid: string, validateurUuid: string): Promise<Echange> {
    try {
      console.log("✅ Validating echange:", uuid);

      const updates: EchangeUpdateData = {
        est_valide: true,
        valide_par: validateurUuid,
        date_validation: new Date().toISOString()
      };

      return await this.updateEchange(uuid, updates);
    } catch (error: any) {
      console.error("❌ Error validating echange:", error);
      throw error;
    }
  },

  async startNegotiation(uuid: string): Promise<Echange> {
    try {
      console.log("🤝 Starting negotiation for echange:", uuid);

      const updates: EchangeUpdateData = {
        statut: "en_cours"
      };

      return await this.updateEchange(uuid, updates);
    } catch (error: any) {
      console.error("❌ Error starting negotiation:", error);
      throw error;
    }
  },

  async finalizeEchange(uuid: string): Promise<Echange> {
    try {
      console.log("🏁 Finalizing echange:", uuid);

      const updates: EchangeUpdateData = {
        statut: "finalise"
      };

      return await this.updateEchange(uuid, updates);
    } catch (error: any) {
      console.error("❌ Error finalizing echange:", error);
      throw error;
    }
  },

  async cancelEchange(uuid: string, raison?: string): Promise<Echange> {
    try {
      console.log("🚫 Cancelling echange:", uuid, "raison:", raison);

      const updates: EchangeUpdateData = {
        statut: "annule",
        motif_blocage: raison
      };

      return await this.updateEchange(uuid, updates);
    } catch (error: any) {
      console.error("❌ Error cancelling echange:", error);
      throw error;
    }
  },

  // ==================== Filtres et Recherche ====================

  async getEchangesByCategory(categoryUuid: string, params?: EchangePaginationParams): Promise<{ echanges: Echange[]; count: number }> {
    try {
      console.log("📂 Getting echanges by category:", categoryUuid);

      const { echanges, count } = await this.getEchanges({
        ...params,
        filters: { categorie_uuid: categoryUuid }
      });

      console.log("✅ Found", echanges.length, "echanges in category");
      return { echanges, count: count || echanges.length };
    } catch (error: any) {
      console.error("❌ Error getting echanges by category:", error);
      throw error;
    }
  },

  async getEchangesByCreateur(createurUuid: string, params?: EchangePaginationParams): Promise<{ echanges: Echange[]; count: number }> {
    try {
      console.log("👑 Getting echanges by createur:", createurUuid);

      const { echanges, count } = await this.getEchanges({
        ...params,
        filters: { createur_uuid: createurUuid }
      });

      console.log("✅ Found", echanges.length, "echanges by createur");
      return { echanges, count: count || echanges.length };
    } catch (error: any) {
      console.error("❌ Error getting echanges by createur:", error);
      throw error;
    }
  },

  async getPublishedEchanges(params?: EchangePaginationParams): Promise<{ echanges: Echange[]; count: number }> {
    try {
      console.log("📰 Getting published echanges");

      const { echanges, count } = await this.getEchanges({
        ...params,
        filters: { statut: "publie" }
      });

      console.log("✅ Found", echanges.length, "published echanges");
      return { echanges, count: count || echanges.length };
    } catch (error: any) {
      console.error("❌ Error getting published echanges:", error);
      throw error;
    }
  },

  async getPendingEchanges(params?: EchangePaginationParams): Promise<{ echanges: Echange[]; count: number }> {
    try {
      console.log("⏳ Getting pending echanges");

      const { echanges, count } = await this.getEchanges({
        ...params,
        filters: { statut: "en_attente" }
      });

      console.log("✅ Found", echanges.length, "pending echanges");
      return { echanges, count: count || echanges.length };
    } catch (error: any) {
      console.error("❌ Error getting pending echanges:", error);
      throw error;
    }
  },

  async getActiveEchanges(params?: EchangePaginationParams): Promise<{ echanges: Echange[]; count: number }> {
    try {
      console.log("🔄 Getting active echanges");

      const { echanges, count } = await this.getEchanges({
        ...params,
        filters: { statut: "en_cours" }
      });

      console.log("✅ Found", echanges.length, "active echanges");
      return { echanges, count: count || echanges.length };
    } catch (error: any) {
      console.error("❌ Error getting active echanges:", error);
      throw error;
    }
  },

  async getExpiringSoonEchanges(days: number = 7): Promise<Echange[]> {
    try {
      console.log("⏰ Getting echanges expiring in", days, "days");

      const endpoint = API_ENDPOINTS.ECHANGES.EXPIRING_SOON;
      const response = await api.get<ApiResponse<Echange[]>>(endpoint, {
        params: { days }
      });

      let echanges: Echange[] = [];
      if (Array.isArray(response.data)) {
        echanges = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        echanges = (response.data as any).data || [];
      }

      console.log("✅ Found", echanges.length, "echanges expiring soon");
      return echanges;
    } catch (error: any) {
      console.error("❌ Error getting expiring echanges:", error);
      throw error;
    }
  },

  async searchEchanges(searchTerm: string, filters?: EchangeFilterParams): Promise<EchangeSearchResult> {
    try {
      console.log("🔍 Searching echanges for:", searchTerm);

      const endpoint = API_ENDPOINTS.ECHANGES.SEARCH;
      const response = await api.get<ApiResponse<EchangeSearchResult>>(endpoint, {
        params: { search: searchTerm, ...filters }
      });

      // Structure par défaut
      const defaultResult: EchangeSearchResult = {
        echanges: [],
        total: 0,
        page: 1,
        pages: 1,
        facets: {
          categories: [],
          types: [],
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

      console.log("✅ Found", result.echanges.length, "echanges matching search");
      return result;
    } catch (error: any) {
      console.error("❌ Error searching echanges:", error);
      throw error;
    }
  },

  async getEchangesNearby(latitude: number, longitude: number, radiusKm: number = 10): Promise<Echange[]> {
    try {
      console.log("📍 Getting echanges nearby:", { latitude, longitude, radiusKm });

      const endpoint = API_ENDPOINTS.ECHANGES.NEARBY;
      const response = await api.get<ApiResponse<Echange[]>>(endpoint, {
        params: { latitude, longitude, radius_km: radiusKm }
      });

      let echanges: Echange[] = [];
      if (Array.isArray(response.data)) {
        echanges = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        echanges = (response.data as any).data || [];
      }

      console.log("✅ Found", echanges.length, "echanges nearby");
      return echanges;
    } catch (error: any) {
      console.error("❌ Error getting nearby echanges:", error);
      throw error;
    }
  },

  async getLocationClusters(bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }): Promise<EchangeLocationCluster[]> {
    try {
      console.log("🗺️ Getting location clusters");

      const endpoint = API_ENDPOINTS.ECHANGES.CLUSTERS;
      const response = await api.get<ApiResponse<EchangeLocationCluster[]>>(endpoint, {
        params: bounds
      });

      let clusters: EchangeLocationCluster[] = [];
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

  async validateEchange(echangeData: EchangeCreateData): Promise<EchangeValidationResult> {
    try {
      console.log("✅ Validating echange data");

      const errors: string[] = [];
      const warnings: string[] = [];
      const suggestions: string[] = [];

      // Validation de base
      if (!echangeData.titre?.trim()) {
        errors.push("Le titre est obligatoire");
      } else if (echangeData.titre.length < 3) {
        errors.push("Le titre doit contenir au moins 3 caractères");
      }

      if (!echangeData.description?.trim()) {
        errors.push("La description est obligatoire");
      } else if (echangeData.description.length < 20) {
        warnings.push("La description semble trop courte");
      }

      if (!echangeData.categorie_uuid) {
        errors.push("La catégorie est obligatoire");
      }

      // Validation de l'objet à échanger
      if (!echangeData.objet_echange?.description?.trim()) {
        errors.push("La description de l'objet à échanger est obligatoire");
      }

      if (echangeData.objet_echange.valeur_estimee && echangeData.objet_echange.valeur_estimee <= 0) {
        warnings.push("La valeur estimée doit être positive");
      }

      // Validation de la recherche
      if (!echangeData.recherche?.description?.trim()) {
        errors.push("La description de ce que vous recherchez est obligatoire");
      }

      // Validation des conditions
      if (!echangeData.conditions?.delai_max) {
        warnings.push("Un délai maximum est recommandé");
      }

      // Validation des images
      if (!echangeData.images || echangeData.images.length === 0) {
        warnings.push("Aucune image fournie");
        suggestions.push("Ajoutez au moins une photo pour augmenter la visibilité");
      } else if (echangeData.images.length < 2) {
        suggestions.push("Ajoutez plus de photos pour mieux présenter votre échange");
      }

      // Validation de la localisation
      if (!echangeData.localisation && !echangeData.ville && !echangeData.echange_a_distance) {
        warnings.push("Aucune localisation spécifiée et échange à distance non indiqué");
      }

      // Équité de l'échange
      if (echangeData.objet_echange.valeur_estimee && echangeData.recherche.valeurs_acceptees) {
        const valeurObjet = echangeData.objet_echange.valeur_estimee;
        const minRecherche = echangeData.recherche.valeurs_acceptees.min || 0;
        const maxRecherche = echangeData.recherche.valeurs_acceptees.max || valeurObjet * 2;

        if (valeurObjet < minRecherche) {
          warnings.push("Votre objet semble sous-évalué par rapport à ce que vous recherchez");
        } else if (valeurObjet > maxRecherche) {
          warnings.push("Votre objet semble sur-évalué par rapport à ce que vous recherchez");
        }
      }

      // Suggestions d'amélioration
      if (!echangeData.description_courte) {
        suggestions.push("Ajoutez une description courte pour un meilleur aperçu");
      }

      if (!echangeData.tags || echangeData.tags.length === 0) {
        suggestions.push("Ajoutez des mots-clés pour améliorer la recherche");
      }

      if (!echangeData.restrictions) {
        suggestions.push("Définissez des restrictions si nécessaire pour cibler les échangeurs");
      }

      if (!echangeData.garanties) {
        suggestions.push("Définissez des garanties pour sécuriser l'échange");
      }

      const isValid = errors.length === 0;

      return {
        isValid,
        errors,
        warnings,
        suggestions,
        valeur_equitable: this.checkEquity(echangeData),
        images_manquantes: !echangeData.images || echangeData.images.length === 0,
        description_completee: (echangeData.description?.length || 0) > 50
      };
    } catch (error: any) {
      console.error("❌ Error validating echange:", error);
      throw error;
    }
  },

  private checkEquity(echangeData: EchangeCreateData): boolean {
    const valeurObjet = echangeData.objet_echange.valeur_estimee;
    const valeursRecherche = echangeData.recherche.valeurs_acceptees;

    if (!valeurObjet || !valeursRecherche) return true;

    const min = valeursRecherche.min || 0;
    const max = valeursRecherche.max || valeurObjet * 2;

    return valeurObjet >= min && valeurObjet <= max;
  },

  // ==================== Propositions ====================

  async getEchangePropositions(echangeUuid: string): Promise<EchangeProposition[]> {
    try {
      console.log("📝 Getting propositions for echange:", echangeUuid);

      const endpoint = API_ENDPOINTS.ECHANGES.PROPOSITIONS(echangeUuid);
      const response = await api.get<ApiResponse<EchangeProposition[]>>(endpoint);

      let propositions: EchangeProposition[] = [];
      if (Array.isArray(response.data)) {
        propositions = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        propositions = (response.data as any).data || [];
      }

      console.log("✅ Found", propositions.length, "propositions");
      return propositions;
    } catch (error: any) {
      console.error("❌ Error getting echange propositions:", error);
      throw error;
    }
  },

  async createProposition(echangeUuid: string, propositionData: {
    createur_uuid: string;
    createur_nom: string;
    createur_email: string;
    createur_telephone?: string;
    offre: {
      description: string;
      type: "produit" | "service" | "argent" | "mixte";
      valeur_estimee?: number;
      devise?: string;
      conditions: string[];
      disponibilite: string;
      images?: string[];
      garanties?: string[];
    };
    contrepartie_souhaitee?: {
      description: string;
      valeur_estimee?: number;
      conditions: string[];
    };
    conditions_proposees: {
      mode: "direct" | "progressive" | "avec_complement";
      complement_monetaire?: number;
      delai_propose: string;
      garanties_offertes?: string[];
    };
    message?: string;
    motivation?: string;
  }): Promise<EchangeProposition> {
    try {
      console.log("📨 Creating proposition for echange:", echangeUuid);

      const endpoint = API_ENDPOINTS.ECHANGES.CREATE_PROPOSITION(echangeUuid);
      const response = await api.post<ApiResponse<EchangeProposition>>(
        endpoint,
        propositionData
      );

      let proposition: EchangeProposition;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        proposition = (response.data as any).data;
      } else {
        proposition = response.data as EchangeProposition;
      }

      console.log("✅ Proposition created");
      return proposition;
    } catch (error: any) {
      console.error("❌ Error creating proposition:", error);
      throw error;
    }
  },

  async updatePropositionStatus(propositionUuid: string, statut: "acceptee" | "refusee" | "annulee", notes?: string): Promise<EchangeProposition> {
    try {
      console.log("🔄 Updating proposition status:", propositionUuid, "to:", statut);

      const endpoint = API_ENDPOINTS.ECHANGES.UPDATE_PROPOSITION(propositionUuid);
      const response = await api.put<ApiResponse<EchangeProposition>>(
        endpoint,
        { statut, notes }
      );

      let proposition: EchangeProposition;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        proposition = (response.data as any).data;
      } else {
        proposition = response.data as EchangeProposition;
      }

      console.log("✅ Proposition status updated");
      return proposition;
    } catch (error: any) {
      console.error("❌ Error updating proposition status:", error);
      throw error;
    }
  },

  // ==================== Reviews (Avis) ====================

  async getEchangeReviews(echangeUuid: string): Promise<EchangeReview[]> {
    try {
      console.log("⭐ Getting reviews for echange:", echangeUuid);

      const endpoint = API_ENDPOINTS.ECHANGES.REVIEWS(echangeUuid);
      const response = await api.get<ApiResponse<EchangeReview[]>>(endpoint);

      let reviews: EchangeReview[] = [];
      if (Array.isArray(response.data)) {
        reviews = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        reviews = (response.data as any).data || [];
      }

      console.log("✅ Found", reviews.length, "reviews");
      return reviews;
    } catch (error: any) {
      console.error("❌ Error getting echange reviews:", error);
      throw error;
    }
  },

  async createReview(echangeUuid: string, reviewData: {
    evaluateur_uuid: string;
    evaluateur_type: "createur" | "participant" | "tiers";
    note: number;
    commentaire: string;
    aspects?: {
      equite?: number;
      communication?: number;
      ponctualite?: number;
      qualite_objet?: number;
      respect_conditions?: number;
      facilite_echange?: number;
    };
    recommandation: boolean;
    tags?: string[];
  }): Promise<EchangeReview> {
    try {
      console.log("📝 Creating review for echange:", echangeUuid);

      const endpoint = API_ENDPOINTS.ECHANGES.CREATE_REVIEW(echangeUuid);
      const response = await api.post<ApiResponse<EchangeReview>>(
        endpoint,
        reviewData
      );

      let review: EchangeReview;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        review = (response.data as any).data;
      } else {
        review = response.data as EchangeReview;
      }

      console.log("✅ Review created");
      return review;
    } catch (error: any) {
      console.error("❌ Error creating review:", error);
      throw error;
    }
  },

  // ==================== Statistiques ====================

  async getEchangeStats(filters?: EchangeFilterParams): Promise<EchangeStats> {
    try {
      console.log("📊 Fetching echange statistics");

      const endpoint = API_ENDPOINTS.ECHANGES.STATS;
      const response = await api.get<ApiResponse<EchangeStats>>(endpoint, {
        params: filters
      });

      // Structure par défaut
      const defaultStats: EchangeStats = {
        total_echanges: 0,
        echanges_par_statut: {},
        echanges_par_type: {},
        echanges_par_mois: [],
        valeur_totale_estimee: 0,
        complement_monetaire_total: 0,
        taux_success: 0,
        top_createurs: [],
        top_categories: [],
        distribution_geographique: [],
        metrics: {
          echanges_moyens_par_createur: 0,
          valeur_moyenne_par_echange: 0,
          delai_moyen_realisation: 0,
          satisfaction_moyenne: 0,
          taux_interet_moyen: 0
        }
      };

      let stats = defaultStats;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        stats = { ...defaultStats, ...(response.data as any).data };
      } else if (response.data && typeof response.data === 'object') {
        stats = { ...defaultStats, ...response.data };
      }

      console.log("✅ Echange stats fetched");
      return stats;
    } catch (error: any) {
      console.error("❌ Error fetching echange stats:", error);
      throw error;
    }
  },

  async getCategoryStats(categoryUuid: string): Promise<EchangeCategoryStats> {
    try {
      console.log("📈 Getting category stats:", categoryUuid);

      const endpoint = API_ENDPOINTS.ECHANGES.CATEGORY_STATS(categoryUuid);
      const response = await api.get<ApiResponse<EchangeCategoryStats>>(endpoint);

      // Structure par défaut
      const defaultStats: EchangeCategoryStats = {
        categorie_uuid: categoryUuid,
        categorie_nom: "",
        total_echanges: 0,
        echanges_actifs: 0,
        valeur_totale_estimee: 0,
        taux_success: 0,
        taux_interet: 0,
        echanges_par_mois: [],
        top_createurs: []
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

  async getEchangeAnalytics(periode: { debut: string; fin: string }, filters?: EchangeFilterParams): Promise<EchangeAnalytics> {
    try {
      console.log("📈 Getting echange analytics");

      const endpoint = API_ENDPOINTS.ECHANGES.ANALYTICS;
      const response = await api.get<ApiResponse<EchangeAnalytics>>(endpoint, {
        params: { ...periode, ...filters }
      });

      // Structure par défaut
      const defaultAnalytics: EchangeAnalytics = {
        periode,
        volume: {
          total_echanges: 0,
          nouveaux_echanges: 0,
          echanges_finalises: 0,
          par_jour: []
        },
        engagement: {
          vues_moyennes: 0,
          taux_interet: 0,
          taux_proposition: 0,
          taux_conversion: 0,
          delai_moyen_traitement: 0
        },
        qualite: {
          echanges_avec_images: 0,
          echanges_detailles: 0,
          satisfaction_moyenne: 0,
          taux_revision: 0
        },
        economique: {
          valeur_totale_estimee: 0,
          complement_monetaire_total: 0,
          valeur_moyenne_echange: 0,
          taux_complement: 0
        },
        geographie: {
          top_villes: [],
          top_pays: [],
          distribution_regionale: {}
        },
        categories: {
          plus_populaires: [],
          taux_success: {},
          tendances: []
        }
      };

      let analytics = defaultAnalytics;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        analytics = { ...defaultAnalytics, ...(response.data as any).data };
      } else if (response.data && typeof response.data === 'object') {
        analytics = { ...defaultAnalytics, ...response.data };
      }

      console.log("✅ Echange analytics fetched");
      return analytics;
    } catch (error: any) {
      console.error("❌ Error getting echange analytics:", error);
      throw error;
    }
  },

  // ==================== Notifications ====================

  async getEchangeNotifications(echangeUuid: string): Promise<EchangeNotification[]> {
    try {
      console.log("🔔 Getting notifications for echange:", echangeUuid);

      const endpoint = API_ENDPOINTS.ECHANGES.NOTIFICATIONS(echangeUuid);
      const response = await api.get<ApiResponse<EchangeNotification[]>>(endpoint);

      let notifications: EchangeNotification[] = [];
      if (Array.isArray(response.data)) {
        notifications = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        notifications = (response.data as any).data || [];
      }

      console.log("✅ Found", notifications.length, "notifications");
      return notifications;
    } catch (error: any) {
      console.error("❌ Error getting echange notifications:", error);
      throw error;
    }
  },

  async sendEchangeNotification(echangeUuid: string, notificationData: {
    type: "nouvel_echange" | "validation_requise" | "proposition_recue" | "proposition_acceptee" | "proposition_refusee" | "rappel" | "expiration_proche" | "echange_finalise";
    destinataire_uuid: string;
    destinataire_type: string;
    sujet: string;
    contenu: string;
    methode?: "email" | "sms" | "push" | "in_app";
  }): Promise<EchangeNotification> {
    try {
      console.log("📨 Sending notification for echange:", echangeUuid);

      const endpoint = API_ENDPOINTS.ECHANGES.SEND_NOTIFICATION(echangeUuid);
      const response = await api.post<ApiResponse<EchangeNotification>>(
        endpoint,
        notificationData
      );

      let notification: EchangeNotification;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        notification = (response.data as any).data;
      } else {
        notification = response.data as EchangeNotification;
      }

      console.log("✅ Notification sent");
      return notification;
    } catch (error: any) {
      console.error("❌ Error sending notification:", error);
      throw error;
    }
  },

  // ==================== Matching ====================

  async getMatchSuggestions(echangeUuid: string): Promise<EchangeMatchSuggestion> {
    try {
      console.log("💡 Getting match suggestions for echange:", echangeUuid);

      const endpoint = API_ENDPOINTS.ECHANGES.MATCH_SUGGESTIONS(echangeUuid);
      const response = await api.get<ApiResponse<EchangeMatchSuggestion>>(endpoint);

      let suggestions: EchangeMatchSuggestion;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        suggestions = (response.data as any).data;
      } else {
        suggestions = response.data as EchangeMatchSuggestion;
      }

      console.log("✅ Found match suggestions");
      return suggestions;
    } catch (error: any) {
      console.error("❌ Error getting match suggestions:", error);
      throw error;
    }
  },

  // ==================== Vérification ====================

  async requestVerification(echangeUuid: string, verificationData: {
    type_verification: "qualite" | "authenticite" | "disponibilite" | "valeur" | "complet";
    notes?: string;
  }): Promise<EchangeVerificationRequest> {
    try {
      console.log("🔍 Requesting verification for echange:", echangeUuid);

      const endpoint = API_ENDPOINTS.ECHANGES.VERIFICATION_REQUESTS(echangeUuid);
      const response = await api.post<ApiResponse<EchangeVerificationRequest>>(
        endpoint,
        verificationData
      );

      let request: EchangeVerificationRequest;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        request = (response.data as any).data;
      } else {
        request = response.data as EchangeVerificationRequest;
      }

      console.log("✅ Verification request created");
      return request;
    } catch (error: any) {
      console.error("❌ Error requesting verification:", error);
      throw error;
    }
  },

  // ==================== Batch Operations ====================

  async bulkUpdateEchanges(bulkUpdate: EchangeBulkUpdate): Promise<Echange[]> {
    try {
      console.log("🔄 Bulk updating", bulkUpdate.uuids.length, "echanges");

      const endpoint = API_ENDPOINTS.ECHANGES.BULK_UPDATE;
      const response = await api.post<ApiResponse<Echange[]>>(endpoint, bulkUpdate);

      let updatedEchanges: Echange[] = [];
      if (Array.isArray(response.data)) {
        updatedEchanges = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        updatedEchanges = (response.data as any).data || [];
      }

      console.log("✅ Echanges bulk updated:", updatedEchanges.length);
      return updatedEchanges;
    } catch (error: any) {
      console.error("❌ Error bulk updating echanges:", error);
      throw error;
    }
  },

  async bulkDeleteEchanges(uuids: string[]): Promise<{ deleted: number; errors: string[] }> {
    try {
      console.log("🗑️ Bulk deleting", uuids.length, "echanges");

      const endpoint = API_ENDPOINTS.ECHANGES.BULK_DELETE;
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

      console.log("✅ Echanges bulk deleted:", result.deleted, "errors:", result.errors.length);
      return result;
    } catch (error: any) {
      console.error("❌ Error bulk deleting echanges:", error);
      throw error;
    }
  },

  async bulkPublishEchanges(uuids: string[]): Promise<Echange[]> {
    try {
      console.log("📢 Bulk publishing", uuids.length, "echanges");

      const updates: EchangeUpdateData = { statut: "publie" };
      const result = await this.bulkUpdateEchanges({ uuids, updates });

      console.log("✅ Echanges bulk published:", result.length);
      return result;
    } catch (error: any) {
      console.error("❌ Error bulk publishing echanges:", error);
      throw error;
    }
  },

  async bulkArchiveEchanges(uuids: string[]): Promise<Echange[]> {
    try {
      console.log("📁 Bulk archiving", uuids.length, "echanges");

      const updates: EchangeUpdateData = { statut: "archive" };
      const result = await this.bulkUpdateEchanges({ uuids, updates });

      console.log("✅ Echanges bulk archived:", result.length);
      return result;
    } catch (error: any) {
      console.error("❌ Error bulk archiving echanges:", error);
      throw error;
    }
  },

  // ==================== Export ====================

  async exportEchanges(options: EchangeExportOptions): Promise<Blob> {
    try {
      console.log("📤 Exporting echanges in", options.format, "format");

      const endpoint = API_ENDPOINTS.ECHANGES.EXPORT;
      const response = await api.post(
        endpoint,
        options,
        { responseType: "blob" }
      );

      console.log("✅ Echanges exported successfully");
      return response;
    } catch (error: any) {
      console.error("❌ Error exporting echanges:", error);
      throw error;
    }
  },

  // ==================== Audit ====================

  async getAuditLog(echangeUuid: string): Promise<EchangeAuditLog[]> {
    try {
      console.log("📜 Getting audit log for echange:", echangeUuid);

      const endpoint = API_ENDPOINTS.ECHANGES.AUDIT(echangeUuid);
      const response = await api.get<ApiResponse<EchangeAuditLog[]>>(endpoint);

      let auditLog: EchangeAuditLog[] = [];
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

  async getEchangeWithDetails(uuid: string): Promise<EchangeWithDetails> {
    try {
      console.log("🔍 Getting echange with details:", uuid);

      const [echange, propositions, reviews] = await Promise.all([
        this.getEchange(uuid),
        this.getEchangePropositions(uuid).catch(() => []),
        this.getEchangeReviews(uuid).catch(() => [])
      ]);

      const echangeWithDetails: EchangeWithDetails = {
        ...echange,
        propositions,
        statistiques: {
          vues_par_jour: [], // À récupérer d'une autre API si disponible
          interesses_par_mois: [], // À calculer si les données sont disponibles
          propositions_par_statut: propositions.reduce((acc, proposition) => {
            acc[proposition.statut] = (acc[proposition.statut] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          taux_conversion: propositions.length > 0
            ? (propositions.filter(p => p.statut === "acceptee").length / propositions.length) * 100
            : 0,
          delai_moyen_reponse: 0 // À calculer si les dates sont disponibles
        },
        metadata: {
          ...echange.metadata,
          reviews_count: reviews.length,
          average_rating: reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.note, 0) / reviews.length
            : undefined
        }
      };

      console.log("✅ Echange with details fetched");
      return echangeWithDetails;
    } catch (error: any) {
      console.error("❌ Error getting echange with details:", error);
      throw error;
    }
  },

  async incrementViews(echangeUuid: string): Promise<Echange> {
    try {
      console.log("👀 Incrementing views for echange:", echangeUuid);

      const endpoint = API_ENDPOINTS.ECHANGES.INCREMENT_VIEWS(echangeUuid);
      const response = await api.post<ApiResponse<Echange>>(endpoint);

      let echange: Echange;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        echange = (response.data as any).data;
      } else {
        echange = response.data as Echange;
      }

      console.log("✅ Views incremented");
      return echange;
    } catch (error: any) {
      console.error("❌ Error incrementing views:", error);
      // Ne pas échouer silencieusement pour cette opération non critique
      throw error;
    }
  },

  async getSimilarEchanges(echangeUuid: string, limit: number = 5): Promise<Echange[]> {
    try {
      console.log("🔄 Getting similar echanges for:", echangeUuid);

      const endpoint = API_ENDPOINTS.ECHANGES.SIMILAR(echangeUuid);
      const response = await api.get<ApiResponse<Echange[]>>(endpoint, {
        params: { limit }
      });

      let similarEchanges: Echange[] = [];
      if (Array.isArray(response.data)) {
        similarEchanges = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        similarEchanges = (response.data as any).data || [];
      }

      console.log("✅ Found", similarEchanges.length, "similar echanges");
      return similarEchanges;
    } catch (error: any) {
      console.error("❌ Error getting similar echanges:", error);
      throw error;
    }
  },

  async evaluateEquity(echangeUuid: string): Promise<{
    equitable: boolean;
    ratio: number;
    suggestions: string[];
    risques: string[];
  }> {
    try {
      console.log("⚖️ Evaluating equity for echange:", echangeUuid);

      const echange = await this.getEchange(echangeUuid);
      const valeurObjet = echange.objet_echange.valeur_estimee || 100;
      const valeursRecherche = echange.recherche.valeurs_acceptees;

      if (!valeursRecherche) {
        return {
          equitable: true,
          ratio: 1,
          suggestions: ["Précisez les valeurs acceptées pour améliorer l'équité"],
          risques: ["Manque de clarté sur les attentes de valeur"]
        };
      }

      const min = valeursRecherche.min || 0;
      const max = valeursRecherche.max || valeurObjet * 2;
      const ratio = valeurObjet / ((min + max) / 2);

      const equitable = ratio >= 0.8 && ratio <= 1.2;

      const suggestions: string[] = [];
      const risques: string[] = [];

      if (ratio < 0.8) {
        suggestions.push(`L'objet semble sous-évalué (ratio: ${ratio.toFixed(2)})`);
        risques.push("Risque de propositions déséquilibrées");
      } else if (ratio > 1.2) {
        suggestions.push(`L'objet semble sur-évalué (ratio: ${ratio.toFixed(2)})`);
        risques.push("Risque de difficulté à trouver un échangeur");
      }

      if (!echange.conditions.garanties_requises) {
        suggestions.push("Envisagez d'exiger des garanties pour sécuriser l'échange");
      }

      if (!echange.garanties.mediation_possible) {
        suggestions.push("Proposez une médiation en cas de conflit");
      }

      return {
        equitable,
        ratio,
        suggestions,
        risques
      };
    } catch (error: any) {
      console.error("❌ Error evaluating equity:", error);
      throw error;
    }
  },

  async createNegotiation(echangeUuid: string, propositionUuid: string, negociationData: {
    phase: "initiale" | "contre_offre" | "finalisation";
    offre_initial: any;
    contre_offre?: any;
    offre_finale?: any;
    points_discussion: string[];
    accords: string[];
  }): Promise<EchangeNegociation> {
    try {
      console.log("💬 Creating negotiation for echange:", echangeUuid);

      const endpoint = API_ENDPOINTS.ECHANGES.CREATE_NEGOCIATION(echangeUuid);
      const response = await api.post<ApiResponse<EchangeNegociation>>(
        endpoint,
        { proposition_uuid: propositionUuid, ...negociationData }
      );

      let negociation: EchangeNegociation;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        negociation = (response.data as any).data;
      } else {
        negociation = response.data as EchangeNegociation;
      }

      console.log("✅ Negotiation created");
      return negociation;
    } catch (error: any) {
      console.error("❌ Error creating negotiation:", error);
      throw error;
    }
  },

  async createTransaction(echangeUuid: string, transactionData: {
    type: "depot_garantie" | "complement" | "frais_service" | "remboursement";
    montant: number;
    devise: string;
    payeur_uuid: string;
    beneficiaire_uuid: string;
    reference_paiement?: string;
  }): Promise<EchangeTransaction> {
    try {
      console.log("💰 Creating transaction for echange:", echangeUuid);

      const endpoint = API_ENDPOINTS.ECHANGES.CREATE_TRANSACTION(echangeUuid);
      const response = await api.post<ApiResponse<EchangeTransaction>>(
        endpoint,
        transactionData
      );

      let transaction: EchangeTransaction;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        transaction = (response.data as any).data;
      } else {
        transaction = response.data as EchangeTransaction;
      }

      console.log("✅ Transaction created");
      return transaction;
    } catch (error: any) {
      console.error("❌ Error creating transaction:", error);
      throw error;
    }
  },

  // ==================== Debug ====================

  async testEchangeService(): Promise<boolean> {
    try {
      console.log("🧪 Testing echange service...");

      await this.getEchanges({ limit: 1 });

      console.log("✅ Echange service is operational");
      return true;
    } catch (error: any) {
      console.error("❌ Echange service test failed:", error.message);
      return false;
    }
  },

  async ping(): Promise<{ status: string; timestamp: string }> {
    try {
      console.log("🏓 Pinging echange service...");

      await this.getEchanges({ limit: 1 });

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
};
