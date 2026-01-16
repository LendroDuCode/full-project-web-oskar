// services/civilites/civilite.types.ts

export interface Civilite {
  // Informations de base
  uuid: string;
  code: string; // Ex: "M", "MME", "DR", "PROF"
  libelle: string; // Ex: "Monsieur", "Madame"
  libelle_court: string; // Ex: "M.", "Mme"
  slug: string;

  // Métadonnées
  description?: string;
  genre: "masculin" | "feminin" | "neutre" | "mixte";
  usage: "formel" | "informel" | "professionnel" | "academique" | "honorifique";

  // Visibilité et statut
  est_actif: boolean;
  ordre: number;
  est_par_defaut: boolean;
  est_visible_formulaire: boolean;
  est_visible_profil: boolean;
  est_visible_liste: boolean;

  // Restrictions
  restrictions_pays?: string[]; // Codes ISO des pays où applicable
  restrictions_culturelles?: string[];
  age_minimum?: number;
  age_maximum?: number;
  professions_associees?: string[];

  // Localisation
  traductions?: {
    [lang: string]: {
      libelle: string;
      libelle_court: string;
      description?: string;
    };
  };

  // Configuration d'affichage
  prefixe_nom?: string; // Pour les formules de politesse
  suffixe_nom?: string;
  format_complet?: string; // Pattern d'affichage

  // SEO et métadonnées
  meta_titre?: string;
  meta_description?: string;
  mots_cles?: string[];

  // Dates
  date_debut_validite?: string;
  date_fin_validite?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;

  // Statistiques d'utilisation
  nombre_utilisations?: number;
  derniere_utilisation?: string;

  // Relations
  utilisateurs_count?: number;
  vendeurs_count?: number;
  agents_count?: number;
}

export interface CiviliteCreateData {
  code: string;
  libelle: string;
  libelle_court: string;
  slug?: string;
  description?: string;
  genre: "masculin" | "feminin" | "neutre" | "mixte";
  usage: "formel" | "informel" | "professionnel" | "academique" | "honorifique";
  est_actif?: boolean;
  ordre?: number;
  est_par_defaut?: boolean;
  est_visible_formulaire?: boolean;
  est_visible_profil?: boolean;
  est_visible_liste?: boolean;
  restrictions_pays?: string[];
  restrictions_culturelles?: string[];
  age_minimum?: number;
  age_maximum?: number;
  professions_associees?: string[];
  traductions?: {
    [lang: string]: {
      libelle: string;
      libelle_court: string;
      description?: string;
    };
  };
  prefixe_nom?: string;
  suffixe_nom?: string;
  format_complet?: string;
  meta_titre?: string;
  meta_description?: string;
  mots_cles?: string[];
  date_debut_validite?: string;
  date_fin_validite?: string;
}

export interface CiviliteUpdateData {
  code?: string;
  libelle?: string;
  libelle_court?: string;
  slug?: string;
  description?: string;
  genre?: "masculin" | "feminin" | "neutre" | "mixte";
  usage?:
    | "formel"
    | "informel"
    | "professionnel"
    | "academique"
    | "honorifique";
  est_actif?: boolean;
  ordre?: number;
  est_par_defaut?: boolean;
  est_visible_formulaire?: boolean;
  est_visible_profil?: boolean;
  est_visible_liste?: boolean;
  restrictions_pays?: string[];
  restrictions_culturelles?: string[];
  age_minimum?: number;
  age_maximum?: number;
  professions_associees?: string[];
  traductions?: {
    [lang: string]: {
      libelle: string;
      libelle_court: string;
      description?: string;
    };
  };
  prefixe_nom?: string;
  suffixe_nom?: string;
  format_complet?: string;
  meta_titre?: string;
  meta_description?: string;
  mots_cles?: string[];
  date_debut_validite?: string;
  date_fin_validite?: string;
}

export interface CiviliteFilterParams {
  genre?: "masculin" | "feminin" | "neutre" | "mixte";
  usage?:
    | "formel"
    | "informel"
    | "professionnel"
    | "academique"
    | "honorifique";
  est_actif?: boolean;
  est_par_defaut?: boolean;
  est_visible_formulaire?: boolean;
  est_visible_profil?: boolean;
  est_visible_liste?: boolean;
  pays_code?: string;
  age?: number;
  profession?: string;
  search?: string;
  include_inactives?: boolean;
  include_deleted?: boolean;
}

export interface CivilitePaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: "code" | "libelle" | "ordre" | "created_at" | "nombre_utilisations";
  sort_order?: "asc" | "desc";
  filters?: CiviliteFilterParams;
}

export interface CiviliteStats {
  total_civilites: number;
  civilites_actives: number;
  civilites_inactives: number;
  civilites_par_defaut: number;

  par_genre: Record<string, number>;
  par_usage: Record<string, number>;
  par_pays: Record<string, number>;

  utilisations_total: number;
  civilite_plus_utilisee?: {
    uuid: string;
    code: string;
    libelle: string;
    count: number;
  };
  civilite_moins_utilisee?: {
    uuid: string;
    code: string;
    libelle: string;
    count: number;
  };

  repartition_utilisateurs: {
    utilisateurs: number;
    vendeurs: number;
    agents: number;
    admins: number;
  };
}

export interface CiviliteUsageStats {
  periode: {
    debut: string;
    fin: string;
  };
  total_utilisations: number;
  par_civilite: Array<{
    civilite: Civilite;
    count: number;
    pourcentage: number;
  }>;
  par_mois: Array<{
    mois: string;
    utilisations: number;
  }>;
  par_type_utilisateur: {
    utilisateurs: number;
    vendeurs: number;
    agents: number;
  };
}

export interface CiviliteValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  code_available?: boolean;
  slug_available?: boolean;
}

export interface CiviliteImportData {
  code: string;
  libelle: string;
  libelle_court: string;
  genre: string;
  usage: string;
  ordre?: number;
  est_actif?: boolean;
  pays?: string[];
}

export interface CiviliteExportOptions {
  format: "json" | "csv" | "xml" | "pdf";
  include_stats: boolean;
  include_utilisations: boolean;
  include_inactives: boolean;
  filters?: CiviliteFilterParams;
}

export interface CiviliteBulkUpdate {
  uuids: string[];
  updates: CiviliteUpdateData;
}

export interface CiviliteWithUsage extends Civilite {
  utilisations: {
    total: number;
    par_mois: Array<{ mois: string; count: number }>;
    par_type: Record<string, number>;
  };
}

export interface CiviliteFormOptions {
  includeInactives?: boolean;
  includeNeutral?: boolean;
  filterByCountry?: string;
  filterByAge?: number;
  filterByProfession?: string;
  format?: "long" | "short" | "both";
}

export interface CiviliteSuggestion {
  civilite: Civilite;
  score: number;
  reason: string;
}

export interface CiviliteMapping {
  old_code: string;
  new_code: string;
  reason: string;
}

export interface CiviliteMergeRequest {
  source_uuid: string;
  target_uuid: string;
  migrate_users: boolean;
  keep_source?: boolean;
}

export interface CiviliteTranslation {
  langue: string;
  libelle: string;
  libelle_court: string;
  description?: string;
  est_approuve: boolean;
}

export interface CiviliteTemplate {
  id: string;
  nom: string;
  description?: string;
  civilites: string[];
  pays_cibles: string[];
  contexte: string[];
  est_actif: boolean;
}

export interface CiviliteImportResult {
  success: number;
  failed: number;
  skipped: number;
  errors: Array<{
    ligne: number;
    erreur: string;
    donnees: Record<string, any>;
  }>;
  imported: Civilite[];
  warnings: string[];
}

export interface CiviliteContext {
  pays: string;
  langue: string;
  formalite: "formel" | "informel";
  contexte: "professionnel" | "academique" | "social" | "administratif";
  age?: number;
  profession?: string;
  genre_prefere?: string;
}

export interface CiviliteRecommendation {
  civilite: Civilite;
  pertinence: number;
  raisons: string[];
  alternatives: Civilite[];
}

export interface CiviliteHistory {
  uuid: string;
  civilite_uuid: string;
  action:
    | "creation"
    | "modification"
    | "suppression"
    | "activation"
    | "desactivation";
  anciennes_valeurs?: Partial<Civilite>;
  nouvelles_valeurs?: Partial<Civilite>;
  utilisateur_uuid?: string;
  utilisateur_type?: string;
  date_action: string;
  ip_address?: string;
  user_agent?: string;
}

export interface CiviliteAuditLog {
  periode: {
    debut: string;
    fin: string;
  };
  actions: CiviliteHistory[];
  stats: {
    total_actions: number;
    par_action: Record<string, number>;
    par_utilisateur: Record<string, number>;
  };
}
