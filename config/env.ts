// config/env.ts
export const API_CONFIG = {
  // URL de base de l'API
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005",

  // Headers par défaut
  DEFAULT_HEADERS: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },

  // Options de fetch par défaut
  DEFAULT_FETCH_OPTIONS: {
    cache: "no-store" as RequestCache,
    credentials: "include" as RequestCredentials,
  },

  // Timeout en millisecondes
  TIMEOUT: 10000, // 10 secondes

  // Mode proxy
  USE_PROXY: process.env.NEXT_PUBLIC_USE_PROXY === "true",
} as const;

/**
 * Construit l'URL complète pour une requête API
 * Gère automatiquement le proxy si nécessaire
 */
export const buildApiUrl = (endpoint: string): string => {
  // Nettoyer l'endpoint
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // Si on utilise le proxy, utiliser le chemin relatif /api/
  if (API_CONFIG.USE_PROXY) {
    // Retirer le premier slash si présent dans l'endpoint pour éviter les doubles slashes
    const proxyEndpoint = cleanEndpoint.startsWith("/")
      ? cleanEndpoint.substring(1)
      : cleanEndpoint;
    return `/api/${proxyEndpoint}`;
  }

  // Sinon, utiliser l'URL directe
  return `${API_CONFIG.BASE_URL}${cleanEndpoint}`;
};

/**
 * Fonction utilitaire pour créer un AbortController avec timeout
 */
export const createFetchWithTimeout = (
  timeoutMs: number = API_CONFIG.TIMEOUT,
) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  return {
    controller,
    timeoutId,
    signal: controller.signal,
    cleanup: () => clearTimeout(timeoutId),
  };
};

/**
 * Fonction pour normaliser les erreurs de fetch
 */
export const normalizeFetchError = (error: any): string => {
  if (error.name === "AbortError") {
    return "La requête a expiré. Veuillez réessayer.";
  }

  if (error.message?.includes("Failed to fetch")) {
    return "Erreur de connexion au serveur. Vérifiez votre connexion internet.";
  }

  if (error.message?.includes("NetworkError")) {
    return "Erreur réseau. Vérifiez que le serveur est accessible.";
  }

  return error.message || "Une erreur inattendue s'est produite.";
};

/**
 * Vérifie si la réponse est du HTML (indiquant une erreur)
 */
export const isHtmlResponse = (
  contentType: string | null,
  text: string,
): boolean => {
  const isHtmlContentType = contentType?.includes("text/html") || false;
  const startsWithHtml =
    text.trim().startsWith("<!DOCTYPE") || text.includes("<html");

  return isHtmlContentType || startsWithHtml;
};

/**
 * Parse une réponse JSON en toute sécurité
 */
export const safeJsonParse = async <T>(response: Response): Promise<T> => {
  const text = await response.text();
  const contentType = response.headers.get("content-type");

  // Vérifier si c'est du HTML (erreur)
  if (isHtmlResponse(contentType, text)) {
    throw new Error(
      `Le serveur a retourné du HTML au lieu de JSON (${response.status}). ` +
        `Vérifiez que l'endpoint existe et que le serveur fonctionne correctement.`,
    );
  }

  // Essayer de parser comme JSON
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Contenu non-JSON reçu:", text.substring(0, 500));
    throw new Error(
      `Réponse invalide du serveur. Attendu: JSON, Reçu: ${contentType}`,
    );
  }
};
