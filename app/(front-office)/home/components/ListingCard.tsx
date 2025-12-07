// ListingCard.tsx
"use client";

import { useState } from "react";
import colors from "../../../shared/constants/colors";

interface ListingCardProps {
  listing: {
    id: number;
    title: string;
    price: string | number;
    type: "sale" | "donation" | "exchange";
    description: string;
    location: string;
    time: string;
    seller: {
      name: string;
      avatar: string;
    };
    image: string;
  };
  featured?: boolean;
}

const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  featured = false,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const getTypeConfig = (type: string) => {
    switch (type) {
      case "sale":
        return {
          label: "vente",
          color: colors.oskar.green,
          bgColor: colors.oskar.green,
          btnColor: colors.oskar.green,
        };
      case "donation":
        return {
          label: "don",
          color: "#9C27B0",
          bgColor: "#9C27B0",
          btnColor: "#9C27B0",
        };
      case "exchange":
        return {
          label: "échange",
          color: "#2196F3",
          bgColor: "#2196F3",
          btnColor: "#2196F3",
        };
      default:
        return {
          label: "vente",
          color: colors.oskar.green,
          bgColor: colors.oskar.green,
          btnColor: colors.oskar.green,
        };
    }
  };

  const typeConfig = getTypeConfig(listing.type);
  const btnText =
    listing.type === "sale"
      ? "Contacter"
      : listing.type === "donation"
        ? "Intéresser"
        : "Proposer";

  return (
    <div className={`listing-card ${featured ? "featured" : ""}`}>
      {/* Image */}
      <div className="listing-image-container">
        <img
          src={listing.image}
          alt={listing.title}
          className="listing-image"
        />

        {/* Badge type */}
        <div
          className="listing-type-badge"
          style={{ backgroundColor: typeConfig.bgColor }}
        >
          <i
            className={`fas ${listing.type === "sale" ? "fa-tag" : listing.type === "donation" ? "fa-gift" : "fa-exchange-alt"} me-1`}
          />
          <span>{typeConfig.label}</span>
        </div>

        {/* Bouton favori */}
        <button
          className="listing-favorite-btn"
          onClick={() => setIsFavorite(!isFavorite)}
        >
          <i className={`fa-${isFavorite ? "solid" : "regular"} fa-heart`} />
        </button>
      </div>

      {/* Contenu */}
      <div className="listing-content">
        <h3 className="listing-title">{listing.title}</h3>
        <p className="listing-price" style={{ color: typeConfig.color }}>
          {listing.price}
        </p>
        <p className="listing-description">{listing.description}</p>

        <div className="listing-details">
          <div className="listing-location">
            <i className="fa-solid fa-location-dot" />
            <span>{listing.location}</span>
          </div>
          <div className="listing-time">
            <i className="fa-solid fa-clock" />
            <span>{listing.time}</span>
          </div>
        </div>

        <div className="listing-footer">
          <div className="listing-seller">
            <img
              src={listing.seller.avatar}
              alt={listing.seller.name}
              className="seller-avatar"
            />
            <span className="seller-name">{listing.seller.name}</span>
          </div>
          <button
            className="listing-action-btn"
            style={{ backgroundColor: typeConfig.btnColor }}
          >
            {btnText}
          </button>
        </div>
      </div>

      <style jsx>{`
        .listing-card {
          background-color: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          height: 100%;
          cursor: pointer;
        }

        .listing-card.featured {
          border: 2px solid ${colors.oskar.green};
          background: linear-gradient(
            135deg,
            rgba(76, 175, 80, 0.05) 0%,
            rgba(255, 255, 255, 1) 100%
          );
        }

        .listing-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .listing-image-container {
          position: relative;
          height: 224px;
          overflow: hidden;
        }

        .listing-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .listing-card:hover .listing-image {
          transform: scale(1.05);
        }

        .listing-type-badge {
          position: absolute;
          top: 0.5rem;
          left: 0.5rem;
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .listing-favorite-btn {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          width: 2.5rem;
          height: 2.5rem;
          background-color: white;
          border-radius: 50%;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .listing-favorite-btn:hover {
          background-color: ${colors.oskar.green};
          color: white;
        }

        .listing-content {
          padding: 1rem;
        }

        .listing-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: ${colors.oskar.black};
          margin-bottom: 0.5rem;
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }

        .listing-price {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .listing-description {
          color: ${colors.oskar.grey};
          font-size: 0.875rem;
          line-height: 1.5;
          margin-bottom: 0.75rem;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          min-height: 2.625rem;
        }

        .listing-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: ${colors.oskar.grey};
          font-size: 0.875rem;
          margin-bottom: 0.75rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid ${colors.oskar.lightGrey};
        }

        .listing-location,
        .listing-time {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .listing-location i {
          color: ${colors.oskar.green};
        }

        .listing-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .listing-seller {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .seller-avatar {
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          object-fit: cover;
        }

        .seller-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: ${colors.oskar.black};
        }

        .listing-action-btn {
          color: white;
          font-size: 0.875rem;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          padding: 0.5rem 1rem;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .listing-action-btn:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
};

export default ListingCard;
