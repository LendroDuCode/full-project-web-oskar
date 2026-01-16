// services/vendeurs/vendeur.service.ts
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import type { Vendeur, PaginationParams } from "./vendeur.types";

export interface ApiResponse<T> {
  data: T;
  status: string;
  message?: string;
  count?: number;
}

export const vendeurService = {
  async getVendeurs(
    params?: PaginationParams,
  ): Promise<{ vendeurs: Vendeur[]; count?: number }> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.role) queryParams.append("role", params.role);
    if (params?.est_bloque !== undefined)
      queryParams.append("est_bloque", params.est_bloque.toString());
    if (params?.est_verifie !== undefined)
      queryParams.append("est_verifie", params.est_verifie.toString());
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.ADMIN.VENDEURS.LIST}?${queryString}`
      : API_ENDPOINTS.ADMIN.VENDEURS.LIST;

    console.log("📡 Fetching vendeurs from:", endpoint);

    try {
      const response = await api.get<ApiResponse<Vendeur[]>>(endpoint);

      console.log("✅ Service response:", {
        hasData: !!response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
      });

      // Vérifier la structure de la réponse
      if (Array.isArray(response.data)) {
        // L'API retourne directement un tableau
        console.log(
          "📊 API returned array directly, count:",
          response.data.length,
        );
        return {
          vendeurs: response.data,
          count: response.data.length,
        };
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        // L'API retourne { data: [...], status: "success" }
        console.log(
          "📊 API returned wrapped data, count:",
          (response.data as any).data?.length || 0,
        );
        return {
          vendeurs: (response.data as any).data || [],
          count:
            (response.data as any).count ||
            (response.data as any).data?.length ||
            0,
        };
      } else {
        console.warn("⚠️ Unexpected response format:", response.data);
        return { vendeurs: [], count: 0 };
      }
    } catch (error: any) {
      console.error("🚨 Error in vendeurService.getVendeurs:", {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  /**
   * Récupère un vendeur spécifique
   * NOTE IMPORTANTE: Votre API retourne DIRECTEMENT l'objet vendeur, pas { data: vendeur }
   */
  async getVendeur(uuid: string): Promise<Vendeur> {
    try {
      console.log("🔍 Fetching vendeur:", uuid);

      // IMPORTANT: Votre API retourne directement Vendeur, pas ApiResponse<Vendeur>
      const response = await api.get<any>(
        API_ENDPOINTS.ADMIN.VENDEURS.DETAIL(uuid),
      );

      console.log("✅ Raw API response:", response);

      let vendeurData: Vendeur | null = null;

      // Vérifier la structure de la réponse
      if (response && typeof response === "object") {
        // Structure 1: Directement l'objet vendeur
        if (response.uuid) {
          vendeurData = response as Vendeur;
          console.log("📊 Structure 1: Direct vendeur object");
        }
        // Structure 2: Wrapped dans { data: vendeur }
        else if ("data" in response && response.data && response.data.uuid) {
          vendeurData = response.data;
          console.log("📊 Structure 2: Wrapped in data property");
        }
        // Structure 3: Wrapped dans { vendeur: ... }
        else if (
          "vendeur" in response &&
          response.vendeur &&
          response.vendeur.uuid
        ) {
          vendeurData = response.vendeur;
          console.log("📊 Structure 3: Wrapped in vendeur property");
        }
        // Structure 4: Wrapped dans { result: vendeur }
        else if (
          "result" in response &&
          response.result &&
          response.result.uuid
        ) {
          vendeurData = response.result;
          console.log("📊 Structure 4: Wrapped in result property");
        }
      }

      if (!vendeurData) {
        console.error("❌ Could not parse vendeur data from:", response);
        throw new Error("Structure de données vendeur invalide");
      }

      if (!vendeurData.uuid) {
        throw new Error("Vendeur non trouvé");
      }

      console.log("✅ Vendeur found:", vendeurData.nom, vendeurData.prenoms);
      return vendeurData;
    } catch (error: any) {
      console.error("❌ Error fetching vendeur:", {
        message: error.message,
        endpoint: API_ENDPOINTS.ADMIN.VENDEURS.DETAIL(uuid),
        status: error.response?.status,
      });
      throw error;
    }
  },

  async createVendeur(vendeurData: Partial<Vendeur>): Promise<Vendeur> {
    try {
      const response = await api.post<ApiResponse<Vendeur>>(
        API_ENDPOINTS.ADMIN.VENDEURS.CREATE,
        vendeurData,
      );

      // Vérifier la structure de la réponse
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        return (response.data as any).data;
      }
      return response.data as Vendeur;
    } catch (error: any) {
      console.error("Error creating vendeur:", error);
      throw error;
    }
  },

  async updateVendeur(
    uuid: string,
    vendeurData: Partial<Vendeur>,
  ): Promise<Vendeur> {
    try {
      const response = await api.put<ApiResponse<Vendeur>>(
        API_ENDPOINTS.ADMIN.VENDEURS.UPDATE(uuid),
        vendeurData,
      );

      // Vérifier la structure de la réponse
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        return (response.data as any).data;
      }
      return response.data as Vendeur;
    } catch (error: any) {
      console.error("Error updating vendeur:", error);
      throw error;
    }
  },

  async deleteVendeur(uuid: string): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.ADMIN.VENDEURS.DELETE(uuid));
    } catch (error: any) {
      console.error("Error deleting vendeur:", error);
      throw error;
    }
  },

  async blockVendeur(uuid: string): Promise<Vendeur> {
    try {
      const response = await api.post<ApiResponse<Vendeur>>(
        API_ENDPOINTS.ADMIN.VENDEURS.BLOCK(uuid),
      );

      // Vérifier la structure de la réponse
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        return (response.data as any).data;
      }
      return response.data as Vendeur;
    } catch (error: any) {
      console.error("Error blocking vendeur:", error);
      throw error;
    }
  },

  async unblockVendeur(uuid: string): Promise<Vendeur> {
    try {
      const response = await api.post<ApiResponse<Vendeur>>(
        API_ENDPOINTS.ADMIN.VENDEURS.UNBLOCK(uuid),
      );

      // Vérifier la structure de la réponse
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        return (response.data as any).data;
      }
      return response.data as Vendeur;
    } catch (error: any) {
      console.error("Error unblocking vendeur:", error);
      throw error;
    }
  },

  async restoreVendeur(uuid: string): Promise<Vendeur> {
    try {
      const response = await api.delete<ApiResponse<Vendeur>>(
        API_ENDPOINTS.ADMIN.VENDEURS.RESTORE(uuid),
      );

      // Vérifier la structure de la réponse
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        return (response.data as any).data;
      }
      return response.data as Vendeur;
    } catch (error: any) {
      console.error("Error restoring vendeur:", error);
      throw error;
    }
  },

  // Récupérer la liste des vendeurs bloqués
  async getVendeursBloques(
    params?: PaginationParams,
  ): Promise<{ vendeurs: Vendeur[]; count?: number }> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.ADMIN.VENDEURS.BLOCKED}?${queryString}`
      : API_ENDPOINTS.ADMIN.VENDEURS.BLOCKED;

    console.log("📡 Fetching blocked vendeurs from:", endpoint);

    try {
      const response = await api.get<ApiResponse<Vendeur[]>>(endpoint);

      // Gestion similaire à getVendeurs
      if (Array.isArray(response.data)) {
        return { vendeurs: response.data, count: response.data.length };
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        return {
          vendeurs: (response.data as any).data || [],
          count:
            (response.data as any).count ||
            (response.data as any).data?.length ||
            0,
        };
      }
      return { vendeurs: [], count: 0 };
    } catch (error: any) {
      console.error("Error fetching blocked vendeurs:", error);
      throw error;
    }
  },

  // Récupérer la liste des vendeurs supprimés
  async getVendeursSupprimes(
    params?: PaginationParams,
  ): Promise<{ vendeurs: Vendeur[]; count?: number }> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.ADMIN.VENDEURS.DELETED}?${queryString}`
      : API_ENDPOINTS.ADMIN.VENDEURS.DELETED;

    console.log("📡 Fetching deleted vendeurs from:", endpoint);

    try {
      const response = await api.get<ApiResponse<Vendeur[]>>(endpoint);

      // Gestion similaire à getVendeurs
      if (Array.isArray(response.data)) {
        return { vendeurs: response.data, count: response.data.length };
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        return {
          vendeurs: (response.data as any).data || [],
          count:
            (response.data as any).count ||
            (response.data as any).data?.length ||
            0,
        };
      }
      return { vendeurs: [], count: 0 };
    } catch (error: any) {
      console.error("Error fetching deleted vendeurs:", error);
      throw error;
    }
  },

  // Exporter les vendeurs
  async exportVendeurs(format: "pdf" | "csv" = "pdf"): Promise<Blob> {
    try {
      const endpoint =
        format === "pdf"
          ? API_ENDPOINTS.ADMIN.VENDEURS.EXPORT_PDF
          : API_ENDPOINTS.ADMIN.VENDEURS.EXPORT_PDF; // À adapter si vous avez d'autres formats

      const response = await api.get(endpoint, {
        responseType: "blob",
      });
      return response;
    } catch (error: any) {
      console.error("Error exporting vendeurs:", error);
      throw error;
    }
  },

  // Méthodes de statistiques (si disponibles)
  async getVendeurStats(uuid: string): Promise<any> {
    try {
      // Cette route peut ne pas exister, à adapter selon votre API
      const response = await api.get(`/admin/vendeur/${uuid}/statistiques`);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching vendeur stats:", error);
      throw error;
    }
  },

  // Méthodes utilitaires pour debug
  async testEndpoint(endpoint: string): Promise<any> {
    try {
      const response = await api.get(endpoint);
      console.log("🧪 Test endpoint response:", {
        endpoint,
        status: response.status,
        data: response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        keys: response.data ? Object.keys(response.data) : "no data",
      });
      return response.data;
    } catch (error: any) {
      console.error("🧪 Test endpoint error:", {
        endpoint,
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },
};
