"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/shared/components/layout/Header";
import BreadcrumbSection from "./components/BreadcrumbSection";
import ProfileHeaderSection from "./components/ProfileHeaderSection";
import ProfileSidebar from "./components/ProfileSidebar";
import ProfileTabs from "./components/ProfileTabs";
import { Container, Row, Col } from "react-bootstrap";
import RecentReviewsSection from "./components/RecentReviewsSection";
import ActivityTimelineSection from "./components/ActivityTimelineSection";
import RecommendationsSection from "./components/RecommendationsSection";

const UtilisateurDashboard = () => {
  return (
    <>
      <Header />
      <BreadcrumbSection />
      <ProfileHeaderSection />
      <main className="flex-grow-1 overflow-auto py-4">
        <Container>
          <Row className="g-4">
            {/* Colonne principale avec les onglets (lg:col-span-2) */}
            <Col lg={8}>
              <ProfileTabs />
            </Col>

            {/* Sidebar (lg:col-span-1) */}
            <Col lg={4}>
              <ProfileSidebar />
            </Col>
          </Row>
        </Container>
      </main>
      <RecentReviewsSection />
      <ActivityTimelineSection />
      <RecommendationsSection />
    </>
  );
};

export default UtilisateurDashboard;
