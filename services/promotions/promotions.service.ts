// services/promotions/promotions.service.ts
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import type {
  Promotion,
  PromotionCreateData,
  PromotionUpdateData,
  PromotionType,
  PromotionScope,
  PromotionStatus,
  ApplicationPromotionData,
  ApplicationPromotionResult,
  ValidationPromotionResult,
  HistoriqueUtilisationPromotion,
  PromotionStats,
  PromotionAnalyticsReport,
  PlanificationPromotion,
  CampagnePromotionnelle,
  SegmentUtilisateursPromotion,
  ReglePrioritePromotion,
  NotificationPromotion,
  ExportPromotionsOptions,
  ImportPromotionsData,
  RegleGenerationCodes,
  ImpactPromotionVentes,
} from "./promotions.types";

/**
 * Réponse générique de l'API
 */
export interface ApiResponse<T> {
  data: T;
  status: string;
  message?: string;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
}

/**
 * Service complet pour la gestion des promotions
 */
export const promotionsService = {
  // ==================== CRUD Promotions ====================

  /**
   * Récupère la liste des promotions avec filtres
   */
  async getPromotions(params?: {
    page?: number;
    limit?: number;
    search?: string;
    statut?: PromotionStatus;
    type?: PromotionType;
    portee?: PromotionScope;
    date_debut?: string;
    date_fin?: string;
    actives_only?: boolean;
  }): Promise<{
    promotions: Promotion[];
    total: number;
    page: number;
    pages: number;
  }> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.statut) queryParams.append("statut", params.statut);
    if (params?.type) queryParams.append("type", params.type);
    if (params?.portee) queryParams.append("portee", params.portee);
    if (params?.date_debut) queryParams.append("date_debut", params.date_debut);
    if (params?.date_fin) queryParams.append("date_fin", params.date_fin);
    if (params?.actives_only) queryParams.append("actives_only", "true");

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.PROMOTIONS.LIST}?${queryString}`
      : API_ENDPOINTS.PROMOTIONS.LIST;

    console.log("🏷️ Fetching promotions:", endpoint);

    try {
      const response = await api.get<ApiResponse<Promotion[]>>(endpoint);

      let promotions: Promotion[] = [];
      let total = 0;
      let page = 1;
      let pages = 1;

      if (Array.isArray(response.data)) {
        promotions = response.data;
        total = response.total || promotions.length;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        promotions = (response.data as any).data || [];
        total = (response.data as any).total || promotions.length;
        page = (response.data as any).page || 1;
        pages = (response.data as any).pages || 1;
      }

      console.log(`✅ Found ${promotions.length} promotions`);
      return { promotions, total, page, pages };
    } catch (error: any) {
      console.error("🚨 Error getting promotions:", error);
      throw error;
    }
  },

  /**
   * Récupère une promotion par son UUID
   */
  async getPromotion(uuid: string): Promise<Promotion> {
    try {
      console.log("🔍 Fetching promotion:", uuid);

      const response = await api.get<ApiResponse<Promotion>>(
        API_ENDPOINTS.PROMOTIONS.DETAIL(uuid),
      );

      let promotion: Promotion;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        promotion = (response.data as any).data;
      } else {
        promotion = response.data as Promotion;
      }

      if (!promotion || !promotion.uuid) {
        throw new Error("Promotion non trouvée");
      }

      console.log("✅ Promotion found:", promotion.nom);
      return promotion;
    } catch (error: any) {
      console.error("❌ Error fetching promotion:", error);
      throw error;
    }
  },

  /**
   * Récupère une promotion par son code
   */
  async getPromotionByCode(code: string): Promise<Promotion> {
    try {
      console.log("🔍 Fetching promotion by code:", code);

      const response = await api.get<ApiResponse<Promotion>>(
        `${API_ENDPOINTS.PROMOTIONS.BY_CODE}/${code}`,
      );

      let promotion: Promotion;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        promotion = (response.data as any).data;
      } else {
        promotion = response.data as Promotion;
      }

      if (!promotion) {
        throw new Error("Code promotionnel invalide");
      }

      console.log("✅ Promotion found by code");
      return promotion;
    } catch (error: any) {
      console.error("❌ Error fetching promotion by code:", error);
      throw error;
    }
  },

  /**
   * Crée une nouvelle promotion
   */
  async createPromotion(
    promotionData: PromotionCreateData,
  ): Promise<Promotion> {
    try {
      console.log("🆕 Creating promotion:", promotionData.nom);

      const response = await api.post<ApiResponse<Promotion>>(
        API_ENDPOINTS.PROMOTIONS.CREATE,
        promotionData,
      );

      console.log("✅ Promotion creation response:", response.data);

      let createdPromotion: Promotion;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        createdPromotion = (response.data as any).data;
      } else {
        createdPromotion = response.data as Promotion;
      }

      if (!createdPromotion || !createdPromotion.uuid) {
        throw new Error("Échec de la création de la promotion");
      }

      return createdPromotion;
    } catch (error: any) {
      console.error("❌ Error creating promotion:", {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  /**
   * Met à jour une promotion existante
   */
  async updatePromotion(
    uuid: string,
    promotionData: PromotionUpdateData,
  ): Promise<Promotion> {
    try {
      console.log("✏️ Updating promotion:", uuid);

      const response = await api.put<ApiResponse<Promotion>>(
        API_ENDPOINTS.PROMOTIONS.UPDATE(uuid),
        promotionData,
      );

      console.log("✅ Promotion update response:", response.data);

      let updatedPromotion: Promotion;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        updatedPromotion = (response.data as any).data;
      } else {
        updatedPromotion = response.data as Promotion;
      }

      return updatedPromotion;
    } catch (error: any) {
      console.error("❌ Error updating promotion:", error);
      throw error;
    }
  },

  /**
   * Supprime une promotion
   */
  async deletePromotion(uuid: string): Promise<{ message: string }> {
    try {
      console.log("🗑️ Deleting promotion:", uuid);

      const response = await api.delete<ApiResponse<{ message: string }>>(
        API_ENDPOINTS.PROMOTIONS.DELETE(uuid),
      );

      console.log("✅ Promotion deleted successfully");
      return response.data as { message: string };
    } catch (error: any) {
      console.error("❌ Error deleting promotion:", error);
      throw error;
    }
  },

  /**
   * Active/désactive une promotion
   */
  async togglePromotion(uuid: string, active: boolean): Promise<Promotion> {
    try {
      console.log("🔄 Toggling promotion:", uuid, "active:", active);

      const response = await api.put<ApiResponse<Promotion>>(
        API_ENDPOINTS.PROMOTIONS.TOGGLE(uuid),
        { active },
      );

      let promotion: Promotion;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        promotion = (response.data as any).data;
      } else {
        promotion = response.data as Promotion;
      }

      console.log("✅ Promotion toggled");
      return promotion;
    } catch (error: any) {
      console.error("❌ Error toggling promotion:", error);
      throw error;
    }
  },

  // ==================== Application des Promotions ====================

  /**
   * Applique une promotion à un panier/commande
   */
  async applyPromotion(
    applicationData: ApplicationPromotionData,
  ): Promise<ApplicationPromotionResult> {
    try {
      console.log("🎯 Applying promotion:", applicationData.code_promotion);

      const response = await api.post<ApiResponse<ApplicationPromotionResult>>(
        API_ENDPOINTS.PROMOTIONS.APPLY,
        applicationData,
      );

      console.log("✅ Promotion application result:", response.data);
      return response.data as ApplicationPromotionResult;
    } catch (error: any) {
      console.error("❌ Error applying promotion:", error);
      throw error;
    }
  },

  /**
   * Valide une promotion pour un panier/commande
   */
  async validatePromotion(
    code: string,
    montantTotal: number,
    utilisateurUuid?: string,
  ): Promise<ValidationPromotionResult> {
    try {
      console.log("✅ Validating promotion:", code);

      const params = new URLSearchParams();
      params.append("code", code);
      params.append("montant_total", montantTotal.toString());
      if (utilisateurUuid) params.append("utilisateur_uuid", utilisateurUuid);

      const response = await api.get<ApiResponse<ValidationPromotionResult>>(
        `${API_ENDPOINTS.PROMOTIONS.VALIDATE}?${params.toString()}`,
      );

      return response.data as ValidationPromotionResult;
    } catch (error: any) {
      console.error("❌ Error validating promotion:", error);
      throw error;
    }
  },

  /**
   * Récupère les promotions applicables pour un utilisateur/produit
   */
  async getPromotionsApplicables(params: {
    utilisateur_uuid?: string;
    produit_uuid?: string;
    categorie_uuid?: string;
    montant_panier?: number;
    limit?: number;
  }): Promise<Promotion[]> {
    try {
      console.log("🎯 Getting applicable promotions:", params);

      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await api.get<ApiResponse<Promotion[]>>(
        `${API_ENDPOINTS.PROMOTIONS.APPLICABLES}?${queryParams.toString()}`,
      );

      let promotions: Promotion[] = [];
      if (Array.isArray(response.data)) {
        promotions = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        promotions = (response.data as any).data || [];
      }

      console.log(`✅ Found ${promotions.length} applicable promotions`);
      return promotions;
    } catch (error: any) {
      console.error("❌ Error getting applicable promotions:", error);
      throw error;
    }
  },

  // ==================== Statistiques et Analytics ====================

  /**
   * Récupère les statistiques des promotions
   */
  async getPromotionsStats(): Promise<PromotionStats> {
    try {
      console.log("📊 Fetching promotion statistics");

      const response = await api.get<ApiResponse<PromotionStats>>(
        API_ENDPOINTS.PROMOTIONS.STATS,
      );

      let stats: PromotionStats;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        stats = (response.data as any).data;
      } else {
        stats = response.data as PromotionStats;
      }

      console.log("✅ Statistics loaded");
      return stats;
    } catch (error: any) {
      console.error("❌ Error getting promotion statistics:", error);
      throw error;
    }
  },

  /**
   * Récupère le rapport d'analytics d'une promotion
   */
  async getPromotionAnalytics(
    uuid: string,
    periode?: { debut: string; fin: string },
  ): Promise<PromotionAnalyticsReport> {
    try {
      console.log("📈 Getting promotion analytics:", uuid);

      const endpoint = periode
        ? `${API_ENDPOINTS.PROMOTIONS.ANALYTICS(uuid)}?debut=${periode.debut}&fin=${periode.fin}`
        : API_ENDPOINTS.PROMOTIONS.ANALYTICS(uuid);

      const response =
        await api.get<ApiResponse<PromotionAnalyticsReport>>(endpoint);

      return response.data as PromotionAnalyticsReport;
    } catch (error: any) {
      console.error("❌ Error getting promotion analytics:", error);
      throw error;
    }
  },

  /**
   * Récupère l'historique d'utilisation d'une promotion
   */
  async getHistoriqueUtilisation(
    uuid: string,
    page?: number,
    limit?: number,
  ): Promise<{
    historique: HistoriqueUtilisationPromotion[];
    total: number;
    page: number;
    pages: number;
  }> {
    try {
      console.log("📜 Getting promotion usage history:", uuid);

      const queryParams = new URLSearchParams();
      if (page) queryParams.append("page", page.toString());
      if (limit) queryParams.append("limit", limit.toString());

      const endpoint = queryParams.toString()
        ? `${API_ENDPOINTS.PROMOTIONS.HISTORIQUE(uuid)}?${queryParams.toString()}`
        : API_ENDPOINTS.PROMOTIONS.HISTORIQUE(uuid);

      const response =
        await api.get<ApiResponse<HistoriqueUtilisationPromotion[]>>(endpoint);

      let historique: HistoriqueUtilisationPromotion[] = [];
      let total = 0;
      let pageNum = 1;
      let pages = 1;

      if (Array.isArray(response.data)) {
        historique = response.data;
        total = historique.length;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        historique = (response.data as any).data || [];
        total = (response.data as any).total || historique.length;
        pageNum = (response.data as any).page || 1;
        pages = (response.data as any).pages || 1;
      }

      console.log(`✅ Found ${historique.length} usage records`);
      return { historique, total, page: pageNum, pages };
    } catch (error: any) {
      console.error("❌ Error getting usage history:", error);
      throw error;
    }
  },

  // ==================== Gestion des Campagnes ====================

  /**
   * Récupère les campagnes promotionnelles
   */
  async getCampagnesPromotionnelles(params?: {
    page?: number;
    limit?: number;
    statut?: string;
  }): Promise<{ campagnes: CampagnePromotionnelle[]; total: number }> {
    try {
      console.log("📢 Fetching promotion campaigns");

      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.statut) queryParams.append("statut", params.statut);

      const endpoint = queryParams.toString()
        ? `${API_ENDPOINTS.PROMOTIONS.CAMPAGNES}?${queryParams.toString()}`
        : API_ENDPOINTS.PROMOTIONS.CAMPAGNES;

      const response =
        await api.get<ApiResponse<CampagnePromotionnelle[]>>(endpoint);

      let campagnes: CampagnePromotionnelle[] = [];
      let total = 0;

      if (Array.isArray(response.data)) {
        campagnes = response.data;
        total = campagnes.length;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        campagnes = (response.data as any).data || [];
        total = (response.data as any).total || campagnes.length;
      }

      console.log(`✅ Found ${campagnes.length} campaigns`);
      return { campagnes, total };
    } catch (error: any) {
      console.error("❌ Error getting campaigns:", error);
      throw error;
    }
  },

  /**
   * Crée une nouvelle campagne promotionnelle
   */
  async createCampagne(
    campagneData: Partial<CampagnePromotionnelle>,
  ): Promise<CampagnePromotionnelle> {
    try {
      console.log("🆕 Creating promotion campaign:", campagneData.nom);

      const response = await api.post<ApiResponse<CampagnePromotionnelle>>(
        API_ENDPOINTS.PROMOTIONS.CAMPAGNES_CREATE,
        campagneData,
      );

      console.log("✅ Campaign creation response:", response.data);
      return response.data as CampagnePromotionnelle;
    } catch (error: any) {
      console.error("❌ Error creating campaign:", error);
      throw error;
    }
  },

  // ==================== Gestion des Segments ====================

  /**
   * Récupère les segments d'utilisateurs
   */
  async getSegmentsUtilisateurs(): Promise<SegmentUtilisateursPromotion[]> {
    try {
      console.log("👥 Fetching user segments");

      const response = await api.get<
        ApiResponse<SegmentUtilisateursPromotion[]>
      >(API_ENDPOINTS.PROMOTIONS.SEGMENTS);

      let segments: SegmentUtilisateursPromotion[] = [];
      if (Array.isArray(response.data)) {
        segments = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        segments = (response.data as any).data || [];
      }

      console.log(`✅ Found ${segments.length} segments`);
      return segments;
    } catch (error: any) {
      console.error("❌ Error getting segments:", error);
      throw error;
    }
  },

  /**
   * Crée un nouveau segment d'utilisateurs
   */
  async createSegment(
    segmentData: Partial<SegmentUtilisateursPromotion>,
  ): Promise<SegmentUtilisateursPromotion> {
    try {
      console.log("🆕 Creating user segment:", segmentData.nom);

      const response = await api.post<
        ApiResponse<SegmentUtilisateursPromotion>
      >(API_ENDPOINTS.PROMOTIONS.SEGMENTS_CREATE, segmentData);

      console.log("✅ Segment creation response:", response.data);
      return response.data as SegmentUtilisateursPromotion;
    } catch (error: any) {
      console.error("❌ Error creating segment:", error);
      throw error;
    }
  },

  // ==================== Import/Export ====================

  /**
   * Exporte les promotions
   */
  async exportPromotions(options: ExportPromotionsOptions): Promise<Blob> {
    try {
      console.log("📤 Exporting promotions in format:", options.format);

      const response = await api.post<Blob>(
        API_ENDPOINTS.PROMOTIONS.EXPORT,
        options,
        {
          responseType: "blob",
        },
      );

      console.log("✅ Export completed");
      return response.data;
    } catch (error: any) {
      console.error("❌ Error exporting promotions:", error);
      throw error;
    }
  },

  /**
   * Importe des promotions
   */
  async importPromotions(importData: ImportPromotionsData): Promise<{
    success: boolean;
    imported: number;
    errors: any[];
  }> {
    try {
      console.log("📥 Importing promotions");

      const formData = new FormData();
      formData.append("format", importData.format);
      formData.append("data", JSON.stringify(importData.data));
      formData.append("options", JSON.stringify(importData.options || {}));

      const response = await api.post<ApiResponse<any>>(
        API_ENDPOINTS.PROMOTIONS.IMPORT,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      console.log("✅ Import completed:", response.data);
      return {
        success: true,
        imported: (response.data as any).imported || 0,
        errors: (response.data as any).errors || [],
      };
    } catch (error: any) {
      console.error("❌ Error importing promotions:", error);
      throw error;
    }
  },

  // ==================== Génération de Codes ====================

  /**
   * Génère des codes promotionnels
   */
  async genererCodesPromotionnels(
    regleGeneration: Partial<RegleGenerationCodes>,
  ): Promise<RegleGenerationCodes> {
    try {
      console.log("🎟️ Generating promotion codes");

      const response = await api.post<ApiResponse<RegleGenerationCodes>>(
        API_ENDPOINTS.PROMOTIONS.GENERER_CODES,
        regleGeneration,
      );

      console.log("✅ Codes generation response:", response.data);
      return response.data as RegleGenerationCodes;
    } catch (error: any) {
      console.error("❌ Error generating codes:", error);
      throw error;
    }
  },

  /**
   * Vérifie la disponibilité d'un code
   */
  async verifierDisponibiliteCode(
    code: string,
  ): Promise<{ disponible: boolean; message?: string }> {
    try {
      console.log("🔍 Checking code availability:", code);

      const response = await api.get<
        ApiResponse<{ disponible: boolean; message?: string }>
      >(`${API_ENDPOINTS.PROMOTIONS.VERIFIER_CODE}/${code}`);

      return response.data as { disponible: boolean; message?: string };
    } catch (error: any) {
      console.error("❌ Error checking code availability:", error);
      throw error;
    }
  },

  // ==================== Notifications ====================

  /**
   * Envoie une notification de promotion
   */
  async envoyerNotificationPromotion(
    notificationData: Partial<NotificationPromotion>,
  ): Promise<NotificationPromotion> {
    try {
      console.log("📧 Sending promotion notification");

      const response = await api.post<ApiResponse<NotificationPromotion>>(
        API_ENDPOINTS.PROMOTIONS.NOTIFICATIONS,
        notificationData,
      );

      console.log("✅ Notification sent");
      return response.data as NotificationPromotion;
    } catch (error: any) {
      console.error("❌ Error sending notification:", error);
      throw error;
    }
  },

  /**
   * Récupère les notifications d'un utilisateur
   */
  async getNotificationsUtilisateur(
    utilisateurUuid: string,
  ): Promise<NotificationPromotion[]> {
    try {
      console.log("📨 Getting user notifications:", utilisateurUuid);

      const response = await api.get<ApiResponse<NotificationPromotion[]>>(
        `${API_ENDPOINTS.PROMOTIONS.NOTIFICATIONS_UTILISATEUR}/${utilisateurUuid}`,
      );

      let notifications: NotificationPromotion[] = [];
      if (Array.isArray(response.data)) {
        notifications = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        notifications = (response.data as any).data || [];
      }

      console.log(`✅ Found ${notifications.length} notifications`);
      return notifications;
    } catch (error: any) {
      console.error("❌ Error getting notifications:", error);
      throw error;
    }
  },

  // ==================== Utilitaires ====================

  /**
   * Met à jour les statuts des promotions (cron job)
   */
  async updateStatutsPromotions(): Promise<{ updated: number }> {
    try {
      console.log("🔄 Updating promotion statuses");

      const response = await api.post<ApiResponse<{ updated: number }>>(
        API_ENDPOINTS.PROMOTIONS.UPDATE_STATUSES,
        {},
      );

      console.log(
        `✅ Updated ${(response.data as any).updated} promotion statuses`,
      );
      return { updated: (response.data as any).updated || 0 };
    } catch (error: any) {
      console.error("❌ Error updating promotion statuses:", error);
      throw error;
    }
  },

  /**
   * Calcule l'impact d'une promotion sur les ventes
   */
  async getImpactPromotionVentes(uuid: string): Promise<ImpactPromotionVentes> {
    try {
      console.log("📊 Getting promotion sales impact:", uuid);

      const response = await api.get<ApiResponse<ImpactPromotionVentes>>(
        API_ENDPOINTS.PROMOTIONS.IMPACT(uuid),
      );

      return response.data as ImpactPromotionVentes;
    } catch (error: any) {
      console.error("❌ Error getting promotion impact:", error);
      throw error;
    }
  },

  /**
   * Récupère les promotions expirant bientôt
   */
  async getPromotionsExpirantBientot(jours: number = 7): Promise<Promotion[]> {
    try {
      console.log("⏰ Getting promotions expiring soon");

      const response = await api.get<ApiResponse<Promotion[]>>(
        `${API_ENDPOINTS.PROMOTIONS.EXPIRANT}?jours=${jours}`,
      );

      let promotions: Promotion[] = [];
      if (Array.isArray(response.data)) {
        promotions = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        promotions = (response.data as any).data || [];
      }

      console.log(`✅ Found ${promotions.length} promotions expiring soon`);
      return promotions;
    } catch (error: any) {
      console.error("❌ Error getting expiring promotions:", error);
      throw error;
    }
  },

  /**
   * Récupère les promotions les plus populaires
   */
  async getPromotionsPopulaires(limit: number = 10): Promise<Promotion[]> {
    try {
      console.log("🔥 Getting popular promotions");

      const response = await api.get<ApiResponse<Promotion[]>>(
        `${API_ENDPOINTS.PROMOTIONS.POPULAIRES}?limit=${limit}`,
      );

      let promotions: Promotion[] = [];
      if (Array.isArray(response.data)) {
        promotions = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        promotions = (response.data as any).data || [];
      }

      console.log(`✅ Found ${promotions.length} popular promotions`);
      return promotions;
    } catch (error: any) {
      console.error("❌ Error getting popular promotions:", error);
      throw error;
    }
  },

  /**
   * Duplique une promotion existante
   */
  async dupliquerPromotion(
    uuid: string,
    nouveauNom?: string,
  ): Promise<Promotion> {
    try {
      console.log("📋 Duplicating promotion:", uuid);

      const response = await api.post<ApiResponse<Promotion>>(
        API_ENDPOINTS.PROMOTIONS.DUPLIQUER(uuid),
        { nouveau_nom: nouveauNom },
      );

      console.log("✅ Promotion duplicated");
      return response.data as Promotion;
    } catch (error: any) {
      console.error("❌ Error duplicating promotion:", error);
      throw error;
    }
  },

  /**
   * Archive les promotions expirées
   */
  async archiverPromotionsExpirees(): Promise<{ archived: number }> {
    try {
      console.log("🗄️ Archiving expired promotions");

      const response = await api.post<ApiResponse<{ archived: number }>>(
        API_ENDPOINTS.PROMOTIONS.ARCHIVER_EXPIREES,
        {},
      );

      console.log(`✅ Archived ${(response.data as any).archived} promotions`);
      return { archived: (response.data as any).archived || 0 };
    } catch (error: any) {
      console.error("❌ Error archiving promotions:", error);
      throw error;
    }
  },

  // ==================== Recherche et Filtrage ====================

  /**
   * Recherche avancée de promotions
   */
  async searchPromotionsAvance(params: {
    query?: string;
    types?: PromotionType[];
    portees?: PromotionScope[];
    statuts?: PromotionStatus[];
    date_debut_min?: string;
    date_fin_max?: string;
    montant_min?: number;
    montant_max?: number;
    utilisations_min?: number;
    utilisations_max?: number;
    tags?: string[];
    page?: number;
    limit?: number;
  }): Promise<{ promotions: Promotion[]; total: number; facets: any }> {
    try {
      console.log("🔍 Advanced promotion search:", params);

      const response = await api.post<
        ApiResponse<{
          promotions: Promotion[];
          total: number;
          facets: any;
        }>
      >(API_ENDPOINTS.PROMOTIONS.SEARCH_AVANCE, params);

      return response.data as {
        promotions: Promotion[];
        total: number;
        facets: any;
      };
    } catch (error: any) {
      console.error("❌ Error in advanced search:", error);
      throw error;
    }
  },
};
