// services/articles/article.types.ts

export interface Article {
  // Informations de base
  uuid: string;
  titre: string;
  slug: string;
  resume: string;
  contenu: string;
  contenu_html?: string;

  // Catégorisation
  categorie_uuid: string;
  sous_categorie_uuid?: string;
  tags: string[];

  // Métadonnées SEO
  meta_titre?: string;
  meta_description?: string;
  meta_mots_cles?: string[];

  // Images et médias
  image_principale: string;
  images_secondaires?: string[];
  video_url?: string;
  fichiers_joints?: string[];

  // Auteur et publication
  auteur_uuid: string;
  redacteur_uuid?: string;
  validateur_uuid?: string;
  statut:
    | "brouillon"
    | "en_revision"
    | "approuve"
    | "publie"
    | "archive"
    | "rejete";

  // Visibilité et accès
  est_public: boolean;
  acces_restreint?: "membres" | "abonnes" | "premium";
  date_publication?: string;
  date_publication_planifiee?: string;
  date_expiration?: string;

  // Statistiques et engagement
  vues: number;
  likes: number;
  partages: number;
  commentaires_actives: boolean;
  nombre_commentaires: number;

  // Options
  est_epingle: boolean;
  est_populaire: boolean;
  est_tendance: boolean;
  est_mis_en_avant: boolean;

  // Métadonnées techniques
  lang: string;
  template?: string;
  ordre_affichage?: number;

  // Dates
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  is_deleted: boolean;

  // Relations (peuvent être présentes dans la réponse)
  categorie?: {
    uuid: string;
    nom: string;
    slug: string;
    description?: string;
    couleur?: string;
    icone?: string;
  };

  sous_categorie?: {
    uuid: string;
    nom: string;
    slug: string;
    description?: string;
  };

  auteur?: {
    uuid: string;
    nom: string;
    prenoms: string;
    email: string;
    avatar?: string;
    bio?: string;
    role?: string;
  };

  redacteur?: {
    uuid: string;
    nom: string;
    prenoms: string;
    email: string;
  };

  validateur?: {
    uuid: string;
    nom: string;
    prenoms: string;
    email: string;
  };

  tags_details?: Array<{
    uuid: string;
    nom: string;
    slug: string;
    description?: string;
  }>;

  commentaires?: Array<{
    uuid: string;
    contenu: string;
    auteur_nom: string;
    auteur_email?: string;
    date_publication: string;
    est_approuve: boolean;
    likes: number;
    reponses?: Array<{
      uuid: string;
      contenu: string;
      auteur_nom: string;
      date_publication: string;
    }>;
  }>;
}

export interface ArticleCreateData {
  titre: string;
  slug?: string;
  resume: string;
  contenu: string;
  contenu_html?: string;

  // Catégorisation
  categorie_uuid: string;
  sous_categorie_uuid?: string;
  tags?: string[];

  // SEO
  meta_titre?: string;
  meta_description?: string;
  meta_mots_cles?: string[];

  // Images
  image_principale: string;
  images_secondaires?: string[];
  video_url?: string;
  fichiers_joints?: string[];

  // Publication
  auteur_uuid: string;
  redacteur_uuid?: string;
  validateur_uuid?: string;
  statut?:
    | "brouillon"
    | "en_revision"
    | "approuve"
    | "publie"
    | "archive"
    | "rejete";

  // Visibilité
  est_public?: boolean;
  acces_restreint?: "membres" | "abonnes" | "premium";
  date_publication?: string;
  date_publication_planifiee?: string;
  date_expiration?: string;

  // Options
  est_epingle?: boolean;
  est_populaire?: boolean;
  est_tendance?: boolean;
  est_mis_en_avant?: boolean;

  // Technique
  lang?: string;
  template?: string;
  ordre_affichage?: number;
  commentaires_actives?: boolean;
}

export interface ArticleUpdateData {
  titre?: string;
  slug?: string;
  resume?: string;
  contenu?: string;
  contenu_html?: string;

  // Catégorisation
  categorie_uuid?: string;
  sous_categorie_uuid?: string;
  tags?: string[];

  // SEO
  meta_titre?: string;
  meta_description?: string;
  meta_mots_cles?: string[];

  // Images
  image_principale?: string;
  images_secondaires?: string[];
  video_url?: string;
  fichiers_joints?: string[];

  // Publication
  auteur_uuid?: string;
  redacteur_uuid?: string;
  validateur_uuid?: string;
  statut?:
    | "brouillon"
    | "en_revision"
    | "approuve"
    | "publie"
    | "archive"
    | "rejete";

  // Visibilité
  est_public?: boolean;
  acces_restreint?: "membres" | "abonnes" | "premium";
  date_publication?: string;
  date_publication_planifiee?: string;
  date_expiration?: string;

  // Options
  est_epingle?: boolean;
  est_populaire?: boolean;
  est_tendance?: boolean;
  est_mis_en_avant?: boolean;

  // Technique
  lang?: string;
  template?: string;
  ordre_affichage?: number;
  commentaires_actives?: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";

  // Filtres
  categorie_uuid?: string;
  sous_categorie_uuid?: string;
  tags?: string[];
  auteur_uuid?: string;
  statut?:
    | "brouillon"
    | "en_revision"
    | "approuve"
    | "publie"
    | "archive"
    | "rejete";
  est_public?: boolean;
  est_epingle?: boolean;
  est_populaire?: boolean;
  est_tendance?: boolean;
  est_mis_en_avant?: boolean;
  lang?: string;

  // Filtres date
  date_debut?: string;
  date_fin?: string;
  date_publication_debut?: string;
  date_publication_fin?: string;
}

export interface ArticlesResponse {
  data: Article[];
  count: number;
  total: number;
  page: number;
  pages: number;
  status: string;
  message?: string;
}

export interface ArticleStats {
  total_articles: number;
  articles_publies: number;
  articles_brouillons: number;
  articles_en_revision: number;
  articles_approuves: number;
  articles_rejetes: number;
  articles_archives: number;

  par_categorie: Record<string, number>;
  par_auteur: Record<string, number>;
  par_statut: Record<string, number>;
  par_mois: Record<string, number>;

  vues_total: number;
  likes_total: number;
  partages_total: number;
  commentaires_total: number;

  articles_epingles: number;
  articles_populaires: number;
  articles_tendance: number;
  articles_mis_en_avant: number;
}

export interface ArticleFilters {
  categories?: string[];
  sous_categories?: string[];
  tags?: string[];
  auteurs?: string[];
  statuts?: string[];
  est_public?: boolean;
  est_epingle?: boolean;
  est_populaire?: boolean;
  est_tendance?: boolean;
  est_mis_en_avant?: boolean;
  langues?: string[];
  date_debut?: string;
  date_fin?: string;
  date_publication_debut?: string;
  date_publication_fin?: string;
}

export interface SearchParams {
  query: string;
  filters?: ArticleFilters;
  pagination?: PaginationParams;
}

export interface ArticleSearchResult {
  articles: Article[];
  count: number;
  total: number;
  suggestions?: string[];
  filters_available?: ArticleFilters;
}

export interface ArticleComment {
  uuid: string;
  article_uuid: string;
  utilisateur_uuid?: string;
  auteur_nom: string;
  auteur_email?: string;
  auteur_website?: string;
  contenu: string;
  date_publication: string;
  date_modification?: string;
  est_approuve: boolean;
  est_signe: boolean;
  likes: number;
  reponses?: ArticleComment[];
}

export interface ArticleCommentCreateData {
  article_uuid: string;
  auteur_nom: string;
  auteur_email?: string;
  auteur_website?: string;
  contenu: string;
  reponse_a?: string; // UUID du commentaire parent
}

export interface ArticleExportFormat {
  format: "pdf" | "docx" | "html" | "markdown";
  include_comments?: boolean;
  include_metadata?: boolean;
  style?: "simple" | "professional" | "academic";
}
