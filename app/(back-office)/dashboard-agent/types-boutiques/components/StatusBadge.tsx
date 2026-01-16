// app/dashboard/type-boutique/components/StatusBadge.tsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";

interface StatusBadgeProps {
  statut: string;
}

export default function StatusBadge({ statut }: StatusBadgeProps) {
  if (statut === "actif") {
    return (
      <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 d-inline-flex align-items-center gap-1">
        <FontAwesomeIcon icon={faCheckCircle} className="fs-12" />
        <span>Actif</span>
      </span>
    );
  }

  return (
    <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 d-inline-flex align-items-center gap-1">
      <FontAwesomeIcon icon={faTimesCircle} className="fs-12" />
      <span>Inactif</span>
    </span>
  );
}
