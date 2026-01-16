// services/promotions/promotions.types.ts

/**
 * Types de promotion disponibles
 */
export type PromotionType =
  | "pourcentage" // Réduction en pourcentage (ex: 20%)
  | "montant_fixe" // Réduction d'un montant fixe (ex: 50€)
  | "livraison_gratuite" // Livraison gratuite
  | "cadeau" // Cadeau offert avec achat
  | "2_pour_1" // Achetez un, obtenez-en un gratuit
  | "pack" // Pack spécial (ex: 3 pour le prix de 2)
  | "remboursement" // Remboursement partiel
  | "points" // Points bonus
  | "echantillon" // Échantillon gratuit
  | "cashback"; // Cashback

/**
 * Portée de la promotion
 */
export type PromotionScope =
  | "global" // Promotion globale
  | "categorie" // Pour une catégorie spécifique
  | "produit" // Pour un produit spécifique
  | "collection" // Pour une collection de produits
  | "marque" // Pour une marque spécifique
  | "vendeur" // Pour un vendeur spécifique
  | "utilisateur" // Pour un utilisateur spécifique
  | "groupe_utilisateurs"; // Pour un groupe d'utilisateurs

/**
 * Statut de la promotion
 */
export type PromotionStatus =
  | "active" // Promotion active
  | "inactive" // Promotion inactive
  | "planifiee" // Promotion planifiée
  | "expiree" // Promotion expirée
  | "suspendue" // Promotion suspendue
  | "archivee"; // Promotion archivée

/**
 * Conditions d'application
 */
export interface PromotionCondition {
  type:
    | "montant_minimum"
    | "quantite_minimum"
    | "produits_specifiques"
    | "categories"
    | "heure_journee";
  valeur: any;
  operateur?: "et" | "ou";
  conditions_enfant?: PromotionCondition[];
}

/**
 * Interface principale pour une promotion
 */
export interface Promotion {
  // Identifiants
  uuid: string;
  code: string; // Code promotionnel unique
  nom: string;
  description?: string;

  // Type et portée
  type: PromotionType;
  portee: PromotionScope;

  // Cibles de la promotion
  cible_ids?: string[]; // UUIDs des cibles (produits, catégories, etc.)
  cible_noms?: string[]; // Noms des cibles pour l'affichage

  // Valeurs de la promotion
  valeur: number; // Pourcentage ou montant fixe
  valeur_max?: number; // Valeur maximale pour les réductions en pourcentage
  montant_minimum?: number; // Montant minimum d'achat requis

  // Dates et durée
  date_debut: string;
  date_fin: string;
  heures_valides?: {
    debut: string; // Format HH:MM
    fin: string; // Format HH:MM
    jours_semaine?: number[]; // 0=Dimanche, 1=Lundi, etc.
  };

  // Limites d'utilisation
  utilisation_max_par_utilisateur?: number;
  utilisation_max_globale?: number;
  utilisation_count: number; // Nombre d'utilisations actuelles
  quantite_max?: number; // Quantité maximale de produits concernés

  // Statut et visibilité
  statut: PromotionStatus;
  visible: boolean;
  prioritaire: boolean; // Priorité par rapport aux autres promotions

  // Conditions d'application
  conditions?: PromotionCondition[];
  exclusivites?: string[]; // UUIDs des promotions exclusives

  // Informations visuelles
  image_url?: string;
  couleur?: string;
  badge_texte?: string;

  // Métadonnées
  metadata?: Record<string, any>;
  tags?: string[];

  // Suivi et analytics
  date_creation: string;
  date_modification?: string;
  createur_uuid?: string;

  // Statistiques
  stats?: {
    total_utilisations: number;
    montant_total_economise: number;
    taux_conversion: number;
    produits_populaires: Array<{
      produit_uuid: string;
      nom: string;
      utilisations: number;
    }>;
  };

  // Configuration avancée
  cumulable: boolean; // Si cumulable avec d'autres promotions
  cumulable_avec?: string[]; // UUIDs des promotions cumulables
  applicable_sur_promotions: boolean; // Applicable sur produits déjà en promotion
  frais_livraison_inclus: boolean; // Inclut les frais de livraison dans le calcul

  // Notifications
  notifications?: {
    avant_expiration?: boolean;
    rappel_utilisateurs?: boolean;
  };

  // Restauration du stock
  restauration_stock_annulation?: boolean; // Restaurer le stock en cas d'annulation
}

/**
 * Données requises pour créer une nouvelle promotion
 */
export interface PromotionCreateData {
  code: string;
  nom: string;
  description?: string;

  type: PromotionType;
  portee: PromotionScope;

  cible_ids?: string[];
  valeur: number;

  date_debut: string;
  date_fin: string;

  statut?: PromotionStatus;
  visible?: boolean;

  utilisation_max_par_utilisateur?: number;
  utilisation_max_globale?: number;

  conditions?: PromotionCondition[];

  image_url?: string;
  couleur?: string;

  cumulable?: boolean;
  cumulable_avec?: string[];

  metadata?: Record<string, any>;
  tags?: string[];
}

/**
 * Données pour mettre à jour une promotion
 */
export interface PromotionUpdateData {
  nom?: string;
  description?: string;

  statut?: PromotionStatus;
  visible?: boolean;
  prioritaire?: boolean;

  date_debut?: string;
  date_fin?: string;

  utilisation_max_par_utilisateur?: number;
  utilisation_max_globale?: number;

  conditions?: PromotionCondition[];

  image_url?: string;
  couleur?: string;
  badge_texte?: string;

  cumulable?: boolean;
  cumulable_avec?: string[];

  metadata?: Record<string, any>;
  tags?: string[];
}

/**
 * Données pour appliquer une promotion à un panier/commande
 */
export interface ApplicationPromotionData {
  code_promotion: string;
  utilisateur_uuid?: string;
  panier_uuid?: string;
  produits?: Array<{
    produit_uuid: string;
    quantite: number;
    prix_unitaire: number;
  }>;
  montant_total: number;
}

/**
 * Résultat de l'application d'une promotion
 */
export interface ApplicationPromotionResult {
  reussie: boolean;
  message?: string;
  promotion_appliquee?: Promotion;
  reduction_appliquee: number;
  nouveau_montant: number;
  produits_concernes: Array<{
    produit_uuid: string;
    reduction_unitaire: number;
    reduction_totale: number;
  }>;
  restrictions?: string[];
  conditions_non_remplies?: string[];
}

/**
 * Validation d'une promotion
 */
export interface ValidationPromotionResult {
  valide: boolean;
  promotion?: Promotion;
  message?: string;
  raisons_invalidite?: string[];
  reduction_estimee?: number;
  conditions_requises?: Array<{
    condition: string;
    remplie: boolean;
    details?: string;
  }>;
}

/**
 * Historique d'utilisation d'une promotion
 */
export interface HistoriqueUtilisationPromotion {
  uuid: string;
  promotion_uuid: string;
  utilisateur_uuid: string;
  commande_uuid?: string;

  code_utilise: string;
  montant_avant_reduction: number;
  montant_reduction: number;
  montant_apres_reduction: number;

  produits_concernes: Array<{
    produit_uuid: string;
    nom: string;
    quantite: number;
    reduction_totale: number;
  }>;

  date_utilisation: string;
  ip_address?: string;
  user_agent?: string;

  metadata?: Record<string, any>;
}

/**
 * Statistiques détaillées sur les promotions
 */
export interface PromotionStats {
  // Vue d'ensemble
  total_promotions: number;
  promotions_actives: number;
  promotions_inactives: number;
  promotions_expirees: number;

  // Utilisation
  total_utilisations: number;
  utilisations_moyennes_par_promotion: number;
  taux_utilisation_globale: number;

  // Impact financier
  montant_total_economise: number;
  montant_moyen_economise_par_utilisation: number;
  taux_reduction_moyen: number;

  // Par type
  stats_par_type: Array<{
    type: PromotionType;
    nombre: number;
    utilisations: number;
    economie_totale: number;
  }>;

  // Par portée
  stats_par_portee: Array<{
    portee: PromotionScope;
    nombre: number;
    taux_conversion: number;
  }>;

  // Temporalité
  utilisations_par_periode: Array<{
    periode: string; // "2024-01", "2024-02", etc.
    utilisations: number;
    economie: number;
  }>;

  // Top promotions
  top_promotions: Array<{
    uuid: string;
    nom: string;
    code: string;
    utilisations: number;
    economie_totale: number;
  }>;

  // Performance
  taux_conversion_global: number;
  panier_moyen_avec_promotion: number;
  panier_moyen_sans_promotion: number;
  augmentation_panier_moyen: number;

  // Utilisateurs
  utilisateurs_actifs: number; // Utilisateurs ayant utilisé au moins une promotion
  taux_reutilisation: number; // Pourcentage d'utilisateurs réutilisant des promotions
}

/**
 * Rapport d'analyse de promotion
 */
export interface PromotionAnalyticsReport {
  promotion_uuid: string;
  periode: {
    debut: string;
    fin: string;
  };

  // Performance
  utilisations_total: number;
  taux_conversion: number;
  montant_total_generé: number;
  montant_total_economise: number;
  roi: number; // Return on Investment

  // Démographie utilisateurs
  utilisateurs_uniques: number;
  nouveaux_utilisateurs: number;
  utilisateurs_fideles: number;

  // Impact sur les ventes
  produits_vendus_avec_promotion: number;
  produits_vendus_sans_promotion: number;
  augmentation_ventes: number;

  // Temporalité
  utilisations_par_jour: Array<{
    date: string;
    utilisations: number;
    montant: number;
  }>;

  // Par canal
  utilisations_par_canal: Array<{
    canal: "web" | "mobile" | "email" | "reseau_social";
    utilisations: number;
    taux_conversion: number;
  }>;

  // Recommandations
  recommendations?: Array<{
    type: "optimisation" | "extension" | "arret";
    titre: string;
    description: string;
    priorite: "basse" | "moyenne" | "haute";
  }>;
}

/**
 * Planification de promotion
 */
export interface PlanificationPromotion {
  uuid: string;
  nom: string;
  description?: string;

  promotions: Array<{
    promotion_uuid: string;
    ordre: number;
    conditions_activation?: PromotionCondition[];
  }>;

  date_debut: string;
  date_fin: string;

  statut: "active" | "planifiee" | "terminee" | "annulee";
  recurrence?: {
    type: "quotidienne" | "hebdomadaire" | "mensuelle" | "annuelle";
    jours?: number[]; // Pour hebdomadaire
    jour_mois?: number; // Pour mensuelle
    mois?: number; // Pour annuelle
  };

  budget_alloue?: number;
  budget_utilise?: number;

  objectifs?: {
    utilisations_cibles: number;
    ventes_cibles: number;
    nouveaux_utilisateurs_cibles: number;
  };

  date_creation: string;
  date_modification?: string;
}

/**
 * Campagne promotionnelle
 */
export interface CampagnePromotionnelle {
  uuid: string;
  nom: string;
  description?: string;

  promotions: string[]; // UUIDs des promotions
  segments_cibles?: string[]; // Segments d'utilisateurs cibles

  date_lancement: string;
  date_fin: string;

  budget_total: number;
  budget_utilise: number;

  canaux: Array<"email" | "sms" | "push" | "reseaux_sociaux" | "site_web">;
  creatifs?: {
    image_principale?: string;
    texte_email?: string;
    texte_sms?: string;
    hashtags?: string[];
  };

  statut: "brouillon" | "planifiee" | "en_cours" | "terminee" | "annulee";
  objectifs?: {
    taux_ouverture?: number;
    taux_clic?: number;
    taux_conversion?: number;
    roi_minimum?: number;
  };

  resultats?: {
    utilisateurs_touches: number;
    taux_ouverture?: number;
    taux_clic?: number;
    taux_conversion?: number;
    roi?: number;
  };

  date_creation: string;
  date_modification?: string;
}

/**
 * Segment d'utilisateurs pour les promotions
 */
export interface SegmentUtilisateursPromotion {
  uuid: string;
  nom: string;
  description?: string;

  criteres: Array<{
    champ:
      | "date_inscription"
      | "nombre_commandes"
      | "montant_total_depense"
      | "derniere_visite"
      | "produits_vus";
    operateur: ">" | "<" | "=" | ">=" | "<=" | "between" | "in";
    valeur: any;
  }>;

  utilisateurs_count: number;
  actif: boolean;

  date_creation: string;
  date_modification?: string;
}

/**
 * Règle de priorité des promotions
 */
export interface ReglePrioritePromotion {
  uuid: string;
  nom: string;
  description?: string;

  conditions: PromotionCondition[];
  promotions_prioritaires: string[]; // UUIDs des promotions prioritaires
  promotions_exclues?: string[]; // UUIDs des promotions à exclure

  ordre_priorite: number;
  actif: boolean;

  date_creation: string;
  date_modification?: string;
}

/**
 * Notification de promotion
 */
export interface NotificationPromotion {
  uuid: string;
  utilisateur_uuid: string;
  promotion_uuid: string;

  type:
    | "nouvelle_promotion"
    | "expiration_imminente"
    | "rappel_utilisation"
    | "promotion_personnalisee";
  titre: string;
  message: string;

  statut: "envoyee" | "lue" | "ignoree" | "erreur";
  canal: "email" | "sms" | "push" | "in_app";

  date_envoi: string;
  date_lecture?: string;

  metadata?: Record<string, any>;
}

/**
 * Export des données de promotion
 */
export interface ExportPromotionsOptions {
  format: "csv" | "json" | "excel" | "pdf";
  periode?: {
    debut: string;
    fin: string;
  };
  statuts?: PromotionStatus[];
  types?: PromotionType[];
  include_historique?: boolean;
  include_statistiques?: boolean;
  fields?: string[];
}

/**
 * Import des promotions
 */
export interface ImportPromotionsData {
  format: "csv" | "json";
  data: any;
  options?: {
    update_existing?: boolean;
    skip_errors?: boolean;
    validate_only?: boolean;
  };
}

/**
 * Règle d'auto-génération de codes promotionnels
 */
export interface RegleGenerationCodes {
  uuid: string;
  nom: string;

  format: string; // Ex: "PROMO-{DATE}-{RANDOM}"
  parametres: {
    prefixe?: string;
    suffixe?: string;
    longueur?: number;
    caracteres?: string;
    majuscules?: boolean;
  };

  nombre_codes: number;
  codes_generes: string[];

  promotion_associee?: string; // UUID de la promotion

  date_creation: string;
  date_expiration?: string;
}

/**
 * Analyse de l'impact d'une promotion sur les ventes
 */
export interface ImpactPromotionVentes {
  promotion_uuid: string;

  // Avant/Après
  ventes_avant: {
    periode: string;
    nombre_commandes: number;
    chiffre_affaires: number;
    panier_moyen: number;
  };

  ventes_pendant: {
    periode: string;
    nombre_commandes: number;
    chiffre_affaires: number;
    panier_moyen: number;
  };

  // Variation
  variation: {
    commandes: number; // Pourcentage
    chiffre_affaires: number; // Pourcentage
    panier_moyen: number; // Pourcentage
  };

  // Nouveaux clients
  nouveaux_clients_pendant: number;
  taux_fidelisation_nouveaux_clients?: number;

  // Analyse approfondie
  produits_impactes: Array<{
    produit_uuid: string;
    nom: string;
    ventes_avant: number;
    ventes_pendant: number;
    variation: number;
  }>;
}
