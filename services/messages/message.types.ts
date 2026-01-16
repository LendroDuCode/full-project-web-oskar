// services/messages/message.types.ts

/**
 * Interface principale représentant un Message
 * Un message est une communication entre utilisateurs du système
 */
export interface Message {
  // ==================== IDENTIFICATION ====================
  uuid: string; // Identifiant unique universel
  code_reference: string; // Code de référence pour le suivi

  // ==================== CONTENU DU MESSAGE ====================
  sujet: string; // Sujet du message
  contenu: string; // Contenu textuel du message
  contenu_html?: string; // Contenu formaté en HTML
  contenu_markdown?: string; // Contenu en Markdown

  // ==================== EXPÉDITEUR ET DESTINATAIRES ====================
  expediteur_uuid: string; // UUID de l'expéditeur
  expediteur_type: "utilisateur" | "vendeur" | "agent" | "admin" | "systeme";
  expediteur_nom: string; // Nom affichable de l'expéditeur
  expediteur_email: string; // Email de l'expéditeur
  expediteur_avatar?: string; // Avatar de l'expéditeur

  destinataires: Array<{
    // Liste des destinataires
    uuid: string; // UUID du destinataire
    type: "utilisateur" | "vendeur" | "agent" | "admin" | "groupe";
    email: string; // Email du destinataire
    nom: string; // Nom du destinataire
    avatar?: string; // Avatar du destinataire
  }>;

  destinataires_cc?: Array<{
    // Destinataires en copie
    uuid: string;
    type: string;
    email: string;
    nom: string;
    avatar?: string;
  }>;

  destinataires_bcc?: Array<{
    // Destinataires en copie cachée
    uuid: string;
    type: string;
    email: string;
    nom: string;
    avatar?: string;
  }>;

  // ==================== RÉFÉRENCES ====================
  parent_uuid?: string; // UUID du message parent (pour les conversations)
  conversation_uuid?: string; // UUID de la conversation
  reference_objet?: {
    // Référence à un objet du système
    type: "annonce" | "produit" | "don" | "echange" | "commande" | "ticket";
    uuid: string;
    titre?: string;
    url?: string;
  };

  // ==================== STATUTS ====================
  statut_envoi: "brouillon" | "en_attente" | "envoye" | "erreur" | "annule";
  statut_lecture: "non_lu" | "lu" | "archive" | "supprime";
  priorite: "faible" | "normale" | "elevee" | "urgente";
  confidentialite: "public" | "prive" | "confidentiel" | "secret";

  // ==================== PIÈCES JOINTES ====================
  pieces_jointes?: Array<{
    uuid: string; // Identifiant de la pièce jointe
    nom_fichier: string; // Nom original du fichier
    url: string; // URL de téléchargement
    type_mime: string; // Type MIME
    taille_octets: number; // Taille en octets
    est_image: boolean; // Indique si c'est une image
    est_document: boolean; // Indique si c'est un document
    hash?: string; // Hash pour vérification
  }>;

  // ==================== SUIVI ET ANALYTIQUE ====================
  nombre_ouvertures: number; // Nombre de fois où le message a été ouvert
  premier_ouverture?: string; // Date de première ouverture
  dernier_ouverture?: string; // Date de dernière ouverture
  ouvert_par: Array<{
    // Qui a ouvert le message
    destinataire_uuid: string;
    date_ouverture: string;
    ip_address?: string;
    user_agent?: string;
  }>;

  liens_suivis?: Array<{
    // Liens suivis dans le message
    url: string;
    clicks: number;
    premier_click?: string;
    dernier_click?: string;
  }>;

  // ==================== DATES IMPORTANTES ====================
  date_creation: string; // Date de création (brouillon)
  date_envoi?: string; // Date d'envoi effectif
  date_reception?: string; // Date de réception par le serveur
  date_lecture?: string; // Date de première lecture
  date_modification?: string; // Dernière modification
  date_archive?: string; // Date d'archivage

  // ==================== CONFIGURATION ====================
  template_uuid?: string; // Référence au template utilisé
  canal: "email" | "sms" | "push" | "in_app" | "whatsapp" | "multicanal";
  format: "texte" | "html" | "markdown";
  langue: string; // Code langue (fr, en, etc.)

  // ==================== MÉTADONNÉES ====================
  metadata?: Record<string, any>; // Données additionnelles
  tags?: string[]; // Tags pour catégorisation
  categorie?: string; // Catégorie du message
  campagne_uuid?: string; // Référence à une campagne

  // ==================== CONFIGURATION D'ENVOI ====================
  retry_count?: number; // Nombre de tentatives d'envoi
  max_retries?: number; // Maximum de tentatives
  retry_interval_minutes?: number; // Intervalle entre les tentatives
  timezone?: string; // Fuseau horaire pour l'envoi

  // ==================== SIGNATURES ET CERTIFICATS ====================
  signature?: string; // Signature de l'expéditeur
  certificat_ssl?: boolean; // Message chiffré SSL
  dkim_signed?: boolean; // Signé DKIM
  spf_pass?: boolean; // Validation SPF
}

/**
 * Données nécessaires pour créer un nouveau message
 */
export interface MessageCreateData {
  sujet: string;
  contenu: string;
  contenu_html?: string;
  contenu_markdown?: string;

  expediteur_uuid: string;
  expediteur_type: "utilisateur" | "vendeur" | "agent" | "admin" | "systeme";
  expediteur_nom: string;
  expediteur_email: string;
  expediteur_avatar?: string;

  destinataires: Array<{
    uuid: string;
    type: "utilisateur" | "vendeur" | "agent" | "admin" | "groupe";
    email: string;
    nom: string;
    avatar?: string;
  }>;

  destinataires_cc?: Array<{
    uuid: string;
    type: string;
    email: string;
    nom: string;
    avatar?: string;
  }>;

  destinataires_bcc?: Array<{
    uuid: string;
    type: string;
    email: string;
    nom: string;
    avatar?: string;
  }>;

  parent_uuid?: string;
  conversation_uuid?: string;
  reference_objet?: {
    type: "annonce" | "produit" | "don" | "echange" | "commande" | "ticket";
    uuid: string;
    titre?: string;
    url?: string;
  };

  priorite?: "faible" | "normale" | "elevee" | "urgente";
  confidentialite?: "public" | "prive" | "confidentiel" | "secret";

  pieces_jointes?: Array<{
    nom_fichier: string;
    url: string;
    type_mime: string;
    taille_octets: number;
    est_image?: boolean;
    est_document?: boolean;
    hash?: string;
  }>;

  template_uuid?: string;
  canal?: "email" | "sms" | "push" | "in_app" | "whatsapp" | "multicanal";
  format?: "texte" | "html" | "markdown";
  langue?: string;

  metadata?: Record<string, any>;
  tags?: string[];
  categorie?: string;
  campagne_uuid?: string;

  signature?: string;
  timezone?: string;

  // Pour l'envoi différé
  date_envoi_programmee?: string;
}

/**
 * Données partielles pour la mise à jour d'un message
 */
export interface MessageUpdateData {
  sujet?: string;
  contenu?: string;
  contenu_html?: string;
  contenu_markdown?: string;

  statut_envoi?: "brouillon" | "en_attente" | "envoye" | "erreur" | "annule";
  statut_lecture?: "non_lu" | "lu" | "archive" | "supprime";
  priorite?: "faible" | "normale" | "elevee" | "urgente";
  confidentialite?: "public" | "prive" | "confidentiel" | "secret";

  pieces_jointes?: Array<{
    nom_fichier: string;
    url: string;
    type_mime: string;
    taille_octets: number;
    est_image?: boolean;
    est_document?: boolean;
    hash?: string;
  }>;

  tags?: string[];
  categorie?: string;

  metadata?: Record<string, any>;

  // Pour le suivi
  date_lecture?: string;
  date_archive?: string;
}

/**
 * Paramètres de filtrage pour la recherche de messages
 */
export interface MessageFilterParams {
  // Filtres par utilisateur
  expediteur_uuid?: string;
  destinataire_uuid?: string;
  utilisateur_uuid?: string; // Messages concernant un utilisateur

  // Filtres par statut
  statut_envoi?: "brouillon" | "en_attente" | "envoye" | "erreur" | "annule";
  statut_lecture?: "non_lu" | "lu" | "archive" | "supprime";
  priorite?: "faible" | "normale" | "elevee" | "urgente";

  // Filtres par type
  expediteur_type?: "utilisateur" | "vendeur" | "agent" | "admin" | "systeme";
  canal?: "email" | "sms" | "push" | "in_app" | "whatsapp" | "multicanal";
  format?: "texte" | "html" | "markdown";

  // Filtres temporels
  date_creation_debut?: string;
  date_creation_fin?: string;
  date_envoi_debut?: string;
  date_envoi_fin?: string;
  date_lecture_debut?: string;
  date_lecture_fin?: string;

  // Filtres par référence
  reference_type?:
    | "annonce"
    | "produit"
    | "don"
    | "echange"
    | "commande"
    | "ticket";
  reference_uuid?: string;
  conversation_uuid?: string;

  // Autres filtres
  has_pieces_jointes?: boolean;
  has_been_opened?: boolean;
  confidentialite?: "public" | "prive" | "confidentiel" | "secret";

  tags?: string[];
  categorie?: string;
  campagne_uuid?: string;

  // Recherche textuelle
  search?: string;

  // Tri des résultats
  sort_by?:
    | "date_creation"
    | "date_envoi"
    | "date_lecture"
    | "sujet"
    | "priorite";
  sort_order?: "asc" | "desc";
}

/**
 * Paramètres de pagination avec filtres intégrés
 */
export interface MessagePaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?:
    | "date_creation"
    | "date_envoi"
    | "date_lecture"
    | "sujet"
    | "priorite";
  sort_order?: "asc" | "desc";
  filters?: MessageFilterParams;
}

/**
 * Statistiques sur les messages
 */
export interface MessageStats {
  total_messages: number;
  messages_par_statut_envoi: Record<string, number>;
  messages_par_statut_lecture: Record<string, number>;
  messages_par_canal: Record<string, number>;
  messages_par_categorie: Array<{
    categorie: string;
    count: number;
  }>;
  messages_par_jour: Array<{
    date: string;
    count: number;
    taux_ouverture: number;
  }>;

  // Métriques d'engagement
  taux_ouverture_moyen: number;
  taux_ouverture_par_canal: Record<string, number>;
  delai_moyen_lecture_minutes: number;
  taux_clics_moyen: number;

  // Performance des campagnes
  campagnes_actives: Array<{
    campagne_uuid: string;
    campagne_nom: string;
    messages_envoyes: number;
    taux_ouverture: number;
    taux_clics: number;
  }>;

  // Performance des templates
  templates_performants: Array<{
    template_uuid: string;
    template_nom: string;
    utilisation_count: number;
    taux_ouverture: number;
  }>;

  // Distribution géographique
  distribution_geographique: Array<{
    pays: string;
    count: number;
    taux_ouverture: number;
  }>;

  // Top expéditeurs
  top_expediteurs: Array<{
    expediteur_uuid: string;
    expediteur_nom: string;
    messages_envoyes: number;
    taux_ouverture: number;
  }>;
}

/**
 * Résultat de la validation d'un message
 */
export interface MessageValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  destinataires_valides: number;
  destinataires_invalides: Array<{
    email: string;
    raison: string;
  }>;
  taille_pieces_jointes: number;
}

/**
 * Conversation regroupant plusieurs messages
 */
export interface Conversation {
  uuid: string;
  sujet: string;
  participants: Array<{
    uuid: string;
    type: string;
    nom: string;
    email: string;
    avatar?: string;
  }>;
  dernier_message?: Message;
  nombre_messages: number;
  nombre_messages_non_lus: number;
  date_dernier_message?: string;
  date_creation: string;
  date_modification: string;
  reference_objet?: {
    type: string;
    uuid: string;
    titre: string;
  };
  tags?: string[];
  metadata?: Record<string, any>;
}

/**
 * Template de message pour la réutilisation
 */
export interface MessageTemplate {
  uuid: string;
  nom: string;
  description?: string;
  sujet: string;
  contenu: string;
  contenu_html?: string;
  contenu_markdown?: string;
  variables: Array<{
    nom: string;
    description: string;
    exemple: string;
    obligatoire: boolean;
  }>;
  canal: "email" | "sms" | "push" | "in_app" | "multicanal";
  format: "texte" | "html" | "markdown";
  langue: string;
  categorie?: string;
  tags?: string[];
  est_actif: boolean;
  utilisation_count: number;
  date_creation: string;
  date_modification: string;
  created_by: string;
}

/**
 * Campagne d'envoi de messages
 */
export interface MessageCampagne {
  uuid: string;
  nom: string;
  description?: string;
  template_uuid: string;
  template_nom: string;
  segment_cible: {
    type: "tous" | "groupe" | "filtre" | "liste";
    details: any;
  };
  date_debut: string;
  date_fin?: string;
  statut: "planifiee" | "en_cours" | "terminee" | "suspendue" | "annulee";
  progression: {
    total: number;
    envoyes: number;
    succes: number;
    echecs: number;
    ouverts: number;
    clics: number;
  };
  parametres: {
    rythme_envoi?: number;
    timezone?: string;
    priorite?: string;
    canal_principal?: string;
  };
  statistiques?: {
    taux_ouverture: number;
    taux_clics: number;
    delai_moyen_ouverture: number;
    meilleur_moment: string;
  };
  date_creation: string;
  date_modification: string;
  created_by: string;
}

/**
 * Rapport d'envoi de message
 */
export interface MessageDeliveryReport {
  message_uuid: string;
  destinataire_uuid: string;
  destinataire_email: string;
  statut: "envoye" | "livre" | "ouvert" | "clic" | "erreur" | "bounce" | "spam";
  details?: string;
  code_statut?: string;
  server_response?: string;
  date_envoi: string;
  date_livraison?: string;
  date_ouverture?: string;
  date_clic?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
}

/**
 * Configuration de la messagerie
 */
export interface MessagerieConfig {
  smtp_host?: string;
  smtp_port?: number;
  smtp_secure?: boolean;
  smtp_username?: string;
  smtp_password?: string;
  smtp_from_name?: string;
  smtp_from_email?: string;

  sms_provider?: string;
  sms_api_key?: string;
  sms_sender?: string;

  push_notification_key?: string;
  push_notification_secret?: string;

  webhook_url?: string;
  webhook_secret?: string;

  limitations: {
    emails_par_jour: number;
    sms_par_jour: number;
    push_par_jour: number;
    taille_max_piece_jointe: number;
  };

  parametres: {
    retry_attempts: number;
    retry_delay_minutes: number;
    tracking_enabled: boolean;
    dkim_enabled: boolean;
    spf_enabled: boolean;
    timezone: string;
  };
}

/**
 * Webhook pour les événements de messagerie
 */
export interface MessageWebhook {
  uuid: string;
  url: string;
  events: Array<
    | "message.envoye"
    | "message.livre"
    | "message.ouvert"
    | "message.clic"
    | "message.erreur"
    | "campagne.debut"
    | "campagne.fin"
    | "campagne.statut_change"
  >;
  secret?: string;
  headers?: Record<string, string>;
  is_active: boolean;
  last_triggered?: string;
  error_count: number;
  date_creation: string;
  date_modification: string;
}
