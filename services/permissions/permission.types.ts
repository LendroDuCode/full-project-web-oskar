// services/permissions/permission.types.ts

/**
 * Interface principale représentant une Permission
 * Une permission définit une action spécifique dans le système
 */
export interface Permission {
  // ==================== IDENTIFICATION ====================
  uuid: string; // Identifiant unique universel
  code: string; // Code unique de la permission
  nom: string; // Nom affichable
  description: string; // Description détaillée

  // ==================== CATÉGORISATION ====================
  categorie: string; // Catégorie fonctionnelle
  sous_categorie?: string; // Sous-catégorie
  module: string; // Module associé
  service: string; // Service spécifique

  // ==================== PORTÉE ET CONTEXTE ====================
  portee: "global" | "groupe" | "objet" | "utilisateur";
  contexte?: string; // Contexte d'application
  restrictions?: Array<{
    // Restrictions supplémentaires
    type: "horaire" | "localisation" | "quota" | "condition";
    valeur: any;
    description: string;
  }>;

  // ==================== CONFIGURATION ====================
  type:
    | "lecture"
    | "ecriture"
    | "modification"
    | "suppression"
    | "approbation"
    | "administration";
  niveau: 1 | 2 | 3 | 4 | 5; // Niveau hiérarchique (1 = bas, 5 = élevé)
  est_systeme: boolean; // Permission système (non modifiable)
  est_obligatoire: boolean; // Obligatoire pour certains rôles
  est_cachee: boolean; // Non visible dans l'interface

  // ==================== RELATIONS ====================
  dependances?: string[]; // Permissions requises
  conflicts?: string[]; // Permissions incompatibles
  groupes?: string[]; // Groupes de permissions

  // ==================== SUIVI ET VERSIONNING ====================
  version: string; // Version de la permission
  date_creation: string; // Date de création
  date_modification: string; // Dernière modification
  created_by: string; // Créateur
  updated_by?: string; // Dernier modificateur

  // ==================== MÉTADONNÉES ====================
  metadata?: Record<string, any>; // Données additionnelles
  tags?: string[]; // Tags pour la recherche
  documentation_url?: string; // Lien vers la documentation

  // ==================== STATISTIQUES ====================
  utilisation_count: number; // Nombre d'utilisations
  derniere_utilisation?: string; // Dernière utilisation
}

/**
 * Données nécessaires pour créer une nouvelle permission
 */
export interface PermissionCreateData {
  code: string;
  nom: string;
  description: string;

  categorie: string;
  sous_categorie?: string;
  module: string;
  service: string;

  portee: "global" | "groupe" | "objet" | "utilisateur";
  contexte?: string;
  restrictions?: Array<{
    type: "horaire" | "localisation" | "quota" | "condition";
    valeur: any;
    description: string;
  }>;

  type:
    | "lecture"
    | "ecriture"
    | "modification"
    | "suppression"
    | "approbation"
    | "administration";
  niveau: 1 | 2 | 3 | 4 | 5;
  est_systeme?: boolean;
  est_obligatoire?: boolean;
  est_cachee?: boolean;

  dependances?: string[];
  conflicts?: string[];
  groupes?: string[];

  metadata?: Record<string, any>;
  tags?: string[];
  documentation_url?: string;
}

/**
 * Données partielles pour la mise à jour d'une permission
 */
export interface PermissionUpdateData {
  nom?: string;
  description?: string;

  categorie?: string;
  sous_categorie?: string;
  module?: string;
  service?: string;

  portee?: "global" | "groupe" | "objet" | "utilisateur";
  contexte?: string;
  restrictions?: Array<{
    type: "horaire" | "localisation" | "quota" | "condition";
    valeur: any;
    description: string;
  }>;

  type?:
    | "lecture"
    | "ecriture"
    | "modification"
    | "suppression"
    | "approbation"
    | "administration";
  niveau?: 1 | 2 | 3 | 4 | 5;
  est_obligatoire?: boolean;
  est_cachee?: boolean;

  dependances?: string[];
  conflicts?: string[];
  groupes?: string[];

  metadata?: Record<string, any>;
  tags?: string[];
  documentation_url?: string;
}

/**
 * Rôle regroupant plusieurs permissions
 */
export interface Role {
  uuid: string;
  code: string;
  nom: string;
  description: string;

  type: "systeme" | "utilisateur" | "vendeur" | "agent" | "admin" | "custom";
  niveau: 1 | 2 | 3 | 4 | 5; // Niveau hiérarchique

  permissions: string[]; // Liste des UUID de permissions
  permissions_details?: Permission[]; // Détails des permissions

  est_par_defaut: boolean; // Rôle attribué par défaut
  est_modifiable: boolean; // Peut être modifié
  est_visible: boolean; // Visible dans l'interface

  limitations?: {
    // Limitations du rôle
    utilisateurs_max?: number;
    duree_validite_jours?: number;
    horaires_acces?: string;
  };

  date_creation: string;
  date_modification: string;
  created_by: string;
  updated_by?: string;

  metadata?: Record<string, any>;
}

/**
 * Attribution d'un rôle à un utilisateur
 */
export interface RoleAssignment {
  uuid: string;
  utilisateur_uuid: string;
  utilisateur_type: string;
  role_uuid: string;
  role_nom: string;

  date_debut: string;
  date_fin?: string;
  statut: "actif" | "inactif" | "suspendu" | "expire";

  attribue_par: string; // UUID de l'administrateur
  attribue_le: string;
  revoque_par?: string; // UUID si révoqué
  revoque_le?: string;
  motif_revocation?: string;

  contexte?: Record<string, any>; // Contexte spécifique
  restrictions?: Record<string, any>; // Restrictions supplémentaires

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

  date_creation: string;
  date_modification: string;
  created_by: string;
  updated_by?: string;

  metadata?: Record<string, any>;
}

/**
 * Politique de sécurité
 */
export interface SecurityPolicy {
  uuid: string;
  nom: string;
  description: string;

  type: "authentification" | "autorisation" | "audit" | "conformite";
  portee: "global" | "module" | "service";

  regles: Array<{
    condition: string;
    action: string;
    priorite: number;
    description: string;
  }>;

  est_active: boolean;
  date_debut?: string;
  date_fin?: string;

  notifications?: {
    on_violation: boolean;
    on_success: boolean;
    channels: string[];
  };

  date_creation: string;
  date_modification: string;
  created_by: string;
  updated_by?: string;

  metadata?: Record<string, any>;
}

/**
 * Audit des permissions
 */
export interface PermissionAudit {
  uuid: string;
  action:
    | "creation"
    | "modification"
    | "attribution"
    | "revocation"
    | "utilisation"
    | "violation";
  cible_type: "permission" | "role" | "utilisateur" | "groupe";
  cible_uuid: string;

  utilisateur_uuid?: string;
  utilisateur_type?: string;

  anciennes_valeurs?: any;
  nouvelles_valeurs?: any;

  ip_address?: string;
  user_agent?: string;
  location?: string;

  date_action: string;

  metadata?: Record<string, any>;
}

/**
 * Vérification d'accès
 */
export interface AccessCheck {
  utilisateur_uuid: string;
  utilisateur_type: string;
  permission_code: string;
  contexte?: Record<string, any>;

  resultat: {
    autorise: boolean;
    raison?: string;
    restrictions_appliquees?: Array<{
      type: string;
      valeur: any;
    }>;
    alternatives?: string[]; // Permissions alternatives
  };

  date_verification: string;
  duree_traitement_ms: number;
}

/**
 * Rapport de sécurité
 */
export interface SecurityReport {
  periode: {
    debut: string;
    fin: string;
  };

  statistiques: {
    total_utilisateurs: number;
    total_roles: number;
    total_permissions: number;

    verifications_acces: number;
    acces_autorises: number;
    acces_refuses: number;
    violations: number;
  };

  activite: {
    nouvelles_attributions: number;
    revocations: number;
    modifications_permissions: number;
  };

  alertes: Array<{
    niveau: "info" | "warning" | "danger" | "critical";
    type: string;
    description: string;
    date: string;
    actions_prises: string[];
  }>;

  recommendations: Array<{
    priorite: "basse" | "moyenne" | "haute";
    description: string;
    impact: string;
    actions_recommandees: string[];
  }>;
}

/**
 * Paramètres de filtrage pour les permissions
 */
export interface PermissionFilterParams {
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
    | "administration";
  niveau?: 1 | 2 | 3 | 4 | 5;
  portee?: "global" | "groupe" | "objet" | "utilisateur";

  est_systeme?: boolean;
  est_obligatoire?: boolean;
  est_cachee?: boolean;

  groupes?: string[];
  tags?: string[];

  search?: string;

  sort_by?:
    | "code"
    | "nom"
    | "categorie"
    | "niveau"
    | "date_creation"
    | "utilisation_count";
  sort_order?: "asc" | "desc";
}
