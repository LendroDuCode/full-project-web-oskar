// hooks/useProduits.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import { produitService } from "@/services/produits/produit.service";
import type {
  Produit,
  ProduitCreateData,
  ProduitUpdateData,
  ProduitFilterParams,
  ProduitSearchResult,
  ProduitStats,
  ProduitAvis,
  ProduitQuestion,
  ProduitVariation,
  ProduitPromotion,
  ProduitConfig,
} from "@/services/produits/produit.types";

export function useProduits(initialFilters?: ProduitFilterParams) {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [facettes, setFacettes] = useState<any>(null);
  const [filters, setFilters] = useState<ProduitFilterParams>(
    initialFilters || {},
  );

  const chargerProduits = useCallback(
    async (customFilters?: ProduitFilterParams, page?: number) => {
      setLoading(true);
      setError(null);

      try {
        const result = await produitService.getProduits({
          page: page || pagination.page,
          limit: pagination.limit,
          filters: { ...filters, ...customFilters },
        });

        setProduits(result.produits);
        setPagination({
          page: result.page,
          limit: pagination.limit,
          total: result.total,
          pages: result.pages,
        });
        setFacettes(result.facettes);

        if (customFilters) {
          setFilters((prev) => ({ ...prev, ...customFilters }));
        }
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des produits");
      } finally {
        setLoading(false);
      }
    },
    [filters, pagination.page, pagination.limit],
  );

  const chargerProduitsPublies = useCallback(
    async (
      customFilters?: Omit<ProduitFilterParams, "statut">,
      page?: number,
    ) => {
      await chargerProduits(
        {
          ...customFilters,
          statut: "publie",
        },
        page,
      );
    },
    [chargerProduits],
  );

  const nextPage = useCallback(() => {
    if (pagination.page < pagination.pages) {
      chargerProduits(undefined, pagination.page + 1);
    }
  }, [pagination, chargerProduits]);

  const prevPage = useCallback(() => {
    if (pagination.page > 1) {
      chargerProduits(undefined, pagination.page - 1);
    }
  }, [pagination, chargerProduits]);

  const search = useCallback(
    (searchTerm: string, customFilters?: ProduitFilterParams) => {
      chargerProduits(
        {
          ...customFilters,
          search: searchTerm,
        },
        1,
      );
    },
    [chargerProduits],
  );

  const filterByCategory = useCallback(
    (categorieUuid: string) => {
      chargerProduits(
        {
          categorie_uuid: categorieUuid,
        },
        1,
      );
    },
    [chargerProduits],
  );

  const filterByPrice = useCallback(
    (min: number, max: number) => {
      chargerProduits(
        {
          prix_min: min,
          prix_max: max,
        },
        1,
      );
    },
    [chargerProduits],
  );

  const createProduit = useCallback(async (data: ProduitCreateData) => {
    try {
      const nouveauProduit = await produitService.createProduit(data);
      setProduits((prev) => [nouveauProduit, ...prev]);
      return nouveauProduit;
    } catch (err: any) {
      throw err;
    }
  }, []);

  const updateProduit = useCallback(
    async (uuid: string, data: ProduitUpdateData) => {
      try {
        const produitModifie = await produitService.updateProduit(uuid, data);
        setProduits((prev) =>
          prev.map((prod) => (prod.uuid === uuid ? produitModifie : prod)),
        );
        return produitModifie;
      } catch (err: any) {
        throw err;
      }
    },
    [],
  );

  const deleteProduit = useCallback(async (uuid: string) => {
    try {
      await produitService.deleteProduit(uuid);
      setProduits((prev) => prev.filter((prod) => prod.uuid !== uuid));
    } catch (err: any) {
      throw err;
    }
  }, []);

  const publierProduit = useCallback(async (uuid: string) => {
    try {
      const produitPublie = await produitService.publierProduit(uuid);
      setProduits((prev) =>
        prev.map((prod) => (prod.uuid === uuid ? produitPublie : prod)),
      );
      return produitPublie;
    } catch (err: any) {
      throw err;
    }
  }, []);

  const depublierProduit = useCallback(async (uuid: string) => {
    try {
      const produitDepublie = await produitService.depublierProduit(uuid);
      setProduits((prev) =>
        prev.map((prod) => (prod.uuid === uuid ? produitDepublie : prod)),
      );
      return produitDepublie;
    } catch (err: any) {
      throw err;
    }
  }, []);

  useEffect(() => {
    chargerProduitsPublies();
  }, [chargerProduitsPublies]);

  return {
    // Données
    produits,
    loading,
    error,
    pagination,
    facettes,
    filters,

    // Actions
    chargerProduits,
    chargerProduitsPublies,
    search,
    filterByCategory,
    filterByPrice,
    createProduit,
    updateProduit,
    deleteProduit,
    publierProduit,
    depublierProduit,

    // Navigation
    nextPage,
    prevPage,

    // Utilitaires
    hasNextPage: pagination.page < pagination.pages,
    hasPrevPage: pagination.page > 1,
    totalProduits: pagination.total,
  };
}

export function useProduit(uuid?: string) {
  const [produit, setProduit] = useState<Produit | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [variations, setVariations] = useState<ProduitVariation[]>([]);
  const [avis, setAvis] = useState<ProduitAvis[]>([]);
  const [questions, setQuestions] = useState<ProduitQuestion[]>([]);
  const [promotions, setPromotions] = useState<ProduitPromotion[]>([]);
  const [produitsSimilaires, setProduitsSimilaires] = useState<Produit[]>([]);

  const chargerProduit = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const produitData = await produitService.getProduit(id);
      setProduit(produitData);

      // Incrémenter les vues
      await produitService.incrementerVues(id);

      return produitData;
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement du produit");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const chargerVariations = useCallback(async (id: string) => {
    try {
      const variationsData = await produitService.getVariations(id);
      setVariations(variationsData);
      return variationsData;
    } catch (err: any) {
      console.error("Erreur lors du chargement des variations:", err);
      return [];
    }
  }, []);

  const chargerAvis = useCallback(
    async (
      id: string,
      params?: {
        page?: number;
        limit?: number;
        note?: number;
      },
    ) => {
      try {
        const result = await produitService.getAvis(id, params);
        setAvis(result.avis);
        return result;
      } catch (err: any) {
        console.error("Erreur lors du chargement des avis:", err);
        return { avis: [], total: 0, note_moyenne: 0 };
      }
    },
    [],
  );

  const chargerQuestions = useCallback(
    async (
      id: string,
      params?: {
        page?: number;
        limit?: number;
        repondues?: boolean;
      },
    ) => {
      try {
        const result = await produitService.getQuestions(id, params);
        setQuestions(result.questions);
        return result;
      } catch (err: any) {
        console.error("Erreur lors du chargement des questions:", err);
        return { questions: [], total: 0 };
      }
    },
    [],
  );

  const chargerPromotions = useCallback(async (id: string) => {
    try {
      const promotionsData = await produitService.getPromotions(id);
      setPromotions(promotionsData);
      return promotionsData;
    } catch (err: any) {
      console.error("Erreur lors du chargement des promotions:", err);
      return [];
    }
  }, []);

  const chargerProduitsSimilaires = useCallback(
    async (id: string, limit: number = 5) => {
      try {
        const similaires = await produitService.getProduitsSimilaires(
          id,
          limit,
        );
        setProduitsSimilaires(similaires);
        return similaires;
      } catch (err: any) {
        console.error(
          "Erreur lors du chargement des produits similaires:",
          err,
        );
        return [];
      }
    },
    [],
  );

  const creerAvis = useCallback(
    async (avisData: {
      note: number;
      titre?: string;
      commentaire: string;
      avantages?: string[];
      inconvenients?: string[];
      aspects?: {
        qualite?: number;
        rapport_qualite_prix?: number;
        facilite_utilisation?: number;
        design?: number;
        livraison?: number;
      };
      recommandation: boolean;
      photos?: Array<{ url: string; legende?: string }>;
    }) => {
      if (!produit?.uuid) return null;

      try {
        const nouvelAvis = await produitService.createAvis(
          produit.uuid,
          avisData,
        );
        setAvis((prev) => [nouvelAvis, ...prev]);
        return nouvelAvis;
      } catch (err: any) {
        throw err;
      }
    },
    [produit],
  );

  const poserQuestion = useCallback(
    async (question: string) => {
      if (!produit?.uuid) return null;

      try {
        const nouvelleQuestion = await produitService.poserQuestion(
          produit.uuid,
          question,
        );
        setQuestions((prev) => [nouvelleQuestion, ...prev]);
        return nouvelleQuestion;
      } catch (err: any) {
        throw err;
      }
    },
    [produit],
  );

  const verifierDisponibilite = useCallback(
    async (quantite: number = 1) => {
      if (!produit?.uuid) return null;

      try {
        return await produitService.verifierDisponibilite(
          produit.uuid,
          quantite,
        );
      } catch (err: any) {
        throw err;
      }
    },
    [produit],
  );

  useEffect(() => {
    if (uuid) {
      chargerProduit(uuid);
      chargerVariations(uuid);
      chargerAvis(uuid);
      chargerQuestions(uuid);
      chargerPromotions(uuid);
      chargerProduitsSimilaires(uuid);
    }
  }, [
    uuid,
    chargerProduit,
    chargerVariations,
    chargerAvis,
    chargerQuestions,
    chargerPromotions,
    chargerProduitsSimilaires,
  ]);

  const refresh = useCallback(() => {
    if (uuid) {
      chargerProduit(uuid);
      chargerVariations(uuid);
      chargerAvis(uuid);
      chargerQuestions(uuid);
      chargerPromotions(uuid);
      chargerProduitsSimilaires(uuid);
    }
  }, [
    uuid,
    chargerProduit,
    chargerVariations,
    chargerAvis,
    chargerQuestions,
    chargerPromotions,
    chargerProduitsSimilaires,
  ]);

  return {
    // Données
    produit,
    loading,
    error,
    variations,
    avis,
    questions,
    promotions,
    produitsSimilaires,

    // Actions
    refresh,
    chargerVariations,
    chargerAvis,
    chargerQuestions,
    chargerPromotions,
    chargerProduitsSimilaires,
    creerAvis,
    poserQuestion,
    verifierDisponibilite,

    // Méthodes de service (déléguées)
    updateProduit: (data: ProduitUpdateData) =>
      produit?.uuid ? produitService.updateProduit(produit.uuid, data) : null,
    deleteProduit: () =>
      produit?.uuid ? produitService.deleteProduit(produit.uuid) : null,
    publierProduit: () =>
      produit?.uuid ? produitService.publierProduit(produit.uuid) : null,
    depublierProduit: () =>
      produit?.uuid ? produitService.depublierProduit(produit.uuid) : null,
    updateStock: (quantite: number, motif?: string) =>
      produit?.uuid
        ? produitService.updateStock(produit.uuid, quantite, motif)
        : null,

    // Utilitaires
    estDisponible: (produit?.quantite_disponible || 0) > 0,
    estEnPromotion: !!produit?.prix_promotionnel_ht,
    noteMoyenne: produit?.note_moyenne || 0,
    nombreAvis: produit?.nombre_avis || 0,
    prixActuel:
      produit?.prix_promotionnel_ttc || produit?.prix_unitaire_ttc || 0,
    prixOriginal: produit?.prix_promotionnel_ttc
      ? produit?.prix_unitaire_ttc
      : undefined,
    pourcentageReduction: produit?.prix_promotionnel_ttc
      ? ((produit.prix_unitaire_ttc - produit.prix_promotionnel_ttc) /
          produit.prix_unitaire_ttc) *
        100
      : 0,
  };
}

export function useProduitStats(filters?: ProduitFilterParams) {
  const [stats, setStats] = useState<ProduitStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chargerStats = useCallback(
    async (customFilters?: ProduitFilterParams) => {
      setLoading(true);
      setError(null);

      try {
        const statistiques = await produitService.getStatistiques({
          ...filters,
          ...customFilters,
        });
        setStats(statistiques);
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des statistiques");
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    chargerStats();
  }, [chargerStats]);

  return {
    stats,
    loading,
    error,
    chargerStats,
  };
}

export function useProduitConfiguration() {
  const [config, setConfig] = useState<ProduitConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chargerConfiguration = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const configuration = await produitService.getConfiguration();
      setConfig(configuration);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement de la configuration");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    chargerConfiguration();
  }, [chargerConfiguration]);

  return {
    config,
    loading,
    error,
    chargerConfiguration,
  };
}

export function useProduitSearch() {
  const [resultats, setResultats] = useState<ProduitSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rechercher = useCallback(
    async (searchTerm: string, filters?: ProduitFilterParams) => {
      setLoading(true);
      setError(null);

      try {
        const result = await produitService.searchProduits(searchTerm, filters);
        setResultats(result);
      } catch (err: any) {
        setError(err.message || "Erreur lors de la recherche");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const effacerResultats = useCallback(() => {
    setResultats(null);
    setError(null);
  }, []);

  return {
    resultats,
    loading,
    error,
    rechercher,
    effacerResultats,

    // Utilitaires
    aResultats: (resultats?.produits?.length || 0) > 0,
    totalResultats: resultats?.total || 0,
    facettes: resultats?.facettes,
  };
}

export function useProduitValidation() {
  const [validation, setValidation] = useState<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  } | null>(null);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valider = useCallback(
    async (produitData: ProduitCreateData | ProduitUpdateData) => {
      setValidating(true);
      setError(null);

      try {
        const result = await produitService.validerProduit(produitData);
        setValidation(result);
        return result;
      } catch (err: any) {
        setError(err.message || "Erreur lors de la validation");
        throw err;
      } finally {
        setValidating(false);
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setValidation(null);
    setError(null);
  }, []);

  return {
    validation,
    validating,
    error,
    valider,
    reset,
  };
}

export function useProduitInventaire() {
  const [inventaire, setInventaire] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chargerInventaire = useCallback(
    async (filters?: ProduitFilterParams) => {
      setLoading(true);
      setError(null);

      try {
        // Implémentation simplifiée - à adapter selon votre API
        const result = await produitService.getProduits({
          filters: { ...filters, statut: "publie" },
          limit: 50,
        });

        // Transformer les produits en inventaire simplifié
        const inventaireSimplifie = result.produits.map((produit) => ({
          produit_uuid: produit.uuid,
          produit_titre: produit.titre,
          boutique_nom: produit.boutique_nom,
          quantite_disponible: produit.quantite_disponible,
          quantite_reservee: produit.quantite_reservee,
          seuil_alerte:
            produit.quantite_disponible <= (produit.seuil_alerte_stock || 10),
          valeur_stock: produit.quantite_disponible * produit.prix_unitaire_ht,
        }));

        setInventaire(inventaireSimplifie);
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement de l'inventaire");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    inventaire,
    loading,
    error,
    chargerInventaire,

    // Calculs dérivés
    valeurStockTotal: inventaire.reduce(
      (sum, item) => sum + item.valeur_stock,
      0,
    ),
    produitsEnAlerte: inventaire.filter((item) => item.seuil_alerte).length,
    produitsEpuises: inventaire.filter((item) => item.quantite_disponible === 0)
      .length,
  };
}
