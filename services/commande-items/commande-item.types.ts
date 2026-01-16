// services/commandes/commande-item.types.ts

export interface CommandeItem {
  // Identifiants
  uuid: string;
  commande_uuid: string;

  // Référence au produit/annonce/don/échange
  produit_uuid?: string;
  annonce_uuid?: string;
  don_uuid?: string;
  echange_uuid?: string;

  // Type d'item
  type_item:
    | "produit"
    | "annonce"
    | "don"
    | "echange"
    | "service"
    | "abonnement"
    | "frais";

  // Informations de base
  reference: string;
  nom: string;
  description?: string;

  // Prix et quantité
  quantite: number;
  prix_unitaire: number;
  prix_total: number;
  devise: string;

  // Taxes
  taux_tva?: number;
  montant_tva?: number;
  prix_unitaire_ht?: number;
  prix_total_ht?: number;
  prix_unitaire_ttc?: number;
  prix_total_ttc?: number;

  // Réductions et promotions
  promotion_uuid?: string;
  reduction_pourcentage?: number;
  reduction_montant?: number;
  prix_initial?: number;
  est_en_promotion: boolean;

  // Informations spécifiques au produit
  sku?: string;
  code_barre?: string;
  variantes?: Record<string, any>; // Ex: { taille: "M", couleur: "Rouge" }
  caracteristiques?: Record<string, any>;

  // Livraison
  poids?: number; // en kg
  dimensions?: {
    longueur?: number; // en cm
    largeur?: number; // en cm
    hauteur?: number; // en cm
  };
  volume?: number; // en m³

  // Statut
  statut:
    | "en_attente"
    | "prepare"
    | "expedie"
    | "livre"
    | "annule"
    | "retourne"
    | "rembourse";
  statut_livraison?:
    | "non_expedie"
    | "en_preparation"
    | "expedie"
    | "en_transit"
    | "livre"
    | "retour"
    | "annule";
  statut_paiement?: "en_attente" | "paye" | "partiel" | "en_retard" | "annule";

  // Dates
  date_preparation?: string;
  date_expedition?: string;
  date_livraison_prevue?: string;
  date_livraison_reelle?: string;
  date_retour?: string;
  date_remboursement?: string;

  // Informations de suivi
  numero_suivi?: string;
  transporteur?: string;
  url_suivi?: string;

  // Boutique/Vendeur
  boutique_uuid?: string;
  vendeur_uuid?: string;
  vendeur_nom?: string;

  // Stock et inventaire
  emplacement_stock?: string;
  gestion_stock: boolean;
  stock_reserve: boolean;

  // Retour et garantie
  accepte_retour: boolean;
  delai_retour?: number; // en jours
  garantie?: {
    duree?: number; // en mois
    description?: string;
    conditions?: string[];
  };

  // Notes et commentaires
  notes_interne?: string;
  commentaire_client?: string;
  avis_client?: {
    note?: number;
    commentaire?: string;
    date?: string;
  };

  // Métadonnées
  metadata?: Record<string, any>;
  tags?: string[];

  // Dates système
  created_at: string;
  updated_at: string;
  deleted_at?: string;

  // Relations (peuvent être chargées)
  produit?: {
    uuid: string;
    nom: string;
    slug: string;
    image_principale: string;
    boutique_nom: string;
    categorie_nom?: string;
  };

  annonce?: {
    uuid: string;
    titre: string;
    description: string;
    images?: string[];
    type: string;
  };

  don?: {
    uuid: string;
    titre: string;
    description: string;
    image_principale?: string;
    quantite_disponible: number;
  };

  echange?: {
    uuid: string;
    titre: string;
    description: string;
    type: string;
    images?: string[];
  };

  promotion?: {
    uuid: string;
    nom: string;
    code: string;
    reduction: number;
    type_reduction: "pourcentage" | "montant_fixe";
  };

  boutique?: {
    uuid: string;
    nom: string;
    slug: string;
    logo?: string;
  };
}

export interface CommandeItemCreateData {
  // Références obligatoires
  commande_uuid: string;
  type_item:
    | "produit"
    | "annonce"
    | "don"
    | "echange"
    | "service"
    | "abonnement"
    | "frais";

  // Référence au produit/annonce/don/échange (selon type_item)
  produit_uuid?: string;
  annonce_uuid?: string;
  don_uuid?: string;
  echange_uuid?: string;

  // Informations de base
  quantite: number;
  prix_unitaire: number;
  devise: string;

  // Informations supplémentaires
  reference?: string;
  nom?: string;
  description?: string;
  sku?: string;
  variantes?: Record<string, any>;
  caracteristiques?: Record<string, any>;

  // Taxes
  taux_tva?: number;

  // Réductions
  promotion_uuid?: string;
  reduction_pourcentage?: number;
  reduction_montant?: number;

  // Livraison
  poids?: number;
  dimensions?: {
    longueur?: number;
    largeur?: number;
    hauteur?: number;
  };

  // Métadonnées
  notes_interne?: string;
  metadata?: Record<string, any>;
  tags?: string[];

  // Options
  accepte_retour?: boolean;
  delai_retour?: number;
  garantie?: {
    duree?: number;
    description?: string;
    conditions?: string[];
  };
}

export interface CommandeItemUpdateData {
  quantite?: number;
  prix_unitaire?: number;
  taux_tva?: number;
  statut?:
    | "en_attente"
    | "prepare"
    | "expedie"
    | "livre"
    | "annule"
    | "retourne"
    | "rembourse";
  statut_livraison?:
    | "non_expedie"
    | "en_preparation"
    | "expedie"
    | "en_transit"
    | "livre"
    | "retour"
    | "annule";
  statut_paiement?: "en_attente" | "paye" | "partiel" | "en_retard" | "annule";

  // Livraison
  date_preparation?: string;
  date_expedition?: string;
  date_livraison_prevue?: string;
  date_livraison_reelle?: string;
  numero_suivi?: string;
  transporteur?: string;
  url_suivi?: string;

  // Retour
  date_retour?: string;
  date_remboursement?: string;

  // Notes
  notes_interne?: string;
  commentaire_client?: string;

  // Stock
  emplacement_stock?: string;
  gestion_stock?: boolean;
  stock_reserve?: boolean;

  // Métadonnées
  metadata?: Record<string, any>;
  tags?: string[];

  // Avis client
  avis_client?: {
    note?: number;
    commentaire?: string;
    date?: string;
  };
}

export interface CommandeItemFilterParams {
  commande_uuid?: string;
  produit_uuid?: string;
  annonce_uuid?: string;
  don_uuid?: string;
  echange_uuid?: string;
  boutique_uuid?: string;
  vendeur_uuid?: string;
  type_item?:
    | "produit"
    | "annonce"
    | "don"
    | "echange"
    | "service"
    | "abonnement"
    | "frais";
  statut?:
    | "en_attente"
    | "prepare"
    | "expedie"
    | "livre"
    | "annule"
    | "retourne"
    | "rembourse";
  statut_livraison?:
    | "non_expedie"
    | "en_preparation"
    | "expedie"
    | "en_transit"
    | "livre"
    | "retour"
    | "annule";
  statut_paiement?: "en_attente" | "paye" | "partiel" | "en_retard" | "annule";
  promotion_uuid?: string;
  est_en_promotion?: boolean;
  accepte_retour?: boolean;
  date_debut?: string;
  date_fin?: string;
  search?: string;
  reference?: string;
  sku?: string;
  code_barre?: string;
  tags?: string[];
  has_avis?: boolean;
  has_retour?: boolean;
  has_probleme_livraison?: boolean;
}

export interface CommandeItemPaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: "created_at" | "updated_at" | "prix_total" | "quantite" | "nom";
  sort_order?: "asc" | "desc";
  filters?: CommandeItemFilterParams;
}

export interface CommandeItemStats {
  total_items: number;
  items_par_type: Record<string, number>;
  items_par_statut: Record<string, number>;
  items_par_statut_livraison: Record<string, number>;
  items_par_statut_paiement: Record<string, number>;

  quantite_totale: number;
  valeur_totale: number;
  valeur_moyenne_par_item: number;
  quantite_moyenne_par_item: number;

  items_en_promotion: number;
  items_avec_retour: number;
  items_avec_avis: number;

  meilleurs_produits: Array<{
    produit_uuid: string;
    nom: string;
    quantite_vendue: number;
    chiffre_affaires: number;
  }>;

  categories_populaires: Array<{
    categorie: string;
    quantite: number;
    chiffre_affaires: number;
  }>;

  vendeurs_performants: Array<{
    vendeur_uuid: string;
    vendeur_nom: string;
    nombre_items: number;
    chiffre_affaires: number;
  }>;
}

export interface CommandeItemValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  stock_disponible?: number;
  prix_valide?: boolean;
  promotions_applicables?: Array<{
    uuid: string;
    nom: string;
    reduction: number;
    type: string;
  }>;
}

export interface CommandeItemBulkUpdate {
  uuids: string[];
  updates: CommandeItemUpdateData;
}

export interface CommandeItemWithDetails extends CommandeItem {
  commande?: {
    uuid: string;
    reference: string;
    statut: string;
    client_nom: string;
    client_email: string;
  };
  produit_details?: {
    images: string[];
    categorie: string;
    marque?: string;
    specifications: Record<string, any>;
  };
  disponibilite_stock?: {
    disponible: number;
    reserve: number;
    en_rupture: boolean;
  };
}

export interface CommandeItemRetourRequest {
  item_uuid: string;
  raison: string;
  description?: string;
  photos?: string[]; // URLs des photos
  quantite: number;
  type_retour: "remboursement" | "echange" | "reparation";
  preferences?: {
    remboursement_vers?: string; // compte bancaire, crédit boutique, etc.
    echange_pour?: string; // produit_uuid
    adresse_retour?: string;
  };
}

export interface CommandeItemRetour {
  uuid: string;
  item_uuid: string;
  commande_uuid: string;
  raison: string;
  description?: string;
  quantite: number;
  type_retour: "remboursement" | "echange" | "reparation";
  statut:
    | "en_attente"
    | "approuve"
    | "refuse"
    | "en_cours"
    | "complete"
    | "annule";
  montant_rembourse?: number;
  produit_echange_uuid?: string;
  photos?: string[];
  notes_interne?: string;
  date_demande: string;
  date_traitement?: string;
  date_completion?: string;
  traite_par?: string;
  created_at: string;
  updated_at: string;
}

export interface CommandeItemAvis {
  uuid: string;
  item_uuid: string;
  commande_uuid: string;
  utilisateur_uuid: string;
  note: number;
  commentaire: string;
  avantages?: string[];
  inconvenients?: string[];
  photos?: string[];
  est_verifie_achat: boolean;
  est_public: boolean;
  est_approuve: boolean;
  likes: number;
  reponses?: Array<{
    uuid: string;
    contenu: string;
    est_vendeur: boolean;
    date_publication: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface CommandeItemTracking {
  item_uuid: string;
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

export interface CommandeItemStockMovement {
  uuid: string;
  item_uuid: string;
  produit_uuid?: string;
  type:
    | "reservation"
    | "liberation"
    | "ajustement"
    | "rupture"
    | "reapprovisionnement";
  quantite: number;
  quantite_avant: number;
  quantite_apres: number;
  raison: string;
  reference?: string; // référence commande, bon de livraison, etc.
  emplacement?: string;
  utilisateur_uuid?: string;
  notes?: string;
  created_at: string;
}

export interface CommandeItemPriceHistory {
  uuid: string;
  item_uuid: string;
  ancien_prix: number;
  nouveau_prix: number;
  type_changement: "manuel" | "promotion" | "ajustement" | "taxe";
  raison?: string;
  promotion_uuid?: string;
  utilisateur_uuid?: string;
  created_at: string;
}

export interface CommandeItemImportData {
  commande_reference: string;
  produit_sku?: string;
  produit_nom?: string;
  annonce_reference?: string;
  don_reference?: string;
  echange_reference?: string;
  quantite: number;
  prix_unitaire: number;
  devise: string;
  taux_tva?: number;
  reference?: string;
  variantes?: Record<string, any>;
}

export interface CommandeItemExportOptions {
  format: "json" | "csv" | "excel" | "pdf";
  include_relations: boolean;
  include_stats: boolean;
  filters?: CommandeItemFilterParams;
  fields?: string[];
}

export interface CommandeItemSuggestion {
  item: CommandeItem;
  suggestions: Array<{
    type: "produit_similaire" | "accessoire" | "promotion" | "abonnement";
    produit_uuid?: string;
    promotion_uuid?: string;
    raison: string;
    score: number;
  }>;
}

export interface CommandeItemBundle {
  uuid: string;
  nom: string;
  description?: string;
  items: Array<{
    item_uuid: string;
    quantite: number;
    prix_bundle?: number; // Prix spécifique dans le bundle
  }>;
  prix_total_bundle: number;
  reduction_bundle?: number;
  est_actif: boolean;
  date_debut?: string;
  date_fin?: string;
  created_at: string;
  updated_at: string;
}

export interface CommandeItemAnalytics {
  periode: {
    debut: string;
    fin: string;
  };
  vente_totale: {
    quantite: number;
    chiffre_affaires: number;
    moyenne_panier: number;
  };
  tendances: {
    items_populaires: Array<{
      item: CommandeItem;
      evolution: number; // pourcentage
    }>;
    categories_croissantes: Array<{
      categorie: string;
      croissance: number;
    }>;
  };
  performances: {
    taux_conversion: number;
    taux_retour: number;
    satisfaction_client: number; // note moyenne
  };
  predictions: {
    demande_prevue: Array<{
      item_uuid: string;
      demande_estimee: number;
      confiance: number; // 0-1
    }>;
    stock_recommande: Array<{
      produit_uuid: string;
      quantite_recommandee: number;
      raison: string;
    }>;
  };
}

export interface CommandeItemAuditLog {
  uuid: string;
  item_uuid: string;
  action:
    | "creation"
    | "modification"
    | "suppression"
    | "statut_change"
    | "quantite_modifiee"
    | "prix_modifie";
  anciennes_valeurs?: Partial<CommandeItem>;
  nouvelles_valeurs?: Partial<CommandeItem>;
  utilisateur_uuid?: string;
  utilisateur_type?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}
