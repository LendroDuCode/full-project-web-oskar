// app/(back-office)/dashboard-admin/statuts-matrimoniaux/components/StatusBadge.tsx
"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleXmark,
  faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";

interface StatusBadgeProps {
  statut: string;
  size?: "sm" | "md" | "lg";
}

export default function StatusBadge({ statut, size = "md" }: StatusBadgeProps) {
  // Configuration basée sur le statut
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "actif":
        return {
          icon: faCircleCheck,
          iconColor: "text-success",
          bgColor: "bg-success bg-opacity-10",
          textColor: "text-success",
          borderColor: "border-success border-opacity-25",
          label: "Actif",
        };
      case "inactif":
        return {
          icon: faCircleXmark,
          iconColor: "text-danger",
          bgColor: "bg-danger bg-opacity-10",
          textColor: "text-danger",
          borderColor: "border-danger border-opacity-25",
          label: "Inactif",
        };
      default:
        return {
          icon: faCircleExclamation,
          iconColor: "text-warning",
          bgColor: "bg-warning bg-opacity-10",
          textColor: "text-warning",
          borderColor: "border-warning border-opacity-25",
          label: status.charAt(0).toUpperCase() + status.slice(1),
        };
    }
  };

  const config = getStatusConfig(statut);

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
      }}
    >
      <FontAwesomeIcon
        icon={config.icon}
        className={`${config.iconColor} ${iconSize[size]}`}
      />
      <span className="text-capitalize">{config.label}</span>
    </span>
  );
}
