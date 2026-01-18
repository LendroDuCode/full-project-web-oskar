"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeadset,
  faClock,
  faShieldHalved,
  faLanguage,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faUserShield,
  faChartLine,
  faStore,
  faUsersCog,
  faCogs,
  faFileInvoiceDollar,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebook,
  faTwitter,
  faInstagram,
  faLinkedin,
  faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";

interface HelpModalProps {
  show: boolean;
  onClose: () => void;
}

export default function HelpModal({ show, onClose }: HelpModalProps) {
  const [activeTab, setActiveTab] = useState("fonctionnement");

  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(3px)",
        zIndex: 9999,
      }}
    >
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg">
          {/* En-tête du modal */}
          <div className="modal-header bg-gradient-primary text-white border-0">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-white bg-opacity-20 p-3 rounded-circle">
                <FontAwesomeIcon icon={faHeadset} className="fs-3" />
              </div>
              <div>
                <h5 className="modal-title fw-bold mb-0">
                  Centre d'Aide OSKAR - Dashboard Agent
                </h5>
                <p className="mb-0 opacity-90">
                  Votre guide complet pour gérer la plateforme
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body p-0">
            {/* Navigation par onglets améliorée */}
            <div
              className="sticky-top bg-white border-bottom"
              style={{ top: 0, zIndex: 1 }}
            >
              <ul className="nav nav-pills nav-fill px-4 pt-3">
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === "fonctionnement" ? "active" : ""} d-flex align-items-center gap-2`}
                    onClick={() => setActiveTab("fonctionnement")}
                    style={{
                      borderRadius: "8px",
                      padding: "12px 20px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <div className="bg-primary bg-opacity-10 p-2 rounded-circle">
                      <FontAwesomeIcon icon={faCogs} className="text-primary" />
                    </div>
                    <span className="fw-semibold">Fonctionnement</span>
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === "role" ? "active" : ""} d-flex align-items-center gap-2`}
                    onClick={() => setActiveTab("role")}
                    style={{
                      borderRadius: "8px",
                      padding: "12px 20px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <div className="bg-success bg-opacity-10 p-2 rounded-circle">
                      <FontAwesomeIcon
                        icon={faUserShield}
                        className="text-success"
                      />
                    </div>
                    <span className="fw-semibold">Votre Rôle</span>
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === "support" ? "active" : ""} d-flex align-items-center gap-2`}
                    onClick={() => setActiveTab("support")}
                    style={{
                      borderRadius: "8px",
                      padding: "12px 20px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <div className="bg-warning bg-opacity-10 p-2 rounded-circle">
                      <FontAwesomeIcon
                        icon={faHeadset}
                        className="text-warning"
                      />
                    </div>
                    <span className="fw-semibold">Support & Contact</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Contenu des onglets */}
            <div className="tab-content p-4 p-lg-5">
              {/* Onglet Fonctionnement */}
              {activeTab === "fonctionnement" && (
                <div className="tab-pane fade show active">
                  <div className="row mb-4">
                    <div className="col-12">
                      <h4 className="fw-bold mb-4 text-primary">
                        🚀 Comment fonctionne le Dashboard Agent ?
                      </h4>
                      <p className="lead text-muted mb-4">
                        En tant qu'Agent OSKAR, vous disposez d'outils puissants
                        pour gérer et superviser la plateforme d'annonces et
                        d'échanges.
                      </p>
                    </div>
                  </div>

                  <div className="row g-4">
                    <div className="col-md-6 col-lg-4">
                      <div className="card h-100 border-0 shadow-sm hover-lift">
                        <div className="card-body p-4">
                          <div className="d-flex align-items-start mb-3">
                            <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                              <FontAwesomeIcon
                                icon={faStore}
                                className="text-primary fa-lg"
                              />
                            </div>
                            <div>
                              <h5 className="fw-bold mb-2">
                                Gestion des Annonces
                              </h5>
                              <p className="text-muted mb-0">
                                Validez, modérez et gérez les annonces publiées
                                par les utilisateurs.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6 col-lg-4">
                      <div className="card h-100 border-0 shadow-sm hover-lift">
                        <div className="card-body p-4">
                          <div className="d-flex align-items-start mb-3">
                            <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                              <FontAwesomeIcon
                                icon={faChartLine}
                                className="text-success fa-lg"
                              />
                            </div>
                            <div>
                              <h5 className="fw-bold mb-2">
                                Analytics & Rapports
                              </h5>
                              <p className="text-muted mb-0">
                                Accédez aux statistiques en temps réel :
                                transactions, utilisateurs actifs et tendances.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6 col-lg-4">
                      <div className="card h-100 border-0 shadow-sm hover-lift">
                        <div className="card-body p-4">
                          <div className="d-flex align-items-start mb-3">
                            <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3">
                              <FontAwesomeIcon
                                icon={faShieldHalved}
                                className="text-warning fa-lg"
                              />
                            </div>
                            <div>
                              <h5 className="fw-bold mb-2">
                                Sécurité & Modération
                              </h5>
                              <p className="text-muted mb-0">
                                Gérez les signalements, surveillez les activités
                                suspectes et assurez la sécurité.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6 col-lg-4">
                      <div className="card h-100 border-0 shadow-sm hover-lift">
                        <div className="card-body p-4">
                          <div className="d-flex align-items-start mb-3">
                            <div className="bg-info bg-opacity-10 p-3 rounded-circle me-3">
                              <FontAwesomeIcon
                                icon={faUsersCog}
                                className="text-info fa-lg"
                              />
                            </div>
                            <div>
                              <h5 className="fw-bold mb-2">
                                Gestion des Utilisateurs
                              </h5>
                              <p className="text-muted mb-0">
                                Supervisez les comptes utilisateurs, gérez les
                                profils et les permissions.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6 col-lg-4">
                      <div className="card h-100 border-0 shadow-sm hover-lift">
                        <div className="card-body p-4">
                          <div className="d-flex align-items-start mb-3">
                            <div className="bg-danger bg-opacity-10 p-3 rounded-circle me-3">
                              <FontAwesomeIcon
                                icon={faFileInvoiceDollar}
                                className="text-danger fa-lg"
                              />
                            </div>
                            <div>
                              <h5 className="fw-bold mb-2">Transactions</h5>
                              <p className="text-muted mb-0">
                                Suivez les transactions financières et gérez les
                                commissions.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6 col-lg-4">
                      <div className="card h-100 border-0 shadow-sm hover-lift">
                        <div className="card-body p-4">
                          <div className="d-flex align-items-start mb-3">
                            <div className="bg-purple bg-opacity-10 p-3 rounded-circle me-3">
                              <i className="fas fa-comments text-purple fa-lg"></i>
                            </div>
                            <div>
                              <h5 className="fw-bold mb-2">
                                Support Utilisateurs
                              </h5>
                              <p className="text-muted mb-0">
                                Répondez aux demandes d'aide et résolvez les
                                problèmes des utilisateurs.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row mt-5">
                    <div className="col-12">
                      <div className="alert alert-info border-0 shadow-sm">
                        <div className="d-flex align-items-center">
                          <i className="fas fa-lightbulb fa-2x me-3 text-info"></i>
                          <div>
                            <h6 className="alert-heading fw-bold mb-2">
                              Astuces pour Agents
                            </h6>
                            <p className="mb-0">
                              • Utilisez les filtres avancés pour des recherches
                              précises
                              <br />
                              • Exportez régulièrement vos rapports pour suivre
                              les performances
                              <br />
                              • Activez les notifications pour les actions
                              importantes
                              <br />• Consultez l'historique des actions pour le
                              suivi d'activité
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Onglet Votre Rôle */}
              {activeTab === "role" && (
                <div className="tab-pane fade show active">
                  <div className="row mb-4">
                    <div className="col-12">
                      <h4 className="fw-bold mb-4 text-success">
                        👑 Votre Rôle : Agent OSKAR
                      </h4>
                      <p className="lead text-muted mb-4">
                        En tant qu'Agent, vous êtes le pilier opérationnel de la
                        plateforme OSKAR. Vous assurez le bon fonctionnement
                        quotidien et la satisfaction des utilisateurs.
                      </p>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-lg-8 mb-4">
                      <div className="card border-success border-2 shadow-sm">
                        <div className="card-header bg-success bg-opacity-10 border-success d-flex align-items-center">
                          <div className="bg-success bg-opacity-20 p-2 rounded-circle me-3">
                            <FontAwesomeIcon
                              icon={faUserShield}
                              className="text-success fa-lg"
                            />
                          </div>
                          <div>
                            <h5 className="mb-0 fw-bold">
                              Responsabilités de l'Agent
                            </h5>
                            <p className="mb-0 text-muted small">
                              Vos missions quotidiennes et privilèges
                            </p>
                          </div>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <div className="d-flex align-items-start mb-3">
                                <i className="fas fa-check-circle text-success mt-1 me-3"></i>
                                <div>
                                  <h6 className="fw-bold mb-1">
                                    Modération des Annonces
                                  </h6>
                                  <p className="text-muted small mb-0">
                                    Valider, rejeter ou suspendre les annonces
                                    utilisateurs
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-6 mb-3">
                              <div className="d-flex align-items-start mb-3">
                                <i className="fas fa-check-circle text-success mt-1 me-3"></i>
                                <div>
                                  <h6 className="fw-bold mb-1">
                                    Support Utilisateurs
                                  </h6>
                                  <p className="text-muted small mb-0">
                                    Répondre aux questions et résoudre les
                                    problèmes
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-6 mb-3">
                              <div className="d-flex align-items-start mb-3">
                                <i className="fas fa-check-circle text-success mt-1 me-3"></i>
                                <div>
                                  <h6 className="fw-bold mb-1">
                                    Surveillance Plateforme
                                  </h6>
                                  <p className="text-muted small mb-0">
                                    Surveiller les activités et détecter les
                                    comportements suspects
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-6 mb-3">
                              <div className="d-flex align-items-start mb-3">
                                <i className="fas fa-check-circle text-success mt-1 me-3"></i>
                                <div>
                                  <h6 className="fw-bold mb-1">
                                    Gestion des Signalements
                                  </h6>
                                  <p className="text-muted small mb-0">
                                    Traiter les signalements et prendre les
                                    mesures appropriées
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-6 mb-3">
                              <div className="d-flex align-items-start mb-3">
                                <i className="fas fa-check-circle text-success mt-1 me-3"></i>
                                <div>
                                  <h6 className="fw-bold mb-1">Reporting</h6>
                                  <p className="text-muted small mb-0">
                                    Générer des rapports d'activité et de
                                    performance
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-6 mb-3">
                              <div className="d-flex align-items-start mb-3">
                                <i className="fas fa-check-circle text-success mt-1 me-3"></i>
                                <div>
                                  <h6 className="fw-bold mb-1">
                                    Maintenance Catégories
                                  </h6>
                                  <p className="text-muted small mb-0">
                                    Gérer et organiser les catégories d'annonces
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-4 mb-4">
                      <div className="card border-primary border-2 shadow-sm">
                        <div className="card-header bg-primary bg-opacity-10 border-primary">
                          <h5 className="mb-0 fw-bold">
                            <i className="fas fa-crown me-2"></i>
                            Agent Administrateur
                          </h5>
                        </div>
                        <div className="card-body">
                          <p className="text-muted mb-3">
                            Les Agents Administrateurs ont des capacités
                            supplémentaires :
                          </p>
                          <ul className="list-unstyled">
                            <li className="mb-2">
                              <i className="fas fa-star text-warning me-2"></i>
                              <strong>Gestion des Agents</strong>
                              <p className="text-muted small mb-0">
                                Superviser et former d'autres agents
                              </p>
                            </li>
                            <li className="mb-2">
                              <i className="fas fa-star text-warning me-2"></i>
                              <strong>Configuration Avancée</strong>
                              <p className="text-muted small mb-0">
                                Modifier les paramètres de la plateforme
                              </p>
                            </li>
                            <li className="mb-2">
                              <i className="fas fa-star text-warning me-2"></i>
                              <strong>Accès aux Statistiques</strong>
                              <p className="text-muted small mb-0">
                                Analyser les données détaillées de la plateforme
                              </p>
                            </li>
                            <li>
                              <i className="fas fa-star text-warning me-2"></i>
                              <strong>Validation Financière</strong>
                              <p className="text-muted small mb-0">
                                Approuver les transactions sensibles
                              </p>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-12">
                      <div className="card border-0 shadow-sm bg-gradient-success bg-opacity-5">
                        <div className="card-body">
                          <div className="d-flex align-items-center">
                            <div className="bg-success bg-opacity-10 p-3 rounded-circle me-4">
                              <FontAwesomeIcon
                                icon={faShieldHalved}
                                className="fa-2x text-success"
                              />
                            </div>
                            <div>
                              <h5 className="fw-bold mb-2">
                                Responsabilités Clés
                              </h5>
                              <p className="text-muted mb-0">
                                En tant qu'Agent OSKAR, vous êtes responsable de
                                l'expérience utilisateur, de la qualité des
                                annonces et de la sécurité des transactions.
                                Assurez-vous de respecter les politiques de la
                                plateforme et de maintenir un environnement
                                sécurisé et convivial pour tous les
                                utilisateurs.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Onglet Support & Contact */}
              {activeTab === "support" && (
                <div className="tab-pane fade show active">
                  <div className="row mb-4">
                    <div className="col-12">
                      <h4 className="fw-bold mb-4 text-warning">
                        📞 Support & Contact - Équipe Agent
                      </h4>
                      <p className="lead text-muted mb-4">
                        Notre équipe de support technique est disponible pour
                        vous aider avec toutes vos questions techniques et
                        opérationnelles.
                      </p>
                    </div>
                  </div>

                  {/* Badges d'informations */}
                  <div className="row mb-5">
                    <div className="col-12">
                      <div className="d-flex flex-wrap justify-content-center gap-3">
                        {[
                          {
                            icon: faClock,
                            text: "Support technique 24h/7j",
                            color: "primary",
                          },
                          {
                            icon: faShieldHalved,
                            text: "Formation continue",
                            color: "success",
                          },
                          {
                            icon: faLanguage,
                            text: "Support Français",
                            color: "info",
                          },
                        ].map((badge, index) => (
                          <div
                            key={index}
                            className="d-flex align-items-center px-4 py-3 rounded-pill shadow-sm"
                            style={{
                              backgroundColor: `var(--bs-${badge.color}-bg-subtle)`,
                              border: `1px solid var(--bs-${badge.color}-border-subtle)`,
                              transition: "all 0.3s ease",
                            }}
                          >
                            <FontAwesomeIcon
                              icon={badge.icon}
                              className={`me-3 text-${badge.color}`}
                              style={{ fontSize: "1.2rem" }}
                            />
                            <span className="fw-semibold">{badge.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Contacts */}
                  <div className="row mb-5">
                    <div className="col-md-6 mb-4">
                      <div className="card h-100 border-0 shadow-sm hover-lift">
                        <div className="card-body p-4">
                          <div className="d-flex align-items-start mb-3">
                            <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                              <FontAwesomeIcon
                                icon={faEnvelope}
                                className="text-primary fa-lg"
                              />
                            </div>
                            <div>
                              <h5 className="fw-bold mb-2">
                                Support Technique
                              </h5>
                              <p className="text-muted mb-3">
                                Pour les problèmes techniques et questions
                                opérationnelles
                              </p>
                              <a
                                href="mailto:agents-support@oskar.com"
                                className="btn btn-primary d-inline-flex align-items-center gap-2"
                              >
                                <i className="fas fa-envelope"></i>
                                agents-support@oskar.com
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6 mb-4">
                      <div className="card h-100 border-0 shadow-sm hover-lift">
                        <div className="card-body p-4">
                          <div className="d-flex align-items-start mb-3">
                            <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                              <FontAwesomeIcon
                                icon={faPhone}
                                className="text-success fa-lg"
                              />
                            </div>
                            <div>
                              <h5 className="fw-bold mb-2">
                                Urgences Techniques
                              </h5>
                              <p className="text-muted mb-3">
                                Pour les problèmes critiques affectant la
                                plateforme
                              </p>
                              <a
                                href="tel:+2250700000001"
                                className="btn btn-success d-inline-flex align-items-center gap-2"
                              >
                                <i className="fas fa-phone"></i>
                                +225 07 00 00 00 01
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6 mb-4">
                      <div className="card h-100 border-0 shadow-sm hover-lift">
                        <div className="card-body p-4">
                          <div className="d-flex align-items-start mb-3">
                            <div className="bg-info bg-opacity-10 p-3 rounded-circle me-3">
                              <FontAwesomeIcon
                                icon={faMapMarkerAlt}
                                className="text-info fa-lg"
                              />
                            </div>
                            <div>
                              <h5 className="fw-bold mb-2">Bureau Support</h5>
                              <p className="text-muted mb-3">
                                Bureau dédié au support des agents
                              </p>
                              <div className="text-muted">
                                <p className="mb-1">
                                  <strong>OSKAR Agent Support Center</strong>
                                </p>
                                <p className="mb-0">Tour D, 3ème étage</p>
                                <p className="mb-0">Plateau, Abidjan</p>
                                <p className="mb-0">Côte d'Ivoire</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6 mb-4">
                      <div className="card h-100 border-0 shadow-sm hover-lift">
                        <div className="card-body p-4">
                          <div className="d-flex align-items-start mb-3">
                            <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3">
                              <i className="fas fa-clock text-warning fa-lg"></i>
                            </div>
                            <div>
                              <h5 className="fw-bold mb-2">Horaires Support</h5>
                              <p className="text-muted mb-3">
                                Disponibilité de l'équipe technique
                              </p>
                              <div className="text-muted">
                                <p className="mb-1">
                                  <strong>Lundi - Vendredi:</strong> 7h00 -
                                  20h00
                                </p>
                                <p className="mb-1">
                                  <strong>Samedi:</strong> 8h00 - 14h00
                                </p>
                                <p className="mb-0">
                                  <strong>Dimanche:</strong> 9h00 - 12h00
                                  (urgences seulement)
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Réseaux Sociaux */}
                  <div className="row">
                    <div className="col-12">
                      <div className="card border-0 shadow-sm">
                        <div className="card-body p-4">
                          <h5 className="fw-bold mb-4 text-center">
                            Communauté des Agents
                          </h5>
                          <div className="d-flex flex-wrap justify-content-center gap-3">
                            {[
                              {
                                icon: faWhatsapp,
                                label: "Groupe WhatsApp",
                                color: "success",
                              },
                              {
                                icon: faUsersCog,
                                label: "Slack Équipe",
                                color: "primary",
                              },
                              {
                                icon: faUsersCog,
                                label: "Teams",
                                color: "info",
                              },
                            ].map((social, index) => (
                              <a
                                key={index}
                                href="#"
                                className={`btn btn-outline-${social.color} d-flex flex-column align-items-center p-3`}
                                style={{
                                  width: "120px",
                                  borderRadius: "12px",
                                  transition: "all 0.3s ease",
                                }}
                              >
                                <FontAwesomeIcon
                                  icon={social.icon}
                                  className="fa-2x mb-2"
                                />
                                <span className="fw-medium">
                                  {social.label}
                                </span>
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message d'urgence */}
                  <div className="row mt-5">
                    <div className="col-12">
                      <div className="alert alert-warning border-0 shadow-sm">
                        <div className="d-flex align-items-center">
                          <i className="fas fa-exclamation-triangle fa-2x me-3 text-warning"></i>
                          <div>
                            <h6 className="alert-heading fw-bold mb-2">
                              Procédure d'Urgence
                            </h6>
                            <p className="mb-0">
                              En cas de problème critique (plateforme
                              inaccessible, faille de sécurité, données
                              compromises) :<br />
                              1. Contacter immédiatement le support technique
                              <br />
                              2. Documenter le problème
                              <br />
                              3. Suivre la procédure d'escalade
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pied du modal */}
          <div className="modal-footer border-top bg-light">
            <button
              type="button"
              className="btn btn-outline-secondary d-flex align-items-center gap-2"
              onClick={onClose}
            >
              <i className="fas fa-times"></i>
              Fermer
            </button>
            <button
              type="button"
              className="btn btn-primary d-flex align-items-center gap-2"
              onClick={() => {
                window.open("mailto:agents-support@oskar.com", "_blank");
              }}
            >
              <i className="fas fa-comment-dots"></i>
              Contacter le support agents
            </button>
          </div>
        </div>
      </div>

      {/* Styles supplémentaires */}
      <style jsx>{`
        .hover-lift:hover {
          transform: translateY(-5px);
          transition: transform 0.3s ease;
        }
        .bg-gradient-primary {
          background: linear-gradient(
            135deg,
            #16a34a 0%,
            #15803d 100%
          ) !important;
        }
        .bg-purple {
          color: #6f42c1;
        }
        .modal-content {
          border-radius: 16px;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
