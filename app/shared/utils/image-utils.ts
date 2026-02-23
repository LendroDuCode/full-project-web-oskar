// app/shared/utils/image-utils.ts

/**
 * Construit une URL d'image complète à partir d'un chemin relatif ou d'une URL
 * @param imagePath - Le chemin de l'image (peut être relatif ou URL complète)
 * @returns L'URL complète de l'image ou null si le chemin est invalide
 */
export const buildImageUrl = (
  imagePath: string | null | undefined,
): string | null => {
  if (!imagePath) return null;

  // Nettoyer le chemin des espaces indésirables
  let cleanPath = imagePath
    .replace(/\s+/g, "") // Supprimer tous les espaces
    .replace(/-/g, "-") // Normaliser les tirets
    .trim();

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://oskar-api.mysonec.pro";
  const filesUrl = process.env.NEXT_PUBLIC_FILES_URL || "/api/files";

  // ✅ CAS 1: Déjà une URL complète
  if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
    if (cleanPath.includes("localhost")) {
      const productionUrl = apiUrl.replace(/\/api$/, "");
      return cleanPath.replace(/http:\/\/localhost(:\d+)?/g, productionUrl);
    }
    return cleanPath;
  }

  // ✅ CAS 2: Chemin avec %2F (déjà encodé)
  if (cleanPath.includes("%2F")) {
    // Nettoyer les espaces autour de %2F
    const finalPath = cleanPath.replace(/%2F\s+/, "%2F");
    return `${apiUrl}${filesUrl}/${finalPath}`;
  }

  // ✅ CAS 3: Chemin simple
  return `${apiUrl}${filesUrl}/${cleanPath}`;
};

/**
 * Version avec fallback automatique vers les initiales
 * @param imagePath - Le chemin de l'image
 * @param nom - Le nom pour générer les initiales en cas d'absence d'image
 * @param size - La taille de l'avatar fallback
 * @returns L'URL de l'image ou un avatar avec initiales
 */
export const getAvatarUrl = (
  imagePath: string | null | undefined,
  nom: string = "U",
  size: number = 40,
): string => {
  const url = buildImageUrl(imagePath);
  if (url) return url;

  // Fallback vers les initiales
  const initials = nom ? nom.charAt(0).toUpperCase() : "U";
  return `https://ui-avatars.com/api/?name=${initials}&background=16a34a&color=fff&size=${size}`;
};
