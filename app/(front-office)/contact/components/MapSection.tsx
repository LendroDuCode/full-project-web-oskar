"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapLocationDot,
  faCar,
  faBus,
  faPersonWalking,
  faDirections,
  faLocationDot,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import colors from "../../../shared/constants/colors";

interface TransportOption {
  id: number;
  title: string;
  description: string;
  icon: any;
  color: string;
}

interface MapSectionProps {
  title?: string;
  subtitle?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  transportOptions?: TransportOption[];
  showDirectionsButton?: boolean;
}

export default function MapSection({
  title = "Retrouvez-nous sur la carte",
  subtitle = "Visitez notre bureau au cœur d'Abidjan",
  address = "Rue des Jardins, Cocody, Abidjan",
  latitude = 5.359,
  longitude = -3.9906,
  transportOptions,
  showDirectionsButton = true,
}: MapSectionProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // Options de transport par défaut
  const defaultTransportOptions: TransportOption[] = [
    {
      id: 1,
      title: "En voiture",
      description: "Parking gratuit disponible sur place",
      icon: faCar,
      color: colors.oskar.green, // Vert OSKAR
    },
    {
      id: 2,
      title: "Transport en commun",
      description: "Lignes de bus 12, 23, 45 à proximité",
      icon: faBus,
      color: colors.oskar.blue || "#3B82F6", // Bleu OSKAR
    },
    {
      id: 3,
      title: "À pied",
      description: "5 minutes du centre de Cocody",
      icon: faPersonWalking,
      color: colors.oskar.green, // Vert OSKAR
    },
  ];

  const displayTransportOptions = transportOptions || defaultTransportOptions;

  // Générer le lien Google Maps
  const getGoogleMapsLink = () => {
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&destination_place_id=ChIJabc123`;
  };

  // Ouvrir les directions dans Google Maps
  const handleGetDirections = () => {
    window.open(getGoogleMapsLink(), "_blank");
  };

  // Charger la carte Google Maps
  const loadMap = () => {
    setShowMap(true);
    setMapLoaded(true);
  };

  const handleOpenStreetMapLink = () => {
    window.open(
      `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}`,
      "_blank",
    );
  };

  return (
    <section id="map-section" className="py-5 py-lg-6 bg-white">
      <div className="container">
        {/* En-tête */}
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold text-dark mb-3">{title}</h2>
          <p className="lead text-muted">{subtitle}</p>
        </div>

        {/* Carte (simulée ou intégrée) */}
        <div
          className="position-relative overflow-hidden rounded-3 mb-4"
          style={{
            backgroundColor: "#f3f4f6",
            height: "400px",
          }}
        >
          {showMap ? (
            // Carte Google Maps intégrée
            <iframe
              src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3972.4128104373077!2d-3.9906339252911167!3d5.359050894611354!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfc1ebca41c75943%3A0x498735d1362338c0!2sCocody%2C%20Abidjan%2C%20C%C3%B4te%20d'Ivoire!5e0!3m2!1sfr!2sfr!4v1700000000000!5m2!1sfr!2sfr`}
              className="w-100 h-100 border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localisation OSKAR Abidjan"
            ></iframe>
          ) : (
            // Affichage de remplacement avec bouton pour charger la carte
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center p-4">
              <FontAwesomeIcon
                icon={faMapLocationDot}
                className="text-muted mb-4"
                style={{
                  fontSize: "4rem",
                  color: colors.oskar.green,
                }}
              />

              <div className="text-center mb-4">
                <h3 className="h4 fw-bold text-dark mb-2">
                  <FontAwesomeIcon
                    icon={faLocationDot}
                    className="me-2"
                    style={{ color: colors.oskar.green }}
                  />
                  Notre emplacement
                </h3>
                <p className="text-muted mb-2">{address}</p>
                <p className="small text-muted mb-0">
                  Cocody, Abidjan, Côte d'Ivoire
                </p>
              </div>

              <div className="d-flex flex-wrap gap-3 justify-content-center">
                <button
                  onClick={loadMap}
                  className="btn d-flex align-items-center gap-2"
                  style={{
                    backgroundColor: colors.oskar.green,
                    color: "white",
                    padding: "10px 24px",
                  }}
                >
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  Voir sur la carte
                </button>

                {showDirectionsButton && (
                  <button
                    onClick={handleGetDirections}
                    className="btn btn-outline-secondary d-flex align-items-center gap-2"
                    style={{
                      padding: "10px 24px",
                    }}
                  >
                    <FontAwesomeIcon icon={faDirections} />
                    Itinéraire
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Informations d'adresse */}
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center bg-light rounded-pill px-4 py-2">
            <FontAwesomeIcon
              icon={faLocationDot}
              className="me-2"
              style={{ color: colors.oskar.green }}
            />
            <span className="fw-medium text-dark">{address}</span>
          </div>

          {showDirectionsButton && (
            <button
              onClick={handleGetDirections}
              className="btn d-flex align-items-center gap-2 mx-auto mt-3"
              style={{
                backgroundColor: colors.oskar.green,
                color: "white",
                padding: "8px 20px",
              }}
            >
              <FontAwesomeIcon icon={faDirections} />
              Obtenir l'itinéraire sur Google Maps
            </button>
          )}
        </div>

        {/* Options de transport */}
        <div className="row g-4 mt-4">
          {displayTransportOptions.map((option) => (
            <div key={option.id} className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="mb-3">
                    <div
                      className="rounded-circle d-inline-flex align-items-center justify-content-center"
                      style={{
                        width: "64px",
                        height: "64px",
                        backgroundColor: `${option.color}20`, // 20 = 12% d'opacité
                      }}
                    >
                      <FontAwesomeIcon
                        icon={option.icon}
                        style={{
                          color: option.color,
                          fontSize: "1.5rem",
                        }}
                      />
                    </div>
                  </div>

                  <h4 className="h5 fw-bold text-dark mb-2">{option.title}</h4>

                  <p className="text-muted small mb-0">{option.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Informations supplémentaires */}
        <div className="row justify-content-center mt-5">
          <div className="col-lg-8">
            <div className="card border-0 bg-light">
              <div className="card-body p-4">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <h5 className="fw-bold text-dark mb-2">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="me-2"
                        style={{ color: colors.oskar.green }}
                      />
                      Conseils pour votre visite
                    </h5>
                    <p className="text-muted small mb-0">
                      Nous vous recommandons de prendre rendez-vous avant votre
                      visite pour garantir la disponibilité de notre équipe.
                    </p>
                  </div>
                  <div className="col-md-4 text-md-end mt-3 mt-md-0">
                    <button
                      onClick={handleOpenStreetMapLink}
                      className="btn btn-outline-secondary btn-sm"
                    >
                      <i className="fa-solid fa-map me-2"></i>
                      OpenStreetMap
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
