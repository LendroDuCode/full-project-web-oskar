"use client";

import { useState, useEffect } from "react";
import { Carousel } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const HeroCarousel = () => {
  const [index, setIndex] = useState(0);

  const handleSelect = (selectedIndex: number) => {
    setIndex(selectedIndex);
  };

  const slides = [
    {
      id: 1,
      image:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/6bd27727dc-863287eaa4902e96d1a5.png",
      alt: "Vibrant West African community sharing goods, people exchanging items with smiles, colorful African fabrics, warm golden hour lighting, sense of connection and generosity, cinematic photography",
      title: "Il suffit d'un clic pour que les bonnes choses circulent",
      isAd: false,
      theme: "dark",
    },
    {
      id: 2,
      image:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/7ca3aec08e-c8797c6f183efa9b4da5.png",
      alt: "Modern African woman using smartphone in bright Abidjan office, fiber optic internet concept, vibrant orange and blue tech aesthetic, professional photography",
      title: "La fibre la plus rapide de Côte d'Ivoire",
      description: "Passez à la vitesse supérieure dès maintenant.",
      isAd: true,
      adLabel: "PUBLICITÉ",
      buttonText: "Découvrir les offres",
      buttonColor: "btn-warning",
      theme: "dark",
    },
    {
      id: 3,
      image:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/82e4a7061e-eb1ff5c1daeba9c55577.png",
      alt: "Delicious Ivorian Attiéké with grilled fish, fresh vegetables on modern plate, vibrant colors, professional food photography, appetizing presentation",
      title: "Votre repas préféré, livré en 30 min",
      description: "-20% sur la première commande avec le code OSKAR20.",
      isAd: true,
      adLabel: "PUBLICITÉ",
      buttonText: "Commander maintenant",
      buttonColor: "btn-success",
      theme: "dark",
    },
  ];

  // Auto-rotation du carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <section className="px-4 py-4 bg-white">
      <div className="container">
        <div className="rounded-3xl overflow-hidden shadow-lg">
          <Carousel
            activeIndex={index}
            onSelect={handleSelect}
            indicators={true}
            controls={true}
            fade={true}
            interval={5000}
            pause="hover"
            className="rounded-3xl"
            nextIcon={
              <span className="carousel-control-next-icon bg-white/30 backdrop-blur-sm rounded-full p-3 hover:bg-white/50 transition-all" />
            }
            prevIcon={
              <span className="carousel-control-prev-icon bg-white/30 backdrop-blur-sm rounded-full p-3 hover:bg-white/50 transition-all" />
            }
          >
            {slides.map((slide) => (
              <Carousel.Item key={slide.id}>
                <div className="position-relative" style={{ height: "28rem" }}>
                  <img
                    className="d-block w-100 h-100 object-cover"
                    src={slide.image}
                    alt={slide.alt}
                  />

                  {/* Overlay gradient */}
                  <div
                    className={`position-absolute top-0 start-0 w-100 h-100 ${
                      slide.theme === "dark"
                        ? "bg-gradient-to-t from-black/90 via-black/50 to-transparent"
                        : "bg-gradient-to-t from-black/70 via-transparent to-transparent"
                    }`}
                  />

                  {/* Content */}
                  <Carousel.Caption
                    className={`d-flex flex-column ${
                      slide.isAd
                        ? "justify-content-end text-start"
                        : "justify-content-center text-center align-items-center"
                    } h-100 p-4 p-md-5`}
                  >
                    {slide.isAd && (
                      <div className="mb-3">
                        <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-semibold fs-6">
                          {slide.adLabel}
                        </span>
                      </div>
                    )}

                    <h3
                      className={`display-5 fw-bold mb-4 ${
                        slide.isAd ? "text-start" : "text-center"
                      }`}
                      style={{
                        textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                        maxWidth: slide.isAd ? "100%" : "24rem",
                      }}
                    >
                      {slide.title}
                    </h3>

                    {slide.description && (
                      <p
                        className={`fs-5 mb-4 opacity-90 ${
                          slide.isAd ? "text-start" : "text-center"
                        }`}
                        style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}
                      >
                        {slide.description}
                      </p>
                    )}

                    {slide.buttonText && (
                      <div
                        className={`${slide.isAd ? "text-start" : "text-center"}`}
                      >
                        <button
                          className={`btn ${slide.buttonColor} btn-lg px-5 py-3 fw-bold shadow-lg rounded-3 hover-scale`}
                          style={{
                            transition: "transform 0.3s ease",
                            fontSize: "1rem",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.05)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                        >
                          {slide.buttonText}
                        </button>
                      </div>
                    )}
                  </Carousel.Caption>
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        </div>
      </div>

      <style jsx global>{`
        .carousel-indicators {
          bottom: 2rem;
          margin-bottom: 0;
        }

        .carousel-indicators [data-bs-target] {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin: 0 6px;
          background-color: rgba(255, 255, 255, 0.5);
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .carousel-indicators .active {
          background-color: white;
          transform: scale(1.2);
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
        }

        .carousel-control-prev,
        .carousel-control-next {
          width: 4rem;
          opacity: 0.8;
          transition: opacity 0.3s ease;
        }

        .carousel-control-prev:hover,
        .carousel-control-next:hover {
          opacity: 1;
        }

        .carousel-control-prev-icon,
        .carousel-control-next-icon {
          background-size: 1.5rem;
          width: 3.5rem;
          height: 3.5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .carousel-caption {
          left: 0;
          right: 0;
          padding-left: 3rem;
          padding-right: 3rem;
        }

        @media (max-width: 768px) {
          .carousel-caption h3 {
            font-size: 1.75rem !important;
          }

          .carousel-caption p {
            font-size: 1rem !important;
          }

          .carousel-control-prev,
          .carousel-control-next {
            width: 3rem;
          }
        }

        .hover-scale:hover {
          transform: scale(1.05) !important;
        }
      `}</style>
    </section>
  );
};

export default HeroCarousel;
