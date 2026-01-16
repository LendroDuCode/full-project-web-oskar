// config/env.ts
export const API_CONFIG = {
  // URL de base - utiliser le proxy Next.js pour éviter les problèmes CORS
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "", // Laissez vide pour utiliser les rewrites

  // Timeout par défaut
  TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || "30000"),

  // Headers par défaut
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },

  // Options de fetch par défaut
  DEFAULT_FETCH_OPTIONS: {
    // Utiliser 'same-origin' au lieu de 'include' pour éviter les problèmes CORS
    credentials: "same-origin" as RequestCredentials,
    cache: "no-store" as RequestCache,
  },

  // Config pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },
} as const;

// Helper pour construire les URLs
export const buildApiUrl = (endpoint: string): string => {
  // Si BASE_URL est défini via variable d'environnement, l'utiliser
  if (API_CONFIG.BASE_URL && process.env.NODE_ENV === "production") {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
  }

  // En développement, utiliser le chemin relatif (proxy Next.js)
  return endpoint;
};

// Fonction utilitaire pour les appels API
export const apiFetch = async <T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> => {
  const url = buildApiUrl(endpoint);

  const defaultOptions: RequestInit = {
    ...API_CONFIG.DEFAULT_FETCH_OPTIONS,
    headers: {
      ...API_CONFIG.DEFAULT_HEADERS,
      ...options?.headers,
    },
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error);
    throw error;
  }
};
