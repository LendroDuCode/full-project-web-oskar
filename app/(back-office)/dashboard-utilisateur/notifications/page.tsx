"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Notifications() {
  const router = useRouter();
  const [hoverEffect, setHoverEffect] = useState(false);

  return (
    <div className="container-fluid py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-xl-6">
          {/* Carte principale */}
          <div className="card border-0 shadow-lg overflow-hidden">
            {/* En-tête avec badge de développement */}
            <div className="bg-info bg-gradient py-4 px-5 position-relative">
              <div className="position-absolute top-0 end-0 mt-3 me-4">
                <span className="badge bg-warning text-dark fs-6 px-3 py-2 shadow-sm">
                  <i className="fa-solid fa-code me-2"></i>
                  EN DÉVELOPPEMENT
                </span>
              </div>

              <div className="d-flex align-items-center">
                <div className="bg-white bg-opacity-25 p-3 rounded-circle me-4">
                  <i className="fa-solid fa-bell fa-2x text-white"></i>
                </div>
                <div>
                  <h1 className="h2 fw-bold text-white mb-1">
                    Centre de Notifications
                  </h1>
                  <p className="text-white-80 mb-0">
                    Gestion et consultation de toutes vos notifications
                  </p>
                </div>
              </div>
            </div>

            {/* Contenu */}
            <div className="card-body p-5">
              {/* Illustration */}
              <div className="text-center mb-5">
                <div className="position-relative d-inline-block">
                  <div className="bg-light p-4 rounded-circle mb-3">
                    <i className="fa-solid fa-cogs fa-4x text-muted"></i>
                  </div>
                  <div className="position-absolute top-0 start-100 translate-middle">
                    <i className="fa-solid fa-spinner fa-spin fa-2x text-info"></i>
                  </div>
                </div>
              </div>

              {/* Message principal */}
              <div className="alert alert-info border-info border-start border-5 mb-5">
                <div className="d-flex align-items-start">
                  <i className="fa-solid fa-info-circle fa-2x me-3 mt-1 text-info"></i>
                  <div>
                    <h3 className="alert-heading fw-bold mb-2">
                      Centre de notifications en construction
                    </h3>
                    <p className="mb-2">
                      Notre équipe travaille sur le système de notifications.
                      Bientôt, vous pourrez :
                    </p>
                    <ul className="mb-0">
                      <li>
                        Consulter toutes vos notifications en un seul endroit
                      </li>
                      <li>Recevoir des alertes en temps réel</li>
                      <li>Marquer les notifications comme lues</li>
                      <li>Personnaliser vos préférences de notification</li>
                      <li>Filtrer par type et par date</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Section progression */}
              <div className="mb-5">
                <h4 className="fw-bold mb-3">
                  <i className="fa-solid fa-chart-line text-primary me-2"></i>
                  Progression du développement
                </h4>

                <div className="progress mb-3" style={{ height: "12px" }}>
                  <div
                    className="progress-bar progress-bar-striped progress-bar-animated bg-info"
                    role="progressbar"
                    style={{ width: "45%" }}
                    aria-valuenow={45}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <span className="visually-hidden">45% complet</span>
                  </div>
                </div>

                <div className="d-flex justify-content-between small text-muted">
                  <span>Démarrage</span>
                  <span className="fw-semibold">45%</span>
                  <span>Finalisation</span>
                </div>
              </div>

              {/* Types de notifications à venir */}
              <div className="row mb-5">
                <div className="col-md-6 mb-3">
                  <div className="card border h-100">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-3">
                        <div className="bg-success bg-opacity-10 p-2 rounded-circle me-3">
                          <i className="fa-solid fa-envelope text-success"></i>
                        </div>
                        <h5 className="card-title fw-bold mb-0">
                          Notifications système
                        </h5>
                      </div>
                      <p className="card-text text-muted">
                        Alertes importantes concernant le système et les mises à
                        jour
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <div className="card border h-100">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-3">
                        <div className="bg-warning bg-opacity-10 p-2 rounded-circle me-3">
                          <i className="fa-solid fa-user-check text-warning"></i>
                        </div>
                        <h5 className="card-title fw-bold mb-0">
                          Activités utilisateur
                        </h5>
                      </div>
                      <p className="card-text text-muted">
                        Notifications liées aux interactions avec d&apos;autres
                        utilisateurs
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <div className="card border h-100">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-3">
                        <div className="bg-danger bg-opacity-10 p-2 rounded-circle me-3">
                          <i className="fa-solid fa-triangle-exclamation text-danger"></i>
                        </div>
                        <h5 className="card-title fw-bold mb-0">
                          Alertes urgentes
                        </h5>
                      </div>
                      <p className="card-text text-muted">
                        Notifications prioritaires nécessitant une attention
                        immédiate
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <div className="card border h-100">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-3">
                        <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3">
                          <i className="fa-solid fa-chart-bar text-primary"></i>
                        </div>
                        <h5 className="card-title fw-bold mb-0">
                          Rapports automatiques
                        </h5>
                      </div>
                      <p className="card-text text-muted">
                        Notifications de rapports quotidiens, hebdomadaires ou
                        mensuels
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Options de notification (simulées) */}
              <div className="mb-5">
                <h4 className="fw-bold mb-3">
                  <i className="fa-solid fa-sliders text-primary me-2"></i>
                  Préférences à venir
                </h4>
                <div className="card border">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-check mb-3">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            disabled
                            id="emailNotifications"
                          />
                          <label
                            className="form-check-label text-muted"
                            htmlFor="emailNotifications"
                          >
                            Notifications par email
                          </label>
                        </div>
                        <div className="form-check mb-3">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            disabled
                            id="pushNotifications"
                          />
                          <label
                            className="form-check-label text-muted"
                            htmlFor="pushNotifications"
                          >
                            Notifications push
                          </label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-check mb-3">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            disabled
                            id="smsNotifications"
                          />
                          <label
                            className="form-check-label text-muted"
                            htmlFor="smsNotifications"
                          >
                            Notifications SMS
                          </label>
                        </div>
                        <div className="form-check mb-3">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            disabled
                            id="soundNotifications"
                          />
                          <label
                            className="form-check-label text-muted"
                            htmlFor="soundNotifications"
                          >
                            Sons de notification
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="d-flex flex-wrap gap-3 justify-content-center">
                <button
                  onClick={() => router.back()}
                  className="btn btn-outline-primary px-4 py-3 d-flex align-items-center"
                  onMouseEnter={() => setHoverEffect(true)}
                  onMouseLeave={() => setHoverEffect(false)}
                >
                  <i
                    className={`fa-solid fa-arrow-left me-2 ${hoverEffect ? "fa-beat" : ""}`}
                  ></i>
                  Retour à la page précédente
                </button>

                <button
                  onClick={() => window.location.reload()}
                  className="btn btn-outline-secondary px-4 py-3 d-flex align-items-center"
                >
                  <i className="fa-solid fa-rotate me-2"></i>
                  Actualiser la page
                </button>

                <button
                  className="btn btn-outline-info px-4 py-3 d-flex align-items-center"
                  disabled
                  title="Bientôt disponible"
                >
                  <i className="fa-solid fa-clock me-2"></i>
                  Être notifié du lancement
                </button>
              </div>
            </div>

            {/* Pied de page */}
            <div className="card-footer bg-light py-3 border-top">
              <div className="text-center small text-muted">
                <p className="mb-0">
                  <i className="fa-solid fa-calendar-day me-1"></i>
                  Version prévue : <strong>Q2 2024</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Message supplémentaire */}
          <div className="text-center mt-4">
            <p className="text-muted">
              <i className="fa-solid fa-envelope me-2"></i>
              Pour toute demande urgente, contactez{" "}
              <a
                href="mailto:support@example.com"
                className="text-decoration-none fw-semibold"
              >
                notre équipe support
              </a>
            </p>
            <div className="mt-2">
              <span className="badge bg-light text-dark border me-2">
                <i className="fa-solid fa-mobile-screen me-1"></i>
                App mobile à venir
              </span>
              <span className="badge bg-light text-dark border">
                <i className="fa-solid fa-desktop me-1"></i>
                Desktop notifications
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Styles inline pour les animations */}
      <style jsx>{`
        @keyframes pulse {
          0% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.7;
          }
        }

        .pulse-animation {
          animation: pulse 2s infinite;
        }

        .card {
          transition: transform 0.3s ease;
        }

        .card:hover {
          transform: translateY(-5px);
        }

        .form-check-input:disabled {
          cursor: not-allowed;
        }

        .form-check-label {
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
