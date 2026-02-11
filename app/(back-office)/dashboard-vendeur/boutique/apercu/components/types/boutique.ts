// src/types/boutique.ts
export interface TypeBoutique {
  uuid: string;
  code: string;
  libelle: string;
  description: string | null;
  peut_vendre_produits: boolean;
  peut_vendre_biens: boolean;
  image: string;
  statut: string;
}

export interface Boutique {
  is_deleted: boolean;
  deleted_at: string | null;
  id: number;
  uuid: string;
  type_boutique_uuid: string;
  nom: string;
  slug: string;
  description: string | null;
  logo: string | null;
  banniere: string | null;
  politique_retour: string | null;
  conditions_utilisation: string | null;
  logo_key: string;
  banniere_key: string;
  statut: "en_review" | "actif" | "bloque" | "ferme";
  created_at: string;
  updated_at: string;
  type_boutique: TypeBoutique;
  vendeurUuid: string;
  agentUuid: string | null;
  est_bloque: boolean;
  est_ferme: boolean;
}

export interface PaginatedResponse {
  data: Boutique[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BoutiqueFormData {
  type_boutique_uuid: string;
  nom: string;
  description: string;
  logo: File | null;
  banniere: File | null;
  politique_retour: string;
  conditions_utilisation: string;
}
