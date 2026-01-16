// services/commandes/commande.types.ts

export interface Commande {
  // Identifiants
  uuid: string;
  reference: string;
  numero_commande: string;

  // Client
  client_uuid: string;
  client_type: "utilisateur" | "vendeur" | "agent" | "invite";
  client_email: string;
  client_telephone: string;
  client_nom: string;
  client_prenom: string;
  client_civilite?: string;

  // Adresses
  adresse_livraison: {
    nom?: string;
    prenom?: string;
    societe?: string;
    adresse: string;
    complement?: string;
    code_postal: string;
    ville: string;
    pays: string;
    telephone?: string;
    instructions?: string;
  };

  adresse_facturation?: {
    nom?: string;
    prenom?: string;
    societe?: string;
    adresse: string;
    complement?: string;
    code_postal: string;
    ville: string;
    pays: string;
    email?: string;
    telephone?: string;
  };

  // Statut
  statut:
    | "brouillon"
    | "en_attente"
    | "confirmee"
    | "en_preparation"
    | "expediee"
    | "livree"
    | "annulee"
    | "retournee"
    | "remboursee"
    | "en_attente_paiement";
  statut_paiement:
    | "non_paye"
    | "en_attente"
    | "partiellement_paye"
    | "paye"
    | "en_retard"
    | "annule"
    | "rembourse";
  statut_livraison:
    | "non_expedie"
    | "en_preparation"
    | "expedie"
    | "en_transit"
    | "livre"
    | "retour"
    | "annule";

  // Prix
  montant_total: number;
  montant_sous_total: number;
  montant_livraison: number;
  montant_reduction: number;
  montant_taxe: number;
  montant_total_ht: number;
  montant_total_ttc: number;
  devise: string;

  // Réductions et promotions
  code_promo?: string;
  promotion_uuid?: string;
  reduction_appliquee?: {
    type: "pourcentage" | "montant_fixe" | "livraison_gratuite";
    valeur: number;
    description?: string;
  };

  // Paiement
  methode_paiement?: string;
  informations_paiement?: {
    transaction_id?: string;
    autorisation_id?: string;
    mode?: string;
    date_autorisation?: string;
    banque?: string;
    dernier_4_chiffres?: string;
    type_carte?: string;
  };
  paiement_reparti?: boolean;

  // Livraison
  methode_livraison?: string;
  frais_livraison?: number;
  livraison_gratuite?: boolean;
  delai_livraison_estime?: string;
  date_livraison_prevue?: string;
  date_livraison_reelle?: string;
  transporteur?: string;
  numero_suivi?: string;
  url_suivi?: string;

  // Facturation
  facture_generee: boolean;
  numero_facture?: string;
  date_facture?: string;
  url_facture?: string;

  // Notes
  notes_client?: string;
  notes_interne?: string;

  // Options
  est_urgent: boolean;
  est_cadeau: boolean;
  message_cadeau?: string;
  emballage_cadeau?: boolean;

  // Écologie
  compensation_carbone?: boolean;
  montant_compensation?: number;
  livraison_verte?: boolean;

  // Confidentialité
  confidentiel: boolean;

  // Dates
  date_commande: string;
  date_confirmation?: string;
  date_expedition?: string;
  date_livraison?: string;
  date_annulation?: string;
  date_remboursement?: string;
  date_paiement?: string;
  date_dernier_rapprochement?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;

  // Relations
  items?: CommandeItem[];
  paiements?: Paiement[];
  retours?: Retour[];
  avis?: Avis[];
  boutique?: {
    uuid: string;
    nom: string;
    slug: string;
    logo?: string;
  };
  vendeur?: {
    uuid: string;
    nom: string;
    prenom: string;
    email: string;
  };

  // Métriques
  nombre_items: number;
  poids_total?: number;
  volume_total?: number;
  satisfaction_client?: number;
  priorite: number;
}

export interface CommandeItem {
  uuid: string;
  commande_uuid: string;
  produit_uuid?: string;
  annonce_uuid?: string;
  don_uuid?: string;
  echange_uuid?: string;
  type_item: "produit" | "annonce" | "don" | "echange";
  reference: string;
  nom: string;
  description?: string;
  quantite: number;
  prix_unitaire: number;
  prix_total: number;
  devise: string;
  taux_tva?: number;
  promotion_uuid?: string;
  reduction_pourcentage?: number;
  reduction_montant?: number;
  prix_initial?: number;
  est_en_promotion: boolean;
  sku?: string;
  variantes?: Record<string, any>;
  statut: string;
  created_at: string;
  updated_at: string;
}

export interface Paiement {
  uuid: string;
  commande_uuid: string;
  reference: string;
  montant: number;
  devise: string;
  methode: string;
  statut: "en_attente" | "accepte" | "refuse" | "annule" | "rembourse";
  transaction_id?: string;
  autorisation_id?: string;
  date_paiement: string;
  date_validation?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Retour {
  uuid: string;
  commande_uuid: string;
  item_uuid: string;
  raison: string;
  description?: string;
  statut: "en_attente" | "approuve" | "refuse" | "en_cours" | "complete";
  type: "remboursement" | "echange" | "reparation";
  quantite: number;
  montant_rembourse?: number;
  produit_echange_uuid?: string;
  date_demande: string;
  date_traitement?: string;
  date_completion?: string;
  created_at: string;
  updated_at: string;
}

export interface Avis {
  uuid: string;
  commande_uuid: string;
  client_uuid: string;
  note: number;
  commentaire: string;
  avantages?: string[];
  inconvenients?: string[];
  est_anonyme: boolean;
  est_approuve: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommandeCreateData {
  // Client
  client_uuid: string;
  client_type: "utilisateur" | "vendeur" | "agent" | "invite";
  client_email: string;
  client_telephone: string;
  client_nom: string;
  client_prenom: string;
  client_civilite?: string;

  // Adresses
  adresse_livraison: {
    nom?: string;
    prenom?: string;
    societe?: string;
    adresse: string;
    complement?: string;
    code_postal: string;
    ville: string;
    pays: string;
    telephone?: string;
    instructions?: string;
  };

  adresse_facturation?: {
    nom?: string;
    prenom?: string;
    societe?: string;
    adresse: string;
    complement?: string;
    code_postal: string;
    ville: string;
    pays: string;
    email?: string;
    telephone?: string;
  };

  // Items
  items: Array<{
    produit_uuid?: string;
    annonce_uuid?: string;
    don_uuid?: string;
    echange_uuid?: string;
    type_item: "produit" | "annonce" | "don" | "echange";
    quantite: number;
    prix_unitaire: number;
    reference?: string;
    nom?: string;
    variantes?: Record<string, any>;
  }>;

  // Paiement
  methode_paiement?: string;
  code_promo?: string;
  promotion_uuid?: string;

  // Livraison
  methode_livraison?: string;
  frais_livraison?: number;

  // Options
  notes_client?: string;
  est_cadeau?: boolean;
  message_cadeau?: string;
  emballage_cadeau?: boolean;
  compensation_carbone?: boolean;
  confidentiel?: boolean;

  // Vendeur/Boutique (pour les commandes multi-vendeurs)
  boutique_uuid?: string;
  vendeur_uuid?: string;
}

export interface CommandeUpdateData {
  statut?:
    | "brouillon"
    | "en_attente"
    | "confirmee"
    | "en_preparation"
    | "expediee"
    | "livree"
    | "annulee"
    | "retournee"
    | "remboursee"
    | "en_attente_paiement";
  statut_paiement?:
    | "non_paye"
    | "en_attente"
    | "partiellement_paye"
    | "paye"
    | "en_retard"
    | "annule"
    | "rembourse";
  statut_livraison?:
    | "non_expedie"
    | "en_preparation"
    | "expedie"
    | "en_transit"
    | "livre"
    | "retour"
    | "annule";

  // Adresses
  adresse_livraison?: {
    nom?: string;
    prenom?: string;
    societe?: string;
    adresse?: string;
    complement?: string;
    code_postal?: string;
    ville?: string;
    pays?: string;
    telephone?: string;
    instructions?: string;
  };

  adresse_facturation?: {
    nom?: string;
    prenom?: string;
    societe?: string;
    adresse?: string;
    complement?: string;
    code_postal?: string;
    ville?: string;
    pays?: string;
    email?: string;
    telephone?: string;
  };

  // Livraison
  transporteur?: string;
  numero_suivi?: string;
  url_suivi?: string;
  date_livraison_prevue?: string;
  date_livraison_reelle?: string;

  // Notes
  notes_client?: string;
  notes_interne?: string;

  // Options
  est_urgent?: boolean;
  priorite?: number;

  // Métadonnées
  metadata?: Record<string, any>;
}

export interface CommandeFilterParams {
  client_uuid?: string;
  client_type?: "utilisateur" | "vendeur" | "agent" | "invite";
  statut?: string;
  statut_paiement?: string;
  statut_livraison?: string;
  date_debut?: string;
  date_fin?: string;
  montant_min?: number;
  montant_max?: number;
  methode_paiement?: string;
  methode_livraison?: string;
  transporteur?: string;
  boutique_uuid?: string;
  vendeur_uuid?: string;
  produit_uuid?: string;
  annonce_uuid?: string;
  don_uuid?: string;
  echange_uuid?: string;
  code_promo?: string;
  promotion_uuid?: string;
  est_urgent?: boolean;
  est_cadeau?: boolean;
  confidentiel?: boolean;
  facture_generee?: boolean;
  search?: string;
  reference?: string;
  numero_commande?: string;
  numero_facture?: string;
  email?: string;
  telephone?: string;
  ville?: string;
  pays?: string;
  has_retour?: boolean;
  has_avis?: boolean;
  has_probleme?: boolean;
}

export interface CommandePaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?:
    | "date_commande"
    | "montant_total"
    | "reference"
    | "created_at"
    | "updated_at";
  sort_order?: "asc" | "desc";
  filters?: CommandeFilterParams;
}

export interface CommandeStats {
  total_commandes: number;
  commandes_par_statut: Record<string, number>;
  commandes_par_statut_paiement: Record<string, number>;
  commandes_par_statut_livraison: Record<string, number>;

  chiffre_affaires_total: number;
  chiffre_affaires_moyen: number;
  panier_moyen: number;

  commandes_par_mois: Array<{
    mois: string;
    count: number;
    montant: number;
  }>;

  top_clients: Array<{
    client_uuid: string;
    client_nom: string;
    nombre_commandes: number;
    montant_total: number;
  }>;

  top_produits: Array<{
    produit_uuid: string;
    produit_nom: string;
    quantite_vendue: number;
    chiffre_affaires: number;
  }>;

  top_vendeurs: Array<{
    vendeur_uuid: string;
    vendeur_nom: string;
    nombre_commandes: number;
    chiffre_affaires: number;
  }>;

  metrics: {
    taux_conversion: number;
    taux_abandon_panier: number;
    delai_livraison_moyen: number;
    satisfaction_client_moyenne: number;
    taux_retour: number;
  };
}

export interface CommandeValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  disponibilite_stock?: Record<
    string,
    {
      disponible: boolean;
      quantite_disponible: number;
      quantite_demandee: number;
    }
  >;
  promotions_applicables?: Array<{
    uuid: string;
    nom: string;
    reduction: number;
    type: string;
  }>;
  estimation_livraison?: {
    delai: string;
    frais: number;
    methodes_disponibles: Array<{
      nom: string;
      delai: string;
      frais: number;
    }>;
  };
}

export interface CommandeBulkUpdate {
  uuids: string[];
  updates: CommandeUpdateData;
}

export interface CommandeWithDetails extends Commande {
  items_details?: Array<
    CommandeItem & {
      produit_details?: {
        images: string[];
        categorie: string;
        marque?: string;
      };
      boutique_details?: {
        nom: string;
        slug: string;
        logo?: string;
      };
    }
  >;
  paiements_details?: Paiement[];
  retours_details?: Retour[];
  avis_details?: Avis[];
  historique?: Array<{
    date: string;
    action: string;
    utilisateur?: string;
    details?: string;
  }>;
}

export interface CommandeTracking {
  commande_uuid: string;
  numero_suivi: string;
  transporteur: string;
  url_suivi: string;
  statut: string;
  historique: Array<{
    date: string;
    statut: string;
    localisation?: string;
    description?: string;
  }>;
  date_expedition: string;
  date_livraison_prevue: string;
  date_livraison_reelle?: string;
  informations_livraison?: {
    adresse: string;
    contact: string;
    instructions?: string;
  };
}

export interface CommandeInvoice {
  uuid: string;
  commande_uuid: string;
  numero_facture: string;
  date_facture: string;
  montant_ht: number;
  montant_tva: number;
  montant_ttc: number;
  statut: "brouillon" | "generee" | "envoyee" | "payee" | "annulee";
  url_facture?: string;
  url_pdf?: string;
  envoye_le?: string;
  paye_le?: string;
  created_at: string;
  updated_at: string;
}

export interface CommandeExportOptions {
  format: "json" | "csv" | "excel" | "pdf";
  include_items: boolean;
  include_paiements: boolean;
  include_retours: boolean;
  filters?: CommandeFilterParams;
  fields?: string[];
}

export interface CommandeAnalytics {
  periode: {
    debut: string;
    fin: string;
  };
  ventes: {
    total: number;
    par_jour: Array<{ date: string; montant: number; count: number }>;
    par_heure: Array<{ heure: number; montant: number }>;
  };
  clients: {
    nouveaux: number;
    fideles: number;
    taux_retention: number;
    valeur_vie_client: number;
  };
  produits: {
    plus_vendus: Array<{
      produit: string;
      quantite: number;
      chiffre_affaires: number;
    }>;
    categories_populaires: Array<{
      categorie: string;
      chiffre_affaires: number;
    }>;
  };
  livraison: {
    delai_moyen: number;
    taux_success: number;
    problemes_frequents: string[];
  };
  paiement: {
    methodes_populaires: Array<{
      methode: string;
      pourcentage: number;
      montant_total: number;
    }>;
    taux_conversion_paiement: number;
  };
}

export interface CommandeSuggestion {
  commande: Commande;
  suggestions: Array<{
    type: "produit_similaire" | "accessoire" | "abonnement" | "promotion";
    produit_uuid?: string;
    promotion_uuid?: string;
    raison: string;
    score: number;
  }>;
}

export interface CommandeRecurring {
  uuid: string;
  client_uuid: string;
  reference: string;
  frequence:
    | "quotidien"
    | "hebdomadaire"
    | "mensuel"
    | "trimestriel"
    | "annuel";
  date_debut: string;
  date_fin?: string;
  statut: "actif" | "en_pause" | "annule" | "termine";
  items: Array<{
    produit_uuid?: string;
    type_item: string;
    quantite: number;
  }>;
  prochaine_commande?: string;
  commandes_generees: string[];
  created_at: string;
  updated_at: string;
}

export interface CommandeAuditLog {
  uuid: string;
  commande_uuid: string;
  action:
    | "creation"
    | "modification"
    | "suppression"
    | "statut_change"
    | "paiement"
    | "livraison";
  anciennes_valeurs?: Partial<Commande>;
  nouvelles_valeurs?: Partial<Commande>;
  utilisateur_uuid?: string;
  utilisateur_type?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface CommandeNotification {
  uuid: string;
  commande_uuid: string;
  type:
    | "confirmation"
    | "expedition"
    | "livraison"
    | "paiement"
    | "retour"
    | "avis"
    | "promotion";
  destinataire: string;
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
