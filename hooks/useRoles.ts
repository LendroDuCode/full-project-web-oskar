// hooks/useRoles.ts - Version simplifiée
import { useState, useCallback } from "react";
import { roleService } from "@/services/roles/role.service";
import type { Role } from "@/services/roles/role.types";

interface UseRolesReturn {
  // États
  roles: Role[];
  loading: boolean;
  error: string | null;
  success: string | null;

  // Opérations principales
  fetchRoles: () => Promise<void>;
  getRoleOptionsForSelect: () => Promise<
    Array<{ value: string; label: string; data: Role }>
  >;

  // Utilitaires
  clearError: () => void;
  clearSuccess: () => void;

  // États dérivés
  hasRoles: boolean;
  isEmpty: boolean;
}

export const useRoles = (): UseRolesReturn => {
  // États
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Gestion des messages
  const clearError = useCallback(() => setError(null), []);
  const clearSuccess = useCallback(() => setSuccess(null), []);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log("🔄 Fetching roles...");
      const { roles: fetchedRoles } = await roleService.getRoles();

      console.log("✅ Roles fetched:", fetchedRoles.length);
      setRoles(fetchedRoles);

      if (fetchedRoles.length === 0) {
        setError("Aucun rôle trouvé");
      } else {
        setSuccess(`${fetchedRoles.length} rôles chargés avec succès`);
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Erreur lors du chargement des rôles";
      setError(message);
      console.error("❌ Error fetching roles:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getRoleOptionsForSelect = useCallback(async () => {
    try {
      return await roleService.getRoleOptionsForSelect();
    } catch (err: any) {
      console.error("❌ Error getting role options:", err);
      return [];
    }
  }, []);

  return {
    // États
    roles,
    loading,
    error,
    success,

    // Opérations
    fetchRoles,
    getRoleOptionsForSelect,

    // Utilitaires
    clearError,
    clearSuccess,

    // États dérivés
    hasRoles: roles.length > 0,
    isEmpty: roles.length === 0 && !loading,
  };
};

export default useRoles;
