// services/dons/don-interesse.service.ts
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import type {
  DonInteresse,
  DonInteresseCreateData,
  DonInteresseUpdateData,
  DonInteresseFilterParams,
  DonInteressePaginationParams,
  DonInteresseStats,
  DonInteresseValidationResult,
  DonInteresseBulkUpdate,
  DonInteresseWithDetails,
  DonInteresseConversation,
  DonInteresseNotification,
  DonInteresseRappel,
  DonInteresseFeedback,
  DonInteresseExportOptions,
  DonInteresseAnalytics,
  DonInteresseMatchSuggestion,
  DonInteresseAutoMatch,
  DonInteresseGroup,
  DonInteresseAuditLog,
  DonInteresseVerificationRequest
} from "./don-interesse.types";

export interface ApiResponse<T> {
  data: T;
  status: string;
  message?: string;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
}

export const donInteresseService = {
  // ==================== CRUD Operations ====================

  async getDonInteresses(params?: DonInteressePaginationParams): Promise<{ interets: DonInteresse[]; count?: number; total?: number; page?: number; pages?: number }> {
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
      if (filters.don_uuid) queryParams.append("don_uuid", filters.don_uuid);
      if (filters.utilisateur_uuid) queryParams.append("utilisateur_uuid", filters.utilisateur_uuid);
      if (filters.utilisateur_type) queryParams.append("utilisateur_type", filters.utilisateur_type);
      if (filters.donateur_uuid) queryParams.append("donateur_uuid", filters.donateur_uuid);
      if (filters.donateur_type) queryParams.append("donateur_type", filters.donateur_type);
      if (filters.statut) queryParams.append("statut", filters.statut);
      if (filters.priorite) queryParams.append("priorite", filters.priorite);
      if (filters.date_debut) queryParams.append("date_debut", filters.date_debut);
      if (filters.date_fin) queryParams.append("date_fin", filters.date_fin);
      if (filters.ville) queryParams.append("ville", filters.ville);
      if (filters.pays) queryParams.append("pays", filters.pays);
      if (filters.est_verifie !== undefined) queryParams.append("est_verifie", filters.est_verifie.toString());
      if (filters.has_rendezvous !== undefined) queryParams.append("has_rendezvous", filters.has_rendezvous.toString());
      if (filters.has_conversation !== undefined) queryParams.append("has_conversation", filters.has_conversation.toString());
      if (filters.quantite_min !== undefined) queryParams.append("quantite_min", filters.quantite_min.toString());
      if (filters.quantite_max !== undefined) queryParams.append("quantite_max", filters.quantite_max.toString());
      if (filters.mode_livraison) queryParams.append("mode_livraison", filters.mode_livraison);
      if (filters.mode_contact) queryParams.append("mode_contact", filters.mode_contact);
      if (filters.besoin_verification !== undefined) queryParams.append("besoin_verification", filters.besoin_verification.toString());
      if (filters.besoin_rappel !== undefined) queryParams.append("besoin_rappel", filters.besoin_rappel.toString());
      if (filters.expire_soon !== undefined) queryParams.append("expire_soon", filters.expire_soon.toString());

      if (filters.tags && filters.tags.length > 0) {
        queryParams.append("tags", filters.tags.join(","));
      }
    }

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/dons/interesses?${queryString}`
      : "/dons/interesses";

    console.log("📡 Fetching don interesses from:", endpoint);

    try {
      const response = await api.get<ApiResponse<DonInteresse[]>>(endpoint);

      console.log("✅ Don interesses response received:", {
        hasData: !!response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
      });

      let interets: DonInteresse[] = [];
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
      console.error("🚨 Error in donInteresseService.getDonInteresses:", {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  async getDonInteresse(uuid: string): Promise<DonInteresse> {
    try {
      console.log("🔍 Fetching don interesse:", uuid);

      const response = await api.get<ApiResponse<DonInteresse>>(`/dons/interesses/${uuid}`);

      console.log("✅ Don interesse response:", {
        hasData: !!response.data,
        dataType: typeof response.data,
      });

      let interesseData: DonInteresse;

      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        interesseData = (response.data as any).data;
      } else if (response.data && (response.data as any).uuid) {
        interesseData = response.data as DonInteresse;
      } else {
        console.error("❌ Invalid don interesse data structure:", response.data);
        throw new Error("Structure de données don interesse invalide");
      }

      if (!interesseData || !interesseData.uuid) {
        throw new Error("Don interesse non trouvé");
      }

      console.log("✅ Don interesse found");
      return interesseData;
    } catch (error: any) {
      console.error("❌ Error fetching don interesse:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  async createDonInteresse(interesseData: DonInteresseCreateData): Promise<DonInteresse> {
    try {
      console.log("🆕 Creating don interesse for don:", interesseData.don_uuid);

      // Valider les données avant envoi
      const validation = await this.validateDonInteresse(interesseData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const response = await api.post<ApiResponse<DonInteresse>>(
        "/dons/interesses",
        interesseData,
      );

      console.log("✅ Don interesse creation response:", response.data);

      let createdInteresse: DonInteresse;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        createdInteresse = (response.data as any).data;
      } else {
        createdInteresse = response.data as DonInteresse;
      }

      if (!createdInteresse || !createdInteresse.uuid) {
        throw new Error("Échec de la création du don interesse");
      }

      return createdInteresse;
    } catch (error: any) {
      console.error("❌ Error creating don interesse:", {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  async updateDonInteresse(uuid: string, interesseData: DonInteresseUpdateData): Promise<DonInteresse> {
    try {
      console.log("✏️ Updating don interesse:", uuid);

      const response = await api.put<ApiResponse<DonInteresse>>(
        `/dons/interesses/${uuid}`,
        interesseData,
      );

      console.log("✅ Don interesse update response:", response.data);

      let updatedInteresse: DonInteresse;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        updatedInteresse = (response.data as any).data;
      } else {
        updatedInteresse = response.data as DonInteresse;
      }

      return updatedInteresse;
    } catch (error: any) {
      console.error("❌ Error updating don interesse:", error);
      throw error;
    }
  },

  async deleteDonInteresse(uuid: string): Promise<void> {
    try {
      console.log("🗑️ Deleting don interesse:", uuid);

      await api.delete(`/dons/interesses/${uuid}`);

      console.log("✅ Don interesse deleted successfully");
    } catch (error: any) {
      console.error("❌ Error deleting don interesse:", error);
      throw error;
    }
  },

  // ==================== Intérêts Spécialisés ====================

  async getDonInteressesByDon(donUuid: string, params?: DonInteressePaginationParams): Promise<{ interets: DonInteresse[]; count: number }> {
    try {
      console.log("🎁 Getting interesses for don:", donUuid);

      const { interets, count } = await this.getDonInteresses({
        ...params,
        filters: { don_uuid: donUuid }
      });

      console.log("✅ Found", interets.length, "interesses for don");
      return { interets, count: count || interets.length };
    } catch (error: any) {
      console.error("❌ Error getting interesses by don:", error);
      throw error;
    }
  },

  async getDonInteressesByUser(userUuid: string, params?: DonInteressePaginationParams): Promise<{ interets: DonInteresse[]; count: number }> {
    try {
      console.log("👤 Getting user interesses:", userUuid);

      const { interets, count } = await this.getDonInteresses({
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

  async getDonInteressesByDonateur(donateurUuid: string, params?: DonInteressePaginationParams): Promise<{ interets: DonInteresse[]; count: number }> {
    try {
      console.log("🤲 Getting donateur interesses:", donateurUuid);

      const { interets, count } = await this.getDonInteresses({
        ...params,
        filters: { donateur_uuid: donateurUuid }
      });

      console.log("✅ Found", interets.length, "interesses for donateur");
      return { interets, count: count || interets.length };
    } catch (error: any) {
      console.error("❌ Error getting interesses by donateur:", error);
      throw error;
    }
  },

  async getPendingDonInteresses(donUuid?: string): Promise<DonInteresse[]> {
    try {
      console.log("⏳ Getting pending interesses");

      const filters: DonInteresseFilterParams = { statut: "en_attente" };
      if (donUuid) {
        filters.don_uuid = donUuid;
      }

      const { interets } = await this.getDonInteresses({
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

  async getUrgentDonInteresses(): Promise<DonInteresse[]> {
    try {
      console.log("🚨 Getting urgent interesses");

      const { interets } = await this.getDonInteresses({
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

  async getNeedVerificationDonInteresses(): Promise<DonInteresse[]> {
    try {
      console.log("🔍 Getting interesses needing verification");

      const { interets } = await this.getDonInteresses({
        filters: {
          besoin_verification: true,
          est_verifie: false
        },
        sort_by: "date_expression_interet",
        sort_order: "asc"
      });

      console.log("✅ Found", interets.length, "interesses needing verification");
      return interets;
    } catch (error: any) {
      console.error("❌ Error getting interesses needing verification:", error);
      throw error;
    }
  },

  // ==================== Gestion des Statuts ====================

  async confirmDonInteresse(uuid: string): Promise<DonInteresse> {
    try {
      console.log("✅ Confirming don interesse:", uuid);

      const updates: DonInteresseUpdateData = {
        statut: "confirme"
      };

      return await this.updateDonInteresse(uuid, updates);
    } catch (error: any) {
      console.error("❌ Error confirming don interesse:", error);
      throw error;
    }
  },

  async acceptDonInteresse(uuid: string, quantiteAcceptee?: number): Promise<DonInteresse> {
    try {
      console.log("🤝 Accepting don interesse:", uuid, "quantite:", quantiteAcceptee);

      const updates: DonInteresseUpdateData = {
        statut: "accepte",
        quantite_acceptee: quantiteAcceptee,
        date_acceptation: new Date().toISOString()
      };

      return await this.updateDonInteresse(uuid, updates);
    } catch (error: any) {
      console.error("❌ Error accepting don interesse:", error);
      throw error;
    }
  },

  async refuseDonInteresse(uuid: string, raison?: string): Promise<DonInteresse> {
    try {
      console.log("❌ Refusing don interesse:", uuid, "raison:", raison);

      const updates: DonInteresseUpdateData = {
        statut: "refuse"
      };

      const interesse = await this.updateDonInteresse(uuid, updates);

      // Enregistrer la raison du refus
      if (raison) {
        await this.addConversation(uuid, {
          expediteur_type: "moderateur",
          message: `Refusé: ${raison}`,
          metadata: { type: "refus", raison }
        });
      }

      return interesse;
    } catch (error: any) {
      console.error("❌ Error refusing don interesse:", error);
      throw error;
    }
  },

  async completeDonInteresse(uuid: string, quantiteRecue?: number): Promise<DonInteresse> {
    try {
      console.log("🎯 Completing don interesse:", uuid, "quantite recue:", quantiteRecue);

      const updates: DonInteresseUpdateData = {
        statut: "complete",
        quantite_recue: quantiteRecue,
        date_completion: new Date().toISOString()
      };

      return await this.updateDonInteresse(uuid, updates);
    } catch (error: any) {
      console.error("❌ Error completing don interesse:", error);
      throw error;
    }
  },

  async cancelDonInteresse(uuid: string, raison?: string): Promise<DonInteresse> {
    try {
      console.log("🚫 Cancelling don interesse:", uuid, "raison:", raison);

      const updates: DonInteresseUpdateData = {
        statut: "annule",
        date_annulation: new Date().toISOString()
      };

      const interesse = await this.updateDonInteresse(uuid, updates);

      // Enregistrer la raison de l'annulation
      if (raison) {
        await this.addConversation(uuid, {
          expediteur_type: "moderateur",
          message: `Annulé: ${raison}`,
          metadata: { type: "annulation", raison }
        });
      }

      return interesse;
    } catch (error: any) {
      console.error("❌ Error cancelling don interesse:", error);
      throw error;
    }
  },

  async setPriority(uuid: string, priorite: "faible" | "moyen" | "elevee" | "urgent"): Promise<DonInteresse> {
    try {
      console.log("🎯 Setting priority for don interesse:", uuid, "to:", priorite);

      const updates: DonInteresseUpdateData = { priorite };
      return await this.updateDonInteresse(uuid, updates);
    } catch (error: any) {
      console.error("❌ Error setting priority:", error);
      throw error;
    }
  },

  // ==================== Validation ====================

  async validateDonInteresse(interesseData: DonInteresseCreateData): Promise<DonInteresseValidationResult> {
    try {
      console.log("✅ Validating don interesse data");

      const errors: string[] = [];
      const warnings: string[] = [];
      const suggestions: string[] = [];

      // Validation de base
      if (!interesseData.don_uuid) {
        errors.push("La référence au don est obligatoire");
      }

      if (!interesseData.quantite_demandee || interesseData.quantite_demandee <= 0) {
        errors.push("La quantité demandée doit être supérieure à 0");
      }

      // Validation de l'utilisateur
      if (!interesseData.utilisateur_uuid && !interesseData.utilisateur_nom) {
        errors.push("L'utilisateur doit être identifié (soit par UUID, soit par nom)");
      }

      if (interesseData.utilisateur_email && !this.validateEmail(interesseData.utilisateur_email)) {
        warnings.push("L'adresse email semble invalide");
      }

      if (!interesseData.utilisateur_telephone) {
        warnings.push("Un numéro de téléphone est recommandé pour faciliter le contact");
      }

      // Vérification de la disponibilité du don
      try {
        const don = await this.getDonDetails(interesseData.don_uuid);

        if (!don.actif) {
          errors.push("Ce don n'est plus disponible");
        }

        if (don.quantite_disponible < interesseData.quantite_demandee) {
          errors.push(`Quantité demandée (${interesseData.quantite_demandee}) supérieure à la quantité disponible (${don.quantite_disponible})`);
        }

        if (don.quantite_disponible > 0) {
          suggestions.push(`Il reste ${don.quantite_disponible} unités disponibles`);
        }
      } catch {
        warnings.push("Impossible de vérifier la disponibilité du don");
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
        suggestions.push("Indiquez vos disponibilités pour faciliter la prise de rendez-vous");
      }

      if (!interesseData.mode_livraison_prefere) {
        suggestions.push("Spécifiez votre mode de livraison préféré");
      }

      const isValid = errors.length === 0;

      return {
        isValid,
        errors,
        warnings,
        suggestions,
        quantite_disponible: await this.getDonQuantityAvailable(interesseData.don_uuid),
        utilisateur_existe: !!interesseData.utilisateur_uuid,
        don_actif: await this.isDonActive(interesseData.don_uuid)
      };
    } catch (error: any) {
      console.error("❌ Error validating don interesse:", error);
      throw error;
    }
  },

  private validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  private async getDonDetails(donUuid: string): Promise<{
    actif: boolean;
    quantite_disponible: number;
    statut: string;
  }> {
    try {
      const response = await api.get<ApiResponse<any>>(`/dons/${donUuid}`);

      let donData: any;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        donData = (response.data as any).data;
      } else {
        donData = response.data;
      }

      return {
        actif: donData?.statut === 'actif' || donData?.statut === 'disponible',
        quantite_disponible: donData?.quantite_disponible || 0,
        statut: donData?.statut || 'inconnu'
      };
    } catch {
      return {
        actif: true,
        quantite_disponible: 999,
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

  private async getDonQuantityAvailable(donUuid: string): Promise<number> {
    try {
      const don = await this.getDonDetails(donUuid);
      return don.quantite_disponible;
    } catch {
      return 0;
    }
  },

  private async isDonActive(donUuid: string): Promise<boolean> {
    try {
      const don = await this.getDonDetails(donUuid);
      return don.actif;
    } catch {
      return false;
    }
  },

  // ==================== Conversations ====================

  async getConversations(interesseUuid: string): Promise<DonInteresseConversation[]> {
    try {
      console.log("💬 Getting conversations for interesse:", interesseUuid);

      const endpoint = `/dons/interesses/${interesseUuid}/conversations`;
      const response = await api.get<ApiResponse<DonInteresseConversation[]>>(endpoint);

      let conversations: DonInteresseConversation[] = [];
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
    expediteur_type: "donateur" | "beneficiaire" | "moderateur";
    message: string;
    fichiers?: Array<{
      nom: string;
      url: string;
      type: string;
      taille: number;
    }>;
  }): Promise<DonInteresseConversation> {
    try {
      console.log("💭 Adding conversation to interesse:", interesseUuid);

      const endpoint = `/dons/interesses/${interesseUuid}/conversations`;
      const response = await api.post<ApiResponse<DonInteresseConversation>>(
        endpoint,
        conversationData
      );

      let conversation: DonInteresseConversation;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        conversation = (response.data as any).data;
      } else {
        conversation = response.data as DonInteresseConversation;
      }

      console.log("✅ Conversation added");
      return conversation;
    } catch (error: any) {
      console.error("❌ Error adding conversation:", error);
      throw error;
    }
  },

  async markConversationAsRead(conversationUuid: string): Promise<DonInteresseConversation> {
    try {
      console.log("📖 Marking conversation as read:", conversationUuid);

      const endpoint = `/dons/interesses/conversations/${conversationUuid}/read`;
      const response = await api.put<ApiResponse<DonInteresseConversation>>(endpoint, {});

      let conversation: DonInteresseConversation;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        conversation = (response.data as any).data;
      } else {
        conversation = response.data as DonInteresseConversation;
      }

      console.log("✅ Conversation marked as read");
      return conversation;
    } catch (error: any) {
      console.error("❌ Error marking conversation as read:", error);
      throw error;
    }
  },

  // ==================== Rendez-vous ====================

  async proposeRendezVous(interesseUuid: string, rendezVousData: {
    date: string;
    lieu: string;
    notes?: string;
  }): Promise<DonInteresse> {
    try {
      console.log("📅 Proposing rendez-vous for interesse:", interesseUuid);

      const updates: DonInteresseUpdateData = {
        date_rendezvous_proposee: rendezVousData.date,
        lieu_rendezvous: rendezVousData.lieu
      };

      const interesse = await this.updateDonInteresse(interesseUuid, updates);

      // Ajouter une conversation
      await this.addConversation(interesseUuid, {
        expediteur_type: "donateur",
        message: `Rendez-vous proposé: ${rendezVousData.date} à ${rendezVousData.lieu}${rendezVousData.notes ? ` - ${rendezVousData.notes}` : ''}`
      });

      return interesse;
    } catch (error: any) {
      console.error("❌ Error proposing rendez-vous:", error);
      throw error;
    }
  },

  async confirmRendezVous(interesseUuid: string): Promise<DonInteresse> {
    try {
      console.log("✅ Confirming rendez-vous for interesse:", interesseUuid);

      const updates: DonInteresseUpdateData = {
        date_rendezvous_confirmee: new Date().toISOString()
      };

      const interesse = await this.updateDonInteresse(interesseUuid, updates);

      // Ajouter une conversation
      await this.addConversation(interesseUuid, {
        expediteur_type: "beneficiaire",
        message: "Rendez-vous confirmé"
      });

      return interesse;
    } catch (error: any) {
      console.error("❌ Error confirming rendez-vous:", error);
      throw error;
    }
  },

  // ==================== Statistiques ====================

  async getDonInteresseStats(filters?: DonInteresseFilterParams): Promise<DonInteresseStats> {
    try {
      console.log("📊 Fetching don interesse statistics");

      const endpoint = "/dons/interesses/stats";
      const response = await api.get<ApiResponse<DonInteresseStats>>(endpoint, {
        params: filters
      });

      // Structure par défaut
      const defaultStats: DonInteresseStats = {
        total_interets: 0,
        interets_par_statut: {},
        interets_par_priorite: {},
        interets_par_mois: [],
        taux_conversion: 0,
        taux_acceptation: 0,
        taux_completion: 0,
        delai_moyen_traitement: 0,
        top_donneurs: [],
        top_beneficiaires: [],
        categories_populaires: [],
        metrics: {
          quantite_totale_demandee: 0,
          quantite_totale_acceptee: 0,
          quantite_totale_recue: 0,
          satisfaction_moyenne: 0,
          delai_reponse_moyen: 0
        }
      };

      let stats = defaultStats;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        stats = { ...defaultStats, ...(response.data as any).data };
      } else if (response.data && typeof response.data === 'object') {
        stats = { ...defaultStats, ...response.data };
      }

      console.log("✅ Don interesse stats fetched");
      return stats;
    } catch (error: any) {
      console.error("❌ Error fetching don interesse stats:", error);
      throw error;
    }
  },

  async getDonInteresseAnalytics(periode: { debut: string; fin: string }, filters?: DonInteresseFilterParams): Promise<DonInteresseAnalytics> {
    try {
      console.log("📈 Getting don interesse analytics");

      const endpoint = "/dons/interesses/analytics";
      const response = await api.get<ApiResponse<DonInteresseAnalytics>>(endpoint, {
        params: { ...periode, ...filters }
      });

      // Structure par défaut
      const defaultAnalytics: DonInteresseAnalytics = {
        periode,
        volume: {
          total: 0,
          par_jour: [],
          par_heure: []
        },
        conversion: {
          taux_confirmation: 0,
          taux_acceptation: 0,
          taux_completion: 0,
          delai_moyen_etapes: {
            expression_confirmation: 0,
            confirmation_acceptation: 0,
            acceptation_completion: 0
          }
        },
        utilisateurs: {
          nouveaux_beneficiaires: 0,
          beneficiaires_actifs: 0,
          taux_retention: 0,
          satisfaction_moyenne: 0
        },
        geographie: {
          top_villes: [],
          top_pays: [],
          distribution_geographique: {}
        },
        tendances: {
          categories_populaires: [],
          horaires_populaires: [],
          jours_populaires: []
        }
      };

      let analytics = defaultAnalytics;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        analytics = { ...defaultAnalytics, ...(response.data as any).data };
      } else if (response.data && typeof response.data === 'object') {
        analytics = { ...defaultAnalytics, ...response.data };
      }

      console.log("✅ Don interesse analytics fetched");
      return analytics;
    } catch (error: any) {
      console.error("❌ Error getting don interesse analytics:", error);
      throw error;
    }
  },

  // ==================== Notifications et Rappels ====================

  async sendNotification(interesseUuid: string, notificationData: {
    type: "nouvel_interet" | "confirmation" | "acceptation" | "refus" | "rendezvous" | "rappel" | "completion";
    destinataire_uuid: string;
    destinataire_type: string;
    sujet: string;
    contenu: string;
    methode?: "email" | "sms" | "push" | "in_app";
  }): Promise<DonInteresseNotification> {
    try {
      console.log("🔔 Sending notification for interesse:", interesseUuid);

      const endpoint = `/dons/interesses/${interesseUuid}/notifications`;
      const response = await api.post<ApiResponse<DonInteresseNotification>>(
        endpoint,
        notificationData
      );

      let notification: DonInteresseNotification;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        notification = (response.data as any).data;
      } else {
        notification = response.data as DonInteresseNotification;
      }

      console.log("✅ Notification sent");
      return notification;
    } catch (error: any) {
      console.error("❌ Error sending notification:", error);
      throw error;
    }
  },

  async createRappel(interesseUuid: string, rappelData: {
    type: "premier_contact" | "confirmation" | "rendezvous" | "feedback";
    date_rappel: string;
    notes?: string;
  }): Promise<DonInteresseRappel> {
    try {
      console.log("⏰ Creating rappel for interesse:", interesseUuid);

      const endpoint = `/dons/interesses/${interesseUuid}/rappels`;
      const response = await api.post<ApiResponse<DonInteresseRappel>>(
        endpoint,
        rappelData
      );

      let rappel: DonInteresseRappel;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        rappel = (response.data as any).data;
      } else {
        rappel = response.data as DonInteresseRappel;
      }

      console.log("✅ Rappel created");
      return rappel;
    } catch (error: any) {
      console.error("❌ Error creating rappel:", error);
      throw error;
    }
  },

  async sendRappel(rappelUuid: string): Promise<DonInteresseRappel> {
    try {
      console.log("⏰ Sending rappel:", rappelUuid);

      const endpoint = `/dons/interesses/rappels/${rappelUuid}/send`;
      const response = await api.post<ApiResponse<DonInteresseRappel>>(endpoint, {});

      let rappel: DonInteresseRappel;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        rappel = (response.data as any).data;
      } else {
        rappel = response.data as DonInteresseRappel;
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
    evaluateur_type: "donateur" | "beneficiaire";
    note: number;
    commentaire: string;
    aspects?: {
      ponctualite?: number;
      communication?: number;
      etat_produit?: number;
      respect_conditions?: number;
    };
    recommandation: boolean;
    tags?: string[];
  }): Promise<DonInteresseFeedback> {
    try {
      console.log("⭐ Submitting feedback for interesse:", interesseUuid);

      const endpoint = `/dons/interesses/${interesseUuid}/feedback`;
      const response = await api.post<ApiResponse<DonInteresseFeedback>>(
        endpoint,
        feedbackData
      );

      let feedback: DonInteresseFeedback;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        feedback = (response.data as any).data;
      } else {
        feedback = response.data as DonInteresseFeedback;
      }

      console.log("✅ Feedback submitted");
      return feedback;
    } catch (error: any) {
      console.error("❌ Error submitting feedback:", error);
      throw error;
    }
  },

  async getFeedback(interesseUuid: string): Promise<DonInteresseFeedback[]> {
    try {
      console.log("📝 Getting feedback for interesse:", interesseUuid);

      const endpoint = `/dons/interesses/${interesseUuid}/feedback`;
      const response = await api.get<ApiResponse<DonInteresseFeedback[]>>(endpoint);

      let feedbacks: DonInteresseFeedback[] = [];
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

  async verifyDonInteresse(uuid: string, verificateurUuid: string, notes?: string): Promise<DonInteresse> {
    try {
      console.log("✅ Verifying don interesse:", uuid);

      const updates: DonInteresseUpdateData = {
        est_verifie: true,
        verification_notes: notes,
        verifie_par: verificateurUuid,
        date_verification: new Date().toISOString()
      };

      return await this.updateDonInteresse(uuid, updates);
    } catch (error: any) {
      console.error("❌ Error verifying don interesse:", error);
      throw error;
    }
  },

  async requestVerification(interesseUuid: string, verificationData: {
    type_verification: "identite" | "situation" | "utilisation" | "complet";
    documents?: Array<{
      type: string;
      url: string;
      nom: string;
    }>;
    notes?: string;
  }): Promise<DonInteresseVerificationRequest> {
    try {
      console.log("🔍 Requesting verification for interesse:", interesseUuid);

      const endpoint = `/dons/interesses/${interesseUuid}/verification-requests`;
      const response = await api.post<ApiResponse<DonInteresseVerificationRequest>>(
        endpoint,
        verificationData
      );

      let request: DonInteresseVerificationRequest;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        request = (response.data as any).data;
      } else {
        request = response.data as DonInteresseVerificationRequest;
      }

      console.log("✅ Verification request created");
      return request;
    } catch (error: any) {
      console.error("❌ Error requesting verification:", error);
      throw error;
    }
  },

  // ==================== Batch Operations ====================

  async bulkUpdateDonInteresses(bulkUpdate: DonInteresseBulkUpdate): Promise<DonInteresse[]> {
    try {
      console.log("🔄 Bulk updating", bulkUpdate.uuids.length, "don interesses");

      const endpoint = "/dons/interesses/bulk-update";
      const response = await api.post<ApiResponse<DonInteresse[]>>(endpoint, bulkUpdate);

      let updatedInteresses: DonInteresse[] = [];
      if (Array.isArray(response.data)) {
        updatedInteresses = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        updatedInteresses = (response.data as any).data || [];
      }

      console.log("✅ Don interesses bulk updated:", updatedInteresses.length);
      return updatedInteresses;
    } catch (error: any) {
      console.error("❌ Error bulk updating don interesses:", error);
      throw error;
    }
  },

  async bulkDeleteDonInteresses(uuids: string[]): Promise<{ deleted: number; errors: string[] }> {
    try {
      console.log("🗑️ Bulk deleting", uuids.length, "don interesses");

      const endpoint = "/dons/interesses/bulk-delete";
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

      console.log("✅ Don interesses bulk deleted:", result.deleted, "errors:", result.errors.length);
      return result;
    } catch (error: any) {
      console.error("❌ Error bulk deleting don interesses:", error);
      throw error;
    }
  },

  async bulkConfirmDonInteresses(uuids: string[]): Promise<DonInteresse[]> {
    try {
      console.log("✅ Bulk confirming", uuids.length, "don interesses");

      const updates: DonInteresseUpdateData = { statut: "confirme" };
      const result = await this.bulkUpdateDonInteresses({ uuids, updates });

      console.log("✅ Don interesses bulk confirmed:", result.length);
      return result;
    } catch (error: any) {
      console.error("❌ Error bulk confirming don interesses:", error);
      throw error;
    }
  },

  // ==================== Matching Automatique ====================

  async getMatchSuggestions(interesseUuid: string): Promise<DonInteresseMatchSuggestion[]> {
    try {
      console.log("💡 Getting match suggestions for interesse:", interesseUuid);

      const endpoint = `/dons/interesses/${interesseUuid}/match-suggestions`;
      const response = await api.get<ApiResponse<DonInteresseMatchSuggestion[]>>(endpoint);

      let suggestions: DonInteresseMatchSuggestion[] = [];
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

  async findAutoMatches(interesseUuid: string): Promise<DonInteresseAutoMatch[]> {
    try {
      console.log("🔍 Finding auto matches for interesse:", interesseUuid);

      const endpoint = `/dons/interesses/${interesseUuid}/auto-matches`;
      const response = await api.get<ApiResponse<DonInteresseAutoMatch[]>>(endpoint);

      let matches: DonInteresseAutoMatch[] = [];
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

  async createGroup(groupData: Omit<DonInteresseGroup, 'uuid' | 'created_at' | 'updated_at'>): Promise<DonInteresseGroup> {
    try {
      console.log("👥 Creating don interesse group:", groupData.nom);

      const endpoint = "/dons/interesses/groups";
      const response = await api.post<ApiResponse<DonInteresseGroup>>(endpoint, groupData);

      let group: DonInteresseGroup;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        group = (response.data as any).data;
      } else {
        group = response.data as DonInteresseGroup;
      }

      console.log("✅ Group created");
      return group;
    } catch (error: any) {
      console.error("❌ Error creating group:", error);
      throw error;
    }
  },

  async addToGroup(groupUuid: string, interesseUuid: string, role: "membre" | "moderateur" = "membre"): Promise<DonInteresseGroup> {
    try {
      console.log("➕ Adding interesse to group:", interesseUuid, "group:", groupUuid);

      const endpoint = `/dons/interesses/groups/${groupUuid}/members`;
      const response = await api.post<ApiResponse<DonInteresseGroup>>(
        endpoint,
        { interesse_uuid: interesseUuid, role }
      );

      let group: DonInteresseGroup;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        group = (response.data as any).data;
      } else {
        group = response.data as DonInteresseGroup;
      }

      console.log("✅ Added to group");
      return group;
    } catch (error: any) {
      console.error("❌ Error adding to group:", error);
      throw error;
    }
  },

  // ==================== Export ====================

  async exportDonInteresses(options: DonInteresseExportOptions): Promise<Blob> {
    try {
      console.log("📤 Exporting don interesses in", options.format, "format");

      const endpoint = "/dons/interesses/export";
      const response = await api.post(
        endpoint,
        options,
        { responseType: "blob" }
      );

      console.log("✅ Don interesses exported successfully");
      return response;
    } catch (error: any) {
      console.error("❌ Error exporting don interesses:", error);
      throw error;
    }
  },

  // ==================== Audit ====================

  async getAuditLog(interesseUuid: string): Promise<DonInteresseAuditLog[]> {
    try {
      console.log("📜 Getting audit log for interesse:", interesseUuid);

      const endpoint = `/dons/interesses/${interesseUuid}/audit`;
      const response = await api.get<ApiResponse<DonInteresseAuditLog[]>>(endpoint);

      let auditLog: DonInteresseAuditLog[] = [];
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

  async getDonInteresseWithDetails(uuid: string): Promise<DonInteresseWithDetails> {
    try {
      console.log("🔍 Getting don interesse with details:", uuid);

      const [interesse, conversations, feedback] = await Promise.all([
        this.getDonInteresse(uuid),
        this.getConversations(uuid),
        this.getFeedback(uuid).catch(() => [])
      ]);

      const interesseWithDetails: DonInteresseWithDetails = {
        ...interesse,
        conversations,
        metadata: {
          ...interesse.metadata,
          feedback_count: feedback.length
        }
      };

      console.log("✅ Don interesse with details fetched");
      return interesseWithDetails;
    } catch (error: any) {
      console.error("❌ Error getting don interesse with details:", error);
      throw error;
    }
  },

  async searchDonInteresses(searchTerm: string, filters?: DonInteresseFilterParams): Promise<{ interets: DonInteresse[]; count: number }> {
    try {
      console.log("🔍 Searching don interesses for:", searchTerm);

      const { interets, count } = await this.getDonInteresses({
        search: searchTerm,
        filters
      });

      console.log("✅ Found", interets.length, "don interesses matching search");
      return { interets, count: count || interets.length };
    } catch (error: any) {
      console.error("❌ Error searching don interesses:", error);
      throw error;
    }
  },

  async checkAvailability(donUuid: string, quantiteDemandee: number): Promise<{
    disponible: boolean;
    quantite_disponible: number;
    interets_en_cours: number;
    suggestions?: string[];
  }> {
    try {
      console.log("📊 Checking availability for don:", donUuid, "quantite:", quantiteDemandee);

      // Récupérer les détails du don
      const don = await this.getDonDetails(donUuid);

      // Récupérer les intérêts en cours pour ce don
      const { interets } = await this.getDonInteressesByDon(donUuid);
      const interetsActifs = interets.filter(i =>
        ["en_attente", "confirme", "accepte"].includes(i.statut)
      );

      const quantiteReservee = interetsActifs.reduce((sum, i) => sum + (i.quantite_acceptee || i.quantite_demandee), 0);
      const quantiteReellementDisponible = don.quantite_disponible - quantiteReservee;

      const disponible = quantiteReellementDisponible >= quantiteDemandee;

      const suggestions: string[] = [];
      if (!disponible && quantiteReellementDisponible > 0) {
        suggestions.push(`Seulement ${quantiteReellementDisponible} unités disponibles`);
      }

      if (interetsActifs.length > 0) {
        suggestions.push(`${interetsActifs.length} demande(s) en cours pour ce don`);
      }

      return {
        disponible,
        quantite_disponible: quantiteReellementDisponible,
        interets_en_cours: interetsActifs.length,
        suggestions
      };
    } catch (error: any) {
      console.error("❌ Error checking availability:", error);
      throw error;
    }
  },

  async getStatsByDon(donUuid: string): Promise<{
    total_interets: number;
    interets_par_statut: Record<string, number>;
    quantite_totale_demandee: number;
    quantite_totale_acceptee: number;
    quantite_totale_recue: number;
    taux_acceptation: number;
    delai_moyen_reponse: number;
  }> {
    try {
      console.log("📈 Getting stats by don:", donUuid);

      const { interets } = await this.getDonInteressesByDon(donUuid);

      const stats = {
        total_interets: interets.length,
        interets_par_statut: {},
        quantite_totale_demandee: 0,
        quantite_totale_acceptee: 0,
        quantite_totale_recue: 0,
        taux_acceptation: 0,
        delai_moyen_reponse: 0
      };

      // Calculer les statistiques
      interets.forEach(interet => {
        // Par statut
        stats.interets_par_statut[interet.statut] = (stats.interets_par_statut[interet.statut] || 0) + 1;

        // Quantités
        stats.quantite_totale_demandee += interet.quantite_demandee;
        if (interet.quantite_acceptee) {
          stats.quantite_totale_acceptee += interet.quantite_acceptee;
        }
        if (interet.quantite_recue) {
          stats.quantite_totale_recue += interet.quantite_recue;
        }
      });

      // Taux d'acceptation
      const interetsAcceptes = interets.filter(i => i.statut === "accepte" || i.statut === "complete").length;
      stats.taux_acceptation = interets.length > 0 ? (interetsAcceptes / interets.length) * 100 : 0;

      console.log("✅ Stats by don calculated");
      return stats;
    } catch (error: any) {
      console.error("❌ Error getting stats by don:", error);
      throw error;
    }
  },

  // ==================== Debug ====================

  async testDonInteresseService(): Promise<boolean> {
    try {
      console.log("🧪 Testing don interesse service...");

      await this.getDonInteresses({ limit: 1 });

      console.log("✅ Don interesse service is operational");
      return true;
    } catch (error: any) {
      console.error("❌ Don interesse service test failed:", error.message);
      return false;
    }
  },

  async ping(): Promise<{ status: string; timestamp: string }> {
    try {
      console.log("🏓 Pinging don interesse service...");

      await this.getDonInteresses({ limit: 1 });

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
