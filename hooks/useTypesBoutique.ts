// hooks/useTypesBoutique.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { typesBoutiqueService } from "@/services/types-boutique/types-boutique.service";
import type {
  TypeBoutiqueType,
  TypeBoutiqueCreateData,
  TypeBoutiqueUpdateData,
  TypeBoutiqueStats,
  DemandeChangementTypeBoutique,
  TestCompatibiliteType,
  ConfigurationTypeBoutique,
  TemplateConfigurationType,
  ComparaisonTypesBoutique,
} from "@/services/types-boutique/types-boutique.types";

export const useTypesBoutique = {
  // ==================== Queries ====================

  /**
   * Hook pour récupérer la liste des types de boutique
   */
  useGetTypesBoutique: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    actif?: boolean;
  }) => {
    return useQuery({
      queryKey: ["types-boutique", params],
      queryFn: () => typesBoutiqueService.getTypesBoutique(params),
      keepPreviousData: true,
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  },

  /**
   * Hook pour récupérer les types de boutique par défaut
   */
  useGetTypesBoutiqueDefaults: () => {
    return useQuery({
      queryKey: ["types-boutique", "defaults"],
      queryFn: () => typesBoutiqueService.getTypesBoutiqueDefaults(),
      staleTime: 30 * 60 * 1000, // 30 minutes
    });
  },

  /**
   * Hook pour récupérer un type de boutique par UUID
   */
  useGetTypeBoutique: (uuid: string) => {
    return useQuery({
      queryKey: ["types-boutique", uuid],
      queryFn: () => typesBoutiqueService.getTypeBoutique(uuid),
      enabled: !!uuid,
    });
  },

  /**
   * Hook pour récupérer le type par défaut
   */
  useGetTypeDefaut: () => {
    return useQuery({
      queryKey: ["types-boutique", "defaut"],
      queryFn: () => typesBoutiqueService.getTypeDefaut(),
      staleTime: 30 * 60 * 1000, // 30 minutes
    });
  },

  /**
   * Hook pour récupérer les statistiques des types de boutique
   */
  useGetTypesBoutiqueStats: () => {
    return useQuery({
      queryKey: ["types-boutique", "stats"],
      queryFn: () => typesBoutiqueService.getTypesBoutiqueStats(),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  },

  /**
   * Hook pour récupérer la configuration d'un type
   */
  useGetConfigurationTypeBoutique: (typeUuid: string) => {
    return useQuery({
      queryKey: ["types-boutique", "configuration", typeUuid],
      queryFn: () =>
        typesBoutiqueService.getConfigurationTypeBoutique(typeUuid),
      enabled: !!typeUuid,
    });
  },

  /**
   * Hook pour récupérer les templates de configuration
   */
  useGetTemplatesConfiguration: (typeUuid: string) => {
    return useQuery({
      queryKey: ["types-boutique", "templates", typeUuid],
      queryFn: () => typesBoutiqueService.getTemplatesConfiguration(typeUuid),
      enabled: !!typeUuid,
    });
  },

  /**
   * Hook pour récupérer les demandes de changement de type
   */
  useGetDemandesChangement: (params?: {
    statut?: string;
    boutique_uuid?: string;
  }) => {
    return useQuery({
      queryKey: ["types-boutique", "demandes", params],
      queryFn: () => typesBoutiqueService.getDemandesChangement(params),
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  },

  /**
   * Hook pour récupérer les types recommandés
   */
  useGetTypesRecommandes: (params: {
    experience?: string;
    budget?: string;
    objectif?: string;
    secteur?: string;
  }) => {
    return useQuery({
      queryKey: ["types-boutique", "recommandes", params],
      queryFn: () => typesBoutiqueService.getTypesRecommandes(params),
      staleTime: 15 * 60 * 1000, // 15 minutes
    });
  },

  /**
   * Hook pour récupérer les types compatibles
   */
  useGetTypesCompatibles: (boutiqueUuid: string) => {
    return useQuery({
      queryKey: ["types-boutique", "compatibles", boutiqueUuid],
      queryFn: () => typesBoutiqueService.getTypesCompatibles(boutiqueUuid),
      enabled: !!boutiqueUuid,
    });
  },

  // ==================== Mutations ====================

  /**
   * Hook pour créer un type de boutique
   */
  useCreateTypeBoutique: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (typeData: TypeBoutiqueCreateData) =>
        typesBoutiqueService.createTypeBoutique(typeData),
      onSuccess: () => {
        queryClient.invalidateQueries(["types-boutique"]);
        queryClient.invalidateQueries(["types-boutique", "stats"]);
      },
    });
  },

  /**
   * Hook pour mettre à jour un type de boutique
   */
  useUpdateTypeBoutique: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({
        uuid,
        data,
      }: {
        uuid: string;
        data: TypeBoutiqueUpdateData;
      }) => typesBoutiqueService.updateTypeBoutique(uuid, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(["types-boutique", variables.uuid]);
        queryClient.invalidateQueries(["types-boutique"]);
        queryClient.invalidateQueries(["types-boutique", "stats"]);
      },
    });
  },

  /**
   * Hook pour supprimer un type de boutique
   */
  useDeleteTypeBoutique: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (uuid: string) =>
        typesBoutiqueService.deleteTypeBoutique(uuid),
      onSuccess: () => {
        queryClient.invalidateQueries(["types-boutique"]);
        queryClient.invalidateQueries(["types-boutique", "stats"]);
      },
    });
  },

  /**
   * Hook pour activer/désactiver un type de boutique
   */
  useToggleTypeBoutique: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ uuid, active }: { uuid: string; active: boolean }) =>
        active
          ? typesBoutiqueService.activateTypeBoutique(uuid)
          : typesBoutiqueService.deactivateTypeBoutique(uuid),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(["types-boutique", variables.uuid]);
        queryClient.invalidateQueries(["types-boutique"]);
      },
    });
  },

  /**
   * Hook pour définir un type comme type par défaut
   */
  useSetTypeDefaut: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (uuid: string) => typesBoutiqueService.setTypeDefaut(uuid),
      onSuccess: () => {
        queryClient.invalidateQueries(["types-boutique"]);
        queryClient.invalidateQueries(["types-boutique", "defaut"]);
      },
    });
  },

  /**
   * Hook pour mettre à jour la configuration d'un type
   */
  useUpdateConfigurationTypeBoutique: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({
        typeUuid,
        configuration,
      }: {
        typeUuid: string;
        configuration: Partial<ConfigurationTypeBoutique>;
      }) =>
        typesBoutiqueService.updateConfigurationTypeBoutique(
          typeUuid,
          configuration,
        ),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries([
          "types-boutique",
          "configuration",
          variables.typeUuid,
        ]);
      },
    });
  },

  /**
   * Hook pour créer un template de configuration
   */
  useCreateTemplateConfiguration: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (templateData: Partial<TemplateConfigurationType>) =>
        typesBoutiqueService.createTemplateConfiguration(templateData),
      onSuccess: (_, variables) => {
        if (variables.type_boutique_uuid) {
          queryClient.invalidateQueries([
            "types-boutique",
            "templates",
            variables.type_boutique_uuid,
          ]);
        }
      },
    });
  },

  /**
   * Hook pour tester la compatibilité d'un changement de type
   */
  useTesterCompatibiliteChangement: () => {
    return useMutation({
      mutationFn: ({
        boutiqueUuid,
        nouveauTypeUuid,
      }: {
        boutiqueUuid: string;
        nouveauTypeUuid: string;
      }) =>
        typesBoutiqueService.testerCompatibiliteChangement(
          boutiqueUuid,
          nouveauTypeUuid,
        ),
    });
  },

  /**
   * Hook pour soumettre une demande de changement de type
   */
  useSoumettreDemandeChangement: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (demandeData: {
        boutique_uuid: string;
        nouveau_type_uuid: string;
        raison?: string;
        documents?: Array<{
          type: string;
          nom: string;
          url: string;
        }>;
      }) => typesBoutiqueService.soumettreDemandeChangement(demandeData),
      onSuccess: () => {
        queryClient.invalidateQueries(["types-boutique", "demandes"]);
      },
    });
  },

  /**
   * Hook pour approuver une demande de changement de type
   */
  useApprouverDemandeChangement: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({
        uuid,
        validateurUuid,
        notes,
      }: {
        uuid: string;
        validateurUuid: string;
        notes?: string;
      }) =>
        typesBoutiqueService.approuverDemandeChangement(
          uuid,
          validateurUuid,
          notes,
        ),
      onSuccess: () => {
        queryClient.invalidateQueries(["types-boutique", "demandes"]);
      },
    });
  },

  /**
   * Hook pour exécuter une migration de type
   */
  useExecuterMigration: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (migrationData: {
        demande_uuid: string;
        boutique_uuid: string;
        responsable_uuid?: string;
      }) => typesBoutiqueService.executerMigration(migrationData),
      onSuccess: () => {
        queryClient.invalidateQueries(["types-boutique", "demandes"]);
        // Invalider aussi les queries de la boutique concernée
        queryClient.invalidateQueries(["boutiques"]);
      },
    });
  },

  /**
   * Hook pour comparer des types de boutique
   */
  useComparerTypesBoutique: () => {
    return useMutation({
      mutationFn: (typeUuids: string[]) =>
        typesBoutiqueService.comparerTypesBoutique(typeUuids),
    });
  },

  /**
   * Hook pour générer une analyse comparative
   */
  useGenererAnalyseComparative: () => {
    return useMutation({
      mutationFn: (typeUuids: string[]) =>
        typesBoutiqueService.genererAnalyseComparative(typeUuids),
    });
  },

  /**
   * Hook pour simuler une boutique avec un type
   */
  useSimulerBoutiqueAvecType: () => {
    return useMutation({
      mutationFn: ({
        typeUuid,
        parametres,
      }: {
        typeUuid: string;
        parametres?: any;
      }) => typesBoutiqueService.simulerBoutiqueAvecType(typeUuid, parametres),
    });
  },

  // ==================== Utilitaires ====================

  /**
   * Hook pour exporter les types de boutique au format PDF
   */
  useExportTypesBoutiquePDF: () => {
    return useMutation({
      mutationFn: () => typesBoutiqueService.exportTypesBoutiquePDF(),
    });
  },

  /**
   * Hook pour vérifier la disponibilité d'un type dans un pays
   */
  useVerifierDisponibilitePays: () => {
    return useMutation({
      mutationFn: ({
        typeUuid,
        paysCode,
      }: {
        typeUuid: string;
        paysCode: string;
      }) => typesBoutiqueService.verifierDisponibilitePays(typeUuid, paysCode),
    });
  },

  /**
   * Hook pour récupérer les pré-requis d'un type
   */
  useGetPrerequisTypeBoutique: (typeUuid: string) => {
    return useQuery({
      queryKey: ["types-boutique", "prerequis", typeUuid],
      queryFn: () => typesBoutiqueService.getPrerequisTypeBoutique(typeUuid),
      enabled: !!typeUuid,
    });
  },

  /**
   * Hook pour récupérer le guide de mise en place
   */
  useGetGuideMiseEnPlace: (typeUuid: string) => {
    return useQuery({
      queryKey: ["types-boutique", "guide", typeUuid],
      queryFn: () => typesBoutiqueService.getGuideMiseEnPlace(typeUuid),
      enabled: !!typeUuid,
    });
  },

  /**
   * Hook pour récupérer les bundles de types
   */
  useGetBundlesTypesBoutique: () => {
    return useQuery({
      queryKey: ["types-boutique", "bundles"],
      queryFn: () => typesBoutiqueService.getBundlesTypesBoutique(),
      staleTime: 30 * 60 * 1000, // 30 minutes
    });
  },
};
