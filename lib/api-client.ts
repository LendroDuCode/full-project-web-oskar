// lib/api-client.ts - VERSION CORRIGÉE AVEC GESTION D'ERREUR AMÉLIORÉE
class ApiClient {
  private baseUrl: string;
  private useProxy: boolean;
  private isProduction: boolean;

  constructor() {
    // Lire les variables d'environnement
    this.useProxy = process.env.NEXT_PUBLIC_USE_PROXY === "true";
    this.isProduction = process.env.NODE_ENV === "production";

    // Configurer l'URL de base selon l'environnement
    if (typeof window !== "undefined") {
      // Côté client (browser)
      if (window.location.protocol === "https:") {
        // En HTTPS (production), utiliser les chemins relatifs
        this.baseUrl = "";
        if (!this.isProduction) {
          console.log("🔧 ApiClient configuré pour HTTPS - chemins relatifs");
        }
      } else {
        // En HTTP (dev), utiliser l'URL configurée
        this.baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005";
        if (!this.isProduction) {
          console.log(
            "🔧 ApiClient configuré pour HTTP - URL directe:",
            this.baseUrl,
          );
        }
      }
    } else {
      // Côté serveur (SSR)
      if (this.isProduction) {
        // En production SSR, utiliser l'IP interne
        this.baseUrl = "http://localhost:3005";
        if (!this.isProduction) {
          console.log(
            "🔧 ApiClient configuré côté serveur production - localhost:3005",
          );
        }
      } else {
        // En développement SSR
        this.baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005";
        if (!this.isProduction) {
          console.log("🔧 ApiClient configuré côté serveur dev:", this.baseUrl);
        }
      }
    }
  }

  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;

    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
      return null;
    };

    const tokenSources = [
      getCookie("oskar_token"),
      getCookie("access_token"),
      getCookie("token"),
      localStorage.getItem("oskar_token"),
      localStorage.getItem("access_token"),
      localStorage.getItem("token"),
      sessionStorage.getItem("oskar_token"),
      sessionStorage.getItem("access_token"),
      sessionStorage.getItem("token"),
    ];

    return tokenSources.find((token) => token !== null) || null;
  }

  public getToken(): string | null {
    return this.getAuthToken();
  }

  private buildUrl(endpoint: string): string {
    // Si on utilise le proxy ou qu'on est en HTTPS, utiliser les chemins relatifs avec /api/
    const useApiPrefix =
      this.useProxy ||
      (typeof window !== "undefined" && window.location.protocol === "https:");

    if (useApiPrefix) {
      if (!endpoint.startsWith("http")) {
        // Ajouter /api/ seulement si ce n'est pas déjà présent
        if (!endpoint.startsWith("/api/")) {
          return `/api${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
        }
        return endpoint;
      }
    }

    // Sinon, utiliser l'URL complète
    return `${this.baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!this.isProduction) {
      console.log("📥 API Response:", {
        status: response.status,
        ok: response.ok,
        url: response.url,
        statusText: response.statusText,
      });
    }

    if (response.status === 401) {
      console.error("❌ Erreur 401: Non authentifié");
      this.clearAuthTokens();
      throw new Error("Authentification requise. Veuillez vous reconnecter.");
    }

    if (!response.ok) {
      let errorData;
      const contentType = response.headers.get("content-type");

      try {
        if (contentType && contentType.includes("application/json")) {
          errorData = await response.json();
        } else {
          const text = await response.text();
          errorData = {
            message: `HTTP ${response.status} ${response.statusText}`,
            status: response.status,
            rawResponse: text.substring(0, 500),
          };
        }
      } catch {
        errorData = {
          message: `HTTP ${response.status} ${response.statusText}`,
          status: response.status,
        };
      }

      const error = new Error(errorData.message || `HTTP ${response.status}`);
      Object.assign(error, {
        status: response.status,
        data: errorData,
        response,
      });
      throw error;
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  private clearAuthTokens(): void {
    if (typeof window === "undefined") return;

    document.cookie =
      "oskar_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    localStorage.removeItem("oskar_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");

    sessionStorage.removeItem("oskar_token");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("token");
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit & {
      requiresAuth?: boolean;
      isFormData?: boolean;
    } = {},
  ): Promise<T> {
    const url = this.buildUrl(endpoint);

    if (!this.isProduction) {
      console.log("🌐 API Request:", {
        endpoint,
        url,
        method: options.method || "GET",
        useProxy: this.useProxy,
        isProduction: this.isProduction,
      });
    }

    const headers: HeadersInit = {};

    const isFormData = options.isFormData || options.body instanceof FormData;
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    headers["Accept"] = "application/json";

    if (options.requiresAuth !== false) {
      const token = this.getAuthToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      } else if (!this.isProduction) {
        console.warn("⚠️  Aucun token d'authentification trouvé");
      }
    }

    const config: RequestInit = {
      method: options.method || "GET",
      headers,
      credentials: "include",
      cache: "no-store",
      ...options,
    };

    try {
      const response = await fetch(url, config);
      return await this.handleResponse<T>(response);
    } catch (error: any) {
      // GESTION D'ERREUR AMÉLIORÉE
      const errorDetails = {
        endpoint,
        url,
        method: options.method || "GET",
        errorName: error?.name,
        errorMessage: error?.message || "Unknown error",
        errorStack: error?.stack,
        errorCode: error?.code,
        errorStatus: error?.status,
      };

      console.error("❌ API Request failed:", errorDetails);

      // Si c'est une erreur de réseau
      if (error?.name === "TypeError" && error?.message?.includes("fetch")) {
        throw new Error(
          `Impossible de se connecter à l'API à l'URL: ${url}. ` +
            `Vérifiez que le serveur backend est démarré et accessible.`,
        );
      }

      // Si c'est une erreur Mixed Content
      if (error?.message?.includes("Mixed Content")) {
        throw new Error(
          "Erreur Mixed Content: Le site est en HTTPS mais l'API est appelée en HTTP. " +
            "Vérifiez la configuration.",
        );
      }

      // Si l'erreur a un message, le propager
      if (error?.message) {
        throw error;
      }

      // Sinon, créer une nouvelle erreur avec les détails
      throw new Error(
        `API Request failed: ${JSON.stringify(errorDetails, null, 2)}`,
      );
    }
  }

  // ... gardez toutes les autres méthodes (postFormData, putFormData, etc.)
  // Copiez-collez ici toutes vos méthodes existantes

  // Méthodes HTTP spécialisées pour FormData
  postFormData<T = any>(
    endpoint: string,
    formData: FormData,
    options?: Omit<RequestInit, "method" | "body">,
  ) {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: formData,
      isFormData: true,
    });
  }

  putFormData<T = any>(
    endpoint: string,
    formData: FormData,
    options?: Omit<RequestInit, "method" | "body">,
  ) {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: formData,
      isFormData: true,
    });
  }

  patchFormData<T = any>(
    endpoint: string,
    formData: FormData,
    options?: Omit<RequestInit, "method" | "body">,
  ) {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: formData,
      isFormData: true,
    });
  }

  // Méthodes HTTP standard avec détection automatique de FormData
  get<T = any>(endpoint: string, options?: Omit<RequestInit, "method">) {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  post<T = any>(
    endpoint: string,
    data?: any,
    options?: Omit<RequestInit, "method" | "body">,
  ) {
    if (data instanceof FormData) {
      return this.postFormData<T>(endpoint, data, options);
    }

    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T = any>(
    endpoint: string,
    data?: any,
    options?: Omit<RequestInit, "method" | "body">,
  ) {
    if (data instanceof FormData) {
      return this.putFormData<T>(endpoint, data, options);
    }

    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  patch<T = any>(
    endpoint: string,
    data?: any,
    options?: Omit<RequestInit, "method" | "body">,
  ) {
    if (data instanceof FormData) {
      return this.patchFormData<T>(endpoint, data, options);
    }

    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T = any>(endpoint: string, options?: Omit<RequestInit, "method">) {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  // Méthodes utilitaires
  checkAuth(): boolean {
    return !!this.getAuthToken();
  }

  async getCurrentUser<T = any>() {
    try {
      return await this.get<T>("/auth/profile");
    } catch (error) {
      if (!this.isProduction) {
        console.error("❌ Erreur lors de la récupération du profil:", error);
      }
      return null;
    }
  }
}

// Instance unique de l'ApiClient
export const api = new ApiClient();
