// services/roles-permissions/role-permission.service.ts
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import type {
  Permission,
  PermissionCreateData,
  PermissionUpdateData,
  Role,
  RoleCreateData,
  RoleUpdateData,
  RoleAssignment,
  RoleAssignmentCreateData,
  PermissionGroup,
  SecurityPolicy,
  RolePermissionAudit,
  AccessCheckResult,
  BulkAccessCheck,
  SecurityComplianceReport,
  RoleHierarchy,
  PermissionMatrix,
  RBACConfig,
  RolePermissionFilterParams,
} from "./role-permission.types";

export interface ApiResponse<T> {
  data: T;
  status: string;
  message?: string;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
}

export const rolePermissionService = {
  // ==================== GESTION DES PERMISSIONS ====================

  /**
   * Récupère la liste des permissions
   */
  async getPermissions(params?: {
    page?: number;
    limit?: number;
    filters?: RolePermissionFilterParams;
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
   * Récupère une permission par son code
   */
  async getPermissionByCode(code: string): Promise<Permission> {
    try {
      const response = await api.get<ApiResponse<Permission>>(
        `/permissions/code/${code}`,
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
      console.error(
        "Erreur lors de la récupération de la permission par code:",
        error,
      );
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

  /**
   * Active/désactive une permission
   */
  async togglePermissionStatus(
    uuid: string,
    active: boolean,
  ): Promise<Permission> {
    try {
      const response = await api.put<ApiResponse<Permission>>(
        `/permissions/${uuid}/status`,
        { est_active: active },
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
      console.error(
        "Erreur lors du changement de statut de la permission:",
        error,
      );
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
    filters?: RolePermissionFilterParams;
  }): Promise<{ roles: Role[]; total: number }> {
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
   * Récupère un rôle par son code
   */
  async getRoleByCode(code: string): Promise<Role> {
    try {
      const response = await api.get<ApiResponse<Role>>(`/roles/code/${code}`);

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
      console.error("Erreur lors de la récupération du rôle par code:", error);
      throw error;
    }
  },

  /**
   * Crée un nouveau rôle
   */
  async createRole(roleData: RoleCreateData): Promise<Role> {
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

  /**
   * Met à jour un rôle existant
   */
  async updateRole(uuid: string, roleData: RoleUpdateData): Promise<Role> {
    try {
      const response = await api.put<ApiResponse<Role>>(
        API_ENDPOINTS.ROLES.UPDATE(uuid),
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
      console.error("Erreur lors de la mise à jour du rôle:", error);
      throw error;
    }
  },

  /**
   * Supprime un rôle
   */
  async deleteRole(uuid: string): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.ROLES.DELETE(uuid));
    } catch (error: any) {
      console.error("Erreur lors de la suppression du rôle:", error);
      throw error;
    }
  },

  /**
   * Active/désactive un rôle
   */
  async toggleRoleStatus(uuid: string, active: boolean): Promise<Role> {
    try {
      const response = await api.put<ApiResponse<Role>>(
        `/roles/${uuid}/status`,
        { est_actif: active },
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
      console.error("Erreur lors du changement de statut du rôle:", error);
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

  /**
   * Met à jour plusieurs permissions d'un rôle en une seule opération
   */
  async bulkUpdateRolePermissions(
    roleUuid: string,
    permissionUuids: string[],
  ): Promise<Role> {
    try {
      const response = await api.put<ApiResponse<Role>>(
        `/roles/${roleUuid}/permissions/bulk`,
        { permissions: permissionUuids },
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
      console.error(
        "Erreur lors de la mise à jour en masse des permissions:",
        error,
      );
      throw error;
    }
  },

  // ==================== GESTION DES ATTRIBUTIONS ====================

  /**
   * Récupère les attributions de rôles
   */
  async getRoleAssignments(params?: {
    page?: number;
    limit?: number;
    utilisateur_uuid?: string;
    role_uuid?: string;
    statut?: string;
  }): Promise<{ assignments: RoleAssignment[]; total: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.utilisateur_uuid)
        queryParams.append("utilisateur_uuid", params.utilisateur_uuid);
      if (params?.role_uuid) queryParams.append("role_uuid", params.role_uuid);
      if (params?.statut) queryParams.append("statut", params.statut);

      const queryString = queryParams.toString();
      const endpoint = queryString
        ? `/role-assignments?${queryString}`
        : `/role-assignments`;

      const response = await api.get<ApiResponse<RoleAssignment[]>>(endpoint);

      let assignments: RoleAssignment[] = [];
      let total = 0;

      if (Array.isArray(response.data)) {
        assignments = response.data;
        total = assignments.length;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        assignments = (response.data as any).data || [];
        total = (response.data as any).total || assignments.length;
      }

      return { assignments, total };
    } catch (error: any) {
      console.error("Erreur lors de la récupération des attributions:", error);
      throw error;
    }
  },

  /**
   * Attribue un rôle à un utilisateur
   */
  async assignRole(
    assignmentData: RoleAssignmentCreateData,
  ): Promise<RoleAssignment> {
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
   * Met à jour une attribution existante
   */
  async updateRoleAssignment(
    assignmentUuid: string,
    updateData: {
      date_fin?: string;
      statut?: string;
      contexte?: Record<string, any>;
      restrictions?: Record<string, any>;
    },
  ): Promise<RoleAssignment> {
    try {
      const response = await api.put<ApiResponse<RoleAssignment>>(
        `/role-assignments/${assignmentUuid}`,
        updateData,
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
      console.error("Erreur lors de la mise à jour de l'attribution:", error);
      throw error;
    }
  },

  /**
   * Révoque une attribution de rôle
   */
  async revokeRoleAssignment(
    assignmentUuid: string,
    motif?: string,
  ): Promise<RoleAssignment> {
    try {
      const response = await api.delete<ApiResponse<RoleAssignment>>(
        `/role-assignments/${assignmentUuid}`,
        { data: { motif } },
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
      console.error("Erreur lors de la révocation de l'attribution:", error);
      throw error;
    }
  },

  /**
   * Suspend une attribution de rôle
   */
  async suspendRoleAssignment(
    assignmentUuid: string,
    motif: string,
  ): Promise<RoleAssignment> {
    try {
      const response = await api.put<ApiResponse<RoleAssignment>>(
        `/role-assignments/${assignmentUuid}/suspend`,
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
      console.error("Erreur lors de la suspension de l'attribution:", error);
      throw error;
    }
  },

  /**
   * Réactive une attribution suspendue
   */
  async reactivateRoleAssignment(
    assignmentUuid: string,
  ): Promise<RoleAssignment> {
    try {
      const response = await api.put<ApiResponse<RoleAssignment>>(
        `/role-assignments/${assignmentUuid}/reactivate`,
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
      console.error("Erreur lors de la réactivation de l'attribution:", error);
      throw error;
    }
  },

  // ==================== VÉRIFICATION D'ACCÈS ====================

  /**
   * Vérifie si un utilisateur a une permission spécifique
   */
  async checkAccess(checkData: {
    utilisateur_uuid: string;
    utilisateur_type: string;
    permission_code: string;
    contexte?: Record<string, any>;
  }): Promise<AccessCheckResult> {
    try {
      const response = await api.post<ApiResponse<AccessCheckResult>>(
        `/permissions/check-access`,
        checkData,
      );

      let accessCheck: AccessCheckResult;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        accessCheck = (response.data as any).data;
      } else {
        accessCheck = response.data as AccessCheckResult;
      }

      return accessCheck;
    } catch (error: any) {
      console.error("Erreur lors de la vérification d'accès:", error);
      throw error;
    }
  },

  /**
   * Vérifie plusieurs permissions en une seule requête
   */
  async checkBulkAccess(checkData: {
    utilisateur_uuid: string;
    utilisateur_type: string;
    permissions_codes: string[];
    contexte?: Record<string, any>;
  }): Promise<BulkAccessCheck> {
    try {
      const response = await api.post<ApiResponse<BulkAccessCheck>>(
        `/permissions/check-bulk`,
        checkData,
      );

      let bulkCheck: BulkAccessCheck;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        bulkCheck = (response.data as any).data;
      } else {
        bulkCheck = response.data as BulkAccessCheck;
      }

      return bulkCheck;
    } catch (error: any) {
      console.error("Erreur lors de la vérification multiple d'accès:", error);
      throw error;
    }
  },

  /**
   * Récupère toutes les permissions d'un utilisateur
   */
  async getUserPermissions(
    utilisateurUuid: string,
    includeDetails: boolean = false,
  ): Promise<{
    permissions: string[];
    permissions_details?: Permission[];
    roles: string[];
  }> {
    try {
      const response = await api.get<ApiResponse<any>>(
        `/users/${utilisateurUuid}/permissions`,
        { params: { include_details: includeDetails } },
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

      return result || { permissions: [], roles: [] };
    } catch (error: any) {
      console.error(
        "Erreur lors de la récupération des permissions utilisateur:",
        error,
      );
      throw error;
    }
  },

  // ==================== HIÉRARCHIE ET MATRICE ====================

  /**
   * Récupère la hiérarchie d'un rôle
   */
  async getRoleHierarchy(roleUuid: string): Promise<RoleHierarchy> {
    try {
      const response = await api.get<ApiResponse<RoleHierarchy>>(
        `/roles/${roleUuid}/hierarchy`,
      );

      let hierarchy: RoleHierarchy;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        hierarchy = (response.data as any).data;
      } else {
        hierarchy = response.data as RoleHierarchy;
      }

      return hierarchy;
    } catch (error: any) {
      console.error("Erreur lors de la récupération de la hiérarchie:", error);
      throw error;
    }
  },

  /**
   * Récupère la matrice complète des permissions
   */
  async getPermissionMatrix(): Promise<PermissionMatrix> {
    try {
      const response =
        await api.get<ApiResponse<PermissionMatrix>>(`/permissions/matrix`);

      let matrix: PermissionMatrix;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        matrix = (response.data as any).data;
      } else {
        matrix = response.data as PermissionMatrix;
      }

      return matrix;
    } catch (error: any) {
      console.error(
        "Erreur lors de la récupération de la matrice des permissions:",
        error,
      );
      throw error;
    }
  },

  /**
   * Récupère la matrice des permissions par catégorie
   */
  async getPermissionMatrixByCategory(
    categorie: string,
  ): Promise<PermissionMatrix> {
    try {
      const response = await api.get<ApiResponse<PermissionMatrix>>(
        `/permissions/matrix/category/${categorie}`,
      );

      let matrix: PermissionMatrix;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        matrix = (response.data as any).data;
      } else {
        matrix = response.data as PermissionMatrix;
      }

      return matrix;
    } catch (error: any) {
      console.error(
        "Erreur lors de la récupération de la matrice par catégorie:",
        error,
      );
      throw error;
    }
  },

  // ==================== GROUPES DE PERMISSIONS ====================

  /**
   * Récupère la liste des groupes de permissions
   */
  async getPermissionGroups(): Promise<PermissionGroup[]> {
    try {
      const response =
        await api.get<ApiResponse<PermissionGroup[]>>(`/permission-groups`);

      let groups: PermissionGroup[] = [];
      if (Array.isArray(response.data)) {
        groups = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        groups = (response.data as any).data || [];
      }

      return groups;
    } catch (error: any) {
      console.error(
        "Erreur lors de la récupération des groupes de permissions:",
        error,
      );
      throw error;
    }
  },

  /**
   * Crée un nouveau groupe de permissions
   */
  async createPermissionGroup(
    groupData: Omit<
      PermissionGroup,
      "uuid" | "date_creation" | "date_modification"
    >,
  ): Promise<PermissionGroup> {
    try {
      const response = await api.post<ApiResponse<PermissionGroup>>(
        `/permission-groups`,
        groupData,
      );

      let group: PermissionGroup;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        group = (response.data as any).data;
      } else {
        group = response.data as PermissionGroup;
      }

      return group;
    } catch (error: any) {
      console.error(
        "Erreur lors de la création du groupe de permissions:",
        error,
      );
      throw error;
    }
  },

  // ==================== POLITIQUES DE SÉCURITÉ ====================

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

  /**
   * Crée une nouvelle politique de sécurité
   */
  async createSecurityPolicy(
    policyData: Omit<
      SecurityPolicy,
      | "uuid"
      | "date_creation"
      | "date_modification"
      | "violations_count"
      | "derniere_violation"
      | "derniere_modification"
    >,
  ): Promise<SecurityPolicy> {
    try {
      const response = await api.post<ApiResponse<SecurityPolicy>>(
        `/security-policies`,
        policyData,
      );

      let policy: SecurityPolicy;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        policy = (response.data as any).data;
      } else {
        policy = response.data as SecurityPolicy;
      }

      return policy;
    } catch (error: any) {
      console.error(
        "Erreur lors de la création de la politique de sécurité:",
        error,
      );
      throw error;
    }
  },

  // ==================== AUDIT ====================

  /**
   * Récupère l'audit des rôles et permissions
   */
  async getAuditLog(params?: {
    page?: number;
    limit?: number;
    action?: string;
    cible_type?: string;
    utilisateur_uuid?: string;
    date_debut?: string;
    date_fin?: string;
  }): Promise<{ logs: RolePermissionAudit[]; total: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.action) queryParams.append("action", params.action);
      if (params?.cible_type)
        queryParams.append("cible_type", params.cible_type);
      if (params?.utilisateur_uuid)
        queryParams.append("utilisateur_uuid", params.utilisateur_uuid);
      if (params?.date_debut)
        queryParams.append("date_debut", params.date_debut);
      if (params?.date_fin) queryParams.append("date_fin", params.date_fin);

      const queryString = queryParams.toString();
      const endpoint = queryString
        ? `/rbac/audit?${queryString}`
        : `/rbac/audit`;

      const response =
        await api.get<ApiResponse<RolePermissionAudit[]>>(endpoint);

      let logs: RolePermissionAudit[] = [];
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

  // ==================== RAPPORTS ====================

  /**
   * Génère un rapport de sécurité et conformité
   */
  async generateSecurityReport(params?: {
    periode_debut?: string;
    periode_fin?: string;
    format?: "json" | "pdf" | "csv";
  }): Promise<SecurityComplianceReport | Blob> {
    try {
      const response = await api.post(
        `/rbac/security-report`,
        params,
        params?.format === "pdf" || params?.format === "csv"
          ? { responseType: "blob" }
          : {},
      );

      if (params?.format === "pdf" || params?.format === "csv") {
        return response as Blob;
      }

      let report: SecurityComplianceReport;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        report = (response.data as any).data;
      } else {
        report = response.data as SecurityComplianceReport;
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

  // ==================== CONFIGURATION ====================

  /**
   * Récupère la configuration du RBAC
   */
  async getRBACConfig(): Promise<RBACConfig> {
    try {
      const response = await api.get<ApiResponse<RBACConfig>>(`/rbac/config`);

      let config: RBACConfig;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        config = (response.data as any).data;
      } else {
        config = response.data as RBACConfig;
      }

      // Configuration par défaut
      const defaultConfig: RBACConfig = {
        mode: "rbac",
        hierarchie_active: true,
        heritage_permissions: true,
        validation_auto_assignments: true,
        validation_cross_role: true,
        validation_conflicts: true,
        session: {
          timeout_minutes: 30,
          max_simultaneous: 3,
          reauthentification_requise: false,
        },
        mfa: {
          obligatoire_pour_roles: ["admin", "superadmin"],
          methodes_acceptees: ["sms", "email", "authenticator"],
        },
        audit: {
          log_all_checks: false,
          retention_days: 90,
          alert_on_violations: true,
          alert_threshold: 10,
        },
        notifications: {
          new_assignment: true,
          assignment_expiry: true,
          privilege_change: true,
          security_alert: true,
        },
        cache: {
          enabled: true,
          ttl_minutes: 5,
          max_size: 1000,
        },
        limites: {
          roles_par_utilisateur_max: 5,
          permissions_par_role_max: 100,
          assignments_par_role_max: 1000,
          sessions_par_utilisateur_max: 5,
        },
      };

      return { ...defaultConfig, ...config };
    } catch (error: any) {
      console.error(
        "Erreur lors de la récupération de la configuration:",
        error,
      );
      return {
        mode: "rbac",
        hierarchie_active: true,
        heritage_permissions: true,
        validation_auto_assignments: true,
        validation_cross_role: true,
        validation_conflicts: true,
        session: {
          timeout_minutes: 30,
          max_simultaneous: 3,
          reauthentification_requise: false,
        },
        mfa: {
          obligatoire_pour_roles: ["admin", "superadmin"],
          methodes_acceptees: ["sms", "email", "authenticator"],
        },
        audit: {
          log_all_checks: false,
          retention_days: 90,
          alert_on_violations: true,
          alert_threshold: 10,
        },
        notifications: {
          new_assignment: true,
          assignment_expiry: true,
          privilege_change: true,
          security_alert: true,
        },
        cache: {
          enabled: true,
          ttl_minutes: 5,
          max_size: 1000,
        },
        limites: {
          roles_par_utilisateur_max: 5,
          permissions_par_role_max: 100,
          assignments_par_role_max: 1000,
          sessions_par_utilisateur_max: 5,
        },
      };
    }
  },

  /**
   * Met à jour la configuration du RBAC
   */
  async updateRBACConfig(configData: Partial<RBACConfig>): Promise<RBACConfig> {
    try {
      const response = await api.put<ApiResponse<RBACConfig>>(
        `/rbac/config`,
        configData,
      );

      let config: RBACConfig;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        config = (response.data as any).data;
      } else {
        config = response.data as RBACConfig;
      }

      return config;
    } catch (error: any) {
      console.error(
        "Erreur lors de la mise à jour de la configuration:",
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
    filters?: RolePermissionFilterParams,
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
  async exportRolesToPDF(filters?: RolePermissionFilterParams): Promise<Blob> {
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
   * Valide la cohérence des permissions
   */
  async validatePermissions(): Promise<{
    isValid: boolean;
    errors: Array<{
      type: string;
      message: string;
      details?: any;
    }>;
    warnings: Array<{
      type: string;
      message: string;
      details?: any;
    }>;
  }> {
    try {
      const response = await api.get<ApiResponse<any>>(`/permissions/validate`);

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
        isValid: true,
        errors: [],
        warnings: [],
      };

      return { ...defaultResult, ...result };
    } catch (error: any) {
      console.error("Erreur lors de la validation des permissions:", error);
      throw error;
    }
  },

  /**
   * Synchronise les rôles et permissions avec des sources externes
   */
  async syncWithExternal(
    source: "ldap" | "ad" | "okta" | "azure",
    options?: Record<string, any>,
  ): Promise<{
    added: number;
    updated: number;
    removed: number;
    errors: string[];
  }> {
    try {
      const response = await api.post<ApiResponse<any>>(
        `/rbac/sync/${source}`,
        options,
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
        added: 0,
        updated: 0,
        removed: 0,
        errors: [],
      };

      return { ...defaultResult, ...result };
    } catch (error: any) {
      console.error("Erreur lors de la synchronisation:", error);
      throw error;
    }
  },

  /**
   * Teste le service RBAC
   */
  async testService(): Promise<{
    success: boolean;
    message: string;
    components: Record<string, boolean>;
  }> {
    try {
      const response = await api.get<
        ApiResponse<{
          success: boolean;
          message: string;
          components: Record<string, boolean>;
        }>
      >(`/rbac/test`);

      let result: {
        success: boolean;
        message: string;
        components: Record<string, boolean>;
      };
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        result = (response.data as any).data;
      } else {
        result = response.data as {
          success: boolean;
          message: string;
          components: Record<string, boolean>;
        };
      }

      return result;
    } catch (error: any) {
      console.error("Erreur lors du test du service:", error);
      return {
        success: false,
        message: "Service indisponible",
        components: {
          database: false,
          cache: false,
          audit: false,
        },
      };
    }
  },

  /**
   * Nettoie les données expirées
   */
  async cleanupExpiredData(): Promise<{
    assignments_expired: number;
    sessions_expired: number;
    cache_cleared: number;
  }> {
    try {
      const response = await api.post<ApiResponse<any>>(`/rbac/cleanup`);

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
        assignments_expired: 0,
        sessions_expired: 0,
        cache_cleared: 0,
      };

      return { ...defaultResult, ...result };
    } catch (error: any) {
      console.error("Erreur lors du nettoyage des données:", error);
      throw error;
    }
  },
};
