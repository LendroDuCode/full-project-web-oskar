// services/produits/produit.types.ts

/**
 * Interface principale représentant un Produit
 * Un produit est un article vendu dans la boutique
 */
export interface Produit {
  // ==================== IDENTIFICATION ====================
  uuid: string; // Identifiant unique universel
  code_reference: string; // Code référence unique (SKU/EAN)
  code_barre?: string; // Code-barres (ISBN, EAN13, UPC)
  slug: string; // Slug pour URL SEO-friendly

  // ==================== INFORMATIONS GÉNÉRALES ====================
  titre: string; // Titre du produit
  description: string; // Description détaillée
  description_courte?: string; // Description courte pour les aperçus
  resume?: string; // Résumé en quelques mots

  // ==================== CATÉGORISATION ====================
  categorie_uuid: string; // Catégorie principale
  sous_categorie_uuid?: string; // Sous-catégorie
  categories_secondaires?: string[]; // Catégories supplémentaires
  tags?: string[]; // Mots-clés pour la recherche
  marque?: string; // Marque du produit
  fabricant?: string; // Fabricant

  // ==================== QUANTITÉ ET STOCK ====================
  quantite_totale: number; // Quantité totale en stock
  quantite_disponible: number; // Quantité disponible à la vente
  quantite_reservee: number; // Quantité réservée (commandes en cours)
  quantite_minimum: number; // Quantité minimum de commande
  quantite_maximum?: number; // Quantité maximum par commande
  seuil_alerte_stock: number; // Seuil pour alerte de stock faible
  gestion_stock: boolean; // Activation de la gestion de stock

  unite_mesure?: string; // Unité de mesure (pièce, kg, litre...)
  poids_unitaire_kg?: number; // Poids unitaire en kg
  dimensions?: {
    // Dimensions du produit
    longueur_cm?: number;
    largeur_cm?: number;
    hauteur_cm?: number;
    volume_litres?: number;
  };

  // ==================== PRIX ET FINANCES ====================
  prix_unitaire_ht: number; // Prix unitaire hors taxes
  prix_unitaire_ttc: number; // Prix unitaire toutes taxes comprises
  taux_tva: number; // Taux de TVA applicable (%)
  cout_revient?: number; // Coût de revient

  // Prix promotionnels
  prix_promotionnel_ht?: number;
  prix_promotionnel_ttc?: number;
  date_debut_promotion?: string;
  date_fin_promotion?: string;

  // Comparaison de prix
  prix_concurrent?: number; // Prix chez les concurrents
  economie_potentielle?: number; // Économie par rapport au concurrent

  // ==================== IMAGES ET MÉDIAS ====================
  images: Array<{
    uuid: string;
    url: string;
    url_miniature?: string;
    url_moyenne?: string;
    url_grande?: string;
    ordre: number;
    est_principale: boolean;
    legende?: string;
    alt_text?: string;
  }>;

  documents?: Array<{
    // Documents associés
    uuid: string;
    type: "notice" | "manuel" | "certificat" | "fiche_technique" | "autre";
    nom: string;
    url: string;
    taille_octets: number;
  }>;

  videos?: Array<{
    // Vidéos de démonstration
    uuid: string;
    type: "youtube" | "vimeo" | "upload";
    url: string;
    embed_code?: string;
    duree_secondes?: number;
  }>;

  // ==================== CARACTÉRISTIQUES TECHNIQUES ====================
  caracteristiques: Array<{
    nom: string;
    valeur: string;
    unite?: string;
    ordre: number;
    groupe?: string; // Groupe de caractéristiques
  }>;

  specifications?: Record<string, any>; // Spécifications techniques détaillées

  // ==================== VARIATIONS ET OPTIONS ====================
  variations?: Array<{
    // Variations disponibles
    uuid: string;
    type: "taille" | "couleur" | "materiau" | "version" | "autre";
    nom: string;
    valeurs: Array<{
      valeur: string;
      code_reference?: string;
      prix_supplement?: number;
      poids_supplement?: number;
      disponible: boolean;
      images?: string[]; // Images spécifiques à cette variation
    }>;
  }>;

  options?: Array<{
    // Options personnalisables
    uuid: string;
    nom: string;
    type: "select" | "radio" | "checkbox" | "text" | "fichier";
    valeurs?: string[]; // Valeurs possibles pour select/radio
    obligatoire: boolean;
    prix_supplement?: number;
    ordre: number;
  }>;

  // ==================== LIVRAISON ====================
  poids_livraison_kg?: number; // Poids pour calcul livraison
  dimensions_livraison?: {
    // Dimensions pour livraison
    longueur_cm: number;
    largeur_cm: number;
    hauteur_cm: number;
  };

  frais_livraison_specifiques?: number; // Frais de livraison spécifiques
  delai_livraison_jours?: number; // Délai de livraison estimé
  livraison_gratuite: boolean; // Éligible à la livraison gratuite
  livraison_express: boolean; // Disponible en livraison express

  // ==================== BOUTIQUE ET VENDEUR ====================
  boutique_uuid: string; // Boutique qui vend le produit
  boutique_nom: string;
  boutique_slug?: string;
  vendeur_uuid: string; // Vendeur/propriétaire
  vendeur_nom: string;

  // ==================== STATUTS ET VISIBILITÉ ====================
  statut:
    | "brouillon"
    | "en_attente"
    | "publie"
    | "en_promotion"
    | "epuise"
    | "archive"
    | "supprime";
  visibilite: "public" | "prive" | "groupe" | "membres";
  en_avant: boolean; // Mis en avant sur la page d'accueil
  nouveaute: boolean; // Produit récent
  best_seller: boolean; // Meilleures ventes

  // ==================== MÉTRIQUES ET ANALYTIQUES ====================
  vues: number; // Nombre de vues
  ventes: number; // Nombre total de ventes
  revenus: number; // Revenus générés
  taux_conversion?: number; // Taux de conversion vues → ventes

  note_moyenne?: number; // Note moyenne des avis (0-5)
  nombre_avis: number; // Nombre total d'avis

  wishlist_count: number; // Nombre d'ajouts aux listes d'envies
  panier_count: number; // Nombre d'ajouts au panier

  // ==================== GARANTIES ET RETOURS ====================
  garantie_mois?: number; // Durée de garantie en mois
  conditions_retour?: string; // Conditions de retour
  delai_retour_jours?: number; // Délai pour retourner le produit

  // ==================== DATES IMPORTANTES ====================
  date_creation: string;
  date_publication?: string;
  date_modification: string;
  date_derniere_vente?: string;
  date_archivage?: string;

  // ==================== VALIDATION ET MODÉRATION ====================
  est_valide: boolean; // Validé par un modérateur
  valide_par?: string; // UUID du modérateur
  date_validation?: string;
  motif_rejet?: string; // Motif si rejeté

  // ==================== MÉTADONNÉES ====================
  metadata?: Record<string, any>;
  attributs_personnalises?: Record<string, any>;

  // ==================== SEO ====================
  meta_titre?: string;
  meta_description?: string;
  meta_mots_cles?: string[];
  url_canonique?: string;

  // ==================== ÉCOLOGIQUE ====================
  ecologique?: {
    recyclable: boolean;
    energie_renouvelable?: boolean;
    empreinte_carbone_kg?: number;
    certifications?: string[]; // Labels écologiques
  };
}

/**
 * Données pour créer un nouveau produit
 */
export interface ProduitCreateData {
  // Informations de base
  titre: string;
  description: string;
  description_courte?: string;
  resume?: string;

  // Catégorisation
  categorie_uuid: string;
  sous_categorie_uuid?: string;
  categories_secondaires?: string[];
  tags?: string[];
  marque?: string;
  fabricant?: string;

  // Stock
  quantite_totale: number;
  quantite_minimum?: number;
  quantite_maximum?: number;
  seuil_alerte_stock?: number;
  gestion_stock?: boolean;

  unite_mesure?: string;
  poids_unitaire_kg?: number;
  dimensions?: {
    longueur_cm?: number;
    largeur_cm?: number;
    hauteur_cm?: number;
  };

  // Prix
  prix_unitaire_ht: number;
  taux_tva: number;
  cout_revient?: number;

  // Prix promotionnels
  prix_promotionnel_ht?: number;
  date_debut_promotion?: string;
  date_fin_promotion?: string;

  // Images
  images?: Array<{
    url: string;
    ordre?: number;
    est_principale?: boolean;
    legende?: string;
    alt_text?: string;
  }>;

  // Caractéristiques
  caracteristiques?: Array<{
    nom: string;
    valeur: string;
    unite?: string;
    ordre?: number;
    groupe?: string;
  }>;

  // Variations
  variations?: Array<{
    type: string;
    nom: string;
    valeurs: Array<{
      valeur: string;
      code_reference?: string;
      prix_supplement?: number;
      poids_supplement?: number;
      disponible?: boolean;
    }>;
  }>;

  // Options
  options?: Array<{
    nom: string;
    type: "select" | "radio" | "checkbox" | "text" | "fichier";
    valeurs?: string[];
    obligatoire?: boolean;
    prix_supplement?: number;
    ordre?: number;
  }>;

  // Livraison
  poids_livraison_kg?: number;
  dimensions_livraison?: {
    longueur_cm: number;
    largeur_cm: number;
    hauteur_cm: number;
  };

  frais_livraison_specifiques?: number;
  delai_livraison_jours?: number;
  livraison_gratuite?: boolean;
  livraison_express?: boolean;

  // Statut
  statut?: "brouillon" | "en_attente" | "publie";
  visibilite?: "public" | "prive" | "groupe" | "membres";
  en_avant?: boolean;
  nouveaute?: boolean;

  // Garanties
  garantie_mois?: number;
  conditions_retour?: string;
  delai_retour_jours?: number;

  // SEO
  meta_titre?: string;
  meta_description?: string;
  meta_mots_cles?: string[];

  // Écologique
  ecologique?: {
    recyclable?: boolean;
    energie_renouvelable?: boolean;
    empreinte_carbone_kg?: number;
    certifications?: string[];
  };

  metadata?: Record<string, any>;
  attributs_personnalises?: Record<string, any>;
}

/**
 * Données pour mettre à jour un produit
 */
export interface ProduitUpdateData {
  titre?: string;
  description?: string;
  description_courte?: string;
  resume?: string;

  categorie_uuid?: string;
  sous_categorie_uuid?: string;
  categories_secondaires?: string[];
  tags?: string[];
  marque?: string;
  fabricant?: string;

  quantite_totale?: number;
  quantite_disponible?: number;
  quantite_minimum?: number;
  quantite_maximum?: number;
  seuil_alerte_stock?: number;
  gestion_stock?: boolean;

  unite_mesure?: string;
  poids_unitaire_kg?: number;
  dimensions?: {
    longueur_cm?: number;
    largeur_cm?: number;
    hauteur_cm?: number;
  };

  prix_unitaire_ht?: number;
  taux_tva?: number;
  cout_revient?: number;

  prix_promotionnel_ht?: number;
  prix_promotionnel_ttc?: number;
  date_debut_promotion?: string;
  date_fin_promotion?: string;

  images?: Array<{
    url: string;
    ordre?: number;
    est_principale?: boolean;
    legende?: string;
    alt_text?: string;
  }>;

  caracteristiques?: Array<{
    nom: string;
    valeur: string;
    unite?: string;
    ordre?: number;
    groupe?: string;
  }>;

  variations?: Array<{
    uuid?: string;
    type: string;
    nom: string;
    valeurs: Array<{
      valeur: string;
      code_reference?: string;
      prix_supplement?: number;
      poids_supplement?: number;
      disponible?: boolean;
    }>;
  }>;

  options?: Array<{
    uuid?: string;
    nom: string;
    type: "select" | "radio" | "checkbox" | "text" | "fichier";
    valeurs?: string[];
    obligatoire?: boolean;
    prix_supplement?: number;
    ordre?: number;
  }>;

  poids_livraison_kg?: number;
  dimensions_livraison?: {
    longueur_cm: number;
    largeur_cm: number;
    hauteur_cm: number;
  };

  frais_livraison_specifiques?: number;
  delai_livraison_jours?: number;
  livraison_gratuite?: boolean;
  livraison_express?: boolean;

  statut?:
    | "brouillon"
    | "en_attente"
    | "publie"
    | "en_promotion"
    | "epuise"
    | "archive"
    | "supprime";
  visibilite?: "public" | "prive" | "groupe" | "membres";
  en_avant?: boolean;
  nouveaute?: boolean;
  best_seller?: boolean;

  garantie_mois?: number;
  conditions_retour?: string;
  delai_retour_jours?: number;

  meta_titre?: string;
  meta_description?: string;
  meta_mots_cles?: string[];

  ecologique?: {
    recyclable?: boolean;
    energie_renouvelable?: boolean;
    empreinte_carbone_kg?: number;
    certifications?: string[];
  };

  metadata?: Record<string, any>;
  attributs_personnalises?: Record<string, any>;
}

/**
 * Paramètres de filtrage pour la recherche de produits
 */
export interface ProduitFilterParams {
  // Filtres par catégorie
  categorie_uuid?: string;
  sous_categorie_uuid?: string;
  categories_secondaires?: string[];

  // Filtres par boutique/vendeur
  boutique_uuid?: string;
  vendeur_uuid?: string;
  marque?: string;
  fabricant?: string;

  // Filtres par statut
  statut?:
    | "brouillon"
    | "en_attente"
    | "publie"
    | "en_promotion"
    | "epuise"
    | "archive";
  visibilite?: "public" | "prive" | "groupe" | "membres";
  en_avant?: boolean;
  nouveaute?: boolean;
  best_seller?: boolean;

  // Filtres par disponibilité
  en_stock?: boolean; // Produits avec stock disponible
  stock_faible?: boolean; // Produits avec stock sous le seuil d'alerte
  livraison_gratuite?: boolean;
  livraison_express?: boolean;

  // Filtres par prix
  prix_min?: number;
  prix_max?: number;
  en_promotion?: boolean; // Produits en promotion

  // Filtres par caractéristiques
  tags?: string[];
  caracteristiques?: Record<string, string>; // { "couleur": "rouge", "taille": "M" }

  // Filtres par évaluation
  note_min?: number; // Note minimum (0-5)
  avec_avis?: boolean; // Produits avec au moins un avis

  // Filtres par vendeur
  vendeur_verifie?: boolean; // Vendeur vérifié

  // Filtres écologiques
  recyclable?: boolean;
  certifications_ecologiques?: string[];

  // Recherche textuelle
  search?: string;

  // Tri
  sort_by?:
    | "date_creation"
    | "date_publication"
    | "titre"
    | "prix"
    | "note_moyenne"
    | "ventes"
    | "vues"
    | "pertinence";
  sort_order?: "asc" | "desc";
}

/**
 * Résultat de recherche avec facettes
 */
export interface ProduitSearchResult {
  produits: Produit[];
  total: number;
  page: number;
  pages: number;
  facettes: {
    categories: Array<{
      uuid: string;
      nom: string;
      count: number;
      sous_categories?: Array<{
        uuid: string;
        nom: string;
        count: number;
      }>;
    }>;
    prix: {
      min: number;
      max: number;
    };
    marques: Array<{
      marque: string;
      count: number;
    }>;
    caracteristiques: Record<
      string,
      Array<{
        valeur: string;
        count: number;
      }>
    >;
    notes: Array<{
      note: number;
      count: number;
    }>;
  };
}

/**
 * Statistiques des produits
 */
export interface ProduitStats {
  total_produits: number;
  produits_par_statut: Record<string, number>;
  produits_par_categorie: Array<{
    categorie_uuid: string;
    categorie_nom: string;
    count: number;
    valeur_totale: number;
  }>;

  ventes: {
    total_ventes: number;
    revenu_total: number;
    ventes_par_mois: Array<{
      mois: string;
      count: number;
      revenu: number;
    }>;
    meilleurs_produits: Array<{
      produit_uuid: string;
      produit_titre: string;
      ventes: number;
      revenu: number;
    }>;
  };

  stock: {
    valeur_stock_total: number;
    produits_en_stock: number;
    produits_epuises: number;
    produits_alerte_stock: number;
    rotation_stock_moyenne: number;
  };

  performance: {
    taux_conversion_moyen: number;
    panier_moyen: number;
    produits_vus_moyen: number;
  };

  satisfaction: {
    note_moyenne: number;
    distribution_notes: Record<number, number>;
    produits_sans_avis: number;
  };
}

/**
 * Variation de produit pour la gestion des stocks
 */
export interface ProduitVariation {
  uuid: string;
  produit_uuid: string;
  combinaison: Record<string, string>; // { "taille": "M", "couleur": "rouge" }
  code_reference: string;

  quantite_totale: number;
  quantite_disponible: number;
  quantite_reservee: number;

  prix_supplement?: number;
  poids_supplement_kg?: number;
  images?: string[]; // Images spécifiques à cette variation

  statut: "actif" | "inactif" | "epuise";
  date_creation: string;
  date_modification: string;
}

/**
 * Inventaire des produits
 */
export interface ProduitInventaire {
  produit_uuid: string;
  produit_titre: string;
  boutique_uuid: string;
  boutique_nom: string;

  quantite_totale: number;
  quantite_disponible: number;
  quantite_reservee: number;
  quantite_vendue_mois: number;

  valeur_stock: number;
  seuil_alerte: boolean;

  dernier_reapprovisionnement?: string;
  prochain_reapprovisionnement?: string;

  variations?: Array<{
    variation_uuid: string;
    combinaison: string;
    quantite_disponible: number;
    seuil_alerte: boolean;
  }>;
}

/**
 * Mouvement de stock
 */
export interface MouvementStock {
  uuid: string;
  produit_uuid: string;
  variation_uuid?: string;
  type: "entree" | "sortie" | "ajustement" | "reservation" | "annulation";

  quantite: number;
  quantite_avant: number;
  quantite_apres: number;

  motif:
    | "vente"
    | "retour"
    | "reception"
    | "inventaire"
    | "perte"
    | "casse"
    | "ajustement";
  reference_commande?: string;
  reference_facture?: string;

  effectue_par: string;
  effectue_par_type: "utilisateur" | "vendeur" | "systeme";

  notes?: string;
  date_mouvement: string;
}

/**
 * Avis/évaluation de produit
 */
export interface ProduitAvis {
  uuid: string;
  produit_uuid: string;
  utilisateur_uuid: string;
  utilisateur_nom: string;
  utilisateur_avatar?: string;

  note: number; // 0-5
  titre?: string;
  commentaire: string;

  avantages?: string[];
  inconvenients?: string[];

  // Aspects spécifiques
  aspects?: {
    qualite?: number;
    rapport_qualite_prix?: number;
    facilite_utilisation?: number;
    design?: number;
    livraison?: number;
  };

  recommandation: boolean; // Recommanderait ce produit
  date_achat?: string; // Date d'achat si applicable

  est_verifie: boolean; // Achat vérifié
  photos?: Array<{
    // Photos jointes à l'avis
    url: string;
    legende?: string;
  }>;

  votes_utile: number;
  votes_inutile: number;

  statut: "en_attente" | "publie" | "modere" | "supprime";
  moderateur_notes?: string;

  date_creation: string;
  date_modification: string;
}

/**
 * Question/Réponse sur un produit
 */
export interface ProduitQuestion {
  uuid: string;
  produit_uuid: string;
  utilisateur_uuid: string;
  utilisateur_nom: string;

  question: string;
  reponse?: string;
  reponse_par?: string; // UUID du vendeur/répondant
  date_reponse?: string;

  votes_utile: number;
  votes_inutile: number;

  statut: "en_attente" | "repondu" | "archive";
  date_creation: string;
  date_modification: string;
}

/**
 * Produit associé (cross-selling/up-selling)
 */
export interface ProduitAssocie {
  uuid: string;
  produit_principal_uuid: string;
  produit_associe_uuid: string;
  type_association:
    | "complementaire"
    | "similaire"
    | "upselling"
    | "crosselling"
    | "kit";
  ordre: number;
  date_creation: string;
}

/**
 * Historique des prix
 */
export interface HistoriquePrix {
  uuid: string;
  produit_uuid: string;
  variation_uuid?: string;

  ancien_prix_ht: number;
  nouveau_prix_ht: number;
  ancien_prix_ttc: number;
  nouveau_prix_ttc: number;

  taux_tva: number;
  taux_variation: number; // Pourcentage de variation

  motif:
    | "ajustement"
    | "promotion"
    | "augmentation_couts"
    | "concurrence"
    | "saison";
  notes?: string;

  date_debut?: string;
  date_fin?: string;

  modifie_par: string;
  date_modification: string;
}

/**
 * Promotion spéciale sur produit
 */
export interface ProduitPromotion {
  uuid: string;
  produit_uuid: string;
  variation_uuid?: string;

  type: "pourcentage" | "montant" | "2pour1" | "lot" | "livraison_gratuite";
  valeur: number; // Pourcentage ou montant

  prix_promotionnel_ht: number;
  prix_promotionnel_ttc: number;
  economie: number; // Montant économisé

  date_debut: string;
  date_fin: string;
  heures_specifiques?: {
    jours_semaine?: number[]; // 0-6 (dimanche-samedi)
    plages_horaires?: Array<{
      debut: string;
      fin: string;
    }>;
  };

  conditions?: {
    quantite_minimum?: number;
    quantite_maximum?: number;
    panier_minimum?: number;
    utilisateurs_cibles?: string[]; // Groupes d'utilisateurs
    premiere_commande?: boolean; // Pour première commande seulement
  };

  utilisation: {
    limite_totale?: number;
    limite_par_utilisateur?: number;
    utilise_count: number;
  };

  statut: "active" | "planifiee" | "terminee" | "annulee";
  date_creation: string;
  date_modification: string;
}

/**
 * Configuration des produits
 */
export interface ProduitConfig {
  // Paramètres généraux
  devise_par_defaut: string;
  tva_par_defaut: number;

  // Stock
  seuil_alerte_stock_par_defaut: number;
  quantite_minimum_par_defaut: number;
  gestion_stock_par_defaut: boolean;

  // Images
  tailles_images: {
    miniature: { width: number; height: number };
    moyenne: { width: number; height: number };
    grande: { width: number; height: number };
  };
  formats_images_acceptes: string[];
  taille_max_image_mo: number;

  // Validations
  validation_auto_produits: boolean;
  moderation_avis: boolean;
  moderation_questions: boolean;

  // SEO
  meta_description_longueur_max: number;
  meta_mots_cles_max: number;

  // Notifications
  notifications_stock_faible: boolean;
  notifications_nouvel_avis: boolean;
  notifications_nouvelle_question: boolean;

  // Export/Import
  formats_export_acceptes: string[];
  taille_max_import_mo: number;
}
