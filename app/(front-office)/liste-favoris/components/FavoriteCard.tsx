// components/FavoriteCard.tsx
"use client";

import { useState } from "react";
import colors from "@/utils/colors";

interface FavoriteCardProps {
  id: string;
  title: string;
  price: string;
  priceLabel?: string;
  type: "sale" | "exchange" | "free" | "negotiable";
  description: string;
  location: string;
  timeAgo: string;
  imageUrl: string;
  negotiable?: boolean;
}

const FavoriteCard: React.FC<FavoriteCardProps> = ({
  id,
  title,
  price,
  priceLabel,
  type,
  description,
  location,
  timeAgo,
  imageUrl,
  negotiable = false,
}) => {
  const [isFavorite, setIsFavorite] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const getTypeConfig = () => {
    switch (type) {
      case "sale":
        return {
          color: colors.oskar.green,
          icon: "fa-tag",
          text: "vente",
          buttonText: "Contacter",
          buttonColor: colors.oskar.green,
        };
      case "exchange":
        return {
          color: "#2196F3", // Bleu pour échange
          icon: "fa-exchange-alt",
          text: "échange",
          buttonText: "Proposer",
          buttonColor: "#2196F3",
        };
      case "free":
        return {
          color: "#9C27B0", // Violet pour don
          icon: "fa-gift",
          text: "don",
          buttonText: "Intéresser",
          buttonColor: "#9C27B0",
        };
      case "negotiable":
        return {
          color: colors.oskar.green,
          icon: "fa-tag",
          text: "vente",
          buttonText: "Contacter",
          buttonColor: colors.oskar.green,
        };
      default:
        return {
          color: colors.oskar.green,
          icon: "fa-tag",
          text: "vente",
          buttonText: "Contacter",
          buttonColor: colors.oskar.green,
        };
    }
  };

  const typeConfig = getTypeConfig();

  return (
    <div
      className="card h-100 border-0 shadow-sm"
      style={{
        borderRadius: "16px",
        overflow: "hidden",
        transition: "all 0.3s ease",
        cursor: "pointer",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image avec badges et actions */}
      <div
        className="position-relative overflow-hidden"
        style={{ height: "256px" }}
      >
        <img
          src={imageUrl}
          alt={title}
          className="w-100 h-100 object-cover"
          style={{
            transform: isHovered ? "scale(1.05)" : "scale(1)",
            transition: "transform 0.3s ease",
          }}
        />

        {/* Badge type */}
        <div
          className="position-absolute top-3 start-3 px-3 py-2 text-white fw-bold rounded-pill d-flex align-items-center gap-2"
          style={{
            backgroundColor: typeConfig.color,
            fontSize: "0.75rem",
          }}
        >
          <i className={`fas ${typeConfig.icon}`}></i>
          <span>{typeConfig.text}</span>
        </div>

        {/* Badge négociable (si applicable) */}
        {negotiable && (
          <div
            className="position-absolute bottom-3 start-3 px-3 py-2 text-white fw-bold rounded-pill"
            style={{
              backgroundColor: "#EF5350",
              fontSize: "0.75rem",
            }}
          >
            Négociable
          </div>
        )}

        {/* Actions */}
        <div className="position-absolute top-3 end-3 d-flex gap-2">
          {/* Bouton favori */}
          <button
            className="btn btn-light rounded-circle p-2"
            onClick={() => setIsFavorite(!isFavorite)}
            style={{
              width: "40px",
              height: "40px",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#FFEBEE";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#ffffff";
            }}
          >
            <i
              className={`${isFavorite ? "fas" : "far"} fa-heart`}
              style={{ color: isFavorite ? "#EF5350" : colors.oskar.grey }}
            ></i>
          </button>

          {/* Bouton partager */}
          <button
            className="btn btn-light rounded-circle p-2"
            style={{
              width: "40px",
              height: "40px",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.oskar.lightGrey;
            }}
            onMouseLeave((e) => {
              e.currentTarget.style.backgroundColor = "#ffffff";
            })}
          >
            <i
              className="fas fa-share-nodes"
              style={{ color: colors.oskar.grey }}
            ></i>
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <h3
            className="card-title h5 fw-bold mb-0"
            style={{
              color: isHovered ? colors.oskar.green : colors.oskar.black,
              transition: "color 0.3s ease",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
            }}
          >
            {title}
          </h3>
          <div
            className="ms-2 fw-bold"
            style={{
              color: typeConfig.color,
              fontSize: type === "exchange" ? "1.125rem" : "1.5rem",
            }}
          >
            {price}
            {priceLabel && (
              <span className="fs-6 ms-1">{priceLabel}</span>
            )}
          </div>
        </div>

        <p
          className="card-text text-secondary mb-3"
          style={{
            fontSize: "0.875rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            minHeight: "42px",
          }}
        >
          {description}
        </p>

        {/* Infos location et temps */}
        <div className="d-flex justify-content-between mb-4">
          <div className="d-flex align-items-center gap-2">
            <i
              className="fas fa-location-dot"
              style={{ color: colors.oskar.grey, fontSize: "0.875rem" }}
            ></i>
            <span
              style={{ color: colors.oskar.grey, fontSize: "0.875rem" }}
            >
              {location}
            </span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <i
              className="far fa-clock"
              style={{ color: colors.oskar.grey, fontSize: "0.875rem" }}
            ></i>
            <span
              style={{ color: colors.oskar.grey, fontSize: "0.875rem" }}
            >
              {timeAgo}
            </span>
          </div>
        </div>

        {/* Bouton action */}
        <button
          className="btn w-100 fw-semibold"
          style={{
            backgroundColor: typeConfig.buttonColor,
            color: "white",
            padding: "0.75rem",
            borderRadius: "8px",
            border: "none",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.9";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave((e) => {
            e.currentTarget.style.opacity = "1";
            e.currentTarget.style.transform = "translateY(0)";
          })}
        >
          {typeConfig.buttonText}
        </button>
      </div>
    </div>
  );
};

export default FavoriteCard;
