// app/(back-office)/dashboard-admin/rapports/page.tsx
"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faChartBar,
  faChartPie,
  faChartColumn,
  faFileLines,
  faFileExport,
  faFileCirclePlus,
  faRocket,
  faHammer,
  faCalendar,
  faClock,
  faCode,
  faLightbulb,
  faWrench,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export default function Rapports() {
  const reportTypes = [
    {
      icon: faChartLine,
      title: "Rapports d'Activité",
      description: "Analyse des activités utilisateurs et performances",
      color: "success",
    },
    {
      icon: faChartBar,
      title: "Rapports Financiers",
      description: "Revenus, dépenses et analyses financières",
      color: "primary",
    },
    {
      icon: faChartPie,
      title: "Rapports de Vente",
      description: "Statistiques de vente et tendances du marché",
      color: "warning",
    },
    {
      icon: faChartColumn,
      title: "Rapports d'Audit",
      description: "Audit de sécurité et conformité",
      color: "info",
    },
    {
      icon: faFileExport,
      title: "Rapports d'Export",
      description: "Export des données en différents formats",
      color: "danger",
    },
    {
      icon: faFileExport,
      title: "Rapports Personnalisés",
      description: "Créez vos propres rapports sur mesure",
      color: "purple",
    },
  ];

  return (
    <>
      <div className="p-3 p-md-4">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            {/* Carte principale */}
            <div className="card border-0 shadow-lg overflow-hidden">
              {/* En-tête avec gradient VERT */}
              <div className="card-header bg-gradient-success text-white border-0 py-4">
                <div className="d-flex align-items-center">
                  <div className="bg-white bg-opacity-20 rounded-circle p-3 me-3">
                    <FontAwesomeIcon icon={faFileLines} className="fs-2" />
                  </div>
                  <div>
                    <h1 className="h3 mb-1">Gestion des Rapports</h1>
                    <p className="mb-0 opacity-75">
                      Module d'analyse et de reporting en cours de développement
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
                    <div className="position-absolute top-100 start-0 translate-middle">
                      <div className="bg-info text-white rounded-circle p-2">
                        <FontAwesomeIcon icon={faChartLine} />
                      </div>
                    </div>
                  </div>

                  <h2 className="h1 fw-bold mb-3">
                    <span className="text-success">Analytics</span> en
                    préparation
                  </h2>
                  <p className="lead text-muted mb-4">
                    Nous développons un puissant module de reporting qui vous
                    offrira des insights détaillés sur votre plateforme.
                    Préparez-vous à prendre des décisions éclairées !
                  </p>
                </div>

                {/* Barre de progression */}
                <div className="mb-5">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="fw-semibold">
                      Progression du développement
                    </span>
                    <span className="text-success fw-bold">45%</span>
                  </div>
                  <div className="progress" style={{ height: "12px" }}>
                    <div
                      className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                      role="progressbar"
                      style={{ width: "45%" }}
                      aria-valuenow={45}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    ></div>
                  </div>
                  <div className="text-end mt-2">
                    <small className="text-muted">
                      Phase de développement des visualisations
                    </small>
                  </div>
                </div>

                {/* Types de rapports à venir */}
                <div className="mb-5">
                  <h3 className="h4 fw-bold mb-4">
                    <FontAwesomeIcon
                      icon={faFileCirclePlus}
                      className="me-2 text-success"
                    />
                    Types de rapports disponibles
                  </h3>
                  <div className="row g-4">
                    {reportTypes.map((report, index) => (
                      <div key={index} className="col-md-6 col-lg-4">
                        <div className="card border-0 shadow-sm h-100 hover-lift">
                          <div className="card-body p-4">
                            <div className="text-center mb-3">
                              <div
                                className={`bg-${report.color} bg-opacity-10 text-${report.color} rounded-circle p-3 d-inline-flex align-items-center justify-content-center`}
                                style={{ width: "70px", height: "70px" }}
                              >
                                <FontAwesomeIcon
                                  icon={report.icon}
                                  className="fs-3"
                                />
                              </div>
                            </div>
                            <h5 className="fw-bold text-center mb-2">
                              {report.title}
                            </h5>
                            <p className="text-muted text-center mb-0">
                              {report.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Caractéristiques */}
                <div className="row g-4 mb-5">
                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-4">
                        <h4 className="fw-bold mb-3">
                          <FontAwesomeIcon
                            icon={faChartLine}
                            className="me-2 text-success"
                          />
                          Visualisations avancées
                        </h4>
                        <ul className="list-unstyled mb-0">
                          <li className="mb-2">
                            <FontAwesomeIcon
                              icon={faLightbulb}
                              className="text-warning me-2"
                            />
                            Graphiques interactifs en temps réel
                          </li>
                          <li className="mb-2">
                            <FontAwesomeIcon
                              icon={faLightbulb}
                              className="text-warning me-2"
                            />
                            Tableaux de bord personnalisables
                          </li>
                          <li className="mb-2">
                            <FontAwesomeIcon
                              icon={faLightbulb}
                              className="text-warning me-2"
                            />
                            Export en PDF, Excel et CSV
                          </li>
                          <li>
                            <FontAwesomeIcon
                              icon={faLightbulb}
                              className="text-warning me-2"
                            />
                            Alertes et notifications automatisées
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-4">
                        <h4 className="fw-bold mb-3">
                          <FontAwesomeIcon
                            icon={faCode}
                            className="me-2 text-info"
                          />
                          Technologies utilisées
                        </h4>
                        <div className="d-flex flex-wrap gap-2 mb-3">
                          <span className="badge bg-success">Chart.js</span>
                          <span className="badge bg-primary">D3.js</span>
                          <span className="badge bg-warning">Recharts</span>
                          <span className="badge bg-danger">Excel Export</span>
                          <span className="badge bg-info">PDF Generation</span>
                        </div>
                        <p className="text-muted mb-0">
                          Nous utilisons les dernières technologies de
                          visualisation de données pour vous offrir des rapports
                          précis et esthétiques.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline de développement */}
                <div className="mb-5">
                  <h4 className="fw-bold mb-4">
                    <FontAwesomeIcon
                      icon={faCalendar}
                      className="me-2 text-success"
                    />
                    Calendrier de développement
                  </h4>
                  <div className="timeline">
                    <div className="timeline-item">
                      <div className="timeline-marker bg-success"></div>
                      <div className="timeline-content">
                        <h6 className="fw-bold">Phase 1: Analyse</h6>
                        <small className="text-muted">
                          Décembre 2023 - Terminé
                        </small>
                      </div>
                    </div>
                    <div className="timeline-item">
                      <div className="timeline-marker bg-warning"></div>
                      <div className="timeline-content">
                        <h6 className="fw-bold">Phase 2: Développement</h6>
                        <small className="text-muted">
                          Janvier 2024 - En cours
                        </small>
                      </div>
                    </div>
                    <div className="timeline-item">
                      <div className="timeline-marker bg-secondary"></div>
                      <div className="timeline-content">
                        <h6 className="fw-bold">Phase 3: Tests</h6>
                        <small className="text-muted">
                          Février 2024 - À venir
                        </small>
                      </div>
                    </div>
                    <div className="timeline-item">
                      <div className="timeline-marker bg-success"></div>
                      <div className="timeline-content">
                        <h6 className="fw-bold">Phase 4: Déploiement</h6>
                        <small className="text-muted">
                          Mars 2024 - À venir
                        </small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="text-center pt-4">
                  <div className="bg-light rounded p-4 mb-4">
                    <h5 className="fw-bold mb-3">
                      <FontAwesomeIcon
                        icon={faLightbulb}
                        className="me-2 text-warning"
                      />
                      Une fonctionnalité vous intéresse particulièrement ?
                    </h5>
                    <p className="text-muted mb-0">
                      Partagez vos besoins spécifiques en reporting pour que
                      nous puissions prioriser les fonctionnalités qui vous
                      seront les plus utiles.
                    </p>
                  </div>
                  <div className="d-flex flex-column flex-md-row gap-3 justify-content-center">
                    <Link
                      href="/dashboard-admin"
                      className="btn btn-outline-success px-4 py-3 fw-semibold"
                    >
                      <FontAwesomeIcon icon={faClock} className="me-2" />
                      Revenir au tableau de bord
                    </Link>
                    <button
                      className="btn btn-success px-4 py-3 fw-semibold"
                      onClick={() =>
                        alert(
                          "Merci pour votre intérêt ! Votre feedback a été enregistré. Nous vous contacterons pour discuter de vos besoins spécifiques en reporting.",
                        )
                      }
                    >
                      <FontAwesomeIcon icon={faFileLines} className="me-2" />
                      Exprimer mes besoins
                    </button>
                  </div>
                </div>
              </div>

              {/* Pied de page */}
              <div className="card-footer bg-light border-0 py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="text-muted">
                    <small>
                      <FontAwesomeIcon icon={faWrench} className="me-1" />
                      Version préliminaire
                    </small>
                  </div>
                  <div className="text-success">
                    <small>
                      <FontAwesomeIcon icon={faCalendar} className="me-1" />
                      Sortie estimée : <strong>Avril 2024</strong>
                    </small>
                  </div>
                </div>
              </div>
            </div>

            {/* Message d'information */}
            <div className="text-center mt-4">
              <div className="alert alert-success border-0 shadow-sm">
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <FontAwesomeIcon icon={faChartBar} className="fs-4" />
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <p className="mb-0">
                      En attendant, des statistiques de base sont disponibles
                      dans le tableau de bord principal. Pour des rapports
                      détaillés, contactez notre équipe de support.
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

        .timeline {
          position: relative;
          padding-left: 30px;
        }

        .timeline::before {
          content: "";
          position: absolute;
          left: 10px;
          top: 0;
          bottom: 0;
          width: 2px;
          background-color: #e9ecef;
        }

        .timeline-item {
          position: relative;
          margin-bottom: 20px;
        }

        .timeline-marker {
          position: absolute;
          left: -30px;
          top: 0;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 4px solid white;
        }

        .timeline-content {
          padding-left: 20px;
        }

        .bg-purple {
          background-color: #6f42c1 !important;
        }

        .text-purple {
          color: #6f42c1 !important;
        }
      `}</style>
    </>
  );
}
