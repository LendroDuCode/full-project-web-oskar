// Dans base.entity.ts, changez les types
export interface BaseEntity {
  uuid: string;
  created_at?: string | null; // Changez de string | undefined à string | null
  updated_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
}
/**
 * Interface pour la pagination
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Interface pour les erreurs de validation
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

/**
 * Interface pour les options de filtre
 */
export interface FilterOptions {
  search?: string;
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
  [key: string]: any;
}

/**
 * Type pour les statuts communs
 */
export type StatusType =
  | "actif"
  | "inactif"
  | "archive"
  | "brouillon"
  | "en_attente"
  | "en_cours"
  | "termine"
  | "annule"
  | "suspendu";
