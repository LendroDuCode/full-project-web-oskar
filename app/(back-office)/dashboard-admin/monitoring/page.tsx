// app/(back-office)/dashboard-admin/monitoring/page.tsx
"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faServer,
  faNetworkWired,
  faShieldHalved,
  faBell,
  faGaugeHigh,
  faCircleRadiation,
  faEye,
  faWaveSquare,
  faRocket,
  faHammer,
  faCalendar,
  faClock,
  faCode,
  faLightbulb,
  faWrench,
  faSignal,
  faHardDrive,
  faMemory,
  faMicrochip,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export default function Monitoring() {
  const monitoringFeatures = [
    {
      icon: faServer,
      title: "Monitoring Serveurs",
      description:
        "Surveillance des performances et disponibilité des serveurs",
      color: "success",
    },
    {
      icon: faNetworkWired,
      title: "Réseau & Connexions",
      description: "Analyse du trafic réseau et qualité de service",
      color: "primary",
    },
    {
      icon: faShieldHalved,
      title: "Sécurité & Audit",
      description: "Détection d'intrusions et surveillance de sécurité",
      color: "warning",
    },
    {
      icon: faGaugeHigh,
      title: "Performances",
      description: "Métriques de performance applicative en temps réel",
      color: "info",
    },
    {
      icon: faBell,
      title: "Alertes Intelligentes",
      description: "Notifications proactives et escalade automatique",
      color: "danger",
    },
    {
      icon: faEye,
      title: "Surveillance Continue",
      description: "Monitoring 24/7 avec historiques détaillés",
      color: "purple",
    },
  ];

  const systemMetrics = [
    { label: "Uptime", value: "99.98%", icon: faServer, status: "success" },
    { label: "CPU Usage", value: "42%", icon: faMicrochip, status: "warning" },
    { label: "Memory", value: "78%", icon: faMemory, status: "danger" },
    { label: "Disk Space", value: "65%", icon: faHardDrive, status: "info" },
    {
      label: "Response Time",
      value: "128ms",
      icon: faSignal,
      status: "success",
    },
    {
      label: "Active Users",
      value: "2.4K",
      icon: faNetworkWired,
      status: "success",
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
                    <FontAwesomeIcon icon={faEye} className="fs-2" />
                  </div>
                  <div>
                    <h1 className="h3 mb-1">Monitoring & Surveillance</h1>
                    <p className="mb-0 opacity-75">
                      Module de supervision système en cours de développement
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
                        <FontAwesomeIcon icon={faServer} />
                      </div>
                    </div>
                  </div>

                  <h2 className="h1 fw-bold mb-3">
                    <span className="text-success">Surveillance</span> Proactive
                  </h2>
                  <p className="lead text-muted mb-4">
                    Nous développons une plateforme de monitoring complète qui
                    garantira la stabilité et les performances optimales de
                    votre infrastructure.
                  </p>
                </div>

                {/* Métriques système */}
                <div className="mb-5">
                  <h4 className="fw-bold mb-4 text-center">
                    <FontAwesomeIcon
                      icon={faGaugeHigh}
                      className="me-2 text-success"
                    />
                    Métriques Système (Démonstration)
                  </h4>
                  <div className="row g-4">
                    {systemMetrics.map((metric, index) => (
                      <div key={index} className="col-md-4 col-lg-2">
                        <div className="card border-0 shadow-sm h-100">
                          <div className="card-body text-center p-3">
                            <div
                              className={`bg-${metric.status} bg-opacity-10 text-${metric.status} rounded-circle p-3 mb-3 mx-auto`}
                              style={{ width: "60px", height: "60px" }}
                            >
                              <FontAwesomeIcon icon={metric.icon} />
                            </div>
                            <div className="text-muted mb-1">
                              {metric.label}
                            </div>
                            <h5 className="fw-bold mb-2">{metric.value}</h5>
                            <div
                              className={`badge bg-${metric.status} bg-opacity-10 text-${metric.status}`}
                            >
                              {metric.status === "success" && "Normal"}
                              {metric.status === "warning" && "Attention"}
                              {metric.status === "danger" && "Critique"}
                              {metric.status === "info" && "Stable"}
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
                    <span className="text-success fw-bold">70%</span>
                  </div>
                  <div className="progress" style={{ height: "12px" }}>
                    <div
                      className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                      role="progressbar"
                      style={{ width: "70%" }}
                      aria-valuenow={70}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    ></div>
                  </div>
                  <div className="text-end mt-2">
                    <small className="text-muted">
                      Phase d'intégration des agents de monitoring
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
                    Fonctionnalités de Surveillance
                  </h3>
                  <div className="row g-4">
                    {monitoringFeatures.map((feature, index) => (
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
                            icon={faNetworkWired}
                            className="me-2 text-success"
                          />
                          Architecture Distribuée
                        </h4>
                        <ul className="list-unstyled mb-0">
                          <li className="mb-2">
                            <FontAwesomeIcon
                              icon={faLightbulb}
                              className="text-warning me-2"
                            />
                            Agents légers pour chaque serveur
                          </li>
                          <li className="mb-2">
                            <FontAwesomeIcon
                              icon={faLightbulb}
                              className="text-warning me-2"
                            />
                            Collecte de données en temps réel
                          </li>
                          <li className="mb-2">
                            <FontAwesomeIcon
                              icon={faLightbulb}
                              className="text-warning me-2"
                            />
                            Stockage optimisé pour les séries temporelles
                          </li>
                          <li>
                            <FontAwesomeIcon
                              icon={faLightbulb}
                              className="text-warning me-2"
                            />
                            Redondance et haute disponibilité
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
                          Technologies Utilisées
                        </h4>
                        <div className="d-flex flex-wrap gap-2 mb-3">
                          <span className="badge bg-success">Prometheus</span>
                          <span className="badge bg-primary">Grafana</span>
                          <span className="badge bg-warning">
                            Elastic Stack
                          </span>
                          <span className="badge bg-danger">Nagios</span>
                          <span className="badge bg-info">Zabbix</span>
                          <span className="badge bg-purple">InfluxDB</span>
                        </div>
                        <p className="text-muted mb-0">
                          Solution de monitoring enterprise-grade avec support
                          des standards industriels et intégrations extensibles.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Niveaux de surveillance */}
                <div className="mb-5">
                  <h4 className="fw-bold mb-4">
                    <FontAwesomeIcon
                      icon={faCircleRadiation}
                      className="me-2 text-success"
                    />
                    Niveaux de Surveillance
                  </h4>
                  <div className="row g-4">
                    <div className="col-md-4">
                      <div className="card border-0 border-top border-3 border-success shadow-sm">
                        <div className="card-body p-4">
                          <div className="d-flex align-items-center mb-3">
                            <div className="bg-success bg-opacity-10 text-success rounded-circle p-2 me-3">
                              <FontAwesomeIcon icon={faServer} />
                            </div>
                            <h5 className="fw-bold mb-0">Infrastructure</h5>
                          </div>
                          <ul className="list-unstyled mb-0">
                            <li className="mb-1">
                              • Serveurs physiques & virtuels
                            </li>
                            <li className="mb-1">• Réseau & équipements</li>
                            <li className="mb-1">• Stockage & sauvegardes</li>
                            <li>• Virtualisation & containers</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card border-0 border-top border-3 border-warning shadow-sm">
                        <div className="card-body p-4">
                          <div className="d-flex align-items-center mb-3">
                            <div className="bg-warning bg-opacity-10 text-warning rounded-circle p-2 me-3">
                              <FontAwesomeIcon icon={faGaugeHigh} />
                            </div>
                            <h5 className="fw-bold mb-0">Applications</h5>
                          </div>
                          <ul className="list-unstyled mb-0">
                            <li className="mb-1">• Performance applicative</li>
                            <li className="mb-1">• Disponibilité & erreurs</li>
                            <li className="mb-1">• Logs & traces distribués</li>
                            <li>• Métriques business</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card border-0 border-top border-3 border-info shadow-sm">
                        <div className="card-body p-4">
                          <div className="d-flex align-items-center mb-3">
                            <div className="bg-info bg-opacity-10 text-info rounded-circle p-2 me-3">
                              <FontAwesomeIcon icon={faShieldHalved} />
                            </div>
                            <h5 className="fw-bold mb-0">Sécurité</h5>
                          </div>
                          <ul className="list-unstyled mb-0">
                            <li className="mb-1">• Détection d'intrusions</li>
                            <li className="mb-1">• Conformité & audit</li>
                            <li className="mb-1">• Vulnérabilités</li>
                            <li>• Accès & authentification</li>
                          </ul>
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
                        icon={faBell}
                        className="me-2 text-warning"
                      />
                      Besoin de surveillance spécifique ?
                    </h5>
                    <p className="text-muted mb-0">
                      Partagez vos exigences en matière de monitoring pour que
                      nous puissions adapter la solution à votre infrastructure
                      et vos processus.
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
                          "Parfait ! Nous avons noté votre intérêt pour le monitoring avancé. Notre équipe ops vous contactera pour évaluer vos besoins spécifiques en surveillance.",
                        )
                      }
                    >
                      <FontAwesomeIcon icon={faEye} className="me-2" />
                      Définir mes besoins monitoring
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
                      Version Bêta - Tests internes
                    </small>
                  </div>
                  <div className="text-success">
                    <small>
                      <FontAwesomeIcon icon={faCalendar} className="me-1" />
                      Disponibilité estimée : <strong>Mai 2024</strong>
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
                    <FontAwesomeIcon icon={faWaveSquare} className="fs-4" />
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <p className="mb-0">
                      Pendant le développement, les métriques de base sont
                      disponibles via les outils système standards. Pour une
                      surveillance complète, nos équipes techniques assurent un
                      monitoring manuel 24/7.
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

        .border-top.border-3 {
          border-top-width: 3px !important;
        }
      `}</style>
    </>
  );
}
