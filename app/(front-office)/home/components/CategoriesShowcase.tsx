// app/(front-office)/home/components/CategoriesShowcase.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import {
  CATEGORY_CONFIG,
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

export default function CategoriesShowcase() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
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
          )
          .slice(0, 6); // Limiter à 6 catégories pour l'affichage

        setCategories(mainCategories);
      } catch (err) {
        console.error("🔴 CategoriesShowcase - Error:", err);
        // ✅ CORRECTION: DEFAULT_CATEGORIES n'ont pas de propriété 'path'
        // Donc on les prend TOUTES car ce sont toutes des catégories principales
        setCategories(DEFAULT_CATEGORIES.slice(0, 6));
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-5">
        <div className="container">
          <h2 className="h3 fw-bold text-center mb-4">
            Parcourez par catégories
          </h2>
          <div className="row g-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="col-6 col-md-4 col-lg-2">
                <div className="card border-0 shadow-sm">
                  <div className="card-body text-center p-3">
                    <div
                      className="skeleton-loader rounded-circle mx-auto mb-3"
                      style={{
                        width: "60px",
                        height: "60px",
                        backgroundColor: "#e0e0e0",
                      }}
                    ></div>
                    <div
                      className="skeleton-loader mx-auto"
                      style={{
                        width: "80px",
                        height: "16px",
                        backgroundColor: "#e0e0e0",
                        borderRadius: "4px",
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-5">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="h2 fw-bold mb-2">Parcourez par catégories</h2>
          <p className="text-muted fs-5">
            Des milliers d'annonces dans des centaines de catégories
          </p>
        </div>

        <div className="row g-4">
          {categories.map((category) => {
            const config =
              CATEGORY_CONFIG[category?.type as keyof typeof CATEGORY_CONFIG] ||
              CATEGORY_CONFIG["Autres"];
            const subCount = category.enfants?.length || 0;

            return (
              <div key={category.uuid} className="col-6 col-md-4 col-lg-2">
                <Link
                  href={`/categories/${category.slug}`}
                  className="text-decoration-none"
                >
                  <div className="card border-0 shadow-sm h-100 category-card">
                    <div className="card-body text-center p-3">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                        style={{
                          width: "70px",
                          height: "70px",
                          backgroundColor: `${config.color}15`,
                          color: config.color,
                          transition: "all 0.3s ease",
                        }}
                      >
                        <i className={`fas ${config.icon} fa-2x`}></i>
                      </div>
                      <h6 className="fw-semibold mb-1 text-dark">
                        {category.libelle}
                      </h6>
                      {subCount > 0 && (
                        <small
                          className="text-muted d-block"
                          style={{ fontSize: "0.75rem" }}
                        >
                          {subCount} sous-catégorie{subCount > 1 ? "s" : ""}
                        </small>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-5">
          <Link
            href="/categories"
            className="btn btn-outline-success px-4 py-2 fw-semibold"
          >
            <i className="fas fa-th-large me-2"></i>
            Toutes les catégories
          </Link>
        </div>
      </div>

      <style>{`
        .category-card {
          transition: all 0.3s ease;
          cursor: pointer;
          border-radius: 12px;
        }
        .category-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.1) !important;
        }
        .category-card:hover .rounded-circle {
          transform: scale(1.1);
          background-color: ${colors.oskar.green} !important;
          color: white !important;
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
    </section>
  );
}
