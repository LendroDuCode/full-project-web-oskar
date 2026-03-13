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
  date?: string | null | undefined;
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
  // ✅ VÉRIFICATION DE SÉCURITÉ - Si listing est undefined, ne pas rendre le composant
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

  // Détection de l'écran mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Vérifier au chargement si l'annonce est dans les favoris
  useEffect(() => {
    setIsFavorite(listing.is_favoris || false);
  }, [listing.is_favoris]);

  // ✅ FONCTION POUR OBTENIR LES INITIALES DU VENDEUR
  const getSellerInitials = (): string => {
    if (!listing.seller) return "AN"; // AN pour "Annonceur"
    
    const name = listing.seller.name || "";
    const prenoms = listing.seller.prenoms || "";
    const nom = listing.seller.nom || "";
    
    // Essayer de récupérer depuis prenoms et nom
    if (prenoms && nom) {
      return `${prenoms.charAt(0)}${nom.charAt(0)}`.toUpperCase();
    }
    
    // Sinon, utiliser le nom complet
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
    } else if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    
    return "AN";
  };

  // ✅ FONCTION POUR OBTENIR LA COULEUR DE FOND DE L'AVATAR
  const getAvatarColor = (): string => {
    // Couleurs par type d'annonce
    switch (listing.type) {
      case "don":
        return "#9333ea"; // Violet pour les dons
      case "echange":
        return "#2563eb"; // Bleu pour les échanges
      case "produit":
        return "#16a34a"; // Vert pour les produits
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
          bgColor: "#16a34a", // Vert
          btnColor: "#f97316", // Orange pour le bouton
          icon: "fa-tag",
        };
      case "don":
        return {
          label: "don",
          color: "#9333ea",
          bgColor: "#9333ea", // Violet
          btnColor: "#9333ea", // Violet
          icon: "fa-gift",
        };
      case "echange":
        return {
          label: "échange",
          color: "#2563eb",
          bgColor: "#2563eb", // Bleu
          btnColor: "#2563eb", // Bleu
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

  // ✅ FONCTION DE FORMATAGE DE PRIX
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
      if (diffDays < 7) return `Il y a ${diffDays}j`;
      if (diffDays < 30) return `Il y a ${diffDays}j`;
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
      return "card border-0 rounded-4 overflow-hidden shadow-lg position-relative group cursor-pointer transition-all d-flex flex-column";
    }
    return "card border-0 rounded-4 overflow-hidden shadow group cursor-pointer transition-all d-flex flex-column";
  };

  const getPriceStyle = () => {
    switch (listing.type) {
      case "don":
        return { color: "#9333ea" }; // Violet
      case "echange":
        return { color: "#2563eb" }; // Bleu
      default:
        return { color: colors.oskar.green }; // Vert
    }
  };

  const getButtonClasses = () => {
    return "btn text-white rounded-3 fw-semibold border-0 transition-colors";
  };

  const getButtonStyle = () => {
    switch (listing.type) {
      case "don":
        return { backgroundColor: "#9333ea" }; // Violet
      case "echange":
        return { backgroundColor: "#2563eb" }; // Bleu
      default:
        return { backgroundColor: colors.oskar.orange }; // Orange pour les produits
    }
  };

  // ✅ FONCTION POUR AFFICHER L'AVATAR (IMAGE OU INITIALES)
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

    // Afficher les initiales dans un cercle coloré selon le type
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

  // ✅ FONCTION POUR GÉRER L'AJOUT/SUPPRESSION AUX FAVORIS
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
        // Supprimer des favoris
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
        // Ajouter aux favoris
        const payload = {
          itemUuid: listing.uuid,
          type: listing.type,
        };
        await api.post(API_ENDPOINTS.FAVORIS.ADD, payload);
      }

      // Mettre à jour l'état local
      setIsFavorite(!isFavorite);
      
      // Notifier le parent si nécessaire
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

  // ✅ FONCTION POUR GÉRER LE CLIC SUR L'IMAGE
  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = getDetailLink();
  };

  if (viewMode === "list") {
    // Version liste - adaptée mobile
    return (
      <div
        className={`card border-0 rounded-4 overflow-hidden shadow mb-2 ${featured ? "border-2 border-warning" : ""}`}
        style={{ height: isMobile ? "150px" : "200px" }}
      >
        <div className="row g-0 h-100">
          {/* Image cliquable */}
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
                {(listing.date || listing.createdAt) && (
                  <span className="d-flex align-items-center text-muted">
                    <i className="fa-regular fa-clock me-1" style={{ fontSize: isMobile ? "8px" : "10px" }}></i>
                    {formatDate(listing.date || listing.createdAt)}
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

  // MODE GRID - Version mobile optimisée
  const cardHeight = isMobile ? "320px" : "420px";
  const imageHeight = isMobile ? "140px" : "180px";
  const contentHeight = isMobile ? "180px" : "240px";

  return (
    <div className={getCardClasses()} style={{ height: cardHeight }}>
      {/* Image cliquable */}
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

        {/* Badge type */}
        <div
          className="position-absolute top-0 start-0 px-1 py-0.5 text-white small fw-bold rounded-2 d-flex align-items-center gap-1 m-1"
          style={{ backgroundColor: typeConfig.bgColor, fontSize: isMobile ? "9px" : "11px" }}
        >
          <i className={`fas ${typeConfig.icon}`} style={{ fontSize: isMobile ? "8px" : "10px" }}></i>
          <span>{typeConfig.label}</span>
        </div>

        {/* Bouton favori */}
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

      {/* Contenu */}
      <div className="card-body p-2 d-flex flex-column" style={{ height: contentHeight }}>
        {/* Titre */}
        <div style={{ height: isMobile ? "32px" : "42px", overflow: "hidden" }} className="mb-0">
          <Link href={getDetailLink()} className="text-decoration-none">
            <h6 className="card-title fw-bold text-dark mb-0" style={{ fontSize: isMobile ? "13px" : "14px", lineHeight: "1.2" }}>
              {listing.titre || "Sans titre"}
            </h6>
          </Link>
        </div>

        {/* Prix */}
        <div style={{ height: isMobile ? "22px" : "28px" }} className="mb-0">
          <div className="fw-bold" style={{ fontSize: isMobile ? "13px" : "14px", ...getPriceStyle() }}>
            {formatPrice(listing.prix, listing.type)}
          </div>
        </div>

        {/* Description */}
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

        {/* Localisation et date */}
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
          {(listing.date || listing.createdAt) && (
            <span className="d-flex align-items-center">
              <i className="fa-regular fa-clock me-1" style={{ fontSize: isMobile ? "8px" : "10px" }}></i>
              <span style={{ fontSize: isMobile ? "9px" : "11px" }}>{formatDate(listing.date || listing.createdAt)}</span>
            </span>
          )}
        </div>

        {/* Footer avec avatar et bouton */}
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