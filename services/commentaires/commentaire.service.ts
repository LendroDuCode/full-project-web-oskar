// services/commentaires/commentaire.service.ts
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import type {
  Commentaire,
  CommentaireCreateData,
  CommentaireUpdateData,
  CommentaireFilterParams,
  CommentairePaginationParams,
  CommentaireStats,
  CommentaireValidationResult,
  CommentaireBulkUpdate,
  CommentaireWithDetails,
  CommentaireInteraction,
  CommentaireReport,
  CommentaireExportOptions,
  CommentaireAnalytics,
  CommentaireSuggestion,
  CommentaireModerationLog,
  CommentaireNotification,
  CommentaireSentiment,
  CommentaireTemplate,
  CommentaireImportData,
  CommentaireImportResult,
  CommentaireBadWord,
  CommentaireAutoModerationRule,
  CommentaireFeatured
} from "./commentaire.types";

export interface ApiResponse<T> {
  data: T;
  status: string;
  message?: string;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
}

export const commentaireService = {
  // ==================== CRUD Operations ====================

  async getCommentaires(params?: CommentairePaginationParams): Promise<{ commentaires: Commentaire[]; count?: number; total?: number; page?: number; pages?: number }> {
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
      if (filters.produit_uuid) queryParams.append("produit_uuid", filters.produit_uuid);
      if (filters.annonce_uuid) queryParams.append("annonce_uuid", filters.annonce_uuid);
      if (filters.boutique_uuid) queryParams.append("boutique_uuid", filters.boutique_uuid);
      if (filters.article_uuid) queryParams.append("article_uuid", filters.article_uuid);
      if (filters.page_uuid) queryParams.append("page_uuid", filters.page_uuid);
      if (filters.type_contenu) queryParams.append("type_contenu", filters.type_contenu);
      if (filters.auteur_uuid) queryParams.append("auteur_uuid", filters.auteur_uuid);
      if (filters.auteur_type) queryParams.append("auteur_type", filters.auteur_type);
      if (filters.parent_uuid) queryParams.append("parent_uuid", filters.parent_uuid);
      if (filters.statut) queryParams.append("statut", filters.statut);
      if (filters.est_public !== undefined) queryParams.append("est_public", filters.est_public.toString());
      if (filters.est_anonyme !== undefined) queryParams.append("est_anonyme", filters.est_anonyme.toString());
      if (filters.est_verifie_achat !== undefined) queryParams.append("est_verifie_achat", filters.est_verifie_achat.toString());
      if (filters.est_reponse !== undefined) queryParams.append("est_reponse", filters.est_reponse.toString());
      if (filters.note_min !== undefined) queryParams.append("note_min", filters.note_min.toString());
      if (filters.note_max !== undefined) queryParams.append("note_max", filters.note_max.toString());
      if (filters.date_debut) queryParams.append("date_debut", filters.date_debut);
      if (filters.date_fin) queryParams.append("date_fin", filters.date_fin);
      if (filters.has_note !== undefined) queryParams.append("has_note", filters.has_note.toString());
      if (filters.has_reponses !== undefined) queryParams.append("has_reponses", filters.has_reponses.toString());
      if (filters.has_rapports !== undefined) queryParams.append("has_rapports", filters.has_rapports.toString());
      if (filters.is_reported !== undefined) queryParams.append("is_reported", filters.is_reported.toString());
      if (filters.is_featured !== undefined) queryParams.append("is_featured", filters.is_featured.toString());
      if (filters.langue) queryParams.append("langue", filters.langue);
      if (filters.sort_by_recent !== undefined) queryParams.append("sort_by_recent", filters.sort_by_recent.toString());
      if (filters.sort_by_popular !== undefined) queryParams.append("sort_by_popular", filters.sort_by_popular.toString());
      if (filters.sort_by_rating !== undefined) queryParams.append("sort_by_rating", filters.sort_by_rating.toString());

      if (filters.tags && filters.tags.length > 0) {
        queryParams.append("tags", filters.tags.join(","));
      }
    }

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.COMMENTAIRES.LIST}?${queryString}`
      : API_ENDPOINTS.COMMENTAIRES.LIST;

    console.log("📡 Fetching commentaires from:", endpoint);

    try {
      const response = await api.get<ApiResponse<Commentaire[]>>(endpoint);

      console.log("✅ Commentaires response received:", {
        hasData: !!response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
      });

      let commentaires: Commentaire[] = [];
      let count = 0;
      let total = 0;
      let page = 1;
      let pages = 1;

      if (Array.isArray(response.data)) {
        commentaires = response.data;
        count = response.data.length;
      } else if (response.data && typeof response.data === 'object') {
        if ('data' in response.data && Array.isArray((response.data as any).data)) {
          commentaires = (response.data as any).data || [];
          count = (response.data as any).count || commentaires.length;
          total = (response.data as any).total || count;
          page = (response.data as any).page || 1;
          pages = (response.data as any).pages || 1;
        } else if ('commentaires' in response.data && Array.isArray((response.data as any).commentaires)) {
          commentaires = (response.data as any).commentaires || [];
          count = (response.data as any).count || commentaires.length;
          total = (response.data as any).total || count;
          page = (response.data as any).page || 1;
          pages = (response.data as any).pages || 1;
        }
      }

      return { commentaires, count, total, page, pages };
    } catch (error: any) {
      console.error("🚨 Error in commentaireService.getCommentaires:", {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  async getCommentaire(uuid: string): Promise<Commentaire> {
    try {
      console.log("🔍 Fetching commentaire:", uuid);

      const response = await api.get<ApiResponse<Commentaire>>(API_ENDPOINTS.COMMENTAIRES.DETAIL(uuid));

      console.log("✅ Commentaire response:", {
        hasData: !!response.data,
        dataType: typeof response.data,
      });

      let commentaireData: Commentaire;

      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        commentaireData = (response.data as any).data;
      } else if (response.data && (response.data as any).uuid) {
        commentaireData = response.data as Commentaire;
      } else {
        console.error("❌ Invalid commentaire data structure:", response.data);
        throw new Error("Structure de données commentaire invalide");
      }

      if (!commentaireData || !commentaireData.uuid) {
        throw new Error("Commentaire non trouvé");
      }

      console.log("✅ Commentaire found");
      return commentaireData;
    } catch (error: any) {
      console.error("❌ Error fetching commentaire:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  async createCommentaire(commentaireData: CommentaireCreateData): Promise<Commentaire> {
    try {
      console.log("🆕 Creating commentaire");

      // Valider les données avant envoi
      const validation = await this.validateCommentaire(commentaireData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const response = await api.post<ApiResponse<Commentaire>>(
        API_ENDPOINTS.COMMENTAIRES.CREATE,
        commentaireData,
      );

      console.log("✅ Commentaire creation response:", response.data);

      let createdCommentaire: Commentaire;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        createdCommentaire = (response.data as any).data;
      } else {
        createdCommentaire = response.data as Commentaire;
      }

      if (!createdCommentaire || !createdCommentaire.uuid) {
        throw new Error("Échec de la création du commentaire");
      }

      return createdCommentaire;
    } catch (error: any) {
      console.error("❌ Error creating commentaire:", {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  async updateCommentaire(uuid: string, commentaireData: CommentaireUpdateData): Promise<Commentaire> {
    try {
      console.log("✏️ Updating commentaire:", uuid);

      const response = await api.put<ApiResponse<Commentaire>>(
        API_ENDPOINTS.COMMENTAIRES.UPDATE(uuid),
        commentaireData,
      );

      console.log("✅ Commentaire update response:", response.data);

      let updatedCommentaire: Commentaire;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        updatedCommentaire = (response.data as any).data;
      } else {
        updatedCommentaire = response.data as Commentaire;
      }

      return updatedCommentaire;
    } catch (error: any) {
      console.error("❌ Error updating commentaire:", error);
      throw error;
    }
  },

  async deleteCommentaire(uuid: string): Promise<void> {
    try {
      console.log("🗑️ Deleting commentaire:", uuid);

      await api.delete(API_ENDPOINTS.COMMENTAIRES.DELETE(uuid));

      console.log("✅ Commentaire deleted successfully");
    } catch (error: any) {
      console.error("❌ Error deleting commentaire:", error);
      throw error;
    }
  },

  // ==================== Commentaires Spécialisés ====================

  async getCommentairesByProduit(produitUuid: string, params?: CommentairePaginationParams): Promise<{ commentaires: Commentaire[]; count: number }> {
    try {
      console.log("📦 Getting commentaires for product:", produitUuid);

      const response = await api.get<ApiResponse<Commentaire[]>>(
        API_ENDPOINTS.COMMENTAIRES.BY_PRODUIT(produitUuid),
        { params }
      );

      let commentaires: Commentaire[] = [];
      let count = 0;

      if (Array.isArray(response.data)) {
        commentaires = response.data;
        count = response.data.length;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        commentaires = (response.data as any).data || [];
        count = (response.data as any).count || commentaires.length;
      }

      console.log("✅ Found", commentaires.length, "commentaires for product");
      return { commentaires, count };
    } catch (error: any) {
      console.error("❌ Error getting commentaires by product:", error);
      throw error;
    }
  },

  async getUserCommentaires(userUuid: string, params?: CommentairePaginationParams): Promise<{ commentaires: Commentaire[]; count: number }> {
    try {
      console.log("👤 Getting user commentaires:", userUuid);

      const endpoint = API_ENDPOINTS.COMMENTAIRES.USER_COMMENTS;
      const queryParams = new URLSearchParams();

      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
      if (params?.sort_order) queryParams.append("sort_order", params.sort_order);

      const queryString = queryParams.toString();
      const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;

      const response = await api.get<ApiResponse<Commentaire[]>>(fullEndpoint);

      let commentaires: Commentaire[] = [];
      let count = 0;

      if (Array.isArray(response.data)) {
        commentaires = response.data;
        count = response.data.length;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        commentaires = (response.data as any).data || [];
        count = (response.data as any).count || commentaires.length;
      }

      console.log("✅ Found", commentaires.length, "user commentaires");
      return { commentaires, count };
    } catch (error: any) {
      console.error("❌ Error getting user commentaires:", error);
      throw error;
    }
  },

  async getCommentaireReplies(parentUuid: string, params?: CommentairePaginationParams): Promise<{ commentaires: Commentaire[]; count: number }> {
    try {
      console.log("💬 Getting commentaire replies:", parentUuid);

      const { commentaires, count } = await this.getCommentaires({
        ...params,
        filters: { parent_uuid: parentUuid, statut: "approuve" }
      });

      console.log("✅ Found", commentaires.length, "replies");
      return { commentaires, count: count || commentaires.length };
    } catch (error: any) {
      console.error("❌ Error getting commentaire replies:", error);
      throw error;
    }
  },

  async getFeaturedCommentaires(limit: number = 5): Promise<Commentaire[]> {
    try {
      console.log("⭐ Getting featured commentaires");

      const { commentaires } = await this.getCommentaires({
        limit,
        filters: { is_featured: true, statut: "approuve" },
        sort_by: "date_publication",
        sort_order: "desc"
      });

      console.log("✅ Found", commentaires.length, "featured commentaires");
      return commentaires;
    } catch (error: any) {
      console.error("❌ Error getting featured commentaires:", error);
      throw error;
    }
  },

  async getRecentCommentaires(limit: number = 10): Promise<Commentaire[]> {
    try {
      console.log("🕒 Getting recent commentaires");

      const { commentaires } = await this.getCommentaires({
        limit,
        filters: { statut: "approuve" },
        sort_by: "date_publication",
        sort_order: "desc"
      });

      console.log("✅ Found", commentaires.length, "recent commentaires");
      return commentaires;
    } catch (error: any) {
      console.error("❌ Error getting recent commentaires:", error);
      throw error;
    }
  },

  async getTopRatedCommentaires(limit: number = 10): Promise<Commentaire[]> {
    try {
      console.log("🏆 Getting top rated commentaires");

      const { commentaires } = await this.getCommentaires({
        limit,
        filters: { statut: "approuve", has_note: true },
        sort_by: "note",
        sort_order: "desc"
      });

      console.log("✅ Found", commentaires.length, "top rated commentaires");
      return commentaires;
    } catch (error: any) {
      console.error("❌ Error getting top rated commentaires:", error);
      throw error;
    }
  },

  // ==================== Validation ====================

  async validateCommentaire(commentaireData: CommentaireCreateData): Promise<CommentaireValidationResult> {
    try {
      console.log("✅ Validating commentaire data");

      const errors: string[] = [];
      const warnings: string[] = [];
      const suggestions: string[] = [];

      // Validation de base
      if (!commentaireData.type_contenu) {
        errors.push("Le type de contenu est obligatoire");
      }

      if (!commentaireData.contenu || commentaireData.contenu.trim().length === 0) {
        errors.push("Le contenu du commentaire est obligatoire");
      } else if (commentaireData.contenu.length < 3) {
        errors.push("Le commentaire doit contenir au moins 3 caractères");
      } else if (commentaireData.contenu.length > 5000) {
        warnings.push("Le commentaire est très long, envisagez de le raccourcir");
      }

      // Validation des références
      switch (commentaireData.type_contenu) {
        case "produit":
          if (!commentaireData.produit_uuid) {
            errors.push("La référence au produit est obligatoire pour un commentaire sur un produit");
          }
          break;
        case "boutique":
          if (!commentaireData.boutique_uuid) {
            errors.push("La référence à la boutique est obligatoire pour un commentaire sur une boutique");
          }
          break;
        case "annonce":
          if (!commentaireData.annonce_uuid) {
            errors.push("La référence à l'annonce est obligatoire pour un commentaire sur une annonce");
          }
          break;
      }

      // Validation de la note si présente
      if (commentaireData.note !== undefined) {
        if (commentaireData.note < 1 || commentaireData.note > 5) {
          errors.push("La note doit être comprise entre 1 et 5");
        }

        // Si c'est un commentaire produit avec note mais sans contenu
        if (commentaireData.type_contenu === "produit" && commentaireData.note && !commentaireData.contenu.trim()) {
          warnings.push("Ajoutez un commentaire pour expliquer votre note");
        }
      }

      // Validation de l'auteur
      if (!commentaireData.auteur_uuid && !commentaireData.auteur_nom) {
        errors.push("L'auteur doit être identifié (soit par UUID, soit par nom)");
      }

      if (commentaireData.auteur_email && !this.validateEmail(commentaireData.auteur_email)) {
        warnings.push("L'adresse email de l'auteur semble invalide");
      }

      // Vérification des mots interdits
      const badWords = await this.checkForBadWords(commentaireData.contenu);
      if (badWords.length > 0) {
        warnings.push(`Le commentaire contient des mots potentiellement inappropriés: ${badWords.join(', ')}`);
      }

      // Analyse du sentiment
      const sentiment = await this.analyzeSentiment(commentaireData.contenu);
      if (sentiment.score_negatif > 0.7) {
        warnings.push("Le commentaire semble très négatif, il pourrait être modéré");
      }

      // Suggestions
      if (commentaireData.type_contenu === "produit" && commentaireData.note === undefined) {
        suggestions.push("Ajoutez une note pour mieux évaluer le produit");
      }

      if (!commentaireData.avantages && commentaireData.type_contenu === "produit") {
        suggestions.push("Indiquez les avantages du produit pour aider les autres acheteurs");
      }

      if (commentaireData.contenu.length < 50) {
        suggestions.push("Développez votre commentaire pour qu'il soit plus utile");
      }

      const isValid = errors.length === 0;

      return {
        isValid,
        errors,
        warnings,
        suggestions,
        contains_bad_words: badWords.length > 0,
        sentiment_score: sentiment.score_positif - sentiment.score_negatif,
        estimated_reading_time: Math.ceil(commentaireData.contenu.length / 200) // ~200 mots/minute
      };
    } catch (error: any) {
      console.error("❌ Error validating commentaire:", error);
      throw error;
    }
  },

  private validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  private async checkForBadWords(contenu: string): Promise<string[]> {
    try {
      // Appel à l'API de vérification des mots interdits
      const response = await api.post<ApiResponse<string[]>>("/commentaires/check-bad-words", {
        texte: contenu
      });

      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return (response.data as any).data || [];
      }
      return [];
    } catch {
      return [];
    }
  },

  private async analyzeSentiment(contenu: string): Promise<{
    score_positif: number;
    score_negatif: number;
    score_neutre: number;
  }> {
    try {
      // Appel à l'API d'analyse de sentiment
      const response = await api.post<ApiResponse<{
        score_positif: number;
        score_negatif: number;
        score_neutre: number;
      }>>("/commentaires/analyze-sentiment", {
        texte: contenu
      });

      if (response.data && typeof response.data === 'object') {
        if ('data' in response.data) {
          return (response.data as any).data;
        }
        return response.data as any;
      }

      return {
        score_positif: 0.5,
        score_negatif: 0.2,
        score_neutre: 0.3
      };
    } catch {
      return {
        score_positif: 0.5,
        score_negatif: 0.2,
        score_neutre: 0.3
      };
    }
  },

  // ==================== Interactions ====================

  async likeCommentaire(uuid: string): Promise<Commentaire> {
    try {
      console.log("👍 Liking commentaire:", uuid);

      const endpoint = `/commentaires/${uuid}/like`;
      const response = await api.post<ApiResponse<Commentaire>>(endpoint, {});

      let updatedCommentaire: Commentaire;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        updatedCommentaire = (response.data as any).data;
      } else {
        updatedCommentaire = response.data as Commentaire;
      }

      console.log("✅ Commentaire liked");
      return updatedCommentaire;
    } catch (error: any) {
      console.error("❌ Error liking commentaire:", error);
      throw error;
    }
  },

  async dislikeCommentaire(uuid: string): Promise<Commentaire> {
    try {
      console.log("👎 Disliking commentaire:", uuid);

      const endpoint = `/commentaires/${uuid}/dislike`;
      const response = await api.post<ApiResponse<Commentaire>>(endpoint, {});

      let updatedCommentaire: Commentaire;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        updatedCommentaire = (response.data as any).data;
      } else {
        updatedCommentaire = response.data as Commentaire;
      }

      console.log("✅ Commentaire disliked");
      return updatedCommentaire;
    } catch (error: any) {
      console.error("❌ Error disliking commentaire:", error);
      throw error;
    }
  },

  async reportCommentaire(uuid: string, raison: string, description?: string): Promise<CommentaireReport> {
    try {
      console.log("🚨 Reporting commentaire:", uuid, "raison:", raison);

      const response = await api.post<ApiResponse<CommentaireReport>>(
        API_ENDPOINTS.COMMENTAIRES.REPORT(uuid),
        { raison, description }
      );

      let report: CommentaireReport;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        report = (response.data as any).data;
      } else {
        report = response.data as CommentaireReport;
      }

      console.log("✅ Commentaire reported");
      return report;
    } catch (error: any) {
      console.error("❌ Error reporting commentaire:", error);
      throw error;
    }
  },

  async getCommentaireInteractions(uuid: string): Promise<CommentaireInteraction[]> {
    try {
      console.log("🔍 Getting commentaire interactions:", uuid);

      const endpoint = `/commentaires/${uuid}/interactions`;
      const response = await api.get<ApiResponse<CommentaireInteraction[]>>(endpoint);

      let interactions: CommentaireInteraction[] = [];
      if (Array.isArray(response.data)) {
        interactions = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        interactions = (response.data as any).data || [];
      }

      console.log("✅ Found", interactions.length, "interactions");
      return interactions;
    } catch (error: any) {
      console.error("❌ Error getting commentaire interactions:", error);
      throw error;
    }
  },

  // ==================== Modération ====================

  async getReportedCommentaires(params?: CommentairePaginationParams): Promise<{ commentaires: Commentaire[]; count: number }> {
    try {
      console.log("🚨 Getting reported commentaires");

      const endpoint = API_ENDPOINTS.COMMENTAIRES.REPORTED_LIST;
      const queryParams = new URLSearchParams();

      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());

      const queryString = queryParams.toString();
      const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;

      const response = await api.get<ApiResponse<Commentaire[]>>(fullEndpoint);

      let commentaires: Commentaire[] = [];
      let count = 0;

      if (Array.isArray(response.data)) {
        commentaires = response.data;
        count = response.data.length;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        commentaires = (response.data as any).data || [];
        count = (response.data as any).count || commentaires.length;
      }

      console.log("✅ Found", commentaires.length, "reported commentaires");
      return { commentaires, count };
    } catch (error: any) {
      console.error("❌ Error getting reported commentaires:", error);
      throw error;
    }
  },

  async approveCommentaire(uuid: string): Promise<Commentaire> {
    try {
      console.log("✅ Approving commentaire:", uuid);

      const updates: CommentaireUpdateData = {
        statut: "approuve",
        est_public: true
      };

      return await this.updateCommentaire(uuid, updates);
    } catch (error: any) {
      console.error("❌ Error approving commentaire:", error);
      throw error;
    }
  },

  async rejectCommentaire(uuid: string, raison?: string): Promise<Commentaire> {
    try {
      console.log("❌ Rejecting commentaire:", uuid, "raison:", raison);

      const updates: CommentaireUpdateData = {
        statut: "rejete",
        est_public: false
      };

      const commentaire = await this.updateCommentaire(uuid, updates);

      // Enregistrer la raison de rejet
      if (raison) {
        await this.logModeration(uuid, "rejet", raison);
      }

      return commentaire;
    } catch (error: any) {
      console.error("❌ Error rejecting commentaire:", error);
      throw error;
    }
  },

  async hideCommentaire(uuid: string): Promise<Commentaire> {
    try {
      console.log("👁️ Hiding commentaire:", uuid);

      const response = await api.post<ApiResponse<Commentaire>>(
        API_ENDPOINTS.COMMENTAIRES.DEACTIVATE(uuid),
        {}
      );

      let hiddenCommentaire: Commentaire;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        hiddenCommentaire = (response.data as any).data;
      } else {
        hiddenCommentaire = response.data as Commentaire;
      }

      console.log("✅ Commentaire hidden");
      return hiddenCommentaire;
    } catch (error: any) {
      console.error("❌ Error hiding commentaire:", error);
      throw error;
    }
  },

  async featureCommentaire(uuid: string, raison: string, ordre?: number): Promise<CommentaireFeatured> {
    try {
      console.log("⭐ Featuring commentaire:", uuid, "raison:", raison);

      const endpoint = "/commentaires/feature";
      const response = await api.post<ApiResponse<CommentaireFeatured>>(
        endpoint,
        { commentaire_uuid: uuid, raison, ordre }
      );

      let featured: CommentaireFeatured;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        featured = (response.data as any).data;
      } else {
        featured = response.data as CommentaireFeatured;
      }

      console.log("✅ Commentaire featured");
      return featured;
    } catch (error: any) {
      console.error("❌ Error featuring commentaire:", error);
      throw error;
    }
  },

  private async logModeration(commentaireUuid: string, action: string, raison?: string): Promise<void> {
    try {
      const logData = {
        commentaire_uuid: commentaireUuid,
        action,
        raison
      };

      await api.post("/commentaires/moderation-log", logData);
    } catch (error) {
      console.error("❌ Error logging moderation:", error);
    }
  },

  // ==================== Statistiques ====================

  async getCommentaireStats(filters?: CommentaireFilterParams): Promise<CommentaireStats> {
    try {
      console.log("📊 Fetching commentaire statistics");

      const endpoint = "/commentaires/stats";
      const response = await api.get<ApiResponse<CommentaireStats>>(endpoint, {
        params: filters
      });

      // Structure par défaut
      const defaultStats: CommentaireStats = {
        total_commentaires: 0,
        commentaires_par_statut: {},
        commentaires_par_type: {},
        commentaires_par_mois: [],
        moyennes_notes: {},
        interactions: {
          total_likes: 0,
          total_dislikes: 0,
          total_rapports: 0,
          total_reponses: 0
        },
        top_auteurs: [],
        top_produits_comments: [],
        metrics: {
          taux_reponse: 0,
          delai_reponse_moyen: 0,
          satisfaction_moyenne: 0,
          taux_signalement: 0
        }
      };

      let stats = defaultStats;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        stats = { ...defaultStats, ...(response.data as any).data };
      } else if (response.data && typeof response.data === 'object') {
        stats = { ...defaultStats, ...response.data };
      }

      console.log("✅ Commentaire stats fetched");
      return stats;
    } catch (error: any) {
      console.error("❌ Error fetching commentaire stats:", error);
      throw error;
    }
  },

  async getCommentaireAnalytics(periode: { debut: string; fin: string }, filters?: CommentaireFilterParams): Promise<CommentaireAnalytics> {
    try {
      console.log("📈 Getting commentaire analytics");

      const endpoint = "/commentaires/analytics";
      const response = await api.get<ApiResponse<CommentaireAnalytics>>(endpoint, {
        params: { ...periode, ...filters }
      });

      // Structure par défaut
      const defaultAnalytics: CommentaireAnalytics = {
        periode,
        volume: {
          total: 0,
          par_jour: [],
          par_type: {}
        },
        engagement: {
          taux_reponse: 0,
          likes_par_commentaire: 0,
          partage_moyen: 0,
          temps_lecture_moyen: 0
        },
        qualite: {
          note_moyenne: 0,
          longueur_moyenne: 0,
          taux_signalement: 0,
          satisfaction_moyenne: 0
        },
        tendances: {
          mots_cles_populaires: [],
          heures_actives: [],
          meilleurs_auteurs: []
        }
      };

      let analytics = defaultAnalytics;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        analytics = { ...defaultAnalytics, ...(response.data as any).data };
      } else if (response.data && typeof response.data === 'object') {
        analytics = { ...defaultAnalytics, ...response.data };
      }

      console.log("✅ Commentaire analytics fetched");
      return analytics;
    } catch (error: any) {
      console.error("❌ Error getting commentaire analytics:", error);
      throw error;
    }
  },

  async getProductRatingStats(produitUuid: string): Promise<{
    note_moyenne: number;
    distribution: Record<number, number>; // Note -> Nombre de commentaires
    total_commentaires: number;
    total_notes: number;
    pourcentage_avec_note: number;
    derniers_commentaires: Commentaire[];
  }> {
    try {
      console.log("⭐ Getting product rating stats:", produitUuid);

      const endpoint = `/commentaires/produits/${produitUuid}/rating-stats`;
      const response = await api.get<ApiResponse<any>>(endpoint);

      let stats: any;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        stats = (response.data as any).data;
      } else {
        stats = response.data;
      }

      console.log("✅ Product rating stats fetched");
      return stats;
    } catch (error: any) {
      console.error("❌ Error getting product rating stats:", error);
      throw error;
    }
  },

  // ==================== Batch Operations ====================

  async bulkUpdateCommentaires(bulkUpdate: CommentaireBulkUpdate): Promise<Commentaire[]> {
    try {
      console.log("🔄 Bulk updating", bulkUpdate.uuids.length, "commentaires");

      const endpoint = "/commentaires/bulk-update";
      const response = await api.post<ApiResponse<Commentaire[]>>(endpoint, bulkUpdate);

      let updatedCommentaires: Commentaire[] = [];
      if (Array.isArray(response.data)) {
        updatedCommentaires = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        updatedCommentaires = (response.data as any).data || [];
      }

      console.log("✅ Commentaires bulk updated:", updatedCommentaires.length);
      return updatedCommentaires;
    } catch (error: any) {
      console.error("❌ Error bulk updating commentaires:", error);
      throw error;
    }
  },

  async bulkDeleteCommentaires(uuids: string[]): Promise<{ deleted: number; errors: string[] }> {
    try {
      console.log("🗑️ Bulk deleting", uuids.length, "commentaires");

      const endpoint = "/commentaires/bulk-delete";
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

      console.log("✅ Commentaires bulk deleted:", result.deleted, "errors:", result.errors.length);
      return result;
    } catch (error: any) {
      console.error("❌ Error bulk deleting commentaires:", error);
      throw error;
    }
  },

  async bulkApproveCommentaires(uuids: string[]): Promise<Commentaire[]> {
    try {
      console.log("✅ Bulk approving", uuids.length, "commentaires");

      const updates: CommentaireUpdateData = {
        statut: "approuve",
        est_public: true
      };

      const result = await this.bulkUpdateCommentaires({ uuids, updates });
      console.log("✅ Commentaires bulk approved:", result.length);
      return result;
    } catch (error: any) {
      console.error("❌ Error bulk approving commentaires:", error);
      throw error;
    }
  },

  async bulkRejectCommentaires(uuids: string[], raison?: string): Promise<Commentaire[]> {
    try {
      console.log("❌ Bulk rejecting", uuids.length, "commentaires");

      const updates: CommentaireUpdateData = {
        statut: "rejete",
        est_public: false
      };

      const result = await this.bulkUpdateCommentaires({ uuids, updates });

      // Enregistrer les raisons de rejet
      if (raison) {
        for (const uuid of uuids) {
          await this.logModeration(uuid, "rejet", raison);
        }
      }

      console.log("✅ Commentaires bulk rejected:", result.length);
      return result;
    } catch (error: any) {
      console.error("❌ Error bulk rejecting commentaires:", error);
      throw error;
    }
  },

  // ==================== Export ====================

  async exportCommentaires(options: CommentaireExportOptions): Promise<Blob> {
    try {
      console.log("📤 Exporting commentaires in", options.format, "format");

      const endpoint = "/commentaires/export";
      const response = await api.post(
        endpoint,
        options,
        { responseType: "blob" }
      );

      console.log("✅ Commentaires exported successfully");
      return response;
    } catch (error: any) {
      console.error("❌ Error exporting commentaires:", error);
      throw error;
    }
  },

  // ==================== Suggestions ====================

  async getCommentaireSuggestions(uuid: string): Promise<CommentaireSuggestion[]> {
    try {
      console.log("💡 Getting suggestions for commentaire:", uuid);

      const endpoint = `/commentaires/${uuid}/suggestions`;
      const response = await api.get<ApiResponse<CommentaireSuggestion[]>>(endpoint);

      let suggestions: CommentaireSuggestion[] = [];
      if (Array.isArray(response.data)) {
        suggestions = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        suggestions = (response.data as any).data || [];
      }

      console.log("✅ Found", suggestions.length, "suggestions");
      return suggestions;
    } catch (error: any) {
      console.error("❌ Error getting commentaire suggestions:", error);
      throw error;
    }
  },

  async getReplySuggestions(parentUuid: string): Promise<string[]> {
    try {
      console.log("💭 Getting reply suggestions for commentaire:", parentUuid);

      const endpoint = `/commentaires/${parentUuid}/reply-suggestions`;
      const response = await api.get<ApiResponse<string[]>>(endpoint);

      let suggestions: string[] = [];
      if (Array.isArray(response.data)) {
        suggestions = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        suggestions = (response.data as any).data || [];
      }

      console.log("✅ Found", suggestions.length, "reply suggestions");
      return suggestions;
    } catch (error: any) {
      console.error("❌ Error getting reply suggestions:", error);
      throw error;
    }
  },

  // ==================== Modération Automatique ====================

  async getBadWords(): Promise<CommentaireBadWord[]> {
    try {
      console.log("🚫 Getting bad words list");

      const endpoint = "/commentaires/bad-words";
      const response = await api.get<ApiResponse<CommentaireBadWord[]>>(endpoint);

      let badWords: CommentaireBadWord[] = [];
      if (Array.isArray(response.data)) {
        badWords = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        badWords = (response.data as any).data || [];
      }

      console.log("✅ Found", badWords.length, "bad words");
      return badWords;
    } catch (error: any) {
      console.error("❌ Error getting bad words:", error);
      throw error;
    }
  },

  async getAutoModerationRules(): Promise<CommentaireAutoModerationRule[]> {
    try {
      console.log("🤖 Getting auto moderation rules");

      const endpoint = "/commentaires/auto-moderation-rules";
      const response = await api.get<ApiResponse<CommentaireAutoModerationRule[]>>(endpoint);

      let rules: CommentaireAutoModerationRule[] = [];
      if (Array.isArray(response.data)) {
        rules = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        rules = (response.data as any).data || [];
      }

      console.log("✅ Found", rules.length, "auto moderation rules");
      return rules;
    } catch (error: any) {
      console.error("❌ Error getting auto moderation rules:", error);
      throw error;
    }
  },

  async addBadWord(badWordData: Omit<CommentaireBadWord, 'uuid' | 'created_at' | 'updated_at'>): Promise<CommentaireBadWord> {
    try {
      console.log("➕ Adding bad word:", badWordData.mot);

      const endpoint = "/commentaires/bad-words";
      const response = await api.post<ApiResponse<CommentaireBadWord>>(endpoint, badWordData);

      let badWord: CommentaireBadWord;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        badWord = (response.data as any).data;
      } else {
        badWord = response.data as CommentaireBadWord;
      }

      console.log("✅ Bad word added");
      return badWord;
    } catch (error: any) {
      console.error("❌ Error adding bad word:", error);
      throw error;
    }
  },

  // ==================== Templates ====================

  async getTemplates(): Promise<CommentaireTemplate[]> {
    try {
      console.log("📋 Getting commentaire templates");

      const endpoint = "/commentaires/templates";
      const response = await api.get<ApiResponse<CommentaireTemplate[]>>(endpoint);

      let templates: CommentaireTemplate[] = [];
      if (Array.isArray(response.data)) {
        templates = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        templates = (response.data as any).data || [];
      }

      console.log("✅ Found", templates.length, "templates");
      return templates;
    } catch (error: any) {
      console.error("❌ Error getting templates:", error);
      throw error;
    }
  },

  async useTemplate(uuid: string, variables?: Record<string, string>): Promise<string> {
    try {
      console.log("📝 Using template:", uuid);

      const endpoint = `/commentaires/templates/${uuid}/use`;
      const response = await api.post<ApiResponse<{ contenu: string }>>(
        endpoint,
        { variables }
      );

      let result: { contenu: string };
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        result = (response.data as any).data;
      } else {
        result = response.data as { contenu: string };
      }

      console.log("✅ Template used");
      return result.contenu;
    } catch (error: any) {
      console.error("❌ Error using template:", error);
      throw error;
    }
  },

  // ==================== Import ====================

  async importCommentaires(data: CommentaireImportData[], options?: {
    onConflict: "skip" | "update" | "merge";
    validate: boolean;
  }): Promise<CommentaireImportResult> {
    try {
      console.log("📥 Importing", data.length, "commentaires");

      const endpoint = "/commentaires/import";
      const response = await api.post<ApiResponse<CommentaireImportResult>>(endpoint, {
        data,
        options: options || { onConflict: "skip", validate: true }
      });

      let result: CommentaireImportResult;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        result = (response.data as any).data;
      } else {
        result = response.data as CommentaireImportResult;
      }

      console.log("✅ Commentaires import completed:", result);
      return result;
    } catch (error: any) {
      console.error("❌ Error importing commentaires:", error);
      throw error;
    }
  },

  // ==================== Sentiment Analysis ====================

  async getCommentaireSentiment(uuid: string): Promise<CommentaireSentiment> {
    try {
      console.log("😊 Getting commentaire sentiment:", uuid);

      const endpoint = `/commentaires/${uuid}/sentiment`;
      const response = await api.get<ApiResponse<CommentaireSentiment>>(endpoint);

      let sentiment: CommentaireSentiment;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        sentiment = (response.data as any).data;
      } else {
        sentiment = response.data as CommentaireSentiment;
      }

      console.log("✅ Commentaire sentiment fetched");
      return sentiment;
    } catch (error: any) {
      console.error("❌ Error getting commentaire sentiment:", error);
      throw error;
    }
  },

  async analyzeCommentairesSentiment(commentaireUuids: string[]): Promise<CommentaireSentiment[]> {
    try {
      console.log("🔍 Analyzing sentiment for", commentaireUuids.length, "commentaires");

      const endpoint = "/commentaires/analyze-sentiment-batch";
      const response = await api.post<ApiResponse<CommentaireSentiment[]>>(
        endpoint,
        { commentaire_uuids: commentaireUuids }
      );

      let sentiments: CommentaireSentiment[] = [];
      if (Array.isArray(response.data)) {
        sentiments = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        sentiments = (response.data as any).data || [];
      }

      console.log("✅ Sentiment analysis completed for", sentiments.length, "commentaires");
      return sentiments;
    } catch (error: any) {
      console.error("❌ Error analyzing commentaires sentiment:", error);
      throw error;
    }
  },

  // ==================== Notifications ====================

  async getCommentaireNotifications(uuid: string): Promise<CommentaireNotification[]> {
    try {
      console.log("🔔 Getting commentaire notifications:", uuid);

      const endpoint = `/commentaires/${uuid}/notifications`;
      const response = await api.get<ApiResponse<CommentaireNotification[]>>(endpoint);

      let notifications: CommentaireNotification[] = [];
      if (Array.isArray(response.data)) {
        notifications = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        notifications = (response.data as any).data || [];
      }

      console.log("✅ Found", notifications.length, "notifications");
      return notifications;
    } catch (error: any) {
      console.error("❌ Error getting commentaire notifications:", error);
      throw error;
    }
  },

  async markNotificationAsRead(notificationUuid: string): Promise<CommentaireNotification> {
    try {
      console.log("📖 Marking notification as read:", notificationUuid);

      const endpoint = `/commentaires/notifications/${notificationUuid}/read`;
      const response = await api.put<ApiResponse<CommentaireNotification>>(endpoint, {});

      let notification: CommentaireNotification;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        notification = (response.data as any).data;
      } else {
        notification = response.data as CommentaireNotification;
      }

      console.log("✅ Notification marked as read");
      return notification;
    } catch (error: any) {
      console.error("❌ Error marking notification as read:", error);
      throw error;
    }
  },

  // ==================== Utilitaires ====================

  async getCommentaireWithDetails(uuid: string): Promise<CommentaireWithDetails> {
    try {
      console.log("🔍 Getting commentaire with details:", uuid);

      const [commentaire, reponses, sentiment] = await Promise.all([
        this.getCommentaire(uuid),
        this.getCommentaireReplies(uuid),
        this.getCommentaireSentiment(uuid).catch(() => null)
      ]);

      const commentaireWithDetails: CommentaireWithDetails = {
        ...commentaire,
        reponses: reponses.commentaires,
        metadata: {
          ...commentaire.metadata,
          sentiment: sentiment
        }
      };

      console.log("✅ Commentaire with details fetched");
      return commentaireWithDetails;
    } catch (error: any) {
      console.error("❌ Error getting commentaire with details:", error);
      throw error;
    }
  },

  async searchCommentaires(searchTerm: string, filters?: CommentaireFilterParams): Promise<{ commentaires: Commentaire[]; count: number }> {
    try {
      console.log("🔍 Searching commentaires for:", searchTerm);

      const { commentaires, count } = await this.getCommentaires({
        search: searchTerm,
        filters
      });

      console.log("✅ Found", commentaires.length, "commentaires matching search");
      return { commentaires, count: count || commentaires.length };
    } catch (error: any) {
      console.error("❌ Error searching commentaires:", error);
      throw error;
    }
  },

  async getCommentairesByAuteur(auteurUuid: string, params?: CommentairePaginationParams): Promise<{ commentaires: Commentaire[]; count: number }> {
    try {
      console.log("👤 Getting commentaires by auteur:", auteurUuid);

      const { commentaires, count } = await this.getCommentaires({
        ...params,
        filters: { auteur_uuid: auteurUuid }
      });

      console.log("✅ Found", commentaires.length, "commentaires by auteur");
      return { commentaires, count: count || commentaires.length };
    } catch (error: any) {
      console.error("❌ Error getting commentaires by auteur:", error);
      throw error;
    }
  },

  async calculateAverageRating(produitUuid: string): Promise<{
    moyenne: number;
    total_notes: number;
    distribution: Record<number, number>;
  }> {
    try {
      console.log("📊 Calculating average rating for product:", produitUuid);

      const stats = await this.getProductRatingStats(produitUuid);

      return {
        moyenne: stats.note_moyenne,
        total_notes: stats.total_notes,
        distribution: stats.distribution
      };
    } catch (error: any) {
      console.error("❌ Error calculating average rating:", error);
      throw error;
    }
  },

  // ==================== Debug ====================

  async testCommentaireService(): Promise<boolean> {
    try {
      console.log("🧪 Testing commentaire service...");

      await this.getCommentaires({ limit: 1 });

      console.log("✅ Commentaire service is operational");
      return true;
    } catch (error: any) {
      console.error("❌ Commentaire service test failed:", error.message);
      return false;
    }
  },

  async ping(): Promise<{ status: string; timestamp: string }> {
    try {
      console.log("🏓 Pinging commentaire service...");

      await this.getCommentaires({ limit: 1 });

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
