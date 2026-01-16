// CTABanner.tsx - CORRIGÉ avec container vert
"use client";

import Link from "next/link";
import colors from "../../../shared/constants/colors";

const CTABanner = () => {
  return (
    <section
      className="cta-banner-section"
      style={{
        backgroundColor: colors.oskar.lightGrey, // Fond gris pour toute la section
      }}
    >
      <div className="container">
        <div
          className="cta-container-green text-center"
          style={{
            backgroundColor: colors.oskar.green,
            background: `linear-gradient(135deg, ${colors.oskar.green} 0%, ${colors.oskar.green} 100%)`,
            borderRadius: "20px",
            padding: "3rem 2rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Effets décoratifs */}
          <div
            className="cta-pattern"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage:
                "radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)",
              zIndex: 1,
            }}
          />

          <div className="position-relative z-2">
            <h2 className="display-5 fw-bold text-white mb-4">
              Vous avez quelque chose à vendre, donner ou échanger ?
            </h2>

            <p className="lead text-white mb-5" style={{ opacity: 0.9 }}>
              Rejoignez des milliers d'utilisateurs satisfaits et publiez votre
              première annonce dès aujourd'hui !
            </p>

            <Link
              href="/publier-annonce"
              className="cta-link text-decoration-none"
            >
              <div
                className="cta-button-inner"
                style={{
                  backgroundColor: "white",
                  color: colors.oskar.green,
                  borderRadius: "12px",
                  padding: "1rem 2.5rem",
                  fontWeight: "700",
                  fontSize: "1.125rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
              >
                <i
                  className="fa-solid fa-plus-circle"
                  style={{ fontSize: "1.25rem" }}
                />
                <span>Publiez votre annonce maintenant</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cta-banner-section {
          padding: 4rem 0;
        }

        .cta-link {
          display: inline-block;
        }

        .cta-button-inner:hover {
          background-color: #f8f9fa !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
        }

        @media (max-width: 767.98px) {
          .cta-banner-section {
            padding: 3rem 1rem;
          }

          .cta-container-green {
            padding: 2rem 1.5rem !important;
          }

          .display-5 {
            font-size: 1.75rem;
          }

          .lead {
            font-size: 1.125rem;
          }

          .cta-button-inner {
            padding: 0.875rem 2rem;
            font-size: 1rem;
            flex-direction: column;
            gap: 0.5rem;
          }
        }

        @media (min-width: 768px) {
          .cta-banner-section {
            padding: 5rem 0;
          }

          .cta-container-green {
            padding: 4rem 3rem !important;
          }

          .display-5 {
            font-size: 2.5rem;
          }

          .lead {
            font-size: 1.25rem;
          }
        }

        @media (min-width: 992px) {
          .cta-banner-section {
            padding: 6rem 0;
          }

          .cta-container-green {
            padding: 5rem 4rem !important;
            max-width: 1000px;
            margin-left: auto;
            margin-right: auto;
          }

          .display-5 {
            font-size: 3rem;
            max-width: 900px;
            margin-left: auto;
            margin-right: auto;
          }
        }
      `}</style>
    </section>
  );
};

export default CTABanner;
