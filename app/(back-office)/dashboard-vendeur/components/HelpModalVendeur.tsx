"use client";

import { useState, useEffect } from "react";
import { Modal, Button, Tab, Nav, Card, Accordion } from "react-bootstrap";

interface HelpModalVendeurProps {
  show: boolean;
  onClose: () => void;
}

export default function HelpModalVendeur({
  show,
  onClose,
}: HelpModalVendeurProps) {
  const [activeTab, setActiveTab] = useState("guide");

  // Fermeture avec la touche Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && show) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [show, onClose]);

  // SVGs pour embellir
  const StoreSVG = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="me-2"
    >
      <path
        d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 22V12H15V22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const BullhornSVG = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="me-2"
    >
      <path
        d="M18 8C19.6569 8 21 9.34315 21 11C21 12.6569 19.6569 14 18 14"
        stroke="#16a34a"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M2 10L2 14L4.5 14C5.16304 14 5.79893 14.2634 6.26777 14.7322C6.73661 15.2011 7 15.837 7 16.5L7 18.5C7 19.163 6.73661 19.7989 6.26777 20.2678C5.79893 20.7366 5.16304 21 4.5 21H3C2.73478 21 2.48043 20.8946 2.29289 20.7071C2.10536 20.5196 2 20.2652 2 20L2 10Z"
        stroke="#16a34a"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 8L22 5L19 11L22 17L10 14V8Z"
        stroke="#16a34a"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const ChartLineSVG = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="me-2"
    >
      <path
        d="M21 21H4V4"
        stroke="#0d6efd"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 15L10.5 10.5L14.5 14.5L19 9"
        stroke="#0d6efd"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 6H20V10"
        stroke="#0d6efd"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const CheckCircleSVG = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="me-2"
    >
      <path
        d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.86"
        stroke="#198754"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 4L12 14.01L9 11.01"
        stroke="#198754"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const LightbulbSVG = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="me-3"
    >
      <path
        d="M9.663 17H14.337M12 3V2M18.364 5.636L19.071 4.929M21 12H22M4 12H3M6.343 5.343L5.636 4.636M8.464 15.535L12 12M15.535 15.535L12 12M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
        stroke="#0dcaf0"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const BookSVG = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="me-2"
    >
      <path
        d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const NewspaperSVG = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="me-2"
    >
      <path
        d="M19 20H5C3.89543 20 3 19.1046 3 18L3 6C3 4.89543 3.89543 4 5 4L15 4C16.1046 4 17 4.89543 17 6V18C17 19.1046 17.8954 20 19 20ZM17 8H21C21.5523 8 22 8.44772 22 9V19C22 20.1046 21.1046 21 20 21H17V8Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const QuestionSVG = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="me-2"
    >
      <path
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.08984 9C9.32495 8.33167 9.789 7.76811 10.3998 7.40913C11.0106 7.05016 11.7287 6.91894 12.427 7.03871C13.1253 7.15849 13.7588 7.52152 14.2149 8.06353C14.671 8.60553 14.9209 9.29152 14.9198 10C14.9198 12 11.9198 13 11.9198 13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 17H12.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <Modal
      show={show}
      onHide={onClose}
      size="lg"
      centered
      backdrop="static"
      keyboard={false}
      aria-labelledby="help-modal-title"
      className="border-0 shadow-lg"
    >
      {/* Header avec gradient */}
      <Modal.Header className="border-0 bg-gradient-to-r from-success to-emerald-600 text-white position-relative">
        <div className="position-absolute top-0 end-0 opacity-25 me-3">
          <StoreSVG />
        </div>
        <Modal.Title id="help-modal-title" className="h5 fw-bold">
          <i className="fa-solid fa-circle-question me-2"></i>
          Centre d'aide Vendeur OSKAR
        </Modal.Title>
        <Button
          variant="link"
          onClick={onClose}
          className="position-absolute top-0 end-0 p-3 text-white"
          aria-label="Fermer"
        >
          <i className="fa-solid fa-times fs-5"></i>
        </Button>
      </Modal.Header>

      <Modal.Body className="p-0">
        <Tab.Container
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k || "guide")}
        >
          {/* Navigation stylisée */}
          <Nav
            variant="pills"
            className="px-4 pt-3 bg-light border-bottom"
            style={{ gap: "1px" }}
          >
            <Nav.Item>
              <Nav.Link
                eventKey="guide"
                className={`rounded-3 px-4 py-2 border-0 ${activeTab === "guide" ? "bg-success text-white shadow-sm" : "bg-white text-dark border"}`}
              >
                <BookSVG />
                Guide d'utilisation
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="annonces"
                className={`rounded-3 px-4 py-2 border-0 ${activeTab === "annonces" ? "bg-success text-white shadow-sm" : "bg-white text-dark border"}`}
              >
                <NewspaperSVG />
                Gestion des annonces
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="faq"
                className={`rounded-3 px-4 py-2 border-0 ${activeTab === "faq" ? "bg-success text-white shadow-sm" : "bg-white text-dark border"}`}
              >
                <QuestionSVG />
                FAQ
              </Nav.Link>
            </Nav.Item>
          </Nav>

          {/* Contenu avec animations */}
          <Tab.Content
            className="p-4"
            style={{ maxHeight: "500px", overflowY: "auto" }}
          >
            {/* Onglet Guide */}
            <Tab.Pane eventKey="guide" className="fade">
              <div className="text-center mb-4">
                <div className="d-inline-block p-3 bg-success bg-opacity-10 rounded-circle mb-3">
                  <StoreSVG />
                </div>
                <h4 className="text-success fw-bold mb-3">
                  Bienvenue sur votre espace Vendeur
                </h4>
                <p className="text-muted lead">
                  Gérez vos annonces, communiquez avec les acheteurs et
                  maximisez vos ventes
                </p>
              </div>

              <div className="row g-4 mb-4">
                {/* Carte Publication */}
                <div className="col-md-6">
                  <Card className="border-0 shadow-sm h-100 hover-lift">
                    <Card.Body className="p-4">
                      <div className="d-flex align-items-center mb-3">
                        <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                          <BullhornSVG />
                        </div>
                        <h5 className="ms-3 mb-0 text-success fw-bold">
                          Publication d'annonces
                        </h5>
                      </div>
                      <ul className="list-unstyled mb-0">
                        {[
                          "Cliquez sur 'Publier une annonce'",
                          "Remplissez le formulaire détaillé",
                          "Ajoutez des photos de qualité",
                          "Fixez un prix compétitif",
                          "Choisissez la bonne catégorie",
                        ].map((item, idx) => (
                          <li
                            key={idx}
                            className="mb-2 d-flex align-items-start"
                          >
                            <CheckCircleSVG />
                            <span className="text-dark">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </Card.Body>
                  </Card>
                </div>

                {/* Carte Gestion */}
                <div className="col-md-6">
                  <Card className="border-0 shadow-sm h-100 hover-lift">
                    <Card.Body className="p-4">
                      <div className="d-flex align-items-center mb-3">
                        <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                          <ChartLineSVG />
                        </div>
                        <h5 className="ms-3 mb-0 text-primary fw-bold">
                          Gestion des ventes
                        </h5>
                      </div>
                      <ul className="list-unstyled mb-0">
                        {[
                          "Suivez vos annonces en ligne",
                          "Gérez les demandes d'achat",
                          "Consultez vos statistiques",
                          "Répondez aux messages rapidement",
                          "Mettez à jour vos prix régulièrement",
                        ].map((item, idx) => (
                          <li
                            key={idx}
                            className="mb-2 d-flex align-items-start"
                          >
                            <CheckCircleSVG />
                            <span className="text-dark">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </Card.Body>
                  </Card>
                </div>
              </div>

              {/* Section Astuce */}
              <Card className="border-0 bg-info bg-opacity-10">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-start">
                    <div className="flex-shrink-0">
                      <LightbulbSVG />
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h5 className="text-info fw-bold mb-3">
                        <i className="fa-solid fa-lightbulb me-2"></i>
                        Astuces pour augmenter vos ventes
                      </h5>
                      <div className="row">
                        <div className="col-md-6">
                          <ul className="text-dark mb-3 mb-md-0">
                            <li className="mb-2">
                              Vérifiez régulièrement vos annonces
                            </li>
                            <li className="mb-2">
                              Répondez dans les 24 heures
                            </li>
                            <li>Mettez à jour les photos périodiquement</li>
                          </ul>
                        </div>
                        <div className="col-md-6">
                          <ul className="text-dark">
                            <li className="mb-2">
                              Proposez un prix compétitif
                            </li>
                            <li className="mb-2">
                              Soyez transparent sur l'état
                            </li>
                            <li>Activez les notifications</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Tab.Pane>

            {/* Onglet Annonces */}
            <Tab.Pane eventKey="annonces" className="fade">
              <div className="text-center mb-4">
                <h4 className="text-success fw-bold mb-3">
                  Gestion complète de vos annonces
                </h4>
                <p className="text-muted">
                  Optimisez la visibilité et maximisez les chances de vente de
                  vos produits
                </p>
              </div>

              <Accordion defaultActiveKey="0" className="mb-4">
                {/* Création */}
                <Accordion.Item
                  eventKey="0"
                  className="border-0 mb-3 shadow-sm"
                >
                  <Accordion.Header className="bg-light">
                    <div className="d-flex align-items-center">
                      <div className="bg-success bg-opacity-10 p-2 rounded-circle me-3">
                        <i className="fa-solid fa-plus-circle text-success"></i>
                      </div>
                      <h6 className="mb-0 fw-bold">
                        Créer une annonce efficace
                      </h6>
                    </div>
                  </Accordion.Header>
                  <Accordion.Body className="bg-white">
                    <div className="row">
                      {[
                        {
                          title: "Photos",
                          desc: "Minimum 3 photos claires et bien éclairées",
                          icon: "fa-camera",
                        },
                        {
                          title: "Titre",
                          desc: "Descriptif et précis (10-15 mots)",
                          icon: "fa-heading",
                        },
                        {
                          title: "Description",
                          desc: "Détaillée avec état et caractéristiques",
                          icon: "fa-align-left",
                        },
                        {
                          title: "Prix",
                          desc: "Comparé avec le marché actuel",
                          icon: "fa-tag",
                        },
                      ].map((item, idx) => (
                        <div key={idx} className="col-md-6 mb-3">
                          <div className="d-flex align-items-start">
                            <div className="bg-success bg-opacity-10 p-2 rounded-circle me-3">
                              <i
                                className={`fa-solid ${item.icon} text-success`}
                              ></i>
                            </div>
                            <div>
                              <strong className="d-block text-dark">
                                {item.title}
                              </strong>
                              <small className="text-muted">{item.desc}</small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Accordion.Body>
                </Accordion.Item>

                {/* Optimisation */}
                <Accordion.Item
                  eventKey="1"
                  className="border-0 mb-3 shadow-sm"
                >
                  <Accordion.Header className="bg-light">
                    <div className="d-flex align-items-center">
                      <div className="bg-warning bg-opacity-10 p-2 rounded-circle me-3">
                        <i className="fa-solid fa-rocket text-warning"></i>
                      </div>
                      <h6 className="mb-0 fw-bold">Optimiser la visibilité</h6>
                    </div>
                  </Accordion.Header>
                  <Accordion.Body className="bg-white">
                    <div className="row">
                      <div className="col-md-6">
                        <Card className="border-success border-2">
                          <Card.Body>
                            <h6 className="text-success fw-bold">
                              <i className="fa-solid fa-check-circle me-2"></i>
                              Gratuit
                            </h6>
                            <ul className="mt-3 mb-0">
                              <li className="mb-2">Mise à jour régulière</li>
                              <li className="mb-2">
                                Réponse rapide aux messages
                              </li>
                              <li className="mb-2">Mots-clés pertinents</li>
                              <li>Photos supplémentaires</li>
                            </ul>
                          </Card.Body>
                        </Card>
                      </div>
                      <div className="col-md-6">
                        <Card className="border-warning border-2">
                          <Card.Body>
                            <h6 className="text-warning fw-bold">
                              <i className="fa-solid fa-crown me-2"></i>
                              Premium
                            </h6>
                            <ul className="mt-3 mb-0">
                              <li className="mb-2">
                                Mise en avant prioritaire
                              </li>
                              <li className="mb-2">Badge Premium visible</li>
                              <li className="mb-2">Statistiques détaillées</li>
                              <li>Support prioritaire</li>
                            </ul>
                          </Card.Body>
                        </Card>
                      </div>
                    </div>
                  </Accordion.Body>
                </Accordion.Item>

                {/* Suivi */}
                <Accordion.Item eventKey="2" className="border-0 shadow-sm">
                  <Accordion.Header className="bg-light">
                    <div className="d-flex align-items-center">
                      <div className="bg-info bg-opacity-10 p-2 rounded-circle me-3">
                        <i className="fa-solid fa-chart-bar text-info"></i>
                      </div>
                      <h6 className="mb-0 fw-bold">Suivi des performances</h6>
                    </div>
                  </Accordion.Header>
                  <Accordion.Body className="bg-white">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-info bg-opacity-10 p-3 rounded-circle me-3">
                        <i className="fa-solid fa-eye text-info fs-4"></i>
                      </div>
                      <div>
                        <h6 className="mb-1">Suivi en temps réel</h6>
                        <p className="text-muted mb-0">
                          Consultez les statistiques de vos annonces directement
                          depuis votre tableau de bord
                        </p>
                      </div>
                    </div>
                    <div className="row">
                      {[
                        "Nombre de vues par annonce",
                        "Demandes d'informations reçues",
                        "Statistiques de vente mensuelles",
                        "Notifications pour nouvelles interactions",
                        "Taux de conversion",
                      ].map((item, idx) => (
                        <div key={idx} className="col-md-6 mb-2">
                          <div className="d-flex align-items-center">
                            <i className="fa-solid fa-chevron-right text-success me-2"></i>
                            <span>{item}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </Tab.Pane>

            {/* Onglet FAQ */}
            <Tab.Pane eventKey="faq" className="fade">
              <div className="text-center mb-4">
                <div className="d-inline-block p-3 bg-success bg-opacity-10 rounded-circle mb-3">
                  <i className="fa-solid fa-question-circle text-success fs-1"></i>
                </div>
                <h4 className="text-success fw-bold mb-3">
                  Questions Fréquemment Posées
                </h4>
                <p className="text-muted">
                  Trouvez rapidement les réponses à vos interrogations
                </p>
              </div>

              <div className="row g-4">
                {[
                  {
                    question: "Comment devenir vendeur vérifié ?",
                    answer:
                      "La vérification se fait automatiquement après quelques ventes réussies. Vous pouvez accélérer le processus en complétant votre profil avec des documents d'identité.",
                    icon: "fa-shield-check",
                  },
                  {
                    question: "Quelles sont les commissions sur les ventes ?",
                    answer:
                      "Vendeurs standard : 5% de commission. Vendeurs premium : 3% seulement. Aucun frais de publication.",
                    icon: "fa-percentage",
                  },
                  {
                    question: "Comment gérer les retours ou litiges ?",
                    answer:
                      "OSKAR dispose d'un système de médiation. Notre équipe examine chaque situation pour trouver une solution équitable.",
                    icon: "fa-balance-scale",
                  },
                  {
                    question:
                      "Puis-je vendre des produits neufs et d'occasion ?",
                    answer:
                      "Oui, vous pouvez vendre les deux types. Indiquez clairement l'état et choisissez la catégorie appropriée.",
                    icon: "fa-boxes",
                  },
                  {
                    question: "Comment contacter le support ?",
                    answer:
                      "Email: support@oskar.com | Téléphone: +33 1 23 45 67 89 | Chat: disponible 9h-18h | Formulaire dans votre espace",
                    icon: "fa-headset",
                  },
                  {
                    question: "Quels sont les avantages du compte Premium ?",
                    answer:
                      "Mise en avant prioritaire, badge visible, statistiques avancées, support prioritaire et commissions réduites.",
                    icon: "fa-crown",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="col-md-6">
                    <Card className="border-0 shadow-sm h-100 hover-lift">
                      <Card.Body className="p-4">
                        <div className="d-flex align-items-start mb-3">
                          <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                            <i
                              className={`fa-solid ${item.icon} text-success`}
                            ></i>
                          </div>
                          <div>
                            <h6 className="fw-bold text-dark mb-2">
                              {item.question}
                            </h6>
                            <p className="text-muted mb-0">{item.answer}</p>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Modal.Body>

      {/* Footer avec actions */}
      <Modal.Footer className="border-top bg-light py-3 px-4">
        <div className="d-flex justify-content-between align-items-center w-100">
          <div className="d-flex align-items-center">
            <div className="bg-success bg-opacity-10 p-2 rounded-circle me-3">
              <i className="fa-solid fa-phone text-success"></i>
            </div>
            <div>
              <small className="text-muted d-block">Support disponible</small>
              <strong className="text-dark">+33 1 23 45 67 89</strong>
            </div>
          </div>
          <div className="d-flex gap-3">
            <Button
              variant="outline-secondary"
              onClick={onClose}
              className="px-4 py-2"
            >
              <i className="fa-solid fa-times me-2"></i>
              Fermer
            </Button>
            <Button
              variant="success"
              onClick={() => window.open("/documentation-vendeur", "_blank")}
              className="px-4 py-2"
            >
              <i className="fa-solid fa-book-open me-2"></i>
              Documentation
            </Button>
          </div>
        </div>
      </Modal.Footer>

      <style jsx>{`
        .hover-lift {
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
        }

        .bg-gradient-to-r {
          background: linear-gradient(135deg, #198754 0%, #146c43 100%);
        }

        .modal-header {
          border-radius: 0.5rem 0.5rem 0 0 !important;
        }

        .nav-pills .nav-link.active {
          box-shadow: 0 4px 6px rgba(25, 135, 84, 0.2);
        }

        .accordion-button:not(.collapsed) {
          background-color: rgba(25, 135, 84, 0.05);
          color: #198754;
        }

        .accordion-button:focus {
          box-shadow: 0 0 0 0.25rem rgba(25, 135, 84, 0.25);
        }

        .fade {
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .modal-dialog {
            margin: 1rem;
          }

          .nav-pills {
            flex-direction: column;
            gap: 8px !important;
          }

          .nav-pills .nav-link {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </Modal>
  );
}
