// services/vendeurs/vendeur.types.ts
export interface Vendeur {
  // Informations de base
  uuid: string;
  code_vendeur: string | null;
  civilite_uuid: string | null;
  nom: string;
  prenoms: string;
  indicatif: string | null;
  telephone: string;
  email: string;
  mot_de_passe: string;
  avatar: string | null;
  code: string | null;
  est_verifie: boolean;
  est_bloque: boolean;
  is_admin: boolean;
  email_verifie_le: string | null;
  token_verification: string | null;
  statut_matrimonial_uuid: string | null;
  date_naissance: string | null;
  statut: string;
  adminUuid: string | null;
  role_uuid: string;
  adresse_uuid: string | null;
  created_at: string | null;
  updated_at: string | null;
  is_deleted: boolean;
  deleted_at: string | null;
  id: number;
  otp: string | null;
  otp_expire: string | null;
  is_active_otp: number;

  // Champs spécifiques aux vendeurs
  nom_boutique?: string;
  description_boutique?: string;
  logo_boutique?: string;
  slogan_boutique?: string;
  site_web?: string;
  note_moyenne?: number;
  total_ventes?: number;
  total_clients?: number;

  // Relations (peuvent être présentes dans la réponse)
  civilite?: {
    uuid: string;
    libelle: string;
    slug: string;
    statut: string;
  };

  role?: {
    uuid: string;
    name: string;
    feature: string;
    status: string;
    created_at: string;
    updatedAt: string;
  };

  boutique?: {
    uuid: string;
    nom: string;
    slug: string;
    statut: string;
    est_actif: boolean;
  };

  adresse?: {
    uuid: string;
    adresse: string;
    complement: string;
    code_postal: string;
    ville: string;
    pays: string;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  est_bloque?: boolean;
  est_verifie?: boolean;
}

export interface VendeursResponse {
  data: Vendeur[];
  count: number;
  status: string;
  message?: string;
}
