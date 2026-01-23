// lib/api-error-handler.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any,
    public originalError?: any,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const handleApiError = (error: any): never => {
  console.error("API Error details:", {
    name: error?.name,
    message: error?.message,
    status: error?.status,
    data: error?.data,
    stack: error?.stack,
  });

  // Si c'est déjà une ApiError, la propager
  if (error instanceof ApiError) {
    throw error;
  }

  // Si c'est une erreur de réseau
  if (error?.name === "TypeError" && error?.message?.includes("fetch")) {
    throw new ApiError(
      "Erreur de connexion au serveur. Vérifiez votre connexion internet.",
      0,
      null,
      error,
    );
  }

  // Si c'est une erreur HTTP avec un statut
  if (error?.status) {
    throw new ApiError(
      error?.message || `Erreur HTTP ${error.status}`,
      error.status,
      error.data,
      error,
    );
  }

  // Erreur générique
  throw new ApiError(
    error?.message ||
      "Une erreur est survenue lors de la communication avec le serveur.",
    undefined,
    null,
    error,
  );
};
