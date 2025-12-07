"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFolder,
  faBell,
  faClock,
  faStar,
  faTrash,
  faShare,
} from "@fortawesome/free-solid-svg-icons";

export default function TipsFavoritesSection() {
  const tips = [
    {
      id: 1,
      title: "Organize with Collections",
      description:
        "Group similar items into collections for easier browsing and comparison.",
      icon: faFolder,
      bgColor: "bg-warning bg-opacity-10",
      iconColor: "text-warning",
    },
    {
      id: 2,
      title: "Set Up Alerts",
      description:
        "Get notified when items matching your saved searches become available.",
      icon: faBell,
      bgColor: "bg-primary bg-opacity-10",
      iconColor: "text-primary",
    },
    {
      id: 3,
      title: "Act Quickly",
      description:
        "Popular items sell fast. Check your favorites regularly and contact sellers promptly.",
      icon: faClock,
      bgColor: "bg-success bg-opacity-10",
      iconColor: "text-success",
    },
    {
      id: 4,
      title: "Compare Items",
      description:
        "Save multiple similar items to compare prices, conditions, and locations.",
      icon: faStar,
      bgColor: "bg-purple bg-opacity-10",
      iconColor: "text-purple",
    },
    {
      id: 5,
      title: "Clean Up Regularly",
      description:
        "Remove sold or outdated items from your favorites to keep your list relevant.",
      icon: faTrash,
      bgColor: "bg-danger bg-opacity-10",
      iconColor: "text-danger",
    },
    {
      id: 6,
      title: "Share with Friends",
      description:
        "Share interesting items from your favorites with friends who might be interested.",
      icon: faShare,
      bgColor: "bg-warning bg-opacity-10",
      iconColor: "text-warning",
    },
  ];

  return (
    <section id="tips-favorites-section" className="py-5 bg-light">
      <div className="container">
        <div className="bg-white rounded-3 shadow-lg p-4 p-md-5">
          <h2 className="h1 fw-bold text-dark mb-4 mb-md-5 text-center">
            Conseils pour la gestion des favoris
          </h2>

          <div className="row g-4">
            {/* Colonne gauche */}
            <div className="col-md-6">
              <div className="vstack gap-4">
                {tips.slice(0, 3).map((tip) => (
                  <div key={tip.id} className="d-flex align-items-start gap-3">
                    <div
                      className={`flex-shrink-0 rounded d-flex align-items-center justify-content-center ${tip.bgColor}`}
                      style={{ width: "56px", height: "56px" }}
                    >
                      <FontAwesomeIcon
                        icon={tip.icon}
                        className={`${tip.iconColor} fs-5`}
                      />
                    </div>
                    <div>
                      <h3 className="h5 fw-bold text-dark mb-2">{tip.title}</h3>
                      <p className="text-muted mb-0">{tip.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Colonne droite */}
            <div className="col-md-6">
              <div className="vstack gap-4">
                {tips.slice(3).map((tip) => (
                  <div key={tip.id} className="d-flex align-items-start gap-3">
                    <div
                      className={`flex-shrink-0 rounded d-flex align-items-center justify-content-center ${tip.bgColor}`}
                      style={{ width: "56px", height: "56px" }}
                    >
                      <FontAwesomeIcon
                        icon={tip.icon}
                        className={`${tip.iconColor} fs-5`}
                      />
                    </div>
                    <div>
                      <h3 className="h5 fw-bold text-dark mb-2">{tip.title}</h3>
                      <p className="text-muted mb-0">{tip.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
