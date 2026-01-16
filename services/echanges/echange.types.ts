// services/echanges/echange.types.ts

export interface Echange {
  // Identifiants
  uuid: string;
  code_reference: string;

  // Informations générales
  titre: string;
  description: string;
  description_courte?: string;

  // Catégorisation
  type_echange: "produit" | "service" | "mixte" | "multi";
  categorie_uuid: string;
  sous_categorie_uuid?: string;
  categorie_nom: string;
  tags?: string[];

  // Objet à échanger
  objet_echange: {
    type: "produit" | "service";
    description: string;
    etat: "neuf" | "tres_bon_etat" | "bon_etat" | "usage" | "a_renover";
    quantite?: number;
    unite_mesure?: string;
    valeur_estimee?: number;
    devise?: string;
    garantie?: string;
    date_fabrication?: string;
    date_peremption?: string;
    dimensions?: {
      longueur?: number;
      largeur?: number;
      hauteur?: number;
      poids?: number;
    };
  };

  // Ce que je recherche
  recherche: {
    type: "produit" | "service" | "argent" | "mixte";
    description: string;
    priorites?: string[];
    exclure?: string[];
    valeurs_acceptees?: {
      min?: number;
      max?: number;
    };
    specificites?: string[];
  };

  // Conditions de l'échange
  conditions: {
    mode: "direct" | "progressive" | "avec_complement";
    complement_monetaire?: {
      accepte: boolean;
      min?: number;
      max?: number;
    };
    delai_max: string;
    garanties_requises?: boolean;
    inspection_requise?: boolean;
    certificats_requis?: string[];
  };

  // Statuts
  statut:
    | "brouillon"
    | "en_attente"
    | "publie"
    | "en_cours"
    | "negocie"
    | "finalise"
    | "annule"
    | "bloque"
    | "archive";
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
  videos?: string[];

  // Localisation
  adresse_uuid?: string;
  localisation?: string;
  ville?: string;
  code_postal?: string;
  pays?: string;
  latitude?: number;
  longitude?: number;
  rayon_echange_km?: number;
  echange_a_distance: boolean;
  frais_transport?: {
    pris_en_charge: boolean;
    montant_max?: number;
    conditions?: string;
  };

  // Créateur
  createur_uuid: string;
  createur_type: "utilisateur" | "vendeur" | "entreprise" | "association";
  createur_nom: string;
  createur_email: string;
  createur_telephone?: string;
  createur_avatar?: string;
  createur_note?: number;
  createur_verifie: boolean;

  // Horaires et disponibilités
  disponibilites?: Array<{
    jour: string;
    plages: Array<{
      debut: string;
      fin: string;
    }>;
  }>;
  delai_reponse_max?: string;

  // Restrictions
  restrictions?: {
    age_minimum?: number;
    experience_requise?: boolean;
    competences_requises?: string[];
    equipement_requis?: string[];
    localisation_specifique?: boolean;
    autres_conditions?: string[];
  };

  // Suivi et métriques
  vues: number;
  interesses: number;
  propositions_recues: number;
  propositions_acceptees: number;
  echanges_realises: number;
  note_moyenne?: number;
  nombre_avis: number;

  // Dates importantes
  date_creation: string;
  date_publication?: string;
  date_modification?: string;
  date_expiration?: string;
  date_archivage?: string;
  date_suppression?: string;
  delai_validite_jours: number;

  // Validation et modération
  est_valide: boolean;
  valide_par?: string;
  date_validation?: string;
  motif_blocage?: string;
  notes_moderation?: string;

  // Sécurité et garanties
  garanties: {
    authentification_requise: boolean;
    depot_garantie?: boolean;
    montant_depot?: number;
    mediation_possible: boolean;
    assurance_recommandee: boolean;
  };

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

  propositions?: Array<{
    uuid: string;
    createur_uuid: string;
    description: string;
    statut: string;
    date_proposition: string;
  }>;

  echanges_associes?: Array<{
    uuid: string;
    type: string;
    statut: string;
    date_debut: string;
  }>;
}

export interface EchangeCreateData {
  titre: string;
  description: string;
  description_courte?: string;

  type_echange: "produit" | "service" | "mixte" | "multi";
  categorie_uuid: string;
  sous_categorie_uuid?: string;
  tags?: string[];

  objet_echange: {
    type: "produit" | "service";
    description: string;
    etat: "neuf" | "tres_bon_etat" | "bon_etat" | "usage" | "a_renover";
    quantite?: number;
    unite_mesure?: string;
    valeur_estimee?: number;
    devise?: string;
    garantie?: string;
    date_fabrication?: string;
    date_peremption?: string;
    dimensions?: {
      longueur?: number;
      largeur?: number;
      hauteur?: number;
      poids?: number;
    };
  };

  recherche: {
    type: "produit" | "service" | "argent" | "mixte";
    description: string;
    priorites?: string[];
    exclure?: string[];
    valeurs_acceptees?: {
      min?: number;
      max?: number;
    };
    specificites?: string[];
  };

  conditions: {
    mode: "direct" | "progressive" | "avec_complement";
    complement_monetaire?: {
      accepte: boolean;
      min?: number;
      max?: number;
    };
    delai_max: string;
    garanties_requises?: boolean;
    inspection_requise?: boolean;
    certificats_requis?: string[];
  };

  visibilite?: "public" | "prive" | "groupe" | "moderateur";
  priorite?: "faible" | "moyen" | "elevee" | "urgent";

  images?: string[];
  documents?: Array<{
    nom: string;
    url: string;
    type: string;
    taille: number;
  }>;
  videos?: string[];

  localisation?: string;
  ville?: string;
  code_postal?: string;
  pays?: string;
  latitude?: number;
  longitude?: number;
  rayon_echange_km?: number;
  echange_a_distance?: boolean;
  frais_transport?: {
    pris_en_charge: boolean;
    montant_max?: number;
    conditions?: string;
  };

  disponibilites?: Array<{
    jour: string;
    plages: Array<{
      debut: string;
      fin: string;
    }>;
  }>;
  delai_reponse_max?: string;

  restrictions?: {
    age_minimum?: number;
    experience_requise?: boolean;
    competences_requises?: string[];
    equipement_requis?: string[];
    localisation_specifique?: boolean;
    autres_conditions?: string[];
  };

  delai_validite_jours?: number;

  garanties?: {
    authentification_requise?: boolean;
    depot_garantie?: boolean;
    montant_depot?: number;
    mediation_possible?: boolean;
    assurance_recommandee?: boolean;
  };

  metadata?: Record<string, any>;
  attributs?: Record<string, any>;
}

export interface EchangeUpdateData {
  titre?: string;
  description?: string;
  description_courte?: string;

  type_echange?: "produit" | "service" | "mixte" | "multi";
  categorie_uuid?: string;
  sous_categorie_uuid?: string;
  tags?: string[];

  objet_echange?: {
    type?: "produit" | "service";
    description?: string;
    etat?: "neuf" | "tres_bon_etat" | "bon_etat" | "usage" | "a_renover";
    quantite?: number;
    unite_mesure?: string;
    valeur_estimee?: number;
    devise?: string;
    garantie?: string;
    date_fabrication?: string;
    date_peremption?: string;
    dimensions?: {
      longueur?: number;
      largeur?: number;
      hauteur?: number;
      poids?: number;
    };
  };

  recherche?: {
    type?: "produit" | "service" | "argent" | "mixte";
    description?: string;
    priorites?: string[];
    exclure?: string[];
    valeurs_acceptees?: {
      min?: number;
      max?: number;
    };
    specificites?: string[];
  };

  conditions?: {
    mode?: "direct" | "progressive" | "avec_complement";
    complement_monetaire?: {
      accepte?: boolean;
      min?: number;
      max?: number;
    };
    delai_max?: string;
    garanties_requises?: boolean;
    inspection_requise?: boolean;
    certificats_requis?: string[];
  };

  statut?:
    | "brouillon"
    | "en_attente"
    | "publie"
    | "en_cours"
    | "negocie"
    | "finalise"
    | "annule"
    | "bloque"
    | "archive";
  visibilite?: "public" | "prive" | "groupe" | "moderateur";
  priorite?: "faible" | "moyen" | "elevee" | "urgent";

  images?: string[];
  documents?: Array<{
    nom: string;
    url: string;
    type: string;
    taille: number;
  }>;
  videos?: string[];

  localisation?: string;
  ville?: string;
  code_postal?: string;
  pays?: string;
  latitude?: number;
  longitude?: number;
  rayon_echange_km?: number;
  echange_a_distance?: boolean;
  frais_transport?: {
    pris_en_charge?: boolean;
    montant_max?: number;
    conditions?: string;
  };

  disponibilites?: Array<{
    jour: string;
    plages: Array<{
      debut: string;
      fin: string;
    }>;
  }>;
  delai_reponse_max?: string;

  restrictions?: {
    age_minimum?: number;
    experience_requise?: boolean;
    competences_requises?: string[];
    equipement_requis?: string[];
    localisation_specifique?: boolean;
    autres_conditions?: string[];
  };

  delai_validite_jours?: number;
  date_expiration?: string;

  est_valide?: boolean;
  motif_blocage?: string;
  notes_moderation?: string;

  garanties?: {
    authentification_requise?: boolean;
    depot_garantie?: boolean;
    montant_depot?: number;
    mediation_possible?: boolean;
    assurance_recommandee?: boolean;
  };

  metadata?: Record<string, any>;
  attributs?: Record<string, any>;
}

export interface EchangeFilterParams {
  categorie_uuid?: string;
  sous_categorie_uuid?: string;
  type_echange?: "produit" | "service" | "mixte" | "multi";

  createur_uuid?: string;
  createur_type?: "utilisateur" | "vendeur" | "entreprise" | "association";
  createur_verifie?: boolean;

  statut?:
    | "brouillon"
    | "en_attente"
    | "publie"
    | "en_cours"
    | "negocie"
    | "finalise"
    | "annule"
    | "bloque"
    | "archive";
  visibilite?: "public" | "prive" | "groupe" | "moderateur";
  priorite?: "faible" | "moyen" | "elevee" | "urgent";

  objet_type?: "produit" | "service";
  objet_etat?: "neuf" | "tres_bon_etat" | "bon_etat" | "usage" | "a_renover";
  recherche_type?: "produit" | "service" | "argent" | "mixte";

  ville?: string;
  code_postal?: string;
  pays?: string;
  rayon_km?: number;
  latitude?: number;
  longitude?: number;
  echange_a_distance?: boolean;

  conditions_mode?: "direct" | "progressive" | "avec_complement";
  avec_complement?: boolean;
  avec_garantie?: boolean;
  avec_depot?: boolean;

  valeur_min?: number;
  valeur_max?: number;
  quantite_min?: number;
  quantite_max?: number;

  date_creation_debut?: string;
  date_creation_fin?: string;
  date_expiration_debut?: string;
  date_expiration_fin?: string;

  est_valide?: boolean;
  has_images?: boolean;
  has_propositions?: boolean;
  has_interesses?: boolean;

  tags?: string[];
  search?: string;

  // Tri
  sort_by?:
    | "date_creation"
    | "date_publication"
    | "date_expiration"
    | "titre"
    | "valeur_estimee"
    | "vues"
    | "interesses"
    | "priorite";
  sort_order?: "asc" | "desc";
}

export interface EchangePaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?:
    | "date_creation"
    | "date_publication"
    | "date_expiration"
    | "titre"
    | "valeur_estimee"
    | "vues"
    | "interesses"
    | "priorite";
  sort_order?: "asc" | "desc";
  filters?: EchangeFilterParams;
}

export interface EchangeStats {
  total_echanges: number;
  echanges_par_statut: Record<string, number>;
  echanges_par_type: Record<string, number>;
  echanges_par_mois: Array<{
    mois: string;
    count: number;
  }>;

  valeur_totale_estimee: number;
  complement_monetaire_total: number;
  taux_success: number;

  top_createurs: Array<{
    createur_uuid: string;
    createur_nom: string;
    nombre_echanges: number;
    taux_success: number;
  }>;

  top_categories: Array<{
    categorie: string;
    nombre_echanges: number;
    taux_success: number;
  }>;

  distribution_geographique: Array<{
    ville: string;
    count: number;
  }>;

  metrics: {
    echanges_moyens_par_createur: number;
    valeur_moyenne_par_echange: number;
    delai_moyen_realisation: number;
    satisfaction_moyenne: number;
    taux_interet_moyen: number;
  };
}

export interface EchangeValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  valeur_equitable?: boolean;
  images_manquantes?: boolean;
  description_completee?: boolean;
}

export interface EchangeBulkUpdate {
  uuids: string[];
  updates: EchangeUpdateData;
}

export interface EchangeWithDetails extends Echange {
  createur_details?: {
    note_moyenne: number;
    nombre_echanges_total: number;
    nombre_echanges_reussis: number;
    date_inscription: string;
    competences?: string[];
  };

  categorie_details?: {
    nom_complet: string;
    description: string;
    icone?: string;
  };

  statistiques?: {
    vues_par_jour: Array<{ date: string; count: number }>;
    interesses_par_mois: Array<{ mois: string; count: number }>;
    propositions_par_statut: Record<string, number>;
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

export interface EchangeProposition {
  uuid: string;
  echange_uuid: string;
  createur_uuid: string;
  createur_nom: string;
  createur_email: string;
  createur_telephone?: string;

  offre: {
    description: string;
    type: "produit" | "service" | "argent" | "mixte";
    valeur_estimee?: number;
    devise?: string;
    conditions: string[];
    disponibilite: string;
    images?: string[];
    garanties?: string[];
  };

  contrepartie_souhaitee?: {
    description: string;
    valeur_estimee?: number;
    conditions: string[];
  };

  conditions_proposees: {
    mode: "direct" | "progressive" | "avec_complement";
    complement_monetaire?: number;
    delai_propose: string;
    garanties_offertes?: string[];
  };

  message?: string;
  motivation?: string;

  statut:
    | "en_attente"
    | "etudiee"
    | "negociee"
    | "acceptee"
    | "refusee"
    | "annulee";
  priorite: "faible" | "moyen" | "elevee" | "urgent";

  est_verifie: boolean;
  verification_notes?: string;

  date_proposition: string;
  date_traitement?: string;
  date_acceptation?: string;
  date_refus?: string;

  created_at: string;
  updated_at: string;
}

export interface EchangeNotification {
  uuid: string;
  echange_uuid: string;
  type:
    | "nouvel_echange"
    | "validation_requise"
    | "proposition_recue"
    | "proposition_acceptee"
    | "proposition_refusee"
    | "rappel"
    | "expiration_proche"
    | "echange_finalise";
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

export interface EchangeReview {
  uuid: string;
  echange_uuid: string;
  evaluateur_uuid: string;
  evaluateur_type: "createur" | "participant" | "tiers";

  note: number;
  commentaire: string;

  aspects: {
    equite?: number;
    communication?: number;
    ponctualite?: number;
    qualite_objet?: number;
    respect_conditions?: number;
    facilite_echange?: number;
  };

  recommandation: boolean;
  tags?: string[];

  est_verifie: boolean;
  moderateur_notes?: string;

  created_at: string;
  updated_at: string;
}

export interface EchangeExportOptions {
  format: "json" | "csv" | "excel" | "pdf";
  include_propositions: boolean;
  include_reviews: boolean;
  include_statistiques: boolean;
  filters?: EchangeFilterParams;
  fields?: string[];
}

export interface EchangeAnalytics {
  periode: {
    debut: string;
    fin: string;
  };

  volume: {
    total_echanges: number;
    nouveaux_echanges: number;
    echanges_finalises: number;
    par_jour: Array<{ date: string; count: number }>;
  };

  engagement: {
    vues_moyennes: number;
    taux_interet: number;
    taux_proposition: number;
    taux_conversion: number;
    delai_moyen_traitement: number;
  };

  qualite: {
    echanges_avec_images: number;
    echanges_detailles: number;
    satisfaction_moyenne: number;
    taux_revision: number;
  };

  economique: {
    valeur_totale_estimee: number;
    complement_monetaire_total: number;
    valeur_moyenne_echange: number;
    taux_complement: number;
  };

  geographie: {
    top_villes: Array<{ ville: string; count: number }>;
    top_pays: Array<{ pays: string; count: number }>;
    distribution_regionale: Record<string, number>;
  };

  categories: {
    plus_populaires: Array<{ categorie: string; count: number }>;
    taux_success: Record<string, number>;
    tendances: Array<{ categorie: string; croissance: number }>;
  };
}

export interface EchangeMatchSuggestion {
  echange_uuid: string;
  suggestions: Array<{
    type:
      | "echange_similaire"
      | "createur_similaire"
      | "contrepartie_parfaite"
      | "groupe_echange";
    echange_suggere_uuid?: string;
    createur_uuid?: string;
    raison: string;
    score: number;
  }>;
}

export interface EchangeVerificationRequest {
  echange_uuid: string;
  type_verification:
    | "qualite"
    | "authenticite"
    | "disponibilite"
    | "valeur"
    | "complet";
  verificateur_uuid?: string;
  notes?: string;
  statut: "en_attente" | "en_cours" | "approuvee" | "rejetee";
  date_demande: string;
  date_traitement?: string;

  created_at: string;
  updated_at: string;
}

export interface EchangeAuditLog {
  uuid: string;
  echange_uuid: string;
  action:
    | "creation"
    | "modification"
    | "statut_change"
    | "proposition"
    | "validation"
    | "suppression"
    | "visualisation";
  anciennes_valeurs?: Partial<Echange>;
  nouvelles_valeurs?: Partial<Echange>;
  utilisateur_uuid?: string;
  utilisateur_type?: string;
  ip_address?: string;
  user_agent?: string;

  created_at: string;
}

export interface EchangeSearchResult {
  echanges: Echange[];
  total: number;
  page: number;
  pages: number;
  facets: {
    categories: Array<{ uuid: string; nom: string; count: number }>;
    types: Array<{ type: string; count: number }>;
    villes: Array<{ ville: string; count: number }>;
    etats: Array<{ etat: string; count: number }>;
  };
}

export interface EchangeCategoryStats {
  categorie_uuid: string;
  categorie_nom: string;
  total_echanges: number;
  echanges_actifs: number;
  valeur_totale_estimee: number;
  taux_success: number;
  taux_interet: number;
  echanges_par_mois: Array<{ mois: string; count: number }>;
  top_createurs: Array<{
    createur_uuid: string;
    createur_nom: string;
    count: number;
  }>;
}

export interface EchangeLocationCluster {
  latitude: number;
  longitude: number;
  count: number;
  echanges: Array<{
    uuid: string;
    titre: string;
    type_echange: string;
    valeur_estimee?: number;
    ville?: string;
  }>;
}

export interface EchangeNegociation {
  uuid: string;
  echange_uuid: string;
  proposition_uuid: string;
  phase: "initiale" | "contre_offre" | "finalisation";
  offre_initial: any;
  contre_offre?: any;
  offre_finale?: any;
  points_discussion: string[];
  accords: string[];
  created_at: string;
  updated_at: string;
}

export interface EchangeTransaction {
  uuid: string;
  echange_uuid: string;
  type: "depot_garantie" | "complement" | "frais_service" | "remboursement";
  montant: number;
  devise: string;
  statut: "initiee" | "en_attente" | "confirmee" | "annulee" | "remboursee";
  payeur_uuid: string;
  beneficiaire_uuid: string;
  reference_paiement?: string;
  date_paiement?: string;
  date_confirmation?: string;
  created_at: string;
  updated_at: string;
}
