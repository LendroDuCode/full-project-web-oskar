"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Aide() {
  const router = useRouter();
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "guide" | "faq" | "contact" | "ressources"
  >("guide");

  const toggleAccordion = (id: string) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* Hero Section */}
      <div
        className="bg-success py-5"
        style={{
          background: "linear-gradient(135deg, #16a34a 0%, #0d6efd 100%)",
        }}
      >
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb bg-transparent breadcrumb-light">
                  <li className="breadcrumb-item">
                    <Link
                      href="/dashboard-utilisateur"
                      className="text-white text-decoration-none"
                    >
                      <i className="fa-solid fa-home me-1"></i>
                      Tableau de bord
                    </Link>
                  </li>
                  <li
                    className="breadcrumb-item active text-white"
                    aria-current="page"
                  >
                    <i className="fa-solid fa-circle-question me-1"></i>
                    Centre d'Aide
                  </li>
                </ol>
              </nav>

              <h1 className="display-4 fw-bold text-white mb-3">
                Centre d'Aide OSKAR
              </h1>
              <p className="lead text-white mb-4 opacity-90">
                Tout ce dont vous avez besoin pour utiliser efficacement notre
                plateforme. Guides, tutoriels et assistance à portée de main.
              </p>

              <div className="d-flex flex-wrap gap-3">
                <button className="btn btn-light btn-lg">
                  <i className="fa-solid fa-download me-2"></i>
                  Télécharger le guide complet
                </button>
                <button className="btn btn-outline-light btn-lg">
                  <i className="fa-solid fa-play-circle me-2"></i>
                  Voir les tutoriels vidéo
                </button>
              </div>
            </div>
            <div className="col-lg-4 d-none d-lg-block">
              <div className="text-center">
                <div className="bg-white bg-opacity-25 p-5 rounded-circle d-inline-block">
                  <i className="fa-solid fa-circle-question fa-7x text-white"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12">
            <div
              className="card border-0 shadow-sm mt-n4"
              style={{ borderRadius: "20px" }}
            >
              <div className="card-body p-4">
                <ul className="nav nav-pills nav-fill justify-content-center">
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === "guide" ? "active" : ""} px-4 py-3`}
                      onClick={() => setActiveTab("guide")}
                    >
                      <i className="fa-solid fa-graduation-cap me-2"></i>
                      Guide de l'utilisateur
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === "faq" ? "active" : ""} px-4 py-3`}
                      onClick={() => setActiveTab("faq")}
                    >
                      <i className="fa-solid fa-question-circle me-2"></i>
                      FAQ
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === "contact" ? "active" : ""} px-4 py-3`}
                      onClick={() => setActiveTab("contact")}
                    >
                      <i className="fa-solid fa-headset me-2"></i>
                      Contact & Support
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === "ressources" ? "active" : ""} px-4 py-3`}
                      onClick={() => setActiveTab("ressources")}
                    >
                      <i className="fa-solid fa-folder-open me-2"></i>
                      Ressources
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-5">
        <div className="row">
          {/* Sidebar Navigation */}
          <div className="col-lg-3 mb-4">
            <div
              className="card border-0 shadow-sm sticky-top"
              style={{ top: "20px", borderRadius: "15px" }}
            >
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4 text-success">
                  <i className="fa-solid fa-bookmark me-2"></i>
                  Sections du guide
                </h5>
                <div className="list-group list-group-flush">
                  <a
                    href="#bienvenue"
                    className="list-group-item list-group-item-action border-0 py-3"
                  >
                    <i className="fa-solid fa-hand-wave text-success me-3"></i>
                    Bienvenue
                  </a>
                  <a
                    href="#fonctionnalites"
                    className="list-group-item list-group-item-action border-0 py-3"
                  >
                    <i className="fa-solid fa-star text-warning me-3"></i>
                    Fonctionnalités
                  </a>
                  <a
                    href="#publication"
                    className="list-group-item list-group-item-action border-0 py-3"
                  >
                    <i className="fa-solid fa-newspaper text-primary me-3"></i>
                    Publier une annonce
                  </a>
                  <a
                    href="#securite"
                    className="list-group-item list-group-item-action border-0 py-3"
                  >
                    <i className="fa-solid fa-shield-halved text-info me-3"></i>
                    Sécurité
                  </a>
                  <a
                    href="#conseils"
                    className="list-group-item list-group-item-action border-0 py-3"
                  >
                    <i className="fa-solid fa-lightbulb text-warning me-3"></i>
                    Conseils pratiques
                  </a>
                  <a
                    href="#support"
                    className="list-group-item list-group-item-action border-0 py-3"
                  >
                    <i className="fa-solid fa-life-ring text-danger me-3"></i>
                    Support technique
                  </a>
                </div>

                <div className="mt-5 pt-4 border-top">
                  <h6 className="fw-bold mb-3">
                    <i className="fa-solid fa-fire me-2 text-danger"></i>À la
                    une
                  </h6>
                  <div className="card bg-danger bg-opacity-10 border-0">
                    <div className="card-body p-3">
                      <h6 className="fw-bold mb-2">Nouveautés !</h6>
                      <p className="small mb-0">
                        Découvrez notre nouvelle fonction d'échange instantané
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-lg-9">
            {/* Section Bienvenue */}
            <section id="bienvenue" className="mb-5">
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-5">
                  <div className="row align-items-center">
                    <div className="col-md-8">
                      <h2 className="fw-bold mb-3" style={{ color: "#16a34a" }}>
                        <i className="fa-solid fa-hand-wave me-2"></i>
                        Bienvenue sur OSKAR !
                      </h2>
                      <p className="lead mb-4">
                        OSKAR est la plateforme qui connecte les communautés
                        autour du partage, de l'échange et de la vente de biens
                        et services. En tant qu'utilisateur, vous êtes au cœur
                        de notre écosystème.
                      </p>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="d-flex align-items-center mb-3">
                            <div className="bg-success bg-opacity-10 p-2 rounded-circle me-3">
                              <i className="fa-solid fa-check text-success"></i>
                            </div>
                            <span>Plateforme 100% sécurisée</span>
                          </div>
                          <div className="d-flex align-items-center mb-3">
                            <div className="bg-success bg-opacity-10 p-2 rounded-circle me-3">
                              <i className="fa-solid fa-check text-success"></i>
                            </div>
                            <span>Communauté vérifiée</span>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="d-flex align-items-center mb-3">
                            <div className="bg-success bg-opacity-10 p-2 rounded-circle me-3">
                              <i className="fa-solid fa-check text-success"></i>
                            </div>
                            <span>Support 24/7</span>
                          </div>
                          <div className="d-flex align-items-center mb-3">
                            <div className="bg-success bg-opacity-10 p-2 rounded-circle me-3">
                              <i className="fa-solid fa-check text-success"></i>
                            </div>
                            <span>Transactions garanties</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4 text-center">
                      <div className="bg-success bg-opacity-10 p-4 rounded-circle d-inline-block">
                        <i className="fa-solid fa-users fa-4x text-success"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="row g-4 mb-5">
                <div className="col-md-3">
                  <div className="card border-0 shadow-sm text-center h-100 hover-lift">
                    <div className="card-body p-4">
                      <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                        <i className="fa-solid fa-users fa-2x text-primary"></i>
                      </div>
                      <h3 className="fw-bold mb-1">10,000+</h3>
                      <p className="text-muted mb-0">Utilisateurs actifs</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card border-0 shadow-sm text-center h-100 hover-lift">
                    <div className="card-body p-4">
                      <div className="bg-success bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                        <i className="fa-solid fa-cart-shopping fa-2x text-success"></i>
                      </div>
                      <h3 className="fw-bold mb-1">5,000+</h3>
                      <p className="text-muted mb-0">Transactions</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card border-0 shadow-sm text-center h-100 hover-lift">
                    <div className="card-body p-4">
                      <div className="bg-warning bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                        <i className="fa-solid fa-star fa-2x text-warning"></i>
                      </div>
                      <h3 className="fw-bold mb-1">4.8/5</h3>
                      <p className="text-muted mb-0">Satisfaction</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card border-0 shadow-sm text-center h-100 hover-lift">
                    <div className="card-body p-4">
                      <div className="bg-info bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                        <i className="fa-solid fa-arrows-rotate fa-2x text-info"></i>
                      </div>
                      <h3 className="fw-bold mb-1">2,500+</h3>
                      <p className="text-muted mb-0">Échanges réalisés</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section Fonctionnalités */}
            <section id="fonctionnalites" className="mb-5">
              <h2 className="fw-bold mb-4" style={{ color: "#16a34a" }}>
                <i className="fa-solid fa-star me-2"></i>
                Vos Fonctionnalités Principales
              </h2>

              <div className="row g-4">
                <div className="col-md-6">
                  <div className="card border-0 shadow-sm h-100 hover-lift">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-start mb-3">
                        <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                          <i className="fa-solid fa-magnifying-glass fa-lg text-success"></i>
                        </div>
                        <div>
                          <h5 className="card-title fw-bold mb-2">
                            Découvrir & Explorer
                          </h5>
                          <p className="card-text text-muted">
                            Parcourez des milliers d'annonces triées par
                            catégories. Utilisez nos filtres intelligents pour
                            trouver exactement ce que vous cherchez.
                          </p>
                          <div className="mt-3">
                            <span className="badge bg-success bg-opacity-10 text-success me-2">
                              Recherche avancée
                            </span>
                            <span className="badge bg-success bg-opacity-10 text-success">
                              Filtres intelligents
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card border-0 shadow-sm h-100 hover-lift">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-start mb-3">
                        <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3">
                          <i className="fa-solid fa-plus fa-lg text-warning"></i>
                        </div>
                        <div>
                          <h5 className="card-title fw-bold mb-2">
                            Publier & Partager
                          </h5>
                          <p className="card-text text-muted">
                            Publiez vos annonces en quelques clics. Vendez,
                            donnez ou échangez ce dont vous n'avez plus besoin
                            avec la communauté.
                          </p>
                          <div className="mt-3">
                            <span className="badge bg-warning bg-opacity-10 text-warning me-2">
                              Publication rapide
                            </span>
                            <span className="badge bg-warning bg-opacity-10 text-warning">
                              Gestion simplifiée
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card border-0 shadow-sm h-100 hover-lift">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-start mb-3">
                        <div className="bg-info bg-opacity-10 p-3 rounded-circle me-3">
                          <i className="fa-solid fa-cart-shopping fa-lg text-info"></i>
                        </div>
                        <div>
                          <h5 className="card-title fw-bold mb-2">
                            Acheter en Sécurité
                          </h5>
                          <p className="card-text text-muted">
                            Ajoutez des articles à votre panier, suivez vos
                            commandes et bénéficiez de notre système de paiement
                            sécurisé.
                          </p>
                          <div className="mt-3">
                            <span className="badge bg-info bg-opacity-10 text-info me-2">
                              Paiement sécurisé
                            </span>
                            <span className="badge bg-info bg-opacity-10 text-info">
                              Suivi en temps réel
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card border-0 shadow-sm h-100 hover-lift">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-start mb-3">
                        <div className="bg-purple bg-opacity-10 p-3 rounded-circle me-3">
                          <i className="fa-solid fa-arrows-rotate fa-lg text-purple"></i>
                        </div>
                        <div>
                          <h5 className="card-title fw-bold mb-2">
                            Échanger Écologiquement
                          </h5>
                          <p className="card-text text-muted">
                            Proposez des échanges équitables. C'est économique,
                            écologique et bénéfique pour toute la communauté.
                          </p>
                          <div className="mt-3">
                            <span className="badge bg-purple bg-opacity-10 text-purple me-2">
                              Économie circulaire
                            </span>
                            <span className="badge bg-purple bg-opacity-10 text-purple">
                              Impact écologique
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section Publication */}
            <section id="publication" className="mb-5">
              <h2 className="fw-bold mb-4" style={{ color: "#16a34a" }}>
                <i className="fa-solid fa-newspaper me-2"></i>
                Comment publier une annonce ?
              </h2>

              <div className="card border-0 shadow-sm">
                <div className="card-body p-5">
                  <div className="row">
                    <div className="col-lg-8">
                      <h4 className="fw-bold mb-4">Guide étape par étape</h4>
                      <div className="steps">
                        <div className="step-item d-flex mb-4">
                          <div
                            className="step-number bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-4"
                            style={{
                              width: "50px",
                              height: "50px",
                              flexShrink: 0,
                            }}
                          >
                            <span className="fw-bold">1</span>
                          </div>
                          <div>
                            <h5 className="fw-bold mb-2">
                              Accéder à la publication
                            </h5>
                            <p className="text-muted mb-0">
                              Cliquez sur "Publier une annonce" dans le menu
                              principal ou dans le header de votre tableau de
                              bord.
                            </p>
                          </div>
                        </div>

                        <div className="step-item d-flex mb-4">
                          <div
                            className="step-number bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-4"
                            style={{
                              width: "50px",
                              height: "50px",
                              flexShrink: 0,
                            }}
                          >
                            <span className="fw-bold">2</span>
                          </div>
                          <div>
                            <h5 className="fw-bold mb-2">
                              Choisir le type d'annonce
                            </h5>
                            <p className="text-muted mb-0">
                              Sélectionnez entre Vente, Don ou Échange selon ce
                              que vous souhaitez proposer.
                            </p>
                          </div>
                        </div>

                        <div className="step-item d-flex mb-4">
                          <div
                            className="step-number bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-4"
                            style={{
                              width: "50px",
                              height: "50px",
                              flexShrink: 0,
                            }}
                          >
                            <span className="fw-bold">3</span>
                          </div>
                          <div>
                            <h5 className="fw-bold mb-2">
                              Remplir les informations
                            </h5>
                            <p className="text-muted mb-0">
                              Donnez un titre clair, une description détaillée,
                              fixez un prix ou définissez les conditions
                              d'échange.
                            </p>
                          </div>
                        </div>

                        <div className="step-item d-flex mb-4">
                          <div
                            className="step-number bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-4"
                            style={{
                              width: "50px",
                              height: "50px",
                              flexShrink: 0,
                            }}
                          >
                            <span className="fw-bold">4</span>
                          </div>
                          <div>
                            <h5 className="fw-bold mb-2">Ajouter des photos</h5>
                            <p className="text-muted mb-0">
                              Téléchargez des photos de qualité sous bonne
                              lumière (minimum 3, maximum 10).
                            </p>
                          </div>
                        </div>

                        <div className="step-item d-flex">
                          <div
                            className="step-number bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-4"
                            style={{
                              width: "50px",
                              height: "50px",
                              flexShrink: 0,
                            }}
                          >
                            <span className="fw-bold">5</span>
                          </div>
                          <div>
                            <h5 className="fw-bold mb-2">
                              Publier et partager
                            </h5>
                            <p className="text-muted mb-0">
                              Cliquez sur "Publier" et partagez votre annonce
                              sur les réseaux sociaux pour plus de visibilité.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-4">
                      <div className="card bg-light border-0 h-100">
                        <div className="card-body p-4">
                          <h5 className="fw-bold mb-3 text-success">
                            <i className="fa-solid fa-lightbulb me-2"></i>
                            Conseils de publication
                          </h5>
                          <ul className="list-unstyled mb-0">
                            <li className="d-flex mb-3">
                              <i className="fa-solid fa-camera text-success me-3 mt-1"></i>
                              <span>Prenez des photos sous bonne lumière</span>
                            </li>
                            <li className="d-flex mb-3">
                              <i className="fa-solid fa-pen text-success me-3 mt-1"></i>
                              <span>Soyez précis dans la description</span>
                            </li>
                            <li className="d-flex mb-3">
                              <i className="fa-solid fa-tag text-success me-3 mt-1"></i>
                              <span>Fixez un prix compétitif</span>
                            </li>
                            <li className="d-flex mb-3">
                              <i className="fa-solid fa-clock text-success me-3 mt-1"></i>
                              <span>Répondez rapidement aux messages</span>
                            </li>
                            <li className="d-flex">
                              <i className="fa-solid fa-star text-success me-3 mt-1"></i>
                              <span>Mettez à jour l'état de l'annonce</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section Sécurité */}
            <section id="securite" className="mb-5">
              <h2 className="fw-bold mb-4" style={{ color: "#16a34a" }}>
                <i className="fa-solid fa-shield-halved me-2"></i>
                Sécurité & Confidentialité
              </h2>

              <div className="row">
                <div className="col-md-6 mb-4">
                  <div className="card border-success border-2 h-100">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center mb-3">
                        <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                          <i className="fa-solid fa-check-circle fa-lg text-success"></i>
                        </div>
                        <h5 className="card-title mb-0 fw-bold">
                          Bonnes pratiques
                        </h5>
                      </div>
                      <ul className="mb-0">
                        <li className="mb-2">
                          Vérifiez les profils (badges de vérification)
                        </li>
                        <li className="mb-2">
                          Utilisez la messagerie intégrée
                        </li>
                        <li className="mb-2">
                          Ne partagez pas d'informations sensibles
                        </li>
                        <li className="mb-2">
                          Signalez tout comportement suspect
                        </li>
                        <li>Lisez les avis des autres utilisateurs</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 mb-4">
                  <div className="card border-danger border-2 h-100">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center mb-3">
                        <div className="bg-danger bg-opacity-10 p-3 rounded-circle me-3">
                          <i className="fa-solid fa-triangle-exclamation fa-lg text-danger"></i>
                        </div>
                        <h5 className="card-title mb-0 fw-bold">À éviter</h5>
                      </div>
                      <ul className="text-danger mb-0">
                        <li className="mb-2">Paiements hors plateforme</li>
                        <li className="mb-2">
                          Communications par SMS/WhatsApp
                        </li>
                        <li className="mb-2">
                          Partage de coordonnées bancaires
                        </li>
                        <li className="mb-2">
                          Rencontres dans des lieux isolés
                        </li>
                        <li>Confiance aveugle sans vérification</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="mb-5">
              <h2 className="fw-bold mb-4" style={{ color: "#16a34a" }}>
                <i className="fa-solid fa-question-circle me-2"></i>
                Questions Fréquentes (FAQ)
              </h2>

              <div className="accordion" id="faqAccordion">
                {[
                  {
                    id: "faq1",
                    question:
                      "Comment modifier mes informations personnelles ?",
                    answer:
                      "Accédez à votre profil via le menu 'Mon profil' dans votre tableau de bord. Vous pouvez y modifier vos informations personnelles, votre photo de profil et vos préférences.",
                  },
                  {
                    id: "faq2",
                    question: "Comment contacter un vendeur ?",
                    answer:
                      "Cliquez sur le bouton 'Contacter le vendeur' sur la page de l'annonce. Utilisez notre messagerie intégrée pour une communication sécurisée.",
                  },
                  {
                    id: "faq3",
                    question:
                      "Que faire si je rencontre un problème avec une transaction ?",
                    answer:
                      "Contactez notre support via le formulaire de contact ou par email à support@oskar.com. Notre équipe vous assistera dans la résolution du problème.",
                  },
                  {
                    id: "faq4",
                    question: "Comment supprimer mon compte ?",
                    answer:
                      "Accédez aux paramètres de votre compte, section 'Sécurité', et sélectionnez 'Supprimer mon compte'. Notez que cette action est irréversible.",
                  },
                ].map((faq) => (
                  <div
                    className="accordion-item border-0 shadow-sm mb-3"
                    key={faq.id}
                  >
                    <h3 className="accordion-header">
                      <button
                        className={`accordion-button ${activeAccordion === faq.id ? "" : "collapsed"} py-3`}
                        type="button"
                        onClick={() => toggleAccordion(faq.id)}
                      >
                        <i className="fa-solid fa-circle-question text-primary me-3"></i>
                        {faq.question}
                      </button>
                    </h3>
                    <div
                      className={`accordion-collapse collapse ${activeAccordion === faq.id ? "show" : ""}`}
                    >
                      <div className="accordion-body">{faq.answer}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA Section */}
            <section className="mb-5">
              <div
                className="card border-0 shadow-sm"
                style={{
                  background:
                    "linear-gradient(135deg, #16a34a 0%, #0d6efd 100%)",
                }}
              >
                <div className="card-body p-5 text-center text-white">
                  <h3 className="fw-bold mb-3">
                    Besoin d'aide supplémentaire ?
                  </h3>
                  <p className="mb-4 opacity-90">
                    Notre équipe de support est disponible 24/7 pour vous aider.
                  </p>
                  <div className="d-flex flex-wrap justify-content-center gap-3">
                    <button className="btn btn-light btn-lg">
                      <i className="fa-solid fa-headset me-2"></i>
                      Contacter le support
                    </button>
                    <button className="btn btn-outline-light btn-lg">
                      <i className="fa-solid fa-envelope me-2"></i>
                      Envoyer un email
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white py-5">
        <div className="container">
          <div className="row">
            <div className="col-md-4 mb-4">
              <h5 className="fw-bold mb-3">
                <i className="fa-solid fa-circle-question me-2"></i>
                Centre d'Aide OSKAR
              </h5>
              <p className="text-white-50">
                Votre guide complet pour une expérience optimale sur notre
                plateforme.
              </p>
            </div>
            <div className="col-md-4 mb-4">
              <h6 className="fw-bold mb-3">Liens rapides</h6>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <a
                    href="#bienvenue"
                    className="text-white-50 text-decoration-none"
                  >
                    <i className="fa-solid fa-chevron-right me-2"></i>
                    Bienvenue
                  </a>
                </li>
                <li className="mb-2">
                  <a
                    href="#fonctionnalites"
                    className="text-white-50 text-decoration-none"
                  >
                    <i className="fa-solid fa-chevron-right me-2"></i>
                    Fonctionnalités
                  </a>
                </li>
                <li>
                  <a
                    href="#securite"
                    className="text-white-50 text-decoration-none"
                  >
                    <i className="fa-solid fa-chevron-right me-2"></i>
                    Sécurité
                  </a>
                </li>
              </ul>
            </div>
            <div className="col-md-4 mb-4">
              <h6 className="fw-bold mb-3">Contact</h6>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <i className="fa-solid fa-envelope me-2"></i>
                  support@oskar.com
                </li>
                <li className="mb-2">
                  <i className="fa-solid fa-phone me-2"></i>
                  +225 XX XX XX XX
                </li>
                <li>
                  <i className="fa-solid fa-clock me-2"></i>
                  24h/24, 7j/7
                </li>
              </ul>
            </div>
          </div>
          <hr className="text-white-50 my-4" />
          <div className="text-center text-white-50">
            <p className="mb-0">
              © {new Date().getFullYear()} OSKAR - Tous droits réservés.
              <span className="mx-2">•</span>
              <a href="#" className="text-white-50 text-decoration-none">
                Mentions légales
              </a>
              <span className="mx-2">•</span>
              <a href="#" className="text-white-50 text-decoration-none">
                Politique de confidentialité
              </a>
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .bg-gradient {
          background: linear-gradient(135deg, #16a34a 0%, #0d6efd 100%);
        }

        .breadcrumb-light .breadcrumb-item.active {
          color: rgba(255, 255, 255, 0.9);
        }

        .breadcrumb-light .breadcrumb-item a {
          color: rgba(255, 255, 255, 0.8);
        }

        .breadcrumb-light .breadcrumb-item a:hover {
          color: white;
        }

        .nav-pills .nav-link {
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .nav-pills .nav-link.active {
          background: linear-gradient(135deg, #16a34a 0%, #0d6efd 100%);
          color: white;
          box-shadow: 0 5px 15px rgba(22, 163, 74, 0.3);
        }

        .hover-lift {
          transition: all 0.3s ease;
        }

        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
        }

        .step-number {
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .bg-purple {
          background-color: #6f42c1;
        }

        .text-purple {
          color: #6f42c1;
        }

        .accordion-button {
          border-radius: 10px !important;
          font-weight: 500;
        }

        .accordion-button:not(.collapsed) {
          background-color: #f8f9fa;
          color: #16a34a;
        }

        .sticky-top {
          position: sticky;
          top: 20px;
          z-index: 1020;
        }

        .list-group-item-action {
          border-radius: 8px;
          margin-bottom: 5px;
        }

        .list-group-item-action:hover {
          background-color: rgba(22, 163, 74, 0.1);
          color: #16a34a;
        }

        @media (max-width: 768px) {
          .display-4 {
            font-size: 2.5rem;
          }

          .btn-lg {
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
