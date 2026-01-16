// services/statuts-matrimoniaux/statuts-matrimoniaux.service.ts
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import type {
  StatutMatrimonialType,
  StatutMatrimonialCreateData,
  StatutMatrimonialUpdateData,
  StatutMatrimonialFilterParams,
  StatutMatrimonialStats,
  HistoriqueChangementStatut,
  DemandeChangementStatut,
  ValidationStatutMatrimonial,
  AnalyseStatutsMatrimoniaux,
  RegleValidationStatut,
  NotificationStatutMatrimonial,
  WorkflowChangementStatut,
  ExportStatutsMatrimoniauxOptions,
  ImportStatutsMatrimoniauxData,
  ModeleDocumentStatut,
  PreferencesStatutUtilisateur,
} from "./statuts-matrimoniaux.types";

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
 * Service complet pour la gestion des statuts matrimoniaux
 */
export const statutsMatrimoniauxService = {
  // ==================== CRUD Statuts Matrimoniaux ====================

  /**
   * Récupère la liste des statuts matrimoniaux
   */
  async getStatutsMatrimoniaux(params?: {
    page?: number;
    limit?: number;
    search?: string;
    actif?: boolean;
    defaut?: boolean;
    sort_by?: string;
    sort_order?: "asc" | "desc";
  }): Promise<{
    statuts: StatutMatrimonialType[];
    total: number;
    page: number;
    pages: number;
  }> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.actif !== undefined)
      queryParams.append("actif", params.actif.toString());
    if (params?.defaut !== undefined)
      queryParams.append("defaut", params.defaut.toString());
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.STATUTS_MATRIMONIAUX.LIST}?${queryString}`
      : API_ENDPOINTS.STATUTS_MATRIMONIAUX.LIST;

    console.log("💍 Fetching statuts matrimoniaux:", endpoint);

    try {
      const response =
        await api.get<ApiResponse<StatutMatrimonialType[]>>(endpoint);

      let statuts: StatutMatrimonialType[] = [];
      let total = 0;
      let page = 1;
      let pages = 1;

      if (Array.isArray(response.data)) {
        statuts = response.data;
        total = response.total || statuts.length;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        statuts = (response.data as any).data || [];
        total = (response.data as any).total || statuts.length;
        page = (response.data as any).page || 1;
        pages = (response.data as any).pages || 1;
      }

      console.log(`✅ Found ${statuts.length} statuts matrimoniaux`);
      return { statuts, total, page, pages };
    } catch (error: any) {
      console.error("🚨 Error getting statuts matrimoniaux:", error);
      throw error;
    }
  },

  /**
   * Récupère tous les statuts matrimoniaux (sans pagination)
   */
  async getAllStatutsMatrimoniaux(): Promise<StatutMatrimonialType[]> {
    try {
      console.log("💍 Fetching all statuts matrimoniaux");

      const response = await api.get<ApiResponse<StatutMatrimonialType[]>>(
        API_ENDPOINTS.STATUTS_MATRIMONIAUX.ALL,
      );

      let statuts: StatutMatrimonialType[] = [];
      if (Array.isArray(response.data)) {
        statuts = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        statuts = (response.data as any).data || [];
      }

      console.log(`✅ Found ${statuts.length} statuts`);
      return statuts;
    } catch (error: any) {
      console.error("❌ Error getting all statuts:", error);
      throw error;
    }
  },

  /**
   * Récupère les statuts matrimoniaux actifs
   */
  async getStatutsMatrimoniauxActifs(): Promise<StatutMatrimonialType[]> {
    try {
      console.log("💍 Fetching active statuts matrimoniaux");

      const response = await api.get<ApiResponse<StatutMatrimonialType[]>>(
        API_ENDPOINTS.STATUTS_MATRIMONIAUX.ACTIFS,
      );

      let statuts: StatutMatrimonialType[] = [];
      if (Array.isArray(response.data)) {
        statuts = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        statuts = (response.data as any).data || [];
      }

      console.log(`✅ Found ${statuts.length} active statuts`);
      return statuts;
    } catch (error: any) {
      console.error("❌ Error getting active statuts:", error);
      throw error;
    }
  },

  /**
   * Récupère un statut matrimonial par son UUID
   */
  async getStatutMatrimonial(uuid: string): Promise<StatutMatrimonialType> {
    try {
      console.log("🔍 Fetching statut matrimonial:", uuid);

      const response = await api.get<ApiResponse<StatutMatrimonialType>>(
        API_ENDPOINTS.STATUTS_MATRIMONIAUX.DETAIL(uuid),
      );

      let statut: StatutMatrimonialType;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        statut = (response.data as any).data;
      } else {
        statut = response.data as StatutMatrimonialType;
      }

      if (!statut || !statut.uuid) {
        throw new Error("Statut matrimonial non trouvé");
      }

      console.log("✅ Statut matrimonial found:", statut.libelle);
      return statut;
    } catch (error: any) {
      console.error("❌ Error fetching statut matrimonial:", error);
      throw error;
    }
  },

  /**
   * Récupère un statut matrimonial par son code
   */
  async getStatutMatrimonialByCode(
    code: string,
  ): Promise<StatutMatrimonialType> {
    try {
      console.log("🔍 Fetching statut matrimonial by code:", code);

      // Si nous n'avons pas d'endpoint spécifique, nous filtrons la liste
      const { statuts } = await this.getStatutsMatrimoniaux({
        search: code,
        limit: 1,
      });

      if (statuts.length === 0) {
        throw new Error("Statut matrimonial non trouvé");
      }

      const statut = statuts.find((s) => s.code === code);
      if (!statut) {
        throw new Error("Statut matrimonial non trouvé");
      }

      console.log("✅ Statut matrimonial found by code");
      return statut;
    } catch (error: any) {
      console.error("❌ Error fetching statut by code:", error);
      throw error;
    }
  },

  /**
   * Crée un nouveau statut matrimonial
   */
  async createStatutMatrimonial(
    statutData: StatutMatrimonialCreateData,
  ): Promise<StatutMatrimonialType> {
    try {
      console.log("🆕 Creating statut matrimonial:", statutData.libelle);

      const response = await api.post<ApiResponse<StatutMatrimonialType>>(
        API_ENDPOINTS.STATUTS_MATRIMONIAUX.CREATE,
        statutData,
      );

      console.log("✅ Statut matrimonial creation response:", response.data);

      let createdStatut: StatutMatrimonialType;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        createdStatut = (response.data as any).data;
      } else {
        createdStatut = response.data as StatutMatrimonialType;
      }

      if (!createdStatut || !createdStatut.uuid) {
        throw new Error("Échec de la création du statut matrimonial");
      }

      return createdStatut;
    } catch (error: any) {
      console.error("❌ Error creating statut matrimonial:", {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  /**
   * Met à jour un statut matrimonial existant
   */
  async updateStatutMatrimonial(
    uuid: string,
    statutData: StatutMatrimonialUpdateData,
  ): Promise<StatutMatrimonialType> {
    try {
      console.log("✏️ Updating statut matrimonial:", uuid);

      const response = await api.put<ApiResponse<StatutMatrimonialType>>(
        API_ENDPOINTS.STATUTS_MATRIMONIAUX.UPDATE(uuid),
        statutData,
      );

      console.log("✅ Statut matrimonial update response:", response.data);

      let updatedStatut: StatutMatrimonialType;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        updatedStatut = (response.data as any).data;
      } else {
        updatedStatut = response.data as StatutMatrimonialType;
      }

      return updatedStatut;
    } catch (error: any) {
      console.error("❌ Error updating statut matrimonial:", error);
      throw error;
    }
  },

  /**
   * Supprime un statut matrimonial
   */
  async deleteStatutMatrimonial(uuid: string): Promise<{ message: string }> {
    try {
      console.log("🗑️ Deleting statut matrimonial:", uuid);

      const response = await api.delete<ApiResponse<{ message: string }>>(
        API_ENDPOINTS.STATUTS_MATRIMONIAUX.DELETE(uuid),
      );

      console.log("✅ Statut matrimonial deleted successfully");
      return response.data as { message: string };
    } catch (error: any) {
      console.error("❌ Error deleting statut matrimonial:", error);
      throw error;
    }
  },

  /**
   * Exporte les statuts matrimoniaux au format PDF
   */
  async exportStatutsMatrimoniauxPDF(): Promise<Blob> {
    try {
      console.log("📤 Exporting statuts matrimoniaux to PDF");

      const response = await api.get<Blob>(
        API_ENDPOINTS.STATUTS_MATRIMONIAUX.EXPORT_PDF,
        {
          responseType: "blob",
        },
      );

      console.log("✅ PDF export completed");
      return response.data;
    } catch (error: any) {
      console.error("❌ Error exporting to PDF:", error);
      throw error;
    }
  },

  // ==================== Gestion des Changements de Statut ====================

  /**
   * Récupère l'historique des changements de statut d'un utilisateur
   */
  async getHistoriqueChangementsUtilisateur(
    utilisateurUuid: string,
  ): Promise<HistoriqueChangementStatut[]> {
    try {
      console.log("📜 Getting user status change history:", utilisateurUuid);

      const response = await api.get<ApiResponse<HistoriqueChangementStatut[]>>(
        `${API_ENDPOINTS.STATUTS_MATRIMONIAUX.HISTORIQUE_UTILISATEUR}/${utilisateurUuid}`,
      );

      let historique: HistoriqueChangementStatut[] = [];
      if (Array.isArray(response.data)) {
        historique = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        historique = (response.data as any).data || [];
      }

      console.log(`✅ Found ${historique.length} history entries`);
      return historique;
    } catch (error: any) {
      console.error("❌ Error getting user history:", error);
      throw error;
    }
  },

  /**
   * Soumet une demande de changement de statut
   */
  async soumettreDemandeChangement(demandeData: {
    utilisateur_uuid: string;
    nouveau_statut_code: string;
    documents?: Array<{
      type: string;
      nom: string;
      url: string;
    }>;
    raison?: string;
  }): Promise<DemandeChangementStatut> {
    try {
      console.log("📝 Submitting status change request");

      const response = await api.post<ApiResponse<DemandeChangementStatut>>(
        API_ENDPOINTS.STATUTS_MATRIMONIAUX.SOUMETTRE_DEMANDE,
        demandeData,
      );

      console.log("✅ Request submitted");
      return response.data as DemandeChangementStatut;
    } catch (error: any) {
      console.error("❌ Error submitting request:", error);
      throw error;
    }
  },

  /**
   * Récupère les demandes de changement de statut
   */
  async getDemandesChangement(params?: {
    statut?: string;
    utilisateur_uuid?: string;
    page?: number;
    limit?: number;
  }): Promise<{ demandes: DemandeChangementStatut[]; total: number }> {
    try {
      console.log("📋 Getting status change requests");

      const queryParams = new URLSearchParams();
      if (params?.statut) queryParams.append("statut", params.statut);
      if (params?.utilisateur_uuid)
        queryParams.append("utilisateur_uuid", params.utilisateur_uuid);
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());

      const endpoint = queryParams.toString()
        ? `${API_ENDPOINTS.STATUTS_MATRIMONIAUX.DEMANDES}?${queryParams.toString()}`
        : API_ENDPOINTS.STATUTS_MATRIMONIAUX.DEMANDES;

      const response =
        await api.get<ApiResponse<DemandeChangementStatut[]>>(endpoint);

      let demandes: DemandeChangementStatut[] = [];
      let total = 0;

      if (Array.isArray(response.data)) {
        demandes = response.data;
        total = demandes.length;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        demandes = (response.data as any).data || [];
        total = (response.data as any).total || demandes.length;
      }

      console.log(`✅ Found ${demandes.length} requests`);
      return { demandes, total };
    } catch (error: any) {
      console.error("❌ Error getting requests:", error);
      throw error;
    }
  },

  /**
   * Approuve une demande de changement de statut
   */
  async approuverDemandeChangement(
    uuid: string,
    validateurUuid: string,
    notes?: string,
  ): Promise<DemandeChangementStatut> {
    try {
      console.log("✅ Approving status change request:", uuid);

      const response = await api.put<ApiResponse<DemandeChangementStatut>>(
        API_ENDPOINTS.STATUTS_MATRIMONIAUX.APPROUVER_DEMANDE(uuid),
        { validateur_uuid: validateurUuid, notes },
      );

      let demande: DemandeChangementStatut;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        demande = (response.data as any).data;
      } else {
        demande = response.data as DemandeChangementStatut;
      }

      console.log("✅ Request approved");
      return demande;
    } catch (error: any) {
      console.error("❌ Error approving request:", error);
      throw error;
    }
  },

  /**
   * Rejette une demande de changement de statut
   */
  async rejeterDemandeChangement(
    uuid: string,
    validateurUuid: string,
    raison: string,
  ): Promise<DemandeChangementStatut> {
    try {
      console.log("❌ Rejecting status change request:", uuid);

      const response = await api.put<ApiResponse<DemandeChangementStatut>>(
        API_ENDPOINTS.STATUTS_MATRIMONIAUX.REJETER_DEMANDE(uuid),
        { validateur_uuid: validateurUuid, raison },
      );

      let demande: DemandeChangementStatut;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        demande = (response.data as any).data;
      } else {
        demande = response.data as DemandeChangementStatut;
      }

      console.log("✅ Request rejected");
      return demande;
    } catch (error: any) {
      console.error("❌ Error rejecting request:", error);
      throw error;
    }
  },

  // ==================== Validation et Vérification ====================

  /**
   * Valide un statut matrimonial pour un utilisateur
   */
  async validerStatutUtilisateur(validationData: {
    utilisateur_uuid: string;
    statut_code: string;
    documents: Array<{
      type: string;
      url: string;
    }>;
  }): Promise<ValidationStatutMatrimonial> {
    try {
      console.log("✅ Validating user status");

      const response = await api.post<ApiResponse<ValidationStatutMatrimonial>>(
        API_ENDPOINTS.STATUTS_MATRIMONIAUX.VALIDER_STATUT,
        validationData,
      );

      console.log("✅ Validation completed");
      return response.data as ValidationStatutMatrimonial;
    } catch (error: any) {
      console.error("❌ Error validating status:", error);
      throw error;
    }
  },

  /**
   * Vérifie l'éligibilité pour un changement de statut
   */
  async verifierEligibiliteChangement(
    utilisateurUuid: string,
    nouveauStatutCode: string,
  ): Promise<{
    eligible: boolean;
    raisons?: string[];
    documents_requis?: string[];
    restrictions?: string[];
  }> {
    try {
      console.log("🔍 Checking eligibility for status change");

      const response = await api.get<ApiResponse<any>>(
        `${API_ENDPOINTS.STATUTS_MATRIMONIAUX.VERIFIER_ELIGIBILITE}?utilisateur_uuid=${utilisateurUuid}&nouveau_statut=${nouveauStatutCode}`,
      );

      return response.data as any;
    } catch (error: any) {
      console.error("❌ Error checking eligibility:", error);
      throw error;
    }
  },

  // ==================== Statistiques et Analyses ====================

  /**
   * Récupère les statistiques des statuts matrimoniaux
   */
  async getStatutsMatrimoniauxStats(): Promise<StatutMatrimonialStats> {
    try {
      console.log("📊 Fetching statuts matrimoniaux statistics");

      const response = await api.get<ApiResponse<StatutMatrimonialStats>>(
        API_ENDPOINTS.STATUTS_MATRIMONIAUX.STATS,
      );

      let stats: StatutMatrimonialStats;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        stats = (response.data as any).data;
      } else {
        stats = response.data as StatutMatrimonialStats;
      }

      console.log("✅ Statistics loaded");
      return stats;
    } catch (error: any) {
      console.error("❌ Error getting statistics:", error);
      throw error;
    }
  },

  /**
   * Génère un rapport d'analyse
   */
  async genererAnalyseStatuts(params?: {
    periode_debut?: string;
    periode_fin?: string;
  }): Promise<AnalyseStatutsMatrimoniaux> {
    try {
      console.log("📈 Generating status analysis report");

      const queryParams = new URLSearchParams();
      if (params?.periode_debut)
        queryParams.append("periode_debut", params.periode_debut);
      if (params?.periode_fin)
        queryParams.append("periode_fin", params.periode_fin);

      const endpoint = queryParams.toString()
        ? `${API_ENDPOINTS.STATUTS_MATRIMONIAUX.ANALYSE}?${queryParams.toString()}`
        : API_ENDPOINTS.STATUTS_MATRIMONIAUX.ANALYSE;

      const response =
        await api.get<ApiResponse<AnalyseStatutsMatrimoniaux>>(endpoint);

      return response.data as AnalyseStatutsMatrimoniaux;
    } catch (error: any) {
      console.error("❌ Error generating analysis:", error);
      throw error;
    }
  },

  // ==================== Gestion des Règles ====================

  /**
   * Récupère les règles de validation
   */
  async getReglesValidation(): Promise<RegleValidationStatut[]> {
    try {
      console.log("⚙️ Getting validation rules");

      const response = await api.get<ApiResponse<RegleValidationStatut[]>>(
        API_ENDPOINTS.STATUTS_MATRIMONIAUX.REGLES_VALIDATION,
      );

      let regles: RegleValidationStatut[] = [];
      if (Array.isArray(response.data)) {
        regles = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        regles = (response.data as any).data || [];
      }

      console.log(`✅ Found ${regles.length} rules`);
      return regles;
    } catch (error: any) {
      console.error("❌ Error getting rules:", error);
      throw error;
    }
  },

  /**
   * Crée une nouvelle règle de validation
   */
  async createRegleValidation(
    regleData: Partial<RegleValidationStatut>,
  ): Promise<RegleValidationStatut> {
    try {
      console.log("🆕 Creating validation rule");

      const response = await api.post<ApiResponse<RegleValidationStatut>>(
        API_ENDPOINTS.STATUTS_MATRIMONIAUX.CREER_REGLE,
        regleData,
      );

      console.log("✅ Rule created");
      return response.data as RegleValidationStatut;
    } catch (error: any) {
      console.error("❌ Error creating rule:", error);
      throw error;
    }
  },

  // ==================== Gestion des Workflows ====================

  /**
   * Récupère les workflows de changement de statut
   */
  async getWorkflowsChangement(): Promise<WorkflowChangementStatut[]> {
    try {
      console.log("🔧 Getting status change workflows");

      const response = await api.get<ApiResponse<WorkflowChangementStatut[]>>(
        API_ENDPOINTS.STATUTS_MATRIMONIAUX.WORKFLOWS,
      );

      let workflows: WorkflowChangementStatut[] = [];
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
   * Applique un workflow à une demande
   */
  async appliquerWorkflowDemande(
    demandeUuid: string,
    workflowUuid: string,
  ): Promise<DemandeChangementStatut> {
    try {
      console.log("🔧 Applying workflow to request:", demandeUuid);

      const response = await api.post<ApiResponse<DemandeChangementStatut>>(
        API_ENDPOINTS.STATUTS_MATRIMONIAUX.APPLIQUER_WORKFLOW(demandeUuid),
        { workflow_uuid: workflowUuid },
      );

      let demande: DemandeChangementStatut;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        demande = (response.data as any).data;
      } else {
        demande = response.data as DemandeChangementStatut;
      }

      console.log("✅ Workflow applied");
      return demande;
    } catch (error: any) {
      console.error("❌ Error applying workflow:", error);
      throw error;
    }
  },

  // ==================== Gestion des Notifications ====================

  /**
   * Envoie une notification de statut
   */
  async envoyerNotificationStatut(
    notificationData: Partial<NotificationStatutMatrimonial>,
  ): Promise<NotificationStatutMatrimonial> {
    try {
      console.log("📧 Sending status notification");

      const response = await api.post<
        ApiResponse<NotificationStatutMatrimonial>
      >(API_ENDPOINTS.STATUTS_MATRIMONIAUX.NOTIFICATIONS, notificationData);

      console.log("✅ Notification sent");
      return response.data as NotificationStatutMatrimonial;
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
  ): Promise<NotificationStatutMatrimonial[]> {
    try {
      console.log("📨 Getting user notifications:", utilisateurUuid);

      const response = await api.get<
        ApiResponse<NotificationStatutMatrimonial[]>
      >(
        `${API_ENDPOINTS.STATUTS_MATRIMONIAUX.NOTIFICATIONS_UTILISATEUR}/${utilisateurUuid}`,
      );

      let notifications: NotificationStatutMatrimonial[] = [];
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

  // ==================== Gestion des Modèles de Documents ====================

  /**
   * Récupère les modèles de documents
   */
  async getModelesDocuments(
    statutCode?: string,
  ): Promise<ModeleDocumentStatut[]> {
    try {
      console.log("📄 Getting document templates");

      const endpoint = statutCode
        ? `${API_ENDPOINTS.STATUTS_MATRIMONIAUX.MODELES_DOCUMENTS}?statut_code=${statutCode}`
        : API_ENDPOINTS.STATUTS_MATRIMONIAUX.MODELES_DOCUMENTS;

      const response =
        await api.get<ApiResponse<ModeleDocumentStatut[]>>(endpoint);

      let modeles: ModeleDocumentStatut[] = [];
      if (Array.isArray(response.data)) {
        modeles = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        modeles = (response.data as any).data || [];
      }

      console.log(`✅ Found ${modeles.length} templates`);
      return modeles;
    } catch (error: any) {
      console.error("❌ Error getting templates:", error);
      throw error;
    }
  },

  // ==================== Gestion des Préférences ====================

  /**
   * Récupère les préférences d'un utilisateur
   */
  async getPreferencesUtilisateur(
    utilisateurUuid: string,
  ): Promise<PreferencesStatutUtilisateur> {
    try {
      console.log("⚙️ Getting user preferences:", utilisateurUuid);

      const response = await api.get<ApiResponse<PreferencesStatutUtilisateur>>(
        `${API_ENDPOINTS.STATUTS_MATRIMONIAUX.PREFERENCES}/${utilisateurUuid}`,
      );

      let preferences: PreferencesStatutUtilisateur;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        preferences = (response.data as any).data;
      } else {
        preferences = response.data as PreferencesStatutUtilisateur;
      }

      console.log("✅ Preferences loaded");
      return preferences;
    } catch (error: any) {
      console.error("❌ Error getting preferences:", error);
      throw error;
    }
  },

  /**
   * Met à jour les préférences d'un utilisateur
   */
  async updatePreferencesUtilisateur(
    utilisateurUuid: string,
    preferences: Partial<PreferencesStatutUtilisateur>,
  ): Promise<PreferencesStatutUtilisateur> {
    try {
      console.log("✏️ Updating user preferences:", utilisateurUuid);

      const response = await api.put<ApiResponse<PreferencesStatutUtilisateur>>(
        API_ENDPOINTS.STATUTS_MATRIMONIAUX.UPDATE_PREFERENCES(utilisateurUuid),
        preferences,
      );

      let updatedPreferences: PreferencesStatutUtilisateur;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        updatedPreferences = (response.data as any).data;
      } else {
        updatedPreferences = response.data as PreferencesStatutUtilisateur;
      }

      console.log("✅ Preferences updated");
      return updatedPreferences;
    } catch (error: any) {
      console.error("❌ Error updating preferences:", error);
      throw error;
    }
  },

  // ==================== Import/Export ====================

  /**
   * Exporte les données des statuts matrimoniaux
   */
  async exportStatutsMatrimoniaux(
    options: ExportStatutsMatrimoniauxOptions,
  ): Promise<Blob> {
    try {
      console.log(
        "📤 Exporting statuts matrimoniaux in format:",
        options.format,
      );

      const response = await api.post<Blob>(
        API_ENDPOINTS.STATUTS_MATRIMONIAUX.EXPORT,
        options,
        {
          responseType: "blob",
        },
      );

      console.log("✅ Export completed");
      return response.data;
    } catch (error: any) {
      console.error("❌ Error exporting statuts matrimoniaux:", error);
      throw error;
    }
  },

  /**
   * Importe des statuts matrimoniaux
   */
  async importStatutsMatrimoniaux(
    importData: ImportStatutsMatrimoniauxData,
  ): Promise<{
    success: boolean;
    imported: number;
    errors: any[];
  }> {
    try {
      console.log("📥 Importing statuts matrimoniaux");

      const formData = new FormData();
      formData.append("format", importData.format);
      formData.append("data", JSON.stringify(importData.data));
      formData.append("options", JSON.stringify(importData.options || {}));

      const response = await api.post<ApiResponse<any>>(
        API_ENDPOINTS.STATUTS_MATRIMONIAUX.IMPORT,
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
      console.error("❌ Error importing statuts matrimoniaux:", error);
      throw error;
    }
  },

  // ==================== Utilitaires ====================

  /**
   * Récupère le libellé formaté pour un genre spécifique
   */
  async getLibelleFormate(statutCode: string, genre: string): Promise<string> {
    try {
      console.log("🏷️ Getting formatted label:", statutCode, genre);

      const response = await api.get<ApiResponse<{ libelle: string }>>(
        `${API_ENDPOINTS.STATUTS_MATRIMONIAUX.LIBELLE_FORMATE}?statut_code=${statutCode}&genre=${genre}`,
      );

      return (response.data as any).libelle || "";
    } catch (error: any) {
      console.error("❌ Error getting formatted label:", error);
      return "";
    }
  },

  /**
   * Vérifie la validité d'un statut pour un pays donné
   */
  async verifierValiditePays(
    statutCode: string,
    paysCode: string,
  ): Promise<{
    valide: boolean;
    restrictions?: string[];
  }> {
    try {
      console.log(
        "🌍 Checking status validity for country:",
        statutCode,
        paysCode,
      );

      const response = await api.get<ApiResponse<any>>(
        `${API_ENDPOINTS.STATUTS_MATRIMONIAUX.VERIFIER_VALIDITE}?statut_code=${statutCode}&pays_code=${paysCode}`,
      );

      return response.data as any;
    } catch (error: any) {
      console.error("❌ Error checking validity:", error);
      throw error;
    }
  },

  /**
   * Récupère le statut par défaut
   */
  async getStatutDefaut(): Promise<StatutMatrimonialType> {
    try {
      console.log("⚙️ Getting default status");

      const { statuts } = await this.getStatutsMatrimoniaux({
        defaut: true,
        limit: 1,
      });

      if (statuts.length === 0) {
        // Si aucun statut par défaut n'est défini, prendre le premier actif
        const { statuts: statutsActifs } = await this.getStatutsMatrimoniaux({
          actif: true,
          limit: 1,
        });

        if (statutsActifs.length === 0) {
          throw new Error("Aucun statut matrimonial disponible");
        }

        return statutsActifs[0];
      }

      return statuts[0];
    } catch (error: any) {
      console.error("❌ Error getting default status:", error);
      throw error;
    }
  },

  /**
   * Définit un statut comme statut par défaut
   */
  async setStatutDefaut(uuid: string): Promise<StatutMatrimonialType> {
    try {
      console.log("⚙️ Setting default status:", uuid);

      // D'abord, réinitialiser tous les autres statuts
      const { statuts } = await this.getStatutsMatrimoniaux();
      for (const statut of statuts) {
        if (statut.defaut && statut.uuid !== uuid) {
          await this.updateStatutMatrimonial(statut.uuid, { defaut: false });
        }
      }

      // Puis définir le nouveau statut par défaut
      return await this.updateStatutMatrimonial(uuid, { defaut: true });
    } catch (error: any) {
      console.error("❌ Error setting default status:", error);
      throw error;
    }
  },

  /**
   * Récupère les statuts suggérés pour un utilisateur
   */
  async getStatutsSuggérés(
    utilisateurUuid: string,
  ): Promise<StatutMatrimonialType[]> {
    try {
      console.log("💡 Getting suggested statuses for user:", utilisateurUuid);

      const response = await api.get<ApiResponse<StatutMatrimonialType[]>>(
        `${API_ENDPOINTS.STATUTS_MATRIMONIAUX.SUGGESTIONS}/${utilisateurUuid}`,
      );

      let suggestions: StatutMatrimonialType[] = [];
      if (Array.isArray(response.data)) {
        suggestions = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        suggestions = (response.data as any).data || [];
      }

      console.log(`✅ Found ${suggestions.length} suggestions`);
      return suggestions;
    } catch (error: any) {
      console.error("❌ Error getting suggestions:", error);
      throw error;
    }
  },
};
