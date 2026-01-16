"use client";

import Image from "next/image";
import { Container, Row, Col, Button, Badge } from "react-bootstrap";

export default function ProfileHeaderSection() {
  return (
    <Container fluid="lg" className="mb-5">
      <div
        className="rounded-4 p-4 p-md-12 position-relative overflow-hidden"
        style={{
          background: "linear-gradient(90deg, #fd7e14 0%, #e96d00 100%)",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
        }}
      >
        {/* Effets décoratifs */}
        <div
          className="position-absolute top-0 end-0 bg-white opacity-5 rounded-circle"
          style={{
            width: "256px",
            height: "256px",
            marginRight: "-128px",
            marginTop: "-128px",
          }}
        ></div>
        <div
          className="position-absolute bottom-0 start-0 bg-white opacity-5 rounded-circle"
          style={{
            width: "192px",
            height: "192px",
            marginLeft: "-96px",
            marginBottom: "-96px",
          }}
        ></div>

        <Row className="align-items-center">
          {/* Avatar */}
          <Col xs={12} md="auto" className="mb-4 mb-md-0">
            <div className="position-relative d-inline-block">
              <div className="position-relative">
                <Image
                  src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg"
                  alt="Profile"
                  width={128}
                  height={128}
                  className="rounded-circle border-4 border-white shadow-lg object-fit-cover"
                />
                <Button
                  variant="light"
                  className="position-absolute bottom-0 end-0 rounded-circle p-2 shadow"
                  style={{ width: "40px", height: "40px" }}
                  aria-label="Changer la photo"
                >
                  <i className="fas fa-camera text-warning"></i>
                </Button>
              </div>
            </div>
          </Col>

          {/* Informations utilisateur */}
          <Col md className="text-center text-md-start text-white mb-4 mb-md-0">
            <h1 className="h2 fw-bold mb-2">Kouadio Marcel</h1>
            <p className="text-white text-opacity-85 mb-3">
              Member since January 2024
            </p>

            <div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-2">
              <Badge
                bg="light"
                text="dark"
                className="d-inline-flex align-items-center gap-2 px-3 py-2 bg-white bg-opacity-20 text-white border-0"
              >
                <i className="fas fa-location-dot"></i>
                <span>Yopougon, Abidjan</span>
              </Badge>

              <Badge
                bg="light"
                text="dark"
                className="d-inline-flex align-items-center gap-2 px-3 py-2 bg-white bg-opacity-20 text-white border-0"
              >
                <i className="fas fa-star"></i>
                <span>4.8 Rating</span>
              </Badge>

              <Badge
                bg="light"
                text="dark"
                className="d-inline-flex align-items-center gap-2 px-3 py-2 bg-white bg-opacity-20 text-white border-0"
              >
                <i className="fas fa-check-circle"></i>
                <span>Verified User</span>
              </Badge>
            </div>
          </Col>

          {/* Boutons d'action */}
          <Col
            xs={12}
            md="auto"
            className="d-flex justify-content-center justify-content-md-end gap-2"
          >
            <Button
              variant="light"
              className="px-4 px-md-6 py-3 fw-semibold d-flex align-items-center gap-2"
            >
              <i className="fas fa-pen"></i>
              <span className="d-none d-md-inline">Edit Profile</span>
            </Button>

            <Button
              variant="outline-light"
              className="px-3 py-3"
              aria-label="Partager"
            >
              <i className="fas fa-share-nodes"></i>
            </Button>
          </Col>
        </Row>
      </div>
    </Container>
  );
}
