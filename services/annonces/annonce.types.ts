// services/annonces/annonce.types.ts
export interface Annonce {
  // Informations de base
  uuid: string;
  titre: string;
  slug: string;
  description: string;
  description_courte: string;
  prix: number;
  devise: string;
  type_annonce: "vente" | "location" | "echange" | "don";
  statut: "brouillon" | "en_attente" | "publie" | "bloque" | "archive";

  // Localisation
  adresse: string;
  complement_adresse?: string;
  code_postal: string;
  ville: string;
  pays: string;
  latitude?: number;
  longitude?: number;

  // Catégorisation
  categorie_uuid: string;
  type_bien_uuid: string;
  type_transaction_uuid?: string;

  // Caractéristiques
  surface: number;
  unite_surface: string;
  nombre_pieces: number;
  nombre_chambres: number;
  nombre_salles_bain: number;
  etage?: number;
  nombre_etages?: number;
  annee_construction?: number;
  etat_bien?: "neuf" | "bon_etat" | "a_renover";

  // Équipements et commodités
  equipements?: string[];
  commodites?: string[];
  services_inclus?: string[];

  // Images et médias
  images: string[];
  video_url?: string;
  plan_url?: string;
  documents?: string[];

  // Informations de contact
  contact_nom: string;
  contact_telephone: string;
  contact_email: string;
  contact_visible: boolean;

  // Informations du propriétaire/vendeur
  utilisateur_uuid: string;
  vendeur_uuid?: string;
  agent_uuid?: string;

  // Métadonnées
  vues: number;
  favoris: number;
  is_featured: boolean;
  is_urgent: boolean;
  is_sponsorise: boolean;
  mots_cles?: string[];

  // Dates
  date_publication?: string;
  date_expiration?: string;
  date_derniere_modification?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  is_deleted: boolean;

  // Relations (peuvent être présentes dans la réponse)
  categorie?: {
    uuid: string;
    nom: string;
    slug: string;
    description?: string;
  };

  type_bien?: {
    uuid: string;
    nom: string;
    slug: string;
    description?: string;
  };

  type_transaction?: {
    uuid: string;
    nom: string;
    slug: string;
    description?: string;
  };

  utilisateur?: {
    uuid: string;
    nom: string;
    prenoms: string;
    email: string;
    telephone: string;
    avatar?: string;
  };

  vendeur?: {
    uuid: string;
    nom: string;
    prenoms: string;
    nom_boutique?: string;
    logo_boutique?: string;
  };

  agent?: {
    uuid: string;
    nom: string;
    prenoms: string;
    email: string;
    telephone: string;
  };

  caracteristiques?: Array<{
    uuid: string;
    nom: string;
    valeur: string;
    unite?: string;
    type: string;
  }>;
}

export interface AnnonceCreateData {
  titre: string;
  description: string;
  description_courte: string;
  prix: number;
  devise: string;
  type_annonce: "vente" | "location" | "echange" | "don";

  // Localisation
  adresse: string;
  complement_adresse?: string;
  code_postal: string;
  ville: string;
  pays: string;
  latitude?: number;
  longitude?: number;

  // Catégorisation
  categorie_uuid: string;
  type_bien_uuid: string;
  type_transaction_uuid?: string;

  // Caractéristiques
  surface: number;
  unite_surface: string;
  nombre_pieces: number;
  nombre_chambres: number;
  nombre_salles_bain: number;
  etage?: number;
  nombre_etages?: number;
  annee_construction?: number;
  etat_bien?: "neuf" | "bon_etat" | "a_renover";

  // Équipements
  equipements?: string[];
  commodites?: string[];
  services_inclus?: string[];

  // Images
  images: string[];
  video_url?: string;
  plan_url?: string;
  documents?: string[];

  // Contact
  contact_nom: string;
  contact_telephone: string;
  contact_email: string;
  contact_visible: boolean;

  // Mots-clés
  mots_cles?: string[];

  // Options
  is_urgent?: boolean;
  is_featured?: boolean;
  is_sponsorise?: boolean;
  date_expiration?: string;
}

export interface AnnonceUpdateData {
  titre?: string;
  description?: string;
  description_courte?: string;
  prix?: number;
  devise?: string;
  type_annonce?: "vente" | "location" | "echange" | "don";

  // Localisation
  adresse?: string;
  complement_adresse?: string;
  code_postal?: string;
  ville?: string;
  pays?: string;
  latitude?: number;
  longitude?: number;

  // Catégorisation
  categorie_uuid?: string;
  type_bien_uuid?: string;
  type_transaction_uuid?: string;

  // Caractéristiques
  surface?: number;
  unite_surface?: string;
  nombre_pieces?: number;
  nombre_chambres?: number;
  nombre_salles_bain?: number;
  etage?: number;
  nombre_etages?: number;
  annee_construction?: number;
  etat_bien?: "neuf" | "bon_etat" | "a_renover";

  // Équipements
  equipements?: string[];
  commodites?: string[];
  services_inclus?: string[];

  // Images
  images?: string[];
  video_url?: string;
  plan_url?: string;
  documents?: string[];

  // Contact
  contact_nom?: string;
  contact_telephone?: string;
  contact_email?: string;
  contact_visible?: boolean;

  // Mots-clés
  mots_cles?: string[];

  // Options
  is_urgent?: boolean;
  is_featured?: boolean;
  is_sponsorise?: boolean;
  date_expiration?: string;
  statut?: "brouillon" | "en_attente" | "publie" | "bloque" | "archive";
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";

  // Filtres
  type_annonce?: "vente" | "location" | "echange" | "don";
  statut?: "brouillon" | "en_attente" | "publie" | "bloque" | "archive";
  categorie_uuid?: string;
  type_bien_uuid?: string;
  type_transaction_uuid?: string;

  // Filtres géographiques
  ville?: string;
  pays?: string;

  // Filtres prix
  prix_min?: number;
  prix_max?: number;

  // Filtres surface
  surface_min?: number;
  surface_max?: number;

  // Filtres caractéristiques
  nombre_pieces_min?: number;
  nombre_pieces_max?: number;
  nombre_chambres_min?: number;
  nombre_chambres_max?: number;

  // Filtres spéciaux
  is_featured?: boolean;
  is_urgent?: boolean;
  is_sponsorise?: boolean;

  // Filtres utilisateur
  utilisateur_uuid?: string;
  vendeur_uuid?: string;
  agent_uuid?: string;
}

export interface AnnoncesResponse {
  data: Annonce[];
  count: number;
  total: number;
  page: number;
  pages: number;
  status: string;
  message?: string;
}

export interface AnnonceStats {
  total_annonces: number;
  annonces_publiees: number;
  annonces_en_attente: number;
  annonces_brouillons: number;
  annonces_bloquees: number;
  annonces_archivees: number;

  par_type_annonce: {
    vente: number;
    location: number;
    echange: number;
    don: number;
  };

  par_categorie: Record<string, number>;
  par_ville: Record<string, number>;
  par_statut: Record<string, number>;

  vues_total: number;
  favoris_total: number;
  annonces_urgentes: number;
  annonces_featured: number;
  annonces_sponsorisees: number;
}

export interface AnnonceFilters {
  type_annonce?: string[];
  categorie?: string[];
  type_bien?: string[];
  type_transaction?: string[];
  ville?: string[];
  pays?: string[];
  prix_min?: number;
  prix_max?: number;
  surface_min?: number;
  surface_max?: number;
  nombre_pieces?: number[];
  nombre_chambres?: number[];
  equipements?: string[];
  etat_bien?: string[];
  is_urgent?: boolean;
  is_featured?: boolean;
  is_sponsorise?: boolean;
  date_creation_start?: string;
  date_creation_end?: string;
}

export interface SearchParams {
  query: string;
  filters?: AnnonceFilters;
  pagination?: PaginationParams;
}

export interface AnnonceSearchResult {
  annonces: Annonce[];
  count: number;
  total: number;
  suggestions?: string[];
  filters_available?: AnnonceFilters;
}

export interface ImageUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
  originalname: string;
}

export interface AnnonceValidation {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface SimilarAnnonce {
  uuid: string;
  titre: string;
  prix: number;
  surface: number;
  ville: string;
  image: string;
  score: number;
}
