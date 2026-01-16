import { Card, Button, Container, Row, Col, Badge } from "react-bootstrap";

export default function CertificationSection() {
  return (
    <section id="certification-section" className="mb-8">
      <Container>
        <h2 className="text-xl fw-bold text-dark-gray mb-4">
          Certification des Comptes
        </h2>

        <Row className="g-4">
          {/* Carte Particulier */}
          <Col md={6}>
            <Card className="h-100 border rounded-3 hover-shadow transition-all">
              <Card.Body className="p-4 p-md-5">
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div
                    className="rounded-circle p-3"
                    style={{ backgroundColor: "#f8f9fa" }}
                  >
                    <i className="fas fa-id-card fs-2 text-secondary"></i>
                  </div>
                  <Badge bg="light" text="dark" className="px-3 py-2">
                    CNI
                  </Badge>
                </div>

                <Card.Title className="h5 fw-bold text-dark-gray mb-2">
                  Comptes Particuliers
                </Card.Title>

                <Card.Text className="text-muted small mb-4">
                  Vérification CNI en attente
                </Card.Text>

                <div className="d-flex justify-content-between align-items-end">
                  <div>
                    <p className="display-4 fw-bold text-dark-gray mb-0">15</p>
                    <p className="text-muted small mt-1">demandes</p>
                  </div>

                  <Button variant="primary" className="px-4 py-2 fw-semibold">
                    Certifier
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Carte Professionnel */}
          <Col md={6}>
            <Card className="h-100 border rounded-3 hover-shadow transition-all">
              <Card.Body className="p-4 p-md-5">
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div
                    className="rounded-circle p-3"
                    style={{ backgroundColor: "#fff3cd" }}
                  >
                    <i
                      className="fas fa-building fs-2"
                      style={{ color: "#fd7e14" }}
                    ></i>
                  </div>
                  <Badge bg="warning" className="px-3 py-2 text-dark">
                    RCCM
                  </Badge>
                </div>

                <Card.Title className="h5 fw-bold text-dark-gray mb-2">
                  Comptes Professionnels
                </Card.Title>

                <Card.Text className="text-muted small mb-4">
                  Vérification RCCM en attente
                </Card.Text>

                <div className="d-flex justify-content-between align-items-end">
                  <div>
                    <p className="display-4 fw-bold text-dark-gray mb-0">8</p>
                    <p className="text-muted small mt-1">demandes</p>
                  </div>

                  <Button variant="primary" className="px-4 py-2 fw-semibold">
                    Certifier
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
}
