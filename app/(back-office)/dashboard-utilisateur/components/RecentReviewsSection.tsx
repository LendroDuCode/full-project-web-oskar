"use client";

import { Container, Row, Col, Card, Button } from "react-bootstrap";
import Image from "next/image";

interface Review {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  comment: string;
  product: string;
  timeAgo: string;
}

export default function RecentReviewsSection() {
  const reviews: Review[] = [
    {
      id: 1,
      name: "Aïcha Diallo",
      avatar:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg",
      rating: 5,
      comment:
        "Excellent seller! The laptop was exactly as described and in perfect condition. Very professional and quick to respond. Highly recommend!",
      product: "Samsung Galaxy S21 Ultra",
      timeAgo: "2 days ago",
    },
    {
      id: 2,
      name: "Ibrahim Koné",
      avatar:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg",
      rating: 5,
      comment:
        "Great experience! The sofa is beautiful and very comfortable. Kouadio was very helpful and arranged delivery. Thank you!",
      product: "Modern Leather Sofa Set",
      timeAgo: "1 week ago",
    },
    {
      id: 3,
      name: "Marie Touré",
      avatar:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg",
      rating: 4,
      comment:
        "Good seller, item was as described. Communication could have been faster but overall a positive experience.",
      product: "Nike Air Max Running Shoes",
      timeAgo: "2 weeks ago",
    },
  ];

  const renderStars = (rating: number) => {
    return (
      <div className="d-flex gap-1">
        {[...Array(5)].map((_, i) => (
          <i
            key={i}
            className={`fas ${i < rating ? "fa-star" : "fa-star"} ${
              i < rating ? "text-warning" : "text-muted"
            }`}
          ></i>
        ))}
      </div>
    );
  };

  return (
    <section id="recent-reviews-section" className="bg-white py-5">
      <Container>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-5">
          <div className="mb-4 mb-md-0">
            <h2 className="h2 fw-bold text-dark mb-2">Recent Reviews</h2>
            <p className="text-muted">What buyers are saying about me</p>
          </div>

          <Button
            variant="link"
            className="text-warning fw-semibold p-0 text-decoration-none d-flex align-items-center gap-2"
          >
            <span>View All Reviews</span>
            <i className="fas fa-arrow-right"></i>
          </Button>
        </div>

        <Row className="g-4">
          {reviews.map((review) => (
            <Col key={review.id} xs={12} md={6} lg={4}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-start gap-3 mb-3">
                    <div className="position-relative flex-shrink-0">
                      <Image
                        src={review.avatar}
                        alt={review.name}
                        width={48}
                        height={48}
                        className="rounded-circle object-fit-cover"
                      />
                    </div>
                    <div>
                      <div className="fw-bold mb-1">{review.name}</div>
                      {renderStars(review.rating)}
                    </div>
                  </div>

                  <p className="text-muted small mb-4">"{review.comment}"</p>

                  <div className="d-flex justify-content-between align-items-center small text-muted mt-auto">
                    <span className="text-truncate">{review.product}</span>
                    <span className="text-nowrap">{review.timeAgo}</span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}
