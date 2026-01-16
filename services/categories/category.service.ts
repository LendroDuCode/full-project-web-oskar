// services/categories/category.service.ts
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import type {
  Category,
  CategoryCreateData,
  CategoryUpdateData,
  CategoryTreeNode,
  CategoryTree,
  CategoryFilterParams,
  CategoryPaginationParams,
  CategoryStats,
  CategoryBreadcrumb,
  CategoryPath,
  CategoryImportData,
  CategoryExportOptions,
  CategoryMoveRequest,
  CategoryDuplicateRequest,
  CategoryValidationResult,
  CategorySearchResult,
  CategoryWithCounts,
  CategoryBulkUpdate,
  CategorySortRequest,
  CategoryVisibilityRequest,
  CategoryHierarchy,
  CategoryMenu,
  CategoryAnalytics,
  CategoryTemplate,
  CategoryImportResult
} from "./category.types";

export interface ApiResponse<T> {
  data: T;
  status: string;
  message?: string;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
}

export const categoryService = {
  // ==================== CRUD Operations ====================

  async getCategories(params?: CategoryPaginationParams): Promise<{ categories: Category[]; count?: number; total?: number; page?: number; pages?: number }> {
    const queryParams = new URLSearchParams();

    // Pagination
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);

    // Filters
    if (params?.filters) {
      const filters = params.filters;
      if (filters.parent_uuid) queryParams.append("parent_uuid", filters.parent_uuid);
      if (filters.niveau_min !== undefined) queryParams.append("niveau_min", filters.niveau_min.toString());
      if (filters.niveau_max !== undefined) queryParams.append("niveau_max", filters.niveau_max.toString());
      if (filters.type_contenu) queryParams.append("type_contenu", filters.type_contenu);
      if (filters.est_actif !== undefined) queryParams.append("est_actif", filters.est_actif.toString());
      if (filters.est_visible !== undefined) queryParams.append("est_visible", filters.est_visible.toString());
      if (filters.est_archive !== undefined) queryParams.append("est_archive", filters.est_archive.toString());
      if (filters.est_dans_menu !== undefined) queryParams.append("est_dans_menu", filters.est_dans_menu.toString());
      if (filters.emplacement_menu) queryParams.append("emplacement_menu", filters.emplacement_menu);
      if (filters.has_children !== undefined) queryParams.append("has_children", filters.has_children.toString());
      if (filters.has_products !== undefined) queryParams.append("has_products", filters.has_products.toString());
      if (filters.include_descendants !== undefined) queryParams.append("include_descendants", filters.include_descendants.toString());
      if (filters.age_maximum !== undefined) queryParams.append("age_maximum", filters.age_maximum.toString());

      if (filters.mots_cles && filters.mots_cles.length > 0) {
        queryParams.append("mots_cles", filters.mots_cles.join(","));
      }
      if (filters.restriction_geographique && filters.restriction_geographique.length > 0) {
        queryParams.append("restriction_geographique", filters.restriction_geographique.join(","));
      }
      if (filters.exclude_uuid && filters.exclude_uuid.length > 0) {
        queryParams.append("exclude_uuid", filters.exclude_uuid.join(","));
      }
    }

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.CATEGORIES.LIST}?${queryString}`
      : API_ENDPOINTS.CATEGORIES.LIST;

    console.log("📡 Fetching categories from:", endpoint);

    try {
      const response = await api.get<ApiResponse<Category[]>>(endpoint);

      console.log("✅ Categories response received:", {
        hasData: !!response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
      });

      let categories: Category[] = [];
      let count = 0;
      let total = 0;
      let page = 1;
      let pages = 1;

      // Vérifier la structure de la réponse
      if (Array.isArray(response.data)) {
        // L'API retourne directement un tableau
        categories = response.data;
        count = response.data.length;
      } else if (response.data && typeof response.data === 'object') {
        // Vérifier si c'est une réponse wrapper
        if ('data' in response.data && Array.isArray((response.data as any).data)) {
          // Structure: { data: [...], status: "success", count: X }
          categories = (response.data as any).data || [];
          count = (response.data as any).count || categories.length;
          total = (response.data as any).total || count;
          page = (response.data as any).page || 1;
          pages = (response.data as any).pages || 1;
        } else if ('categories' in response.data && Array.isArray((response.data as any).categories)) {
          // Structure alternative: { categories: [...], count: X }
          categories = (response.data as any).categories || [];
          count = (response.data as any).count || categories.length;
          total = (response.data as any).total || count;
          page = (response.data as any).page || 1;
          pages = (response.data as any).pages || 1;
        } else {
          console.warn("⚠️ Unexpected response format:", response.data);
        }
      }

      return { categories, count, total, page, pages };
    } catch (error: any) {
      console.error("🚨 Error in categoryService.getCategories:", {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  async getCategory(uuid: string): Promise<Category> {
    try {
      console.log("🔍 Fetching category:", uuid);

      const response = await api.get<ApiResponse<Category>>(API_ENDPOINTS.CATEGORIES.DETAIL(uuid));

      console.log("✅ Category response:", {
        hasData: !!response.data,
        dataType: typeof response.data,
      });

      let categoryData: Category;

      // Vérifier la structure de la réponse
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        // Structure: { data: {...}, status: "success" }
        categoryData = (response.data as any).data;
      } else if (response.data && (response.data as any).uuid) {
        // Structure: la catégorie directement
        categoryData = response.data as Category;
      } else {
        console.error("❌ Invalid category data structure:", response.data);
        throw new Error("Structure de données catégorie invalide");
      }

      if (!categoryData || !categoryData.uuid) {
        throw new Error("Catégorie non trouvée");
      }

      console.log("✅ Category found:", categoryData.nom);
      return categoryData;
    } catch (error: any) {
      console.error("❌ Error fetching category:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  async getCategoryBySlug(slug: string): Promise<Category> {
    try {
      console.log("🔍 Fetching category by slug:", slug);

      const response = await api.get<ApiResponse<Category>>(API_ENDPOINTS.CATEGORIES.BY_SLUG(slug));

      let categoryData: Category;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        categoryData = (response.data as any).data;
      } else if (response.data && (response.data as any).uuid) {
        categoryData = response.data as Category;
      } else {
        throw new Error("Catégorie non trouvée");
      }

      if (!categoryData || !categoryData.uuid) {
        throw new Error("Catégorie non trouvée");
      }

      console.log("✅ Category found by slug:", categoryData.nom);
      return categoryData;
    } catch (error: any) {
      console.error("❌ Error fetching category by slug:", error);
      throw error;
    }
  },

  async createCategory(categoryData: CategoryCreateData): Promise<Category> {
    try {
      console.log("🆕 Creating category:", categoryData.nom);

      // Valider les données avant envoi
      const validation = await this.validateCategory(categoryData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const response = await api.post<ApiResponse<Category>>(
        API_ENDPOINTS.CATEGORIES.CREATE,
        categoryData,
      );

      console.log("✅ Category creation response:", response.data);

      // Vérifier la structure de la réponse
      let createdCategory: Category;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        createdCategory = (response.data as any).data;
      } else {
        createdCategory = response.data as Category;
      }

      if (!createdCategory || !createdCategory.uuid) {
        throw new Error("Échec de la création de la catégorie");
      }

      return createdCategory;
    } catch (error: any) {
      console.error("❌ Error creating category:", {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  async updateCategory(uuid: string, categoryData: CategoryUpdateData): Promise<Category> {
    try {
      console.log("✏️ Updating category:", uuid);

      // Valider les données avant envoi
      if (categoryData.nom || categoryData.slug) {
        const validation = await this.validateCategory(categoryData as CategoryCreateData, uuid);
        if (!validation.isValid && validation.errors.length > 0) {
          throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }
      }

      const response = await api.put<ApiResponse<Category>>(
        API_ENDPOINTS.CATEGORIES.UPDATE(uuid),
        categoryData,
      );

      console.log("✅ Category update response:", response.data);

      // Vérifier la structure de la réponse
      let updatedCategory: Category;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        updatedCategory = (response.data as any).data;
      } else {
        updatedCategory = response.data as Category;
      }

      return updatedCategory;
    } catch (error: any) {
      console.error("❌ Error updating category:", error);
      throw error;
    }
  },

  async deleteCategory(uuid: string, force: boolean = false): Promise<void> {
    try {
      console.log("🗑️ Deleting category:", uuid, "force:", force);

      if (force) {
        // Suppression forcée (si autorisé)
        await api.delete(`/categories/${uuid}/force`);
      } else {
        await api.delete(API_ENDPOINTS.CATEGORIES.DELETE(uuid));
      }

      console.log("✅ Category deleted successfully");
    } catch (error: any) {
      console.error("❌ Error deleting category:", error);
      throw error;
    }
  },

  // ==================== Hierarchical Operations ====================

  async getCategoryTree(): Promise<CategoryTree> {
    try {
      console.log("🌳 Fetching category tree");

      const response = await api.get<ApiResponse<CategoryTreeNode[]>>(API_ENDPOINTS.CATEGORIES.TREE);

      let treeNodes: CategoryTreeNode[] = [];
      if (Array.isArray(response.data)) {
        treeNodes = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        treeNodes = (response.data as any).data || [];
      }

      // Construire l'arbre
      const tree = this.buildTree(treeNodes);

      console.log("✅ Category tree built with", tree.flat.length, "nodes");
      return tree;
    } catch (error: any) {
      console.error("❌ Error fetching category tree:", error);
      throw error;
    }
  },

  private buildTree(nodes: CategoryTreeNode[]): CategoryTree {
    const byUuid: Record<string, CategoryTreeNode> = {};
    const bySlug: Record<string, CategoryTreeNode> = {};
    const flat: CategoryTreeNode[] = [];

    // Créer les références et initialiser les enfants
    nodes.forEach(node => {
      const treeNode: CategoryTreeNode = {
        ...node,
        children: [],
        hasChildren: false,
        depth: 0,
      };

      byUuid[node.uuid] = treeNode;
      bySlug[node.slug] = treeNode;
      flat.push(treeNode);
    });

    // Construire la hiérarchie
    const root: CategoryTreeNode[] = [];

    flat.forEach(node => {
      if (node.parent_uuid && byUuid[node.parent_uuid]) {
        const parent = byUuid[node.parent_uuid];
        if (!parent.children) parent.children = [];
        parent.children.push(node);
        parent.hasChildren = true;
        node.depth = (parent.depth || 0) + 1;
      } else {
        root.push(node);
      }
    });

    // Trier les enfants par ordre
    const sortChildren = (nodes: CategoryTreeNode[]) => {
      nodes.sort((a, b) => (a.ordre || 0) - (b.ordre || 0));
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          sortChildren(node.children);
        }
      });
    };

    sortChildren(root);

    return { root, flat, byUuid, bySlug };
  },

  async getCategoryChildren(uuid: string): Promise<Category[]> {
    try {
      console.log("👶 Fetching children of category:", uuid);

      const { categories } = await this.getCategories({
        filters: { parent_uuid: uuid, est_actif: true }
      });

      console.log("✅ Found", categories.length, "children");
      return categories;
    } catch (error: any) {
      console.error("❌ Error fetching category children:", error);
      throw error;
    }
  },

  async getCategoryParent(uuid: string): Promise<Category | null> {
    try {
      console.log("👤 Fetching parent of category:", uuid);

      const category = await this.getCategory(uuid);
      if (!category.parent_uuid) {
        return null;
      }

      const parent = await this.getCategory(category.parent_uuid);
      return parent;
    } catch (error: any) {
      console.error("❌ Error fetching category parent:", error);
      throw error;
    }
  },

  async getCategoryAncestors(uuid: string): Promise<Category[]> {
    try {
      console.log("👨‍👩‍👧‍👦 Fetching ancestors of category:", uuid);

      const ancestors: Category[] = [];
      let currentUuid = uuid;

      while (currentUuid) {
        const category = await this.getCategory(currentUuid);
        if (category.parent_uuid) {
          const parent = await this.getCategory(category.parent_uuid);
          ancestors.unshift(parent);
          currentUuid = parent.uuid;
        } else {
          break;
        }

        // Limite de sécurité
        if (ancestors.length > 10) {
          console.warn("⚠️ Ancestors chain too long, possible circular reference");
          break;
        }
      }

      console.log("✅ Found", ancestors.length, "ancestors");
      return ancestors;
    } catch (error: any) {
      console.error("❌ Error fetching category ancestors:", error);
      throw error;
    }
  },

  async getCategoryDescendants(uuid: string, includeSelf: boolean = false): Promise<Category[]> {
    try {
      console.log("🌿 Fetching descendants of category:", uuid);

      const descendants: Category[] = [];

      const fetchDescendants = async (parentUuid: string) => {
        const children = await this.getCategoryChildren(parentUuid);

        for (const child of children) {
          descendants.push(child);
          await fetchDescendants(child.uuid);
        }
      };

      await fetchDescendants(uuid);

      if (includeSelf) {
        const self = await this.getCategory(uuid);
        descendants.unshift(self);
      }

      console.log("✅ Found", descendants.length, "descendants");
      return descendants;
    } catch (error: any) {
      console.error("❌ Error fetching category descendants:", error);
      throw error;
    }
  },

  async getCategoryPath(uuid: string): Promise<CategoryPath> {
    try {
      console.log("🗺️ Fetching category path:", uuid);

      const [category, ancestors, children] = await Promise.all([
        this.getCategory(uuid),
        this.getCategoryAncestors(uuid),
        this.getCategoryChildren(uuid)
      ]);

      const breadcrumbs: CategoryBreadcrumb[] = [
        ...ancestors.map(ancestor => ({
          uuid: ancestor.uuid,
          nom: ancestor.nom,
          slug: ancestor.slug,
          niveau: ancestor.niveau,
          url: `/categories/${ancestor.slug}`
        })),
        {
          uuid: category.uuid,
          nom: category.nom,
          slug: category.slug,
          niveau: category.niveau,
          url: `/categories/${category.slug}`
        }
      ];

      // Get siblings (autres catégories avec le même parent)
      let siblings: Category[] = [];
      if (category.parent_uuid) {
        const siblingsData = await this.getCategoryChildren(category.parent_uuid);
        siblings = siblingsData.filter(s => s.uuid !== uuid);
      }

      return {
        category,
        breadcrumbs,
        depth: ancestors.length,
        siblings,
        children
      };
    } catch (error: any) {
      console.error("❌ Error fetching category path:", error);
      throw error;
    }
  },

  async moveCategory(moveRequest: CategoryMoveRequest): Promise<Category> {
    try {
      console.log("🚚 Moving category:", moveRequest.category_uuid, "to parent:", moveRequest.new_parent_uuid);

      const endpoint = `/categories/${moveRequest.category_uuid}/move`;
      const response = await api.post<ApiResponse<Category>>(endpoint, moveRequest);

      let movedCategory: Category;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        movedCategory = (response.data as any).data;
      } else {
        movedCategory = response.data as Category;
      }

      console.log("✅ Category moved successfully");
      return movedCategory;
    } catch (error: any) {
      console.error("❌ Error moving category:", error);
      throw error;
    }
  },

  async duplicateCategory(duplicateRequest: CategoryDuplicateRequest): Promise<Category> {
    try {
      console.log("📝 Duplicating category:", duplicateRequest.source_uuid);

      const endpoint = `/categories/${duplicateRequest.source_uuid}/duplicate`;
      const response = await api.post<ApiResponse<Category>>(endpoint, duplicateRequest);

      let duplicatedCategory: Category;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        duplicatedCategory = (response.data as any).data;
      } else {
        duplicatedCategory = response.data as Category;
      }

      console.log("✅ Category duplicated successfully");
      return duplicatedCategory;
    } catch (error: any) {
      console.error("❌ Error duplicating category:", error);
      throw error;
    }
  },

  async sortCategories(sortRequest: CategorySortRequest): Promise<Category[]> {
    try {
      console.log("🔠 Sorting categories for parent:", sortRequest.parent_uuid || 'root');

      const endpoint = "/categories/sort";
      const response = await api.post<ApiResponse<Category[]>>(endpoint, sortRequest);

      let sortedCategories: Category[] = [];
      if (Array.isArray(response.data)) {
        sortedCategories = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        sortedCategories = (response.data as any).data || [];
      }

      console.log("✅ Categories sorted successfully");
      return sortedCategories;
    } catch (error: any) {
      console.error("❌ Error sorting categories:", error);
      throw error;
    }
  },

  // ==================== Content Management ====================

  async getCategoryProducts(uuid: string, params?: CategoryPaginationParams): Promise<{ produits: any[]; count: number }> {
    try {
      console.log("🛍️ Fetching products for category:", uuid);

      const endpoint = API_ENDPOINTS.CATEGORIES.PRODUITS(uuid);
      const queryParams = new URLSearchParams();

      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.search) queryParams.append("search", params.search);
      if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
      if (params?.sort_order) queryParams.append("sort_order", params.sort_order);

      const queryString = queryParams.toString();
      const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;

      const response = await api.get<ApiResponse<any[]>>(fullEndpoint);

      let produits: any[] = [];
      let count = 0;

      if (Array.isArray(response.data)) {
        produits = response.data;
        count = response.data.length;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        produits = (response.data as any).data || [];
        count = (response.data as any).count || produits.length;
      }

      console.log("✅ Found", produits.length, "products");
      return { produits, count };
    } catch (error: any) {
      console.error("❌ Error fetching category products:", error);
      throw error;
    }
  },

  async getCategoryAnnonces(uuid: string, params?: CategoryPaginationParams): Promise<{ annonces: any[]; count: number }> {
    try {
      console.log("📢 Fetching annonces for category:", uuid);

      const endpoint = API_ENDPOINTS.CATEGORIES.ANNONCES(uuid);
      const response = await api.get<ApiResponse<any[]>>(endpoint);

      let annonces: any[] = [];
      let count = 0;

      if (Array.isArray(response.data)) {
        annonces = response.data;
        count = response.data.length;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        annonces = (response.data as any).data || [];
        count = (response.data as any).count || annonces.length;
      }

      console.log("✅ Found", annonces.length, "annonces");
      return { annonces, count };
    } catch (error: any) {
      console.error("❌ Error fetching category annonces:", error);
      throw error;
    }
  },

  async getCategoryDons(uuid: string, params?: CategoryPaginationParams): Promise<{ dons: any[]; count: number }> {
    try {
      console.log("🎁 Fetching dons for category:", uuid);

      const endpoint = API_ENDPOINTS.CATEGORIES.DONS(uuid);
      const response = await api.get<ApiResponse<any[]>>(endpoint);

      let dons: any[] = [];
      let count = 0;

      if (Array.isArray(response.data)) {
        dons = response.data;
        count = response.data.length;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        dons = (response.data as any).data || [];
        count = (response.data as any).count || dons.length;
      }

      console.log("✅ Found", dons.length, "dons");
      return { dons, count };
    } catch (error: any) {
      console.error("❌ Error fetching category dons:", error);
      throw error;
    }
  },

  async getCategoryEchanges(uuid: string, params?: CategoryPaginationParams): Promise<{ echanges: any[]; count: number }> {
    try {
      console.log("🔄 Fetching echanges for category:", uuid);

      const endpoint = API_ENDPOINTS.CATEGORIES.ECHANGES(uuid);
      const response = await api.get<ApiResponse<any[]>>(endpoint);

      let echanges: any[] = [];
      let count = 0;

      if (Array.isArray(response.data)) {
        echanges = response.data;
        count = response.data.length;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        echanges = (response.data as any).data || [];
        count = (response.data as any).count || echanges.length;
      }

      console.log("✅ Found", echanges.length, "echanges");
      return { echanges, count };
    } catch (error: any) {
      console.error("❌ Error fetching category echanges:", error);
      throw error;
    }
  },

  async getAllCategoryContent(uuid: string, params?: CategoryPaginationParams): Promise<{
    produits: any[];
    annonces: any[];
    dons: any[];
    echanges: any[];
    totals: {
      produits: number;
      annonces: number;
      dons: number;
      echanges: number;
    };
  }> {
    try {
      console.log("📦 Fetching all content for category:", uuid);

      const [produits, annonces, dons, echanges] = await Promise.all([
        this.getCategoryProducts(uuid, params),
        this.getCategoryAnnonces(uuid, params),
        this.getCategoryDons(uuid, params),
        this.getCategoryEchanges(uuid, params)
      ]);

      return {
        produits: produits.produits,
        annonces: annonces.annonces,
        dons: dons.dons,
        echanges: echanges.echanges,
        totals: {
          produits: produits.count,
          annonces: annonces.count,
          dons: dons.count,
          echanges: echanges.count
        }
      };
    } catch (error: any) {
      console.error("❌ Error fetching all category content:", error);
      throw error;
    }
  },

  // ==================== Statistics & Analytics ====================

  async getCategoryStats(): Promise<CategoryStats> {
    try {
      console.log("📊 Fetching category statistics");

      // Récupérer toutes les catégories pour calculer les stats
      const { categories } = await this.getCategories({ limit: 1000 });

      // Calculer les statistiques
      const stats: CategoryStats = {
        total_categories: categories.length,
        categories_actives: categories.filter(c => c.est_actif).length,
        categories_visibles: categories.filter(c => c.est_visible).length,
        categories_archivees: categories.filter(c => c.est_archive).length,
        categories_racines: categories.filter(c => !c.parent_uuid).length,
        categories_avec_produits: categories.filter(c => c.nombre_produits > 0).length,
        categories_vides: categories.filter(c => c.nombre_produits === 0).length,

        par_type_contenu: {},
        par_niveau: {},
        par_emplacement_menu: {},

        produits_total: categories.reduce((sum, c) => sum + c.nombre_produits, 0),
        annonces_total: categories.reduce((sum, c) => sum + (c as any).nombre_annonces || 0, 0),
        dons_total: categories.reduce((sum, c) => sum + (c as any).nombre_dons || 0, 0),
        echanges_total: categories.reduce((sum, c) => sum + (c as any).nombre_echanges || 0, 0),

        moyenne_produits_par_categorie: categories.length > 0
          ? categories.reduce((sum, c) => sum + c.nombre_produits, 0) / categories.length
          : 0,
        moyenne_enfants_par_categorie: categories.length > 0
          ? categories.reduce((sum, c) => sum + (c.enfants?.length || 0), 0) / categories.length
          : 0
      };

      // Calculer les distributions
      categories.forEach(category => {
        // Par type de contenu
        const type = category.type_contenu || 'mixte';
        stats.par_type_contenu[type] = (stats.par_type_contenu[type] || 0) + 1;

        // Par niveau
        const niveau = `niveau_${category.niveau}`;
        stats.par_niveau[niveau] = (stats.par_niveau[niveau] || 0) + 1;

        // Par emplacement menu
        if (category.emplacement_menu) {
          stats.par_emplacement_menu[category.emplacement_menu] =
            (stats.par_emplacement_menu[category.emplacement_menu] || 0) + 1;
        }
      });

      console.log("✅ Category stats calculated:", stats);
      return stats;
    } catch (error: any) {
      console.error("❌ Error fetching category stats:", error);
      throw error;
    }
  },

  async getCategoryAnalytics(uuid: string, periode: 'jour' | 'semaine' | 'mois' | 'annee' = 'mois'): Promise<CategoryAnalytics> {
    try {
      console.log("📈 Getting category analytics:", uuid, "periode:", periode);

      const endpoint = `/categories/${uuid}/analytics`;
      const response = await api.get<ApiResponse<CategoryAnalytics>>(endpoint, {
        params: { periode }
      });

      // Structure par défaut
      const defaultAnalytics: CategoryAnalytics = {
        periode: {
          debut: new Date().toISOString(),
          fin: new Date().toISOString()
        },
        vues: {
          total: 0,
          par_jour: [],
          par_categorie: []
        },
        conversions: {
          taux: 0,
          clics: 0,
          produits_vus: 0,
          ajouts_panier: 0
        },
        popularite: {
          top_categories: [],
          categories_croissantes: [],
          categories_declinantes: []
        }
      };

      let analytics = defaultAnalytics;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        analytics = { ...defaultAnalytics, ...(response.data as any).data };
      } else if (response.data && typeof response.data === 'object') {
        analytics = { ...defaultAnalytics, ...response.data };
      }

      console.log("✅ Category analytics fetched");
      return analytics;
    } catch (error: any) {
      console.error("❌ Error getting category analytics:", error);
      throw error;
    }
  },

  // ==================== Search & Filter ====================

  async searchCategories(query: string, filters?: CategoryFilterParams): Promise<CategorySearchResult> {
    try {
      console.log("🔍 Searching categories:", query);

      const { categories } = await this.getCategories({
        search: query,
        filters: filters
      });

      // Générer des suggestions
      const suggestions = this.generateSearchSuggestions(query, categories);

      // Trouver les catégories apparentées
      const relatedCategories = await this.getRelatedCategories(categories[0]?.uuid, 5);

      return {
        categories,
        exact_match: categories.find(c =>
          c.nom.toLowerCase() === query.toLowerCase() ||
          c.slug === query.toLowerCase()
        ),
        suggestions,
        related_categories: relatedCategories,
        total: categories.length,
        filters_available: filters || {}
      };
    } catch (error: any) {
      console.error("❌ Error searching categories:", error);
      throw error;
    }
  },

  async getRelatedCategories(categoryUuid: string, limit: number = 5): Promise<Category[]> {
    try {
      console.log("🤝 Getting related categories for:", categoryUuid);

      if (!categoryUuid) return [];

      const category = await this.getCategory(categoryUuid);
      const parentUuid = category.parent_uuid;

      let related: Category[] = [];

      if (parentUuid) {
        // Récupérer les frères et sœurs
        const siblings = await this.getCategoryChildren(parentUuid);
        related = siblings.filter(s => s.uuid !== categoryUuid).slice(0, limit);
      } else {
        // Pour les catégories racines, prendre d'autres catégories racines
        const { categories } = await this.getCategories({
          filters: { parent_uuid: null },
          limit
        });
        related = categories.filter(c => c.uuid !== categoryUuid);
      }

      console.log("✅ Found", related.length, "related categories");
      return related;
    } catch (error: any) {
      console.error("❌ Error getting related categories:", error);
      throw error;
    }
  },

  private generateSearchSuggestions(query: string, categories: Category[]): string[] {
    const suggestions: string[] = [];

    if (!query || query.length < 2) return suggestions;

    // Extraire les mots-clés des catégories similaires
    const commonKeywords = new Set<string>();

    categories.forEach(category => {
      // Ajouter le nom de la catégorie parente comme suggestion
      if (category.parent?.nom.toLowerCase().includes(query.toLowerCase())) {
        commonKeywords.add(category.parent.nom);
      }

      // Ajouter les mots-clés comme suggestions
      if (category.mots_cles) {
        category.mots_cles.forEach(motCle => {
          if (motCle.toLowerCase().includes(query.toLowerCase())) {
            commonKeywords.add(motCle);
          }
        });
      }

      // Suggestions basées sur le type de contenu
      if (category.type_contenu.toLowerCase().includes(query.toLowerCase())) {
        commonKeywords.add(category.type_contenu);
      }
    });

    return Array.from(commonKeywords).slice(0, 5);
  },

  async getCategoriesByType(type_contenu: Category["type_contenu"], params?: CategoryPaginationParams): Promise<{ categories: Category[]; count: number }> {
    try {
      console.log("📋 Getting categories by type:", type_contenu);

      const { categories, count } = await this.getCategories({
        ...params,
        filters: { type_contenu, est_actif: true }
      });

      console.log("✅ Found", categories.length, "categories of type", type_contenu);
      return { categories, count: count || categories.length };
    } catch (error: any) {
      console.error("❌ Error getting categories by type:", error);
      throw error;
    }
  },

  async getRootCategories(): Promise<Category[]> {
    try {
      console.log("🌱 Getting root categories");

      const { categories } = await this.getCategories({
        filters: { parent_uuid: null, est_actif: true },
        sort_by: "ordre",
        sort_order: "asc"
      });

      console.log("✅ Found", categories.length, "root categories");
      return categories;
    } catch (error: any) {
      console.error("❌ Error getting root categories:", error);
      throw error;
    }
  },

  async getVisibleCategories(): Promise<Category[]> {
    try {
      console.log("👁️ Getting visible categories");

      const { categories } = await this.getCategories({
        filters: { est_visible: true, est_actif: true },
        sort_by: "ordre",
        sort_order: "asc"
      });

      console.log("✅ Found", categories.length, "visible categories");
      return categories;
    } catch (error: any) {
      console.error("❌ Error getting visible categories:", error);
      throw error;
    }
  },

  async getMenuCategories(): Promise<CategoryMenu[]> {
    try {
      console.log("🍽️ Getting menu categories");

      const { categories } = await this.getCategories({
        filters: { est_dans_menu: true, est_actif: true, est_visible: true },
        sort_by: "ordre",
        sort_order: "asc"
      });

      // Convertir en format menu avec enfants
      const menuMap = new Map<string, CategoryMenu>();
      const rootMenus: CategoryMenu[] = [];

      categories.forEach(category => {
        const menuItem: CategoryMenu = {
          uuid: category.uuid,
          nom: category.nom,
          slug: category.slug,
          icon: category.icon,
          children: [],
          badge: category.nombre_produits,
          is_active: category.est_actif,
          url: `/categories/${category.slug}`
        };

        menuMap.set(category.uuid, menuItem);

        if (!category.parent_uuid) {
          rootMenus.push(menuItem);
        }
      });

      // Ajouter les enfants à leurs parents
      categories.forEach(category => {
        if (category.parent_uuid) {
          const parentMenu = menuMap.get(category.parent_uuid);
          const childMenu = menuMap.get(category.uuid);
          if (parentMenu && childMenu) {
            parentMenu.children!.push(childMenu);
          }
        }
      });

      console.log("✅ Menu categories built with", rootMenus.length, "root items");
      return rootMenus;
    } catch (error: any) {
      console.error("❌ Error getting menu categories:", error);
      throw error;
    }
  },

  // ==================== Validation ====================

  async validateCategory(categoryData: CategoryCreateData | CategoryUpdateData, excludeUuid?: string): Promise<CategoryValidationResult> {
    try {
      console.log("✅ Validating category data");

      const errors: string[] = [];
      const warnings: string[] = [];
      const suggestions: string[] = [];

      // Validation de base
      if ('nom' in categoryData) {
        if (!categoryData.nom || categoryData.nom.trim().length === 0) {
          errors.push("Le nom de la catégorie est obligatoire");
        } else if (categoryData.nom.length < 2) {
          errors.push("Le nom doit contenir au moins 2 caractères");
        } else if (categoryData.nom.length > 100) {
          errors.push("Le nom ne doit pas dépasser 100 caractères");
        }
      }

      if ('slug' in categoryData && categoryData.slug) {
        const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
        if (!slugRegex.test(categoryData.slug)) {
          errors.push("Le slug ne doit contenir que des lettres minuscules, chiffres et tirets");
        } else {
          // Vérifier si le slug est disponible
          const isAvailable = await this.isSlugAvailable(categoryData.slug, excludeUuid);
          if (!isAvailable) {
            errors.push("Ce slug est déjà utilisé par une autre catégorie");
          }
        }
      }

      if ('description' in categoryData && categoryData.description) {
        if (categoryData.description.length > 5000) {
          warnings.push("La description est très longue, envisagez de la raccourcir");
        }
      }

      if ('type_contenu' in categoryData) {
        const validTypes = ["produit", "annonce", "don", "echange", "mixte"];
        if (!validTypes.includes(categoryData.type_contenu)) {
          errors.push("Type de contenu invalide");
        }
      }

      if ('parent_uuid' in categoryData && categoryData.parent_uuid) {
        try {
          const parent = await this.getCategory(categoryData.parent_uuid);
          if (parent.est_archive) {
            warnings.push("La catégorie parente est archivée");
          }

          // Vérifier la circularité
          if (excludeUuid && await this.wouldCreateCircularReference(excludeUuid, categoryData.parent_uuid)) {
            errors.push("Impossible de créer une référence circulaire");
          }
        } catch {
          errors.push("Catégorie parente invalide");
        }
      }

      // Suggestions
      if (!('icon' in categoryData) || !categoryData.icon) {
        suggestions.push("Ajoutez une icône pour une meilleure identification visuelle");
      }

      if (!('description_courte' in categoryData) || !categoryData.description_courte) {
        suggestions.push("Ajoutez une description courte pour les aperçus");
      }

      if (!('mots_cles' in categoryData) || !categoryData.mots_cles?.length) {
        suggestions.push("Ajoutez des mots-clés pour améliorer la recherche");
      }

      const isValid = errors.length === 0;

      return {
        isValid,
        errors,
        warnings,
        suggestions,
        slug_available: !('slug' in categoryData) || await this.isSlugAvailable(categoryData.slug || '', excludeUuid),
        parent_valid: !('parent_uuid' in categoryData) || !categoryData.parent_uuid ||
          await this.isParentValid(categoryData.parent_uuid, excludeUuid)
      };
    } catch (error: any) {
      console.error("❌ Error validating category:", error);
      throw error;
    }
  },

  private async isSlugAvailable(slug: string, excludeUuid?: string): Promise<boolean> {
    try {
      // Essayer de récupérer une catégorie avec ce slug
      const category = await this.getCategoryBySlug(slug);
      // Si une catégorie existe et que ce n'est pas celle qu'on exclut, le slug n'est pas disponible
      return !category || category.uuid === excludeUuid;
    } catch {
      // Si on a une erreur (404), le slug est disponible
      return true;
    }
  },

  private async isParentValid(parentUuid: string, excludeUuid?: string): Promise<boolean> {
    try {
      const parent = await this.getCategory(parentUuid);
      if (parent.uuid === excludeUuid) {
        return false; // Ne peut pas être son propre parent
      }
      return true;
    } catch {
      return false;
    }
  },

  private async wouldCreateCircularReference(categoryUuid: string, potentialParentUuid: string): Promise<boolean> {
    try {
      if (categoryUuid === potentialParentUuid) {
        return true;
      }

      // Récupérer tous les descendants de la catégorie
      const descendants = await this.getCategoryDescendants(categoryUuid, false);
      return descendants.some(desc => desc.uuid === potentialParentUuid);
    } catch {
      return false;
    }
  },

  // ==================== Bulk Operations ====================

  async bulkUpdateCategories(bulkUpdate: CategoryBulkUpdate): Promise<Category[]> {
    try {
      console.log("🔄 Bulk updating", bulkUpdate.uuids.length, "categories");

      const endpoint = "/categories/bulk-update";
      const response = await api.post<ApiResponse<Category[]>>(endpoint, bulkUpdate);

      let updatedCategories: Category[] = [];
      if (Array.isArray(response.data)) {
        updatedCategories = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        updatedCategories = (response.data as any).data || [];
      }

      console.log("✅ Categories bulk updated:", updatedCategories.length);
      return updatedCategories;
    } catch (error: any) {
      console.error("❌ Error bulk updating categories:", error);
      throw error;
    }
  },

  async bulkToggleVisibility(visibilityRequest: CategoryVisibilityRequest): Promise<Category[]> {
    try {
      console.log("👁️ Bulk toggling visibility for", visibilityRequest.category_uuids.length, "categories");

      const endpoint = "/categories/bulk-visibility";
      const response = await api.post<ApiResponse<Category[]>>(endpoint, visibilityRequest);

      let updatedCategories: Category[] = [];
      if (Array.isArray(response.data)) {
        updatedCategories = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        updatedCategories = (response.data as any).data || [];
      }

      console.log("✅ Categories visibility updated:", updatedCategories.length);
      return updatedCategories;
    } catch (error: any) {
      console.error("❌ Error bulk toggling visibility:", error);
      throw error;
    }
  },

  async bulkDeleteCategories(uuids: string[], force: boolean = false): Promise<{ deleted: number; errors: string[] }> {
    try {
      console.log("🗑️ Bulk deleting", uuids.length, "categories");

      const endpoint = "/categories/bulk-delete";
      const response = await api.post<ApiResponse<{ deleted: number; errors: string[] }>>(
        endpoint,
        { uuids, force }
      );

      let result: { deleted: number; errors: string[] };
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        result = (response.data as any).data;
      } else {
        result = response.data as { deleted: number; errors: string[] };
      }

      console.log("✅ Categories bulk deleted:", result.deleted, "errors:", result.errors.length);
      return result;
    } catch (error: any) {
      console.error("❌ Error bulk deleting categories:", error);
      throw error;
    }
  },

  // ==================== Import & Export ====================

  async importCategories(data: CategoryImportData[], options?: {
    onConflict: "skip" | "update" | "merge";
    createParents: boolean;
  }): Promise<CategoryImportResult> {
    try {
      console.log("📥 Importing", data.length, "categories");

      const endpoint = "/categories/import";
      const response = await api.post<ApiResponse<CategoryImportResult>>(endpoint, {
        data,
        options: options || { onConflict: "skip", createParents: false }
      });

      let result: CategoryImportResult;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        result = (response.data as any).data;
      } else {
        result = response.data as CategoryImportResult;
      }

      console.log("✅ Categories import completed:", result);
      return result;
    } catch (error: any) {
      console.error("❌ Error importing categories:", error);
      throw error;
    }
  },

  async exportCategories(options: CategoryExportOptions): Promise<Blob> {
    try {
      console.log("📤 Exporting categories in", options.format, "format");

      const endpoint = API_ENDPOINTS.CATEGORIES.EXPORT_PDF; // À adapter selon le format
      const response = await api.post(
        endpoint,
        options,
        { responseType: "blob" }
      );

      console.log("✅ Categories exported successfully");
      return response;
    } catch (error: any) {
      console.error("❌ Error exporting categories:", error);
      throw error;
    }
  },

  // ==================== Templates & Configurations ====================

  async getCategoryTemplate(uuid: string): Promise<CategoryTemplate> {
    try {
      console.log("🎨 Getting category template:", uuid);

      const endpoint = `/categories/${uuid}/template`;
      const response = await api.get<ApiResponse<CategoryTemplate>>(endpoint);

      let template: CategoryTemplate;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        template = (response.data as any).data;
      } else {
        template = response.data as CategoryTemplate;
      }

      console.log("✅ Category template fetched");
      return template;
    } catch (error: any) {
      console.error("❌ Error getting category template:", error);
      throw error;
    }
  },

  async updateCategoryTemplate(uuid: string, template: CategoryTemplate): Promise<CategoryTemplate> {
    try {
      console.log("🎨 Updating category template:", uuid);

      const endpoint = `/categories/${uuid}/template`;
      const response = await api.put<ApiResponse<CategoryTemplate>>(endpoint, template);

      let updatedTemplate: CategoryTemplate;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        updatedTemplate = (response.data as any).data;
      } else {
        updatedTemplate = response.data as CategoryTemplate;
      }

      console.log("✅ Category template updated");
      return updatedTemplate;
    } catch (error: any) {
      console.error("❌ Error updating category template:", error);
      throw error;
    }
  },

  async applyTemplateToChildren(uuid: string, templateId: string): Promise<Category[]> {
    try {
      console.log("🎨 Applying template", templateId, "to children of category:", uuid);

      const endpoint = `/categories/${uuid}/apply-template`;
      const response = await api.post<ApiResponse<Category[]>>(endpoint, { templateId });

      let updatedCategories: Category[] = [];
      if (Array.isArray(response.data)) {
        updatedCategories = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        updatedCategories = (response.data as any).data || [];
      }

      console.log("✅ Template applied to", updatedCategories.length, "children");
      return updatedCategories;
    } catch (error: any) {
      console.error("❌ Error applying template to children:", error);
      throw error;
    }
  },

  // ==================== Utilities ====================

  async generateSlug(nom: string, parentUuid?: string): Promise<string> {
    try {
      console.log("🔗 Generating slug for:", nom);

      // Générer le slug de base
      let baseSlug = nom
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 50);

      // Si on a un parent, on peut vouloir préfixer avec le slug du parent
      if (parentUuid) {
        try {
          const parent = await this.getCategory(parentUuid);
          baseSlug = `${parent.slug}-${baseSlug}`;
        } catch {
          // Ignorer si le parent n'existe pas
        }
      }

      // Vérifier si le slug existe déjà et ajouter un suffixe si nécessaire
      let slug = baseSlug;
      let suffix = 1;

      while (true) {
        try {
          const exists = await this.getCategoryBySlug(slug);
          if (exists) {
            slug = `${baseSlug}-${suffix}`;
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
          slug = `${baseSlug}-${Date.now()}`;
          break;
        }
      }

      console.log("✅ Slug generated:", slug);
      return slug;
    } catch (error: any) {
      console.error("❌ Error generating slug:", error);
      throw error;
    }
  },

  async getHierarchy(): Promise<CategoryHierarchy[]> {
    try {
      console.log("🌳 Building category hierarchy");

      const tree = await this.getCategoryTree();

      const convertToHierarchy = (nodes: CategoryTreeNode[], level: number = 0): CategoryHierarchy[] => {
        return nodes.map(node => ({
          id: node.uuid,
          name: node.nom,
          slug: node.slug,
          children: node.children ? convertToHierarchy(node.children, level + 1) : undefined,
          level,
          hasProducts: node.nombre_produits > 0,
          productCount: node.nombre_produits,
          isActive: node.est_actif
        }));
      };

      const hierarchy = convertToHierarchy(tree.root);
      console.log("✅ Hierarchy built with", hierarchy.length, "root nodes");
      return hierarchy;
    } catch (error: any) {
      console.error("❌ Error building hierarchy:", error);
      throw error;
    }
  },

  async findCategoryByPath(path: string[]): Promise<Category | null> {
    try {
      console.log("🛣️ Finding category by path:", path.join('/'));

      if (path.length === 0) return null;

      let currentSlug = path[0];
      let currentCategory: Category | null = null;

      // Chercher la catégorie racine
      try {
        currentCategory = await this.getCategoryBySlug(currentSlug);
      } catch {
        return null;
      }

      // Parcourir le chemin
      for (let i = 1; i < path.length; i++) {
        const childSlug = path[i];
        const children = await this.getCategoryChildren(currentCategory.uuid);

        const child = children.find(c => c.slug === childSlug);
        if (!child) {
          return null;
        }

        currentCategory = child;
      }

      console.log("✅ Category found by path:", currentCategory?.nom);
      return currentCategory;
    } catch (error: any) {
      console.error("❌ Error finding category by path:", error);
      throw error;
    }
  },

  async getBreadcrumbs(uuid: string): Promise<CategoryBreadcrumb[]> {
    try {
      console.log("🍞 Getting breadcrumbs for category:", uuid);

      const path = await this.getCategoryPath(uuid);
      return path.breadcrumbs;
    } catch (error: any) {
      console.error("❌ Error getting breadcrumbs:", error);
      throw error;
    }
  },

  async countCategoriesByLevel(): Promise<Record<number, number>> {
    try {
      console.log("📈 Counting categories by level");

      const tree = await this.getCategoryTree();
      const counts: Record<number, number> = {};

      const countLevels = (nodes: CategoryTreeNode[], level: number) => {
        counts[level] = (counts[level] || 0) + nodes.length;
        nodes.forEach(node => {
          if (node.children && node.children.length > 0) {
            countLevels(node.children, level + 1);
          }
        });
      };

      countLevels(tree.root, 0);

      console.log("✅ Category counts by level:", counts);
      return counts;
    } catch (error: any) {
      console.error("❌ Error counting categories by level:", error);
      throw error;
    }
  },

  // ==================== Debug & Test Methods ====================

  async testCategoryService(): Promise<boolean> {
    try {
      console.log("🧪 Testing category service...");

      // Test basic operations
      await this.getCategories({ limit: 1 });
      await this.getRootCategories();

      console.log("✅ Category service is operational");
      return true;
    } catch (error: any) {
      console.error("❌ Category service test failed:", error.message);
      return false;
    }
  },

  async getCategoryWithCounts(uuid: string): Promise<CategoryWithCounts> {
    try {
      console.log("📊 Getting category with counts:", uuid);

      const [category, products, children] = await Promise.all([
        this.getCategory(uuid),
        this.getCategoryProducts(uuid),
        this.getCategoryChildren(uuid)
      ]);

      const categoryWithCounts: CategoryWithCounts = {
        ...category,
        counts: {
          produits: products.count,
          annonces: 0, // À calculer si nécessaire
          dons: 0, // À calculer si nécessaire
          echanges: 0, // À calculer si nécessaire
          enfants: children.length
        }
      };

      if (category.parent_uuid) {
        try {
          const parent = await this.getCategory(category.parent_uuid);
          categoryWithCounts.parent_info = {
            uuid: parent.uuid,
            nom: parent.nom,
            slug: parent.slug
          };
        } catch {
          // Parent non trouvé, ignorer
        }
      }

      console.log("✅ Category with counts fetched");
      return categoryWithCounts;
    } catch (error: any) {
      console.error("❌ Error getting category with counts:", error);
      throw error;
    }
  },

  async getFeaturedCategories(limit: number = 8): Promise<Category[]> {
    try {
      console.log("⭐ Getting featured categories");

      const { categories } = await this.getCategories({
        limit,
        filters: { est_visible: true, est_actif: true, has_products: true },
        sort_by: "popularite",
        sort_order: "desc"
      });

      console.log("✅ Found", categories.length, "featured categories");
      return categories;
    } catch (error: any) {
      console.error("❌ Error getting featured categories:", error);
      throw error;
    }
  },

  async getPopularCategories(limit: number = 10): Promise<Category[]> {
    try {
      console.log("🔥 Getting popular categories");

      const { categories } = await this.getCategories({
        limit,
        filters: { est_visible: true, est_actif: true },
        sort_by: "nombre_vues",
        sort_order: "desc"
      });

      console.log("✅ Found", categories.length, "popular categories");
      return categories;
    } catch (error: any) {
      console.error("❌ Error getting popular categories:", error);
      throw error;
    }
  },

  async getCategoriesWithMostProducts(limit: number = 10): Promise<Category[]> {
    try {
      console.log("📦 Getting categories with most products");

      const { categories } = await this.getCategories({
        limit,
        filters: { est_visible: true, est_actif: true },
        sort_by: "nombre_produits",
        sort_order: "desc"
      });

      console.log("✅ Found", categories.length, "categories with most products");
      return categories;
    } catch (error: any) {
      console.error("❌ Error getting categories with most products:", error);
      throw error;
    }
  },
};
