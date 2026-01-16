// services/roles/role.types.ts

/**
 * Interface principale représentant un Rôle
 * Un rôle définit un ensemble de permissions pour un type d'utilisateur
 */
export interface Role {
  // ==================== IDENTIFICATION ====================
  uuid: string; // Identifiant unique universel
  code: string; // Code unique (ex: "admin", "vendeur", "client")
  nom: string; // Nom affichable
  description: string; // Description détaillée

  // ==================== TYPE ET HIÉRARCHIE ====================
  type:
    | "systeme"
    | "utilisateur"
    | "vendeur"
    | "agent"
    | "admin"
    | "super_admin"
    | "moderateur"
    | "technique"
    | "custom";
  niveau: 1 | 2 | 3 | 4 | 5; // Niveau hiérarchique (1 = bas, 5 = élevé)
  role_parent_uuid?: string; // UUID du rôle parent pour l'héritage
  role_parent_code?: string; // Code du rôle parent
  role_parent_nom?: string; // Nom du rôle parent

  // ==================== CONFIGURATION ====================
  est_par_defaut: boolean; // Attribué par défaut aux nouveaux utilisateurs
  est_modifiable: boolean; // Peut être modifié
  est_visible: boolean; // Visible dans l'interface
  est_actif: boolean; // Statut d'activation
  est_systeme: boolean; // Rôle système (créé automatiquement)

  // ==================== PERMISSIONS ====================
  permissions: string[]; // Liste des UUID de permissions
  permissions_codes: string[]; // Liste des codes de permissions
  permissions_count: number; // Nombre total de permissions

  // Détails des permissions (optionnel)
  permissions_details?: Array<{
    uuid: string;
    code: string;
    nom: string;
    description: string;
    categorie: string;
    type: string;
  }>;

  // ==================== LIMITATIONS ====================
  limitations?: {
    utilisateurs_max?: number; // Nombre maximum d'utilisateurs
    duree_validite_jours?: number; // Durée de validité du rôle
    horaires_acces?: string; // Plages horaires autorisées (ex: "09:00-18:00")
    jours_acces?: number[]; // Jours de la semaine autorisés (0-6)
    ip_restrictions?: string[]; // IPs autorisées
    devices_max?: number; // Nombre maximum d'appareils simultanés
    quota_quotidien?: number; // Quota d'actions par jour
  };

  // ==================== CONTRÔLES D'ACCÈS ====================
  controles_acces?: {
    mfa_requise: boolean; // Authentification à deux facteurs requise
    session_timeout_minutes?: number; // Timeout de session en minutes
    complexite_mot_de_passe?: "faible" | "moyen" | "fort"; // Niveau de complexité
    expiration_mot_de_passe_jours?: number; // Expiration du mot de passe
    connexion_simultanee_max?: number; // Nombre de connexions simultanées max
  };

  // ==================== MÉTADONNÉES ====================
  metadata?: Record<string, any>; // Données additionnelles
  tags?: string[]; // Tags pour catégorisation
  icone?: string; // Icône pour l'interface
  couleur?: string; // Couleur associée (hex)

  // ==================== SUIVI ET VERSIONNING ====================
  version: string; // Version du rôle
  date_creation: string; // Date de création
  date_modification: string; // Dernière modification
  date_activation?: string; // Date d'activation
  date_desactivation?: string; // Date de désactivation
  date_expiration?: string; // Date d'expiration (si limité dans le temps)

  created_by: string; // Créateur (UUID)
  created_by_nom?: string; // Nom du créateur
  updated_by?: string; // Dernier modificateur
  updated_by_nom?: string; // Nom du modificateur

  // ==================== STATISTIQUES ====================
  utilisateurs_count: number; // Nombre d'utilisateurs avec ce rôle
  derniere_attribution?: string; // Dernière attribution
  attributions_count: number; // Nombre total d'attributions
  utilisation_count: number; // Nombre d'utilisations (accès)

  // ==================== NOTIFICATIONS ====================
  notifications?: {
    nouvelle_attribution: boolean; // Notifier lors d'une nouvelle attribution
    expiration_proche: boolean; // Notifier avant expiration
    utilisation_suspecte: boolean; // Notifier utilisation suspecte
    changement_permissions: boolean; // Notifier changement de permissions
  };
}

/**
 * Données pour créer un nouveau rôle
 */
export interface RoleCreateData {
  code: string;
  nom: string;
  description: string;

  type:
    | "systeme"
    | "utilisateur"
    | "vendeur"
    | "agent"
    | "admin"
    | "super_admin"
    | "moderateur"
    | "technique"
    | "custom";
  niveau: 1 | 2 | 3 | 4 | 5;
  role_parent_uuid?: string;

  est_par_defaut?: boolean;
  est_modifiable?: boolean;
  est_visible?: boolean;
  est_actif?: boolean;

  permissions?: string[];

  limitations?: {
    utilisateurs_max?: number;
    duree_validite_jours?: number;
    horaires_acces?: string;
    jours_acces?: number[];
    ip_restrictions?: string[];
    devices_max?: number;
    quota_quotidien?: number;
  };

  controles_acces?: {
    mfa_requise?: boolean;
    session_timeout_minutes?: number;
    complexite_mot_de_passe?: "faible" | "moyen" | "fort";
    expiration_mot_de_passe_jours?: number;
    connexion_simultanee_max?: number;
  };

  metadata?: Record<string, any>;
  tags?: string[];
  icone?: string;
  couleur?: string;
}

/**
 * Données pour mettre à jour un rôle
 */
export interface RoleUpdateData {
  nom?: string;
  description?: string;

  type?:
    | "systeme"
    | "utilisateur"
    | "vendeur"
    | "agent"
    | "admin"
    | "super_admin"
    | "moderateur"
    | "technique"
    | "custom";
  niveau?: 1 | 2 | 3 | 4 | 5;
  role_parent_uuid?: string;

  est_par_defaut?: boolean;
  est_modifiable?: boolean;
  est_visible?: boolean;
  est_actif?: boolean;

  permissions?: string[];

  limitations?: {
    utilisateurs_max?: number;
    duree_validite_jours?: number;
    horaires_acces?: string;
    jours_acces?: number[];
    ip_restrictions?: string[];
    devices_max?: number;
    quota_quotidien?: number;
  };

  controles_acces?: {
    mfa_requise?: boolean;
    session_timeout_minutes?: number;
    complexite_mot_de_passe?: "faible" | "moyen" | "fort";
    expiration_mot_de_passe_jours?: number;
    connexion_simultanee_max?: number;
  };

  metadata?: Record<string, any>;
  tags?: string[];
  icone?: string;
  couleur?: string;
}

/**
 * Attribution d'un rôle à un utilisateur
 */
export interface RoleAssignment {
  uuid: string;
  utilisateur_uuid: string;
  utilisateur_type:
    | "utilisateur"
    | "vendeur"
    | "agent"
    | "admin"
    | "super_admin";
  utilisateur_nom: string;
  utilisateur_email: string;
  utilisateur_avatar?: string;

  role_uuid: string;
  role_code: string;
  role_nom: string;

  // ==================== PÉRIODE DE VALIDITÉ ====================
  date_debut: string;
  date_fin?: string;
  est_permanent: boolean; // Attribution permanente
  duree_jours?: number; // Durée en jours si temporaire

  // ==================== STATUT ====================
  statut: "actif" | "inactif" | "suspendu" | "expire" | "en_attente" | "annule";
  motif_suspension?: string;
  date_suspension?: string;
  date_activation?: string;
  date_expiration?: string;

  // ==================== CONTEXTE ====================
  contexte?: {
    organisation_uuid?: string;
    organisation_nom?: string;
    departement?: string;
    fonction?: string;
    projet_uuid?: string;
    projet_nom?: string;
    bureau?: string;
    equipe?: string;
    [key: string]: any;
  };

  restrictions?: {
    horaires?: string;
    jours_semaine?: number[];
    ip_restrictions?: string[];
    device_restrictions?: string[];
    geolocalisation?: string[];
  };

  // ==================== SUIVI ====================
  attribue_par: string; // UUID de l'administrateur
  attribue_par_nom: string;
  attribue_le: string;

  revoque_par?: string; // UUID si révoqué
  revoque_par_nom?: string;
  revoque_le?: string;
  motif_revocation?: string;

  approuve_par?: string; // UUID si approbation requise
  approuve_par_nom?: string;
  approuve_le?: string;

  // ==================== MÉTADONNÉES ====================
  metadata?: Record<string, any>;
  notes?: string; // Notes additionnelles

  // ==================== DATES ====================
  date_creation: string;
  date_modification: string;

  // ==================== STATISTIQUES ====================
  utilisations_count: number; // Nombre d'utilisations avec ce rôle
  derniere_utilisation?: string; // Dernière utilisation
}

/**
 * Données pour attribuer un rôle à un utilisateur
 */
export interface RoleAssignmentCreateData {
  utilisateur_uuid: string;
  utilisateur_type:
    | "utilisateur"
    | "vendeur"
    | "agent"
    | "admin"
    | "super_admin";
  role_uuid: string;

  date_debut?: string;
  date_fin?: string;
  est_permanent?: boolean;
  duree_jours?: number;

  contexte?: {
    organisation_uuid?: string;
    departement?: string;
    fonction?: string;
    projet_uuid?: string;
    [key: string]: any;
  };

  restrictions?: {
    horaires?: string;
    jours_semaine?: number[];
    ip_restrictions?: string[];
    device_restrictions?: string[];
  };

  metadata?: Record<string, any>;
  notes?: string;
}

/**
 * Hiérarchie des rôles
 */
export interface RoleHierarchy {
  role_uuid: string;
  role_code: string;
  role_nom: string;
  type: string;
  niveau: number;

  parent?: {
    uuid: string;
    code: string;
    nom: string;
    type: string;
    niveau: number;
  };

  enfants: Array<{
    uuid: string;
    code: string;
    nom: string;
    type: string;
    niveau: number;
  }>;

  ascendants: Array<{
    // Tous les ascendants
    uuid: string;
    code: string;
    nom: string;
    niveau: number;
  }>;

  descendants: Array<{
    // Tous les descendants
    uuid: string;
    code: string;
    nom: string;
    niveau: number;
  }>;

  permissions_heritees: string[]; // Codes de permissions héritées
  permissions_directes: string[]; // Codes de permissions directes
  permissions_totales: string[]; // Toutes les permissions (héritées + directes)

  utilisateurs_count: number; // Nombre d'utilisateurs avec ce rôle (incluant les descendants)
}

/**
 * Statistiques des rôles
 */
export interface RoleStats {
  total_roles: number;
  roles_par_type: Record<string, number>;
  roles_par_niveau: Record<string, number>;

  utilisation: {
    roles_les_plus_utilises: Array<{
      role_uuid: string;
      role_nom: string;
      utilisateurs_count: number;
      pourcentage: number;
    }>;
    roles_moins_utilises: Array<{
      role_uuid: string;
      role_nom: string;
      utilisateurs_count: number;
      pourcentage: number;
    }>;
    moyenne_utilisateurs_par_role: number;
  };

  attributions: {
    total_attributions: number;
    attributions_actives: number;
    attributions_expirees: number;
    attributions_suspendues: number;
    nouvelles_attributions_7j: number;
    attributions_revoquees_7j: number;
  };

  permissions: {
    moyenne_permissions_par_role: number;
    role_plus_permissions: {
      role_uuid: string;
      role_nom: string;
      permissions_count: number;
    };
    role_moins_permissions: {
      role_uuid: string;
      role_nom: string;
      permissions_count: number;
    };
  };

  tendances: Array<{
    date: string;
    nouveaux_roles: number;
    nouvelles_attributions: number;
    utilisateurs_actifs: number;
  }>;
}

/**
 * Audit des actions sur les rôles
 */
export interface RoleAudit {
  uuid: string;
  action:
    | "creation"
    | "modification"
    | "suppression"
    | "attribution"
    | "revocation"
    | "suspension"
    | "activation"
    | "desactivation";
  cible_type: "role" | "attribution";
  cible_uuid: string;
  cible_nom: string;

  // ==================== ACTEUR ====================
  utilisateur_uuid?: string;
  utilisateur_type?: string;
  utilisateur_nom?: string;
  utilisateur_email?: string;

  // ==================== CHANGEMENTS ====================
  anciennes_valeurs?: Record<string, any>;
  nouvelles_valeurs?: Record<string, any>;
  diff_changes?: Array<{
    champ: string;
    ancienne_valeur: any;
    nouvelle_valeur: any;
  }>;

  // ==================== CONTEXTE ====================
  ip_address?: string;
  user_agent?: string;
  location?: string;
  device_info?: Record<string, any>;

  // ==================== RÉSULTAT ====================
  resultat: "succes" | "echec" | "warning";
  message?: string;
  erreur_code?: string;
  stack_trace?: string;

  // ==================== MÉTADONNÉES ====================
  metadata?: Record<string, any>;

  date_action: string;
}

/**
 * Configuration des rôles
 */
export interface RoleConfig {
  // ==================== PARAMÈTRES GÉNÉRAUX ====================
  hierarchie_active: boolean;
  heritage_permissions: boolean;
  roles_systeme_crees: boolean;

  // ==================== VALIDATION ====================
  validation_auto_attributions: boolean;
  validation_cross_role: boolean;
  validation_conflicts: boolean;
  validation_limitations: boolean;

  // ==================== SÉCURITÉ ====================
  session: {
    timeout_minutes: number;
    max_simultaneous: number;
    reauthentification_requise: boolean;
  };

  mfa: {
    obligatoire_pour_roles: string[];
    methodes_acceptees: Array<"sms" | "email" | "authenticator" | "biometrie">;
  };

  // ==================== AUDIT ====================
  audit: {
    log_all_actions: boolean;
    retention_days: number;
    alert_on_suspicious: boolean;
    alert_threshold: number;
  };

  // ==================== NOTIFICATIONS ====================
  notifications: {
    new_assignment: boolean;
    assignment_expiry: boolean;
    role_modification: boolean;
    security_alert: boolean;
  };

  // ==================== LIMITES ====================
  limites: {
    roles_par_utilisateur_max: number;
    permissions_par_role_max: number;
    attributions_par_role_max: number;
    roles_crees_max: number;
    hierarchie_niveaux_max: number;
  };

  // ==================== RÔLES PAR DÉFAUT ====================
  roles_par_defaut: {
    utilisateur: string;
    vendeur: string;
    agent: string;
    admin: string;
  };
}

/**
 * Rapport d'analyse des rôles
 */
export interface RoleAnalysisReport {
  periode: {
    debut: string;
    fin: string;
  };

  // ==================== ANALYSE DES RÔLES ====================
  roles: {
    total: number;
    actifs: number;
    inactifs: number;
    systeme: number;
    custom: number;
    par_type: Record<string, number>;
    par_niveau: Record<string, number>;
  };

  // ==================== ANALYSE DES ATTRIBUTIONS ====================
  attributions: {
    total: number;
    actives: number;
    expirees: number;
    suspendues: number;
    permanentes: number;
    temporaires: number;
    taux_utilisation: number;
  };

  // ==================== ANALYSE DES PERMISSIONS ====================
  permissions: {
    total_unique: number;
    moyenne_par_role: number;
    distribution: Array<{
      nombre_permissions: number;
      nombre_roles: number;
    }>;
  };

  // ==================== RISQUES ET CONFORMITÉ ====================
  risques: {
    roles_sans_attribution: Array<{
      role_uuid: string;
      role_nom: string;
      jours_sans_attribution: number;
    }>;
    roles_trop_permissifs: Array<{
      role_uuid: string;
      role_nom: string;
      permissions_count: number;
      seuil_recommandé: number;
    }>;
    utilisateurs_trop_privilegies: Array<{
      utilisateur_uuid: string;
      utilisateur_nom: string;
      roles_count: number;
      permissions_count: number;
    }>;
    attributions_expirees: Array<{
      assignment_uuid: string;
      utilisateur_nom: string;
      role_nom: string;
      jours_expires: number;
    }>;
  };

  // ==================== RECOMMANDATIONS ====================
  recommendations: Array<{
    priorite: "basse" | "moyenne" | "haute" | "critique";
    categorie: "securite" | "conformite" | "performance" | "gouvernance";
    description: string;
    impact: string;
    effort: "faible" | "moyen" | "eleve";
    actions: string[];
    delai: string;
  }>;
}

/**
 * Template de rôle pour création rapide
 */
export interface RoleTemplate {
  uuid: string;
  code: string;
  nom: string;
  description: string;
  type: string;
  niveau: number;

  permissions: string[]; // UUID des permissions
  permissions_details?: Array<{
    uuid: string;
    code: string;
    nom: string;
    categorie: string;
  }>;

  limitations?: {
    utilisateurs_max?: number;
    duree_validite_jours?: number;
    horaires_acces?: string;
  };

  utilisations_count: number; // Nombre d'utilisations du template
  est_public: boolean; // Template public ou privé
  created_by: string;
  date_creation: string;
}

/**
 * Matrice des rôles et permissions
 */
export interface RolePermissionMatrix {
  roles: Array<{
    uuid: string;
    code: string;
    nom: string;
    type: string;
    niveau: number;
    utilisateurs_count: number;
  }>;

  permissions: Array<{
    uuid: string;
    code: string;
    nom: string;
    categorie: string;
    type: string;
    niveau: number;
  }>;

  matrix: Record<string, Record<string, boolean>>; // role_uuid -> permission_uuid -> true/false

  // Résumé
  summary: {
    total_roles: number;
    total_permissions: number;
    permissions_par_role_moyenne: number;
    roles_par_permission_moyenne: number;
  };
}

/**
 * Migration de rôle
 */
export interface RoleMigration {
  uuid: string;
  source_role_uuid: string;
  source_role_nom: string;
  cible_role_uuid: string;
  cible_role_nom: string;

  utilisateurs_affectes: number;
  utilisateurs_migres: number;
  utilisateurs_en_erreur: number;

  permissions_ajoutees: string[];
  permissions_retirees: string[];
  permissions_communes: string[];

  statut: "en_attente" | "en_cours" | "termine" | "erreur" | "annule";
  date_debut?: string;
  date_fin?: string;
  duree_secondes?: number;

  initie_par: string;
  initie_par_nom: string;

  erreurs?: Array<{
    utilisateur_uuid: string;
    utilisateur_nom: string;
    message: string;
    code_erreur: string;
  }>;

  metadata?: Record<string, any>;
  date_creation: string;
}

/**
 * Paramètres de filtrage pour les rôles
 */
export interface RoleFilterParams {
  // Filtres par type
  type?:
    | "systeme"
    | "utilisateur"
    | "vendeur"
    | "agent"
    | "admin"
    | "super_admin"
    | "moderateur"
    | "technique"
    | "custom";
  niveau?: 1 | 2 | 3 | 4 | 5;

  // Filtres par statut
  est_actif?: boolean;
  est_visible?: boolean;
  est_modifiable?: boolean;
  est_par_defaut?: boolean;
  est_systeme?: boolean;

  // Filtres par parent
  role_parent_uuid?: string;
  has_parent?: boolean;
  has_children?: boolean;

  // Filtres par permissions
  permission_uuid?: string;
  permission_code?: string;
  min_permissions?: number;
  max_permissions?: number;

  // Filtres par utilisateur
  utilisateur_uuid?: string;
  utilisateur_type?: string;
  min_utilisateurs?: number;
  max_utilisateurs?: number;

  // Filtres par date
  date_creation_debut?: string;
  date_creation_fin?: string;
  date_modification_debut?: string;
  date_modification_fin?: string;
  date_activation_debut?: string;
  date_activation_fin?: string;

  // Recherche
  search?: string;
  tags?: string[];

  // Tri
  sort_by?:
    | "nom"
    | "code"
    | "type"
    | "niveau"
    | "date_creation"
    | "date_modification"
    | "utilisateurs_count"
    | "permissions_count";
  sort_order?: "asc" | "desc";
}
