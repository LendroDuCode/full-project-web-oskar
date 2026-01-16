// services/panier/panier.types.ts

/**
 * Interface principale représentant un Item de Panier
 * Un item représente un produit/don/échange/annonce ajouté au panier
 */
export interface PanierItem {
  // ==================== IDENTIFICATION ====================
  uuid: string; // Identifiant unique de l'item
  panier_uuid: string; // Référence au panier parent
  session_id?: string; // ID de session pour panier non connecté

  // ==================== PRODUIT/ARTICLE ====================
  article_type: "produit" | "don" | "echange" | "annonce" | "service";
  article_uuid: string; // UUID de l'article référencé
  article_code: string; // Code référence de l'article

  // ==================== INFORMATIONS DE L'ARTICLE ====================
  article_titre: string; // Titre pour l'affichage
  article_description?: string; // Description courte
  article_image_url?: string; // URL de l'image principale
  article_categorie?: string; // Catégorie de l'article
  article_slug?: string; // Slug pour les URLs

  // ==================== QUANTITÉ ET PRIX ====================
  quantite: number; // Quantité sélectionnée
  quantite_max: number; // Quantité maximum disponible
  quantite_min: number; // Quantité minimum autorisée
  unite_mesure?: string; // Unité de mesure (pièce, kg, litre...)

  prix_unitaire: number; // Prix unitaire de l'article
  devise: string; // Devise (EUR, USD, XOF...)
  prix_total: number; // Prix total (quantité * prix_unitaire)

  // ==================== RÉDUCTIONS ET PROMOTIONS ====================
  reduction_unitaire?: number; // Réduction unitaire appliquée
  reduction_type?: "montant" | "pourcentage" | "code_promo";
  code_promo?: string; // Code promotionnel utilisé

  prix_initial?: number; // Prix initial avant réduction
  taux_reduction?: number; // Pourcentage de réduction

  // ==================== OPTIONS ET VARIATIONS ====================
  variations?: Array<{
    // Variations choisies (taille, couleur...)
    type: string; // Type de variation
    valeur: string; // Valeur choisie
    prix_supplement?: number; // Supplément de prix
    code_reference?: string; // Code référence spécifique
  }>;

  options?: Array<{
    // Options supplémentaires
    nom: string; // Nom de l'option
    description?: string; // Description
    prix_supplement?: number; // Prix supplémentaire
    selectionnee: boolean; // Si l'option est sélectionnée
  }>;

  // ==================== PERSONNALISATION ====================
  personnalisation?: {
    // Personnalisations spécifiques
    texte_personnalise?: string; // Texte personnalisé
    fichiers?: Array<{
      // Fichiers uploadés
      nom: string;
      url: string;
      type_mime: string;
    }>;
    notes?: string; // Notes spéciales
  };

  // ==================== LIVRAISON ====================
  livraison_requise: boolean; // Nécessite une livraison
  mode_livraison?: string; // Mode de livraison choisi
  frais_livraison?: number; // Frais de livraison spécifiques
  delai_livraison_jours?: number; // Délai estimé de livraison

  // ==================== TAXES ====================
  taux_tva?: number; // Taux de TVA applicable
  montant_tva?: number; // Montant de TVA
  prix_ht?: number; // Prix hors taxes

  // ==================== BOUTIQUE/VENDEUR ====================
  boutique_uuid?: string; // Référence à la boutique
  boutique_nom?: string; // Nom de la boutique
  vendeur_uuid?: string; // Référence au vendeur
  vendeur_nom?: string; // Nom du vendeur

  // ==================== DISPONIBILITÉ ET STOCK ====================
  en_stock: boolean; // Disponibilité en stock
  stock_disponible: number; // Stock disponible actuel
  stock_alerte: boolean; // Alerte de stock faible
  stock_previsionnel?: number; // Stock prévisionnel

  // ==================== DATES ====================
  date_ajout: string; // Date d'ajout au panier
  date_modification?: string; // Dernière modification
  date_expiration?: string; // Date d'expiration du panier

  // ==================== STATUT ====================
  statut: "actif" | "inactif" | "supprime" | "commande";
  est_valide: boolean; // Validation des données

  // ==================== MÉTADONNÉES ====================
  metadata?: Record<string, any>; // Données additionnelles
  tags?: string[]; // Tags pour catégorisation

  // ==================== SUIVI ====================
  vues_count?: number; // Nombre de vues de l'item
  ajouts_count?: number; // Nombre d'ajouts au panier
}

/**
 * Panier contenant plusieurs items
 */
export interface Panier {
  uuid: string;
  utilisateur_uuid?: string; // Utilisateur connecté
  session_id?: string; // Session pour utilisateur non connecté
  type_panier: "standard" | "favoris" | "liste_envies" | "comparaison";

  // ==================== ITEMS ====================
  items: PanierItem[];
  items_count: number; // Nombre total d'items
  items_unique_count: number; // Nombre d'articles uniques

  // ==================== CALCULS ====================
  sous_total: number; // Total avant réductions
  total_reductions: number; // Total des réductions
  total_livraison: number; // Total des frais de livraison
  total_taxes: number; // Total des taxes
  total_general: number; // Total général TTC

  // ==================== RÉDUCTIONS ====================
  reductions_appliquees: Array<{
    type: "code_promo" | "coupon" | "fidelite" | "volume";
    code?: string;
    montant: number;
    description: string;
  }>;

  // ==================== LIVRAISON ====================
  adresse_livraison_uuid?: string;
  adresse_facturation_uuid?: string;
  mode_livraison_choisi?: string;
  frais_livraison_calcules: number;

  // ==================== TAXES ====================
  taxes_appliquees: Array<{
    nom: string;
    taux: number;
    montant: number;
  }>;

  // ==================== DATES ====================
  date_creation: string;
  date_modification: string;
  date_expiration?: string;
  date_commande?: string; // Date de passage en commande

  // ==================== STATUT ====================
  statut: "actif" | "abandonne" | "commande" | "expire";
  est_valide: boolean;

  // ==================== MÉTADONNÉES ====================
  metadata?: Record<string, any>;
  notes?: string; // Notes générales sur le panier

  // ==================== ANALYTIQUE ====================
  analytics?: {
    duree_session_minutes: number;
    pages_vues: number;
    source: string; // Source d'origine
    campagne?: string; // Campagne marketing
  };
}

/**
 * Données pour ajouter un item au panier
 */
export interface PanierItemCreateData {
  article_type: "produit" | "don" | "echange" | "annonce" | "service";
  article_uuid: string;

  quantite: number;
  variations?: Array<{
    type: string;
    valeur: string;
  }>;

  options?: Array<{
    nom: string;
    selectionnee: boolean;
  }>;

  personnalisation?: {
    texte_personnalise?: string;
    notes?: string;
  };

  mode_livraison?: string;
  code_promo?: string;

  metadata?: Record<string, any>;
}

/**
 * Données pour mettre à jour un item du panier
 */
export interface PanierItemUpdateData {
  quantite?: number;

  variations?: Array<{
    type: string;
    valeur: string;
  }>;

  options?: Array<{
    nom: string;
    selectionnee: boolean;
  }>;

  personnalisation?: {
    texte_personnalise?: string;
    notes?: string;
  };

  mode_livraison?: string;
  code_promo?: string;

  metadata?: Record<string, any>;
}

/**
 * Résumé du panier pour affichage rapide
 */
export interface PanierResume {
  items_count: number;
  articles_uniques: number;
  sous_total: number;
  total_reductions: number;
  total_livraison: number;
  total_general: number;
  devise: string;
  boutique_count: number; // Nombre de boutiques différentes
  vendeur_count: number; // Nombre de vendeurs différents
  produits_epuises: number; // Nombre de produits en rupture
  produits_en_alerte: number; // Nombre de produits en alerte stock
}

/**
 * Validation d'un item de panier
 */
export interface PanierItemValidation {
  item_uuid: string;
  est_valide: boolean;
  erreurs: string[];
  avertissements: string[];
  disponibilite: {
    en_stock: boolean;
    stock_disponible: number;
    quantite_disponible: number;
    delai_reappro?: number;
  };
  prix: {
    prix_unitaire: number;
    prix_total: number;
    reductions_appliquees: number;
    prix_final: number;
  };
  livraison: {
    disponible: boolean;
    modes_disponibles: string[];
    frais_estimes: number;
    delai_estime: number;
  };
}

/**
 * Synchronisation entre paniers (local/session/connecté)
 */
export interface PanierSyncData {
  panier_local: PanierItemCreateData[];
  panier_session: PanierItem[];
  panier_utilisateur: PanierItem[];
  conflits?: Array<{
    article_uuid: string;
    quantite_local: number;
    quantite_session: number;
    quantite_utilisateur: number;
    resolution?:
      | "garder_local"
      | "garder_session"
      | "garder_utilisateur"
      | "fusionner"
      | "max";
  }>;
}

/**
 * Élément de comparaison entre items
 */
export interface ItemComparaison {
  article_uuid: string;
  article_type: string;
  article_titre: string;
  caracteristiques: Array<{
    nom: string;
    valeur: string;
    unite?: string;
  }>;
  prix: number;
  disponibilite: string;
  note_moyenne?: number;
  nombre_avis?: number;
  avantages: string[];
  inconvenients: string[];
}

/**
 * Historique des modifications du panier
 */
export interface PanierHistorique {
  uuid: string;
  panier_uuid: string;
  action: "ajout" | "modification" | "suppression" | "vider" | "commande";
  details: {
    item_uuid?: string;
    article_type?: string;
    article_uuid?: string;
    ancienne_valeur?: any;
    nouvelle_valeur?: any;
  };
  utilisateur_uuid?: string;
  session_id?: string;
  date_action: string;
  ip_address?: string;
}

/**
 * Recommandations basées sur le panier
 */
export interface PanierRecommandations {
  articles_complementaires: Array<{
    article_uuid: string;
    article_type: string;
    article_titre: string;
    prix: number;
    raison: "achete_ensemble" | "similaire" | "populaire" | "promotion";
    score: number;
  }>;
  promotions_actuelles: Array<{
    code: string;
    description: string;
    reduction: number;
    applicable: boolean;
  }>;
  offres_speciales: Array<{
    type: "livraison_gratuite" | "reduction_volume" | "cadeau";
    description: string;
    condition: string;
    valeur: number;
  }>;
}

/**
 * Paramètres de filtrage pour les historiques de panier
 */
export interface PanierFilterParams {
  utilisateur_uuid?: string;
  session_id?: string;
  statut?: "actif" | "abandonne" | "commande" | "expire";
  date_debut?: string;
  date_fin?: string;
  article_type?: "produit" | "don" | "echange" | "annonce";
  boutique_uuid?: string;
  vendeur_uuid?: string;
  avec_items?: boolean;
}

/**
 * Statistiques des paniers
 */
export interface PanierStats {
  total_paniers: number;
  paniers_par_statut: Record<string, number>;
  paniers_par_mois: Array<{
    mois: string;
    count: number;
    valeur_moyenne: number;
  }>;

  conversion: {
    taux_conversion: number;
    paniers_abandonnes: number;
    valeur_moyenne_panier: number;
    valeur_moyenne_commande: number;
  };

  items: {
    articles_plus_ajoutes: Array<{
      article_uuid: string;
      article_titre: string;
      count: number;
    }>;
    quantite_moyenne_par_panier: number;
    valeur_moyenne_par_item: number;
  };

  utilisateurs: {
    paniers_par_utilisateur_moyen: number;
    utilisateurs_recidivistes: number;
    paniers_abandonnes_par_utilisateur: number;
  };

  temps: {
    duree_moyenne_session: number;
    delai_moyen_avant_commande: number;
    meilleur_moment_jour: string;
  };
}

/**
 * Configuration du panier
 */
export interface PanierConfig {
  duree_expiration_jours: number; // Durée avant expiration
  quantite_max_par_item: number; // Quantité maximum par article
  items_max_panier: number; // Nombre maximum d'items
  paniers_max_par_utilisateur: number; // Nombre maximum de paniers sauvegardés

  options: {
    permettre_personnalisation: boolean;
    permettre_notes: boolean;
    permettre_fichiers: boolean;
    synchronisation_auto: boolean;
    sauvegarde_automatique: boolean;
  };

  notifications: {
    alerte_stock: boolean;
    alerte_prix: boolean;
    rappel_panier: boolean;
    recommendations: boolean;
  };

  taxes: {
    tva_par_defaut: number;
    calcul_auto_taxes: boolean;
    inclure_taxes_affichage: boolean;
  };
}

/**
 * Code promotionnel applicable au panier
 */
export interface CodePromotionnel {
  code: string;
  type: "pourcentage" | "montant" | "livraison_gratuite" | "cadeau";
  valeur: number;
  devise?: string;
  description: string;

  conditions: {
    montant_minimum?: number;
    montant_maximum?: number;
    categories_inclues?: string[];
    categories_exclues?: string[];
    articles_inclus?: string[];
    articles_exclus?: string[];
    utilisateurs_cibles?: string[];
    date_debut: string;
    date_fin?: string;
    utilisation_max?: number;
    utilisation_par_utilisateur?: number;
  };

  utilisation: {
    utilise_count: number;
    limite_atteinte: boolean;
    date_premiere_utilisation?: string;
    date_derniere_utilisation?: string;
  };

  est_valide: boolean;
  messages_erreur?: string[];
}
