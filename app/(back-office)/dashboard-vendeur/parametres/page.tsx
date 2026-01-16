"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Parametres() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="container-fluid py-4">
      <div className="row">
        {/* En-tête */}
        <div className="col-12 mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h2 fw-bold text-dark mb-1">
                <i className="fa-solid fa-sliders me-3 text-primary"></i>
                Paramètres du Système
              </h1>
              <p className="text-muted mb-0">
                Configurez et personnalisez votre environnement
                d&apos;administration
              </p>
            </div>
            <div>
              <span className="badge bg-warning text-dark fs-6 px-3 py-2">
                <i className="fa-solid fa-code-branch me-2"></i>
                VERSION BÊTA
              </span>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-xl-2 mb-4">
          {/* Menu latéral */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-primary bg-gradient text-white py-3">
              <h5 className="fw-bold mb-0">
                <i className="fa-solid fa-gear me-2"></i>
                Catégories
              </h5>
            </div>
            <div className="list-group list-group-flush">
              <button
                className={`list-group-item list-group-item-action border-0 py-3 ${activeTab === "general" ? "active" : ""}`}
                onClick={() => setActiveTab("general")}
              >
                <i className="fa-solid fa-cog me-2"></i>
                Général
                {activeTab === "general" && (
                  <i className="fa-solid fa-chevron-right float-end mt-1"></i>
                )}
              </button>

              <button
                className={`list-group-item list-group-item-action border-0 py-3 ${activeTab === "securite" ? "active" : ""}`}
                onClick={() => setActiveTab("securite")}
              >
                <i className="fa-solid fa-shield-halved me-2"></i>
                Sécurité
                {activeTab === "securite" && (
                  <i className="fa-solid fa-chevron-right float-end mt-1"></i>
                )}
              </button>

              <button
                className={`list-group-item list-group-item-action border-0 py-3 ${activeTab === "notifications" ? "active" : ""}`}
                onClick={() => setActiveTab("notifications")}
              >
                <i className="fa-solid fa-bell me-2"></i>
                Notifications
                {activeTab === "notifications" && (
                  <i className="fa-solid fa-chevron-right float-end mt-1"></i>
                )}
              </button>

              <button
                className={`list-group-item list-group-item-action border-0 py-3 ${activeTab === "integrations" ? "active" : ""}`}
                onClick={() => setActiveTab("integrations")}
              >
                <i className="fa-solid fa-puzzle-piece me-2"></i>
                Intégrations
                {activeTab === "integrations" && (
                  <i className="fa-solid fa-chevron-right float-end mt-1"></i>
                )}
              </button>

              <button
                className={`list-group-item list-group-item-action border-0 py-3 ${activeTab === "avance" ? "active" : ""}`}
                onClick={() => setActiveTab("avance")}
              >
                <i className="fa-solid fa-flask me-2"></i>
                Avancé
                <span className="badge bg-info ms-2">Nouveau</span>
                {activeTab === "avance" && (
                  <i className="fa-solid fa-chevron-right float-end mt-1"></i>
                )}
              </button>
            </div>
          </div>

          {/* Information version */}
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="fa-solid fa-microchip fa-3x text-muted"></i>
              </div>
              <h6 className="fw-bold">Version 1.0.0-beta</h6>
              <p className="text-muted small mb-2">En développement actif</p>
              <div className="progress mb-2" style={{ height: "6px" }}>
                <div
                  className="progress-bar bg-success"
                  style={{ width: "80%" }}
                ></div>
              </div>
              <p className="text-muted small">80% complété</p>
            </div>
          </div>
        </div>

        <div className="col-lg-9 col-xl-10">
          {/* Contenu principal */}
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              {/* Bannière de développement */}
              <div className="alert alert-warning border-warning border-start border-5 mb-5">
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <i className="fa-solid fa-tools fa-2x text-warning me-3"></i>
                  </div>
                  <div className="flex-grow-1">
                    <h4 className="alert-heading fw-bold mb-2">
                      <i className="fa-solid fa-hammer me-2"></i>
                      Module en construction
                    </h4>
                    <p className="mb-2">
                      La page des paramètres est actuellement en cours de
                      développement. Notre équipe travaille à vous offrir une
                      expérience de configuration complète.
                    </p>
                    <p className="mb-0">
                      <strong>Disponibilité prévue :</strong> 15 Avril 2024
                    </p>
                  </div>
                </div>
              </div>

              {/* Section selon l'onglet actif */}
              <div className="mb-4">
                <h3 className="fw-bold mb-4 text-primary">
                  {activeTab === "general" && "Paramètres Généraux"}
                  {activeTab === "securite" && "Paramètres de Sécurité"}
                  {activeTab === "notifications" && "Gestion des Notifications"}
                  {activeTab === "integrations" && "Intégrations"}
                  {activeTab === "avance" && "Paramètres Avancés"}
                </h3>

                <div className="row g-4">
                  {/* Placeholders pour les futurs paramètres */}
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="col-md-6 col-lg-4">
                      <div className="card border h-100 opacity-75">
                        <div className="card-body text-center p-4">
                          <div className="bg-light p-3 rounded-circle d-inline-flex mb-3">
                            <i className="fa-solid fa-wrench fa-xl text-muted"></i>
                          </div>
                          <h6 className="fw-bold text-muted mb-2">
                            {activeTab === "general" && "Option " + item}
                            {activeTab === "securite" && "Sécurité " + item}
                            {activeTab === "notifications" &&
                              "Notification " + item}
                            {activeTab === "integrations" &&
                              "Intégration " + item}
                            {activeTab === "avance" && "Option avancée " + item}
                          </h6>
                          <p className="text-muted small mb-0">
                            Fonctionnalité en cours de développement
                          </p>
                        </div>
                        <div className="card-footer bg-transparent border-top">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              disabled
                            />
                            <label className="form-check-label small text-muted">
                              Non disponible
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fonctionnalités à venir */}
              <div className="mt-5 pt-4 border-top">
                <h4 className="fw-bold mb-3">
                  <i className="fa-solid fa-rocket me-2 text-success"></i>
                  Fonctionnalités à venir
                </h4>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <ul className="list-group list-group-flush">
                      <li className="list-group-item d-flex align-items-center border-0">
                        <i className="fa-solid fa-check-circle text-success me-3"></i>
                        <span>Personnalisation de l&apos;interface</span>
                      </li>
                      <li className="list-group-item d-flex align-items-center border-0">
                        <i className="fa-solid fa-check-circle text-success me-3"></i>
                        <span>Gestion des rôles et permissions</span>
                      </li>
                      <li className="list-group-item d-flex align-items-center border-0">
                        <i className="fa-solid fa-spinner text-warning me-3"></i>
                        <span>Configuration SMTP et emails</span>
                      </li>
                    </ul>
                  </div>
                  <div className="col-md-6 mb-3">
                    <ul className="list-group list-group-flush">
                      <li className="list-group-item d-flex align-items-center border-0">
                        <i className="fa-solid fa-spinner text-warning me-3"></i>
                        <span>Backup automatique</span>
                      </li>
                      <li className="list-group-item d-flex align-items-center border-0">
                        <i className="fa-solid fa-clock text-muted me-3"></i>
                        <span>API et webhooks</span>
                      </li>
                      <li className="list-group-item d-flex align-items-center border-0">
                        <i className="fa-solid fa-clock text-muted me-3"></i>
                        <span>Audit et logs détaillés</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-4 border-top">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-0 small">
                      <i className="fa-solid fa-circle-info me-2"></i>
                      Pour accéder aux paramètres temporaires, contactez
                      l&apos;administrateur système.
                    </p>
                  </div>

                  <div className="d-flex gap-3">
                    <button
                      onClick={() => router.back()}
                      className="btn btn-outline-secondary px-4"
                    >
                      <i className="fa-solid fa-arrow-left me-2"></i>
                      Retour
                    </button>

                    <button
                      onClick={() => router.push("/dashboard-admin")}
                      className="btn btn-primary px-4"
                    >
                      <i className="fa-solid fa-dashboard me-2"></i>
                      Tableau de bord
                    </button>

                    <button
                      className="btn btn-success px-4"
                      disabled
                      title="Bientôt disponible"
                    >
                      <i className="fa-solid fa-save me-2"></i>
                      Sauvegarder
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Pied de page de la carte */}
            <div className="card-footer bg-light py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div className="small text-muted">
                  <i className="fa-solid fa-code me-1"></i>
                  Dernière mise à jour : 15 Mars 2024
                </div>
                <div className="small text-muted">
                  <i className="fa-solid fa-user-check me-1"></i>
                  Développé par l&apos;équipe technique
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Styles supplémentaires */}
      <style jsx>{`
        .list-group-item.active {
          background-color: var(--bs-primary);
          border-color: var(--bs-primary);
          color: white;
        }

        .list-group-item:not(.active):hover {
          background-color: rgba(var(--bs-primary-rgb), 0.1);
        }

        .opacity-75 {
          opacity: 0.75;
          transition: opacity 0.3s ease;
        }

        .opacity-75:hover {
          opacity: 0.9;
        }

        .form-check-input:disabled {
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
