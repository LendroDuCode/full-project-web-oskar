// services/villes/villes.types.ts

/**
 * Statut d'une ville
 */
export type StatutVille =
  | "active" // Ville active
  | "inactive" // Ville inactive
  | "en_attente" // En attente de validation
  | "archive" // Archivée
  | "capitale" // Capitale (statut spécial)
  | "metropole"; // Métropole (statut spécial)

/**
 * Type de ville
 */
export type TypeVille =
  | "commune" // Commune standard
  | "arrondissement" // Arrondissement
  | "canton" // Canton
  | "departement_chef_lieu" // Chef-lieu de département
  | "region_chef_lieu" // Chef-lieu de région
  | "metropole" // Métropole
  | "intercommunalite" // Intercommunalité
  | "zone_urbaine" // Zone urbaine
  | "zone_rurale" // Zone rurale
  | "ville_nouvelle" // Ville nouvelle
  | "station_balneaire" // Station balnéaire
  | "ville_frontaliere" // Ville frontalière
  | "ville_portuaire" // Ville portuaire
  | "ville_universitaire" // Ville universitaire
  | "ville_industrielle" // Ville industrielle
  | "ville_touristique" // Ville touristique
  | "autre"; // Autre type

/**
 * Climat de la ville
 */
export type ClimatVille =
  | "oceanique" // Climat océanique
  | "continental" // Climat continental
  | "mediterraneen" // Climat méditerranéen
  | "montagnard" // Climat montagnard
  | "tropical" // Climat tropical
  | "desertique" // Climat désertique
  | "polaire" // Climat polaire
  | "autre"; // Autre climat

/**
 * Interface principale pour une ville
 */
export interface Ville {
  // Identifiants
  uuid: string;
  nom: string;
  nom_complet?: string;
  nom_alternatifs?: string[]; // Noms alternatifs, anciens noms

  // Références
  code_insee?: string; // Code INSEE (France)
  code_postal?: string;
  code_commune?: string;
  pays_uuid: string;
  pays_nom?: string;
  pays_code?: string;

  // Hiérarchie administrative
  region_uuid?: string;
  region_nom?: string;
  region_code?: string;
  departement_uuid?: string;
  departement_nom?: string;
  departement_code?: string;
  arrondissement?: string;
  canton?: string;
  intercommunalite?: string;

  // Informations géographiques
  type: TypeVille;
  statut: StatutVille;
  capitale: boolean; // Si c'est une capitale
  chef_lieu: boolean; // Si chef-lieu de département/région

  // Démographie
  population?: number;
  population_municipale?: number;
  population_metropolitaine?: number;
  densite?: number; // Habitants/km²
  superficie?: number; // km²
  altitude?: number; // mètres
  altitude_min?: number;
  altitude_max?: number;
  annee_recensement?: string;

  // Coordonnées géographiques
  coordonnees: {
    latitude: number;
    longitude: number;
    precision?: number; // Précision en mètres
  };

  // Climat et géographie
  climat?: ClimatVille;
  temperature_moyenne_annuelle?: number; // °C
  precipitation_moyenne_annuelle?: number; // mm
  fuseau_horaire?: string;
  indicatif_telephonique?: string;

  // Économie et infrastructure
  pib_communal?: number;
  taux_chomage?: number;
  principales_activites?: string[];
  entreprises_count?: number;
  etablissements_scolaires?: {
    maternelles?: number;
    primaires?: number;
    colleges?: number;
    lycees?: number;
    universites?: number;
  };
  hopitaux_count?: number;
  commerces_count?: number;

  // Transport
  transports: {
    aeroport?: boolean;
    gare?: boolean;
    gare_tgv?: boolean;
    port?: boolean;
    metro?: boolean;
    tramway?: boolean;
    bus?: boolean;
    autoroute_proximite?: boolean;
  };

  // Tourisme
  tourisme?: {
    sites_classifies?: number;
    monuments_historiques?: number;
    musees?: number;
    hotels_count?: number;
    restaurants_count?: number;
    attractions_touristiques?: string[];
  };

  // Culture et patrimoine
  culture?: {
    langue_regionale?: string;
    festivals?: string[];
    specialites_culinaires?: string[];
    personnalites_celebres?: string[];
  };

  // Informations administratives
  mairie?: {
    adresse?: string;
    telephone?: string;
    email?: string;
    site_web?: string;
    maire?: string;
  };

  // Médias
  medias?: {
    journaux_locaux?: string[];
    radios_locales?: string[];
    televisions_locales?: string[];
  };

  // Sports
  sports?: {
    clubs_professionnels?: Array<{
      sport: string;
      club: string;
      division?: string;
    }>;
    infrastructures?: string[];
  };

  // Statut et visibilité
  actif: boolean;
  ordre_affichage: number;
  date_creation: string;
  date_modification?: string;
  createur_uuid?: string;

  // Métadonnées
  metadata?: Record<string, any>;
  custom_data?: Record<string, any>;
  tags?: string[];

  // Relations
  villes_voisines?: Array<{
    ville_uuid: string;
    ville_nom: string;
    distance_km: number;
  }>;

  // Images
  images?: {
    blason_url?: string;
    logo_url?: string;
    panorama_url?: string;
    photos?: string[];
  };

  // Historique
  historique?: {
    date_fondation?: string;
    evenements_importants?: Array<{
      date: string;
      evenement: string;
    }>;
  };

  // Statistiques internes
  statistiques_platforme?: {
    utilisateurs_count?: number;
    vendeurs_count?: number;
    boutiques_count?: number;
    annonces_count?: number;
    produits_count?: number;
  };
}

/**
 * Données requises pour créer une ville
 */
export interface VilleCreateData {
  nom: string;
  pays_uuid: string;
  coordonnees: {
    latitude: number;
    longitude: number;
  };

  // Informations optionnelles
  nom_complet?: string;
  code_insee?: string;
  code_postal?: string;

  region_uuid?: string;
  departement_uuid?: string;

  type?: TypeVille;
  statut?: StatutVille;
  capitale?: boolean;
  chef_lieu?: boolean;

  population?: number;
  superficie?: number;
  altitude?: number;

  climat?: ClimatVille;
  fuseau_horaire?: string;
  indicatif_telephonique?: string;

  actif?: boolean;
  ordre_affichage?: number;

  metadata?: Record<string, any>;
  tags?: string[];
}

/**
 * Données pour mettre à jour une ville
 */
export interface VilleUpdateData {
  nom?: string;
  nom_complet?: string;
  nom_alternatifs?: string[];

  code_insee?: string;
  code_postal?: string;
  code_commune?: string;

  region_uuid?: string;
  region_nom?: string;
  departement_uuid?: string;
  departement_nom?: string;
  arrondissement?: string;
  canton?: string;

  type?: TypeVille;
  statut?: StatutVille;
  capitale?: boolean;
  chef_lieu?: boolean;

  population?: number;
  population_municipale?: number;
  densite?: number;
  superficie?: number;
  altitude?: number;
  altitude_min?: number;
  altitude_max?: number;

  coordonnees?: {
    latitude?: number;
    longitude?: number;
    precision?: number;
  };

  climat?: ClimatVille;
  temperature_moyenne_annuelle?: number;
  precipitation_moyenne_annuelle?: number;
  fuseau_horaire?: string;
  indicatif_telephonique?: string;

  // Économie
  pib_communal?: number;
  taux_chomage?: number;
  principales_activites?: string[];

  // Transport
  transports?: {
    aeroport?: boolean;
    gare?: boolean;
    gare_tgv?: boolean;
    port?: boolean;
    metro?: boolean;
    tramway?: boolean;
    bus?: boolean;
    autoroute_proximite?: boolean;
  };

  // Tourisme
  tourisme?: {
    sites_classifies?: number;
    monuments_historiques?: number;
    musees?: number;
    hotels_count?: number;
    restaurants_count?: number;
    attractions_touristiques?: string[];
  };

  // Culture
  culture?: {
    langue_regionale?: string;
    festivals?: string[];
    specialites_culinaires?: string[];
    personnalites_celebres?: string[];
  };

  // Mairie
  mairie?: {
    adresse?: string;
    telephone?: string;
    email?: string;
    site_web?: string;
    maire?: string;
  };

  actif?: boolean;
  ordre_affichage?: number;

  metadata?: Record<string, any>;
  custom_data?: Record<string, any>;
  tags?: string[];
}

/**
 * Paramètres de filtrage pour les villes
 */
export interface VilleFilterParams {
  nom?: string;
  pays_uuid?: string;
  region_uuid?: string;
  departement_uuid?: string;

  type?: TypeVille;
  statut?: StatutVille;
  actif?: boolean;
  capitale?: boolean;
  chef_lieu?: boolean;

  // Filtres démographiques
  population_min?: number;
  population_max?: number;
  superficie_min?: number;
  superficie_max?: number;

  // Filtres géographiques
  latitude_min?: number;
  latitude_max?: number;
  longitude_min?: number;
  longitude_max?: number;
  rayon_km?: number; // Recherche par rayon
  centre_latitude?: number;
  centre_longitude?: number;

  // Filtres climatiques
  climat?: ClimatVille;

  // Filtres infrastructure
  aeroport?: boolean;
  gare_tgv?: boolean;
  port?: boolean;
  metro?: boolean;
  universite?: boolean;

  code_insee?: string;
  code_postal?: string;

  // Recherche textuelle
  search?: string;

  // Tri
  sort_by?:
    | "nom"
    | "population"
    | "superficie"
    | "ordre_affichage"
    | "date_creation";
  sort_order?: "asc" | "desc";
}

/**
 * Statistiques sur les villes
 */
export interface VilleStats {
  // Vue d'ensemble
  total_villes: number;
  villes_actives: number;
  villes_inactives: number;
  villes_capitales: number;

  // Répartition par type
  repartition_type: Array<{
    type: TypeVille;
    count: number;
    pourcentage: number;
  }>;

  // Répartition par climat
  repartition_climat: Array<{
    climat: ClimatVille;
    count: number;
    pourcentage: number;
  }>;

  // Démographie
  demographie: {
    population_totale: number;
    population_moyenne: number;
    densite_moyenne: number;
    plus_grande_ville?: Ville;
    plus_petite_ville?: Ville;
  };

  // Géographie
  geographie: {
    superficie_totale: number;
    altitude_moyenne: number;
    altitude_maximale?: Ville;
    altitude_minimale?: Ville;
  };

  // Infrastructure
  infrastructure: {
    villes_aeroport: number;
    villes_gare_tgv: number;
    villes_port: number;
    villes_metro: number;
    villes_universite: number;
  };

  // Top villes
  top_villes_population: Array<{
    ville: Ville;
    population: number;
  }>;

  top_villes_superficie: Array<{
    ville: Ville;
    superficie: number;
  }>;

  // Activité plateforme
  activite_plateforme: {
    villes_plus_actives: Array<{
      ville: Ville;
      utilisateurs_count: number;
      vendeurs_count: number;
      annonces_count: number;
    }>;
    taux_occupation_moyen: number; // % de villes avec activité
  };
}

/**
 * Région administrative
 */
export interface Region {
  uuid: string;
  nom: string;
  nom_complet?: string;
  code: string; // Code région (ex: "84" pour Auvergne-Rhône-Alpes)

  pays_uuid: string;
  pays_nom?: string;

  chef_lieu_uuid?: string;
  chef_lieu_nom?: string;

  population?: number;
  superficie?: number;
  densite?: number;

  nombre_departements: number;
  nombre_communes: number;

  description?: string;
  blason_url?: string;
  logo_url?: string;

  actif: boolean;
  date_creation: string;
  date_modification?: string;
}

/**
 * Département administratif
 */
export interface Departement {
  uuid: string;
  nom: string;
  nom_complet?: string;
  code: string; // Code département (ex: "75" pour Paris)
  code_region: string;

  region_uuid: string;
  region_nom?: string;

  chef_lieu_uuid?: string;
  chef_lieu_nom?: string;

  population?: number;
  superficie?: number;
  densite?: number;

  nombre_arrondissements?: number;
  nombre_cantons?: number;
  nombre_communes: number;

  prefecture?: string;
  sous_prefectures?: string[];

  description?: string;
  blason_url?: string;

  actif: boolean;
  date_creation: string;
  date_modification?: string;
}

/**
 * Recherche de villes
 */
export interface RechercheVilleResultat {
  villes: Ville[];
  total: number;
  page: number;
  pages: number;
  suggestions?: string[];
  facets?: {
    regions?: Array<{
      uuid: string;
      nom: string;
      count: number;
    }>;
    departements?: Array<{
      uuid: string;
      nom: string;
      count: number;
    }>;
    types?: Array<{
      type: TypeVille;
      count: number;
    }>;
  };
}

/**
 * Distance entre deux villes
 */
export interface DistanceVilles {
  ville_depart: Ville;
  ville_arrivee: Ville;

  distances: {
    ligne_droite: number; // km
    route: number; // km (si disponible)
    duree_route?: number; // heures
  };

  trajet?: {
    etapes?: Array<{
      ordre: number;
      ville: string;
      distance_cumulee: number;
    }>;
    instructions?: string[];
  };
}

/**
 * Ville avec météo
 */
export interface VilleMeteo extends Ville {
  meteo?: {
    temperature_actuelle: number;
    temperature_min: number;
    temperature_max: number;
    conditions: string;
    icone: string;
    humidite: number;
    vent_vitesse: number;
    vent_direction: string;
    pression: number;
    lever_soleil: string;
    coucher_soleil: string;
    date_maj: string;
  };
}

/**
 * Zone géographique
 */
export interface ZoneGeographique {
  uuid: string;
  nom: string;
  type:
    | "aire_urbaine"
    | "metropole"
    | "intercommunalite"
    | "pays"
    | "parc_naturel"
    | "autre";

  villes: string[]; // UUIDs des villes
  superficie?: number;
  population?: number;

  description?: string;
  perimetre?: {
    type: "polygone";
    coordonnees: Array<{ latitude: number; longitude: number }>;
  };

  actif: boolean;
  date_creation: string;
  date_modification?: string;
}

/**
 * Quartier d'une ville
 */
export interface Quartier {
  uuid: string;
  ville_uuid: string;
  nom: string;

  type?:
    | "centre_ville"
    | "historique"
    | "commercial"
    | "residentiel"
    | "industriel"
    | "universitaire"
    | "affaires";

  population?: number;
  superficie?: number;
  densite?: number;

  limites?: {
    type: "polygone";
    coordonnees: Array<{ latitude: number; longitude: number }>;
  };

  caracteristiques?: {
    monuments?: string[];
    parcs?: string[];
    ecoles?: string[];
    commerces?: string[];
  };

  description?: string;
  images?: string[];

  actif: boolean;
  date_creation: string;
  date_modification?: string;
}

/**
 * Code postal
 */
export interface CodePostal {
  code: string;
  ville_uuid: string;
  ville_nom: string;

  quartiers?: string[];
  bureau_distributeur?: string;

  nombre_adresses?: number;
  nombre_habitants?: number;

  actif: boolean;
  date_creation: string;
  date_modification?: string;
}

/**
 * Export des villes
 */
export interface ExportVillesOptions {
  format: "csv" | "json" | "excel" | "pdf" | "geojson";
  include_relations?: boolean; // Inclure régions/départements
  include_statistiques?: boolean;
  filters?: VilleFilterParams;
  fields?: string[];
}

/**
 * Import des villes
 */
export interface ImportVillesData {
  format: "csv" | "json" | "xml";
  data: any;
  options?: {
    update_existing?: boolean;
    skip_errors?: boolean;
    validate_only?: boolean;
    create_missing_pays?: boolean;
  };
}

/**
 * Ville pour autocomplétion
 */
export interface VilleAutocomplete {
  uuid: string;
  nom: string;
  nom_complet?: string;
  code_postal?: string;
  pays_nom: string;
  region_nom?: string;
  departement_nom?: string;
  population?: number;
}

/**
 * Carte des villes
 */
export interface VilleCarte {
  uuid: string;
  nom: string;
  coordonnees: {
    latitude: number;
    longitude: number;
  };
  population?: number;
  couleur?: string; // Pour les cartes choroplèthes
  valeur?: number; // Pour les cartes thématiques
  proprietes?: Record<string, any>;
}

/**
 * Comparaison de villes
 */
export interface ComparaisonVilles {
  villes: Ville[];
  criteres: Array<{
    nom: string;
    unite?: string;
  }>;
  valeurs: Array<{
    ville_uuid: string;
    valeurs: Record<string, number | string | boolean>;
  }>;
  date_comparaison: string;
}
