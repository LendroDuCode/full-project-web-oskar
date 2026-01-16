// hooks/useEchange.ts
import { useState, useEffect, useCallback } from "react";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { api } from "@/lib/api-client";
import type { ApiResponse } from "@/types/common";

export interface Echange {
  uuid: string;
  code: string;
  titre: string;
  description?: string;
  type: "offre" | "demande";
  categorie_uuid: string;
  categorie_nom: string;
  statut:
    | "en_attente"
    | "active"
    | "en_cours"
    | "termine"
    | "annule"
    | "bloque";

  // Produits/service échangés
  produit_offert_uuid?: string;
  produit_offert_nom?: string;
  produit_offert_description?: string;
  produit_offert_images?: string[];
  produit_offert_valeur?: number;

  produit_demande_uuid?: string;
  produit_demande_nom?: string;
  produit_demande_description?: string;
  produit_demande_images?: string[];
  produit_demande_valeur?: number;

  // Informations complémentaires
  quantite_offerte?: number;
  quantite_demandee?: number;
  conditions?: string[];
  tags?: string[];
  localisation?: string;
  rayon_km?: number;

  // Informations sur les participants
  createur_uuid: string;
  createur_type: "utilisateur" | "vendeur" | "agent";
  createur_nom: string;
  createur_avatar?: string;
  createur_rating?: number;

  participant_uuid?: string;
  participant_type?: "utilisateur" | "vendeur" | "agent";
  participant_nom?: string;
  participant_avatar?: string;
  participant_rating?: number;

  // Dates importantes
  date_creation: string;
  date_modification: string;
  date_publication?: string;
  date_debut?: string;
  date_fin?: string;
  date_acceptation?: string;
  date_annulation?: string;

  // Suivi et évaluation
  note_createur?: number;
  note_participant?: number;
  commentaire_createur?: string;
  commentaire_participant?: string;

  // Visibilité et sécurité
  est_public: boolean;
  est_verifie: boolean;
  est_bloque: boolean;
  motif_blocage?: string;
  bloque_par?: string;
  bloque_le?: string;

  // Statistiques
  vues_count: number;
  favoris_count: number;
  messages_count: number;
  propositions_count: number;

  // Métadonnées
  metadata?: Record<string, any>;
}

export interface EchangeCreateData {
  titre: string;
  description?: string;
  type: "offre" | "demande";
  categorie_uuid: string;

  produit_offert_uuid?: string;
  produit_offert_description?: string;
  produit_offert_valeur?: number;

  produit_demande_uuid?: string;
  produit_demande_description?: string;
  produit_demande_valeur?: number;

  quantite_offerte?: number;
  quantite_demandee?: number;
  conditions?: string[];
  tags?: string[];
  localisation?: string;
  rayon_km?: number;

  est_public?: boolean;
}

export interface EchangeUpdateData {
  titre?: string;
  description?: string;
  categorie_uuid?: string;

  produit_offert_description?: string;
  produit_offert_valeur?: number;

  produit_demande_description?: string;
  produit_demande_valeur?: number;

  quantite_offerte?: number;
  quantite_demandee?: number;
  conditions?: string[];
  tags?: string[];
  localisation?: string;
  rayon_km?: number;

  statut?:
    | "en_attente"
    | "active"
    | "en_cours"
    | "termine"
    | "annule"
    | "bloque";
  est_public?: boolean;
}

export interface EchangeFilterParams {
  type?: "offre" | "demande" | "all";
  statut?: string;
  categorie_uuid?: string;
  createur_uuid?: string;
  participant_uuid?: string;
  localisation?: string;
  rayon_km?: number;
  min_valeur?: number;
  max_valeur?: number;
  date_debut?: string;
  date_fin?: string;
  tags?: string[];
  only_public?: boolean;
  only_verified?: boolean;
  only_active?: boolean;
  search?: string;
}

export interface UseEchangeOptions {
  autoFetch?: boolean;
  filters?: EchangeFilterParams;
  sortBy?:
    | "date_creation"
    | "date_modification"
    | "titre"
    | "valeur"
    | "vues_count";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
  userType?: "utilisateur" | "vendeur" | "agent" | "admin";
}

export const useEchange = (options: UseEchangeOptions = {}) => {
  const {
    autoFetch = true,
    filters = {},
    sortBy = "date_creation",
    sortOrder = "desc",
    page = 1,
    limit = 20,
    userType = "utilisateur",
  } = options;

  // État
  const [echanges, setEchanges] = useState<Echange[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [selectedEchange, setSelectedEchange] = useState<Echange | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(page);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Récupérer la liste des échanges
  const fetchEchanges = useCallback(
    async (pageNum: number = currentPage) => {
      try {
        setLoading(true);
        setError(null);

        // Construire les paramètres de requête
        const params = new URLSearchParams();

        // Ajouter les filtres
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            if (Array.isArray(value)) {
              params.append(key, value.join(","));
            } else if (typeof value === "boolean") {
              params.append(key, value.toString());
            } else {
              params.append(key, String(value));
            }
          }
        });

        params.append("page", pageNum.toString());
        params.append("limit", limit.toString());
        params.append("sort_by", sortBy);
        params.append("sort_order", sortOrder);

        // Sélectionner le bon endpoint en fonction du type d'utilisateur
        let endpoint = "";
        if (userType === "vendeur") {
          endpoint = API_ENDPOINTS.ECHANGES.VENDEUR_ECHANGES;
        } else if (userType === "utilisateur") {
          endpoint = API_ENDPOINTS.ECHANGES.USER_ECHANGES;
        } else {
          endpoint = API_ENDPOINTS.ECHANGES.LIST;
        }

        const fullEndpoint = `${endpoint}?${params.toString()}`;
        const response = await api.get<ApiResponse<Echange[]>>(fullEndpoint);

        if (response.status === "success") {
          setEchanges(response.data);
          setTotal(response.metadata?.total || response.data.length);
          setCurrentPage(response.metadata?.page || pageNum);
          setTotalPages(response.metadata?.pages || 1);
        } else {
          throw new Error(
            response.message || "Erreur lors de la récupération des échanges",
          );
        }
      } catch (err: any) {
        setError(err);
        console.error("Erreur fetchEchanges:", err);
      } finally {
        setLoading(false);
      }
    },
    [filters, sortBy, sortOrder, limit, currentPage, userType],
  );

  // Récupérer un échange spécifique
  const fetchEchange = useCallback(async (uuid: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<ApiResponse<Echange>>(
        API_ENDPOINTS.ECHANGES.DETAIL(uuid),
      );

      if (response.status === "success") {
        setSelectedEchange(response.data);
        return response.data;
      } else {
        throw new Error(
          response.message || "Erreur lors de la récupération de l'échange",
        );
      }
    } catch (err: any) {
      setError(err);
      console.error("Erreur fetchEchange:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Récupérer les échanges par statut
  const fetchEchangesByStatus = useCallback(async (statut: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<ApiResponse<Echange[]>>(
        API_ENDPOINTS.ECHANGES.BY_STATUS(statut),
      );

      if (response.status === "success") {
        setEchanges(response.data);
        setTotal(response.data.length);
      } else {
        throw new Error(
          response.message ||
            "Erreur lors de la récupération des échanges par statut",
        );
      }
    } catch (err: any) {
      setError(err);
      console.error("Erreur fetchEchangesByStatus:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Créer un nouvel échange
  const createEchange = useCallback(async (data: EchangeCreateData) => {
    try {
      setLoading(true);
      setError(null);

      // Validation
      if (!data.titre || !data.type || !data.categorie_uuid) {
        throw new Error("Tous les champs obligatoires doivent être remplis");
      }

      const response = await api.post<ApiResponse<Echange>>(
        API_ENDPOINTS.ECHANGES.CREATE,
        data,
      );

      if (response.status === "success") {
        setEchanges((prev) => [response.data, ...prev]);
        return response.data;
      } else {
        throw new Error(
          response.message || "Erreur lors de la création de l'échange",
        );
      }
    } catch (err: any) {
      setError(err);
      console.error("Erreur createEchange:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Mettre à jour un échange
  const updateEchange = useCallback(
    async (uuid: string, data: EchangeUpdateData) => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.put<ApiResponse<Echange>>(
          API_ENDPOINTS.ECHANGES.UPDATE(uuid),
          data,
        );

        if (response.status === "success") {
          setEchanges((prev) =>
            prev.map((echange) =>
              echange.uuid === uuid ? response.data : echange,
            ),
          );

          if (selectedEchange?.uuid === uuid) {
            setSelectedEchange(response.data);
          }

          return response.data;
        } else {
          throw new Error(
            response.message || "Erreur lors de la mise à jour de l'échange",
          );
        }
      } catch (err: any) {
        setError(err);
        console.error("Erreur updateEchange:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedEchange],
  );

  // Supprimer un échange
  const deleteEchange = useCallback(
    async (uuid: string) => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.delete<ApiResponse<void>>(
          API_ENDPOINTS.ECHANGES.DELETE(uuid),
        );

        if (response.status === "success") {
          setEchanges((prev) =>
            prev.filter((echange) => echange.uuid !== uuid),
          );

          if (selectedEchange?.uuid === uuid) {
            setSelectedEchange(null);
          }
        } else {
          throw new Error(
            response.message || "Erreur lors de la suppression de l'échange",
          );
        }
      } catch (err: any) {
        setError(err);
        console.error("Erreur deleteEchange:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedEchange],
  );

  // Accepter un échange
  const acceptEchange = useCallback(
    async (uuid: string, participantUuid: string) => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.post<ApiResponse<Echange>>(
          API_ENDPOINTS.ECHANGES.ACCEPT(uuid),
          { participant_uuid: participantUuid },
        );

        if (response.status === "success") {
          setEchanges((prev) =>
            prev.map((echange) =>
              echange.uuid === uuid ? response.data : echange,
            ),
          );

          if (selectedEchange?.uuid === uuid) {
            setSelectedEchange(response.data);
          }

          return response.data;
        } else {
          throw new Error(
            response.message || "Erreur lors de l'acceptation de l'échange",
          );
        }
      } catch (err: any) {
        setError(err);
        console.error("Erreur acceptEchange:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedEchange],
  );

  // Refuser un échange
  const refuseEchange = useCallback(
    async (uuid: string, motif?: string) => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.post<ApiResponse<Echange>>(
          API_ENDPOINTS.ECHANGES.REFUSE(uuid),
          { motif },
        );

        if (response.status === "success") {
          setEchanges((prev) =>
            prev.map((echange) =>
              echange.uuid === uuid ? response.data : echange,
            ),
          );

          if (selectedEchange?.uuid === uuid) {
            setSelectedEchange(response.data);
          }

          return response.data;
        } else {
          throw new Error(
            response.message || "Erreur lors du refus de l'échange",
          );
        }
      } catch (err: any) {
        setError(err);
        console.error("Erreur refuseEchange:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedEchange],
  );

  // Publier un échange
  const publishEchange = useCallback(
    async (uuid: string) => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.post<ApiResponse<Echange>>(
          `${API_ENDPOINTS.ECHANGES.PUBLISH}/${uuid}`,
        );

        if (response.status === "success") {
          setEchanges((prev) =>
            prev.map((echange) =>
              echange.uuid === uuid ? response.data : echange,
            ),
          );

          if (selectedEchange?.uuid === uuid) {
            setSelectedEchange(response.data);
          }

          return response.data;
        } else {
          throw new Error(
            response.message || "Erreur lors de la publication de l'échange",
          );
        }
      } catch (err: any) {
        setError(err);
        console.error("Erreur publishEchange:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedEchange],
  );

  // Mettre à jour le stock (pour utilisateur)
  const updateStockUser = useCallback(
    async (uuid: string, quantite: number) => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.put<ApiResponse<Echange>>(
          API_ENDPOINTS.ECHANGES.UPDATE_STOCK_USER(uuid),
          { quantite },
        );

        if (response.status === "success") {
          setEchanges((prev) =>
            prev.map((echange) =>
              echange.uuid === uuid ? response.data : echange,
            ),
          );

          if (selectedEchange?.uuid === uuid) {
            setSelectedEchange(response.data);
          }

          return response.data;
        } else {
          throw new Error(
            response.message || "Erreur lors de la mise à jour du stock",
          );
        }
      } catch (err: any) {
        setError(err);
        console.error("Erreur updateStockUser:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedEchange],
  );

  // Mettre à jour le stock (pour vendeur)
  const updateStockVendeur = useCallback(
    async (uuid: string, quantite: number) => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.put<ApiResponse<Echange>>(
          API_ENDPOINTS.ECHANGES.UPDATE_STOCK_VENDEUR(uuid),
          { quantite },
        );

        if (response.status === "success") {
          setEchanges((prev) =>
            prev.map((echange) =>
              echange.uuid === uuid ? response.data : echange,
            ),
          );

          if (selectedEchange?.uuid === uuid) {
            setSelectedEchange(response.data);
          }

          return response.data;
        } else {
          throw new Error(
            response.message || "Erreur lors de la mise à jour du stock",
          );
        }
      } catch (err: any) {
        setError(err);
        console.error("Erreur updateStockVendeur:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedEchange],
  );

  // Récupérer un échange aléatoire (pour suggestions)
  const fetchRandomEchange = useCallback(async (uuid: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<ApiResponse<Echange>>(
        API_ENDPOINTS.ECHANGES.RANDOM_DETAIL(uuid),
      );

      if (response.status === "success") {
        return response.data;
      } else {
        throw new Error(
          response.message ||
            "Erreur lors de la récupération de l'échange aléatoire",
        );
      }
    } catch (err: any) {
      console.error("Erreur fetchRandomEchange:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Uploader une image pour un échange
  const uploadImage = useCallback(async (file: File) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("image", file);

      const response = await api.post<
        ApiResponse<{ filename: string; url: string }>
      >(API_ENDPOINTS.ECHANGES.UPLOAD, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (err: any) {
      setError(err);
      console.error("Erreur uploadImage:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtenir l'URL d'une image uploadée
  const getImageUrl = useCallback((filename: string) => {
    return API_ENDPOINTS.ECHANGES.GET_UPLOAD(filename);
  }, []);

  // Exporter en PDF
  const exportToPDF = useCallback(async (): Promise<Blob> => {
    try {
      setLoading(true);

      const response = await api.get(API_ENDPOINTS.ECHANGES.EXPORT_PDF, {
        responseType: "blob",
      });

      return response.data;
    } catch (err: any) {
      setError(err);
      console.error("Erreur exportToPDF:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Réinitialiser la sélection
  const resetSelection = useCallback(() => {
    setSelectedEchange(null);
  }, []);

  // Pagination
  const goToPage = useCallback(
    (pageNum: number) => {
      if (pageNum >= 1 && pageNum <= totalPages) {
        setCurrentPage(pageNum);
        fetchEchanges(pageNum);
      }
    },
    [totalPages, fetchEchanges],
  );

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, totalPages, goToPage]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  // Mettre à jour les filtres
  const updateFilters = useCallback(
    (newFilters: Partial<EchangeFilterParams>) => {
      setCurrentPage(1);
      // Note: La mise à jour des filtres déclenchera un rechargement via l'effet
    },
    [],
  );

  // Effet pour le chargement initial
  useEffect(() => {
    if (autoFetch) {
      fetchEchanges();
    }
  }, [autoFetch, fetchEchanges]);

  // Effet pour recharger quand les filtres changent
  useEffect(() => {
    if (autoFetch) {
      fetchEchanges(1); // Toujours retourner à la page 1 quand les filtres changent
    }
  }, [autoFetch, filters, fetchEchanges]);

  return {
    // État
    echanges,
    loading,
    error,
    selectedEchange,
    total,
    currentPage,
    totalPages,
    filters,

    // Actions
    fetchEchanges,
    fetchEchange,
    fetchEchangesByStatus,
    createEchange,
    updateEchange,
    deleteEchange,
    acceptEchange,
    refuseEchange,
    publishEchange,
    updateStockUser,
    updateStockVendeur,
    fetchRandomEchange,
    uploadImage,
    getImageUrl,
    exportToPDF,
    resetSelection,
    updateFilters,

    // Pagination
    goToPage,
    nextPage,
    prevPage,

    // Sélection
    setSelectedEchange,

    // Utilitaires
    echangesActifs: echanges.filter(
      (e) => e.statut === "active" || e.statut === "en_cours",
    ),
    echangesEnAttente: echanges.filter((e) => e.statut === "en_attente"),
    echangesTermines: echanges.filter((e) => e.statut === "termine"),
    echangesBloques: echanges.filter((e) => e.statut === "bloque"),
    echangesOffres: echanges.filter((e) => e.type === "offre"),
    echangesDemandes: echanges.filter((e) => e.type === "demande"),
    echangesPublics: echanges.filter((e) => e.est_public),

    // Gestion d'état
    setLoading,
    setError,
  };
};
