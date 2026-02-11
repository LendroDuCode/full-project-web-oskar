// components/produits/shared/StatusBadge.tsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTimesCircle,
  faBan,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import colors from "@/app/shared/constants/colors";

interface StatusBadgeProps {
  statut: string;
}

const StatusBadge = ({ statut }: StatusBadgeProps) => {
  const getStatusInfo = (statut: string) => {
    const lowerStatut = statut.toLowerCase();

    if (lowerStatut.includes("publié") || lowerStatut === "publie") {
      return {
        icon: faCheckCircle,
        color: colors.oskar.green,
        label: "Publié",
      };
    }

    if (lowerStatut.includes("brouillon") || lowerStatut === "draft") {
      return {
        icon: faTimesCircle,
        color: colors.oskar.grey,
        label: "Brouillon",
      };
    }

    if (lowerStatut.includes("bloqué") || lowerStatut === "bloque") {
      return {
        icon: faBan,
        color: colors.oskar.orange,
        label: "Bloqué",
      };
    }

    if (lowerStatut.includes("attente") || lowerStatut === "en_attente") {
      return {
        icon: faClock,
        color: colors.oskar.blue,
        label: "En attente",
      };
    }

    return {
      icon: faTimesCircle,
      color: colors.oskar.grey,
      label: statut,
    };
  };

  const statusInfo = getStatusInfo(statut);

  return (
    <span
      className="badge d-inline-flex align-items-center gap-2"
      style={{
        backgroundColor: `${statusInfo.color}15`,
        color: statusInfo.color,
        border: `1px solid ${statusInfo.color}30`,
        padding: "0.4rem 0.75rem",
        fontSize: "0.75rem",
        fontWeight: "500",
      }}
    >
      <FontAwesomeIcon icon={statusInfo.icon} className="fs-12" />
      <span>{statusInfo.label}</span>
    </span>
  );
};

export default StatusBadge;
