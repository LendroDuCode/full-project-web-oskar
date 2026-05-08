// lib/analytics/events.ts
import { sendEvent } from '../gtag';  // ✅ Correction: sendEvent au lieu de sendGAEvent

// Types d'événements
export enum AnalyticsEventType {
  // Authentification
  LOGIN = 'login',
  LOGOUT = 'logout',
  REGISTER = 'register',
  
  // Navigation
  PAGE_VIEW = 'page_view',
  SEARCH = 'search',
  FILTER = 'filter',
  
  // Annonces
  VIEW_ANNONCE = 'view_annonce',
  CREATE_ANNONCE = 'create_annonce',
  EDIT_ANNONCE = 'edit_annonce',
  DELETE_ANNONCE = 'delete_annonce',
  PUBLISH_ANNONCE = 'publish_annonce',
  
  // Interactions
  ADD_TO_FAVORITES = 'add_to_favorites',
  REMOVE_FROM_FAVORITES = 'remove_from_favorites',
  CONTACT_VENDEUR = 'contact_vendeur',
  SHARE_ANNONCE = 'share_annonce',
  
  // Boutiques
  VIEW_BOUTIQUE = 'view_boutique',
  CREATE_BOUTIQUE = 'create_boutique',
  EDIT_BOUTIQUE = 'edit_boutique',
  
  // Messagerie
  SEND_MESSAGE = 'send_message',
  READ_MESSAGE = 'read_message',
  
  // Paiement
  VIEW_PANIER = 'view_panier',
  ADD_TO_PANIER = 'add_to_panier',
  CHECKOUT = 'checkout',
  PURCHASE = 'purchase',
  
  // Évaluations
  ADD_REVIEW = 'add_review',
  LIKE_REVIEW = 'like_review',
  
  // Erreurs
  ERROR = 'error',
  API_ERROR = 'api_error',
}

// Événements d'authentification
export const trackLogin = (method: 'email' | 'google' | 'facebook', userType: string) => {
  sendEvent(AnalyticsEventType.LOGIN, {
    event_category: 'Authentication',
    event_label: method,
    login_method: method,
    user_type: userType,
  });
};

export const trackRegister = (userType: string, method: 'email' | 'google' | 'facebook') => {
  sendEvent(AnalyticsEventType.REGISTER, {
    event_category: 'Authentication',
    event_label: method,
    user_type: userType,
    registration_method: method,
  });
};

export const trackLogout = () => {
  sendEvent(AnalyticsEventType.LOGOUT, {
    event_category: 'Authentication',
  });
};

// Événements d'annonces
export const trackViewAnnonce = (type: 'produit' | 'don' | 'echange', annonceId: string, category?: string) => {
  sendEvent(AnalyticsEventType.VIEW_ANNONCE, {
    event_category: 'Annonces',
    event_label: type,
    annonce_type: type,
    annonce_id: annonceId,
    annonce_category: category,
  });
};

export const trackCreateAnnonce = (type: 'produit' | 'don' | 'echange', category?: string) => {
  sendEvent(AnalyticsEventType.CREATE_ANNONCE, {
    event_category: 'Annonces',
    event_label: type,
    annonce_type: type,
    annonce_category: category,
  });
};

export const trackPublishAnnonce = (type: 'produit' | 'don' | 'echange', withAI: boolean) => {
  sendEvent(AnalyticsEventType.PUBLISH_ANNONCE, {
    event_category: 'Annonces',
    event_label: type,
    annonce_type: type,
    ai_moderation: withAI,
  });
};

export const trackDeleteAnnonce = (type: 'produit' | 'don' | 'echange') => {
  sendEvent(AnalyticsEventType.DELETE_ANNONCE, {
    event_category: 'Annonces',
    event_label: type,
    annonce_type: type,
  });
};

// Événements de recherche
export const trackSearch = (query: string, resultsCount: number, filters?: any) => {
  sendEvent(AnalyticsEventType.SEARCH, {
    event_category: 'Recherche',
    event_label: query,
    search_query: query,
    search_results_count: resultsCount,
    search_filters: JSON.stringify(filters),
  });
};

export const trackFilter = (filterType: string, filterValue: string) => {
  sendEvent(AnalyticsEventType.FILTER, {
    event_category: 'Recherche',
    event_label: filterType,
    filter_type: filterType,
    filter_value: filterValue,
  });
};

// Événements d'interaction
export const trackAddToFavorites = (type: 'produit' | 'don' | 'echange', annonceId: string) => {
  sendEvent(AnalyticsEventType.ADD_TO_FAVORITES, {
    event_category: 'Interactions',
    event_label: type,
    annonce_type: type,
    annonce_id: annonceId,
  });
};

export const trackRemoveFromFavorites = (type: 'produit' | 'don' | 'echange', annonceId: string) => {
  sendEvent(AnalyticsEventType.REMOVE_FROM_FAVORITES, {
    event_category: 'Interactions',
    event_label: type,
    annonce_type: type,
    annonce_id: annonceId,
  });
};

export const trackContactVendeur = (type: 'produit' | 'don' | 'echange', contactMethod: 'whatsapp' | 'message' | 'phone') => {
  sendEvent(AnalyticsEventType.CONTACT_VENDEUR, {
    event_category: 'Interactions',
    event_label: type,
    annonce_type: type,
    contact_method: contactMethod,
  });
};

export const trackShareAnnonce = (type: 'produit' | 'don' | 'echange', platform: string) => {
  sendEvent(AnalyticsEventType.SHARE_ANNONCE, {
    event_category: 'Interactions',
    event_label: type,
    annonce_type: type,
    share_platform: platform,
  });
};

// Événements de messagerie
export const trackSendMessage = (destinataireType: string) => {
  sendEvent(AnalyticsEventType.SEND_MESSAGE, {
    event_category: 'Messagerie',
    event_label: destinataireType,
    destinataire_type: destinataireType,
  });
};

export const trackReadMessage = () => {
  sendEvent(AnalyticsEventType.READ_MESSAGE, {
    event_category: 'Messagerie',
  });
};

// Événements d'évaluation
export const trackAddReview = (type: 'produit' | 'don' | 'echange', rating: number) => {
  sendEvent(AnalyticsEventType.ADD_REVIEW, {
    event_category: 'Évaluations',
    event_label: type,
    annonce_type: type,
    review_rating: rating,
  });
};

// Événements de panier
export const trackAddToPanier = (produitId: string, price: number, quantity: number) => {
  sendEvent(AnalyticsEventType.ADD_TO_PANIER, {
    event_category: 'E-commerce',
    event_label: produitId,
    produit_id: produitId,
    price: price,
    quantity: quantity,
  });
};

export const trackCheckout = (totalValue: number, itemsCount: number) => {
  sendEvent(AnalyticsEventType.CHECKOUT, {
    event_category: 'E-commerce',
    checkout_value: totalValue,
    items_count: itemsCount,
  });
};

export const trackPurchase = (transactionId: string, totalValue: number, items: any[]) => {
  sendEvent(AnalyticsEventType.PURCHASE, {
    event_category: 'E-commerce',
    transaction_id: transactionId,
    purchase_value: totalValue,
    items_count: items.length,
    items: items,
  });
};

// Événements de boutique
export const trackViewBoutique = (boutiqueId: string, boutiqueName: string) => {
  sendEvent(AnalyticsEventType.VIEW_BOUTIQUE, {
    event_category: 'Boutiques',
    event_label: boutiqueName,
    boutique_id: boutiqueId,
    boutique_name: boutiqueName,
  });
};

export const trackCreateBoutique = () => {
  sendEvent(AnalyticsEventType.CREATE_BOUTIQUE, {
    event_category: 'Boutiques',
  });
};

// Événements d'erreur
export const trackError = (errorType: string, errorMessage: string, component?: string) => {
  sendEvent(AnalyticsEventType.ERROR, {
    event_category: 'Errors',
    event_label: errorType,
    error_type: errorType,
    error_message: errorMessage,
    component: component,
  });
};

export const trackAPIError = (endpoint: string, statusCode: number, errorMessage: string) => {
  sendEvent(AnalyticsEventType.API_ERROR, {
    event_category: 'Errors',
    event_label: endpoint,
    api_endpoint: endpoint,
    status_code: statusCode,
    error_message: errorMessage,
  });
};