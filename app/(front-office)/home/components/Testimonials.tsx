// Testimonials.tsx
"use client";

import colors from "../../../shared/constants/colors";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
}

const Testimonials = () => {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Aminata K.",
      role: "Étudiante",
      avatar:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg",
      content:
        "J'ai trouvé l'ordinateur portable parfait pour mes études à un prix incroyable. Le vendeur était honnête et serviable. OSKAR a rendu cela si facile !",
      rating: 5,
    },
    {
      id: 2,
      name: "Kouadio M.",
      role: "Chef d'entreprise",
      avatar:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg",
      content:
        "J'ai donné plusieurs articles et ça fait du bien d'aider les autres. La plateforme est simple et me met en relation avec des gens qui en ont vraiment besoin.",
      rating: 5,
    },
    {
      id: 3,
      name: "Fatoumata S.",
      role: "Enseignante",
      avatar:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg",
      content:
        "La fonction d'échange est géniale ! J'ai échangé mon ancien téléphone contre une tablette et nous étions tous les deux heureux. Bien mieux que de simplement vendre.",
      rating: 5,
    },
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <i
        key={index}
        className={`fa-solid fa-star ${index < rating ? "text-warning" : "text-secondary"}`}
        style={{ fontSize: "1rem" }}
      />
    ));
  };

  return (
    <section
      id="testimonials"
      className="testimonials-section"
      style={{ backgroundColor: colors.oskar.lightGrey }}
    >
      <div className="container">
        {/* En-tête */}
        <div className="text-center mb-5">
          <h2
            className="section-title mb-3"
            style={{ color: colors.oskar.black }}
          >
            Ce que disent nos utilisateurs
          </h2>
          <p className="section-subtitle" style={{ color: colors.oskar.grey }}>
            Histoires vraies de la communauté OSKAR
          </p>
        </div>

        {/* Grille des témoignages */}
        <div className="row g-4">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="col-md-4">
              <div
                className="testimonial-card h-100"
                style={{
                  backgroundColor: "white",
                  borderRadius: "20px",
                  padding: "2rem",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                  transition: "all 0.3s ease",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Étoiles */}
                <div className="testimonial-rating mb-3">
                  <div className="d-flex gap-1">
                    {renderStars(testimonial.rating)}
                  </div>
                </div>

                {/* Contenu du témoignage */}
                <p
                  className="testimonial-content mb-4 flex-grow-1"
                  style={{
                    color: colors.oskar.grey,
                    fontStyle: "italic",
                    lineHeight: "1.6",
                  }}
                >
                  "{testimonial.content}"
                </p>

                {/* Auteur */}
                <div className="testimonial-author d-flex align-items-center mt-auto">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="author-avatar me-3"
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=${colors.oskar.green.replace("#", "")}&color=fff`;
                    }}
                  />
                  <div>
                    <p
                      className="author-name mb-0"
                      style={{
                        color: colors.oskar.black,
                        fontWeight: "700",
                      }}
                    >
                      {testimonial.name}
                    </p>
                    <p
                      className="author-role mb-0"
                      style={{
                        color: colors.oskar.grey,
                        fontSize: "0.875rem",
                      }}
                    >
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .testimonials-section {
          padding: 3rem 0;
        }

        .section-title {
          font-size: 2rem;
          font-weight: 700;
        }

        .section-subtitle {
          font-size: 1.125rem;
        }

        .testimonial-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.12);
        }

        @media (min-width: 768px) {
          .testimonials-section {
            padding: 4rem 0;
          }

          .section-title {
            font-size: 2.5rem;
          }

          .testimonial-card {
            padding: 2.5rem;
          }
        }

        @media (min-width: 992px) {
          .testimonials-section {
            padding: 5rem 0;
          }
        }
      `}</style>
    </section>
  );
};

export default Testimonials;
