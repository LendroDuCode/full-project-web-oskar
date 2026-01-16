// types/api.ts

// Options pour les requêtes API
export interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: HeadersInit;
  body?: any;
  timeout?: number;
  requiresAuth?: boolean;
  cache?: RequestCache;
  signal?: AbortSignal;
}

// Réponse API standard
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  headers: Headers;
  statusText?: string;
}

// Structure d'erreur API
export interface ApiError {
  status: number;
  message: string;
  details?: any;
  code?: string;
  originalError?: any;
}

// Interface pour les réponses paginées (optionnel)
export interface PaginatedResponse<T = any> {
  data: T[];
  count: number;
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Interface pour les réponses standard de votre backend
export interface BackendResponse<T = any> {
  status: "success" | "error";
  data?: T;
  count?: number;
  message?: string;
  error?: string;
  details?: any;
}

// Paramètres de pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: any; // Pour les filtres supplémentaires
}
