"use client";

import { API_ENDPOINTS } from "@/config/api-endpoints";

// Définir l'interface en DEHORS de la classe
interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
  isFormData?: boolean;
  retryCount?: number;
  maxRetries?: number;
}

class ApiClient {
  private useProxy: boolean;
  private isProduction: boolean;
  private baseApiUrl: string;
  private requestCount: number = 0;
  private maxRetries: number = 3;
  private retryDelay: number = 1000;

  constructor() {
    this.useProxy = process.env.NEXT_PUBLIC_USE_PROXY === "true";
    this.isProduction = process.env.NODE_ENV === "production";
    this.baseApiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005";

    if (!this.isProduction) {
      console.log("🔧 ApiClient initialisé:", {
        useProxy: this.useProxy,
        isProduction: this.isProduction,
        baseApiUrl: this.baseApiUrl,
      });
    }
  }

  /**
   * Méthode spéciale pour envoyer des messages via la messagerie
   */
  async sendMessage(messageData: any): Promise<any> {
    try {
      console.log("📤 Envoi de message avec données:", {
        ...messageData,
        contenu: messageData.contenu
          ? `${messageData.contenu.substring(0, 50)}...`
          : "vide",
      });

      // Essayer d'abord l'endpoint de messagerie publique
      return await this.post(API_ENDPOINTS.MESSAGERIE.PUBLIC_SEND, messageData);
    } catch (error: any) {
      console.warn("⚠️ Envoi via endpoint public échoué:", error.message);

      // Si l'endpoint public échoue, essayer l'endpoint standard
      if (error.status === 404 || error.status === 401) {
        return await this.post(API_ENDPOINTS.MESSAGERIE.SEND, messageData);
      }
      throw error;
    }
  }

  /**
   * ✅ Récupère le token d'authentification depuis différentes sources
   * Gère tous les formats de token : oskar_token, temp_token, tempToken, access_token, token
   */
  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;

    // Priorité 1: Token spécifique Oskar (stocké après connexion)
    const oskarToken = localStorage.getItem("oskar_token");
    if (oskarToken) {
      if (!this.isProduction) {
        console.log(
          "🔑 Token Oskar trouvé:",
          oskarToken.substring(0, 20) + "...",
        );
      }
      return oskarToken;
    }

    // Priorité 2: temp_token (utilisé par vendeur, admin, agent)
    const tempToken = localStorage.getItem("temp_token");
    if (tempToken) {
      if (!this.isProduction) {
        console.log(
          "🔑 Token temporaire trouvé (temp_token):",
          tempToken.substring(0, 20) + "...",
        );
      }
      return tempToken;
    }

    // Priorité 3: tempToken (utilisé par utilisateur)
    const tempTokenAlt = localStorage.getItem("tempToken");
    if (tempTokenAlt) {
      if (!this.isProduction) {
        console.log(
          "🔑 Token temporaire trouvé (tempToken):",
          tempTokenAlt.substring(0, 20) + "...",
        );
      }
      return tempTokenAlt;
    }

    // Priorité 4: Cookies
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
      return null;
    };

    const cookieToken =
      getCookie("oskar_token") ||
      getCookie("access_token") ||
      getCookie("token") ||
      getCookie("temp_token") ||
      getCookie("tempToken");
    if (cookieToken) {
      if (!this.isProduction) {
        console.log("🍪 Token cookie trouvé");
      }
      return cookieToken;
    }

    // Priorité 5: Autres local storage
    const otherTokens = [
      localStorage.getItem("access_token"),
      localStorage.getItem("token"),
      sessionStorage.getItem("oskar_token"),
      sessionStorage.getItem("access_token"),
      sessionStorage.getItem("temp_token"),
      sessionStorage.getItem("tempToken"),
    ];

    const foundToken = otherTokens.find((token) => token !== null);
    if (foundToken) {
      if (!this.isProduction) {
        console.log("🔑 Token alternatif trouvé");
      }
      return foundToken;
    }

    if (!this.isProduction) {
      console.warn("⚠️ Aucun token d'authentification trouvé");
    }
    return null;
  }

  /**
   * ✅ Récupère le type d'utilisateur depuis localStorage
   */
  private getUserType(): string | null {
    if (typeof window === "undefined") return null;

    // Essayer d'abord avec oskar_user_type
    const userType = localStorage.getItem("oskar_user_type");
    if (userType) return userType;

    // Sinon, essayer d'extraire de oskar_user
    try {
      const userStr = localStorage.getItem("oskar_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.type || null;
      }
    } catch (e) {
      console.error("❌ Erreur parsing user:", e);
    }

    return null;
  }

  public getToken(): string | null {
    return this.getAuthToken();
  }

  /**
   * Construire l'URL finale en fonction de la configuration
   */
  private buildUrl(endpoint: string): string {
    // Si l'URL est déjà complète (commence par http), la retourner telle quelle
    if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
      if (this.useProxy) {
        try {
          const urlObj = new URL(endpoint);
          const baseApi = new URL(this.baseApiUrl);

          // Vérifier si c'est la même base API
          if (urlObj.origin === baseApi.origin) {
            const proxyPath = `/api${urlObj.pathname}${urlObj.search}`;
            if (!this.isProduction) {
              console.log("🔗 URL API -> Proxy:", { endpoint, proxyPath });
            }
            return proxyPath;
          }
        } catch (error) {
          console.error("❌ Erreur parsing URL:", error);
        }
      }
      return endpoint;
    }

    // Si c'est déjà un chemin proxy
    if (endpoint.startsWith("/api/")) {
      return endpoint;
    }

    // Construire l'URL finale
    if (this.useProxy) {
      // Ajouter /api devant le chemin
      const proxyPath = `/api${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
      if (!this.isProduction) {
        console.log("🔗 Chemin -> Proxy:", { endpoint, proxyPath });
      }
      return proxyPath;
    } else {
      // Construire l'URL complète
      const fullUrl = `${this.baseApiUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
      if (!this.isProduction) {
        console.log("🔗 Chemin -> URL directe:", { endpoint, fullUrl });
      }
      return fullUrl;
    }
  }

  /**
   * Gestion robuste des réponses HTTP avec retry
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    const requestUrl = response.url;
    const status = response.status;
    const statusText = response.statusText;

    if (!this.isProduction) {
      console.log("📥 API Response:", {
        url: requestUrl,
        status,
        statusText,
        ok: response.ok,
      });
    }

    // Gérer les réponses vides
    if (status === 204 || response.headers.get("content-length") === "0") {
      return {} as T;
    }

    // Essayer de récupérer le texte de la réponse
    let responseText = "";
    try {
      responseText = await response.text();
    } catch (error) {
      console.error("❌ Erreur lors de la lecture de la réponse:", error);
      responseText = "";
    }

    // IMPORTANT: Si c'est un succès (200-299), traiter comme un succès
    if (response.ok) {
      try {
        if (responseText.trim() === "") {
          return {} as T;
        }
        const data = JSON.parse(responseText);

        // Vérifier la structure standard de l'API
        if (data && typeof data === "object") {
          // Si l'API retourne un format standard {success, message, data}
          if (data.success !== undefined) {
            return data as T;
          }
          // Si l'API retourne directement les données
          return data as T;
        }

        return {} as T;
      } catch (error) {
        console.warn("⚠️ Réponse JSON invalide mais statut OK:", {
          url: requestUrl,
          status,
          preview: responseText.substring(0, 200),
        });
        return {} as T;
      }
    }

    // GESTION DES ERREURS
    let errorMessage = `Erreur ${status}: ${statusText}`;
    let errorData: any = { message: errorMessage };

    try {
      if (responseText && responseText.trim()) {
        if (
          responseText.trim().startsWith("{") ||
          responseText.trim().startsWith("[")
        ) {
          errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorData.error || errorMessage;

          // Messages spécifiques pour les erreurs communes
          if (status === 404) {
            errorMessage = `Ressource non trouvée: ${errorMessage}`;
          } else if (status === 401) {
            errorMessage = `Authentification requise: ${errorMessage}`;
          } else if (status === 403) {
            errorMessage = `Accès refusé: ${errorMessage}`;
          } else if (status === 500) {
            errorMessage = `Erreur serveur: ${errorMessage}`;
          }
        } else {
          errorMessage = responseText;
        }
      }
    } catch (parseError) {
      console.warn("⚠️ Impossible de parser l'erreur:", parseError);
    }

    // Créer l'erreur personnalisée
    const error = new Error(errorMessage);
    Object.assign(error, {
      status,
      data: errorData,
      response,
      url: requestUrl,
      isApiError: true,
    });

    // Pour les erreurs 401, on log mais on ne déconnecte pas automatiquement
    if (status === 401) {
      console.warn("⚠️ Erreur 401 (Non authentifié) - URL:", requestUrl);
      console.warn("Message:", errorMessage);

      // On peut rediriger vers la page de connexion pour les erreurs d'authentification claires
      if (
        errorMessage.includes("token") ||
        errorMessage.includes("authentification")
      ) {
        // Attendre un peu avant de rediriger pour éviter les boucles
        setTimeout(() => {
          if (
            typeof window !== "undefined" &&
            !window.location.pathname.includes("connexion") &&
            !window.location.pathname.includes("login")
          ) {
            console.log("🔐 Redirection vers la page de connexion...");
            // Rediriger vers la page de connexion appropriée
            const userType = this.getUserType();
            if (userType === "admin") {
              window.location.href = "/auth/admin/login";
            } else if (userType === "vendeur") {
              window.location.href = "/auth/vendeur/login";
            } else if (userType === "agent") {
              window.location.href = "/auth/agent/login";
            } else {
              window.location.href = "/connexion";
            }
          }
        }, 1000);
      }
    }

    throw error;
  }

  private clearAuthTokens(): void {
    if (typeof window === "undefined") return;

    console.log("🧹 Nettoyage des tokens d'authentification...");

    // Cookies
    const cookies = [
      "oskar_token",
      "access_token",
      "token",
      "temp_token",
      "tempToken",
    ];
    cookies.forEach((cookie) => {
      document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
    });

    // LocalStorage - tous les tokens
    const tokenKeys = [
      "oskar_token",
      "access_token",
      "token",
      "temp_token",
      "tempToken",
      "oskar_user",
      "oskar_user_type",
    ];
    tokenKeys.forEach((key) => {
      localStorage.removeItem(key);
    });

    // SessionStorage
    sessionStorage.removeItem("oskar_token");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("temp_token");
    sessionStorage.removeItem("tempToken");
  }

  /**
   * Méthode de requête avec retry automatique
   */
  private async requestWithRetry<T = any>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const retryCount = options.retryCount || 0;
    const maxRetries = options.maxRetries || this.maxRetries;

    try {
      return await this.request<T>(endpoint, options);
    } catch (error: any) {
      // Vérifier si on doit retenter
      const shouldRetry =
        retryCount < maxRetries &&
        (error.status === 429 || // Too Many Requests
          error.status === 500 || // Internal Server Error
          error.status === 502 || // Bad Gateway
          error.status === 503 || // Service Unavailable
          error.status === 504 || // Gateway Timeout
          error.name === "TypeError" || // Erreurs réseau
          error.message.includes("fetch failed") ||
          error.message.includes("network"));

      if (shouldRetry) {
        const delay = this.retryDelay * Math.pow(2, retryCount); // Exponential backoff
        console.log(
          `🔄 Retry ${retryCount + 1}/${maxRetries} dans ${delay}ms...`,
        );

        await new Promise((resolve) => setTimeout(resolve, delay));

        return this.requestWithRetry<T>(endpoint, {
          ...options,
          retryCount: retryCount + 1,
        });
      }

      throw error;
    }
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    this.requestCount++;
    if (this.requestCount > 100) {
      console.error("❌ Trop de requêtes API, arrêt pour éviter la boucle");
      throw new Error("Trop de requêtes API");
    }

    const url = this.buildUrl(endpoint);

    if (!this.isProduction) {
      console.log(`🌐 API Request #${this.requestCount}:`, {
        endpoint,
        finalUrl: url,
        method: options.method || "GET",
        useProxy: this.useProxy,
        requiresAuth: options.requiresAuth,
      });
    }

    // Préparer les headers
    const headers: HeadersInit = {};

    // Content-Type
    const isFormData = options.isFormData || options.body instanceof FormData;
    if (!isFormData && options.body) {
      headers["Content-Type"] = "application/json";
    }
    headers["Accept"] = "application/json";

    // Authentification
    const token = this.getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;

      // Ajouter le type d'utilisateur pour le backend
      const userType = this.getUserType();
      if (userType) {
        headers["X-User-Type"] = userType;
      }
    } else if (options.requiresAuth === true) {
      throw new Error("Authentification requise. Aucun token trouvé.");
    }

    // Headers pour éviter le cache
    headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
    headers["Pragma"] = "no-cache";
    headers["Expires"] = "0";

    // Préparer la configuration
    const config: RequestInit = {
      method: options.method || "GET",
      headers,
      credentials: this.useProxy ? "include" : "same-origin",
      cache: "no-store",
    };

    // Supprimer les propriétés personnalisées des options avant de les étendre
    const {
      requiresAuth,
      isFormData: _,
      retryCount,
      maxRetries,
      ...restOptions
    } = options;

    // Étendre avec les options restantes
    Object.assign(config, restOptions);

    // Gestion spéciale pour FormData
    if (isFormData) {
      // CORRECTION : Utiliser un type assertion pour supprimer Content-Type
      delete (config.headers as any)["Content-Type"];
    } else if (config.body && typeof config.body !== "string") {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      return await this.handleResponse<T>(response);
    } catch (error: any) {
      // Log détaillé des erreurs
      const errorDetails = {
        endpoint,
        finalUrl: url,
        method: options.method || "GET",
        error: error?.name,
        message: error?.message,
        status: error?.status,
        data: error?.data,
        isApiError: error?.isApiError,
      };

      console.error("❌ API Request failed:", errorDetails);

      // Messages d'erreur plus explicites
      if (error?.message?.includes("ENOENT")) {
        throw new Error(
          "Erreur serveur: Ressource non trouvée. Veuillez contacter l'administrateur.",
        );
      } else if (error?.message?.includes("Erreur interne du serveur")) {
        throw new Error(
          "Le serveur a rencontré une erreur interne. Veuillez réessayer plus tard.",
        );
      } else if (
        error?.message?.includes("fetch failed") ||
        error?.name === "TypeError"
      ) {
        if (this.useProxy) {
          throw new Error(
            `Impossible de contacter le serveur via le proxy. ` +
              `Vérifiez que le serveur backend est démarré sur ${this.baseApiUrl}.`,
          );
        } else {
          throw new Error(
            `Impossible de contacter le serveur API à l'adresse: ${url}. ` +
              `Vérifiez votre connexion internet et que le serveur est démarré.`,
          );
        }
      }

      throw error;
    } finally {
      this.requestCount--;
    }
  }

  // Méthodes HTTP avec gestion FormData
  postFormData<T = any>(
    endpoint: string,
    formData: FormData,
    options?: Omit<RequestOptions, "method" | "body">,
  ) {
    return this.requestWithRetry<T>(endpoint, {
      ...options,
      method: "POST",
      body: formData,
      isFormData: true,
    });
  }

  putFormData<T = any>(
    endpoint: string,
    formData: FormData,
    options?: Omit<RequestOptions, "method" | "body">,
  ) {
    return this.requestWithRetry<T>(endpoint, {
      ...options,
      method: "PUT",
      body: formData,
      isFormData: true,
    });
  }

  // Méthodes HTTP standard avec retry
  get<T = any>(endpoint: string, options?: Omit<RequestOptions, "method">) {
    return this.requestWithRetry<T>(endpoint, { ...options, method: "GET" });
  }

  post<T = any>(
    endpoint: string,
    data?: any,
    options?: Omit<RequestOptions, "method" | "body">,
  ) {
    if (data instanceof FormData) {
      return this.postFormData<T>(endpoint, data, options);
    }

    return this.requestWithRetry<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T = any>(
    endpoint: string,
    data?: any,
    options?: Omit<RequestOptions, "method" | "body">,
  ) {
    if (data instanceof FormData) {
      return this.putFormData<T>(endpoint, data, options);
    }

    return this.requestWithRetry<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  patch<T = any>(
    endpoint: string,
    data?: any,
    options?: Omit<RequestOptions, "method" | "body">,
  ) {
    return this.requestWithRetry<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T = any>(endpoint: string, options?: Omit<RequestOptions, "method">) {
    return this.requestWithRetry<T>(endpoint, { ...options, method: "DELETE" });
  }

  // Méthodes utilitaires
  checkAuth(): boolean {
    return !!this.getAuthToken();
  }

  async getCurrentUser<T = any>() {
    try {
      const userType = this.getUserType();
      if (!userType) return null;

      let endpoint = "";
      switch (userType) {
        case "agent":
          endpoint = "/auth/agent/profile";
          break;
        case "admin":
          endpoint = "/auth/admin/profile";
          break;
        case "vendeur":
          endpoint = "/auth/vendeur/profile";
          break;
        case "utilisateur":
          endpoint = "/auth/utilisateur/profile";
          break;
        default:
          return null;
      }

      return await this.get<T>(endpoint);
    } catch (error) {
      if (!this.isProduction) {
        console.error("❌ Erreur récupération profil:", error);
      }
      return null;
    }
  }

  // Nouvelle méthode pour tester directement une URL
  async testEndpoint(endpoint: string): Promise<{
    success: boolean;
    status: number;
    data: any;
    error?: string;
  }> {
    try {
      const data = await this.get(endpoint);
      return {
        success: true,
        status: 200,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        status: error.status || 0,
        data: error.data || null,
        error: error.message,
      };
    }
  }

  // Méthode pour récupérer la configuration
  getConfig() {
    return {
      useProxy: this.useProxy,
      baseApiUrl: this.baseApiUrl,
      isProduction: this.isProduction,
    };
  }

  // ✅ Nouvelle méthode pour sauvegarder le token après connexion
  saveAuthData(token: string, user: any, userType: string) {
    // Sauvegarder le token sous toutes ses formes pour compatibilité
    localStorage.setItem("oskar_token", token);
    localStorage.setItem("temp_token", token);
    localStorage.setItem("tempToken", token);

    // Sauvegarder l'utilisateur
    localStorage.setItem("oskar_user", JSON.stringify(user));

    // Sauvegarder le type d'utilisateur
    localStorage.setItem("oskar_user_type", userType);

    console.log("✅ Données d'authentification sauvegardées:", {
      token: token.substring(0, 20) + "...",
      userType,
      email: user.email,
    });
  }
}

// Instance unique exportée
export const api = new ApiClient();
