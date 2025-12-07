// components/Breadcrumb.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import colors from "../../../shared/constants/colors";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrent?: boolean;
}

const Breadcrumb = () => {
  const pathname = usePathname();

  // Générer les éléments du fil d'Ariane en fonction du chemin actuel
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split("/").filter((segment) => segment !== "");

    if (segments.length === 0) {
      return [{ label: "Accueil", href: "/", isCurrent: true }];
    }

    const breadcrumbs: BreadcrumbItem[] = [{ label: "Accueil", href: "/" }];

    let currentPath = "";

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Transformer le segment en label lisible
      const label = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      const isCurrent = index === segments.length - 1;

      breadcrumbs.push({
        label,
        href: isCurrent ? undefined : currentPath,
        isCurrent,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <section
      className="bg-white border-bottom"
      style={{ borderBottom: `1px solid ${colors.oskar.lightGrey}` }}
    >
      <div className="container">
        <div className="py-3">
          <nav aria-label="Fil d'Ariane">
            <ol className="breadcrumb mb-0">
              {breadcrumbs.map((item, index) => (
                <li
                  key={index}
                  className={`breadcrumb-item ${item.isCurrent ? "active" : ""}`}
                  aria-current={item.isCurrent ? "page" : undefined}
                >
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="text-decoration-none"
                      style={{
                        color: colors.oskar.grey,
                        transition: "color 0.3s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = colors.oskar.green;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = colors.oskar.grey;
                      }}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      style={{
                        color: colors.oskar.black,
                        fontWeight: 500,
                      }}
                    >
                      {item.label}
                    </span>
                  )}

                  {/* Séparateur */}
                  {index < breadcrumbs.length - 1 && (
                    <span className="mx-2" style={{ color: colors.oskar.grey }}>
                      <i className="fas fa-chevron-right fa-xs"></i>
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>
    </section>
  );
};

export default Breadcrumb;
