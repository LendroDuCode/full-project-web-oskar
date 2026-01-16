// services/statuts-matrimoniaux/statuts-matrimoniaux.types.ts

/**
 * Statuts matrimoniaux disponibles
 */
export type StatutMatrimonial =
  | "celibataire" // Célibataire
  | "marie" // Marié(e)
  | "veuf" // Veuf/Veuve
  | "divorce" // Divorcé(e)
  | "separe" // Séparé(e) légalement
  | "union_libre" // En union libre
  | "pacs" // Pacsé(e)
  | "fiance" // Fiancé(e)
  | "conjoint_survivant"; // Conjoint survivant

/**
 * Genre pour accord grammatical
 */
export type GenreStatut =
  | "masculin" // Pour les hommes
  | "feminin" // Pour les femmes
  | "neutre"; // Neutre (ex: "célibataire")

/**
 * Interface principale pour un statut matrimonial
 */
export interface StatutMatrimonialType {
  // Identifiants
  uuid: string;
  code: string; // Code unique (ex: "celibataire", "marie")
  libelle: string; // Libellé par défaut

  // Informations générales
  description?: string;
  genre: GenreStatut;

  // Libellés spécifiques
  libelle_masculin?: string; // Libellé pour les hommes (ex: "Marié")
  libelle_feminin?: string; // Libellé pour les femmes (ex: "Mariée")
  libelle_pluriel?: string; // Libellé pluriel (ex: "Mariés")

  // Statut et visibilité
  actif: boolean;
  ordre_affichage: number; // Ordre d'affichage dans les listes
  defaut: boolean; // Si c'est le statut par défaut

  // Validations
  age_minimum?: number; // Âge minimum pour ce statut
  preuve_requise?: boolean; // Si une preuve est requise
  documents_acceptes?: string[]; // Types de documents acceptés

  // Aspects juridiques
  reconnaissance_legale: boolean; // Reconnu légalement
  pays_valides?: string[]; // Pays où ce statut est valide
  date_introduction?: string; // Date d'introduction dans le système

  // Métadonnées
  icone?: string; // Nom de l'icône ou URL
  couleur?: string; // Code couleur hexadécimal
  metadata?: Record<string, any>;
  custom_data?: Record<string, any>;

  // Informations techniques
  date_creation: string;
  date_modification?: string;
  createur_uuid?: string;

  // Statistiques
  utilisateurs_count?: number; // Nombre d'utilisateurs avec ce statut
  taux_utilisation?: number; // Pourcentage d'utilisation

  // Historique
  historique_modifications?: Array<{
    date: string;
    utilisateur: string;
    modifications: string[];
  }>;

  // Relations familiales
  permet_conjoint?: boolean; // Si ce statut permet d'avoir un conjoint
  permet_enfant?: boolean; // Si ce statut permet d'avoir des enfants
  nombre_conjoints_max?: number; // Nombre maximum de conjoints

  // Traductions
  traductions?: Array<{
    langue: string;
    libelle: string;
    description?: string;
  }>;

  // Restrictions
  restrictions?: Array<{
    type: "age" | "nationalite" | "religion" | "statut_antérieur";
    valeur: any;
    message: string;
  }>;
}

/**
 * Données requises pour créer un statut matrimonial
 */
export interface StatutMatrimonialCreateData {
  code: string; // Obligatoire
  libelle: string; // Obligatoire

  // Informations optionnelles
  description?: string;
  genre?: GenreStatut;

  libelle_masculin?: string;
  libelle_feminin?: string;
  libelle_pluriel?: string;

  actif?: boolean;
  ordre_affichage?: number;
  defaut?: boolean;

  age_minimum?: number;
  preuve_requise?: boolean;
  documents_acceptes?: string[];

  reconnaissance_legale?: boolean;
  pays_valides?: string[];

  icone?: string;
  couleur?: string;

  permet_conjoint?: boolean;
  permet_enfant?: boolean;
  nombre_conjoints_max?: number;

  metadata?: Record<string, any>;
  custom_data?: Record<string, any>;
}

/**
 * Données pour mettre à jour un statut matrimonial
 */
export interface StatutMatrimonialUpdateData {
  libelle?: string;
  description?: string;
  genre?: GenreStatut;

  libelle_masculin?: string;
  libelle_feminin?: string;
  libelle_pluriel?: string;

  actif?: boolean;
  ordre_affichage?: number;
  defaut?: boolean;

  age_minimum?: number;
  preuve_requise?: boolean;
  documents_acceptes?: string[];

  reconnaissance_legale?: boolean;
  pays_valides?: string[];

  icone?: string;
  couleur?: string;

  permet_conjoint?: boolean;
  permet_enfant?: boolean;
  nombre_conjoints_max?: number;

  metadata?: Record<string, any>;
  custom_data?: Record<string, any>;
}

/**
 * Paramètres de filtrage pour les statuts matrimoniaux
 */
export interface StatutMatrimonialFilterParams {
  code?: string;
  libelle?: string;

  actif?: boolean;
  defaut?: boolean;

  genre?: GenreStatut;
  reconnaissance_legale?: boolean;

  age_minimum?: number;
  preuve_requise?: boolean;

  permet_conjoint?: boolean;
  permet_enfant?: boolean;

  search?: string; // Recherche textuelle

  // Tri
  sort_by?:
    | "libelle"
    | "code"
    | "ordre_affichage"
    | "date_creation"
    | "utilisateurs_count";
  sort_order?: "asc" | "desc";
}

/**
 * Statistiques sur les statuts matrimoniaux
 */
export interface StatutMatrimonialStats {
  // Vue d'ensemble
  total_statuts: number;
  statuts_actifs: number;
  statuts_inactifs: number;
  statut_defaut?: StatutMatrimonialType;

  // Distribution
  distribution: Array<{
    statut: StatutMatrimonialType;
    count: number;
    pourcentage: number;
  }>;

  // Démographie
  demographie: {
    total_utilisateurs: number;
    moyenne_age: number;
    repartition_genre: {
      masculin: number;
      feminin: number;
    };
  };

  // Évolution
  evolution_par_mois: Array<{
    mois: string;
    nouveaux_utilisateurs: number;
    changements_statut: number;
  }>;

  // Top statuts
  top_statuts: Array<{
    statut: StatutMatrimonialType;
    utilisateurs: number;
    croissance: number; // Pourcentage
  }>;

  // Âge moyen par statut
  age_moyen_par_statut: Array<{
    statut: StatutMatrimonialType;
    age_moyen: number;
  }>;

  // Métriques
  metrics: {
    taux_changement_moyen: number; // % d'utilisateurs changeant de statut par mois
    duree_moyenne_statut: number; // Durée moyenne en mois
    taux_preuve_fournie: number; // % d'utilisateurs fournissant des preuves
  };
}

/**
 * Historique de changement de statut d'un utilisateur
 */
export interface HistoriqueChangementStatut {
  uuid: string;
  utilisateur_uuid: string;

  ancien_statut?: {
    code: string;
    libelle: string;
  };

  nouveau_statut: {
    code: string;
    libelle: string;
  };

  date_changement: string;
  raison?: string;

  preuve_fournie?: {
    type_document: string;
    numero_document?: string;
    date_document?: string;
    fichier_url?: string;
  };

  valide_par?: {
    utilisateur_uuid: string;
    nom: string;
    role: string;
  };

  notes?: string;
  metadata?: Record<string, any>;
}

/**
 * Demande de changement de statut
 */
export interface DemandeChangementStatut {
  uuid: string;
  utilisateur_uuid: string;
  utilisateur_nom?: string;

  statut_demande: {
    code: string;
    libelle: string;
  };

  statut_actuel?: {
    code: string;
    libelle: string;
  };

  date_demande: string;
  statut_demande:
    | "en_attente"
    | "en_cours"
    | "approuvee"
    | "rejetee"
    | "annulee";

  documents: Array<{
    type: string;
    nom: string;
    url: string;
    statut: "en_attente" | "verifie" | "rejete";
  }>;

  raison_demande?: string;
  commentaires?: string;

  traite_par?: {
    utilisateur_uuid: string;
    nom: string;
    date_traitement?: string;
  };

  notifications?: {
    email_envoye: boolean;
    date_envoi_email?: string;
    rappel_envoye: boolean;
    date_rappel?: string;
  };

  date_validation?: string;
  date_expiration?: string;

  metadata?: Record<string, any>;
}

/**
 * Validation de statut matrimonial
 */
export interface ValidationStatutMatrimonial {
  utilisateur_uuid: string;
  statut_demande: string;

  documents_fournis: Array<{
    type: string;
    valide: boolean;
    raison_rejet?: string;
  }>;

  criteres_validation: Array<{
    critere: string;
    valide: boolean;
    details?: string;
  }>;

  resultat: {
    valide: boolean;
    message?: string;
    statut_final?: string;
    restrictions?: string[];
  };

  validateur?: {
    utilisateur_uuid: string;
    nom: string;
    role: string;
  };

  date_validation: string;
}

/**
 * Rapport d'analyse des statuts matrimoniaux
 */
export interface AnalyseStatutsMatrimoniaux {
  periode: {
    debut: string;
    fin: string;
  };

  // Vue d'ensemble
  total_utilisateurs: number;
  nouveaux_utilisateurs: number;
  changements_statut: number;

  // Distribution
  distribution_statuts: Array<{
    statut: StatutMatrimonialType;
    utilisateurs: number;
    pourcentage: number;
    evolution: number; // Pourcentage par rapport à la période précédente
  }>;

  // Démographie
  repartition_age: Array<{
    tranche_age: string;
    count: number;
    statut_preponderant: string;
  }>;

  repartition_genre: {
    masculin: Array<{
      statut: string;
      count: number;
    }>;
    feminin: Array<{
      statut: string;
      count: number;
    }>;
  };

  // Changements
  taux_changement: number;
  motifs_changement: Array<{
    motif: string;
    count: number;
    pourcentage: number;
  }>;

  // Validations
  demandes_traitees: number;
  taux_approbation: number;
  delai_moyen_traitement: number; // En jours

  // Recommandations
  recommandations?: Array<{
    type: "ajout_statut" | "modification_statut" | "amelioration_processus";
    titre: string;
    description: string;
    priorite: "basse" | "moyenne" | "haute";
  }>;
}

/**
 * Règle de validation pour un statut
 */
export interface RegleValidationStatut {
  uuid: string;
  statut_code: string;

  criteres: Array<{
    type:
      | "age_minimum"
      | "age_maximum"
      | "statut_anterieur"
      | "intervalle_minimum"
      | "documents_requis";
    valeur: any;
    message_erreur: string;
  }>;

  documents_requis: Array<{
    type: string;
    obligatoire: boolean;
    description: string;
  }>;

  validations_automatiques: Array<{
    condition: string;
    action: "approuver_auto" | "rejeter_auto" | "notifier";
  }>;

  actif: boolean;
  ordre_application: number;

  date_creation: string;
  date_modification?: string;
}

/**
 * Notification liée aux statuts matrimoniaux
 */
export interface NotificationStatutMatrimonial {
  uuid: string;
  utilisateur_uuid: string;
  type:
    | "changement_statut"
    | "demande_approuvee"
    | "demande_rejetee"
    | "rappel_documents"
    | "expiration_statut";

  titre: string;
  message: string;
  lien_action?: string;

  statut: "envoyee" | "lue" | "ignoree";
  canal: "email" | "sms" | "push" | "in_app";

  date_creation: string;
  date_envoi?: string;
  date_lecture?: string;

  metadata?: Record<string, any>;
}

/**
 * Configuration de workflow pour les changements de statut
 */
export interface WorkflowChangementStatut {
  uuid: string;
  nom: string;
  description?: string;

  statut_source: string;
  statut_cible: string;

  etapes: Array<{
    ordre: number;
    nom: string;
    type:
      | "saisie"
      | "upload_document"
      | "validation"
      | "approbation"
      | "notification";
    responsable?: string;
    delai_max?: number; // En jours
    actions_requises?: string[];
  }>;

  validations_requises: number;
  approbations_requises: number;

  actif: boolean;
  date_creation: string;
  date_modification?: string;
}

/**
 * Export des données des statuts matrimoniaux
 */
export interface ExportStatutsMatrimoniauxOptions {
  format: "csv" | "json" | "excel" | "pdf";
  include_utilisateurs?: boolean;
  include_historique?: boolean;
  include_statistiques?: boolean;
  filters?: StatutMatrimonialFilterParams;
  fields?: string[];
  langue?: string;
}

/**
 * Import des statuts matrimoniaux
 */
export interface ImportStatutsMatrimoniauxData {
  format: "csv" | "json";
  data: any;
  options?: {
    update_existing?: boolean;
    skip_errors?: boolean;
    validate_only?: boolean;
  };
}

/**
 * Modèle de document pour un statut
 */
export interface ModeleDocumentStatut {
  uuid: string;
  statut_code: string;
  nom: string;
  description?: string;

  type_document: string;
  champs_requis: Array<{
    nom: string;
    type: "texte" | "date" | "nombre" | "fichier";
    obligatoire: boolean;
    validation_regex?: string;
  }>;

  template_url?: string;
  exemple_url?: string;

  instructions_remplissage?: string;
  notes_importantes?: string[];

  actif: boolean;
  date_creation: string;
  date_modification?: string;
}

/**
 * Préférences utilisateur pour les statuts
 */
export interface PreferencesStatutUtilisateur {
  utilisateur_uuid: string;

  statut_actuel: string;
  date_changement_statut?: string;

  preferences_notifications: {
    email_changement: boolean;
    sms_rappel: boolean;
    push_notifications: boolean;
  };

  documents_sauvegardes: Array<{
    type: string;
    nom: string;
    url: string;
    date_upload: string;
  }>;

  historique_consentement: Array<{
    date: string;
    action: string;
    consentement: boolean;
  }>;

  metadata?: Record<string, any>;
  date_creation: string;
  date_modification?: string;
}
