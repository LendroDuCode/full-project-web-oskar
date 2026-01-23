// lib/image-urls.ts
const isBrowser = typeof window !== "undefined";
const isHttps = isBrowser && window.location.protocol === "https:";

export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return "";

  // Si c'est déjà une URL complète
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Si c'est une clé MinIO (S3)
  if (
    path.includes("oskar-bucket/") ||
    path.startsWith("dons/") ||
    path.startsWith("produits/") ||
    path.startsWith("echanges/") ||
    path.startsWith("annonces/") ||
    path.startsWith("categories/")
  ) {
    // Déterminez si on utilise HTTPS ou HTTP pour MinIO
    const useHttpsForMinio = isHttps;
    const baseUrl = useHttpsForMinio
      ? "https://15.236.142.141:9000/oskar-bucket"
      : "http://15.236.142.141:9000/oskar-bucket";

    // Nettoyer le chemin si nécessaire
    const cleanPath = path.replace("oskar-bucket/", "");
    return `${baseUrl}/${cleanPath}`;
  }

  // Si c'est une clé de fichier uploadé via l'API
  if (path.includes("/")) {
    // Utiliser le proxy Next.js pour les fichiers
    return `/files/${encodeURIComponent(path)}`;
  }

  // Fallback : retourner tel quel
  return path;
};

// Pour les images Next.js Image component
export const getImageLoader = () => {
  return ({
    src,
    width,
    quality,
  }: {
    src: string;
    width: number;
    quality?: number;
  }) => {
    const url = getImageUrl(src);
    return `${url}?w=${width}&q=${quality || 75}`;
  };
};
