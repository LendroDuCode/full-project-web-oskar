// types/echange.types.ts
// ou
// services/echanges/echange.types.ts

import type { BaseEntity, StatusType } from "./base.entity";

// =============================================
// TYPES PRINCIPAUX
// =============================================

/**
 * Type principal pour les échanges
 */
export interface Echange extends BaseEntity {
  // Informations de base
  titre: string;
  description?: string;
  statut: EchangeStatut;
  categorie_uuid: string;
  type_echange: EchangeType;

  // Informations de contact
  numero: string;
  email?: string;
  adresse?: string;
  ville_uuid?: string;
  pays_uuid?: string;

  // Objets de l'échange
  objetPropose?: string;
  objetDemande?: string;
  montantPropose?: number;
  montantDemande?: number;
  prix_estime?: string;

  // Caractéristiques
  quantite?: number;
  unite_mesure?: string;
  condition_objet?: ObjetCondition;
  garantie_disponible?: boolean;
  garantie_duree?: number; // en mois
  livraison_incluse?: boolean;

  // Images et médias
  image?: string;
  images?: string[];
  video_url?: string;

  // État et visibilité
  is_featured?: boolean;
  is_urgent?: boolean;
  is_negotiable?: boolean;
  vue_count?: number;
  like_count?: number;
  share_count?: number;

  // Dates importantes
  date_disponibilite?: string;
  date_expiration?: string;
  date_acceptation?: string;
  date_finalisation?: string;

  // Relations
  utilisateur_uuid: string;
  acheteur_uuid?: string;
  transaction_uuid?: string;
  categorie?: CategorieEchange;
  ville?: Ville;
  pays?: Pays;
  utilisateur?: UtilisateurEchange;
  acheteur?: UtilisateurEchange;
  evaluations?: Evaluation[];
  messages?: MessageEchange[];

  // Métadonnées supplémentaires
  tags?: string[];
  reference?: string;
  code_promo?: string;
  notes_admin?: string;

  // Statistiques
  duree_publication?: number; // en jours
  taux_reponse?: number;
  taux_success?: number;
}

/**
 * Type pour les statuts d'échange
 */
export type EchangeStatut =
  | "en_attente" // En attente de validation
  | "actif" // Publié et visible
  | "en_cours" // Échange en cours
  | "reserve" // Réservé par un acheteur
  | "termine" // Échange terminé avec succès
  | "annule" // Échange annulé
  | "expire" // Offre expirée
  | "suspendu" // Suspendu temporairement
  | "archive"; // Archivé

/**
 * Type pour les types d'échange
 */
export type EchangeType =
  | "vente" // Vente simple
  | "achat" // Achat
  | "troc" // Échange sans argent
  | "don" // Don
  | "location" // Location
  | "pret" // Prêt
  | "service" // Prestation de service
  | "mixte"; // Mixte (argent + objet)

/**
 * Type pour les conditions des objets
 */
export type ObjetCondition =
  | "neuf" // Jamais utilisé
  | "tres_bon_etat" // Très bon état
  | "bon_etat" // Bon état
  | "etat_moyen" // État moyen
  | "a_renover" // À rénover
  | "pour_pieces"; // Pour pièces détachées

// =============================================
// TYPES POUR LES RELATIONS
// =============================================

/**
 * Type pour les catégories d'échange
 */
export interface CategorieEchange extends BaseEntity {
  nom: string;
  description?: string;
  icon?: string;
  couleur?: string;
  parent_uuid?: string;
  ordre?: number;
  statut: StatusType;
  sous_categories?: CategorieEchange[];
}

/**
 * Type pour les utilisateurs dans le contexte d'échange
 */
export interface UtilisateurEchange {
  uuid: string;
  nom: string;
  prenoms: string;
  email: string;
  telephone?: string;
  photo_profil?: string;
  note_moyenne?: number;
  echange_count?: number;
  created_at?: string;
}

/**
 * Type pour les évaluations
 */
export interface Evaluation extends BaseEntity {
  echange_uuid: string;
  evaluateur_uuid: string;
  evalue_uuid: string;
  note: number; // 1 à 5
  commentaire?: string;
  type: "vendeur" | "acheteur";
  reponse?: string;
  date_reponse?: string;
  evaluateur?: UtilisateurEchange;
  evalue?: UtilisateurEchange;
}

/**
 * Type pour les messages d'échange
 */
export interface MessageEchange extends BaseEntity {
  echange_uuid: string;
  expediteur_uuid: string;
  destinataire_uuid: string;
  message: string;
  is_lu: boolean;
  date_lu?: string;
  type: "texte" | "image" | "fichier" | "offre";
  metadata?: Record<string, any>;
  expediteur?: UtilisateurEchange;
  destinataire?: UtilisateurEchange;
}

// =============================================
// TYPES POUR LES VILLES ET PAYS
// =============================================

/**
 * Type simplifié pour la ville
 */
export interface Ville {
  uuid: string;
  nom: string;
  code_postal?: string;
  pays_uuid: string;
}

/**
 * Type simplifié pour le pays
 */
export interface Pays {
  uuid: string;
  nom: string;
  code: string;
  code_drapeau?: string;
}

// =============================================
// TYPES POUR LES FORMULAIRES
// =============================================

/**
 * Type pour le formulaire de création d'échange
 */
export interface CreateEchangeData {
  titre: string;
  description?: string;
  categorie_uuid: string;
  type_echange: EchangeType;
  numero: string;
  email?: string;
  adresse?: string;
  ville_uuid?: string;
  pays_uuid?: string;
  objetPropose?: string;
  objetDemande?: string;
  montantPropose?: number;
  montantDemande?: number;
  quantite?: number;
  unite_mesure?: string;
  condition_objet?: ObjetCondition;
  garantie_disponible?: boolean;
  garantie_duree?: number;
  livraison_incluse?: boolean;
  image?: string;
  images?: string[];
  is_urgent?: boolean;
  is_negotiable?: boolean;
  date_disponibilite?: string;
  date_expiration?: string;
  tags?: string[];
  prix_estime?: string;
}

/**
 * Type pour la mise à jour d'échange
 */
export interface UpdateEchangeData {
  titre?: string;
  description?: string;
  categorie_uuid?: string;
  type_echange?: EchangeType;
  numero?: string;
  email?: string;
  adresse?: string;
  ville_uuid?: string;
  pays_uuid?: string;
  objetPropose?: string;
  objetDemande?: string;
  montantPropose?: number;
  montantDemande?: number;
  quantite?: number;
  unite_mesure?: string;
  condition_objet?: ObjetCondition;
  garantie_disponible?: boolean;
  garantie_duree?: number;
  livraison_incluse?: boolean;
  statut?: EchangeStatut;
  image?: string;
  images?: string[];
  is_featured?: boolean;
  is_urgent?: boolean;
  is_negotiable?: boolean;
  date_disponibilite?: string;
  date_expiration?: string;
  tags?: string[];
  notes_admin?: string;
  prix_estime?: string;
}

// =============================================
// TYPES POUR LES FILTRES
// =============================================

/**
 * Type pour les filtres d'échange
 */
export interface EchangeFilterType {
  search?: string;
  categorie_uuid?: string;
  type_echange?: EchangeType | "tous";
  statut?: EchangeStatut | "tous";
  ville_uuid?: string;
  pays_uuid?: string;
  utilisateur_uuid?: string;
  prix_min?: number;
  prix_max?: number;
  condition_objet?: ObjetCondition;
  is_urgent?: boolean;
  is_negotiable?: boolean;
  is_featured?: boolean;
  date_debut?: string;
  date_fin?: string;
  with_images?: boolean;
  tags?: string[];
  orderBy?: keyof Echange | "created_at" | "prix_estime" | "vue_count";
  orderDirection?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// =============================================
// TYPES POUR LES STATISTIQUES
// =============================================

/**
 * Type pour les statistiques d'échange
 */
export interface EchangeStatsType {
  total: number;
  par_statut: Record<EchangeStatut, number>;
  par_type: Record<EchangeType, number>;
  par_categorie: Array<{
    categorie: string;
    count: number;
    pourcentage: number;
  }>;
  moyennes: {
    prix_moyen: number;
    duree_moyenne: number;
    taux_reponse_moyen: number;
  };
  evolution_mensuelle: Array<{
    mois: string;
    nouveaux_echanges: number;
    echanges_termines: number;
  }>;
  top_categories: CategorieEchange[];
  taux_success_global: number;
}

// =============================================
// TYPES POUR LES OPTIONS DE SÉLECTION
// =============================================

/**
 * Type pour les options d'échange
 */
export interface EchangeOptionType {
  value: string;
  label: string;
  type: EchangeType;
  statut: EchangeStatut;
  prix_estime?: string;
  ville?: string;
  disabled?: boolean;
}

/**
 * Type pour les options de catégorie
 */
export interface CategorieOptionType {
  value: string;
  label: string;
  icon?: string;
  couleur?: string;
  parent_uuid?: string;
  disabled?: boolean;
}

// =============================================
// TYPES POUR L'EXPORT
// =============================================

/**
 * Type pour l'export des échanges
 */
export interface EchangeExportData {
  uuid: string;
  titre: string;
  description: string;
  statut: string;
  type_echange: string;
  categorie: string;
  utilisateur: string;
  prix_estime: string;
  ville: string;
  pays: string;
  created_at: string;
  updated_at: string;
  vue_count: number;
  like_count: number;
}

// =============================================
// TYPES POUR LES RAPPORTS
// =============================================

/**
 * Type pour les rapports d'échange
 */
export interface EchangeReportData {
  periode: {
    debut: string;
    fin: string;
  };
  resume: {
    total_echanges: number;
    nouveaux_echanges: number;
    echanges_termines: number;
    revenu_total: number;
    taux_success: number;
  };
  performance_par_categorie: Array<{
    categorie: string;
    echanges: number;
    revenu: number;
    taux_success: number;
  }>;
  tendances: Array<{
    date: string;
    nouveaux_echanges: number;
    echanges_termines: number;
  }>;
  top_utilisateurs: Array<{
    utilisateur: string;
    echanges: number;
    revenu: number;
    note_moyenne: number;
  }>;
  recommandations: string[];
}

// =============================================
// TYPES POUR LES TRANSACTIONS
// =============================================

/**
 * Type pour les transactions liées aux échanges
 */
export interface Transaction extends BaseEntity {
  echange_uuid: string;
  acheteur_uuid: string;
  vendeur_uuid: string;
  montant: number;
  frais_service?: number;
  montant_total: number;
  statut_paiement: TransactionStatut;
  mode_paiement: ModePaiement;
  reference_paiement?: string;
  date_paiement?: string;
  date_validation?: string;
  notes?: string;
  acheteur?: UtilisateurEchange;
  vendeur?: UtilisateurEchange;
}

export type TransactionStatut =
  | "en_attente"
  | "en_cours"
  | "valide"
  | "echec"
  | "rembourse"
  | "conteste";

export type ModePaiement =
  | "especes"
  | "mobile_money"
  | "carte_bancaire"
  | "virement"
  | "paypal"
  | "autre";

// =============================================
// TYPES POUR LES NOTIFICATIONS D'ÉCHANGE
// =============================================

/**
 * Type pour les notifications d'échange
 */
export interface EchangeNotification {
  uuid: string;
  utilisateur_uuid: string;
  echange_uuid: string;
  type:
    | "nouvelle_offre"
    | "offre_acceptee"
    | "offre_refusee"
    | "message_recu"
    | "echange_termine"
    | "avis_recu"
    | "statut_change"
    | "rappeleur";
  titre: string;
  message: string;
  is_lu: boolean;
  date_lu?: string;
  action_url?: string;
  created_at: string;
}

// =============================================
// FONCTIONS UTILITAIRES
// =============================================

/**
 * Vérifie si un échange est actif
 */
export const isEchangeActif = (echange: Echange): boolean => {
  return ["actif", "en_cours", "reserve"].includes(echange.statut);
};

/**
 * Vérifie si un échange est terminé
 */
export const isEchangeTermine = (echange: Echange): boolean => {
  return ["termine", "annule", "expire", "archive"].includes(echange.statut);
};

/**
 * Formate le prix estimé
 */
export const formatPrixEstime = (echange: Echange): string => {
  if (!echange.prix_estime) return "Non spécifié";

  const prix = parseFloat(echange.prix_estime);
  if (isNaN(prix) || prix === 0) return "Gratuit";

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
  }).format(prix);
};

/**
 * Obtient la configuration du statut
 */
export const getEchangeStatutConfig = (statut: EchangeStatut) => {
  const configs: Record<
    EchangeStatut,
    {
      icon: string;
      color: string;
      label: string;
      bgColor: string;
      borderColor: string;
    }
  > = {
    en_attente: {
      icon: "clock",
      color: "#ff9800",
      label: "En attente",
      bgColor: "#fff3e0",
      borderColor: "#ff9800",
    },
    actif: {
      icon: "check-circle",
      color: "#4caf50",
      label: "Actif",
      bgColor: "#e8f5e9",
      borderColor: "#4caf50",
    },
    en_cours: {
      icon: "exchange-alt",
      color: "#2196f3",
      label: "En cours",
      bgColor: "#e3f2fd",
      borderColor: "#2196f3",
    },
    reserve: {
      icon: "handshake",
      color: "#9c27b0",
      label: "Réservé",
      bgColor: "#f3e5f5",
      borderColor: "#9c27b0",
    },
    termine: {
      icon: "check",
      color: "#4caf50",
      label: "Terminé",
      bgColor: "#e8f5e9",
      borderColor: "#4caf50",
    },
    annule: {
      icon: "times",
      color: "#f44336",
      label: "Annulé",
      bgColor: "#ffebee",
      borderColor: "#f44336",
    },
    expire: {
      icon: "calendar-times",
      color: "#ff9800",
      label: "Expiré",
      bgColor: "#fff3e0",
      borderColor: "#ff9800",
    },
    suspendu: {
      icon: "pause",
      color: "#ff9800",
      label: "Suspendu",
      bgColor: "#fff3e0",
      borderColor: "#ff9800",
    },
    archive: {
      icon: "archive",
      color: "#9e9e9e",
      label: "Archivé",
      bgColor: "#f5f5f5",
      borderColor: "#9e9e9e",
    },
  };

  return configs[statut] || configs.en_attente;
};

/**
 * Calcule la durée depuis la création
 */
export const getDureePublication = (echange: Echange): string => {
  if (!echange.created_at) return "Date inconnue";

  const created = new Date(echange.created_at);
  const now = new Date();
  const diff = now.getTime() - created.getTime();
  const jours = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (jours === 0) return "Aujourd'hui";
  if (jours === 1) return "Hier";
  if (jours < 7) return `Il y a ${jours} jours`;
  if (jours < 30) return `Il y a ${Math.floor(jours / 7)} semaines`;
  if (jours < 365) return `Il y a ${Math.floor(jours / 30)} mois`;
  return `Il y a ${Math.floor(jours / 365)} ans`;
};

/**
 * Vérifie si un échange est urgent
 */
export const isEchangeUrgent = (echange: Echange): boolean => {
  return !!echange.is_urgent;
};

/**
 * Vérifie si un échange est négociable
 */
export const isEchangeNegotiable = (echange: Echange): boolean => {
  return !!echange.is_negotiable;
};

/**
 * Obtient les images de l'échange
 */
export const getEchangeImages = (echange: Echange): string[] => {
  const images: string[] = [];

  if (echange.image) images.push(echange.image);
  if (echange.images) images.push(...echange.images);

  return images;
};

/**
 * Obtient l'image principale
 */
export const getMainImage = (echange: Echange): string => {
  return echange.image || (echange.images && echange.images[0]) || "";
};

// =============================================
// TYPES POUR LES RÉPONSES API
// =============================================

/**
 * Type pour la réponse d'échange
 */
export interface EchangeResponse {
  success: boolean;
  message: string;
  data: Echange | Echange[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

/**
 * Type pour la création d'échange
 */
export interface CreateEchangeResponse {
  success: boolean;
  message: string;
  data: {
    echange: Echange;
    reference: string;
  };
  timestamp: string;
}

// =============================================
// TYPES POUR LES ÉVÉNEMENTS D'ÉCHANGE
// =============================================

/**
 * Type pour les événements d'échange
 */
export interface EchangeEvent {
  uuid: string;
  echange_uuid: string;
  type:
    | "creation"
    | "modification"
    | "statut_change"
    | "offre_recue"
    | "offre_acceptee"
    | "offre_refusee"
    | "message_envoye"
    | "evaluation_recue"
    | "transaction_initiee"
    | "transaction_terminee";
  utilisateur_uuid: string;
  details?: Record<string, any>;
  created_at: string;
}
