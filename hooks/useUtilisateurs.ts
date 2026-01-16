// hooks/useUtilisateurs.ts (ou hooks/useUsers.ts selon votre structure)
import { useState, useCallback } from "react";
import { userService } from "@/services/utilisateurs/utilisateur.service";
import type {
  User,
  PaginationParams,
} from "@/services/utilisateurs/user.types";

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // Fonction pour charger les utilisateurs normaux (actifs)
  const fetchUsers = useCallback(async (params?: PaginationParams) => {
    setLoading(true);
    setError(null);

    try {
      const usersList = await userService.getUsers(params || {});
      console.log("📦 Users fetched:", usersList);

      // Gestion différente selon le format de réponse
      let usersData: User[] = [];
      let totalCount = 0;

      if (Array.isArray(usersList)) {
        // Cas 1: Retour direct d'un tableau
        usersData = usersList;
        totalCount = usersList.length;
      } else if (usersList && typeof usersList === "object") {
        // Cas 2: Retour d'un objet avec propriété data
        if ("data" in usersList && Array.isArray(usersList.data)) {
          usersData = usersList.data;
          totalCount = usersList.count || usersList.data.length;
        } else {
          // Cas 3: Essayons de trouver un tableau dans l'objet
          const possibleArray = Object.values(usersList).find((val) =>
            Array.isArray(val),
          );
          if (possibleArray) {
            usersData = possibleArray as User[];
            totalCount = usersData.length;
          }
        }
      }

      setUsers(usersData);

      const currentPage = params?.page || pagination.page;
      const currentLimit = params?.limit || pagination.limit;

      setPagination((prev) => ({
        ...prev,
        page: currentPage,
        limit: currentLimit,
        total: totalCount,
        pages: Math.ceil(totalCount / currentLimit) || 1,
      }));

      console.log("✅ Users state updated:", {
        count: usersData.length,
        total: totalCount,
        pages: Math.ceil(totalCount / currentLimit),
      });
    } catch (err: any) {
      console.error("❌ Error fetching users:", err);
      setError(err.message || "Erreur lors du chargement des utilisateurs");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour charger les utilisateurs bloqués
  const fetchBlockedUsers = useCallback(async (params?: PaginationParams) => {
    setLoading(true);
    setError(null);

    try {
      console.log("🔄 Fetching blocked users...");

      // Vérifions d'abord si le service a la méthode
      if (typeof userService.getBlockedUsers === "function") {
        const response = await userService.getBlockedUsers(params || {});
        console.log("📦 Blocked users response:", response);

        let usersData: User[] = [];
        let totalCount = 0;

        // Même logique de gestion de réponse
        if (response && typeof response === "object") {
          if ("users" in response && Array.isArray(response.users)) {
            usersData = response.users;
            totalCount = response.count || response.users.length;
          } else if ("data" in response && Array.isArray(response.data)) {
            usersData = response.data;
            totalCount = response.count || response.data.length;
          } else if (Array.isArray(response)) {
            usersData = response;
            totalCount = response.length;
          }
        }

        setUsers(usersData);

        const currentPage = params?.page || pagination.page;
        const currentLimit = params?.limit || pagination.limit;

        setPagination((prev) => ({
          ...prev,
          page: currentPage,
          limit: currentLimit,
          total: totalCount,
          pages: Math.ceil(totalCount / currentLimit) || 1,
        }));

        console.log("✅ Blocked users state updated:", {
          count: usersData.length,
          total: totalCount,
        });
      } else {
        // Fallback: utiliser getUsers avec un filtre status
        console.warn("⚠️ getBlockedUsers not available, using fallback");
        const response = await userService.getUsers({
          ...params,
          status: "blocked", // En supposant que votre API supporte ce filtre
        });

        let usersData: User[] = [];
        if (Array.isArray(response)) {
          usersData = response;
        } else if (
          response &&
          "data" in response &&
          Array.isArray(response.data)
        ) {
          usersData = response.data;
        }

        setUsers(usersData);
      }
    } catch (err: any) {
      console.error("❌ Error fetching blocked users:", err);
      setError(
        err.message || "Erreur lors du chargement des utilisateurs bloqués",
      );
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour charger les utilisateurs supprimés
  const fetchDeletedUsers = useCallback(async (params?: PaginationParams) => {
    setLoading(true);
    setError(null);

    try {
      console.log("🔄 Fetching deleted users...");

      if (typeof userService.getDeletedUsers === "function") {
        const response = await userService.getDeletedUsers(params || {});
        console.log("📦 Deleted users response:", response);

        let usersData: User[] = [];
        let totalCount = 0;

        if (response && typeof response === "object") {
          if ("users" in response && Array.isArray(response.users)) {
            usersData = response.users;
            totalCount = response.count || response.users.length;
          } else if ("data" in response && Array.isArray(response.data)) {
            usersData = response.data;
            totalCount = response.count || response.data.length;
          }
        }

        setUsers(usersData);

        const currentPage = params?.page || pagination.page;
        const currentLimit = params?.limit || pagination.limit;

        setPagination((prev) => ({
          ...prev,
          page: currentPage,
          limit: currentLimit,
          total: totalCount,
          pages: Math.ceil(totalCount / currentLimit) || 1,
        }));
      } else {
        // Fallback
        console.warn("⚠️ getDeletedUsers not available");
        setUsers([]);
      }
    } catch (err: any) {
      console.error("❌ Error fetching deleted users:", err);
      setError(
        err.message || "Erreur lors du chargement des utilisateurs supprimés",
      );
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Autres fonctions existantes
  const updateUser = useCallback(
    async (uuid: string, userData: Partial<User>): Promise<User> => {
      setLoading(true);
      setError(null);

      try {
        const updatedUser = await userService.updateUser(uuid, userData);

        // Mettre à jour l'utilisateur dans la liste
        setUsers((prev) =>
          prev.map((user) =>
            user.uuid === uuid ? { ...user, ...updatedUser } : user,
          ),
        );

        return updatedUser;
      } catch (err: any) {
        console.error("❌ Error updating user:", err);
        setError(
          err.message || "Erreur lors de la mise à jour de l'utilisateur",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const deleteUser = useCallback(async (uuid: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await userService.deleteUser(uuid);

      // Retirer l'utilisateur de la liste
      setUsers((prev) => prev.filter((user) => user.uuid !== uuid));

      // Mettre à jour la pagination
      setPagination((prev) => ({
        ...prev,
        total: prev.total - 1,
        pages: Math.ceil((prev.total - 1) / prev.limit) || 1,
      }));
    } catch (err: any) {
      console.error("❌ Error deleting user:", err);
      setError(err.message || "Erreur lors de la suppression de l'utilisateur");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const blockUser = useCallback(async (uuid: string): Promise<User> => {
    setLoading(true);
    setError(null);

    try {
      const blockedUser = await userService.blockUser(uuid);

      // Mettre à jour l'utilisateur dans la liste
      setUsers((prev) =>
        prev.map((user) =>
          user.uuid === uuid
            ? { ...user, ...blockedUser, est_bloque: true }
            : user,
        ),
      );

      return blockedUser;
    } catch (err: any) {
      console.error("❌ Error blocking user:", err);
      setError(err.message || "Erreur lors du blocage de l'utilisateur");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const unblockUser = useCallback(async (uuid: string): Promise<User> => {
    setLoading(true);
    setError(null);

    try {
      const unblockedUser = await userService.unblockUser(uuid);

      // Mettre à jour l'utilisateur dans la liste
      setUsers((prev) =>
        prev.map((user) =>
          user.uuid === uuid
            ? { ...user, ...unblockedUser, est_bloque: false }
            : user,
        ),
      );

      return unblockedUser;
    } catch (err: any) {
      console.error("❌ Error unblocking user:", err);
      setError(err.message || "Erreur lors du déblocage de l'utilisateur");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const restoreUser = useCallback(async (uuid: string): Promise<User> => {
    setLoading(true);
    setError(null);

    try {
      const restoredUser = await userService.restoreUser(uuid);

      // Mettre à jour l'utilisateur dans la liste
      setUsers((prev) =>
        prev.map((user) =>
          user.uuid === uuid
            ? { ...user, ...restoredUser, is_deleted: false }
            : user,
        ),
      );

      return restoredUser;
    } catch (err: any) {
      console.error("❌ Error restoring user:", err);
      setError(
        err.message || "Erreur lors de la restauration de l'utilisateur",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  const refresh = useCallback(() => {
    // Recharge les données avec les paramètres actuels
    fetchUsers({
      page: pagination.page,
      limit: pagination.limit,
    });
  }, [fetchUsers, pagination.page, pagination.limit]);

  return {
    users,
    loading,
    error,
    pagination,

    // Fonctions de récupération
    fetchUsers,
    fetchBlockedUsers,
    fetchDeletedUsers,

    // Fonctions de modification
    updateUser,
    deleteUser,
    blockUser,
    unblockUser,
    restoreUser,

    // Fonctions de pagination
    setPage,
    setLimit,
    refresh,

    // Utilitaires
    clearError: () => setError(null),
    hasUsers: users.length > 0,
    isEmpty: users.length === 0 && !loading,
  };
};

export default useUsers;
