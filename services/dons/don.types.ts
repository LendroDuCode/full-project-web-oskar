// services/dons/don.types.ts

export interface Don {
  // Identifiants
  uuid: string;
  code_reference: string;

  // Informations générales
  titre: string;
  description: string;
  description_courte?: string;

  // Catégorisation
  categorie_uuid: string;
  sous_categorie_uuid?: string;
  categorie_nom: string;
  tags?: string[];

  // Quantité et disponibilité
  quantite_totale: number;
  quantite_disponible: number;
  quantite_reservee: number;
  quantite_distribuee: number;
  unite_mesure?: string;

  // État et conditions
  etat: "neuf" | "tres_bon_etat" | "bon_etat" | "usage" | "a_renover";
  conditions?: string[];
  garantie?: string;
  date_fabrication?: string;
  date_peremption?: string;

  // Statuts
  statut:
    | "brouillon"
    | "en_attente"
    | "publie"
    | "bloque"
    | "archive"
    | "supprime";
  visibilite: "public" | "prive" | "groupe" | "moderateur";
  priorite: "faible" | "moyen" | "elevee" | "urgent";

  // Images et médias
  images: string[];
  documents?: Array<{
    nom: string;
    url: string;
    type: string;
    taille: number;
  }>;

  // Localisation
  adresse_uuid?: string;
  localisation?: string;
  ville?: string;
  code_postal?: string;
  pays?: string;
  latitude?: number;
  longitude?: number;
  rayon_livraison_km?: number;
  livraison_possible: boolean;
  frais_livraison?: number;

  // Donateur
  donateur_uuid: string;
  donateur_type: "utilisateur" | "vendeur" | "entreprise" | "association";
  donateur_nom: string;
  donateur_email: string;
  donateur_telephone?: string;
  donateur_avatar?: string;
  donateur_note?: number;

  // Collecte/Récupération
  mode_collecte: "sur_place" | "livraison" | "envoi" | "mixte";
  horaires_collecte?: Array<{
    jour: string;
    ouverture: string;
    fermeture: string;
  }>;
  adresse_collecte?: string;
  instructions_collecte?: string;

  // Restrictions
  restrictions?: {
    age_minimum?: number;
    situation_familiale?: string[];
    revenus_maximum?: number;
    justificatif_requis?: boolean;
    autres_conditions?: string[];
  };

  // Suivi et métriques
  vues: number;
  interesses: number;
  demandes_en_cours: number;
  demandes_acceptees: number;
  demandes_completees: number;
  note_moyenne?: number;
  nombre_avis: number;

  // Dates importantes
  date_creation: string;
  date_publication?: string;
  date_modification?: string;
  date_archivage?: string;
  date_suppression?: string;
  date_disponibilite: string;
  date_limite?: string;

  // Validation et modération
  est_valide: boolean;
  valide_par?: string;
  date_validation?: string;
  motif_blocage?: string;

  // Métadonnées
  metadata?: Record<string, any>;
  attributs?: Record<string, any>;

  // Relations
  interesses_liste?: Array<{
    uuid: string;
    utilisateur_uuid: string;
    utilisateur_nom: string;
    date_expression: string;
    statut: string;
  }>;

  demandes?: Array<{
    uuid: string;
    utilisateur_uuid: string;
    quantite_demandee: number;
    statut: string;
    date_demande: string;
  }>;
}

export interface DonCreateData {
  titre: string;
  description: string;
  description_courte?: string;

  categorie_uuid: string;
  sous_categorie_uuid?: string;
  tags?: string[];

  quantite_totale: number;
  unite_mesure?: string;

  etat: "neuf" | "tres_bon_etat" | "bon_etat" | "usage" | "a_renover";
  conditions?: string[];
  garantie?: string;
  date_fabrication?: string;
  date_peremption?: string;

  visibilite?: "public" | "prive" | "groupe" | "moderateur";
  priorite?: "faible" | "moyen" | "elevee" | "urgent";

  images?: string[];
  documents?: Array<{
    nom: string;
    url: string;
    type: string;
    taille: number;
  }>;

  localisation?: string;
  ville?: string;
  code_postal?: string;
  pays?: string;
  latitude?: number;
  longitude?: number;
  rayon_livraison_km?: number;
  livraison_possible?: boolean;
  frais_livraison?: number;

  mode_collecte: "sur_place" | "livraison" | "envoi" | "mixte";
  horaires_collecte?: Array<{
    jour: string;
    ouverture: string;
    fermeture: string;
  }>;
  adresse_collecte?: string;
  instructions_collecte?: string;

  restrictions?: {
    age_minimum?: number;
    situation_familiale?: string[];
    revenus_maximum?: number;
    justificatif_requis?: boolean;
    autres_conditions?: string[];
  };

  date_disponibilite: string;
  date_limite?: string;

  metadata?: Record<string, any>;
  attributs?: Record<string, any>;
}

export interface DonUpdateData {
  titre?: string;
  description?: string;
  description_courte?: string;

  categorie_uuid?: string;
  sous_categorie_uuid?: string;
  tags?: string[];

  quantite_totale?: number;
  quantite_disponible?: number;
  unite_mesure?: string;

  etat?: "neuf" | "tres_bon_etat" | "bon_etat" | "usage" | "a_renover";
  conditions?: string[];
  garantie?: string;
  date_fabrication?: string;
  date_peremption?: string;

  statut?:
    | "brouillon"
    | "en_attente"
    | "publie"
    | "bloque"
    | "archive"
    | "supprime";
  visibilite?: "public" | "prive" | "groupe" | "moderateur";
  priorite?: "faible" | "moyen" | "elevee" | "urgent";

  images?: string[];
  documents?: Array<{
    nom: string;
    url: string;
    type: string;
    taille: number;
  }>;

  localisation?: string;
  ville?: string;
  code_postal?: string;
  pays?: string;
  latitude?: number;
  longitude?: number;
  rayon_livraison_km?: number;
  livraison_possible?: boolean;
  frais_livraison?: number;

  mode_collecte?: "sur_place" | "livraison" | "envoi" | "mixte";
  horaires_collecte?: Array<{
    jour: string;
    ouverture: string;
    fermeture: string;
  }>;
  adresse_collecte?: string;
  instructions_collecte?: string;

  restrictions?: {
    age_minimum?: number;
    situation_familiale?: string[];
    revenus_maximum?: number;
    justificatif_requis?: boolean;
    autres_conditions?: string[];
  };

  date_disponibilite?: string;
  date_limite?: string;

  metadata?: Record<string, any>;
  attributs?: Record<string, any>;
}

export interface DonFilterParams {
  categorie_uuid?: string;
  sous_categorie_uuid?: string;

  donateur_uuid?: string;
  donateur_type?: "utilisateur" | "vendeur" | "entreprise" | "association";

  statut?:
    | "brouillon"
    | "en_attente"
    | "publie"
    | "bloque"
    | "archive"
    | "supprime";
  visibilite?: "public" | "prive" | "groupe" | "moderateur";
  priorite?: "faible" | "moyen" | "elevee" | "urgent";
  etat?: "neuf" | "tres_bon_etat" | "bon_etat" | "usage" | "a_renover";

  ville?: string;
  code_postal?: string;
  pays?: string;
  rayon_km?: number;
  latitude?: number;
  longitude?: number;

  livraison_possible?: boolean;
  mode_collecte?: "sur_place" | "livraison" | "envoi" | "mixte";

  quantite_min?: number;
  quantite_max?: number;
  quantite_disponible_min?: number;

  date_creation_debut?: string;
  date_creation_fin?: string;
  date_disponibilite_debut?: string;
  date_disponibilite_fin?: string;
  date_limite_debut?: string;
  date_limite_fin?: string;

  est_valide?: boolean;
  has_images?: boolean;
  has_demandes?: boolean;
  has_interesses?: boolean;

  tags?: string[];
  search?: string;

  // Tri
  sort_by?:
    | "date_creation"
    | "date_publication"
    | "date_disponibilite"
    | "titre"
    | "quantite_disponible"
    | "vues"
    | "interesses"
    | "priorite";
  sort_order?: "asc" | "desc";
}

export interface DonPaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?:
    | "date_creation"
    | "date_publication"
    | "date_disponibilite"
    | "titre"
    | "quantite_disponible"
    | "vues"
    | "interesses"
    | "priorite";
  sort_order?: "asc" | "desc";
  filters?: DonFilterParams;
}

export interface DonStats {
  total_dons: number;
  dons_par_statut: Record<string, number>;
  dons_par_categorie: Array<{
    categorie: string;
    count: number;
    quantite_totale: number;
  }>;
  dons_par_mois: Array<{
    mois: string;
    count: number;
  }>;

  quantite_totale: number;
  quantite_disponible: number;
  quantite_distribuee: number;

  taux_disponibilite: number;
  taux_distribution: number;

  top_donateurs: Array<{
    donateur_uuid: string;
    donateur_nom: string;
    nombre_dons: number;
    quantite_totale: number;
  }>;

  top_categories: Array<{
    categorie: string;
    nombre_dons: number;
    popularite: number;
  }>;

  distribution_geographique: Array<{
    ville: string;
    count: number;
  }>;

  metrics: {
    dons_moyens_par_donateur: number;
    quantite_moyenne_par_don: number;
    delai_moyen_distribution: number;
    satisfaction_moyenne: number;
  };
}

export interface DonValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  quantite_max_recommandee?: number;
  images_manquantes?: boolean;
  description_completee?: boolean;
}

export interface DonBulkUpdate {
  uuids: string[];
  updates: DonUpdateData;
}

export interface DonWithDetails extends Don {
  donateur_details?: {
    note_moyenne: number;
    nombre_dons_total: number;
    date_inscription: string;
    est_verifie: boolean;
  };

  categorie_details?: {
    nom_complet: string;
    description: string;
    icone?: string;
  };

  statistiques?: {
    vues_par_jour: Array<{ date: string; count: number }>;
    demandes_par_statut: Record<string, number>;
    taux_conversion: number;
    delai_moyen_reponse: number;
  };

  historiques?: Array<{
    date: string;
    action: string;
    utilisateur: string;
    details?: string;
  }>;
}

export interface DonDemande {
  uuid: string;
  don_uuid: string;
  utilisateur_uuid: string;
  utilisateur_nom: string;
  utilisateur_email: string;
  utilisateur_telephone?: string;

  quantite_demandee: number;
  quantite_acceptee?: number;
  quantite_recue?: number;

  message?: string;
  motivation?: string;

  statut:
    | "en_attente"
    | "confirmee"
    | "acceptee"
    | "refusee"
    | "annulee"
    | "completee";
  priorite: "faible" | "moyen" | "elevee" | "urgent";

  mode_livraison?: "sur_place" | "livraison" | "envoi";
  date_rendezvous_proposee?: string;
  date_rendezvous_confirmee?: string;
  lieu_rendezvous?: string;

  est_verifie: boolean;
  verification_notes?: string;

  date_demande: string;
  date_traitement?: string;
  date_acceptation?: string;
  date_completion?: string;

  created_at: string;
  updated_at: string;
}

export interface DonNotification {
  uuid: string;
  don_uuid: string;
  type:
    | "nouveau_don"
    | "validation_requise"
    | "demande_recue"
    | "demande_acceptee"
    | "demande_refusee"
    | "rappel"
    | "expiration_proche";
  destinataire_uuid: string;
  destinataire_type: string;
  sujet: string;
  contenu: string;
  statut: "en_attente" | "envoyee" | "lue" | "erreur";
  methode: "email" | "sms" | "push" | "in_app";
  date_envoi?: string;
  date_lecture?: string;
  erreur?: string;

  created_at: string;
  updated_at: string;
}

export interface DonReview {
  uuid: string;
  don_uuid: string;
  evaluateur_uuid: string;
  evaluateur_type: "donateur" | "beneficiaire";

  note: number;
  commentaire: string;

  aspects: {
    qualite?: number;
    description_accurate?: number;
    ponctualite?: number;
    communication?: number;
  };

  recommandation: boolean;
  tags?: string[];

  est_verifie: boolean;
  moderateur_notes?: string;

  created_at: string;
  updated_at: string;
}

export interface DonExportOptions {
  format: "json" | "csv" | "excel" | "pdf";
  include_demandes: boolean;
  include_reviews: boolean;
  include_statistiques: boolean;
  filters?: DonFilterParams;
  fields?: string[];
}

export interface DonAnalytics {
  periode: {
    debut: string;
    fin: string;
  };

  volume: {
    total_dons: number;
    nouveaux_dons: number;
    dons_completes: number;
    par_jour: Array<{ date: string; count: number }>;
  };

  engagement: {
    vues_moyennes: number;
    taux_interet: number;
    taux_demande: number;
    taux_conversion: number;
    delai_moyen_traitement: number;
  };

  qualite: {
    dons_avec_images: number;
    dons_detailles: number;
    satisfaction_moyenne: number;
    taux_revision: number;
  };

  geographie: {
    top_villes: Array<{ ville: string; count: number }>;
    top_pays: Array<{ pays: string; count: number }>;
    distribution_regionale: Record<string, number>;
  };

  categories: {
    plus_populaires: Array<{ categorie: string; count: number }>;
    taux_disponibilite: Record<string, number>;
    tendances: Array<{ categorie: string; croissance: number }>;
  };
}

export interface DonMatchSuggestion {
  don_uuid: string;
  suggestions: Array<{
    type:
      | "don_similaire"
      | "donateur_similaire"
      | "categorie_populaire"
      | "localisation_proche";
    don_suggere_uuid?: string;
    donateur_uuid?: string;
    raison: string;
    score: number;
  }>;
}

export interface DonVerificationRequest {
  don_uuid: string;
  type_verification: "qualite" | "authenticite" | "disponibilite" | "complet";
  verificateur_uuid?: string;
  notes?: string;
  statut: "en_attente" | "en_cours" | "approuvee" | "rejetee";
  date_demande: string;
  date_traitement?: string;

  created_at: string;
  updated_at: string;
}

export interface DonAuditLog {
  uuid: string;
  don_uuid: string;
  action:
    | "creation"
    | "modification"
    | "statut_change"
    | "demande"
    | "validation"
    | "suppression";
  anciennes_valeurs?: Partial<Don>;
  nouvelles_valeurs?: Partial<Don>;
  utilisateur_uuid?: string;
  utilisateur_type?: string;
  ip_address?: string;
  user_agent?: string;

  created_at: string;
}

export interface DonSearchResult {
  dons: Don[];
  total: number;
  page: number;
  pages: number;
  facets: {
    categories: Array<{ uuid: string; nom: string; count: number }>;
    villes: Array<{ ville: string; count: number }>;
    etats: Array<{ etat: string; count: number }>;
  };
}

export interface DonCategoryStats {
  categorie_uuid: string;
  categorie_nom: string;
  total_dons: number;
  dons_disponibles: number;
  quantite_totale: number;
  quantite_disponible: number;
  taux_disponibilite: number;
  taux_interet: number;
  dons_par_mois: Array<{ mois: string; count: number }>;
  top_donateurs: Array<{
    donateur_uuid: string;
    donateur_nom: string;
    count: number;
  }>;
}

export interface DonLocationCluster {
  latitude: number;
  longitude: number;
  count: number;
  dons: Array<{
    uuid: string;
    titre: string;
    categorie: string;
    quantite_disponible: number;
  }>;
}
