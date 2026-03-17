"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faExclamationCircle,
  faExclamationTriangle,
  faInfoCircle,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";

interface CustomAlertProps {
  type: "success" | "danger" | "warning" | "info";
  title: string;
  message: string;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

export default function CustomAlert({
  type,
  title,
  message,
  onClose,
  autoClose = true,
  duration = 5000,
}: CustomAlertProps) {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return faCheckCircle;
      case "danger":
        return faExclamationCircle;
      case "warning":
        return faExclamationTriangle;
      case "info":
        return faInfoCircle;
      default:
        return faInfoCircle;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "#10b981";
      case "danger":
        return "#ef4444";
      case "warning":
        return "#f59e0b";
      case "info":
        return "#3b82f6";
      default:
        return "#3b82f6";
    }
  };

  return (
    <div
      className="position-fixed top-0 end-0 p-4"
      style={{ zIndex: 9999, maxWidth: "450px", minWidth: "350px" }}
    >
      <div
        className="alert alert-dismissible fade show shadow-lg border-0"
        role="alert"
        style={{
          backgroundColor: getBgColor(),
          color: "white",
          borderRadius: "12px",
          animation: "slideInRight 0.3s ease-out",
        }}
      >
        <div className="d-flex align-items-start gap-3">
          <div className="flex-shrink-0">
            <FontAwesomeIcon icon={getIcon()} className="fs-4" />
          </div>
          <div className="flex-grow-1">
            <h5 className="fw-bold mb-1" style={{ color: "white" }}>
              {title}
            </h5>
            <p className="mb-0" style={{ color: "white", opacity: 0.9 }}>
              {message}
            </p>
          </div>
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={onClose}
            aria-label="Close"
            style={{
              opacity: 0.8,
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.8")}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}