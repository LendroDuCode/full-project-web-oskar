// src/pages/Home.tsx
"use client";

import React from "react";
import { SearchProvider } from "./contexts/SearchContext";
import HeroSearch from "./components/HeroSearch";
import Breadcrumb from "./components/Breadcrumb";
import MainContent from "./components/MainContent";
import QuickStats from "./components/QuickStats";
import CategoriesShowcase from "./components/CategoriesShowcase";
import WhyOskar from "./components/WhyOskar";
import CTABanner from "./components/CTABanner";
import Testimonials from "./components/Testimonials";
import AppDownload from "./components/AppDownload";
import HeroCarousel from "./components/HeroCarousel";

const Home: React.FC = () => {
  return (
    <SearchProvider>
      <div className="bg-oskar-light-grey min-h-screen">
        <HeroSearch />
        <HeroCarousel />
        <Breadcrumb />
        <MainContent />
        <QuickStats />
        <CategoriesShowcase />
        <WhyOskar />
        <CTABanner />
        <Testimonials />
        <AppDownload />
      </div>
    </SearchProvider>
  );
};

export default Home;
