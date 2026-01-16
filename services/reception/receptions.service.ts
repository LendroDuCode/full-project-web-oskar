// services/receptions/receptions.service.ts
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import type {
  Reception,
  ReceptionCreateData,
  ReceptionUpdateData,
  ReceptionType,
  ReceptionStatus,
  ArticleReception,
  RecevoirArticlesData,
  VerifierArticlesData,
  ControleQualiteData,
  ReceptionFilterParams,
  ReceptionStats,
  ReceptionReport,
  ReceptionAlert,
  FournisseurReception,
  EntrepotReception,
  EmplacementEntrepot,
  TransfertReception,
  ImportReceptionsData,
  ExportReceptionsOptions,
  PlanificationReception,
  WorkflowReception,
} from "./receptions.types";

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
 * Service complet pour la gestion des réceptions
 */
export const receptionsService = {
  // ==================== CRUD Réceptions ====================

  /**
   * Récupère la liste des réceptions avec filtres
   */
  async getReceptions(params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: ReceptionType;
    statut?: ReceptionStatus;
    entrepot_uuid?: string;
    fournisseur_uuid?: string;
    date_debut?: string;
    date_fin?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
  }): Promise<{
    receptions: Reception[];
    total: number;
    page: number;
    pages: number;
  }> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.type) queryParams.append("type", params.type);
    if (params?.statut) queryParams.append("statut", params.statut);
    if (params?.entrepot_uuid)
      queryParams.append("entrepot_uuid", params.entrepot_uuid);
    if (params?.fournisseur_uuid)
      queryParams.append("fournisseur_uuid", params.fournisseur_uuid);
    if (params?.date_debut) queryParams.append("date_debut", params.date_debut);
    if (params?.date_fin) queryParams.append("date_fin", params.date_fin);
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.RECEPTIONS.LIST}?${queryString}`
      : API_ENDPOINTS.RECEPTIONS.LIST;

    console.log("📦 Fetching receptions:", endpoint);

    try {
      const response = await api.get<ApiResponse<Reception[]>>(endpoint);

      let receptions: Reception[] = [];
      let total = 0;
      let page = 1;
      let pages = 1;

      if (Array.isArray(response.data)) {
        receptions = response.data;
        total = response.total || receptions.length;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        receptions = (response.data as any).data || [];
        total = (response.data as any).total || receptions.length;
        page = (response.data as any).page || 1;
        pages = (response.data as any).pages || 1;
      }

      console.log(`✅ Found ${receptions.length} receptions`);
      return { receptions, total, page, pages };
    } catch (error: any) {
      console.error("🚨 Error getting receptions:", error);
      throw error;
    }
  },

  /**
   * Récupère une réception par son UUID
   */
  async getReception(uuid: string): Promise<Reception> {
    try {
      console.log("🔍 Fetching reception:", uuid);

      const response = await api.get<ApiResponse<Reception>>(
        API_ENDPOINTS.RECEPTIONS.DETAIL(uuid),
      );

      let reception: Reception;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        reception = (response.data as any).data;
      } else {
        reception = response.data as Reception;
      }

      if (!reception || !reception.uuid) {
        throw new Error("Réception non trouvée");
      }

      console.log("✅ Reception found:", reception.numero_reception);
      return reception;
    } catch (error: any) {
      console.error("❌ Error fetching reception:", error);
      throw error;
    }
  },

  /**
   * Crée une nouvelle réception
   */
  async createReception(
    receptionData: ReceptionCreateData,
  ): Promise<Reception> {
    try {
      console.log("🆕 Creating reception");

      const response = await api.post<ApiResponse<Reception>>(
        API_ENDPOINTS.RECEPTIONS.CREATE,
        receptionData,
      );

      console.log("✅ Reception creation response:", response.data);

      let createdReception: Reception;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        createdReception = (response.data as any).data;
      } else {
        createdReception = response.data as Reception;
      }

      if (!createdReception || !createdReception.uuid) {
        throw new Error("Échec de la création de la réception");
      }

      return createdReception;
    } catch (error: any) {
      console.error("❌ Error creating reception:", {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  /**
   * Met à jour une réception existante
   */
  async updateReception(
    uuid: string,
    receptionData: ReceptionUpdateData,
  ): Promise<Reception> {
    try {
      console.log("✏️ Updating reception:", uuid);

      const response = await api.put<ApiResponse<Reception>>(
        API_ENDPOINTS.RECEPTIONS.UPDATE(uuid),
        receptionData,
      );

      console.log("✅ Reception update response:", response.data);

      let updatedReception: Reception;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        updatedReception = (response.data as any).data;
      } else {
        updatedReception = response.data as Reception;
      }

      return updatedReception;
    } catch (error: any) {
      console.error("❌ Error updating reception:", error);
      throw error;
    }
  },

  /**
   * Supprime une réception
   */
  async deleteReception(uuid: string): Promise<{ message: string }> {
    try {
      console.log("🗑️ Deleting reception:", uuid);

      const response = await api.delete<ApiResponse<{ message: string }>>(
        API_ENDPOINTS.RECEPTIONS.DELETE(uuid),
      );

      console.log("✅ Reception deleted successfully");
      return response.data as { message: string };
    } catch (error: any) {
      console.error("❌ Error deleting reception:", error);
      throw error;
    }
  },

  /**
   * Annule une réception
   */
  async cancelReception(uuid: string, raison?: string): Promise<Reception> {
    try {
      console.log("❌ Cancelling reception:", uuid);

      const response = await api.put<ApiResponse<Reception>>(
        API_ENDPOINTS.RECEPTIONS.CANCEL(uuid),
        { raison },
      );

      let reception: Reception;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        reception = (response.data as any).data;
      } else {
        reception = response.data as Reception;
      }

      console.log("✅ Reception cancelled");
      return reception;
    } catch (error: any) {
      console.error("❌ Error cancelling reception:", error);
      throw error;
    }
  },

  /**
   * Clôture une réception
   */
  async closeReception(uuid: string): Promise<Reception> {
    try {
      console.log("🔒 Closing reception:", uuid);

      const response = await api.put<ApiResponse<Reception>>(
        API_ENDPOINTS.RECEPTIONS.CLOSE(uuid),
        {},
      );

      let reception: Reception;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        reception = (response.data as any).data;
      } else {
        reception = response.data as Reception;
      }

      console.log("✅ Reception closed");
      return reception;
    } catch (error: any) {
      console.error("❌ Error closing reception:", error);
      throw error;
    }
  },

  // ==================== Opérations sur les Articles ====================

  /**
   * Ajoute des articles à une réception
   */
  async addArticlesToReception(
    uuid: string,
    articles: Array<{
      article_uuid: string;
      quantite_commandee: number;
      prix_unitaire_ht?: number;
      condition?: string;
    }>,
  ): Promise<Reception> {
    try {
      console.log("➕ Adding articles to reception:", uuid);

      const response = await api.post<ApiResponse<Reception>>(
        API_ENDPOINTS.RECEPTIONS.ADD_ARTICLES(uuid),
        { articles },
      );

      let reception: Reception;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        reception = (response.data as any).data;
      } else {
        reception = response.data as Reception;
      }

      console.log(`✅ Added ${articles.length} articles`);
      return reception;
    } catch (error: any) {
      console.error("❌ Error adding articles:", error);
      throw error;
    }
  },

  /**
   * Reçoit des articles (physiquement)
   */
  async receiveArticles(receiveData: RecevoirArticlesData): Promise<Reception> {
    try {
      console.log(
        "📥 Receiving articles for reception:",
        receiveData.reception_uuid,
      );

      const response = await api.post<ApiResponse<Reception>>(
        API_ENDPOINTS.RECEPTIONS.RECEIVE_ARTICLES,
        receiveData,
      );

      console.log("✅ Articles received");
      return response.data as Reception;
    } catch (error: any) {
      console.error("❌ Error receiving articles:", error);
      throw error;
    }
  },

  /**
   * Vérifie des articles (contrôle quantité/qualité)
   */
  async verifyArticles(verifyData: VerifierArticlesData): Promise<Reception> {
    try {
      console.log(
        "✅ Verifying articles for reception:",
        verifyData.reception_uuid,
      );

      const response = await api.post<ApiResponse<Reception>>(
        API_ENDPOINTS.RECEPTIONS.VERIFY_ARTICLES,
        verifyData,
      );

      console.log("✅ Articles verified");
      return response.data as Reception;
    } catch (error: any) {
      console.error("❌ Error verifying articles:", error);
      throw error;
    }
  },

  /**
   * Effectue le contrôle qualité
   */
  async performQualityControl(
    controlData: ControleQualiteData,
  ): Promise<Reception> {
    try {
      console.log(
        "🔬 Performing quality control for reception:",
        controlData.reception_uuid,
      );

      const response = await api.post<ApiResponse<Reception>>(
        API_ENDPOINTS.RECEPTIONS.QUALITY_CONTROL,
        controlData,
      );

      console.log("✅ Quality control performed");
      return response.data as Reception;
    } catch (error: any) {
      console.error("❌ Error performing quality control:", error);
      throw error;
    }
  },

  /**
   * Met à jour un article spécifique
   */
  async updateArticleReception(
    articleUuid: string,
    updates: Partial<ArticleReception>,
  ): Promise<ArticleReception> {
    try {
      console.log("✏️ Updating reception article:", articleUuid);

      const response = await api.put<ApiResponse<ArticleReception>>(
        API_ENDPOINTS.RECEPTIONS.UPDATE_ARTICLE(articleUuid),
        updates,
      );

      let article: ArticleReception;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        article = (response.data as any).data;
      } else {
        article = response.data as ArticleReception;
      }

      console.log("✅ Article updated");
      return article;
    } catch (error: any) {
      console.error("❌ Error updating article:", error);
      throw error;
    }
  },

  // ==================== Statistiques et Rapports ====================

  /**
   * Récupère les statistiques des réceptions
   */
  async getReceptionsStats(params?: {
    periode_debut?: string;
    periode_fin?: string;
    entrepot_uuid?: string;
    fournisseur_uuid?: string;
  }): Promise<ReceptionStats> {
    try {
      console.log("📊 Fetching reception statistics");

      const queryParams = new URLSearchParams();
      if (params?.periode_debut)
        queryParams.append("periode_debut", params.periode_debut);
      if (params?.periode_fin)
        queryParams.append("periode_fin", params.periode_fin);
      if (params?.entrepot_uuid)
        queryParams.append("entrepot_uuid", params.entrepot_uuid);
      if (params?.fournisseur_uuid)
        queryParams.append("fournisseur_uuid", params.fournisseur_uuid);

      const endpoint = queryParams.toString()
        ? `${API_ENDPOINTS.RECEPTIONS.STATS}?${queryParams.toString()}`
        : API_ENDPOINTS.RECEPTIONS.STATS;

      const response = await api.get<ApiResponse<ReceptionStats>>(endpoint);

      let stats: ReceptionStats;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        stats = (response.data as any).data;
      } else {
        stats = response.data as ReceptionStats;
      }

      console.log("✅ Statistics loaded");
      return stats;
    } catch (error: any) {
      console.error("❌ Error getting reception statistics:", error);
      throw error;
    }
  },

  /**
   * Génère un rapport de réception
   */
  async generateReceptionReport(params: {
    reception_uuid?: string;
    periode_debut?: string;
    periode_fin?: string;
    type?: ReceptionType;
    format?: "pdf" | "excel" | "html";
  }): Promise<ReceptionReport | Blob> {
    try {
      console.log("📄 Generating reception report");

      const response = await api.post<ApiResponse<ReceptionReport> | Blob>(
        API_ENDPOINTS.RECEPTIONS.GENERATE_REPORT,
        params,
        params.format ? { responseType: "blob" } : {},
      );

      console.log("✅ Report generated");
      return response.data;
    } catch (error: any) {
      console.error("❌ Error generating report:", error);
      throw error;
    }
  },

  // ==================== Gestion des Alertes ====================

  /**
   * Récupère les alertes de réception
   */
  async getReceptionAlerts(params?: {
    statut?: string;
    priorite?: string;
    type?: string;
    assignee_uuid?: string;
  }): Promise<ReceptionAlert[]> {
    try {
      console.log("🚨 Fetching reception alerts");

      const queryParams = new URLSearchParams();
      if (params?.statut) queryParams.append("statut", params.statut);
      if (params?.priorite) queryParams.append("priorite", params.priorite);
      if (params?.type) queryParams.append("type", params.type);
      if (params?.assignee_uuid)
        queryParams.append("assignee_uuid", params.assignee_uuid);

      const endpoint = queryParams.toString()
        ? `${API_ENDPOINTS.RECEPTIONS.ALERTS}?${queryParams.toString()}`
        : API_ENDPOINTS.RECEPTIONS.ALERTS;

      const response = await api.get<ApiResponse<ReceptionAlert[]>>(endpoint);

      let alerts: ReceptionAlert[] = [];
      if (Array.isArray(response.data)) {
        alerts = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        alerts = (response.data as any).data || [];
      }

      console.log(`✅ Found ${alerts.length} alerts`);
      return alerts;
    } catch (error: any) {
      console.error("❌ Error getting alerts:", error);
      throw error;
    }
  },

  /**
   * Crée une nouvelle alerte
   */
  async createAlert(
    alertData: Partial<ReceptionAlert>,
  ): Promise<ReceptionAlert> {
    try {
      console.log("🚨 Creating reception alert");

      const response = await api.post<ApiResponse<ReceptionAlert>>(
        API_ENDPOINTS.RECEPTIONS.CREATE_ALERT,
        alertData,
      );

      console.log("✅ Alert created");
      return response.data as ReceptionAlert;
    } catch (error: any) {
      console.error("❌ Error creating alert:", error);
      throw error;
    }
  },

  /**
   * Met à jour le statut d'une alerte
   */
  async updateAlertStatus(
    uuid: string,
    statut: string,
    notes?: string,
  ): Promise<ReceptionAlert> {
    try {
      console.log("✏️ Updating alert status:", uuid);

      const response = await api.put<ApiResponse<ReceptionAlert>>(
        API_ENDPOINTS.RECEPTIONS.UPDATE_ALERT(uuid),
        { statut, notes },
      );

      let alert: ReceptionAlert;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        alert = (response.data as any).data;
      } else {
        alert = response.data as ReceptionAlert;
      }

      console.log("✅ Alert status updated");
      return alert;
    } catch (error: any) {
      console.error("❌ Error updating alert:", error);
      throw error;
    }
  },

  // ==================== Gestion des Fournisseurs ====================

  /**
   * Récupère la liste des fournisseurs
   */
  async getFournisseurs(params?: {
    search?: string;
    statut?: string;
    page?: number;
    limit?: number;
  }): Promise<{ fournisseurs: FournisseurReception[]; total: number }> {
    try {
      console.log("🏢 Fetching suppliers");

      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append("search", params.search);
      if (params?.statut) queryParams.append("statut", params.statut);
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());

      const endpoint = queryParams.toString()
        ? `${API_ENDPOINTS.RECEPTIONS.FOURNISSEURS}?${queryParams.toString()}`
        : API_ENDPOINTS.RECEPTIONS.FOURNISSEURS;

      const response =
        await api.get<ApiResponse<FournisseurReception[]>>(endpoint);

      let fournisseurs: FournisseurReception[] = [];
      let total = 0;

      if (Array.isArray(response.data)) {
        fournisseurs = response.data;
        total = fournisseurs.length;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        fournisseurs = (response.data as any).data || [];
        total = (response.data as any).total || fournisseurs.length;
      }

      console.log(`✅ Found ${fournisseurs.length} suppliers`);
      return { fournisseurs, total };
    } catch (error: any) {
      console.error("❌ Error getting suppliers:", error);
      throw error;
    }
  },

  /**
   * Récupère un fournisseur par UUID
   */
  async getFournisseur(uuid: string): Promise<FournisseurReception> {
    try {
      console.log("🔍 Fetching supplier:", uuid);

      const response = await api.get<ApiResponse<FournisseurReception>>(
        API_ENDPOINTS.RECEPTIONS.FOURNISSEUR(uuid),
      );

      let fournisseur: FournisseurReception;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        fournisseur = (response.data as any).data;
      } else {
        fournisseur = response.data as FournisseurReception;
      }

      console.log("✅ Supplier found");
      return fournisseur;
    } catch (error: any) {
      console.error("❌ Error getting supplier:", error);
      throw error;
    }
  },

  // ==================== Gestion des Entrepôts ====================

  /**
   * Récupère la liste des entrepôts
   */
  async getEntrepots(): Promise<EntrepotReception[]> {
    try {
      console.log("🏭 Fetching warehouses");

      const response = await api.get<ApiResponse<EntrepotReception[]>>(
        API_ENDPOINTS.RECEPTIONS.ENTREPOTS,
      );

      let entrepots: EntrepotReception[] = [];
      if (Array.isArray(response.data)) {
        entrepots = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        entrepots = (response.data as any).data || [];
      }

      console.log(`✅ Found ${entrepots.length} warehouses`);
      return entrepots;
    } catch (error: any) {
      console.error("❌ Error getting warehouses:", error);
      throw error;
    }
  },

  /**
   * Récupère les emplacements d'un entrepôt
   */
  async getEmplacementsEntrepot(
    entrepotUuid: string,
  ): Promise<EmplacementEntrepot[]> {
    try {
      console.log("📍 Fetching warehouse locations:", entrepotUuid);

      const response = await api.get<ApiResponse<EmplacementEntrepot[]>>(
        API_ENDPOINTS.RECEPTIONS.EMPLACEMENTS(entrepotUuid),
      );

      let emplacements: EmplacementEntrepot[] = [];
      if (Array.isArray(response.data)) {
        emplacements = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        emplacements = (response.data as any).data || [];
      }

      console.log(`✅ Found ${emplacements.length} locations`);
      return emplacements;
    } catch (error: any) {
      console.error("❌ Error getting locations:", error);
      throw error;
    }
  },

  // ==================== Gestion des Transferts ====================

  /**
   * Récupère les transferts
   */
  async getTransferts(params?: {
    statut?: string;
    entrepot_source_uuid?: string;
    entrepot_destination_uuid?: string;
    page?: number;
    limit?: number;
  }): Promise<{ transferts: TransfertReception[]; total: number }> {
    try {
      console.log("🔄 Fetching transfers");

      const queryParams = new URLSearchParams();
      if (params?.statut) queryParams.append("statut", params.statut);
      if (params?.entrepot_source_uuid)
        queryParams.append("entrepot_source_uuid", params.entrepot_source_uuid);
      if (params?.entrepot_destination_uuid)
        queryParams.append(
          "entrepot_destination_uuid",
          params.entrepot_destination_uuid,
        );
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());

      const endpoint = queryParams.toString()
        ? `${API_ENDPOINTS.RECEPTIONS.TRANSFERTS}?${queryParams.toString()}`
        : API_ENDPOINTS.RECEPTIONS.TRANSFERTS;

      const response =
        await api.get<ApiResponse<TransfertReception[]>>(endpoint);

      let transferts: TransfertReception[] = [];
      let total = 0;

      if (Array.isArray(response.data)) {
        transferts = response.data;
        total = transferts.length;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        transferts = (response.data as any).data || [];
        total = (response.data as any).total || transferts.length;
      }

      console.log(`✅ Found ${transferts.length} transfers`);
      return { transferts, total };
    } catch (error: any) {
      console.error("❌ Error getting transfers:", error);
      throw error;
    }
  },

  /**
   * Crée un nouveau transfert
   */
  async createTransfert(
    transfertData: Partial<TransfertReception>,
  ): Promise<TransfertReception> {
    try {
      console.log("🆕 Creating transfer");

      const response = await api.post<ApiResponse<TransfertReception>>(
        API_ENDPOINTS.RECEPTIONS.CREATE_TRANSFERT,
        transfertData,
      );

      console.log("✅ Transfer created");
      return response.data as TransfertReception;
    } catch (error: any) {
      console.error("❌ Error creating transfer:", error);
      throw error;
    }
  },

  // ==================== Import/Export ====================

  /**
   * Exporte les réceptions
   */
  async exportReceptions(options: ExportReceptionsOptions): Promise<Blob> {
    try {
      console.log("📤 Exporting receptions in format:", options.format);

      const response = await api.post<Blob>(
        API_ENDPOINTS.RECEPTIONS.EXPORT,
        options,
        {
          responseType: "blob",
        },
      );

      console.log("✅ Export completed");
      return response.data;
    } catch (error: any) {
      console.error("❌ Error exporting receptions:", error);
      throw error;
    }
  },

  /**
   * Importe des réceptions
   */
  async importReceptions(importData: ImportReceptionsData): Promise<{
    success: boolean;
    imported: number;
    errors: any[];
  }> {
    try {
      console.log("📥 Importing receptions");

      const formData = new FormData();
      formData.append("format", importData.format);
      formData.append("data", JSON.stringify(importData.data));
      formData.append("options", JSON.stringify(importData.options || {}));

      const response = await api.post<ApiResponse<any>>(
        API_ENDPOINTS.RECEPTIONS.IMPORT,
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
      console.error("❌ Error importing receptions:", error);
      throw error;
    }
  },

  // ==================== Planification ====================

  /**
   * Récupère les planifications de réception
   */
  async getPlanifications(params?: {
    statut?: string;
    date_reception_prevue_debut?: string;
    date_reception_prevue_fin?: string;
    entrepot_uuid?: string;
  }): Promise<PlanificationReception[]> {
    try {
      console.log("📅 Fetching reception planning");

      const queryParams = new URLSearchParams();
      if (params?.statut) queryParams.append("statut", params.statut);
      if (params?.date_reception_prevue_debut)
        queryParams.append(
          "date_reception_prevue_debut",
          params.date_reception_prevue_debut,
        );
      if (params?.date_reception_prevue_fin)
        queryParams.append(
          "date_reception_prevue_fin",
          params.date_reception_prevue_fin,
        );
      if (params?.entrepot_uuid)
        queryParams.append("entrepot_uuid", params.entrepot_uuid);

      const endpoint = queryParams.toString()
        ? `${API_ENDPOINTS.RECEPTIONS.PLANIFICATIONS}?${queryParams.toString()}`
        : API_ENDPOINTS.RECEPTIONS.PLANIFICATIONS;

      const response =
        await api.get<ApiResponse<PlanificationReception[]>>(endpoint);

      let planifications: PlanificationReception[] = [];
      if (Array.isArray(response.data)) {
        planifications = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        planifications = (response.data as any).data || [];
      }

      console.log(`✅ Found ${planifications.length} planning entries`);
      return planifications;
    } catch (error: any) {
      console.error("❌ Error getting planning:", error);
      throw error;
    }
  },

  /**
   * Crée une planification
   */
  async createPlanification(
    planificationData: Partial<PlanificationReception>,
  ): Promise<PlanificationReception> {
    try {
      console.log("📅 Creating reception planning");

      const response = await api.post<ApiResponse<PlanificationReception>>(
        API_ENDPOINTS.RECEPTIONS.CREATE_PLANIFICATION,
        planificationData,
      );

      console.log("✅ Planning created");
      return response.data as PlanificationReception;
    } catch (error: any) {
      console.error("❌ Error creating planning:", error);
      throw error;
    }
  },

  // ==================== Workflows ====================

  /**
   * Récupère les workflows de réception
   */
  async getWorkflows(): Promise<WorkflowReception[]> {
    try {
      console.log("🔧 Fetching reception workflows");

      const response = await api.get<ApiResponse<WorkflowReception[]>>(
        API_ENDPOINTS.RECEPTIONS.WORKFLOWS,
      );

      let workflows: WorkflowReception[] = [];
      if (Array.isArray(response.data)) {
        workflows = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        workflows = (response.data as any).data || [];
      }

      console.log(`✅ Found ${workflows.length} workflows`);
      return workflows;
    } catch (error: any) {
      console.error("❌ Error getting workflows:", error);
      throw error;
    }
  },

  /**
   * Applique un workflow à une réception
   */
  async applyWorkflow(
    receptionUuid: string,
    workflowUuid: string,
  ): Promise<Reception> {
    try {
      console.log("🔧 Applying workflow to reception:", receptionUuid);

      const response = await api.post<ApiResponse<Reception>>(
        API_ENDPOINTS.RECEPTIONS.APPLY_WORKFLOW(receptionUuid),
        { workflow_uuid: workflowUuid },
      );

      let reception: Reception;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        reception = (response.data as any).data;
      } else {
        reception = response.data as Reception;
      }

      console.log("✅ Workflow applied");
      return reception;
    } catch (error: any) {
      console.error("❌ Error applying workflow:", error);
      throw error;
    }
  },

  // ==================== Utilitaires ====================

  /**
   * Vérifie la disponibilité des articles avant réception
   */
  async checkArticleAvailability(
    articleUuid: string,
    quantite: number,
  ): Promise<{
    disponible: boolean;
    quantite_disponible: number;
    emplacements: Array<{
      emplacement_uuid: string;
      emplacement_code: string;
      quantite: number;
    }>;
  }> {
    try {
      console.log("🔍 Checking article availability:", articleUuid);

      const response = await api.get<ApiResponse<any>>(
        `${API_ENDPOINTS.RECEPTIONS.CHECK_AVAILABILITY}/${articleUuid}?quantite=${quantite}`,
      );

      return response.data as any;
    } catch (error: any) {
      console.error("❌ Error checking availability:", error);
      throw error;
    }
  },

  /**
   * Génère un numéro de réception
   */
  async generateReceptionNumber(): Promise<{ numero: string }> {
    try {
      console.log("🔢 Generating reception number");

      const response = await api.get<ApiResponse<{ numero: string }>>(
        API_ENDPOINTS.RECEPTIONS.GENERATE_NUMBER,
      );

      return response.data as { numero: string };
    } catch (error: any) {
      console.error("❌ Error generating number:", error);
      throw error;
    }
  },

  /**
   * Récupère les réceptions en retard
   */
  async getReceptionsEnRetard(): Promise<Reception[]> {
    try {
      console.log("⏰ Getting delayed receptions");

      const response = await api.get<ApiResponse<Reception[]>>(
        API_ENDPOINTS.RECEPTIONS.EN_RETARD,
      );

      let receptions: Reception[] = [];
      if (Array.isArray(response.data)) {
        receptions = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        receptions = (response.data as any).data || [];
      }

      console.log(`✅ Found ${receptions.length} delayed receptions`);
      return receptions;
    } catch (error: any) {
      console.error("❌ Error getting delayed receptions:", error);
      throw error;
    }
  },

  /**
   * Récupère les réceptions urgentes
   */
  async getReceptionsUrgentes(): Promise<Reception[]> {
    try {
      console.log("🚨 Getting urgent receptions");

      const response = await api.get<ApiResponse<Reception[]>>(
        API_ENDPOINTS.RECEPTIONS.URGENTES,
      );

      let receptions: Reception[] = [];
      if (Array.isArray(response.data)) {
        receptions = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        receptions = (response.data as any).data || [];
      }

      console.log(`✅ Found ${receptions.length} urgent receptions`);
      return receptions;
    } catch (error: any) {
      console.error("❌ Error getting urgent receptions:", error);
      throw error;
    }
  },

  /**
   * Synchronise avec le système ERP
   */
  async syncWithERP(
    receptionUuid: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log("🔄 Syncing reception with ERP:", receptionUuid);

      const response = await api.post<
        ApiResponse<{ success: boolean; message: string }>
      >(API_ENDPOINTS.RECEPTIONS.SYNC_ERP(receptionUuid), {});

      return response.data as { success: boolean; message: string };
    } catch (error: any) {
      console.error("❌ Error syncing with ERP:", error);
      throw error;
    }
  },
};
