// hooks/useDon.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { donsService } from "@/services/dons/dons.service";
import type {
  Don,
  DonCreateData,
  DonUpdateData,
  DonStats,
  DonFilterParams,
  HistoriqueDon,
  ValidationDon,
  RapportDon,
} from "@/services/dons/dons.types";

export const useDon = {
  // ==================== QUERIES ====================

  /**
   * Hook pour récupérer la liste des dons
   */
  useGetDons: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    statut?: string;
    type?: string;
    categorie_uuid?: string;
    vendeur_uuid?: string;
    utilisateur_uuid?: string;
    date_debut?: string;
    date_fin?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
  }) => {
    return useQuery({
      queryKey: ["dons", params],
      queryFn: () => donsService.getDons(params),
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  },

  /**
   * Hook pour récupérer les dons publiés
   */
  useGetDonsPublies: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    categorie_uuid?: string;
    ville?: string;
    rayon_km?: number;
    latitude?: number;
    longitude?: number;
  }) => {
    return useQuery({
      queryKey: ["dons", "publies", params],
      queryFn: () => donsService.getDonsPublies(params),
      staleTime: 1 * 60 * 1000, // 1 minute
    });
  },

  /**
   * Hook pour récupérer les dons d'un vendeur
   */
  useGetDonsVendeur: (
    vendeurUuid?: string,
    params?: {
      page?: number;
      limit?: number;
      statut?: string;
    },
  ) => {
    return useQuery({
      queryKey: ["dons", "vendeur", vendeurUuid, params],
      queryFn: () =>
        vendeurUuid
          ? donsService.getDonsVendeur(vendeurUuid, params)
          : Promise.resolve({ dons: [], total: 0 }),
      enabled: !!vendeurUuid,
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  },

  /**
   * Hook pour récupérer les dons d'un utilisateur
   */
  useGetDonsUtilisateur: (
    utilisateurUuid?: string,
    params?: {
      page?: number;
      limit?: number;
      statut?: string;
    },
  ) => {
    return useQuery({
      queryKey: ["dons", "utilisateur", utilisateurUuid, params],
      queryFn: () =>
        utilisateurUuid
          ? donsService.getDonsUtilisateur(utilisateurUuid, params)
          : Promise.resolve({ dons: [], total: 0 }),
      enabled: !!utilisateurUuid,
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  },

  /**
   * Hook pour récupérer un don par UUID
   */
  useGetDon: (uuid: string) => {
    return useQuery({
      queryKey: ["dons", uuid],
      queryFn: () => donsService.getDon(uuid),
      enabled: !!uuid,
    });
  },

  /**
   * Hook pour récupérer les statistiques des dons
   */
  useGetDonsStats: (params?: {
    vendeur_uuid?: string;
    utilisateur_uuid?: string;
    date_debut?: string;
    date_fin?: string;
  }) => {
    return useQuery({
      queryKey: ["dons", "stats", params],
      queryFn: () => donsService.getDonsStats(params),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  },

  /**
   * Hook pour récupérer l'historique d'un don
   */
  useGetHistoriqueDon: (donUuid: string) => {
    return useQuery({
      queryKey: ["dons", "historique", donUuid],
      queryFn: () => donsService.getHistoriqueDon(donUuid),
      enabled: !!donUuid,
    });
  },
};
