// services/agents/agent.types.ts
export interface Agent {
  // Informations de base
  uuid: string;
  code_agent: string | null;
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

  // Champs spécifiques aux agents
  matricule?: string;
  departement?: string;
  poste?: string;
  date_embauche?: string;
  salaire?: number;
  type_contrat?: string;
  date_fin_contrat?: string | null;
  statut_contrat?: string;
  superviseur_uuid?: string | null;
  zone_affectation?: string;
  permissions_speciales?: string[];

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

  adresse?: {
    uuid: string;
    adresse: string;
    complement: string;
    code_postal: string;
    ville: string;
    pays: string;
  };

  superviseur?: {
    uuid: string;
    nom: string;
    prenoms: string;
    email: string;
  };
}

export interface AgentCreateData {
  // Données minimales pour la création
  nom: string;
  prenoms: string;
  email: string;
  telephone: string;
  mot_de_passe: string;
  civilite_uuid: string;
  role_uuid: string;
  matricule?: string;
  departement?: string;
  poste?: string;
  date_embauche?: string;
  type_contrat?: string;
  salaire?: number;
  zone_affectation?: string;
}

export interface AgentUpdateData {
  nom?: string;
  prenoms?: string;
  email?: string;
  telephone?: string;
  civilite_uuid?: string;
  role_uuid?: string;
  matricule?: string;
  departement?: string;
  poste?: string;
  date_embauche?: string;
  type_contrat?: string;
  salaire?: number;
  zone_affectation?: string;
  statut_contrat?: string;
  date_fin_contrat?: string;
  superviseur_uuid?: string;
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
  departement?: string;
  poste?: string;
  statut_contrat?: string;
}

export interface AgentsResponse {
  data: Agent[];
  count: number;
  status: string;
  message?: string;
}

export interface AgentStats {
  total_agents: number;
  agents_actifs: number;
  agents_bloques: number;
  agents_supprimes: number;
  par_departement: Record<string, number>;
  par_poste: Record<string, number>;
  par_statut_contrat: Record<string, number>;
}

export interface AgentPerformance {
  uuid: string;
  nom: string;
  prenoms: string;
  total_taches: number;
  taches_terminees: number;
  taches_en_cours: number;
  taux_reussite: number;
  evaluations_moyenne: number;
  date_derniere_evaluation?: string;
}
