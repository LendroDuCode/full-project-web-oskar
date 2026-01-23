// lib/api-client.ts - VERSION CORRIGÉE

class ApiClient {
  private useProxy: boolean;
  private isProduction: boolean;

  constructor() {
    // Lire les variables d'environnement
    this.useProxy = process.env.NEXT_PUBLIC_USE_PROXY === "true";
    this.isProduction = process.env.NODE_ENV === "production";

    if (!this.isProduction) {
      console.log("🔧 ApiClient initialisé:", {
        useProxy: this.useProxy,
        isProduction: this.isProduction,
        apiUrl: process.env.NEXT_PUBLIC_API_URL,
      });
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

  /**
   * CORRECTION : Les endpoints dans API_ENDPOINTS contiennent déjà les URLs complètes
   * Cette méthode adapte l'URL pour utiliser le proxy si nécessaire
   */
  private buildUrl(fullUrl: string): string {
    // DEBUG
    if (!this.isProduction) {
      console.log("🔗 buildUrl input:", fullUrl);
    }

    // Si nous utilisons le proxy, convertir en chemin relatif /api/
    if (this.useProxy) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005";

      // Si l'URL commence par l'URL de base de l'API
      if (fullUrl.startsWith(apiUrl)) {
        const path = fullUrl.substring(apiUrl.length);
        // Nettoyer le chemin (enlever les doubles slashes)
        const cleanPath = path.replace(/^\/+/, "");
        const proxyUrl = `/api/${cleanPath}`;

        if (!this.isProduction) {
          console.log("🔗 Conversion proxy:", {
            fullUrl,
            apiUrl,
            path,
            proxyUrl,
          });
        }

        return proxyUrl;
      }

      // Si c'est déjà un chemin relatif /api/, le garder tel quel
      if (fullUrl.startsWith("/api/")) {
        return fullUrl;
      }

      // Pour les autres cas, utiliser l'URL complète
      return fullUrl;
    }

    // Si nous n'utilisons pas le proxy, utiliser l'URL complète directement
    return fullUrl;
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

    // Récupérer d'abord le texte de la réponse pour analyse
    const responseText = await response.text();
    const contentType = response.headers.get("content-type") || "";

    // Vérifier si c'est du HTML (erreur du backend)
    const isHtmlResponse =
      responseText.trim().startsWith("<!DOCTYPE") ||
      responseText.includes("<html") ||
      contentType.includes("text/html");

    if (isHtmlResponse) {
      console.error("❌ Backend retourne du HTML au lieu de JSON:", {
        status: response.status,
        url: response.url,
        preview: responseText.substring(0, 300),
      });

      // Analyser le type d'erreur HTML
      let errorMessage = `Le serveur a retourné du HTML (${response.status}). `;

      if (response.status === 404 || responseText.includes("404")) {
        errorMessage += "La route n'existe pas sur le backend.";
      } else if (response.status === 500 || responseText.includes("500")) {
        errorMessage += "Erreur interne du serveur.";
      } else if (
        responseText.includes("Cannot GET") ||
        responseText.includes("Cannot POST")
      ) {
        errorMessage += "Route non implémentée sur le backend.";
      } else {
        errorMessage += "Vérifiez la configuration du backend.";
      }

      throw new Error(errorMessage);
    }

    if (response.status === 401) {
      console.error("❌ Erreur 401: Non authentifié");
      this.clearAuthTokens();
      throw new Error("Authentification requise. Veuillez vous reconnecter.");
    }

    if (!response.ok) {
      let errorData;

      try {
        // Essayer de parser comme JSON
        errorData = JSON.parse(responseText);
      } catch {
        // Si ce n'est pas du JSON valide
        errorData = {
          message: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          rawResponse: responseText.substring(0, 500),
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

    // Essayer de parser la réponse JSON
    try {
      return JSON.parse(responseText);
    } catch (error) {
      console.error("❌ Erreur parsing JSON:", {
        url: response.url,
        status: response.status,
        contentType: contentType,
        preview: responseText.substring(0, 500),
      });
      throw new Error(
        `Réponse invalide du serveur. Attendu: JSON, Reçu: ${contentType}`,
      );
    }
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
    endpointOrUrl: string, // Peut être un endpoint d'API_ENDPOINTS (URL complète) ou un chemin
    options: RequestInit & {
      requiresAuth?: boolean;
      isFormData?: boolean;
    } = {},
  ): Promise<T> {
    // DEBUG
    if (!this.isProduction) {
      console.log("🌐 API Request (avant buildUrl):", endpointOrUrl);
    }

    const url = this.buildUrl(endpointOrUrl);

    if (!this.isProduction) {
      console.log("🌐 API Request:", {
        input: endpointOrUrl,
        finalUrl: url,
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
      credentials: this.useProxy ? "include" : "omit", // IMPORTANT: Inclure les cookies seulement si on utilise le proxy
      cache: "no-store",
      ...options,
    };

    try {
      const response = await fetch(url, config);
      return await this.handleResponse<T>(response);
    } catch (error: any) {
      // GESTION D'ERREUR AMÉLIORÉE
      const errorDetails = {
        endpointOrUrl,
        finalUrl: url,
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
      // Utiliser le bon endpoint de votre API_ENDPOINTS
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
