// services/receptions/receptions.types.ts

/**
 * Types de réception
 */
export type ReceptionType =
  | "achat" // Réception d'achat
  | "retour_fournisseur" // Retour fournisseur
  | "transfert_entree" // Transfert entre sites (entrée)
  | "inventaire" // Ajustement d'inventaire (positif)
  | "don" // Don reçu
  | "echange_entree" // Échange (entrée)
  | "fabrication" // Produit fabriqué
  | "assemblage"; // Produit assemblé

/**
 * Statuts de réception
 */
export type ReceptionStatus =
  | "attente" // En attente de traitement
  | "partiellement_recu" // Partiellement reçu
  | "recu" // Complètement reçu
  | "en_verification" // En cours de vérification
  | "verifie" // Vérifié
  | "en_controle_qualite" // En contrôle qualité
  | "approuve" // Approuvé
  | "rejete" // Rejeté
  | "annule" // Annulé
  | "cloture"; // Clôturé

/**
 * Types de documents de réception
 */
export type DocumentType =
  | "bon_livraison" // Bon de livraison
  | "facture" // Facture
  | "commande_achat" // Commande d'achat
  | "bon_retour" // Bon de retour
  | "ordre_transfert" // Ordre de transfert
  | "bon_reception" // Bon de réception interne
  | "autre"; // Autre type de document

/**
 * Condition de l'article reçu
 */
export type ArticleCondition =
  | "neuf" // Neuf
  | "refraichissement" // Rafraîchi/Reconditionné
  | "occasion" // Occasion
  | "endommage" // Endommagé
  | "defectueux" // Défectueux
  | "incomplet"; // Incomplet

/**
 * Unité de mesure pour la réception
 */
export type UniteMesure =
  | "unite" // Unité
  | "kilogramme" // kg
  | "gramme" // g
  | "litre" // L
  | "millilitre" // mL
  | "metre" // m
  | "centimetre" // cm
  | "metre_carre" // m²
  | "metre_cube" // m³
  | "colis" // Colis
  | "palette"; // Palette

/**
 * Interface principale pour une réception
 */
export interface Reception {
  // Identifiants
  uuid: string;
  numero_reception: string; // Numéro unique auto-généré
  reference_externe?: string; // Référence externe (N° BL, facture, etc.)

  // Informations générales
  type: ReceptionType;
  statut: ReceptionStatus;
  date_reception: string; // Date de réception physique
  date_creation: string;
  date_modification?: string;
  date_cloture?: string;

  // Source/Destination
  fournisseur_uuid?: string; // UUID du fournisseur
  fournisseur_nom?: string;
  entrepot_source_uuid?: string; // Pour les transferts
  entrepot_source_nom?: string;
  entrepot_destination_uuid: string; // Entrepôt de destination
  entrepot_destination_nom?: string;

  // Documents
  document_type?: DocumentType;
  numero_document?: string;
  date_document?: string;
  fichiers_joints?: Array<{
    nom: string;
    url: string;
    type: string;
    taille: number;
  }>;

  // Transport
  transporteur?: string;
  numero_transport?: string;
  date_expedition?: string;
  date_livraison_prevue?: string;
  date_livraison_reelle?: string;

  // Personnes concernées
  createur_uuid: string;
  createur_nom?: string;
  receveur_uuid?: string; // Personne qui a physiquement reçu
  receveur_nom?: string;
  controleur_qualite_uuid?: string;
  controleur_qualite_nom?: string;

  // Métadonnées
  notes?: string;
  priorite: "basse" | "normale" | "haute" | "urgente";
  tags?: string[];
  metadata?: Record<string, any>;

  // Articles
  articles: ArticleReception[];
  articles_count: number;
  articles_recus_count: number;

  // Totaux
  total_articles_attendus: number;
  total_articles_recus: number;
  total_valeur_attendue: number; // Valeur totale attendue
  total_valeur_recue: number; // Valeur totale reçue

  // Validations
  validation_requise: boolean;
  validation_statut?: "en_attente" | "valide" | "invalide";
  validation_notes?: string;

  // Contrôle qualité
  controle_qualite_requis: boolean;
  controle_qualite_statut?: "non_fait" | "en_cours" | "reussi" | "echec";
  controle_qualite_notes?: string;

  // Flags
  urgent: boolean;
  bloque: boolean; // Si bloqué pour traitement manuel
  exportable: boolean; // Si prêt pour export ERP

  // Historique
  historique: Array<{
    date: string;
    action: string;
    utilisateur: string;
    details?: string;
  }>;
}

/**
 * Article dans une réception
 */
export interface ArticleReception {
  uuid: string;
  reception_uuid: string;

  // Article
  article_uuid: string;
  article_code?: string;
  article_nom: string;
  article_description?: string;
  article_categorie?: string;

  // Quantités
  quantite_commandee: number;
  quantite_recue: number;
  quantite_acceptee: number;
  quantite_rejetee: number;
  quantite_en_attente: number; // = commandée - reçue

  // Unités
  unite: UniteMesure;
  poids_unitaire?: number; // kg
  volume_unitaire?: number; // m³

  // Prix et valeur
  prix_unitaire_ht?: number;
  prix_unitaire_ttc?: number;
  devise?: string;
  taux_tva?: number;

  // Condition
  condition: ArticleCondition;
  condition_details?: string;

  // Contrôle qualité
  controle_qualite_fait: boolean;
  controle_qualite_resultat?: "conforme" | "non_conforme" | "a_retravailler";
  controle_qualite_notes?: string;
  echantillon_preleve?: boolean;

  // Emplacement
  emplacement_uuid?: string; // Emplacement dans l'entrepôt
  emplacement_code?: string;
  zone_stockage?: string;

  // Lot/Numéros de série
  numero_lot?: string;
  date_fabrication?: string;
  date_peremption?: string;
  numeros_serie?: string[];

  // Caractéristiques
  couleur?: string;
  taille?: string;
  variante?: string;

  // Statut
  statut: "en_attente" | "partiellement_recu" | "recu" | "rejete";

  // Métadonnées
  notes?: string;
  metadata?: Record<string, any>;

  // Dates
  date_reception?: string;
  date_verification?: string;
}

/**
 * Données pour créer une réception
 */
export interface ReceptionCreateData {
  type: ReceptionType;
  entrepot_destination_uuid: string;

  // Informations optionnelles
  reference_externe?: string;
  document_type?: DocumentType;
  numero_document?: string;
  date_document?: string;

  fournisseur_uuid?: string;
  entrepot_source_uuid?: string;

  transporteur?: string;
  numero_transport?: string;
  date_expedition?: string;
  date_livraison_prevue?: string;

  notes?: string;
  priorite?: "basse" | "normale" | "haute" | "urgente";
  tags?: string[];

  validation_requise?: boolean;
  controle_qualite_requis?: boolean;

  // Articles
  articles: Array<{
    article_uuid: string;
    quantite_commandee: number;
    prix_unitaire_ht?: number;
    prix_unitaire_ttc?: number;
    devise?: string;
    taux_tva?: number;
    numero_lot?: string;
    date_peremption?: string;
    condition?: ArticleCondition;
  }>;
}

/**
 * Données pour mettre à jour une réception
 */
export interface ReceptionUpdateData {
  reference_externe?: string;
  document_type?: DocumentType;
  numero_document?: string;
  date_document?: string;

  transporteur?: string;
  numero_transport?: string;
  date_livraison_prevue?: string;

  notes?: string;
  priorite?: "basse" | "normale" | "haute" | "urgente";
  tags?: string[];

  validation_requise?: boolean;
  controle_qualite_requis?: boolean;

  receveur_uuid?: string;
  controleur_qualite_uuid?: string;

  metadata?: Record<string, any>;
}

/**
 * Données pour recevoir des articles
 */
export interface RecevoirArticlesData {
  reception_uuid: string;
  articles: Array<{
    article_reception_uuid: string;
    quantite_recue: number;
    condition?: ArticleCondition;
    condition_details?: string;
    numero_lot?: string;
    numeros_serie?: string[];
    notes?: string;
  }>;
  date_reception?: string;
  receveur_uuid?: string;
}

/**
 * Données pour vérifier des articles
 */
export interface VerifierArticlesData {
  reception_uuid: string;
  articles: Array<{
    article_reception_uuid: string;
    quantite_acceptee: number;
    quantite_rejetee: number;
    raison_rejet?: string;
    notes?: string;
  }>;
  validation_notes?: string;
  controleur_uuid?: string;
}

/**
 * Données pour le contrôle qualité
 */
export interface ControleQualiteData {
  reception_uuid: string;
  articles: Array<{
    article_reception_uuid: string;
    resultat: "conforme" | "non_conforme" | "a_retravailler";
    notes?: string;
    echantillon_preleve?: boolean;
  }>;
  controle_notes?: string;
  controleur_qualite_uuid?: string;
}

/**
 * Paramètres de filtrage pour les réceptions
 */
export interface ReceptionFilterParams {
  type?: ReceptionType;
  statut?: ReceptionStatus;
  document_type?: DocumentType;

  fournisseur_uuid?: string;
  entrepot_destination_uuid?: string;
  entrepot_source_uuid?: string;

  createur_uuid?: string;
  receveur_uuid?: string;

  date_reception_debut?: string;
  date_reception_fin?: string;
  date_creation_debut?: string;
  date_creation_fin?: string;

  numero_reception?: string;
  reference_externe?: string;
  numero_document?: string;

  priorite?: "basse" | "normale" | "haute" | "urgente";
  urgent?: boolean;
  bloque?: boolean;

  validation_requise?: boolean;
  validation_statut?: "en_attente" | "valide" | "invalide";

  controle_qualite_requis?: boolean;
  controle_qualite_statut?: "non_fait" | "en_cours" | "reussi" | "echec";

  article_uuid?: string; // Filtre par article
  article_code?: string;

  search?: string; // Recherche textuelle

  // Tri
  sort_by?:
    | "date_reception"
    | "date_creation"
    | "numero_reception"
    | "priorite"
    | "statut";
  sort_order?: "asc" | "desc";
}

/**
 * Statistiques des réceptions
 */
export interface ReceptionStats {
  // Vue d'ensemble
  total_receptions: number;
  receptions_par_statut: Record<ReceptionStatus, number>;
  receptions_par_type: Record<ReceptionType, number>;

  // Volumes
  articles_recus_total: number;
  articles_rejetes_total: number;
  valeur_totale_recue: number;

  // Temporalité
  receptions_par_mois: Array<{
    mois: string;
    count: number;
    articles: number;
    valeur: number;
  }>;

  // Fournisseurs
  top_fournisseurs: Array<{
    fournisseur_uuid: string;
    fournisseur_nom: string;
    receptions: number;
    articles: number;
    valeur: number;
  }>;

  // Articles
  top_articles: Array<{
    article_uuid: string;
    article_nom: string;
    receptions: number;
    quantite_recue: number;
  }>;

  // Performance
  delai_moyen_reception: number; // Jours entre commande et réception
  taux_reception_complete: number; // % de réceptions complètement reçues
  taux_rejet_moyen: number; // % d'articles rejetés

  // Métriques qualité
  controles_qualite_reussis: number;
  controles_qualite_echecs: number;
  taux_conformite: number;
}

/**
 * Rapport de réception
 */
export interface ReceptionReport {
  reception_uuid: string;
  periode: {
    debut: string;
    fin: string;
  };

  // Synthèse
  total_receptions: number;
  receptions_completes: number;
  receptions_en_cours: number;
  receptions_en_retard: number;

  // Articles
  articles_recus_total: number;
  articles_rejetes_total: number;
  articles_en_attente: number;

  // Valeur
  valeur_totale_recue: number;
  valeur_moyenne_reception: number;
  valeur_max_reception: number;
  valeur_min_reception: number;

  // Fournisseurs
  receptions_par_fournisseur: Array<{
    fournisseur: string;
    receptions: number;
    articles: number;
    valeur: number;
    taux_rejet: number;
  }>;

  // Problèmes courants
  problemes_frequents: Array<{
    type: string;
    count: number;
    description: string;
  }>;

  // Recommandations
  recommendations?: Array<{
    type: "amelioration" | "optimisation" | "correction";
    titre: string;
    description: string;
    priorite: "basse" | "moyenne" | "haute";
  }>;
}

/**
 * Alerte de réception
 */
export interface ReceptionAlert {
  uuid: string;
  type:
    | "retard"
    | "quantite_insuffisante"
    | "qualite"
    | "document_manquant"
    | "urgence";
  titre: string;
  message: string;

  reception_uuid: string;
  reception_numero?: string;

  priorite: "basse" | "moyenne" | "haute" | "critique";
  statut: "active" | "en_traitement" | "resolue" | "ignoree";

  date_creation: string;
  date_resolution?: string;
  date_echeance?: string;

  assignee_uuid?: string;
  assignee_nom?: string;

  actions_requises?: string[];
  metadata?: Record<string, any>;
}

/**
 * Fournisseur pour les réceptions
 */
export interface FournisseurReception {
  uuid: string;
  nom: string;
  code?: string;
  raison_sociale?: string;

  contact_principal?: {
    nom: string;
    email: string;
    telephone: string;
  };

  adresse?: {
    rue: string;
    code_postal: string;
    ville: string;
    pays: string;
  };

  informations_commerciales?: {
    numero_tva?: string;
    siret?: string;
    code_naf?: string;
  };

  performance?: {
    delai_livraison_moyen: number;
    taux_satisfaction: number;
    taux_rejet: number;
    nombre_receptions: number;
    derniere_reception?: string;
  };

  statut: "actif" | "inactif" | "suspendu";
  notes?: string;

  date_creation: string;
  date_modification?: string;
}

/**
 * Entrepôt pour les réceptions
 */
export interface EntrepotReception {
  uuid: string;
  nom: string;
  code: string;

  adresse?: {
    rue: string;
    code_postal: string;
    ville: string;
    pays: string;
  };

  contact?: {
    responsable: string;
    email: string;
    telephone: string;
  };

  capacite?: {
    superficie: number; // m²
    volume: number; // m³
    poids_max: number; // kg
  };

  equipements?: string[];
  heures_ouverture?: {
    lundi: { ouverture: string; fermeture: string };
    mardi: { ouverture: string; fermeture: string };
    mercredi: { ouverture: string; fermeture: string };
    jeudi: { ouverture: string; fermeture: string };
    vendredi: { ouverture: string; fermeture: string };
    samedi: { ouverture: string; fermeture: string };
    dimanche: { ouverture: string; fermeture: string };
  };

  statut: "actif" | "inactif" | "maintenance";

  date_creation: string;
  date_modification?: string;
}

/**
 * Emplacement dans l'entrepôt
 */
export interface EmplacementEntrepot {
  uuid: string;
  entrepot_uuid: string;
  code: string;
  nom?: string;

  type:
    | "rayon"
    | "etagere"
    | "palette"
    | "reserve"
    | "quarantaine"
    | "preparation";
  zone: string;
  allee?: string;
  niveau?: number;
  position?: string;

  capacite: {
    hauteur_max?: number; // cm
    poids_max?: number; // kg
    volume_max?: number; // m³
    nombre_articles_max?: number;
  };

  caracteristiques?: {
    temperature_controlee?: boolean;
    temperature_min?: number;
    temperature_max?: number;
    humidite_controlee?: boolean;
    securise?: boolean;
  };

  statut:
    | "libre"
    | "partiellement_occupe"
    | "occupe"
    | "bloque"
    | "maintenance";
  occupation?: {
    articles_count: number;
    pourcentage_occupation: number;
    poids_total?: number;
    volume_total?: number;
  };

  notes?: string;
  date_creation: string;
  date_modification?: string;
}

/**
 * Transfert entre entrepôts
 */
export interface TransfertReception {
  uuid: string;
  numero_transfert: string;

  entrepot_source_uuid: string;
  entrepot_source_nom?: string;
  entrepot_destination_uuid: string;
  entrepot_destination_nom?: string;

  statut:
    | "en_preparation"
    | "en_cours"
    | "partiellement_recu"
    | "recu"
    | "annule";

  articles: Array<{
    article_uuid: string;
    article_nom: string;
    quantite_transferee: number;
    quantite_recue: number;
    unite: UniteMesure;
  }>;

  date_creation: string;
  date_transfert_prevue?: string;
  date_transfert_reelle?: string;
  date_reception_prevue?: string;
  date_reception_reelle?: string;

  responsable_uuid?: string;
  responsable_nom?: string;
  transporteur?: string;

  notes?: string;
  metadata?: Record<string, any>;
}

/**
 * Paramètres d'import de réceptions
 */
export interface ImportReceptionsData {
  format: "csv" | "json" | "xml";
  data: any;
  options?: {
    update_existing?: boolean;
    skip_errors?: boolean;
    validate_only?: boolean;
    create_missing_items?: boolean;
  };
}

/**
 * Options d'export de réceptions
 */
export interface ExportReceptionsOptions {
  format: "csv" | "json" | "excel" | "pdf";
  periode?: {
    debut: string;
    fin: string;
  };
  types?: ReceptionType[];
  statuts?: ReceptionStatus[];
  entrepot_uuid?: string;
  fournisseur_uuid?: string;
  include_articles?: boolean;
  include_documents?: boolean;
  fields?: string[];
}

/**
 * Planification de réception
 */
export interface PlanificationReception {
  uuid: string;
  titre: string;
  description?: string;

  fournisseur_uuid?: string;
  fournisseur_nom?: string;
  entrepot_destination_uuid: string;
  entrepot_destination_nom?: string;

  articles_prevus: Array<{
    article_uuid: string;
    article_nom: string;
    quantite_prevue: number;
    unite: UniteMesure;
    priorite: "basse" | "normale" | "haute";
  }>;

  date_reception_prevue: string;
  heure_reception_prevue?: string;
  duree_estimee?: number; // En heures

  statut: "planifie" | "confirme" | "en_cours" | "termine" | "annule";

  ressources_requises?: {
    personnel?: number;
    chariots?: number;
    quai_dechargement?: string;
  };

  notes?: string;
  metadata?: Record<string, any>;

  date_creation: string;
  date_modification?: string;
}

/**
 * Workflow de réception
 */
export interface WorkflowReception {
  uuid: string;
  nom: string;
  description?: string;

  etapes: Array<{
    ordre: number;
    nom: string;
    type:
      | "reception"
      | "verification"
      | "controle_qualite"
      | "mise_en_stock"
      | "validation";
    responsable_role?: string;
    duree_estimee?: number; // En minutes
    conditions_entree?: string[];
    conditions_sortie?: string[];
    actions?: string[];
  }>;

  statut: "actif" | "inactif" | "test";
  applicable_pour?: ReceptionType[];

  date_creation: string;
  date_modification?: string;
}
