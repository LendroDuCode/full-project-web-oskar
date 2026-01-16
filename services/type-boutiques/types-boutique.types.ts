// services/types-boutique/types-boutique.types.ts

/**
 * Types de boutique disponibles
 */
export type TypeBoutique =
  | "boutique_physique" // Boutique physique uniquement
  | "boutique_en_ligne" // Boutique en ligne uniquement
  | "hybride" // Mixte physique et en ligne
  | "popup_store" // Boutique éphémère
  | "corner" // Corner dans un magasin
  | "boutique_depot" // Boutique-dépôt
  | "showroom" // Showroom
  | "boutique_voyageante" // Boutique itinérante
  | "boutique_sociale" // Boutique sociale/communautaire
  | "boutique_artisanale" // Boutique artisanale
  | "concept_store" // Concept store
  | "franchise" // Franchise
  | "succursale" // Succursale
  | "boutique_cooperative" // Boutique coopérative
  | "marche" // Marché/marchand ambulant
  | "autre"; // Autre type

/**
 * Catégorie de boutique
 */
export type CategorieBoutique =
  | "alimentation" // Alimentation
  | "vetements" // Vêtements et accessoires
  | "technologie" // Électronique et technologie
  | "maison" // Maison et décoration
  | "beaute" // Beauté et cosmétiques
  | "sante" // Santé et bien-être
  | "sport" // Sports et loisirs
  | "culture" // Culture et divertissement
  | "enfant" // Enfants et bébés
  | "automobile" // Automobile et moto
  | "bricolage" // Bricolage et jardinage
  | "art" // Art et artisanat
  | "livres" // Livres et papeterie
  | "luxe" // Luxe et joaillerie
  | "service" // Services
  | "autre"; // Autre catégorie

/**
 * Statut du type de boutique
 */
export type StatutTypeBoutique =
  | "actif" // Actif et disponible
  | "inactif" // Inactif
  | "en_test" // En phase de test
  | "deprecie" // Déprécié (ne plus utiliser)
  | "en_approbation" // En attente d'approbation
  | "archive"; // Archivé

/**
 * Niveau de complexité de gestion
 */
export type NiveauComplexite =
  | "simple" // Simple (idéal pour débutants)
  | "intermediaire" // Intermédiaire
  | "avance" // Avancé
  | "expert"; // Expert

/**
 * Interface principale pour un type de boutique
 */
export interface TypeBoutiqueType {
  // Identifiants
  uuid: string;
  code: string; // Code unique (ex: "boutique_physique", "hybride")
  nom: string; // Nom du type de boutique

  // Informations générales
  description?: string;
  description_longue?: string;
  instructions?: string; // Instructions d'utilisation

  // Catégorisation
  type: TypeBoutique;
  categories: CategorieBoutique[]; // Catégories compatibles
  sous_types?: string[]; // Sous-types spécifiques

  // Configuration
  configuration: {
    permet_vente_en_ligne: boolean;
    permet_vente_physique: boolean;
    necessite_adresse_physique: boolean;
    necessite_catalogue_en_ligne: boolean;
    permet_reservation: boolean;
    permet_livraison: boolean;
    permet_retrait_en_magasin: boolean;
    permet_paiement_en_ligne: boolean;
    permet_paiement_sur_place: boolean;
    necessite_stock: boolean;
    permet_gestion_stock_automatique: boolean;
  };

  // Fonctionnalités incluses
  fonctionnalites: Array<{
    code: string;
    nom: string;
    description?: string;
    obligatoire: boolean;
  }>;

  // Limites et restrictions
  limites: {
    produits_max?: number; // Nombre maximum de produits
    categories_max?: number; // Nombre maximum de catégories
    employes_max?: number; // Nombre maximum d'employés
    stockage_max?: number; // Stockage maximum en Go
    transactions_max_mois?: number; // Transactions mensuelles max
  };

  // Tarification
  tarification: {
    gratuit: boolean;
    prix_mensuel?: number;
    prix_annuel?: number;
    commission_vente?: number; // % de commission sur les ventes
    frais_transaction?: number; // Frais par transaction
    periode_essai_jours?: number; // Période d'essai gratuite
  };

  // Statut et visibilité
  statut: StatutTypeBoutique;
  actif: boolean;
  defaut: boolean; // Type par défaut
  ordre_affichage: number; // Ordre dans les listes

  // Complexité
  niveau_complexite: NiveauComplexite;
  recommandations: {
    pour_debutants: boolean;
    pour_petites_boutiques: boolean;
    pour_grandes_boutiques: boolean;
    pour_franchises: boolean;
  };

  // Visuels
  icone?: string; // Nom de l'icône ou URL
  image_illustration?: string; // Image d'illustration
  couleur_principale?: string; // Couleur hexadécimale
  couleur_secondaire?: string;

  // Métadonnées
  metadata?: Record<string, any>;
  custom_data?: Record<string, any>;
  tags?: string[]; // Tags pour recherche

  // Informations techniques
  date_creation: string;
  date_modification?: string;
  createur_uuid?: string;
  version: string; // Version du modèle

  // Statistiques
  boutiques_count?: number; // Nombre de boutiques utilisant ce type
  taux_adoption?: number; // Taux d'adoption (%)
  satisfaction_moyenne?: number; // Note moyenne de satisfaction

  // Documentation
  documentation_url?: string;
  guide_installation_url?: string;
  faq_url?: string;
  support_contact?: string;

  // Compatibilité
  compatibilite: {
    plugins?: string[]; // Plugins compatibles
    themes?: string[]; // Thèmes compatibles
    paiements?: string[]; // Méthodes de paiement
    livraisons?: string[]; // Services de livraison
  };

  // Mise à niveau
  upgrades_possibles?: string[]; // UUIDs des types de niveau supérieur
  downgrades_possibles?: string[]; // UUIDs des types de niveau inférieur

  // Localisation
  pays_disponibles?: string[]; // Codes pays où disponible
  langues_disponibles?: string[]; // Langues supportées

  // Contrats et légal
  conditions_utilisation_url?: string;
  politique_confidentialite_url?: string;
  contrat_type_url?: string;
}

/**
 * Données requises pour créer un type de boutique
 */
export interface TypeBoutiqueCreateData {
  code: string; // Obligatoire
  nom: string; // Obligatoire

  // Informations optionnelles
  description?: string;
  type: TypeBoutique;
  categories?: CategorieBoutique[];

  configuration?: Partial<TypeBoutiqueType["configuration"]>;
  fonctionnalites?: Array<{
    code: string;
    nom: string;
    obligatoire?: boolean;
  }>;

  limites?: Partial<TypeBoutiqueType["limites"]>;
  tarification?: Partial<TypeBoutiqueType["tarification"]>;

  statut?: StatutTypeBoutique;
  actif?: boolean;
  defaut?: boolean;
  ordre_affichage?: number;

  niveau_complexite?: NiveauComplexite;

  icone?: string;
  couleur_principale?: string;

  metadata?: Record<string, any>;
  tags?: string[];

  compatibilite?: Partial<TypeBoutiqueType["compatibilite"]>;
  pays_disponibles?: string[];
}

/**
 * Données pour mettre à jour un type de boutique
 */
export interface TypeBoutiqueUpdateData {
  nom?: string;
  description?: string;
  description_longue?: string;
  instructions?: string;

  type?: TypeBoutique;
  categories?: CategorieBoutique[];
  sous_types?: string[];

  configuration?: Partial<TypeBoutiqueType["configuration"]>;
  fonctionnalites?: Array<{
    code: string;
    nom: string;
    description?: string;
    obligatoire: boolean;
  }>;

  limites?: Partial<TypeBoutiqueType["limites"]>;
  tarification?: Partial<TypeBoutiqueType["tarification"]>;

  statut?: StatutTypeBoutique;
  actif?: boolean;
  defaut?: boolean;
  ordre_affichage?: number;

  niveau_complexite?: NiveauComplexite;
  recommandations?: Partial<TypeBoutiqueType["recommandations"]>;

  icone?: string;
  image_illustration?: string;
  couleur_principale?: string;
  couleur_secondaire?: string;

  metadata?: Record<string, any>;
  custom_data?: Record<string, any>;
  tags?: string[];

  documentation_url?: string;
  guide_installation_url?: string;

  compatibilite?: Partial<TypeBoutiqueType["compatibilite"]>;
  upgrades_possibles?: string[];
  downgrades_possibles?: string[];

  pays_disponibles?: string[];
  langues_disponibles?: string[];

  version?: string;
}

/**
 * Configuration de boutique pour un type spécifique
 */
export interface ConfigurationTypeBoutique {
  type_boutique_uuid: string;

  parametres: {
    // Général
    theme_par_defaut?: string;
    logo_obligatoire?: boolean;
    banniere_obligatoire?: boolean;
    description_obligatoire?: boolean;

    // Produits
    photos_produit_obligatoires?: number;
    description_produit_min_length?: number;
    prix_obligatoire?: boolean;
    stock_obligatoire?: boolean;

    // Paiement
    methodes_paiement_obligatoires?: string[];
    paiement_securise_obligatoire?: boolean;

    // Livraison
    methodes_livraison_obligatoires?: string[];
    delais_livraison_obligatoires?: boolean;

    // Contact
    email_contact_obligatoire?: boolean;
    telephone_contact_obligatoire?: boolean;
    adresse_obligatoire?: boolean;

    // Légal
    cgv_obligatoires?: boolean;
    mentions_legales_obligatoires?: boolean;
    politique_confidentialite_obligatoire?: boolean;
  };

  validations: Array<{
    champ: string;
    type_validation:
      | "required"
      | "min_length"
      | "max_length"
      | "regex"
      | "file_type"
      | "file_size";
    valeur?: any;
    message_erreur: string;
  }>;

  templates: {
    description_boutique?: string;
    email_bienvenue?: string;
    page_apropos?: string;
    conditions_vente?: string;
  };

  actif: boolean;
  date_creation: string;
  date_modification?: string;
}

/**
 * Statistiques sur les types de boutique
 */
export interface TypeBoutiqueStats {
  // Vue d'ensemble
  total_types: number;
  types_actifs: number;
  types_inactifs: number;
  type_defaut?: TypeBoutiqueType;

  // Distribution
  distribution_types: Array<{
    type: TypeBoutique;
    count: number;
    pourcentage: number;
  }>;

  distribution_categories: Array<{
    categorie: CategorieBoutique;
    count: number;
    pourcentage: number;
  }>;

  // Utilisation
  boutiques_par_type: Array<{
    type_uuid: string;
    type_nom: string;
    boutiques_count: number;
    croissance_mensuelle: number;
  }>;

  // Performance
  performance_par_type: Array<{
    type_uuid: string;
    type_nom: string;
    revenu_moyen: number;
    satisfaction_moyenne: number;
    taux_conversion_moyen: number;
  }>;

  // Complexité
  repartition_complexite: Array<{
    niveau: NiveauComplexite;
    count: number;
    pourcentage: number;
  }>;

  // Top types
  top_types_populaires: Array<{
    type: TypeBoutiqueType;
    boutiques_count: number;
    taux_adoption: number;
  }>;

  // Métriques
  metrics: {
    taux_activation_moyen: number; // % de boutiques activées
    duree_moyenne_utilisation: number; // En mois
    taux_changement_type: number; // % de boutiques changeant de type
    taux_satisfaction_global: number; // Satisfaction moyenne
  };
}

/**
 * Analyse comparative des types de boutique
 */
export interface AnalyseComparativeTypes {
  periode: {
    debut: string;
    fin: string;
  };

  // Performance
  performance_types: Array<{
    type: TypeBoutiqueType;
    statistiques: {
      boutiques_actives: number;
      revenu_total: number;
      commandes_total: number;
      clients_total: number;
      panier_moyen: number;
    };
  }>;

  // Satisfaction
  satisfaction_par_type: Array<{
    type: TypeBoutiqueType;
    note_moyenne: number;
    avis_positifs: number;
    avis_negatifs: number;
    taux_recommandation: number;
  }>;

  // Croissance
  croissance_par_type: Array<{
    type: TypeBoutiqueType;
    croissance_boutiques: number;
    croissance_revenu: number;
    croissance_clients: number;
  }>;

  // Recommandations
  recommandations: Array<{
    type: "optimisation" | "migration" | "developpement" | "abandon";
    titre: string;
    description: string;
    types_concernes: string[];
    priorite: "basse" | "moyenne" | "haute" | "critique";
  }>;
}

/**
 * Demande de changement de type de boutique
 */
export interface DemandeChangementTypeBoutique {
  uuid: string;
  boutique_uuid: string;
  boutique_nom?: string;

  ancien_type_uuid?: string;
  ancien_type_nom?: string;
  nouveau_type_uuid: string;
  nouveau_type_nom?: string;

  date_demande: string;
  statut: "en_attente" | "en_cours" | "approuvee" | "rejetee" | "annulee";

  raison_demande?: string;
  impact_estime?: {
    cout?: number;
    duree?: number; // En jours
    changements_necessaires?: string[];
  };

  documents: Array<{
    type: string;
    nom: string;
    url: string;
    statut: "en_attente" | "verifie" | "rejete";
  }>;

  traite_par?: {
    utilisateur_uuid: string;
    nom: string;
    date_traitement?: string;
  };

  date_validation?: string;
  date_migration_prevue?: string;
  date_migration_reelle?: string;

  notes?: string;
  metadata?: Record<string, any>;
}

/**
 * Migration de type de boutique
 */
export interface MigrationTypeBoutique {
  uuid: string;
  demande_uuid: string;
  boutique_uuid: string;

  ancien_type_uuid: string;
  nouveau_type_uuid: string;

  etapes: Array<{
    ordre: number;
    nom: string;
    statut: "en_attente" | "en_cours" | "termine" | "echec";
    date_debut?: string;
    date_fin?: string;
    details?: string;
  }>;

  statut_global: "en_preparation" | "en_cours" | "termine" | "echec" | "annule";

  donnees_migrees: {
    produits: number;
    categories: number;
    clients: number;
    commandes: number;
    parametres: number;
  };

  problemes_rencontres?: Array<{
    etape: string;
    probleme: string;
    solution?: string;
    statut: "resolu" | "en_cours" | "non_resolu";
  }>;

  backup_url?: string;
  rollback_possible: boolean;

  date_debut: string;
  date_fin_prevue?: string;
  date_fin_reelle?: string;

  responsable_uuid?: string;
  responsable_nom?: string;

  notes?: string;
  metadata?: Record<string, any>;
}

/**
 * Test de compatibilité de type
 */
export interface TestCompatibiliteType {
  boutique_uuid: string;
  nouveau_type_uuid: string;

  compatibilite: {
    fonctionnalites: Array<{
      fonctionnalite: string;
      compatible: boolean;
      details?: string;
    }>;

    donnees: Array<{
      type_donnee: string;
      migrable: boolean;
      details?: string;
    }>;

    parametres: Array<{
      parametre: string;
      compatible: boolean;
      details?: string;
    }>;
  };

  recommendations: Array<{
    action: "ajouter" | "modifier" | "supprimer" | "migrer";
    element: string;
    priorite: "basse" | "moyenne" | "haute";
    details: string;
  }>;

  estimation: {
    duree_migration: number; // En heures
    cout_estime?: number;
    risques: string[];
  };

  resultat: {
    compatible: boolean;
    score: number; // 0-100
    message?: string;
  };
}

/**
 * Template de configuration pour un type
 */
export interface TemplateConfigurationType {
  uuid: string;
  type_boutique_uuid: string;
  nom: string;
  description?: string;

  configuration: {
    theme?: string;
    couleurs?: {
      primaire: string;
      secondaire: string;
      texte: string;
      fond: string;
    };
    typographie?: {
      police_titre: string;
      police_texte: string;
      taille_titre: string;
      taille_texte: string;
    };
    mise_en_page?: {
      layout: string;
      sidebar: boolean;
      footer: boolean;
    };
  };

  fonctionnalites_actives: string[];
  fonctionnalites_desactivees: string[];

  images?: {
    logo?: string;
    banniere?: string;
    favicon?: string;
  };

  contenu_par_defaut?: {
    description_boutique?: string;
    page_apropos?: string;
    conditions_vente?: string;
    politique_livraison?: string;
  };

  actif: boolean;
  populaire: boolean;

  date_creation: string;
  date_modification?: string;
}

/**
 * Historique des modifications d'un type
 */
export interface HistoriqueTypeBoutique {
  uuid: string;
  type_boutique_uuid: string;

  action:
    | "creation"
    | "modification"
    | "activation"
    | "desactivation"
    | "archivage"
    | "restauration";
  anciennes_valeurs?: Partial<TypeBoutiqueType>;
  nouvelles_valeurs?: Partial<TypeBoutiqueType>;

  utilisateur_uuid?: string;
  utilisateur_nom?: string;

  ip_address?: string;
  user_agent?: string;

  date_action: string;
  notes?: string;
}

/**
 * Bundle de types de boutique (pack)
 */
export interface BundleTypesBoutique {
  uuid: string;
  nom: string;
  description?: string;

  types_inclus: string[]; // UUIDs des types inclus
  prix_bundle?: number;
  reduction?: number; // % de réduction par rapport au prix individuel

  avantages: string[];
  public_cible: string[];

  statut: "actif" | "inactif" | "promotion";
  date_debut?: string;
  date_fin?: string;

  metadata?: Record<string, any>;
  date_creation: string;
  date_modification?: string;
}

/**
 * Pré-requis pour un type de boutique
 */
export interface PrerequisTypeBoutique {
  type_boutique_uuid: string;

  prerequis_techniques: Array<{
    element: string;
    description: string;
    obligatoire: boolean;
  }>;

  prerequis_commerciaux: Array<{
    element: string;
    description: string;
    obligatoire: boolean;
  }>;

  prerequis_legaux: Array<{
    element: string;
    description: string;
    obligatoire: boolean;
  }>;

  competences_requises: Array<{
    competence: string;
    niveau: "debutant" | "intermediaire" | "avance";
    description: string;
  }>;

  investissement_initial: {
    minimum: number;
    recommandé: number;
    details?: string;
  };

  delai_mise_en_place: {
    minimum: number; // En jours
    moyen: number;
    details?: string;
  };
}

/**
 * Comparaison de types de boutique
 */
export interface ComparaisonTypesBoutique {
  types: string[]; // UUIDs des types à comparer

  criteres: Array<{
    nom: string;
    description?: string;
    unite?: string;
  }>;

  scores: Array<{
    type_uuid: string;
    scores: Record<string, number | boolean | string>;
  }>;

  recommandation?: {
    type_recommande: string;
    raisons: string[];
    score_total: number;
  };

  date_comparaison: string;
}

/**
 * Guide de mise en place pour un type
 */
export interface GuideMiseEnPlaceType {
  uuid: string;
  type_boutique_uuid: string;
  titre: string;

  etapes: Array<{
    ordre: number;
    titre: string;
    description: string;
    duree_estimee?: number; // En heures
    ressources_necessaires?: string[];
    checkpoints: string[];
  }>;

  ressources: Array<{
    type: "document" | "video" | "lien" | "template";
    titre: string;
    description?: string;
    url?: string;
    fichier?: string;
  }>;

  astuces: string[];
  erreurs_courantes: Array<{
    erreur: string;
    solution: string;
  }>;

  version: string;
  statut: "brouillon" | "publie" | "archive";

  date_creation: string;
  date_publication?: string;
  date_modification?: string;
}
