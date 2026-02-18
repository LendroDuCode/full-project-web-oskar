"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faEnvelope,
  faComments,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import colors from "@/app/shared/constants/colors";

interface ContactMethod {
  id: string;
  title: string;
  description: string;
  contactInfo: string;
  icon: any;
  color: string;
  hoverColor: string;
  details: string[];
  link?: string;
  action?: "tel" | "mailto" | "link" | "button";
}

interface ContactMethodsProps {
  title?: string;
  subtitle?: string;
  methods?: ContactMethod[];
  className?: string;
}

export default function ContactMethods({
  title = "Multiples façons de nous contacter",
  subtitle = "Choisissez la méthode de contact qui vous convient le mieux",
  methods,
  className = "",
}: ContactMethodsProps) {
  // Méthodes de contact par défaut
  const defaultMethods: ContactMethod[] = [
    {
      id: "contact-phone",
      title: "Support téléphonique",
      description: "Parlez directement avec notre équipe",
      contactInfo: "+225 07 07 12 34 56",
      icon: faPhone,
      color: colors.oskar.green, // Vert OSKAR
      hoverColor: colors.oskar.greenHover,
      details: ["Lun-Ven: 8h - 18h", "Sam: 9h - 15h"],
      link: "tel:+2250707123456",
      action: "tel",
    },
    {
      id: "contact-whatsapp",
      title: "Chat WhatsApp",
      description: "Support par messagerie rapide",
      contactInfo: "+225 07 07 12 34 56",
      icon: faWhatsapp,
      color: "#25D366", // Vert WhatsApp
      hoverColor: "#128C7E",
      details: ["Disponible 24h/24", "Réponses instantanées"],
      link: "https://wa.me/2250707123456",
      action: "link",
    },
    {
      id: "contact-email",
      title: "Support email",
      description: "Demandes détaillées bienvenues",
      contactInfo: "support@oskar.ci",
      icon: faEnvelope,
      color: colors.oskar.blue || "#1D4ED8", // Bleu OSKAR
      hoverColor: colors.oskar.blueHover || "#1E40AF",
      details: ["Réponse sous 24h", "Toutes langues supportées"],
      link: "mailto:support@oskar.ci",
      action: "mailto",
    },
    {
      id: "contact-live-chat",
      title: "Chat en direct",
      description: "Support en ligne instantané",
      contactInfo: "Ouvrir le chat",
      icon: faComments,
      color: colors.oskar.orange || "#F97316", // Orange OSKAR
      hoverColor: colors.oskar.orangeHover || "#EA580C",
      details: ["Lun-Sam: 8h - 20h", "Attente moyenne: 2 min"],
      action: "button",
    },
  ];

  const displayMethods = methods || defaultMethods;

  const handleMethodClick = (method: ContactMethod) => {
    if (method.action === "button") {
      // Ouvrir le chat en direct
      console.log("Ouvrir le chat en direct");
      // Implémentez votre logique de chat ici
      alert("Ouverture du chat en direct...");
    }
    // Pour les autres actions (tel, mailto, link), le lien gère l'action
  };

  const renderContactInfo = (method: ContactMethod) => {
    switch (method.action) {
      case "tel":
      case "mailto":
      case "link":
        return (
          <a
            href={method.link}
            className="text-decoration-none fw-bold fs-5"
            style={{ color: method.color }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = method.hoverColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = method.color;
            }}
          >
            {method.contactInfo}
          </a>
        );
      case "button":
        return (
          <button
            onClick={() => handleMethodClick(method)}
            className="btn btn-link text-decoration-none fw-bold fs-5 p-0 border-0"
            style={{ color: method.color }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = method.hoverColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = method.color;
            }}
          >
            {method.contactInfo}
          </button>
        );
      default:
        return (
          <span className="fw-bold fs-5" style={{ color: method.color }}>
            {method.contactInfo}
          </span>
        );
    }
  };

  return (
    <section
      id="contact-methods"
      className={`py-5 py-lg-6 bg-white ${className}`}
    >
      <div className="container">
        {/* Titre de la section */}
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold text-dark mb-3">{title}</h2>
          <p className="lead text-muted">{subtitle}</p>
        </div>

        {/* Grille des méthodes de contact */}
        <div className="row g-4">
          {displayMethods.map((method) => (
            <div key={method.id} className="col-md-6 col-lg-3">
              <div
                className={`bg-light rounded-3 p-4 h-100 text-center cursor-pointer border-2 border-transparent transition-all ${
                  method.action === "button" ? "contact-card" : ""
                }`}
                style={{
                  cursor: method.action === "button" ? "pointer" : "default",
                  transition: "all 0.3s ease",
                }}
                onClick={() =>
                  method.action === "button" && handleMethodClick(method)
                }
                onMouseEnter={(e) => {
                  if (method.action === "button") {
                    e.currentTarget.style.boxShadow =
                      "0 10px 30px rgba(0, 0, 0, 0.1)";
                    e.currentTarget.style.borderColor = method.hoverColor;
                    e.currentTarget.style.transform = "translateY(-5px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (method.action === "button") {
                    e.currentTarget.style.boxShadow = "";
                    e.currentTarget.style.borderColor = "transparent";
                    e.currentTarget.style.transform = "";
                  }
                }}
              >
                {/* Icône */}
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4"
                  style={{
                    width: "80px",
                    height: "80px",
                    backgroundColor: method.color,
                  }}
                >
                  <FontAwesomeIcon
                    icon={method.icon}
                    className="text-white fs-3"
                  />
                </div>

                {/* Titre */}
                <h3 className="h4 fw-bold text-dark mb-3">{method.title}</h3>

                {/* Description */}
                <p className="text-muted mb-3">{method.description}</p>

                {/* Informations de contact */}
                <div className="mb-3">{renderContactInfo(method)}</div>

                {/* Détails */}
                <div className="mt-4 pt-3 border-top border-secondary border-opacity-10">
                  {method.details.map((detail, index) => (
                    <p key={index} className="text-muted small mb-1">
                      {detail}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .contact-card:hover {
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
          transform: translateY(-5px);
          transition: all 0.3s ease;
        }

        .transition-all {
          transition: all 0.3s ease;
        }

        @media (max-width: 768px) {
          .contact-card {
            margin-bottom: 1rem;
          }
        }
      `}</style>
    </section>
  );
}
