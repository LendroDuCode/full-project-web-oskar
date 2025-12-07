// app/contact/page.tsx
"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faClock,
  faMessage,
  faUser,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import colors from "../../shared/constants/colors";
import SimpleBreadcrumb from "./components/SimpleBreadcrumb";
import ContactHero from "./components/ContactHero";
import ContactMethods from "./components/ContactMethods";
import ContactFormSection from "./components/ContactFormSection";
import MapSection from "./components/MapSection";
import FAQSection from "./components/FAQSection";
import EmergencyContactSection from "./components/EmergencyContactSection";
import TestimonialsSection from "./components/TestimonialsSection";
import CTASection from "./components/CTASection";

export default function ContactPage() {
  return (
    <div className="min-vh-100 bg-light">
      <SimpleBreadcrumb />
      <ContactHero />
      <ContactMethods />
      <ContactFormSection />
      <MapSection />
      <FAQSection />
      <EmergencyContactSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
}
