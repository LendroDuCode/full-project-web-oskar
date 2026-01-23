// lib/api-client.ts - VERSION SIMPLIFIÉE ET CORRIGÉE
class ApiClient {
  private baseUrl: string;

  constructor() {
    // Toujours utiliser les chemins relatifs pour éviter les problèmes Mixed Content
    // En production via HTTPS, on utilise les chemins relatifs (/api/*)
    // En développement, on peut utiliser l'URL directe
    if (typeof window !== "undefined") {
      // Côté client
      if (window.location.protocol === "https:") {
        // En HTTPS, utiliser les chemins relatifs
        this.baseUrl = "";
        console.log("🔧 ApiClient configuré pour HTTPS - chemins relatifs");
      } else {
        // En HTTP (dev), utiliser l'URL configurée ou localhost
        this.baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005";
        console.log(
          "🔧 ApiClient configuré pour HTTP - URL directe:",
          this.baseUrl,
        );
      }
    } else {
      // Côté serveur (SSR), utiliser localhost
      this.baseUrl = "http://localhost:3005";
      console.log("🔧 ApiClient configuré côté serveur - localhost:3005");
    }
  }

  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;

    // Chercher dans les cookies
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
      return null;
    };

    // Chercher dans tous les endroits possibles
    const tokenSources = [
      // Cookies
      getCookie("oskar_token"),
      getCookie("access_token"),
      getCookie("token"),
      // LocalStorage
      localStorage.getItem("oskar_token"),
      localStorage.getItem("access_token"),
      localStorage.getItem("token"),
      // SessionStorage
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
    // Si on est en HTTPS, on utilise les chemins relatifs avec préfixe /api
    if (
      typeof window !== "undefined" &&
      window.location.protocol === "https:"
    ) {
      // Ajouter /api/ au début si ce n'est pas déjà présent et si ce n'est pas une URL complète
      if (!endpoint.startsWith("http")) {
        if (!endpoint.startsWith("/api/")) {
          return `/api${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
        }
        return endpoint;
      }
    }

    // Sinon, on utilise l'URL complète
    return `${this.baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    console.log("📥 API Response:", {
      status: response.status,
      ok: response.ok,
      url: response.url,
      statusText: response.statusText,
    });

    // Gestion des erreurs d'authentification
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

    // Cookies
    document.cookie =
      "oskar_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // LocalStorage
    localStorage.removeItem("oskar_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");

    // SessionStorage
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

    console.log("🌐 API Request:", {
      endpoint,
      url,
      method: options.method || "GET",
      protocol:
        typeof window !== "undefined" ? window.location.protocol : "server",
    });

    // Construire les headers
    const headers: HeadersInit = {};

    // Gestion du Content-Type
    const isFormData = options.isFormData || options.body instanceof FormData;
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    headers["Accept"] = "application/json";

    // Ajouter le token d'authentification
    if (options.requiresAuth !== false) {
      const token = this.getAuthToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      } else {
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
      console.error("❌ API Request failed:", {
        endpoint,
        errorMessage: error?.message,
        url,
      });

      // Si c'est une erreur CORS ou Mixed Content, donner un message clair
      if (error?.message?.includes("Mixed Content")) {
        throw new Error(
          "Erreur Mixed Content: Le site est en HTTPS mais l'API est appelée en HTTP. " +
            "Vérifiez la configuration des rewrites et du reverse proxy.",
        );
      }

      throw error;
    }
  }

  // Méthodes HTTP simplifiées
  get<T = any>(endpoint: string, options?: Omit<RequestInit, "method">) {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  post<T = any>(
    endpoint: string,
    data?: any,
    options?: Omit<RequestInit, "method" | "body">,
  ) {
    const isFormData = data instanceof FormData;
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: isFormData ? data : data ? JSON.stringify(data) : undefined,
      isFormData,
    });
  }

  put<T = any>(
    endpoint: string,
    data?: any,
    options?: Omit<RequestInit, "method" | "body">,
  ) {
    const isFormData = data instanceof FormData;
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: isFormData ? data : data ? JSON.stringify(data) : undefined,
      isFormData,
    });
  }

  patch<T = any>(
    endpoint: string,
    data?: any,
    options?: Omit<RequestInit, "method" | "body">,
  ) {
    const isFormData = data instanceof FormData;
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: isFormData ? data : data ? JSON.stringify(data) : undefined,
      isFormData,
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
      console.error("❌ Erreur lors de la récupération du profil:", error);
      return null;
    }
  }
}

// Instance unique de l'ApiClient
export const api = new ApiClient();
