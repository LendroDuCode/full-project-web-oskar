// services/civilites/civilite.service.ts
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import type {
  Civilite,
  CiviliteCreateData,
  CiviliteUpdateData,
  CiviliteFilterParams,
  CivilitePaginationParams,
  CiviliteStats,
  CiviliteUsageStats,
  CiviliteValidationResult,
  CiviliteImportData,
  CiviliteExportOptions,
  CiviliteBulkUpdate,
  CiviliteWithUsage,
  CiviliteFormOptions,
  CiviliteSuggestion,
  CiviliteMapping,
  CiviliteMergeRequest,
  CiviliteTranslation,
  CiviliteTemplate,
  CiviliteImportResult,
  CiviliteContext,
  CiviliteRecommendation,
  CiviliteHistory,
  CiviliteAuditLog,
} from "./civilite.types";

// Interface pour les réponses API standardisées
export interface ApiResponse<T> {
  data: T;
  status: string;
  message?: string;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
}

// Service principal pour gérer les civilités
export const civiliteService = {
  // ==================== OPÉRATIONS CRUD ====================

  // Récupérer la liste des civilités avec pagination et filtres
  async getCivilites(params?: CivilitePaginationParams): Promise<{
    civilites: Civilite[];
    count?: number;
    total?: number;
    page?: number;
    pages?: number;
  }> {
    const queryParams = new URLSearchParams();

    // Ajouter les paramètres de pagination et de tri
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);

    // Ajouter les filtres
    if (params?.filters) {
      const filters = params.filters;
      if (filters.genre) queryParams.append("genre", filters.genre);
      if (filters.est_actif !== undefined)
        queryParams.append("est_actif", filters.est_actif.toString());
      if (filters.est_visible_formulaire !== undefined)
        queryParams.append(
          "est_visible_formulaire",
          filters.est_visible_formulaire.toString(),
        );
      if (filters.pays_code) queryParams.append("pays_code", filters.pays_code);
    }

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.CIVILITES.LIST}?${queryString}`
      : API_ENDPOINTS.CIVILITES.LIST;

    console.log("📡 Récupération des civilités depuis:", endpoint);

    try {
      const response = await api.get(endpoint);

      console.log("📦 Réponse brute des civilités:", {
        response: response,
        status: response.status,
        data: response.data,
        isArray: Array.isArray(response.data),
      });

      let civilites: Civilite[] = [];

      // Vérifier différentes structures de réponse possibles
      if (Array.isArray(response.data)) {
        // Cas 1: La réponse est directement un tableau
        civilites = response.data;
        console.log("✅ Réponse directe sous forme de tableau");
      } else if (response.data && Array.isArray(response.data.data)) {
        // Cas 2: Structure { data: [...] }
        civilites = response.data.data;
        console.log("✅ Réponse encapsulée (data.data)");
      } else if (response.data && Array.isArray(response.data.civilites)) {
        // Cas 3: Structure { civilites: [...] }
        civilites = response.data.civilites;
        console.log("✅ Réponse encapsulée (data.civilites)");
      } else if (response.data && typeof response.data === "object") {
        // Cas 4: C'est un objet mais pas un tableau
        const keys = Object.keys(response.data);
        const arrayKey = keys.find((key) => Array.isArray(response.data[key]));
        if (arrayKey) {
          civilites = response.data[arrayKey];
          console.log(`✅ Tableau trouvé dans la clé: ${arrayKey}`);
        } else {
          console.warn("⚠️ Aucun tableau trouvé dans la réponse");
        }
      } else {
        console.warn("⚠️ Format de réponse inattendu:", response.data);
      }

      const count = civilites.length;
      const total = civilites.length;
      const page = params?.page || 1;
      const pages = Math.ceil(total / (params?.limit || 10));

      return { civilites, count, total, page, pages };
    } catch (error: any) {
      console.error("🚨 Erreur dans civiliteService.getCivilites:", {
        message: error.message,
        response: error.response?.data,
      });
      return { civilites: [], count: 0, total: 0, page: 1, pages: 1 };
    }
  },

  // Récupérer les options de civilités pour les sélecteurs (dropdowns)
  async getCiviliteOptionsForSelect(options?: {
    genre?: string;
    est_actif?: boolean;
  }): Promise<Array<{ value: string; label: string; data: Civilite }>> {
    try {
      console.log("📋 Récupération des options de civilités pour sélecteur");

      const { civilites } = await this.getCivilites({
        filters: {
          est_actif: options?.est_actif ?? true,
          genre: options?.genre,
          est_visible_formulaire: true,
        },
        sort_by: "ordre",
        sort_order: "asc",
      });

      console.log(
        "✅ Civilités trouvées pour le formulaire:",
        civilites.length,
      );

      return civilites.map((civilite) => ({
        value: civilite.uuid,
        label: `${civilite.libelle} (${civilite.code})`,
        data: civilite,
      }));
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des options:", error);
      return [];
    }
  },

  // Récupérer une civilité spécifique par son UUID
  async getCivilite(uuid: string): Promise<Civilite> {
    try {
      console.log("🔍 Récupération de la civilité:", uuid);

      const response = await api.get<ApiResponse<Civilite>>(
        API_ENDPOINTS.CIVILITES.DETAIL(uuid),
      );

      console.log("✅ Réponse de la civilité:", {
        hasData: !!response.data,
        dataType: typeof response.data,
      });

      let civiliteData: Civilite;

      // Vérifier la structure de la réponse
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        // Structure: { data: {...}, status: "success" }
        civiliteData = (response.data as any).data;
      } else if (response.data && (response.data as any).uuid) {
        // Structure: la civilité directement
        civiliteData = response.data as Civilite;
      } else {
        console.error(
          "❌ Structure de données civilité invalide:",
          response.data,
        );
        throw new Error("Structure de données civilité invalide");
      }

      if (!civiliteData || !civiliteData.uuid) {
        throw new Error("Civilité non trouvée");
      }

      console.log("✅ Civilité trouvée:", civiliteData.libelle);
      return civiliteData;
    } catch (error: any) {
      console.error("❌ Erreur lors de la récupération de la civilité:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },

  // Récupérer une civilité par son slug
  async getCiviliteBySlug(slug: string): Promise<Civilite> {
    try {
      console.log("🔍 Récupération de la civilité par slug:", slug);

      const response = await api.get<ApiResponse<Civilite>>(
        API_ENDPOINTS.CIVILITES.BY_SLUG(slug),
      );

      let civiliteData: Civilite;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        civiliteData = (response.data as any).data;
      } else if (response.data && (response.data as any).uuid) {
        civiliteData = response.data as Civilite;
      } else {
        throw new Error("Civilité non trouvée");
      }

      if (!civiliteData || !civiliteData.uuid) {
        throw new Error("Civilité non trouvée");
      }

      console.log("✅ Civilité trouvée par slug:", civiliteData.libelle);
      return civiliteData;
    } catch (error: any) {
      console.error("❌ Erreur lors de la récupération par slug:", error);
      throw error;
    }
  },

  // Créer une nouvelle civilité
  async createCivilite(civiliteData: CiviliteCreateData): Promise<Civilite> {
    try {
      console.log("🆕 Création d'une nouvelle civilité:", civiliteData.libelle);

      // Valider les données avant envoi
      const validation = await this.validateCivilite(civiliteData);
      if (!validation.isValid) {
        throw new Error(`Validation échouée: ${validation.errors.join(", ")}`);
      }

      const response = await api.post<ApiResponse<Civilite>>(
        API_ENDPOINTS.CIVILITES.CREATE,
        civiliteData,
      );

      console.log("✅ Réponse de création de civilité:", response.data);

      // Vérifier la structure de la réponse
      let createdCivilite: Civilite;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        createdCivilite = (response.data as any).data;
      } else {
        createdCivilite = response.data as Civilite;
      }

      if (!createdCivilite || !createdCivilite.uuid) {
        throw new Error("Échec de la création de la civilité");
      }

      return createdCivilite;
    } catch (error: any) {
      console.error("❌ Erreur lors de la création de la civilité:", {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  // Mettre à jour une civilité existante
  async updateCivilite(
    uuid: string,
    civiliteData: CiviliteUpdateData,
  ): Promise<Civilite> {
    try {
      console.log("✏️ Mise à jour de la civilité:", uuid);

      // Valider les données avant envoi
      if (civiliteData.code || civiliteData.slug) {
        const validation = await this.validateCivilite(
          civiliteData as CiviliteCreateData,
          uuid,
        );
        if (!validation.isValid && validation.errors.length > 0) {
          throw new Error(
            `Validation échouée: ${validation.errors.join(", ")}`,
          );
        }
      }

      const response = await api.put<ApiResponse<Civilite>>(
        API_ENDPOINTS.CIVILITES.UPDATE(uuid),
        civiliteData,
      );

      console.log("✅ Réponse de mise à jour de la civilité:", response.data);

      // Vérifier la structure de la réponse
      let updatedCivilite: Civilite;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        updatedCivilite = (response.data as any).data;
      } else {
        updatedCivilite = response.data as Civilite;
      }

      return updatedCivilite;
    } catch (error: any) {
      console.error("❌ Erreur lors de la mise à jour de la civilité:", error);
      throw error;
    }
  },

  // Supprimer une civilité
  async deleteCivilite(uuid: string): Promise<void> {
    try {
      console.log("🗑️ Suppression de la civilité:", uuid);

      await api.delete(API_ENDPOINTS.CIVILITES.DELETE(uuid));

      console.log("✅ Civilité supprimée avec succès");
    } catch (error: any) {
      console.error("❌ Erreur lors de la suppression de la civilité:", error);
      throw error;
    }
  },

  // ==================== LISTES SPÉCIALISÉES ====================

  // Récupérer les civilités actives
  async getActiveCivilites(): Promise<Civilite[]> {
    try {
      console.log("✅ Récupération des civilités actives");

      const { civilites } = await this.getCivilites({
        filters: { est_actif: true },
        sort_by: "ordre",
        sort_order: "asc",
      });

      console.log("✅", civilites.length, "civilités actives trouvées");
      return civilites;
    } catch (error: any) {
      console.error(
        "❌ Erreur lors de la récupération des civilités actives:",
        error,
      );
      throw error;
    }
  },

  // Récupérer les civilités par défaut
  async getDefaultCivilites(): Promise<Civilite[]> {
    try {
      console.log("⭐ Récupération des civilités par défaut");

      const { civilites } = await this.getCivilites({
        filters: { est_par_defaut: true, est_actif: true },
        sort_by: "ordre",
        sort_order: "asc",
      });

      console.log("✅", civilites.length, "civilités par défaut trouvées");
      return civilites;
    } catch (error: any) {
      console.error(
        "❌ Erreur lors de la récupération des civilités par défaut:",
        error,
      );
      throw error;
    }
  },

  // Récupérer les civilités pour les formulaires
  async getCivilitesForForm(
    options?: CiviliteFormOptions,
  ): Promise<Civilite[]> {
    try {
      console.log("📝 Récupération des civilités pour formulaire");

      const filters: CiviliteFilterParams = {
        est_actif: true,
        est_visible_formulaire: true,
      };

      if (options?.filterByCountry) {
        filters.pays_code = options.filterByCountry;
      }

      if (options?.filterByAge !== undefined) {
        filters.age = options.filterByAge;
      }

      if (options?.filterByProfession) {
        filters.profession = options.filterByProfession;
      }

      if (!options?.includeNeutral) {
        filters.genre = "mixte";
      }

      const { civilites } = await this.getCivilites({
        filters,
        sort_by: "ordre",
        sort_order: "asc",
      });

      console.log(
        "✅",
        civilites.length,
        "civilités trouvées pour le formulaire",
      );
      return civilites;
    } catch (error: any) {
      console.error(
        "❌ Erreur lors de la récupération des civilités pour formulaire:",
        error,
      );
      throw error;
    }
  },

  // Récupérer les civilités par genre
  async getCivilitesByGenre(genre: Civilite["genre"]): Promise<Civilite[]> {
    try {
      console.log("🚻 Récupération des civilités par genre:", genre);

      const { civilites } = await this.getCivilites({
        filters: { genre, est_actif: true },
        sort_by: "ordre",
        sort_order: "asc",
      });

      console.log(
        "✅",
        civilites.length,
        "civilités trouvées pour le genre",
        genre,
      );
      return civilites;
    } catch (error: any) {
      console.error(
        "❌ Erreur lors de la récupération des civilités par genre:",
        error,
      );
      throw error;
    }
  },

  // Récupérer les civilités par usage
  async getCivilitesByUsage(usage: Civilite["usage"]): Promise<Civilite[]> {
    try {
      console.log("🏢 Récupération des civilités par usage:", usage);

      const { civilites } = await this.getCivilites({
        filters: { usage, est_actif: true },
        sort_by: "ordre",
        sort_order: "asc",
      });

      console.log(
        "✅",
        civilites.length,
        "civilités trouvées pour l'usage",
        usage,
      );
      return civilites;
    } catch (error: any) {
      console.error(
        "❌ Erreur lors de la récupération des civilités par usage:",
        error,
      );
      throw error;
    }
  },

  // ==================== STATISTIQUES & ANALYTICS ====================

  // Obtenir les statistiques générales des civilités
  async getCiviliteStats(): Promise<CiviliteStats> {
    try {
      console.log("📊 Récupération des statistiques des civilités");

      // Récupérer toutes les civilités
      const { civilites } = await this.getCivilites({
        limit: 1000,
        filters: { include_inactives: true },
      });

      // Calculer les statistiques
      const stats: CiviliteStats = {
        total_civilites: civilites.length,
        civilites_actives: civilites.filter((c) => c.est_actif).length,
        civilites_inactives: civilites.filter((c) => !c.est_actif).length,
        civilites_par_defaut: civilites.filter((c) => c.est_par_defaut).length,

        par_genre: {},
        par_usage: {},
        par_pays: {},

        utilisations_total: civilites.reduce(
          (sum, c) => sum + (c.nombre_utilisations || 0),
          0,
        ),

        repartition_utilisateurs: {
          utilisateurs: civilites.reduce(
            (sum, c) => sum + (c.utilisateurs_count || 0),
            0,
          ),
          vendeurs: civilites.reduce(
            (sum, c) => sum + (c.vendeurs_count || 0),
            0,
          ),
          agents: civilites.reduce((sum, c) => sum + (c.agents_count || 0), 0),
          admins: 0, // À calculer si disponible
        },
      };

      // Calculer les distributions
      civilites.forEach((civilite) => {
        // Par genre
        const genre = civilite.genre;
        stats.par_genre[genre] = (stats.par_genre[genre] || 0) + 1;

        // Par usage
        const usage = civilite.usage;
        stats.par_usage[usage] = (stats.par_usage[usage] || 0) + 1;

        // Par pays (si restrictions définies)
        if (civilite.restrictions_pays) {
          civilite.restrictions_pays.forEach((pays) => {
            stats.par_pays[pays] = (stats.par_pays[pays] || 0) + 1;
          });
        }
      });

      // Trouver la civilité la plus utilisée
      const civilitesAvecUtilisations = civilites.filter(
        (c) => (c.nombre_utilisations || 0) > 0,
      );
      if (civilitesAvecUtilisations.length > 0) {
        const plusUtilisee = civilitesAvecUtilisations.reduce((max, c) =>
          (c.nombre_utilisations || 0) > (max.nombre_utilisations || 0)
            ? c
            : max,
        );

        stats.civilite_plus_utilisee = {
          uuid: plusUtilisee.uuid,
          code: plusUtilisee.code,
          libelle: plusUtilisee.libelle,
          count: plusUtilisee.nombre_utilisations || 0,
        };

        // Trouver la civilité la moins utilisée
        const moinsUtilisee = civilitesAvecUtilisations.reduce((min, c) =>
          (c.nombre_utilisations || 0) < (min.nombre_utilisations || 0)
            ? c
            : min,
        );

        stats.civilite_moins_utilisee = {
          uuid: moinsUtilisee.uuid,
          code: moinsUtilisee.code,
          libelle: moinsUtilisee.libelle,
          count: moinsUtilisee.nombre_utilisations || 0,
        };
      }

      console.log("✅ Statistiques des civilités calculées:", stats);
      return stats;
    } catch (error: any) {
      console.error(
        "❌ Erreur lors de la récupération des statistiques:",
        error,
      );
      throw error;
    }
  },

  // Obtenir les statistiques d'utilisation des civilités
  async getCiviliteUsageStats(periode?: {
    debut: string;
    fin: string;
  }): Promise<CiviliteUsageStats> {
    try {
      console.log(
        "📈 Récupération des statistiques d'utilisation des civilités",
      );

      const endpoint = "/civilites/stats/usage";
      const response = await api.get<ApiResponse<CiviliteUsageStats>>(
        endpoint,
        {
          params: periode,
        },
      );

      // Structure par défaut
      const defaultStats: CiviliteUsageStats = {
        periode: periode || {
          debut: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 jours
          fin: new Date().toISOString(),
        },
        total_utilisations: 0,
        par_civilite: [],
        par_mois: [],
        par_type_utilisateur: {
          utilisateurs: 0,
          vendeurs: 0,
          agents: 0,
        },
      };

      let stats = defaultStats;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        stats = { ...defaultStats, ...(response.data as any).data };
      } else if (response.data && typeof response.data === "object") {
        stats = { ...defaultStats, ...response.data };
      }

      console.log("✅ Statistiques d'utilisation récupérées");
      return stats;
    } catch (error: any) {
      console.error(
        "❌ Erreur lors de la récupération des statistiques d'utilisation:",
        error,
      );
      throw error;
    }
  },

  // Récupérer une civilité avec ses statistiques d'utilisation
  async getCiviliteWithUsage(uuid: string): Promise<CiviliteWithUsage> {
    try {
      console.log(
        "📊 Récupération de la civilité avec statistiques d'utilisation:",
        uuid,
      );

      const [civilite, usageStats] = await Promise.all([
        this.getCivilite(uuid),
        this.getCiviliteUsageStats(),
      ]);

      const civiliteWithUsage: CiviliteWithUsage = {
        ...civilite,
        utilisations: {
          total: civilite.nombre_utilisations || 0,
          par_mois: usageStats.par_mois
            .filter((mois) =>
              usageStats.par_civilite.some((c) => c.civilite.uuid === uuid),
            )
            .map((mois) => ({
              mois: mois.mois,
              count: mois.utilisations,
            })),
          par_type: {
            utilisateurs: civilite.utilisateurs_count || 0,
            vendeurs: civilite.vendeurs_count || 0,
            agents: civilite.agents_count || 0,
          },
        },
      };

      console.log("✅ Civilité avec statistiques d'utilisation récupérée");
      return civiliteWithUsage;
    } catch (error: any) {
      console.error(
        "❌ Erreur lors de la récupération de la civilité avec statistiques:",
        error,
      );
      throw error;
    }
  },

  // ==================== VALIDATION ====================

  // Valider les données d'une civilité
  async validateCivilite(
    civiliteData: CiviliteCreateData | CiviliteUpdateData,
    excludeUuid?: string,
  ): Promise<CiviliteValidationResult> {
    try {
      console.log("✅ Validation des données de la civilité");

      const errors: string[] = [];
      const warnings: string[] = [];
      const suggestions: string[] = [];

      // Validation de base
      if ("code" in civiliteData && civiliteData.code) {
        if (!civiliteData.code.trim()) {
          errors.push("Le code de la civilité est obligatoire");
        } else if (civiliteData.code.length > 10) {
          errors.push("Le code ne doit pas dépasser 10 caractères");
        } else if (!/^[A-Z]+$/.test(civiliteData.code)) {
          warnings.push(
            "Le code devrait être en lettres majuscules sans accents",
          );
        } else {
          // Vérifier si le code est disponible
          const isAvailable = await this.isCodeAvailable(
            civiliteData.code,
            excludeUuid,
          );
          if (!isAvailable) {
            errors.push("Ce code est déjà utilisé par une autre civilité");
          }
        }
      }

      if ("libelle" in civiliteData && civiliteData.libelle) {
        if (!civiliteData.libelle.trim()) {
          errors.push("Le libellé est obligatoire");
        } else if (civiliteData.libelle.length < 2) {
          errors.push("Le libellé doit contenir au moins 2 caractères");
        } else if (civiliteData.libelle.length > 50) {
          errors.push("Le libellé ne doit pas dépasser 50 caractères");
        }
      }

      if ("libelle_court" in civiliteData && civiliteData.libelle_court) {
        if (civiliteData.libelle_court.length > 10) {
          warnings.push(
            "Le libellé court est trop long pour certains affichages",
          );
        }
      }

      if ("genre" in civiliteData) {
        const validGenres = ["masculin", "feminin", "neutre", "mixte"];
        if (!validGenres.includes(civiliteData.genre)) {
          errors.push("Genre invalide");
        }
      }

      if ("usage" in civiliteData) {
        const validUsages = [
          "formel",
          "informel",
          "professionnel",
          "academique",
          "honorifique",
        ];
        if (!validUsages.includes(civiliteData.usage)) {
          errors.push("Usage invalide");
        }
      }

      // Validation des restrictions d'âge
      if ("age_minimum" in civiliteData && "age_maximum" in civiliteData) {
        if (
          civiliteData.age_minimum !== undefined &&
          civiliteData.age_maximum !== undefined
        ) {
          if (civiliteData.age_minimum > civiliteData.age_maximum) {
            errors.push(
              "L'âge minimum ne peut pas être supérieur à l'âge maximum",
            );
          }
        }
      }

      // Suggestions
      if (!("description" in civiliteData) || !civiliteData.description) {
        suggestions.push(
          "Ajoutez une description pour clarifier l'usage de cette civilité",
        );
      }

      if (
        !("restrictions_pays" in civiliteData) ||
        !civiliteData.restrictions_pays?.length
      ) {
        suggestions.push("Spécifiez les pays où cette civilité est applicable");
      }

      if (!("traductions" in civiliteData) || !civiliteData.traductions) {
        suggestions.push("Ajoutez des traductions pour l'internationalisation");
      }

      const isValid = errors.length === 0;

      return {
        isValid,
        errors,
        warnings,
        suggestions,
        code_available:
          !("code" in civiliteData) ||
          (await this.isCodeAvailable(civiliteData.code || "", excludeUuid)),
        slug_available:
          !("slug" in civiliteData) ||
          (await this.isSlugAvailable(civiliteData.slug || "", excludeUuid)),
      };
    } catch (error: any) {
      console.error("❌ Erreur lors de la validation de la civilité:", error);
      throw error;
    }
  },

  // Vérifier si un code est disponible
  async isCodeAvailable(code: string, excludeUuid?: string): Promise<boolean> {
    try {
      // Chercher une civilité avec ce code
      const { civilites } = await this.getCivilites({
        filters: { search: code },
      });

      const existing = civilites.find((c) => c.code === code);
      return !existing || existing.uuid === excludeUuid;
    } catch {
      return true;
    }
  },

  // Vérifier si un slug est disponible
  async isSlugAvailable(slug: string, excludeUuid?: string): Promise<boolean> {
    try {
      // Essayer de récupérer une civilité avec ce slug
      const civilite = await this.getCiviliteBySlug(slug);
      return !civilite || civilite.uuid === excludeUuid;
    } catch {
      // Si on a une erreur (404), le slug est disponible
      return true;
    }
  },

  // ==================== RECOMMANDATIONS ====================

  // Recommander une civilité en fonction du contexte
  async recommendCivilite(
    context: CiviliteContext,
  ): Promise<CiviliteRecommendation[]> {
    try {
      console.log("💡 Recommandation de civilité pour le contexte:", context);

      // Récupérer les civilités applicables
      const civilites = await this.getCivilitesByCountry(context.pays);

      // Filtrer et scorer les civilités
      const recommendations: CiviliteRecommendation[] = civilites.map(
        (civilite) => {
          let score = 100;
          const raisons: string[] = [];

          // Vérifier le genre
          if (
            context.genre_prefere &&
            civilite.genre !== context.genre_prefere
          ) {
            score -= 30;
            raisons.push("Genre non préféré");
          }

          // Vérifier l'âge
          if (civilite.age_minimum !== undefined && context.age !== undefined) {
            if (context.age < civilite.age_minimum) {
              score -= 40;
              raisons.push("Âge inférieur au minimum");
            }
          }
          if (civilite.age_maximum !== undefined && context.age !== undefined) {
            if (context.age > civilite.age_maximum) {
              score -= 40;
              raisons.push("Âge supérieur au maximum");
            }
          }

          // Vérifier la profession
          if (civilite.professions_associees && context.profession) {
            if (!civilite.professions_associees.includes(context.profession)) {
              score -= 20;
              raisons.push("Profession non associée");
            } else {
              score += 20;
              raisons.push("Profession associée");
            }
          }

          // Vérifier le contexte
          if (civilite.usage !== context.contexte) {
            score -= 15;
            raisons.push(
              `Contexte ${context.contexte} mais usage ${civilite.usage}`,
            );
          }

          // Vérifier la formalité
          if (civilite.usage !== context.formalite) {
            score -= 10;
            raisons.push(
              `Formalité ${context.formalite} mais usage ${civilite.usage}`,
            );
          }

          // Bonus pour les civilités par défaut
          if (civilite.est_par_defaut) {
            score += 10;
            raisons.push("Civilité par défaut");
          }

          return {
            civilite,
            pertinence: Math.max(0, score), // Ne pas descendre en dessous de 0
            raisons,
            alternatives: [],
          };
        },
      );

      // Trier par pertinence
      recommendations.sort((a, b) => b.pertinence - a.pertinence);

      // Ajouter des alternatives (top 3 après la meilleure)
      const topRecommendation = recommendations[0];
      if (topRecommendation) {
        topRecommendation.alternatives = recommendations.slice(1, 4);
      }

      console.log("✅", recommendations.length, "recommandations générées");
      return recommendations.slice(0, 5); // Retourner les 5 meilleures
    } catch (error: any) {
      console.error(
        "❌ Erreur lors de la génération des recommandations:",
        error,
      );
      throw error;
    }
  },

  // Obtenir des suggestions de civilités basées sur un terme de recherche
  async getCiviliteSuggestions(
    searchTerm: string,
    limit: number = 5,
  ): Promise<CiviliteSuggestion[]> {
    try {
      console.log("🔍 Génération de suggestions pour:", searchTerm);

      const { civilites } = await this.getCivilites({
        search: searchTerm,
        limit: 10,
      });

      const suggestions: CiviliteSuggestion[] = civilites.map((civilite) => {
        let score = 0;
        const raisons: string[] = [];

        // Score basé sur la correspondance du libellé
        if (civilite.libelle.toLowerCase().includes(searchTerm.toLowerCase())) {
          score += 40;
          raisons.push("Correspondance exacte du libellé");
        } else if (
          civilite.libelle_court
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        ) {
          score += 30;
          raisons.push("Correspondance du libellé court");
        }

        // Score basé sur le code
        if (civilite.code.toLowerCase() === searchTerm.toLowerCase()) {
          score += 50;
          raisons.push("Code exact");
        }

        // Score basé sur les mots-clés
        if (
          civilite.mots_cles?.some((mot) =>
            mot.toLowerCase().includes(searchTerm.toLowerCase()),
          )
        ) {
          score += 20;
          raisons.push("Correspondance dans les mots-clés");
        }

        // Bonus pour les civilités actives
        if (civilite.est_actif) {
          score += 10;
          raisons.push("Civilité active");
        }

        return {
          civilite,
          score,
          reason: raisons.join(", "),
        };
      });

      // Trier par score et limiter
      suggestions.sort((a, b) => b.score - a.score);

      console.log("✅", suggestions.length, "suggestions générées");
      return suggestions.slice(0, limit);
    } catch (error: any) {
      console.error("❌ Erreur lors de la génération des suggestions:", error);
      throw error;
    }
  },

  // ==================== OPÉRATIONS EN MASSE ====================

  // Mettre à jour plusieurs civilités en une seule requête
  async bulkUpdateCivilites(
    bulkUpdate: CiviliteBulkUpdate,
  ): Promise<Civilite[]> {
    try {
      console.log(
        "🔄 Mise à jour en masse de",
        bulkUpdate.uuids.length,
        "civilités",
      );

      const endpoint = "/civilites/bulk-update";
      const response = await api.post<ApiResponse<Civilite[]>>(
        endpoint,
        bulkUpdate,
      );

      let updatedCivilites: Civilite[] = [];
      if (Array.isArray(response.data)) {
        updatedCivilites = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        updatedCivilites = (response.data as any).data || [];
      }

      console.log(
        "✅",
        updatedCivilites.length,
        "civilités mises à jour en masse",
      );
      return updatedCivilites;
    } catch (error: any) {
      console.error("❌ Erreur lors de la mise à jour en masse:", error);
      throw error;
    }
  },

  // Activer ou désactiver plusieurs civilités en une seule requête
  async bulkToggleActivation(
    uuids: string[],
    activate: boolean,
  ): Promise<Civilite[]> {
    try {
      console.log(
        `🔄 ${activate ? "Activation" : "Désactivation"} de`,
        uuids.length,
        "civilités",
      );

      const updates: CiviliteUpdateData = { est_actif: activate };
      const result = await this.bulkUpdateCivilites({ uuids, updates });

      console.log(
        `✅ ${activate ? "Activées" : "Désactivées"}:`,
        result.length,
        "civilités",
      );
      return result;
    } catch (error: any) {
      console.error("❌ Erreur lors du changement d'état en masse:", error);
      throw error;
    }
  },

  // Supprimer plusieurs civilités en une seule requête
  async bulkDeleteCivilites(
    uuids: string[],
  ): Promise<{ deleted: number; errors: string[] }> {
    try {
      console.log("🗑️ Suppression en masse de", uuids.length, "civilités");

      const endpoint = "/civilites/bulk-delete";
      const response = await api.post<
        ApiResponse<{ deleted: number; errors: string[] }>
      >(endpoint, { uuids });

      let result: { deleted: number; errors: string[] };
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        result = (response.data as any).data;
      } else {
        result = response.data as { deleted: number; errors: string[] };
      }

      console.log(
        "✅ Suppression en masse terminée:",
        result.deleted,
        "supprimées,",
        result.errors.length,
        "erreurs",
      );
      return result;
    } catch (error: any) {
      console.error("❌ Erreur lors de la suppression en masse:", error);
      throw error;
    }
  },

  // ==================== IMPORT & EXPORT ====================

  // Importer des civilités depuis un fichier ou des données brutes
  async importCivilites(
    data: CiviliteImportData[],
    options?: {
      onConflict: "skip" | "update" | "merge";
      validate: boolean;
    },
  ): Promise<CiviliteImportResult> {
    try {
      console.log("📥 Import de", data.length, "civilités");

      const endpoint = "/civilites/import";
      const response = await api.post<ApiResponse<CiviliteImportResult>>(
        endpoint,
        {
          data,
          options: options || { onConflict: "skip", validate: true },
        },
      );

      let result: CiviliteImportResult;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        result = (response.data as any).data;
      } else {
        result = response.data as CiviliteImportResult;
      }

      console.log("✅ Import terminé:", result);
      return result;
    } catch (error: any) {
      console.error("❌ Erreur lors de l'import:", error);
      throw error;
    }
  },

  // Exporter des civilités dans différents formats
  async exportCivilites(options: CiviliteExportOptions): Promise<Blob> {
    try {
      console.log("📤 Export des civilités au format", options.format);

      const endpoint = API_ENDPOINTS.CIVILITES.EXPORT_PDF;
      const response = await api.post(endpoint, options, {
        responseType: "blob",
      });

      console.log("✅ Export terminé avec succès");
      return response;
    } catch (error: any) {
      console.error("❌ Erreur lors de l'export:", error);
      throw error;
    }
  },

  // ==================== GESTION DES TRADUCTIONS ====================

  // Ajouter une traduction à une civilité
  async addTranslation(
    uuid: string,
    translation: CiviliteTranslation,
  ): Promise<Civilite> {
    try {
      console.log(
        "🌐 Ajout d'une traduction à la civilité:",
        uuid,
        "langue:",
        translation.langue,
      );

      const endpoint = `/civilites/${uuid}/translations`;
      const response = await api.post<ApiResponse<Civilite>>(
        endpoint,
        translation,
      );

      let updatedCivilite: Civilite;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        updatedCivilite = (response.data as any).data;
      } else {
        updatedCivilite = response.data as Civilite;
      }

      console.log("✅ Traduction ajoutée avec succès");
      return updatedCivilite;
    } catch (error: any) {
      console.error("❌ Erreur lors de l'ajout de la traduction:", error);
      throw error;
    }
  },

  // Mettre à jour une traduction existante
  async updateTranslation(
    uuid: string,
    langue: string,
    translation: Partial<CiviliteTranslation>,
  ): Promise<Civilite> {
    try {
      console.log(
        "🌐 Mise à jour de la traduction pour la civilité:",
        uuid,
        "langue:",
        langue,
      );

      const endpoint = `/civilites/${uuid}/translations/${langue}`;
      const response = await api.put<ApiResponse<Civilite>>(
        endpoint,
        translation,
      );

      let updatedCivilite: Civilite;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        updatedCivilite = (response.data as any).data;
      } else {
        updatedCivilite = response.data as Civilite;
      }

      console.log("✅ Traduction mise à jour avec succès");
      return updatedCivilite;
    } catch (error: any) {
      console.error(
        "❌ Erreur lors de la mise à jour de la traduction:",
        error,
      );
      throw error;
    }
  },

  // Supprimer une traduction
  async deleteTranslation(uuid: string, langue: string): Promise<Civilite> {
    try {
      console.log(
        "🌐 Suppression de la traduction pour la civilité:",
        uuid,
        "langue:",
        langue,
      );

      const endpoint = `/civilites/${uuid}/translations/${langue}`;
      const response = await api.delete<ApiResponse<Civilite>>(endpoint);

      let updatedCivilite: Civilite;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        updatedCivilite = (response.data as any).data;
      } else {
        updatedCivilite = response.data as Civilite;
      }

      console.log("✅ Traduction supprimée avec succès");
      return updatedCivilite;
    } catch (error: any) {
      console.error(
        "❌ Erreur lors de la suppression de la traduction:",
        error,
      );
      throw error;
    }
  },

  // Récupérer toutes les traductions d'une civilité
  async getTranslations(uuid: string): Promise<CiviliteTranslation[]> {
    try {
      console.log("🌐 Récupération des traductions pour la civilité:", uuid);

      const endpoint = `/civilites/${uuid}/translations`;
      const response =
        await api.get<ApiResponse<CiviliteTranslation[]>>(endpoint);

      let translations: CiviliteTranslation[] = [];
      if (Array.isArray(response.data)) {
        translations = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        translations = (response.data as any).data || [];
      }

      console.log("✅", translations.length, "traductions trouvées");
      return translations;
    } catch (error: any) {
      console.error(
        "❌ Erreur lors de la récupération des traductions:",
        error,
      );
      throw error;
    }
  },

  // ==================== TEMPLATES ====================

  // Créer un template de civilités
  async createTemplate(
    template: Omit<CiviliteTemplate, "id">,
  ): Promise<CiviliteTemplate> {
    try {
      console.log("📋 Création d'un template de civilités:", template.nom);

      const endpoint = "/civilites/templates";
      const response = await api.post<ApiResponse<CiviliteTemplate>>(
        endpoint,
        template,
      );

      let createdTemplate: CiviliteTemplate;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        createdTemplate = (response.data as any).data;
      } else {
        createdTemplate = response.data as CiviliteTemplate;
      }

      console.log("✅ Template créé avec succès");
      return createdTemplate;
    } catch (error: any) {
      console.error("❌ Erreur lors de la création du template:", error);
      throw error;
    }
  },

  // Récupérer tous les templates
  async getTemplates(): Promise<CiviliteTemplate[]> {
    try {
      console.log("📋 Récupération des templates de civilités");

      const endpoint = "/civilites/templates";
      const response = await api.get<ApiResponse<CiviliteTemplate[]>>(endpoint);

      let templates: CiviliteTemplate[] = [];
      if (Array.isArray(response.data)) {
        templates = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        templates = (response.data as any).data || [];
      }

      console.log("✅", templates.length, "templates trouvés");
      return templates;
    } catch (error: any) {
      console.error("❌ Erreur lors de la récupération des templates:", error);
      throw error;
    }
  },

  // Appliquer un template à un pays spécifique
  async applyTemplate(
    templateId: string,
    countryCode: string,
  ): Promise<Civilite[]> {
    try {
      console.log(
        "📋 Application du template",
        templateId,
        "au pays:",
        countryCode,
      );

      const endpoint = `/civilites/templates/${templateId}/apply`;
      const response = await api.post<ApiResponse<Civilite[]>>(endpoint, {
        countryCode,
      });

      let appliedCivilites: Civilite[] = [];
      if (Array.isArray(response.data)) {
        appliedCivilites = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        appliedCivilites = (response.data as any).data || [];
      }

      console.log(
        "✅ Template appliqué,",
        appliedCivilites.length,
        "civilités créées",
      );
      return appliedCivilites;
    } catch (error: any) {
      console.error("❌ Erreur lors de l'application du template:", error);
      throw error;
    }
  },

  // ==================== FUSION DE CIVILITÉS ====================

  // Fusionner deux civilités
  async mergeCivilites(mergeRequest: CiviliteMergeRequest): Promise<Civilite> {
    try {
      console.log(
        "🔄 Fusion des civilités:",
        mergeRequest.source_uuid,
        "dans",
        mergeRequest.target_uuid,
      );

      const endpoint = "/civilites/merge";
      const response = await api.post<ApiResponse<Civilite>>(
        endpoint,
        mergeRequest,
      );

      let mergedCivilite: Civilite;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        mergedCivilite = (response.data as any).data;
      } else {
        mergedCivilite = response.data as Civilite;
      }

      console.log("✅ Civilités fusionnées avec succès");
      return mergedCivilite;
    } catch (error: any) {
      console.error("❌ Erreur lors de la fusion des civilités:", error);
      throw error;
    }
  },

  // Récupérer les mappings de civilités
  async getCiviliteMappings(): Promise<CiviliteMapping[]> {
    try {
      console.log("🗺️ Récupération des mappings de civilités");

      const endpoint = "/civilites/mappings";
      const response = await api.get<ApiResponse<CiviliteMapping[]>>(endpoint);

      let mappings: CiviliteMapping[] = [];
      if (Array.isArray(response.data)) {
        mappings = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        mappings = (response.data as any).data || [];
      }

      console.log("✅", mappings.length, "mappings trouvés");
      return mappings;
    } catch (error: any) {
      console.error("❌ Erreur lors de la récupération des mappings:", error);
      throw error;
    }
  },

  // ==================== AUDIT & HISTORIQUE ====================

  // Récupérer l'historique d'une civilité
  async getCiviliteHistory(uuid: string): Promise<CiviliteHistory[]> {
    try {
      console.log("📜 Récupération de l'historique de la civilité:", uuid);

      const endpoint = `/civilites/${uuid}/history`;
      const response = await api.get<ApiResponse<CiviliteHistory[]>>(endpoint);

      let history: CiviliteHistory[] = [];
      if (Array.isArray(response.data)) {
        history = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        history = (response.data as any).data || [];
      }

      console.log("✅", history.length, "entrées d'historique trouvées");
      return history;
    } catch (error: any) {
      console.error(
        "❌ Erreur lors de la récupération de l'historique:",
        error,
      );
      throw error;
    }
  },

  // Récupérer le journal d'audit des civilités
  async getAuditLog(periode?: {
    debut: string;
    fin: string;
  }): Promise<CiviliteAuditLog> {
    try {
      console.log("🔍 Récupération du journal d'audit des civilités");

      const endpoint = "/civilites/audit-log";
      const response = await api.get<ApiResponse<CiviliteAuditLog>>(endpoint, {
        params: periode,
      });

      // Structure par défaut
      const defaultLog: CiviliteAuditLog = {
        periode: periode || {
          debut: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 jours
          fin: new Date().toISOString(),
        },
        actions: [],
        stats: {
          total_actions: 0,
          par_action: {},
          par_utilisateur: {},
        },
      };

      let auditLog = defaultLog;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        auditLog = { ...defaultLog, ...(response.data as any).data };
      } else if (response.data && typeof response.data === "object") {
        auditLog = { ...defaultLog, ...response.data };
      }

      console.log(
        "✅ Journal d'audit récupéré avec",
        auditLog.actions.length,
        "actions",
      );
      return auditLog;
    } catch (error: any) {
      console.error(
        "❌ Erreur lors de la récupération du journal d'audit:",
        error,
      );
      throw error;
    }
  },

  // ==================== UTILITAIRES ====================

  // Générer un slug à partir d'un libellé
  async generateSlug(libelle: string): Promise<string> {
    try {
      console.log("🔗 Génération du slug pour:", libelle);

      const slug = libelle
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 50);

      // Vérifier si le slug existe déjà et ajouter un suffixe si nécessaire
      let finalSlug = slug;
      let suffix = 1;

      while (true) {
        try {
          const exists = await this.getCiviliteBySlug(finalSlug);
          if (exists) {
            finalSlug = `${slug}-${suffix}`;
            suffix++;
          } else {
            break;
          }
        } catch {
          // 404 signifie que le slug est disponible
          break;
        }

        // Limite de sécurité
        if (suffix > 10) {
          finalSlug = `${slug}-${Date.now()}`;
          break;
        }
      }

      console.log("✅ Slug généré:", finalSlug);
      return finalSlug;
    } catch (error: any) {
      console.error("❌ Erreur lors de la génération du slug:", error);
      throw error;
    }
  },

  // Formater un nom avec la civilité
  async formatCiviliteName(
    civiliteCode: string,
    nom: string,
    prenom: string,
    format: "long" | "short" | "full" = "full",
  ): Promise<string> {
    try {
      console.log("🎭 Formatage du nom avec la civilité:", civiliteCode);

      // Récupérer la civilité
      const civilite = await this.getCiviliteByCode(civiliteCode);
      if (!civilite) {
        return `${prenom} ${nom}`;
      }

      switch (format) {
        case "long":
          return `${civilite.libelle} ${prenom} ${nom}`;
        case "short":
          return `${civilite.libelle_court} ${prenom} ${nom}`;
        case "full":
          if (civilite.prefixe_nom && civilite.suffixe_nom) {
            return `${civilite.prefixe_nom} ${prenom} ${nom} ${civilite.suffixe_nom}`;
          } else if (civilite.format_complet) {
            return civilite.format_complet
              .replace("{civilite}", civilite.libelle_court)
              .replace("{prenom}", prenom)
              .replace("{nom}", nom);
          } else {
            return `${civilite.libelle_court} ${prenom} ${nom}`;
          }
        default:
          return `${prenom} ${nom}`;
      }
    } catch (error: any) {
      console.error("❌ Erreur lors du formatage du nom:", error);
      throw error;
    }
  },

  // Récupérer une civilité par son code
  async getCiviliteByCode(code: string): Promise<Civilite | null> {
    try {
      console.log("🔍 Récupération de la civilité par code:", code);

      const { civilites } = await this.getCivilites({
        filters: { search: code },
      });

      const civilite = civilites.find((c) => c.code === code);
      if (!civilite) {
        return null;
      }

      console.log("✅ Civilité trouvée par code:", civilite.libelle);
      return civilite;
    } catch (error: any) {
      console.error("❌ Erreur lors de la récupération par code:", error);
      throw error;
    }
  },

  // Récupérer les civilités populaires (les plus utilisées)
  async getPopularCivilites(limit: number = 10): Promise<Civilite[]> {
    try {
      console.log("🔥 Récupération des civilités populaires");

      const { civilites } = await this.getCivilites({
        limit,
        sort_by: "nombre_utilisations",
        sort_order: "desc",
        filters: { est_actif: true },
      });

      console.log("✅", civilites.length, "civilités populaires trouvées");
      return civilites;
    } catch (error: any) {
      console.error(
        "❌ Erreur lors de la récupération des civilités populaires:",
        error,
      );
      throw error;
    }
  },

  // Méthode alternative pour obtenir les options de sélection
  async getCiviliteSelectOptions(
    options?: CiviliteFormOptions,
  ): Promise<Array<{ value: string; label: string; data: Civilite }>> {
    try {
      console.log("📋 Récupération des options de sélection de civilités");

      const civilites = await this.getCivilitesForForm(options);

      const optionsList = civilites.map((civilite) => ({
        value: civilite.code,
        label:
          options?.format === "short"
            ? civilite.libelle_court
            : civilite.libelle,
        data: civilite,
      }));

      console.log("✅", optionsList.length, "options générées");
      return optionsList;
    } catch (error: any) {
      console.error(
        "❌ Erreur lors de la récupération des options de sélection:",
        error,
      );
      throw error;
    }
  },

  // ==================== DEBUG & TEST ====================

  // Tester le service des civilités
  async testCiviliteService(): Promise<boolean> {
    try {
      console.log("🧪 Test du service des civilités...");

      // Test des opérations de base
      await this.getCivilites({ limit: 1 });
      await this.getActiveCivilites();

      console.log("✅ Service des civilités opérationnel");
      return true;
    } catch (error: any) {
      console.error("❌ Test du service des civilités échoué:", error.message);
      return false;
    }
  },

  // Ping du service
  async ping(): Promise<{ status: string; timestamp: string }> {
    try {
      console.log("🏓 Ping du service des civilités...");

      await this.getCivilites({ limit: 1 });

      return {
        status: "OK",
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        status: "ERROR",
        timestamp: new Date().toISOString(),
      };
    }
  },
};
