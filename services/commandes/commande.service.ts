// services/commandes/commande.service.ts
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import type {
  Commande,
  CommandeCreateData,
  CommandeUpdateData,
  CommandeFilterParams,
  CommandePaginationParams,
  CommandeStats,
  CommandeValidationResult,
  CommandeBulkUpdate,
  CommandeWithDetails,
  CommandeTracking,
  CommandeInvoice,
  CommandeExportOptions,
  CommandeAnalytics,
  CommandeSuggestion,
  CommandeRecurring,
  CommandeAuditLog,
  CommandeNotification
} from "./commande.types";

export interface ApiResponse<T> {
  data: T;
  status: string;
  message?: string;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
}

export const commandeService = {
  // ==================== CRUD Operations ====================

  async getCommandes(params?: CommandePaginationParams): Promise<{ commandes: Commande[]; count?: number; total?: number; page?: number; pages?: number }> {
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
      if (filters.client_uuid) queryParams.append("client_uuid", filters.client_uuid);
      if (filters.client_type) queryParams.append("client_type", filters.client_type);
      if (filters.statut) queryParams.append("statut", filters.statut);
      if (filters.statut_paiement) queryParams.append("statut_paiement", filters.statut_paiement);
      if (filters.statut_livraison) queryParams.append("statut_livraison", filters.statut_livraison);
      if (filters.date_debut) queryParams.append("date_debut", filters.date_debut);
      if (filters.date_fin) queryParams.append("date_fin", filters.date_fin);
      if (filters.montant_min !== undefined) queryParams.append("montant_min", filters.montant_min.toString());
      if (filters.montant_max !== undefined) queryParams.append("montant_max", filters.montant_max.toString());
      if (filters.methode_paiement) queryParams.append("methode_paiement", filters.methode_paiement);
      if (filters.methode_livraison) queryParams.append("methode_livraison", filters.methode_livraison);
      if (filters.transporteur) queryParams.append("transporteur", filters.transporteur);
      if (filters.boutique_uuid) queryParams.append("boutique_uuid", filters.boutique_uuid);
      if (filters.vendeur_uuid) queryParams.append("vendeur_uuid", filters.vendeor_uuid);
      if (filters.produit_uuid) queryParams.append("produit_uuid", filters.produit_uuid);
      if (filters.annonce_uuid) queryParams.append("annonce_uuid", filters.annonce_uuid);
      if (filters.don_uuid) queryParams.append("don_uuid", filters.don_uuid);
      if (filters.echange_uuid) queryParams.append("echange_uuid", filters.echange_uuid);
      if (filters.code_promo) queryParams.append("code_promo", filters.code_promo);
      if (filters.promotion_uuid) queryParams.append("promotion_uuid", filters.promotion_uuid);
      if (filters.est_urgent !== undefined) queryParams.append("est_urgent", filters.est_urgent.toString());
      if (filters.est_cadeau !== undefined) queryParams.append("est_cadeau", filters.est_cadeau.toString());
      if (filters.confidentiel !== undefined) queryParams.append("confidentiel", filters.confidentiel.toString());
      if (filters.facture_generee !== undefined) queryParams.append("facture_generee", filters.facture_generee.toString());
      if (filters.reference) queryParams.append("reference", filters.reference);
      if (filters.numero_commande) queryParams.append("numero_commande", filters.numero_commande);
      if (filters.numero_facture) queryParams.append("numero_facture", filters.numero_facture);
      if (filters.email) queryParams.append("email", filters.email);
      if (filters.telephone) queryParams.append("telephone", filters.telephone);
      if (filters.ville) queryParams.append("ville", filters.ville);
      if (filters.pays) queryParams.append("pays", filters.pays);
      if (filters.has_retour !== undefined) queryParams.append("has_retour", filters.has_retour.toString());
      if (filters.has_avis !== undefined) queryParams.append("has_avis", filters.has_avis.toString());
      if (filters.has_probleme !== undefined) queryParams.append("has_probleme", filters.has_probleme.toString());
    }

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.COMMANDES.LIST}?${queryString}`
      : API_ENDPOINTS.COMMANDES.LIST;

    console.log("📡 Fetching commandes from:", endpoint);

    try {
      const response = await api.get<ApiResponse<Commande[]>>(endpoint);

      console.log("✅ Commandes response received:", {
        hasData: !!response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
      });

      let commandes: Commande[] = [];
      let count = 0;
      let total = 0;
      let page = 1;
      let pages = 1;

      if (Array.isArray(response.data)) {
        commandes = response.data;
        count = response.data.length;
      } else if (response.data && typeof response.data === 'object') {
        if ('data' in response.data && Array.isArray((response.data as any).data)) {
          commandes = (response.data as any).data || [];
          count = (response.data as any).count || commandes.length;
          total = (response.data as any).total || count;
          page = (response.data as any).page || 1;
          pages = (response.data as any).pages || 1;
        } else if ('commandes' in response.data && Array.isArray((response.data as any).commandes)) {
          commandes = (response.data as any).commandes || [];
          count = (response.data as any).count || commandes.length;
          total = (response.data as any).total || count;
          page = (response.data as any).page || 1;
          pages = (response.data as any).pages || 1;
        }
      }

      return { commandes, count, total, page, pages };
    } catch (error: any) {
      console.error("🚨 Error in commandeService.getCommandes:", {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  async getCommande(uuid: string): Promise<Commande> {
    try {
      console.log("🔍 Fetching commande:", uuid);

      const response = await api.get<ApiResponse<Commande>>(API_ENDPOINTS.COMMANDES.DETAIL(uuid));

      console.log("✅ Commande response:", {
        hasData: !!response.data,
        dataType: typeof response.data,
      });

      let commandeData: Commande;

      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        commandeData = (response.data as any).data;
      } else if (response.data && (response.data as any).uuid) {
        commandeData = response.data as Commande;
      } else {
        console.error("❌ Invalid commande data structure:", response.data);
        throw new Error("Structure de données commande invalide");
      }

      if (!commandeData || !commandeData.uuid) {
        throw new Error("Commande non trouvée");
      }

      console.log("✅ Commande found:", commandeData.reference);
      return commandeData;
    } catch (error: any) {
      console.error("❌ Error fetching commande:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  async createCommande(commandeData: CommandeCreateData): Promise<Commande> {
    try {
      console.log("🆕 Creating commande for client:", commandeData.client_email);

      // Valider les données avant envoi
      const validation = await this.validateCommande(commandeData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const response = await api.post<ApiResponse<Commande>>(
        API_ENDPOINTS.COMMANDES.CREATE,
        commandeData,
      );

      console.log("✅ Commande creation response:", response.data);

      let createdCommande: Commande;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        createdCommande = (response.data as any).data;
      } else {
        createdCommande = response.data as Commande;
      }

      if (!createdCommande || !createdCommande.uuid) {
        throw new Error("Échec de la création de la commande");
      }

      return createdCommande;
    } catch (error: any) {
      console.error("❌ Error creating commande:", {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  async updateCommande(uuid: string, commandeData: CommandeUpdateData): Promise<Commande> {
    try {
      console.log("✏️ Updating commande:", uuid);

      const response = await api.put<ApiResponse<Commande>>(
        API_ENDPOINTS.COMMANDES.UPDATE(uuid),
        commandeData,
      );

      console.log("✅ Commande update response:", response.data);

      let updatedCommande: Commande;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        updatedCommande = (response.data as any).data;
      } else {
        updatedCommande = response.data as Commande;
      }

      return updatedCommande;
    } catch (error: any) {
      console.error("❌ Error updating commande:", error);
      throw error;
    }
  },

  async deleteCommande(uuid: string): Promise<void> {
    try {
      console.log("🗑️ Deleting commande:", uuid);

      await api.delete(API_ENDPOINTS.COMMANDES.DELETE(uuid));

      console.log("✅ Commande deleted successfully");
    } catch (error: any) {
      console.error("❌ Error deleting commande:", error);
      throw error;
    }
  },

  // ==================== Commandes Spécialisées ====================

  async getUserCommandes(userUuid: string, params?: CommandePaginationParams): Promise<{ commandes: Commande[]; count: number }> {
    try {
      console.log("👤 Getting user commandes:", userUuid);

      const endpoint = API_ENDPOINTS.COMMANDES.USER_ORDERS;
      const queryParams = new URLSearchParams();

      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
      if (params?.sort_order) queryParams.append("sort_order", params.sort_order);

      const queryString = queryParams.toString();
      const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;

      const response = await api.get<ApiResponse<Commande[]>>(fullEndpoint);

      let commandes: Commande[] = [];
      let count = 0;

      if (Array.isArray(response.data)) {
        commandes = response.data;
        count = response.data.length;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        commandes = (response.data as any).data || [];
        count = (response.data as any).count || commandes.length;
      }

      console.log("✅ Found", commandes.length, "user commandes");
      return { commandes, count };
    } catch (error: any) {
      console.error("❌ Error getting user commandes:", error);
      throw error;
    }
  },

  async getUserCommandeDetail(uuid: string): Promise<Commande> {
    try {
      console.log("🔍 Getting user commande detail:", uuid);

      const response = await api.get<ApiResponse<Commande>>(API_ENDPOINTS.COMMANDES.USER_ORDER_DETAIL(uuid));

      let commandeData: Commande;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        commandeData = (response.data as any).data;
      } else if (response.data && (response.data as any).uuid) {
        commandeData = response.data as Commande;
      } else {
        throw new Error("Commande non trouvée");
      }

      console.log("✅ User commande detail found:", commandeData.reference);
      return commandeData;
    } catch (error: any) {
      console.error("❌ Error getting user commande detail:", error);
      throw error;
    }
  },

  async getBoutiqueCommandes(boutiqueUuid: string, params?: CommandePaginationParams): Promise<{ commandes: Commande[]; count: number }> {
    try {
      console.log("🏪 Getting boutique commandes:", boutiqueUuid);

      const endpoint = API_ENDPOINTS.COMMANDES.BOUTIQUE_ORDERS;
      const queryParams = new URLSearchParams();

      queryParams.append("boutique_uuid", boutiqueUuid);
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
      if (params?.sort_order) queryParams.append("sort_order", params.sort_order);

      const queryString = queryParams.toString();
      const response = await api.get<ApiResponse<Commande[]>>(`${endpoint}?${queryString}`);

      let commandes: Commande[] = [];
      let count = 0;

      if (Array.isArray(response.data)) {
        commandes = response.data;
        count = response.data.length;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        commandes = (response.data as any).data || [];
        count = (response.data as any).count || commandes.length;
      }

      console.log("✅ Found", commandes.length, "boutique commandes");
      return { commandes, count };
    } catch (error: any) {
      console.error("❌ Error getting boutique commandes:", error);
      throw error;
    }
  },

  async getVendeurStats(vendeurUuid: string): Promise<any> {
    try {
      console.log("📊 Getting vendeur stats:", vendeurUuid);

      const response = await api.get<ApiResponse<any>>(API_ENDPOINTS.COMMANDES.VENDEUR_STATS);

      let stats: any;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        stats = (response.data as any).data;
      } else {
        stats = response.data;
      }

      console.log("✅ Vendeur stats fetched");
      return stats;
    } catch (error: any) {
      console.error("❌ Error getting vendeur stats:", error);
      throw error;
    }
  },

  async updateVendeurCommandeStatus(commandeUuid: string, statut: string): Promise<Commande> {
    try {
      console.log("🔄 Updating vendeur commande status:", commandeUuid, "to", statut);

      const response = await api.put<ApiResponse<Commande>>(
        API_ENDPOINTS.COMMANDES.VENDEUR_UPDATE_STATUS(commandeUuid),
        { statut }
      );

      let updatedCommande: Commande;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        updatedCommande = (response.data as any).data;
      } else {
        updatedCommande = response.data as Commande;
      }

      console.log("✅ Vendeur commande status updated");
      return updatedCommande;
    } catch (error: any) {
      console.error("❌ Error updating vendeur commande status:", error);
      throw error;
    }
  },

  // ==================== Actions sur les Commandes ====================

  async cancelCommande(uuid: string, raison?: string): Promise<Commande> {
    try {
      console.log("❌ Cancelling commande:", uuid);

      const response = await api.post<ApiResponse<Commande>>(
        API_ENDPOINTS.COMMANDES.USER_CANCEL(uuid),
        { raison }
      );

      let cancelledCommande: Commande;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        cancelledCommande = (response.data as any).data;
      } else {
        cancelledCommande = response.data as Commande;
      }

      console.log("✅ Commande cancelled successfully");
      return cancelledCommande;
    } catch (error: any) {
      console.error("❌ Error cancelling commande:", error);
      throw error;
    }
  },

  async confirmCommande(uuid: string): Promise<Commande> {
    try {
      console.log("✅ Confirming commande:", uuid);

      const endpoint = `/commandes/${uuid}/confirmer`;
      const response = await api.post<ApiResponse<Commande>>(endpoint, {});

      let confirmedCommande: Commande;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        confirmedCommande = (response.data as any).data;
      } else {
        confirmedCommande = response.data as Commande;
      }

      console.log("✅ Commande confirmed successfully");
      return confirmedCommande;
    } catch (error: any) {
      console.error("❌ Error confirming commande:", error);
      throw error;
    }
  },

  async markAsShipped(uuid: string, trackingInfo?: {
    transporteur: string;
    numero_suivi: string;
    url_suivi?: string;
  }): Promise<Commande> {
    try {
      console.log("🚚 Marking commande as shipped:", uuid);

      const endpoint = `/commandes/${uuid}/expedier`;
      const response = await api.post<ApiResponse<Commande>>(endpoint, trackingInfo);

      let shippedCommande: Commande;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        shippedCommande = (response.data as any).data;
      } else {
        shippedCommande = response.data as Commande;
      }

      console.log("✅ Commande marked as shipped");
      return shippedCommande;
    } catch (error: any) {
      console.error("❌ Error marking commande as shipped:", error);
      throw error;
    }
  },

  async markAsDelivered(uuid: string): Promise<Commande> {
    try {
      console.log("📦 Marking commande as delivered:", uuid);

      const endpoint = `/commandes/${uuid}/livrer`;
      const response = await api.post<ApiResponse<Commande>>(endpoint, {});

      let deliveredCommande: Commande;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        deliveredCommande = (response.data as any).data;
      } else {
        deliveredCommande = response.data as Commande;
      }

      console.log("✅ Commande marked as delivered");
      return deliveredCommande;
    } catch (error: any) {
      console.error("❌ Error marking commande as delivered:", error);
      throw error;
    }
  },

  async refundCommande(uuid: string, montant?: number, raison?: string): Promise<Commande> {
    try {
      console.log("💸 Refunding commande:", uuid, "amount:", montant);

      const endpoint = `/commandes/${uuid}/rembourser`;
      const response = await api.post<ApiResponse<Commande>>(
        endpoint,
        { montant, raison }
      );

      let refundedCommande: Commande;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        refundedCommande = (response.data as any).data;
      } else {
        refundedCommande = response.data as Commande;
      }

      console.log("✅ Commande refunded successfully");
      return refundedCommande;
    } catch (error: any) {
      console.error("❌ Error refunding commande:", error);
      throw error;
    }
  },

  // ==================== Validation ====================

  async validateCommande(commandeData: CommandeCreateData): Promise<CommandeValidationResult> {
    try {
      console.log("✅ Validating commande data");

      const errors: string[] = [];
      const warnings: string[] = [];
      const suggestions: string[] = [];

      // Validation de base
      if (!commandeData.client_uuid) {
        errors.push("L'identifiant client est obligatoire");
      }

      if (!commandeData.client_email || !this.validateEmail(commandeData.client_email)) {
        errors.push("Email client invalide");
      }

      if (!commandeData.client_telephone) {
        errors.push("Téléphone client obligatoire");
      }

      if (!commandeData.client_nom) {
        errors.push("Nom client obligatoire");
      }

      // Validation des adresses
      if (!commandeData.adresse_livraison) {
        errors.push("Adresse de livraison obligatoire");
      } else {
        if (!commandeData.adresse_livraison.adresse) {
          errors.push("Adresse de livraison incomplète");
        }
        if (!commandeData.adresse_livraison.code_postal) {
          errors.push("Code postal de livraison obligatoire");
        }
        if (!commandeData.adresse_livraison.ville) {
          errors.push("Ville de livraison obligatoire");
        }
        if (!commandeData.adresse_livraison.pays) {
          errors.push("Pays de livraison obligatoire");
        }
      }

      // Validation des items
      if (!commandeData.items || commandeData.items.length === 0) {
        errors.push("La commande doit contenir au moins un item");
      } else {
        commandeData.items.forEach((item, index) => {
          if (!item.type_item) {
            errors.push(`Item ${index + 1}: type d'item manquant`);
          }
          if (!item.quantite || item.quantite <= 0) {
            errors.push(`Item ${index + 1}: quantité invalide`);
          }
          if (!item.prix_unitaire || item.prix_unitaire < 0) {
            errors.push(`Item ${index + 1}: prix unitaire invalide`);
          }
        });
      }

      // Vérification de disponibilité du stock
      const disponibiliteStock: Record<string, any> = {};
      for (const item of commandeData.items) {
        if (item.type_item === "produit" && item.produit_uuid) {
          try {
            const stock = await this.checkStockAvailability(item.produit_uuid, item.quantite);
            disponibiliteStock[item.produit_uuid] = {
              disponible: stock.disponible,
              quantite_disponible: stock.quantite_disponible,
              quantite_demandee: item.quantite
            };

            if (!stock.disponible) {
              warnings.push(`Produit ${item.produit_uuid}: stock insuffisant (disponible: ${stock.quantite_disponible}, demandé: ${item.quantite})`);
            }
          } catch {
            warnings.push(`Produit ${item.produit_uuid}: impossible de vérifier le stock`);
          }
        }
      }

      // Suggestions
      if (!commandeData.methode_paiement) {
        suggestions.push("Spécifiez une méthode de paiement");
      }

      if (!commandeData.methode_livraison) {
        suggestions.push("Spécifiez une méthode de livraison");
      }

      const isValid = errors.length === 0;

      return {
        isValid,
        errors,
        warnings,
        suggestions,
        disponibilite_stock: disponibiliteStock
      };
    } catch (error: any) {
      console.error("❌ Error validating commande:", error);
      throw error;
    }
  },

  private validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  private async checkStockAvailability(produitUuid: string, quantiteDemandee: number): Promise<{
    disponible: boolean;
    quantite_disponible: number;
  }> {
    try {
      const response = await api.get<ApiResponse<{
        stock: number;
        stock_reserve: number;
      }>>(`/produits/${produitUuid}/stock`);

      const stockData = response.data;
      const quantiteDisponible = (stockData as any).stock - (stockData as any).stock_reserve;

      return {
        disponible: quantiteDisponible >= quantiteDemandee,
        quantite_disponible: quantiteDisponible
      };
    } catch {
      return {
        disponible: true,
        quantite_disponible: 999
      };
    }
  },

  // ==================== Statistiques ====================

  async getCommandeStats(filters?: CommandeFilterParams): Promise<CommandeStats> {
    try {
      console.log("📊 Fetching commande statistics");

      const endpoint = "/commandes/stats";
      const response = await api.get<ApiResponse<CommandeStats>>(endpoint, {
        params: filters
      });

      // Structure par défaut
      const defaultStats: CommandeStats = {
        total_commandes: 0,
        commandes_par_statut: {},
        commandes_par_statut_paiement: {},
        commandes_par_statut_livraison: {},
        chiffre_affaires_total: 0,
        chiffre_affaires_moyen: 0,
        panier_moyen: 0,
        commandes_par_mois: [],
        top_clients: [],
        top_produits: [],
        top_vendeurs: [],
        metrics: {
          taux_conversion: 0,
          taux_abandon_panier: 0,
          delai_livraison_moyen: 0,
          satisfaction_client_moyenne: 0,
          taux_retour: 0
        }
      };

      let stats = defaultStats;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        stats = { ...defaultStats, ...(response.data as any).data };
      } else if (response.data && typeof response.data === 'object') {
        stats = { ...defaultStats, ...response.data };
      }

      console.log("✅ Commande stats fetched");
      return stats;
    } catch (error: any) {
      console.error("❌ Error fetching commande stats:", error);
      throw error;
    }
  },

  async getCommandeAnalytics(periode: { debut: string; fin: string }, filters?: CommandeFilterParams): Promise<CommandeAnalytics> {
    try {
      console.log("📈 Getting commande analytics");

      const endpoint = "/commandes/analytics";
      const response = await api.get<ApiResponse<CommandeAnalytics>>(endpoint, {
        params: { ...periode, ...filters }
      });

      // Structure par défaut
      const defaultAnalytics: CommandeAnalytics = {
        periode,
        ventes: {
          total: 0,
          par_jour: [],
          par_heure: []
        },
        clients: {
          nouveaux: 0,
          fideles: 0,
          taux_retention: 0,
          valeur_vie_client: 0
        },
        produits: {
          plus_vendus: [],
          categories_populaires: []
        },
        livraison: {
          delai_moyen: 0,
          taux_success: 0,
          problemes_frequents: []
        },
        paiement: {
          methodes_populaires: [],
          taux_conversion_paiement: 0
        }
      };

      let analytics = defaultAnalytics;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        analytics = { ...defaultAnalytics, ...(response.data as any).data };
      } else if (response.data && typeof response.data === 'object') {
        analytics = { ...defaultAnalytics, ...response.data };
      }

      console.log("✅ Commande analytics fetched");
      return analytics;
    } catch (error: any) {
      console.error("❌ Error getting commande analytics:", error);
      throw error;
    }
  },

  // ==================== Gestion des Paniers ====================

  async getUserPaniers(): Promise<any[]> {
    try {
      console.log("🛒 Getting user paniers");

      const response = await api.get<ApiResponse<any[]>>(API_ENDPOINTS.COMMANDES.USER_PANNIERS);

      let paniers: any[] = [];
      if (Array.isArray(response.data)) {
        paniers = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        paniers = (response.data as any).data || [];
      }

      console.log("✅ Found", paniers.length, "user paniers");
      return paniers;
    } catch (error: any) {
      console.error("❌ Error getting user paniers:", error);
      throw error;
    }
  },

  async passerCommande(panierUuid: string, commandeData?: Partial<CommandeCreateData>): Promise<Commande> {
    try {
      console.log("💰 Passing commande from panier:", panierUuid);

      const response = await api.post<ApiResponse<Commande>>(
        API_ENDPOINTS.COMMANDES.CREATE(panierUuid),
        commandeData
      );

      let newCommande: Commande;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        newCommande = (response.data as any).data;
      } else {
        newCommande = response.data as Commande;
      }

      console.log("✅ Commande passed successfully");
      return newCommande;
    } catch (error: any) {
      console.error("❌ Error passing commande:", error);
      throw error;
    }
  },

  async commanderDirect(produitUuid: string, quantite: number, commandeData?: Partial<CommandeCreateData>): Promise<Commande> {
    try {
      console.log("⚡ Direct command for product:", produitUuid, "quantity:", quantite);

      const response = await api.post<ApiResponse<Commande>>(
        API_ENDPOINTS.COMMANDES.CREATE_DIRECT(produitUuid),
        { quantite, ...commandeData }
      );

      let newCommande: Commande;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        newCommande = (response.data as any).data;
      } else {
        newCommande = response.data as Commande;
      }

      console.log("✅ Direct command completed successfully");
      return newCommande;
    } catch (error: any) {
      console.error("❌ Error creating direct command:", error);
      throw error;
    }
  },

  // ==================== Gestion des Factures ====================

  async generateInvoice(uuid: string): Promise<CommandeInvoice> {
    try {
      console.log("🧾 Generating invoice for commande:", uuid);

      const endpoint = `/commandes/${uuid}/facture`;
      const response = await api.post<ApiResponse<CommandeInvoice>>(endpoint, {});

      let invoice: CommandeInvoice;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        invoice = (response.data as any).data;
      } else {
        invoice = response.data as CommandeInvoice;
      }

      console.log("✅ Invoice generated successfully");
      return invoice;
    } catch (error: any) {
      console.error("❌ Error generating invoice:", error);
      throw error;
    }
  },

  async getInvoice(uuid: string): Promise<CommandeInvoice> {
    try {
      console.log("📄 Getting invoice for commande:", uuid);

      const endpoint = `/commandes/${uuid}/facture`;
      const response = await api.get<ApiResponse<CommandeInvoice>>(endpoint);

      let invoice: CommandeInvoice;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        invoice = (response.data as any).data;
      } else {
        invoice = response.data as CommandeInvoice;
      }

      console.log("✅ Invoice fetched");
      return invoice;
    } catch (error: any) {
      console.error("❌ Error getting invoice:", error);
      throw error;
    }
  },

  async sendInvoice(uuid: string, email?: string): Promise<void> {
    try {
      console.log("📧 Sending invoice for commande:", uuid, "to:", email);

      const endpoint = `/commandes/${uuid}/facture/envoyer`;
      await api.post(endpoint, { email });

      console.log("✅ Invoice sent successfully");
    } catch (error: any) {
      console.error("❌ Error sending invoice:", error);
      throw error;
    }
  },

  // ==================== Suivi de Commande ====================

  async getCommandeTracking(uuid: string): Promise<CommandeTracking> {
    try {
      console.log("📦 Getting commande tracking:", uuid);

      const endpoint = `/commandes/${uuid}/tracking`;
      const response = await api.get<ApiResponse<CommandeTracking>>(endpoint);

      // Structure par défaut
      const defaultTracking: CommandeTracking = {
        commande_uuid: uuid,
        numero_suivi: "",
        transporteur: "",
        url_suivi: "",
        statut: "non_expedie",
        historique: [],
        date_expedition: "",
        date_livraison_prevue: ""
      };

      let tracking = defaultTracking;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        tracking = { ...defaultTracking, ...(response.data as any).data };
      } else if (response.data && typeof response.data === 'object') {
        tracking = { ...defaultTracking, ...response.data };
      }

      console.log("✅ Commande tracking fetched");
      return tracking;
    } catch (error: any) {
      console.error("❌ Error getting commande tracking:", error);
      throw error;
    }
  },

  async updateTracking(uuid: string, trackingInfo: {
    transporteur?: string;
    numero_suivi?: string;
    url_suivi?: string;
  }): Promise<Commande> {
    try {
      console.log("✏️ Updating commande tracking:", uuid);

      const endpoint = `/commandes/${uuid}/tracking`;
      const response = await api.put<ApiResponse<Commande>>(endpoint, trackingInfo);

      let updatedCommande: Commande;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        updatedCommande = (response.data as any).data;
      } else {
        updatedCommande = response.data as Commande;
      }

      console.log("✅ Commande tracking updated");
      return updatedCommande;
    } catch (error: any) {
      console.error("❌ Error updating commande tracking:", error);
      throw error;
    }
  },

  // ==================== Batch Operations ====================

  async bulkUpdateCommandes(bulkUpdate: CommandeBulkUpdate): Promise<Commande[]> {
    try {
      console.log("🔄 Bulk updating", bulkUpdate.uuids.length, "commandes");

      const endpoint = "/commandes/bulk-update";
      const response = await api.post<ApiResponse<Commande[]>>(endpoint, bulkUpdate);

      let updatedCommandes: Commande[] = [];
      if (Array.isArray(response.data)) {
        updatedCommandes = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        updatedCommandes = (response.data as any).data || [];
      }

      console.log("✅ Commandes bulk updated:", updatedCommandes.length);
      return updatedCommandes;
    } catch (error: any) {
      console.error("❌ Error bulk updating commandes:", error);
      throw error;
    }
  },

  async bulkDeleteCommandes(uuids: string[]): Promise<{ deleted: number; errors: string[] }> {
    try {
      console.log("🗑️ Bulk deleting", uuids.length, "commandes");

      const endpoint = "/commandes/bulk-delete";
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

      console.log("✅ Commandes bulk deleted:", result.deleted, "errors:", result.errors.length);
      return result;
    } catch (error: any) {
      console.error("❌ Error bulk deleting commandes:", error);
      throw error;
    }
  },

  // ==================== Export ====================

  async exportCommandes(options: CommandeExportOptions): Promise<Blob> {
    try {
      console.log("📤 Exporting commandes in", options.format, "format");

      const endpoint = "/commandes/export";
      const response = await api.post(
        endpoint,
        options,
        { responseType: "blob" }
      );

      console.log("✅ Commandes exported successfully");
      return response;
    } catch (error: any) {
      console.error("❌ Error exporting commandes:", error);
      throw error;
    }
  },

  // ==================== Suggestions ====================

  async getCommandeSuggestions(uuid: string): Promise<CommandeSuggestion[]> {
    try {
      console.log("💡 Getting suggestions for commande:", uuid);

      const endpoint = `/commandes/${uuid}/suggestions`;
      const response = await api.get<ApiResponse<CommandeSuggestion[]>>(endpoint);

      let suggestions: CommandeSuggestion[] = [];
      if (Array.isArray(response.data)) {
        suggestions = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        suggestions = (response.data as any).data || [];
      }

      console.log("✅ Found", suggestions.length, "suggestions");
      return suggestions;
    } catch (error: any) {
      console.error("❌ Error getting commande suggestions:", error);
      throw error;
    }
  },

  // ==================== Commandes Récurrentes ====================

  async createRecurringCommande(recurringData: Omit<CommandeRecurring, 'uuid' | 'created_at' | 'updated_at' | 'commandes_generees'>): Promise<CommandeRecurring> {
    try {
      console.log("🔄 Creating recurring commande");

      const endpoint = "/commandes/recurrentes";
      const response = await api.post<ApiResponse<CommandeRecurring>>(endpoint, recurringData);

      let recurring: CommandeRecurring;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        recurring = (response.data as any).data;
      } else {
        recurring = response.data as CommandeRecurring;
      }

      console.log("✅ Recurring commande created");
      return recurring;
    } catch (error: any) {
      console.error("❌ Error creating recurring commande:", error);
      throw error;
    }
  },

  async pauseRecurringCommande(uuid: string): Promise<CommandeRecurring> {
    try {
      console.log("⏸️ Pausing recurring commande:", uuid);

      const endpoint = `/commandes/recurrentes/${uuid}/pause`;
      const response = await api.post<ApiResponse<CommandeRecurring>>(endpoint, {});

      let updatedRecurring: CommandeRecurring;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        updatedRecurring = (response.data as any).data;
      } else {
        updatedRecurring = response.data as CommandeRecurring;
      }

      console.log("✅ Recurring commande paused");
      return updatedRecurring;
    } catch (error: any) {
      console.error("❌ Error pausing recurring commande:", error);
      throw error;
    }
  },

  // ==================== Audit ====================

  async getCommandeAuditLog(uuid: string): Promise<CommandeAuditLog[]> {
    try {
      console.log("📜 Getting commande audit log:", uuid);

      const endpoint = `/commandes/${uuid}/audit`;
      const response = await api.get<ApiResponse<CommandeAuditLog[]>>(endpoint);

      let auditLog: CommandeAuditLog[] = [];
      if (Array.isArray(response.data)) {
        auditLog = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        auditLog = (response.data as any).data || [];
      }

      console.log("✅ Found", auditLog.length, "audit entries");
      return auditLog;
    } catch (error: any) {
      console.error("❌ Error getting commande audit log:", error);
      throw error;
    }
  },

  // ==================== Notifications ====================

  async getCommandeNotifications(uuid: string): Promise<CommandeNotification[]> {
    try {
      console.log("🔔 Getting commande notifications:", uuid);

      const endpoint = `/commandes/${uuid}/notifications`;
      const response = await api.get<ApiResponse<CommandeNotification[]>>(endpoint);

      let notifications: CommandeNotification[] = [];
      if (Array.isArray(response.data)) {
        notifications = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        notifications = (response.data as any).data || [];
      }

      console.log("✅ Found", notifications.length, "notifications");
      return notifications;
    } catch (error: any) {
      console.error("❌ Error getting commande notifications:", error);
      throw error;
    }
  },

  async resendNotification(notificationUuid: string): Promise<CommandeNotification> {
    try {
      console.log("↪️ Resending notification:", notificationUuid);

      const endpoint = `/commandes/notifications/${notificationUuid}/renvoyer`;
      const response = await api.post<ApiResponse<CommandeNotification>>(endpoint, {});

      let notification: CommandeNotification;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        notification = (response.data as any).data;
      } else {
        notification = response.data as CommandeNotification;
      }

      console.log("✅ Notification resent");
      return notification;
    } catch (error: any) {
      console.error("❌ Error resending notification:", error);
      throw error;
    }
  },

  // ==================== Utilitaires ====================

  async estimateDelivery(adresse: {
    code_postal: string;
    ville: string;
    pays: string;
  }, items: Array<{ poids?: number; dimensions?: any }>): Promise<{
    delai: string;
    frais: number;
    methodes_disponibles: Array<{
      nom: string;
      delai: string;
      frais: number;
      description?: string;
    }>;
  }> {
    try {
      console.log("🚚 Estimating delivery for address:", adresse.code_postal);

      const endpoint = "/commandes/estimation-livraison";
      const response = await api.post<ApiResponse<any>>(endpoint, { adresse, items });

      let estimation: any;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        estimation = (response.data as any).data;
      } else {
        estimation = response.data;
      }

      console.log("✅ Delivery estimation calculated");
      return estimation;
    } catch (error: any) {
      console.error("❌ Error estimating delivery:", error);
      throw error;
    }
  },

  async checkPromoCode(code: string, montantTotal: number): Promise<{
    valide: boolean;
    reduction: number;
    type: "pourcentage" | "montant_fixe" | "livraison_gratuite";
    description?: string;
    conditions?: string[];
  }> {
    try {
      console.log("🏷️ Checking promo code:", code);

      const endpoint = "/commandes/verifier-promo";
      const response = await api.post<ApiResponse<any>>(
        endpoint,
        { code, montant_total: montantTotal }
      );

      let result: any;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        result = (response.data as any).data;
      } else {
        result = response.data;
      }

      console.log("✅ Promo code checked:", result?.valide ? "valid" : "invalid");
      return result;
    } catch (error: any) {
      console.error("❌ Error checking promo code:", error);
      throw error;
    }
  },

  async getCommandeWithDetails(uuid: string): Promise<CommandeWithDetails> {
    try {
      console.log("🔍 Getting commande with details:", uuid);

      const [commande, items, paiements, retours, avis] = await Promise.all([
        this.getCommande(uuid),
        this.getCommandeItems(uuid),
        this.getCommandePaiements(uuid),
        this.getCommandeRetours(uuid),
        this.getCommandeAvis(uuid)
      ]);

      const commandeWithDetails: CommandeWithDetails = {
        ...commande,
        items_details: items,
        paiements_details: paiements,
        retours_details: retours,
        avis_details: avis
      };

      console.log("✅ Commande with details fetched");
      return commandeWithDetails;
    } catch (error: any) {
      console.error("❌ Error getting commande with details:", error);
      throw error;
    }
  },

  private async getCommandeItems(uuid: string): Promise<any[]> {
    try {
      const response = await api.get<ApiResponse<any[]>>(`/commandes/${uuid}/items`);
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

  private async getCommandePaiements(uuid: string): Promise<any[]> {
    try {
      const response = await api.get<ApiResponse<any[]>>(`/commandes/${uuid}/paiements`);
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

  private async getCommandeRetours(uuid: string): Promise<any[]> {
    try {
      const response = await api.get<ApiResponse<any[]>>(`/commandes/${uuid}/retours`);
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

  private async getCommandeAvis(uuid: string): Promise<any[]> {
    try {
      const response = await api.get<ApiResponse<any[]>>(`/commandes/${uuid}/avis`);
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

  // ==================== Debug ====================

  async testCommandeService(): Promise<boolean> {
    try {
      console.log("🧪 Testing commande service...");

      await this.getCommandes({ limit: 1 });

      console.log("✅ Commande service is operational");
      return true;
    } catch (error: any) {
      console.error("❌ Commande service test failed:", error.message);
      return false;
    }
  },
};
