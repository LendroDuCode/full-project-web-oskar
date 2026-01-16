// services/articles/article.service.ts
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import type {
  Article,
  ArticleCreateData,
  ArticleUpdateData,
  PaginationParams,
  ArticleStats,
  ArticleFilters,
  SearchParams,
  ArticleSearchResult,
  ArticleComment,
  ArticleCommentCreateData,
  ArticleExportFormat
} from "./article.types";

export interface ApiResponse<T> {
  data: T;
  status: string;
  message?: string;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
}

export const articleService = {
  // ==================== CRUD Operations ====================

  async getArticles(params?: PaginationParams): Promise<{ articles: Article[]; count?: number; total?: number; page?: number; pages?: number }> {
    const queryParams = new URLSearchParams();

    // Paramètres de pagination
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    // Filtres
    if (params?.categorie_uuid) queryParams.append("categorie_uuid", params.categorie_uuid);
    if (params?.sous_categorie_uuid) queryParams.append("sous_categorie_uuid", params.sous_categorie_uuid);
    if (params?.auteur_uuid) queryParams.append("auteur_uuid", params.auteur_uuid);
    if (params?.statut) queryParams.append("statut", params.statut);
    if (params?.est_public !== undefined) queryParams.append("est_public", params.est_public.toString());
    if (params?.est_epingle !== undefined) queryParams.append("est_epingle", params.est_epingle.toString());
    if (params?.est_populaire !== undefined) queryParams.append("est_populaire", params.est_populaire.toString());
    if (params?.est_tendance !== undefined) queryParams.append("est_tendance", params.est_tendance.toString());
    if (params?.est_mis_en_avant !== undefined) queryParams.append("est_mis_en_avant", params.est_mis_en_avant.toString());
    if (params?.lang) queryParams.append("lang", params.lang);
    if (params?.date_debut) queryParams.append("date_debut", params.date_debut);
    if (params?.date_fin) queryParams.append("date_fin", params.date_fin);
    if (params?.date_publication_debut) queryParams.append("date_publication_debut", params.date_publication_debut);
    if (params?.date_publication_fin) queryParams.append("date_publication_fin", params.date_publication_fin);

    // Tags (multiple)
    if (params?.tags && params.tags.length > 0) {
      params.tags.forEach(tag => queryParams.append("tags[]", tag));
    }

    const queryString = queryParams.toString();

    // NOTE: Vous devez définir cette route dans vos API_ENDPOINTS
    // Par exemple: API_ENDPOINTS.ARTICLES.LIST = "/articles"
    const endpoint = "/articles"; // À remplacer par votre endpoint réel
    const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;

    console.log("📡 Fetching articles from:", fullEndpoint);

    try {
      const response = await api.get<ApiResponse<Article[]>>(fullEndpoint);

      console.log("✅ Articles response received:", {
        hasData: !!response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
      });

      let articles: Article[] = [];
      let count = 0;
      let total = 0;
      let page = 1;
      let pages = 1;

      // Vérifier la structure de la réponse
      if (Array.isArray(response.data)) {
        // L'API retourne directement un tableau
        articles = response.data;
        count = response.data.length;
        console.log("📊 API returned array directly, count:", count);
      } else if (response.data && typeof response.data === 'object') {
        // Vérifier si c'est une réponse wrapper
        if ('data' in response.data && Array.isArray((response.data as any).data)) {
          // Structure: { data: [...], status: "success", count: X }
          articles = (response.data as any).data || [];
          count = (response.data as any).count || articles.length;
          total = (response.data as any).total || count;
          page = (response.data as any).page || 1;
          pages = (response.data as any).pages || 1;
          console.log("📊 API returned wrapped data, count:", count);
        } else if ('articles' in response.data && Array.isArray((response.data as any).articles)) {
          // Structure alternative: { articles: [...], count: X }
          articles = (response.data as any).articles || [];
          count = (response.data as any).count || articles.length;
          total = (response.data as any).total || count;
          page = (response.data as any).page || 1;
          pages = (response.data as any).pages || 1;
          console.log("📊 API returned articles data, count:", count);
        } else {
          console.warn("⚠️ Unexpected response format:", response.data);
        }
      }

      return { articles, count, total, page, pages };
    } catch (error: any) {
      console.error("🚨 Error in articleService.getArticles:", {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  async getArticle(uuid: string): Promise<Article> {
    try {
      console.log("🔍 Fetching article:", uuid);

      // NOTE: Vous devez définir cette route dans vos API_ENDPOINTS
      const endpoint = `/articles/${uuid}`; // À remplacer par votre endpoint réel
      const response = await api.get<ApiResponse<Article>>(endpoint);

      console.log("✅ Article response:", {
        hasData: !!response.data,
        dataType: typeof response.data,
        hasWrappedData: response.data && typeof response.data === 'object' && 'data' in response.data
      });

      let articleData: Article;

      // Vérifier la structure de la réponse
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        // Structure: { data: {...}, status: "success" }
        articleData = (response.data as any).data;
        console.log("📊 Using wrapped data structure");
      } else if (response.data && (response.data as any).uuid) {
        // Structure: l'article directement
        articleData = response.data as Article;
        console.log("📊 Using direct article structure");
      } else {
        console.error("❌ Invalid article data structure:", response.data);
        throw new Error("Structure de données article invalide");
      }

      if (!articleData || !articleData.uuid) {
        throw new Error("Article non trouvé");
      }

      console.log("✅ Article found:", articleData.titre);
      return articleData;
    } catch (error: any) {
      console.error("❌ Error fetching article:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  async createArticle(articleData: ArticleCreateData): Promise<Article> {
    try {
      console.log("🆕 Creating article:", articleData.titre);

      // NOTE: Vous devez définir cette route dans vos API_ENDPOINTS
      const endpoint = "/articles"; // À remplacer par votre endpoint réel
      const response = await api.post<ApiResponse<Article>>(
        endpoint,
        articleData,
      );

      console.log("✅ Article creation response:", response.data);

      // Vérifier la structure de la réponse
      let createdArticle: Article;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        createdArticle = (response.data as any).data;
      } else {
        createdArticle = response.data as Article;
      }

      if (!createdArticle || !createdArticle.uuid) {
        throw new Error("Échec de la création de l'article");
      }

      return createdArticle;
    } catch (error: any) {
      console.error("❌ Error creating article:", {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  async updateArticle(uuid: string, articleData: ArticleUpdateData): Promise<Article> {
    try {
      console.log("✏️ Updating article:", uuid);

      // NOTE: Vous devez définir cette route dans vos API_ENDPOINTS
      const endpoint = `/articles/${uuid}`; // À remplacer par votre endpoint réel
      const response = await api.put<ApiResponse<Article>>(
        endpoint,
        articleData,
      );

      console.log("✅ Article update response:", response.data);

      // Vérifier la structure de la réponse
      let updatedArticle: Article;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        updatedArticle = (response.data as any).data;
      } else {
        updatedArticle = response.data as Article;
      }

      return updatedArticle;
    } catch (error: any) {
      console.error("❌ Error updating article:", error);
      throw error;
    }
  },

  async deleteArticle(uuid: string): Promise<void> {
    try {
      console.log("🗑️ Deleting article:", uuid);

      // NOTE: Vous devez définir cette route dans vos API_ENDPOINTS
      const endpoint = `/articles/${uuid}`; // À remplacer par votre endpoint réel
      await api.delete(endpoint);

      console.log("✅ Article deleted successfully");
    } catch (error: any) {
      console.error("❌ Error deleting article:", error);
      throw error;
    }
  },

  // ==================== Status Management ====================

  async publishArticle(uuid: string, datePublication?: string): Promise<Article> {
    try {
      console.log("📢 Publishing article:", uuid);

      const endpoint = `/articles/${uuid}/publish`;
      const response = await api.post<ApiResponse<Article>>(
        endpoint,
        { date_publication: datePublication || new Date().toISOString() }
      );

      let publishedArticle: Article;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        publishedArticle = (response.data as any).data;
      } else {
        publishedArticle = response.data as Article;
      }

      console.log("✅ Article published successfully");
      return publishedArticle;
    } catch (error: any) {
      console.error("❌ Error publishing article:", error);
      throw error;
    }
  },

  async unpublishArticle(uuid: string): Promise<Article> {
    try {
      console.log("🚫 Unpublishing article:", uuid);

      const endpoint = `/articles/${uuid}/unpublish`;
      const response = await api.post<ApiResponse<Article>>(endpoint, {});

      let unpublishedArticle: Article;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        unpublishedArticle = (response.data as any).data;
      } else {
        unpublishedArticle = response.data as Article;
      }

      console.log("✅ Article unpublished successfully");
      return unpublishedArticle;
    } catch (error: any) {
      console.error("❌ Error unpublishing article:", error);
      throw error;
    }
  },

  async archiveArticle(uuid: string): Promise<Article> {
    try {
      console.log("📦 Archiving article:", uuid);

      const endpoint = `/articles/${uuid}/archive`;
      const response = await api.post<ApiResponse<Article>>(endpoint, {});

      let archivedArticle: Article;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        archivedArticle = (response.data as any).data;
      } else {
        archivedArticle = response.data as Article;
      }

      console.log("✅ Article archived successfully");
      return archivedArticle;
    } catch (error: any) {
      console.error("❌ Error archiving article:", error);
      throw error;
    }
  },

  async approveArticle(uuid: string): Promise<Article> {
    try {
      console.log("✅ Approving article:", uuid);

      const endpoint = `/articles/${uuid}/approve`;
      const response = await api.post<ApiResponse<Article>>(endpoint, {});

      let approvedArticle: Article;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        approvedArticle = (response.data as any).data;
      } else {
        approvedArticle = response.data as Article;
      }

      console.log("✅ Article approved successfully");
      return approvedArticle;
    } catch (error: any) {
      console.error("❌ Error approving article:", error);
      throw error;
    }
  },

  async rejectArticle(uuid: string, raison?: string): Promise<Article> {
    try {
      console.log("❌ Rejecting article:", uuid);

      const endpoint = `/articles/${uuid}/reject`;
      const response = await api.post<ApiResponse<Article>>(
        endpoint,
        { raison }
      );

      let rejectedArticle: Article;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        rejectedArticle = (response.data as any).data;
      } else {
        rejectedArticle = response.data as Article;
      }

      console.log("✅ Article rejected successfully");
      return rejectedArticle;
    } catch (error: any) {
      console.error("❌ Error rejecting article:", error);
      throw error;
    }
  },

  // ==================== Specialized Lists ====================

  async getPublishedArticles(params?: PaginationParams): Promise<{ articles: Article[]; count?: number }> {
    const result = await this.getArticles({
      ...params,
      statut: 'publie',
      est_public: true
    });
    return { articles: result.articles, count: result.count };
  },

  async getDraftArticles(params?: PaginationParams): Promise<{ articles: Article[]; count?: number }> {
    const result = await this.getArticles({
      ...params,
      statut: 'brouillon'
    });
    return { articles: result.articles, count: result.count };
  },

  async getPendingArticles(params?: PaginationParams): Promise<{ articles: Article[]; count?: number }> {
    const result = await this.getArticles({
      ...params,
      statut: 'en_revision'
    });
    return { articles: result.articles, count: result.count };
  },

  async getFeaturedArticles(limit: number = 6): Promise<Article[]> {
    const { articles } = await this.getArticles({
      limit,
      est_mis_en_avant: true,
      statut: 'publie',
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
    return articles;
  },

  async getPopularArticles(limit: number = 10): Promise<Article[]> {
    const { articles } = await this.getArticles({
      limit,
      est_populaire: true,
      statut: 'publie',
      sortBy: 'vues',
      sortOrder: 'desc'
    });
    return articles;
  },

  async getTrendingArticles(limit: number = 5): Promise<Article[]> {
    const { articles } = await this.getArticles({
      limit,
      est_tendance: true,
      statut: 'publie',
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
    return articles;
  },

  async getPinnedArticles(limit: number = 3): Promise<Article[]> {
    const { articles } = await this.getArticles({
      limit,
      est_epingle: true,
      statut: 'publie',
      sortBy: 'ordre_affichage',
      sortOrder: 'asc'
    });
    return articles;
  },

  async getRecentArticles(limit: number = 10): Promise<Article[]> {
    const { articles } = await this.getArticles({
      limit,
      statut: 'publie',
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
    return articles;
  },

  async getArticlesByCategory(categorieUuid: string, params?: PaginationParams): Promise<{ articles: Article[]; count?: number }> {
    const result = await this.getArticles({
      ...params,
      categorie_uuid: categorieUuid,
      statut: 'publie'
    });
    return { articles: result.articles, count: result.count };
  },

  async getArticlesByAuthor(auteurUuid: string, params?: PaginationParams): Promise<{ articles: Article[]; count?: number }> {
    const result = await this.getArticles({
      ...params,
      auteur_uuid: auteurUuid
    });
    return { articles: result.articles, count: result.count };
  },

  async getArticlesByTag(tag: string, params?: PaginationParams): Promise<{ articles: Article[]; count?: number }> {
    const result = await this.getArticles({
      ...params,
      tags: [tag],
      statut: 'publie'
    });
    return { articles: result.articles, count: result.count };
  },

  // ==================== Search & Filter ====================

  async searchArticles(searchParams: SearchParams): Promise<ArticleSearchResult> {
    try {
      console.log("🔍 Searching articles:", searchParams.query);

      const { articles, count, total } = await this.getArticles({
        ...searchParams.pagination,
        search: searchParams.query,
        ...this.convertFiltersToParams(searchParams.filters)
      });

      // Générer des suggestions basées sur la recherche
      const suggestions = this.generateSearchSuggestions(searchParams.query, articles);

      return {
        articles,
        count,
        total,
        suggestions,
        filters_available: searchParams.filters
      };
    } catch (error: any) {
      console.error("❌ Error searching articles:", error);
      throw error;
    }
  },

  async filterArticles(filters: ArticleFilters, params?: PaginationParams): Promise<{ articles: Article[]; count?: number }> {
    try {
      console.log("🔍 Filtering articles with filters:", filters);

      const filterParams = this.convertFiltersToParams(filters);

      const result = await this.getArticles({
        ...params,
        ...filterParams
      });

      console.log("✅ Filter completed, found:", result.articles.length, "articles");
      return result;
    } catch (error: any) {
      console.error("❌ Error filtering articles:", error);
      throw error;
    }
  },

  private convertFiltersToParams(filters?: ArticleFilters): Partial<PaginationParams> {
    if (!filters) return {};

    const params: Partial<PaginationParams> = {};

    if (filters.categories && filters.categories.length > 0) {
      params.categorie_uuid = filters.categories[0];
    }

    if (filters.sous_categories && filters.sous_categories.length > 0) {
      params.sous_categorie_uuid = filters.sous_categories[0];
    }

    if (filters.auteurs && filters.auteurs.length > 0) {
      params.auteur_uuid = filters.auteurs[0];
    }

    if (filters.statuts && filters.statuts.length > 0) {
      params.statut = filters.statuts[0] as any;
    }

    if (filters.est_public !== undefined) {
      params.est_public = filters.est_public;
    }

    if (filters.est_epingle !== undefined) {
      params.est_epingle = filters.est_epingle;
    }

    if (filters.est_populaire !== undefined) {
      params.est_populaire = filters.est_populaire;
    }

    if (filters.est_tendance !== undefined) {
      params.est_tendance = filters.est_tendance;
    }

    if (filters.est_mis_en_avant !== undefined) {
      params.est_mis_en_avant = filters.est_mis_en_avant;
    }

    if (filters.langues && filters.langues.length > 0) {
      params.lang = filters.langues[0];
    }

    if (filters.date_debut) {
      params.date_debut = filters.date_debut;
    }

    if (filters.date_fin) {
      params.date_fin = filters.date_fin;
    }

    if (filters.date_publication_debut) {
      params.date_publication_debut = filters.date_publication_debut;
    }

    if (filters.date_publication_fin) {
      params.date_publication_fin = filters.date_publication_fin;
    }

    return params;
  },

  private generateSearchSuggestions(query: string, articles: Article[]): string[] {
    const suggestions: string[] = [];

    if (!query || query.length < 2) return suggestions;

    // Extraire les mots-clés des articles similaires
    const commonKeywords = new Set<string>();

    articles.forEach(article => {
      // Ajouter les tags comme suggestions
      if (article.tags) {
        article.tags.forEach(tag => {
          if (tag.toLowerCase().includes(query.toLowerCase())) {
            commonKeywords.add(tag);
          }
        });
      }

      // Ajouter la catégorie comme suggestion
      if (article.categorie?.nom.toLowerCase().includes(query.toLowerCase())) {
        commonKeywords.add(article.categorie.nom);
      }

      // Ajouter l'auteur comme suggestion
      if (article.auteur?.nom.toLowerCase().includes(query.toLowerCase())) {
        commonKeywords.add(article.auteur.nom);
      }
    });

    return Array.from(commonKeywords).slice(0, 5);
  },

  // ==================== Statistics & Reports ====================

  async getArticleStats(): Promise<ArticleStats> {
    try {
      console.log("📊 Fetching article statistics");

      // Récupérer tous les articles pour calculer les stats
      const { articles } = await this.getArticles({ limit: 1000 });

      // Calculer les statistiques
      const stats: ArticleStats = {
        total_articles: articles.length,
        articles_publies: articles.filter(a => a.statut === 'publie').length,
        articles_brouillons: articles.filter(a => a.statut === 'brouillon').length,
        articles_en_revision: articles.filter(a => a.statut === 'en_revision').length,
        articles_approuves: articles.filter(a => a.statut === 'approuve').length,
        articles_rejetes: articles.filter(a => a.statut === 'rejete').length,
        articles_archives: articles.filter(a => a.statut === 'archive').length,

        par_categorie: {},
        par_auteur: {},
        par_statut: {},
        par_mois: {},

        vues_total: articles.reduce((sum, a) => sum + a.vues, 0),
        likes_total: articles.reduce((sum, a) => sum + a.likes, 0),
        partages_total: articles.reduce((sum, a) => sum + a.partages, 0),
        commentaires_total: articles.reduce((sum, a) => sum + a.nombre_commentaires, 0),

        articles_epingles: articles.filter(a => a.est_epingle).length,
        articles_populaires: articles.filter(a => a.est_populaire).length,
        articles_tendance: articles.filter(a => a.est_tendance).length,
        articles_mis_en_avant: articles.filter(a => a.est_mis_en_avant).length
      };

      // Calculer les distributions
      articles.forEach(article => {
        // Par catégorie
        const categorie = article.categorie?.nom || 'Non catégorisé';
        stats.par_categorie[categorie] = (stats.par_categorie[categorie] || 0) + 1;

        // Par auteur
        const auteur = article.auteur?.nom || 'Anonyme';
        stats.par_auteur[auteur] = (stats.par_auteur[auteur] || 0) + 1;

        // Par statut
        stats.par_statut[article.statut] = (stats.par_statut[article.statut] || 0) + 1;

        // Par mois
        const mois = article.created_at.substring(0, 7); // YYYY-MM
        stats.par_mois[mois] = (stats.par_mois[mois] || 0) + 1;
      });

      console.log("✅ Article stats calculated:", stats);
      return stats;
    } catch (error: any) {
      console.error("❌ Error fetching article stats:", error);
      throw error;
    }
  },

  async getArticleBySlug(slug: string): Promise<Article> {
    try {
      console.log("🔍 Fetching article by slug:", slug);

      const { articles } = await this.getArticles({
        search: slug,
        limit: 1
      });

      if (articles.length === 0) {
        throw new Error("Article non trouvé");
      }

      // Normalement, vous aurez une route spécifique pour les slugs
      // Pour l'instant, on utilise la recherche
      return articles[0];
    } catch (error: any) {
      console.error("❌ Error fetching article by slug:", error);
      throw error;
    }
  },

  async getRelatedArticles(articleUuid: string, limit: number = 4): Promise<Article[]> {
    try {
      console.log("🔍 Finding related articles for:", articleUuid);

      // Récupérer l'article de référence
      const referenceArticle = await this.getArticle(articleUuid);

      // Chercher des articles avec les mêmes tags ou catégorie
      const { articles } = await this.getArticles({
        limit: 10,
        statut: 'publie',
        categorie_uuid: referenceArticle.categorie_uuid
      });

      // Filtrer l'article de référence
      const otherArticles = articles.filter(a => a.uuid !== articleUuid);

      // Trier par similarité (basé sur les tags)
      const relatedArticles = otherArticles
        .map(article => {
          let similarity = 0;

          // Même catégorie
          if (article.categorie_uuid === referenceArticle.categorie_uuid) similarity += 30;

          // Tags communs
          const commonTags = referenceArticle.tags?.filter(tag =>
            article.tags?.includes(tag)
          ) || [];
          similarity += commonTags.length * 10;

          return { article, similarity };
        })
        .sort((a, b) => b.similarity - a.similarity)
        .map(item => item.article)
        .slice(0, limit);

      console.log("✅ Related articles found:", relatedArticles.length);
      return relatedArticles;
    } catch (error: any) {
      console.error("❌ Error finding related articles:", error);
      throw error;
    }
  },

  // ==================== Comments Management ====================

  async getArticleComments(articleUuid: string): Promise<ArticleComment[]> {
    try {
      console.log("💬 Fetching comments for article:", articleUuid);

      const endpoint = `/articles/${articleUuid}/comments`;
      const response = await api.get<ApiResponse<ArticleComment[]>>(endpoint);

      let comments: ArticleComment[] = [];
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        comments = (response.data as any).data || [];
      } else if (Array.isArray(response.data)) {
        comments = response.data;
      }

      console.log("✅ Comments fetched:", comments.length);
      return comments;
    } catch (error: any) {
      console.error("❌ Error fetching article comments:", error);
      throw error;
    }
  },

  async addComment(commentData: ArticleCommentCreateData): Promise<ArticleComment> {
    try {
      console.log("💬 Adding comment to article:", commentData.article_uuid);

      const endpoint = `/articles/${commentData.article_uuid}/comments`;
      const response = await api.post<ApiResponse<ArticleComment>>(
        endpoint,
        commentData
      );

      let comment: ArticleComment;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        comment = (response.data as any).data;
      } else {
        comment = response.data as ArticleComment;
      }

      console.log("✅ Comment added successfully");
      return comment;
    } catch (error: any) {
      console.error("❌ Error adding comment:", error);
      throw error;
    }
  },

  async approveComment(commentUuid: string): Promise<ArticleComment> {
    try {
      console.log("✅ Approving comment:", commentUuid);

      const endpoint = `/comments/${commentUuid}/approve`;
      const response = await api.post<ApiResponse<ArticleComment>>(endpoint, {});

      let comment: ArticleComment;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        comment = (response.data as any).data;
      } else {
        comment = response.data as ArticleComment;
      }

      console.log("✅ Comment approved successfully");
      return comment;
    } catch (error: any) {
      console.error("❌ Error approving comment:", error);
      throw error;
    }
  },

  async deleteComment(commentUuid: string): Promise<void> {
    try {
      console.log("🗑️ Deleting comment:", commentUuid);

      const endpoint = `/comments/${commentUuid}`;
      await api.delete(endpoint);

      console.log("✅ Comment deleted successfully");
    } catch (error: any) {
      console.error("❌ Error deleting comment:", error);
      throw error;
    }
  },

  // ==================== Views & Engagement ====================

  async incrementViews(articleUuid: string): Promise<void> {
    try {
      console.log("👀 Incrementing views for article:", articleUuid);

      await api.post(`/articles/${articleUuid}/increment-views`, {});

      console.log("✅ Views incremented successfully");
    } catch (error: any) {
      console.error("❌ Error incrementing views:", error);
      console.warn("Failed to increment views, continuing...");
    }
  },

  async likeArticle(articleUuid: string): Promise<{ likes: number; has_liked: boolean }> {
    try {
      console.log("❤️ Liking article:", articleUuid);

      const endpoint = `/articles/${articleUuid}/like`;
      const response = await api.post<ApiResponse<{ likes: number; has_liked: boolean }>>(endpoint, {});

      let result: { likes: number; has_liked: boolean };
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        result = (response.data as any).data;
      } else {
        result = response.data as { likes: number; has_liked: boolean };
      }

      console.log("✅ Article liked successfully");
      return result;
    } catch (error: any) {
      console.error("❌ Error liking article:", error);
      throw error;
    }
  },

  async shareArticle(articleUuid: string, platform?: string): Promise<{ shares: number }> {
    try {
      console.log("🔗 Sharing article:", articleUuid, "on", platform || 'unknown platform');

      const endpoint = `/articles/${articleUuid}/share`;
      const response = await api.post<ApiResponse<{ shares: number }>>(
        endpoint,
        { platform }
      );

      let result: { shares: number };
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        result = (response.data as any).data;
      } else {
        result = response.data as { shares: number };
      }

      console.log("✅ Article shared successfully");
      return result;
    } catch (error: any) {
      console.error("❌ Error sharing article:", error);
      throw error;
    }
  },

  // ==================== Export ====================

  async exportArticle(articleUuid: string, format: ArticleExportFormat): Promise<Blob> {
    try {
      console.log("📄 Exporting article:", articleUuid, "in", format.format, "format");

      const endpoint = `/articles/${articleUuid}/export`;
      const response = await api.post(
        endpoint,
        format,
        { responseType: "blob" }
      );

      console.log("✅ Article exported successfully");
      return response;
    } catch (error: any) {
      console.error("❌ Error exporting article:", error);
      throw error;
    }
  },

  // ==================== Validation & Utilities ====================

  async validateArticle(articleData: ArticleCreateData | ArticleUpdateData): Promise<{
    is_valid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  }> {
    try {
      console.log("✅ Validating article data");

      const errors: string[] = [];
      const warnings: string[] = [];
      const suggestions: string[] = [];

      // Validation de base
      if ('titre' in articleData && (!articleData.titre || articleData.titre.length < 5)) {
        errors.push("Le titre doit contenir au moins 5 caractères");
      }

      if ('resume' in articleData && (!articleData.resume || articleData.resume.length < 20)) {
        warnings.push("Le résumé est court. Ajoutez plus de détails.");
      }

      if ('contenu' in articleData && (!articleData.contenu || articleData.contenu.length < 100)) {
        errors.push("Le contenu doit contenir au moins 100 caractères");
      }

      if ('categorie_uuid' in articleData && !articleData.categorie_uuid) {
        errors.push("Veuillez sélectionner une catégorie");
      }

      if ('image_principale' in articleData && !articleData.image_principale) {
        warnings.push("Ajoutez une image principale pour une meilleure présentation");
      }

      // Suggestions SEO
      if ('titre' in articleData && articleData.titre && articleData.titre.length > 60) {
        suggestions.push("Le titre est long. Pour le SEO, gardez-le sous 60 caractères.");
      }

      if ('meta_description' in articleData && articleData.meta_description && articleData.meta_description.length > 160) {
        suggestions.push("La meta description est trop longue. Idéalement 150-160 caractères.");
      }

      if ('tags' in articleData && (!articleData.tags || articleData.tags.length < 3)) {
        suggestions.push("Ajoutez au moins 3 tags pour améliorer la découvrabilité");
      }

      const is_valid = errors.length === 0;

      return {
        is_valid,
        errors,
        warnings,
        suggestions
      };
    } catch (error: any) {
      console.error("❌ Error validating article:", error);
      throw error;
    }
  },

  async generateSlug(titre: string): Promise<string> {
    try {
      console.log("🔗 Generating slug for:", titre);

      // Simple slug generation
      const slug = titre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9]+/g, '-')     // Replace non-alphanumeric with hyphens
        .replace(/^-+|-+$/g, '')         // Remove leading/trailing hyphens
        .slice(0, 100);                  // Limit length

      console.log("✅ Slug generated:", slug);
      return slug;
    } catch (error: any) {
      console.error("❌ Error generating slug:", error);
      throw error;
    }
  },

  // ==================== Sitemap & SEO ====================

  async getSitemapArticles(): Promise<Array<{
    slug: string;
    updated_at: string;
    priority: number;
    changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  }>> {
    try {
      console.log("🗺️ Getting sitemap articles");

      const { articles } = await this.getPublishedArticles({ limit: 1000 });

      const sitemapEntries = articles.map(article => ({
        slug: article.slug,
        updated_at: article.updated_at,
        priority: article.est_epingle ? 1.0 :
                 article.est_mis_en_avant ? 0.9 :
                 article.est_populaire ? 0.8 : 0.5,
        changefreq: article.est_tendance ? 'daily' :
                   article.est_populaire ? 'weekly' : 'monthly'
      }));

      console.log("✅ Sitemap articles fetched:", sitemapEntries.length);
      return sitemapEntries;
    } catch (error: any) {
      console.error("❌ Error getting sitemap articles:", error);
      throw error;
    }
  },

  // ==================== Debug & Test Methods ====================

  async testEndpoint(endpoint: string): Promise<any> {
    try {
      console.log("🧪 Testing endpoint:", endpoint);

      const response = await api.get(endpoint);

      console.log("✅ Test endpoint response:", {
        endpoint,
        status: response.status,
        data: response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        keys: response.data ? Object.keys(response.data) : 'no data'
      });

      return response.data;
    } catch (error: any) {
      console.error("❌ Test endpoint error:", {
        endpoint,
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  },

  async pingArticleService(): Promise<boolean> {
    try {
      console.log("🏓 Pinging article service...");

      await this.getArticles({ limit: 1 });

      console.log("✅ Article service is operational");
      return true;
    } catch (error: any) {
      console.error("❌ Article service ping failed:", error.message);
      return false;
    }
  },

  // ==================== Batch Operations ====================

  async batchUpdateArticles(uuids: string[], updates: ArticleUpdateData): Promise<Article[]> {
    try {
      console.log("🔄 Batch updating articles:", uuids.length);

      const endpoint = "/articles/batch-update";
      const response = await api.post<ApiResponse<Article[]>>(
        endpoint,
        { uuids, updates }
      );

      let updatedArticles: Article[] = [];
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        updatedArticles = (response.data as any).data || [];
      } else if (Array.isArray(response.data)) {
        updatedArticles = response.data;
      }

      console.log("✅ Articles batch updated:", updatedArticles.length);
      return updatedArticles;
    } catch (error: any) {
      console.error("❌ Error batch updating articles:", error);
      throw error;
    }
  },

  async batchDeleteArticles(uuids: string[]): Promise<void> {
    try {
      console.log("🗑️ Batch deleting articles:", uuids.length);

      const endpoint = "/articles/batch-delete";
      await api.post(endpoint, { uuids });

      console.log("✅ Articles batch deleted");
    } catch (error: any) {
      console.error("❌ Error batch deleting articles:", error);
      throw error;
    }
  },

  async batchPublishArticles(uuids: string[]): Promise<Article[]> {
    try {
      console.log("📢 Batch publishing articles:", uuids.length);

      const endpoint = "/articles/batch-publish";
      const response = await api.post<ApiResponse<Article[]>>(endpoint, { uuids });

      let publishedArticles: Article[] = [];
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        publishedArticles = (response.data as any).data || [];
      } else if (Array.isArray(response.data)) {
        publishedArticles = response.data;
      }

      console.log("✅ Articles batch published:", publishedArticles.length);
      return publishedArticles;
    } catch (error: any) {
      console.error("❌ Error batch publishing articles:", error);
      throw error;
    }
  },

  // ==================== Analytics ====================

  async getArticleAnalytics(articleUuid: string, periode: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<{
    periode: string;
    vues: number[];
    likes: number[];
    partages: number[];
    commentaires: number[];
    dates: string[];
  }> {
    try {
      console.log("📈 Getting analytics for article:", articleUuid, "periode:", periode);

      const endpoint = `/articles/${articleUuid}/analytics`;
      const response = await api.get<ApiResponse<any>>(endpoint, {
        params: { periode }
      });

      // Structure par défaut si l'API ne retourne rien
      const defaultAnalytics = {
        periode,
        vues: [],
        likes: [],
        partages: [],
        commentaires: [],
        dates: []
      };

      let analytics = defaultAnalytics;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        analytics = { ...defaultAnalytics, ...(response.data as any).data };
      } else if (response.data && typeof response.data === 'object') {
        analytics = { ...defaultAnalytics, ...response.data };
      }

      console.log("✅ Article analytics fetched");
      return analytics;
    } catch (error: any) {
      console.error("❌ Error getting article analytics:", error);
      throw error;
    }
  },
};
