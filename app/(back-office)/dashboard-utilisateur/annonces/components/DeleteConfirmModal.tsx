"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faTrash,
  faTimes,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  itemTitle: string;
  itemType: string;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  itemTitle,
  itemType,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  // Empêcher le défilement quand la modal est ouverte
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getTypeLabel = () => {
    switch (itemType) {
      case "produit":
        return "produit";
      case "don":
        return "don";
      case "echange":
        return "échange";
      default:
        return "annonce";
    }
  };

  return (
    <>
      {/* Overlay avec flou */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(5px)",
          zIndex: 1050,
          animation: "fadeIn 0.2s ease-out",
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="position-fixed top-50 start-50 translate-middle"
        style={{
          zIndex: 1051,
          width: "90%",
          maxWidth: "450px",
          animation: "slideInUp 0.3s ease-out",
        }}
      >
        <div className="bg-white rounded-4 shadow-xl border-0 overflow-hidden">
          {/* En-tête avec dégradé rouge */}
          <div
            className="p-4 text-center"
            style={{
              background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
            }}
          >
            <div
              className="rounded-circle bg-white d-flex align-items-center justify-content-center mx-auto"
              style={{
                width: "80px",
                height: "80px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
              }}
            >
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                style={{
                  fontSize: "2.5rem",
                  color: "#ef4444",
                }}
              />
            </div>
          </div>

          {/* Corps */}
          <div className="p-4 text-center">
            <h4 className="fw-bold mb-3" style={{ color: "#1f2937" }}>
              Supprimer {getTypeLabel()}
            </h4>

            <p className="text-muted mb-4" style={{ fontSize: "1rem", lineHeight: "1.6" }}>
              Êtes-vous sûr de vouloir supprimer <strong className="text-dark">"{itemTitle}"</strong> ?
            </p>

            <div className="alert alert-warning mb-4 border-0 bg-warning bg-opacity-10">
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2 text-warning" />
              <span className="small">
                Cette action est irréversible. Toutes les données associées seront définitivement effacées.
              </span>
            </div>

            {/* Boutons */}
            <div className="d-flex gap-3">
              <button
                className="btn flex-grow-1 py-3"
                onClick={onClose}
                disabled={isDeleting}
                style={{
                  backgroundColor: "#f3f4f6",
                  color: "#4b5563",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  fontWeight: "500",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#e5e7eb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#f3f4f6";
                }}
              >
                <FontAwesomeIcon icon={faTimes} className="me-2" />
                Annuler
              </button>

              <button
                className="btn flex-grow-1 py-3 text-white"
                onClick={onConfirm}
                disabled={isDeleting}
                style={{
                  background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  fontWeight: "600",
                  transition: "all 0.2s",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                  opacity: isDeleting ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isDeleting) {
                    e.currentTarget.style.opacity = "0.9";
                    e.currentTarget.style.transform = "scale(1.02)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isDeleting) {
                    e.currentTarget.style.opacity = "1";
                    e.currentTarget.style.transform = "scale(1)";
                  }
                }}
              >
                {isDeleting ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                    Suppression...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faTrash} className="me-2" />
                    Supprimer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }

        .shadow-xl {
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </>
  );
}