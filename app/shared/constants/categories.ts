import colors from "./colors";

// ============================================
// CONFIGURATION DES CATÉGORIES PRINCIPALES
// ============================================
export const CATEGORY_CONFIG = {
  Électronique: {
    slug: "electronique-1770771207016",
    icon: "fa-laptop",
    color: "#2196F3",
    secondaryColor: "#1976D2",
    heroTitle: "Électronique",
    heroDescription:
      "Smartphones, ordinateurs, tablettes, accessoires et plus encore.",
    badgeColor: "#1565C0",
  },
  "Vêtements & Chaussures": {
    slug: "vetements-and-chaussures-1770771284304",
    icon: "fa-tshirt",
    color: colors.oskar.green,
    secondaryColor: "#2E7D32",
    heroTitle: "Vêtements & Chaussures",
    heroDescription:
      "Mode homme, femme, enfant. Donnez une seconde vie à vos vêtements.",
    badgeColor: "#1B5E20",
  },
  "Don & Échange": {
    slug: "don-and-echange-1770771249386",
    icon: "fa-gift",
    color: "#FF9800",
    secondaryColor: "#F57C00",
    heroTitle: "Dons & Échanges",
    heroDescription:
      "Donnez ou échangez des objets. Faites plaisir et recevez en retour.",
    badgeColor: "#E65100",
  },
  "Éducation & Culture": {
    slug: "education-and-culture-1770771309698",
    icon: "fa-book",
    color: "#9C27B0",
    secondaryColor: "#7B1FA2",
    heroTitle: "Éducation & Culture",
    heroDescription:
      "Livres, fournitures scolaires, instruments de musique, jeux éducatifs.",
    badgeColor: "#4A148C",
  },
  "Services de proximité": {
    slug: "services-de-proximite-1770771349737",
    icon: "fa-hand-holding-heart",
    color: "#FF5722",
    secondaryColor: "#E64A19",
    heroTitle: "Services de proximité",
    heroDescription:
      "Services locaux entre particuliers : cours, jardinage, bricolage.",
    badgeColor: "#BF360C",
  },
  Autres: {
    slug: "autres-1770771379149",
    icon: "fa-ellipsis-h",
    color: "#757575",
    secondaryColor: "#616161",
    heroTitle: "Autres catégories",
    heroDescription: "Découvrez toutes nos autres catégories d'annonces.",
    badgeColor: "#424242",
  },
};

// ============================================
// CONFIGURATION DES SOUS-CATÉGORIES
// ============================================
export const SUB_CATEGORY_CONFIG = {
  Don: {
    icon: "fa-gift",
    color: "#FF9800",
    description: "Donnez des objets dont vous n'avez plus besoin",
    parentType: "Don & Échange",
  },
  Échange: {
    icon: "fa-exchange-alt",
    color: "#9C27B0",
    description: "Échangez vos objets contre d'autres articles",
    parentType: "Don & Échange",
  },
  Vêtements: {
    icon: "fa-tshirt",
    color: colors.oskar.green,
    description: "Vêtements homme, femme et enfant",
    parentType: "Vêtements & Chaussures",
  },
  Chaussures: {
    icon: "fa-shoe-prints",
    color: "#2196F3",
    description: "Chaussures de toutes pointures",
    parentType: "Vêtements & Chaussures",
  },
  Éducation: {
    icon: "fa-graduation-cap",
    color: "#9C27B0",
    description: "Livres, fournitures, cours particuliers",
    parentType: "Éducation & Culture",
  },
  Culture: {
    icon: "fa-palette",
    color: "#E91E63",
    description: "Arts, musique, loisirs créatifs",
    parentType: "Éducation & Culture",
  },
};

// ============================================
// CATÉGORIES PAR DÉFAUT (FALLBACK)
// ============================================
export const DEFAULT_CATEGORIES = [
  {
    uuid: "electronique-default",
    libelle: "Électronique",
    slug: "electronique-1770771207016",
    type: "Électronique",
    description: "Smartphones, ordinateurs, tablettes, accessoires",
    enfants: [],
    is_deleted: false,
  },
  {
    uuid: "vetements-default",
    libelle: "Vêtements & Chaussures",
    slug: "vetements-and-chaussures-1770771284304",
    type: "Vêtements & Chaussures",
    description: "Vêtements homme, femme, enfant",
    enfants: [
      {
        uuid: "vetements-sub-default",
        libelle: "Vêtements",
        slug: "vetements",
        type: "Vêtements",
        description: "Vêtements homme, femme, enfant",
        path: "vetements-default",
        depth: 1,
        is_deleted: false,
      },
      {
        uuid: "chaussures-sub-default",
        libelle: "Chaussures",
        slug: "chaussures",
        type: "Chaussures",
        description: "Chaussures de toutes pointures",
        path: "vetements-default",
        depth: 1,
        is_deleted: false,
      },
    ],
    is_deleted: false,
  },
  {
    uuid: "dons-default",
    libelle: "Don & Échange",
    slug: "don-and-echange-1770771249386",
    type: "Don & Échange",
    description: "Dons et échanges entre particuliers",
    enfants: [
      {
        uuid: "don-sub-default",
        libelle: "Don",
        slug: "don",
        type: "Don",
        description: "Faire un don",
        path: "dons-default",
        depth: 1,
        is_deleted: false,
      },
      {
        uuid: "echange-sub-default",
        libelle: "Échange",
        slug: "echange",
        type: "Échange",
        description: "Proposer un échange",
        path: "dons-default",
        depth: 1,
        is_deleted: false,
      },
    ],
    is_deleted: false,
  },
  {
    uuid: "education-default",
    libelle: "Éducation & Culture",
    slug: "education-and-culture-1770771309698",
    type: "Éducation & Culture",
    description: "Livres, fournitures scolaires, culture",
    enfants: [
      {
        uuid: "education-sub-default",
        libelle: "Éducation",
        slug: "education",
        type: "Éducation",
        description: "Livres, fournitures scolaires",
        path: "education-default",
        depth: 1,
        is_deleted: false,
      },
      {
        uuid: "culture-sub-default",
        libelle: "Culture",
        slug: "culture",
        type: "Culture",
        description: "Arts, musique, loisirs",
        path: "education-default",
        depth: 1,
        is_deleted: false,
      },
    ],
    is_deleted: false,
  },
  {
    uuid: "services-default",
    libelle: "Services de proximité",
    slug: "services-de-proximite-1770771349737",
    type: "Services de proximité",
    description: "Services locaux entre particuliers",
    enfants: [],
    is_deleted: false,
  },
  {
    uuid: "autres-default",
    libelle: "Autres",
    slug: "autres-1770771379149",
    type: "Autres",
    description: "Autres catégories d'annonces",
    enfants: [],
    is_deleted: false,
  },
];
