// app/shared/hooks/useImageUrl.ts*
/*
"use client";

import { useState, useEffect, useCallback } from "react";

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0jZjNmNGY2Lz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2NjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+QXVjdW5lIGltYWdlPC90ZXh0Pjwvc3ZnPg==";

export const useImageUrl = (initialUrl?: string | null) => {
  const [imageUrl, setImageUrl] = useState<string>(PLACEHOLDER_IMAGE);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getApiBaseUrl = useCallback((): string => {
    // L'URL de l'API backend
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005";
  }, []);

  const formatImageUrl = useCallback(
    (url: string | null | undefined): string => {
      if (!url) return PLACEHOLDER_IMAGE;

      let formattedUrl = url;

      // ✅ Si l'URL contient localhost sans port spécifique
      if (
        formattedUrl.includes("localhost") &&
        !formattedUrl.includes("localhost:3005")
      ) {
        const apiBaseUrl = getApiBaseUrl();
        formattedUrl = formattedUrl.replace(
          /http:\/\/localhost(:\d+)?/g,
          apiBaseUrl,
        );
        console.log("🖼️ URL corrigée (localhost → backend):", formattedUrl);
      }

      // ✅ Si l'URL commence par http:// ou https://, la retourner directement
      if (
        formattedUrl.startsWith("http://") ||
        formattedUrl.startsWith("https://")
      ) {
        return formattedUrl;
      }

      // ✅ Si l'URL est un chemin relatif
      if (formattedUrl.startsWith("/")) {
        return `${getApiBaseUrl()}${formattedUrl}`;
      }

      return PLACEHOLDER_IMAGE;
    },
    [getApiBaseUrl],
  );

  useEffect(() => {
    setIsLoading(true);
    if (initialUrl && !imageError) {
      const formatted = formatImageUrl(initialUrl);
      console.log("📸 Image formatée:", {
        original: initialUrl,
        formatted,
        apiUrl: getApiBaseUrl(),
      });
      setImageUrl(formatted);
    } else {
      setImageUrl(PLACEHOLDER_IMAGE);
    }
    setIsLoading(false);
  }, [initialUrl, imageError, formatImageUrl, getApiBaseUrl]);

  const handleImageError = useCallback(() => {
    console.log("❌ Erreur de chargement d'image pour:", initialUrl);
    if (!imageError) {
      setImageError(true);
      setImageUrl(PLACEHOLDER_IMAGE);
    }
  }, [imageError, initialUrl]);

  const resetImage = useCallback(() => {
    setImageError(false);
    if (initialUrl) {
      setImageUrl(formatImageUrl(initialUrl));
    }
  }, [initialUrl, formatImageUrl]);

  return {
    imageUrl,
    imageError,
    isLoading,
    handleImageError,
    resetImage,
  };
};


*/
