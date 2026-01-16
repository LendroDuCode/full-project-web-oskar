// app/(back-office)/dashboard-admin/aide/page.tsx
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
  faGears,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebook,
  faTwitter,
  faInstagram,
  faLinkedin,
  faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";

export default function AidePage() {
  const [activeTab, setActiveTab] = useState("fonctionnement");

  return (
    <div className="container-fluid py-4">
      {/* En-tête de la page */}
      <div className="bg-gradient-primary text-white rounded-4 p-5 mb-5 shadow-lg">
        <div className="d-flex align-items-center gap-4">
          <div className="bg-white bg-opacity-20 p-4 rounded-circle">
            <FontAwesomeIcon icon={faHeadset} className="fs-1" />
          </div>
          <div>
            <h1 className="display-6 fw-bold mb-2">Centre d'Aide OSKAR</h1>
            <p className="fs-5 opacity-90 mb-0">
              Votre guide complet pour utiliser la plateforme
            </p>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3">
          <div className="row">
            <div className="col-12">
              <ul className="nav nav-pills justify-content-center gap-2">
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === "fonctionnement" ? "active" : ""} d-flex align-items-center gap-3`}
                    onClick={() => setActiveTab("fonctionnement")}
                    style={{
                      borderRadius: "12px",
                      padding: "16px 24px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                      <FontAwesomeIcon
                        icon={faGears}
                        className="text-primary fs-5"
                      />
                    </div>
                    <div className="text-start">
                      <div className="fw-bold fs-6">Fonctionnement</div>
                      <small className="opacity-75">
                        Comment utiliser la plateforme
                      </small>
                    </div>
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === "comptes" ? "active" : ""} d-flex align-items-center gap-3`}
                    onClick={() => setActiveTab("comptes")}
                    style={{
                      borderRadius: "12px",
                      padding: "16px 24px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                      <FontAwesomeIcon
                        icon={faUserShield}
                        className="text-success fs-5"
                      />
                    </div>
                    <div className="text-start">
                      <div className="fw-bold fs-6">Votre Rôle</div>
                      <small className="opacity-75">Administrateur OSKAR</small>
                    </div>
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === "support" ? "active" : ""} d-flex align-items-center gap-3`}
                    onClick={() => setActiveTab("support")}
                    style={{
                      borderRadius: "12px",
                      padding: "16px 24px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <div className="bg-warning bg-opacity-10 p-3 rounded-circle">
                      <FontAwesomeIcon
                        icon={faHeadset}
                        className="text-warning fs-5"
                      />
                    </div>
                    <div className="text-start">
                      <div className="fw-bold fs-6">Support & Contact</div>
                      <small className="opacity-75">Nous contacter</small>
                    </div>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu de la page */}
      <div className="row">
        <div className="col-12">
          {/* Onglet Fonctionnement */}
          {activeTab === "fonctionnement" && (
            <div className="animate__animated animate__fadeIn">
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-5">
                  <h2 className="fw-bold mb-4 text-primary">
                    🚀 Comment fonctionne OSKAR ?
                  </h2>
                  <p className="lead text-muted mb-5">
                    OSKAR est une plateforme complète de gestion d'annonces et
                    d'échanges qui permet aux utilisateurs de publier, échanger
                    et vendre des biens et services.
                  </p>

                  <div className="row g-4">
                    {[
                      {
                        icon: "store",
                        title: "Gestion des Vendeurs",
                        description:
                          "Supervisez l'ensemble des vendeurs, validez leurs inscriptions, gérez leurs boutiques et suivez leurs performances.",
                        color: "primary",
                      },
                      {
                        icon: "chart-line",
                        title: "Analytics & Rapports",
                        description:
                          "Accédez aux statistiques en temps réel : ventes, utilisateurs actifs, transactions et tendances de la plateforme.",
                        color: "success",
                      },
                      {
                        icon: "shield-alt",
                        title: "Sécurité & Modération",
                        description:
                          "Modérez les contenus, gérez les signalements, assurez la sécurité des transactions et protégez les utilisateurs.",
                        color: "warning",
                      },
                      {
                        icon: "cogs",
                        title: "Configuration",
                        description:
                          "Configurez les paramètres système, gérez les catégories, les types de transactions et personnalisez la plateforme.",
                        color: "info",
                      },
                      {
                        icon: "users-cog",
                        title: "Gestion des Utilisateurs",
                        description:
                          "Créez et gérez les comptes administrateurs, agents et vendeurs. Assignez des permissions et suivez les activités.",
                        color: "danger",
                      },
                      {
                        icon: "file-invoice-dollar",
                        title: "Finance & Transactions",
                        description:
                          "Suivez les transactions financières, gérez les commissions et générez des rapports financiers détaillés.",
                        color: "purple",
                      },
                    ].map((feature, index) => (
                      <div key={index} className="col-md-6 col-lg-4">
                        <div className="card h-100 border-0 shadow-sm hover-lift">
                          <div className="card-body p-4">
                            <div className="d-flex align-items-start mb-3">
                              <div
                                className={`bg-${feature.color} bg-opacity-10 p-3 rounded-circle me-3`}
                              >
                                <i
                                  className={`fas fa-${feature.icon} text-${feature.color} fa-lg`}
                                ></i>
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

                  <div className="row mt-5">
                    <div className="col-12">
                      <div className="alert alert-info border-0 shadow-sm">
                        <div className="d-flex align-items-center">
                          <i className="fas fa-lightbulb fa-2x me-3 text-info"></i>
                          <div>
                            <h5 className="alert-heading fw-bold mb-2">
                              Astuces Pro
                            </h5>
                            <p className="mb-0">
                              Utilisez les filtres avancés pour des analyses
                              précises. Exportez régulièrement vos rapports pour
                              garder une trace des performances. Consultez les
                              tutoriels vidéo pour maîtriser rapidement les
                              fonctionnalités avancées.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Votre Rôle */}
          {activeTab === "comptes" && (
            <div className="animate__animated animate__fadeIn">
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-5">
                  <h2 className="fw-bold mb-4 text-success">
                    👑 Votre Rôle : Administrateur OSKAR
                  </h2>
                  <p className="lead text-muted mb-5">
                    En tant qu'Administrateur, vous disposez de privilèges
                    étendus pour gérer et superviser l'ensemble de la plateforme
                    OSKAR.
                  </p>

                  <div className="row">
                    <div className="col-lg-8 mb-4">
                      <div className="card border-success border-2 shadow-sm">
                        <div className="card-header bg-success bg-opacity-10 border-success d-flex align-items-center py-3">
                          <div className="bg-success bg-opacity-20 p-2 rounded-circle me-3">
                            <i className="fas fa-user-shield text-success fa-lg"></i>
                          </div>
                          <div>
                            <h4 className="mb-0 fw-bold">
                              Capacités Administrateur
                            </h4>
                            <p className="mb-0 text-muted">
                              Vos privilèges et responsabilités
                            </p>
                          </div>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            {[
                              "Supervision Complète : Accès à toutes les données et fonctionnalités de la plateforme",
                              "Gestion des Utilisateurs : Créer, modifier, suspendre ou supprimer tout compte utilisateur",
                              "Modération des Contenus : Approuver, rejeter ou supprimer annonces, produits et commentaires",
                              "Configuration Système : Modifier les paramètres globaux, catégories et règles de la plateforme",
                              "Génération de Rapports : Exporter des rapports détaillés sur toutes les activités",
                              "Support Technique : Accéder aux outils de support et résoudre les problèmes utilisateurs",
                            ].map((capability, index) => (
                              <div key={index} className="col-md-6 mb-3">
                                <div className="d-flex align-items-start">
                                  <i className="fas fa-check-circle text-success mt-1 me-3"></i>
                                  <div>
                                    <h6 className="fw-bold mb-1">
                                      {capability.split(" : ")[0]}
                                    </h6>
                                    <p className="text-muted small mb-0">
                                      {capability.split(" : ")[1]}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-4 mb-4">
                      <div className="card border-primary border-2 shadow-sm">
                        <div className="card-header bg-primary bg-opacity-10 border-primary py-3">
                          <h4 className="mb-0 fw-bold">
                            <i className="fas fa-crown me-2"></i>
                            Super Admin
                          </h4>
                        </div>
                        <div className="card-body">
                          <p className="text-muted mb-3">
                            Le Super Admin a des capacités supplémentaires :
                          </p>
                          <ul className="list-unstyled">
                            {[
                              {
                                icon: "star",
                                title: "Gestion des Administrateurs",
                                desc: "Créer et gérer d'autres comptes administrateurs",
                              },
                              {
                                icon: "star",
                                title: "Accès Total",
                                desc: "Accès illimité à toutes les données sensibles",
                              },
                              {
                                icon: "star",
                                title: "Configuration Avancée",
                                desc: "Modifier les paramètres système critiques",
                              },
                              {
                                icon: "star",
                                title: "Audit Complet",
                                desc: "Consulter tous les logs et historiques système",
                              },
                            ].map((feature, index) => (
                              <li key={index} className="mb-3">
                                <div className="d-flex">
                                  <i
                                    className={`fas fa-${feature.icon} text-warning me-2 mt-1`}
                                  ></i>
                                  <div>
                                    <strong>{feature.title}</strong>
                                    <p className="text-muted small mb-0">
                                      {feature.desc}
                                    </p>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row mt-4">
                    <div className="col-12">
                      <div className="card border-0 shadow-sm bg-gradient-success bg-opacity-5">
                        <div className="card-body p-4">
                          <div className="d-flex align-items-center">
                            <div className="bg-success bg-opacity-10 p-4 rounded-circle me-4">
                              <i className="fas fa-shield-alt fa-2x text-success"></i>
                            </div>
                            <div>
                              <h4 className="fw-bold mb-2">
                                Responsabilités Clés
                              </h4>
                              <p className="text-muted mb-0">
                                En tant qu'Administrateur, vous êtes responsable
                                de la sécurité des données, de l'expérience
                                utilisateur et de la performance globale de la
                                plateforme. Assurez-vous de respecter les
                                politiques de confidentialité et de sécurité.
                                Vos principales responsabilités incluent :
                              </p>
                              <ul className="mt-3 mb-0">
                                <li>
                                  Maintenir la disponibilité de la plateforme
                                </li>
                                <li>Protéger les données utilisateurs</li>
                                <li>Assurer la conformité réglementaire</li>
                                <li>
                                  Former et superviser les autres
                                  administrateurs
                                </li>
                                <li>
                                  Élaborer et mettre à jour les politiques de
                                  sécurité
                                </li>
                              </ul>
                            </div>
                          </div>
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
            <div className="animate__animated animate__fadeIn">
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-5">
                  <h2 className="fw-bold mb-4 text-warning">
                    📞 Support & Contact OSKAR
                  </h2>
                  <p className="lead text-muted mb-5">
                    Notre équipe de support est disponible pour vous aider avec
                    toutes vos questions et préoccupations. Nous nous engageons
                    à vous répondre dans les plus brefs délais.
                  </p>

                  {/* Badges d'informations */}
                  <div className="row mb-5">
                    <div className="col-12">
                      <div className="d-flex flex-wrap justify-content-center gap-4">
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
                    {[
                      {
                        icon: faEnvelope,
                        title: "Email Support",
                        description:
                          "Pour toutes questions générales ou support technique",
                        action: "support@oskar.com",
                        link: "mailto:support@oskar.com",
                        color: "primary",
                        buttonText: "Envoyer un email",
                      },
                      {
                        icon: faPhone,
                        title: "Téléphone",
                        description:
                          "Support téléphonique disponible du lundi au vendredi",
                        action: "+225 07 00 00 00 00",
                        link: "tel:+2250700000000",
                        color: "success",
                        buttonText: "Appeler maintenant",
                      },
                      {
                        icon: faMapMarkerAlt,
                        title: "Adresse",
                        description: "Siège social et bureau principal",
                        details: [
                          "OSKAR Headquarters",
                          "Rue des Entrepreneurs",
                          "Plateau, Abidjan",
                          "Côte d'Ivoire",
                        ],
                        color: "info",
                        type: "address",
                      },
                      {
                        icon: faClock,
                        title: "Horaires",
                        description: "Disponibilité de notre équipe",
                        details: [
                          "Lundi - Vendredi: 8h00 - 18h00",
                          "Samedi: 9h00 - 13h00",
                          "Dimanche: Fermé",
                        ],
                        color: "warning",
                        type: "schedule",
                      },
                    ].map((contact, index) => (
                      <div key={index} className="col-md-6 mb-4">
                        <div className="card h-100 border-0 shadow-sm hover-lift">
                          <div className="card-body p-4">
                            <div className="d-flex align-items-start mb-3">
                              <div
                                className={`bg-${contact.color} bg-opacity-10 p-3 rounded-circle me-3`}
                              >
                                <FontAwesomeIcon
                                  icon={contact.icon}
                                  className={`text-${contact.color} fa-lg`}
                                />
                              </div>
                              <div className="flex-grow-1">
                                <h5 className="fw-bold mb-2">
                                  {contact.title}
                                </h5>
                                <p className="text-muted mb-3">
                                  {contact.description}
                                </p>
                                {contact.type === "address" ||
                                contact.type === "schedule" ? (
                                  <div className="text-muted">
                                    {contact.details?.map((detail, i) => (
                                      <p key={i} className="mb-1">
                                        {detail}
                                      </p>
                                    ))}
                                  </div>
                                ) : (
                                  <>
                                    <p className="fw-bold mb-3">
                                      {contact.action}
                                    </p>
                                    <a
                                      href={contact.link}
                                      className={`btn btn-${contact.color} d-inline-flex align-items-center gap-2`}
                                    >
                                      <i
                                        className={`fas fa-${contact.icon.iconName === "envelope" ? "envelope" : "phone"}`}
                                      ></i>
                                      {contact.buttonText}
                                    </a>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Réseaux Sociaux */}
                  <div className="row mb-5">
                    <div className="col-12">
                      <div className="card border-0 shadow-sm">
                        <div className="card-body p-5">
                          <h4 className="fw-bold mb-4 text-center">
                            Suivez-nous sur les réseaux sociaux
                          </h4>
                          <div className="d-flex flex-wrap justify-content-center gap-4">
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
                                className={`btn btn-outline-${social.color} d-flex flex-column align-items-center p-4`}
                                style={{
                                  width: "140px",
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
                                  className="fa-2x mb-3"
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
                  <div className="row">
                    <div className="col-12">
                      <div className="alert alert-warning border-0 shadow-sm">
                        <div className="d-flex align-items-center">
                          <i className="fas fa-exclamation-triangle fa-2x me-3 text-warning"></i>
                          <div>
                            <h5 className="alert-heading fw-bold mb-2">
                              Urgence Technique ?
                            </h5>
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

                  {/* Boutons d'action */}
                  <div className="row mt-5">
                    <div className="col-12">
                      <div className="d-flex justify-content-center gap-3">
                        <button
                          className="btn btn-outline-primary d-flex align-items-center gap-2 px-4 py-3"
                          onClick={() =>
                            window.open("https://docs.oskar.com", "_blank")
                          }
                        >
                          <i className="fas fa-book"></i>
                          Documentation Complète
                        </button>
                        <button
                          className="btn btn-primary d-flex align-items-center gap-2 px-4 py-3"
                          onClick={() =>
                            window.open("mailto:support@oskar.com", "_blank")
                          }
                        >
                          <i className="fas fa-headset"></i>
                          Contacter le Support
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pied de page */}
      <div className="mt-5 pt-4 border-top">
        <div className="text-center text-muted">
          <p className="mb-1">
            Centre d'Aide OSKAR • Dernière mise à jour :{" "}
            {new Date().toLocaleDateString("fr-FR")}
          </p>
          <p className="small mb-0">
            © {new Date().getFullYear()} OSKAR Platform. Tous droits réservés.
          </p>
        </div>
      </div>

      <style jsx>{`
        .bg-gradient-primary {
          background: linear-gradient(
            135deg,
            #16a34a 0%,
            #15803d 100%
          ) !important;
        }

        .hover-lift:hover {
          transform: translateY(-5px);
          transition: transform 0.3s ease;
        }

        .bg-purple {
          color: #6f42c1;
        }

        @media (max-width: 768px) {
          .nav-pills {
            flex-direction: column;
          }

          .nav-item {
            width: 100%;
          }

          .nav-link {
            width: 100%;
          }
        }

        .animate__animated {
          animation-duration: 0.5s;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate__fadeIn {
          animation-name: fadeIn;
        }
      `}</style>
    </div>
  );
}
