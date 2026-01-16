// hooks/useRolesPermissions.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import { rolePermissionService } from "@/services/roles-permissions/role-permission.service";
import type {
  Permission,
  PermissionCreateData,
  Role,
  RoleCreateData,
  RoleAssignment,
  RoleAssignmentCreateData,
  AccessCheckResult,
  RoleHierarchy,
  PermissionMatrix,
  RBACConfig,
  RolePermissionFilterParams,
  SecurityComplianceReport,
} from "@/services/roles-permissions/role-permission.types";

export function usePermissions(initialFilters?: RolePermissionFilterParams) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
  });
  const [filters, setFilters] = useState<RolePermissionFilterParams>(
    initialFilters || {},
  );

  const chargerPermissions = useCallback(
    async (customFilters?: RolePermissionFilterParams, page?: number) => {
      setLoading(true);
      setError(null);

      try {
        const result = await rolePermissionService.getPermissions({
          page: page || pagination.page,
          limit: pagination.limit,
          filters: { ...filters, ...customFilters },
        });

        setPermissions(result.permissions);
        setPagination((prev) => ({
          ...prev,
          total: result.total,
        }));

        if (customFilters) {
          setFilters((prev) => ({ ...prev, ...customFilters }));
        }
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des permissions");
      } finally {
        setLoading(false);
      }
    },
    [filters, pagination.page, pagination.limit],
  );

  const creerPermission = useCallback(async (data: PermissionCreateData) => {
    try {
      const nouvellePermission =
        await rolePermissionService.createPermission(data);
      setPermissions((prev) => [nouvellePermission, ...prev]);
      return nouvellePermission;
    } catch (err: any) {
      throw err;
    }
  }, []);

  const mettreAJourPermission = useCallback(
    async (uuid: string, data: Partial<Permission>) => {
      try {
        const permissionModifiee = await rolePermissionService.updatePermission(
          uuid,
          data,
        );
        setPermissions((prev) =>
          prev.map((perm) => (perm.uuid === uuid ? permissionModifiee : perm)),
        );
        return permissionModifiee;
      } catch (err: any) {
        throw err;
      }
    },
    [],
  );

  const supprimerPermission = useCallback(async (uuid: string) => {
    try {
      await rolePermissionService.deletePermission(uuid);
      setPermissions((prev) => prev.filter((perm) => perm.uuid !== uuid));
    } catch (err: any) {
      throw err;
    }
  }, []);

  const togglePermissionStatus = useCallback(
    async (uuid: string, active: boolean) => {
      try {
        const permissionModifiee =
          await rolePermissionService.togglePermissionStatus(uuid, active);
        setPermissions((prev) =>
          prev.map((perm) => (perm.uuid === uuid ? permissionModifiee : perm)),
        );
        return permissionModifiee;
      } catch (err: any) {
        throw err;
      }
    },
    [],
  );

  useEffect(() => {
    chargerPermissions();
  }, [chargerPermissions]);

  return {
    permissions,
    loading,
    error,
    pagination,
    filters,

    chargerPermissions,
    creerPermission,
    mettreAJourPermission,
    supprimerPermission,
    togglePermissionStatus,

    // Utilitaires
    permissionsParCategorie: useMemo(() => {
      return permissions.reduce(
        (acc, perm) => {
          if (!acc[perm.categorie]) {
            acc[perm.categorie] = [];
          }
          acc[perm.categorie].push(perm);
          return acc;
        },
        {} as Record<string, Permission[]>,
      );
    }, [permissions]),

    permissionsParModule: useMemo(() => {
      return permissions.reduce(
        (acc, perm) => {
          if (!acc[perm.module]) {
            acc[perm.module] = [];
          }
          acc[perm.module].push(perm);
          return acc;
        },
        {} as Record<string, Permission[]>,
      );
    }, [permissions]),

    permissionsActives: useMemo(
      () => permissions.filter((p) => p.est_active),
      [permissions],
    ),
    permissionsSysteme: useMemo(
      () => permissions.filter((p) => p.est_systeme),
      [permissions],
    ),
  };
}

export function useRoles(initialFilters?: RolePermissionFilterParams) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });
  const [filters, setFilters] = useState<RolePermissionFilterParams>(
    initialFilters || {},
  );

  const chargerRoles = useCallback(
    async (customFilters?: RolePermissionFilterParams, page?: number) => {
      setLoading(true);
      setError(null);

      try {
        const result = await rolePermissionService.getRoles({
          page: page || pagination.page,
          limit: pagination.limit,
          filters: { ...filters, ...customFilters },
        });

        setRoles(result.roles);
        setPagination((prev) => ({
          ...prev,
          total: result.total,
        }));

        if (customFilters) {
          setFilters((prev) => ({ ...prev, ...customFilters }));
        }
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des rôles");
      } finally {
        setLoading(false);
      }
    },
    [filters, pagination.page, pagination.limit],
  );

  const creerRole = useCallback(async (data: RoleCreateData) => {
    try {
      const nouveauRole = await rolePermissionService.createRole(data);
      setRoles((prev) => [nouveauRole, ...prev]);
      return nouveauRole;
    } catch (err: any) {
      throw err;
    }
  }, []);

  const mettreAJourRole = useCallback(
    async (uuid: string, data: Partial<Role>) => {
      try {
        const roleModifie = await rolePermissionService.updateRole(uuid, data);
        setRoles((prev) =>
          prev.map((role) => (role.uuid === uuid ? roleModifie : role)),
        );
        return roleModifie;
      } catch (err: any) {
        throw err;
      }
    },
    [],
  );

  const supprimerRole = useCallback(async (uuid: string) => {
    try {
      await rolePermissionService.deleteRole(uuid);
      setRoles((prev) => prev.filter((role) => role.uuid !== uuid));
    } catch (err: any) {
      throw err;
    }
  }, []);

  const toggleRoleStatus = useCallback(
    async (uuid: string, active: boolean) => {
      try {
        const roleModifie = await rolePermissionService.toggleRoleStatus(
          uuid,
          active,
        );
        setRoles((prev) =>
          prev.map((role) => (role.uuid === uuid ? roleModifie : role)),
        );
        return roleModifie;
      } catch (err: any) {
        throw err;
      }
    },
    [],
  );

  useEffect(() => {
    chargerRoles();
  }, [chargerRoles]);

  return {
    roles,
    loading,
    error,
    pagination,
    filters,

    chargerRoles,
    creerRole,
    mettreAJourRole,
    supprimerRole,
    toggleRoleStatus,

    // Utilitaires
    rolesParType: useMemo(() => {
      return roles.reduce(
        (acc, role) => {
          if (!acc[role.type]) {
            acc[role.type] = [];
          }
          acc[role.type].push(role);
          return acc;
        },
        {} as Record<string, Role[]>,
      );
    }, [roles]),

    rolesActifs: useMemo(() => roles.filter((r) => r.est_actif), [roles]),
    rolesParDefaut: useMemo(
      () => roles.filter((r) => r.est_par_defaut),
      [roles],
    ),
    rolesModifiables: useMemo(
      () => roles.filter((r) => r.est_modifiable),
      [roles],
    ),
  };
}

export function useRole(uuid?: string) {
  const [role, setRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [hierarchy, setHierarchy] = useState<RoleHierarchy | null>(null);
  const [assignments, setAssignments] = useState<RoleAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chargerRole = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const [roleData, permissionsData, hierarchyData, assignmentsData] =
        await Promise.all([
          rolePermissionService.getRole(id),
          rolePermissionService.getRolePermissions(id),
          rolePermissionService.getRoleHierarchy(id).catch(() => null),
          rolePermissionService
            .getRoleAssignments({ role_uuid: id, limit: 10 })
            .catch(() => ({ assignments: [], total: 0 })),
        ]);

      setRole(roleData);
      setPermissions(permissionsData);
      setHierarchy(hierarchyData);
      setAssignments(assignmentsData.assignments);

      return roleData;
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement du rôle");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const ajouterPermission = useCallback(
    async (permissionUuid: string) => {
      if (!role?.uuid) return null;

      try {
        const roleModifie = await rolePermissionService.addPermissionToRole(
          role.uuid,
          permissionUuid,
        );
        setRole(roleModifie);

        // Recharger les permissions
        const permissionsData = await rolePermissionService.getRolePermissions(
          role.uuid,
        );
        setPermissions(permissionsData);

        return roleModifie;
      } catch (err: any) {
        throw err;
      }
    },
    [role],
  );

  const retirerPermission = useCallback(
    async (permissionUuid: string) => {
      if (!role?.uuid) return null;

      try {
        const roleModifie =
          await rolePermissionService.removePermissionFromRole(
            role.uuid,
            permissionUuid,
          );
        setRole(roleModifie);

        // Recharger les permissions
        const permissionsData = await rolePermissionService.getRolePermissions(
          role.uuid,
        );
        setPermissions(permissionsData);

        return roleModifie;
      } catch (err: any) {
        throw err;
      }
    },
    [role],
  );

  const mettreAJourPermissions = useCallback(
    async (permissionUuids: string[]) => {
      if (!role?.uuid) return null;

      try {
        const roleModifie =
          await rolePermissionService.bulkUpdateRolePermissions(
            role.uuid,
            permissionUuids,
          );
        setRole(roleModifie);

        // Recharger les permissions
        const permissionsData = await rolePermissionService.getRolePermissions(
          role.uuid,
        );
        setPermissions(permissionsData);

        return roleModifie;
      } catch (err: any) {
        throw err;
      }
    },
    [role],
  );

  const chargerPlusAssignments = useCallback(async () => {
    if (!role?.uuid) return;

    try {
      const result = await rolePermissionService.getRoleAssignments({
        role_uuid: role.uuid,
        limit: assignments.length + 20,
      });
      setAssignments(result.assignments);
    } catch (err: any) {
      console.error("Erreur lors du chargement des attributions:", err);
    }
  }, [role, assignments.length]);

  useEffect(() => {
    if (uuid) {
      chargerRole(uuid);
    }
  }, [uuid, chargerRole]);

  const refresh = useCallback(() => {
    if (uuid) {
      chargerRole(uuid);
    }
  }, [uuid, chargerRole]);

  return {
    role,
    permissions,
    hierarchy,
    assignments,
    loading,
    error,

    chargerRole,
    ajouterPermission,
    retirerPermission,
    mettreAJourPermissions,
    chargerPlusAssignments,
    refresh,

    // Utilitaires
    aPermissions: permissions.length > 0,
    nombrePermissions: permissions.length,
    nombreUtilisateurs: role?.utilisateurs_count || 0,
    estActif: role?.est_actif || false,
    estModifiable: role?.est_modifiable || false,
  };
}

export function useRoleAssignments() {
  const [assignments, setAssignments] = useState<RoleAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });

  const chargerAssignments = useCallback(
    async (params?: {
      page?: number;
      limit?: number;
      utilisateur_uuid?: string;
      role_uuid?: string;
      statut?: string;
    }) => {
      setLoading(true);
      setError(null);

      try {
        const result = await rolePermissionService.getRoleAssignments({
          page: params?.page || pagination.page,
          limit: params?.limit || pagination.limit,
          ...params,
        });

        setAssignments(result.assignments);
        setPagination((prev) => ({
          ...prev,
          total: result.total,
        }));
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des attributions");
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.limit],
  );

  const attribuerRole = useCallback(async (data: RoleAssignmentCreateData) => {
    try {
      const nouvelleAttribution = await rolePermissionService.assignRole(data);
      setAssignments((prev) => [nouvelleAttribution, ...prev]);
      return nouvelleAttribution;
    } catch (err: any) {
      throw err;
    }
  }, []);

  const revoquerAttribution = useCallback(
    async (assignmentUuid: string, motif?: string) => {
      try {
        const attributionRevokee =
          await rolePermissionService.revokeRoleAssignment(
            assignmentUuid,
            motif,
          );
        setAssignments((prev) =>
          prev.map((assignment) =>
            assignment.uuid === assignmentUuid
              ? attributionRevokee
              : assignment,
          ),
        );
        return attributionRevokee;
      } catch (err: any) {
        throw err;
      }
    },
    [],
  );

  const suspendreAttribution = useCallback(
    async (assignmentUuid: string, motif: string) => {
      try {
        const attributionSuspendue =
          await rolePermissionService.suspendRoleAssignment(
            assignmentUuid,
            motif,
          );
        setAssignments((prev) =>
          prev.map((assignment) =>
            assignment.uuid === assignmentUuid
              ? attributionSuspendue
              : assignment,
          ),
        );
        return attributionSuspendue;
      } catch (err: any) {
        throw err;
      }
    },
    [],
  );

  const reactiverAttribution = useCallback(async (assignmentUuid: string) => {
    try {
      const attributionReactivee =
        await rolePermissionService.reactivateRoleAssignment(assignmentUuid);
      setAssignments((prev) =>
        prev.map((assignment) =>
          assignment.uuid === assignmentUuid
            ? attributionReactivee
            : assignment,
        ),
      );
      return attributionReactivee;
    } catch (err: any) {
      throw err;
    }
  }, []);

  useEffect(() => {
    chargerAssignments();
  }, [chargerAssignments]);

  return {
    assignments,
    loading,
    error,
    pagination,

    chargerAssignments,
    attribuerRole,
    revoquerAttribution,
    suspendreAttribution,
    reactiverAttribution,

    // Utilitaires
    assignmentsActifs: useMemo(
      () => assignments.filter((a) => a.statut === "actif"),
      [assignments],
    ),
    assignmentsExpires: useMemo(
      () => assignments.filter((a) => a.statut === "expire"),
      [assignments],
    ),
    assignmentsSuspendus: useMemo(
      () => assignments.filter((a) => a.statut === "suspendu"),
      [assignments],
    ),
  };
}

export function useAccessCheck() {
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCheck, setLastCheck] = useState<AccessCheckResult | null>(null);

  const verifierAcces = useCallback(
    async (
      utilisateurUuid: string,
      utilisateurType: string,
      permissionCode: string,
      contexte?: Record<string, any>,
    ): Promise<AccessCheckResult | null> => {
      setChecking(true);
      setError(null);

      try {
        const result = await rolePermissionService.checkAccess({
          utilisateur_uuid: utilisateurUuid,
          utilisateur_type: utilisateurType,
          permission_code: permissionCode,
          contexte,
        });

        setLastCheck(result);
        return result;
      } catch (err: any) {
        setError(err.message || "Erreur lors de la vérification d'accès");
        return null;
      } finally {
        setChecking(false);
      }
    },
    [],
  );

  const verifierMultiplesAcces = useCallback(
    async (
      utilisateurUuid: string,
      utilisateurType: string,
      permissionsCodes: string[],
      contexte?: Record<string, any>,
    ): Promise<Record<string, AccessCheckResult> | null> => {
      setChecking(true);
      setError(null);

      try {
        const result = await rolePermissionService.checkBulkAccess({
          utilisateur_uuid: utilisateurUuid,
          utilisateur_type: utilisateurType,
          permissions_codes: permissionsCodes,
          contexte,
        });

        return result.resultats;
      } catch (err: any) {
        setError(
          err.message || "Erreur lors de la vérification multiple d'accès",
        );
        return null;
      } finally {
        setChecking(false);
      }
    },
    [],
  );

  const getPermissionsUtilisateur = useCallback(
    async (utilisateurUuid: string, includeDetails: boolean = false) => {
      try {
        return await rolePermissionService.getUserPermissions(
          utilisateurUuid,
          includeDetails,
        );
      } catch (err: any) {
        console.error(
          "Erreur lors de la récupération des permissions utilisateur:",
          err,
        );
        return { permissions: [], roles: [] };
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setLastCheck(null);
    setError(null);
  }, []);

  return {
    checking,
    error,
    lastCheck,

    verifierAcces,
    verifierMultiplesAcces,
    getPermissionsUtilisateur,
    reset,

    // Utilitaires
    aEchec: lastCheck?.autorise === false,
    aSucces: lastCheck?.autorise === true,
    niveauAcces: lastCheck?.niveau_acces || "none",
  };
}

export function usePermissionMatrix() {
  const [matrix, setMatrix] = useState<PermissionMatrix | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chargerMatrix = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const matrixData = await rolePermissionService.getPermissionMatrix();
      setMatrix(matrixData);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement de la matrice");
    } finally {
      setLoading(false);
    }
  }, []);

  const chargerMatrixParCategorie = useCallback(async (categorie: string) => {
    setLoading(true);
    setError(null);

    try {
      const matrixData =
        await rolePermissionService.getPermissionMatrixByCategory(categorie);
      setMatrix(matrixData);
    } catch (err: any) {
      setError(
        err.message || "Erreur lors du chargement de la matrice par catégorie",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    chargerMatrix();
  }, [chargerMatrix]);

  return {
    matrix,
    loading,
    error,

    chargerMatrix,
    chargerMatrixParCategorie,

    // Utilitaires
    aDonnees:
      !!matrix && matrix.roles.length > 0 && matrix.permissions.length > 0,
    nombreRoles: matrix?.roles.length || 0,
    nombrePermissions: matrix?.permissions.length || 0,
  };
}

export function useRBACConfig() {
  const [config, setConfig] = useState<RBACConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const chargerConfig = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const configData = await rolePermissionService.getRBACConfig();
      setConfig(configData);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement de la configuration");
    } finally {
      setLoading(false);
    }
  }, []);

  const mettreAJourConfig = useCallback(
    async (configData: Partial<RBACConfig>) => {
      setSaving(true);
      setError(null);

      try {
        const nouvelleConfig =
          await rolePermissionService.updateRBACConfig(configData);
        setConfig(nouvelleConfig);
        return nouvelleConfig;
      } catch (err: any) {
        setError(
          err.message || "Erreur lors de la mise à jour de la configuration",
        );
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const validerPermissions = useCallback(async () => {
    try {
      return await rolePermissionService.validatePermissions();
    } catch (err: any) {
      console.error("Erreur lors de la validation des permissions:", err);
      throw err;
    }
  }, []);

  useEffect(() => {
    chargerConfig();
  }, [chargerConfig]);

  return {
    config,
    loading,
    saving,
    error,

    chargerConfig,
    mettreAJourConfig,
    validerPermissions,

    // Utilitaires
    mode: config?.mode || "rbac",
    hierarchieActive: config?.hierarchie_active || false,
    heritageActif: config?.heritage_permissions || false,
    cacheActif: config?.cache?.enabled || false,
  };
}

export function useSecurityCompliance() {
  const [report, setReport] = useState<SecurityComplianceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const genererRapport = useCallback(
    async (params?: { periode_debut?: string; periode_fin?: string }) => {
      setGenerating(true);
      setError(null);

      try {
        const rapport = (await rolePermissionService.generateSecurityReport(
          params,
        )) as SecurityComplianceReport;
        setReport(rapport);
        return rapport;
      } catch (err: any) {
        setError(err.message || "Erreur lors de la génération du rapport");
        throw err;
      } finally {
        setGenerating(false);
      }
    },
    [],
  );

  const exporterRapportPDF = useCallback(
    async (params?: { periode_debut?: string; periode_fin?: string }) => {
      try {
        return (await rolePermissionService.generateSecurityReport({
          ...params,
          format: "pdf",
        })) as Blob;
      } catch (err: any) {
        console.error("Erreur lors de l'export du rapport:", err);
        throw err;
      }
    },
    [],
  );

  const nettoyerDonnees = useCallback(async () => {
    try {
      return await rolePermissionService.cleanupExpiredData();
    } catch (err: any) {
      console.error("Erreur lors du nettoyage des données:", err);
      throw err;
    }
  }, []);

  return {
    report,
    loading: loading || generating,
    error,

    genererRapport,
    exporterRapportPDF,
    nettoyerDonnees,

    // Utilitaires
    aRapport: !!report,
    nombreAlertes: report?.alertes.length || 0,
    nombreRecommandations: report?.recommendations.length || 0,
    tauxConformite: report?.conformite?.principes_least_privilege || 0,
  };
}

export function useRoleHierarchy() {
  const [hierarchies, setHierarchies] = useState<RoleHierarchy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chargerHierarchies = useCallback(async (roleUuids: string[]) => {
    setLoading(true);
    setError(null);

    try {
      const hierarchiesData = await Promise.all(
        roleUuids.map((uuid) =>
          rolePermissionService.getRoleHierarchy(uuid).catch(() => null),
        ),
      );

      setHierarchies(hierarchiesData.filter(Boolean) as RoleHierarchy[]);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des hiérarchies");
    } finally {
      setLoading(false);
    }
  }, []);

  const getArbreHierarchie = useCallback(
    (roleUuid: string) => {
      const hierarchy = hierarchies.find((h) => h.role_uuid === roleUuid);
      if (!hierarchy) return null;

      const construireArbre = (node: RoleHierarchy): any => {
        return {
          ...node,
          enfants: node.enfants.map((child) => {
            const childHierarchy = hierarchies.find(
              (h) => h.role_uuid === child.uuid,
            );
            return childHierarchy ? construireArbre(childHierarchy) : child;
          }),
        };
      };

      return construireArbre(hierarchy);
    },
    [hierarchies],
  );

  return {
    hierarchies,
    loading,
    error,

    chargerHierarchies,
    getArbreHierarchie,

    // Utilitaires
    aHierarchies: hierarchies.length > 0,
  };
}
