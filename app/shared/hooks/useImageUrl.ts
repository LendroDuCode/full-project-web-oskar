// hooks/useImageUrl.ts - Nouveau fichier à créer
"use client";

import { useState, useEffect, useCallback } from "react";

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5BdWN1bmUgaW1hZ2U8L3RleHQ+PC9zdmc+";

export const useImageUrl = (initialUrl?: string | null) => {
  const [imageUrl, setImageUrl] = useState<string>(PLACEHOLDER_IMAGE);
  const [imageError, setImageError] = useState(false);

  const getBaseUrl = useCallback((): string => {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005";
  }, []);

  const formatImageUrl = useCallback(
    (url: string | null | undefined): string => {
      if (!url || imageError) return PLACEHOLDER_IMAGE;

      // Si l'URL contient localhost, la remplacer
      if (url.includes("localhost")) {
        const baseUrl = getBaseUrl();
        return url.replace(/http:\/\/localhost(:\d+)?/g, baseUrl);
      }

      // Si l'URL est déjà absolue
      if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
      }

      // Si l'URL est un chemin relatif
      if (url.startsWith("/")) {
        return `${getBaseUrl()}${url}`;
      }

      return PLACEHOLDER_IMAGE;
    },
    [getBaseUrl, imageError],
  );

  useEffect(() => {
    if (initialUrl && !imageError) {
      setImageUrl(formatImageUrl(initialUrl));
    } else {
      setImageUrl(PLACEHOLDER_IMAGE);
    }
  }, [initialUrl, imageError, formatImageUrl]);

  const handleImageError = useCallback(() => {
    if (!imageError) {
      setImageError(true);
      setImageUrl(PLACEHOLDER_IMAGE);
    }
  }, [imageError]);

  const resetImage = useCallback(() => {
    setImageError(false);
    if (initialUrl) {
      setImageUrl(formatImageUrl(initialUrl));
    }
  }, [initialUrl, formatImageUrl]);

  return {
    imageUrl,
    imageError,
    handleImageError,
    resetImage,
  };
};
