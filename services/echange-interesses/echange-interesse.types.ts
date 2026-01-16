// services/echanges/echange-interesse.service.ts
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import type {
  EchangeInteresse,
  EchangeInteresseCreateData,
  EchangeInteresseUpdateData,
  EchangeInteresseFilterParams,
  EchangeInteressePaginationParams,
  EchangeInteresseStats,
  EchangeInteresseValidationResult,
  EchangeInteresseBulkUpdate,
  EchangeInteresseWithDetails,
  EchangeInteresseConversation,
  EchangeInteresseNotification,
  EchangeInteresseRappel,
  EchangeInteresseFeedback,
  EchangeInteresseExportOptions,
  EchangeInteresseAnalytics,
  EchangeInteresseMatchSuggestion,
  EchangeInteresseAutoMatch,
  EchangeInteresseGroup,
  EchangeInteresseAuditLog,
  EchangeInteresseVerificationRequest,
  EchangeInteresseProposition,
  EchangeInteresseNegociation,
  EchangeInteresseCoordination
} from "./echange-interesse.types";

export interface ApiResponse<T> {
  data: T;
  status: string;
  message?: string;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
}

export const echangeInteresseService = {
  // ==================== CRUD Operations ====================

  async getEchangeInteresses(params?: EchangeInteressePaginationParams): Promise<{ interets: EchangeInteresse[]; count?: number; total?: number; page?: number; pages?: number }> {
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
      ? `${API_ENDPOINTS.ECHANGES.INTERESSES.LIST}?${queryString}`
      : API_ENDPOINTS.ECHANGES.INTERESSES.LIST;

    console.log("📡 Fetching echange interesses from:", endpoint);

    try {
      const response = await api.get<ApiResponse<EchangeInteresse[]>>(endpoint);

      console.log("✅ Echange interesses response received:", {
        hasData: !!response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
      });

      let interets: EchangeInteresse[] = [];
      let count = 0;
      let total = 0;
      let page = 1;
      let pages = 1;

      if (Array.isArray(response.data)) {
        interets = response.data;
        count = response.data.length;
      } else if (response.data && typeof response.data === 'object') {
        if ('data' in response.data && Array.isArray((response.data as any).data)) {
          interets = (response.data as any).data || [];
          count = (response.data as any).count || interets.length;
          total = (response.data as any).total || count;
          page = (response.data as any).page || 1;
          pages = (response.data as any).pages || 1;
        } else if ('interets' in response.data && Array.isArray((response.data as any).interets)) {
          interets = (response.data as any).interets || [];
          count = (response.data as any).count || interets.length;
          total = (response.data as any).total || count;
          page = (response.data as any).page || 1;
          pages = (response.data as any).pages || 1;
        }
      }

      return { interets, count, total, page, pages };
    } catch (error: any) {
      console.error("🚨 Error in echangeInteresseService.getEchangeInteresses:", {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  async getEchangeInteresse(uuid: string): Promise<EchangeInteresse> {
    try {
      console.log("🔍 Fetching echange interesse:", uuid);

      const response = await api.get<ApiResponse<EchangeInteresse>>(
        API_ENDPOINTS.ECHANGES.INTERESSES.DETAIL(uuid)
      );

      console.log("✅ Echange interesse response:", {
        hasData: !!response.data,
        dataType: typeof response.data,
      });

      let interesseData: EchangeInteresse;

      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        interesseData = (response.data as any).data;
      } else if (response.data && (response.data as any).uuid) {
        interesseData = response.data as EchangeInteresse;
      } else {
        console.error("❌ Invalid echange interesse data structure:", response.data);
        throw new Error("Structure de données echange interesse invalide");
      }

      if (!interesseData || !interesseData.uuid) {
        throw new Error("Echange interesse non trouvé");
      }

      console.log("✅ Echange interesse found");
      return interesseData;
    } catch (error: any) {
      console.error("❌ Error fetching echange interesse:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  async createEchangeInteresse(interesseData: EchangeInteresseCreateData): Promise<EchangeInteresse> {
    try {
      console.log("🆕 Creating echange interesse for echange:", interesseData.echange_uuid);

      // Valider les données avant envoi
      const validation = await this.validateEchangeInteresse(interesseData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const response = await api.post<ApiResponse<EchangeInteresse>>(
        API_ENDPOINTS.ECHANGES.INTERESSES.CREATE,
        interesseData,
      );

      console.log("✅ Echange interesse creation response:", response.data);

      let createdInteresse: EchangeInteresse;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        createdInteresse = (response.data as any).data;
      } else {
        createdInteresse = response.data as EchangeInteresse;
      }

      if (!createdInteresse || !createdInteresse.uuid) {
        throw new Error("Échec de la création de l'échange interesse");
      }

      return createdInteresse;
    } catch (error: any) {
      console.error("❌ Error creating echange interesse:", {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  async updateEchangeInteresse(uuid: string, interesseData: EchangeInteresseUpdateData): Promise<EchangeInteresse> {
    try {
      console.log("✏️ Updating echange interesse:", uuid);

      const response = await api.put<ApiResponse<EchangeInteresse>>(
        API_ENDPOINTS.ECHANGES.INTERESSES.UPDATE(uuid),
        interesseData,
      );

      console.log("✅ Echange interesse update response:", response.data);

      let updatedInteresse: EchangeInteresse;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        updatedInteresse = (response.data as any).data;
      } else {
        updatedInteresse = response.data as EchangeInteresse;
      }

      return updatedInteresse;
    } catch (error: any) {
      console.error("❌ Error updating echange interesse:", error);
      throw error;
    }
  },

  async deleteEchangeInteresse(uuid: string): Promise<void> {
    try {
      console.log("🗑️ Deleting echange interesse:", uuid);

      await api.delete(API_ENDPOINTS.ECHANGES.INTERESSES.DELETE(uuid));

      console.log("✅ Echange interesse deleted successfully");
    } catch (error: any) {
      console.error("❌ Error deleting echange interesse:", error);
      throw error;
    }
  },

  // ==================== Intérêts Spécialisés ====================

  async getEchangeInteressesByEchange(echangeUuid: string, params?: EchangeInteressePaginationParams): Promise<{ interets: EchangeInteresse[]; count: number }> {
    try {
      console.log("🔄 Getting interesses for echange:", echangeUuid);

      const { interets, count } = await this.getEchangeInteresses({
        ...params,
        filters: { echange_uuid: echangeUuid }
      });

      console.log("✅ Found", interets.length, "interesses for echange");
      return { interets, count: count || interets.length };
    } catch (error: any) {
      console.error("❌ Error getting interesses by echange:", error);
      throw error;
    }
  },

  async getEchangeInteressesByUser(userUuid: string, params?: EchangeInteressePaginationParams): Promise<{ interets: EchangeInteresse[]; count: number }> {
    try {
      console.log("👤 Getting user interesses:", userUuid);

      const { interets, count } = await this.getEchangeInteresses({
        ...params,
        filters: { utilisateur_uuid: userUuid }
      });

      console.log("✅ Found", interets.length, "interesses for user");
      return { interets, count: count || interets.length };
    } catch (error: any) {
      console.error("❌ Error getting interesses by user:", error);
      throw error;
    }
  },

  async getEchangeInteressesByCreateur(createurUuid: string, params?: EchangeInteressePaginationParams): Promise<{ interets: EchangeInteresse[]; count: number }> {
    try {
      console.log("👑 Getting createur interesses:", createurUuid);

      const { interets, count } = await this.getEchangeInteresses({
        ...params,
        filters: { createur_uuid: createurUuid }
      });

      console.log("✅ Found", interets.length, "interesses for createur");
      return { interets, count: count || interets.length };
    } catch (error: any) {
      console.error("❌ Error getting interesses by createur:", error);
      throw error;
    }
  },

  async getPendingEchangeInteresses(echangeUuid?: string): Promise<EchangeInteresse[]> {
    try {
      console.log("⏳ Getting pending interesses");

      const filters: EchangeInteresseFilterParams = { statut: "en_attente" };
      if (echangeUuid) {
        filters.echange_uuid = echangeUuid;
      }

      const { interets } = await this.getEchangeInteresses({
        filters,
        sort_by: "date_expression_interet",
        sort_order: "asc"
      });

      console.log("✅ Found", interets.length, "pending interesses");
      return interets;
    } catch (error: any) {
      console.error("❌ Error getting pending interesses:", error);
      throw error;
    }
  },

  async getNegotiatingEchangeInteresses(): Promise<EchangeInteresse[]> {
    try {
      console.log("🤝 Getting negotiating interesses");

      const { interets } = await this.getEchangeInteresses({
        filters: { statut: "negociation" },
        sort_by: "date_debut_negociation",
        sort_order: "desc"
      });

      console.log("✅ Found", interets.length, "negotiating interesses");
      return interets;
    } catch (error: any) {
      console.error("❌ Error getting negotiating interesses:", error);
      throw error;
    }
  },

  async getUrgentEchangeInteresses(): Promise<EchangeInteresse[]> {
    try {
      console.log("🚨 Getting urgent interesses");

      const { interets } = await this.getEchangeInteresses({
        filters: {
          statut: "en_attente",
          priorite: "urgent"
        },
        sort_by: "date_expression_interet",
        sort_order: "asc"
      });

      console.log("✅ Found", interets.length, "urgent interesses");
      return interets;
    } catch (error: any) {
      console.error("❌ Error getting urgent interesses:", error);
      throw error;
    }
  },

  // ==================== Gestion des Statuts ====================

  async contactEchangeInteresse(uuid: string): Promise<EchangeInteresse> {
    try {
      console.log("📞 Contacting echange interesse:", uuid);

      const updates: EchangeInteresseUpdateData = {
        statut: "contacte",
        date_contact: new Date().toISOString()
      };

      return await this.updateEchangeInteresse(uuid, updates);
    } catch (error: any) {
      console.error("❌ Error contacting echange interesse:", error);
      throw error;
    }
  },

  async startNegotiation(uuid: string): Promise<EchangeInteresse> {
    try {
      console.log("💬 Starting negotiation for echange interesse:", uuid);

      const updates: EchangeInteresseUpdateData = {
        statut: "negociation",
        date_debut_negociation: new Date().toISOString()
      };

      return await this.updateEchangeInteresse(uuid, updates);
    } catch (error: any) {
      console.error("❌ Error starting negotiation:", error);
      throw error;
    }
  },

  async acceptEchangeInteresse(uuid: string, terms?: string): Promise<EchangeInteresse> {
    try {
      console.log("✅ Accepting echange interesse:", uuid, "terms:", terms);

      const updates: EchangeInteresseUpdateData = {
        statut: "accepte",
        date_acceptation: new Date().toISOString()
      };

      const interesse = await this.updateEchangeInteresse(uuid, updates);

      // Enregistrer les termes de l'acceptation
      if (terms) {
        await this.addConversation(uuid, {
          expediteur_type: "createur",
          message: `Accepté avec conditions: ${terms}`,
          type_message: "negociation",
          metadata: { type: "acceptation", terms }
        });
      }

      return interesse;
    } catch (error: any) {
      console.error("❌ Error accepting echange interesse:", error);
      throw error;
    }
  },

  async refuseEchangeInteresse(uuid: string, raison?: string): Promise<EchangeInteresse> {
    try {
      console.log("❌ Refusing echange interesse:", uuid, "raison:", raison);

      const updates: EchangeInteresseUpdateData = {
        statut: "refuse",
        date_refus: new Date().toISOString()
      };

      const interesse = await this.updateEchangeInteresse(uuid, updates);

      // Enregistrer la raison du refus
      if (raison) {
        await this.addConversation(uuid, {
          expediteur_type: "createur",
          message: `Refusé: ${raison}`,
          type_message: "negociation",
          metadata: { type: "refus", raison }
        });
      }

      return interesse;
    } catch (error: any) {
      console.error("❌ Error refusing echange interesse:", error);
      throw error;
    }
  },

  async finalizeEchangeInteresse(uuid: string, feedback?: string): Promise<EchangeInteresse> {
    try {
      console.log("🏁 Finalizing echange interesse:", uuid, "feedback:", feedback);

      const updates: EchangeInteresseUpdateData = {
        statut: "finalise",
        date_finalisation: new Date().toISOString()
      };

      const interesse = await this.updateEchangeInteresse(uuid, updates);

      // Enregistrer le feedback
      if (feedback) {
        await this.addConversation(uuid, {
          expediteur_type: "createur",
          message: `Finalisé: ${feedback}`,
          type_message: "generique",
          metadata: { type: "finalisation", feedback }
        });
      }

      return interesse;
    } catch (error: any) {
      console.error("❌ Error finalizing echange interesse:", error);
      throw error;
    }
  },

  async cancelEchangeInteresse(uuid: string, raison?: string): Promise<EchangeInteresse> {
    try {
      console.log("🚫 Cancelling echange interesse:", uuid, "raison:", raison);

      const updates: EchangeInteresseUpdateData = {
        statut: "annule",
        date_annulation: new Date().toISOString()
      };

      const interesse = await this.updateEchangeInteresse(uuid, updates);

      // Enregistrer la raison de l'annulation
      if (raison) {
        await this.addConversation(uuid, {
          expediteur_type: "moderateur",
          message: `Annulé: ${raison}`,
          type_message: "generique",
          metadata: { type: "annulation", raison }
        });
      }

      return interesse;
    } catch (error: any) {
      console.error("❌ Error cancelling echange interesse:", error);
      throw error;
    }
  },

  async setPriority(uuid: string, priorite: "faible" | "moyen" | "elevee" | "urgent"): Promise<EchangeInteresse> {
    try {
      console.log("🎯 Setting priority for echange interesse:", uuid, "to:", priorite);

      const updates: EchangeInteresseUpdateData = { priorite };
      return await this.updateEchangeInteresse(uuid, updates);
    } catch (error: any) {
      console.error("❌ Error setting priority:", error);
      throw error;
    }
  },

  // ==================== Validation ====================

  async validateEchangeInteresse(interesseData: EchangeInteresseCreateData): Promise<EchangeInteresseValidationResult> {
    try {
      console.log("✅ Validating echange interesse data");

      const errors: string[] = [];
      const warnings: string[] = [];
      const suggestions: string[] = [];

      // Validation de base
      if (!interesseData.echange_uuid) {
        errors.push("La référence à l'échange est obligatoire");
      }

      if (!interesseData.mode_echange) {
        errors.push("Le mode d'échange est obligatoire");
      }

      // Validation de l'utilisateur
      if (!interesseData.utilisateur_uuid && !interesseData.utilisateur_nom) {
        errors.push("L'utilisateur doit être identifié (soit par UUID, soit par nom)");
      }

      if (interesseData.utilisateur_email && !this.validateEmail(interesseData.utilisateur_email)) {
        warnings.push("L'adresse email semble invalide");
      }

      if (!interesseData.utilisateur_telephone) {
        warnings.push("Un numéro de téléphone est recommandé pour faciliter la négociation");
      }

      // Validation de l'offre
      if (interesseData.offre_utilisateur) {
        if (!interesseData.offre_utilisateur.description?.trim()) {
          errors.push("La description de l'offre est obligatoire");
        }

        if (interesseData.offre_utilisateur.valeur_estimee && interesseData.offre_utilisateur.valeur_estimee <= 0) {
          warnings.push("La valeur estimée doit être positive");
        }

        if (!interesseData.offre_utilisateur.conditions || interesseData.offre_utilisateur.conditions.length === 0) {
          suggestions.push("Ajoutez des conditions à votre offre");
        }
      }

      // Validation du complément monétaire
      if (interesseData.mode_echange === "avec_complement" && !interesseData.complement_monetaire) {
        errors.push("Le montant du complément monétaire est obligatoire pour ce mode d'échange");
      }

      if (interesseData.complement_monetaire && interesseData.complement_monetaire < 0) {
        errors.push("Le complément monétaire ne peut pas être négatif");
      }

      // Vérification de l'échange
      try {
        const echange = await this.getEchangeDetails(interesseData.echange_uuid);

        if (!echange.actif) {
          errors.push("Cet échange n'est plus disponible");
        }

        if (echange.type_echange === "specifique" && !interesseData.contrepartie_souhaitee) {
          warnings.push("Précisez la contrepartie souhaitée pour cet échange spécifique");
        }
      } catch {
        warnings.push("Impossible de vérifier la disponibilité de l'échange");
      }

      // Vérification de l'utilisateur
      if (interesseData.utilisateur_uuid) {
        try {
          const utilisateur = await this.getUserDetails(interesseData.utilisateur_uuid);
          if (!utilisateur.actif) {
            warnings.push("L'utilisateur n'est pas actif");
          }
        } catch {
          warnings.push("Impossible de vérifier les informations de l'utilisateur");
        }
      }

      // Suggestions
      if (!interesseData.motivation) {
        suggestions.push("Ajoutez une motivation pour augmenter vos chances d'acceptation");
      }

      if (!interesseData.disponibilites || interesseData.disponibilites.length === 0) {
        suggestions.push("Indiquez vos disponibilités pour faciliter la coordination");
      }

      if (!interesseData.lieu_echange_propose) {
        suggestions.push("Proposez un lieu d'échange");
      }

      const isValid = errors.length === 0;

      return {
        isValid,
        errors,
        warnings,
        suggestions,
        offre_validee: !!interesseData.offre_utilisateur,
        utilisateur_existe: !!interesseData.utilisateur_uuid,
        echange_actif: await this.isEchangeActive(interesseData.echange_uuid)
      };
    } catch (error: any) {
      console.error("❌ Error validating echange interesse:", error);
      throw error;
    }
  },

  private validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  private async getEchangeDetails(echangeUuid: string): Promise<{
    actif: boolean;
    type_echange: string;
    statut: string;
  }> {
    try {
      const response = await api.get<ApiResponse<any>>(
        `${API_ENDPOINTS.ECHANGES.LIST}/${echangeUuid}`
      );

      let echangeData: any;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        echangeData = (response.data as any).data;
      } else {
        echangeData = response.data;
      }

      return {
        actif: echangeData?.statut === 'actif' || echangeData?.statut === 'disponible',
        type_echange: echangeData?.type_echange || 'generique',
        statut: echangeData?.statut || 'inconnu'
      };
    } catch {
      return {
        actif: true,
        type_echange: 'generique',
        statut: 'inconnu'
      };
    }
  },

  private async getUserDetails(userUuid: string): Promise<{
    actif: boolean;
    nom: string;
  }> {
    try {
      const response = await api.get<ApiResponse<any>>(`/utilisateurs/${userUuid}`);

      let userData: any;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        userData = (response.data as any).data;
      } else {
        userData = response.data;
      }

      return {
        actif: userData?.est_actif || true,
        nom: userData?.nom || 'Inconnu'
      };
    } catch {
      return {
        actif: true,
        nom: 'Inconnu'
      };
    }
  },

  private async isEchangeActive(echangeUuid: string): Promise<boolean> {
    try {
      const echange = await this.getEchangeDetails(echangeUuid);
      return echange.actif;
    } catch {
      return false;
    }
  },

  // ==================== Conversations ====================

  async getConversations(interesseUuid: string): Promise<EchangeInteresseConversation[]> {
    try {
      console.log("💬 Getting conversations for interesse:", interesseUuid);

      const endpoint = API_ENDPOINTS.ECHANGES.INTERESSES.CONVERSATIONS(interesseUuid);
      const response = await api.get<ApiResponse<EchangeInteresseConversation[]>>(endpoint);

      let conversations: EchangeInteresseConversation[] = [];
      if (Array.isArray(response.data)) {
        conversations = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        conversations = (response.data as any).data || [];
      }

      console.log("✅ Found", conversations.length, "conversations");
      return conversations;
    } catch (error: any) {
      console.error("❌ Error getting conversations:", error);
      throw error;
    }
  },

  async addConversation(interesseUuid: string, conversationData: {
    expediteur_uuid?: string;
    expediteur_type: "createur" | "participant" | "moderateur";
    message: string;
    type_message?: "offre" | "negociation" | "coordination" | "generique";
    fichiers?: Array<{
      nom: string;
      url: string;
      type: string;
      taille: number;
    }>;
  }): Promise<EchangeInteresseConversation> {
    try {
      console.log("💭 Adding conversation to interesse:", interesseUuid);

      const endpoint = API_ENDPOINTS.ECHANGES.INTERESSES.ADD_CONVERSATION(interesseUuid);
      const response = await api.post<ApiResponse<EchangeInteresseConversation>>(
        endpoint,
        conversationData
      );

      let conversation: EchangeInteresseConversation;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        conversation = (response.data as any).data;
      } else {
        conversation = response.data as EchangeInteresseConversation;
      }

      console.log("✅ Conversation added");
      return conversation;
    } catch (error: any) {
      console.error("❌ Error adding conversation:", error);
      throw error;
    }
  },

  async markConversationAsRead(conversationUuid: string): Promise<EchangeInteresseConversation> {
    try {
      console.log("📖 Marking conversation as read:", conversationUuid);

      const endpoint = API_ENDPOINTS.ECHANGES.INTERESSES.MARK_AS_READ(conversationUuid);
      const response = await api.put<ApiResponse<EchangeInteresseConversation>>(endpoint, {});

      let conversation: EchangeInteresseConversation;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        conversation = (response.data as any).data;
      } else {
        conversation = response.data as EchangeInteresseConversation;
      }

      console.log("✅ Conversation marked as read");
      return conversation;
    } catch (error: any) {
      console.error("❌ Error marking conversation as read:", error);
      throw error;
    }
  },

  // ==================== Propositions ====================

  async createProposition(interesseUuid: string, propositionData: {
    offre: {
      description: string;
      valeur_estimee?: number;
      conditions: string[];
      disponibilite: string;
      images?: string[];
      garanties?: string[];
    };
    contrepartie: {
      description: string;
      valeur_estimee?: number;
      conditions: string[];
      delai: string;
    };
    notes_negociation?: string;
  }): Promise<EchangeInteresseProposition> {
    try {
      console.log("📝 Creating proposition for interesse:", interesseUuid);

      const endpoint = API_ENDPOINTS.ECHANGES.INTERESSES.PROPOSITIONS(interesseUuid);
      const response = await api.post<ApiResponse<EchangeInteresseProposition>>(
        endpoint,
        propositionData
      );

      let proposition: EchangeInteresseProposition;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        proposition = (response.data as any).data;
      } else {
        proposition = response.data as EchangeInteresseProposition;
      }

      console.log("✅ Proposition created");
      return proposition;
    } catch (error: any) {
      console.error("❌ Error creating proposition:", error);
      throw error;
    }
  },

  async getPropositions(interesseUuid: string): Promise<EchangeInteresseProposition[]> {
    try {
      console.log("📋 Getting propositions for interesse:", interesseUuid);

      const endpoint = API_ENDPOINTS.ECHANGES.INTERESSES.PROPOSITIONS_LIST(interesseUuid);
      const response = await api.get<ApiResponse<EchangeInteresseProposition[]>>(endpoint);

      let propositions: EchangeInteresseProposition[] = [];
      if (Array.isArray(response.data)) {
        propositions = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        propositions = (response.data as any).data || [];
      }

      console.log("✅ Found", propositions.length, "propositions");
      return propositions;
    } catch (error: any) {
      console.error("❌ Error getting propositions:", error);
      throw error;
    }
  },

  async updatePropositionStatus(propositionUuid: string, statut: "acceptee" | "refusee" | "negociee"): Promise<EchangeInteresseProposition> {
    try {
      console.log("🔄 Updating proposition status:", propositionUuid, "to:", statut);

      const endpoint = API_ENDPOINTS.ECHANGES.INTERESSES.UPDATE_PROPOSITION(propositionUuid);
      const response = await api.put<ApiResponse<EchangeInteresseProposition>>(
        endpoint,
        { statut }
      );

      let proposition: EchangeInteresseProposition;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        proposition = (response.data as any).data;
      } else {
        proposition = response.data as EchangeInteresseProposition;
      }

      console.log("✅ Proposition status updated");
      return proposition;
    } catch (error: any) {
      console.error("❌ Error updating proposition status:", error);
      throw error;
    }
  },

  // ==================== Coordination ====================

  async createCoordination(interesseUuid: string, coordinationData: {
    type: "rendezvous" | "livraison" | "paiement" | "inspection";
    date: string;
    lieu: string;
    participants: string[];
    notes?: string;
  }): Promise<EchangeInteresseCoordination> {
    try {
      console.log("📅 Creating coordination for interesse:", interesseUuid);

      const endpoint = API_ENDPOINTS.ECHANGES.INTERESSES.COORDINATION(interesseUuid);
      const response = await api.post<ApiResponse<EchangeInteresseCoordination>>(
        endpoint,
        coordinationData
      );

      let coordination: EchangeInteresseCoordination;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        coordination = (response.data as any).data;
      } else {
        coordination = response.data as EchangeInteresseCoordination;
      }

      console.log("✅ Coordination created");
      return coordination;
    } catch (error: any) {
      console.error("❌ Error creating coordination:", error);
      throw error;
    }
  },

  async updateCoordinationStatus(coordinationUuid: string, statut: "confirme" | "annule" | "termine"): Promise<EchangeInteresseCoordination> {
    try {
      console.log("🔄 Updating coordination status:", coordinationUuid, "to:", statut);

      const endpoint = API_ENDPOINTS.ECHANGES.INTERESSES.UPDATE_COORDINATION(coordinationUuid);
      const response = await api.put<ApiResponse<EchangeInteresseCoordination>>(
        endpoint,
        { statut }
      );

      let coordination: EchangeInteresseCoordination;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        coordination = (response.data as any).data;
      } else {
        coordination = response.data as EchangeInteresseCoordination;
      }

      console.log("✅ Coordination status updated");
      return coordination;
    } catch (error: any) {
      console.error("❌ Error updating coordination status:", error);
      throw error;
    }
  },

  // ==================== Statistiques ====================

  async getEchangeInteresseStats(filters?: EchangeInteresseFilterParams): Promise<EchangeInteresseStats> {
    try {
      console.log("📊 Fetching echange interesse statistics");

      const endpoint = API_ENDPOINTS.ECHANGES.INTERESSES.STATS;
      const response = await api.get<ApiResponse<EchangeInteresseStats>>(endpoint, {
        params: filters
      });

      // Structure par défaut
      const defaultStats: EchangeInteresseStats = {
        total_interets: 0,
        interets_par_statut: {},
        interets_par_priorite: {},
        interets_par_mois: [],
        taux_conversion: 0,
        taux_acceptation: 0,
        taux_finalisation: 0,
        delai_moyen_traitement: 0,
        top_createurs: [],
        top_participants: [],
        types_echanges_populaires: [],
        metrics: {
          valeur_totale_estimee: 0,
          complement_monetaire_total: 0,
          satisfaction_moyenne: 0,
          delai_reponse_moyen: 0,
          taux_negociation: 0
        }
      };

      let stats = defaultStats;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        stats = { ...defaultStats, ...(response.data as any).data };
      } else if (response.data && typeof response.data === 'object') {
        stats = { ...defaultStats, ...response.data };
      }

      console.log("✅ Echange interesse stats fetched");
      return stats;
    } catch (error: any) {
      console.error("❌ Error fetching echange interesse stats:", error);
      throw error;
    }
  },

  async getEchangeInteresseAnalytics(periode: { debut: string; fin: string }, filters?: EchangeInteresseFilterParams): Promise<EchangeInteresseAnalytics> {
    try {
      console.log("📈 Getting echange interesse analytics");

      const endpoint = API_ENDPOINTS.ECHANGES.INTERESSES.ANALYTICS;
      const response = await api.get<ApiResponse<EchangeInteresseAnalytics>>(endpoint, {
        params: { ...periode, ...filters }
      });

      // Structure par défaut
      const defaultAnalytics: EchangeInteresseAnalytics = {
        periode,
        volume: {
          total: 0,
          par_jour: [],
          par_heure: []
        },
        conversion: {
          taux_contact: 0,
          taux_negociation: 0,
          taux_acceptation: 0,
          taux_finalisation: 0,
          delai_moyen_etapes: {
            expression_contact: 0,
            contact_negociation: 0,
            negociation_acceptation: 0,
            acceptation_finalisation: 0
          }
        },
        utilisateurs: {
          nouveaux_participants: 0,
          participants_actifs: 0,
          taux_retention: 0,
          satisfaction_moyenne: 0
        },
        geographie: {
          top_villes: [],
          top_pays: [],
          distribution_geographique: {}
        },
        tendances: {
          types_populaires: [],
          horaires_populaires: [],
          jours_populaires: []
        },
        economique: {
          valeur_moyenne_offre: 0,
          complement_moyen: 0,
          taux_complement: 0
        }
      };

      let analytics = defaultAnalytics;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        analytics = { ...defaultAnalytics, ...(response.data as any).data };
      } else if (response.data && typeof response.data === 'object') {
        analytics = { ...defaultAnalytics, ...response.data };
      }

      console.log("✅ Echange interesse analytics fetched");
      return analytics;
    } catch (error: any) {
      console.error("❌ Error getting echange interesse analytics:", error);
      throw error;
    }
  },

  // ==================== Notifications et Rappels ====================

  async sendNotification(interesseUuid: string, notificationData: {
    type: "nouvel_interet" | "nouvelle_offre" | "contre_offre" | "acceptation" | "refus" | "rendezvous" | "rappel" | "finalisation";
    destinataire_uuid: string;
    destinataire_type: string;
    sujet: string;
    contenu: string;
    methode?: "email" | "sms" | "push" | "in_app";
  }): Promise<EchangeInteresseNotification> {
    try {
      console.log("🔔 Sending notification for interesse:", interesseUuid);

      const endpoint = API_ENDPOINTS.ECHANGES.INTERESSES.NOTIFICATIONS(interesseUuid);
      const response = await api.post<ApiResponse<EchangeInteresseNotification>>(
        endpoint,
        notificationData
      );

      let notification: EchangeInteresseNotification;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        notification = (response.data as any).data;
      } else {
        notification = response.data as EchangeInteresseNotification;
      }

      console.log("✅ Notification sent");
      return notification;
    } catch (error: any) {
      console.error("❌ Error sending notification:", error);
      throw error;
    }
  },

  async createRappel(interesseUuid: string, rappelData: {
    type: "premier_contact" | "reponse_offre" | "rendezvous" | "feedback" | "relance_negociation";
    date_rappel: string;
    notes?: string;
  }): Promise<EchangeInteresseRappel> {
    try {
      console.log("⏰ Creating rappel for interesse:", interesseUuid);

      const endpoint = API_ENDPOINTS.ECHANGES.INTERESSES.RAPPELS(interesseUuid);
      const response = await api.post<ApiResponse<EchangeInteresseRappel>>(
        endpoint,
        rappelData
      );

      let rappel: EchangeInteresseRappel;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        rappel = (response.data as any).data;
      } else {
        rappel = response.data as EchangeInteresseRappel;
      }

      console.log("✅ Rappel created");
      return rappel;
    } catch (error: any) {
      console.error("❌ Error creating rappel:", error);
      throw error;
    }
  },

  async sendRappel(rappelUuid: string): Promise<EchangeInteresseRappel> {
    try {
      console.log("⏰ Sending rappel:", rappelUuid);

      const endpoint = API_ENDPOINTS.ECHANGES.INTERESSES.SEND_RAPPEL(rappelUuid);
      const response = await api.post<ApiResponse<EchangeInteresseRappel>>(endpoint, {});

      let rappel: EchangeInteresseRappel;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        rappel = (response.data as any).data;
      } else {
        rappel = response.data as EchangeInteresseRappel;
      }

      console.log("✅ Rappel sent");
      return rappel;
    } catch (error: any) {
      console.error("❌ Error sending rappel:", error);
      throw error;
    }
  },

  // ==================== Feedback ====================

  async submitFeedback(interesseUuid: string, feedbackData: {
    evaluateur_uuid: string;
    evaluateur_type: "createur" | "participant";
    note: number;
    commentaire: string;
    aspects?: {
      ponctualite?: number;
      communication?: number;
      qualite_objet?: number;
      respect_accords?: number;
      flexibilite?: number;
    };
    recommandation: boolean;
    tags?: string[];
  }): Promise<EchangeInteresseFeedback> {
    try {
      console.log("⭐ Submitting feedback for interesse:", interesseUuid);

      const endpoint = API_ENDPOINTS.ECHANGES.INTERESSES.FEEDBACK(interesseUuid);
      const response = await api.post<ApiResponse<EchangeInteresseFeedback>>(
        endpoint,
        feedbackData
      );

      let feedback: EchangeInteresseFeedback;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        feedback = (response.data as any).data;
      } else {
        feedback = response.data as EchangeInteresseFeedback;
      }

      console.log("✅ Feedback submitted");
      return feedback;
    } catch (error: any) {
      console.error("❌ Error submitting feedback:", error);
      throw error;
    }
  },

  async getFeedback(interesseUuid: string): Promise<EchangeInteresseFeedback[]> {
    try {
      console.log("📝 Getting feedback for interesse:", interesseUuid);

      const endpoint = API_ENDPOINTS.ECHANGES.INTERESSES.FEEDBACK_LIST(interesseUuid);
      const response = await api.get<ApiResponse<EchangeInteresseFeedback[]>>(endpoint);

      let feedbacks: EchangeInteresseFeedback[] = [];
      if (Array.isArray(response.data)) {
        feedbacks = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        feedbacks = (response.data as any).data || [];
      }

      console.log("✅ Found", feedbacks.length, "feedbacks");
      return feedbacks;
    } catch (error: any) {
      console.error("❌ Error getting feedback:", error);
      throw error;
    }
  },

  // ==================== Vérification ====================

  async verifyEchangeInteresse(uuid: string, verificateurUuid: string, notes?: string): Promise<EchangeInteresse> {
    try {
      console.log("✅ Verifying echange interesse:", uuid);

      const updates: EchangeInteresseUpdateData = {
        est_verifie: true,
        verification_notes: notes,
        verifie_par: verificateurUuid,
        date_verification: new Date().toISOString()
      };

      return await this.updateEchangeInteresse(uuid, updates);
    } catch (error: any) {
      console.error("❌ Error verifying echange interesse:", error);
      throw error;
    }
  },

  async requestVerification(interesseUuid: string, verificationData: {
    type_verification: "identite" | "offre" | "capacite" | "complet";
    documents?: Array<{
      type: string;
      url: string;
      nom: string;
    }>;
    notes?: string;
  }): Promise<EchangeInteresseVerificationRequest> {
    try {
      console.log("🔍 Requesting verification for interesse:", interesseUuid);

      const endpoint = API_ENDPOINTS.ECHANGES.INTERESSES.VERIFICATION_REQUESTS(interesseUuid);
      const response = await api.post<ApiResponse<EchangeInteresseVerificationRequest>>(
        endpoint,
        verificationData
      );

      let request: EchangeInteresseVerificationRequest;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        request = (response.data as any).data;
      } else {
        request = response.data as EchangeInteresseVerificationRequest;
      }

      console.log("✅ Verification request created");
      return request;
    } catch (error: any) {
      console.error("❌ Error requesting verification:", error);
      throw error;
    }
  },

  // ==================== Batch Operations ====================

  async bulkUpdateEchangeInteresses(bulkUpdate: EchangeInteresseBulkUpdate): Promise<EchangeInteresse[]> {
    try {
      console.log("🔄 Bulk updating", bulkUpdate.uuids.length, "echange interesses");

      const endpoint = API_ENDPOINTS.ECHANGES.INTERESSES.BULK_UPDATE;
      const response = await api.post<ApiResponse<EchangeInteresse[]>>(endpoint, bulkUpdate);

      let updatedInteresses: EchangeInteresse[] = [];
      if (Array.isArray(response.data)) {
        updatedInteresses = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        updatedInteresses = (response.data as any).data || [];
      }

      console.log("✅ Echange interesses bulk updated:", updatedInteresses.length);
      return updatedInteresses;
    } catch (error: any) {
      console.error("❌ Error bulk updating echange interesses:", error);
      throw error;
    }
  },

  async bulkDeleteEchangeInteresses(uuids: string[]): Promise<{ deleted: number; errors: string[] }> {
    try {
      console.log("🗑️ Bulk deleting", uuids.length, "echange interesses");

      const endpoint = API_ENDPOINTS.ECHANGES.INTERESSES.BULK_DELETE;
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

      console.log("✅ Echange interesses bulk deleted:", result.deleted, "errors:", result.errors.length);
      return result;
    } catch (error: any) {
      console.error("❌ Error bulk deleting echange interesses:", error);
      throw error;
    }
  },

  async bulkContactEchangeInteresses(uuids: string[]): Promise<EchangeInteresse[]> {
    try {
      console.log("📞 Bulk contacting", uuids.length, "echange interesses");

      const updates: EchangeInteresseUpdateData = {
        statut: "contacte",
        date_contact: new Date().toISOString()
      };
      const result = await this.bulkUpdateEchangeInteresses({ uuids, updates });

      console.log("✅ Echange interesses bulk contacted:", result.length);
      return result;
    } catch (error: any) {
      console.error("❌ Error bulk contacting echange interesses:", error);
      throw error;
    }
  },

  // ==================== Matching Automatique ====================

  async getMatchSuggestions(interesseUuid: string): Promise<EchangeInteresseMatchSuggestion[]> {
    try {
      console.log("💡 Getting match suggestions for interesse:", interesseUuid);

      const endpoint = API_ENDPOINTS.ECHANGES.INTERESSES.MATCH_SUGGESTIONS(interesseUuid);
      const response = await api.get<ApiResponse<EchangeInteresseMatchSuggestion[]>>(endpoint);

      let suggestions: EchangeInteresseMatchSuggestion[] = [];
      if (Array.isArray(response.data)) {
        suggestions = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        suggestions = (response.data as any).data || [];
      }

      console.log("✅ Found", suggestions.length, "match suggestions");
      return suggestions;
    } catch (error: any) {
      console.error("❌ Error getting match suggestions:", error);
      throw error;
    }
  },

  async findAutoMatches(interesseUuid: string): Promise<EchangeInteresseAutoMatch[]> {
    try {
      console.log("🔍 Finding auto matches for interesse:", interesseUuid);

      const endpoint = API_ENDPOINTS.ECHANGES.INTERESSES.AUTO_MATCHES(interesseUuid);
      const response = await api.get<ApiResponse<EchangeInteresseAutoMatch[]>>(endpoint);

      let matches: EchangeInteresseAutoMatch[] = [];
      if (Array.isArray(response.data)) {
        matches = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        matches = (response.data as any).data || [];
      }

      console.log("✅ Found", matches.length, "auto matches");
      return matches;
    } catch (error: any) {
      console.error("❌ Error finding auto matches:", error);
      throw error;
    }
  },

  // ==================== Groupes ====================

  async createGroup(groupData: Omit<EchangeInteresseGroup, 'uuid' | 'created_at' | 'updated_at'>): Promise<EchangeInteresseGroup> {
    try {
      console.log("👥 Creating echange interesse group:", groupData.nom);

      const endpoint = API_ENDPOINTS.ECHANGES.INTERESSES.GROUPS;
      const response = await api.post<ApiResponse<EchangeInteresseGroup>>(endpoint, groupData);

      let group: EchangeInteresseGroup;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        group = (response.data as any).data;
      } else {
        group = response.data as EchangeInteresseGroup;
      }

      console.log("✅ Group created");
      return group;
    } catch (error: any) {
      console.error("❌ Error creating group:", error);
      throw error;
    }
  },

  async addToGroup(groupUuid: string, interesseUuid: string, role: "membre" | "moderateur" = "membre"): Promise<EchangeInteresseGroup> {
    try {
      console.log("➕ Adding interesse to group:", interesseUuid, "group:", groupUuid);

      const endpoint = API_ENDPOINTS.ECHANGES.INTERESSES.ADD_TO_GROUP(groupUuid);
      const response = await api.post<ApiResponse<EchangeInteresseGroup>>(
        endpoint,
        { interesse_uuid: interesseUuid, role }
      );

      let group: EchangeInteresseGroup;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        group = (response.data as any).data;
      } else {
        group = response.data as EchangeInteresseGroup;
      }

      console.log("✅ Added to group");
      return group;
    } catch (error: any) {
      console.error("❌ Error adding to group:", error);
      throw error;
    }
  },

  // ==================== Export ====================

  async exportEchangeInteresses(options: EchangeInteresseExportOptions): Promise<Blob> {
    try {
      console.log("📤 Exporting echange interesses in", options.format, "format");

      const endpoint = API_ENDPOINTS.ECHANGES.INTERESSES.EXPORT;
      const response = await api.post(
        endpoint,
        options,
        { responseType: "blob" }
      );

      console.log("✅ Echange interesses exported successfully");
      return response;
    } catch (error: any) {
      console.error("❌ Error exporting echange interesses:", error);
      throw error;
    }
  },

  // ==================== Audit ====================

  async getAuditLog(interesseUuid: string): Promise<EchangeInteresseAuditLog[]> {
    try {
      console.log("📜 Getting audit log for interesse:", interesseUuid);

      const endpoint = API_ENDPOINTS.ECHANGES.INTERESSES.AUDIT(interesseUuid);
      const response = await api.get<ApiResponse<EchangeInteresseAuditLog[]>>(endpoint);

      let auditLog: EchangeInteresseAuditLog[] = [];
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

  async getEchangeInteresseWithDetails(uuid: string): Promise<EchangeInteresseWithDetails> {
    try {
      console.log("🔍 Getting echange interesse with details:", uuid);

      const [interesse, conversations, propositions, feedback] = await Promise.all([
        this.getEchangeInteresse(uuid),
        this.getConversations(uuid),
        this.getPropositions(uuid).catch(() => []),
        this.getFeedback(uuid).catch(() => [])
      ]);

      const interesseWithDetails: EchangeInteresseWithDetails = {
        ...interesse,
        conversations,
        propositions,
        metadata: {
          ...interesse.metadata,
          propositions_count: propositions.length,
          feedback_count: feedback.length
        }
      };

      console.log("✅ Echange interesse with details fetched");
      return interesseWithDetails;
    } catch (error: any) {
      console.error("❌ Error getting echange interesse with details:", error);
      throw error;
    }
  },

  async searchEchangeInteresses(searchTerm: string, filters?: EchangeInteresseFilterParams): Promise<{ interets: EchangeInteresse[]; count: number }> {
    try {
      console.log("🔍 Searching echange interesses for:", searchTerm);

      const { interets, count } = await this.getEchangeInteresses({
        search: searchTerm,
        filters
      });

      console.log("✅ Found", interets.length, "echange interesses matching search");
      return { interets, count: count || interets.length };
    } catch (error: any) {
      console.error("❌ Error searching echange interesses:", error);
      throw error;
    }
  },

  async evaluateOffer(offre: any, contrepartie: any): Promise<{
    equitable: boolean;
    ratio: number;
    suggestions: string[];
    risques: string[];
  }> {
    try {
      console.log("⚖️ Evaluating offer");

      const valeurOffre = offre.valeur_estimee || 100;
      const valeurContrepartie = contrepartie.valeur_estimee || 100;
      const ratio = valeurOffre / valeurContrepartie;

      const equitable = ratio >= 0.8 && ratio <= 1.2;

      const suggestions: string[] = [];
      const risques: string[] = [];

      if (ratio < 0.8) {
        suggestions.push(`L'offre semble sous-évaluée (ratio: ${ratio.toFixed(2)})`);
        risques.push("Risque de refus du créateur");
      } else if (ratio > 1.2) {
        suggestions.push(`L'offre semble sur-évaluée (ratio: ${ratio.toFixed(2)})`);
        risques.push("Risque de non-satisfaction du participant");
      }

      if (!offre.conditions || offre.conditions.length === 0) {
        suggestions.push("Ajoutez des conditions à votre offre");
        risques.push("Manque de clarté sur les termes");
      }

      if (!contrepartie.delai) {
        suggestions.push("Précisez un délai pour la contrepartie");
      }

      return {
        equitable,
        ratio,
        suggestions,
        risques
      };
    } catch (error: any) {
      console.error("❌ Error evaluating offer:", error);
      throw error;
    }
  },

  async getStatsByEchange(echangeUuid: string): Promise<{
    total_interets: number;
    interets_par_statut: Record<string, number>;
    valeur_moyenne_offre: number;
    complement_moyen: number;
    taux_acceptation: number;
    delai_moyen_reponse: number;
  }> {
    try {
      console.log("📈 Getting stats by echange:", echangeUuid);

      const { interets } = await this.getEchangeInteressesByEchange(echangeUuid);

      const stats = {
        total_interets: interets.length,
        interets_par_statut: {},
        valeur_moyenne_offre: 0,
        complement_moyen: 0,
        taux_acceptation: 0,
        delai_moyen_reponse: 0
      };

      let totalValeurOffre = 0;
      let totalComplement = 0;
      let interetsAvecOffre = 0;
      let interetsAvecComplement = 0;

      // Calculer les statistiques
      interets.forEach(interet => {
        // Par statut
        stats.interets_par_statut[interet.statut] = (stats.interets_par_statut[interet.statut] || 0) + 1;

        // Valeurs d'offre
        if (interet.offre_utilisateur?.valeur_estimee) {
          totalValeurOffre += interet.offre_utilisateur.valeur_estimee;
          interetsAvecOffre++;
        }

        // Complément monétaire
        if (interet.complement_monetaire) {
          totalComplement += interet.complement_monetaire;
          interetsAvecComplement++;
        }
      });

      // Moyennes
      stats.valeur_moyenne_offre = interetsAvecOffre > 0 ? totalValeurOffre / interetsAvecOffre : 0;
      stats.complement_moyen = interetsAvecComplement > 0 ? totalComplement / interetsAvecComplement : 0;

      // Taux d'acceptation
      const interetsAcceptes = interets.filter(i =>
        i.statut === "accepte" || i.statut === "finalise"
      ).length;
      stats.taux_acceptation = interets.length > 0 ? (interetsAcceptes / interets.length) * 100 : 0;

      console.log("✅ Stats by echange calculated");
      return stats;
    } catch (error: any) {
      console.error("❌ Error getting stats by echange:", error);
      throw error;
    }
  },

  // ==================== Debug ====================

  async testEchangeInteresseService(): Promise<boolean> {
    try {
      console.log("🧪 Testing echange interesse service...");

      await this.getEchangeInteresses({ limit: 1 });

      console.log("✅ Echange interesse service is operational");
      return true;
    } catch (error: any) {
      console.error("❌ Echange interesse service test failed:", error.message);
      return false;
    }
  },

  async ping(): Promise<{ status: string; timestamp: string }> {
    try {
      console.log("🏓 Pinging echange interesse service...");

      await this.getEchangeInteresses({ limit: 1 });

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
