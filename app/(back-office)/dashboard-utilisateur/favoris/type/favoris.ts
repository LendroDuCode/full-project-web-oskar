export interface FavoriItem {
  uuid: string;
  itemUuid: string;
  produitUuid: string | null;
  donUuid: string | null;
  echangeUuid: string | null;
  type: "produit" | "don" | "echange";
  utilisateurUuid: string;
  createdAt: string;
  produit?: ProduitFavori;
  don?: DonFavori;
  echange?: EchangeFavori;
  utilisateur?: {
    nom: string;
    prenoms: string;
    avatar?: string;
    email: string;
  };
}

export interface ProduitFavori {
  uuid: string;
  libelle: string;
  description?: string;
  prix: string;
  image: string;
  statut: string;
  estPublie: boolean;
  estBloque: boolean;
  quantite: number;
  createur?: {
    nom: string;
    prenoms: string;
    avatar?: string;
    email: string;
    telephone: string;
  };
  categorie?: {
    libelle: string;
  };
  vendeur?: {
    nom: string;
    prenoms: string;
    avatar?: string;
  };
  boutique?: {
    nom: string;
  };
}

export interface DonFavori {
  uuid: string;
  nom: string;
  titre: string;
  type_don: string;
  description?: string;
  image: string;
  statut: string;
  prix: number;
  estPublie: boolean;
  est_bloque?: boolean;
  createur?: {
    nom: string;
    prenoms: string;
    avatar?: string;
    email: string;
    telephone: string;
  };
  quantite: number;
  date_debut: string;
  categorie?: string;
  nom_donataire?: string;
}

export interface EchangeFavori {
  uuid: string;
  nomElementEchange: string;
  message: string;
  prix: string;
  image: string;
  statut: string;
  estPublie: boolean;
  estBloque?: boolean;
  quantite: number;
  dateProposition: string;
  categorie?: string;
  nom_initiateur?: string;
  typeDestinataire?: string;
}

export interface FavorisResponse {
  favoris: FavoriItem[];
  total: number;
}
