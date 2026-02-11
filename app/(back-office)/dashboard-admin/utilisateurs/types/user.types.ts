// types/index.ts
// Fichier centralisé pour tous les types TypeScript de l'application

// =============================================
// TYPES DE BASE - COMMUNS À TOUTE L'APPLICATION
// =============================================

/**
 * Interface de base pour toutes les entités avec UUID
 */
export interface BaseEntity {
  id: number;
  uuid: string;
  adminUuid: string | null;
  is_deleted?: boolean | undefined;
  deleted_at?: string;
  created_at?: string | null | undefined;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

/**
 * Interface pour les réponses API standardisées
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  pagination?: Pagination;
  timestamp: string;
  errors?: ValidationError[];
}

/**
 * Interface pour la pagination
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Interface pour les erreurs de validation
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

/**
 * Interface pour les options de filtre
 */
export interface FilterOptions {
  search?: string;
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
  [key: string]: any;
}

// =============================================
// TYPES UTILISATEURS
// =============================================

/**
 * Type principal pour les utilisateurs
 */
export interface User extends BaseEntity {
  code_utilisateur?: string;

  // Informations personnelles
  nom: string;
  prenoms: string;
  email: string;
  telephone: string;
  date_naissance?: string;
  lieu_naissance?: string;
  nationalite?: string;
  photo_profil?: string;

  // Authentification
  mot_de_passe?: string;
  est_verifie: boolean;
  est_bloque: boolean;
  is_deleted?: boolean;
  raison_blocage?: string;
  date_derniere_connexion?: string;
  date_derniere_deconnexion?: string;

  // Rôles et permissions
  role_uuid: string;
  is_admin: boolean;
  permissions?: string[];

  // Relations
  civilite_uuid?: string;
  statut_matrimonial_uuid?: string;

  // Adresse
  adresse?: string;
  ville?: string;
  code_postal?: string;
  pays?: string;

  // Informations professionnelles
  profession?: string;
  employeur?: string;
  secteur_activite?: string;

  // Relations étendues
  civilite?: Civilite;
  role?: Role;
  statut_matrimonial?: StatutMatrimonial;
  user_profile?: UserProfile;
}

/**
 * Type pour le profil utilisateur
 */
export interface UserProfile extends BaseEntity {
  user_uuid: string;
  bio?: string;
  site_web?: string;
  reseaux_sociaux?: SocialNetworks;
  preferences?: UserPreferences;
  statistiques?: UserStatistics;
}

/**
 * Type pour les réseaux sociaux
 */
export interface SocialNetworks {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  github?: string;
}

/**
 * Type pour les préférences utilisateur
 */
export interface UserPreferences {
  langue?: string;
  fuseau_horaire?: string;
  format_date?: string;
  format_heure?: string;
  notifications_email?: boolean;
  notifications_push?: boolean;
  theme?: "light" | "dark" | "auto";
  email_frequency?: "immediate" | "daily" | "weekly";
}

/**
 * Type pour les statistiques utilisateur
 */
export interface UserStatistics {
  nombre_connexions: number;
  derniere_activite?: string;
  temps_total_session?: number;
  nombre_actions?: number;
  derniere_connexion_ip?: string;
  derniere_connexion_device?: string;
}

/**
 * Type pour les civilités
 */
export interface Civilite extends BaseEntity {
  id: number;
  uuid: string;
  statut: string;
  slug: string;
  libelle: string;
  adminUuid: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  description?: string;
  code?: string | null;
  libelle_court?: string;
  ordre?: number;
}

/**
 * Type pour les rôles
 */
export interface Role extends BaseEntity {
  name: string;
  description?: string;
  permissions: string[];
  is_default?: boolean;
  niveau?: number;
  statut?: "actif" | "inactif";
}

/**
 * Type pour les statuts matrimoniaux
 */
export interface StatutMatrimonial extends BaseEntity {
  libelle: string;
  code: string;
  description?: string;
  statut?: "actif" | "inactif";
  defaut?: boolean;
  ordre?: number;
}

// =============================================
// TYPES GÉOGRAPHIQUES
// =============================================

/**
 * Type principal pour les pays
 */
export interface Pays extends BaseEntity {
  code: string;
  nom: string;
  nom_complet?: string;
  nom_local?: string;
  description?: string;

  // Drapeau et symboles
  code_drapeau?: string;
  emoji_drapeau?: string;
  devise?: string;
  monnaie_code?: string;
  monnaie_symbole?: string;

  // Géographie
  continent?: string;
  sous_continent?: string;
  region?: string;
  sous_region?: string;
  capitale?: string;
  superficie?: number;
  population?: number;
  densite?: number;

  // Langues
  langues_officielles?: string[];
  langues_parlees?: string[];

  // Indicatifs
  indicatif_telephonique?: string;
  tld?: string;

  // Fuseau horaire
  fuseau_horaire?: string;
  utc_offset?: string;

  // Statut
  statut: "actif" | "inactif" | "archive";
  est_soumis_tva?: boolean;
  taux_tva_standard?: number;

  // Localisation
  latitude?: number;
  longitude?: number;

  // Relations
  villes?: Ville[];
  regions?: Region[];
  departements?: Departement[];
}

/**
 * Type principal pour les villes
 */
export interface Ville extends BaseEntity {
  nom: string;
  code_postal: string;
  code_insee?: string;
  description?: string;

  // Géographie
  latitude?: number;
  longitude?: number;
  altitude?: number;
  superficie?: number;
  population?: number;
  densite?: number;

  // Relations
  pays_uuid: string;
  departement_uuid?: string;
  region_uuid?: string;

  // Statut
  statut: "actif" | "inactif" | "archive";
  est_capitale?: boolean;
  est_capitale_region?: boolean;
  est_capitale_departement?: boolean;

  // Relations étendues
  pays?: Pays;
  departement?: Departement;
  region?: Region;
  quartiers?: Quartier[];
}

/**
 * Type pour les régions
 */
export interface Region extends BaseEntity {
  nom: string;
  code: string;
  pays_uuid: string;
  description?: string;
  superficie?: number;
  population?: number;
  capitale_region_uuid?: string;
  statut: "actif" | "inactif";

  // Relations
  pays?: Pays;
  villes?: Ville[];
  departements?: Departement[];
}

/**
 * Type pour les départements
 */
export interface Departement extends BaseEntity {
  nom: string;
  code: string;
  region_uuid?: string;
  pays_uuid: string;
  description?: string;
  superficie?: number;
  population?: number;
  prefecture_uuid?: string;
  statut: "actif" | "inactif";

  // Relations
  region?: Region;
  pays?: Pays;
  villes?: Ville[];
}

/**
 * Type pour les quartiers
 */
export interface Quartier extends BaseEntity {
  nom: string;
  ville_uuid: string;
  description?: string;
  type?: string;
  population?: number;
  superficie?: number;
  latitude?: number;
  longitude?: number;
  statut: "actif" | "inactif";
}

// =============================================
// TYPES POUR LES FORMULAIRES
// =============================================

/**
 * Type pour le formulaire d'utilisateur
 */
export interface UserFormData {
  nom: string;
  prenoms: string;
  email: string;
  telephone: string;
  date_naissance?: string;
  lieu_naissance?: string;
  nationalite?: string;
  civilite_uuid?: string;
  role_uuid: string;
  statut_matrimonial_uuid?: string;
  adresse?: string;
  ville?: string;
  code_postal?: string;
  pays?: string;
  profession?: string;
  employeur?: string;
  secteur_activite?: string;
  est_verifie?: boolean;
  est_bloque?: boolean;
  is_admin?: boolean;
  mot_de_passe?: string;
  confirm_mot_de_passe?: string;
}

/**
 * Type pour la création d'utilisateur
 */
export interface CreateUserData {
  nom: string;
  prenoms: string;
  email: string;
  telephone: string;
  mot_de_passe: string;
  confirm_mot_de_passe: string;
  civilite_uuid?: string;
  role_uuid: string;
  est_verifie?: boolean;
  est_bloque?: boolean;
  is_admin?: boolean;
}

/**
 * Type pour la mise à jour d'utilisateur
 */
export interface UpdateUserData {
  nom?: string;
  prenoms?: string;
  email?: string;
  telephone?: string;
  date_naissance?: string;
  lieu_naissance?: string;
  nationalite?: string;
  civilite_uuid?: string;
  role_uuid?: string;
  statut_matrimonial_uuid?: string;
  adresse?: string;
  ville?: string;
  code_postal?: string;
  pays?: string;
  profession?: string;
  employeur?: string;
  secteur_activite?: string;
  est_verifie?: boolean;
  est_bloque?: boolean;
  is_admin?: boolean;
  mot_de_passe?: string;
  photo_profil?: string;
}

/**
 * Type pour le formulaire de ville
 */
export interface VilleFormData {
  nom: string;
  code_postal: string;
  pays_uuid: string;
  departement_uuid?: string;
  region_uuid?: string;
  code_insee?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  superficie?: number;
  population?: number;
  statut?: "actif" | "inactif";
  est_capitale?: boolean;
  est_capitale_region?: boolean;
  est_capitale_departement?: boolean;
}

/**
 * Type pour la création de ville
 */
export interface CreateVilleData {
  nom: string;
  code_postal: string;
  pays_uuid: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  statut?: "actif" | "inactif";
  departement_uuid?: string;
  region_uuid?: string;
  code_insee?: string;
}

// =============================================
// TYPES POUR LES FILTRES
// =============================================

/**
 * Type pour les filtres utilisateur
 */
export interface UserFilterType {
  search?: string;
  role_uuid?: string;
  civilite_uuid?: string;
  statut_matrimonial_uuid?: string;
  est_bloque?: boolean | string;
  est_verifie?: boolean | string;
  is_admin?: boolean | string;
  is_deleted?: boolean | string;
  date_debut?: string;
  date_fin?: string;
  orderBy?: keyof User | "role.name" | "civilite.libelle";
  orderDirection?: "asc" | "desc";
  page?: number;
  limit?: number;
}

/**
 * Type pour les filtres ville
 */
export interface VilleFilterType {
  search?: string;
  pays_uuid?: string;
  departement_uuid?: string;
  region_uuid?: string;
  statut?: "actif" | "inactif" | "archive" | "tous";
  est_capitale?: boolean;
  avec_code_postal?: boolean;
  avec_coordonnees?: boolean;
  population_min?: number;
  population_max?: number;
  orderBy?: keyof Ville | "pays.nom" | "departement.nom" | "population";
  orderDirection?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// =============================================
// TYPES POUR LES STATISTIQUES
// =============================================

/**
 * Type pour les statistiques utilisateur
 */
export interface UserStatsType {
  total: number;
  actifs: number;
  bloques: number;
  non_verifies: number;
  admins: number;
  nouveaux_cette_semaine: number;
  taux_activite: number;
  repartition_par_role: Array<{
    role: string;
    count: number;
    percentage: number;
  }>;
  croissance_mensuelle: number;
}

// =============================================
// TYPES POUR LES OPTIONS DE SÉLECTION
// =============================================

/**
 * Type pour les options d'utilisateur
 */
export interface UserOptionType {
  value: string;
  label: string;
  email: string;
  role?: string;
  disabled?: boolean;
}

/**
 * Type pour les options de pays
 */
export interface PaysOptionType {
  value: string;
  label: string;
  code: string;
  code_drapeau?: string;
  emoji_drapeau?: string;
  continent?: string;
  disabled?: boolean;
}

/**
 * Type pour les options de ville
 */
export interface VilleOptionType {
  value: string;
  label: string;
  code_postal: string;
  pays_uuid: string;
  pays_nom?: string;
  population?: number;
  disabled?: boolean;
}

// =============================================
// TYPES POUR L'HISTORIQUE ET ACTIVITÉS
// =============================================

/**
 * Type pour l'historique des connexions
 */
export interface UserLoginHistory {
  uuid: string;
  user_uuid: string;
  ip_address: string;
  user_agent: string;
  device_type?: string;
  browser?: string;
  os?: string;
  location?: {
    ville?: string;
    region?: string;
    pays?: string;
  };
  status: "success" | "failed" | "blocked";
  reason?: string;
  created_at: string;
}

/**
 * Type pour les activités utilisateur
 */
export interface UserActivity {
  uuid: string;
  user_uuid: string;
  type:
    | "connexion"
    | "deconnexion"
    | "modification"
    | "creation"
    | "suppression"
    | "telechargement"
    | "upload";
  description: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// =============================================
// TYPES POUR LES NOTIFICATIONS
// =============================================

/**
 * Type pour les notifications utilisateur
 */
export interface UserNotification {
  uuid: string;
  user_uuid: string;
  type: "info" | "success" | "warning" | "error" | "system";
  title: string;
  message: string;
  is_read: boolean;
  action_url?: string;
  action_label?: string;
  metadata?: Record<string, any>;
  created_at: string;
  read_at?: string;
}

// =============================================
// TYPES UTILITAIRES
// =============================================

/**
 * Type pour les exports CSV/Excel
 */
export interface ExportData<T = any> {
  headers: string[];
  data: T[];
  filename: string;
  format: "csv" | "excel" | "pdf";
}

/**
 * Type pour les résultats de recherche
 */
export interface SearchResult<T = any> {
  items: T[];
  total: number;
  query: string;
  filters?: FilterOptions;
}

/**
 * Type pour les graphiques et statistiques
 */
export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

/**
 * Type pour les paramètres d'URL
 */
export interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}

// =============================================
// EXPORTS PAR DÉFAUT ET AGGREGÉS
// =============================================

// Export par défaut de tous les types
/*
export default {
  // Types de base
  BaseEntity,
  ApiResponse,
  Pagination,
  ValidationError,
  FilterOptions,

  // Types utilisateurs
  User,
  UserProfile,
  SocialNetworks,
  UserPreferences,
  UserStatistics,
  Civilite,
  Role,
  StatutMatrimonial,

  // Types géographiques
  Pays,
  Ville,
  Region,
  Departement,
  Quartier,

  // Types formulaires
  UserFormData,
  CreateUserData,
  UpdateUserData,
  VilleFormData,
  CreateVilleData,

  // Types filtres
  UserFilterType,
  VilleFilterType,

  // Types statistiques
  UserStatsType,

  // Types options
  UserOptionType,
  PaysOptionType,
  VilleOptionType,

  // Types historique
  UserLoginHistory,
  UserActivity,

  // Types notifications
  UserNotification,

  // Types utilitaires
  ExportData,
  SearchResult,
  ChartData,
  QueryParams,
};

*/

// Export d'un type qui combine les principales entités
export type AppEntity =
  | User
  | Pays
  | Ville
  | Civilite
  | Role
  | StatutMatrimonial;

// Export d'un type pour les formulaires
export type AppFormData = UserFormData | VilleFormData;

// Export d'un type pour les filtres
export type AppFilterType = UserFilterType | VilleFilterType;
