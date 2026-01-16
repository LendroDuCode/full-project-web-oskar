// services/roles/role.service.ts
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import type {
  Role,
  RoleCreateData,
  RoleUpdateData,
  RoleAssignment,
  RoleAssignmentCreateData,
  RoleHierarchy,
  RoleStats,
  RoleAudit,
  RoleConfig,
  RoleAnalysisReport,
  RoleTemplate,
  RolePermissionMatrix,
  RoleMigration,
  RoleFilterParams,
} from "./role.types";

export const roleService = {
  // ==================== GESTION DES RÔLES ====================

  /**
   * Récupère la liste des rôles
   */
  async getRoles(params?: {
    page?: number;
    limit?: number;
    filters?: RoleFilterParams;
  }): Promise<{ roles: Role[]; total: number; page?: number; pages?: number }> {
    try {
      console.log(
        "📡 Récupération des rôles depuis:",
        API_ENDPOINTS.ROLES.LIST,
      );

      const response = await api.get<any>(API_ENDPOINTS.ROLES.LIST);

      console.log("📦 Réponse complète des rôles:", {
        response,
        type: typeof response,
        isArray: Array.isArray(response),
        keys: response ? Object.keys(response) : [],
      });

      let roles: Role[] = [];

      // Essayer différentes structures de réponse
      if (Array.isArray(response)) {
        // Cas 1: La réponse est directement un tableau
        roles = response;
        console.log("✅ Réponse directe sous forme de tableau:", roles.length);
      } else if (response && response.data) {
        if (Array.isArray(response.data)) {
          // Cas 2: Structure { data: [...] }
          roles = response.data;
          console.log("✅ Réponse encapsulée (data):", roles.length);
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // Cas 3: Structure { data: { data: [...] } }
          roles = response.data.data;
          console.log("✅ Réponse imbriquée (data.data):", roles.length);
        } else if (response.data.roles && Array.isArray(response.data.roles)) {
          // Cas 4: Structure { data: { roles: [...] } }
          roles = response.data.roles;
          console.log("✅ Réponse roles (data.roles):", roles.length);
        } else if (response.data.items && Array.isArray(response.data.items)) {
          // Cas 5: Structure { data: { items: [...] } }
          roles = response.data.items;
          console.log("✅ Réponse items (data.items):", roles.length);
        } else if (typeof response.data === "object") {
          // Cas 6: C'est un objet, chercher un tableau à l'intérieur
          const keys = Object.keys(response.data);
          for (const key of keys) {
            if (Array.isArray(response.data[key])) {
              roles = response.data[key];
              console.log(
                `✅ Tableau trouvé dans data key "${key}":`,
                roles.length,
              );
              break;
            }
          }
        }
      } else if (response && response.roles) {
        // Cas 7: Structure { roles: [...] }
        roles = response.roles;
        console.log("✅ Réponse roles (root):", roles.length);
      } else {
        // Dernier recours: inspecter toutes les propriétés
        console.log("🔍 Inspection de la structure de réponse...");
        for (const [key, value] of Object.entries(response)) {
          console.log(
            `  ${key}:`,
            typeof value,
            Array.isArray(value) ? `(tableau, longueur: ${value.length})` : "",
          );
          if (Array.isArray(value)) {
            roles = value;
            console.log(
              `✅ Tableau trouvé dans root key "${key}":`,
              roles.length,
            );
            break;
          }
        }
      }

      if (roles.length === 0) {
        console.warn("⚠️ Aucun rôle trouvé dans la réponse");
      }

      return {
        roles,
        total: roles.length,
        page: params?.page || 1,
        pages: Math.ceil(roles.length / (params?.limit || 10)),
      };
    } catch (error: any) {
      console.error("🚨 Erreur lors de la récupération des rôles:", error);
      return { roles: [], total: 0, page: 1, pages: 1 };
    }
  },

  /**
   * Récupère les options de rôles pour les sélecteurs
   */
  async getRoleOptionsForSelect(): Promise<
    Array<{ value: string; label: string; data: Role }>
  > {
    try {
      console.log("📋 Récupération des options de rôles pour sélecteur");

      const { roles } = await this.getRoles({
        filters: { est_actif: true },
      });

      console.log("✅ Rôles trouvés pour le formulaire:", roles.length);

      return roles.map((role) => ({
        value: role.uuid,
        label: role.name,
        data: role,
      }));
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des options:", error);
      return [];
    }
  },

  /**
   * Récupère les rôles actifs pour les formulaires
   */
  async getActiveRoles(): Promise<Role[]> {
    try {
      console.log("✅ Récupération des rôles actifs");

      const { roles } = await this.getRoles();

      // Filtrer les rôles actifs (basé sur votre structure de données)
      const activeRoles = roles.filter((role) => {
        // Vérifier si le rôle est actif
        const isActive = role.status === "actif" && role.is_deleted === false;
        console.log(
          `Rôle ${role.name}: status=${role.status}, is_deleted=${role.is_deleted}, isActive=${isActive}`,
        );
        return isActive;
      });

      console.log("✅", activeRoles.length, "rôles actifs trouvés");
      return activeRoles;
    } catch (error: any) {
      console.error(
        "❌ Erreur lors de la récupération des rôles actifs:",
        error,
      );
      return [];
    }
  },

  /**
   * Récupère les rôles pour formulaire
   */
  async getRolesForForm(): Promise<Role[]> {
    try {
      console.log("📝 Récupération des rôles pour formulaire");

      const roles = await this.getActiveRoles();

      // Trier par nom
      roles.sort((a, b) => a.name.localeCompare(b.name));

      console.log("✅", roles.length, "rôles trouvés pour le formulaire");
      return roles;
    } catch (error: any) {
      console.error(
        "❌ Erreur lors de la récupération des rôles pour formulaire:",
        error,
      );
      return [];
    }
  },

  /**
   * Récupère les options pour les selects (méthode alternative)
   */
  async getRoleSelectOptions(): Promise<
    Array<{ value: string; label: string; data: Role }>
  > {
    try {
      console.log("📋 Récupération des options de sélection de rôles");

      const roles = await this.getRolesForForm();

      const optionsList = roles.map((role) => ({
        value: role.uuid,
        label: role.name,
        data: role,
      }));

      console.log("✅", optionsList.length, "options générées");
      return optionsList;
    } catch (error: any) {
      console.error(
        "❌ Erreur lors de la récupération des options de sélection:",
        error,
      );
      return [];
    }
  },

  /**
   * Récupère un rôle spécifique
   */
  async getRole(uuid: string): Promise<Role> {
    try {
      console.log("🔍 Récupération du rôle:", uuid);

      const response = await api.get<Role>(API_ENDPOINTS.ROLES.DETAIL(uuid));

      console.log("✅ Réponse du rôle:", response.data);

      // Vérifier la structure de la réponse
      let roleData: Role;
      if (response.data && (response.data as any).uuid) {
        roleData = response.data as Role;
      } else {
        console.error("❌ Structure de données rôle invalide:", response.data);
        throw new Error("Structure de données rôle invalide");
      }

      if (!roleData || !roleData.uuid) {
        throw new Error("Rôle non trouvé");
      }

      console.log("✅ Rôle trouvé:", roleData.name);
      return roleData;
    } catch (error: any) {
      console.error("❌ Erreur lors de la récupération du rôle:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },

  /**
   * Crée un nouveau rôle
   */
  async createRole(roleData: RoleCreateData): Promise<Role> {
    try {
      console.log("🆕 Création d'un nouveau rôle:", roleData.name);

      const response = await api.post<Role>(
        API_ENDPOINTS.ROLES.CREATE,
        roleData,
      );

      console.log("✅ Réponse de création du rôle:", response.data);

      let createdRole: Role;
      if (response.data && (response.data as any).uuid) {
        createdRole = response.data as Role;
      } else {
        throw new Error("Échec de la création du rôle");
      }

      return createdRole;
    } catch (error: any) {
      console.error("❌ Erreur lors de la création du rôle:", {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  /**
   * Met à jour un rôle existant
   */
  async updateRole(uuid: string, roleData: RoleUpdateData): Promise<Role> {
    try {
      console.log("✏️ Mise à jour du rôle:", uuid);

      const response = await api.put<Role>(
        API_ENDPOINTS.ROLES.UPDATE(uuid),
        roleData,
      );

      console.log("✅ Réponse de mise à jour du rôle:", response.data);

      let updatedRole: Role;
      if (response.data && (response.data as any).uuid) {
        updatedRole = response.data as Role;
      } else {
        throw new Error("Échec de la mise à jour du rôle");
      }

      return updatedRole;
    } catch (error: any) {
      console.error("❌ Erreur lors de la mise à jour du rôle:", error);
      throw error;
    }
  },

  /**
   * Supprime un rôle
   */
  async deleteRole(uuid: string): Promise<void> {
    try {
      console.log("🗑️ Suppression du rôle:", uuid);

      await api.delete(API_ENDPOINTS.ROLES.DELETE(uuid));

      console.log("✅ Rôle supprimé avec succès");
    } catch (error: any) {
      console.error("❌ Erreur lors de la suppression du rôle:", error);
      throw error;
    }
  },

  /**
   * Active/désactive un rôle
   */
  async toggleRoleStatus(uuid: string, actif: boolean): Promise<Role> {
    try {
      console.log(
        `🔄 ${actif ? "Activation" : "Désactivation"} du rôle:`,
        uuid,
      );

      const response = await api.put<Role>(`/roles/${uuid}/status`, {
        est_actif: actif,
      });

      let role: Role;
      if (response.data && (response.data as any).uuid) {
        role = response.data as Role;
      } else {
        throw new Error("Échec du changement de statut");
      }

      return role;
    } catch (error: any) {
      console.error("❌ Erreur lors du changement de statut du rôle:", error);
      throw error;
    }
  },

  /**
   * Valide les données d'un rôle
   */
  async validerRole(
    roleData: RoleCreateData,
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Validation de base
    if (!roleData.name || !roleData.name.trim()) {
      errors.push("Le nom du rôle est obligatoire");
    }

    if (!roleData.code || !roleData.code.trim()) {
      errors.push("Le code du rôle est obligatoire");
    }

    // Vous pouvez ajouter d'autres validations ici

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // ==================== UTILITAIRES ====================

  /**
   * Teste le service des rôles
   */
  async testRoleService(): Promise<boolean> {
    try {
      console.log("🧪 Test du service des rôles...");

      const { roles } = await this.getRoles();
      const hasRoles = roles.length > 0;

      console.log(
        "✅ Service des rôles opérationnel,",
        roles.length,
        "rôles trouvés",
      );
      return hasRoles;
    } catch (error: any) {
      console.error("❌ Test du service des rôles échoué:", error.message);
      return false;
    }
  },

  /**
   * Ping du service
   */
  async ping(): Promise<{ status: string; timestamp: string }> {
    try {
      console.log("🏓 Ping du service des rôles...");

      await this.getRoles();

      return {
        status: "OK",
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        status: "ERROR",
        timestamp: new Date().toISOString(),
      };
    }
  },
};
