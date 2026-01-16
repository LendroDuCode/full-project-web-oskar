// hooks/useStatusMatrimoniale.ts
import { useState, useEffect, useCallback } from "react";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { api } from "@/lib/api-client";
import type { ApiResponse } from "@/types/common";

export interface StatutMatrimonial {
  uuid: string;
  code: string;
  nom: string;
  description?: string;
  ordre: number;
  est_actif: boolean;
  date_creation: string;
  date_modification: string;
  created_by: string;
  updated_by?: string;
}

export interface StatutMatrimonialCreateData {
  code: string;
  nom: string;
  description?: string;
  ordre?: number;
  est_actif?: boolean;
}

export interface StatutMatrimonialUpdateData {
  nom?: string;
  description?: string;
  ordre?: number;
  est_actif?: boolean;
}

export interface UseStatusMatrimonialeOptions {
  autoFetch?: boolean;
  onlyActive?: boolean;
  includeInactive?: boolean;
  searchTerm?: string;
  sortBy?: "nom" | "code" | "ordre" | "date_creation";
  sortOrder?: "asc" | "desc";
}

export const useStatusMatrimoniale = (
  options: UseStatusMatrimonialeOptions = {},
) => {
  const {
    autoFetch = true,
    onlyActive = false,
    includeInactive = false,
    searchTerm = "",
    sortBy = "ordre",
    sortOrder = "asc",
  } = options;

  // État
  const [statuts, setStatuts] = useState<StatutMatrimonial[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [selectedStatut, setSelectedStatut] =
    useState<StatutMatrimonial | null>(null);
  const [total, setTotal] = useState<number>(0);

  // Récupérer la liste des statuts matrimoniaux
  const fetchStatuts = useCallback(async () => {
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

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      params.append("sort_by", sortBy);
      params.append("sort_order", sortOrder);

      const endpoint = `${API_ENDPOINTS.STATUTS_MATRIMONIAUX.LIST}?${params.toString()}`;
      const response =
        await api.get<ApiResponse<StatutMatrimonial[]>>(endpoint);

      if (response.status === "success") {
        setStatuts(response.data);
        setTotal(response.metadata?.total || response.data.length);
      } else {
        throw new Error(
          response.message ||
            "Erreur lors de la récupération des statuts matrimoniaux",
        );
      }
    } catch (err: any) {
      setError(err);
      console.error("Erreur fetchStatuts:", err);
    } finally {
      setLoading(false);
    }
  }, [onlyActive, includeInactive, searchTerm, sortBy, sortOrder]);

  // Récupérer un statut spécifique
  const fetchStatut = useCallback(async (uuid: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<ApiResponse<StatutMatrimonial>>(
        API_ENDPOINTS.STATUTS_MATRIMONIAUX.DETAIL(uuid),
      );

      if (response.status === "success") {
        setSelectedStatut(response.data);
        return response.data;
      } else {
        throw new Error(
          response.message ||
            "Erreur lors de la récupération du statut matrimonial",
        );
      }
    } catch (err: any) {
      setError(err);
      console.error("Erreur fetchStatut:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Créer un nouveau statut
  const createStatut = useCallback(
    async (data: StatutMatrimonialCreateData) => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.post<ApiResponse<StatutMatrimonial>>(
          API_ENDPOINTS.STATUTS_MATRIMONIAUX.CREATE,
          data,
        );

        if (response.status === "success") {
          setStatuts((prev) => [response.data, ...prev]);
          return response.data;
        } else {
          throw new Error(
            response.message ||
              "Erreur lors de la création du statut matrimonial",
          );
        }
      } catch (err: any) {
        setError(err);
        console.error("Erreur createStatut:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Mettre à jour un statut
  const updateStatut = useCallback(
    async (uuid: string, data: StatutMatrimonialUpdateData) => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.put<ApiResponse<StatutMatrimonial>>(
          API_ENDPOINTS.STATUTS_MATRIMONIAUX.UPDATE(uuid),
          data,
        );

        if (response.status === "success") {
          setStatuts((prev) =>
            prev.map((statut) =>
              statut.uuid === uuid ? response.data : statut,
            ),
          );

          if (selectedStatut?.uuid === uuid) {
            setSelectedStatut(response.data);
          }

          return response.data;
        } else {
          throw new Error(
            response.message ||
              "Erreur lors de la mise à jour du statut matrimonial",
          );
        }
      } catch (err: any) {
        setError(err);
        console.error("Erreur updateStatut:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedStatut],
  );

  // Supprimer un statut
  const deleteStatut = useCallback(
    async (uuid: string) => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.delete<ApiResponse<void>>(
          API_ENDPOINTS.STATUTS_MATRIMONIAUX.DELETE(uuid),
        );

        if (response.status === "success") {
          setStatuts((prev) => prev.filter((statut) => statut.uuid !== uuid));

          if (selectedStatut?.uuid === uuid) {
            setSelectedStatut(null);
          }
        } else {
          throw new Error(
            response.message ||
              "Erreur lors de la suppression du statut matrimonial",
          );
        }
      } catch (err: any) {
        setError(err);
        console.error("Erreur deleteStatut:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedStatut],
  );

  // Activer/désactiver un statut
  const toggleStatutStatus = useCallback(
    async (uuid: string, actif: boolean) => {
      try {
        return await updateStatut(uuid, { est_actif: actif });
      } catch (err) {
        throw err;
      }
    },
    [updateStatut],
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
          `${API_ENDPOINTS.STATUTS_MATRIMONIAUX.LIST}/check-code?${params.toString()}`,
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

  // Récupérer les statuts actifs seulement
  const fetchActiveStatuts = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get<ApiResponse<StatutMatrimonial[]>>(
        API_ENDPOINTS.STATUTS_MATRIMONIAUX.ACTIFS,
      );

      if (response.status === "success") {
        setStatuts(response.data);
        setTotal(response.metadata?.total || response.data.length);
      }
    } catch (err: any) {
      setError(err);
      console.error("Erreur fetchActiveStatuts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Réinitialiser la sélection
  const resetSelection = useCallback(() => {
    setSelectedStatut(null);
  }, []);

  // Exporter en PDF
  const exportToPDF = useCallback(async (): Promise<Blob> => {
    try {
      setLoading(true);

      const response = await api.get(
        API_ENDPOINTS.STATUTS_MATRIMONIAUX.EXPORT_PDF,
        {
          responseType: "blob",
        },
      );

      return response.data;
    } catch (err: any) {
      setError(err);
      console.error("Erreur exportToPDF:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Effet pour le chargement initial
  useEffect(() => {
    if (autoFetch) {
      fetchStatuts();
    }
  }, [autoFetch, fetchStatuts]);

  // Effet pour recharger quand les options changent
  useEffect(() => {
    if (autoFetch) {
      fetchStatuts();
    }
  }, [autoFetch, fetchStatuts]);

  return {
    // État
    statuts,
    loading,
    error,
    selectedStatut,
    total,

    // Actions
    fetchStatuts,
    fetchStatut,
    createStatut,
    updateStatut,
    deleteStatut,
    toggleStatutStatus,
    checkCodeAvailability,
    fetchActiveStatuts,
    resetSelection,
    exportToPDF,

    // Sélection
    setSelectedStatut,

    // Utilitaires
    statutsActifs: statuts.filter((s) => s.est_actif),
    statutsInactifs: statuts.filter((s) => !s.est_actif),

    // Gestion d'état
    setLoading,
    setError,
  };
};
