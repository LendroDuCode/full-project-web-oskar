"use client";

import { useEffect, useRef, useState } from "react";

interface HelpModalUtilisateurProps {
  show: boolean;
  onClose: () => void;
}

export default function HelpModalUtilisateur({
  show,
  onClose,
}: HelpModalUtilisateurProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  // Fermeture avec la touche Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && show) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [show, onClose]);

  // Empêcher le défilement du body quand le modal est ouvert
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [show]);

  const toggleAccordion = (id: string) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  if (!show) return null;

  return (
    <>
      {/* Overlay avec effet de flou */}
      <div
        className="modal-backdrop fade show"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(22,163,74,0.1) 100%)",
          backdropFilter: "blur(5px)",
          zIndex: 1040,
          animation: "fadeIn 0.3s ease-out",
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        style={{
          zIndex: 1050,
          animation: "slideIn 0.3s ease-out",
        }}
        ref={modalRef}
      >
        <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content border-0 shadow-lg overflow-hidden">
            {/* Header avec gradient */}
            <div
              className="modal-header"
              style={{
                background: "linear-gradient(135deg, #16a34a 0%, #0d6efd 100%)",
                borderBottom: "none",
              }}
            >
              <div className="d-flex align-items-center w-100">
                <div className="flex-shrink-0">
                  <div className="bg-white bg-opacity-25 p-3 rounded-circle">
                    <i className="fa-solid fa-circle-question fa-2x text-white"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-4">
                  <h5 className="modal-title fw-bold text-white mb-1">
                    Centre d'Aide - Guide de l'Utilisateur
                  </h5>
                  <p className="text-white-50 mb-0 small">
                    Tout ce que vous devez savoir pour utiliser OSKAR
                    efficacement
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white shadow-sm"
                  onClick={onClose}
                  aria-label="Fermer"
                  style={{
                    filter: "brightness(0) invert(1)",
                    opacity: 0.9,
                  }}
                ></button>
              </div>
            </div>

            {/* Body avec navigation */}
            <div className="modal-body p-0">
              <div className="row g-0 h-100">
                {/* Sidebar de navigation */}
                <div className="col-lg-3 border-end">
                  <div className="sticky-top" style={{ top: "1rem" }}>
                    <div className="p-4">
                      <nav className="nav flex-column">
                        <div className="mb-4">
                          <h6 className="text-uppercase text-muted small fw-bold mb-3">
                            <i className="fa-solid fa-graduation-cap me-2"></i>
                            Sections du guide
                          </h6>
                        </div>
                        <a
                          href="#role"
                          className="nav-link py-2 px-3 mb-2 rounded-3 active"
                        >
                          <i className="fa-solid fa-user me-2"></i>
                          Rôle Utilisateur
                        </a>
                        <a
                          href="#features"
                          className="nav-link py-2 px-3 mb-2 rounded-3"
                        >
                          <i className="fa-solid fa-star me-2"></i>
                          Fonctionnalités
                        </a>
                        <a
                          href="#guides"
                          className="nav-link py-2 px-3 mb-2 rounded-3"
                        >
                          <i className="fa-solid fa-book-open me-2"></i>
                          Guides pratiques
                        </a>
                        <a
                          href="#security"
                          className="nav-link py-2 px-3 mb-2 rounded-3"
                        >
                          <i className="fa-solid fa-shield-halved me-2"></i>
                          Sécurité
                        </a>
                        <a
                          href="#tips"
                          className="nav-link py-2 px-3 rounded-3"
                        >
                          <i className="fa-solid fa-lightbulb me-2"></i>
                          Conseils
                        </a>
                      </nav>

                      <div className="mt-5 pt-4 border-top">
                        <h6 className="text-uppercase text-muted small fw-bold mb-3">
                          <i className="fa-solid fa-download me-2"></i>
                          Ressources
                        </h6>
                        <div className="d-grid gap-2">
                          <button className="btn btn-outline-success btn-sm">
                            <i className="fa-solid fa-file-pdf me-2"></i>
                            Guide PDF
                          </button>
                          <button className="btn btn-outline-primary btn-sm">
                            <i className="fa-solid fa-video me-2"></i>
                            Tutoriels vidéo
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contenu principal */}
                <div className="col-lg-9">
                  <div
                    className="p-4"
                    style={{ maxHeight: "70vh", overflowY: "auto" }}
                  >
                    {/* Section Bienvenue */}
                    <div className="row mb-5" id="role">
                      <div className="col-12">
                        <div className="d-flex align-items-center mb-4">
                          <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                            <i className="fa-solid fa-hand-wave text-success fa-2x"></i>
                          </div>
                          <div>
                            <h4
                              className="fw-bold mb-1"
                              style={{ color: "#16a34a" }}
                            >
                              Bienvenue sur OSKAR !
                            </h4>
                            <p className="text-muted mb-0">
                              La plateforme qui connecte les communautés
                            </p>
                          </div>
                        </div>

                        <div
                          className="alert alert-gradient border-0 shadow-sm mb-4"
                          style={{
                            background:
                              "linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)",
                          }}
                        >
                          <div className="d-flex">
                            <i className="fa-solid fa-quote-left fa-2x text-primary opacity-25 me-3"></i>
                            <div>
                              <p className="lead mb-2">
                                En tant qu'
                                <strong className="text-success">
                                  utilisateur
                                </strong>
                                , vous êtes au cœur de notre communauté. Vous
                                pouvez découvrir, acheter, échanger, et
                                interagir avec les autres membres.
                              </p>
                              <p className="mb-0 text-muted">
                                - L'équipe OSKAR
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-md-4">
                            <div className="text-center mb-4">
                              <div className="bg-success bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                                <i className="fa-solid fa-users fa-2x text-success"></i>
                              </div>
                              <h6 className="fw-bold">Communauté active</h6>
                              <p className="small text-muted mb-0">
                                +10,000 membres
                              </p>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="text-center mb-4">
                              <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                                <i className="fa-solid fa-chart-line fa-2x text-primary"></i>
                              </div>
                              <h6 className="fw-bold">
                                Transactions sécurisées
                              </h6>
                              <p className="small text-muted mb-0">
                                99% de satisfaction
                              </p>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="text-center mb-4">
                              <div className="bg-warning bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                                <i className="fa-solid fa-leaf fa-2x text-warning"></i>
                              </div>
                              <h6 className="fw-bold">Économie circulaire</h6>
                              <p className="small text-muted mb-0">
                                +5,000 échanges
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section Fonctionnalités */}
                    <div className="mb-5" id="features">
                      <h4 className="fw-bold mb-4" style={{ color: "#16a34a" }}>
                        <i className="fa-solid fa-star me-2"></i>
                        Vos Fonctionnalités
                      </h4>

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
                                    catégories. Utilisez nos filtres
                                    intelligents pour trouver exactement ce que
                                    vous cherchez.
                                  </p>
                                  <span className="badge bg-success bg-opacity-10 text-success">
                                    <i className="fa-solid fa-bolt me-1"></i>
                                    Recherche rapide
                                  </span>
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
                                    Publiez vos annonces en quelques clics.
                                    Vendez, donnez ou échangez ce dont vous
                                    n'avez plus besoin avec la communauté.
                                  </p>
                                  <span className="badge bg-warning bg-opacity-10 text-warning">
                                    <i className="fa-solid fa-rocket me-1"></i>
                                    Publication instantanée
                                  </span>
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
                                    Ajoutez des articles à votre panier, suivez
                                    vos commandes et bénéficiez de notre système
                                    de paiement sécurisé.
                                  </p>
                                  <span className="badge bg-info bg-opacity-10 text-info">
                                    <i className="fa-solid fa-shield me-1"></i>
                                    100% sécurisé
                                  </span>
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
                                    Proposez des échanges équitables. C'est
                                    économique, écologique et bénéfique pour
                                    toute la communauté.
                                  </p>
                                  <span className="badge bg-purple bg-opacity-10 text-purple">
                                    <i className="fa-solid fa-recycle me-1"></i>
                                    Économie verte
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section Guides pratiques */}
                    <div className="mb-5" id="guides">
                      <h4 className="fw-bold mb-4" style={{ color: "#16a34a" }}>
                        <i className="fa-solid fa-book-open me-2"></i>
                        Guides Pratiques
                      </h4>

                      <div className="row">
                        <div className="col-12">
                          {/* Accordion amélioré */}
                          <div className="accordion" id="helpAccordion">
                            <div className="accordion-item border-0 shadow-sm mb-3">
                              <h2 className="accordion-header">
                                <button
                                  className={`accordion-button ${activeAccordion === "publish" ? "" : "collapsed"} py-3`}
                                  type="button"
                                  onClick={() => toggleAccordion("publish")}
                                  style={{
                                    background:
                                      activeAccordion === "publish"
                                        ? "linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%)"
                                        : "#fff",
                                  }}
                                >
                                  <div className="d-flex align-items-center w-100">
                                    <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3">
                                      <i className="fa-solid fa-newspaper text-primary"></i>
                                    </div>
                                    <div className="flex-grow-1 text-start">
                                      <span className="fw-bold">
                                        Comment publier une annonce ?
                                      </span>
                                      <span className="badge bg-primary ms-2">
                                        Débutant
                                      </span>
                                    </div>
                                    <i
                                      className={`fa-solid fa-chevron-${activeAccordion === "publish" ? "up" : "down"} text-muted`}
                                    ></i>
                                  </div>
                                </button>
                              </h2>
                              <div
                                className={`accordion-collapse collapse ${activeAccordion === "publish" ? "show" : ""}`}
                              >
                                <div className="accordion-body p-4">
                                  <div className="row">
                                    <div className="col-md-8">
                                      <h6 className="fw-bold mb-3">
                                        Étapes à suivre :
                                      </h6>
                                      <div className="steps">
                                        <div className="step-item d-flex mb-3">
                                          <div
                                            className="step-number bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                                            style={{
                                              width: "32px",
                                              height: "32px",
                                            }}
                                          >
                                            1
                                          </div>
                                          <div>
                                            <p className="fw-medium mb-1">
                                              Cliquez sur "Publier une annonce"
                                            </p>
                                            <p className="text-muted small mb-0">
                                              Disponible dans le header de
                                              navigation
                                            </p>
                                          </div>
                                        </div>
                                        <div className="step-item d-flex mb-3">
                                          <div
                                            className="step-number bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                                            style={{
                                              width: "32px",
                                              height: "32px",
                                            }}
                                          >
                                            2
                                          </div>
                                          <div>
                                            <p className="fw-medium mb-1">
                                              Sélectionnez le type d'annonce
                                            </p>
                                            <p className="text-muted small mb-0">
                                              Vente, don ou échange
                                            </p>
                                          </div>
                                        </div>
                                        <div className="step-item d-flex mb-3">
                                          <div
                                            className="step-number bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                                            style={{
                                              width: "32px",
                                              height: "32px",
                                            }}
                                          >
                                            3
                                          </div>
                                          <div>
                                            <p className="fw-medium mb-1">
                                              Remplissez les informations
                                            </p>
                                            <p className="text-muted small mb-0">
                                              Titre, description, prix,
                                              catégorie
                                            </p>
                                          </div>
                                        </div>
                                        <div className="step-item d-flex mb-3">
                                          <div
                                            className="step-number bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                                            style={{
                                              width: "32px",
                                              height: "32px",
                                            }}
                                          >
                                            4
                                          </div>
                                          <div>
                                            <p className="fw-medium mb-1">
                                              Ajoutez des photos de qualité
                                            </p>
                                            <p className="text-muted small mb-0">
                                              Minimum 3 photos, maximum 10
                                            </p>
                                          </div>
                                        </div>
                                        <div className="step-item d-flex">
                                          <div
                                            className="step-number bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                                            style={{
                                              width: "32px",
                                              height: "32px",
                                            }}
                                          >
                                            5
                                          </div>
                                          <div>
                                            <p className="fw-medium mb-1">
                                              Publiez et partagez
                                            </p>
                                            <p className="text-muted small mb-0">
                                              Votre annonce est maintenant
                                              visible
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-md-4">
                                      <div className="card bg-light border-0">
                                        <div className="card-body">
                                          <h6 className="fw-bold mb-3">
                                            <i className="fa-solid fa-lightbulb text-warning me-2"></i>
                                            Conseils de publication
                                          </h6>
                                          <ul className="small mb-0">
                                            <li className="mb-2">
                                              Utilisez un titre descriptif
                                            </li>
                                            <li className="mb-2">
                                              Photos sous bonne lumière
                                            </li>
                                            <li className="mb-2">
                                              Description détaillée
                                            </li>
                                            <li className="mb-2">
                                              Prix juste et compétitif
                                            </li>
                                            <li>
                                              Répondez rapidement aux messages
                                            </li>
                                          </ul>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="accordion-item border-0 shadow-sm mb-3">
                              <h2 className="accordion-header">
                                <button
                                  className={`accordion-button ${activeAccordion === "security" ? "" : "collapsed"} py-3`}
                                  type="button"
                                  onClick={() => toggleAccordion("security")}
                                  style={{
                                    background:
                                      activeAccordion === "security"
                                        ? "linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%)"
                                        : "#fff",
                                  }}
                                >
                                  <div className="d-flex align-items-center w-100">
                                    <div className="bg-success bg-opacity-10 p-2 rounded-circle me-3">
                                      <i className="fa-solid fa-shield text-success"></i>
                                    </div>
                                    <div className="flex-grow-1 text-start">
                                      <span className="fw-bold">
                                        Sécurité des transactions
                                      </span>
                                      <span className="badge bg-success ms-2">
                                        Important
                                      </span>
                                    </div>
                                    <i
                                      className={`fa-solid fa-chevron-${activeAccordion === "security" ? "up" : "down"} text-muted`}
                                    ></i>
                                  </div>
                                </button>
                              </h2>
                              <div
                                className={`accordion-collapse collapse ${activeAccordion === "security" ? "show" : ""}`}
                              >
                                <div className="accordion-body p-4">
                                  <div className="row">
                                    <div className="col-md-6">
                                      <h6 className="fw-bold mb-3 text-success">
                                        <i className="fa-solid fa-check-circle me-2"></i>
                                        Bonnes pratiques
                                      </h6>
                                      <ul className="list-unstyled mb-0">
                                        <li className="d-flex mb-3">
                                          <i className="fa-solid fa-user-check text-success me-2 mt-1"></i>
                                          <div>
                                            <p className="fw-medium mb-1">
                                              Vérifiez les profils
                                            </p>
                                            <p className="text-muted small mb-0">
                                              Badges de vérification et avis
                                            </p>
                                          </div>
                                        </li>
                                        <li className="d-flex mb-3">
                                          <i className="fa-solid fa-comment-dots text-success me-2 mt-1"></i>
                                          <div>
                                            <p className="fw-medium mb-1">
                                              Utilisez la messagerie
                                            </p>
                                            <p className="text-muted small mb-0">
                                              Communiquez via la plateforme
                                            </p>
                                          </div>
                                        </li>
                                        <li className="d-flex">
                                          <i className="fa-solid fa-flag text-success me-2 mt-1"></i>
                                          <div>
                                            <p className="fw-medium mb-1">
                                              Signalez les problèmes
                                            </p>
                                            <p className="text-muted small mb-0">
                                              Notre équipe vous assiste
                                            </p>
                                          </div>
                                        </li>
                                      </ul>
                                    </div>
                                    <div className="col-md-6">
                                      <div className="card border-danger border-2">
                                        <div className="card-header bg-danger bg-opacity-10 border-danger">
                                          <h6 className="mb-0">
                                            <i className="fa-solid fa-triangle-exclamation text-danger me-2"></i>
                                            À éviter
                                          </h6>
                                        </div>
                                        <div className="card-body">
                                          <ul className="text-danger small mb-0">
                                            <li className="mb-2">
                                              Ne partagez pas d'informations
                                              personnelles
                                            </li>
                                            <li className="mb-2">
                                              Évitez les paiements hors
                                              plateforme
                                            </li>
                                            <li className="mb-2">
                                              Ne communiquez pas vos mots de
                                              passe
                                            </li>
                                            <li>
                                              Méfiez-vous des offres trop
                                              alléchantes
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
                      </div>
                    </div>

                    {/* Section Conseils */}
                    <div id="tips">
                      <h4 className="fw-bold mb-4" style={{ color: "#16a34a" }}>
                        <i className="fa-solid fa-lightbulb me-2"></i>
                        Conseils & Bonnes Pratiques
                      </h4>

                      <div className="row g-4">
                        <div className="col-md-4">
                          <div className="card border-0 bg-warning bg-opacity-5 h-100">
                            <div className="card-body p-4">
                              <div className="text-center mb-3">
                                <div className="bg-warning bg-opacity-10 p-3 rounded-circle d-inline-block">
                                  <i className="fa-solid fa-camera fa-lg text-warning"></i>
                                </div>
                              </div>
                              <h6 className="fw-bold text-center mb-3">
                                Photos de qualité
                              </h6>
                              <ul className="small mb-0">
                                <li className="mb-2">
                                  Bonne lumière naturelle
                                </li>
                                <li className="mb-2">Angles multiples</li>
                                <li className="mb-2">Arrière-plan neutre</li>
                                <li>Détails visibles</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-4">
                          <div className="card border-0 bg-success bg-opacity-5 h-100">
                            <div className="card-body p-4">
                              <div className="text-center mb-3">
                                <div className="bg-success bg-opacity-10 p-3 rounded-circle d-inline-block">
                                  <i className="fa-solid fa-message fa-lg text-success"></i>
                                </div>
                              </div>
                              <h6 className="fw-bold text-center mb-3">
                                Communication efficace
                              </h6>
                              <ul className="small mb-0">
                                <li className="mb-2">Réponses rapides</li>
                                <li className="mb-2">Clarté des messages</li>
                                <li className="mb-2">
                                  Transparence sur l'état
                                </li>
                                <li>Politesse et respect</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-4">
                          <div className="card border-0 bg-info bg-opacity-5 h-100">
                            <div className="card-body p-4">
                              <div className="text-center mb-3">
                                <div className="bg-info bg-opacity-10 p-3 rounded-circle d-inline-block">
                                  <i className="fa-solid fa-star fa-lg text-info"></i>
                                </div>
                              </div>
                              <h6 className="fw-bold text-center mb-3">
                                Réputation
                              </h6>
                              <ul className="small mb-0">
                                <li className="mb-2">Donnez votre avis</li>
                                <li className="mb-2">Notez les transactions</li>
                                <li className="mb-2">Soyez fiable</li>
                                <li>Respectez les engagements</li>
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

            {/* Footer amélioré */}
            <div
              className="modal-footer border-top py-4"
              style={{
                background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
              }}
            >
              <div className="container-fluid">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <div className="row">
                      <div className="col-md-4 mb-3 mb-md-0">
                        <div className="d-flex align-items-center">
                          <i className="fa-solid fa-headset fa-lg text-primary me-3"></i>
                          <div>
                            <p className="fw-bold mb-0">Support 24/7</p>
                            <p className="text-muted small mb-0">
                              support@oskar.com
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4 mb-3 mb-md-0">
                        <div className="d-flex align-items-center">
                          <i className="fa-solid fa-envelope fa-lg text-success me-3"></i>
                          <div>
                            <p className="fw-bold mb-0">Contact</p>
                            <p className="text-muted small mb-0">
                              contact@oskar.com
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="d-flex align-items-center">
                          <i className="fa-solid fa-file-shield fa-lg text-warning me-3"></i>
                          <div>
                            <p className="fw-bold mb-0">Sécurité</p>
                            <p className="text-muted small mb-0">
                              RGPD conforme
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 text-md-end">
                    <div className="d-flex gap-3 justify-content-md-end">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={onClose}
                      >
                        <i className="fa-solid fa-bookmark me-2"></i>
                        Sauvegarder
                      </button>
                      <button
                        type="button"
                        className="btn btn-success px-4"
                        onClick={onClose}
                      >
                        <i className="fa-solid fa-check me-2"></i>
                        J'ai compris
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .bg-purple {
          background-color: #6f42c1;
        }
        .text-purple {
          color: #6f42c1;
        }

        .modal-content {
          border-radius: 20px;
          overflow: hidden;
        }

        .nav-link {
          color: #495057;
          transition: all 0.3s ease;
          border-left: 3px solid transparent;
        }

        .nav-link.active,
        .nav-link:hover {
          color: #16a34a;
          background-color: rgba(22, 163, 74, 0.1);
          border-left-color: #16a34a;
        }

        .accordion-button {
          border-radius: 10px !important;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .accordion-button:not(.collapsed) {
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .hover-lift {
          transition: all 0.3s ease;
        }

        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .step-number {
          font-weight: bold;
          flex-shrink: 0;
        }

        .badge {
          font-size: 0.75em;
          padding: 0.35em 0.65em;
        }

        .alert-gradient {
          border-left: 4px solid #16a34a;
        }

        .card {
          border-radius: 12px;
        }

        .sticky-top {
          position: sticky;
          top: 0;
        }

        /* Scrollbar personnalisée */
        .modal-body::-webkit-scrollbar {
          width: 8px;
        }

        .modal-body::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        .modal-body::-webkit-scrollbar-thumb {
          background: #16a34a;
          border-radius: 4px;
        }

        .modal-body::-webkit-scrollbar-thumb:hover {
          background: #15803d;
        }
      `}</style>
    </>
  );
}
