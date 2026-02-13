// app/(front-office)/home/components/CategoriesNav.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import {
  CATEGORY_CONFIG,
  SUB_CATEGORY_CONFIG,
  DEFAULT_CATEGORIES,
} from "@/app/shared/constants/categories";
import colors from "@/app/shared/constants/colors";

interface Category {
  uuid: string;
  libelle: string;
  slug: string;
  type: string;
  description?: string;
  image?: string;
  enfants?: Category[];
  path?: string | null;
  is_deleted?: boolean;
  deleted_at?: string | null;
  id?: number;
}

export default function CategoriesNav() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // ============================================
  // CHARGEMENT DES CATÉGORIES - DIRECT API
  // ============================================
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const response = await api.get(API_ENDPOINTS.CATEGORIES.LIST);

        const activeCategories = response.filter(
          (c: Category) => !c.is_deleted && c.deleted_at === null,
        );

        const mainCategories = activeCategories
          .filter((c: Category) => !c.path || c.path === null || c.path === "")
          .filter(
            (c: Category, index: number, self: Category[]) =>
              index === self.findIndex((cat) => cat.libelle === c.libelle),
          );

        setCategories(mainCategories);
      } catch (err) {
        console.error("Error loading categories nav:", err);
        // ✅ CORRECTION: DEFAULT_CATEGORIES n'ont pas de propriété 'path'
        // Donc on les prend TOUTES car ce sont toutes des catégories principales
        setCategories(DEFAULT_CATEGORIES);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // ============================================
  // GESTION DU DÉFILEMENT
  // ============================================
  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const checkArrows = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkArrows);
      checkArrows();
      return () => container.removeEventListener("scroll", checkArrows);
    }
  }, [categories]);

  if (loading) {
    return (
      <div className="bg-light py-2">
        <div className="container">
          <div
            className="skeleton-loader"
            style={{
              height: "40px",
              backgroundColor: "#e0e0e0",
              borderRadius: "4px",
            }}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light border-bottom" style={{ position: "relative" }}>
      <div className="container position-relative">
        {/* Flèche gauche */}
        {showLeftArrow && (
          <button
            onClick={() => scroll("left")}
            className="btn position-absolute start-0 top-50 translate-middle-y z-1 d-none d-lg-flex align-items-center justify-content-center"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              border: "none",
              left: "-15px",
            }}
            aria-label="Défiler vers la gauche"
          >
            <i
              className="fas fa-chevron-left"
              style={{ color: colors.oskar.grey, fontSize: "0.8rem" }}
            ></i>
          </button>
        )}

        {/* Navigation horizontale */}
        <div
          ref={scrollContainerRef}
          className="d-flex overflow-auto py-2 hide-scrollbar"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            gap: "0.5rem",
          }}
        >
          <Link
            href="/"
            className="text-decoration-none px-3 py-2 rounded-pill flex-shrink-0"
            style={{
              backgroundColor: "#f8f9fa",
              color: colors.oskar.grey,
              fontSize: "0.9rem",
              fontWeight: 500,
              border: "1px solid #e9ecef",
              transition: "all 0.2s",
            }}
          >
            <i className="fas fa-home me-2"></i>
            Accueil
          </Link>

          {categories.map((category) => {
            const config =
              CATEGORY_CONFIG[category?.type as keyof typeof CATEGORY_CONFIG] ||
              CATEGORY_CONFIG["Autres"];

            return (
              <Link
                key={category.uuid}
                href={`/categories/${category.slug}`}
                className="text-decoration-none px-3 py-2 rounded-pill flex-shrink-0 d-flex align-items-center"
                style={{
                  backgroundColor: "#f8f9fa",
                  color: colors.oskar.grey,
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  border: "1px solid #e9ecef",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = config.color;
                  e.currentTarget.style.color = "white";
                  e.currentTarget.style.borderColor = config.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8f9fa";
                  e.currentTarget.style.color = colors.oskar.grey;
                  e.currentTarget.style.borderColor = "#e9ecef";
                }}
              >
                <i
                  className={`fas ${config.icon} me-2`}
                  style={{ fontSize: "0.8rem" }}
                ></i>
                {category.libelle}
              </Link>
            );
          })}
        </div>

        {/* Flèche droite */}
        {showRightArrow && (
          <button
            onClick={() => scroll("right")}
            className="btn position-absolute end-0 top-50 translate-middle-y z-1 d-none d-lg-flex align-items-center justify-content-center"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              border: "none",
              right: "-15px",
            }}
            aria-label="Défiler vers la droite"
          >
            <i
              className="fas fa-chevron-right"
              style={{ color: colors.oskar.grey, fontSize: "0.8rem" }}
            ></i>
          </button>
        )}
      </div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .skeleton-loader {
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse {
          0% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
}
