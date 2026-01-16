// hooks/usePanier.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import { panierService } from "@/services/panier/panier.service";
import type {
  Panier,
  PanierItem,
  PanierItemCreateData,
  PanierItemUpdateData,
  PanierResume,
  PanierRecommandations,
  PanierStats,
  PanierConfig,
  CodePromotionnel,
  ItemComparaison,
} from "@/services/panier/panier.types";

export function usePanier() {
  const [panier, setPanier] = useState<Panier | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resume, setResume] = useState<PanierResume | null>(null);
  const [recommandations, setRecommandations] =
    useState<PanierRecommandations | null>(null);

  // Charger le panier au démarrage
  const chargerPanier = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const panierCourant = await panierService.getPanierCourant();
      const resumePanier = await panierService.getResumePanier();

      setPanier(panierCourant);
      setResume(resumePanier);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement du panier");
    } finally {
      setLoading(false);
    }
  }, []);

  // Ajouter un item au panier
  const ajouterItem = useCallback(async (itemData: PanierItemCreateData) => {
    setLoading(true);
    setError(null);

    try {
      const nouvelItem = await panierService.ajouterItem(itemData);

      // Mettre à jour le panier local
      setPanier((prev) => {
        if (!prev) return null;

        const itemExistant = prev.items.find(
          (item) =>
            item.article_uuid === nouvelItem.article_uuid &&
            this.areVariationsEqual(item.variations, nouvelItem.variations),
        );

        if (itemExistant) {
          // Mettre à jour la quantité de l'item existant
          return {
            ...prev,
            items: prev.items.map((item) =>
              item.uuid === itemExistant.uuid
                ? { ...item, quantite: item.quantite + nouvelItem.quantite }
                : item,
            ),
            date_modification: new Date().toISOString(),
          };
        } else {
          // Ajouter le nouvel item
          return {
            ...prev,
            items: [...prev.items, nouvelItem],
            items_count: prev.items_count + 1,
            items_unique_count: prev.items_unique_count + 1,
            date_modification: new Date().toISOString(),
          };
        }
      });

      // Recharger le résumé
      const nouveauResume = await panierService.getResumePanier();
      setResume(nouveauResume);

      return nouvelItem;
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'ajout au panier");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Comparer les variations
  const areVariationsEqual = useCallback(
    (var1?: any[], var2?: any[]): boolean => {
      if (!var1 && !var2) return true;
      if (!var1 || !var2) return false;
      if (var1.length !== var2.length) return false;

      return var1.every((v1) =>
        var2.some((v2) => v1.type === v2.type && v1.valeur === v2.valeur),
      );
    },
    [],
  );

  // Modifier la quantité d'un item
  const modifierQuantite = useCallback(
    async (articleUuid: string, quantite: number) => {
      setLoading(true);
      setError(null);

      try {
        const itemModifie = await panierService.modifierQuantite(
          articleUuid,
          quantite,
        );

        // Mettre à jour le panier local
        setPanier((prev) => {
          if (!prev) return null;

          if (quantite === 0) {
            // Supprimer l'item
            return {
              ...prev,
              items: prev.items.filter(
                (item) => item.article_uuid !== articleUuid,
              ),
              items_count: prev.items_count - 1,
              items_unique_count: prev.items_unique_count - 1,
              date_modification: new Date().toISOString(),
            };
          } else {
            // Mettre à jour la quantité
            return {
              ...prev,
              items: prev.items.map((item) =>
                item.article_uuid === articleUuid
                  ? { ...item, quantite }
                  : item,
              ),
              date_modification: new Date().toISOString(),
            };
          }
        });

        // Recharger le résumé
        const nouveauResume = await panierService.getResumePanier();
        setResume(nouveauResume);

        return itemModifie;
      } catch (err: any) {
        setError(
          err.message || "Erreur lors de la modification de la quantité",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Supprimer un item du panier
  const supprimerItem = useCallback(async (articleUuid: string) => {
    setLoading(true);
    setError(null);

    try {
      await panierService.supprimerItem(articleUuid);

      // Mettre à jour le panier local
      setPanier((prev) => {
        if (!prev) return null;

        const itemASupprimer = prev.items.find(
          (item) => item.article_uuid === articleUuid,
        );
        if (!itemASupprimer) return prev;

        return {
          ...prev,
          items: prev.items.filter((item) => item.article_uuid !== articleUuid),
          items_count: prev.items_count - itemASupprimer.quantite,
          items_unique_count: prev.items_unique_count - 1,
          date_modification: new Date().toISOString(),
        };
      });

      // Recharger le résumé
      const nouveauResume = await panierService.getResumePanier();
      setResume(nouveauResume);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la suppression de l'item");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Vider complètement le panier
  const viderPanier = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nouveauPanier = await panierService.viderPanier();

      setPanier(nouveauPanier);
      setResume({
        items_count: 0,
        articles_uniques: 0,
        sous_total: 0,
        total_reductions: 0,
        total_livraison: 0,
        total_general: 0,
        devise: "EUR",
        boutique_count: 0,
        vendeur_count: 0,
        produits_epuises: 0,
        produits_en_alerte: 0,
      });
    } catch (err: any) {
      setError(err.message || "Erreur lors du vidage du panier");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Appliquer un code promotionnel
  const appliquerCodePromo = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);

    try {
      const panierModifie = await panierService.appliquerCodePromo(code);

      setPanier(panierModifie);

      // Recharger le résumé
      const nouveauResume = await panierService.getResumePanier();
      setResume(nouveauResume);

      return panierModifie;
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'application du code promo");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les recommandations
  const chargerRecommandations = useCallback(async () => {
    try {
      const recos = await panierService.getRecommandations();
      setRecommandations(recos);
    } catch (err: any) {
      console.error("Erreur lors du chargement des recommandations:", err);
    }
  }, []);

  // Calculer le total par boutique
  const calculerTotalParBoutique = useMemo(() => {
    if (!panier) return {};

    return panier.items.reduce(
      (acc, item) => {
        const boutiqueUuid = item.boutique_uuid || "inconnu";
        const boutiqueNom = item.boutique_nom || "Boutique inconnue";

        if (!acc[boutiqueUuid]) {
          acc[boutiqueUuid] = {
            nom: boutiqueNom,
            total: 0,
            items_count: 0,
          };
        }

        acc[boutiqueUuid].total += item.prix_total;
        acc[boutiqueUuid].items_count += item.quantite;

        return acc;
      },
      {} as Record<string, { nom: string; total: number; items_count: number }>,
    );
  }, [panier]);

  // Vérifier la disponibilité
  const verifierDisponibilite = useCallback(async () => {
    try {
      return await panierService.verifierDisponibilite();
    } catch (err: any) {
      console.error("Erreur lors de la vérification de disponibilité:", err);
      return [];
    }
  }, []);

  // Calculer les taxes
  const calculerTaxes = useCallback(async () => {
    try {
      return await panierService.calculerTaxes();
    } catch (err: any) {
      console.error("Erreur lors du calcul des taxes:", err);
      throw err;
    }
  }, []);

  // Effet de chargement initial
  useEffect(() => {
    chargerPanier();
    chargerRecommandations();
  }, [chargerPanier, chargerRecommandations]);

  return {
    // Données
    panier,
    resume,
    recommandations,
    loading,
    error,

    // Actions principales
    chargerPanier,
    ajouterItem,
    modifierQuantite,
    supprimerItem,
    viderPanier,
    appliquerCodePromo,

    // Calculs et vérifications
    calculerTotalParBoutique,
    verifierDisponibilite,
    calculerTaxes,
    chargerRecommandations,

    // Utilitaires
    nombreItems: resume?.items_count || 0,
    estVide: (resume?.items_count || 0) === 0,
    totalGeneral: resume?.total_general || 0,
    sousTotal: resume?.sous_total || 0,
    totalLivraison: resume?.total_livraison || 0,
    totalReductions: resume?.total_reductions || 0,

    // Métadonnées
    boutiqueCount: resume?.boutique_count || 0,
    produitsEpuises: resume?.produits_epuises || 0,
    produitsEnAlerte: resume?.produits_en_alerte || 0,
    devise: resume?.devise || "EUR",
  };
}

export function usePanierStats(filters?: any) {
  const [stats, setStats] = useState<PanierStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chargerStats = useCallback(
    async (customFilters?: any) => {
      setLoading(true);
      setError(null);

      try {
        const statistiques = await panierService.getStatistiques({
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

export function usePanierConfiguration() {
  const [config, setConfig] = useState<PanierConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chargerConfiguration = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const configuration = await panierService.getConfiguration();
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

export function useCodePromotionnel() {
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(
    null,
  );
  const [codeValide, setCodeValide] = useState<CodePromotionnel | null>(null);

  const verifierCode = useCallback(async (code: string) => {
    setVerificationLoading(true);
    setVerificationError(null);
    setCodeValide(null);

    try {
      const codeInfo = await panierService.verifierCodePromo(code);
      setCodeValide(codeInfo);
      return codeInfo;
    } catch (err: any) {
      setVerificationError(err.message || "Code promotionnel invalide");
      throw err;
    } finally {
      setVerificationLoading(false);
    }
  }, []);

  const resetVerification = useCallback(() => {
    setCodeValide(null);
    setVerificationError(null);
  }, []);

  return {
    codeValide,
    verificationLoading,
    verificationError,
    verifierCode,
    resetVerification,
  };
}

export function usePanierItemsComparaison() {
  const [comparaison, setComparaison] = useState<ItemComparaison[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const comparerItems = useCallback(async (articleUuids: string[]) => {
    setLoading(true);
    setError(null);
    setComparaison([]);

    try {
      const result = await panierService.comparerItems(articleUuids);
      setComparaison(result);
      return result;
    } catch (err: any) {
      setError(err.message || "Erreur lors de la comparaison des articles");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetComparaison = useCallback(() => {
    setComparaison([]);
    setError(null);
  }, []);

  return {
    comparaison,
    loading,
    error,
    comparerItems,
    resetComparaison,
  };
}

export function usePanierLocalStorage() {
  const STORAGE_KEY = "panier_local";

  const sauvegarderLocalement = useCallback((panierData: any) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(panierData));
      return true;
    } catch (error) {
      console.error("Erreur lors de la sauvegarde locale:", error);
      return false;
    }
  }, []);

  const chargerLocalement = useCallback(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Erreur lors du chargement local:", error);
      return null;
    }
  }, []);

  const supprimerLocalement = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression locale:", error);
      return false;
    }
  }, []);

  const synchroniserAvecServeur = useCallback(async () => {
    try {
      const panierLocal = chargerLocalement();
      if (!panierLocal) return null;

      const syncData = await panierService.synchroniserPaniers(panierLocal);
      supprimerLocalement(); // Nettoyer après synchronisation

      return syncData;
    } catch (error) {
      console.error("Erreur lors de la synchronisation:", error);
      throw error;
    }
  }, [chargerLocalement, supprimerLocalement]);

  return {
    sauvegarderLocalement,
    chargerLocalement,
    supprimerLocalement,
    synchroniserAvecServeur,
  };
}
