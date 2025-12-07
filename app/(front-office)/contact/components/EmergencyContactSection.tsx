// app/shared/components/emergency/EmergencyContactSection.tsx
"use client";

import Link from "next/link";
import { useState } from "react";

const EmergencyContactSection = () => {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const handleReportClick = () => {
    // Vous pouvez ouvrir un modal ou rediriger vers une page de signalement
    console.log("Ouvrir le formulaire de signalement");
    // Exemple : ouvrir un modal
    // setShowReportModal(true);
  };

  return (
    <section id="emergency-contact" className="py-5">
      <div className="container">
        <div
          className="rounded-4 p-4 p-md-5 text-white shadow-lg"
          style={{
            background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div className="text-center mx-auto" style={{ maxWidth: "800px" }}>
            {/* Icône d'urgence */}
            <div
              className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4"
              style={{
                width: "80px",
                height: "80px",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
              }}
            >
              <i className="fas fa-triangle-exclamation fa-2x"></i>
            </div>

            {/* Titre et description */}
            <h2 className="display-5 fw-bold mb-3">
              Urgence ou problème de sécurité ?
            </h2>
            <p className="lead mb-4 opacity-90">
              Si vous rencontrez une situation d'urgence ou avez des
              préoccupations immédiates concernant votre sécurité,
              contactez-nous immédiatement.
            </p>

            {/* Boutons d'action */}
            <div className="d-flex flex-column flex-md-row gap-3 justify-content-center mb-3">
              {/* Bouton Appel d'urgence */}
              <a
                href="tel:+2250707123456"
                className={`btn btn-lg d-flex align-items-center justify-content-center gap-2 ${
                  hoveredButton === "call" ? "btn-light" : "btn-white"
                }`}
                style={{
                  minWidth: "200px",
                  color: "#dc2626",
                  fontWeight: "600",
                }}
                onMouseEnter={() => setHoveredButton("call")}
                onMouseLeave={() => setHoveredButton(null)}
              >
                <i className="fas fa-phone"></i>
                <span>Appeler la ligne d'urgence</span>
              </a>

              {/* Bouton Signalement */}
              <button
                onClick={handleReportClick}
                className={`btn btn-lg d-flex align-items-center justify-content-center gap-2 ${
                  hoveredButton === "report" ? "btn-light" : "btn-outline-light"
                }`}
                style={{
                  minWidth: "200px",
                  fontWeight: "600",
                }}
                onMouseEnter={() => setHoveredButton("report")}
                onMouseLeave={() => setHoveredButton(null)}
              >
                <i className="fas fa-shield-alt"></i>
                <span>Signaler un problème</span>
              </button>
            </div>

            {/* Informations supplémentaires */}
            <div className="mt-4">
              <p className="mb-2 opacity-90">
                <i className="fas fa-clock me-2"></i>
                Disponible 24h/24 et 7j/7 pour les urgences
              </p>
              <p className="small opacity-75 mb-0">
                <i className="fas fa-info-circle me-1"></i>
                Pour les problèmes non urgents, utilisez notre{" "}
                <Link
                  href="/support"
                  className="text-white text-decoration-underline"
                >
                  centre d'aide
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmergencyContactSection;
