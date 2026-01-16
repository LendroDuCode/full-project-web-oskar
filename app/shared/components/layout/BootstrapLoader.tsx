// app/shared/components/layout/BootstrapLoader.tsx
"use client";

import { useEffect } from "react";

const BootstrapLoader = () => {
  useEffect(() => {
    // Charger Bootstrap JS uniquement côté client
    if (typeof window !== "undefined") {
      // Méthode 1: Import dynamique
      import("bootstrap/dist/js/bootstrap.bundle.min.js")
        .then(() => {
          console.log("Bootstrap JS chargé avec succès");
        })
        .catch((err) => {
          console.error("Erreur de chargement de Bootstrap JS:", err);
        });
    }
  }, []);

  return null; // Ce composant ne rend rien
};

export default BootstrapLoader;
