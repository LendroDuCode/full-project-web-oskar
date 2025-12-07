// CategoriesShowcase.tsx
"use client";

import { useState } from "react";
import colors from "../../../shared/constants/colors";

interface Category {
  id: number;
  name: string;
  count: number;
  icon: string;
  iconColor: string;
  bgColor: string;
}

const CategoriesShowcase = () => {
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);

  const categories: Category[] = [
    {
      id: 1,
      name: "Électronique",
      count: 487,
      icon: "fa-mobile-screen-button",
      iconColor: "#2196F3", // Bleu
      bgColor: "rgba(33, 150, 243, 0.1)",
    },
    {
      id: 2,
      name: "Vêtements & Chaussures",
      count: 612,
      icon: "fa-shirt",
      iconColor: "#E91E63", // Rose
      bgColor: "rgba(233, 30, 99, 0.1)",
    },
    {
      id: 3,
      name: "Éducation & Culture",
      count: 198,
      icon: "fa-book",
      iconColor: colors.oskar.green, // Vert
      bgColor: "rgba(76, 175, 80, 0.1)",
    },
    {
      id: 4,
      name: "Services de proximité",
      count: 89,
      icon: "fa-handshake-angle",
      iconColor: "#673AB7", // Indigo
      bgColor: "rgba(103, 58, 183, 0.1)",
    },
  ];

  const handleCategoryClick = (categoryId: number) => {
    console.log(`Catégorie cliquée: ${categoryId}`);
    // Vous pouvez ajouter la navigation ici
    // Ex: router.push(`/categories/${categoryId}`);
  };

  return (
    <section
      id="categories-showcase"
      className="categories-section"
      style={{ backgroundColor: colors.oskar.lightGrey }}
    >
      <div className="container">
        {/* En-tête */}
        <div className="text-center mb-5">
          <h2
            className="section-title mb-3"
            style={{ color: colors.oskar.black }}
          >
            Parcourir par Catégorie
          </h2>
          <p className="section-subtitle" style={{ color: colors.oskar.grey }}>
            Trouvez exactement ce que vous cherchez
          </p>
        </div>

        {/* Grille des catégories */}
        <div className="row g-4">
          {categories.map((category) => {
            const isHovered = hoveredCategory === category.id;

            return (
              <div key={category.id} className="col-6 col-md-3">
                <div
                  className="category-card"
                  onClick={() => handleCategoryClick(category.id)}
                  onMouseEnter={() => setHoveredCategory(category.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  style={{
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                >
                  {/* Icône */}
                  <div
                    className="category-icon-wrapper mx-auto mb-4"
                    style={{
                      backgroundColor: isHovered
                        ? colors.oskar.green
                        : category.bgColor,
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition:
                        "background-color 0.3s ease, transform 0.3s ease",
                    }}
                  >
                    <i
                      className={`fa-solid ${category.icon} category-icon`}
                      style={{
                        color: isHovered ? "white" : category.iconColor,
                        fontSize: "1.75rem",
                        transition: "color 0.3s ease, transform 0.3s ease",
                      }}
                    />
                  </div>

                  {/* Nom */}
                  <h3
                    className="category-name mb-2"
                    style={{
                      color: colors.oskar.black,
                      fontSize: "1.125rem",
                      fontWeight: "700",
                      lineHeight: "1.3",
                      transition: "color 0.3s ease",
                    }}
                  >
                    {category.name}
                  </h3>

                  {/* Nombre d'articles */}
                  <p
                    className="category-count"
                    style={{
                      color: colors.oskar.grey,
                      fontSize: "0.875rem",
                      margin: 0,
                    }}
                  >
                    {category.count.toLocaleString("fr-FR")} articles
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .categories-section {
          padding: 3rem 0;
        }

        .section-title {
          font-size: 2rem;
          font-weight: 700;
        }

        .section-subtitle {
          font-size: 1.125rem;
          margin-bottom: 0;
        }

        .category-card {
          background-color: white;
          border-radius: 16px;
          padding: 1.5rem;
          height: 100%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .category-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }

        .category-icon-wrapper:hover {
          transform: scale(1.1);
        }

        .category-card:hover .category-icon {
          transform: scale(1.1);
        }

        @media (min-width: 768px) {
          .categories-section {
            padding: 4rem 0;
          }

          .section-title {
            font-size: 2.5rem;
          }

          .category-icon-wrapper {
            width: 72px;
            height: 72px;
          }

          .category-icon {
            font-size: 2rem;
          }
        }

        @media (min-width: 992px) {
          .categories-section {
            padding: 5rem 0;
          }

          .category-icon-wrapper {
            width: 80px;
            height: 80px;
          }

          .category-icon {
            font-size: 2.25rem;
          }
        }
      `}</style>
    </section>
  );
};

export default CategoriesShowcase;
