// app/dashboard/type-boutique/components/VenteBadge.tsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBox, faHome } from "@fortawesome/free-solid-svg-icons";
import colors from "@/app/shared/constants/colors";

interface VenteBadgeProps {
  type: "produits" | "biens";
  value: boolean;
}

export default function VenteBadge({ type, value }: VenteBadgeProps) {
  const config = {
    produits: {
      icon: faBox,
      label: "Produits",
      trueColor: colors.oskar.green,
      falseColor: colors.oskar.grey,
    },
    biens: {
      icon: faHome,
      label: "Biens",
      trueColor: colors.oskar.blue,
      falseColor: colors.oskar.grey,
    },
  }[type];

  return (
    <span
      className="badge d-inline-flex align-items-center gap-1"
      style={{
        backgroundColor: value
          ? `${config.trueColor}15`
          : `${config.falseColor}15`,
        color: value ? config.trueColor : config.falseColor,
        border: `1px solid ${value ? config.trueColor : config.falseColor}30`,
        padding: "0.3rem 0.6rem",
        fontSize: "0.75rem",
      }}
    >
      <FontAwesomeIcon icon={config.icon} className="fs-10" />
      <span>
        {config.label}: {value ? "Oui" : "Non"}
      </span>
    </span>
  );
}
