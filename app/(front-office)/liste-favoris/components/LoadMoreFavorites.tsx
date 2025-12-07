"use client";

import { useState } from "react";
import colors from "../../../shared/constants/colors"; // Chemin vers votre fichier colors.ts

interface LoadMoreFavoritesProps {
  totalItems: number;
  itemsPerPage?: number;
  onLoadMore?: () => void;
}

export default function LoadMoreFavorites({
  totalItems,
  itemsPerPage = 9,
  onLoadMore,
}: LoadMoreFavoritesProps) {
  const [displayedCount, setDisplayedCount] = useState(itemsPerPage);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadMore = async () => {
    if (onLoadMore) {
      try {
        setIsLoading(true);
        await onLoadMore();
      } finally {
        setIsLoading(false);
      }
    } else {
      // Comportement par défaut : incrémente le compteur
      setDisplayedCount((prev) => Math.min(prev + itemsPerPage, totalItems));
    }
  };

  // Calcul du nombre d'éléments affichés
  const currentDisplayed = onLoadMore
    ? Math.min(displayedCount, totalItems)
    : displayedCount;

  const isDisabled = currentDisplayed >= totalItems || isLoading;

  return (
    <div id="load-more-section" className="text-center my-5">
      <button
        onClick={handleLoadMore}
        disabled={isDisabled}
        className="btn btn-outline-success px-5 py-2 fw-semibold"
        style={
          {
            "--bs-btn-color": colors.oskar.green,
            "--bs-btn-border-color": colors.oskar.green,
            "--bs-btn-hover-color": "#fff",
            "--bs-btn-hover-bg": colors.oskar.green,
            "--bs-btn-hover-border-color": colors.oskar.green,
            "--bs-btn-focus-shadow-rgb": "25, 135, 84",
            "--bs-btn-active-color": "#fff",
            "--bs-btn-active-bg": colors.oskar.green,
            "--bs-btn-active-border-color": colors.oskar.green,
            "--bs-btn-active-shadow": "inset 0 3px 5px rgba(0, 0, 0, 0.125)",
            "--bs-btn-disabled-color": colors.oskar.green,
            "--bs-btn-disabled-bg": "transparent",
            "--bs-btn-disabled-border-color": colors.oskar.green,
            "--bs-gradient": "none",
          } as React.CSSProperties
        }
        aria-label="Charger plus d'articles favoris"
      >
        {isLoading ? (
          <>
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>
            Chargement...
          </>
        ) : (
          "Charger plus de favoris"
        )}
      </button>

      <div className="mt-3 text-secondary small">
        <span className="d-block">
          Affichage de <strong>{currentDisplayed}</strong> sur{" "}
          <strong>{totalItems}</strong> articles
        </span>
        {currentDisplayed < totalItems && (
          <span className="text-muted d-block mt-1">
            {totalItems - currentDisplayed} articles supplémentaires disponibles
          </span>
        )}
      </div>
    </div>
  );
}
