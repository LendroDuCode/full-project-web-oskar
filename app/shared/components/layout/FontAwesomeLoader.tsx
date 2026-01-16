// components/FontAwesomeLoader.tsx
"use client";

import { useEffect } from "react";

const FontAwesomeLoader = () => {
  useEffect(() => {
    // Vérifier si FontAwesome est déjà chargé
    if (
      typeof window !== "undefined" &&
      !document.querySelector('link[href*="font-awesome"]')
    ) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css";
      link.integrity =
        "sha512-z3gLpd7yknf1YoNbCzqRKc4qyor8gaKU1qmn+CShxbuBusANI9QpRohGBreCFkKxLhei6S9CQXFEbbKuqLg0DA==";
      link.crossOrigin = "anonymous";
      link.referrerPolicy = "no-referrer";
      document.head.appendChild(link);
    }
  }, []);

  return null;
};

export default FontAwesomeLoader;
