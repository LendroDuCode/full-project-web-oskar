// hooks/useVilles.ts
import { useState, useCallback } from "react";
import { villesService } from "@/services/villes/villes.service";
import type {
  Ville,
  VilleCreateData,
  VilleUpdateData,
  RechercheVilleResultat,
  VilleStats,
  Region,
  Departement,
  VilleAutocomplete,
  VilleMeteo,
  Quartier,
  CodePostal,
  ZoneGeographique,
  ExportVillesOptions,
  ImportVillesData,
} from "@/services/villes/villes.types";

export interface UseVillesReturn {
  // États
  villes: Ville[];
  currentVille: Ville | null;
  loading: boolean;
  error: string | null;
  stats: VilleStats | null;
  regions: Region[];
  departements: Departement[];
  autocompleteResults: VilleAutocomplete[];
  meteo: VilleMeteo | null;
  quartiers: Quartier[];
  codesPostaux: CodePostal[];
  zonesGeographiques: ZoneGeographique[];

  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };

  // Fonctions CRUD
  fetchVilles: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    pays_uuid?: string;
    region_uuid?: string;
    departement_uuid?: string;
    actif?: boolean;
    capitale?: boolean;
  }) => Promise<void>;

  getVille: (uuid: string) => Promise<Ville>;
  createVille: (villeData: VilleCreateData) => Promise<Ville>;
  updateVille: (uuid: string, villeData: VilleUpdateData) => Promise<Ville>;
  deleteVille: (uuid: string) => Promise<{ message: string }>;

  // Fonctions spécialisées
  getVillesByPays: (paysUuid: string) => Promise<Ville[]>;
  getVillesByCodePostal: (codePostal: string) => Promise<Ville[]>;
  searchVillesGeographique: (params: {
    latitude: number;
    longitude: number;
    rayon_km: number;
    limit?: number;
  }) => Promise<Ville[]>;

  autocompleteVilles: (
    query: string,
    limit?: number,
  ) => Promise<VilleAutocomplete[]>;

  // Fonctions métier
  activateVille: (uuid: string) => Promise<Ville>;
  deactivateVille: (uuid: string) => Promise<Ville>;
  getCapitales: () => Promise<Ville[]>;
  getMetropoles: (limit?: number) => Promise<Ville[]>;

  // Fonctions utilitaires
  getVillesStats: () => Promise<VilleStats>;
  getRegions: (paysUuid?: string) => Promise<Region[]>;
  getDepartements: (regionUuid?: string) => Promise<Departement[]>;
  getMeteoVille: (villeUuid: string) => Promise<VilleMeteo>;
  getQuartiersVille: (villeUuid: string) => Promise<Quartier[]>;
  getCodesPostauxVille: (villeUuid: string) => Promise<CodePostal[]>;
  getZonesGeographiques: (type?: string) => Promise<ZoneGeographique[]>;

  // Import/Export
  exportVilles: (options: ExportVillesOptions) => Promise<Blob>;
  importVilles: (importData: ImportVillesData) => Promise<{
    success: boolean;
    imported: number;
    errors: any[];
  }>;

  // Pagination
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;

  // Utilitaires
  refresh: () => Promise<void>;
  clearError: () => void;
  setCurrentVille: (ville: Ville | null) => void;
}

export const useVilles = (): UseVillesReturn => {
  const [villes, setVilles] = useState<Ville[]>([]);
  const [currentVille, setCurrentVille] = useState<Ville | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<VilleStats | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [autocompleteResults, setAutocompleteResults] = useState<
    VilleAutocomplete[]
  >([]);
  const [meteo, setMeteo] = useState<VilleMeteo | null>(null);
  const [quartiers, setQuartiers] = useState<Quartier[]>([]);
  const [codesPostaux, setCodesPostaux] = useState<CodePostal[]>([]);
  const [zonesGeographiques, setZonesGeographiques] = useState<
    ZoneGeographique[]
  >([]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // Fonction pour gérer les erreurs
  const handleError = useCallback((err: any, customMessage?: string) => {
    console.error("❌ Error:", err);

    let errorMessage = customMessage || "Une erreur est survenue";

    if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    } else if (err.message) {
      errorMessage = err.message;
    }

    if (err.response?.status === 400) {
      errorMessage = "Données invalides";
    } else if (err.response?.status === 404) {
      errorMessage = "Ressource non trouvée";
    } else if (err.response?.status === 409) {
      errorMessage = "Un conflit est survenu";
    } else if (err.response?.status === 500) {
      errorMessage = "Erreur serveur";
    }

    setError(errorMessage);
    return errorMessage;
  }, []);

  // ==================== CRUD ====================

  const fetchVilles = useCallback(
    async (params?: any) => {
      setLoading(true);
      setError(null);

      try {
        const result = await villesService.getVilles({
          page: params?.page || pagination.page,
          limit: params?.limit || pagination.limit,
          search: params?.search,
          pays_uuid: params?.pays_uuid,
          region_uuid: params?.region_uuid,
          departement_uuid: params?.departement_uuid,
          actif: params?.actif,
          capitale: params?.capitale,
          sort_by: params?.sort_by,
          sort_order: params?.sort_order,
        });

        console.log("📦 Villes result:", {
          count: result.villes.length,
          total: result.total,
          page: result.page,
          pages: result.pages,
        });

        setVilles(result.villes);
        setPagination({
          page: result.page || 1,
          limit: params?.limit || pagination.limit,
          total: result.total,
          pages: result.pages || 1,
        });
      } catch (err: any) {
        handleError(err, "Erreur lors du chargement des villes");
        setVilles([]);
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.limit, handleError],
  );

  const getVille = useCallback(
    async (uuid: string): Promise<Ville> => {
      setLoading(true);
      setError(null);

      try {
        const ville = await villesService.getVille(uuid);
        setCurrentVille(ville);
        return ville;
      } catch (err: any) {
        handleError(err, "Erreur lors de la récupération de la ville");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [handleError],
  );

  const createVille = useCallback(
    async (villeData: VilleCreateData): Promise<Ville> => {
      setLoading(true);
      setError(null);

      try {
        const newVille = await villesService.createVille(villeData);

        // Rafraîchir la liste
        await fetchVilles({
          page: pagination.page,
          limit: pagination.limit,
        });

        return newVille;
      } catch (err: any) {
        handleError(err, "Erreur lors de la création de la ville");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchVilles, pagination.page, pagination.limit, handleError],
  );

  const updateVille = useCallback(
    async (uuid: string, villeData: VilleUpdateData): Promise<Ville> => {
      setLoading(true);
      setError(null);

      try {
        const updatedVille = await villesService.updateVille(uuid, villeData);

        // Mettre à jour la ville courante
        if (currentVille?.uuid === uuid) {
          setCurrentVille(updatedVille);
        }

        // Mettre à jour dans la liste
        setVilles((prev) =>
          prev.map((ville) =>
            ville.uuid === uuid ? { ...ville, ...updatedVille } : ville,
          ),
        );

        return updatedVille;
      } catch (err: any) {
        handleError(err, "Erreur lors de la mise à jour de la ville");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentVille, handleError],
  );

  const deleteVille = useCallback(
    async (uuid: string): Promise<{ message: string }> => {
      setLoading(true);
      setError(null);

      try {
        const result = await villesService.deleteVille(uuid);

        // Retirer de la liste
        setVilles((prev) => prev.filter((ville) => ville.uuid !== uuid));

        // Retirer la ville courante si c'est la même
        if (currentVille?.uuid === uuid) {
          setCurrentVille(null);
        }

        // Mettre à jour la pagination
        setPagination((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
          pages: Math.max(1, Math.ceil((prev.total - 1) / prev.limit)),
        }));

        return result;
      } catch (err: any) {
        handleError(err, "Erreur lors de la suppression de la ville");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentVille, handleError],
  );

  // ==================== FONCTIONS SPÉCIALISÉES ====================

  const getVillesByPays = useCallback(
    async (paysUuid: string): Promise<Ville[]> => {
      setLoading(true);
      setError(null);

      try {
        const villesList = await villesService.getVillesByPays(paysUuid);
        return villesList;
      } catch (err: any) {
        handleError(err, "Erreur lors de la récupération des villes par pays");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [handleError],
  );

  const getVillesByCodePostal = useCallback(
    async (codePostal: string): Promise<Ville[]> => {
      setLoading(true);
      setError(null);

      try {
        const villesList =
          await villesService.getVillesByCodePostal(codePostal);
        return villesList;
      } catch (err: any) {
        handleError(
          err,
          "Erreur lors de la récupération des villes par code postal",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [handleError],
  );

  const searchVillesGeographique = useCallback(
    async (params: {
      latitude: number;
      longitude: number;
      rayon_km: number;
      limit?: number;
    }): Promise<Ville[]> => {
      setLoading(true);
      setError(null);

      try {
        const villesList = await villesService.searchVillesGeographique(params);
        return villesList;
      } catch (err: any) {
        handleError(err, "Erreur lors de la recherche géographique");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [handleError],
  );

  const autocompleteVilles = useCallback(
    async (query: string, limit: number = 10): Promise<VilleAutocomplete[]> => {
      setLoading(true);
      setError(null);

      try {
        const results = await villesService.autocompleteVilles(query, limit);
        setAutocompleteResults(results);
        return results;
      } catch (err: any) {
        handleError(err, "Erreur lors de l'autocomplétion");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [handleError],
  );

  // ==================== FONCTIONS MÉTIER ====================

  const activateVille = useCallback(
    async (uuid: string): Promise<Ville> => {
      setLoading(true);
      setError(null);

      try {
        const activatedVille = await villesService.activateVille(uuid);

        // Mettre à jour dans la liste
        setVilles((prev) =>
          prev.map((ville) =>
            ville.uuid === uuid ? { ...ville, ...activatedVille } : ville,
          ),
        );

        return activatedVille;
      } catch (err: any) {
        handleError(err, "Erreur lors de l'activation de la ville");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [handleError],
  );

  const deactivateVille = useCallback(
    async (uuid: string): Promise<Ville> => {
      setLoading(true);
      setError(null);

      try {
        const deactivatedVille = await villesService.deactivateVille(uuid);

        // Mettre à jour dans la liste
        setVilles((prev) =>
          prev.map((ville) =>
            ville.uuid === uuid ? { ...ville, ...deactivatedVille } : ville,
          ),
        );

        return deactivatedVille;
      } catch (err: any) {
        handleError(err, "Erreur lors de la désactivation de la ville");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [handleError],
  );

  const getCapitales = useCallback(async (): Promise<Ville[]> => {
    setLoading(true);
    setError(null);

    try {
      const capitales = await villesService.getCapitales();
      return capitales;
    } catch (err: any) {
      handleError(err, "Erreur lors de la récupération des capitales");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const getMetropoles = useCallback(
    async (limit: number = 50): Promise<Ville[]> => {
      setLoading(true);
      setError(null);

      try {
        const metropoles = await villesService.getMetropoles(limit);
        return metropoles;
      } catch (err: any) {
        handleError(err, "Erreur lors de la récupération des métropoles");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [handleError],
  );

  // ==================== FONCTIONS UTILITAIRES ====================

  const getVillesStats = useCallback(async (): Promise<VilleStats> => {
    setLoading(true);
    setError(null);

    try {
      const villesStats = await villesService.getVillesStats();
      setStats(villesStats);
      return villesStats;
    } catch (err: any) {
      handleError(err, "Erreur lors de la récupération des statistiques");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const getRegions = useCallback(
    async (paysUuid?: string): Promise<Region[]> => {
      setLoading(true);
      setError(null);

      try {
        const regionsList = await villesService.getRegions(paysUuid);
        setRegions(regionsList);
        return regionsList;
      } catch (err: any) {
        handleError(err, "Erreur lors de la récupération des régions");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [handleError],
  );

  const getDepartements = useCallback(
    async (regionUuid?: string): Promise<Departement[]> => {
      setLoading(true);
      setError(null);

      try {
        const departementsList =
          await villesService.getDepartements(regionUuid);
        setDepartements(departementsList);
        return departementsList;
      } catch (err: any) {
        handleError(err, "Erreur lors de la récupération des départements");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [handleError],
  );

  const getMeteoVille = useCallback(
    async (villeUuid: string): Promise<VilleMeteo> => {
      setLoading(true);
      setError(null);

      try {
        const villeMeteo = await villesService.getMeteoVille(villeUuid);
        setMeteo(villeMeteo);
        return villeMeteo;
      } catch (err: any) {
        handleError(err, "Erreur lors de la récupération de la météo");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [handleError],
  );

  const getQuartiersVille = useCallback(
    async (villeUuid: string): Promise<Quartier[]> => {
      setLoading(true);
      setError(null);

      try {
        const quartiersList = await villesService.getQuartiersVille(villeUuid);
        setQuartiers(quartiersList);
        return quartiersList;
      } catch (err: any) {
        handleError(err, "Erreur lors de la récupération des quartiers");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [handleError],
  );

  const getCodesPostauxVille = useCallback(
    async (villeUuid: string): Promise<CodePostal[]> => {
      setLoading(true);
      setError(null);

      try {
        const codesList = await villesService.getCodesPostauxVille(villeUuid);
        setCodesPostaux(codesList);
        return codesList;
      } catch (err: any) {
        handleError(err, "Erreur lors de la récupération des codes postaux");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [handleError],
  );

  const getZonesGeographiques = useCallback(
    async (type?: string): Promise<ZoneGeographique[]> => {
      setLoading(true);
      setError(null);

      try {
        const zonesList = await villesService.getZonesGeographiques(type);
        setZonesGeographiques(zonesList);
        return zonesList;
      } catch (err: any) {
        handleError(
          err,
          "Erreur lors de la récupération des zones géographiques",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [handleError],
  );

  // ==================== IMPORT/EXPORT ====================

  const exportVilles = useCallback(
    async (options: ExportVillesOptions): Promise<Blob> => {
      setLoading(true);
      setError(null);

      try {
        const blob = await villesService.exportVilles(options);
        return blob;
      } catch (err: any) {
        handleError(err, "Erreur lors de l'export");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [handleError],
  );

  const importVilles = useCallback(
    async (
      importData: ImportVillesData,
    ): Promise<{
      success: boolean;
      imported: number;
      errors: any[];
    }> => {
      setLoading(true);
      setError(null);

      try {
        const result = await villesService.importVilles(importData);

        // Rafraîchir après import
        if (result.success) {
          await fetchVilles({
            page: 1,
            limit: pagination.limit,
          });
        }

        return result;
      } catch (err: any) {
        handleError(err, "Erreur lors de l'import");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchVilles, pagination.limit, handleError],
  );

  // ==================== PAGINATION ====================

  const setPage = useCallback(
    (page: number) => {
      setPagination((prev) => ({ ...prev, page }));
      fetchVilles({ page, limit: prev.limit });
    },
    [fetchVilles],
  );

  const setLimit = useCallback(
    (limit: number) => {
      setPagination((prev) => ({ ...prev, limit, page: 1 }));
      fetchVilles({ page: 1, limit });
    },
    [fetchVilles],
  );

  // ==================== UTILITAIRES ====================

  const refresh = useCallback(async () => {
    await fetchVilles({
      page: pagination.page,
      limit: pagination.limit,
    });
  }, [fetchVilles, pagination.page, pagination.limit]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // États
    villes,
    currentVille,
    loading,
    error,
    stats,
    regions,
    departements,
    autocompleteResults,
    meteo,
    quartiers,
    codesPostaux,
    zonesGeographiques,

    // Pagination
    pagination,

    // Fonctions CRUD
    fetchVilles,
    getVille,
    createVille,
    updateVille,
    deleteVille,

    // Fonctions spécialisées
    getVillesByPays,
    getVillesByCodePostal,
    searchVillesGeographique,
    autocompleteVilles,

    // Fonctions métier
    activateVille,
    deactivateVille,
    getCapitales,
    getMetropoles,

    // Fonctions utilitaires
    getVillesStats,
    getRegions,
    getDepartements,
    getMeteoVille,
    getQuartiersVille,
    getCodesPostauxVille,
    getZonesGeographiques,

    // Import/Export
    exportVilles,
    importVilles,

    // Pagination
    setPage,
    setLimit,

    // Utilitaires
    refresh,
    clearError,
    setCurrentVille,
  };
};

export default useVilles;
