// components/produits/shared/types.ts
export interface Produit {
  id: number;
  uuid: string;
  libelle: string;
  slug: string;
  type: string | null;
  image: string;
  image_key: string;
  promo: number | null;
  promo_date_fin: string | null;
  code_barre: string | null;
  poids: string | null;
  dimensions: string | null;
  couleur: string | null;
  disponible: boolean;
  statut: string;
  prix: string;
  description: string | null;
  etoile: number;
  quantite: number;
  note_moyenne: number;
  nombre_avis: number;
  nombre_favoris: number;
  createdAt: string | null;
  updatedAt: string | null;
  utilisateurUuid: string;
  vendeurUuid: string;
  boutiqueUuid: string | null;
  categorie_uuid: string;
  estPublie: boolean;
  estBloque: boolean;
  is_favoris: boolean;
  estUtilisateur: boolean;
  estVendeur: boolean;
  categorie?: {
    uuid: string;
    libelle: string;
    type: string;
    image: string;
  };
  utilisateur?: {
    uuid: string;
    nom: string;
    prenoms: string;
    avatar: string;
    email: string;
  };
  source?: {
    type: string;
    email: string;
    telephone: string;
    boutique_uuid: string | null;
    boutique_nom: string | null;
    infos: {
      uuid: string;
      nom: string;
      prenoms: string;
      avatar: string;
      email: string;
    };
  };
}

export interface CreateProduitDto {
  libelle: string;
  type?: string;
  disponible: boolean;
  categorie_uuid: string;
  statut?: string;
  etoile?: number;
  image: File | string;
  prix: number | string;
  quantite: number;
  description?: string;
  promo?: number;
  promo_date_fin?: string;
  code_barre?: string;
  poids?: string;
  dimensions?: string;
  couleur?: string;
}

export interface UpdateProduitDto extends Partial<CreateProduitDto> {}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  pages: number;
  promo: boolean;
}

export interface SortConfig {
  key: keyof Produit;
  direction: "asc" | "desc";
}
