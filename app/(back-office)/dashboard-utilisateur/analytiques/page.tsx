// app/(back-office)/dashboard-admin/analytiques/page.tsx
"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faChartBar,
  faChartPie,
  faChartColumn,
  faChartArea,
  faChartSimple,
  faMagnifyingGlassChart,
  faArrowTrendUp,
  faRocket,
  faHammer,
  faCalendar,
  faClock,
  faCode,
  faLightbulb,
  faWrench,
  faBrain,
  faDatabase,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export default function Analytiques() {
  const analyticsFeatures = [
    {
      icon: faChartLine,
      title: "Analyse en Temps Réel",
      description: "Suivi des métriques en direct avec mise à jour automatique",
      color: "success",
    },
    {
      icon: faChartBar,
      title: "Tableaux de Bord Interactifs",
      description:
        "Personnalisez vos vues et filtrez les données dynamiquement",
      color: "primary",
    },
    {
      icon: faChartPie,
      title: "Analyse Segmentée",
      description: "Segmentations avancées par utilisateur, région, période",
      color: "warning",
    },
    {
      icon: faChartArea,
      title: "Tendances Prédictives",
      description: "Prédictions basées sur l'IA et analyse des tendances",
      color: "info",
    },
    {
      icon: faMagnifyingGlassChart,
      title: "Analyse Avancée",
      description: "Corrélations, cohortes et analyses multivariées",
      color: "danger",
    },
    {
      icon: faBrain,
      title: "Intelligence Artificielle",
      description: "Recommandations intelligentes et détection d'anomalies",
      color: "purple",
    },
  ];

  const metrics = [
    { label: "Utilisateurs Actifs", value: "15.2K", change: "+12.5%" },
    { label: "Taux de Conversion", value: "4.8%", change: "+2.1%" },
    { label: "Temps Moyen Session", value: "8m 42s", change: "+45s" },
    { label: "Revenu Mensuel", value: "€42.8K", change: "+18.3%" },
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
                    <FontAwesomeIcon
                      icon={faMagnifyingGlassChart}
                      className="fs-2"
                    />
                  </div>
                  <div>
                    <h1 className="h3 mb-1">Analytiques Avancées</h1>
                    <p className="mb-0 opacity-75">
                      Module d'analyse de données en cours de développement
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
                    <span className="text-success">Analytics</span>{" "}
                    Intelligentes
                  </h2>
                  <p className="lead text-muted mb-4">
                    Nous construisons une plateforme d'analyse de données
                    puissante qui transformera vos données brutes en insights
                    actionnables.
                  </p>
                </div>

                {/* Métriques de démonstration */}
                <div className="mb-5">
                  <h4 className="fw-bold mb-4 text-center">
                    <FontAwesomeIcon
                      icon={faArrowTrendUp}
                      className="me-2 text-success"
                    />
                    Métriques Clés (Exemple)
                  </h4>
                  <div className="row g-4">
                    {metrics.map((metric, index) => (
                      <div key={index} className="col-md-3">
                        <div className="card border-0 shadow-sm h-100">
                          <div className="card-body text-center p-4">
                            <div className="text-muted mb-2">
                              {metric.label}
                            </div>
                            <h3 className="fw-bold mb-2">{metric.value}</h3>
                            <div
                              className={`badge ${metric.change.startsWith("+") ? "bg-success" : "bg-danger"} bg-opacity-10 ${metric.change.startsWith("+") ? "text-success" : "text-danger"}`}
                            >
                              <FontAwesomeIcon
                                icon={
                                  metric.change.startsWith("+")
                                    ? faArrowTrendUp
                                    : faChartLine
                                }
                                className="me-1"
                              />
                              {metric.change}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="mb-5">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="fw-semibold">
                      Progression du développement
                    </span>
                    <span className="text-success fw-bold">55%</span>
                  </div>
                  <div className="progress" style={{ height: "12px" }}>
                    <div
                      className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                      role="progressbar"
                      style={{ width: "55%" }}
                      aria-valuenow={55}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    ></div>
                  </div>
                  <div className="text-end mt-2">
                    <small className="text-muted">
                      Phase d'intégration des algorithmes d'IA
                    </small>
                  </div>
                </div>

                {/* Fonctionnalités à venir */}
                <div className="mb-5">
                  <h3 className="h4 fw-bold mb-4">
                    <FontAwesomeIcon
                      icon={faLightbulb}
                      className="me-2 text-warning"
                    />
                    Fonctionnalités Analytiques
                  </h3>
                  <div className="row g-4">
                    {analyticsFeatures.map((feature, index) => (
                      <div key={index} className="col-md-6 col-lg-4">
                        <div className="card border-0 shadow-sm h-100 hover-lift">
                          <div className="card-body p-4">
                            <div className="text-center mb-3">
                              <div
                                className={`bg-${feature.color} bg-opacity-10 text-${feature.color} rounded-circle p-3 d-inline-flex align-items-center justify-content-center`}
                                style={{ width: "70px", height: "70px" }}
                              >
                                <FontAwesomeIcon
                                  icon={feature.icon}
                                  className="fs-3"
                                />
                              </div>
                            </div>
                            <h5 className="fw-bold text-center mb-2">
                              {feature.title}
                            </h5>
                            <p className="text-muted text-center mb-0">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Architecture technique */}
                <div className="row g-4 mb-5">
                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-4">
                        <h4 className="fw-bold mb-3">
                          <FontAwesomeIcon
                            icon={faDatabase}
                            className="me-2 text-success"
                          />
                          Architecture des Données
                        </h4>
                        <ul className="list-unstyled mb-0">
                          <li className="mb-2">
                            <FontAwesomeIcon
                              icon={faLightbulb}
                              className="text-warning me-2"
                            />
                            Data Warehouse en temps réel
                          </li>
                          <li className="mb-2">
                            <FontAwesomeIcon
                              icon={faLightbulb}
                              className="text-warning me-2"
                            />
                            Pipeline ETL optimisé
                          </li>
                          <li className="mb-2">
                            <FontAwesomeIcon
                              icon={faLightbulb}
                              className="text-warning me-2"
                            />
                            Cache distribué pour performances
                          </li>
                          <li>
                            <FontAwesomeIcon
                              icon={faLightbulb}
                              className="text-warning me-2"
                            />
                            Sauvegarde et réplication automatique
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
                          Stack Technologique
                        </h4>
                        <div className="d-flex flex-wrap gap-2 mb-3">
                          <span className="badge bg-success">Apache Spark</span>
                          <span className="badge bg-primary">Apache Kafka</span>
                          <span className="badge bg-warning">TensorFlow</span>
                          <span className="badge bg-danger">Redis</span>
                          <span className="badge bg-info">Elasticsearch</span>
                          <span className="badge bg-purple">D3.js</span>
                        </div>
                        <p className="text-muted mb-0">
                          Architecture moderne conçue pour traiter des milliards
                          d'événements avec latence minimale.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Roadmap */}
                <div className="mb-5">
                  <h4 className="fw-bold mb-4">
                    <FontAwesomeIcon
                      icon={faCalendar}
                      className="me-2 text-success"
                    />
                    Roadmap de Développement
                  </h4>
                  <div className="row g-4">
                    <div className="col-md-3">
                      <div className="card border-0 shadow-sm">
                        <div className="card-body text-center p-3">
                          <div
                            className="bg-success bg-opacity-10 text-success rounded-circle p-3 mb-3 mx-auto"
                            style={{ width: "60px", height: "60px" }}
                          >
                            <FontAwesomeIcon icon={faChartSimple} />
                          </div>
                          <h6 className="fw-bold">Q4 2023</h6>
                          <small className="text-muted">
                            Conception & Prototypage
                          </small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card border-0 shadow-sm">
                        <div className="card-body text-center p-3">
                          <div
                            className="bg-warning bg-opacity-10 text-warning rounded-circle p-3 mb-3 mx-auto"
                            style={{ width: "60px", height: "60px" }}
                          >
                            <FontAwesomeIcon icon={faHammer} />
                          </div>
                          <h6 className="fw-bold">Q1 2024</h6>
                          <small className="text-muted">
                            Développement Core
                          </small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card border-0 shadow-sm">
                        <div className="card-body text-center p-3">
                          <div
                            className="bg-info bg-opacity-10 text-info rounded-circle p-3 mb-3 mx-auto"
                            style={{ width: "60px", height: "60px" }}
                          >
                            <FontAwesomeIcon icon={faFilter} />
                          </div>
                          <h6 className="fw-bold">Q2 2024</h6>
                          <small className="text-muted">
                            Tests & Optimisation
                          </small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card border-0 shadow-sm">
                        <div className="card-body text-center p-3">
                          <div
                            className="bg-success bg-opacity-10 text-success rounded-circle p-3 mb-3 mx-auto"
                            style={{ width: "60px", height: "60px" }}
                          >
                            <FontAwesomeIcon icon={faRocket} />
                          </div>
                          <h6 className="fw-bold">Q3 2024</h6>
                          <small className="text-muted">
                            Lancement Officiel
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="text-center pt-4">
                  <div className="bg-light rounded p-4 mb-4">
                    <h5 className="fw-bold mb-3">
                      <FontAwesomeIcon
                        icon={faBrain}
                        className="me-2 text-purple"
                      />
                      Prêt à transformer vos données en avantage compétitif ?
                    </h5>
                    <p className="text-muted mb-0">
                      Partagez vos besoins spécifiques en analytique pour que
                      nous puissions personnaliser les fonctionnalités selon vos
                      objectifs métier.
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
                          "Excellent ! Nous avons noté votre intérêt pour les analytiques avancées. Notre équipe vous contactera pour discuter de vos cas d'usage spécifiques.",
                        )
                      }
                    >
                      <FontAwesomeIcon
                        icon={faMagnifyingGlassChart}
                        className="me-2"
                      />
                      Suggérer un cas d'usage
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
                      Version Alpha - Pour usage interne
                    </small>
                  </div>
                  <div className="text-success">
                    <small>
                      <FontAwesomeIcon icon={faCalendar} className="me-1" />
                      Lancement prévu : <strong>Juillet 2024</strong>
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
                    <FontAwesomeIcon icon={faChartArea} className="fs-4" />
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <p className="mb-0">
                      Pendant le développement, des analyses basiques sont
                      disponibles dans chaque module. Pour des analyses
                      avancées, notre équipe data science peut vous fournir des
                      rapports personnalisés.
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

        .bg-purple {
          background-color: #6f42c1 !important;
        }

        .text-purple {
          color: #6f42c1 !important;
        }

        .card {
          transition: all 0.3s ease;
        }

        .card:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </>
  );
}
