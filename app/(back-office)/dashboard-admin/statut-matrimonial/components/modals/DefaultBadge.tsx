// app/(back-office)/dashboard-admin/statuts-matrimoniaux/components/DefaultBadge.tsx
"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCrown,
  faStar,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";

interface DefaultBadgeProps {
  isDefault: boolean;
  variant?: "crown" | "star" | "check";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function DefaultBadge({
  isDefault,
  variant = "crown",
  size = "sm",
  showLabel = true,
}: DefaultBadgeProps) {
  if (!isDefault) return null;

  // Configuration basée sur la variante
  const getVariantConfig = () => {
    switch (variant) {
      case "star":
        return {
          icon: faStar,
          iconColor: "text-warning",
          bgColor: "bg-warning bg-opacity-10",
          textColor: "text-warning",
          borderColor: "border-warning border-opacity-25",
          label: "Par défaut",
        };
      case "check":
        return {
          icon: faCheckCircle,
          iconColor: "text-success",
          bgColor: "bg-success bg-opacity-10",
          textColor: "text-success",
          borderColor: "border-success border-opacity-25",
          label: "Défaut",
        };
      case "crown":
      default:
        return {
          icon: faCrown,
          iconColor: "text-warning",
          bgColor: "bg-warning bg-opacity-10",
          textColor: "text-warning",
          borderColor: "border-warning border-opacity-25",
          label: "Par défaut",
        };
    }
  };

  const config = getVariantConfig();

  // Tailles
  const sizeClasses = {
    sm: "px-2 py-1 fs-11",
    md: "px-3 py-1 fs-12",
    lg: "px-4 py-2 fs-14",
  };

  const iconSize = {
    sm: "fs-10",
    md: "fs-11",
    lg: "fs-13",
  };

  return (
    <span
      className={`badge ${config.bgColor} ${config.textColor} ${config.borderColor} border d-inline-flex align-items-center gap-1 ${sizeClasses[size]}`}
      style={{
        borderRadius: "20px",
        fontWeight: "500",
        letterSpacing: "0.3px",
        marginLeft: "6px",
      }}
      title="Statut matrimonial par défaut"
    >
      <FontAwesomeIcon
        icon={config.icon}
        className={`${config.iconColor} ${iconSize[size]}`}
      />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}
