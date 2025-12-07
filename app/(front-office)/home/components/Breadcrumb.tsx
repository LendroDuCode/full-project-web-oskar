// Breadcrumb.tsx - CORRIGÉ
"use client";

import Link from "next/link";
import colors from "../../../shared/constants/colors";

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items = [
    { label: "Accueil", href: "/" },
    { label: "Toutes les Annonces", active: true },
  ],
  className = "",
}) => {
  return (
    <section
      id="breadcrumb"
      className={`bg-white border-bottom ${className}`}
      style={{ borderColor: colors.oskar.lightGrey }}
    >
      <div className="container">
        <div className="d-flex align-items-center gap-2 py-2">
          {items.map((item, index) => (
            <div key={index} className="d-flex align-items-center gap-2">
              {item.href && !item.active ? (
                <>
                  <Link
                    href={item.href}
                    className="text-decoration-none"
                    style={{
                      color: colors.oskar.grey,
                      fontSize: "0.875rem",
                      transition: "color 0.3s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = colors.oskar.green)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = colors.oskar.grey)
                    }
                  >
                    {item.label}
                  </Link>

                  {/* Séparateur */}
                  {index < items.length - 1 && (
                    <i
                      className="fa-solid fa-chevron-right"
                      style={{
                        fontSize: "0.75rem",
                        color: colors.oskar.grey,
                      }}
                    />
                  )}
                </>
              ) : (
                <>
                  <span
                    className="fw-medium"
                    style={{
                      color: colors.oskar.black,
                      fontSize: "0.875rem",
                    }}
                  >
                    {item.label}
                  </span>

                  {/* Séparateur (sauf pour le dernier élément) */}
                  {index < items.length - 1 && (
                    <i
                      className="fa-solid fa-chevron-right"
                      style={{
                        fontSize: "0.75rem",
                        color: colors.oskar.grey,
                      }}
                    />
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Breadcrumb;
