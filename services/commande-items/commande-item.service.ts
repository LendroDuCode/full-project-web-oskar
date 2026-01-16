// services/commandes/commande-item.service.ts
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import type {
  CommandeItem,
  CommandeItemCreateData,
  CommandeItemUpdateData,
  CommandeItemFilterParams,
  CommandeItemPaginationParams,
  CommandeItemStats,
  CommandeItemValidationResult,
  CommandeItemBulkUpdate,
  CommandeItemWithDetails,
  CommandeItemRetourRequest,
  CommandeItemRetour,
  CommandeItemAvis,
  CommandeItemTracking,
  CommandeItemStockMovement,
  CommandeItemPriceHistory,
  CommandeItemImportData,
  CommandeItemExportOptions,
  CommandeItemSuggestion,
  CommandeItemBundle,
  CommandeItemAnalytics,
  CommandeItemAuditLog
} from "./commande-item.types";

export interface ApiResponse<T> {
  data: T;
  status: string;
  message?: string;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
}

export const commandeItemService = {
  // ==================== CRUD Operations ====================

  async getCommandeItems(params?: CommandeItemPaginationParams): Promise<{ items: CommandeItem[]; count?: number; total?: number; page?: number; pages?: number }> {
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
      if (filters.commande_uuid) queryParams.append("commande_uuid", filters.commande_uuid);
      if (filters.produit_uuid) queryParams.append("produit_uuid", filters.produit_uuid);
      if (filters.annonce_uuid) queryParams.append("annonce_uuid", filters.annonce_uuid);
      if (filters.don_uuid) queryParams.append("don_uuid", filters.don_uuid);
      if (filters.echange_uuid) queryParams.append("echange_uuid", filters.echange_uuid);
      if (filters.boutique_uuid) queryParams.append("boutique_uuid", filters.boutique_uuid);
      if (filters.vendeur_uuid) queryParams.append("vendeur_uuid", filters.vendeur_uuid);
      if (filters.type_item) queryParams.append("type_item", filters.type_item);
      if (filters.statut) queryParams.append("statut", filters.statut);
      if (filters.statut_livraison) queryParams.append("statut_livraison", filters.statut_livraison);
      if (filters.statut_paiement) queryParams.append("statut_paiement", filters.statut_paiement);
      if (filters.promotion_uuid) queryParams.append("promotion_uuid", filters.promotion_uuid);
      if (filters.est_en_promotion !== undefined) queryParams.append("est_en_promotion", filters.est_en_promotion.toString());
      if (filters.accepte_retour !== undefined) queryParams.append("accepte_retour", filters.accepte_retour.toString());
      if (filters.date_debut) queryParams.append("date_debut", filters.date_debut);
      if (filters.date_fin) queryParams.append("date_fin", filters.date_fin);
      if (filters.reference) queryParams.append("reference", filters.reference);
      if (filters.sku) queryParams.append("sku", filters.sku);
      if (filters.code_barre) queryParams.append("code_barre", filters.code_barre);
      if (filters.has_avis !== undefined) queryParams.append("has_avis", filters.has_avis.toString());
      if (filters.has_retour !== undefined) queryParams.append("has_retour", filters.has_retour.toString());
      if (filters.has_probleme_livraison !== undefined) queryParams.append("has_probleme_livraison", filters.has_probleme_livraison.toString());

      if (filters.tags && filters.tags.length > 0) {
        queryParams.append("tags", filters.tags.join(","));
      }
    }

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/commandes/items?${queryString}`
      : "/commandes/items";

    console.log("📡 Fetching commande items from:", endpoint);

    try {
      const response = await api.get<ApiResponse<CommandeItem[]>>(endpoint);

      console.log("✅ Commande items response received:", {
        hasData: !!response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
      });

      let items: CommandeItem[] = [];
      let count = 0;
      let total = 0;
      let page = 1;
      let pages = 1;

      // Vérifier la structure de la réponse
      if (Array.isArray(response.data)) {
        items = response.data;
        count = response.data.length;
      } else if (response.data && typeof response.data === 'object') {
        if ('data' in response.data && Array.isArray((response.data as any).data)) {
          items = (response.data as any).data || [];
          count = (response.data as any).count || items.length;
          total = (response.data as any).total || count;
          page = (response.data as any).page || 1;
          pages = (response.data as any).pages || 1;
        } else if ('items' in response.data && Array.isArray((response.data as any).items)) {
          items = (response.data as any).items || [];
          count = (response.data as any).count || items.length;
          total = (response.data as any).total || count;
          page = (response.data as any).page || 1;
          pages = (response.data as any).pages || 1;
        }
      }

      return { items, count, total, page, pages };
    } catch (error: any) {
      console.error("🚨 Error in commandeItemService.getCommandeItems:", {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  async getCommandeItem(uuid: string): Promise<CommandeItem> {
    try {
      console.log("🔍 Fetching commande item:", uuid);

      const response = await api.get<ApiResponse<CommandeItem>>(`/commandes/items/${uuid}`);

      console.log("✅ Commande item response:", {
        hasData: !!response.data,
        dataType: typeof response.data,
      });

      let itemData: CommandeItem;

      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        itemData = (response.data as any).data;
      } else if (response.data && (response.data as any).uuid) {
        itemData = response.data as CommandeItem;
      } else {
        console.error("❌ Invalid commande item data structure:", response.data);
        throw new Error("Structure de données item de commande invalide");
      }

      if (!itemData || !itemData.uuid) {
        throw new Error("Item de commande non trouvé");
      }

      console.log("✅ Commande item found:", itemData.nom);
      return itemData;
    } catch (error: any) {
      console.error("❌ Error fetching commande item:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  async createCommandeItem(itemData: CommandeItemCreateData): Promise<CommandeItem> {
    try {
      console.log("🆕 Creating commande item:", itemData.type_item);

      // Valider les données avant envoi
      const validation = await this.validateCommandeItem(itemData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const response = await api.post<ApiResponse<CommandeItem>>(
        "/commandes/items",
        itemData,
      );

      console.log("✅ Commande item creation response:", response.data);

      let createdItem: CommandeItem;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        createdItem = (response.data as any).data;
      } else {
        createdItem = response.data as CommandeItem;
      }

      if (!createdItem || !createdItem.uuid) {
        throw new Error("Échec de la création de l'item de commande");
      }

      return createdItem;
    } catch (error: any) {
      console.error("❌ Error creating commande item:", {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  async updateCommandeItem(uuid: string, itemData: CommandeItemUpdateData): Promise<CommandeItem> {
    try {
      console.log("✏️ Updating commande item:", uuid);

      const response = await api.put<ApiResponse<CommandeItem>>(
        `/commandes/items/${uuid}`,
        itemData,
      );

      console.log("✅ Commande item update response:", response.data);

      let updatedItem: CommandeItem;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        updatedItem = (response.data as any).data;
      } else {
        updatedItem = response.data as CommandeItem;
      }

      return updatedItem;
    } catch (error: any) {
      console.error("❌ Error updating commande item:", error);
      throw error;
    }
  },

  async deleteCommandeItem(uuid: string): Promise<void> {
    try {
      console.log("🗑️ Deleting commande item:", uuid);

      await api.delete(`/commandes/items/${uuid}`);

      console.log("✅ Commande item deleted successfully");
    } catch (error: any) {
      console.error("❌ Error deleting commande item:", error);
      throw error;
    }
  },

  // ==================== Batch Operations ====================

  async createMultipleCommandeItems(commandeUuid: string, items: CommandeItemCreateData[]): Promise<CommandeItem[]> {
    try {
      console.log("📦 Creating multiple commande items for commande:", commandeUuid, "count:", items.length);

      const endpoint = `/commandes/${commandeUuid}/items/batch`;
      const response = await api.post<ApiResponse<CommandeItem[]>>(
        endpoint,
        { items }
      );

      let createdItems: CommandeItem[] = [];
      if (Array.isArray(response.data)) {
        createdItems = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        createdItems = (response.data as any).data || [];
      }

      console.log("✅ Created", createdItems.length, "commande items");
      return createdItems;
    } catch (error: any) {
      console.error("❌ Error creating multiple commande items:", error);
      throw error;
    }
  },

  async bulkUpdateCommandeItems(bulkUpdate: CommandeItemBulkUpdate): Promise<CommandeItem[]> {
    try {
      console.log("🔄 Bulk updating", bulkUpdate.uuids.length, "commande items");

      const endpoint = "/commandes/items/bulk-update";
      const response = await api.post<ApiResponse<CommandeItem[]>>(endpoint, bulkUpdate);

      let updatedItems: CommandeItem[] = [];
      if (Array.isArray(response.data)) {
        updatedItems = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        updatedItems = (response.data as any).data || [];
      }

      console.log("✅ Commande items bulk updated:", updatedItems.length);
      return updatedItems;
    } catch (error: any) {
      console.error("❌ Error bulk updating commande items:", error);
      throw error;
    }
  },

  async bulkDeleteCommandeItems(uuids: string[]): Promise<{ deleted: number; errors: string[] }> {
    try {
      console.log("🗑️ Bulk deleting", uuids.length, "commande items");

      const endpoint = "/commandes/items/bulk-delete";
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

      console.log("✅ Commande items bulk deleted:", result.deleted, "errors:", result.errors.length);
      return result;
    } catch (error: any) {
      console.error("❌ Error bulk deleting commande items:", error);
      throw error;
    }
  },

  // ==================== Validation ====================

  async validateCommandeItem(itemData: CommandeItemCreateData): Promise<CommandeItemValidationResult> {
    try {
      console.log("✅ Validating commande item data");

      const errors: string[] = [];
      const warnings: string[] = [];
      const suggestions: string[] = [];

      // Validation de base
      if (!itemData.commande_uuid) {
        errors.push("La référence à la commande est obligatoire");
      }

      if (!itemData.type_item) {
        errors.push("Le type d'item est obligatoire");
      }

      if (!itemData.quantite || itemData.quantite <= 0) {
        errors.push("La quantité doit être supérieure à 0");
      } else if (itemData.quantite > 9999) {
        warnings.push("La quantité semble très élevée");
      }

      if (!itemData.prix_unitaire || itemData.prix_unitaire < 0) {
        errors.push("Le prix unitaire est invalide");
      }

      if (!itemData.devise) {
        errors.push("La devise est obligatoire");
      }

      // Validation selon le type d'item
      switch (itemData.type_item) {
        case "produit":
          if (!itemData.produit_uuid) {
            errors.push("La référence au produit est obligatoire pour un item de type produit");
          }
          break;
        case "annonce":
          if (!itemData.annonce_uuid) {
            errors.push("La référence à l'annonce est obligatoire pour un item de type annonce");
          }
          break;
        case "don":
          if (!itemData.don_uuid) {
            errors.push("La référence au don est obligatoire pour un item de type don");
          }
          break;
        case "echange":
          if (!itemData.echange_uuid) {
            errors.push("La référence à l'échange est obligatoire pour un item de type échange");
          }
          break;
      }

      // Vérifier la disponibilité du stock
      if (itemData.type_item === "produit" && itemData.produit_uuid) {
        try {
          const stock = await this.checkStockAvailability(itemData.produit_uuid, itemData.quantite);
          if (!stock.disponible) {
            errors.push(`Stock insuffisant. Disponible: ${stock.quantite_disponible}`);
          }
        } catch {
          warnings.push("Impossible de vérifier la disponibilité du stock");
        }
      }

      // Vérifier les promotions applicables
      if (itemData.type_item === "produit" && itemData.produit_uuid) {
        const promotions = await this.getApplicablePromotions(itemData.produit_uuid);
        if (promotions.length > 0) {
          suggestions.push(`Promotions disponibles: ${promotions.map(p => p.nom).join(', ')}`);
        }
      }

      const isValid = errors.length === 0;

      return {
        isValid,
        errors,
        warnings,
        suggestions
      };
    } catch (error: any) {
      console.error("❌ Error validating commande item:", error);
      throw error;
    }
  },

  private async checkStockAvailability(produitUuid: string, quantiteDemandee: number): Promise<{
    disponible: boolean;
    quantite_disponible: number;
    quantite_reservee: number;
  }> {
    try {
      // Appel à l'API des produits pour vérifier le stock
      const response = await api.get<ApiResponse<{
        stock: number;
        stock_reserve: number;
      }>>(`/produits/${produitUuid}/stock`);

      const stockData = response.data;
      const quantiteDisponible = (stockData as any).stock - (stockData as any).stock_reserve;

      return {
        disponible: quantiteDisponible >= quantiteDemandee,
        quantite_disponible: quantiteDisponible,
        quantite_reservee: (stockData as any).stock_reserve
      };
    } catch {
      return {
        disponible: true, // Par défaut si on ne peut pas vérifier
        quantite_disponible: 999,
        quantite_reservee: 0
      };
    }
  },

  private async getApplicablePromotions(produitUuid: string): Promise<Array<{
    uuid: string;
    nom: string;
    reduction: number;
    type: string;
  }>> {
    try {
      // Appel à l'API des promotions
      const response = await api.get<ApiResponse<Array<{
        uuid: string;
        nom: string;
        reduction: number;
        type_reduction: string;
      }>>>(`/produits/${produitUuid}/promotions`);

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

  // ==================== Statistics & Analytics ====================

  async getCommandeItemStats(filters?: CommandeItemFilterParams): Promise<CommandeItemStats> {
    try {
      console.log("📊 Fetching commande item statistics");

      const endpoint = "/commandes/items/stats";
      const response = await api.get<ApiResponse<CommandeItemStats>>(endpoint, {
        params: filters
      });

      // Structure par défaut
      const defaultStats: CommandeItemStats = {
        total_items: 0,
        items_par_type: {},
        items_par_statut: {},
        items_par_statut_livraison: {},
        items_par_statut_paiement: {},
        quantite_totale: 0,
        valeur_totale: 0,
        valeur_moyenne_par_item: 0,
        quantite_moyenne_par_item: 0,
        items_en_promotion: 0,
        items_avec_retour: 0,
        items_avec_avis: 0,
        meilleurs_produits: [],
        categories_populaires: [],
        vendeurs_performants: []
      };

      let stats = defaultStats;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        stats = { ...defaultStats, ...(response.data as any).data };
      } else if (response.data && typeof response.data === 'object') {
        stats = { ...defaultStats, ...response.data };
      }

      console.log("✅ Commande item stats fetched");
      return stats;
    } catch (error: any) {
      console.error("❌ Error fetching commande item stats:", error);
      throw error;
    }
  },

  async getCommandeItemAnalytics(periode: { debut: string; fin: string }, filters?: CommandeItemFilterParams): Promise<CommandeItemAnalytics> {
    try {
      console.log("📈 Getting commande item analytics");

      const endpoint = "/commandes/items/analytics";
      const response = await api.get<ApiResponse<CommandeItemAnalytics>>(endpoint, {
        params: { ...periode, ...filters }
      });

      // Structure par défaut
      const defaultAnalytics: CommandeItemAnalytics = {
        periode,
        vente_totale: {
          quantite: 0,
          chiffre_affaires: 0,
          moyenne_panier: 0
        },
        tendances: {
          items_populaires: [],
          categories_croissantes: []
        },
        performances: {
          taux_conversion: 0,
          taux_retour: 0,
          satisfaction_client: 0
        },
        predictions: {
          demande_prevue: [],
          stock_recommande: []
        }
      };

      let analytics = defaultAnalytics;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        analytics = { ...defaultAnalytics, ...(response.data as any).data };
      } else if (response.data && typeof response.data === 'object') {
        analytics = { ...defaultAnalytics, ...response.data };
      }

      console.log("✅ Commande item analytics fetched");
      return analytics;
    } catch (error: any) {
      console.error("❌ Error getting commande item analytics:", error);
      throw error;
    }
  },

  // ==================== Gestion des Retours ====================

  async requestRetour(retourRequest: CommandeItemRetourRequest): Promise<CommandeItemRetour> {
    try {
      console.log("🔄 Requesting retour for item:", retourRequest.item_uuid);

      const endpoint = "/commandes/items/retours";
      const response = await api.post<ApiResponse<CommandeItemRetour>>(
        endpoint,
        retourRequest
      );

      let retour: CommandeItemRetour;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        retour = (response.data as any).data;
      } else {
        retour = response.data as CommandeItemRetour;
      }

      console.log("✅ Retour requested successfully");
      return retour;
    } catch (error: any) {
      console.error("❌ Error requesting retour:", error);
      throw error;
    }
  },

  async getItemRetours(itemUuid: string): Promise<CommandeItemRetour[]> {
    try {
      console.log("📋 Getting retours for item:", itemUuid);

      const endpoint = `/commandes/items/${itemUuid}/retours`;
      const response = await api.get<ApiResponse<CommandeItemRetour[]>>(endpoint);

      let retours: CommandeItemRetour[] = [];
      if (Array.isArray(response.data)) {
        retours = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        retours = (response.data as any).data || [];
      }

      console.log("✅ Found", retours.length, "retours");
      return retours;
    } catch (error: any) {
      console.error("❌ Error getting item retours:", error);
      throw error;
    }
  },

  async updateRetourStatus(retourUuid: string, statut: CommandeItemRetour["statut"], notes?: string): Promise<CommandeItemRetour> {
    try {
      console.log("🔄 Updating retour status:", retourUuid, "to", statut);

      const endpoint = `/commandes/items/retours/${retourUuid}/status`;
      const response = await api.put<ApiResponse<CommandeItemRetour>>(
        endpoint,
        { statut, notes_interne: notes }
      );

      let updatedRetour: CommandeItemRetour;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        updatedRetour = (response.data as any).data;
      } else {
        updatedRetour = response.data as CommandeItemRetour;
      }

      console.log("✅ Retour status updated successfully");
      return updatedRetour;
    } catch (error: any) {
      console.error("❌ Error updating retour status:", error);
      throw error;
    }
  },

  async processRetourRem
