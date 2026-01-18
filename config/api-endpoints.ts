// config/api-endpoints.ts
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    ADMIN: {
      LOGIN: "/auth/admin/login",
      LOGOUT: "/auth/admin/logout",
      PROFILE: "/auth/admin/profile",
      MODIFIER_PROFILE: "/auth/admin/modifier/profile",
      OTP: "/auth/admin/otp",
      RESEND_OTP: "/auth/admin/resend/otp",
      FORGOT_PASSWORD: "/auth/admin/generate/forget/link",
      VERIFY_FORGET_TOKEN: "/auth/admin/verify/forget/token",
      RESET_PASSWORD: "/auth/admin/reset/password",
      GOOGLE_CONNEXION: "/auth/admin/google/connexion",
      FACEBOOK: "/auth/admin/facebook",
      LISTE_ADMIN: "/admin/liste-super-admin",
    },
    AGENT: {
      LOGIN: "/auth/agent/login",
      LOGOUT: "/auth/agent/logout",
      PROFILE: "/auth/agent/profile",
      RESET_PASSWORD: "/auth/reset-password",
      UPDATE: (uuid: string) => `/auth/${uuid}`,
      UPDATE_PASSWORD: (uuid: string) => `/auth/${uuid}/password`,
      UPDATE_PROFILE: "/auth/agent/modifier/profile",
    },
    VENDEUR: {
      LOGIN: "/auth/vendeur/login",
      REGISTER: "/auth/vendeur/register",
      LOGOUT: "/auth/vendeur/logout",
      PROFILE: "/auth/vendeur/profile",
      UPDATE_PROFILE: "/auth/modifier/profile",
      OTP: "/auth/vendeur/otp",
      RESEND_OTP: "/auth/vendeur/resend/otp",
      FORGOT_PASSWORD: "/auth/vendeur/generate/forget/link",
      VERIFY_FORGET_TOKEN: "/auth/vendeur/verify/forget/token",
      RESET_PASSWORD: "/auth/vendeur/reset/password",
      SEND_OTP: "/auth/vendeur/send-otp",
      GOOGLE_CONNEXION: "/auth/vendeur/google/connexion",
      FACEBOOK: "/auth/vendeur/facebook",
      DETAIL: (uuid: string) => `/auth/vendeur/${uuid}`,
      DELETE: (uuid: string) => `/auth/vendeur/${uuid}`,
      BLOCK: (uuid: string) => `/auth/vendeur/${uuid}/bloquer`,
      UNBLOCK: (uuid: string) => `/auth/vendeur/${uuid}/debloquer`,
      STATUS: (uuid: string) => `/auth/vendeur/${uuid}/status`,
    },
    UTILISATEUR: {
      LOGIN: "/auth/utilisateur/login",
      LOGOUT: "/auth/utilisateur/logout",
      REGISTER: "/auth/utilisateur/register",
      PROFILE: "/auth/utilisateur/profile",
      UPDATE_PROFILE: "/auth/utilisateur/modifier/profile",
      OTP: "/auth/utilisateur/otp",
      RESEND_OTP: "/auth/utilisateur/resend/otp",
      FORGOT_PASSWORD: "/auth/utilisateur/generate/forget/link",
      VERIFY_FORGET_TOKEN: "/auth/utilisateur/verify/forget/token",
      RESET_PASSWORD: "/auth/utilisateur/reset/password",
      SEND_OTP: "/auth/utilisateur/send-otp",
      GOOGLE_CONNEXION: "/auth/utilisateur/google/connexion",
      FACEBOOK: "/auth/utilisateur/facebook",
      DETAIL: (uuid: string) => `/auth/utilisateur/${uuid}`,
      DELETE: (uuid: string) => `/auth/utilisateur/${uuid}`,
    },
    COMMON: {
      SEND_OTP: "/auth/send-otp",
      PROFILE: "/auth/profile",
    },
  },

  AGENTS: {
    LIST: "/admin/liste-agents",
    PROFIL: "/auth/agent/profile",
    BLOCKED: "/admin/liste-agents-bloques",
    DELETED: "/admin/liste-agents-supprimes",
    CREATE: "/admin/creer-agent-admin",
    DETAIL: (uuid: string) => `/admin/agent/${uuid}`,
    UPDATE: (uuid: string) => `/admin/modifier-agent-par-admin/${uuid}`,
    DELETE: (uuid: string) => `/admin/supprimer-agent/${uuid}`,
    BLOCK: (uuid: string) => `/admin/agent/${uuid}/bloquer`,
    UNBLOCK: (uuid: string) => `/admin/agent/${uuid}/debloquer`,
    RESTORE: (uuid: string) => `/admin/restaurer-agent/${uuid}`,
    EXPORT_PDF: "/admin/export-agents-pdf",
    EXPORT_BLOCKED_PDF: "/admin/export-agents-bloques-pdf",
    EXPORT_DELETED_PDF: "/admin/export-agents-supprimes-pdf",
  },

  VENDEURS: {
    PROFIL: "/auth/vendeur/profile",
    CREATE: "/admin/creer-vendeur-admin",
    DETAIL: (uuid: string) => `/admin/vendeur/${uuid}`,
    UPDATE: (uuid: string) => `/admin/modifier-vendeur-par-admin/${uuid}`,
    DELETE: (uuid: string) => `/admin/vendeur/${uuid}`,
    BLOCK: (uuid: string) => `/admin/vendeur/${uuid}/bloquer`,
    UNBLOCK: (uuid: string) => `/admin/vendeur/${uuid}/debloquer`,
    RESTORE: (uuid: string) => `/admin/restaurer-vendeur/${uuid}`,
    EXPORT_PDF: "/admin/export-vendeurs-pdf",
    EXPORT_BLOCKED_PDF: "/admin/export-vendeurs-bloques-pdf",
    EXPORT_DELETED_PDF: "/admin/export-vendeurs-supprimes-pdf",
  },
  // Admin
  ADMIN: {
    USERS: {
      LIST: "/admin/liste-utilisateurs",
      RESET_PASSWORD_REQUEST: "/admin/utilisateurs/reset-password-request",
      RESET_PASSWORD: "/admin/utilisateurs/reset-password",
      VERIFY_EMAIL: "/admin/utilisateurs/verify-email",
      BASE: "/admin/utilisateurs",
      EMPTY_TRASH: "/admin/utilisateurs/vider-corbeille",
      BLOCKED: "/admin/liste-utilisateurs-bloques",
      DELETED: "/admin/liste-utilisateurs-supprimes",
      CREATE: "/admin/creer-utilisateur-admin",
      DETAIL: (uuid: string) => `/admin/utilisateur/${uuid}`,
      UPDATE: (uuid: string) => `/admin/modifier-utilisateur-par-admin/${uuid}`,
      DELETE: (uuid: string) => `/admin/utilisateur/${uuid}`,
      BLOCK: (uuid: string) => `/admin/utilisateur/${uuid}/bloquer`,
      UNBLOCK: (uuid: string) => `/admin/utilisateur/${uuid}/debloquer`,
      RESTORE: (uuid: string) => `/admin/restaurer-utilisateur/${uuid}`,
      EXPORT_PDF: "/admin/export-utilisateurs-pdf",
      EXPORT_BLOCKED_PDF: "/admin/export-utilisateurs-bloques-pdf",
      EXPORT_DELETED_PDF: "/admin/export-utilisateurs-supprimes-pdf",
      PROFILE: "/admin/profile",
    },
    AGENTS: {
      LIST: "/admin/liste-agents",
      PROFIL: "/auth/agent/profile",
      BLOCKED: "/admin/liste-agents-bloques",
      DELETED: "/admin/liste-agents-supprimes",
      CREATE: "/admin/creer-agent-admin",
      DETAIL: (uuid: string) => `/admin/agent/${uuid}`,
      UPDATE: (uuid: string) => `/admin/modifier-agent-par-admin/${uuid}`,
      DELETE: (uuid: string) => `/admin/supprimer-agent/${uuid}`,
      BLOCK: (uuid: string) => `/admin/agent/${uuid}/bloquer`,
      UNBLOCK: (uuid: string) => `/admin/agent/${uuid}/debloquer`,
      RESTORE: (uuid: string) => `/admin/restaurer-agent/${uuid}`,
      EXPORT_PDF: "/admin/export-agents-pdf",
      EXPORT_BLOCKED_PDF: "/admin/export-agents-bloques-pdf",
      EXPORT_DELETED_PDF: "/admin/export-agents-supprimes-pdf",
    },
    VENDEURS: {
      LIST: "/admin/liste-vendeurs",
      BLOCKED: "/admin/liste-vendeurs-bloques",
      DELETED: "/admin/liste-vendeurs-supprimes",
      PROFIL: "/auth/vendeur/profile",
      CREATE: "/admin/creer-vendeur-admin",
      DETAIL: (uuid: string) => `/admin/vendeur/${uuid}`,
      UPDATE: (uuid: string) => `/admin/modifier-vendeur-par-admin/${uuid}`,
      DELETE: (uuid: string) => `/admin/vendeur/${uuid}`,
      BLOCK: (uuid: string) => `/admin/vendeur/${uuid}/bloquer`,
      UNBLOCK: (uuid: string) => `/admin/vendeur/${uuid}/debloquer`,
      RESTORE: (uuid: string) => `/admin/restaurer-vendeur/${uuid}`,
      EXPORT_PDF: "/admin/export-vendeurs-pdf",
      EXPORT_BLOCKED_PDF: "/admin/export-vendeurs-bloques-pdf",
      EXPORT_DELETED_PDF: "/admin/export-vendeurs-supprimes-pdf",
    },
  },

  // Adresses
  ADRESSES: {
    LIST: "/adresses",
    DETAIL: (uuid: string) => `/adresses/${uuid}`,
  },

  // Annonces
  ANNONCES: {
    LIST: "/annonces",
    LIST_TOUTES_ANNONCES: "/annonces/liste-toutes-annonces",
    LISTE_TOUS_TYPE_ANNONCES: "/annonces/liste-tous-types-annonces",
    ALL_PUBLISHED: "/annonces/all/publiees",
    VENDEUR_ANNONCES: "/annonces/toutes-annonces-vendeur-connecte",
    VENDEUR_PUBLISHED: "/annonces/vendeur/publiees",
    VENDEUR_BLOCKED: "/annonces/vendeur/bloquees",
    USER_ANNONCES: "/annonces/liste-annonces-utilisateur",
    USER_PUBLISHED: "/annonces/liste-annonces-utilisateur-publiees",
    USER_BLOCKED: "/annonces/liste-annonces-utilisateur-bloquees",
    DETAIL: (uuid: string) => `/annonces/${uuid}`,
    PUBLIC_DETAIL: (uuid: string) => `/annonces/public/${uuid}`,
    PERSONAL_DETAIL: (uuid: string) => `/annonces/perso/${uuid}`,
    CREATE: "/annonces",
    DELETE: (uuid: string) => `/annonces/${uuid}`,
    PUBLISH: (uuid: string) => `/annonces/${uuid}/publier`,
    RESTORE: (uuid: string) => `/annonces/${uuid}/restore`,
    PUBLISHED_LIST: "/annonces/liste-annoncces-publiees",
    ALL_LIST: "/annonces/liste-annonces",
    EXPORT_PDF: "/annonces/export-annonces-pdf",
    UPDATE_STOCK_USER: (uuid: string) =>
      `/annonces/stock-annonce-utilisateur/${uuid}`,
    UPDATE_STOCK_VENDEUR: (uuid: string) =>
      `/annonces/stock-echange-vendeur/${uuid}`,
    RANDOM_DETAIL: (uuid: string) => `/annonces/details/aleatoire/${uuid}`,
  },

  // Caractéristiques
  CARACTERISTIQUES: {
    LIST: "/caracteristiques",
    BY_TYPE: (type: string) => `/caracteristiques/by-type/${type}`,
    DETAIL: (uuid: string) => `/caracteristiques/${uuid}`,
    CREATE: "/caracteristiques/creer",
    UPDATE: (uuid: string) => `/caracteristiques/${uuid}`,
    ASSIGN_TYPE: (uuid: string) => `/caracteristiques/${uuid}/assign-type`,
    TOGGLE_STATUS: (uuid: string) => `/caracteristiques/${uuid}/toggle-status`,
    DELETE: (uuid: string) => `/caracteristiques/${uuid}`,
  },

  // Commandes
  COMMANDES: {
    CREATE: (panierUuid: string) => `/commandes/passer-commande/${panierUuid}`,
    CREATE_DIRECT: (produitUuid: string) =>
      `/commandes/commander-direct/${produitUuid}`,
    USER_PANNIERS: "/commandes/mes-paniers",
    VENDEUR_STATS: "/commandes/vendeur/boutique/statistiques",
    LISTE_COMMANDE_UTILISATEUR: "/commandes/utilisateur/mes-produits-commandes",
    VENDEUR_UPDATE_STATUS: (commandeUuid: string) =>
      `/commandes/vendeur/boutique/${commandeUuid}/statut`,
    DETAIL: (uuid: string) => `/commandes/${uuid}`,
    DETAIL_COMMANDES_VENDEUR: (uuid: string) =>
      `/commandes/vendeur/boutique/commande/${uuid}`,
    BOUTIQUE_ORDERS: "/commandes/liste/mes-commandes-boutique",
    RECUPERER_COMMANDE_FILTRE: "/commandes/vendeur/boutique/commandes/filtrer",
    USER_ORDERS: "/commandes/utilisateur/mes-commandes",
    USER_ORDER_DETAIL: (uuid: string) =>
      `/commandes/utilisateur/mes-commandes/${uuid}`,
    USER_CANCEL: (uuid: string) =>
      `/commandes/utilisateur/mes-commandes/${uuid}/annuler`,
  },

  // Pays
  PAYS: {
    LIST: "/pays/liste-pays",
    ACTIFS: "/pays/actifs",
    BY_CODE: (code: string) => `/pays/by-code/${code}`,
    BY_NOM: (nom: string) => `/pays/by-nom/${nom}`,
    TOGGLE_STATUS: (uuid: string) => `/pays/${uuid}/toggle-status`,
    DETAIL: (uuid: string) => `/pays/${uuid}`,
    CREATE: "/pays/creer",
    UPDATE: (uuid: string) => `/pays/${uuid}`,
    UPDATE_INDICATIF: (uuid: string, indicatif: string) =>
      `/pays/${uuid}/indicatif/${indicatif}`,
    DELETE: (uuid: string) => `/pays/${uuid}`,
    EXPORT_PDF: "/pays/export-pays-pdf",
  },

  // Rôles
  ROLES: {
    LIST: "/roles",
    UTILISATEUR_ROLES: "/roles/role-utilisateur",
    VENDEUR_ROLES: "/roles/role-vendeur",
    AGENT_ROLES: "/roles/role-agent",
    CLIENT_ROLES: "/roles/role-client",
    DETAIL: (uuid: string) => `/roles/${uuid}`,
    CREATE: "/roles",
    UPDATE: (uuid: string) => `/roles/${uuid}`,
    DELETE: (uuid: string) => `/roles/${uuid}`,
    EXPORT_PDF: "/roles/export-roles-pdf",
  },

  // Statuts Matrimoniaux
  STATUTS_MATRIMONIAUX: {
    LIST: "/statuts-matrimoniaux/liste-statuts",
    ALL: "/statuts-matrimoniaux/all",
    ACTIFS: "/statuts-matrimoniaux/actifs",
    DETAIL: (uuid: string) => `/statuts-matrimoniaux/${uuid}`,
    CREATE: "/statuts-matrimoniaux/creer",
    UPDATE: (uuid: string) => `/statuts-matrimoniaux/${uuid}`,
    DELETE: (uuid: string) => `/statuts-matrimoniaux/${uuid}`,
    EXPORT_PDF: "/statuts-matrimoniaux/export-statuts-matrimoniaux-pdf",
  },

  // Types de Bien
  TYPE_BIEN: {
    LIST: "/type-bien",
    TREE: "/type-bien/tree",
    DETAIL: (uuid: string) => `/type-bien/${uuid}`,
    BY_SLUG: (slug: string) => `/type-bien/slug/${slug}`,
    CHILDREN: (uuid: string) => `/type-bien/${uuid}/children`,
    CREATE: "/type-bien/creer",
    UPDATE: (uuid: string) => `/type-bien/${uuid}`,
    DELETE: (uuid: string) => `/type-bien/${uuid}`,
  },

  // Types de Transaction
  TRANSACTION_TYPES: {
    LIST: "/transaction-types",
    ACTIVE: "/transaction-types/active",
    DETAIL: (uuid: string) => `/transaction-types/${uuid}`,
    BY_SLUG: (slug: string) => `/transaction-types/slug/${slug}`,
    CREATE: "/transaction-types/creer",
    UPDATE: (uuid: string) => `/transaction-types/${uuid}`,
    TOGGLE_STATUS: (uuid: string) => `/transaction-types/${uuid}/toggle-status`,
    DELETE: (uuid: string) => `/transaction-types/${uuid}`,
  },

  // Villes
  VILLES: {
    LIST: "/villes/liste-ville",
    BY_PAYS: (paysUuid: string) => `/villes/pays/${paysUuid}`,
    UPDATE: (uuid: string) => `/villes/${uuid}/coordonnees`,
    DETAIL: (uuid: string) => `/villes/${uuid}`,
    BY_CODE_POSTAL: (codePostal: string) => `/villes/code-postal/${codePostal}`,
    CREATE: "/villes/creer",
    ACTIVATE: (uuid: string) => `/villes/${uuid}/active`,
    DEACTIVATE: (uuid: string) => `/villes/${uuid}/desactiver`,
    DELETE: (uuid: string) => `/villes/${uuid}`,
    EXPORT_PDF: "/villes/export-villes-pdf",
  },

  // Promotions
  PROMOTIONS: {
    LIST: "/promotions",
    DETAIL: (uuid: string) => `/promotions/${uuid}`,
    CREATE: "/promotions",
    UPDATE: (uuid: string) => `/promotions/${uuid}`,
    DELETE: (uuid: string) => `/promotions/${uuid}`,
    TOGGLE: (uuid: string) => `/promotions/${uuid}/toggle`,
    APPLY: "/promotions/appliquer",
    UPDATE_STATUSES: "/promotions/cron/maj-statuts",
  },

  // Civilités
  CIVILITES: {
    LIST: "/civilites/liste-civilites",
    ALL: "/civilites",
    ACTIVES: "/civilites/actives",
    DETAIL: (uuid: string) => `/civilites/${uuid}`,
    BY_SLUG: (slug: string) => `/civilites/par-slug/${slug}`,
    CREATE: "/civilites/creer",
    UPDATE: (uuid: string) => `/civilites/${uuid}`,
    DELETE: (uuid: string) => `/civilites/${uuid}`,
    EXPORT_PDF: "/civilites/export-civilites-pdf",
  },

  // Types de Boutique
  TYPES_BOUTIQUE: {
    LIST: "/types-boutique",
    DEFAULTS: "/types-boutique/defaults",
    DETAIL: (uuid: string) => `/types-boutique/${uuid}`,
    CREATE: "/types-boutique",
    UPDATE: (uuid: string) => `/types-boutique/modifier/${uuid}`,
    DELETE: (uuid: string) => `/types-boutique/${uuid}`,
    ACTIVATE: (uuid: string) => `/types-boutique/${uuid}/activate`,
    DEACTIVATE: (uuid: string) => `/types-boutique/${uuid}/deactivate`,
    EXPORT_PDF: "/types-boutique/export-type-boutique-pdf",
  },

  // Horaires Boutique
  HORAIRES_BOUTIQUE: {
    DETAIL: (uuid: string) => `/horaires-boutique/${uuid}`,
    BY_BOUTIQUE: (boutiqueUuid: string) =>
      `/horaires-boutique/boutique/${boutiqueUuid}`,
    WEEKLY_BY_BOUTIQUE: (boutiqueUuid: string) =>
      `/horaires-boutique/boutique/${boutiqueUuid}/weekly`,
    STATUS_BY_BOUTIQUE: (boutiqueUuid: string) =>
      `/horaires-boutique/boutique/${boutiqueUuid}/status`,
    CREATE: "/horaires-boutique",
    UPDATE: (uuid: string) => `/horaires-boutique/${uuid}`,
    DELETE: (uuid: string) => `/horaires-boutique/${uuid}`,
    ADD_EXCEPTIONS: (boutiqueUuid: string) =>
      `/horaires-boutique/boutique/${boutiqueUuid}/exceptions`,
    EXTEND_HOURS: (boutiqueUuid: string) =>
      `/horaires-boutique/boutique/${boutiqueUuid}/extend-hours`,
  },

  // Boutiques
  BOUTIQUES: {
    LIST: "/boutiques",
    ALL: "/boutiques/toutes",
    LIST_WITH_PRODUITS: "/boutiques/liste-boutiques",
    LISTE_BOUTIQUES_CREE_PAR_VENDEUR:
      "/boutiques/liste-boutiques-crees-par-vendeur",
    WITH_PUBLISHED_PRODUITS: "/boutiques/liste-boutique-produits-publies",
    DETAIL: (uuid: string) => `/boutiques/${uuid}`,
    PUBLIC_DETAIL: (uuid: string) => `/boutiques/publie/${uuid}`,
    BY_SLUG: (slug: string) => `/boutiques/slug/${slug}`,
    CREATE: "/boutiques",
    DELETE: (uuid: string) => `/boutiques/${uuid}`,
    RESTORE: (uuid: string) => `/boutiques/${uuid}/restorer`,
    BLOCK: (uuid: string) => `/boutiques/${uuid}/bloquer`,
    UNBLOCK: (uuid: string) => `/boutiques/${uuid}/debloquer`,
    CLOSE: (uuid: string) => `/boutiques/fermer-boutique/${uuid}`,
    EXPORT_PDF: "/boutiques/boutique-export-pdf",
  },

  // Messages
  MESSAGERIE: {
    SEND: "/messagerie/envoyer",
    RECEIVED: "/messagerie/recus",
    SENT: "/messagerie/envoyes",
    DETAIL: (uuid: string) => `/messagerie/message/${uuid}`,
    MARK_READ: (uuid: string) => `/messagerie/marquer-lu/${uuid}`,
    MARK_UNREAD: (uuid: string) => `/messagerie/marquer-non-lu/${uuid}`,
    ARCHIVE: (uuid: string) => `/messagerie/archiver/${uuid}`,
    REPLY: "/messagerie/repondre",
    STATS: "/messagerie/statistiques",
    PUBLIC_SEND: "/messagerie/public/envoyer",
  },

  // Permissions
  PERMISSIONS: {
    LIST: "/permissions",
    DETAIL: (uuid: string) => `/permissions/${uuid}`,
    CREATE: "/permissions",
    UPDATE: (uuid: string) => `/permissions/${uuid}`,
    DELETE: (uuid: string) => `/permissions/${uuid}`,
    EXPORT_PDF: "/permissions/export-permissions-pdf",
  },

  // Rôles Permissions
  ROLE_PERMISSIONS: {
    LIST: (roleUuid: string) => `/role-permissions/${roleUuid}/permissions`,
    ADD: (roleUuid: string, permissionUuid: string) =>
      `/role-permissions/${roleUuid}/permissions/${permissionUuid}`,
    REMOVE: (roleUuid: string, permissionUuid: string) =>
      `/role-permissions/${roleUuid}/permissions/${permissionUuid}`,
  },

  // Panier
  PANIER: {
    GET: "/panier",
    ADD: "/panier/ajouter",
    SYNC: "/panier/synchroniser",
    CLEAR: "/panier/vider",
    UPDATE_QUANTITY: "/panier/modifier-quantite",
    REMOVE_ITEM: (produitUuid: string) => `/panier/produit/${produitUuid}`,
    DETAIL: (uuid: string) => `/panier/${uuid}`,
    CURRENT: "/panier/mon-panier/actuel",
    BY_UUID: (panierUuid: string) => `/panier/mon-panier/${panierUuid}`,
  },

  // Produits
  PRODUCTS: {
    LIST: "/produits",
    ALL: "/produits/tous-produits",
    PUBLISHED: "/produits/published",
    
    UNPUBLISH: (uuid: string) => `/produits/${uuid}/restore`,
    PUBLISH: (uuid: string) => `/produits/${uuid}/restore`,
    PUBLLIER: "/produits/publier",
    DELETED: "/produits/deleted",
    RESTORE: (uuid: string) => `/produits/${uuid}/restore`,
    LISTE_PRODUITS_UTILISATEUR: "/produits/liste-mes-utilisateur-produits",
    LISTE_PRODUITS_UTILISATEUR_BLOQUE:
      "/produits/liste-mes-utilisateur-produits",
    BLOCKED: "/produits/bloques",
    VENDEUR_PRODUCTS: "/produits/liste-produits-cree-vendeur",
    ALL_VENDEUR_PRODUCTS: "/produits/all-vendeur-produit",
    DETAIL_NON_PUBLIE: (uuid: string) => `/produits/non-publie/${uuid}`,
    DETAIL: (uuid: string) => `/produits/${uuid}`,
    DETAIL_ALEATOIRE: (uuid: string) => `/produits/details/aletoire/${uuid}`,
    AJOUTER_PRODUIT_FAVORIS: (uuid: string) =>
      `/produits/ajouter-produit-favoris/${uuid}`,
    DETAIL_FAVORIS_UTILISATEUR: "/produits/favoris",
    BY_SLUG: (slug: string) => `/produits/slug/${slug}`,
    CREATE: "/produits/creer",
    DELETE: (uuid: string) => `/produits/${uuid}`,
    UPDATE_STOCK_PRODUIT: (uuid: string) =>
      `/produits/stock-produit-vendeur/${uuid}`,
    RANDOM_DETAIL: (uuid: string) => `/produits/details/aletoire/${uuid}`,
    BLOCK: (uuid: string) => `/produits/${uuid}/bloquer`,
    UNBLOCK: (uuid: string) => `/produits/${uuid}/debloquer`,
    EXPORT_PDF: "/produits/produit-export-pdf",
  },

  // Catégories
  CATEGORIES: {
    LIST: "/categories",
    DETAIL: (uuid: string) => `/categories/${uuid}`,
    BY_SLUG: (slug: string) => `/categories/by-slug/${slug}`,
    CREATE: "/categories/creer-categorie",
    UPDATE: (uuid: string) => `/categories/modifier/${uuid}`,
    DELETE: (uuid: string) => `/categories/${uuid}`,
    ALL_ELEMENTS: (uuid: string) => `/categories/${uuid}/all-elements`,
    PRODUITS: (uuid: string) => `/categories/${uuid}/produits`,
    DONS: (uuid: string) => `/categories/${uuid}/dons`,
    ECHANGES: (uuid: string) => `/categories/${uuid}/echanges`,
    ANNONCES: (uuid: string) => `/categories/${uuid}/annonces`,
    ALL: (uuid: string) => `/categories/${uuid}/tous`,
    EXPORT_PDF: "/categories/categorie-export-pdf",
    WITH_ITEMS: "/categories/with-items",
    WITH_ITEMS_BY_UUID: (uuid: string) => `/categories/${uuid}/with-items`,
    BY_LIBELLE_WITH_ITEMS: (libelle: string) =>
      `/categories/libelle/${libelle}/with-items`,
    BY_TYPE_WITH_ITEMS: (type: string) => `/categories/type/${type}/with-items`,
  },

  // Dons
  DONS: {
    LIST: "/dons/liste-tous-dons",
    PUBLISHED: "/dons/liste-don-publies",
    UNPUBLISH: (uuid: string) => `/dons/${uuid}/restore`,
    VENDEUR_DONS: "/dons/liste-don-vendeur",
    USER_DONS: "/dons/liste-don-utilisateur",
    VENDEUR_BLOCKED: "/dons/liste-dons-bloques-vendeur",
    USER_BLOCKED: "/dons/liste-dons-bloques-utilisateur",
    AJOUT_DON_FAVORIS: (uuid: string) => `/dons/ajouter-favoris/${uuid}`,
    DONS_FAVORIS: "/dons/liste-dons-favoris",
    DETAIL: (uuid: string) => `/dons/${uuid}`,
    DETAIL_NON_PUBLIE: (uuid: string) => `/dons/non-publie/${uuid}`,
    CREATE: "/dons/creer-don-agent-vendeur-utilisateur",
    UPDATE: (uuid: string) => `/dons/${uuid}`,
    DELETE: (uuid: string) => `/dons/${uuid}`,
    PUBLISH: "/dons/publier",
    UPDATE_STOCK_USER: (uuid: string) => `/dons/stock-don-utilisateur/${uuid}`,
    UPDATE_STOCK_DON: (uuid: string) => `/dons/stock-don-vendeur/${uuid}`,
    UPDATE_STOCK_CLIENT: (uuid: string) => `/dons/stock-don-client/${uuid}`,
    VALIDATE: (uuid: string) => `/dons/${uuid}/validate`,
    RANDOM_DETAIL: (uuid: string) => `/dons/details/aleatoire/${uuid}`,
    EXPORT_PDF: "/dons/don-export-pdf",
  },

  // Notes
  NOTES: {
    CREATE: "/notes",
    UPDATE: (uuid: string) => `/notes/${uuid}`,
    DELETE: (uuid: string) => `/notes/${uuid}`,
    BY_PRODUIT: (produitUuid: string) => `/notes/produit/${produitUuid}`,
    BY_DON: (donUuid: string) => `/notes/don/${donUuid}`,
    BY_ECHANGE: (echangeUuid: string) => `/notes/echange/${echangeUuid}`,
    STATS_PRODUIT: (produitUuid: string) =>
      `/notes/stats/produit/${produitUuid}`,
    STATS_DON: (donUuid: string) => `/notes/stats/don/${donUuid}`,
    STATS_ECHANGE: (echangeUuid: string) =>
      `/notes/stats/echange/${echangeUuid}`,
    UTILISATEUR_NOTE: (entiteType: string, entiteUuid: string) =>
      `/notes/utilisateur/ma-note/${entiteType}/${entiteUuid}`,
    PEUT_NOTER: (entiteType: string, entiteUuid: string) =>
      `/notes/peut-noter/${entiteType}/${entiteUuid}`,
    TOP_PRODUITS: "/notes/top/produits",
    TOP_DONS: "/notes/top/dons",
    TOP_ECHANGES: "/notes/top/echanges",
  },

  // Échanges
  ECHANGES: {
    LIST: "/echanges/liste-de-toutes-echanges",
    PUBLISHED: "/echanges/liste-toutes-echanges-publiees",
    BLOCKED: "/echanges/liste-toutes-echanges-bloquees",
    USER_ECHANGES: "/echanges/liste-echange-utilisateur",
    USER_BLOCKED: "/echanges/liste-echange-bloquees-utilisateur",
    VENDEUR_ECHANGES: "/echanges/liste-echange-vendeur",
    VENDEUR_BLOCKED: "/echanges/liste-echange-bloque-vendeur",
    DETAIL: (uuid: string) => `/echanges/${uuid}`,
    AJOUT_ECHANGE_FAVORIS: (uuid: string) =>
      `/echanges/ajouter-echange-favoris/${uuid}`,
    ECHANGES_FAVORIS: "/echanges/liste-echange-favoris-utilisateur",
    DETAIL_NON_PUBLIE: (uuid: string) => `/echanges/non-publie/${uuid}`,
    BY_STATUS: (statut: string) => `/echanges/statut/${statut}`,
    CREATE: "/echanges/creer-vendeur-agent-utilisateur",
    UPDATE: (uuid: string) => `/echanges/${uuid}`,
    DELETE: (uuid: string) => `/echanges/${uuid}`,
    ACCEPT: (uuid: string) => `/echanges/${uuid}/accept`,
    REFUSE: (uuid: string) => `/echanges/${uuid}/refuse`,
    PUBLISH: "/echanges/publier",
    UPDATE_STOCK_ECHANGE: (uuid: string) =>
      `/echanges/stoquer-echange-utilisateur/${uuid}`,
    UPDATE_STOCK_VENDEUR: (uuid: string) =>
      `/echanges/stoquer-echange-vendeur/${uuid}`,
    UPDATE_STOCK_CLIENT: (uuid: string) =>
      `/echanges/stoquer-echange-client/${uuid}`,
    RANDOM_DETAIL: (uuid: string) => `/echanges/details/aleatoire/${uuid}`,
    UPLOAD: "/echanges/upload",
    GET_UPLOAD: (filename: string) => `/echanges/uploads/${filename}`,
    EXPORT_PDF: "/echanges/export-echange-pdf",
  },

  // Commentaires
  COMMENTAIRES: {
    CREATE: "/commentaires/creer",
    BY_PRODUIT: (produitUuid: string) => `/commentaires/produit/${produitUuid}`,
    USER_COMMENTS: "/commentaires/utilisateur",
    UPDATE: (uuid: string) => `/commentaires/${uuid}`,
    DELETE: (uuid: string) => `/commentaires/${uuid}`,
    REPORT: (uuid: string) => `/commentaires/${uuid}/signaler`,
    REPORTED_LIST: "/commentaires/signales",
    DEACTIVATE: (uuid: string) => `/commentaires/${uuid}/desactiver`,
  },

  // Favoris
  FAVORIS: {
    LIST: "/favoris",
    PRODUITS: "/favoris/produits",
    CHECK: (produitUuid: string) => `/favoris/check/${produitUuid}`,
    ADD: "/favoris",
    REMOVE: (produitUuid: string) => `/favoris/${produitUuid}`,
  },

  // Client (pour les utilisateurs front-end)
  CLIENT: {
    LOGIN: "/client/login",
    REGISTER: "/client/register",
  },

  // Dashboards
  DASHBOARD: {
    ADMIN: "/dashboard-admin",
    AGENT: "/dashboard-agent",
    UTILISATEUR: "/dashboard-utilisateur",
    VENDEUR: "/dashboard-vendeur",
  },

  // Autres
  NOTIFICATIONS: "/notifications",
  HISTORIQUE_VALIDATION: "/historique-validation",
  MESSAGE_PERMISSION: "/message-permission",
} as const;
