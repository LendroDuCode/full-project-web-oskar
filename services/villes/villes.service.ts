// services/villes/villes.service.ts
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import type {
  Ville,
  VilleCreateData,
  VilleUpdateData,
  VilleFilterParams,
  VilleStats,
  Region,
  Departement,
  RechercheVilleResultat,
  DistanceVilles,
  VilleMeteo,
  ZoneGeographique,
  Quartier,
  CodePostal,
  ExportVillesOptions,
  ImportVillesData,
  VilleAutocomplete,
  VilleCarte,
  ComparaisonVilles,
} from "./villes.types";

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
 * Service complet pour la gestion des villes
 */
export const villesService = {
  // ==================== CRUD Villes ====================

  /**
   * Récupère la liste des villes
   */
  async getVilles(params?: {
    page?: number;
    limit?: number;
    search?: string;
    pays_uuid?: string;
    region_uuid?: string;
    departement_uuid?: string;
    actif?: boolean;
    capitale?: boolean;
    sort_by?: string;
    sort_order?: "asc" | "desc";
  }): Promise<RechercheVilleResultat> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.pays_uuid) queryParams.append("pays_uuid", params.pays_uuid);
    if (params?.region_uuid)
      queryParams.append("region_uuid", params.region_uuid);
    if (params?.departement_uuid)
      queryParams.append("departement_uuid", params.departement_uuid);
    if (params?.actif !== undefined)
      queryParams.append("actif", params.actif.toString());
    if (params?.capitale !== undefined)
      queryParams.append("capitale", params.capitale.toString());
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.VILLES.LIST}?${queryString}`
      : API_ENDPOINTS.VILLES.LIST;

    console.log("🏙️ Fetching villes:", endpoint);

    try {
      const response = await api.get<ApiResponse<Ville[]>>(endpoint);

      let villes: Ville[] = [];
      let total = 0;
      let page = 1;
      let pages = 1;

      if (Array.isArray(response.data)) {
        villes = response.data;
        total = response.total || villes.length;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        villes = (response.data as any).data || [];
        total = (response.data as any).total || villes.length;
        page = (response.data as any).page || 1;
        pages = (response.data as any).pages || 1;
      }

      console.log(`✅ Found ${villes.length} villes`);

      return {
        villes,
        total,
        page,
        pages,
        suggestions: (response as any).suggestions,
        facets: (response as any).facets,
      };
    } catch (error: any) {
      console.error("🚨 Error getting villes:", error);
      throw error;
    }
  },

  /**
   * Récupère une ville par son UUID
   */
  async getVille(uuid: string): Promise<Ville> {
    try {
      console.log("🔍 Fetching ville:", uuid);

      const response = await api.get<ApiResponse<Ville>>(
        API_ENDPOINTS.VILLES.DETAIL(uuid),
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

      if (!ville || !ville.uuid) {
        throw new Error("Ville non trouvée");
      }

      console.log("✅ Ville found:", ville.nom);
      return ville;
    } catch (error: any) {
      console.error("❌ Error fetching ville:", error);
      throw error;
    }
  },

  /**
   * Crée une nouvelle ville
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
      console.error("❌ Error creating ville:", {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  /**
   * Met à jour une ville existante
   */
  async updateVille(uuid: string, villeData: VilleUpdateData): Promise<Ville> {
    try {
      console.log("✏️ Updating ville:", uuid);

      const response = await api.put<ApiResponse<Ville>>(
        API_ENDPOINTS.VILLES.UPDATE(uuid),
        villeData,
      );

      console.log("✅ Ville update response:", response.data);

      let updatedVille: Ville;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        updatedVille = (response.data as any).data;
      } else {
        updatedVille = response.data as Ville;
      }

      return updatedVille;
    } catch (error: any) {
      console.error("❌ Error updating ville:", error);
      throw error;
    }
  },

  /**
   * Active une ville
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

  // ==================== Recherche Spécialisée ====================

  /**
   * Recherche de villes par code postal
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
        `✅ Found ${villes.length} villes with postal code ${codePostal}`,
      );
      return villes;
    } catch (error: any) {
      console.error("❌ Error getting villes by postal code:", error);
      throw error;
    }
  },

  /**
   * Recherche de villes par pays
   */
  async getVillesByPays(paysUuid: string): Promise<Ville[]> {
    try {
      console.log("🌍 Fetching villes by country:", paysUuid);

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

      console.log(`✅ Found ${villes.length} villes in country`);
      return villes;
    } catch (error: any) {
      console.error("❌ Error getting villes by country:", error);
      throw error;
    }
  },

  /**
   * Recherche géographique de villes
   */
  async searchVillesGeographique(params: {
    latitude: number;
    longitude: number;
    rayon_km: number;
    limit?: number;
  }): Promise<Ville[]> {
    try {
      console.log("📍 Geographic ville search:", params);

      const queryParams = new URLSearchParams();
      queryParams.append("latitude", params.latitude.toString());
      queryParams.append("longitude", params.longitude.toString());
      queryParams.append("rayon_km", params.rayon_km.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());

      const response = await api.get<ApiResponse<Ville[]>>(
        `${API_ENDPOINTS.VILLES.SEARCH_GEOGRAPHIQUE}?${queryParams.toString()}`,
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
        `✅ Found ${villes.length} villes within ${params.rayon_km}km`,
      );
      return villes;
    } catch (error: any) {
      console.error("❌ Error in geographic search:", error);
      throw error;
    }
  },

  /**
   * Autocomplétion de villes
   */
  async autocompleteVilles(
    query: string,
    limit: number = 10,
  ): Promise<VilleAutocomplete[]> {
    try {
      console.log("🔍 Autocomplete villes:", query);

      const response = await api.get<ApiResponse<VilleAutocomplete[]>>(
        `${API_ENDPOINTS.VILLES.AUTOCOMPLETE}?q=${encodeURIComponent(query)}&limit=${limit}`,
      );

      let villes: VilleAutocomplete[] = [];
      if (Array.isArray(response.data)) {
        villes = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        villes = (response.data as any).data || [];
      }

      console.log(`✅ Found ${villes.length} suggestions`);
      return villes;
    } catch (error: any) {
      console.error("❌ Error in autocomplete:", error);
      throw error;
    }
  },

  // ==================== Régions et Départements ====================

  /**
   * Récupère les régions
   */
  async getRegions(paysUuid?: string): Promise<Region[]> {
    try {
      console.log("🗺️ Fetching regions");

      const endpoint = paysUuid
        ? `${API_ENDPOINTS.VILLES.REGIONS}?pays_uuid=${paysUuid}`
        : API_ENDPOINTS.VILLES.REGIONS;

      const response = await api.get<ApiResponse<Region[]>>(endpoint);

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

      console.log(`✅ Found ${regions.length} regions`);
      return regions;
    } catch (error: any) {
      console.error("❌ Error getting regions:", error);
      throw error;
    }
  },

  /**
   * Récupère les départements
   */
  async getDepartements(regionUuid?: string): Promise<Departement[]> {
    try {
      console.log("📊 Fetching departments");

      const endpoint = regionUuid
        ? `${API_ENDPOINTS.VILLES.DEPARTEMENTS}?region_uuid=${regionUuid}`
        : API_ENDPOINTS.VILLES.DEPARTEMENTS;

      const response = await api.get<ApiResponse<Departement[]>>(endpoint);

      let departements: Departement[] = [];
      if (Array.isArray(response.data)) {
        departements = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        departements = (response.data as any).data || [];
      }

      console.log(`✅ Found ${departements.length} departments`);
      return departements;
    } catch (error: any) {
      console.error("❌ Error getting departments:", error);
      throw error;
    }
  },

  // ==================== Statistiques et Analytics ====================

  /**
   * Récupère les statistiques des villes
   */
  async getVillesStats(): Promise<VilleStats> {
    try {
      console.log("📊 Fetching ville statistics");

      const response = await api.get<ApiResponse<VilleStats>>(
        API_ENDPOINTS.VILLES.STATS,
      );

      let stats: VilleStats;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        stats = (response.data as any).data;
      } else {
        stats = response.data as VilleStats;
      }

      console.log("✅ Statistics loaded");
      return stats;
    } catch (error: any) {
      console.error("❌ Error getting ville statistics:", error);
      throw error;
    }
  },

  // ==================== Distance et Itinéraires ====================

  /**
   * Calcule la distance entre deux villes
   */
  async calculateDistance(
    villeDepartUuid: string,
    villeArriveeUuid: string,
  ): Promise<DistanceVilles> {
    try {
      console.log(
        "📏 Calculating distance between villes:",
        villeDepartUuid,
        villeArriveeUuid,
      );

      const response = await api.get<ApiResponse<DistanceVilles>>(
        `${API_ENDPOINTS.VILLES.DISTANCE}?depart=${villeDepartUuid}&arrivee=${villeArriveeUuid}`,
      );

      return response.data as DistanceVilles;
    } catch (error: any) {
      console.error("❌ Error calculating distance:", error);
      throw error;
    }
  },

  /**
   * Trouve les villes les plus proches
   */
  async findNearestVilles(
    villeUuid: string,
    limit: number = 10,
  ): Promise<
    Array<{
      ville: Ville;
      distance_km: number;
    }>
  > {
    try {
      console.log("📍 Finding nearest villes to:", villeUuid);

      const response = await api.get<ApiResponse<any>>(
        `${API_ENDPOINTS.VILLES.NEAREST}/${villeUuid}?limit=${limit}`,
      );

      return (response.data as any).villes || [];
    } catch (error: any) {
      console.error("❌ Error finding nearest villes:", error);
      throw error;
    }
  },

  // ==================== Météo ====================

  /**
   * Récupère la météo d'une ville
   */
  async getMeteoVille(villeUuid: string): Promise<VilleMeteo> {
    try {
      console.log("☀️ Getting weather for ville:", villeUuid);

      const response = await api.get<ApiResponse<VilleMeteo>>(
        `${API_ENDPOINTS.VILLES.METEO}/${villeUuid}`,
      );

      let villeMeteo: VilleMeteo;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        villeMeteo = (response.data as any).data;
      } else {
        villeMeteo = response.data as VilleMeteo;
      }

      console.log("✅ Weather loaded");
      return villeMeteo;
    } catch (error: any) {
      console.error("❌ Error getting weather:", error);
      throw error;
    }
  },

  // ==================== Quartiers ====================

  /**
   * Récupère les quartiers d'une ville
   */
  async getQuartiersVille(villeUuid: string): Promise<Quartier[]> {
    try {
      console.log("🏘️ Getting quarters for ville:", villeUuid);

      const response = await api.get<ApiResponse<Quartier[]>>(
        `${API_ENDPOINTS.VILLES.QUARTIERS}/${villeUuid}`,
      );

      let quartiers: Quartier[] = [];
      if (Array.isArray(response.data)) {
        quartiers = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        quartiers = (response.data as any).data || [];
      }

      console.log(`✅ Found ${quartiers.length} quarters`);
      return quartiers;
    } catch (error: any) {
      console.error("❌ Error getting quarters:", error);
      throw error;
    }
  },

  // ==================== Codes Postaux ====================

  /**
   * Récupère les codes postaux d'une ville
   */
  async getCodesPostauxVille(villeUuid: string): Promise<CodePostal[]> {
    try {
      console.log("📮 Getting postal codes for ville:", villeUuid);

      const response = await api.get<ApiResponse<CodePostal[]>>(
        `${API_ENDPOINTS.VILLES.CODES_POSTAUX}/${villeUuid}`,
      );

      let codes: CodePostal[] = [];
      if (Array.isArray(response.data)) {
        codes = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        codes = (response.data as any).data || [];
      }

      console.log(`✅ Found ${codes.length} postal codes`);
      return codes;
    } catch (error: any) {
      console.error("❌ Error getting postal codes:", error);
      throw error;
    }
  },

  // ==================== Zones Géographiques ====================

  /**
   * Récupère les zones géographiques
   */
  async getZonesGeographiques(type?: string): Promise<ZoneGeographique[]> {
    try {
      console.log("🗾 Getting geographic zones");

      const endpoint = type
        ? `${API_ENDPOINTS.VILLES.ZONES_GEOGRAPHIQUES}?type=${type}`
        : API_ENDPOINTS.VILLES.ZONES_GEOGRAPHIQUES;

      const response = await api.get<ApiResponse<ZoneGeographique[]>>(endpoint);

      let zones: ZoneGeographique[] = [];
      if (Array.isArray(response.data)) {
        zones = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        zones = (response.data as any).data || [];
      }

      console.log(`✅ Found ${zones.length} zones`);
      return zones;
    } catch (error: any) {
      console.error("❌ Error getting geographic zones:", error);
      throw error;
    }
  },

  // ==================== Import/Export ====================

  /**
   * Exporte les villes
   */
  async exportVilles(options: ExportVillesOptions): Promise<Blob> {
    try {
      console.log("📤 Exporting villes in format:", options.format);

      const response = await api.post<Blob>(
        API_ENDPOINTS.VILLES.EXPORT_PDF,
        options,
        {
          responseType: "blob",
        },
      );

      console.log("✅ Export completed");
      return response.data;
    } catch (error: any) {
      console.error("❌ Error exporting villes:", error);
      throw error;
    }
  },

  /**
   * Importe des villes
   */
  async importVilles(importData: ImportVillesData): Promise<{
    success: boolean;
    imported: number;
    errors: any[];
  }> {
    try {
      console.log("📥 Importing villes");

      const formData = new FormData();
      formData.append("format", importData.format);
      formData.append("data", JSON.stringify(importData.data));
      formData.append("options", JSON.stringify(importData.options || {}));

      const response = await api.post<ApiResponse<any>>(
        API_ENDPOINTS.VILLES.IMPORT,
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
      console.error("❌ Error importing villes:", error);
      throw error;
    }
  },

  // ==================== Carte et Visualisation ====================

  /**
   * Récupère les données pour la carte
   */
  async getCarteVilles(params?: {
    pays_uuid?: string;
    region_uuid?: string;
    type?: string;
  }): Promise<VilleCarte[]> {
    try {
      console.log("🗺️ Getting map data for villes");

      const queryParams = new URLSearchParams();
      if (params?.pays_uuid) queryParams.append("pays_uuid", params.pays_uuid);
      if (params?.region_uuid)
        queryParams.append("region_uuid", params.region_uuid);
      if (params?.type) queryParams.append("type", params.type);

      const endpoint = queryParams.toString()
        ? `${API_ENDPOINTS.VILLES.CARTE}?${queryParams.toString()}`
        : API_ENDPOINTS.VILLES.CARTE;

      const response = await api.get<ApiResponse<VilleCarte[]>>(endpoint);

      let carte: VilleCarte[] = [];
      if (Array.isArray(response.data)) {
        carte = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        carte = (response.data as any).data || [];
      }

      console.log(`✅ Found ${carte.length} map entries`);
      return carte;
    } catch (error: any) {
      console.error("❌ Error getting map data:", error);
      throw error;
    }
  },

  // ==================== Utilitaires ====================

  /**
   * Valide une adresse
   */
  async validateAdresse(adresse: {
    rue?: string;
    code_postal?: string;
    ville?: string;
    pays?: string;
  }): Promise<{
    valide: boolean;
    suggestions?: Ville[];
    adresse_normalisee?: {
      rue: string;
      code_postal: string;
      ville: string;
      pays: string;
      latitude?: number;
      longitude?: number;
    };
  }> {
    try {
      console.log("📮 Validating address");

      const response = await api.post<ApiResponse<any>>(
        API_ENDPOINTS.VILLES.VALIDATE_ADRESSE,
        adresse,
      );

      return response.data as any;
    } catch (error: any) {
      console.error("❌ Error validating address:", error);
      throw error;
    }
  },

  /**
   * Récupère les villes capitales
   */
  async getCapitales(): Promise<Ville[]> {
    try {
      console.log("🏛️ Getting capital cities");

      const response = await api.get<ApiResponse<Ville[]>>(
        API_ENDPOINTS.VILLES.CAPITALES,
      );

      let capitales: Ville[] = [];
      if (Array.isArray(response.data)) {
        capitales = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        capitales = (response.data as any).data || [];
      }

      console.log(`✅ Found ${capitales.length} capital cities`);
      return capitales;
    } catch (error: any) {
      console.error("❌ Error getting capital cities:", error);
      throw error;
    }
  },

  /**
   * Récupère les grandes villes (métropoles)
   */
  async getMetropoles(limit: number = 50): Promise<Ville[]> {
    try {
      console.log("🏙️ Getting metropolises");

      const response = await api.get<ApiResponse<Ville[]>>(
        `${API_ENDPOINTS.VILLES.METROPOLES}?limit=${limit}`,
      );

      let metropoles: Ville[] = [];
      if (Array.isArray(response.data)) {
        metropoles = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        metropoles = (response.data as any).data || [];
      }

      console.log(`✅ Found ${metropoles.length} metropolises`);
      return metropoles;
    } catch (error: any) {
      console.error("❌ Error getting metropolises:", error);
      throw error;
    }
  },

  /**
   * Compare plusieurs villes
   */
  async comparerVilles(villeUuids: string[]): Promise<ComparaisonVilles> {
    try {
      console.log("⚖️ Comparing villes");

      const response = await api.post<ApiResponse<ComparaisonVilles>>(
        API_ENDPOINTS.VILLES.COMPARER,
        { ville_uuids: villeUuids },
      );

      console.log("✅ Comparison completed");
      return response.data as ComparaisonVilles;
    } catch (error: any) {
      console.error("❌ Error comparing villes:", error);
      throw error;
    }
  },

  /**
   * Récupère les villes avec activité sur la plateforme
   */
  async getVillesActives(limit: number = 100): Promise<
    Array<{
      ville: Ville;
      statistiques: {
        utilisateurs_count: number;
        vendeurs_count: number;
        annonces_count: number;
        produits_count: number;
      };
    }>
  > {
    try {
      console.log("📈 Getting active villes");

      const response = await api.get<ApiResponse<any>>(
        `${API_ENDPOINTS.VILLES.ACTIVES}?limit=${limit}`,
      );

      return (response.data as any).villes || [];
    } catch (error: any) {
      console.error("❌ Error getting active villes:", error);
      throw error;
    }
  },

  /**
   * Génère un rapport de synthèse pour une ville
   */
  async generateRapportVille(villeUuid: string): Promise<{
    ville: Ville;
    statistiques_plateforme: any;
    activite_recente: any;
    recommendations: Array<{
      type: string;
      titre: string;
      description: string;
    }>;
  }> {
    try {
      console.log("📄 Generating ville report:", villeUuid);

      const response = await api.get<ApiResponse<any>>(
        `${API_ENDPOINTS.VILLES.RAPPORT}/${villeUuid}`,
      );

      console.log("✅ Report generated");
      return response.data as any;
    } catch (error: any) {
      console.error("❌ Error generating report:", error);
      throw error;
    }
  },
};
