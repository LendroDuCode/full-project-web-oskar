"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faLocationDot } from "@fortawesome/free-solid-svg-icons";

// Fix pour les icônes Leaflet dans Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Icône personnalisée pour OSKAR
const createCustomIcon = (color: string = "#f57c00") => {
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="white"/>
      </svg>
    </div>`,
    className: "custom-marker",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

interface ExchangeMapProps {
  location: string;
  lieuRencontre: string;
  nomEchange: string;
  className?: string;
  height?: string;
}

// Composant pour recentrer la carte lors du changement de position
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

export default function ExchangeMap({
  location,
  lieuRencontre,
  nomEchange,
  className = "",
  height = "320px",
}: ExchangeMapProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapKey, setMapKey] = useState(0);

  // Fonction de géocodage pour convertir l'adresse en coordonnées
  useEffect(() => {
    const geocodeLocation = async () => {
      if (!location) {
        setLoading(false);
        setError("Localisation non spécifiée");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Utilisation de l'API Nominatim (OpenStreetMap) pour le géocodage
        const encodedLocation = encodeURIComponent(
          `${location}, Côte d'Ivoire`,
        );
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodedLocation}&limit=1`,
          {
            headers: {
              "User-Agent": "OSKAR-App",
            },
          },
        );

        const data = await response.json();

        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          setPosition([lat, lon]);
        } else {
          // Coordonnées par défaut (Abidjan, Plateau)
          setPosition([5.336, -4.0267]);
          setError(
            "Position approximative - Adresse exacte non trouvée",
          );
        }
      } catch (err) {
        console.error("Erreur de géocodage:", err);
        setPosition([5.336, -4.0267]); // Abidjan par défaut
        setError("Impossible de localiser l'adresse exacte");
      } finally {
        setLoading(false);
        setMapKey((prev) => prev + 1); // Forcer le re-rendu de la carte
      }
    };

    geocodeLocation();
  }, [location]);

  if (loading) {
    return (
      <div
        className="bg-light rounded-4 d-flex flex-column align-items-center justify-content-center"
        style={{ height }}
      >
        <FontAwesomeIcon
          icon={faSpinner}
          spin
          className="fa-3x text-warning mb-3"
        />
        <p className="text-muted">Localisation en cours...</p>
      </div>
    );
  }

  if (error && !position) {
    return (
      <div
        className="bg-light rounded-4 d-flex flex-column align-items-center justify-content-center"
        style={{ height }}
      >
        <FontAwesomeIcon
          icon={faLocationDot}
          className="fa-3x text-muted mb-3"
        />
        <p className="text-muted">{error}</p>
        <p className="small text-muted">{location}</p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-4 overflow-hidden ${className}`}
      style={{ height, position: "relative" }}
    >
      {position && (
        <MapContainer
          key={mapKey}
          center={position}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
          scrollWheelZoom={false}
        >
          <ChangeView center={position} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} icon={createCustomIcon("#f57c00")}>
            <Popup>
              <div style={{ minWidth: "200px" }}>
                <strong style={{ display: "block", marginBottom: "8px" }}>
                  {nomEchange}
                </strong>
                <p style={{ margin: "4px 0", fontSize: "14px" }}>
                  📍 {location}
                </p>
                <p style={{ margin: "4px 0", fontSize: "14px" }}>
                  🤝 Lieu de rencontre : {lieuRencontre}
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${position[0]},${position[1]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    marginTop: "8px",
                    padding: "6px 12px",
                    backgroundColor: "#f57c00",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: "20px",
                    fontSize: "13px",
                    fontWeight: "bold",
                  }}
                >
                  Voir sur Google Maps
                </a>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      )}

      {error && (
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "10px",
            right: "10px",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            padding: "8px 12px",
            borderRadius: "20px",
            fontSize: "12px",
            color: "#666",
            textAlign: "center",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            zIndex: 1000,
          }}
        >
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}