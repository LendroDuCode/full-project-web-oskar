// types/statut-matrimonial.ts

import { BaseEntity, StatusType } from "./base.entity";



// Ajoutez ceci après les imports
interface StatutMatrimonialType {
  uuid: string;
  libelle: string;
  code: string;
  description?: string;
  statut: 'actif' | 'inactif';
  defaut: boolean;
  ordre?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

/**
 * Type principal pour les statuts matrimoniaux
 */
export interface StatutMatrimonialStatsType extends BaseEntity {
  // Informations principales
  libelle: string;
  code: string;
  description?: string;
  ordre?: number;
  
  // Configuration
  defaut: boolean;
  statut: StatusType;
  
  // Restrictions d'âge (optionnelles)
  age_minimum?: number;
  age_maximum?: number;
  age_recommande?: number;
  
  // Données statistiques
  nombre_utilisations?: number;
  derniere_utilisation?: string;
  taux_utilisation?: number;
  
  // Métadonnées avancées
  icone?: string;
  couleur?: string;
  categorie?: string;
  tags?: string[];
  
  // Informations légales (optionnelles)
  code_legal?: string;
  equivalent_etranger?: {
    pays: string;
    libelle: string;
    code: string;
  }[];
  conditions_legales?: string[];
  
  // Restrictions spécifiques
  permet_contrat_mariage?: boolean;
  permet_pacs?: boolean;
  permet_concubinage?: boolean;
  permet_union_libre?: boolean;
  
  // Durées (optionnelles)
  duree_minimale?: number; // en jours
  duree_maximale?: number; // en jours
  
  // Relations (optionnelles selon le contexte)
  utilisateurs?: UserReference[];
  statistiques_avancees?: StatistiquesAvancees;
  historique_changements?: HistoriqueStatut[];
  
  // Validation
  est_valide?: boolean;
  date_validation?: string;
  valide_par?: string;
  
  // Localisation
  pays_applicables?: string[];
  regions_applicables?: string[];
  
  // Documentation
  documentation_url?: string;
  notes_internes?: string;
  
  // Audit
  version?: number;
  audit_trail?: AuditTrailEntry[];
}

/**
 * Type pour les références utilisateur
 */
export interface UserReference {
  uuid: string;
  nom: string;
  prenoms: string;
  email: string;
  date_naissance?: string;
  statut_matrimonial_date?: string;
}

/**
 * Type pour les statistiques avancées
 */
export interface StatistiquesAvancees {
  total_utilisateurs: number;
  par_annee: Array<{
    annee: number;
    count: number;
    variation: number;
  }>;
  par_age: Array<{
    tranche_age: string;
    count: number;
    pourcentage: number;
  }>;
  par_region: Array<{
    region: string;
    count: number;
    pourcentage: number;
  }>;
  par_genre: {
    hommes: number;
    femmes: number;
    autres: number;
  };
  tendances: Array<{
    periode: string;
    valeur: number;
    evolution: number;
  }>;
}

/**
 * Type pour l'historique des changements de statut
 */
export interface HistoriqueStatut {
  id: string;
  utilisateur_uuid: string;
  ancien_statut?: string;
  nouveau_statut: string;
  date_changement: string;
  raison?: string;
  document_reference?: string;
  officier?: string;
  lieu?: string;
  notes?: string;
}

/**
 * Type pour les entrées d'audit
 */
export interface AuditTrailEntry {
  id: string;
  action: 'creation' | 'modification' | 'suppression' | 'activation' | 'desactivation';
  utilisateur_uuid: string;
  utilisateur_nom: string;
  date: string;
  anciennes_valeurs?: Partial<StatutMatrimonialType>;
  nouvelles_valeurs?: Partial<StatutMatrimonialType>;
  ip_address?: string;
  user_agent?: string;
  notes?: string;
}

// =============================================
// TYPES POUR LES FORMULAIRES
// =============================================

/**
 * Type pour le formulaire de statut matrimonial
 */
export interface StatutMatrimonialFormData {
  libelle: string;
  code: string;
  description?: string;
  ordre?: number;
  statut?: StatusType;
  defaut?: boolean;
  age_minimum?: number;
  age_maximum?: number;
  age_recommande?: number;
  icone?: string;
  couleur?: string;
  categorie?: string;
  tags?: string[];
  code_legal?: string;
  permet_contrat_mariage?: boolean;
  permet_pacs?: boolean;
  permet_concubinage?: boolean;
  permet_union_libre?: boolean;
  duree_minimale?: number;
  duree_maximale?: number;
  pays_applicables?: string[];
  regions_applicables?: string[];
  documentation_url?: string;
  notes_internes?: string;
}

/**
 * Type pour la création de statut matrimonial
 */
export interface CreateStatutMatrimonialData {
  libelle: string;
  code: string;
  description?: string;
  ordre?: number;
  statut?: StatusType;
  defaut?: boolean;
}

/**
 * Type pour la mise à jour de statut matrimonial
 */
export interface UpdateStatutMatrimonialData {
  libelle?: string;
  code?: string;
  description?: string;
  ordre?: number;
  statut?: StatusType;
  defaut?: boolean;
  age_minimum?: number;
  age_maximum?: number;
  age_recommande?: number;
  icone?: string;
  couleur?: string;
  categorie?: string;
  tags?: string[];
  code_legal?: string;
  permet_contrat_mariage?: boolean;
  permet_pacs?: boolean;
  permet_concubinage?: boolean;
  permet_union_libre?: boolean;
  duree_minimale?: number;
  duree_maximale?: number;
  pays_applicables?: string[];
  regions_applicables?: string[];
  documentation_url?: string;
  notes_internes?: string;
}

// =============================================
// TYPES POUR LES FILTRES
// =============================================

/**
 * Type pour les filtres de statuts matrimoniaux
 */
export interface StatutMatrimonialFilterType {
  search?: string;
  statut?: StatusType | 'tous';
  defaut?: boolean;
  categorie?: string;
  age_minimum?: number;
  age_maximum?: number;
  avec_utilisateurs?: boolean;
  avec_statistiques?: boolean;
  orderBy?: keyof StatutMatrimonialType | 'nombre_utilisations' | 'ordre';
  orderDirection?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  tags?: string[];
  pays_applicables?: string[];
}

// =============================================
// TYPES POUR LES STATISTIQUES
// =============================================

/**
 * Type pour les statistiques des statuts matrimoniaux
 */
export interface StatutMatrimonialStatsType {
  total: number;
  actifs: number;
  inactifs: number;
  par_defaut: number;
  par_categorie: Record<string, number>;
  utilisateurs_par_statut: Array<{
    statut: string;
    count: number;
    pourcentage: number;
  }>;
  tendances_par_mois: Array<{
    mois: string;
    nouveaux_utilisateurs: number;
    changements_statut: number;
  }>;
  distribution_par_age: Array<{
    tranche_age: string;
    count: number;
    pourcentage: number;
  }>;
  top_statuts: StatutMatrimonialType[];
  taux_utilisation_moyen: number;
  evolution_annuelle: number;
}

// =============================================
// TYPES POUR LES OPTIONS DE SÉLECTION
// =============================================

/**
 * Type pour les options de sélection de statut matrimonial
 */
export interface StatutMatrimonialOptionType {
  value: string;
  label: string;
  code: string;
  description?: string;
  defaut: boolean;
  ordre?: number;
  disabled?: boolean;
  icone?: string;
  couleur?: string;
  age_minimum?: number;
  age_maximum?: number;
}

/**
 * Type pour les options de catégorie
 */
export interface CategorieOptionType {
  value: string;
  label: string;
  description?: string;
  count?: number;
}

// =============================================
// TYPES POUR L'EXPORT
// =============================================

/**
 * Type pour l'export des statuts matrimoniaux
 */
export interface StatutMatrimonialExportData {
  uuid: string;
  libelle: string;
  code: string;
  description: string;
  statut: string;
  defaut: boolean;
  ordre: number;
  nombre_utilisations: number;
  taux_utilisation: number;
  age_minimum: number;
  age_maximum: number;
  categorie: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  derniere_utilisation: string;
}

// =============================================
// TYPES POUR LES RAPPORTS
// =============================================

/**
 * Type pour les rapports de statuts matrimoniaux
 */
export interface StatutMatrimonialReportData {
  periode_debut: string;
  periode_fin: string;
  total_utilisateurs: number;
  repartition: Array<{
    statut: string;
    count: number;
    pourcentage: number;
    evolution: number;
  }>;
  nouveaux_utilisateurs: number;
  changements_statut: number;
  statistiques_demographiques: {
    age_moyen: number;
    repartition_genre: Record<string, number>;
    repartition_region: Record<string, number>;
  };
  tendances: Array<{
    date: string;
    valeur: number;
    prediction: number;
  }>;
  recommandations: string[];
}

// =============================================
// TYPES POUR LES TRANSITIONS DE STATUT
// =============================================

/**
 * Type pour les transitions de statut matrimonial
 */
export interface StatutMatrimonialTransition {
  id: string;
  utilisateur_uuid: string;
  ancien_statut_uuid?: string;
  nouveau_statut_uuid: string;
  date_transition: string;
  raison?: string;
  officier?: string;
  lieu?: string;
  document_reference?: string;
  notes?: string;
  statut_validation: 'en_attente' | 'valide' | 'rejete';
  valide_par?: string;
  date_validation?: string;
  commentaire_validation?: string;
}

/**
 * Type pour les règles de transition
 */
export interface TransitionRule {
  id: string;
  ancien_statut_uuid: string;
  nouveau_statut_uuid: string;
  conditions?: string[];
  restrictions?: string[];
  delai_minimum?: number;
  delai_maximum?: number;
  documents_requis?: string[];
  validation_requise: boolean;
  validateur_role?: string;
  statut: 'actif' | 'inactif';
}

// =============================================
// TYPES POUR LES VALIDATIONS
// =============================================

/**
 * Type pour la validation d'un statut matrimonial
 */
export interface ValidationStatutMatrimonial {
  uuid: string;
  statut_uuid: string;
  utilisateur_uuid: string;
  type_validation: 'age' | 'documents' | 'conditions' | 'complet';
  resultat: 'valide' | 'invalide' | 'en_attente';
  message?: string;
  details?: Record<string, any>;
  date_validation: string;
  valide_par?: string;
  rejete_par?: string;
  date_rejet?: string;
  raison_rejet?: string;
}

// =============================================
// TYPES POUR LES DOCUMENTS ASSOCIÉS
// =============================================

/**
 * Type pour les documents associés aux statuts matrimoniaux
 */
export interface StatutMatrimonialDocument {
  uuid: string;
  statut_uuid: string;
  type: 'contrat' | 'certificat' | 'attestation' | 'declaration' | 'autre';
  nom: string;
  description?: string;
  fichier_url: string;
  taille: number;
  format: string;
  obligatoire: boolean;
  statut: 'actif' | 'inactif';
  created_at: string;
  updated_at: string;
  created_by: string;
}

// =============================================
// TYPES POUR LES ÉVÉNEMENTS
// =============================================

/**
 * Type pour les événements liés aux statuts matrimoniaux
 */
export interface StatutMatrimonialEvent {
  uuid: string;
  type: 'creation' | 'modification' | 'suppression' | 'changement_statut' | 'validation' | 'rejet';
  utilisateur_uuid: string;
  utilisateur_nom: string;
  statut_uuid: string;
  statut_libelle: string;
  ancienne_valeur?: any;
  nouvelle_valeur?: any;
  date: string;
  ip_address?: string;
  user_agent?: string;
  notes?: string;
}

// =============================================
// TYPES UTILITAIRES
// =============================================

/**
 * Type pour la recherche de statut matrimonial
 */
export interface StatutMatrimonialSearchResult {
  uuid: string;
  libelle: string;
  code: string;
  description?: string;
  defaut: boolean;
  statut: StatusType;
  ordre?: number;
  nombre_utilisations?: number;
  score?: number;
}

/**
 * Type pour les suggestions de statut matrimonial
 */
export interface StatutMatrimonialSuggestion {
  uuid: string;
  libelle: string;
  code: string;
  description?: string;
  score: number;
  raison: string;
  compatible: boolean;
}

/**
 * Type pour la comparaison de statuts matrimoniaux
 */
export interface StatutMatrimonialComparison {
  criteres: string[];
  statuts: Array<{
    uuid: string;
    libelle: string;
    valeurs: Record<string, any>;
    points_forts: string[];
    points_faibles: string[];
    score: number;
  }>;
  meilleur_choix?: string;
  pire_choix?: string;
}

// =============================================
// FONCTIONS UTILITAIRES
// =============================================


