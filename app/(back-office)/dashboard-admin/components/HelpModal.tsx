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
                  Centre d'Aide OSKAR
                </h5>
                <p className="mb-0 opacity-90">
                  Votre guide complet pour utiliser la plateforme
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
            <div className="sticky-top bg-white border-bottom">
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
                      <i className="fas fa-gears text-primary"></i>
                    </div>
                    <span className="fw-semibold">Fonctionnement</span>
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === "comptes" ? "active" : ""} d-flex align-items-center gap-2`}
                    onClick={() => setActiveTab("comptes")}
                    style={{
                      borderRadius: "8px",
                      padding: "12px 20px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <div className="bg-success bg-opacity-10 p-2 rounded-circle">
                      <i className="fas fa-user-shield text-success"></i>
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
                      <i className="fas fa-headset text-warning"></i>
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
                <div className="tab-pane fade show active animate__animated animate__fadeIn">
                  <div className="row mb-4">
                    <div className="col-12">
                      <h4 className="fw-bold mb-4 text-primary">
                        🚀 Comment fonctionne OSKAR ?
                      </h4>
                      <p className="lead text-muted mb-4">
                        OSKAR est une plateforme complète de gestion d'annonces
                        et d'échanges qui permet aux utilisateurs de publier,
                        échanger et vendre des biens et services.
                      </p>
                    </div>
                  </div>

                  <div className="row g-4">
                    <div className="col-md-6 col-lg-4">
                      <div className="card h-100 border-0 shadow-sm hover-lift">
                        <div className="card-body p-4">
                          <div className="d-flex align-items-start mb-3">
                            <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                              <i className="fas fa-store text-primary fa-lg"></i>
                            </div>
                            <div>
                              <h5 className="fw-bold mb-2">
                                Gestion des Vendeurs
                              </h5>
                              <p className="text-muted mb-0">
                                Supervisez l'ensemble des vendeurs, validez
                                leurs inscriptions, gérez leurs boutiques et
                                suivez leurs performances.
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
                              <i className="fas fa-chart-line text-success fa-lg"></i>
                            </div>
                            <div>
                              <h5 className="fw-bold mb-2">
                                Analytics & Rapports
                              </h5>
                              <p className="text-muted mb-0">
                                Accédez aux statistiques en temps réel : ventes,
                                utilisateurs actifs, transactions et tendances
                                de la plateforme.
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
                              <i className="fas fa-shield-alt text-warning fa-lg"></i>
                            </div>
                            <div>
                              <h5 className="fw-bold mb-2">
                                Sécurité & Modération
                              </h5>
                              <p className="text-muted mb-0">
                                Modérez les contenus, gérez les signalements,
                                assurez la sécurité des transactions et protégez
                                les utilisateurs.
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
                              <i className="fas fa-cogs text-info fa-lg"></i>
                            </div>
                            <div>
                              <h5 className="fw-bold mb-2">Configuration</h5>
                              <p className="text-muted mb-0">
                                Configurez les paramètres système, gérez les
                                catégories, les types de transactions et
                                personnalisez la plateforme.
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
                              <i className="fas fa-users-cog text-danger fa-lg"></i>
                            </div>
                            <div>
                              <h5 className="fw-bold mb-2">
                                Gestion des Utilisateurs
                              </h5>
                              <p className="text-muted mb-0">
                                Créez et gérez les comptes administrateurs,
                                agents et vendeurs. Assignez des permissions et
                                suivez les activités.
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
                              <i className="fas fa-file-invoice-dollar text-purple fa-lg"></i>
                            </div>
                            <div>
                              <h5 className="fw-bold mb-2">
                                Finance & Transactions
                              </h5>
                              <p className="text-muted mb-0">
                                Suivez les transactions financières, gérez les
                                commissions et générez des rapports financiers
                                détaillés.
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
                              Astuces Pro
                            </h6>
                            <p className="mb-0">
                              Utilisez les filtres avancés pour des analyses
                              précises. Exportez régulièrement vos rapports pour
                              garder une trace des performances.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Onglet Votre Rôle (anciennement Types de comptes) */}
              {activeTab === "comptes" && (
                <div className="tab-pane fade show active animate__animated animate__fadeIn">
                  <div className="row mb-4">
                    <div className="col-12">
                      <h4 className="fw-bold mb-4 text-success">
                        👑 Votre Rôle : Administrateur OSKAR
                      </h4>
                      <p className="lead text-muted mb-4">
                        En tant qu'Administrateur, vous disposez de privilèges
                        étendus pour gérer et superviser l'ensemble de la
                        plateforme OSKAR.
                      </p>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-lg-8 mb-4">
                      <div className="card border-success border-2 shadow-sm">
                        <div className="card-header bg-success bg-opacity-10 border-success d-flex align-items-center">
                          <div className="bg-success bg-opacity-20 p-2 rounded-circle me-3">
                            <i className="fas fa-user-shield text-success fa-lg"></i>
                          </div>
                          <div>
                            <h5 className="mb-0 fw-bold">
                              Capacités Administrateur
                            </h5>
                            <p className="mb-0 text-muted small">
                              Vos privilèges et responsabilités
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
                                    Supervision Complète
                                  </h6>
                                  <p className="text-muted small mb-0">
                                    Accès à toutes les données et
                                    fonctionnalités de la plateforme
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-6 mb-3">
                              <div className="d-flex align-items-start mb-3">
                                <i className="fas fa-check-circle text-success mt-1 me-3"></i>
                                <div>
                                  <h6 className="fw-bold mb-1">
                                    Gestion des Utilisateurs
                                  </h6>
                                  <p className="text-muted small mb-0">
                                    Créer, modifier, suspendre ou supprimer tout
                                    compte utilisateur
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-6 mb-3">
                              <div className="d-flex align-items-start mb-3">
                                <i className="fas fa-check-circle text-success mt-1 me-3"></i>
                                <div>
                                  <h6 className="fw-bold mb-1">
                                    Modération des Contenus
                                  </h6>
                                  <p className="text-muted small mb-0">
                                    Approuver, rejeter ou supprimer annonces,
                                    produits et commentaires
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-6 mb-3">
                              <div className="d-flex align-items-start mb-3">
                                <i className="fas fa-check-circle text-success mt-1 me-3"></i>
                                <div>
                                  <h6 className="fw-bold mb-1">
                                    Configuration Système
                                  </h6>
                                  <p className="text-muted small mb-0">
                                    Modifier les paramètres globaux, catégories
                                    et règles de la plateforme
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-6 mb-3">
                              <div className="d-flex align-items-start mb-3">
                                <i className="fas fa-check-circle text-success mt-1 me-3"></i>
                                <div>
                                  <h6 className="fw-bold mb-1">
                                    Génération de Rapports
                                  </h6>
                                  <p className="text-muted small mb-0">
                                    Exporter des rapports détaillés sur toutes
                                    les activités
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-6 mb-3">
                              <div className="d-flex align-items-start mb-3">
                                <i className="fas fa-check-circle text-success mt-1 me-3"></i>
                                <div>
                                  <h6 className="fw-bold mb-1">
                                    Support Technique
                                  </h6>
                                  <p className="text-muted small mb-0">
                                    Accéder aux outils de support et résoudre
                                    les problèmes utilisateurs
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
                            Super Admin
                          </h5>
                        </div>
                        <div className="card-body">
                          <p className="text-muted mb-3">
                            Le Super Admin a des capacités supplémentaires :
                          </p>
                          <ul className="list-unstyled">
                            <li className="mb-2">
                              <i className="fas fa-star text-warning me-2"></i>
                              <strong>Gestion des Administrateurs</strong>
                              <p className="text-muted small mb-0">
                                Créer et gérer d'autres comptes administrateurs
                              </p>
                            </li>
                            <li className="mb-2">
                              <i className="fas fa-star text-warning me-2"></i>
                              <strong>Accès Total</strong>
                              <p className="text-muted small mb-0">
                                Accès illimité à toutes les données sensibles
                              </p>
                            </li>
                            <li className="mb-2">
                              <i className="fas fa-star text-warning me-2"></i>
                              <strong>Configuration Avancée</strong>
                              <p className="text-muted small mb-0">
                                Modifier les paramètres système critiques
                              </p>
                            </li>
                            <li>
                              <i className="fas fa-star text-warning me-2"></i>
                              <strong>Audit Complet</strong>
                              <p className="text-muted small mb-0">
                                Consulter tous les logs et historiques système
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
                              <i className="fas fa-shield-alt fa-2x text-success"></i>
                            </div>
                            <div>
                              <h5 className="fw-bold mb-2">
                                Responsabilités Clés
                              </h5>
                              <p className="text-muted mb-0">
                                En tant qu'Administrateur, vous êtes responsable
                                de la sécurité des données, de l'expérience
                                utilisateur et de la performance globale de la
                                plateforme. Assurez-vous de respecter les
                                politiques de confidentialité et de sécurité.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Onglet Support & Contact (avec infos de ContactHero) */}
              {activeTab === "support" && (
                <div className="tab-pane fade show active animate__animated animate__fadeIn">
                  <div className="row mb-4">
                    <div className="col-12">
                      <h4 className="fw-bold mb-4 text-warning">
                        📞 Support & Contact OSKAR
                      </h4>
                      <p className="lead text-muted mb-4">
                        Notre équipe de support est disponible pour vous aider
                        avec toutes vos questions et préoccupations. Nous nous
                        engageons à vous répondre dans les plus brefs délais.
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
                            text: "Réponse sous 24 heures",
                            color: "primary",
                          },
                          {
                            icon: faShieldHalved,
                            text: "100% Sécurisé",
                            color: "success",
                          },
                          {
                            icon: faLanguage,
                            text: "Support Français & Anglais",
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
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform =
                                "translateY(-2px)";
                              e.currentTarget.style.boxShadow =
                                "0 4px 12px rgba(0, 0, 0, 0.1)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow =
                                "0 2px 4px rgba(0, 0, 0, 0.05)";
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
                              <h5 className="fw-bold mb-2">Email Support</h5>
                              <p className="text-muted mb-3">
                                Pour toutes questions générales ou support
                                technique
                              </p>
                              <a
                                href="mailto:support@oskar.com"
                                className="btn btn-primary d-inline-flex align-items-center gap-2"
                              >
                                <i className="fas fa-envelope"></i>
                                support@oskar.com
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
                              <h5 className="fw-bold mb-2">Téléphone</h5>
                              <p className="text-muted mb-3">
                                Support téléphonique disponible du lundi au
                                vendredi
                              </p>
                              <a
                                href="tel:+2250700000000"
                                className="btn btn-success d-inline-flex align-items-center gap-2"
                              >
                                <i className="fas fa-phone"></i>
                                +225 07 00 00 00 00
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
                              <h5 className="fw-bold mb-2">Adresse</h5>
                              <p className="text-muted mb-3">
                                Siège social et bureau principal
                              </p>
                              <div className="text-muted">
                                <p className="mb-1">
                                  <strong>OSKAR Headquarters</strong>
                                </p>
                                <p className="mb-0">Rue des Entrepreneurs</p>
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
                              <h5 className="fw-bold mb-2">Horaires</h5>
                              <p className="text-muted mb-3">
                                Disponibilité de notre équipe
                              </p>
                              <div className="text-muted">
                                <p className="mb-1">
                                  <strong>Lundi - Vendredi:</strong> 8h00 -
                                  18h00
                                </p>
                                <p className="mb-1">
                                  <strong>Samedi:</strong> 9h00 - 13h00
                                </p>
                                <p className="mb-0">
                                  <strong>Dimanche:</strong> Fermé
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
                            Suivez-nous sur les réseaux sociaux
                          </h5>
                          <div className="d-flex flex-wrap justify-content-center gap-3">
                            {[
                              {
                                icon: faFacebook,
                                label: "Facebook",
                                color: "primary",
                              },
                              {
                                icon: faTwitter,
                                label: "Twitter",
                                color: "info",
                              },
                              {
                                icon: faInstagram,
                                label: "Instagram",
                                color: "danger",
                              },
                              {
                                icon: faLinkedin,
                                label: "LinkedIn",
                                color: "primary",
                              },
                              {
                                icon: faWhatsapp,
                                label: "WhatsApp",
                                color: "success",
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
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform =
                                    "translateY(-4px)";
                                  e.currentTarget.style.boxShadow = `0 8px 16px rgba(var(--bs-${social.color}-rgb), 0.2)`;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform =
                                    "translateY(0)";
                                  e.currentTarget.style.boxShadow = "none";
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
                              Urgence Technique ?
                            </h6>
                            <p className="mb-0">
                              Pour les problèmes urgents affectant la
                              plateforme, contactez immédiatement l'équipe
                              technique à{" "}
                              <strong>tech-urgence@oskar.com</strong> ou appelez
                              le
                              <strong> +225 07 00 00 00 01</strong> (24h/24 pour
                              les urgences critiques).
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
                // Ouvrir le chat support
                window.open("mailto:support@oskar.com", "_blank");
              }}
            >
              <i className="fas fa-comment-dots"></i>
              Contacter le support
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
