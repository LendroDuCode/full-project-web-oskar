// app/shared/components/layout/BootstrapLoader.tsx
/**
 * "use client";

import { useEffect } from "react";


const BootstrapLoader = () => {
  useEffect(() => {
    // Charger Bootstrap JS uniquement côté client
    if (typeof window !== "undefined") {
      const loadBootstrap = async () => {
        try {
          // Utiliser require pour éviter les problèmes de type TypeScript
          const bootstrap = "bootstrap/dist/js/bootstrap.bundle.min.js";
          console.log("Bootstrap JS chargé avec succès");
          
          // Initialiser les composants Bootstrap si nécessaire
          if (typeof window !== "undefined") {
            // Initialiser tous les tooltips
            const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
            const tooltipList = [...tooltipTriggerList].map(
              tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl)
            );

            // Initialiser tous les popovers
            const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
            const popoverList = [...popoverTriggerList].map(
              popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl)
            );

            // Initialiser les dropdowns
            const dropdownElementList = document.querySelectorAll('.dropdown-toggle');
            const dropdownList = [...dropdownElementList].map(
              dropdownToggleEl => new bootstrap.Dropdown(dropdownToggleEl)
            );

            // Initialiser les modals
            const modalElementList = document.querySelectorAll('.modal');
            const modalList = [...modalElementList].map(
              modalEl => new bootstrap.Modal(modalEl)
            );

            console.log(`Initialisé: ${tooltipList.length} tooltips, ${popoverList.length} popovers, ${dropdownList.length} dropdowns, ${modalList.length} modals`);
          }
        } catch (err) {
          console.error("Erreur de chargement de Bootstrap JS:", err);
        }
      };

      loadBootstrap();
    }
  }, []);

  return null; // Ce composant ne rend rien
};

export default BootstrapLoader;
 */
