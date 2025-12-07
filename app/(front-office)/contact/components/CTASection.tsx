"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRocket,
  faEye,
  faArrowRight,
  faHandshake,
  faUsers,
  faBullhorn,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import colors from "../../../shared/constants/colors";

interface CTASectionProps {
  title?: string;
  subtitle?: string;
  primaryButton?: {
    text: string;
    href: string;
    icon?: any;
  };
  secondaryButton?: {
    text: string;
    href: string;
    icon?: any;
  };
  showStats?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
}

export default function CTASection({
  title = "Prêt à commencer ?",
  subtitle = "Rejoignez des milliers d'utilisateurs qui achètent, vendent et échangent sur OSKAR",
  primaryButton = {
    text: "Publier votre première annonce",
    href: "/publication-annonce",
    icon: faBullhorn,
  },
  secondaryButton = {
    text: "Parcourir les annonces",
    href: "/annonces",
    icon: faEye,
  },
  showStats = true,
  gradientFrom = colors.oskar.green,
  gradientTo = colors.oskar.greenHover,
}: CTASectionProps) {
  // Statistiques optionnelles
  const stats = [
    { value: "10K+", label: "Utilisateurs actifs", icon: faUsers },
    { value: "5K+", label: "Annonces publiées", icon: faBullhorn },
    { value: "98%", label: "Satisfaction", icon: faHandshake },
  ];

  return (
    <section id="cta-section" className="py-5 py-lg-6 bg-white">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div
              className="rounded-3 shadow-lg p-4 p-md-5 text-white position-relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
              }}
            >
              {/* Effets décoratifs de fond */}
              <div className="position-absolute top-0 end-0 w-100 h-100 opacity-10">
                <div
                  className="position-absolute"
                  style={{ top: "-50px", right: "-50px" }}
                >
                  <FontAwesomeIcon icon={faRocket} className="display-1" />
                </div>
                <div
                  className="position-absolute"
                  style={{ bottom: "-50px", left: "-50px" }}
                >
                  <FontAwesomeIcon icon={faHandshake} className="display-1" />
                </div>
              </div>

              <div className="position-relative z-1">
                {/* En-tête */}
                <div className="text-center mb-4 mb-md-5">
                  <div className="d-inline-flex align-items-center bg-white bg-opacity-20 rounded-pill px-4 py-2 mb-3">
                    <FontAwesomeIcon icon={faRocket} className="me-2" />
                    <span className="fw-medium">C'est parti !</span>
                  </div>

                  <h2 className="display-4 fw-bold mb-3">{title}</h2>
                  <p className="lead opacity-90 mb-0">{subtitle}</p>
                </div>

                {/* Boutons d'action */}
                <div className="d-flex flex-column flex-md-row justify-content-center gap-3 mb-4 mb-md-5">
                  <Link
                    href={primaryButton.href}
                    className="btn btn-light text-dark fw-bold px-4 py-3 rounded-3 d-flex align-items-center justify-content-center gap-2"
                    style={{
                      transition: "all 0.3s ease",
                      fontSize: "1.1rem",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f8f9fa";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "";
                      e.currentTarget.style.transform = "";
                    }}
                  >
                    {primaryButton.icon && (
                      <FontAwesomeIcon icon={primaryButton.icon} />
                    )}
                    {primaryButton.text}
                    <FontAwesomeIcon icon={faArrowRight} className="ms-1" />
                  </Link>

                  <Link
                    href={secondaryButton.href}
                    className="btn btn-outline-light border-2 fw-bold px-4 py-3 rounded-3 d-flex align-items-center justify-content-center gap-2"
                    style={{
                      transition: "all 0.3s ease",
                      fontSize: "1.1rem",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(255, 255, 255, 0.1)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "";
                      e.currentTarget.style.transform = "";
                    }}
                  >
                    {secondaryButton.icon && (
                      <FontAwesomeIcon icon={secondaryButton.icon} />
                    )}
                    {secondaryButton.text}
                  </Link>
                </div>

                {/* Statistiques */}
                {showStats && (
                  <div className="row justify-content-center">
                    <div className="col-lg-8">
                      <div className="card border-0 bg-white bg-opacity-20 rounded-3">
                        <div className="card-body p-3">
                          <div className="row g-3">
                            {stats.map((stat, index) => (
                              <div key={index} className="col-md-4">
                                <div className="text-center">
                                  <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                                    <FontAwesomeIcon
                                      icon={stat.icon}
                                      className="opacity-75"
                                    />
                                    <div className="display-6 fw-bold">
                                      {stat.value}
                                    </div>
                                  </div>
                                  <div className="small opacity-90">
                                    {stat.label}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Informations supplémentaires */}
                <div className="text-center mt-4">
                  <p className="small opacity-75 mb-0">
                    <i className="fa-solid fa-check-circle me-1"></i>
                    Aucun frais d'inscription • Assistance 24/7 • Garantie de
                    sécurité
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
