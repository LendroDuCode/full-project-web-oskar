// WhyOskar.tsx
"use client";

import colors from "../../../shared/constants/colors";

interface Feature {
  id: number;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  iconBgColor: string;
}

const WhyOskar = () => {
  const features: Feature[] = [
    {
      id: 1,
      title: "Sûr & Sécurisé",
      description:
        "Utilisateurs vérifiés, transactions sécurisées et directives communautaires pour vous protéger.",
      icon: "fa-shield-halved",
      iconColor: "white",
      iconBgColor: colors.oskar.green,
    },
    {
      id: 2,
      title: "Focus local",
      description:
        "Connectez-vous avec les gens de votre quartier pour un retrait et une livraison pratiques.",
      icon: "fa-location-dot",
      iconColor: "white",
      iconBgColor: colors.oskar.green,
    },
    {
      id: 3,
      title: "Facile à utiliser",
      description:
        "Processus de publication simple, filtres de recherche puissants et communication instantanée.",
      icon: "fa-circle-check",
      iconColor: "white",
      iconBgColor: colors.oskar.green,
    },
  ];

  return (
    <section
      id="why-oskar"
      className="why-oskar-section"
      style={{ backgroundColor: "white" }}
    >
      <div className="container">
        {/* En-tête */}
        <div className="text-center mb-5">
          <h2
            className="section-title mb-3"
            style={{ color: colors.oskar.black }}
          >
            Pourquoi choisir OSKAR ?
          </h2>
          <p className="section-subtitle" style={{ color: colors.oskar.grey }}>
            La plateforme de confiance pour les échanges qui ont du sens
          </p>
        </div>

        {/* Grille des fonctionnalités */}
        <div className="row g-4">
          {features.map((feature) => (
            <div key={feature.id} className="col-md-4">
              <div
                className="feature-card h-100"
                style={{
                  backgroundColor: colors.oskar.lightGrey,
                  borderRadius: "20px",
                  padding: "2rem",
                  textAlign: "center",
                  transition: "all 0.3s ease",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {/* Icône */}
                <div
                  className="feature-icon-wrapper mb-4"
                  style={{
                    backgroundColor: feature.iconBgColor,
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "transform 0.3s ease",
                  }}
                >
                  <i
                    className={`fa-solid ${feature.icon} feature-icon`}
                    style={{
                      color: feature.iconColor,
                      fontSize: "2rem",
                    }}
                  />
                </div>

                {/* Titre */}
                <h3
                  className="feature-title mb-3"
                  style={{
                    color: colors.oskar.black,
                    fontSize: "1.25rem",
                    fontWeight: "700",
                  }}
                >
                  {feature.title}
                </h3>

                {/* Description */}
                <p
                  className="feature-description"
                  style={{
                    color: colors.oskar.grey,
                    margin: 0,
                    lineHeight: "1.6",
                  }}
                >
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .why-oskar-section {
          padding: 3rem 0;
        }

        .section-title {
          font-size: 2rem;
          font-weight: 700;
        }

        .section-subtitle {
          font-size: 1.125rem;
        }

        .feature-card {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.12);
        }

        .feature-card:hover .feature-icon-wrapper {
          transform: scale(1.1);
        }

        @media (min-width: 768px) {
          .why-oskar-section {
            padding: 4rem 0;
          }

          .section-title {
            font-size: 2.5rem;
          }

          .feature-icon-wrapper {
            width: 90px;
            height: 90px;
          }

          .feature-icon {
            font-size: 2.25rem;
          }
        }

        @media (min-width: 992px) {
          .why-oskar-section {
            padding: 5rem 0;
          }

          .feature-card {
            padding: 2.5rem 2rem;
          }
        }
      `}</style>
    </section>
  );
};

export default WhyOskar;
