// services/utilisateurs/user.types.ts
export interface User {
  uuid: string;
  code_utilisateur: string | null;
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
  agentUuid: string | null;
  is_admin: boolean;
  email_verifie_le: string | null;
  token_verification: string | null;
  statut_matrimonial_uuid: string | null;
  date_naissance: string | null;
  statut: string;
  adminUuid: string;
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
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface UsersResponse {
  data: User[];
  count: number;
  status: string;
  message?: string;
}
