"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faTrash,
  faLock,
  faUnlock,
  faCheck,
  faXmark,
  faCalendarCheck,
  faCalendarXmark,
  faBan,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";

interface ConfirmModalProps {
  show: boolean;
  title: string;
  message: string;
  type: "delete" | "block" | "unblock" | "publish" | "unpublish" | "restore" | "validate" | "reject" | "warning";
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  itemCount?: number;
}

export default function ConfirmModal({
  show,
  title,
  message,
  type = "warning",
  confirmText = "Confirmer",
  cancelText = "Annuler",
  onConfirm,
  onCancel,
  itemCount = 1,
}: ConfirmModalProps) {
  
  // Empêcher le défilement du body quand la modal est ouverte
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  if (!show) return null;

  // Configuration des couleurs et icônes selon le type
  const getConfig = () => {
    const configs = {
      delete: {
        icon: faTrash,
        color: "#ef4444",
        bgColor: "rgba(239, 68, 68, 0.1)",
        gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
      },
      block: {
        icon: faLock,
        color: "#f59e0b",
        bgColor: "rgba(245, 158, 11, 0.1)",
        gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      },
      unblock: {
        icon: faUnlock,
        color: "#10b981",
        bgColor: "rgba(16, 185, 129, 0.1)",
        gradient: "linear-gradient(135deg, #10b981 0%, #0f9d6e 100%)",
      },
      validate: {
        icon: faCheck,
        color: "#10b981",
        bgColor: "rgba(16, 185, 129, 0.1)",
        gradient: "linear-gradient(135deg, #10b981 0%, #0f9d6e 100%)",
      },
      reject: {
        icon: faXmark,
        color: "#ef4444",
        bgColor: "rgba(239, 68, 68, 0.1)",
        gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
      },
      publish: {
        icon: faCalendarCheck,
        color: "#10b981",
        bgColor: "rgba(16, 185, 129, 0.1)",
        gradient: "linear-gradient(135deg, #10b981 0%, #0f9d6e 100%)",
      },
      unpublish: {
        icon: faCalendarXmark,
        color: "#f59e0b",
        bgColor: "rgba(245, 158, 11, 0.1)",
        gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      },
      restore: {
        icon: faUnlock,
        color: "#10b981",
        bgColor: "rgba(16, 185, 129, 0.1)",
        gradient: "linear-gradient(135deg, #10b981 0%, #0f9d6e 100%)",
      },
      warning: {
        icon: faExclamationTriangle,
        color: "#f59e0b",
        bgColor: "rgba(245, 158, 11, 0.1)",
        gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      },
    };
    return configs[type] || configs.warning;
  };

  const config = getConfig();

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
        onClick={onCancel}
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
          {/* En-tête avec dégradé */}
          <div
            className="p-4 text-center"
            style={{
              background: config.gradient,
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
                icon={config.icon}
                style={{
                  fontSize: "2.5rem",
                  color: config.color,
                }}
              />
            </div>
          </div>

          {/* Corps */}
          <div className="p-4 text-center">
            <h4 className="fw-bold mb-3" style={{ color: "#1f2937" }}>
              {title}
              {itemCount > 1 && (
                <span
                  className="badge ms-2"
                  style={{
                    backgroundColor: config.bgColor,
                    color: config.color,
                    fontSize: "0.8rem",
                    padding: "0.35rem 0.65rem",
                  }}
                >
                  {itemCount} éléments
                </span>
              )}
            </h4>
            
            <p className="text-muted mb-4" style={{ fontSize: "1rem", lineHeight: "1.6" }}>
              {message}
            </p>

            {/* Boutons */}
            <div className="d-flex gap-3">
              <button
                className="btn flex-grow-1 py-3"
                onClick={onCancel}
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
                <FontAwesomeIcon icon={faXmark} className="me-2" />
                {cancelText}
              </button>
              
              <button
                className="btn flex-grow-1 py-3 text-white"
                onClick={onConfirm}
                style={{
                  background: config.gradient,
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  fontWeight: "600",
                  transition: "all 0.2s",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.9";
                  e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <FontAwesomeIcon icon={config.icon} className="me-2" />
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Styles d'animation */}
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