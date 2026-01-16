// services/commentaires/commentaire.types.ts

export interface Commentaire {
  // Identifiants
  uuid: string;
  parent_uuid?: string;

  // Références
  produit_uuid?: string;
  annonce_uuid?: string;
  boutique_uuid?: string;
  article_uuid?: string; // Pour les articles de blog
  page_uuid?: string; // Pour les pages statiques

  // Type de contenu commenté
  type_contenu:
    | "produit"
    | "annonce"
    | "boutique"
    | "article"
    | "page"
    | "general";

  // Auteur
  auteur_uuid: string;
  auteur_type: "utilisateur" | "vendeur" | "agent" | "admin" | "invite";
  auteur_nom: string;
  auteur_email?: string;
  auteur_avatar?: string;
  auteur_verifie: boolean;

  // Contenu
  titre?: string;
  contenu: string;
  note?: number; // 1-5 pour les avis produits
  avantages?: string[]; // Pour les avis produits
  inconvenients?: string[]; // Pour les avis produits

  // Métadonnées
  langue: string;
  ip_address?: string;
  user_agent?: string;

  // Statut
  statut:
    | "brouillon"
    | "en_attente"
    | "approuve"
    | "rejete"
    | "signale"
    | "masque"
    | "archive";
  est_public: boolean;
  est_anonyme: boolean;
  est_verifie_achat: boolean; // Pour les avis produits
  est_reponse: boolean;
  est_modere: boolean;

  // Interactions
  likes: number;
  dislikes: number;
  rapports: number;
  vues: number;

  // Réponses
  reponses_count: number;
  reponses?: Commentaire[];

  // Modération
  modere_par?: string;
  date_moderation?: string;
  raison_moderation?: string;
  mots_interdits_detectes?: string[];

  // Dates
  date_publication: string;
  date_modification?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;

  // Relations
  parent?: Commentaire;
  produit?: {
    uuid: string;
    nom: string;
    slug: string;
    image_principale?: string;
  };
  boutique?: {
    uuid: string;
    nom: string;
    slug: string;
    logo?: string;
  };

  // Métadonnées additionnelles
  metadata?: Record<string, any>;
  tags?: string[];
}

export interface CommentaireCreateData {
  // Références obligatoires
  type_contenu:
    | "produit"
    | "annonce"
    | "boutique"
    | "article"
    | "page"
    | "general";

  // Référence selon type_contenu
  produit_uuid?: string;
  annonce_uuid?: string;
  boutique_uuid?: string;
  article_uuid?: string;
  page_uuid?: string;

  // Auteur (si authentifié, sinon auteur_type = "invite")
  auteur_uuid?: string;
  auteur_type?: "utilisateur" | "vendeur" | "agent" | "admin" | "invite";
  auteur_nom?: string;
  auteur_email?: string;
  auteur_avatar?: string;

  // Contenu
  parent_uuid?: string;
  titre?: string;
  contenu: string;
  note?: number;
  avantages?: string[];
  inconvenients?: string[];

  // Options
  est_anonyme?: boolean;
  langue?: string;
  metadata?: Record<string, any>;
  tags?: string[];
}

export interface CommentaireUpdateData {
  contenu?: string;
  titre?: string;
  note?: number;
  avantages?: string[];
  inconvenients?: string[];
  statut?:
    | "brouillon"
    | "en_attente"
    | "approuve"
    | "rejete"
    | "signale"
    | "masque"
    | "archive";
  est_public?: boolean;
  est_anonyme?: boolean;
  metadata?: Record<string, any>;
  tags?: string[];
}

export interface CommentaireFilterParams {
  produit_uuid?: string;
  annonce_uuid?: string;
  boutique_uuid?: string;
  article_uuid?: string;
  page_uuid?: string;
  type_contenu?:
    | "produit"
    | "annonce"
    | "boutique"
    | "article"
    | "page"
    | "general";
  auteur_uuid?: string;
  auteur_type?: "utilisateur" | "vendeur" | "agent" | "admin" | "invite";
  parent_uuid?: string;
  statut?:
    | "brouillon"
    | "en_attente"
    | "approuve"
    | "rejete"
    | "signale"
    | "masque"
    | "archive";
  est_public?: boolean;
  est_anonyme?: boolean;
  est_verifie_achat?: boolean;
  est_reponse?: boolean;
  note_min?: number;
  note_max?: number;
  date_debut?: string;
  date_fin?: string;
  search?: string;
  tags?: string[];
  has_note?: boolean;
  has_reponses?: boolean;
  has_rapports?: boolean;
  is_reported?: boolean;
  is_featured?: boolean;
  langue?: string;
  sort_by_recent?: boolean;
  sort_by_popular?: boolean;
  sort_by_rating?: boolean;
}

export interface CommentairePaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: "date_publication" | "likes" | "note" | "created_at";
  sort_order?: "asc" | "desc";
  filters?: CommentaireFilterParams;
}

export interface CommentaireStats {
  total_commentaires: number;
  commentaires_par_statut: Record<string, number>;
  commentaires_par_type: Record<string, number>;
  commentaires_par_mois: Array<{
    mois: string;
    count: number;
  }>;

  moyennes_notes: {
    produit?: number;
    boutique?: number;
    global?: number;
  };

  interactions: {
    total_likes: number;
    total_dislikes: number;
    total_rapports: number;
    total_reponses: number;
  };

  top_auteurs: Array<{
    auteur_uuid: string;
    auteur_nom: string;
    nombre_commentaires: number;
    likes_totaux: number;
  }>;

  top_produits_comments: Array<{
    produit_uuid: string;
    produit_nom: string;
    nombre_commentaires: number;
    note_moyenne: number;
  }>;

  metrics: {
    taux_reponse: number;
    delai_reponse_moyen: number;
    satisfaction_moyenne: number;
    taux_signalement: number;
  };
}

export interface CommentaireValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  contains_bad_words?: boolean;
  sentiment_score?: number;
  estimated_reading_time?: number;
}

export interface CommentaireBulkUpdate {
  uuids: string[];
  updates: CommentaireUpdateData;
}

export interface CommentaireWithDetails extends Commentaire {
  auteur_details?: {
    total_commentaires: number;
    note_moyenne: number;
    date_inscription: string;
  };
  produit_details?: {
    categorie: string;
    prix: number;
    boutique_nom: string;
  };
  boutique_details?: {
    note_moyenne: number;
    nombre_avis: number;
  };
}

export interface CommentaireInteraction {
  type: "like" | "dislike" | "report" | "share" | "save";
  utilisateur_uuid: string;
  date_interaction: string;
  metadata?: Record<string, any>;
}

export interface CommentaireReport {
  uuid: string;
  commentaire_uuid: string;
  utilisateur_uuid: string;
  raison: "spam" | "harcelement" | "inapproprié" | "faux" | "autre";
  description?: string;
  statut: "en_attente" | "traite" | "rejete";
  traite_par?: string;
  date_signalement: string;
  date_traitement?: string;
  action?: string;
  created_at: string;
  updated_at: string;
}

export interface CommentaireExportOptions {
  format: "json" | "csv" | "excel" | "pdf";
  include_reponses: boolean;
  include_auteur_info: boolean;
  include_produit_info: boolean;
  filters?: CommentaireFilterParams;
  fields?: string[];
}

export interface CommentaireAnalytics {
  periode: {
    debut: string;
    fin: string;
  };
  volume: {
    total: number;
    par_jour: Array<{ date: string; count: number }>;
    par_type: Record<string, number>;
  };
  engagement: {
    taux_reponse: number;
    likes_par_commentaire: number;
    partage_moyen: number;
    temps_lecture_moyen: number;
  };
  qualite: {
    note_moyenne: number;
    longueur_moyenne: number;
    taux_signalement: number;
    satisfaction_moyenne: number;
  };
  tendances: {
    mots_cles_populaires: string[];
    heures_actives: number[];
    meilleurs_auteurs: Array<{
      auteur: string;
      score: number;
    }>;
  };
}

export interface CommentaireSuggestion {
  commentaire: Commentaire;
  suggestions: Array<{
    type: "reponse" | "modification" | "suppression" | "feature";
    raison: string;
    score: number;
  }>;
}

export interface CommentaireModerationLog {
  uuid: string;
  commentaire_uuid: string;
  action: "approbation" | "rejet" | "masquage" | "suppression" | "restauration";
  moderateur_uuid: string;
  moderateur_type: string;
  raison?: string;
  ancien_statut?: string;
  nouveau_statut?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface CommentaireNotification {
  uuid: string;
  commentaire_uuid: string;
  type: "nouveau" | "reponse" | "like" | "mention" | "moderation";
  destinataire_uuid: string;
  destinataire_type: string;
  sujet: string;
  contenu: string;
  statut: "en_attente" | "envoye" | "lu" | "erreur";
  methode: "email" | "sms" | "push" | "in_app";
  date_envoi?: string;
  date_lecture?: string;
  erreur?: string;
  created_at: string;
  updated_at: string;
}

export interface CommentaireSentiment {
  uuid: string;
  commentaire_uuid: string;
  score_positif: number; // 0-1
  score_negatif: number; // 0-1
  score_neutre: number; // 0-1
  sentiment_dominant: "positif" | "negatif" | "neutre";
  mots_cles: string[];
  themes: string[];
  analyse_date: string;
  created_at: string;
}

export interface CommentaireTemplate {
  uuid: string;
  nom: string;
  type: "reponse" | "moderation" | "notification";
  contenu: string;
  variables?: string[];
  est_actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommentaireImportData {
  contenu: string;
  auteur_nom: string;
  auteur_email?: string;
  produit_reference?: string;
  boutique_slug?: string;
  date_publication: string;
  note?: number;
  statut?: string;
}

export interface CommentaireImportResult {
  success: number;
  failed: number;
  skipped: number;
  errors: Array<{
    ligne: number;
    erreur: string;
    donnees: Record<string, any>;
  }>;
  imported: Commentaire[];
  warnings: string[];
}

export interface CommentaireBadWord {
  uuid: string;
  mot: string;
  severite: "faible" | "moyen" | "fort";
  langue: string;
  remplacement?: string;
  est_actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommentaireAutoModerationRule {
  uuid: string;
  nom: string;
  condition: string;
  action: "rejeter" | "mettre_en_attente" | "masquer" | "notifier";
  severite: "faible" | "moyen" | "fort";
  est_actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommentaireFeatured {
  uuid: string;
  commentaire_uuid: string;
  raison: string;
  ordre: number;
  date_debut: string;
  date_fin?: string;
  est_actif: boolean;
  created_at: string;
  updated_at: string;
}
