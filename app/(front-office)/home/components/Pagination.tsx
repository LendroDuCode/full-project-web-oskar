// Pagination.tsx
"use client";

import colors from "../../../shared/constants/colors";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage = 1,
  totalPages = 119,
  onPageChange,
}) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 7) {
      // Afficher toutes les pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Logique pour les ellipses
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5);
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("ellipsis");
        pages.push(currentPage - 1, currentPage, currentPage + 1);
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div id="pagination" className="pagination-container">
      <button
        className={`pagination-btn ${currentPage === 1 ? "disabled" : ""}`}
        onClick={handlePrevious}
        disabled={currentPage === 1}
      >
        <i className="fa-solid fa-chevron-left" />
      </button>

      {pageNumbers.map((page, index) => {
        if (page === "ellipsis") {
          return (
            <span key={`ellipsis-${index}`} className="pagination-ellipsis">
              ...
            </span>
          );
        }

        return (
          <button
            key={page}
            className={`pagination-btn ${page === currentPage ? "active" : ""}`}
            onClick={() => onPageChange(page as number)}
          >
            {page}
          </button>
        );
      })}

      <button
        className={`pagination-btn ${currentPage === totalPages ? "disabled" : ""}`}
        onClick={handleNext}
        disabled={currentPage === totalPages}
      >
        <i className="fa-solid fa-chevron-right" />
      </button>

      <style jsx>{`
        .pagination-container {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          margin-top: 3rem;
        }

        .pagination-btn {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 8px;
          border: 2px solid ${colors.oskar.lightGrey};
          background-color: white;
          color: ${colors.oskar.grey};
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.875rem;
        }

        .pagination-btn:hover:not(.disabled):not(.active) {
          border-color: ${colors.oskar.green};
          color: ${colors.oskar.green};
        }

        .pagination-btn.active {
          background-color: ${colors.oskar.green};
          color: white;
          border-color: ${colors.oskar.green};
        }

        .pagination-btn.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-ellipsis {
          color: ${colors.oskar.grey};
          padding: 0 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default Pagination;
