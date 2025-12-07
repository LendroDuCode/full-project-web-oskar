// HeroSearch.tsx
"use client";

import { useState } from "react";
import colors from "../../../shared/constants/colors"; // Ajustez le chemin selon votre structure

const HeroSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const tags = ["Téléphones", "Ordinateurs", "Meubles", "Vêtements", "Livres"];

  const handleSearch = () => {
    console.log("Recherche:", searchQuery);
    // Ajoutez votre logique de recherche ici
  };

  const handleTagClick = (tag: string) => {
    setActiveTag(tag);
    setSearchQuery(tag);
    // Vous pouvez aussi déclencher une recherche automatique
    console.log("Recherche par tag:", tag);
  };

  return (
    <section
      id="hero-search"
      className="bg-white border-bottom"
      style={{ borderColor: colors.oskar.lightGrey }}
    >
      <div className="container">
        <div className="mx-auto" style={{ maxWidth: "768px" }}>
          {/* Titre */}
          <h1
            className="h1 text-center mb-4 fw-bold"
            style={{ color: colors.oskar.black }}
          >
            Découvrez les pépites près de vous
          </h1>

          {/* Barre de recherche */}
          <div className="position-relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Rechercher des articles, services ou catégories..."
              className="form-control form-control-lg border-2"
              style={{
                paddingRight: "140px",
                borderRadius: "12px",
                borderColor: colors.oskar.lightGrey,
                color: colors.oskar.black,
              }}
            />
            <button
              onClick={handleSearch}
              className="btn position-absolute top-50 end-0 translate-middle-y me-2"
              style={{
                backgroundColor: colors.oskar.green,
                color: "white",
                fontWeight: 600,
                padding: "10px 24px",
                borderRadius: "8px",
                border: "none",
                transition: "background-color 0.3s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = colors.oskar.greenDark)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = colors.oskar.green)
              }
            >
              Rechercher
            </button>
          </div>

          {/* Tags de recherche rapide */}
          <div className="d-flex flex-wrap justify-content-center gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="btn btn-sm rounded-pill px-3 py-2"
                style={{
                  backgroundColor:
                    activeTag === tag
                      ? colors.oskar.green
                      : colors.oskar.lightGrey,
                  color: activeTag === tag ? "white" : colors.oskar.grey,
                  fontSize: "14px",
                  transition: "all 0.3s",
                  border: "none",
                }}
                onMouseEnter={(e) => {
                  if (activeTag !== tag) {
                    e.currentTarget.style.backgroundColor = colors.oskar.green;
                    e.currentTarget.style.color = "white";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTag !== tag) {
                    e.currentTarget.style.backgroundColor =
                      colors.oskar.lightGrey;
                    e.currentTarget.style.color = colors.oskar.grey;
                  }
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .border-bottom {
          border-bottom-width: 1px;
          border-bottom-style: solid;
        }

        .h1 {
          font-size: 2rem;
        }

        @media (min-width: 768px) {
          .h1 {
            font-size: 2.5rem;
          }
        }

        .form-control:focus {
          border-color: ${colors.oskar.green} !important;
          box-shadow: 0 0 0 0.25rem rgba(76, 175, 80, 0.25);
        }
      `}</style>
    </section>
  );
};

export default HeroSearch;
