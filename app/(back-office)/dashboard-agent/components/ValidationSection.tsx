import { Card, Button, Container, Row, Col } from "react-bootstrap";

export default function ValidationSection() {
  return (
    <section id="validation-section" className="mb-8">
      <h2 className="text-xl fw-bold text-dark-gray mb-4">
        Validation des Annonces
      </h2>

      <Row>
        <Col xs={12}>
          <Card
            className="border-0 shadow-lg"
            style={{
              background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
            }}
          >
            <Card.Body className="p-4 p-md-5 text-white">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-warning mb-1" style={{ opacity: 0.9 }}>
                    Annonces à traiter
                  </p>
                  <p className="display-4 fw-bold mb-2">54</p>
                  <p className="text-warning mb-0" style={{ opacity: 0.9 }}>
                    En attente de validation
                  </p>
                </div>

                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    width: "80px",
                    height: "80px",
                  }}
                >
                  <i className="fas fa-rectangle-ad fs-1"></i>
                </div>
              </div>

              <Button
                variant="light"
                className="mt-4 w-100 py-3 fw-semibold"
                style={{ color: "#d97706" }}
              >
                Traiter les annonces
                <i className="fas fa-arrow-right ms-2"></i>
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </section>
  );
}
