// services/panier/panier.service.ts
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import type {
  Panier,
  PanierItem,
  PanierItemCreateData,
  PanierItemUpdateData,
  PanierResume,
  PanierItemValidation,
  PanierSyncData,
  PanierHistorique,
  PanierRecommandations,
  PanierFilterParams,
  PanierStats,
  PanierConfig,
  CodePromotionnel,
  ItemComparaison
} from "./panier.types";

export interface ApiResponse<T> {
  data: T;
  status: string;
  message?: string;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
}

export const panierService = {
  // ==================== GESTION DU PANIER ====================

  /**
   * Récupère le panier courant de l'utilisateur
   */
  async getPanierCourant(): Promise<Panier> {
    try {
      const response = await api.get<ApiResponse<Panier>>(
        API_ENDPOINTS.PANIER.CURRENT
      );

      let panier: Panier;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        panier = (response.data as any).data;
      } else {
        panier = response.data as Panier;
      }

      // Structure par défaut si panier vide
      if (!panier) {
        panier = this.createPanierVide();
      }

      return panier;
    } catch (error: any) {
      console.error("Erreur lors de la récupération du panier:", error);
      // Retourner un panier vide en cas d'erreur
      return this.createPanierVide();
    }
  },

  /**
   * Crée un panier vide
   */
  private createPanierVide(): Panier {
    return {
      uuid: `temp_${Date.now()}`,
      type_panier: "standard",
      items: [],
      items_count: 0,
      items_unique_count: 0,
      sous_total: 0,
      total_reductions: 0,
      total_livraison: 0,
      total_taxes: 0,
      total_general: 0,
      reductions_appliquees: [],
      frais_livraison_calcules: 0,
      taxes_appliquees: [],
      date_creation: new Date().toISOString(),
      date_modification: new Date().toISOString(),
      statut: "actif",
      est_valide: true,
      analytics: {
        duree_session_minutes: 0,
        pages_vues: 0,
        source: "web"
      }
    };
  },

  /**
   * Récupère un panier spécifique par UUID
   */
  async getPanier(uuid: string): Promise<Panier> {
    try {
      const response = await api.get<ApiResponse<Panier>>(
        API_ENDPOINTS.PANIER.BY_UUID(uuid)
      );

      let panier: Panier;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        panier = (response.data as any).data;
      } else {
        panier = response.data as Panier;
      }

      return panier;
    } catch (error: any) {
      console.error("Erreur lors de la récupération du panier:", error);
      throw error;
    }
  },

  /**
   * Sauvegarde le panier courant
   */
  async sauvegarderPanier(panierData: Partial<Panier>): Promise<Panier> {
    try {
      const response = await api.post<ApiResponse<Panier>>(
        API_ENDPOINTS.PANIER.SYNC,
        panierData
      );

      let panier: Panier;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        panier = (response.data as any).data;
      } else {
        panier = response.data as Panier;
      }

      return panier;
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde du panier:", error);
      throw error;
    }
  },

  /**
   * Vide complètement le panier
   */
  async viderPanier(): Promise<Panier> {
    try {
      const response = await api.delete<ApiResponse<Panier>>(
        API_ENDPOINTS.PANIER.CLEAR
      );

      let panier: Panier;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        panier = (response.data as any).data;
      } else {
        panier = response.data as Panier;
      }

      return panier;
    } catch (error: any) {
      console.error("Erreur lors du vidage du panier:", error);
      throw error;
    }
  },

  /**
   * Récupère le résumé du panier
   */
  async getResumePanier(): Promise<PanierResume> {
    try {
      const panier = await this.getPanierCourant();

      const boutiqueCount = new Set(panier.items.map(item => item.boutique_uuid)).size;
      const vendeurCount = new Set(panier.items.map(item => item.vendeur_uuid)).size;
      const produitsEpuises = panier.items.filter(item => !item.en_stock).length;
      const produitsEnAlerte = panier.items.filter(item => item.stock_alerte).length;

      const devise = panier.items.length > 0 ? panier.items[0].devise : 'EUR';

      return {
        items_count: panier.items.reduce((sum, item) => sum + item.quantite, 0),
        articles_uniques: panier.items_unique_count,
        sous_total: panier.sous_total,
        total_reductions: panier.total_reductions,
        total_livraison: panier.total_livraison,
        total_general: panier.total_general,
        devise,
        boutique_count: boutiqueCount,
        vendeur_count: vendeurCount,
        produits_epuises: produitsEpuises,
        produits_en_alerte: produitsEnAlerte
      };
    } catch (error: any) {
      console.error("Erreur lors de la récupération du résumé:", error);
      throw error;
    }
  },

  // ==================== GESTION DES ITEMS ====================

  /**
   * Ajoute un item au panier
   */
  async ajouterItem(itemData: PanierItemCreateData): Promise<PanierItem> {
    try {
      // Validation préalable
      const validation = await this.validerItem(itemData);
      if (!validation.est_valide) {
        throw new Error(`Item invalide: ${validation.erreurs.join(', ')}`);
      }

      const response = await api.post<ApiResponse<PanierItem>>(
        API_ENDPOINTS.PANIER.ADD,
        itemData
      );

      let item: PanierItem;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        item = (response.data as any).data;
      } else {
        item = response.data as PanierItem;
      }

      return item;
    } catch (error: any) {
      console.error("Erreur lors de l'ajout de l'item au panier:", error);
      throw error;
    }
  },

  /**
   * Met à jour la quantité d'un item
   */
  async modifierQuantite(articleUuid: string, quantite: number): Promise<PanierItem> {
    try {
      if (quantite < 1) {
        // Supprimer l'item si quantité à 0
        return await this.supprimerItem(articleUuid);
      }

      const response = await api.put<ApiResponse<PanierItem>>(
        API_ENDPOINTS.PANIER.UPDATE_QUANTITY,
        { article_uuid: articleUuid, quantite }
      );

      let item: PanierItem;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        item = (response.data as any).data;
      } else {
        item = response.data as PanierItem;
      }

      return item;
    } catch (error: any) {
      console.error("Erreur lors de la modification de la quantité:", error);
      throw error;
    }
  },

  /**
   * Met à jour un item spécifique
   */
  async modifierItem(itemUuid: string, itemData: PanierItemUpdateData): Promise<PanierItem> {
    try {
      const response = await api.put<ApiResponse<PanierItem>>(
        `/panier/items/${itemUuid}`,
        itemData
      );

      let item: PanierItem;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        item = (response.data as any).data;
      } else {
        item = response.data as PanierItem;
      }

      return item;
    } catch (error: any) {
      console.error("Erreur lors de la modification de l'item:", error);
      throw error;
    }
  },

  /**
   * Supprime un item du panier
   */
  async supprimerItem(articleUuid: string): Promise<void> {
    try {
      await api.delete(
        API_ENDPOINTS.PANIER.REMOVE_ITEM(articleUuid)
      );
    } catch (error: any) {
      console.error("Erreur lors de la suppression de l'item:", error);
      throw error;
    }
  },

  /**
   * Valide un item avant ajout au panier
   */
  async validerItem(itemData: PanierItemCreateData): Promise<PanierItemValidation> {
    try {
      const erreurs: string[] = [];
      const avertissements: string[] = [];

      // Validation de base
      if (!itemData.article_uuid) {
        erreurs.push("L'UUID de l'article est requis");
      }

      if (!itemData.article_type) {
        erreurs.push("Le type d'article est requis");
      }

      if (!itemData.quantite || itemData.quantite < 1) {
        erreurs.push("La quantité doit être supérieure à 0");
      }

      // Vérification de la disponibilité
      let disponibilite = {
        en_stock: true,
        stock_disponible: 100,
        quantite_disponible: itemData.quantite,
        delai_reappro: undefined
      };

      // Simulation de vérification de prix
      const prix = {
        prix_unitaire: 0,
        prix_total: 0,
        reductions_appliquees: 0,
        prix_final: 0
      };

      // Simulation de vérification de livraison
      const livraison = {
        disponible: true,
        modes_disponibles: ["standard", "express"],
        frais_estimes: 0,
        delai_estime: 2
      };

      const est_valide = erreurs.length === 0;

      return {
        item_uuid: `temp_${Date.now()}`,
        est_valide,
        erreurs,
        avertissements,
        disponibilite,
        prix,
        livraison
      };
    } catch (error: any) {
      console.error("Erreur lors de la validation de l'item:", error);
      throw error;
    }
  },

  // ==================== SYNCHRONISATION ====================

  /**
   * Synchronise les paniers (local/session/connecté)
   */
  async synchroniserPaniers(panierLocal: PanierItemCreateData[]): Promise<PanierSyncData> {
    try {
      const response = await api.post<ApiResponse<PanierSyncData>>(
        API_ENDPOINTS.PANIER.SYNC,
        { panier_local: panierLocal }
      );

      let syncData: PanierSyncData;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        syncData = (response.data as any).data;
      } else {
        syncData = response.data as PanierSyncData;
      }

      return syncData;
    } catch (error: any) {
      console.error("Erreur lors de la synchronisation des paniers:", error);
      throw error;
    }
  },

  /**
   * Fusionne le panier local avec le panier utilisateur
   */
  async fusionnerPaniers(strategy: "garder_local" | "garder_utilisateur" | "fusionner" = "fusionner"): Promise<Panier> {
    try {
      const response = await api.post<ApiResponse<Panier>>(
        `/panier/fusionner`,
        { strategy }
      );

      let panier: Panier;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        panier = (response.data as any).data;
      } else {
        panier = response.data as Panier;
      }

      return panier;
    } catch (error: any) {
      console.error("Erreur lors de la fusion des paniers:", error);
      throw error;
    }
  },

  // ==================== GESTION DES CODES PROMOTIONNELS ====================

  /**
   * Applique un code promotionnel au panier
   */
  async appliquerCodePromo(code: string): Promise<Panier> {
    try {
      const response = await api.post<ApiResponse<Panier>>(
        `/panier/codes-promo/appliquer`,
        { code }
      );

      let panier: Panier;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        panier = (response.data as any).data;
      } else {
        panier = response.data as Panier;
      }

      return panier;
    } catch (error: any) {
      console.error("Erreur lors de l'application du code promo:", error);
      throw error;
    }
  },

  /**
   * Supprime un code promotionnel du panier
   */
  async supprimerCodePromo(code: string): Promise<Panier> {
    try {
      const response = await api.delete<ApiResponse<Panier>>(
        `/panier/codes-promo/${code}`
      );

      let panier: Panier;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        panier = (response.data as any).data;
      } else {
        panier = response.data as Panier;
      }

      return panier;
    } catch (error: any) {
      console.error("Erreur lors de la suppression du code promo:", error);
      throw error;
    }
  },

  /**
   * Vérifie la validité d'un code promotionnel
   */
  async verifierCodePromo(code: string): Promise<CodePromotionnel> {
    try {
      const response = await api.get<ApiResponse<CodePromotionnel>>(
        `/panier/codes-promo/${code}/verifier`
      );

      let codePromo: CodePromotionnel;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        codePromo = (response.data as any).data;
      } else {
        codePromo = response.data as CodePromotionnel;
      }

      return codePromo;
    } catch (error: any) {
      console.error("Erreur lors de la vérification du code promo:", error);
      throw error;
    }
  },

  // ==================== LIVRAISON ====================

  /**
   * Calcule les frais de livraison
   */
  async calculerFraisLivraison(adresseUuid?: string): Promise<{
    modes_disponibles: Array<{
      code: string;
      nom: string;
      description: string;
      frais: number;
      delai_jours: number;
      delai_text: string;
    }>;
    total_livraison: number;
  }> {
    try {
      const response = await api.post<ApiResponse<any>>(
        `/panier/calculer-livraison`,
        { adresse_uuid: adresseUuid }
      );

      let result: any;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        result = (response.data as any).data;
      } else {
        result = response.data;
      }

      // Structure par défaut
      const defaultResult = {
        modes_disponibles: [],
        total_livraison: 0
      };

      return { ...defaultResult, ...result };
    } catch (error: any) {
      console.error("Erreur lors du calcul des frais de livraison:", error);
      throw error;
    }
  },

  /**
   * Sélectionne un mode de livraison
   */
  async selectionnerModeLivraison(modeCode: string): Promise<Panier> {
    try {
      const response = await api.put<ApiResponse<Panier>>(
        `/panier/mode-livraison`,
        { mode_livraison: modeCode }
      );

      let panier: Panier;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        panier = (response.data as any).data;
      } else {
        panier = response.data as Panier;
      }

      return panier;
    } catch (error: any) {
      console.error("Erreur lors de la sélection du mode de livraison:", error);
      throw error;
    }
  },

  // ==================== ADRESSES ====================

  /**
   * Définit l'adresse de livraison
   */
  async definirAdresseLivraison(adresseUuid: string): Promise<Panier> {
    try {
      const response = await api.put<ApiResponse<Panier>>(
        `/panier/adresse-livraison`,
        { adresse_uuid: adresseUuid }
      );

      let panier: Panier;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        panier = (response.data as any).data;
      } else {
        panier = response.data as Panier;
      }

      return panier;
    } catch (error: any) {
      console.error("Erreur lors de la définition de l'adresse de livraison:", error);
      throw error;
    }
  },

  /**
   * Définit l'adresse de facturation
   */
  async definirAdresseFacturation(adresseUuid: string): Promise<Panier> {
    try {
      const response = await api.put<ApiResponse<Panier>>(
        `/panier/adresse-facturation`,
        { adresse_uuid: adresseUuid }
      );

      let panier: Panier;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        panier = (response.data as any).data;
      } else {
        panier = response.data as Panier;
      }

      return panier;
    } catch (error: any) {
      console.error("Erreur lors de la définition de l'adresse de facturation:", error);
      throw error;
    }
  },

  // ==================== RECOMMANDATIONS ====================

  /**
   * Récupère les recommandations basées sur le panier
   */
  async getRecommandations(): Promise<PanierRecommandations> {
    try {
      const response = await api.get<ApiResponse<PanierRecommandations>>(
        `/panier/recommandations`
      );

      let recommandations: PanierRecommandations;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        recommandations = (response.data as any).data;
      } else {
        recommandations = response.data as PanierRecommandations;
      }

      // Structure par défaut
      const defaultRecommandations: PanierRecommandations = {
        articles_complementaires: [],
        promotions_actuelles: [],
        offres_speciales: []
      };

      return { ...defaultRecommandations, ...recommandations };
    } catch (error: any) {
      console.error("Erreur lors de la récupération des recommandations:", error);
      return {
        articles_complementaires: [],
        promotions_actuelles: [],
        offres_speciales: []
      };
    }
  },

  /**
   * Compare des items similaires
   */
  async comparerItems(articleUuids: string[]): Promise<ItemComparaison[]> {
    try {
      const response = await api.post<ApiResponse<ItemComparaison[]>>(
        `/panier/comparer`,
        { article_uuids: articleUuids }
      );

      let comparaisons: ItemComparaison[] = [];
      if (Array.isArray(response.data)) {
        comparaisons = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        comparaisons = (response.data as any).data || [];
      }

      return comparaisons;
    } catch (error: any) {
      console.error("Erreur lors de la comparaison des items:", error);
      throw error;
    }
  },

  // ==================== GESTION DES LISTES ====================

  /**
   * Sauvegarde le panier comme liste d'envies
   */
  async sauvegarderCommeListeEnvies(nomListe: string): Promise<Panier> {
    try {
      const response = await api.post<ApiResponse<Panier>>(
        `/panier/sauvegarder-liste`,
        { nom_liste: nomListe, type: "liste_envies" }
      );

      let panier: Panier;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        panier = (response.data as any).data;
      } else {
        panier = response.data as Panier;
      }

      return panier;
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde comme liste d'envies:", error);
      throw error;
    }
  },

  /**
   * Récupère les listes d'envies de l'utilisateur
   */
  async getListesEnvies(): Promise<Panier[]> {
    try {
      const response = await api.get<ApiResponse<Panier[]>>(
        `/panier/listes-envies`
      );

      let listes: Panier[] = [];
      if (Array.isArray(response.data)) {
        listes = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        listes = (response.data as any).data || [];
      }

      return listes;
    } catch (error: any) {
      console.error("Erreur lors de la récupération des listes d'envies:", error);
      throw error;
    }
  },

  /**
   * Charge une liste d'envies dans le panier courant
   */
  async chargerListeEnvies(listeUuid: string): Promise<Panier> {
    try {
      const response = await api.post<ApiResponse<Panier>>(
        `/panier/charger-liste/${listeUuid}`
      );

      let panier: Panier;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        panier = (response.data as any).data;
      } else {
        panier = response.data as Panier;
      }

      return panier;
    } catch (error: any) {
      console.error("Erreur lors du chargement de la liste d'envies:", error);
      throw error;
    }
  },

  // ==================== HISTORIQUE ====================

  /**
   * Récupère l'historique des modifications du panier
   */
  async getHistorique(params?: {
    page?: number;
    limit?: number;
  }): Promise<{ historiques: PanierHistorique[]; total: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());

      const queryString = queryParams.toString();
      const endpoint = queryString
        ? `/panier/historique?${queryString}`
        : `/panier/historique`;

      const response = await api.get<ApiResponse<PanierHistorique[]>>(endpoint);

      let historiques: PanierHistorique[] = [];
      let total = 0;

      if (Array.isArray(response.data)) {
        historiques = response.data;
        total = historiques.length;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        historiques = (response.data as any).data || [];
        total = (response.data as any).total || historiques.length;
      }

      return { historiques, total };
    } catch (error: any) {
      console.error("Erreur lors de la récupération de l'historique:", error);
      throw error;
    }
  },

  // ==================== STATISTIQUES ====================

  /**
   * Récupère les statistiques du panier
   */
  async getStatistiques(filters?: PanierFilterParams): Promise<PanierStats> {
    try {
      const response = await api.get<ApiResponse<PanierStats>>(
        `/panier/statistiques`,
        { params: filters }
      );

      let stats: PanierStats;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        stats = (response.data as any).data;
      } else {
        stats = response.data as PanierStats;
      }

      // Structure par défaut
      const defaultStats: PanierStats = {
        total_paniers: 0,
        paniers_par_statut: {},
        paniers_par_mois: [],
        conversion: {
          taux_conversion: 0,
          paniers_abandonnes: 0,
          valeur_moyenne_panier: 0,
          valeur_moyenne_commande: 0
        },
        items: {
          articles_plus_ajoutes: [],
          quantite_moyenne_par_panier: 0,
          valeur_moyenne_par_item: 0
        },
        utilisateurs: {
          paniers_par_utilisateur_moyen: 0,
          utilisateurs_recidivistes: 0,
          paniers_abandonnes_par_utilisateur: 0
        },
        temps: {
          duree_moyenne_session: 0,
          delai_moyen_avant_commande: 0,
          meilleur_moment_jour: ""
        }
      };

      return { ...defaultStats, ...stats };
    } catch (error: any) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      throw error;
    }
  },

  // ==================== CONFIGURATION ====================

  /**
   * Récupère la configuration du panier
   */
  async getConfiguration(): Promise<PanierConfig> {
    try {
      const response = await api.get<ApiResponse<PanierConfig>>(
        `/panier/configuration`
      );

      let config: PanierConfig;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        config = (response.data as any).data;
      } else {
        config = response.data as PanierConfig;
      }

      // Configuration par défaut
      const defaultConfig: PanierConfig = {
        duree_expiration_jours: 30,
        quantite_max_par_item: 100,
        items_max_panier: 50,
        paniers_max_par_utilisateur: 10,
        options: {
          permettre_personnalisation: true,
          permettre_notes: true,
          permettre_fichiers: false,
          synchronisation_auto: true,
          sauvegarde_automatique: true
        },
        notifications: {
          alerte_stock: true,
          alerte_prix: true,
          rappel_panier: true,
          recommendations: true
        },
        taxes: {
          tva_par_defaut: 20,
          calcul_auto_taxes: true,
          inclure_taxes_affichage: true
        }
      };

      return { ...defaultConfig, ...config };
    } catch (error: any) {
      console.error("Erreur lors de la récupération de la configuration:", error);
      return {
        duree_expiration_jours: 30,
        quantite_max_par_item: 100,
        items_max_panier: 50,
        paniers_max_par_utilisateur: 10,
        options: {
          permettre_personnalisation: true,
          permettre_notes: true,
          permettre_fichiers: false,
          synchronisation_auto: true,
          sauvegarde_automatique: true
        },
        notifications: {
          alerte_stock: true,
          alerte_prix: true,
          rappel_panier: true,
          recommendations: true
        },
        taxes: {
          tva_par_defaut: 20,
          calcul_auto_taxes: true,
          inclure_taxes_affichage: true
        }
      };
    }
  },

  // ==================== UTILITAIRES ====================

  /**
   * Calcule les taxes pour le panier
   */
  async calculerTaxes(): Promise<{
    taux_tva: number;
    montant_tva: number;
    total_ht: number;
    total_ttc: number;
  }> {
    try {
      const panier = await this.getPanierCourant();

      const totalHT = panier.sous_total - panier.total_reductions;
      const tauxTVA = 20; // Taux par défaut
      const montantTVA = (totalHT * tauxTVA) / 100;
      const totalTTC = totalHT + montantTVA + panier.total_livraison;

      return {
        taux_tva: tauxTVA,
        montant_tva: montantTVA,
        total_ht: totalHT,
        total_ttc: totalTTC
      };
    } catch (error: any) {
      console.error("Erreur lors du calcul des taxes:", error);
      throw error;
    }
  },

  /**
   * Vérifie la disponibilité de tous les items
   */
  async verifierDisponibilite(): Promise<Array<{
    item_uuid: string;
    article_titre: string;
    disponible: boolean;
    stock_disponible: number;
    quantite_demandee: number;
    message?: string;
  }>> {
    try {
      const panier = await this.getPanierCourant();
      const resultats: any[] = [];

      for (const item of panier.items) {
        const disponible = item.en_stock && item.stock_disponible >= item.quantite;
        const message = !item.en_stock
          ? "Produit en rupture de stock"
          : item.stock_disponible < item.quantite
            ? `Stock insuffisant (${item.stock_disponible} disponible)`
            : undefined;

        resultats.push({
          item_uuid: item.uuid,
          article_titre: item.article_titre,
          disponible,
          stock_disponible: item.stock_disponible,
          quantite_demandee: item.quantite,
          message
        });
      }

      return resultats;
    } catch (error: any) {
      console.error("Erreur lors de la vérification de disponibilité:", error);
      throw error;
    }
  },

  /**
   * Exporte le panier au format PDF
   */
  async exporterPanierPDF(): Promise<Blob> {
    try {
      const response = await api.get(
        `/panier/export/pdf`,
        { responseType: "blob" }
      );

      return response;
    } catch (error: any) {
      console.error("Erreur lors de l'export du panier en PDF:", error);
      throw error;
    }
  },

  /**
   * Partage le panier par email
   */
  async partagerPanier(email: string, message?: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post<ApiResponse<{ success: boolean; message: string }>>(
        `/panier/partager`,
        { email, message }
      );

      let result: { success: boolean; message: string };
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        result = (response.data as any).data;
      } else {
        result = response.data as { success: boolean; message: string };
      }

      return result;
    } catch (error: any) {
      console.error("Erreur lors du partage du panier:", error);
      throw error;
    }
  },

  /**
   * Duplique le panier courant
   */
  async dupliquerPanier(nom?: string): Promise<Panier> {
    try {
      const response = await api.post<ApiResponse<Panier>>(
        `/panier/dupliquer`,
        { nom }
      );

      let panier: Panier;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        panier = (response.data as any).data;
      } else {
        panier = response.data as Panier;
      }

      return panier;
    } catch (error: any) {
      console.error("Erreur lors de la duplication du panier:", error);
      throw error;
    }
  },

  /**
   * Teste le service du panier
   */
  async testerService(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.get<ApiResponse<{ success: boolean; message: string }>>(
        `/panier/test`
      );

      let result: { success: boolean; message: string };
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        result = (response.data as any).data;
      } else {
        result = response.data as { success: boolean; message: string };
      }

      return result;
    } catch (error: any) {
      console.error("Erreur lors du test du service:", error);
      return { success: false, message: "Service indisponible" };
    }
  },

  /**
   * Récupère le nombre d'items dans le panier (méthode rapide)
   */
  async getNombreItems(): Promise<number> {
    try {
      const resume = await this.getResumePanier();
      return resume.items_count;
    } catch (error) {
      console.error("Erreur lors du comptage des items:", error);
      return 0;
    }
  },

  /**
   * Vérifie si le panier est vide
   */
  async estVide(): Promise<boolean> {
    try {
      const nombre = await this.getNombreItems();
      return nombre === 0;
    } catch (error) {
      console.error("Erreur lors de la vérification du panier:", error);
      return true;
    }
  }
};
