// lib/api-client.ts - VERSION CORRIGÉE
class ApiClient {
  private baseUrl: string;
  private useProxy: boolean;

  constructor() {
    // Toujours utiliser les rewrites en production, direct en dev
    this.useProxy = process.env.NODE_ENV === "production" || false;
    this.baseUrl = this.useProxy
      ? ""
      : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005";

    console.log("🔧 ApiClient configuré:", {
      useProxy: this.useProxy,
      baseUrl: this.baseUrl,
      nodeEnv: process.env.NODE_ENV,
      apiUrl: process.env.NEXT_PUBLIC_API_URL,
    });
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

  // Méthode publique pour récupérer le token
  public getToken(): string | null {
    return this.getAuthToken();
  }

  private buildUrl(endpoint: string): string {
    // Si on utilise le proxy (rewrites), on enlève /api du début car il est déjà dans la destination
    if (this.useProxy) {
      // Enlève le préfixe /api si présent
      if (endpoint.startsWith("/api/")) {
        return endpoint;
      }
      // Si ce n'est pas une route API, on laisse tel quel
      return endpoint;
    }
    // Sinon, on construit l'URL complète
    return `${this.baseUrl}${endpoint}`;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    console.log("📥 API Response:", {
      status: response.status,
      ok: response.ok,
      url: response.url,
      statusText: response.statusText,
      contentType: response.headers.get("content-type"),
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

      if (contentType && contentType.includes("application/json")) {
        try {
          errorData = await response.json();
        } catch {
          errorData = {
            message: `HTTP ${response.status} ${response.statusText}`,
            status: response.status,
            statusText: response.statusText,
          };
        }
      } else {
        const text = await response.text();
        errorData = {
          message: `HTTP ${response.status} ${response.statusText}`,
          status: response.status,
          statusText: response.statusText,
          rawResponse: text.substring(0, 500),
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
      skipContentType?: boolean;
    } = {},
  ): Promise<T> {
    const url = this.buildUrl(endpoint);

    console.log("🌐 API Request:", {
      endpoint,
      url,
      method: options.method,
      hasBody: !!options.body,
      isFormData: options.isFormData || options.body instanceof FormData,
      useProxy: this.useProxy,
    });

    // Construire les headers
    const headers: HeadersInit = {};

    // Gestion du Content-Type
    const isFormData = options.isFormData || options.body instanceof FormData;
    if (!isFormData && !options.skipContentType) {
      headers["Content-Type"] = "application/json";
    }

    headers["Accept"] = "application/json";

    // Ajouter le token d'authentification
    if (options.requiresAuth !== false) {
      const token = this.getAuthToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
        console.log("🔑 Token envoyé (début):", token.substring(0, 10) + "...");
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
        errorStatus: error?.status,
        url,
      });

      // Si c'est une erreur de connexion, essayer sans proxy
      if (
        error?.message?.includes("ECONNREFUSED") ||
        error?.message?.includes("Failed to fetch")
      ) {
        console.log("🔄 Tentative sans proxy...");
        // On pourrait implémenter une retry logique ici
      }

      throw error;
    }
  }

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
    // Détection automatique de FormData
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
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T = any>(endpoint: string, options?: Omit<RequestInit, "method">) {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  // Méthode pour vérifier l'authentification
  checkAuth(): boolean {
    return !!this.getAuthToken();
  }

  // Méthode pour récupérer les informations de l'utilisateur
  async getCurrentUser<T = any>() {
    try {
      return await this.get<T>("/auth/profile");
    } catch (error) {
      console.error("❌ Erreur lors de la récupération du profil:", error);
      return null;
    }
  }
}

export const api = new ApiClient();
