"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Tab,
  Nav,
  Card,
  ProgressBar,
  Row,
  Col,
  Badge,
  ListGroup,
  Alert,
  Accordion,
} from "react-bootstrap";

interface HelpModalVendeurProps {
  show: boolean;
  onClose: () => void;
}

export default function HelpModalVendeur({
  show,
  onClose,
}: HelpModalVendeurProps) {
  const [activeTab, setActiveTab] = useState("overview");

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

  // Statistiques de progression simulées
  const userProgress = {
    sales: 75,
    listings: 60,
    ratings: 90,
    response: 85,
    exchanges: 40,
    donations: 25,
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      size="xl"
      centered
      backdrop="static"
      keyboard={false}
      dialogClassName="modal-90w"
      aria-labelledby="help-modal-title"
      className="border-0"
    >
      {/* Header avec fond vert transparent */}
      <div className="bg-success bg-opacity-10 position-relative border-bottom">
        <div className="container-fluid py-4">
          <div className="row align-items-center">
            <div className="col">
              <h4 className="mb-0 text-success fw-bold">
                <i className="fas fa-store me-2"></i>
                Centre d'Expertise Vendeur OSKAR
              </h4>
              <small className="text-success text-opacity-75">
                Guide complet pour maîtriser les ventes, échanges et dons
              </small>
            </div>
            <div className="col-auto">
              <Button
                variant="link"
                onClick={onClose}
                className="text-success p-0"
                aria-label="Fermer"
              >
                <i className="fas fa-times fa-lg"></i>
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation horizontale */}
        <Nav
          variant="pills"
          className="px-4 pb-3"
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k || "overview")}
        >
          <Nav.Item className="me-2 mb-2">
            <Nav.Link
              eventKey="overview"
              className={`rounded-pill px-4 py-2 ${activeTab === "overview" ? "bg-success text-white shadow-sm" : "bg-white text-success border-success"}`}
            >
              <i className="fas fa-home me-2"></i>
              Vue d'ensemble
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className="me-2 mb-2">
            <Nav.Link
              eventKey="sales"
              className={`rounded-pill px-4 py-2 ${activeTab === "sales" ? "bg-primary text-white shadow-sm" : "bg-white text-primary border-primary"}`}
            >
              <i className="fas fa-shopping-bag me-2"></i>
              Guide des Ventes
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className="me-2 mb-2">
            <Nav.Link
              eventKey="exchanges"
              className={`rounded-pill px-4 py-2 ${activeTab === "exchanges" ? "bg-warning text-white shadow-sm" : "bg-white text-warning border-warning"}`}
            >
              <i className="fas fa-exchange-alt me-2"></i>
              Guide des Échanges
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className="me-2 mb-2">
            <Nav.Link
              eventKey="donations"
              className={`rounded-pill px-4 py-2 ${activeTab === "donations" ? "bg-info text-white shadow-sm" : "bg-white text-info border-info"}`}
            >
              <i className="fas fa-heart me-2"></i>
              Guide des Dons
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className="mb-2">
            <Nav.Link
              eventKey="performance"
              className={`rounded-pill px-4 py-2 ${activeTab === "performance" ? "bg-dark text-white shadow-sm" : "bg-white text-dark border-dark"}`}
            >
              <i className="fas fa-chart-line me-2"></i>
              Performance
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </div>

      <Modal.Body className="p-0 bg-light">
        <Tab.Container activeKey={activeTab}>
          <Tab.Content className="min-vh-50">
            {/* Vue d'ensemble */}
            <Tab.Pane eventKey="overview" className="fade">
              <div className="container-fluid py-5">
                <Row className="mb-5">
                  <Col lg={8}>
                    <div className="mb-5">
                      <h2 className="fw-bold mb-4 text-success">
                        Bienvenue dans votre Espace Vendeur OSKAR
                      </h2>
                      <p className="text-dark fs-5 mb-4">
                        OSKAR révolutionne la manière dont vous gérez vos
                        transactions en ligne. Notre plateforme unique vous
                        permet non seulement de vendre, mais aussi d'échanger
                        vos articles et de faire des dons solidaires, le tout
                        dans un environnement sécurisé et optimisé pour votre
                        succès.
                      </p>

                      <div className="bg-success bg-opacity-10 p-4 rounded-3 mb-4">
                        <h5 className="text-success fw-bold mb-3">
                          <i className="fas fa-lightbulb me-2"></i>
                          Pourquoi choisir OSKAR comme vendeur ?
                        </h5>
                        <p className="mb-0">
                          Contrairement aux plateformes traditionnelles, OSKAR
                          vous offre une approche tri-dimensionnelle : générez
                          des revenus directs par les ventes, renouvelez votre
                          inventaire sans dépenser via les échanges, et
                          contribuez à l'économie circulaire grâce aux dons tout
                          en bénéficiant d'avantages fiscaux.
                        </p>
                      </div>
                    </div>

                    <Row className="g-4 mb-5">
                      <Col md={4}>
                        <Card className="border-success border-2 shadow-sm h-100">
                          <Card.Body className="p-4">
                            <div className="d-flex align-items-center mb-3">
                              <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                                <i className="fas fa-coins fa-2x text-success"></i>
                              </div>
                              <div className="ms-3">
                                <h5 className="mb-0 fw-bold">
                                  Ventes Lucratives
                                </h5>
                                <small className="text-muted">
                                  Revenus optimisés
                                </small>
                              </div>
                            </div>
                            <p className="text-dark mb-3">
                              Notre système de vente intelligent analyse le
                              marché en temps réel pour vous suggérer les prix
                              les plus compétitifs. Les commissions sont
                              réduites pour les vendeurs actifs, et notre
                              système de paiement sécurisé garantit des
                              transactions sans risque.
                            </p>
                            <Badge bg="success" className="rounded-pill">
                              <i className="fas fa-rocket me-1"></i>
                              Conversion élevée
                            </Badge>
                          </Card.Body>
                        </Card>
                      </Col>

                      <Col md={4}>
                        <Card className="border-warning border-2 shadow-sm h-100">
                          <Card.Body className="p-4">
                            <div className="d-flex align-items-center mb-3">
                              <div className="bg-warning bg-opacity-10 p-3 rounded-circle">
                                <i className="fas fa-exchange-alt fa-2x text-warning"></i>
                              </div>
                              <div className="ms-3">
                                <h5 className="mb-0 fw-bold">
                                  Échanges Intelligents
                                </h5>
                                <small className="text-muted">
                                  Renouvellement gratuit
                                </small>
                              </div>
                            </div>
                            <p className="text-dark mb-3">
                              L'échange OSKAR utilise une IA avancée pour
                              évaluer avec précision la valeur de vos articles
                              et trouver des correspondances parfaites. C'est la
                              solution idéale pour renouveler votre stock sans
                              débourser d'argent et sans commission sur la
                              transaction.
                            </p>
                            <Badge bg="warning" className="rounded-pill">
                              <i className="fas fa-sync me-1"></i>
                              Économie circulaire
                            </Badge>
                          </Card.Body>
                        </Card>
                      </Col>

                      <Col md={4}>
                        <Card className="border-info border-2 shadow-sm h-100">
                          <Card.Body className="p-4">
                            <div className="d-flex align-items-center mb-3">
                              <div className="bg-info bg-opacity-10 p-3 rounded-circle">
                                <i className="fas fa-hands-helping fa-2x text-info"></i>
                              </div>
                              <div className="ms-3">
                                <h5 className="mb-0 fw-bold">Dons Rémunérés</h5>
                                <small className="text-muted">
                                  Impact social et fiscal
                                </small>
                              </div>
                            </div>
                            <p className="text-dark mb-3">
                              Transformez vos invendus en actes de générosité
                              récompensés. OSKAR vous fournit un certificat de
                              don fiscal, augmente votre visibilité avec un
                              badge solidaire, et vous connecte avec des
                              associations vérifiées. Votre générosité est
                              valorisée et reconnue.
                            </p>
                            <Badge bg="info" className="rounded-pill">
                              <i className="fas fa-award me-1"></i>
                              Reconnaissance sociale
                            </Badge>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    <Card className="border-0 shadow-sm mb-4">
                      <Card.Body className="p-4">
                        <h5 className="fw-bold mb-4 text-success">
                          <i className="fas fa-road me-2"></i>
                          Parcours de Démarrage Recommandé
                        </h5>
                        <p className="text-dark mb-4">
                          Pour maximiser vos résultats sur OSKAR, nous
                          recommandons cette progression étape par étape. Chaque
                          niveau débloque de nouvelles fonctionnalités et
                          avantages.
                        </p>

                        <ListGroup variant="flush">
                          {[
                            {
                              step: "1",
                              title: "Profil Vendeur Complet",
                              desc: "Complétez toutes les informations de votre profil, y compris vos méthodes de paiement préférées et vos préférences de livraison.",
                              icon: "fa-user-check",
                            },
                            {
                              step: "2",
                              title: "Premières Publications",
                              desc: "Commencez avec 3-5 annonces de qualité en suivant nos recommandations de photos et descriptions.",
                              icon: "fa-bullhorn",
                            },
                            {
                              step: "3",
                              title: "Optimisation des Prix",
                              desc: "Utilisez notre outil d'analyse de marché pour ajuster vos prix et augmenter votre compétitivité.",
                              icon: "fa-chart-line",
                            },
                            {
                              step: "4",
                              title: "Diversification",
                              desc: "Explorez les options d'échange et de don pour maximiser la valeur de votre inventaire.",
                              icon: "fa-layer-group",
                            },
                            {
                              step: "5",
                              title: "Performance Avancée",
                              desc: "Analysez vos statistiques détaillées et implémentez nos stratégies pro pour booster vos résultats.",
                              icon: "fa-trophy",
                            },
                          ].map((item, index) => (
                            <ListGroup.Item
                              key={index}
                              className="border-0 py-3"
                            >
                              <div className="d-flex align-items-start">
                                <div
                                  className={`rounded-circle p-3 me-3 ${index < 2 ? "bg-success text-white" : "bg-light"}`}
                                >
                                  <i className={`fas ${item.icon}`}></i>
                                </div>
                                <div className="flex-grow-1">
                                  <div className="d-flex align-items-center mb-2">
                                    <Badge
                                      bg={index < 2 ? "success" : "secondary"}
                                      className="me-2"
                                    >
                                      Étape {item.step}
                                    </Badge>
                                    <h6 className="mb-0 fw-bold">
                                      {item.title}
                                    </h6>
                                  </div>
                                  <p className="text-muted mb-0">{item.desc}</p>
                                </div>
                                {index < 2 ? (
                                  <Badge bg="success" className="rounded-pill">
                                    <i className="fas fa-check me-1"></i>
                                    Complété
                                  </Badge>
                                ) : (
                                  <Badge
                                    bg="light"
                                    text="dark"
                                    className="rounded-pill"
                                  >
                                    En attente
                                  </Badge>
                                )}
                              </div>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col lg={4}>
                    <Card
                      className="border-0 shadow-sm sticky-top"
                      style={{ top: "20px" }}
                    >
                      <Card.Body className="p-4">
                        <h5 className="fw-bold mb-4 text-success">
                          <i className="fas fa-chart-simple me-2"></i>
                          Votre Progression Globale
                        </h5>
                        <p className="text-muted mb-4">
                          Suivez votre évolution sur les différentes dimensions
                          de la plateforme OSKAR. Ces indicateurs vous aident à
                          identifier les domaines à améliorer.
                        </p>

                        <div className="mb-4">
                          <div className="d-flex justify-content-between mb-2">
                            <span className="text-dark">
                              <i className="fas fa-shopping-cart me-1 text-primary"></i>
                              Compétence Ventes
                            </span>
                            <span className="fw-bold">
                              {userProgress.sales}%
                            </span>
                          </div>
                          <ProgressBar
                            now={userProgress.sales}
                            variant="primary"
                            className="mb-3"
                          />

                          <div className="d-flex justify-content-between mb-2">
                            <span className="text-dark">
                              <i className="fas fa-bullhorn me-1 text-success"></i>
                              Qualité Annonces
                            </span>
                            <span className="fw-bold">
                              {userProgress.listings}%
                            </span>
                          </div>
                          <ProgressBar
                            now={userProgress.listings}
                            variant="success"
                            className="mb-3"
                          />

                          <div className="d-flex justify-content-between mb-2">
                            <span className="text-dark">
                              <i className="fas fa-star me-1 text-warning"></i>
                              Satisfaction Clients
                            </span>
                            <span className="fw-bold">
                              {userProgress.ratings}%
                            </span>
                          </div>
                          <ProgressBar
                            now={userProgress.ratings}
                            variant="warning"
                            className="mb-3"
                          />

                          <div className="d-flex justify-content-between mb-2">
                            <span className="text-dark">
                              <i className="fas fa-reply me-1 text-info"></i>
                              Rapidité Réponse
                            </span>
                            <span className="fw-bold">
                              {userProgress.response}%
                            </span>
                          </div>
                          <ProgressBar
                            now={userProgress.response}
                            variant="info"
                            className="mb-3"
                          />

                          <div className="d-flex justify-content-between mb-2">
                            <span className="text-dark">
                              <i className="fas fa-exchange-alt me-1 text-danger"></i>
                              Maîtrise Échanges
                            </span>
                            <span className="fw-bold">
                              {userProgress.exchanges}%
                            </span>
                          </div>
                          <ProgressBar
                            now={userProgress.exchanges}
                            variant="danger"
                            className="mb-3"
                          />

                          <div className="d-flex justify-content-between mb-2">
                            <span className="text-dark">
                              <i className="fas fa-heart me-1 text-purple"></i>
                              Engagement Dons
                            </span>
                            <span className="fw-bold">
                              {userProgress.donations}%
                            </span>
                          </div>
                          <ProgressBar
                            now={userProgress.donations}
                            className="mb-3"
                            style={{ backgroundColor: "#6f42c1" }}
                          />
                        </div>

                        <Alert
                          variant="success"
                          className="border-0 bg-success bg-opacity-10"
                        >
                          <i className="fas fa-trophy me-2 text-success"></i>
                          <strong>Niveau actuel : Vendeur Intermédiaire</strong>
                          <p className="mb-0 mt-1">
                            Continuez sur cette voie pour débloquer le statut
                            "Vendeur Premium" avec des commissions réduites.
                          </p>
                        </Alert>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </div>
            </Tab.Pane>

            {/* Guide Ventes */}
            <Tab.Pane eventKey="sales" className="fade">
              <div className="container-fluid py-5">
                <Row>
                  <Col lg={8}>
                    <div className="mb-5">
                      <h2 className="fw-bold mb-3 text-primary">
                        <i className="fas fa-shopping-bag me-2"></i>
                        Expertise Ventes Avancée
                      </h2>
                      <p className="text-dark fs-5">
                        La vente sur OSKAR va bien au-delà de la simple
                        publication d'annonces. C'est un écosystème complet
                        conçu pour maximiser votre rentabilité tout en
                        minimisant vos efforts.
                      </p>

                      <div className="bg-primary bg-opacity-10 p-4 rounded-3 mb-4">
                        <h5 className="text-primary fw-bold mb-3">
                          <i className="fas fa-crown me-2"></i>
                          Le Secret des Vendeurs Succès OSKAR
                        </h5>
                        <p className="mb-0">
                          Les vendeurs les plus performants sur notre plateforme
                          combinent trois éléments clés : une stratégie de prix
                          dynamique, une communication proactive, et une
                          optimisation constante basée sur les données
                          analytiques que nous fournissons gratuitement.
                        </p>
                      </div>
                    </div>

                    <div className="row g-4">
                      <div className="col-12">
                        <Card className="border-primary border-2 shadow-sm">
                          <Card.Body className="p-4">
                            <h4 className="fw-bold mb-4 text-primary">
                              <i className="fas fa-chart-line me-2"></i>
                              Stratégies de Prix Scientifiques
                            </h4>
                            <p className="text-dark mb-4">
                              Notre algorithme analyse en temps réel des
                              milliers de données pour vous suggérer la
                              stratégie de prix optimale selon le type de
                              produit, la saisonnalité, et la demande du marché.
                            </p>

                            <Row className="g-4">
                              {[
                                {
                                  title: "Analyse Concurrence Dynamique",
                                  desc: "Surveillance automatique des prix concurrents avec alertes en temps réel pour ajustements stratégiques",
                                  icon: "fa-search-dollar",
                                },
                                {
                                  title: "Prix Psychologique Intelligent",
                                  desc: "Optimisation automatique des prix finaux (ex: 199€ au lieu de 200€) pour maximiser l'attractivité",
                                  icon: "fa-brain",
                                },
                                {
                                  title: "Stratégie Bundle Avancée",
                                  desc: "Suggestions automatiques de packages de produits complémentaires pour augmenter le panier moyen",
                                  icon: "fa-boxes",
                                },
                                {
                                  title: "Négociation Assistée",
                                  desc: "Outils intégrés pour gérer les offres avec marge de négociation calculée automatiquement",
                                  icon: "fa-handshake",
                                },
                              ].map((item, idx) => (
                                <Col md={6} key={idx}>
                                  <div className="d-flex align-items-start p-3 bg-primary bg-opacity-5 rounded-3 h-100">
                                    <i
                                      className={`fas ${item.icon} fa-2x text-primary me-3`}
                                    ></i>
                                    <div>
                                      <h6 className="fw-bold mb-2 text-primary">
                                        {item.title}
                                      </h6>
                                      <small className="text-dark">
                                        {item.desc}
                                      </small>
                                    </div>
                                  </div>
                                </Col>
                              ))}
                            </Row>
                          </Card.Body>
                        </Card>
                      </div>

                      <div className="col-12 mt-4">
                        <Card className="border-success border-2 shadow-sm">
                          <Card.Body className="p-4">
                            <h4 className="fw-bold mb-4 text-success">
                              <i className="fas fa-camera me-2"></i>
                              Standards Photographiques Professionnels
                            </h4>
                            <p className="text-dark mb-4">
                              La qualité des photos est le facteur numéro 1 de
                              conversion sur OSKAR. Nos études montrent que les
                              annonces avec des photos professionnelles voient
                              leur taux de conversion augmenter de 300%.
                            </p>

                            <Row className="g-4">
                              <Col md={6}>
                                <div className="bg-success bg-opacity-5 p-4 rounded-3 h-100">
                                  <h6 className="fw-bold text-success mb-3">
                                    <i className="fas fa-check-circle me-2"></i>
                                    Checklist Photo Obligatoire
                                  </h6>
                                  <ListGroup variant="flush">
                                    <ListGroup.Item className="border-0 py-2 bg-transparent">
                                      <i className="fas fa-sun text-warning me-2"></i>
                                      <strong>
                                        Lumière naturelle abondante :
                                      </strong>{" "}
                                      Évitez les flashs et lumières
                                      artificielles
                                    </ListGroup.Item>
                                    <ListGroup.Item className="border-0 py-2 bg-transparent">
                                      <i className="fas fa-th-large text-success me-2"></i>
                                      <strong>Fond neutre unifié :</strong>{" "}
                                      Blanc ou gris clair sans distractions
                                    </ListGroup.Item>
                                    <ListGroup.Item className="border-0 py-2 bg-transparent">
                                      <i className="fas fa-arrows-alt text-primary me-2"></i>
                                      <strong>5 angles minimum :</strong> Face,
                                      dos, côtés, dessus, et détail
                                      caractéristique
                                    </ListGroup.Item>
                                  </ListGroup>
                                </div>
                              </Col>

                              <Col md={6}>
                                <div className="bg-warning bg-opacity-5 p-4 rounded-3 h-100">
                                  <h6 className="fw-bold text-warning mb-3">
                                    <i className="fas fa-star me-2"></i>
                                    Techniques Avancées Pro
                                  </h6>
                                  <ListGroup variant="flush">
                                    <ListGroup.Item className="border-0 py-2 bg-transparent">
                                      <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                                      <strong>
                                        Transparence des défauts :
                                      </strong>{" "}
                                      Photos spécifiques de chaque imperfection
                                    </ListGroup.Item>
                                    <ListGroup.Item className="border-0 py-2 bg-transparent">
                                      <i className="fas fa-ruler-combined text-info me-2"></i>
                                      <strong>Photo avec échelle :</strong>{" "}
                                      Inclure un objet de référence pour la
                                      taille
                                    </ListGroup.Item>
                                    <ListGroup.Item className="border-0 py-2 bg-transparent">
                                      <i className="fas fa-expand-alt text-success me-2"></i>
                                      <strong>Détails logos/marques :</strong>{" "}
                                      Gros plans sur les éléments distinctifs
                                    </ListGroup.Item>
                                  </ListGroup>
                                </div>
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      </div>
                    </div>
                  </Col>

                  <Col lg={4}>
                    <Card className="border-primary border-2 shadow-sm mb-4">
                      <Card.Body className="p-4">
                        <h5 className="fw-bold mb-4 text-primary">
                          <i className="fas fa-percentage me-2"></i>
                          Structure des Commissions
                        </h5>
                        <p className="text-dark mb-4">
                          Les commissions sur OSKAR sont progressives et
                          récompensent l'engagement et la performance. Plus vous
                          êtes actif, moins vous payez de commissions.
                        </p>

                        <table className="table table-borderless">
                          <thead>
                            <tr className="border-bottom">
                              <th>Niveau Vendeur</th>
                              <th className="text-end">Commission</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>
                                <Badge bg="secondary" className="me-2">
                                  Débutant
                                </Badge>
                                <small className="text-muted">
                                  0-10 ventes
                                </small>
                              </td>
                              <td className="text-end fw-bold">7%</td>
                            </tr>
                            <tr>
                              <td>
                                <Badge bg="primary" className="me-2">
                                  Intermédiaire
                                </Badge>
                                <small className="text-muted">
                                  11-50 ventes
                                </small>
                              </td>
                              <td className="text-end fw-bold">5%</td>
                            </tr>
                            <tr>
                              <td>
                                <Badge bg="warning" className="me-2">
                                  Premium
                                </Badge>
                                <small className="text-muted">
                                  51-200 ventes
                                </small>
                              </td>
                              <td className="text-end fw-bold">3%</td>
                            </tr>
                            <tr>
                              <td>
                                <Badge bg="success" className="me-2">
                                  Expert
                                </Badge>
                                <small className="text-muted">
                                  200+ ventes
                                </small>
                              </td>
                              <td className="text-end fw-bold">2%</td>
                            </tr>
                          </tbody>
                        </table>

                        <Alert
                          variant="info"
                          className="mt-3 border-0 bg-info bg-opacity-10"
                        >
                          <i className="fas fa-info-circle me-2"></i>
                          <small>
                            Les commissions sont calculées uniquement sur le
                            prix final de vente, hors frais de livraison. Aucun
                            frais de mise en ligne ou d'abonnement.
                          </small>
                        </Alert>
                      </Card.Body>
                    </Card>

                    <Card className="border-warning border-2 shadow-sm">
                      <Card.Body className="p-4">
                        <h5 className="fw-bold mb-4 text-warning">
                          <i className="fas fa-bolt me-2"></i>
                          Meilleures Pratiques Certifiées
                        </h5>
                        <p className="text-dark mb-4">
                          Ces pratiques ont été validées par l'analyse des
                          données de milliers de vendeurs performants sur OSKAR.
                        </p>

                        <ListGroup variant="flush">
                          {[
                            "Réponse moyenne < 2 heures (augmente les ventes de 40%)",
                            "Mise à jour hebdomadaire des annonces (visibilité +25%)",
                            "Utilisation de 15+ mots-clés pertinents (trafic +60%)",
                            "Notifications push activées (conversions +30%)",
                            "Livraison gratuite proposée (panier moyen +22%)",
                            "Évaluations demandées systématiquement (confiance +45%)",
                          ].map((item, idx) => (
                            <ListGroup.Item key={idx} className="border-0 py-2">
                              <div className="d-flex align-items-start">
                                <Badge bg="warning" className="me-2 mt-1">
                                  {idx + 1}
                                </Badge>
                                <span className="text-dark">{item}</span>
                              </div>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </div>
            </Tab.Pane>

            {/* Guide Échanges */}
            <Tab.Pane eventKey="exchanges" className="fade">
              <div className="container-fluid py-5">
                <Row className="align-items-center mb-5">
                  <Col lg={8}>
                    <h2 className="fw-bold mb-4 text-warning">
                      <i className="fas fa-exchange-alt me-2"></i>
                      Système d'Échange Intelligent OSKAR
                    </h2>
                    <p className="text-dark fs-5 mb-4">
                      L'échange sur OSKAR n'est pas un simple troc. C'est un
                      système sophistiqué qui utilise l'intelligence
                      artificielle pour évaluer avec précision la valeur des
                      articles et trouver des correspondances parfaites, créant
                      ainsi une véritable économie circulaire sans frais de
                      transaction.
                    </p>

                    <div className="bg-warning bg-opacity-10 p-4 rounded-3">
                      <h5 className="text-warning fw-bold mb-3">
                        <i className="fas fa-lightbulb me-2"></i>
                        Pourquoi l'Échange OSKAR est Unique ?
                      </h5>
                      <p className="mb-0">
                        Contrairement aux systèmes d'échange traditionnels,
                        OSKAR utilise un algorithme propriétaire qui analyse
                        plus de 50 paramètres (état, demande, saisonnalité,
                        rareté, etc.) pour déterminer l'équivalence exacte entre
                        articles. Ce système élimine les déséquilibres et
                        garantit la satisfaction des deux parties.
                      </p>
                    </div>
                  </Col>

                  <Col lg={4} className="text-center">
                    <div className="bg-warning bg-opacity-10 p-5 rounded-circle d-inline-block">
                      <i className="fas fa-sync fa-4x text-warning"></i>
                    </div>
                  </Col>
                </Row>

                <Row className="g-4 mb-5">
                  <Col md={4}>
                    <Card className="border-warning border-2 shadow-sm h-100">
                      <Card.Body className="p-4 text-center">
                        <div className="bg-warning bg-opacity-10 p-3 rounded-circle d-inline-block mb-4">
                          <i className="fas fa-search fa-2x text-warning"></i>
                        </div>
                        <h5 className="fw-bold mb-3 text-warning">
                          Recherche Automatique
                        </h5>
                        <p className="text-dark">
                          Notre IA analyse en permanence le catalogue OSKAR pour
                          trouver des articles correspondant exactement à la
                          valeur du vôtre, en tenant compte de vos préférences
                          personnelles et historiques.
                        </p>
                        <Badge bg="warning" className="mt-2">
                          <i className="fas fa-robot me-1"></i>
                          Matching intelligent
                        </Badge>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={4}>
                    <Card className="border-warning border-2 shadow-sm h-100">
                      <Card.Body className="p-4 text-center">
                        <div className="bg-warning bg-opacity-10 p-3 rounded-circle d-inline-block mb-4">
                          <i className="fas fa-balance-scale fa-2x text-warning"></i>
                        </div>
                        <h5 className="fw-bold mb-3 text-warning">
                          Évaluation Précise
                        </h5>
                        <p className="text-dark">
                          Système de notation basé sur le marché actuel, l'état
                          réel, la demande saisonnière, et les tendances.
                          L'évaluation est transparente et peut être consultée à
                          tout moment.
                        </p>
                        <Badge bg="warning" className="mt-2">
                          <i className="fas fa-chart-bar me-1"></i>
                          50+ paramètres analysés
                        </Badge>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={4}>
                    <Card className="border-warning border-2 shadow-sm h-100">
                      <Card.Body className="p-4 text-center">
                        <div className="bg-warning bg-opacity-10 p-3 rounded-circle d-inline-block mb-4">
                          <i className="fas fa-shield-alt fa-2x text-warning"></i>
                        </div>
                        <h5 className="fw-bold mb-3 text-warning">
                          Médiation Sécurisée
                        </h5>
                        <p className="text-dark">
                          OSKAR agit comme médiateur tiers pour garantir
                          l'échange équitable. En cas de litige, notre équipe
                          intervient pour trouver une solution satisfaisante
                          pour toutes les parties concernées.
                        </p>
                        <Badge bg="warning" className="mt-2">
                          <i className="fas fa-user-shield me-1"></i>
                          Protection garantie
                        </Badge>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <div className="mt-5">
                  <Card className="border-warning border-2 shadow-sm">
                    <Card.Body className="p-4">
                      <h4 className="fw-bold mb-4 text-warning">
                        <i className="fas fa-question-circle me-2"></i>
                        FAQ Complète sur les Échanges
                      </h4>
                      <p className="text-dark mb-4">
                        Les questions les plus fréquentes sur notre système
                        d'échange, avec des réponses détaillées pour vous aider
                        à maîtriser cette fonctionnalité unique.
                      </p>

                      <Accordion>
                        <Accordion.Item eventKey="0">
                          <Accordion.Header>
                            <div className="d-flex align-items-center">
                              <i className="fas fa-search-dollar me-3 text-warning"></i>
                              <div>
                                <h6 className="mb-0">
                                  Comment évalue-t-on la valeur des articles ?
                                </h6>
                                <small className="text-muted">
                                  Système d'évaluation détaillé
                                </small>
                              </div>
                            </div>
                          </Accordion.Header>
                          <Accordion.Body>
                            <p className="text-dark">
                              Notre système utilise un algorithme propriétaire
                              qui analyse simultanément :
                            </p>
                            <ul className="text-dark">
                              <li>
                                <strong>Prix moyen du marché :</strong> Analyse
                                historique des ventes similaires
                              </li>
                              <li>
                                <strong>État objectif :</strong> Évaluation
                                technique basée sur nos critères standardisés
                              </li>
                              <li>
                                <strong>Demande actuelle :</strong> Tendances de
                                recherche et d'achat en temps réel
                              </li>
                              <li>
                                <strong>Saisonnalité :</strong> Variation de
                                valeur selon la période de l'année
                              </li>
                              <li>
                                <strong>Rareté :</strong> Disponibilité et
                                fréquence d'apparition sur le marché
                              </li>
                              <li>
                                <strong>Accessoires inclus :</strong> Valeur
                                ajoutée des éléments complémentaires
                              </li>
                            </ul>
                          </Accordion.Body>
                        </Accordion.Item>

                        <Accordion.Item eventKey="1">
                          <Accordion.Header>
                            <div className="d-flex align-items-center">
                              <i className="fas fa-balance-scale me-3 text-warning"></i>
                              <div>
                                <h6 className="mb-0">
                                  Que faire en cas de déséquilibre de valeur ?
                                </h6>
                                <small className="text-muted">
                                  Solutions pour les écarts de valeur
                                </small>
                              </div>
                            </div>
                          </Accordion.Header>
                          <Accordion.Body>
                            <p className="text-dark">
                              OSKAR propose plusieurs solutions intelligentes
                              pour gérer les écarts de valeur :
                            </p>
                            <ul className="text-dark">
                              <li>
                                <strong>Compensation monétaire :</strong>{" "}
                                Paiement complémentaire calculé automatiquement
                              </li>
                              <li>
                                <strong>Échange multi-parties :</strong>{" "}
                                Impliquer un troisième article pour équilibrer
                              </li>
                              <li>
                                <strong>Crédit OSKAR :</strong> Solde utilisable
                                sur toute la plateforme
                              </li>
                              <li>
                                <strong>Renégociation :</strong> Outils intégrés
                                pour ajuster les termes
                              </li>
                              <li>
                                <strong>Option d'achat :</strong> Combinaison
                                échange + achat partiel
                              </li>
                            </ul>
                          </Accordion.Body>
                        </Accordion.Item>

                        <Accordion.Item eventKey="2">
                          <Accordion.Header>
                            <div className="d-flex align-items-center">
                              <i className="fas fa-truck me-3 text-warning"></i>
                              <div>
                                <h6 className="mb-0">
                                  Comment fonctionne la livraison pour les
                                  échanges ?
                                </h6>
                                <small className="text-muted">
                                  Logistique des échanges
                                </small>
                              </div>
                            </div>
                          </Accordion.Header>
                          <Accordion.Body>
                            <p className="text-dark">
                              La logistique des échanges est simplifiée et
                              sécurisée :
                            </p>
                            <ul className="text-dark">
                              <li>
                                <strong>Frais partagés :</strong> Les coûts de
                                livraison sont divisés équitablement
                              </li>
                              <li>
                                <strong>Livraison simultanée :</strong> Les
                                articles sont expédiés en même temps
                              </li>
                              <li>
                                <strong>Tracking intégré :</strong> Suivi en
                                temps réel des deux colis
                              </li>
                              <li>
                                <strong>Points relais :</strong> Réseau de 5000+
                                points de retrait disponibles
                              </li>
                              <li>
                                <strong>Assurance incluse :</strong> Couverture
                                complète pendant le transport
                              </li>
                              <li>
                                <strong>Validation avant réception :</strong>{" "}
                                Photos de confirmation obligatoires
                              </li>
                            </ul>
                          </Accordion.Body>
                        </Accordion.Item>

                        <Accordion.Item eventKey="3">
                          <Accordion.Header>
                            <div className="d-flex align-items-center">
                              <i className="fas fa-money-bill-wave me-3 text-warning"></i>
                              <div>
                                <h6 className="mb-0">
                                  Quels sont les frais associés aux échanges ?
                                </h6>
                                <small className="text-muted">
                                  Transparence tarifaire
                                </small>
                              </div>
                            </div>
                          </Accordion.Header>
                          <Accordion.Body>
                            <p className="text-dark">
                              La politique tarifaire des échanges est conçue
                              pour être avantageuse et transparente :
                            </p>
                            <ul className="text-dark">
                              <li>
                                <strong>Commission échange :</strong> 0% - Les
                                échanges sont exonérés de commission
                              </li>
                              <li>
                                <strong>Frais de service :</strong> 2€ fixe par
                                échange réussi
                              </li>
                              <li>
                                <strong>Frais de médiation :</strong> Inclus
                                dans les frais de service
                              </li>
                              <li>
                                <strong>Assurance :</strong> Incluse
                                gratuitement
                              </li>
                              <li>
                                <strong>Premium :</strong> Forfait mensuel 9,99€
                                pour échanges illimités
                              </li>
                              <li>
                                <strong>Premier échange :</strong> Totalement
                                gratuit pour tous les nouveaux vendeurs
                              </li>
                            </ul>
                          </Accordion.Body>
                        </Accordion.Item>
                      </Accordion>
                    </Card.Body>
                  </Card>
                </div>

                <Row className="mt-5">
                  <Col>
                    <Card className="border-0 shadow-sm bg-warning bg-opacity-5">
                      <Card.Body className="p-4">
                        <h5 className="fw-bold mb-3 text-warning">
                          <i className="fas fa-lightbulb me-2"></i>
                          Stratégies d'Échange Avancées
                        </h5>
                        <Row className="g-3">
                          {[
                            {
                              strategy: "Échange Progressif",
                              desc: "Commencez par des articles de faible valeur pour monter en gamme progressivement",
                              icon: "fa-arrow-up",
                            },
                            {
                              strategy: "Bundle d'Échange",
                              desc: "Combine plusieurs articles de moindre valeur contre un article de plus grande valeur",
                              icon: "fa-layer-group",
                            },
                            {
                              strategy: "Échange Saisonnier",
                              desc: "Profitez des variations saisonnières pour échanger au meilleur moment",
                              icon: "fa-calendar-alt",
                            },
                            {
                              strategy: "Échange Spécialisé",
                              desc: "Spécialisez-vous dans un type d'article pour devenir référent et faciliter les échanges",
                              icon: "fa-star",
                            },
                          ].map((item, idx) => (
                            <Col md={6} key={idx}>
                              <div className="border border-warning border-opacity-25 rounded-3 p-3 bg-white">
                                <div className="d-flex align-items-center mb-2">
                                  <i
                                    className={`fas ${item.icon} text-warning me-2`}
                                  ></i>
                                  <h6 className="mb-0 fw-bold text-warning">
                                    {item.strategy}
                                  </h6>
                                </div>
                                <small className="text-dark">{item.desc}</small>
                              </div>
                            </Col>
                          ))}
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </div>
            </Tab.Pane>

            {/* Guide Dons */}
            <Tab.Pane eventKey="donations" className="fade">
              <div className="container-fluid py-5">
                <div className="mb-5">
                  <div className="text-center mb-4">
                    <div className="bg-info bg-opacity-10 p-4 rounded-circle d-inline-block mb-4">
                      <i className="fas fa-hands-helping fa-4x text-info"></i>
                    </div>
                    <h2 className="fw-bold mb-3 text-info">
                      Programme de Dons Solidaires OSKAR
                    </h2>
                    <p className="text-dark fs-5">
                      Transformez vos invendus en actes de générosité
                      récompensés. Le programme de dons OSKAR crée une synergie
                      unique entre engagement social et avantages pratiques pour
                      les vendeurs.
                    </p>
                  </div>

                  <div className="bg-info bg-opacity-10 p-4 rounded-3">
                    <h5 className="text-info fw-bold mb-3">
                      <i className="fas fa-medal me-2"></i>
                      La Philosophie du Don OSKAR
                    </h5>
                    <p className="text-dark mb-0">
                      Chez OSKAR, nous croyons que la générosité doit être
                      récompensée et facilitée. Notre programme transforme le
                      don d'invendus en une expérience positive qui bénéficie à
                      tous : le vendeur obtient des avantages concrets, les
                      associations reçoivent des articles de qualité, et la
                      communauté renforce ses valeurs de solidarité.
                    </p>
                  </div>
                </div>

                <Row className="g-4 mb-5">
                  <Col lg={8}>
                    <Card className="border-info border-2 shadow-sm h-100">
                      <Card.Body className="p-4">
                        <h4 className="fw-bold mb-4 text-info">
                          <i className="fas fa-gift me-2"></i>
                          Avantages Concrets pour les Vendeurs Donateurs
                        </h4>
                        <p className="text-dark mb-4">
                          Faire un don sur OSKAR n'est pas seulement un acte de
                          générosité, c'est aussi une décision stratégique qui
                          vous apporte des bénéfices tangibles et mesurables.
                        </p>

                        <Row>
                          <Col md={6}>
                            <ListGroup variant="flush">
                              <ListGroup.Item className="border-0 py-3">
                                <div className="d-flex align-items-start">
                                  <i className="fas fa-file-invoice-dollar text-info fa-lg mt-1 me-3"></i>
                                  <div>
                                    <strong className="d-block text-info">
                                      Certificat de Don Fiscal
                                    </strong>
                                    <small className="text-dark">
                                      Reçu fiscal officiel déductible de vos
                                      impôts à hauteur de 66% de la valeur du
                                      don (dans la limite de 20% du revenu
                                      imposable)
                                    </small>
                                  </div>
                                </div>
                              </ListGroup.Item>

                              <ListGroup.Item className="border-0 py-3">
                                <div className="d-flex align-items-start">
                                  <i className="fas fa-star text-info fa-lg mt-1 me-3"></i>
                                  <div>
                                    <strong className="d-block text-info">
                                      Badge Solidaire Visible
                                    </strong>
                                    <small className="text-dark">
                                      Badge spécial sur votre profil augmentant
                                      la confiance des acheteurs de 35% et
                                      améliorant votre classement dans les
                                      recherches
                                    </small>
                                  </div>
                                </div>
                              </ListGroup.Item>
                            </ListGroup>
                          </Col>

                          <Col md={6}>
                            <ListGroup variant="flush">
                              <ListGroup.Item className="border-0 py-3">
                                <div className="d-flex align-items-start">
                                  <i className="fas fa-users text-info fa-lg mt-1 me-3"></i>
                                  <div>
                                    <strong className="d-block text-info">
                                      Communauté Engagée
                                    </strong>
                                    <small className="text-dark">
                                      Accès au réseau exclusif des donateurs
                                      OSKAR avec opportunités de networking et
                                      avantages communautaires
                                    </small>
                                  </div>
                                </div>
                              </ListGroup.Item>

                              <ListGroup.Item className="border-0 py-3">
                                <div className="d-flex align-items-start">
                                  <i className="fas fa-recycle text-info fa-lg mt-1 me-3"></i>
                                  <div>
                                    <strong className="d-block text-info">
                                      Économie Circulaire
                                    </strong>
                                    <small className="text-dark">
                                      Contribution mesurable à la réduction du
                                      gaspillage avec rapport d'impact
                                      environnemental personnalisé
                                    </small>
                                  </div>
                                </div>
                              </ListGroup.Item>
                            </ListGroup>
                          </Col>
                        </Row>

                        <div className="mt-4 bg-info bg-opacity-5 p-3 rounded-3">
                          <h6 className="text-info fw-bold mb-2">
                            <i className="fas fa-chart-line me-2"></i>
                            Impact Mesurable des Dons
                          </h6>
                          <p className="text-dark mb-0 small">
                            Selon nos données, les vendeurs qui font
                            régulièrement des dons voient leurs ventes augmenter
                            de 28% en moyenne, grâce à l'amélioration de leur
                            réputation et de leur visibilité.
                          </p>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col lg={4}>
                    <Card className="border-info border-2 shadow-sm h-100">
                      <Card.Body className="p-4">
                        <h5 className="fw-bold mb-4 text-info">
                          <i className="fas fa-check-circle me-2"></i>
                          Catégories de Dons Acceptées
                        </h5>
                        <p className="text-dark mb-4">
                          OSKAR accepte une large variété d'articles en bon
                          état. Voici les principales catégories avec leurs
                          spécifications :
                        </p>

                        <div className="row g-2">
                          {[
                            {
                              category: "Électronique",
                              desc: "Fonctionnel, moins de 5 ans",
                            },
                            {
                              category: "Vêtements",
                              desc: "Propre, sans taches ni déchirures",
                            },
                            {
                              category: "Meubles",
                              desc: "Structure solide, prêt à utiliser",
                            },
                            {
                              category: "Livres",
                              desc: "Pages intactes, couverture en bon état",
                            },
                            {
                              category: "Jouets",
                              desc: "Complet, sans pièces manquantes",
                            },
                            {
                              category: "Équipement",
                              desc: "Fonctionnel, sécurité vérifiée",
                            },
                            {
                              category: "Décoration",
                              desc: "Esthétique, bon état général",
                            },
                            {
                              category: "Sport",
                              desc: "Sécurité vérifiée, bon état",
                            },
                            { category: "Art", desc: "Authenticité vérifiée" },
                          ].map((item, idx) => (
                            <Col xs={6} key={idx}>
                              <div className="border border-info border-opacity-25 rounded-2 p-2 bg-white">
                                <div className="text-info fw-bold small">
                                  {item.category}
                                </div>
                                <div className="text-muted extra-small">
                                  {item.desc}
                                </div>
                              </div>
                            </Col>
                          ))}
                        </div>

                        <Alert
                          variant="info"
                          className="mt-4 border-0 bg-info bg-opacity-10"
                        >
                          <i className="fas fa-info-circle me-2"></i>
                          <small className="text-dark">
                            Tous les articles sont vérifiés par notre équipe
                            avant d'être proposés aux associations. La
                            non-conformité entraîne le retour de l'article à vos
                            frais.
                          </small>
                        </Alert>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <Card className="border-info border-2 shadow-sm">
                  <Card.Body className="p-4">
                    <h4 className="fw-bold mb-4 text-info">
                      <i className="fas fa-list-ol me-2"></i>
                      Processus de Don Détail par Détail
                    </h4>
                    <p className="text-dark mb-5">
                      Le processus de don OSKAR est conçu pour être simple,
                      transparent et sécurisé. Chaque étape est optimisée pour
                      minimiser vos efforts tout en maximisant l'impact social
                      de votre générosité.
                    </p>

                    <Row className="text-center">
                      {[
                        {
                          step: "1",
                          title: "Sélection Initiale",
                          desc: "Identification des articles éligibles au don dans votre inventaire",
                          details:
                            "Notre système vous suggère automatiquement les articles les plus demandés par les associations",
                        },
                        {
                          step: "2",
                          title: "Validation Technique",
                          desc: "Vérification détaillée par notre équipe spécialisée",
                          details:
                            "Contrôle de qualité, vérification fonctionnelle, et évaluation objective de l'état",
                        },
                        {
                          step: "3",
                          title: "Mise en Ligne",
                          desc: "Publication sur le marché des dons OSKAR",
                          details:
                            "Votre article est visible uniquement par les associations partenaires vérifiées",
                        },
                        {
                          step: "4",
                          title: "Attribution Intelligente",
                          desc: "Sélection automatique de l'association la plus pertinente",
                          details:
                            "Algorithme de matching basé sur les besoins, la localisation, et la spécialité",
                        },
                        {
                          step: "5",
                          title: "Suivi Complet",
                          desc: "Traçabilité et impact mesuré",
                          details:
                            "Certificat de don, rapport d'impact, et remerciements personnalisés",
                        },
                      ].map((item, idx) => (
                        <Col key={idx} className="mb-4 mb-lg-0">
                          <div className="position-relative">
                            <div className="bg-info bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                              <span className="badge bg-info position-absolute top-0 start-100 translate-middle">
                                {item.step}
                              </span>
                              <i className="fas fa-check text-info"></i>
                            </div>
                            <h6 className="fw-bold text-info mb-2">
                              {item.title}
                            </h6>
                            <div className="bg-light p-2 rounded-2">
                              <small className="text-dark d-block mb-1">
                                {item.desc}
                              </small>
                              <small className="text-muted extra-small">
                                {item.details}
                              </small>
                            </div>
                          </div>
                        </Col>
                      ))}
                    </Row>

                    <div className="mt-5 bg-info bg-opacity-5 p-4 rounded-3">
                      <h6 className="text-info fw-bold mb-3">
                        <i className="fas fa-clock me-2"></i>
                        Délais et Engagements
                      </h6>
                      <Row>
                        <Col md={4}>
                          <div className="text-center p-3">
                            <div className="text-info fw-bold fs-4">24-48h</div>
                            <small className="text-dark">
                              Validation technique
                            </small>
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="text-center p-3">
                            <div className="text-info fw-bold fs-4">
                              7 jours max
                            </div>
                            <small className="text-dark">
                              Attribution association
                            </small>
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="text-center p-3">
                            <div className="text-info fw-bold fs-4">
                              30 jours
                            </div>
                            <small className="text-dark">
                              Certificat fiscal
                            </small>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </Card.Body>
                </Card>

                <Row className="mt-5">
                  <Col>
                    <Card className="border-0 shadow-sm bg-info bg-opacity-5">
                      <Card.Body className="p-4">
                        <h5 className="fw-bold mb-3 text-info">
                          <i className="fas fa-hand-holding-heart me-2"></i>
                          Associations Partenaires Certifiées
                        </h5>
                        <p className="text-dark mb-4">
                          OSKAR collabore exclusivement avec des associations
                          vérifiées et certifiées pour garantir que vos dons ont
                          un impact réel et mesurable.
                        </p>

                        <Row className="g-3">
                          {[
                            {
                              name: "Solidarité Équitable",
                              focus: "Réinsertion professionnelle",
                              impact: "2 500+ personnes aidées",
                            },
                            {
                              name: "Éco-Citoyens",
                              focus: "Transition écologique",
                              impact: "45 tonnes de déchets évitées",
                            },
                            {
                              name: "Éducation Pour Tous",
                              focus: "Accès à l'éducation",
                              impact: "800+ kits éducatifs distribués",
                            },
                            {
                              name: "Logement Digne",
                              focus: "Aide au logement",
                              impact: "150 familles relogées",
                            },
                          ].map((org, idx) => (
                            <Col md={6} key={idx}>
                              <div className="border border-info border-opacity-25 rounded-3 p-3 bg-white">
                                <div className="d-flex align-items-center mb-2">
                                  <div className="bg-info bg-opacity-10 p-2 rounded-circle me-3">
                                    <i className="fas fa-hands-helping text-info"></i>
                                  </div>
                                  <div>
                                    <h6 className="mb-0 fw-bold text-info">
                                      {org.name}
                                    </h6>
                                    <small className="text-muted">
                                      {org.focus}
                                    </small>
                                  </div>
                                </div>
                                <div className="text-success small">
                                  <i className="fas fa-chart-line me-1"></i>
                                  {org.impact}
                                </div>
                              </div>
                            </Col>
                          ))}
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </div>
            </Tab.Pane>

            {/* Performance */}
            <Tab.Pane eventKey="performance" className="fade">
              <div className="container-fluid py-5">
                <h2 className="fw-bold mb-5 text-dark">
                  <i className="fas fa-chart-line me-2"></i>
                  Tableau de Bord Performance
                </h2>

                <Row className="g-4 mb-5">
                  <Col md={3}>
                    <Card className="border-0 shadow-sm">
                      <Card.Body className="text-center p-4">
                        <div className="text-primary mb-3">
                          <i className="fas fa-eye fa-2x"></i>
                        </div>
                        <h3 className="fw-bold mb-1">1,254</h3>
                        <small className="text-muted">Vues cette semaine</small>
                        <div className="text-success small mt-2">
                          <i className="fas fa-arrow-up me-1"></i>
                          +12% vs semaine dernière
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={3}>
                    <Card className="border-0 shadow-sm">
                      <Card.Body className="text-center p-4">
                        <div className="text-success mb-3">
                          <i className="fas fa-shopping-cart fa-2x"></i>
                        </div>
                        <h3 className="fw-bold mb-1">42</h3>
                        <small className="text-muted">Ventes ce mois</small>
                        <div className="text-success small mt-2">
                          <i className="fas fa-arrow-up me-1"></i>
                          +8% vs mois dernier
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={3}>
                    <Card className="border-0 shadow-sm">
                      <Card.Body className="text-center p-4">
                        <div className="text-warning mb-3">
                          <i className="fas fa-exchange-alt fa-2x"></i>
                        </div>
                        <h3 className="fw-bold mb-1">18</h3>
                        <small className="text-muted">Échanges réussis</small>
                        <div className="text-success small mt-2">
                          <i className="fas fa-arrow-up me-1"></i>
                          +15% vs période précédente
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={3}>
                    <Card className="border-0 shadow-sm">
                      <Card.Body className="text-center p-4">
                        <div className="text-info mb-3">
                          <i className="fas fa-star fa-2x"></i>
                        </div>
                        <h3 className="fw-bold mb-1">4.8</h3>
                        <small className="text-muted">Note moyenne</small>
                        <div className="text-success small mt-2">
                          <i className="fas fa-arrow-up me-1"></i>
                          +0.2 vs dernier trimestre
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <Row>
                  <Col lg={8}>
                    <Card className="border-0 shadow-sm mb-4">
                      <Card.Body className="p-4">
                        <h5 className="fw-bold mb-4">
                          Performance par Catégorie Détail
                        </h5>
                        <p className="text-dark mb-4">
                          Analyse comparative de vos performances selon les
                          différentes catégories d'articles. Ces données vous
                          permettent d'identifier vos points forts et les
                          opportunités d'amélioration.
                        </p>

                        <div className="table-responsive">
                          <table className="table table-hover">
                            <thead>
                              <tr>
                                <th>Catégorie</th>
                                <th className="text-end">Vues</th>
                                <th className="text-end">Ventes</th>
                                <th className="text-end">Taux Conversion</th>
                                <th className="text-end">Revenu Moyen</th>
                                <th className="text-end">Statut</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>
                                  <i className="fas fa-laptop text-primary me-2"></i>
                                  Électronique
                                </td>
                                <td className="text-end">2,145</td>
                                <td className="text-end">24</td>
                                <td className="text-end">
                                  <Badge bg="success">1.12%</Badge>
                                </td>
                                <td className="text-end">189€</td>
                                <td className="text-end">
                                  <i className="fas fa-arrow-up text-success"></i>
                                  <small className="text-success ms-1">
                                    Optimale
                                  </small>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <i className="fas fa-tshirt text-success me-2"></i>
                                  Vêtements
                                </td>
                                <td className="text-end">1,845</td>
                                <td className="text-end">18</td>
                                <td className="text-end">
                                  <Badge bg="warning">0.98%</Badge>
                                </td>
                                <td className="text-end">45€</td>
                                <td className="text-end">
                                  <i className="fas fa-minus text-warning"></i>
                                  <small className="text-warning ms-1">
                                    Stable
                                  </small>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <i className="fas fa-couch text-warning me-2"></i>
                                  Meubles
                                </td>
                                <td className="text-end">1,210</td>
                                <td className="text-end">12</td>
                                <td className="text-end">
                                  <Badge bg="warning">0.99%</Badge>
                                </td>
                                <td className="text-end">320€</td>
                                <td className="text-end">
                                  <i className="fas fa-arrow-up text-success"></i>
                                  <small className="text-success ms-1">
                                    Croissance
                                  </small>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <i className="fas fa-book text-info me-2"></i>
                                  Livres
                                </td>
                                <td className="text-end">956</td>
                                <td className="text-end">15</td>
                                <td className="text-end">
                                  <Badge bg="success">1.57%</Badge>
                                </td>
                                <td className="text-end">22€</td>
                                <td className="text-end">
                                  <i className="fas fa-arrow-up text-success"></i>
                                  <small className="text-success ms-1">
                                    Excellente
                                  </small>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <i className="fas fa-basketball-ball text-danger me-2"></i>
                                  Sport
                                </td>
                                <td className="text-end">745</td>
                                <td className="text-end">8</td>
                                <td className="text-end">
                                  <Badge bg="danger">1.07%</Badge>
                                </td>
                                <td className="text-end">85€</td>
                                <td className="text-end">
                                  <i className="fas fa-arrow-down text-danger"></i>
                                  <small className="text-danger ms-1">
                                    À améliorer
                                  </small>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </Card.Body>
                    </Card>

                    <Card className="border-0 shadow-sm">
                      <Card.Body className="p-4">
                        <h5 className="fw-bold mb-4">
                          Évolution Mensuelle des Performances
                        </h5>
                        <p className="text-dark mb-4">
                          Suivez votre progression mois par mois pour identifier
                          les tendances et ajuster votre stratégie en
                          conséquence.
                        </p>

                        <div className="bg-light p-4 rounded-3">
                          <Row className="text-center">
                            {[
                              {
                                month: "Jan",
                                sales: 38,
                                views: 1850,
                                rating: 4.7,
                              },
                              {
                                month: "Fév",
                                sales: 42,
                                views: 2100,
                                rating: 4.8,
                              },
                              {
                                month: "Mar",
                                sales: 45,
                                views: 2250,
                                rating: 4.8,
                              },
                              {
                                month: "Avr",
                                sales: 40,
                                views: 2150,
                                rating: 4.9,
                              },
                              {
                                month: "Mai",
                                sales: 48,
                                views: 2400,
                                rating: 4.8,
                              },
                              {
                                month: "Juin",
                                sales: 42,
                                views: 2254,
                                rating: 4.8,
                              },
                            ].map((data, idx) => (
                              <Col key={idx}>
                                <div className="mb-3">
                                  <div className="text-dark fw-bold">
                                    {data.month}
                                  </div>
                                  <div className="text-success">
                                    {data.sales} ventes
                                  </div>
                                  <div className="text-primary">
                                    {data.views.toLocaleString()} vues
                                  </div>
                                  <div className="text-warning">
                                    {data.rating}★
                                  </div>
                                </div>
                              </Col>
                            ))}
                          </Row>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col lg={4}>
                    <Card className="border-0 shadow-sm mb-4">
                      <Card.Body className="p-4">
                        <h5 className="fw-bold mb-4">
                          <i className="fas fa-bullseye me-2 text-primary"></i>
                          Recommandations d'Amélioration
                        </h5>
                        <p className="text-dark mb-4">
                          Basé sur l'analyse de vos performances, voici les
                          actions prioritaires pour optimiser vos résultats sur
                          OSKAR.
                        </p>

                        <ListGroup variant="flush">
                          {[
                            {
                              priority: "Haute",
                              action:
                                "Augmentez les photos des produits électroniques",
                              impact: "Conversion +25% estimée",
                              icon: "fa-camera",
                            },
                            {
                              priority: "Haute",
                              action: "Réduisez les prix des vêtements de 10%",
                              impact: "Ventes +15% estimées",
                              icon: "fa-tag",
                            },
                            {
                              priority: "Moyenne",
                              action:
                                "Ajoutez plus de descriptions aux meubles",
                              impact: "Engagement +30% estimé",
                              icon: "fa-align-left",
                            },
                            {
                              priority: "Moyenne",
                              action: "Répondez plus rapidement aux demandes",
                              impact: "Satisfaction +20% estimée",
                              icon: "fa-reply",
                            },
                            {
                              priority: "Basse",
                              action:
                                "Explorez les options d'échange pour le sport",
                              impact: "Liquidité +40% estimée",
                              icon: "fa-exchange-alt",
                            },
                          ].map((tip, idx) => (
                            <ListGroup.Item key={idx} className="border-0 py-3">
                              <div className="d-flex align-items-start">
                                <Badge
                                  bg={
                                    tip.priority === "Haute"
                                      ? "danger"
                                      : tip.priority === "Moyenne"
                                        ? "warning"
                                        : "secondary"
                                  }
                                  className="me-2 mt-1"
                                >
                                  {tip.priority}
                                </Badge>
                                <div className="flex-grow-1">
                                  <div className="d-flex align-items-center mb-1">
                                    <i
                                      className={`fas ${tip.icon} me-2 text-primary`}
                                    ></i>
                                    <span className="fw-bold">
                                      {tip.action}
                                    </span>
                                  </div>
                                  <small className="text-success">
                                    <i className="fas fa-chart-line me-1"></i>
                                    {tip.impact}
                                  </small>
                                </div>
                              </div>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      </Card.Body>
                    </Card>

                    <Card className="border-0 shadow-sm">
                      <Card.Body className="p-4">
                        <h5 className="fw-bold mb-4">
                          <i className="fas fa-trophy me-2 text-warning"></i>
                          Comparatif avec la Moyenne OSKAR
                        </h5>
                        <p className="text-dark mb-4">
                          Voyez comment vous vous positionnez par rapport à la
                          moyenne des vendeurs sur notre plateforme.
                        </p>

                        <div className="mb-4">
                          <div className="d-flex justify-content-between mb-2">
                            <span>Taux de réponse</span>
                            <div>
                              <span className="fw-bold">85%</span>
                              <small className="text-success ms-2">
                                +10% vs moyenne
                              </small>
                            </div>
                          </div>
                          <ProgressBar
                            now={85}
                            variant="success"
                            className="mb-3"
                          />

                          <div className="d-flex justify-content-between mb-2">
                            <span>Photos par annonce</span>
                            <div>
                              <span className="fw-bold">6</span>
                              <small className="text-success ms-2">
                                +1 vs moyenne
                              </small>
                            </div>
                          </div>
                          <ProgressBar
                            now={75}
                            variant="primary"
                            className="mb-3"
                          />

                          <div className="d-flex justify-content-between mb-2">
                            <span>Mots par description</span>
                            <div>
                              <span className="fw-bold">180</span>
                              <small className="text-warning ms-2">
                                -20 vs moyenne
                              </small>
                            </div>
                          </div>
                          <ProgressBar
                            now={70}
                            variant="warning"
                            className="mb-3"
                          />

                          <div className="d-flex justify-content-between mb-2">
                            <span>Prix compétitifs</span>
                            <div>
                              <span className="fw-bold">92%</span>
                              <small className="text-success ms-2">
                                +7% vs moyenne
                              </small>
                            </div>
                          </div>
                          <ProgressBar now={92} variant="info" />
                        </div>

                        <Alert
                          variant="success"
                          className="border-0 bg-success bg-opacity-10"
                        >
                          <i className="fas fa-award me-2"></i>
                          <strong>Classement : Top 30% des vendeurs</strong>
                          <p className="mb-0 mt-1 small">
                            Vous performez mieux que 70% des vendeurs OSKAR.
                            Continuez ainsi pour atteindre le top 10% !
                          </p>
                        </Alert>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </div>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Modal.Body>

      <Modal.Footer className="border-top bg-white py-4">
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col">
              <div className="d-flex align-items-center">
                <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                  <i className="fas fa-headset fa-lg text-success"></i>
                </div>
                <div>
                  <small className="text-muted d-block">
                    Support Expert Disponible
                  </small>
                  <div>
                    <span className="fw-bold text-dark me-3">
                      support@oskar.com
                    </span>
                    <span className="text-dark">+33 1 23 45 67 89</span>
                  </div>
                  <small className="text-success">
                    <i className="fas fa-clock me-1"></i>
                    Réponse garantie sous 2 heures
                  </small>
                </div>
              </div>
            </div>
            <div className="col-auto">
              <div className="d-flex gap-3">
                <Button
                  variant="outline-secondary"
                  onClick={onClose}
                  className="px-4 py-2"
                >
                  <i className="fas fa-times me-2"></i>
                  Fermer le Guide
                </Button>
                <Button
                  variant="success"
                  onClick={() => window.open("/seller-academy", "_blank")}
                  className="px-4 py-2"
                >
                  <i className="fas fa-graduation-cap me-2"></i>
                  Accéder à l'Académie
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal.Footer>

      <style jsx>{`
        .modal-90w {
          max-width: 90%;
        }

        .min-vh-50 {
          min-height: 50vh;
        }

        .sticky-top {
          position: sticky;
          top: 20px;
          z-index: 1020;
        }

        .extra-small {
          font-size: 0.75rem;
        }

        .nav-pills .nav-link.active {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 768px) {
          .modal-90w {
            max-width: 95%;
            margin: 10px auto;
          }

          .nav-pills {
            overflow-x: auto;
            flex-wrap: nowrap;
            padding-bottom: 10px;
          }

          .nav-pills .nav-link {
            white-space: nowrap;
          }
        }
      `}</style>
    </Modal>
  );
}
