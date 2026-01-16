// services/boutiques/boutique.types.ts

export interface Boutique {
  // Informations de base
  uuid: string;
  nom: string;
  slug: string;
  description: string;
  description_courte?: string;
  slogan?: string;

  // Identité visuelle
  logo: string;
  banniere?: string;
  couleurs_theme?: {
    primaire: string;
    secondaire: string;
    accent: string;
  };

  // Contact et localisation
  email: string;
  telephone: string;
  site_web?: string;
  adresse: string;
  complement_adresse?: string;
  code_postal: string;
  ville: string;
  pays: string;
  latitude?: number;
  longitude?: number;

  // Informations commerciales
  type_boutique_uuid: string;
  categories_principales: string[];
  produits_phares?: string[];

  // Statut et visibilité
  statut: "en_attente" | "actif" | "inactif" | "suspendu" | "ferme";
  est_verifie: boolean;
  est_bloque: boolean;
  est_ferme: boolean;
  raison_fermeture?: string;

  // Propriétaire/gérant
  proprietaire_uuid: string;
  proprietaire_type: "utilisateur" | "vendeur" | "agent";
  gerant_nom?: string;
  gerant_telephone?: string;
  gerant_email?: string;

  // Informations bancaires
  compte_bancaire?: {
    titulaire: string;
    iban: string;
    bic: string;
    banque: string;
  };

  // Horaires
  horaires?: Array<{
    jour:
      | "lundi"
      | "mardi"
      | "mercredi"
      | "jeudi"
      | "vendredi"
      | "samedi"
      | "dimanche";
    ouverture: string; // Format HH:mm
    fermeture: string; // Format HH:mm
    est_ouvert: boolean;
  }>;

  // Réseaux sociaux
  reseaux_sociaux?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    tiktok?: string;
    youtube?: string;
  };

  // Métriques et statistiques
  note_moyenne: number;
  nombre_avis: number;
  nombre_produits: number;
  nombre_commandes: number;
  nombre_clients: number;
  chiffre_affaires_total: number;

  // SEO
  meta_titre?: string;
  meta_description?: string;
  meta_mots_cles?: string[];

  // Options
  livraison_gratuite_minimum?: number;
  frais_livraison?: number;
  delai_livraison?: string;
  accepte_retours: boolean;
  delai_retour?: number; // en jours
  politique_retour?: string;

  // Dates
  date_creation: string;
  date_verification?: string;
  date_fermeture?: string;
  date_reouverture?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  is_deleted: boolean;

  // Relations (peuvent être présentes dans la réponse)
  type_boutique?: {
    uuid: string;
    nom: string;
    slug: string;
    description?: string;
    icone?: string;
  };

  proprietaire_details?: {
    uuid: string;
    nom: string;
    prenoms: string;
    email: string;
    telephone: string;
    avatar?: string;
    type: string;
  };

  categories?: Array<{
    uuid: string;
    nom: string;
    slug: string;
    description?: string;
  }>;

  produits?: Array<{
    uuid: string;
    nom: string;
    prix: number;
    image_principale: string;
    statut: string;
    stock: number;
  }>;

  avis?: Array<{
    uuid: string;
    note: number;
    commentaire: string;
    auteur_nom: string;
    date_publication: string;
    est_verifie: boolean;
  }>;

  promotions?: Array<{
    uuid: string;
    titre: string;
    description: string;
    reduction: number;
    type_reduction: "pourcentage" | "montant";
    date_debut: string;
    date_fin: string;
    est_active: boolean;
  }>;
}

export interface BoutiqueCreateData {
  nom: string;
  slug?: string;
  description: string;
  description_courte?: string;
  slogan?: string;

  // Identité visuelle
  logo: string;
  banniere?: string;
  couleurs_theme?: {
    primaire: string;
    secondaire: string;
    accent: string;
  };

  // Contact et localisation
  email: string;
  telephone: string;
  site_web?: string;
  adresse: string;
  complement_adresse?: string;
  code_postal: string;
  ville: string;
  pays: string;
  latitude?: number;
  longitude?: number;

  // Informations commerciales
  type_boutique_uuid: string;
  categories_principales: string[];

  // Propriétaire
  proprietaire_uuid: string;
  proprietaire_type: "utilisateur" | "vendeur" | "agent";
  gerant_nom?: string;
  gerant_telephone?: string;
  gerant_email?: string;

  // Horaires
  horaires?: Array<{
    jour:
      | "lundi"
      | "mardi"
      | "mercredi"
      | "jeudi"
      | "vendredi"
      | "samedi"
      | "dimanche";
    ouverture: string;
    fermeture: string;
    est_ouvert: boolean;
  }>;

  // Réseaux sociaux
  reseaux_sociaux?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    tiktok?: string;
    youtube?: string;
  };

  // Options
  livraison_gratuite_minimum?: number;
  frais_livraison?: number;
  delai_livraison?: string;
  accepte_retours?: boolean;
  delai_retour?: number;
  politique_retour?: string;

  // SEO
  meta_titre?: string;
  meta_description?: string;
  meta_mots_cles?: string[];
}

export interface BoutiqueUpdateData {
  nom?: string;
  slug?: string;
  description?: string;
  description_courte?: string;
  slogan?: string;

  // Identité visuelle
  logo?: string;
  banniere?: string;
  couleurs_theme?: {
    primaire: string;
    secondaire: string;
    accent: string;
  };

  // Contact et localisation
  email?: string;
  telephone?: string;
  site_web?: string;
  adresse?: string;
  complement_adresse?: string;
  code_postal?: string;
  ville?: string;
  pays?: string;
  latitude?: number;
  longitude?: number;

  // Informations commerciales
  type_boutique_uuid?: string;
  categories_principales?: string[];

  // Propriétaire
  gerant_nom?: string;
  gerant_telephone?: string;
  gerant_email?: string;

  // Horaires
  horaires?: Array<{
    jour:
      | "lundi"
      | "mardi"
      | "mercredi"
      | "jeudi"
      | "vendredi"
      | "samedi"
      | "dimanche";
    ouverture: string;
    fermeture: string;
    est_ouvert: boolean;
  }>;

  // Réseaux sociaux
  reseaux_sociaux?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    tiktok?: string;
    youtube?: string;
  };

  // Options
  livraison_gratuite_minimum?: number;
  frais_livraison?: number;
  delai_livraison?: string;
  accepte_retours?: boolean;
  delai_retour?: number;
  politique_retour?: string;

  // SEO
  meta_titre?: string;
  meta_description?: string;
  meta_mots_cles?: string[];

  // Statut
  statut?: "en_attente" | "actif" | "inactif" | "suspendu" | "ferme";
  est_verifie?: boolean;
  est_bloque?: boolean;
  est_ferme?: boolean;
  raison_fermeture?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";

  // Filtres
  type_boutique_uuid?: string;
  ville?: string;
  pays?: string;
  statut?: "en_attente" | "actif" | "inactif" | "suspendu" | "ferme";
  est_verifie?: boolean;
  est_bloque?: boolean;
  est_ferme?: boolean;
  note_min?: number;
  note_max?: number;
  proprietaire_uuid?: string;
  proprietaire_type?: "utilisateur" | "vendeur" | "agent";

  // Filtres géographiques
  rayon?: number; // en km
  latitude?: number;
  longitude?: number;

  // Filtres produits
  categorie_uuid?: string;
  produit_nom?: string;
  prix_min?: number;
  prix_max?: number;
}

export interface BoutiquesResponse {
  data: Boutique[];
  count: number;
  total: number;
  page: number;
  pages: number;
  status: string;
  message?: string;
}

export interface BoutiqueStats {
  total_boutiques: number;
  boutiques_actives: number;
  boutiques_inactives: number;
  boutiques_suspendues: number;
  boutiques_fermees: number;
  boutiques_en_attente: number;
  boutiques_verifiees: number;
  boutiques_bloquees: number;

  par_type: Record<string, number>;
  par_ville: Record<string, number>;
  par_pays: Record<string, number>;
  par_statut: Record<string, number>;

  produits_total: number;
  commandes_total: number;
  clients_total: number;
  chiffre_affaires_total: number;
  avis_total: number;
  note_moyenne_globale: number;
}

export interface BoutiqueFilters {
  types?: string[];
  villes?: string[];
  pays?: string[];
  statuts?: string[];
  est_verifie?: boolean;
  est_bloque?: boolean;
  est_ferme?: boolean;
  note_min?: number;
  note_max?: number;
  categories?: string[];
  rayon?: number;
  latitude?: number;
  longitude?: number;
}

export interface SearchParams {
  query: string;
  filters?: BoutiqueFilters;
  pagination?: PaginationParams;
}

export interface BoutiqueSearchResult {
  boutiques: Boutique[];
  count: number;
  total: number;
  suggestions?: string[];
  filters_available?: BoutiqueFilters;
}

export interface BoutiqueAvis {
  uuid: string;
  boutique_uuid: string;
  utilisateur_uuid?: string;
  commande_uuid?: string;
  note: number;
  commentaire: string;
  avantages?: string[];
  inconvenients?: string[];
  date_publication: string;
  date_modification?: string;
  est_verifie: boolean;
  est_approuve: boolean;
  likes: number;
  reponses?: Array<{
    uuid: string;
    contenu: string;
    date_publication: string;
    est_gestionnaire: boolean;
  }>;
}

export interface BoutiqueAvisCreateData {
  boutique_uuid: string;
  note: number;
  commentaire: string;
  avantages?: string[];
  inconvenients?: string[];
  commande_uuid?: string;
}

export interface BoutiqueProduit {
  uuid: string;
  boutique_uuid: string;
  categorie_uuid: string;
  nom: string;
  slug: string;
  description: string;
  prix: number;
  prix_promotion?: number;
  devise: string;
  images: string[];
  caracteristiques?: Record<string, any>;
  stock: number;
  statut: "brouillon" | "actif" | "inactif" | "rupture";
  est_en_promotion: boolean;
  vues: number;
  ventes: number;
  created_at: string;
  updated_at: string;
}

export interface BoutiqueCommandesStats {
  aujourdhui: {
    commandes: number;
    montant: number;
    moyenne_panier: number;
  };
  cette_semaine: {
    commandes: number;
    montant: number;
    moyenne_panier: number;
  };
  ce_mois: {
    commandes: number;
    montant: number;
    moyenne_panier: number;
  };
  evolution: {
    commandes: number; // pourcentage
    montant: number; // pourcentage
    clients: number; // pourcentage
  };
  meilleurs_produits: Array<{
    uuid: string;
    nom: string;
    ventes: number;
    montant: number;
  }>;
  categories_populaires: Array<{
    uuid: string;
    nom: string;
    commandes: number;
  }>;
}

export interface BoutiqueAnalytics {
  periode: {
    debut: string;
    fin: string;
  };
  vues: {
    total: number;
    par_jour: Array<{ date: string; count: number }>;
    sources: {
      direct: number;
      recherche: number;
      reseaux_sociaux: number;
      autres: number;
    };
  };
  conversions: {
    taux: number;
    commandes: number;
    paniers_abandonnes: number;
  };
  clients: {
    nouveaux: number;
    fideles: number;
    retention: number;
  };
  revenus: {
    total: number;
    par_jour: Array<{ date: string; montant: number }>;
    par_produit: Array<{ produit: string; montant: number }>;
  };
}

export interface BoutiqueVerificationData {
  documents: {
    identite: string;
    justificatif_domicile: string;
    kbis_ou_equivalent?: string;
    rib?: string;
  };
  informations: {
    raison_sociale: string;
    siret?: string;
    tva_intracommunautaire?: string;
    forme_juridique: string;
    capital_social?: number;
    date_creation: string;
  };
  contacts: {
    representant_legal: string;
    telephone_legal: string;
    email_legal: string;
  };
}
