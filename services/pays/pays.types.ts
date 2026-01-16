// services/pays/pays.types.ts

/**
 * Interface principale pour un pays
 * Représente un pays avec toutes ses informations administratives et géographiques
 */
export interface Pays {
  // Identifiants
  uuid: string; // Identifiant unique du pays
  code: string; // Code ISO du pays (ex: "FR", "US", "CI")
  nom: string; // Nom officiel du pays
  nom_complet?: string; // Nom complet du pays

  // Informations géographiques
  continent?: string; // Continent (ex: "Afrique", "Europe", "Amérique")
  region?: string; // Région (ex: "Afrique de l'Ouest", "Union Européenne")
  capitale?: string; // Capitale administrative

  // Démographie
  population?: number; // Population estimée
  superficie?: number; // Superficie en km²
  densite?: number; // Densité de population

  // Informations administratives
  langue_officielle?: string; // Langue(s) officielle(s)
  devise?: string; // Devise nationale
  indicatif: string; // Indicatif téléphonique international
  fuseau_horaire?: string; // Fuseau horaire principal
  format_date?: string; // Format de date utilisé

  // Drapeau et symboles
  drapeau_url?: string; // URL du drapeau
  code_drapeau?: string; // Code emoji du drapeau
  hymne_national?: string; // Nom de l'hymne national

  // Statut et visibilité
  actif: boolean; // Si le pays est activé dans le système
  defaut: boolean; // Si c'est le pays par défaut
  ordre_affichage: number; // Ordre d'affichage dans les listes

  // Métadonnées
  metadata?: Record<string, any>; // Métadonnées supplémentaires
  custom_data?: Record<string, any>; // Données personnalisées

  // Informations techniques
  date_creation: string; // Date de création dans le système
  date_modification?: string; // Date de dernière modification

  // Relations
  villes_count?: number; // Nombre de villes associées
  utilisateurs_count?: number; // Nombre d'utilisateurs de ce pays

  // Codes standards
  code_iso2: string; // Code ISO 3166-1 alpha-2 (2 lettres)
  code_iso3?: string; // Code ISO 3166-1 alpha-3 (3 lettres)
  code_numero?: string; // Code ISO 3166-1 numérique

  // Informations économiques
  pib?: number; // PIB nominal
  monnaie_code?: string; // Code de la monnaie (ex: "EUR", "XOF")
  monnaie_symbole?: string; // Symbole monétaire (ex: "€", "FCFA")

  // Coordonnées géographiques
  latitude?: number; // Latitude du centre du pays
  longitude?: number; // Longitude du centre du pays
  coordonnees_bbox?: {
    // Bounding box du pays
    nord: number;
    sud: number;
    est: number;
    ouest: number;
  };

  // Informations politiques
  type_gouvernement?: string; // Type de gouvernement
  chef_etat?: string; // Nom du chef d'état
  independance_date?: string; // Date d'indépendance

  // Infrastructure
  domaine_internet?: string; // Domaine internet de premier niveau (ex: ".fr", ".ci")
  code_plaque?: string; // Code des plaques d'immatriculation

  // Classifications
  hdi?: number; // Indice de développement humain
  classement_superficie?: number; // Classement par superficie
  classement_population?: number; // Classement par population

  // Informations culturelles
  religion_principale?: string; // Religion principale
  fete_nationale?: string; // Date de la fête nationale
}

/**
 * Données requises pour créer un nouveau pays
 */
export interface PaysCreateData {
  code: string; // Obligatoire - Code ISO unique
  nom: string; // Obligatoire - Nom du pays
  indicatif: string; // Obligatoire - Indicatif téléphonique

  // Informations optionnelles
  nom_complet?: string;
  continent?: string;
  region?: string;
  capitale?: string;

  population?: number;
  superficie?: number;

  langue_officielle?: string;
  devise?: string;
  fuseau_horaire?: string;
  format_date?: string;

  drapeau_url?: string;
  code_drapeau?: string;

  // Paramètres système
  actif?: boolean;
  defaut?: boolean;
  ordre_affichage?: number;

  // Codes standards
  code_iso2?: string;
  code_iso3?: string;
  code_numero?: string;

  // Autres informations
  monnaie_code?: string;
  monnaie_symbole?: string;
  latitude?: number;
  longitude?: number;

  metadata?: Record<string, any>;
  custom_data?: Record<string, any>;
}

/**
 * Données pour mettre à jour un pays existant
 */
export interface PaysUpdateData {
  nom?: string;
  nom_complet?: string;

  continent?: string;
  region?: string;
  capitale?: string;

  population?: number;
  superficie?: number;
  densite?: number;

  langue_officielle?: string;
  devise?: string;
  indicatif?: string;
  fuseau_horaire?: string;
  format_date?: string;

  drapeau_url?: string;
  code_drapeau?: string;
  hymne_national?: string;

  actif?: boolean;
  defaut?: boolean;
  ordre_affichage?: number;

  code_iso2?: string;
  code_iso3?: string;
  code_numero?: string;

  monnaie_code?: string;
  monnaie_symbole?: string;

  latitude?: number;
  longitude?: number;
  coordonnees_bbox?: {
    nord: number;
    sud: number;
    est: number;
    ouest: number;
  };

  metadata?: Record<string, any>;
  custom_data?: Record<string, any>;
}

/**
 * Paramètres de filtrage pour les requêtes de pays
 */
export interface PaysFilterParams {
  code?: string; // Filtre par code ISO
  nom?: string; // Filtre par nom (recherche partielle)

  continent?: string; // Filtre par continent
  region?: string; // Filtre par région

  actif?: boolean; // Filtre par statut actif
  defaut?: boolean; // Filtre par pays par défaut

  // Filtres géographiques
  latitude_min?: number;
  latitude_max?: number;
  longitude_min?: number;
  longitude_max?: number;

  // Filtres démographiques
  population_min?: number;
  population_max?: number;
  superficie_min?: number;
  superficie_max?: number;

  // Filtres linguistiques
  langue_officielle?: string;
  devise?: string;

  // Recherche
  search?: string; // Recherche textuelle sur nom, code, capitale

  // Tri
  sort_by?:
    | "nom"
    | "code"
    | "population"
    | "superficie"
    | "ordre_affichage"
    | "date_creation";
  sort_order?: "asc" | "desc";
}

/**
 * Paramètres de pagination pour les listes de pays
 */
export interface PaysPaginationParams {
  page?: number; // Numéro de page (commence à 1)
  limit?: number; // Nombre d'éléments par page
  search?: string; // Recherche globale
  sort_by?:
    | "nom"
    | "code"
    | "population"
    | "superficie"
    | "ordre_affichage"
    | "date_creation";
  sort_order?: "asc" | "desc";
  filters?: PaysFilterParams; // Filtres supplémentaires
}

/**
 * Statistiques sur les pays
 */
export interface PaysStats {
  total_pays: number; // Nombre total de pays

  distribution_continent: Array<{
    // Distribution par continent
    continent: string;
    count: number;
    pourcentage: number;
  }>;

  stats_actifs: {
    // Statistiques sur les pays actifs
    actifs: number;
    inactifs: number;
    pays_defaut: number;
  };

  top_population: Array<{
    // Pays les plus peuplés
    uuid: string;
    nom: string;
    population: number;
  }>;

  top_superficie: Array<{
    // Pays les plus grands
    uuid: string;
    nom: string;
    superficie: number;
  }>;

  distribution_devise: Array<{
    // Distribution par devise
    devise: string;
    count: number;
  }>;

  distribution_langue: Array<{
    // Distribution par langue officielle
    langue: string;
    count: number;
  }>;

  metrics: {
    // Métriques globales
    population_totale: number;
    superficie_totale: number;
    densite_moyenne: number;
    pays_avec_capitales: number;
  };
}

/**
 * Ville dans un pays
 */
export interface Ville {
  uuid: string;
  nom: string;
  nom_complet?: string;

  pays_uuid: string;
  pays_nom?: string;
  pays_code?: string;

  // Informations géographiques
  region?: string;
  departement?: string;
  arrondissement?: string;

  population?: number;
  superficie?: number;
  densite?: number;

  // Coordonnées
  latitude?: number;
  longitude?: number;
  altitude?: number;

  // Statut
  actif: boolean;
  capitale: boolean; // Si c'est une capitale
  ordre_affichage: number;

  // Codes
  code_postal?: string;
  code_insee?: string; // Pour les pays francophones
  code_region?: string;

  // Informations supplémentaires
  fuseau_horaire?: string;
  indicatif_local?: string; // Indicatif local si différent

  // Démographie
  annee_recensement?: string;
  taux_croissance?: number;

  // Économie
  pib_local?: number;
  principales_activites?: string[];

  // Tourisme
  sites_touristiques?: string[];
  description_touristique?: string;

  // Infrastructure
  aéroport?: boolean;
  port?: boolean;
  gare?: boolean;

  // Métadonnées
  metadata?: Record<string, any>;
  custom_data?: Record<string, any>;

  date_creation: string;
  date_modification?: string;
}

/**
 * Données pour créer une ville
 */
export interface VilleCreateData {
  pays_uuid: string; // Obligatoire
  nom: string; // Obligatoire

  nom_complet?: string;
  region?: string;
  departement?: string;
  arrondissement?: string;

  population?: number;
  superficie?: number;

  latitude?: number;
  longitude?: number;
  altitude?: number;

  actif?: boolean;
  capitale?: boolean;
  ordre_affichage?: number;

  code_postal?: string;
  code_insee?: string;
  code_region?: string;

  fuseau_horaire?: string;
  indicatif_local?: string;

  metadata?: Record<string, any>;
  custom_data?: Record<string, any>;
}

/**
 * Résultat de recherche de pays
 */
export interface PaysSearchResult {
  pays: Pays[];
  total: number;
  page: number;
  pages: number;
  suggestions?: string[]; // Suggestions de recherche
}

/**
 * Information de traduction pour un pays
 */
export interface PaysTraduction {
  pays_uuid: string;
  langue: string; // Code langue (ex: "fr", "en", "es")

  nom_traduit: string;
  nom_complet_traduit?: string;
  capitale_traduit?: string;
  description?: string;
  informations_culturelles?: string;

  date_traduction: string;
  traducteur?: string;
  statut: "valide" | "en_attente" | "archive";
}

/**
 * Données pour l'import de pays
 */
export interface PaysImportData {
  format: "csv" | "json" | "xml";
  data: any;
  options?: {
    update_existing?: boolean;
    skip_errors?: boolean;
    validate_only?: boolean;
  };
}

/**
 * Données pour l'export de pays
 */
export interface PaysExportOptions {
  format: "csv" | "json" | "excel" | "pdf";
  fields?: string[]; // Champs à inclure
  include_villes?: boolean; // Inclure les villes
  include_statistiques?: boolean; // Inclure les statistiques
  filters?: PaysFilterParams; // Filtres à appliquer
  langue?: string; // Langue pour l'export
}

/**
 * Information de région géographique
 */
export interface Region {
  uuid: string;
  nom: string;
  type: "continent" | "region" | "sous_region" | "union" | "zone";

  pays_count?: number;
  superficie_totale?: number;
  population_totale?: number;

  description?: string;
  code?: string;

  metadata?: Record<string, any>;
}

/**
 * Historique des modifications d'un pays
 */
export interface PaysHistorique {
  uuid: string;
  pays_uuid: string;
  utilisateur_uuid?: string;

  action:
    | "creation"
    | "modification"
    | "activation"
    | "desactivation"
    | "suppression"
    | "restauration";
  anciennes_valeurs?: Partial<Pays>;
  nouvelles_valeurs?: Partial<Pays>;

  description?: string;
  ip_address?: string;
  user_agent?: string;

  date_action: string;
}

/**
 * Relation entre pays (frontières, accords, etc.)
 */
export interface PaysRelation {
  pays_source_uuid: string;
  pays_cible_uuid: string;
  type_relation:
    | "frontiere"
    | "accord_commercial"
    | "union"
    | "conflit"
    | "cooperation";

  date_debut?: string;
  date_fin?: string;
  statut: "actif" | "inactif" | "suspendu";

  details?: {
    longueur_frontiere?: number; // En km
    type_frontiere?: "terre" | "mer" | "fleuve";
    accord_type?: string;
  };

  metadata?: Record<string, any>;
  date_creation: string;
  date_modification?: string;
}

/**
 * Données pour la carte géographique
 */
export interface PaysCarteData {
  uuid: string;
  nom: string;
  code: string;

  // Données géométriques
  geojson?: any; // Données GeoJSON pour la carte
  svg_path?: string; // Chemin SVG
  center: {
    latitude: number;
    longitude: number;
  };

  // Informations d'affichage
  couleur?: string;
  zone_hover?: string;
  tooltip_data?: Record<string, any>;

  // Données statistiques pour la carte
  valeur?: number; // Pour les cartes choroplèthes
  categorie?: string; // Pour les cartes catégorielles
}

/**
 * Format de réponse pour les requêtes de localisation
 */
export interface LocalisationData {
  pays: Pays;
  villes: Ville[];
  villes_principales: Ville[]; // Villes principales (capitales, grandes villes)
  statistiques: {
    nombre_villes: number;
    population_totale: number;
    superficie_totale: number;
  };
}
