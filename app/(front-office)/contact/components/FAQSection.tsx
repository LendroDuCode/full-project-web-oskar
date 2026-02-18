"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronUp,
  faQuestionCircle,
  faClock,
  faMessage,
  faBuilding,
  faLanguage,
  faShieldHalved,
  faEnvelope,
  faBook,
} from "@fortawesome/free-solid-svg-icons";
import colors from "@/app/shared/constants/colors";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category?: string;
  icon?: any;
}

interface FAQSectionProps {
  title?: string;
  subtitle?: string;
  faqs?: FAQItem[];
  showCategoryFilter?: boolean;
  showHelpCenterLink?: boolean;
}

export default function FAQSection({
  title = "Questions fréquemment posées",
  subtitle = "Réponses rapides aux questions courantes",
  faqs,
  showCategoryFilter = false,
  showHelpCenterLink = true,
}: FAQSectionProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0); // Premier FAQ ouvert par défaut
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // FAQ par défaut
  const defaultFaqs: FAQItem[] = [
    {
      id: 1,
      question: "Quand vais-je recevoir une réponse ?",
      answer:
        "Nous nous efforçons de répondre à toutes les demandes dans les 24 heures pendant les jours ouvrables. Pour les questions urgentes, nous recommandons d'utiliser notre chat en direct ou notre support téléphonique pour une assistance immédiate.",
      category: "support",
      icon: faClock,
    },
    {
      id: 2,
      question: "Quelles informations dois-je inclure dans mon message ?",
      answer:
        "Pour une réponse rapide et précise, veuillez inclure : votre nom complet, votre numéro de commande ou référence, une description claire du problème, et toute information contextuelle pertinente. Les captures d'écran ou photos peuvent également nous aider à mieux comprendre votre situation.",
      category: "support",
      icon: faMessage,
    },
    {
      id: 3,
      question: "Puis-je visiter votre bureau sans rendez-vous ?",
      answer:
        "Nous recommandons fortement de prendre rendez-vous avant toute visite pour garantir la disponibilité de notre équipe. Vous pouvez planifier un rendez-vous via notre formulaire de contact ou par téléphone. Les visites sans rendez-vous sont acceptées dans la mesure du possible, mais peuvent entraîner des temps d'attente.",
      category: "visite",
      icon: faBuilding,
    },
    {
      id: 4,
      question:
        "Proposez-vous un support dans d'autres langues que le français ?",
      answer:
        "Oui, notre équipe de support est multilingue. Nous offrons une assistance en français, anglais et plusieurs langues locales. Pour les demandes spécifiques, veuillez préciser votre langue préférée dans votre message et nous ferons de notre mieux pour vous répondre dans cette langue.",
      category: "support",
      icon: faLanguage,
    },
    {
      id: 5,
      question: "Comment signaler une annonce ou un utilisateur suspect ?",
      answer:
        "Vous pouvez signaler une annonce ou un utilisateur en utilisant le bouton 'Signaler' sur la page de l'annonce ou du profil concerné. Notre équipe de modération examinera le signalement dans les plus brefs délais. Pour les cas urgents, contactez-nous directement par email à safety@oskar.ci ou par téléphone.",
      category: "sécurité",
      icon: faShieldHalved,
    },
    {
      id: 6,
      question: "Que dois-je faire si je n'ai pas reçu de réponse ?",
      answer:
        "Si vous n'avez pas reçu de réponse dans les 48 heures, veuillez vérifier votre dossier spam/courrier indésirable. Vous pouvez également nous recontacter en mentionnant votre référence de ticket précédente. Pour une assistance immédiate, utilisez notre chat en direct disponible du lundi au samedi de 8h à 20h.",
      category: "support",
      icon: faEnvelope,
    },
  ];

  const displayFaqs = faqs || defaultFaqs;

  // Catégories uniques
  const categories = [
    { id: "all", label: "Toutes les questions" },
    { id: "support", label: "Support" },
    { id: "visite", label: "Visite" },
    { id: "sécurité", label: "Sécurité" },
  ];

  // Filtrer les FAQ par catégorie si activé
  const filteredFaqs =
    showCategoryFilter && activeCategory !== "all"
      ? displayFaqs.filter((faq) => faq.category === activeCategory)
      : displayFaqs;

  const toggleFaq = (id: number) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <section id="faq-section" className="py-5 py-lg-6 bg-light">
      <div className="container">
        <div className="text-center mb-5">
          <div className="d-inline-flex align-items-center bg-success bg-opacity-10 rounded-pill px-4 py-2 mb-3">
            <FontAwesomeIcon
              icon={faQuestionCircle}
              className="text-success me-2"
            />
            <span className="text-success fw-medium">FAQ</span>
          </div>

          <h2 className="display-5 fw-bold text-dark mb-3">{title}</h2>
          <p className="lead text-muted">{subtitle}</p>
        </div>

        {/* Filtres par catégorie (optionnel) */}
        {showCategoryFilter && (
          <div className="row justify-content-center mb-5">
            <div className="col-lg-8">
              <div className="d-flex flex-wrap justify-content-center gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`btn px-4 py-2 rounded-pill ${
                      activeCategory === category.id
                        ? "btn-success text-white"
                        : "btn-outline-success"
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Liste des FAQ */}
        <div className="row justify-content-center">
          <div className="col-lg-10 col-xl-9">
            <div className="accordion" id="faqAccordion">
              {filteredFaqs.map((faq) => (
                <div
                  key={faq.id}
                  className="accordion-item border-0 mb-3 shadow-sm"
                >
                  <h2 className="accordion-header">
                    <button
                      className={`accordion-button ${
                        openFaq === faq.id ? "" : "collapsed"
                      }`}
                      type="button"
                      onClick={() => toggleFaq(faq.id)}
                      style={{
                        backgroundColor:
                          openFaq === faq.id
                            ? `${colors.oskar.green}10`
                            : "white",
                        color: colors.oskar.black,
                        fontWeight: "600",
                        fontSize: "1.1rem",
                        padding: "1.5rem",
                      }}
                    >
                      <div className="d-flex align-items-center w-100">
                        {faq.icon && (
                          <FontAwesomeIcon
                            icon={faq.icon}
                            className="me-3"
                            style={{
                              color:
                                openFaq === faq.id
                                  ? colors.oskar.green
                                  : colors.oskar.grey,
                              width: "20px",
                            }}
                          />
                        )}
                        <span className="text-start flex-grow-1">
                          {faq.question}
                        </span>
                        <FontAwesomeIcon
                          icon={
                            openFaq === faq.id ? faChevronUp : faChevronDown
                          }
                          className="ms-3"
                          style={{
                            color:
                              openFaq === faq.id
                                ? colors.oskar.green
                                : colors.oskar.grey,
                          }}
                        />
                      </div>
                    </button>
                  </h2>

                  <div
                    className={`accordion-collapse collapse ${
                      openFaq === faq.id ? "show" : ""
                    }`}
                  >
                    <div
                      className="accordion-body p-4 pt-0"
                      style={{ color: colors.oskar.grey }}
                    >
                      <div className="ps-4 border-start border-success border-3">
                        <p className="mb-0">{faq.answer}</p>

                        {/* Informations supplémentaires selon la catégorie */}
                        {faq.category === "support" && (
                          <div className="mt-3">
                            <span className="badge bg-success bg-opacity-10 text-success">
                              <i className="fa-solid fa-clock me-1"></i>
                              Réponse sous 24h
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lien vers le centre d'aide */}
        {showHelpCenterLink && (
          <div className="text-center mt-5">
            <div className="card border-0 bg-success bg-opacity-10">
              <div className="card-body p-4">
                <h5 className="fw-bold text-dark mb-3">
                  <FontAwesomeIcon
                    icon={faBook}
                    className="me-2 text-success"
                  />
                  Vous avez d'autres questions ?
                </h5>
                <p className="text-muted mb-3">
                  Consultez notre centre d'aide complet pour plus d'informations
                  détaillées
                </p>
                <a
                  href="/centre-aide"
                  className="btn btn-success d-inline-flex align-items-center gap-2"
                >
                  <FontAwesomeIcon icon={faBook} />
                  Voir le centre d'aide complet
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className="ms-1 rotate-270"
                  />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Statistiques de support */}
        <div className="row justify-content-center mt-5 pt-4 border-top">
          <div className="col-lg-8">
            <div className="row text-center">
              <div className="col-md-4 mb-3 mb-md-0">
                <div className="card border-0 bg-light">
                  <div className="card-body p-3">
                    <div className="display-6 fw-bold text-success mb-1">
                      95%
                    </div>
                    <p className="small text-muted mb-0">Questions résolues</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4 mb-3 mb-md-0">
                <div className="card border-0 bg-light">
                  <div className="card-body p-3">
                    <div className="display-6 fw-bold text-success mb-1">
                      24h
                    </div>
                    <p className="small text-muted mb-0">
                      Temps de réponse moyen
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-0 bg-light">
                  <div className="card-body p-3">
                    <div className="display-6 fw-bold text-success mb-1">
                      1000+
                    </div>
                    <p className="small text-muted mb-0">Questions traitées</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .accordion-button:not(.collapsed) {
          box-shadow: none !important;
        }

        .accordion-button::after {
          display: none;
        }

        .rotate-270 {
          transform: rotate(-90deg);
          transition: transform 0.3s ease;
        }

        .accordion-button:focus {
          border-color: ${colors.oskar.green} !important;
          box-shadow: 0 0 0 0.25rem ${colors.oskar.green}20 !important;
        }

        @media (max-width: 768px) {
          .accordion-button {
            padding: 1rem !important;
            font-size: 1rem !important;
          }

          .accordion-body {
            padding: 1rem !important;
          }
        }
      `}</style>
    </section>
  );
}
