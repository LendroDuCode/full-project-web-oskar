const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005";

// Fonction utilitaire pour ajouter le préfixe
const withBaseUrl = (endpoint: string) => {
  // Si l'endpoint commence déjà par http, ne pas ajouter la base URL
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    return endpoint;
  }
  // Nettoyer les doubles slash
  const cleanBaseUrl = API_BASE_URL.endsWith("/")
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${cleanBaseUrl}${cleanEndpoint}`;
};

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    ADMIN: {
      LOGIN: withBaseUrl("/auth/admin/login"),
      LOGOUT: withBaseUrl("/auth/admin/logout"),
      PROFILE: withBaseUrl("/auth/admin/profile"),
      MODIFIER_PROFILE: withBaseUrl("/auth/admin/modifier/profile"),
      OTP: withBaseUrl("/auth/admin/otp"),
      RESEND_OTP: withBaseUrl("/auth/admin/resend/otp"),
      FORGOT_PASSWORD: withBaseUrl("/auth/admin/generate/forget/link"),
      VERIFY_FORGET_TOKEN: withBaseUrl("/auth/admin/verify/forget/token"),
      RESET_PASSWORD: withBaseUrl("/auth/admin/reset/password"),
      GOOGLE_CONNEXION: withBaseUrl("/auth/admin/google/connexion"),
      FACEBOOK: withBaseUrl("/auth/admin/facebook"),
      LISTE_ADMIN: withBaseUrl("/admin/liste-super-admin"),
    },
    AGENT: {
      LOGIN: withBaseUrl("/auth/agent/login"),
      LOGOUT: withBaseUrl("/auth/agent/logout"),
      PROFILE: withBaseUrl("/auth/agent/profile"),
      RESET_PASSWORD: withBaseUrl("/auth/reset-password"),
      UPDATE: (uuid: string) => withBaseUrl(`/auth/${uuid}`),
      UPDATE_PASSWORD: (uuid: string) => withBaseUrl(`/auth/${uuid}/password`),
      UPDATE_PROFILE: withBaseUrl("/auth/agent/modifier/profile"),
    },
    VENDEUR: {
      LOGIN: withBaseUrl("/auth/vendeur/login"),
      REGISTER: withBaseUrl("/auth/vendeur/register"),
      LOGOUT: withBaseUrl("/auth/vendeur/logout"),
      PROFILE: withBaseUrl("/auth/vendeur/profile"),
      UPDATE_PROFILE: withBaseUrl("/auth/modifier/profile"),
      OTP: withBaseUrl("/auth/vendeur/otp"),
      RESEND_OTP: withBaseUrl("/auth/vendeur/resend/otp"),
      FORGOT_PASSWORD: withBaseUrl("/auth/vendeur/generate/forget/link"),
      VERIFY_FORGET_TOKEN: withBaseUrl("/auth/vendeur/verify/forget/token"),
      RESET_PASSWORD: withBaseUrl("/auth/vendeur/reset/password"),
      SEND_OTP: withBaseUrl("/auth/vendeur/send-otp"),
      GOOGLE_CONNEXION: withBaseUrl("/auth/vendeur/google/connexion"),
      FACEBOOK: withBaseUrl("/auth/vendeur/facebook"),
      DETAIL: (uuid: string) => withBaseUrl(`/auth/vendeur/${uuid}`),
      DELETE: (uuid: string) => withBaseUrl(`/auth/vendeur/${uuid}`),
      BLOCK: (uuid: string) => withBaseUrl(`/auth/vendeur/${uuid}/bloquer`),
      UNBLOCK: (uuid: string) => withBaseUrl(`/auth/vendeur/${uuid}/debloquer`),
      STATUS: (uuid: string) => withBaseUrl(`/auth/vendeur/${uuid}/status`),
    },
    UTILISATEUR: {
      LOGIN: withBaseUrl("/auth/utilisateur/login"),
      LOGOUT: withBaseUrl("/auth/utilisateur/logout"),
      REGISTER: withBaseUrl("/auth/utilisateur/register"),
      PROFILE: withBaseUrl("/auth/utilisateur/profile"),
      UPDATE_PROFILE: withBaseUrl("/auth/utilisateur/modifier/profile"),
      OTP: withBaseUrl("/auth/utilisateur/otp"),
      DEMANDE_VENDEUR: (uuid: string) =>
        withBaseUrl(`/auth/utilisateur/${uuid}/devenir-vendeur`),
      RESEND_OTP: withBaseUrl("/auth/utilisateur/resend/otp"),
      FORGOT_PASSWORD: withBaseUrl("/auth/utilisateur/generate/forget/link"),
      VERIFY_FORGET_TOKEN: withBaseUrl("/auth/utilisateur/verify/forget/token"),
      RESET_PASSWORD: withBaseUrl("/auth/utilisateur/reset/password"),
      SEND_OTP: withBaseUrl("/auth/utilisateur/send-otp"),
      GOOGLE_CONNEXION: withBaseUrl("/auth/utilisateur/google/connexion"),
      FACEBOOK: withBaseUrl("/auth/utilisateur/facebook"),
      DETAIL: (uuid: string) => withBaseUrl(`/auth/utilisateur/${uuid}`),
      DELETE: (uuid: string) => withBaseUrl(`/auth/utilisateur/${uuid}`),
    },
    COMMON: {
      SEND_OTP: withBaseUrl("/auth/send-otp"),
      PROFILE: withBaseUrl("/auth/profile"),
    },
  },

  AGENTS: {
    LIST: withBaseUrl("/admin/liste-agents"),
    PROFIL: withBaseUrl("/auth/agent/profile"),
    BLOCKED: withBaseUrl("/admin/liste-agents-bloques"),
    DELETED: withBaseUrl("/admin/liste-agents-supprimes"),
    CREATE: withBaseUrl("/admin/creer-agent-admin"),
    DETAIL: (uuid: string) => withBaseUrl(`/admin/agent/${uuid}`),
    UPDATE: (uuid: string) =>
      withBaseUrl(`/admin/modifier-agent-par-admin/${uuid}`),
    DELETE: (uuid: string) => withBaseUrl(`/admin/supprimer-agent/${uuid}`),
    BLOCK: (uuid: string) => withBaseUrl(`/admin/agent/${uuid}/bloquer`),
    UNBLOCK: (uuid: string) => withBaseUrl(`/admin/agent/${uuid}/debloquer`),
    RESTORE: (uuid: string) => withBaseUrl(`/admin/restaurer-agent/${uuid}`),
    EXPORT_PDF: withBaseUrl("/admin/export-agents-pdf"),
    EXPORT_BLOCKED_PDF: withBaseUrl("/admin/export-agents-bloques-pdf"),
    EXPORT_DELETED_PDF: withBaseUrl("/admin/export-agents-supprimes-pdf"),
  },

  VENDEURS: {
    PROFIL: withBaseUrl("/auth/vendeur/profile"),
    CREATE: withBaseUrl("/admin/creer-vendeur-admin"),
    DETAIL: (uuid: string) => withBaseUrl(`/admin/vendeur/${uuid}`),
    UPDATE: (uuid: string) =>
      withBaseUrl(`/admin/modifier-vendeur-par-admin/${uuid}`),
    DELETE: (uuid: string) => withBaseUrl(`/admin/vendeur/${uuid}`),
    BLOCK: (uuid: string) => withBaseUrl(`/admin/vendeur/${uuid}/bloquer`),
    UNBLOCK: (uuid: string) => withBaseUrl(`/admin/vendeur/${uuid}/debloquer`),
    RESTORE: (uuid: string) => withBaseUrl(`/admin/restaurer-vendeur/${uuid}`),
    EXPORT_PDF: withBaseUrl("/admin/export-vendeurs-pdf"),
    EXPORT_BLOCKED_PDF: withBaseUrl("/admin/export-vendeurs-bloques-pdf"),
    EXPORT_DELETED_PDF: withBaseUrl("/admin/export-vendeurs-supprimes-pdf"),
  },

  // Admin
  ADMIN: {
    USERS: {
      LIST: withBaseUrl("/admin/liste-utilisateurs"),
      RESET_PASSWORD_REQUEST: withBaseUrl(
        "/admin/utilisateurs/reset-password-request",
      ),
      RESET_PASSWORD: withBaseUrl("/admin/utilisateurs/reset-password"),
      VERIFY_EMAIL: withBaseUrl("/admin/utilisateurs/verify-email"),
      BASE: withBaseUrl("/admin/utilisateurs"),
      EMPTY_TRASH: withBaseUrl("/admin/utilisateurs/vider-corbeille"),
      BLOCKED: withBaseUrl("/admin/liste-utilisateurs-bloques"),
      DELETED: withBaseUrl("/admin/liste-utilisateurs-supprimes"),
      CREATE: withBaseUrl("/admin/creer-utilisateur-admin"),
      DETAIL: (uuid: string) => withBaseUrl(`/admin/utilisateur/${uuid}`),
      UPDATE: (uuid: string) =>
        withBaseUrl(`/admin/modifier-utilisateur-par-admin/${uuid}`),
      DELETE: (uuid: string) => withBaseUrl(`/admin/utilisateur/${uuid}`),
      BLOCK: (uuid: string) =>
        withBaseUrl(`/admin/utilisateur/${uuid}/bloquer`),
      UNBLOCK: (uuid: string) =>
        withBaseUrl(`/admin/utilisateur/${uuid}/debloquer`),
      RESTORE: (uuid: string) =>
        withBaseUrl(`/admin/restaurer-utilisateur/${uuid}`),
      EXPORT_PDF: withBaseUrl("/admin/export-utilisateurs-pdf"),
      EXPORT_BLOCKED_PDF: withBaseUrl("/admin/export-utilisateurs-bloques-pdf"),
      EXPORT_DELETED_PDF: withBaseUrl(
        "/admin/export-utilisateurs-supprimes-pdf",
      ),
      PROFILE: withBaseUrl("/admin/profile"),
    },
    AGENTS: {
      LIST: withBaseUrl("/admin/liste-agents"),
      PROFIL: withBaseUrl("/auth/agent/profile"),
      BLOCKED: withBaseUrl("/admin/liste-agents-bloques"),
      DELETED: withBaseUrl("/admin/liste-agents-supprimes"),
      CREATE: withBaseUrl("/admin/creer-agent-admin"),
      DETAIL: (uuid: string) => withBaseUrl(`/admin/agent/${uuid}`),
      UPDATE: (uuid: string) =>
        withBaseUrl(`/admin/modifier-agent-par-admin/${uuid}`),
      DELETE: (uuid: string) => withBaseUrl(`/admin/supprimer-agent/${uuid}`),
      BLOCK: (uuid: string) => withBaseUrl(`/admin/agent/${uuid}/bloquer`),
      UNBLOCK: (uuid: string) => withBaseUrl(`/admin/agent/${uuid}/debloquer`),
      RESTORE: (uuid: string) => withBaseUrl(`/admin/restaurer-agent/${uuid}`),
      EXPORT_PDF: withBaseUrl("/admin/export-agents-pdf"),
      EXPORT_BLOCKED_PDF: withBaseUrl("/admin/export-agents-bloques-pdf"),
      EXPORT_DELETED_PDF: withBaseUrl("/admin/export-agents-supprimes-pdf"),
    },
    VENDEURS: {
      LIST: withBaseUrl("/admin/liste-vendeurs"),
      BLOCKED: withBaseUrl("/admin/liste-vendeurs-bloques"),
      DELETED: withBaseUrl("/admin/liste-vendeurs-supprimes"),
      PROFIL: withBaseUrl("/auth/vendeur/profile"),
      CREATE: withBaseUrl("/admin/creer-vendeur-admin"),
      DETAIL: (uuid: string) => withBaseUrl(`/admin/vendeur/${uuid}`),
      UPDATE: (uuid: string) =>
        withBaseUrl(`/admin/modifier-vendeur-par-admin/${uuid}`),
      DELETE: (uuid: string) => withBaseUrl(`/admin/vendeur/${uuid}`),
      BLOCK: (uuid: string) => withBaseUrl(`/admin/vendeur/${uuid}/bloquer`),
      UNBLOCK: (uuid: string) =>
        withBaseUrl(`/admin/vendeur/${uuid}/debloquer`),
      RESTORE: (uuid: string) =>
        withBaseUrl(`/admin/restaurer-vendeur/${uuid}`),
      EXPORT_PDF: withBaseUrl("/admin/export-vendeurs-pdf"),
      EXPORT_BLOCKED_PDF: withBaseUrl("/admin/export-vendeurs-bloques-pdf"),
      EXPORT_DELETED_PDF: withBaseUrl("/admin/export-vendeurs-supprimes-pdf"),
    },
  },

  // Adresses
  ADRESSES: {
    LIST: withBaseUrl("/adresses"),
    DETAIL: (uuid: string) => withBaseUrl(`/adresses/${uuid}`),
  },

  // Annonces
  ANNONCES: {
    LIST: withBaseUrl("/annonces"),
    LIST_TOUTES_ANNONCES: withBaseUrl("/annonces/liste-toutes-annonces"),
    LISTE_TOUS_TYPE_ANNONCES: withBaseUrl(
      "/annonces/liste-tous-types-annonces",
    ),
    ALL_PUBLISHED: withBaseUrl("/annonces/all/publiees"),
    VENDEUR_ANNONCES: withBaseUrl("/annonces/toutes-annonces-vendeur-connecte"),
    VENDEUR_PUBLISHED: withBaseUrl("/annonces/vendeur/publiees"),
    VENDEUR_BLOCKED: withBaseUrl("/annonces/vendeur/bloquees"),
    USER_ANNONCES: withBaseUrl("/annonces/liste-annonces-utilisateur"),
    USER_PUBLISHED: withBaseUrl(
      "/annonces/liste-annonces-utilisateur-publiees",
    ),
    USER_BLOCKED: withBaseUrl("/annonces/liste-annonces-utilisateur-bloquees"),
    DETAIL: (uuid: string) => withBaseUrl(`/annonces/${uuid}`),
    PUBLIC_DETAIL: (uuid: string) => withBaseUrl(`/annonces/public/${uuid}`),
    PERSONAL_DETAIL: (uuid: string) => withBaseUrl(`/annonces/perso/${uuid}`),
    CREATE: withBaseUrl("/annonces"),
    DELETE: (uuid: string) => withBaseUrl(`/annonces/${uuid}`),
    PUBLISH: (uuid: string) => withBaseUrl(`/annonces/${uuid}/publier`),
    RESTORE: (uuid: string) => withBaseUrl(`/annonces/${uuid}/restore`),
    PUBLISHED_LIST: withBaseUrl("/annonces/liste-annoncces-publiees"),
    ALL_LIST: withBaseUrl("/annonces/liste-annonces"),
    EXPORT_PDF: withBaseUrl("/annonces/export-annonces-pdf"),
    UPDATE_STOCK_USER: (uuid: string) =>
      withBaseUrl(`/annonces/stock-annonce-utilisateur/${uuid}`),
    UPDATE_STOCK_VENDEUR: (uuid: string) =>
      withBaseUrl(`/annonces/stock-echange-vendeur/${uuid}`),
    RANDOM_DETAIL: (uuid: string) =>
      withBaseUrl(`/annonces/details/aleatoire/${uuid}`),
  },

  // Caractéristiques
  CARACTERISTIQUES: {
    LIST: withBaseUrl("/caracteristiques"),
    BY_TYPE: (type: string) => withBaseUrl(`/caracteristiques/by-type/${type}`),
    DETAIL: (uuid: string) => withBaseUrl(`/caracteristiques/${uuid}`),
    CREATE: withBaseUrl("/caracteristiques/creer"),
    UPDATE: (uuid: string) => withBaseUrl(`/caracteristiques/${uuid}`),
    ASSIGN_TYPE: (uuid: string) =>
      withBaseUrl(`/caracteristiques/${uuid}/assign-type`),
    TOGGLE_STATUS: (uuid: string) =>
      withBaseUrl(`/caracteristiques/${uuid}/toggle-status`),
    DELETE: (uuid: string) => withBaseUrl(`/caracteristiques/${uuid}`),
  },

  // Commandes
  COMMANDES: {
    CREATE: (panierUuid: string) =>
      withBaseUrl(`/commandes/passer-commande/${panierUuid}`),
    CREATE_DIRECT: (produitUuid: string) =>
      withBaseUrl(`/commandes/commander-direct/${produitUuid}`),
    USER_PANNIERS: withBaseUrl("/commandes/mes-paniers"),
    VENDEUR_STATS: withBaseUrl("/commandes/vendeur/boutique/statistiques"),
    LISTE_COMMANDE_UTILISATEUR: withBaseUrl(
      "/commandes/utilisateur/mes-produits-commandes",
    ),
    VENDEUR_UPDATE_STATUS: (commandeUuid: string) =>
      withBaseUrl(`/commandes/vendeur/boutique/${commandeUuid}/statut`),
    DETAIL: (uuid: string) => withBaseUrl(`/commandes/${uuid}`),
    DETAIL_COMMANDES_VENDEUR: (uuid: string) =>
      withBaseUrl(`/commandes/vendeur/boutique/commande/${uuid}`),
    BOUTIQUE_ORDERS: withBaseUrl("/commandes/liste/mes-commandes-boutique"),
    RECUPERER_COMMANDE_FILTRE: withBaseUrl(
      "/commandes/vendeur/boutique/commandes/filtrer",
    ),
    USER_ORDERS: withBaseUrl("/commandes/utilisateur/mes-commandes"),
    USER_ORDER_DETAIL: (uuid: string) =>
      withBaseUrl(`/commandes/utilisateur/mes-commandes/${uuid}`),
    USER_CANCEL: (uuid: string) =>
      withBaseUrl(`/commandes/utilisateur/mes-commandes/${uuid}/annuler`),
  },

  // Pays
  PAYS: {
    LIST: withBaseUrl("/pays/liste-pays"),
    ACTIFS: withBaseUrl("/pays/actifs"),
    BY_CODE: (code: string) => withBaseUrl(`/pays/by-code/${code}`),
    BY_NOM: (nom: string) => withBaseUrl(`/pays/by-nom/${nom}`),
    TOGGLE_STATUS: (uuid: string) => withBaseUrl(`/pays/${uuid}/toggle-status`),
    DETAIL: (uuid: string) => withBaseUrl(`/pays/${uuid}`), // <-- CECI devrait être l'endpoint GET
    CREATE: withBaseUrl("/pays/creer"),
    UPDATE: (uuid: string) => withBaseUrl(`/pays/${uuid}`), // <-- CECI est PUT
    DELETE: (uuid: string) => withBaseUrl(`/pays/${uuid}`),
    EXPORT_PDF: withBaseUrl("/pays/export-pays-pdf"),
  },

  // Rôles
  ROLES: {
    LIST: withBaseUrl("/roles"),
    UTILISATEUR_ROLES: withBaseUrl("/roles/role-utilisateur"),
    VENDEUR_ROLES: withBaseUrl("/roles/role-vendeur"),
    AGENT_ROLES: withBaseUrl("/roles/role-agent"),
    CLIENT_ROLES: withBaseUrl("/roles/role-client"),
    DETAIL: (uuid: string) => withBaseUrl(`/roles/${uuid}`),
    CREATE: withBaseUrl("/roles"),
    UPDATE: (uuid: string) => withBaseUrl(`/roles/${uuid}`),
    DELETE: (uuid: string) => withBaseUrl(`/roles/${uuid}`),
    EXPORT_PDF: withBaseUrl("/roles/export-roles-pdf"),
  },

  // Statuts Matrimoniaux
  STATUTS_MATRIMONIAUX: {
    LIST: withBaseUrl("/statuts-matrimoniaux/liste-statuts"),
    ALL: withBaseUrl("/statuts-matrimoniaux/all"),
    ACTIFS: withBaseUrl("/statuts-matrimoniaux/actifs"),
    DETAIL: (uuid: string) => withBaseUrl(`/statuts-matrimoniaux/${uuid}`),
    CREATE: withBaseUrl("/statuts-matrimoniaux/creer"),
    UPDATE: (uuid: string) => withBaseUrl(`/statuts-matrimoniaux/${uuid}`),
    DELETE: (uuid: string) => withBaseUrl(`/statuts-matrimoniaux/${uuid}`),
    EXPORT_PDF: withBaseUrl(
      "/statuts-matrimoniaux/export-statuts-matrimoniaux-pdf",
    ),
  },

  // Types de Bien
  TYPE_BIEN: {
    LIST: withBaseUrl("/type-bien"),
    TREE: withBaseUrl("/type-bien/tree"),
    DETAIL: (uuid: string) => withBaseUrl(`/type-bien/${uuid}`),
    BY_SLUG: (slug: string) => withBaseUrl(`/type-bien/slug/${slug}`),
    CHILDREN: (uuid: string) => withBaseUrl(`/type-bien/${uuid}/children`),
    CREATE: withBaseUrl("/type-bien/creer"),
    UPDATE: (uuid: string) => withBaseUrl(`/type-bien/${uuid}`),
    DELETE: (uuid: string) => withBaseUrl(`/type-bien/${uuid}`),
  },

  // Types de Transaction
  TRANSACTION_TYPES: {
    LIST: withBaseUrl("/transaction-types"),
    ACTIVE: withBaseUrl("/transaction-types/active"),
    DETAIL: (uuid: string) => withBaseUrl(`/transaction-types/${uuid}`),
    BY_SLUG: (slug: string) => withBaseUrl(`/transaction-types/slug/${slug}`),
    CREATE: withBaseUrl("/transaction-types/creer"),
    UPDATE: (uuid: string) => withBaseUrl(`/transaction-types/${uuid}`),
    TOGGLE_STATUS: (uuid: string) =>
      withBaseUrl(`/transaction-types/${uuid}/toggle-status`),
    DELETE: (uuid: string) => withBaseUrl(`/transaction-types/${uuid}`),
  },

  // Villes
  VILLES: {
    LIST: withBaseUrl("/villes/liste-ville"),
    BY_PAYS: (paysUuid: string) => withBaseUrl(`/villes/pays/${paysUuid}`),
    UPDATE: (uuid: string) => withBaseUrl(`/villes/${uuid}/coordonnees`),
    DETAIL: (uuid: string) => withBaseUrl(`/villes/${uuid}`),
    BY_CODE_POSTAL: (codePostal: string) =>
      withBaseUrl(`/villes/code-postal/${codePostal}`),
    CREATE: withBaseUrl("/villes/creer"),
    ACTIVATE: (uuid: string) => withBaseUrl(`/villes/${uuid}/active`),
    DEACTIVATE: (uuid: string) => withBaseUrl(`/villes/${uuid}/desactiver`),
    DELETE: (uuid: string) => withBaseUrl(`/villes/${uuid}`),
    EXPORT_PDF: withBaseUrl("/villes/export-villes-pdf"),
  },

  // Promotions
  PROMOTIONS: {
    LIST: withBaseUrl("/promotions"),
    DETAIL: (uuid: string) => withBaseUrl(`/promotions/${uuid}`),
    CREATE: withBaseUrl("/promotions"),
    UPDATE: (uuid: string) => withBaseUrl(`/promotions/${uuid}`),
    DELETE: (uuid: string) => withBaseUrl(`/promotions/${uuid}`),
    TOGGLE: (uuid: string) => withBaseUrl(`/promotions/${uuid}/toggle`),
    APPLY: withBaseUrl("/promotions/appliquer"),
    UPDATE_STATUSES: withBaseUrl("/promotions/cron/maj-statuts"),
  },

  // Civilités
  CIVILITES: {
    LIST: withBaseUrl("/civilites/liste-civilites"),
    ALL: withBaseUrl("/civilites"),
    ACTIVES: withBaseUrl("/civilites/actives"),
    DETAIL: (uuid: string) => withBaseUrl(`/civilites/${uuid}`),
    BY_SLUG: (slug: string) => withBaseUrl(`/civilites/par-slug/${slug}`),
    CREATE: withBaseUrl("/civilites/creer"),
    UPDATE: (uuid: string) => withBaseUrl(`/civilites/${uuid}`),
    DELETE: (uuid: string) => withBaseUrl(`/civilites/${uuid}`),
    EXPORT_PDF: withBaseUrl("/civilites/export-civilites-pdf"),
  },

  // Types de Boutique
  TYPES_BOUTIQUE: {
    LIST: withBaseUrl("/types-boutique"),
    DEFAULTS: withBaseUrl("/types-boutique/defaults"),
    DETAIL: (uuid: string) => withBaseUrl(`/types-boutique/${uuid}`),
    CREATE: withBaseUrl("/types-boutique"),
    UPDATE: (uuid: string) => withBaseUrl(`/types-boutique/modifier/${uuid}`),
    DELETE: (uuid: string) => withBaseUrl(`/types-boutique/${uuid}`),
    ACTIVATE: (uuid: string) => withBaseUrl(`/types-boutique/${uuid}/activate`),
    DEACTIVATE: (uuid: string) =>
      withBaseUrl(`/types-boutique/${uuid}/deactivate`),
    EXPORT_PDF: withBaseUrl("/types-boutique/export-type-boutique-pdf"),
  },

  // Horaires Boutique
  HORAIRES_BOUTIQUE: {
    DETAIL: (uuid: string) => withBaseUrl(`/horaires-boutique/${uuid}`),
    BY_BOUTIQUE: (boutiqueUuid: string) =>
      withBaseUrl(`/horaires-boutique/boutique/${boutiqueUuid}`),
    WEEKLY_BY_BOUTIQUE: (boutiqueUuid: string) =>
      withBaseUrl(`/horaires-boutique/boutique/${boutiqueUuid}/weekly`),
    STATUS_BY_BOUTIQUE: (boutiqueUuid: string) =>
      withBaseUrl(`/horaires-boutique/boutique/${boutiqueUuid}/status`),
    CREATE: withBaseUrl("/horaires-boutique"),
    UPDATE: (uuid: string) => withBaseUrl(`/horaires-boutique/${uuid}`),
    DELETE: (uuid: string) => withBaseUrl(`/horaires-boutique/${uuid}`),
    ADD_EXCEPTIONS: (boutiqueUuid: string) =>
      withBaseUrl(`/horaires-boutique/boutique/${boutiqueUuid}/exceptions`),
    EXTEND_HOURS: (boutiqueUuid: string) =>
      withBaseUrl(`/horaires-boutique/boutique/${boutiqueUuid}/extend-hours`),
  },

  // Boutiques
  BOUTIQUES: {
    LIST: withBaseUrl("/boutiques"),
    ALL: withBaseUrl("/boutiques/toutes"),
    LIST_WITH_PRODUITS: withBaseUrl("/boutiques/liste-boutiques"),
    LISTE_BOUTIQUES_CREE_PAR_VENDEUR: withBaseUrl(
      "/boutiques/liste-boutiques-crees-par-vendeur",
    ),
    WITH_PUBLISHED_PRODUITS: withBaseUrl(
      "/boutiques/liste-boutique-produits-publies",
    ),
    DETAIL: (uuid: string) => withBaseUrl(`/boutiques/${uuid}`),
    PUBLIC_DETAIL: (uuid: string) => withBaseUrl(`/boutiques/publie/${uuid}`),
    BY_SLUG: (slug: string) => withBaseUrl(`/boutiques/slug/${slug}`),
    CREATE: withBaseUrl("/boutiques"),
    DELETE: (uuid: string) => withBaseUrl(`/boutiques/${uuid}`),
    RESTORE: (uuid: string) => withBaseUrl(`/boutiques/${uuid}/restorer`),
    BLOCK: (uuid: string) => withBaseUrl(`/boutiques/${uuid}/bloquer`),
    UNBLOCK: (uuid: string) => withBaseUrl(`/boutiques/${uuid}/debloquer`),
    CLOSE: (uuid: string) => withBaseUrl(`/boutiques/fermer-boutique/${uuid}`),
    EXPORT_PDF: withBaseUrl("/boutiques/boutique-export-pdf"),
  },

  // Messages
  MESSAGERIE: {
    SEND: withBaseUrl("/messagerie/envoyer"),
    RECEIVED: withBaseUrl("/messagerie/recus"),
    SENT: withBaseUrl("/messagerie/envoyes"),
    DETAIL: (uuid: string) => withBaseUrl(`/messagerie/message/${uuid}`),
    MARK_READ: (uuid: string) => withBaseUrl(`/messagerie/marquer-lu/${uuid}`),
    MARK_UNREAD: (uuid: string) =>
      withBaseUrl(`/messagerie/marquer-non-lu/${uuid}`),
    ARCHIVE: (uuid: string) => withBaseUrl(`/messagerie/archiver/${uuid}`),
    REPLY: withBaseUrl("/messagerie/repondre"),
    STATS: withBaseUrl("/messagerie/statistiques"),
    PUBLIC_SEND: withBaseUrl("/messagerie/public/envoyer"),
    DELETE: (uuid: string) => withBaseUrl(`/messagerie/supprimer/${uuid}`),
  },

  // Permissions
  PERMISSIONS: {
    LIST: withBaseUrl("/permissions"),
    DETAIL: (uuid: string) => withBaseUrl(`/permissions/${uuid}`),
    CREATE: withBaseUrl("/permissions"),
    UPDATE: (uuid: string) => withBaseUrl(`/permissions/${uuid}`),
    DELETE: (uuid: string) => withBaseUrl(`/permissions/${uuid}`),
    EXPORT_PDF: withBaseUrl("/permissions/export-permissions-pdf"),
  },

  // Rôles Permissions
  ROLE_PERMISSIONS: {
    LIST: (roleUuid: string) =>
      withBaseUrl(`/role-permissions/${roleUuid}/permissions`),
    ADD: (roleUuid: string, permissionUuid: string) =>
      withBaseUrl(
        `/role-permissions/${roleUuid}/permissions/${permissionUuid}`,
      ),
    REMOVE: (roleUuid: string, permissionUuid: string) =>
      withBaseUrl(
        `/role-permissions/${roleUuid}/permissions/${permissionUuid}`,
      ),
  },

  // Panier
  PANIER: {
    GET: withBaseUrl("/panier"),
    ADD: withBaseUrl("/panier/ajouter"),
    SYNC: withBaseUrl("/panier/synchroniser"),
    CLEAR: withBaseUrl("/panier/vider"),
    UPDATE_QUANTITY: withBaseUrl("/panier/modifier-quantite"),
    REMOVE_ITEM: (produitUuid: string) =>
      withBaseUrl(`/panier/produit/${produitUuid}`),
    DETAIL: (uuid: string) => withBaseUrl(`/panier/${uuid}`),
    CURRENT: withBaseUrl("/panier/mon-panier/actuel"),
    BY_UUID: (panierUuid: string) =>
      withBaseUrl(`/panier/mon-panier/${panierUuid}`),
  },

  // Produits
  PRODUCTS: {
    LIST: withBaseUrl("/produits"),
    ALL: withBaseUrl("/produits/tous-produits"),
    PUBLISHED: withBaseUrl("/produits/published"),
    UNPUBLISH: (uuid: string) => withBaseUrl(`/produits/${uuid}/restore`),
    USER_BLOCKED: withBaseUrl("/produits/produits-utilisateur-bloques"),
    PUBLISH: (uuid: string) => withBaseUrl(`/produits/${uuid}/restore`),
    PUBLLIER: withBaseUrl("/produits/publier"),
    DELETED: withBaseUrl("/produits/deleted"),
    RESTORE: (uuid: string) => withBaseUrl(`/produits/${uuid}/restore`),
    LISTE_PRODUITS_UTILISATEUR: withBaseUrl(
      "/produits/liste-mes-utilisateur-produits",
    ),
    LISTE_PRODUITS_UTILISATEUR_BLOQUE: withBaseUrl(
      "/produits/liste-mes-utilisateur-produits",
    ),
    BLOCKED: withBaseUrl("/produits/bloques"),
    VENDEUR_PRODUCTS: withBaseUrl("/produits/liste-produits-cree-vendeur"),
    ALL_VENDEUR_PRODUCTS: withBaseUrl("/produits/all-vendeur-produit"),
    DETAIL_NON_PUBLIE: (uuid: string) =>
      withBaseUrl(`/produits/non-publie/${uuid}`),
    DETAIL: (uuid: string) => withBaseUrl(`/produits/${uuid}`),
    DETAIL_ALEATOIRE: (uuid: string) =>
      withBaseUrl(`/produits/details/aletoire/${uuid}`),
    AJOUTER_PRODUIT_FAVORIS: (uuid: string) =>
      withBaseUrl(`/produits/ajouter-produit-favoris/${uuid}`),
    DETAIL_FAVORIS_UTILISATEUR: withBaseUrl("/produits/favoris"),
    BY_SLUG: (slug: string) => withBaseUrl(`/produits/slug/${slug}`),
    CREATE: withBaseUrl("/produits/creer"),
    DELETE: (uuid: string) => withBaseUrl(`/produits/${uuid}`),
    UPDATE_STOCK_PRODUIT: (uuid: string) =>
      withBaseUrl(`/produits/stock-produit-vendeur/${uuid}`),
    RANDOM_DETAIL: (uuid: string) =>
      withBaseUrl(`/produits/details/aletoire/${uuid}`),
    BLOCK: (uuid: string) => withBaseUrl(`/produits/${uuid}/bloquer`),
    UNBLOCK: (uuid: string) => withBaseUrl(`/produits/${uuid}/debloquer`),
    EXPORT_PDF: withBaseUrl("/produits/produit-export-pdf"),
    LIST_PRODUITS_FAVORIS_UTILISATEUR: withBaseUrl(
      "/produits/favoris/utilisateur",
    ),
    LIST_PRODUITS_FAVORIS_VENDEUR: withBaseUrl("/produits/favoris/vendeur"),
  },

  // Catégories
  CATEGORIES: {
    LIST: withBaseUrl("/categories"),
    DETAIL: (uuid: string) => withBaseUrl(`/categories/${uuid}`),
    BY_SLUG: (slug: string) => withBaseUrl(`/categories/by-slug/${slug}`),
    CREATE: withBaseUrl("/categories/creer-categorie"),
    CREATE_SOUS_CATEGORIE: (uuid: string) =>
      withBaseUrl(`/categories/${uuid}/sous-categories`),
    LISTE_SOUS_CATEGORIE: (uuid: string) =>
      withBaseUrl(`/categories/${uuid}/liste-sous-categories`),
    RECUPERER_SOUS_CATEGORIE_UUID: (uuid: string) =>
      withBaseUrl(`/categories/${uuid}/sous-categories/${uuid}`),
    RECUPERER_CATEGORIE_UUID_PAR_LISTE_SOUS_CATEGORIE: (parrentUuid: string) =>
      withBaseUrl(`/categories/${parrentUuid}/sous-categories`),
    UPDATE: (uuid: string) => withBaseUrl(`/categories/modifier/${uuid}`),
    DELETE: (uuid: string) => withBaseUrl(`/categories/${uuid}`),
    ALL_ELEMENTS: (uuid: string) =>
      withBaseUrl(`/categories/${uuid}/all-elements`),
    PRODUITS: (uuid: string) => withBaseUrl(`/categories/${uuid}/produits`),
    DONS: (uuid: string) => withBaseUrl(`/categories/${uuid}/dons`),
    ECHANGES: (uuid: string) => withBaseUrl(`/categories/${uuid}/echanges`),
    ANNONCES: (uuid: string) => withBaseUrl(`/categories/${uuid}/annonces`),
    ALL: (uuid: string) => withBaseUrl(`/categories/${uuid}/tous`),
    EXPORT_PDF: withBaseUrl("/categories/categorie-export-pdf"),
    WITH_ITEMS: withBaseUrl("/categories/with-items"),
    WITH_ITEMS_BY_UUID: (uuid: string) =>
      withBaseUrl(`/categories/${uuid}/with-items`),
    BY_LIBELLE_WITH_ITEMS: (slug: string) =>
      withBaseUrl(`/categories/libelle/${slug}/with-items`),
    BY_TYPE_WITH_ITEMS: (type: string) =>
      withBaseUrl(`/categories/type/${type}/with-items`),
  },

  // Dons
  DONS: {
    LIST: withBaseUrl("/dons/liste-tous-dons"),
    PUBLISHED: withBaseUrl("/dons/liste-don-publies"),
    UNPUBLISH: (uuid: string) => withBaseUrl(`/dons/${uuid}/restore`),
    VENDEUR_DONS: withBaseUrl("/dons/liste-don-vendeur"),
    USER_DONS: withBaseUrl("/dons/liste-don-utilisateur"),
    VENDEUR_BLOCKED: withBaseUrl("/dons/liste-dons-bloques-vendeur"),
    USER_BLOCKED: withBaseUrl("/dons/liste-dons-bloques-utilisateur"),
    AJOUT_DON_FAVORIS: (uuid: string) =>
      withBaseUrl(`/dons/ajouter-favoris/${uuid}`),
    DONS_FAVORIS: withBaseUrl("/dons/liste-dons-favoris"),
    DETAIL: (uuid: string) => withBaseUrl(`/dons/${uuid}`),
    DETAIL_NON_PUBLIE: (uuid: string) =>
      withBaseUrl(`/dons/non-publie/${uuid}`),
    CREATE: withBaseUrl("/dons/creer-don-agent-vendeur-utilisateur"), // CORRIGÉ
    UPDATE: (uuid: string) => withBaseUrl(`/dons/${uuid}`),
    DELETE: (uuid: string) => withBaseUrl(`/dons/${uuid}`),
    PUBLISH: withBaseUrl("/dons/publier"),
    UPDATE_STOCK_USER: (uuid: string) =>
      withBaseUrl(`/dons/stock-don-utilisateur/${uuid}`),
    UPDATE_STOCK_DON: (uuid: string) =>
      withBaseUrl(`/dons/stock-don-vendeur/${uuid}`),
    UPDATE_STOCK_CLIENT: (uuid: string) =>
      withBaseUrl(`/dons/stock-don-client/${uuid}`),
    VALIDATE: (uuid: string) => withBaseUrl(`/dons/${uuid}/validate`),
    RANDOM_DETAIL: (uuid: string) =>
      withBaseUrl(`/dons/details/aleatoire/${uuid}`),
    EXPORT_PDF: withBaseUrl("/dons/don-export-pdf"),
    LIST_FAVORIS_DON_UTILISATEUR: withBaseUrl("/dons/favoris/utilisateur"),
    LIST_FAVORIS_DON_VENDEUR: withBaseUrl("/dons/favoris/vendeur"),
  },

  // Notes
  NOTES: {
    CREATE: withBaseUrl("/notes"),
    UPDATE: (uuid: string) => withBaseUrl(`/notes/${uuid}`),
    DELETE: (uuid: string) => withBaseUrl(`/notes/${uuid}`),
    BY_PRODUIT: (produitUuid: string) =>
      withBaseUrl(`/notes/produit/${produitUuid}`),
    BY_DON: (donUuid: string) => withBaseUrl(`/notes/don/${donUuid}`),
    BY_ECHANGE: (echangeUuid: string) =>
      withBaseUrl(`/notes/echange/${echangeUuid}`),
    STATS_PRODUIT: (produitUuid: string) =>
      withBaseUrl(`/notes/stats/produit/${produitUuid}`),
    STATS_DON: (donUuid: string) => withBaseUrl(`/notes/stats/don/${donUuid}`),
    STATS_ECHANGE: (echangeUuid: string) =>
      withBaseUrl(`/notes/stats/echange/${echangeUuid}`),
    UTILISATEUR_NOTE: (entiteType: string, entiteUuid: string) =>
      withBaseUrl(`/notes/utilisateur/ma-note/${entiteType}/${entiteUuid}`),
    PEUT_NOTER: (entiteType: string, entiteUuid: string) =>
      withBaseUrl(`/notes/peut-noter/${entiteType}/${entiteUuid}`),
    TOP_PRODUITS: withBaseUrl("/notes/top/produits"),
    TOP_DONS: withBaseUrl("/notes/top/dons"),
    TOP_ECHANGES: withBaseUrl("/notes/top/echanges"),
  },

  // Échanges
  ECHANGES: {
    LIST: withBaseUrl("/echanges/liste-de-toutes-echanges"),
    PUBLISHED: withBaseUrl("/echanges/liste-toutes-echanges-publiees"),
    BLOCKED: withBaseUrl("/echanges/liste-toutes-echanges-bloquees"),
    USER_ECHANGES: withBaseUrl("/echanges/liste-echange-utilisateur"),
    USER_BLOCKED: withBaseUrl("/echanges/liste-echange-bloquees-utilisateur"),
    VENDEUR_ECHANGES: withBaseUrl("/echanges/liste-echange-vendeur"),
    VENDEUR_BLOCKED: withBaseUrl("/echanges/liste-echange-bloque-vendeur"),
    DETAIL: (uuid: string) => withBaseUrl(`/echanges/${uuid}`),
    AJOUT_ECHANGE_FAVORIS: (uuid: string) =>
      withBaseUrl(`/echanges/ajouter-echange-favoris/${uuid}`),
    ECHANGES_FAVORIS: withBaseUrl(
      "/echanges/liste-echange-favoris-utilisateur",
    ),
    DETAIL_NON_PUBLIE: (uuid: string) =>
      withBaseUrl(`/echanges/non-publie/${uuid}`),
    BY_STATUS: (statut: string) => withBaseUrl(`/echanges/statut/${statut}`),
    CREATE: withBaseUrl("/echanges/creer-vendeur-agent-utilisateur"),
    UPDATE: (uuid: string) => withBaseUrl(`/echanges/${uuid}`),
    DELETE: (uuid: string) => withBaseUrl(`/echanges/${uuid}`),
    ACCEPT: (uuid: string) => withBaseUrl(`/echanges/${uuid}/accept`),
    REFUSE: (uuid: string) => withBaseUrl(`/echanges/${uuid}/refuse`),
    PUBLISH: withBaseUrl("/echanges/publier"),
    UPDATE_STOCK_ECHANGE: (uuid: string) =>
      withBaseUrl(`/echanges/stoquer-echange-utilisateur/${uuid}`),
    UPDATE_STOCK_VENDEUR: (uuid: string) =>
      withBaseUrl(`/echanges/stoquer-echange-vendeur/${uuid}`),
    UPDATE_STOCK_CLIENT: (uuid: string) =>
      withBaseUrl(`/echanges/stoquer-echange-client/${uuid}`),
    RANDOM_DETAIL: (uuid: string) =>
      withBaseUrl(`/echanges/details/aleatoire/${uuid}`),
    UPLOAD: withBaseUrl("/echanges/upload"),
    GET_UPLOAD: (filename: string) =>
      withBaseUrl(`/echanges/uploads/${filename}`),
    EXPORT_PDF: withBaseUrl("/echanges/export-echange-pdf"),
    LIST_ECHANGES_FAVORIS_UTILISATEUR: withBaseUrl(
      "/echanges/liste-echange-favoris-utilisateur",
    ),
    LIST_ECHANGES_FAVORIS_VENDEUR: withBaseUrl("/echanges/favoris/vendeur"),
  },

  // Commentaires
  COMMENTAIRES: {
    CREATE: withBaseUrl("/commentaires/creer"),
    FIND_COMMENTS_DON_BY_UUID: (donUuid: string) =>
      withBaseUrl(`/commentaires/don/${donUuid}`),
    BY_PRODUIT: (produitUuid: string) =>
      withBaseUrl(`/commentaires/produit/${produitUuid}`),
    FIND_COMMENTS_ECHANGE_BY_UUID: (echangeUuid: string) =>
      withBaseUrl(`/commentaires/echange/${echangeUuid}`),
    FIND_COMMENTS_PRODUIT_BY_UUID: (produitUuid: string) =>
      withBaseUrl(`/commentaires/produit/${produitUuid}`),
    USER_COMMENTS: withBaseUrl("/commentaires/utilisateur"),
    UPDATE: (uuid: string) => withBaseUrl(`/commentaires/${uuid}`),
    FIND_COMMENTS_BY_UUID: (uuid: string) =>
      withBaseUrl(`/commentaires/${uuid}`),
    DELETE: (uuid: string) => withBaseUrl(`/commentaires/${uuid}`),
    REPORT: (uuid: string) => withBaseUrl(`/commentaires/${uuid}/signaler`),
    REPORTED_LIST: withBaseUrl("/commentaires/signales"),
    DEACTIVATE: (uuid: string) =>
      withBaseUrl(`/commentaires/${uuid}/desactiver`),
  },

  // Favoris
  FAVORIS: {
    LIST: withBaseUrl("/favoris"),
    REMOVE_DON: (donUuid: string) => withBaseUrl(`/favoris/don/${donUuid}`),
    REMOVE_PRODUIT: (produitUuid: string) =>
      withBaseUrl(`/favoris/produit/${produitUuid}`),
    REMOVE_ECHANGE: (echangeUuid: string) =>
      withBaseUrl(`/favoris/echange/${echangeUuid}`),
    PRODUITS: withBaseUrl("/favoris/produits"),
    CHECK: (produitUuid: string) =>
      withBaseUrl(`/favoris/check/${produitUuid}`),
    ADD: withBaseUrl("/favoris"),
    REMOVE: (produitUuid: string) => withBaseUrl(`/favoris/${produitUuid}`),
  },

  // Client (pour les utilisateurs front-end)
  CLIENT: {
    LOGIN: withBaseUrl("/client/login"),
    REGISTER: withBaseUrl("/client/register"),
  },

  // Dashboards
  DASHBOARD: {
    ADMIN: withBaseUrl("/dashboard-admin"),
    AGENT: withBaseUrl("/dashboard-agent"),
    UTILISATEUR: withBaseUrl("/dashboard-utilisateur"),
    VENDEUR: withBaseUrl("/dashboard-vendeur"),
  },

  // Autres
  NOTIFICATIONS: withBaseUrl("/notifications"),
  HISTORIQUE_VALIDATION: withBaseUrl("/historique-validation"),
  MESSAGE_PERMISSION: withBaseUrl("/message-permission"),
} as const;
