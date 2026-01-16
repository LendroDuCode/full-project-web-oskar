// hooks/useReceptions.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { receptionsService } from "@/services/receptions/receptions.service";
import type {
  Reception,
  ReceptionCreateData,
  ReceptionUpdateData,
  RecevoirArticlesData,
  VerifierArticlesData,
  ControleQualiteData,
  ReceptionStats,
  ReceptionAlert,
  FournisseurReception,
  EntrepotReception,
  TransfertReception,
} from "@/services/receptions/receptions.types";

export const useReceptions = {
  // ==================== Queries ====================

  /**
   * Hook pour récupérer la liste des réceptions
   */
  useGetReceptions: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    statut?: string;
    entrepot_uuid?: string;
  }) => {
    return useQuery({
      queryKey: ["receptions", params],
      queryFn: () => receptionsService.getReceptions(params),
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  },

  /**
   * Hook pour récupérer une réception par UUID
   */
  useGetReception: (uuid: string) => {
    return useQuery({
      queryKey: ["receptions", uuid],
      queryFn: () => receptionsService.getReception(uuid),
      enabled: !!uuid,
    });
  },

  /**
   * Hook pour récupérer les statistiques des réceptions
   */
  useGetReceptionsStats: (params?: {
    periode_debut?: string;
    periode_fin?: string;
    entrepot_uuid?: string;
  }) => {
    return useQuery({
      queryKey: ["receptions", "stats", params],
      queryFn: () => receptionsService.getReceptionsStats(params),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  },

  /**
   * Hook pour récupérer les fournisseurs
   */
  useGetFournisseurs: (params?: {
    search?: string;
    statut?: string;
    page?: number;
    limit?: number;
  }) => {
    return useQuery({
      queryKey: ["receptions", "fournisseurs", params],
      queryFn: () => receptionsService.getFournisseurs(params),
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  },

  /**
   * Hook pour récupérer les entrepôts
   */
  useGetEntrepots: () => {
    return useQuery({
      queryKey: ["receptions", "entrepots"],
      queryFn: () => receptionsService.getEntrepots(),
      staleTime: 30 * 60 * 1000, // 30 minutes
    });
  },

  /**
   * Hook pour récupérer les alertes
   */
  useGetReceptionAlerts: (params?: {
    statut?: string;
    priorite?: string;
    type?: string;
  }) => {
    return useQuery({
      queryKey: ["receptions", "alerts", params],
      queryFn: () => receptionsService.getReceptionAlerts(params),
      staleTime: 1 * 60 * 1000, // 1 minute
      refetchInterval: 2 * 60 * 1000, // Auto-refresh every 2 minutes
    });
  },

  /**
   * Hook pour récupérer les transferts
   */
  useGetTransferts: (params?: {
    statut?: string;
    entrepot_source_uuid?: string;
    entrepot_destination_uuid?: string;
  }) => {
    return useQuery({
      queryKey: ["receptions", "transferts", params],
      queryFn: () => receptionsService.getTransferts(params),
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  },

  /**
   * Hook pour récupérer les réceptions en retard
   */
  useGetReceptionsEnRetard: () => {
    return useQuery({
      queryKey: ["receptions", "en-retard"],
      queryFn: () => receptionsService.getReceptionsEnRetard(),
      staleTime: 1 * 60 * 1000, // 1 minute
    });
  },

  /**
   * Hook pour récupérer les réceptions urgentes
   */
  useGetReceptionsUrgentes: () => {
    return useQuery({
      queryKey: ["receptions", "urgentes"],
      queryFn: () => receptionsService.getReceptionsUrgentes(),
      staleTime: 1 * 60 * 1000, // 1 minute
    });
  },

  // ==================== Mutations ====================

  /**
   * Hook pour créer une réception
   */
  useCreateReception: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (receptionData: ReceptionCreateData) =>
        receptionsService.createReception(receptionData),
      onSuccess: () => {
        queryClient.invalidateQueries(["receptions"]);
        queryClient.invalidateQueries(["receptions", "stats"]);
      },
    });
  },

  /**
   * Hook pour mettre à jour une réception
   */
  useUpdateReception: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({
        uuid,
        data,
      }: {
        uuid: string;
        data: ReceptionUpdateData;
      }) => receptionsService.updateReception(uuid, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(["receptions", variables.uuid]);
        queryClient.invalidateQueries(["receptions"]);
      },
    });
  },

  /**
   * Hook pour supprimer une réception
   */
  useDeleteReception: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (uuid: string) => receptionsService.deleteReception(uuid),
      onSuccess: () => {
        queryClient.invalidateQueries(["receptions"]);
        queryClient.invalidateQueries(["receptions", "stats"]);
      },
    });
  },

  /**
   * Hook pour recevoir des articles
   */
  useReceiveArticles: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (data: RecevoirArticlesData) =>
        receptionsService.receiveArticles(data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(["receptions", variables.reception_uuid]);
        queryClient.invalidateQueries(["receptions"]);
      },
    });
  },

  /**
   * Hook pour vérifier des articles
   */
  useVerifyArticles: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (data: VerifierArticlesData) =>
        receptionsService.verifyArticles(data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(["receptions", variables.reception_uuid]);
        queryClient.invalidateQueries(["receptions"]);
      },
    });
  },

  /**
   * Hook pour effectuer le contrôle qualité
   */
  usePerformQualityControl: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (data: ControleQualiteData) =>
        receptionsService.performQualityControl(data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(["receptions", variables.reception_uuid]);
        queryClient.invalidateQueries(["receptions"]);
      },
    });
  },

  /**
   * Hook pour annuler une réception
   */
  useCancelReception: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ uuid, raison }: { uuid: string; raison?: string }) =>
        receptionsService.cancelReception(uuid, raison),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(["receptions", variables.uuid]);
        queryClient.invalidateQueries(["receptions"]);
        queryClient.invalidateQueries(["receptions", "stats"]);
      },
    });
  },

  /**
   * Hook pour clôturer une réception
   */
  useCloseReception: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (uuid: string) => receptionsService.closeReception(uuid),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(["receptions", variables]);
        queryClient.invalidateQueries(["receptions"]);
        queryClient.invalidateQueries(["receptions", "stats"]);
      },
    });
  },

  /**
   * Hook pour créer une alerte
   */
  useCreateAlert: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (alertData: Partial<ReceptionAlert>) =>
        receptionsService.createAlert(alertData),
      onSuccess: () => {
        queryClient.invalidateQueries(["receptions", "alerts"]);
      },
    });
  },

  /**
   * Hook pour mettre à jour le statut d'une alerte
   */
  useUpdateAlertStatus: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({
        uuid,
        statut,
        notes,
      }: {
        uuid: string;
        statut: string;
        notes?: string;
      }) => receptionsService.updateAlertStatus(uuid, statut, notes),
      onSuccess: () => {
        queryClient.invalidateQueries(["receptions", "alerts"]);
      },
    });
  },

  /**
   * Hook pour créer un transfert
   */
  useCreateTransfert: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (transfertData: Partial<TransfertReception>) =>
        receptionsService.createTransfert(transfertData),
      onSuccess: () => {
        queryClient.invalidateQueries(["receptions", "transferts"]);
      },
    });
  },

  // ==================== Utilitaires ====================

  /**
   * Hook pour vérifier la disponibilité d'un article
   */
  useCheckArticleAvailability: () => {
    return useMutation({
      mutationFn: ({
        articleUuid,
        quantite,
      }: {
        articleUuid: string;
        quantite: number;
      }) => receptionsService.checkArticleAvailability(articleUuid, quantite),
    });
  },

  /**
   * Hook pour générer un numéro de réception
   */
  useGenerateReceptionNumber: () => {
    return useMutation({
      mutationFn: () => receptionsService.generateReceptionNumber(),
    });
  },

  /**
   * Hook pour synchroniser avec ERP
   */
  useSyncWithERP: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (receptionUuid: string) =>
        receptionsService.syncWithERP(receptionUuid),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(["receptions", variables]);
      },
    });
  },
};
