"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "../home/components/Breadcrumb";
import FavoritesControls from "./components/FavoritesControls";
import FavoritesGrid from "./components/FavoritesGrid";
import FavoritesHero from "./components/FavoritesHero";
import LoadMoreFavorites from "./components/LoadMoreFavorites";
import CollectionsSection from "./components/CollectionSection";
import SavedSearchesSection from "./components/SavedSearchesSection";
import FavoritesStatsSection from "./components/FavoritesStatsSection";
import TipsFavoritesSection from "./components/TipsFavoritesSection";

export default function ListeFavorisPage() {
  const [totalFavorites, setTotalFavorites] = useState(0);
  const [displayedFavorites, setDisplayedFavorites] = useState(9);

  // Exemple : simuler le chargement de données
  useEffect(() => {
    // Récupérer le nombre total depuis une API ou un contexte
    setTotalFavorites(24);
  }, []);

  const handleLoadMore = () => {
    // Logique pour charger plus d'articles
    setDisplayedFavorites((prev) => Math.min(prev + 9, totalFavorites));
  };

  return (
    <section className="py-5">
      <Breadcrumb />
      <FavoritesHero />
      <FavoritesControls />
      <FavoritesGrid displayedCount={displayedFavorites} />
      <LoadMoreFavorites
        totalItems={totalFavorites}
        onLoadMore={handleLoadMore}
      />
      <CollectionsSection />
      <SavedSearchesSection />
      <FavoritesStatsSection />
      <TipsFavoritesSection />
    </section>
  );
}
