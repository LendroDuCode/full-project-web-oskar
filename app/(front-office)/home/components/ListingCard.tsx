"use client";

import { useState } from "react";
import Link from "next/link";
import colors from "@/app/shared/constants/colors";

export interface ListingItem {
  uuid: string;
  type: "produit" | "echange" | "don";
  titre?: string;
  nom?: string;
  libelle?: string;
  description?: string | null;
  prix?: number | string | null;
  image?: string | null;
  date?: string | null | undefined;
  disponible?: boolean;
  statut?: string;
  numero?: string;
  localisation?: string;
  createdAt?: string | null | undefined;
  seller?: {
    name: string;
    avatar: string;
  };
}

interface ListingCardProps {
  listing: ListingItem;
  featured?: boolean;
  viewMode?: "grid" | "list";
}

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5BdWN1bmUgaW1hZ2U8L3RleHQ+PC9zdmc+";

const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  featured = false,
  viewMode = "grid",
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getTypeConfig = (type: string) => {
    switch (type) {
      case "produit":
        return {
          label: "vente",
          color: colors.oskar.green,
          bgColor: "#16a34a",
          btnColor: "#f97316",
          icon: "fa-tag",
        };
      case "don":
        return {
          label: "don",
          color: "#9333ea",
          bgColor: "#9333ea",
          btnColor: "#9333ea",
          icon: "fa-gift",
        };
      case "echange":
        return {
          label: "échange",
          color: "#2563eb",
          bgColor: "#2563eb",
          btnColor: "#2563eb",
          icon: "fa-exchange-alt",
        };
      default:
        return {
          label: "annonce",
          color: colors.oskar.grey,
          bgColor: colors.oskar.grey,
          btnColor: colors.oskar.orange,
          icon: "fa-tag",
        };
    }
  };

  const typeConfig = getTypeConfig(listing.type);

  const getButtonText = () => {
    switch (listing.type) {
      case "produit":
        return "Contacter";
      case "don":
        return "Intéressé";
      case "echange":
        return "Proposer";
      default:
        return "Voir";
    }
  };

  const getDetailLink = () => {
    switch (listing.type) {
      case "don":
        return `/dons/${listing.uuid}`;
      case "echange":
        return `/echanges/${listing.uuid}`;
      case "produit":
        return `/produits/${listing.uuid}`;
      default:
        return `/annonces/${listing.uuid}`;
    }
  };

  const getImageSrc = () => {
    if (imageError || !listing.image) return PLACEHOLDER_IMAGE;
    if (listing.image.startsWith("http")) return listing.image;
    return `${process.env.NEXT_PUBLIC_API_URL || ""}${listing.image}`;
  };

  const formatPrice = (price: number | string | null | undefined) => {
    if (price === null || price === undefined) return "Gratuit";
    if (price === 0) return "Gratuit";
    if (listing.type === "don") return "Gratuit";
    if (listing.type === "echange") return "Troc";

    const priceNum = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(priceNum)) return "Prix à discuter";
    return `${priceNum.toLocaleString("fr-FR")} FCFA`;
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Aujourd'hui";
      if (diffDays === 1) return "Hier";
      if (diffDays < 7) return `Il y a ${diffDays} heures`;
      if (diffDays < 30) return `Il y a ${diffDays} jours`;
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
      });
    } catch {
      return "";
    }
  };

  const getCardClasses = () => {
    if (featured) {
      return "card h-100 border-0 rounded-4 overflow-hidden shadow-lg position-relative group cursor-pointer transition-all";
    }
    return "card h-100 border-0 rounded-4 overflow-hidden shadow group cursor-pointer transition-all";
  };

  const getPriceClasses = () => {
    switch (listing.type) {
      case "don":
        return "text-purple-600 fw-bold fs-4 mb-2";
      case "echange":
        return "text-primary fw-bold fs-4 mb-2";
      default:
        return "text-success fw-bold fs-4 mb-2";
    }
  };

  const getButtonClasses = () => {
    switch (listing.type) {
      case "don":
        return "btn text-white px-4 py-2 rounded-3 fw-semibold border-0 transition-colors";
      case "echange":
        return "btn text-white px-4 py-2 rounded-3 fw-semibold border-0 transition-colors";
      default:
        return "btn text-white px-4 py-2 rounded-3 fw-semibold border-0 transition-colors";
    }
  };

  const getButtonStyle = () => {
    switch (listing.type) {
      case "don":
        return { backgroundColor: "#9333ea" };
      case "echange":
        return { backgroundColor: "#2563eb" };
      default:
        return { backgroundColor: colors.oskar.orange };
    }
  };

  if (viewMode === "list") {
    return (
      <div
        className={`card border-0 rounded-4 overflow-hidden shadow mb-3 ${featured ? "border-2 border-warning" : ""}`}
      >
        <div className="row g-0">
          <div className="col-md-3 position-relative">
            <div
              className="position-relative h-100"
              style={{ minHeight: "200px" }}
            >
              <img
                src={getImageSrc()}
                alt={listing.titre || "Annonce"}
                className="w-100 h-100 object-fit-cover transition-transform group-hover-scale"
                style={{ height: "200px", objectFit: "cover" }}
                onError={() => setImageError(true)}
              />
              <div
                className="position-absolute top-0 start-0 px-2 py-1 text-white small fw-bold rounded-3 d-flex align-items-center gap-1 m-2"
                style={{ backgroundColor: typeConfig.bgColor }}
              >
                <i className={`fas ${typeConfig.icon}`}></i>
                <span>{typeConfig.label}</span>
              </div>
              <button
                className="position-absolute top-0 end-0 w-10 h-10 bg-white rounded-circle d-flex align-items-center justify-content-center shadow border-0 m-2 transition-colors"
                style={{ width: "40px", height: "40px" }}
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <i
                  className={`fa-${isFavorite ? "solid" : "regular"} fa-heart`}
                />
              </button>
            </div>
          </div>
          <div className="col-md-9">
            <div className="card-body h-100 d-flex flex-column p-4">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="flex-grow-1">
                  <h5 className="card-title fw-bold text-dark mb-1">
                    <Link
                      href={getDetailLink()}
                      className="text-decoration-none text-dark"
                    >
                      {listing.titre}
                    </Link>
                  </h5>
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {listing.statut && (
                      <span className="badge bg-secondary">
                        {listing.statut === "disponible"
                          ? "Disponible"
                          : listing.statut === "en_attente"
                            ? "En attente"
                            : listing.statut === "publie"
                              ? "Publié"
                              : listing.statut}
                      </span>
                    )}
                    {listing.localisation && (
                      <span className="badge bg-light text-dark">
                        <i className="fa-solid fa-location-dot me-1 text-warning"></i>
                        {listing.localisation}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-end ms-3">
                  <div className={getPriceClasses()}>
                    {formatPrice(listing.prix)}
                  </div>
                  {(listing.date || listing.createdAt) && (
                    <div className="text-muted small mt-1">
                      <i className="fa-regular fa-clock me-1"></i>
                      {formatDate(listing.date || listing.createdAt)}
                    </div>
                  )}
                </div>
              </div>
              {listing.description && (
                <p className="card-text text-muted flex-grow-1 mb-3 small">
                  {listing.description.length > 150
                    ? `${listing.description.substring(0, 150)}...`
                    : listing.description}
                </p>
              )}
              <div className="d-flex justify-content-between align-items-end mt-auto">
                <div className="d-flex align-items-center gap-3">
                  {listing.seller && (
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={
                          listing.seller.avatar ||
                          "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg"
                        }
                        alt={listing.seller.name}
                        className="rounded-circle object-fit-cover"
                        style={{ width: "32px", height: "32px" }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg";
                        }}
                      />
                      <span className="small fw-medium text-dark">
                        {listing.seller.name}
                      </span>
                    </div>
                  )}
                  {listing.numero && (
                    <span className="text-muted small">
                      <i className="fa-solid fa-phone me-1"></i>
                      {listing.numero}
                    </span>
                  )}
                </div>
                <Link
                  href={getDetailLink()}
                  className={getButtonClasses()}
                  style={getButtonStyle()}
                >
                  {getButtonText()}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={getCardClasses()}>
      {/* Image */}
      <div
        className="position-relative overflow-hidden"
        style={{ height: "224px" }}
      >
        <img
          src={getImageSrc()}
          alt={listing.titre || "Annonce"}
          className="w-100 h-100 object-fit-cover transition-transform group-hover-scale"
          style={{ transition: "transform 0.3s ease" }}
          onError={() => setImageError(true)}
        />

        {/* Badge type */}
        <div
          className="position-absolute top-0 start-0 px-2 py-1 text-white small fw-bold rounded-3 d-flex align-items-center gap-1 m-2"
          style={{ backgroundColor: typeConfig.bgColor }}
        >
          <i className={`fas ${typeConfig.icon}`}></i>
          <span>{typeConfig.label}</span>
        </div>

        {/* Bouton favori */}
        <button
          className="position-absolute top-0 end-0 w-10 h-10 bg-white rounded-circle d-flex align-items-center justify-content-center shadow border-0 m-2 transition-colors"
          style={{ width: "40px", height: "40px" }}
          onClick={() => setIsFavorite(!isFavorite)}
        >
          <i className={`fa-${isFavorite ? "solid" : "regular"} fa-heart`} />
        </button>
      </div>

      {/* Contenu */}
      <div className="card-body p-4">
        <Link href={getDetailLink()} className="text-decoration-none">
          <h5 className="card-title fw-bold text-dark mb-2 text-truncate">
            {listing.titre}
          </h5>
        </Link>

        <div className={getPriceClasses()}>{formatPrice(listing.prix)}</div>

        {listing.description && (
          <p className="card-text text-muted small mb-3 line-clamp-2">
            {listing.description}
          </p>
        )}

        <div className="d-flex justify-content-between align-items-center text-muted small mb-3">
          {listing.localisation && (
            <span className="d-flex align-items-center">
              <i className="fa-solid fa-location-dot me-1 text-warning"></i>
              {listing.localisation}
            </span>
          )}
          {(listing.date || listing.createdAt) && (
            <span className="d-flex align-items-center">
              <i className="fa-regular fa-clock me-1"></i>
              {formatDate(listing.date || listing.createdAt)}
            </span>
          )}
        </div>

        <div className="d-flex justify-content-between align-items-center pt-3 border-top">
          <div className="d-flex align-items-center">
            <img
              src={
                listing.seller?.avatar ||
                "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg"
              }
              alt={listing.seller?.name || "Vendeur"}
              className="rounded-circle object-fit-cover me-2"
              style={{ width: "32px", height: "32px" }}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg";
              }}
            />
            <span className="small fw-medium text-dark">
              {listing.seller?.name || "Annonceur"}
            </span>
          </div>
          <Link
            href={getDetailLink()}
            className={getButtonClasses()}
            style={getButtonStyle()}
          >
            {getButtonText()}
          </Link>
        </div>
      </div>

      <style jsx>{`
        .group {
          transition: all 0.3s ease;
        }

        .group:hover {
          transform: translateY(-4px);
          box-shadow:
            0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
        }

        .group:hover .group-hover-scale {
          transform: scale(1.05);
        }

        .transition-transform {
          transition: transform 0.3s ease;
        }

        .transition-colors {
          transition: all 0.3s ease;
        }

        .transition-colors:hover {
          opacity: 0.9;
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .object-fit-cover {
          object-fit: cover;
        }

        .border-2.border-warning {
          border: 2px solid ${colors.oskar.orange} !important;
        }
      `}</style>
    </div>
  );
};

export default ListingCard;
