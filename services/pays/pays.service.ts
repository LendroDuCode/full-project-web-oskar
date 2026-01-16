// services/pays/pays.service.ts
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import type {
  Pays,
  PaysCreateData,
  PaysUpdateData,
  PaysFilterParams,
  PaysPaginationParams,
  PaysStats,
  Ville,
  VilleCreateData,
  PaysSearchResult,
  PaysTraduction,
  PaysImportData,
  PaysExportOptions,
  Region,
  PaysHistorique,
  PaysRelation,
  PaysCarteData,
  LocalisationData,
} from "./pays.types";

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
 * Service complet pour la gestion des pays
 * Centralise toutes les opérations liées aux pays et à la localisation
 */
export const paysService = {
  // ==================== CRUD Pays ====================

  /**
   * Récupère la liste des pays avec pagination et filtres
   * @param params Paramètres de pagination et filtres
   * @returns Liste paginée de pays avec métadonnées
   */
  async getPays(params?: PaysPaginationParams): Promise<PaysSearchResult> {
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
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value)) {
            queryParams.append(key, value.join(","));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.PAYS.LIST}?${queryString}`
      : API_ENDPOINTS.PAYS.LIST;

    console.log("🌍 Fetching pays from:", endpoint);

    try {
      const response = await api.get<ApiResponse<Pays[]>>(endpoint);

      console.log("✅ Pays response received:", {
        hasData: !!response.data,
        count: response.count,
        total: response.total,
      });

      let pays: Pays[] = [];
      let total = 0;
      let page = 1;
      let pages = 1;

      if (Array.isArray(response.data)) {
        pays = response.data;
        total = response.total || pays.length;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        pays = (response.data as any).data || [];
        total = (response.data as any).total || pays.length;
        page = (response.data as any).page || 1;
        pages = (response.data as any).pages || 1;
      }

      return {
        pays,
        total,
        page,
        pages,
        suggestions: (response as any).suggestions,
      };
    } catch (error: any) {
      console.error("🚨 Error in paysService.getPays:", {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  /**
   * Récupère uniquement les pays actifs
   * @returns Liste des pays actifs
   */
  async getPaysActifs(): Promise<Pays[]> {
    try {
      console.log("🌍 Fetching active pays");

      const response = await api.get<ApiResponse<Pays[]>>(
        API_ENDPOINTS.PAYS.ACTIFS,
      );

      let pays: Pays[] = [];
      if (Array.isArray(response.data)) {
        pays = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        pays = (response.data as any).data || [];
      }

      console.log("✅ Found", pays.length, "active pays");
      return pays;
    } catch (error: any) {
      console.error("❌ Error getting active pays:", error);
      throw error;
    }
  },

  /**
   * Récupère un pays par son UUID
   * @param uuid UUID du pays
   * @returns Détails du pays
   */
  async getPaysByUuid(uuid: string): Promise<Pays> {
    try {
      console.log("🔍 Fetching pays by UUID:", uuid);

      const response = await api.get<ApiResponse<Pays>>(
        API_ENDPOINTS.PAYS.DETAIL(uuid),
      );

      let pays: Pays;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        pays = (response.data as any).data;
      } else {
        pays = response.data as Pays;
      }

      if (!pays || !pays.uuid) {
        throw new Error("Pays non trouvé");
      }

      console.log("✅ Pays found:", pays.nom);
      return pays;
    } catch (error: any) {
      console.error("❌ Error fetching pays:", {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  /**
   * Récupère un pays par son code ISO
   * @param code Code ISO du pays (ex: "FR", "CI")
   * @returns Détails du pays
   */
  async getPaysByCode(code: string): Promise<Pays> {
    try {
      console.log("🔍 Fetching pays by code:", code);

      const response = await api.get<ApiResponse<Pays>>(
        API_ENDPOINTS.PAYS.BY_CODE(code),
      );

      let pays: Pays;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        pays = (response.data as any).data;
      } else {
        pays = response.data as Pays;
      }

      console.log("✅ Pays found by code");
      return pays;
    } catch (error: any) {
      console.error("❌ Error fetching pays by code:", error);
      throw error;
    }
  },

  /**
   * Récupère un pays par son nom
   * @param nom Nom du pays
   * @returns Détails du pays
   */
  async getPaysByNom(nom: string): Promise<Pays> {
    try {
      console.log("🔍 Fetching pays by name:", nom);

      const response = await api.get<ApiResponse<Pays>>(
        API_ENDPOINTS.PAYS.BY_NOM(nom),
      );

      let pays: Pays;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        pays = (response.data as any).data;
      } else {
        pays = response.data as Pays;
      }

      console.log("✅ Pays found by name");
      return pays;
    } catch (error: any) {
      console.error("❌ Error fetching pays by name:", error);
      throw error;
    }
  },

  /**
   * Crée un nouveau pays
   * @param paysData Données du pays à créer
   * @returns Pays créé
   */
  async createPays(paysData: PaysCreateData): Promise<Pays> {
    try {
      console.log("🆕 Creating pays:", paysData.nom);

      const response = await api.post<ApiResponse<Pays>>(
        API_ENDPOINTS.PAYS.CREATE,
        paysData,
      );

      console.log("✅ Pays creation response:", response.data);

      let createdPays: Pays;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        createdPays = (response.data as any).data;
      } else {
        createdPays = response.data as Pays;
      }

      if (!createdPays || !createdPays.uuid) {
        throw new Error("Échec de la création du pays");
      }

      return createdPays;
    } catch (error: any) {
      console.error("❌ Error creating pays:", {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  /**
   * Met à jour un pays existant
   * @param uuid UUID du pays à mettre à jour
   * @param paysData Données de mise à jour
   * @returns Pays mis à jour
   */
  async updatePays(uuid: string, paysData: PaysUpdateData): Promise<Pays> {
    try {
      console.log("✏️ Updating pays:", uuid);

      const response = await api.put<ApiResponse<Pays>>(
        API_ENDPOINTS.PAYS.UPDATE(uuid),
        paysData,
      );

      console.log("✅ Pays update response:", response.data);

      let updatedPays: Pays;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        updatedPays = (response.data as any).data;
      } else {
        updatedPays = response.data as Pays;
      }

      return updatedPays;
    } catch (error: any) {
      console.error("❌ Error updating pays:", error);
      throw error;
    }
  },

  /**
   * Met à jour l'indicatif téléphonique d'un pays
   * @param uuid UUID du pays
   * @param indicatif Nouvel indicatif
   * @returns Pays mis à jour
   */
  async updatePaysIndicatif(uuid: string, indicatif: string): Promise<Pays> {
    try {
      console.log("📞 Updating pays indicatif:", uuid, "->", indicatif);

      const response = await api.put<ApiResponse<Pays>>(
        API_ENDPOINTS.PAYS.UPDATE_INDICATIF(uuid, indicatif),
        {},
      );

      let updatedPays: Pays;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        updatedPays = (response.data as any).data;
      } else {
        updatedPays = response.data as Pays;
      }

      console.log("✅ Indicatif updated");
      return updatedPays;
    } catch (error: any) {
      console.error("❌ Error updating pays indicatif:", error);
      throw error;
    }
  },

  /**
   * Supprime un pays
   * @param uuid UUID du pays à supprimer
   * @returns Message de confirmation
   */
  async deletePays(uuid: string): Promise<{ message: string }> {
    try {
      console.log("🗑️ Deleting pays:", uuid);

      const response = await api.delete<ApiResponse<{ message: string }>>(
        API_ENDPOINTS.PAYS.DELETE(uuid),
      );

      console.log("✅ Pays deleted successfully");
      return response.data as { message: string };
    } catch (error: any) {
      console.error("❌ Error deleting pays:", error);
      throw error;
    }
  },

  // ==================== Gestion des Villes ====================

  /**
   * Récupère les villes d'un pays
   * @param paysUuid UUID du pays
   * @returns Liste des villes du pays
   */
  async getVillesByPays(paysUuid: string): Promise<Ville[]> {
    try {
      console.log("🏙️ Fetching villes for pays:", paysUuid);

      const response = await api.get<ApiResponse<Ville[]>>(
        API_ENDPOINTS.VILLES.BY_PAYS(paysUuid),
      );

      let villes: Ville[] = [];
      if (Array.isArray(response.data)) {
        villes = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        villes = (response.data as any).data || [];
      }

      console.log("✅ Found", villes.length, "villes");
      return villes;
    } catch (error: any) {
      console.error("❌ Error getting villes by pays:", error);
      throw error;
    }
  },

  /**
   * Récupère les villes par code postal
   * @param codePostal Code postal à rechercher
   * @returns Liste des villes correspondantes
   */
  async getVillesByCodePostal(codePostal: string): Promise<Ville[]> {
    try {
      console.log("📮 Fetching villes by postal code:", codePostal);

      const response = await api.get<ApiResponse<Ville[]>>(
        API_ENDPOINTS.VILLES.BY_CODE_POSTAL(codePostal),
      );

      let villes: Ville[] = [];
      if (Array.isArray(response.data)) {
        villes = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        villes = (response.data as any).data || [];
      }

      console.log(
        "✅ Found",
        villes.length,
        "villes with postal code",
        codePostal,
      );
      return villes;
    } catch (error: any) {
      console.error("❌ Error getting villes by postal code:", error);
      throw error;
    }
  },

  /**
   * Crée une nouvelle ville
   * @param villeData Données de la ville à créer
   * @returns Ville créée
   */
  async createVille(villeData: VilleCreateData): Promise<Ville> {
    try {
      console.log("🆕 Creating ville:", villeData.nom);

      const response = await api.post<ApiResponse<Ville>>(
        API_ENDPOINTS.VILLES.CREATE,
        villeData,
      );

      console.log("✅ Ville creation response:", response.data);

      let createdVille: Ville;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        createdVille = (response.data as any).data;
      } else {
        createdVille = response.data as Ville;
      }

      if (!createdVille || !createdVille.uuid) {
        throw new Error("Échec de la création de la ville");
      }

      return createdVille;
    } catch (error: any) {
      console.error("❌ Error creating ville:", error);
      throw error;
    }
  },

  /**
   * Active une ville
   * @param uuid UUID de la ville
   * @returns Ville activée
   */
  async activateVille(uuid: string): Promise<Ville> {
    try {
      console.log("✅ Activating ville:", uuid);

      const response = await api.put<ApiResponse<Ville>>(
        API_ENDPOINTS.VILLES.ACTIVATE(uuid),
        {},
      );

      let ville: Ville;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        ville = (response.data as any).data;
      } else {
        ville = response.data as Ville;
      }

      console.log("✅ Ville activated");
      return ville;
    } catch (error: any) {
      console.error("❌ Error activating ville:", error);
      throw error;
    }
  },

  /**
   * Désactive une ville
   * @param uuid UUID de la ville
   * @returns Ville désactivée
   */
  async deactivateVille(uuid: string): Promise<Ville> {
    try {
      console.log("❌ Deactivating ville:", uuid);

      const response = await api.put<ApiResponse<Ville>>(
        API_ENDPOINTS.VILLES.DEACTIVATE(uuid),
        {},
      );

      let ville: Ville;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        ville = (response.data as any).data;
      } else {
        ville = response.data as Ville;
      }

      console.log("✅ Ville deactivated");
      return ville;
    } catch (error: any) {
      console.error("❌ Error deactivating ville:", error);
      throw error;
    }
  },

  /**
   * Supprime une ville
   * @param uuid UUID de la ville
   * @returns Message de confirmation
   */
  async deleteVille(uuid: string): Promise<{ message: string }> {
    try {
      console.log("🗑️ Deleting ville:", uuid);

      const response = await api.delete<ApiResponse<{ message: string }>>(
        API_ENDPOINTS.VILLES.DELETE(uuid),
      );

      console.log("✅ Ville deleted successfully");
      return response.data as { message: string };
    } catch (error: any) {
      console.error("❌ Error deleting ville:", error);
      throw error;
    }
  },

  // ==================== Statistiques et Analytics ====================

  /**
   * Récupère les statistiques des pays
   * @returns Statistiques détaillées
   */
  async getPaysStats(): Promise<PaysStats> {
    try {
      console.log("📊 Fetching pays statistics");

      const response = await api.get<ApiResponse<PaysStats>>(
        API_ENDPOINTS.PAYS.STATS,
      );

      let stats: PaysStats;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        stats = (response.data as any).data;
      } else {
        stats = response.data as PaysStats;
      }

      console.log("✅ Statistics loaded");
      return stats;
    } catch (error: any) {
      console.error("❌ Error getting pays statistics:", error);
      throw error;
    }
  },

  /**
   * Récupère les statistiques des villes
   * @param paysUuid UUID du pays (optionnel)
   * @returns Statistiques des villes
   */
  async getVillesStats(paysUuid?: string): Promise<any> {
    try {
      console.log("📊 Fetching villes statistics");

      const endpoint = paysUuid
        ? `${API_ENDPOINTS.VILLES.STATS}?pays_uuid=${paysUuid}`
        : API_ENDPOINTS.VILLES.STATS;

      const response = await api.get<ApiResponse<any>>(endpoint);

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

      console.log("✅ Villes statistics loaded");
      return stats;
    } catch (error: any) {
      console.error("❌ Error getting villes statistics:", error);
      throw error;
    }
  },

  // ==================== Import/Export ====================

  /**
   * Exporte les pays dans un format spécifique
   * @param options Options d'export
   * @returns Fichier exporté
   */
  async exportPays(options: PaysExportOptions): Promise<Blob> {
    try {
      console.log("📤 Exporting pays in format:", options.format);

      const response = await api.post<Blob>(
        API_ENDPOINTS.PAYS.EXPORT_PDF,
        options,
        {
          responseType: "blob",
        },
      );

      console.log("✅ Export completed");
      return response.data;
    } catch (error: any) {
      console.error("❌ Error exporting pays:", error);
      throw error;
    }
  },

  /**
   * Exporte les villes dans un format spécifique
   * @param options Options d'export
   * @returns Fichier exporté
   */
  async exportVilles(options: any): Promise<Blob> {
    try {
      console.log("📤 Exporting villes");

      const response = await api.post<Blob>(
        API_ENDPOINTS.VILLES.EXPORT_PDF,
        options,
        {
          responseType: "blob",
        },
      );

      console.log("✅ Villes export completed");
      return response.data;
    } catch (error: any) {
      console.error("❌ Error exporting villes:", error);
      throw error;
    }
  },

  /**
   * Importe des pays depuis un fichier
   * @param importData Données d'import
   * @returns Résultat de l'import
   */
  async importPays(importData: PaysImportData): Promise<{
    success: boolean;
    imported: number;
    errors: any[];
  }> {
    try {
      console.log("📥 Importing pays");

      const formData = new FormData();
      formData.append("format", importData.format);
      formData.append("data", JSON.stringify(importData.data));
      formData.append("options", JSON.stringify(importData.options || {}));

      const response = await api.post<ApiResponse<any>>(
        API_ENDPOINTS.PAYS.IMPORT,
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
      console.error("❌ Error importing pays:", error);
      throw error;
    }
  },

  // ==================== Recherche Avancée ====================

  /**
   * Recherche de pays avec suggestions
   * @param query Terme de recherche
   * @param limit Limite de résultats
   * @returns Résultats de recherche
   */
  async searchPays(
    query: string,
    limit: number = 10,
  ): Promise<PaysSearchResult> {
    try {
      console.log("🔎 Searching pays:", query);

      const response = await api.get<ApiResponse<Pays[]>>(
        `${API_ENDPOINTS.PAYS.SEARCH}?q=${encodeURIComponent(query)}&limit=${limit}`,
      );

      let pays: Pays[] = [];
      let total = 0;
      let page = 1;
      let pages = 1;

      if (Array.isArray(response.data)) {
        pays = response.data;
        total = pays.length;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        pays = (response.data as any).data || [];
        total = (response.data as any).total || pays.length;
        page = (response.data as any).page || 1;
        pages = (response.data as any).pages || 1;
      }

      console.log("✅ Search completed, found", pays.length, "results");
      return {
        pays,
        total,
        page,
        pages,
        suggestions: (response as any).suggestions,
      };
    } catch (error: any) {
      console.error("❌ Error searching pays:", error);
      throw error;
    }
  },

  /**
   * Recherche géographique de pays
   * @param latitude Latitude
   * @param longitude Longitude
   * @param radius Rayon en km
   * @returns Pays à proximité
   */
  async searchPaysByLocation(
    latitude: number,
    longitude: number,
    radius: number = 100,
  ): Promise<Pays[]> {
    try {
      console.log("📍 Searching pays by location:", latitude, longitude);

      const response = await api.get<ApiResponse<Pays[]>>(
        `${API_ENDPOINTS.PAYS.SEARCH_LOCATION}?lat=${latitude}&lng=${longitude}&radius=${radius}`,
      );

      let pays: Pays[] = [];
      if (Array.isArray(response.data)) {
        pays = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        pays = (response.data as any).data || [];
      }

      console.log("✅ Found", pays.length, "pays near location");
      return pays;
    } catch (error: any) {
      console.error("❌ Error searching pays by location:", error);
      throw error;
    }
  },

  // ==================== Utilitaires ====================

  /**
   * Récupère les données de localisation complètes
   * @param paysUuid UUID du pays
   * @returns Données de localisation complètes
   */
  async getLocalisationData(paysUuid: string): Promise<LocalisationData> {
    try {
      console.log("📍 Getting localisation data for pays:", paysUuid);

      const [pays, villes] = await Promise.all([
        this.getPaysByUuid(paysUuid),
        this.getVillesByPays(paysUuid),
      ]);

      // Filtrer les villes principales (capitales et grandes villes)
      const villes_principales = villes.filter(
        (ville) =>
          ville.capitale || (ville.population && ville.population > 1000000),
      );

      const statistiques = {
        nombre_villes: villes.length,
        population_totale: villes.reduce(
          (sum, ville) => sum + (ville.population || 0),
          0,
        ),
        superficie_totale: villes.reduce(
          (sum, ville) => sum + (ville.superficie || 0),
          0,
        ),
      };

      return {
        pays,
        villes,
        villes_principales,
        statistiques,
      };
    } catch (error: any) {
      console.error("❌ Error getting localisation data:", error);
      throw error;
    }
  },

  /**
   * Récupère les données pour la carte géographique
   * @returns Données pour la carte
   */
  async getCarteData(): Promise<PaysCarteData[]> {
    try {
      console.log("🗺️ Getting map data");

      const response = await api.get<ApiResponse<PaysCarteData[]>>(
        API_ENDPOINTS.PAYS.CARTE_DATA,
      );

      let carteData: PaysCarteData[] = [];
      if (Array.isArray(response.data)) {
        carteData = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        carteData = (response.data as any).data || [];
      }

      console.log("✅ Map data loaded for", carteData.length, "pays");
      return carteData;
    } catch (error: any) {
      console.error("❌ Error getting map data:", error);
      throw error;
    }
  },

  /**
   * Valide une adresse
   * @param paysCode Code du pays
   * @param ville Ville
   * @param codePostal Code postal
   * @returns Validation result
   */
  async validateAdresse(
    paysCode: string,
    ville: string,
    codePostal?: string,
  ): Promise<{
    valid: boolean;
    message?: string;
    suggestions?: Ville[];
  }> {
    try {
      console.log("📮 Validating address:", { paysCode, ville, codePostal });

      const params = new URLSearchParams();
      params.append("pays_code", paysCode);
      params.append("ville", ville);
      if (codePostal) params.append("code_postal", codePostal);

      const response = await api.get<ApiResponse<any>>(
        `${API_ENDPOINTS.PAYS.VALIDATE_ADRESSE}?${params.toString()}`,
      );

      return {
        valid: (response.data as any).valid || false,
        message: (response.data as any).message,
        suggestions: (response.data as any).suggestions,
      };
    } catch (error: any) {
      console.error("❌ Error validating address:", error);
      throw error;
    }
  },

  /**
   * Récupère les pays par continent
   * @param continent Continent à filtrer
   * @returns Liste des pays du continent
   */
  async getPaysByContinent(continent: string): Promise<Pays[]> {
    try {
      console.log("🌐 Getting pays by continent:", continent);

      const { pays } = await this.getPays({
        filters: { continent },
      });

      console.log("✅ Found", pays.length, "pays in", continent);
      return pays;
    } catch (error: any) {
      console.error("❌ Error getting pays by continent:", error);
      throw error;
    }
  },

  /**
   * Récupère les régions disponibles
   * @returns Liste des régions
   */
  async getRegions(): Promise<Region[]> {
    try {
      console.log("🗺️ Getting regions");

      const response = await api.get<ApiResponse<Region[]>>(
        API_ENDPOINTS.PAYS.REGIONS,
      );

      let regions: Region[] = [];
      if (Array.isArray(response.data)) {
        regions = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        regions = (response.data as any).data || [];
      }

      console.log("✅ Found", regions.length, "regions");
      return regions;
    } catch (error: any) {
      console.error("❌ Error getting regions:", error);
      throw error;
    }
  },

  // ==================== Gestion des Traductions ====================

  /**
   * Récupère les traductions d'un pays
   * @param paysUuid UUID du pays
   * @returns Liste des traductions
   */
  async getPaysTraductions(paysUuid: string): Promise<PaysTraduction[]> {
    try {
      console.log("🌍 Getting pays translations:", paysUuid);

      const response = await api.get<ApiResponse<PaysTraduction[]>>(
        `${API_ENDPOINTS.PAYS.TRADUCTIONS}/${paysUuid}`,
      );

      let traductions: PaysTraduction[] = [];
      if (Array.isArray(response.data)) {
        traductions = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        traductions = (response.data as any).data || [];
      }

      console.log("✅ Found", traductions.length, "translations");
      return traductions;
    } catch (error: any) {
      console.error("❌ Error getting pays translations:", error);
      throw error;
    }
  },

  /**
   * Ajoute une traduction pour un pays
   * @param traduction Données de traduction
   * @returns Traduction ajoutée
   */
  async addPaysTraduction(
    traduction: Omit<PaysTraduction, "uuid" | "date_traduction">,
  ): Promise<PaysTraduction> {
    try {
      console.log("➕ Adding pays translation");

      const response = await api.post<ApiResponse<PaysTraduction>>(
        API_ENDPOINTS.PAYS.ADD_TRADUCTION,
        traduction,
      );

      let addedTraduction: PaysTraduction;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        addedTraduction = (response.data as any).data;
      } else {
        addedTraduction = response.data as PaysTraduction;
      }

      console.log("✅ Translation added");
      return addedTraduction;
    } catch (error: any) {
      console.error("❌ Error adding pays translation:", error);
      throw error;
    }
  },

  // ==================== Gestion des Relations ====================

  /**
   * Récupère les relations d'un pays
   * @param paysUuid UUID du pays
   * @returns Liste des relations
   */
  async getPaysRelations(paysUuid: string): Promise<PaysRelation[]> {
    try {
      console.log("🤝 Getting pays relations:", paysUuid);

      const response = await api.get<ApiResponse<PaysRelation[]>>(
        `${API_ENDPOINTS.PAYS.RELATIONS}/${paysUuid}`,
      );

      let relations: PaysRelation[] = [];
      if (Array.isArray(response.data)) {
        relations = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        relations = (response.data as any).data || [];
      }

      console.log("✅ Found", relations.length, "relations");
      return relations;
    } catch (error: any) {
      console.error("❌ Error getting pays relations:", error);
      throw error;
    }
  },

  /**
   * Récupère l'historique des modifications d'un pays
   * @param paysUuid UUID du pays
   * @returns Historique des modifications
   */
  async getPaysHistorique(paysUuid: string): Promise<PaysHistorique[]> {
    try {
      console.log("📜 Getting pays history:", paysUuid);

      const response = await api.get<ApiResponse<PaysHistorique[]>>(
        `${API_ENDPOINTS.PAYS.HISTORIQUE}/${paysUuid}`,
      );

      let historique: PaysHistorique[] = [];
      if (Array.isArray(response.data)) {
        historique = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        historique = (response.data as any).data || [];
      }

      console.log("✅ Found", historique.length, "history entries");
      return historique;
    } catch (error: any) {
      console.error("❌ Error getting pays history:", error);
      throw error;
    }
  },

  // ==================== Utilitaires de Formatage ====================

  /**
   * Formate un numéro de téléphone selon le pays
   * @param numero Numéro à formater
   * @param paysCode Code du pays
   * @returns Numéro formaté
   */
  async formatTelephone(numero: string, paysCode: string): Promise<string> {
    try {
      console.log("📱 Formatting phone number for country:", paysCode);

      const response = await api.get<ApiResponse<{ formatted: string }>>(
        `${API_ENDPOINTS.PAYS.FORMAT_TELEPHONE}?numero=${encodeURIComponent(numero)}&pays_code=${paysCode}`,
      );

      return (response.data as any).formatted || numero;
    } catch (error: any) {
      console.error("❌ Error formatting phone number:", error);
      return numero;
    }
  },

  /**
   * Récupère les fuseaux horaires disponibles pour un pays
   * @param paysCode Code du pays
   * @returns Liste des fuseaux horaires
   */
  async getFuseauxHoraires(paysCode: string): Promise<string[]> {
    try {
      console.log("⏰ Getting timezones for country:", paysCode);

      const response = await api.get<ApiResponse<string[]>>(
        `${API_ENDPOINTS.PAYS.FUSEAUX_HORAIRES}?pays_code=${paysCode}`,
      );

      let fuseaux: string[] = [];
      if (Array.isArray(response.data)) {
        fuseaux = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        fuseaux = (response.data as any).data || [];
      }

      console.log("✅ Found", fuseaux.length, "timezones");
      return fuseaux;
    } catch (error: any) {
      console.error("❌ Error getting timezones:", error);
      return [];
    }
  },

  /**
   * Convertit une devise
   * @param montant Montant à convertir
   * @param deviseSource Devise source
   * @param deviseCible Devise cible
   * @returns Montant converti
   */
  async convertirDevise(
    montant: number,
    deviseSource: string,
    deviseCible: string,
  ): Promise<number> {
    try {
      console.log(
        "💱 Converting currency:",
        montant,
        deviseSource,
        "->",
        deviseCible,
      );

      const response = await api.get<ApiResponse<{ converted: number }>>(
        `${API_ENDPOINTS.PAYS.CONVERTIR_DEVISE}?montant=${montant}&source=${deviseSource}&cible=${deviseCible}`,
      );

      return (response.data as any).converted || montant;
    } catch (error: any) {
      console.error("❌ Error converting currency:", error);
      return montant;
    }
  },
};
