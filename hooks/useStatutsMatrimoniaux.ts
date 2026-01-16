// hooks/useStatutsMatrimoniaux.ts
"use client";

import { statutsMatrimoniauxService } from "@/services/statut-matrimonials/statuts-matrimoniaux.service";
import {
  StatutMatrimonialCreateData,
  StatutMatrimonialType,
  StatutMatrimonialUpdateData,
} from "@/services/statut-matrimonials/statuts-matrimoniaux.types";
import { useState, useCallback } from "react";

interface UseStatutsMatrimoniauxReturn {
  statuts: StatutMatrimonialType[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  fetchStatuts: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    actif?: boolean;
    defaut?: boolean;
  }) => Promise<void>;
  createStatut: (
    data: StatutMatrimonialCreateData,
  ) => Promise<StatutMatrimonialType>;
  updateStatut: (
    uuid: string,
    data: StatutMatrimonialUpdateData,
  ) => Promise<StatutMatrimonialType>;
  deleteStatut: (uuid: string) => Promise<void>;
  toggleStatutStatus: (uuid: string) => Promise<void>;
  setStatutDefaut: (uuid: string) => Promise<StatutMatrimonialType>;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  refresh: () => void;
}

export function useStatutsMatrimoniaux(): UseStatutsMatrimoniauxReturn {
  const [statuts, setStatuts] = useState<StatutMatrimonialType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  const fetchStatuts = useCallback(
    async (params?: {
      page?: number;
      limit?: number;
      search?: string;
      actif?: boolean;
      defaut?: boolean;
    }) => {
      try {
        setLoading(true);
        setError(null);

        const response =
          await statutsMatrimoniauxService.getStatutsMatrimoniaux({
            page: params?.page || pagination.page,
            limit: params?.limit || pagination.limit,
            search: params?.search,
            actif: params?.actif,
            defaut: params?.defaut,
          });

        setStatuts(response.statuts);
        setPagination({
          page: response.page,
          limit: params?.limit || pagination.limit,
          total: response.total,
          pages: response.pages,
        });
      } catch (err: any) {
        setError(
          err.message || "Erreur lors du chargement des statuts matrimoniaux",
        );
        console.error("Erreur fetchStatuts:", err);
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.limit],
  );

  const createStatut = async (
    data: StatutMatrimonialCreateData,
  ): Promise<StatutMatrimonialType> => {
    try {
      setLoading(true);
      const newStatut =
        await statutsMatrimoniauxService.createStatutMatrimonial(data);
      await fetchStatuts();
      return newStatut;
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateStatut = async (
    uuid: string,
    data: StatutMatrimonialUpdateData,
  ): Promise<StatutMatrimonialType> => {
    try {
      setLoading(true);
      const updatedStatut =
        await statutsMatrimoniauxService.updateStatutMatrimonial(uuid, data);
      await fetchStatuts();
      return updatedStatut;
    } catch (err: any) {
      setError(err.message || "Erreur lors de la modification");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteStatut = async (uuid: string): Promise<void> => {
    try {
      setLoading(true);
      await statutsMatrimoniauxService.deleteStatutMatrimonial(uuid);
      await fetchStatuts();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la suppression");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleStatutStatus = async (uuid: string): Promise<void> => {
    try {
      setLoading(true);
      const statut = statuts.find((s) => s.uuid === uuid);
      if (!statut) throw new Error("Statut non trouvé");

      const newStatus = statut.statut === "actif" ? "inactif" : "actif";
      await statutsMatrimoniauxService.updateStatutMatrimonial(uuid, {
        statut: newStatus,
      });
      await fetchStatuts();
    } catch (err: any) {
      setError(err.message || "Erreur lors du changement de statut");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const setStatutDefaut = async (
    uuid: string,
  ): Promise<StatutMatrimonialType> => {
    try {
      setLoading(true);
      const updatedStatut =
        await statutsMatrimoniauxService.setStatutDefaut(uuid);
      await fetchStatuts();
      return updatedStatut;
    } catch (err: any) {
      setError(
        err.message || "Erreur lors de la définition du statut par défaut",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  const refresh = useCallback(() => {
    fetchStatuts();
  }, [fetchStatuts]);

  // Chargement initial
  useState(() => {
    fetchStatuts();
  });

  return {
    statuts,
    loading,
    error,
    pagination,
    fetchStatuts,
    createStatut,
    updateStatut,
    deleteStatut,
    toggleStatutStatus,
    setStatutDefaut,
    setPage,
    setLimit,
    refresh,
  };
}
