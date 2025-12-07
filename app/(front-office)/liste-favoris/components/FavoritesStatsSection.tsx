"use client";

import { useState, useEffect } from "react";

interface StatItem {
  id: number;
  value: number;
  label: string;
  icon?: string;
}

export default function FavoritesStatsSection() {
  const [stats, setStats] = useState<StatItem[]>([
    { id: 1, value: 24, label: "Total des favoris", icon: "bi-heart" },
    { id: 2, value: 4, label: "Collections", icon: "bi-collection" },
    { id: 3, value: 3, label: "Alertes actives", icon: "bi-bell" },
    { id: 4, value: 12, label: "Articles consultés", icon: "bi-eye" },
  ]);

  // Simulation de données dynamiques (optionnel)
  const simulateDataUpdate = () => {
    // Vous pouvez remplacer ceci par un appel API réel
    const updatedStats = stats.map((stat) => ({
      ...stat,
      value: stat.value + Math.floor(Math.random() * 3),
    }));
    setStats(updatedStats);
  };

  return (
    <section id="favorites-stats-section" className="bg-white py-5">
      <div className="container">
        {/* Carte statistique avec dégradé */}
        <div
          className="rounded-4 p-5 text-white"
          style={{
            background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
            boxShadow: "0 10px 25px rgba(249, 115, 22, 0.3)",
          }}
        >
          {/* En-tête */}
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Vos activités préférées</h2>
            <p className="fs-5 opacity-75">
              Suivre vos objets enregistrés et vos centres d'intérêt
            </p>
          </div>

          {/* Grille des statistiques */}
          <div className="row g-4">
            {stats.map((stat) => (
              <div key={stat.id} className="col-md-6 col-lg-3">
                <div className="text-center p-4 bg-white bg-opacity-10 rounded-3">
                  {stat.icon && (
                    <div className="mb-3">
                      <i className={`bi ${stat.icon} fs-1 opacity-75`}></i>
                    </div>
                  )}
                  <div className="display-3 fw-bold mb-2">{stat.value}</div>
                  <p className="mb-0 opacity-90">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bouton d'actualisation (optionnel) */}
          <div className="text-center mt-5">
            <button
              onClick={simulateDataUpdate}
              className="btn btn-outline-light btn-lg px-4 py-2 fw-semibold"
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Actualiser les statistiques
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
