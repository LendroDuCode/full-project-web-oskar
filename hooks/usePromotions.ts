// hooks/usePromotions.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { promotionsService } from "@/services/promotions/promotions.service";
import type {
  Promotion,
  PromotionCreateData,
  PromotionUpdateData,
  ApplicationPromotionData,
  ValidationPromotionResult,
  PromotionStats,
  PromotionAnalyticsReport,
} from "@/services/promotions/promotions.types";

export const usePromotions = {
  // ==================== Queries ====================

  /**
   * Hook pour récupérer la liste des promotions
   */
  useGetPromotions: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    statut?: string;
    actives_only?: boolean;
  }) => {
    return useQuery({
      queryKey: ["promotions", params],
      queryFn: () => promotionsService.getPromotions(params),
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  },

  /**
   * Hook pour récupérer une promotion par UUID
   */
  useGetPromotion: (uuid: string) => {
    return useQuery({
      queryKey: ["promotions", uuid],
      queryFn: () => promotionsService.getPromotion(uuid),
      enabled: !!uuid,
    });
  },

  /**
   * Hook pour récupérer une promotion par code
   */
  useGetPromotionByCode: (code: string, enabled: boolean = true) => {
    return useQuery({
      queryKey: ["promotions", "code", code],
      queryFn: () => promotionsService.getPromotionByCode(code),
      enabled: enabled && !!code,
    });
  },

  /**
   * Hook pour récupérer les statistiques des promotions
   */
  useGetPromotionsStats: () => {
    return useQuery({
      queryKey: ["promotions", "stats"],
      queryFn: () => promotionsService.getPromotionsStats(),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  },

  /**
   * Hook pour récupérer les promotions applicables
   */
  useGetPromotionsApplicables: (params: {
    utilisateur_uuid?: string;
    produit_uuid?: string;
    categorie_uuid?: string;
    montant_panier?: number;
  }) => {
    return useQuery({
      queryKey: ["promotions", "applicables", params],
      queryFn: () => promotionsService.getPromotionsApplicables(params),
      enabled: !!(
        params.utilisateur_uuid ||
        params.produit_uuid ||
        params.categorie_uuid
      ),
      staleTime: 1 * 60 * 1000, // 1 minute
    });
  },

  /**
   * Hook pour récupérer l'analytics d'une promotion
   */
  useGetPromotionAnalytics: (
    uuid: string,
    periode?: { debut: string; fin: string },
  ) => {
    return useQuery({
      queryKey: ["promotions", "analytics", uuid, periode],
      queryFn: () => promotionsService.getPromotionAnalytics(uuid, periode),
      enabled: !!uuid,
    });
  },

  // ==================== Mutations ====================

  /**
   * Hook pour créer une promotion
   */
  useCreatePromotion: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (promotionData: PromotionCreateData) =>
        promotionsService.createPromotion(promotionData),
      onSuccess: () => {
        queryClient.invalidateQueries(["promotions"]);
        queryClient.invalidateQueries(["promotions", "stats"]);
      },
    });
  },

  /**
   * Hook pour mettre à jour une promotion
   */
  useUpdatePromotion: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({
        uuid,
        data,
      }: {
        uuid: string;
        data: PromotionUpdateData;
      }) => promotionsService.updatePromotion(uuid, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(["promotions", variables.uuid]);
        queryClient.invalidateQueries(["promotions"]);
        queryClient.invalidateQueries(["promotions", "stats"]);
      },
    });
  },

  /**
   * Hook pour supprimer une promotion
   */
  useDeletePromotion: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (uuid: string) => promotionsService.deletePromotion(uuid),
      onSuccess: () => {
        queryClient.invalidateQueries(["promotions"]);
        queryClient.invalidateQueries(["promotions", "stats"]);
      },
    });
  },

  /**
   * Hook pour activer/désactiver une promotion
   */
  useTogglePromotion: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ uuid, active }: { uuid: string; active: boolean }) =>
        promotionsService.togglePromotion(uuid, active),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(["promotions", variables.uuid]);
        queryClient.invalidateQueries(["promotions"]);
      },
    });
  },

  /**
   * Hook pour appliquer une promotion
   */
  useApplyPromotion: () => {
    return useMutation({
      mutationFn: (applicationData: ApplicationPromotionData) =>
        promotionsService.applyPromotion(applicationData),
    });
  },

  /**
   * Hook pour valider une promotion
   */
  useValidatePromotion: () => {
    return useMutation({
      mutationFn: ({
        code,
        montantTotal,
        utilisateurUuid,
      }: {
        code: string;
        montantTotal: number;
        utilisateurUuid?: string;
      }) =>
        promotionsService.validatePromotion(
          code,
          montantTotal,
          utilisateurUuid,
        ),
    });
  },

  /**
   * Hook pour dupliquer une promotion
   */
  useDuplicatePromotion: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({
        uuid,
        nouveauNom,
      }: {
        uuid: string;
        nouveauNom?: string;
      }) => promotionsService.dupliquerPromotion(uuid, nouveauNom),
      onSuccess: () => {
        queryClient.invalidateQueries(["promotions"]);
      },
    });
  },

  // ==================== Utilitaires ====================

  /**
   * Hook pour vérifier la disponibilité d'un code
   */
  useCheckCodeAvailability: () => {
    return useMutation({
      mutationFn: (code: string) =>
        promotionsService.verifierDisponibiliteCode(code),
    });
  },

  /**
   * Hook pour récupérer les promotions expirant bientôt
   */
  useGetExpiringPromotions: (jours: number = 7) => {
    return useQuery({
      queryKey: ["promotions", "expiring", jours],
      queryFn: () => promotionsService.getPromotionsExpirantBientot(jours),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  },

  /**
   * Hook pour récupérer les promotions populaires
   */
  useGetPopularPromotions: (limit: number = 10) => {
    return useQuery({
      queryKey: ["promotions", "popular", limit],
      queryFn: () => promotionsService.getPromotionsPopulaires(limit),
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  },

  /**
   * Hook pour mettre à jour les statuts des promotions
   */
  useUpdatePromotionStatuses: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: () => promotionsService.updateStatutsPromotions(),
      onSuccess: () => {
        queryClient.invalidateQueries(["promotions"]);
      },
    });
  },

  /**
   * Hook pour archiver les promotions expirées
   */
  useArchiveExpiredPromotions: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: () => promotionsService.archiverPromotionsExpirees(),
      onSuccess: () => {
        queryClient.invalidateQueries(["promotions"]);
      },
    });
  },
};
