"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  faComments,
  faLightbulb,
  faExclamationTriangle,
  faQuestionCircle,
  faBook,
  faGraduationCap,
  faVideo,
  faDownload,
  faSearch,
  faFilter,
  faBell,
  faHistory,
} from "@fortawesome/free-solid-svg-icons";
import {
  faWhatsapp,
  faFacebook,
  faTwitter,
  faInstagram,
  faLinkedin,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";

export default function Aide() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("fonctionnement");
  const [searchQuery, setSearchQuery] = useState("");
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  // Données des sections FAQ
  const faqSections = [
    {
      title: "Gestion des Annonces",
      icon: faStore,
      color: "primary",
      questions: [
        {
          id: 1,
          question: "Comment valider une annonce ?",
          answer:
            "Accédez à la section 'Annonces en attente', cliquez sur l'annonce, vérifiez les informations et utilisez le bouton 'Valider' ou 'Rejeter' avec un commentaire si nécessaire.",
        },
        {
          id: 2,
          question: "Que faire en cas d'annonce frauduleuse ?",
          answer:
            "Immédiatement suspendre l'annonce, bloquer temporairement l'utilisateur et contacter l'équipe de sécurité via le canal dédié.",
        },
        {
          id: 3,
          question: "Comment modifier une annonce publiée ?",
          answer:
            "Recherchez l'annonce dans la section 'Annonces actives', cliquez sur 'Modifier' et apportez les changements nécessaires. Un email de notification sera envoyé à l'utilisateur.",
        },
      ],
    },
    {
      title: "Gestion des Utilisateurs",
      icon: faUsersCog,
      color: "success",
      questions: [
        {
          id: 4,
          question: "Comment suspendre un compte utilisateur ?",
          answer:
            "Recherchez l'utilisateur, accédez à son profil, cliquez sur 'Actions' puis 'Suspendre'. Spécifiez la raison et la durée de la suspension.",
        },
        {
          id: 5,
          question: "Comment vérifier l'identité d'un utilisateur ?",
          answer:
            "Dans le profil utilisateur, consultez la section 'Vérification'. Si des documents sont requis, suivez la procédure de vérification d'identité.",
        },
        {
          id: 6,
          question: "Gérer les signalements d'utilisateurs",
          answer:
            "Accédez à la section 'Signalements', examinez chaque cas individuellement, prenez les mesures appropriées et archivez avec commentaires.",
        },
      ],
    },
    {
      title: "Transactions & Finances",
      icon: faFileInvoiceDollar,
      color: "warning",
      questions: [
        {
          id: 7,
          question: "Comment traiter un litige de transaction ?",
          answer:
            "Ouvrez un ticket de litige, collectez les preuves des deux parties, proposez une médiation et suivez la procédure de résolution standardisée.",
        },
        {
          id: 8,
          question: "Générer un rapport financier",
          answer:
            "Accédez à 'Analytics > Finances', sélectionnez la période, appliquez les filtres nécessaires et cliquez sur 'Exporter' pour générer le rapport PDF ou Excel.",
        },
        {
          id: 9,
          question: "Vérifier les commissions",
          answer:
            "Dans la section 'Commissions', vous pouvez voir les commissions dues par catégorie, période et vendeur. Les paiements peuvent être traités mensuellement.",
        },
      ],
    },
  ];

  // Toutes les questions pour la recherche
  const allQuestions = faqSections.flatMap((section) => section.questions);

  // Filtrer les questions selon la recherche
  const filteredQuestions = searchQuery
    ? allQuestions.filter(
        (q) =>
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : allQuestions;

  // Navigation rapide
  const quickLinks = [
    {
      label: "Documentation complète",
      icon: faBook,
      href: "#",
      color: "primary",
    },
    { label: "Formations vidéo", icon: faVideo, href: "#", color: "success" },
    {
      label: "Télécharger les guides",
      icon: faDownload,
      href: "#",
      color: "warning",
    },
    { label: "Communauté Agents", icon: faComments, href: "#", color: "info" },
  ];

  // Toggle FAQ
  const toggleFaq = (id: number) => {
    setFaqOpen(faqOpen === id ? null : id);
  };

  return (
    <div className="container-fluid px-0">
      {/* Hero Section */}
      <div className="bg-gradient-primary text-white py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <nav aria-label="breadcrumb" className="mb-3">
                <ol className="breadcrumb bg-transparent mb-0">
                  <li className="breadcrumb-item">
                    <Link
                      href="/dashboard-agent"
                      className="text-white-50 text-decoration-none"
                    >
                      <i className="fa-solid fa-home me-1"></i>
                      Tableau de bord
                    </Link>
                  </li>
                  <li
                    className="breadcrumb-item active text-white"
                    aria-current="page"
                  >
                    Centre d&apos;aide
                  </li>
                </ol>
              </nav>

              <h1 className="display-5 fw-bold mb-3">
                <i className="fa-solid fa-headset me-3"></i>
                Centre d&apos;Aide OSKAR - Support Agents
              </h1>
              <p className="lead mb-4 opacity-90">
                Votre ressource complète pour maîtriser toutes les
                fonctionnalités de la plateforme et optimiser votre gestion
                quotidienne.
              </p>

              <div className="d-flex flex-wrap gap-3">
                <span className="badge bg-white text-dark px-3 py-2 d-flex align-items-center gap-2">
                  <i className="fa-solid fa-clock text-primary"></i>
                  Support 24h/7j
                </span>
                <span className="badge bg-white text-dark px-3 py-2 d-flex align-items-center gap-2">
                  <i className="fa-solid fa-shield-halved text-success"></i>
                  Sécurisé & Conforme
                </span>
                <span className="badge bg-white text-dark px-3 py-2 d-flex align-items-center gap-2">
                  <i className="fa-solid fa-graduation-cap text-warning"></i>
                  Formations régulières
                </span>
              </div>
            </div>

            <div className="col-lg-4 mt-4 mt-lg-0">
              <div className="card border-0 shadow-lg">
                <div className="card-body text-center p-4">
                  <div className="bg-primary bg-opacity-10 p-4 rounded-circle d-inline-flex mb-3">
                    <i className="fa-solid fa-headset fa-3x text-primary"></i>
                  </div>
                  <h5 className="fw-bold mb-2">
                    Besoin d&apos;aide immédiate ?
                  </h5>
                  <p className="text-muted small mb-3">
                    Notre équipe support est disponible pour vous accompagner
                  </p>
                  <button
                    className="btn btn-primary w-100 mb-2"
                    onClick={() =>
                      window.open("mailto:support-agents@oskar.com", "_blank")
                    }
                  >
                    <i className="fa-solid fa-envelope me-2"></i>
                    Contacter le support
                  </button>
                  <button
                    className="btn btn-outline-primary w-100"
                    onClick={() => window.open("tel:+2250700000000", "_blank")}
                  >
                    <i className="fa-solid fa-phone me-2"></i>
                    Appeler (+225 07 00 00 00 00)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white border-bottom py-4">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="input-group input-group-lg shadow-sm">
                <span className="input-group-text bg-light border-0">
                  <i className="fa-solid fa-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-0"
                  placeholder="Rechercher dans l'aide (ex: 'valider annonce', 'suspension compte', 'rapport financier')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="btn btn-primary border-0">
                  <i className="fa-solid fa-magnifying-glass me-2"></i>
                  Rechercher
                </button>
              </div>
              <div className="text-muted small mt-2 px-3">
                <i className="fa-solid fa-lightbulb me-1"></i>
                Tapez des mots-clés pour trouver rapidement les réponses à vos
                questions
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-0">
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
                        <FontAwesomeIcon
                          icon={faCogs}
                          className="text-primary"
                        />
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
                      className={`nav-link ${activeTab === "faq" ? "active" : ""} d-flex align-items-center gap-2`}
                      onClick={() => setActiveTab("faq")}
                      style={{
                        borderRadius: "8px",
                        padding: "12px 20px",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <div className="bg-warning bg-opacity-10 p-2 rounded-circle">
                        <FontAwesomeIcon
                          icon={faQuestionCircle}
                          className="text-warning"
                        />
                      </div>
                      <span className="fw-semibold">FAQ & Guides</span>
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
                      <div className="bg-info bg-opacity-10 p-2 rounded-circle">
                        <FontAwesomeIcon
                          icon={faHeadset}
                          className="text-info"
                        />
                      </div>
                      <span className="fw-semibold">Support & Contact</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container my-5">
        {/* Résultats de recherche */}
        {searchQuery && (
          <div className="row mb-5">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-light border-0">
                  <h5 className="fw-bold mb-0">
                    <i className="fa-solid fa-search me-2"></i>
                    Résultats pour &quot;{searchQuery}&quot;
                    <span className="badge bg-primary ms-2">
                      {filteredQuestions.length} résultats
                    </span>
                  </h5>
                </div>
                <div className="card-body">
                  {filteredQuestions.length > 0 ? (
                    <div className="list-group list-group-flush">
                      {filteredQuestions.map((q) => (
                        <div
                          key={q.id}
                          className="list-group-item border-0 px-0 py-3"
                        >
                          <button
                            className="btn btn-link text-start p-0 text-decoration-none w-100"
                            onClick={() => {
                              setActiveTab("faq");
                              toggleFaq(q.id);
                            }}
                          >
                            <div className="d-flex align-items-start">
                              <i className="fa-solid fa-circle-question text-primary mt-1 me-3"></i>
                              <div>
                                <h6 className="fw-bold mb-1">{q.question}</h6>
                                <p className="text-muted small mb-0">
                                  {q.answer.substring(0, 150)}...
                                </p>
                              </div>
                            </div>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <i className="fa-solid fa-file-circle-question fa-3x text-muted mb-3"></i>
                      <h5 className="fw-bold mb-2">Aucun résultat trouvé</h5>
                      <p className="text-muted">
                        Essayez avec d&apos;autres mots-clés ou parcourez nos
                        catégories ci-dessous
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Onglet Fonctionnement */}
        {activeTab === "fonctionnement" && !searchQuery && (
          <div className="row">
            <div className="col-12 mb-5">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4 p-lg-5">
                  <h4 className="fw-bold mb-4 text-primary">
                    🚀 Comment fonctionne le Dashboard Agent ?
                  </h4>
                  <p className="lead text-muted mb-5">
                    En tant qu&apos;Agent OSKAR, vous disposez d&apos;outils
                    puissants pour gérer et superviser la plateforme
                    d&apos;annonces et d&apos;échanges.
                  </p>

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
                          <Link
                            href="/dashboard-agent/annonces"
                            className="btn btn-sm btn-outline-primary mt-3"
                          >
                            Accéder aux annonces
                          </Link>
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
                          <Link
                            href="/dashboard-agent/analytics"
                            className="btn btn-sm btn-outline-success mt-3"
                          >
                            Voir les statistiques
                          </Link>
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
                          <Link
                            href="/dashboard-agent/securite"
                            className="btn btn-sm btn-outline-warning mt-3"
                          >
                            Panel sécurité
                          </Link>
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
                          <Link
                            href="/dashboard-agent/utilisateurs"
                            className="btn btn-sm btn-outline-info mt-3"
                          >
                            Gérer les utilisateurs
                          </Link>
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
                              <h5 className="fw-bold mb-2">
                                Transactions Financières
                              </h5>
                              <p className="text-muted mb-0">
                                Suivez les transactions financières et gérez les
                                commissions.
                              </p>
                            </div>
                          </div>
                          <Link
                            href="/dashboard-agent/transactions"
                            className="btn btn-sm btn-outline-danger mt-3"
                          >
                            Voir les transactions
                          </Link>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6 col-lg-4">
                      <div className="card h-100 border-0 shadow-sm hover-lift">
                        <div className="card-body p-4">
                          <div className="d-flex align-items-start mb-3">
                            <div className="bg-purple bg-opacity-10 p-3 rounded-circle me-3">
                              <FontAwesomeIcon
                                icon={faComments}
                                className="text-purple fa-lg"
                              />
                            </div>
                            <div>
                              <h5 className="fw-bold mb-2">
                                Support Utilisateurs
                              </h5>
                              <p className="text-muted mb-0">
                                Répondez aux demandes d&apos;aide et résolvez
                                les problèmes des utilisateurs.
                              </p>
                            </div>
                          </div>
                          <Link
                            href="/dashboard-agent/support"
                            className="btn btn-sm btn-outline-purple mt-3"
                          >
                            Support clients
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Astuces */}
                  <div className="row mt-5">
                    <div className="col-12">
                      <div className="alert alert-info border-0 shadow-sm">
                        <div className="d-flex align-items-center">
                          <FontAwesomeIcon
                            icon={faLightbulb}
                            className="fa-2x me-3 text-info"
                          />
                          <div>
                            <h6 className="alert-heading fw-bold mb-2">
                              Astuces pour Agents
                            </h6>
                            <div className="row">
                              <div className="col-md-4 mb-2">
                                <i className="fa-solid fa-filter text-primary me-2"></i>
                                <strong>Filtres avancés</strong> pour des
                                recherches précises
                              </div>
                              <div className="col-md-4 mb-2">
                                <i className="fa-solid fa-download text-success me-2"></i>
                                <strong>Export régulier</strong> des rapports
                              </div>
                              <div className="col-md-4 mb-2">
                                <i className="fa-solid fa-bell text-warning me-2"></i>
                                <strong>Notifications actives</strong> pour
                                actions importantes
                              </div>
                              <div className="col-md-4 mb-2">
                                <i className="fa-solid fa-history text-info me-2"></i>
                                <strong>Historique des actions</strong> pour
                                suivi
                              </div>
                              <div className="col-md-4 mb-2">
                                <i className="fa-solid fa-search text-danger me-2"></i>
                                <strong>Recherche rapide</strong> pour
                                efficacité
                              </div>
                              <div className="col-md-4 mb-2">
                                <i className="fa-solid fa-book text-purple me-2"></i>
                                <strong>Documentation à jour</strong> pour
                                référence
                              </div>
                            </div>
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

        {/* Onglet Votre Rôle */}
        {activeTab === "role" && !searchQuery && (
          <div className="row">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4 p-lg-5">
                  <h4 className="fw-bold mb-4 text-success">
                    👑 Votre Rôle : Agent OSKAR
                  </h4>
                  <p className="lead text-muted mb-5">
                    En tant qu&apos;Agent, vous êtes le pilier opérationnel de
                    la plateforme OSKAR. Vous assurez le bon fonctionnement
                    quotidien et la satisfaction des utilisateurs.
                  </p>

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
                              Responsabilités de l&apos;Agent
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
                                    Générer des rapports d&apos;activité et de
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
                                    Gérer et organiser les catégories
                                    d&apos;annonces
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
                                Superviser et former d&apos;autres agents
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
                                Analyser les données détaillées
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
                                En tant qu&apos;Agent OSKAR, vous êtes
                                responsable de l&apos;expérience utilisateur, de
                                la qualité des annonces et de la sécurité des
                                transactions. Assurez-vous de respecter les
                                politiques de la plateforme et de maintenir un
                                environnement sécurisé et convivial pour tous
                                les utilisateurs.
                              </p>
                            </div>
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

        {/* Onglet FAQ & Guides */}
        {activeTab === "faq" && !searchQuery && (
          <div className="row">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4 p-lg-5">
                  <h4 className="fw-bold mb-4 text-warning">
                    ❓ FAQ & Guides Pratiques
                  </h4>
                  <p className="lead text-muted mb-5">
                    Trouvez rapidement les réponses aux questions les plus
                    fréquentes et accédez à nos guides détaillés.
                  </p>

                  {/* Liens rapides */}
                  <div className="row mb-5">
                    <div className="col-12">
                      <h5 className="fw-bold mb-3">
                        <i className="fa-solid fa-bolt text-warning me-2"></i>
                        Accès rapide
                      </h5>
                      <div className="row g-3">
                        {quickLinks.map((link, index) => (
                          <div key={index} className="col-md-3 col-sm-6">
                            <div className="card border h-100 hover-lift">
                              <div className="card-body text-center p-3">
                                <div
                                  className={`bg-${link.color} bg-opacity-10 p-3 rounded-circle d-inline-flex mb-3`}
                                >
                                  <FontAwesomeIcon
                                    icon={link.icon}
                                    className={`text-${link.color} fa-lg`}
                                  />
                                </div>
                                <h6 className="fw-bold mb-2">{link.label}</h6>
                                <Link
                                  href={link.href}
                                  className="btn btn-sm btn-outline-primary"
                                >
                                  Accéder
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sections FAQ */}
                  {faqSections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="mb-5">
                      <h5 className="fw-bold mb-4 d-flex align-items-center">
                        <div
                          className={`bg-${section.color} bg-opacity-10 p-2 rounded-circle me-3`}
                        >
                          <FontAwesomeIcon
                            icon={section.icon}
                            className={`text-${section.color}`}
                          />
                        </div>
                        {section.title}
                      </h5>

                      <div
                        className="accordion"
                        id={`accordionSection${sectionIndex}`}
                      >
                        {section.questions.map((item) => (
                          <div
                            key={item.id}
                            className="accordion-item border-0 mb-2"
                          >
                            <h2 className="accordion-header">
                              <button
                                className={`accordion-button ${faqOpen === item.id ? "" : "collapsed"} shadow-none`}
                                type="button"
                                onClick={() => toggleFaq(item.id)}
                                style={{
                                  borderRadius: "8px",
                                  backgroundColor:
                                    faqOpen === item.id
                                      ? `rgba(var(--bs-${section.color}-rgb), 0.1)`
                                      : "transparent",
                                }}
                              >
                                <div className="d-flex align-items-center w-100">
                                  <i
                                    className={`fa-solid fa-circle-question text-${section.color} me-3`}
                                  ></i>
                                  <span className="fw-semibold">
                                    {item.question}
                                  </span>
                                  <i
                                    className={`fas fa-chevron-${faqOpen === item.id ? "up" : "down"} ms-auto text-${section.color}`}
                                  ></i>
                                </div>
                              </button>
                            </h2>
                            {faqOpen === item.id && (
                              <div className="accordion-collapse show">
                                <div className="accordion-body pt-3">
                                  <div className="alert alert-light border-start border-3 border-primary">
                                    <p className="mb-0">{item.answer}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Guide de démarrage */}
                  <div className="row mt-5">
                    <div className="col-12">
                      <div className="card border-primary border-2 shadow-sm">
                        <div className="card-header bg-primary bg-opacity-10 border-primary">
                          <h5 className="mb-0 fw-bold">
                            <i className="fa-solid fa-play-circle me-2"></i>
                            Guide de Démarrage Rapide
                          </h5>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-4 mb-3">
                              <div className="text-center p-3">
                                <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-flex mb-3">
                                  <span className="display-6 fw-bold text-primary">
                                    1
                                  </span>
                                </div>
                                <h6 className="fw-bold">
                                  Configuration Initiale
                                </h6>
                                <p className="text-muted small mb-0">
                                  Configurez vos préférences et notifications
                                </p>
                              </div>
                            </div>
                            <div className="col-md-4 mb-3">
                              <div className="text-center p-3">
                                <div className="bg-success bg-opacity-10 p-3 rounded-circle d-inline-flex mb-3">
                                  <span className="display-6 fw-bold text-success">
                                    2
                                  </span>
                                </div>
                                <h6 className="fw-bold">
                                  Formation & Tutorials
                                </h6>
                                <p className="text-muted small mb-0">
                                  Suivez les tutoriels pour maîtriser les outils
                                </p>
                              </div>
                            </div>
                            <div className="col-md-4 mb-3">
                              <div className="text-center p-3">
                                <div className="bg-warning bg-opacity-10 p-3 rounded-circle d-inline-flex mb-3">
                                  <span className="display-6 fw-bold text-warning">
                                    3
                                  </span>
                                </div>
                                <h6 className="fw-bold">Premières Actions</h6>
                                <p className="text-muted small mb-0">
                                  Commencez par modérer les annonces en attente
                                </p>
                              </div>
                            </div>
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
        {activeTab === "support" && !searchQuery && (
          <div className="row">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4 p-lg-5">
                  <h4 className="fw-bold mb-4 text-info">
                    📞 Support & Contact - Équipe Agent
                  </h4>
                  <p className="lead text-muted mb-5">
                    Notre équipe de support technique est disponible pour vous
                    aider avec toutes vos questions techniques et
                    opérationnelles.
                  </p>

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
                              <button
                                onClick={() =>
                                  window.open(
                                    "mailto:agents-support@oskar.com",
                                    "_blank",
                                  )
                                }
                                className="btn btn-primary d-inline-flex align-items-center gap-2"
                              >
                                <i className="fas fa-envelope"></i>
                                agents-support@oskar.com
                              </button>
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
                              <button
                                onClick={() =>
                                  window.open("tel:+2250700000001", "_blank")
                                }
                                className="btn btn-success d-inline-flex align-items-center gap-2"
                              >
                                <i className="fas fa-phone"></i>
                                +225 07 00 00 00 01
                              </button>
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
                                <p className="mb-0">Côte d&apos;Ivoire</p>
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
                              <FontAwesomeIcon
                                icon={faClock}
                                className="text-warning fa-lg"
                              />
                            </div>
                            <div>
                              <h5 className="fw-bold mb-2">Horaires Support</h5>
                              <p className="text-muted mb-3">
                                Disponibilité de l&apos;équipe technique
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
                  <div className="row mb-5">
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
                                label: "WhatsApp",
                                color: "success",
                              },
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
                                icon: faYoutube,
                                label: "YouTube",
                                color: "danger",
                              },
                            ].map((social, index) => (
                              <button
                                key={index}
                                className={`btn btn-outline-${social.color} d-flex flex-column align-items-center p-3`}
                                style={{
                                  width: "120px",
                                  borderRadius: "12px",
                                  transition: "all 0.3s ease",
                                }}
                                onClick={() => window.open("#", "_blank")}
                              >
                                <FontAwesomeIcon
                                  icon={social.icon}
                                  className="fa-2x mb-2"
                                />
                                <span className="fw-medium">
                                  {social.label}
                                </span>
                              </button>
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
                          <FontAwesomeIcon
                            icon={faExclamationTriangle}
                            className="fa-2x me-3 text-warning"
                          />
                          <div>
                            <h6 className="alert-heading fw-bold mb-2">
                              Procédure d&apos;Urgence
                            </h6>
                            <p className="mb-0">
                              En cas de problème critique (plateforme
                              inaccessible, faille de sécurité, données
                              compromises) :<br />
                              1. Contacter immédiatement le support technique
                              <br />
                              2. Documenter le problème
                              <br />
                              3. Suivre la procédure d&apos;escalade
                            </p>
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

        {/* Boutons d'action */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex flex-wrap justify-content-center gap-3">
                  <button
                    className="btn btn-outline-primary d-flex align-items-center gap-2"
                    onClick={() => router.push("/dashboard-agent")}
                  >
                    <i className="fa-solid fa-arrow-left"></i>
                    Retour au tableau de bord
                  </button>
                  <button
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={() =>
                      window.open("mailto:support-agents@oskar.com", "_blank")
                    }
                  >
                    <i className="fa-solid fa-envelope"></i>
                    Contacter le support
                  </button>
                  <button
                    className="btn btn-success d-flex align-items-center gap-2"
                    onClick={() => window.print()}
                  >
                    <i className="fa-solid fa-print"></i>
                    Imprimer ce guide
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white py-5 mt-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 mb-4">
              <h5 className="fw-bold mb-3">
                <i className="fa-solid fa-circle-info me-2"></i>À propos du
                Centre d&apos;Aide
              </h5>
              <p className="text-white-50 small">
                Cette plateforme d&apos;aide est mise à jour régulièrement pour
                vous fournir les informations les plus récentes sur les
                fonctionnalités et procédures OSKAR.
              </p>
            </div>
            <div className="col-lg-4 mb-4">
              <h5 className="fw-bold mb-3">
                <i className="fa-solid fa-calendar-check me-2"></i>
                Dernière mise à jour
              </h5>
              <p className="text-white-50 small mb-1">
                <strong>Version:</strong> 2.4.1
              </p>
              <p className="text-white-50 small mb-1">
                <strong>Date:</strong> 25 Mars 2024
              </p>
              <p className="text-white-50 small mb-0">
                <strong>Prochaine mise à jour:</strong> Avril 2024
              </p>
            </div>
            <div className="col-lg-4 mb-4">
              <h5 className="fw-bold mb-3">
                <i className="fa-solid fa-bullhorn me-2"></i>
                Restez informé
              </h5>
              <p className="text-white-50 small">
                Abonnez-vous à notre newsletter pour recevoir les mises à jour
                et nouvelles fonctionnalités.
              </p>
              <div className="input-group">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Votre email"
                />
                <button className="btn btn-primary">S&apos;abonner</button>
              </div>
            </div>
          </div>
          <hr className="text-white-50 my-4" />
          <div className="text-center text-white-50 small">
            <p className="mb-0">
              © 2024 OSKAR Platform. Tous droits réservés. |
              <Link
                href="/politique-confidentialite"
                className="text-white-50 text-decoration-none ms-2"
              >
                Politique de confidentialité
              </Link>{" "}
              |
              <Link
                href="/conditions-utilisation"
                className="text-white-50 text-decoration-none ms-2"
              >
                Conditions d&apos;utilisation
              </Link>
            </p>
          </div>
        </div>
      </footer>

      {/* Styles */}
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
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
        }
        .bg-purple {
          color: #6f42c1;
        }
        .btn-outline-purple {
          color: #6f42c1;
          border-color: #6f42c1;
        }
        .btn-outline-purple:hover {
          background-color: #6f42c1;
          color: white;
        }
        .accordion-button:not(.collapsed) {
          box-shadow: none !important;
        }
        .nav-pills .nav-link.active {
          background-color: #16a34a !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
}
