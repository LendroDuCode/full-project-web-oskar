// services/annonce.service.ts

import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";

export interface Annonce {
  uuid: string;
  id?: string | number;
  type: "produit" | "don" | "echange";
  titre?: string;
  nom?: string;
  libelle?: string;
  description?: string;
  prix?: number | string;
  image?: string;
  image_key?: string;
  statut?: string;
  estPublie?: boolean;
  estBloque?: boolean;
  dateCreation?: string;
  updatedAt?: string;
  quantite?: number;
  categorie_uuid?: string;
  categorie?: any;
  createur?: any;
}

export interface AnnonceResponse {
  data: Annonce[];
  success?: boolean;
  message?: string;
}

export interface ApiTestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
  timestamp: string;
  environment?: {
    nodeEnv: string;
    apiUrl: string;
    useProxy: boolean;
  };
}

/**
 * Service pour gérer les annonces (produits, dons, échanges)
 * Version corrigée pour la production
 */
class AnnonceService {
  private readonly isProduction: boolean;
  private readonly apiUrl: string;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://oskar-api.mysonec.pro';
    
    if (!this.isProduction) {
      console.log("📦 AnnonceService initialisé:", {
        isProduction: this.isProduction,
        apiUrl: this.apiUrl,
        useProxy: process.env.NEXT_PUBLIC_USE_PROXY === 'true'
      });
    }
  }

  // ============================================
  // PRODUITS
  // ============================================
  
  /**
   * Récupère tous les produits
   */
  async getTousProduits(): Promise<Annonce[]> {
    if (!this.isProduction) {
      console.log("📦 [Produits] Chargement de tous les produits...");
      console.log("📦 Endpoint:", API_ENDPOINTS.PRODUCTS.ALL);
    }
    
    const response = await api.get<any>(API_ENDPOINTS.PRODUCTS.ALL);
    return this.extractData(response);
  }

  /**
   * Récupère les produits publiés
   */
  async getProduitsPublies(): Promise<Annonce[]> {
    if (!this.isProduction) {
      console.log("📦 [Produits] Chargement des produits publiés...");
      console.log("📦 Endpoint:", API_ENDPOINTS.PRODUCTS.LISTE_PRODUITS_PUBLIES);
    }
    
    const response = await api.get<any>(API_ENDPOINTS.PRODUCTS.LISTE_PRODUITS_PUBLIES);
    return this.extractData(response);
  }

  /**
   * Récupère les produits en attente
   */
  async getProduitsEnAttente(): Promise<Annonce[]> {
    if (!this.isProduction) {
      console.log("📦 [Produits] Chargement des produits en attente...");
      console.log("📦 Endpoint:", API_ENDPOINTS.PRODUCTS.LISTE_PRODUITS_EN_ATTENTE);
    }
    
    const response = await api.get<any>(API_ENDPOINTS.PRODUCTS.LISTE_PRODUITS_EN_ATTENTE);
    return this.extractData(response);
  }

  /**
   * Récupère les produits bloqués
   */
  async getProduitsBloques(): Promise<Annonce[]> {
    if (!this.isProduction) {
      console.log("📦 [Produits] Chargement des produits bloqués...");
      console.log("📦 Endpoint:", API_ENDPOINTS.PRODUCTS.LISTE_PRODUITS_BLOQUES);
    }
    
    const response = await api.get<any>(API_ENDPOINTS.PRODUCTS.LISTE_PRODUITS_BLOQUES);
    return this.extractData(response);
  }

  // ============================================
  // DONS
  // ============================================

  /**
   * Récupère tous les dons
   */
  async getTousDons(): Promise<Annonce[]> {
    if (!this.isProduction) {
      console.log("📦 [Dons] Chargement de tous les dons...");
      console.log("📦 Endpoint:", API_ENDPOINTS.DONS.LIST);
    }
    
    const response = await api.get<any>(API_ENDPOINTS.DONS.LIST);
    return this.extractData(response);
  }

  /**
   * Récupère les dons publiés
   */
  async getDonsPublies(): Promise<Annonce[]> {
    if (!this.isProduction) {
      console.log("📦 [Dons] Chargement des dons publiés...");
      console.log("📦 Endpoint:", API_ENDPOINTS.DONS.LISTE_TOUS_DON_PUBLIE);
    }
    
    const response = await api.get<any>(API_ENDPOINTS.DONS.LISTE_TOUS_DON_PUBLIE);
    return this.extractData(response);
  }

  /**
   * Récupère les dons en attente
   */
  async getDonsEnAttente(): Promise<Annonce[]> {
    if (!this.isProduction) {
      console.log("📦 [Dons] Chargement des dons en attente...");
      console.log("📦 Endpoint:", API_ENDPOINTS.DONS.LISTE_TOUS_DON_EN_ATTENTE);
    }
    
    const response = await api.get<any>(API_ENDPOINTS.DONS.LISTE_TOUS_DON_EN_ATTENTE);
    return this.extractData(response);
  }

  /**
   * Récupère les dons bloqués
   */
  async getDonsBloques(): Promise<Annonce[]> {
    if (!this.isProduction) {
      console.log("📦 [Dons] Chargement des dons bloqués...");
      console.log("📦 Endpoint:", API_ENDPOINTS.DONS.LISTE_TOUS_DON_BLOQUES);
    }
    
    const response = await api.get<any>(API_ENDPOINTS.DONS.LISTE_TOUS_DON_BLOQUES);
    return this.extractData(response);
  }

  // ============================================
  // ÉCHANGES
  // ============================================

  /**
   * Récupère tous les échanges
   */
  async getTousEchanges(): Promise<Annonce[]> {
    if (!this.isProduction) {
      console.log("📦 [Échanges] Chargement de tous les échanges...");
      console.log("📦 Endpoint:", API_ENDPOINTS.ECHANGES.LIST);
    }
    
    const response = await api.get<any>(API_ENDPOINTS.ECHANGES.LIST);
    return this.extractData(response);
  }

  /**
   * Récupère les échanges publiés
   */
  async getEchangesPublies(): Promise<Annonce[]> {
    if (!this.isProduction) {
      console.log("📦 [Échanges] Chargement des échanges publiés...");
      console.log("📦 Endpoint:", API_ENDPOINTS.ECHANGES.LISTE_ECHANGES_PUBLIE);
    }
    
    const response = await api.get<any>(API_ENDPOINTS.ECHANGES.LISTE_ECHANGES_PUBLIE);
    return this.extractData(response);
  }

  /**
   * Récupère les échanges en attente
   */
  async getEchangesEnAttente(): Promise<Annonce[]> {
    if (!this.isProduction) {
      console.log("📦 [Échanges] Chargement des échanges en attente...");
      console.log("📦 Endpoint:", API_ENDPOINTS.ECHANGES.LISTE_ECHANGES_EN_ATTENTE);
    }
    
    const response = await api.get<any>(API_ENDPOINTS.ECHANGES.LISTE_ECHANGES_EN_ATTENTE);
    return this.extractData(response);
  }

  /**
   * Récupère les échanges bloqués
   */
  async getEchangesBloques(): Promise<Annonce[]> {
    if (!this.isProduction) {
      console.log("📦 [Échanges] Chargement des échanges bloqués...");
      console.log("📦 Endpoint:", API_ENDPOINTS.ECHANGES.LISTE_ECHANGES_BLOQUE);
    }
    
    const response = await api.get<any>(API_ENDPOINTS.ECHANGES.LISTE_ECHANGES_BLOQUE);
    return this.extractData(response);
  }

  // ============================================
  // ACTIONS SUR LES ANNONCES
  // ============================================

  /**
   * Valider une annonce
   */
  async validerAnnonce(uuid: string, type: string): Promise<any> {
    if (!this.isProduction) {
      console.log(`✅ Validation ${type}:`, uuid);
    }

    let endpoint = "";
    switch (type) {
      case "produit":
        endpoint = `/produits/${uuid}/validate`;
        break;
      case "don":
        endpoint = `/dons/${uuid}/validate`;
        break;
      case "echange":
        endpoint = `/echanges/${uuid}/validate`;
        break;
      default:
        throw new Error("Type d'annonce inconnu");
    }

    return await api.post(endpoint, {});
  }

  /**
   * Rejeter une annonce (supprimer)
   */
  async rejeterAnnonce(uuid: string, type: string): Promise<any> {
    if (!this.isProduction) {
      console.log(`❌ Rejet ${type}:`, uuid);
    }

    let endpoint = "";
    switch (type) {
      case "produit":
        endpoint = API_ENDPOINTS.PRODUCTS.DELETE(uuid);
        break;
      case "don":
        endpoint = API_ENDPOINTS.DONS.DELETE(uuid);
        break;
      case "echange":
        endpoint = API_ENDPOINTS.ECHANGES.DELETE(uuid);
        break;
      default:
        throw new Error("Type d'annonce inconnu");
    }

    return await api.delete(endpoint);
  }

  /**
   * Publier/Dépublier une annonce
   */
  async publierAnnonce(uuid: string, type: string, estPublie: boolean): Promise<any> {
    if (!this.isProduction) {
      console.log(`${estPublie ? "📢 Publication" : "🔇 Dépublication"} ${type}:`, uuid);
    }

    let endpoint = "";
    let data: any = {};

    switch (type) {
      case "produit":
        endpoint = API_ENDPOINTS.PRODUCTS.PUBLLIER;
        data = { productUuid: uuid, est_publie: estPublie };
        break;
      case "don":
        endpoint = API_ENDPOINTS.DONS.PUBLISH;
        data = { donUuid: uuid, est_publie: estPublie };
        break;
      case "echange":
        endpoint = API_ENDPOINTS.ECHANGES.PUBLISH;
        data = { echangeUuid: uuid, est_publie: estPublie };
        break;
      default:
        throw new Error("Type d'annonce inconnu");
    }

    return await api.post(endpoint, data);
  }

  /**
   * Bloquer/Débloquer une annonce
   */
  async bloquerAnnonce(uuid: string, type: string, estBloque: boolean): Promise<any> {
    if (!this.isProduction) {
      console.log(`${estBloque ? "🔒 Blocage" : "🔓 Déblocage"} ${type}:`, uuid);
    }

    let endpoint = "";
    let data: any = {};

    switch (type) {
      case "produit":
        endpoint = API_ENDPOINTS.PRODUCTS.BLOQUE_PRODUITS;
        data = { productUuid: uuid, est_bloque: estBloque };
        break;
      case "don":
        endpoint = API_ENDPOINTS.DONS.BLOQUE_DON;
        data = { donUuid: uuid, est_bloque: estBloque };
        break;
      case "echange":
        endpoint = API_ENDPOINTS.ECHANGES.BLOQUER_ECHNAGE;
        data = { echangeUuid: uuid, est_bloque: estBloque };
        break;
      default:
        throw new Error("Type d'annonce inconnu");
    }

    return await api.post(endpoint, data);
  }

  /**
   * Supprimer définitivement une annonce
   * Version qui utilise le même pattern que la page de détail
   */
  async supprimerAnnonce(uuid: string, type: string): Promise<any> {
    if (!this.isProduction) {
      console.log(`🗑️ Suppression définitive ${type}:`, uuid);
    }

    let endpoint = "";
    
    // Utiliser le même pattern que dans les pages de détail
    switch (type) {
      case "produit":
        endpoint = API_ENDPOINTS.PRODUCTS.DELETE(uuid);
        break;
      case "don":
        endpoint = API_ENDPOINTS.DONS.DELETE(uuid);
        console.log("📡 Endpoint don:", endpoint);
        break;
      case "echange":
        endpoint = API_ENDPOINTS.ECHANGES.DELETE(uuid);
        console.log("📡 Endpoint echange:", endpoint);
        break;
      default:
        throw new Error("Type d'annonce inconnu");
    }

    console.log("📡 Appel DELETE vers:", endpoint);
    return await api.delete(endpoint);
  }

  /**
   * Supprimer définitivement une annonce (version de secours avec URL directe)
   */
  async supprimerAnnonceDirect(uuid: string, type: string): Promise<any> {
    if (!this.isProduction) {
      console.log(`🗑️ Suppression directe ${type}:`, uuid);
    }

    let endpoint = "";
    switch (type) {
      case "produit":
        endpoint = `/produits/${uuid}`;
        break;
      case "don":
        endpoint = `/dons/${uuid}`;
        break;
      case "echange":
        endpoint = `/echanges/${uuid}`;
        break;
      default:
        throw new Error("Type d'annonce inconnu");
    }

    console.log("📡 Appel DELETE direct vers:", endpoint);
    return await api.delete(endpoint);
  }

  // ============================================
  // MÉTHODES PUBLIQUES POUR CHARGEMENT PAR STATUT
  // ============================================

  /**
   * Charge les produits selon le statut
   */
  async loadProduitsByStatus(
    status: "tous" | "publie" | "en-attente" | "bloque"
  ): Promise<Annonce[]> {
    if (!this.isProduction) {
      console.log(`📦 Chargement des produits (statut: ${status})`);
    }
    
    try {
      switch (status) {
        case "publie":
          return this.getProduitsPublies();
        case "en-attente":
          return this.getProduitsEnAttente();
        case "bloque":
          return this.getProduitsBloques();
        case "tous":
        default:
          return this.getTousProduits();
      }
    } catch (error) {
      console.error(`❌ Erreur chargement produits (${status}):`, error);
      return [];
    }
  }

  /**
   * Charge les dons selon le statut
   */
  async loadDonsByStatus(
    status: "tous" | "publie" | "en-attente" | "bloque"
  ): Promise<Annonce[]> {
    if (!this.isProduction) {
      console.log(`📦 Chargement des dons (statut: ${status})`);
    }
    
    try {
      switch (status) {
        case "publie":
          return this.getDonsPublies();
        case "en-attente":
          return this.getDonsEnAttente();
        case "bloque":
          return this.getDonsBloques();
        case "tous":
        default:
          return this.getTousDons();
      }
    } catch (error) {
      console.error(`❌ Erreur chargement dons (${status}):`, error);
      return [];
    }
  }

  /**
   * Charge les échanges selon le statut
   */
  async loadEchangesByStatus(
    status: "tous" | "publie" | "en-attente" | "bloque"
  ): Promise<Annonce[]> {
    if (!this.isProduction) {
      console.log(`📦 Chargement des échanges (statut: ${status})`);
    }
    
    try {
      switch (status) {
        case "publie":
          return this.getEchangesPublies();
        case "en-attente":
          return this.getEchangesEnAttente();
        case "bloque":
          return this.getEchangesBloques();
        case "tous":
        default:
          return this.getTousEchanges();
      }
    } catch (error) {
      console.error(`❌ Erreur chargement échanges (${status}):`, error);
      return [];
    }
  }

  // ============================================
  // MÉTHODES UTILITAIRES
  // ============================================

  /**
   * Extrait le tableau de données de la réponse API
   * Gère tous les formats possibles
   */
  private extractData(response: any): any[] {
    if (!response) {
      if (!this.isProduction) {
        console.warn("⚠️ Réponse vide reçue de l'API");
      }
      return [];
    }
    
    // Si c'est déjà un tableau
    if (Array.isArray(response)) {
      if (!this.isProduction) {
        console.log(`📊 Données extraites: tableau de ${response.length} éléments`);
      }
      return response;
    }
    
    // Si la réponse a une propriété 'data' qui est un tableau
    if (response.data && Array.isArray(response.data)) {
      if (!this.isProduction) {
        console.log(`📊 Données extraites: response.data (${response.data.length} éléments)`);
      }
      return response.data;
    }
    
    // Si la réponse a une propriété 'results' qui est un tableau
    if (response.results && Array.isArray(response.results)) {
      if (!this.isProduction) {
        console.log(`📊 Données extraites: response.results (${response.results.length} éléments)`);
      }
      return response.results;
    }
    
    // Si la réponse a une propriété 'items' qui est un tableau
    if (response.items && Array.isArray(response.items)) {
      if (!this.isProduction) {
        console.log(`📊 Données extraites: response.items (${response.items.length} éléments)`);
      }
      return response.items;
    }
    
    // Si la réponse a une propriété 'content' qui est un tableau
    if (response.content && Array.isArray(response.content)) {
      if (!this.isProduction) {
        console.log(`📊 Données extraites: response.content (${response.content.length} éléments)`);
      }
      return response.content;
    }
    
    // Si la réponse a une propriété 'annonces' qui est un tableau
    if (response.annonces && Array.isArray(response.annonces)) {
      if (!this.isProduction) {
        console.log(`📊 Données extraites: response.annonces (${response.annonces.length} éléments)`);
      }
      return response.annonces;
    }
    
    // Si la réponse a une propriété 'produits' qui est un tableau
    if (response.produits && Array.isArray(response.produits)) {
      if (!this.isProduction) {
        console.log(`📊 Données extraites: response.produits (${response.produits.length} éléments)`);
      }
      return response.produits;
    }
    
    // Si la réponse a une propriété 'dons' qui est un tableau
    if (response.dons && Array.isArray(response.dons)) {
      if (!this.isProduction) {
        console.log(`📊 Données extraites: response.dons (${response.dons.length} éléments)`);
      }
      return response.dons;
    }
    
    // Si la réponse a une propriété 'echanges' qui est un tableau
    if (response.echanges && Array.isArray(response.echanges)) {
      if (!this.isProduction) {
        console.log(`📊 Données extraites: response.echanges (${response.echanges.length} éléments)`);
      }
      return response.echanges;
    }
    
    // Si la réponse a une propriété 'success' et 'data'
    if (response.success === true && response.data) {
      if (Array.isArray(response.data)) {
        if (!this.isProduction) {
          console.log(`📊 Données extraites: response.data (${response.data.length} éléments)`);
        }
        return response.data;
      }
    }
    
    if (!this.isProduction) {
      console.warn("⚠️ Structure de réponse inattendue:", Object.keys(response));
      console.warn("⚠️ Échantillon:", JSON.stringify(response).substring(0, 200) + "...");
    }
    
    return [];
  }

  /**
   * Charge les annonces selon le type et le statut
   */
  async loadByTypeAndStatus(
    type: "tous" | "produit" | "don" | "echange",
    status: "tous" | "publie" | "en-attente" | "bloque"
  ): Promise<Annonce[]> {
    if (!this.isProduction) {
      console.log(`📦 Chargement par type="${type}", statut="${status}"`);
    }
    
    // Si type = "tous", on charge tout et on combine
    if (type === "tous") {
      const [produits, dons, echanges] = await Promise.all([
        this.loadProduitsByStatus(status),
        this.loadDonsByStatus(status),
        this.loadEchangesByStatus(status),
      ]);
      
      const result = [...produits, ...dons, ...echanges];
      
      if (!this.isProduction) {
        console.log(`📊 Total combiné: ${result.length} annonces (produits:${produits.length}, dons:${dons.length}, echanges:${echanges.length})`);
      }
      
      return result;
    }
    
    // Sinon, on charge le type spécifique
    switch (type) {
      case "produit":
        return this.loadProduitsByStatus(status);
      case "don":
        return this.loadDonsByStatus(status);
      case "echange":
        return this.loadEchangesByStatus(status);
      default:
        return [];
    }
  }

  // ============================================
  // MÉTHODES DE DIAGNOSTIC
  // ============================================

  /**
   * Teste la connexion à l'API
   * Utile pour déboguer les problèmes en production
   */
  async testConnection(): Promise<ApiTestResult> {
    const timestamp = new Date().toISOString();
    const environment = {
      nodeEnv: process.env.NODE_ENV || 'development',
      apiUrl: this.apiUrl,
      useProxy: process.env.NEXT_PUBLIC_USE_PROXY === 'true',
    };

    console.log("🔍 Test de connexion API - Début");
    console.log("🔍 Environnement:", environment);

    try {
      // Tester un endpoint simple (produits publiés)
      console.log("🔍 Appel à:", API_ENDPOINTS.PRODUCTS.LISTE_PRODUITS_PUBLIES);
      
      const startTime = Date.now();
      const response = await api.get(API_ENDPOINTS.PRODUCTS.LISTE_PRODUITS_PUBLIES);
      const duration = Date.now() - startTime;

      console.log(`✅ Réponse reçue en ${duration}ms`);

      const extracted = this.extractData(response);

      return {
        success: true,
        message: "Connexion API réussie",
        timestamp,
        environment,
        data: {
          responseType: typeof response,
          isArray: Array.isArray(response),
          extractedCount: extracted.length,
          duration: `${duration}ms`,
          sample: extracted.length > 0 ? extracted[0] : null,
          rawKeys: response ? Object.keys(response) : [],
        },
      };
    } catch (error: any) {
      console.error("❌ Erreur de connexion API:", error);

      let errorMessage = "Erreur inconnue";
      let errorDetails: any = {};

      if (error.status === 404) {
        errorMessage = "API non trouvée (404)";
        errorDetails = {
          url: error.url,
          message: error.message,
          status: error.status,
        };
      } else if (error.status === 500) {
        errorMessage = "Erreur serveur (500)";
        errorDetails = {
          message: error.message,
          status: error.status,
        };
      } else if (error.message?.includes('fetch')) {
        errorMessage = "Erreur réseau - impossible de joindre le serveur";
        errorDetails = {
          message: error.message,
          type: 'network_error',
        };
      } else if (error.name === 'AbortError') {
        errorMessage = "Requête annulée (timeout)";
      }

      return {
        success: false,
        message: errorMessage,
        timestamp,
        environment,
        error: errorDetails,
        data: {
          errorMessage: error.message,
          errorStack: this.isProduction ? undefined : error.stack,
        },
      };
    }
  }

  /**
   * Récupère la configuration actuelle
   */
  getConfig() {
    return {
      isProduction: this.isProduction,
      apiUrl: this.apiUrl,
      useProxy: process.env.NEXT_PUBLIC_USE_PROXY === 'true',
      nodeEnv: process.env.NODE_ENV,
    };
  }

  /**
   * Récupère les statistiques rapides
   */
  async getQuickStats(): Promise<any> {
    try {
      const [produits, dons, echanges] = await Promise.all([
        this.getTousProduits().catch(() => []),
        this.getTousDons().catch(() => []),
        this.getTousEchanges().catch(() => []),
      ]);

      return {
        total: produits.length + dons.length + echanges.length,
        produits: produits.length,
        dons: dons.length,
        echanges: echanges.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("❌ Erreur stats:", error);
      return {
        error: "Impossible de récupérer les statistiques",
        timestamp: new Date().toISOString(),
      };
    }
  }
}

// Instance unique exportée
export const annonceService = new AnnonceService();

// Export également la classe pour les tests
export default AnnonceService;