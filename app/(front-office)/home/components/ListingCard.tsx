// app/(front-office)/components/ListingCard.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import colors from "@/app/shared/constants/colors";
import { buildImageUrl } from "@/app/shared/utils/image-utils";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { useAuth } from "@/app/(front-office)/auth/AuthContext";

export interface ListingItem {
  uuid: string;
  type: "produit" | "echange" | "don";
  titre?: string;
  nom?: string;
  libelle?: string;
  description?: string | null;
  prix?: number | string | null;
  prixFormate?: string;
  image: string;
  publicationDate?: string | null | undefined; // Date de publication unique
  disponible?: boolean;
  statut?: string;
  numero?: string;
  localisation?: string;
  createdAt?: string | null | undefined;
  is_favoris?: boolean;
  seller?: {
    name: string;
    avatar: string;
    prenoms?: string;
    nom?: string;
  };
}

interface ListingCardProps {
  listing: ListingItem;
  featured?: boolean;
  viewMode?: "grid" | "list";
  onFavoriteToggle?: (uuid: string, isFavorite: boolean) => void;
}

const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  featured = false,
  viewMode = "grid",
  onFavoriteToggle,
}) => {
  if (!listing) {
    console.error("❌ ListingCard: listing est undefined");
    return null;
  }

  const [isMobile, setIsMobile] = useState(false);
  const [isFavorite, setIsFavorite] = useState(listing.is_favoris || false);
  const [imageError, setImageError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isLoggedIn, openLoginModal } = useAuth();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setIsFavorite(listing.is_favoris || false);
  }, [listing.is_favoris]);

  const getSellerInitials = (): string => {
    if (!listing.seller) return "AN";
    
    const name = listing.seller.name || "";
    const prenoms = listing.seller.prenoms || "";
    const nom = listing.seller.nom || "";
    
    if (prenoms && nom) {
      return `${prenoms.charAt(0)}${nom.charAt(0)}`.toUpperCase();
    }
    
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
    } else if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    
    return "AN";
  };

  const getAvatarColor = (): string => {
    switch (listing.type) {
      case "don":
        return "#9333ea";
      case "echange":
        return "#2563eb";
      case "produit":
        return "#16a34a";
      default:
        return colors.oskar.green;
    }
  };

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

  const formatPrice = (price: number | string | null | undefined, type: string): string => {
    if (listing.prixFormate) return listing.prixFormate;
    
    if (type === "don") return "Gratuit";
    
    if (type === "echange") {
      if (price === null || price === undefined || price === "") {
        return "Troc";
      }
      const priceNum = typeof price === "string" ? parseFloat(price) : price;
      if (isNaN(priceNum) || priceNum === 0) return "Troc";
      return `${priceNum.toLocaleString("fr-FR")} FCFA`;
    }
    
    if (type === "produit") {
      if (price === null || price === undefined || price === "") {
        return "Prix non défini";
      }
      const priceNum = typeof price === "string" ? parseFloat(price) : price;
      if (isNaN(priceNum) || priceNum === 0) return "Gratuit";
      return `${priceNum.toLocaleString("fr-FR")} FCFA`;
    }
    
    return "Prix non défini";
  };

  // ✅ FORMATAGE DE DATE CORRIGÉ - Utilise la date UTC pour éviter les décalages
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;
    
    try {
      // Créer la date en considérant qu'elle est en UTC
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      
      // Date actuelle en UTC
      const now = new Date();
      
      // Calculer la différence en millisecondes
      const diffTime = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffMonths = Math.floor(diffDays / 30);
      const diffYears = Math.floor(diffDays / 365);

      // Même jour (diffDays === 0)
      if (diffDays === 0) return "Aujourd'hui";
      
      // Hier (diffDays === 1)
      if (diffDays === 1) return "Hier";
      
      // Moins de 7 jours
      if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
      
      // Moins de 30 jours
      if (diffDays < 30) return `Il y a ${diffDays} jours`;
      
      // Moins d'un an
      if (diffMonths < 12) {
        return `Il y a ${diffMonths} mois`;
      }
      
      // Plus d'un an
      if (diffYears === 1) return "Il y a 1 an";
      return `Il y a ${diffYears} ans`;
    } catch {
      return null;
    }
  };

  // ✅ FORMATAGE COMPACT POUR MOBILE CORRIGÉ
  const formatDateCompact = (dateString?: string | null) => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      
      const now = new Date();
      const diffTime = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Auj";
      if (diffDays === 1) return "Hier";
      if (diffDays < 7) return `${diffDays}j`;
      if (diffDays < 30) return `${diffDays}j`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)}m`;
      return `${Math.floor(diffDays / 365)}a`;
    } catch {
      return null;
    }
  };

  // ✅ OBTENIR LA DATE FORMATÉE
  const getFormattedDate = (): string | null => {
    if (!listing.publicationDate) return null;
    return isMobile ? formatDateCompact(listing.publicationDate) : formatDate(listing.publicationDate);
  };

  const getCardClasses = () => {
    if (featured) {
      return "card border-0 rounded-4 overflow-hidden shadow-lg position-relative group cursor-pointer transition-all d-flex flex-column";
    }
    return "card border-0 rounded-4 overflow-hidden shadow group cursor-pointer transition-all d-flex flex-column";
  };

  const getPriceStyle = () => {
    switch (listing.type) {
      case "don":
        return { color: "#9333ea" };
      case "echange":
        return { color: "#2563eb" };
      default:
        return { color: colors.oskar.green };
    }
  };

  const getButtonClasses = () => {
    return "btn text-white rounded-3 fw-semibold border-0 transition-colors";
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

  const renderAvatar = () => {
    const avatarColor = getAvatarColor();
    const initials = getSellerInitials();
    const sellerName = listing.seller?.name || "Annonceur";
    const hasValidAvatar = listing.seller?.avatar && !avatarError;

    if (hasValidAvatar) {
      return (
        <img
          src={buildImageUrl(listing.seller!.avatar) || ""}
          alt={sellerName}
          className="rounded-circle object-fit-cover"
          style={{ width: isMobile ? "20px" : "24px", height: isMobile ? "20px" : "24px", flexShrink: 0 }}
          onError={() => setAvatarError(true)}
        />
      );
    }

    return (
      <div
        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
        style={{
          width: isMobile ? "20px" : "24px",
          height: isMobile ? "20px" : "24px",
          flexShrink: 0,
          backgroundColor: avatarColor,
          fontSize: isMobile ? "8px" : "10px",
        }}
      >
        {initials}
      </div>
    );
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      openLoginModal();
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      if (isFavorite) {
        let endpoint = "";
        switch (listing.type) {
          case "don":
            endpoint = API_ENDPOINTS.FAVORIS.REMOVE_DON(listing.uuid);
            break;
          case "echange":
            endpoint = API_ENDPOINTS.FAVORIS.REMOVE_ECHANGE(listing.uuid);
            break;
          case "produit":
            endpoint = API_ENDPOINTS.FAVORIS.REMOVE_PRODUIT(listing.uuid);
            break;
          default:
            endpoint = API_ENDPOINTS.FAVORIS.REMOVE(listing.uuid);
        }
        await api.delete(endpoint);
      } else {
        const payload = {
          itemUuid: listing.uuid,
          type: listing.type,
        };
        await api.post(API_ENDPOINTS.FAVORIS.ADD, payload);
      }

      setIsFavorite(!isFavorite);
      
      if (onFavoriteToggle) {
        onFavoriteToggle(listing.uuid, !isFavorite);
      }

      console.log(`✅ ${isFavorite ? "Retiré des" : "Ajouté aux"} favoris`);
      
    } catch (err: any) {
      console.error("❌ Erreur lors de la modification des favoris:", err);
      
      if (err.response?.status === 401) {
        openLoginModal();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = getDetailLink();
  };

  const formattedDate = getFormattedDate();

  if (viewMode === "list") {
    return (
      <div
        className={`card border-0 rounded-4 overflow-hidden shadow mb-2 ${featured ? "border-2 border-warning" : ""}`}
        style={{ height: isMobile ? "150px" : "200px" }}
      >
        <div className="row g-0 h-100">
          <div 
            className="col-4 position-relative h-100"
            onClick={handleImageClick}
            style={{ cursor: "pointer" }}
          >
            <div className="position-relative h-100">
              <img
                src={buildImageUrl(listing.image) || "https://storage.googleapis.com/uxpilot-auth.appspot.com/placeholder.jpg"}
                alt={listing.titre || "Annonce"}
                className="w-100 h-100 object-fit-cover transition-transform group-hover-scale"
                style={{ objectFit: "cover" }}
                onError={() => setImageError(true)}
              />
              <div
                className="position-absolute top-0 start-0 px-1 py-0.5 text-white small fw-bold rounded-2 d-flex align-items-center gap-1 m-1"
                style={{ backgroundColor: typeConfig.bgColor, fontSize: isMobile ? "9px" : "11px" }}
              >
                <i className={`fas ${typeConfig.icon}`} style={{ fontSize: isMobile ? "8px" : "10px" }}></i>
                <span>{typeConfig.label}</span>
              </div>
              <button
                className="position-absolute top-0 end-0 bg-white rounded-circle d-flex align-items-center justify-content-center shadow border-0 m-1 transition-colors"
                style={{ 
                  width: isMobile ? "28px" : "32px", 
                  height: isMobile ? "28px" : "32px",
                  opacity: loading ? 0.5 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
                onClick={handleFavoriteClick}
                disabled={loading}
                aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                {loading ? (
                  <div className="spinner-border spinner-border-sm text-success" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                ) : (
                  <i
                    className={`fa-${isFavorite ? "solid" : "regular"} fa-heart`}
                    style={{ 
                      color: isFavorite ? "#ec4899" : "#6b7280",
                      fontSize: isMobile ? "12px" : "14px",
                      transition: "color 0.2s ease"
                    }}
                  />
                )}
              </button>
            </div>
          </div>
          <div className="col-8 h-100">
            <div className="card-body h-100 d-flex flex-column p-2">
              <div className="d-flex justify-content-between align-items-start mb-0">
                <div className="flex-grow-1" style={{ maxWidth: "60%" }}>
                  <Link 
                    href={getDetailLink()} 
                    className="text-decoration-none"
                  >
                    <h6 className="card-title fw-bold text-dark mb-0" style={{ fontSize: isMobile ? "13px" : "14px" }}>
                      {listing.titre || "Sans titre"}
                    </h6>
                  </Link>
                </div>
                <div className="text-end ms-1">
                  <div className={`fw-bold`} style={{ fontSize: isMobile ? "12px" : "14px", ...getPriceStyle() }}>
                    {formatPrice(listing.prix, listing.type)}
                  </div>
                </div>
              </div>
              
              <div className="d-flex align-items-center gap-2 mb-0" style={{ fontSize: isMobile ? "10px" : "11px" }}>
                {listing.localisation && (
                  <span className="d-flex align-items-center text-muted">
                    <i className="fa-solid fa-location-dot me-1 text-warning" style={{ fontSize: isMobile ? "8px" : "10px" }}></i>
                    <span className="text-truncate" style={{ maxWidth: isMobile ? "80px" : "150px" }}>
                      {listing.localisation}
                    </span>
                  </span>
                )}
                {formattedDate && (
                  <span className="d-flex align-items-center text-muted">
                    <i className="fa-regular fa-calendar me-1" style={{ fontSize: isMobile ? "8px" : "10px" }}></i>
                    <span style={{ whiteSpace: "nowrap" }}>{formattedDate}</span>
                  </span>
                )}
              </div>

              {listing.description && (
                <p className="card-text text-muted mb-1 flex-grow-1" style={{ fontSize: isMobile ? "10px" : "11px", lineHeight: "1.2" }}>
                  {listing.description.length > (isMobile ? 60 : 100)
                    ? `${listing.description.substring(0, isMobile ? 60 : 100)}...`
                    : listing.description}
                </p>
              )}

              <div className="d-flex justify-content-between align-items-center mt-auto">
                <div className="d-flex align-items-center gap-1">
                  {listing.seller ? (
                    <>
                      {renderAvatar()}
                      <span className="small fw-medium text-dark text-truncate" style={{ fontSize: isMobile ? "10px" : "11px", maxWidth: isMobile ? "60px" : "100px" }}>
                        {listing.seller.name}
                      </span>
                    </>
                  ) : (
                    <>
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                        style={{
                          width: isMobile ? "20px" : "24px",
                          height: isMobile ? "20px" : "24px",
                          flexShrink: 0,
                          backgroundColor: getAvatarColor(),
                          fontSize: isMobile ? "8px" : "10px",
                        }}
                      >
                        AN
                      </div>
                      <span className="small fw-medium text-dark" style={{ fontSize: isMobile ? "10px" : "11px" }}>
                        Annonceur
                      </span>
                    </>
                  )}
                </div>
                <Link
                  href={getDetailLink()}
                  className={getButtonClasses()}
                  style={{ ...getButtonStyle(), fontSize: isMobile ? "10px" : "11px", padding: isMobile ? "4px 8px" : "6px 12px" }}
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

  // MODE GRID
  const cardHeight = isMobile ? "340px" : "440px";
  const imageHeight = isMobile ? "140px" : "180px";
  const contentHeight = isMobile ? "200px" : "260px";

  return (
    <div className={getCardClasses()} style={{ height: cardHeight }}>
      <div
        className="position-relative overflow-hidden"
        style={{ height: imageHeight, flexShrink: 0, cursor: "pointer" }}
        onClick={handleImageClick}
      >
        <img
          src={buildImageUrl(listing.image) || "https://storage.googleapis.com/uxpilot-auth.appspot.com/placeholder.jpg"}
          alt={listing.titre || "Annonce"}
          className="w-100 h-100 object-fit-cover transition-transform group-hover-scale"
          style={{ transition: "transform 0.3s ease" }}
          onError={() => setImageError(true)}
        />

        <div
          className="position-absolute top-0 start-0 px-1 py-0.5 text-white small fw-bold rounded-2 d-flex align-items-center gap-1 m-1"
          style={{ backgroundColor: typeConfig.bgColor, fontSize: isMobile ? "9px" : "11px" }}
        >
          <i className={`fas ${typeConfig.icon}`} style={{ fontSize: isMobile ? "8px" : "10px" }}></i>
          <span>{typeConfig.label}</span>
        </div>

        <button
          className="position-absolute top-0 end-0 bg-white rounded-circle d-flex align-items-center justify-content-center shadow border-0 m-1 transition-colors"
          style={{ 
            width: isMobile ? "28px" : "32px", 
            height: isMobile ? "28px" : "32px",
            opacity: loading ? 0.5 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          onClick={handleFavoriteClick}
          disabled={loading}
          aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          {loading ? (
            <div className="spinner-border spinner-border-sm text-success" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          ) : (
            <i
              className={`fa-${isFavorite ? "solid" : "regular"} fa-heart`}
              style={{ 
                color: isFavorite ? "#ec4899" : "#6b7280",
                fontSize: isMobile ? "12px" : "14px",
                transition: "color 0.2s ease"
              }}
            />
          )}
        </button>
      </div>

      <div className="card-body p-2 d-flex flex-column" style={{ height: contentHeight }}>
        <div style={{ height: isMobile ? "32px" : "42px", overflow: "hidden" }} className="mb-0">
          <Link href={getDetailLink()} className="text-decoration-none">
            <h6 className="card-title fw-bold text-dark mb-0" style={{ fontSize: isMobile ? "13px" : "14px", lineHeight: "1.2" }}>
              {listing.titre || "Sans titre"}
            </h6>
          </Link>
        </div>

        <div style={{ height: isMobile ? "22px" : "28px" }} className="mb-0">
          <div className="fw-bold" style={{ fontSize: isMobile ? "13px" : "14px", ...getPriceStyle() }}>
            {formatPrice(listing.prix, listing.type)}
          </div>
        </div>

        <div style={{ height: isMobile ? "30px" : "40px", overflow: "hidden" }} className="mb-1">
          {listing.description ? (
            <p className="card-text text-muted" style={{ fontSize: isMobile ? "10px" : "11px", lineHeight: "1.2" }}>
              {listing.description.length > (isMobile ? 40 : 70)
                ? `${listing.description.substring(0, isMobile ? 40 : 70)}...`
                : listing.description}
            </p>
          ) : (
            <p className="card-text text-muted" style={{ fontSize: isMobile ? "10px" : "11px" }}>Aucune description</p>
          )}
        </div>

        <div className="d-flex justify-content-between align-items-center text-muted" style={{ height: isMobile ? "18px" : "20px" }}>
          {listing.localisation ? (
            <span className="d-flex align-items-center">
              <i className="fa-solid fa-location-dot me-1 text-warning" style={{ fontSize: isMobile ? "8px" : "10px" }}></i>
              <span className="text-truncate" style={{ maxWidth: isMobile ? "80px" : "100px", fontSize: isMobile ? "9px" : "11px" }}>
                {listing.localisation}
              </span>
            </span>
          ) : (
            <span></span>
          )}
          {formattedDate && (
            <span className="d-flex align-items-center">
              <i className="fa-regular fa-calendar me-1" style={{ fontSize: isMobile ? "8px" : "10px" }}></i>
              <span style={{ fontSize: isMobile ? "9px" : "11px" }}>{formattedDate}</span>
            </span>
          )}
        </div>

        <div className="d-flex justify-content-between align-items-center pt-1 border-top mt-1" style={{ height: isMobile ? "38px" : "50px" }}>
          <div className="d-flex align-items-center" style={{ maxWidth: isMobile ? "90px" : "110px" }}>
            {listing.seller ? (
              <>
                {renderAvatar()}
                <span className="small fw-medium text-dark text-truncate ms-1" style={{ fontSize: isMobile ? "10px" : "11px" }}>
                  {listing.seller.name}
                </span>
              </>
            ) : (
              <>
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                  style={{
                    width: isMobile ? "20px" : "24px",
                    height: isMobile ? "20px" : "24px",
                    flexShrink: 0,
                    backgroundColor: getAvatarColor(),
                    fontSize: isMobile ? "8px" : "10px",
                  }}
                >
                  AN
                </div>
                <span className="small fw-medium text-dark text-truncate ms-1" style={{ fontSize: isMobile ? "10px" : "11px" }}>
                  Annonceur
                </span>
              </>
            )}
          </div>
          <Link
            href={getDetailLink()}
            className={getButtonClasses()}
            style={{ ...getButtonStyle(), fontSize: isMobile ? "10px" : "11px", padding: isMobile ? "4px 8px" : "6px 12px" }}
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