// types/index.ts
export interface Category {
  uuid: string;
  libelle: string;
  description: string;
  slug: string;
  image?: string;
  type?: string;
  statut?: string;
}

export interface Don {
  uuid: string;
  nom: string;
  type_don: string;
  description: string;
  image: string;
  localisation: string;
  statut: string;
  disponible: boolean;
  quantite: number;
  date_debut: string;
  categorie_uuid: string;
  vendeur_uuid: string;
  vendeur?: Vendeur;
  annonceId?: string;
}

export interface Echange {
  uuid: string;
  nomElementEchange: string;
  typeEchange: string;
  objetPropose: string;
  objetDemande: string;
  image: string;
  prix: string;
  statut: string;
  disponible: boolean;
  quantite: number;
  dateProposition: string;
  categorieUuid: string;
  annonceId?: string;
}

export interface Produit {
  uuid: string;
  libelle: string;
  slug: string;
  description: string;
  image: string;
  prix: string;
  disponible: boolean;
  statut: string;
  quantite: number;
  etoile: string;
  categorie_uuid: string;
  vendeurUuid: string;
  vendeur?: Vendeur;
  boutique?: Boutique;
  annonceId?: string;
}

export interface Vendeur {
  uuid: string;
  nom: string;
  prenoms: string;
  email: string;
  avatar?: string;
  telephone: string;
  isPro?: boolean;
}

export interface Boutique {
  uuid: string;
  nom: string;
  slug: string;
  description: string;
  statut: string;
  est_bloque: boolean;
}

export type TableItem = Don | Echange | Produit;
export type ItemType = "don" | "echange" | "produit";

// Pour compatibilité avec votre DataTable existant
export interface TableRowData {
  id: string;
  uuid: string;
  photo: string;
  title: string;
  annonceId: string;
  seller: {
    name: string;
    avatar: string;
    isPro: boolean;
  };
  type: ItemType;
  date: string;
  time: string;
  originalData: TableItem;
}
