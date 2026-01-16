"use client";

import { Card, Row, Col, ProgressBar } from "react-bootstrap";

export default function ProfileSidebar() {
  return (
    <div className="space-y-4">
      {/* Profile Statistics Card */}
      <Card className="border-0 shadow-lg rounded-4">
        <Card.Body className="p-4">
          <Card.Title className="h5 fw-bold text-dark mb-4">
            Profile Statistics
          </Card.Title>

          <div className="space-y-3">
            {/* Total Ads */}
            <div className="p-3 bg-warning bg-opacity-10 rounded-3">
              <div className="d-flex align-items-center">
                <div className="bg-warning rounded-3 p-3 me-3">
                  <i className="fas fa-rectangle-ad text-white fs-5"></i>
                </div>
                <div>
                  <p className="h4 fw-bold text-dark mb-0">47</p>
                  <p className="text-muted small mb-0">Total Ads</p>
                </div>
              </div>
            </div>

            {/* Active Ads */}
            <div className="p-3 bg-success bg-opacity-10 rounded-3">
              <div className="d-flex align-items-center">
                <div className="bg-success rounded-3 p-3 me-3">
                  <i className="fas fa-circle-check text-white fs-5"></i>
                </div>
                <div>
                  <p className="h4 fw-bold text-dark mb-0">32</p>
                  <p className="text-muted small mb-0">Active Ads</p>
                </div>
              </div>
            </div>

            {/* Transactions */}
            <div className="p-3 bg-info bg-opacity-10 rounded-3">
              <div className="d-flex align-items-center">
                <div className="bg-info rounded-3 p-3 me-3">
                  <i className="fas fa-handshake text-white fs-5"></i>
                </div>
                <div>
                  <p className="h4 fw-bold text-dark mb-0">89</p>
                  <p className="text-muted small mb-0">Transactions</p>
                </div>
              </div>
            </div>

            {/* Profile Views */}
            <div className="p-3 bg-purple bg-opacity-10 rounded-3">
              <div className="d-flex align-items-center">
                <div className="bg-purple rounded-3 p-3 me-3">
                  <i className="fas fa-eye text-white fs-5"></i>
                </div>
                <div>
                  <p className="h4 fw-bold text-dark mb-0">12.5K</p>
                  <p className="text-muted small mb-0">Profile Views</p>
                </div>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Seller Rating Card */}
      <Card className="border-0 shadow-lg rounded-4">
        <Card.Body className="p-4">
          <Card.Title className="h5 fw-bold text-dark mb-4">
            Seller Rating
          </Card.Title>

          <div className="text-center mb-4">
            <div className="display-5 fw-bold text-warning mb-2">4.8</div>
            <div className="d-flex justify-content-center gap-1 mb-2">
              <i className="fas fa-star text-warning fs-4"></i>
              <i className="fas fa-star text-warning fs-4"></i>
              <i className="fas fa-star text-warning fs-4"></i>
              <i className="fas fa-star text-warning fs-4"></i>
              <i className="fas fa-star-half-alt text-warning fs-4"></i>
            </div>
            <p className="text-muted small">Based on 156 reviews</p>
          </div>

          <div className="space-y-3">
            {/* 5 stars */}
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small w-20">5★</span>
              <ProgressBar
                now={78}
                className="flex-grow-1"
                style={{ height: "8px" }}
                variant="warning"
              />
              <span className="text-muted small w-20 text-end">78%</span>
            </div>

            {/* 4 stars */}
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small w-20">4★</span>
              <ProgressBar
                now={15}
                className="flex-grow-1"
                style={{ height: "8px" }}
                variant="warning"
              />
              <span className="text-muted small w-20 text-end">15%</span>
            </div>

            {/* 3 stars */}
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small w-20">3★</span>
              <ProgressBar
                now={5}
                className="flex-grow-1"
                style={{ height: "8px" }}
                variant="warning"
              />
              <span className="text-muted small w-20 text-end">5%</span>
            </div>

            {/* 2 stars */}
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small w-20">2★</span>
              <ProgressBar
                now={2}
                className="flex-grow-1"
                style={{ height: "8px" }}
                variant="warning"
              />
              <span className="text-muted small w-20 text-end">2%</span>
            </div>

            {/* 1 star */}
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small w-20">1★</span>
              <ProgressBar
                now={0}
                className="flex-grow-1"
                style={{ height: "8px" }}
                variant="warning"
              />
              <span className="text-muted small w-20 text-end">0%</span>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Achievements Card */}
      <Card className="border-0 shadow-lg rounded-4">
        <Card.Body className="p-4">
          <Card.Title className="h5 fw-bold text-dark mb-4">
            Achievements
          </Card.Title>

          <Row className="g-3">
            {/* Top Seller */}
            <Col xs={6}>
              <div className="text-center p-3 bg-warning bg-opacity-10 rounded-3 h-100">
                <div
                  className="bg-warning rounded-circle p-3 d-inline-flex align-items-center justify-content-center mb-2"
                  style={{ width: "64px", height: "64px" }}
                >
                  <i className="fas fa-trophy text-white fs-3"></i>
                </div>
                <p className="small fw-semibold text-dark mb-0">Top Seller</p>
              </div>
            </Col>

            {/* Fast Responder */}
            <Col xs={6}>
              <div className="text-center p-3 bg-info bg-opacity-10 rounded-3 h-100">
                <div
                  className="bg-info rounded-circle p-3 d-inline-flex align-items-center justify-content-center mb-2"
                  style={{ width: "64px", height: "64px" }}
                >
                  <i className="fas fa-bolt text-white fs-3"></i>
                </div>
                <p className="small fw-semibold text-dark mb-0">
                  Fast Responder
                </p>
              </div>
            </Col>

            {/* Community Hero */}
            <Col xs={6}>
              <div className="text-center p-3 bg-success bg-opacity-10 rounded-3 h-100">
                <div
                  className="bg-success rounded-circle p-3 d-inline-flex align-items-center justify-content-center mb-2"
                  style={{ width: "64px", height: "64px" }}
                >
                  <i className="fas fa-heart text-white fs-3"></i>
                </div>
                <p className="small fw-semibold text-dark mb-0">
                  Community Hero
                </p>
              </div>
            </Col>

            {/* Trusted Trader */}
            <Col xs={6}>
              <div className="text-center p-3 bg-purple bg-opacity-10 rounded-3 h-100">
                <div
                  className="bg-purple rounded-circle p-3 d-inline-flex align-items-center justify-content-center mb-2"
                  style={{ width: "64px", height: "64px" }}
                >
                  <i className="fas fa-star text-white fs-3"></i>
                </div>
                <p className="small fw-semibold text-dark mb-0">
                  Trusted Trader
                </p>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Verification Card */}
      <Card className="border-0 shadow-lg rounded-4 border-success border-2">
        <Card.Body className="p-4 bg-success bg-opacity-10">
          <div className="d-flex align-items-start gap-3">
            <div className="bg-success rounded-circle p-3 d-flex align-items-center justify-content-center flex-shrink-0">
              <i className="fas fa-shield-halved text-white fs-4"></i>
            </div>
            <div>
              <Card.Title className="h6 fw-bold text-dark mb-2">
                Verified Account
              </Card.Title>
              <p className="text-muted small mb-3">
                Your account has been verified with phone number and email
              </p>
              <div className="space-y-2">
                <div className="d-flex align-items-center gap-2 small">
                  <i className="fas fa-check-circle text-success"></i>
                  <span className="text-dark">Phone Verified</span>
                </div>
                <div className="d-flex align-items-center gap-2 small">
                  <i className="fas fa-check-circle text-success"></i>
                  <span className="text-dark">Email Verified</span>
                </div>
                <div className="d-flex align-items-center gap-2 small">
                  <i className="fas fa-check-circle text-success"></i>
                  <span className="text-dark">ID Verified</span>
                </div>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
