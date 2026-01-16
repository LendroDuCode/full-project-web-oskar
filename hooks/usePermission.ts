// hooks/usePermission.ts
import { useState, useEffect, useCallback } from "react";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { api } from "@/lib/api-client";
import type { ApiResponse } from "@/types/common";

export interface Permission {
  uuid: string;
  code: string;
  nom: string;
  description?: string;
  categorie: string;
  type: "systeme" | "module" | "action" | "custom";
  niveau: 1 | 2 | 3 | 4 | 5; // 1: Bas, 5: Élevé
  est_actif: boolean;
  est_systeme: boolean;
  est_visible: boolean;
  est_obligatoire?: boolean;

  // Métadonnées
  module?: string;
  controller?: string;
  action?: string;
  icone?: string;
  couleur?: string;
  tags?: string[];

  // Relations
  permission_parent_uuid?: string;
  permission_parent_code?: string;
  permissions_enfants?: string[];

  // Dates
  date_creation: string;
  date_modification: string;
  date_activation?: string;
  date_desactivation?: string;

  // Création/modification
  created_by: string;
  created_by_nom?: string;
  updated_by?: string;
  updated_by_nom?: string;

  // Statistiques
  roles_count?: number;
  utilisateurs_count?: number;
}

export interface PermissionCreateData {
  code: string;
  nom: string;
  description?: string;
  categorie: string;
  type: "systeme" | "module" | "action" | "custom";
  niveau?: 1 | 2 | 3 | 4 | 5;
  est_actif?: boolean;
  est_visible?: boolean;
  module?: string;
  controller?: string;
  action?: string;
  permission_parent_uuid?: string;
  icone?: string;
  couleur?: string;
  tags?: string[];
}

export interface PermissionUpdateData {
  nom?: string;
  description?: string;
  categorie?: string;
  type?: "systeme" | "module" | "action" | "custom";
  niveau?: 1 | 2 | 3 | 4 | 5;
  est_actif?: boolean;
  est_visible?: boolean;
  module?: string;
  controller?: string;
  action?: string;
  permission_parent_uuid?: string;
  icone?: string;
  couleur?: string;
  tags?: string[];
}

export interface UsePermissionOptions {
  autoFetch?: boolean;
  onlyActive?: boolean;
  includeInactive?: boolean;
  includeSystem?: boolean;
  categorie?: string;
  type?: string;
  niveau?: number;
  searchTerm?: string;
  sortBy?:
    | "nom"
    | "code"
    | "categorie"
    | "niveau"
    | "date_creation"
    | "roles_count";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
  avecRoles?: boolean;
}

export const usePermission = (options: UsePermissionOptions = {}) => {
  const {
    autoFetch = true,
    onlyActive = true,
    includeInactive = false,
    includeSystem = false,
    categorie = "",
    type = "",
    niveau = 0,
    searchTerm = "",
    sortBy = "categorie",
    sortOrder = "asc",
    page = 1,
    limit = 50,
    avecRoles = false,
  } = options;

  // État
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [selectedPermission, setSelectedPermission] =
    useState<Permission | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(page);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Récupérer la liste des permissions
  const fetchPermissions = useCallback(
    async (pageNum: number = currentPage) => {
      try {
        setLoading(true);
        setError(null);

        // Construire les paramètres de requête
        const params = new URLSearchParams();

        if (onlyActive) {
          params.append("actifs", "true");
        } else if (includeInactive) {
          params.append("include_inactive", "true");
        }

        if (!includeSystem) {
          params.append("exclude_system", "true");
        }

        if (categorie) {
          params.append("categorie", categorie);
        }

        if (type) {
          params.append("type", type);
        }

        if (niveau > 0) {
          params.append("niveau", niveau.toString());
        }

        if (searchTerm) {
          params.append("search", searchTerm);
        }

        if (avecRoles) {
          params.append("avec_roles", "true");
        }

        params.append("page", pageNum.toString());
        params.append("limit", limit.toString());
        params.append("sort_by", sortBy);
        params.append("sort_order", sortOrder);

        const endpoint = `${API_ENDPOINTS.PERMISSIONS.LIST}?${params.toString()}`;
        const response = await api.get<ApiResponse<Permission[]>>(endpoint);

        if (response.status === "success") {
          setPermissions(response.data);
          setTotal(response.metadata?.total || response.data.length);
          setCurrentPage(response.metadata?.page || pageNum);
          setTotalPages(response.metadata?.pages || 1);
        } else {
          throw new Error(
            response.message ||
              "Erreur lors de la récupération des permissions",
          );
        }
      } catch (err: any) {
        setError(err);
        console.error("Erreur fetchPermissions:", err);
      } finally {
        setLoading(false);
      }
    },
    [
      onlyActive,
      includeInactive,
      includeSystem,
      categorie,
      type,
      niveau,
      searchTerm,
      sortBy,
      sortOrder,
      limit,
      currentPage,
      avecRoles,
    ],
  );

  // Récupérer une permission spécifique
  const fetchPermission = useCallback(async (uuid: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<ApiResponse<Permission>>(
        API_ENDPOINTS.PERMISSIONS.DETAIL(uuid),
      );

      if (response.status === "success") {
        setSelectedPermission(response.data);
        return response.data;
      } else {
        throw new Error(
          response.message || "Erreur lors de la récupération de la permission",
        );
      }
    } catch (err: any) {
      setError(err);
      console.error("Erreur fetchPermission:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Créer une nouvelle permission
  const createPermission = useCallback(async (data: PermissionCreateData) => {
    try {
      setLoading(true);
      setError(null);

      // Validation
      if (!data.code || !data.nom || !data.categorie || !data.type) {
        throw new Error("Tous les champs obligatoires doivent être remplis");
      }

      const response = await api.post<ApiResponse<Permission>>(
        API_ENDPOINTS.PERMISSIONS.CREATE,
        data,
      );

      if (response.status === "success") {
        setPermissions((prev) => [response.data, ...prev]);
        return response.data;
      } else {
        throw new Error(
          response.message || "Erreur lors de la création de la permission",
        );
      }
    } catch (err: any) {
      setError(err);
      console.error("Erreur createPermission:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Mettre à jour une permission
  const updatePermission = useCallback(
    async (uuid: string, data: PermissionUpdateData) => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.put<ApiResponse<Permission>>(
          API_ENDPOINTS.PERMISSIONS.UPDATE(uuid),
          data,
        );

        if (response.status === "success") {
          setPermissions((prev) =>
            prev.map((permission) =>
              permission.uuid === uuid ? response.data : permission,
            ),
          );

          if (selectedPermission?.uuid === uuid) {
            setSelectedPermission(response.data);
          }

          return response.data;
        } else {
          throw new Error(
            response.message ||
              "Erreur lors de la mise à jour de la permission",
          );
        }
      } catch (err: any) {
        setError(err);
        console.error("Erreur updatePermission:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedPermission],
  );

  // Supprimer une permission
  const deletePermission = useCallback(
    async (uuid: string) => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.delete<ApiResponse<void>>(
          API_ENDPOINTS.PERMISSIONS.DELETE(uuid),
        );

        if (response.status === "success") {
          setPermissions((prev) =>
            prev.filter((permission) => permission.uuid !== uuid),
          );

          if (selectedPermission?.uuid === uuid) {
            setSelectedPermission(null);
          }
        } else {
          throw new Error(
            response.message ||
              "Erreur lors de la suppression de la permission",
          );
        }
      } catch (err: any) {
        setError(err);
        console.error("Erreur deletePermission:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedPermission],
  );

  // Activer/désactiver une permission
  const togglePermissionStatus = useCallback(
    async (uuid: string, actif: boolean) => {
      try {
        return await updatePermission(uuid, { est_actif: actif });
      } catch (err) {
        throw err;
      }
    },
    [updatePermission],
  );

  // Rendre visible/invisible une permission
  const togglePermissionVisibility = useCallback(
    async (uuid: string, visible: boolean) => {
      try {
        return await updatePermission(uuid, { est_visible: visible });
      } catch (err) {
        throw err;
      }
    },
    [updatePermission],
  );

  // Vérifier si un code est disponible
  const checkCodeAvailability = useCallback(
    async (code: string, excludeUuid?: string) => {
      try {
        setLoading(true);

        const params = new URLSearchParams();
        params.append("code", code);
        if (excludeUuid) {
          params.append("exclude", excludeUuid);
        }

        const response = await api.get<ApiResponse<{ disponible: boolean }>>(
          `${API_ENDPOINTS.PERMISSIONS.LIST}/check-code?${params.toString()}`,
        );

        return response.data?.disponible ?? false;
      } catch (err: any) {
        console.error("Erreur checkCodeAvailability:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Récupérer les permissions par catégorie
  const fetchPermissionsByCategory = useCallback(async (category: string) => {
    try {
      setLoading(true);

      const response = await api.get<ApiResponse<Permission[]>>(
        `${API_ENDPOINTS.PERMISSIONS.LIST}/categorie/${category}`,
      );

      if (response.status === "success") {
        setPermissions(response.data);
        setTotal(response.data.length);
      }
    } catch (err: any) {
      setError(err);
      console.error("Erreur fetchPermissionsByCategory:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Récupérer les permissions par type
  const fetchPermissionsByType = useCallback(async (permType: string) => {
    try {
      setLoading(true);

      const response = await api.get<ApiResponse<Permission[]>>(
        `${API_ENDPOINTS.PERMISSIONS.LIST}/type/${permType}`,
      );

      if (response.status === "success") {
        setPermissions(response.data);
        setTotal(response.data.length);
      }
    } catch (err: any) {
      setError(err);
      console.error("Erreur fetchPermissionsByType:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Récupérer les permissions avec leur nombre d'utilisations
  const fetchPermissionsWithStats = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get<ApiResponse<Permission[]>>(
        `${API_ENDPOINTS.PERMISSIONS.LIST}/with-stats`,
      );

      if (response.status === "success") {
        setPermissions(response.data);
        setTotal(response.data.length);
      }
    } catch (err: any) {
      setError(err);
      console.error("Erreur fetchPermissionsWithStats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Réinitialiser la sélection
  const resetSelection = useCallback(() => {
    setSelectedPermission(null);
  }, []);

  // Exporter en PDF
  const exportToPDF = useCallback(async (): Promise<Blob> => {
    try {
      setLoading(true);

      const response = await api.get(API_ENDPOINTS.PERMISSIONS.EXPORT_PDF, {
        responseType: "blob",
      });

      return response.data;
    } catch (err: any) {
      setError(err);
      console.error("Erreur exportToPDF:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Pagination
  const goToPage = useCallback(
    (pageNum: number) => {
      if (pageNum >= 1 && pageNum <= totalPages) {
        setCurrentPage(pageNum);
        fetchPermissions(pageNum);
      }
    },
    [totalPages, fetchPermissions],
  );

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, totalPages, goToPage]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  // Effet pour le chargement initial
  useEffect(() => {
    if (autoFetch) {
      fetchPermissions();
    }
  }, [autoFetch, fetchPermissions]);

  // Grouper les permissions par catégorie
  const permissionsParCategorie = permissions.reduce(
    (acc, permission) => {
      const categorie = permission.categorie || "Autres";
      if (!acc[categorie]) {
        acc[categorie] = [];
      }
      acc[categorie].push(permission);
      return acc;
    },
    {} as Record<string, Permission[]>,
  );

  // Obtenir les catégories uniques
  const categoriesUniques = Object.keys(permissionsParCategorie);

  return {
    // État
    permissions,
    loading,
    error,
    selectedPermission,
    total,
    currentPage,
    totalPages,

    // Actions
    fetchPermissions,
    fetchPermission,
    createPermission,
    updatePermission,
    deletePermission,
    togglePermissionStatus,
    togglePermissionVisibility,
    checkCodeAvailability,
    fetchPermissionsByCategory,
    fetchPermissionsByType,
    fetchPermissionsWithStats,
    resetSelection,
    exportToPDF,

    // Pagination
    goToPage,
    nextPage,
    prevPage,

    // Sélection
    setSelectedPermission,

    // Utilitaires
    permissionsActives: permissions.filter((p) => p.est_actif),
    permissionsSysteme: permissions.filter((p) => p.est_systeme),
    permissionsCustom: permissions.filter((p) => !p.est_systeme),
    permissionsParNiveau: permissions.reduce(
      (acc, p) => {
        if (!acc[p.niveau]) acc[p.niveau] = [];
        acc[p.niveau].push(p);
        return acc;
      },
      {} as Record<number, Permission[]>,
    ),

    // Groupement
    permissionsParCategorie,
    categoriesUniques,

    // Gestion d'état
    setLoading,
    setError,
  };
};
