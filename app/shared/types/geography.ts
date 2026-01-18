// types/geography.ts

import { BaseEntity, StatusType } from "./base.entity";

// =============================================
// TYPES PAYS
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
  indicatif?: string;
  
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
  
  // Économie
  pib?: number;
  pib_par_habitant?: number;
  croissance_pib?: number;
  inflation?: number;
  chomage?: number;
  
  // Démographie
  esperance_vie?: number;
  taux_natalite?: number;
  taux_mortalite?: number;
  taux_migration?: number;
  
  // Indices
  indice_developpement_humain?: number;
  indice_gini?: number;
  indice_bonheur?: number;
  
  // Statut
  statut: StatusType;
  est_soumis_tva?: boolean;
  taux_tva_standard?: number;
  
  // Classifications
  organisation_mondiale_commerce?: boolean;
  union_europeenne?: boolean;
  zone_schengen?: boolean;
  zone_euro?: boolean;
  commonwealth?: boolean;
  francophonie?: boolean;
  
  // Codes standards
  code_iso2?: string;
  code_iso3?: string;
  code_iso_numerique?: string;
  code_fips?: string;
  code_ioc?: string;
  code_cctld?: string;
  
  // Localisation
  latitude?: number;
  longitude?: number;
  
  // Relations
  villes?: Ville[];
  regions?: Region[];
  departements?: Departement[];
}

// =============================================
// TYPES POUR LES FORMULAIRES PAYS
// =============================================

/**
 * Type pour le formulaire de pays
 */
export interface PaysFormData {
  nom: string;
  code: string;
  nom_complet?: string;
  nom_local?: string;
  description?: string;
  code_drapeau?: string;
  emoji_drapeau?: string;
  devise?: string;
  monnaie_code?: string;
  monnaie_symbole?: string;
  continent?: string;
  sous_continent?: string;
  region?: string;
  sous_region?: string;
  capitale?: string;
  superficie?: number;
  population?: number;
  langues_officielles?: string[];
  indicatif_telephonique?: string;
  tld?: string;
  fuseau_horaire?: string;
  statut?: StatusType;
  est_soumis_tva?: boolean;
  taux_tva_standard?: number;
  latitude?: number;
  longitude?: number;
  code_iso2?: string;
  code_iso3?: string;
}

/**
 * Type pour la création de pays
 */
export interface CreatePaysData {
  nom: string;
  code: string;
  nom_complet?: string;
  code_drapeau?: string;
  continent?: string;
  capitale?: string;
  statut?: StatusType;
  description?: string;
}

/**
 * Type pour la mise à jour de pays
 */
export interface UpdatePaysData {
  nom?: string;
  code?: string;
  nom_complet?: string;
  nom_local?: string;
  description?: string;
  code_drapeau?: string;
  emoji_drapeau?: string;
  devise?: string;
  monnaie_code?: string;
  monnaie_symbole?: string;
  continent?: string;
  sous_continent?: string;
  region?: string;
  sous_region?: string;
  capitale?: string;
  superficie?: number;
  population?: number;
  densite?: number;
  langues_officielles?: string[];
  indicatif_telephonique?: string;
  tld?: string;
  fuseau_horaire?: string;
  utc_offset?: string;
  statut?: StatusType;
  est_soumis_tva?: boolean;
  taux_tva_standard?: number;
  latitude?: number;
  longitude?: number;
  code_iso2?: string;
  code_iso3?: string;
}

// =============================================
// TYPES POUR LES FILTRES PAYS
// =============================================

/**
 * Type pour les filtres pays
 */
export interface PaysFilterType {
  search?: string;
  continent?: string;
  region?: string;
  sous_region?: string;
  statut?: StatusType | 'tous';
  avec_villes?: boolean;
  avec_regions?: boolean;
  orderBy?: keyof Pays | 'nombre_villes';
  orderDirection?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  population_min?: number;
  population_max?: number;
}

// =============================================
// TYPES POUR LES STATISTIQUES PAYS
// =============================================

/**
 * Type pour les statistiques pays
 */
export interface PaysStatsType {
  total: number;
  par_continent: Record<string, number>;
  par_statut: {
    actif: number;
    inactif: number;
    archive: number;
  };
  avec_capitale: number;
  avec_coordonnees: number;
  densite_moyenne: number;
  superficie_totale: number;
  population_totale: number;
  pays_plus_peuples: Array<{
    nom: string;
    population: number;
  }>;
}

// =============================================
// TYPES POUR LES OPTIONS DE SÉLECTION PAYS
// =============================================

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
  capitale?: string;
  disabled?: boolean;
}

// =============================================
// TYPES POUR L'EXPORT PAYS
// =============================================

/**
 * Type pour l'export pays
 */
export interface PaysExportData {
  uuid: string;
  nom: string;
  code: string;
  nom_complet: string;
  continent: string;
  region: string;
  sous_region: string;
  capitale: string;
  superficie: number;
  population: number;
  densite: number;
  indicatif_telephonique: string;
  tld: string;
  devise: string;
  monnaie_code: string;
  statut: string;
  nombre_villes: number;
  created_at: string;
  updated_at: string;
}

// =============================================
// TYPES VILLES
// =============================================

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
  statut: StatusType;
  est_capitale?: boolean;
  est_capitale_region?: boolean;
  est_capitale_departement?: boolean;
  
  // Démographie
  annee_recensement?: number;
  evolution_population?: number;
  taux_natalite?: number;
  taux_mortalite?: number;
  esperance_vie?: number;
  
  // Économie
  nombre_entreprises?: number;
  taux_chomage?: number;
  revenu_median?: number;
  principales_activites?: string[];
  
  // Infrastructure
  nombre_ecoles?: number;
  nombre_hopitaux?: number;
  nombre_transports?: number;
  reseau_transport?: TransportNetwork;
  
  // Relations étendues
  pays?: Pays;
  departement?: Departement;
  region?: Region;
  quartiers?: Quartier[];
}

/**
 * Type pour le réseau de transport
 */
export interface TransportNetwork {
  bus?: boolean;
  metro?: boolean;
  tram?: boolean;
  train?: boolean;
  aeroport?: boolean;
  port?: boolean;
  taxi?: boolean;
  velo_partage?: boolean;
}

// =============================================
// TYPES POUR LES FORMULAIRES VILLE
// =============================================

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
  statut?: StatusType;
  est_capitale?: boolean;
  est_capitale_region?: boolean;
  est_capitale_departement?: boolean;
  annee_recensement?: number;
  principales_activites?: string[];
  sites_touristiques?: string[];
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
  statut?: StatusType;
  departement_uuid?: string;
  region_uuid?: string;
  code_insee?: string;
}

/**
 * Type pour la mise à jour de ville
 */
export interface UpdateVilleData {
  nom?: string;
  code_postal?: string;
  pays_uuid?: string;
  departement_uuid?: string;
  region_uuid?: string;
  code_insee?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  superficie?: number;
  population?: number;
  densite?: number;
  statut?: StatusType;
  est_capitale?: boolean;
  est_capitale_region?: boolean;
  est_capitale_departement?: boolean;
  annee_recensement?: number;
  evolution_population?: number;
  taux_natalite?: number;
  taux_mortalite?: number;
  nombre_entreprises?: number;
  taux_chomage?: number;
  revenu_median?: number;
  principales_activites?: string[];
  nombre_ecoles?: number;
  nombre_hopitaux?: number;
  sites_touristiques?: string[];
  espaces_verts?: number;
  qualite_air?: number;
  codes_postaux?: string[];
  zone_horaire?: string;
}

// =============================================
// TYPES POUR LES FILTRES VILLE
// =============================================

/**
 * Type pour les filtres ville
 */
export interface VilleFilterType {
  search?: string;
  pays_uuid?: string;
  departement_uuid?: string;
  region_uuid?: string;
  statut?: StatusType | 'tous';
  est_capitale?: boolean;
  avec_code_postal?: boolean;
  avec_coordonnees?: boolean;
  population_min?: number;
  population_max?: number;
  latitude_min?: number;
  latitude_max?: number;
  longitude_min?: number;
  longitude_max?: number;
  orderBy?: keyof Ville | 'pays.nom' | 'departement.nom' | 'population';
  orderDirection?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// =============================================
// TYPES POUR LES STATISTIQUES VILLE
// =============================================

/**
 * Type pour les statistiques villes
 */
export interface VilleStatsType {
  total: number;
  par_pays: Record<string, number>;
  par_statut: {
    actif: number;
    inactif: number;
    archive: number;
  };
  avec_coordonnees: number;
  capitales: number;
  population_totale: number;
  densite_moyenne: number;
  villes_plus_peuplees: Ville[];
}

// =============================================
// TYPES POUR LES OPTIONS DE SÉLECTION VILLE
// =============================================

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
  latitude?: number;
  longitude?: number;
  disabled?: boolean;
}

// =============================================
// TYPES POUR L'EXPORT VILLE
// =============================================

/**
 * Type pour l'export ville
 */
export interface VilleExportData {
  uuid: string;
  nom: string;
  code_postal: string;
  code_insee: string;
  pays_nom: string;
  pays_code: string;
  region_nom: string;
  departement_nom: string;
  latitude: number;
  longitude: number;
  altitude: number;
  superficie: number;
  population: number;
  densite: number;
  statut: string;
  est_capitale: boolean;
  annee_recensement: number;
  created_at: string;
  updated_at: string;
}

// =============================================
// TYPES POUR LA RECHERCHE DE VILLE
// =============================================

/**
 * Type pour la recherche de ville
 */
export interface VilleSearchResult {
  uuid: string;
  nom: string;
  code_postal: string;
  pays: {
    uuid: string;
    nom: string;
    code: string;
  };
  departement?: {
    uuid: string;
    nom: string;
    code: string;
  };
  region?: {
    uuid: string;
    nom: string;
    code: string;
  };
  latitude?: number;
  longitude?: number;
  population?: number;
  distance?: number; // Pour les recherches géolocalisées
}

// =============================================
// TYPES RÉGIONS
// =============================================

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
  statut: StatusType;
  
  // Relations
  pays?: Pays;
  villes?: Ville[];
  departements?: Departement[];
}

// =============================================
// TYPES DÉPARTEMENTS
// =============================================

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
  statut: StatusType;
  
  // Relations
  region?: Region;
  pays?: Pays;
  villes?: Ville[];
}

// =============================================
// TYPES QUARTIERS
// =============================================

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
  statut: StatusType;
}

// =============================================
// TYPES ADRESSES
// =============================================

/**
 * Type pour les adresses
 */
export interface Adresse extends BaseEntity {
  rue: string;
  numero?: string;
  complement?: string;
  code_postal: string;
  ville_uuid: string;
  pays_uuid: string;
  latitude?: number;
  longitude?: number;
  type?: "residence" | "bureau" | "commercial" | "autre";
  statut: StatusType;
}