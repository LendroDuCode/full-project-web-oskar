// utils/imageUtils.ts
export const buildImageUrl = (imagePath: string | null): string => {
  if (!imagePath) return '';
  
  // Si c'est déjà une URL complète
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Si c'est déjà un chemin avec /api/files
  if (imagePath.startsWith('/api/files/')) {
    // En développement, ajouter l'URL de base
    if (process.env.NODE_ENV === 'development') {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
      return `${apiUrl}${imagePath}`;
    }
    return imagePath;
  }
  
  // Construire l'URL complète
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://oskar-api.mysonec.pro';
  const filesUrl = process.env.NEXT_PUBLIC_FILES_URL || '/api/files';
  const encodedPath = encodeURIComponent(imagePath);
  return `${apiUrl}${filesUrl}/${encodedPath}`;
};