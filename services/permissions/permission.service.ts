// services/permissions/permission.service.ts
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import type {
  Permission,
  PermissionCreateData,
  PermissionUpdateData,
  PermissionFilterParams,
  Role,
  RoleAssignment,
  PermissionGroup,
  SecurityPolicy,
  PermissionAudit,
  AccessCheck,
  SecurityReport,
} from "./permission.types";

export interface ApiResponse<T> {
  data: T;
  status: string;
  message?: string;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
}

export const permissionService = {
  // ==================== GESTION DES PERMISSIONS ====================

  /**
   * Récupère la liste des permissions
   */
  async getPermissions(params?: {
    page?: number;
    limit?: number;
    filters?: PermissionFilterParams;
  }): Promise<{ permissions: Permission[]; total: number }> {
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
            } else {
              queryParams.append(key, String(value));
            }
          }
        });
      }

      const queryString = queryParams.toString();
      const endpoint = queryString
        ? `${API_ENDPOINTS.PERMISSIONS.LIST}?${queryString}`
        : API_ENDPOINTS.PERMISSIONS.LIST;

      const response = await api.get<ApiResponse<Permission[]>>(endpoint);

      let permissions: Permission[] = [];
      let total = 0;

      if (Array.isArray(response.data)) {
        permissions = response.data;
        total = permissions.length;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        permissions = (response.data as any).data || [];
        total = (response.data as any).total || permissions.length;
      }

      return { permissions, total };
    } catch (error: any) {
      console.error("Erreur lors de la récupération des permissions:", error);
      throw error;
    }
  },

  /**
   * Récupère une permission spécifique
   */
  async getPermission(uuid: string): Promise<Permission> {
    try {
      const response = await api.get<ApiResponse<Permission>>(
        API_ENDPOINTS.PERMISSIONS.DETAIL(uuid),
      );

      let permission: Permission;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        permission = (response.data as any).data;
      } else {
        permission = response.data as Permission;
      }

      return permission;
    } catch (error: any) {
      console.error("Erreur lors de la récupération de la permission:", error);
      throw error;
    }
  },

  /**
   * Crée une nouvelle permission
   */
  async createPermission(
    permissionData: PermissionCreateData,
  ): Promise<Permission> {
    try {
      const response = await api.post<ApiResponse<Permission>>(
        API_ENDPOINTS.PERMISSIONS.CREATE,
        permissionData,
      );

      let permission: Permission;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        permission = (response.data as any).data;
      } else {
        permission = response.data as Permission;
      }

      return permission;
    } catch (error: any) {
      console.error("Erreur lors de la création de la permission:", error);
      throw error;
    }
  },

  /**
   * Met à jour une permission existante
   */
  async updatePermission(
    uuid: string,
    permissionData: PermissionUpdateData,
  ): Promise<Permission> {
    try {
      const response = await api.put<ApiResponse<Permission>>(
        API_ENDPOINTS.PERMISSIONS.UPDATE(uuid),
        permissionData,
      );

      let permission: Permission;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        permission = (response.data as any).data;
      } else {
        permission = response.data as Permission;
      }

      return permission;
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour de la permission:", error);
      throw error;
    }
  },

  /**
   * Supprime une permission
   */
  async deletePermission(uuid: string): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.PERMISSIONS.DELETE(uuid));
    } catch (error: any) {
      console.error("Erreur lors de la suppression de la permission:", error);
      throw error;
    }
  },

  // ==================== GESTION DES RÔLES ====================

  /**
   * Récupère la liste des rôles
   */
  async getRoles(params?: {
    page?: number;
    limit?: number;
    type?: string;
  }): Promise<{ roles: Role[]; total: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.type) queryParams.append("type", params.type);

      const queryString = queryParams.toString();
      const endpoint = queryString
        ? `${API_ENDPOINTS.ROLES.LIST}?${queryString}`
        : API_ENDPOINTS.ROLES.LIST;

      const response = await api.get<ApiResponse<Role[]>>(endpoint);

      let roles: Role[] = [];
      let total = 0;

      if (Array.isArray(response.data)) {
        roles = response.data;
        total = roles.length;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        roles = (response.data as any).data || [];
        total = (response.data as any).total || roles.length;
      }

      return { roles, total };
    } catch (error: any) {
      console.error("Erreur lors de la récupération des rôles:", error);
      throw error;
    }
  },

  /**
   * Récupère un rôle spécifique
   */
  async getRole(uuid: string): Promise<Role> {
    try {
      const response = await api.get<ApiResponse<Role>>(
        API_ENDPOINTS.ROLES.DETAIL(uuid),
      );

      let role: Role;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        role = (response.data as any).data;
      } else {
        role = response.data as Role;
      }

      return role;
    } catch (error: any) {
      console.error("Erreur lors de la récupération du rôle:", error);
      throw error;
    }
  },

  /**
   * Crée un nouveau rôle
   */
  async createRole(
    roleData: Omit<Role, "uuid" | "date_creation" | "date_modification">,
  ): Promise<Role> {
    try {
      const response = await api.post<ApiResponse<Role>>(
        API_ENDPOINTS.ROLES.CREATE,
        roleData,
      );

      let role: Role;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        role = (response.data as any).data;
      } else {
        role = response.data as Role;
      }

      return role;
    } catch (error: any) {
      console.error("Erreur lors de la création du rôle:", error);
      throw error;
    }
  },

  // ==================== GESTION DES ATTRIBUTIONS ====================

  /**
   * Attribue un rôle à un utilisateur
   */
  async assignRole(assignmentData: {
    utilisateur_uuid: string;
    utilisateur_type: string;
    role_uuid: string;
    date_debut?: string;
    date_fin?: string;
    contexte?: Record<string, any>;
  }): Promise<RoleAssignment> {
    try {
      const response = await api.post<ApiResponse<RoleAssignment>>(
        `/role-assignments`,
        assignmentData,
      );

      let assignment: RoleAssignment;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        assignment = (response.data as any).data;
      } else {
        assignment = response.data as RoleAssignment;
      }

      return assignment;
    } catch (error: any) {
      console.error("Erreur lors de l'attribution du rôle:", error);
      throw error;
    }
  },

  /**
   * Révoke un rôle attribué à un utilisateur
   */
  async revokeRole(
    assignmentUuid: string,
    motif?: string,
  ): Promise<RoleAssignment> {
    try {
      const response = await api.put<ApiResponse<RoleAssignment>>(
        `/role-assignments/${assignmentUuid}/revoke`,
        { motif },
      );

      let assignment: RoleAssignment;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        assignment = (response.data as any).data;
      } else {
        assignment = response.data as RoleAssignment;
      }

      return assignment;
    } catch (error: any) {
      console.error("Erreur lors de la révocation du rôle:", error);
      throw error;
    }
  },

  // ==================== GESTION DES PERMISSIONS PAR RÔLE ====================

  /**
   * Récupère les permissions d'un rôle
   */
  async getRolePermissions(roleUuid: string): Promise<Permission[]> {
    try {
      const response = await api.get<ApiResponse<Permission[]>>(
        API_ENDPOINTS.ROLE_PERMISSIONS.LIST(roleUuid),
      );

      let permissions: Permission[] = [];
      if (Array.isArray(response.data)) {
        permissions = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        permissions = (response.data as any).data || [];
      }

      return permissions;
    } catch (error: any) {
      console.error(
        "Erreur lors de la récupération des permissions du rôle:",
        error,
      );
      throw error;
    }
  },

  /**
   * Ajoute une permission à un rôle
   */
  async addPermissionToRole(
    roleUuid: string,
    permissionUuid: string,
  ): Promise<Role> {
    try {
      const response = await api.post<ApiResponse<Role>>(
        API_ENDPOINTS.ROLE_PERMISSIONS.ADD(roleUuid, permissionUuid),
      );

      let role: Role;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        role = (response.data as any).data;
      } else {
        role = response.data as Role;
      }

      return role;
    } catch (error: any) {
      console.error("Erreur lors de l'ajout de la permission au rôle:", error);
      throw error;
    }
  },

  /**
   * Retire une permission d'un rôle
   */
  async removePermissionFromRole(
    roleUuid: string,
    permissionUuid: string,
  ): Promise<Role> {
    try {
      const response = await api.delete<ApiResponse<Role>>(
        API_ENDPOINTS.ROLE_PERMISSIONS.REMOVE(roleUuid, permissionUuid),
      );

      let role: Role;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        role = (response.data as any).data;
      } else {
        role = response.data as Role;
      }

      return role;
    } catch (error: any) {
      console.error("Erreur lors du retrait de la permission du rôle:", error);
      throw error;
    }
  },

  // ==================== VÉRIFICATION DES ACCÈS ====================

  /**
   * Vérifie si un utilisateur a une permission spécifique
   */
  async checkAccess(checkData: {
    utilisateur_uuid: string;
    utilisateur_type: string;
    permission_code: string;
    contexte?: Record<string, any>;
  }): Promise<AccessCheck> {
    try {
      const response = await api.post<ApiResponse<AccessCheck>>(
        `/permissions/check-access`,
        checkData,
      );

      let accessCheck: AccessCheck;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        accessCheck = (response.data as any).data;
      } else {
        accessCheck = response.data as AccessCheck;
      }

      return accessCheck;
    } catch (error: any) {
      console.error("Erreur lors de la vérification d'accès:", error);
      throw error;
    }
  },

  /**
   * Vérifie les permissions en masse
   */
  async checkMultipleAccesses(checkData: {
    utilisateur_uuid: string;
    utilisateur_type: string;
    permissions_codes: string[];
    contexte?: Record<string, any>;
  }): Promise<{ [permission_code: string]: AccessCheck }> {
    try {
      const response = await api.post<
        ApiResponse<{ [key: string]: AccessCheck }>
      >(`/permissions/check-multiple`, checkData);

      let result: { [permission_code: string]: AccessCheck };
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        result = (response.data as any).data;
      } else {
        result = response.data as { [permission_code: string]: AccessCheck };
      }

      return result;
    } catch (error: any) {
      console.error("Erreur lors de la vérification multiple d'accès:", error);
      throw error;
    }
  },

  // ==================== AUDIT ET RAPPORTS ====================

  /**
   * Récupère l'audit des permissions
   */
  async getAuditLog(params?: {
    page?: number;
    limit?: number;
    action?: string;
    cible_type?: string;
    date_debut?: string;
    date_fin?: string;
  }): Promise<{ logs: PermissionAudit[]; total: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.action) queryParams.append("action", params.action);
      if (params?.cible_type)
        queryParams.append("cible_type", params.cible_type);
      if (params?.date_debut)
        queryParams.append("date_debut", params.date_debut);
      if (params?.date_fin) queryParams.append("date_fin", params.date_fin);

      const queryString = queryParams.toString();
      const endpoint = queryString
        ? `/permissions/audit?${queryString}`
        : `/permissions/audit`;

      const response = await api.get<ApiResponse<PermissionAudit[]>>(endpoint);

      let logs: PermissionAudit[] = [];
      let total = 0;

      if (Array.isArray(response.data)) {
        logs = response.data;
        total = logs.length;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        logs = (response.data as any).data || [];
        total = (response.data as any).total || logs.length;
      }

      return { logs, total };
    } catch (error: any) {
      console.error("Erreur lors de la récupération de l'audit:", error);
      throw error;
    }
  },

  /**
   * Génère un rapport de sécurité
   */
  async generateSecurityReport(params?: {
    periode_debut?: string;
    periode_fin?: string;
  }): Promise<SecurityReport> {
    try {
      const response = await api.post<ApiResponse<SecurityReport>>(
        `/permissions/security-report`,
        params,
      );

      let report: SecurityReport;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        report = (response.data as any).data;
      } else {
        report = response.data as SecurityReport;
      }

      return report;
    } catch (error: any) {
      console.error(
        "Erreur lors de la génération du rapport de sécurité:",
        error,
      );
      throw error;
    }
  },

  // ==================== GESTION DES POLITIQUES DE SÉCURITÉ ====================

  /**
   * Récupère la liste des politiques de sécurité
   */
  async getSecurityPolicies(params?: {
    page?: number;
    limit?: number;
    type?: string;
    est_active?: boolean;
  }): Promise<{ policies: SecurityPolicy[]; total: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.type) queryParams.append("type", params.type);
      if (params?.est_active !== undefined)
        queryParams.append("est_active", params.est_active.toString());

      const queryString = queryParams.toString();
      const endpoint = queryString
        ? `/security-policies?${queryString}`
        : `/security-policies`;

      const response = await api.get<ApiResponse<SecurityPolicy[]>>(endpoint);

      let policies: SecurityPolicy[] = [];
      let total = 0;

      if (Array.isArray(response.data)) {
        policies = response.data;
        total = policies.length;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        policies = (response.data as any).data || [];
        total = (response.data as any).total || policies.length;
      }

      return { policies, total };
    } catch (error: any) {
      console.error(
        "Erreur lors de la récupération des politiques de sécurité:",
        error,
      );
      throw error;
    }
  },

  // ==================== UTILITAIRES ====================

  /**
   * Exporte les permissions au format PDF
   */
  async exportPermissionsToPDF(
    filters?: PermissionFilterParams,
  ): Promise<Blob> {
    try {
      const response = await api.post(
        API_ENDPOINTS.PERMISSIONS.EXPORT_PDF,
        filters,
        { responseType: "blob" },
      );

      return response;
    } catch (error: any) {
      console.error("Erreur lors de l'export des permissions en PDF:", error);
      throw error;
    }
  },

  /**
   * Exporte les rôles au format PDF
   */
  async exportRolesToPDF(filters?: { type?: string }): Promise<Blob> {
    try {
      const response = await api.post(API_ENDPOINTS.ROLES.EXPORT_PDF, filters, {
        responseType: "blob",
      });

      return response;
    } catch (error: any) {
      console.error("Erreur lors de l'export des rôles en PDF:", error);
      throw error;
    }
  },

  /**
   * Teste le service des permissions
   */
  async testService(): Promise<{ success: boolean; message: string }> {
    try {
      const response =
        await api.get<ApiResponse<{ success: boolean; message: string }>>(
          `/permissions/test`,
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
      throw error;
    }
  },
};
