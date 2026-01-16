// services/types-boutique/types-boutique.service.ts
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import type {
  TypeBoutiqueType,
  TypeBoutiqueCreateData,
  TypeBoutiqueUpdateData,
  TypeBoutique,
  CategorieBoutique,
  StatutTypeBoutique,
  TypeBoutiqueStats,
  AnalyseComparativeTypes,
  DemandeChangementTypeBoutique,
  MigrationTypeBoutique,
  TestCompatibiliteType,
  ConfigurationTypeBoutique,
  TemplateConfigurationType,
  BundleTypesBoutique,
  PrerequisTypeBoutique,
  ComparaisonTypesBoutique,
  GuideMiseEnPlaceType,
} from "./types-boutique.types";

/**
 * Réponse générique de l'API
 */
export interface ApiResponse<T> {
  data: T;
  status: string;
  message?: string;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
}

/**
 * Service complet pour la gestion des types de boutique
 */
export const typesBoutiqueService = {
  // ==================== CRUD Types de Boutique ====================

  /**
   * Récupère la liste des types de boutique
   */
  async getTypesBoutique(params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: TypeBoutique;
    categorie?: CategorieBoutique;
    statut?: StatutTypeBoutique;
    actif?: boolean;
    defaut?: boolean;
    niveau_complexite?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
  }): Promise<{
    types: TypeBoutiqueType[];
    total: number;
    page: number;
    pages: number;
  }> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.type) queryParams.append("type", params.type);
    if (params?.categorie) queryParams.append("categorie", params.categorie);
    if (params?.statut) queryParams.append("statut", params.statut);
    if (params?.actif !== undefined)
      queryParams.append("actif", params.actif.toString());
    if (params?.defaut !== undefined)
      queryParams.append("defaut", params.defaut.toString());
    if (params?.niveau_complexite)
      queryParams.append("niveau_complexite", params.niveau_complexite);
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.TYPES_BOUTIQUE.LIST}?${queryString}`
      : API_ENDPOINTS.TYPES_BOUTIQUE.LIST;

    console.log("🏪 Fetching boutique types:", endpoint);

    try {
      const response = await api.get<ApiResponse<TypeBoutiqueType[]>>(endpoint);

      let types: TypeBoutiqueType[] = [];
      let total = 0;
      let page = 1;
      let pages = 1;

      if (Array.isArray(response.data)) {
        types = response.data;
        total = response.total || types.length;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        types = (response.data as any).data || [];
        total = (response.data as any).total || types.length;
        page = (response.data as any).page || 1;
        pages = (response.data as any).pages || 1;
      }

      console.log(`✅ Found ${types.length} boutique types`);
      return { types, total, page, pages };
    } catch (error: any) {
      console.error("🚨 Error getting boutique types:", error);
      throw error;
    }
  },

  /**
   * Récupère les types de boutique par défaut
   */
  async getTypesBoutiqueDefaults(): Promise<TypeBoutiqueType[]> {
    try {
      console.log("🏪 Fetching default boutique types");

      const response = await api.get<ApiResponse<TypeBoutiqueType[]>>(
        API_ENDPOINTS.TYPES_BOUTIQUE.DEFAULTS,
      );

      let types: TypeBoutiqueType[] = [];
      if (Array.isArray(response.data)) {
        types = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        types = (response.data as any).data || [];
      }

      console.log(`✅ Found ${types.length} default types`);
      return types;
    } catch (error: any) {
      console.error("❌ Error getting default types:", error);
      throw error;
    }
  },

  /**
   * Récupère un type de boutique par son UUID
   */
  async getTypeBoutique(uuid: string): Promise<TypeBoutiqueType> {
    try {
      console.log("🔍 Fetching boutique type:", uuid);

      const response = await api.get<ApiResponse<TypeBoutiqueType>>(
        API_ENDPOINTS.TYPES_BOUTIQUE.DETAIL(uuid),
      );

      let type: TypeBoutiqueType;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        type = (response.data as any).data;
      } else {
        type = response.data as TypeBoutiqueType;
      }

      if (!type || !type.uuid) {
        throw new Error("Type de boutique non trouvé");
      }

      console.log("✅ Boutique type found:", type.nom);
      return type;
    } catch (error: any) {
      console.error("❌ Error fetching boutique type:", error);
      throw error;
    }
  },

  /**
   * Crée un nouveau type de boutique
   */
  async createTypeBoutique(
    typeData: TypeBoutiqueCreateData,
  ): Promise<TypeBoutiqueType> {
    try {
      console.log("🆕 Creating boutique type:", typeData.nom);

      const response = await api.post<ApiResponse<TypeBoutiqueType>>(
        API_ENDPOINTS.TYPES_BOUTIQUE.CREATE,
        typeData,
      );

      console.log("✅ Boutique type creation response:", response.data);

      let createdType: TypeBoutiqueType;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        createdType = (response.data as any).data;
      } else {
        createdType = response.data as TypeBoutiqueType;
      }

      if (!createdType || !createdType.uuid) {
        throw new Error("Échec de la création du type de boutique");
      }

      return createdType;
    } catch (error: any) {
      console.error("❌ Error creating boutique type:", {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  /**
   * Met à jour un type de boutique existant
   */
  async updateTypeBoutique(
    uuid: string,
    typeData: TypeBoutiqueUpdateData,
  ): Promise<TypeBoutiqueType> {
    try {
      console.log("✏️ Updating boutique type:", uuid);

      const response = await api.put<ApiResponse<TypeBoutiqueType>>(
        API_ENDPOINTS.TYPES_BOUTIQUE.UPDATE(uuid),
        typeData,
      );

      console.log("✅ Boutique type update response:", response.data);

      let updatedType: TypeBoutiqueType;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        updatedType = (response.data as any).data;
      } else {
        updatedType = response.data as TypeBoutiqueType;
      }

      return updatedType;
    } catch (error: any) {
      console.error("❌ Error updating boutique type:", error);
      throw error;
    }
  },

  /**
   * Supprime un type de boutique
   */
  async deleteTypeBoutique(uuid: string): Promise<{ message: string }> {
    try {
      console.log("🗑️ Deleting boutique type:", uuid);

      const response = await api.delete<ApiResponse<{ message: string }>>(
        API_ENDPOINTS.TYPES_BOUTIQUE.DELETE(uuid),
      );

      console.log("✅ Boutique type deleted successfully");
      return response.data as { message: string };
    } catch (error: any) {
      console.error("❌ Error deleting boutique type:", error);
      throw error;
    }
  },

  /**
   * Active un type de boutique
   */
  async activateTypeBoutique(uuid: string): Promise<TypeBoutiqueType> {
    try {
      console.log("✅ Activating boutique type:", uuid);

      const response = await api.put<ApiResponse<TypeBoutiqueType>>(
        API_ENDPOINTS.TYPES_BOUTIQUE.ACTIVATE(uuid),
        {},
      );

      let type: TypeBoutiqueType;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        type = (response.data as any).data;
      } else {
        type = response.data as TypeBoutiqueType;
      }

      console.log("✅ Boutique type activated");
      return type;
    } catch (error: any) {
      console.error("❌ Error activating boutique type:", error);
      throw error;
    }
  },

  /**
   * Désactive un type de boutique
   */
  async deactivateTypeBoutique(uuid: string): Promise<TypeBoutiqueType> {
    try {
      console.log("❌ Deactivating boutique type:", uuid);

      const response = await api.put<ApiResponse<TypeBoutiqueType>>(
        API_ENDPOINTS.TYPES_BOUTIQUE.DEACTIVATE(uuid),
        {},
      );

      let type: TypeBoutiqueType;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        type = (response.data as any).data;
      } else {
        type = response.data as TypeBoutiqueType;
      }

      console.log("✅ Boutique type deactivated");
      return type;
    } catch (error: any) {
      console.error("❌ Error deactivating boutique type:", error);
      throw error;
    }
  },

  /**
   * Exporte les types de boutique au format PDF
   */
  async exportTypesBoutiquePDF(): Promise<Blob> {
    try {
      console.log("📤 Exporting boutique types to PDF");

      const response = await api.get<Blob>(
        API_ENDPOINTS.TYPES_BOUTIQUE.EXPORT_PDF,
        {
          responseType: "blob",
        },
      );

      console.log("✅ PDF export completed");
      return response.data;
    } catch (error: any) {
      console.error("❌ Error exporting to PDF:", error);
      throw error;
    }
  },

  // ==================== Configuration ====================

  /**
   * Récupère la configuration d'un type de boutique
   */
  async getConfigurationTypeBoutique(
    typeUuid: string,
  ): Promise<ConfigurationTypeBoutique> {
    try {
      console.log("⚙️ Getting boutique type configuration:", typeUuid);

      const response = await api.get<ApiResponse<ConfigurationTypeBoutique>>(
        `${API_ENDPOINTS.TYPES_BOUTIQUE.CONFIGURATION}/${typeUuid}`,
      );

      let config: ConfigurationTypeBoutique;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        config = (response.data as any).data;
      } else {
        config = response.data as ConfigurationTypeBoutique;
      }

      console.log("✅ Configuration loaded");
      return config;
    } catch (error: any) {
      console.error("❌ Error getting configuration:", error);
      throw error;
    }
  },

  /**
   * Met à jour la configuration d'un type de boutique
   */
  async updateConfigurationTypeBoutique(
    typeUuid: string,
    configuration: Partial<ConfigurationTypeBoutique>,
  ): Promise<ConfigurationTypeBoutique> {
    try {
      console.log("⚙️ Updating boutique type configuration:", typeUuid);

      const response = await api.put<ApiResponse<ConfigurationTypeBoutique>>(
        API_ENDPOINTS.TYPES_BOUTIQUE.UPDATE_CONFIGURATION(typeUuid),
        configuration,
      );

      let config: ConfigurationTypeBoutique;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        config = (response.data as any).data;
      } else {
        config = response.data as ConfigurationTypeBoutique;
      }

      console.log("✅ Configuration updated");
      return config;
    } catch (error: any) {
      console.error("❌ Error updating configuration:", error);
      throw error;
    }
  },

  // ==================== Templates ====================

  /**
   * Récupère les templates de configuration pour un type
   */
  async getTemplatesConfiguration(
    typeUuid: string,
  ): Promise<TemplateConfigurationType[]> {
    try {
      console.log("🎨 Getting configuration templates for type:", typeUuid);

      const response = await api.get<ApiResponse<TemplateConfigurationType[]>>(
        `${API_ENDPOINTS.TYPES_BOUTIQUE.TEMPLATES}/${typeUuid}`,
      );

      let templates: TemplateConfigurationType[] = [];
      if (Array.isArray(response.data)) {
        templates = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        templates = (response.data as any).data || [];
      }

      console.log(`✅ Found ${templates.length} templates`);
      return templates;
    } catch (error: any) {
      console.error("❌ Error getting templates:", error);
      throw error;
    }
  },

  /**
   * Crée un nouveau template de configuration
   */
  async createTemplateConfiguration(
    templateData: Partial<TemplateConfigurationType>,
  ): Promise<TemplateConfigurationType> {
    try {
      console.log("🎨 Creating configuration template");

      const response = await api.post<ApiResponse<TemplateConfigurationType>>(
        API_ENDPOINTS.TYPES_BOUTIQUE.CREATE_TEMPLATE,
        templateData,
      );

      console.log("✅ Template created");
      return response.data as TemplateConfigurationType;
    } catch (error: any) {
      console.error("❌ Error creating template:", error);
      throw error;
    }
  },

  // ==================== Gestion des Changements ====================

  /**
   * Teste la compatibilité pour un changement de type
   */
  async testerCompatibiliteChangement(
    boutiqueUuid: string,
    nouveauTypeUuid: string,
  ): Promise<TestCompatibiliteType> {
    try {
      console.log("🔍 Testing compatibility for type change");

      const response = await api.post<ApiResponse<TestCompatibiliteType>>(
        API_ENDPOINTS.TYPES_BOUTIQUE.TESTER_COMPATIBILITE,
        { boutique_uuid: boutiqueUuid, nouveau_type_uuid: nouveauTypeUuid },
      );

      console.log("✅ Compatibility test completed");
      return response.data as TestCompatibiliteType;
    } catch (error: any) {
      console.error("❌ Error testing compatibility:", error);
      throw error;
    }
  },

  /**
   * Soumet une demande de changement de type
   */
  async soumettreDemandeChangement(demandeData: {
    boutique_uuid: string;
    nouveau_type_uuid: string;
    raison?: string;
    documents?: Array<{
      type: string;
      nom: string;
      url: string;
    }>;
  }): Promise<DemandeChangementTypeBoutique> {
    try {
      console.log("📝 Submitting type change request");

      const response = await api.post<
        ApiResponse<DemandeChangementTypeBoutique>
      >(API_ENDPOINTS.TYPES_BOUTIQUE.SOUMETTRE_DEMANDE, demandeData);

      console.log("✅ Request submitted");
      return response.data as DemandeChangementTypeBoutique;
    } catch (error: any) {
      console.error("❌ Error submitting request:", error);
      throw error;
    }
  },

  /**
   * Récupère les demandes de changement de type
   */
  async getDemandesChangement(params?: {
    statut?: string;
    boutique_uuid?: string;
    page?: number;
    limit?: number;
  }): Promise<{ demandes: DemandeChangementTypeBoutique[]; total: number }> {
    try {
      console.log("📋 Getting type change requests");

      const queryParams = new URLSearchParams();
      if (params?.statut) queryParams.append("statut", params.statut);
      if (params?.boutique_uuid)
        queryParams.append("boutique_uuid", params.boutique_uuid);
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());

      const endpoint = queryParams.toString()
        ? `${API_ENDPOINTS.TYPES_BOUTIQUE.DEMANDES}?${queryParams.toString()}`
        : API_ENDPOINTS.TYPES_BOUTIQUE.DEMANDES;

      const response =
        await api.get<ApiResponse<DemandeChangementTypeBoutique[]>>(endpoint);

      let demandes: DemandeChangementTypeBoutique[] = [];
      let total = 0;

      if (Array.isArray(response.data)) {
        demandes = response.data;
        total = demandes.length;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        demandes = (response.data as any).data || [];
        total = (response.data as any).total || demandes.length;
      }

      console.log(`✅ Found ${demandes.length} requests`);
      return { demandes, total };
    } catch (error: any) {
      console.error("❌ Error getting requests:", error);
      throw error;
    }
  },

  /**
   * Approuve une demande de changement de type
   */
  async approuverDemandeChangement(
    uuid: string,
    validateurUuid: string,
    notes?: string,
  ): Promise<DemandeChangementTypeBoutique> {
    try {
      console.log("✅ Approving type change request:", uuid);

      const response = await api.put<
        ApiResponse<DemandeChangementTypeBoutique>
      >(API_ENDPOINTS.TYPES_BOUTIQUE.APPROUVER_DEMANDE(uuid), {
        validateur_uuid: validateurUuid,
        notes,
      });

      let demande: DemandeChangementTypeBoutique;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        demande = (response.data as any).data;
      } else {
        demande = response.data as DemandeChangementTypeBoutique;
      }

      console.log("✅ Request approved");
      return demande;
    } catch (error: any) {
      console.error("❌ Error approving request:", error);
      throw error;
    }
  },

  /**
   * Exécute une migration de type
   */
  async executerMigration(migrationData: {
    demande_uuid: string;
    boutique_uuid: string;
    responsable_uuid?: string;
  }): Promise<MigrationTypeBoutique> {
    try {
      console.log("🔄 Executing type migration");

      const response = await api.post<ApiResponse<MigrationTypeBoutique>>(
        API_ENDPOINTS.TYPES_BOUTIQUE.EXECUTER_MIGRATION,
        migrationData,
      );

      console.log("✅ Migration executed");
      return response.data as MigrationTypeBoutique;
    } catch (error: any) {
      console.error("❌ Error executing migration:", error);
      throw error;
    }
  },

  // ==================== Statistiques et Analyses ====================

  /**
   * Récupère les statistiques des types de boutique
   */
  async getTypesBoutiqueStats(): Promise<TypeBoutiqueStats> {
    try {
      console.log("📊 Fetching boutique types statistics");

      const response = await api.get<ApiResponse<TypeBoutiqueStats>>(
        API_ENDPOINTS.TYPES_BOUTIQUE.STATS,
      );

      let stats: TypeBoutiqueStats;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        stats = (response.data as any).data;
      } else {
        stats = response.data as TypeBoutiqueStats;
      }

      console.log("✅ Statistics loaded");
      return stats;
    } catch (error: any) {
      console.error("❌ Error getting statistics:", error);
      throw error;
    }
  },

  /**
   * Génère une analyse comparative
   */
  async genererAnalyseComparative(
    typeUuids: string[],
  ): Promise<AnalyseComparativeTypes> {
    try {
      console.log("📈 Generating comparative analysis");

      const response = await api.post<ApiResponse<AnalyseComparativeTypes>>(
        API_ENDPOINTS.TYPES_BOUTIQUE.ANALYSE_COMPARATIVE,
        { type_uuids: typeUuids },
      );

      console.log("✅ Analysis generated");
      return response.data as AnalyseComparativeTypes;
    } catch (error: any) {
      console.error("❌ Error generating analysis:", error);
      throw error;
    }
  },

  // ==================== Bundles ====================

  /**
   * Récupère les bundles de types de boutique
   */
  async getBundlesTypesBoutique(): Promise<BundleTypesBoutique[]> {
    try {
      console.log("📦 Getting boutique type bundles");

      const response = await api.get<ApiResponse<BundleTypesBoutique[]>>(
        API_ENDPOINTS.TYPES_BOUTIQUE.BUNDLES,
      );

      let bundles: BundleTypesBoutique[] = [];
      if (Array.isArray(response.data)) {
        bundles = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        bundles = (response.data as any).data || [];
      }

      console.log(`✅ Found ${bundles.length} bundles`);
      return bundles;
    } catch (error: any) {
      console.error("❌ Error getting bundles:", error);
      throw error;
    }
  },

  // ==================== Pré-requis ====================

  /**
   * Récupère les pré-requis d'un type de boutique
   */
  async getPrerequisTypeBoutique(
    typeUuid: string,
  ): Promise<PrerequisTypeBoutique> {
    try {
      console.log("📋 Getting prerequisites for type:", typeUuid);

      const response = await api.get<ApiResponse<PrerequisTypeBoutique>>(
        `${API_ENDPOINTS.TYPES_BOUTIQUE.PREREQUIS}/${typeUuid}`,
      );

      let prerequis: PrerequisTypeBoutique;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        prerequis = (response.data as any).data;
      } else {
        prerequis = response.data as PrerequisTypeBoutique;
      }

      console.log("✅ Prerequisites loaded");
      return prerequis;
    } catch (error: any) {
      console.error("❌ Error getting prerequisites:", error);
      throw error;
    }
  },

  // ==================== Comparaisons ====================

  /**
   * Compare plusieurs types de boutique
   */
  async comparerTypesBoutique(
    typeUuids: string[],
  ): Promise<ComparaisonTypesBoutique> {
    try {
      console.log("⚖️ Comparing boutique types");

      const response = await api.post<ApiResponse<ComparaisonTypesBoutique>>(
        API_ENDPOINTS.TYPES_BOUTIQUE.COMPARER,
        { type_uuids: typeUuids },
      );

      console.log("✅ Comparison completed");
      return response.data as ComparaisonTypesBoutique;
    } catch (error: any) {
      console.error("❌ Error comparing types:", error);
      throw error;
    }
  },

  // ==================== Guides ====================

  /**
   * Récupère le guide de mise en place d'un type
   */
  async getGuideMiseEnPlace(typeUuid: string): Promise<GuideMiseEnPlaceType> {
    try {
      console.log("📚 Getting setup guide for type:", typeUuid);

      const response = await api.get<ApiResponse<GuideMiseEnPlaceType>>(
        `${API_ENDPOINTS.TYPES_BOUTIQUE.GUIDE_MISE_EN_PLACE}/${typeUuid}`,
      );

      let guide: GuideMiseEnPlaceType;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        guide = (response.data as any).data;
      } else {
        guide = response.data as GuideMiseEnPlaceType;
      }

      console.log("✅ Guide loaded");
      return guide;
    } catch (error: any) {
      console.error("❌ Error getting guide:", error);
      throw error;
    }
  },

  // ==================== Utilitaires ====================

  /**
   * Récupère les types recommandés pour un profil
   */
  async getTypesRecommandes(params: {
    experience?: "debutant" | "intermediaire" | "expert";
    budget?: "faible" | "moyen" | "eleve";
    objectif?: "vente_physique" | "vente_en_ligne" | "mixte" | "marque";
    secteur?: CategorieBoutique;
  }): Promise<TypeBoutiqueType[]> {
    try {
      console.log("💡 Getting recommended boutique types");

      const queryParams = new URLSearchParams();
      if (params.experience)
        queryParams.append("experience", params.experience);
      if (params.budget) queryParams.append("budget", params.budget);
      if (params.objectif) queryParams.append("objectif", params.objectif);
      if (params.secteur) queryParams.append("secteur", params.secteur);

      const response = await api.get<ApiResponse<TypeBoutiqueType[]>>(
        `${API_ENDPOINTS.TYPES_BOUTIQUE.RECOMMANDES}?${queryParams.toString()}`,
      );

      let types: TypeBoutiqueType[] = [];
      if (Array.isArray(response.data)) {
        types = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        types = (response.data as any).data || [];
      }

      console.log(`✅ Found ${types.length} recommended types`);
      return types;
    } catch (error: any) {
      console.error("❌ Error getting recommendations:", error);
      throw error;
    }
  },

  /**
   * Vérifie la disponibilité d'un type dans un pays
   */
  async verifierDisponibilitePays(
    typeUuid: string,
    paysCode: string,
  ): Promise<{
    disponible: boolean;
    restrictions?: string[];
  }> {
    try {
      console.log(
        "🌍 Checking type availability in country:",
        typeUuid,
        paysCode,
      );

      const response = await api.get<ApiResponse<any>>(
        `${API_ENDPOINTS.TYPES_BOUTIQUE.VERIFIER_DISPONIBILITE}?type_uuid=${typeUuid}&pays_code=${paysCode}`,
      );

      return response.data as any;
    } catch (error: any) {
      console.error("❌ Error checking availability:", error);
      throw error;
    }
  },

  /**
   * Récupère le type par défaut
   */
  async getTypeDefaut(): Promise<TypeBoutiqueType> {
    try {
      console.log("⚙️ Getting default type");

      const { types } = await this.getTypesBoutique({
        defaut: true,
        limit: 1,
      });

      if (types.length === 0) {
        // Si aucun type par défaut n'est défini, prendre le premier actif
        const { types: typesActifs } = await this.getTypesBoutique({
          actif: true,
          limit: 1,
        });

        if (typesActifs.length === 0) {
          throw new Error("Aucun type de boutique disponible");
        }

        return typesActifs[0];
      }

      return types[0];
    } catch (error: any) {
      console.error("❌ Error getting default type:", error);
      throw error;
    }
  },

  /**
   * Définit un type comme type par défaut
   */
  async setTypeDefaut(uuid: string): Promise<TypeBoutiqueType> {
    try {
      console.log("⚙️ Setting default type:", uuid);

      // D'abord, réinitialiser tous les autres types
      const { types } = await this.getTypesBoutique();
      for (const type of types) {
        if (type.defaut && type.uuid !== uuid) {
          await this.updateTypeBoutique(type.uuid, { defaut: false });
        }
      }

      // Puis définir le nouveau type par défaut
      return await this.updateTypeBoutique(uuid, { defaut: true });
    } catch (error: any) {
      console.error("❌ Error setting default type:", error);
      throw error;
    }
  },

  /**
   * Récupère les types compatibles avec une boutique existante
   */
  async getTypesCompatibles(boutiqueUuid: string): Promise<TypeBoutiqueType[]> {
    try {
      console.log("🔄 Getting compatible types for boutique:", boutiqueUuid);

      const response = await api.get<ApiResponse<TypeBoutiqueType[]>>(
        `${API_ENDPOINTS.TYPES_BOUTIQUE.COMPATIBLES}/${boutiqueUuid}`,
      );

      let types: TypeBoutiqueType[] = [];
      if (Array.isArray(response.data)) {
        types = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        types = (response.data as any).data || [];
      }

      console.log(`✅ Found ${types.length} compatible types`);
      return types;
    } catch (error: any) {
      console.error("❌ Error getting compatible types:", error);
      throw error;
    }
  },

  /**
   * Simule une boutique avec un type spécifique
   */
  async simulerBoutiqueAvecType(
    typeUuid: string,
    parametres?: any,
  ): Promise<{
    simulation: any;
    couts_estimes: any;
    fonctionnalites_disponibles: string[];
  }> {
    try {
      console.log("🎮 Simulating boutique with type:", typeUuid);

      const response = await api.post<ApiResponse<any>>(
        API_ENDPOINTS.TYPES_BOUTIQUE.SIMULER,
        { type_uuid: typeUuid, parametres },
      );

      console.log("✅ Simulation completed");
      return response.data as any;
    } catch (error: any) {
      console.error("❌ Error simulating boutique:", error);
      throw error;
    }
  },
};
