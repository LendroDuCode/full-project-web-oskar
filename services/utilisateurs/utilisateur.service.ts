// services/utilisateurs/utilisateur.service.ts
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import type { User, PaginationParams } from "./user.types";

export interface ApiResponse<T> {
  data?: T;
  status: string;
  message?: string;
  count?: number;
}

export const userService = {
  async getUsers(params?: PaginationParams): Promise<User[]> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.role) queryParams.append("role", params.role);
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.ADMIN.USERS.LIST}?${queryString}`
      : API_ENDPOINTS.ADMIN.USERS.LIST;

    console.log("📡 Fetching users from:", endpoint);

    try {
      // IMPORTANT: L'API retourne directement le tableau d'utilisateurs
      const users = await api.get<User[]>(endpoint);

      console.log("✅ Users received:", users?.length || 0);

      return users || [];
    } catch (error: any) {
      console.error("🚨 Error in userService.getUsers:", {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  async getBlockedUsers(
    params?: PaginationParams,
  ): Promise<{ users: User[]; count: number }> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.role) queryParams.append("role", params.role);
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.ADMIN.USERS.BLOCKED}?${queryString}`
      : API_ENDPOINTS.ADMIN.USERS.BLOCKED;

    console.log("📡 Fetching blocked users from:", endpoint);

    try {
      const response = await api.get<ApiResponse<User[]>>(endpoint);

      console.log("✅ Blocked users received:", {
        count: response.count,
        users: response.data?.length || 0,
      });

      return {
        users: response.data || [],
        count: response.count || 0,
      };
    } catch (error: any) {
      console.error("🚨 Error in userService.getBlockedUsers:", {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  async getDeletedUsers(
    params?: PaginationParams,
  ): Promise<{ users: User[]; count: number }> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.role) queryParams.append("role", params.role);
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.ADMIN.USERS.DELETED}?${queryString}`
      : API_ENDPOINTS.ADMIN.USERS.DELETED;

    console.log("📡 Fetching deleted users from:", endpoint);

    try {
      const response = await api.get<ApiResponse<User[]>>(endpoint);

      console.log("✅ Deleted users received:", {
        count: response.count,
        users: response.data?.length || 0,
      });

      return {
        users: response.data || [],
        count: response.count || 0,
      };
    } catch (error: any) {
      console.error("🚨 Error in userService.getDeletedUsers:", {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  async getUser(uuid: string): Promise<User> {
    try {
      console.log("🔍 Fetching user:", uuid);

      // IMPORTANT: L'API retourne directement l'utilisateur
      const user = await api.get<User>(API_ENDPOINTS.ADMIN.USERS.DETAIL(uuid));

      console.log("✅ User received:", user);

      if (!user || !user.uuid) {
        throw new Error("Utilisateur non trouvé");
      }

      return user;
    } catch (error: any) {
      console.error("Error fetching user:", error);
      throw error;
    }
  },

  async createUser(userData: Partial<User>): Promise<User> {
    try {
      const user = await api.post<User>(
        API_ENDPOINTS.ADMIN.USERS.CREATE,
        userData,
      );
      return user;
    } catch (error: any) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  async updateUser(uuid: string, userData: Partial<User>): Promise<User> {
    try {
      const user = await api.put<User>(
        API_ENDPOINTS.ADMIN.USERS.UPDATE(uuid),
        userData,
      );
      return user;
    } catch (error: any) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  async deleteUser(uuid: string): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.ADMIN.USERS.DELETE(uuid));
    } catch (error: any) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },

  async blockUser(uuid: string): Promise<User> {
    try {
      const user = await api.post<User>(API_ENDPOINTS.ADMIN.USERS.BLOCK(uuid));
      return user;
    } catch (error: any) {
      console.error("Error blocking user:", error);
      throw error;
    }
  },

  async unblockUser(uuid: string): Promise<User> {
    try {
      const user = await api.post<User>(
        API_ENDPOINTS.ADMIN.USERS.UNBLOCK(uuid),
      );
      return user;
    } catch (error: any) {
      console.error("Error unblocking user:", error);
      throw error;
    }
  },

  async restoreUser(uuid: string): Promise<User> {
    try {
      const user = await api.delete<User>(
        API_ENDPOINTS.ADMIN.USERS.RESTORE(uuid),
      );
      return user;
    } catch (error: any) {
      console.error("Error restoring user:", error);
      throw error;
    }
  },

  async exportUsers(format: "pdf" | "csv" = "pdf"): Promise<Blob> {
    try {
      const response = await api.get(API_ENDPOINTS.ADMIN.USERS.EXPORT_PDF, {
        responseType: "blob",
      });
      return response;
    } catch (error: any) {
      console.error("Error exporting users:", error);
      throw error;
    }
  },
};
