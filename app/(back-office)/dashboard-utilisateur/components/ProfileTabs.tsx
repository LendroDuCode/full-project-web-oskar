"use client";

import { useState } from "react";
import {
  Card,
  Tab,
  Tabs,
  Form,
  Button,
  Badge,
  Table,
  Image,
  Row,
  Col,
  ProgressBar,
  FormCheck,
  InputGroup,
  FormControl,
} from "react-bootstrap";

export default function ProfileTabs() {
  const [activeTab, setActiveTab] = useState("personal-info");

  return (
    <div className="d-flex flex-column gap-4">
      {/* Navigation Tabs */}
      <Card className="border-0 shadow-sm rounded-3 overflow-hidden">
        <Card.Body className="p-2">
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k || "personal-info")}
            className="nav-tabs-bottom flex-nowrap"
            fill
          >
            <Tab
              eventKey="personal-info"
              title={
                <span className="d-flex align-items-center gap-2">
                  <i className="fas fa-user"></i>
                  <span className="d-none d-md-inline">Personal Info</span>
                </span>
              }
              className="border-0"
            >
              {/* Personal Info Content */}
              <div className="mt-4">
                <Card className="border-0 shadow-sm rounded-4">
                  <Card.Body className="p-4 p-md-6">
                    <div className="d-flex justify-content-between align-items-center mb-5">
                      <h2 className="h3 fw-bold mb-0">Personal Information</h2>
                      <Button
                        variant="link"
                        className="text-warning fw-semibold p-0"
                      >
                        <i className="fas fa-pen me-2"></i>
                        Edit
                      </Button>
                    </div>

                    <Row className="g-4 mb-5">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-semibold text-secondary small mb-2">
                            Full Name
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value="Kouadio Marcel"
                            readOnly
                            className="border-2"
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-semibold text-secondary small mb-2">
                            Username
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value="kouadio_marcel"
                            readOnly
                            className="border-2"
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-semibold text-secondary small mb-2">
                            Email Address
                          </Form.Label>
                          <InputGroup>
                            <Form.Control
                              type="email"
                              value="kouadio.marcel@example.com"
                              readOnly
                              className="border-2"
                            />
                            <InputGroup.Text className="bg-transparent border-0">
                              <i className="fas fa-check-circle text-success"></i>
                            </InputGroup.Text>
                          </InputGroup>
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-semibold text-secondary small mb-2">
                            Phone Number
                          </Form.Label>
                          <InputGroup>
                            <Form.Control
                              type="tel"
                              value="+225 07 XX XX XX 89"
                              readOnly
                              className="border-2"
                            />
                            <InputGroup.Text className="bg-transparent border-0">
                              <i className="fas fa-check-circle text-success"></i>
                            </InputGroup.Text>
                          </InputGroup>
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-semibold text-secondary small mb-2">
                            Date of Birth
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value="March 15, 1992"
                            readOnly
                            className="border-2"
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-semibold text-secondary small mb-2">
                            Gender
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value="Male"
                            readOnly
                            className="border-2"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="border-top pt-5 mb-5">
                      <h3 className="h4 fw-bold mb-4">Location Details</h3>

                      <Row className="g-4">
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-semibold text-secondary small mb-2">
                              City
                            </Form.Label>
                            <Form.Control
                              type="text"
                              value="Abidjan"
                              readOnly
                              className="border-2"
                            />
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-semibold text-secondary small mb-2">
                              Neighborhood
                            </Form.Label>
                            <Form.Control
                              type="text"
                              value="Yopougon"
                              readOnly
                              className="border-2"
                            />
                          </Form.Group>
                        </Col>

                        <Col md={12}>
                          <Form.Group>
                            <Form.Label className="fw-semibold text-secondary small mb-2">
                              Street Address
                            </Form.Label>
                            <Form.Control
                              type="text"
                              value="Rue des Jardiniers, Quartier Sicogi"
                              readOnly
                              className="border-2"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>

                    <div className="border-top pt-5">
                      <h3 className="h4 fw-bold mb-4">About Me</h3>

                      <Form.Group>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          value="Passionate about technology and sustainable living. I believe in the power of sharing and community. Always happy to meet new people and help others find what they need. Let's make Abidjan a better place together!"
                          readOnly
                          className="border-2 resize-none"
                        />
                      </Form.Group>

                      <div className="d-flex flex-wrap gap-2 mt-4">
                        <Badge
                          pill
                          className="bg-warning-subtle text-warning px-3 py-2"
                        >
                          Electronics Enthusiast
                        </Badge>
                        <Badge
                          pill
                          className="bg-info-subtle text-info px-3 py-2"
                        >
                          Eco-Friendly
                        </Badge>
                        <Badge
                          pill
                          className="bg-success-subtle text-success px-3 py-2"
                        >
                          Community Helper
                        </Badge>
                        <Badge
                          pill
                          className="bg-purple bg-opacity-10 text-purple px-3 py-2"
                        >
                          Reliable Seller
                        </Badge>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </Tab>

            <Tab
              eventKey="my-ads"
              title={
                <span className="d-flex align-items-center gap-2">
                  <i className="fas fa-rectangle-ad"></i>
                  <span className="d-none d-md-inline">My Ads</span>
                </span>
              }
            >
              {/* My Ads Content */}
              <div className="mt-4">
                <Card className="border-0 shadow-sm rounded-4 mb-4">
                  <Card.Body className="p-4 p-md-6">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-5">
                      <div className="mb-4 mb-md-0">
                        <h2 className="h3 fw-bold mb-2">My Ads</h2>
                        <p className="text-muted mb-0">
                          Manage all your posted advertisements
                        </p>
                      </div>

                      <div className="d-flex gap-2">
                        <Button variant="warning" className="px-4 py-2">
                          All (32)
                        </Button>
                        <Button
                          variant="outline-secondary"
                          className="px-4 py-2"
                        >
                          Active (24)
                        </Button>
                        <Button
                          variant="outline-secondary"
                          className="px-4 py-2"
                        >
                          Sold (8)
                        </Button>
                      </div>
                    </div>

                    <Form.Group className="mb-4">
                      <InputGroup>
                        <InputGroup.Text>
                          <i className="fas fa-magnifying-glass text-muted"></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Search your ads..."
                          className="border-2"
                        />
                      </InputGroup>
                    </Form.Group>

                    {/* Ad Items */}
                    <div className="d-flex flex-column gap-3">
                      {/* Ad 1 */}
                      <Card className="border-2 hover-shadow">
                        <Card.Body className="p-4">
                          <Row className="g-4">
                            <Col xs={12} md="auto" className="text-center">
                              <div className="position-relative">
                                <Image
                                  src="https://storage.googleapis.com/uxpilot-auth.appspot.com/ed4bf3e05f-a4015f71fc72b75c6c78.png"
                                  alt="Samsung Galaxy S21"
                                  className="rounded-3 object-fit-cover"
                                  style={{ width: "180px", height: "180px" }}
                                />
                              </div>
                            </Col>

                            <Col>
                              <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                  <h3 className="h5 fw-bold mb-2">
                                    Samsung Galaxy S21 Ultra
                                  </h3>
                                  <div className="d-flex flex-wrap gap-3 text-muted small mb-2">
                                    <span className="d-flex align-items-center gap-1">
                                      <i className="fas fa-tag"></i>
                                      Electronics
                                    </span>
                                    <span className="d-flex align-items-center gap-1">
                                      <i className="fas fa-location-dot"></i>
                                      Cocody, Abidjan
                                    </span>
                                    <span className="d-flex align-items-center gap-1">
                                      <i className="fas fa-clock"></i>
                                      Posted 3 days ago
                                    </span>
                                  </div>
                                  <p className="text-muted small mb-3">
                                    Excellent condition, barely used. Includes
                                    original box, charger, and protective case.
                                    256GB storage, 5G enabled.
                                  </p>
                                </div>
                                <Badge bg="success" className="px-3 py-2">
                                  Active
                                </Badge>
                              </div>

                              <div className="border-top pt-3">
                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
                                  <div className="mb-3 mb-md-0">
                                    <div className="h4 fw-bold text-success mb-2">
                                      350,000 FCFA
                                    </div>
                                    <div className="d-flex gap-4 text-muted small">
                                      <span className="d-flex align-items-center gap-1">
                                        <i className="fas fa-eye"></i>
                                        1,247 views
                                      </span>
                                      <span className="d-flex align-items-center gap-1">
                                        <i className="fas fa-heart"></i>
                                        89 saves
                                      </span>
                                      <span className="d-flex align-items-center gap-1">
                                        <i className="fas fa-message"></i>
                                        23 inquiries
                                      </span>
                                    </div>
                                  </div>

                                  <div className="d-flex gap-2">
                                    <Button
                                      variant="light"
                                      size="sm"
                                      className="p-2"
                                    >
                                      <i className="fas fa-pen"></i>
                                    </Button>
                                    <Button
                                      variant="light"
                                      size="sm"
                                      className="p-2"
                                    >
                                      <i className="fas fa-rocket"></i>
                                    </Button>
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      className="p-2"
                                    >
                                      <i className="fas fa-trash"></i>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>

                      {/* Ad 2 */}
                      <Card className="border-2 hover-shadow">
                        <Card.Body className="p-4">
                          <Row className="g-4">
                            <Col xs={12} md="auto" className="text-center">
                              <div className="position-relative">
                                <Image
                                  src="https://storage.googleapis.com/uxpilot-auth.appspot.com/3fa153a5ab-4cc5379935c9408dbdbf.png"
                                  alt="Modern Leather Sofa"
                                  className="rounded-3 object-fit-cover"
                                  style={{ width: "180px", height: "180px" }}
                                />
                              </div>
                            </Col>

                            <Col>
                              <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                  <h3 className="h5 fw-bold mb-2">
                                    Modern Leather Sofa Set
                                  </h3>
                                  <div className="d-flex flex-wrap gap-3 text-muted small mb-2">
                                    <span className="d-flex align-items-center gap-1">
                                      <i className="fas fa-tag"></i>
                                      Home & Furniture
                                    </span>
                                    <span className="d-flex align-items-center gap-1">
                                      <i className="fas fa-location-dot"></i>
                                      Yopougon, Abidjan
                                    </span>
                                    <span className="d-flex align-items-center gap-1">
                                      <i className="fas fa-clock"></i>
                                      Posted 1 week ago
                                    </span>
                                  </div>
                                  <p className="text-muted small mb-3">
                                    3-seater leather sofa in excellent
                                    condition. Brown color, very comfortable.
                                    Moving to a smaller apartment.
                                  </p>
                                </div>
                                <Badge bg="success" className="px-3 py-2">
                                  Active
                                </Badge>
                              </div>

                              <div className="border-top pt-3">
                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
                                  <div className="mb-3 mb-md-0">
                                    <div className="h4 fw-bold text-success mb-2">
                                      125,000 FCFA
                                    </div>
                                    <div className="d-flex gap-4 text-muted small">
                                      <span className="d-flex align-items-center gap-1">
                                        <i className="fas fa-eye"></i>
                                        856 views
                                      </span>
                                      <span className="d-flex align-items-center gap-1">
                                        <i className="fas fa-heart"></i>
                                        45 saves
                                      </span>
                                      <span className="d-flex align-items-center gap-1">
                                        <i className="fas fa-message"></i>
                                        12 inquiries
                                      </span>
                                    </div>
                                  </div>

                                  <div className="d-flex gap-2">
                                    <Button
                                      variant="light"
                                      size="sm"
                                      className="p-2"
                                    >
                                      <i className="fas fa-pen"></i>
                                    </Button>
                                    <Button
                                      variant="light"
                                      size="sm"
                                      className="p-2"
                                    >
                                      <i className="fas fa-rocket"></i>
                                    </Button>
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      className="p-2"
                                    >
                                      <i className="fas fa-trash"></i>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    </div>

                    <div className="text-center mt-5">
                      <Button variant="light" className="px-5 py-3 fw-semibold">
                        Load More Ads
                      </Button>
                    </div>
                  </Card.Body>
                </Card>

                {/* Ad Performance Chart Placeholder */}
                <Card className="border-0 shadow-sm rounded-4">
                  <Card.Body className="p-4 p-md-6">
                    <h3 className="h4 fw-bold mb-4">Ad Performance Overview</h3>
                    <div
                      className="bg-light rounded-3 d-flex align-items-center justify-content-center"
                      style={{ height: "400px" }}
                    >
                      <div className="text-center text-muted">
                        <i className="fas fa-chart-line display-4 mb-3 opacity-50"></i>
                        <p className="mb-0">
                          Performance chart will be displayed here
                        </p>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </Tab>

            <Tab
              eventKey="transactions"
              title={
                <span className="d-flex align-items-center gap-2">
                  <i className="fas fa-receipt"></i>
                  <span className="d-none d-md-inline">Transactions</span>
                </span>
              }
            >
              {/* Transactions Content */}
              <div className="mt-4">
                <Card className="border-0 shadow-sm rounded-4 mb-4">
                  <Card.Body className="p-4 p-md-6">
                    <div className="d-flex justify-content-between align-items-start align-items-md-center mb-5">
                      <div className="mb-4 mb-md-0">
                        <h2 className="h3 fw-bold mb-2">Transaction History</h2>
                        <p className="text-muted mb-0">
                          View all your buying and selling activities
                        </p>
                      </div>

                      <div className="d-flex gap-2">
                        <Button variant="warning" className="px-4 py-2">
                          All
                        </Button>
                        <Button
                          variant="outline-secondary"
                          className="px-4 py-2"
                        >
                          Sales
                        </Button>
                        <Button
                          variant="outline-secondary"
                          className="px-4 py-2"
                        >
                          Purchases
                        </Button>
                      </div>
                    </div>

                    <div className="table-responsive">
                      <Table hover className="align-middle">
                        <thead>
                          <tr>
                            <th className="text-secondary fw-semibold">Date</th>
                            <th className="text-secondary fw-semibold">Item</th>
                            <th className="text-secondary fw-semibold">Type</th>
                            <th className="text-secondary fw-semibold">
                              Amount
                            </th>
                            <th className="text-secondary fw-semibold">
                              Status
                            </th>
                            <th className="text-secondary fw-semibold">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Transaction 1 */}
                          <tr>
                            <td className="fw-medium">Dec 15, 2024</td>
                            <td>
                              <div className="d-flex align-items-center gap-3">
                                <Image
                                  src="https://storage.googleapis.com/uxpilot-auth.appspot.com/cf4b1131a2-dd72b60185bcf32ca707.png"
                                  alt="MacBook Pro"
                                  className="rounded-2"
                                  style={{
                                    width: "48px",
                                    height: "48px",
                                    objectFit: "cover",
                                  }}
                                />
                                <div>
                                  <div className="fw-semibold">
                                    MacBook Pro 2021
                                  </div>
                                  <small className="text-muted">
                                    Electronics
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <Badge bg="success" className="px-3 py-2">
                                Sale
                              </Badge>
                            </td>
                            <td className="fw-bold text-success">
                              +450,000 FCFA
                            </td>
                            <td>
                              <Badge
                                bg="success"
                                className="px-3 py-2 d-inline-flex align-items-center gap-1"
                              >
                                <i className="fas fa-check-circle"></i>
                                Completed
                              </Badge>
                            </td>
                            <td>
                              <Button
                                variant="link"
                                className="text-warning fw-semibold p-0"
                              >
                                View Details
                              </Button>
                            </td>
                          </tr>

                          {/* Transaction 2 */}
                          <tr>
                            <td className="fw-medium">Dec 10, 2024</td>
                            <td>
                              <div className="d-flex align-items-center gap-3">
                                <Image
                                  src="https://storage.googleapis.com/uxpilot-auth.appspot.com/f0ff2d9c45-074c5453d62cfbd058bc.png"
                                  alt="Mountain Bike"
                                  className="rounded-2"
                                  style={{
                                    width: "48px",
                                    height: "48px",
                                    objectFit: "cover",
                                  }}
                                />
                                <div>
                                  <div className="fw-semibold">
                                    Mountain Bike
                                  </div>
                                  <small className="text-muted">
                                    Sports & Outdoors
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <Badge bg="info" className="px-3 py-2">
                                Exchange
                              </Badge>
                            </td>
                            <td className="fw-bold">Exchange</td>
                            <td>
                              <Badge
                                bg="success"
                                className="px-3 py-2 d-inline-flex align-items-center gap-1"
                              >
                                <i className="fas fa-check-circle"></i>
                                Completed
                              </Badge>
                            </td>
                            <td>
                              <Button
                                variant="link"
                                className="text-warning fw-semibold p-0"
                              >
                                View Details
                              </Button>
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </div>

                    <div className="text-center mt-5">
                      <Button variant="light" className="px-5 py-3 fw-semibold">
                        Load More Transactions
                      </Button>
                    </div>
                  </Card.Body>
                </Card>

                {/* Charts Row */}
                <Row className="g-4">
                  <Col md={6}>
                    <Card className="border-0 shadow-sm rounded-4 h-100">
                      <Card.Body className="p-4">
                        <h3 className="h4 fw-bold mb-4">Monthly Revenue</h3>
                        <div
                          className="bg-light rounded-3 d-flex align-items-center justify-content-center"
                          style={{ height: "300px" }}
                        >
                          <div className="text-center text-muted">
                            <i className="fas fa-chart-bar display-4 mb-3 opacity-50"></i>
                            <p className="mb-0">Revenue chart</p>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={6}>
                    <Card className="border-0 shadow-sm rounded-4 h-100">
                      <Card.Body className="p-4">
                        <h3 className="h4 fw-bold mb-4">Transaction Types</h3>
                        <div
                          className="bg-light rounded-3 d-flex align-items-center justify-content-center"
                          style={{ height: "300px" }}
                        >
                          <div className="text-center text-muted">
                            <i className="fas fa-chart-pie display-4 mb-3 opacity-50"></i>
                            <p className="mb-0">Transaction types chart</p>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </div>
            </Tab>

            <Tab
              eventKey="settings"
              title={
                <span className="d-flex align-items-center gap-2">
                  <i className="fas fa-gear"></i>
                  <span className="d-none d-md-inline">Settings</span>
                </span>
              }
            >
              {/* Settings Content */}
              <div className="mt-4">
                <Card className="border-0 shadow-sm rounded-4 mb-4">
                  <Card.Body className="p-4 p-md-6">
                    <h2 className="h3 fw-bold mb-5">Account Settings</h2>

                    <div className="d-flex flex-column gap-5">
                      {/* Privacy Settings */}
                      <div className="border-bottom pb-5">
                        <h3 className="h5 fw-bold mb-4">Privacy Settings</h3>

                        <div className="d-flex flex-column gap-3">
                          <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3">
                            <div>
                              <div className="fw-semibold">
                                Show my profile to public
                              </div>
                              <small className="text-muted">
                                Others can see your profile and ads
                              </small>
                            </div>
                            <FormCheck
                              type="switch"
                              id="profile-public"
                              checked
                              onChange={() => {}}
                            />
                          </div>

                          <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3">
                            <div>
                              <div className="fw-semibold">
                                Show my phone number
                              </div>
                              <small className="text-muted">
                                Display phone number on ads
                              </small>
                            </div>
                            <FormCheck
                              type="switch"
                              id="phone-public"
                              checked
                              onChange={() => {}}
                            />
                          </div>

                          <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3">
                            <div>
                              <div className="fw-semibold">
                                Show my location
                              </div>
                              <small className="text-muted">
                                Display city and neighborhood
                              </small>
                            </div>
                            <FormCheck
                              type="switch"
                              id="location-public"
                              checked
                              onChange={() => {}}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Notification Preferences */}
                      <div className="border-bottom pb-5">
                        <h3 className="h5 fw-bold mb-4">
                          Notification Preferences
                        </h3>

                        <div className="d-flex flex-column gap-3">
                          <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3">
                            <div>
                              <div className="fw-semibold">
                                Email notifications
                              </div>
                              <small className="text-muted">
                                Receive updates via email
                              </small>
                            </div>
                            <FormCheck
                              type="switch"
                              id="email-notifications"
                              checked
                              onChange={() => {}}
                            />
                          </div>

                          <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3">
                            <div>
                              <div className="fw-semibold">
                                SMS notifications
                              </div>
                              <small className="text-muted">
                                Get text messages for important updates
                              </small>
                            </div>
                            <FormCheck
                              type="switch"
                              id="sms-notifications"
                              checked
                              onChange={() => {}}
                            />
                          </div>

                          <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3">
                            <div>
                              <div className="fw-semibold">
                                Push notifications
                              </div>
                              <small className="text-muted">
                                Browser notifications for messages
                              </small>
                            </div>
                            <FormCheck
                              type="switch"
                              id="push-notifications"
                              onChange={() => {}}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Security */}
                      <div className="border-bottom pb-5">
                        <h3 className="h5 fw-bold mb-4">Security</h3>

                        <div className="d-flex flex-column gap-3">
                          <Button
                            variant="light"
                            className="d-flex justify-content-between align-items-center p-3"
                          >
                            <div className="d-flex align-items-center gap-3">
                              <div className="bg-warning rounded-2 p-3">
                                <i className="fas fa-key text-white"></i>
                              </div>
                              <div className="text-start">
                                <div className="fw-semibold">
                                  Change Password
                                </div>
                                <small className="text-muted">
                                  Update your account password
                                </small>
                              </div>
                            </div>
                            <i className="fas fa-chevron-right text-muted"></i>
                          </Button>

                          <Button
                            variant="light"
                            className="d-flex justify-content-between align-items-center p-3"
                          >
                            <div className="d-flex align-items-center gap-3">
                              <div className="bg-info rounded-2 p-3">
                                <i className="fas fa-shield-halved text-white"></i>
                              </div>
                              <div className="text-start">
                                <div className="fw-semibold">
                                  Two-Factor Authentication
                                </div>
                                <small className="text-muted">
                                  Add extra security to your account
                                </small>
                              </div>
                            </div>
                            <i className="fas fa-chevron-right text-muted"></i>
                          </Button>
                        </div>
                      </div>

                      {/* Payment Methods */}
                      <div className="border-bottom pb-5">
                        <h3 className="h5 fw-bold mb-4">Payment Methods</h3>

                        <div className="d-flex flex-column gap-3">
                          <Card className="bg-light border-0">
                            <Card.Body className="p-3">
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                <div className="d-flex align-items-center gap-3">
                                  <div className="bg-gradient bg-info-subtle rounded-2 p-3">
                                    <i className="fab fa-cc-visa text-dark fs-4"></i>
                                  </div>
                                  <div>
                                    <div className="fw-semibold">
                                      Visa •••• 4242
                                    </div>
                                    <small className="text-muted">
                                      Expires 12/25
                                    </small>
                                  </div>
                                </div>
                                <Badge bg="success" className="px-3 py-2">
                                  Primary
                                </Badge>
                              </div>
                              <div className="d-flex gap-2">
                                <Button variant="light" className="flex-grow-1">
                                  Edit
                                </Button>
                                <Button
                                  variant="light"
                                  className="flex-grow-1 text-danger"
                                >
                                  Remove
                                </Button>
                              </div>
                            </Card.Body>
                          </Card>

                          <Button
                            variant="outline-warning"
                            className="d-flex align-items-center justify-content-center gap-2 p-3"
                          >
                            <i className="fas fa-plus"></i>
                            Add Payment Method
                          </Button>
                        </div>
                      </div>

                      {/* Danger Zone */}
                      <div>
                        <h3 className="h5 fw-bold mb-4 text-danger">
                          Danger Zone
                        </h3>

                        <div className="d-flex flex-column gap-3">
                          <Button
                            variant="outline-danger"
                            className="d-flex justify-content-between align-items-center p-3"
                          >
                            <div className="d-flex align-items-center gap-3">
                              <div className="bg-danger rounded-2 p-3">
                                <i className="fas fa-user-slash text-white"></i>
                              </div>
                              <div className="text-start">
                                <div className="fw-semibold text-danger">
                                  Deactivate Account
                                </div>
                                <small className="text-danger">
                                  Temporarily disable your account
                                </small>
                              </div>
                            </div>
                            <i className="fas fa-chevron-right text-danger"></i>
                          </Button>

                          <Button
                            variant="outline-danger"
                            className="d-flex justify-content-between align-items-center p-3"
                          >
                            <div className="d-flex align-items-center gap-3">
                              <div className="bg-danger rounded-2 p-3">
                                <i className="fas fa-trash text-white"></i>
                              </div>
                              <div className="text-start">
                                <div className="fw-semibold text-danger">
                                  Delete Account
                                </div>
                                <small className="text-danger">
                                  Permanently delete your account and data
                                </small>
                              </div>
                            </div>
                            <i className="fas fa-chevron-right text-danger"></i>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                {/* Help Card */}
                <Card className="border-0 shadow-sm rounded-4 bg-info bg-opacity-10 border-info">
                  <Card.Body className="p-4 p-md-6">
                    <div className="d-flex align-items-start gap-4">
                      <div className="bg-info rounded-circle p-3">
                        <i className="fas fa-info text-white fs-4"></i>
                      </div>
                      <div>
                        <h3 className="h5 fw-bold mb-2">Need Help?</h3>
                        <p className="text-muted mb-4">
                          If you have any questions about your account settings
                          or need assistance, our support team is here to help.
                        </p>
                        <Button
                          variant="info"
                          className="px-4 py-2 fw-semibold"
                        >
                          Contact Support
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </div>
  );
}
