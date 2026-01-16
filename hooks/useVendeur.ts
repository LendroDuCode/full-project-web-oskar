// hooks/useVendeurs.ts
import { useState, useCallback, useMemo } from "react";
import { vendeurService } from "@/services/vendeurs/vendeur.service";
import type {
  Vendeur,
  PaginationParams,
} from "@/services/vendeurs/vendeur.types";

export type VendeursType = "all" | "blocked" | "deleted";

interface UseVendeursReturn {
  // États
  vendeurs: Vendeur[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  currentType: VendeursType;

  // Données dérivées
  activeVendeurs: Vendeur[];
  blockedVendeurs: Vendeur[];
  deletedVendeurs: Vendeur[];

  // Fonctions de récupération
  fetchVendeurs: (params?: PaginationParams) => Promise<void>;
  fetchBlockedVendeurs: (params?: PaginationParams) => Promise<void>;
  fetchDeletedVendeurs: (params?: PaginationParams) => Promise<void>;

  // Fonctions CRUD
  createVendeur: (vendeurData: Partial<Vendeur>) => Promise<Vendeur>;
  getVendeur: (uuid: string) => Promise<Vendeur>;
  updateVendeur: (
    uuid: string,
    vendeurData: Partial<Vendeur>,
  ) => Promise<Vendeur>;
  deleteVendeur: (uuid: string) => Promise<void>;
  blockVendeur: (uuid: string) => Promise<Vendeur>;
  unblockVendeur: (uuid: string) => Promise<Vendeur>;
  restoreVendeur: (uuid: string) => Promise<Vendeur>;

  // Fonctions utilitaires
  refresh: () => Promise<void>;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setCurrentType: (type: VendeursType) => void;
  clearError: () => void;

  // Propriétés utilitaires
  hasVendeurs: boolean;
  isEmpty: boolean;
  currentCount: number;
}

export const useVendeurs = (
  initialType: VendeursType = "all",
): UseVendeursReturn => {
  const [vendeurs, setVendeurs] = useState<Vendeur[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [currentType, setCurrentType] = useState<VendeursType>(initialType);

  // Helper pour mettre à jour la pagination
  const updatePagination = useCallback(
    (dataLength: number, totalCount: number, params?: PaginationParams) => {
      const currentPage = params?.page || pagination.page;
      const currentLimit = params?.limit || pagination.limit;

      setPagination((prev) => ({
        ...prev,
        page: currentPage,
        limit: currentLimit,
        total: totalCount,
        pages: Math.ceil(totalCount / currentLimit) || 1,
      }));
    },
    [pagination.page, pagination.limit],
  );

  // Helper pour gérer les réponses API
  const handleApiResponse = useCallback(
    (response: any): { data: Vendeur[]; total: number } => {
      let vendeursData: Vendeur[] = [];
      let totalCount = 0;

      if (Array.isArray(response.vendeurs)) {
        vendeursData = response.vendeurs;
        totalCount = response.count || response.vendeurs.length;
      } else if (Array.isArray(response)) {
        vendeursData = response;
        totalCount = response.length;
      } else if (response && typeof response === "object") {
        if ("vendeurs" in response && Array.isArray(response.vendeurs)) {
          vendeursData = response.vendeurs;
          totalCount = response.count || response.vendeurs.length;
        } else if ("data" in response && Array.isArray(response.data)) {
          vendeursData = response.data;
          totalCount = response.count || response.data.length;
        }
      }

      return { data: vendeursData, total: totalCount };
    },
    [],
  );

  // Fonction pour charger les vendeurs normaux (actifs)
  const fetchVendeurs = useCallback(
    async (params?: PaginationParams) => {
      setLoading(true);
      setError(null);

      try {
        console.log("🔄 Fetching vendeurs with params:", params);
        const response = await vendeurService.getVendeurs(params || {});
        console.log("📦 Vendeurs response:", response);

        const { data: vendeursData, total: totalCount } =
          handleApiResponse(response);

        setVendeurs(vendeursData);
        updatePagination(vendeursData.length, totalCount, params);
        setCurrentType("all");

        console.log("✅ Vendeurs loaded:", {
          count: vendeursData.length,
          total: totalCount,
          page: params?.page || pagination.page,
        });
      } catch (err: any) {
        console.error("❌ Error fetching vendeurs:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Erreur lors du chargement des vendeurs",
        );
        setVendeurs([]);
      } finally {
        setLoading(false);
      }
    },
    [handleApiResponse, updatePagination, pagination.page],
  );

  // Fonction pour charger les vendeurs bloqués
  const fetchBlockedVendeurs = useCallback(
    async (params?: PaginationParams) => {
      setLoading(true);
      setError(null);

      try {
        console.log("🔄 Fetching blocked vendeurs...");
        const response = await vendeurService.getVendeursBloques(params || {});
        console.log("📦 Blocked vendeurs response:", response);

        const { data: vendeursData, total: totalCount } =
          handleApiResponse(response);

        setVendeurs(vendeursData);
        updatePagination(vendeursData.length, totalCount, params);
        setCurrentType("blocked");

        console.log("✅ Blocked vendeurs loaded:", {
          count: vendeursData.length,
          total: totalCount,
        });
      } catch (err: any) {
        console.error("❌ Error fetching blocked vendeurs:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Erreur lors du chargement des vendeurs bloqués",
        );
        setVendeurs([]);
      } finally {
        setLoading(false);
      }
    },
    [handleApiResponse, updatePagination],
  );

  // Fonction pour charger les vendeurs supprimés
  const fetchDeletedVendeurs = useCallback(
    async (params?: PaginationParams) => {
      setLoading(true);
      setError(null);

      try {
        console.log("🔄 Fetching deleted vendeurs...");
        const response = await vendeurService.getVendeursSupprimes(
          params || {},
        );
        console.log("📦 Deleted vendeurs response:", response);

        const { data: vendeursData, total: totalCount } =
          handleApiResponse(response);

        setVendeurs(vendeursData);
        updatePagination(vendeursData.length, totalCount, params);
        setCurrentType("deleted");

        console.log("✅ Deleted vendeurs loaded:", {
          count: vendeursData.length,
          total: totalCount,
        });
      } catch (err: any) {
        console.error("❌ Error fetching deleted vendeurs:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Erreur lors du chargement des vendeurs supprimés",
        );
        setVendeurs([]);
      } finally {
        setLoading(false);
      }
    },
    [handleApiResponse, updatePagination],
  );

  // Fonction pour créer un vendeur
  const createVendeur = useCallback(
    async (vendeurData: Partial<Vendeur>): Promise<Vendeur> => {
      setLoading(true);
      setError(null);

      try {
        console.log("🔄 Creating vendeur...");
        const newVendeur = await vendeurService.createVendeur(vendeurData);

        // Ajouter le nouveau vendeur à la liste
        setVendeurs((prev) => [newVendeur, ...prev]);

        // Mettre à jour la pagination
        setPagination((prev) => ({
          ...prev,
          total: prev.total + 1,
          pages: Math.ceil((prev.total + 1) / prev.limit),
        }));

        console.log("✅ Vendeur created:", newVendeur);
        return newVendeur;
      } catch (err: any) {
        console.error("❌ Error creating vendeur:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Erreur lors de la création du vendeur",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Fonction pour récupérer un vendeur spécifique
  const getVendeur = useCallback(async (uuid: string): Promise<Vendeur> => {
    setLoading(true);
    setError(null);

    try {
      console.log("🔍 Fetching vendeur:", uuid);
      const vendeur = await vendeurService.getVendeur(uuid);
      console.log("✅ Vendeur fetched:", vendeur);
      return vendeur;
    } catch (err: any) {
      console.error("❌ Error fetching vendeur:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors de la récupération du vendeur",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour mettre à jour un vendeur
  const updateVendeur = useCallback(
    async (uuid: string, vendeurData: Partial<Vendeur>): Promise<Vendeur> => {
      setLoading(true);
      setError(null);

      try {
        console.log("🔄 Updating vendeur:", uuid);
        const updatedVendeur = await vendeurService.updateVendeur(
          uuid,
          vendeurData,
        );

        // Mettre à jour le vendeur dans la liste
        setVendeurs((prev) =>
          prev.map((v) => (v.uuid === uuid ? { ...v, ...updatedVendeur } : v)),
        );

        console.log("✅ Vendeur updated:", updatedVendeur);
        return updatedVendeur;
      } catch (err: any) {
        console.error("❌ Error updating vendeur:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Erreur lors de la mise à jour du vendeur",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Fonction pour supprimer un vendeur
  const deleteVendeur = useCallback(async (uuid: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      console.log("🗑️ Deleting vendeur:", uuid);
      await vendeurService.deleteVendeur(uuid);

      // Retirer le vendeur de la liste
      setVendeurs((prev) => prev.filter((v) => v.uuid !== uuid));

      // Mettre à jour la pagination
      setPagination((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
        pages: Math.ceil(Math.max(0, prev.total - 1) / prev.limit) || 1,
      }));

      console.log("✅ Vendeur deleted");
    } catch (err: any) {
      console.error("❌ Error deleting vendeur:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors de la suppression du vendeur",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour bloquer un vendeur
  const blockVendeur = useCallback(async (uuid: string): Promise<Vendeur> => {
    setLoading(true);
    setError(null);

    try {
      console.log("🚫 Blocking vendeur:", uuid);
      const blockedVendeur = await vendeurService.blockVendeur(uuid);

      // Mettre à jour le vendeur dans la liste
      setVendeurs((prev) =>
        prev.map((v) =>
          v.uuid === uuid ? { ...v, ...blockedVendeur, est_bloque: true } : v,
        ),
      );

      console.log("✅ Vendeur blocked:", blockedVendeur);
      return blockedVendeur;
    } catch (err: any) {
      console.error("❌ Error blocking vendeur:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors du blocage du vendeur",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour débloquer un vendeur
  const unblockVendeur = useCallback(async (uuid: string): Promise<Vendeur> => {
    setLoading(true);
    setError(null);

    try {
      console.log("✅ Unblocking vendeur:", uuid);
      const unblockedVendeur = await vendeurService.unblockVendeur(uuid);

      // Mettre à jour le vendeur dans la liste
      setVendeurs((prev) =>
        prev.map((v) =>
          v.uuid === uuid
            ? { ...v, ...unblockedVendeur, est_bloque: false }
            : v,
        ),
      );

      console.log("✅ Vendeur unblocked:", unblockedVendeur);
      return unblockedVendeur;
    } catch (err: any) {
      console.error("❌ Error unblocking vendeur:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors du déblocage du vendeur",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour restaurer un vendeur
  const restoreVendeur = useCallback(async (uuid: string): Promise<Vendeur> => {
    setLoading(true);
    setError(null);

    try {
      console.log("↩️ Restoring vendeur:", uuid);
      const restoredVendeur = await vendeurService.restoreVendeur(uuid);

      // Mettre à jour le vendeur dans la liste
      setVendeurs((prev) =>
        prev.map((v) =>
          v.uuid === uuid ? { ...v, ...restoredVendeur, is_deleted: false } : v,
        ),
      );

      console.log("✅ Vendeur restored:", restoredVendeur);
      return restoredVendeur;
    } catch (err: any) {
      console.error("❌ Error restoring vendeur:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors de la restauration du vendeur",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction de rafraîchissement adaptative
  const refresh = useCallback(async () => {
    const params = { page: pagination.page, limit: pagination.limit };

    switch (currentType) {
      case "blocked":
        await fetchBlockedVendeurs(params);
        break;
      case "deleted":
        await fetchDeletedVendeurs(params);
        break;
      default:
        await fetchVendeurs(params);
    }
  }, [
    currentType,
    fetchVendeurs,
    fetchBlockedVendeurs,
    fetchDeletedVendeurs,
    pagination.page,
    pagination.limit,
  ]);

  // Fonctions de pagination
  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  // Données dérivées avec useMemo
  const activeVendeurs = useMemo(
    () => vendeurs.filter((v) => !v.is_deleted && !v.est_bloque),
    [vendeurs],
  );

  const blockedVendeurs = useMemo(
    () => vendeurs.filter((v) => v.est_bloque && !v.is_deleted),
    [vendeurs],
  );

  const deletedVendeurs = useMemo(
    () => vendeurs.filter((v) => v.is_deleted),
    [vendeurs],
  );

  // Propriétés utilitaires
  const hasVendeurs = vendeurs.length > 0;
  const isEmpty = vendeurs.length === 0 && !loading;
  const currentCount = vendeurs.length;

  return {
    // États
    vendeurs,
    loading,
    error,
    pagination,
    currentType,

    // Données dérivées
    activeVendeurs,
    blockedVendeurs,
    deletedVendeurs,

    // Fonctions de récupération
    fetchVendeurs,
    fetchBlockedVendeurs,
    fetchDeletedVendeurs,

    // Fonctions CRUD
    createVendeur,
    getVendeur,
    updateVendeur,
    deleteVendeur,
    blockVendeur,
    unblockVendeur,
    restoreVendeur,

    // Fonctions utilitaires
    refresh,
    setPage,
    setLimit,
    setCurrentType,
    clearError: () => setError(null),

    // Propriétés utilitaires
    hasVendeurs,
    isEmpty,
    currentCount,
  };
};

// Version avec options initiales
export const useVendeursWithOptions = (
  options: {
    initialType?: VendeursType;
    initialPage?: number;
    initialLimit?: number;
  } = {},
) => {
  const { initialType = "all", initialPage = 1, initialLimit = 10 } = options;

  const [vendeurs, setVendeurs] = useState<Vendeur[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    pages: 1,
  });
  const [currentType, setCurrentType] = useState<VendeursType>(initialType);

  // Toutes les autres fonctions restent les mêmes...

  // Fonction de chargement initial
  const initialize = useCallback(async () => {
    switch (initialType) {
      case "blocked":
        await fetchBlockedVendeurs({ page: initialPage, limit: initialLimit });
        break;
      case "deleted":
        await fetchDeletedVendeurs({ page: initialPage, limit: initialLimit });
        break;
      default:
        await fetchVendeurs({ page: initialPage, limit: initialLimit });
    }
  }, [initialType, initialPage, initialLimit]);

  return {
    ...useVendeurs(initialType), // On utilise le hook principal
    initialize, // Fonction d'initialisation supplémentaire
  };
};

export default useVendeurs;
