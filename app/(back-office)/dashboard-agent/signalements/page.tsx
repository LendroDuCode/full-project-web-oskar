"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Signalement() {
  const router = useRouter();
  const [hoverEffect, setHoverEffect] = useState(false);

  return (
    <div className="container-fluid py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-xl-6">
          {/* Carte principale */}
          <div className="card border-0 shadow-lg overflow-hidden">
            {/* En-tête avec badge de développement */}
            <div className="bg-success bg-gradient py-4 px-5 position-relative">
              <div className="position-absolute top-0 end-0 mt-3 me-4">
                <span className="badge bg-warning text-dark fs-6 px-3 py-2 shadow-sm">
                  <i className="fa-solid fa-code me-2"></i>
                  EN DÉVELOPPEMENT
                </span>
              </div>

              <div className="d-flex align-items-center">
                <div className="bg-white bg-opacity-25 p-3 rounded-circle me-4">
                  <i className="fa-solid fa-flag fa-2x text-white"></i>
                </div>
                <div>
                  <h1 className="h2 fw-bold text-white mb-1">
                    Module Signalement
                  </h1>
                  <p className="text-white-80 mb-0">
                    Gestion des signalements et des réclamations
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
                    <i className="fa-solid fa-tools fa-4x text-muted"></i>
                  </div>
                  <div className="position-absolute top-0 start-100 translate-middle">
                    <i className="fa-solid fa-hammer fa-2x text-warning"></i>
                  </div>
                </div>
              </div>

              {/* Message principal */}
              <div className="alert alert-info border-info border-start border-5 mb-5">
                <div className="d-flex align-items-start">
                  <i className="fa-solid fa-info-circle fa-2x me-3 mt-1 text-info"></i>
                  <div>
                    <h3 className="alert-heading fw-bold mb-2">
                      Cette fonctionnalité est en cours de construction
                    </h3>
                    <p className="mb-2">
                      Notre équipe de développement travaille activement sur le
                      module de signalement. Vous pourrez bientôt :
                    </p>
                    <ul className="mb-0">
                      <li>Créer et suivre des signalements</li>
                      <li>Consulter l&apos;historique des réclamations</li>
                      <li>Gérer les tickets de support</li>
                      <li>Recevoir des notifications en temps réel</li>
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
                    className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                    role="progressbar"
                    style={{ width: "65%" }}
                    aria-valuenow={65}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <span className="visually-hidden">65% complet</span>
                  </div>
                </div>

                <div className="d-flex justify-content-between small text-muted">
                  <span>Démarrage</span>
                  <span className="fw-semibold">65%</span>
                  <span>Finalisation</span>
                </div>
              </div>

              {/* Fonctionnalités à venir */}
              <div className="row mb-5">
                <div className="col-md-6 mb-3">
                  <div className="card border h-100">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-3">
                        <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3">
                          <i className="fa-solid fa-plus text-primary"></i>
                        </div>
                        <h5 className="card-title fw-bold mb-0">
                          Création de signalements
                        </h5>
                      </div>
                      <p className="card-text text-muted">
                        Formulaire intuitif pour déclarer un incident ou une
                        anomalie
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <div className="card border h-100">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-3">
                        <div className="bg-success bg-opacity-10 p-2 rounded-circle me-3">
                          <i className="fa-solid fa-list-check text-success"></i>
                        </div>
                        <h5 className="card-title fw-bold mb-0">
                          Suivi en temps réel
                        </h5>
                      </div>
                      <p className="card-text text-muted">
                        Visualisez l&apos;état d&apos;avancement de vos
                        signalements
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="d-flex flex-wrap gap-3 justify-content-center">
                <button
                  onClick={() => router.push("/dashboard-admin")}
                  className="btn btn-outline-primary px-4 py-3 d-flex align-items-center"
                  onMouseEnter={() => setHoverEffect(true)}
                  onMouseLeave={() => setHoverEffect(false)}
                >
                  <i
                    className={`fa-solid fa-arrow-left me-2 ${hoverEffect ? "fa-beat" : ""}`}
                  ></i>
                  Retour au tableau de bord
                </button>

                <button
                  onClick={() => window.location.reload()}
                  className="btn btn-outline-secondary px-4 py-3 d-flex align-items-center"
                >
                  <i className="fa-solid fa-rotate me-2"></i>
                  Actualiser la page
                </button>

                <button
                  className="btn btn-outline-success px-4 py-3 d-flex align-items-center"
                  disabled
                  title="Bientôt disponible"
                >
                  <i className="fa-solid fa-clock me-2"></i>
                  Notifier-moi quand disponible
                </button>
              </div>
            </div>

            {/* Pied de page */}
            <div className="card-footer bg-light py-3 border-top">
              <div className="text-center small text-muted">
                <p className="mb-0">
                  <i className="fa-solid fa-calendar-day me-1"></i>
                  Version prévue : <strong>Q1 2024</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Message supplémentaire */}
          <div className="text-center mt-4">
            <p className="text-muted">
              <i className="fa-solid fa-envelope me-2"></i>
              Pour toute question, contactez{" "}
              <a
                href="mailto:support@example.com"
                className="text-decoration-none"
              >
                notre équipe support
              </a>
            </p>
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
      `}</style>
    </div>
  );
}
