// hooks/useCivilites.ts - Version simplifiée
import { useState, useCallback } from "react";
import { civiliteService } from "@/services/civilites/civilite.service";
import type {
  Civilite,
  CiviliteFormOptions,
} from "@/services/civilites/civilite.types";

interface UseCivilitesReturn {
  // États
  civilites: Civilite[];
  loading: boolean;
  error: string | null;
  success: string | null;

  // Opérations principales
  fetchCivilites: () => Promise<void>;
  getCiviliteOptionsForSelect: (
    options?: CiviliteFormOptions,
  ) => Promise<Array<{ value: string; label: string; data: Civilite }>>;

  // Utilitaires
  clearError: () => void;
  clearSuccess: () => void;

  // États dérivés
  hasCivilites: boolean;
  isEmpty: boolean;
}

export const useCivilites = (): UseCivilitesReturn => {
  // États
  const [civilites, setCivilites] = useState<Civilite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Gestion des messages
  const clearError = useCallback(() => setError(null), []);
  const clearSuccess = useCallback(() => setSuccess(null), []);

  const fetchCivilites = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log("🔄 Fetching civilites...");
      const { civilites: fetchedCivilites } =
        await civiliteService.getCivilites();

      console.log("✅ Civilites fetched:", fetchedCivilites.length);
      setCivilites(fetchedCivilites);

      if (fetchedCivilites.length === 0) {
        setError("Aucune civilité trouvée");
      } else {
        setSuccess(`${fetchedCivilites.length} civilités chargées avec succès`);
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Erreur lors du chargement des civilités";
      setError(message);
      console.error("❌ Error fetching civilites:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getCiviliteOptionsForSelect = useCallback(
    async (options?: CiviliteFormOptions) => {
      try {
        return await civiliteService.getCiviliteOptionsForSelect(options);
      } catch (err: any) {
        console.error("❌ Error getting civilite options:", err);
        return [];
      }
    },
    [],
  );

  return {
    // États
    civilites,
    loading,
    error,
    success,

    // Opérations
    fetchCivilites,
    getCiviliteOptionsForSelect,

    // Utilitaires
    clearError,
    clearSuccess,

    // États dérivés
    hasCivilites: civilites.length > 0,
    isEmpty: civilites.length === 0 && !loading,
  };
};

export default useCivilites;
