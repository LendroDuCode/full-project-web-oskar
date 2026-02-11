import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faClock,
  faBan,
  faLock,
  faInfoCircle,
  faBan as faBanSolid,
} from "@fortawesome/free-solid-svg-icons";

const BoutiqueStatusBadge = ({
  statut,
  est_bloque,
  est_ferme,
}: {
  statut: string;
  est_bloque: boolean;
  est_ferme: boolean;
}) => {
  if (est_bloque) {
    return (
      <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25">
        <FontAwesomeIcon icon={faBanSolid} className="me-1" />
        Bloqué
      </span>
    );
  }

  if (est_ferme) {
    return (
      <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25">
        <FontAwesomeIcon icon={faLock} className="me-1" />
        Fermé
      </span>
    );
  }

  switch (statut) {
    case "actif":
      return (
        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">
          <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
          Actif
        </span>
      );
    case "en_review":
      return (
        <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25">
          <FontAwesomeIcon icon={faClock} className="me-1" />
          En revue
        </span>
      );
    case "bloque":
      return (
        <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25">
          <FontAwesomeIcon icon={faBan} className="me-1" />
          Bloqué
        </span>
      );
    case "ferme":
      return (
        <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25">
          <FontAwesomeIcon icon={faLock} className="me-1" />
          Fermé
        </span>
      );
    default:
      return (
        <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25">
          <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
          {statut}
        </span>
      );
  }
};

export default BoutiqueStatusBadge;
