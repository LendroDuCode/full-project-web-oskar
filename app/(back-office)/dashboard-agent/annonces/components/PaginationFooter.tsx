// components/PaginationFooter.tsx
"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faEllipsis,
} from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import colors from "@/app/shared/constants/colors";

interface PaginationFooterProps {
  currentPage?: number;
  totalPages?: number;
  itemsPerPage?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  className?: string;
  showItemsCount?: boolean;
  showPageInfo?: boolean;
}

export default function PaginationFooter({
  currentPage = 1,
  totalPages = 50,
  itemsPerPage = 10,
  totalItems = 500,
  onPageChange,
  className = "",
  showItemsCount = true,
  showPageInfo = true,
}: PaginationFooterProps) {
  const [activePage, setActivePage] = useState(currentPage);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === activePage) return;

    setActivePage(page);
    onPageChange?.(page);
  };

  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5; // Nombre maximum de pages visibles
    let start = Math.max(1, activePage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    // Ajuster le début si on est proche de la fin
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();
  const startItem = (activePage - 1) * itemsPerPage + 1;
  const endItem = Math.min(activePage * itemsPerPage, totalItems);

  // Styles personnalisés avec couleurs vertes
  const customStyles = {
    activeButton: {
      backgroundColor: colors.oskar.green,
      color: "white",
      borderColor: colors.oskar.green,
    },
    activeButtonHover: {
      backgroundColor: colors.oskar.greenHover,
      borderColor: colors.oskar.greenHover,
    },
    inactiveButton: {
      backgroundColor: "white",
      color: colors.oskar.grey,
      borderColor: colors.oskar.lightGrey,
    },
    inactiveButtonHover: {
      backgroundColor: colors.oskar.lightGrey,
      borderColor: colors.oskar.grey,
      color: colors.oskar.black,
    },
    disabledButton: {
      backgroundColor: colors.oskar.lightGrey,
      color: "#adb5bd",
      borderColor: colors.oskar.lightGrey,
      cursor: "not-allowed",
    },
  };

  return (
    <footer
      className={`bg-white border-top border-light px-4 py-3 ${className}`}
      style={{
        boxShadow: "0 -1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div className="container-fluid">
        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
          {/* Compteur d'éléments */}
          {showItemsCount && (
            <div className="d-flex align-items-center gap-2 text-muted small">
              <span>Affichage de</span>
              <span
                className="fw-semibold"
                style={{ color: colors.oskar.black }}
              >
                {startItem}-{endItem}
              </span>
              <span>sur</span>
              <span
                className="fw-semibold"
                style={{ color: colors.oskar.black }}
              >
                {totalItems}
              </span>
              <span>annonces</span>
            </div>
          )}

          {/* Pagination */}
          <nav aria-label="Navigation des pages">
            <ul className="pagination pagination-sm mb-0">
              {/* Bouton Précédent */}
              <li className="page-item">
                <button
                  className="page-link border-0 rounded-2"
                  onClick={() => handlePageChange(activePage - 1)}
                  disabled={activePage === 1}
                  aria-label="Page précédente"
                  style={{
                    padding: "0.375rem 0.75rem",
                    transition: "all 0.2s ease",
                    ...(activePage === 1
                      ? customStyles.disabledButton
                      : customStyles.inactiveButton),
                  }}
                  onMouseEnter={(e) => {
                    if (activePage !== 1) {
                      Object.assign(
                        e.currentTarget.style,
                        customStyles.inactiveButtonHover,
                      );
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activePage !== 1) {
                      Object.assign(
                        e.currentTarget.style,
                        customStyles.inactiveButton,
                      );
                    }
                  }}
                >
                  <FontAwesomeIcon
                    icon={faChevronLeft}
                    style={{
                      fontSize: "0.75rem",
                      width: "12px",
                      height: "12px",
                    }}
                  />
                </button>
              </li>

              {/* Première page */}
              {!visiblePages.includes(1) && (
                <>
                  <li className="page-item">
                    <button
                      className="page-link border-0 rounded-2"
                      onClick={() => handlePageChange(1)}
                      style={{
                        padding: "0.375rem 0.75rem",
                        transition: "all 0.2s ease",
                        ...(activePage === 1
                          ? customStyles.activeButton
                          : customStyles.inactiveButton),
                        fontWeight: activePage === 1 ? "600" : "400",
                      }}
                      onMouseEnter={(e) => {
                        if (activePage !== 1) {
                          Object.assign(
                            e.currentTarget.style,
                            customStyles.inactiveButtonHover,
                          );
                        } else {
                          Object.assign(
                            e.currentTarget.style,
                            customStyles.activeButtonHover,
                          );
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (activePage !== 1) {
                          Object.assign(
                            e.currentTarget.style,
                            customStyles.inactiveButton,
                          );
                        } else {
                          Object.assign(
                            e.currentTarget.style,
                            customStyles.activeButton,
                          );
                        }
                      }}
                    >
                      1
                    </button>
                  </li>
                  {!visiblePages.includes(2) && (
                    <li className="page-item">
                      <span
                        className="page-link border-0 d-flex align-items-center justify-content-center"
                        style={{
                          color: colors.oskar.grey,
                          padding: "0.375rem 0.5rem",
                        }}
                      >
                        <FontAwesomeIcon icon={faEllipsis} />
                      </span>
                    </li>
                  )}
                </>
              )}

              {/* Pages visibles */}
              {visiblePages.map((page) => (
                <li key={page} className="page-item">
                  <button
                    className="page-link border-0 rounded-2"
                    onClick={() => handlePageChange(page)}
                    style={{
                      padding: "0.375rem 0.75rem",
                      transition: "all 0.2s ease",
                      minWidth: "36px",
                      ...(activePage === page
                        ? customStyles.activeButton
                        : customStyles.inactiveButton),
                      fontWeight: activePage === page ? "600" : "400",
                    }}
                    onMouseEnter={(e) => {
                      if (activePage !== page) {
                        Object.assign(
                          e.currentTarget.style,
                          customStyles.inactiveButtonHover,
                        );
                      } else {
                        Object.assign(
                          e.currentTarget.style,
                          customStyles.activeButtonHover,
                        );
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activePage !== page) {
                        Object.assign(
                          e.currentTarget.style,
                          customStyles.inactiveButton,
                        );
                      } else {
                        Object.assign(
                          e.currentTarget.style,
                          customStyles.activeButton,
                        );
                      }
                    }}
                  >
                    {page}
                  </button>
                </li>
              ))}

              {/* Dernière page */}
              {!visiblePages.includes(totalPages) && (
                <>
                  {!visiblePages.includes(totalPages - 1) && (
                    <li className="page-item">
                      <span
                        className="page-link border-0 d-flex align-items-center justify-content-center"
                        style={{
                          color: colors.oskar.grey,
                          padding: "0.375rem 0.5rem",
                        }}
                      >
                        <FontAwesomeIcon icon={faEllipsis} />
                      </span>
                    </li>
                  )}
                  <li className="page-item">
                    <button
                      className="page-link border-0 rounded-2"
                      onClick={() => handlePageChange(totalPages)}
                      style={{
                        padding: "0.375rem 0.75rem",
                        transition: "all 0.2s ease",
                        ...(activePage === totalPages
                          ? customStyles.activeButton
                          : customStyles.inactiveButton),
                        fontWeight: activePage === totalPages ? "600" : "400",
                      }}
                      onMouseEnter={(e) => {
                        if (activePage !== totalPages) {
                          Object.assign(
                            e.currentTarget.style,
                            customStyles.inactiveButtonHover,
                          );
                        } else {
                          Object.assign(
                            e.currentTarget.style,
                            customStyles.activeButtonHover,
                          );
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (activePage !== totalPages) {
                          Object.assign(
                            e.currentTarget.style,
                            customStyles.inactiveButton,
                          );
                        } else {
                          Object.assign(
                            e.currentTarget.style,
                            customStyles.activeButton,
                          );
                        }
                      }}
                    >
                      {totalPages}
                    </button>
                  </li>
                </>
              )}

              {/* Bouton Suivant */}
              <li className="page-item">
                <button
                  className="page-link border-0 rounded-2"
                  onClick={() => handlePageChange(activePage + 1)}
                  disabled={activePage === totalPages}
                  aria-label="Page suivante"
                  style={{
                    padding: "0.375rem 0.75rem",
                    transition: "all 0.2s ease",
                    ...(activePage === totalPages
                      ? customStyles.disabledButton
                      : customStyles.inactiveButton),
                  }}
                  onMouseEnter={(e) => {
                    if (activePage !== totalPages) {
                      Object.assign(
                        e.currentTarget.style,
                        customStyles.inactiveButtonHover,
                      );
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activePage !== totalPages) {
                      Object.assign(
                        e.currentTarget.style,
                        customStyles.inactiveButton,
                      );
                    }
                  }}
                >
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    style={{
                      fontSize: "0.75rem",
                      width: "12px",
                      height: "12px",
                    }}
                  />
                </button>
              </li>
            </ul>
          </nav>

          {/* Info page */}
          {showPageInfo && (
            <div className="text-muted small">
              Page{" "}
              <span
                className="fw-semibold"
                style={{ color: colors.oskar.black }}
              >
                {activePage}
              </span>{" "}
              sur{" "}
              <span
                className="fw-semibold"
                style={{ color: colors.oskar.black }}
              >
                {totalPages}
              </span>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
