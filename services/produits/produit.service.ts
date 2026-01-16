// services/produits/produit.service.ts
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import type {
  Produit,
  ProduitCreateData,
  ProduitUpdateData,
  ProduitFilterParams,
  ProduitSearchResult,
  ProduitStats,
  ProduitVariation,
  ProduitInventaire,
  MouvementStock,
  ProduitAvis,
  ProduitQuestion,
  ProduitAssocie,
  HistoriquePrix,
  ProduitPromotion,
  ProduitConfig,
} from "./produit.types";

export interface ApiResponse<T> {
  data: T;
  status: string;
  message?: string;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
}

export const produitService = {
  // ==================== CRUD DES PRODUITS ====================

  /**
   * Récupère la liste des produits avec pagination et filtres
   */
  async getProduits(params?: {
    page?: number;
    limit?: number;
    filters?: ProduitFilterParams;
  }): Promise<ProduitSearchResult> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());

      if (params?.filters) {
        const filters = params.filters;
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            if (Array.isArray(value)) {
              queryParams.append(key, value.join(","));
            } else if (typeof value === "object") {
              queryParams.append(key, JSON.stringify(value));
            } else {
              queryParams.append(key, String(value));
            }
          }
        });
      }

      const queryString = queryParams.toString();
      const endpoint = queryString
        ? `${API_ENDPOINTS.PRODUCTS.LIST}?${queryString}`
        : API_ENDPOINTS.PRODUCTS.LIST;

      const response =
        await api.get<ApiResponse<ProduitSearchResult>>(endpoint);

      let result: ProduitSearchResult;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        result = (response.data as any).data;
      } else {
        result = response.data as ProduitSearchResult;
      }

      // Structure par défaut
      const defaultResult: ProduitSearchResult = {
        produits: [],
        total: 0,
        page: 1,
        pages: 1,
        facettes: {
          categories: [],
          prix: { min: 0, max: 0 },
          marques: [],
          caracteristiques: {},
          notes: [],
        },
      };

      return { ...defaultResult, ...result };
    } catch (error: any) {
      console.error("Erreur lors de la récupération des produits:", error);
      throw error;
    }
  },

  /**
   * Récupère les produits publiés
   */
  async getProduitsPublies(params?: {
    page?: number;
    limit?: number;
    filters?: Omit<ProduitFilterParams, "statut">;
  }): Promise<ProduitSearchResult> {
    return this.getProduits({
      ...params,
      filters: {
        ...params?.filters,
        statut: "publie",
      },
    });
  },

  /**
   * Récupère les produits d'une boutique spécifique
   */
  async getProduitsBoutique(
    boutiqueUuid: string,
    params?: {
      page?: number;
      limit?: number;
    },
  ): Promise<{ produits: Produit[]; total: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());

      const queryString = queryParams.toString();
      const endpoint = queryString
        ? `/boutiques/${boutiqueUuid}/produits?${queryString}`
        : `/boutiques/${boutiqueUuid}/produits`;

      const response = await api.get<ApiResponse<Produit[]>>(endpoint);

      let produits: Produit[] = [];
      let total = 0;

      if (Array.isArray(response.data)) {
        produits = response.data;
        total = produits.length;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        produits = (response.data as any).data || [];
        total = (response.data as any).total || produits.length;
      }

      return { produits, total };
    } catch (error: any) {
      console.error(
        "Erreur lors de la récupération des produits de la boutique:",
        error,
      );
      throw error;
    }
  },

  /**
   * Récupère un produit spécifique par son UUID
   */
  async getProduit(uuid: string): Promise<Produit> {
    try {
      const response = await api.get<ApiResponse<Produit>>(
        API_ENDPOINTS.PRODUCTS.DETAIL(uuid),
      );

      let produit: Produit;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        produit = (response.data as any).data;
      } else {
        produit = response.data as Produit;
      }

      return produit;
    } catch (error: any) {
      console.error("Erreur lors de la récupération du produit:", error);
      throw error;
    }
  },

  /**
   * Récupère un produit par son slug
   */
  async getProduitBySlug(slug: string): Promise<Produit> {
    try {
      const response = await api.get<ApiResponse<Produit>>(
        API_ENDPOINTS.PRODUCTS.BY_SLUG(slug),
      );

      let produit: Produit;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        produit = (response.data as any).data;
      } else {
        produit = response.data as Produit;
      }

      return produit;
    } catch (error: any) {
      console.error(
        "Erreur lors de la récupération du produit par slug:",
        error,
      );
      throw error;
    }
  },

  /**
   * Crée un nouveau produit
   */
  async createProduit(produitData: ProduitCreateData): Promise<Produit> {
    try {
      // Validation préalable
      const validation = await this.validerProduit(produitData);
      if (!validation.isValid) {
        throw new Error(`Produit invalide: ${validation.errors.join(", ")}`);
      }

      const response = await api.post<ApiResponse<Produit>>(
        API_ENDPOINTS.PRODUCTS.CREATE,
        produitData,
      );

      let produit: Produit;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        produit = (response.data as any).data;
      } else {
        produit = response.data as Produit;
      }

      return produit;
    } catch (error: any) {
      console.error("Erreur lors de la création du produit:", error);
      throw error;
    }
  },

  /**
   * Met à jour un produit existant
   */
  async updateProduit(
    uuid: string,
    produitData: ProduitUpdateData,
  ): Promise<Produit> {
    try {
      const response = await api.put<ApiResponse<Produit>>(
        API_ENDPOINTS.PRODUCTS.DETAIL(uuid),
        produitData,
      );

      let produit: Produit;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        produit = (response.data as any).data;
      } else {
        produit = response.data as Produit;
      }

      return produit;
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du produit:", error);
      throw error;
    }
  },

  /**
   * Supprime un produit
   */
  async deleteProduit(uuid: string): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.PRODUCTS.DELETE(uuid));
    } catch (error: any) {
      console.error("Erreur lors de la suppression du produit:", error);
      throw error;
    }
  },

  // ==================== GESTION DU STATUT ====================

  /**
   * Publie un produit
   */
  async publierProduit(uuid: string): Promise<Produit> {
    try {
      const response = await api.post<ApiResponse<Produit>>(
        API_ENDPOINTS.PRODUCTS.PUBLISH,
        { produit_uuid: uuid },
      );

      let produit: Produit;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        produit = (response.data as any).data;
      } else {
        produit = response.data as Produit;
      }

      return produit;
    } catch (error: any) {
      console.error("Erreur lors de la publication du produit:", error);
      throw error;
    }
  },

  /**
   * Dé-publie un produit
   */
  async depublierProduit(uuid: string): Promise<Produit> {
    try {
      const response = await api.post<ApiResponse<Produit>>(
        API_ENDPOINTS.PRODUCTS.UNPUBLISH,
        { produit_uuid: uuid },
      );

      let produit: Produit;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        produit = (response.data as any).data;
      } else {
        produit = response.data as Produit;
      }

      return produit;
    } catch (error: any) {
      console.error("Erreur lors de la dé-publication du produit:", error);
      throw error;
    }
  },

  /**
   * Met un produit en avant
   */
  async mettreEnAvant(uuid: string): Promise<Produit> {
    try {
      return await this.updateProduit(uuid, { en_avant: true });
    } catch (error: any) {
      console.error("Erreur lors de la mise en avant du produit:", error);
      throw error;
    }
  },

  /**
   * Retire un produit de la mise en avant
   */
  async retirerEnAvant(uuid: string): Promise<Produit> {
    try {
      return await this.updateProduit(uuid, { en_avant: false });
    } catch (error: any) {
      console.error("Erreur lors du retrait de la mise en avant:", error);
      throw error;
    }
  },

  // ==================== GESTION DU STOCK ====================

  /**
   * Met à jour le stock d'un produit
   */
  async updateStock(
    uuid: string,
    quantite: number,
    motif?: string,
  ): Promise<Produit> {
    try {
      const response = await api.put<ApiResponse<Produit>>(
        API_ENDPOINTS.PRODUCTS.UPDATE_STOCK_VENDEUR(uuid),
        { quantite, motif },
      );

      let produit: Produit;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        produit = (response.data as any).data;
      } else {
        produit = response.data as Produit;
      }

      return produit;
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du stock:", error);
      throw error;
    }
  },

  /**
   * Récupère l'inventaire d'un produit
   */
  async getInventaire(uuid: string): Promise<ProduitInventaire> {
    try {
      const response = await api.get<ApiResponse<ProduitInventaire>>(
        `/produits/${uuid}/inventaire`,
      );

      let inventaire: ProduitInventaire;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        inventaire = (response.data as any).data;
      } else {
        inventaire = response.data as ProduitInventaire;
      }

      return inventaire;
    } catch (error: any) {
      console.error("Erreur lors de la récupération de l'inventaire:", error);
      throw error;
    }
  },

  /**
   * Récupère l'historique des mouvements de stock
   */
  async getMouvementsStock(
    uuid: string,
    params?: {
      page?: number;
      limit?: number;
      date_debut?: string;
      date_fin?: string;
    },
  ): Promise<{ mouvements: MouvementStock[]; total: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.date_debut)
        queryParams.append("date_debut", params.date_debut);
      if (params?.date_fin) queryParams.append("date_fin", params.date_fin);

      const queryString = queryParams.toString();
      const endpoint = queryString
        ? `/produits/${uuid}/mouvements-stock?${queryString}`
        : `/produits/${uuid}/mouvements-stock`;

      const response = await api.get<ApiResponse<MouvementStock[]>>(endpoint);

      let mouvements: MouvementStock[] = [];
      let total = 0;

      if (Array.isArray(response.data)) {
        mouvements = response.data;
        total = mouvements.length;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        mouvements = (response.data as any).data || [];
        total = (response.data as any).total || mouvements.length;
      }

      return { mouvements, total };
    } catch (error: any) {
      console.error(
        "Erreur lors de la récupération des mouvements de stock:",
        error,
      );
      throw error;
    }
  },

  // ==================== GESTION DES VARIATIONS ====================

  /**
   * Récupère les variations d'un produit
   */
  async getVariations(uuid: string): Promise<ProduitVariation[]> {
    try {
      const response = await api.get<ApiResponse<ProduitVariation[]>>(
        `/produits/${uuid}/variations`,
      );

      let variations: ProduitVariation[] = [];
      if (Array.isArray(response.data)) {
        variations = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        variations = (response.data as any).data || [];
      }

      return variations;
    } catch (error: any) {
      console.error("Erreur lors de la récupération des variations:", error);
      throw error;
    }
  },

  /**
   * Crée une nouvelle variation
   */
  async createVariation(
    uuid: string,
    variationData: Omit<
      ProduitVariation,
      "uuid" | "produit_uuid" | "date_creation" | "date_modification"
    >,
  ): Promise<ProduitVariation> {
    try {
      const response = await api.post<ApiResponse<ProduitVariation>>(
        `/produits/${uuid}/variations`,
        variationData,
      );

      let variation: ProduitVariation;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        variation = (response.data as any).data;
      } else {
        variation = response.data as ProduitVariation;
      }

      return variation;
    } catch (error: any) {
      console.error("Erreur lors de la création de la variation:", error);
      throw error;
    }
  },

  /**
   * Met à jour une variation
   */
  async updateVariation(
    variationUuid: string,
    variationData: Partial<ProduitVariation>,
  ): Promise<ProduitVariation> {
    try {
      const response = await api.put<ApiResponse<ProduitVariation>>(
        `/variations/${variationUuid}`,
        variationData,
      );

      let variation: ProduitVariation;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        variation = (response.data as any).data;
      } else {
        variation = response.data as ProduitVariation;
      }

      return variation;
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour de la variation:", error);
      throw error;
    }
  },

  // ==================== AVIS ET ÉVALUATIONS ====================

  /**
   * Récupère les avis d'un produit
   */
  async getAvis(
    uuid: string,
    params?: {
      page?: number;
      limit?: number;
      note?: number;
      tri?: "recent" | "utile" | "note";
    },
  ): Promise<{ avis: ProduitAvis[]; total: number; note_moyenne: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.note) queryParams.append("note", params.note.toString());
      if (params?.tri) queryParams.append("tri", params.tri);

      const queryString = queryParams.toString();
      const endpoint = queryString
        ? `/produits/${uuid}/avis?${queryString}`
        : `/produits/${uuid}/avis`;

      const response = await api.get<ApiResponse<any>>(endpoint);

      let data: any;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        data = (response.data as any).data;
      } else {
        data = response.data;
      }

      const defaultResult = {
        avis: [],
        total: 0,
        note_moyenne: 0,
      };

      return { ...defaultResult, ...data };
    } catch (error: any) {
      console.error("Erreur lors de la récupération des avis:", error);
      throw error;
    }
  },

  /**
   * Crée un nouvel avis
   */
  async createAvis(
    uuid: string,
    avisData: {
      note: number;
      titre?: string;
      commentaire: string;
      avantages?: string[];
      inconvenients?: string[];
      aspects?: {
        qualite?: number;
        rapport_qualite_prix?: number;
        facilite_utilisation?: number;
        design?: number;
        livraison?: number;
      };
      recommandation: boolean;
      photos?: Array<{ url: string; legende?: string }>;
    },
  ): Promise<ProduitAvis> {
    try {
      const response = await api.post<ApiResponse<ProduitAvis>>(
        `/produits/${uuid}/avis`,
        avisData,
      );

      let avis: ProduitAvis;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        avis = (response.data as any).data;
      } else {
        avis = response.data as ProduitAvis;
      }

      return avis;
    } catch (error: any) {
      console.error("Erreur lors de la création de l'avis:", error);
      throw error;
    }
  },

  /**
   * Vote pour un avis (utile/inutile)
   */
  async voterAvis(avisUuid: string, utile: boolean): Promise<ProduitAvis> {
    try {
      const response = await api.post<ApiResponse<ProduitAvis>>(
        `/avis/${avisUuid}/vote`,
        { utile },
      );

      let avis: ProduitAvis;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        avis = (response.data as any).data;
      } else {
        avis = response.data as ProduitAvis;
      }

      return avis;
    } catch (error: any) {
      console.error("Erreur lors du vote pour l'avis:", error);
      throw error;
    }
  },

  // ==================== QUESTIONS/RÉPONSES ====================

  /**
   * Récupère les questions d'un produit
   */
  async getQuestions(
    uuid: string,
    params?: {
      page?: number;
      limit?: number;
      repondues?: boolean;
    },
  ): Promise<{ questions: ProduitQuestion[]; total: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.repondues !== undefined)
        queryParams.append("repondues", params.repondues.toString());

      const queryString = queryParams.toString();
      const endpoint = queryString
        ? `/produits/${uuid}/questions?${queryString}`
        : `/produits/${uuid}/questions`;

      const response = await api.get<ApiResponse<ProduitQuestion[]>>(endpoint);

      let questions: ProduitQuestion[] = [];
      let total = 0;

      if (Array.isArray(response.data)) {
        questions = response.data;
        total = questions.length;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        questions = (response.data as any).data || [];
        total = (response.data as any).total || questions.length;
      }

      return { questions, total };
    } catch (error: any) {
      console.error("Erreur lors de la récupération des questions:", error);
      throw error;
    }
  },

  /**
   * Pose une question sur un produit
   */
  async poserQuestion(
    uuid: string,
    question: string,
  ): Promise<ProduitQuestion> {
    try {
      const response = await api.post<ApiResponse<ProduitQuestion>>(
        `/produits/${uuid}/questions`,
        { question },
      );

      let questionResult: ProduitQuestion;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        questionResult = (response.data as any).data;
      } else {
        questionResult = response.data as ProduitQuestion;
      }

      return questionResult;
    } catch (error: any) {
      console.error("Erreur lors de la pose de la question:", error);
      throw error;
    }
  },

  /**
   * Répond à une question
   */
  async repondreQuestion(
    questionUuid: string,
    reponse: string,
  ): Promise<ProduitQuestion> {
    try {
      const response = await api.post<ApiResponse<ProduitQuestion>>(
        `/questions/${questionUuid}/repondre`,
        { reponse },
      );

      let question: ProduitQuestion;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        question = (response.data as any).data;
      } else {
        question = response.data as ProduitQuestion;
      }

      return question;
    } catch (error: any) {
      console.error("Erreur lors de la réponse à la question:", error);
      throw error;
    }
  },

  // ==================== PRODUITS ASSOCIÉS ====================

  /**
   * Récupère les produits associés
   */
  async getProduitsAssocies(uuid: string): Promise<ProduitAssocie[]> {
    try {
      const response = await api.get<ApiResponse<ProduitAssocie[]>>(
        `/produits/${uuid}/associes`,
      );

      let associes: ProduitAssocie[] = [];
      if (Array.isArray(response.data)) {
        associes = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        associes = (response.data as any).data || [];
      }

      return associes;
    } catch (error: any) {
      console.error(
        "Erreur lors de la récupération des produits associés:",
        error,
      );
      throw error;
    }
  },

  /**
   * Associe un produit à un autre
   */
  async associerProduit(
    produitUuid: string,
    produitAssocieUuid: string,
    type: string,
  ): Promise<ProduitAssocie> {
    try {
      const response = await api.post<ApiResponse<ProduitAssocie>>(
        `/produits/${produitUuid}/associer`,
        { produit_associe_uuid: produitAssocieUuid, type },
      );

      let association: ProduitAssocie;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        association = (response.data as any).data;
      } else {
        association = response.data as ProduitAssocie;
      }

      return association;
    } catch (error: any) {
      console.error("Erreur lors de l'association des produits:", error);
      throw error;
    }
  },

  // ==================== PROMOTIONS ====================

  /**
   * Récupère les promotions actives d'un produit
   */
  async getPromotions(uuid: string): Promise<ProduitPromotion[]> {
    try {
      const response = await api.get<ApiResponse<ProduitPromotion[]>>(
        `/produits/${uuid}/promotions`,
      );

      let promotions: ProduitPromotion[] = [];
      if (Array.isArray(response.data)) {
        promotions = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        promotions = (response.data as any).data || [];
      }

      return promotions;
    } catch (error: any) {
      console.error("Erreur lors de la récupération des promotions:", error);
      throw error;
    }
  },

  /**
   * Crée une promotion sur un produit
   */
  async createPromotion(
    uuid: string,
    promotionData: Omit<
      ProduitPromotion,
      "uuid" | "produit_uuid" | "date_creation" | "date_modification"
    >,
  ): Promise<ProduitPromotion> {
    try {
      const response = await api.post<ApiResponse<ProduitPromotion>>(
        `/produits/${uuid}/promotions`,
        promotionData,
      );

      let promotion: ProduitPromotion;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        promotion = (response.data as any).data;
      } else {
        promotion = response.data as ProduitPromotion;
      }

      return promotion;
    } catch (error: any) {
      console.error("Erreur lors de la création de la promotion:", error);
      throw error;
    }
  },

  // ==================== HISTORIQUE DES PRIX ====================

  /**
   * Récupère l'historique des prix d'un produit
   */
  async getHistoriquePrix(uuid: string): Promise<HistoriquePrix[]> {
    try {
      const response = await api.get<ApiResponse<HistoriquePrix[]>>(
        `/produits/${uuid}/historique-prix`,
      );

      let historique: HistoriquePrix[] = [];
      if (Array.isArray(response.data)) {
        historique = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        historique = (response.data as any).data || [];
      }

      return historique;
    } catch (error: any) {
      console.error(
        "Erreur lors de la récupération de l'historique des prix:",
        error,
      );
      throw error;
    }
  },

  // ==================== STATISTIQUES ====================

  /**
   * Récupère les statistiques des produits
   */
  async getStatistiques(filters?: ProduitFilterParams): Promise<ProduitStats> {
    try {
      const response = await api.get<ApiResponse<ProduitStats>>(
        `/produits/statistiques`,
        { params: filters },
      );

      let stats: ProduitStats;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        stats = (response.data as any).data;
      } else {
        stats = response.data as ProduitStats;
      }

      // Structure par défaut
      const defaultStats: ProduitStats = {
        total_produits: 0,
        produits_par_statut: {},
        produits_par_categorie: [],
        ventes: {
          total_ventes: 0,
          revenu_total: 0,
          ventes_par_mois: [],
          meilleurs_produits: [],
        },
        stock: {
          valeur_stock_total: 0,
          produits_en_stock: 0,
          produits_epuises: 0,
          produits_alerte_stock: 0,
          rotation_stock_moyenne: 0,
        },
        performance: {
          taux_conversion_moyen: 0,
          panier_moyen: 0,
          produits_vus_moyen: 0,
        },
        satisfaction: {
          note_moyenne: 0,
          distribution_notes: {},
          produits_sans_avis: 0,
        },
      };

      return { ...defaultStats, ...stats };
    } catch (error: any) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      throw error;
    }
  },

  /**
   * Récupère les statistiques d'un produit spécifique
   */
  async getStatistiquesProduit(uuid: string): Promise<any> {
    try {
      const response = await api.get<ApiResponse<any>>(
        `/produits/${uuid}/statistiques`,
      );

      let stats: any;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        stats = (response.data as any).data;
      } else {
        stats = response.data;
      }

      return stats;
    } catch (error: any) {
      console.error(
        "Erreur lors de la récupération des statistiques du produit:",
        error,
      );
      throw error;
    }
  },

  // ==================== RECHERCHE AVANCÉE ====================

  /**
   * Recherche de produits avec facettes
   */
  async searchProduits(
    searchTerm: string,
    filters?: ProduitFilterParams,
  ): Promise<ProduitSearchResult> {
    try {
      const response = await api.get<ApiResponse<ProduitSearchResult>>(
        `/produits/search`,
        {
          params: {
            q: searchTerm,
            ...filters,
          },
        },
      );

      let result: ProduitSearchResult;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        result = (response.data as any).data;
      } else {
        result = response.data as ProduitSearchResult;
      }

      return result;
    } catch (error: any) {
      console.error("Erreur lors de la recherche de produits:", error);
      throw error;
    }
  },

  /**
   * Produits similaires
   */
  async getProduitsSimilaires(
    uuid: string,
    limit: number = 5,
  ): Promise<Produit[]> {
    try {
      const response = await api.get<ApiResponse<Produit[]>>(
        `/produits/${uuid}/similaires`,
        { params: { limit } },
      );

      let produits: Produit[] = [];
      if (Array.isArray(response.data)) {
        produits = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        produits = (response.data as any).data || [];
      }

      return produits;
    } catch (error: any) {
      console.error(
        "Erreur lors de la récupération des produits similaires:",
        error,
      );
      throw error;
    }
  },

  /**
   * Produits fréquemment achetés ensemble
   */
  async getAchetesEnsemble(uuid: string): Promise<Produit[]> {
    try {
      const response = await api.get<ApiResponse<Produit[]>>(
        `/produits/${uuid}/achetes-ensemble`,
      );

      let produits: Produit[] = [];
      if (Array.isArray(response.data)) {
        produits = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        produits = (response.data as any).data || [];
      }

      return produits;
    } catch (error: any) {
      console.error(
        "Erreur lors de la récupération des produits achetés ensemble:",
        error,
      );
      throw error;
    }
  },

  // ==================== VALIDATION ====================

  /**
   * Valide les données d'un produit avant création/mise à jour
   */
  async validerProduit(
    produitData: ProduitCreateData | ProduitUpdateData,
  ): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Validation des champs obligatoires pour création
    if ("titre" in produitData && !produitData.titre?.trim()) {
      errors.push("Le titre est obligatoire");
    }

    if ("description" in produitData && !produitData.description?.trim()) {
      errors.push("La description est obligatoire");
    }

    if ("categorie_uuid" in produitData && !produitData.categorie_uuid) {
      errors.push("La catégorie est obligatoire");
    }

    if (
      "prix_unitaire_ht" in produitData &&
      produitData.prix_unitaire_ht <= 0
    ) {
      errors.push("Le prix unitaire doit être supérieur à 0");
    }

    if ("quantite_totale" in produitData && produitData.quantite_totale < 0) {
      errors.push("La quantité totale ne peut pas être négative");
    }

    // Validation des dates de promotion
    if (produitData.date_debut_promotion && produitData.date_fin_promotion) {
      const debut = new Date(produitData.date_debut_promotion);
      const fin = new Date(produitData.date_fin_promotion);

      if (debut >= fin) {
        errors.push(
          "La date de début de promotion doit être antérieure à la date de fin",
        );
      }
    }

    // Warnings
    if (
      "description_courte" in produitData &&
      !produitData.description_courte
    ) {
      warnings.push("Une description courte est recommandée pour les aperçus");
    }

    if (
      "images" in produitData &&
      (!produitData.images || produitData.images.length === 0)
    ) {
      warnings.push("Aucune image n'a été fournie");
    }

    if ("meta_description" in produitData && !produitData.meta_description) {
      warnings.push("Une méta-description est recommandée pour le SEO");
    }

    // Suggestions
    if (
      "tags" in produitData &&
      (!produitData.tags || produitData.tags.length === 0)
    ) {
      suggestions.push("Ajoutez des mots-clés pour améliorer la recherche");
    }

    if (
      "caracteristiques" in produitData &&
      (!produitData.caracteristiques ||
        produitData.caracteristiques.length === 0)
    ) {
      suggestions.push(
        "Ajoutez des caractéristiques pour informer les clients",
      );
    }

    const isValid = errors.length === 0;

    return {
      isValid,
      errors,
      warnings,
      suggestions,
    };
  },

  // ==================== CONFIGURATION ====================

  /**
   * Récupère la configuration des produits
   */
  async getConfiguration(): Promise<ProduitConfig> {
    try {
      const response = await api.get<ApiResponse<ProduitConfig>>(
        `/produits/configuration`,
      );

      let config: ProduitConfig;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        config = (response.data as any).data;
      } else {
        config = response.data as ProduitConfig;
      }

      // Configuration par défaut
      const defaultConfig: ProduitConfig = {
        devise_par_defaut: "EUR",
        tva_par_defaut: 20,
        seuil_alerte_stock_par_defaut: 10,
        quantite_minimum_par_defaut: 1,
        gestion_stock_par_defaut: true,
        tailles_images: {
          miniature: { width: 150, height: 150 },
          moyenne: { width: 400, height: 400 },
          grande: { width: 800, height: 800 },
        },
        formats_images_acceptes: ["jpg", "jpeg", "png", "webp"],
        taille_max_image_mo: 5,
        validation_auto_produits: false,
        moderation_avis: true,
        moderation_questions: true,
        meta_description_longueur_max: 160,
        meta_mots_cles_max: 10,
        notifications_stock_faible: true,
        notifications_nouvel_avis: true,
        notifications_nouvelle_question: true,
        formats_export_acceptes: ["csv", "excel"],
        taille_max_import_mo: 10,
      };

      return { ...defaultConfig, ...config };
    } catch (error: any) {
      console.error(
        "Erreur lors de la récupération de la configuration:",
        error,
      );
      return {
        devise_par_defaut: "EUR",
        tva_par_defaut: 20,
        seuil_alerte_stock_par_defaut: 10,
        quantite_minimum_par_defaut: 1,
        gestion_stock_par_defaut: true,
        tailles_images: {
          miniature: { width: 150, height: 150 },
          moyenne: { width: 400, height: 400 },
          grande: { width: 800, height: 800 },
        },
        formats_images_acceptes: ["jpg", "jpeg", "png", "webp"],
        taille_max_image_mo: 5,
        validation_auto_produits: false,
        moderation_avis: true,
        moderation_questions: true,
        meta_description_longueur_max: 160,
        meta_mots_cles_max: 10,
        notifications_stock_faible: true,
        notifications_nouvel_avis: true,
        notifications_nouvelle_question: true,
        formats_export_acceptes: ["csv", "excel"],
        taille_max_import_mo: 10,
      };
    }
  },

  // ==================== UTILITAIRES ====================

  /**
   * Incrémente le compteur de vues d'un produit
   */
  async incrementerVues(uuid: string): Promise<Produit> {
    try {
      const response = await api.post<ApiResponse<Produit>>(
        `/produits/${uuid}/incrementer-vues`,
      );

      let produit: Produit;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        produit = (response.data as any).data;
      } else {
        produit = response.data as Produit;
      }

      return produit;
    } catch (error: any) {
      console.error("Erreur lors de l'incrémentation des vues:", error);
      throw error;
    }
  },

  /**
   * Vérifie la disponibilité d'un produit
   */
  async verifierDisponibilite(
    uuid: string,
    quantite: number = 1,
  ): Promise<{
    disponible: boolean;
    quantite_disponible: number;
    delai_livraison?: number;
    message?: string;
  }> {
    try {
      const response = await api.get<ApiResponse<any>>(
        `/produits/${uuid}/disponibilite`,
        { params: { quantite } },
      );

      let result: any;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        result = (response.data as any).data;
      } else {
        result = response.data;
      }

      const defaultResult = {
        disponible: false,
        quantite_disponible: 0,
      };

      return { ...defaultResult, ...result };
    } catch (error: any) {
      console.error("Erreur lors de la vérification de disponibilité:", error);
      throw error;
    }
  },

  /**
   * Exporte des produits au format CSV
   */
  async exporterProduitsCSV(filters?: ProduitFilterParams): Promise<Blob> {
    try {
      const response = await api.post(`/produits/export/csv`, filters, {
        responseType: "blob",
      });

      return response;
    } catch (error: any) {
      console.error("Erreur lors de l'export des produits en CSV:", error);
      throw error;
    }
  },

  /**
   * Importe des produits depuis un fichier CSV
   */
  async importerProduitsCSV(
    file: File,
  ): Promise<{ imported: number; errors: string[] }> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post<
        ApiResponse<{ imported: number; errors: string[] }>
      >(`/produits/import/csv`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      let result: { imported: number; errors: string[] };
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        result = (response.data as any).data;
      } else {
        result = response.data as { imported: number; errors: string[] };
      }

      return result;
    } catch (error: any) {
      console.error("Erreur lors de l'import des produits:", error);
      throw error;
    }
  },

  /**
   * Duplique un produit
   */
  async dupliquerProduit(uuid: string): Promise<Produit> {
    try {
      const response = await api.post<ApiResponse<Produit>>(
        `/produits/${uuid}/dupliquer`,
      );

      let produit: Produit;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        produit = (response.data as any).data;
      } else {
        produit = response.data as Produit;
      }

      return produit;
    } catch (error: any) {
      console.error("Erreur lors de la duplication du produit:", error);
      throw error;
    }
  },

  /**
   * Teste le service des produits
   */
  async testerService(): Promise<{ success: boolean; message: string }> {
    try {
      const response =
        await api.get<ApiResponse<{ success: boolean; message: string }>>(
          `/produits/test`,
        );

      let result: { success: boolean; message: string };
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
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
};
