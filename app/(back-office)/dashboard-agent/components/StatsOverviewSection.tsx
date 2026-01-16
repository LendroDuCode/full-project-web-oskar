import { Card, Container, Row, Col } from "react-bootstrap";

export default function StatsOverviewSection() {
  return (
    <section id="stats-overview-section" className="mb-8">
      <Container>
        <h2 className="text-xl fw-bold text-dark-gray mb-4">
          Statistiques Globales
        </h2>

        <Row className="g-3">
          {/* Carte 1: Annonces validées */}
          <Col xs={12} sm={6} lg={3}>
            <Card className="border rounded-3 h-100">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between mb-3">
                  <div className="bg-primary bg-opacity-10 rounded-3 p-3">
                    <i className="fas fa-check-circle fs-4 text-primary"></i>
                  </div>
                </div>
                <p className="fs-2 fw-bold text-dark mb-0">342</p>
                <p className="text-muted small mt-1">Annonces validées</p>
                <div className="d-flex align-items-center gap-1 mt-2">
                  <i className="fas fa-arrow-up text-success small"></i>
                  <span className="text-success small fw-semibold">+12%</span>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Carte 2: Annonces refusées */}
          <Col xs={12} sm={6} lg={3}>
            <Card className="border rounded-3 h-100">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between mb-3">
                  <div className="bg-danger bg-opacity-10 rounded-3 p-3">
                    <i className="fas fa-times-circle fs-4 text-danger"></i>
                  </div>
                </div>
                <p className="fs-2 fw-bold text-dark mb-0">28</p>
                <p className="text-muted small mt-1">Annonces refusées</p>
                <div className="d-flex align-items-center gap-1 mt-2">
                  <i className="fas fa-arrow-down text-danger small"></i>
                  <span className="text-danger small fw-semibold">-5%</span>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Carte 3: Comptes certifiés */}
          <Col xs={12} sm={6} lg={3}>
            <Card className="border rounded-3 h-100">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between mb-3">
                  <div className="bg-purple bg-opacity-10 rounded-3 p-3">
                    <i className="fas fa-certificate fs-4 text-purple"></i>
                  </div>
                </div>
                <p className="fs-2 fw-bold text-dark mb-0">156</p>
                <p className="text-muted small mt-1">Comptes certifiés</p>
                <div className="d-flex align-items-center gap-1 mt-2">
                  <i className="fas fa-arrow-up text-success small"></i>
                  <span className="text-success small fw-semibold">+8%</span>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Carte 4: Signalements traités */}
          <Col xs={12} sm={6} lg={3}>
            <Card className="border rounded-3 h-100">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between mb-3">
                  <div className="bg-warning bg-opacity-10 rounded-3 p-3">
                    <i className="fas fa-flag fs-4 text-warning"></i>
                  </div>
                </div>
                <p className="fs-2 fw-bold text-dark mb-0">19</p>
                <p className="text-muted small mt-1">Signalements traités</p>
                <div className="d-flex align-items-center gap-1 mt-2">
                  <i className="fas fa-minus text-body-secondary small"></i>
                  <span className="text-body-secondary small fw-semibold">
                    0%
                  </span>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
}
