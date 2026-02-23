"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faTrash,
  faTimes,
  faSpinner,
  faBox,
  faGift,
  faArrowRightArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import colors from "@/app/shared/constants/colors";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemTitle: string;
  itemType: string;
  isDeleting?: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  itemTitle,
  itemType,
  isDeleting = false,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  const getTypeIcon = () => {
    switch (itemType) {
      case "produit":
        return faBox;
      case "don":
        return faGift;
      case "echange":
        return faArrowRightArrowLeft;
      default:
        return faBox;
    }
  };

  const getTypeColor = () => {
    switch (itemType) {
      case "produit":
        return colors.type.product;
      case "don":
        return colors.type.don;
      case "echange":
        return colors.type.exchange;
      default:
        return colors.oskar.blueHover;
    }
  };

  const typeIcon = getTypeIcon();
  const typeColor = getTypeColor();

  return (
    <>
      {/* Overlay avec flou */}
      <div
        className="modal-backdrop fade show"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
          zIndex: 1040,
        }}
        onClick={!isDeleting ? onClose : undefined}
      />

      {/* Modal */}
      <div
        className="modal fade show d-block"
        style={{ zIndex: 1050 }}
        tabIndex={-1}
        aria-hidden="false"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg overflow-hidden">
            {/* En-tête avec gradient rouge */}
            <div
              className="modal-header border-0 position-relative"
              style={{
                background: "linear-gradient(135deg, #dc3545 0%, #b02a37 100%)",
                padding: "2rem 1.5rem 1rem 1.5rem",
              }}
            >
              {/* Motif de fond */}
              <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10">
                <div
                  className="w-100 h-100"
                  style={{
                    backgroundImage:
                      "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5L5 30l25 25 25-25L30 5z' fill='%23ffffff' fill-opacity='0.3'/%3E%3C/svg%3E')",
                    backgroundSize: "30px 30px",
                  }}
                />
              </div>

              {/* Icône d'avertissement */}
              <div className="position-relative z-1 text-center">
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-circle bg-white p-4 shadow-lg mb-3"
                  style={{ width: "80px", height: "80px" }}
                >
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    size="3x"
                    style={{ color: "#dc3545" }}
                  />
                </div>
                <h3 className="h4 fw-bold text-white mb-1">
                  Confirmer la suppression
                </h3>
                <p className="text-white-50 small mb-0">
                  Cette action est irréversible
                </p>
              </div>
            </div>

            {/* Corps du modal */}
            <div className="modal-body p-4">
              <div className="text-center mb-4">
                <p className="mb-3">Êtes-vous sûr de vouloir supprimer :</p>

                {/* Carte de l'élément à supprimer */}
                <div
                  className="d-flex align-items-center gap-3 p-3 rounded-3 border"
                  style={{
                    backgroundColor: `${typeColor}08`,
                    borderColor: `${typeColor}30`,
                  }}
                >
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle"
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: `${typeColor}15`,
                      color: typeColor,
                    }}
                  >
                    <FontAwesomeIcon icon={typeIcon} size="lg" />
                  </div>
                  <div className="flex-grow-1 text-start">
                    <div className="fw-bold text-dark mb-1">{itemTitle}</div>
                    <div className="d-flex align-items-center gap-2">
                      <span
                        className="badge"
                        style={{
                          backgroundColor: `${typeColor}15`,
                          color: typeColor,
                          fontSize: "0.75rem",
                          padding: "0.35rem 0.65rem",
                        }}
                      >
                        <FontAwesomeIcon
                          icon={typeIcon}
                          className="me-1"
                          size="xs"
                        />
                        {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-light rounded-3">
                  <div className="d-flex align-items-center gap-2 text-warning mb-2">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    <span className="fw-semibold small">Attention</span>
                  </div>
                  <p className="text-muted small mb-0">
                    Cette action supprimera définitivement l'annonce et toutes
                    ses données associées. Vous ne pourrez pas revenir en
                    arrière.
                  </p>
                </div>
              </div>
            </div>

            {/* Pied du modal */}
            <div className="modal-footer border-0 bg-light p-3">
              <div className="d-flex gap-2 w-100">
                <button
                  type="button"
                  className="btn btn-outline-secondary flex-grow-1 d-flex align-items-center justify-content-center gap-2 py-2"
                  onClick={onClose}
                  disabled={isDeleting}
                  style={{ borderRadius: "8px" }}
                >
                  <FontAwesomeIcon icon={faTimes} />
                  Annuler
                </button>

                <button
                  type="button"
                  className="btn btn-danger flex-grow-1 d-flex align-items-center justify-content-center gap-2 py-2"
                  onClick={onConfirm}
                  disabled={isDeleting}
                  style={{
                    borderRadius: "8px",
                    background: isDeleting
                      ? "#6c757d"
                      : "linear-gradient(135deg, #dc3545 0%, #b02a37 100%)",
                    border: "none",
                    opacity: isDeleting ? 0.65 : 1,
                  }}
                >
                  {isDeleting ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin />
                      Suppression en cours...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faTrash} />
                      Supprimer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
