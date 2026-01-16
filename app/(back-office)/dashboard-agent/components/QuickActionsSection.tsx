import { Container, Row, Col, Button } from "react-bootstrap";

export default function QuickActionsSection() {
  return (
    <section
      id="quick-actions-section"
      className="mt-5 mt-md-8 rounded-3 p-4 p-md-8 text-white"
      style={{
        background: "linear-gradient(90deg, #198754 0%, #0d6efd 100%)",
      }}
    >
      <Container>
        <Row className="align-items-center">
          <Col lg={8}>
            <h2 className="h2 fw-bold mb-2">Actions Rapides</h2>
            <p className="text-white text-opacity-85 mb-4 mb-md-6">
              Accédez rapidement aux fonctionnalités principales
            </p>

            <div className="d-flex flex-wrap gap-3">
              <Button
                variant="light"
                size="lg"
                className="px-4 px-md-6 py-2 py-md-3 fw-semibold d-flex align-items-center"
              >
                <i className="fas fa-gavel me-2"></i>
                Modérer Annonces
              </Button>

              <Button
                variant="outline-light"
                size="lg"
                className="px-4 px-md-6 py-2 py-md-3 fw-semibold d-flex align-items-center"
              >
                <i className="fas fa-certificate me-2"></i>
                Certifier Comptes
              </Button>

              <Button
                variant="outline-light"
                size="lg"
                className="px-4 px-md-6 py-2 py-md-3 fw-semibold d-flex align-items-center"
              >
                <i className="fas fa-flag me-2"></i>
                Voir Signalements
              </Button>
            </div>
          </Col>

          <Col lg={4} className="text-center mt-4 mt-lg-0">
            <div
              className="rounded-circle d-inline-flex align-items-center justify-content-center"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                width: "140px",
                height: "140px",
              }}
            >
              <i className="fas fa-bolt display-4"></i>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
}
