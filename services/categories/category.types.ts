// services/categories/category.types.ts

export interface Category {
  // Informations de base
  uuid: string;
  nom: string;
  slug: string;
  description?: string;
  description_courte?: string;

  // Relations hiérarchiques
  parent_uuid?: string;
  parent?: Category;
  enfants?: Category[];
  niveau: number;
  chemin: string; // Ex: "electronique/telephonie/smartphones"
  ancestors?: Category[]; // Ancêtres jusqu'à la racine

  // Visibilité et statut
  est_actif: boolean;
  est_visible: boolean;
  est_archive: boolean;
  ordre: number;
  priorite: number;

  // Métadonnées
  icon?: string;
  image?: string;
  couleur?: string;
  mots_cles?: string[];
  meta_titre?: string;
  meta_description?: string;

  // Restrictions et permissions
  age_minimum?: number; // Âge minimum pour accéder
  restriction_geographique?: string[]; // Codes pays autorisés
  type_contenu: "produit" | "annonce" | "don" | "echange" | "mixte";
  regles_specifiques?: Record<string, any>;

  // Statistiques
  nombre_produits: number;
  nombre_sous_categories: number;
  nombre_vues: number;
  nombre_ventes: number;
  popularite: number;

  // Configurations d'affichage
  template_affichage?: "liste" | "grille" | "carousel" | "cartes";
  options_affichage?: {
    show_count: boolean;
    show_description: boolean;
    show_image: boolean;
    show_children: boolean;
    per_page: number;
    sort_by: "nom" | "popularite" | "ordre" | "date";
    sort_order: "asc" | "desc";
  };

  // SEO et navigation
  url_canonique?: string;
  breadcrumb_label?: string;
  est_dans_menu: boolean;
  emplacement_menu?: "principal" | "secondaire" | "footer";

  // Dates
  date_debut_publication?: string;
  date_fin_publication?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  archived_at?: string;

  // Relations complètes
  produits?: Array<{
    uuid: string;
    nom: string;
    slug: string;
    prix: number;
    image_principale: string;
    statut: string;
    boutique_nom: string;
  }>;

  annonces?: Array<{
    uuid: string;
    titre: string;
    description: string;
    prix?: number;
    statut: string;
    type: string;
  }>;

  dons?: Array<{
    uuid: string;
    titre: string;
    description: string;
    quantite: number;
    statut: string;
    image_principale?: string;
  }>;

  echanges?: Array<{
    uuid: string;
    titre: string;
    description: string;
    statut: string;
    type: "offre" | "demande";
    images?: string[];
  }>;
}

export interface CategoryCreateData {
  nom: string;
  slug?: string;
  description?: string;
  description_courte?: string;
  parent_uuid?: string;
  icon?: string;
  image?: string;
  couleur?: string;
  mots_cles?: string[];
  meta_titre?: string;
  meta_description?: string;
  type_contenu: "produit" | "annonce" | "don" | "echange" | "mixte";
  est_actif?: boolean;
  est_visible?: boolean;
  ordre?: number;
  priorite?: number;
  age_minimum?: number;
  restriction_geographique?: string[];
  regles_specifiques?: Record<string, any>;
  template_affichage?: "liste" | "grille" | "carousel" | "cartes";
  options_affichage?: {
    show_count: boolean;
    show_description: boolean;
    show_image: boolean;
    show_children: boolean;
    per_page: number;
    sort_by: "nom" | "popularite" | "ordre" | "date";
    sort_order: "asc" | "desc";
  };
  est_dans_menu?: boolean;
  emplacement_menu?: "principal" | "secondaire" | "footer";
  breadcrumb_label?: string;
  url_canonique?: string;
  date_debut_publication?: string;
  date_fin_publication?: string;
}

export interface CategoryUpdateData {
  nom?: string;
  slug?: string;
  description?: string;
  description_courte?: string;
  parent_uuid?: string;
  icon?: string;
  image?: string;
  couleur?: string;
  mots_cles?: string[];
  meta_titre?: string;
  meta_description?: string;
  type_contenu?: "produit" | "annonce" | "don" | "echange" | "mixte";
  est_actif?: boolean;
  est_visible?: boolean;
  ordre?: number;
  priorite?: number;
  age_minimum?: number;
  restriction_geographique?: string[];
  regles_specifiques?: Record<string, any>;
  template_affichage?: "liste" | "grille" | "carousel" | "cartes";
  options_affichage?: {
    show_count: boolean;
    show_description: boolean;
    show_image: boolean;
    show_children: boolean;
    per_page: number;
    sort_by: "nom" | "popularite" | "ordre" | "date";
    sort_order: "asc" | "desc";
  };
  est_dans_menu?: boolean;
  emplacement_menu?: "principal" | "secondaire" | "footer";
  breadcrumb_label?: string;
  url_canonique?: string;
  date_debut_publication?: string;
  date_fin_publication?: string;
}

export interface CategoryTreeNode extends Category {
  children?: CategoryTreeNode[];
  hasChildren: boolean;
  isExpanded?: boolean;
  isSelected?: boolean;
  depth: number;
}

export interface CategoryTree {
  root: CategoryTreeNode[];
  flat: CategoryTreeNode[];
  byUuid: Record<string, CategoryTreeNode>;
  bySlug: Record<string, CategoryTreeNode>;
}

export interface CategoryFilterParams {
  parent_uuid?: string;
  niveau_min?: number;
  niveau_max?: number;
  type_contenu?: "produit" | "annonce" | "don" | "echange" | "mixte";
  est_actif?: boolean;
  est_visible?: boolean;
  est_archive?: boolean;
  est_dans_menu?: boolean;
  emplacement_menu?: "principal" | "secondaire" | "footer";
  has_children?: boolean;
  has_products?: boolean;
  search?: string;
  mots_cles?: string[];
  restriction_geographique?: string[];
  age_maximum?: number;
  include_descendants?: boolean;
  exclude_uuid?: string[];
}

export interface CategoryPaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?:
    | "nom"
    | "ordre"
    | "priorite"
    | "nombre_produits"
    | "popularite"
    | "created_at";
  sort_order?: "asc" | "desc";
  filters?: CategoryFilterParams;
}

export interface CategoryStats {
  total_categories: number;
  categories_actives: number;
  categories_visibles: number;
  categories_archivees: number;
  categories_racines: number;
  categories_avec_produits: number;
  categories_vides: number;

  par_type_contenu: Record<string, number>;
  par_niveau: Record<string, number>;
  par_emplacement_menu: Record<string, number>;

  produits_total: number;
  annonces_total: number;
  dons_total: number;
  echanges_total: number;

  moyenne_produits_par_categorie: number;
  moyenne_enfants_par_categorie: number;
}

export interface CategoryBreadcrumb {
  uuid: string;
  nom: string;
  slug: string;
  niveau: number;
  url: string;
}

export interface CategoryPath {
  category: Category;
  breadcrumbs: CategoryBreadcrumb[];
  depth: number;
  siblings?: Category[];
  children?: Category[];
}

export interface CategoryImportData {
  nom: string;
  slug?: string;
  description?: string;
  parent_slug?: string;
  icon?: string;
  type_contenu?: string;
  ordre?: number;
  est_actif?: boolean;
  meta_data?: Record<string, any>;
}

export interface CategoryExportOptions {
  format: "json" | "csv" | "xml";
  include_tree: boolean;
  include_stats: boolean;
  include_relations: boolean;
  fields: string[];
  filters?: CategoryFilterParams;
}

export interface CategoryMoveRequest {
  category_uuid: string;
  new_parent_uuid?: string; // null pour mettre à la racine
  new_order: number;
  move_children?: boolean;
}

export interface CategoryDuplicateRequest {
  source_uuid: string;
  new_nom: string;
  new_slug?: string;
  duplicate_children?: boolean;
  duplicate_products?: boolean;
}

export interface CategoryValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  slug_available?: boolean;
  parent_valid?: boolean;
}

export interface CategorySearchResult {
  categories: Category[];
  exact_match?: Category;
  suggestions: string[];
  related_categories: Category[];
  total: number;
  filters_available: CategoryFilterParams;
}

export interface CategoryWithCounts extends Category {
  counts: {
    produits: number;
    annonces: number;
    dons: number;
    echanges: number;
    enfants: number;
  };
  parent_info?: {
    uuid: string;
    nom: string;
    slug: string;
  };
}

export interface CategoryBulkUpdate {
  uuids: string[];
  updates: CategoryUpdateData;
  apply_to_children?: boolean;
}

export interface CategorySortRequest {
  sorted_ids: string[];
  parent_uuid?: string;
}

export interface CategoryVisibilityRequest {
  category_uuids: string[];
  est_visible: boolean;
  cascade_to_children?: boolean;
  cascade_to_products?: boolean;
}

export interface CategoryHierarchy {
  id: string;
  name: string;
  slug: string;
  children?: CategoryHierarchy[];
  level: number;
  hasProducts: boolean;
  productCount: number;
  isActive: boolean;
}

export interface CategoryMenu {
  uuid: string;
  nom: string;
  slug: string;
  icon?: string;
  children?: CategoryMenu[];
  badge?: number;
  is_active: boolean;
  url: string;
}

export interface CategoryAnalytics {
  periode: {
    debut: string;
    fin: string;
  };
  vues: {
    total: number;
    par_jour: Array<{ date: string; count: number }>;
    par_categorie: Array<{ categorie: string; count: number }>;
  };
  conversions: {
    taux: number;
    clics: number;
    produits_vus: number;
    ajouts_panier: number;
  };
  popularite: {
    top_categories: Array<{ categorie: string; score: number }>;
    categories_croissantes: Array<{ categorie: string; croissance: number }>;
    categories_declinantes: Array<{ categorie: string; declin: number }>;
  };
}

export interface CategoryTemplate {
  id: string;
  nom: string;
  slug: string;
  description?: string;
  style: {
    couleur_fond: string;
    couleur_texte: string;
    couleur_accent: string;
    typographie: string;
  };
  layout: {
    type: "grille" | "liste" | "mosaique" | "carousel";
    colonnes: number;
    espacement: number;
    show_images: boolean;
    show_prices: boolean;
    show_badges: boolean;
  };
  filters: {
    enable_price_filter: boolean;
    enable_brand_filter: boolean;
    enable_sorting: boolean;
    default_sort: string;
  };
  seo: {
    meta_title: string;
    meta_description: string;
    header_tags: string[];
  };
}

export interface CategoryImportResult {
  success: number;
  failed: number;
  skipped: number;
  errors: Array<{
    ligne: number;
    erreur: string;
    donnees: Record<string, any>;
  }>;
  imported: Category[];
  warnings: string[];
}
