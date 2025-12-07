// src/pages/Home.tsx
import React from "react";
import HeroSearch from "./components/HeroSearch";
import Breadcrumb from "./components/Breadcrumb";
import FilterStatsBar from "./components/FilterStatsBar";
import MainContent from "./components/MainContent";
import QuickStats from "./components/QuickStats";
import CategoriesShowcase from "./components/CategoriesShowcase";
import WhyOskar from "./components/WhyOskar";
import CTABanner from "./components/CTABanner";
import Testimonials from "./components/Testimonials";
import AppDownload from "./components/AppDownload";

const Home: React.FC = () => {
  return (
    <div className="bg-oskar-light-grey min-h-screen">
      {/* Tu peux ajouter d'autres sections au-dessus ou en dessous */}
      <HeroSearch />
      <Breadcrumb />
      <FilterStatsBar />
      <MainContent />
      <QuickStats />
      <CategoriesShowcase />
      <WhyOskar />
      <CTABanner />
      <Testimonials />
      <AppDownload />
      {/* Exemple de zone de contenu supplémentaire */}
    </div>
  );
};

export default Home;
