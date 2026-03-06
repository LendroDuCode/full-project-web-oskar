// app/(front-office)/categories/components/types.ts

export interface CategoryItem {
  uuid: string;
  type: "produit" | "don" | "echange";
  titre?: string;
  nom?: string;
  libelle?: string;
  description?: string | null;
  prix?: number | string | null;
  image: string;
  date?: string | null;
  disponible?: boolean;
  statut?: string;
  numero?: string;
  localisation?: string;
  createdAt?: string | null;
  is_favoris?: boolean;
  seller?: {
    name: string;
    avatar: string;
    type?: string;
    uuid?: string;
  };
  createurDetails?: any;
  categorie?: {
    uuid: string;
    nom: string;
  };
}

export interface CategoryData {
  uuid: string;
  libelle: string;
  slug: string;
  type: string;
  description?: string;
  image?: string;
  enfants?: CategoryData[];
  path?: string | null;
}

export interface CategoryItemsResponse {
  dons?: CategoryItem[];
  echanges?: CategoryItem[];
  produits?: CategoryItem[];
  annonces?: CategoryItem[];
  items?: CategoryItem[];
  total?: number;
  stats?: {
    totalDons: number;
    totalEchanges: number;
    totalProduits: number;
    totalItems: number;
  };
}