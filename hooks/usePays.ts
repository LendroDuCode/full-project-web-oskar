// hooks/usePays.ts (version simplifiée)
import { useState, useCallback } from "react";
import { paysService } from "@/services/pays/pays.service";
import type {
  Pays,
  PaysPaginationParams,
  PaysSearchResult,
} from "@/services/pays/pays.types";

export const usePays = () => {
  const [pays, setPays] = useState<Pays[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // Fonction pour charger les pays
  const fetchPays = useCallback(async (params?: PaysPaginationParams) => {
    setLoading(true);
    setError(null);

    try {
      console.log("🌍 Fetching pays with params:", params);

      const result = await paysService.getPays(params);

      console.log("📦 Pays result:", {
        paysCount: result.pays.length,
        total: result.total,
        page: result.page,
        pages: result.pages,
      });

      setPays(result.pays || []);

      setPagination({
        page: result.page || 1,
        limit: params?.limit || 10,
        total: result.total || 0,
        pages: result.pages || 1,
      });

      return result;
    } catch (error: any) {
      console.error("❌ Error fetching pays:", error);
      setError(error.message || "Erreur lors du chargement des pays");
      setPays([]);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour basculer le statut d'un pays (ajoutez-la au service si elle n'existe pas)
  const togglePaysStatus = useCallback(
    async (uuid: string): Promise<Pays> => {
      setLoading(true);
      setError(null);

      try {
        // Cette fonction doit exister dans votre service
        // Sinon, utilisez updatePays
        const currentPays = pays.find((p) => p.uuid === uuid);
        if (!currentPays) throw new Error("Pays non trouvé");

        const newStatut = currentPays.statut === "actif" ? "inactif" : "actif";
        const updatedPays = await paysService.updatePays(uuid, {
          statut: newStatut,
        });

        // Mettre à jour la liste
        setPays((prev) =>
          prev.map((p) => (p.uuid === uuid ? { ...p, ...updatedPays } : p)),
        );

        return updatedPays;
      } catch (error: any) {
        console.error("❌ Error toggling pays status:", error);
        setError(error.message || "Erreur lors du changement de statut");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [pays],
  );

  // Autres fonctions
  const setPage = useCallback(
    (page: number) => {
      setPagination((prev) => ({ ...prev, page }));
      fetchPays({ page, limit: prev.limit });
    },
    [fetchPays],
  );

  const setLimit = useCallback(
    (limit: number) => {
      setPagination((prev) => ({ ...prev, limit, page: 1 }));
      fetchPays({ page: 1, limit });
    },
    [fetchPays],
  );

  const refresh = useCallback(() => {
    fetchPays({
      page: pagination.page,
      limit: pagination.limit,
    });
  }, [fetchPays, pagination.page, pagination.limit]);

  return {
    pays,
    loading,
    error,
    pagination,
    fetchPays,
    togglePaysStatus,
    setPage,
    setLimit,
    refresh,
  };
};

export default usePays;
