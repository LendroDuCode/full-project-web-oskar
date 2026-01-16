// services/favoris/favoris.types.ts

export interface Favori {
  // Identifiants
  uuid: string;
  utilisateur_uuid: string;
  type_element:
    | "produit"
    | "annonce"
    | "don"
    | "echange"
    | "vendeur"
    | "categorie"
    | "utilisateur";
  element_uuid: string;

  // Métadonnées de l'élément
  element_titre?: string;
  element_description?: string;
  element_image?: string;
  element_prix?: number;
  element_ville?: string;
  element_statut?: string;
  element_categorie?: string;

  // Informations de suivi
  date_ajout: string;
  date_modification?: string;
  vue_recente?: string;
  nombre_vues: number;
  notes_utilisateur?: string;
  tags_personnels?: string[];

  // Organisation
  collection_uuid?: string;
  collection_nom?: string;
  priorite: "faible" | "moyen" | "elevee" | "urgent";
  statut: "actif" | "archive" | "supprime";

  // Notifications
  notifications_actives: boolean;
  type_notifications: Array<"prix" | "disponibilite" | "maj" | "promotion">;
  dernier_notification?: string;

  // Métadonnées
  metadata?: Record<string, any>;
  custom_data?: Record<string, any>;

  // Relations
  element_details?: {
    disponible?: boolean;
    prix_actuel?: number;
    date_maj?: string;
    vendeur_nom?: string;
    note_moyenne?: number;
  };

  historique_prix?: Array<{
    prix: number;
    date: string;
    type: "initial" | "promotion" | "augmentation" | "reduction";
  }>;
}

export interface FavoriCreateData {
  utilisateur_uuid: string;
  type_element:
    | "produit"
    | "annonce"
    | "don"
    | "echange"
    | "vendeur"
    | "categorie"
    | "utilisateur";
  element_uuid: string;

  element_titre?: string;
  element_description?: string;
  element_image?: string;
  element_prix?: number;
  element_ville?: string;
  element_statut?: string;
  element_categorie?: string;

  collection_uuid?: string;
  priorite?: "faible" | "moyen" | "elevee" | "urgent";
  notes_utilisateur?: string;
  tags_personnels?: string[];

  notifications_actives?: boolean;
  type_notifications?: Array<"prix" | "disponibilite" | "maj" | "promotion">;

  metadata?: Record<string, any>;
  custom_data?: Record<string, any>;
}

export interface FavoriUpdateData {
  priorite?: "faible" | "moyen" | "elevee" | "urgent";
  statut?: "actif" | "archive" | "supprime";

  collection_uuid?: string;
  notes_utilisateur?: string;
  tags_personnels?: string[];

  notifications_actives?: boolean;
  type_notifications?: Array<"prix" | "disponibilite" | "maj" | "promotion">;

  metadata?: Record<string, any>;
  custom_data?: Record<string, any>;
}

export interface FavoriFilterParams {
  utilisateur_uuid?: string;
  type_element?:
    | "produit"
    | "annonce"
    | "don"
    | "echange"
    | "vendeur"
    | "categorie"
    | "utilisateur";
  element_uuid?: string;

  statut?: "actif" | "archive" | "supprime";
  priorite?: "faible" | "moyen" | "elevee" | "urgent";
  collection_uuid?: string;

  date_ajout_debut?: string;
  date_ajout_fin?: string;
  date_modification_debut?: string;
  date_modification_fin?: string;

  notifications_actives?: boolean;
  avec_notifications?: boolean;
  avec_notes?: boolean;
  avec_tags?: boolean;

  element_ville?: string;
  element_categorie?: string;
  element_statut?: string;

  tags_personnels?: string[];
  search?: string;

  // Tri
  sort_by?:
    | "date_ajout"
    | "date_modification"
    | "vue_recente"
    | "element_prix"
    | "priorite";
  sort_order?: "asc" | "desc";
}

export interface FavoriPaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?:
    | "date_ajout"
    | "date_modification"
    | "vue_recente"
    | "element_prix"
    | "priorite";
  sort_order?: "asc" | "desc";
  filters?: FavoriFilterParams;
}

export interface FavoriStats {
  total_favoris: number;
  favoris_par_type: Record<string, number>;
  favoris_par_mois: Array<{
    mois: string;
    count: number;
  }>;

  stats_par_type: Array<{
    type: string;
    total: number;
    actifs: number;
    avec_notifications: number;
    avec_notes: number;
  }>;

  stats_utilisateur: {
    favoris_actifs: number;
    favoris_archives: number;
    collections_crees: number;
    notifications_actives: number;
    moyenne_notes: number;
  };

  top_categories: Array<{
    categorie: string;
    count: number;
  }>;

  top_villes: Array<{
    ville: string;
    count: number;
  }>;

  metrics: {
    duree_moyenne_conservation: number; // en jours
    taux_notifications: number;
    taux_activation: number;
    vues_moyennes_par_favori: number;
  };
}

export interface CollectionFavoris {
  uuid: string;
  utilisateur_uuid: string;
  nom: string;
  description?: string;
  icone?: string;
  couleur?: string;

  nombre_favoris: number;
  favoris_visibles: boolean;
  partageable: boolean;
  code_partage?: string;
  date_expiration_partage?: string;

  statut: "actif" | "archive" | "prive" | "public";
  priorite: "faible" | "moyen" | "elevee" | "urgent";

  regles_tri?: {
    champ: string;
    ordre: "asc" | "desc";
  };
  filtres_automatiques?: Record<string, any>;

  date_creation: string;
  date_modification?: string;
  date_dernier_acces?: string;

  metadata?: Record<string, any>;
  tags?: string[];

  // Relations
  favoris?: Favori[];
  membres_partage?: Array<{
    utilisateur_uuid: string;
    role: "proprietaire" | "editeur" | "lecteur";
    date_ajout: string;
  }>;
}

export interface CollectionCreateData {
  utilisateur_uuid: string;
  nom: string;
  description?: string;
  icone?: string;
  couleur?: string;

  favoris_visibles?: boolean;
  partageable?: boolean;

  statut?: "actif" | "archive" | "prive" | "public";
  priorite?: "faible" | "moyen" | "elevee" | "urgent";

  regles_tri?: {
    champ: string;
    ordre: "asc" | "desc";
  };
  filtres_automatiques?: Record<string, any>;

  metadata?: Record<string, any>;
  tags?: string[];
}

export interface CollectionUpdateData {
  nom?: string;
  description?: string;
  icone?: string;
  couleur?: string;

  favoris_visibles?: boolean;
  partageable?: boolean;

  statut?: "actif" | "archive" | "prive" | "public";
  priorite?: "faible" | "moyen" | "elevee" | "urgent";

  regles_tri?: {
    champ: string;
    ordre: "asc" | "desc";
  };
  filtres_automatiques?: Record<string, any>;

  metadata?: Record<string, any>;
  tags?: string[];
}

export interface NotificationFavori {
  uuid: string;
  favori_uuid: string;
  utilisateur_uuid: string;

  type:
    | "prix"
    | "disponibilite"
    | "maj"
    | "promotion"
    | "rappel"
    | "expiration";
  titre: string;
  message: string;

  ancienne_valeur?: any;
  nouvelle_valeur?: any;
  variation?: number;

  statut: "en_attente" | "envoyee" | "lue" | "ignoree";
  methode: "email" | "sms" | "push" | "in_app";

  date_creation: string;
  date_envoi?: string;
  date_lecture?: string;
  date_echeance?: string;

  metadata?: Record<string, any>;
}

export interface HistoriqueFavori {
  uuid: string;
  favori_uuid: string;
  utilisateur_uuid: string;

  action:
    | "ajout"
    | "modification"
    | "suppression"
    | "vue"
    | "notification"
    | "archive"
    | "restauration";
  anciennes_valeurs?: Partial<Favori>;
  nouvelles_valeurs?: Partial<Favori>;

  ip_address?: string;
  user_agent?: string;

  date_action: string;
}

export interface SuggestionFavori {
  utilisateur_uuid: string;
  suggestions: Array<{
    element_uuid: string;
    type_element:
      | "produit"
      | "annonce"
      | "don"
      | "echange"
      | "vendeur"
      | "categorie";
    titre: string;
    description?: string;
    image?: string;

    raison:
      | "similaire"
      | "complementaire"
      | "populaire"
      | "tendance"
      | "geographique"
      | "historique";
    score: number;
    criteres: string[];

    prix?: number;
    categorie?: string;
    ville?: string;
    disponibilite?: boolean;
  }>;
}

export interface ExportFavorisOptions {
  format: "json" | "csv" | "excel" | "pdf";
  include_collections: boolean;
  include_historique: boolean;
  include_notifications: boolean;
  filters?: FavoriFilterParams;
  fields?: string[];
}

export interface AnalyticsFavoris {
  periode: {
    debut: string;
    fin: string;
  };

  volume: {
    total_favoris: number;
    nouveaux_favoris: number;
    favoris_supprimes: number;
    par_jour: Array<{ date: string; count: number }>;
  };

  engagement: {
    vues_moyennes_par_favori: number;
    taux_retention: number;
    duree_moyenne_conservation: number;
    taux_notifications: number;
  };

  distribution: {
    par_type: Record<string, number>;
    par_priorite: Record<string, number>;
    par_collection: Record<string, number>;
  };

  categories_populaires: Array<{
    categorie: string;
    count: number;
    croissance: number;
  }>;

  top_elements: Array<{
    element_uuid: string;
    element_titre: string;
    type_element: string;
    count: number;
  }>;
}

export interface PartageCollection {
  uuid: string;
  collection_uuid: string;
  createur_uuid: string;

  token_partage: string;
  mot_de_passe?: string;
  date_expiration?: string;

  permissions: {
    lecture: boolean;
    ajout: boolean;
    modification: boolean;
    suppression: boolean;
    partage: boolean;
  };

  statut: "actif" | "expire" | "revoke";
  nombre_utilisations: number;

  date_creation: string;
  date_modification?: string;
  date_derniere_utilisation?: string;

  metadata?: Record<string, any>;
}

export interface RappelFavori {
  uuid: string;
  favori_uuid: string;
  utilisateur_uuid: string;

  titre: string;
  message?: string;
  date_rappel: string;
  frequence?: "ponctuel" | "quotidien" | "hebdomadaire" | "mensuel";

  statut: "planifie" | "envoye" | "annule" | "termine";
  methode: "email" | "sms" | "push" | "in_app";

  date_creation: string;
  date_dernier_envoi?: string;
  date_prochain_rappel?: string;

  metadata?: Record<string, any>;
}

export interface BatchFavorisOperation {
  operation:
    | "ajouter"
    | "supprimer"
    | "archiver"
    | "restaurer"
    | "deplacer_collection"
    | "modifier_priorite";
  elements: Array<{
    type_element: string;
    element_uuid: string;
  }>;
  collection_uuid?: string;
  priorite?: "faible" | "moyen" | "elevee" | "urgent";
  notes?: string;
}
