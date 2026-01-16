// services/dons/don-interesse.types.ts

export interface DonInteresse {
  // Identifiants
  uuid: string;
  don_uuid: string;

  // Utilisateur intéressé
  utilisateur_uuid: string;
  utilisateur_type: "utilisateur" | "vendeur" | "agent" | "invite";
  utilisateur_nom: string;
  utilisateur_email: string;
  utilisateur_telephone: string;
  utilisateur_ville?: string;
  utilisateur_pays?: string;

  // Statut de l'intérêt
  statut:
    | "en_attente"
    | "confirme"
    | "accepte"
    | "refuse"
    | "annule"
    | "complete"
    | "expire";
  priorite: "faible" | "moyen" | "elevee" | "urgent";

  // Informations de contact
  message_contact?: string;
  mode_contact_prefere: "email" | "telephone" | "message" | "tous";
  disponibilites?: Array<{
    jour: string;
    plage_horaire: string;
  }>;

  // Quantité demandée
  quantite_demandee: number;
  quantite_acceptee?: number;
  quantite_recue?: number;

  // Motivation
  motivation?: string;
  usage_prevu?: string;
  situation?: string; // Situation personnelle justifiant l'intérêt

  // Rendez-vous/Collecte
  date_rendezvous_proposee?: string;
  date_rendezvous_confirmee?: string;
  lieu_rendezvous?: string;
  mode_livraison_prefere?: "recuperation" | "livraison" | "envoi";

  // Suivi
  nombre_contacts: number;
  dernier_contact?: string;
  prochain_rappel?: string;
  rappels_envoyes: number;

  // Validation
  est_verifie: boolean;
  verification_notes?: string;
  verifie_par?: string;
  date_verification?: string;

  // Donateur (créateur du don)
  donateur_uuid: string;
  donateur_type: string;
  donateur_nom?: string;

  // Dates
  date_expression_interet: string;
  date_confirmation?: string;
  date_acceptation?: string;
  date_refus?: string;
  date_annulation?: string;
  date_completion?: string;
  created_at: string;
  updated_at: string;

  // Relations
  don?: {
    uuid: string;
    titre: string;
    description: string;
    quantite_totale: number;
    quantite_disponible: number;
    statut: string;
    localisation?: string;
    images?: string[];
    categorie_nom?: string;
  };

  utilisateur_details?: {
    avatar?: string;
    note_moyenne?: number;
    nombre_dons_recus?: number;
    nombre_dons_offerts?: number;
    date_inscription?: string;
  };

  conversations?: Array<{
    uuid: string;
    message: string;
    expediteur_type: string;
    date_envoi: string;
    lu: boolean;
  }>;

  // Métadonnées
  metadata?: Record<string, any>;
  tags?: string[];
}

export interface DonInteresseCreateData {
  don_uuid: string;
  utilisateur_uuid?: string;
  utilisateur_type?: "utilisateur" | "vendeur" | "agent" | "invite";
  utilisateur_nom?: string;
  utilisateur_email?: string;
  utilisateur_telephone?: string;
  utilisateur_ville?: string;
  utilisateur_pays?: string;

  quantite_demandee: number;
  message_contact?: string;
  mode_contact_prefere?: "email" | "telephone" | "message" | "tous";
  motivation?: string;
  usage_prevu?: string;
  situation?: string;

  disponibilites?: Array<{
    jour: string;
    plage_horaire: string;
  }>;

  date_rendezvous_proposee?: string;
  lieu_rendezvous?: string;
  mode_livraison_prefere?: "recuperation" | "livraison" | "envoi";

  metadata?: Record<string, any>;
  tags?: string[];
}

export interface DonInteresseUpdateData {
  statut?:
    | "en_attente"
    | "confirme"
    | "accepte"
    | "refuse"
    | "annule"
    | "complete"
    | "expire";
  priorite?: "faible" | "moyen" | "elevee" | "urgent";

  quantite_acceptee?: number;
  quantite_recue?: number;

  date_rendezvous_proposee?: string;
  date_rendezvous_confirmee?: string;
  lieu_rendezvous?: string;
  mode_livraison_prefere?: "recuperation" | "livraison" | "envoi";

  message_contact?: string;
  mode_contact_prefere?: "email" | "telephone" | "message" | "tous";
  disponibilites?: Array<{
    jour: string;
    plage_horaire: string;
  }>;

  motivation?: string;
  usage_prevu?: string;

  est_verifie?: boolean;
  verification_notes?: string;

  metadata?: Record<string, any>;
  tags?: string[];
}

export interface DonInteresseFilterParams {
  don_uuid?: string;
  utilisateur_uuid?: string;
  utilisateur_type?: "utilisateur" | "vendeur" | "agent" | "invite";
  donateur_uuid?: string;
  donateur_type?: string;
  statut?:
    | "en_attente"
    | "confirme"
    | "accepte"
    | "refuse"
    | "annule"
    | "complete"
    | "expire";
  priorite?: "faible" | "moyen" | "elevee" | "urgent";
  date_debut?: string;
  date_fin?: string;
  ville?: string;
  pays?: string;
  est_verifie?: boolean;
  has_rendezvous?: boolean;
  has_conversation?: boolean;
  quantite_min?: number;
  quantite_max?: number;
  search?: string;
  tags?: string[];
  mode_livraison?: "recuperation" | "livraison" | "envoi";
  mode_contact?: "email" | "telephone" | "message" | "tous";
  besoin_verification?: boolean;
  besoin_rappel?: boolean;
  expire_soon?: boolean;
}

export interface DonInteressePaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?:
    | "date_expression_interet"
    | "priorite"
    | "quantite_demandee"
    | "created_at"
    | "updated_at";
  sort_order?: "asc" | "desc";
  filters?: DonInteresseFilterParams;
}

export interface DonInteresseStats {
  total_interets: number;
  interets_par_statut: Record<string, number>;
  interets_par_priorite: Record<string, number>;
  interets_par_mois: Array<{
    mois: string;
    count: number;
  }>;

  taux_conversion: number;
  taux_acceptation: number;
  taux_completion: number;
  delai_moyen_traitement: number; // en jours

  top_donneurs: Array<{
    donateur_uuid: string;
    donateur_nom: string;
    nombre_interets: number;
    taux_acceptation: number;
  }>;

  top_beneficiaires: Array<{
    utilisateur_uuid: string;
    utilisateur_nom: string;
    nombre_interets: number;
    taux_acceptation: number;
  }>;

  categories_populaires: Array<{
    categorie: string;
    nombre_interets: number;
  }>;

  metrics: {
    quantite_totale_demandee: number;
    quantite_totale_acceptee: number;
    quantite_totale_recue: number;
    satisfaction_moyenne: number;
    delai_reponse_moyen: number; // en heures
  };
}

export interface DonInteresseValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  quantite_disponible?: number;
  utilisateur_existe?: boolean;
  don_actif?: boolean;
  suggestions_quantite?: number;
}

export interface DonInteresseBulkUpdate {
  uuids: string[];
  updates: DonInteresseUpdateData;
}

export interface DonInteresseWithDetails extends DonInteresse {
  don_details?: {
    images: string[];
    localisation_complete: string;
    conditions: string[];
    delai_disponibilite: string;
    createur_note: number;
  };
  utilisateur_complet?: {
    avatar: string;
    adresse_complete: string;
    historique_dons: number;
    note_moyenne: number;
    derniere_activite: string;
  };
  historique_statuts?: Array<{
    ancien_statut: string;
    nouveau_statut: string;
    date_changement: string;
    raison?: string;
  }>;
  notifications_envoyees?: Array<{
    type: string;
    date_envoi: string;
    statut: string;
  }>;
}

export interface DonInteresseConversation {
  uuid: string;
  don_interesse_uuid: string;
  expediteur_uuid: string;
  expediteur_type: "donateur" | "beneficiaire" | "moderateur";
  message: string;
  fichiers?: Array<{
    nom: string;
    url: string;
    type: string;
    taille: number;
  }>;
  lu: boolean;
  date_lu?: string;
  created_at: string;
  updated_at: string;
}

export interface DonInteresseNotification {
  uuid: string;
  don_interesse_uuid: string;
  type:
    | "nouvel_interet"
    | "confirmation"
    | "acceptation"
    | "refus"
    | "rendezvous"
    | "rappel"
    | "completion";
  destinataire_uuid: string;
  destinataire_type: string;
  sujet: string;
  contenu: string;
  statut: "en_attente" | "envoye" | "lu" | "erreur";
  methode: "email" | "sms" | "push" | "in_app";
  date_envoi?: string;
  date_lecture?: string;
  erreur?: string;
  created_at: string;
  updated_at: string;
}

export interface DonInteresseRappel {
  uuid: string;
  don_interesse_uuid: string;
  type: "premier_contact" | "confirmation" | "rendezvous" | "feedback";
  date_rappel: string;
  statut: "planifie" | "envoye" | "annule" | "erreur";
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DonInteresseFeedback {
  uuid: string;
  don_interesse_uuid: string;
  evaluateur_uuid: string;
  evaluateur_type: "donateur" | "beneficiaire";
  note: number;
  commentaire: string;
  aspects: {
    ponctualite?: number;
    communication?: number;
    etat_produit?: number;
    respect_conditions?: number;
  };
  recommandation: boolean;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface DonInteresseExportOptions {
  format: "json" | "csv" | "excel" | "pdf";
  include_conversations: boolean;
  include_feedback: boolean;
  include_details: boolean;
  filters?: DonInteresseFilterParams;
  fields?: string[];
}

export interface DonInteresseAnalytics {
  periode: {
    debut: string;
    fin: string;
  };
  volume: {
    total: number;
    par_jour: Array<{ date: string; count: number }>;
    par_heure: Array<{ heure: number; count: number }>;
  };
  conversion: {
    taux_confirmation: number;
    taux_acceptation: number;
    taux_completion: number;
    delai_moyen_etapes: {
      expression_confirmation: number;
      confirmation_acceptation: number;
      acceptation_completion: number;
    };
  };
  utilisateurs: {
    nouveaux_beneficiaires: number;
    beneficiaires_actifs: number;
    taux_retention: number;
    satisfaction_moyenne: number;
  };
  geographie: {
    top_villes: Array<{ ville: string; count: number }>;
    top_pays: Array<{ pays: string; count: number }>;
    distribution_geographique: Record<string, number>;
  };
  tendances: {
    categories_populaires: Array<{ categorie: string; croissance: number }>;
    horaires_populaires: number[];
    jours_populaires: string[];
  };
}

export interface DonInteresseMatchSuggestion {
  don_interesse_uuid: string;
  suggestions: Array<{
    type: "don_similaire" | "beneficiaire_similaire" | "alternative" | "groupe";
    don_uuid?: string;
    utilisateur_uuid?: string;
    raison: string;
    score: number;
  }>;
}

export interface DonInteresseAutoMatch {
  uuid: string;
  don_interesse_uuid: string;
  don_suggere_uuid: string;
  score: number;
  criteres: string[];
  statut: "propose" | "accepte" | "refuse" | "expire";
  date_proposition: string;
  date_decision?: string;
  created_at: string;
  updated_at: string;
}

export interface DonInteresseGroup {
  uuid: string;
  nom: string;
  description?: string;
  type: "geographique" | "thematique" | "communaute";
  membres: Array<{
    don_interesse_uuid: string;
    role: "createur" | "moderateur" | "membre";
  }>;
  regles?: string[];
  est_actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface DonInteresseAuditLog {
  uuid: string;
  don_interesse_uuid: string;
  action:
    | "creation"
    | "modification"
    | "statut_change"
    | "conversation"
    | "notification"
    | "verification";
  anciennes_valeurs?: Partial<DonInteresse>;
  nouvelles_valeurs?: Partial<DonInteresse>;
  utilisateur_uuid?: string;
  utilisateur_type?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface DonInteresseVerificationRequest {
  don_interesse_uuid: string;
  type_verification: "identite" | "situation" | "utilisation" | "complet";
  documents?: Array<{
    type: string;
    url: string;
    nom: string;
  }>;
  notes?: string;
  statut: "en_attente" | "en_cours" | "approuve" | "rejete";
  verificateur_uuid?: string;
  date_demande: string;
  date_traitement?: string;
  created_at: string;
  updated_at: string;
}
