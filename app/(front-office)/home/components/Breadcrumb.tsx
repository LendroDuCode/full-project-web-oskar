// Breadcrumb.tsx - CORRIGÉ ET RESPONSIVE
"use client";

import colors from "@/app/shared/constants/colors";
import Link from "next/link";
import { useState, useEffect } from "react";

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
  id?: string | number;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
  maxVisibleItems?: number;
  showHomeIcon?: boolean;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items = [
    { label: "Accueil", href: "/" },
    { label: "Toutes les Annonces", active: true },
  ],
  className = "",
  maxVisibleItems = 4,
  showHomeIcon = true,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [showMore, setShowMore] = useState(false);

  // Détection de la taille d'écran
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Calcul des items visibles
  const getVisibleItems = () => {
    if (!isMobile || items.length <= maxVisibleItems || showMore) {
      return items;
    }

    // Sur mobile, on montre le premier, "..." et les 2 derniers
    if (items.length > maxVisibleItems) {
      const firstItem = items[0];
      const lastTwoItems = items.slice(-2);
      return [
        firstItem,
        { label: "...", active: false } as BreadcrumbItem,
        ...lastTwoItems,
      ];
    }

    return items;
  };

  const visibleItems = getVisibleItems();

  return (
    <section
      id="breadcrumb"
      className={`bg-white border-bottom ${className}`}
      style={{
        borderColor: colors.oskar.lightGrey,
        position: "relative",
      }}
    >
      <div className="container-fluid px-3 px-sm-4 px-lg-5">
        <nav
          className="d-flex align-items-center py-2"
          aria-label="Fil d'Ariane"
          style={{
            minHeight: "48px",
            overflowX: "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <ol
            className="d-flex align-items-center flex-wrap list-unstyled mb-0 p-0"
            style={{
              flex: "1 1 auto",
              gap: isMobile ? "0.5rem" : "0.75rem",
            }}
          >
            {visibleItems.map((item, index) => {
              const isEllipsis = item.label === "...";
              const isActive = item.active || index === visibleItems.length - 1;

              return (
                <li
                  key={item.id || index}
                  className="d-flex align-items-center"
                  style={{
                    whiteSpace: "nowrap",
                    flexShrink: isEllipsis ? 1 : 0,
                  }}
                >
                  {isEllipsis ? (
                    // Élément "..." pour les items masqués
                    <button
                      type="button"
                      className="btn btn-link p-0 border-0 bg-transparent"
                      onClick={() => setShowMore(true)}
                      style={{
                        color: colors.oskar.grey,
                        fontSize: isMobile ? "0.875rem" : "0.9375rem",
                        minHeight: "32px",
                        minWidth: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      aria-label="Afficher plus d'éléments"
                    >
                      <span style={{ lineHeight: 1 }}>...</span>
                    </button>
                  ) : item.href && !isActive ? (
                    // Lien non actif
                    <>
                      <Link
                        href={item.href}
                        className="text-decoration-none d-flex align-items-center"
                        style={{
                          color: colors.oskar.grey,
                          fontSize: isMobile ? "0.875rem" : "0.9375rem",
                          transition: "all 0.2s ease",
                          padding: isMobile
                            ? "0.25rem 0.5rem"
                            : "0.375rem 0.75rem",
                          borderRadius: "6px",
                          minHeight: "32px",
                          backgroundColor: "transparent",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = colors.oskar.green;
                          e.currentTarget.style.backgroundColor =
                            colors.oskar.lightGrey;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = colors.oskar.grey;
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.color = colors.oskar.green;
                          e.currentTarget.style.backgroundColor =
                            colors.oskar.lightGrey;
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.color = colors.oskar.grey;
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        {index === 0 && showHomeIcon ? (
                          <i
                            className="fa-solid fa-house"
                            style={{
                              fontSize: isMobile ? "0.875rem" : "0.9375rem",
                              marginRight: isMobile ? "0.375rem" : "0.5rem",
                            }}
                          />
                        ) : null}
                        {item.label}
                      </Link>

                      {/* Séparateur */}
                      {index < visibleItems.length - 1 && (
                        <i
                          className="fa-solid fa-chevron-right mx-2"
                          style={{
                            fontSize: isMobile ? "0.6875rem" : "0.75rem",
                            color: colors.oskar.lightGrey,
                            opacity: 0.7,
                            flexShrink: 0,
                          }}
                          aria-hidden="true"
                        />
                      )}
                    </>
                  ) : (
                    // Élément actif (pas de lien)
                    <>
                      <span
                        className="d-flex align-items-center"
                        style={{
                          color: colors.oskar.black,
                          fontSize: isMobile ? "0.875rem" : "0.9375rem",
                          fontWeight: 600,
                          padding: isMobile
                            ? "0.25rem 0.5rem"
                            : "0.375rem 0.75rem",
                          borderRadius: "6px",
                          minHeight: "32px",
                          backgroundColor: colors.oskar.lightGrey,
                        }}
                        aria-current="page"
                      >
                        {item.label}
                      </span>

                      {/* Séparateur (sauf pour le dernier élément) */}
                      {index < visibleItems.length - 1 && (
                        <i
                          className="fa-solid fa-chevron-right mx-2"
                          style={{
                            fontSize: isMobile ? "0.6875rem" : "0.75rem",
                            color: colors.oskar.lightGrey,
                            opacity: 0.7,
                            flexShrink: 0,
                          }}
                          aria-hidden="true"
                        />
                      )}
                    </>
                  )}
                </li>
              );
            })}
          </ol>

          {/* Bouton pour réduire sur mobile */}
          {isMobile && showMore && items.length > maxVisibleItems && (
            <button
              type="button"
              className="btn btn-link p-0 border-0 ms-2"
              onClick={() => setShowMore(false)}
              style={{
                color: colors.oskar.green,
                fontSize: "0.875rem",
                fontWeight: 500,
                minHeight: "32px",
                minWidth: "32px",
                flexShrink: 0,
                padding: "0.25rem 0.5rem",
              }}
              aria-label="Réduire le fil d'Ariane"
            >
              <i className="fa-solid fa-minus me-1"></i>
              Réduire
            </button>
          )}
        </nav>
      </div>

      {/* Barre de progression (optionnelle) */}
      {items.length > 1 && (
        <div
          className="position-absolute bottom-0 start-0 w-100"
          style={{
            height: "2px",
            backgroundColor: colors.oskar.lightGrey,
            opacity: 0.5,
          }}
        >
          <div
            className="h-100"
            style={{
              width: `${((items.findIndex((item) => item.active) + 1) / items.length) * 100}%`,
              backgroundColor: colors.oskar.green,
              transition: "width 0.3s ease",
            }}
          />
        </div>
      )}

      <style jsx global>{`
        /* Styles spécifiques au composant Breadcrumb */
        #breadcrumb nav::-webkit-scrollbar {
          display: none;
          height: 0;
        }

        #breadcrumb ol {
          scrollbar-width: none;
        }

        #breadcrumb ol::-webkit-scrollbar {
          display: none;
        }

        /* Amélioration de l'accessibilité */
        #breadcrumb a:focus-visible,
        #breadcrumb button:focus-visible {
          outline: 2px solid ${colors.oskar.green};
          outline-offset: 2px;
        }

        /* Transition fluide pour les survols */
        #breadcrumb a {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        /* Support des navigateurs plus anciens */
        @supports not (gap: 0.75rem) {
          #breadcrumb ol li {
            margin-right: 0.75rem;
          }

          #breadcrumb ol li:last-child {
            margin-right: 0;
          }

          @media (max-width: 768px) {
            #breadcrumb ol li {
              margin-right: 0.5rem;
            }
          }
        }

        /* Optimisations pour le touch sur mobile */
        @media (max-width: 768px) {
          #breadcrumb a,
          #breadcrumb button,
          #breadcrumb span {
            min-height: 40px !important;
            min-width: 40px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }

          #breadcrumb .fa-chevron-right {
            margin: 0 0.5rem !important;
          }
        }

        /* Ajustements pour les très petits écrans */
        @media (max-width: 360px) {
          #breadcrumb {
            font-size: 0.8125rem !important;
          }

          #breadcrumb a,
          #breadcrumb span {
            padding: 0.25rem 0.375rem !important;
            font-size: 0.8125rem !important;
          }

          #breadcrumb .fa-chevron-right {
            font-size: 0.625rem !important;
            margin: 0 0.375rem !important;
          }

          .fa-house {
            font-size: 0.8125rem !important;
            margin-right: 0.25rem !important;
          }
        }

        /* Support pour les écrans larges */
        @media (min-width: 1400px) {
          #breadcrumb .container-fluid {
            max-width: 1320px;
            margin: 0 auto;
          }
        }

        @media (min-width: 1600px) {
          #breadcrumb .container-fluid {
            max-width: 1520px;
          }
        }

        /* Mode sombre (préparation) */
        @media (prefers-color-scheme: dark) {
          #breadcrumb {
            background-color: #1a1a1a;
            border-color: #333;
          }

          #breadcrumb a {
            color: #ccc !important;
          }

          #breadcrumb a:hover {
            color: ${colors.oskar.green} !important;
            background-color: #333 !important;
          }

          #breadcrumb span {
            color: #fff !important;
            background-color: #333 !important;
          }

          #breadcrumb .fa-chevron-right {
            color: #666 !important;
          }
        }

        /* Animation pour le bouton "..." */
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        #breadcrumb button:hover span {
          animation: pulse 1s infinite;
        }

        /* Effet de profondeur pour l'élément actif */
        #breadcrumb span[aria-current="page"] {
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 768px) {
          #breadcrumb span[aria-current="page"] {
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          }
        }
      `}</style>
    </section>
  );
};

// Composant utilitaire pour les cas d'utilisation courants
export const HomeBreadcrumb: React.FC<Partial<BreadcrumbProps>> = (props) => (
  <Breadcrumb
    items={[
      { label: "Accueil", href: "/" },
      { label: "Toutes les Annonces", active: true },
    ]}
    showHomeIcon={true}
    {...props}
  />
);

export const CategoryBreadcrumb: React.FC<
  {
    category: string;
    subcategory?: string;
  } & Partial<BreadcrumbProps>
> = ({ category, subcategory, ...props }) => {
  const items: BreadcrumbItem[] = [
    { label: "Accueil", href: "/" },
    { label: "Toutes les Annonces", href: "/annonces" },
    { label: category, href: `/categorie/${category.toLowerCase()}` },
  ];

  if (subcategory) {
    items.push({
      label: subcategory,
      active: true,
    });
  } else {
    items[items.length - 1].active = true;
  }

  return <Breadcrumb items={items} {...props} />;
};

export default Breadcrumb;
