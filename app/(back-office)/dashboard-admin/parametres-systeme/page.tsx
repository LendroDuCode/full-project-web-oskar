// app/(back-office)/dashboard-admin/agents/page.tsx
"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTools,
  faCogs,
  faCalendar,
  faClock,
  faUsers,
  faCode,
  faHammer,
  faWrench,
  faRocket,
  faLightbulb,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export default function ParametrePage() {
  const features = [
    {
      icon: faUsers,
      title: "Gestion des Agents",
      description: "Créez, modifiez et gérez les agents de la plateforme",
      color: "success",
    },
    {
      icon: faCogs,
      title: "Paramètres Système",
      description: "Configuration avancée des paramètres de l'application",
      color: "warning",
    },
    {
      icon: faCalendar,
      title: "Planification",
      description: "Planifiez les tâches et les événements à venir",
      color: "info",
    },
    {
      icon: faClock,
      title: "Historique",
      description: "Consultez l'historique des actions et modifications",
      color: "primary",
    },
  ];

  return (
    <>
      <div className="p-3 p-md-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {/* Carte principale */}
            <div className="card border-0 shadow-lg overflow-hidden">
              {/* En-tête avec gradient VERT */}
              <div className="card-header bg-gradient-success text-white border-0 py-4">
                <div className="d-flex align-items-center">
                  <div className="bg-white bg-opacity-20 rounded-circle p-3 me-3">
                    <FontAwesomeIcon icon={faTools} className="fs-2" />
                  </div>
                  <div>
                    <h1 className="h3 mb-1">Gestion des Agents</h1>
                    <p className="mb-0 opacity-75">
                      Module en cours de développement
                    </p>
                  </div>
                </div>
              </div>

              {/* Contenu */}
              <div className="card-body p-4 p-md-5">
                {/* Illustration/Icone centrale */}
                <div className="text-center mb-5">
                  <div className="position-relative d-inline-block">
                    <div className="bg-success bg-opacity-10 rounded-circle p-5 mb-4">
                      <FontAwesomeIcon
                        icon={faRocket}
                        className="text-success"
                        style={{ fontSize: "4rem" }}
                      />
                    </div>
                    <div className="position-absolute top-0 start-100 translate-middle">
                      <div className="bg-warning text-white rounded-circle p-2">
                        <FontAwesomeIcon icon={faHammer} />
                      </div>
                    </div>
                  </div>

                  <h2 className="h1 fw-bold mb-3">
                    <span className="text-success">En cours</span> de
                    construction
                  </h2>
                  <p className="lead text-muted mb-4">
                    Notre équipe travaille actuellement sur ce module
                    passionnant. Nous déployons tous nos efforts pour vous
                    offrir une expérience exceptionnelle.
                  </p>
                </div>

                {/* Barre de progression */}
                <div className="mb-5">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="fw-semibold">
                      Progression du développement
                    </span>
                    <span className="text-success fw-bold">65%</span>
                  </div>
                  <div className="progress" style={{ height: "10px" }}>
                    <div
                      className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                      role="progressbar"
                      style={{ width: "65%" }}
                      aria-valuenow={65}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    ></div>
                  </div>
                </div>

                {/* Fonctionnalités à venir */}
                <div className="mb-5">
                  <h3 className="h4 fw-bold mb-4">
                    <FontAwesomeIcon
                      icon={faLightbulb}
                      className="me-2 text-warning"
                    />
                    Fonctionnalités à venir
                  </h3>
                  <div className="row g-4">
                    {features.map((feature, index) => (
                      <div key={index} className="col-md-6">
                        <div className="card border-0 shadow-sm h-100 hover-lift">
                          <div className="card-body p-4">
                            <div className="d-flex align-items-start">
                              <div
                                className={`bg-${feature.color} bg-opacity-10 text-${feature.color} rounded-circle p-3 me-3`}
                              >
                                <FontAwesomeIcon
                                  icon={feature.icon}
                                  className="fs-4"
                                />
                              </div>
                              <div>
                                <h5 className="fw-bold mb-2">
                                  {feature.title}
                                </h5>
                                <p className="text-muted mb-0">
                                  {feature.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Informations techniques */}
                <div className="bg-light rounded p-4 mb-4">
                  <div className="row align-items-center">
                    <div className="col-md-8">
                      <h4 className="fw-bold mb-2">
                        <FontAwesomeIcon
                          icon={faCode}
                          className="me-2 text-success"
                        />
                        Informations techniques
                      </h4>
                      <p className="text-muted mb-0">
                        Développement en cours avec Next.js 14, TypeScript et
                        Tailwind CSS. Intégration avec l'API REST en cours de
                        finalisation.
                      </p>
                    </div>
                    <div className="col-md-4 text-md-end mt-3 mt-md-0">
                      <div className="badge bg-success fs-6 px-3 py-2">
                        <FontAwesomeIcon icon={faWrench} className="me-2" />
                        Version 1.0.0
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="text-center pt-4">
                  <p className="text-muted mb-4">
                    Vous souhaitez être notifié lors de la sortie de cette
                    fonctionnalité ?
                  </p>
                  <div className="d-flex flex-column flex-md-row gap-3 justify-content-center">
                    <Link
                      href="/dashboard-admin"
                      className="btn btn-outline-success px-4 py-3 fw-semibold"
                    >
                      <FontAwesomeIcon icon={faClock} className="me-2" />
                      Revenir plus tard
                    </Link>
                    <button
                      className="btn btn-success px-4 py-3 fw-semibold"
                      onClick={() =>
                        alert(
                          "Merci pour votre intérêt ! Nous vous notifierons lorsque le module sera disponible.",
                        )
                      }
                    >
                      <FontAwesomeIcon icon={faRocket} className="me-2" />
                      Me notifier à la sortie
                    </button>
                  </div>
                </div>
              </div>

              {/* Pied de page */}
              <div className="card-footer bg-light border-0 py-3">
                <div className="text-center text-muted">
                  <small>
                    <FontAwesomeIcon
                      icon={faCalendar}
                      className="me-1 text-success"
                    />
                    Date de sortie estimée :{" "}
                    <strong className="text-success">Mars 2024</strong>
                  </small>
                </div>
              </div>
            </div>

            {/* Message secondaire */}
            <div className="text-center mt-4">
              <div className="alert alert-success border-0 shadow-sm">
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <FontAwesomeIcon icon={faLightbulb} className="fs-4" />
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <p className="mb-0">
                      En attendant, vous pouvez gérer vos agents depuis la page
                      principale des utilisateurs ou contacter notre support
                      pour plus d'informations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bg-gradient-success {
          background: linear-gradient(
            135deg,
            #198754 0%,
            #20c997 100%
          ) !important;
        }

        .hover-lift {
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.15) !important;
        }

        .progress-bar-animated {
          background-size: 1rem 1rem;
        }

        @keyframes progress-bar-stripes {
          0% {
            background-position: 1rem 0;
          }
          100% {
            background-position: 0 0;
          }
        }

        .progress-bar-striped {
          background-image: linear-gradient(
            45deg,
            rgba(255, 255, 255, 0.15) 25%,
            transparent 25%,
            transparent 50%,
            rgba(255, 255, 255, 0.15) 50%,
            rgba(255, 255, 255, 0.15) 75%,
            transparent 75%,
            transparent
          );
          background-size: 1rem 1rem;
          animation: progress-bar-stripes 1s linear infinite;
        }
      `}</style>
    </>
  );
}
