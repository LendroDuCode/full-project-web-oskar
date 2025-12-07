// components/FavoritesHero.tsx
"use client";

import colors from "../../../shared/constants/colors";

interface FavoritesHeroProps {
  title?: string;
  subtitle?: string;
  savedCount?: number;
  lastUpdated?: string;
}

const FavoritesHero: React.FC<FavoritesHeroProps> = ({
  title = "Mes Favoris",
  subtitle = "Vos annonces et produits sauvegardés pour un accès facile",
  savedCount = 24,
  lastUpdated = "aujourd'hui",
}) => {
  return (
    <section
      className="py-5"
      style={{
        background: `linear-gradient(135deg, ${colors.oskar.green} 0%, ${colors.oskar.greenHover || "#3D8B40"} 100%)`,
        minHeight: "280px",
      }}
    >
      <div className="container h-100">
        <div className="h-100 d-flex align-items-center">
          <div className="text-white">
            <div className="d-flex align-items-center mb-4">
              {/* Icône */}
              <div
                className="rounded-circle d-flex align-items-center justify-content-center me-4"
                style={{
                  width: "64px",
                  height: "64px",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(4px)",
                }}
              >
                <i className="fas fa-heart fs-3"></i>
              </div>

              {/* Titre et sous-titre */}
              <div>
                <h1 className="display-4 fw-bold mb-2">{title}</h1>
                <p className="fs-5 opacity-90 mb-0">{subtitle}</p>
              </div>
            </div>

            {/* Statistiques */}
            <div className="d-flex flex-wrap gap-4 mt-4 opacity-90">
              <div className="d-flex align-items-center gap-2">
                <i className="fas fa-bookmark"></i>
                <span className="fs-6">{savedCount} Articles sauvegardés</span>
              </div>

              <div className="d-flex align-items-center gap-2">
                <i className="fas fa-clock"></i>
                <span className="fs-6">Dernière mise à jour {lastUpdated}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FavoritesHero;
