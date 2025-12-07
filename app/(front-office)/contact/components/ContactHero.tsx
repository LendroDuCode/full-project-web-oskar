"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeadset,
  faClock,
  faShieldHalved,
  faLanguage,
} from "@fortawesome/free-solid-svg-icons";
import colors from "../../../shared/constants/colors"; // Assurez-vous d'avoir le bon chemin

interface ContactHeroProps {
  title?: string;
  subtitle?: string;
  badgeItems?: Array<{
    icon: any;
    text: string;
  }>;
  gradientFrom?: string;
  gradientTo?: string;
}

export default function ContactHero({
  title = "Contactez OSKAR",
  subtitle = "Nous sommes là pour vous aider avec toutes vos questions, besoins de support ou retours d'expérience. Notre équipe est prête à vous accompagner pour tirer le meilleur parti de votre expérience OSKAR.",
  badgeItems,
  gradientFrom = colors.oskar.green, // Utilisation du vert OSKAR
  gradientTo = colors.oskar.greenHover, // Utilisation du vert hover
}: ContactHeroProps) {
  // Badges par défaut
  const defaultBadgeItems = [
    {
      icon: faClock,
      text: "Réponse sous 24 heures",
    },
    {
      icon: faShieldHalved,
      text: "100% Sécurisé",
    },
    {
      icon: faLanguage,
      text: "Support Français & Anglais",
    },
  ];

  const displayBadgeItems = badgeItems || defaultBadgeItems;

  return (
    <section
      id="hero-contact"
      className="text-white py-5 py-lg-6"
      style={{
        background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-xl-9">
            <div className="text-center px-3 px-md-0">
              {/* Icône */}
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4"
                style={{
                  width: "100px",
                  height: "100px",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(10px)",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                }}
              >
                <FontAwesomeIcon icon={faHeadset} className="fs-1" />
              </div>

              {/* Titre */}
              <h1 className="display-4 fw-bold mb-4">{title}</h1>

              {/* Sous-titre */}
              <p className="lead mb-5 opacity-90">{subtitle}</p>

              {/* Badges */}
              <div className="d-flex flex-wrap justify-content-center gap-3">
                {displayBadgeItems.map((badge, index) => (
                  <div
                    key={index}
                    className="d-flex align-items-center px-4 py-3 rounded-pill"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      backdropFilter: "blur(5px)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(255, 255, 255, 0.3)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(255, 255, 255, 0.2)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <FontAwesomeIcon icon={badge.icon} className="me-3" />
                    <span className="fw-medium">{badge.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
