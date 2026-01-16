// app/(back-office)/dashboard-admin/notifications/page.tsx
"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faMessage,
  faEnvelope,
  faMobileScreen,
  faSliders,
  faCalendar,
  faUserGroup,
  faBullhorn,
  faRocket,
  faHammer,
  faClock,
  faCode,
  faLightbulb,
  faWrench,
  faCheckCircle,
  faTimesCircle,
  faPauseCircle,
  faPaperPlane,
  faBellSlash,
  faInbox,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export default function Notifications() {
  const notificationTypes = [
    {
      icon: faBell,
      title: "Notifications Push",
      description: "Alertes en temps réel directement dans le navigateur",
      color: "success",
    },
    {
      icon: faMessage,
      title: "Messages In-App",
      description: "Notifications contextuelles dans l'application",
      color: "primary",
    },
    {
      icon: faEnvelope,
      title: "Emails Automatisés",
      description: "Campagnes d'emails personnalisées et programmées",
      color: "warning",
    },
    {
      icon: faMobileScreen,
      title: "SMS & Mobile",
      description: "Notifications sur mobile via SMS et apps natives",
      color: "info",
    },
    {
      icon: faSliders,
      title: "Préférences Granulaires",
      description: "Contrôle fin des notifications par utilisateur",
      color: "danger",
    },
    {
      icon: faCalendar,
      title: "Notifications Programmées",
      description: "Planification de rappels et alertes récurrentes",
      color: "purple",
    },
  ];

  const channelStats = [
    { channel: "Email", count: "1.2K", rate: "85%", icon: faEnvelope },
    { channel: "Push", count: "3.4K", rate: "92%", icon: faBell },
    { channel: "In-App", count: "5.6K", rate: "78%", icon: faMessage },
    { channel: "SMS", count: "450", rate: "95%", icon: faMobileScreen },
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
                    <FontAwesomeIcon icon={faBell} className="fs-2" />
                  </div>
                  <div>
                    <h1 className="h3 mb-1">Gestion des Notifications</h1>
                    <p className="mb-0 opacity-75">
                      Système de communication multi-canaux en cours de
                      développement
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
                        <FontAwesomeIcon icon={faBell} />
                      </div>
                    </div>
                  </div>

                  <h2 className="h1 fw-bold mb-3">
                    <span className="text-success">Communication</span>{" "}
                    Intelligente
                  </h2>
                  <p className="lead text-muted mb-4">
                    Nous développons un système de notifications avancé qui
                    assure une communication efficace avec vos utilisateurs sur
                    tous les canaux.
                  </p>
                </div>

                {/* Statistiques des canaux */}
                <div className="mb-5">
                  <h4 className="fw-bold mb-4 text-center">
                    <FontAwesomeIcon
                      icon={faBullhorn}
                      className="me-2 text-success"
                    />
                    Canaux de Communication (Exemple)
                  </h4>
                  <div className="row g-4">
                    {channelStats.map((stat, index) => (
                      <div key={index} className="col-md-3">
                        <div className="card border-0 shadow-sm h-100">
                          <div className="card-body text-center p-4">
                            <div
                              className={`bg-success bg-opacity-10 text-success rounded-circle p-3 mb-3 mx-auto`}
                              style={{ width: "60px", height: "60px" }}
                            >
                              <FontAwesomeIcon icon={stat.icon} />
                            </div>
                            <div className="text-muted mb-2">
                              {stat.channel}
                            </div>
                            <h3 className="fw-bold mb-2">{stat.count}</h3>
                            <div className="text-success">
                              <small>
                                <FontAwesomeIcon
                                  icon={faCheckCircle}
                                  className="me-1"
                                />
                                {stat.rate} de lecture
                              </small>
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
                    <span className="text-success fw-bold">60%</span>
                  </div>
                  <div className="progress" style={{ height: "12px" }}>
                    <div
                      className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                      role="progressbar"
                      style={{ width: "60%" }}
                      aria-valuenow={60}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    ></div>
                  </div>
                  <div className="text-end mt-2">
                    <small className="text-muted">
                      Phase d'intégration des services de notification
                    </small>
                  </div>
                </div>

                {/* Types de notifications */}
                <div className="mb-5">
                  <h3 className="h4 fw-bold mb-4">
                    <FontAwesomeIcon
                      icon={faLightbulb}
                      className="me-2 text-warning"
                    />
                    Types de Notifications
                  </h3>
                  <div className="row g-4">
                    {notificationTypes.map((type, index) => (
                      <div key={index} className="col-md-6 col-lg-4">
                        <div className="card border-0 shadow-sm h-100 hover-lift">
                          <div className="card-body p-4">
                            <div className="text-center mb-3">
                              <div
                                className={`bg-${type.color} bg-opacity-10 text-${type.color} rounded-circle p-3 d-inline-flex align-items-center justify-content-center`}
                                style={{ width: "70px", height: "70px" }}
                              >
                                <FontAwesomeIcon
                                  icon={type.icon}
                                  className="fs-3"
                                />
                              </div>
                            </div>
                            <h5 className="fw-bold text-center mb-2">
                              {type.title}
                            </h5>
                            <p className="text-muted text-center mb-0">
                              {type.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fonctionnalités avancées */}
                <div className="row g-4 mb-5">
                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-4">
                        <h4 className="fw-bold mb-3">
                          <FontAwesomeIcon
                            icon={faSliders}
                            className="me-2 text-success"
                          />
                          Gestion Intelligente
                        </h4>
                        <ul className="list-unstyled mb-0">
                          <li className="mb-2">
                            <FontAwesomeIcon
                              icon={faLightbulb}
                              className="text-warning me-2"
                            />
                            Segmentation avancée des audiences
                          </li>
                          <li className="mb-2">
                            <FontAwesomeIcon
                              icon={faLightbulb}
                              className="text-warning me-2"
                            />
                            Personnalisation en temps réel
                          </li>
                          <li className="mb-2">
                            <FontAwesomeIcon
                              icon={faLightbulb}
                              className="text-warning me-2"
                            />
                            Optimisation des heures d'envoi
                          </li>
                          <li>
                            <FontAwesomeIcon
                              icon={faLightbulb}
                              className="text-warning me-2"
                            />
                            Anti-fatigue et désabonnements
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
                          Technologies & Intégrations
                        </h4>
                        <div className="d-flex flex-wrap gap-2 mb-3">
                          <span className="badge bg-success">Web Push</span>
                          <span className="badge bg-primary">SendGrid</span>
                          <span className="badge bg-warning">Twilio</span>
                          <span className="badge bg-danger">Firebase</span>
                          <span className="badge bg-info">APNS</span>
                          <span className="badge bg-purple">OneSignal</span>
                        </div>
                        <p className="text-muted mb-0">
                          Intégration avec les principaux fournisseurs de
                          notifications pour une couverture maximale et une
                          fiabilité optimale.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Workflow de notifications */}
                <div className="mb-5">
                  <h4 className="fw-bold mb-4">
                    <FontAwesomeIcon
                      icon={faPaperPlane}
                      className="me-2 text-success"
                    />
                    Workflow d'Envoi
                  </h4>
                  <div className="row g-4">
                    <div className="col-md-3">
                      <div className="card border-0 shadow-sm">
                        <div className="card-body text-center p-3">
                          <div
                            className="bg-success bg-opacity-10 text-success rounded-circle p-3 mb-3 mx-auto"
                            style={{ width: "60px", height: "60px" }}
                          >
                            <FontAwesomeIcon icon={faUserGroup} />
                          </div>
                          <h6 className="fw-bold">Ciblage</h6>
                          <small className="text-muted">
                            Sélection des destinataires et segments
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
                            <FontAwesomeIcon icon={faMessage} />
                          </div>
                          <h6 className="fw-bold">Personnalisation</h6>
                          <small className="text-muted">
                            Adaptation du contenu et du format
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
                            <FontAwesomeIcon icon={faCalendar} />
                          </div>
                          <h6 className="fw-bold">Planification</h6>
                          <small className="text-muted">
                            Définition du timing et des déclencheurs
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
                            <FontAwesomeIcon icon={faBullhorn} />
                          </div>
                          <h6 className="fw-bold">Distribution</h6>
                          <small className="text-muted">
                            Envoi multi-canaux et suivi
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Options de contrôle */}
                <div className="mb-5">
                  <h4 className="fw-bold mb-4">
                    <FontAwesomeIcon
                      icon={faSliders}
                      className="me-2 text-success"
                    />
                    Contrôle des Notifications
                  </h4>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="d-flex align-items-center p-3 bg-light rounded">
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="text-success me-3"
                        />
                        <div>
                          <div className="fw-semibold">Actives</div>
                          <small className="text-muted">
                            Notifications reçues
                          </small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="d-flex align-items-center p-3 bg-light rounded">
                        <FontAwesomeIcon
                          icon={faPauseCircle}
                          className="text-warning me-3"
                        />
                        <div>
                          <div className="fw-semibold">En pause</div>
                          <small className="text-muted">
                            Temporairement désactivées
                          </small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="d-flex align-items-center p-3 bg-light rounded">
                        <FontAwesomeIcon
                          icon={faBellSlash}
                          className="text-danger me-3"
                        />
                        <div>
                          <div className="fw-semibold">Désactivées</div>
                          <small className="text-muted">
                            Notifications bloquées
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
                        icon={faBell}
                        className="me-2 text-warning"
                      />
                      Des besoins spécifiques en communication ?
                    </h5>
                    <p className="text-muted mb-0">
                      Partagez vos scénarios d'utilisation pour que nous
                      puissions adapter le système de notifications à vos
                      workflows et exigences métier.
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
                          "Excellent ! Nous avons noté votre intérêt pour les notifications avancées. Notre équipe communication vous contactera pour discuter de vos besoins spécifiques.",
                        )
                      }
                    >
                      <FontAwesomeIcon icon={faBell} className="me-2" />
                      Partager mes besoins
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
                      Version de développement
                    </small>
                  </div>
                  <div className="text-success">
                    <small>
                      <FontAwesomeIcon icon={faCalendar} className="me-1" />
                      Disponibilité : <strong>Juin 2024</strong>
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
                    <FontAwesomeIcon icon={faInbox} className="fs-4" />
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <p className="mb-0">
                      En attendant, les notifications basiques sont gérées par
                      le système actuel. Pour des communications avancées, notre
                      équipe support peut vous assister avec des outils
                      temporaires.
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
