"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilterCircleXmark,
  faBoxOpen,
  faPlusCircle,
} from "@fortawesome/free-solid-svg-icons";
import colors from "@/app/shared/constants/colors";

interface EmptyStateProps {
  title?: string;
  description?: string;
  searchQuery?: string;
  showResetButton?: boolean;
  onReset?: () => void;
  onCreateNew?: () => void;
  className?: string;
}

export default function EmptyState({
  title = "Aucune annonce trouvée",
  description = "Aucune donnée ne correspond à vos critères de recherche.",
  searchQuery,
  showResetButton = true,
  onReset,
  onCreateNew,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`d-flex flex-column align-items-center justify-content-center py-5 px-3 text-center ${className}`}
    >
      <div
        className="rounded-circle d-flex align-items-center justify-content-center mb-4"
        style={{
          width: "80px",
          height: "80px",
          backgroundColor: colors.oskar.lightGrey,
          border: `2px dashed ${colors.oskar.lightGrey}`,
        }}
      >
        {searchQuery ? (
          <FontAwesomeIcon
            icon={faSearch}
            style={{
              color: colors.oskar.grey,
              fontSize: "2rem",
            }}
          />
        ) : (
          <FontAwesomeIcon
            icon={faBoxOpen}
            style={{
              color: colors.oskar.grey,
              fontSize: "2rem",
            }}
          />
        )}
      </div>

      <h3 className="h5 fw-semibold mb-2" style={{ color: colors.oskar.black }}>
        {title}
      </h3>

      <p className="text-muted mb-4" style={{ maxWidth: "400px" }}>
        {searchQuery
          ? `Aucun résultat pour "${searchQuery}". Essayez avec d'autres mots-clés.`
          : description}
      </p>

      <div className="d-flex gap-3">
        {showResetButton && (
          <button
            type="button"
            className="btn d-flex align-items-center gap-2"
            onClick={onReset}
            style={{
              backgroundColor: colors.oskar.lightGrey,
              color: colors.oskar.grey,
              border: `1px solid ${colors.oskar.lightGrey}`,
              padding: "0.5rem 1rem",
              borderRadius: "6px",
            }}
          >
            <FontAwesomeIcon icon={faFilterCircleXmark} />
            Réinitialiser les filtres
          </button>
        )}

        {onCreateNew && (
          <button
            type="button"
            className="btn d-flex align-items-center gap-2"
            onClick={onCreateNew}
            style={{
              backgroundColor: colors.oskar.blueHover,
              color: colors.oskar.lightGray,
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
            }}
          >
            <FontAwesomeIcon icon={faPlusCircle} />
            Créer une annonce
          </button>
        )}
      </div>
    </div>
  );
}
