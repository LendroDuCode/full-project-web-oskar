import { Card, Container, Row, Col, Button } from "react-bootstrap";

export default function ChartsSection() {
  return (
    <section id="charts-section" className="mb-8">
      <Container fluid>
        <Row className="g-4">
          {/* Section Graphique d'activité - 2/3 largeur */}
          <Col lg={8}>
            <Card className="border border-gray-200 rounded-3 h-100">
              <Card.Body className="p-4 p-md-5">
                <div className="d-flex justify-content-between align-items-center mb-5">
                  <Card.Title className="h5 fw-bold text-dark-gray mb-0">
                    Activité de Modération (7 jours)
                  </Card.Title>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-success"
                      size="sm"
                      className="px-3 py-2"
                      active
                    >
                      7 jours
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="px-3 py-2"
                    >
                      30 jours
                    </Button>
                  </div>
                </div>
                <div
                  id="activityChart"
                  className="bg-light rounded-3"
                  style={{
                    height: "300px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {/* Placeholder pour le graphique */}
                  <div className="text-center text-muted">
                    <i className="fas fa-chart-line fs-1 mb-2"></i>
                    <p className="mb-0">Graphique d'activité</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Section Répartition par type - 1/3 largeur */}
          <Col lg={4}>
            <Card className="border border-gray-200 rounded-3 h-100">
              <Card.Body className="p-4 p-md-5">
                <Card.Title className="h5 fw-bold text-dark-gray mb-5">
                  Répartition par Type
                </Card.Title>
                <div
                  id="categoryChart"
                  className="bg-light rounded-3"
                  style={{
                    height: "300px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {/* Placeholder pour le graphique */}
                  <div className="text-center text-muted">
                    <i className="fas fa-chart-pie fs-1 mb-2"></i>
                    <p className="mb-0">Graphique de répartition</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
}
