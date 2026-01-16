// services/roles-permissions/role-permission.types.ts

/**
 * Interface principale représentant une Permission
 * Une permission définit une action spécifique autorisée dans le système
 */
export interface Permission {
  // ==================== IDENTIFICATION ====================
  uuid: string; // Identifiant unique universel
  code: string; // Code unique (ex: "user.create")
  nom: string; // Nom affichable
  description: string; // Description détaillée

  // ==================== CATÉGORISATION ====================
  categorie: string; // Catégorie fonctionnelle (ex: "Utilisateurs")
  sous_categorie?: string; // Sous-catégorie (ex: "Gestion")
  module: string; // Module associé (ex: "auth", "admin")
  service: string; // Service spécifique

  // ==================== TYPE ET PORTÉE ====================
  type:
    | "lecture"
    | "ecriture"
    | "modification"
    | "suppression"
    | "approbation"
    | "administration"
    | "execution";
  portee: "global" | "groupe" | "objet" | "utilisateur" | "organisation";
  niveau: 1 | 2 | 3 | 4 | 5; // Niveau hiérarchique (1 = basique, 5 = élevé)

  // ==================== CONFIGURATION ====================
  est_systeme: boolean; // Permission système (non modifiable)
  est_obligatoire: boolean; // Obligatoire pour certains rôles
  est_cachee: boolean; // Non visible dans l'interface
  est_active: boolean; // Statut d'activation

  // ==================== RELATIONS ====================
  dependances?: string[]; // Codes des permissions requises
  conflicts?: string[]; // Permissions incompatibles
  groupes?: string[]; // Groupes de permissions
  roles_associes?: string[]; // Rôles ayant cette permission

  // ==================== RESTRICTIONS ====================
  restrictions?: {
    horaires?: Array<{
      // Restrictions horaires
      jour: number; // 0-6 (dimanche-samedi)
      debut: string; // Format HH:mm
      fin: string; // Format HH:mm
    }>;
    quota_journalier?: number; // Limite d'utilisation par jour
    quota_mensuel?: number; // Limite d'utilisation par mois
    conditions?: Record<string, any>; // Conditions supplémentaires
  };

  // ==================== CONTEXTE ====================
  contexte?: Record<string, any>; // Contexte d'application
  metadata?: Record<string, any>; // Métadonnées additionnelles
  tags?: string[]; // Tags pour la recherche

  // ==================== SUIVI ET VERSIONNING ====================
  version: string; // Version de la permission
  date_creation: string; // Date de création
  date_modification: string; // Dernière modification
  date_activation?: string; // Date d'activation
  date_desactivation?: string; // Date de désactivation

  created_by: string; // Créateur (UUID)
  updated_by?: string; // Dernier modificateur

  // ==================== STATISTIQUES ====================
  utilisation_count: number; // Nombre d'utilisations
  derniere_utilisation?: string; // Dernière utilisation
  erreurs_count: number; // Nombre d'erreurs d'accès

  // ==================== DOCUMENTATION ====================
  documentation_url?: string; // Lien vers la documentation
  exemple_utilisation?: string; // Exemple d'utilisation
}

/**
 * Données pour créer une nouvelle permission
 */
export interface PermissionCreateData {
  code: string;
  nom: string;
  description: string;

  categorie: string;
  sous_categorie?: string;
  module: string;
  service: string;

  type:
    | "lecture"
    | "ecriture"
    | "modification"
    | "suppression"
    | "approbation"
    | "administration"
    | "execution";
  portee: "global" | "groupe" | "objet" | "utilisateur" | "organisation";
  niveau: 1 | 2 | 3 | 4 | 5;

  est_systeme?: boolean;
  est_obligatoire?: boolean;
  est_cachee?: boolean;
  est_active?: boolean;

  dependances?: string[];
  conflicts?: string[];
  groupes?: string[];

  restrictions?: {
    horaires?: Array<{
      jour: number;
      debut: string;
      fin: string;
    }>;
    quota_journalier?: number;
    quota_mensuel?: number;
    conditions?: Record<string, any>;
  };

  contexte?: Record<string, any>;
  metadata?: Record<string, any>;
  tags?: string[];

  documentation_url?: string;
  exemple_utilisation?: string;
}

/**
 * Données pour mettre à jour une permission
 */
export interface PermissionUpdateData {
  nom?: string;
  description?: string;

  categorie?: string;
  sous_categorie?: string;
  module?: string;
  service?: string;

  type?:
    | "lecture"
    | "ecriture"
    | "modification"
    | "suppression"
    | "approbation"
    | "administration"
    | "execution";
  portee?: "global" | "groupe" | "objet" | "utilisateur" | "organisation";
  niveau?: 1 | 2 | 3 | 4 | 5;

  est_obligatoire?: boolean;
  est_cachee?: boolean;
  est_active?: boolean;

  dependances?: string[];
  conflicts?: string[];
  groupes?: string[];

  restrictions?: {
    horaires?: Array<{
      jour: number;
      debut: string;
      fin: string;
    }>;
    quota_journalier?: number;
    quota_mensuel?: number;
    conditions?: Record<string, any>;
  };

  contexte?: Record<string, any>;
  metadata?: Record<string, any>;
  tags?: string[];

  documentation_url?: string;
  exemple_utilisation?: string;
}

/**
 * Interface principale représentant un Rôle
 * Un rôle regroupe un ensemble de permissions pour un type d'utilisateur
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
    | "custom"
    | "technique";
  niveau: 1 | 2 | 3 | 4 | 5; // Niveau hiérarchique
  role_parent?: string; // Rôle parent pour l'héritage
  roles_enfants?: string[]; // Rôles enfants

  // ==================== CONFIGURATION ====================
  est_par_defaut: boolean; // Attribué par défaut aux nouveaux utilisateurs
  est_modifiable: boolean; // Peut être modifié
  est_visible: boolean; // Visible dans l'interface
  est_actif: boolean; // Statut d'activation

  // ==================== PERMISSIONS ====================
  permissions: string[]; // Liste des UUID de permissions
  permissions_details?: Permission[]; // Détails des permissions

  // ==================== LIMITATIONS ====================
  limitations?: {
    utilisateurs_max?: number; // Nombre maximum d'utilisateurs
    duree_validite_jours?: number; // Durée de validité
    horaires_acces?: string; // Plages horaires autorisées
    ip_restrictions?: string[]; // IPs autorisées
    devices_max?: number; // Nombre maximum d'appareils
  };

  // ==================== CONTRÔLES D'ACCÈS ====================
  controles_acces?: {
    mfa_requise: boolean; // Authentification à deux facteurs requise
    session_timeout_minutes?: number; // Timeout de session
    complexite_mot_de_passe?: string; // Niveau de complexité
    expiration_mot_de_passe_jours?: number; // Expiration du mot de passe
  };

  // ==================== MÉTADONNÉES ====================
  metadata?: Record<string, any>;
  tags?: string[];
  icone?: string; // Icône pour l'interface

  // ==================== SUIVI ET VERSIONNING ====================
  version: string; // Version du rôle
  date_creation: string; // Date de création
  date_modification: string; // Dernière modification
  date_activation?: string; // Date d'activation
  date_desactivation?: string; // Date de désactivation

  created_by: string; // Créateur (UUID)
  updated_by?: string; // Dernier modificateur

  // ==================== STATISTIQUES ====================
  utilisateurs_count: number; // Nombre d'utilisateurs avec ce rôle
  derniere_attribution?: string; // Dernière attribution
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
    | "custom"
    | "technique";
  niveau: 1 | 2 | 3 | 4 | 5;
  role_parent?: string;

  est_par_defaut?: boolean;
  est_modifiable?: boolean;
  est_visible?: boolean;
  est_actif?: boolean;

  permissions?: string[];

  limitations?: {
    utilisateurs_max?: number;
    duree_validite_jours?: number;
    horaires_acces?: string;
    ip_restrictions?: string[];
    devices_max?: number;
  };

  controles_acces?: {
    mfa_requise?: boolean;
    session_timeout_minutes?: number;
    complexite_mot_de_passe?: string;
    expiration_mot_de_passe_jours?: number;
  };

  metadata?: Record<string, any>;
  tags?: string[];
  icone?: string;
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
    | "custom"
    | "technique";
  niveau?: 1 | 2 | 3 | 4 | 5;
  role_parent?: string;

  est_par_defaut?: boolean;
  est_modifiable?: boolean;
  est_visible?: boolean;
  est_actif?: boolean;

  permissions?: string[];

  limitations?: {
    utilisateurs_max?: number;
    duree_validite_jours?: number;
    horaires_acces?: string;
    ip_restrictions?: string[];
    devices_max?: number;
  };

  controles_acces?: {
    mfa_requise?: boolean;
    session_timeout_minutes?: number;
    complexite_mot_de_passe?: string;
    expiration_mot_de_passe_jours?: number;
  };

  metadata?: Record<string, any>;
  tags?: string[];
  icone?: string;
}

/**
 * Attribution d'un rôle à un utilisateur
 */
export interface RoleAssignment {
  uuid: string;
  utilisateur_uuid: string;
  utilisateur_type: "utilisateur" | "vendeur" | "agent" | "admin";
  utilisateur_nom: string;
  utilisateur_email: string;

  role_uuid: string;
  role_code: string;
  role_nom: string;

  // ==================== PÉRIODE DE VALIDITÉ ====================
  date_debut: string;
  date_fin?: string;
  est_permanent: boolean; // Attribution permanente

  // ==================== STATUT ====================
  statut: "actif" | "inactif" | "suspendu" | "expire" | "en_attente";
  motif_suspension?: string;
  date_suspension?: string;

  // ==================== CONTEXTE ====================
  contexte?: {
    organisation_uuid?: string;
    departement?: string;
    fonction?: string;
    projet_uuid?: string;
    [key: string]: any;
  };

  restrictions?: {
    horaires?: string;
    ip_restrictions?: string[];
    device_restrictions?: string[];
  };

  // ==================== SUIVI ====================
  attribue_par: string; // UUID de l'administrateur
  attribue_le: string;
  revoque_par?: string; // UUID si révoqué
  revoque_le?: string;
  motif_revocation?: string;

  approbation_requise?: boolean;
  approuve_par?: string;
  approuve_le?: string;

  // ==================== MÉTADONNÉES ====================
  metadata?: Record<string, any>;

  // ==================== DATES ====================
  date_creation: string;
  date_modification: string;
}

/**
 * Données pour attribuer un rôle à un utilisateur
 */
export interface RoleAssignmentCreateData {
  utilisateur_uuid: string;
  utilisateur_type: "utilisateur" | "vendeur" | "agent" | "admin";
  role_uuid: string;

  date_debut?: string;
  date_fin?: string;
  est_permanent?: boolean;

  contexte?: {
    organisation_uuid?: string;
    departement?: string;
    fonction?: string;
    projet_uuid?: string;
    [key: string]: any;
  };

  restrictions?: {
    horaires?: string;
    ip_restrictions?: string[];
    device_restrictions?: string[];
  };

  metadata?: Record<string, any>;
}

/**
 * Groupe de permissions logique
 */
export interface PermissionGroup {
  uuid: string;
  code: string;
  nom: string;
  description: string;

  permissions: string[]; // UUID des permissions
  permissions_details?: Permission[];

  est_systeme: boolean;
  est_modifiable: boolean;
  est_actif: boolean;

  metadata?: Record<string, any>;
  tags?: string[];

  date_creation: string;
  date_modification: string;
  created_by: string;
  updated_by?: string;
}

/**
 * Politique de sécurité (RBAC/ABAC)
 */
export interface SecurityPolicy {
  uuid: string;
  nom: string;
  description: string;

  type: "rbac" | "abac" | "pbac" | "ibac" | "hibrid";
  portee: "global" | "module" | "service" | "organisation";

  // ==================== RÈGLES ====================
  regles: Array<{
    id: string;
    condition: string; // Condition d'application
    action: "allow" | "deny" | "audit";
    priorite: number; // Priorité d'exécution (1 = haute)
    description: string;
    metadata?: Record<string, any>;
  }>;

  // ==================== CONTEXTE ====================
  contexte?: {
    environnement?: "production" | "staging" | "development";
    geolocalisation?: string[];
    device_types?: string[];
    heures?: string;
  };

  // ==================== CONFIGURATION ====================
  est_active: boolean;
  date_debut?: string;
  date_fin?: string;

  mode_evaluation: "first-match" | "best-match" | "all-match";

  // ==================== NOTIFICATIONS ====================
  notifications?: {
    on_violation: boolean;
    on_success: boolean;
    channels: Array<"email" | "sms" | "push" | "webhook">;
    destinataires?: string[];
  };

  // ==================== SUIVI ====================
  violations_count: number;
  derniere_violation?: string;
  derniere_modification?: string;

  date_creation: string;
  date_modification: string;
  created_by: string;
  updated_by?: string;

  metadata?: Record<string, any>;
}

/**
 * Audit des rôles et permissions
 */
export interface RolePermissionAudit {
  uuid: string;
  action:
    | "creation"
    | "modification"
    | "attribution"
    | "revocation"
    | "utilisation"
    | "violation"
    | "approbation";
  cible_type: "permission" | "role" | "assignment" | "policy" | "groupe";
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
 * Vérification d'accès avec résultat détaillé
 */
export interface AccessCheckResult {
  utilisateur_uuid: string;
  utilisateur_type: string;
  permission_code: string;
  permission_uuid?: string;

  // ==================== RÉSULTAT ====================
  autorise: boolean;
  raison?: string;
  niveau_acces: "none" | "read" | "write" | "admin";

  // ==================== DÉTAILS ====================
  details: {
    roles_applicables: Array<{
      role_uuid: string;
      role_nom: string;
      permission_trouvee: boolean;
    }>;

    permissions_directes: Array<{
      permission_uuid: string;
      permission_nom: string;
      match_exact: boolean;
    }>;

    restrictions_appliquees?: Array<{
      type: string;
      valeur: any;
      impact: string;
    }>;

    politiques_appliquees?: Array<{
      politique_uuid: string;
      politique_nom: string;
      decision: string;
    }>;
  };

  // ==================== ALTERNATIVES ====================
  alternatives?: Array<{
    permission_code: string;
    permission_nom: string;
    niveau_requis: number;
  }>;

  // ==================== MÉTRIQUES ====================
  date_verification: string;
  duree_traitement_ms: number;
  cache_hit: boolean;
}

/**
 * Vérification multiple d'accès
 */
export interface BulkAccessCheck {
  utilisateur_uuid: string;
  utilisateur_type: string;
  permissions: string[]; // Codes de permissions à vérifier
  contexte?: Record<string, any>;

  resultats: Record<string, AccessCheckResult>;
  date_verification: string;
}

/**
 * Rapport de sécurité et conformité
 */
export interface SecurityComplianceReport {
  periode: {
    debut: string;
    fin: string;
  };

  // ==================== STATISTIQUES ====================
  statistiques: {
    total_utilisateurs: number;
    total_roles: number;
    total_permissions: number;
    total_assignments: number;

    verifications_acces: number;
    acces_autorises: number;
    acces_refuses: number;
    violations: number;
    tentatives_suspectes: number;
  };

  // ==================== ACTIVITÉ ====================
  activite: {
    nouvelles_attributions: number;
    revocations: number;
    modifications_roles: number;
    modifications_permissions: number;
    nouvelles_politiques: number;
  };

  // ==================== ALERTES ====================
  alertes: Array<{
    niveau: "info" | "warning" | "danger" | "critical";
    type:
      | "privilege_escalation"
      | "excessive_permissions"
      | "inactive_users"
      | "expired_assignments"
      | "policy_violation";
    description: string;
    date: string;
    utilisateurs_concernes: string[];
    actions_prises: string[];
    recommendations: string[];
  }>;

  // ==================== CONFORMITÉ ====================
  conformite: {
    principes_least_privilege: number; // Pourcentage
    segregation_duties: number; // Pourcentage
    rotation_roles: number; // Pourcentage
    audits_complets: number; // Pourcentage
  };

  // ==================== RECOMMANDATIONS ====================
  recommendations: Array<{
    priorite: "basse" | "moyenne" | "haute" | "critique";
    description: string;
    impact: string;
    effort: "faible" | "moyen" | "eleve";
    actions_recommandees: string[];
    delai_recommandee: string;
  }>;
}

/**
 * Hiérarchie des rôles
 */
export interface RoleHierarchy {
  role_uuid: string;
  role_code: string;
  role_nom: string;
  niveau: number;

  parent?: {
    uuid: string;
    code: string;
    nom: string;
  };

  enfants: Array<{
    uuid: string;
    code: string;
    nom: string;
    niveau: number;
  }>;

  permissions_heritees: string[]; // Codes de permissions héritées
  permissions_directes: string[]; // Codes de permissions directes
  permissions_totales: string[]; // Toutes les permissions (héritées + directes)
}

/**
 * Matrice des permissions
 */
export interface PermissionMatrix {
  roles: Array<{
    uuid: string;
    code: string;
    nom: string;
    niveau: number;
  }>;

  permissions: Array<{
    uuid: string;
    code: string;
    nom: string;
    categorie: string;
    niveau: number;
  }>;

  matrix: Record<string, Record<string, boolean>>; // role_uuid -> permission_uuid -> true/false
}

/**
 * Configuration du système RBAC
 */
export interface RBACConfig {
  // ==================== PARAMÈTRES GÉNÉRAUX ====================
  mode: "rbac" | "abac" | "hibrid";
  hierarchie_active: boolean;
  heritage_permissions: boolean;

  // ==================== VALIDATION ====================
  validation_auto_assignments: boolean;
  validation_cross_role: boolean;
  validation_conflicts: boolean;

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
    log_all_checks: boolean;
    retention_days: number;
    alert_on_violations: boolean;
    alert_threshold: number;
  };

  // ==================== NOTIFICATIONS ====================
  notifications: {
    new_assignment: boolean;
    assignment_expiry: boolean;
    privilege_change: boolean;
    security_alert: boolean;
  };

  // ==================== CACHE ====================
  cache: {
    enabled: boolean;
    ttl_minutes: number;
    max_size: number;
  };

  // ==================== LIMITES ====================
  limites: {
    roles_par_utilisateur_max: number;
    permissions_par_role_max: number;
    assignments_par_role_max: number;
    sessions_par_utilisateur_max: number;
  };
}

/**
 * Paramètres de filtrage pour les rôles et permissions
 */
export interface RolePermissionFilterParams {
  // Filtres par type
  type?:
    | "systeme"
    | "utilisateur"
    | "vendeur"
    | "agent"
    | "admin"
    | "custom"
    | "technique";
  niveau?: 1 | 2 | 3 | 4 | 5;

  // Filtres par statut
  est_actif?: boolean;
  est_visible?: boolean;
  est_modifiable?: boolean;
  est_par_defaut?: boolean;

  // Filtres par catégorie (permissions)
  categorie?: string;
  sous_categorie?: string;
  module?: string;
  service?: string;
  permission_type?:
    | "lecture"
    | "ecriture"
    | "modification"
    | "suppression"
    | "approbation"
    | "administration";

  // Filtres par utilisateur
  utilisateur_uuid?: string;
  utilisateur_type?: string;

  // Filtres par date
  date_creation_debut?: string;
  date_creation_fin?: string;
  date_modification_debut?: string;
  date_modification_fin?: string;

  // Recherche
  search?: string;
  tags?: string[];

  // Tri
  sort_by?:
    | "nom"
    | "code"
    | "date_creation"
    | "date_modification"
    | "niveau"
    | "utilisateurs_count";
  sort_order?: "asc" | "desc";
}
