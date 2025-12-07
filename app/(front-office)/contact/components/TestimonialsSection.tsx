"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faQuoteLeft,
  faQuoteRight,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import colors from "../../../shared/constants/colors";

interface Testimonial {
  id: number;
  name: string;
  location: string;
  text: string;
  rating: number;
  avatar: string;
  date?: string;
  category?: string;
}

interface TestimonialsSectionProps {
  title?: string;
  subtitle?: string;
  testimonials?: Testimonial[];
  showNavigation?: boolean;
  autoPlay?: boolean;
  interval?: number;
  showAllStars?: boolean;
}

export default function TestimonialsSection({
  title = "Ce que disent nos utilisateurs",
  subtitle = "Véritables retours de notre communauté",
  testimonials,
  showNavigation = true,
  autoPlay = true,
  interval = 5000,
  showAllStars = true,
}: TestimonialsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Témoignages par défaut
  const defaultTestimonials: Testimonial[] = [
    {
      id: 1,
      name: "Ibrahim T.",
      location: "Yopougon",
      text: "L'équipe de support a été incroyablement utile lorsque j'ai eu des problèmes avec mon compte. Ils ont répondu en quelques heures et tout résolu de manière professionnelle !",
      rating: 5,
      avatar: "/avatars/avatar-1.jpg",
      date: "15 Mars 2024",
      category: "Support client",
    },
    {
      id: 2,
      name: "Mariam K.",
      location: "Cocody",
      text: "J'adore le fait qu'ils offrent plusieurs façons de les contacter. Le support WhatsApp est tellement pratique et ils sont toujours amicaux et serviables.",
      rating: 5,
      avatar: "/avatars/avatar-2.jpg",
      date: "22 Février 2024",
      category: "Multicanal",
    },
    {
      id: 3,
      name: "Yao D.",
      location: "Marcory",
      text: "Temps de réponse rapide et très professionnel. Ils m'ont aidé à résoudre un litige avec un acheteur en douceur. Excellent service client !",
      rating: 5,
      avatar: "/avatars/avatar-3.jpg",
      date: "10 Mars 2024",
      category: "Résolution",
    },
    {
      id: 4,
      name: "Fatou S.",
      location: "Abobo",
      text: "Le support téléphonique est exceptionnel. On m'a écouté patiemment et fourni une solution claire. Je recommande vivement OSKAR !",
      rating: 5,
      avatar: "/avatars/avatar-4.jpg",
      date: "28 Février 2024",
      category: "Téléphone",
    },
    {
      id: 5,
      name: "Koffi M.",
      location: "Treichville",
      text: "Le chat en direct m'a permis de résoudre mon problème en quelques minutes sans quitter le site. Très impressionné par l'efficacité !",
      rating: 4,
      avatar: "/avatars/avatar-5.jpg",
      date: "5 Mars 2024",
      category: "Chat",
    },
    {
      id: 6,
      name: "Amina C.",
      location: "Plateau",
      text: "Support multilingue impeccable. On m'a répondu dans ma langue préférée et avec beaucoup de patience. Merci OSKAR !",
      rating: 5,
      avatar: "/avatars/avatar-6.jpg",
      date: "18 Mars 2024",
      category: "Multilingue",
    },
  ];

  const displayTestimonials = testimonials || defaultTestimonials;

  // Navigation
  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % displayTestimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? displayTestimonials.length - 1 : prev - 1,
    );
  };

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
  };

  // Générer les étoiles
  const renderStars = (rating: number) => {
    return Array.from({ length: showAllStars ? 5 : rating }, (_, i) => (
      <FontAwesomeIcon
        key={i}
        icon={faStar}
        className={i < rating ? "text-warning" : "text-light"}
      />
    ));
  };

  // Témoignages actuels pour l'affichage (3 à la fois sur desktop)
  const getVisibleTestimonials = () => {
    if (window.innerWidth >= 768) {
      // Sur desktop : montrer 3 témoignages
      const start = currentIndex;
      const end = start + 3;
      if (end <= displayTestimonials.length) {
        return displayTestimonials.slice(start, end);
      } else {
        return [
          ...displayTestimonials.slice(start),
          ...displayTestimonials.slice(0, end - displayTestimonials.length),
        ];
      }
    } else {
      // Sur mobile : montrer seulement le témoignage courant
      return [displayTestimonials[currentIndex]];
    }
  };

  // Formatage de la date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <section id="testimonials-section" className="py-5 py-lg-6 bg-light">
      <div className="container">
        {/* En-tête */}
        <div className="text-center mb-5">
          <div className="d-inline-flex align-items-center bg-warning bg-opacity-10 rounded-pill px-4 py-2 mb-3">
            <FontAwesomeIcon icon={faStar} className="text-warning me-2" />
            <span className="text-warning fw-medium">Témoignages</span>
          </div>

          <h2 className="display-5 fw-bold text-dark mb-3">{title}</h2>
          <p className="lead text-muted">{subtitle}</p>
        </div>

        {/* Contrôles de navigation */}
        {showNavigation && displayTestimonials.length > 3 && (
          <div className="d-flex justify-content-between align-items-center mb-4">
            <button
              onClick={prevTestimonial}
              className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "48px", height: "48px" }}
              aria-label="Témoignage précédent"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>

            <div className="text-center">
              <span className="badge bg-success text-white px-3 py-2">
                {currentIndex + 1} / {displayTestimonials.length}
              </span>
            </div>

            <button
              onClick={nextTestimonial}
              className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "48px", height: "48px" }}
              aria-label="Témoignage suivant"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        )}

        {/* Témoignages */}
        <div className="row g-4">
          {getVisibleTestimonials().map((testimonial) => (
            <div key={testimonial.id} className="col-md-6 col-lg-4">
              <div className="card border-0 shadow-lg h-100">
                <div className="card-body p-4 p-lg-5">
                  {/* Guillemets décoratifs */}
                  <div className="text-center mb-3">
                    <FontAwesomeIcon
                      icon={faQuoteLeft}
                      className="text-success opacity-25"
                      style={{ fontSize: "2rem" }}
                    />
                  </div>

                  {/* Étoiles */}
                  <div className="d-flex justify-content-center mb-4">
                    <div className="d-flex gap-1">
                      {renderStars(testimonial.rating)}
                    </div>
                  </div>

                  {/* Texte du témoignage */}
                  <p
                    className="text-center text-muted mb-4 fst-italic"
                    style={{ lineHeight: "1.6" }}
                  >
                    {testimonial.text}
                  </p>

                  {/* Informations sur l'auteur */}
                  <div className="d-flex align-items-center gap-3 mt-4 pt-4 border-top">
                    <div className="position-relative">
                      <div
                        className="rounded-circle overflow-hidden"
                        style={{ width: "56px", height: "56px" }}
                      >
                        {/* Image de l'avatar */}
                        <div
                          className="w-100 h-100 d-flex align-items-center justify-content-center"
                          style={{
                            backgroundColor: colors.oskar.green,
                            color: "white",
                            fontSize: "1.5rem",
                            fontWeight: "bold",
                          }}
                        >
                          {testimonial.name.charAt(0)}
                        </div>
                      </div>
                    </div>

                    <div className="flex-grow-1">
                      <h5 className="fw-bold text-dark mb-1">
                        {testimonial.name}
                      </h5>
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-muted small">
                          <i className="fa-solid fa-location-dot me-1"></i>
                          {testimonial.location}
                        </span>
                        {testimonial.category && (
                          <>
                            <span className="text-muted">•</span>
                            <span
                              className="badge rounded-pill small"
                              style={{
                                backgroundColor: `${colors.oskar.green}20`,
                                color: colors.oskar.green,
                              }}
                            >
                              {testimonial.category}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Date */}
                      {testimonial.date && (
                        <p className="small text-muted mb-0 mt-1">
                          <i className="fa-regular fa-calendar me-1"></i>
                          {formatDate(testimonial.date)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Indicateurs de pagination */}
        {showNavigation && displayTestimonials.length > 1 && (
          <div className="d-flex justify-content-center gap-2 mt-4">
            {displayTestimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToTestimonial(index)}
                className={`btn p-0 ${index === currentIndex ? "text-success" : "text-muted"}`}
                aria-label={`Aller au témoignage ${index + 1}`}
              >
                <i
                  className="fa-solid fa-circle"
                  style={{ fontSize: "0.5rem" }}
                ></i>
              </button>
            ))}
          </div>
        )}

        {/* Statistiques de satisfaction */}
        <div className="row justify-content-center mt-5 pt-5 border-top">
          <div className="col-lg-8">
            <div className="card border-0 bg-success text-white">
              <div className="card-body p-4">
                <div className="row text-center">
                  <div className="col-md-4 mb-3 mb-md-0">
                    <div className="display-4 fw-bold mb-1">4.9/5</div>
                    <p className="small opacity-75 mb-0">Note moyenne</p>
                  </div>
                  <div className="col-md-4 mb-3 mb-md-0">
                    <div className="display-4 fw-bold mb-1">98%</div>
                    <p className="small opacity-75 mb-0">Satisfaction</p>
                  </div>
                  <div className="col-md-4">
                    <div className="display-4 fw-bold mb-1">500+</div>
                    <p className="small opacity-75 mb-0">Témoignages</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-5">
          <div className="card border-0 bg-light">
            <div className="card-body p-4">
              <h4 className="h4 fw-bold text-dark mb-3">
                Partagez votre expérience
              </h4>
              <p className="text-muted mb-3">
                Votre avis nous aide à améliorer continuellement notre service
              </p>
              <div className="d-flex flex-wrap justify-content-center gap-3">
                <button className="btn btn-success px-4">
                  <i className="fa-solid fa-star me-2"></i>
                  Laisser un avis
                </button>
                <button className="btn btn-outline-success px-4">
                  <i className="fa-solid fa-comment me-2"></i>
                  Partager un témoignage
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .card {
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
        }

        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1) !important;
        }

        @media (max-width: 768px) {
          .lead {
            font-size: 1.1rem;
          }

          .card-body {
            padding: 1.5rem !important;
          }
        }

        .fst-italic {
          font-style: italic;
        }
      `}</style>
    </section>
  );
}
